const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { createBulkNotifications } = require('../services/notificationService');

const router = express.Router();

router.use(express.json({ limit: '16kb' }));
router.use((err, _req, res, next) => {
    if (err) return res.status(400).json({ error: 'Invalid request payload' });
    return next();
});

const getLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 45,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in a few minutes.' },
});

const submitLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 12,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many submission attempts. Please wait a few minutes.' },
});

const TOKEN_RE = /^[A-Za-z0-9_-]{20,128}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function hashToken(raw) {
    return crypto.createHash('sha256').update(String(raw)).digest('hex');
}

function supportEmail() {
    const raw = process.env.EMAIL_FROM || 'support@learnfrenchwithnatives.com';
    const m = /<([^>]+)>/.exec(raw);
    return m ? m[1] : raw;
}

function isValidTimezone(tz) {
    if (!tz || typeof tz !== 'string' || tz.length > 80) return false;
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz }).format();
        return true;
    } catch {
        return false;
    }
}

function sanitizeSlots(rawSlots) {
    if (!Array.isArray(rawSlots) || rawSlots.length === 0 || rawSlots.length > 5) {
        return null;
    }
    const cleaned = [];
    for (const item of rawSlots) {
        if (!item || typeof item !== 'object') return null;
        const date = String(item.date || '').trim();
        const start = String(item.start || '').trim();
        const end = String(item.end || '').trim();
        if (!DATE_RE.test(date) || !TIME_RE.test(start) || !TIME_RE.test(end)) return null;
        if (end <= start) return null;
        cleaned.push({ date, start, end });
    }
    return cleaned;
}

/**
 * GET /api/public/demo-availability/:token
 * Inspects a single-use availability request without exposing private prospect contact details.
 */
router.get('/:token', getLimiter, async (req, res) => {
    try {
        const raw = String(req.params.token || '').trim();
        const support = supportEmail();
        if (!TOKEN_RE.test(raw)) {
            return res.status(404).json({ status: 'invalid', support_email: support });
        }

        const row = await req.db.get(
            `SELECT dar.id, dar.status, dar.proposed_timezone,
                    dar.proposed_start_date::text AS proposed_start_date,
                    dar.proposed_end_date::text AS proposed_end_date,
                    dar.proposed_time_start, dar.proposed_time_end,
                    dar.proposed_days, dar.admin_note, dar.expires_at, dar.submitted_at,
                    dr.full_name, dr.timezone AS requester_timezone,
                    u.first_name AS admin_first_name, u.last_name AS admin_last_name
             FROM demo_availability_requests dar
             JOIN demo_requests dr ON dr.id = dar.demo_request_id
             LEFT JOIN users u ON u.id = dar.created_by
             WHERE dar.token_hash = $1`,
            [hashToken(raw)]
        );

        if (!row) {
            return res.status(404).json({ status: 'invalid', support_email: support });
        }
        if (row.status === 'submitted') {
            return res.json({ status: 'submitted', submitted_at: row.submitted_at, support_email: support });
        }
        if (row.status === 'superseded') {
            return res.json({ status: 'superseded', support_email: support });
        }
        if (row.status === 'expired' || new Date(row.expires_at) <= new Date()) {
            if (row.status === 'pending') {
                await req.db.run(
                    `UPDATE demo_availability_requests SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'pending'`,
                    [row.id]
                );
            }
            return res.json({ status: 'expired', support_email: support });
        }

        const firstName = String(row.full_name || '').trim().split(/\s+/)[0] || 'there';
        const adminName = `${row.admin_first_name || ''} ${row.admin_last_name || ''}`.trim() || 'Our team';

        return res.json({
            status: 'pending',
            first_name: firstName,
            admin_name: adminName,
            requester_timezone: row.requester_timezone || null,
            proposed_timezone: row.proposed_timezone,
            proposed_start_date: row.proposed_start_date,
            proposed_end_date: row.proposed_end_date,
            proposed_time_start: row.proposed_time_start,
            proposed_time_end: row.proposed_time_end,
            proposed_days: row.proposed_days || null,
            admin_note: row.admin_note || null,
            expires_at: row.expires_at,
            support_email: support,
        });
    } catch (error) {
        console.error('GET /api/public/demo-availability/:token error:', error);
        return res.status(500).json({ error: 'Unable to load availability form' });
    }
});

