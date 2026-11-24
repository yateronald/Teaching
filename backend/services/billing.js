/**
 * Paying for Premium online (Paystack).
 *
 * How a payment becomes Premium, and why it is safe:
 *  1. checkout: the server creates the payment (our random reference, the
 *     price of the chosen offer from the database: the website only names the
 *     offer) and asks Paystack for a checkout page.
 *  2. The person pays on Paystack's own page (no card ever reaches us).
 *  3. Paystack calls back twice: the browser returns to /callback, and the
 *     signed webhook arrives. Neither is believed as such: both only trigger
 *     fulfil(), which asks Paystack's API (with our secret key) what really
 *     happened, and checks the status, the reference, the exact amount, the
 *     currency and the account.
 *  4. Premium is a license whose external_ref is the payment reference; the
 *     database refuses a second one, so a payment reported ten times grants
 *     Premium once.
 *  5. A refund or a dispute ends the Premium that payment gave.
 */
const crypto = require('crypto');
const paystack = require('./paystack');
const fxRate = require('./fxRate');
const invoicePdf = require('./invoicePdf');
const access = require('./learnAccess');
const { isFreeForAll } = require('./learnMode');
const { maskEmail } = require('./emailIdentity');
const { paymentInvoice } = require('../emails/templates/learnInvoice');
const { sendEmail } = require('../emails/brevoService');

const CURRENCIES = ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'XOF', 'EGP', 'RWF'];
const COMPANY_ROLES = new Set(['candidate', 'org_admin']);
const PLAN_TIERS = ['standard', 'premium'];
const BILLING_PERIODS = ['monthly', 'quarterly', 'yearly'];
const PERIOD_DAYS = { monthly: 30, quarterly: 90, yearly: 365 };
const CANONICAL_PLAN_CODES = [
    'standard-monthly', 'standard-quarterly', 'standard-yearly',
    'premium-monthly', 'premium-quarterly', 'premium-yearly',
];
const PLAN_SETTINGS_KEYS = ['plan_currency', 'plan_quarterly_discount', 'plan_yearly_discount', 'plan_premium_ai_credits'];
const DEFAULT_PLAN_CONFIG = {
    currency: 'USD',
    discounts: { quarterly: 10, yearly: 20 },
    premium_ai_credits: 30,
    standard: { active: true, monthly: 999, quarterly: 2697, yearly: 9590 },
    premium: { active: true, monthly: 1499, quarterly: 4047, yearly: 14390 },
};
const CANONICAL_COPY = {
    standard: {
        en: {
            name: { monthly: 'Standard — Monthly', quarterly: 'Standard — Quarterly', yearly: 'Standard — Yearly' },
            desc: 'Full access to all 464+ guided French courses (A1–C2), practice & listening labs, studio dictations and certificates.',
        },
        fr: {
            name: { monthly: 'Standard — Mensuel', quarterly: 'Standard — Trimestriel', yearly: 'Standard — Annuel' },
            desc: 'Accès complet aux 464+ cours de français (A1–C2), ateliers d’écoute, dictées studio et certificats.',
        },
        sortBase: 10,
    },
    premium: {
        en: {
            name: { monthly: 'Premium — Monthly', quarterly: 'Premium — Quarterly', yearly: 'Premium — Yearly' },
            desc: 'All Standard courses plus TCF / TEF Exam Simulator, CO & CE past exam subjects, and AI credits for EE & EO.',
        },
        fr: {
            name: { monthly: 'Premium — Mensuel', quarterly: 'Premium — Trimestriel', yearly: 'Premium — Annuel' },
            desc: 'Tous les cours Standard plus Simulateur d’examen TCF / TEF, sujets CO / CE et crédits IA pour EE / EO.',
        },
        sortBase: 40,
    },
};

