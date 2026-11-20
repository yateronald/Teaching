/**
 * The AI of email campaigns, on the platform's engine (aiModels.withFallback):
 *
 *  · draftEmail     the writer: from the administrator's brief (and, when one is
 *                   chosen, the facts of a marketing campaign) it writes the whole
 *                   email in French AND English, the buttons' words for the action
 *                   chosen (a page, the form, WhatsApp), the questions of the form,
 *                   the offer box, the steps, and a layout that suits it.
 *  · proposeDesigns the art director: three complete, different designs for this
 *                   email (layout, header, colours, fonts, shapes), each with the
 *                   reason it works, following UI/UX rules for email; every design
 *                   is then made readable (WCAG AA contrast) by emailDesign.clean.
 *
 * Same truth rules as the marketing writer: only the facts given, never an
 * invented price, date, discount, testimonial or link; [what is missing] in
 * brackets, and a note.
 */
const ai = require('./aiModels');
const promoAi = require('./promotionAi');
const svc = require('./emailCampaignService');
const emailDesign = require('./emailDesign');
const { siteUrl } = require('./emailRender');

const { AiError, plain, cut, briefOf, zoneOf, frenchTypography, isoToLocal } = promoAi;

function sitePages() {
    const s = siteUrl();
    return {
        home: { fr: `${s}/fr/`, en: `${s}/` },
        trial_class: { fr: `${s}/fr/?demo=1`, en: `${s}/?demo=1` },
        offers: { fr: `${s}/fr/offres/`, en: `${s}/offers/` },
        free_courses: { fr: `${s}/fr/apprendre/`, en: `${s}/learn/` },
        level_test: { fr: `${s}/fr/apprendre/test-de-niveau/`, en: `${s}/learn/french-level-test/` },
        tcf_canada: { fr: `${s}/fr/preparation-tcf-canada/`, en: `${s}/tcf-canada-preparation/` },
        tef_canada: { fr: `${s}/fr/preparation-tef-canada/`, en: `${s}/tef-canada-preparation/` },
    };
}

// ── The model the administrator picks ──────────────────────────────────────

