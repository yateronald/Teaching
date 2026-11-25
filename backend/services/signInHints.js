/**
 * Email-first sign-in: after the email, the page shows the space the person is
 * about to enter (their company's logo, "Teacher space", …) before asking for
 * the password.
 *
 * What a stranger can learn from an email is kept to a minimum:
 *   - no name, no account detail — only a kind of space and, for company
 *     accounts, the company's public branding (already public on /o/<slug>);
 *   - an administrator's email and an unknown email give exactly the same
 *     answer ("platform"), so administrator accounts cannot be discovered;
 *   - one query, same shape of work whether the email exists or not;
 *   - the route is rate limited per address and per email (server.js).
 *
 * Unknown emails also get a simulated failure counter at sign-in, so the
 * "temporarily locked" answer after repeated wrong passwords does not reveal
 * that an account exists either.
 */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const orgs = require('./organizationService');
const { hasColumn } = require('./schemaFeatures');
const { normalizeBranding } = require('./organizationBranding');

/** The spaces a sign-in page can present. */
const AUDIENCES = ['platform', 'exam', 'student', 'teacher', 'company_learner', 'company_manager', 'org_mismatch'];
const SLUG_RE = /^[a-z0-9-]{1,80}$/i;

function publicBrand(org) {
    return {
        name: org.display_name || org.name,
        slug: org.slug,
        default_language: org.default_language,
        logo_url: org.logo_file_id ? `/api/public/org/${encodeURIComponent(org.slug)}/logo?v=${new Date(org.logo_updated_at || 0).getTime()}` : null,
        cover_url: org.cover_file_id ? `/api/public/org/${encodeURIComponent(org.slug)}/cover?v=${new Date(org.cover_updated_at || 0).getTime()}` : null,
        branding: normalizeBranding(org.portal_branding),
    };
}

/**
 * The space an email signs in to. `platform` for unknown emails and for
 * administrators (see above). A company account whose company is gone reads as
 * `platform` too.
 *
 * When `orgSlug` is provided (signing in from `/o/<slug>`), membership in that
 * specific organization is strictly enforced: any email not belonging to that
 * organization returns `{ audience: 'org_mismatch', org_member: false, org_name }`.
 */
