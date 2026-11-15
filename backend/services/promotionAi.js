/**
 * Marketing campaigns written by the AI engine.
 *
 * Two steps, so the administrator sees the words at once and the picture a
 * few seconds later:
 *
 *   draftCampaign  — from a brief (« a TCF group in January, 8 seats, 480 $
 *                    instead of 600 $… »), every field of a campaign in French
 *                    AND English, the dates on the site, the placements, the
 *                    colour, a picture of the library, and an art direction
 *                    for a new picture. Also refines an existing campaign
 *                    (« make it more urgent », « add the Saturday group »).
 *   campaignImage  — a new photograph for the campaign, checked by the model
 *                    for text, logos and anatomy (drawn again once when it
 *                    fails), stored as WebP and served by the public API.
 *
 * Everything goes through aiModels.withFallback: the engine the administrator
 * chose (Admin → AI engine), its models newest first, its keys and quotas.
 * Nothing is saved as a campaign here: the editor shows the result, the
 * administrator checks it and saves it like any campaign.
 */
const crypto = require('crypto');
const ai = require('./aiModels');
const promos = require('./promotionService');

// ── What the AI may choose from ────────────────────────────────────────────

/** The site's own photos (frontend/public/learn/img), the picture used until a new one is made. */
const PICTURES = {
    teacher: 'a native French teacher in a live online class',
    'hub-hero': 'adult learners studying French, warm study scene',
    'cat-conversation': 'people talking in French, conversation practice',
    'course-small-talk': 'casual small talk between adults',
    'course-opinions-debate': 'adults debating ideas around a table',
    'course-spoken-french': 'speaking practice, spoken French',
    'cat-grammar': 'grammar study, notebook and lesson',
    'course-first-steps': 'a beginner taking first steps in French',
    'course-survival-dialogues': 'everyday dialogues for survival French',
    'games-hero': 'playful learning, language games',
    'cat-tcf': 'TCF Canada exam preparation',
    'cat-tef': 'TEF Canada exam preparation',
    'cat-delf': 'DELF / DALF diploma preparation',
    'course-tcf-speaking': 'oral exam practice (speaking)',
    'course-tcf-writing': 'written exam practice (writing)',
    'course-tcf-listening': 'listening practice with headphones',
    'course-tcf-reading': 'reading comprehension practice',
    'course-tef-speaking': 'TEF speaking practice',
    'course-tef-writing': 'TEF writing practice',
    'course-delf-b2': 'DELF B2 preparation',
    'course-dalf-c1': 'DALF C1 advanced preparation',
    'course-delf-a2': 'DELF A2 preparation',
    placement: 'a level test, assessment',
    'cat-business': 'business French in a professional setting',
    'course-job-interview': 'a job interview in French',
    'course-pro-emails': 'writing professional emails',
    'course-customer-service-french': 'customer service in French',
    'course-healthcare-french': 'French for healthcare workers',
    'course-jobs-work': 'jobs and work life',
    'story-office': 'an office in a French-speaking city',
    'course-settling-in-canada': 'settling in Canada, new arrivals',
    'course-quebec-french': 'Québec French, Montréal atmosphere',
    'course-school-parents': 'parents and school life',
    'story-airport': 'arriving at an airport',
    'story-apartment': 'finding an apartment',
    'story-cafe': 'a café scene',
    'course-everyday-life': 'everyday life in French',
    'course-travel-french': 'travelling in French',
    'course-phone-french': 'talking on the phone in French',
    'cat-beginner': 'beginners learning French',
    'course-kids-french': 'French for children',
    'kids-classroom': 'children in a friendly classroom',
    'course-cooking-french': 'cooking vocabulary, kitchen scene',
    'cat-reading': 'reading in French',
    'course-classic-stories': 'classic French stories and books',
    'course-real-life-reading': 'reading real-life documents',
    'cat-listening': 'listening practice',
    'cat-pronunciation': 'pronunciation practice',
    'course-french-idioms': 'French idioms and expressions',
};
const PICTURE_KEYS = Object.keys(PICTURES);

const NOTES_LANGS = ['en', 'fr'];

// ── The brief, cleaned ─────────────────────────────────────────────────────

const MAX_BRIEF = 4000;
/** The administrator's brief as plain text, never longer than the model needs. */
function briefOf(raw) {
    const text = String(raw || '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
    return text.slice(0, MAX_BRIEF);
}

// ── Time ───────────────────────────────────────────────────────────────────

/** A time zone the server can use, or null. */
function zoneOf(raw) {
    const tz = String(raw || '').trim();
    if (!tz || tz.length > 64) return null;
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return tz; } catch { return null; }
}

