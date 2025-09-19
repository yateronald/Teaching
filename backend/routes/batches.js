const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, adminOnly, teacherOrAdmin, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all batches
router.get('/', authenticateToken, async (req, res) => {
    try {
        let sql = `
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                COUNT(bs.student_id) as student_count
            FROM batches b
            LEFT JOIN users u ON b.teacher_id = u.id
            LEFT JOIN batch_students bs ON b.id = bs.batch_id
        `;
        let params = [];
        
        // If user is a teacher, only show their batches
        if (req.user.role === 'teacher') {
            sql += ' WHERE b.teacher_id = ?';
            params.push(req.user.id);
        }
        
        sql += ' GROUP BY b.id ORDER BY b.created_at DESC';
        
        const batches = await req.db.all(sql, params);
        res.json(batches);
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({ error: 'Failed to fetch batches' });
    }
});

// >>> Batch Insights (aggregate across quizzes in a batch)
router.get('/:id/insights', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Get batch meta and teacher id for access control
        const batch = await req.db.get(
            `SELECT id, name, french_level, start_date, end_date, teacher_id FROM batches WHERE id = ?`,
            [id]
        );
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        if (req.user.role === 'teacher' && batch.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Students in batch
        const students = await req.db.all(
            `SELECT u.id, u.first_name, u.last_name, u.email
             FROM batch_students bs
             JOIN users u ON u.id = bs.student_id
             WHERE bs.batch_id = ?
             ORDER BY u.first_name, u.last_name`,
            [id]
        );

        // Quizzes assigned to this batch
        const quizzes = await req.db.all(
            `SELECT q.id AS quiz_id, q.title AS quiz_title
             FROM quiz_batches qb
             JOIN quizzes q ON q.id = qb.quiz_id
             WHERE qb.batch_id = ?
             ORDER BY q.id ASC`,
            [id]
        );

        // If no students or quizzes, return empty aggregates safely
        if (!students.length || !quizzes.length) {
            return res.json({
                batch: { id: batch.id, name: batch.name, french_level: batch.french_level, start_date: batch.start_date, end_date: batch.end_date },
                kpis: {
                    total_students: students.length,
                    total_quizzes: quizzes.length,
                    submissions_count: 0,
                    completion_rate: 0,
                    avg_percentage: 0,
                    best_quiz: null,
                    hardest_quiz: null,
                    top_student: null
                },
                quizzes: quizzes.map(q => ({ quiz_id: q.quiz_id, quiz_title: q.quiz_title, submitted_count: 0, avg_percentage: null, min_percentage: null, max_percentage: null })),
                students: students.map(s => ({ id: s.id, first_name: s.first_name, last_name: s.last_name, email: s.email, submitted_count: 0, avg_percentage: null, breakdown: [] }))
            });
        }

        // Submissions for this batch across assigned quizzes
        const submissions = await req.db.all(
            `SELECT s.quiz_id, s.student_id, s.total_score, s.max_score, s.percentage, s.submitted_at
             FROM quiz_submissions s
             WHERE s.quiz_id IN (SELECT qb.quiz_id FROM quiz_batches qb WHERE qb.batch_id = ?)
               AND s.student_id IN (SELECT bs.student_id FROM batch_students bs WHERE bs.batch_id = ?)
               AND s.status IN ('submitted', 'auto_submitted', 'graded')`,
            [id, id]
        );

        // Aggregate per-quiz
        const quizMap = new Map(quizzes.map(q => [q.quiz_id, q.quiz_title]));
        const aggByQuiz = new Map();
        for (const sub of submissions) {
            const arr = aggByQuiz.get(sub.quiz_id) || [];
            arr.push(sub);
            aggByQuiz.set(sub.quiz_id, arr);
        }
        const quizzesAgg = quizzes.map(q => {
            const arr = aggByQuiz.get(q.quiz_id) || [];
            const vals = arr.map(a => a.percentage).filter(v => typeof v === 'number');
            const avg = vals.length ? vals.reduce((a,c)=>a + c, 0) / vals.length : null;
            const min = vals.length ? Math.min(...vals) : null;
            const max = vals.length ? Math.max(...vals) : null;
            return {
                quiz_id: q.quiz_id,
                quiz_title: q.quiz_title,
                submitted_count: arr.length,
                avg_percentage: avg != null ? Number(avg.toFixed(2)) : null,
                min_percentage: min,
                max_percentage: max
            };
        });

        // Per-student breakdown
        const subsByStudent = new Map();
        for (const sub of submissions) {
            const arr = subsByStudent.get(sub.student_id) || [];
            arr.push(sub);
            subsByStudent.set(sub.student_id, arr);
        }
        const studentsWithMetrics = students.map(s => {
            const arr = subsByStudent.get(s.id) || [];
            const vals = arr.map(a => a.percentage).filter(v => typeof v === 'number');
            const avg = vals.length ? Number((vals.reduce((a,c)=>a + c, 0) / vals.length).toFixed(2)) : null;
            const breakdown = arr.map(a => ({
                quiz_id: a.quiz_id,
                quiz_title: quizMap.get(a.quiz_id) || `Quiz ${a.quiz_id}`,
                total_score: a.total_score,
                max_score: a.max_score,
                percentage: a.percentage,
                submitted_at: a.submitted_at
            }));
            return {
                id: s.id,
                first_name: s.first_name,
                last_name: s.last_name,
                email: s.email,
                submitted_count: arr.length,
                avg_percentage: avg,
                breakdown
            };
        });

        // KPIs
        const totalStudents = students.length;
        const totalQuizzes = quizzes.length;
        const submissionsCount = submissions.length;
        const completionRate = totalStudents * totalQuizzes > 0 ? Math.round((submissionsCount / (totalStudents * totalQuizzes)) * 100) : 0;
        const allPercentages = submissions.map(s => s.percentage).filter(v => typeof v === 'number');
        const avgPercentage = allPercentages.length ? Math.round(allPercentages.reduce((a,c)=>a + c, 0) / allPercentages.length) : 0;

        // best and hardest quiz
        const quizzesWithAvg = quizzesAgg.filter(q => q.avg_percentage != null);
        let best_quiz = null;
        let hardest_quiz = null;
        if (quizzesWithAvg.length) {
            best_quiz = quizzesWithAvg.reduce((acc, cur) => (acc.avg_percentage > cur.avg_percentage ? acc : cur));
            hardest_quiz = quizzesWithAvg.reduce((acc, cur) => (acc.avg_percentage < cur.avg_percentage ? acc : cur));
        }

        // top student
        const studentsWithAvg = studentsWithMetrics.filter(s => s.avg_percentage != null);
        let top_student = null;
        if (studentsWithAvg.length) {
            const top = studentsWithAvg.reduce((acc, cur) => (acc.avg_percentage > cur.avg_percentage ? acc : cur));
            top_student = {
                student_id: top.id,
                first_name: top.first_name,
                last_name: top.last_name,
                email: top.email,
                avg_percentage: top.avg_percentage
            };
        }

        res.json({
            batch: { id: batch.id, name: batch.name, french_level: batch.french_level, start_date: batch.start_date, end_date: batch.end_date },
            kpis: {
                total_students: totalStudents,
                total_quizzes: totalQuizzes,
                submissions_count: submissionsCount,
                completion_rate: completionRate,
                avg_percentage: avgPercentage,
                best_quiz,
                hardest_quiz,
                top_student
            },
            quizzes: quizzesAgg,
            students: studentsWithMetrics
        });
    } catch (error) {
        console.error('Batch insights error:', error);
        res.status(500).json({ error: 'Failed to compute batch insights' });
    }
});
// <<< Batch Insights

