const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const access = require('../services/meetingAccess');

// ════════════════════════════════════════════════════════════════════════
// Live classes.
//
// A meeting is referenced by its code ("abc-defg-hij", also the LiveKit room)
// or, for people who already belong to it, by its numeric id. Entry rules and
// passcodes live in services/meetingAccess.js; real-time events in
// services/meetingRealtime.js.
// ════════════════════════════════════════════════════════════════════════

// All routes require authentication EXCEPT the public download-with-token
// route below which self-authenticates via a single-use signed token.
//
// Note: this MUST be mounted before `router.use(authenticateToken)` so
// the request bypasses the normal auth requirement. Inside, we still
// fetch the user from the dt token claims and apply the same access
// checks as the regular auth-protected endpoint.
router.get('/recordings/:id/download', async (req, res, next) => {
  // Two acceptance paths:
  //   1. ?dt=<download_token> — short-lived single-recording token
  //      issued by /download-token (no Authorization header needed)
  //   2. Authorization: Bearer <user_jwt> — fall through to the auth
  //      middleware below, which will reject if missing
  const dt = req.query.dt;
  if (!dt) {
    // No download token — let the normal auth middleware run.
    return next();
  }
  // We have a download token — verify it directly and skip the
  // standard auth chain.
  try {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
    const decoded = jwt.verify(String(dt), JWT_SECRET);
    if (decoded.kind !== 'recording_download') {
      return res.status(403).json({ error: 'Wrong token type' });
    }
    if (Number(decoded.recording_id) !== Number(req.params.id)) {
      return res.status(403).json({ error: 'Token not valid for this recording' });
    }

    // Re-fetch the user (some authenticateToken downstream code expects
    // req.user to be populated).
    const user = await req.db.get(
      'SELECT id, email, role, first_name, last_name, is_active FROM users WHERE id = $1',
      [decoded.user_id]
    );
    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Token user no longer valid' });
    }
    req.user = user;

    const recording = await req.db.get('SELECT * FROM meeting_recordings WHERE id = $1', [req.params.id]);
    if (!recording) return res.status(404).json({ error: 'Recording not found' });
    if (recording.status !== 'ready') return res.status(409).json({ error: 'Not yet ready' });

    const allowed = await canAccessRecording(req.db, recording, req.user);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    const meeting = await req.db.get('SELECT teacher_id FROM meetings WHERE id = $1', [recording.meeting_id]);
    if (req.user.role !== 'admin' && meeting.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the host can download' });
    }
    if (!recording.file_path || !fs.existsSync(recording.file_path)) {
      return res.status(404).json({ error: 'File missing' });
    }

    // Stat the file so the browser knows the total size and can show
    // an accurate progress bar in its download manager.
    const stat = fs.statSync(recording.file_path);

    res.setHeader('Content-Disposition', `attachment; filename="${recording.file_name || 'recording.mp4'}"`);
    res.setHeader('Content-Type', recording.mime_type || 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Accept-Ranges', 'bytes');
    fs.createReadStream(recording.file_path).pipe(res);
  } catch (e) {
    console.error('Download via token failed:', e?.message);
    return res.status(403).json({ error: 'Invalid or expired download token' });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// ── Helper: record user joining (handles reconnections) ──
async function recordJoin(db, meetingId, userId) {
  // Skip if there's already an open (not left) session for this user
  const openSession = await db.get(
    'SELECT id FROM meeting_attendance WHERE meeting_id = $1 AND user_id = $2 AND left_at IS NULL',
    [meetingId, userId]
  );
  if (openSession) return; // Already in the meeting, don't create duplicate

  // Insert a new attendance session
  await db.run(
    'INSERT INTO meeting_attendance (meeting_id, user_id, session_number) VALUES ($1, $2, 1)',
    [meetingId, userId]
  );

  // Upsert summary — set first_join only on first entry, always mark present
  await db.run(
    `INSERT INTO meeting_attendance_summary (meeting_id, user_id, status, first_join, session_count)
     VALUES ($1, $2, 'present', CURRENT_TIMESTAMP, 1)
     ON CONFLICT (meeting_id, user_id) DO UPDATE SET
       status = 'present',
       first_join = COALESCE(meeting_attendance_summary.first_join, CURRENT_TIMESTAMP),
       session_count = meeting_attendance_summary.session_count + 1,
       updated_at = CURRENT_TIMESTAMP`,
    [meetingId, userId]
  );
}

// ── Helper: record user leaving ──
async function recordLeave(db, meetingId, userId) {
  // Close the latest open session
  await db.run(
    `UPDATE meeting_attendance
     SET left_at = CURRENT_TIMESTAMP,
         duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at)) / 60.0, 2)
     WHERE id = (
       SELECT id FROM meeting_attendance
       WHERE meeting_id = $1 AND user_id = $2 AND left_at IS NULL
       ORDER BY id DESC LIMIT 1
     )`,
    [meetingId, userId]
  );

  // Update summary: duration = now - first_join (total time in meeting)
  await db.run(
    `UPDATE meeting_attendance_summary
     SET last_leave = CURRENT_TIMESTAMP,
         total_duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - first_join)) / 60.0, 2),
         updated_at = CURRENT_TIMESTAMP
     WHERE meeting_id = $1 AND user_id = $2 AND first_join IS NOT NULL`,
    [meetingId, userId]
  );
}

// ── Helper: mark absent students when meeting ends ──
async function markAbsentStudents(db, meetingId) {
  const meeting = await db.get('SELECT batch_id, started_at FROM meetings WHERE id = $1', [meetingId]);
  if (!meeting || !meeting.batch_id) return;

  // Get all students in the batch
  const batchStudents = await db.all(
    'SELECT student_id FROM batch_students WHERE batch_id = $1',
    [meeting.batch_id]
  );

  for (const bs of batchStudents) {
    // Check if they have a summary record
    const existing = await db.get(
      'SELECT id FROM meeting_attendance_summary WHERE meeting_id = $1 AND user_id = $2',
      [meetingId, bs.student_id]
    );
    if (!existing) {
      // Mark as absent
      await db.run(
        `INSERT INTO meeting_attendance_summary (meeting_id, user_id, status, total_duration_minutes, session_count)
         VALUES ($1, $2, 'absent', 0, 0)
         ON CONFLICT (meeting_id, user_id) DO NOTHING`,
        [meetingId, bs.student_id]
      );
    }
  }
}

const fail = (res, status, code, message, extra = {}) => res.status(status).json({ error: message, code, ...extra });

/** Loads the meeting named in the URL and the caller's place in it. */
async function load(req, res) {
  const meeting = await access.findMeeting(req.db, req.params.id);
  if (!meeting) { fail(res, 404, 'NOT_FOUND', 'Meeting not found'); return null; }
  const who = await access.resolveAccess(req.db, meeting, req.user);
  return { meeting, who };
}
/** Same, but only for the host. */
async function loadAsHost(req, res, { allowAdmin = false } = {}) {
  const ctx = await load(req, res);
  if (!ctx) return null;
  const ok = ctx.who.role === 'host' || (allowAdmin && req.user.role === 'admin');
  if (!ok) { fail(res, 403, 'HOST_ONLY', 'Only the host can do this'); return null; }
  return ctx;
}

const personName = u => `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Participant';
const hasJoinedBefore = async (db, meetingId, userId) =>
  !!(await db.get('SELECT 1 FROM meeting_attendance WHERE meeting_id = $1 AND user_id = $2 LIMIT 1', [meetingId, userId]));

/** Status changes only carry the id: every list re-fetches what it is allowed to see. */
const announce = (io, event, meeting) => io && io.emit(event, { meetingId: meeting.id });

// ============================================================
// MEETING CRUD
// ============================================================

// POST /meetings — create a new meeting (teacher/admin only)
router.post('/', authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, batch_id, scheduled_start, scheduled_end, max_participants } = req.body || {};
    const cleanTitle = typeof title === 'string' ? title.trim().slice(0, 300) : '';
    if (!cleanTitle) return res.status(400).json({ error: 'Title is required' });
    if (!batch_id) return res.status(400).json({ error: 'Batch is required' });
    if (!scheduled_start || !scheduled_end) return res.status(400).json({ error: 'Schedule start and end times are required' });
    const startMs = Date.parse(scheduled_start);
    const endMs = Date.parse(scheduled_end);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      return res.status(400).json({ error: 'The end time must be after the start time' });
    }
    const batch = await req.db.get('SELECT id, name FROM batches WHERE id = $1', [batch_id]);
    if (!batch) return res.status(400).json({ error: 'Batch not found' });

    const code = await access.uniqueMeetingCode(req.db);
    const passcode = access.generatePasscode();
    const cleanDescription = typeof description === 'string' && description.trim() ? description.trim().slice(0, 2000) : null;
    const limit = Math.min(Math.max(parseInt(max_participants, 10) || 50, 2), 300);

    const result = await req.db.run(
      `INSERT INTO meetings (room_name, title, description, teacher_id, batch_id, status, scheduled_start, scheduled_end, password, trusted_user_ids, max_participants)
       VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7, $8, '{}', $9) RETURNING id`,
      [code, cleanTitle, cleanDescription, req.user.id, batch.id, scheduled_start, scheduled_end, access.sealPasscode(passcode), limit]
    );
    const meetingId = result.id || result.rows?.[0]?.id;

    // Keep the timetable in sync
    try {
      await req.db.run(
        `INSERT INTO schedules (
           title, description, batch_id, teacher_id, start_time, end_time,
           type, location_mode, link, status, meeting_id
         ) VALUES ($1, $2, $3, $4, $5, $6, 'meeting', 'online', $7, 'scheduled', $8)`,
        [cleanTitle, cleanDescription, batch.id, req.user.id, scheduled_start, scheduled_end, `/app/meeting/${meetingId}`, meetingId]
      );
    } catch (schedErr) {
      console.error('Failed to sync scheduled meeting to schedules table:', schedErr.message);
    }

    if (req.io) req.io.emit('meeting:created', { meetingId });

    // Email the batch students (non-blocking)
    try {
      const students = await req.db.all(
        `SELECT u.email, u.first_name, u.last_name, u.timezone FROM users u
         JOIN batch_students bs ON u.id = bs.student_id
         WHERE bs.batch_id = $1 AND u.is_active = true`,
        [batch.id]
      );
      const { sendMeetingScheduledNotification } = require('../emails/emailService');
      const frontendBase = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');
      const teacherFullName = personName(req.user) || 'Your teacher';
      for (const student of students) {
        sendMeetingScheduledNotification({
          to: student.email,
          studentName: personName(student) || 'Student',
          meetingTitle: cleanTitle,
          teacherName: teacherFullName,
          batchName: batch.name || null,
          scheduledStart: scheduled_start || null,
          scheduledEnd: scheduled_end || null,
          description: cleanDescription,
          joinUrl: `${frontendBase}/app/meetings?focus=${meetingId}`,
          recipientTimezone: student.timezone || 'UTC',
        }).catch(err => console.error('Meeting email error:', err));
      }
    } catch (emailErr) {
      console.error('Meeting email notification error:', emailErr);
    }

    // In-app notifications for the batch (non-blocking)
    try {
      const { createBulkNotifications, getStudentsInBatches } = require('../services/notificationService');
      const studentIds = await getStudentsInBatches(req.db, [batch.id]);
      if (studentIds.length > 0) {
        await createBulkNotifications(req.db, studentIds, {
          type: 'meeting_scheduled',
          title: `Class scheduled: ${cleanTitle}`,
          message: `Starts ${new Date(scheduled_start).toLocaleString()}`,
          link: `/app/meetings?focus=${meetingId}`,
          entity_type: 'meeting',
          entity_id: meetingId,
          sender_id: req.user.id,
        });
      }
    } catch (notifyErr) {
      console.error('Notification failed (meeting_scheduled):', notifyErr.message);
    }

    const created = await access.findMeeting(req.db, meetingId);
    res.status(201).json(access.meetingView(created, { role: 'host', direct: true }, { passcode }));
  } catch (error) {
    console.error('POST /meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings — the meetings the caller belongs to (host, batch, admitted guest, or all for admins)
router.get('/', async (req, res) => {
  try {
    const { status, batch_id } = req.query;
    const params = [req.user.id];
    let where;
    if (req.user.role === 'admin') {
      where = 'WHERE 1=1';
    } else if (req.user.role === 'teacher') {
      where = 'WHERE (m.teacher_id = $1 OR b.teacher_id = $1 OR $1 = ANY(m.trusted_user_ids))';
    } else {
      where = `WHERE (m.batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $1) OR $1 = ANY(m.trusted_user_ids))`;
    }
    if (status) { params.push(status); where += ` AND m.status = $${params.length}`; }
    if (batch_id) { params.push(batch_id); where += ` AND m.batch_id = $${params.length}`; }

    const rows = await req.db.all(
      `SELECT m.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name, b.name AS batch_name,
              (b.teacher_id = $1) AS is_batch_teacher,
              EXISTS (SELECT 1 FROM batch_students bs WHERE bs.batch_id = m.batch_id AND bs.student_id = $1) AS is_member,
              (SELECT COUNT(DISTINCT user_id) FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.user_id != m.teacher_id) AS participant_count,
              EXTRACT(EPOCH FROM (m.scheduled_start - NOW()))::bigint AS seconds_until_start,
              EXTRACT(EPOCH FROM (m.scheduled_end   - NOW()))::bigint AS seconds_until_end
       FROM meetings m
       LEFT JOIN users u ON m.teacher_id = u.id
       LEFT JOIN batches b ON m.batch_id = b.id
       ${where}
       ORDER BY m.created_at DESC`,
      params
    );

    const uid = Number(req.user.id);
    const out = [];
    for (const m of rows) {
      const role = Number(m.teacher_id) === uid ? 'host'
        : req.user.role === 'admin' ? 'admin'
        : m.is_batch_teacher ? 'teacher'
        : m.is_member ? 'member'
        : 'guest';
      const passcode = role === 'host' && m.status !== 'ended' ? await access.ensurePasscode(req.db, m) : undefined;
      const { password, trusted_user_ids, kicked_user_ids, is_member, is_batch_teacher, ...safe } = m;
      out.push({ ...safe, code: m.room_name, my_role: role, ...(passcode ? { passcode } : {}) });
    }
    res.json(out);
  } catch (error) {
    console.error('GET /meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/attendance-dashboard — attendance dashboard (MUST be before /:id)
router.get('/attendance-dashboard', async (req, res) => {
  try {
    const { batch_id } = req.query;
    const params = [];
    let idx = 1;
    let wh = '';

    if (req.user.role === 'teacher') {
      wh = `WHERE m.teacher_id = $${idx++}`;
      params.push(req.user.id);
    } else if (req.user.role === 'student') {
      wh = `WHERE m.batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $${idx++})`;
      params.push(req.user.id);
    } else {
      wh = 'WHERE 1=1';
    }
    if (batch_id) {
      wh += ` AND m.batch_id = $${idx++}`;
      params.push(batch_id);
    }

    const totalMeetings = await req.db.get(
      `SELECT COUNT(*) as count FROM meetings m ${wh} AND m.status = 'ended'`, params
    );

    const recentMeetings = await req.db.all(
      `SELECT m.id, m.title, m.started_at, m.ended_at, m.batch_id, b.name as batch_name,
        COUNT(CASE WHEN mas.status = 'present' AND mas.user_id != m.teacher_id THEN 1 END) as present,
        COUNT(CASE WHEN mas.status = 'absent' AND mas.user_id != m.teacher_id THEN 1 END) as absent,
        COUNT(CASE WHEN mas.user_id != m.teacher_id THEN mas.id END) as total
       FROM meetings m
       LEFT JOIN meeting_attendance_summary mas ON m.id = mas.meeting_id
       LEFT JOIN batches b ON m.batch_id = b.id
       ${wh} AND m.status = 'ended'
       GROUP BY m.id, m.title, m.started_at, m.ended_at, m.batch_id, b.name
       ORDER BY m.started_at DESC LIMIT 20`, params
    );

    let studentStats = [];
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      studentStats = await req.db.all(
        `SELECT u.id, u.first_name, u.last_name, u.email,
          COUNT(CASE WHEN mas.status = 'present' THEN 1 END) as present_count,
          COUNT(CASE WHEN mas.status = 'absent' THEN 1 END) as absent_count,
          COUNT(mas.id) as total_meetings,
          COALESCE(SUM(mas.total_duration_minutes), 0) as total_minutes
         FROM users u
         JOIN batch_students bs ON u.id = bs.student_id
         JOIN meetings m ON m.batch_id = bs.batch_id
         LEFT JOIN meeting_attendance_summary mas ON mas.meeting_id = m.id AND mas.user_id = u.id
         ${wh} AND m.status = 'ended'
         GROUP BY u.id, u.first_name, u.last_name, u.email
         ORDER BY u.first_name ASC`, params
      );
    }

    res.json({
      totalMeetings: parseInt(totalMeetings?.count) || 0,
      recentMeetings,
      studentStats,
    });
  } catch (error) {
    console.error('GET /meetings/attendance-dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/verify — "Join with a meeting ID": checks the ID (and the passcode
// when the caller needs one) before opening the pre-join screen. MUST be before /:id.
router.post('/verify', async (req, res) => {
  try {
    const uid = req.user.id;
    if (!access.allowHit(`verify:${uid}`, 20, 10 * 60 * 1000)) {
      return fail(res, 429, 'RATE_LIMITED', 'Too many attempts. Try again in a few minutes.');
    }
    const ref = access.normalizeRef(req.body?.meetingId);
    if (!ref || access.isNumericRef(ref)) return fail(res, 404, 'NOT_FOUND', 'No meeting has this ID. Check it and try again.');
    const meeting = await access.findMeeting(req.db, ref);
    if (!meeting) return fail(res, 404, 'NOT_FOUND', 'No meeting has this ID. Check it and try again.');
    const who = await access.resolveAccess(req.db, meeting, req.user);
    if (who.role === 'kicked') return fail(res, 403, 'KICKED', 'The host removed you from this meeting.');
    if (meeting.status === 'ended') return fail(res, 410, 'ENDED', 'This meeting has already ended.');

    if (!who.direct) {
      const wait = access.passcodeLock(meeting.id, uid);
      if (wait) return fail(res, 429, 'TOO_MANY_ATTEMPTS', `Too many wrong passcodes. Try again in ${Math.ceil(wait / 60)} min.`, { retryAfter: wait });
      if (!access.passcodeMatches(meeting.password, req.body?.passcode)) {
        const left = access.passcodeFailed(meeting.id, uid);
        return fail(res, 403, 'BAD_PASSCODE', left > 0 ? `Wrong passcode. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.` : 'Wrong passcode. Try again in 15 min.', { attemptsLeft: left });
      }
      access.passcodeOk(meeting.id, uid);
      access.markVerified(meeting.id, uid);
    }
    res.json({ code: meeting.room_name, title: meeting.title, status: meeting.status, direct: who.direct });
  } catch (error) {
    console.error('POST /meetings/verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/join-by-room/:roomName — legacy share links (MUST be before /:id)
router.get('/join-by-room/:roomName', async (req, res) => {
  try {
    if (!access.allowHit(`lookup:${req.user.id}`, 60, 10 * 60 * 1000)) return fail(res, 429, 'RATE_LIMITED', 'Too many requests');
    const meeting = await req.db.get('SELECT id, room_name FROM meetings WHERE room_name = $1', [String(req.params.roomName).slice(0, 100)]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ code: meeting.room_name });
  } catch (error) {
    console.error('GET /meetings/join-by-room/:roomName error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/:id — one meeting, by code (anyone signed in) or by numeric id (members only)
router.get('/:id', async (req, res) => {
  try {
    const ref = access.normalizeRef(req.params.id);
    const meeting = await access.findMeeting(req.db, ref);
    const who = meeting ? await access.resolveAccess(req.db, meeting, req.user) : null;
    // Numeric ids are guessable: they only open meetings you already belong to.
    const visible = meeting && (!access.isNumericRef(ref) || who.direct || who.role === 'kicked');
    if (!visible) {
      if (!access.allowHit(`miss:${req.user.id}`, 30, 10 * 60 * 1000)) return fail(res, 429, 'RATE_LIMITED', 'Too many requests');
      return fail(res, 404, 'NOT_FOUND', 'Meeting not found');
    }
    const extra = {};
    if (who.role === 'host') extra.passcode = meeting.status === 'ended' ? access.openPasscode(meeting.password) : await access.ensurePasscode(req.db, meeting);
    if (!who.direct) {
      extra.waiting = access.lobbyHas(meeting.id, req.user.id);
      extra.verified = access.isVerified(meeting.id, req.user.id);
    }
    res.json(access.meetingView(meeting, who, extra));
  } catch (error) {
    console.error('GET /meetings/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /meetings/:id — update meeting (teacher who created it only)
router.put('/:id', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res, { allowAdmin: true });
    if (!ctx) return;
    const { meeting } = ctx;

    const { title, description, scheduled_start, scheduled_end, max_participants } = req.body || {};

    // Build a list of human-readable changes for the email
    const changes = [];
    if (title !== undefined && title !== meeting.title) {
      changes.push(`Title: ${meeting.title} → ${title}`);
    }
    if (description !== undefined && description !== meeting.description) {
      changes.push('Description updated');
    }
    if (scheduled_start !== undefined && scheduled_start !== meeting.scheduled_start) {
      changes.push('Start time updated');
    }
    if (scheduled_end !== undefined && scheduled_end !== meeting.scheduled_end) {
      changes.push('End time updated');
    }

    await req.db.run(
      `UPDATE meetings SET title = COALESCE($1, title), description = COALESCE($2, description),
       scheduled_start = COALESCE($3, scheduled_start), scheduled_end = COALESCE($4, scheduled_end),
       max_participants = COALESCE($5, max_participants), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [title, description, scheduled_start, scheduled_end, max_participants, meeting.id]
    );

    // Keep linked schedule in sync
    try {
      const current = await req.db.get('SELECT * FROM meetings WHERE id = $1', [meeting.id]);
      if (current && current.scheduled_start) {
        const endTime = current.scheduled_end || new Date(new Date(current.scheduled_start).getTime() + 60 * 60 * 1000).toISOString();
        const existingSched = await req.db.get('SELECT id FROM schedules WHERE meeting_id = $1', [meeting.id]);
        if (existingSched) {
          await req.db.run(
            `UPDATE schedules SET
               title = $1, description = $2, start_time = $3, end_time = $4,
               batch_id = $5, link = $6
             WHERE meeting_id = $7`,
            [current.title, current.description, current.scheduled_start, endTime, current.batch_id || null, `/app/meeting/${current.id}`, meeting.id]
          );
        } else {
          await req.db.run(
            `INSERT INTO schedules (
               title, description, batch_id, teacher_id, start_time, end_time,
               type, location_mode, link, status, meeting_id
             ) VALUES ($1, $2, $3, $4, $5, $6, 'meeting', 'online', $7, 'scheduled', $8)`,
            [current.title, current.description, current.batch_id || null, current.teacher_id, current.scheduled_start, endTime, `/app/meeting/${current.id}`, current.id]
          );
        }
      }
    } catch (schedUpErr) {
      console.error('Failed to update synced meeting schedule:', schedUpErr.message);
    }

    // Send update email to batch students if anything substantive changed
    if (meeting.batch_id && changes.length > 0) {
      try {
        const updated = await req.db.get('SELECT * FROM meetings WHERE id = $1', [meeting.id]);
        const students = await req.db.all(
          `SELECT u.email, u.first_name, u.last_name, u.timezone FROM users u
           JOIN batch_students bs ON u.id = bs.student_id
           WHERE bs.batch_id = $1 AND u.is_active = true`,
          [meeting.batch_id]
        );
        const { sendMeetingUpdate } = require('../emails/emailService');
        const batch = await req.db.get('SELECT name FROM batches WHERE id = $1', [meeting.batch_id]);
        const frontendBase = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');
        const teacherFullName = personName(req.user) || 'Your teacher';
        for (const student of students) {
          sendMeetingUpdate({
            to: student.email,
            studentName: personName(student) || 'Student',
            meetingTitle: updated.title,
            teacherName: teacherFullName,
            batchName: batch?.name || null,
            // Use ISO timestamps so the template can format in recipient's tz
            date: updated.scheduled_start || null,
            startTime: updated.scheduled_start || null,
            endTime: updated.scheduled_end || null,
            locationMode: 'online',
            link: `${frontendBase}/app/meetings?focus=${updated.id}`,
            description: updated.description || null,
            changes,
            recipientTimezone: student.timezone || 'UTC',
          }).catch(err => console.error('Meeting update email error:', err));
        }
      } catch (emailErr) {
        console.error('Meeting update email batch error:', emailErr);
      }
    }

    res.json({ message: 'Meeting updated' });
  } catch (error) {
    console.error('PUT /meetings/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /meetings/:id — delete meeting
router.delete('/:id', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res, { allowAdmin: true });
    if (!ctx) return;
    const { meeting } = ctx;

    // Capture batch students before delete so we can email them
    let students = [];
    let batch = null;
    if (meeting.batch_id) {
      try {
        students = await req.db.all(
          `SELECT u.email, u.first_name, u.last_name, u.timezone FROM users u
           JOIN batch_students bs ON u.id = bs.student_id
           WHERE bs.batch_id = $1 AND u.is_active = true`,
          [meeting.batch_id]
        );
        batch = await req.db.get('SELECT name FROM batches WHERE id = $1', [meeting.batch_id]);
      } catch (e) {
        console.error('Failed to fetch batch students for cancellation:', e.message);
      }
    }

    await req.db.run('DELETE FROM schedules WHERE meeting_id = $1', [meeting.id]).catch(() => {});
    await req.db.run('DELETE FROM meetings WHERE id = $1', [meeting.id]);
    access.lobbyClear(meeting.id);
    if (meeting.status === 'active') access.closeLiveKitRoom(meeting);
    announce(req.io, 'meeting:ended', meeting);

    // Send cancellation email to batch students (only for scheduled or upcoming meetings)
    if (students.length > 0 && (meeting.status === 'scheduled' || meeting.status === 'waiting')) {
      try {
        const { sendMeetingCancellation } = require('../emails/emailService');
        const teacherFullName = personName(req.user) || 'Your teacher';
        for (const student of students) {
          sendMeetingCancellation({
            to: student.email,
            studentName: personName(student) || 'Student',
            meetingTitle: meeting.title,
            teacherName: teacherFullName,
            batchName: batch?.name || null,
            originalDate: meeting.scheduled_start || null,
            originalStartTime: meeting.scheduled_start || null,
            originalEndTime: meeting.scheduled_end || null,
            locationMode: 'online',
            link: null,
            reason: 'The class has been cancelled by your teacher.',
            recipientTimezone: student.timezone || 'UTC',
          }).catch(err => console.error('Meeting cancel email error:', err));
        }
      } catch (emailErr) {
        console.error('Meeting cancellation email batch error:', emailErr);
      }
    }

    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    console.error('DELETE /meetings/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/passcode — host issues a new passcode (the old one stops working)
router.post('/:id/passcode', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const passcode = access.generatePasscode();
    await req.db.run('UPDATE meetings SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [access.sealPasscode(passcode), ctx.meeting.id]);
    res.json({ passcode });
  } catch (error) {
    console.error('POST /meetings/:id/passcode error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// MEETING LIFECYCLE
// ============================================================

// POST /meetings/:id/start — teacher starts the meeting (waiting → active)
router.post('/:id/start', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const { meeting } = ctx;
    if (meeting.status === 'ended') return fail(res, 409, 'ENDED', 'This meeting has already ended');

    await req.db.run(
      `UPDATE meetings SET status = 'active', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [meeting.id]
    );
    const wasActive = meeting.status === 'active';
    meeting.status = 'active';

    const token = await access.liveKitToken(meeting, req.user, ctx.who);
    announce(req.io, 'meeting:started', meeting);

    // Tell the batch the class is live (first start only)
    if (meeting.batch_id && !wasActive) {
      try {
        const { createBulkNotifications, getStudentsInBatches } = require('../services/notificationService');
        const studentIds = await getStudentsInBatches(req.db, [meeting.batch_id]);
        if (studentIds.length > 0) {
          await createBulkNotifications(req.db, studentIds, {
            type: 'meeting_started',
            title: `Class is Live: ${meeting.title}`,
            message: `${personName(req.user)} has started the class. Click to join now!`,
            link: `/app/meetings?focus=${meeting.id}`,
            entity_type: 'meeting',
            entity_id: meeting.id,
            sender_id: req.user.id,
          });
        }
      } catch (notifyErr) {
        console.error('Notification failed (meeting_started):', notifyErr.message);
      }
    }

    await recordJoin(req.db, meeting.id, req.user.id);
    res.json({ token, livekitUrl: access.liveKitUrl(), roomName: meeting.room_name, role: 'host' });
  } catch (error) {
    console.error('POST /meetings/:id/start error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/prepare — teacher enters pre-start screen (scheduled → waiting)
router.post('/:id/prepare', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const { meeting } = ctx;
    if (meeting.status !== 'scheduled') return res.json({ message: 'Meeting already opened', status: meeting.status });

    await req.db.run(`UPDATE meetings SET status = 'waiting', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [meeting.id]);
    announce(req.io, 'meeting:waiting', meeting);
    res.json({ message: 'Meeting is now in waiting state', status: 'waiting' });
  } catch (error) {
    console.error('POST /meetings/:id/prepare error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/end — teacher ends the meeting
router.post('/:id/end', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res, { allowAdmin: true });
    if (!ctx) return;
    const { meeting } = ctx;

    // Auto-stop any active recording for this meeting (best-effort)
    try {
      const active = await req.db.get(
        `SELECT id, egress_id FROM meeting_recordings
         WHERE meeting_id = $1 AND status IN ('starting', 'recording')
         ORDER BY id DESC LIMIT 1`,
        [meeting.id]
      );
      if (active && active.egress_id) {
        await recordingService.stopRecording(active.egress_id).catch(err =>
          console.warn(`[meetings/end] auto-stop egress failed for ${active.egress_id}:`, err.message)
        );
        await req.db.run(
          `UPDATE meeting_recordings
           SET status = 'finalizing', ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [active.id]
        );
      }
    } catch (recErr) {
      console.warn('[meetings/end] recording auto-stop step error:', recErr.message);
    }

    await req.db.run(
      `UPDATE meetings SET status = 'ended', ended_at = CURRENT_TIMESTAMP, is_recording = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [meeting.id]
    );

    // Mark linked schedule as completed
    await req.db.run(
      `UPDATE schedules SET status = 'completed' WHERE meeting_id = $1`,
      [meeting.id]
    ).catch(e => console.warn('[meetings/end] update schedules status failed:', e.message));

    // Bulk close all open attendance sessions
    await req.db.run(
      `UPDATE meeting_attendance
       SET left_at = CURRENT_TIMESTAMP,
           duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at)) / 60.0, 2)
       WHERE meeting_id = $1 AND left_at IS NULL`,
      [meeting.id]
    );

    // Update all summaries: duration = last_leave - first_join
    await req.db.run(
      `UPDATE meeting_attendance_summary
       SET last_leave = CURRENT_TIMESTAMP,
           total_duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - first_join)) / 60.0, 2),
           updated_at = CURRENT_TIMESTAMP
       WHERE meeting_id = $1 AND first_join IS NOT NULL`,
      [meeting.id]
    );

    // Mark absent students (fire and forget for speed)
    markAbsentStudents(req.db, meeting.id).catch(() => {});

    // Everyone waiting is told, then the video room is closed server-side
    access.lobbyClear(meeting.id);
    await access.settleJoinRequests(req.db, meeting);
    announce(req.io, 'meeting:ended', meeting);
    access.closeLiveKitRoom(meeting);

    // Get summary
    const attendees = await req.db.all(
      'SELECT COUNT(DISTINCT user_id) as count FROM meeting_attendance WHERE meeting_id = $1',
      [meeting.id]
    );
    const durRow = await req.db.get(
      "SELECT ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) / 60.0) as dur FROM meetings WHERE id = $1",
      [meeting.id]
    );
    const duration = durRow?.dur || 0;

    res.json({ message: 'Meeting ended', duration, participantCount: attendees[0]?.count || 0 });
  } catch (error) {
    console.error('POST /meetings/:id/end error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/lock — toggle meeting lock (no one new can join)
router.post('/:id/lock', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const { meeting } = ctx;

    const newLocked = !meeting.is_locked;
    await req.db.run('UPDATE meetings SET is_locked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newLocked, meeting.id]);

    if (req.io) {
      req.io.to(access.rooms.participants(meeting.id)).to(access.rooms.lobby(meeting.id))
        .emit('meeting:lockChanged', { meetingId: meeting.id, isLocked: newLocked });
    }
    res.json({ is_locked: newLocked });
  } catch (error) {
    console.error('POST /meetings/:id/lock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// JOIN FLOW
//   insiders (host, admins, batch students & teacher, admitted guests) → straight in
//   everyone else → passcode → lobby → the host admits or denies
// ============================================================

// POST /meetings/:id/join   body: { passcode? }
router.post('/:id/join', async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx) return;
    const { meeting, who } = ctx;
    const uid = req.user.id;

    if (meeting.status === 'ended') return res.json({ action: 'ended' });
    if (who.role === 'kicked') return res.json({ action: 'kicked' });

    if (!who.direct) {
      // ── Guests: passcode first ──
      const wait = access.passcodeLock(meeting.id, uid);
      if (wait) return fail(res, 429, 'TOO_MANY_ATTEMPTS', `Too many wrong passcodes. Try again in ${Math.ceil(wait / 60)} min.`, { retryAfter: wait });
      const alreadyVerified = access.lobbyHas(meeting.id, uid) || access.isVerified(meeting.id, uid);
      if (!alreadyVerified) {
        if (!req.body?.passcode) return res.json({ action: 'passcode' });
        if (!access.passcodeMatches(meeting.password, req.body.passcode)) {
          const left = access.passcodeFailed(meeting.id, uid);
          return fail(res, 403, 'BAD_PASSCODE', left > 0 ? `Wrong passcode. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.` : 'Wrong passcode. Try again in 15 min.', { attemptsLeft: left });
        }
        access.passcodeOk(meeting.id, uid);
        access.markVerified(meeting.id, uid);
      }

      const denied = access.denialWait(meeting.id, uid);
      if (denied === null) return res.json({ action: 'declined', final: true });
      if (denied > 0) return res.json({ action: 'declined', retryAfter: denied });

      if (meeting.status === 'scheduled') return res.json({ action: 'not_ready' });
      if (meeting.status === 'waiting') return res.json({ action: 'waiting' });
      if (meeting.is_locked) return res.json({ action: 'locked' });

      // ── Knock: the host sees it live, and in the notification bell ──
      const { isNew } = access.lobbyAdd(meeting.id, req.user, 'passcode');
      access.publishLobby(req.io, meeting);
      if (isNew) {
        const request = { userId: uid, userName: personName(req.user), role: req.user.role };
        req.io?.to(access.rooms.user(meeting.teacher_id)).emit('meeting:lobby-request', {
          meetingId: meeting.id, code: meeting.room_name, title: meeting.title, request,
        });
        access.notifyJoinRequest(req.db, meeting, req.user);
      }
      return res.json({ action: 'lobby' });
    }

    // ── Insiders ──
    if (who.role === 'host' && meeting.status !== 'active') return res.json({ action: 'start' });
    if (meeting.status === 'scheduled') return res.json({ action: 'not_ready' });
    if (meeting.status === 'waiting') return res.json({ action: 'waiting' });
    // A locked class keeps out newcomers; people who were already in can come back.
    if (meeting.is_locked && !['host', 'admin'].includes(who.role) && !(await hasJoinedBefore(req.db, meeting.id, uid))) {
      return res.json({ action: 'locked' });
    }

    const token = await access.liveKitToken(meeting, req.user, who);
    await recordJoin(req.db, meeting.id, uid);
    res.json({ action: 'join', token, livekitUrl: access.liveKitUrl(), roomName: meeting.room_name, role: who.role });
  } catch (error) {
    console.error('POST /meetings/:id/join error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/:id/lobby — host: who is waiting
router.get('/:id/lobby', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    res.json({ pending: access.lobbyList(ctx.meeting.id) });
  } catch (error) {
    console.error('GET /meetings/:id/lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /meetings/:id/lobby — a guest stops waiting
router.delete('/:id/lobby', async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx) return;
    if (access.lobbyRemove(ctx.meeting.id, req.user.id)) {
      access.publishLobby(req.io, ctx.meeting);
      await access.settleJoinRequests(req.db, ctx.meeting, [req.user.id]);
    }
    res.json({ message: 'Left the lobby' });
  } catch (error) {
    console.error('DELETE /meetings/:id/lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** Admits people who are waiting: they become guests of this meeting (rejoin without asking again). */
async function admit(req, meeting, userIds) {
  const waiting = userIds.map(Number).filter(id => access.lobbyHas(meeting.id, id));
  if (waiting.length === 0) return [];
  await req.db.run(
    `UPDATE meetings
     SET trusted_user_ids = ARRAY(SELECT DISTINCT unnest(COALESCE(trusted_user_ids, '{}') || $1::int[])),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [waiting, meeting.id]
  );
  for (const id of waiting) {
    access.lobbyRemove(meeting.id, id);
    access.clearDenials(meeting.id, id);
    // No token travels over the socket: the guest's app calls /join again and is now let in.
    req.io?.to(access.rooms.user(id)).emit('meeting:admitted', { meetingId: meeting.id });
  }
  await access.settleJoinRequests(req.db, meeting, waiting);
  access.publishLobby(req.io, meeting);
  return waiting;
}

// POST /meetings/:id/admit   body: { user_id }
router.post('/:id/admit', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const done = await admit(req, ctx.meeting, [req.body?.user_id]);
    if (done.length === 0) return fail(res, 404, 'NOT_WAITING', 'This person is no longer waiting');
    res.json({ admitted: done });
  } catch (error) {
    console.error('POST /meetings/:id/admit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/admit-all
router.post('/:id/admit-all', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const done = await admit(req, ctx.meeting, access.lobbyList(ctx.meeting.id).map(r => r.userId));
    res.json({ admitted: done });
  } catch (error) {
    console.error('POST /meetings/:id/admit-all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/decline   body: { user_id }
router.post('/:id/decline', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const { meeting } = ctx;
    const userId = Number(req.body?.user_id);
    if (!access.lobbyRemove(meeting.id, userId)) return fail(res, 404, 'NOT_WAITING', 'This person is no longer waiting');
    access.recordDenial(meeting.id, userId);
    req.io?.to(access.rooms.user(userId)).emit('meeting:declined', { meetingId: meeting.id });
    await access.settleJoinRequests(req.db, meeting, [userId]);
    access.publishLobby(req.io, meeting);
    res.json({ message: 'Request declined' });
  } catch (error) {
    console.error('POST /meetings/:id/decline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/kick — host removes someone (disconnected server-side, cannot rejoin)
router.post('/:id/kick', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const { meeting } = ctx;
    const userId = Number(req.body?.user_id);
    if (!userId || userId === Number(meeting.teacher_id)) return fail(res, 400, 'BAD_TARGET', 'This participant cannot be removed');

    await req.db.run(
      `UPDATE meetings
       SET kicked_user_ids = ARRAY(SELECT DISTINCT unnest(COALESCE(kicked_user_ids, '{}') || ARRAY[$1::int])),
           trusted_user_ids = array_remove(COALESCE(trusted_user_ids, '{}'), $1::int),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [userId, meeting.id]
    );
    access.lobbyRemove(meeting.id, userId);
    await access.removeFromLiveKit(meeting, userId);
    await recordLeave(req.db, meeting.id, userId);

    if (req.io) {
      req.io.to(access.rooms.user(userId)).emit('meeting:kicked', { meetingId: meeting.id });
      req.io.in(access.rooms.user(userId)).socketsLeave([access.rooms.participants(meeting.id), access.rooms.lobby(meeting.id)]);
    }
    res.json({ message: 'Participant removed' });
  } catch (error) {
    console.error('POST /meetings/:id/kick error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/leave — user leaves meeting (records attendance)
router.post('/:id/leave', async (req, res) => {
  try {
    const meeting = await access.findMeeting(req.db, req.params.id);
    if (meeting) await recordLeave(req.db, meeting.id, req.user.id);
    res.json({ message: 'Left meeting' });
  } catch (error) {
    console.error('POST /meetings/:id/leave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ATTENDANCE
// ============================================================

// GET /meetings/:id/attendance — attendance summary (host and admins only)
router.get('/:id/attendance', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res, { allowAdmin: true });
    if (!ctx) return;
    const meeting = ctx.meeting;

    // Get summary (present + absent) — exclude teacher
    const summary = await req.db.all(
      `SELECT mas.*, u.first_name, u.last_name, u.email, u.role
       FROM meeting_attendance_summary mas
       JOIN users u ON mas.user_id = u.id
       WHERE mas.meeting_id = $1 AND mas.user_id != $2
       ORDER BY mas.status ASC, u.first_name ASC`,
      [meeting.id, meeting.teacher_id || 0]
    );

    // Get detailed sessions — exclude teacher
    const sessions = await req.db.all(
      `SELECT ma.*, u.first_name, u.last_name
       FROM meeting_attendance ma
       JOIN users u ON ma.user_id = u.id
       WHERE ma.meeting_id = $1 AND ma.user_id != $2
       ORDER BY ma.joined_at ASC`,
      [meeting.id, meeting.teacher_id || 0]
    );

    const durRow = meeting.started_at && meeting.ended_at
      ? await req.db.get(
          'SELECT ROUND(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60.0) as dur FROM meetings WHERE id = $1',
          [meeting.id]
        )
      : null;
    const meetingDuration = durRow?.dur || 0;

    const presentCount = summary.filter(s => s.status === 'present').length;
    const absentCount = summary.filter(s => s.status === 'absent').length;

    // Get teacher info separately
    const teacherInfo = await req.db.get(
      `SELECT mas.first_join, mas.last_leave, mas.total_duration_minutes, u.first_name, u.last_name
       FROM meeting_attendance_summary mas
       JOIN users u ON mas.user_id = u.id
       WHERE mas.meeting_id = $1 AND mas.user_id = $2`,
      [meeting.id, meeting.teacher_id || 0]
    );

    res.json({
      summary,
      sessions,
      teacher: teacherInfo ? {
        name: `${teacherInfo.first_name} ${teacherInfo.last_name}`,
        first_join: teacherInfo.first_join,
        last_leave: teacherInfo.last_leave,
        duration: teacherInfo.total_duration_minutes,
      } : null,
      stats: {
        total: summary.length,
        present: presentCount,
        absent: absentCount,
        meetingDuration,
        meetingTitle: meeting.title,
      }
    });
  } catch (error) {
    console.error('GET /meetings/:id/attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// POLLS
// ============================================================

// POST /meetings/:id/polls — create a poll
router.post('/:id/polls', async (req, res) => {
  try {
    const ctx = await loadAsHost(req, res);
    if (!ctx) return;
    const { meeting } = ctx;
    const question = typeof req.body?.question === 'string' ? req.body.question.trim().slice(0, 200) : '';
    const options = (Array.isArray(req.body?.options) ? req.body.options : [])
      .map(o => (typeof o === 'string' ? o.trim().slice(0, 120) : ''))
      .filter(Boolean)
      .slice(0, 8);
    if (!question || options.length < 2) return res.status(400).json({ error: 'A question and at least two options are required' });

    const result = await req.db.run(
      'INSERT INTO meeting_polls (meeting_id, question, options) VALUES ($1, $2, $3) RETURNING *',
      [meeting.id, question, JSON.stringify(options)]
    );

    const pollData = {
      id: result.id || result.lastID,
      meeting_id: meeting.id,
      question,
      options,
      is_active: true,
    };

    if (req.io) {
      req.io.to(access.rooms.participants(meeting.id)).emit('poll:created', pollData);
    }

    res.status(201).json(pollData);
  } catch (error) {
    console.error('POST /meetings/:id/polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /polls/:pollId/vote — vote on a poll (participants of that meeting only)
router.post('/polls/:pollId/vote', async (req, res) => {
  try {
    const poll = await req.db.get('SELECT * FROM meeting_polls WHERE id = $1', [req.params.pollId]);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (!poll.is_active) return res.status(400).json({ error: 'Poll is closed' });

    const meeting = await access.findMeeting(req.db, poll.meeting_id);
    const who = await access.resolveAccess(req.db, meeting, req.user);
    if (!meeting || !who.direct || meeting.status !== 'active') return res.status(403).json({ error: 'Forbidden' });

    let options = [];
    try { options = typeof poll.options === 'string' ? JSON.parse(poll.options) : (poll.options || []); } catch { options = []; }
    const optionIndex = Number(req.body?.option_index);
    if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= options.length) {
      return res.status(400).json({ error: 'Invalid option' });
    }

    await req.db.run(
      `INSERT INTO meeting_poll_votes (poll_id, user_id, option_index) VALUES ($1, $2, $3)
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option_index = $3`,
      [poll.id, req.user.id, optionIndex]
    );

    // Get updated vote counts
    const votes = await req.db.all(
      'SELECT option_index, COUNT(*) as count FROM meeting_poll_votes WHERE poll_id = $1 GROUP BY option_index',
      [poll.id]
    );

    // Live results go to the host only (students see results when the poll closes)
    if (req.io) {
      req.io.to(access.rooms.hosts(poll.meeting_id)).emit('poll:updated', { pollId: poll.id, votes });
    }

    res.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('POST /polls/:pollId/vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /polls/:pollId/close — close a poll
router.post('/polls/:pollId/close', async (req, res) => {
  try {
    const poll = await req.db.get(
      `SELECT p.*, m.teacher_id FROM meeting_polls p JOIN meetings m ON p.meeting_id = m.id WHERE p.id = $1`,
      [req.params.pollId]
    );
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (poll.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can close polls' });

    await req.db.run(
      'UPDATE meeting_polls SET is_active = false, show_results = true WHERE id = $1',
      [req.params.pollId]
    );

    // Get vote counts
    const votes = await req.db.all(
      'SELECT option_index, COUNT(*) as count FROM meeting_poll_votes WHERE poll_id = $1 GROUP BY option_index',
      [req.params.pollId]
    );

    // Get detailed voter info (who voted what)
    const voters = await req.db.all(
      `SELECT v.option_index, u.id as user_id, u.first_name, u.last_name
       FROM meeting_poll_votes v JOIN users u ON v.user_id = u.id
       WHERE v.poll_id = $1 ORDER BY v.option_index, u.first_name`,
      [req.params.pollId]
    );

    const totalVotes = votes.reduce((s, v) => s + parseInt(v.count), 0);

    // Parse options
    let options = [];
    try { options = typeof poll.options === 'string' ? JSON.parse(poll.options) : (poll.options || []); } catch { options = []; }

    const closedPollData = {
      id: poll.id,
      question: poll.question,
      options,
      votes,
      voters,
      totalVotes,
    };

    if (req.io) {
      req.io.to(access.rooms.participants(poll.meeting_id)).emit('poll:closed', { pollId: poll.id });
    }

    res.json(closedPollData);
  } catch (error) {
    console.error('POST /polls/:pollId/close error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/:id/polls — the host gets every poll with results; participants
// only the poll that is open right now (so late joiners can still answer).
router.get('/:id/polls', async (req, res) => {
  try {
    const ctx = await load(req, res);
    if (!ctx) return;
    const { meeting, who } = ctx;
    if (!who.direct) return res.status(403).json({ error: 'Forbidden' });
    const host = who.role === 'host' || req.user.role === 'admin';

    const polls = await req.db.all(
      `SELECT * FROM meeting_polls WHERE meeting_id = $1 ${host ? '' : 'AND is_active = true'} ORDER BY created_at DESC`,
      [meeting.id]
    );
    if (!host) {
      const mine = await req.db.all(
        'SELECT poll_id, option_index FROM meeting_poll_votes WHERE user_id = $1 AND poll_id = ANY($2::int[])',
        [req.user.id, polls.map(p => p.id)]
      );
      return res.json(polls.map(p => ({
        id: p.id, question: p.question, options: p.options, is_active: true,
        my_vote: mine.find(v => v.poll_id === p.id)?.option_index ?? null,
      })));
    }
    for (const poll of polls) {
      poll.votes = await req.db.all(
        'SELECT option_index, COUNT(*) as count FROM meeting_poll_votes WHERE poll_id = $1 GROUP BY option_index',
        [poll.id]
      );
      poll.total_votes = await req.db.get(
        'SELECT COUNT(DISTINCT user_id) as count FROM meeting_poll_votes WHERE poll_id = $1',
        [poll.id]
      );
    }
    res.json(polls);
  } catch (error) {
    console.error('GET /meetings/:id/polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// Recordings (LiveKit Egress)
// ============================================================
const recordingService = require('../services/recordingService');
const fs = require('fs');
const fsPromises = require('fs').promises;

// Helper: can a user access a recording for streaming/download?
//
// Mirrors the listing logic in GET /recordings/list:
//   • admin → always
//   • teacher → owns the meeting OR personally started the recording
//   • student → enrolled in the meeting's batch (regardless of attendance)
async function canAccessRecording(db, recording, user) {
  if (!recording) return false;
  if (user.role === 'admin') return true;

  const meeting = await db.get('SELECT teacher_id, batch_id FROM meetings WHERE id = $1', [recording.meeting_id]);
  if (!meeting) return false;

  if (user.role === 'teacher') {
    if (meeting.teacher_id === user.id) return true;
    if (recording.started_by === user.id) return true;
    return false;
  }

  if (user.role === 'student' && meeting.batch_id) {
    const link = await db.get(
      'SELECT 1 FROM batch_students WHERE batch_id = $1 AND student_id = $2',
      [meeting.batch_id, user.id]
    );
    if (link) return true;
  }
  return false;
}

// POST /meetings/:id/recording/start  — host starts recording
router.post('/:id/recording/start', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the host can start recording' });
    }
    if (meeting.status !== 'active') {
      return res.status(400).json({ error: 'Meeting must be active to record' });
    }

    // ── Robust pre-flight cleanup ──
    //
    // A recording row can be left in three "non-terminal" states between
    // sessions:
    //   - 'starting'   : created but the egress request never completed
    //   - 'recording'  : actively recording on LiveKit
    //   - 'finalizing' : stop was issued but the egress webhook never wrote
    //                    the file size / duration (so the row never moved
    //                    to 'ready' or 'failed')
    //
    // The only row that should *truly* block a new recording is one that
    // LiveKit confirms is still actively recording. Everything else (no
    // egress id, egress already gone, finalizing for too long) is treated
    // as orphaned and self-healed so the host can immediately start again.
    //
    // Why this matters: with 'starting' and 'recording' as the only checked
    // statuses, a row stuck at 'finalizing' (because the egress webhook
    // never came back) would be ignored by the SELECT — but if the next
    // attempt's row was also stuck (in 'starting' with no egress_id) it
    // would silently keep blocking every future Start. Including all three
    // states + LiveKit verify makes the flow self-healing.
    const stuck = await req.db.all(
      `SELECT id, egress_id, started_at, status FROM meeting_recordings
       WHERE meeting_id = $1 AND status IN ('starting', 'recording', 'finalizing')
       ORDER BY id DESC`,
      [req.params.id]
    );

    let blockingRow = null; // a row we cannot self-heal — only this triggers 409

    for (const row of stuck) {
      const ageSec = (Date.now() - new Date(row.started_at).getTime()) / 1000;

      let stale = false;
      let staleReason = '';

      if (!row.egress_id) {
        stale = true;
        staleReason = 'No egress id (orphaned row)';
      } else if (row.status === 'finalizing' && ageSec > 60) {
        // Webhook never came back. After a minute the file is either ready
        // on disk or the egress crashed — either way, unblock the user.
        stale = true;
        staleReason = `Finalizing > ${Math.round(ageSec)}s (webhook missing)`;
      } else {
        try {
          const info = await recordingService.getEgress(row.egress_id);
          // LiveKit EgressStatus enum: 0 STARTING, 1 ACTIVE, 2 ENDING,
          // 3 COMPLETE, 4 FAILED, 5 ABORTED.
          if (!info) {
            stale = true;
            staleReason = 'Egress not found on LiveKit';
          } else if ([2, 3, 4, 5].includes(info.status) ||
                     ['EGRESS_ENDING', 'EGRESS_COMPLETE', 'EGRESS_FAILED', 'EGRESS_ABORTED'].includes(info.status)) {
            stale = true;
            staleReason = `Egress status on LiveKit: ${info.status}`;
          }
        } catch (egressErr) {
          stale = true;
          staleReason = `LiveKit unreachable: ${egressErr.message}`;
        }
      }

      if (stale) {
        console.warn(`[recording/start] cleaning stale row id=${row.id} (status=${row.status}) for meeting ${meeting.id}: ${staleReason}`);
        await req.db.run(
          `UPDATE meeting_recordings
           SET status = 'failed',
               error_message = $1,
               ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [`Stale: ${staleReason}`, row.id]
        );
      } else {
        // Genuine active recording — only this blocks.
        blockingRow = row;
        break;
      }
    }

    if (blockingRow) {
      return res.status(409).json({
        error: 'A recording is already in progress',
        recording_id: blockingRow.id,
        hint: 'Stop the existing recording first, or wait a few seconds for it to finalize.',
      });
    }

    // Reset the meeting flag — we just cleaned up everything stale.
    await req.db.run(
      `UPDATE meetings SET is_recording = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [meeting.id]
    );

    let egress;
    try {
      egress = await recordingService.startRoomRecording({
        roomName: meeting.room_name,
        meetingId: meeting.id,
      });
    } catch (err) {
      if (err.code === 'EGRESS_NOT_AVAILABLE' || err.code === 'EGRESS_START_FAILED') {
        return res.status(503).json({ error: err.code, message: err.message });
      }
      throw err;
    }

    const expiresAt = recordingService.computeExpiry(30);

    const result = await req.db.run(
      `INSERT INTO meeting_recordings
         (meeting_id, started_by, egress_id, file_name, file_path, status, started_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, 'recording', CURRENT_TIMESTAMP, $6)
       RETURNING id`,
      [meeting.id, req.user.id, egress.egressId, egress.fileName, egress.filePath, expiresAt.toISOString()]
    );

    await req.db.run(
      `UPDATE meetings SET is_recording = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [meeting.id]
    );

    if (req.io) {
      req.io.to(`meeting:${meeting.id}`).emit('meeting:recording-started', {
        meetingId: meeting.id,
        recordingId: result.rows ? result.rows[0].id : null,
        startedAt: new Date().toISOString(),
      });
    }

    res.status(201).json({
      recording_id: result.rows ? result.rows[0].id : null,
      egress_id: egress.egressId,
      file_name: egress.fileName,
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('POST /meetings/:id/recording/start error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// POST /meetings/:id/recording/stop — host stops recording
router.post('/:id/recording/stop', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the host can stop recording' });
    }

    const active = await req.db.get(
      `SELECT id, egress_id FROM meeting_recordings
       WHERE meeting_id = $1 AND status IN ('starting', 'recording')
       ORDER BY id DESC LIMIT 1`,
      [req.params.id]
    );
    if (!active) return res.status(404).json({ error: 'No active recording' });

    try {
      await recordingService.stopRecording(active.egress_id);
    } catch (err) {
      console.warn('[recording/stop] livekit stop failed (continuing):', err.message);
    }

    await req.db.run(
      `UPDATE meeting_recordings
       SET status = 'finalizing', ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [active.id]
    );
    await req.db.run(
      `UPDATE meetings SET is_recording = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [meeting.id]
    );

    if (req.io) {
      req.io.to(`meeting:${meeting.id}`).emit('meeting:recording-stopped', {
        meetingId: meeting.id,
        recordingId: active.id,
        stoppedAt: new Date().toISOString(),
      });
    }

    res.json({ message: 'Recording stopping; finalizing now', recording_id: active.id });
  } catch (error) {
    console.error('POST /meetings/:id/recording/stop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/:id/recording/state — returns the current recording
// state for a meeting so that participants who join AFTER recording
// has already started can immediately see the indicator. Without
// this, late joiners would only see the indicator if a fresh
// `meeting:recording-started` socket event were broadcast, which
// only fires once at start.
//
// Returns:
//   { isRecording: boolean, startedAt: string|null, recordingId: number|null }
router.get('/:id/recording/state', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT id, batch_id, teacher_id FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // Everyone allowed in the class (guests included) must be able to see that it is recorded.
    const who = await access.resolveAccess(req.db, await access.findMeeting(req.db, meeting.id), req.user);
    const allowed = who.direct || req.user.role === 'admin';
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const active = await req.db.get(
      `SELECT id, started_at, status
       FROM meeting_recordings
       WHERE meeting_id = $1
         AND status IN ('starting', 'recording')
       ORDER BY id DESC
       LIMIT 1`,
      [meeting.id]
    );

    if (!active) {
      return res.json({ isRecording: false, startedAt: null, recordingId: null });
    }
    res.json({
      isRecording: true,
      startedAt: active.started_at,
      recordingId: active.id,
    });
  } catch (error) {
    console.error('GET /meetings/:id/recording/state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/recordings — list recordings the user can access
//
// Access rules (per product spec):
//   • Admin   → sees everything
//   • Teacher → sees recordings of meetings THEY created (m.teacher_id = me)
//               OR recordings they personally started (r.started_by = me),
//               so a co-teacher who recorded an admin-created meeting still
//               sees their own recording.
//   • Student → sees recordings of meetings linked to a batch they belong to
//               (regardless of whether they personally attended — supports
//               catching up on missed classes).
router.get('/recordings/list', async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      rows = await req.db.all(
        `SELECT r.id, r.meeting_id, r.file_name, r.file_size_bytes, r.duration_seconds,
                r.status, r.started_at, r.ended_at, r.expires_at, r.started_by, r.error_message,
                m.title AS meeting_title, m.batch_id, m.teacher_id, m.room_name,
                u.first_name AS host_first_name, u.last_name AS host_last_name,
                b.name AS batch_name
         FROM meeting_recordings r
         JOIN meetings m ON m.id = r.meeting_id
         LEFT JOIN users u ON u.id = m.teacher_id
         LEFT JOIN batches b ON b.id = m.batch_id
         WHERE r.status IN ('recording', 'finalizing', 'ready', 'failed')
         ORDER BY r.started_at DESC`
      );
    } else if (req.user.role === 'teacher') {
      // Teacher sees a recording when they own the meeting OR they started
      // the recording themselves (covers admin-created meetings + helper
      // teachers).
      rows = await req.db.all(
        `SELECT r.id, r.meeting_id, r.file_name, r.file_size_bytes, r.duration_seconds,
                r.status, r.started_at, r.ended_at, r.expires_at, r.started_by, r.error_message,
                m.title AS meeting_title, m.batch_id, m.teacher_id, m.room_name,
                u.first_name AS host_first_name, u.last_name AS host_last_name,
                b.name AS batch_name
         FROM meeting_recordings r
         JOIN meetings m ON m.id = r.meeting_id
         LEFT JOIN users u ON u.id = m.teacher_id
         LEFT JOIN batches b ON b.id = m.batch_id
         WHERE r.status IN ('recording', 'finalizing', 'ready', 'failed')
           AND (m.teacher_id = $1 OR r.started_by = $1)
         ORDER BY r.started_at DESC`,
        [req.user.id]
      );
    } else {
      // Student sees recordings of meetings linked to one of their batches
      // — even if they didn't attend (so they can catch up on missed
      // classes). Ad-hoc meetings without a batch are NOT shared with
      // students; only batch-scheduled meetings are.
      rows = await req.db.all(
        `SELECT r.id, r.meeting_id, r.file_name, r.file_size_bytes, r.duration_seconds,
                r.status, r.started_at, r.ended_at, r.expires_at, r.started_by,
                m.title AS meeting_title, m.batch_id, m.teacher_id, m.room_name,
                u.first_name AS host_first_name, u.last_name AS host_last_name,
                b.name AS batch_name
         FROM meeting_recordings r
         JOIN meetings m ON m.id = r.meeting_id
         JOIN batch_students bs ON bs.batch_id = m.batch_id AND bs.student_id = $1
         LEFT JOIN users u ON u.id = m.teacher_id
         LEFT JOIN batches b ON b.id = m.batch_id
         WHERE r.status IN ('finalizing', 'ready')
         ORDER BY r.started_at DESC`,
        [req.user.id]
      );
    }
    res.json(rows);
  } catch (error) {
    console.error('GET /meetings/recordings/list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/recordings/:id/stream — authenticated streaming with Range support
router.get('/recordings/:id/stream', async (req, res) => {
  try {
    const recording = await req.db.get(
      'SELECT * FROM meeting_recordings WHERE id = $1',
      [req.params.id]
    );
    if (!recording) return res.status(404).json({ error: 'Recording not found' });
    if (recording.status !== 'ready' && recording.status !== 'finalizing') {
      return res.status(409).json({ error: `Recording is in status '${recording.status}', not yet streamable` });
    }
    const allowed = await canAccessRecording(req.db, recording, req.user);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    if (!recording.file_path || !fs.existsSync(recording.file_path)) {
      return res.status(404).json({ error: 'Recording file missing on disk' });
    }

    const stat = await fsPromises.stat(recording.file_path);
    const total = stat.size;
    const range = req.headers.range;
    const mime = recording.mime_type || 'video/mp4';

    if (range) {
      const m = /bytes=(\d+)-(\d*)/.exec(range);
      const start = m ? parseInt(m[1], 10) : 0;
      const end = m && m[2] ? parseInt(m[2], 10) : total - 1;
      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mime,
        'Cache-Control': 'private, no-cache',
      });
      const stream = fs.createReadStream(recording.file_path, { start, end });
      stream.on('error', (err) => { console.error('Stream error:', err.message); res.end(); });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': total,
        'Content-Type': mime,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-cache',
      });
      fs.createReadStream(recording.file_path).pipe(res);
    }
  } catch (error) {
    console.error('GET /meetings/recordings/:id/stream error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/recordings/:id/download-token — issue a short-lived
// signed token that the browser can append to the download URL.
//
// Why a separate token instead of just using the user's normal JWT in
// the URL? The user's JWT is valid for 7 days and gives access to the
// entire app. If it leaks via the browser's download history, server
// logs, or referrer headers, that's a major incident. A download token
// is:
//   • Scoped to one specific recording (audience = `download:<rec.id>`)
//   • Valid for only 60 seconds
//   • Sub-claims locked to the user's id + role
// So if the URL ever leaks, the worst an attacker can do is grab a
// single recording within the next minute — and we still log every
// download via the access-control function.
router.post('/recordings/:id/download-token', async (req, res) => {
  try {
    const recording = await req.db.get('SELECT * FROM meeting_recordings WHERE id = $1', [req.params.id]);
    if (!recording) return res.status(404).json({ error: 'Recording not found' });
    if (recording.status !== 'ready') return res.status(409).json({ error: 'Recording not yet ready' });

    // Re-use the same permission check as the actual download.
    const allowed = await canAccessRecording(req.db, recording, req.user);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    const meeting = await req.db.get('SELECT teacher_id FROM meetings WHERE id = $1', [recording.meeting_id]);
    if (req.user.role !== 'admin' && meeting.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the host or admin can download' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
    const dt = jwt.sign(
      {
        // Custom claim type so we can refuse this token elsewhere
        kind: 'recording_download',
        recording_id: recording.id,
        // Lock the token to the requesting user — even if it leaks,
        // it can't be used to escalate privileges.
        user_id: req.user.id,
        user_role: req.user.role,
      },
      JWT_SECRET,
      { expiresIn: '60s' }
    );

    // Build an absolute URL. Prefer API_PUBLIC_URL when explicitly set,
    // otherwise derive it from this request — using a relative URL
    // would resolve against the frontend origin (e.g.
    // https://www.learnfrenchwithnatives.com) instead of the API
    // origin, and the browser would download the SPA's index.html
    // saved as a tiny .mp4 file. Trust the X-Forwarded-* headers
    // because Express is configured with `trust proxy` in production.
    let apiBase = process.env.API_PUBLIC_URL;
    if (!apiBase) {
      const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.get('host');
      apiBase = `${proto}://${host}`;
    }
    apiBase = apiBase.replace(/\/$/, ''); // drop trailing slash if any
    // The frontend will GET this URL — it includes the dt query param
    // which our download endpoint validates separately from the normal
    // auth flow.
    const url = `${apiBase}/api/meetings/recordings/${recording.id}/download?dt=${encodeURIComponent(dt)}`;
    res.json({ url, expires_in_seconds: 60 });
  } catch (error) {
    console.error('POST /recordings/:id/download-token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/recordings/:id/download — same as stream but with download header
router.get('/recordings/:id/download', async (req, res) => {
  try {
    const recording = await req.db.get('SELECT * FROM meeting_recordings WHERE id = $1', [req.params.id]);
    if (!recording) return res.status(404).json({ error: 'Recording not found' });
    if (recording.status !== 'ready') return res.status(409).json({ error: 'Not yet ready' });
    const allowed = await canAccessRecording(req.db, recording, req.user);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    // Only host or admin can download
    const meeting = await req.db.get('SELECT teacher_id FROM meetings WHERE id = $1', [recording.meeting_id]);
    if (req.user.role !== 'admin' && meeting.teacher_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the host can download' });
    }
    if (!recording.file_path || !fs.existsSync(recording.file_path)) {
      return res.status(404).json({ error: 'File missing' });
    }
    const stat = fs.statSync(recording.file_path);
    res.setHeader('Content-Disposition', `attachment; filename="${recording.file_name || 'recording.mp4'}"`);
    res.setHeader('Content-Type', recording.mime_type || 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Accept-Ranges', 'bytes');
    fs.createReadStream(recording.file_path).pipe(res);
  } catch (error) {
    console.error('GET /meetings/recordings/:id/download error:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /meetings/recordings/:id — host or admin can delete early
router.delete('/recordings/:id', async (req, res) => {
  try {
    const recording = await req.db.get('SELECT * FROM meeting_recordings WHERE id = $1', [req.params.id]);
    if (!recording) return res.status(404).json({ error: 'Recording not found' });
    const meeting = await req.db.get('SELECT teacher_id FROM meetings WHERE id = $1', [recording.meeting_id]);
    if (req.user.role !== 'admin' && (!meeting || meeting.teacher_id !== req.user.id)) {
      return res.status(403).json({ error: 'Only the host or admin can delete' });
    }

    // If still recording, attempt to stop egress
    if (recording.status === 'recording' || recording.status === 'starting') {
      if (recording.egress_id) {
        await recordingService.stopRecording(recording.egress_id).catch(() => {});
      }
    }

    if (recording.file_path && fs.existsSync(recording.file_path)) {
      try { fs.unlinkSync(recording.file_path); } catch (e) { console.warn('Could not unlink:', e.message); }
    }
    await req.db.run(
      `UPDATE meeting_recordings
       SET status = 'deleted', deleted_at = CURRENT_TIMESTAMP, file_path = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.params.id]
    );
    res.json({ message: 'Recording deleted' });
  } catch (error) {
    console.error('DELETE /meetings/recordings/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
