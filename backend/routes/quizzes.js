const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin, authenticated } = require('../middleware/auth');

const router = express.Router();

// Helper function to check if quiz is accessible to student
const isQuizAccessible = async (db, quizId, studentId) => {
    const quiz = await db.get(`
        SELECT q.*, qb.batch_id
        FROM quizzes q
        JOIN quiz_batches qb ON q.id = qb.quiz_id
        JOIN batch_students bs ON qb.batch_id = bs.batch_id
        WHERE q.id = ? AND bs.student_id = ? AND q.status = 'published'
    `, [quizId, studentId]);
    
    if (!quiz) return { accessible: false, reason: 'Quiz not found or not published' };
    
    const now = new Date();
    
    // Check start date
    if (quiz.start_date && new Date(quiz.start_date) > now) {
        return { accessible: false, reason: 'Quiz has not started yet', quiz };
    }
    
    // Check end date
    if (quiz.end_date && new Date(quiz.end_date) < now) {
        return { accessible: false, reason: 'Quiz has ended', quiz };
    }
    
    return { accessible: true, quiz };
};

// Helper function to calculate quiz results
const calculateQuizResults = async (db, submissionId) => {
    // Ensure we compute max score from ALL questions in the quiz, not only answered ones
    const submission = await db.get(
        'SELECT id, quiz_id FROM quiz_submissions WHERE id = ?',
        [submissionId]
    );
    if (!submission) {
        return { totalScore: 0, maxScore: 0, percentage: 0 };
    }

    // Total marks across all questions in this quiz
    const maxScoreRow = await db.get(
        'SELECT COALESCE(SUM(marks), 0) AS max_score FROM questions WHERE quiz_id = ?',
        [submission.quiz_id]
    );
    const maxScore = maxScoreRow && typeof maxScoreRow.max_score === 'number' ? maxScoreRow.max_score : (maxScoreRow?.max_score || 0);

    // Grade only the answers that exist; unanswered implicitly earn 0
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
                // Multiple-answer MCQ grading with proportional scoring and penalty for wrong picks
                const totalCorrect = correctIds.length || 1; // avoid divide-by-zero
                const correctSelected = selectedOptions.filter(id => correctIds.includes(id)).length; // S
                const incorrectSelected = selectedOptions.filter(id => !correctIds.includes(id)).length; // W

                const positive = (correctSelected / totalCorrect) * answer.marks; // (S/C) * marks
                const negative = (incorrectSelected / totalCorrect) * answer.marks; // (W/C) * marks
                const rawScore = positive - negative;

                // Clamp to [0, full marks]
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
        "UPDATE quiz_submissions SET total_score = ?, max_score = ?, percentage = ?, status = 'graded' WHERE id = ?",
        [totalScore, maxScore, percentage, submissionId]
    );

    return { totalScore, maxScore, percentage };
};

