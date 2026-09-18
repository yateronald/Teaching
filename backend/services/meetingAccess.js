/**
 * Meeting access — identifiers, passcodes, who may enter, the lobby.
 *
 *  • Meeting code  : Google Meet style "abc-defg-hij" (25^10 ≈ 9.5e13 codes,
 *                    crypto random). It is also the LiveKit room name and the
 *                    public reference in every link: /app/meeting/abc-defg-hij.
 *  • Passcode      : 6 characters, no look-alikes (0/O, 1/I/L). Stored
 *                    AES-256-GCM encrypted in meetings.password so only the
 *                    host can read it back; compared in constant time.
 *  • Direct entry  : host, admins, students of the meeting's batch, the batch's
 *                    teacher and guests the host already admitted
 *                    (meetings.trusted_user_ids).
 *  • Everyone else : meeting code + passcode, then the lobby until the host
 *                    admits or denies them.
 *
 * The lobby is live presence (like Teams / Meet): it lives in memory and a
 * request disappears when the person stops waiting. Admissions persist in
 * trusted_user_ids, removals in kicked_user_ids.
 */
const crypto = require('crypto');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

// ─────────────────────────────── Identifiers ───────────────────────────────
const CODE_LETTERS = 'abcdefghijkmnopqrstuvwxyz'; // no "l" (reads as 1 / I)
const PASS_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0 O 1 I L
const PASSCODE_LENGTH = 6;
const CODE_RE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;

