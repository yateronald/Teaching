const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { authenticateToken, teacherOrAdmin, authenticated } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'video/mp4': '.mp4',
        'video/avi': '.avi',
        'video/mov': '.mov',
        'audio/mpeg': '.mp3',
        'audio/wav': '.wav',
        'audio/ogg': '.ogg',
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'text/plain': '.txt'
    };
    
    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('File type not allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// Get all resources (filtered by role)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { batch_id } = req.query;
        
        let sql = `
            SELECT 
                r.id, r.title, r.description, r.file_name, r.file_type, r.file_size, r.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                b.name as batch_name
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN batches b ON r.batch_id = b.id
        `;
        let params = [];
        let conditions = [];
        
        if (req.user.role === 'teacher') {
            conditions.push('r.teacher_id = ?');
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            conditions.push(`
                r.batch_id IN (
                    SELECT batch_id FROM batch_students WHERE student_id = ?
                )
            `);
            params.push(req.user.id);
        }
        
        if (batch_id) {
            conditions.push('r.batch_id = ?');
            params.push(batch_id);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY r.created_at DESC';
        
        const resources = await req.db.all(sql, params);
        res.json(resources);
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Get resource by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        let sql = `
            SELECT 
                r.id, r.title, r.description, r.file_name, r.file_path, r.file_type, r.file_size, r.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                b.name as batch_name
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN batches b ON r.batch_id = b.id
            WHERE r.id = ?
        `;
        let params = [id];
        
        // Add access control
        if (req.user.role === 'teacher') {
            sql += ' AND r.teacher_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            sql += ` AND r.batch_id IN (
                SELECT batch_id FROM batch_students WHERE student_id = ?
            )`;
            params.push(req.user.id);
        }
        
        const resource = await req.db.get(sql, params);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found or access denied' });
        }
        
        res.json(resource);
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// Upload new resource (Teachers only)
router.post('/', [
    authenticateToken,
    teacherOrAdmin,
    upload.single('file'),
    body('title').isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('batch_id').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Clean up uploaded file if validation fails
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description, batch_id } = req.body;
        const teacher_id = req.user.role === 'admin' ? req.body.teacher_id : req.user.id;

        // Validate batch access if batch_id is provided
        if (batch_id) {
            let batchCheck;
            if (req.user.role === 'teacher') {
                batchCheck = await req.db.get(
                    'SELECT id FROM batches WHERE id = ? AND teacher_id = ?',
                    [batch_id, req.user.id]
                );
            } else {
                batchCheck = await req.db.get(
                    'SELECT id FROM batches WHERE id = ?',
                    [batch_id]
                );
            }
            
            if (!batchCheck) {
                fs.unlinkSync(req.file.path);
                return res.status(400).json({ error: 'Invalid batch ID or access denied' });
            }
        }

        // Save resource to database
        const result = await req.db.run(`
            INSERT INTO resources (title, description, file_name, file_path, file_type, file_size, teacher_id, batch_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title,
            description || null,
            req.file.originalname,
            req.file.path,
            req.file.mimetype,
            req.file.size,
            teacher_id,
            batch_id || null
        ]);

        // Get created resource
        const newResource = await req.db.get(`
            SELECT 
                r.id, r.title, r.description, r.file_name, r.file_type, r.file_size, r.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                b.name as batch_name
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN batches b ON r.batch_id = b.id
            WHERE r.id = ?
        `, [result.id]);

        res.status(201).json({
            message: 'Resource uploaded successfully',
            resource: newResource
        });

    } catch (error) {
        // Clean up uploaded file on error
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        }
        console.error('Upload resource error:', error);
        res.status(500).json({ error: 'Failed to upload resource' });
    }
});

