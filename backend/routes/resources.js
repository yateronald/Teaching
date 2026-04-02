const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin } = require('../middleware/auth');
const { getKDriveService } = require('../services/kdriveService');

const router = express.Router();

// Use OS temp dir for multer (files are uploaded to kDrive then deleted)
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|mp4|avi|mov|webm|mp3|wav|ogg|m4a|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip/;
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        if (allowed.test(ext)) return cb(null, true);
        cb(new Error('File type not allowed'));
    }
});

/** Helper: detect category from mime type */
function detectCategory(mimeType, fileName) {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    const ext = path.extname(fileName || '').toLowerCase();
    if (['.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt'].includes(ext)) return 'document';
    return 'document';
}

/** Helper: clean up temp file */
function cleanTemp(filePath) {
    try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
}

// ============================================================
// GET /api/resources — List resources (role-filtered)
// ============================================================
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { batch_id, category } = req.query;
        let sql = `
            SELECT r.id, r.title, r.description, r.file_name, r.file_type, r.file_size,
                   r.kdrive_file_id, r.storage_type, r.category, r.created_at, r.updated_at,
                   u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
                   b.name AS batch_name, r.batch_id, r.teacher_id
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN batches b ON r.batch_id = b.id
        `;
        const conditions = [];
        const params = [];
        let idx = 1;

        if (req.user.role === 'teacher') {
            conditions.push(`r.teacher_id = $${idx++}`);
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            conditions.push(`r.batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $${idx++})`);
            params.push(req.user.id);
        }
        if (batch_id) { conditions.push(`r.batch_id = $${idx++}`); params.push(batch_id); }
        if (category && category !== 'all') { conditions.push(`r.category = $${idx++}`); params.push(category); }
        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY r.created_at DESC';

        const resources = await req.db.all(sql, params);
        res.json(resources);
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// ============================================================
// GET /api/resources/batch/:batchId — Resources for a batch
// (Must be before /:id to avoid route conflict)
// ============================================================
router.get('/batch/:batchId', authenticateToken, async (req, res) => {
    try {
        const { batchId } = req.params;
        if (req.user.role === 'teacher') {
            const b = await req.db.get('SELECT id FROM batches WHERE id = $1 AND teacher_id = $2', [batchId, req.user.id]);
            if (!b) return res.status(403).json({ error: 'Access denied' });
        } else if (req.user.role === 'student') {
            const b = await req.db.get('SELECT 1 FROM batch_students WHERE batch_id = $1 AND student_id = $2', [batchId, req.user.id]);
            if (!b) return res.status(403).json({ error: 'Access denied' });
        }
        const resources = await req.db.all(`
            SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name
            FROM resources r LEFT JOIN users u ON r.teacher_id = u.id
            WHERE r.batch_id = $1 ORDER BY r.created_at DESC
        `, [batchId]);
        res.json(resources);
    } catch (error) {
        console.error('Batch resources error:', error);
        res.status(500).json({ error: 'Failed to fetch batch resources' });
    }
});