// Get timetable for all teachers (Admin only)
router.get('/timetable', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { teacher_id } = req.query;
        
        let sql = `
            SELECT 
                bt.id, bt.batch_id, bt.day_of_week, bt.start_time, bt.end_time, 
                bt.timezone, bt.location_mode, bt.location, bt.link, bt.is_active,
                b.name as batch_name, b.french_level, b.start_date, b.end_date,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM batch_timetables bt
            JOIN batches b ON bt.batch_id = b.id
            JOIN users u ON b.teacher_id = u.id
            WHERE bt.is_active = 1
        `;
        
        let params = [];
        if (teacher_id) {
            // Handle multiple teacher IDs (comma-separated)
            const teacherIds = teacher_id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
            if (teacherIds.length > 0) {
                const placeholders = teacherIds.map(() => '?').join(',');
                sql += ` AND u.id IN (${placeholders})`;
                params.push(...teacherIds);
            }
        }
        
        sql += ' ORDER BY u.first_name, u.last_name, bt.day_of_week, bt.start_time';
        
        const timetable = await req.db.all(sql, params);
        res.json(timetable);
    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({ error: 'Failed to fetch timetable' });
    }
});

// Get batch by ID with students
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get batch details
        const batch = await req.db.get(`
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM batches b
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE b.id = ?
        `, [id]);
        
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        // Check if user has access to this batch
        if (req.user.role === 'teacher' && batch.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get students in this batch
        const students = await req.db.all(`
            SELECT 
                u.id, u.username, u.first_name, u.last_name, u.email,
                bs.enrolled_at
            FROM batch_students bs
            JOIN users u ON bs.student_id = u.id
            WHERE bs.batch_id = ?
            ORDER BY u.first_name, u.last_name
        `, [id]);
        
        res.json({
            ...batch,
            students
        });
    } catch (error) {
        console.error('Get batch error:', error);
        res.status(500).json({ error: 'Failed to fetch batch' });
    }
});

