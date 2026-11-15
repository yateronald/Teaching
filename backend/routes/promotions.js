/**
 * Marketing campaigns, for the administrator (mounted at /api/admin/promotions):
 *
 *   GET    /                         every campaign, with its counts, and the totals
 *   GET    /alerts                   registrations nobody has looked at yet (menu badge)
 *   POST   /                         create (a draft unless `status` says otherwise)
 *   GET    /:id                      one campaign, with its figures per place and per day
 *   PUT    /:id                      change it
 *   POST   /:id/status               publish, pause, archive, back to draft
 *   POST   /:id/seats                seats taken outside the site: { add: ±n } or { seats_offline: n }
 *   POST   /:id/duplicate            a draft copy
 *   DELETE /:id                      only while nobody has registered
 *   GET    /:id/registrations        the people who registered
 *   PATCH  /:id/registrations/:rid   status and notes of one registration
 *   DELETE /:id/registrations/:rid   remove one registration
 *
 *   GET    /ai                       can the AI write and draw now, and with which models
 *   POST   /ai/draft                 a campaign in French and English from a brief (or changes to one)
 *   POST   /ai/image                 a new picture for a campaign (its key becomes image_key)
 */
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { hasColumn } = require('../services/schemaFeatures');
const promos = require('../services/promotionService');
const promoAi = require('../services/promotionAi');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin'));

/** Every route answers 503 with a clear message until migration 026 has run. */
router.use(async (req, res, next) => {
    if (await promos.ready(req.db)) return next();
    res.status(503).json({
        error: 'Marketing is not installed yet',
        message: 'Run backend/database/run-promotions-migration.js on the server, then reload this page.',
        code: 'PROMOTIONS_NOT_MIGRATED',
    });
});

const STATS_JOIN = `
    LEFT JOIN (
        SELECT promotion_id, SUM(views)::int AS views, SUM(clicks)::int AS clicks
          FROM promotion_stats GROUP BY promotion_id
    ) s ON s.promotion_id = p.id`;

const idOf = (value) => (/^\d{1,9}$/.test(String(value)) ? Number(value) : null);
const fail = (res, err, what) => {
    console.error(`${what} error:`, err.message);
    res.status(500).json({ error: 'Something went wrong', message: `${what} failed. Please try again.` });
};

async function loadOne(db, id) {
    return db.get(`SELECT ${promos.COLUMNS}, r.registrations, r.new_registrations, r.seats_taken, r.waitlist, r.last_registration_at, s.views, s.clicks
                     FROM promotions p ${promos.COUNTS_JOIN} ${STATS_JOIN} WHERE p.id = $1`, [id]);
}

// The fields of a campaign, in the order they are written to the table.
const FIELDS = [
    'kind', 'title_en', 'title_fr', 'tagline_en', 'tagline_fr', 'description_en', 'description_fr',
    'highlights_en', 'highlights_fr', 'cta_en', 'cta_fr', 'badge_en', 'badge_fr', 'audience', 'level',
    'class_starts_on', 'class_ends_on', 'schedule_en', 'schedule_fr', 'teacher_name', 'seat_limit', 'show_seats',
    'price_regular', 'price_promo', 'currency', 'price_note_en', 'price_note_fr',
    'starts_at', 'ends_at', 'show_countdown', 'place_bar', 'place_home', 'place_flash', 'place_learn',
    'priority', 'theme', 'image_key', 'registration_mode', 'cta_url',
];
const JSON_FIELDS = new Set(['highlights_en', 'highlights_fr']);
/** The fields written, with the seats outside the site once migration 028 has run. */
const fieldsOf = async (db) => ((await hasColumn(db, 'promotions', 'seats_offline')) ? [...FIELDS, 'seats_offline', 'seats_display'] : FIELDS);
const stored = (values, field) => (JSON_FIELDS.has(field) ? JSON.stringify(values[field]) : values[field]);

