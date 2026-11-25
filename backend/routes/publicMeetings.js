const express = require('express');
const rateLimit = require('express-rate-limit');
const access = require('../services/meetingAccess');

const router = express.Router();

// Dedicated small body limit & rate limiters for unauthenticated public meeting endpoints
router.use(express.json({ limit: '16kb' }));
router.use((err, _req, res, next) => {
    if (err) return res.status(400).json({ error: 'Invalid request payload' });
    return next();
});

const verifyJoinLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please wait a few minutes and try again.', code: 'RATE_LIMITED' },
});

const metaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 80,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a moment.', code: 'RATE_LIMITED' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clientIp(req) {
    return String(req.ip || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0, 80);
}

function bearerGuest(req, meetingId = null) {
    const h = String(req.headers.authorization || '');
    const raw = (h.startsWith('Bearer ') ? h.slice(7).trim() : null) || req.body?.guest_token || null;
    if (!raw) return null;
    const claims = access.verifyGuestToken(raw);
    if (!claims) return null;
    if (meetingId !== null && Number(claims.meetingId) !== Number(meetingId)) return null;
    return claims;
}

function hostInfo(meeting) {
    const name = `${meeting.teacher_first_name || ''} ${meeting.teacher_last_name || ''}`.trim() || 'the host';
    return {
        host_name: name,
        host_role: meeting.teacher_role === 'admin' ? 'admin' : 'teacher',
    };
}

function publicSummary(meeting) {
    return {
        id: meeting.id,
        code: meeting.room_name,
        title: meeting.title,
        status: meeting.status,
        is_locked: !!meeting.is_locked,
        require_approval: meeting.require_approval !== false,
        scheduled_start: meeting.scheduled_start,
        scheduled_end: meeting.scheduled_end,
        needs_passcode: Boolean(meeting.password),
        ...hostInfo(meeting),
    };
}

async function findPublicMeeting(db, rawInput) {
    const ref = access.normalizeRef(rawInput);
    // Reject numeric IDs on public routes so nobody can enumerate sequential IDs
    if (!ref || access.isNumericRef(ref)) return null;
    const meeting = await db.get(
        `SELECT m.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name, u.role AS teacher_role
         FROM meetings m
         LEFT JOIN users u ON u.id = m.teacher_id
         WHERE m.room_name = $1 AND m.is_public = TRUE`,
        [ref]
    );
    return meeting || null;
}

/**
 * POST /api/public/meetings/verify
 * Validates a pasted meeting link OR Meeting ID + Passcode strictly against public meetings.
 * Returns generic 404 for private batch meetings so private rooms cannot be discovered.
 */
router.post('/verify', verifyJoinLimiter, async (req, res) => {
    try {
        const rawInput = req.body?.input || req.body?.meetingId || req.body?.code || '';
        const ref = access.normalizeRef(rawInput);
        if (!ref || access.isNumericRef(ref)) {
            return res.status(404).json({ error: 'Meeting not found. Check your link or Meeting ID.', code: 'NOT_FOUND' });
        }
        const meeting = await findPublicMeeting(req.db, ref);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found. Check your link or Meeting ID.', code: 'NOT_FOUND' });
        }
        if (meeting.status === 'ended') {
            return res.status(410).json({ error: 'This meeting has already ended.', code: 'ENDED', ...publicSummary(meeting) });
        }

        const ip = clientIp(req);
        const lockWait = access.isPublicPassLocked(meeting.id, ip);
        if (lockWait) {
            return res.status(429).json({
                error: `Too many wrong passcodes. Try again in ${Math.ceil(lockWait / 60)} min.`,
                code: 'TOO_MANY_ATTEMPTS',
                retryAfter: lockWait,
            });
        }

        const extractedPass = req.body?.passcode || access.passcodeFromInput(rawInput);
        if (meeting.password) {
            if (!extractedPass) {
                return res.status(403).json({
                    error: 'Passcode is required to verify this meeting.',
                    code: 'PASSCODE_REQUIRED',
                });
            }
            if (!access.passcodeMatches(meeting.password, extractedPass)) {
                const left = access.recordPublicPassFail(meeting.id, ip);
                return res.status(403).json({
                    error: left > 0
                        ? `Incorrect passcode. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`
                        : 'Too many incorrect passcodes. Please wait 15 minutes.',
                    code: left > 0 ? 'BAD_PASSCODE' : 'TOO_MANY_ATTEMPTS',
                    attemptsLeft: left,
                });
            }
            access.resetPublicPassFail(meeting.id, ip);
        }

        return res.json({
            ...publicSummary(meeting),
            verified: true,
        });
    } catch (error) {
        console.error('POST /api/public/meetings/verify error:', error);
        return res.status(500).json({ error: 'Could not verify the meeting' });
    }
});

