const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin, authenticated } = require('../middleware/auth');

const router = express.Router();

// Get all schedules (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { batch_id, start_date, end_date } = req.query;
        
        let sql = `
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
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
    body('batch_id').isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { title, description, start_time, end_time, type, batch_id } = req.body;

        // Validate time range
        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({ error: 'Start time must be before end time' });
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
            INSERT INTO schedules (title, description, start_time, end_time, type, batch_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [title, description || null, start_time, end_time, type, batch_id]);

        // Get created schedule with batch info
        const newSchedule = await req.db.get(`
            SELECT 
                s.id, s.title, s.description, s.start_time, s.end_time, s.type, s.created_at,
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE s.id = ?
        `, [result.id]);

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
    body('batch_id').optional().isInt({ min: 1 })
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
        const { title, description, start_time, end_time, type, batch_id } = req.body;

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
        
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (start_time !== undefined) {
            updates.push('start_time = ?');
            params.push(start_time);
        }
        if (end_time !== undefined) {
            updates.push('end_time = ?');
            params.push(end_time);
        }
        if (type !== undefined) {
            updates.push('type = ?');
            params.push(type);
        }
        if (batch_id !== undefined) {
            updates.push('batch_id = ?');
            params.push(batch_id);
        }
        
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
                b.name as batch_name, b.french_level,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM schedules s
            LEFT JOIN batches b ON s.batch_id = b.id
            LEFT JOIN users u ON b.teacher_id = u.id
            WHERE s.id = ?
        `, [id]);

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
                SELECT s.id 
                FROM schedules s 
                JOIN batches b ON s.batch_id = b.id 
                WHERE s.id = ? AND b.teacher_id = ?
            `, [id, req.user.id]);
        } else {
            schedule = await req.db.get('SELECT id FROM schedules WHERE id = ?', [id]);
        }
        
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found or access denied' });
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