const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, adminOnly, teacherOrAdmin } = require('../middleware/auth');

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

        const { name, teacher_id, french_level, start_date, end_date, student_ids } = req.body;

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
            'INSERT INTO batches (name, teacher_id, french_level, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            [name, teacher_id, french_level, start_date, end_date]
        );

        const batchId = result.id;

        // Add students to batch
        for (const studentId of student_ids) {
            await req.db.run(
                'INSERT INTO batch_students (batch_id, student_id) VALUES (?, ?)',
                [batchId, studentId]
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

module.exports = router;