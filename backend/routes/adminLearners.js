/**
 * The administrator's page for the website's courses: who signed up, who may
 * use the website, and who has Premium.
 *
 *  - Website learners (public sign-up) and portal accounts (students, company
 *    learners and managers), searchable, with their access.
 *  - Premium: granted or ended by hand, with an end date (or none) and a
 *    reason, until online payment exists. Every change is in the history.
 *  - Website access of portal accounts (off / free), per person or per company.
 *  - Premium requests sent from the website.
 *
 * Administrators only. To anyone else these addresses do not exist: the answer
 * is the same "not found" as an unknown address.
 */
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const access = require('../services/learnAccess');
const { endWebsiteSessions } = require('../services/siteSession');
const learnEvents = require('../services/learnEvents');

const router = express.Router();

const notFound = (res) => res.status(404).json({ error: 'Route not found' });
router.use((req, res, next) => {
    // No token at all: the same answer as an unknown address.
    if (!req.headers.authorization) return notFound(res);
    // A company account is refused by the sign-in check itself ("not part of
    // your space"): it gets the same "not found" as everyone else.
    const json = res.json.bind(res);
    res.json = (body) => {
        if (res.statusCode === 403 && body?.code === 'ROLE_NOT_ALLOWED') return json.call(res.status(404), { error: 'Route not found' });
        return json(body);
    };
    return authenticateToken(req, res, (err) => { res.json = json; next(err); });
});
router.use((req, res, next) => (req.user?.role === 'admin' ? next() : notFound(res)));
router.use(async (req, res, next) => {
    if (await access.ready(req.db)) return next();
    return res.status(503).json({ error: 'Run the website accounts migration first (backend/database/run-learner-accounts-migration.js).', code: 'NOT_READY' });
});

const WEBSITE_ROLES = ['learner', 'student', 'candidate', 'org_admin'];
const PORTAL_ROLES = ['student', 'candidate', 'org_admin'];
const ACTIVE = 'revoked_at IS NULL AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())';

const intParam = (v) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : null);
const cleanReason = (v) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, 300) || null;

/** An end date: null (no end), or a date in the future, at most ten years away. */
function endDate(v) {
    if (v === null || v === undefined || v === '') return { ok: true, value: null };
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return { ok: false };
    if (d.getTime() <= Date.now() || d.getTime() > Date.now() + 10 * 366 * 864e5) return { ok: false };
    return { ok: true, value: d.toISOString() };
}

