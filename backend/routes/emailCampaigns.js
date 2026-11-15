/**
 * Email campaigns, for the administrator (mounted at /api/admin/email-campaigns):
 *
 *   GET    /                     every campaign with its figures, and the totals
 *   GET    /meta                 the lists people can be chosen from, the sender, the pace
 *   PUT    /settings             the sender's details (postal address, reply-to, name)
 *   POST   /audience             who the filters select (count, list, who is left out)
 *   POST   /preview              an email as it will look (fields not saved yet)
 *   POST   /ai/draft             the AI writes the email in French and English (words, buttons, form, offer)
 *   POST   /ai/designs           the AI's art director proposes three designs
 *   POST   /ai/models/check      whether each model the administrator can pick answers (one short call each)
 *   POST   /ai/image             the AI makes a picture (the marketing painter), with its URL
 *   GET    /:id/responses        what people sent through the email's form
 *   PATCH  /:id/responses/:rid   status and notes of one answer
 *   DELETE /:id/responses/:rid   remove one answer
 *   POST   /                     create (a draft)
 *   GET    /:id                  one campaign, its links, its figures by day
 *   PUT    /:id                  change a draft
 *   DELETE /:id                  delete a draft (or a campaign that sent nothing)
 *   POST   /:id/duplicate        a draft copy
 *   POST   /:id/test             a test to a few addresses
 *   POST   /:id/send             send now, or at { scheduled_at }
 *   POST   /:id/unschedule       back to draft
 *   POST   /:id/pause | /resume | /cancel | /retry
 *   GET    /:id/recipients       who it was sent to, and what they did
 *   POST   /:id/preview-link     a link to the email for a phone's browser (30 minutes)
 *   GET    /suppressions         addresses that never receive a campaign
 *   POST   /suppressions         add addresses by hand
 *   DELETE /suppressions/:email  remove one (only when the person asked to receive emails again)
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { hasTable } = require('../services/schemaFeatures');
const svc = require('../services/emailCampaignService');
const sender = require('../services/emailCampaignSender');
const emailAi = require('../services/emailCampaignAi');
const promoAi = require('../services/promotionAi');
const { renderEmail, linksOf, apiUrl, formUrl, imageUrl } = require('../services/emailRender');
const emailDesign = require('../services/emailDesign');
const { brevoService } = require('../emails/brevoService');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('admin'));

router.use(async (req, res, next) => {
    if (await svc.ready(req.db)) return next();
    res.status(503).json({
        error: 'Email campaigns are not installed yet',
        message: 'Run backend/database/run-email-campaigns-migration.js on the server, then reload this page.',
        code: 'EMAILS_NOT_MIGRATED',
    });
});

const idOf = (value) => (/^\d{1,9}$/.test(String(value)) ? Number(value) : null);
const fail = (res, err, what) => {
    console.error(`${what} error:`, err.message);
    res.status(500).json({ error: 'Something went wrong', message: `${what} failed. Please try again.` });
};
const json = (v) => JSON.stringify(v);
const stored = (values, f) => (svc.JSON_FIELDS.includes(f) ? json(values[f]) : values[f]);

async function loadOne(db, id) {
    const c = await db.get('SELECT * FROM email_campaigns WHERE id = $1', [id]);
    if (!c) return null;
    const stats = await db.get(`${svc.STATS_SQL} WHERE campaign_id = $1 GROUP BY campaign_id`, [id]);
    const responses = await db.get('SELECT COUNT(*)::int AS n FROM email_campaign_responses WHERE campaign_id = $1', [id]);
    return svc.shape(c, stats, responses?.n || 0);
}

// AI use per administrator: a draft takes about half a minute, designs as long, a picture about 15 s.
const AI_LIMITS = { draft: 40, design: 30, image: 20, check: 10 };
const aiUse = new Map();
function aiQuota(kind) {
    return (req, res, next) => {
        const key = `${kind}:${req.user.id}`;
        const now = Date.now();
        const recent = (aiUse.get(key) || []).filter(t => now - t < 3600e3);
        if (recent.length >= AI_LIMITS[kind]) {
            return res.status(429).json({ error: 'Too many AI requests', message: 'The AI has written a lot in the last hour. Try again a little later.', code: 'AI_LIMIT' });
        }
        recent.push(now);
        aiUse.set(key, recent);
        next();
    };
}
const aiFail = (res, err, what) => {
    if (err instanceof promoAi.AiError) return res.status(err.status).json({ error: what, message: err.message, code: err.code });
    return fail(res, err, what);
};

// ── Lists, settings, audience, preview ──

router.get('/', async (req, res) => {
    try {
        const rows = await req.db.all('SELECT * FROM email_campaigns ORDER BY COALESCE(started_at, scheduled_at, created_at) DESC, id DESC');
        const stats = await req.db.all(`${svc.STATS_SQL} GROUP BY campaign_id`);
        const byId = new Map(stats.map(s => [s.campaign_id, s]));
        const answers = await req.db.all('SELECT campaign_id, COUNT(*)::int AS n FROM email_campaign_responses GROUP BY campaign_id');
        const answersOf = new Map(answers.map(a => [a.campaign_id, a.n]));
        const campaigns = rows.map(c => svc.shape(c, byId.get(c.id), answersOf.get(c.id) || 0));
        const fresh = await req.db.get("SELECT COUNT(*)::int AS n FROM email_campaign_responses WHERE status = 'new'");
        const month = await req.db.get(`
            SELECT COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'bounced'))::int AS sent,
                   COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened,
                   COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::int AS clicked,
                   COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::int AS unsubscribed
              FROM email_campaign_recipients WHERE sent_at >= now() - INTERVAL '30 days'`);
        res.json({
            campaigns,
            summary: {
                sent_30d: month.sent, opened_30d: month.opened, clicked_30d: month.clicked, unsubscribed_30d: month.unsubscribed,
                open_rate_30d: month.sent ? month.opened / month.sent : null,
                click_rate_30d: month.sent ? month.clicked / month.sent : null,
                sending: campaigns.filter(c => c.status === 'sending').length,
                scheduled: campaigns.filter(c => c.status === 'scheduled').length,
                new_responses: fresh?.n || 0,
            },
        });
    } catch (err) { fail(res, err, 'Loading the email campaigns'); }
});

router.get('/meta', async (req, res) => {
    try {
        const db = req.db;
        const students = await db.get(`SELECT COUNT(*) FILTER (WHERE is_active)::int AS active, COUNT(*) FILTER (WHERE NOT is_active)::int AS inactive
                                          FROM users WHERE role = 'student' AND COALESCE(email, '') <> ''`);
        const candidates = await db.get(`SELECT COUNT(*)::int AS n FROM users WHERE role = 'candidate' AND is_active AND COALESCE(email, '') <> ''`);
        const demos = (await hasTable(db, 'demo_requests'))
            ? await db.all(`SELECT status, COUNT(*)::int AS n FROM demo_requests WHERE COALESCE(email, '') <> '' GROUP BY status`)
            : [];
        const withPromos = await hasTable(db, 'promotions');
        const registrations = withPromos && await hasTable(db, 'promotion_registrations')
            ? await db.get('SELECT COUNT(*)::int AS n FROM promotion_registrations')
            : { n: 0 };
        const batches = await db.all(`SELECT b.id, b.name, b.french_level, COUNT(bs.id)::int AS students
                                         FROM batches b LEFT JOIN batch_students bs ON bs.batch_id = b.id
                                        GROUP BY b.id ORDER BY b.start_date DESC NULLS LAST, b.id DESC LIMIT 200`).catch(() => []);
        const promotions = withPromos
            ? await db.all(`SELECT id, slug, title_fr, title_en, status, theme, ends_at FROM promotions
                             WHERE status <> 'archived' ORDER BY created_at DESC LIMIT 100`)
            : [];
        const suppressions = await db.get('SELECT COUNT(*)::int AS n FROM email_suppressions');
        res.json({
            sources: {
                students: { active: students.active, inactive: students.inactive },
                candidates: { active: candidates.n },
                demos: { total: demos.reduce((s, r) => s + r.n, 0), by_status: Object.fromEntries(demos.map(r => [r.status, r.n])) },
                registrations: { total: registrations.n },
            },
            batches, promotions,
            sender: { email: brevoService.fromEmail, name: brevoService.fromName },
            settings: await svc.settings(db),
            pace: { per_minute: sender.perMinute(), daily_max: sender.dailyMax() },
            // The engine, its pictures model (the marketing one), and the writers the administrator may pick.
            ai: { ...promoAi.status(), writing_choices: emailAi.writingChoices() },
            suppressions: suppressions.n,
            site_pages: emailAi.sitePages(),
            // The layouts, colours and fonts the design editor offers (the same rules as the renderer).
            design: {
                presets: Object.fromEntries(emailDesign.PRESETS.map(p => [p, emailDesign.clean(emailDesign.preset(p, 'navy')).design])),
                brand: emailDesign.BRAND,
                fonts: Object.keys(emailDesign.FONTS),
            },
            form_field_types: svc.FIELD_TYPES,
        });
    } catch (err) { fail(res, err, 'Loading the lists'); }
});

router.put('/settings', async (req, res) => {
    try {
        const r = await svc.saveSettings(req.db, req.body || {});
        if (r.errors) return res.status(400).json({ error: 'Check the details', message: r.errors.join(' ') });
        res.json(r);
    } catch (err) { fail(res, err, 'Saving the sender details'); }
});

router.post('/audience', async (req, res) => {
    try {
        const { people, counts } = await svc.audienceOf(req.db, req.body?.audience, req.body?.excluded);
        res.json({ counts, people: people.slice(0, 2000), truncated: people.length > 2000 });
    } catch (err) { fail(res, err, 'Counting the recipients'); }
});

/** An email as it will look: the fields of the form, in one language (or both). */
router.post('/preview', async (req, res) => {
    try {
        const { values } = svc.clean(req.body?.fields || {});
        const lang = ['fr', 'en', 'both'].includes(req.body?.lang) ? req.body.lang : 'fr';
        const settings = await svc.settings(req.db);
        const id = idOf(req.body?.id);
        const out = renderEmail(values, {
            lang, firstName: req.user.first_name || (lang === 'en' ? 'Alex' : 'Camille'),
            source: ['student', 'candidate', 'registration', 'demo'].includes(req.body?.source) ? req.body.source : 'student',
            postalAddress: settings.postal_address || '[Postal address]',
            unsubscribeUrl: '#', viewUrl: '#',
            // The form of a saved email opens in preview (nothing is kept); an unsaved one has none yet.
            link: (url) => (url === 'form' ? (id ? formUrl(`preview-${id}`, lang === 'en' ? 'en' : 'fr') : '#') : url),
        });
        res.json({ subject: out.subject, preheader: out.preheader, html: out.html, text: out.text });
    } catch (err) { fail(res, err, 'The preview'); }
});