/**
 * GET /api/public/meetings/:code
 * Safe public metadata only (never returns passcode, invitee emails, or batch info).
 */
router.get('/:code', metaLimiter, async (req, res) => {
    try {
        const meeting = await findPublicMeeting(req.db, req.params.code);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found', code: 'NOT_FOUND' });
        }

        const claims = bearerGuest(req, meeting.id);
        let guestState = null;
        if (claims) {
            const g = await req.db.get(
                'SELECT id, display_name, status, declined_until, decline_count FROM meeting_guests WHERE id = $1 AND meeting_id = $2',
                [claims.guestId, meeting.id]
            );
            if (g) {
                guestState = {
                    guest_id: g.id,
                    display_name: g.display_name,
                    guest_status: g.status,
                    waiting: access.lobbyHas(meeting.id, `guest:${g.id}`),
                };
            }
        }

        return res.json({
            ...publicSummary(meeting),
            ...(guestState ? { guest: guestState } : {}),
        });
    } catch (error) {
        console.error('GET /api/public/meetings/:code error:', error);
        return res.status(500).json({ error: 'Failed to load meeting' });
    }
});

/**
 * POST /api/public/meetings/:code/join
 * Handles public guest entry:
 *   - verifies passcode (or prior valid guest token)
 *   - creates/loads isolated `meeting_guests` row
 *   - if meeting is `scheduled`/`waiting`: returns `action: 'not_started'` with host name + guestToken for live wakeup
 *   - if `active` & `!require_approval` (or already admitted): returns `action: 'join'` + LiveKit token
 *   - if `active` & `require_approval`: puts guest in lobby + notifies host/admins, returns `action: 'lobby'`
 */
