const crypto = require('crypto');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
    sendDemoScheduleNotificationToStudent,
    sendDemoScheduleNotificationToTeacher,
    sendDemoAvailabilityRequest,
    sendDemoRequestConfirmation,
    sendPublicMeetingInvite,
} = require('../emails/emailService');
const { createBulkNotifications } = require('../services/notificationService');
const { hasColumn } = require('../services/schemaFeatures');
const access = require('../services/meetingAccess');

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

const WA_BAD_RUN_RE = /^(.)\1+$/;
const WA_BAD_SEQ_RE = /(?:01234567|12345678|23456789|98765432|87654321|76543210)/;

/**
 * Validates and normalizes the compulsory WhatsApp phone number submitted by
 * the demo request form (7 to 15 digits, optional leading + or 00).
 */
function normalizeDemoWhatsApp(raw) {
    const stripped = String(raw ?? '').replace(/[\u200e\u200f\u202a-\u202e\s().-]+/g, '');
    if (!stripped) {
        return { ok: false, message: 'WhatsApp number is required so an administrator can contact you' };
    }
    if (!/^\+?\d+$/.test(stripped)) {
        return { ok: false, message: 'Enter a valid WhatsApp number with digits and optional + country code' };
    }
    const hasIntlPrefix = stripped.startsWith('+') || stripped.startsWith('00');
    const digits = stripped.startsWith('+')
        ? stripped.slice(1)
        : (stripped.startsWith('00') ? stripped.slice(2) : stripped);
    const isDummyRun = WA_BAD_RUN_RE.test(digits)
        || WA_BAD_RUN_RE.test(digits.slice(1))
        || WA_BAD_RUN_RE.test(digits.slice(2))
        || WA_BAD_RUN_RE.test(digits.slice(3))
        || WA_BAD_SEQ_RE.test(digits);
    if (digits.length < 7 || digits.length > 15 || (hasIntlPrefix && digits.startsWith('0')) || isDummyRun) {
        return { ok: false, message: 'Enter a valid WhatsApp number (7 to 15 digits with country code)' };
    }
    return { ok: true, normalized: hasIntlPrefix ? `+${digits}` : digits };
}

