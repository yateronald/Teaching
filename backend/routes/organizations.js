/**
 * Administrator: companies (organizations).
 *
 *   GET    /api/admin/organizations                      list
 *   POST   /api/admin/organizations                      create (company, content, credits, first manager)
 *   GET    /api/admin/organizations/:id                  detail
 *   PUT    /api/admin/organizations/:id                  name, language, dates, seat limit, notes
 *   POST   /api/admin/organizations/:id/status           { status: active | suspended }
 *   DELETE /api/admin/organizations/:id                  only while it has no account
 *   PUT    /api/admin/organizations/:id/content          content the company may use
 *   POST   /api/admin/organizations/:id/credits          { action: grant | revoke, type, amount, notes }
 *   GET    /api/admin/organizations/:id/credits          credit movements
 *   GET    /api/admin/organizations/:id/learners         learners with their figures
 *   GET    /api/admin/organizations/:id/managers         managers
 *   POST   /api/admin/organizations/:id/managers         add a manager
 *   PUT    /api/admin/organizations/:id/accounts/:uid/active   { active }
 *   POST   /api/admin/organizations/:id/accounts/:uid/invite   new temporary password by email
 *   POST   /api/admin/organizations/:id/logo · DELETE …/logo
 *   GET    /api/admin/organizations/:id/audit            what happened, by whom
 *
 * The administrator keeps every power: extending the dates or adding credits
 * works in any state (expired, suspended) and takes effect at once.
 */
const express = require('express');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const sessions = require('../services/sessionService');
const orgs = require('../services/organizationService');
const accounts = require('../services/organizationAccounts');
const queries = require('../services/organizationQueries');
const logos = require('../services/organizationLogo');

const router = express.Router();
router.use(authenticateToken, adminOnly);

const { OrgError, sendError } = orgs;

// Nothing here works before migration 025.
router.use(async (req, res, next) => {
    if (await orgs.ready(req.db)) return next();
    res.status(503).json({ error: 'Companies are not available yet: run backend/database/run-organizations-migration.js.', code: 'MIGRATION_PENDING' });
});

const intId = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };

async function loadOrg(req) {
    const id = intId(req.params.id);
    const org = id && await req.db.get('SELECT * FROM organizations WHERE id = $1', [id]);
    if (!org) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
    return org;
}

const parseDate = (v, label) => {
    const d = new Date(v);
    if (v == null || v === '' || Number.isNaN(d.getTime())) throw new OrgError('BAD_DATE', `${label} is not a valid date.`);
    return d;
};

/** Company fields from the request; `creating` makes the required ones compulsory. */
function readFields(body, { creating = false, current = null } = {}) {
    const out = {};
    if (creating || 'name' in body) {
        const name = String(body.name ?? '').trim().replace(/\s+/g, ' ');
        if (!name) throw new OrgError('NAME_REQUIRED', 'The company name is required.');
        if (name.length > 160) throw new OrgError('NAME_TOO_LONG', 'The company name is limited to 160 characters.');
        out.name = name;
    }
    if ('display_name' in body) {
        const dn = String(body.display_name ?? '').trim().replace(/\s+/g, ' ');
        if (dn.length > 160) throw new OrgError('NAME_TOO_LONG', 'The displayed name is limited to 160 characters.');
        out.display_name = dn || null;
    }
    if (creating || 'default_language' in body) {
        const lang = body.default_language ?? 'fr';
        if (!['fr', 'en'].includes(lang)) throw new OrgError('BAD_LANGUAGE', 'The language must be French (fr) or English (en).');
        out.default_language = lang;
    }
    if ('access_starts_at' in body || creating) {
        out.access_starts_at = body.access_starts_at ? parseDate(body.access_starts_at, 'The start date') : (creating ? new Date() : undefined);
        if (out.access_starts_at === undefined) delete out.access_starts_at;
    }
    if (creating || 'access_ends_at' in body) out.access_ends_at = parseDate(body.access_ends_at, 'The end date');
    const starts = out.access_starts_at || (current && new Date(current.access_starts_at));
    const ends = out.access_ends_at || (current && new Date(current.access_ends_at));
    if (starts && ends && ends <= starts) throw new OrgError('BAD_DATES', 'The end date must be after the start date.');
    if (creating && ends <= new Date()) throw new OrgError('BAD_DATES', 'The end date must be in the future.');
    // The package: how many learner accounts the company may create. Always set.
    if (creating || 'seat_limit' in body) {
        const n = Number(body.seat_limit);
        if (body.seat_limit === null || body.seat_limit === '' || !Number.isInteger(n) || n < 1 || n > 100000) {
            throw new OrgError('BAD_SEATS', 'Set the package: the number of learner accounts the company may create (a whole number, at least 1).');
        }
        out.seat_limit = n;
    }
    if ('notes' in body) out.notes = String(body.notes ?? '').trim().slice(0, 2000) || null;
    return out;
}

