const express = require('express');
const router = express.Router();
const { AccessToken } = require('livekit-server-sdk');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// All routes require authentication
router.use(authenticateToken);

// ── Helper: generate LiveKit access token ──
function generateLiveKitToken(roomName, participantName, participantId, isTeacher = false) {
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: String(participantId),
    name: participantName,
    ttl: '6h',
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isTeacher,
  });
  return at.toJwt();
}

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

// ── Helper: generate unique room name ──
function generateRoomName() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'meeting-';
  for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result + '-' + Date.now().toString(36);
}

// ============================================================
// MEETING CRUD
// ============================================================

// POST /meetings — create a new meeting (teacher/admin only)
router.post('/', authorizeRoles('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, batch_id, scheduled_start, scheduled_end, password, trusted_user_ids, max_participants } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const roomName = generateRoomName();
    const trustedIds = Array.isArray(trusted_user_ids) ? trusted_user_ids : [];

    const result = await req.db.run(
      `INSERT INTO meetings (room_name, title, description, teacher_id, batch_id, status, scheduled_start, scheduled_end, password, trusted_user_ids, max_participants)
       VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7, $8, $9, $10) RETURNING *`,
      [roomName, title, description || null, req.user.id, batch_id || null, scheduled_start || null, scheduled_end || null, password || null, trustedIds, max_participants || 50]
    );

    // Notify batch students via socket if batch_id provided
    if (batch_id && req.io) {
      req.io.emit('meeting:created', { meetingId: result.id, title, batchId: batch_id, teacherName: `${req.user.first_name} ${req.user.last_name}` });
    }

    // Send email notifications to batch students
    if (batch_id) {
      try {
        const students = await req.db.all(
          `SELECT u.email, u.first_name, u.last_name, u.timezone FROM users u
           JOIN batch_students bs ON u.id = bs.student_id
           WHERE bs.batch_id = $1 AND u.is_active = true`,
          [batch_id]
        );
        const { sendMeetingScheduledNotification } = require('../emails/emailService');
        const batch = await req.db.get('SELECT name FROM batches WHERE id = $1', [batch_id]);
        const frontendBase = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');
        const teacherFullName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Your teacher';
        for (const student of students) {
          sendMeetingScheduledNotification({
            to: student.email,
            studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
            meetingTitle: title,
            teacherName: teacherFullName,
            batchName: batch?.name || null,
            scheduledStart: scheduled_start || null,
            scheduledEnd: scheduled_end || null,
            description: description || null,
            joinUrl: `${frontendBase}/app/meetings?focus=${result.id}`,
            recipientTimezone: student.timezone || 'UTC',
          }).catch(err => console.error('Meeting email error:', err));
        }
      } catch (emailErr) {
        console.error('Meeting email notification error:', emailErr);
      }
    }

    // Fire in-app notifications to batch students (non-blocking)
    if (batch_id) {
      try {
        const { notifyUsers, getStudentIdsForBatches } = require('../services/notificationService');
        const studentIds = await getStudentIdsForBatches(req.db, [batch_id]);
        if (studentIds.length > 0) {
          const startIso = scheduled_start || null;
          const bodyText = startIso
            ? `Starts ${new Date(startIso).toLocaleString()}`
            : 'A live class has been scheduled for your batch.';
          await notifyUsers(req.db, studentIds, {
            type: 'meeting_scheduled',
            title: `Class scheduled: ${title}`,
            body: bodyText,
            link_path: `/app/meetings?focus=${result.id}`,
            entity_type: 'meeting',
            entity_id: result.id,
            actor_user_id: req.user.id,
          });
        }
      } catch (notifyErr) {
        console.error('Notification failed (meeting_scheduled):', notifyErr.message);
      }
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('POST /meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings — list meetings (filtered by role)
router.get('/', async (req, res) => {
  try {
    const { status, batch_id } = req.query;
    let query = '';
    const params = [];
    let paramIdx = 1;

    if (req.user.role === 'teacher') {
      query = `SELECT m.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
               b.name as batch_name,
               (SELECT COUNT(DISTINCT user_id) FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.user_id != m.teacher_id) as participant_count,
               EXTRACT(EPOCH FROM (m.scheduled_start - NOW()))::bigint AS seconds_until_start,
               EXTRACT(EPOCH FROM (m.scheduled_end   - NOW()))::bigint AS seconds_until_end
               FROM meetings m
               LEFT JOIN users u ON m.teacher_id = u.id
               LEFT JOIN batches b ON m.batch_id = b.id
               WHERE m.teacher_id = $${paramIdx++}`;
      params.push(req.user.id);
    } else if (req.user.role === 'student') {
      // Students see meetings for batches they're enrolled in
      query = `SELECT m.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
               b.name as batch_name,
               (SELECT COUNT(DISTINCT user_id) FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.user_id != m.teacher_id) as participant_count,
               EXTRACT(EPOCH FROM (m.scheduled_start - NOW()))::bigint AS seconds_until_start,
               EXTRACT(EPOCH FROM (m.scheduled_end   - NOW()))::bigint AS seconds_until_end
               FROM meetings m
               LEFT JOIN users u ON m.teacher_id = u.id
               LEFT JOIN batches b ON m.batch_id = b.id
               WHERE m.batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $${paramIdx++})`;
      params.push(req.user.id);
    } else {
      // Admin sees all
      query = `SELECT m.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
               b.name as batch_name,
               (SELECT COUNT(DISTINCT user_id) FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.user_id != m.teacher_id) as participant_count,
               EXTRACT(EPOCH FROM (m.scheduled_start - NOW()))::bigint AS seconds_until_start,
               EXTRACT(EPOCH FROM (m.scheduled_end   - NOW()))::bigint AS seconds_until_end
               FROM meetings m
               LEFT JOIN users u ON m.teacher_id = u.id
               LEFT JOIN batches b ON m.batch_id = b.id
               WHERE 1=1`;
    }

    if (status) {
      query += ` AND m.status = $${paramIdx++}`;
      params.push(status);
    }
    if (batch_id) {
      query += ` AND m.batch_id = $${paramIdx++}`;
      params.push(batch_id);
    }

    query += ' ORDER BY m.created_at DESC';

    const meetings = await req.db.all(query, params);
    res.json(meetings);
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

// GET /meetings/join-by-room/:roomName — lookup meeting by room name for share links (MUST be before /:id)
router.get('/join-by-room/:roomName', async (req, res) => {
  try {
    const meeting = await req.db.get(
      'SELECT id, title, status, room_name FROM meetings WHERE room_name = $1',
      [req.params.roomName]
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ meetingId: meeting.id, title: meeting.title, status: meeting.status });
  } catch (error) {
    console.error('GET /meetings/join-by-room/:roomName error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/:id — get single meeting
router.get('/:id', async (req, res) => {
  try {
    const meeting = await req.db.get(
      `SELECT m.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
       b.name as batch_name
       FROM meetings m
       LEFT JOIN users u ON m.teacher_id = u.id
       LEFT JOIN batches b ON m.batch_id = b.id
       WHERE m.id = $1`,
      [req.params.id]
    );
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json(meeting);
  } catch (error) {
    console.error('GET /meetings/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /meetings/:id — update meeting (teacher who created it only)
router.put('/:id', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, description, scheduled_start, scheduled_end, password, trusted_user_ids, max_participants } = req.body;

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
       password = COALESCE($5, password), trusted_user_ids = COALESCE($6, trusted_user_ids),
       max_participants = COALESCE($7, max_participants), updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [title, description, scheduled_start, scheduled_end, password, trusted_user_ids, max_participants, req.params.id]
    );

    // Send update email to batch students if anything substantive changed
    if (meeting.batch_id && changes.length > 0) {
      try {
        const updated = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
        const students = await req.db.all(
          `SELECT u.email, u.first_name, u.last_name, u.timezone FROM users u
           JOIN batch_students bs ON u.id = bs.student_id
           WHERE bs.batch_id = $1 AND u.is_active = true`,
          [meeting.batch_id]
        );
        const { sendMeetingUpdate } = require('../emails/emailService');
        const batch = await req.db.get('SELECT name FROM batches WHERE id = $1', [meeting.batch_id]);
        const frontendBase = (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');
        const teacherFullName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Your teacher';
        for (const student of students) {
          sendMeetingUpdate({
            to: student.email,
            studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
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
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

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

    await req.db.run('DELETE FROM meetings WHERE id = $1', [req.params.id]);

    // Send cancellation email to batch students (only for scheduled or upcoming meetings)
    if (students.length > 0 && (meeting.status === 'scheduled' || meeting.status === 'waiting')) {
      try {
        const { sendMeetingCancellation } = require('../emails/emailService');
        const teacherFullName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Your teacher';
        for (const student of students) {
          sendMeetingCancellation({
            to: student.email,
            studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student',
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

// ============================================================
// MEETING LIFECYCLE
// ============================================================

// POST /meetings/:id/start — teacher starts the meeting (waiting → active)
router.post('/:id/start', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can start' });

    await req.db.run(
      `UPDATE meetings SET status = 'active', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );

    // Generate teacher's LiveKit token
    const teacherName = `${req.user.first_name} ${req.user.last_name}`;
    const token = await generateLiveKitToken(meeting.room_name, teacherName, req.user.id, true);

    // Notify all waiting students via socket
    if (req.io) {
      req.io.to(`meeting:${meeting.id}`).emit('meeting:started', { meetingId: meeting.id });
      // Also emit globally so MeetingList pages update in real-time
      req.io.emit('meeting:started', { meetingId: meeting.id });
    }

    // Record teacher attendance
    await recordJoin(req.db, meeting.id, req.user.id);

    res.json({ token, livekitUrl: LIVEKIT_URL, roomName: meeting.room_name });
  } catch (error) {
    console.error('POST /meetings/:id/start error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/prepare — teacher enters pre-start screen (scheduled → waiting)
router.post('/:id/prepare', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can prepare' });
    if (meeting.status !== 'scheduled') return res.status(400).json({ error: 'Meeting is not in scheduled state' });

    await req.db.run(
      `UPDATE meetings SET status = 'waiting', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );

    // Notify globally so student MeetingList updates
    if (req.io) {
      req.io.emit('meeting:waiting', { meetingId: meeting.id });
    }

    res.json({ message: 'Meeting is now in waiting state' });
  } catch (error) {
    console.error('POST /meetings/:id/prepare error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/end — teacher ends the meeting
router.post('/:id/end', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the host can end' });
    }

    // Auto-stop any active recording for this meeting (best-effort)
    try {
      const active = await req.db.get(
        `SELECT id, egress_id FROM meeting_recordings
         WHERE meeting_id = $1 AND status IN ('starting', 'recording')
         ORDER BY id DESC LIMIT 1`,
        [req.params.id]
      );
      if (active && active.egress_id) {
        const recordingService = require('../services/recordingService');
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
      [req.params.id]
    );

    // Bulk close all open attendance sessions
    await req.db.run(
      `UPDATE meeting_attendance 
       SET left_at = CURRENT_TIMESTAMP, 
           duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at)) / 60.0, 2)
       WHERE meeting_id = $1 AND left_at IS NULL`,
      [req.params.id]
    );

    // Update all summaries: duration = last_leave - first_join
    await req.db.run(
      `UPDATE meeting_attendance_summary
       SET last_leave = CURRENT_TIMESTAMP,
           total_duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - first_join)) / 60.0, 2),
           updated_at = CURRENT_TIMESTAMP
       WHERE meeting_id = $1 AND first_join IS NOT NULL`,
      [req.params.id]
    );

    // Mark absent students (fire and forget for speed)
    markAbsentStudents(req.db, req.params.id).catch(() => {});

    // Notify all participants
    if (req.io) {
      req.io.to(`meeting:${meeting.id}`).emit('meeting:ended', { meetingId: meeting.id });
      req.io.emit('meeting:ended', { meetingId: meeting.id });
    }

    // Get summary
    const attendees = await req.db.all(
      'SELECT COUNT(DISTINCT user_id) as count FROM meeting_attendance WHERE meeting_id = $1',
      [req.params.id]
    );
    const durRow = await req.db.get(
      "SELECT ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) / 60.0) as dur FROM meetings WHERE id = $1",
      [req.params.id]
    );
    const duration = durRow?.dur || 0;

    res.json({ message: 'Meeting ended', duration, participantCount: attendees[0]?.count || 0 });
  } catch (error) {
    console.error('POST /meetings/:id/end error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/lock — toggle meeting lock
router.post('/:id/lock', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can lock/unlock' });

    const newLocked = !meeting.is_locked;
    await req.db.run('UPDATE meetings SET is_locked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newLocked, req.params.id]);

    if (req.io) {
      req.io.to(`meeting:${meeting.id}`).emit('meeting:lockChanged', { meetingId: meeting.id, isLocked: newLocked });
    }

    res.json({ is_locked: newLocked });
  } catch (error) {
    console.error('POST /meetings/:id/lock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// JOIN FLOW
// ============================================================

// POST /meetings/:id/join — student requests to join
router.post('/:id/join', async (req, res) => {
  try {
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

    // Check if ended
    if (meeting.status === 'ended') {
      return res.json({ action: 'ended' });
    }

    // Check if scheduled (not even waiting yet)
    if (meeting.status === 'scheduled') {
      return res.json({ action: 'not_ready' });
    }

    // Check if kicked
    if (meeting.kicked_user_ids && meeting.kicked_user_ids.includes(req.user.id)) {
      return res.json({ action: 'kicked' });
    }

    // Check if locked
    if (meeting.is_locked) {
      return res.json({ action: 'locked' });
    }

    // Check if waiting (teacher hasn't started yet)
    if (meeting.status === 'waiting') {
      return res.json({ action: 'waiting', meetingId: meeting.id });
    }

    // Meeting is active — determine if user gets direct entry
    const isTeacher = meeting.teacher_id === req.user.id;
    const isTrusted = meeting.trusted_user_ids && meeting.trusted_user_ids.includes(req.user.id);

    // Check if user is in the meeting's batch → auto-admit
    let isBatchStudent = false;
    if (meeting.batch_id) {
      const enrollment = await req.db.get(
        'SELECT id FROM batch_students WHERE batch_id = $1 AND student_id = $2',
        [meeting.batch_id, req.user.id]
      );
      isBatchStudent = !!enrollment;
    }

    if (isTeacher || isTrusted || isBatchStudent) {
      // Direct entry — no lobby needed
      const participantName = `${req.user.first_name} ${req.user.last_name}`;
      const token = await generateLiveKitToken(meeting.room_name, participantName, req.user.id, isTeacher);
      await recordJoin(req.db, meeting.id, req.user.id);
      return res.json({ action: 'join', token, livekitUrl: LIVEKIT_URL, roomName: meeting.room_name });
    }

    // Not in batch and not trusted — needs admission from teacher (lobby)
    return res.json({ action: 'lobby', meetingId: meeting.id });
  } catch (error) {
    console.error('POST /meetings/:id/join error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/admit — teacher admits a student from lobby
router.post('/:id/admit', async (req, res) => {
  try {
    const { user_id } = req.body;
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can admit' });

    const student = await req.db.get('SELECT id, first_name, last_name FROM users WHERE id = $1', [user_id]);
    if (!student) return res.status(404).json({ error: 'User not found' });

    const participantName = `${student.first_name} ${student.last_name}`;
    const token = await generateLiveKitToken(meeting.room_name, participantName, student.id, false);

    // Record attendance
    await recordJoin(req.db, meeting.id, student.id);

    // Notify the student via socket
    if (req.io) {
      req.io.to(`user:${user_id}`).emit('meeting:admitted', {
        meetingId: meeting.id,
        token,
        livekitUrl: LIVEKIT_URL,
        roomName: meeting.room_name,
      });
    }

    res.json({ message: 'Student admitted' });
  } catch (error) {
    console.error('POST /meetings/:id/admit error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/decline — teacher declines a student
router.post('/:id/decline', async (req, res) => {
  try {
    const { user_id } = req.body;
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can decline' });

    if (req.io) {
      req.io.to(`user:${user_id}`).emit('meeting:declined', { meetingId: meeting.id });
    }

    res.json({ message: 'Student declined' });
  } catch (error) {
    console.error('POST /meetings/:id/decline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/kick — teacher kicks a student
router.post('/:id/kick', async (req, res) => {
  try {
    const { user_id } = req.body;
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can kick' });

    // Add to kicked list
    const kickedIds = meeting.kicked_user_ids || [];
    if (!kickedIds.includes(user_id)) kickedIds.push(user_id);
    await req.db.run('UPDATE meetings SET kicked_user_ids = $1 WHERE id = $2', [kickedIds, req.params.id]);

    // Update attendance
    await recordLeave(req.db, req.params.id, user_id);

    if (req.io) {
      req.io.to(`user:${user_id}`).emit('meeting:kicked', { meetingId: meeting.id });
    }

    res.json({ message: 'Student kicked' });
  } catch (error) {
    console.error('POST /meetings/:id/kick error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /meetings/:id/leave — user leaves meeting (records attendance)
router.post('/:id/leave', async (req, res) => {
  try {
    await recordLeave(req.db, req.params.id, req.user.id);
    res.json({ message: 'Left meeting' });
  } catch (error) {
    console.error('POST /meetings/:id/leave error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ATTENDANCE
// ============================================================

// GET /meetings/:id/attendance — get attendance summary for a meeting
router.get('/:id/attendance', async (req, res) => {
  try {
    // Get meeting info first to know the teacher
    const meeting = await req.db.get(
      'SELECT started_at, ended_at, batch_id, title, teacher_id FROM meetings WHERE id = $1',
      [req.params.id]
    );

    // Get summary (present + absent) — exclude teacher
    const summary = await req.db.all(
      `SELECT mas.*, u.first_name, u.last_name, u.email, u.role
       FROM meeting_attendance_summary mas
       JOIN users u ON mas.user_id = u.id
       WHERE mas.meeting_id = $1 AND mas.user_id != $2
       ORDER BY mas.status ASC, u.first_name ASC`,
      [req.params.id, meeting?.teacher_id || 0]
    );

    // Get detailed sessions — exclude teacher
    const sessions = await req.db.all(
      `SELECT ma.*, u.first_name, u.last_name
       FROM meeting_attendance ma
       JOIN users u ON ma.user_id = u.id
       WHERE ma.meeting_id = $1 AND ma.user_id != $2
       ORDER BY ma.joined_at ASC`,
      [req.params.id, meeting?.teacher_id || 0]
    );

    const durRow = meeting?.started_at && meeting?.ended_at
      ? await req.db.get(
          'SELECT ROUND(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60.0) as dur FROM meetings WHERE id = $1',
          [req.params.id]
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
      [req.params.id, meeting?.teacher_id || 0]
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
        meetingTitle: meeting?.title,
      }
    });
  } catch (error) {
    console.error('GET /meetings/:id/attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ============================================================
// POLLS
// ============================================================

// POST /meetings/:id/polls — create a poll
router.post('/:id/polls', async (req, res) => {
  try {
    const { question, options } = req.body;
    const meeting = await req.db.get('SELECT * FROM meetings WHERE id = $1', [req.params.id]);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    if (meeting.teacher_id !== req.user.id) return res.status(403).json({ error: 'Only the host can create polls' });

    const result = await req.db.run(
      'INSERT INTO meeting_polls (meeting_id, question, options) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, question, JSON.stringify(options)]
    );

    const pollData = {
      id: result.id || result.lastID,
      meeting_id: parseInt(req.params.id),
      question: question,
      options: Array.isArray(options) ? options : [],
      is_active: true,
    };

    if (req.io) {
      req.io.to(`meeting:${meeting.id}`).emit('poll:created', pollData);
    }

    res.status(201).json(pollData);
  } catch (error) {
    console.error('POST /meetings/:id/polls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /polls/:pollId/vote — vote on a poll
router.post('/polls/:pollId/vote', async (req, res) => {
  try {
    const { option_index } = req.body;
    const poll = await req.db.get('SELECT * FROM meeting_polls WHERE id = $1', [req.params.pollId]);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (!poll.is_active) return res.status(400).json({ error: 'Poll is closed' });

    await req.db.run(
      `INSERT INTO meeting_poll_votes (poll_id, user_id, option_index) VALUES ($1, $2, $3)
       ON CONFLICT (poll_id, user_id) DO UPDATE SET option_index = $3`,
      [req.params.pollId, req.user.id, option_index]
    );

    // Get updated vote counts
    const votes = await req.db.all(
      'SELECT option_index, COUNT(*) as count FROM meeting_poll_votes WHERE poll_id = $1 GROUP BY option_index',
      [req.params.pollId]
    );

    if (req.io) {
      req.io.to(`meeting:${poll.meeting_id}`).emit('poll:updated', { pollId: poll.id, votes });
    }

    res.json({ message: 'Vote recorded', votes });
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
      req.io.to(`meeting:${poll.meeting_id}`).emit('poll:closed', { pollId: poll.id });
    }

    res.json(closedPollData);
  } catch (error) {
    console.error('POST /polls/:pollId/close error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /meetings/:id/polls — get polls for a meeting
router.get('/:id/polls', async (req, res) => {
  try {
    const polls = await req.db.all(
      'SELECT * FROM meeting_polls WHERE meeting_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    // Get vote counts for each poll
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

// Helper: can a user access a recording?
//   - host (teacher who started the meeting)  → yes
//   - admin                                    → yes
//   - student in the meeting's batch           → yes
async function canAccessRecording(db, recording, user) {
  if (!recording) return false;
  if (user.role === 'admin') return true;

  const meeting = await db.get('SELECT teacher_id, batch_id FROM meetings WHERE id = $1', [recording.meeting_id]);
  if (!meeting) return false;

  if (meeting.teacher_id === user.id) return true;

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

// GET /meetings/recordings — list recordings the user can access
router.get('/recordings/list', async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'admin') {
      rows = await req.db.all(
        `SELECT r.id, r.meeting_id, r.file_name, r.file_size_bytes, r.duration_seconds,
                r.status, r.started_at, r.ended_at, r.expires_at, r.started_by,
                m.title AS meeting_title, m.batch_id, m.teacher_id, m.room_name,
                u.first_name AS host_first_name, u.last_name AS host_last_name,
                b.name AS batch_name
         FROM meeting_recordings r
         JOIN meetings m ON m.id = r.meeting_id
         LEFT JOIN users u ON u.id = m.teacher_id
         LEFT JOIN batches b ON b.id = m.batch_id
         WHERE r.status IN ('recording', 'finalizing', 'ready')
         ORDER BY r.started_at DESC`
      );
    } else if (req.user.role === 'teacher') {
      rows = await req.db.all(
        `SELECT r.id, r.meeting_id, r.file_name, r.file_size_bytes, r.duration_seconds,
                r.status, r.started_at, r.ended_at, r.expires_at, r.started_by,
                m.title AS meeting_title, m.batch_id, m.teacher_id, m.room_name,
                u.first_name AS host_first_name, u.last_name AS host_last_name,
                b.name AS batch_name
         FROM meeting_recordings r
         JOIN meetings m ON m.id = r.meeting_id
         LEFT JOIN users u ON u.id = m.teacher_id
         LEFT JOIN batches b ON b.id = m.batch_id
         WHERE r.status IN ('recording', 'finalizing', 'ready')
           AND m.teacher_id = $1
         ORDER BY r.started_at DESC`,
        [req.user.id]
      );
    } else {
      // student — only recordings for their batches
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
    res.setHeader('Content-Disposition', `attachment; filename="${recording.file_name || 'recording.mp4'}"`);
    res.setHeader('Content-Type', recording.mime_type || 'video/mp4');
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
