/**
 * The email of a campaign, as its recipients receive it: one HTML page built
 * for mail programs (tables, inline styles, no script, web-safe fonts), a
 * text version, and the subject — drawn from its words (French and English),
 * its buttons, its offer and its design (emailDesign.js).
 *
 *  · 600 px on a computer, the whole screen on a phone (one column, buttons
 *    the width of the screen, a smaller headline).
 *  · Gmail, Outlook, Apple Mail, Yahoo: tables and inline styles; a button is
 *    a coloured cell, so it stays a button where rounded corners are ignored.
 *  · Long text stays aligned left even in a centred layout (easier to read);
 *    only the headline, the buttons and short lines are centred.
 *  · Every link is a tracking link of this person (or the link itself in a
 *    preview and a test); every email ends with why it was received, the
 *    sender's postal address and a one-click unsubscribe link.
 *
 * The message may use a little formatting: an empty line between two
 * paragraphs, "- " for a list, **bold**, [text](https://link), and
 * {first_name}, replaced by the person's first name (or removed).
 */
const { getLogoUrl, getSupportEmail } = require('../emails/templates/base');
const D = require('./emailDesign');

const WHATSAPP = '#1fa855';
const siteUrl = () => (process.env.FRONTEND_URL || 'https://www.learnfrenchwithnatives.com').replace(/\/$/, '');
const apiUrl = () => (process.env.API_PUBLIC_URL || 'https://api.learnfrenchwithnatives.com').replace(/\/$/, '');
const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const NBSP = ' ';

/** {first_name} → the name; without a name the token goes, with the space before it ("Bonjour {first_name}," → "Bonjour,"). */
function personalize(text, firstName) {
    if (!text) return '';
    const name = String(firstName || '').trim();
    return name ? text.replace(/\{first_name\}/g, name) : text.replace(/[   ]*\{first_name\}/g, '');
}

/** A picture of the campaign, as a JPEG mail programs can all show. */
const imageUrl = (key) => (key ? `${apiUrl()}/api/public/email/img/${encodeURIComponent(key)}.jpg` : null);

/** "480 $" in French, "$480" in English. */
function money(value, currency, lang) {
    const n = Number(value);
    if (value === null || value === undefined || value === '' || !Number.isFinite(n)) return '';
    const s = n % 1 ? n.toFixed(2).replace('.', lang === 'fr' ? ',' : '.') : String(n);
    if (currency === 'EUR') return lang === 'fr' ? `${s}${NBSP}€` : `€${s}`;
    if (currency === 'USD') return lang === 'fr' ? `${s}${NBSP}$${NBSP}US` : `US$${s}`;
    return lang === 'fr' ? `${s}${NBSP}$` : `$${s}`;
}

// ── Words ──────────────────────────────────────────────────────────────────

const DEFAULT_LABEL = {
    link: { fr: 'En savoir plus', en: 'Learn more' },
    form: { fr: 'Je réponds', en: 'Reply now' },
    whatsapp: { fr: 'Rejoindre le groupe WhatsApp', en: 'Join the WhatsApp group' },
};
const WORDS = {
    fr: {
        view: 'Voir dans le navigateur', unsubscribe: 'Se désinscrire', team: 'L’équipe Learn French with Natives',
        or: 'ou', other: 'English version below', otherLabel: 'ENGLISH', rights: 'Tous droits réservés.',
        help: 'Une question ? Répondez simplement à cet email.', ps: 'P.-S.', until: 'Jusqu’au',
    },
    en: {
        view: 'View in your browser', unsubscribe: 'Unsubscribe', team: 'The Learn French with Natives team',
        or: 'or', other: 'Version française ci-dessous', otherLabel: 'FRANÇAIS', rights: 'All rights reserved.',
        help: 'A question? Just reply to this email.', ps: 'P.S.', until: 'Until',
    },
};
const REASON = {
    student: { fr: 'Vous recevez cet email parce que vous êtes élève chez Learn French with Natives.', en: 'You are receiving this email because you are a student at Learn French with Natives.' },
    candidate: { fr: 'Vous recevez cet email parce que vous préparez un examen avec Learn French with Natives.', en: 'You are receiving this email because you are preparing an exam with Learn French with Natives.' },
    demo: { fr: 'Vous recevez cet email parce que vous avez demandé un cours d’essai à Learn French with Natives.', en: 'You are receiving this email because you asked Learn French with Natives for a trial class.' },
    registration: { fr: 'Vous recevez cet email parce que vous vous êtes inscrit à l’une de nos offres.', en: 'You are receiving this email because you registered for one of our offers.' },
    test: { fr: 'Ceci est un email de test : les liens ne sont pas suivis et la désinscription ne fait rien.', en: 'This is a test email: links are not tracked and unsubscribing does nothing.' },
};

