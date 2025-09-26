const express = require('express');
const router = express.Router();

const { authenticateToken, teacherOrAdmin, authorizeRoles } = require('../middleware/auth');
const teacherOnly = authorizeRoles('teacher');
const studentOnly = authorizeRoles('student');

// GET /api/attendance/reports/teachers - Get teacher performance data (Admin/Teacher)
router.get('/reports/teachers', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batch_id, teacher_id, date_from, date_to, sort_by, sort_order = 'desc', limit = 10, offset = 0 } = req.query;
        const db = req.db;

        // Build WHERE conditions for filtering
        let whereConditions = ['u.role = $1'];
        let params = ['teacher'];
        let paramIndex = 2;

        if (batch_id) {
            whereConditions.push(`b.id = $${paramIndex}`);
            params.push(parseInt(batch_id));
            paramIndex++;
        }
        if (date_from) {
            whereConditions.push(`cs.start_time::date >= $${paramIndex}::date`);
            params.push(date_from);
            paramIndex++;
        }
        if (date_to) {
            whereConditions.push(`cs.start_time::date <= $${paramIndex}::date`);
            params.push(date_to);
            paramIndex++;
        }
        if (teacher_id) {
            whereConditions.push(`b.teacher_id = $${paramIndex}`);
            params.push(parseInt(teacher_id));
            paramIndex++;
        }

        // For teachers, only show sessions from their batches
        if (req.user.role === 'teacher') {
            whereConditions.push(`b.teacher_id = $${paramIndex}`);
            params.push(req.user.id);
            paramIndex++;
        }

        const whereClause = 'WHERE ' + whereConditions.join(' AND ');

        // Determine sort column
        let sortColumn = 'cs.start_time';
        switch (sort_by) {
            case 'batch':
                sortColumn = 'b.name';
                break;
            case 'attendance_rate':
                sortColumn = 'attendance_rate';
                break;
            case 'duration':
                sortColumn = 'duration_minutes';
                break;
            case 'status':
                sortColumn = 'cs.status';
                break;
            default:
                sortColumn = 'cs.start_time';
        }

        // Get teacher performance data with attendance statistics
        const teacherStats = await db.all(`
            SELECT 
                u.id as teacher_id,
                u.first_name || ' ' || u.last_name as teacher_name,
                u.email as teacher_email,
                b.id as batch_id,
                b.name as batch_name,
                
                -- Total sessions scheduled for this teacher-batch combination
                COUNT(DISTINCT s.id) as total_sessions,
                
                -- Sessions that have been conducted (have class_sessions)
                COUNT(DISTINCT cs.id) as sessions_started,
                
                -- Sessions with access codes
                COUNT(DISTINCT CASE WHEN cs.access_code IS NOT NULL THEN cs.id END) as sessions_with_codes,
                
                -- Code generation percentage
                ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT cs.id) > 0 THEN
                            (COUNT(DISTINCT CASE WHEN cs.access_code IS NOT NULL THEN cs.id END) * 100.0 / COUNT(DISTINCT cs.id))
                        ELSE 0 
                    END, 2
                ) as code_generation_percentage
                
            FROM users u
            JOIN batches b ON u.id = b.teacher_id
            LEFT JOIN schedules s ON b.id = s.batch_id AND s.teacher_id = u.id AND s.type = 'class'
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            ${whereClause}
            GROUP BY u.id, u.first_name, u.last_name, u.email, b.id, b.name
            HAVING COUNT(DISTINCT s.id) > 0
            ORDER BY total_sessions DESC
        `, params);

        // Calculate attendance percentage for each teacher separately
        for (let teacher of teacherStats) {
            let attendanceParams = [teacher.teacher_id, teacher.batch_id];
            let attendanceParamIndex = 3;
            let dateConditions = '';
            
            if (date_from) {
                dateConditions += ` AND cs.start_time::date >= $${attendanceParamIndex}::date`;
                attendanceParams.push(date_from);
                attendanceParamIndex++;
            }
            if (date_to) {
                dateConditions += ` AND cs.start_time::date <= $${attendanceParamIndex}::date`;
                attendanceParams.push(date_to);
                attendanceParamIndex++;
            }
            
            const attendanceResult = await db.get(`
                SELECT 
                    ROUND(
                        CASE 
                            WHEN COUNT(a.id) > 0 THEN
                                (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END) * 100.0 / COUNT(a.id))
                            ELSE 0 
                        END, 2
                    ) as attendance_percentage
                FROM attendance a
                JOIN class_sessions cs ON a.session_id = cs.id
                JOIN schedules s ON cs.schedule_id = s.id
                JOIN batches b ON s.batch_id = b.id
                WHERE b.teacher_id = $1 AND b.id = $2
                ${dateConditions}
            `, attendanceParams);
            
            teacher.attendance_percentage = attendanceResult?.attendance_percentage || 0;
        }

        // Sort by total sessions first, then by attendance percentage
        teacherStats.sort((a, b) => {
            if (b.total_sessions !== a.total_sessions) {
                return b.total_sessions - a.total_sessions;
            }
            return (b.attendance_percentage || 0) - (a.attendance_percentage || 0);
        });

        res.json({
            teachers: teacherStats
        });
    } catch (error) {
        console.error('Error fetching teacher performance data:', error);
        res.status(500).json({ error: 'Failed to fetch teacher performance data' });
    }
});

// GET /api/attendance/reports/sessions - Get session summaries (Admin/Teacher)
router.get('/reports/sessions', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batch_id, teacher_id, date_from, date_to } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = `
            SELECT 
                cs.id as session_id,
                s.title as schedule_title,
                b.name as batch_name,
                u.first_name || ' ' || u.last_name as teacher_name,
                cs.start_time::date as session_date,
                cs.start_time::time as start_time,
                cs.end_time::time as end_time,
                COUNT(DISTINCT ub.user_id)::int as total_students,
                COUNT(a.id)::int as attendance_records,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.student_id END)::int as present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.student_id END)::int as late_count,
                GREATEST(COUNT(DISTINCT ub.user_id) - COUNT(DISTINCT CASE WHEN a.status IN ('present','late') THEN a.student_id END), 0)::int as absent_count,
                ROUND(
                    (COUNT(DISTINCT CASE WHEN a.status IN ('present','late') THEN a.student_id END)::numeric * 100) / 
                    NULLIF(COUNT(DISTINCT ub.user_id), 0), 2
                )::float8 as attendance_percentage,
                CASE WHEN cs.access_code IS NOT NULL OR cs.code_generated_at IS NOT NULL THEN true ELSE false END as code_generated,
                CASE WHEN cs.session_started_at IS NOT NULL OR cs.status IN ('started','completed') THEN true ELSE false END as session_started
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN batches b ON s.batch_id = b.id
            JOIN users u ON b.teacher_id = u.id
            LEFT JOIN user_batches ub ON b.id = ub.batch_id
            LEFT JOIN users stu ON ub.user_id = stu.id AND stu.role = 'student'
            LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = stu.id
            WHERE s.type = 'class'
        `;

        const params = [];
        let paramIndex = 1;

        // Role-based filtering
        if (userRole === 'teacher') {
            query += ` AND b.teacher_id = $${paramIndex}`;
            params.push(userId);
            paramIndex++;
        }

        if (batch_id) {
            query += ` AND s.batch_id = $${paramIndex}`;
            params.push(parseInt(batch_id));
            paramIndex++;
        }

        if (teacher_id && userRole === 'admin') {
            query += ` AND b.teacher_id = $${paramIndex}`;
            params.push(parseInt(teacher_id));
            paramIndex++;
        }

        if (date_from) {
            query += ` AND cs.start_time::date >= $${paramIndex}::date`;
            params.push(date_from);
            paramIndex++;
        }

        if (date_to) {
            query += ` AND cs.start_time::date <= $${paramIndex}::date`;
            params.push(date_to);
            paramIndex++;
        }

        query += `
            GROUP BY cs.id, s.title, b.name, u.first_name, u.last_name, cs.start_time, cs.end_time, cs.access_code, cs.code_generated_at, cs.session_started_at, cs.status
            ORDER BY cs.start_time DESC
        `;

        const sessions = await req.db.all(query, params);
        const normalizedSessions = sessions.map(s => ({
            ...s,
            total_students: Number(s.total_students ?? 0),
            attendance_records: Number(s.attendance_records ?? 0),
            present_count: Number(s.present_count ?? 0),
            absent_count: Number(s.absent_count ?? 0),
            late_count: Number(s.late_count ?? 0),
            attendance_percentage: Number(s.attendance_percentage ?? 0),
            code_generated: s.code_generated,
            session_started: s.session_started
        }));
        res.json(normalizedSessions);
    } catch (error) {
        console.error('Failed to get session summary:', error);
        res.status(500).json({ error: 'Failed to get session summary' });
    }
});

// GET /api/attendance/reports/batches - Batch analytics (Admin/Teacher)
router.get('/reports/batches', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { query, batch_id, teacher_id, date_from, date_to, sort_by = 'name', sort_order = 'asc', limit = 50, offset = 0 } = req.query;
        const db = req.db;

        let batchConditions = [];
        let batchParams = [];
        let batchParamIndex = 1;

        if (query) {
            batchConditions.push(`(b.name LIKE $${batchParamIndex})`);
            const searchTerm = `%${query}%`;
            batchParams.push(searchTerm);
            batchParamIndex++;
        }
        if (batch_id) {
            batchConditions.push(`b.id = $${batchParamIndex}`);
            batchParams.push(parseInt(batch_id));
            batchParamIndex++;
        }
        if (date_from) {
            batchConditions.push(`cs.start_time::date >= $${batchParamIndex}::date`);
            batchParams.push(date_from);
            batchParamIndex++;
        }
        if (date_to) {
            batchConditions.push(`cs.start_time::date <= $${batchParamIndex}::date`);
            batchParams.push(date_to);
            batchParamIndex++;
        }
        if (teacher_id) {
            batchConditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${batchParamIndex})`);
            batchParams.push(parseInt(teacher_id));
            batchParamIndex++;
        }
        if (req.user.role === 'teacher') {
            batchConditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${batchParamIndex})`);
            batchParams.push(req.user.id);
            batchParamIndex++;
        }

        const whereClause = batchConditions.length > 0 ? 'WHERE ' + batchConditions.join(' AND ') : '';

        let sortColumn = 'b.name';
        switch (sort_by) {
            case 'avg_attendance_rate':
                sortColumn = 'avg_attendance_rate';
                break;
            case 'total_students':
                sortColumn = 'total_students';
                break;
            case 'total_sessions':
                sortColumn = 'total_sessions';
                break;
            case 'completed_sessions':
                sortColumn = 'completed_sessions';
                break;
            default:
                sortColumn = 'b.name';
        }

        const batches = await db.all(`
            SELECT 
                b.id,
                b.name,
                b.start_date,
                b.end_date,
                CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
                COUNT(DISTINCT ub.user_id)::int as total_students,
                COUNT(DISTINCT s.id)::int as total_sessions,
                COUNT(DISTINCT CASE WHEN s.end_time <= NOW() THEN s.id END)::int as completed_sessions,
                CASE 
                    WHEN COUNT(DISTINCT s.id) > 0 AND COUNT(DISTINCT ub.user_id) > 0 THEN
                        ROUND(
                            (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::numeric * 100.0) / 
                            NULLIF(COUNT(DISTINCT s.id) * COUNT(DISTINCT ub.user_id), 0), 2
                        )
                    ELSE 0 
                END::float8 as avg_attendance_rate
            FROM batches b
            JOIN users t ON b.teacher_id = t.id
            LEFT JOIN user_batches ub ON b.id = ub.batch_id
            LEFT JOIN users u ON ub.user_id = u.id AND u.role = 'student'
            LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
            ${whereClause}
            GROUP BY b.id, b.name, b.start_date, b.end_date, t.first_name, t.last_name
            ORDER BY ${sortColumn} ${String(sort_order || 'asc').toUpperCase()}
            LIMIT $${batchParamIndex} OFFSET $${batchParamIndex + 1}
        `, [...batchParams, parseInt(limit), parseInt(offset)]);

        const normalizedBatches = batches.map(b => ({
            ...b,
            total_students: Number(b.total_students ?? 0),
            total_sessions: Number(b.total_sessions ?? 0),
            completed_sessions: Number(b.completed_sessions ?? 0),
            avg_attendance_rate: Number(b.avg_attendance_rate ?? 0)
        }));

        const summary = {
            total_batches: normalizedBatches.length,
            avg_attendance_rate: normalizedBatches.length > 0 ? Math.round(normalizedBatches.reduce((sum, b) => sum + Number(b.avg_attendance_rate || 0), 0) / normalizedBatches.length * 100) / 100 : 0,
            total_students: normalizedBatches.reduce((sum, b) => sum + Number(b.total_students || 0), 0),
            total_sessions: normalizedBatches.reduce((sum, b) => sum + Number(b.total_sessions || 0), 0),
            completed_sessions: normalizedBatches.reduce((sum, b) => sum + Number(b.completed_sessions || 0), 0)
        };

        res.json({ batches: normalizedBatches, summary });
    } catch (error) {
        console.error('Error fetching batch analytics:', error);
        res.status(500).json({ error: 'Failed to fetch batch analytics' });
    }
});

