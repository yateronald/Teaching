const { buildAccessCodeTemplate } = require('../emails/templates/accessCode');
const emailService = require('../emails/emailService');

class AttendanceService {
    constructor(database) {
        this.db = database;
    }

    // Generate secure access code
    generateAccessCode(length = 6) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Get attendance settings
    async getSettings() {
        try {
            const settings = await this.db.all('SELECT setting_key, setting_value FROM attendance_settings');
            const settingsObj = {};
            settings.forEach(setting => {
                settingsObj[setting.setting_key] = setting.setting_value;
            });
            return settingsObj;
        } catch (error) {
            console.error('Failed to get attendance settings:', error);
            return {
                code_length: '6',
                code_expiry_minutes: '30',
                early_start_minutes: '15',
                late_join_minutes: '10',
                auto_end_minutes: '15',
                require_code_for_attendance: 'true'
            };
        }
    }

    // Create class session from schedule
    async createClassSession(scheduleId, sessionDate) {
        try {
            // Get schedule details
            const schedule = await this.db.get(`
                SELECT s.*, b.teacher_id, b.name as batch_name
                FROM schedules s 
                JOIN batches b ON s.batch_id = b.id 
                WHERE s.id = ?
            `, [scheduleId]);

            if (!schedule) {
                throw new Error('Schedule not found');
            }

            // Check if session already exists
            const existingSession = await this.db.get(`
                SELECT id FROM class_sessions 
                WHERE schedule_id = ? AND session_date = ?
            `, [scheduleId, sessionDate]);

            if (existingSession) {
                return existingSession.id;
            }

            // Create new session
            const result = await this.db.run(`
                INSERT INTO class_sessions 
                (schedule_id, batch_id, teacher_id, session_date, start_time, end_time, status)
                VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
            `, [
                scheduleId,
                schedule.batch_id,
                schedule.teacher_id,
                sessionDate,
                schedule.start_time,
                schedule.end_time
            ]);

            // Try to get inserted session id for both SQLite and PostgreSQL
            let sessionId = result?.lastID || result?.insertId;
            if (!sessionId) {
                const insertedRow = await this.db.get(`
                    SELECT id FROM class_sessions 
                    WHERE schedule_id = ? AND session_date = ?
                    ORDER BY id DESC 
                    LIMIT 1
                `, [scheduleId, sessionDate]);
                sessionId = insertedRow?.id;
            }
            if (!sessionId) {
                throw new Error('Failed to create class session: could not determine session ID');
            }

            // Create attendance records for all students in the batch
            const students = await this.db.all(`
                SELECT bs.student_id 
                FROM batch_students bs 
                WHERE bs.batch_id = ?
            `, [schedule.batch_id]);

            for (const student of students) {
                await this.db.run(`
                    INSERT INTO attendance_records 
                    (session_id, student_id, batch_id, status)
                    VALUES (?, ?, ?, 'absent')
                `, [sessionId, student.student_id, schedule.batch_id]);
            }

            // Verify teacher exists before creating attendance record
            const teacherExists = await this.db.get(`
                SELECT id FROM users WHERE id = ? AND role = 'teacher'
            `, [schedule.teacher_id]);

            if (!teacherExists) {
                throw new Error(`Teacher with ID ${schedule.teacher_id} not found`);
            }

            // Create teacher attendance record
            await this.db.run(`
                INSERT INTO teacher_attendance 
                (session_id, teacher_id, batch_id, status)
                VALUES (?, ?, ?, 'absent')
            `, [sessionId, schedule.teacher_id, schedule.batch_id]);

            return sessionId;
        } catch (error) {
            console.error('Failed to create class session:', error);
            throw error;
        }
    }

