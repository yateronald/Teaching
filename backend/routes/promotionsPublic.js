/**
 * Marketing campaigns, for the public site (mounted at /api/public/promotions):
 *
 *   GET  /                 the campaigns that are live right now
 *   GET  /images/<key>.webp a picture made for a campaign (<key>-640.webp: the small one)
 *   POST /track            counts a view or a click (no cookie, no identifier)
 *   POST /:slug/register   a visitor registers for a campaign
 *
 * Nothing here needs an account. Only published campaigns inside their dates
 * are ever returned or accept a registration.
 */
const express = require('express');
const promos = require('../services/promotionService');
const promoAi = require('../services/promotionAi');
const { hasColumn } = require('../services/schemaFeatures');
const { createBulkNotifications } = require('../services/notificationService');
const { sendPromotionRegistrationConfirmation } = require('../emails/emailService');

const router = express.Router();
const SLUG_RE = /^[a-z0-9-]{1,80}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIVE = `p.status = 'published' AND p.starts_at <= CURRENT_TIMESTAMP AND (p.ends_at IS NULL OR p.ends_at > CURRENT_TIMESTAMP)`;

async function liveCampaign(db, slug) {
    return db.get(`SELECT ${promos.COLUMNS}, r.seats_taken FROM promotions p ${promos.COUNTS_JOIN}
                    WHERE lower(p.slug) = lower($1) AND ${LIVE}`, [slug]);
}

// ── The live campaigns ──
router.get('/', async (req, res) => {
    try {
        if (!(await promos.ready(req.db))) return res.json({ promotions: [] });
        const rows = await req.db.all(
            `SELECT ${promos.COLUMNS}, r.seats_taken FROM promotions p ${promos.COUNTS_JOIN}
              WHERE ${LIVE} ORDER BY p.priority DESC, p.ends_at ASC NULLS LAST, p.created_at DESC LIMIT 24`);
        // Short cache: a campaign published now is on the site within a minute.
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json({ promotions: rows.map(promos.publicShape) });
    } catch (err) {
        console.error('GET /public/promotions error:', err.message);
        res.json({ promotions: [] });
    }
});

// ── A picture made for a campaign ──
// Its address never changes once made (a new picture has a new key), so it
// is cached for a year. It may be drawn on another site's page or canvas
// (the www site, the flyer studio): cross-origin is allowed for images only.
router.get('/images/:file', async (req, res) => {
    try {
        const m = /^(ai-[a-f0-9]{12})(-640)?\.webp$/.exec(String(req.params.file || ''));
        if (!m) return res.status(404).end();
        const bytes = await promoAi.loadImage(req.db, m[1], !!m[2]);
        if (!bytes) return res.status(404).end();
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'none'");
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(bytes);
    } catch (err) {
        console.error('GET /public/promotions/images error:', err.message);
        res.status(404).end();
    }
});

// ── A view or a click ──
// Sent as a beacon when a campaign appears or is clicked. It never fails for
// the visitor: a count that cannot be stored is simply lost.
router.post('/track', async (req, res) => {
    res.status(204).end();
    try {
        const { slug, type, placement } = req.body || {};
        if (!SLUG_RE.test(String(slug || '')) || !['view', 'click'].includes(type) || !promos.PLACEMENTS.includes(placement)) return;
        if (!(await promos.ready(req.db))) return;
        const column = type === 'view' ? 'views' : 'clicks';
        await req.db.run(
            `INSERT INTO promotion_stats (promotion_id, day, placement, ${column})
             SELECT p.id, CURRENT_DATE, $2, 1 FROM promotions p WHERE lower(p.slug) = lower($1) AND ${LIVE}
             ON CONFLICT (promotion_id, day, placement) DO UPDATE SET ${column} = promotion_stats.${column} + 1`,
            [slug, placement]);
    } catch (err) {
        console.error('POST /public/promotions/track error:', err.message);
    }
});