// GET /api/attendance/reports/students - Student statistics (Admin/Teacher)
router.get('/reports/students', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { query, batch_id, student_id, teacher_id, date_from, date_to, min_attendance_rate, max_attendance_rate, sort_by = 'name', sort_order = 'asc', limit = 50, offset = 0 } = req.query;
        const db = req.db;

        let conditions = ['u.role = $1'];
        let params = ['student'];
        let paramIndex = 2;

        if (batch_id) {
            conditions.push(`b.id = $${paramIndex}`);
            params.push(parseInt(batch_id));
            paramIndex++;
        }
        if (date_from) {
            conditions.push(`cs.start_time::date >= $${paramIndex}::date`);
            params.push(date_from);
            paramIndex++;
        }
        if (date_to) {
            conditions.push(`cs.start_time::date <= $${paramIndex}::date`);
            params.push(date_to);
            paramIndex++;
        }
        if (student_id) {
            conditions.push(`u.id = $${paramIndex}`);
            params.push(parseInt(student_id));
            paramIndex++;
        }
        if (teacher_id) {
            conditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${paramIndex})`);
            params.push(parseInt(teacher_id));
            paramIndex++;
        }
        if (req.user.role === 'teacher') {
            conditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${paramIndex})`);
            params.push(req.user.id);
            paramIndex++;
        }
        if (query) {
            conditions.push(`(u.first_name LIKE $${paramIndex} OR u.last_name LIKE $${paramIndex + 1} OR u.email LIKE $${paramIndex + 2})`);
            const term = `%${query}%`;
            params.push(term, term, term);
            paramIndex += 3;
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        let sortColumn = 'u.first_name';
        switch (sort_by) {
            case 'attendance_rate':
                sortColumn = 'attendance_rate';
                break;
            case 'last_attendance_date':
                sortColumn = 'last_attendance_date';
                break;
            case 'total_sessions':
                sortColumn = 'total_sessions';
                break;
            default:
                sortColumn = 'u.first_name';
        }

        const studentsRaw = await db.all(`
            SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                b.id as batch_id,
                b.name as batch_name,
                COUNT(DISTINCT cs.id)::int as total_sessions,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END)::int as present_count,
                ROUND(
                    (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::numeric * 100 / 
                     NULLIF(COUNT(a.id), 0)), 2
                )::float8 as attendance_rate,
                MAX(cs.start_time::date) as last_attendance_date
            FROM users u
            JOIN user_batches ub ON u.id = ub.user_id
            JOIN batches b ON ub.batch_id = b.id
            LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
            ${whereClause}
            GROUP BY u.id, u.first_name, u.last_name, u.email, b.id, b.name
            ORDER BY ${sortColumn} ${String(sort_order || 'asc').toUpperCase()}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `, [...params, parseInt(limit), parseInt(offset)]);

        let students = studentsRaw.map(s => ({
            ...s,
            total_sessions: Number(s.total_sessions ?? 0),
            present_count: Number(s.present_count ?? 0),
            attendance_rate: Number(s.attendance_rate ?? 0)
        }));
        if (min_attendance_rate !== undefined) {
            students = students.filter(s => (s.attendance_rate || 0) >= parseFloat(min_attendance_rate));
        }
        if (max_attendance_rate !== undefined) {
            students = students.filter(s => (s.attendance_rate || 0) <= parseFloat(max_attendance_rate));
        }

        const summary = {
            total_students: students.length,
            avg_attendance_rate: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + Number(s.attendance_rate || 0), 0) / students.length * 100) / 100 : 0,
            total_sessions: students.reduce((sum, s) => sum + Number(s.total_sessions || 0), 0),
            present_count: students.reduce((sum, s) => sum + Number(s.present_count || 0), 0)
        };

        res.json({ students, summary });
    } catch (error) {
        console.error('Error fetching student statistics:', error);
        res.status(500).json({ error: 'Failed to fetch student statistics' });
    }
});

// GET /api/attendance/sessions - Get session management data (Admin/Teacher)
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const { batch_id, schedule_id, date, date_from, date_to, status, sort_by = 'date', sort_order = 'desc' } = req.query;
        const db = req.db;

        // Build WHERE conditions for filtering
        let whereConditions = [];
        let params = [];
        let paramIndex = 1;

        if (batch_id) {
            whereConditions.push(`b.id = $${paramIndex}`);
            params.push(parseInt(batch_id));
            paramIndex++;
        }
        if (schedule_id) {
            whereConditions.push(`s.id = $${paramIndex}`);
            params.push(parseInt(schedule_id));
            paramIndex++;
        }
        if (date) {
            // For date filtering, check both session_date and start_time date
            whereConditions.push(`(cs.session_date = $${paramIndex}::date OR DATE(cs.start_time) = $${paramIndex + 1}::date)`);
            params.push(date);
            params.push(date);
            paramIndex += 2;
        }
        if (date_from) {
            whereConditions.push(`cs.start_time::date >= $${paramIndex}::date`);
            params.push(date_from);
            paramIndex++;
        }
        if (date_to) {
            whereConditions.push(`cs.start_time::date <= $${paramIndex}::date`);
            params.push(date_to);
            paramIndex++;
        }
        if (status) {
            whereConditions.push(`cs.status = $${paramIndex}`);
            params.push(status);
            paramIndex++;
        }

        // For teachers, only show sessions from their batches
        if (req.user.role === 'teacher') {
            whereConditions.push(`b.teacher_id = $${paramIndex}`);
            params.push(req.user.id);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Determine sort column
        let sortColumn = 'cs.start_time';
        switch (sort_by) {
            case 'batch':
                sortColumn = 'b.name';
                break;
            case 'attendance_rate':
                sortColumn = 'attendance_rate';
                break;
            case 'duration':
                sortColumn = 'duration_minutes';
                break;
            case 'status':
                sortColumn = 'cs.status';
                break;
            default:
                sortColumn = 'cs.start_time';
        }

        // Get session data with attendance statistics
        const sessions = await db.all(`
            SELECT 
                cs.id,
                cs.schedule_id,
                cs.start_time,
                cs.end_time,
                cs.status,
                cs.access_code,
                cs.code_expires_at,
                NULL as session_notes,
                s.subject,
                s.topic,
                s.description,
                b.id as batch_id,
                b.name as batch_name,
                u.first_name || ' ' || u.last_name as teacher_name,
                u.email as teacher_email,
                -- Calculate session duration
                CASE 
                    WHEN cs.end_time IS NOT NULL THEN 
                        ROUND(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) / 60)
                    ELSE 
                        ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cs.start_time)) / 60)
                END as duration_minutes,
                -- Count total enrolled students
                (SELECT COUNT(*) FROM batch_students bs2 
                 JOIN users u2 ON bs2.student_id = u2.id 
                 WHERE bs2.batch_id = b.id AND u2.role = 'student') as total_students,
                -- Count attendance records
                COUNT(a.id) as attendance_records,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
                -- Calculate attendance rate
                ROUND(
                    (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                     NULLIF((SELECT COUNT(*) FROM batch_students bs2 
                             JOIN users u2 ON bs2.student_id = u2.id 
                             WHERE bs2.batch_id = b.id AND u2.role = 'student'), 0)), 2
                ) as attendance_rate
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN batches b ON s.batch_id = b.id
            JOIN users u ON s.teacher_id = u.id
            LEFT JOIN attendance a ON cs.id = a.session_id
            ${whereClause}
            GROUP BY cs.id, cs.schedule_id, cs.start_time, cs.end_time, cs.status, cs.access_code, cs.code_expires_at,
                     s.subject, s.topic, s.description, b.id, b.name, u.first_name, u.last_name, u.email
            ORDER BY ${sortColumn} ${sort_order.toUpperCase()}
        `, params);

        // Get detailed attendance for each session
        const sessionIds = sessions.map(s => s.id);
        let attendanceDetails = [];
        
        if (sessionIds.length > 0) {
            const placeholders = sessionIds.map((_, index) => `$${index + 1}`).join(',');
            attendanceDetails = await db.all(`
                SELECT 
                    a.session_id,
                    a.student_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    a.status,
                    a.check_in_time,
                    a.notes
                FROM attendance a
                JOIN users u ON a.student_id = u.id
                WHERE a.session_id IN (${placeholders})
                ORDER BY a.session_id, u.last_name, u.first_name
            `, sessionIds);
        }

        // Group attendance details by session
        const attendanceGrouped = {};
        attendanceDetails.forEach(record => {
            if (!attendanceGrouped[record.session_id]) {
                attendanceGrouped[record.session_id] = [];
            }
            attendanceGrouped[record.session_id].push({
                student_id: record.student_id,
                student_name: `${record.first_name} ${record.last_name}`,
                email: record.email,
                status: record.status,
                check_in_time: record.check_in_time,
                notes: record.notes
            });
        });

        // Enrich sessions with attendance details
        const enrichedSessions = sessions.map(session => ({
            ...session,
            attendance_details: attendanceGrouped[session.id] || [],
            session_metrics: {
                completion_rate: session.status === 'completed' ? 100 : 
                                session.status === 'in_progress' ? 50 : 0,
                engagement_score: session.attendance_rate >= 90 ? 'high' : 
                                 session.attendance_rate >= 70 ? 'medium' : 'low',
                punctuality_rate: session.attendance_records > 0 ? 
                    Math.round((session.present_count + session.late_count) * 100 / session.attendance_records) : 0
            }
        }));

        // Calculate summary statistics
        const summary = {
            total_sessions: enrichedSessions.length,
            completed_sessions: enrichedSessions.filter(s => s.status === 'completed').length,
            in_progress_sessions: enrichedSessions.filter(s => s.status === 'in_progress').length,
            scheduled_sessions: enrichedSessions.filter(s => s.status === 'scheduled').length,
            avg_attendance_rate: enrichedSessions.length > 0 ? 
                Math.round(enrichedSessions.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / enrichedSessions.length * 100) / 100 : 0,
            avg_duration: enrichedSessions.length > 0 ? 
                Math.round(enrichedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / enrichedSessions.length) : 0,
            total_students_taught: [...new Set(attendanceDetails.map(a => a.student_id))].length
        };

        res.json({
            sessions: enrichedSessions,
            summary
        });
    } catch (error) {
        console.error('Error fetching session management data:', error);
        res.status(500).json({ error: 'Failed to fetch session management data' });
    }
});

// Get class session for a specific schedule and date
router.get('/sessions/check/:scheduleId', authenticateToken, teacherOnly, async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { date } = req.query;
        const teacherId = req.user.id;
        const db = req.db;

        // Use today's date if not provided
        const sessionDate = date || new Date().toISOString().split('T')[0];

        // Check if there's an existing class session for this schedule and date
        const existingSession = await db.get(`
            SELECT 
                cs.id,
                cs.schedule_id,
                cs.access_code,
                cs.code_expires_at,
                cs.status,
                cs.session_date,
                s.title,
                s.location_mode,
                s.link,
                b.teacher_id
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN batches b ON s.batch_id = b.id
            WHERE cs.schedule_id = $1 
            AND cs.session_date = $2::date
            AND b.teacher_id = $3
            AND cs.access_code IS NOT NULL
        `, [parseInt(scheduleId), sessionDate, teacherId]);

        if (existingSession) {
            res.json({
                exists: true,
                session: existingSession
            });
        } else {
            res.json({
                exists: false,
                session: null
            });
        }
    } catch (error) {
        console.error('Error checking class session:', error);
        res.status(500).json({ error: 'Failed to check class session' });
    }
});

router.post('/sessions/:scheduleId/start', authenticateToken, teacherOnly, async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { sessionDate } = req.body;
        const teacherId = req.user.id;

        const AttendanceService = require('../services/attendanceService');
        const attendanceService = new AttendanceService(req.db);

        const result = await attendanceService.startClassSession(
            parseInt(scheduleId), 
            teacherId, 
            sessionDate
        );

        // Send access code emails to all students in the batch
        try {
            await attendanceService.sendAccessCodeToStudents(
                result.sessionId,
                result.accessCode,
                result.schedule,
                result.expiresAt
            );
        } catch (emailErr) {
            console.warn('Warning: Failed to send access code emails:', emailErr.message);
        }

        res.json({
            success: true,
            sessionId: result.sessionId,
            expiresAt: result.expiresAt,
            message: 'Class session started successfully'
        });
    } catch (error) {
        console.error('Error starting class session:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to start class session'
        });
    }
});