// Create a new demo request (public endpoint)
router.post('/', [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').custom((value) => {
        const check = normalizeDemoWhatsApp(value);
        if (!check.ok) throw new Error(check.message);
        return true;
    }),
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
            const errorList = errors.array();
            return res.status(400).json({ 
                success: false, 
                message: errorList[0]?.msg || 'Validation failed', 
                errors: errorList 
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

        const normalizedPhone = normalizeDemoWhatsApp(phone).normalized;
        const values = [
            fullName,
            email,
            normalizedPhone || null,
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

        // Send an automatic confirmation email so the prospect knows we received
        // their request and will reach out by WhatsApp or email.
        sendDemoRequestConfirmation({
            to: created.email,
            fullName: created.full_name,
            email: created.email,
            phone: created.phone,
            interest,
            currentLevel: created.current_level,
            interestedLevel: created.interested_level,
            targetExam,
            preferredSchedule: created.preferred_schedule,
        }).catch(e => console.error('Demo request confirmation email failed:', e.message));

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
        const withProposedSlots = await hasColumn(req.db, 'demo_availability_requests', 'proposed_slots');
        const proposedSlotsExpr = withProposedSlots
            ? `COALESCE(dar.proposed_slots, CASE WHEN jsonb_typeof(dar.proposed_days) = 'object' AND dar.proposed_days ? 'slots' THEN dar.proposed_days->'slots' ELSE NULL END)`
            : `CASE WHEN jsonb_typeof(dar.proposed_days) = 'object' AND dar.proposed_days ? 'slots' THEN dar.proposed_days->'slots' ELSE NULL END`;
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

        // Get filtered demo requests with teacher, latest availability, and linked meeting info
        const demoRequestsQuery = `
            SELECT 
                dr.id, dr.full_name, dr.email, dr.phone, dr.country, dr.has_previous_experience,
                dr.current_level, dr.previous_study_method, dr.interested_level,
                dr.learning_goals, dr.expectations, dr.expected_start_time,
                dr.preferred_schedule, dr.timezone, dr.status, dr.notes,
                dr.contacted_at, dr.demo_scheduled_at, dr.created_at, dr.updated_at,
                dr.teacher_id, dr.meeting_link, dr.meeting_id${interestColumns},
                u.first_name as teacher_first_name, u.last_name as teacher_last_name, u.email as teacher_email,
                CASE WHEN dar.id IS NOT NULL THEN json_build_object(
                    'id', dar.id,
                    'status', CASE
                      WHEN dar.status = 'pending' AND dar.expires_at <= CURRENT_TIMESTAMP THEN 'expired'
                      ELSE dar.status
                    END,
                    'proposed_timezone', dar.proposed_timezone,
                    'proposed_start_date', dar.proposed_start_date::text,
                    'proposed_end_date', dar.proposed_end_date::text,
                    'proposed_time_start', dar.proposed_time_start,
                    'proposed_time_end', dar.proposed_time_end,
                    'proposed_days', dar.proposed_days,
                    'proposed_slots', ${proposedSlotsExpr},
                    'admin_note', dar.admin_note,
                    'expires_at', dar.expires_at,
                    'submitted_at', dar.submitted_at,
                    'submitted_timezone', dar.submitted_timezone,
                    'submitted_slots', dar.submitted_slots,
                    'submitted_note', dar.submitted_note,
                    'created_at', dar.created_at
                ) ELSE NULL END AS latest_availability,
                CASE WHEN m.id IS NOT NULL THEN json_build_object(
                    'id', m.id,
                    'code', m.room_name,
                    'title', m.title,
                    'status', m.status,
                    'scheduled_start', m.scheduled_start,
                    'scheduled_end', m.scheduled_end,
                    'is_public', m.is_public,
                    'require_approval', m.require_approval,
                    'encrypted_passcode', m.password
                ) ELSE NULL END AS linked_meeting_raw
            FROM demo_requests dr
            LEFT JOIN users u ON dr.teacher_id = u.id
            LEFT JOIN meetings m ON dr.meeting_id = m.id
            LEFT JOIN LATERAL (
                SELECT * FROM demo_availability_requests dar2
                WHERE dar2.demo_request_id = dr.id
                ORDER BY dar2.created_at DESC
                LIMIT 1
            ) dar ON TRUE
            ${whereClause}
            ORDER BY dr.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;
        
        // Push numeric values to avoid PostgreSQL type issues in LIMIT/OFFSET
        queryParams.push(limitNum, offset);

        // Use unified PostgreSQL adapter
        const rawRows = await req.db.all(demoRequestsQuery, queryParams);
        const demoRequestsResult = rawRows.map(row => {
            const lm = row.linked_meeting_raw;
            const { linked_meeting_raw, ...rest } = row;
            let linked_meeting = null;
            if (lm) {
                const { encrypted_passcode, ...lmSafe } = lm;
                const pass = encrypted_passcode ? access.openPasscode(encrypted_passcode) : null;
                linked_meeting = {
                    ...lmSafe,
                    passcode: pass,
                    public_link: lm.is_public ? access.publicMeetingUrl(lm.code, pass) : null,
                };
            }
            return { ...rest, linked_meeting };
        });

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
                COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as this_month,
                (SELECT COUNT(DISTINCT dr2.id)
                 FROM demo_requests dr2
                 JOIN demo_availability_requests dar2 ON dar2.demo_request_id = dr2.id
                 WHERE dar2.status = 'submitted' AND dr2.status IN ('new', 'contacted')) as availability_received
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

const AVAIL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const AVAIL_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function sanitizeProposedSlots(rawSlots) {
    if (!Array.isArray(rawSlots) || rawSlots.length === 0 || rawSlots.length > 15) {
        return null;
    }
    const seen = new Set();
    const cleaned = [];
    for (const item of rawSlots) {
        if (!item || typeof item !== 'object') return null;
        const date = String(item.date || '').trim();
        const rawEndDate = item.end_date ? String(item.end_date).trim() : '';
        const endDate = rawEndDate && rawEndDate !== date ? rawEndDate : null;
        const start = String(item.start || '').trim();
        const end = String(item.end || '').trim();
        if (!AVAIL_DATE_RE.test(date) || !AVAIL_TIME_RE.test(start) || !AVAIL_TIME_RE.test(end)) return null;
        if (endDate) {
            if (!AVAIL_DATE_RE.test(endDate) || endDate < date) return null;
            const optSpan = (Date.parse(endDate) - Date.parse(date)) / 86400000;
            if (optSpan > 31) return null;
        }
        if (end <= start) return null;
        const key = `${date}|${endDate || date}|${start}|${end}`;
        if (seen.has(key)) continue;
        seen.add(key);
        cleaned.push(endDate ? { date, end_date: endDate, start, end } : { date, start, end });
    }
    cleaned.sort((a, b) =>
        a.date.localeCompare(b.date)
        || (a.end_date || a.date).localeCompare(b.end_date || b.date)
        || a.start.localeCompare(b.start)
        || a.end.localeCompare(b.end)
    );
    return cleaned.length > 0 ? cleaned : null;
}

// Ask prospect for their availability via a single-use expiring link
router.post('/:id/request-availability', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            proposed_slots,
            proposed_start_date,
            proposed_end_date,
            proposed_time_start,
            proposed_time_end,
            proposed_timezone,
            proposed_days,
            admin_note,
            expires_in_days,
        } = req.body || {};

        let proposedSlots = null;
        let startDate = String(proposed_start_date || '').trim();
        let endDate = String(proposed_end_date || '').trim();
        let timeStart = String(proposed_time_start || '').trim();
        let timeEnd = String(proposed_time_end || '').trim();

        if (proposed_slots !== undefined) {
            proposedSlots = sanitizeProposedSlots(proposed_slots);
            if (!proposedSlots) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide 1 to 15 valid date/range and time options (end must be after start; per-option range up to 31 days).',
                });
            }
            startDate = proposedSlots.reduce((min, s) => (s.date < min ? s.date : min), proposedSlots[0].date);
            endDate = proposedSlots.reduce((max, s) => {
                const d = s.end_date || s.date;
                return d > max ? d : max;
            }, proposedSlots[0].end_date || proposedSlots[0].date);
            const spanDays = (Date.parse(endDate) - Date.parse(startDate)) / 86400000;
            if (spanDays > 90) {
                return res.status(400).json({ success: false, message: 'Proposed dates cannot span more than 90 days.' });
            }
            timeStart = proposedSlots.reduce((min, s) => (s.start < min ? s.start : min), proposedSlots[0].start);
            timeEnd = proposedSlots.reduce((max, s) => (s.end > max ? s.end : max), proposedSlots[0].end);
        } else {
            if (!AVAIL_DATE_RE.test(startDate) || !AVAIL_DATE_RE.test(endDate)) {
                return res.status(400).json({ success: false, message: 'Valid start and end dates (YYYY-MM-DD) are required' });
            }
            if (endDate < startDate) {
                return res.status(400).json({ success: false, message: 'End date must be on or after start date' });
            }
            const daySpan = (Date.parse(endDate) - Date.parse(startDate)) / 86400000;
            if (daySpan > 60) {
                return res.status(400).json({ success: false, message: 'Date range cannot exceed 60 days' });
            }
            if (!AVAIL_TIME_RE.test(timeStart) || !AVAIL_TIME_RE.test(timeEnd)) {
                return res.status(400).json({ success: false, message: 'Valid start and end times (HH:MM) are required' });
            }
            if (timeEnd <= timeStart) {
                return res.status(400).json({ success: false, message: 'End time must be after start time' });
            }
        }

        const tz = String(proposed_timezone || req.user.timezone || 'UTC').trim().slice(0, 80);
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: tz }).format();
        } catch {
            return res.status(400).json({ success: false, message: 'Invalid timezone selected' });
        }

        const demo = await req.db.get('SELECT * FROM demo_requests WHERE id = $1', [id]);
        if (!demo) {
            return res.status(404).json({ success: false, message: 'Demo request not found' });
        }

        const days = Array.isArray(proposed_days)
            ? proposed_days.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n <= 6)
            : null;
        const cleanNote = typeof admin_note === 'string' && admin_note.trim() ? admin_note.trim().slice(0, 1000) : null;
        const expDays = Math.min(Math.max(parseInt(expires_in_days, 10) || 14, 1), 30);
        const expiresAt = new Date(Date.now() + expDays * 86400000).toISOString();

        // Mark prior pending availability links as superseded so old links cannot be used
        await req.db.run(
            `UPDATE demo_availability_requests
             SET status = 'superseded', updated_at = CURRENT_TIMESTAMP
             WHERE demo_request_id = $1 AND status = 'pending'`,
            [demo.id]
        );

        const rawToken = crypto.randomBytes(32).toString('base64url');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const withProposedSlots = await hasColumn(req.db, 'demo_availability_requests', 'proposed_slots');

        const inserted = withProposedSlots
            ? await req.db.run(
                `INSERT INTO demo_availability_requests (
                    demo_request_id, token_hash, created_by, proposed_timezone,
                    proposed_start_date, proposed_end_date, proposed_time_start, proposed_time_end,
                    proposed_days, proposed_slots, admin_note, status, expires_at
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, 'pending', $12)
                 RETURNING id, demo_request_id, created_by, proposed_timezone,
                           proposed_start_date::text AS proposed_start_date,
                           proposed_end_date::text AS proposed_end_date,
                           proposed_time_start, proposed_time_end, proposed_days, proposed_slots, admin_note,
                           status, expires_at, created_at`,
                [
                    demo.id,
                    tokenHash,
                    req.user.id,
                    tz,
                    startDate,
                    endDate,
                    timeStart,
                    timeEnd,
                    days ? JSON.stringify(days) : null,
                    proposedSlots ? JSON.stringify(proposedSlots) : null,
                    cleanNote,
                    expiresAt,
                ]
            )
            : await req.db.run(
                `INSERT INTO demo_availability_requests (
                    demo_request_id, token_hash, created_by, proposed_timezone,
                    proposed_start_date, proposed_end_date, proposed_time_start, proposed_time_end,
                    proposed_days, admin_note, status, expires_at
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, 'pending', $11)
                 RETURNING id, demo_request_id, created_by, proposed_timezone,
                           proposed_start_date::text AS proposed_start_date,
                           proposed_end_date::text AS proposed_end_date,
                           proposed_time_start, proposed_time_end, proposed_days, admin_note,
                           status, expires_at, created_at`,
                [
                    demo.id,
                    tokenHash,
                    req.user.id,
                    tz,
                    startDate,
                    endDate,
                    timeStart,
                    timeEnd,
                    proposedSlots ? JSON.stringify({ version: 2, slots: proposedSlots }) : (days ? JSON.stringify(days) : null),
                    cleanNote,
                    expiresAt,
                ]
            );

        if (demo.status === 'new') {
            await req.db.run(
                `UPDATE demo_requests
                 SET status = 'contacted', contacted_at = COALESCE(contacted_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [demo.id]
            );
            announceWaitingChanged(req).catch(() => {});
        }

        const availabilityUrl = `${access.frontendBase()}/demo-availability/${rawToken}`;
        let emailSent = true;
        try {
            await sendDemoAvailabilityRequest({
                to: demo.email,
                recipientName: demo.full_name,
                proposedSlots,
                proposedStartDate: startDate,
                proposedEndDate: endDate,
                proposedTimeStart: timeStart,
                proposedTimeEnd: timeEnd,
                proposedTimezone: tz,
                adminNote: cleanNote,
                availabilityUrl,
                expiresAt,
            });
        } catch (emailErr) {
            emailSent = false;
            console.error('❌ Failed to send availability request email:', emailErr.message);
        }

        const savedRow = inserted.rows[0];
        if (!savedRow.proposed_slots && proposedSlots) {
            savedRow.proposed_slots = proposedSlots;
        }

        return res.status(201).json({
            success: true,
            email_sent: emailSent,
            availability_request: savedRow,
        });
    } catch (error) {
        console.error('POST /demo-requests/:id/request-availability error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send availability request' });
    }
});