// ── AI ──

router.post('/ai/draft', aiQuota('draft'), async (req, res) => {
    try {
        const b = req.body || {};
        const draft = await emailAi.draftEmail(req.db, {
            brief: b.brief, goal: b.goal, current: b.current, promotionId: b.promotion_id, primary: b.primary, secondary: b.secondary,
            notesLang: b.notes_lang, timezone: b.timezone, userTimezone: req.user.timezone,
            model: b.model, pictureWanted: b.picture === true, picturePrompt: b.picture_prompt,
        });
        res.json(draft);
    } catch (err) { aiFail(res, err, 'The AI could not write the email'); }
});

/** Three designs for this email, proposed by the AI's art director. */
router.post('/ai/designs', aiQuota('design'), async (req, res) => {
    try {
        const b = req.body || {};
        res.json(await emailAi.proposeDesigns({ campaign: b.campaign, wishes: b.wishes, model: b.model, lang: b.lang }));
    } catch (err) { aiFail(res, err, 'The AI could not propose designs'); }
});

/** Whether each model the administrator can pick answers right now (one short call each). */
router.post('/ai/models/check', aiQuota('check'), async (req, res) => {
    try { res.json(await emailAi.checkWritingModels()); } catch (err) { aiFail(res, err, 'Checking the AI models'); }
});