router.post('/sessions/:sessionId/join', authenticateToken, studentOnly, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { accessCode } = req.body;
        const studentId = req.user.id;
        const db = req.db;
        const now = new Date();

        if (!accessCode) {
            return res.status(400).json({ error: 'Access code is required' });
        }

        // Get session details and verify access code
        const session = await db.get(`
            SELECT 
                cs.id,
                cs.schedule_id,
                cs.batch_id,
                cs.access_code,
                cs.code_expires_at,
                cs.status,
                cs.start_time,
                cs.end_time,
                s.title as schedule_title
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            WHERE cs.id = $1
        `, [parseInt(sessionId)]);

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Verify access code
        if (session.access_code !== accessCode.trim().toUpperCase()) {
            return res.status(400).json({ error: 'Invalid access code' });
        }

        // Check if code has expired
        if (new Date(session.code_expires_at) < now) {
            return res.status(400).json({ error: 'Access code has expired' });
        }

        // Check if session is active
        if (session.status !== 'started' && session.status !== 'in_progress') {
            return res.status(400).json({ error: 'Session is not active' });
        }

        // Check if student is enrolled in the batch
        const enrollment = await db.get(`
            SELECT id FROM user_batches 
            WHERE user_id = $1 AND batch_id = $2
        `, [studentId, session.batch_id]);

        if (!enrollment) {
            return res.status(403).json({ error: 'You are not enrolled in this batch' });
        }

        // Check if student has already joined this session
        const existingAttendance = await db.get(`
            SELECT id, status FROM attendance 
            WHERE session_id = $1 AND student_id = $2
        `, [parseInt(sessionId), studentId]);

        if (existingAttendance) {
            return res.json({ 
                message: 'Already joined this session',
                status: existingAttendance.status,
                alreadyJoined: true
            });
        }

        // Determine attendance status based on timing
        const sessionStart = new Date(session.start_time);
        const lateThreshold = new Date(sessionStart.getTime() + 10 * 60 * 1000); // 10 minutes after start
        const attendanceStatus = now <= lateThreshold ? 'present' : 'late';

        // Record attendance
        await db.run(`
            INSERT INTO attendance (session_id, student_id, status, check_in_time, notes)
            VALUES ($1, $2, $3, $4, $5)
        `, [parseInt(sessionId), studentId, attendanceStatus, now.toISOString(), `Joined via access code: ${accessCode}`]);

        res.json({
            message: `Successfully joined ${session.schedule_title}`,
            status: attendanceStatus,
            sessionId: sessionId,
            checkInTime: now.toISOString()
        });

    } catch (error) {
        console.error('Error joining session:', error);
        res.status(500).json({ error: 'Failed to join session' });
    }
});

// GET /api/attendance/search - Advanced search and filtering across all attendance data (Admin/Teacher)
router.get('/search', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { 
            query, 
            type = 'all', // 'students', 'sessions', 'batches', 'teachers', 'all'
            batch_id, 
            teacher_id, 
            student_id,
            date_from, 
            date_to,
            status,
            attendance_status,
            min_attendance_rate,
            max_attendance_rate,
            sort_by = 'relevance',
            sort_order = 'desc',
            limit = 50,
            offset = 0
        } = req.query;
        
        const db = req.db;
        const results = {};

        // Build common WHERE conditions
        const buildCommonConditions = (additionalConditions = [], startParamIndex = 1) => {
            let conditions = [...additionalConditions];
            let params = [];
            let paramIndex = startParamIndex;

            if (batch_id) {
                conditions.push(`b.id = $${paramIndex++}`);
                params.push(parseInt(batch_id));
            }
            if (date_from) {
                conditions.push(`cs.start_time::date >= $${paramIndex++}::date`);
                params.push(date_from);
            }
            if (date_to) {
                conditions.push(`cs.start_time::date <= $${paramIndex++}::date`);
                params.push(date_to);
            }
            if (req.user.role === 'teacher') {
                conditions.push(`b.teacher_id = $${paramIndex++}`);
                params.push(req.user.id);
            }

            return { conditions, params, nextParamIndex: paramIndex };
        };

        // Search Students
        if (type === 'students' || type === 'all') {
            const { conditions, params, nextParamIndex } = buildCommonConditions(['u.role = $1'], 2);
            let studentParams = ['student', ...params];
            let studentConditions = [...conditions];
            let paramIndex = nextParamIndex;

            if (query) {
                studentConditions.push(`(u.first_name LIKE $${paramIndex} OR u.last_name LIKE $${paramIndex + 1} OR u.email LIKE $${paramIndex + 2})`);
                const searchTerm = `%${query}%`;
                studentParams.push(searchTerm, searchTerm, searchTerm);
                paramIndex += 3;
            }
            if (student_id) {
                studentConditions.push(`u.id = $${paramIndex++}`);
                studentParams.push(parseInt(student_id));
            }
            if (min_attendance_rate || max_attendance_rate) {
                // Will be filtered after calculation
            }

            const studentResults = await db.all(`
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    b.id as batch_id,
                    b.name as batch_name,
                    COUNT(DISTINCT cs.id) as total_sessions,
                    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                    ROUND(
                        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(a.id), 0)), 2
                    ) as attendance_rate,
                    MAX(cs.start_time::date) as last_attendance_date,
                    'student' as result_type
                FROM users u
                JOIN user_batches ub ON u.id = ub.user_id
                JOIN batches b ON ub.batch_id = b.id
                LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
                LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
                LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
                ${studentConditions.length > 0 ? 'WHERE ' + studentConditions.join(' AND ') : ''}
                GROUP BY u.id, u.first_name, u.last_name, u.email, b.id, b.name
                ORDER BY u.first_name, u.last_name
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `, [...studentParams, parseInt(limit), parseInt(offset)]);

            // Filter by attendance rate if specified
            let filteredStudents = studentResults;
            if (min_attendance_rate) {
                filteredStudents = filteredStudents.filter(s => (s.attendance_rate || 0) >= parseFloat(min_attendance_rate));
            }
            if (max_attendance_rate) {
                filteredStudents = filteredStudents.filter(s => (s.attendance_rate || 0) <= parseFloat(max_attendance_rate));
            }

            results.students = filteredStudents;
        }

        // Search Sessions
        if (type === 'sessions' || type === 'all') {
            const { conditions, params, nextParamIndex } = buildCommonConditions();
            let sessionParams = [...params];
            let sessionConditions = [...conditions];
            let paramIndex = nextParamIndex;

            if (query) {
                sessionConditions.push(`(s.subject LIKE $${paramIndex} OR s.topic LIKE $${paramIndex + 1} OR s.description LIKE $${paramIndex + 2} OR b.name LIKE $${paramIndex + 3})`);
                const searchTerm = `%${query}%`;
                sessionParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
                paramIndex += 4;
            }
            if (status) {
                sessionConditions.push(`cs.status = $${paramIndex++}`);
                sessionParams.push(status);
            }
            if (teacher_id) {
                sessionConditions.push(`b.teacher_id = $${paramIndex++}`);
                sessionParams.push(parseInt(teacher_id));
            }

            const sessionResults = await db.all(`
                SELECT 
                    cs.id,
                    cs.start_time,
                    cs.end_time,
                    cs.status,
                    s.subject,
                    s.topic,
                    s.description,
                    b.id as batch_id,
                    b.name as batch_name,
                    u.first_name || ' ' || u.last_name as teacher_name,
                    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                    COUNT(a.id) as total_attendance_records,
                    ROUND(
                        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                         NULLIF(COUNT(a.id), 0)), 2
                    ) as attendance_rate,
                    'session' as result_type
                FROM class_sessions cs
                JOIN schedules s ON cs.schedule_id = s.id
                JOIN batches b ON s.batch_id = b.id
                JOIN users u ON b.teacher_id = u.id
                LEFT JOIN attendance a ON cs.id = a.session_id
                ${sessionConditions.length > 0 ? 'WHERE ' + sessionConditions.join(' AND ') : ''}
                GROUP BY cs.id, cs.start_time, cs.end_time, cs.status, s.subject, s.topic, s.description, 
                         b.id, b.name, u.first_name, u.last_name
                ORDER BY cs.start_time DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `, [...sessionParams, parseInt(limit), parseInt(offset)]);

            results.sessions = sessionResults;
        }

        // Search Batches
        if (type === 'batches' || type === 'all') {
            let batchConditions = [];
            let batchParams = [];
            let paramIndex = 1;

            if (query) {
                batchConditions.push(`(b.name LIKE $${paramIndex} OR b.description LIKE $${paramIndex + 1})`);
                const searchTerm = `%${query}%`;
                batchParams.push(searchTerm, searchTerm);
                paramIndex += 2;
            }
            if (batch_id) {
                batchConditions.push(`b.id = $${paramIndex++}`);
                batchParams.push(parseInt(batch_id));
            }
            if (teacher_id) {
                batchConditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${paramIndex++})`);
                batchParams.push(parseInt(teacher_id));
            }
            if (req.user.role === 'teacher') {
                batchConditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${paramIndex++})`);
                batchParams.push(req.user.id);
            }

            const batchResults = await db.all(`
                SELECT 
                    b.id,
                    b.name,
                    b.description,
                    b.start_date,
                    b.end_date,
                    COUNT(DISTINCT ub.user_id) as total_students,
                    COUNT(DISTINCT cs.id) as total_sessions,
                    COUNT(DISTINCT CASE WHEN cs.status = 'completed' THEN cs.id END) as completed_sessions,
                    ROUND(AVG(
                        CASE WHEN session_stats.total_enrolled > 0 THEN
                            (session_stats.present_count * 100.0 / session_stats.total_enrolled)
                        ELSE 0 END
                    ), 2) as avg_attendance_rate,
                    'batch' as result_type
                FROM batches b
                LEFT JOIN user_batches ub ON b.id = ub.batch_id
                LEFT JOIN users u ON ub.user_id = u.id AND u.role = 'student'
                LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
                LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
                LEFT JOIN (
                    SELECT 
                        cs2.id as session_id,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        COUNT(DISTINCT ub2.user_id) as total_enrolled
                    FROM class_sessions cs2
                    JOIN schedules s2 ON cs2.schedule_id = s2.id
                    JOIN user_batches ub2 ON s2.batch_id = ub2.batch_id
                    JOIN users u2 ON ub2.user_id = u2.id AND u2.role = 'student'
                    LEFT JOIN attendance a ON cs2.id = a.session_id AND a.student_id = u2.id
                    GROUP BY cs2.id
                ) session_stats ON cs.id = session_stats.session_id
                ${batchConditions.length > 0 ? 'WHERE ' + batchConditions.join(' AND ') : ''}
                GROUP BY b.id, b.name, b.description, b.start_date, b.end_date
                ORDER BY b.name
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `, [...batchParams, parseInt(limit), parseInt(offset)]);

            results.batches = batchResults;
        }

        // Search Teachers (Admin only)
        if ((type === 'teachers' || type === 'all') && req.user.role === 'admin') {
            let teacherConditions = ['u.role = $1'];
            let teacherParams = ['teacher'];
            let paramIndex = 2;

            if (query) {
                teacherConditions.push(`(u.first_name LIKE $${paramIndex} OR u.last_name LIKE $${paramIndex + 1} OR u.email LIKE $${paramIndex + 2})`);
                const searchTerm = `%${query}%`;
                teacherParams.push(searchTerm, searchTerm, searchTerm);
                paramIndex += 3;
            }
            if (teacher_id) {
                teacherConditions.push(`u.id = $${paramIndex++}`);
                teacherParams.push(parseInt(teacher_id));
            }

            const teacherResults = await db.all(`
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    COUNT(DISTINCT b.id) as batches_taught,
                    COUNT(DISTINCT cs.id) as total_sessions,
                    COUNT(DISTINCT CASE WHEN cs.status = 'completed' THEN cs.id END) as completed_sessions,
                    ROUND(AVG(
                        CASE WHEN session_stats.total_enrolled > 0 THEN
                            (session_stats.present_count * 100.0 / session_stats.total_enrolled)
                        ELSE 0 END
                    ), 2) as avg_attendance_rate,
                    'teacher' as result_type
                FROM users u
                LEFT JOIN schedules s ON u.id = s.teacher_id AND s.type = 'class'
                LEFT JOIN batches b ON s.batch_id = b.id
                LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
                LEFT JOIN (
                    SELECT 
                        cs2.id as session_id,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        COUNT(DISTINCT ub2.user_id) as total_enrolled
                    FROM class_sessions cs2
                    JOIN schedules s2 ON cs2.schedule_id = s2.id
                    JOIN user_batches ub2 ON s2.batch_id = ub2.batch_id
                    JOIN users u2 ON ub2.user_id = u2.id AND u2.role = 'student'
                    LEFT JOIN attendance a ON cs2.id = a.session_id AND a.student_id = u2.id
                    GROUP BY cs2.id
                ) session_stats ON cs.id = session_stats.session_id
                WHERE ${teacherConditions.join(' AND ')}
                GROUP BY u.id, u.first_name, u.last_name, u.email
                ORDER BY u.first_name, u.last_name
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `, [...teacherParams, parseInt(limit), parseInt(offset)]);

            results.teachers = teacherResults;
        }

        // Calculate total counts for pagination
        const totalCounts = {};
        for (const [key, value] of Object.entries(results)) {
            totalCounts[key] = value.length;
        }

        // Combine all results if type is 'all'
        if (type === 'all') {
            const allResults = [];
            Object.values(results).forEach(resultArray => {
                allResults.push(...resultArray);
            });

            // Sort combined results
            if (sort_by === 'relevance' && query) {
                // Simple relevance scoring based on query match
                allResults.sort((a, b) => {
                    const aScore = calculateRelevanceScore(a, query);
                    const bScore = calculateRelevanceScore(b, query);
                    return sort_order === 'desc' ? bScore - aScore : aScore - bScore;
                });
            } else if (sort_by === 'date') {
                allResults.sort((a, b) => {
                    const aDate = new Date(a.start_time || a.last_attendance_date || a.start_date || 0);
                    const bDate = new Date(b.start_time || b.last_attendance_date || b.start_date || 0);
                    return sort_order === 'desc' ? bDate - aDate : aDate - bDate;
                });
            }

            results.all = allResults.slice(offset, offset + limit);
        }

        res.json({
            results,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                total_counts: totalCounts
            },
            search_params: {
                query,
                type,
                filters_applied: {
                    batch_id: !!batch_id,
                    teacher_id: !!teacher_id,
                    student_id: !!student_id,
                    date_range: !!(date_from || date_to),
                    status: !!status,
                    attendance_rate_range: !!(min_attendance_rate || max_attendance_rate)
                }
            }
        });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