    // Start class session and generate access code
    async startClassSession(scheduleId, teacherId, sessionDate = null) {
        try {
            const settings = await this.getSettings();
            
            // Verify teacher owns this schedule
            const schedule = await this.db.get(`
                SELECT s.*, b.teacher_id, b.name as batch_name
                FROM schedules s 
                JOIN batches b ON s.batch_id = b.id 
                WHERE s.id = ? AND b.teacher_id = ?
            `, [scheduleId, teacherId]);

            if (!schedule) {
                throw new Error('Schedule not found or access denied');
            }

            // Check if it's within the allowed time window
            const now = new Date();
            const scheduleStart = new Date(schedule.start_time);
            const earlyStartTime = new Date(scheduleStart.getTime() - (parseInt(settings.early_start_minutes) * 60000));

            if (now < earlyStartTime) {
                throw new Error(`Class can only be started ${settings.early_start_minutes} minutes before scheduled time`);
            }

            // Create or get existing session
            const currentDate = sessionDate || new Date().toISOString().split('T')[0];
            const sessionId = await this.createClassSession(scheduleId, currentDate);

            // Generate access code
            const accessCode = this.generateAccessCode(parseInt(settings.code_length));
            const codeExpiresAt = new Date(now.getTime() + (parseInt(settings.code_expiry_minutes) * 60000));

            // Update session with access code
            await this.db.run(`
                UPDATE class_sessions 
                SET access_code = ?, code_generated_at = ?, code_expires_at = ?, 
                    session_started_at = ?, status = 'started', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [accessCode, now.toISOString(), codeExpiresAt.toISOString(), now.toISOString(), sessionId]);

            // Atomically ensure and mark teacher attendance as present for this started session
            await this.db.run(`
                INSERT INTO teacher_attendance (session_id, teacher_id, batch_id, status, code_generated, session_started, marked_at, updated_at)
                VALUES (?, ?, ?, 'present', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (session_id, teacher_id)
                DO UPDATE SET
                    status = 'present',
                    code_generated = true,
                    session_started = true,
                    marked_at = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
            `, [sessionId, teacherId, schedule.batch_id]);

            // Verify teacher attendance record was created/updated successfully
            const teacherAttendanceCheck = await this.db.get(`
                SELECT id FROM teacher_attendance 
                WHERE session_id = ? AND teacher_id = ?
            `, [sessionId, teacherId]);

            if (!teacherAttendanceCheck) {
                throw new Error('Failed to create or update teacher attendance record');
            }

            return {
                sessionId,
                accessCode,
                expiresAt: codeExpiresAt.toISOString(),
                schedule,
                settings
            };
        } catch (error) {
            console.error('Failed to start class session:', error);
            throw error;
        }
    }

    // Send access code to all students in batch
    async sendAccessCodeToStudents(sessionId, accessCode, schedule, expiresAt) {
        try {
            // Get all students in the batch
            const students = await this.db.all(`
                SELECT u.id, u.first_name, u.last_name, u.email
                FROM users u
                JOIN batch_students bs ON u.id = bs.student_id
                WHERE bs.batch_id = ? AND u.role = 'student' AND u.is_active = true
            `, [schedule.batch_id]);

            // Get teacher details
            const teacher = await this.db.get(`
                SELECT first_name, last_name FROM users WHERE id = ?
            `, [schedule.teacher_id]);

            if (!teacher) {
                throw new Error(`Teacher with ID ${schedule.teacher_id} not found`);
            }

            const teacherName = `${teacher.first_name} ${teacher.last_name}`;
            const sessionDate = new Date().toISOString().split('T')[0];

            // Validate required schedule fields
            if (!schedule.title) {
                throw new Error('Schedule title is missing');
            }
            if (!schedule.batch_name) {
                throw new Error('Batch name is missing');
            }
            if (!schedule.start_time || !schedule.end_time) {
                throw new Error('Schedule start_time or end_time is missing');
            }

            // Send email to each student
            const emailPromises = students.map(async (student) => {
                try {
                    const studentName = `${student.first_name} ${student.last_name}`;
                    
                    // Debug logging to check what data we have
                    console.log('Email template data:', {
                        studentName,
                        classTitle: schedule.title,
                        teacherName,
                        batchName: schedule.batch_name,
                        accessCode,
                        sessionDate,
                        startTime: schedule.start_time,
                        endTime: schedule.end_time,
                        expiresAt
                    });
                    
                    const emailTemplate = buildAccessCodeTemplate({
                        studentName,
                        classTitle: schedule.title,
                        teacherName,
                        batchName: schedule.batch_name,
                        accessCode,
                        sessionDate,
                        startTime: schedule.start_time,
                        endTime: schedule.end_time,
                        expiresAt,
                        joinLink: null, // Can be added later for direct join functionality
                        logoCid: null
                    });

                    await emailService.sendAccessCodeEmail({
                        to: student.email,
                        subject: emailTemplate.subject,
                        html: emailTemplate.html,
                        text: emailTemplate.text
                    });

                    console.log(`Access code sent to ${student.email}`);
                    return { success: true, email: student.email };
                } catch (error) {
                    console.error(`Failed to send access code to ${student.email}:`, error);
                    return { success: false, email: student.email, error: error.message };
                }
            });

            const results = await Promise.all(emailPromises);
            
            // Log email sending results
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            console.log(`Access code email results: ${successCount} sent, ${failureCount} failed`);

            return {
                totalStudents: students.length,
                successCount,
                failureCount,
                results
            };
        } catch (error) {
            console.error('Failed to send access codes:', error);
            throw error;
        }
    }

    // Validate access code and mark attendance
    async validateAccessCodeAndMarkAttendance(sessionId, studentId, accessCode, ipAddress, userAgent) {
        try {
            const settings = await this.getSettings();

            // Get session details
            const session = await this.db.get(`
                SELECT cs.*, s.title as schedule_title, b.name as batch_name
                FROM class_sessions cs
                JOIN schedules s ON cs.schedule_id = s.id
                JOIN batches b ON cs.batch_id = b.id
                WHERE cs.id = ?
            `, [sessionId]);

            if (!session) {
                throw new Error('Session not found');
            }

            // Verify student is enrolled in this batch
            const enrollment = await this.db.get(`
                SELECT id FROM batch_students 
                WHERE batch_id = ? AND student_id = ?
            `, [session.batch_id, studentId]);

            if (!enrollment) {
                throw new Error('Student not enrolled in this batch');
            }

            // Check if session has started and code is valid
            if (session.status !== 'started' || !session.access_code) {
                throw new Error('Session has not started or no access code generated');
            }

            // Check if code matches
            if (session.access_code !== accessCode.toUpperCase()) {
                throw new Error('Invalid access code');
            }

            // Check if code has expired
            const now = new Date();
            const codeExpiry = new Date(session.code_expires_at);
            if (now > codeExpiry) {
                throw new Error('Access code has expired');
            }

            // Check if student can still join (within late join window)
            const sessionStart = new Date(session.start_time);
            const lateJoinDeadline = new Date(sessionStart.getTime() + (parseInt(settings.late_join_minutes) * 60000));

            let attendanceStatus = 'present';
            if (now > sessionStart && now <= lateJoinDeadline) {
                attendanceStatus = 'late';
            } else if (now > lateJoinDeadline) {
                throw new Error('Late join period has expired');
            }

            // Get current attendance record
            const currentRecord = await this.db.get(`
                SELECT * FROM attendance_records 
                WHERE session_id = ? AND student_id = ?
            `, [sessionId, studentId]);

            if (!currentRecord) {
                throw new Error('Attendance record not found');
            }

            // Update attendance record
            await this.db.run(`
                UPDATE attendance_records 
                SET status = ?, marked_at = CURRENT_TIMESTAMP, code_entered_at = CURRENT_TIMESTAMP,
                    entered_code = ?, ip_address = ?, user_agent = ?, updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ? AND student_id = ?
            `, [
                attendanceStatus,
                accessCode,
                ipAddress,
                userAgent,
                sessionId,
                studentId
            ]);

            return {
                success: true,
                status: attendanceStatus,
                previousStatus: currentRecord.status
            };
        } catch (error) {
            console.error('Failed to validate access code:', error);
            throw error;
        }
    }

    // End class session
    async endClassSession(sessionId, teacherId) {
        try {
            // Verify teacher owns this session
            const session = await this.db.get(`
                SELECT * FROM class_sessions 
                WHERE id = ? AND teacher_id = ?
            `, [sessionId, teacherId]);

            if (!session) {
                throw new Error('Session not found or access denied');
            }

            if (session.status === 'ended') {
                throw new Error('Session already ended');
            }

            // End session
            await this.db.run(`
                UPDATE class_sessions 
                SET status = 'ended', session_ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [sessionId]);

            return { success: true };
        } catch (error) {
            console.error('Failed to end session:', error);
            throw error;
        }
    }

    // Get session status for student
    async getSessionStatusForStudent(scheduleId, studentId, sessionDate = null) {
        try {
            const currentDate = sessionDate || new Date().toISOString().split('T')[0];
            
            // Check if student is enrolled in the batch for this schedule
            const enrollment = await this.db.get(`
                SELECT bs.id, s.batch_id, s.title, s.start_time, s.end_time, b.name as batch_name
                FROM schedules s
                JOIN batches b ON s.batch_id = b.id
                JOIN batch_students bs ON b.id = bs.batch_id
                WHERE s.id = ? AND bs.student_id = ?
            `, [scheduleId, studentId]);

            if (!enrollment) {
                return { canJoin: false, reason: 'Not enrolled in this batch' };
            }

            // Check if session exists and has started
            const session = await this.db.get(`
                SELECT cs.*, ar.status as attendance_status
                FROM class_sessions cs
                LEFT JOIN attendance_records ar ON cs.id = ar.session_id AND ar.student_id = ?
                WHERE cs.schedule_id = ? AND cs.session_date = ?
            `, [studentId, scheduleId, currentDate]);

            if (!session) {
                return { 
                    canJoin: false, 
                    reason: 'Session not started',
                    schedule: enrollment
                };
            }

            if (session.status !== 'started') {
                return { 
                    canJoin: false, 
                    reason: 'Session not started',
                    session,
                    schedule: enrollment
                };
            }

            // Check if code has expired
            const now = new Date();
            const codeExpiry = new Date(session.code_expires_at);
            if (now > codeExpiry) {
                return { 
                    canJoin: false, 
                    reason: 'Access code expired',
                    session,
                    schedule: enrollment
                };
            }

            // Check if already joined
            if (session.attendance_status === 'present' || session.attendance_status === 'late') {
                return { 
                    canJoin: false, 
                    reason: 'Already joined',
                    session,
                    schedule: enrollment,
                    attendanceStatus: session.attendance_status
                };
            }

            return { 
                canJoin: true, 
                session,
                schedule: enrollment,
                attendanceStatus: session.attendance_status
            };
        } catch (error) {
            console.error('Failed to get session status:', error);
            throw error;
        }
    }

    // Auto-end expired sessions
    async autoEndExpiredSessions() {
        try {
            const settings = await this.getSettings();
            const now = new Date();
            
            // Find sessions that should be auto-ended
            const expiredSessions = await this.db.all(`
                SELECT cs.id, cs.end_time
                FROM class_sessions cs
                WHERE cs.status = 'started'
                AND cs.end_time + INTERVAL '${settings.auto_end_minutes} minutes' <= NOW()
            `);

            for (const session of expiredSessions) {
                await this.db.run(`
                    UPDATE class_sessions 
                    SET status = 'ended', session_ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [session.id]);

                console.log(`Auto-ended expired session ${session.id}`);
            }

            return expiredSessions.length;
        } catch (error) {
            console.error('Failed to auto-end expired sessions:', error);
            return 0;
        }
    }

    async autoProcessAbsentStudents() {
        try {
            const settings = await this.getSettings();
            // Find sessions that are ended or should be auto-ended by now
            const targetSessions = await this.db.all(`
                SELECT cs.id, cs.batch_id
                FROM class_sessions cs
                WHERE cs.status = 'ended'
                   OR (cs.status = 'started' AND cs.end_time + INTERVAL '${settings.auto_end_minutes} minutes' <= NOW())
            `);

            let totalInserted = 0;
            for (const s of targetSessions) {
                // Insert ABSENT rows into legacy attendance table for enrolled students missing a record
                const insertResult = await this.db.run(`
                    INSERT INTO attendance (session_id, student_id, status)
                    SELECT ?, ub.user_id, 'absent'
                    FROM user_batches ub
                    WHERE ub.batch_id = ?
                      AND NOT EXISTS (
                        SELECT 1 FROM attendance a WHERE a.session_id = ? AND a.student_id = ub.user_id
                      )
                `, [s.id, s.batch_id, s.id]);
                totalInserted += Number(insertResult?.rowCount || 0);
            }

            return totalInserted;
        } catch (error) {
            console.error('Failed to auto-process absent students:', error);
            return 0;
        }
    }
}

module.exports = AttendanceService;