// Create new batch (Admin only)
router.post('/', [
    authenticateToken,
    adminOnly,
    body('name').isLength({ min: 1 }).trim(),
    body('teacher_id').isInt({ min: 1 }),
    body('french_level').isLength({ min: 1 }).trim(),
    body('start_date').isISO8601(),
    body('end_date').isISO8601(),
    body('student_ids').isArray({ min: 1 })
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
            name, 
            teacher_id, 
            french_level, 
            start_date, 
            end_date, 
            student_ids,
            timezone = 'UTC',
            default_location_mode = 'physical',
            default_location,
            default_link,
            timetable = []
        } = req.body;

        // Validate dates
        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Check if teacher exists and has teacher role
        const teacher = await req.db.get(
            'SELECT id FROM users WHERE id = ? AND role = "teacher"',
            [teacher_id]
        );
        if (!teacher) {
            return res.status(400).json({ error: 'Invalid teacher ID' });
        }

        // Check if all student IDs exist and have student role
        const studentCheck = await req.db.all(
            `SELECT id FROM users WHERE id IN (${student_ids.map(() => '?').join(',')}) AND role = "student"`,
            student_ids
        );
        if (studentCheck.length !== student_ids.length) {
            return res.status(400).json({ error: 'One or more invalid student IDs' });
        }

        // Create batch
        const result = await req.db.run(
            'INSERT INTO batches (name, teacher_id, french_level, start_date, end_date, timezone, default_location_mode, default_location, default_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, teacher_id, french_level, start_date, end_date, timezone, default_location_mode, default_location, default_link]
        );

        const batchId = result.id;

        // Add students to batch
        for (const studentId of student_ids) {
            await req.db.run(
                'INSERT INTO batch_students (batch_id, student_id) VALUES (?, ?)',
                [batchId, studentId]
            );
        }

        // Add timetable entries
        for (const schedule of timetable) {
            await req.db.run(
                'INSERT INTO batch_timetables (batch_id, day_of_week, start_time, end_time, timezone, location_mode, location, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    batchId,
                    schedule.day_of_week,
                    schedule.start_time,
                    schedule.end_time,
                    schedule.timezone || timezone,
                    schedule.location_mode || default_location_mode,
                    schedule.location || default_location,
                    schedule.link || default_link
                ]
            );
        }

        // Get created batch with details
        const newBatch = await req.db.get(`
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM batches b
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE b.id = ?
        `, [batchId]);

        res.status(201).json({
            message: 'Batch created successfully',
            batch: newBatch
        });

    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ error: 'Failed to create batch' });
    }
});

