const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin, authenticated } = require('../middleware/auth');
const { sendClassScheduleNotification, sendMeetingUpdate, sendMeetingCancellation } = require('../emails/emailService');
const reminderService = require('../services/reminderService');

const router = express.Router();

// Get all schedules (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { batch_id, start_date, end_date } = req.query;
        
        // Server-authoritative status: computed from PG NOW() so the frontend
        // doesn't need a synced clock. schedule_state = 'cancelled' | 'completed'
        // | 'ended' (now > end_time) | 'active' (start <= now < end) | 'scheduled'.
        let sql = `
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                s.batch_id, s.location_mode, s.location, s.link, s.status,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                CASE
                    WHEN s.status = 'cancelled' THEN 'cancelled'
                    WHEN s.status = 'completed' THEN 'completed'
                    WHEN NOW() > s.end_time   THEN 'ended'
                    WHEN NOW() >= s.start_time AND NOW() <= s.end_time THEN 'active'
                    ELSE 'scheduled'
                END AS schedule_state,
                EXTRACT(EPOCH FROM (s.end_time   - NOW()))::bigint AS seconds_until_end,
                EXTRACT(EPOCH FROM (s.start_time - NOW()))::bigint AS seconds_until_start
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
        `;
        let params = [];
        let conditions = [];
        
        // Role-based filtering
        if (req.user.role === 'teacher') {
            conditions.push('b.teacher_id = ?');
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            conditions.push(`
                s.batch_id IN (
                    SELECT batch_id FROM batch_students WHERE student_id = ?
                )
            `);
            params.push(req.user.id);
        }
        
        // Additional filters
        if (batch_id) {
            conditions.push('s.batch_id = ?');
            params.push(batch_id);
        }
        
        if (start_date) {
            conditions.push('DATE(s.start_time) >= DATE(?)');
            params.push(start_date);
        }
        
        if (end_date) {
            conditions.push('DATE(s.end_time) <= DATE(?)');
            params.push(end_date);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY s.start_time ASC';
        
        const schedules = await req.db.all(sql, params);
        res.json(schedules);
    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// Get schedule by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        let sql = `
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                s.batch_id, s.location_mode, s.location, s.link, s.status,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE s.id = ?
        `;
        let params = [id];
        
        // Add access control
        if (req.user.role === 'teacher') {
            sql += ' AND b.teacher_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            sql += ` AND s.batch_id IN (
                SELECT batch_id FROM batch_students WHERE student_id = ?
            )`;
            params.push(req.user.id);
        }
        
        const schedule = await req.db.get(sql, params);
        
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found or access denied' });
        }
        
        res.json(schedule);
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

// Create new schedule (Teachers and Admins only)
router.post('/', [
    authenticateToken,
    teacherOrAdmin,
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('start_time').isISO8601(),
    body('end_time').isISO8601(),
    body('type').isIn(['class', 'assignment', 'quiz', 'exam', 'meeting', 'other']),
    body('batch_id').isInt({ min: 1 }),
    body('location_mode').isIn(['online', 'physical']),
    body('location').optional({ nullable: true }).isLength({ max: 255 }).trim(),
    body('link').optional({ nullable: true }).isURL().isLength({ max: 1000 }),
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { title, description, start_time, end_time, type, batch_id, location_mode, location, link, status } = req.body;

        // Validate time range
        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        // When online, link is required and location should be '--'
        let finalLocation = location;
        let finalLink = link;
        if (location_mode === 'online') {
            if (!link) {
                return res.status(400).json({ error: 'Meeting link is required for online sessions' });
            }
            finalLocation = '--';
        } else {
            // physical mode: link is optional and may be null
            if (!finalLocation) {
                return res.status(400).json({ error: 'Location is required for physical sessions' });
            }
            finalLink = link || null;
        }

        // Validate batch access
        let batch;
        if (req.user.role === 'teacher') {
            batch = await req.db.get(
                'SELECT id, name FROM batches WHERE id = ? AND teacher_id = ?',
                [batch_id, req.user.id]
            );
        } else {
            batch = await req.db.get(
                'SELECT id, name FROM batches WHERE id = ?',
                [batch_id]
            );
        }
        
        if (!batch) {
            return res.status(400).json({ error: 'Invalid batch ID or access denied' });
        }

        // Check for scheduling conflicts
        const conflict = await req.db.get(`
            SELECT id FROM schedules 
            WHERE batch_id = ? 
            AND (
                (start_time <= ? AND end_time > ?) OR
                (start_time < ? AND end_time >= ?) OR
                (start_time >= ? AND end_time <= ?)
            )
        `, [batch_id, start_time, start_time, end_time, end_time, start_time, end_time]);

        if (conflict) {
            return res.status(400).json({ 
                error: 'Schedule conflict detected. There is already a schedule for this batch during the specified time.' 
            });
        }

        // Create schedule
        const result = await req.db.run(`
            INSERT INTO schedules (title, description, start_time, end_time, type, batch_id, location_mode, location, link, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id
        `, [title, description || null, start_time, end_time, type, batch_id, location_mode, finalLocation || null, finalLink || null, status || 'scheduled']);

        // Get created schedule with batch info
        const newSchedule = await req.db.get(`
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                s.location_mode, s.location, s.link, s.status,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE s.id = ?
        `, [result.rows[0].id]);

        // Send email notifications to students if this is a class
        if (type === 'class' && (status || 'scheduled') === 'scheduled') {
            try {
                // Get all students in this batch
                const students = await req.db.all(`
                    SELECT u.id, u.email, u.first_name, u.last_name, u.timezone
                    FROM users u
                    JOIN batch_students bs ON u.id = bs.student_id
                    WHERE bs.batch_id = ? AND u.role = 'student'
                `, [batch_id]);

                // Format date and time for email template.
                // Send ISO timestamps (UTC) so the email template can render
                // them in the recipient's timezone — `combineDateAndTime`
                // detects full ISO and uses them as-is.
                const startTimeIso = new Date(start_time).toISOString();
                const endTimeIso   = new Date(end_time).toISOString();

                // Send notifications to all students
                const emailPromises = students.map(student => 
                    sendClassScheduleNotification({
                        to: student.email,
                        studentName: student.first_name || student.last_name || 'Student',
                        className: title,
                        teacherName: `${newSchedule.teacher_first_name || ''} ${newSchedule.teacher_last_name || ''}`.trim() || 'Your Teacher',
                        batchName: newSchedule.batch_name,
                        frenchLevel: newSchedule.french_level,
                        startTime: startTimeIso,
                        endTime: endTimeIso,
                        date: startTimeIso,
                        location: finalLocation,
                        locationMode: location_mode,
                        link: finalLink,
                        description: description,
                        recipientTimezone: student.timezone || 'UTC',
                    }).catch(error => {
                        console.error(`Failed to send notification to ${student.email}:`, error);
                        return null; // Don't fail the entire operation
                    })
                );

                await Promise.allSettled(emailPromises);
                console.log(`Class schedule notifications sent to ${students.length} students for "${title}"`);

                // Schedule 5-minute reminder
                const reminderTime = new Date(new Date(start_time).getTime() - 5 * 60 * 1000); // 5 minutes before
                if (reminderTime > new Date()) {
                    reminderService.scheduleReminder(result.rows[0].id, reminderTime);
                }

            } catch (emailError) {
                console.error('Error sending class notifications:', emailError);
                // Don't fail the schedule creation if email fails
            }
        }

        res.status(201).json({
            message: 'Schedule created successfully',
            schedule: newSchedule
        });

    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// Update schedule (Teachers and Admins only)
router.put('/:id', [
    authenticateToken,
    teacherOrAdmin,
    body('title').optional().isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('start_time').optional().isISO8601(),
    body('end_time').optional().isISO8601(),
    body('type').optional().isIn(['class', 'assignment', 'quiz', 'exam', 'meeting', 'other']),
    body('batch_id').optional().isInt({ min: 1 }),
    body('location_mode').optional().isIn(['online', 'physical']),
    body('location').optional({ nullable: true }).isLength({ max: 255 }).trim(),
    body('link').optional({ nullable: true }).isURL().isLength({ max: 1000 }),
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { id } = req.params;
        const { title, description, start_time, end_time, type, batch_id, location_mode, location, link, status } = req.body;

        // Check if schedule exists and user has access
        let schedule;
        if (req.user.role === 'teacher') {
            schedule = await req.db.get(`
                SELECT s.*, b.teacher_id 
                FROM schedules s 
                JOIN batches b ON s.batch_id = b.id 
                WHERE s.id = ? AND b.teacher_id = ?
            `, [id, req.user.id]);
        } else {
            schedule = await req.db.get('SELECT * FROM schedules WHERE id = ?', [id]);
        }

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found or access denied' });
        }

        // Validate time range if both times are provided
        const newStartTime = start_time || schedule.start_time;
        const newEndTime = end_time || schedule.end_time;
        
        if (new Date(newStartTime) >= new Date(newEndTime)) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        // Validate batch access if batch_id is being changed
        if (batch_id !== undefined && batch_id !== schedule.batch_id) {
            let batch;
            if (req.user.role === 'teacher') {
                batch = await req.db.get(
                    'SELECT id FROM batches WHERE id = ? AND teacher_id = ?',
                    [batch_id, req.user.id]
                );
            } else {
                batch = await req.db.get('SELECT id FROM batches WHERE id = ?', [batch_id]);
            }
            
            if (!batch) {
                return res.status(400).json({ error: 'Invalid batch ID or access denied' });
            }
        }

        // Check for scheduling conflicts (excluding current schedule)
        const targetBatchId = batch_id || schedule.batch_id;
        const conflict = await req.db.get(`
            SELECT id FROM schedules 
            WHERE batch_id = ? AND id != ?
            AND (
                (start_time <= ? AND end_time > ?) OR
                (start_time < ? AND end_time >= ?) OR
                (start_time >= ? AND end_time <= ?)
            )
        `, [targetBatchId, id, newStartTime, newStartTime, newEndTime, newEndTime, newStartTime, newEndTime]);

        if (conflict) {
            return res.status(400).json({ 
                error: 'Schedule conflict detected. There is already a schedule for this batch during the specified time.' 
            });
        }

        // Build update query
        const updates = [];
        const params = [];
        
        if (title !== undefined) { updates.push('title = ?'); params.push(title); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (start_time !== undefined) { updates.push('start_time = ?'); params.push(start_time); }
        if (end_time !== undefined) { updates.push('end_time = ?'); params.push(end_time); }
        if (type !== undefined) { updates.push('type = ?'); params.push(type); }
        if (batch_id !== undefined) { updates.push('batch_id = ?'); params.push(batch_id); }
        if (location_mode !== undefined) { updates.push('location_mode = ?'); params.push(location_mode); }
        if (location !== undefined) { updates.push('location = ?'); params.push(location); }
        if (link !== undefined) { updates.push('link = ?'); params.push(link); }
        if (status !== undefined) { updates.push('status = ?'); params.push(status); }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        params.push(id);

        await req.db.run(
            `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Get updated schedule
        const updatedSchedule = await req.db.get(`
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                s.location_mode, s.location, s.link, s.status,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE s.id = ?
        `, [id]);

        // New: Schedule update/cancellation notifications for all types
        try {
            // Send notifications for all schedule types
            if (updatedSchedule && updatedSchedule.type) {
                console.log(`🔔 Processing notifications for ${updatedSchedule.type}: "${updatedSchedule.title}"`);
                
                // Helpers that emit ISO strings (UTC) — the email templates'
                // `formatRecipientTime` will render them in each recipient's zone
                // and append the GMT offset. Don't use toTimeString() here: it
                // emits the SERVER local zone (Europe/Berlin on the VPS) which
                // double-shifts the time when the template re-parses it.
                const toIso = (dt) => new Date(dt).toISOString();
                const toDateStr = (dt) => new Date(dt).toISOString().split('T')[0];

                const statusChangedToCancelled = (status !== undefined ? status : schedule.status) === 'cancelled' && schedule.status !== 'cancelled';

                // Build change summary for updates
                const changes = [];
                if (title !== undefined && title !== schedule.title) {
                    changes.push({ label: 'Title', old: schedule.title || '—', new: title || '—' });
                }
                if (description !== undefined && description !== schedule.description) {
                    changes.push({ label: 'Description', old: schedule.description || '—', new: description || '—' });
                }
                if (start_time !== undefined && start_time !== schedule.start_time) {
                    const oldDate = toDateStr(schedule.start_time);
                    const newDate = toDateStr(newStartTime);
                    if (oldDate !== newDate) {
                        changes.push({ label: 'Date', old: oldDate, new: newDate });
                    }
                    changes.push({ label: 'Start Time', old: toIso(schedule.start_time), new: toIso(newStartTime) });
                }
                if (end_time !== undefined && end_time !== schedule.end_time) {
                    changes.push({ label: 'End Time', old: toIso(schedule.end_time), new: toIso(newEndTime) });
                }
                if (location_mode !== undefined && location_mode !== schedule.location_mode) {
                    const fmt = (m) => m ? (m.charAt(0).toUpperCase() + m.slice(1)) : '—';
                    changes.push({ label: 'Mode', old: fmt(schedule.location_mode), new: fmt(location_mode) });
                }
                if (location !== undefined && location !== schedule.location) {
                    changes.push({ label: 'Location', old: schedule.location || '—', new: location || '—' });
                }
                if (link !== undefined && link !== schedule.link) {
                    changes.push({ label: 'Meeting Link', old: schedule.link || '—', new: link || '—' });
                }

                if (statusChangedToCancelled) {
                    // Send cancellation to students of the original batch
                    const students = await req.db.all(`
                        SELECT u.id, u.email, u.first_name, u.last_name, u.timezone
                        FROM users u
                        JOIN batch_students bs ON u.id = bs.student_id
                        WHERE bs.batch_id = ? AND u.role = 'student'
                    `, [schedule.batch_id]);

                    console.log(`📧 Found ${students.length} students to notify about cancellation`);

                    // Fetch original batch/teacher info for email context
                    const oldBatchTeacher = await req.db.get(`
                        SELECT b.name as batch_name, u.first_name as teacher_first_name, u.last_name as teacher_last_name
                        FROM batches b
                        LEFT JOIN users u ON b.teacher_id = u.id
                        WHERE b.id = ?
                    `, [schedule.batch_id]);

                    const originalDate = toDateStr(schedule.start_time);
                    const originalStartTime = toIso(schedule.start_time);
                    const originalEndTime = toIso(schedule.end_time);
                    const teacherName = `${oldBatchTeacher?.teacher_first_name || ''} ${oldBatchTeacher?.teacher_last_name || ''}`.trim() || 'Your Teacher';

                    const cancelPromises = students.map(student => {
                        console.log(`📧 Sending cancellation to: ${student.email}`);
                        return sendMeetingCancellation({
                            to: student.email,
                            studentName: student.first_name || student.last_name || 'Student',
                            meetingTitle: schedule.title,
                            teacherName,
                            batchName: oldBatchTeacher?.batch_name || updatedSchedule.batch_name,
                            originalDate,
                            originalStartTime,
                            originalEndTime,
                            locationMode: schedule.location_mode,
                            location: schedule.location,
                            link: schedule.link,
                            reason: description, // if provided, use as reason
                            recipientTimezone: student.timezone || 'UTC',
                        }).catch(err => {
                            console.error(`❌ Failed to send cancellation to ${student.email}:`, err);
                            return null;
                        });
                    });

                    await Promise.allSettled(cancelPromises);
                    console.log(`✅ ${updatedSchedule.type} cancellation notifications sent to ${students.length} students for "${schedule.title}"`);
                } else {
                    // Send update only if relevant meeting fields changed
                    const relevantChanged = changes.length > 0 || (batch_id !== undefined && batch_id !== schedule.batch_id);
                    if (relevantChanged) {
                        const notifyBatchId = (batch_id !== undefined) ? batch_id : schedule.batch_id;
                        const students = await req.db.all(`
                            SELECT u.id, u.email, u.first_name, u.last_name, u.timezone
                            FROM users u
                            JOIN batch_students bs ON u.id = bs.student_id
                            WHERE bs.batch_id = ? AND u.role = 'student'
                        `, [notifyBatchId]);

                        console.log(`📧 Found ${students.length} students to notify about update`);
                        console.log(`📧 Changes detected: ${changes.map(c => c.label).join(', ')}`);

                        const date = toIso(updatedSchedule.start_time);
                        const startTimeStr = toIso(updatedSchedule.start_time);
                        const endTimeStr = toIso(updatedSchedule.end_time);
                        const teacherName = `${updatedSchedule.teacher_first_name || ''} ${updatedSchedule.teacher_last_name || ''}`.trim() || 'Your Teacher';

                        // Format the time-typed change values in the recipient's
                        // own timezone — bare ISOs would not be human-readable
                        // and "HH:mm" from server local would be wrong.
                        const buildChangeLines = (recipientTz) => changes.map(c => {
                            const isTime = c.label === 'Start Time' || c.label === 'End Time';
                            const fmt = (v) => {
                                if (!v) return '—';
                                if (!isTime) return String(v);
                                try {
                                    return new Intl.DateTimeFormat('en-US', {
                                        weekday: 'short', month: 'short', day: 'numeric',
                                        hour: 'numeric', minute: '2-digit', hour12: true,
                                        timeZone: recipientTz, timeZoneName: 'shortOffset',
                                    }).format(new Date(v));
                                } catch {
                                    return String(v);
                                }
                            };
                            return `${c.label}: ${fmt(c.old)} → ${fmt(c.new)}`;
                        });

                        const updatePromises = students.map(student => {
                            console.log(`📧 Sending update to: ${student.email}`);
                            const recipientTz = student.timezone || 'UTC';
                            return sendMeetingUpdate({
                                to: student.email,
                                studentName: student.first_name || student.last_name || 'Student',
                                meetingTitle: updatedSchedule.title,
                                teacherName,
                                batchName: updatedSchedule.batch_name,
                                date,
                                startTime: startTimeStr,
                                endTime: endTimeStr,
                                locationMode: updatedSchedule.location_mode,
                                location: updatedSchedule.location,
                                link: updatedSchedule.link,
                                description: updatedSchedule.description,
                                changes: buildChangeLines(recipientTz),
                                recipientTimezone: recipientTz,
                            }).catch(err => {
                                console.error(`❌ Failed to send update to ${student.email}:`, err);
                                return null;
                            });
                        });

                        await Promise.allSettled(updatePromises);
                        console.log(`✅ ${updatedSchedule.type} update notifications sent to ${students.length} students for "${updatedSchedule.title}"`);
                    } else {
                        console.log(`ℹ️ No relevant changes detected for ${updatedSchedule.type} "${updatedSchedule.title}" - skipping notifications`);
                    }
                }
            } else {
                console.log(`ℹ️ Schedule type "${updatedSchedule?.type}" does not trigger notifications`);
            }
        } catch (notifyErr) {
            console.error('❌ Error sending notifications:', notifyErr);
        }

        res.json({
            message: 'Schedule updated successfully',
            schedule: updatedSchedule
        });

    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

// Delete schedule (Teachers and Admins only)
router.delete('/:id', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if schedule exists and user has access
        let schedule;
        if (req.user.role === 'teacher') {
            schedule = await req.db.get(`
                SELECT s.*, b.teacher_id 
                FROM schedules s 
                JOIN batches b ON s.batch_id = b.id 
                WHERE s.id = ? AND b.teacher_id = ?
            `, [id, req.user.id]);
        } else {
            schedule = await req.db.get('SELECT * FROM schedules WHERE id = ?', [id]);
        }
        
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found or access denied' });
        }

        // Send cancellation emails for all schedule types before deletion
        try {
            if (schedule.type) {
                console.log(`🔔 Processing deletion notifications for ${schedule.type}: "${schedule.title}"`);
                
                const detail = await req.db.get(`
                    SELECT 
                        s.*, 
                        b.name as batch_name,
                        u.first_name as teacher_first_name, u.last_name as teacher_last_name
                    FROM schedules s
                    LEFT JOIN batches b ON s.batch_id = b.id
                    LEFT JOIN users u ON b.teacher_id = u.id
                    WHERE s.id = ?
                `, [id]);

                const students = await req.db.all(`
                    SELECT u.id, u.email, u.first_name, u.last_name, u.timezone
                    FROM users u
                    JOIN batch_students bs ON u.id = bs.student_id
                    WHERE bs.batch_id = ? AND u.role = 'student'
                `, [detail.batch_id]);

                console.log(`📧 Found ${students.length} students to notify about deletion`);

                // Pass ISO strings (UTC) — `formatRecipientTime` in the
                // template will convert to the recipient's timezone with
                // a `· GMT±N` suffix. Don't use toTimeString() (server local).
                const toIso = (dt) => new Date(dt).toISOString();

                const cancelPromises = students.map(student => {
                    console.log(`📧 Sending deletion notification to: ${student.email}`);
                    return sendMeetingCancellation({
                        to: student.email,
                        studentName: student.first_name || student.last_name || 'Student',
                        meetingTitle: detail.title,
                        teacherName: `${detail.teacher_first_name || ''} ${detail.teacher_last_name || ''}`.trim() || 'Your Teacher',
                        batchName: detail.batch_name,
                        originalDate: toIso(detail.start_time),
                        originalStartTime: toIso(detail.start_time),
                        originalEndTime: toIso(detail.end_time),
                        locationMode: detail.location_mode,
                        location: detail.location,
                        link: detail.link,
                        reason: `The ${schedule.type} has been cancelled.`,
                        recipientTimezone: student.timezone || 'UTC',
                    }).catch(err => {
                        console.error(`❌ Failed to send deletion notification to ${student.email}:`, err);
                        return null;
                    });
                });

                await Promise.allSettled(cancelPromises);
                console.log(`✅ ${schedule.type} deletion notifications sent to ${students.length} students for "${detail.title}"`);
            } else {
                console.log(`ℹ️ Schedule has no type specified - skipping deletion notifications`);
            }
        } catch (notifyErr) {
            console.error('❌ Error sending deletion notifications:', notifyErr);
        }
        
        await req.db.run('DELETE FROM schedules WHERE id = ?', [id]);
        
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

// Get schedules for a specific batch
router.get('/batch/:batchId', authenticateToken, authenticated, async (req, res) => {
    try {
        const { batchId } = req.params;
        const { start_date, end_date } = req.query;
        
        // Check if user has access to this batch
        let hasAccess = false;
        
        if (req.user.role === 'admin') {
            hasAccess = true;
        } else if (req.user.role === 'teacher') {
            const teacherBatch = await req.db.get(
                'SELECT id FROM batches WHERE id = ? AND teacher_id = ?',
                [batchId, req.user.id]
            );
            hasAccess = !!teacherBatch;
        } else if (req.user.role === 'student') {
            const studentBatch = await req.db.get(
                'SELECT 1 FROM batch_students WHERE batch_id = ? AND student_id = ?',
                [batchId, req.user.id]
            );
            hasAccess = !!studentBatch;
        }
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this batch' });
        }
        
        let sql = `
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                s.batch_id, s.location_mode, s.location, s.link, s.status,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE s.batch_id = ?
        `;
        let params = [batchId];
        
        if (start_date) {
            sql += ' AND DATE(s.start_time) >= DATE(?)';
            params.push(start_date);
        }
        
        if (end_date) {
            sql += ' AND DATE(s.end_time) <= DATE(?)';
            params.push(end_date);
        }
        
        sql += ' ORDER BY s.start_time ASC';
        
        const schedules = await req.db.all(sql, params);
        
        res.json(schedules);
    } catch (error) {
        console.error('Get batch schedules error:', error);
        res.status(500).json({ error: 'Failed to fetch batch schedules' });
    }
});

// Get upcoming schedules for current user
router.get('/upcoming/me', authenticateToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const now = new Date().toISOString();
        
        let sql, params;
        
        if (req.user.role === 'teacher') {
            sql = `
                SELECT 
                    s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                    s.batch_id, s.location_mode, s.location, s.link, s.status,
                    b.name as batch_name, b.french_level
                FROM schedules s
                JOIN batches b ON s.batch_id = b.id
                WHERE b.teacher_id = ? AND s.start_time > ?
                ORDER BY s.start_time ASC
                LIMIT ?
            `;
            params = [req.user.id, now, parseInt(limit)];
        } else if (req.user.role === 'student') {
            sql = `
                SELECT 
                    s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                    s.batch_id, s.location_mode, s.location, s.link, s.status,
                    b.name as batch_name, b.french_level,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM schedules s
                JOIN batches b ON s.batch_id = b.id
                JOIN batch_students bs ON b.id = bs.batch_id
                JOIN users u ON b.teacher_id = u.id
                WHERE bs.student_id = ? AND s.start_time > ?
                ORDER BY s.start_time ASC
                LIMIT ?
            `;
            params = [req.user.id, now, parseInt(limit)];
        } else {
            // Admin can see all upcoming schedules
            sql = `
                SELECT 
                    s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                    s.batch_id, s.location_mode, s.location, s.link, s.status,
                    b.name as batch_name, b.french_level,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM schedules s
                JOIN batches b ON s.batch_id = b.id
                JOIN users u ON b.teacher_id = u.id
                WHERE s.start_time > ?
                ORDER BY s.start_time ASC
                LIMIT ?
            `;
            params = [now, parseInt(limit)];
        }
        
        const schedules = await req.db.all(sql, params);
        res.json(schedules);
        
    } catch (error) {
        console.error('Get upcoming schedules error:', error);
        res.status(500).json({ error: 'Failed to fetch upcoming schedules' });
    }
});

module.exports = router;