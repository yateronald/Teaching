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
const access = require('./learnAccess');
const { isFreeForAll } = require('./learnMode');

const CURRENCIES = ['NGN', 'GHS', 'ZAR', 'KES', 'USD', 'XOF', 'EGP', 'RWF'];
const COMPANY_ROLES = new Set(['candidate', 'org_admin']);

const siteBase = () => String(process.env.LEARN_SITE_URL || process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
const apiBase = () => String(process.env.API_PUBLIC_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/, '');
const ACCOUNT_PAGE = { en: '/learn/account/', fr: '/fr/apprendre/compte/' };
const accountUrl = (lang, query) => `${siteBase()}${ACCOUNT_PAGE[lang === 'fr' ? 'fr' : 'en']}${query ? `?${query}` : ''}`;
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

class BillingError extends Error {
    constructor(status, code, message) { super(message); this.status = status; this.code = code; }
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
const publicOffer = (o) => ({
    code: o.code,
    name: { en: o.name_en, fr: o.name_fr },
    description: { en: o.description_en || '', fr: o.description_fr || '' },
    days: o.days,
    amount: Number(o.amount),
    currency: o.currency,
    recurring: !!o.recurring,
});
const activeOffers = (db) => db.all('SELECT * FROM learn_offers WHERE active ORDER BY sort, amount');

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

    const reference = `lfwn-${Date.now().toString(36)}-${crypto.randomBytes(12).toString('hex')}`;
    const payment = await db.get(
        `INSERT INTO learn_payments (user_id, offer_id, reference, amount, currency, days, ip)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [user.id, offer.id, reference, offer.amount, offer.currency, offer.days, String(ip || '').replace('::ffff:', '').slice(0, 45) || null]);
    let session;
    try {
        session = await paystack.initialize({
            email: user.email,
            amount: Number(offer.amount),
            currency: offer.currency,
            reference,
            callbackUrl: `${apiBase()}/api/learn/billing/callback`,
            plan: offer.recurring ? offer.paystack_plan_code : undefined,
            metadata: {
                user_id: user.id,
                payment_id: payment.id,
                offer: offer.code,
                cancel_action: accountUrl(lang, 'payment=cancelled'),
                custom_fields: [{ display_name: 'Offer', variable_name: 'offer', value: lang === 'fr' ? offer.name_fr : offer.name_en }],
            },
        });
    } catch (err) {
        await db.run("UPDATE learn_payments SET status = 'failed', status_detail = $2, updated_at = now() WHERE id = $1", [payment.id, String(err.message).slice(0, 200)]);
        console.error('[billing] checkout failed:', err.message);
        throw new BillingError(502, 'PROVIDER', 'The payment page could not be opened. Please try again in a moment.');
    }
    if (!paystack.isCheckoutUrl(session?.authorization_url)) {
        await db.run("UPDATE learn_payments SET status = 'failed', status_detail = 'unexpected checkout address', updated_at = now() WHERE id = $1", [payment.id]);
        throw new BillingError(502, 'PROVIDER', 'The payment page could not be opened. Please try again in a moment.');
    }
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
        // Premium starts now, or when the person's current paid period ends.
        const last = await db.get(
            'SELECT max(ends_at) AS end FROM learn_licenses WHERE user_id = $1 AND revoked_at IS NULL AND ends_at > now()', [payment.user_id]);
        const start = last?.end && new Date(last.end) > new Date() ? new Date(last.end) : new Date();
        const end = new Date(start.getTime() + payment.days * 864e5);
        const offer = payment.offer_id ? await db.get('SELECT name_en FROM learn_offers WHERE id = $1', [payment.offer_id]) : null;
        let license = await db.get(
            `INSERT INTO learn_licenses (user_id, source, starts_at, ends_at, reason, external_ref)
             VALUES ($1, 'paystack', $2, $3, $4, $5)
             ON CONFLICT (source, external_ref) WHERE external_ref IS NOT NULL DO NOTHING
             RETURNING id, starts_at, ends_at`,
            [payment.user_id, start.toISOString(), end.toISOString(), `Paid online: ${offer?.name_en || 'Premium'}`.slice(0, 200), reference]);
        const fresh = !!license;
        if (!license) license = await db.get("SELECT id, starts_at, ends_at FROM learn_licenses WHERE source = 'paystack' AND external_ref = $1", [reference]);
        await db.run(
            `UPDATE learn_payments SET status = 'success', status_detail = NULL, paid_at = $2, provider_transaction_id = $3,
                    customer_code = COALESCE($4, customer_code), channel = $5, license_id = $6, updated_at = now()
              WHERE id = $1`,
            [payment.id, tx.paid_at || tx.paidAt || new Date().toISOString(), Number(tx.id) || null,
                tx.customer?.customer_code || null, String(tx.channel || '').slice(0, 30) || null, license.id]);
        if (fresh) {
            await access.logAccess(db, { userId: payment.user_id, action: 'premium_paid', detail: { payment: payment.id, reference, amount: Number(payment.amount), currency: payment.currency, ends_at: license.ends_at, via } });
            await db.run("UPDATE learn_premium_requests SET status = 'done', handled_at = now() WHERE user_id = $1 AND status = 'open'", [payment.user_id]);
        }
        return { outcome: fresh ? 'success' : 'already', payment, license };
    });
}

/** Ends the Premium a payment gave (refund, dispute). */
async function reversePayment(db, reference, status, reason) {
    const p = await db.get("UPDATE learn_payments SET status = $2, status_detail = $3, updated_at = now() WHERE reference = $1 AND status IN ('success', 'review', 'initialized') RETURNING id, user_id", [reference, status, reason.slice(0, 200)]);
    if (!p) return false;
    await db.run("UPDATE learn_licenses SET revoked_at = now(), revoke_reason = $2 WHERE source = 'paystack' AND external_ref = $1 AND revoked_at IS NULL", [reference, status]);
    await access.logAccess(db, { userId: p.user_id, action: status === 'refunded' ? 'premium_refunded' : 'premium_disputed', detail: { reference, reason } });
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
                        `INSERT INTO learn_payments (user_id, offer_id, reference, amount, currency, days, renewal, customer_code)
                         VALUES ($1, $2, $3, $4, $5, $6, true, $7) ON CONFLICT (reference) DO NOTHING RETURNING id`,
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

module.exports = {
    CURRENCIES, BillingError, enabled, publicOffer, activeOffers, cleanOffer, startCheckout, fulfil, reversePayment, handleWebhook, accountUrl,
};
