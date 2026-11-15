/**
 * The public side of email campaigns (mounted at /api/public/email):
 *
 *   GET  /o/:token.gif        the open pixel (an approximate count: some programs load pictures for the reader)
 *   GET  /c/:token/:n         a click: counted, then sent on to the link n of the campaign (never anywhere else)
 *   GET  /u/:token            the unsubscribe page (one button: links scanners never unsubscribe anyone)
 *   POST /u/:token            unsubscribe (the button, and mail programs' one-click unsubscribe, RFC 8058)
 *   GET  /v/:token            the email in the browser
 *   GET  /preview/:signed     the email for the administrator's phone (signed link, 30 minutes)
 *   GET  /form/:token         the campaign's form for this person (the site's /form/ page shows it);
 *                             preview-<id>: the form of a test or a preview (nothing is kept)
 *   POST /form/:token         the person's answers (checked, kept, the team notified)
 *   GET  /img/:key.jpg        a campaign picture as a JPEG (every mail program shows JPEG)
 *   POST /brevo               Brevo's events (delivered, bounces, complaints): ?key=BREVO_WEBHOOK_KEY
 *
 * No IP address is kept; a token only says which email of which campaign.
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const svc = require('../services/emailCampaignService');
const sender = require('../services/emailCampaignSender');
const promoAi = require('../services/promotionAi');
const { renderEmail, esc, siteUrl, formUrl } = require('../services/emailRender');
const { createBulkNotifications } = require('../services/notificationService');

const router = express.Router();
router.use(express.urlencoded({ extended: false, limit: '4kb' }));
router.use(express.json({ limit: '64kb' }));

const TOKEN_RE = /^[A-Za-z0-9_-]{16,40}$/;
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

async function recipientOf(db, token) {
    if (!TOKEN_RE.test(token) || !(await svc.ready(db))) return null;
    return db.get(`SELECT r.*, c.status AS campaign_status FROM email_campaign_recipients r
                      JOIN email_campaigns c ON c.id = r.campaign_id WHERE r.token = $1`, [token]);
}

// ── Opens and clicks ──

router.get('/o/:token.gif', async (req, res) => {
    res.set({ 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, max-age=0', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    res.end(PIXEL);
    try {
        const r = await recipientOf(req.db, req.params.token);
        if (!r) return;
        await req.db.run(`UPDATE email_campaign_recipients SET opens = opens + 1, opened_at = COALESCE(opened_at, now()) WHERE id = $1`, [r.id]);
        await req.db.run(`INSERT INTO email_campaign_events (campaign_id, recipient_id, type, machine) VALUES ($1, $2, 'open', $3)`,
            [r.campaign_id, r.id, svc.machineLike(req.get('user-agent'), r.sent_at)]);
    } catch (err) { console.warn('Email open not counted:', err.message); }
});

router.get('/c/:token/:n', async (req, res) => {
    const n = Number(req.params.n);
    try {
        const r = await recipientOf(req.db, req.params.token);
        const link = r && Number.isInteger(n) ? await req.db.get('SELECT url FROM email_campaign_links WHERE campaign_id = $1 AND idx = $2', [r.campaign_id, n]) : null;
        if (!link) return res.redirect(302, siteUrl());
        const machine = svc.machineLike(req.get('user-agent'), r.sent_at);
        if (!machine) {
            // A person who clicks has opened the email, even when pictures were blocked.
            await req.db.run(`UPDATE email_campaign_recipients SET clicks = clicks + 1, clicked_at = COALESCE(clicked_at, now()),
                                     opened_at = COALESCE(opened_at, now()) WHERE id = $1`, [r.id]);
        }
        await req.db.run(`INSERT INTO email_campaign_events (campaign_id, recipient_id, type, link_idx, machine) VALUES ($1, $2, 'click', $3, $4)`,
            [r.campaign_id, r.id, n, machine]);
        res.set('Cache-Control', 'no-store');
        // « form »: the campaign's form page on the site, for this person.
        if (link.url === 'form') return res.redirect(302, formUrl(r.token, r.lang === 'en' ? 'en' : 'fr'));
        res.redirect(302, svc.withUtm(link.url, { id: r.campaign_id }));
    } catch (err) {
        console.warn('Email click not counted:', err.message);
        res.redirect(302, siteUrl());
    }
});

// ── Unsubscribe ──

const PAGE_WORDS = {
    fr: {
        title: 'Se désinscrire', ask: 'Vous ne recevrez plus nos emails d’information et d’offres à l’adresse', button: 'Me désinscrire',
        doneTitle: 'C’est fait', done: 'Vous ne recevrez plus nos emails d’information et d’offres. Les messages liés à vos cours (comptes, rappels) continuent si vous êtes élève.',
        gone: 'Ce lien n’est plus valable.', back: 'Retour au site', test: 'Ceci était un email de test : rien n’a été changé.',
    },
    en: {
        title: 'Unsubscribe', ask: 'You will no longer receive our news and offers at', button: 'Unsubscribe me',
        doneTitle: 'Done', done: 'You will no longer receive our news and offers. Messages about your classes (account, reminders) continue if you are a student.',
        gone: 'This link is no longer valid.', back: 'Back to the site', test: 'This was a test email: nothing was changed.',
    },
};

function page(lang, title, body) {
    return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" /><title>${esc(title)} · Learn French with Natives</title>
<style>
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; box-sizing: border-box;
         background: #f2f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b2333; }
  main { width: 100%; max-width: 460px; background: #fff; border: 1px solid #e3e7ee; border-radius: 18px; padding: 34px 30px; box-shadow: 0 18px 40px -24px rgba(11, 23, 51, .35); }
  h1 { margin: 0 0 12px; font-size: 24px; letter-spacing: -.3px; }
  p { margin: 0 0 18px; font-size: 16px; line-height: 1.6; color: #3b4558; }
  strong { color: #1b2333; word-break: break-all; }
  button { width: 100%; padding: 15px 18px; border: 0; border-radius: 11px; background: #1d4577; color: #fff; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; }
  button:hover { background: #163a66; }
  a { color: #1d4577; font-weight: 600; }
</style></head><body><main>${body}</main></body></html>`;
}

const maskEmail = (e) => String(e).replace(/^(.{1,2})[^@]*(@.*)$/, (_m, a, b) => `${a}•••${b}`);

router.get('/u/:token', async (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    if (req.params.token === 'test') {
        return res.send(page('fr', PAGE_WORDS.fr.title, `<h1>${PAGE_WORDS.fr.title}</h1><p>${PAGE_WORDS.fr.test}</p><p>${PAGE_WORDS.en.test}</p>`));
    }
    const r = await recipientOf(req.db, req.params.token).catch(() => null);
    const lang = r?.lang === 'en' ? 'en' : 'fr';
    const w = PAGE_WORDS[lang];
    if (!r) return res.status(404).send(page(lang, w.title, `<h1>${w.title}</h1><p>${w.gone}</p><p><a href="${esc(siteUrl())}">${w.back}</a></p>`));
    if (r.unsubscribed_at) return res.send(page(lang, w.doneTitle, `<h1>${w.doneTitle}</h1><p>${w.done}</p><p><a href="${esc(siteUrl())}">${w.back}</a></p>`));
    res.send(page(lang, w.title, `<h1>${w.title}</h1><p>${w.ask} <strong>${esc(maskEmail(r.email))}</strong>.</p>
<form method="post" action=""><button type="submit">${w.button}</button></form>`));
});

router.post('/u/:token', async (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    if (req.params.token === 'test') return res.send(page('fr', PAGE_WORDS.fr.doneTitle, `<h1>${PAGE_WORDS.fr.doneTitle}</h1><p>${PAGE_WORDS.fr.test}</p>`));
    try {
        const r = await recipientOf(req.db, req.params.token);
        const lang = r?.lang === 'en' ? 'en' : 'fr';
        const w = PAGE_WORDS[lang];
        if (!r) return res.status(404).send(page(lang, w.title, `<h1>${w.title}</h1><p>${w.gone}</p>`));
        if (!r.unsubscribed_at) {
            await req.db.run('UPDATE email_campaign_recipients SET unsubscribed_at = now() WHERE id = $1', [r.id]);
            await req.db.run(`INSERT INTO email_suppressions (email, reason, campaign_id) VALUES ($1, 'unsubscribed', $2) ON CONFLICT (email) DO NOTHING`,
                [svc.lower(r.email), r.campaign_id]);
            await req.db.run(`INSERT INTO email_campaign_events (campaign_id, recipient_id, type) VALUES ($1, $2, 'unsubscribe')`, [r.campaign_id, r.id]);
            // Not yet sent in another campaign under way: not sent at all.
            await req.db.run(`UPDATE email_campaign_recipients SET status = 'skipped', error = 'Not sent: unsubscribed'
                               WHERE lower(email) = $1 AND status = 'queued'`, [svc.lower(r.email)]);
        }
        res.send(page(lang, w.doneTitle, `<h1>${w.doneTitle}</h1><p>${w.done}</p><p><a href="${esc(siteUrl())}">${w.back}</a></p>`));
    } catch (err) {
        console.error('Unsubscribe error:', err.message);
        res.status(500).send(page('fr', 'Erreur', '<h1>Erreur / Error</h1><p>Réessayez dans un instant. / Please try again in a moment.</p>'));
    }
});

// ── The email in a browser ──

router.get('/v/:token', async (req, res) => {
    try {
        const r = await recipientOf(req.db, req.params.token);
        if (!r) return res.status(404).send(page('fr', 'Email', `<h1>Email</h1><p>${PAGE_WORDS.fr.gone}</p><p>${PAGE_WORDS.en.gone}</p>`));
        const c = await req.db.get('SELECT * FROM email_campaigns WHERE id = $1', [r.campaign_id]);
        const links = await req.db.all('SELECT idx, url FROM email_campaign_links WHERE campaign_id = $1', [r.campaign_id]);
        const mail = sender.emailFor(c, r, links, await svc.settings(req.db));
        res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
        res.send(mail.html.replace(/<img src="[^"]*\/o\/[^"]*\.gif"[^>]*>/, ''));
    } catch (err) {
        console.error('Email view error:', err.message);
        res.status(500).send(page('fr', 'Email', '<h1>Email</h1><p>Réessayez dans un instant. / Please try again in a moment.</p>'));
    }
});

router.get('/preview/:signed', async (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    let claim;
    try { claim = jwt.verify(req.params.signed, process.env.JWT_SECRET || ''); } catch { claim = null; }
    if (!claim || claim.purpose !== 'email-preview') {
        return res.status(403).send(page('en', 'Preview', '<h1>Preview</h1><p>This preview link has expired. Open the preview again from the app.</p>'));
    }
    try {
        const c = await req.db.get('SELECT * FROM email_campaigns WHERE id = $1', [claim.cid]);
        if (!c) return res.status(404).send(page('en', 'Preview', '<h1>Preview</h1><p>This email no longer exists.</p>'));
        const settings = await svc.settings(req.db);
        const out = renderEmail(svc.contentOf(c), {
            lang: claim.lang, firstName: claim.name || '', source: 'student',
            postalAddress: settings.postal_address || '[Postal address]', unsubscribeUrl: '#', viewUrl: '#',
        });
        res.send(out.html);
    } catch (err) {
        console.error('Email preview error:', err.message);
        res.status(500).send(page('en', 'Preview', '<h1>Preview</h1><p>Please try again in a moment.</p>'));
    }
});

// ── The campaign's form (the site's /form/ page) ──

const PREVIEW_RE = /^preview-(\d{1,9})$/;
const FORM_WORDS = {
    fr: { title: 'Vos réponses', submit: 'Envoyer', thanks_title: 'Merci !', thanks_text: 'Nous avons bien reçu vos réponses. Nous vous répondons rapidement.' },
    en: { title: 'Your answers', submit: 'Send', thanks_title: 'Thank you!', thanks_text: 'We have received your answers. We will get back to you soon.' },
};

/** The campaign and the person behind a form link (a preview has no person, and keeps nothing). */
async function formOf(db, tokenValue) {
    if (!(await svc.ready(db))) return null;
    const preview = PREVIEW_RE.exec(String(tokenValue || ''));
    if (preview) {
        const c = await db.get('SELECT * FROM email_campaigns WHERE id = $1', [Number(preview[1])]);
        return c ? { campaign: svc.contentOf(c), recipient: null, preview: true } : null;
    }
    const r = await recipientOf(db, tokenValue);
    if (!r) return null;
    const c = await db.get('SELECT * FROM email_campaigns WHERE id = $1', [r.campaign_id]);
    return c ? { campaign: svc.contentOf(c), recipient: r, preview: false } : null;
}

