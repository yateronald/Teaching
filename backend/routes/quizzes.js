const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin, authenticated } = require('../middleware/auth');

const router = express.Router();

// Get all quizzes (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let sql = `
            SELECT 
                q.id, q.title, q.description, q.status, q.created_at, q.updated_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                COUNT(DISTINCT qb.batch_id) as batch_count,
                COUNT(DISTINCT qs.id) as submission_count
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            LEFT JOIN quiz_batches qb ON q.id = qb.quiz_id
            LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
        `;
        let params = [];
        
        if (req.user.role === 'teacher') {
            sql += ' WHERE q.teacher_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            sql += `
                WHERE q.id IN (
                    SELECT DISTINCT qb.quiz_id 
                    FROM quiz_batches qb
                    JOIN batch_students bs ON qb.batch_id = bs.batch_id
                    WHERE bs.student_id = ? AND q.status = 'published'
                )
            `;
            params.push(req.user.id);
        }
        
        sql += ' GROUP BY q.id ORDER BY q.created_at DESC';
        
        const quizzes = await req.db.all(sql, params);
        res.json(quizzes);
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
});

// Get quiz by ID with questions
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get quiz details
        const quiz = await req.db.get(`
            SELECT 
                q.id, q.title, q.description, q.status, q.created_at, q.updated_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ?
        `, [id]);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }
        
        // Check access permissions
        if (req.user.role === 'teacher' && quiz.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (req.user.role === 'student') {
            // Check if student has access to this quiz
            const hasAccess = await req.db.get(`
                SELECT 1 FROM quiz_batches qb
                JOIN batch_students bs ON qb.batch_id = bs.batch_id
                WHERE qb.quiz_id = ? AND bs.student_id = ? AND EXISTS (
                    SELECT 1 FROM quizzes WHERE id = ? AND status = 'published'
                )
            `, [id, req.user.id, id]);
            
            if (!hasAccess) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        // Get questions with options
        const questions = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.question_order, q.points
            FROM questions q
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [id]);
        
        // Get options for MCQ questions
        for (let question of questions) {
            if (question.question_type === 'mcq') {
                question.options = await req.db.all(`
                    SELECT id, option_text, option_order
                    FROM question_options
                    WHERE question_id = ?
                    ORDER BY option_order
                `, [question.id]);
            }
        }
        
        // Get assigned batches
        const batches = await req.db.all(`
            SELECT 
                b.id, b.name, b.french_level,
                qb.assigned_at
            FROM quiz_batches qb
            JOIN batches b ON qb.batch_id = b.id
            WHERE qb.quiz_id = ?
        `, [id]);
        
        res.json({
            ...quiz,
            questions,
            batches
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
});

// Create new quiz (Teachers only)
router.post('/', [
    authenticateToken,
    teacherOrAdmin,
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('questions').isArray({ min: 1 }),
    body('batch_ids').isArray({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { title, description, questions, batch_ids } = req.body;
        const teacher_id = req.user.role === 'admin' ? req.body.teacher_id : req.user.id;

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.question_text || !question.question_type) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: Missing required fields` 
                });
            }
            
            if (!['mcq', 'text', 'boolean'].includes(question.question_type)) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: Invalid question type` 
                });
            }
            
            if (question.question_type === 'mcq' && (!question.options || question.options.length < 2)) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: MCQ must have at least 2 options` 
                });
            }
        }

        // Validate batch access
        let batchCheckSql = 'SELECT id FROM batches WHERE id IN (' + batch_ids.map(() => '?').join(',') + ')';
        let batchParams = [...batch_ids];
        
        if (req.user.role === 'teacher') {
            batchCheckSql += ' AND teacher_id = ?';
            batchParams.push(req.user.id);
        }
        
        const validBatches = await req.db.all(batchCheckSql, batchParams);
        if (validBatches.length !== batch_ids.length) {
            return res.status(400).json({ error: 'Invalid batch IDs or access denied' });
        }

        // Create quiz
        const quizResult = await req.db.run(
            'INSERT INTO quizzes (title, description, teacher_id, status) VALUES (?, ?, ?, ?)',
            [title, description || null, teacher_id, 'draft']
        );

        const quizId = quizResult.id;

        // Add questions
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const questionResult = await req.db.run(
                'INSERT INTO questions (quiz_id, question_text, question_type, question_order, points) VALUES (?, ?, ?, ?, ?)',
                [quizId, question.question_text, question.question_type, i + 1, question.points || 1]
            );

            // Add options for MCQ questions
            if (question.question_type === 'mcq' && question.options) {
                for (let j = 0; j < question.options.length; j++) {
                    await req.db.run(
                        'INSERT INTO question_options (question_id, option_text, option_order) VALUES (?, ?, ?)',
                        [questionResult.id, question.options[j].option_text, j + 1]
                    );
                }
            }
        }

        // Assign quiz to batches
        for (const batchId of batch_ids) {
            await req.db.run(
                'INSERT INTO quiz_batches (quiz_id, batch_id) VALUES (?, ?)',
                [quizId, batchId]
            );
        }

        // Get created quiz
        const newQuiz = await req.db.get(`
            SELECT 
                q.id, q.title, q.description, q.status, q.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ?
        `, [quizId]);

        res.status(201).json({
            message: 'Quiz created successfully',
            quiz: newQuiz
        });

    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});

