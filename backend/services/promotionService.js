/**
 * Marketing campaigns (promotions): what the admin console and the public site
 * share. A campaign is written once, in the admin console; the public site
 * reads the live ones and shows them where the administrator chose.
 *
 * Tables: migrations/026_promotions.sql.
 */
const { hasTable } = require('./schemaFeatures');

const KINDS = ['group_class', 'offer', 'event', 'announcement'];
const STATUSES = ['draft', 'published', 'paused', 'archived'];
const AUDIENCES = ['general', 'beginner', 'conversation', 'tcf', 'tef', 'delf', 'business', 'kids'];
const THEMES = ['navy', 'bordeaux', 'gold', 'forest', 'plum'];
const CURRENCIES = ['CAD', 'USD', 'EUR'];
const REGISTRATION_MODES = ['form', 'link', 'none'];
const REGISTRATION_STATUSES = ['new', 'contacted', 'confirmed', 'waitlist', 'cancelled'];
/** Registrations that hold a seat. */
const SEATED = ['new', 'contacted', 'confirmed'];
/**
 * Whether the site shows the seats: "auto" (and "always", its older twin) shows
 * « 12 places restantes sur 40 » with a bar that fills as the group does;
 * "never" shows nothing (a full group still says so).
 */
const SEATS_DISPLAY = ['auto', 'always', 'never'];
/** Where a campaign can be seen or clicked on the site. */
const PLACEMENTS = ['bar', 'home', 'flash', 'learn', 'offers', 'link'];
const LANGS = ['en', 'fr'];

/** True once migration 026 has run. */
const ready = (db) => hasTable(db, 'promotions');

/** Columns read for every campaign: dates as plain text, so no time zone moves them. */
const COLUMNS = `p.*,
    to_char(p.class_starts_on, 'YYYY-MM-DD') AS class_starts,
    to_char(p.class_ends_on, 'YYYY-MM-DD') AS class_ends`;

/** Registration counts of each campaign, joined as `r`. */
const COUNTS_JOIN = `
    LEFT JOIN (
        SELECT promotion_id,
               COUNT(*)::int AS registrations,
               COUNT(*) FILTER (WHERE status = 'new')::int AS new_registrations,
               COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'confirmed'))::int AS seats_taken,
               COUNT(*) FILTER (WHERE status = 'waitlist')::int AS waitlist,
               MAX(created_at) AS last_registration_at
          FROM promotion_registrations GROUP BY promotion_id
    ) r ON r.promotion_id = p.id`;

/** "A B  C" → "A B C", cut to `max`; empty → null. No-break spaces (French typography: « 19 h », « : ») are kept. */
function text(value, max) {
    if (value === undefined || value === null) return null;
    const s = String(value).replace(/[^\S\u00a0\u202f]+/g, ' ').trim();
    return s ? s.slice(0, max) : null;
}
/** Like text(), but keeps the line breaks of a paragraph. */
function longText(value, max) {
    if (value === undefined || value === null) return null;
    const s = String(value).replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    return s ? s.slice(0, max) : null;
}
function list(value, maxItems, maxLength) {
    if (!Array.isArray(value)) return [];
    return value.map(v => text(v, maxLength)).filter(Boolean).slice(0, maxItems);
}
function money(value) {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n < 1e8 ? Math.round(n * 100) / 100 : NaN;
}
function day(value) {
    if (!value) return null;
    const s = String(value).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) ? s : NaN;
}
function moment(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? NaN : d.toISOString();
}
const isBad = (v) => typeof v === 'number' && Number.isNaN(v);

/**
 * Reads a campaign from a request body. Returns the values to store and the
 * list of what is wrong, in sentences an administrator can act on.
 */
