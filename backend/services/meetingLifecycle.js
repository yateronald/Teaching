/**
 * Live-class lifecycle: ending a class (host button or automatic) and a
 * periodic sweep that clears states nobody closed.
 *
 *   • opened but never started ("waiting") and past its scheduled end
 *       → back to "scheduled" (the teacher only opened the pre-join screen;
 *         no class was held, so no attendance is recorded)
 *   • started ("active"), more than 30 min past its scheduled end and nobody
 *     left in the video room → ended properly, exactly like the End button
 */
const access = require('./meetingAccess');
const recordingService = require('./recordingService');

const SWEEP_EVERY_MS = 5 * 60 * 1000;
const ACTIVE_GRACE_MINUTES = 30;
let timer = null;

/** Every student of the batch without an attendance record is marked absent. */
async function markAbsentStudents(db, meetingId) {
    const meeting = await db.get('SELECT batch_id FROM meetings WHERE id = $1', [meetingId]);
    if (!meeting || !meeting.batch_id) return;
    await db.run(
        `INSERT INTO meeting_attendance_summary (meeting_id, user_id, status, total_duration_minutes, session_count)
         SELECT $1, bs.student_id, 'absent', 0, 0
         FROM batch_students bs
         WHERE bs.batch_id = $2
         ON CONFLICT (meeting_id, user_id) DO NOTHING`,
        [meetingId, meeting.batch_id]
    );
}

/** Ends a class: stops a recording, closes attendance, tells everyone, closes the video room. */
async function endMeeting(db, io, meeting) {
    try {
        const active = await db.get(
            `SELECT id, egress_id FROM meeting_recordings
             WHERE meeting_id = $1 AND status IN ('starting', 'recording')
             ORDER BY id DESC LIMIT 1`,
            [meeting.id]
        );
        if (active && active.egress_id) {
            await recordingService.stopRecording(active.egress_id).catch(err =>
                console.warn(`[meetings/end] auto-stop egress failed for ${active.egress_id}:`, err.message));
            await db.run(
                `UPDATE meeting_recordings SET status = 'finalizing', ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [active.id]
            );
        }
    } catch (recErr) {
        console.warn('[meetings/end] recording auto-stop step error:', recErr.message);
    }

    await db.run(
        `UPDATE meetings SET status = 'ended', ended_at = CURRENT_TIMESTAMP, is_recording = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [meeting.id]
    );
    await db.run(`UPDATE schedules SET status = 'completed' WHERE meeting_id = $1`, [meeting.id])
        .catch(e => console.warn('[meetings/end] update schedules status failed:', e.message));

    // Close every open connection, then the per-person summaries
    await db.run(
        `UPDATE meeting_attendance
         SET left_at = CURRENT_TIMESTAMP,
             duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - joined_at)) / 60.0, 2)
         WHERE meeting_id = $1 AND left_at IS NULL`,
        [meeting.id]
    );
    await db.run(
        `UPDATE meeting_attendance_summary
         SET last_leave = CURRENT_TIMESTAMP,
             total_duration_minutes = ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - first_join)) / 60.0, 2),
             updated_at = CURRENT_TIMESTAMP
         WHERE meeting_id = $1 AND first_join IS NOT NULL`,
        [meeting.id]
    );
    markAbsentStudents(db, meeting.id).catch(() => {});

    access.lobbyClear(meeting.id);
    await access.settleJoinRequests(db, meeting);
    if (io) io.emit('meeting:ended', { meetingId: meeting.id });
    access.closeLiveKitRoom(meeting);
}

async function roomIsEmpty(meeting) {
    const svc = access.roomService();
    if (!svc) return true;
    try {
        const participants = await svc.listParticipants(meeting.room_name);
        return participants.length === 0;
    } catch {
        return true; // room already closed on the video server
    }
}

async function sweepStaleMeetings(db, io) {
    // Opened but never started, and its time is over: nothing was held.
    const reopened = await db.run(
        `UPDATE meetings SET status = 'scheduled', updated_at = CURRENT_TIMESTAMP
         WHERE status = 'waiting' AND started_at IS NULL
           AND scheduled_end IS NOT NULL AND scheduled_end < CURRENT_TIMESTAMP
         RETURNING id`
    );
    for (const row of reopened.rows || []) {
        access.lobbyClear(row.id);
        if (io) io.emit('meeting:ended', { meetingId: row.id });
    }
    if (reopened.rowCount) console.log(`🧹 Live classes: ${reopened.rowCount} never-started class(es) past their end reset to scheduled`);

    // Started, long past the end, and nobody is in the room any more: end it properly.
    const stale = await db.all(
        `SELECT id, room_name, title, teacher_id FROM meetings
         WHERE status = 'active' AND scheduled_end IS NOT NULL
           AND scheduled_end < CURRENT_TIMESTAMP - INTERVAL '${ACTIVE_GRACE_MINUTES} minutes'`
    );
    for (const meeting of stale) {
        if (!(await roomIsEmpty(meeting))) continue; // class running over time: leave it alone
        await endMeeting(db, io, meeting);
        console.log(`🧹 Live classes: "${meeting.title}" (#${meeting.id}) ended automatically — the room was empty`);
    }
}

function startMeetingSweeper(db, io) {
    if (timer) return;
    const tick = () => sweepStaleMeetings(db, io).catch(e => console.warn('[meetings] sweep failed:', e.message));
    tick();
    timer = setInterval(tick, SWEEP_EVERY_MS);
    timer.unref?.();
}
function stopMeetingSweeper() {
    if (timer) clearInterval(timer);
    timer = null;
}

module.exports = { endMeeting, markAbsentStudents, sweepStaleMeetings, startMeetingSweeper, stopMeetingSweeper };
