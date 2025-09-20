const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sendEmailChangeVerification, sendEmailChangeNotifications } = require('../emails/emailService');

// Utils
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// Request email change: create OTP and send to new email
router.post('/request', authenticateToken, async (req, res) => {
  const { newEmail } = req.body || {};
  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return res.status(400).json({ error: 'Valid newEmail is required' });
  }

  try {
    const db = req.db;

    // Ensure new email is not already used by another user
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [newEmail]);
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Invalidate previous pending requests for this user
    await db.run("UPDATE email_change_requests SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND status = 'pending'", [req.user.id]);

    const code = generateCode();
    const expiresAt = addMinutes(new Date(), 10).toISOString();

    const insert = await db.run(
      `INSERT INTO email_change_requests (user_id, old_email, new_email, code, attempts, max_attempts, status, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 3, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [req.user.id, req.user.email, newEmail, code, expiresAt]
    );

    // Send verification email to the new email address
    await sendEmailChangeVerification({
      to: newEmail,
      username: req.user.username || req.user.first_name || 'there',
      oldEmail: req.user.email,
      newEmail,
      code
    });

    return res.json({ success: true, requestId: insert.id, expiresAt, attemptsLeft: 3 });
  } catch (error) {
    console.error('Email change request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify code and apply change
router.post('/verify', authenticateToken, async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'Code is required' });

  try {
    const db = req.db;

    const request = await db.get(
      `SELECT * FROM email_change_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!request) return res.status(404).json({ error: 'No pending request' });

    // Check expiry
    const now = new Date();
    if (new Date(request.expires_at) < now) {
      await db.run("UPDATE email_change_requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      return res.status(410).json({ error: 'Code expired' });
    }

    // Check attempts
    if (request.attempts >= request.max_attempts) {
      await db.run("UPDATE email_change_requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      return res.status(429).json({ error: 'Maximum attempts reached. Please request a new code.' });
    }

    if (String(request.code) !== String(code).replace(/\D/g,'').slice(0,6)) {
      await db.run("UPDATE email_change_requests SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);
      const updated = await db.get('SELECT attempts, max_attempts FROM email_change_requests WHERE id = ?', [request.id]);
      const attemptsLeft = Math.max(0, (updated.max_attempts - updated.attempts));
      return res.status(400).json({ error: 'Invalid code', attemptsLeft });
    }

    // Apply email change in users table within a transaction-like sequence
    await db.run('UPDATE users SET email = ? WHERE id = ?', [request.new_email, req.user.id]);

    // Mark request completed
    await db.run("UPDATE email_change_requests SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [request.id]);

    // Notify both emails
    await sendEmailChangeNotifications({ oldEmail: request.old_email, newEmail: request.new_email, username: req.user.username || req.user.first_name || 'there' });

    // Return updated user to refresh context
    const updatedUser = await db.get('SELECT id, username, email, role, first_name, last_name, created_at FROM users WHERE id = ?', [req.user.id]);

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Email change verify error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend code (after 3 failed attempts allowed to reset and resend)
router.post('/resend', authenticateToken, async (req, res) => {
  try {
    const db = req.db;
    const request = await db.get(
      `SELECT * FROM email_change_requests WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    if (!request) return res.status(404).json({ error: 'No pending request' });

    // If attempts still available and not expired, just regenerate a new code and extend expiry
    const now = new Date();
    const expired = new Date(request.expires_at) < now;

    if (!expired && request.attempts < request.max_attempts) {
      // For security, require attempts>=3 to allow resend? Spec says after three attempts show resend button
      return res.status(400).json({ error: 'Resend not allowed yet. Use remaining attempts first.' });
    }

    const newCode = generateCode();
    const newExpiry = addMinutes(new Date(), 10).toISOString();

    await db.run(
      `UPDATE email_change_requests SET code = ?, attempts = 0, expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newCode, newExpiry, request.id]
    );

    await sendEmailChangeVerification({
      to: request.new_email,
      username: req.user.username || req.user.first_name || 'there',
      oldEmail: request.old_email,
      newEmail: request.new_email,
      code: newCode
    });

    return res.json({ success: true, expiresAt: newExpiry, attemptsLeft: 3 });
  } catch (error) {
    console.error('Email change resend error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;