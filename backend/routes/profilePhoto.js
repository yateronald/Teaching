const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { authenticateToken } = require('../middleware/auth');
const { getKDriveService } = require('../services/kdriveService');

const router = express.Router();

// Allowed image mime types and max size for profile photos.
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXT = /^(jpe?g|png|webp|gif)$/i;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

// Multer config: temp dir → kDrive → unlink (mirrors resources.js pattern).
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: MAX_PHOTO_SIZE },
    fileFilter: (req, file, cb) => {
        const mimeOk = ALLOWED_MIMES.includes((file.mimetype || '').toLowerCase());
        const ext = path.extname(file.originalname || '').toLowerCase().replace('.', '');
        if (mimeOk && ALLOWED_EXT.test(ext)) return cb(null, true);
        cb(new Error('Only JPG, JPEG, PNG, WEBP, or GIF images are allowed'));
    },
});

/** Helper: best-effort temp file cleanup. */
function cleanTemp(filePath) {
    try {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
        console.warn('profile-photo: temp cleanup failed:', e.message);
    }
}

/** Helper: ensure the shared `Profile_Photos` folder exists on kDrive. */
async function ensureProfilePhotosFolder(kdrive) {
    const folder = await kdrive.getOrCreateFolder(kdrive.rootFolderId, 'Profile_Photos');
    if (!folder) throw new Error('Failed to get/create Profile_Photos folder on kDrive');
    return folder;
}

// ============================================================
// POST /api/auth/profile-photo — Upload current user's photo
// ============================================================
router.post('/profile-photo', authenticateToken, (req, res) => {
    // Wrap multer call manually so file-size / mime errors get readable JSON responses.
    upload.single('photo')(req, res, async (uploadErr) => {
        if (uploadErr) {
            const msg = uploadErr.code === 'LIMIT_FILE_SIZE'
                ? 'Image must be 5MB or less'
                : (uploadErr.message || 'Upload failed');
            return res.status(400).json({ error: msg });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No photo provided (expected field "photo")' });
        }

        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            cleanTemp(req.file.path);
            return res.status(503).json({ error: 'Cloud storage is not configured' });
        }

        const userId = req.user.id;
        const ext = (path.extname(req.file.originalname) || '.jpg').toLowerCase();
        const fileName = `user_${userId}_${Date.now()}${ext}`;

        try {
            // Look up the current photo so we can delete it after a successful upload.
            const existing = await req.db.get(
                'SELECT profile_photo_kdrive_file_id FROM users WHERE id = ?',
                [userId]
            );
            const oldFileId = existing?.profile_photo_kdrive_file_id || null;

            // Make sure the shared folder exists, then upload.
            const folder = await ensureProfilePhotosFolder(kdrive);
            const uploaded = await kdrive.uploadFile(req.file.path, folder.id, fileName);
            if (!uploaded || !uploaded.id) {
                throw new Error('kDrive did not return a file ID');
            }

            // Persist the new file ID before attempting any cleanup.
            await req.db.run(
                'UPDATE users SET profile_photo_kdrive_file_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [uploaded.id, userId]
            );

            // Best-effort: delete the previous photo from kDrive (don't fail the request).
            if (oldFileId && oldFileId !== uploaded.id) {
                try {
                    await kdrive.deleteFile(oldFileId);
                } catch (delErr) {
                    console.warn(`profile-photo: failed to delete old kDrive file ${oldFileId}:`, delErr.message);
                }
            }

            return res.json({
                success: true,
                photoUrl: `/api/auth/profile-photo/${userId}`,
            });
        } catch (err) {
            console.error('profile-photo upload error:', err.response?.data || err.message);
            return res.status(500).json({ error: 'Failed to upload profile photo' });
        } finally {
            cleanTemp(req.file.path);
        }
    });
});

// ============================================================
// GET /api/auth/profile-photo/:userId — Stream the photo
// (Any authenticated user can view another user's photo.)
// ============================================================
router.get('/profile-photo/:userId', authenticateToken, async (req, res) => {
    try {
        const targetId = parseInt(req.params.userId, 10);
        if (!targetId || Number.isNaN(targetId)) {
            return res.status(400).json({ error: 'Invalid user id' });
        }

        const row = await req.db.get(
            'SELECT profile_photo_kdrive_file_id FROM users WHERE id = ?',
            [targetId]
        );
        if (!row || !row.profile_photo_kdrive_file_id) {
            return res.status(404).json({ error: 'No profile photo set' });
        }

        const kdrive = getKDriveService();
        if (!kdrive.isConfigured) {
            return res.status(503).json({ error: 'Cloud storage is not configured' });
        }

        // Encourage browser caching so avatars aren't re-fetched on every render.
        res.setHeader('Cache-Control', 'public, max-age=3600');

        // Forward Range header (kdriveService already handles `range` lowercased).
        await kdrive.streamFile(
            row.profile_photo_kdrive_file_id,
            res,
            { range: req.headers.range },
            'inline',
            `profile_${targetId}`
        );
    } catch (err) {
        console.error('profile-photo stream error:', err.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to load profile photo' });
        }
    }
});

// ============================================================
// DELETE /api/auth/profile-photo — Remove current user's photo
// ============================================================
router.delete('/profile-photo', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const row = await req.db.get(
            'SELECT profile_photo_kdrive_file_id FROM users WHERE id = ?',
            [userId]
        );
        const fileId = row?.profile_photo_kdrive_file_id;

        if (!fileId) {
            // Already cleared — treat as success for idempotency.
            return res.json({ success: true });
        }

        // Best-effort delete on kDrive; we still clear the DB regardless.
        const kdrive = getKDriveService();
        if (kdrive.isConfigured) {
            try {
                await kdrive.deleteFile(fileId);
            } catch (delErr) {
                console.warn(`profile-photo: failed to delete kDrive file ${fileId}:`, delErr.message);
            }
        }

        await req.db.run(
            'UPDATE users SET profile_photo_kdrive_file_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        return res.json({ success: true });
    } catch (err) {
        console.error('profile-photo delete error:', err.message);
        return res.status(500).json({ error: 'Failed to remove profile photo' });
    }
});

module.exports = router;