/** Minutes the zone is ahead of UTC at that instant. */
function offsetMinutes(date, tz) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(date);
    const n = (type) => Number(parts.find(p => p.type === type)?.value);
    return Math.round((Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute')) - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

/** "2026-12-01T19:00" read in the administrator's zone → ISO instant (UTC), or null. */
function localToIso(value, tz) {
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(value || '').trim());
    if (!m) return null;
    const [, y, mo, d, h = '00', mi = '00'] = m;
    const wall = Date.UTC(+y, +mo - 1, +d, +h, +mi);
    if (!Number.isFinite(wall)) return null;
    // Twice: the offset of the guessed instant may differ around a clock change.
    let guess = wall;
    for (let i = 0; i < 2; i++) guess = wall - offsetMinutes(new Date(guess), tz) * 60000;
    const date = new Date(guess);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** An ISO instant as "2026-12-01T19:00" in the administrator's zone (for the current campaign shown to the model). */
function isoToLocal(iso, tz) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).formatToParts(date);
    const v = (type) => parts.find(p => p.type === type)?.value;
    return `${v('year')}-${v('month')}-${v('day')}T${v('hour')}:${v('minute')}`;
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const dayOf = (v) => {
    const s = String(v || '').trim().slice(0, 10);
    return DAY_RE.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) ? s : null;
};

// ── Words ──────────────────────────────────────────────────────────────────

/** Cuts a text at a word boundary, never in the middle of a word. */
function cut(text, max) {
    const t = String(text || '').trim();
    if (t.length <= max) return t;
    const room = t.slice(0, max - 1);
    const at = room.lastIndexOf(' ');
    return `${(at > max * 0.6 ? room.slice(0, at) : room).replace(/[\s,;:–-]+$/, '')}…`;
}

