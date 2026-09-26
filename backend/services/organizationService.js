/**
 * Companies (organizations) that prepare their own learners for the exam.
 *
 * A company has an access window, the exam content it may use and a reserve of
 * AI credits. Its managers (role org_admin) add learners (role candidate with
 * users.organization_id), open content to them and hand out credits — always
 * within what the administrator gave the company.
 *
 * Every rule that protects the company's limits is applied in ONE SQL statement
 * (the app shares a single pg client, so there are no multi-statement
 * transactions): the check and the change happen together, so two requests at
 * the same moment cannot both pass. The database adds its own guards on top
 * (credits never below zero, seat limit, assignment end date — migration 025).
 */
const { hasTable } = require('./schemaFeatures');

/** How many days before the end a company is warned. */
const EXPIRY_NOTICE_DAYS = 14;
const CREDIT_TYPES = ['ee', 'eo'];
const COLUMN = { ee: 'ee_credits', eo: 'eo_credits' };

const ready = (db) => hasTable(db, 'organizations');

/** A refusal the client may show as is. */
class OrgError extends Error {
    constructor(code, message, status = 400, extra = {}) {
        super(message);
        this.code = code;
        this.status = status;
        Object.assign(this, extra);
    }
}

/**
 * active       open: learners practise, managers assign and hand out credits
 * not_started  before the start date: read-only
 * expired      after the end date: read-only (sign-in and results still work)
 * suspended    turned off by the administrator: no account of the company may sign in
 */
function stateOf(org, now = Date.now()) {
    if (!org) return null;
    if (org.status === 'suspended') return 'suspended';
    if (new Date(org.access_starts_at).getTime() > now) return 'not_started';
    if (new Date(org.access_ends_at).getTime() <= now) return 'expired';
    return 'active';
}

const daysLeft = (org, now = Date.now()) =>
    Math.max(0, Math.ceil((new Date(org.access_ends_at).getTime() - now) / 86400e3));

/** What a signed-in manager or learner may know about their company. */
function brandOf(org) {
    if (!org) return null;
    const state = stateOf(org);
    return {
        id: Number(org.id),
        name: org.display_name || org.name,
        slug: org.slug,
        default_language: org.default_language,
        state,
        access_starts_at: org.access_starts_at,
        access_ends_at: org.access_ends_at,
        days_left: state === 'active' ? daysLeft(org) : 0,
        expiring_soon: state === 'active' && daysLeft(org) <= EXPIRY_NOTICE_DAYS,
        logo_url: org.logo_file_id ? `/api/public/org/${encodeURIComponent(org.slug)}/logo?v=${new Date(org.logo_updated_at || 0).getTime()}` : null,
    };
}

/** The company of a user, or null (also null before migration 025). */
async function orgOfUser(db, userId) {
    if (!(await ready(db))) return null;
    return db.get(
        `SELECT o.* FROM users u JOIN organizations o ON o.id = u.organization_id WHERE u.id = $1`,
        [userId]
    );
}

/** A company's writes are allowed only while it is open. */
function assertActive(org) {
    const state = stateOf(org);
    if (state === 'active') return;
    const messages = {
        expired: 'Your company’s access has expired. Contact the administrator to extend it.',
        not_started: 'Your company’s access has not started yet.',
        suspended: 'Your company’s account is disabled. Contact the administrator.',
    };
    throw new OrgError(`ORG_${state.toUpperCase()}`, messages[state], 403);
}

// ── Content hierarchy ──────────────────────────────────────────────────────
// Every piece of exam content, with the keys of itself and of everything above
// it ("eo_partie:55" → eo_month, eo_year, category). A permission given on a
// parent covers it.

