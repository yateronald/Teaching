/**
 * Signed-in devices.
 *
 * Every sign-in opens a session row keyed by the token's id (jti) — the token
 * itself is never stored. Each request checks that its session is still open,
 * so a session can be ended from another device, by an administrator, or by a
 * password change, and the token stops working immediately.
 *
 * Exam candidates are capped at two devices at once: an account shared with
 * friends runs out of devices, and every takeover is recorded and visible.
 */
const crypto = require('crypto');
const { hasTable } = require('./schemaFeatures');

/** How many devices may be signed in at the same time (null = no cap). */
const DEVICE_LIMIT = { candidate: 2 };
/** A session untouched for this long frees its slot (only matters where there is a cap). */
const IDLE_MINUTES = 6 * 60;
/** How often a session may take over the others, per day. Beyond that, an administrator must step in. */
const TAKEOVERS_PER_DAY = 2;
/** Refresh last_seen_at at most this often, to keep one write per request from becoming the bottleneck. */
const TOUCH_EVERY_SECONDS = 60;

const limitFor = (role) => DEVICE_LIMIT[role] ?? null;
const newId = () => crypto.randomUUID();
/** Sessions are only tracked once migration 021 has been applied. */
const ready = (db) => hasTable(db, 'user_sessions');

/** "Chrome on Windows" — enough for someone to recognise their own device, nothing more. */
function describeDevice(userAgent = '') {
    const ua = String(userAgent);
    const browser = /Edg\//.test(ua) ? 'Edge'
        : /OPR\//.test(ua) ? 'Opera'
            : /Chrome\//.test(ua) && !/Chromium/.test(ua) ? 'Chrome'
                : /Firefox\//.test(ua) ? 'Firefox'
                    : /Safari\//.test(ua) ? 'Safari'
                        : null;
    const os = /Windows/.test(ua) ? 'Windows'
        : /iPhone|iPad|iPod/.test(ua) ? 'iPhone or iPad'
            : /Android/.test(ua) ? 'Android'
                : /Mac OS X|Macintosh/.test(ua) ? 'Mac'
                    : /Linux/.test(ua) ? 'Linux'
                        : null;
    if (browser && os) return `${browser} on ${os}`;
    return browser || os || 'Unknown device';
}

const clientIp = (req) => String(req?.ip || req?.connection?.remoteAddress || '').replace('::ffff:', '').slice(0, 45) || null;

/**
 * Sessions that still count: open, not expired, and used recently. Ages are
 * measured by the database, so "last used 5 minutes ago" never depends on the
 * visitor's clock or timezone.
 */
async function activeSessions(db, userId) {
    if (!(await ready(db))) return [];
    return db.all(
        `SELECT id, jti, created_at, last_seen_at, expires_at, device, ip,
                EXTRACT(EPOCH FROM (LOCALTIMESTAMP - last_seen_at))::int AS idle_seconds,
                EXTRACT(EPOCH FROM (LOCALTIMESTAMP - created_at))::int AS age_seconds
           FROM user_sessions
          WHERE user_id = $1 AND ended_at IS NULL
            AND expires_at > LOCALTIMESTAMP
            AND last_seen_at > LOCALTIMESTAMP - make_interval(mins => $2)
          ORDER BY last_seen_at DESC`,
        [userId, IDLE_MINUTES]);
}

/** Closes sessions and says how many were closed. */
async function endSessions(db, ids, reason) {
    const list = (Array.isArray(ids) ? ids : [ids]).map(Number).filter(Number.isInteger);
    if (!list.length || !(await ready(db))) return 0;
    const done = await db.all(
        `UPDATE user_sessions SET ended_at = CURRENT_TIMESTAMP, ended_reason = $2
          WHERE id = ANY($1::int[]) AND ended_at IS NULL RETURNING id`,
        [list, reason]);
    return done.length;
}