// ── List ──
router.get('/', async (req, res) => {
    try {
        const rows = await req.db.all(
            `SELECT ${promos.COLUMNS}, r.registrations, r.new_registrations, r.seats_taken, r.waitlist, r.last_registration_at, s.views, s.clicks
               FROM promotions p ${promos.COUNTS_JOIN} ${STATS_JOIN}
              ORDER BY (p.status = 'archived'), p.priority DESC, p.created_at DESC`);
        const list = rows.map(promos.adminShape);
        const week = await req.db.get(
            `SELECT COUNT(*)::int AS registrations FROM promotion_registrations
              WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'`);
        const views = list.reduce((t, p) => t + p.views, 0);
        const registrations = list.reduce((t, p) => t + p.registrations, 0);
        res.json({
            promotions: list,
            summary: {
                live: list.filter(p => p.state === 'live').length,
                scheduled: list.filter(p => p.state === 'scheduled').length,
                registrations,
                registrations_week: week?.registrations || 0,
                new_registrations: list.reduce((t, p) => t + p.new_registrations, 0),
                views,
                conversion: views ? Math.round((registrations / views) * 1000) / 10 : null,
            },
        });
    } catch (err) { fail(res, err, 'Loading the campaigns'); }
});

// ── The AI writer ──
// Each administrator may ask a reasonable number of times per hour: enough
// to work, never a bulk run against the engine's quota.
const AI_PER_HOUR = { draft: 40, image: 20 };
const aiUses = new Map(); // "kind|user" → times of the last hour

function aiQuota(kind) {
    return (req, res, next) => {
        const key = `${kind}|${req.user.id}`;
        const now = Date.now();
        const recent = (aiUses.get(key) || []).filter(t => now - t < 3_600_000);
        if (recent.length >= AI_PER_HOUR[kind]) {
            return res.status(429).json({
                error: 'Too many AI requests',
                message: `The AI has been asked ${AI_PER_HOUR[kind]} times in the last hour. Try again a little later.`,
                code: 'AI_LIMIT',
            });
        }
        recent.push(now);
        aiUses.set(key, recent);
        next();
    };
}

const aiFail = (res, err, what) => {
    if (err instanceof promoAi.AiError) return res.status(err.status).json({ error: err.message, message: err.message, code: err.code });
    console.error(`${what} error:`, err.message);
    return res.status(500).json({ error: 'Something went wrong', message: `${what} failed. Please try again.` });
};

router.get('/ai', (_req, res) => res.json(promoAi.status()));

router.post('/ai/draft', aiQuota('draft'), async (req, res) => {
    try {
        const { brief, current, timezone, notes_lang: notesLang, registered_on_site: registeredOnSite } = req.body || {};
        const draft = await promoAi.draftCampaign({ brief, current, timezone, notesLang, userTimezone: req.user.timezone, registeredOnSite });
        res.json(draft);
    } catch (err) { aiFail(res, err, 'Writing the campaign'); }
});

router.post('/ai/image', aiQuota('image'), async (req, res) => {
    try {
        const { prompt, theme, title } = req.body || {};
        const picture = await promoAi.campaignImage(req.db, { prompt, theme, title, userId: req.user.id });
        res.json(picture);
    } catch (err) { aiFail(res, err, 'Making the picture'); }
});

// ── Menu badge: registrations still marked "new" ──
router.get('/alerts', async (req, res) => {
    try {
        const row = await req.db.get(`SELECT COUNT(*)::int AS waiting FROM promotion_registrations WHERE status = 'new'`);
        res.json({ waiting: row?.waiting || 0 });
    } catch (err) { fail(res, err, 'Loading the registrations count'); }
});

// ── Create ──
router.post('/', async (req, res) => {
    try {
        const { values, errors } = promos.clean(req.body);
        if (errors.length) return res.status(400).json({ error: 'Check the campaign', message: errors.join(' '), errors });
        const status = req.body.status === 'published' ? 'published' : 'draft';
        const slug = await promos.freeSlug(req.db, values.title_en || values.title_fr);
        const fields = await fieldsOf(req.db);
        const columns = ['slug', 'status', 'created_by', ...fields];
        const params = [slug, status, req.user.id, ...fields.map(f => stored(values, f))];
        const created = await req.db.run(
            `INSERT INTO promotions (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`, params);
        res.status(201).json({ promotion: promos.adminShape(await loadOne(req.db, created.rows[0].id)) });
    } catch (err) { fail(res, err, 'Creating the campaign'); }
});