const siteBase = () => String(process.env.LEARN_SITE_URL || process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
const apiBase = () => String(process.env.API_PUBLIC_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/, '');
const ACCOUNT_PAGE = { en: '/learn/account/', fr: '/fr/apprendre/compte/' };
const SUBSCRIPTION_PAGE = { en: '/learn/subscription/', fr: '/fr/apprendre/abonnement/' };
const accountUrl = (lang, query) => `${siteBase()}${ACCOUNT_PAGE[lang === 'fr' ? 'fr' : 'en']}${query ? `?${query}` : ''}`;
const subscriptionUrl = (lang, query) => `${siteBase()}${SUBSCRIPTION_PAGE[lang === 'fr' ? 'fr' : 'en']}${query ? `?${query}` : ''}`;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

class BillingError extends Error {
    constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

let planSchemaReady = false;
/** Ensures migration 034 columns & constraints exist when migration 031 tables are present (idempotent, memoized once applied). */
async function ensurePlanSchema(db) {
    if (planSchemaReady) return true;
    try {
        const hasOffers = await db.get("SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_offers'");
        if (!hasOffers) return false;
        const col = await db.get("SELECT 1 AS ok FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'learn_offers' AND column_name = 'plan_tier'");
        if (!col) {
            await db.run(`
                ALTER TABLE learn_licenses DROP CONSTRAINT IF EXISTS learn_licenses_tier_check;
                ALTER TABLE learn_licenses ADD CONSTRAINT learn_licenses_tier_check CHECK (tier IN ('standard', 'premium'));
                ALTER TABLE learn_offers
                    ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(20) NOT NULL DEFAULT 'premium',
                    ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20),
                    ADD COLUMN IF NOT EXISTS discount_pct SMALLINT NOT NULL DEFAULT 0;
                ALTER TABLE learn_offers DROP CONSTRAINT IF EXISTS learn_offers_plan_tier_check;
                ALTER TABLE learn_offers ADD CONSTRAINT learn_offers_plan_tier_check CHECK (plan_tier IN ('standard', 'premium'));
                ALTER TABLE learn_offers DROP CONSTRAINT IF EXISTS learn_offers_billing_period_check;
                ALTER TABLE learn_offers ADD CONSTRAINT learn_offers_billing_period_check CHECK (billing_period IS NULL OR billing_period IN ('monthly', 'quarterly', 'yearly'));
                ALTER TABLE learn_offers DROP CONSTRAINT IF EXISTS learn_offers_discount_pct_check;
                ALTER TABLE learn_offers ADD CONSTRAINT learn_offers_discount_pct_check CHECK (discount_pct BETWEEN 0 AND 95);
                CREATE TABLE IF NOT EXISTS learn_settings (
                    key VARCHAR(40) PRIMARY KEY,
                    value VARCHAR(200) NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
                );
            `);
        }
        planSchemaReady = true;
        return true;
    } catch (err) {
        console.warn('[billing] ensurePlanSchema skipped:', err.message);
        return false;
    }
}

/** Payments are possible: Paystack configured, migration 031 applied, and the courses not free for everyone. */
async function enabled(db) {
    if (!paystack.config().enabled) return false;
    if (await isFreeForAll(db)) return false;
    const t = await db.get("SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_offers'").catch(() => null);
    return !!t;
}

// One payment at a time per person: two payments arriving together still
// queue their Premium periods one after the other. (The API runs as one process.)
const locks = new Map();
async function withUserLock(userId, fn) {
    const prev = locks.get(userId) || Promise.resolve();
    let release;
    const mine = new Promise(r => { release = r; });
    const chain = prev.then(() => mine);
    locks.set(userId, chain);
    await prev;
    try { return await fn(); } finally {
        release();
        if (locks.get(userId) === chain) locks.delete(userId);
    }
}

// ── Offers ──
const publicOffer = (o, chargePreview = null) => ({
    code: o.code,
    name: { en: o.name_en, fr: o.name_fr },
    description: { en: o.description_en || '', fr: o.description_fr || '' },
    plan_tier: o.plan_tier === 'standard' ? 'standard' : 'premium',
    billing_period: BILLING_PERIODS.includes(o.billing_period) ? o.billing_period : null,
    discount_pct: Number(o.discount_pct || 0),
    days: o.days,
    amount: Number(o.amount),
    currency: o.currency,
    recurring: !!o.recurring,
    ...(chargePreview?.converted ? {
        charge: {
            amount: chargePreview.chargeAmount,
            currency: chargePreview.chargeCurrency,
            fx_rate: chargePreview.fxRate,
        },
    } : {}),
});
const activeOffers = async (db) => {
    await ensurePlanSchema(db);
    return db.all('SELECT * FROM learn_offers WHERE active ORDER BY sort, amount');
};

async function enrichOffersWithCharge(offers) {
    if (!offers.length) return [];
    const merchantCurrencies = await paystack.supportedCurrencies().catch(() => []);
    return Promise.all(offers.map(async (o) => {
        const conv = await fxRate.convertOfferForCharge(o, merchantCurrencies).catch(() => null);
        return publicOffer(o, conv);
    }));
}

/** Reads the structured 3-tier x 3-period plan catalog from learn_settings + learn_offers (with sensible defaults). */
async function getPlanCatalog(db, { includeInactive = false, withCharge = false } = {}) {
    const schemaOk = await ensurePlanSchema(db);
    const settingsMap = {};
    try {
        const sRows = await db.all('SELECT key, value FROM learn_settings WHERE key = ANY($1::text[])', [PLAN_SETTINGS_KEYS]);
        for (const r of sRows) settingsMap[r.key] = r.value;
    } catch { /* learn_settings not created yet */ }

    const rawCurrency = String(settingsMap.plan_currency || DEFAULT_PLAN_CONFIG.currency).toUpperCase();
    const defaultCurrency = CURRENCIES.includes(rawCurrency) ? rawCurrency : DEFAULT_PLAN_CONFIG.currency;
    const parseClamp = (v, fallback, min, max) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
    };
    const discounts = {
        quarterly: parseClamp(settingsMap.plan_quarterly_discount, DEFAULT_PLAN_CONFIG.discounts.quarterly, 0, 80),
        yearly: parseClamp(settingsMap.plan_yearly_discount, DEFAULT_PLAN_CONFIG.discounts.yearly, 0, 80),
    };
    const premium_ai_credits = parseClamp(settingsMap.plan_premium_ai_credits, DEFAULT_PLAN_CONFIG.premium_ai_credits, 0, 9999);

    let rows = [];
    if (schemaOk) {
        rows = await db.all('SELECT * FROM learn_offers WHERE code = ANY($1::text[]) ORDER BY sort, id', [CANONICAL_PLAN_CODES]).catch(() => []);
    }
    const byCode = new Map(rows.map(r => [r.code, r]));
    const configured = rows.length > 0;
    const merchantCurrencies = withCharge ? await paystack.supportedCurrencies().catch(() => []) : [];

    const buildTier = async (tier) => {
        const tierRows = BILLING_PERIODS.map(p => byCode.get(`${tier}-${p}`)).filter(Boolean);
        const tierActive = tierRows.length > 0 ? tierRows.some(r => r.active) : true;
        const periods = {};
        for (const period of BILLING_PERIODS) {
            const code = `${tier}-${period}`;
            const row = byCode.get(code);
            const fallbackAmount = DEFAULT_PLAN_CONFIG[tier][period];
            const discountFallback = period === 'monthly' ? 0 : discounts[period];
            const offerObj = {
                amount: row ? Number(row.amount) : fallbackAmount,
                currency: row ? String(row.currency).toUpperCase() : defaultCurrency,
                days: row ? Number(row.days) : PERIOD_DAYS[period],
                recurring: row ? !!row.recurring : false,
            };
            let charge = null;
            if (withCharge && (row ? row.active : tierActive)) {
                const conv = await fxRate.convertOfferForCharge(offerObj, merchantCurrencies).catch(() => null);
                if (conv?.converted) {
                    charge = { amount: conv.chargeAmount, currency: conv.chargeCurrency, fx_rate: conv.fxRate };
                }
            }
            periods[period] = {
                code,
                amount: offerObj.amount,
                currency: offerObj.currency,
                days: offerObj.days,
                discount_pct: row ? Number(row.discount_pct ?? discountFallback) : discountFallback,
                recurring: offerObj.recurring,
                active: row ? !!row.active : tierActive,
                configured: !!row,
                ...(charge ? { charge } : {}),
                ...(includeInactive ? { paystack_plan_code: row?.paystack_plan_code || null } : {}),
            };
        }
        return { active: tierActive, periods };
    };

    const [standard, premium] = await Promise.all([buildTier('standard'), buildTier('premium')]);
    return {
        configured,
        currency: standard.periods.monthly.currency || defaultCurrency,
        discounts,
        premium_ai_credits,
        tiers: {
            free: { active: true },
            standard,
            premium,
        },
    };
}

/** Validates and saves the 3-tier x 3-period plan catalog into learn_settings & learn_offers. */
async function savePlanCatalog(db, body, actorId) {
    const schemaOk = await ensurePlanSchema(db);
    if (!schemaOk) throw new BillingError(503, 'NOT_READY', 'Run backend/database/run-payments-migration.js first.');

    const currency = String(body?.currency || DEFAULT_PLAN_CONFIG.currency).trim().toUpperCase();
    if (!CURRENCIES.includes(currency)) {
        throw new BillingError(400, 'BAD_CURRENCY', `Currency: one of ${CURRENCIES.join(', ')}.`);
    }

    const qDisc = Number(body?.discounts?.quarterly ?? DEFAULT_PLAN_CONFIG.discounts.quarterly);
    const yDisc = Number(body?.discounts?.yearly ?? DEFAULT_PLAN_CONFIG.discounts.yearly);
    if (!Number.isInteger(qDisc) || qDisc < 0 || qDisc > 80) {
        throw new BillingError(400, 'BAD_DISCOUNT', 'Quarterly discount must be a whole number from 0% to 80%.');
    }
    if (!Number.isInteger(yDisc) || yDisc < 0 || yDisc > 80) {
        throw new BillingError(400, 'BAD_DISCOUNT', 'Yearly discount must be a whole number from 0% to 80%.');
    }

    const aiCredits = Number(body?.premium_ai_credits ?? DEFAULT_PLAN_CONFIG.premium_ai_credits);
    if (!Number.isInteger(aiCredits) || aiCredits < 0 || aiCredits > 9999) {
        throw new BillingError(400, 'BAD_CREDITS', 'Monthly Premium AI credits must be an integer between 0 and 9999.');
    }

    const discounts = { quarterly: qDisc, yearly: yDisc };
    const validatedOffers = [];
    for (const tier of PLAN_TIERS) {
        const tierIn = body?.tiers?.[tier] || body?.[tier] || {};
        const tierActive = tierIn.active === true;
        const periodsIn = tierIn.periods || tierIn;
        BILLING_PERIODS.forEach((period, pIdx) => {
            const pIn = periodsIn?.[period] || {};
            const amount = Number(pIn.amount);
            if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1e12) {
                throw new BillingError(400, 'BAD_AMOUNT', `${tier} (${period}) price must be a positive whole subunit amount.`);
            }
            const days = Number(pIn.days ?? PERIOD_DAYS[period]);
            if (!Number.isInteger(days) || days < 1 || days > 3660) {
                throw new BillingError(400, 'BAD_DAYS', `${tier} (${period}) duration must be between 1 and 3660 days.`);
            }
            const discount_pct = period === 'monthly'
                ? 0
                : Number.isInteger(Number(pIn.discount_pct)) && Number(pIn.discount_pct) >= 0 && Number(pIn.discount_pct) <= 95
                    ? Number(pIn.discount_pct)
                    : discounts[period];
            const recurring = pIn.recurring === true;
            const rawPlan = String(pIn.paystack_plan_code || '').trim();
            if (rawPlan && !/^PLN_[A-Za-z0-9]+$/.test(rawPlan)) {
                throw new BillingError(400, 'BAD_PLAN', `${tier} (${period}) Paystack plan code must look like PLN_...`);
            }
            if (recurring && !rawPlan) {
                throw new BillingError(400, 'PLAN_REQUIRED', `${tier} (${period}) needs a Paystack plan code (PLN_...) when recurring is enabled.`);
            }
            const copy = CANONICAL_COPY[tier];
            validatedOffers.push({
                code: `${tier}-${period}`,
                name_en: copy.en.name[period],
                name_fr: copy.fr.name[period],
                description_en: copy.en.desc,
                description_fr: copy.fr.desc,
                plan_tier: tier,
                billing_period: period,
                discount_pct,
                days,
                amount,
                currency,
                recurring,
                paystack_plan_code: rawPlan || null,
                active: tierActive,
                sort: copy.sortBase + (pIdx + 1) * 10,
            });
        });
    }

    const settingsPairs = [
        ['plan_currency', currency],
        ['plan_quarterly_discount', String(qDisc)],
        ['plan_yearly_discount', String(yDisc)],
        ['plan_premium_ai_credits', String(aiCredits)],
    ];
    for (const [k, v] of settingsPairs) {
        await db.run(
            `INSERT INTO learn_settings (key, value, updated_by) VALUES ($1, $2, $3)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now(), updated_by = EXCLUDED.updated_by`,
            [k, v, actorId]);
    }

    for (const o of validatedOffers) {
        await db.run(
            `INSERT INTO learn_offers (code, name_en, name_fr, description_en, description_fr, days, amount, currency, recurring, paystack_plan_code, active, sort, plan_tier, billing_period, discount_pct)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (code) DO UPDATE SET
                 name_en = EXCLUDED.name_en,
                 name_fr = EXCLUDED.name_fr,
                 description_en = EXCLUDED.description_en,
                 description_fr = EXCLUDED.description_fr,
                 days = EXCLUDED.days,
                 amount = EXCLUDED.amount,
                 currency = EXCLUDED.currency,
                 recurring = EXCLUDED.recurring,
                 paystack_plan_code = EXCLUDED.paystack_plan_code,
                 active = EXCLUDED.active,
                 sort = EXCLUDED.sort,
                 plan_tier = EXCLUDED.plan_tier,
                 billing_period = EXCLUDED.billing_period,
                 discount_pct = EXCLUDED.discount_pct,
                 updated_at = now()`,
            [o.code, o.name_en, o.name_fr, o.description_en, o.description_fr, o.days, o.amount, o.currency, o.recurring, o.paystack_plan_code, o.active, o.sort, o.plan_tier, o.billing_period, o.discount_pct]);
    }

    await access.logAccess(db, {
        actorId,
        action: 'plans_updated',
        detail: {
            currency,
            discounts,
            premium_ai_credits: aiCredits,
            standard_active: validatedOffers.find(x => x.code === 'standard-monthly')?.active ?? false,
            premium_active: validatedOffers.find(x => x.code === 'premium-monthly')?.active ?? false,
        },
    });
    require('./learnEvents').broadcastMode(await require('./learnMode').getMode(db, { fresh: true }));
    return getPlanCatalog(db, { includeInactive: true, withCharge: true });
}

