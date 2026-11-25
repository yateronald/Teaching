/**
 * Real-time layer for live classes and public meetings (Socket.IO).
 *
 * Every connection is authenticated with either:
 *   1. A portal user JWT (decoded.aud === undefined, verified against `users` + session), OR
 *   2. A strictly-scoped public guest meeting JWT (`aud: 'meeting_guest'`),
 *      verified against `meetings (is_public = TRUE)` and `meeting_guests`.
 *
 * The server — never the client — decides which rooms a socket joins, who may
 * listen/speak/chat, and who may execute host-only actions.
 */
const jwt = require('jsonwebtoken');
const access = require('./meetingAccess');
const sessions = require('./sessionService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const REACTIONS = new Set(['👏', '❤️', '😂', '🎉', '🤔', '👍', '🔥', '😮', '💯', '🙌']);

const text = (v, max) => (typeof v === 'string' ? v.replace(/\s+$/u, '').trim().slice(0, max) : '');
const fullName = u => `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Participant';

function attachMeetingRealtime(io, db) {
    // ── Authentication ──
    io.use(async (socket, next) => {
        try {
            const header = socket.handshake.headers?.authorization || '';
            const token = socket.handshake.auth?.token || (header.startsWith('Bearer ') ? header.slice(7) : null);
            if (!token) return next(new Error('unauthorized'));
            const decoded = jwt.verify(token, JWT_SECRET);

            // Path A: Scoped public meeting guest JWT
            if (decoded && decoded.aud === 'meeting_guest') {
                const claims = access.verifyGuestToken(token);
                if (!claims) return next(new Error('unauthorized'));
                const row = await db.get(
                    `SELECT mg.id, mg.meeting_id, mg.display_name, mg.status AS guest_status,
                            m.status AS meeting_status, m.is_public
                     FROM meeting_guests mg
                     JOIN meetings m ON m.id = mg.meeting_id
                     WHERE mg.id = $1 AND mg.meeting_id = $2`,
                    [claims.guestId, claims.meetingId],
                );
                if (!row || !row.is_public || row.meeting_status === 'ended') {
                    return next(new Error('unauthorized'));
                }
                if (row.guest_status === 'kicked' || row.guest_status === 'declined') {
                    return next(new Error('unauthorized'));
                }
                socket.data.isGuest = true;
                socket.data.guest = {
                    guestId: row.id,
                    meetingId: Number(row.meeting_id),
                    displayName: row.display_name || claims.displayName || 'Guest',
                };
                socket.data.user = null;
                socket.data.meetings = new Map(); // meetingId → 'participant' | 'lobby'
                return next();
            }

            // Path B: Portal user JWT (must NOT carry an audience)
            if (decoded.aud !== undefined) return next(new Error('unauthorized'));
            const user = await db.get(
                'SELECT id, role, first_name, last_name, is_active FROM users WHERE id = $1',
                [decoded.id],
            );
            if (!user || !user.is_active || user.role === 'learner') return next(new Error('unauthorized'));
            // A token whose session has been ended cannot open a socket either.
            if (decoded.jti && !(await sessions.liveSession(db, decoded.jti))) return next(new Error('unauthorized'));
            socket.data.isGuest = false;
            socket.data.guest = null;
            socket.data.user = user;
            socket.data.meetings = new Map(); // meetingId → 'participant' | 'lobby'
            return next();
        } catch {
            return next(new Error('unauthorized'));
        }
    });

    io.on('connection', socket => {
        const isGuest = !!socket.data.isGuest;
        const guest = socket.data.guest;
        const me = socket.data.user;

        if (isGuest) {
            socket.join(access.rooms.guest(guest.guestId));
        } else {
            socket.join(access.rooms.user(me.id));
            if (me.role === 'admin') socket.join(access.rooms.role('admin'));
        }

        const actorKey = isGuest ? `guest:${guest.guestId}` : String(me.id);
        const actorName = isGuest ? guest.displayName : fullName(me);
        const inMeeting = id => socket.data.meetings.get(Number(id)) === 'participant';

        /** Joins the meeting channel the caller is entitled to. */
        const subscribe = async (meetingId) => {
            const id = Number(meetingId);
            if (!Number.isInteger(id) || id <= 0) return { ok: false };

            if (isGuest) {
                if (id !== guest.meetingId) return { ok: false, error: 'forbidden' };
                if (!access.allowHit(`sub:g:${guest.guestId}`, 60, 60 * 1000)) return { ok: false, error: 'rate_limited' };
                const row = await db.get(
                    `SELECT mg.id, mg.status AS guest_status, m.id AS meeting_id, m.status AS meeting_status, m.is_public, m.require_approval
                     FROM meeting_guests mg
                     JOIN meetings m ON m.id = mg.meeting_id
                     WHERE mg.id = $1 AND mg.meeting_id = $2`,
                    [guest.guestId, id],
                );
                if (!row || !row.is_public) return { ok: false };
                if (row.meeting_status === 'ended') {
                    socket.emit('meeting:ended', { meetingId: id, status: 'ended' });
                    return { ok: false, ended: true };
                }
                if (row.guest_status === 'kicked' || row.guest_status === 'declined') {
                    return { ok: false, error: 'forbidden' };
                }
                if (row.guest_status === 'admitted' || (row.meeting_status === 'active' && !row.require_approval)) {
                    socket.leave(access.rooms.lobby(id));
                    socket.join(access.rooms.participants(id));
                    socket.data.meetings.set(id, 'participant');
                    access.cancelDrop(id, actorKey);
                    return { ok: true, role: 'guest' };
                }
                socket.join(access.rooms.lobby(id));
                socket.data.meetings.set(id, 'lobby');
                access.cancelDrop(id, actorKey);
                return { ok: true, role: 'lobby', waiting: access.lobbyHas(id, actorKey) };
            }

            if (me.role === 'candidate') return { ok: false }; // exam-only accounts have no live classes
            if (!access.allowHit(`sub:${me.id}`, 60, 60 * 1000)) return { ok: false, error: 'rate_limited' };
            const meeting = await db.get(
                'SELECT m.*, b.teacher_id AS batch_teacher_id FROM meetings m LEFT JOIN batches b ON b.id = m.batch_id WHERE m.id = $1',
                [id],
            );
            if (!meeting) return { ok: false };
            // A device may reconnect after the original end broadcast. Give it
            // the terminal state immediately instead of letting it re-subscribe.
            if (meeting.status === 'ended') {
                socket.emit('meeting:ended', { meetingId: id, status: 'ended' });
                return { ok: false, ended: true };
            }
            const who = await access.resolveAccess(db, meeting, me);
            if (who.direct) {
                socket.join(access.rooms.participants(id));
                if (who.role === 'host' || who.role === 'admin') socket.join(access.rooms.hosts(id));
                socket.data.meetings.set(id, 'participant');
                if (who.role === 'host' || who.role === 'admin') {
                    socket.emit('meeting:lobby-updated', { meetingId: id, pending: access.lobbyList(id) });
                }
                return { ok: true, role: who.role };
            }
            if (who.role !== 'kicked' && (access.lobbyHas(id, me.id) || access.isVerified(id, me.id))) {
                socket.join(access.rooms.lobby(id));
                socket.data.meetings.set(id, 'lobby');
                access.cancelDrop(id, me.id);
                return { ok: true, role: 'lobby', waiting: access.lobbyHas(id, me.id) };
            }
            return { ok: false };
        };

        socket.on('meeting:subscribe', async (payload, ack) => {
            let result = { ok: false };
            try { result = await subscribe(payload?.meetingId); } catch (e) { console.warn('[meetings] subscribe failed:', e.message); }
            if (typeof ack === 'function') ack(result);
        });
        // Older clients (kept for a smooth deploy).
        socket.on('meeting:join-room', meetingId => { subscribe(meetingId).catch(() => {}); });
        socket.on('user:join', () => { /* the private room is joined automatically */ });

        socket.on('meeting:unsubscribe', payload => {
            const id = Number(payload?.meetingId);
            const kind = socket.data.meetings.get(id);
            if (!kind) return;
            socket.leave(access.rooms.participants(id));
            socket.leave(access.rooms.hosts(id));
            socket.leave(access.rooms.lobby(id));
            socket.data.meetings.delete(id);
            if (kind === 'lobby') dropIfGone(id).catch(() => {});
        });

        // ── In-class interactions (participants only; identity stamped server-side) ──
        socket.on('meeting:chat-message', payload => {
            const id = Number(payload?.meetingId);
            const body = text(payload?.text, 1000);
            if (!inMeeting(id) || !body) return;
            if (!access.allowHit(`chat:${actorKey}`, 10, 10 * 1000)) return;
            io.to(access.rooms.participants(id)).emit('meeting:chat-message', {
                meetingId: id,
                id: `${actorKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                senderId: actorKey,
                sender: actorName,
                text: body,
                time: new Date().toISOString(),
            });
        });

        socket.on('meeting:raise-hand', payload => {
            const id = Number(payload?.meetingId);
            if (!inMeeting(id) || !access.allowHit(`hand:${actorKey}`, 20, 60 * 1000)) return;
            const emittedId = isGuest ? actorKey : Number(me.id);
            io.to(access.rooms.participants(id)).emit('meeting:hand-raised', {
                meetingId: id,
                userId: emittedId,
                userName: actorName,
            });
        });

        socket.on('meeting:lower-hand', async payload => {
            const id = Number(payload?.meetingId);
            if (!inMeeting(id)) return;
            if (isGuest) {
                // Guests may only lower their own hand
                io.to(access.rooms.participants(id)).emit('meeting:hand-lowered', {
                    meetingId: id,
                    userId: actorKey,
                });
                return;
            }
            const rawTarget = payload?.userId;
            const target = (typeof rawTarget === 'string' && rawTarget.startsWith('guest:'))
                ? rawTarget
                : (Number(rawTarget) || Number(me.id));
            if (String(target) !== String(me.id)) {
                const meeting = await db.get('SELECT teacher_id, is_public, meeting_kind FROM meetings WHERE id = $1', [id]);
                if (!meeting || !access.isHostOrAdmin(meeting, me)) return;
            }
            io.to(access.rooms.participants(id)).emit('meeting:hand-lowered', { meetingId: id, userId: target });
        });

        socket.on('meeting:reaction', payload => {
            const id = Number(payload?.meetingId);
            if (!inMeeting(id) || !REACTIONS.has(payload?.emoji)) return;
            if (!access.allowHit(`react:${actorKey}`, 12, 10 * 1000)) return;
            io.to(access.rooms.participants(id)).emit('meeting:reaction', {
                meetingId: id, emoji: payload.emoji, senderName: actorName, senderId: actorKey,
            });
        });

        // Host/Admin ONLY below this line
        socket.on('meeting:announcement', async payload => {
            if (isGuest) return;
            const id = Number(payload?.meetingId);
            const body = text(payload?.text, 200);
            if (!inMeeting(id) || !body) return;
            const meeting = await db.get('SELECT teacher_id, is_public, meeting_kind FROM meetings WHERE id = $1', [id]);
            if (!meeting || !access.isHostOrAdmin(meeting, me)) return;
            io.to(access.rooms.participants(id)).emit('meeting:announcement', { meetingId: id, text: body });
        });

        // Host/Admin only: stop every screen share in the room (LiveKit mutes the publications).
        socket.on('meeting:force-stop-share', async payload => {
            if (isGuest) return;
            try {
                const id = Number(payload?.meetingId);
                const meeting = await db.get('SELECT id, room_name, teacher_id, is_public, meeting_kind FROM meetings WHERE id = $1', [id]);
                if (!meeting || !access.isHostOrAdmin(meeting, me)) return;
                const svc = access.roomService();
                if (!svc) return;
                let stopped = 0;
                for (const p of await svc.listParticipants(meeting.room_name)) {
                    if (String(p.identity) === String(me.id) || String(p.identity) === String(meeting.teacher_id)) continue;
                    for (const pub of p.tracks || []) {
                        if (pub.source === 3 || pub.source === 'SCREEN_SHARE') {
                            try { await svc.mutePublishedTrack(meeting.room_name, p.identity, pub.sid, true); stopped += 1; } catch { /* already gone */ }
                        }
                    }
                }
                io.to(access.rooms.participants(id)).emit('meeting:force-stop-share', { meetingId: id, stopped });
            } catch (err) {
                console.error('[meetings] force-stop-share:', err.message);
            }
        });

        // ── Lobby presence ──
        /** Nobody from this person is waiting any more (tab closed, network lost): forget the request. */
        async function dropIfGone(meetingId) {
            if (!access.lobbyHas(meetingId, actorKey)) return;
            const personalRoom = isGuest ? access.rooms.guest(guest.guestId) : access.rooms.user(me.id);
            const others = await io.in(personalRoom).fetchSockets().catch(() => []);
            if (others.some(s => s.id !== socket.id && s.data.meetings?.get(Number(meetingId)) === 'lobby')) return;
            access.scheduleDrop(meetingId, actorKey, async () => {
                const meeting = await db.get('SELECT id, teacher_id, is_public, meeting_kind FROM meetings WHERE id = $1', [meetingId]).catch(() => null);
                if (!meeting) return;
                access.publishLobby(io, meeting);
                if (!isGuest) await access.settleJoinRequests(db, meeting, [me.id]);
            });
        }

        socket.on('disconnect', () => {
            for (const [id, kind] of socket.data.meetings) if (kind === 'lobby') dropIfGone(id).catch(() => {});
        });
    });
}

module.exports = { attachMeetingRealtime };