// Get all quizzes (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        let sql = `
            SELECT 
                q.id, q.title, q.description, q.status, q.start_date, q.end_date, 
                q.duration_minutes, q.total_marks, q.created_at, q.updated_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                COUNT(DISTINCT qb.batch_id) as batch_count,
                COUNT(DISTINCT CASE WHEN qs.status IN ('submitted','auto_submitted','graded') THEN qs.student_id END) as submitted_students,
                COUNT(DISTINCT bs.student_id) as total_students,
                (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as total_questions,
                GROUP_CONCAT(DISTINCT b.name) as batch_names,
                GROUP_CONCAT(DISTINCT b.french_level) as french_levels,
                ROUND(AVG(CASE WHEN qs.status IN ('submitted','auto_submitted','graded') AND qs.percentage IS NOT NULL THEN qs.percentage END), 1) as avg_score
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            LEFT JOIN quiz_batches qb ON q.id = qb.quiz_id
            LEFT JOIN batches b ON qb.batch_id = b.id
            LEFT JOIN batch_students bs ON b.id = bs.batch_id
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
        
        // For students, add submission status and accessibility info
        if (req.user.role === 'student') {
            for (let quiz of quizzes) {
                const submission = await req.db.get(`
                    SELECT status, started_at, submitted_at, total_score, max_score, percentage
                    FROM quiz_submissions 
                    WHERE quiz_id = ? AND student_id = ?
                `, [quiz.id, req.user.id]);
                
                const rawStatus = submission ? submission.status : 'not_started';
                const computedStatus = ['submitted','auto_submitted','graded'].includes(rawStatus) ? 'completed' : rawStatus;
                quiz.submission_status = computedStatus;
                quiz.submission = submission || null;
                
                const now = new Date();
                quiz.can_start = !quiz.start_date || new Date(quiz.start_date) <= now;
                quiz.has_ended = !!(quiz.end_date && new Date(quiz.end_date) < now);
                
                // Results visibility for students: hide until end_date has passed
                quiz.can_view_results = !quiz.end_date || new Date(quiz.end_date) <= now;
                if (!quiz.can_view_results && quiz.submission) {
                    quiz.submission.percentage = null;
                    quiz.submission.total_score = null;
                    quiz.submission.max_score = null;
                }
            }
        }
        
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
                q.id, q.title, q.description, q.instructions, q.status, q.created_at, q.updated_at,
                q.start_date, q.end_date, q.duration_minutes, q.total_marks, q.randomize_questions, q.randomize_options, q.auto_submit,
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
                q.id, q.question_text, q.question_type, q.question_order, q.marks, q.correct_answer
            FROM questions q
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [id]);
        
        // Get options for MCQ questions
        for (let question of questions) {
            if (question.question_type === 'mcq' || question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple') {
                question.options = await req.db.all(`
                    SELECT id, option_text, is_correct, option_order
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
    body('instructions').optional().trim(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('duration_minutes').optional().isInt({ min: 1 }),
    body('randomize_questions').optional().isBoolean(),
    body('randomize_options').optional().isBoolean(),
    body('auto_submit').optional().isBoolean(),
    body('total_marks').optional().isNumeric(),
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

        const { 
            title, description, instructions, start_date, end_date, duration_minutes,
            randomize_questions, randomize_options, auto_submit, total_marks, questions, batch_ids 
        } = req.body;
        const teacher_id = req.user.role === 'admin' ? req.body.teacher_id : req.user.id;

        // Validate date logic
        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Validate questions and calculate total marks
        let calculatedTotalMarks = 0;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (!question.question_text || !question.question_type || question.marks === undefined) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: Missing required fields (question_text, question_type, marks)` 
                });
            }
            
            if (!['mcq_single', 'mcq_multiple', 'yes_no'].includes(question.question_type)) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: Invalid question type. Must be mcq_single, mcq_multiple, or yes_no` 
                });
            }
            
            if (question.question_type.startsWith('mcq') && (!question.options || question.options.length < 2)) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: MCQ must have at least 2 options` 
                });
            }
            
            if (question.question_type.startsWith('mcq')) {
                const correctOptions = question.options.filter(opt => opt.is_correct);
                if (correctOptions.length === 0) {
                    return res.status(400).json({ 
                        error: `Question ${i + 1}: At least one option must be marked as correct` 
                    });
                }
                
                if (question.question_type === 'mcq_single' && correctOptions.length > 1) {
                    return res.status(400).json({ 
                        error: `Question ${i + 1}: Single choice MCQ can have only one correct answer` 
                    });
                }
            }
            
            if (question.question_type === 'yes_no' && !question.correct_answer) {
                return res.status(400).json({ 
                    error: `Question ${i + 1}: Yes/No question must have a correct answer specified` 
                });
            }
            
            calculatedTotalMarks += Number(question.marks);
        }
        
        // Use provided total_marks or calculated total
        const finalTotalMarks = total_marks ? Number(total_marks) : calculatedTotalMarks;

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
        const quizResult = await req.db.run(`
            INSERT INTO quizzes (
                title, description, instructions, teacher_id, status, start_date, end_date, 
                duration_minutes, total_marks, randomize_questions, randomize_options, auto_submit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, description || null, instructions || null, teacher_id, 'draft',
            start_date || null, end_date || null, duration_minutes || null, finalTotalMarks,
            randomize_questions || false, randomize_options || false, auto_submit !== false
        ]);

        const quizId = quizResult.id;

        // Add questions
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const questionResult = await req.db.run(`
                INSERT INTO questions (
                    quiz_id, question_text, question_type, question_order, marks, correct_answer, explanation
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                quizId, question.question_text, question.question_type, i + 1, 
                Number(question.marks), question.correct_answer || null, question.explanation || null
            ]);

            // Add options for MCQ questions
            if (question.question_type.startsWith('mcq') && question.options) {
                for (let j = 0; j < question.options.length; j++) {
                    await req.db.run(
                        'INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)',
                        [questionResult.id, question.options[j].option_text, j + 1, question.options[j].is_correct || false]
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

// Update an existing quiz
router.put('/:id', [
    authenticateToken,
    teacherOrAdmin
], async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            instructions,
            start_date,
            end_date,
            duration_minutes,
            total_marks,
            randomize_questions,
            randomize_options,
            auto_submit,
            status,
            batch_ids,
            questions
        } = req.body;

        // Basic validations
        if (!title || !Array.isArray(batch_ids) || batch_ids.length === 0) {
            return res.status(400).json({ error: 'Title and batch_ids are required' });
        }
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ error: 'At least one question is required' });
        }

        // Check quiz exists and access
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

        // Validate date logic
        if (start_date && end_date) {
            const start = new Date(start_date);
            const end = new Date(end_date);
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
                return res.status(400).json({ error: 'Invalid start/end date' });
            }
        }

        // Validate batches belong to teacher (or admin)
        let batchCheckSql = 'SELECT id FROM batches WHERE id IN (' + batch_ids.map(() => '?').join(',') + ')';
        const batchParams = [...batch_ids];
        if (req.user.role === 'teacher') {
            batchCheckSql += ' AND teacher_id = ?';
            batchParams.push(req.user.id);
        }
        const validBatches = await req.db.all(batchCheckSql, batchParams);
        if (validBatches.length !== batch_ids.length) {
            return res.status(400).json({ error: 'Invalid batch IDs or access denied' });
        }

        // Validate questions content
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question_text || !q.question_type) {
                return res.status(400).json({ error: `Question ${i + 1}: question_text and question_type are required` });
            }
            const marksNum = Number(q.marks);
            if (Number.isNaN(marksNum) || marksNum < 0) {
                return res.status(400).json({ error: `Question ${i + 1}: invalid marks` });
            }
            if (q.question_type.startsWith('mcq')) {
                if (!Array.isArray(q.options) || q.options.length < 2) {
                    return res.status(400).json({ error: `Question ${i + 1}: MCQ requires at least 2 options` });
                }
                const correctCount = q.options.filter((o) => o.is_correct).length;
                if (q.question_type === 'mcq_single' && correctCount !== 1) {
                    return res.status(400).json({ error: `Question ${i + 1}: single-choice MCQ must have exactly 1 correct option` });
                }
                if (q.question_type === 'mcq_multiple' && correctCount < 1) {
                    return res.status(400).json({ error: `Question ${i + 1}: multiple-choice MCQ must have at least 1 correct option` });
                }
            } else if (q.question_type === 'yes_no') {
                if (q.correct_answer !== 'yes' && q.correct_answer !== 'no') {
                    return res.status(400).json({ error: `Question ${i + 1}: yes_no must have correct_answer 'yes' or 'no'` });
                }
            }
        }

        // Compute final total marks if not provided
        let finalTotalMarks = null;
        if (total_marks !== undefined && total_marks !== null && !Number.isNaN(Number(total_marks))) {
            finalTotalMarks = Number(total_marks);
        } else {
            const sum = questions.reduce((acc, q) => acc + Number(q.marks || 0), 0);
            finalTotalMarks = sum;
        }

        // Transaction
        await req.db.run('BEGIN');

        // Update quiz row
        await req.db.run(`
            UPDATE quizzes
            SET 
                title = ?, description = ?, instructions = ?,
                status = ?, start_date = ?, end_date = ?, duration_minutes = ?,
                total_marks = ?, randomize_questions = ?, randomize_options = ?, auto_submit = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            title,
            description || null,
            instructions || null,
            status === 'published' ? 'published' : 'draft',
            start_date || null,
            end_date || null,
            duration_minutes || null,
            finalTotalMarks,
            !!randomize_questions,
            !!randomize_options,
            auto_submit !== false,
            id
        ]);

        // Replace batch assignments
        await req.db.run('DELETE FROM quiz_batches WHERE quiz_id = ?', [id]);
        for (const batchId of batch_ids) {
            await req.db.run('INSERT INTO quiz_batches (quiz_id, batch_id) VALUES (?, ?)', [id, batchId]);
        }

        // Replace questions and options
        const oldQuestions = await req.db.all('SELECT id FROM questions WHERE quiz_id = ?', [id]);
        if (oldQuestions.length > 0) {
            const qIds = oldQuestions.map((r) => r.id);
            await req.db.run(`DELETE FROM question_options WHERE question_id IN (${qIds.map(() => '?').join(',')})`, qIds);
            await req.db.run('DELETE FROM questions WHERE quiz_id = ?', [id]);
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qRes = await req.db.run(`
                INSERT INTO questions (
                    quiz_id, question_text, question_type, question_order, marks, correct_answer, explanation
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                q.question_text,
                q.question_type,
                i + 1,
                Number(q.marks),
                q.correct_answer || null,
                q.explanation || null
            ]);

            if (q.question_type.startsWith('mcq') && Array.isArray(q.options)) {
                for (let j = 0; j < q.options.length; j++) {
                    const opt = q.options[j];
                    await req.db.run(
                        'INSERT INTO question_options (question_id, option_text, option_order, is_correct) VALUES (?, ?, ?, ?)',
                        [qRes.id, opt.option_text, j + 1, !!opt.is_correct]
                    );
                }
            }
        }

        await req.db.run('COMMIT');

        const updatedQuiz = await req.db.get(`
            SELECT 
                q.id, q.title, q.description, q.status, q.total_marks, q.updated_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ?
        `, [id]);

        return res.json({ message: 'Quiz updated successfully', quiz: updatedQuiz });

    } catch (error) {
        try { await req.db.run('ROLLBACK'); } catch {}
        console.error('Update quiz error:', error);
        return res.status(500).json({ error: 'Failed to update quiz' });
    }
});

