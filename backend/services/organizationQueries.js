/**
 * Read models of a company, shared by the administrator's company pages and
 * the company's own space. Every query is scoped by the company id it is given;
 * callers take that id from the signed-in account (company space) or from the
 * URL (administrator), never from anything else the client sends.
 */
const { historyOf, skillSummary, SKILLS } = require('../routes/examSpace');
const { IDLE_MINUTES } = require('./sessionService');
const { hasTable } = require('./schemaFeatures');
const orgs = require('./organizationService');

const INACTIVE_DAYS = 14;

/** Learners of the company, with credits, groups and practice figures. */
async function learnersOf(db, orgId) {
    return (await learnersWithHistory(db, orgId)).learners;
}

/** The learners and every completed attempt of each (learner id → attempts). */
async function learnersWithHistory(db, orgId) {
    const rows = await db.all(
        `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at, u.must_change_password,
                COALESCE(c.ee_credits, 0)::int AS ee_credits, COALESCE(c.eo_credits, 0)::int AS eo_credits,
                COALESCE((SELECT json_agg(json_build_object('id', g.id, 'name', g.name) ORDER BY g.name)
                            FROM organization_group_members gm JOIN organization_groups g ON g.id = gm.group_id
                           WHERE gm.user_id = u.id), '[]'::json) AS groups
           FROM users u
           LEFT JOIN student_ai_credits c ON c.user_id = u.id
          WHERE u.organization_id = $1 AND u.role = 'candidate'
          ORDER BY u.is_active DESC, lower(u.last_name), lower(u.first_name)`,
        [orgId]
    );
    const byLearner = await historyOf(db, rows.map(r => r.id));
    const seen = await lastSeen(db, rows.map(r => r.id));
    const learners = rows.map(r => {
        const attempts = byLearner.get(Number(r.id)) || [];
        const skills = SKILLS.map(k => skillSummary(k, attempts.filter(a => a.skill === k)));
        const estimates = skills.filter(s => s.estimate);
        const withNclc = estimates.filter(s => s.estimate.nclc != null);
        return {
            ...r,
            invitation_pending: !!r.must_change_password,
            attempts: attempts.length,
            last_practice_at: attempts[0]?.at || null,
            last_seen_at: seen.get(Number(r.id)) || null,
            // Immigration files are judged on the weakest skill.
            nclc: withNclc.length === 4 ? Math.min(...withNclc.map(s => s.estimate.nclc)) : null,
            skills: Object.fromEntries(skills.map(s => [s.skill, s.estimate ? { nclc: s.estimate.nclc, cefr: s.estimate.cefr, percent: s.estimate.percent } : null])),
        };
    }).map(({ must_change_password, ...r }) => r);
    return { learners, byLearner };
}

/** When each account was last seen on a device. */
async function lastSeen(db, ids) {
    const out = new Map();
    if (!ids.length || !(await hasTable(db, 'user_sessions'))) return out;
    const rows = await db.all(
        `SELECT user_id, MAX(last_seen_at) AS at FROM user_sessions WHERE user_id = ANY($1::int[]) GROUP BY user_id`, [ids]);
    rows.forEach(r => out.set(Number(r.user_id), r.at));
    return out;
}

async function managersOf(db, orgId) {
    const rows = await db.all(
        `SELECT id, first_name, last_name, email, is_active, created_at, must_change_password
           FROM users WHERE organization_id = $1 AND role = 'org_admin' ORDER BY created_at ASC`,
        [orgId]
    );
    const seen = await lastSeen(db, rows.map(r => r.id));
    return rows.map(({ must_change_password, ...r }) => ({
        ...r, invitation_pending: !!must_change_password, last_seen_at: seen.get(Number(r.id)) || null,
    }));
}

async function groupsOf(db, orgId) {
    return db.all(
        `SELECT g.id, g.name, g.created_at,
                COUNT(gm.user_id)::int AS member_count,
                COALESCE(json_agg(gm.user_id ORDER BY gm.user_id) FILTER (WHERE gm.user_id IS NOT NULL), '[]'::json) AS member_ids
           FROM organization_groups g
           LEFT JOIN organization_group_members gm ON gm.group_id = g.id
          WHERE g.organization_id = $1
          GROUP BY g.id ORDER BY lower(g.name)`,
        [orgId]
    );
}

/** Counts for lists: learners (active / all), managers, seats. */
async function countsOf(db, orgId) {
    return db.get(
        `SELECT COUNT(*) FILTER (WHERE role = 'candidate' AND is_active)::int AS active_learners,
                COUNT(*) FILTER (WHERE role = 'candidate')::int AS learners,
                COUNT(*) FILTER (WHERE role = 'org_admin' AND is_active)::int AS managers
           FROM users WHERE organization_id = $1`,
        [orgId]
    );
}

