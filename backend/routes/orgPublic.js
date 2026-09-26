/**
 * Public company branding, for the company's own sign-in page (/o/<slug>):
 *
 *   GET /api/public/org/:slug        { name, logo_url, default_language }
 *   GET /api/public/org/:slug/logo   the logo image
 *
 * Only the displayed name and logo are public — nothing about the company's
 * state, dates, credits or people.
 */
const express = require('express');
const orgs = require('../services/organizationService');
const logos = require('../services/organizationLogo');

const router = express.Router();
const SLUG_RE = /^[a-z0-9-]{1,80}$/i;

router.get('/:slug', async (req, res) => {
    try {
        if (!SLUG_RE.test(req.params.slug) || !(await orgs.ready(req.db))) return res.status(404).json({ error: 'Not found' });
        const org = await req.db.get(`SELECT * FROM organizations WHERE lower(slug) = lower($1)`, [req.params.slug]);
        if (!org) return res.status(404).json({ error: 'Not found' });
        const brand = orgs.brandOf(org);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.json({ name: brand.name, slug: brand.slug, logo_url: brand.logo_url, default_language: brand.default_language });
    } catch (err) {
        console.error('GET /public/org/:slug error:', err.message);
        res.status(500).json({ error: 'Unavailable' });
    }
});

router.get('/:slug/logo', async (req, res) => {
    try {
        if (!SLUG_RE.test(req.params.slug) || !(await orgs.ready(req.db))) return res.status(404).end();
        const logo = await logos.loadLogo(req.db, req.params.slug);
        if (!logo) return res.status(404).end();
        res.setHeader('Content-Type', logo.mime);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'none'");
        // The URL carries the logo's version, so it can be cached for long.
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.end(logo.buffer);
    } catch (err) {
        console.error('GET /public/org/:slug/logo error:', err.message);
        res.status(404).end();
    }
});

module.exports = router;