function formLang(found, asked) {
    if (['fr', 'en'].includes(asked)) return asked;
    const l = found.recipient?.lang;
    if (l === 'fr' || l === 'en') return l;
    return found.campaign.default_lang === 'en' ? 'en' : 'fr';
}

router.get('/form/:token', async (req, res) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    try {
        const found = await formOf(req.db, req.params.token);
        if (!found || !found.campaign.form.fields.length) return res.status(404).json({ error: 'Not found', message: 'This form does not exist any more.' });
        const c = found.campaign;
        const lang = formLang(found, req.query.lang);
        const other = lang === 'fr' ? 'en' : 'fr';
        const w = c.content[lang];
        const alt = c.content[other];
        const word = (k) => w[k] || alt[k] || null;
        const d = c.design;
        const answered = found.recipient
            ? !!(await req.db.get('SELECT 1 FROM email_campaign_responses WHERE campaign_id = $1 AND recipient_id = $2', [c.id, found.recipient.id]))
            : false;
        res.json({
            lang, preview: found.preview, answered,
            campaign: { headline: word('headline'), eyebrow: word('eyebrow'), image_key: c.image_key },
            form: {
                title: word('form_title') || FORM_WORDS[lang].title,
                intro: word('form_intro'),
                submit: word('form_submit') || FORM_WORDS[lang].submit,
                fields: c.form.fields.map(f => ({
                    id: f.id, type: f.type, required: f.required,
                    label: f[`label_${lang}`] || f[`label_${other}`] || f.id,
                    options: (f[`options_${lang}`]?.length ? f[`options_${lang}`] : f[`options_${other}`]) || undefined,
                })),
            },
            design: {
                primary: d.colors.primary, button_text: d.button_text, heading: d.colors.heading, header_bg: d.colors.header_bg,
                header_text: d.colors.header_text, accent: d.colors.accent, soft: d.colors.soft, page_bg: d.colors.page_bg,
                font: d.font, heading_font: d.heading_font, radius: d.radius, button_shape: d.button_shape,
            },
            prefill: found.recipient ? { name: found.recipient.name || '', email: found.recipient.email } : { name: '', email: '' },
        });
    } catch (err) {
        console.error('Email form error:', err.message);
        res.status(500).json({ error: 'Unavailable', message: 'The form could not be loaded. Please try again.' });
    }
});

