const cron = require('node-cron');
const { sendClassReminder } = require('../emails/emailService');

// Database initialization - PostgreSQL only
const PostgreSQLDatabase = require('../database/init-postgres');
const database = new PostgreSQLDatabase();

class ReminderService {
    constructor() {
        this.scheduledReminders = new Map(); // Store scheduled reminders
        this.isRunning = false;
        this._dbInitPromise = null;
    }

    async _ensureDatabase() {
        try {
            if (!database.getDatabase()) {
                if (!this._dbInitPromise) {
                    this._dbInitPromise = database.initialize().catch(err => {
                        // Reset so we can retry next time if initialization fails
                        this._dbInitPromise = null;
                        throw err;
                    });
                }
                await this._dbInitPromise;
            }
        } catch (err) {
            console.error('ReminderService database init failed:', err.message || err);
            throw err;
        }
    }

    // Start the reminder service
    start() {
        if (this.isRunning) {
            console.log('Reminder service is already running');
            return;
        }

        // Run every minute to check for reminders
        this.cronJob = cron.schedule('* * * * *', async () => {
            await this.checkAndSendReminders();
        }, {
            scheduled: false
        });

        this.cronJob.start();
        this.isRunning = true;
        console.log('Reminder service started - checking for class reminders every minute');
    }

    // Stop the reminder service
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.scheduledReminders.clear();
        this.isRunning = false;
        console.log('Reminder service stopped');
    }

    // Check for classes that need reminders and send them
    async checkAndSendReminders() {
        try {
            await this._ensureDatabase();

            const now = new Date();
            const windowStart = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
            const windowEnd = new Date(now.getTime() + 6 * 60 * 1000);   // 6 minutes from now (1-minute window)
            
            // Find classes starting in approximately 5 minutes (within 1 minute window)
            const upcomingClasses = await database.all(`
                SELECT 
                    s.id, s.title, s.description, s.start_time, s.end_time, 
                    s.location, s.location_mode, s.link, s.batch_id,
                    b.name as batch_name, b.french_level,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM schedules s
                JOIN batches b ON s.batch_id = b.id
                JOIN users u ON b.teacher_id = u.id
                WHERE s.status = 'scheduled'
                AND s.type = 'class'
                AND s.start_time >= $1 AND s.start_time < $2
            `, [
                windowStart,
                windowEnd
            ]);

            for (const classInfo of upcomingClasses) {
                const reminderKey = `${classInfo.id}_${classInfo.start_time}`;
                
                // Skip if we've already sent a reminder for this class
                if (this.scheduledReminders.has(reminderKey)) {
                    continue;
                }

                // Get all students in this batch
                const students = await database.all(`
                    SELECT u.id, u.email, u.first_name, u.last_name, u.timezone
                    FROM users u
                    JOIN batch_students bs ON u.id = bs.student_id
                    WHERE bs.batch_id = ? AND u.role = 'student'
                `, [classInfo.batch_id]);

                // Send reminders to all students
                const reminderPromises = students.map(student => 
                    this.sendReminderToStudent(student, classInfo)
                );

                await Promise.allSettled(reminderPromises);
                
                // Mark this reminder as sent
                this.scheduledReminders.set(reminderKey, {
                    classId: classInfo.id,
                    sentAt: now,
                    studentCount: students.length
                });

                console.log(`Sent class reminders for "${classInfo.title}" to ${students.length} students`);
            }

            // Clean up old reminder records (older than 24 hours)
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            for (const [key, reminder] of this.scheduledReminders.entries()) {
                if (reminder.sentAt < oneDayAgo) {
                    this.scheduledReminders.delete(key);
                }
            }

        } catch (error) {
            console.error('Error checking for class reminders:', error);
        }
    }

    // Send reminder to individual student
    async sendReminderToStudent(student, classInfo) {
        try {
            const startTime = new Date(classInfo.start_time);
            const endTime = new Date(classInfo.end_time);

            // Send full ISO timestamps. The email template's
            // `combineDateAndTime` detects ISO and `formatRecipientTime`
            // renders in the student's own timezone — never use
            // `toTimeString()` (server local zone, double-shifted).
            const startIso = startTime.toISOString();
            const endIso   = endTime.toISOString();

            await sendClassReminder({
                to: student.email,
                studentName: student.first_name || student.last_name || 'Student',
                className: classInfo.title,
                teacherName: `${classInfo.teacher_first_name || ''} ${classInfo.teacher_last_name || ''}`.trim() || 'Your Teacher',
                batchName: classInfo.batch_name,
                startTime: startIso,
                endTime: endIso,
                date: startIso,
                location: classInfo.location,
                locationMode: classInfo.location_mode || 'physical',
                link: classInfo.link,
                recipientTimezone: student.timezone || 'UTC',
            });

            console.log(`Reminder sent to ${student.email} for class "${classInfo.title}"`);
        } catch (error) {
            console.error(`Failed to send reminder to ${student.email}:`, error);
        }
    }

    // Schedule a specific reminder (can be used for immediate scheduling)
    async scheduleReminder(scheduleId, reminderTime) {
        try {
            await this._ensureDatabase();

            const classInfo = await database.get(`
                SELECT 
                    s.id, s.title, s.description, s.start_time, s.end_time, 
                    s.location, s.location_mode, s.link, s.batch_id,
                    b.name as batch_name, b.french_level,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM schedules s
                JOIN batches b ON s.batch_id = b.id
                JOIN users u ON b.teacher_id = u.id
                WHERE s.id = ? AND s.status = 'scheduled' AND s.type = 'class'
            `, [scheduleId]);

            if (!classInfo) {
                console.log(`No schedulable class found with ID ${scheduleId}`);
                return false;
            }

            const reminderKey = `${classInfo.id}_${classInfo.start_time}`;
            
            // Check if reminder already scheduled
            if (this.scheduledReminders.has(reminderKey)) {
                console.log(`Reminder already scheduled for class ${scheduleId}`);
                return false;
            }

            // Get students in the batch
            const students = await database.all(`
                SELECT u.id, u.email, u.first_name, u.last_name, u.timezone
                FROM users u
                JOIN batch_students bs ON u.id = bs.student_id
                WHERE bs.batch_id = ? AND u.role = 'student'
            `, [classInfo.batch_id]);

            if (students.length === 0) {
                console.log(`No students found for batch ${classInfo.batch_id}`);
                return false;
            }

            // Schedule the reminder
            const now = new Date();
            const reminderDelay = reminderTime.getTime() - now.getTime();

            if (reminderDelay <= 0) {
                console.log(`Reminder time has already passed for class ${scheduleId}`);
                return false;
            }

            setTimeout(async () => {
                const reminderPromises = students.map(student => 
                    this.sendReminderToStudent(student, classInfo)
                );

                await Promise.allSettled(reminderPromises);
                console.log(`Scheduled reminder sent for "${classInfo.title}" to ${students.length} students`);
            }, reminderDelay);

            // Mark as scheduled
            this.scheduledReminders.set(reminderKey, {
                classId: classInfo.id,
                scheduledAt: now,
                reminderTime: reminderTime,
                studentCount: students.length
            });

            console.log(`Reminder scheduled for class "${classInfo.title}" at ${reminderTime.toISOString()}`);
            return true;

        } catch (error) {
            console.error('Error scheduling reminder:', error);
            return false;
        }
    }

    // Get status of scheduled reminders
    getScheduledReminders() {
        return Array.from(this.scheduledReminders.entries()).map(([key, reminder]) => ({
            key,
            ...reminder
        }));
    }
}

// Create singleton instance
const reminderService = new ReminderService();

module.exports = reminderService;