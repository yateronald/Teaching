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
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Fetch user from DB and attach to request (include created_at for profile dates)
        const user = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name, created_at, must_change_password, password_changed_at, password_expires_at FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid token: user not found' });
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

module.exports = {
    generateToken,
    hashPassword,
    verifyPassword,
    authenticateToken,
    authorizeRoles,
    adminOnly,
    teacherOrAdmin,
    authenticated,
};