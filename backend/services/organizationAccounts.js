/**
 * Accounts of a company: its managers (org_admin) and its learners (candidate).
 *
 * A company account is created with a temporary password that is only ever
 * emailed (never returned to anyone), and must be changed at first sign-in.
 * An email already used anywhere on the platform is refused: a company cannot
 * take over an existing account.
 */
const { hashPassword } = require('../middleware/auth');
const sessions = require('./sessionService');
const { generateTempPassword } = require('./tempPassword');
const { sendCompanyInvite } = require('../emails/emailService');
const { OrgError, fromDbError, reclaim, audit } = require('./organizationService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX = 50;

/** A person's name and email, cleaned and checked. */
function readPerson(body = {}) {
    const first = String(body.first_name ?? '').trim().replace(/\s+/g, ' ');
    const last = String(body.last_name ?? '').trim().replace(/\s+/g, ' ');
    const email = String(body.email ?? '').trim().toLowerCase();
    if (!first || !last) throw new OrgError('NAME_REQUIRED', 'First name and last name are required.');
    if (first.length > NAME_MAX || last.length > NAME_MAX) throw new OrgError('NAME_TOO_LONG', `Names are limited to ${NAME_MAX} characters.`);
    if (!EMAIL_RE.test(email) || email.length > 100) throw new OrgError('BAD_EMAIL', 'Enter a valid email address.');
    return { first_name: first, last_name: last, email };
}

/** A free username derived from the email ("awa.diop", "awa.diop2", …). */
async function freeUsername(db, email) {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]+/g, '').slice(0, 40) || 'user';
    const padded = base.length >= 3 ? base : `${base}user`;
    for (let i = 1; i < 500; i += 1) {
        const name = i === 1 ? padded : `${padded}${i}`;
        if (!(await db.get('SELECT 1 AS x FROM users WHERE lower(username) = $1', [name]))) return name;
    }
    return `${padded}${Date.now().toString(36)}`;
}

/** Sends the invitation; a failed email never undoes the account (it can be sent again). */
async function invite(org, user, tempPassword) {
    try {
        await sendCompanyInvite({
            to: user.email,
            kind: user.role === 'org_admin' ? 'manager' : 'learner',
            name: `${user.first_name} ${user.last_name}`,
            tempPassword,
            org,
        });
        return true;
    } catch (err) {
        console.error('[organizations] invitation email failed for user', user.id, err && err.message);
        return false;
    }
}

/**
 * Creates a manager or a learner of `org`. The package (every learner account
 * counts, active or not) is enforced by the database itself (migration 025), so
 * two additions at the same moment cannot exceed it.
 */
async function createAccount(db, org, role, body, actorId) {
    if (!['org_admin', 'candidate'].includes(role)) throw new OrgError('BAD_ROLE', 'Invalid account type.');
    const person = readPerson(body);
    if (await db.get('SELECT 1 AS x FROM users WHERE lower(email) = $1', [person.email])) {
        throw new OrgError('EMAIL_TAKEN', 'An account already uses this email address. Ask the administrator if this person should join your company.', 409);
    }
    const username = await freeUsername(db, person.email);
    const tempPassword = generateTempPassword(10);
    const passwordHash = await hashPassword(tempPassword);
    let row;
    try {
        row = await db.get(
            `INSERT INTO users (username, email, password_hash, role, first_name, last_name, must_change_password,
                                password_expires_at, is_active, failed_login_attempts, organization_id)
             VALUES ($1, $2, $3, $4, $5, $6, 1, NOW() + INTERVAL '90 days', true, 0, $7)
             RETURNING id, username, email, role, first_name, last_name, is_active, created_at`,
            [username, person.email, passwordHash, role, person.first_name, person.last_name, org.id]
        );
    } catch (err) {
        throw fromDbError(err) || err;
    }
    const emailed = await invite(org, row, tempPassword);
    await audit(db, org.id, actorId, role === 'org_admin' ? 'manager_added' : 'learner_added', { user_id: row.id, email: row.email });
    return { ...row, invitation_sent: emailed };
}

/**
 * A new temporary password, emailed again (lost invitation, forgotten
 * password): every open session of the account ends.
 */
async function resendInvite(db, org, userId, actorId) {
    const user = await db.get(
        `SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1 AND organization_id = $2`,
        [userId, org.id]
    );
    if (!user) throw new OrgError('NOT_FOUND', 'Account not found in this company.', 404);
    if (!user.is_active) throw new OrgError('INACTIVE', 'Reactivate this account before sending a new invitation.', 409);
    const tempPassword = generateTempPassword(10);
    await db.run(
        `UPDATE users SET password_hash = $1, must_change_password = 1, password_expires_at = NOW() + INTERVAL '90 days',
                failed_login_attempts = 0, account_locked_until = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND organization_id = $3`,
        [await hashPassword(tempPassword), user.id, org.id]
    );
    await sessions.endAllForUser(db, user.id, 'password').catch(() => 0);
    const emailed = await invite(org, user, tempPassword);
    await audit(db, org.id, actorId, 'invitation_resent', { user_id: user.id });
    return { invitation_sent: emailed };
}

/**
 * Turns an account of the company off or back on. Off: its sessions end at
 * once and, for a learner, unused credits return to the company's reserve.
 * Either way the account keeps its place in the package.
 */
async function setActive(db, org, userId, active, actorId, { role = null } = {}) {
    const user = await db.get(
        `SELECT id, role, is_active FROM users WHERE id = $1 AND organization_id = $2 ${role ? 'AND role = $3' : ''}`,
        role ? [userId, org.id, role] : [userId, org.id]
    );
    if (!user) throw new OrgError('NOT_FOUND', 'Account not found in this company.', 404);
    if (!!user.is_active === !!active) return { changed: false };
    try {
        await db.run(`UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND organization_id = $3`,
            [!!active, user.id, org.id]);
    } catch (err) {
        throw fromDbError(err) || err;
    }
    let returned = { ee: 0, eo: 0 };
    if (!active) {
        await sessions.endAllForUser(db, user.id, 'admin').catch(() => 0);
        if (user.role === 'candidate') {
            for (const type of ['ee', 'eo']) {
                const r = await reclaim(db, org.id, [user.id], type, 'all', actorId, { requireOpen: false, reason: 'learner_left' });
                returned[type] = r.returned;
            }
        }
    }
    await audit(db, org.id, actorId, active ? 'account_reactivated' : 'account_deactivated', { user_id: user.id, credits_returned: returned });
    return { changed: true, credits_returned: returned };
}

module.exports = { readPerson, createAccount, resendInvite, setActive };