/** « gemini-4-carbon » → « Gemini 4 Carbon », « gemini-3.8-flash » → « Gemini 3.8 Flash ». */
const modelLabel = (id) => String(id || '').split('-').map(w => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(' ');

/** The writers offered on the active engine, with what each did lately ('ok', 'missing', 'busy', 'error' or null). */
function writingChoices(engine = ai.activeEngine()) {
    return ai.modelsFor('choices', engine).map(id => ({ id, label: modelLabel(id), state: ai.modelState(engine, id, { emailCampaign: true }) }));
}

/** The administrator's choice when it is one of the offered models, else none (the usual order). */
const chosenModel = (model, engine) => (ai.modelsFor('choices', engine).includes(model) ? model : null);

/** Tries each offered writer once, one after the other (the « Check » next to the choice). */
async function checkWritingModels() {
    const engine = ai.activeEngine();
    const results = [];
    for (const id of ai.modelsFor('choices', engine)) {
        results.push(await ai.probeModel(engine, id, { emailCampaign: true }));
        await new Promise(r => setTimeout(r, 700));
    }
    return { engine, choices: writingChoices(engine), results: results.map(r => ({ model: r.model, state: r.state, ms: r.ms })) };
}

/** Told when the chosen model could not answer and another one wrote instead. */
function stoodIn(requested, used, lang, engine) {
    if (!requested || requested === used) return null;
    const missing = ai.modelState(engine, requested, { emailCampaign: true }) === 'missing';
    if (lang === 'fr') {
        return missing
            ? `${modelLabel(requested)} n’est pas disponible sur votre projet (modèle introuvable ou accès non accordé) : ${modelLabel(used)} l’a fait à sa place.`
            : `${modelLabel(requested)} n’a pas pu traiter la demande. ${modelLabel(used)} l’a fait à sa place.`;
    }
    return missing
        ? `${modelLabel(requested)} is not available on your project (model not found, or no access yet): ${modelLabel(used)} did it instead.`
        : `${modelLabel(requested)} could not complete the request. ${modelLabel(used)} did it instead.`;
}

const GOAL_WORDS = {
    news: 'News: share something new with these people.',
    offer: 'An offer: make them take advantage of a limited offer (price, deadline).',
    group: 'A group class: fill the seats of a group that starts soon.',
    whatsapp: 'Join a WhatsApp group (community, weekly tips).',
    event: 'An event: get them to come to a free event or workshop.',
    reminder: 'A reminder: remind them of something they started (a trial class, a registration, a deadline).',
    survey: 'A survey or a request for information: get them to answer a few questions.',
};
const ACTION_WORDS = {
    link: 'opens a page (a link)',
    form: 'opens a short form on the school’s site, already filled with the person’s name and email: the person answers a few questions and the school receives the answers',
    whatsapp: 'opens the invitation to the school’s WhatsApp group',
    none: 'does not exist',
};
const SOURCE_WORDS = {
    student: 'current or former students of the school',
    candidate: 'exam candidates preparing the TCF with the school',
    registration: 'people who registered for one of the school’s offers on the website',
    demo: 'people who asked for a free trial class (leads: interested, not students yet)',
};

// ── The writer ─────────────────────────────────────────────────────────────

const WRITER = `You are the email marketing writer of Learn French with Natives, an online French school: live classes with native French teachers in small groups, exam preparation (TCF Canada, TEF Canada, TCF Québec, DELF, DALF), and free online French courses on its website. Its learners are adults, often immigrants or future immigrants to Canada, from many countries.

You write ONE marketing email in French AND in English — both, always, complete: every text field exists in "fr" and in "en". Answer with the JSON object of the schema only.

TRUTH — the most important rules:
1. Use only facts given in the brief or in the « campaign facts ». Never invent a price, a discount, a date, a time, a number of seats, a duration, a teacher, a statistic, a success rate, a testimonial, a guarantee or a deadline.
2. A fact the email needs but nobody gave: a placeholder in square brackets, e.g. [date], [price], and a note.
3. primary_url: exactly one of the links given, or one of the site pages listed, or null. Never make up a link.
4. No false urgency: « last seats » or a deadline only when the facts say so.
5. offer: show it only with real prices from the facts or the brief (regular and/or campaign price); otherwise show = false and prices null.

WRITING (professional email marketing):
- One goal, one main action. The main button's words say that action with a verb, at most 28 characters (« Réserver ma place », « Book my seat », « Je réponds au questionnaire », « Answer the questions », « Rejoindre le groupe WhatsApp »). The second button (when there is one) is an alternative, softer action.
- subject: at most 55 characters, specific and useful for this audience; sentence case, no ALL CAPS, no emoji, no « Re: », no spam words (« gratuit !!! », « $$$ », « urgent », « 100 % », « garanti », « free!!! », « act now »).
- preheader: 40 to 90 characters; completes the subject, never repeats it.
- eyebrow: 1 to 4 words above the headline (« Nouveau groupe », « Offre de lancement », « New group »), or null.
- headline: at most 60 characters, the promise of the email.
- body: 60 to 140 words per language, 2 to 4 short paragraphs separated by an empty line. Start with « Bonjour {first_name}, » in French and « Hi {first_name}, » in English (keep the braces exactly). « vous » in French (polite and warm), « you » in English. Concrete benefits for the reader. At most two **bold** words. No headings, no HTML, no links (the buttons carry them), no signature.
- highlights: 0 to 4 short points (≤ 70 characters) with concrete facts; highlights_title optional (« Ce qui vous attend », « What you get ») or null.
- steps: 0 to 3 steps only when the reader has several things to do (« Remplissez le formulaire », « Nous vous rappelons sous 24 h »…); otherwise an empty list.
- offer_label (« Prix de lancement », « Launch price »), offer_note (« pour 12 semaines »), deadline (« Jusqu’au 15 décembre ») from the facts only, or null.
- signature: who signs (« L’équipe Learn French with Natives » / « The Learn French with Natives team », or a person when the brief names one).
- ps: optional, one sentence with a real reason to act, or null.
- When the main or second button opens the form: form_title, form_intro (1 or 2 sentences: why, how long it takes), form_submit (« Envoyer mes réponses »), form_thanks_title and form_thanks_text (what happens next, only what the brief says, e.g. « Nous vous répondons sous 24 h » only if the brief says so; otherwise « Nous vous répondons rapidement. »), and form_fields: 3 to 7 questions that serve the goal. Always a "name" field and an "email" field (types name and email, required); then what the school needs (phone/WhatsApp, level, availability, goal, a choice…). Types: name, email, phone, text, textarea, select, radio, checkbox, date. Choices for select, radio and checkbox: "choices", 2 to 8 pairs, each pair the same choice in French and in English ({ "fr": "Débutant", "en": "Beginner" }, { "fr": "Le soir", "en": "Evenings" }): the English is a real translation, never the French copied. Short, clear labels in both languages. Nothing sensitive (no passport, no payment, no date of birth).
- The form is part of the school's platform: it opens from the button, is already filled with the person's name and email, and the answers arrive in the administrator's console. Never write a note about creating, hosting, linking or configuring the form, or where its answers go.
- Without a form: the form_* fields are null and form_fields is empty.
- French: natural international French; English: natural Canadian English. Each language reads as if written in it, never as a translation.

ALSO:
- name: a short internal name (« Groupe A1 janvier – relance démos »).
- subject_ideas_fr / subject_ideas_en: two other good subjects per language.
- preset: the layout that suits this email (classic: news and groups; hero: when a strong photo carries it; minimal: personal notes, surveys; bold: offers and deadlines; editorial: events and premium programs). theme: navy, bordeaux, gold, forest or plum.
- notes: short points the administrator must check (placeholders, assumptions), in the notes language, in plain words: never a field name or a technical term (no « primary_url », « null », « JSON », « schema »).
- image_prompt: in English, an art direction for an optional header photograph (adult learners of an ONLINE school at home; laptop or phone seen from the side, headphones, notebook; natural light). No text, no logos.

When the current email is given, change only what the brief asks and keep the rest.`;

const WORDS_SCHEMA = {
    type: 'object',
    properties: {
        subject: { type: 'string' }, preheader: { type: 'string' }, eyebrow: { type: 'string', nullable: true },
        headline: { type: 'string' }, body: { type: 'string' },
        highlights_title: { type: 'string', nullable: true }, highlights: { type: 'array', items: { type: 'string' } },
        steps_title: { type: 'string', nullable: true }, steps: { type: 'array', items: { type: 'string' } },
        offer_label: { type: 'string', nullable: true }, offer_note: { type: 'string', nullable: true }, deadline: { type: 'string', nullable: true },
        primary_label: { type: 'string' }, secondary_label: { type: 'string', nullable: true },
        signature: { type: 'string' }, ps: { type: 'string', nullable: true },
        form_title: { type: 'string', nullable: true }, form_intro: { type: 'string', nullable: true }, form_submit: { type: 'string', nullable: true },
        form_thanks_title: { type: 'string', nullable: true }, form_thanks_text: { type: 'string', nullable: true },
    },
    required: ['subject', 'preheader', 'headline', 'body', 'highlights', 'steps', 'primary_label', 'signature'],
};

const WRITER_SCHEMA = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        fr: WORDS_SCHEMA,
        en: WORDS_SCHEMA,
        primary_url: { type: 'string', nullable: true },
        offer: {
            type: 'object',
            properties: { show: { type: 'boolean' }, regular: { type: 'number', nullable: true }, promo: { type: 'number', nullable: true }, currency: { type: 'string', enum: ['CAD', 'USD', 'EUR'] } },
            required: ['show'],
        },
        form_fields: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' }, type: { type: 'string', enum: svc.FIELD_TYPES }, required: { type: 'boolean' },
                    label_fr: { type: 'string' }, label_en: { type: 'string' },
                    // Each choice as a pair, so neither language can be left out.
                    choices: {
                        type: 'array',
                        items: { type: 'object', properties: { fr: { type: 'string' }, en: { type: 'string' } }, required: ['fr', 'en'] },
                    },
                },
                required: ['id', 'type', 'required', 'label_fr', 'label_en'],
            },
        },
        preset: { type: 'string', enum: emailDesign.PRESETS },
        theme: { type: 'string', enum: Object.keys(emailDesign.BRAND) },
        subject_ideas_fr: { type: 'array', items: { type: 'string' } },
        subject_ideas_en: { type: 'array', items: { type: 'string' } },
        notes: { type: 'array', items: { type: 'string' } },
        image_prompt: { type: 'string' },
    },
    required: ['name', 'fr', 'en', 'offer', 'form_fields', 'preset', 'theme', 'subject_ideas_fr', 'subject_ideas_en', 'notes', 'image_prompt'],
};