// Helper function to calculate relevance score
function calculateRelevanceScore(item, query) {
    if (!query) return 0;
    
    const searchFields = [
        item.first_name, item.last_name, item.email, item.name, 
        item.subject, item.topic, item.description, item.batch_name
    ].filter(Boolean);
    
    let score = 0;
    const queryLower = query.toLowerCase();
    
    searchFields.forEach(field => {
        const fieldLower = field.toLowerCase();
        if (fieldLower.includes(queryLower)) {
            // Exact match gets higher score
            if (fieldLower === queryLower) score += 10;
            // Starts with query gets medium score
            else if (fieldLower.startsWith(queryLower)) score += 5;
            // Contains query gets lower score
            else score += 1;
        }
    });
    
    return score;
}

// GET /api/attendance/analytics/trends - Time-based analytics and trends (Admin/Teacher)
router.get('/analytics/trends', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { 
            date_from, 
            date_to, 
            batch_id, 
            teacher_id,
            granularity = 'daily', // 'daily', 'weekly', 'monthly'
            metric = 'attendance_rate' // 'attendance_rate', 'session_count', 'student_count'
        } = req.query;
        
        const db = req.db;
        
        // Build WHERE conditions
        let conditions = [];
        let params = [];
        let paramIndex = 1;
        
        if (date_from) {
            conditions.push(`cs.start_time::date >= $${paramIndex++}::date`);
            params.push(date_from);
        }
        if (date_to) {
            conditions.push(`cs.start_time::date <= $${paramIndex++}::date`);
            params.push(date_to);
        }
        if (batch_id) {
            conditions.push(`b.id = $${paramIndex++}`);
            params.push(parseInt(batch_id));
        }
        if (teacher_id) {
            conditions.push(`s.teacher_id = $${paramIndex++}`);
            params.push(parseInt(teacher_id));
        }
        if (req.user.role === 'teacher') {
            conditions.push(`s.teacher_id = $${paramIndex++}`);
            params.push(req.user.id);
        }

        // Determine date grouping based on granularity
        let dateGroup;
        switch (granularity) {
            case 'weekly':
                dateGroup = "TO_CHAR(cs.start_time, 'YYYY-\"W\"IW')";
                break;
            case 'monthly':
                dateGroup = "TO_CHAR(cs.start_time, 'YYYY-MM')";
                break;
            default: // daily
                dateGroup = "cs.start_time::date";
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        // Get trend data
        const trendData = await db.all(`
            SELECT 
                ${dateGroup} as period,
                cs.start_time::date as date,
                COUNT(DISTINCT cs.id) as session_count,
                COUNT(DISTINCT a.student_id) as unique_students,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                COUNT(a.id) as total_attendance_records,
                ROUND(
                    (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                     NULLIF(COUNT(a.id), 0)), 2
                ) as attendance_rate,
                AVG(
                    CASE WHEN session_stats.total_enrolled > 0 THEN
                        (session_stats.present_count * 100.0 / session_stats.total_enrolled)
                    ELSE 0 END
                ) as avg_session_attendance_rate
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN batches b ON s.batch_id = b.id
            LEFT JOIN attendance a ON cs.id = a.session_id
            LEFT JOIN (
                SELECT 
                    cs2.id as session_id,
                    COUNT(CASE WHEN a2.status = 'present' THEN 1 END) as present_count,
                    COUNT(DISTINCT ub.user_id) as total_enrolled
                FROM class_sessions cs2
                JOIN schedules s2 ON cs2.schedule_id = s2.id
                JOIN user_batches ub ON s2.batch_id = ub.batch_id
                JOIN users u ON ub.user_id = u.id AND u.role = 'student'
                LEFT JOIN attendance a2 ON cs2.id = a2.session_id AND a2.student_id = u.id
                GROUP BY cs2.id
            ) session_stats ON cs.id = session_stats.session_id
            ${whereClause}
            GROUP BY ${dateGroup}
            ORDER BY period
        `, params);

        // Calculate period-over-period changes
        const trendsWithChanges = trendData.map((current, index) => {
            const previous = index > 0 ? trendData[index - 1] : null;
            let change = null;
            
            if (previous && metric === 'attendance_rate') {
                change = {
                    value: current.attendance_rate - previous.attendance_rate,
                    percentage: previous.attendance_rate > 0 ? 
                        ((current.attendance_rate - previous.attendance_rate) / previous.attendance_rate * 100) : 0
                };
            } else if (previous && metric === 'session_count') {
                change = {
                    value: current.session_count - previous.session_count,
                    percentage: previous.session_count > 0 ? 
                        ((current.session_count - previous.session_count) / previous.session_count * 100) : 0
                };
            } else if (previous && metric === 'student_count') {
                change = {
                    value: current.unique_students - previous.unique_students,
                    percentage: previous.unique_students > 0 ? 
                        ((current.unique_students - previous.unique_students) / previous.unique_students * 100) : 0
                };
            }

            return {
                ...current,
                change: change ? {
                    value: Math.round(change.value * 100) / 100,
                    percentage: Math.round(change.percentage * 100) / 100,
                    trend: change.value > 0 ? 'up' : change.value < 0 ? 'down' : 'stable'
                } : null
            };
        });

        // Calculate summary statistics
        const summary = {
            total_periods: trendData.length,
            avg_attendance_rate: Math.round(
                (trendData.reduce((sum, item) => sum + (item.attendance_rate || 0), 0) / trendData.length) * 100
            ) / 100,
            total_sessions: trendData.reduce((sum, item) => sum + item.session_count, 0),
            total_unique_students: Math.max(...trendData.map(item => item.unique_students), 0),
            best_period: trendData.reduce((best, current) => 
                (current.attendance_rate || 0) > (best.attendance_rate || 0) ? current : best, 
                trendData[0] || {}
            ),
            worst_period: trendData.reduce((worst, current) => 
                (current.attendance_rate || 0) < (worst.attendance_rate || 0) ? current : worst, 
                trendData[0] || {}
            )
        };

        res.json({
            trends: trendsWithChanges,
            summary,
            parameters: {
                date_from,
                date_to,
                batch_id,
                teacher_id,
                granularity,
                metric
            }
        });
    } catch (error) {
        console.error('Error getting attendance trends:', error);
        res.status(500).json({ error: 'Failed to get attendance trends' });
    }
});

// GET /api/attendance/analytics/comparison - Compare periods or entities (Admin/Teacher)
router.get('/analytics/comparison', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { 
            compare_type = 'periods', // 'periods', 'batches', 'teachers'
            period1_from, 
            period1_to,
            period2_from, 
            period2_to,
            batch_ids, // comma-separated for batch comparison
            teacher_ids, // comma-separated for teacher comparison
            metrics = 'attendance_rate,session_count' // comma-separated metrics
        } = req.query;
        
        const db = req.db;
        const requestedMetrics = metrics.split(',');
        
        let comparisonData = {};

        if (compare_type === 'periods' && period1_from && period1_to && period2_from && period2_to) {
            // Compare two time periods
            const periods = [
                { name: 'Period 1', from: period1_from, to: period1_to },
                { name: 'Period 2', from: period2_from, to: period2_to }
            ];

            for (const period of periods) {
                let conditions = ['cs.start_time::date >= $1::date', 'cs.start_time::date <= $2::date'];
                let params = [period.from, period.to];
                let paramIndex = 3;

                if (req.user.role === 'teacher') {
                    conditions.push(`b.teacher_id = $${paramIndex++}`);
                    params.push(req.user.id);
                }

                const periodData = await db.get(`
                    SELECT 
                        COUNT(DISTINCT cs.id) as session_count,
                        COUNT(DISTINCT a.student_id) as unique_students,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        COUNT(a.id) as total_attendance_records,
                        ROUND(
                            (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                             NULLIF(COUNT(a.id), 0)), 2
                        ) as attendance_rate,
                        COUNT(DISTINCT b.id) as batches_count,
                        COUNT(DISTINCT b.teacher_id) as teachers_count
                    FROM class_sessions cs
                    JOIN schedules s ON cs.schedule_id = s.id
                    JOIN batches b ON s.batch_id = b.id
                    LEFT JOIN attendance a ON cs.id = a.session_id
                    WHERE ${conditions.join(' AND ')}
                `, params);

                comparisonData[period.name.toLowerCase().replace(' ', '_')] = periodData;
            }

            // Calculate differences
            const period1 = comparisonData.period_1;
            const period2 = comparisonData.period_2;
            
            comparisonData.differences = {
                attendance_rate: {
                    absolute: Math.round((period2.attendance_rate - period1.attendance_rate) * 100) / 100,
                    percentage: period1.attendance_rate > 0 ? 
                        Math.round(((period2.attendance_rate - period1.attendance_rate) / period1.attendance_rate * 100) * 100) / 100 : 0
                },
                session_count: {
                    absolute: period2.session_count - period1.session_count,
                    percentage: period1.session_count > 0 ? 
                        Math.round(((period2.session_count - period1.session_count) / period1.session_count * 100) * 100) / 100 : 0
                },
                unique_students: {
                    absolute: period2.unique_students - period1.unique_students,
                    percentage: period1.unique_students > 0 ? 
                        Math.round(((period2.unique_students - period1.unique_students) / period1.unique_students * 100) * 100) / 100 : 0
                }
            };

        } else if (compare_type === 'batches' && batch_ids) {
            // Compare multiple batches
            const batchIdList = batch_ids.split(',').map(id => parseInt(id.trim()));
            
            for (const batchId of batchIdList) {
                let conditions = ['b.id = $1'];
                let params = [parseInt(batchId)];
                let paramIndex = 2;

                if (req.user.role === 'teacher') {
                    conditions.push(`b.teacher_id = $${paramIndex++}`);
                    params.push(req.user.id);
                }

                const batchData = await db.get(`
                    SELECT 
                        b.name as batch_name,
                        COUNT(DISTINCT cs.id) as session_count,
                        COUNT(DISTINCT a.student_id) as unique_students,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        COUNT(a.id) as total_attendance_records,
                        ROUND(
                            (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                             NULLIF(COUNT(a.id), 0)), 2
                        ) as attendance_rate
                    FROM batches b
                    LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
                    LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
                    LEFT JOIN attendance a ON cs.id = a.session_id
                    WHERE ${conditions.join(' AND ')}
                    GROUP BY b.id, b.name
                `, params);

                if (batchData) {
                    comparisonData[`batch_${batchId}`] = batchData;
                }
            }

        } else if (compare_type === 'teachers' && teacher_ids && req.user.role === 'admin') {
            // Compare multiple teachers (Admin only)
            const teacherIdList = teacher_ids.split(',').map(id => parseInt(id.trim()));
            
            for (const teacherId of teacherIdList) {
                const teacherData = await db.get(`
                    SELECT 
                        u.first_name || ' ' || u.last_name as teacher_name,
                        COUNT(DISTINCT cs.id) as session_count,
                        COUNT(DISTINCT a.student_id) as unique_students,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        COUNT(a.id) as total_attendance_records,
                        ROUND(
                            (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                             NULLIF(COUNT(a.id), 0)), 2
                        ) as attendance_rate,
                        COUNT(DISTINCT b.id) as batches_taught
                    FROM users u
                    LEFT JOIN schedules s ON u.id = s.teacher_id AND s.type = 'class'
                    LEFT JOIN batches b ON s.batch_id = b.id
                    LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
                    LEFT JOIN attendance a ON cs.id = a.session_id
                    WHERE u.id = $1 AND u.role = 'teacher'
                    GROUP BY u.id, u.first_name, u.last_name
                `, [parseInt(teacherId)]);

                if (teacherData) {
                    comparisonData[`teacher_${teacherId}`] = teacherData;
                }
            }
        }

        res.json({
            comparison_data: comparisonData,
            comparison_type: compare_type,
            metrics_included: requestedMetrics,
            parameters: req.query
        });
    } catch (error) {
        console.error('Error performing comparison:', error);
        res.status(500).json({ error: 'Failed to perform comparison' });
    }
});