async function presentationFor(db, email, options = {}) {
    const typedEmail = typeof options.typedEmail === 'string' && options.typedEmail.trim() ? options.typedEmail.trim() : email;
    const orgSlug = typeof options.orgSlug === 'string' ? options.orgSlug.trim() : '';
    const companies = await orgs.ready(db).catch(() => false);
    const hasEmailKey = await hasColumn(db, 'users', 'email_key').catch(() => false);

    if (orgSlug && SLUG_RE.test(orgSlug) && companies) {
        const targetOrg = await db.get(
            `SELECT * FROM organizations WHERE lower(slug) = lower($1) LIMIT 1`,
            [orgSlug]
        );
        if (!targetOrg) return { audience: 'platform' };

        const row = hasEmailKey
            ? await db.get(
                `SELECT u.id, u.role, u.organization_id
                   FROM users u
                  WHERE u.email = $1 OR u.email_key = lfwn_email_key($2)
                  ORDER BY (u.email = $1) DESC, u.id LIMIT 1`,
                [email, typedEmail]
            )
            : await db.get(
                `SELECT u.id, u.role, u.organization_id
                   FROM users u
                  WHERE u.email = $1 LIMIT 1`,
                [email]
            );

        const isMember = !!row
            && Number(row.organization_id) === Number(targetOrg.id)
            && (row.role === 'candidate' || row.role === 'org_admin');

        if (isMember) {
            return {
                audience: row.role === 'org_admin' ? 'company_manager' : 'company_learner',
                company: publicBrand(targetOrg),
                org_member: true,
            };
        }
        return {
            audience: 'org_mismatch',
            org_member: false,
            org_name: targetOrg.display_name || targetOrg.name,
        };
    }

    const hasBranding = companies && await hasColumn(db, 'organizations', 'portal_branding').catch(() => false);
    const orgCols = hasBranding
        ? `o.id AS org_id, o.name, o.display_name, o.slug, o.default_language, o.logo_file_id, o.logo_updated_at, o.cover_file_id, o.cover_updated_at, o.portal_branding`
        : `o.id AS org_id, o.name, o.display_name, o.slug, o.default_language, o.logo_file_id, o.logo_updated_at`;
    const whereClause = hasEmailKey
        ? `(u.email = $1 OR u.email_key = lfwn_email_key($2)) ORDER BY (u.email = $1) DESC, u.id LIMIT 1`
        : `u.email = $1 LIMIT 1`;
    const params = hasEmailKey ? [email, typedEmail] : [email];
    const row = await db.get(
        companies
            ? `SELECT u.role, ${orgCols}
                 FROM users u LEFT JOIN organizations o ON o.id = u.organization_id
                WHERE ${whereClause}`
            : `SELECT u.role FROM users u WHERE ${whereClause}`,
        params
    );
    if (!row) return { audience: 'platform' };
    // Only what the company's public page (/o/<slug>) already shows.
    const company = () => publicBrand({
        name: row.name,
        display_name: row.display_name,
        slug: row.slug,
        default_language: row.default_language,
        logo_file_id: row.logo_file_id,
        logo_updated_at: row.logo_updated_at,
        cover_file_id: row.cover_file_id,
        cover_updated_at: row.cover_updated_at,
        portal_branding: row.portal_branding,
    });
    switch (row.role) {
        case 'org_admin': return row.org_id ? { audience: 'company_manager', company: company() } : { audience: 'platform' };
        case 'candidate': return row.org_id ? { audience: 'company_learner', company: company() } : { audience: 'exam' };
        case 'student': return { audience: 'student' };
        case 'teacher': return { audience: 'teacher' };
        default: return { audience: 'platform' }; // admin, and anything else
    }
}

// ── Simulated lockout for unknown emails ───────────────────────────────────
// Real accounts lock for 30 minutes after 5 wrong passwords. Without this, an
// email that never locks would be known not to exist.

const LOCK_AFTER = 5;
const LOCK_MS = 30 * 60 * 1000;
const FORGET_MS = 60 * 60 * 1000;
const MAX_TRACKED = 20000;
const ghosts = new Map(); // email → { attempts, lockUntil, at }

function ghostState(email) {
    const g = ghosts.get(email);
    if (!g) return null;
    if (Date.now() - g.at > FORGET_MS && (!g.lockUntil || g.lockUntil < Date.now())) { ghosts.delete(email); return null; }
    return g;
}

/** Is this unknown email "locked" right now? */
function ghostLock(email) {
    const g = ghostState(email);
    return g && g.lockUntil && g.lockUntil > Date.now() ? { until: new Date(g.lockUntil), attempts: g.attempts } : null;
}

/** Counts a wrong password for an unknown email, exactly like a real account. */
function ghostFailure(email) {
    const g = ghostState(email) || { attempts: 0, lockUntil: null, at: Date.now() };
    g.attempts += 1;
    g.at = Date.now();
    g.lockUntil = g.attempts >= LOCK_AFTER ? Date.now() + LOCK_MS : null;
    ghosts.delete(email);
    ghosts.set(email, g);
    if (ghosts.size > MAX_TRACKED) ghosts.delete(ghosts.keys().next().value); // oldest first
    return { attempts: g.attempts, lockUntil: g.lockUntil ? new Date(g.lockUntil) : null };
}

// A bcrypt hash of a random value, same cost as real passwords: checking an
// unknown email against it takes as long as checking a real password, so the
// response time does not tell known from unknown.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(18).toString('base64'), 10);

module.exports = { AUDIENCES, presentationFor, ghostLock, ghostFailure, DUMMY_HASH };