/** Every administrator learns of the registration at once. */
async function announce(req, promotion, registration) {
    const admins = await req.db.all("SELECT id FROM users WHERE role = 'admin' AND is_active = true");
    if (!admins.length) return;
    const title = promotion.title_en || promotion.title_fr;
    await createBulkNotifications(req.db, admins.map(a => a.id), {
        type: 'promo_registration',
        title: registration.status === 'waitlist' ? 'New name on a waiting list' : 'New registration',
        message: `${registration.full_name}${registration.country ? ` (${registration.country})` : ''} registered for “${title}”.`,
        link: `/app/marketing/${promotion.id}`,
        entity_type: 'promotion',
        entity_id: promotion.id,
    });
    if (req.io) {
        const waiting = await req.db.get(`SELECT COUNT(*)::int AS waiting FROM promotion_registrations WHERE status = 'new'`);
        const payload = { promotion_id: promotion.id, title, full_name: registration.full_name, waiting: waiting?.waiting || 0 };
        admins.forEach(admin => req.io.to(`user:${admin.id}`).emit('promo:registration', payload));
    }
}

// ── Register ──
router.post('/:slug/register', async (req, res) => {
    try {
        const body = req.body || {};
        const lang = body.lang === 'fr' ? 'fr' : 'en';
        const say = (en, fr) => (lang === 'fr' ? fr : en);
        // A field no person sees: only robots fill it. They are told it worked.
        if (body.website) return res.status(201).json({ success: true, status: 'new' });

        const fullName = promos.text(body.fullName, 140);
        const email = promos.text(body.email, 255);
        const errors = [];
        if (!fullName || fullName.length < 2) errors.push(say('Enter your name.', 'Indiquez votre nom.'));
        if (!email || !EMAIL_RE.test(email)) errors.push(say('Enter a valid email address.', 'Indiquez une adresse e-mail valide.'));
        if (errors.length) return res.status(400).json({ error: 'Invalid', message: errors.join(' ') });

        if (!SLUG_RE.test(req.params.slug) || !(await promos.ready(req.db))) {
            return res.status(404).json({ error: 'Not found', message: say('This offer is no longer available.', 'Cette offre n’est plus disponible.') });
        }
        const promotion = await liveCampaign(req.db, req.params.slug);
        if (!promotion || promotion.registration_mode !== 'form') {
            return res.status(404).json({ error: 'Not found', message: say('This offer is no longer available.', 'Cette offre n’est plus disponible.') });
        }

        // The seat count and the insert are one statement: a full class puts the
        // person on the waiting list instead of overbooking it.
        const placement = promos.PLACEMENTS.includes(body.placement) ? body.placement : 'link';
        // Seats taken outside the site (phone, WhatsApp, in person) count as taken.
        const offline = (await hasColumn(req.db, 'promotions', 'seats_offline')) ? ' + COALESCE(p.seats_offline, 0)' : '';
        const inserted = await req.db.run(
            `INSERT INTO promotion_registrations
                 (promotion_id, full_name, email, phone, country, level, message, language, timezone, placement, source_path, status)
             SELECT p.id, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
                    CASE WHEN p.seat_limit IS NOT NULL AND (
                             SELECT COUNT(*) FROM promotion_registrations x
                              WHERE x.promotion_id = p.id AND x.status IN ('new', 'contacted', 'confirmed')
                         )${offline} >= p.seat_limit THEN 'waitlist' ELSE 'new' END
               FROM promotions p WHERE p.id = $1
             ON CONFLICT (promotion_id, lower(email)) DO NOTHING
             RETURNING *`,
            [promotion.id, fullName, email.toLowerCase(), promos.text(body.phone, 40), promos.text(body.country, 80),
                promos.text(body.level, 40), promos.longText(body.message, 1500), lang, promos.text(body.timezone, 64),
                placement, promos.text(body.path, 200)]);

        if (!inserted.rows.length) {
            // Same email, same campaign: the person is already on the list.
            return res.json({ success: true, already: true, status: 'new' });
        }
        const registration = inserted.rows[0];

        announce(req, promotion, registration).catch(e => console.error('Registration alert failed:', e.message));
        sendPromotionRegistrationConfirmation({ to: registration.email, name: registration.full_name, lang, promotion: promos.publicShape(promotion), waitlist: registration.status === 'waitlist' })
            .catch(e => console.error('Registration email failed:', e.message));

        res.status(201).json({ success: true, status: registration.status });
    } catch (err) {
        console.error('POST /public/promotions/:slug/register error:', err.message);
        const fr = req.body?.lang === 'fr';
        res.status(500).json({ error: 'Unavailable', message: fr ? 'L’inscription n’a pas pu être enregistrée. Réessayez dans un instant.' : 'Your registration could not be saved. Please try again in a moment.' });
    }
});

module.exports = router;
