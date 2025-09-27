const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Build admin-only middleware
const adminOnlyMw = authorizeRoles('admin');

// New defaults and helpers for settings management
const DEFAULT_SETTINGS = {
    code_length: '6',
    code_expiry_minutes: '30',
    early_start_minutes: '5',
    late_join_minutes: '10',
    auto_end_minutes: '0',
    require_code_for_attendance: 'false'
};

async function ensureDefaultSettings(db) {
    for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
        const exists = await db.get('SELECT id FROM attendance_settings WHERE setting_key = ?', [key]);
        if (!exists) {
            await db.run(
                `INSERT INTO attendance_settings (setting_key, setting_value, description, created_at, updated_at)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [key, val, `Default setting for ${key}`]
            );
        }
    }
}

function parseSettingValue(key, value) {
    if (key === 'require_code_for_attendance') {
        return value === true || value === 'true';
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : value;
}

function toStorageValue(key, value) {
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
}

// GET /api/settings - Get all attendance settings (admin only)
router.get('/', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const db = req.db;
        await ensureDefaultSettings(db);
        // Fetch all settings from attendance_settings table
        const settings = await db.all(`
            SELECT id, setting_key, setting_value, description, created_at, updated_at 
            FROM attendance_settings 
            ORDER BY setting_key
        `);
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
    }
});

// PUT /api/settings/bulk - Bulk upsert settings by key (admin only)
router.put('/bulk', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const db = req.db;
        const updates = req.body && typeof req.body === 'object' ? req.body : {};
        await db.run('BEGIN');
        for (const [key, value] of Object.entries(updates)) {
            const storageVal = toStorageValue(key, value);
            const existing = await db.get('SELECT id FROM attendance_settings WHERE setting_key = ?', [key]);
            if (existing) {
                await db.run(
                    `UPDATE attendance_settings 
                     SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE setting_key = ?`,
                    [storageVal, key]
                );
            } else {
                await db.run(
                    `INSERT INTO attendance_settings (setting_key, setting_value, description, created_at, updated_at)
                     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [key, storageVal, `Setting for ${key}`]
                );
            }
        }
        await db.run('COMMIT');
        const refreshed = await db.all(`
            SELECT id, setting_key, setting_value, description, created_at, updated_at 
            FROM attendance_settings ORDER BY setting_key
        `);
        res.json({ success: true, message: 'Settings updated successfully', data: refreshed });
    } catch (error) {
        try { await req.db.run('ROLLBACK'); } catch {}
        console.error('Error bulk updating settings:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
    }
});

// PUT /api/settings/:id - Update a specific setting (admin only)
router.put('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const { setting_value } = req.body;
        if (!('setting_value' in req.body)) {
            return res.status(400).json({ success: false, message: 'setting_value is required' });
        }
        const db = req.db;
        const existingSetting = await db.get('SELECT * FROM attendance_settings WHERE id = ?', [id]);
        if (!existingSetting) {
            return res.status(404).json({ success: false, message: 'Setting not found' });
        }
        await db.run(
            `UPDATE attendance_settings 
             SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [toStorageValue(existingSetting.setting_key, setting_value), id]
        );
        const updatedSetting = await db.get(
            'SELECT id, setting_key, setting_value, description, created_at, updated_at FROM attendance_settings WHERE id = ?',
            [id]
        );
        res.json({ success: true, message: 'Setting updated successfully', data: updatedSetting });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ success: false, message: 'Failed to update setting', error: error.message });
    }
});

// PUT /api/settings/key/:key - Upsert a setting by key (admin only)
router.put('/key/:key', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { key } = req.params;
        const { setting_value } = req.body;
        if (!('setting_value' in req.body)) {
            return res.status(400).json({ success: false, message: 'setting_value is required' });
        }
        const db = req.db;
        const existingSetting = await db.get('SELECT * FROM attendance_settings WHERE setting_key = ?', [key]);
        const storageVal = toStorageValue(key, setting_value);
        if (existingSetting) {
            await db.run(
                `UPDATE attendance_settings 
                 SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE setting_key = ?`,
                [storageVal, key]
            );
        } else {
            await db.run(
                `INSERT INTO attendance_settings (setting_key, setting_value, description, created_at, updated_at)
                 VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [key, storageVal, `Setting for ${key}`]
            );
        }
        const updatedSetting = await db.get(
            'SELECT id, setting_key, setting_value, description, created_at, updated_at FROM attendance_settings WHERE setting_key = ?',
            [key]
        );
        res.json({ success: true, message: 'Setting updated successfully', data: updatedSetting });
    } catch (error) {
        console.error('Error upserting setting:', error);
        res.status(500).json({ success: false, message: 'Failed to update setting', error: error.message });
    }
});

// GET /api/settings/formatted - Get settings in key-value format (admin only)
router.get('/formatted', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const db = req.db;
        await ensureDefaultSettings(db);
        const settings = await db.all('SELECT setting_key, setting_value FROM attendance_settings');
        const formattedSettings = {};
        settings.forEach(setting => {
            formattedSettings[setting.setting_key] = parseSettingValue(setting.setting_key, setting.setting_value);
        });
        res.json({ success: true, data: formattedSettings });
    } catch (error) {
        console.error('Error fetching formatted settings:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings', error: error.message });
    }
});

module.exports = router;