// ============================================================
// GET /api/resources/:id — Single resource
// ============================================================
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        let sql = `
            SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
                   b.name AS batch_name
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN batches b ON r.batch_id = b.id
            WHERE r.id = $1
        `;
        const params = [req.params.id];
        if (req.user.role === 'teacher') { sql += ' AND r.teacher_id = $2'; params.push(req.user.id); }
        else if (req.user.role === 'student') { sql += ' AND r.batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $2)'; params.push(req.user.id); }

        const resource = await req.db.get(sql, params);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        res.json(resource);
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// ============================================================
// POST /api/resources — Upload resource (Teacher/Admin)
// ============================================================
router.post('/', [
    authenticateToken, teacherOrAdmin, upload.single('file'),
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('batch_id').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { cleanTemp(req.file?.path); return res.status(400).json({ error: 'Validation failed', details: errors.array() }); }
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const { title, description, batch_id } = req.body;
        const teacherId = req.user.role === 'admin' ? (req.body.teacher_id || req.user.id) : req.user.id;
        const category = detectCategory(req.file.mimetype, req.file.originalname);

        // Validate batch access
        if (batch_id) {
            const batchSql = req.user.role === 'teacher'
                ? 'SELECT id, name FROM batches WHERE id = $1 AND teacher_id = $2'
                : 'SELECT id, name FROM batches WHERE id = $1';
            const batchParams = req.user.role === 'teacher' ? [batch_id, req.user.id] : [batch_id];
            const batch = await req.db.get(batchSql, batchParams);
            if (!batch) { cleanTemp(req.file.path); return res.status(400).json({ error: 'Invalid batch' }); }
        }

        // Upload to kDrive
        const kdrive = getKDriveService();
        let kdriveFileId = null;
        let kdriveFolderId = null;
        let storageType = 'local';

        if (kdrive.isConfigured) {
            console.log('📤 kDrive: Uploading file to cloud...');
            try {
                // Get teacher name for folder
                const teacher = await req.db.get('SELECT first_name, last_name FROM users WHERE id = $1', [teacherId]);
                const teacherName = teacher ? `${teacher.first_name}_${teacher.last_name}` : 'Unknown';

                // Get batch name
                let batchName = null;
                if (batch_id) {
                    const batch = await req.db.get('SELECT name FROM batches WHERE id = $1', [batch_id]);
                    batchName = batch?.name;
                }

                // Ensure folder structure: Root / Teacher_X / Batch_Y
                const { batchFolder } = await kdrive.ensureTeacherBatchFolder(teacherId, teacherName, batch_id, batchName);
                kdriveFolderId = batchFolder.id;

                // Upload file
                const kdriveFile = await kdrive.uploadFile(req.file.path, batchFolder.id, req.file.originalname);
                if (kdriveFile) {
                    kdriveFileId = kdriveFile.id;
                    storageType = 'kdrive';
                    console.log(`✅ kDrive: Uploaded "${req.file.originalname}" (id: ${kdriveFile.id})`);
                }
            } catch (kErr) {
                console.error('kDrive upload failed, falling back to local:', kErr.response?.data || kErr.message);
                // Fall back to local storage
            }
        }

        // Save to database
        const result = await req.db.run(`
            INSERT INTO resources (title, description, file_name, file_path, file_type, file_size, teacher_id, batch_id, kdrive_file_id, kdrive_folder_id, storage_type, category)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
        `, [
            title, description || null, req.file.originalname,
            storageType === 'kdrive' ? null : req.file.path,
            req.file.mimetype, req.file.size, teacherId, batch_id || null,
            kdriveFileId, kdriveFolderId, storageType, category
        ]);

        // Clean temp file if uploaded to kDrive
        if (storageType === 'kdrive') cleanTemp(req.file.path);

        const newResource = await req.db.get(`
            SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name, b.name AS batch_name
            FROM resources r LEFT JOIN users u ON r.teacher_id = u.id LEFT JOIN batches b ON r.batch_id = b.id
            WHERE r.id = $1
        `, [result.rows ? result.rows[0].id : result.id]);

        res.status(201).json({ message: 'Resource uploaded successfully', resource: newResource });
    } catch (error) {
        cleanTemp(req.file?.path);
        console.error('Upload resource error:', error);
        res.status(500).json({ error: 'Failed to upload resource' });
    }
});

