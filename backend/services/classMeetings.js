/**
 * Built-in class meetings, shared by the Meetings tab and the Schedule.
 *
 * A meeting always has one row in `schedules` (meeting_id set, link
 * /app/meeting/:id), so it shows in every timetable, and one row in
 * `meetings`, so it shows in the Meetings tab with its lobby, passcode,
 * attendance and recordings. Whichever tab creates it, the result is the same.
 * Deleting the meeting deletes its schedule row (ON DELETE CASCADE).
 */
const access = require('./meetingAccess');

const personName = u => `${u?.first_name || ''} ${u?.last_name || ''}`.trim();
const meetingLink = id => `/app/meeting/${id}`;
const frontendBase = () => (process.env.FRONTEND_URL || 'https://learnfrenchwithnatives.com').replace(/\/$/, '');

/**
 * Creates a meeting and its timetable entry, then tells the batch.
 *
 * @param req        the request (db, io, user)
 * @param opts.batch        { id, name, teacher_id? }
 * @param opts.hostId       who hosts it (the meeting's teacher)
 * @param opts.scheduleType schedule type for a new timetable row ('meeting' from the Meetings tab)
 * @param opts.scheduleId   link an existing timetable row instead of adding one
 * @returns { meetingId, passcode, scheduleId }
 */
async function createClassMeeting(req, {
    title, description = null, batch, start, end, maxParticipants = 50,
    hostId = req.user.id, scheduleType = 'meeting', scheduleId = null, notify = true,
}) {
    const db = req.db;
    const code = await access.uniqueMeetingCode(db);
    const passcode = access.generatePasscode();
    const limit = Math.min(Math.max(parseInt(maxParticipants, 10) || 50, 2), 300);

    const result = await db.run(
        `INSERT INTO meetings (room_name, title, description, teacher_id, batch_id, status, scheduled_start, scheduled_end, password, trusted_user_ids, max_participants)
         VALUES ($1, $2, $3, $4, $5, 'scheduled', $6, $7, $8, '{}', $9) RETURNING id`,
        [code, title, description, hostId, batch.id, start, end, access.sealPasscode(passcode), limit]
    );
    const meetingId = result.id || result.rows?.[0]?.id;

    // The timetable entry: link an existing session, or add one.
    let linkedScheduleId = scheduleId;
    try {
        if (scheduleId) {
            await db.run(
                `UPDATE schedules SET meeting_id = $1, link = $2, location_mode = 'online', location = '--', teacher_id = COALESCE(teacher_id, $3)
                 WHERE id = $4`,
                [meetingId, meetingLink(meetingId), hostId, scheduleId]
            );
        } else {
            const row = await db.run(
                `INSERT INTO schedules (
                   title, description, batch_id, teacher_id, start_time, end_time,
                   type, location_mode, link, status, meeting_id
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'online', $8, 'scheduled', $9) RETURNING id`,
                [title, description, batch.id, hostId, start, end, scheduleType, meetingLink(meetingId), meetingId]
            );
            linkedScheduleId = row.id || row.rows?.[0]?.id || null;
        }
    } catch (err) {
        console.error('Failed to sync the meeting to the timetable:', err.message);
    }

    if (req.io) req.io.emit('meeting:created', { meetingId });
    if (notify) notifyBatch(req, { meetingId, title, description, batch, start, end });

    return { meetingId, passcode, scheduleId: linkedScheduleId };
}

/** Emails and in-app notifications for a newly scheduled meeting (never blocks). */
function notifyBatch(req, { meetingId, title, description, batch, start, end }) {
    const db = req.db;
    (async () => {
        try {
            const students = await db.all(
                `SELECT u.email, u.first_name, u.last_name, u.timezone FROM users u
                 JOIN batch_students bs ON u.id = bs.student_id
                 WHERE bs.batch_id = $1 AND u.is_active = true`,
                [batch.id]
            );
            const { sendMeetingScheduledNotification } = require('../emails/emailService');
            const teacherFullName = personName(req.user) || 'Your teacher';
            for (const student of students) {
                sendMeetingScheduledNotification({
                    to: student.email,
                    studentName: personName(student) || 'Student',
                    meetingTitle: title,
                    teacherName: teacherFullName,
                    batchName: batch.name || null,
                    scheduledStart: start || null,
                    scheduledEnd: end || null,
                    description,
                    joinUrl: `${frontendBase()}/app/meetings?focus=${meetingId}`,
                    recipientTimezone: student.timezone || 'UTC',
                }).catch(err => console.error('Meeting email error:', err));
            }
        } catch (err) {
            console.error('Meeting email notification error:', err);
        }
        try {
            const { createBulkNotifications, getStudentsInBatches } = require('./notificationService');
            const studentIds = await getStudentsInBatches(db, [batch.id]);
            if (studentIds.length > 0) {
                await createBulkNotifications(db, studentIds, {
                    type: 'meeting_scheduled',
                    title: `Class scheduled: ${title}`,
                    message: `Starts ${new Date(start).toLocaleString()}`,
                    link: `/app/meetings?focus=${meetingId}`,
                    entity_type: 'meeting',
                    entity_id: meetingId,
                    sender_id: req.user.id,
                });
            }
        } catch (err) {
            console.error('Notification failed (meeting_scheduled):', err.message);
        }
    })();
}

/**
 * Removes a meeting. With keepSchedule the timetable row survives, unlinked
 * (a cancelled session, or one switched to another link or a room).
 */
async function removeClassMeeting(req, meeting, { keepSchedule = false } = {}) {
    const db = req.db;
    if (keepSchedule) {
        await db.run('UPDATE schedules SET meeting_id = NULL, link = NULL WHERE meeting_id = $1', [meeting.id]);
    }
    await db.run('DELETE FROM meetings WHERE id = $1', [meeting.id]);
    access.lobbyClear(meeting.id);
    if (meeting.status === 'active') access.closeLiveKitRoom(meeting);
    if (req.io) req.io.emit('meeting:ended', { meetingId: meeting.id });
}

/** Mirrors a timetable edit onto its meeting (title, times, batch). */
async function syncMeetingFromSchedule(db, meetingId, { title, description, start, end, batchId }) {
    await db.run(
        `UPDATE meetings SET title = COALESCE($1, title), description = COALESCE($2, description),
           scheduled_start = COALESCE($3, scheduled_start), scheduled_end = COALESCE($4, scheduled_end),
           batch_id = COALESCE($5, batch_id), updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [title ?? null, description ?? null, start ?? null, end ?? null, batchId ?? null, meetingId]
    );
}

module.exports = { createClassMeeting, removeClassMeeting, syncMeetingFromSchedule, meetingLink };
