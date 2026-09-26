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

// ── History (administrator's audit trail of a company) ─────────────────────

/**
 * What each filter shows. The creation entry opens the access, credit and
 * package histories (it holds their starting values). Older entries wrote a
 * package change as "company_updated" with a seat_limit change: still found.
 */
const HISTORY_CATEGORIES = {
    access: ['company_created', 'dates_changed', 'expiry_notice_sent'],
    credits: ['company_created', 'credits_granted', 'credits_revoked'],
    handouts: ['credits_distributed', 'credits_reclaimed'],
    package: ['company_created', 'package_changed'],
    status: ['company_suspended', 'company_reactivated'],
    exams: ['content_changed'],
    people: ['manager_added', 'learner_added', 'account_deactivated', 'account_reactivated', 'invitation_resent', 'learner_updated', 'account_updated'],
    activity: ['group_created', 'group_updated', 'group_deleted', 'assigned', 'assignment_removed'],
    profile: ['company_created', 'company_updated', 'logo_changed', 'logo_removed', 'settings_changed'],
};

/** The filter an entry belongs to (for its icon and colour). */
function categoryOf(action, details) {
    if (action === 'company_created') return 'created';
    if (action === 'company_updated' && details && details.seat_limit) return 'package';
    for (const [cat, actions] of Object.entries(HISTORY_CATEGORIES)) if (actions.includes(action)) return cat;
    return 'other';
}

const dayMs = 86400000;
const daysBetween = (a, b) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / dayMs);

/**
 * One page of the trail, newest first. Filters: category, from/to (dates,
 * inclusive), q (free text in the entry), before (id cursor for "load more").
 */
async function companyHistory(db, orgId, { category = null, from = null, to = null, q = null, before = null, limit = 50 } = {}) {
    const where = ['a.organization_id = $1'];
    const params = [orgId];
    /** Adds a condition with one value ("?" becomes its $n). */
    const add = (sql, v) => { params.push(v); where.push(sql.replace('?', `$${params.length}`)); };
    if (category && HISTORY_CATEGORIES[category]) {
        params.push(HISTORY_CATEGORIES[category]);
        const inList = `a.action = ANY($${params.length}::text[])`;
        where.push(category === 'package' ? `(${inList} OR (a.action = 'company_updated' AND a.details ? 'seat_limit'))` : inList);
    }
    const fromDate = from && !Number.isNaN(new Date(from).getTime()) ? new Date(from) : null;
    const toDate = to && !Number.isNaN(new Date(to).getTime()) ? new Date(new Date(to).getTime() + dayMs) : null;
    if (fromDate) add('a.created_at >= ?', fromDate);
    if (toDate) add('a.created_at < ?', toDate);
    const text = String(q || '').trim().slice(0, 100);
    if (text) {
        // Free text in the entry (an email, an invoice number, an exam name…), LIKE wildcards escaped.
        params.push(`%${text.replace(/[\\%_]/g, m => `\\${m}`)}%`);
        const i = params.length;
        where.push(`(a.action ILIKE $${i} ESCAPE '\\' OR a.details::text ILIKE $${i} ESCAPE '\\')`);
    }
    const cursor = Number(before);
    if (Number.isInteger(cursor) && cursor > 0) add('a.id < ?', cursor);
    const n = Math.min(Math.max(Number(limit) || 50, 1), 200);
    params.push(n + 1);
    const rows = await db.all(
        `SELECT a.id, a.action, a.details, a.created_at, a.actor_id,
                u.first_name AS actor_first_name, u.last_name AS actor_last_name, u.email AS actor_email, u.role AS actor_role
           FROM organization_audit a LEFT JOIN users u ON u.id = a.actor_id
          WHERE ${where.join(' AND ')}
          ORDER BY a.id DESC
          LIMIT $${params.length}`,
        params
    );
    const more = rows.length > n;
    const items = rows.slice(0, n).map((r) => {
        const { _by: by, ...details } = r.details || {};
        const name = by?.name || [r.actor_first_name, r.actor_last_name].filter(Boolean).join(' ') || null;
        return {
            id: Number(r.id),
            action: r.action,
            category: categoryOf(r.action, details),
            details,
            created_at: r.created_at,
            // Who, as they were when they acted (kept even if the account is later renamed or deleted).
            actor: r.actor_id || by ? { name, email: by?.email || r.actor_email || null, role: by?.role || r.actor_role || null } : null,
        };
    });
    return { items, next_before: more ? items[items.length - 1].id : null };
}