/** The company as the administrator and its managers see it. */
async function describe(db, org) {
    const [counts, credits] = await Promise.all([countsOf(db, org.id), orgs.creditSummary(db, org.id)]);
    return {
        id: Number(org.id),
        name: org.name,
        display_name: org.display_name,
        slug: org.slug,
        default_language: org.default_language,
        status: org.status,
        state: orgs.stateOf(org),
        access_starts_at: org.access_starts_at,
        access_ends_at: org.access_ends_at,
        days_left: orgs.stateOf(org) === 'active' ? orgs.daysLeft(org) : 0,
        expiring_soon: orgs.stateOf(org) === 'active' && orgs.daysLeft(org) <= orgs.EXPIRY_NOTICE_DAYS,
        seat_limit: org.seat_limit,
        // The package counts every learner account, active or deactivated.
        seats_used: counts.learners,
        seats_left: Math.max(0, org.seat_limit - counts.learners),
        notes: org.notes,
        brand: orgs.brandOf(org),
        created_at: org.created_at,
        ...counts,
        credits,
    };
}

/** Content the company may use, with readable names. */
async function contentOf(db, orgId) {
    const { contentNameResolver } = require('./contentNames');
    const rows = await db.all(
        `SELECT content_type, content_id FROM organization_content WHERE organization_id = $1 ORDER BY content_type, content_id`, [orgId]);
    const nameOf = await contentNameResolver(db, rows);
    return rows.map(r => ({ content_type: r.content_type, content_id: Number(r.content_id), name: nameOf(r.content_type, r.content_id) }));
}

/** The company dashboard: people, credits, activity and levels. */
async function dashboardOf(db, org) {
    const { learners, byLearner } = await learnersWithHistory(db, org.id);
    const active = learners.filter(l => l.is_active);
    const now = Date.now();
    const since30 = now - 30 * 86400e3;
    const all = active.flatMap(l => byLearner.get(Number(l.id)) || []);
    const recent = all.filter(a => new Date(a.at).getTime() >= since30);

    const perSkill = SKILLS.map(skill => {
        const levels = active.map(l => l.skills[skill]).filter(Boolean);
        return {
            skill,
            learners_measured: levels.length,
            average_percent: levels.length ? Math.round(levels.reduce((t, s) => t + s.percent, 0) / levels.length) : null,
            attempts_30_days: recent.filter(a => a.skill === skill).length,
        };
    });
    // Activity per week over the last 8 weeks, for the chart.
    const weeks = Array.from({ length: 8 }, (_, i) => {
        const end = now - i * 7 * 86400e3;
        const start = end - 7 * 86400e3;
        return {
            week_start: new Date(start).toISOString(),
            attempts: all.filter(a => { const t = new Date(a.at).getTime(); return t >= start && t < end; }).length,
        };
    }).reverse();
    const inactive = active
        .filter(l => !l.last_practice_at || now - new Date(l.last_practice_at).getTime() > INACTIVE_DAYS * 86400e3)
        .map(l => ({ id: l.id, first_name: l.first_name, last_name: l.last_name, last_practice_at: l.last_practice_at }));

    return {
        company: await describe(db, org),
        learners: {
            active: active.length,
            total: learners.length,
            practised_30_days: active.filter(l => l.last_practice_at && new Date(l.last_practice_at).getTime() >= since30).length,
            invitations_pending: active.filter(l => l.invitation_pending).length,
        },
        activity: { attempts_30_days: recent.length, weeks },
        skills: perSkill,
        nclc_distribution: [4, 5, 6, 7, 8, 9, 10].map(n => ({ nclc: n, learners: active.filter(l => l.nclc === n).length })),
        inactive: inactive.slice(0, 20),
        inactive_count: inactive.length,
        inactive_days: INACTIVE_DAYS,
        top: active.filter(l => l.nclc != null).sort((a, b) => b.nclc - a.nclc).slice(0, 5)
            .map(l => ({ id: l.id, first_name: l.first_name, last_name: l.last_name, nclc: l.nclc })),
    };
}

/** Recent movements of the company's credits, with the people involved. */
async function creditTransactions(db, orgId, limit = 100) {
    return db.all(
        `SELECT t.id, t.credit_type, t.delta, t.reason, t.notes, t.created_at,
                t.learner_id, l.first_name AS learner_first_name, l.last_name AS learner_last_name,
                a.first_name AS actor_first_name, a.last_name AS actor_last_name, a.role AS actor_role
           FROM organization_credit_transactions t
           LEFT JOIN users l ON l.id = t.learner_id
           LEFT JOIN users a ON a.id = t.actor_id
          WHERE t.organization_id = $1
          ORDER BY t.created_at DESC, t.id DESC LIMIT $2`,
        [orgId, Math.min(Math.max(Number(limit) || 100, 1), 500)]
    );
}

async function auditOf(db, orgId, limit = 100) {
    return db.all(
        `SELECT a.id, a.action, a.details, a.created_at, u.first_name AS actor_first_name, u.last_name AS actor_last_name, u.role AS actor_role
           FROM organization_audit a LEFT JOIN users u ON u.id = a.actor_id
          WHERE a.organization_id = $1 ORDER BY a.created_at DESC, a.id DESC LIMIT $2`,
        [orgId, Math.min(Math.max(Number(limit) || 100, 1), 500)]
    );
}

module.exports = {
    INACTIVE_DAYS, IDLE_MINUTES,
    learnersOf, managersOf, groupsOf, countsOf, describe, contentOf, dashboardOf, creditTransactions, auditOf,
};