// Update resource metadata (Teachers only)
router.put('/:id', [
    authenticateToken,
    teacherOrAdmin,
    body('title').optional().isLength({ min: 1 }).trim(),
    body('description').optional().trim(),
    body('batch_id').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { id } = req.params;
        const { title, description, batch_id } = req.body;

        // Check if resource exists and user has access
        let resource;
        if (req.user.role === 'teacher') {
            resource = await req.db.get(
                'SELECT id FROM resources WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            resource = await req.db.get('SELECT id FROM resources WHERE id = ?', [id]);
        }

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found or access denied' });
        }

        // Validate batch access if batch_id is provided
        if (batch_id !== undefined) {
            if (batch_id) {
                let batchCheck;
                if (req.user.role === 'teacher') {
                    batchCheck = await req.db.get(
                        'SELECT id FROM batches WHERE id = ? AND teacher_id = ?',
                        [batch_id, req.user.id]
                    );
                } else {
                    batchCheck = await req.db.get(
                        'SELECT id FROM batches WHERE id = ?',
                        [batch_id]
                    );
                }
                
                if (!batchCheck) {
                    return res.status(400).json({ error: 'Invalid batch ID or access denied' });
                }
            }
        }

        // Build update query
        const updates = [];
        const params = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (batch_id !== undefined) {
            updates.push('batch_id = ?');
            params.push(batch_id);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        params.push(id);

        await req.db.run(
            `UPDATE resources SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Get updated resource
        const updatedResource = await req.db.get(`
            SELECT 
                r.id, r.title, r.description, r.file_name, r.file_type, r.file_size, r.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name,
                b.name as batch_name
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            LEFT JOIN batches b ON r.batch_id = b.id
            WHERE r.id = ?
        `, [id]);

        res.json({
            message: 'Resource updated successfully',
            resource: updatedResource
        });

    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// Delete resource (Teachers only)
router.delete('/:id', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if resource exists and user has access
        let resource;
        if (req.user.role === 'teacher') {
            resource = await req.db.get(
                'SELECT file_path FROM resources WHERE id = ? AND teacher_id = ?',
                [id, req.user.id]
            );
        } else {
            resource = await req.db.get(
                'SELECT file_path FROM resources WHERE id = ?',
                [id]
            );
        }
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found or access denied' });
        }
        
        // Delete file from filesystem
        try {
            if (fs.existsSync(resource.file_path)) {
                fs.unlinkSync(resource.file_path);
            }
        } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Continue with database deletion even if file deletion fails
        }
        
        // Delete from database
        await req.db.run('DELETE FROM resources WHERE id = ?', [id]);
        
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Download resource file
router.get('/:id/download', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check access and get file path
        let sql = `
            SELECT r.file_path, r.file_name, r.file_type
            FROM resources r
            WHERE r.id = ?
        `;
        let params = [id];
        
        // Add access control
        if (req.user.role === 'teacher') {
            sql += ' AND r.teacher_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'student') {
            sql += ` AND r.batch_id IN (
                SELECT batch_id FROM batch_students WHERE student_id = ?
            )`;
            params.push(req.user.id);
        }
        
        const resource = await req.db.get(sql, params);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found or access denied' });
        }
        
        // Check if file exists
        if (!fs.existsSync(resource.file_path)) {
            return res.status(404).json({ error: 'File not found on server' });
        }
        
        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${resource.file_name}"`);
        res.setHeader('Content-Type', resource.file_type);
        
        // Stream file to response
        const fileStream = fs.createReadStream(resource.file_path);
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Download resource error:', error);
        res.status(500).json({ error: 'Failed to download resource' });
    }
});

// Get resources for a specific batch
router.get('/batch/:batchId', authenticateToken, authenticated, async (req, res) => {
    try {
        const { batchId } = req.params;
        
        // Check if user has access to this batch
        let hasAccess = false;
        
        if (req.user.role === 'admin') {
            hasAccess = true;
        } else if (req.user.role === 'teacher') {
            const teacherBatch = await req.db.get(
                'SELECT id FROM batches WHERE id = ? AND teacher_id = ?',
                [batchId, req.user.id]
            );
            hasAccess = !!teacherBatch;
        } else if (req.user.role === 'student') {
            const studentBatch = await req.db.get(
                'SELECT 1 FROM batch_students WHERE batch_id = ? AND student_id = ?',
                [batchId, req.user.id]
            );
            hasAccess = !!studentBatch;
        }
        
        if (!hasAccess) {
            return res.status(403).json({ error: 'Access denied to this batch' });
        }
        
        const resources = await req.db.all(`
            SELECT 
                r.id, r.title, r.description, r.file_name, r.file_type, r.file_size, r.created_at,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM resources r
            LEFT JOIN users u ON r.teacher_id = u.id
            WHERE r.batch_id = ?
            ORDER BY r.created_at DESC
        `, [batchId]);
        
        res.json(resources);
    } catch (error) {
        console.error('Get batch resources error:', error);
        res.status(500).json({ error: 'Failed to fetch batch resources' });
    }
});

module.exports = router;