/** No markdown, no emoji, no quotes around the whole thing, typographic apostrophes. */
function plain(text, { multiline = false } = {}) {
    let t = String(text || '');
    t = t.replace(/\*\*|__|`/g, '').replace(/^#+\s*/gm, '');
    t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '');
    t = t.replace(/([\p{L}\d])'(?=[\p{L}])/gu, '$1’');
    t = multiline ? t.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n') : t.replace(/\s+/g, ' ');
    t = t.trim().replace(/^["“”«»]\s*|\s*["“”«»]$/g, '');
    return t.trim();
}

const NBSP = '\u00a0';
const NNBSP = '\u202f';
/** French typography: a thin no-break space before ; ! ? and a no-break space before : and inside « ». */
function frenchTypography(text) {
    if (!text) return text;
    return text
        .replace(/\s*([;!?])/g, `${NNBSP}$1`)
        .replace(/(\S)\s*:(?=\s|$)/g, `$1${NBSP}:`)
        .replace(/«\s*/g, `«${NBSP}`)
        .replace(/\s*»/g, `${NBSP}»`)
        // "https://" and times like "19:00" are not punctuation.
        .replace(new RegExp(`(https?)${NBSP}:`, 'g'), '$1:')
        .replace(new RegExp(`(\\d)${NBSP}:(\\d)`, 'g'), '$1:$2')
        .replace(/ (%|\$|€)/g, `${NBSP}$1`);
}

const LIMITS = { title: 70, tagline: 140, description: 1200, highlight: 70, badge: 18, cta: 28, schedule: 90, price_note: 60 };

/** One language's words, cleaned and within the limits. */
function wordsFor(raw, lang) {
    const fix = (t) => (lang === 'fr' ? frenchTypography(t) : t);
    const line = (key, max) => {
        const t = plain(raw[`${key}_${lang}`]);
        return t ? fix(cut(t, max)) : null;
    };
    const description = plain(raw[`description_${lang}`], { multiline: true });
    const highlights = (Array.isArray(raw[`highlights_${lang}`]) ? raw[`highlights_${lang}`] : [])
        // A bullet or a list number goes ("- ", "• ", "1. ", "2) "), a number that is part of the point stays ("8 people").
        .map(h => plain(h).replace(/^(?:[-•·–*]+\s*|\d+[.)]\s+)/, '').replace(/[.;,]+$/, ''))
        .filter(Boolean)
        .slice(0, 6)
        .map(h => fix(cut(h, LIMITS.highlight)));
    return {
        [`title_${lang}`]: line('title', LIMITS.title),
        [`tagline_${lang}`]: line('tagline', LIMITS.tagline),
        [`description_${lang}`]: description ? fix(cut(description, LIMITS.description)) : null,
        [`highlights_${lang}`]: highlights,
        [`badge_${lang}`]: line('badge', LIMITS.badge),
        [`cta_${lang}`]: line('cta', LIMITS.cta),
        [`schedule_${lang}`]: line('schedule', LIMITS.schedule),
        [`price_note_${lang}`]: line('price_note', LIMITS.price_note),
    };
}

// ── The instructions ───────────────────────────────────────────────────────

const SYSTEM = `You are the senior marketing copywriter and campaign planner of « Learn French with Natives » (learnfrenchwithnatives.com), an online French school: live video classes with native French-speaking teachers, small groups and private lessons, preparation for TCF Canada, TEF Canada, TCF Québec and TEFAQ, DELF and DALF, business French, French for children, and a library of free interactive courses on the site. Most learners are adults who want to live, study or work in Canada (Québec included) or in a French-speaking country; many come from Africa, Asia, Latin America, the Middle East and Europe, and learn around a job and a family.

YOUR TASK
Turn the administrator's brief into ONE complete campaign for the school's website, written natively in BOTH French and English, ready to publish after a human check. The campaign is shown as a card (picture, badge, title, sentence, dates, seats, price, button), in a top bar, in a pop-up and beside the free courses, and it opens a page with the full description and a registration form.

THE TRUTH COMES FIRST — these rules beat every other rule
1. Use only the facts given in the brief (or in the current campaign when one is given). Never invent: prices, discounts, dates, times, number of seats, number of sessions or hours, teacher names, results, success rates, certifications, partners, guarantees, testimonials or quotes. Never invent what is taught or how either (« simple techniques », « a proven method », « real-life role plays ») — describe the class only with the facts given, in general words.
2. A fact that is not given stays empty (null), and you list it in « notes » so the administrator can add it.
3. Never promise an exam score, a pass, a visa, a permit, a job or an immigration result. You may say what the classes work on and how.
4. Urgency only from real limits that are given: the deadline, the seats, the start date. Never « only today », « last chance » or « almost full » unless the brief says so.
5. A discount is only stated when both prices are given or the brief states the discount itself.
6. Check the facts against each other: a date must fall on the weekday the brief gives it (a « Tuesday » 13 January that is really a Wednesday), the first class must come before the last, a deadline before the start. When they disagree, keep the facts as written and say so plainly in « notes ».
7. Do not mention competitors, other schools, politics or religion.

THE TWO LANGUAGES
- French: natural, warm and precise, as written by a French-speaking marketer in Canada; « vous » to the reader; correct French typography (« » for quotes, « 19 h » for times, « 384 $ » for Canadian dollars, « 8 semaines », capital only at the start of titles and for proper nouns: « Groupe TCF Canada : objectif NCLC 7 »).
- English: natural Canadian English, written for the reader, never a word-for-word translation; sentence case for titles.
- Both versions carry exactly the same facts and the same promises.
- No emojis, no hashtags, no markdown, no ALL CAPS, at most one exclamation mark in the whole campaign, no straight double quotes (use « » in French and “ ” in English).

THE FIELDS — the lengths are maxima, shorter is better
- title: up to 60 characters. Concrete: what it is + for whom or the outcome (« Groupe TCF Canada du soir : objectif NCLC 7 »). No date in the title unless it is the heart of the offer.
- tagline: one sentence, up to 120 characters, the main benefit or what makes it different.
- description: 2 or 3 short paragraphs separated by one empty line, up to 700 characters in all: who it is for; how it runs (format, rhythm, group size, what is included — given facts only); how to join. Plain sentences, no list.
- highlights: 3 to 5 concrete selling points, up to 55 characters each, no full stop, each a different fact (format, group size, rhythm, level, what is included, the teacher if named).
- badge: up to 16 characters, or null. Only a true fact that catches the eye: a discount (« -20 % »), « Nouveau » / « New », « Gratuit » / « Free », « Places limitées » / « Limited seats » only when seats are limited.
- cta: the button, up to 24 characters, a verb first, matching what the button does: group class « Réserver ma place » / « Reserve my seat »; offer « Profiter de l’offre » / « Get the offer »; event « Je m’inscris » / « Save my spot »; announcement « En savoir plus » / « Learn more ». Another wording is fine when it fits better.
- schedule: up to 70 characters, days and time with the time zone when given (« Lundi et mercredi, 19 h (heure de Montréal) » / « Mon and Wed, 7 pm (Montréal time) »), or null.
- price_note: up to 50 characters, what the price covers (« pour les 8 semaines » / « for the 8 weeks »), or null.
- kind: group_class (a group with a start date, a timetable, seats), offer (a discount or a pack for a limited time), event (a free workshop, webinar or open class on one date), announcement (news, no registration needed).
- audience: the main public among: general, beginner, conversation, tcf, tef, delf, business, kids.
- level: as given (« A2 », « B1 → B2 », « NCLC 7 »), or null.
- class_starts_on / class_ends_on: « YYYY-MM-DD ». For an event, class_starts_on is the day of the event and class_ends_on is null. Work out relative dates (« next Monday », « in January ») from today's date. null when not given.
- teacher_name: only when the brief names the teacher.
- seat_limit: the TOTAL number of seats of the group when given, else null. The site counts the seats left from the registrations by itself: « only 5 seats left » is never a new total — keep seat_limit, use the words for urgency, and say it in notes. show_seats: true when seat_limit is 20 or fewer, else false.
- price_regular / price_promo: numbers only (no currency sign), from the brief. A single price goes in price_regular. A free event: price_regular 0. Otherwise null.
- currency: CAD unless the brief says US dollars (USD) or euros (EUR).
- starts_at / ends_at: when the campaign shows on the site, as local time « YYYY-MM-DDTHH:mm » in the administrator's time zone. starts_at: now, unless the brief asks for a later start. ends_at: the registration deadline when given; otherwise, for a group class or an event, the day before it starts at 23:59; otherwise 21 days from now at 23:59; null only for an announcement with no end.
- show_countdown: true when there is a real deadline (ends_at) within 30 days.
- place_home: true unless the brief says otherwise. place_learn: true when the audience is general, beginner, conversation, tcf, tef or delf (learners of the free courses), else false. place_bar: true only for a time-limited offer, a group starting within 21 days, or when the brief says it is the most important campaign. place_flash: true only for a strong offer or an event within 10 days, or when the brief asks for it; false otherwise.
- priority: 0 normal, 10 for an exam group or an offer with a deadline, 20 only when the brief says it is the most important.
- theme (the colours): navy for exam preparation and serious groups (the default), bordeaux for business French and premium or private classes, gold for offers and discounts, forest for beginners, children, free events and community, plum for conversation, culture and evening events.
- image_key: the photo of the catalogue that fits the subject best. It is only a stand-in until a new picture is made: never mention it, nor any picture choice, in notes.
- registration_mode: « form » (registration on the site) by default; « link » only when the brief gives a web address — then cta_url is that address and must start with https://; « none » for a pure announcement.
- image_prompt: in English, 2 to 4 sentences of art direction for a new photograph: who (age, diversity, realistic adult learners or children as fitting), what they do, where, the light and mood, and a calm area on one side of the frame. The school teaches ONLINE: show one or two learners at home (or a teacher at home) taking part in a live video class on a laptop or with a headset, the screen not visible — not a group gathered in a physical classroom, unless the brief says the class is in person. Absolutely no text anywhere in the picture: no writing, letters, numbers, signs, posters, book covers, name labels, flags with words, readable screens or user interfaces, no logos or brand names. A laptop or phone, if any, is seen from the side or the back. No famous landmark with signage.
- notes: 1 to 6 short points for the administrator, in the language requested below, in plain words for a non-technical reader (never a field name such as place_flash, priority or image_key: say « the pop-up », « shown first »…): what you assumed, what is missing or must be checked (a price, a date, the seats, the time zone…), and in a change request what you changed. An empty list only when nothing needs checking.

WHEN A CURRENT CAMPAIGN IS GIVEN
The brief is a change request. Keep every field it does not ask to change, apply what it asks in both languages, and keep the two versions consistent.

Answer with the JSON object only.`;

const KINDS = ['group_class', 'offer', 'event', 'announcement'];
const AUDIENCES = ['general', 'beginner', 'conversation', 'tcf', 'tef', 'delf', 'business', 'kids'];
const THEMES = ['navy', 'bordeaux', 'gold', 'forest', 'plum'];
const MODES = ['form', 'link', 'none'];

const str = (description) => ({ type: 'string', description });
const nstr = (description) => ({ type: 'string', nullable: true, description });
const SCHEMA = {
    type: 'object',
    properties: {
        kind: { type: 'string', enum: KINDS },
        audience: { type: 'string', enum: AUDIENCES },
        level: nstr('CEFR or NCLC level as given, or null'),
        title_fr: str('French title'),
        title_en: str('English title'),
        tagline_fr: str('French tagline'),
        tagline_en: str('English tagline'),
        description_fr: str('French description, paragraphs separated by an empty line'),
        description_en: str('English description, paragraphs separated by an empty line'),
        highlights_fr: { type: 'array', items: { type: 'string' } },
        highlights_en: { type: 'array', items: { type: 'string' } },
        badge_fr: nstr('French badge or null'),
        badge_en: nstr('English badge or null'),
        cta_fr: str('French button label'),
        cta_en: str('English button label'),
        schedule_fr: nstr('French timetable or null'),
        schedule_en: nstr('English timetable or null'),
        price_note_fr: nstr('French price note or null'),
        price_note_en: nstr('English price note or null'),
        class_starts_on: nstr('YYYY-MM-DD or null'),
        class_ends_on: nstr('YYYY-MM-DD or null'),
        teacher_name: nstr('Teacher name only if given'),
        seat_limit: { type: 'integer', nullable: true },
        show_seats: { type: 'boolean' },
        price_regular: { type: 'number', nullable: true },
        price_promo: { type: 'number', nullable: true },
        currency: { type: 'string', enum: ['CAD', 'USD', 'EUR'] },
        starts_at: str('Local time YYYY-MM-DDTHH:mm'),
        ends_at: nstr('Local time YYYY-MM-DDTHH:mm or null'),
        show_countdown: { type: 'boolean' },
        place_home: { type: 'boolean' },
        place_learn: { type: 'boolean' },
        place_bar: { type: 'boolean' },
        place_flash: { type: 'boolean' },
        priority: { type: 'integer' },
        theme: { type: 'string', enum: THEMES },
        image_key: { type: 'string', enum: PICTURE_KEYS },
        registration_mode: { type: 'string', enum: MODES },
        cta_url: nstr('https address only when registration_mode is link'),
        image_prompt: str('English art direction for a new photograph, no text in it'),
        notes: { type: 'array', items: { type: 'string' } },
    },
    required: [
        'kind', 'audience', 'title_fr', 'title_en', 'tagline_fr', 'tagline_en', 'description_fr', 'description_en',
        'highlights_fr', 'highlights_en', 'cta_fr', 'cta_en', 'show_seats', 'currency', 'starts_at', 'show_countdown',
        'place_home', 'place_learn', 'place_bar', 'place_flash', 'priority', 'theme', 'image_key', 'registration_mode',
        'image_prompt', 'notes',
    ],
};

/** The fields of a campaign the model may see when refining it (no counts, no ids), dates in local time. */
function currentForModel(current, tz) {
    if (!current || typeof current !== 'object') return null;
    const { values } = promos.clean(current);
    const out = { ...values };
    out.starts_at = isoToLocal(values.starts_at, tz);
    out.ends_at = isoToLocal(values.ends_at, tz);
    // Its own picture (made by the AI) is kept by the editor whatever the answer: not the model's business.
    if (!PICTURE_KEYS.includes(out.image_key)) delete out.image_key;
    return out;
}

function userPrompt({ brief, current, tz, notesLang, now = new Date() }) {
    const today = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).format(now);
    const lines = [
        `Today: ${today} (${tz}, the administrator's time zone). Now as local time: ${isoToLocal(now.toISOString(), tz)}.`,
        `Write the « notes » in ${notesLang === 'fr' ? 'French' : 'English'}.`,
        '',
        'BRIEF FROM THE ADMINISTRATOR (facts and wishes; it may be in French or English):',
        '"""',
        brief,
        '"""',
    ];
    if (current) {
        lines.push('', 'CURRENT CAMPAIGN (JSON) — the brief above asks for changes to it:', JSON.stringify(current));
    }
    lines.push('', 'PHOTO CATALOGUE (image_key — what it shows):',
        ...PICTURE_KEYS.map(k => `- ${k} — ${PICTURES[k]}`));
    return lines.join('\n');
}

// ── The draft ──────────────────────────────────────────────────────────────

class AiError extends Error {
    constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

/** The model's answer → the fields of a campaign, cleaned and made consistent, plus what was fixed. */
function toFields(raw, tz, now = new Date()) {
    const fixes = [];
    const fields = {
        kind: KINDS.includes(raw.kind) ? raw.kind : 'group_class',
        ...wordsFor(raw, 'fr'),
        ...wordsFor(raw, 'en'),
        audience: AUDIENCES.includes(raw.audience) ? raw.audience : 'general',
        level: plain(raw.level).slice(0, 20) || null,
        class_starts_on: dayOf(raw.class_starts_on),
        class_ends_on: dayOf(raw.class_ends_on),
        teacher_name: plain(raw.teacher_name).slice(0, 120) || null,
        seat_limit: Number.isInteger(raw.seat_limit) && raw.seat_limit > 0 && raw.seat_limit <= 100000 ? raw.seat_limit : null,
        show_seats: raw.show_seats !== false,
        price_regular: Number.isFinite(raw.price_regular) && raw.price_regular >= 0 ? Math.round(raw.price_regular * 100) / 100 : null,
        price_promo: Number.isFinite(raw.price_promo) && raw.price_promo >= 0 ? Math.round(raw.price_promo * 100) / 100 : null,
        currency: ['CAD', 'USD', 'EUR'].includes(raw.currency) ? raw.currency : 'CAD',
        starts_at: localToIso(raw.starts_at, tz) || now.toISOString(),
        ends_at: raw.ends_at ? localToIso(raw.ends_at, tz) : null,
        show_countdown: raw.show_countdown !== false,
        place_bar: raw.place_bar === true,
        place_home: raw.place_home !== false,
        place_flash: raw.place_flash === true,
        place_learn: raw.place_learn !== false,
        priority: [0, 10, 20].includes(raw.priority) ? raw.priority : Math.max(0, Math.min(20, Math.round(Number(raw.priority) / 10) * 10 || 0)),
        theme: THEMES.includes(raw.theme) ? raw.theme : 'navy',
        image_key: PICTURE_KEYS.includes(raw.image_key) ? raw.image_key : null,
        registration_mode: MODES.includes(raw.registration_mode) ? raw.registration_mode : 'form',
        cta_url: null,
    };

    // A link only when it is a real one.
    const url = plain(raw.cta_url);
    if (fields.registration_mode === 'link') {
        if (/^https:\/\/[^\s]+$/i.test(url)) fields.cta_url = url.slice(0, 500);
        else { fields.registration_mode = 'form'; fixes.push('link'); }
    }
    // A campaign that starts in the past starts now; one that ends before it starts ends 21 days later.
    if (Date.parse(fields.starts_at) < now.getTime() - 5 * 60_000) fields.starts_at = now.toISOString();
    if (fields.ends_at && Date.parse(fields.ends_at) <= Date.parse(fields.starts_at)) {
        const end = new Date(Date.parse(fields.starts_at) + 21 * 86_400_000);
        fields.ends_at = localToIso(`${isoToLocal(end.toISOString(), tz).slice(0, 10)}T23:59`, tz);
        fixes.push('ends_at');
    }
    if (!fields.ends_at) fields.show_countdown = false;
    if (fields.class_starts_on && fields.class_ends_on && fields.class_ends_on < fields.class_starts_on) {
        fields.class_ends_on = null;
        fixes.push('class_ends_on');
    }
    if (fields.kind === 'event') fields.class_ends_on = null;
    // Two prices the wrong way round are swapped, never dropped.
    if (fields.price_regular !== null && fields.price_promo !== null && fields.price_promo > fields.price_regular) {
        [fields.price_regular, fields.price_promo] = [fields.price_promo, fields.price_regular];
        fixes.push('prices');
    }
    if (fields.price_regular !== null && fields.price_promo !== null && fields.price_promo === fields.price_regular) fields.price_promo = null;
    if (!fields.seat_limit) fields.show_seats = true;
    if (!fields.title_fr && !fields.title_en) throw new AiError('AI_NO_TITLE', 'The AI did not write a title. Try again with a little more detail.', 502);

    // The final word belongs to the same rules as a campaign typed by hand.
    const { values, errors } = promos.clean(fields);
    if (errors.length) throw new AiError('AI_INVALID', `The AI answer could not be used: ${errors.join(' ')}`, 502);
    return { fields: values, fixes };
}

/**
 * Writes a campaign (or changes one) from a brief. Returns the fields, the
 * administrator's points to check, the art direction for the picture and
 * the model that wrote it.
 */
async function draftCampaign({ brief: rawBrief, current, timezone, notesLang, userTimezone }) {
    const brief = briefOf(rawBrief);
    if (brief.length < 8) throw new AiError('AI_BRIEF_SHORT', 'Describe the campaign in a sentence or two (what, for whom, when, price, seats).');
    const tz = zoneOf(timezone) || zoneOf(userTimezone) || 'America/Toronto';
    const lang = NOTES_LANGS.includes(notesLang) ? notesLang : 'en';
    const now = new Date();
    const prompt = userPrompt({ brief, current: currentForModel(current, tz), tz, notesLang: lang, now });

    try {
        const { result, model, engine } = await ai.withFallback('writing', async (client, model) => {
            const response = await client.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: SYSTEM,
                    responseMimeType: 'application/json',
                    responseSchema: SCHEMA,
                    temperature: 0.6,
                    maxOutputTokens: 8192,
                },
            });
            const text = response.text;
            if (!text) throw ai.badAnswer('Empty answer');
            let raw;
            try { raw = JSON.parse(text); } catch { throw ai.badAnswer('The answer was not JSON'); }
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw ai.badAnswer('The answer was not an object');
            const shaped = toFields(raw, tz, now);
            return {
                ...shaped,
                notes: (Array.isArray(raw.notes) ? raw.notes : []).map(n => plain(n)).filter(Boolean).slice(0, 8).map(n => cut(n, 220)),
                image_prompt: cut(plain(raw.image_prompt), 900),
            };
        }, { label: 'Campaign writer' });
        return { ...result, model, engine, timezone: tz };
    } catch (err) {
        if (err instanceof AiError) throw err;
        throw unavailable(err);
    }
}