// Start a quiz (Students only)
router.post('/:id/start', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can start quizzes' });
        }
        
        // Check if quiz is accessible
        const accessCheck = await isQuizAccessible(req.db, id, req.user.id);
        if (!accessCheck.accessible) {
            return res.status(400).json({ error: accessCheck.reason });
        }
        
        // Check if submission already exists
        const existingSubmission = await req.db.get(`
            SELECT * FROM quiz_submissions 
            WHERE quiz_id = ? AND student_id = ?
        `, [id, req.user.id]);
        
        if (existingSubmission) {
            if (existingSubmission.status === 'submitted' || existingSubmission.status === 'auto_submitted') {
                return res.status(400).json({ error: 'Quiz already submitted' });
            }
            if (existingSubmission.status === 'in_progress') {
                return res.json({ 
                    message: 'Quiz already in progress',
                    submission: existingSubmission 
                });
            }
        }
        
        // Create or update submission
        const now = new Date().toISOString();
        let submissionId;
        
        if (existingSubmission) {
            await req.db.run(`
                UPDATE quiz_submissions 
                SET status = 'in_progress', started_at = ?, updated_at = ?
                WHERE id = ?
            `, [now, now, existingSubmission.id]);
            submissionId = existingSubmission.id;
        } else {
            const result = await req.db.run(`
                INSERT INTO quiz_submissions (quiz_id, student_id, status, started_at)
                VALUES (?, ?, 'in_progress', ?)
            `, [id, req.user.id, now]);
            submissionId = result.id;
        }
        
        // Get quiz details for response
        const quiz = await req.db.get(`
            SELECT id, title, duration_minutes, total_marks, instructions
            FROM quizzes WHERE id = ?
        `, [id]);
        
        res.json({
            message: 'Quiz started successfully',
            submission_id: submissionId,
            started_at: now,
            quiz: quiz
        });
        
    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ error: 'Failed to start quiz' });
    }
});

