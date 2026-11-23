/**
 * Signed-in sessions of the public website (the courses), kept apart from the
 * student portal's.
 *
 *  - The token lives in a cookie the page's scripts cannot read (HttpOnly,
 *    Secure, SameSite=Lax, host-only on the API): an injected script cannot
 *    steal it, and other sites cannot use it.
 *  - Its audience is the website: the portal refuses it (middleware/auth.js),
 *    and the website refuses portal tokens.
 *  - Every token is tied to a row of user_sessions (door = 'website'), so it
 *    can be ended from "My account", by an administrator, or by a password
 *    change, and it stops working at once.
 *  - Requests that change something must come from the website itself
 *    (Origin checked) and send JSON, which a form on another site cannot.
 */
const jwt = require('jsonwebtoken');
const sessions = require('./sessionService');
const { accessFor, publicAccess } = require('./learnAccess');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const IS_PROD = process.env.NODE_ENV === 'production';
const AUDIENCE = 'lfwn-site';
/** Long enough that sessionService never ends a website session for idleness (> 30 days). */
const SESSION_DAYS = Math.max(31, Number(process.env.SITE_SESSION_DAYS) || 60);
/** Devices signed in on the website at once; a further sign-in ends the oldest. Staff are not capped. */
const DEVICE_CAP = Math.max(1, Number(process.env.SITE_MAX_DEVICES) || 3);

// "__Host-" cookies are only accepted over HTTPS, for the exact host, on every
// path: the browser itself guarantees no other sub-domain can set or read them.
const name = (base) => (IS_PROD ? `__Host-${base}` : base);
const COOKIE = name('lfwn_site');

function parseCookies(req) {
    const out = {};
    const header = req.headers.cookie;
    if (!header) return out;
    for (const part of header.split(';')) {
        const i = part.indexOf('=');
        if (i < 0) continue;
        const k = part.slice(0, i).trim();
        if (!k || k in out) continue;
        try { out[k] = decodeURIComponent(part.slice(i + 1).trim()); } catch { /* malformed: ignored */ }
    }
    return out;
}

function setCookie(res, cookieName, value, maxAgeSeconds) {
    const parts = [`${cookieName}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`];
    if (IS_PROD) parts.push('Secure');
    res.append('Set-Cookie', parts.join('; '));
}
const clearCookie = (res, cookieName) => setCookie(res, cookieName, '', 0);

const VISITOR = { website: false, level: 'visitor', staff: false, premium: null, reason: 'visitor' };

/** The account fields the website needs (never the password hash). */
const USER_FIELDS = `id, username, email, role, first_name, last_name, is_active, account_locked_until, organization_id,
    learn_access, email_verified_at, google_sub IS NOT NULL AS google_linked, has_password, country, preferred_lang,
    marketing_opt_in, signup_source, created_at`;