const PHONE_RE = /^[+()\d][\d\s().+-]{5,30}$/;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Answers checked against the form: { answers, errors }. */
function checkAnswers(fields, raw, lang) {
    const fr = lang === 'fr';
    const src = raw && typeof raw === 'object' ? raw : {};
    const answers = {};
    const errors = {};
    for (const f of fields) {
        let v = src[f.id];
        const options = [...(f.options_fr || []), ...(f.options_en || [])];
        if (f.type === 'checkbox') {
            v = (Array.isArray(v) ? v : v ? [v] : []).map(x => String(x).slice(0, 80)).filter(x => options.includes(x)).slice(0, 12);
            if (f.required && !v.length) errors[f.id] = fr ? 'Choisissez au moins une réponse.' : 'Choose at least one answer.';
            if (v.length) answers[f.id] = v;
            continue;
        }
        v = String(v ?? '').replace(/\r/g, '').trim();
        if (!v) {
            if (f.required) errors[f.id] = fr ? 'Ce champ est obligatoire.' : 'This field is required.';
            continue;
        }
        if (f.type === 'email') {
            v = v.toLowerCase().slice(0, 254);
            if (!svc.EMAIL_RE.test(v)) { errors[f.id] = fr ? 'Adresse email invalide.' : 'Invalid email address.'; continue; }
        } else if (f.type === 'phone') {
            v = v.slice(0, 40);
            if (!PHONE_RE.test(v)) { errors[f.id] = fr ? 'Numéro de téléphone invalide.' : 'Invalid phone number.'; continue; }
        } else if (f.type === 'select' || f.type === 'radio') {
            if (!options.includes(v)) { errors[f.id] = fr ? 'Choisissez une réponse de la liste.' : 'Choose an answer from the list.'; continue; }
        } else if (f.type === 'date') {
            if (!DAY_RE.test(v) || Number.isNaN(Date.parse(v))) { errors[f.id] = fr ? 'Date invalide.' : 'Invalid date.'; continue; }
        } else {
            v = v.slice(0, f.type === 'textarea' ? 4000 : 300);
        }
        answers[f.id] = v;
    }
    return { answers, errors };
}

