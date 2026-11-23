/**
 * Lessons that are not public: the first module of every path (free account)
 * and everything else (Premium). The website's public files only hold the
 * visitor module and lesson outlines (titles, objectives, no exercises); the
 * full lessons come from here, after the access check, to the people allowed
 * to see them.
 *
 * The lessons are read from the private pack the frontend build writes
 * (frontend/learn-private, or LEARN_PRIVATE_DIR): never inside the folder the
 * web server publishes.
 *
 * Every load is recorded (learn_content_log) and limited per account, so an
 * account cannot be used to copy the whole library in one go.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const site = require('../services/siteSession');
const { reaches } = require('../services/learnAccess');
const { contentLevel } = require('../services/learnMode');

const router = express.Router();

const PACK = path.resolve(process.env.LEARN_PRIVATE_DIR || path.join(__dirname, '..', '..', 'frontend', 'learn-private'));

// Each course file is kept in memory and read again when the build replaced it.
const cache = new Map();
function readCourse(id) {
    const file = path.join(PACK, 'courses', `${id}.json`);
    let stat;
    try { stat = fs.statSync(file); } catch { return null; }
    const hit = cache.get(id);
    if (hit && hit.mtime === stat.mtimeMs) return hit.data;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cache.size > 600) cache.clear();
    cache.set(id, { mtime: stat.mtimeMs, data });
    return data;
}

const perAccount = rateLimit({
    windowMs: 60 * 60 * 1000,
    // Visitors share an address (a school, an office): a little more room for them.
    limit: (req) => (req.siteUser ? Number(process.env.LEARN_CONTENT_PER_HOUR) || 150 : 400),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => (req.siteUser ? `u:${req.siteUser.id}` : `ip:${ipKeyGenerator(req.ip)}`),
    message: { error: 'You have opened a lot of lessons in a short time. Please wait a little and try again.', code: 'TOO_MANY' },
});

router.get('/content/courses/:id', site.siteAuth(), perAccount, async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const id = String(req.params.id || '');
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    let course;
    try {
        course = readCourse(id);
    } catch (err) {
        console.error(`[learn-content] course ${id} unreadable:`, err.message);
        return res.status(503).json({ error: 'Please try again in a moment.', code: 'UNAVAILABLE' });
    }
    if (!course) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });

    // While the courses are free for everyone, every lesson goes to everyone.
    const level = await contentLevel(req.db, req.siteAccess);
    const tiers = course.tiers || {};
    const allowed = course.lessons.filter(l => reaches(level, tiers[l.id] || 'premium'));
    if (!allowed.length) {
        const needed = course.lessons.some(l => (tiers[l.id] || 'premium') === 'free') ? 'free' : 'premium';
        if (!req.siteUser) return res.status(401).json({ error: 'Please sign in.', code: 'SIGN_IN', needed });
        return res.status(403).json({ error: 'This course is part of Premium.', code: 'PREMIUM', needed });
    }

    const audioKeys = new Set();
    for (const l of allowed) for (const k of (course.audio?.[l.id] || [])) audioKeys.add(k);
    const sealed = (course.sealed || []).filter(k => audioKeys.has(k));

    if (req.siteUser) {
        req.db.run('INSERT INTO learn_content_log (user_id, item) VALUES ($1, $2)', [req.siteUser.id, `course:${id}`])
            .catch(err => console.error('[learn-content] log failed:', err.message));
    }
    return res.json({
        id,
        about: course.about || null,
        lessons: allowed,
        audio: { keys: [...audioKeys], sealed },
        examples: course.examples || {},
    });
});

module.exports = router;
module.exports.PACK = PACK;
