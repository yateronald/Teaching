const express = require('express');
const { body, validationResult } = require('express-validator');
const { hashPassword, authenticateToken, teacherOrAdmin, authorizeRoles, ROLES } = require('../middleware/auth');
const candidates = require('../services/candidateService');
const sessions = require('../services/sessionService');
const { hasColumn } = require('../services/schemaFeatures');
const { sendWelcomeEmail, sendAdminPasswordReset } = require('../emails/emailService');

// Build local admin-only middleware using authorizeRoles to avoid any export mismatch
const adminOnlyMw = authorizeRoles('admin');

// Debug types to diagnose startup crash
console.log('[users.js] typeof authenticateToken:', typeof authenticateToken, ' typeof adminOnlyMw:', typeof adminOnlyMw, ' typeof teacherOrAdmin:', typeof teacherOrAdmin);

const router = express.Router();

/**
 * The website-monitoring key is an administrator-only extra: it is only ever
 * stored for an admin account, and is dropped the moment the role changes.
 * The column is optional so the code runs before its migration is applied.
 */
const monitoringColumn = (db) => hasColumn(db, 'users', 'can_view_monitoring');
const monitoringValue = (role, value) => (role === 'admin' ? value === true || value === 'true' : false);
/** Extra columns for a SELECT (on `users`, unaliased), once their migrations have run. */
const extraUserColumns = async (db, prefix = '') => {
    let cols = (await monitoringColumn(db)) ? `, ${prefix}can_view_monitoring` : '';
    // Company accounts show which company they belong to.
    if (await hasColumn(db, 'users', 'organization_id')) {
        cols += `, ${prefix}organization_id, (SELECT COALESCE(o.display_name, o.name) FROM organizations o WHERE o.id = users.organization_id) AS organization_name`;
    }
    return cols;
};
const orgs = require('../services/organizationService');

// Temporary passwords come from the shared, cryptographically secure generator.
const { generateTempPassword } = require('../services/tempPassword');