function clean(body = {}) {
    const errors = [];
    const v = {
        kind: KINDS.includes(body.kind) ? body.kind : 'group_class',
        title_en: text(body.title_en, 140),
        title_fr: text(body.title_fr, 140),
        tagline_en: text(body.tagline_en, 220),
        tagline_fr: text(body.tagline_fr, 220),
        description_en: longText(body.description_en, 4000),
        description_fr: longText(body.description_fr, 4000),
        highlights_en: list(body.highlights_en, 6, 120),
        highlights_fr: list(body.highlights_fr, 6, 120),
        cta_en: text(body.cta_en, 40),
        cta_fr: text(body.cta_fr, 40),
        badge_en: text(body.badge_en, 30),
        badge_fr: text(body.badge_fr, 30),
        audience: AUDIENCES.includes(body.audience) ? body.audience : 'general',
        level: text(body.level, 20),
        class_starts_on: day(body.class_starts_on),
        class_ends_on: day(body.class_ends_on),
        schedule_en: text(body.schedule_en, 160),
        schedule_fr: text(body.schedule_fr, 160),
        teacher_name: text(body.teacher_name, 120),
        seat_limit: body.seat_limit === null || body.seat_limit === undefined || body.seat_limit === '' ? null : Number(body.seat_limit),
        // Older apps only know show_seats: false still hides the count.
        seats_display: SEATS_DISPLAY.includes(body.seats_display) ? body.seats_display : (body.show_seats === false ? 'never' : 'auto'),
        // People registered outside the site (phone, WhatsApp, in person): real seats, counted as taken.
        seats_offline: body.seats_offline === undefined || body.seats_offline === null || body.seats_offline === '' ? 0 : Number(body.seats_offline),
        price_regular: money(body.price_regular),
        price_promo: money(body.price_promo),
        currency: CURRENCIES.includes(body.currency) ? body.currency : 'CAD',
        price_note_en: text(body.price_note_en, 120),
        price_note_fr: text(body.price_note_fr, 120),
        starts_at: moment(body.starts_at) || new Date().toISOString(),
        ends_at: moment(body.ends_at),
        show_countdown: body.show_countdown !== false,
        place_bar: body.place_bar === true,
        place_home: body.place_home !== false,
        place_flash: body.place_flash === true,
        place_learn: body.place_learn !== false,
        priority: Number.isFinite(Number(body.priority)) ? Math.max(-100, Math.min(100, Math.round(Number(body.priority)))) : 0,
        theme: THEMES.includes(body.theme) ? body.theme : 'navy',
        image_key: /^[a-z0-9-]{1,80}$/.test(String(body.image_key || '')) ? String(body.image_key) : null,
        registration_mode: REGISTRATION_MODES.includes(body.registration_mode) ? body.registration_mode : 'form',
        cta_url: text(body.cta_url, 500),
    };

    if (!v.title_en && !v.title_fr) errors.push('Give the campaign a title, in English or in French.');
    if (isBad(v.class_starts_on) || isBad(v.class_ends_on)) errors.push('The class dates are not valid dates.');
    else if (v.class_starts_on && v.class_ends_on && v.class_ends_on < v.class_starts_on) errors.push('The class cannot end before it starts.');
    if (isBad(v.starts_at) || isBad(v.ends_at)) errors.push('The dates of the campaign are not valid.');
    else if (v.ends_at && v.ends_at <= v.starts_at) errors.push('The campaign must end after it starts.');
    if (v.seat_limit !== null && !(Number.isInteger(v.seat_limit) && v.seat_limit > 0 && v.seat_limit <= 100000)) errors.push('The number of seats must be a whole number above zero (or empty for no limit).');
    if (!(Number.isInteger(v.seats_offline) && v.seats_offline >= 0 && v.seats_offline <= 100000)) errors.push('The seats taken outside the site must be a whole number (0 or more).');
    else if (v.seat_limit === null) v.seats_offline = 0;
    else if (v.seats_offline > v.seat_limit) errors.push('The seats taken outside the site cannot be more than the seats of the group.');
    v.show_seats = v.seats_display !== 'never';
    if (isBad(v.price_regular) || isBad(v.price_promo)) errors.push('A price must be a number.');
    else if (v.price_regular !== null && v.price_promo !== null && v.price_promo > v.price_regular) errors.push('The campaign price cannot be higher than the regular price.');
    if (v.registration_mode === 'link') {
        if (!v.cta_url || !/^(https:\/\/|\/)[^\s]*$/i.test(v.cta_url)) errors.push('The button link must start with https:// (or with / for a page of this site).');
    } else {
        v.cta_url = null;
    }
    return { values: v, errors };
}

/** Where a campaign stands today. */
function stateOf(p, now = Date.now()) {
    if (p.status !== 'published') return p.status;         // draft, paused, archived
    if (new Date(p.starts_at).getTime() > now) return 'scheduled';
    if (p.ends_at && new Date(p.ends_at).getTime() <= now) return 'ended';
    return 'live';
}

