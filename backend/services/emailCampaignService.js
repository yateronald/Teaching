/**
 * Email campaigns: what a campaign is made of and its rules, who receives it
 * (students, exam candidates, demo requests, marketing registrations), the
 * addresses that must never receive one again, the form people can answer,
 * and the figures.
 *
 * A campaign:
 *   content   { fr: Words, en: Words }  — the subject, the preview text, the headline,
 *             the message, the key points, the offer's words, the steps, the buttons'
 *             words, the signature, the P.S., and the words of the form page
 *   buttons   { primary: { action, url }, secondary: { action, url } }
 *             action: link (a page), form (the campaign's form), whatsapp (a group), none
 *   offer     { show, regular, promo, currency }
 *   form      { fields: [{ id, type, required, label_fr, label_en, options_fr, options_en }] }
 *   design    see emailDesign.js
 *
 * The audience is a set of filters, read again when the campaign is sent:
 * one person = one address (a student before an exam candidate, a
 * registration, a demo request), and nobody unsubscribed, bounced or removed.
 */
const crypto = require('crypto');
const { hasColumn, hasTable } = require('./schemaFeatures');
const { linksOf, siteUrl, apiUrl } = require('./emailRender');
const emailDesign = require('./emailDesign');

const STATUSES = ['draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled'];
const GOALS = ['news', 'offer', 'group', 'whatsapp', 'event', 'reminder', 'survey'];
const LANGUAGE_MODES = ['auto', 'fr', 'en', 'both'];
const SOURCES = ['students', 'candidates', 'demos', 'registrations'];
const ACTIONS = ['link', 'form', 'whatsapp'];
const SOURCE_ORDER = { student: 0, candidate: 1, registration: 2, demo: 3 };
const DEMO_STATUSES = ['new', 'contacted', 'demo_scheduled', 'completed', 'cancelled'];
const REG_STATUSES = ['new', 'contacted', 'confirmed', 'waitlist', 'cancelled'];
const RESPONSE_STATUSES = ['new', 'contacted', 'done'];
const EXAMS = ['tcf_canada', 'tcf_quebec', 'tcf_tp'];
const FIELD_TYPES = ['name', 'email', 'phone', 'text', 'textarea', 'select', 'radio', 'checkbox', 'date'];
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[^\s@<>()[\]\\,;:"]{1,180}\.[a-z]{2,24}$/i;
const IMAGE_KEY_RE = /^(ai-[a-f0-9]{12}|[a-z0-9][a-z0-9-]{1,60})$/;
// WhatsApp now copies invitations as « https://chat.whatsapp.com/AbC…?mode=ems_copy_t »: the query is allowed (and dropped, see tidyWhatsApp).
const WHATSAPP_RE = /^https:\/\/(chat\.whatsapp\.com\/[A-Za-z0-9]{10,40}|wa\.me\/[0-9]{6,16}|(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]{10,40})\/?(\?[^\s#]*)?$/;
/** A group invitation without what only says how it was copied (« ?mode=… »); other links as they are. */
const tidyWhatsApp = (url) => {
    const m = /^(https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{10,40})\/?(\?[^\s#]*)?$/.exec(String(url || '').trim());
    return m ? m[1] : url;
};
const HTTPS_RE = /^https:\/\/[^\s<>"]{3,}$/i;

/** The words of one language, and their limits. */
const WORD_LIMITS = {
    subject: 160, preheader: 200, eyebrow: 60, headline: 160, body: 6000,
    highlights_title: 80, steps_title: 80, offer_label: 60, offer_note: 140, deadline: 140,
    primary_label: 60, secondary_label: 60, signature: 140, ps: 300,
    form_title: 140, form_intro: 600, form_submit: 40, form_thanks_title: 140, form_thanks_text: 600,
};
const LIST_LIMITS = { highlights: [5, 140], steps: [4, 160] };
const LONG = ['body', 'form_intro', 'form_thanks_text'];

const ready = (db) => hasTable(db, 'email_campaigns');
const lower = (s) => String(s || '').trim().toLowerCase();
const text = (v, max) => {
    if (v === undefined || v === null) return null;
    const t = String(v).replace(/[^\S\n  ]+/g, ' ').replace(/\n/g, ' ').trim();
    return t ? t.slice(0, max) : null;
};
const longText = (v, max) => {
    if (v === undefined || v === null) return null;
    const t = String(v).replace(/\r/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return t ? t.slice(0, max) : null;
};
const list = (v, maxItems, maxLen) => (Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : [])
    .map(x => text(x, maxLen)).filter(Boolean).slice(0, maxItems);
const intList = (v) => (Array.isArray(v) ? v : []).map(Number).filter(n => Number.isInteger(n) && n > 0).slice(0, 200);
const pickList = (v, allowed) => (Array.isArray(v) ? v : []).filter(x => allowed.includes(x));
const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : typeof v === 'string' ? (() => { try { const o = JSON.parse(v); return o && typeof o === 'object' && !Array.isArray(o) ? o : {}; } catch { return {}; } })() : {});
const arr = (v) => (Array.isArray(v) ? v : typeof v === 'string' ? (() => { try { const a = JSON.parse(v); return Array.isArray(a) ? a : []; } catch { return []; } })() : []);
const token = () => crypto.randomBytes(18).toString('base64url');
const firstNameOf = (name) => {
    const first = String(name || '').trim().split(/\s+/)[0] || '';
    return first.length > 1 && first.length <= 40 ? first.charAt(0).toUpperCase() + first.slice(1) : '';
};

// ── Cleaning ───────────────────────────────────────────────────────────────

function cleanWords(raw) {
    const src = obj(raw);
    const w = {};
    for (const [k, max] of Object.entries(WORD_LIMITS)) w[k] = LONG.includes(k) ? longText(src[k], max) : text(src[k], max);
    for (const [k, [n, max]] of Object.entries(LIST_LIMITS)) w[k] = list(src[k], n, max);
    return w;
}

function cleanAudience(a) {
    const src = obj(a);
    const s = (k) => obj(src[k]);
    const days = Number(s('demos').since_days);
    return {
        sources: pickList(src.sources, SOURCES),
        students: { state: ['active', 'inactive', 'all'].includes(s('students').state) ? s('students').state : 'active', batches: intList(s('students').batches) },
        candidates: { exams: pickList(s('candidates').exams, EXAMS) },
        demos: {
            statuses: pickList(s('demos').statuses, DEMO_STATUSES),
            since_days: [30, 90, 180, 365].includes(days) ? days : null,
            interest: ['exam', 'general'].includes(s('demos').interest) ? s('demos').interest : null,
            exclude_students: s('demos').exclude_students !== false,
        },
        registrations: { promotion_ids: intList(s('registrations').promotion_ids), statuses: pickList(s('registrations').statuses, REG_STATUSES) },
    };
}

function cleanButton(raw, { secondary = false } = {}) {
    const src = obj(raw);
    const action = ACTIONS.includes(src.action) ? src.action : (secondary ? 'none' : 'link');
    const url = action === 'link' || action === 'whatsapp' ? text(src.url, 600) : null;
    return { action, url: action === 'whatsapp' && url ? tidyWhatsApp(url) : url };
}

const slug = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 32);

/** The fields of the form: a known type, words in both languages, choices for the lists. */
function cleanForm(raw) {
    const src = obj(raw);
    const seen = new Set();
    const fields = [];
    for (const f of arr(src.fields).slice(0, 12)) {
        const o = obj(f);
        const type = FIELD_TYPES.includes(o.type) ? o.type : 'text';
        let id = slug(o.id || o.label_en || o.label_fr || type) || type;
        while (seen.has(id)) id = `${id}_2`.slice(0, 32);
        seen.add(id);
        const field = {
            id, type, required: o.required === true || ['name', 'email'].includes(type) && o.required !== false,
            label_fr: text(o.label_fr, 120), label_en: text(o.label_en, 120),
        };
        if (['select', 'radio', 'checkbox'].includes(type)) {
            field.options_fr = list(o.options_fr, 12, 80);
            field.options_en = list(o.options_en, 12, 80);
        }
        fields.push(field);
    }
    return { fields };
}

const DEFAULT_FORM_FIELDS = [
    { id: 'name', type: 'name', required: true, label_fr: 'Prénom et nom', label_en: 'First and last name' },
    { id: 'email', type: 'email', required: true, label_fr: 'Adresse email', label_en: 'Email address' },
    { id: 'phone', type: 'phone', required: false, label_fr: 'Téléphone ou WhatsApp', label_en: 'Phone or WhatsApp' },
    { id: 'message', type: 'textarea', required: false, label_fr: 'Votre message', label_en: 'Your message' },
];

const FIELDS = ['name', 'goal', 'language_mode', 'default_lang', 'content', 'buttons', 'offer', 'design', 'form', 'image_key', 'promotion_id', 'audience', 'excluded'];
const JSON_FIELDS = ['content', 'buttons', 'offer', 'design', 'form', 'audience', 'excluded'];

/** A campaign as written by the administrator (or the AI): { values, errors }. */
function clean(body = {}) {
    const content = obj(body.content);
    const offer = obj(body.offer);
    const v = {
        name: text(body.name, 140),
        goal: GOALS.includes(body.goal) ? body.goal : 'news',
        language_mode: LANGUAGE_MODES.includes(body.language_mode) ? body.language_mode : 'auto',
        default_lang: body.default_lang === 'en' ? 'en' : 'fr',
        content: { fr: cleanWords(content.fr), en: cleanWords(content.en) },
        buttons: { primary: cleanButton(obj(body.buttons).primary), secondary: cleanButton(obj(body.buttons).secondary, { secondary: true }) },
        offer: {
            show: offer.show === true,
            regular: Number.isFinite(Number(offer.regular)) && offer.regular !== null && offer.regular !== '' && Number(offer.regular) >= 0 ? Math.round(Number(offer.regular) * 100) / 100 : null,
            promo: Number.isFinite(Number(offer.promo)) && offer.promo !== null && offer.promo !== '' && Number(offer.promo) >= 0 ? Math.round(Number(offer.promo) * 100) / 100 : null,
            currency: ['CAD', 'USD', 'EUR'].includes(offer.currency) ? offer.currency : 'CAD',
        },
        design: emailDesign.clean(obj(body.design)).design,
        form: cleanForm(body.form),
        image_key: text(body.image_key, 80),
        promotion_id: Number.isInteger(Number(body.promotion_id)) && Number(body.promotion_id) > 0 ? Number(body.promotion_id) : null,
        audience: cleanAudience(body.audience),
        excluded: [...new Set(arr(body.excluded).map(lower).filter(e => EMAIL_RE.test(e)))].slice(0, 5000),
    };
    // A form button without fields gets the usual ones (name, email, phone, message).
    const usesForm = ['primary', 'secondary'].some(k => v.buttons[k].action === 'form');
    if (usesForm && !v.form.fields.length) v.form = cleanForm({ fields: DEFAULT_FORM_FIELDS });
    if (!v.name) v.name = (v.content.fr.subject || v.content.en.subject || v.content.fr.headline || v.content.en.headline || 'Email').slice(0, 140);

    // Each problem with a code (the editors say it in the administrator's language) and an English sentence.
    const errors = [];
    const issues = [];
    const problem = (code, extra, message) => {
        if (errors.includes(message)) return;
        errors.push(message);
        issues.push({ code, ...extra });
    };
    for (const k of ['primary', 'secondary']) {
        const b = v.buttons[k];
        const which = k === 'primary' ? 'main button' : 'second button';
        if (b.action === 'link' && b.url && !HTTPS_RE.test(b.url)) problem('LINK_HTTPS', { button: k }, `The ${which}'s link must start with https://.`);
        if (b.action === 'whatsapp' && b.url && !WHATSAPP_RE.test(b.url)) problem('WHATSAPP_LINK', { button: k }, `The ${which}'s WhatsApp link must be a group invitation (https://chat.whatsapp.com/…).`);
    }
    if (usesForm) {
        if (!v.form.fields.some(f => f.type === 'email')) problem('FORM_EMAIL', {}, 'The form needs an email field (to answer the person).');
        for (const f of v.form.fields) {
            if (!f.label_fr && !f.label_en) problem('FIELD_LABEL', { field: f.id }, `Every form field needs a label (field « ${f.id} »).`);
            if (['select', 'radio', 'checkbox'].includes(f.type) && !(f.options_fr?.length || f.options_en?.length)) {
                problem('FIELD_CHOICES', { field: f.label_en || f.label_fr || f.id, field_fr: f.label_fr || f.label_en || f.id }, `The field « ${f.label_en || f.label_fr || f.id} » needs choices.`);
            }
        }
    }
    if (v.image_key && !IMAGE_KEY_RE.test(v.image_key)) problem('PICTURE', {}, 'Unknown picture.');
    return { values: v, errors, issues };
}

/** The languages a campaign is written for, as its recipients will read it. */
function languagesNeeded(c) {
    if (c.language_mode === 'fr') return ['fr'];
    if (c.language_mode === 'en') return ['en'];
    if (c.language_mode === 'both') return ['fr', 'en'];
    return [c.default_lang === 'en' ? 'en' : 'fr'];
}

/** What is missing before a campaign can be sent (in the administrator's words). */
function readiness(c, { postalAddress, recipients } = {}) {
    const missing = [];
    for (const lang of languagesNeeded(c)) {
        const name = lang === 'fr' ? 'French' : 'English';
        const w = c.content?.[lang] || {};
        if (!w.subject) missing.push(`a subject in ${name}`);
        if (!w.body) missing.push(`a message in ${name}`);
    }
    const p = c.buttons?.primary || {};
    if (p.action === 'link' && !p.url) missing.push('the main button’s link');
    if (p.action === 'whatsapp' && !p.url) missing.push('the WhatsApp group link');
    const s = c.buttons?.secondary || {};
    if (s.action === 'link' && !s.url) missing.push('the second button’s link');
    if (s.action === 'whatsapp' && !s.url) missing.push('the second button’s WhatsApp link');
    if (!String(postalAddress || '').trim()) missing.push('the school’s postal address (Sender details), required by Canada’s anti-spam law');
    if (recipients !== undefined && recipients < 1) missing.push('at least one recipient');
    return missing;
}

// ── Settings ───────────────────────────────────────────────────────────────

const SETTING_KEYS = ['postal_address', 'reply_to', 'sender_name'];
async function settings(db) {
    const rows = await db.all('SELECT key, value FROM email_settings WHERE key = ANY($1)', [SETTING_KEYS]);
    const out = { postal_address: '', reply_to: '', sender_name: '' };
    for (const r of rows) out[r.key] = r.value || '';
    return out;
}
async function saveSettings(db, body = {}) {
    const v = {
        postal_address: text(body.postal_address, 240) || '',
        reply_to: lower(body.reply_to).slice(0, 254),
        sender_name: text(body.sender_name, 80) || '',
    };
    if (v.reply_to && !EMAIL_RE.test(v.reply_to)) return { errors: ['The reply address is not a valid email.'] };
    for (const key of SETTING_KEYS) {
        if (body[key] === undefined) continue;
        await db.run(
            `INSERT INTO email_settings (key, value, updated_at) VALUES ($1, $2, now())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [key, v[key]]);
    }
    return { settings: await settings(db) };
}

// ── The audience ───────────────────────────────────────────────────────────

async function audienceOf(db, audience, excluded = []) {
    const a = cleanAudience(audience);
    const rows = [];

    if (a.sources.includes('students')) {
        const where = ["u.role = 'student'", "COALESCE(u.email, '') <> ''"];
        const params = [];
        if (a.students.state === 'active') where.push('u.is_active = true');
        if (a.students.state === 'inactive') where.push('u.is_active = false');
        if (a.students.batches.length) {
            params.push(a.students.batches);
            where.push(`EXISTS (SELECT 1 FROM batch_students bs WHERE bs.student_id = u.id AND bs.batch_id = ANY($${params.length}))`);
        }
        for (const r of await db.all(`SELECT u.email, TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS name, u.first_name FROM users u WHERE ${where.join(' AND ')}`, params)) {
            rows.push({ email: r.email, name: r.name, first_name: r.first_name, lang: null, source: 'student' });
        }
    }
    if (a.sources.includes('candidates')) {
        const params = [];
        let exam = '';
        if (a.candidates.exams.length && await hasTable(db, 'exam_candidate_profiles')) {
            params.push(a.candidates.exams);
            exam = ` AND COALESCE((SELECT p.target_exam FROM exam_candidate_profiles p WHERE p.user_id = u.id), 'tcf_canada') = ANY($1)`;
        }
        for (const r of await db.all(`SELECT u.email, TRIM(CONCAT(u.first_name, ' ', u.last_name)) AS name, u.first_name FROM users u
                                       WHERE u.role = 'candidate' AND u.is_active = true AND COALESCE(u.email, '') <> ''${exam}`, params)) {
            rows.push({ email: r.email, name: r.name, first_name: r.first_name, lang: null, source: 'candidate' });
        }
    }
    if (a.sources.includes('registrations') && await hasTable(db, 'promotion_registrations')) {
        const where = ["COALESCE(r.email, '') <> ''"];
        const params = [];
        if (a.registrations.promotion_ids.length) { params.push(a.registrations.promotion_ids); where.push(`r.promotion_id = ANY($${params.length})`); }
        if (a.registrations.statuses.length) { params.push(a.registrations.statuses); where.push(`r.status = ANY($${params.length})`); }
        for (const r of await db.all(`SELECT r.email, r.full_name AS name, r.language FROM promotion_registrations r WHERE ${where.join(' AND ')}`, params)) {
            rows.push({ email: r.email, name: r.name, first_name: firstNameOf(r.name), lang: ['fr', 'en'].includes(r.language) ? r.language : null, source: 'registration' });
        }
    }
    if (a.sources.includes('demos') && await hasTable(db, 'demo_requests')) {
        const where = ["COALESCE(d.email, '') <> ''"];
        const params = [];
        if (a.demos.statuses.length) { params.push(a.demos.statuses); where.push(`d.status = ANY($${params.length})`); }
        if (a.demos.since_days) { params.push(a.demos.since_days); where.push(`COALESCE(d.created_at, d.submitted_at) >= now() - make_interval(days => $${params.length})`); }
        if (a.demos.interest === 'exam') where.push("d.interest = 'exam'");
        if (a.demos.interest === 'general') where.push("COALESCE(d.interest, 'general') <> 'exam'");
        if (a.demos.exclude_students) where.push("NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = lower(d.email) AND u.role IN ('student', 'candidate'))");
        const interest = (await hasColumn(db, 'demo_requests', 'interest')) ? 'd.interest' : "'general'";
        for (const r of await db.all(`SELECT d.email, d.full_name AS name FROM demo_requests d WHERE ${where.join(' AND ').replace(/d\.interest/g, interest)}`, params)) {
            rows.push({ email: r.email, name: r.name, first_name: firstNameOf(r.name), lang: null, source: 'demo' });
        }
    }

    const byEmail = new Map();
    let invalid = 0;
    for (const r of rows) {
        const email = lower(r.email);
        if (!EMAIL_RE.test(email)) { invalid++; continue; }
        const seen = byEmail.get(email);
        if (!seen || SOURCE_ORDER[r.source] < SOURCE_ORDER[seen.source]) {
            byEmail.set(email, { email, name: text(r.name, 160) || '', first_name: firstNameOf(r.first_name || r.name), lang: r.lang || seen?.lang || null, source: r.source });
        } else if (!seen.lang && r.lang) seen.lang = r.lang;
    }
    const all = [...byEmail.values()];
    const skip = new Set((excluded || []).map(lower));
    const suppressed = all.length
        ? new Set((await db.all('SELECT email FROM email_suppressions WHERE email = ANY($1)', [all.map(p => p.email)])).map(r => r.email))
        : new Set();
    const people = all.filter(p => !skip.has(p.email) && !suppressed.has(p.email))
        .sort((x, y) => SOURCE_ORDER[x.source] - SOURCE_ORDER[y.source] || x.email.localeCompare(y.email));
    const bySource = { student: 0, candidate: 0, registration: 0, demo: 0 };
    for (const p of people) bySource[p.source]++;
    return {
        people,
        counts: {
            total: people.length, by_source: bySource,
            suppressed: all.filter(p => suppressed.has(p.email)).length,
            excluded: all.filter(p => skip.has(p.email)).length,
            duplicates: rows.length - invalid - all.length, invalid,
        },
    };
}

function langFor(c, person) {
    if (c.language_mode === 'both') return 'both';
    if (c.language_mode === 'fr' || c.language_mode === 'en') return c.language_mode;
    return person.lang || (c.default_lang === 'en' ? 'en' : 'fr');
}

// ── Tracking links ─────────────────────────────────────────────────────────

const publicBase = () => `${apiUrl()}/api/public/email`;
const urls = (tok) => ({
    open: `${publicBase()}/o/${tok}.gif`,
    view: `${publicBase()}/v/${tok}`,
    unsubscribe: `${publicBase()}/u/${tok}`,
    click: (idx) => `${publicBase()}/c/${tok}/${idx}`,
});

function withUtm(url, campaign) {
    try {
        const u = new URL(url);
        const ours = [new URL(siteUrl()).hostname.replace(/^www\./, ''), 'learnfrenchwithnatives.com'];
        if (!ours.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`))) return url;
        if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', 'email');
        if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'email');
        if (!u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', `email-${campaign.id}`);
        return u.toString();
    } catch { return url; }
}

function machineLike(userAgent, sentAt) {
    if (/bot|crawl|spider|scan|preview|barracuda|mimecast|proofpoint|safelinks|bingpreview|headless|python|curl|wget|java\//i.test(String(userAgent || ''))) return true;
    return !!sentAt && Date.now() - new Date(sentAt).getTime() < 8000;
}

// ── Shapes and figures ─────────────────────────────────────────────────────

const STATS_SQL = `
    SELECT campaign_id,
           COUNT(*)::int AS recipients,
           COUNT(*) FILTER (WHERE status IN ('queued', 'sending'))::int AS queued,
           COUNT(*) FILTER (WHERE status IN ('sent', 'delivered'))::int AS sent,
           COUNT(*) FILTER (WHERE status = 'delivered')::int AS delivered,
           COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
           COUNT(*) FILTER (WHERE status = 'bounced')::int AS bounced,
           COUNT(*) FILTER (WHERE status = 'skipped')::int AS skipped,
           COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::int AS opened,
           COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::int AS clicked,
           COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::int AS unsubscribed,
           MAX(sent_at) AS last_sent_at
      FROM email_campaign_recipients`;

function statsOf(row, responses = 0) {
    const s = {
        recipients: row?.recipients || 0, queued: row?.queued || 0, sent: row?.sent || 0, delivered: row?.delivered || 0,
        failed: row?.failed || 0, bounced: row?.bounced || 0, skipped: row?.skipped || 0,
        opened: row?.opened || 0, clicked: row?.clicked || 0, unsubscribed: row?.unsubscribed || 0,
        responses: Number(responses) || 0, last_sent_at: row?.last_sent_at || null,
    };
    const base = s.sent + s.bounced;
    s.open_rate = base ? s.opened / base : null;
    s.click_rate = base ? s.clicked / base : null;
    s.unsubscribe_rate = base ? s.unsubscribed / base : null;
    s.response_rate = base ? s.responses / base : null;
    s.progress = s.recipients ? (s.recipients - s.queued) / s.recipients : 0;
    return s;
}

/** A row from the table → the campaign as the API and the renderer read it. */
function contentOf(c) {
    const { values } = clean({ ...c, content: obj(c.content), buttons: obj(c.buttons), offer: obj(c.offer), design: obj(c.design), form: obj(c.form), audience: obj(c.audience), excluded: arr(c.excluded) });
    return { ...values, id: c.id };
}

function shape(c, stats, responses) {
    const v = contentOf(c);
    return {
        id: c.id, status: c.status, ...v,
        scheduled_at: c.scheduled_at || null, started_at: c.started_at || null, finished_at: c.finished_at || null,
        note: c.note || null, created_at: c.created_at, updated_at: c.updated_at,
        stats: statsOf(stats, responses),
    };
}

module.exports = {
    STATUSES, GOALS, LANGUAGE_MODES, SOURCES, ACTIONS, DEMO_STATUSES, REG_STATUSES, RESPONSE_STATUSES, EXAMS, FIELD_TYPES,
    EMAIL_RE, WHATSAPP_RE, HTTPS_RE, tidyWhatsApp, WORD_LIMITS, DEFAULT_FORM_FIELDS, FIELDS, JSON_FIELDS, STATS_SQL,
    ready, clean, cleanWords, cleanForm, cleanAudience, languagesNeeded, readiness, settings, saveSettings,
    audienceOf, langFor, urls, withUtm, machineLike, shape, statsOf, contentOf, token, firstNameOf, lower, linksOf, obj, arr,
};