const LIMITS = { subject: 70, preheader: 110, eyebrow: 40, headline: 80, highlight: 80, step: 120, label: 32, ps: 240, body: 2400, note: 140, title: 80, intro: 400 };

function bodyClean(text) {
    let t = String(text || '').replace(/\r/g, '');
    t = t.replace(/<[^>]{1,200}>/g, '').replace(/^#+\s*/gm, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '');
    t = t.replace(/([\p{L}\d])'(?=[\p{L}])/gu, '$1’');
    t = t.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    t = t.replace(/\{\s*first_?name\s*\}/gi, '{first_name}');
    return t.slice(0, LIMITS.body);
}

const fr = (t) => (t ? frenchTypography(t).replace(/\{ ?first_name ?\}/g, '{first_name}') : t);

function wordsFor(raw, lang) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const fix = (t) => (lang === 'fr' ? fr(t) : t);
    const line = (k, max) => {
        const t = plain(src[k]).replace(/\{\s*first_?name\s*\}/gi, '{first_name}');
        return t ? fix(cut(t, max)) : null;
    };
    const items = (k, n, max) => (Array.isArray(src[k]) ? src[k] : [])
        .map(h => plain(h).replace(/^(?:[-•·–*✓✔]+\s*|\d+[.)]\s+)/, '').replace(/[.;,]+$/, ''))
        .filter(Boolean).slice(0, n).map(h => fix(cut(h, max)));
    return {
        subject: line('subject', LIMITS.subject), preheader: line('preheader', LIMITS.preheader), eyebrow: line('eyebrow', LIMITS.eyebrow),
        headline: line('headline', LIMITS.headline), body: fix(bodyClean(src.body)) || null,
        highlights_title: line('highlights_title', LIMITS.title), highlights: items('highlights', 4, LIMITS.highlight),
        steps_title: line('steps_title', LIMITS.title), steps: items('steps', 3, LIMITS.step),
        offer_label: line('offer_label', LIMITS.title), offer_note: line('offer_note', LIMITS.note), deadline: line('deadline', LIMITS.note),
        primary_label: line('primary_label', LIMITS.label), secondary_label: line('secondary_label', LIMITS.label),
        signature: line('signature', 120), ps: line('ps', LIMITS.ps),
        form_title: line('form_title', LIMITS.title), form_intro: src.form_intro ? fix(cut(plain(src.form_intro), LIMITS.intro)) : null,
        form_submit: line('form_submit', LIMITS.label), form_thanks_title: line('form_thanks_title', LIMITS.title),
        form_thanks_text: src.form_thanks_text ? fix(cut(plain(src.form_thanks_text), LIMITS.intro)) : null,
    };
}

