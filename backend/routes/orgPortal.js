/**
 * The company space (role org_admin): its learners, groups, assignments,
 * credits, dashboards and branding.
 *
 * The company is ALWAYS the signed-in manager's own (req.user.organization_id,
 * read from the database at every request) — never an id sent by the client.
 * Every learner, group or assignment named in a request is checked to belong to
 * that company in the same SQL statement that uses it.
 *
 * While the company is not open (expired, not started) everything stays
 * readable and every change is refused; a suspended company cannot even sign in.
 */
const express = require('express');
const crypto = require('crypto');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const orgs = require('../services/organizationService');
const accounts = require('../services/organizationAccounts');
const queries = require('../services/organizationQueries');
const logos = require('../services/organizationLogo');
const { buildContentTree, filterTree } = require('../services/contentTree');
const { contentNameResolver } = require('../services/contentNames');
const { buildOverview, history } = require('./examSpace');
const { createNotification } = require('../services/notificationService');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('org_admin'));

const { OrgError, sendError } = orgs;
const MAX_IMPORT_ROWS = 500;

/** The manager's company, loaded fresh for every request. */
router.use(async (req, res, next) => {
    try {
        if (!(await orgs.ready(req.db))) return res.status(503).json({ error: 'The company space is not available yet.', code: 'MIGRATION_PENDING' });
        const org = await req.db.get('SELECT * FROM organizations WHERE id = $1', [req.user.organization_id]);
        if (!org || org.status === 'suspended') return res.status(403).json({ error: 'Your company’s account is disabled. Please contact the administrator.', code: 'ORG_SUSPENDED' });
        req.org = org;
        next();
    } catch (err) { sendError(res, err, 'org space'); }
});

/** Changes need the company to be open. */
const writable = (req, res, next) => {
    try { orgs.assertActive(req.org); next(); } catch (err) { sendError(res, err, 'org space'); }
};

const intId = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 ? n : null; };
const idList = (v, max = 5000) => {
    if (v === undefined || v === null) return [];
    if (!Array.isArray(v) || v.length > max) throw new OrgError('BAD_LIST', 'Invalid list.');
    const out = [];
    for (const x of v) { const n = intId(x); if (!n) throw new OrgError('BAD_LIST', 'Invalid list.'); out.push(n); }
    return [...new Set(out)];
};

/** A learner of this company, or a 404 (never tells whether the id exists elsewhere). */
async function ownLearner(req, id) {
    const uid = intId(id);
    const row = uid && await req.db.get(
        `SELECT id, first_name, last_name, email, is_active, created_at, must_change_password
           FROM users WHERE id = $1 AND organization_id = $2 AND role = 'candidate'`, [uid, req.org.id]);
    if (!row) throw new OrgError('NOT_FOUND', 'Learner not found.', 404);
    return row;
}

/** Active learners of the given groups of this company. */
async function membersOf(req, groupIds) {
    if (!groupIds.length) return [];
    const groups = await req.db.all(`SELECT id FROM organization_groups WHERE id = ANY($1::int[]) AND organization_id = $2`, [groupIds, req.org.id]);
    if (groups.length !== groupIds.length) throw new OrgError('GROUP_NOT_FOUND', 'Some of the chosen groups do not exist.', 404);
    const rows = await req.db.all(
        `SELECT DISTINCT gm.user_id FROM organization_group_members gm JOIN users u ON u.id = gm.user_id
          WHERE gm.group_id = ANY($1::int[]) AND u.organization_id = $2 AND u.role = 'candidate' AND u.is_active`,
        [groupIds, req.org.id]);
    return rows.map(r => Number(r.user_id));
}

// ── The company ────────────────────────────────────────────────────────────

router.get('/me', async (req, res) => {
    try {
        const [company, content] = await Promise.all([queries.describe(req.db, req.org), queries.contentOf(req.db, req.org.id)]);
        res.json({ company, content, me: { id: req.user.id, first_name: req.user.first_name, last_name: req.user.last_name, email: req.user.email } });
    } catch (err) { sendError(res, err, 'GET /org/me'); }
});

router.get('/dashboard', async (req, res) => {
    try { res.json(await queries.dashboardOf(req.db, req.org)); } catch (err) { sendError(res, err, 'GET /org/dashboard'); }
});

router.get('/activity', async (req, res) => {
    try { res.json(await queries.auditOf(req.db, req.org.id, req.query.limit)); } catch (err) { sendError(res, err, 'GET /org/activity'); }
});

