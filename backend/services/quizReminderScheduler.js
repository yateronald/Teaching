const cron = require('node-cron');
const { sendQuizReminder } = require('../emails/emailService');

class QuizReminderScheduler {
    constructor(db) {
        this.db = db;
        this.scheduledJobs = new Map(); // Store scheduled jobs by quiz ID
        this.init();
    }

    init() {
        // Run every minute to check for quizzes that need reminders
        cron.schedule('* * * * *', () => {
            this.checkAndSendReminders();
        });
        
        console.log('📅 Quiz reminder scheduler initialized');
    }

    async checkAndSendReminders() {
        try {
            const now = new Date();
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
            
            // Find quizzes that start in exactly 5 minutes (within a 1-minute window)
            const upcomingQuizzes = await this.db.all(`
                SELECT 
                    q.id, q.title, q.start_date, q.duration_minutes, q.total_marks,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM quizzes q
                LEFT JOIN users u ON q.teacher_id = u.id
                WHERE q.status = 'published'
                AND datetime(q.start_date) BETWEEN datetime(?) AND datetime(?)
                AND q.id NOT IN (
                    SELECT quiz_id FROM quiz_reminders_sent WHERE quiz_id = q.id
                )
            `, [
                fiveMinutesFromNow.toISOString(),
                new Date(fiveMinutesFromNow.getTime() + 60 * 1000).toISOString()
            ]);

            for (const quiz of upcomingQuizzes) {
                await this.sendQuizReminders(quiz);
                
                // Mark reminder as sent to avoid duplicate reminders
                await this.db.run(`
                    INSERT OR IGNORE INTO quiz_reminders_sent (quiz_id, sent_at)
                    VALUES (?, ?)
                `, [quiz.id, now.toISOString()]);
            }
        } catch (error) {
            console.error('❌ Error in quiz reminder scheduler:', error);
        }
    }

    async sendQuizReminders(quiz) {
        try {
            // Get all students enrolled in this quiz
            const students = await this.db.all(`
                SELECT DISTINCT 
                    s.id, s.email, s.first_name, s.last_name, 
                    b.name as batch_name
                FROM quiz_batches qb
                JOIN batch_students bs ON qb.batch_id = bs.batch_id
                JOIN users s ON bs.student_id = s.id
                JOIN batches b ON qb.batch_id = b.id
                WHERE qb.quiz_id = ?
                AND s.email IS NOT NULL
            `, [quiz.id]);

            const teacherName = `${quiz.teacher_first_name || ''} ${quiz.teacher_last_name || ''}`.trim() || 'Your Teacher';

            for (const student of students) {
                try {
                    await sendQuizReminder({
                        to: student.email,
                        studentName: student.first_name || 'Student',
                        quizName: quiz.title,
                        teacherName: teacherName,
                        batchName: student.batch_name,
                        duration: quiz.duration_minutes || 0,
                        startDate: quiz.start_date,
                        totalPoints: quiz.total_marks || 0
                    });
                    
                    console.log(`⏰ Quiz reminder sent to ${student.email} for quiz: ${quiz.title}`);
                } catch (emailError) {
                    console.error(`❌ Failed to send quiz reminder to ${student.email}:`, emailError.message);
                }
            }
        } catch (error) {
            console.error(`❌ Error sending reminders for quiz ${quiz.id}:`, error);
        }
    }

    // Method to schedule a specific quiz reminder (alternative approach)
    scheduleQuizReminder(quizId, startDate) {
        const startTime = new Date(startDate);
        const reminderTime = new Date(startTime.getTime() - 5 * 60 * 1000); // 5 minutes before
        const now = new Date();

        // Only schedule if reminder time is in the future
        if (reminderTime > now) {
            const jobId = `quiz-reminder-${quizId}`;
            
            // Cancel existing job if any
            if (this.scheduledJobs.has(jobId)) {
                this.scheduledJobs.get(jobId).destroy();
            }

            // Schedule new job
            const job = cron.schedule(
                `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`,
                async () => {
                    try {
                        const quiz = await this.db.get(`
                            SELECT 
                                q.id, q.title, q.start_date, q.duration_minutes, q.total_marks,
                                u.first_name as teacher_first_name, u.last_name as teacher_last_name
                            FROM quizzes q
                            LEFT JOIN users u ON q.teacher_id = u.id
                            WHERE q.id = ? AND q.status = 'published'
                        `, [quizId]);

                        if (quiz) {
                            await this.sendQuizReminders(quiz);
                        }
                        
                        // Clean up the job after execution
                        this.scheduledJobs.delete(jobId);
                    } catch (error) {
                        console.error(`❌ Error in scheduled reminder for quiz ${quizId}:`, error);
                    }
                },
                { scheduled: false }
            );

            job.start();
            this.scheduledJobs.set(jobId, job);
            
            console.log(`📅 Scheduled reminder for quiz ${quizId} at ${reminderTime.toISOString()}`);
        }
    }

    // Cancel a scheduled reminder
    cancelQuizReminder(quizId) {
        const jobId = `quiz-reminder-${quizId}`;
        if (this.scheduledJobs.has(jobId)) {
            this.scheduledJobs.get(jobId).destroy();
            this.scheduledJobs.delete(jobId);
            console.log(`🗑️ Cancelled reminder for quiz ${quizId}`);
        }
    }

    // Get status of scheduled reminders
    getScheduledReminders() {
        return Array.from(this.scheduledJobs.keys());
    }
}

module.exports = QuizReminderScheduler;