/**
 * The figures an administrator checks first: how the access dates, the
 * credits, the package and the status moved since the company was created.
 */
async function companyHistorySummary(db, org) {
    const rows = await db.all(
        `SELECT action, details, created_at FROM organization_audit
          WHERE organization_id = $1
            AND (action IN ('company_created', 'dates_changed', 'package_changed', 'company_suspended', 'company_reactivated', 'credits_granted', 'credits_revoked')
                 OR (action = 'company_updated' AND details ? 'seat_limit'))
          ORDER BY id`,
        [org.id]
    );
    const created = rows.find(r => r.action === 'company_created');
    const endMoves = rows.filter(r => r.action === 'dates_changed' && r.details?.access_ends_at);
    const extensions = endMoves.filter(r => new Date(r.details.access_ends_at.to) > new Date(r.details.access_ends_at.from));
    const lastEnd = endMoves[endMoves.length - 1];
    // Changes only (the creation holds the starting package, not a change).
    const seatMoves = rows.filter(r => r.action !== 'company_created' && r.details?.seat_limit?.from !== undefined);
    const suspensions = rows.filter(r => r.action === 'company_suspended');
    const lastStatus = rows.filter(r => r.action === 'company_suspended' || r.action === 'company_reactivated').pop();

    const tx = await db.get(
        `SELECT COALESCE(SUM(delta) FILTER (WHERE reason = 'admin_grant' AND credit_type = 'ee'), 0)::int AS ee_granted,
                COALESCE(SUM(delta) FILTER (WHERE reason = 'admin_grant' AND credit_type = 'eo'), 0)::int AS eo_granted,
                COALESCE(-SUM(delta) FILTER (WHERE reason = 'admin_revoke' AND credit_type = 'ee'), 0)::int AS ee_revoked,
                COALESCE(-SUM(delta) FILTER (WHERE reason = 'admin_revoke' AND credit_type = 'eo'), 0)::int AS eo_revoked,
                MAX(created_at) FILTER (WHERE reason IN ('admin_grant', 'admin_revoke')) AS last_at
           FROM organization_credit_transactions WHERE organization_id = $1`,
        [org.id]
    );
    const by = (r) => r?.details?._by || null;
    return {
        access: {
            starts_at: org.access_starts_at,
            original_end: created?.details?.access_ends_at || endMoves[0]?.details.access_ends_at.from || org.access_ends_at,
            current_end: org.access_ends_at,
            extensions: extensions.length,
            shortenings: endMoves.length - extensions.length,
            days_added: extensions.reduce((t, r) => t + daysBetween(r.details.access_ends_at.from, r.details.access_ends_at.to), 0),
            last_change: lastEnd ? { at: lastEnd.created_at, from: lastEnd.details.access_ends_at.from, to: lastEnd.details.access_ends_at.to, by: by(lastEnd), note: lastEnd.details.note || null } : null,
        },
        credits: {
            granted: { ee: tx.ee_granted, eo: tx.eo_granted },
            revoked: { ee: tx.ee_revoked, eo: tx.eo_revoked },
            reserve: { ee: org.ee_credits, eo: org.eo_credits },
            // Each addition or withdrawal by an administrator (the initial credits are part of the creation).
            movements: rows.filter(r => r.action === 'credits_granted' || r.action === 'credits_revoked').length,
            last_at: tx.last_at,
        },
        package: {
            original: created?.details?.seat_limit ?? seatMoves[0]?.details.seat_limit.from ?? org.seat_limit,
            current: org.seat_limit,
            changes: seatMoves.length,
        },
        status: {
            current: org.status,
            suspensions: suspensions.length,
            last_change: lastStatus ? { at: lastStatus.created_at, action: lastStatus.action, by: by(lastStatus) } : null,
        },
        created_at: org.created_at,
        created_by: by(created),
    };
}

module.exports = {
    INACTIVE_DAYS, IDLE_MINUTES,
    learnersOf, managersOf, groupsOf, countsOf, describe, contentOf, dashboardOf, creditTransactions, auditOf,
    HISTORY_CATEGORIES, companyHistory, companyHistorySummary,
};