// ── One campaign, with its figures ──
router.get('/:id', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const row = id && await loadOne(req.db, id);
        if (!row) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        const [byPlace, byDay, regDays] = await Promise.all([
            req.db.all(`SELECT placement, SUM(views)::int AS views, SUM(clicks)::int AS clicks
                          FROM promotion_stats WHERE promotion_id = $1 GROUP BY placement ORDER BY SUM(views) DESC`, [id]),
            req.db.all(`SELECT to_char(day, 'YYYY-MM-DD') AS day, SUM(views)::int AS views, SUM(clicks)::int AS clicks
                          FROM promotion_stats WHERE promotion_id = $1 AND day > CURRENT_DATE - 30 GROUP BY day ORDER BY day`, [id]),
            req.db.all(`SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*)::int AS registrations
                          FROM promotion_registrations WHERE promotion_id = $1 AND created_at > CURRENT_DATE - 30
                         GROUP BY 1 ORDER BY 1`, [id]),
            ]);
        const fromPlace = await req.db.all(
            `SELECT COALESCE(placement, 'link') AS placement, COUNT(*)::int AS registrations
               FROM promotion_registrations WHERE promotion_id = $1 GROUP BY 1`, [id]);
        const registered = Object.fromEntries(fromPlace.map(r => [r.placement, r.registrations]));
        res.json({
            promotion: promos.adminShape(row),
            stats: {
                places: byPlace.map(p => ({ ...p, registrations: registered[p.placement] || 0 })),
                days: byDay,
                registration_days: regDays,
            },
        });
    } catch (err) { fail(res, err, 'Loading the campaign'); }
});

// ── Change ──
router.put('/:id', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const existing = id && await req.db.get('SELECT * FROM promotions WHERE id = $1', [id]);
        if (!existing) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        // An app from before the seats outside the site does not send them: they are kept, never reset.
        const body = { ...req.body };
        if (body.seats_offline === undefined && existing.seats_offline !== undefined) body.seats_offline = existing.seats_offline;
        if (body.seats_display === undefined && existing.seats_display !== undefined) {
            // Its only switch, show_seats, turns the count off, or back on.
            if (body.show_seats === false) body.seats_display = 'never';
            else if (body.show_seats === true && existing.seats_display === 'never') body.seats_display = 'auto';
            else body.seats_display = existing.seats_display;
        }
        const { values, errors } = promos.clean(body);
        if (errors.length) return res.status(400).json({ error: 'Check the campaign', message: errors.join(' '), errors });
        const fields = await fieldsOf(req.db);
        await req.db.run(
            `UPDATE promotions SET ${fields.map((f, i) => `${f} = $${i + 2}`).join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, ...fields.map(f => stored(values, f))]);
        res.json({ promotion: promos.adminShape(await loadOne(req.db, id)) });
    } catch (err) { fail(res, err, 'Saving the campaign'); }
});

// ── Publish, pause, archive ──
router.post('/:id/status', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const status = promos.STATUSES.includes(req.body?.status) ? req.body.status : null;
        if (!id || !status) return res.status(400).json({ error: 'Invalid request', message: 'Unknown campaign or status.' });
        const done = await req.db.run('UPDATE promotions SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [id, status]);
        if (!done.rowCount) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        res.json({ promotion: promos.adminShape(await loadOne(req.db, id)) });
    } catch (err) { fail(res, err, 'Changing the campaign'); }
});

// ── Seats taken outside the site (phone, WhatsApp, in person) ──
// `add` (+1, −1…) changes the count in one statement, so two quick taps never
// lose one; `seats_offline` sets it. Always between 0 and the seats of the group.
router.post('/:id/seats', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        if (!id) return res.status(400).json({ error: 'Invalid request', message: 'Unknown campaign.' });
        if (!(await hasColumn(req.db, 'promotions', 'seats_offline'))) {
            return res.status(409).json({
                error: 'Not installed yet',
                message: 'Run backend/database/run-promotion-seats-migration.js on the server to count the seats taken outside the site.',
                code: 'SEATS_NOT_MIGRATED',
            });
        }
        const { add, seats_offline: set } = req.body || {};
        const isCount = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
        if (!(set === undefined ? isCount(add, -100000, 100000) : isCount(set, 0, 100000))) {
            return res.status(400).json({ error: 'Invalid request', message: 'Send a whole number of seats.' });
        }
        const existing = await req.db.get('SELECT seat_limit FROM promotions WHERE id = $1', [id]);
        if (!existing) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        if (!existing.seat_limit) return res.status(400).json({ error: 'No seat limit', message: 'Give the group a number of seats first.' });
        await req.db.run(
            `UPDATE promotions SET seats_offline = LEAST(seat_limit, GREATEST(0, ${set === undefined ? 'COALESCE(seats_offline, 0) + $2' : '$2'})),
                                   updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, set === undefined ? add : set]);
        res.json({ promotion: promos.adminShape(await loadOne(req.db, id)) });
    } catch (err) { fail(res, err, 'Changing the seats'); }
});

