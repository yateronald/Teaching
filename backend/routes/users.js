const express = require('express');
const { body, validationResult } = require('express-validator');
const { hashPassword, authenticateToken, teacherOrAdmin, authorizeRoles } = require('../middleware/auth');
const { sendWelcomeEmail, sendAdminPasswordReset } = require('../emails/emailService');

// Build local admin-only middleware using authorizeRoles to avoid any export mismatch
const adminOnlyMw = authorizeRoles('admin');

// Debug types to diagnose startup crash
console.log('[users.js] typeof authenticateToken:', typeof authenticateToken, ' typeof adminOnlyMw:', typeof adminOnlyMw, ' typeof teacherOrAdmin:', typeof teacherOrAdmin);

const router = express.Router();

// Helper: generate a temporary password of exact length 10 including letters (upper/lower) and digits
function generateTempPassword(len = 10) {
    const U = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude I/O
    const L = 'abcdefghijkmnopqrstuvwxyz'; // exclude l
    const D = '23456789'; // exclude 0/1
    const pools = [U, L, D];

    // Ensure at least one from each required class
    const required = [
        U[Math.floor(Math.random() * U.length)],
        L[Math.floor(Math.random() * L.length)],
        D[Math.floor(Math.random() * D.length)]
    ];

    const all = (U + L + D).split('');
    while (required.length < len) {
        required.push(all[Math.floor(Math.random() * all.length)]);
    }
    // Shuffle
    for (let i = required.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [required[i], required[j]] = [required[j], required[i]];
    }
    return required.join('');
}