// GET /api/attendance/analytics/forecasting - Simple attendance forecasting (Admin/Teacher)
router.get('/analytics/forecasting', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { 
            batch_id, 
            teacher_id,
            forecast_days = 30,
            historical_days = 90
        } = req.query;
        
        const db = req.db;
        
        // Build WHERE conditions for historical data
        let conditions = [`cs.start_time::date >= CURRENT_DATE - INTERVAL '${parseInt(historical_days)} days'`];
        let params = [];
        let paramIndex = 1;
        
        if (batch_id) {
            conditions.push(`b.id = $${paramIndex++}`);
            params.push(parseInt(batch_id));
        }
        if (teacher_id) {
            conditions.push(`b.teacher_id = $${paramIndex++}`);
            params.push(parseInt(teacher_id));
        }
        if (req.user.role === 'teacher') {
            conditions.push(`b.teacher_id = $${paramIndex++}`);
            params.push(req.user.id);
        }

        // Get historical attendance data
        const historicalData = await db.all(`
            SELECT 
                cs.start_time::date as date,
                EXTRACT(DOW FROM cs.start_time) as day_of_week,
                COUNT(DISTINCT cs.id) as session_count,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                COUNT(a.id) as total_attendance_records,
                ROUND(
                    (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / 
                     NULLIF(COUNT(a.id), 0)), 2
                ) as attendance_rate
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN batches b ON s.batch_id = b.id
            LEFT JOIN attendance a ON cs.id = a.session_id
            WHERE ${conditions.join(' AND ')}
            GROUP BY cs.start_time::date
            ORDER BY cs.start_time::date
        `, params);

        // Calculate averages by day of week
        const dayOfWeekStats = {};
        for (let i = 0; i < 7; i++) {
            const dayData = historicalData.filter(d => parseInt(d.day_of_week) === i);
            dayOfWeekStats[i] = {
                avg_attendance_rate: dayData.length > 0 ? 
                    Math.round((dayData.reduce((sum, d) => sum + (d.attendance_rate || 0), 0) / dayData.length) * 100) / 100 : 0,
                avg_sessions: dayData.length > 0 ? 
                    Math.round((dayData.reduce((sum, d) => sum + d.session_count, 0) / dayData.length) * 100) / 100 : 0,
                sample_size: dayData.length
            };
        }

        // Generate forecast for next N days
        const forecast = [];
        const today = new Date();
        
        for (let i = 1; i <= parseInt(forecast_days); i++) {
            const forecastDate = new Date(today);
            forecastDate.setDate(today.getDate() + i);
            
            const dayOfWeek = forecastDate.getDay();
            const dayStats = dayOfWeekStats[dayOfWeek];
            
            // Simple forecasting based on historical day-of-week patterns
            const confidence = dayStats.sample_size >= 3 ? 'high' : 
                             dayStats.sample_size >= 1 ? 'medium' : 'low';
            
            forecast.push({
                date: forecastDate.toISOString().split('T')[0],
                day_of_week: dayOfWeek,
                predicted_attendance_rate: dayStats.avg_attendance_rate,
                predicted_sessions: Math.round(dayStats.avg_sessions),
                confidence_level: confidence,
                historical_sample_size: dayStats.sample_size
            });
        }

        // Calculate overall trends
        const overallTrend = {
            avg_attendance_rate: Math.round(
                (historicalData.reduce((sum, d) => sum + (d.attendance_rate || 0), 0) / historicalData.length) * 100
            ) / 100,
            total_historical_days: historicalData.length,
            trend_direction: calculateTrendDirection(historicalData)
        };

        res.json({
            forecast,
            historical_summary: overallTrend,
            day_of_week_patterns: dayOfWeekStats,
            parameters: {
                batch_id,
                teacher_id,
                forecast_days: parseInt(forecast_days),
                historical_days: parseInt(historical_days)
            }
        });
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({ error: 'Failed to generate attendance forecast' });
    }
});

// Helper function to calculate trend direction
function calculateTrendDirection(data) {
    if (data.length < 2) return 'insufficient_data';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, d) => sum + (d.attendance_rate || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, d) => sum + (d.attendance_rate || 0), 0) / secondHalf.length;
    
    const difference = secondHalfAvg - firstHalfAvg;
    
    if (Math.abs(difference) < 2) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
}

// GET /api/attendance/students/detailed - Get detailed student attendance information (Admin/Teacher)
router.get('/students/detailed', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batch_id, student_id, date_from, date_to } = req.query;
        const db = req.db;

        // Build WHERE conditions
        let whereConditions = [];
        let params = [];
        let paramIndex = 1;

        if (batch_id) {
            whereConditions.push(`b.id = $${paramIndex++}`);
            params.push(parseInt(batch_id));
        }
        if (student_id) {
            whereConditions.push(`u.id = $${paramIndex++}`);
            params.push(parseInt(student_id));
        }
        if (date_from) {
            whereConditions.push(`cs.start_time::date >= $${paramIndex++}::date`);
            params.push(date_from);
        }
        if (date_to) {
            whereConditions.push(`cs.start_time::date <= $${paramIndex++}::date`);
            params.push(date_to);
        }
        if (req.user.role === 'teacher') {
            whereConditions.push(`b.teacher_id = $${paramIndex++}`);
            params.push(req.user.id);
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // Get detailed student attendance data
        const studentDetails = await db.all(`
            SELECT 
                u.id as student_id,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                u.created_at as enrollment_date,
                
                -- Overall statistics across all batches
                COUNT(DISTINCT ub.batch_id) as total_batches_enrolled,
                COUNT(DISTINCT s.id) as total_classes_scheduled,
                COUNT(DISTINCT cs.id) as total_classes_conducted,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN cs.id END) as total_classes_attended,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN cs.id END) as total_classes_missed,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN cs.id END) as total_classes_late,
                
                ROUND(
                    (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN cs.id END) * 100.0 / 
                     NULLIF(COUNT(DISTINCT cs.id), 0)), 2
                ) as overall_attendance_rate,
                
                -- Recent activity (last 30 days)
                COUNT(DISTINCT CASE WHEN cs.start_time >= CURRENT_DATE - INTERVAL '30 days' AND a.status = 'present' THEN cs.id END) as recent_classes_attended,
                COUNT(DISTINCT CASE WHEN cs.start_time >= CURRENT_DATE - INTERVAL '30 days' THEN cs.id END) as recent_classes_total
                
            FROM users u
            LEFT JOIN user_batches ub ON u.id = ub.user_id
            LEFT JOIN batches b ON ub.batch_id = b.id
            LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
            ${whereClause}
            AND u.role = 'student'
            GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.created_at
            ORDER BY u.first_name, u.last_name
        `, params);

        // Get batch-wise breakdown for each student
        const batchBreakdown = await db.all(`
            SELECT 
                u.id as student_id,
                b.id as batch_id,
                b.name as batch_name,
                b.description as batch_description,
                b.start_date as batch_start_date,
                b.end_date as batch_end_date,
                
                -- Teacher information
                t.first_name as teacher_first_name,
                t.last_name as teacher_last_name,
                t.email as teacher_email,
                
                -- Batch statistics for this student
                COUNT(DISTINCT s.id) as scheduled_classes,
                COUNT(DISTINCT cs.id) as conducted_classes,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN cs.id END) as attended_classes,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN cs.id END) as missed_classes,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN cs.id END) as late_classes,
                
                ROUND(
                    (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN cs.id END) * 100.0 / 
                     NULLIF(COUNT(DISTINCT cs.id), 0)), 2
                ) as batch_attendance_rate,
                
                -- Recent activity in this batch (last 30 days)
                COUNT(DISTINCT CASE WHEN cs.start_time >= CURRENT_DATE - INTERVAL '30 days' AND a.status = 'present' THEN cs.id END) as recent_attended,
                COUNT(DISTINCT CASE WHEN cs.start_time >= CURRENT_DATE - INTERVAL '30 days' THEN cs.id END) as recent_total,
                
                -- Attendance streak
                (
                    SELECT COUNT(*)
                    FROM (
                        SELECT 
                            CASE WHEN a2.status = 'present' THEN 1 ELSE 0 END as was_present
                        FROM class_sessions cs2
                        JOIN schedules s2 ON cs2.schedule_id = s2.id
                        LEFT JOIN attendance a2 ON cs2.id = a2.session_id AND a2.student_id = u.id
                        WHERE s2.batch_id = b.id
                        AND cs2.start_time <= CURRENT_TIMESTAMP
                        ORDER BY cs2.start_time DESC
                        LIMIT 10
                    ) recent_sessions
                    WHERE was_present = 1
                ) as current_streak
                
            FROM users u
            JOIN user_batches ub ON u.id = ub.user_id
            JOIN batches b ON ub.batch_id = b.id
            LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            LEFT JOIN users t ON b.teacher_id = t.id
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
            ${whereClause}
            AND u.role = 'student'
            GROUP BY u.id, b.id, b.name, b.description, b.start_date, b.end_date, 
                     t.first_name, t.last_name, t.email
            ORDER BY u.first_name, u.last_name, b.name
        `, params);

        // Get recent attendance history for each student (last 20 sessions)
        const recentHistory = await db.all(`
            SELECT 
                u.id as student_id,
                cs.id as session_id,
                cs.start_time::date as session_date,
                cs.start_time::time as session_time,
                s.subject,
                s.topic,
                b.name as batch_name,
                t.first_name || ' ' || t.last_name as teacher_name,
                COALESCE(a.status, 'absent') as attendance_status,
                a.check_in_time,
                a.notes as attendance_notes,
                NULL as session_notes
            FROM users u
            JOIN user_batches ub ON u.id = ub.user_id
            JOIN batches b ON ub.batch_id = b.id
            JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            JOIN users t ON b.teacher_id = t.id
            JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN attendance a ON cs.id = a.session_id AND a.student_id = u.id
            ${whereClause}
            AND u.role = 'student'
            AND cs.start_time <= CURRENT_TIMESTAMP
            ORDER BY u.id, cs.start_time DESC
        `, params);

        // Group data by student
        const studentsMap = new Map();
        
        studentDetails.forEach(student => {
            studentsMap.set(student.student_id, {
                ...student,
                batches: [],
                recent_history: []
            });
        });

        // Add batch breakdown
        batchBreakdown.forEach(batch => {
            const student = studentsMap.get(batch.student_id);
            if (student) {
                student.batches.push({
                    batch_id: batch.batch_id,
                    batch_name: batch.batch_name,
                    batch_description: batch.batch_description,
                    batch_start_date: batch.batch_start_date,
                    batch_end_date: batch.batch_end_date
                });
            }
        });

        // Add recent attendance history
        recentHistory.forEach(record => {
            const student = studentsMap.get(record.student_id);
            if (student) {
                student.recent_history.push({
                    session_id: record.session_id,
                    session_date: record.session_date,
                    session_time: record.session_time,
                    subject: record.subject,
                    topic: record.topic,
                    batch_name: record.batch_name,
                    teacher_name: record.teacher_name,
                    attendance_status: record.attendance_status,
                    check_in_time: record.check_in_time,
                    attendance_notes: record.attendance_notes,
                    session_notes: record.session_notes
                });
            }
        });

        // Final response
        const students = Array.from(studentsMap.values());
        res.json({
            students,
            summary: {
                total_students: students.length
            }
        });
    } catch (error) {
        console.error('Error fetching detailed student data:', error);
        res.status(500).json({ error: 'Failed to fetch detailed student data' });
    }
});