/** An error of the engine, said to the administrator without any key or path. */
function unavailable(err) {
    const status = ai.statusOf(err);
    console.error('Campaign AI unavailable:', ai.safeMessage(err));
    if (status === 401 || status === 403) return new AiError('AI_REFUSED', 'The AI engine refused the request (key or permission). Check Admin → AI engine.', 503);
    if (status === 429) return new AiError('AI_BUSY', 'The AI engine has reached its quota for now. Try again in a few minutes, or switch the engine in Admin → AI engine.', 503);
    return new AiError('AI_UNAVAILABLE', 'The AI engine is busy right now. Try again in a moment.', 503);
}

// ── The picture ────────────────────────────────────────────────────────────

/** The site's photographic style (frontend/scripts/learn-media.mjs), and what must never be in a campaign picture. */
const STYLE = [
    'Editorial documentary photograph, natural light, 35mm lens, shallow depth of field, realistic skin and textures, warm muted colours, calm and premium, candid (people not looking at the camera).',
    'Horizontal 16:9 frame with a calm, uncluttered area on one side where a title can be laid over the picture.',
    'ABSOLUTELY NO TEXT anywhere in the image: no letters, words, numbers, captions, signs, posters, whiteboards with writing, book covers with titles, name labels, subtitles, and no readable screen or user interface. Laptops, tablets and phones are seen from the side or from behind, their screens not visible.',
    'No logos and no brand names on anything: laptops, phones, headphones, cups and clothes are plain and unbranded (no apple on a laptop lid).',
    'Natural anatomy: each person has exactly two arms and two hands with five fingers, every hand fully visible or naturally hidden.',
].join(' ');