/** One language's words, completed by the other language where a field is empty. */
function wordsOf(c, lang) {
    const other = lang === 'fr' ? 'en' : 'fr';
    const content = c.content && typeof c.content === 'object' ? c.content : {};
    const own = content[lang] || {};
    const alt = content[other] || {};
    const pick = (k) => (own[k] || alt[k] || null);
    const list = (k) => {
        const a = Array.isArray(own[k]) ? own[k].filter(Boolean) : [];
        return a.length ? a : (Array.isArray(alt[k]) ? alt[k].filter(Boolean) : []);
    };
    const b = c.buttons || {};
    const label = (which) => {
        const action = b[which]?.action;
        if (!action || action === 'none') return null;
        return pick(`${which}_label`) || DEFAULT_LABEL[action]?.[lang] || DEFAULT_LABEL.link[lang];
    };
    return {
        subject: pick('subject'), preheader: pick('preheader'), eyebrow: pick('eyebrow'), headline: pick('headline'), body: pick('body'),
        highlights_title: pick('highlights_title'), highlights: list('highlights').slice(0, 5),
        steps_title: pick('steps_title'), steps: list('steps').slice(0, 4),
        offer_label: pick('offer_label'), offer_note: pick('offer_note'), deadline: pick('deadline'),
        primary: label('primary'), secondary: label('secondary'),
        ps: pick('ps'), signature: pick('signature'),
    };
}

// ── Pieces of HTML ─────────────────────────────────────────────────────────

const LINK_MD = /\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]{3,600})\)/g;

function inline(escaped, link, color) {
    return escaped
        .replace(/\*\*([^*\n]{1,200})\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]\n]{1,120})\]\((https?:\/\/[^\s)]{3,600})\)/g, (_m, text, url) =>
            `<a href="${esc(link(url.replace(/&amp;/g, '&'), text))}" target="_blank" style="color: ${color}; text-decoration: underline; font-weight: 600;">${text}</a>`);
}

function bodyText(text) {
    return String(text || '').replace(/\r/g, '').replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(LINK_MD, '$1 ($2)').replace(/\n{3,}/g, '\n\n').trim();
}

/** Everything the pieces need to know about the design. */
function styleOf(design) {
    const d = design;
    const space = { compact: [26, 28, 14], normal: [34, 40, 18], airy: [44, 48, 22] }[d.spacing] || [34, 40, 18];
    return {
        d, c: d.colors,
        font: D.FONTS[d.font] || D.FONTS.system,
        heading: D.FONTS[d.heading_font] || D.FONTS.system,
        padY: space[0], padX: space[1], gap: space[2],
        inner: Math.min(d.radius, 14),
        buttonRadius: d.button_shape === 'pill' ? 999 : d.button_shape === 'square' ? 0 : 10,
        center: d.align === 'center',
    };
}

function paragraphs(text, s, link) {
    const blocks = String(text || '').replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
    return blocks.map(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length && lines.every(l => /^[-•·*]\s+/.test(l))) {
            const items = lines.map(l => `<li style="margin: 0 0 6px;">${inline(esc(l.replace(/^[-•·*]\s+/, '')), link, s.d.link)}</li>`).join('');
            return `<ul style="margin: 0 0 ${s.gap}px; padding: 0 0 0 22px; font-family: ${s.font}; font-size: ${s.d.body_size}px; line-height: 1.6; color: ${s.c.text}; text-align: left;">${items}</ul>`;
        }
        return `<p style="margin: 0 0 ${s.gap}px; font-family: ${s.font}; font-size: ${s.d.body_size}px; line-height: 1.65; color: ${s.c.text}; text-align: left;">${lines.map(l => inline(esc(l), link, s.d.link)).join('<br />')}</p>`;
    }).join('\n');
}