router.get('/reports/overview', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const db = req.db;
        const { batch_id, teacher_id, date_from, date_to } = req.query;
        const userRole = req.user.role;

        // Build filter conditions and parameters
        let conditions = [];
        let params = [];
        let sessionConditions = [];
        let sessionParams = [];
        let attendanceConditions = [];
        let attendanceParams = [];

        let paramIndex = 1;
        let sessionParamIndex = 1;
        let attendanceParamIndex = 1;

        // Apply role-based filtering
        if (userRole === 'teacher') {
            conditions.push(`b.teacher_id = $${paramIndex++}`);
            params.push(req.user.id);
            sessionConditions.push(`s.teacher_id = $${sessionParamIndex++}`);
            sessionParams.push(req.user.id);
            attendanceConditions.push(`EXISTS (SELECT 1 FROM class_sessions cs JOIN schedules sch ON cs.schedule_id = sch.id WHERE cs.id = a.session_id AND sch.teacher_id = $${attendanceParamIndex++})`);
            attendanceParams.push(req.user.id);
        }

        // Apply query parameter filters
        if (batch_id) {
            conditions.push(`b.id = $${paramIndex++}`);
            params.push(parseInt(batch_id));
            sessionConditions.push(`s.batch_id = $${sessionParamIndex++}`);
            sessionParams.push(parseInt(batch_id));
            attendanceConditions.push(`EXISTS (SELECT 1 FROM class_sessions cs JOIN schedules sch ON cs.schedule_id = sch.id WHERE cs.id = a.session_id AND sch.batch_id = $${attendanceParamIndex++})`);
            attendanceParams.push(parseInt(batch_id));
        }

        if (teacher_id && userRole === 'admin') {
            conditions.push(`b.teacher_id = $${paramIndex++}`);
            params.push(parseInt(teacher_id));
            sessionConditions.push(`s.teacher_id = $${sessionParamIndex++}`);
            sessionParams.push(parseInt(teacher_id));
            attendanceConditions.push(`EXISTS (SELECT 1 FROM class_sessions cs JOIN schedules sch ON cs.schedule_id = sch.id WHERE cs.id = a.session_id AND sch.teacher_id = $${attendanceParamIndex++})`);
            attendanceParams.push(parseInt(teacher_id));
        }

        if (date_from) {
            sessionConditions.push(`cs.start_time::date >= $${sessionParamIndex++}::date`);
            sessionParams.push(date_from);
            attendanceConditions.push(`EXISTS (SELECT 1 FROM class_sessions cs WHERE cs.id = a.session_id AND cs.start_time::date >= $${attendanceParamIndex++}::date)`);
            attendanceParams.push(date_from);
        }

        if (date_to) {
            sessionConditions.push(`cs.start_time::date <= $${sessionParamIndex++}::date`);
            sessionParams.push(date_to);
            attendanceConditions.push(`EXISTS (SELECT 1 FROM class_sessions cs WHERE cs.id = a.session_id AND cs.start_time::date <= $${attendanceParamIndex++}::date)`);
            attendanceParams.push(date_to);
        }

        // Build WHERE clauses
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const sessionWhereClause = sessionConditions.length > 0 ? 'WHERE ' + sessionConditions.join(' AND ') : '';
        const attendanceWhereClause = attendanceConditions.length > 0 ? 'WHERE ' + attendanceConditions.join(' AND ') : '';

        // Total number of students (filtered by batch/teacher if specified)
        let totalStudentsQuery = `
            SELECT COUNT(DISTINCT u.id) AS total_students 
            FROM users u
        `;
        let totalStudentsParams = [];

        if (conditions.length > 0) {
            totalStudentsQuery += `
                JOIN batch_students bs ON u.id = bs.student_id
                JOIN batches b ON bs.batch_id = b.id
                ${whereClause} AND u.role = 'student'
            `;
            totalStudentsParams = params;
        } else {
            totalStudentsQuery += ` WHERE u.role = 'student'`;
        }

        const totalStudentsResult = await db.get(totalStudentsQuery, totalStudentsParams);
        const totalStudents = totalStudentsResult.total_students || 0;

        // Build conditions for schedules (without date filtering for now)
        let scheduleConditions = [];
        let scheduleParams = [];
        let scheduleParamIndex = 1;
        
        // Apply role-based filtering for schedules
        if (userRole === 'teacher') {
            scheduleConditions.push(`s.teacher_id = $${scheduleParamIndex++}`);
            scheduleParams.push(req.user.id);
        }
        
        if (batch_id) {
            scheduleConditions.push(`s.batch_id = $${scheduleParamIndex++}`);
            scheduleParams.push(parseInt(batch_id));
        }
        
        if (teacher_id && userRole === 'admin') {
            scheduleConditions.push(`s.teacher_id = $${scheduleParamIndex++}`);
            scheduleParams.push(parseInt(teacher_id));
        }
        
        // Total number of scheduled sessions (filtered by role/batch/teacher, but not date)
        const totalScheduledSessionsResult = await db.get(`
            SELECT COUNT(DISTINCT s.id) AS total_sessions 
            FROM schedules s
            WHERE s.type = 'class' ${scheduleConditions.length > 0 ? 'AND ' + scheduleConditions.join(' AND ') : ''}
        `, scheduleParams);
        const totalSessions = totalScheduledSessionsResult.total_sessions || 0;

        // Total present, absent, late counts (filtered)
        const attendanceCountsResult = await db.get(`
            SELECT
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS total_present,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS total_absent,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) AS total_late
            FROM attendance a
            ${attendanceWhereClause}
        `, attendanceParams);
        const totalPresent = attendanceCountsResult.total_present || 0;
        const totalAbsent = attendanceCountsResult.total_absent || 0;
        const totalLate = attendanceCountsResult.total_late || 0;

        // Overall attendance percentage
        let overallAttendancePercentage = 0;
        const totalAttendanceRecords = totalPresent + totalAbsent + totalLate;
        if (totalAttendanceRecords > 0) {
            overallAttendancePercentage = parseFloat(((totalPresent + totalLate) * 100.0 / totalAttendanceRecords).toFixed(2));
        }

        // Total teachers (filtered if needed)
        let totalTeachersQuery = `SELECT COUNT(DISTINCT u.id) AS total_teachers FROM users u`;
        let totalTeachersParams = [];

        if (teacher_id && userRole === 'admin') {
            totalTeachersQuery += ` WHERE u.role = 'teacher' AND u.id = $1`;
            totalTeachersParams = [parseInt(teacher_id)];
        } else if (userRole === 'teacher') {
            totalTeachersQuery += ` WHERE u.role = 'teacher' AND u.id = $1`;
            totalTeachersParams = [req.user.id];
        } else if (batch_id) {
            totalTeachersQuery += ` JOIN batches b ON u.id = b.teacher_id WHERE u.role = 'teacher' AND b.id = $1`;
            totalTeachersParams = [parseInt(batch_id)];
        } else {
            totalTeachersQuery += ` WHERE u.role = 'teacher'`;
        }

        const totalTeachersResult = await db.get(totalTeachersQuery, totalTeachersParams);
        const totalTeachers = totalTeachersResult.total_teachers || 0;

        // Total batches (filtered if needed)
        let totalBatchesQuery = `SELECT COUNT(DISTINCT b.id) AS total_batches FROM batches b`;
        let totalBatchesParams = [];

        if (conditions.length > 0) {
            totalBatchesQuery += ` ${whereClause}`;
            totalBatchesParams = params;
        }

        const totalBatchesResult = await db.get(totalBatchesQuery, totalBatchesParams);
        const totalBatches = totalBatchesResult.total_batches || 0;

        // Sessions with codes (sessions that have been started and generated access codes)
        const sessionsWithCodesResult = await db.get(`
            SELECT COUNT(DISTINCT cs.id) AS sessions_with_codes 
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            WHERE s.type = 'class' AND cs.access_code IS NOT NULL 
            ${scheduleConditions.length > 0 ? 'AND ' + scheduleConditions.join(' AND ') : ''}
        `, scheduleParams);
        const sessionsWithCodes = sessionsWithCodesResult.sessions_with_codes || 0;
        
        // Sessions without codes (scheduled sessions that don't have corresponding class_sessions with access codes)
        const sessionsWithoutCodes = totalSessions - sessionsWithCodes;
        res.json({
            total_students: totalStudents,
            total_sessions: totalSessions,
            total_teachers: totalTeachers,
            total_batches: totalBatches,
            overall_attendance_rate: overallAttendancePercentage,
            sessions_with_codes: sessionsWithCodes,
            sessions_without_codes: sessionsWithoutCodes,
            total_present: totalPresent,
            total_absent: totalAbsent,
            total_late: totalLate
        });

    } catch (error) {
        console.error('Error fetching attendance overview:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// GET /api/attendance/student-details/:id - Get detailed attendance for a specific student (Admin/Teacher)
router.get('/student-details/:id', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { date_from, date_to } = req.query;
        const db = req.db;

        // Fetch student basic info
        const student = await db.get(`
            SELECT id, first_name, last_name, email
            FROM users
            WHERE id = $1 AND role = 'student'
        `, [parseInt(id)]);

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch student's batches
        const studentBatches = await db.all(`
            SELECT b.id, b.name
            FROM user_batches ub
            JOIN batches b ON ub.batch_id = b.id
            WHERE ub.user_id = $1
        `, [parseInt(id)]);

        // Fetch overall attendance summary for the student
        let summaryConditions = ['a.student_id = $1'];
        let summaryParams = [parseInt(id)];
        let summaryParamIndex = 2;

        if (date_from) {
            summaryConditions.push(`s.start_time::date >= $${summaryParamIndex++}::date`);
            summaryParams.push(date_from);
        }
        if (date_to) {
            summaryConditions.push(`s.start_time::date <= $${summaryParamIndex++}::date`);
            summaryParams.push(date_to);
        }

        const summaryWhereClause = summaryConditions.length > 0 ? 'WHERE ' + summaryConditions.join(' AND ') : '';

        const overallSummary = await db.get(`
            SELECT
                (SELECT COUNT(*) FROM schedules s2 
                 WHERE s2.batch_id IN (SELECT batch_id FROM user_batches WHERE user_id = $1)
                 ${date_from ? ` AND s2.start_time::date >= $${date_from ? 2 : 1}::date` : ''}
                 ${date_to ? ` AND s2.start_time::date <= $${date_to ? (date_from ? 3 : 2) : 1}::date` : ''}
                )::int as total_scheduled_classes,
                COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::int as total_attended_classes,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END)::int as total_absent_classes,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END)::int as total_late_classes,
                ROUND(
                    (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::numeric * 100 /
                     NULLIF(COUNT(a.id), 0)), 2
                )::float8 as attendance_percentage,
                MAX(COALESCE(a.check_in_time::date, cs.start_time::date)) as last_attendance_date
            FROM attendance a
            JOIN class_sessions cs ON a.session_id = cs.id
            JOIN schedules s ON cs.schedule_id = s.id
            ${summaryWhereClause}
        `, [parseInt(id), ...(date_from ? [date_from] : []), ...(date_to ? [date_to] : []), ...summaryParams.slice(1)]);

        // Fetch session-level attendance details for the student
        let sessionConditions = ['a.student_id = $1'];
        let sessionParams = [parseInt(id)];
        let sessionParamIndex = 2;

        if (date_from) {
            sessionConditions.push(`cs.start_time::date >= $${sessionParamIndex++}::date`);
            sessionParams.push(date_from);
        }
        if (date_to) {
            sessionConditions.push(`cs.start_time::date <= $${sessionParamIndex++}::date`);
            sessionParams.push(date_to);
        }

        const sessionWhereClause = sessionConditions.length > 0 ? 'WHERE ' + sessionConditions.join(' AND ') : '';

        const sessions = await db.all(`
            SELECT
                cs.id as session_id,
                cs.start_time::date as session_date,
                cs.start_time::time as start_time,
                cs.end_time::time as end_time,
                s.subject || ' - ' || s.topic as schedule_title,
                u.first_name || ' ' || u.last_name as teacher_name,
                a.status,
                a.check_in_time as marked_at,
                CASE WHEN cs.access_code IS NOT NULL AND cs.code_generated_at IS NOT NULL AND cs.code_expires_at IS NOT NULL AND a.check_in_time BETWEEN cs.code_generated_at AND cs.code_expires_at THEN true ELSE false END as code_entered,
                a.notes
            FROM attendance a
            JOIN class_sessions cs ON a.session_id = cs.id
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN users u ON s.teacher_id = u.id
            ${sessionWhereClause}
            ORDER BY cs.start_time DESC
        `, sessionParams);

        res.json({
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            student_email: student.email,
            batch_id: studentBatches.length > 0 ? studentBatches[0].id : null, // Assuming one primary batch for simplicity
            batch_name: studentBatches.length > 0 ? studentBatches[0].name : null,
            total_scheduled_classes: overallSummary?.total_scheduled_classes || 0,
            total_attended_classes: overallSummary?.total_attended_classes || 0,
            total_absent_classes: overallSummary?.total_absent_classes || 0,
            total_late_classes: overallSummary?.total_late_classes || 0,
            attendance_percentage: overallSummary?.attendance_percentage || 0,
            last_attendance_date: overallSummary?.last_attendance_date,
            sessions: sessions
        });

    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ error: 'Failed to fetch student details' });
    }
});


