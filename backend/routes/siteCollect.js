/**
 * The public website beacon — the only endpoint the marketing site may call,
 * and the only one in the platform that needs no account.
 *
 * Deliberately one-way:
 *   • POST only. Every answer is 204 with an empty body, whatever happened, so
 *     it cannot be used to read data, to probe what exists, or to tell a
 *     rejected payload from an accepted one.
 *   • It touches exactly two tables (site_visits, site_salts) and can neither
 *     read nor write anything about users, classes, exams or files.
 *   • The body is capped at 4 KB (see server.js) and validated field by field
 *     against allowlists before a parameterised INSERT.
 *   • It is rate limited per address, twice: by the route limiter and again
 *     inside the service.
 *   • The request must come from one of our own sites; anything else is
 *     ignored (browsers are held to this by CORS as well).
 *
 * See analyticsService for what is stored — no IP address, no cookie, no name.
 */
const express = require('express');
const analytics = require('../services/analyticsService');

const router = express.Router();

/** Hosts that count as "our site" — used for the origin check and for referrers. */
const OWN_HOSTS = (() => {
    const hosts = new Set(['learnfrenchwithnatives.com', 'www.learnfrenchwithnatives.com']);
    for (const url of [process.env.FRONTEND_URL, process.env.API_PUBLIC_URL]) {
        try { if (url) hosts.add(new URL(url).hostname.toLowerCase()); } catch { /* ignore */ }
    }
    return [...hosts];
})();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const OURS = /^https:\/\/([a-z0-9-]+\.)*learnfrenchwithnatives\.com$/i;

/** Is this request coming from one of our pages? */
function fromOurSite(req) {
    const origin = req.headers.origin || '';
    if (origin) {
        if (OURS.test(origin)) return true;
        if (!IS_PRODUCTION && LOCAL.test(origin)) return true;
        try {
            if (OWN_HOSTS.includes(new URL(origin).hostname.toLowerCase())) return true;
        } catch { /* malformed origin */ }
        return false;
    }
    // No Origin header: only accept it outside production (local testing).
    return !IS_PRODUCTION;
}

// Nothing is ever returned: one answer for every outcome.
const done = (res) => res.status(204).end();

router.post('/collect', async (req, res) => {
    try {
        if (!fromOurSite(req)) return done(res);

        const beacon = analytics.readBeacon(req.body);
        if (!beacon) return done(res);

        if (beacon.kind === 'vitals') await analytics.attachVitals(req.db, req, beacon);
        else await analytics.recordVisit(req.db, req, beacon, OWN_HOSTS);

        return done(res);
    } catch (error) {
        // A failed measurement must never affect the visitor's page.
        console.error('Site beacon error:', error.message);
        return done(res);
    }
});

// Anything else under /api/site is not a thing.
router.all(/.*/, (_req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
