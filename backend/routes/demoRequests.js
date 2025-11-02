const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendDemoScheduleNotificationToStudent, sendDemoScheduleNotificationToTeacher } = require('../emails/emailService');

const router = express.Router();
const adminOnlyMw = authorizeRoles('admin');

// Create a new demo request (public endpoint)
router.post('/', [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString(),
    body('country').notEmpty().withMessage('Country is required'),
    body('hasPreviousExperience').isIn(['yes', 'no']).withMessage('Previous experience must be yes or no'),
    body('currentLevel').notEmpty().withMessage('Current level is required'),
    body('previousStudyMethod').optional().isString(),
    body('interestedLevel').notEmpty().withMessage('Interested level is required'),
    body('learningGoals').notEmpty().withMessage('Learning goals are required'),
    body('expectations').optional().isString(),
    body('expectedStartTime').notEmpty().withMessage('Expected start time is required'),
    body('preferredSchedule').notEmpty().withMessage('Preferred schedule is required'),
    body('timezone').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const {
            fullName,
            email,
            phone,
            country,
            hasPreviousExperience,
            currentLevel,
            previousStudyMethod,
            interestedLevel,
            learningGoals,
            expectations,
            expectedStartTime,
            preferredSchedule,
            timezone
        } = req.body;

        const insertQuery = `
            INSERT INTO demo_requests (
                full_name, email, phone, country, has_previous_experience,
                current_level, previous_study_method, interested_level,
                learning_goals, expectations, expected_start_time,
                preferred_schedule, timezone, status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *
        `;

        const result = await req.db.run(insertQuery, [
            fullName,
            email,
            phone || null,
            country,
            hasPreviousExperience,
            currentLevel,
            previousStudyMethod || null,
            interestedLevel,
            learningGoals,
            expectations || null,
            expectedStartTime,
            preferredSchedule,
            timezone || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Demo request submitted successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating demo request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit demo request',
            error: error.message 
        });
    }
});