/** Checks an offer sent by the administrator. Returns the clean values or throws. */
function cleanOffer(b, { partial = false } = {}) {
    const out = {};
    const text = (v, max) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max);
    if (!partial || b.code !== undefined) {
        const code = String(b.code || '').trim().toLowerCase();
        if (!/^[a-z0-9][a-z0-9-]{1,38}$/.test(code)) throw new BillingError(400, 'BAD_CODE', 'Code: 2 to 39 lower-case letters, digits or dashes.');
        out.code = code;
    }
    for (const k of ['name_en', 'name_fr']) {
        if (!partial || b[k] !== undefined) {
            out[k] = text(b[k], 80);
            if (!out[k]) throw new BillingError(400, 'BAD_NAME', 'Give the offer a name in English and in French.');
        }
    }
    for (const k of ['description_en', 'description_fr']) if (!partial || b[k] !== undefined) out[k] = text(b[k], 300) || null;
    if (!partial || b.plan_tier !== undefined) {
        const pt = String(b.plan_tier || 'premium').toLowerCase();
        if (!PLAN_TIERS.includes(pt)) throw new BillingError(400, 'BAD_TIER', 'Plan tier must be standard or premium.');
        out.plan_tier = pt;
    }
    if (!partial || b.billing_period !== undefined) {
        const bp = b.billing_period === null || b.billing_period === '' ? null : String(b.billing_period).toLowerCase();
        if (bp !== null && !BILLING_PERIODS.includes(bp)) throw new BillingError(400, 'BAD_PERIOD', 'Billing period must be monthly, quarterly, or yearly.');
        out.billing_period = bp;
    }
    if (!partial || b.discount_pct !== undefined) {
        const dp = Number(b.discount_pct ?? 0);
        if (!Number.isInteger(dp) || dp < 0 || dp > 95) throw new BillingError(400, 'BAD_DISCOUNT', 'Discount % must be an integer between 0 and 95.');
        out.discount_pct = dp;
    }
    if (!partial || b.days !== undefined) {
        const d = Number(b.days);
        if (!Number.isInteger(d) || d < 1 || d > 3660) throw new BillingError(400, 'BAD_DAYS', 'Premium period: 1 to 3660 days.');
        out.days = d;
    }
    if (!partial || b.amount !== undefined) {
        const a = Number(b.amount);
        if (!Number.isSafeInteger(a) || a < 1 || a > 1e12) throw new BillingError(400, 'BAD_AMOUNT', 'Price: a whole number of the currency’s smallest unit (e.g. 500000 = 5,000.00).');
        out.amount = a;
    }
    if (!partial || b.currency !== undefined) {
        const c = String(b.currency || '').toUpperCase();
        if (!CURRENCIES.includes(c)) throw new BillingError(400, 'BAD_CURRENCY', `Currency: one of ${CURRENCIES.join(', ')} (as enabled on your Paystack account).`);
        out.currency = c;
    }
    if (!partial || b.recurring !== undefined) out.recurring = b.recurring === true;
    if (!partial || b.paystack_plan_code !== undefined) {
        const p = String(b.paystack_plan_code || '').trim();
        if (p && !/^PLN_[A-Za-z0-9]+$/.test(p)) throw new BillingError(400, 'BAD_PLAN', 'Plan code: as shown in Paystack (PLN_…).');
        out.paystack_plan_code = p || null;
    }
    if (!partial || b.active !== undefined) out.active = b.active === true;
    if (!partial || b.sort !== undefined) out.sort = Math.max(0, Math.min(999, Number(b.sort) || 0));
    if (out.recurring && out.paystack_plan_code === null) throw new BillingError(400, 'PLAN_REQUIRED', 'A recurring offer needs its Paystack plan code (PLN_…).');
    return out;
}