router.post('/:code/join', verifyJoinLimiter, async (req, res) => {
    try {
        const meeting = await findPublicMeeting(req.db, req.params.code);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found', code: 'NOT_FOUND' });
        }

        const { host_name, host_role } = hostInfo(meeting);

        if (meeting.status === 'ended') {
            return res.json({ action: 'ended', host_name, host_role });
        }

        const ip = clientIp(req);
        const existingClaims = bearerGuest(req, meeting.id);
        let guestRow = null;
        if (existingClaims) {
            guestRow = await req.db.get(
                'SELECT * FROM meeting_guests WHERE id = $1 AND meeting_id = $2',
                [existingClaims.guestId, meeting.id]
            );
        }

        // Check passcode unless guest already proved access with a valid guest token for this meeting
        if (meeting.password && !guestRow) {
            const lockWait = access.isPublicPassLocked(meeting.id, ip);
            if (lockWait) {
                return res.status(429).json({
                    error: `Too many wrong passcodes. Try again in ${Math.ceil(lockWait / 60)} min.`,
                    code: 'TOO_MANY_ATTEMPTS',
                    retryAfter: lockWait,
                });
            }
            const passInput = req.body?.passcode || '';
            if (!passInput) {
                return res.json({ action: 'passcode', ...publicSummary(meeting) });
            }
            if (!access.passcodeMatches(meeting.password, passInput)) {
                const left = access.recordPublicPassFail(meeting.id, ip);
                return res.status(403).json({
                    error: left > 0
                        ? `Wrong passcode. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`
                        : 'Wrong passcode. Try again in 15 min.',
                    code: left > 0 ? 'BAD_PASSCODE' : 'TOO_MANY_ATTEMPTS',
                    attemptsLeft: left,
                });
            }
            access.resetPublicPassFail(meeting.id, ip);
        }

        const requestedName = access.sanitizeDisplayName(req.body?.display_name || req.body?.name);
        const displayName = requestedName || guestRow?.display_name || '';
        if (displayName.length < 2) {
            return res.status(400).json({ error: 'Please enter your name (at least 2 characters).', code: 'NAME_REQUIRED' });
        }

        const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase().slice(0, 255) : '';
        const cleanEmail = rawEmail && EMAIL_RE.test(rawEmail) ? rawEmail : (guestRow?.email || null);

        if (!guestRow) {
            const guestId = access.newGuestId();
            const inserted = await req.db.run(
                `INSERT INTO meeting_guests (id, meeting_id, display_name, email, status)
                 VALUES ($1, $2, $3, $4, 'pending')
                 RETURNING *`,
                [guestId, meeting.id, displayName, cleanEmail]
            );
            guestRow = inserted.rows[0];
        } else if (requestedName && requestedName !== guestRow.display_name) {
            await req.db.run(
                `UPDATE meeting_guests SET display_name = $1, email = COALESCE($2, email), updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
                [displayName, cleanEmail, guestRow.id]
            );
            guestRow.display_name = displayName;
        }

        if (guestRow.status === 'kicked') {
            return res.json({ action: 'kicked', host_name, host_role });
        }

        if (guestRow.status === 'declined') {
            if (Number(guestRow.decline_count) >= 3) {
                return res.json({ action: 'declined', final: true, host_name, host_role });
            }
            if (guestRow.declined_until && new Date(guestRow.declined_until) > new Date()) {
                const retryAfter = Math.ceil((new Date(guestRow.declined_until).getTime() - Date.now()) / 1000);
                return res.json({ action: 'declined', retryAfter, host_name, host_role });
            }
        }

        if (meeting.is_locked && guestRow.status !== 'admitted') {
            return res.json({ action: 'locked', host_name, host_role });
        }

        const guestToken = access.signGuestToken({
            guestId: guestRow.id,
            meetingId: meeting.id,
            displayName: guestRow.display_name,
        });

        // Meeting has not been started yet by the host/admin
        if (meeting.status === 'scheduled' || meeting.status === 'waiting') {
            return res.json({
                action: 'not_started',
                status: meeting.status,
                host_name,
                host_role,
                scheduled_start: meeting.scheduled_start,
                require_approval: meeting.require_approval !== false,
                guest_token: guestToken,
                guest_id: guestRow.id,
            });
        }

        // Meeting is ACTIVE:
        // Direct entry if approval is NOT required OR this guest has already been admitted
        if (meeting.require_approval === false || guestRow.status === 'admitted') {
            await req.db.run(
                `UPDATE meeting_guests
                 SET status = 'admitted',
                     joined_at = COALESCE(joined_at, CURRENT_TIMESTAMP),
                     left_at = NULL,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [guestRow.id]
            );
            const lkToken = await access.issueGuestLiveKitToken(meeting, {
                guestId: guestRow.id,
                displayName: guestRow.display_name,
            });
            return res.json({
                action: 'join',
                token: lkToken,
                livekitUrl: access.liveKitUrl(),
                roomName: meeting.room_name,
                guest_token: guestToken,
                guest_id: guestRow.id,
                host_name,
                host_role,
                require_approval: meeting.require_approval !== false,
            });
        }

        // Approval required: place external guest in the waiting lobby
        if (guestRow.status !== 'pending') {
            await req.db.run(
                `UPDATE meeting_guests SET status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [guestRow.id]
            );
        }
        const { request, isNew } = access.lobbyAddGuest(meeting.id, {
            guestId: guestRow.id,
            displayName: guestRow.display_name,
            email: guestRow.email,
        });
        access.publishLobby(req.io, meeting);
        if (isNew) {
            const payload = {
                meetingId: meeting.id,
                code: meeting.room_name,
                title: meeting.title,
                request,
            };
            req.io?.to(access.rooms.user(meeting.teacher_id))
                .to(access.rooms.role('admin'))
                .emit('meeting:lobby-request', payload);
            access.notifyGuestJoinRequest(req.db, meeting, guestRow.display_name);
        }

        return res.json({
            action: 'lobby',
            host_name,
            host_role,
            guest_token: guestToken,
            guest_id: guestRow.id,
        });
    } catch (error) {
        console.error('POST /api/public/meetings/:code/join error:', error);
        return res.status(500).json({ error: 'Could not join the meeting' });
    }
});

/**
 * DELETE /api/public/meetings/:code/lobby
 * Authenticated by guestToken — lets a waiting guest cancel their knock cleanly.
 */
router.delete('/:code/lobby', metaLimiter, async (req, res) => {
    try {
        const meeting = await findPublicMeeting(req.db, req.params.code);
        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
        const claims = bearerGuest(req, meeting.id);
        if (!claims) return res.status(401).json({ error: 'Guest session required' });

        if (access.lobbyRemove(meeting.id, `guest:${claims.guestId}`)) {
            access.publishLobby(req.io, meeting);
        }
        return res.json({ message: 'Left waiting room' });
    } catch (error) {
        console.error('DELETE /api/public/meetings/:code/lobby error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/public/meetings/:code/leave
 * Authenticated by guestToken — records guest departure time & duration.
 */
router.post('/:code/leave', metaLimiter, async (req, res) => {
    try {
        const meeting = await findPublicMeeting(req.db, req.params.code);
        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
        const claims = bearerGuest(req, meeting.id);
        if (!claims) return res.status(401).json({ error: 'Guest session required' });

        await req.db.run(
            `UPDATE meeting_guests
             SET left_at = CURRENT_TIMESTAMP,
                 duration_minutes = CASE
                   WHEN joined_at IS NOT NULL
                   THEN GREATEST(duration_minutes, ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at)) / 60.0)::int)
                   ELSE duration_minutes
                 END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND meeting_id = $2`,
            [claims.guestId, meeting.id]
        );
        return res.json({ message: 'Left meeting' });
    } catch (error) {
        console.error('POST /api/public/meetings/:code/leave error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