// GET /api/attendance/student-details - Get attendance details grouped by batch and student (Admin/Teacher)
router.get('/student-details', authenticateToken, teacherOrAdmin, async (req, res) => {
  try {
    const { batch_id, teacher_id, date_from, date_to } = req.query;
    const db = req.db;

    // Build WHERE conditions shared by queries
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (batch_id) {
      conditions.push(`s.batch_id = $${paramIndex++}`);
      params.push(parseInt(batch_id));
    }
    if (teacher_id) {
      conditions.push(`s.teacher_id = $${paramIndex++}`);
      params.push(parseInt(teacher_id));
    }
    if (date_from) {
      conditions.push(`s.start_time::date >= $${paramIndex++}::date`);
      params.push(date_from);
    }
    if (date_to) {
      conditions.push(`s.start_time::date <= $${paramIndex++}::date`);
      params.push(date_to);
    }

    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    // 1) Aggregate per batch and student
    // Build subquery filters for schedules date range
    const subFilters = [];
    const subParams = [];
    let subParamIndex = 1;
    if (date_from) { subFilters.push(`s2.start_time::date >= $${subParamIndex++}::date`); subParams.push(date_from); }
    if (date_to) { subFilters.push(`s2.start_time::date <= $${subParamIndex++}::date`); subParams.push(date_to); }
    const subClause = subFilters.length ? ' AND ' + subFilters.join(' AND ') : '';

    const summaryRows = await db.all(`
      SELECT
        b.id AS batch_id,
        b.name AS batch_name,
        a.student_id,
        u.first_name || ' ' || u.last_name AS student_name,
        u.email AS student_email,
        (SELECT COUNT(*) FROM schedules s2 WHERE s2.batch_id = b.id${subClause})::int AS total_scheduled_classes,
        COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::int AS total_attended_classes,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END)::int AS total_absent_classes,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END)::int AS total_late_classes,
        ROUND(
          (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::numeric * 100 / NULLIF(COUNT(a.id), 0)), 2
        )::float8 AS attendance_percentage,
        MAX(COALESCE(a.check_in_time::date, cs.start_time::date)) AS last_attendance_date
      FROM attendance a
      JOIN class_sessions cs ON a.session_id = cs.id
      JOIN schedules s ON cs.schedule_id = s.id
      JOIN batches b ON s.batch_id = b.id
      JOIN users u ON a.student_id = u.id
      ${whereClause}
      GROUP BY b.id, b.name, a.student_id, u.first_name, u.last_name, u.email
      ORDER BY b.name ASC, student_name ASC
    `, [...subParams, ...params]);

    // Early return if no data
    if (!summaryRows || summaryRows.length === 0) {
      return res.json({ batches: [] });
    }

    // 2) Fetch session-level details for all involved students within the same filters
    const sessionRows = await db.all(`
      SELECT
        s.batch_id,
        a.student_id,
        cs.id AS session_id,
        cs.start_time::date AS session_date,
        cs.start_time::time AS start_time,
        cs.end_time::time AS end_time,
        s.subject || ' - ' || s.topic AS schedule_title,
        tu.first_name || ' ' || tu.last_name AS teacher_name,
        a.status,
        a.check_in_time AS marked_at,
        CASE WHEN cs.access_code IS NOT NULL AND cs.code_generated_at IS NOT NULL AND cs.code_expires_at IS NOT NULL AND a.check_in_time BETWEEN cs.code_generated_at AND cs.code_expires_at THEN true ELSE false END AS code_entered,
        a.notes
      FROM attendance a
      JOIN class_sessions cs ON a.session_id = cs.id
      JOIN schedules s ON cs.schedule_id = s.id
      JOIN users tu ON s.teacher_id = tu.id
      ${whereClause}
      ORDER BY cs.start_time DESC
    `, params);

    // Build maps for fast assembly
    const byBatch = new Map();
    const studentKey = (batchId, studentId) => `${batchId}:${studentId}`;
    const studentsMap = new Map(); // key => student object

    // Initialize batches and students from summaryRows
    for (const row of summaryRows) {
      if (!byBatch.has(row.batch_id)) {
        byBatch.set(row.batch_id, {
          batch_id: row.batch_id,
          batch_name: row.batch_name,
          total_students: 0, // will compute after
          total_scheduled_classes: 0, // will compute after
          average_attendance_rate: 0, // will compute after
          students: []
        });
      }

      const student = {
        student_id: row.student_id,
        student_name: row.student_name,
        student_email: row.student_email,
        batch_id: row.batch_id,
        batch_name: row.batch_name,
        total_scheduled_classes: row.total_scheduled_classes || 0,
        total_attended_classes: row.total_attended_classes || 0,
        total_absent_classes: row.total_absent_classes || 0,
        total_late_classes: row.total_late_classes || 0,
        attendance_percentage: row.attendance_percentage || 0,
        last_attendance_date: row.last_attendance_date || null,
        sessions: []
      };

      const key = studentKey(row.batch_id, row.student_id);
      studentsMap.set(key, student);
      byBatch.get(row.batch_id).students.push(student);
    }

    // Attach sessions to each student
    for (const srow of sessionRows) {
      const key = studentKey(srow.batch_id, srow.student_id);
      const student = studentsMap.get(key);
      if (student) {
        student.sessions.push({
          session_id: srow.session_id,
          session_date: srow.session_date,
          start_time: srow.start_time,
          end_time: srow.end_time,
          schedule_title: srow.schedule_title,
          teacher_name: srow.teacher_name,
          status: srow.status,
          marked_at: srow.marked_at,
          code_entered: !!srow.code_entered,
          notes: srow.notes || null
        });
      }
    }

    // Finalize batch-level aggregates
    const batches = [];
    for (const batch of byBatch.values()) {
      batch.total_students = batch.students.length;
      // Use max of total_scheduled_classes across students as batch scheduled classes
      batch.total_scheduled_classes = batch.students.reduce((max, s) => Math.max(max, s.total_scheduled_classes || 0), 0);
      // Average attendance percentage across students
      const sumRate = batch.students.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0);
      batch.average_attendance_rate = batch.students.length ? Math.round((sumRate / batch.students.length) * 100) / 100 : 0;
      batches.push(batch);
    }

    res.json({ batches });
  } catch (err) {
    console.error('Error fetching student details list:', err);
    res.status(500).json({ error: 'Failed to fetch student details list' });
  }
});

// GET /api/attendance/sessions/:scheduleId/status - Check if student can join session
router.get('/sessions/:scheduleId/status', authenticateToken, studentOnly, async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const db = req.db;
        const now = new Date();

        // Get the active session for this schedule
        const session = await db.get(`
            SELECT 
                cs.id,
                cs.access_code,
                cs.code_expires_at,
                cs.status,
                cs.session_started_at,
                cs.start_time,
                cs.end_time,
                cs.session_date
            FROM class_sessions cs
            WHERE cs.schedule_id = $1 
            AND cs.status IN ('started', 'in_progress')
            AND cs.access_code IS NOT NULL
            AND cs.code_expires_at > $2
            ORDER BY cs.created_at DESC
            LIMIT 1
        `, [parseInt(scheduleId), now.toISOString()]);

        if (!session) {
            return res.json({
                canJoin: false,
                reason: 'No active session found or access code has expired'
            });
        }

        // Check if the session is within the valid time window
        const sessionDate = new Date(session.session_date);
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        
        // Use dynamic attendance settings to determine join window
        const AttendanceService = require('../services/attendanceService');
        const attendanceService = new AttendanceService(req.db);
        const settings = await attendanceService.getSettings();
        const earlyStartMins = parseInt(settings.early_start_minutes || '15', 10);
        const lateJoinMins = parseInt(settings.late_join_minutes || '10', 10);
        
        // Students can join as early as the teacher's early start window
        const joinWindowStart = new Date(startTime.getTime() - earlyStartMins * 60 * 1000);
        
        // Students can join until the earlier of class end time or late-join deadline
        const lateJoinDeadline = new Date(startTime.getTime() + lateJoinMins * 60 * 1000);
        const joinWindowEnd = new Date(Math.min(endTime.getTime(), lateJoinDeadline.getTime()));

        if (now < joinWindowStart) {
            return res.json({
                canJoin: false,
                reason: 'Session join window has not opened yet'
            });
        }

        if (now > joinWindowEnd) {
            return res.json({
                canJoin: false,
                reason: 'Session has ended or late join period expired'
            });
        }

        // Check if student is already marked as present for this session
        const existingAttendance = await db.get(`
            SELECT status FROM attendance 
            WHERE session_id = $1 AND student_id = $2
        `, [session.id, req.user.id]);

        res.json({
            canJoin: true,
            sessionId: session.id,
            hasAccessCode: !!session.access_code,
            expiresAt: session.code_expires_at,
            alreadyJoined: existingAttendance?.status === 'present'
        });

    } catch (error) {
        console.error('Error checking session status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check session status'
        });
    }
});

// GET /api/attendance/session-student - Get individual schedule attendance data for Session Student view
router.get('/session-student', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { student_id, batch_id, date_from, date_to } = req.query;
        const db = req.db;

        // Validate that student_id is provided
        if (!student_id) {
            return res.status(400).json({ 
                error: 'Student ID is required. Please select a student to view data.' 
            });
        }

        // Build WHERE conditions for filtering
        let whereConditions = ['u.id = $1'];
        let params = [parseInt(student_id)];
        let paramIndex = 2;

        if (batch_id) {
            whereConditions.push(`b.id = $${paramIndex++}`);
            params.push(parseInt(batch_id));
        }
        if (date_from) {
            // Add time component to date filtering - start from beginning of day
            whereConditions.push(`s.start_time >= $${paramIndex++}`);
            params.push(date_from + ' 00:00:00');
        }
        if (date_to) {
            // Add time component to date filtering - end at end of day
            whereConditions.push(`s.start_time <= $${paramIndex++}`);
            params.push(date_to + ' 23:59:59');
        }

        // For teachers, only show schedules from their batches
        if (req.user.role === 'teacher') {
            whereConditions.push(`EXISTS (SELECT 1 FROM schedules s2 WHERE s2.batch_id = b.id AND s2.teacher_id = $${paramIndex++})`);
            params.push(req.user.id);
        }

        const whereClause = 'WHERE ' + whereConditions.join(' AND ');

        const query = `
            SELECT 
                s.id as schedule_id,
                s.title as schedule_title,
                b.name as batch_name,
                b.french_level,
                CASE 
                    WHEN a.status IS NOT NULL THEN a.status
                    ELSE 'absent'
                END as attendance_status,
                s.start_time as schedule_start_time,
                s.end_time as schedule_end_time,
                a.check_in_time,
                u.id as student_id,
                CONCAT(u.first_name, ' ', u.last_name) as student_name,
                b.id as batch_id,
                CONCAT(t.first_name, ' ', t.last_name) as teacher_name,
                CASE 
                    WHEN s.end_time <= NOW() THEN 'completed'
                    WHEN s.start_time <= NOW() AND s.end_time > NOW() THEN 'in_progress'
                    ELSE 'scheduled'
                END as session_status
            FROM schedules s
            CROSS JOIN users u
            JOIN batches b ON s.batch_id = b.id
            JOIN users t ON b.teacher_id = t.id
            JOIN user_batches ub ON ub.batch_id = b.id AND ub.user_id = u.id
            LEFT JOIN class_sessions cs ON cs.schedule_id = s.id
            LEFT JOIN attendance a ON a.session_id = cs.id AND a.student_id = u.id
            ${whereClause}
            AND s.type = 'class'
            ORDER BY s.start_time DESC, s.title ASC
        `;

        const result = await db.all(query, params);
        
        res.json({
            success: true,
            data: result || []
        });

    } catch (error) {
        console.error('Error fetching session student data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch session student data',
            details: error.message 
        });
    }
});