/** Opens a website session for this account and sets its cookie. */
async function openSiteSession(db, req, res, user) {
    // Over the device cap: the oldest website sessions make room.
    if (!['admin', 'teacher'].includes(user.role)) {
        const live = await db.all(
            `SELECT id FROM user_sessions
              WHERE user_id = $1 AND door = 'website' AND ended_at IS NULL AND expires_at > LOCALTIMESTAMP
              ORDER BY last_seen_at DESC`, [user.id]);
        const extra = live.slice(DEVICE_CAP - 1).map(r => r.id);
        if (extra.length) await sessions.endSessions(db, extra, 'takeover');
    }
    const jti = sessions.newId();
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
    await db.run(
        `INSERT INTO user_sessions (user_id, jti, expires_at, device, ip, door) VALUES ($1, $2, $3, $4, $5, 'website')`,
        [user.id, jti, expiresAt, sessions.deviceOf(req).slice(0, 120),
            String(req.ip || '').replace('::ffff:', '').slice(0, 45) || null]);
    const token = jwt.sign({ id: user.id, role: user.role, jti }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d`, audience: AUDIENCE });
    setCookie(res, COOKIE, token, SESSION_DAYS * 24 * 60 * 60);
}

/** Ends this request's website session (if any) and clears its cookie. */
async function closeSiteSession(db, req, res, reason = 'logout') {
    if (req.siteSession) {
        await sessions.endSessions(db, [req.siteSession.id], reason).catch(() => 0);
    } else {
        const token = parseCookies(req)[COOKIE];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET, { audience: AUDIENCE });
                if (decoded?.jti && decoded?.id) {
                    await db.run(
                        `UPDATE user_sessions SET ended_at = CURRENT_TIMESTAMP, ended_reason = $3
                          WHERE jti = $1 AND user_id = $2 AND door = 'website' AND ended_at IS NULL`,
                        [decoded.jti, decoded.id, reason],
                    ).catch(() => 0);
                }
            } catch { /* invalid or expired cookie: just clear it */ }
        }
    }
    clearCookie(res, COOKIE);
}

/** Ends every website session of a user (optionally sparing one). */
async function endWebsiteSessions(db, userId, reason, keepId = null) {
    const rows = await db.all(
        `UPDATE user_sessions SET ended_at = CURRENT_TIMESTAMP, ended_reason = $2
          WHERE user_id = $1 AND door = 'website' AND ended_at IS NULL AND ($3::int IS NULL OR id <> $3::int)
          RETURNING id`, [userId, reason, keepId]);
    return rows.length;
}

/**
 * Reads the website session. Sets req.siteUser, req.siteAccess and
 * req.siteSession; a visitor gets req.siteUser = null. With required: true, a
 * visitor is refused (401).
 */
function siteAuth({ required = false } = {}) {
    return async (req, res, next) => {
        req.siteUser = null;
        req.siteAccess = VISITOR;
        req.siteSession = null;
        const refuse = (code = 'SIGNED_OUT') => {
            if (!required) return next();
            return res.status(401).json({ error: 'Please sign in.', code });
        };
        const token = parseCookies(req)[COOKIE];
        if (!token) return refuse();
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET, { audience: AUDIENCE });
        } catch {
            clearCookie(res, COOKIE);
            return refuse('SESSION_ENDED');
        }
        try {
            const session = await req.db.get(
                `SELECT id, user_id, last_seen_at FROM user_sessions
                  WHERE jti = $1 AND door = 'website' AND ended_at IS NULL AND expires_at > LOCALTIMESTAMP`,
                [decoded.jti]);
            const user = session && Number(session.user_id) === Number(decoded.id)
                ? await req.db.get(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [decoded.id])
                : null;
            const locked = user?.account_locked_until && new Date(user.account_locked_until) > new Date();
            let orgOk = true;
            if (user?.organization_id) {
                const org = await req.db.get('SELECT status FROM organizations WHERE id = $1', [user.organization_id]);
                orgOk = !!org && org.status !== 'suspended';
            }
            if (!user || !user.is_active || locked || !orgOk) {
                if (session) await sessions.endSessions(req.db, [session.id], 'admin').catch(() => 0);
                clearCookie(res, COOKIE);
                return refuse('SESSION_ENDED');
            }
            const access = await accessFor(req.db, user);
            if (!access.website) {
                // The administrator turned the website off for this account.
                await sessions.endSessions(req.db, [session.id], 'admin').catch(() => 0);
                clearCookie(res, COOKIE);
                return refuse('WEBSITE_ACCESS_OFF');
            }
            await sessions.touch(req.db, session);
            req.siteUser = user;
            req.siteAccess = access;
            req.siteSession = session;
            return next();
        } catch (err) {
            console.error('[site-session] check failed:', err.message);
            return res.status(503).json({ error: 'Please try again in a moment.', code: 'UNAVAILABLE' });
        }
    };
}

// The website's own addresses (and any sub-domain), extra ones from
// ALLOWED_ORIGINS, and local development addresses outside production.
const PROD_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*learnfrenchwithnatives\.com$/i;
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
function isSiteOrigin(origin) {
    if (!origin) return false;
    const extra = String(process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (extra.includes(origin) || PROD_ORIGIN.test(origin)) return true;
    return !IS_PROD && LOCAL_ORIGIN.test(origin);
}

/** Changes must come from the website, as JSON (no form or image on another site can send that). */
function siteWriteGuard(req, res, next) {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
    if (!isSiteOrigin(req.headers.origin)) return res.status(403).json({ error: 'Request refused.', code: 'BAD_ORIGIN' });
    if (!req.is('application/json')) return res.status(415).json({ error: 'Request refused.', code: 'BAD_CONTENT_TYPE' });
    return next();
}

/** The signed-in account as the website may see it. */
function publicUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name || '',
        email: user.email,
        role: user.role,
        country: user.country || null,
        lang: user.preferred_lang || null,
        marketing_opt_in: !!user.marketing_opt_in,
        email_verified: !!user.email_verified_at || user.signup_source == null,
        google_linked: !!user.google_linked,
        has_password: user.has_password !== false,
        portal: user.role !== 'learner',
        created_at: user.created_at,
    };
}

/** Short-lived signed values kept in a cookie between two steps (Google sign-in). */
function setFlowCookie(res, base, payload, minutes) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: `${minutes}m`, audience: `lfwn-flow-${base}` });
    setCookie(res, name(base), token, minutes * 60);
}
function readFlowCookie(req, base) {
    const token = parseCookies(req)[name(base)];
    if (!token) return null;
    try { return jwt.verify(token, JWT_SECRET, { audience: `lfwn-flow-${base}` }); } catch { return null; }
}
const clearFlowCookie = (res, base) => clearCookie(res, name(base));

module.exports = {
    COOKIE, SESSION_DAYS, USER_FIELDS, VISITOR,
    siteAuth, siteWriteGuard, isSiteOrigin, openSiteSession, closeSiteSession, endWebsiteSessions,
    publicUser, publicAccess, parseCookies, setFlowCookie, readFlowCookie, clearFlowCookie,
};
