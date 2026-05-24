const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// ============================================================
// GET /api/notifications
// Returns the latest 15 (or `limit`, capped at 50) notifications
// for the authenticated user, plus the current unread count.
// ============================================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);
        const userId = req.user.id;

        const items = await req.db.all(
            `SELECT id, type, title, message, link, entity_type, entity_id,
                    is_read, created_at, read_at
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [userId, limit]
        );

        const unreadRow = await req.db.get(
            `SELECT COUNT(*)::int AS unread
             FROM notifications
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        res.json({
            items,
            unread_count: unreadRow?.unread || 0,
        });
    } catch (err) {
        console.error('[GET /notifications]', err);
        res.status(500).json({ error: 'Failed to load notifications' });
    }
});

// ============================================================
// PATCH /api/notifications/:id/read
// Mark a single notification as read. Returns the new unread count.
// ============================================================
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await req.db.run(
            `UPDATE notifications
             SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2 AND is_read = FALSE`,
            [id, userId]
        );
        const unreadRow = await req.db.get(
            `SELECT COUNT(*)::int AS unread
             FROM notifications
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        res.json({ ok: true, unread_count: unreadRow?.unread || 0 });
    } catch (err) {
        console.error('[PATCH /notifications/:id/read]', err);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// ============================================================
// POST /api/notifications/mark-all-read
// Mark every unread notification for the user as read.
// ============================================================
router.post('/mark-all-read', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await req.db.run(
            `UPDATE notifications
             SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        res.json({ ok: true, unread_count: 0 });
    } catch (err) {
        console.error('[POST /notifications/mark-all-read]', err);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

module.exports = router;
