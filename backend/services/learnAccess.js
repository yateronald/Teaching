/**
 * Who may use what on the website's courses.
 *
 *   visitor  no account: the first module of the A1 path only
 *   free     an account: the first module of every path
 *   premium  everything
 *
 * Learners (public sign-up) always have the website, at least free.
 * Students, company learners and company managers only when an administrator
 * enabled it: on their account (users.learn_access) or for their whole
 * company (organizations.learn_access). Teachers and administrators have
 * everything (staff).
 *
 * Premium is never a setting: it is an active license on the person or on
 * their company (learn_licenses), granted by an administrator today and by the
 * payment provider later. Every check reads the database, so a change takes
 * effect on the next request.
 */
const { hasTable } = require('./schemaFeatures');

const LEVELS = ['visitor', 'free', 'premium'];
const PLAN_TIERS = ['standard', 'premium'];
const rank = (level) => LEVELS.indexOf(level);
/** True when `level` reaches `needed` (visitor < free < premium). */
const reaches = (level, needed) => rank(level) >= rank(needed);

const STAFF = new Set(['admin', 'teacher']);
const PORTAL = new Set(['student', 'candidate', 'org_admin']);

/** The ready flag: migration 030 applied. */
const ready = (db) => hasTable(db, 'learn_licenses');

const ACTIVE = `revoked_at IS NULL AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())`;

/** The license that gives this person access right now (Premium before Standard, personal before company), or null. */
async function activePremium(db, user) {
    const row = await db.get(
        `SELECT id, user_id, organization_id, tier, source, starts_at, ends_at
           FROM learn_licenses
          WHERE ${ACTIVE} AND (user_id = $1 OR ($2::int IS NOT NULL AND organization_id = $2::int))
          ORDER BY (tier = 'premium') DESC, (user_id IS NOT NULL) DESC, ends_at DESC NULLS FIRST
          LIMIT 1`,
        [user.id, user.organization_id ?? null]);
    return row || null;
}

/**
 * What this account may do on the website.
 * { website: boolean, level: 'visitor'|'free'|'premium', plan: 'visitor'|'free'|'standard'|'premium', staff, premium: {until, via, tier}|null, reason }
 * `website` false means the account cannot sign in on the website at all.
 */
async function accessFor(db, user) {
    if (!user) return { website: false, level: 'visitor', plan: 'visitor', staff: false, premium: null, reason: 'visitor' };
    if (STAFF.has(user.role)) return { website: true, level: 'premium', plan: 'premium', staff: true, premium: { until: null, via: 'staff', tier: 'premium' }, reason: 'staff' };
    if (!(await ready(db))) return { website: false, level: 'visitor', plan: 'visitor', staff: false, premium: null, reason: 'not_ready' };

    const license = await activePremium(db, user);
    const tier = license ? (license.tier === 'standard' ? 'standard' : 'premium') : null;
    let until = license?.ends_at ?? null;
    if (license?.user_id && until) {
        // Paid periods follow one another: Premium extends with Premium; Standard extends with Standard/higher.
        const run = await db.get(
            `SELECT CASE WHEN bool_or(ends_at IS NULL) THEN NULL ELSE max(ends_at) END AS until
               FROM learn_licenses
              WHERE user_id = $1 AND revoked_at IS NULL AND (ends_at IS NULL OR ends_at > now())
                AND ($2::text <> 'premium' OR tier = 'premium')`,
            [user.id, tier]);
        until = run ? run.until : until;
    }
    const premium = license ? { until, via: license.user_id ? 'account' : 'company', source: license.source, tier } : null;

    if (user.role === 'learner') {
        return { website: true, level: premium ? 'premium' : 'free', plan: premium ? premium.tier : 'free', staff: false, premium, reason: premium ? premium.tier : 'learner' };
    }
    if (PORTAL.has(user.role)) {
        let orgAccess = 'off';
        if (user.organization_id) {
            const org = await db.get('SELECT learn_access FROM organizations WHERE id = $1', [user.organization_id]);
            orgAccess = org?.learn_access || 'off';
        }
        const enabled = user.learn_access === 'free' || orgAccess === 'free';
        if (premium) return { website: true, level: 'premium', plan: premium.tier, staff: false, premium, reason: premium.tier };
        if (enabled) return { website: true, level: 'free', plan: 'free', staff: false, premium: null, reason: user.learn_access === 'free' ? 'enabled' : 'company' };
        return { website: false, level: 'visitor', plan: 'visitor', staff: false, premium: null, reason: 'website_off' };
    }
    return { website: false, level: 'visitor', plan: 'visitor', staff: false, premium: null, reason: 'role' };
}