/**
 * The model's answer → the parts of the campaign. Links and WhatsApp
 * invitations only ever come from the administrator; buttons keep the
 * actions the administrator chose.
 */
function toCampaign(raw, ctx) {
    const content = { fr: wordsFor(raw.fr, 'fr'), en: wordsFor(raw.en, 'en') };
    const fixes = [];
    const allowed = new Set(ctx.allowedUrls);
    const url = plain(raw.primary_url);
    const buttons = {
        primary: { action: ctx.primary.action, url: null },
        secondary: { action: ctx.secondary.action, url: null },
    };
    for (const k of ['primary', 'secondary']) {
        const b = buttons[k];
        if (b.action === 'whatsapp') b.url = ctx[k].url || null;
        if (b.action === 'link') {
            if (ctx[k].url) b.url = ctx[k].url;
            else if (k === 'primary' && url && allowed.has(url)) b.url = url;
            else {
                b.url = k === 'primary' ? ctx.preferredUrl : null;
                if (k === 'primary' && url && url !== b.url) fixes.push('primary_url');
            }
        }
        if (b.action === 'none') for (const l of ['fr', 'en']) content[l][`${k}_label`] = null;
    }
    const usesForm = [buttons.primary, buttons.secondary].some(b => b.action === 'form');
    if (!usesForm) for (const l of ['fr', 'en']) for (const k of ['form_title', 'form_intro', 'form_submit', 'form_thanks_title', 'form_thanks_text']) content[l][k] = null;
    // Choices come as { fr, en } pairs (older answers: options_fr / options_en).
    const rawFields = (Array.isArray(raw.form_fields) ? raw.form_fields : []).map((f) => {
        if (!f || typeof f !== 'object' || !Array.isArray(f.choices)) return f;
        const pairs = f.choices.filter(c => c && typeof c === 'object').map(c => ({ fr: plain(c.fr) || plain(c.en), en: plain(c.en) || plain(c.fr) })).filter(c => c.fr);
        return { ...f, options_fr: pairs.map(c => c.fr), options_en: pairs.map(c => c.en) };
    });
    const form = usesForm ? svc.cleanForm({ fields: rawFields }) : { fields: [] };
    // Choices in one language only: the other language shows the same ones (and the administrator is told).
    for (const f of form.fields) {
        if (!['select', 'radio', 'checkbox'].includes(f.type)) continue;
        if (!f.options_en?.length && f.options_fr?.length) { f.options_en = [...f.options_fr]; fixes.push('form_options'); }
        if (!f.options_fr?.length && f.options_en?.length) { f.options_fr = [...f.options_en]; fixes.push('form_options'); }
        if (!f.label_en) f.label_en = f.label_fr;
        if (!f.label_fr) f.label_fr = f.label_en;
    }
    if (usesForm && !form.fields.some(f => f.type === 'email')) {
        form.fields = svc.cleanForm({ fields: [...svc.DEFAULT_FORM_FIELDS.slice(0, 2), ...form.fields] }).fields;
        fixes.push('form_email');
    }
    // Prices only from the facts: an offer without them is not shown.
    const o = raw.offer && typeof raw.offer === 'object' ? raw.offer : {};
    const price = (v) => (Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : null);
    const offer = { show: o.show === true, regular: price(o.regular), promo: price(o.promo), currency: ['CAD', 'USD', 'EUR'].includes(o.currency) ? o.currency : 'CAD' };
    if (offer.show && ctx.knownPrices) {
        const known = new Set(ctx.knownPrices.map(Number));
        if ((offer.regular !== null && !known.has(offer.regular)) || (offer.promo !== null && !known.has(offer.promo))) { offer.show = false; fixes.push('offer'); }
    }
    if (offer.regular === null && offer.promo === null) offer.show = false;
    if (offer.regular !== null && offer.promo !== null && offer.promo > offer.regular) [offer.regular, offer.promo] = [offer.promo, offer.regular];

    if (!content.fr.subject && !content.en.subject) throw new AiError('AI_NO_SUBJECT', 'The AI did not write a subject. Try again with a little more detail.', 502);
    if (!content.fr.body || !content.en.body) throw new AiError('AI_ONE_LANGUAGE', 'The AI wrote only one language. Try again.', 502);
    return {
        campaign: {
            name: cut(plain(raw.name), 120) || null,
            content, buttons, offer, form,
            design: emailDesign.preset(emailDesign.PRESETS.includes(raw.preset) ? raw.preset : 'classic', emailDesign.BRAND[raw.theme] ? raw.theme : (ctx.theme || 'navy')),
        },
        fixes,
    };
}