router.post('/form/:token', async (req, res) => {
    res.set({ 'Cache-Control': 'no-store' });
    try {
        const found = await formOf(req.db, req.params.token);
        if (!found || !found.campaign.form.fields.length) return res.status(404).json({ error: 'Not found', message: 'This form does not exist any more.' });
        const c = found.campaign;
        const lang = formLang(found, req.body?.lang);
        const words = { ...FORM_WORDS[lang], ...Object.fromEntries(['form_thanks_title', 'form_thanks_text'].map(k => [k.replace('form_', ''), c.content[lang][k] || c.content[lang === 'fr' ? 'en' : 'fr'][k]]).filter(([, v]) => v)) };
        const thanks = { thanks_title: words.thanks_title, thanks_text: words.thanks_text };
        // A robot fills the hidden field: it is thanked, nothing is kept.
        if (String(req.body?.website || '').trim()) return res.json({ ok: true, ...thanks });
        const { answers, errors } = checkAnswers(c.form.fields, req.body?.answers, lang);
        if (Object.keys(errors).length) {
            return res.status(400).json({ error: 'Check the form', message: lang === 'fr' ? 'Vérifiez les champs indiqués.' : 'Check the fields shown.', errors });
        }
        if (found.preview) return res.json({ ok: true, preview: true, ...thanks });

        const byType = (t) => c.form.fields.find(f => f.type === t && answers[f.id]);
        const name = byType('name') ? answers[byType('name').id] : (found.recipient.name || null);
        const email = byType('email') ? answers[byType('email').id] : found.recipient.email;
        const phone = byType('phone') ? answers[byType('phone').id] : null;
        const saved = await req.db.get(
            `INSERT INTO email_campaign_responses (campaign_id, recipient_id, name, email, phone, lang, answers)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (campaign_id, recipient_id) WHERE recipient_id IS NOT NULL
             DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, lang = EXCLUDED.lang,
                           answers = EXCLUDED.answers, status = 'new', updated_at = now()
             RETURNING id, (xmax = 0) AS inserted`,
            [c.id, found.recipient.id, name ? String(name).slice(0, 160) : null, email, phone, lang, JSON.stringify(answers)]);
        await req.db.run(`UPDATE email_campaign_recipients SET responded_at = now(), clicked_at = COALESCE(clicked_at, now()),
                                 opened_at = COALESCE(opened_at, now()) WHERE id = $1`, [found.recipient.id]);
        // The team hears of it at once.
        notifyAnswer(req, c, { name, email, again: saved && saved.inserted === false }).catch(err => console.warn('Answer notification failed:', err.message));
        res.json({ ok: true, ...thanks });
    } catch (err) {
        console.error('Email form answer error:', err.message);
        res.status(500).json({ error: 'Unavailable', message: 'Your answers could not be saved. Please try again in a moment.' });
    }
});

