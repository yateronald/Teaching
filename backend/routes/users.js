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
        let sql = 'SELECT id, username, email, role, first_name, last_name, created_at FROM users';
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
            'SELECT id, username, email, role, first_name, last_name, created_at FROM users WHERE id = ?',
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
    body('last_name').isLength({ min: 1 }).trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { username, email, role, first_name, last_name } = req.body;

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
            "INSERT INTO users (username, email, password_hash, role, first_name, last_name, must_change_password, password_expires_at) VALUES (?, ?, ?, ?, ?, ?, 1, DATETIME('now', '+90 days'))",
            [username, email, passwordHash, role, first_name, last_name]
        );

        const userId = result.lastID;

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
    body('last_name').optional().isLength({ min: 1 }).trim()
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
        const { username, email, role, first_name, last_name } = req.body;

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
            'SELECT id, username, email, role, first_name, last_name, created_at, updated_at FROM users WHERE id = ?',
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

        const students = await req.db.all(
            `SELECT u.id, u.username, u.email, u.role, u.first_name, u.last_name, u.created_at
             FROM users u
             JOIN teacher_students ts ON u.id = ts.student_id
             WHERE ts.teacher_id = ?
             ORDER BY u.first_name ASC`,
            [teacherId]
        );

        res.json(students);
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
            "UPDATE users SET password_hash = ?, must_change_password = ?, password_changed_at = CURRENT_TIMESTAMP, password_expires_at = DATETIME('now', '+90 days'), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
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