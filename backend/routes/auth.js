const express = require('express');
const { body, validationResult } = require('express-validator');
const { generateToken, tokenExpiry, hashPassword, verifyPassword, authenticateToken, recordFailedLogin, resetFailedLogins, isAccountLocked } = require('../middleware/auth');
const sessions = require('../services/sessionService');
const { createNotification } = require('../services/notificationService');

const router = express.Router();

/** The user as the client may see them, with the password-change flag resolved. */
function withoutPassword(user) {
    const { password_hash, ...rest } = user;
    const expired = user.password_expires_at ? (new Date(user.password_expires_at) <= new Date()) : false;
    rest.force_password_change = !!user.must_change_password || expired;
    return rest;
}

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

        // Some accounts may only be used on so many devices at a time (exam
        // candidates: two). A further sign-in is refused and shows which devices
        // hold the account, so a shared password simply runs out of room.
        const limit = sessions.limitFor(user.role);
        const tracked = await sessions.ready(req.db);
        let signedOutOthers = 0;
        if (limit !== null && tracked) {
            const live = await sessions.activeSessions(req.db, user.id);
            if (live.length >= limit) {
                const used = await sessions.takeoversToday(req.db, user.id);
                const mayTakeOver = used < sessions.TAKEOVERS_PER_DAY;
                const devices = live.map(s => sessions.publicView(s));

                if (req.body.sign_out_others !== true) {
                    return res.status(403).json({
                        error: 'Device limit reached',
                        message: `This account may be signed in on ${limit} devices at a time, and both are in use. Sign out on one of them, or sign out the other devices from here.`,
                        code: 'SESSION_LIMIT',
                        limit,
                        can_sign_out_others: mayTakeOver,
                        sessions: devices,
                    });
                }
                if (!mayTakeOver) {
                    return res.status(403).json({
                        error: 'Device limit reached',
                        message: 'This account has already signed out its other devices too many times today. Please contact your administrator.',
                        code: 'SESSION_TAKEOVER_BLOCKED',
                        limit,
                        can_sign_out_others: false,
                        sessions: devices,
                    });
                }
                signedOutOthers = await sessions.endAllForUser(req.db, user.id, 'takeover');
            }
        }

        // Generate JWT token
        const jti = tracked ? sessions.newId() : null;
        const token = generateToken(user.id, user.role, jti);
        if (jti) {
            try {
                await sessions.openSession(req.db, { userId: user.id, jti, expiresAt: tokenExpiry(), req, tookOver: signedOutOthers });
            } catch (err) {
                console.error('Session creation failed:', err.message);
                // A capped account must be countable: refuse rather than let an
                // untracked device through. Other roles sign in as before.
                if (limit !== null) return res.status(503).json({ error: 'Sign-in unavailable', message: 'Please try again in a moment.' });
                return res.json({ message: 'Login successful', token: generateToken(user.id, user.role), user: withoutPassword(user) });
            }
        }

        if (signedOutOthers) {
            // Tell the account holder: if someone else is using their password,
            // this is how they find out.
            await createNotification(req.db, {
                user_id: user.id,
                type: 'session_takeover',
                title: 'Your other devices were signed out',
                message: `A new sign-in on ${sessions.describeDevice(req.headers['user-agent'])} signed out ${signedOutOthers === 1 ? 'the other device' : `${signedOutOthers} other devices`} on your account. If this was not you, change your password and tell your administrator.`,
            });
        }

        // Return user data (without password) and token
        res.json({
            message: 'Login successful',
            token,
            user: withoutPassword(user),
            signed_out_others: signedOutOthers || undefined,
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

        // A new password signs out every other device: whoever had the old one
        // loses access immediately.
        const signedOut = await sessions.endAllForUser(req.db, userId, 'password', req.session?.id ?? null)
            .catch(() => 0);

        res.json({ message: 'Password changed successfully', signed_out_devices: signedOut || undefined });

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
    body('timezone').optional().isString().isLength({ max: 64 }),
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

        // Determine allowed fields. Timezone can be updated by any role —
        // it's a personal display preference.
        const allowedForAll = ['first_name', 'last_name', 'username', 'timezone'];
        const allowedForAdmin = [...allowedForAll, 'email'];
        const allowed = role === 'admin' ? allowedForAdmin : allowedForAll;

        // Validate timezone against the IANA catalog if provided
        if (Object.prototype.hasOwnProperty.call(req.body, 'timezone')) {
            const { isValidTimezone } = require('../services/timezoneService');
            if (!isValidTimezone(req.body.timezone)) {
                return res.status(400).json({ error: 'Invalid timezone identifier' });
            }
        }

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
            'SELECT id, username, email, role, first_name, last_name, timezone, created_at, profile_photo_kdrive_file_id FROM users WHERE id = ?',
            [userId]
        );

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Public list of supported timezones (for the profile dropdown).
// Doesn't require authentication — it's a static catalog.
router.get('/timezones', (_req, res) => {
    const { listTimezones } = require('../services/timezoneService');
    res.json({ groups: listTimezones() });
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

// ── Signed-in devices ──────────────────────────────────────────────────────
// Ending a session takes effect at once: its token is refused from then on.

// Sign out this device (frees one of the account's device slots).
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        if (req.session) await sessions.endSessions(req.db, req.session.id, 'logout');
        res.json({ message: 'Signed out' });
    } catch (error) {
        console.error('Logout error:', error);
        // The client clears its token regardless; never leave it stuck signed in.
        res.json({ message: 'Signed out' });
    }
});

// My devices, so I can see and cut off anything I don't recognise.
router.get('/sessions', authenticateToken, async (req, res) => {
    try {
        const live = await sessions.activeSessions(req.db, req.user.id);
        const limit = sessions.limitFor(req.user.role);
        res.json({
            limit,
            idle_minutes: sessions.IDLE_MINUTES,
            sessions: live.map(s => sessions.publicView(s, req.session?.id)),
        });
    } catch (error) {
        console.error('Session list error:', error);
        res.status(500).json({ error: 'Failed to load your devices' });
    }
});

// Sign out one of my other devices.
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid device' });
        const live = await sessions.activeSessions(req.db, req.user.id);
        const target = live.find(s => Number(s.id) === id);
        if (!target) return res.status(404).json({ error: 'That device is already signed out' });
        await sessions.endSessions(req.db, id, 'logout');
        res.json({ message: 'Device signed out', current: Number(req.session?.id) === id });
    } catch (error) {
        console.error('Session revoke error:', error);
        res.status(500).json({ error: 'Failed to sign out that device' });
    }
});

module.exports = router;