/** Closes every session of a user, optionally sparing one (usually the caller's own). */
async function endAllForUser(db, userId, reason, keepSessionId = null) {
    if (!(await ready(db))) return 0;
    const keep = Number.isInteger(Number(keepSessionId)) ? Number(keepSessionId) : null;
    const done = await db.all(
        `UPDATE user_sessions SET ended_at = CURRENT_TIMESTAMP, ended_reason = $2
          WHERE user_id = $1 AND ended_at IS NULL AND ($3::int IS NULL OR id <> $3::int) RETURNING id`,
        [userId, reason, keep]);
    return done.length;
}

/** Records a new signed-in device, and how many others it pushed out. */
async function openSession(db, { userId, jti, expiresAt, req, tookOver = 0 }) {
    if (!(await ready(db))) return null;
    return db.get(
        `INSERT INTO user_sessions (user_id, jti, expires_at, device, ip, took_over)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
        [userId, jti, expiresAt, describeDevice(req?.headers?.['user-agent']).slice(0, 120), clientIp(req), Math.min(999, Number(tookOver) || 0)]);
}

/** The session behind a token, if it is still open. */
async function liveSession(db, jti) {
    if (!jti || !(await ready(db))) return null;
    return db.get(
        `SELECT id, user_id, last_seen_at FROM user_sessions
          WHERE jti = $1 AND ended_at IS NULL
            AND expires_at > LOCALTIMESTAMP
            AND last_seen_at > LOCALTIMESTAMP - make_interval(mins => $2)`,
        [jti, IDLE_MINUTES]);
}

/** Keeps a session alive, at most once a minute. */
async function touch(db, session) {
    const age = (Date.now() - new Date(session.last_seen_at).getTime()) / 1000;
    if (age < TOUCH_EVERY_SECONDS) return;
    await db.run('UPDATE user_sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = $1', [session.id])
        .catch(() => { /* a missed refresh only shortens this session's idle window */ });
}

/**
 * How many times in the last day this account pushed its other devices out.
 * One sign-in that closed two devices counts once, so the allowance is about
 * how often it happens — not how many devices were open at the time.
 */
async function takeoversToday(db, userId) {
    if (!(await ready(db))) return 0;
    const row = await db.get(
        `SELECT COUNT(*)::int AS n FROM user_sessions
          WHERE user_id = $1 AND took_over > 0 AND created_at > LOCALTIMESTAMP - INTERVAL '24 hours'`,
        [userId]);
    return row?.n || 0;
}

/**
 * Housekeeping: close sessions whose token has expired, and forget rows nobody
 * needs any more. Keeps 60 days of ended sessions, which is enough history to
 * look into a shared account.
 */
async function sweep(db) {
    if (!(await ready(db))) return;
    await db.run(
        `UPDATE user_sessions SET ended_at = expires_at, ended_reason = 'expired'
          WHERE ended_at IS NULL AND expires_at <= LOCALTIMESTAMP`);
    await db.run(
        `DELETE FROM user_sessions WHERE ended_at IS NOT NULL AND ended_at < CURRENT_TIMESTAMP - INTERVAL '60 days'`);
}

/** Runs the housekeeping sweep now and once a day after that. */
function startSessionSweeper(db) {
    const tick = () => sweep(db).catch(e => console.error('Session sweep failed:', e.message));
    tick();
    const timer = setInterval(tick, 24 * 60 * 60 * 1000);
    timer.unref?.();
    return timer;
}

/** What the sign-in screen and the profile show about a device. */
const publicView = (row, currentId = null) => ({
    id: Number(row.id),
    device: row.device || 'Unknown device',
    // Seconds since, measured by the database — the client turns them into words.
    idle_seconds: Math.max(0, Number(row.idle_seconds) || 0),
    age_seconds: Math.max(0, Number(row.age_seconds) || 0),
    current: currentId != null && Number(row.id) === Number(currentId),
});

module.exports = {
    DEVICE_LIMIT, IDLE_MINUTES, TAKEOVERS_PER_DAY,
    limitFor, newId, ready, describeDevice, activeSessions, endSessions, endAllForUser,
    openSession, liveSession, touch, takeoversToday, publicView, sweep, startSessionSweeper,
};