/** A web-safe name from a title: "Groupe TCF – janvier !" → "groupe-tcf-janvier". */
function slugify(title) {
    return String(title || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        .slice(0, 60).replace(/-+$/, '') || 'campaign';
}
/** A slug nobody uses yet. */
async function freeSlug(db, title) {
    const base = slugify(title);
    for (let n = 1; n < 200; n++) {
        const candidate = n === 1 ? base : `${base}-${n}`;
        const taken = await db.get('SELECT 1 AS ok FROM promotions WHERE lower(slug) = lower($1)', [candidate]);
        if (!taken) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
}

const num = (v) => (v === null || v === undefined ? null : Number(v));
const arr = (v) => (Array.isArray(v) ? v : []);

/** The words of a campaign in one language, falling back on the other one. */
function wordsIn(p, lang) {
    const other = lang === 'en' ? 'fr' : 'en';
    const pick = (field) => p[`${field}_${lang}`] || p[`${field}_${other}`] || null;
    const highlights = arr(p[`highlights_${lang}`]).length ? arr(p[`highlights_${lang}`]) : arr(p[`highlights_${other}`]);
    return {
        title: pick('title'), tagline: pick('tagline'), description: pick('description'), highlights,
        cta: pick('cta'), badge: pick('badge'), schedule: pick('schedule'), price_note: pick('price_note'),
    };
}

/** What the admin console receives: every field, plus the state and the counts. */
/** The seats of a campaign: registered on the site, outside it, in all, and what is left. */
function seatsOf(p) {
    const online = p.seats_taken || 0;
    const offline = p.seat_limit ? Math.max(0, Number(p.seats_offline) || 0) : 0;
    const taken = online + offline;
    const display = SEATS_DISPLAY.includes(p.seats_display) ? p.seats_display : (p.show_seats === false ? 'never' : 'auto');
    return { online, offline, taken, left: p.seat_limit ? Math.max(0, p.seat_limit - taken) : null, display };
}

function adminShape(p) {
    const seats = seatsOf(p);
    return {
        id: p.id, slug: p.slug, kind: p.kind, status: p.status, state: stateOf(p),
        title_en: p.title_en, title_fr: p.title_fr, tagline_en: p.tagline_en, tagline_fr: p.tagline_fr,
        description_en: p.description_en, description_fr: p.description_fr,
        highlights_en: arr(p.highlights_en), highlights_fr: arr(p.highlights_fr),
        cta_en: p.cta_en, cta_fr: p.cta_fr, badge_en: p.badge_en, badge_fr: p.badge_fr,
        audience: p.audience, level: p.level,
        class_starts_on: p.class_starts || null, class_ends_on: p.class_ends || null,
        schedule_en: p.schedule_en, schedule_fr: p.schedule_fr, teacher_name: p.teacher_name,
        seat_limit: p.seat_limit, show_seats: seats.display !== 'never', seats_display: seats.display, seats_offline: seats.offline,
        price_regular: num(p.price_regular), price_promo: num(p.price_promo), currency: p.currency,
        price_note_en: p.price_note_en, price_note_fr: p.price_note_fr,
        starts_at: p.starts_at, ends_at: p.ends_at, show_countdown: p.show_countdown,
        place_bar: p.place_bar, place_home: p.place_home, place_flash: p.place_flash, place_learn: p.place_learn,
        priority: p.priority, theme: p.theme, image_key: p.image_key,
        registration_mode: p.registration_mode, cta_url: p.cta_url,
        created_at: p.created_at, updated_at: p.updated_at,
        registrations: p.registrations || 0,
        new_registrations: p.new_registrations || 0,
        // All the seats taken (on the site and outside it), and those registered on the site.
        seats_taken: seats.taken,
        seats_online: seats.online,
        seats_left: seats.left,
        waitlist: p.waitlist || 0,
        last_registration_at: p.last_registration_at || null,
        views: p.views || 0, clicks: p.clicks || 0,
    };
}

/** What a visitor's browser receives: only what the site shows. */
function publicShape(p) {
    const seats = seatsOf(p);
    const full = !!p.seat_limit && seats.taken >= p.seat_limit;
    return {
        slug: p.slug, kind: p.kind, audience: p.audience, level: p.level, theme: p.theme, image: p.image_key,
        text: { en: wordsIn(p, 'en'), fr: wordsIn(p, 'fr') },
        class_starts_on: p.class_starts || null, class_ends_on: p.class_ends || null, teacher: p.teacher_name,
        // The seats left out of the group, those taken outside the site included.
        seats: p.seat_limit && seats.display !== 'never' ? { limit: p.seat_limit, left: seats.left } : null,
        full,
        price: p.price_regular !== null || p.price_promo !== null
            ? { regular: num(p.price_regular), promo: num(p.price_promo), currency: p.currency }
            : null,
        ends_at: p.ends_at, countdown: !!(p.show_countdown && p.ends_at),
        places: { bar: p.place_bar, home: p.place_home, flash: p.place_flash, learn: p.place_learn },
        registration: { mode: p.registration_mode, url: p.registration_mode === 'link' ? p.cta_url : null },
        priority: p.priority,
    };
}

module.exports = {
    KINDS, STATUSES, AUDIENCES, THEMES, CURRENCIES, REGISTRATION_MODES, REGISTRATION_STATUSES, SEATED, PLACEMENTS, LANGS,
    SEATS_DISPLAY, seatsOf,
    COLUMNS, COUNTS_JOIN,
    ready, clean, stateOf, slugify, freeSlug, wordsIn, adminShape, publicShape, text, longText,
};