const ANCESTOR_SQL = {
    category: `SELECT id, id AS category_id FROM tcf_categories WHERE id = ANY($1::int[])`,
    ce_series: `SELECT id, category_id FROM tcf_ce_series WHERE id = ANY($1::int[])`,
    co_series: `SELECT id, category_id FROM tcf_co_series WHERE id = ANY($1::int[])`,
    ee_year: `SELECT id, category_id FROM tcf_ee_years WHERE id = ANY($1::int[])`,
    eo_year: `SELECT id, category_id FROM tcf_eo_years WHERE id = ANY($1::int[])`,
    ee_month: `SELECT m.id, m.year_id, y.category_id FROM tcf_ee_months m JOIN tcf_ee_years y ON y.id = m.year_id WHERE m.id = ANY($1::int[])`,
    eo_month: `SELECT m.id, m.year_id, y.category_id FROM tcf_eo_months m JOIN tcf_eo_years y ON y.id = m.year_id WHERE m.id = ANY($1::int[])`,
    ee_combinaison: `SELECT c.id, c.month_id, m.year_id, y.category_id FROM tcf_ee_combinaisons c
                       JOIN tcf_ee_months m ON m.id = c.month_id JOIN tcf_ee_years y ON y.id = m.year_id WHERE c.id = ANY($1::int[])`,
    eo_partie: `SELECT p.id, p.month_id, m.year_id, y.category_id FROM tcf_eo_parties p
                  JOIN tcf_eo_months m ON m.id = p.month_id JOIN tcf_eo_years y ON y.id = m.year_id WHERE p.id = ANY($1::int[])`,
};
const CONTENT_TYPES = Object.keys(ANCESTOR_SQL);
const PREFIX = (type) => type.slice(0, 2); // ee / eo for the expression hierarchies

/** "type:id" → [its own key, then its parents' keys]. Missing content has no entry. */
async function ancestorKeys(db, items) {
    const byType = {};
    for (const it of items) {
        const id = Number(it.content_id);
        if (!ANCESTOR_SQL[it.content_type] || !Number.isInteger(id)) continue;
        (byType[it.content_type] ||= new Set()).add(id);
    }
    const out = new Map();
    for (const [type, ids] of Object.entries(byType)) {
        const rows = await db.all(ANCESTOR_SQL[type], [[...ids]]);
        for (const r of rows) {
            const keys = [`${type}:${r.id}`];
            if (r.month_id != null) keys.push(`${PREFIX(type)}_month:${r.month_id}`);
            if (r.year_id != null) keys.push(`${PREFIX(type)}_year:${r.year_id}`);
            if (type !== 'category') keys.push(`category:${r.category_id}`);
            out.set(`${type}:${r.id}`, keys);
        }
    }
    return out;
}

/** The content a company may use, as a set of "type:id" keys. */
async function entitlementKeys(db, orgId) {
    const rows = await db.all(
        `SELECT content_type, content_id FROM organization_content WHERE organization_id = $1`, [orgId]);
    return new Set(rows.map(r => `${r.content_type}:${r.content_id}`));
}

const covered = (keys, allowed) => !!keys && keys.some(k => allowed.has(k));

// ── Audit ──────────────────────────────────────────────────────────────────

async function audit(db, orgId, actorId, action, details = null) {
    try {
        await db.run(
            `INSERT INTO organization_audit (organization_id, actor_id, action, details) VALUES ($1, $2, $3, $4)`,
            [orgId, actorId || null, action, details ? JSON.stringify(details) : null]
        );
    } catch (err) {
        // The audit trail must never block the action it records.
        console.error('[organizations] audit failed:', err.message);
    }
}

// ── Credits ────────────────────────────────────────────────────────────────

const creditType = (type) => {
    if (!CREDIT_TYPES.includes(type)) throw new OrgError('BAD_CREDIT_TYPE', 'Choose written (ee) or spoken (eo) credits.');
    return type;
};
const positive = (n) => {
    const v = Number(n);
    if (!Number.isInteger(v) || v <= 0 || v > 100000) throw new OrgError('BAD_AMOUNT', 'The number of credits must be a whole number above zero.');
    return v;
};

/** Administrator: adds credits to the company's reserve (allowed in every state). */
async function grantReserve(db, orgId, type, amount, actorId, notes = null) {
    const col = COLUMN[creditType(type)];
    const n = positive(amount);
    const row = await db.get(
        `WITH upd AS (
            UPDATE organizations SET ${col} = ${col} + $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING id, ${col} AS reserve
         ), tx AS (
            INSERT INTO organization_credit_transactions (organization_id, credit_type, delta, reason, actor_id, notes)
            SELECT id, $3, $2, 'admin_grant', $4, $5 FROM upd RETURNING id
         )
         SELECT reserve FROM upd`,
        [orgId, n, type, actorId || null, notes]
    );
    if (!row) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
    return Number(row.reserve);
}