function heading(text, s, { color, size, align, margin = '0 0 16px' } = {}) {
    return `<h1 class="h1" style="margin: ${margin}; font-family: ${s.heading}; font-size: ${size || s.d.heading_size}px; line-height: 1.22; font-weight: ${s.d.heading_font === 'georgia' ? 700 : 800}; letter-spacing: ${s.d.heading_font === 'georgia' ? '-0.2px' : '-0.5px'}; color: ${color || s.c.heading}; text-align: ${align || (s.center ? 'center' : 'left')};">${esc(text)}</h1>`;
}

function eyebrow(text, s, color) {
    return `<p style="margin: 0 0 10px; font-family: ${s.font}; font-size: 12px; line-height: 1.4; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: ${color}; text-align: ${s.center ? 'center' : 'left'};">${esc(text)}</p>`;
}

function smallTitle(text, s) {
    return `<p style="margin: 0 0 10px; font-family: ${s.heading}; font-size: 17px; line-height: 1.3; font-weight: 800; color: ${s.c.heading}; text-align: left;">${esc(text)}</p>`;
}

/** A button: a coloured cell holding the link (a button everywhere, Outlook included). */
function button({ href, label, s, kind }) {
    const whatsapp = kind === 'whatsapp';
    const outline = kind === 'outline';
    const bg = whatsapp ? WHATSAPP : outline ? 'transparent' : s.c.primary;
    const color = whatsapp ? '#ffffff' : outline ? s.d.link : s.d.button_text;
    const border = outline ? `2px solid ${s.d.link}` : `2px solid ${bg}`;
    const full = s.d.button_width === 'full';
    return `
<table role="presentation" class="btn${full ? ' is-full' : ''}" cellspacing="0" cellpadding="0" border="0"${s.center && !full ? ' align="center"' : ''} ${full ? 'width="100%"' : ''} style="margin: 6px ${s.center ? 'auto' : '0'} 10px;${full ? ' width: 100%;' : ''}">
  <tr>
    <td align="center" ${outline ? '' : `bgcolor="${bg}"`} style="border-radius: ${s.buttonRadius}px; background: ${bg};">
      <a href="${esc(href)}" target="_blank" style="display: ${full ? 'block' : 'inline-block'}; padding: 15px 30px; border: ${border}; border-radius: ${s.buttonRadius}px; font-family: ${s.font}; font-size: 16px; line-height: 20px; font-weight: 700; color: ${color}; text-decoration: none; text-align: center;">${esc(label)}${outline || whatsapp ? '' : '&nbsp;&rarr;'}</a>
    </td>
  </tr>
</table>`;
}