/** The content list, checked: known types, existing content, no duplicates. */
async function readContent(db, items) {
    if (!Array.isArray(items)) throw new OrgError('BAD_CONTENT', 'Choose the exam content the company may use.');
    const list = [];
    const seen = new Set();
    for (const it of items) {
        const type = it?.content_type;
        const id = intId(it?.content_id);
        if (!orgs.CONTENT_TYPES.includes(type) || !id) throw new OrgError('BAD_CONTENT', 'Unknown exam content in the list.');
        const key = `${type}:${id}`;
        if (!seen.has(key)) { seen.add(key); list.push({ content_type: type, content_id: id }); }
    }
    const found = await orgs.ancestorKeys(db, list);
    const missing = list.filter(it => !found.has(`${it.content_type}:${it.content_id}`));
    if (missing.length) throw new OrgError('CONTENT_NOT_FOUND', 'Some of the chosen exam content no longer exists.');
    return list;
}

async function replaceContent(db, orgId, list) {
    await db.run(
        `WITH gone AS (DELETE FROM organization_content WHERE organization_id = $1 RETURNING id)
         INSERT INTO organization_content (organization_id, content_type, content_id)
         SELECT $1, t, i FROM unnest($2::text[], $3::int[]) AS x(t, i)
         ON CONFLICT (organization_id, content_type, content_id) DO NOTHING`,
        [orgId, list.map(x => x.content_type), list.map(x => x.content_id)]
    );
}

const credit = (v) => {
    if (v === undefined || v === null || v === '') return 0;
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 100000) throw new OrgError('BAD_AMOUNT', 'Credits must be a whole number of 0 or more.');
    return n;
};

// ── List & create ──────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
    try {
        const list = await req.db.all(`SELECT * FROM organizations ORDER BY lower(name)`);
        const out = [];
        for (const org of list) out.push(await queries.describe(req.db, org));
        res.json(out);
    } catch (err) { sendError(res, err, 'GET /admin/organizations'); }
});