/** Administrator: takes credits back from the reserve — never more than it holds. */
async function revokeReserve(db, orgId, type, amount, actorId, notes = null) {
    const col = COLUMN[creditType(type)];
    const n = positive(amount);
    const row = await db.get(
        `WITH upd AS (
            UPDATE organizations SET ${col} = ${col} - $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND ${col} >= $2 RETURNING id, ${col} AS reserve
         ), tx AS (
            INSERT INTO organization_credit_transactions (organization_id, credit_type, delta, reason, actor_id, notes)
            SELECT id, $3, -$2::int, 'admin_revoke', $4, $5 FROM upd RETURNING id
         )
         SELECT (SELECT reserve FROM upd) AS reserve, (SELECT ${col} FROM organizations WHERE id = $1) AS available`,
        [orgId, n, type, actorId || null, notes]
    );
    if (row?.available == null) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
    if (row.reserve == null) {
        throw new OrgError('INSUFFICIENT_RESERVE',
            `The reserve holds ${row.available} credit${row.available === 1 ? '' : 's'}: take back at most that many (credits already handed to learners must be taken back from them first).`,
            409, { available: Number(row.available) });
    }
    return Number(row.reserve);
}

/**
 * Hands `amount` credits to each learner, from the company's reserve. All or
 * nothing: every learner must belong to the company and be active, the company
 * must be open, and the reserve must cover the total — otherwise nothing moves.
 * `requireOpen` is false for administrator corrections.
 */
async function distribute(db, orgId, learnerIds, type, amount, actorId, { requireOpen = true, notes = null } = {}) {
    const col = COLUMN[creditType(type)];
    const n = positive(amount);
    const ids = [...new Set((learnerIds || []).map(Number).filter(Number.isInteger))];
    if (!ids.length) throw new OrgError('NO_LEARNERS', 'Choose at least one learner.');
    const openClause = requireOpen
        ? `AND o.status = 'active' AND o.access_starts_at <= CURRENT_TIMESTAMP AND o.access_ends_at > CURRENT_TIMESTAMP`
        : '';
    const row = await db.get(
        `WITH wanted AS (SELECT DISTINCT unnest($2::int[]) AS id),
         valid AS (
            SELECT u.id FROM users u JOIN wanted w ON w.id = u.id
             WHERE u.organization_id = $1 AND u.role = 'candidate' AND u.is_active IS TRUE
         ),
         counts AS (SELECT (SELECT COUNT(*) FROM valid)::int AS n, (SELECT COUNT(*) FROM wanted)::int AS m),
         take AS (
            UPDATE organizations o SET ${col} = o.${col} - $3::int * (SELECT n FROM counts), updated_at = CURRENT_TIMESTAMP
             WHERE o.id = $1 ${openClause}
               AND (SELECT n FROM counts) = (SELECT m FROM counts)
               AND o.${col} >= $3::int * (SELECT n FROM counts)
            RETURNING o.id, o.${col} AS reserve
         ),
         give AS (
            INSERT INTO student_ai_credits (user_id, ee_credits, eo_credits)
            SELECT v.id, $4::int, $5::int FROM valid v WHERE EXISTS (SELECT 1 FROM take)
            ON CONFLICT (user_id) DO UPDATE
               SET ee_credits = student_ai_credits.ee_credits + EXCLUDED.ee_credits,
                   eo_credits = student_ai_credits.eo_credits + EXCLUDED.eo_credits,
                   updated_at = CURRENT_TIMESTAMP
            RETURNING user_id
         ),
         org_tx AS (
            INSERT INTO organization_credit_transactions (organization_id, credit_type, delta, reason, learner_id, actor_id, notes)
            SELECT $1, $6, -$3::int, 'distribute', v.id, $7, $8 FROM valid v WHERE EXISTS (SELECT 1 FROM take)
            RETURNING id
         ),
         learner_tx AS (
            INSERT INTO ai_credit_transactions (user_id, credit_type, delta, reason, actor_id, related_entity_type, related_entity_id, notes)
            SELECT v.id, $6, $3::int, 'org_grant', $7, 'organization', $1, $8 FROM valid v WHERE EXISTS (SELECT 1 FROM take)
            RETURNING id
         )
         SELECT (SELECT reserve FROM take) AS reserve, (SELECT COUNT(*) FROM give)::int AS given,
                (SELECT n FROM counts) AS valid, (SELECT m FROM counts) AS wanted,
                o.${col} AS available, o.status, o.access_starts_at, o.access_ends_at
           FROM organizations o WHERE o.id = $1`,
        [orgId, ids, n, type === 'ee' ? n : 0, type === 'eo' ? n : 0, type, actorId || null, notes]
    );
    if (!row) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
    if (row.reserve != null) return { given: row.given, each: n, reserve: Number(row.reserve) };

    // Nothing moved: say why.
    if (requireOpen) assertActive(row);
    if (row.valid !== row.wanted) {
        throw new OrgError('LEARNER_NOT_IN_COMPANY', 'Some of the chosen learners are not active learners of your company.', 400);
    }
    const needed = n * row.valid;
    throw new OrgError('INSUFFICIENT_RESERVE',
        `This needs ${needed} credits and the reserve holds ${row.available}: you are ${needed - row.available} short.`,
        409, { needed, available: Number(row.available) });
}