// ── A draft copy (same content, no registrations, no figures) ──
router.post('/:id/duplicate', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const source = id && await req.db.get(`SELECT ${promos.COLUMNS} FROM promotions p WHERE p.id = $1`, [id]);
        if (!source) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        const copy = promos.adminShape(source);
        if (copy.title_en) copy.title_en = `${copy.title_en} (copy)`.slice(0, 140);
        if (copy.title_fr) copy.title_fr = `${copy.title_fr} (copie)`.slice(0, 140);
        copy.seats_offline = 0;
        const { values } = promos.clean(copy);
        const slug = await promos.freeSlug(req.db, values.title_en || values.title_fr);
        const fields = await fieldsOf(req.db);
        const columns = ['slug', 'status', 'created_by', ...fields];
        const created = await req.db.run(
            `INSERT INTO promotions (${columns.join(', ')}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
            [slug, 'draft', req.user.id, ...fields.map(f => stored(values, f))]);
        res.status(201).json({ promotion: promos.adminShape(await loadOne(req.db, created.rows[0].id)) });
    } catch (err) { fail(res, err, 'Copying the campaign'); }
});

// ── Delete: only a campaign nobody registered for ──
router.delete('/:id', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        if (!id) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        const people = await req.db.get('SELECT COUNT(*)::int AS n FROM promotion_registrations WHERE promotion_id = $1', [id]);
        if (people?.n) {
            return res.status(409).json({
                error: 'People registered',
                message: `${people.n} ${people.n === 1 ? 'person has' : 'people have'} registered for this campaign. Archive it instead: their details stay available.`,
            });
        }
        const done = await req.db.run('DELETE FROM promotions WHERE id = $1', [id]);
        if (!done.rowCount) return res.status(404).json({ error: 'Not found', message: 'This campaign does not exist any more.' });
        res.json({ success: true });
    } catch (err) { fail(res, err, 'Deleting the campaign'); }
});

// ── The people who registered ──
router.get('/:id/registrations', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        if (!id) return res.status(404).json({ error: 'Not found' });
        const rows = await req.db.all(
            `SELECT id, full_name, email, phone, country, level, message, language, timezone, placement, source_path,
                    status, notes, created_at, updated_at
               FROM promotion_registrations WHERE promotion_id = $1 ORDER BY created_at DESC`, [id]);
        res.json({ registrations: rows });
    } catch (err) { fail(res, err, 'Loading the registrations'); }
});

router.patch('/:id/registrations/:rid', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const rid = idOf(req.params.rid);
        if (!id || !rid) return res.status(404).json({ error: 'Not found' });
        const sets = [];
        const params = [rid, id];
        if (req.body?.status !== undefined) {
            if (!promos.REGISTRATION_STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status', message: 'Unknown status.' });
            params.push(req.body.status);
            sets.push(`status = $${params.length}`);
        }
        if (req.body?.notes !== undefined) {
            params.push(promos.longText(req.body.notes, 2000));
            sets.push(`notes = $${params.length}`);
        }
        if (!sets.length) return res.status(400).json({ error: 'Nothing to change', message: 'Send a status or notes.' });
        const done = await req.db.run(
            `UPDATE promotion_registrations SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP
              WHERE id = $1 AND promotion_id = $2 RETURNING *`, params);
        if (!done.rowCount) return res.status(404).json({ error: 'Not found', message: 'This registration does not exist any more.' });
        res.json({ registration: done.rows[0] });
    } catch (err) { fail(res, err, 'Saving the registration'); }
});

router.delete('/:id/registrations/:rid', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const rid = idOf(req.params.rid);
        if (!id || !rid) return res.status(404).json({ error: 'Not found' });
        const done = await req.db.run('DELETE FROM promotion_registrations WHERE id = $1 AND promotion_id = $2', [rid, id]);
        if (!done.rowCount) return res.status(404).json({ error: 'Not found', message: 'This registration does not exist any more.' });
        res.json({ success: true });
    } catch (err) { fail(res, err, 'Removing the registration'); }
});

module.exports = router;