function promotionFacts(p, tz, defaultLang) {
    if (!p) return null;
    const s = siteUrl();
    const slug = encodeURIComponent(p.slug);
    const left = p.seat_limit ? Math.max(0, p.seat_limit - (Number(p.seats_taken) || 0) - (Number(p.seats_offline) || 0)) : null;
    return {
        title_fr: p.title_fr, title_en: p.title_en, tagline_fr: p.tagline_fr, tagline_en: p.tagline_en,
        description_fr: p.description_fr ? cut(p.description_fr, 700) : null, description_en: p.description_en ? cut(p.description_en, 700) : null,
        highlights_fr: p.highlights_fr, highlights_en: p.highlights_en,
        kind: p.kind, level: p.level, teacher: p.teacher_name,
        class_starts_on: p.class_starts || null, class_ends_on: p.class_ends || null,
        schedule_fr: p.schedule_fr, schedule_en: p.schedule_en,
        seats: p.seat_limit ? { group_size: p.seat_limit, seats_left: left } : null,
        price: p.price_regular !== null || p.price_promo !== null
            ? { regular: p.price_regular === null ? null : Number(p.price_regular), campaign_price: p.price_promo === null ? null : Number(p.price_promo), currency: p.currency, note_fr: p.price_note_fr, note_en: p.price_note_en }
            : null,
        registration_closes: p.ends_at ? isoToLocal(new Date(p.ends_at).toISOString(), tz) : null,
        theme: p.theme,
        link: defaultLang === 'en' ? `${s}/offers/?p=${slug}` : `${s}/fr/offres/?p=${slug}`,
    };
}

function audienceWords(counts) {
    if (!counts || !counts.total) return 'not chosen yet (write for students and people interested in the school).';
    const parts = Object.entries(counts.by_source || {}).filter(([, n]) => n > 0).map(([k, n]) => `${n} ${SOURCE_WORDS[k] || k}`);
    return `${counts.total} people: ${parts.join('; ')}.`;
}

/** A note about setting the form up: wrong, the platform hosts it (the model sometimes writes one anyway). */
const SETUP_WORDS = String.raw`(?:configur\w*|param[eéè]tr\w*|set(?:ting)? ?up|h[ée]berg\w*|host\w*|destination|URL)`;
const FORM_SETUP_NOTE = new RegExp(String.raw`${SETUP_WORDS}[^.]{0,60}\b(?:formulaire|form)\b|\b(?:formulaire|form)\b[^.]{0,60}${SETUP_WORDS}`, 'i');

/** Prices written in the brief (« 480 $ », « $600 »), so an offer box never shows another one. */
function pricesIn(text) {
    return [...String(text || '').matchAll(/(?:\$|€)\s?(\d{1,6}(?:[.,]\d{1,2})?)|(\d{1,6}(?:[.,]\d{1,2})?)\s?(?:\$|€|CAD|USD|EUR|dollars?)/gi)]
        .map(m => Number(String(m[1] || m[2]).replace(',', '.'))).filter(Number.isFinite);
}