function points(w, s, link) {
    if (!w.highlights.length) return '';
    const title = w.highlights_title ? smallTitle(w.highlights_title, s) : '';
    if (s.d.points === 'cards') {
        return `${title}${w.highlights.map(h => `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 8px;">
  <tr><td style="background: ${s.c.soft}; border-left: 4px solid ${s.c.primary}; border-radius: ${s.inner}px; padding: 12px 16px; font-family: ${s.font}; font-size: ${s.d.body_size - 0.5}px; line-height: 1.5; color: ${s.c.text}; text-align: left;">${inline(esc(h), link, s.d.link)}</td></tr>
</table>`).join('')}<div style="height: ${s.gap - 6}px; line-height: 0; font-size: 0;">&nbsp;</div>`;
    }
    const numbered = s.d.points === 'numbers';
    const rows = w.highlights.map((h, i) => `
      <tr>
        <td valign="top" width="${numbered ? 34 : 26}" style="padding: 5px 0;">${numbered
            ? `<div style="width: 24px; height: 24px; border-radius: 12px; background: ${s.c.primary}; color: ${s.d.button_text}; font-family: ${s.font}; font-size: 12px; line-height: 24px; font-weight: 800; text-align: center;">${i + 1}</div>`
            : `<span style="font-family: ${s.font}; font-size: 16px; line-height: 22px; font-weight: 800; color: ${s.d.link};">&#10003;</span>`}</td>
        <td valign="top" style="padding: 5px 0; font-family: ${s.font}; font-size: ${s.d.body_size - 0.5}px; line-height: ${numbered ? 24 : 22}px; color: ${s.c.text}; text-align: left;">${inline(esc(h), link, s.d.link)}</td>
      </tr>`).join('');
    return `${title}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 2px 0 ${s.gap + 4}px;">
  <tr><td style="background: ${s.c.soft}; border-radius: ${s.inner}px; padding: 14px 20px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}
    </table>
  </td></tr>
</table>`;
}

function offerBox(c, w, s, lang) {
    const o = c.offer || {};
    if (!o.show) return '';
    const promo = money(o.promo, o.currency, lang);
    const regular = money(o.regular, o.currency, lang);
    if (!promo && !regular) return '';
    const now = promo || regular;
    const was = promo && regular && promo !== regular ? regular : '';
    return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 4px 0 ${s.gap + 4}px;">
  <tr><td align="center" style="background: ${s.c.soft}; border: 1px solid ${s.c.primary}; border-radius: ${s.inner}px; padding: 18px 20px; text-align: center;">
    ${w.offer_label ? `<p style="margin: 0 0 6px; font-family: ${s.font}; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: ${s.d.link};">${esc(w.offer_label)}</p>` : ''}
    <p style="margin: 0; font-family: ${s.heading}; color: ${s.c.heading};">
      ${was ? `<span style="font-size: 18px; color: ${s.c.muted}; text-decoration: line-through;">${esc(was)}</span>&nbsp;&nbsp;` : ''}<span style="font-size: 32px; line-height: 1.2; font-weight: 800;">${esc(now)}</span>
    </p>
    ${w.offer_note ? `<p style="margin: 6px 0 0; font-family: ${s.font}; font-size: 14px; line-height: 1.5; color: ${s.c.muted};">${esc(w.offer_note)}</p>` : ''}
    ${w.deadline ? `<p style="margin: 8px 0 0; font-family: ${s.font}; font-size: 14px; line-height: 1.5; font-weight: 700; color: ${s.c.text};">${esc(w.deadline)}</p>` : ''}
  </td></tr>
</table>`;
}

function steps(w, s, link) {
    if (!w.steps.length) return '';
    const rows = w.steps.map((step, i) => `
  <tr>
    <td valign="top" width="40" style="padding: 0 0 12px;"><div style="width: 28px; height: 28px; border-radius: 14px; background: ${s.c.heading}; color: ${D.readable('#ffffff', s.c.heading)}; font-family: ${s.font}; font-size: 13px; line-height: 28px; font-weight: 800; text-align: center;">${i + 1}</div></td>
    <td valign="top" style="padding: 3px 0 12px; font-family: ${s.font}; font-size: ${s.d.body_size - 0.5}px; line-height: 1.5; color: ${s.c.text}; text-align: left;">${inline(esc(step), link, s.d.link)}</td>
  </tr>`).join('');
    return `${w.steps_title ? smallTitle(w.steps_title, s) : ''}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 ${s.gap}px;">${rows}
</table>`;
}

function contentRows(c, lang, { link, firstName, s, inBand }) {
    const w = wordsOf(c, lang);
    const t = WORDS[lang];
    const b = c.buttons || {};
    const rows = [];
    if (!inBand) {
        if (w.eyebrow) rows.push(eyebrow(personalize(w.eyebrow, firstName), s, s.d.link));
        if (w.headline) rows.push(heading(personalize(w.headline, firstName), s));
    }
    // The picture under the headline (in the text, or right under the band that holds the headline);
    // with the « Photo » header it is at the top instead.
    const picture = imageUrl(c.image_key);
    if (picture && s.d.header !== 'hero') {
        rows.push(`<div style="margin: ${inBand ? 0 : 4}px 0 ${s.gap + 4}px; line-height: 0; font-size: 0;"><img src="${esc(picture)}" width="520" alt="${esc(w.headline || '')}" class="pic" style="display: block; width: 100%; max-width: 520px; height: auto; border: 0; border-radius: ${s.inner}px;" /></div>`);
    }
    rows.push(paragraphs(personalize(w.body, firstName), s, link));
    rows.push(points(w, s, link));
    rows.push(offerBox(c, w, s, lang));
    rows.push(steps(w, s, link));
    if (w.primary) {
        const action = b.primary.action;
        rows.push(button({ href: link(action === 'form' ? 'form' : b.primary.url, w.primary), label: w.primary, s, kind: action === 'whatsapp' ? 'whatsapp' : 'solid' }));
    }
    if (w.secondary) {
        const action = b.secondary.action;
        rows.push(`<p style="margin: 2px 0 2px; font-family: ${s.font}; font-size: 13px; color: ${s.c.muted}; text-align: ${s.center ? 'center' : 'left'};">${t.or}</p>`);
        rows.push(button({ href: link(action === 'form' ? 'form' : b.secondary.url, w.secondary), label: w.secondary, s, kind: action === 'whatsapp' ? 'whatsapp' : 'outline' }));
    }
    rows.push(`<p style="margin: ${s.gap + 4}px 0 0; font-family: ${s.font}; font-size: ${s.d.body_size - 0.5}px; line-height: 1.6; color: ${s.c.text}; text-align: ${s.center ? 'center' : 'left'};">${esc(personalize(w.signature, firstName) || t.team)}</p>`);
    if (w.ps) {
        rows.push(`<p style="margin: ${s.gap}px 0 0; padding-top: ${s.gap - 2}px; border-top: 1px solid ${s.c.soft}; font-family: ${s.font}; font-size: 14.5px; line-height: 1.6; color: ${s.c.muted}; text-align: left;"><strong style="color: ${s.c.text};">${t.ps}</strong> ${inline(esc(personalize(w.ps, firstName)), link, s.d.link)}</p>`);
    }
    return rows.filter(Boolean).join('\n');
}

/** The logo with the school's name, as on the site's header. */
function brandMark(s, { align = 'left', onDark = false } = {}) {
    const nameColor = onDark ? '#ffffff' : '#0b1733';
    const subColor = onDark ? '#ffd9a0' : '#a83342';
    // align="left" would make the table float: only a centred mark gets the attribute.
    return `<table role="presentation" cellspacing="0" cellpadding="0" border="0"${align === 'center' ? ' align="center" style="margin: 0 auto;"' : ''}><tr>
      <td valign="middle" style="padding-right: 10px;"><img src="${esc(getLogoUrl())}" width="40" height="40" alt="" style="display: block; width: 40px; height: 40px; border: 0; border-radius: 8px;${onDark ? ' background: #ffffff;' : ''}" /></td>
      <td valign="middle" style="font-family: ${s.font}; font-size: 15px; line-height: 17px; font-weight: 800; letter-spacing: -0.2px; color: ${nameColor}; text-align: left;">Learn French<br /><span style="font-size: 13px; font-weight: 700; color: ${subColor};">with Natives</span></td>
    </tr></table>`;
}

// ── The whole email ────────────────────────────────────────────────────────

/**
 * Renders a campaign for one person.
 *
 * @param {object} c   the campaign: content, buttons, offer, design, image_key
 * @param {object} o   lang ('fr' | 'en' | 'both'), firstName, source, link(url, label),
 *                     unsubscribeUrl, viewUrl, openUrl, postalAddress
 */
function renderEmail(c, o = {}) {
    const lang = ['fr', 'en', 'both'].includes(o.lang) ? o.lang : 'fr';
    const main = lang === 'both' ? 'fr' : lang;
    const { design } = D.clean(c.design || {});
    const s = styleOf(design);
    const link = o.link || ((url) => url);
    const firstName = o.firstName || '';
    const w = wordsOf(c, main);
    const t = WORDS[main];
    const subject = personalize(w.subject || w.headline || 'Learn French with Natives', firstName).replace(/\s+/g, ' ').trim();
    const preheader = personalize(w.preheader || '', firstName).trim();
    const picture = imageUrl(c.image_key);
    const reasonKey = REASON[o.source] ? o.source : 'registration';
    const reason = lang === 'both' ? `${esc(REASON[reasonKey].fr)}<br />${esc(REASON[reasonKey].en)}` : esc(REASON[reasonKey][main]);
    const address = String(o.postalAddress || '').trim();
    const home = link(siteUrl(), 'logo');

    // Where the header shows: the hero falls back on the band without a picture.
    const header = design.header === 'hero' && !picture ? 'band' : design.header;
    const logoInHeader = design.logo === 'header' && ['band', 'logo', 'centered'].includes(header);
    const logoOnTop = design.logo === 'top' || (design.logo === 'header' && !logoInHeader);
    const inBand = header === 'band';
    const align = s.center ? 'center' : 'left';

    let top = '';
    if (header === 'band') {
        top = `<tr><td class="band" bgcolor="${s.c.header_bg}" style="background: ${s.c.header_bg}; padding: ${s.padY + 2}px ${s.padX}px ${s.padY}px; text-align: ${align};">
        ${logoInHeader ? `<div style="margin: 0 0 22px;">${brandMark(s, { align, onDark: D.contrast('#ffffff', s.c.header_bg) > 3 })}</div>` : ''}
        ${s.center ? '' : `<div style="width: 44px; height: 4px; background: ${s.c.accent}; border-radius: 4px; margin: 0 0 18px; font-size: 0; line-height: 0;">&nbsp;</div>`}
        ${w.eyebrow ? eyebrow(personalize(w.eyebrow, firstName), s, D.readable(s.c.accent, s.c.header_bg, 3)) : ''}
        ${heading(personalize(w.headline || subject, firstName), s, { color: s.c.header_text, margin: '0' })}
      </td></tr>`;
    } else if (header === 'hero') {
        top = `<tr><td style="padding: 0; line-height: 0; font-size: 0;"><a href="${esc(home)}" target="_blank" style="text-decoration: none;"><img src="${esc(picture)}" width="600" alt="${esc(w.headline || '')}" class="hero" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" /></a></td></tr>
      <tr><td style="height: 5px; line-height: 5px; font-size: 0; background: ${s.c.accent};">&nbsp;</td></tr>`;
    } else if (header === 'logo' || header === 'centered') {
        const line = D.contrast(s.c.accent, s.c.header_bg) >= 1.6 ? s.c.accent : s.c.primary;
        top = `<tr><td bgcolor="${s.c.header_bg}" style="background: ${s.c.header_bg}; padding: ${Math.round(s.padY * 0.8)}px ${s.padX}px ${Math.round(s.padY * 0.6)}px; text-align: ${header === 'centered' ? 'center' : align};">
        ${logoInHeader ? brandMark(s, { align: header === 'centered' ? 'center' : align, onDark: D.contrast('#ffffff', s.c.header_bg) > 3 }) : ''}
      </td></tr>
      <tr><td style="padding: 0 ${s.padX}px;"><div style="height: 3px; line-height: 3px; font-size: 0; background: ${line}; border-radius: 3px;${header === 'centered' ? ' width: 64px; margin: 0 auto;' : ''}">&nbsp;</div></td></tr>`;
    }

    const sections = [contentRows(c, main, { link, firstName, s, inBand })];
    if (lang === 'both') {
        sections.push(`
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 30px 0 26px;">
  <tr><td style="border-top: 2px solid ${s.c.soft}; padding-top: 14px; font-family: ${s.font}; font-size: 11px; font-weight: 800; letter-spacing: 1.4px; color: ${s.d.link};"><a name="en" id="en"></a>${WORDS.fr.otherLabel}</td></tr>
</table>`);
        sections.push(contentRows(c, 'en', { link, firstName, s, inBand: false }));
    }

    const card = design.card === 'flat' ? '' : design.card === 'shadow'
        ? `border: 1px solid #e6e9ef; box-shadow: 0 10px 30px -12px rgba(11, 23, 51, 0.22);`
        : `border: 1px solid #e3e7ee;`;

    const html = `<!DOCTYPE html>
<html lang="${main}" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<meta name="x-apple-disable-message-reformatting" />
<title>${esc(subject)}</title>
<style>
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
  img { -ms-interpolation-mode: bicubic; }
  a { color: ${s.d.link}; }
  @media screen and (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad { padding: ${Math.min(s.padY, 30)}px 22px 8px !important; }
    .band { padding: 30px 22px 28px !important; }
    .h1 { font-size: ${Math.min(design.heading_size, 26)}px !important; }
    .foot { padding: 22px 18px 6px !important; }
    .btn { width: 100% !important; float: none !important; }
    .btn td { width: 100% !important; }
    .btn a { display: block !important; text-align: center !important; padding: 16px 18px !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background: ${s.c.page_bg}; font-family: ${s.font}; color: ${s.c.text};">
<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: ${s.c.page_bg}; opacity: 0;">${esc(preheader)}${'&#847;&zwnj;&nbsp;'.repeat(preheader ? 60 : 0)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${s.c.page_bg}" style="background: ${s.c.page_bg};">
  <tr>
    <td align="center" style="padding: 22px 10px 30px;">
      <table role="presentation" class="wrap" width="600" cellspacing="0" cellpadding="0" border="0" style="width: 600px; max-width: 600px;">
        <tr>
          <td style="padding: 0 4px 14px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="left" valign="middle">${logoOnTop ? `<a href="${esc(home)}" target="_blank" style="text-decoration: none;">${brandMark(s)}</a>` : ''}</td>
                <td align="right" valign="middle" style="font-family: ${s.font}; font-size: 12px; color: ${design.footer_text};">
                  ${lang === 'both' ? `<a href="#en" style="color: ${design.footer_text}; text-decoration: underline;">${esc(t.other)}</a>` : (o.viewUrl ? `<a href="${esc(o.viewUrl)}" target="_blank" style="color: ${design.footer_text}; text-decoration: underline;">${esc(t.view)}</a>` : '')}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td bgcolor="${s.c.card_bg}" style="background: ${s.c.card_bg}; border-radius: ${design.radius}px; overflow: hidden; ${card}">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${top}
              <tr>
                <td class="pad" style="padding: ${s.padY}px ${s.padX}px 10px; font-family: ${s.font};">
${sections.join('\n')}
                  <div style="height: ${s.gap + 6}px; line-height: ${s.gap + 6}px; font-size: 0;">&nbsp;</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="foot" align="center" style="padding: 24px 30px 6px; font-family: ${s.font}; font-size: 12px; line-height: 1.6; color: ${design.footer_text}; text-align: center;">
            <p style="margin: 0 0 8px;">${esc(t.help)} ${esc(getSupportEmail())}</p>
            <p style="margin: 0 0 8px;">${reason}</p>
            ${address ? `<p style="margin: 0 0 8px;">Learn French with Natives · ${esc(address)}</p>` : ''}
            <p style="margin: 0 0 8px;">
              ${o.unsubscribeUrl ? `<a href="${esc(o.unsubscribeUrl)}" target="_blank" style="color: ${design.footer_text}; text-decoration: underline;">${esc(lang === 'both' ? `${WORDS.fr.unsubscribe} / ${WORDS.en.unsubscribe}` : t.unsubscribe)}</a>` : ''}
              ${o.unsubscribeUrl && o.viewUrl && lang !== 'both' ? ' &nbsp;·&nbsp; ' : ''}
              ${o.viewUrl && lang !== 'both' ? `<a href="${esc(o.viewUrl)}" target="_blank" style="color: ${design.footer_text}; text-decoration: underline;">${esc(t.view)}</a>` : ''}
            </p>
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Learn French with Natives. ${esc(t.rights)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
${o.openUrl ? `<img src="${esc(o.openUrl)}" width="1" height="1" alt="" style="display: block; width: 1px; height: 1px; border: 0; opacity: 0;" />` : ''}
</body>
</html>`;

    return { subject, preheader, html, text: renderText(c, { ...o, lang, firstName, link }) };
}

/** The text version (sent with the HTML: better delivered, and read by some programs). */
function renderText(c, o) {
    const langs = o.lang === 'both' ? ['fr', 'en'] : [o.lang === 'en' ? 'en' : 'fr'];
    const b = c.buttons || {};
    const parts = langs.map(lang => {
        const w = wordsOf(c, lang);
        const lines = [];
        if (w.headline) lines.push(personalize(w.headline, o.firstName).toUpperCase(), '');
        lines.push(bodyText(personalize(w.body, o.firstName)), '');
        if (w.highlights.length) lines.push(...(w.highlights_title ? [w.highlights_title] : []), ...w.highlights.map(h => `• ${bodyText(h)}`), '');
        const o2 = c.offer || {};
        if (o2.show && (o2.promo || o2.regular)) {
            lines.push([w.offer_label, money(o2.promo || o2.regular, o2.currency, lang), o2.promo && o2.regular ? `(${money(o2.regular, o2.currency, lang)})` : '', w.offer_note, w.deadline].filter(Boolean).join(' · '), '');
        }
        if (w.steps.length) lines.push(...(w.steps_title ? [w.steps_title] : []), ...w.steps.map((st, i) => `${i + 1}. ${bodyText(st)}`), '');
        if (w.primary) lines.push(`${w.primary} : ${o.link(b.primary.action === 'form' ? 'form' : b.primary.url, w.primary)}`, '');
        if (w.secondary) lines.push(`${w.secondary} : ${o.link(b.secondary.action === 'form' ? 'form' : b.secondary.url, w.secondary)}`, '');
        lines.push(personalize(w.signature, o.firstName) || WORDS[lang].team);
        if (w.ps) lines.push('', `${WORDS[lang].ps} ${bodyText(personalize(w.ps, o.firstName))}`);
        return lines.join('\n');
    });
    const main = langs[0];
    const reasonKey = REASON[o.source] ? o.source : 'registration';
    const foot = [
        '', '—',
        langs.map(l => REASON[reasonKey][l]).join('\n'),
        o.postalAddress ? `Learn French with Natives · ${String(o.postalAddress).trim()}` : '',
        o.unsubscribeUrl ? `${WORDS[main].unsubscribe}: ${o.unsubscribeUrl}` : '',
    ].filter(Boolean);
    return [...parts.flatMap((p, i) => (i ? ['', '———', '', p] : [p])), ...foot].join('\n');
}

/** The links of a campaign, in a fixed order (their number is part of each tracking link). « form » is its form page. */
function linksOf(c) {
    const out = [];
    const add = (url, label) => {
        if (!url || out.some(l => l.url === url)) return;
        if (url !== 'form' && !/^https?:\/\//i.test(url)) return;
        out.push({ url: url.slice(0, 1000), label: label ? String(label).slice(0, 80) : null });
    };
    const b = c.buttons || {};
    const content = c.content || {};
    for (const which of ['primary', 'secondary']) {
        const btn = b[which];
        if (!btn || !btn.action || btn.action === 'none') continue;
        const label = content.fr?.[`${which}_label`] || content.en?.[`${which}_label`] || (btn.action === 'form' ? 'Form' : btn.action === 'whatsapp' ? 'WhatsApp' : 'Button');
        add(btn.action === 'form' ? 'form' : btn.url, label);
    }
    for (const lang of ['fr', 'en']) {
        const w = content[lang] || {};
        for (const text of [w.body, w.ps, ...(Array.isArray(w.highlights) ? w.highlights : []), ...(Array.isArray(w.steps) ? w.steps : [])]) {
            for (const m of String(text || '').matchAll(LINK_MD)) add(m[2], m[1]);
        }
    }
    add(siteUrl(), 'Logo / site');
    return out;
}

/** The address of the form page of a campaign (the site's /form/ page). */
const formUrl = (token, lang) => `${siteUrl()}${lang === 'en' ? '/form/' : '/fr/formulaire/'}?t=${encodeURIComponent(token)}`;

module.exports = { renderEmail, linksOf, personalize, imageUrl, money, wordsOf, formUrl, siteUrl, apiUrl, esc };