const THEME_LIGHT = {
    navy: 'Colour mood: deep navy blue and warm cream accents.',
    bordeaux: 'Colour mood: deep burgundy red and warm beige accents.',
    gold: 'Colour mood: warm golden light and honey tones.',
    forest: 'Colour mood: fresh forest green and natural wood tones.',
    plum: 'Colour mood: soft plum violet and warm evening light.',
};

const AUDIT = `You check a photograph before it is published on a school's website. Look at the whole image carefully, including small details, screens, books, clothes and the background.
Answer in JSON:
- text: true only if words, letters or numbers can actually be read by a person (on a sign, poster, book cover, screen, label, clothing, whiteboard…), or a caption or user interface is visible. Illegible handwriting, blurred book pages and tiny unreadable marks do NOT count.
- logo: true if any logo, brand name or recognisable brand mark appears (for example an apple on a laptop).
- anatomy: true if any person has a wrong number of arms, hands or fingers, merged or deformed limbs, or a distorted face.
- unsafe: true if the image is inappropriate for a family-friendly school website.
- problems: a short English description of what is wrong, or an empty string.`;
const AUDIT_SCHEMA = {
    type: 'object',
    properties: {
        text: { type: 'boolean' }, logo: { type: 'boolean' }, anatomy: { type: 'boolean' }, unsafe: { type: 'boolean' },
        problems: { type: 'string' },
    },
    required: ['text', 'logo', 'anatomy', 'unsafe', 'problems'],
};

