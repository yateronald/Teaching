const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendDemoScheduleNotificationToStudent, sendDemoScheduleNotificationToTeacher } = require('../emails/emailService');
const { createBulkNotifications } = require('../services/notificationService');
const { hasColumn } = require('../services/schemaFeatures');

const router = express.Router();
const adminOnlyMw = authorizeRoles('admin');

/** How many requests nobody has answered yet, and the newest of them. */
async function waitingSummary(db) {
    const [count, latest] = await Promise.all([
        db.get(`SELECT COUNT(*)::int AS waiting,
                       COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours')::int AS today
                  FROM demo_requests WHERE status = 'new'`),
        db.get(`SELECT id, full_name, country, created_at FROM demo_requests
                 WHERE status = 'new' ORDER BY created_at DESC LIMIT 1`),
    ]);
    return { waiting: count?.waiting || 0, today: count?.today || 0, latest: latest || null };
}

/** Tells every administrator how many are waiting now (after one is picked up). */
async function announceWaitingChanged(req) {
    if (!req.io) return;
    const summary = await waitingSummary(req.db);
    const admins = await req.db.all("SELECT id FROM users WHERE role = 'admin' AND is_active = true");
    admins.forEach(admin => req.io.to(`user:${admin.id}`).emit('demo:waiting', { waiting: summary.waiting }));
}

/**
 * A new request is pushed to every administrator: a notification they will
 * still find tomorrow, and a live event so the console lights up now.
 */
async function announceNewRequest(req, request) {
    const admins = await req.db.all("SELECT id FROM users WHERE role = 'admin' AND is_active = true");
    if (!admins.length) return;

    const summary = await waitingSummary(req.db);
    await createBulkNotifications(req.db, admins.map(a => a.id), {
        type: 'demo_request',
        title: 'New demo request',
        message: `${request.full_name}${request.country ? ` (${request.country})` : ''} asked for a demo class. They are waiting for an answer.`,
        link: '/app/demo-requests',
        entity_type: 'demo_request',
        entity_id: request.id,
    });

    if (req.io) {
        const payload = {
            id: request.id,
            full_name: request.full_name,
            country: request.country || null,
            created_at: request.created_at,
            waiting: summary.waiting,
        };
        admins.forEach(admin => req.io.to(`user:${admin.id}`).emit('demo:new', payload));
    }
}

// What a request can be for, and what an exam request may say about the exam.
const INTERESTS = ['classes', 'exam'];
const EXAMS = ['tcf_canada', 'tcf_quebec', 'tcf_tp', 'tef_canada', 'tefaq', 'delf', 'dalf', 'other'];
const SKILLS = ['ce', 'co', 'ee', 'eo'];

const isExamRequest = (req) => String(req.body ? req.body.interest || '' : '').trim() === 'exam';
const classOnly = (chain) => chain.if((_value, { req }) => !isExamRequest(req));

