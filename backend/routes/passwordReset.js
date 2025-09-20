const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { hashPassword } = require('../middleware/auth');
const { sendPasswordResetOTP, sendPasswordResetSuccess } = require('../emails/emailService');

const router = express.Router();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// Request password reset: always respond success to avoid user enumeration
router.post('/request', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { email } = req.body || {};
  try {
    const db = req.db;

    const user = await db.get('SELECT id, username, first_name, email FROM users WHERE email = ?', [email]);
    // Always compute a generic expiry for UI countdown; this must not reveal account existence
    const expiresAt = addMinutes(new Date(), 10).toISOString();
 
     // Always respond with success, even if user not found
    if (!user) {
      return res.json({ success: true, expiresAt, attemptsLeft: 3 });
    }
 
     // Invalidate previous pending/otp_verified requests for this user
    await db.run("UPDATE password_reset_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status IN ('pending','otp_verified')", [user.id]);

    const code = generateCode();

    const insert = await db.run(
      `INSERT INTO password_reset_requests (user_id, email, code, attempts, max_attempts, status, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, 0, 3, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [user.id, user.email, code, expiresAt]
    );

    // Send email with OTP
    await sendPasswordResetOTP({
      to: user.email,
      username: user.username || user.first_name || 'there',
      code
    });

    return res.json({ success: true, expiresAt, attemptsLeft: 3 });
   } catch (error) {
     console.error('Password reset request error:', error);
     return res.status(500).json({ error: 'Internal server error' });
   }
});

// Verify OTP code and issue a short-lived reset token
router.post('/verify', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 4 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { email, code } = req.body || {};
  try {
    const db = req.db;

    const user = await db.get('SELECT id, username, first_name FROM users WHERE email = ?', [email]);
    if (!user) {
      // Obscure existence
      return res.status(400).json({ error: 'Invalid code' });
    }

    const request = await db.get(
      `SELECT * FROM password_reset_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    if (!request) return res.status(404).json({ error: 'No pending request' });
    // Do not reveal whether a request exists for this email; use a generic error
    if (!request) return res.status(400).json({ error: 'Invalid code' });
 
     const now = new Date();
    if (new Date(request.expires_at) < now) {
      await db.run("UPDATE password_reset_requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      // Keep error generic to avoid leaking request lifecycle details
      return res.status(400).json({ error: 'Invalid code' });
    }

    if (request.attempts >= request.max_attempts) {
      await db.run("UPDATE password_reset_requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      // Return generic error to avoid email enumeration via response differences
      return res.status(400).json({ error: 'Invalid code' });
    }
 
    if (String(request.code) !== String(code).replace(/\D/g,'').slice(0,6)) {
      await db.run("UPDATE password_reset_requests SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      // Do not return attemptsLeft to avoid enumeration via response body differences
      return res.status(400).json({ error: 'Invalid code' });
    }

    // Generate reset token and store hash with short expiry (e.g., 15 minutes)
    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const resetExpiry = addMinutes(new Date(), 15).toISOString();

    await db.run(
      `UPDATE password_reset_requests SET status = 'otp_verified', reset_token_hash = ?, reset_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [tokenHash, resetExpiry, request.id]
    );

    return res.json({ success: true, token, resetExpiresAt: resetExpiry });
  } catch (error) {
    console.error('Password reset verify error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete password reset with token
router.post('/reset', [
  body('email').isEmail().normalizeEmail(),
  body('token').isString().isLength({ min: 10 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { email, token, newPassword } = req.body || {};
  try {
    const db = req.db;

    const user = await db.get('SELECT id, username, first_name FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid token' });

    const request = await db.get(
      `SELECT * FROM password_reset_requests WHERE user_id = ? AND status = 'otp_verified' ORDER BY updated_at DESC LIMIT 1`,
      [user.id]
    );

    if (!request || !request.reset_token_hash) return res.status(400).json({ error: 'Invalid token' });

    const now = new Date();
    if (!request.reset_expires_at || new Date(request.reset_expires_at) < now) {
      await db.run("UPDATE password_reset_requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      return res.status(410).json({ error: 'Token expired' });
    }

    const tokenMatch = await bcrypt.compare(token, request.reset_token_hash);
    if (!tokenMatch) return res.status(400).json({ error: 'Invalid token' });

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update user password
    await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPasswordHash, user.id]);

    // Mark request completed and clear token hash
    await db.run("UPDATE password_reset_requests SET status = 'completed', reset_token_hash = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);

    // Send success notification
    await sendPasswordResetSuccess({ to: email, username: user.username || user.first_name || 'there' });

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset complete error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;