async function notifyAnswer(req, c, { name, email, again }) {
    const admins = await req.db.all("SELECT id FROM users WHERE role = 'admin' AND is_active = true");
    if (!admins.length) return;
    await createBulkNotifications(req.db, admins.map(a => a.id), {
        type: 'email_response',
        title: again ? 'Updated answer to an email' : 'New answer to an email',
        message: `${name || email} answered “${c.name}”.`,
        link: `/app/emails/${c.id}`,
        entity_type: 'email_campaign',
        entity_id: c.id,
    });
}

// ── Pictures ──

const jpegCache = new Map();
const JPEG_CACHE_MAX = 40;
router.get('/img/:key.jpg', async (req, res) => {
    const key = String(req.params.key || '');
    if (!/^(ai-[a-f0-9]{12}|[a-z0-9][a-z0-9-]{1,60})$/.test(key)) return res.status(404).end();
    try {
        let jpeg = jpegCache.get(key);
        if (!jpeg) {
            let source = null;
            if (key.startsWith('ai-')) source = await promoAi.loadImage(req.db, key, false);
            else {
                // A photo of the site's library.
                const r = await fetch(`${siteUrl()}/learn/img/${key}.webp`);
                if (r.ok) source = Buffer.from(await r.arrayBuffer());
            }
            if (!source) return res.status(404).end();
            const sharp = require('sharp');
            jpeg = await sharp(source).resize({ width: 1200, withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
            jpegCache.set(key, jpeg);
            if (jpegCache.size > JPEG_CACHE_MAX) jpegCache.delete(jpegCache.keys().next().value);
        }
        res.set({ 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin' });
        res.end(jpeg);
    } catch (err) {
        console.warn('Email picture unavailable:', err.message);
        res.status(404).end();
    }
});

// ── Brevo's events: delivered, bounced, complaint ──

router.post('/brevo', async (req, res) => {
    const key = process.env.BREVO_WEBHOOK_KEY;
    if (!key || req.query.key !== key) return res.status(403).json({ error: 'Forbidden' });
    res.status(200).json({ ok: true });
    try {
        if (!(await svc.ready(req.db))) return;
        const events = Array.isArray(req.body) ? req.body : [req.body];
        for (const e of events.slice(0, 500)) {
            const event = String(e?.event || '').toLowerCase();
            const messageId = String(e?.['message-id'] || e?.messageId || '').slice(0, 200);
            const email = svc.lower(e?.email);
            const r = messageId
                ? await req.db.get('SELECT id, campaign_id, status FROM email_campaign_recipients WHERE message_id = $1', [messageId])
                : null;
            if (event === 'delivered' && r && r.status === 'sent') {
                await req.db.run("UPDATE email_campaign_recipients SET status = 'delivered' WHERE id = $1", [r.id]);
            } else if (['hard_bounce', 'invalid_email', 'blocked'].includes(event)) {
                if (r) await req.db.run("UPDATE email_campaign_recipients SET status = 'bounced', error = $2 WHERE id = $1", [r.id, `Brevo: ${event}`]);
                if (email && event !== 'blocked') {
                    await req.db.run(`INSERT INTO email_suppressions (email, reason, campaign_id) VALUES ($1, 'bounced', $2) ON CONFLICT (email) DO NOTHING`, [email, r?.campaign_id || null]);
                }
            } else if (event === 'spam' || event === 'complaint') {
                if (email) await req.db.run(`INSERT INTO email_suppressions (email, reason, campaign_id) VALUES ($1, 'complaint', $2)
                                             ON CONFLICT (email) DO UPDATE SET reason = 'complaint'`, [email, r?.campaign_id || null]);
            } else if (event === 'unsubscribed' && email) {
                await req.db.run(`INSERT INTO email_suppressions (email, reason, campaign_id) VALUES ($1, 'unsubscribed', $2) ON CONFLICT (email) DO NOTHING`, [email, r?.campaign_id || null]);
                if (r) await req.db.run('UPDATE email_campaign_recipients SET unsubscribed_at = COALESCE(unsubscribed_at, now()) WHERE id = $1', [r.id]);
            }
        }
    } catch (err) { console.warn('Brevo event not recorded:', err.message); }
});

module.exports = router;
