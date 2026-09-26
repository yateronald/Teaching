/**
 * Exam space — the learner's own exam-preparation record, across the four
 * TCF skills: goal, open access, estimated level and every result.
 *
 *   GET /api/exam-space/overview   dashboard data
 *   GET /api/exam-space/results    full history (filter by skill, paginated)
 *   GET /api/exam-space/goal       the candidate's exam goal
 *   PUT /api/exam-space/goal       the candidate updates target level / exam date
 *
 * Everything is scoped to req.user.id: there is no way to read someone else.
 */
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { hasTable } = require('../services/schemaFeatures');
const scale = require('../services/examScale');
const candidates = require('../services/candidateService');
const aiCredits = require('../services/aiCreditService');
const { learnerAssignments } = require('../services/examAccessService');

const router = express.Router();
router.use(authenticateToken, authorizeRoles('candidate', 'student'));

const SKILLS = ['ce', 'co', 'ee', 'eo'];
const SKILL_OF_TYPE = {
    ce_series: 'ce', co_series: 'co',
    ee_year: 'ee', ee_month: 'ee', ee_combinaison: 'ee',
    eo_year: 'eo', eo_month: 'eo', eo_partie: 'eo',
};
const SKILL_OF_CATEGORY = {
    'Compréhension Écrite': 'ce', 'Compréhension Orale': 'co', 'Expression Écrite': 'ee', 'Expression Orale': 'eo',
};
const round1 = (v) => Math.round(Number(v) * 10) / 10;

/** One completed attempt in a shape shared by the four skills. Scores: points /699 (ce, co) or /20 (ee, eo). */
function shape(skill, row) {
    const score = row.score == null ? null : Number(row.score);
    const max = skill === 'ce' || skill === 'co' ? 699 : 20;
    const comprehension = max === 699;
    return {
        skill,
        id: Number(row.id),
        title: row.title || null,
        at: row.at,
        score: score == null ? null : comprehension ? Math.round(score) : round1(score),
        max,
        percent: score == null ? null : Math.round((score / max) * 100),
        cefr: score == null ? null : comprehension ? scale.cefrForPoints(score) : scale.cefrFor(score),
        nclc: score == null ? null : comprehension ? scale.nclcForPoints(skill, score) : scale.nclcFor(score),
        detail: row.detail || null,
        duration_seconds: row.duration == null ? null : Number(row.duration),
    };
}

/**
 * The SQL of completed attempts for each skill. `who` is the condition on the
 * learner column ("= $1" for one learner, "= ANY($1::int[])" for several);
 * every row carries the learner id as uid.
 */
async function attemptQueries(db, who, skill = null) {
    const parts = [];
    const want = (k) => !skill || skill === k;
    if (want('ce') && (await hasTable(db, 'tcf_ce_quiz_attempts'))) {
        parts.push(`SELECT 'ce' AS skill, a.student_id AS uid, a.id, s.name AS title, a.completed_at AS at, a.earned_points AS score,
                a.time_spent_seconds AS duration, (a.correct_count || '/' || a.total_questions) AS detail
            FROM tcf_ce_quiz_attempts a JOIN tcf_ce_series s ON s.id = a.series_id
            WHERE a.student_id ${who} AND a.completed_at IS NOT NULL`);
    }
    if (want('co')) {
        parts.push(`SELECT 'co' AS skill, a.student_id AS uid, a.id, s.name AS title, a.completed_at AS at, a.earned_points AS score,
                a.time_spent_seconds AS duration, (a.correct_count || '/' || a.total_questions) AS detail
            FROM tcf_co_quiz_attempts a JOIN tcf_co_series s ON s.id = a.series_id
            WHERE a.student_id ${who} AND a.completed_at IS NOT NULL`);
    }
    if (want('ee')) {
        parts.push(`SELECT 'ee' AS skill, s.student_id AS uid, s.id, TRIM(COALESCE(c.name, 'Combinaison') || ' · ' || COALESCE(m.month_name, '') || ' ' || COALESCE(y.year::text, '')) AS title,
                COALESCE(s.submitted_at, s.started_at) AS at, s.average_score AS score, s.time_used_seconds AS duration, NULL::text AS detail
            FROM tcf_ee_simulations s
            LEFT JOIN tcf_ee_combinaisons c ON c.id = s.combinaison_id
            LEFT JOIN tcf_ee_months m ON m.id = c.month_id
            LEFT JOIN tcf_ee_years y ON y.id = m.year_id
            WHERE s.student_id ${who} AND s.status = 'completed'`);
    }
    if (want('eo')) {
        parts.push(`SELECT 'eo' AS skill, s.user_id AS uid, s.id, TRIM(COALESCE(p.name, 'Simulation') || ' · ' || COALESCE(m.month_name, '') || ' ' || COALESCE(y.year::text, '')) AS title,
                s.completed_at AS at, s.overall_score AS score, s.duration_seconds AS duration, NULL::text AS detail
            FROM eo_simulations s
            LEFT JOIN tcf_eo_parties p ON p.id = s.partie_id
            LEFT JOIN tcf_eo_months m ON m.id = p.month_id
            LEFT JOIN tcf_eo_years y ON y.id = m.year_id
            WHERE s.user_id ${who} AND s.status = 'completed'`);
    }
    return parts;
}