async function draftEmail(db, { brief: rawBrief, goal, current, promotionId, primary, secondary, notesLang, timezone, userTimezone, model: requestedModel, pictureWanted, picturePrompt }) {
    const engineId = ai.activeEngine();
    const brief = briefOf(rawBrief);
    if (brief.length < 8) throw new AiError('AI_BRIEF_SHORT', 'Describe the email in a sentence or two (what it is about, for whom, the action you want).');
    const tz = zoneOf(timezone) || zoneOf(userTimezone) || 'America/Toronto';
    const lang = notesLang === 'fr' ? 'fr' : 'en';
    const now = new Date();
    const cleaned = svc.clean(current || {}).values;
    const defaultLang = cleaned.default_lang;
    const g = svc.GOALS.includes(goal) ? goal : cleaned.goal;

    // The buttons: what the administrator chose (or what the email has), checked.
    const button = (b, fallback, isSecondary) => {
        const action = ['link', 'form', 'whatsapp', ...(isSecondary ? ['none'] : [])].includes(b?.action) ? b.action : fallback.action;
        const url = String(b?.url ?? fallback.url ?? '').trim() || null;
        if (action === 'whatsapp' && url && !svc.WHATSAPP_RE.test(url)) throw new AiError('AI_WHATSAPP', 'The WhatsApp link must be a group invitation (https://chat.whatsapp.com/…).');
        if (action === 'link' && url && !svc.HTTPS_RE.test(url)) throw new AiError('AI_LINK', 'The button link must start with https://.');
        return { action, url: action === 'whatsapp' && url ? svc.tidyWhatsApp(url) : action === 'link' ? url : null };
    };
    const p = button(primary, cleaned.buttons.primary, false);
    const s = button(secondary, cleaned.buttons.secondary, true);

    let facts = null;
    const pid = Number(promotionId || cleaned.promotion_id);
    if (Number.isInteger(pid) && pid > 0) {
        const row = await db.get(`SELECT p.*, to_char(p.class_starts_on, 'YYYY-MM-DD') AS class_starts, to_char(p.class_ends_on, 'YYYY-MM-DD') AS class_ends,
                                         (SELECT COUNT(*)::int FROM promotion_registrations r WHERE r.promotion_id = p.id AND r.status IN ('new', 'contacted', 'confirmed')) AS seats_taken
                                    FROM promotions p WHERE p.id = $1`, [pid]).catch(() => null);
        facts = promotionFacts(row, tz, defaultLang);
    }
    let counts = null;
    if (cleaned.audience.sources.length) {
        try { counts = (await svc.audienceOf(db, cleaned.audience, cleaned.excluded)).counts; } catch { counts = null; }
    }

    const pages = sitePages();
    const allowedUrls = [...Object.values(pages).flatMap(v => [v.fr, v.en]), ...(facts ? [facts.link] : []), ...(p.url ? [p.url] : [])];
    const preferredUrl = p.url || facts?.link || pages.trial_class[defaultLang];
    const knownPrices = [...pricesIn(brief), ...(facts?.price ? [facts.price.regular, facts.price.campaign_price].filter(v => v !== null) : [])];
    const hasCurrent = !!(cleaned.content.fr.subject || cleaned.content.en.subject || cleaned.content.fr.body || cleaned.content.en.body);

    const parts = [
        `Today: ${isoToLocal(now.toISOString(), tz)} (${tz}).`,
        `Goal: ${GOAL_WORDS[g] || GOAL_WORDS.news}`,
        `Audience: ${audienceWords(counts)}`,
        `Main language of the readers: ${defaultLang === 'en' ? 'English' : 'French'}.`,
        `The main button ${ACTION_WORDS[p.action]}.${p.action === 'link' && p.url ? ` Its link: ${p.url}` : ''}`,
        `The second button ${ACTION_WORDS[s.action]}.${s.action === 'link' && s.url ? ` Its link: ${s.url}` : ''}`,
        `Notes language: ${lang === 'fr' ? 'French' : 'English'}.`,
        '',
        `Administrator's brief:\n"""\n${brief}\n"""`,
    ];
    if (facts) parts.push('', `Campaign facts (true, use them):\n${JSON.stringify(facts, null, 1)}`);
    if (p.action === 'link' && !p.url) parts.push('', `Site pages you may use for primary_url (French / English):\n${Object.entries(pages).map(([k, v]) => `- ${k}: ${v.fr} | ${v.en}`).join('\n')}`);
    if (hasCurrent) {
        // The form as the model writes it: choices in pairs.
        const formFields = cleaned.form.fields.map(({ options_fr: ofr, options_en: oen, ...f }) => (
            Array.isArray(ofr) && ofr.length ? { ...f, choices: ofr.map((c, i) => ({ fr: c, en: (oen || [])[i] || c })) } : f));
        parts.push('', `Current email (change only what the brief asks):\n${JSON.stringify({ content: cleaned.content, offer: cleaned.offer, form_fields: formFields }, null, 1)}`);
    }
    // The picture the administrator wants (it is drawn next, from image_prompt).
    const wish = cut(plain(picturePrompt), 600);
    if (pictureWanted && wish) {
        parts.push('', `The administrator wants a picture in this email, described as:\n"""\n${wish}\n"""\nimage_prompt: keep exactly this idea (who, where, doing what) and only add art direction (light, framing, mood), in English.`);
    } else if (pictureWanted) {
        parts.push('', 'The administrator wants a picture in this email: write image_prompt for a photograph that illustrates it.');
    }
    const prompt = parts.join('\n');
    const prefer = chosenModel(requestedModel, engineId);

    try {
        const { result, model, engine } = await ai.withFallback('writing', async (client, model) => {
            const response = await client.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { systemInstruction: WRITER, responseMimeType: 'application/json', responseSchema: WRITER_SCHEMA, temperature: 0.7, maxOutputTokens: 12000 },
            });
            const text = response.text;
            if (!text) throw ai.badAnswer('Empty answer');
            let raw;
            try { raw = JSON.parse(text); } catch { throw ai.badAnswer('The answer was not JSON'); }
            if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw ai.badAnswer('The answer was not an object');
            const { campaign, fixes } = toCampaign(raw, { allowedUrls, preferredUrl, primary: p, secondary: s, theme: facts?.theme, knownPrices });
            const ideas = (k) => (Array.isArray(raw[k]) ? raw[k] : []).map(x => plain(x)).filter(Boolean).slice(0, 3)
                .map(x => (k.endsWith('_fr') ? fr(cut(x, LIMITS.subject)) : cut(x, LIMITS.subject)));
            const told = [];
            if (fixes.includes('form_options')) {
                told.push(lang === 'fr'
                    ? 'Certains choix du formulaire n’existaient qu’en une langue : vérifiez leur traduction dans la partie Formulaire.'
                    : 'Some form choices existed in one language only: check their translation in the Form section.');
            }
            if (fixes.includes('offer')) {
                told.push(lang === 'fr' ? 'Le prix proposé par l’IA ne venait pas de vos informations : l’encadré prix est masqué.' : 'The price the AI suggested was not in your facts: the price box is hidden.');
            }
            return {
                fields: { ...campaign, goal: g, promotion_id: facts ? pid : cleaned.promotion_id },
                fixes,
                notes: [...told, ...(Array.isArray(raw.notes) ? raw.notes : []).map(n => plain(n)).filter(n => n && !FORM_SETUP_NOTE.test(n)).slice(0, 8).map(n => cut(n, 220))],
                subject_ideas: { fr: ideas('subject_ideas_fr'), en: ideas('subject_ideas_en') },
                image_prompt: cut(plain(raw.image_prompt), 900) || wish,
            };
        }, { label: 'Email writer', prefer, engine: engineId, emailCampaign: true });
        const instead = stoodIn(prefer, model, lang, engine);
        return { ...result, notes: instead ? [instead, ...result.notes] : result.notes, model, model_label: modelLabel(model), requested_model: prefer, choices: writingChoices(engine), engine };
    } catch (err) {
        if (err instanceof AiError) throw err;
        throw promoAi.unavailable(err);
    }
}

