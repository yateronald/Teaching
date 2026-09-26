const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sessions = require('../services/sessionService');
const { hasColumn } = require('../services/schemaFeatures');
const orgs = require('../services/organizationService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const TOKEN_DAYS = 7;
/** The mobile app stays signed in for six months (renewed while it is used). */
const MOBILE_TOKEN_DAYS = 180;
/** Roles the mobile app serves; only these get the long mobile session. */
const MOBILE_ROLES = ['teacher', 'admin'];

/** True when the request comes from the Learn French with Natives mobile app. */
const isMobileApp = (req) => /^lfwn-mobile\//i.test(String(req.headers['x-client-app'] || ''));
/** How long a token issued to this user on this client lives, in days. */
const tokenDaysFor = (req, role) => (isMobileApp(req) && MOBILE_ROLES.includes(role) ? MOBILE_TOKEN_DAYS : TOKEN_DAYS);

const ROLES = ['admin', 'teacher', 'student', 'candidate', 'org_admin'];

// Exam candidates only prepare for the exam: they reach their account, their
// notifications and the exam practice API — nothing else (no classes, batches,
// quizzes, resources, schedules or meetings). Deny by default: a route added
// later stays closed to them until it is listed here.
const CANDIDATE_API = [
    /^\/api\/auth\/(profile|verify|change-password|timezones|profile-photo|logout|sessions)(\/|$)/,
    /^\/api\/email-change\//,
    /^\/api\/notifications(\/|$)/,
    /^\/api\/ai-credits\/me(\/|$)/,
    /^\/api\/tcf\/student\//,
    /^\/api\/tcf\/ee\/simulation\//,
    /^\/api\/eo-simulation\//,
    /^\/api\/exam-space(\/|$)/,
];
const candidateMayUse = (req) => {
    const pathname = (req.originalUrl || '').split('?')[0];
    return CANDIDATE_API.some(rule => rule.test(pathname));
};

// Company managers run their company's space and nothing else. Deny by default
// as for candidates: a route added later stays closed to them until listed here.
const ORG_ADMIN_API = [
    /^\/api\/auth\/(profile|verify|change-password|timezones|profile-photo|logout|sessions)(\/|$)/,
    /^\/api\/email-change\//,
    /^\/api\/notifications(\/|$)/,
    /^\/api\/org(\/|$)/,
];
const orgAdminMayUse = (req) => {
    const pathname = (req.originalUrl || '').split('?')[0];
    return ORG_ADMIN_API.some(rule => rule.test(pathname));
};

/** Refusal sent to every account of a company the administrator disabled. */
const ORG_SUSPENDED = {
    error: 'Company account disabled',
    message: 'Your company’s account is disabled. Please contact the administrator.',
    code: 'ORG_SUSPENDED',
};

// Generate JWT token. A `jti` ties the token to a row in user_sessions, which
// is what makes it revocable — sign-outs, takeovers and password changes end
// the session, and every later request with that token is refused.
function generateToken(userId, role, jti, days = TOKEN_DAYS) {
    const claims = jti ? { id: userId, role, jti } : { id: userId, role };
    // Marks mobile tokens so they, and only they, can be renewed.
    if (days === MOBILE_TOKEN_DAYS) claims.app = 'mobile';
    return jwt.sign(claims, JWT_SECRET, { expiresIn: `${days}d` });
}

/** When a token signed now stops being accepted. */
const tokenExpiry = (days = TOKEN_DAYS) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

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
        // Fetch user from DB and attach to request (include security fields).
        // The monitoring flag is only selected once its migration has run, so
        // deploying this code before the migration cannot lock anyone out.
        const monitoring = await hasColumn(req.db, 'users', 'can_view_monitoring') ? ', can_view_monitoring' : '';
        const withOrg = await hasColumn(req.db, 'users', 'organization_id');
        const user = await req.db.get(
            `SELECT id, username, email, role, first_name, last_name, timezone, created_at, must_change_password, password_changed_at, password_expires_at, is_active, failed_login_attempts, account_locked_until, profile_photo_kdrive_file_id${monitoring}${withOrg ? ', organization_id' : ''} FROM users WHERE id = ?`,
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

        // A company account lives and dies with its company: once the administrator
        // disables the company, every manager and learner of it is refused here, on
        // every request, whatever token or open tab they still hold. Checked before
        // the session, so the person is told why they are out.
        if (user.organization_id) {
            const org = await req.db.get('SELECT * FROM organizations WHERE id = ?', [user.organization_id]);
            if (!org || org.status === 'suspended') return res.status(403).json(ORG_SUSPENDED);
            user.organization = orgs.brandOf(org);
        } else if (user.role === 'org_admin') {
            return res.status(403).json(ORG_SUSPENDED); // a manager without a company has nothing to run
        }

        // Compute force password change flag
        const mustChange = !!user.must_change_password;
        const expired = user.password_expires_at ? (new Date(user.password_expires_at) <= new Date()) : false;
        user.force_password_change = mustChange || expired;

        // The signed-in device must still be signed in. A token whose session was
        // ended (sign-out, another device taking over, an administrator, a password
        // change) or left idle too long stops working here.
        if (decoded.jti) {
            const session = await sessions.liveSession(req.db, decoded.jti);
            if (!session || Number(session.user_id) !== Number(user.id)) {
                return res.status(401).json({
                    error: 'Session ended',
                    message: 'You are signed out on this device. Please sign in again.',
                    code: 'SESSION_ENDED',
                });
            }
            req.session = session;
            user.session_id = session.id;
            await sessions.touch(req.db, session);
        } else if (sessions.limitFor(user.role) !== null && await sessions.ready(req.db)) {
            // A role with a device limit may only use tokens that can be counted.
            return res.status(401).json({
                error: 'Session ended',
                message: 'Please sign in again to continue.',
                code: 'SESSION_ENDED',
            });
        }

        if (user.role === 'candidate' && !candidateMayUse(req)) {
            return res.status(403).json({ error: 'This area is not part of your exam preparation space.', code: 'ROLE_NOT_ALLOWED' });
        }
        if (user.role === 'org_admin' && !orgAdminMayUse(req)) {
            return res.status(403).json({ error: 'This area is not part of your company space.', code: 'ROLE_NOT_ALLOWED' });
        }

        req.user = user;
        req.tokenClaims = decoded;
        next();
    } catch (error) {
        // Only a bad or expired token means "signed out". A database hiccup must
        // not sign the mobile app out of its six-month session.
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Token authentication error:', error);
        return res.status(503).json({ error: 'Service temporarily unavailable', message: 'Please try again in a moment.' });
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

// Website monitoring is a separate key, given to an administrator one at a
// time: being an admin is not enough, the account must also be allowed to see
// what visitors do on the public site.
function monitoringOnly(req, res, next) {
    if (req.user?.role !== 'admin' || !req.user?.can_view_monitoring) {
        return res.status(403).json({
            error: 'Website monitoring is not part of your access.',
            code: 'MONITORING_NOT_ALLOWED',
        });
    }
    next();
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
    ROLES,
    candidateMayUse,
    orgAdminMayUse,
    ORG_SUSPENDED,
    generateToken,
    tokenExpiry,
    tokenDaysFor,
    isMobileApp,
    MOBILE_TOKEN_DAYS,
    hashPassword,
    verifyPassword,
    authenticateToken,
    authorizeRoles,
    adminOnly,
    monitoringOnly,
    teacherOrAdmin,
    authenticated,
    recordFailedLogin,
    resetFailedLogins,
    isAccountLocked,
};