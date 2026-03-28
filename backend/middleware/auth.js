const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Generate JWT token
function generateToken(userId, role) {
    return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

// Hash password
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Verify password
async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

// Authenticate JWT token middleware
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1] || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Fetch user from DB and attach to request (include security fields)
        const user = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at, must_change_password, password_changed_at, password_expires_at, is_active, failed_login_attempts, account_locked_until FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid token: user not found' });
        }

        // Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ 
                error: 'Account disabled', 
                message: 'Your account has been disabled. Please contact the administrator.',
                code: 'ACCOUNT_DISABLED'
            });
        }

        // Check if account is temporarily locked
        if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
            const lockUntil = new Date(user.account_locked_until);
            return res.status(423).json({ 
                error: 'Account temporarily locked', 
                message: `Your account is temporarily locked due to multiple failed login attempts. Please try again after ${lockUntil.toLocaleString()}.`,
                code: 'ACCOUNT_LOCKED',
                locked_until: lockUntil.toISOString()
            });
        }

        // Compute force password change flag
        const mustChange = !!user.must_change_password;
        const expired = user.password_expires_at ? (new Date(user.password_expires_at) <= new Date()) : false;
        user.force_password_change = mustChange || expired;

        req.user = user;
        next();
    } catch (error) {
        console.error('Token authentication error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Authorize based on roles middleware
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

// Compatibility helpers used by existing route files
const adminOnly = authorizeRoles('admin');
const teacherOrAdmin = authorizeRoles('teacher', 'admin');
const authenticated = authorizeRoles('student', 'teacher', 'admin');

// Account lockout management functions
async function recordFailedLogin(db, userId) {
    const user = await db.get('SELECT failed_login_attempts FROM users WHERE id = ?', [userId]);
    const attempts = (user?.failed_login_attempts || 0) + 1;
    
    let lockUntil = null;
    if (attempts >= 5) {
        // Lock account for 30 minutes after 5 failed attempts
        lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await db.run(
        'UPDATE users SET failed_login_attempts = ?, last_failed_login = CURRENT_TIMESTAMP, account_locked_until = ? WHERE id = ?',
        [attempts, lockUntil?.toISOString() || null, userId]
    );
    
    return { attempts, lockUntil };
}

async function resetFailedLogins(db, userId) {
    await db.run(
        'UPDATE users SET failed_login_attempts = 0, last_failed_login = NULL, account_locked_until = NULL WHERE id = ?',
        [userId]
    );
}

async function isAccountLocked(db, userId) {
    const user = await db.get(
        'SELECT is_active, account_locked_until, failed_login_attempts FROM users WHERE id = ?',
        [userId]
    );
    
    if (!user) return { locked: true, reason: 'User not found' };
    if (!user.is_active) return { locked: true, reason: 'Account disabled' };
    
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
        return { 
            locked: true, 
            reason: 'Temporarily locked', 
            until: user.account_locked_until,
            attempts: user.failed_login_attempts
        };
    }
    
    return { locked: false };
}

module.exports = {
    generateToken,
    hashPassword,
    verifyPassword,
    authenticateToken,
    authorizeRoles,
    adminOnly,
    teacherOrAdmin,
    authenticated,
    recordFailedLogin,
    resetFailedLogins,
    isAccountLocked,
};