/** Records a change of access in the history (never fails the change itself). */
async function logAccess(db, { userId = null, organizationId = null, actorId = null, action, detail = null }) {
    try {
        await db.run(
            'INSERT INTO learn_access_log (user_id, organization_id, actor_id, action, detail) VALUES ($1, $2, $3, $4, $5)',
            [userId, organizationId, actorId, action, detail ? JSON.stringify(detail) : null]);
    } catch (err) {
        console.error('[learn-access] history not written:', err.message);
    }
}

/**
 * Grants a Standard or Premium license. Ends any other active grant of the same source
 * on the same holder first, so a holder has one current manual/admin grant per source.
 */
async function grantPremium(db, { userId = null, organizationId = null, tier = 'premium', endsAt = null, reason = null, source = 'admin', externalRef = null, actorId = null }) {
    const cleanTier = tier === 'standard' ? 'standard' : 'premium';
    const holder = userId ? ['user_id', userId] : ['organization_id', organizationId];
    await db.run(
        `UPDATE learn_licenses SET revoked_at = now(), revoked_by = $2, revoke_reason = 'replaced'
          WHERE ${holder[0]} = $1 AND source = $3 AND revoked_at IS NULL`,
        [holder[1], actorId, source]);
    const row = await db.get(
        `INSERT INTO learn_licenses (user_id, organization_id, tier, source, ends_at, reason, external_ref, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, tier, starts_at, ends_at`,
        [userId, organizationId, cleanTier, source, endsAt, reason, externalRef, actorId]);
    await logAccess(db, { userId, organizationId, actorId, action: 'premium_granted', detail: { license: row.id, tier: cleanTier, ends_at: endsAt, source, reason } });
    if (userId) {
        await db.run(
            "UPDATE learn_premium_requests SET status = 'done', handled_at = now(), handled_by = $2 WHERE user_id = $1 AND status = 'open'",
            [userId, actorId]);
    }
    return row;
}

/** Ends the holder's active grants of a source (all sources when source is null). Says how many. */
async function revokePremium(db, { userId = null, organizationId = null, source = 'admin', reason = null, actorId = null }) {
    const holder = userId ? ['user_id', userId] : ['organization_id', organizationId];
    const rows = await db.all(
        `UPDATE learn_licenses SET revoked_at = now(), revoked_by = $2, revoke_reason = $4
          WHERE ${holder[0]} = $1 AND revoked_at IS NULL AND ($3::text IS NULL OR source = $3::text)
          RETURNING id`,
        [holder[1], actorId, source, reason]);
    if (rows.length) await logAccess(db, { userId, organizationId, actorId, action: 'premium_revoked', detail: { licenses: rows.map(r => r.id), source, reason } });
    return rows.length;
}

/** Public view of an access, for the website. */
const publicAccess = (a) => ({
    level: a.level,
    plan: a.plan || (a.level === 'premium' ? (a.premium?.tier || 'premium') : a.level),
    website: a.website,
    staff: !!a.staff,
    premium: a.premium ? { until: a.premium.until || null, via: a.premium.via, tier: a.premium.tier || 'premium' } : null,
});

module.exports = { LEVELS, PLAN_TIERS, reaches, ready, accessFor, activePremium, grantPremium, revokePremium, logAccess, publicAccess, STAFF, PORTAL };