// Create a new demo request (public endpoint)
router.post('/', [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isString(),
    body('country').notEmpty().withMessage('Country is required'),
    body('interest').optional().isIn(INTERESTS).withMessage('Choose classes or exam preparation'),
    body('hasPreviousExperience').isIn(['yes', 'no']).withMessage('Previous experience must be yes or no'),
    body('currentLevel').notEmpty().withMessage('Current level is required'),
    body('previousStudyMethod').optional().isString(),
    // A class level and a weekly timetable only mean something for classes.
    classOnly(body('interestedLevel')).notEmpty().withMessage('Interested level is required'),
    classOnly(body('preferredSchedule')).notEmpty().withMessage('Preferred schedule is required'),
    body('learningGoals').notEmpty().withMessage('Learning goals are required'),
    body('expectations').optional().isString(),
    body('expectedStartTime').notEmpty().withMessage('Expected start time is required'),
    body('timezone').optional().isString(),
    // Exam preparation: which exam, when, what score, which papers.
    body('targetExam').if((_value, { req }) => isExamRequest(req)).isIn(EXAMS).withMessage('Choose the exam you are preparing'),
    body('examDate').optional({ values: 'falsy' }).isISO8601().withMessage('Enter a valid exam date'),
    body('targetScore').optional().isString().isLength({ max: 32 }),
    body('skills').optional().isArray({ max: 4 }),
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

        const interest = INTERESTS.includes(req.body.interest) ? req.body.interest : 'classes';
        const exam = interest === 'exam';
        // Only ever stored for an exam request, and only from the allowlists.
        const targetExam = exam && EXAMS.includes(req.body.targetExam) ? req.body.targetExam : null;
        const examDate = exam && req.body.examDate ? String(req.body.examDate).slice(0, 10) : null;
        const targetScore = exam && req.body.targetScore ? String(req.body.targetScore).trim().slice(0, 32) : null;
        const skills = exam && Array.isArray(req.body.skills)
            ? [...new Set(req.body.skills.filter(skill => SKILLS.includes(skill)))].join(',') || null
            : null;

        // The new columns are only written once their migration has run.
        const withInterest = await hasColumn(req.db, 'demo_requests', 'interest');
        const insertQuery = `
            INSERT INTO demo_requests (
                full_name, email, phone, country, has_previous_experience,
                current_level, previous_study_method, interested_level,
                learning_goals, expectations, expected_start_time,
                preferred_schedule, timezone, status, created_at, updated_at
                ${withInterest ? ', interest, target_exam, exam_date, target_score, skills' : ''}
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                ${withInterest ? ', $14, $15, $16, $17, $18' : ''}
            ) RETURNING *
        `;

        const values = [
            fullName,
            email,
            phone || null,
            country,
            hasPreviousExperience,
            currentLevel,
            previousStudyMethod || null,
            interestedLevel || null,
            learningGoals,
            expectations || null,
            expectedStartTime,
            preferredSchedule || null,
            timezone || null,
        ];
        if (withInterest) values.push(interest, targetExam, examDate, targetScore, skills);

        const result = await req.db.run(insertQuery, values);

        const created = result.rows[0];

        // Tell the administrators at once: a person waiting for an answer is
        // the one thing in this platform that goes stale by the hour.
        announceNewRequest(req, created).catch(e => console.error('Demo request alert failed:', e.message));

        res.status(201).json({
            success: true,
            message: 'Demo request submitted successfully',
            data: created
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

// How many people are waiting for an answer — polled by the admin console for
// the badge on the Demo Requests tab. Deliberately tiny and cheap.
router.get('/alerts', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        res.json(await waitingSummary(req.db));
    } catch (error) {
        console.error('Demo request alerts error:', error);
        res.status(500).json({ error: 'Failed to load demo request alerts' });
    }
});

// Get all demo requests with filtering and statistics
router.get('/', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { status, country, level, interest, page = 1, limit = 10, search, start_date, end_date } = req.query;
        // The interest columns exist only once migration 023 has run.
        const withInterest = await hasColumn(req.db, 'demo_requests', 'interest');
        const interestColumns = withInterest
            ? ', dr.interest, dr.target_exam, dr.exam_date::text AS exam_date, dr.target_score, dr.skills'
            : '';
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

        if (interest && withInterest && INTERESTS.includes(interest)) {
            whereConditions.push(`dr.interest = $${paramIndex++}`);
            queryParams.push(interest);
        }

        if (search) {
            whereConditions.push(`(dr.full_name ILIKE $${paramIndex++} OR dr.email ILIKE $${paramIndex++})`);
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (start_date && end_date) {
            whereConditions.push(`dr.created_at >= $${paramIndex++} AND dr.created_at <= $${paramIndex++}::timestamp + interval '1 day'`);
            queryParams.push(start_date, end_date);
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
                dr.teacher_id, dr.meeting_link${interestColumns},
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
                ${withInterest ? `,
                COUNT(CASE WHEN interest = 'exam' THEN 1 END) as exam_requests,
                COUNT(CASE WHEN interest <> 'exam' THEN 1 END) as class_requests,
                COUNT(CASE WHEN interest = 'exam' AND status = 'new' THEN 1 END) as exam_new` : ''}
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
        const { status, page = 1, limit = 10, start_date, end_date } = req.query;
        
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

        if (start_date && end_date) {
            whereConditions.push(`dr.demo_scheduled_at >= $${paramIndex++} AND dr.demo_scheduled_at <= $${paramIndex++}`);
            queryParams.push(start_date, end_date);
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

        // Every open admin console drops its badge as soon as one of them
        // picks a request up.
        announceWaitingChanged(req).catch(() => { /* the badge also polls */ });

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
            SELECT dr.*,
                   u.first_name as teacher_first_name, u.last_name as teacher_last_name, u.email as teacher_email,
                   u.timezone AS teacher_timezone,
                   s_user.timezone AS student_timezone
            FROM demo_requests dr
            LEFT JOIN users u ON dr.teacher_id = u.id
            LEFT JOIN users s_user ON s_user.email = dr.email AND s_user.role = 'student'
            WHERE dr.id = ?
        `, [id]);

        // 🔔 Notify the assigned teacher in-app
        try {
            const { createNotification } = require('../services/notificationService');
            await createNotification(req.db, {
                user_id: parseInt(teacher_id),
                type: 'demo_assigned',
                title: 'New demo class assigned',
                message: `${updatedDemo?.full_name || 'A student'} has a demo scheduled. Check your demo requests.`,
                link: `/app/teacher-demos?demo=${id}`,
                entity_type: 'demo_request',
                entity_id: parseInt(id),
                sender_id: req.user.id,
            });
        } catch (notifErr) {
            console.warn('[notifications] demo_assigned failed:', notifErr.message);
        }

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
                notes: updatedDemo.notes,
                recipientTimezone: updatedDemo.student_timezone || 'UTC',
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
                notes: updatedDemo.notes,
                recipientTimezone: updatedDemo.teacher_timezone || 'UTC',
            });

            console.log('✅ Demo scheduling notifications sent successfully');
        } catch (emailError) {
            console.error('❌ Failed to send demo scheduling notifications:', emailError);
            // Don't fail the request if email fails, just log the error
        }

        announceWaitingChanged(req).catch(() => { /* the badge also polls */ });

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

// Delete a demo request (admin only)
router.delete('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the record exists
        const existing = await req.db.get('SELECT id FROM demo_requests WHERE id = $1', [id]);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Demo request not found' });
        }

        const result = await req.db.run('DELETE FROM demo_requests WHERE id = $1', [id]);

        // Some adapters return affectedRows instead of rowCount; respond success regardless if no error thrown
        if (result && result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Demo request not found' });
        }

        announceWaitingChanged(req).catch(() => { /* the badge also polls */ });

        res.json({ success: true, message: 'Demo request deleted successfully' });
    } catch (error) {
        console.error('Error deleting demo request:', error);
        res.status(500).json({ success: false, message: 'Failed to delete demo request', error: error.message });
    }
});

module.exports = router;