/** Completed attempts of the user, newest first, optionally for one skill. */
async function history(db, userId, { skill = null, limit = 500 } = {}) {
    const parts = await attemptQueries(db, '= $1', skill);
    if (!parts.length) return [];
    const rows = await db.all(
        `SELECT * FROM (${parts.join(' UNION ALL ')}) h WHERE h.at IS NOT NULL ORDER BY h.at DESC LIMIT $2`,
        [userId, limit]
    );
    return rows.map(r => shape(r.skill, r));
}

/** Completed attempts of several learners (a company's), newest first: learner id → attempts. */
async function historyOf(db, userIds, { limit = 20000 } = {}) {
    const ids = [...new Set((userIds || []).map(Number).filter(Number.isInteger))];
    const out = new Map(ids.map(id => [id, []]));
    if (!ids.length) return out;
    const parts = await attemptQueries(db, '= ANY($1::int[])');
    const rows = await db.all(
        `SELECT * FROM (${parts.join(' UNION ALL ')}) h WHERE h.at IS NOT NULL ORDER BY h.at DESC LIMIT $2`,
        [ids, limit]
    );
    for (const r of rows) out.get(Number(r.uid))?.push(shape(r.skill, r));
    return out;
}

/** Per-skill figures: attempts, best, latest and an estimate from the three latest results. */
function skillSummary(skill, attempts) {
    const scored = attempts.filter(a => a.score != null);
    if (!scored.length) return { skill, attempts: 0, best: null, latest: null, estimate: null, last_at: null, trend: [] };
    const best = scored.reduce((b, a) => (a.score > b.score ? a : b));
    const recent = scored.slice(0, 3);
    const mean = recent.reduce((s, a) => s + a.score, 0) / recent.length;
    const est = shape(skill, { id: 0, score: mean, at: recent[0].at });
    return {
        skill,
        attempts: scored.length,
        best: { score: best.score, max: best.max, cefr: best.cefr, nclc: best.nclc, at: best.at },
        latest: { score: scored[0].score, max: scored[0].max, cefr: scored[0].cefr, nclc: scored[0].nclc, at: scored[0].at },
        estimate: { score: est.score, max: est.max, percent: est.percent, cefr: est.cefr, nclc: est.nclc, based_on: recent.length },
        last_at: scored[0].at,
        trend: scored.slice(0, 12).reverse().map(a => ({ at: a.at, percent: a.percent, score: a.score })),
    };
}

/** What is open to the learner (direct, batch and company-group assignments, company dates applied), with readable names and end dates. */
async function accessList(db, userId) {
    const rows = await learnerAssignments(db, userId);
    const ids = (type) => [...new Set(rows.filter(r => r.content_type === type).map(r => Number(r.content_id)))];
    const names = new Map();
    const load = async (type, sql) => {
        const list = ids(type);
        if (!list.length) return;
        (await db.all(sql, [list])).forEach(r => names.set(`${type}:${r.id}`, { name: r.name, skill: r.skill || SKILL_OF_TYPE[type] }));
    };
    await load('category', `SELECT id, name, name AS skill FROM tcf_categories WHERE id = ANY($1::int[])`);
    await load('ce_series', `SELECT id, name FROM tcf_ce_series WHERE id = ANY($1::int[])`);
    await load('co_series', `SELECT id, name FROM tcf_co_series WHERE id = ANY($1::int[])`);
    await load('ee_year', `SELECT id, 'Writing ' || year AS name FROM tcf_ee_years WHERE id = ANY($1::int[])`);
    await load('eo_year', `SELECT id, 'Speaking ' || year AS name FROM tcf_eo_years WHERE id = ANY($1::int[])`);
    await load('ee_month', `SELECT m.id, m.month_name || ' ' || y.year AS name FROM tcf_ee_months m JOIN tcf_ee_years y ON y.id = m.year_id WHERE m.id = ANY($1::int[])`);
    await load('eo_month', `SELECT m.id, m.month_name || ' ' || y.year AS name FROM tcf_eo_months m JOIN tcf_eo_years y ON y.id = m.year_id WHERE m.id = ANY($1::int[])`);
    await load('ee_combinaison', `SELECT id, name FROM tcf_ee_combinaisons WHERE id = ANY($1::int[])`);
    await load('eo_partie', `SELECT id, name FROM tcf_eo_parties WHERE id = ANY($1::int[])`);

    // One line per item, keeping its latest end date (an item can be assigned twice).
    const now = Date.now();
    const byKey = new Map();
    for (const r of rows) {
        const key = `${r.content_type}:${r.content_id}`;
        const meta = names.get(key);
        if (!meta) continue; // content deleted since
        const end = r.expires_at ? new Date(r.expires_at).getTime() : Infinity;
        const prev = byKey.get(key);
        if (!prev || end > prev.end) byKey.set(key, { r, meta, end });
    }
    return [...byKey.values()]
        .map(({ r, meta, end }) => ({
            type: r.content_type,
            id: Number(r.content_id),
            name: meta.name,
            skill: r.content_type === 'category' ? SKILL_OF_CATEGORY[meta.skill] || null : meta.skill,
            expires_at: r.expires_at,
            assigned_at: r.assigned_at,
            active: end > now,
        }))
        .sort((a, b) => (Number(b.active) - Number(a.active))
            || ((a.expires_at ? new Date(a.expires_at).getTime() : Infinity) - (b.expires_at ? new Date(b.expires_at).getTime() : Infinity)));
}

