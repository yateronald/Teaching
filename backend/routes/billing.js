/**
 * Online payment of Premium (Paystack): the website's side and Paystack's.
 *
 *   GET  /api/learn/billing/offers              prices (public)
 *   GET  /api/learn/billing/me                  my payments and subscription
 *   POST /api/learn/billing/checkout            { offer } → Paystack's checkout address
 *   POST /api/learn/billing/subscription/cancel stop the renewals (Premium stays until the end)
 *   POST /api/learn/billing/subscription/card   Paystack's page to change the card
 *   GET  /api/learn/billing/callback            where Paystack sends the browser back
 *   POST /api/learn/billing/webhook/paystack    Paystack's signed notifications
 *
 * Nothing the browser says is believed: see services/billing.js.
 */
const express = require('express');
const site = require('../services/siteSession');
const paystack = require('../services/paystack');
const billing = require('../services/billing');

const router = express.Router();
const noStore = (req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); };
const ipOf = (req) => String(req.ip || '').replace('::ffff:', '');
const REF_RE = /^[A-Za-z0-9._=-]{6,100}$/;

const fail = (res, err) => {
    if (err instanceof billing.BillingError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error('[billing]', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.', code: 'FAILED' });
};

// ── Prices ──
router.get('/offers', noStore, async (req, res) => {
    try {
        if (!(await billing.enabled(req.db))) return res.json({ enabled: false, offers: [] });
        res.json({ enabled: true, offers: await billing.enrichOffersWithCharge(await billing.activeOffers(req.db)) });
    } catch (err) { fail(res, err); }
});

// ── My payments ──
router.get('/me', noStore, site.siteAuth({ required: true }), async (req, res) => {
    try {
        if (!(await billing.enabled(req.db))) return res.json({ enabled: false, offers: [], payments: [], subscription: null });
        const uid = req.siteUser.id;
        const [offers, payments, sub] = await Promise.all([
            billing.activeOffers(req.db),
            req.db.all(
                `SELECT p.reference, p.amount, p.currency, p.display_amount, p.display_currency, p.fx_rate, p.invoice_number,
                        p.days, p.status, p.created_at, p.paid_at, p.renewal,
                        o.name_en, o.name_fr, l.ends_at AS premium_until
                   FROM learn_payments p LEFT JOIN learn_offers o ON o.id = p.offer_id LEFT JOIN learn_licenses l ON l.id = p.license_id
                  WHERE p.user_id = $1
                    AND p.status <> 'initialized'
                    AND NOT (p.status = 'failed' AND p.provider_transaction_id IS NULL AND p.status_detail LIKE 'Paystack:%')
                  ORDER BY p.created_at DESC LIMIT 30`, [uid]),
            req.db.get(
                `SELECT s.status, s.next_payment_date, s.plan_code, o.name_en, o.name_fr
                   FROM learn_subscriptions s LEFT JOIN learn_offers o ON o.id = s.offer_id
                  WHERE s.user_id = $1 AND s.status IN ('active', 'non-renewing', 'attention') ORDER BY s.updated_at DESC LIMIT 1`, [uid]),
        ]);
        const enrichedOffers = await billing.enrichOffersWithCharge(offers);
        res.json({
            enabled: true,
            offers: enrichedOffers,
            payments: payments.map(p => ({
                reference: p.reference,
                amount: Number(p.display_amount ?? p.amount),
                currency: p.display_currency || p.currency,
                charged_amount: Number(p.amount),
                charged_currency: p.currency,
                fx_rate: p.fx_rate ? Number(p.fx_rate) : null,
                invoice_number: p.invoice_number || null,
                has_invoice: p.status === 'success',
                days: p.days,
                status: p.status,
                created_at: p.created_at,
                paid_at: p.paid_at,
                renewal: p.renewal,
                name: { en: p.name_en, fr: p.name_fr },
                premium_until: p.premium_until,
            })),
            subscription: sub ? { status: sub.status, next_payment_date: sub.next_payment_date, name: { en: sub.name_en, fr: sub.name_fr } } : null,
            can_pay: !['candidate', 'org_admin', 'admin', 'teacher'].includes(req.siteUser.role),
        });
    } catch (err) { fail(res, err); }
});

// ── Download invoice PDF ──
router.get('/payments/:reference/invoice.pdf', noStore, site.siteAuth({ required: true }), async (req, res) => {
    try {
        const reference = String(req.params.reference || '');
        if (!REF_RE.test(reference)) return res.status(400).json({ error: 'Invalid reference.', code: 'BAD_REF' });
        const row = await req.db.get(
            "SELECT id FROM learn_payments WHERE reference = $1 AND user_id = $2 AND status = 'success'",
            [reference, req.siteUser.id]);
        if (!row) return res.status(404).json({ error: 'Invoice not found.', code: 'NO_INVOICE' });
        const doc = await billing.buildInvoicePdfForPayment(req.db, row.id);
        if (!doc) return res.status(404).json({ error: 'Invoice not found.', code: 'NO_INVOICE' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `${req.query.inline === '1' ? 'inline' : 'attachment'}; filename="${doc.filename}"`);
        res.setHeader('Cache-Control', 'private, no-store');
        res.send(doc.buffer);
    } catch (err) { fail(res, err); }
});

// ── Checkout ──
router.post('/checkout', noStore, site.siteWriteGuard, site.siteAuth({ required: true }), async (req, res) => {
    try {
        const user = await req.db.get('SELECT * FROM users WHERE id = $1', [req.siteUser.id]);
        const out = await billing.startCheckout(req.db, { user, offerCode: req.body?.offer, ip: ipOf(req), lang: req.body?.lang === 'fr' ? 'fr' : 'en' });
        res.json({ url: out.url });
    } catch (err) { fail(res, err); }
});

// ── Subscription ──
async function mySubscription(req) {
    return req.db.get(
        "SELECT * FROM learn_subscriptions WHERE user_id = $1 AND status IN ('active', 'attention') ORDER BY updated_at DESC LIMIT 1", [req.siteUser.id]);
}

router.post('/subscription/cancel', noStore, site.siteWriteGuard, site.siteAuth({ required: true }), async (req, res) => {
    try {
        const sub = await mySubscription(req);
        if (!sub || !sub.email_token) return res.status(404).json({ error: 'No subscription to cancel.', code: 'NO_SUBSCRIPTION' });
        await paystack.disableSubscription(sub.subscription_code, sub.email_token);
        await req.db.run("UPDATE learn_subscriptions SET status = 'non-renewing', updated_at = now() WHERE id = $1", [sub.id]);
        res.json({ ok: true });
    } catch (err) {
        if (err instanceof paystack.PaystackError) return res.status(502).json({ error: 'Paystack could not be reached. Please try again in a moment.', code: 'PROVIDER' });
        fail(res, err);
    }
});

router.post('/subscription/card', noStore, site.siteWriteGuard, site.siteAuth({ required: true }), async (req, res) => {
    try {
        const sub = await mySubscription(req);
        if (!sub) return res.status(404).json({ error: 'No subscription.', code: 'NO_SUBSCRIPTION' });
        const data = await paystack.manageLink(sub.subscription_code);
        if (!/^https:\/\/([a-z0-9-]+\.)*paystack\.com\//.test(String(data?.link || ''))) throw new Error('unexpected manage link');
        res.json({ url: data.link });
    } catch (err) {
        if (err instanceof paystack.PaystackError) return res.status(502).json({ error: 'Paystack could not be reached. Please try again in a moment.', code: 'PROVIDER' });
        fail(res, err);
    }
});

// ── Back from Paystack (the browser) ──
// The address in the query is only a hint: the payment is checked with
// Paystack's API before anything happens, then the person lands on My account.
router.get('/callback', noStore, async (req, res) => {
    const reference = String(req.query.reference || req.query.trxref || '');
    let outcome = 'pending';
    let lang = 'en';
    if (REF_RE.test(reference)) {
        try {
            const p = await req.db.get('SELECT u.preferred_lang FROM learn_payments p JOIN users u ON u.id = p.user_id WHERE p.reference = $1', [reference]);
            lang = p?.preferred_lang === 'fr' ? 'fr' : 'en';
            const r = await billing.fulfil(req.db, reference, { via: 'callback' });
            outcome = { success: 'success', already: 'success', failed: 'failed', abandoned: 'cancelled', review: 'review', unknown: 'failed' }[r.outcome] || 'pending';
        } catch (err) {
            console.error('[billing] callback check failed:', err.message);
            outcome = 'pending';
        }
    } else {
        outcome = 'failed';
    }
    res.redirect(302, billing.subscriptionUrl(lang, `payment=${outcome}`));
});

// ── Paystack's notifications ──
// Mounted with the raw body (server.js): the signature covers the exact bytes.
router.post('/webhook/paystack', async (req, res) => {
    const raw = req.body;
    if (!Buffer.isBuffer(raw) || !paystack.webhookIpAllowed(req.ip)) return res.status(401).end();
    if (!paystack.validSignature(raw, req.headers['x-paystack-signature'])) {
        console.warn('[billing] webhook refused: bad signature');
        return res.status(401).end();
    }
    let body;
    try { body = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).end(); }
    try {
        const outcome = await billing.handleWebhook(req.db, raw, body);
        res.status(200).json({ ok: true, outcome });
    } catch (err) {
        // A temporary problem (database, Paystack's API): a non-200 answer makes Paystack retry.
        console.error('[billing] webhook failed:', err.message);
        res.status(503).end();
    }
});

module.exports = router;