// Get all demo requests with filtering and statistics
router.get('/', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { status, country, level, page = 1, limit = 10, search } = req.query;
        // Ensure numeric pagination values for PostgreSQL LIMIT/OFFSET
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE clause for filtering
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (status) {
            whereConditions.push(`dr.status = $${paramIndex++}`);
            queryParams.push(status);
        }

        if (country) {
            whereConditions.push(`dr.country ILIKE $${paramIndex++}`);
            queryParams.push(`%${country}%`);
        }

        if (level) {
            whereConditions.push(`dr.current_level = $${paramIndex++}`);
            queryParams.push(level);
        }

        if (search) {
            whereConditions.push(`(dr.full_name ILIKE $${paramIndex++} OR dr.email ILIKE $${paramIndex++})`);
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get filtered demo requests with teacher information
        const demoRequestsQuery = `
            SELECT 
                dr.id, dr.full_name, dr.email, dr.phone, dr.country, dr.has_previous_experience,
                dr.current_level, dr.previous_study_method, dr.interested_level,
                dr.learning_goals, dr.expectations, dr.expected_start_time,
                dr.preferred_schedule, dr.timezone, dr.status, dr.notes,
                dr.contacted_at, dr.demo_scheduled_at, dr.created_at, dr.updated_at,
                dr.teacher_id, dr.meeting_link,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name, u.email as teacher_email
            FROM demo_requests dr
            LEFT JOIN users u ON dr.teacher_id = u.id AND u.role = 'teacher'
            ${whereClause}
            ORDER BY dr.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        
        // Push numeric values to avoid PostgreSQL type issues in LIMIT/OFFSET
        queryParams.push(limitNum, offset);

        // Use unified PostgreSQL adapter
        const demoRequestsResult = await req.db.all(demoRequestsQuery, queryParams);

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM demo_requests dr ${whereClause}`;
        const countResult = await req.db.get(countQuery, queryParams.slice(0, -2)); // Remove limit and offset params

        // Get statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'new' THEN 1 END) as new_requests,
                COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
                COUNT(CASE WHEN status = 'demo_scheduled' THEN 1 END) as demo_scheduled,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week,
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as this_month
            FROM demo_requests
        `;
        const statsResult = await req.db.get(statsQuery);

        res.json({
            success: true,
            data: demoRequestsResult,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: parseInt(countResult.total, 10),
                totalPages: Math.ceil(parseInt(countResult.total, 10) / limitNum)
            },
            statistics: statsResult
        });

    } catch (error) {
        console.error('Error fetching demo requests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch demo requests',
            error: error.message 
        });
    }
});

// Get demo requests assigned to the current teacher
router.get('/my-demos', authenticateToken, authorizeRoles('teacher'), async (req, res) => {
    try {
        const teacherId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;
        
        // Ensure numeric pagination values for PostgreSQL LIMIT/OFFSET
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE clause for filtering
        let whereConditions = [`dr.teacher_id = $1`];
        let queryParams = [teacherId];
        let paramIndex = 2;

        if (status) {
            whereConditions.push(`dr.status = $${paramIndex++}`);
            queryParams.push(status);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        // Get assigned demo requests
        const demoRequestsQuery = `
            SELECT 
                dr.id, dr.full_name, dr.email, dr.country, dr.has_previous_experience,
                dr.current_level, dr.interested_level, dr.learning_goals, 
                dr.expected_start_time, dr.preferred_schedule, dr.timezone, 
                dr.status, dr.notes, dr.contacted_at, dr.demo_scheduled_at, 
                dr.meeting_link, dr.created_at, dr.updated_at
            FROM demo_requests dr
            ${whereClause}
            ORDER BY 
                CASE 
                    WHEN dr.status = 'demo_scheduled' THEN 1
                    WHEN dr.status = 'contacted' THEN 2
                    WHEN dr.status = 'new' THEN 3
                    ELSE 4
                END,
                dr.demo_scheduled_at ASC NULLS LAST,
                dr.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        
        queryParams.push(limitNum, offset);
        const demoRequestsResult = await req.db.all(demoRequestsQuery, queryParams);

        // Get total count for pagination
        const countQuery = `SELECT COUNT(*) as total FROM demo_requests dr ${whereClause}`;
        const countResult = await req.db.get(countQuery, queryParams.slice(0, -2)); // Remove limit and offset params

        // Get teacher's demo statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as total_assigned,
                COUNT(CASE WHEN status = 'demo_scheduled' THEN 1 END) as scheduled,
                COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                COUNT(CASE WHEN demo_scheduled_at >= CURRENT_DATE THEN 1 END) as upcoming_demos,
                COUNT(CASE WHEN demo_scheduled_at >= CURRENT_DATE AND demo_scheduled_at < CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as this_week_demos
            FROM demo_requests
            WHERE teacher_id = $1
        `;
        const statsResult = await req.db.get(statsQuery, [teacherId]);

        res.json({
            success: true,
            data: demoRequestsResult,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: parseInt(countResult.total, 10),
                totalPages: Math.ceil(parseInt(countResult.total, 10) / limitNum)
            },
            statistics: statsResult
        });

    } catch (error) {
        console.error('Error fetching teacher demo requests:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch demo requests',
            error: error.message 
        });
    }
});

// Update demo request status
router.patch('/:id/status', authenticateToken, adminOnlyMw, [
    body('status').isIn(['new', 'contacted', 'demo_scheduled', 'completed', 'cancelled']),
    body('notes').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { id } = req.params;
        const { status, notes } = req.body;

        let updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
        let queryParams = [id, status];
        let paramIndex = 3;

        if (notes !== undefined) {
            updateFields.push(`notes = $${paramIndex++}`);
            queryParams.push(notes);
        }

        if (status === 'contacted') {
            updateFields.push(`contacted_at = CURRENT_TIMESTAMP`);
        }

        const updateQuery = `
            UPDATE demo_requests 
            SET ${updateFields.join(', ')}
            WHERE id = $1
            RETURNING *
        `;

        const result = await req.db.run(updateQuery, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Demo request not found' 
            });
        }

        res.json({
            success: true,
            message: 'Demo request updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating demo request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update demo request',
            error: error.message 
        });
    }
});

// Schedule demo for a request
router.patch('/:id/schedule', authenticateToken, adminOnlyMw, [
    body('demo_scheduled_at').isISO8601(),
    body('teacher_id').isInt({ min: 1 }).withMessage('Teacher ID is required'),
    body('meeting_link').isURL().withMessage('Valid meeting link is required'),
    body('notes').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Validation failed', 
                errors: errors.array() 
            });
        }

        const { id } = req.params;
        const { demo_scheduled_at, teacher_id, meeting_link, notes } = req.body;

        // Verify teacher exists
        const teacher = await req.db.get(
            "SELECT id, first_name, last_name, email FROM users WHERE id = ? AND role = 'teacher'",
            [teacher_id]
        );

        if (!teacher) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid teacher selected' 
            });
        }

        let updateFields = [
            'status = $2', 
            'demo_scheduled_at = $3',
            'teacher_id = $4',
            'meeting_link = $5',
            'updated_at = CURRENT_TIMESTAMP'
        ];
        let queryParams = [id, 'demo_scheduled', demo_scheduled_at, teacher_id, meeting_link];
        let paramIndex = 6;

        if (notes !== undefined) {
            updateFields.push(`notes = $${paramIndex++}`);
            queryParams.push(notes);
        }

        const updateQuery = `
            UPDATE demo_requests 
            SET ${updateFields.join(', ')}
            WHERE id = $1
            RETURNING *
        `;

        const result = await req.db.run(updateQuery, queryParams);

        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Demo request not found' 
            });
        }

        // Get the updated demo request with teacher information
        const updatedDemo = await req.db.get(`
            SELECT dr.*, u.first_name as teacher_first_name, u.last_name as teacher_last_name, u.email as teacher_email
            FROM demo_requests dr
            LEFT JOIN users u ON dr.teacher_id = u.id
            WHERE dr.id = ?
        `, [id]);

        // Send email notifications
        try {
            // Send notification to student
            await sendDemoScheduleNotificationToStudent({
                to: updatedDemo.email,
                studentName: updatedDemo.full_name,
                teacherName: `${updatedDemo.teacher_first_name} ${updatedDemo.teacher_last_name}`.trim(),
                teacherEmail: updatedDemo.teacher_email,
                demoDate: updatedDemo.demo_scheduled_at,
                meetingLink: updatedDemo.meeting_link,
                notes: updatedDemo.notes
            });

            // Send notification to teacher
            await sendDemoScheduleNotificationToTeacher({
                to: updatedDemo.teacher_email,
                teacherName: `${updatedDemo.teacher_first_name} ${updatedDemo.teacher_last_name}`.trim(),
                studentName: updatedDemo.full_name,
                studentEmail: updatedDemo.email,
                studentLevel: updatedDemo.current_level,
                studentGoals: updatedDemo.learning_goals,
                studentExpectations: updatedDemo.expectations,
                demoDate: updatedDemo.demo_scheduled_at,
                meetingLink: updatedDemo.meeting_link,
                notes: updatedDemo.notes
            });

            console.log('✅ Demo scheduling notifications sent successfully');
        } catch (emailError) {
            console.error('❌ Failed to send demo scheduling notifications:', emailError);
            // Don't fail the request if email fails, just log the error
        }

        res.json({
            success: true,
            message: 'Demo scheduled successfully',
            data: updatedDemo
        });

    } catch (error) {
        console.error('Error scheduling demo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to schedule demo',
            error: error.message 
        });
    }
});

// Get demo request by ID
router.get('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await req.db.get(`
            SELECT 
                dr.*, 
                u.first_name as teacher_first_name, 
                u.last_name as teacher_last_name, 
                u.email as teacher_email
            FROM demo_requests dr
            LEFT JOIN users u ON dr.teacher_id = u.id AND u.role = 'teacher'
            WHERE dr.id = $1
        `, [id]);

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: 'Demo request not found' 
            });
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching demo request:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch demo request',
            error: error.message 
        });
    }
});

module.exports = router;