/** Everything the exam dashboard shows for one learner (also used by their company's space). */
async function buildOverview(db, userId, role) {
    const [all, access, credits, goal] = await Promise.all([
        history(db, userId, { limit: 400 }),
        accessList(db, userId),
        aiCredits.getBalance(db, userId).catch(() => null),
        role === 'candidate' ? candidates.getGoal(db, userId) : Promise.resolve(null),
    ]);

    const skills = SKILLS.map(k => skillSummary(k, all.filter(a => a.skill === k)));
    const estimates = skills.filter(s => s.estimate);
    const withNclc = estimates.filter(s => s.estimate.nclc != null);
    const active = access.filter(a => a.active);
    const upcomingEnd = active.filter(a => a.expires_at).map(a => a.expires_at).sort()[0] || null;

    const since = Date.now() - 30 * 86400e3;
    return {
        role,
        goal,
        credits: credits ? { ee: Number(credits.ee_credits) || 0, eo: Number(credits.eo_credits) || 0 } : null,
        skills,
        level: {
            // Immigration files are judged on the weakest skill, so the overall level is the lowest one.
            nclc: withNclc.length === 4 ? Math.min(...withNclc.map(s => s.estimate.nclc)) : null,
            skills_measured: estimates.length,
            // Every skill measured, but at least one is still under the NCLC 4 threshold
            below_4: estimates.length === 4 && withNclc.length < 4,
            weakest: estimates.length ? estimates.reduce((w, s) => (s.estimate.percent < w.estimate.percent ? s : w)).skill : null,
        },
        activity: {
            total: all.length,
            last_30_days: all.filter(a => new Date(a.at).getTime() >= since).length,
            minutes: Math.round(all.reduce((s, a) => s + (a.duration_seconds || 0), 0) / 60),
            last_at: all[0]?.at || null,
        },
        access: {
            active_items: active.length,
            next_end: upcomingEnd,
            items: access.slice(0, 60),
        },
        recent: all.slice(0, 8),
    };
}

// GET /overview — everything the exam dashboard shows, in one call
router.get('/overview', async (req, res) => {
    try {
        const overview = await buildOverview(req.db, req.user.id, req.user.role);
        // A company learner's dashboard carries the company's name, logo and state.
        res.json({ ...overview, organization: req.user.organization || null });
    } catch (error) {
        console.error('GET /exam-space/overview error:', error);
        res.status(500).json({ error: 'Could not load your exam dashboard.' });
    }
});

// GET /results?skill=ce|co|ee|eo&limit=&offset= — full history
router.get('/results', async (req, res) => {
    try {
        const skill = SKILLS.includes(req.query.skill) ? req.query.skill : null;
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
        const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
        const all = await history(req.db, req.user.id, { skill, limit: 2000 });
        const counts = SKILLS.reduce((o, k) => ({ ...o, [k]: 0 }), {});
        if (!skill) all.forEach(a => { counts[a.skill]++; });
        else counts[skill] = all.length;
        res.json({ total: all.length, counts, items: all.slice(offset, offset + limit), limit, offset });
    } catch (error) {
        console.error('GET /exam-space/results error:', error);
        res.status(500).json({ error: 'Could not load your results.' });
    }
});

// GET /goal — the candidate's exam goal
router.get('/goal', authorizeRoles('candidate'), async (req, res) => {
    try {
        res.json(await candidates.getGoal(req.db, req.user.id) || { target_exam: 'tcf_canada', target_nclc: null, exam_date: null });
    } catch (error) {
        console.error('GET /exam-space/goal error:', error);
        res.status(500).json({ error: 'Could not load your exam goal.' });
    }
});

// PUT /goal — target exam, target NCLC and exam date (the admin note stays private)
router.put('/goal', authorizeRoles('candidate'), async (req, res) => {
    try {
        const { goal, error } = candidates.readGoal(req.body || {}, { withNotes: false });
        if (error) return res.status(400).json({ error });
        if (!Object.keys(goal).length) return res.status(400).json({ error: 'Nothing to update.' });
        const saved = await candidates.saveGoal(req.db, req.user.id, goal, req.user.id);
        if (!saved) return res.status(503).json({ error: 'Exam goals are not available yet. Please contact the administrator.' });
        res.json(await candidates.getGoal(req.db, req.user.id));
    } catch (error) {
        console.error('PUT /exam-space/goal error:', error);
        res.status(500).json({ error: 'Could not save your exam goal.' });
    }
});

module.exports = router;
module.exports.history = history;
module.exports.buildOverview = buildOverview;
module.exports.SKILLS = SKILLS;
module.exports.historyOf = historyOf;
module.exports.skillSummary = skillSummary;