// ── The art director ───────────────────────────────────────────────────────

const DIRECTOR = `You are the art director of Learn French with Natives, an online French school whose logo is navy blue (#1d4577, #0b1733) and bordeaux (#a83342). You design marketing EMAILS (not web pages) and you know what works in Gmail, Outlook and Apple Mail on phones and computers.

Propose THREE complete designs for the email described, clearly different from each other (layout, header, colours, mood), each professional and on brand. Answer with the JSON of the schema only.

UI/UX RULES you follow:
- Hierarchy: one focal point (the headline), then the message, then ONE primary button visible on a phone's first screen (no long header before it). The second button is visually weaker.
- Readability: body text 15–17 px, line length ≤ 600 px, text aligned left (centre only the headline and short lines in centred layouts), generous white space, at most two fonts (web-safe only: system, humanist, georgia, trebuchet, verdana; georgia for elegant headlines only).
- Contrast: WCAG AA at least (4.5:1) for text and buttons; never light text on light colours; a dark header band needs light text.
- Colour: the brand's navy/bordeaux, or a theme's colours, used with restraint: one primary colour for buttons and links, one accent for small details, light neutral backgrounds (page_bg near white or very light grey, card_bg white, soft a light tint of the primary). Respect the administrator's colour wish.
- Buttons: at least 44 px tall (handled), clear verb; pill shapes feel friendly and modern, square ones formal, rounded ones neutral; full width suits offers on phones.
- Header: band (headline on a coloured band: strong and clear), hero (a photo carries the email: only when there is a picture), logo/centered (calm and personal), none (very short notes).
- Points: checks for benefits, cards for 3–4 strong selling points, numbers for steps or a programme.
- Match the goal: offers and deadlines → bold contrast and a visible price; groups and events → structure and trust; surveys and personal messages → minimal, warm; premium programmes → editorial.
- Each design gets a short name (2–4 words) and a rationale (1–2 sentences, why it suits this email and this audience), in French and in English.`;

const COLOR_SCHEMA = { type: 'string', description: 'Hex colour like #1d4577' };
const DESIGN_SCHEMA = {
    type: 'object',
    properties: {
        name_fr: { type: 'string' }, name_en: { type: 'string' }, rationale_fr: { type: 'string' }, rationale_en: { type: 'string' },
        preset: { type: 'string', enum: emailDesign.PRESETS }, theme: { type: 'string', enum: Object.keys(emailDesign.BRAND) },
        header: { type: 'string', enum: emailDesign.HEADERS }, logo: { type: 'string', enum: emailDesign.LOGOS }, align: { type: 'string', enum: emailDesign.ALIGNS },
        font: { type: 'string', enum: Object.keys(emailDesign.FONTS) }, heading_font: { type: 'string', enum: Object.keys(emailDesign.FONTS) },
        heading_size: { type: 'integer' }, body_size: { type: 'integer' }, radius: { type: 'integer' },
        button_shape: { type: 'string', enum: emailDesign.SHAPES }, button_width: { type: 'string', enum: emailDesign.WIDTHS },
        spacing: { type: 'string', enum: emailDesign.SPACINGS }, points: { type: 'string', enum: emailDesign.POINTS }, card: { type: 'string', enum: emailDesign.CARDS },
        colors: {
            type: 'object',
            properties: Object.fromEntries(emailDesign.COLOR_KEYS.map(k => [k, COLOR_SCHEMA])),
            required: emailDesign.COLOR_KEYS,
        },
    },
    required: ['name_fr', 'name_en', 'rationale_fr', 'rationale_en', 'preset', 'header', 'logo', 'align', 'font', 'heading_font', 'heading_size', 'body_size', 'radius', 'button_shape', 'button_width', 'spacing', 'points', 'card', 'colors'],
};
const DIRECTOR_SCHEMA = { type: 'object', properties: { designs: { type: 'array', items: DESIGN_SCHEMA } }, required: ['designs'] };