// Auto-save quiz progress
router.post('/:id/auto-save', [
    authenticateToken,
    body('answers').isArray()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can save quiz progress' });
        }
        
        // Get submission
        const submission = await req.db.get(`
            SELECT * FROM quiz_submissions 
            WHERE quiz_id = ? AND student_id = ? AND status = 'in_progress'
        `, [id, req.user.id]);
        
        if (!submission) {
            return res.status(400).json({ error: 'No active quiz session found' });
        }
        
        // Save progress
        await req.db.run(`
            UPDATE quiz_submissions 
            SET auto_saved_data = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [JSON.stringify(answers), submission.id]);
        
        res.json({ message: 'Progress saved successfully' });
        
    } catch (error) {
        console.error('Auto-save error:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

// Submit quiz with automated grading
router.post('/:id/submit', [
    authenticateToken,
    body('answers').isArray()
], async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, is_auto_submit } = req.body;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can submit quizzes' });
        }
        
        // Get submission
        const submission = await req.db.get(`
            SELECT * FROM quiz_submissions 
            WHERE quiz_id = ? AND student_id = ?
        `, [id, req.user.id]);
        
        if (!submission) {
            return res.status(400).json({ error: 'No quiz session found' });
        }
        
        if (submission.status === 'submitted' || submission.status === 'auto_submitted') {
            return res.status(400).json({ error: 'Quiz already submitted' });
        }
        
        // Calculate time taken
        const startTime = new Date(submission.started_at);
        const endTime = new Date();
        const timeTaken = Math.round((endTime - startTime) / (1000 * 60)); // minutes
        
        // Save answers
        for (const answer of answers) {
            await req.db.run(`
                INSERT OR REPLACE INTO student_answers 
                (submission_id, question_id, answer_text, selected_options)
                VALUES (?, ?, ?, ?)
            `, [
                submission.id, 
                answer.question_id, 
                answer.answer_text || null,
                answer.selected_options ? JSON.stringify(answer.selected_options) : null
            ]);
        }
        
        // Update submission status
        const status = is_auto_submit ? 'auto_submitted' : 'submitted';
        await req.db.run(`
            UPDATE quiz_submissions 
            SET status = ?, submitted_at = CURRENT_TIMESTAMP, time_taken_minutes = ?
            WHERE id = ?
        `, [status, timeTaken, submission.id]);
        
        // Calculate results automatically
        const results = await calculateQuizResults(req.db, submission.id);
        
        res.json({
            message: 'Quiz submitted successfully',
            results: results,
            time_taken_minutes: timeTaken
        });
        
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// Get server-synced quiz session status (students)
router.get('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access quiz status' });
        }

        // Validate accessibility
        const accessCheck = await isQuizAccessible(req.db, id, req.user.id);
        if (!accessCheck.quiz) {
            return res.status(404).json({ error: 'Quiz not found or not accessible' });
        }

        const quiz = accessCheck.quiz;
        const now = new Date();

        // Fetch student's submission if any
        const submission = await req.db.get(
            'SELECT * FROM quiz_submissions WHERE quiz_id = ? AND student_id = ?',
            [id, req.user.id]
        );

        if (!submission || submission.status === 'not_started') {
            return res.json({
                status: 'not_started',
                can_start: !!accessCheck.accessible,
                reason: accessCheck.reason || null,
                duration_minutes: quiz.duration_minutes,
                now_utc: now.toISOString(),
                time_left_seconds: null
            });
        }

        if (['submitted', 'auto_submitted', 'graded', 'published'].includes(submission.status)) {
            return res.json({
                status: submission.status,
                now_utc: now.toISOString(),
                started_at: submission.started_at,
                submitted_at: submission.submitted_at,
                time_left_seconds: 0,
                duration_minutes: quiz.duration_minutes
            });
        }

        // In progress
        const startMs = new Date(submission.started_at).getTime();
        const nominalEndMs = startMs + (Number(quiz.duration_minutes || 0) * 60 * 1000);
        const hardEndMs = quiz.end_date ? Math.min(nominalEndMs, new Date(quiz.end_date).getTime()) : nominalEndMs;
        const nowMs = now.getTime();
        const remainingSeconds = Math.max(0, Math.floor((hardEndMs - nowMs) / 1000));

        if (remainingSeconds <= 0) {
            let answers = [];
            try { answers = submission.auto_saved_data ? JSON.parse(submission.auto_saved_data) : []; } catch { answers = []; }

            for (const answer of answers) {
                await req.db.run(
                    'INSERT OR REPLACE INTO student_answers (submission_id, question_id, answer_text, selected_options) VALUES (?, ?, ?, ?)',
                    [submission.id, answer.question_id, answer.answer_text || null, answer.selected_options ? JSON.stringify(answer.selected_options) : null]
                );
            }

            const timeTakenMin = Math.max(0, Math.round((hardEndMs - startMs) / (1000 * 60)));

            await req.db.run(
                "UPDATE quiz_submissions SET status = 'auto_submitted', submitted_at = CURRENT_TIMESTAMP, time_taken_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [timeTakenMin, submission.id]
            );

            const results = await calculateQuizResults(req.db, submission.id);

            return res.json({
                message: 'Time expired, quiz auto-submitted',
                status: 'auto_submitted',
                now_utc: new Date().toISOString(),
                submitted_at: new Date().toISOString(),
                time_left_seconds: 0,
                time_taken_minutes: timeTakenMin,
                results
            });
        }

        // Parse saved answers from auto_saved_data to allow client to restore state on resume
        let savedAnswers = [];
        try {
            savedAnswers = submission.auto_saved_data ? JSON.parse(submission.auto_saved_data) : [];
        } catch {
            savedAnswers = [];
        }

        return res.json({
            status: 'in_progress',
            now_utc: now.toISOString(),
            started_at: submission.started_at,
            ends_at: new Date(hardEndMs).toISOString(),
            time_left_seconds: remainingSeconds,
            duration_minutes: quiz.duration_minutes,
            answers: savedAnswers
        });

    } catch (error) {
        console.error('Status endpoint error:', error);
        res.status(500).json({ error: 'Failed to get quiz status' });
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
                'SELECT SUM(marks) as max_score FROM questions WHERE quiz_id = ?',
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
                        [id, student.student_id, 'not_started', maxScore]
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

// Get all quiz results for a student
router.get('/student/results', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }

        // Get all quiz results for the student
        const results = await req.db.all(`
            SELECT 
                qs.id,
                qs.quiz_id,
                q.title as quiz_title,
                q.description as quiz_description,
                b.name as batch_name,
                q.end_date as end_date,
                qs.total_score AS score,
                qs.max_score AS max_score,
                CASE WHEN qs.max_score > 0 THEN ROUND((qs.total_score * 100.0 / qs.max_score), 1) ELSE 0 END as percentage,
                COALESCE(qs.time_taken_minutes, 0) * 60 as time_taken,
                qs.submitted_at,
                qs.status,
                (
                    SELECT COUNT(*) FROM questions qq WHERE qq.quiz_id = q.id
                ) as total_questions,
                NULL AS teacher_feedback,
                (
                    SELECT COUNT(*) 
                    FROM student_answers sa 
                    WHERE sa.submission_id = qs.id AND sa.is_correct = 1
                ) as correct_answers
            FROM quiz_submissions qs
            JOIN quizzes q ON qs.quiz_id = q.id
            JOIN quiz_batches qb ON q.id = qb.quiz_id
            JOIN batches b ON qb.batch_id = b.id
            JOIN batch_students bs ON b.id = bs.batch_id
            WHERE qs.student_id = ? 
                AND bs.student_id = ?
                AND (qs.status = 'submitted' OR qs.status = 'auto_submitted' OR qs.status = 'graded')
                AND q.status = 'published'
            ORDER BY qs.submitted_at DESC
        `, [req.user.id, req.user.id]);

        // Map results: lock visibility until quiz end_date has passed
        const now = new Date();
        const mapped = results.map(r => {
            const locked = r.end_date && new Date(r.end_date) > now;
            if (locked) {
                return { ...r, results_locked: true, percentage: null, score: null, max_score: null, correct_answers: null };
            }
            return { ...r, results_locked: false };
        });

        res.json({
            results: mapped
        });

    } catch (error) {
        console.error('Get student results error:', error);
        res.status(500).json({ error: 'Failed to get student results' });
    }
});

// Get quiz results for teachers (batch performance)
router.get('/:id/results', [
    authenticateToken,
    teacherOrAdmin
], async (req, res) => {
    try {
        const { id } = req.params;
        const { batch_id } = req.query;
        
        // Check if quiz exists and belongs to teacher
        const quiz = await req.db.get(`
            SELECT q.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM quizzes q
            JOIN users u ON q.teacher_id = u.id
            WHERE q.id = ? AND (q.teacher_id = ? OR ? = 'admin')
        `, [id, req.user.id, req.user.role]);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        // Get batch information
        let batchFilter = '';
        let batchParams = [id];
        
        if (batch_id) {
            batchFilter = 'AND qb.batch_id = ?';
            batchParams.push(batch_id);
        }
        
        // Get all students in assigned batches
        const studentsQuery = `
            SELECT DISTINCT 
                u.id, u.first_name, u.last_name, u.email,
                b.id as batch_id, b.name as batch_name,
                qs.id as submission_id, qs.status, qs.total_score, qs.max_score, qs.percentage,
                qs.started_at, qs.submitted_at, qs.time_taken_minutes
            FROM users u
            JOIN batch_students bs ON u.id = bs.student_id
            JOIN batches b ON bs.batch_id = b.id
            JOIN quiz_batches qb ON b.id = qb.batch_id
            LEFT JOIN quiz_submissions qs ON qb.quiz_id = qs.quiz_id AND u.id = qs.student_id
            WHERE qb.quiz_id = ? ${batchFilter}
            AND u.role = 'student'
            ORDER BY b.name, u.first_name, u.last_name
        `;
        
        const students = await req.db.all(studentsQuery, batchParams);
        
        // Group by batch
        const batchResults = {};
        
        for (const student of students) {
            if (!batchResults[student.batch_id]) {
                batchResults[student.batch_id] = {
                    batch_id: student.batch_id,
                    batch_name: student.batch_name,
                    total_students: 0,
                    submitted_count: 0,
                    not_submitted_count: 0,
                    average_score: 0,
                    students: []
                };
            }
            
            const batch = batchResults[student.batch_id];
            batch.total_students++;
            
            if (student.status === 'submitted' || student.status === 'auto_submitted' || student.status === 'graded') {
                batch.submitted_count++;
            } else {
                batch.not_submitted_count++;
            }
            
            batch.students.push({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`,
                email: student.email,
                submission_id: student.submission_id,
                status: student.status || 'not_started',
                score: student.total_score,
                max_score: student.max_score,
                percentage: student.percentage,
                started_at: student.started_at,
                submitted_at: student.submitted_at,
                time_taken_minutes: student.time_taken_minutes
            });
        }
        
        // Calculate average scores for each batch
        Object.values(batchResults).forEach(batch => {
            const submittedStudents = batch.students.filter(s => s.percentage !== null);
            if (submittedStudents.length > 0) {
                const totalScore = submittedStudents.reduce((sum, s) => sum + (s.percentage || 0), 0);
                batch.average_score = Math.round(totalScore / submittedStudents.length);
            }
        });
        
        res.json({
            quiz: quiz,
            batch_results: Object.values(batchResults)
        });
        
    } catch (error) {
        console.error('Get quiz results error:', error);
        res.status(500).json({ error: 'Failed to get quiz results' });
    }
});

