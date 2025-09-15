const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT token generation
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Password hashing
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Password verification
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        // TEMP DEBUG: Log incoming auth header
        console.log(`[AUTH DEBUG] ${req.method} ${req.originalUrl} - authorization:`, req.headers['authorization']);

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user details from database
        const user = await req.db.get(
            'SELECT id, username, email, role, first_name, last_name FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid token - user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Access denied', 
                message: `Required role: ${roles.join(' or ')}` 
            });
        }

        next();
    };
};

// Admin only middleware
const adminOnly = authorizeRoles('admin');

// Teacher or Admin middleware
const teacherOrAdmin = authorizeRoles('teacher', 'admin');

// Student, Teacher or Admin middleware
const authenticated = authorizeRoles('student', 'teacher', 'admin');

module.exports = {
    generateToken,
    hashPassword,
    verifyPassword,
    authenticateToken,
    authorizeRoles,
    adminOnly,
    teacherOrAdmin,
    authenticated
};