// Update quiz status (publish/unpublish)
router.patch('/:id/status', [
    authenticateToken,
    teacherOrAdmin,
    body('status').isIn(['draft', 'published'])
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
        const { status } = req.body;

        // Check if quiz exists and user has access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }

        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }

        // Update status
        await req.db.run(
            'UPDATE quizzes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        // If publishing, create submissions for all students in assigned batches
        if (status === 'published') {
            const students = await req.db.all(`
                SELECT DISTINCT bs.student_id
                FROM quiz_batches qb
                JOIN batch_students bs ON qb.batch_id = bs.batch_id
                WHERE qb.quiz_id = ?
            `, [id]);

            // Calculate max score
            const maxScoreResult = await req.db.get(
                'SELECT SUM(points) as max_score FROM questions WHERE quiz_id = ?',
                [id]
            );
            const maxScore = maxScoreResult.max_score || 0;

            for (const student of students) {
                // Check if submission already exists
                const existingSubmission = await req.db.get(
                    'SELECT id FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?',
                    [id, student.student_id]
                );

                if (!existingSubmission) {
                    await req.db.run(
                        'INSERT INTO quiz_submissions (quiz_id, student_id, status, max_score) VALUES (?, ?, ?, ?)',
                        [id, student.student_id, 'assigned', maxScore]
                    );
                }
            }
        }

        res.json({ message: `Quiz ${status} successfully` });

    } catch (error) {
        console.error('Update quiz status error:', error);
        res.status(500).json({ error: 'Failed to update quiz status' });
    }
});

// Delete quiz
router.delete('/:id', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if quiz exists and user has access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        await req.db.run('DELETE FROM quizzes WHERE id = ?', [id]);
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});

// Submit quiz answers (Students only)
router.post('/:id/submit', [
    authenticateToken,
    authenticated,
    body('answers').isArray({ min: 1 })
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
        const { answers } = req.body;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit quiz answers' });
        }

        // Check if student has access to this quiz
        const hasAccess = await req.db.get(`
            SELECT qs.id as submission_id, qs.status
            FROM quiz_submissions qs
            WHERE qs.quiz_id = ? AND qs.student_id = ?
        `, [id, req.user.id]);

        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied or quiz not assigned' });
        }

        if (hasAccess.status !== 'assigned') {
            return res.status(400).json({ error: 'Quiz already submitted or graded' });
        }

        const submissionId = hasAccess.submission_id;

        // Save answers
        for (const answer of answers) {
            const { question_id, answer_text, selected_options } = answer;
            
            await req.db.run(`
                INSERT OR REPLACE INTO student_answers 
                (submission_id, question_id, answer_text, selected_options) 
                VALUES (?, ?, ?, ?)
            `, [
                submissionId, 
                question_id, 
                answer_text || null, 
                selected_options ? JSON.stringify(selected_options) : null
            ]);
        }

        // Update submission status
        await req.db.run(
            'UPDATE quiz_submissions SET status = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['submitted', submissionId]
        );

        res.json({ message: 'Quiz submitted successfully' });

    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get quiz submissions for grading (Teachers only)
router.get('/:id/submissions', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user has access to this quiz
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        const submissions = await req.db.all(`
            SELECT 
                qs.id, qs.status, qs.submitted_at, qs.graded_at, qs.published_at,
                qs.total_score, qs.max_score, qs.teacher_comments,
                u.id as student_id, u.first_name, u.last_name, u.email
            FROM quiz_submissions qs
            JOIN users u ON qs.student_id = u.id
            WHERE qs.quiz_id = ?
            ORDER BY qs.submitted_at DESC, u.first_name, u.last_name
        `, [id]);
        
        res.json(submissions);
    } catch (error) {
        console.error('Get quiz submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz submissions' });
    }
});