/** One picture from the image model: { data (Buffer), mime, model, engine }. */
async function drawPicture(prompt) {
    const { result, model, engine } = await ai.withFallback('image', async (client, model) => {
        const response = await client.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
        });
        const part = (response.candidates?.[0]?.content?.parts || []).find(p => p.inlineData?.data);
        if (!part) throw ai.badAnswer('No picture in the answer');
        return { data: Buffer.from(part.inlineData.data, 'base64'), mime: part.inlineData.mimeType || 'image/png' };
    }, { label: 'Campaign picture', unlimited: false });
    return { ...result, model, engine };
}

/** What the model sees wrong in a picture; null when it could not look (the picture is then kept). */
async function auditPicture(picture) {
    try {
        const { result } = await ai.withFallback('text', async (client, model) => {
            const response = await client.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ inlineData: { mimeType: picture.mime, data: picture.data.toString('base64') } }, { text: 'Check this photograph.' }] }],
                config: { systemInstruction: AUDIT, responseMimeType: 'application/json', responseSchema: AUDIT_SCHEMA, temperature: 0 },
            });
            let raw;
            try { raw = JSON.parse(response.text || ''); } catch { throw ai.badAnswer('The check was not JSON'); }
            return raw;
        }, { label: 'Campaign picture check', unlimited: false });
        const flags = ['text', 'logo', 'anatomy', 'unsafe'].filter(k => result?.[k] === true);
        return { flags, problems: plain(result?.problems || '').slice(0, 300) };
    } catch (err) {
        console.warn('Campaign picture check unavailable:', ai.safeMessage(err));
        return null;
    }
}