// ============================================================
// PUT /api/resources/:id — Update metadata (Teacher/Admin)
// ============================================================
router.put('/:id', [
    authenticateToken, teacherOrAdmin,
    body('title').optional().isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('batch_id').optional()
], async (req, res) => {
    try {
        const { id } = req.params;
        const checkSql = req.user.role === 'teacher'
            ? 'SELECT id FROM resources WHERE id = $1 AND teacher_id = $2'
            : 'SELECT id FROM resources WHERE id = $1';
        const checkParams = req.user.role === 'teacher' ? [id, req.user.id] : [id];
        const resource = await req.db.get(checkSql, checkParams);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        const { title, description, batch_id } = req.body;
        const updates = []; const params = []; let idx = 1;
        if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title); }
        if (description !== undefined) { updates.push(`description = $${idx++}`); params.push(description); }
        if (batch_id !== undefined) { updates.push(`batch_id = $${idx++}`); params.push(batch_id || null); }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        if (updates.length <= 1) return res.status(400).json({ error: 'No fields to update' });

        params.push(id);
        await req.db.run(`UPDATE resources SET ${updates.join(', ')} WHERE id = $${idx}`, params);

        const updated = await req.db.get(`
            SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name, b.name AS batch_name
            FROM resources r LEFT JOIN users u ON r.teacher_id = u.id LEFT JOIN batches b ON r.batch_id = b.id
            WHERE r.id = $1
        `, [id]);
        res.json({ message: 'Resource updated', resource: updated });
    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// ============================================================
// DELETE /api/resources/:id — Delete resource (Teacher/Admin)
// ============================================================
router.delete('/:id', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const checkSql = req.user.role === 'teacher'
            ? 'SELECT * FROM resources WHERE id = $1 AND teacher_id = $2'
            : 'SELECT * FROM resources WHERE id = $1';
        const checkParams = req.user.role === 'teacher' ? [id, req.user.id] : [id];
        const resource = await req.db.get(checkSql, checkParams);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        // Delete from kDrive
        if (resource.storage_type === 'kdrive' && resource.kdrive_file_id) {
            try {
                const kdrive = getKDriveService();
                await kdrive.deleteFile(resource.kdrive_file_id);
                console.log(`✅ kDrive: Deleted file id ${resource.kdrive_file_id}`);
            } catch (kErr) {
                console.error('kDrive delete failed:', kErr.response?.data || kErr.message);
            }
        }

        // Delete local file if exists
        if (resource.file_path) cleanTemp(resource.file_path);

        await req.db.run('DELETE FROM resources WHERE id = $1', [id]);
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// ============================================================
// GET /api/resources/:id/download — Download / stream file
// ============================================================
router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
        let sql = 'SELECT * FROM resources WHERE id = $1';
        const params = [req.params.id];
        if (req.user.role === 'teacher') { sql += ' AND teacher_id = $2'; params.push(req.user.id); }
        else if (req.user.role === 'student') { sql += ' AND batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $2)'; params.push(req.user.id); }

        const resource = await req.db.get(sql, params);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        if (resource.storage_type === 'kdrive' && resource.kdrive_file_id) {
            const kdrive = getKDriveService();
            const downloadUrl = await kdrive.getDownloadUrl(resource.kdrive_file_id);
            if (downloadUrl) {
                return res.redirect(downloadUrl);
            }
            // fallback if getDownloadUrl fails
            res.setHeader('Content-Disposition', `attachment; filename="${resource.file_name}"`);
            return kdrive.streamFile(resource.kdrive_file_id, res, req.headers, 'attachment');
        }

        // Local file fallback
        if (!resource.file_path || !fs.existsSync(resource.file_path)) {
            return res.status(404).json({ error: 'File not found on server' });
        }
        res.download(resource.file_path, resource.file_name);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download' });
    }
});

// ============================================================
// GET /api/resources/:id/preview — Stream for in-app preview (inline)
// ============================================================
router.get('/:id/preview', authenticateToken, async (req, res) => {
    try {
        let sql = 'SELECT * FROM resources WHERE id = $1';
        const params = [req.params.id];
        if (req.user.role === 'teacher') { sql += ' AND teacher_id = $2'; params.push(req.user.id); }
        else if (req.user.role === 'student') { sql += ' AND batch_id IN (SELECT batch_id FROM batch_students WHERE student_id = $2)'; params.push(req.user.id); }

        const resource = await req.db.get(sql, params);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        if (resource.storage_type === 'kdrive' && resource.kdrive_file_id) {
            const kdrive = getKDriveService();
            // Set inline disposition for preview and forward Range headers
            return kdrive.streamFile(resource.kdrive_file_id, res, req.headers, 'inline', resource.file_name);
        }

        if (!resource.file_path || !fs.existsSync(resource.file_path)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        // Express sendFile handles Range headers automatically
        res.sendFile(path.resolve(resource.file_path), {
            headers: {
                'Content-Disposition': `inline; filename="${resource.file_name}"`,
                'Content-Type': resource.file_type || 'application/octet-stream'
            }
        });
    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).json({ error: 'Failed to preview' });
    }
});

module.exports = router;
