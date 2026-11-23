/**
 * Lessons and practice activities that are not public: the first module of
 * every non-A1 path (free account) and everything else (Premium). The public
 * website holds ONLY visitor content and outlines; full lessons, texts,
 * dialogues, ear labs, missions, listening docs, dictations, and locked audio
 * keys come exclusively from here after live server-side verification.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const site = require('../services/siteSession');
const { reaches } = require('../services/learnAccess');
const { getMode } = require('../services/learnMode');

const router = express.Router();

const PACK = path.resolve(process.env.LEARN_PRIVATE_DIR || path.join(__dirname, '..', '..', 'frontend', 'learn-private'));
const PRACTICE_KINDS = new Set(['text', 'mission', 'dialogue', 'ear', 'doc', 'dictation', 'game']);

// Each file is kept in memory and read again when the build replaced it.
const cache = new Map();
function readPack(relPath) {
    const file = path.join(PACK, relPath);
    let stat;
    try { stat = fs.statSync(file); } catch { return null; }
    const hit = cache.get(relPath);
    if (hit && hit.mtime === stat.mtimeMs) return hit.data;
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cache.size > 1500) cache.clear();
    cache.set(relPath, { mtime: stat.mtimeMs, data });
    return data;
}

const perAccount = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: (req) => (req.siteUser ? Number(process.env.LEARN_CONTENT_PER_HOUR) || 150 : 400),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => (req.siteUser ? `u:${req.siteUser.id}` : `ip:${ipKeyGenerator(req.ip)}`),
    message: { error: 'You have opened a lot of lessons in a short time. Please wait a little and try again.', code: 'TOO_MANY' },
});

function setPrivateHeaders(res, mode) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Vary', 'Cookie');
    res.setHeader('X-Learn-Mode', mode);
}

router.get('/content/courses/:id', site.siteAuth(), perAccount, async (req, res) => {
    const mode = await getMode(req.db, { fresh: true });
    setPrivateHeaders(res, mode);
    const id = String(req.params.id || '');
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    let course;
    try {
        course = readPack(path.join('courses', `${id}.json`));
    } catch (err) {
        console.error(`[learn-content] course ${id} unreadable:`, err.message);
        return res.status(503).json({ error: 'Please try again in a moment.', code: 'UNAVAILABLE' });
    }
    if (!course) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });

    const level = mode === 'free' ? 'premium' : req.siteAccess.level;
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

router.get('/content/practice/:kind/:id', site.siteAuth(), perAccount, async (req, res) => {
    const mode = await getMode(req.db, { fresh: true });
    setPrivateHeaders(res, mode);
    const kind = String(req.params.kind || '');
    const id = String(req.params.id || '');
    if (!PRACTICE_KINDS.has(kind) || !/^[a-z0-9][a-z0-9_-]{0,99}$/.test(id)) {
        return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
    }
    let item;
    try {
        item = readPack(path.join('practice', kind, `${id}.json`));
    } catch (err) {
        console.error(`[learn-content] ${kind}/${id} unreadable:`, err.message);
        return res.status(503).json({ error: 'Please try again in a moment.', code: 'UNAVAILABLE' });
    }
    if (!item) return res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });

    const level = mode === 'free' ? 'premium' : req.siteAccess.level;
    const needed = item.tier || 'premium';
    if (!reaches(level, needed)) {
        if (!req.siteUser) return res.status(401).json({ error: 'Please sign in.', code: 'SIGN_IN', needed });
        return res.status(403).json({ error: 'This activity is part of Premium.', code: 'PREMIUM', needed });
    }

    if (req.siteUser) {
        req.db.run('INSERT INTO learn_content_log (user_id, item) VALUES ($1, $2)', [req.siteUser.id, `${kind}:${id}`])
            .catch(err => console.error('[learn-content] log failed:', err.message));
    }
    return res.json({
        id,
        kind,
        tier: needed,
        data: item.data ?? null,
        audio: item.audio || { keys: [], sealed: [] },
        textAudio: item.textAudio || null,
    });
});

module.exports = router;
module.exports.PACK = PACK;