// Create a public live demo meeting directly, add to Admin Calendar, link demo request, and email prospect
router.post('/:id/schedule-meeting', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            scheduled_start,
            scheduled_end,
            title,
            host_id,
            teacher_id,
            require_approval = true,
            notes,
            host_timezone,
        } = req.body || {};

        if (!scheduled_start || Number.isNaN(Date.parse(scheduled_start))) {
            return res.status(400).json({ success: false, message: 'A valid scheduled_start timestamp is required' });
        }
        const startDate = new Date(scheduled_start);
        const endDate = scheduled_end && !Number.isNaN(Date.parse(scheduled_end))
            ? new Date(scheduled_end)
            : new Date(startDate.getTime() + 30 * 60000);
        if (endDate <= startDate) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }

        const demo = await req.db.get('SELECT * FROM demo_requests WHERE id = $1', [id]);
        if (!demo) {
            return res.status(404).json({ success: false, message: 'Demo request not found' });
        }

        const targetHostId = Number(host_id || teacher_id) || req.user.id;
        const host = await req.db.get(
            "SELECT id, first_name, last_name, email, role, timezone FROM users WHERE id = $1 AND role IN ('admin', 'teacher') AND is_active = TRUE",
            [targetHostId]
        );
        if (!host) {
            return res.status(400).json({ success: false, message: 'Selected host must be an active admin or teacher' });
        }

        const cleanTitle = (typeof title === 'string' && title.trim()
            ? title.trim()
            : `French Demo: ${demo.full_name}`).slice(0, 300);
        const cleanNotes = typeof notes === 'string' && notes.trim() ? notes.trim().slice(0, 2000) : null;
        const tz = (typeof host_timezone === 'string' && host_timezone.trim())
            ? host_timezone.trim().slice(0, 80)
            : (host.timezone || req.user.timezone || 'UTC');

        const code = await access.uniqueMeetingCode(req.db);
        const passcode = access.generatePasscode();
        const sealedPass = access.sealPasscode(passcode);
        const reqApproval = Boolean(require_approval);

        const created = await req.db.run(
            `INSERT INTO meetings (
                room_name, title, description, teacher_id, batch_id, status,
                scheduled_start, scheduled_end, password, trusted_user_ids, max_participants,
                is_public, require_approval, meeting_kind, demo_request_id, host_timezone
             ) VALUES ($1, $2, $3, $4, NULL, 'scheduled', $5, $6, $7, '{}', 15, TRUE, $8, 'demo', $9, $10)
             RETURNING *`,
            [
                code,
                cleanTitle,
                cleanNotes,
                host.id,
                startDate.toISOString(),
                endDate.toISOString(),
                sealedPass,
                reqApproval,
                demo.id,
                tz,
            ]
        );
        const meeting = created.rows[0];
        const publicLink = access.publicMeetingUrl(code, passcode);

        const prospectEmail = String(demo.email).trim().toLowerCase();
        await req.db.run(
            `INSERT INTO meeting_invitees (meeting_id, email, name, invited_by, notified_at)
             VALUES ($1, $2, $3, $4, NULL)
             ON CONFLICT (meeting_id, email) DO NOTHING`,
            [meeting.id, prospectEmail, demo.full_name, req.user.id]
        );

        const updatedDemoRes = await req.db.run(
            `UPDATE demo_requests
             SET status = 'demo_scheduled',
                 demo_scheduled_at = $2,
                 teacher_id = $3,
                 meeting_id = $4,
                 meeting_link = $5,
                 notes = COALESCE($6, notes),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [demo.id, startDate.toISOString(), host.id, meeting.id, publicLink, cleanNotes]
        );

        // Determine the best timezone for the prospect's email
        const latestAvail = await req.db.get(
            `SELECT submitted_timezone FROM demo_availability_requests
             WHERE demo_request_id = $1 AND status = 'submitted'
             ORDER BY submitted_at DESC LIMIT 1`,
            [demo.id]
        ).catch(() => null);
        const prospectTz = latestAvail?.submitted_timezone || demo.timezone || tz || 'UTC';
        const hostName = `${host.first_name || ''} ${host.last_name || ''}`.trim() || 'Your host';

        let emailSent = true;
        try {
            await sendPublicMeetingInvite({
                to: demo.email,
                recipientName: demo.full_name,
                title: cleanTitle,
                description: cleanNotes,
                hostName,
                scheduledStart: startDate.toISOString(),
                scheduledEnd: endDate.toISOString(),
                recipientTimezone: prospectTz,
                meetingUrl: publicLink,
                meetingCode: code,
                passcode,
                requireApproval: reqApproval,
                isDemo: true,
                notes: cleanNotes,
            });
            await req.db.run(
                'UPDATE meeting_invitees SET notified_at = CURRENT_TIMESTAMP WHERE meeting_id = $1 AND email = $2',
                [meeting.id, prospectEmail]
            ).catch(() => {});
            if (host.id !== req.user.id && host.email) {
                await sendDemoScheduleNotificationToTeacher({
                    to: host.email,
                    teacherName: hostName,
                    studentName: demo.full_name,
                    studentEmail: demo.email,
                    studentLevel: demo.current_level,
                    studentGoals: demo.learning_goals,
                    studentExpectations: demo.expectations,
                    demoDate: startDate.toISOString(),
                    meetingLink: `${access.frontendBase()}/app/meeting/${code}`,
                    notes: cleanNotes || undefined,
                    recipientTimezone: host.timezone || tz,
                });
            }
        } catch (emailErr) {
            emailSent = false;
            console.error('❌ Failed to send demo meeting invite email:', emailErr.message);
        }

        if (req.io) {
            req.io.emit('meeting:created', { meetingId: meeting.id });
        }
        announceWaitingChanged(req).catch(() => {});

        return res.status(201).json({
            success: true,
            email_sent: emailSent,
            data: updatedDemoRes.rows[0],
            meeting: {
                id: meeting.id,
                code,
                title: meeting.title,
                status: meeting.status,
                scheduled_start: meeting.scheduled_start,
                scheduled_end: meeting.scheduled_end,
                is_public: true,
                require_approval: reqApproval,
                passcode,
                public_link: publicLink,
            },
        });
    } catch (error) {
        console.error('POST /demo-requests/:id/schedule-meeting error:', error);
        return res.status(500).json({ success: false, message: 'Failed to schedule demo meeting' });
    }
});

// Get demo request by ID
router.get('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const withProposedSlots = await hasColumn(req.db, 'demo_availability_requests', 'proposed_slots');
        const proposedSlotsExpr = withProposedSlots
            ? `COALESCE(dar.proposed_slots, CASE WHEN jsonb_typeof(dar.proposed_days) = 'object' AND dar.proposed_days ? 'slots' THEN dar.proposed_days->'slots' ELSE NULL END)`
            : `CASE WHEN jsonb_typeof(dar.proposed_days) = 'object' AND dar.proposed_days ? 'slots' THEN dar.proposed_days->'slots' ELSE NULL END`;

        const result = await req.db.get(`
            SELECT 
                dr.*, 
                u.first_name as teacher_first_name, 
                u.last_name as teacher_last_name, 
                u.email as teacher_email,
                CASE WHEN dar.id IS NOT NULL THEN json_build_object(
                    'id', dar.id,
                    'status', CASE
                      WHEN dar.status = 'pending' AND dar.expires_at <= CURRENT_TIMESTAMP THEN 'expired'
                      ELSE dar.status
                    END,
                    'proposed_timezone', dar.proposed_timezone,
                    'proposed_start_date', dar.proposed_start_date::text,
                    'proposed_end_date', dar.proposed_end_date::text,
                    'proposed_time_start', dar.proposed_time_start,
                    'proposed_time_end', dar.proposed_time_end,
                    'proposed_days', dar.proposed_days,
                    'proposed_slots', ${proposedSlotsExpr},
                    'admin_note', dar.admin_note,
                    'expires_at', dar.expires_at,
                    'submitted_at', dar.submitted_at,
                    'submitted_timezone', dar.submitted_timezone,
                    'submitted_slots', dar.submitted_slots,
                    'submitted_note', dar.submitted_note,
                    'created_at', dar.created_at
                ) ELSE NULL END AS latest_availability,
                CASE WHEN m.id IS NOT NULL THEN json_build_object(
                    'id', m.id,
                    'code', m.room_name,
                    'title', m.title,
                    'status', m.status,
                    'scheduled_start', m.scheduled_start,
                    'scheduled_end', m.scheduled_end,
                    'is_public', m.is_public,
                    'require_approval', m.require_approval,
                    'encrypted_passcode', m.password
                ) ELSE NULL END AS linked_meeting_raw
            FROM demo_requests dr
            LEFT JOIN users u ON dr.teacher_id = u.id
            LEFT JOIN meetings m ON dr.meeting_id = m.id
            LEFT JOIN LATERAL (
                SELECT * FROM demo_availability_requests dar2
                WHERE dar2.demo_request_id = dr.id
                ORDER BY dar2.created_at DESC
                LIMIT 1
            ) dar ON TRUE
            WHERE dr.id = $1
        `, [id]);

        if (!result) {
            return res.status(404).json({ 
                success: false, 
                message: 'Demo request not found' 
            });
        }

        const { linked_meeting_raw, ...clean } = result;
        let linked_meeting = null;
        if (linked_meeting_raw) {
            const { encrypted_passcode, ...lmSafe } = linked_meeting_raw;
            const pass = encrypted_passcode ? access.openPasscode(encrypted_passcode) : null;
            linked_meeting = {
                ...lmSafe,
                passcode: pass,
                public_link: lmSafe.is_public ? access.publicMeetingUrl(lmSafe.code, pass) : null,
            };
        }

        res.json({
            success: true,
            data: { ...clean, linked_meeting }
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