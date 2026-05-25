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
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
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
                   string_agg(b.name, ', ' ORDER BY b.name) as batch_names,
                   json_agg(b.id ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL) as batch_ids,
                   r.teacher_id
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN resource_batches rb ON r.id = rb.resource_id
            __BATCH_JOIN__
        `;
        let batchJoinBase = `LEFT JOIN batches b ON rb.batch_id = b.id`;
        const conditions = [];
        const params = [];
        let idx = 1;

        if (req.user.role === 'teacher') {
            conditions.push(`r.teacher_id = $${idx++}`);
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            batchJoinBase += ` AND EXISTS (SELECT 1 FROM batch_students bs_filter WHERE bs_filter.batch_id = b.id AND bs_filter.student_id = $${idx++})`;
            params.push(req.user.id);
            conditions.push(`EXISTS (SELECT 1 FROM resource_batches rb2 JOIN batch_students bs ON rb2.batch_id = bs.batch_id WHERE rb2.resource_id = r.id AND bs.student_id = $${idx++})`);
            params.push(req.user.id);
        }
        
        sql = sql.replace('__BATCH_JOIN__', batchJoinBase);
        
        if (batch_id) { conditions.push(`EXISTS (SELECT 1 FROM resource_batches rb3 WHERE rb3.resource_id = r.id AND rb3.batch_id = $${idx++})`); params.push(batch_id); }
        if (category && category !== 'all') { conditions.push(`r.category = $${idx++}`); params.push(category); }
        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' GROUP BY r.id, u.id ORDER BY r.created_at DESC';

        const resourcesData = await req.db.all(sql, params);
        
        const resources = resourcesData.map(r => ({
            ...r,
            batch_ids: r.batch_ids || []
        }));
        
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
        let sql = `
            SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
                   string_agg(b.name, ', ' ORDER BY b.name) as batch_names,
                   json_agg(b.id ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL) as batch_ids
            FROM resources r 
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN resource_batches rb ON r.id = rb.resource_id
            __BATCH_JOIN__
            WHERE EXISTS (SELECT 1 FROM resource_batches rb3 WHERE rb3.resource_id = r.id AND rb3.batch_id = $1)
            GROUP BY r.id, u.id
            ORDER BY r.created_at DESC
        `;
        let batchJoinBase = `LEFT JOIN batches b ON rb.batch_id = b.id`;
        let params = [batchId];
        let idx = 2;
        if (req.user.role === 'student') {
            batchJoinBase += ` AND EXISTS (SELECT 1 FROM batch_students bs_filter WHERE bs_filter.batch_id = b.id AND bs_filter.student_id = $${idx++})`;
            params.push(req.user.id);
        }
        sql = sql.replace('__BATCH_JOIN__', batchJoinBase);

        const resourcesData = await req.db.all(sql, params);
        res.json(resourcesData.map(r => ({ ...r, batch_ids: r.batch_ids || [] })));
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
                   string_agg(b.name, ', ' ORDER BY b.name) as batch_names,
                   json_agg(b.id ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL) as batch_ids
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN resource_batches rb ON r.id = rb.resource_id
            __BATCH_JOIN__
            WHERE r.id = $1
        `;
        const params = [req.params.id];
        let batchJoinBase = `LEFT JOIN batches b ON rb.batch_id = b.id`;
        let idx = 2;

        if (req.user.role === 'teacher') { 
            sql += ` AND r.teacher_id = $${idx++}`; params.push(req.user.id); 
        } else if (req.user.role === 'student') { 
            batchJoinBase += ` AND EXISTS (SELECT 1 FROM batch_students bs_filter WHERE bs_filter.batch_id = b.id AND bs_filter.student_id = $${idx++})`;
            params.push(req.user.id);
            sql += ` AND EXISTS (SELECT 1 FROM resource_batches rbJOIN JOIN batch_students bs ON rbJOIN.batch_id = bs.batch_id WHERE rbJOIN.resource_id = r.id AND bs.student_id = $${idx++})`; 
            params.push(req.user.id); 
        }

        sql = sql.replace('__BATCH_JOIN__', batchJoinBase);
        sql += ' GROUP BY r.id, u.id';

        const resource = await req.db.get(sql, params);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        resource.batch_ids = resource.batch_ids || [];
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
    authenticateToken, teacherOrAdmin, upload.array('files', 50),
    body('description').optional().trim(),
    body('batch_ids').optional()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { 
            if (req.files) req.files.forEach(f => cleanTemp(f.path));
            return res.status(400).json({ error: 'Validation failed', details: errors.array() }); 
        }
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

        const { description } = req.body;
        const teacherId = req.user.role === 'admin' ? (req.body.teacher_id || req.user.id) : req.user.id;
        
        let batchIds = [];
        if (req.body.batch_ids) {
            try { batchIds = JSON.parse(req.body.batch_ids); } catch { batchIds = [req.body.batch_ids]; }
            if (!Array.isArray(batchIds)) batchIds = [batchIds];
            batchIds = batchIds.map(Number).filter(id => id > 0);
        }

        let inputTitles = req.body.titles || [];
        if (!Array.isArray(inputTitles)) {
            try { inputTitles = JSON.parse(req.body.titles); } catch { inputTitles = [req.body.titles]; }
        }

        // Validate batch access
        if (batchIds.length > 0) {
            for (const bId of batchIds) {
                const batchSql = req.user.role === 'teacher'
                    ? 'SELECT id, name FROM batches WHERE id = $1 AND teacher_id = $2'
                    : 'SELECT id, name FROM batches WHERE id = $1';
                const batchParams = req.user.role === 'teacher' ? [bId, req.user.id] : [bId];
                const batch = await req.db.get(batchSql, batchParams);
                if (!batch) {
                    req.files.forEach(f => cleanTemp(f.path));
                    return res.status(400).json({ error: `Invalid batch with ID: ${bId}` });
                }
            }
        }

        const kdrive = getKDriveService();
        const newResources = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const originalNameNoExt = file.originalname.split('.').slice(0, -1).join('.') || file.originalname;
            const title = inputTitles[i] || originalNameNoExt;
            const category = detectCategory(file.mimetype, file.originalname);
            
            let kdriveFileId = null;
            let kdriveFolderId = null;
            let storageType = 'local';

            if (kdrive.isConfigured) {
                console.log(`📤 kDrive: Uploading file ${file.originalname} to cloud...`);
                try {
                    const teacher = await req.db.get('SELECT first_name, last_name FROM users WHERE id = $1', [teacherId]);
                    const teacherName = teacher ? `${teacher.first_name}_${teacher.last_name}` : 'Unknown';
                    let batchName = null;
                    let singleBatchId = batchIds.length > 0 ? batchIds[0] : null;
                    if (singleBatchId) {
                        const batch = await req.db.get('SELECT name FROM batches WHERE id = $1', [singleBatchId]);
                        batchName = batch?.name;
                    }

                    const { batchFolder } = await kdrive.ensureTeacherBatchFolder(teacherId, teacherName, singleBatchId, batchName);
                    kdriveFolderId = batchFolder.id;

                    const kdriveFile = await kdrive.uploadFile(file.path, batchFolder.id, file.originalname);
                    if (kdriveFile) {
                        kdriveFileId = kdriveFile.id;
                        storageType = 'kdrive';
                        console.log(`✅ kDrive: Uploaded "${file.originalname}" (id: ${kdriveFile.id})`);
                    }
                } catch (kErr) {
                    console.error('kDrive upload failed, falling back to local:', kErr.response?.data || kErr.message);
                }
            }

            // Save to database
            const result = await req.db.run(`
                INSERT INTO resources (title, description, file_name, file_path, file_type, file_size, teacher_id, batch_id, kdrive_file_id, kdrive_folder_id, storage_type, category)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, $10, $11) RETURNING id
            `, [
                title, description || null, file.originalname,
                storageType === 'kdrive' ? null : file.path,
                file.mimetype, file.size, teacherId,
                kdriveFileId, kdriveFolderId, storageType, category
            ]);

            const newResourceId = result.rows ? result.rows[0].id : result.id;
            
            if (batchIds && batchIds.length > 0) {
                for (const bId of batchIds) {
                    await req.db.run(
                        'INSERT INTO resource_batches (resource_id, batch_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                        [newResourceId, bId]
                    );
                }
            }

            if (storageType === 'kdrive') cleanTemp(file.path);
            
            // Fetch newly structured resource just to push data back if desired
            const newRes = await req.db.get(`
                SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name, 
                       string_agg(b.name, ', ' ORDER BY b.name) as batch_names,
                       json_agg(b.id ORDER BY b.name) FILTER (WHERE b.id IS NOT NULL) as batch_ids
                FROM resources r 
                LEFT JOIN users u ON r.teacher_id = u.id 
                LEFT JOIN resource_batches rb ON r.id = rb.resource_id
                LEFT JOIN batches b ON rb.batch_id = b.id
                WHERE r.id = $1
                GROUP BY r.id, u.id
            `, [newResourceId]);
            if (newRes) {
                newRes.batch_ids = newRes.batch_ids || [];
                newResources.push(newRes);
            }
        }

        // 🔔 Send in-app notifications to all students in the assigned batches
        // (single bulk notification per upload — not per file, to avoid spam)
        try {
            if (batchIds.length > 0 && newResources.length > 0) {
                const { createBulkNotifications, getStudentsInBatches } = require('../services/notificationService');
                const studentIds = await getStudentsInBatches(req.db, batchIds);
                const fileCount = newResources.length;
                const firstTitle = newResources[0].title || newResources[0].file_name || 'a file';
                const message = fileCount === 1
                    ? `Your teacher uploaded "${firstTitle}".`
                    : `Your teacher uploaded ${fileCount} new resources.`;
                await createBulkNotifications(req.db, studentIds, {
                    type: 'resource_uploaded',
                    title: 'New resource available',
                    message,
                    link: `/app/my-resources?resource=${newResources[0].id}`,
                    entity_type: 'resource',
                    entity_id: newResources[0].id,
                    sender_id: req.user.id,
                });
            }
        } catch (notifErr) {
            console.warn('[notifications] resource_uploaded failed:', notifErr.message);
        }

        res.status(201).json({ message: 'Files uploaded successfully', resources: newResources });
    } catch (error) {
        if (req.files) req.files.forEach(f => cleanTemp(f.path));
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
    body('batch_ids').optional()
], async (req, res) => {
    try {
        const { id } = req.params;
        const checkSql = req.user.role === 'teacher'
            ? 'SELECT id FROM resources WHERE id = $1 AND teacher_id = $2'
            : 'SELECT id FROM resources WHERE id = $1';
        const checkParams = req.user.role === 'teacher' ? [id, req.user.id] : [id];
        const resource = await req.db.get(checkSql, checkParams);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        const { title, description } = req.body;
        const updates = []; const params = []; let idx = 1;
        if (title !== undefined) { updates.push(`title = $${idx++}`); params.push(title); }
        if (description !== undefined) { updates.push(`description = $${idx++}`); params.push(description); }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        
        let batchIds = null;
        if (req.body.batch_ids !== undefined) {
            batchIds = req.body.batch_ids;
            if (!Array.isArray(batchIds)) batchIds = [batchIds];
            batchIds = batchIds.map(Number).filter(bid => bid > 0);
        }

        if (updates.length > 1) {
            params.push(id);
            await req.db.run(`UPDATE resources SET ${updates.join(', ')} WHERE id = $${idx}`, params);
        }
        
        if (batchIds !== null) {
            // Delete old mappings
            await req.db.run('DELETE FROM resource_batches WHERE resource_id = $1', [id]);
            // Insert new mappings
            for (const bId of batchIds) {
                await req.db.run('INSERT INTO resource_batches (resource_id, batch_id) VALUES ($1, $2)', [id, bId]);
            }
        }

        const updated = await req.db.get(`
            SELECT r.*, u.first_name AS teacher_first_name, u.last_name AS teacher_last_name,
                   string_agg(b.name, ', ' ORDER BY b.name) as batch_names,
                   json_agg(b.id) FILTER (WHERE b.id IS NOT NULL) as batch_ids
            FROM resources r 
            LEFT JOIN users u ON r.teacher_id = u.id 
            LEFT JOIN resource_batches rb ON r.id = rb.resource_id
            LEFT JOIN batches b ON rb.batch_id = b.id
            WHERE r.id = $1
            GROUP BY r.id, u.id
        `, [id]);
        if (updated) updated.batch_ids = updated.batch_ids || [];
        
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
        else if (req.user.role === 'student') { 
            sql += ' AND EXISTS (SELECT 1 FROM resource_batches rb2 JOIN batch_students bs ON rb2.batch_id = bs.batch_id WHERE rb2.resource_id = resources.id AND bs.student_id = $2)'; 
            params.push(req.user.id); 
        }

        const resource = await req.db.get(sql, params);
        if (!resource) return res.status(404).json({ error: 'Resource not found' });

        if (resource.storage_type === 'kdrive' && resource.kdrive_file_id) {
            const kdrive = getKDriveService();
            const downloadUrl = await kdrive.getDownloadUrl(resource.kdrive_file_id);
            if (downloadUrl) {
                if (req.query.json === 'true') {
                    return res.json({ url: downloadUrl });
                }
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
        else if (req.user.role === 'student') { 
            sql += ' AND EXISTS (SELECT 1 FROM resource_batches rb2 JOIN batch_students bs ON rb2.batch_id = bs.batch_id WHERE rb2.resource_id = resources.id AND bs.student_id = $2)'; 
            params.push(req.user.id); 
        }

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
