const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateToken, hashPassword, verifyPassword, authenticateToken, recordFailedLogin, resetFailedLogins, isAccountLocked } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await req.db.get(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Check if account is locked before attempting login
        const lockStatus = await isAccountLocked(req.db, user.id);
        if (lockStatus.locked) {
            if (lockStatus.reason === 'Account disabled') {
                return res.status(403).json({ 
                    error: 'Account disabled', 
                    message: 'Your account has been disabled. Please contact the administrator.',
                    code: 'ACCOUNT_DISABLED'
                });
            } else if (lockStatus.reason === 'Temporarily locked') {
                const lockUntil = new Date(lockStatus.until);
                return res.status(423).json({ 
                    error: 'Account temporarily locked', 
                    message: `Your account is temporarily locked due to multiple failed login attempts. Please try again after ${lockUntil.toLocaleString()}.`,
                    code: 'ACCOUNT_LOCKED',
                    locked_until: lockStatus.until,
                    failed_attempts: lockStatus.attempts
                });
            }
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            // Record failed login attempt
            const { attempts, lockUntil } = await recordFailedLogin(req.db, user.id);
            
            let errorResponse = { 
                error: 'Invalid credentials',
                message: 'Email or password is incorrect',
                failed_attempts: attempts
            };

            if (lockUntil) {
                errorResponse.code = 'ACCOUNT_LOCKED';
                errorResponse.message = `Too many failed login attempts. Your account has been temporarily locked until ${lockUntil.toLocaleString()}.`;
                errorResponse.locked_until = lockUntil.toISOString();
                return res.status(423).json(errorResponse);
            }

            return res.status(401).json(errorResponse);
        }

        // Successful login - reset failed attempts
        await resetFailedLogins(req.db, user.id);

        // Generate JWT token
        const token = generateToken(user.id, user.role);

        // Return user data (without password) and token
        const { password_hash, ...userWithoutPassword } = user;
        // Compute force_password_change flag
        const mustChange = !!user.must_change_password;
        const expired = user.password_expires_at ? (new Date(user.password_expires_at) <= new Date()) : false;
        userWithoutPassword.force_password_change = mustChange || expired;
        
        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Change password
router.put('/change-password', [
    authenticateToken,
    body('currentPassword').isLength({ min: 6 }),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get current user with password
        const user = await req.db.get(
            'SELECT password_hash FROM users WHERE id = ?',
            [userId]
        );

        // Verify current password
        const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password in database
        await req.db.run(
            "UPDATE users SET password_hash = ?, must_change_password = 0, password_changed_at = CURRENT_TIMESTAMP, password_expires_at = NOW() + INTERVAL '90 days', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newPasswordHash, userId]
        );

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Update current user profile (role-aware)
router.put('/profile', [
    authenticateToken,
    // Optional validations; enforced based on role below
    body('first_name').optional().isLength({ min: 1 }).trim(),
    body('last_name').optional().isLength({ min: 1 }).trim(),
    body('username').optional().isLength({ min: 3 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const userId = req.user.id;
        const role = req.user.role;

        // Determine allowed fields
        const allowedForAll = ['first_name', 'last_name', 'username'];
        const allowedForAdmin = [...allowedForAll, 'email'];
        const allowed = role === 'admin' ? allowedForAdmin : allowedForAll;

        // Build update set dynamically from request body but only for allowed fields
        const updates = [];
        const params = [];

        for (const key of allowed) {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                updates.push(`${key} = ?`);
                params.push(req.body[key]);
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields provided to update' });
        }

        // Uniqueness checks
        if (req.body.username) {
            const existingUsername = await req.db.get(
                'SELECT id FROM users WHERE username = ? AND id != ?',
                [req.body.username, userId]
            );
            if (existingUsername) {
                return res.status(400).json({ error: 'Username already in use' });
            }
        }
        if (role === 'admin' && req.body.email) {
            const existingEmail = await req.db.get(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [req.body.email, userId]
            );
            if (existingEmail) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }

        // Execute update
        const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        params.push(userId);
        await req.db.run(sql, params);

        // Fetch updated user
        const updatedUser = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
    res.json({ 
        valid: true, 
        user: req.user 
    });
});

module.exports = router;