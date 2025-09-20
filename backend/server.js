const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Database = require('./database/init');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const batchRoutes = require('./routes/batches');
const quizRoutes = require('./routes/quizzes');
const resourceRoutes = require('./routes/resources');
const scheduleRoutes = require('./routes/schedules');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
const database = new Database();

// Middleware
const corsOptions = {
    origin: [
        'https://teaching-qnvf.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5177',
        'http://localhost:3000'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploaded resources
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make database available to routes
app.use((req, res, next) => {
    req.db = database;
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email-change', require('./routes/emailChange'));
app.use('/api/password-reset', require('./routes/passwordReset'));
app.use('/api/batches', batchRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'French Teaching System API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// --- Quiz Auto-Reconciliation (auto-submit + auto-grade) ---
const AUTO_RECONCILE_INTERVAL_MS = 60 * 1000; // 1 minute
let reconcileTimer = null;

async function calculateQuizResultsServer(db, submissionId) {
    const submission = await db.get(
        'SELECT id, quiz_id FROM quiz_submissions WHERE id = ?',
        [submissionId]
    );
    if (!submission) return { totalScore: 0, maxScore: 0, percentage: 0 };

    const maxScoreRow = await db.get(
        'SELECT COALESCE(SUM(marks), 0) AS max_score FROM questions WHERE quiz_id = ?',
        [submission.quiz_id]
    );
    const maxScore = maxScoreRow && typeof maxScoreRow.max_score === 'number'
        ? maxScoreRow.max_score
        : (maxScoreRow?.max_score || 0);

    const answers = await db.all(`
        SELECT sa.*, q.marks, q.question_type, q.correct_answer
        FROM student_answers sa
        JOIN questions q ON sa.question_id = q.id
        WHERE sa.submission_id = ?
    `, [submissionId]);

    let totalScore = 0;

    for (const answer of answers) {
        let isCorrect = false;
        let marksAwarded = 0;

        if (answer.question_type === 'yes_no') {
            isCorrect = answer.answer_text === answer.correct_answer;
            marksAwarded = isCorrect ? answer.marks : 0;
        } else if (answer.question_type === 'mcq_single' || answer.question_type === 'mcq_multiple') {
            let selectedOptions = [];
            try { selectedOptions = JSON.parse(answer.selected_options || '[]') || []; } catch {}

            const correctOptions = await db.all(
                'SELECT id FROM question_options WHERE question_id = ? AND is_correct = 1',
                [answer.question_id]
            );
            const correctIds = correctOptions.map(opt => opt.id);

            if (answer.question_type === 'mcq_single') {
                isCorrect = selectedOptions.length === 1 && correctIds.includes(selectedOptions[0]);
                marksAwarded = isCorrect ? answer.marks : 0;
            } else {
                const totalCorrect = correctIds.length || 1;
                const correctSelected = selectedOptions.filter(id => correctIds.includes(id)).length;
                const incorrectSelected = selectedOptions.filter(id => !correctIds.includes(id)).length;

                const positive = (correctSelected / totalCorrect) * answer.marks;
                const negative = (incorrectSelected / totalCorrect) * answer.marks;
                const rawScore = positive - negative;
                marksAwarded = Math.max(0, Math.min(answer.marks, rawScore));
                isCorrect = correctSelected === totalCorrect && incorrectSelected === 0;
            }
        }

        await db.run(
            'UPDATE student_answers SET marks_awarded = ?, is_correct = ? WHERE id = ?',
            [marksAwarded, isCorrect, answer.id]
        );
        totalScore += marksAwarded;
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    await db.run(
        "UPDATE quiz_submissions SET total_score = ?, max_score = ?, percentage = ?, status = 'graded', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [totalScore, maxScore, percentage, submissionId]
    );

    return { totalScore, maxScore, percentage };
}

async function reconcileOverdueQuizzes(db) {
    const nowIso = new Date().toISOString();
    try {
        // 1) Auto-submit overdue in-progress submissions (duration exceeded OR end_date passed)
        const overdueInProgress = await db.all(`
            SELECT qs.id AS submission_id, qs.quiz_id, qs.started_at, q.duration_minutes, q.end_date
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            WHERE qs.status = 'in_progress' AND q.status = 'published' AND q.auto_submit = 1
              AND (
                (q.duration_minutes IS NOT NULL AND datetime(qs.started_at, '+' || q.duration_minutes || ' minutes') <= datetime('now'))
                OR (q.end_date IS NOT NULL AND datetime(q.end_date) <= datetime('now'))
              )
        `);

        for (const row of overdueInProgress) {
            // Persist autosaved answers (if any)
            const submission = await db.get('SELECT id, auto_saved_data, started_at FROM quiz_submissions WHERE id = ?', [row.submission_id]);
            let answers = [];
            try { answers = submission?.auto_saved_data ? JSON.parse(submission.auto_saved_data) : []; } catch {}

            for (const ans of answers) {
                await db.run(
                    'INSERT OR REPLACE INTO student_answers (submission_id, question_id, answer_text, selected_options) VALUES (?, ?, ?, ?)',
                    [row.submission_id, ans.question_id, ans.answer_text || null, ans.selected_options ? JSON.stringify(ans.selected_options) : null]
                );
            }

            // Compute time taken up to the hard deadline
            const startMs = submission?.started_at ? new Date(submission.started_at).getTime() : Date.now();
            const nominalEndMs = row.duration_minutes ? startMs + (Number(row.duration_minutes) * 60 * 1000) : startMs;
            const hardEndMs = row.end_date ? Math.min(nominalEndMs, new Date(row.end_date).getTime()) : nominalEndMs;
            const timeTakenMin = Math.max(0, Math.round((hardEndMs - startMs) / (1000 * 60)));

            await db.run(
                "UPDATE quiz_submissions SET status = 'auto_submitted', submitted_at = ?, time_taken_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [nowIso, timeTakenMin, row.submission_id]
            );

            await calculateQuizResultsServer(db, row.submission_id);
        }

        // 2) Quizzes that ended but never started (mark graded with zero)
        const neverStarted = await db.all(`
            SELECT qs.id AS submission_id, qs.quiz_id
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            WHERE (qs.status = 'not_started' OR qs.status = 'assigned')
              AND q.status = 'published' AND q.auto_submit = 1
              AND q.end_date IS NOT NULL AND datetime(q.end_date) <= datetime('now')
        `);

        for (const row of neverStarted) {
            // Ensure max_score is present
            const maxScoreRow = await db.get('SELECT COALESCE(SUM(marks), 0) AS max_score FROM questions WHERE quiz_id = ?', [row.quiz_id]);
            const maxScore = maxScoreRow?.max_score || 0;
            await db.run(
                "UPDATE quiz_submissions SET status = 'auto_submitted', submitted_at = ?, time_taken_minutes = 0, total_score = 0, max_score = ?, percentage = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [nowIso, maxScore, row.submission_id]
            );
            // Finalize as graded
            await db.run(
                "UPDATE quiz_submissions SET status = 'graded', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [row.submission_id]
            );
        }

        // 3) Submissions stuck in 'submitted' but not graded (legacy path)
        const submittedNotGraded = await db.all(`
            SELECT id AS submission_id FROM quiz_submissions WHERE status = 'submitted' AND (percentage IS NULL OR max_score IS NULL)
        `);
        for (const row of submittedNotGraded) {
            await calculateQuizResultsServer(db, row.submission_id);
        }

    } catch (err) {
        console.error('Quiz auto-reconcile error:', err);
    }
}

// Start server
async function startServer() {
    try {
        await database.initialize();
        
        app.listen(PORT, () => {
            // Server started successfully
        });

        // Start periodic auto-reconciliation job and run once on startup
        if (!reconcileTimer) {
            reconcileTimer = setInterval(() => {
                reconcileOverdueQuizzes(database).catch((e) => console.error('Auto-reconcile tick failed:', e));
            }, AUTO_RECONCILE_INTERVAL_MS);
            reconcileOverdueQuizzes(database).catch(() => {});
        }
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    if (reconcileTimer) clearInterval(reconcileTimer);
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    if (reconcileTimer) clearInterval(reconcileTimer);
    await database.close();
    process.exit(0);
});

startServer();