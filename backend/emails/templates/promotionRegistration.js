const { baseHtml, detailCard, infoStrip, ctaButton, escapeHtml } = require('./base');

/**
 * The email a visitor receives after registering for a campaign (a group
 * class, an offer, an event), in the language of the page they were on.
 */

const WORDS = {
    en: {
        subject: (title) => `Your registration: ${title}`,
        waitSubject: (title) => `You are on the waiting list: ${title}`,
        title: 'Your registration is confirmed',
        waitTitle: 'You are on the waiting list',
        preheader: 'We have your registration. Here is what happens next.',
        eyebrow: 'REGISTRATION',
        hi: (name) => `Hi <strong>${name}</strong>,`,
        intro: (title) => `Thank you for registering for <strong>${title}</strong>. Your seat request is with our team.`,
        waitIntro: (title) => `Thank you for your interest in <strong>${title}</strong>. The group is full for now: you are on the waiting list, and we will write to you as soon as a seat opens or a new group starts.`,
        next: 'A member of our team will contact you within one working day to confirm your seat and answer your questions. Nothing is charged at this stage.',
        starts: 'Starts', ends: 'Ends', schedule: 'Schedule', level: 'Level', teacher: 'Teacher', price: 'Price',
        open: 'See the details',
        meanwhile: 'In the meantime, our free interactive French courses are open to you, with no account.',
    },
    fr: {
        subject: (title) => `Votre inscription : ${title}`,
        waitSubject: (title) => `Vous êtes sur la liste d’attente : ${title}`,
        title: 'Votre inscription est bien reçue',
        waitTitle: 'Vous êtes sur la liste d’attente',
        preheader: 'Nous avons bien reçu votre inscription. Voici la suite.',
        eyebrow: 'INSCRIPTION',
        hi: (name) => `Bonjour <strong>${name}</strong>,`,
        intro: (title) => `Merci de votre inscription à <strong>${title}</strong>. Votre demande de place est entre les mains de notre équipe.`,
        waitIntro: (title) => `Merci de votre intérêt pour <strong>${title}</strong>. Le groupe est complet pour le moment : vous êtes sur la liste d’attente, et nous vous écrirons dès qu’une place se libère ou qu’un nouveau groupe démarre.`,
        next: 'Un membre de notre équipe vous contactera sous un jour ouvré pour confirmer votre place et répondre à vos questions. Rien n’est facturé à ce stade.',
        starts: 'Début', ends: 'Fin', schedule: 'Horaires', level: 'Niveau', teacher: 'Enseignant', price: 'Tarif',
        open: 'Voir les détails',
        meanwhile: 'En attendant, nos cours de français interactifs gratuits vous sont ouverts, sans compte.',
    },
};

const plain = (html) => html.replace(/<\/?strong>/g, '');
const dateIn = (lang, day) => new Date(`${day}T12:00:00Z`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
const amount = (lang, value, currency) => new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency', currency, maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
}).format(value);

/**
 * @param {{ lang: 'fr'|'en', name: string, promotion: object, waitlist: boolean, detailsUrl: string }} args
 *   `promotion` is the public shape of the campaign (promotionService.publicShape).
 */
function buildPromotionRegistrationTemplate({ lang, name, promotion, waitlist, detailsUrl }) {
    const l = lang === 'fr' ? 'fr' : 'en';
    const w = WORDS[l];
    const t = promotion.text[l];
    const title = t.title || '';
    const subject = waitlist ? w.waitSubject(title) : w.subject(title);

    const rows = [];
    if (promotion.class_starts_on) rows.push({ label: w.starts, value: escapeHtml(dateIn(l, promotion.class_starts_on)) });
    if (promotion.class_ends_on) rows.push({ label: w.ends, value: escapeHtml(dateIn(l, promotion.class_ends_on)) });
    if (t.schedule) rows.push({ label: w.schedule, value: escapeHtml(t.schedule) });
    if (promotion.level) rows.push({ label: w.level, value: escapeHtml(promotion.level) });
    if (promotion.teacher) rows.push({ label: w.teacher, value: escapeHtml(promotion.teacher) });
    const price = promotion.price && (promotion.price.promo ?? promotion.price.regular);
    if (price !== null && price !== undefined && price !== false) {
        rows.push({ label: w.price, value: escapeHtml(`${amount(l, price, promotion.price.currency)}${t.price_note ? ` ${t.price_note}` : ''}`) });
    }

    const intro = waitlist ? w.waitIntro(escapeHtml(title)) : w.intro(escapeHtml(title));
    const bodyHtml = `
      <p style="margin:0 0 14px; font-size:15px; color:#0f172a;">${w.hi(escapeHtml(name))}</p>
      <p style="margin:0 0 22px; font-size:14.5px; color:#475569; line-height:1.65;">${intro}</p>
      ${rows.length ? detailCard({ rows }) : ''}
      ${waitlist ? '' : infoStrip({ tone: 'info', text: w.next })}
      ${ctaButton({ label: w.open, href: detailsUrl })}
      <p style="margin:18px 0 0; font-size:13px; color:#64748b; line-height:1.6;">${w.meanwhile}</p>
    `;
    const html = baseHtml({ subject, preheader: w.preheader, eyebrow: w.eyebrow, title: waitlist ? w.waitTitle : w.title, bodyHtml, lang: l });
    const text = [
        `${l === 'fr' ? 'Bonjour' : 'Hi'} ${name},`, '',
        plain(waitlist ? w.waitIntro(title) : w.intro(title)), '',
        ...rows.map(r => `${r.label}: ${r.value.replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, '’').replace(/&quot;/g, '"')}`),
        ...(rows.length ? [''] : []),
        ...(waitlist ? [] : [w.next, '']),
        `${w.open}: ${detailsUrl}`,
    ].join('\n');
    return { subject, html, text };
}

module.exports = { buildPromotionRegistrationTemplate };
