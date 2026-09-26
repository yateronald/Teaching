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

/** The spaces a sign-in page can present. */
const AUDIENCES = ['platform', 'exam', 'student', 'teacher', 'company_learner', 'company_manager'];

/**
 * The space an email signs in to. `platform` for unknown emails and for
 * administrators (see above). A company account whose company is gone reads as
 * `platform` too.
 */
async function presentationFor(db, email) {
    const companies = await orgs.ready(db).catch(() => false);
    const row = await db.get(
        companies
            ? `SELECT u.role, o.id AS org_id, o.name, o.display_name, o.slug, o.default_language, o.logo_file_id, o.logo_updated_at
                 FROM users u LEFT JOIN organizations o ON o.id = u.organization_id
                WHERE u.email = $1 LIMIT 1`
            : `SELECT u.role FROM users u WHERE u.email = $1 LIMIT 1`,
        [email]
    );
    if (!row) return { audience: 'platform' };
    // Only what the company's public page (/o/<slug>) already shows.
    const company = () => ({
        name: row.display_name || row.name,
        slug: row.slug,
        default_language: row.default_language,
        logo_url: row.logo_file_id ? `/api/public/org/${encodeURIComponent(row.slug)}/logo?v=${new Date(row.logo_updated_at || 0).getTime()}` : null,
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