router.post('/', async (req, res) => {
    let created = null;
    try {
        const body = req.body || {};
        const fields = readFields(body, { creating: true });
        const content = await readContent(req.db, body.content || []);
        if (!content.length) throw new OrgError('BAD_CONTENT', 'Give the company at least one exam to use.');
        const ee = credit(body.ee_credits);
        const eo = credit(body.eo_credits);
        const manager = accounts.readPerson(body.manager || {});
        if (await req.db.get('SELECT 1 AS x FROM users WHERE lower(email) = $1', [manager.email])) {
            throw new OrgError('EMAIL_TAKEN', 'An account already uses the manager’s email address.', 409);
        }

        const slug = await orgs.freeSlug(req.db, fields.display_name || fields.name);
        created = await req.db.get(
            `INSERT INTO organizations (name, display_name, slug, default_language, access_starts_at, access_ends_at, seat_limit, notes, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [fields.name, fields.display_name || null, slug, fields.default_language, fields.access_starts_at, fields.access_ends_at,
                fields.seat_limit, fields.notes ?? null, req.user.id]
        );
        await replaceContent(req.db, created.id, content);
        if (ee) await orgs.grantReserve(req.db, created.id, 'ee', ee, req.user.id, 'Initial credits');
        if (eo) await orgs.grantReserve(req.db, created.id, 'eo', eo, req.user.id, 'Initial credits');
        const account = await accounts.createAccount(req.db, created, 'org_admin', manager, req.user.id);
        await orgs.audit(req.db, created.id, req.user.id, 'company_created', {
            name: created.name, access_ends_at: created.access_ends_at, seat_limit: created.seat_limit, ee_credits: ee, eo_credits: eo,
            content: content.length,
        });
        const org = await req.db.get('SELECT * FROM organizations WHERE id = $1', [created.id]);
        res.status(201).json({ organization: await queries.describe(req.db, org), manager: account });
    } catch (err) {
        // A company without its first manager is useless: undo it (it has no account yet).
        if (created) {
            await req.db.run(`DELETE FROM organizations WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM users WHERE organization_id = $1)`, [created.id])
                .catch(e => console.error('[organizations] could not undo a half-created company:', e.message));
        }
        sendError(res, err, 'POST /admin/organizations');
    }
});

// ── One company ────────────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const [company, content, managers] = await Promise.all([
            queries.describe(req.db, org), queries.contentOf(req.db, org.id), queries.managersOf(req.db, org.id),
        ]);
        res.json({ ...company, content, managers });
    } catch (err) { sendError(res, err, 'GET /admin/organizations/:id'); }
});

router.put('/:id', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const fields = readFields(req.body || {}, { current: org });
        const keys = Object.keys(fields);
        if (!keys.length) throw new OrgError('NOTHING_TO_UPDATE', 'Nothing to update.');
        const sets = keys.map((k, i) => `${k} = $${i + 2}`);
        const updated = await req.db.get(
            `UPDATE organizations SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [org.id, ...keys.map(k => fields[k])]
        );
        const changes = {};
        for (const k of keys) {
            const before = org[k] instanceof Date ? org[k].toISOString() : org[k];
            const after = updated[k] instanceof Date ? updated[k].toISOString() : updated[k];
            if (String(before) !== String(after)) changes[k] = { from: before, to: after };
        }
        if (Object.keys(changes).length) {
            await orgs.audit(req.db, org.id, req.user.id,
                changes.access_ends_at || changes.access_starts_at ? 'dates_changed' : 'company_updated', changes);
        }
        res.json(await queries.describe(req.db, updated));
    } catch (err) { sendError(res, err, 'PUT /admin/organizations/:id'); }
});

/**
 * Suspending turns every account of the company off at once: all their open
 * sessions end now, and the sign-in check refuses them until reactivation.
 * Accounts are not changed one by one, so reactivating restores exactly the
 * accounts that were active (a learner the company had turned off stays off).
 */