// Get all users (Admin only)
router.get('/', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { role, search } = req.query;
        
        // If requesting students, include batch information
        if (role === 'student') {
            let sql = `
                SELECT DISTINCT
                    u.id, u.username, u.email, u.role, u.first_name, u.last_name, u.created_at, u.is_active, u.failed_login_attempts
                FROM users u
                WHERE u.role = 'student'
            `;
            let params = [];
            
            if (search) {
                sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            sql += ' ORDER BY u.created_at DESC';
            
            const students = await req.db.all(sql, params);
            
            // Get batch information for each student
            for (const student of students) {
                const batches = await req.db.all(`
                    SELECT b.id, b.name, b.french_level
                    FROM batches b
                    JOIN batch_students bs ON b.id = bs.batch_id
                    WHERE bs.student_id = ?
                    ORDER BY b.name
                `, [student.id]);
                student.batches = batches;
            }
            
            return res.json(students);
        }
        
        // For non-student roles, use the original logic
        let sql = 'SELECT id, username, email, role, first_name, last_name, created_at, is_active, failed_login_attempts FROM users';
        let params = [];
        
        const conditions = [];
        
        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }
        
        if (search) {
            conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY created_at DESC';
        
        const users = await req.db.all(sql, params);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at, is_active, failed_login_attempts FROM users WHERE id = ?',
            [id]
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user (Admin only)
router.post('/', [
    authenticateToken,
    adminOnlyMw,
    body('username').isLength({ min: 3 }).trim(),
    body('email').isEmail().normalizeEmail(),
    // password is no longer provided by client; it will be auto-generated
    body('role').isIn(['admin', 'teacher', 'student']),
    body('first_name').isLength({ min: 1 }).trim(),
    body('last_name').isLength({ min: 1 }).trim(),
    body('is_active').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { username, email, role, first_name, last_name, is_active = true } = req.body;

        // Check if username or email already exists
        const existingUser = await req.db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Auto-generate a temporary password (exactly 10 chars)
        const tempPassword = generateTempPassword(10);

        // Hash password
        const passwordHash = await hashPassword(tempPassword);

        // Create user with password policy defaults and require change on next login
        const result = await req.db.run(
            "INSERT INTO users (username, email, password_hash, role, first_name, last_name, must_change_password, password_expires_at, is_active, failed_login_attempts) VALUES (?, ?, ?, ?, ?, ?, 1, NOW() + INTERVAL '90 days', ?, 0) RETURNING id",
            [username, email, passwordHash, role, first_name, last_name, is_active]
        );

        const userId = result.rows[0].id;

        // Try to send welcome email with temp password (non-blocking error)
        try {
            await sendWelcomeEmail({ to: email, username, tempPassword: tempPassword });
        } catch (e) {
            console.error('Failed to send welcome email for user', email, e && e.message);
        }

        // Get created user (without password)
        const newUser = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (Admin only)
router.put('/:id', [
    authenticateToken,
    adminOnlyMw,
    body('username').optional().isLength({ min: 3 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['admin', 'teacher', 'student']),
    body('first_name').optional().isLength({ min: 1 }).trim(),
    body('last_name').optional().isLength({ min: 1 }).trim(),
    body('is_active').optional().isBoolean()
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
        const { username, email, role, first_name, last_name, is_active } = req.body;

        // Check if user exists
        const existingUser = await req.db.get('SELECT id FROM users WHERE id = ?', [id]);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check for duplicate username/email (excluding current user)
        if (username || email) {
            const duplicateCheck = await req.db.get(
                'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
                [username || '', email || '', id]
            );
            if (duplicateCheck) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
        }

        // Build update query dynamically
        const updates = [];
        const params = [];
        
        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (first_name) {
            updates.push('first_name = ?');
            params.push(first_name);
        }
        if (last_name) {
            updates.push('last_name = ?');
            params.push(last_name);
        }
        if (typeof is_active === 'boolean') {
            updates.push('is_active = ?');
            params.push(is_active);
            // Reset failed login attempts when reactivating account
            if (is_active) {
                updates.push('failed_login_attempts = 0');
                updates.push('account_locked_until = NULL');
            }
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(id);

        await req.db.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Get updated user
        const updatedUser = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at, updated_at, is_active, failed_login_attempts FROM users WHERE id = ?',
            [id]
        );
        
        res.json({ message: 'User updated successfully', user: updatedUser });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await req.db.get('SELECT id FROM users WHERE id = ?', [id]);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        await req.db.run('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get teachers (Admin only)
router.get('/role/teachers', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const teachers = await req.db.all(
            "SELECT id, username, email, role, first_name, last_name FROM users WHERE role = 'teacher' ORDER BY first_name ASC"
        );
        res.json(teachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

// Get students (Admin only)
router.get('/role/students', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const students = await req.db.all(
            "SELECT id, username, email, role, first_name, last_name FROM users WHERE role = 'student' ORDER BY first_name ASC"
        );
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get students by teacher (for teachers and admins)
router.get('/students/teacher/:teacherId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Get students with their batch information and quiz scores
        const students = await req.db.all(
            `SELECT DISTINCT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.email,
                b.name as batch_name,
                COALESCE(
                  (SUM(CASE WHEN qs.max_score > 0 THEN qs.total_score ELSE 0 END)::numeric / 
                   NULLIF(SUM(CASE WHEN qs.max_score > 0 THEN qs.max_score ELSE 0 END), 0)) * 100,
                  0
                ) as average_score
             FROM users u
             JOIN batch_students bs ON u.id = bs.student_id
             JOIN batches b ON bs.batch_id = b.id
             LEFT JOIN quiz_submissions qs 
                ON u.id = qs.student_id 
                AND qs.status IN ('submitted','auto_submitted','graded')
             WHERE b.teacher_id = ? AND u.role = 'student'
             GROUP BY u.id, u.first_name, u.last_name, u.email, b.name
             ORDER BY u.first_name ASC`,
            [teacherId]
        );

        // Get detailed quiz scores for each student
        const studentsWithScores = await Promise.all(students.map(async (student) => {
            const quizScoresRaw = await req.db.all(
                `SELECT 
                    q.title as quiz_title,
                    qs.total_score as score,
                    qs.max_score,
                    qs.submitted_at
                 FROM quiz_submissions qs
                 JOIN quizzes q ON qs.quiz_id = q.id
                 JOIN quiz_batches qb ON q.id = qb.quiz_id
                 JOIN batches b ON qb.batch_id = b.id
                 WHERE qs.student_id = ? AND b.teacher_id = ? AND qs.status IN ('submitted','auto_submitted','graded')
                 ORDER BY qs.submitted_at DESC`,
                [student.id, teacherId]
            );

            const quizScores = (quizScoresRaw || []).map(s => ({
                ...s,
                // Coerce numeric fields that may arrive as strings from Postgres
                score: s.score != null ? Number(s.score) : null,
                max_score: s.max_score != null ? Number(s.max_score) : null,
            }));

            return {
                ...student,
                // Ensure average_score is numeric
                average_score: Number(student.average_score || 0),
                quiz_scores: quizScores
            };
        }));

        res.json(studentsWithScores);
    } catch (error) {
        console.error('Get teacher students error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher students' });
    }
});

// Admin reset user password
router.put('/:id/reset-password', [
    authenticateToken,
    adminOnlyMw,
    // newPassword no longer accepted; password will be auto-generated
    body('mustChange').optional().isBoolean(),
    body('sendEmail').optional().isBoolean()
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
        const mustChange = ('mustChange' in req.body) ? !!req.body.mustChange : true;
        // Always send email with a generated temp password per new requirement
        const sendEmail = true;

        // Check if user exists
        const user = await req.db.get('SELECT id, email, username FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Always generate a temp password (exactly 10 chars, mixed letters and digits)
        const newPassword = generateTempPassword(10);

        // Hash the new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password in database
        await req.db.run(
            "UPDATE users SET password_hash = ?, must_change_password = ?, password_changed_at = CURRENT_TIMESTAMP, password_expires_at = NOW() + INTERVAL '90 days', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newPasswordHash, mustChange ? 1 : 0, id]
        );

        // Email the user
        try {
            await sendAdminPasswordReset({ to: user.email, username: user.username || user.email, tempPassword: newPassword });
        } catch (e) {
            console.error('Failed to send admin reset email to', user.email, e && e.message);
        }

        res.json({ message: 'Password reset successfully', mustChange: !!mustChange, emailed: !!sendEmail });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

module.exports = router;