/**
 * Takes unused credits back from learners into the reserve: `amount` from each
 * (or everything they hold with 'all'), never more than a learner has.
 */
async function reclaim(db, orgId, learnerIds, type, amount, actorId, { requireOpen = true, reason = 'reclaim', notes = null } = {}) {
    const col = COLUMN[creditType(type)];
    const all = amount === 'all';
    const n = all ? 0 : positive(amount);
    const ids = [...new Set((learnerIds || []).map(Number).filter(Number.isInteger))];
    if (!ids.length) throw new OrgError('NO_LEARNERS', 'Choose at least one learner.');
    if (requireOpen) {
        const org = await db.get(`SELECT * FROM organizations WHERE id = $1`, [orgId]);
        if (!org) throw new OrgError('ORG_NOT_FOUND', 'Company not found.', 404);
        assertActive(org);
    }
    const row = await db.get(
        `WITH picked AS (
            SELECT s.user_id, LEAST(s.${col}, COALESCE($3::int, s.${col})) AS amount -- $3 null = everything
              FROM student_ai_credits s JOIN users u ON u.id = s.user_id
             WHERE s.user_id = ANY($2::int[]) AND u.organization_id = $1 AND u.role = 'candidate' AND s.${col} > 0
             FOR UPDATE OF s
         ),
         taken AS (
            UPDATE student_ai_credits s SET ${col} = s.${col} - p.amount, updated_at = CURRENT_TIMESTAMP
              FROM picked p WHERE s.user_id = p.user_id AND p.amount > 0
            RETURNING s.user_id, p.amount
         ),
         back AS (
            UPDATE organizations SET ${col} = ${col} + (SELECT COALESCE(SUM(amount), 0) FROM taken), updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 RETURNING ${col} AS reserve
         ),
         org_tx AS (
            INSERT INTO organization_credit_transactions (organization_id, credit_type, delta, reason, learner_id, actor_id, notes)
            SELECT $1, $4, t.amount, $5, t.user_id, $6, $7 FROM taken t RETURNING id
         ),
         learner_tx AS (
            INSERT INTO ai_credit_transactions (user_id, credit_type, delta, reason, actor_id, related_entity_type, related_entity_id, notes)
            SELECT t.user_id, $4, -t.amount, 'org_reclaim', $6, 'organization', $1, $7 FROM taken t RETURNING id
         )
         SELECT (SELECT COALESCE(SUM(amount), 0) FROM taken)::int AS returned, (SELECT reserve FROM back) AS reserve`,
        [orgId, ids, all ? null : n, type, reason, actorId || null, notes]
    );
    return { returned: row.returned, reserve: row.reserve == null ? null : Number(row.reserve) };
}