router.put('/settings', writable, async (req, res) => {
    try {
        const body = req.body || {};
        const sets = [];
        const params = [req.org.id];
        if ('display_name' in body) {
            const dn = String(body.display_name ?? '').trim().replace(/\s+/g, ' ');
            if (dn.length > 160) throw new OrgError('NAME_TOO_LONG', 'The displayed name is limited to 160 characters.');
            params.push(dn || null); sets.push(`display_name = $${params.length}`);
        }
        if ('default_language' in body) {
            if (!['fr', 'en'].includes(body.default_language)) throw new OrgError('BAD_LANGUAGE', 'The language must be French or English.');
            params.push(body.default_language); sets.push(`default_language = $${params.length}`);
        }
        if (!sets.length) throw new OrgError('NOTHING_TO_UPDATE', 'Nothing to update.');
        const updated = await req.db.get(`UPDATE organizations SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, params);
        await orgs.audit(req.db, req.org.id, req.user.id, 'settings_changed', { display_name: updated.display_name, default_language: updated.default_language });
        res.json(await queries.describe(req.db, updated));
    } catch (err) { sendError(res, err, 'PUT /org/settings'); }
});

router.post('/logo', writable, logos.receive, async (req, res) => {
    try {
        await logos.saveLogo(req.db, req.org, req.file);
        await orgs.audit(req.db, req.org.id, req.user.id, 'logo_changed');
        res.json(orgs.brandOf(await req.db.get('SELECT * FROM organizations WHERE id = $1', [req.org.id])));
    } catch (err) {
        logos.cleanup(req.file);
        sendError(res, err, 'POST /org/logo');
    }
});

router.delete('/logo', writable, async (req, res) => {
    try {
        await logos.removeLogo(req.db, req.org);
        await orgs.audit(req.db, req.org.id, req.user.id, 'logo_removed');
        res.json(orgs.brandOf(await req.db.get('SELECT * FROM organizations WHERE id = $1', [req.org.id])));
    } catch (err) { sendError(res, err, 'DELETE /org/logo'); }
});

// ── Learners ───────────────────────────────────────────────────────────────

router.get('/learners', async (req, res) => {
    try { res.json(await queries.learnersOf(req.db, req.org.id)); } catch (err) { sendError(res, err, 'GET /org/learners'); }
});

/** Adds learners to groups of this company (groups checked first). */
async function joinGroups(req, userIds, groupIds) {
    if (!groupIds.length || !userIds.length) return;
    await req.db.run(
        `INSERT INTO organization_group_members (group_id, user_id)
         SELECT g.id, u.id FROM organization_groups g CROSS JOIN users u
          WHERE g.id = ANY($1::int[]) AND g.organization_id = $3
            AND u.id = ANY($2::int[]) AND u.organization_id = $3 AND u.role = 'candidate'
         ON CONFLICT DO NOTHING`,
        [groupIds, userIds, req.org.id]
    );
}

router.post('/learners', writable, async (req, res) => {
    try {
        const groupIds = idList(req.body?.group_ids);
        if (groupIds.length) await membersOf(req, groupIds); // checks the groups belong to the company
        const learner = await accounts.createAccount(req.db, req.org, 'candidate', req.body || {}, req.user.id);
        await joinGroups(req, [learner.id], groupIds);
        res.status(201).json(learner);
    } catch (err) { sendError(res, err, 'POST /org/learners'); }
});

/**
 * Several learners at once (from a CSV file read in the browser). Each row is
 * created on its own; the answer says what happened to every row. The seat
 * limit stops the import where it is reached.
 */
router.post('/learners/import', writable, async (req, res) => {
    try {
        const rows = req.body?.rows;
        if (!Array.isArray(rows) || !rows.length) throw new OrgError('NO_ROWS', 'The file has no learners.');
        if (rows.length > MAX_IMPORT_ROWS) throw new OrgError('TOO_MANY_ROWS', `Import at most ${MAX_IMPORT_ROWS} learners at a time.`);
        const groupIds = idList(req.body?.group_ids);
        if (groupIds.length) await membersOf(req, groupIds);
        const results = [];
        let stopped = false;
        for (let i = 0; i < rows.length; i += 1) {
            if (stopped) { results.push({ row: i + 1, status: 'skipped', code: 'SEAT_LIMIT_REACHED' }); continue; }
            try {
                const learner = await accounts.createAccount(req.db, req.org, 'candidate', rows[i] || {}, req.user.id);
                await joinGroups(req, [learner.id], groupIds);
                results.push({ row: i + 1, status: 'created', id: learner.id, email: learner.email, invitation_sent: learner.invitation_sent });
            } catch (err) {
                const known = err instanceof OrgError ? err : orgs.fromDbError(err);
                if (!known) throw err;
                if (known.code === 'SEAT_LIMIT_REACHED') stopped = true;
                results.push({ row: i + 1, status: 'error', code: known.code, error: known.message, email: rows[i]?.email || null });
            }
        }
        res.json({
            created: results.filter(r => r.status === 'created').length,
            failed: results.filter(r => r.status !== 'created').length,
            results,
        });
    } catch (err) { sendError(res, err, 'POST /org/learners/import'); }
});

router.get('/learners/:uid', async (req, res) => {
    try {
        const learner = await ownLearner(req, req.params.uid);
        const [overview, results, groups] = await Promise.all([
            buildOverview(req.db, learner.id, 'candidate'),
            history(req.db, learner.id, { limit: 100 }),
            req.db.all(`SELECT g.id, g.name FROM organization_group_members gm JOIN organization_groups g ON g.id = gm.group_id
                         WHERE gm.user_id = $1 AND g.organization_id = $2 ORDER BY g.name`, [learner.id, req.org.id]),
        ]);
        const { must_change_password, ...info } = learner;
        res.json({ learner: { ...info, invitation_pending: !!must_change_password, groups }, overview, results });
    } catch (err) { sendError(res, err, 'GET /org/learners/:uid'); }
});

router.put('/learners/:uid', writable, async (req, res) => {
    try {
        const learner = await ownLearner(req, req.params.uid);
        const first = String(req.body?.first_name ?? learner.first_name).trim().replace(/\s+/g, ' ');
        const last = String(req.body?.last_name ?? learner.last_name).trim().replace(/\s+/g, ' ');
        if (!first || !last || first.length > 50 || last.length > 50) throw new OrgError('BAD_NAME', 'First and last name are required (50 characters at most).');
        await req.db.run(`UPDATE users SET first_name = $1, last_name = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND organization_id = $4`,
            [first, last, learner.id, req.org.id]);
        if ('group_ids' in (req.body || {})) {
            const groupIds = idList(req.body.group_ids);
            if (groupIds.length) await membersOf(req, groupIds);
            await req.db.run(
                `DELETE FROM organization_group_members gm USING organization_groups g
                  WHERE gm.group_id = g.id AND g.organization_id = $1 AND gm.user_id = $2 AND NOT (gm.group_id = ANY($3::int[]))`,
                [req.org.id, learner.id, groupIds]);
            await joinGroups(req, [learner.id], groupIds);
        }
        await orgs.audit(req.db, req.org.id, req.user.id, 'learner_updated', { user_id: learner.id });
        res.json({ updated: true });
    } catch (err) { sendError(res, err, 'PUT /org/learners/:uid'); }
});

router.put('/learners/:uid/active', writable, async (req, res) => {
    try {
        const learner = await ownLearner(req, req.params.uid);
        res.json(await accounts.setActive(req.db, req.org, learner.id, req.body?.active === true, req.user.id, { role: 'candidate' }));
    } catch (err) { sendError(res, err, 'PUT /org/learners/:uid/active'); }
});

router.post('/learners/:uid/invite', writable, async (req, res) => {
    try {
        const learner = await ownLearner(req, req.params.uid);
        res.json(await accounts.resendInvite(req.db, req.org, learner.id, req.user.id));
    } catch (err) { sendError(res, err, 'POST /org/learners/:uid/invite'); }
});

// ── Groups ─────────────────────────────────────────────────────────────────

const groupName = (v) => {
    const name = String(v ?? '').trim().replace(/\s+/g, ' ');
    if (!name || name.length > 120) throw new OrgError('BAD_GROUP_NAME', 'A group needs a name (120 characters at most).');
    return name;
};
const groupTaken = (err) => err?.code === '23505'
    ? new OrgError('GROUP_EXISTS', 'A group already has this name.', 409) : err;

router.get('/groups', async (req, res) => {
    try { res.json(await queries.groupsOf(req.db, req.org.id)); } catch (err) { sendError(res, err, 'GET /org/groups'); }
});

router.post('/groups', writable, async (req, res) => {
    try {
        const name = groupName(req.body?.name);
        const memberIds = idList(req.body?.member_ids);
        let group;
        try {
            group = await req.db.get(`INSERT INTO organization_groups (organization_id, name) VALUES ($1, $2) RETURNING id, name`, [req.org.id, name]);
        } catch (err) { throw groupTaken(err); }
        await joinGroups(req, memberIds, [group.id]);
        await orgs.audit(req.db, req.org.id, req.user.id, 'group_created', { group_id: group.id, name });
        res.status(201).json(group);
    } catch (err) { sendError(res, err, 'POST /org/groups'); }
});

router.put('/groups/:gid', writable, async (req, res) => {
    try {
        const gid = intId(req.params.gid);
        const group = gid && await req.db.get(`SELECT id FROM organization_groups WHERE id = $1 AND organization_id = $2`, [gid, req.org.id]);
        if (!group) throw new OrgError('GROUP_NOT_FOUND', 'Group not found.', 404);
        if ('name' in (req.body || {})) {
            try {
                await req.db.run(`UPDATE organization_groups SET name = $1 WHERE id = $2 AND organization_id = $3`, [groupName(req.body.name), gid, req.org.id]);
            } catch (err) { throw groupTaken(err); }
        }
        if ('member_ids' in (req.body || {})) {
            const memberIds = idList(req.body.member_ids);
            const valid = await req.db.all(`SELECT id FROM users WHERE id = ANY($1::int[]) AND organization_id = $2 AND role = 'candidate'`, [memberIds, req.org.id]);
            if (valid.length !== memberIds.length) throw new OrgError('LEARNER_NOT_IN_COMPANY', 'Some of the chosen people are not learners of your company.');
            await req.db.run(`DELETE FROM organization_group_members WHERE group_id = $1 AND NOT (user_id = ANY($2::int[]))`, [gid, memberIds]);
            await joinGroups(req, memberIds, [gid]);
        }
        await orgs.audit(req.db, req.org.id, req.user.id, 'group_updated', { group_id: gid });
        res.json((await queries.groupsOf(req.db, req.org.id)).find(g => Number(g.id) === gid));
    } catch (err) { sendError(res, err, 'PUT /org/groups/:gid'); }
});

router.delete('/groups/:gid', writable, async (req, res) => {
    try {
        const gid = intId(req.params.gid);
        const gone = gid && await req.db.get(`DELETE FROM organization_groups WHERE id = $1 AND organization_id = $2 RETURNING id, name`, [gid, req.org.id]);
        if (!gone) throw new OrgError('GROUP_NOT_FOUND', 'Group not found.', 404);
        await orgs.audit(req.db, req.org.id, req.user.id, 'group_deleted', { group_id: gid, name: gone.name });
        res.json({ deleted: true });
    } catch (err) { sendError(res, err, 'DELETE /org/groups/:gid'); }
});

// ── Content & assignments ──────────────────────────────────────────────────

router.get('/content-tree', async (req, res) => {
    try {
        const [tree, allowed] = await Promise.all([buildContentTree(req.db), orgs.entitlementKeys(req.db, req.org.id)]);
        res.json(filterTree(tree, allowed));
    } catch (err) { sendError(res, err, 'GET /org/content-tree'); }
});

router.get('/assignments', async (req, res) => {
    try {
        const rows = await req.db.all(
            `SELECT a.id, a.content_type, a.content_id, a.student_id, a.org_group_id, a.expires_at, a.assigned_at, a.group_id, a.group_name,
                    u.first_name, u.last_name, g.name AS org_group_name, ab.first_name AS by_first, ab.last_name AS by_last
               FROM tcf_exam_assignments a
               LEFT JOIN users u ON u.id = a.student_id
               LEFT JOIN organization_groups g ON g.id = a.org_group_id
               LEFT JOIN users ab ON ab.id = a.assigned_by
              WHERE a.organization_id = $1
              ORDER BY a.assigned_at DESC`, [req.org.id]);
        const nameOf = await contentNameResolver(req.db, rows);
        const orgEnd = new Date(req.org.access_ends_at).getTime();
        const open = orgs.stateOf(req.org) === 'active';
        const byGroup = new Map();
        for (const r of rows) {
            const key = r.group_id || `single_${r.id}`;
            if (!byGroup.has(key)) {
                const own = r.expires_at ? new Date(r.expires_at).getTime() : orgEnd;
                const ends = Math.min(own, orgEnd);
                byGroup.set(key, {
                    group_id: key, name: r.group_name, assigned_at: r.assigned_at,
                    expires_at: new Date(ends).toISOString(), is_expired: !open || ends <= Date.now(),
                    assigned_by: r.by_first ? `${r.by_first} ${r.by_last}` : null,
                    items: [], recipients: [], _items: new Set(), _people: new Set(),
                });
            }
            const g = byGroup.get(key);
            const ik = `${r.content_type}:${r.content_id}`;
            if (!g._items.has(ik)) { g._items.add(ik); g.items.push({ content_type: r.content_type, content_id: Number(r.content_id), name: nameOf(r.content_type, r.content_id) }); }
            const pk = r.student_id ? `learner:${r.student_id}` : `group:${r.org_group_id}`;
            if (!g._people.has(pk)) {
                g._people.add(pk);
                g.recipients.push(r.student_id
                    ? { type: 'learner', id: Number(r.student_id), name: `${r.first_name} ${r.last_name}` }
                    : { type: 'group', id: Number(r.org_group_id), name: r.org_group_name });
            }
        }
        res.json([...byGroup.values()].map(({ _items, _people, ...g }) => ({ ...g, name: g.name || g.items.map(i => i.name).slice(0, 3).join(', ') })));
    } catch (err) { sendError(res, err, 'GET /org/assignments'); }
});

/**
 * Opens content to learners and/or groups of the company until `expires_at`.
 * Refused (nothing written) when: the company is not open, the date is past or
 * after the company's own end date, a content is not one the company may use,
 * a learner or group is not the company's. The date check and the company's
 * state are re-checked inside the insert itself, and the database refuses an
 * end after the company's end (migration 025) — three locks on the same door.
 */
router.post('/assignments', writable, async (req, res) => {
    try {
        const body = req.body || {};
        const learnerIds = idList(body.learner_ids);
        const groupIds = idList(body.group_ids);
        if (!learnerIds.length && !groupIds.length) throw new OrgError('NO_RECIPIENTS', 'Choose at least one learner or group.');
        if (!Array.isArray(body.items) || !body.items.length || body.items.length > 500) throw new OrgError('NO_CONTENT', 'Choose what to open.');

        const expires = new Date(body.expires_at);
        if (!body.expires_at || Number.isNaN(expires.getTime())) throw new OrgError('BAD_DATE', 'Choose until when the learners have access.');
        if (expires.getTime() <= Date.now()) throw new OrgError('DATE_PAST', 'The end date must be in the future.');
        const orgEnd = new Date(req.org.access_ends_at);
        if (expires.getTime() > orgEnd.getTime()) {
            throw new OrgError('AFTER_COMPANY_END', `The end date cannot be after your company’s access ends (${orgEnd.toISOString().slice(0, 10)}).`, 400,
                { max_expires_at: orgEnd.toISOString() });
        }

        // Content: known, existing and within what the company may use.
        const items = [];
        const seen = new Set();
        for (const it of body.items) {
            const id = intId(it?.content_id);
            if (!orgs.CONTENT_TYPES.includes(it?.content_type) || !id) throw new OrgError('BAD_CONTENT', 'Unknown exam content.');
            const key = `${it.content_type}:${id}`;
            if (!seen.has(key)) { seen.add(key); items.push({ content_type: it.content_type, content_id: id }); }
        }
        const [keysOf, allowed] = await Promise.all([orgs.ancestorKeys(req.db, items), orgs.entitlementKeys(req.db, req.org.id)]);
        if (items.some(it => !orgs.covered(keysOf.get(`${it.content_type}:${it.content_id}`), allowed))) {
            throw new OrgError('CONTENT_NOT_ALLOWED', 'Your company may not assign some of this content.', 403);
        }

        // Recipients: every one must be the company's (active learners, own groups).
        if (learnerIds.length) {
            const valid = await req.db.all(`SELECT id FROM users WHERE id = ANY($1::int[]) AND organization_id = $2 AND role = 'candidate' AND is_active`, [learnerIds, req.org.id]);
            if (valid.length !== learnerIds.length) throw new OrgError('LEARNER_NOT_IN_COMPANY', 'Some of the chosen learners are not active learners of your company.');
        }
        if (groupIds.length) await membersOf(req, groupIds);

        const name = String(body.name ?? '').trim().slice(0, 200)
            || (await contentNameResolver(req.db, items)).call(null, items[0].content_type, items[0].content_id) + (items.length > 1 ? ` +${items.length - 1}` : '');
        const batchId = crypto.randomUUID();
        const row = await req.db.get(
            `WITH org AS (
                SELECT id FROM organizations
                 WHERE id = $1 AND status = 'active' AND access_starts_at <= CURRENT_TIMESTAMP
                   AND access_ends_at > CURRENT_TIMESTAMP AND $4::timestamptz <= access_ends_at
             ),
             items AS (SELECT * FROM unnest($2::text[], $3::int[]) AS i(t, cid)),
             learners AS (
                SELECT id FROM users WHERE id = ANY($5::int[]) AND organization_id = $1 AND role = 'candidate' AND is_active
             ),
             grps AS (SELECT id FROM organization_groups WHERE id = ANY($6::int[]) AND organization_id = $1),
             to_learners AS (
                INSERT INTO tcf_exam_assignments (content_type, content_id, student_id, expires_at, assigned_by, group_id, group_name, organization_id)
                SELECT i.t, i.cid, l.id, ($4::timestamptz AT TIME ZONE 'UTC'), $7, $8, $9, $1
                  FROM items i CROSS JOIN learners l WHERE EXISTS (SELECT 1 FROM org)
                ON CONFLICT (content_type, content_id, student_id) WHERE student_id IS NOT NULL
                DO UPDATE SET expires_at = EXCLUDED.expires_at, assigned_by = EXCLUDED.assigned_by, assigned_at = CURRENT_TIMESTAMP,
                              group_id = EXCLUDED.group_id, group_name = EXCLUDED.group_name
                 WHERE tcf_exam_assignments.organization_id = $1
                RETURNING id
             ),
             to_groups AS (
                INSERT INTO tcf_exam_assignments (content_type, content_id, org_group_id, expires_at, assigned_by, group_id, group_name, organization_id)
                SELECT i.t, i.cid, g.id, ($4::timestamptz AT TIME ZONE 'UTC'), $7, $8, $9, $1
                  FROM items i CROSS JOIN grps g WHERE EXISTS (SELECT 1 FROM org)
                ON CONFLICT (content_type, content_id, org_group_id) WHERE org_group_id IS NOT NULL
                DO UPDATE SET expires_at = EXCLUDED.expires_at, assigned_by = EXCLUDED.assigned_by, assigned_at = CURRENT_TIMESTAMP,
                              group_id = EXCLUDED.group_id, group_name = EXCLUDED.group_name
                 WHERE tcf_exam_assignments.organization_id = $1
                RETURNING id
             )
             SELECT (SELECT COUNT(*) FROM org)::int AS open,
                    (SELECT COUNT(*) FROM to_learners)::int + (SELECT COUNT(*) FROM to_groups)::int AS written`,
            [req.org.id, items.map(i => i.content_type), items.map(i => i.content_id), expires.toISOString(),
                learnerIds, groupIds, req.user.id, batchId, name]
        );
        if (!row.open) {
            const fresh = await req.db.get('SELECT * FROM organizations WHERE id = $1', [req.org.id]);
            orgs.assertActive(fresh);
            throw new OrgError('AFTER_COMPANY_END', 'The end date cannot be after your company’s access ends.', 400, { max_expires_at: new Date(fresh.access_ends_at).toISOString() });
        }
        const expected = items.length * (learnerIds.length + groupIds.length);

        // Tell the learners reached.
        const reached = [...new Set([...learnerIds, ...(await membersOf(req, groupIds))])];
        const until = expires.toLocaleDateString(req.org.default_language === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        for (const uid of reached) {
            await createNotification(req.db, {
                user_id: uid,
                type: 'exam_assigned',
                title: req.org.default_language === 'en' ? 'New exam practice available' : 'Nouvel entraînement disponible',
                message: req.org.default_language === 'en' ? `${name} is open to you until ${until}.` : `${name} vous est ouvert jusqu’au ${until}.`,
                link: '/app/exam-practice',
                entity_type: 'tcf_exam_assignment',
                sender_id: req.user.id,
            }).catch(e => console.warn('[org] notification failed:', e.message));
        }
        await orgs.audit(req.db, req.org.id, req.user.id, 'assigned', {
            name, items: items.length, learners: learnerIds.length, groups: groupIds.length, expires_at: expires.toISOString(), written: row.written,
        });
        res.status(201).json({ created: row.written, skipped: expected - row.written, group_id: batchId });
    } catch (err) { sendError(res, err, 'POST /org/assignments'); }
});

router.delete('/assignments/:groupId', writable, async (req, res) => {
    try {
        const key = String(req.params.groupId || '');
        const single = key.startsWith('single_') ? intId(key.slice(7)) : null;
        const gone = single
            ? await req.db.all(`DELETE FROM tcf_exam_assignments WHERE id = $1 AND organization_id = $2 RETURNING id`, [single, req.org.id])
            : await req.db.all(`DELETE FROM tcf_exam_assignments WHERE group_id = $1 AND organization_id = $2 RETURNING id`, [key, req.org.id]);
        if (!gone.length) throw new OrgError('NOT_FOUND', 'Assignment not found.', 404);
        await orgs.audit(req.db, req.org.id, req.user.id, 'assignment_removed', { group_id: key, rows: gone.length });
        res.json({ deleted: gone.length });
    } catch (err) { sendError(res, err, 'DELETE /org/assignments/:groupId'); }
});

// ── Credits ────────────────────────────────────────────────────────────────

router.get('/credits', async (req, res) => {
    try {
        res.json({ credits: await orgs.creditSummary(req.db, req.org.id), items: await queries.creditTransactions(req.db, req.org.id, req.query.limit) });
    } catch (err) { sendError(res, err, 'GET /org/credits'); }
});

/**
 * Hands credits to learners and/or every active member of groups — all or nothing.
 *   mode "each"  (default) amount = credits per learner: 5 learners × 3 = 15
 *   mode "split" amount = a total shared evenly: 15 ÷ 5 = 3 each. What cannot be
 *                shared evenly stays in the reserve, so no more than the total leaves it.
 * The per-learner amount is always computed here, never taken from the client.
 */
router.post('/credits/distribute', writable, async (req, res) => {
    try {
        const { type } = req.body || {};
        const mode = req.body?.mode === 'split' ? 'split' : 'each';
        const amount = Number(req.body?.amount);
        if (!Number.isInteger(amount) || amount <= 0 || amount > 100000) throw new OrgError('BAD_AMOUNT', 'The number of credits must be a whole number above zero.');
        const learnerIds = idList(req.body?.learner_ids);
        const groupIds = idList(req.body?.group_ids);
        const everyone = [...new Set([...learnerIds, ...(await membersOf(req, groupIds))])];
        if (!everyone.length) throw new OrgError('NO_LEARNERS', groupIds.length ? 'These groups have no active learner.' : 'Choose at least one learner.');
        const each = mode === 'split' ? Math.floor(amount / everyone.length) : amount;
        if (each < 1) {
            throw new OrgError('TOTAL_TOO_SMALL', `A total of ${amount} cannot be shared between ${everyone.length} learners: give at least ${everyone.length}.`, 400,
                { learners: everyone.length, total: amount });
        }
        const notes = req.body?.notes ? String(req.body.notes).trim().slice(0, 500) : null;
        const result = await orgs.distribute(req.db, req.org.id, everyone, type, each, req.user.id, { notes });
        const remainder = mode === 'split' ? amount - each * result.given : 0;
        await orgs.audit(req.db, req.org.id, req.user.id, 'credits_distributed', { type, mode, each: result.each, learners: result.given, reserve: result.reserve, kept_in_reserve: remainder });
        res.json({ ...result, mode, total: result.each * result.given, kept_in_reserve: remainder, credits: await orgs.creditSummary(req.db, req.org.id) });
    } catch (err) { sendError(res, err, 'POST /org/credits/distribute'); }
});

/** Takes unused credits back from learners into the reserve. */
router.post('/credits/reclaim', writable, async (req, res) => {
    try {
        const { type } = req.body || {};
        const amount = req.body?.amount === 'all' ? 'all' : req.body?.amount;
        const learnerIds = idList(req.body?.learner_ids);
        const result = await orgs.reclaim(req.db, req.org.id, learnerIds, type, amount, req.user.id);
        await orgs.audit(req.db, req.org.id, req.user.id, 'credits_reclaimed', { type, returned: result.returned, learners: learnerIds.length });
        res.json({ ...result, credits: await orgs.creditSummary(req.db, req.org.id) });
    } catch (err) { sendError(res, err, 'POST /org/credits/reclaim'); }
});

module.exports = router;