// ── Storage ────────────────────────────────────────────────────────────────

let tableReady = false;
async function ensureTable(db) {
    if (tableReady) return;
    await db.run(`
        CREATE TABLE IF NOT EXISTS promotion_images (
            key VARCHAR(40) PRIMARY KEY,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            model VARCHAR(80),
            prompt TEXT,
            large BYTEA NOT NULL,
            small BYTEA NOT NULL
        )`);
    tableReady = true;
}

const KEY_RE = /^ai-[a-f0-9]{12}$/;
const cache = new Map(); // "key|size" → Buffer (most recent last)
const CACHE_MAX = 60;

/** A stored picture, for the public site: WebP bytes or null. */
async function loadImage(db, key, small) {
    if (!KEY_RE.test(key)) return null;
    const id = `${key}|${small ? 's' : 'l'}`;
    if (cache.has(id)) {
        const hit = cache.get(id);
        cache.delete(id);
        cache.set(id, hit);
        return hit;
    }
    await ensureTable(db);
    const row = await db.get(`SELECT ${small ? 'small' : 'large'} AS bytes FROM promotion_images WHERE key = $1`, [key]);
    if (!row?.bytes) return null;
    cache.set(id, row.bytes);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    return row.bytes;
}

/**
 * Makes a new picture for a campaign, checks it, stores it, and returns its
 * key (used as the campaign's image_key, like a photo of the library).
 */