// Get all users (Admin only)
router.get('/', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { role, search } = req.query;
        
        // If requesting students, include batch information
        if (role === 'student') {
            let sql = `
                SELECT DISTINCT
                    u.id, u.username, u.email, u.role, u.first_name, u.last_name, u.created_at, u.is_active, u.failed_login_attempts
                FROM users u
                WHERE u.role = 'student'
            `;
            let params = [];
            
            if (search) {
                sql += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.username LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            sql += ' ORDER BY u.created_at DESC';
            
            const students = await req.db.all(sql, params);
            
            // Get batch information for each student
            for (const student of students) {
                const batches = await req.db.all(`
                    SELECT b.id, b.name, b.french_level
                    FROM batches b
                    JOIN batch_students bs ON b.id = bs.batch_id
                    WHERE bs.student_id = ?
                    ORDER BY b.name
                `, [student.id]);
                student.batches = batches;
            }
            
            return res.json(students);
        }
        
        // For non-student roles, use the original logic
        let sql = `SELECT id, username, email, role, first_name, last_name, created_at, is_active, failed_login_attempts${await extraUserColumns(req.db)} FROM users`;
        let params = [];
        
        const conditions = [];
        
        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }
        
        if (search) {
            conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR username LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY created_at DESC';
        
        const users = await req.db.all(sql, params);
        const candidateIds = users.filter(u => u.role === 'candidate').map(u => u.id);
        if (candidateIds.length) {
            const exam = await candidates.summaries(req.db, candidateIds);
            users.forEach(u => { if (u.role === 'candidate') u.exam = exam.get(Number(u.id)) || null; });
        }
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await req.db.get(
            `SELECT id, username, email, role, first_name, last_name, created_at, is_active, failed_login_attempts${await extraUserColumns(req.db)} FROM users WHERE id = ?`,
            [id]
        );
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.role === 'candidate') {
            user.exam = (await candidates.summaries(req.db, [user.id])).get(Number(user.id)) || null;
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user (Admin only)
router.post('/', [
    authenticateToken,
    adminOnlyMw,
    body('username').isLength({ min: 3 }).trim(),
    body('email').isEmail().normalizeEmail(),
    // password is no longer provided by client; it will be auto-generated
    body('role').isIn(ROLES),
    body('first_name').isLength({ min: 1 }).trim(),
    body('last_name').isLength({ min: 1 }).trim(),
    body('is_active').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const { username, email, role, first_name, last_name, is_active = true } = req.body;

        // A company manager always belongs to a company: created from that company's page.
        if (role === 'org_admin') {
            return res.status(400).json({ error: 'Company managers are added from the company’s page (Companies).', code: 'USE_COMPANY_PAGE' });
        }

        // An exam candidate may come with an exam goal (target, level, date, private note)
        const { goal, error: goalError } = role === 'candidate'
            ? candidates.readGoal(req.body, { withNotes: true })
            : { goal: null };
        if (goalError) return res.status(400).json({ error: goalError });

        // Check if username or email already exists
        const existingUser = await req.db.get(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Auto-generate a temporary password (exactly 10 chars)
        const tempPassword = generateTempPassword(10);

        // Hash password
        const passwordHash = await hashPassword(tempPassword);

        // Only an administrator can be given the website-monitoring key, and
        // only when the box was ticked.
        const monitoring = monitoringValue(role, req.body.can_view_monitoring);
        const withMonitoring = await monitoringColumn(req.db);

        // Create user with password policy defaults and require change on next login
        const result = await req.db.run(
            `INSERT INTO users (username, email, password_hash, role, first_name, last_name, must_change_password, password_expires_at, is_active, failed_login_attempts${withMonitoring ? ', can_view_monitoring' : ''})
             VALUES (?, ?, ?, ?, ?, ?, 1, NOW() + INTERVAL '90 days', ?, 0${withMonitoring ? ', ?' : ''}) RETURNING id`,
            withMonitoring
                ? [username, email, passwordHash, role, first_name, last_name, is_active, monitoring]
                : [username, email, passwordHash, role, first_name, last_name, is_active]
        );

        const userId = result.rows[0].id;

        if (goal) {
            await candidates.saveGoal(req.db, userId, goal, req.user.id)
                .catch(e => console.error('Failed to save the exam goal of user', userId, e.message));
        }

        // Try to send welcome email with temp password (non-blocking error)
        try {
            await sendWelcomeEmail({ to: email, username, tempPassword: tempPassword });
        } catch (e) {
            console.error('Failed to send welcome email for user', email, e && e.message);
        }

        // Get created user (without password)
        const newUser = await req.db.get(
            `SELECT id, username, email, role, first_name, last_name, created_at${await extraUserColumns(req.db)} FROM users WHERE id = ?`,
            [userId]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (Admin only)
router.put('/:id', [
    authenticateToken,
    adminOnlyMw,
    body('username').optional().isLength({ min: 3 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(ROLES),
    body('first_name').optional().isLength({ min: 1 }).trim(),
    body('last_name').optional().isLength({ min: 1 }).trim(),
    body('is_active').optional().isBoolean()
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
        const { username, email, role, first_name, last_name, is_active } = req.body;

        // Check if user exists
        const withOrg = await hasColumn(req.db, 'users', 'organization_id');
        const existingUser = await req.db.get(`SELECT id, role, is_active, email, first_name, last_name${withOrg ? ', organization_id' : ''} FROM users WHERE id = ?`, [id]);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Company accounts keep their role (manager or learner of their company);
        // nobody becomes a company manager from here.
        if (role && role !== existingUser.role && (existingUser.organization_id || role === 'org_admin')) {
            return res.status(400).json({ error: 'The role of a company account cannot be changed here. Manage it from the company’s page.', code: 'COMPANY_ACCOUNT' });
        }

        // Prevent self-deactivation for logged-in admin
        const targetIdForUpdate = parseInt(id, 10);
        if (role && role !== existingUser.role && targetIdForUpdate === req.user.id) {
            return res.status(400).json({ error: 'You cannot change your own role.' });
        }

        // Candidates prepare for the exam on their own: no batch, no class to teach
        const nextRole = role || existingUser.role;
        if (nextRole === 'candidate' && existingUser.role !== 'candidate') {
            const blockers = await candidates.roleChangeBlockers(req.db, targetIdForUpdate);
            if (blockers.length) {
                return res.status(409).json({
                    error: `This account ${blockers.join(' and ')}. Remove it from those batches before making it an exam candidate.`,
                    code: 'CANDIDATE_HAS_BATCHES',
                });
            }
        }
        const { goal, error: goalError } = nextRole === 'candidate'
            ? candidates.readGoal(req.body, { withNotes: true })
            : { goal: null };
        if (goalError) return res.status(400).json({ error: goalError });
        if (
            req.user && req.user.role === 'admin' && targetIdForUpdate === req.user.id &&
            typeof is_active === 'boolean' && is_active === false
        ) {
            return res.status(400).json({ error: 'You cannot deactivate your own admin account.' });
        }

        // Check for duplicate username/email (excluding current user)
        if (username || email) {
            const duplicateCheck = await req.db.get(
                'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
                [username || '', email || '', id]
            );
            if (duplicateCheck) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
        }

        // Build update query dynamically
        const updates = [];
        const params = [];
        
        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        if (first_name) {
            updates.push('first_name = ?');
            params.push(first_name);
        }
        if (last_name) {
            updates.push('last_name = ?');
            params.push(last_name);
        }
        // The monitoring key belongs to administrators: changing the role away
        // from admin takes it away, and only an explicit tick grants it.
        if (await monitoringColumn(req.db)) {
            if (nextRole !== 'admin' && existingUser.role === 'admin') {
                updates.push('can_view_monitoring = false');
            } else if (nextRole === 'admin' && 'can_view_monitoring' in req.body) {
                updates.push('can_view_monitoring = ?');
                params.push(monitoringValue('admin', req.body.can_view_monitoring));
            }
        }
        if (typeof is_active === 'boolean') {
            updates.push('is_active = ?');
            params.push(is_active);
            // Reset failed login attempts when reactivating account
            if (is_active) {
                updates.push('failed_login_attempts = 0');
                updates.push('account_locked_until = NULL');
            }
        }
        
        const hasGoal = !!goal && Object.keys(goal).length > 0;
        if (updates.length === 0 && !hasGoal && !(nextRole === 'candidate' && existingUser.role !== 'candidate')) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        if (updates.length) {
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);
            await req.db.run(
                `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }
        if (nextRole === 'candidate' && (hasGoal || existingUser.role !== 'candidate')) {
            await candidates.saveGoal(req.db, targetIdForUpdate, goal || {}, req.user.id);
        }
        // A disabled account — or one that changed role — keeps no signed-in device.
        if (is_active === false || (role && role !== existingUser.role)) {
            await sessions.endAllForUser(req.db, targetIdForUpdate, 'admin').catch(() => 0);
        }
        // A company learner turned off gives its unused credits back to the company.
        let creditsReturned = null;
        if (is_active === false && existingUser.is_active && existingUser.organization_id && existingUser.role === 'candidate') {
            creditsReturned = await orgs.reclaimMany(req.db, existingUser.organization_id, [targetIdForUpdate], { ee: 'all', eo: 'all' }, req.user.id, { requireOpen: false, reason: 'learner_left' })
                .then(r => r.returned)
                .catch(e => { console.error('Could not return the credits of user', targetIdForUpdate, e.message); return null; });
        }
        // A company account changed from this page is written in the company's history too.
        if (existingUser.organization_id) {
            const via = { user_id: Number(existingUser.id), email: existingUser.email, role: existingUser.role, via: 'users_page' };
            if (typeof is_active === 'boolean' && !!is_active !== !!existingUser.is_active) {
                await orgs.audit(req.db, existingUser.organization_id, req.user.id, is_active ? 'account_reactivated' : 'account_deactivated',
                    { ...via, ...(creditsReturned ? { credits_returned: creditsReturned } : {}) });
            }
            const changes = {};
            for (const [k, v] of [['email', email], ['first_name', first_name], ['last_name', last_name]]) {
                if (v !== undefined && v !== null && String(v) !== String(existingUser[k] ?? '')) changes[k] = { from: existingUser[k], to: v };
            }
            if (Object.keys(changes).length) await orgs.audit(req.db, existingUser.organization_id, req.user.id, 'account_updated', { ...via, changes });
        }

        // Get updated user
        const updatedUser = await req.db.get(
            `SELECT id, username, email, role, first_name, last_name, created_at, updated_at, is_active, failed_login_attempts${await extraUserColumns(req.db)} FROM users WHERE id = ?`,
            [id]
        );
        if (updatedUser.role === 'candidate') {
            updatedUser.exam = (await candidates.summaries(req.db, [updatedUser.id])).get(Number(updatedUser.id)) || null;
        }

        res.json({ message: 'User updated successfully', user: updatedUser });

    } catch (error) {
        if (String(error?.message || '').includes('SEAT_LIMIT_REACHED')) {
            return res.status(409).json({ error: 'This company’s package is full. Raise it on the company’s page first.', code: 'SEAT_LIMIT_REACHED' });
        }
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const { id } = req.params;
        const targetId = parseInt(id, 10);

        // Prevent self-deletion for logged-in admin
        if (req.user && req.user.role === 'admin' && targetId === req.user.id) {
            return res.status(400).json({ error: 'You cannot delete your own admin account.' });
        }

        // Check if user exists
        const withOrg = await hasColumn(req.db, 'users', 'organization_id');
        const existingUser = await req.db.get(
            `SELECT id, role, email, first_name, last_name${withOrg ? ', organization_id' : ''} FROM users WHERE id = ?`, [id]);
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // A company account: its unused credits go back to the company's reserve
        // first (they would vanish with the account), and the deletion is written
        // in the company's history. Deleting frees its place in the package.
        if (existingUser.organization_id) {
            let returned = null;
            if (existingUser.role === 'candidate') {
                returned = await orgs.reclaimMany(req.db, existingUser.organization_id, [targetId], { ee: 'all', eo: 'all' }, req.user.id,
                    { requireOpen: false, reason: 'learner_left', notes: `Account deleted by an administrator: ${existingUser.email}` })
                    .then(r => r.returned)
                    .catch(e => { console.error('Could not return the credits of user', targetId, e.message); return null; });
            }
            await orgs.audit(req.db, existingUser.organization_id, req.user.id, 'account_deleted', {
                email: existingUser.email, name: `${existingUser.first_name} ${existingUser.last_name}`.trim(), role: existingUser.role,
                reason: 'administrator', via: 'users_page', ...(returned && (returned.ee || returned.eo) ? { credits_returned: returned } : {}),
            });
        }

        await req.db.run('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get teachers (Admin only)
router.get('/role/teachers', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const teachers = await req.db.all(
            "SELECT id, username, email, role, first_name, last_name FROM users WHERE role = 'teacher' ORDER BY first_name ASC"
        );
        res.json(teachers);
    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({ error: 'Failed to fetch teachers' });
    }
});

// Get students (Admin only)
router.get('/role/students', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const students = await req.db.all(
            "SELECT id, username, email, role, first_name, last_name FROM users WHERE role = 'student' ORDER BY first_name ASC"
        );
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get students by teacher (for teachers and admins)
router.get('/students/teacher/:teacherId', authenticateToken, teacherOrAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Get students with their batch information and quiz scores
        const students = await req.db.all(
            `SELECT DISTINCT 
                u.id, 
                u.first_name, 
                u.last_name, 
                u.email,
                b.name as batch_name,
                COALESCE(
                  (SUM(CASE WHEN qs.max_score > 0 THEN qs.total_score ELSE 0 END)::numeric / 
                   NULLIF(SUM(CASE WHEN qs.max_score > 0 THEN qs.max_score ELSE 0 END), 0)) * 100,
                  0
                ) as average_score
             FROM users u
             JOIN batch_students bs ON u.id = bs.student_id
             JOIN batches b ON bs.batch_id = b.id
             LEFT JOIN quiz_submissions qs 
                ON u.id = qs.student_id 
                AND qs.status IN ('submitted','auto_submitted','graded')
             WHERE b.teacher_id = ? AND u.role = 'student'
             GROUP BY u.id, u.first_name, u.last_name, u.email, b.name
             ORDER BY u.first_name ASC`,
            [teacherId]
        );

        // Every student's scores in one query (was one query per student-batch row).
        // DISTINCT on the submission id: a quiz shared by two of the teacher's batches
        // used to return the same submission twice and inflate the counts.
        const studentIds = [...new Set(students.map(s => s.id))];
        const scoreRows = studentIds.length ? await req.db.all(
            `SELECT DISTINCT qs.id, qs.student_id,
                    q.title as quiz_title,
                    qs.total_score as score,
                    qs.max_score,
                    qs.submitted_at
             FROM quiz_submissions qs
             JOIN quizzes q ON qs.quiz_id = q.id
             JOIN quiz_batches qb ON q.id = qb.quiz_id
             JOIN batches b ON qb.batch_id = b.id
             WHERE qs.student_id = ANY($1::int[]) AND b.teacher_id = $2
               AND qs.status IN ('submitted','auto_submitted','graded')
             ORDER BY qs.submitted_at DESC`,
            [studentIds, teacherId]
        ) : [];

        const scoresBy = new Map();
        for (const r of scoreRows) {
            if (!scoresBy.has(r.student_id)) scoresBy.set(r.student_id, []);
            scoresBy.get(r.student_id).push({
                quiz_title: r.quiz_title,
                score: r.score != null ? Number(r.score) : null,
                max_score: r.max_score != null ? Number(r.max_score) : null,
                submitted_at: r.submitted_at,
            });
        }

        const studentsWithScores = students.map(student => ({
            ...student,
            average_score: Number(student.average_score || 0),
            quiz_scores: scoresBy.get(student.id) || [],
        }));

        res.json(studentsWithScores);
    } catch (error) {
        console.error('Get teacher students error:', error);
        res.status(500).json({ error: 'Failed to fetch teacher students' });
    }
});

// Admin reset user password
router.put('/:id/reset-password', [
    authenticateToken,
    adminOnlyMw,
    // newPassword no longer accepted; password will be auto-generated
    body('mustChange').optional().isBoolean(),
    body('sendEmail').optional().isBoolean()
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
        const mustChange = ('mustChange' in req.body) ? !!req.body.mustChange : true;
        // Always send email with a generated temp password per new requirement
        const sendEmail = true;

        // Check if user exists
        const user = await req.db.get('SELECT id, email, username FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Always generate a temp password (exactly 10 chars, mixed letters and digits)
        const newPassword = generateTempPassword(10);

        // Hash the new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update password in database
        await req.db.run(
            "UPDATE users SET password_hash = ?, must_change_password = ?, password_changed_at = CURRENT_TIMESTAMP, password_expires_at = NOW() + INTERVAL '90 days', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newPasswordHash, mustChange ? 1 : 0, id]
        );

        // Email the user
        try {
            await sendAdminPasswordReset({ to: user.email, username: user.username || user.email, tempPassword: newPassword });
        } catch (e) {
            console.error('Failed to send admin reset email to', user.email, e && e.message);
        }

        // The old password is gone, so every device signed in with it goes too.
        await sessions.endAllForUser(req.db, Number(id), 'password').catch(() => 0);

        res.json({ message: 'Password reset successfully', mustChange: !!mustChange, emailed: !!sendEmail });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ── Signed-in devices (Admin only) ─────────────────────────────────────────
// Exam candidates may only use two devices at a time; this is where an
// administrator checks what an account is doing and frees it up.

router.get('/:id/sessions', authenticateToken, adminOnlyMw, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = await req.db.get('SELECT id, role FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const [live, takeovers] = await Promise.all([
            sessions.activeSessions(req.db, id),
            sessions.takeoversToday(req.db, id),
        ]);
        res.json({
            limit: sessions.limitFor(user.role),
            idle_minutes: sessions.IDLE_MINUTES,
            takeovers_today: takeovers,
            takeovers_allowed: sessions.TAKEOVERS_PER_DAY,
            sessions: live.map(s => ({ ...sessions.publicView(s), ip: s.ip })),
        });
    } catch (error) {
        console.error('Admin session list error:', error);
        res.status(500).json({ error: 'Failed to load devices' });
    }
});

// Sign out every device on an account, or just one of them.
const revokeSessions = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = await req.db.get('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (req.params.sessionId) {
            const target = Number(req.params.sessionId);
            const live = await sessions.activeSessions(req.db, id);
            if (!live.some(s => Number(s.id) === target)) {
                return res.status(404).json({ error: 'That device is already signed out' });
            }
            await sessions.endSessions(req.db, target, 'admin');
            return res.json({ message: 'Device signed out', signed_out: 1 });
        }

        const signedOut = await sessions.endAllForUser(req.db, id, 'admin');
        res.json({ message: signedOut ? 'All devices signed out' : 'No device was signed in', signed_out: signedOut });
    } catch (error) {
        console.error('Admin session revoke error:', error);
        res.status(500).json({ error: 'Failed to sign out the devices' });
    }
};
router.delete('/:id/sessions', authenticateToken, adminOnlyMw, revokeSessions);
router.delete('/:id/sessions/:sessionId', authenticateToken, adminOnlyMw, revokeSessions);

module.exports = router;