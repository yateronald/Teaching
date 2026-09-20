/**
 * Real-time layer for live classes (Socket.IO).
 *
 * Every connection is authenticated with the user's JWT (handshake
 * `auth.token`). The server — never the client — decides:
 *   • which private room a socket joins (only its own `user:<id>`),
 *   • who may listen to a meeting (participants) or wait in its lobby,
 *   • who sent a message (names and ids are stamped server-side),
 *   • who may use host-only actions.
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
            const user = await db.get(
                'SELECT id, role, first_name, last_name, is_active FROM users WHERE id = $1',
                [decoded.id],
            );
            if (!user || !user.is_active) return next(new Error('unauthorized'));
            // A token whose session has been ended cannot open a socket either.
            if (decoded.jti && !(await sessions.liveSession(db, decoded.jti))) return next(new Error('unauthorized'));
            socket.data.user = user;
            socket.data.meetings = new Map(); // meetingId → 'participant' | 'lobby'
            next();
        } catch {
            next(new Error('unauthorized'));
        }
    });

    io.on('connection', socket => {
        const me = socket.data.user;
        socket.join(access.rooms.user(me.id));

        const inMeeting = id => socket.data.meetings.get(Number(id)) === 'participant';

        /** Joins the meeting channel the caller is entitled to. */
        const subscribe = async (meetingId) => {
            const id = Number(meetingId);
            if (!Number.isInteger(id) || id <= 0) return { ok: false };
            if (me.role === 'candidate') return { ok: false }; // exam-only accounts have no live classes
            if (!access.allowHit(`sub:${me.id}`, 60, 60 * 1000)) return { ok: false, error: 'rate_limited' };
            const meeting = await db.get(
                'SELECT m.*, b.teacher_id AS batch_teacher_id FROM meetings m LEFT JOIN batches b ON b.id = m.batch_id WHERE m.id = $1',
                [id],
            );
            if (!meeting) return { ok: false };
            const who = await access.resolveAccess(db, meeting, me);
            if (who.direct) {
                socket.join(access.rooms.participants(id));
                if (who.role === 'host') socket.join(access.rooms.hosts(id));
                socket.data.meetings.set(id, 'participant');
                if (who.role === 'host') {
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

        // ── In-class interactions (participants only; identity stamped here) ──
        socket.on('meeting:chat-message', payload => {
            const id = Number(payload?.meetingId);
            const body = text(payload?.text, 1000);
            if (!inMeeting(id) || !body) return;
            if (!access.allowHit(`chat:${me.id}`, 10, 10 * 1000)) return;
            io.to(access.rooms.participants(id)).emit('meeting:chat-message', {
                meetingId: id,
                id: `${me.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                senderId: String(me.id),
                sender: fullName(me),
                text: body,
                time: new Date().toISOString(),
            });
        });

        socket.on('meeting:raise-hand', payload => {
            const id = Number(payload?.meetingId);
            if (!inMeeting(id) || !access.allowHit(`hand:${me.id}`, 20, 60 * 1000)) return;
            io.to(access.rooms.participants(id)).emit('meeting:hand-raised', { meetingId: id, userId: Number(me.id), userName: fullName(me) });
        });

        socket.on('meeting:lower-hand', async payload => {
            const id = Number(payload?.meetingId);
            if (!inMeeting(id)) return;
            const target = Number(payload?.userId) || Number(me.id);
            if (target !== Number(me.id)) {
                const meeting = await db.get('SELECT teacher_id FROM meetings WHERE id = $1', [id]);
                if (!meeting || Number(meeting.teacher_id) !== Number(me.id)) return;
            }
            io.to(access.rooms.participants(id)).emit('meeting:hand-lowered', { meetingId: id, userId: target });
        });

        socket.on('meeting:reaction', payload => {
            const id = Number(payload?.meetingId);
            if (!inMeeting(id) || !REACTIONS.has(payload?.emoji)) return;
            if (!access.allowHit(`react:${me.id}`, 12, 10 * 1000)) return;
            io.to(access.rooms.participants(id)).emit('meeting:reaction', {
                meetingId: id, emoji: payload.emoji, senderName: fullName(me), senderId: String(me.id),
            });
        });

        socket.on('meeting:announcement', async payload => {
            const id = Number(payload?.meetingId);
            const body = text(payload?.text, 200);
            if (!inMeeting(id) || !body) return;
            const meeting = await db.get('SELECT teacher_id FROM meetings WHERE id = $1', [id]);
            if (!meeting || Number(meeting.teacher_id) !== Number(me.id)) return;
            io.to(access.rooms.participants(id)).emit('meeting:announcement', { meetingId: id, text: body });
        });

        // Host only: stop every screen share in the room (LiveKit mutes the publications).
        socket.on('meeting:force-stop-share', async payload => {
            try {
                const id = Number(payload?.meetingId);
                const meeting = await db.get('SELECT id, room_name, teacher_id FROM meetings WHERE id = $1', [id]);
                if (!meeting || Number(meeting.teacher_id) !== Number(me.id)) return;
                const svc = access.roomService();
                if (!svc) return;
                let stopped = 0;
                for (const p of await svc.listParticipants(meeting.room_name)) {
                    if (Number(p.identity) === Number(meeting.teacher_id)) continue;
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
        /** Nobody from this user is waiting any more (tab closed, network lost): forget the request. */
        async function dropIfGone(meetingId) {
            if (!access.lobbyHas(meetingId, me.id)) return;
            // Another tab of the same person is still waiting: keep the request.
            const others = await io.in(access.rooms.user(me.id)).fetchSockets().catch(() => []);
            if (others.some(s => s.id !== socket.id && s.data.meetings?.get(Number(meetingId)) === 'lobby')) return;
            access.scheduleDrop(meetingId, me.id, async () => {
                const meeting = await db.get('SELECT id, teacher_id FROM meetings WHERE id = $1', [meetingId]).catch(() => null);
                if (!meeting) return;
                access.publishLobby(io, meeting);
                await access.settleJoinRequests(db, meeting, [me.id]);
            });
        }

        socket.on('disconnect', () => {
            for (const [id, kind] of socket.data.meetings) if (kind === 'lobby') dropIfGone(id).catch(() => {});
        });
    });
}

module.exports = { attachMeetingRealtime };