// Get detailed student submission
router.get('/:id/submissions/:submission_id', [
    authenticateToken,
    teacherOrAdmin
], async (req, res) => {
    try {
        const { id, submission_id } = req.params;
        
        // Check if quiz exists and belongs to teacher
        const quiz = await req.db.get(`
            SELECT * FROM quizzes 
            WHERE id = ? AND (teacher_id = ? OR ? = 'admin')
        `, [id, req.user.id, req.user.role]);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        // Get submission details
        const submission = await req.db.get(`
            SELECT qs.*, u.first_name, u.last_name, u.email
            FROM quiz_submissions qs
            JOIN users u ON qs.student_id = u.id
            WHERE qs.id = ? AND qs.quiz_id = ?
        `, [submission_id, id]);
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        // Get questions with student answers
        const questionsWithAnswers = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.marks, q.correct_answer,
                sa.answer_text, sa.selected_options, sa.marks_awarded, sa.is_correct
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.question_order
        `, [submission_id, id]);
        
        // Get options for MCQ questions
        for (let question of questionsWithAnswers) {
            if (question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple') {
                question.options = await req.db.all(`
                    SELECT id, option_text, is_correct
                    FROM question_options
                    WHERE question_id = ?
                    ORDER BY option_order
                `, [question.id]);
                
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
            submission: {
                ...submission,
                student_name: `${submission.first_name} ${submission.last_name}`
            },
            questions: questionsWithAnswers
        });
        
    } catch (error) {
        console.error('Get submission details error:', error);
        res.status(500).json({ error: 'Failed to get submission details' });
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
        
        // Begin transaction for atomic deletion
        await req.db.run('BEGIN TRANSACTION');
        
        try {
            // Step 1: Delete student answers (depends on submission_id and question_id)
            await req.db.run(`
                DELETE FROM student_answers 
                WHERE submission_id IN (
                    SELECT id FROM quiz_submissions WHERE quiz_id = ?
                )
            `, [id]);
            
            // Step 2: Delete quiz submissions (depends on quiz_id)
            await req.db.run('DELETE FROM quiz_submissions WHERE quiz_id = ?', [id]);
            
            // Step 3: Delete question options (depends on question_id)
            await req.db.run(`
                DELETE FROM question_options 
                WHERE question_id IN (
                    SELECT id FROM questions WHERE quiz_id = ?
                )
            `, [id]);
            
            // Step 4: Delete questions (depends on quiz_id)
            await req.db.run('DELETE FROM questions WHERE quiz_id = ?', [id]);
            
            // Step 5: Delete quiz batch assignments (depends on quiz_id)
            await req.db.run('DELETE FROM quiz_batches WHERE quiz_id = ?', [id]);
            
            // Step 6: Finally delete the quiz itself
            await req.db.run('DELETE FROM quizzes WHERE id = ?', [id]);
            
            // Commit transaction
            await req.db.run('COMMIT');
            
            res.json({ message: 'Quiz and all related data deleted successfully' });
        } catch (deleteError) {
            // Rollback transaction on error
            await req.db.run('ROLLBACK');
            throw deleteError;
        }
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ error: 'Failed to delete quiz and related data' });
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
                q.id, q.question_text, q.question_type, q.marks,
                sa.answer_text, sa.selected_options, sa.marks_awarded as score, sa.teacher_feedback
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
                q.id, q.question_text, q.question_type, q.marks,
                sa.marks_awarded as score, sa.teacher_feedback
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

// Student dashboard - get all quizzes for student's batches
router.get('/student/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }
        
        // Get student's batches with optional quizzes (include batches even if no quizzes)
        const batchesWithQuizzes = await req.db.all(`
            SELECT DISTINCT
                b.id as batch_id, b.name as batch_name, b.description,
                q.id as quiz_id, q.title, q.description as quiz_description,
                q.start_date, q.end_date, q.duration_minutes, q.total_marks,
                q.status as quiz_status,
                qs.id as submission_id, qs.status as submission_status,
                qs.score, qs.submitted_at, qs.time_taken_minutes
            FROM batches b
            JOIN batch_students bs ON b.id = bs.batch_id
            LEFT JOIN quiz_batches qb ON b.id = qb.batch_id
            LEFT JOIN quizzes q ON qb.quiz_id = q.id AND q.status = 'published'
            LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id AND qs.student_id = ?
            WHERE bs.student_id = ?
            ORDER BY b.name, q.created_at DESC
        `, [req.user.id, req.user.id]);
        
        // Group by batch
        const batches = {};
        
        for (const row of batchesWithQuizzes) {
            if (!batches[row.batch_id]) {
                batches[row.batch_id] = {
                    id: row.batch_id,
                    name: row.batch_name,
                    description: row.description,
                    quizzes: []
                };
            }
            
            if (row.quiz_id) {
                const now = new Date();
                const startDate = row.start_date ? new Date(row.start_date) : null;
                const endDate = row.end_date ? new Date(row.end_date) : null;
                
                let accessibility = {
                    accessible: true,
                    reason: null
                };
                
                if (startDate && now < startDate) {
                    accessibility = {
                        accessible: false,
                        reason: 'Quiz has not started yet'
                    };
                } else if (endDate && now > endDate) {
                    accessibility = {
                        accessible: false,
                        reason: 'Quiz has ended'
                    };
                }
                
                batches[row.batch_id].quizzes.push({
                    id: row.quiz_id,
                    title: row.title,
                    description: row.quiz_description,
                    start_date: row.start_date,
                    end_date: row.end_date,
                    duration_minutes: row.duration_minutes,
                    total_marks: row.total_marks,
                    submission_status: row.submission_status || 'not_started',
                    score: row.score,
                    percentage: row.score && row.total_marks ? 
                        Math.round((row.score / row.total_marks) * 100) : null,
                    submitted_at: row.submitted_at,
                    time_taken_minutes: row.time_taken_minutes,
                    accessibility: accessibility
                });
            }
        }
        
        res.json({
            batches: Object.values(batches)
        });
        
    } catch (error) {
        console.error('Student dashboard error:', error);
        res.status(500).json({ error: 'Failed to get student dashboard' });
    }
});

// Student quiz results
router.get('/:id/student-results', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only students can access this endpoint' });
        }
        
        // Get quiz details
        const quiz = await req.db.get(`
            SELECT q.id, q.title, q.description, q.total_marks, q.duration_minutes, q.end_date as end_date
            FROM quizzes q
            JOIN quiz_batches qb ON q.id = qb.quiz_id
            JOIN batch_students bs ON qb.batch_id = bs.batch_id
            WHERE q.id = ? AND bs.student_id = ? AND q.status = 'published'
        `, [id, req.user.id]);
        
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found or access denied' });
        }
        
        // Gate results until the quiz end_date has passed
        const now = new Date();
        if (quiz.end_date && new Date(quiz.end_date) > now) {
            return res.status(403).json({ error: 'Results are locked until the quiz end date' });
        }
        
        // Get student's submission
        const submission = await req.db.get(`
            SELECT * FROM quiz_submissions
            WHERE quiz_id = ? AND student_id = ?
        `, [id, req.user.id]);
        
        if (!submission || (submission.status !== 'submitted' && submission.status !== 'auto_submitted' && submission.status !== 'graded')) {
            return res.status(400).json({ error: 'Quiz not submitted yet' });
        }
        
        // Get detailed results
        const results = await req.db.all(`
            SELECT 
                q.id, q.question_text, q.question_type, q.marks, q.correct_answer,
                sa.answer_text, sa.selected_options, sa.is_correct,
                sa.marks_awarded as score, NULL as teacher_feedback
            FROM questions q
            LEFT JOIN student_answers sa ON q.id = sa.question_id AND sa.submission_id = ?
            WHERE q.quiz_id = ?
            ORDER BY q.id
        `, [submission.id, id]);
        
        // Get options for MCQ questions and compute derived fields
        for (let question of results) {
            if (question.question_type && (question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple')) {
                const options = await req.db.all(`
                    SELECT id, option_text, is_correct
                    FROM question_options
                    WHERE question_id = ?
                    ORDER BY id
                `, [question.id]);
                question.options = options;
                let selectedIds = [];
                if (question.selected_options) {
                    try { selectedIds = JSON.parse(question.selected_options) || []; } catch (e) { selectedIds = []; }
                }
                const selectedTexts = options.filter(o => selectedIds.includes(o.id)).map(o => o.option_text);
                const correctTexts = options.filter(o => o.is_correct).map(o => o.option_text);
                question.student_answer = selectedTexts.join(', ');
                question.correct_answer = correctTexts.join(', ');
            } else if (question.question_type === 'yes_no') {
                question.student_answer = question.answer_text || null;
            }
            question.points = question.marks;
        }
        
        const computedPercentage = (submission.max_score && submission.max_score > 0)
            ? Math.round((Number(submission.total_score || 0) / Number(submission.max_score)) * 100)
            : 0;
        
        res.json({
            quiz: quiz,
            submission: {
                id: submission.id,
                status: submission.status,
                score: submission.total_score || 0,
                max_score: submission.max_score || 0,
                percentage: computedPercentage,
                submitted_at: submission.submitted_at,
                time_taken: (submission.time_taken_minutes || 0) * 60,
                teacher_feedback: submission.teacher_comments || null
            },
            questions: results
        });
        
    } catch (error) {
        console.error('Student results error:', error);
        res.status(500).json({ error: 'Failed to get student results' });
    }
});



// Get quizzes for a specific teacher
router.get('/teacher/:teacherId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        // Check if user can access this teacher's quizzes
        if (req.user.role === 'teacher' && parseInt(teacherId) !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const quizzes = await req.db.all(`
            SELECT 
                q.id, q.title, q.description, q.status, q.start_date, q.end_date,
                q.duration_minutes, q.total_marks, q.created_at, q.updated_at,
                COUNT(DISTINCT qb.batch_id) as batch_count,
                COUNT(DISTINCT qs.id) as submissions_count,
                (
                    SELECT COUNT(*) 
                    FROM questions 
                    WHERE quiz_id = q.id
                ) as total_questions,
                CASE 
                    WHEN q.status = 'published' AND (q.start_date IS NULL OR q.start_date <= datetime('now')) 
                         AND (q.end_date IS NULL OR q.end_date >= datetime('now')) THEN 1
                    ELSE 0
                END as is_active
            FROM quizzes q
            LEFT JOIN quiz_batches qb ON q.id = qb.quiz_id
            LEFT JOIN quiz_submissions qs ON q.id = qs.quiz_id
            WHERE q.teacher_id = ?
            GROUP BY q.id
            ORDER BY q.created_at DESC
        `, [teacherId]);
        
        // Add batch names for each quiz
        for (let quiz of quizzes) {
            const batches = await req.db.all(`
                SELECT b.name
                FROM quiz_batches qb
                JOIN batches b ON qb.batch_id = b.id
                WHERE qb.quiz_id = ?
            `, [quiz.id]);
            quiz.batch_name = batches.map(b => b.name).join(', ');
        }
        
        res.json({ data: quizzes });
    } catch (error) {
        console.error('Get teacher quizzes error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher quizzes' });
    }
});

module.exports = router;