async function campaignImage(db, { prompt: rawPrompt, theme, title, userId }) {
    const scene = cut(plain(rawPrompt), 900);
    if (scene.length < 12) throw new AiError('AI_PROMPT_SHORT', 'Describe the picture in a sentence (who, where, doing what).');
    const base = [
        scene,
        title ? `It illustrates a campaign titled “${cut(plain(title), 80)}” for an online French school (do not write this title in the picture).` : '',
        THEME_LIGHT[theme] || THEME_LIGHT.navy,
        STYLE,
    ].filter(Boolean).join('\n\n');

    let sharp;
    try { sharp = require('sharp'); } catch { throw new AiError('AI_IMAGE_TOOLS', 'The server cannot process pictures yet (the sharp package is missing). Run npm install in backend.', 503); }

    try {
        let best = null;
        for (let attempt = 0; attempt < 2; attempt++) {
            const prompt = attempt === 0 || !best?.check?.problems
                ? base
                : `${base}\n\nA previous attempt was rejected because: ${best.check.problems}. Make sure none of this appears.`;
            const picture = await drawPicture(prompt);
            const check = await auditPicture(picture);
            const score = check ? check.flags.length : 0;
            if (!best || score < best.score) best = { picture, check, score };
            if (score === 0) break;
        }
        const { picture, check } = best;
        if (check?.flags.includes('unsafe')) throw new AiError('AI_IMAGE_UNSAFE', 'The picture could not be made safely. Change the description and try again.', 422);

        const large = await sharp(picture.data).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
        const small = await sharp(picture.data).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
        await ensureTable(db);
        const key = `ai-${crypto.randomBytes(6).toString('hex')}`;
        await db.run(
            'INSERT INTO promotion_images (key, created_by, model, prompt, large, small) VALUES ($1, $2, $3, $4, $5, $6)',
            [key, userId || null, picture.model, scene, large, small]);
        // Pictures made but never used by a campaign are forgotten after a week.
        db.run(`DELETE FROM promotion_images i
                 WHERE i.created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
                   AND NOT EXISTS (SELECT 1 FROM promotions p WHERE p.image_key = i.key)`).catch(() => { /* housekeeping only */ });
        return {
            image_key: key,
            model: picture.model,
            engine: picture.engine,
            checked: !!check,
            warning: check?.flags.length
                ? `${check.problems || 'The automatic check had a doubt about this picture'} — look at it before publishing, or make another one.`
                : null,
        };
    } catch (err) {
        if (err instanceof AiError) throw err;
        throw unavailable(err);
    }
}

/** Whether the AI can write and draw right now, and with what. */
function status() {
    const id = ai.activeEngine();
    const e = ai.getEngine(id);
    return {
        available: !!e?.clients?.length,
        engine: id,
        writing_model: ai.modelsFor('writing', id)[0] || null,
        image_model: ai.modelsFor('image', id)[0] || null,
    };
}

module.exports = {
    draftCampaign, campaignImage, loadImage, status, AiError,
    // For tests.
    toFields, frenchTypography, localToIso, isoToLocal, userPrompt, PICTURE_KEYS, SYSTEM, SCHEMA, KEY_RE,
};