// GET /api/attendance/batch-sessions/:batchId - Get all scheduled sessions for a specific batch
router.get('/batch-sessions/:batchId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batchId } = req.params;
        const db = req.db;

        // For teachers, ensure they can only access their own batch sessions
        let batchFilter = '';
        let params = [parseInt(batchId)];
        
        if (req.user.role === 'teacher') {
            batchFilter = 'AND b.teacher_id = $2';
            params.push(req.user.id);
        }

        const query = `
            SELECT 
                s.id,
                s.title,
                s.start_time,
                s.end_time,
                s.start_time::date as session_date,
                s.start_time::time as start_time_only,
                s.end_time::time as end_time_only,
                CASE 
                    WHEN s.end_time <= NOW() THEN 'completed'
                    WHEN s.start_time <= NOW() AND s.end_time > NOW() THEN 'in_progress'
                    ELSE 'scheduled'
                END as session_status,
                COUNT(DISTINCT ub.user_id) as total_students,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
                CASE 
                    WHEN COUNT(DISTINCT ub.user_id) > 0 THEN
                        ROUND(
                            (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END)::numeric * 100.0) / 
                            COUNT(DISTINCT ub.user_id), 2
                        )
                    ELSE 0 
                END as attendance_rate
            FROM schedules s
            JOIN batches b ON s.batch_id = b.id
            LEFT JOIN user_batches ub ON ub.batch_id = b.id
            LEFT JOIN users u ON ub.user_id = u.id AND u.role = 'student'
            LEFT JOIN class_sessions cs ON cs.schedule_id = s.id
            LEFT JOIN attendance a ON a.session_id = cs.id AND a.student_id = u.id
            WHERE s.batch_id = $1 AND s.type = 'class' ${batchFilter}
            GROUP BY s.id, s.title, s.start_time, s.end_time
            ORDER BY s.start_time ASC
        `;

        const sessions = await db.all(query, params);
        
        res.json({
            success: true,
            data: sessions || []
        });

    } catch (error) {
        console.error('Error fetching batch sessions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch batch sessions',
            details: error.message 
        });
    }
});

// Get batch performance data for Teacher Performance tab
router.get('/reports/batch-performance', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batch_id, start_date, end_date } = req.query;
        
        let whereClause = 'WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (batch_id) {
            whereClause += ` AND b.id = $${paramIndex}`;
            params.push(batch_id);
            paramIndex++;
        }

        if (start_date) {
            whereClause += ` AND s.start_time >= $${paramIndex}`;
            params.push(start_date);
            paramIndex++;
        }

        if (end_date) {
            whereClause += ` AND s.start_time <= $${paramIndex}`;
            params.push(end_date);
            paramIndex++;
        }

        // Get batch performance data
        const batchPerformance = await req.db.all(`
            SELECT 
                b.id as batch_id,
                b.name as batch_name,
                b.french_level as batch_level,
                u.first_name || ' ' || u.last_name as teacher_name,
                u.email as teacher_email,
                
                -- Total sessions from schedules table
                COUNT(DISTINCT s.id) as total_sessions,
                
                -- Total sessions that have been conducted (have class_sessions)
                COUNT(DISTINCT cs.id) as conducted_sessions,
                
                -- Code generation rate (sessions with access codes / total conducted sessions)
                ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT cs.id) > 0 THEN
                            (COUNT(DISTINCT CASE WHEN cs.access_code IS NOT NULL THEN cs.id END) * 100.0 / COUNT(DISTINCT cs.id))
                        ELSE 0 
                    END, 2
                ) as code_generation_rate,
                
                -- Session start rate (conducted sessions / total scheduled sessions)
                ROUND(
                    CASE 
                        WHEN COUNT(DISTINCT s.id) > 0 THEN
                            (COUNT(DISTINCT cs.id) * 100.0 / COUNT(DISTINCT s.id))
                        ELSE 0 
                    END, 2
                ) as session_start_rate,
                
                -- Total enrolled students
                COUNT(DISTINCT ub.user_id) as total_students,
                
                -- Average attendance rate across all sessions
                ROUND(
                    AVG(
                        CASE 
                            WHEN session_stats.total_enrolled > 0 THEN
                                (session_stats.present_count * 100.0 / session_stats.total_enrolled)
                            ELSE 0 
                        END
                    ), 2
                ) as avg_attendance_rate
                
            FROM batches b
            LEFT JOIN users u ON b.teacher_id = u.id
            LEFT JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN user_batches ub ON b.id = ub.batch_id
            LEFT JOIN users student ON ub.user_id = student.id AND student.role = 'student'
            LEFT JOIN (
                SELECT 
                    cs2.id as session_id,
                    COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                    COUNT(DISTINCT ub2.user_id) as total_enrolled
                FROM class_sessions cs2
                LEFT JOIN attendance a ON cs2.id = a.session_id
                LEFT JOIN schedules s2 ON cs2.schedule_id = s2.id
                LEFT JOIN user_batches ub2 ON s2.batch_id = ub2.batch_id
                LEFT JOIN users u2 ON ub2.user_id = u2.id AND u2.role = 'student'
                GROUP BY cs2.id
            ) session_stats ON cs.id = session_stats.session_id
            ${whereClause}
            GROUP BY b.id, b.name, b.french_level, u.first_name, u.last_name, u.email
            ORDER BY b.name
        `, params);

        res.json({
            success: true,
            batches: batchPerformance || []
        });

    } catch (error) {
        console.error('Error fetching batch performance data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch batch performance data',
            details: error.message 
        });
    }
});

// Get detailed session information for a specific batch (for expandable rows)
router.get('/reports/batch-sessions/:batchId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batchId } = req.params;
        const { start_date, end_date } = req.query;
        
        let whereClause = 'WHERE b.id = $1';
        let params = [batchId];
        let paramIndex = 2;

        if (start_date) {
            whereClause += ` AND s.start_time >= $${paramIndex}`;
            params.push(start_date);
            paramIndex++;
        }

        if (end_date) {
            whereClause += ` AND s.start_time <= $${paramIndex}`;
            params.push(end_date);
            paramIndex++;
        }

        // Get detailed session information for the batch
        const sessions = await req.db.all(`
            SELECT 
                s.id as schedule_id,
                s.subject,
                s.topic,
                s.description,
                s.start_time,
                s.end_time,
                cs.id as session_id,
                cs.status as session_status,
                cs.access_code,
                cs.code_expires_at,
                cs.start_time as actual_start_time,
                cs.end_time as actual_end_time,
                
                -- Session duration in minutes
                CASE 
                    WHEN cs.end_time IS NOT NULL THEN 
                        ROUND(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time)) / 60)
                    WHEN cs.start_time IS NOT NULL THEN 
                        ROUND(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cs.start_time)) / 60)
                    ELSE 0
                END as duration_minutes,
                
                -- Total enrolled students for this batch
                (SELECT COUNT(*) FROM user_batches ub2 
                 JOIN users u2 ON ub2.user_id = u2.id 
                 WHERE ub2.batch_id = b.id AND u2.role = 'student') as total_students,
                
                -- Attendance statistics
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
                
                -- Attendance percentage
                ROUND(
                    CASE 
                        WHEN (SELECT COUNT(*) FROM user_batches ub2 
                              JOIN users u2 ON ub2.user_id = u2.id 
                              WHERE ub2.batch_id = b.id AND u2.role = 'student') > 0 THEN
                            (COUNT(CASE WHEN a.status IN ('present', 'late') THEN 1 END) * 100.0 / 
                             (SELECT COUNT(*) FROM user_batches ub2 
                              JOIN users u2 ON ub2.user_id = u2.id 
                              WHERE ub2.batch_id = b.id AND u2.role = 'student'))
                        ELSE 0 
                    END, 2
                ) as attendance_percentage
                
            FROM batches b
            JOIN schedules s ON b.id = s.batch_id AND s.type = 'class'
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            LEFT JOIN attendance a ON cs.id = a.session_id
            ${whereClause}
            GROUP BY s.id, s.subject, s.topic, s.description, s.start_time, s.end_time,
                     cs.id, cs.status, cs.access_code, cs.code_expires_at, 
                     cs.start_time, cs.end_time, b.id
            ORDER BY s.start_time DESC
        `, params);

        res.json({
            success: true,
            sessions: sessions || []
        });

    } catch (error) {
        console.error('Error fetching batch sessions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch batch sessions',
            details: error.message 
        });
    }
});

// GET /api/attendance/reports/sessions-with-codes - Get detailed list of sessions with access codes
router.get('/reports/sessions-with-codes', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batch_id, teacher_id, date_from, date_to } = req.query;
        const db = req.db;

        // Build filtering conditions
        let scheduleConditions = ["s.type = 'class'"];
        let scheduleParams = [];
        let paramIndex = 1;

        // Role-based filtering
        if (req.user.role === 'teacher') {
            scheduleConditions.push(`b.teacher_id = $${paramIndex}`);
            scheduleParams.push(req.user.id);
            paramIndex++;
        }

        // Additional filters
        if (batch_id) {
            scheduleConditions.push(`b.id = $${paramIndex}`);
            scheduleParams.push(parseInt(batch_id));
            paramIndex++;
        }
        if (teacher_id && req.user.role === 'admin') {
            scheduleConditions.push(`b.teacher_id = $${paramIndex}`);
            scheduleParams.push(parseInt(teacher_id));
            paramIndex++;
        }
        if (date_from) {
            scheduleConditions.push(`s.start_time::date >= $${paramIndex}::date`);
            scheduleParams.push(date_from);
            paramIndex++;
        }
        if (date_to) {
            scheduleConditions.push(`s.start_time::date <= $${paramIndex}::date`);
            scheduleParams.push(date_to);
            paramIndex++;
        }

        const whereClause = scheduleConditions.length > 0 ? 'WHERE ' + scheduleConditions.join(' AND ') : '';

        console.log('Sessions with codes query conditions:', scheduleConditions);
        console.log('Sessions with codes params:', scheduleParams);

        const sessionsWithCodes = await db.all(`
            SELECT 
                cs.id as session_id,
                s.title as session_name,
                s.description,
                u.first_name || ' ' || u.last_name as teacher_name,
                b.name as batch_name,
                b.french_level,
                s.start_time as start_time,
                s.end_time as end_time,
                cs.access_code,
                cs.code_generated_at,
                cs.status as session_status
            FROM class_sessions cs
            JOIN schedules s ON cs.schedule_id = s.id
            JOIN batches b ON s.batch_id = b.id
            JOIN users u ON b.teacher_id = u.id
            ${whereClause}
            AND cs.access_code IS NOT NULL
            ORDER BY s.start_time DESC
        `, scheduleParams);

        console.log('Sessions with codes result count:', sessionsWithCodes.length);

        res.json({
            success: true,
            sessions: sessionsWithCodes,
            total: sessionsWithCodes.length
        });

    } catch (error) {
        console.error('Error fetching sessions with codes:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sessions with codes',
            details: error.message 
        });
    }
});

// GET /api/attendance/reports/sessions-without-codes - Get detailed list of scheduled sessions without access codes
router.get('/reports/sessions-without-codes', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { batch_id, teacher_id, date_from, date_to } = req.query;
        const db = req.db;

        // Build filtering conditions
        let scheduleConditions = ["s.type = 'class'"];
        let scheduleParams = [];
        let paramIndex = 1;

        // Role-based filtering
        if (req.user.role === 'teacher') {
            scheduleConditions.push(`b.teacher_id = $${paramIndex}`);
            scheduleParams.push(req.user.id);
            paramIndex++;
        }

        // Additional filters
        if (batch_id) {
            scheduleConditions.push(`b.id = $${paramIndex}`);
            scheduleParams.push(parseInt(batch_id));
            paramIndex++;
        }
        if (teacher_id && req.user.role === 'admin') {
            scheduleConditions.push(`b.teacher_id = $${paramIndex}`);
            scheduleParams.push(parseInt(teacher_id));
            paramIndex++;
        }
        if (date_from) {
            scheduleConditions.push(`s.start_time::date >= $${paramIndex}::date`);
            scheduleParams.push(date_from);
            paramIndex++;
        }
        if (date_to) {
            scheduleConditions.push(`s.start_time::date <= $${paramIndex}::date`);
            scheduleParams.push(date_to);
            paramIndex++;
        }

        const whereClause = scheduleConditions.length > 0 ? 'WHERE ' + scheduleConditions.join(' AND ') : '';

        console.log('Sessions without codes query conditions:', scheduleConditions);
        console.log('Sessions without codes params:', scheduleParams);

        const sessionsWithoutCodes = await db.all(`
            SELECT 
                s.id as schedule_id,
                s.title as session_name,
                s.description,
                u.first_name || ' ' || u.last_name as teacher_name,
                b.name as batch_name,
                b.french_level,
                s.start_time as start_time,
                s.end_time as end_time,
                'Not Generated' as access_code,
                NULL as code_generated_at,
                'scheduled' as session_status
            FROM schedules s
            JOIN batches b ON s.batch_id = b.id
            JOIN users u ON b.teacher_id = u.id
            LEFT JOIN class_sessions cs ON s.id = cs.schedule_id
            ${whereClause}
            AND cs.id IS NULL
            ORDER BY s.start_time DESC
        `, scheduleParams);

        console.log('Sessions without codes result count:', sessionsWithoutCodes.length);

        res.json({
            success: true,
            sessions: sessionsWithoutCodes,
            total: sessionsWithoutCodes.length
        });

    } catch (error) {
        console.error('Error fetching sessions without codes:', error);
        res.status(500).json({ 
            error: 'Failed to fetch sessions without codes',
            details: error.message 
        });
    }
});

module.exports = router;