// Update batch (Admin only)
router.put('/:id', [
    authenticateToken,
    adminOnly,
    body('name').optional().isLength({ min: 1 }).trim(),
    body('teacher_id').optional().isInt({ min: 1 }),
    body('french_level').optional().isLength({ min: 1 }).trim(),
    body('start_date').optional().isISO8601(),
    body('end_date').optional().isISO8601()
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
        const { name, teacher_id, french_level, start_date, end_date } = req.body;

        // Check if batch exists
        const existingBatch = await req.db.get('SELECT * FROM batches WHERE id = ?', [id]);
        if (!existingBatch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        // Validate dates if provided
        const newStartDate = start_date || existingBatch.start_date;
        const newEndDate = end_date || existingBatch.end_date;
        if (new Date(newStartDate) >= new Date(newEndDate)) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        // Check teacher if provided
        if (teacher_id) {
            const teacher = await req.db.get(
                'SELECT id FROM users WHERE id = ? AND role = "teacher"',
                [teacher_id]
            );
            if (!teacher) {
                return res.status(400).json({ error: 'Invalid teacher ID' });
            }
        }

        // Build update query
        const updates = [];
        const params = [];
        
        if (name) {
            updates.push('name = ?');
            params.push(name);
        }
        if (teacher_id) {
            updates.push('teacher_id = ?');
            params.push(teacher_id);
        }
        if (french_level) {
            updates.push('french_level = ?');
            params.push(french_level);
        }
        if (start_date) {
            updates.push('start_date = ?');
            params.push(start_date);
        }
        if (end_date) {
            updates.push('end_date = ?');
            params.push(end_date);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await req.db.run(
            `UPDATE batches SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Get updated batch
        const updatedBatch = await req.db.get(`
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at, b.updated_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM batches b
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE b.id = ?
        `, [id]);

        res.json({
            message: 'Batch updated successfully',
            batch: updatedBatch
        });

    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({ error: 'Failed to update batch' });
    }
});

// Add students to batch (Admin only)
router.post('/:id/students', [
    authenticateToken,
    adminOnly,
    body('student_ids').isArray({ min: 1 })
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
        const { student_ids } = req.body;

        // Check if batch exists
        const batch = await req.db.get('SELECT id FROM batches WHERE id = ?', [id]);
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        // Check if all student IDs exist and have student role
        const studentCheck = await req.db.all(
            `SELECT id FROM users WHERE id IN (${student_ids.map(() => '?').join(',')}) AND role = "student"`,
            student_ids
        );
        if (studentCheck.length !== student_ids.length) {
            return res.status(400).json({ error: 'One or more invalid student IDs' });
        }

        // Add students to batch (ignore duplicates)
        let addedCount = 0;
        for (const studentId of student_ids) {
            try {
                await req.db.run(
                    'INSERT INTO batch_students (batch_id, student_id) VALUES (?, ?)',
                    [id, studentId]
                );
                addedCount++;
            } catch (error) {
                // Ignore duplicate entries
                if (!error.message.includes('UNIQUE constraint failed')) {
                    throw error;
                }
            }
        }

        res.json({
            message: `${addedCount} students added to batch successfully`
        });

    } catch (error) {
        console.error('Add students to batch error:', error);
        res.status(500).json({ error: 'Failed to add students to batch' });
    }
});

// Remove student from batch (Admin only)
router.delete('/:id/students/:studentId', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id, studentId } = req.params;
        
        const result = await req.db.run(
            'DELETE FROM batch_students WHERE batch_id = ? AND student_id = ?',
            [id, studentId]
        );
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Student not found in this batch' });
        }
        
        res.json({ message: 'Student removed from batch successfully' });
    } catch (error) {
        console.error('Remove student from batch error:', error);
        res.status(500).json({ error: 'Failed to remove student from batch' });
    }
});

// Delete batch (Admin only)
router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if batch exists
        const batch = await req.db.get('SELECT id FROM batches WHERE id = ?', [id]);
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        await req.db.run('DELETE FROM batches WHERE id = ?', [id]);
        
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({ error: 'Failed to delete batch' });
    }
});

// Get batches for a specific teacher
router.get('/teacher/:teacherId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        // Check if user can access this teacher's batches
        if (req.user.role === 'teacher' && parseInt(teacherId) !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const batches = await req.db.all(`
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at,
                COUNT(bs.student_id) as student_count
            FROM batches b
            LEFT JOIN batch_students bs ON b.id = bs.batch_id
            WHERE b.teacher_id = ?
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `, [teacherId]);
        
        res.json(batches);
    } catch (error) {
        console.error('Get teacher batches error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher batches' });
    }
});

// Get the authenticated teacher's batches
router.get('/my-batches', authenticateToken, async (req, res) => {
    try {
        // Only teachers should use this route; it always scopes to the signed-in teacher
        const sql = `
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                COUNT(bs.student_id) as student_count
            FROM batches b
            LEFT JOIN users u ON b.teacher_id = u.id
            LEFT JOIN batch_students bs ON b.id = bs.batch_id
            WHERE b.teacher_id = ?
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `;
        const batches = await req.db.all(sql, [req.user.id]);
        res.json(batches);
    } catch (error) {
        console.error('Get my-batches error:', error);
        res.status(500).json({ error: 'Failed to fetch batches' });
    }
});

// Get the authenticated student's batches
router.get('/student/my-batches', authenticateToken, authorizeRoles('student'), async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.id, b.name, b.french_level, b.start_date, b.end_date, b.created_at,
                u.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                COUNT(bs2.student_id) as student_count
            FROM batches b
            JOIN batch_students bs ON b.id = bs.batch_id AND bs.student_id = ?
            LEFT JOIN users u ON b.teacher_id = u.id
            LEFT JOIN batch_students bs2 ON b.id = bs2.batch_id
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `;
        const batches = await req.db.all(sql, [req.user.id]);
        res.json(batches);
    } catch (error) {
        console.error('Get student my-batches error:', error);
        res.status(500).json({ error: 'Failed to fetch student batches' });
    }
});

// Get batch timetable (Admin and Teacher)
router.get('/:id/timetable', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if batch exists and user has access
        const batch = await req.db.get(
            'SELECT id, teacher_id FROM batches WHERE id = ?',
            [id]
        );
        
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        // Check access permissions
        if (req.user.role === 'teacher' && batch.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const timetable = await req.db.all(
            'SELECT * FROM batch_timetables WHERE batch_id = ? AND is_active = 1 ORDER BY day_of_week, start_time',
            [id]
        );
        
        res.json(timetable);
    } catch (error) {
        console.error('Get batch timetable error:', error);
        res.status(500).json({ error: 'Failed to fetch batch timetable' });
    }
});

// Update batch timetable (Admin only)
router.put('/:id/timetable', [
    authenticateToken,
    adminOnly,
    body('timetable').isArray()
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
        const { timetable } = req.body;

        // Check if batch exists
        const batch = await req.db.get('SELECT id FROM batches WHERE id = ?', [id]);
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        // Delete existing timetable entries
        await req.db.run('DELETE FROM batch_timetables WHERE batch_id = ?', [id]);

        // Add new timetable entries
        for (const schedule of timetable) {
            await req.db.run(
                'INSERT INTO batch_timetables (batch_id, day_of_week, start_time, end_time, timezone, location_mode, location, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    id,
                    schedule.day_of_week,
                    schedule.start_time,
                    schedule.end_time,
                    schedule.timezone || 'UTC',
                    schedule.location_mode || 'physical',
                    schedule.location,
                    schedule.link
                ]
            );
        }

        res.json({ message: 'Timetable updated successfully' });
    } catch (error) {
        console.error('Update batch timetable error:', error);
        res.status(500).json({ error: 'Failed to update batch timetable' });
    }
});

module.exports = router;