/** A picture for the email, by the marketing painter (same image model, same checks for text and logos). */
router.post('/ai/image', aiQuota('image'), async (req, res) => {
    try {
        const b = req.body || {};
        const picture = await promoAi.campaignImage(req.db, { prompt: b.prompt, theme: b.theme, title: b.title, userId: req.user.id });
        res.json({ ...picture, url: imageUrl(picture.image_key) });
    } catch (err) { aiFail(res, err, 'The AI could not make the picture'); }
});

// ── Unsubscribed addresses ──

router.get('/suppressions', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim().toLowerCase().slice(0, 100);
        const rows = await req.db.all(
            `SELECT email, reason, note, created_at FROM email_suppressions ${q ? 'WHERE email LIKE $1' : ''} ORDER BY created_at DESC LIMIT 500`,
            q ? [`%${q.replace(/[%_\\]/g, '\\$&')}%`] : []);
        res.json({ suppressions: rows });
    } catch (err) { fail(res, err, 'Loading the unsubscribed addresses'); }
});

router.post('/suppressions', async (req, res) => {
    try {
        const emails = [...new Set((Array.isArray(req.body?.emails) ? req.body.emails : String(req.body?.emails || '').split(/[\s,;]+/))
            .map(svc.lower).filter(e => svc.EMAIL_RE.test(e)))].slice(0, 2000);
        if (!emails.length) return res.status(400).json({ error: 'No address', message: 'Give at least one valid email address.' });
        const note = String(req.body?.note || '').trim().slice(0, 200) || null;
        for (const e of emails) {
            await req.db.run(`INSERT INTO email_suppressions (email, reason, note) VALUES ($1, 'manual', $2) ON CONFLICT (email) DO NOTHING`, [e, note]);
        }
        res.json({ added: emails.length });
    } catch (err) { fail(res, err, 'Adding the addresses'); }
});