// ── The list ──
router.get('/', async (req, res) => {
    try {
        const filter = ['learners', 'portal', 'premium', 'requests'].includes(req.query.filter) ? req.query.filter : 'all';
        const page = Math.max(1, intParam(req.query.page) || 1);
        const limit = Math.min(100, intParam(req.query.limit) || 25);
        const q = String(req.query.q || '').trim().slice(0, 100);
        const where = ['u.role = ANY($1::text[])'];
        const params = [WEBSITE_ROLES];
        if (filter === 'learners') where.push("u.role = 'learner'");
        if (filter === 'portal') where.push("u.role <> 'learner'");
        if (filter === 'premium') where.push('l.id IS NOT NULL');
        if (filter === 'requests') where.push('r.id IS NOT NULL');
        if (q) {
            params.push(`%${q.toLowerCase().replace(/[%_\\]/g, '\\$&')}%`);
            const i = params.length;
            where.push(`(lower(u.email) LIKE $${i} OR lower(u.first_name || ' ' || u.last_name) LIKE $${i} OR lower(COALESCE(o.name, '')) LIKE $${i} OR lower(COALESCE(u.whatsapp, '')) LIKE $${i})`);
        }
        const from = `
            FROM users u
            LEFT JOIN organizations o ON o.id = u.organization_id
            LEFT JOIN LATERAL (
                SELECT id, ends_at, source, user_id FROM learn_licenses
                 WHERE ${ACTIVE} AND (user_id = u.id OR (u.organization_id IS NOT NULL AND organization_id = u.organization_id))
                 ORDER BY (user_id IS NOT NULL) DESC, ends_at DESC NULLS FIRST LIMIT 1) l ON true
            LEFT JOIN learn_premium_requests r ON r.user_id = u.id AND r.status = 'open'
            WHERE ${where.join(' AND ')}`;
        const total = await req.db.get(`SELECT COUNT(*)::int AS n ${from}`, params);
        params.push(limit, (page - 1) * limit);
        const rows = await req.db.all(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.is_active, u.created_at, u.signup_source,
                    u.email_verified_at IS NOT NULL AS email_verified, u.learn_access, u.country, u.whatsapp, u.french_level,
                    u.google_sub IS NOT NULL AS google_linked,
                    o.id AS organization_id, o.name AS organization, o.learn_access AS organization_access,
                    l.id IS NOT NULL AS premium, l.ends_at AS premium_until, l.source AS premium_source,
                    (l.user_id IS NULL AND l.id IS NOT NULL) AS premium_via_company,
                    r.id AS request_id, r.created_at AS requested_at, r.message AS request_message,
                    (SELECT max(s.last_seen_at) FROM user_sessions s WHERE s.user_id = u.id AND s.door = 'website') AS last_seen_at
             ${from}
             ORDER BY r.created_at DESC NULLS LAST, u.created_at DESC
             LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
        const stats = await req.db.get(
            `SELECT (SELECT COUNT(*) FROM users WHERE role = 'learner')::int AS learners,
                    (SELECT COUNT(*) FROM users WHERE role = 'learner' AND created_at > now() - INTERVAL '7 days')::int AS new_week,
                    (SELECT COUNT(DISTINCT user_id) FROM learn_licenses WHERE user_id IS NOT NULL AND ${ACTIVE})::int AS premium_people,
                    (SELECT COUNT(*) FROM learn_premium_requests WHERE status = 'open')::int AS open_requests`);
        res.json({ rows, total: total.n, page, limit, stats });
    } catch (err) {
        console.error('[admin-learners] list failed:', err.message);
        res.status(500).json({ error: 'Could not load the list.' });
    }
});

// ── Companies and their website access ──
router.get('/organizations', async (req, res) => {
    try {
        const rows = await req.db.all(
            `SELECT o.id, o.name, o.status, o.learn_access,
                    (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id)::int AS accounts,
                    l.id IS NOT NULL AS premium, l.ends_at AS premium_until
               FROM organizations o
               LEFT JOIN LATERAL (SELECT id, ends_at FROM learn_licenses WHERE organization_id = o.id AND ${ACTIVE}
                                   ORDER BY ends_at DESC NULLS FIRST LIMIT 1) l ON true
              ORDER BY lower(o.name)`);
        res.json({ rows });
    } catch (err) {
        console.error('[admin-learners] companies failed:', err.message);
        res.status(500).json({ error: 'Could not load the companies.' });
    }
});

router.put('/organizations/:id/website', async (req, res) => {
    const id = intParam(req.params.id);
    const value = req.body?.learn_access;
    if (!id || !['off', 'free'].includes(value)) return res.status(400).json({ error: 'Choose off or free.' });
    const org = await req.db.get('UPDATE organizations SET learn_access = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id, value]);
    if (!org) return notFound(res);
    await access.logAccess(req.db, { organizationId: id, actorId: req.user.id, action: 'website_access', detail: { value } });
    learnEvents.notifyOrg(id, 'org_website');
    res.json({ ok: true });
});

router.post('/organizations/:id/premium', async (req, res) => {
    const id = intParam(req.params.id);
    const end = endDate(req.body?.ends_at);
    if (!id || !end.ok) return res.status(400).json({ error: 'Choose an end date in the future, or no end date.' });
    if (!(await req.db.get('SELECT 1 AS x FROM organizations WHERE id = $1', [id]))) return notFound(res);
    const row = await access.grantPremium(req.db, { organizationId: id, endsAt: end.value, reason: cleanReason(req.body?.reason), actorId: req.user.id });
    learnEvents.notifyOrg(id, 'org_premium_granted');
    res.json({ ok: true, license: row });
});

router.post('/organizations/:id/premium/revoke', async (req, res) => {
    const id = intParam(req.params.id);
    if (!id) return notFound(res);
    const n = await access.revokePremium(req.db, { organizationId: id, source: null, reason: cleanReason(req.body?.reason), actorId: req.user.id });
    learnEvents.notifyOrg(id, 'org_premium_revoked');
    res.json({ ok: true, ended: n });
});

// ── The courses' mode: free for everyone, or the Premium levels ──
const learnMode = require('../services/learnMode');

router.get('/mode', async (req, res) => {
    res.json(await learnMode.modeInfo(req.db));
});

router.put('/mode', async (req, res) => {
    const mode = req.body?.mode;
    if (!learnMode.MODES.includes(mode)) return res.status(400).json({ error: 'Choose free or premium.' });
    const before = await learnMode.getMode(req.db);
    await learnMode.setMode(req.db, mode, req.user.id);
    if (before !== mode) await access.logAccess(req.db, { actorId: req.user.id, action: 'courses_mode', detail: { from: before, to: mode } });
    res.json(await learnMode.modeInfo(req.db));
});

// ── Online payment (Paystack): prices and payments ──
const billing = require('../services/billing');
const paystack = require('../services/paystack');

async function billingReady(req, res) {
    const t = await req.db.get("SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learn_offers'");
    if (t) return true;
    res.status(503).json({ error: 'Run backend/database/run-payments-migration.js first.', code: 'NOT_READY' });
    return false;
}

router.get('/billing', async (req, res) => {
    try {
        if (!(await billingReady(req, res))) return;
        const api = String(process.env.API_PUBLIC_URL || '').replace(/\/+$/, '').replace(/\/api$/, '');
        const [offers, stats] = await Promise.all([
            req.db.all('SELECT * FROM learn_offers ORDER BY sort, amount'),
            req.db.get(`SELECT (SELECT COUNT(*) FROM learn_payments WHERE status = 'success')::int AS paid,
                               (SELECT COUNT(*) FROM learn_payments WHERE status = 'review')::int AS review,
                               (SELECT COUNT(*) FROM learn_subscriptions WHERE status IN ('active', 'attention'))::int AS subscriptions,
                               (SELECT COUNT(*) FROM learn_payment_events WHERE outcome IN ('error', 'unmatched') AND received_at > now() - INTERVAL '30 days')::int AS problems`),
        ]);
        res.json({
            mode: paystack.config().mode,
            callback_url: api ? `${api}/api/learn/billing/callback` : null,
            webhook_url: api ? `${api}/api/learn/billing/webhook/paystack` : null,
            currencies: billing.CURRENCIES,
            offers: offers.map(o => ({ ...o, amount: Number(o.amount) })),
            stats,
        });
    } catch (err) {
        console.error('[admin-learners] billing failed:', err.message);
        res.status(500).json({ error: 'Could not load payments.' });
    }
});

router.post('/billing/offers', async (req, res) => {
    try {
        if (!(await billingReady(req, res))) return;
        const o = billing.cleanOffer(req.body || {});
        const row = await req.db.get(
            `INSERT INTO learn_offers (code, name_en, name_fr, description_en, description_fr, days, amount, currency, recurring, paystack_plan_code, active, sort)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
            [o.code, o.name_en, o.name_fr, o.description_en, o.description_fr, o.days, o.amount, o.currency, o.recurring, o.paystack_plan_code, o.active, o.sort]);
        await access.logAccess(req.db, { actorId: req.user.id, action: 'offer_created', detail: { offer: row.id, ...o } });
        res.json({ ok: true, id: row.id });
    } catch (err) {
        if (err instanceof billing.BillingError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err.code === '23505') return res.status(409).json({ error: 'An offer already uses this code.' });
        console.error('[admin-learners] offer create failed:', err.message);
        res.status(500).json({ error: 'Could not save the offer.' });
    }
});

router.put('/billing/offers/:id', async (req, res) => {
    try {
        if (!(await billingReady(req, res))) return;
        const id = intParam(req.params.id);
        const current = id && await req.db.get('SELECT * FROM learn_offers WHERE id = $1', [id]);
        if (!current) return notFound(res);
        const o = billing.cleanOffer({ ...current, amount: Number(current.amount), ...req.body });
        await req.db.run(
            `UPDATE learn_offers SET code = $2, name_en = $3, name_fr = $4, description_en = $5, description_fr = $6, days = $7, amount = $8,
                    currency = $9, recurring = $10, paystack_plan_code = $11, active = $12, sort = $13, updated_at = now() WHERE id = $1`,
            [id, o.code, o.name_en, o.name_fr, o.description_en, o.description_fr, o.days, o.amount, o.currency, o.recurring, o.paystack_plan_code, o.active, o.sort]);
        await access.logAccess(req.db, { actorId: req.user.id, action: 'offer_updated', detail: { offer: id, ...o } });
        res.json({ ok: true });
    } catch (err) {
        if (err instanceof billing.BillingError) return res.status(err.status).json({ error: err.message, code: err.code });
        if (err.code === '23505') return res.status(409).json({ error: 'An offer already uses this code.' });
        console.error('[admin-learners] offer update failed:', err.message);
        res.status(500).json({ error: 'Could not save the offer.' });
    }
});

const PAYMENT_STATUSES = ['success', 'failed', 'abandoned', 'review', 'refunded', 'disputed', 'initialized'];

router.get('/billing/payments', async (req, res) => {
    try {
        if (!(await billingReady(req, res))) return;
        const page = Math.max(1, intParam(req.query.page) || 1);
        const params = [];
        // Checkouts never finished are hidden after two hours.
        const where = ["(p.status <> 'initialized' OR p.created_at > now() - INTERVAL '2 hours')"];
        if (PAYMENT_STATUSES.includes(req.query.status)) { params.push(req.query.status); where.push(`p.status = $${params.length}`); }
        const q = String(req.query.q || '').trim().toLowerCase().slice(0, 100).replace(/[%_\\]/g, '');
        if (q) { params.push(`%${q}%`); where.push(`(lower(u.email) LIKE $${params.length} OR lower(p.reference) LIKE $${params.length})`); }
        params.push(50, (page - 1) * 50);
        const rows = await req.db.all(
            `SELECT p.id, p.reference, p.amount, p.currency, p.days, p.status, p.status_detail, p.created_at, p.paid_at, p.channel, p.renewal,
                    u.id AS user_id, u.first_name, u.last_name, u.email, o.name_en AS offer, l.ends_at AS premium_until
               FROM learn_payments p JOIN users u ON u.id = p.user_id
               LEFT JOIN learn_offers o ON o.id = p.offer_id LEFT JOIN learn_licenses l ON l.id = p.license_id
              WHERE ${where.join(' AND ')}
              ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
        res.json({ rows: rows.map(r => ({ ...r, amount: Number(r.amount) })), page });
    } catch (err) {
        console.error('[admin-learners] payments failed:', err.message);
        res.status(500).json({ error: 'Could not load the payments.' });
    }
});

// Ask Paystack again about a payment (still pending, or waiting for review)
router.post('/billing/payments/:id/recheck', async (req, res) => {
    try {
        if (!(await billingReady(req, res))) return;
        const id = intParam(req.params.id);
        const p = id && await req.db.get('SELECT reference FROM learn_payments WHERE id = $1', [id]);
        if (!p) return notFound(res);
        const r = await billing.fulfil(req.db, p.reference, { via: 'admin' });
        res.json({ ok: true, outcome: r.outcome });
    } catch (err) {
        console.error('[admin-learners] recheck failed:', err.message);
        res.status(502).json({ error: 'Paystack could not confirm this payment right now.' });
    }
});

// ── Premium requests ──
router.post('/requests/:id/dismiss', async (req, res) => {
    const id = intParam(req.params.id);
    const row = id && await req.db.get(
        "UPDATE learn_premium_requests SET status = 'dismissed', handled_at = now(), handled_by = $2 WHERE id = $1 AND status = 'open' RETURNING user_id",
        [id, req.user.id]);
    if (!row) return notFound(res);
    await access.logAccess(req.db, { userId: row.user_id, actorId: req.user.id, action: 'premium_request_dismissed' });
    res.json({ ok: true });
});

// ── One person ──
async function websiteAccount(db, id) {
    return db.get('SELECT * FROM users WHERE id = $1 AND role = ANY($2::text[])', [id, WEBSITE_ROLES]);
}

router.get('/:id', async (req, res) => {
    try {
        const id = intParam(req.params.id);
        const u = id && await websiteAccount(req.db, id);
        if (!u) return notFound(res);
        const [licenses, history, requests, devices, contentCount] = await Promise.all([
            req.db.all(
                `SELECT l.id, l.source, l.starts_at, l.ends_at, l.reason, l.created_at, l.revoked_at, l.revoke_reason,
                        l.organization_id IS NOT NULL AS via_company, ${ACTIVE.replace(/(revoked_at|starts_at|ends_at)/g, 'l.$1')} AS active,
                        c.first_name || ' ' || c.last_name AS created_by_name
                   FROM learn_licenses l LEFT JOIN users c ON c.id = l.created_by
                  WHERE l.user_id = $1 OR ($2::int IS NOT NULL AND l.organization_id = $2::int)
                  ORDER BY l.created_at DESC LIMIT 50`, [u.id, u.organization_id]),
            req.db.all(
                `SELECT h.action, h.detail, h.created_at, a.first_name || ' ' || a.last_name AS actor_name
                   FROM learn_access_log h LEFT JOIN users a ON a.id = h.actor_id
                  WHERE h.user_id = $1 ORDER BY h.created_at DESC LIMIT 50`, [u.id]),
            req.db.all('SELECT id, message, status, created_at, handled_at FROM learn_premium_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [u.id]),
            req.db.get("SELECT COUNT(*)::int AS n FROM user_sessions WHERE user_id = $1 AND door = 'website' AND ended_at IS NULL AND expires_at > LOCALTIMESTAMP", [u.id]),
            req.db.get("SELECT COUNT(*)::int AS n FROM learn_content_log WHERE user_id = $1 AND created_at > now() - INTERVAL '30 days'", [u.id]),
        ]);
        const org = u.organization_id ? await req.db.get('SELECT id, name, learn_access FROM organizations WHERE id = $1', [u.organization_id]) : null;
        const a = await access.accessFor(req.db, u);
        res.json({
            user: {
                id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role, is_active: u.is_active,
                created_at: u.created_at, signup_source: u.signup_source, email_verified: !!u.email_verified_at || u.signup_source == null,
                google_linked: !!u.google_sub, country: u.country, whatsapp: u.whatsapp || null, french_level: u.french_level || null,
                lang: u.preferred_lang, marketing_opt_in: u.marketing_opt_in,
                learn_access: u.learn_access, organization: org,
            },
            access: access.publicAccess(a),
            licenses, history, requests,
            devices: devices.n,
            lessons_opened_30d: contentCount.n,
        });
    } catch (err) {
        console.error('[admin-learners] detail failed:', err.message);
        res.status(500).json({ error: 'Could not load this account.' });
    }
});

router.post('/:id/premium', async (req, res) => {
    const id = intParam(req.params.id);
    const u = id && await websiteAccount(req.db, id);
    if (!u) return notFound(res);
    const end = endDate(req.body?.ends_at);
    if (!end.ok) return res.status(400).json({ error: 'Choose an end date in the future, or no end date.' });
    const row = await access.grantPremium(req.db, { userId: u.id, endsAt: end.value, reason: cleanReason(req.body?.reason), actorId: req.user.id });
    learnEvents.notifyUser(u.id, 'premium_granted');
    res.json({ ok: true, license: row });
});

router.post('/:id/premium/revoke', async (req, res) => {
    const id = intParam(req.params.id);
    const u = id && await websiteAccount(req.db, id);
    if (!u) return notFound(res);
    const n = await access.revokePremium(req.db, { userId: u.id, source: null, reason: cleanReason(req.body?.reason), actorId: req.user.id });
    learnEvents.notifyUser(u.id, 'premium_revoked');
    res.json({ ok: true, ended: n });
});

// Website access of a student, company learner or manager
router.put('/:id/website', async (req, res) => {
    const id = intParam(req.params.id);
    const value = req.body?.learn_access;
    const u = id && await websiteAccount(req.db, id);
    if (!u) return notFound(res);
    if (!PORTAL_ROLES.includes(u.role)) return res.status(400).json({ error: 'Website learners always have the website.' });
    if (!['off', 'free'].includes(value)) return res.status(400).json({ error: 'Choose off or free.' });
    await req.db.run('UPDATE users SET learn_access = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [u.id, value]);
    await access.logAccess(req.db, { userId: u.id, actorId: req.user.id, action: 'website_access', detail: { value } });
    // Turned off: their open website sessions end now (the next request would refuse them anyway).
    let ended = 0;
    const a = await access.accessFor(req.db, { ...u, learn_access: value });
    if (!a.website) ended = await endWebsiteSessions(req.db, u.id, 'admin');
    learnEvents.notifyUser(u.id, 'website_access');
    res.json({ ok: true, ended });
});

// Suspend or restore a website learner (portal accounts keep their usual screens)
router.put('/:id/active', async (req, res) => {
    const id = intParam(req.params.id);
    const u = id && await websiteAccount(req.db, id);
    if (!u || u.role !== 'learner') return notFound(res);
    const active = req.body?.is_active === true;
    await req.db.run('UPDATE users SET is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [u.id, active]);
    await access.logAccess(req.db, { userId: u.id, actorId: req.user.id, action: active ? 'restored' : 'suspended' });
    if (!active) await endWebsiteSessions(req.db, u.id, 'admin');
    learnEvents.notifyUser(u.id, active ? 'restored' : 'suspended');
    res.json({ ok: true });
});

module.exports = router;