const STYLE_WORDS = {
    professional: 'professional and trustworthy', modern: 'modern and fresh', elegant: 'elegant and premium',
    warm: 'warm, friendly and human', bold: 'bold, high-contrast, energetic', minimal: 'minimal, calm, lots of white space',
};

async function proposeDesigns({ campaign, wishes = {}, model: requestedModel, lang = 'en' }) {
    const engineId = ai.activeEngine();
    const prefer = chosenModel(requestedModel, engineId);
    const c = svc.clean(campaign || {}).values;
    const w = c.content[c.default_lang] || c.content.fr;
    const summary = {
        goal: c.goal,
        subject: w.subject, headline: w.headline, eyebrow: w.eyebrow,
        words_in_message: String(w.body || '').split(/\s+/).filter(Boolean).length,
        key_points: w.highlights.length, steps: w.steps.length,
        offer: c.offer.show ? { regular: c.offer.regular, promo: c.offer.promo } : null,
        main_button: c.buttons.primary.action, second_button: c.buttons.secondary.action,
        has_picture: !!c.image_key,
        current_layout: c.design.preset,
    };
    const style = STYLE_WORDS[wishes.style] || null;
    const color = /^#?[0-9a-f]{6}$/i.test(String(wishes.color || '')) ? `#${String(wishes.color).replace('#', '')}` : (emailDesign.BRAND[wishes.color] ? `the ${wishes.color} theme (${emailDesign.BRAND[wishes.color].primary})` : 'the school’s brand colours');
    const header = ['band', 'hero', 'logo', 'centered', 'none'].includes(wishes.header) ? wishes.header : 'your choice';
    const notes = briefOf(wishes.notes).slice(0, 600);
    const prompt = [
        `The email:\n${JSON.stringify(summary, null, 1)}`,
        '',
        `The administrator's wishes:`,
        `- Mood: ${style || 'your choice (professional)'}`,
        `- Colours: ${color}`,
        `- Header: ${header}${header === 'hero' && !summary.has_picture ? ' (there is no picture yet: the band is used until one is added)' : ''}`,
        notes ? `- Other wishes: """${notes}"""` : '',
        '',
        'Propose three different designs.',
    ].filter(Boolean).join('\n');

    try {
        const { result, model, engine } = await ai.withFallback('writing', async (client, model) => {
            const response = await client.models.generateContent({
                model,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { systemInstruction: DIRECTOR, responseMimeType: 'application/json', responseSchema: DIRECTOR_SCHEMA, temperature: 0.9, maxOutputTokens: 8000 },
            });
            let raw;
            try { raw = JSON.parse(response.text || ''); } catch { throw ai.badAnswer('The answer was not JSON'); }
            const designs = (Array.isArray(raw?.designs) ? raw.designs : []).slice(0, 3).map(d => {
                const { design, fixes } = emailDesign.clean(d);
                // French typography in the French name and reason (« l’autorité », « école : »).
                for (const k of ['name_fr', 'rationale_fr']) if (design[k]) design[k] = fr(String(design[k]).replace(/([\p{L}])'(?=[\p{L}])/gu, '$1’'));
                return { ...design, fixed: fixes };
            });
            if (designs.length < 2) throw ai.badAnswer('Fewer than two designs');
            return designs;
        }, { label: 'Email art director', prefer, engine: engineId, emailCampaign: true });
        return { designs: result, model, model_label: modelLabel(model), requested_model: prefer, notice: stoodIn(prefer, model, lang === 'fr' ? 'fr' : 'en', engine), choices: writingChoices(engine), engine };
    } catch (err) {
        if (err instanceof AiError) throw err;
        throw promoAi.unavailable(err);
    }
}

module.exports = { draftEmail, proposeDesigns, writingChoices, checkWritingModels, modelLabel, toCampaign, bodyClean, sitePages, promotionFacts, pricesIn, WRITER, DIRECTOR, WRITER_SCHEMA, DIRECTOR_SCHEMA, AiError };