// Get specific submission for grading
router.get('/:id/submissions/:submissionId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id, submissionId } = req.params;
        
        // Check access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        // Get submission details
        const submission = await req.db.get(`
            SELECT 
                qs.id, qs.status, qs.submitted_at, qs.total_score, qs.max_score, qs.teacher_comments,
                u.first_name, u.last_name, u.email
            FROM quiz_submissions qs
            JOIN users u ON qs.student_id = u.id
            WHERE qs.id = ? AND qs.quiz_id = ?
        `, [submissionId, id]);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        // Get questions with student answers
        const questions = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.points,
                sa.answer_text, sa.selected_options, sa.score, sa.teacher_feedback
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [submissionId, id]);
        
        // Get options for MCQ questions
        for (let question of questions) {
            if (question.question_type === 'mcq') {
                question.options = await req.db.all(`
                    SELECT id, option_text, option_order
                    FROM question_options
                    WHERE question_id = ?
                    ORDER BY option_order
                `, [question.id]);
                
                // Parse selected options
                if (question.selected_options) {
                    try {
                        question.selected_options = JSON.parse(question.selected_options);
                    } catch (e) {
                        question.selected_options = [];
                    }
                }
            }
        }
        
        res.json({
            ...submission,
            questions
        });
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// Grade submission (Teachers only)
router.post('/:id/submissions/:submissionId/grade', [
    authenticateToken,
    teacherOrAdmin,
    body('grades').isArray({ min: 1 }),
    body('teacher_comments').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { id, submissionId } = req.params;
        const { grades, teacher_comments } = req.body;
        
        // Check access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        // Update individual question scores
        let totalScore = 0;
        for (const grade of grades) {
            const { question_id, score, teacher_feedback } = grade;
            
            await req.db.run(`
                UPDATE student_answers 
                SET score = ?, teacher_feedback = ?, updated_at = CURRENT_TIMESTAMP
                WHERE submission_id = ? AND question_id = ?
            `, [score || 0, teacher_feedback || null, submissionId, question_id]);
            
            totalScore += (score || 0);
        }
        
        // Update submission with total score and status
        await req.db.run(`
            UPDATE quiz_submissions 
            SET total_score = ?, teacher_comments = ?, status = 'graded', 
                graded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [totalScore, teacher_comments || null, submissionId]);
        
        res.json({ message: 'Submission graded successfully' });
        
    } catch (error) {
        console.error('Grade submission error:', error);
        res.status(500).json({ error: 'Failed to grade submission' });
    }
});

// Publish grades (Teachers only)
router.post('/:id/submissions/:submissionId/publish', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id, submissionId } = req.params;
        
        // Check access
        let quiz;
        if (req.user.role === 'teacher') {
            quiz = await req.db.get(
                'SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            quiz = await req.db.get('SELECT id FROM quizzes WHERE id = ?', [id]);
        }
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        // Update submission status to published
        const result = await req.db.run(`
            UPDATE quiz_submissions 
            SET status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND status = 'graded'
        `, [submissionId]);
        
        if (result.changes === 0) {
            return res.status(400).json({ error: 'Submission not found or not graded yet' });
        }
        
        res.json({ message: 'Grades published successfully' });
        
    } catch (error) {
        console.error('Publish grades error:', error);
        res.status(500).json({ error: 'Failed to publish grades' });
    }
});

// Get student's quiz results
router.get('/:id/result', authenticateToken, authenticated, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can view quiz results' });
        }
        
        const result = await req.db.get(`
            SELECT 
                qs.id, qs.status, qs.submitted_at, qs.published_at,
                qs.total_score, qs.max_score, qs.teacher_comments,
                q.title as quiz_title
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            WHERE qs.quiz_id = ? AND qs.student_id = ?
        `, [id, req.user.id]);
        
        if (!result) {
            return res.status(404).json({ error: 'Quiz result not found' });
        }
        
        if (result.status !== 'published') {
            return res.status(400).json({ error: 'Results not yet published' });
        }
        
        // Get question-wise results
        const questions = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.points,
                sa.score, sa.teacher_feedback
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [result.id, id]);
        
        res.json({
            ...result,
            questions
        });
        
    } catch (error) {
        console.error('Get quiz result error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz result' });
    }
});

module.exports = router;