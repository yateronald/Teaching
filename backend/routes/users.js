const express = require('express');
const { body, validationResult } = require('express-validator');
const { hashPassword, authenticateToken, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, adminOnly, async (req, res) => {
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
router.get('/:id', authenticateToken, adminOnly, async (req, res) => {
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
    adminOnly,
    body('username').isLength({ min: 3 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
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

        const { username, email, password, role, first_name, last_name } = req.body;

        // Check if username or email already exists
        const existingUser = await req.db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const result = await req.db.run(
            'INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
            [username, email, passwordHash, role, first_name, last_name]
        );

        // Get created user (without password)
        const newUser = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at FROM users WHERE id = ?',
            [result.id]
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
    adminOnly,
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

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user exists
        const user = await req.db.get('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        await req.db.run('DELETE FROM users WHERE id = ?', [id]);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get teachers (for batch assignment)
router.get('/role/teachers', authenticateToken, adminOnly, async (req, res) => {
    try {
        const teachers = await req.db.all(
            'SELECT id, username, first_name, last_name, email FROM users WHERE role = "teacher" ORDER BY first_name, last_name',
            []
        );
        res.json(teachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

// Get students (for batch assignment)
router.get('/role/students', authenticateToken, adminOnly, async (req, res) => {
    try {
        const students = await req.db.all(
            'SELECT id, username, first_name, last_name, email FROM users WHERE role = "student" ORDER BY first_name, last_name',
            []
        );
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

module.exports = router;