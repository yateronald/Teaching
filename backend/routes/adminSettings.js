const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const adminOnly = authorizeRoles('admin');

// GET /api/admin/settings - list all settings
router.get('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    const rows = await req.db.all(
      'SELECT id, setting_key, setting_value, description, created_at, updated_at FROM attendance_settings ORDER BY id ASC'
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /admin/settings error', e);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings - update one or multiple settings (upsert)
router.put('/', authenticateToken, adminOnly, async (req, res) => {
  try {
    let items = [];
    const allowedKeys = new Set([
      'code_length',
      'code_expiry_minutes',
      'early_start_minutes',
      'late_join_minutes',
      'auto_end_minutes',
      'require_code_for_attendance'
    ]);

    // Accept multiple input formats
    const payload = req.body?.settings ?? req.body?.settingsObj ?? null;
    if (Array.isArray(payload)) {
      items = payload;
    } else if (payload && typeof payload === 'object') {
      items = Object.entries(payload).map(([k, v]) => ({ setting_key: k, setting_value: v }));
    } else if (req.body?.setting_key) {
      items = [{ setting_key: req.body.setting_key, setting_value: req.body.setting_value, description: req.body.description }];
    } else if (typeof req.body === 'object' && req.body) {
      // Allow plain object mapping
      items = Object.entries(req.body).map(([k, v]) => ({ setting_key: k, setting_value: v }));
    }

    if (!items.length) {
      return res.status(400).json({ error: 'No settings provided' });
    }

    const normalized = items.map((it) => {
      const key = String(it.setting_key);
      if (!allowedKeys.has(key)) return null; // silently skip unsupported keys
      let value = it.setting_value;

      if ([
        'code_length',
        'code_expiry_minutes',
        'early_start_minutes',
        'late_join_minutes',
        'auto_end_minutes'
      ].includes(key)) {
        const num = Number(value);
        if (!Number.isFinite(num) || num < 0) {
          throw new Error(`Invalid value for ${key}`);
        }
        value = String(Math.floor(num));
      } else if (key === 'require_code_for_attendance') {
        const b = typeof value === 'string' ? value.toLowerCase() === 'true' : !!value;
        value = b ? 'true' : 'false';
      } else {
        value = String(value ?? '');
      }

      return { setting_key: key, setting_value: value, description: it.description ?? null };
    }).filter(Boolean);

    for (const s of normalized) {
      await req.db.run(
        `
        INSERT INTO attendance_settings (setting_key, setting_value, description)
        VALUES (?, ?, ?)
        ON CONFLICT (setting_key)
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          description = COALESCE(EXCLUDED.description, attendance_settings.description),
          updated_at = CURRENT_TIMESTAMP
        `,
        [s.setting_key, s.setting_value, s.description]
      );
    }

    const rows = await req.db.all(
      'SELECT id, setting_key, setting_value, description, created_at, updated_at FROM attendance_settings ORDER BY id ASC'
    );
    res.json({ success: true, settings: rows });
  } catch (e) {
    console.error('PUT /admin/settings error', e);
    res.status(400).json({ error: e.message || 'Failed to update settings' });
  }
});

module.exports = router;