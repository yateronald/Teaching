const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Build admin-only middleware
const adminOnlyMw = authorizeRoles('admin');

// GET /api/settings - Get all attendance settings (admin only)
router.get('/', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const db = req.db;
        
        // Fetch all settings from attendance_settings table
        const settings = await db.all(`
            SELECT id, setting_key, setting_value, description, created_at, updated_at 
            FROM attendance_settings 
            ORDER BY setting_key
        `);
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message
        });
    }
});

// PUT /api/settings/:id - Update a specific setting (admin only)
router.put('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const { setting_value } = req.body;
        
        if (!setting_value && setting_value !== '') {
            return res.status(400).json({
                success: false,
                message: 'setting_value is required'
            });
        }
        
        const db = req.db;
        
        // Check if setting exists
        const existingSetting = await db.get(
            'SELECT * FROM attendance_settings WHERE id = ?',
            [id]
        );
        
        if (!existingSetting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }
        
        // Update the setting
        await db.run(`
            UPDATE attendance_settings 
            SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [setting_value, id]);
        
        // Fetch the updated setting
        const updatedSetting = await db.get(
            'SELECT id, setting_key, setting_value, description, created_at, updated_at FROM attendance_settings WHERE id = ?',
            [id]
        );
        
        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: updatedSetting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update setting',
            error: error.message
        });
    }
});

// PUT /api/settings/key/:key - Update a setting by key (admin only)
router.put('/key/:key', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { key } = req.params;
        const { setting_value } = req.body;
        
        if (!setting_value && setting_value !== '') {
            return res.status(400).json({
                success: false,
                message: 'setting_value is required'
            });
        }
        
        const db = req.db;
        
        // Check if setting exists
        const existingSetting = await db.get(
            'SELECT * FROM attendance_settings WHERE setting_key = ?',
            [key]
        );
        
        if (!existingSetting) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }
        
        // Update the setting
        await db.run(`
            UPDATE attendance_settings 
            SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE setting_key = ?
        `, [setting_value, key]);
        
        // Fetch the updated setting
        const updatedSetting = await db.get(
            'SELECT id, setting_key, setting_value, description, created_at, updated_at FROM attendance_settings WHERE setting_key = ?',
            [key]
        );
        
        res.json({
            success: true,
            message: 'Setting updated successfully',
            data: updatedSetting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update setting',
            error: error.message
        });
    }
});

// GET /api/settings/formatted - Get settings in key-value format (admin only)
router.get('/formatted', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const db = req.db;
        
        // Fetch all settings and format as key-value pairs
        const settings = await db.all('SELECT setting_key, setting_value FROM attendance_settings');
        const formattedSettings = {};
        
        settings.forEach(setting => {
            formattedSettings[setting.setting_key] = setting.setting_value;
        });
        
        res.json({
            success: true,
            data: formattedSettings
        });
    } catch (error) {
        console.error('Error fetching formatted settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message
        });
    }
});

module.exports = router;