/**
 * Exam candidates — accounts that only prepare for the exam.
 *
 * A candidate has no batch, no teacher and no classes: an administrator opens
 * exam content to them (tcf_exam_assignments, student_id = the candidate) and
 * follows their results. Their exam goal lives in exam_candidate_profiles.
 */
const { hasTable } = require('./schemaFeatures');

const EXAM_TARGETS = ['tcf_canada', 'tcf_quebec', 'tcf_tp'];
const NCLC_TARGETS = [4, 5, 6, 7, 8, 9, 10];
const NOTES_MAX = 2000;

const blank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/**
 * Validates the exam-goal fields present in `body`. Only the keys that are
 * present are returned, so a partial update leaves the others untouched.
 * `withNotes` lets admins set the private note; candidates never can.
 */
function readGoal(body = {}, { withNotes = false } = {}) {
    const goal = {};
    if ('target_exam' in body) {
        if (blank(body.target_exam)) goal.target_exam = 'tcf_canada';
        else if (!EXAM_TARGETS.includes(body.target_exam)) return { error: 'Choose a valid exam (TCF Canada, TCF Québec or TCF Tout public).' };
        else goal.target_exam = body.target_exam;
    }
    if ('target_nclc' in body) {
        if (blank(body.target_nclc)) goal.target_nclc = null;
        else {
            const n = Number(body.target_nclc);
            if (!NCLC_TARGETS.includes(n)) return { error: 'The target level must be between NCLC 4 and NCLC 10.' };
            goal.target_nclc = n;
        }
    }
    if ('exam_date' in body) {
        if (blank(body.exam_date)) goal.exam_date = null;
        else {
            // A calendar date (YYYY-MM-DD, or the date part of an ISO timestamp) that really exists
            const raw = String(body.exam_date).trim();
            const s = raw.slice(0, 10);
            const d = new Date(`${s}T00:00:00Z`);
            const real = /^\d{4}-\d{2}-\d{2}(T[\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(raw)
                && !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
            const year = real ? d.getUTCFullYear() : 0;
            if (!real || year < 2020 || year > 2100) return { error: 'The exam date is not a valid date.' };
            goal.exam_date = s;
        }
    }
    if (withNotes && 'admin_notes' in body) {
        goal.admin_notes = blank(body.admin_notes) ? null : String(body.admin_notes).trim().slice(0, NOTES_MAX);
    }
    return { goal };
}

/** Inserts or updates the exam goal. Does nothing when the migration is not applied yet. */
async function saveGoal(db, userId, goal, actorId) {
    if (!(await hasTable(db, 'exam_candidate_profiles'))) return false;
    const keys = Object.keys(goal);
    await db.run(
        `INSERT INTO exam_candidate_profiles (user_id, created_by) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
        [userId, actorId || null]
    );
    if (keys.length) {
        const sets = keys.map((k, i) => `${k} = $${i + 2}`);
        await db.run(
            `UPDATE exam_candidate_profiles SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
            [userId, ...keys.map(k => goal[k])]
        );
    }
    return true;
}

async function getGoal(db, userId, { withNotes = false } = {}) {
    if (!(await hasTable(db, 'exam_candidate_profiles'))) return null;
    const row = await db.get(
        `SELECT target_exam, target_nclc, exam_date::text AS exam_date, admin_notes, updated_at
         FROM exam_candidate_profiles WHERE user_id = $1`,
        [userId]
    );
    if (!row) return { target_exam: 'tcf_canada', target_nclc: null, exam_date: null, ...(withNotes ? { admin_notes: null } : {}) };
    if (!withNotes) delete row.admin_notes;
    return row;
}

/**
 * For the admin user list: exam goal, open access and last practice of each
 * candidate, in four set-based queries whatever the number of candidates.
 */
async function summaries(db, ids) {
    const out = new Map();
    const list = [...new Set(ids.map(Number).filter(Number.isInteger))];
    if (!list.length) return out;
    list.forEach(id => out.set(id, {
        target_exam: 'tcf_canada', target_nclc: null, exam_date: null, admin_notes: null,
        active_items: 0, total_items: 0, access_until: null, last_practice_at: null, attempts: 0,
    }));

    if (await hasTable(db, 'exam_candidate_profiles')) {
        const goals = await db.all(
            `SELECT user_id, target_exam, target_nclc, exam_date::text AS exam_date, admin_notes
             FROM exam_candidate_profiles WHERE user_id = ANY($1::int[])`, [list]);
        goals.forEach(g => Object.assign(out.get(Number(g.user_id)), {
            target_exam: g.target_exam, target_nclc: g.target_nclc, exam_date: g.exam_date, admin_notes: g.admin_notes,
        }));
    }

    const access = await db.all(
        `SELECT student_id AS user_id,
                COUNT(*)::int AS total_items,
                COUNT(*) FILTER (WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)::int AS active_items,
                MAX(expires_at) FILTER (WHERE expires_at > CURRENT_TIMESTAMP) AS access_until
         FROM tcf_exam_assignments WHERE student_id = ANY($1::int[]) GROUP BY student_id`, [list]);
    access.forEach(a => Object.assign(out.get(Number(a.user_id)), {
        total_items: a.total_items, active_items: a.active_items, access_until: a.access_until,
    }));

    const withCe = await hasTable(db, 'tcf_ce_quiz_attempts');
    const activity = await db.all(
        `SELECT uid AS user_id, COUNT(*)::int AS attempts, MAX(at) AS last_at FROM (
            SELECT student_id AS uid, completed_at AS at FROM tcf_co_quiz_attempts
             WHERE student_id = ANY($1::int[]) AND completed_at IS NOT NULL
            ${withCe ? `UNION ALL SELECT student_id, completed_at FROM tcf_ce_quiz_attempts
             WHERE student_id = ANY($1::int[]) AND completed_at IS NOT NULL` : ''}
            UNION ALL SELECT student_id, submitted_at FROM tcf_ee_simulations
             WHERE student_id = ANY($1::int[]) AND status = 'completed'
            UNION ALL SELECT user_id, completed_at FROM eo_simulations
             WHERE user_id = ANY($1::int[]) AND status = 'completed'
         ) x GROUP BY uid`, [list]);
    activity.forEach(a => Object.assign(out.get(Number(a.user_id)), { attempts: a.attempts, last_practice_at: a.last_at }));
    return out;
}

/** Why an account cannot become a candidate: candidates never belong to a batch or teach one. */
async function roleChangeBlockers(db, userId) {
    const row = await db.get(
        `SELECT (SELECT COUNT(*) FROM batch_students WHERE student_id = $1)::int AS enrolled,
                (SELECT COUNT(*) FROM batches WHERE teacher_id = $1)::int AS teaching`,
        [userId]
    );
    const reasons = [];
    if (row?.enrolled) reasons.push(`is enrolled in ${row.enrolled} batch${row.enrolled > 1 ? 'es' : ''}`);
    if (row?.teaching) reasons.push(`teaches ${row.teaching} batch${row.teaching > 1 ? 'es' : ''}`);
    return reasons;
}

module.exports = { EXAM_TARGETS, NCLC_TARGETS, readGoal, saveGoal, getGoal, summaries, roleChangeBlockers };