/** The reserve, what learners hold and what they spent — they always add up to what was granted. */
async function creditSummary(db, orgId) {
    const row = await db.get(
        `SELECT o.ee_credits AS ee_reserve, o.eo_credits AS eo_reserve,
                COALESCE((SELECT SUM(s.ee_credits) FROM student_ai_credits s JOIN users u ON u.id = s.user_id WHERE u.organization_id = o.id AND u.role = 'candidate'), 0)::int AS ee_with_learners,
                COALESCE((SELECT SUM(s.eo_credits) FROM student_ai_credits s JOIN users u ON u.id = s.user_id WHERE u.organization_id = o.id AND u.role = 'candidate'), 0)::int AS eo_with_learners,
                COALESCE((SELECT SUM(delta) FROM organization_credit_transactions t WHERE t.organization_id = o.id AND t.credit_type = 'ee' AND t.reason IN ('admin_grant', 'admin_revoke')), 0)::int AS ee_granted,
                COALESCE((SELECT SUM(delta) FROM organization_credit_transactions t WHERE t.organization_id = o.id AND t.credit_type = 'eo' AND t.reason IN ('admin_grant', 'admin_revoke')), 0)::int AS eo_granted,
                COALESCE((SELECT -SUM(a.delta) FROM ai_credit_transactions a JOIN users u ON u.id = a.user_id
                           WHERE u.organization_id = o.id AND a.credit_type = 'ee' AND a.reason = 'ee_attempt'), 0)::int AS ee_used,
                COALESCE((SELECT -SUM(a.delta) FROM ai_credit_transactions a JOIN users u ON u.id = a.user_id
                           WHERE u.organization_id = o.id AND a.credit_type = 'eo' AND a.reason = 'eo_attempt'), 0)::int AS eo_used
           FROM organizations o WHERE o.id = $1`,
        [orgId]
    );
    if (!row) return null;
    const pack = (t) => ({
        reserve: Number(row[`${t}_reserve`]),
        with_learners: row[`${t}_with_learners`],
        used: row[`${t}_used`],
        granted: row[`${t}_granted`],
    });
    return { ee: pack('ee'), eo: pack('eo') };
}

// ── Slugs ──────────────────────────────────────────────────────────────────

/** "Société Générale & Co" → "societe-generale-co". */
function slugify(name) {
    return String(name || '')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'company';
}

/** A free slug derived from the name ("acme", "acme-2", …). */
async function freeSlug(db, name, exceptId = null) {
    const base = slugify(name);
    for (let i = 1; i < 200; i += 1) {
        const candidate = i === 1 ? base : `${base}-${i}`;
        const taken = await db.get(
            `SELECT id FROM organizations WHERE lower(slug) = $1 ${exceptId ? 'AND id <> $2' : ''}`,
            exceptId ? [candidate, exceptId] : [candidate]
        );
        if (!taken) return candidate;
    }
    return `${base}-${Date.now().toString(36)}`;
}

/** Postgres errors raised by the migration's own rules, as refusals. */
function fromDbError(err) {
    const msg = String(err?.message || '');
    if (msg.includes('SEAT_LIMIT_REACHED')) {
        return new OrgError('SEAT_LIMIT_REACHED', 'Your company’s package is full: every learner account it includes has been created. Contact the administrator to add more.', 409);
    }
    if (msg.includes('ORG_ASSIGNMENT_AFTER_END')) {
        return new OrgError('AFTER_COMPANY_END', 'An assignment cannot end after your company’s access ends.', 400);
    }
    if (err?.code === '23505' && /email/i.test(err.constraint || msg)) {
        return new OrgError('EMAIL_TAKEN', 'An account already uses this email address.', 409);
    }
    if (err?.code === '23505' && /username/i.test(err.constraint || msg)) {
        return new OrgError('USERNAME_TAKEN', 'An account already uses this username.', 409);
    }
    if (err?.code === '23514' && /not_negative|credits/i.test(err.constraint || msg)) {
        return new OrgError('INSUFFICIENT_CREDITS', 'Not enough credits.', 409);
    }
    return null;
}

/** Sends an OrgError (or a known database refusal) to the client; anything else is a 500. */
function sendError(res, err, where) {
    const known = err instanceof OrgError ? err : fromDbError(err);
    if (known) {
        const { code, message, status, ...extra } = known;
        return res.status(known.status || 400).json({ error: known.message, code: known.code, ...extra });
    }
    console.error(`${where} error:`, err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

module.exports = {
    EXPIRY_NOTICE_DAYS,
    CREDIT_TYPES,
    CONTENT_TYPES,
    OrgError,
    ready,
    stateOf,
    daysLeft,
    brandOf,
    orgOfUser,
    assertActive,
    ancestorKeys,
    entitlementKeys,
    covered,
    audit,
    grantReserve,
    revokeReserve,
    distribute,
    reclaim,
    creditSummary,
    slugify,
    freeSlug,
    fromDbError,
    sendError,
};