router.post('/:id/status', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const status = req.body?.status;
        if (!['active', 'suspended'].includes(status)) throw new OrgError('BAD_STATUS', 'The status must be active or suspended.');
        if (status === org.status) return res.json(await queries.describe(req.db, org));
        const updated = await req.db.get(
            `UPDATE organizations SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [org.id, status]);
        let signedOut = 0;
        if (status === 'suspended' && await sessions.ready(req.db)) {
            const ended = await req.db.all(
                `UPDATE user_sessions SET ended_at = CURRENT_TIMESTAMP, ended_reason = 'company_off'
                  WHERE ended_at IS NULL AND user_id IN (SELECT id FROM users WHERE organization_id = $1) RETURNING id`, [org.id]);
            signedOut = ended.length;
        }
        await orgs.audit(req.db, org.id, req.user.id, status === 'suspended' ? 'company_suspended' : 'company_reactivated', { sessions_ended: signedOut });
        res.json({ ...(await queries.describe(req.db, updated)), sessions_ended: signedOut });
    } catch (err) { sendError(res, err, 'POST /admin/organizations/:id/status'); }
});

router.delete('/:id', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const counts = await queries.countsOf(req.db, org.id);
        const people = await req.db.get('SELECT COUNT(*)::int AS n FROM users WHERE organization_id = $1', [org.id]);
        if (people.n > 0) {
            throw new OrgError('HAS_ACCOUNTS', `This company still has ${people.n} account${people.n > 1 ? 's' : ''} (${counts.learners} learners). Suspend it instead, or remove its accounts first.`, 409);
        }
        if (org.logo_file_id) await logos.removeLogo(req.db, org).catch(() => {});
        await req.db.run('DELETE FROM organizations WHERE id = $1', [org.id]);
        res.json({ deleted: true });
    } catch (err) { sendError(res, err, 'DELETE /admin/organizations/:id'); }
});

// ── Content & credits ──────────────────────────────────────────────────────

router.put('/:id/content', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const list = await readContent(req.db, req.body?.content || []);
        const before = await queries.contentOf(req.db, org.id);
        await replaceContent(req.db, org.id, list);
        await orgs.audit(req.db, org.id, req.user.id, 'content_changed', { from: before.length, to: list.length });
        res.json(await queries.contentOf(req.db, org.id));
    } catch (err) { sendError(res, err, 'PUT /admin/organizations/:id/content'); }
});

router.post('/:id/credits', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const { action, type, amount } = req.body || {};
        const notes = req.body?.notes ? String(req.body.notes).trim().slice(0, 500) : null;
        let reserve;
        if (action === 'grant') reserve = await orgs.grantReserve(req.db, org.id, type, amount, req.user.id, notes);
        else if (action === 'revoke') reserve = await orgs.revokeReserve(req.db, org.id, type, amount, req.user.id, notes);
        else throw new OrgError('BAD_ACTION', 'The action must be grant or revoke.');
        await orgs.audit(req.db, org.id, req.user.id, action === 'grant' ? 'credits_granted' : 'credits_revoked', { type, amount: Number(amount), reserve });
        res.json({ reserve, credits: await orgs.creditSummary(req.db, org.id) });
    } catch (err) { sendError(res, err, 'POST /admin/organizations/:id/credits'); }
});

router.get('/:id/credits', async (req, res) => {
    try {
        const org = await loadOrg(req);
        res.json({ credits: await orgs.creditSummary(req.db, org.id), items: await queries.creditTransactions(req.db, org.id, req.query.limit) });
    } catch (err) { sendError(res, err, 'GET /admin/organizations/:id/credits'); }
});

// ── People ─────────────────────────────────────────────────────────────────

router.get('/:id/learners', async (req, res) => {
    try {
        const org = await loadOrg(req);
        res.json(await queries.learnersOf(req.db, org.id));
    } catch (err) { sendError(res, err, 'GET /admin/organizations/:id/learners'); }
});

router.get('/:id/managers', async (req, res) => {
    try {
        const org = await loadOrg(req);
        res.json(await queries.managersOf(req.db, org.id));
    } catch (err) { sendError(res, err, 'GET /admin/organizations/:id/managers'); }
});

router.post('/:id/managers', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const account = await accounts.createAccount(req.db, org, 'org_admin', req.body || {}, req.user.id);
        res.status(201).json(account);
    } catch (err) { sendError(res, err, 'POST /admin/organizations/:id/managers'); }
});

router.put('/:id/accounts/:uid/active', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const uid = intId(req.params.uid);
        if (!uid) throw new OrgError('NOT_FOUND', 'Account not found in this company.', 404);
        res.json(await accounts.setActive(req.db, org, uid, req.body?.active === true, req.user.id));
    } catch (err) { sendError(res, err, 'PUT /admin/organizations/:id/accounts/:uid/active'); }
});

router.post('/:id/accounts/:uid/invite', async (req, res) => {
    try {
        const org = await loadOrg(req);
        const uid = intId(req.params.uid);
        if (!uid) throw new OrgError('NOT_FOUND', 'Account not found in this company.', 404);
        res.json(await accounts.resendInvite(req.db, org, uid, req.user.id));
    } catch (err) { sendError(res, err, 'POST /admin/organizations/:id/accounts/:uid/invite'); }
});

// ── Logo & audit ───────────────────────────────────────────────────────────

router.post('/:id/logo', logos.receive, async (req, res) => {
    try {
        const org = await loadOrg(req);
        await logos.saveLogo(req.db, org, req.file);
        await orgs.audit(req.db, org.id, req.user.id, 'logo_changed');
        const updated = await req.db.get('SELECT * FROM organizations WHERE id = $1', [org.id]);
        res.json(orgs.brandOf(updated));
    } catch (err) {
        logos.cleanup(req.file);
        sendError(res, err, 'POST /admin/organizations/:id/logo');
    }
});

router.delete('/:id/logo', async (req, res) => {
    try {
        const org = await loadOrg(req);
        await logos.removeLogo(req.db, org);
        await orgs.audit(req.db, org.id, req.user.id, 'logo_removed');
        res.json({ removed: true });
    } catch (err) { sendError(res, err, 'DELETE /admin/organizations/:id/logo'); }
});

router.get('/:id/audit', async (req, res) => {
    try {
        const org = await loadOrg(req);
        res.json(await queries.auditOf(req.db, org.id, req.query.limit));
    } catch (err) { sendError(res, err, 'GET /admin/organizations/:id/audit'); }
});

module.exports = router;