const pick = (alphabet, n) => Array.from({ length: n }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
const generateMeetingCode = () => `${pick(CODE_LETTERS, 3)}-${pick(CODE_LETTERS, 4)}-${pick(CODE_LETTERS, 3)}`;
const generatePasscode = () => pick(PASS_CHARS, PASSCODE_LENGTH);

/**
 * Turns whatever people paste ("ABC DEFG HIJ", "abcdefghij", a full invite
 * link) into a lookup reference: a canonical code, a legacy room name or a
 * numeric id.
 */
function normalizeRef(input) {
    let s = String(input ?? '').trim();
    const inLink = s.match(/\/meeting(?:-join)?\/([^/?#\s]+)/i);
    if (inLink) s = inLink[1];
    try { s = decodeURIComponent(s); } catch { /* keep as typed */ }
    s = s.trim().slice(0, 100);
    if (/^[A-Za-z\s-]+$/.test(s)) {
        const letters = s.toLowerCase().replace(/[^a-z]/g, '');
        if (letters.length === 10) return `${letters.slice(0, 3)}-${letters.slice(3, 7)}-${letters.slice(7)}`;
    }
    return s;
}
const isNumericRef = ref => /^\d{1,10}$/.test(String(ref));
const normalizePasscode = input => String(input ?? '').toUpperCase().replace(/[\s-]/g, '').slice(0, 32);

// ───────────────────────────── Passcode storage ─────────────────────────────
let cachedKey = null;
function passcodeKey() {
    if (!cachedKey) {
        const secret = process.env.MEETING_SECRET || process.env.JWT_SECRET || 'dev_secret_key';
        cachedKey = crypto.createHash('sha256').update(`lfn.meeting.passcode.v1:${secret}`).digest();
    }
    return cachedKey;
}

function sealPasscode(passcode) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', passcodeKey(), iv);
    const body = Buffer.concat([cipher.update(String(passcode), 'utf8'), cipher.final()]);
    return `v1.${Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url')}`;
}

/** Plain passcode, or null when there is none / it cannot be read (key rotated). */
function openPasscode(stored) {
    if (!stored) return null;
    if (!String(stored).startsWith('v1.')) return String(stored); // legacy plain value
    try {
        const raw = Buffer.from(String(stored).slice(3), 'base64url');
        const decipher = crypto.createDecipheriv('aes-256-gcm', passcodeKey(), raw.subarray(0, 12));
        decipher.setAuthTag(raw.subarray(12, 28));
        return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
    } catch {
        return null;
    }
}

function passcodeMatches(stored, input) {
    const real = openPasscode(stored);
    if (!real) return false;
    const a = Buffer.from(normalizePasscode(input));
    const b = Buffer.from(normalizePasscode(real));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Legacy meetings have no passcode yet: give them one the first time the host needs it. */
async function ensurePasscode(db, meeting) {
    const current = openPasscode(meeting.password);
    if (current) return current;
    const fresh = generatePasscode();
    const sealed = sealPasscode(fresh);
    await db.run('UPDATE meetings SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [sealed, meeting.id]);
    meeting.password = sealed;
    return fresh;
}

/** A unique meeting code (LiveKit room name). Collisions are astronomically rare; still checked. */
async function uniqueMeetingCode(db) {
    for (let i = 0; i < 6; i++) {
        const code = generateMeetingCode();
        const taken = await db.get('SELECT 1 FROM meetings WHERE room_name = $1', [code]);
        if (!taken) return code;
    }
    throw new Error('Could not allocate a meeting code');
}

// ────────────────────────────────── Lookup ──────────────────────────────────
const MEETING_SELECT = `
    SELECT m.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
           b.name AS batch_name, b.teacher_id AS batch_teacher_id
    FROM meetings m
    LEFT JOIN users u ON u.id = m.teacher_id
    LEFT JOIN batches b ON b.id = m.batch_id`;

async function findMeeting(db, ref) {
    const r = normalizeRef(ref);
    if (!r) return null;
    if (isNumericRef(r)) return db.get(`${MEETING_SELECT} WHERE m.id = $1`, [Number(r)]);
    return db.get(`${MEETING_SELECT} WHERE m.room_name = $1`, [r]);
}

// ────────────────────────────────── Access ──────────────────────────────────
const ids = list => (Array.isArray(list) ? list.map(Number) : []);

/**
 * role: host | admin | teacher (batch teacher) | member (batch student)
 *       | guest (admitted earlier) | outsider | kicked
 * direct: may enter without the lobby.
 */
async function resolveAccess(db, meeting, user) {
    if (!meeting || !user) return { role: 'outsider', direct: false };
    const uid = Number(user.id);
    if (Number(meeting.teacher_id) === uid) return { role: 'host', direct: true };
    if (ids(meeting.kicked_user_ids).includes(uid)) return { role: 'kicked', direct: false };
    if (user.role === 'admin') return { role: 'admin', direct: true };
    if (meeting.batch_id) {
        if (user.role === 'teacher') {
            let batchTeacher = meeting.batch_teacher_id;
            if (batchTeacher === undefined) {
                batchTeacher = (await db.get('SELECT teacher_id FROM batches WHERE id = $1', [meeting.batch_id]))?.teacher_id;
            }
            if (Number(batchTeacher) === uid) return { role: 'teacher', direct: true };
        } else if (user.role === 'student') {
            const enrolled = await db.get('SELECT 1 FROM batch_students WHERE batch_id = $1 AND student_id = $2', [meeting.batch_id, uid]);
            if (enrolled) return { role: 'member', direct: true };
        }
    }
    if (ids(meeting.trusted_user_ids).includes(uid)) return { role: 'guest', direct: true };
    return { role: 'outsider', direct: false };
}

const isModerator = access => access.role === 'host';

/** What a caller may see about a meeting. The passcode only ever goes to the host. */
function meetingView(meeting, access, extra = {}) {
    const insider = access.direct;
    const view = {
        id: meeting.id,
        code: meeting.room_name,
        room_name: meeting.room_name,
        title: meeting.title,
        status: meeting.status,
        is_locked: !!meeting.is_locked,
        is_recording: !!meeting.is_recording,
        teacher_id: meeting.teacher_id,
        teacher_first_name: meeting.teacher_first_name,
        teacher_last_name: meeting.teacher_last_name,
        scheduled_start: meeting.scheduled_start,
        scheduled_end: meeting.scheduled_end,
        started_at: meeting.started_at,
        ended_at: meeting.ended_at,
        my_role: access.role,
        needs_passcode: !access.direct && access.role !== 'kicked',
        ...extra,
    };
    if (insider) {
        view.description = meeting.description;
        view.batch_id = meeting.batch_id;
        view.batch_name = meeting.batch_name;
    }
    return view;
}

// ────────────────────────────── Rate limiting ──────────────────────────────
const buckets = new Map();
/** Sliding counter: at most `max` hits per `windowMs` for a key. */
function allowHit(key, max, windowMs) {
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now - b.start > windowMs) { buckets.set(key, { start: now, n: 1 }); return true; }
    b.n += 1;
    return b.n <= max;
}

const PASS_MAX_FAILS = 5;
const PASS_LOCK_MS = 15 * 60 * 1000;
const passFails = new Map(); // `${meetingId}:${userId}` → { fails, lockedUntil }

function passcodeLock(meetingId, userId) {
    const f = passFails.get(`${meetingId}:${userId}`);
    if (f && f.lockedUntil > Date.now()) return Math.ceil((f.lockedUntil - Date.now()) / 1000);
    return 0;
}
function passcodeFailed(meetingId, userId) {
    const key = `${meetingId}:${userId}`;
    const f = passFails.get(key) || { fails: 0, lockedUntil: 0 };
    if (f.lockedUntil && f.lockedUntil <= Date.now()) { f.fails = 0; f.lockedUntil = 0; }
    f.fails += 1;
    if (f.fails >= PASS_MAX_FAILS) f.lockedUntil = Date.now() + PASS_LOCK_MS;
    passFails.set(key, f);
    return Math.max(0, PASS_MAX_FAILS - f.fails);
}
const passcodeOk = (meetingId, userId) => passFails.delete(`${meetingId}:${userId}`);

// ──────────────────────────────────── Lobby ────────────────────────────────────
const lobbies = new Map();   // meetingId → Map(userId → request)
const verified = new Map();  // `${meetingId}:${userId}` → expiry (passcode accepted, may wait for the start)
const denials = new Map();   // `${meetingId}:${userId}` → { count, until }
const VERIFIED_MS = 6 * 60 * 60 * 1000;
const LOBBY_GRACE_MS = 45 * 1000; // survives a page refresh or a network blip
const dropTimers = new Map();

function lobbyOf(meetingId) {
    const k = Number(meetingId);
    if (!lobbies.has(k)) lobbies.set(k, new Map());
    return lobbies.get(k);
}
function lobbyList(meetingId) {
    return [...(lobbies.get(Number(meetingId))?.values() || [])].sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
}
function lobbyHas(meetingId, userId) { return !!lobbies.get(Number(meetingId))?.has(Number(userId)); }
function lobbyAdd(meetingId, user, via) {
    const lobby = lobbyOf(meetingId);
    const uid = Number(user.id);
    cancelDrop(meetingId, uid);
    if (lobby.has(uid)) return { request: lobby.get(uid), isNew: false };
    const request = {
        userId: uid,
        userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Participant',
        role: user.role,
        via,
        requestedAt: new Date().toISOString(),
    };
    lobby.set(uid, request);
    return { request, isNew: true };
}
function lobbyRemove(meetingId, userId) {
    cancelDrop(meetingId, userId);
    const lobby = lobbies.get(Number(meetingId));
    const removed = !!lobby?.delete(Number(userId));
    if (lobby && lobby.size === 0) lobbies.delete(Number(meetingId));
    return removed;
}
function lobbyClear(meetingId) {
    for (const r of lobbyList(meetingId)) cancelDrop(meetingId, r.userId);
    lobbies.delete(Number(meetingId));
    for (const key of [...verified.keys()]) if (key.startsWith(`${meetingId}:`)) verified.delete(key);
}
function cancelDrop(meetingId, userId) {
    const key = `${meetingId}:${userId}`;
    clearTimeout(dropTimers.get(key));
    dropTimers.delete(key);
}
/** The person stopped waiting (closed the tab, lost the network): drop the request after a grace period. */
function scheduleDrop(meetingId, userId, onDropped) {
    cancelDrop(meetingId, userId);
    const key = `${meetingId}:${userId}`;
    dropTimers.set(key, setTimeout(() => {
        dropTimers.delete(key);
        if (lobbyRemove(meetingId, userId)) onDropped?.();
    }, LOBBY_GRACE_MS));
}

function markVerified(meetingId, userId) { verified.set(`${meetingId}:${userId}`, Date.now() + VERIFIED_MS); }
function isVerified(meetingId, userId) {
    const until = verified.get(`${meetingId}:${userId}`);
    if (!until) return false;
    if (until < Date.now()) { verified.delete(`${meetingId}:${userId}`); return false; }
    return true;
}

/** Seconds before a denied person may knock again (null = never for this meeting). */
function denialWait(meetingId, userId) {
    const d = denials.get(`${meetingId}:${userId}`);
    if (!d) return 0;
    if (d.count >= 3) return null;
    return d.until > Date.now() ? Math.ceil((d.until - Date.now()) / 1000) : 0;
}
function recordDenial(meetingId, userId) {
    const key = `${meetingId}:${userId}`;
    const d = denials.get(key) || { count: 0, until: 0 };
    d.count += 1;
    d.until = Date.now() + d.count * 2 * 60 * 1000;
    denials.set(key, d);
}
const clearDenials = (meetingId, userId) => denials.delete(`${meetingId}:${userId}`);

// Housekeeping: forget stale counters so memory stays flat.
setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (now - b.start > 60 * 60 * 1000) buckets.delete(k);
    for (const [k, f] of passFails) if (f.lockedUntil < now && f.fails < PASS_MAX_FAILS) passFails.delete(k);
    for (const [k, until] of verified) if (until < now) verified.delete(k);
    for (const [k, d] of denials) if (d.until < now - 6 * 60 * 60 * 1000) denials.delete(k);
}, 10 * 60 * 1000).unref();

// ───────────────────────────── Real-time fan-out ─────────────────────────────
const rooms = {
    participants: id => `meeting:${id}`,
    hosts: id => `meeting-host:${id}`,
    lobby: id => `meeting-lobby:${id}`,
    user: id => `user:${id}`,
};

/** Keeps every host screen (in the room or anywhere in the app) in sync with the lobby. */
function publishLobby(io, meeting) {
    if (!io || !meeting) return;
    const payload = { meetingId: meeting.id, pending: lobbyList(meeting.id) };
    io.to(rooms.hosts(meeting.id)).to(rooms.user(meeting.teacher_id)).emit('meeting:lobby-updated', payload);
}

// ─────────────────────── Host notifications (bell) ───────────────────────
/** One unread "is waiting to join" notification per person and meeting. */
async function notifyJoinRequest(db, meeting, user) {
    try {
        const open = await db.get(
            `SELECT id FROM notifications
             WHERE user_id = $1 AND type = 'meeting_join_request' AND entity_id = $2 AND sender_id = $3 AND is_read = false`,
            [meeting.teacher_id, meeting.id, user.id],
        );
        if (open) return;
        const { createNotification } = require('./notificationService');
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Someone';
        await createNotification(db, {
            user_id: meeting.teacher_id,
            type: 'meeting_join_request',
            title: `${name} is waiting to join`,
            message: `“${meeting.title}” — open the class to admit or deny them.`,
            link: `/app/meeting/${meeting.room_name}`,
            entity_type: 'meeting',
            entity_id: meeting.id,
            sender_id: user.id,
        });
    } catch (e) {
        console.warn('[meetings] join-request notification failed:', e.message);
    }
}

/** The request was answered or withdrawn: its notification is no longer actionable. */
async function settleJoinRequests(db, meeting, userIds = null) {
    try {
        const params = [meeting.teacher_id, meeting.id];
        let filter = '';
        if (Array.isArray(userIds)) {
            if (userIds.length === 0) return;
            params.push(userIds.map(Number));
            filter = 'AND sender_id = ANY($3::int[])';
        }
        await db.run(
            `UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND type = 'meeting_join_request' AND entity_id = $2 AND is_read = false ${filter}`,
            params,
        );
    } catch (e) {
        console.warn('[meetings] settle join-request notifications failed:', e.message);
    }
}

// ─────────────────────────────────── LiveKit ───────────────────────────────────
function liveKitUrl() { return process.env.LIVEKIT_URL; }

function roomService() {
    const url = (process.env.LIVEKIT_URL || '').replace(/^wss:\/\//, 'https://').replace(/^ws:\/\//, 'http://');
    if (!url || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) return null;
    return new RoomServiceClient(url, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
}

/** Identity = user id; name and role come from the server, and clients cannot rewrite them. */
function liveKitToken(meeting, user, access) {
    const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
        identity: String(user.id),
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Participant',
        metadata: JSON.stringify({ role: access.role }),
        ttl: '6h',
    });
    at.addGrant({
        roomJoin: true,
        room: meeting.room_name,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        canUpdateOwnMetadata: false,
        roomAdmin: access.role === 'host',
    });
    return at.toJwt();
}

/** Server-side removal: a removed participant is disconnected even if their app ignores the event. */
async function removeFromLiveKit(meeting, userId) {
    const svc = roomService();
    if (!svc) return;
    try { await svc.removeParticipant(meeting.room_name, String(userId)); } catch { /* not in the room */ }
}
async function closeLiveKitRoom(meeting) {
    const svc = roomService();
    if (!svc) return;
    try { await svc.deleteRoom(meeting.room_name); } catch { /* already closed */ }
}

module.exports = {
    CODE_RE, PASSCODE_LENGTH,
    generateMeetingCode, generatePasscode, uniqueMeetingCode, normalizeRef, isNumericRef, normalizePasscode,
    sealPasscode, openPasscode, passcodeMatches, ensurePasscode,
    findMeeting, resolveAccess, isModerator, meetingView,
    allowHit, passcodeLock, passcodeFailed, passcodeOk,
    lobbyList, lobbyHas, lobbyAdd, lobbyRemove, lobbyClear, scheduleDrop, cancelDrop,
    markVerified, isVerified, denialWait, recordDenial, clearDenials,
    rooms, publishLobby, notifyJoinRequest, settleJoinRequests,
    liveKitUrl, liveKitToken, removeFromLiveKit, closeLiveKitRoom, roomService,
};