/**
 * POST /api/public/demo-availability/:token
 * Atomically submits availability ONCE; token immediately becomes non-reusable forever.
 */
router.post('/:token', submitLimiter, async (req, res) => {
    try {
        const raw = String(req.params.token || '').trim();
        const support = supportEmail();
        if (!TOKEN_RE.test(raw)) {
            return res.status(404).json({ status: 'invalid', error: 'Invalid link', support_email: support });
        }

        const tz = String(req.body?.timezone || '').trim();
        if (!isValidTimezone(tz)) {
            return res.status(400).json({ error: 'Please select a valid timezone.' });
        }
        const slots = sanitizeSlots(req.body?.slots);
        if (!slots) {
            return res.status(400).json({ error: 'Please provide 1 to 5 valid date and time windows (end must be after start).' });
        }
        const note = typeof req.body?.note === 'string' ? req.body.note.trim().slice(0, 1000) : null;

        const tokenHash = hashToken(raw);
        // Atomic single-use transition prevents race-condition double submits
        const updated = await req.db.run(
            `UPDATE demo_availability_requests
             SET status = 'submitted',
                 submitted_at = CURRENT_TIMESTAMP,
                 submitted_timezone = $2,
                 submitted_slots = $3::jsonb,
                 submitted_note = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE token_hash = $1
               AND status = 'pending'
               AND expires_at > CURRENT_TIMESTAMP
             RETURNING *`,
            [tokenHash, tz, JSON.stringify(slots), note || null]
        );

        if (!updated.rows || updated.rows.length === 0) {
            const existing = await req.db.get(
                'SELECT status, submitted_at FROM demo_availability_requests WHERE token_hash = $1',
                [tokenHash]
            );
            if (!existing) {
                return res.status(404).json({ status: 'invalid', code: 'INVALID', support_email: support });
            }
            if (existing.status === 'submitted') {
                return res.status(409).json({
                    status: 'submitted',
                    code: 'ALREADY_SUBMITTED',
                    submitted_at: existing.submitted_at,
                    error: 'Availability has already been submitted for this link.',
                    support_email: support,
                });
            }
            return res.status(410).json({
                status: existing.status === 'superseded' ? 'superseded' : 'expired',
                code: 'EXPIRED',
                error: 'This availability link has expired.',
                support_email: support,
            });
        }

        const row = updated.rows[0];
        const demo = await req.db.get(
            'SELECT id, full_name, email FROM demo_requests WHERE id = $1',
            [row.demo_request_id]
        );

        await req.db.run(
            'UPDATE demo_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [row.demo_request_id]
        ).catch(() => {});

        // Notify active admins in-app + Socket.IO so they can schedule right away
        try {
            const admins = await req.db.all("SELECT id FROM users WHERE role = 'admin' AND is_active = true");
            const firstSlot = slots[0];
            const summaryTxt = `${firstSlot.date} ${firstSlot.start}–${firstSlot.end} (${tz})`;
            if (admins.length > 0) {
                await createBulkNotifications(req.db, admins.map(a => a.id), {
                    type: 'demo_availability',
                    title: `Availability received: ${demo?.full_name || 'Prospect'}`,
                    message: `${demo?.full_name || 'A prospect'} submitted availability (${summaryTxt}). Ready to schedule!`,
                    link: '/app/demo-requests',
                    entity_type: 'demo_request',
                    entity_id: row.demo_request_id,
                });
            }
            if (req.io) {
                const payload = {
                    demoRequestId: row.demo_request_id,
                    availabilityId: row.id,
                    fullName: demo?.full_name || null,
                    submittedSlots: slots,
                    submittedTimezone: tz,
                    submittedAt: row.submitted_at,
                };
                req.io.to('role:admin').emit('demo:availability-submitted', payload);
                admins.forEach(a => req.io.to(`user:${a.id}`).emit('demo:availability-submitted', payload));
            }
        } catch (notifyErr) {
            console.warn('[demo-availability] admin notification failed:', notifyErr.message);
        }

        return res.json({
            status: 'submitted',
            submitted_at: row.submitted_at,
            support_email: support,
        });
    } catch (error) {
        console.error('POST /api/public/demo-availability/:token error:', error);
        return res.status(500).json({ error: 'Could not save your availability. Please try again.' });
    }
});

module.exports = router;