// ── Checkout ──
async function startCheckout(db, { user, offerCode, ip, lang }) {
    if (!(await enabled(db))) throw new BillingError(503, 'PAYMENTS_OFF', 'Online payment is not available yet.');
    if (access.STAFF.has(user.role)) throw new BillingError(400, 'STAFF', 'Team accounts already have everything.');
    if (COMPANY_ROLES.has(user.role)) throw new BillingError(403, 'COMPANY_ACCOUNT', 'Your Premium is managed by your company.');
    if (user.signup_source && !user.email_verified_at) throw new BillingError(403, 'EMAIL_UNVERIFIED', 'Confirm your email first.');
    const offer = await db.get('SELECT * FROM learn_offers WHERE code = $1 AND active', [String(offerCode || '')]);
    if (!offer) throw new BillingError(404, 'NO_OFFER', 'This offer is not available.');
    if (offer.recurring) {
        const sub = await db.get("SELECT 1 AS x FROM learn_subscriptions WHERE user_id = $1 AND plan_code = $2 AND status IN ('active', 'attention')", [user.id, offer.paystack_plan_code]);
        if (sub) throw new BillingError(409, 'ALREADY_SUBSCRIBED', 'You already have this subscription.');
    }
    const recent = await db.get("SELECT COUNT(*)::int AS n FROM learn_payments WHERE user_id = $1 AND created_at > now() - INTERVAL '1 hour'", [user.id]);
    if (recent.n >= 10) throw new BillingError(429, 'TOO_MANY', 'Too many payment attempts. Please try again later.');

    const merchantCurrencies = await paystack.supportedCurrencies().catch(() => []);
    const charge = await fxRate.convertOfferForCharge(offer, merchantCurrencies);
    if (!charge.supported) {
        const msg = offer.recurring && merchantCurrencies.length
            ? `Recurring plans must use a currency enabled on Paystack (${merchantCurrencies.join(', ')}).`
            : `Online checkout in ${offer.currency} is not enabled on the payment account yet. Please contact support or choose another plan.`;
        throw new BillingError(400, 'CURRENCY_UNSUPPORTED', msg);
    }

    const reference = `lfwn-${Date.now().toString(36)}-${crypto.randomBytes(12).toString('hex')}`;
    let session;
    try {
        session = await paystack.initialize({
            email: user.email,
            amount: charge.chargeAmount,
            currency: charge.chargeCurrency,
            reference,
            callbackUrl: `${apiBase()}/api/learn/billing/callback`,
            plan: offer.recurring ? offer.paystack_plan_code : undefined,
            metadata: {
                user_id: user.id,
                offer: offer.code,
                display_amount: charge.displayAmount,
                display_currency: charge.displayCurrency,
                fx_rate: charge.fxRate,
                cancel_action: subscriptionUrl(lang, 'payment=cancelled'),
                custom_fields: [
                    { display_name: 'Offer', variable_name: 'offer', value: lang === 'fr' ? offer.name_fr : offer.name_en },
                    { display_name: 'Invoice Amount', variable_name: 'invoice_amount', value: invoicePdf.formatMoney(charge.displayAmount, charge.displayCurrency, lang) },
                ],
            },
        });
    } catch (err) {
        console.error('[billing] checkout init failed:', err.message);
        if (/currency/i.test(String(err.message || ''))) {
            throw new BillingError(400, 'CURRENCY_UNSUPPORTED', `Online checkout in ${charge.chargeCurrency} is not enabled on the payment account yet. Please contact support or choose another plan.`);
        }
        throw new BillingError(502, 'PROVIDER', 'The payment page could not be opened. Please try again in a moment.');
    }
    if (!paystack.isCheckoutUrl(session?.authorization_url)) {
        console.error('[billing] checkout init failed: unexpected checkout URL');
        throw new BillingError(502, 'PROVIDER', 'The payment page could not be opened. Please try again in a moment.');
    }
    await db.run(
        `INSERT INTO learn_payments (user_id, offer_id, reference, amount, currency, display_amount, display_currency, fx_rate, days, ip)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
            user.id,
            offer.id,
            reference,
            charge.chargeAmount,
            charge.chargeCurrency,
            charge.displayAmount,
            charge.displayCurrency,
            charge.fxRate,
            offer.days,
            String(ip || '').replace('::ffff:', '').slice(0, 45) || null,
        ]);
    return { url: session.authorization_url, reference };
}

const metaOf = (tx) => {
    let m = tx?.metadata;
    if (typeof m === 'string') { try { m = JSON.parse(m); } catch { m = null; } }
    return m && typeof m === 'object' ? m : {};
};

/**
 * Confirms a payment with Paystack's API and grants its Premium (once).
 * Outcome: success | already | pending | failed | abandoned | review | refunded | disputed | unknown.
 */
async function fulfil(db, reference, { via = 'verify' } = {}) {
    const payment = await db.get('SELECT * FROM learn_payments WHERE reference = $1', [reference]);
    if (!payment) return { outcome: 'unknown' };
    if (payment.status === 'success') return { outcome: 'already', payment };
    if (['refunded', 'disputed'].includes(payment.status)) return { outcome: payment.status, payment };

    const tx = await paystack.verify(reference); // throws when Paystack cannot answer: try again later
    const status = String(tx?.status || '');
    if (status !== 'success') {
        if (['failed', 'abandoned', 'reversed'].includes(status) && payment.status === 'initialized') {
            await db.run("UPDATE learn_payments SET status = $2, status_detail = $3, updated_at = now() WHERE id = $1 AND status = 'initialized'",
                [payment.id, status === 'reversed' ? 'failed' : status, String(tx?.gateway_response || status).slice(0, 200)]);
        }
        return { outcome: ['failed', 'abandoned', 'reversed'].includes(status) ? (status === 'reversed' ? 'failed' : status) : 'pending', payment };
    }

    // Paystack says paid: it must be this payment, in full, for this account.
    const meta = metaOf(tx);
    const problems = [];
    if (tx.reference !== reference) problems.push('reference');
    if (Number(tx.amount) !== Number(payment.amount)) problems.push(`amount ${tx.amount} instead of ${payment.amount}`);
    if (String(tx.currency || '').toUpperCase() !== payment.currency) problems.push(`currency ${tx.currency}`);
    if (!payment.renewal && meta.user_id !== undefined && Number(meta.user_id) !== Number(payment.user_id)) problems.push('account');
    if (payment.renewal && payment.customer_code && tx.customer?.customer_code && tx.customer.customer_code !== payment.customer_code) problems.push('customer');
    if (problems.length) {
        await db.run("UPDATE learn_payments SET status = 'review', status_detail = $2, provider_transaction_id = COALESCE(provider_transaction_id, $3), updated_at = now() WHERE id = $1 AND status <> 'success'",
            [payment.id, `Paid but not matching: ${problems.join(', ')}`.slice(0, 200), Number(tx.id) || null]);
        console.error(`[billing] payment ${payment.id} needs review: ${problems.join(', ')}`);
        return { outcome: 'review', payment };
    }

    return withUserLock(payment.user_id, async () => {
        await ensurePlanSchema(db);
        const offer = payment.offer_id ? await db.get('SELECT name_en, plan_tier FROM learn_offers WHERE id = $1', [payment.offer_id]) : null;
        const grantTier = offer?.plan_tier === 'standard' ? 'standard' : 'premium';
        // Stack only within the same plan tier so upgrading from Standard to Premium takes effect immediately.
        const last = await db.get(
            'SELECT max(ends_at) AS end FROM learn_licenses WHERE user_id = $1 AND tier = $2 AND revoked_at IS NULL AND ends_at > now()',
            [payment.user_id, grantTier]);
        const start = last?.end && new Date(last.end) > new Date() ? new Date(last.end) : new Date();
        const end = new Date(start.getTime() + payment.days * 864e5);
        let license = await db.get(
            `INSERT INTO learn_licenses (user_id, tier, source, starts_at, ends_at, reason, external_ref)
             VALUES ($1, $2, 'paystack', $3, $4, $5, $6)
             ON CONFLICT (source, external_ref) WHERE external_ref IS NOT NULL DO NOTHING
             RETURNING id, tier, starts_at, ends_at`,
            [payment.user_id, grantTier, start.toISOString(), end.toISOString(), `Paid online: ${offer?.name_en || (grantTier === 'standard' ? 'Standard' : 'Premium')}`.slice(0, 200), reference]);
        const fresh = !!license;
        if (!license) license = await db.get("SELECT id, tier, starts_at, ends_at FROM learn_licenses WHERE source = 'paystack' AND external_ref = $1", [reference]);
        const paidAt = tx.paid_at || tx.paidAt || new Date().toISOString();
        const invoiceNumber = payment.invoice_number || invoicePdf.formatInvoiceNumber(payment.id, paidAt);
        await db.run(
            `UPDATE learn_payments SET status = 'success', status_detail = NULL, paid_at = $2, provider_transaction_id = $3,
                    customer_code = COALESCE($4, customer_code), channel = $5, license_id = $6,
                    invoice_number = COALESCE(invoice_number, $7), updated_at = now()
              WHERE id = $1`,
            [payment.id, paidAt, Number(tx.id) || null,
                tx.customer?.customer_code || null, String(tx.channel || '').slice(0, 30) || null, license.id, invoiceNumber]);
        if (fresh) {
            await access.logAccess(db, { userId: payment.user_id, action: 'premium_paid', detail: { payment: payment.id, reference, tier: grantTier, amount: Number(payment.amount), currency: payment.currency, display_amount: Number(payment.display_amount ?? payment.amount), display_currency: payment.display_currency || payment.currency, invoice_number: invoiceNumber, ends_at: license.ends_at, via } });
            await db.run("UPDATE learn_premium_requests SET status = 'done', handled_at = now() WHERE user_id = $1 AND status = 'open'", [payment.user_id]);
            require('./learnEvents').notifyUser(payment.user_id, 'premium_paid');
        }
        if (fresh || !payment.invoice_emailed_at) {
            sendInvoiceEmail(db, payment.id).catch(err => console.error('[billing] invoice email failed:', err.message));
        }
        return { outcome: fresh ? 'success' : 'already', payment: { ...payment, invoice_number: invoiceNumber }, license };
    });
}

/** Ends the Premium a payment gave (refund, dispute). */
async function reversePayment(db, reference, status, reason) {
    const p = await db.get("UPDATE learn_payments SET status = $2, status_detail = $3, updated_at = now() WHERE reference = $1 AND status IN ('success', 'review', 'initialized') RETURNING id, user_id", [reference, status, reason.slice(0, 200)]);
    if (!p) return false;
    await db.run("UPDATE learn_licenses SET revoked_at = now(), revoke_reason = $2 WHERE source = 'paystack' AND external_ref = $1 AND revoked_at IS NULL", [reference, status]);
    await access.logAccess(db, { userId: p.user_id, action: status === 'refunded' ? 'premium_refunded' : 'premium_disputed', detail: { reference, reason } });
    require('./learnEvents').notifyUser(p.user_id, status);
    return true;
}

// ── Webhook ──
const planCodeOf = (plan) => (plan && typeof plan === 'object' ? plan.plan_code : typeof plan === 'string' ? plan : null) || null;

/** The website account behind a Paystack customer (subscription, earlier payment, then email). */
async function userForCustomer(db, customer) {
    const code = customer?.customer_code;
    if (code) {
        const s = await db.get('SELECT user_id FROM learn_subscriptions WHERE customer_code = $1 ORDER BY updated_at DESC LIMIT 1', [code]);
        if (s) return s.user_id;
        const p = await db.get('SELECT user_id FROM learn_payments WHERE customer_code = $1 ORDER BY created_at DESC LIMIT 1', [code]);
        if (p) return p.user_id;
    }
    if (customer?.email) {
        const u = await db.get("SELECT id FROM users WHERE email_key = lfwn_email_key($1) AND role IN ('learner', 'student') LIMIT 1", [customer.email]);
        if (u) return u.id;
    }
    return null;
}

/**
 * A signed notification from Paystack (signature already checked). Returns
 * the outcome; throws on a temporary problem so Paystack sends it again.
 */
async function handleWebhook(db, raw, body) {
    const event = String(body?.event || '').slice(0, 60);
    const data = body?.data || {};
    const reference = String(data.reference || data.transaction_reference || data.transaction?.reference || '').slice(0, 100) || null;
    const hash = sha256(raw);
    const row = await db.get(
        `INSERT INTO learn_payment_events (body_hash, event, reference) VALUES ($1, $2, $3)
         ON CONFLICT (body_hash) DO UPDATE SET received_at = learn_payment_events.received_at
         RETURNING id, processed_at`, [hash, event || 'unknown', reference]);
    if (row.processed_at) return 'duplicate';

    let outcome = 'ignored';
    try {
        switch (event) {
            case 'charge.success': {
                if (!reference) break;
                let payment = await db.get('SELECT id FROM learn_payments WHERE reference = $1', [reference]);
                const plan = planCodeOf(data.plan);
                if (!payment && plan) {
                    // A subscription renewal: Paystack made this charge, we record it, then check it like any other.
                    const offer = await db.get('SELECT * FROM learn_offers WHERE paystack_plan_code = $1 ORDER BY active DESC, id LIMIT 1', [plan]);
                    const userId = await userForCustomer(db, data.customer);
                    if (!offer || !userId) { outcome = 'unmatched'; break; }
                    payment = await db.get(
                        `INSERT INTO learn_payments (user_id, offer_id, reference, amount, currency, display_amount, display_currency, days, renewal, customer_code)
                         VALUES ($1, $2, $3, $4, $5, $4, $5, $6, true, $7) ON CONFLICT (reference) DO NOTHING RETURNING id`,
                        [userId, offer.id, reference, offer.amount, offer.currency, offer.days, data.customer?.customer_code || null]);
                }
                if (!payment && !(await db.get('SELECT id FROM learn_payments WHERE reference = $1', [reference]))) { outcome = 'unknown'; break; }
                outcome = (await fulfil(db, reference, { via: 'webhook' })).outcome;
                break;
            }
            case 'subscription.create': {
                const userId = await userForCustomer(db, data.customer);
                const plan = planCodeOf(data.plan);
                if (!userId || !data.subscription_code) { outcome = 'unmatched'; break; }
                const offer = plan ? await db.get('SELECT id FROM learn_offers WHERE paystack_plan_code = $1 ORDER BY active DESC, id LIMIT 1', [plan]) : null;
                await db.run(
                    `INSERT INTO learn_subscriptions (user_id, offer_id, subscription_code, email_token, plan_code, customer_code, status, next_payment_date)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (subscription_code) DO UPDATE SET status = EXCLUDED.status, next_payment_date = EXCLUDED.next_payment_date,
                         email_token = COALESCE(EXCLUDED.email_token, learn_subscriptions.email_token), updated_at = now()`,
                    [userId, offer?.id || null, String(data.subscription_code).slice(0, 60), data.email_token ? String(data.email_token).slice(0, 100) : null,
                        plan, data.customer?.customer_code || null, String(data.status || 'active').slice(0, 20), data.next_payment_date || null]);
                outcome = 'subscription';
                break;
            }
            case 'subscription.not_renew':
            case 'subscription.disable':
            case 'subscription.expiring_cards':
            case 'invoice.payment_failed':
            case 'invoice.update': {
                const code = data.subscription_code || data.subscription?.subscription_code;
                if (!code) break;
                const status = event === 'subscription.not_renew' ? 'non-renewing'
                    : event === 'subscription.disable' ? (data.status === 'complete' ? 'completed' : 'cancelled')
                    : event === 'invoice.payment_failed' ? 'attention'
                    : null;
                await db.run(
                    `UPDATE learn_subscriptions SET status = COALESCE($2, status),
                            next_payment_date = COALESCE($3, next_payment_date), updated_at = now() WHERE subscription_code = $1`,
                    [String(code).slice(0, 60), status, data.next_payment_date || data.subscription?.next_payment_date || null]);
                outcome = 'subscription';
                break;
            }
            case 'refund.processed': {
                if (!reference) break;
                const p = await db.get('SELECT amount FROM learn_payments WHERE reference = $1', [reference]);
                if (!p) { outcome = 'unknown'; break; }
                const refunded = Number(data.amount);
                // A partial refund keeps Premium (the team decides); a full one ends it.
                if (!refunded || refunded >= Number(p.amount)) outcome = (await reversePayment(db, reference, 'refunded', 'Refunded on Paystack')) ? 'refunded' : 'already';
                else outcome = 'partial_refund';
                break;
            }
            case 'charge.dispute.create': {
                if (!reference) break;
                outcome = (await reversePayment(db, reference, 'disputed', `Dispute opened on Paystack (${String(data.category || '').slice(0, 40)})`)) ? 'disputed' : 'already';
                break;
            }
            default:
                break;
        }
        await db.run('UPDATE learn_payment_events SET processed_at = now(), outcome = $2, error = NULL WHERE id = $1', [row.id, outcome]);
        return outcome;
    } catch (err) {
        await db.run('UPDATE learn_payment_events SET outcome = $2, error = $3 WHERE id = $1', [row.id, 'error', String(err.message).slice(0, 300)]).catch(() => {});
        throw err;
    }
}

// ── Invoices (PDF generation & Brevo delivery) ──
async function buildInvoicePdfForPayment(db, paymentId) {
    const row = await db.get(
        `SELECT p.*,
                u.first_name, u.last_name, u.email, u.country, u.whatsapp, u.preferred_lang,
                o.name_en, o.name_fr, o.description_en, o.description_fr,
                l.starts_at, l.ends_at
           FROM learn_payments p
           JOIN users u ON u.id = p.user_id
           LEFT JOIN learn_offers o ON o.id = p.offer_id
           LEFT JOIN learn_licenses l ON l.id = p.license_id
          WHERE p.id = $1 AND p.status = 'success'`,
        [paymentId]);
    if (!row) return null;

    let invoiceNumber = row.invoice_number || invoicePdf.formatInvoiceNumber(row.id, row.paid_at || row.created_at);
    if (!row.invoice_number) {
        const assigned = await db.get(
            `UPDATE learn_payments SET invoice_number = $2
              WHERE id = $1 AND invoice_number IS NULL
             RETURNING invoice_number`,
            [row.id, invoiceNumber]);
        if (!assigned) {
            const current = await db.get('SELECT invoice_number FROM learn_payments WHERE id = $1', [row.id]);
            if (current?.invoice_number) invoiceNumber = current.invoice_number;
        }
    }

    const lang = row.preferred_lang === 'fr' ? 'fr' : 'en';
    const customerName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.email;
    const displayAmount = Number(row.display_amount ?? row.amount);
    const displayCurrency = row.display_currency || row.currency;
    const buffer = await invoicePdf.generateInvoicePdf({
        invoiceNumber,
        reference: row.reference,
        providerTransactionId: row.provider_transaction_id,
        paidAt: row.paid_at || row.created_at,
        lang,
        customer: {
            name: customerName,
            email: row.email,
            country: row.country,
            whatsapp: row.whatsapp,
        },
        offer: {
            name: (lang === 'fr' ? row.name_fr : row.name_en) || row.name_en || 'Learn French with Natives Premium',
            description: (lang === 'fr' ? row.description_fr : row.description_en) || null,
            days: row.days,
        },
        displayAmount,
        displayCurrency,
        chargeAmount: Number(row.amount),
        chargeCurrency: row.currency,
        fxRate: row.fx_rate ? Number(row.fx_rate) : null,
        channel: row.channel,
        startsAt: row.starts_at || row.paid_at || row.created_at,
        endsAt: row.ends_at,
    });

    return {
        buffer,
        invoiceNumber,
        filename: `Invoice-${invoiceNumber}.pdf`,
        row,
        lang,
    };
}

async function sendInvoiceEmail(db, paymentId) {
    const claimed = await db.get(
        `UPDATE learn_payments SET invoice_emailed_at = now()
          WHERE id = $1 AND status = 'success' AND invoice_emailed_at IS NULL
         RETURNING id`,
        [paymentId]);
    if (!claimed) return { skipped: true };

    try {
        const built = await buildInvoicePdfForPayment(db, paymentId);
        if (!built) {
            await db.run('UPDATE learn_payments SET invoice_emailed_at = NULL WHERE id = $1', [paymentId]).catch(() => {});
            return { skipped: true };
        }

        const { buffer, invoiceNumber, filename, row, lang } = built;
        const base = siteBase() || 'https://www.learnfrenchwithnatives.com';
        const coursesUrl = `${base}${lang === 'fr' ? '/fr/apprendre/' : '/learn/'}`;
        const subscriptionUrlVal = `${base}${SUBSCRIPTION_PAGE[lang]}`;
        const displayCurrency = row.display_currency || row.currency;
        const displayAmount = Number(row.display_amount ?? row.amount);
        const formattedDisplay = invoicePdf.formatMoney(displayAmount, displayCurrency, lang);
        const amountLabel = displayCurrency === 'USD' && !formattedDisplay.includes('USD')
            ? `${formattedDisplay} USD`
            : formattedDisplay;
        const chargedLabel = displayCurrency !== row.currency
            ? invoicePdf.formatMoney(row.amount, row.currency, lang)
            : null;
        const paidDate = invoicePdf.formatDate(row.paid_at || row.created_at, lang);
        const validUntil = row.ends_at ? invoicePdf.formatDate(row.ends_at, lang) : null;
        const offerName = (lang === 'fr' ? row.name_fr : row.name_en) || row.name_en || 'Premium';
        const mail = paymentInvoice({
            lang,
            name: row.first_name || row.email.split('@')[0],
            invoiceNumber,
            offerName,
            amountLabel,
            chargedLabel,
            paidDate,
            validUntil,
            reference: row.reference,
            coursesUrl,
            subscriptionUrl: subscriptionUrlVal,
        });

        if (String(process.env.LEARN_EMAIL_DRY_RUN || '').toLowerCase() === 'true') {
            console.log(`[learn-invoice-email] dry-run to ${maskEmail(row.email)}: ${mail.subject} (${filename}, ${buffer.length} bytes)`);
            return { ok: true, dryRun: true, invoiceNumber, filename, ...mail };
        }

        const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com';
        const fromName = process.env.EMAIL_FROM_NAME || 'Learn French with Natives';
        await sendEmail({
            from: from.includes('<') ? from : `${fromName} <${from}>`,
            to: row.email,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            attachments: [{ filename, content: buffer }],
        });
        return { ok: true, invoiceNumber, filename };
    } catch (err) {
        await db.run('UPDATE learn_payments SET invoice_emailed_at = NULL WHERE id = $1', [paymentId]).catch(() => {});
        console.error(`[billing] invoice email failed for payment ${paymentId}:`, err.message);
        throw err;
    }
}

module.exports = {
    CURRENCIES, PLAN_TIERS, BILLING_PERIODS, PERIOD_DAYS, CANONICAL_PLAN_CODES, DEFAULT_PLAN_CONFIG,
    BillingError, ensurePlanSchema, enabled, publicOffer, activeOffers, enrichOffersWithCharge,
    getPlanCatalog, savePlanCatalog, cleanOffer, startCheckout, fulfil, reversePayment, handleWebhook,
    accountUrl, subscriptionUrl, buildInvoicePdfForPayment, sendInvoiceEmail,
};
