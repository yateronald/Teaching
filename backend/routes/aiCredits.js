const express = require('express');
const { authenticateToken, adminOnly } = require('../middleware/auth');
const aiCredits = require('../services/aiCreditService');

const router = express.Router();

// GET /api/ai-credits/me — current student's balance
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const balance = await aiCredits.getBalance(req.db, req.user.id);
    res.json(balance);
  } catch (err) {
    console.error('[GET /ai-credits/me]', err);
    res.status(500).json({ error: 'Failed to load credits' });
  }
});

// GET /api/ai-credits/me/transactions — current student's recent transactions
router.get('/me/transactions', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const items = await aiCredits.getRecentTransactions(req.db, req.user.id, limit);
    res.json({ items });
  } catch (err) {
    console.error('[GET /ai-credits/me/transactions]', err);
    res.status(500).json({ error: 'Failed to load transactions' });
  }
});

// GET /api/ai-credits/users/:id — admin: any user's balance
router.get('/users/:id', authenticateToken, adminOnly, async (req, res) => {
  try {
    const balance = await aiCredits.getBalance(req.db, parseInt(req.params.id));
    res.json(balance);
  } catch (err) {
    console.error('[GET /ai-credits/users/:id]', err);
    res.status(500).json({ error: 'Failed to load credits' });
  }
});

// POST /api/ai-credits/grant — admin: grant credits to a single user
router.post('/grant', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { user_id, type, amount, notes } = req.body;
    if (!user_id || !type || !amount) return res.status(400).json({ error: 'user_id, type, amount required' });
    await aiCredits.grantCredits(req.db, parseInt(user_id), type, parseInt(amount), {
      reason: 'admin_grant',
      actor_id: req.user.id,
      notes: notes || null,
    });
    const balance = await aiCredits.getBalance(req.db, parseInt(user_id));
    res.json({ ok: true, balance });
  } catch (err) {
    console.error('[POST /ai-credits/grant]', err);
    res.status(500).json({ error: err.message || 'Failed to grant credits' });
  }
});

// POST /api/ai-credits/bulk-grant — admin: grant EE+EO credits to multiple students/batches
router.post('/bulk-grant', authenticateToken, adminOnly, async (req, res) => {
  try {
    const { student_ids = [], batch_ids = [], ee_credits = 0, eo_credits = 0, notes } = req.body;
    const ee = Math.max(0, parseInt(ee_credits) || 0);
    const eo = Math.max(0, parseInt(eo_credits) || 0);
    if (ee === 0 && eo === 0) {
      return res.status(400).json({ error: 'Provide at least one credit amount (ee_credits or eo_credits) > 0' });
    }
    if ((!Array.isArray(student_ids) || student_ids.length === 0)
        && (!Array.isArray(batch_ids) || batch_ids.length === 0)) {
      return res.status(400).json({ error: 'Select at least one student or batch' });
    }

    // Collect all student ids (direct + via batches), deduped
    const direct = (student_ids || []).map(Number).filter(Boolean);
    const batches = (batch_ids || []).map(Number).filter(Boolean);
    let allIds = [...direct];
    if (batches.length > 0) {
      const placeholders = batches.map((_, i) => `$${i + 1}`).join(',');
      const rows = await req.db.all(
        `SELECT DISTINCT student_id FROM batch_students WHERE batch_id IN (${placeholders})`,
        batches
      );
      allIds.push(...rows.map(r => r.student_id));
    }
    allIds = Array.from(new Set(allIds.filter(Boolean)));

    if (allIds.length === 0) {
      return res.status(400).json({ error: 'No valid recipients found' });
    }

    const granted = await aiCredits.bulkGrant(req.db, allIds, ee, eo, {
      reason: 'admin_grant',
      actor_id: req.user.id,
      related_entity_type: 'admin_bulk_grant',
      notes: notes || null,
    });

    res.json({
      ok: true,
      recipients_count: granted,
      ee_per_recipient: ee,
      eo_per_recipient: eo,
    });
  } catch (err) {
    console.error('[POST /ai-credits/bulk-grant]', err);
    res.status(500).json({ error: err.message || 'Failed to grant credits' });
  }
});

module.exports = router;