router.delete('/suppressions/:email', async (req, res) => {
    try {
        const email = svc.lower(decodeURIComponent(req.params.email));
        const done = await req.db.run('DELETE FROM email_suppressions WHERE email = $1', [email]);
        if (!done.rowCount) return res.status(404).json({ error: 'Not found', message: 'This address is not in the list.' });
        res.json({ removed: email });
    } catch (err) { fail(res, err, 'Removing the address'); }
});

// ── One campaign ──

router.post('/', async (req, res) => {
    try {
        const { values, errors } = svc.clean(req.body || {});
        if (errors.length) return res.status(400).json({ error: 'Check the email', message: errors.join(' '), errors });
        const cols = [...svc.FIELDS, 'created_by'];
        const row = await req.db.get(
            `INSERT INTO email_campaigns (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
            [...svc.FIELDS.map(f => stored(values, f)), req.user.id]);
        res.status(201).json({ campaign: await loadOne(req.db, row.id) });
    } catch (err) { fail(res, err, 'Creating the email'); }
});

router.get('/:id', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const campaign = id && await loadOne(req.db, id);
        if (!campaign) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        const links = await req.db.all(`
            SELECT l.idx, l.url, l.label,
                   COUNT(e.id) FILTER (WHERE NOT e.machine)::int AS clicks,
                   COUNT(DISTINCT e.recipient_id) FILTER (WHERE NOT e.machine)::int AS people
              FROM email_campaign_links l
              LEFT JOIN email_campaign_events e ON e.campaign_id = l.campaign_id AND e.type = 'click' AND e.link_idx = l.idx
             WHERE l.campaign_id = $1 GROUP BY l.idx, l.url, l.label ORDER BY l.idx`, [id]);
        const days = await req.db.all(`
            SELECT to_char(date_trunc('day', at), 'YYYY-MM-DD') AS day,
                   COUNT(DISTINCT recipient_id) FILTER (WHERE type = 'open')::int AS opened,
                   COUNT(DISTINCT recipient_id) FILTER (WHERE type = 'click' AND NOT machine)::int AS clicked
              FROM email_campaign_events WHERE campaign_id = $1 GROUP BY 1 ORDER BY 1 LIMIT 60`, [id]);
        const bySource = await req.db.all(`
            SELECT source, COUNT(*)::int AS recipients,
                   COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened,
                   COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::int AS clicked
              FROM email_campaign_recipients WHERE campaign_id = $1 GROUP BY source ORDER BY 2 DESC`, [id]);
        const settings = await svc.settings(req.db);
        res.json({
            campaign, links, days, by_source: bySource,
            missing: campaign.status === 'draft' ? svc.readiness(campaign, { postalAddress: settings.postal_address }) : [],
        });
    } catch (err) { fail(res, err, 'Loading the email'); }
});

router.put('/:id', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const existing = id && await req.db.get('SELECT status FROM email_campaigns WHERE id = $1', [id]);
        if (!existing) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        if (existing.status !== 'draft') {
            return res.status(409).json({ error: 'Already sent', message: 'Only a draft can be changed. Put a scheduled email back to draft first, or duplicate a sent one.' });
        }
        const { values, errors } = svc.clean(req.body || {});
        if (errors.length) return res.status(400).json({ error: 'Check the email', message: errors.join(' '), errors });
        await req.db.run(
            `UPDATE email_campaigns SET ${svc.FIELDS.map((f, i) => `${f} = $${i + 2}`).join(', ')}, updated_at = now() WHERE id = $1`,
            [id, ...svc.FIELDS.map(f => stored(values, f))]);
        res.json({ campaign: await loadOne(req.db, id) });
    } catch (err) { fail(res, err, 'Saving the email'); }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const c = id && await loadOne(req.db, id);
        if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        if (!['draft', 'cancelled'].includes(c.status) || c.stats.sent > 0) {
            return res.status(409).json({ error: 'Cannot delete', message: 'An email that reached people is kept with its figures.' });
        }
        await req.db.run('DELETE FROM email_campaigns WHERE id = $1', [id]);
        res.json({ deleted: id });
    } catch (err) { fail(res, err, 'Deleting the email'); }
});

router.post('/:id/duplicate', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const c = id && await req.db.get('SELECT * FROM email_campaigns WHERE id = $1', [id]);
        if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        const { values } = svc.clean(svc.shape(c));
        values.name = `${values.name} (copy)`.slice(0, 140);
        values.excluded = [];
        const cols = [...svc.FIELDS, 'created_by'];
        const row = await req.db.get(
            `INSERT INTO email_campaigns (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id`,
            [...svc.FIELDS.map(f => stored(values, f)), req.user.id]);
        res.status(201).json({ campaign: await loadOne(req.db, row.id) });
    } catch (err) { fail(res, err, 'Copying the email'); }
});

router.post('/:id/test', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const c = id && await req.db.get('SELECT * FROM email_campaigns WHERE id = $1', [id]);
        if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        const raw = Array.isArray(req.body?.to) ? req.body.to : String(req.body?.to || req.user.email || '').split(/[\s,;]+/);
        const to = [...new Set(raw.map(svc.lower).filter(e => svc.EMAIL_RE.test(e)))].slice(0, 5);
        if (!to.length) return res.status(400).json({ error: 'No address', message: 'Give the address the test goes to.' });
        const shaped = svc.shape(c);
        const missing = svc.readiness(shaped, { postalAddress: 'test' }).filter(m => !m.startsWith('the school'));
        if (missing.length) return res.status(400).json({ error: 'Not ready', message: `Before a test, add ${missing.join(', ')}.` });
        const sent = await sender.sendTest(req.db, c, { to, lang: req.body?.lang, firstName: req.user.first_name || '' });
        res.json({ sent });
    } catch (err) {
        console.error('Email test error:', err.message);
        res.status(502).json({ error: 'Test not sent', message: `The test could not be sent: ${String(err.reason || err.message).replace(/^Brevo email failed:\s*/, '').slice(0, 200)}` });
    }
});

/** Send now or later: the audience is read, each person gets their token, the links are fixed. */
router.post('/:id/send', async (req, res) => {
    try {
        const db = req.db;
        const id = idOf(req.params.id);
        const c = id && await db.get('SELECT * FROM email_campaigns WHERE id = $1', [id]);
        if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        if (c.status !== 'draft') return res.status(409).json({ error: 'Already sent', message: 'This email has already been sent or scheduled.' });

        let when = null;
        if (req.body?.scheduled_at) {
            when = new Date(req.body.scheduled_at);
            if (Number.isNaN(when.getTime())) return res.status(400).json({ error: 'Invalid date', message: 'The sending time is not a valid date.' });
            if (when.getTime() < Date.now() + 60e3) when = null; // a time in the past (or in a minute): now
            else if (when.getTime() > Date.now() + 90 * 86400e3) return res.status(400).json({ error: 'Too far', message: 'Schedule it within the next 90 days.' });
        }
        const shaped = svc.shape(c);
        const { people } = await svc.audienceOf(db, shaped.audience, shaped.excluded);
        const settings = await svc.settings(db);
        const missing = svc.readiness(shaped, { postalAddress: settings.postal_address, recipients: people.length });
        if (missing.length) return res.status(400).json({ error: 'Not ready', message: `Before sending, add ${missing.join(', ')}.`, missing });

        // Only one sending of a campaign, even after two quick clicks.
        const claimed = await db.run(
            `UPDATE email_campaigns SET status = $2, scheduled_at = $3, started_at = $4, updated_at = now() WHERE id = $1 AND status = 'draft'`,
            [id, when ? 'scheduled' : 'sending', when ? when.toISOString() : null, when ? null : new Date().toISOString()]);
        if (!claimed.rowCount) return res.status(409).json({ error: 'Already sent', message: 'This email has already been sent or scheduled.' });

        try {
            await db.run('DELETE FROM email_campaign_links WHERE campaign_id = $1', [id]);
            const links = linksOf(svc.contentOf(c));
            for (let i = 0; i < links.length; i++) {
                await db.run('INSERT INTO email_campaign_links (campaign_id, idx, url, label) VALUES ($1, $2, $3, $4)', [id, i + 1, links[i].url, links[i].label]);
            }
            for (let i = 0; i < people.length; i += 200) {
                const chunk = people.slice(i, i + 200);
                const params = [];
                const tuples = chunk.map((p) => {
                    params.push(id, p.email, p.name || null, svc.langFor(shaped, p), p.source, svc.token());
                    const n = params.length;
                    return `($${n - 5}, $${n - 4}, $${n - 3}, $${n - 2}, $${n - 1}, $${n})`;
                });
                await db.run(
                    `INSERT INTO email_campaign_recipients (campaign_id, email, name, lang, source, token) VALUES ${tuples.join(', ')}
                     ON CONFLICT DO NOTHING`, params);
            }
        } catch (err) {
            // Nothing half-prepared stays: back to draft.
            await db.run("DELETE FROM email_campaign_recipients WHERE campaign_id = $1 AND status = 'queued'", [id]);
            await db.run("UPDATE email_campaigns SET status = 'draft', scheduled_at = NULL, started_at = NULL WHERE id = $1", [id]);
            throw err;
        }
        res.json({ campaign: await loadOne(db, id) });
    } catch (err) { fail(res, err, 'Sending the email'); }
});

/** A change of state that only some states allow. */
function transition(path, from, to, { done, extra } = {}) {
    router.post(`/:id/${path}`, async (req, res) => {
        try {
            const id = idOf(req.params.id);
            const c = id && await req.db.get('SELECT status FROM email_campaigns WHERE id = $1', [id]);
            if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
            if (!from.includes(c.status)) return res.status(409).json({ error: 'Not possible', message: `This email is ${c.status}: it cannot be ${done} now.` });
            await req.db.run(`UPDATE email_campaigns SET status = $2, updated_at = now()${extra ? `, ${extra}` : ''} WHERE id = $1`, [id, to]);
            if (path === 'cancel' || path === 'unschedule') {
                await req.db.run(
                    `${path === 'cancel' ? "UPDATE email_campaign_recipients SET status = 'skipped', error = 'Campaign cancelled'" : 'DELETE FROM email_campaign_recipients'}
                     WHERE campaign_id = $1 AND status = 'queued'`, [id]);
            }
            res.json({ campaign: await loadOne(req.db, id) });
        } catch (err) { fail(res, err, 'Changing the email'); }
    });
}
transition('pause', ['sending'], 'paused', { done: 'paused' });
transition('resume', ['paused'], 'sending', { done: 'resumed', extra: 'started_at = COALESCE(started_at, now())' });
transition('cancel', ['sending', 'paused', 'scheduled'], 'cancelled', { done: 'cancelled', extra: 'finished_at = now()' });
transition('unschedule', ['scheduled'], 'draft', { done: 'put back to draft', extra: 'scheduled_at = NULL' });

/** The failed ones (and the interrupted ones) go back in the queue. */
router.post('/:id/retry', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const c = id && await req.db.get('SELECT status FROM email_campaigns WHERE id = $1', [id]);
        if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        if (!['sending', 'paused', 'sent'].includes(c.status)) return res.status(409).json({ error: 'Not possible', message: 'Only a sent email can retry its failed deliveries.' });
        const done = await req.db.run(
            `UPDATE email_campaign_recipients SET status = 'queued', error = NULL, claimed_at = NULL
              WHERE campaign_id = $1 AND status = 'failed'
                AND lower(email) NOT IN (SELECT email FROM email_suppressions)`, [id]);
        if (done.rowCount) await req.db.run("UPDATE email_campaigns SET status = 'sending', finished_at = NULL, updated_at = now() WHERE id = $1", [id]);
        res.json({ retried: done.rowCount, campaign: await loadOne(req.db, id) });
    } catch (err) { fail(res, err, 'Retrying'); }
});

router.get('/:id/recipients', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        if (!id) return res.status(404).json({ error: 'Not found' });
        const where = ['campaign_id = $1'];
        const params = [id];
        const filter = String(req.query.filter || '');
        if (filter === 'opened') where.push('opened_at IS NOT NULL');
        else if (filter === 'clicked') where.push('clicked_at IS NOT NULL');
        else if (filter === 'unsubscribed') where.push('unsubscribed_at IS NOT NULL');
        else if (filter === 'not_opened') where.push("opened_at IS NULL AND status IN ('sent', 'delivered')");
        else if (['queued', 'sent', 'delivered', 'failed', 'bounced', 'skipped'].includes(filter)) {
            params.push(filter === 'queued' ? ['queued', 'sending'] : [filter]);
            where.push(`status = ANY($${params.length})`);
        }
        const q = String(req.query.q || '').trim().toLowerCase().slice(0, 100);
        if (q) { params.push(`%${q.replace(/[%_\\]/g, '\\$&')}%`); where.push(`(lower(email) LIKE $${params.length} OR lower(COALESCE(name, '')) LIKE $${params.length})`); }
        const page = Math.max(0, Math.min(1000, Number(req.query.page) || 0));
        const rows = await req.db.all(
            `SELECT id, email, name, lang, source, status, error, sent_at, opened_at, opens, clicked_at, clicks, unsubscribed_at
               FROM email_campaign_recipients WHERE ${where.join(' AND ')} ORDER BY id LIMIT 100 OFFSET ${page * 100}`, params);
        const total = await req.db.get(`SELECT COUNT(*)::int AS n FROM email_campaign_recipients WHERE ${where.join(' AND ')}`, params);
        res.json({ recipients: rows, total: total.n, page });
    } catch (err) { fail(res, err, 'Loading the recipients'); }
});

// ── What people sent through the form ──

router.get('/:id/responses', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        if (!id) return res.status(404).json({ error: 'Not found' });
        const rows = await req.db.all(
            `SELECT r.id, r.name, r.email, r.phone, r.lang, r.answers, r.status, r.notes, r.created_at, r.updated_at, x.source
               FROM email_campaign_responses r LEFT JOIN email_campaign_recipients x ON x.id = r.recipient_id
              WHERE r.campaign_id = $1 ORDER BY r.created_at DESC LIMIT 2000`, [id]);
        const c = await req.db.get('SELECT form FROM email_campaigns WHERE id = $1', [id]);
        res.json({ responses: rows.map(r => ({ ...r, answers: svc.obj(r.answers) })), fields: svc.cleanForm(svc.obj(c?.form)).fields });
    } catch (err) { fail(res, err, 'Loading the answers'); }
});

router.patch('/:id/responses/:rid', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const rid = idOf(req.params.rid);
        if (!id || !rid) return res.status(404).json({ error: 'Not found' });
        const sets = [];
        const params = [id, rid];
        if (req.body?.status !== undefined) {
            if (!svc.RESPONSE_STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status', message: 'Unknown status.' });
            params.push(req.body.status);
            sets.push(`status = $${params.length}`);
        }
        if (req.body?.notes !== undefined) {
            params.push(String(req.body.notes || '').slice(0, 4000) || null);
            sets.push(`notes = $${params.length}`);
        }
        if (!sets.length) return res.status(400).json({ error: 'Nothing to change' });
        const row = await req.db.get(
            `UPDATE email_campaign_responses SET ${sets.join(', ')}, updated_at = now() WHERE campaign_id = $1 AND id = $2 RETURNING *`, params);
        if (!row) return res.status(404).json({ error: 'Not found', message: 'This answer does not exist any more.' });
        res.json({ response: { ...row, answers: svc.obj(row.answers) } });
    } catch (err) { fail(res, err, 'Saving the answer'); }
});

router.delete('/:id/responses/:rid', async (req, res) => {
    try {
        const done = await req.db.run('DELETE FROM email_campaign_responses WHERE campaign_id = $1 AND id = $2', [idOf(req.params.id), idOf(req.params.rid)]);
        if (!done.rowCount) return res.status(404).json({ error: 'Not found' });
        res.json({ deleted: true });
    } catch (err) { fail(res, err, 'Deleting the answer'); }
});

/** A short-lived link to the email itself, for a phone (its browser shows the real thing). */
router.post('/:id/preview-link', async (req, res) => {
    try {
        const id = idOf(req.params.id);
        const c = id && await req.db.get('SELECT id FROM email_campaigns WHERE id = $1', [id]);
        if (!c) return res.status(404).json({ error: 'Not found', message: 'This email campaign does not exist any more.' });
        if (!process.env.JWT_SECRET) return res.status(503).json({ error: 'Unavailable', message: 'Previews need JWT_SECRET on the server.' });
        const lang = ['fr', 'en', 'both'].includes(req.body?.lang) ? req.body.lang : 'fr';
        const t = jwt.sign({ purpose: 'email-preview', cid: id, lang, name: req.user.first_name || '' }, process.env.JWT_SECRET, { expiresIn: '30m' });
        res.json({ url: `${apiUrl()}/api/public/email/preview/${t}` });
    } catch (err) { fail(res, err, 'The preview link'); }
});

module.exports = router;
