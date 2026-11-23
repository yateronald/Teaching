/**
 * Accounts of the public website (the courses): sign-up with an email code or
 * with Google, sign-in, sign-out, password reset, "My account" and the
 * Premium request.
 *
 * Rules that hold everywhere below:
 *  - One account per inbox: every lookup goes through the email key.
 *  - An account exists only once its email is confirmed (a code, the link in
 *    the same email, or Google saying it verified the address).
 *  - Nothing tells a stranger whether an email has an account: sign-up and
 *    password reset answer the same way, and only the inbox's owner is told.
 *  - Website sessions are cookies the page's scripts cannot read, and every
 *    change must come from the website itself (siteWriteGuard).
 */
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { authenticateToken, verifyPassword, recordFailedLogin, resetFailedLogins, isAccountLocked } = require('../middleware/auth');
const hints = require('../services/signInHints');
const sessions = require('../services/sessionService');
const { checkEmail, cleanEmail, emailKey, maskEmail } = require('../services/emailIdentity');
const { passwordProblem } = require('../services/passwordPolicy');
const access = require('../services/learnAccess');
const site = require('../services/siteSession');
const google = require('../services/googleAuth');
const billing = require('../services/billing');
const learnMode = require('../services/learnMode');
const learnEvents = require('../services/learnEvents');
const templates = require('../emails/templates/learnAccount');
const { sendEmail } = require('../emails/brevoService');

const router = express.Router();
router.use(site.siteWriteGuard);
router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Vary', 'Cookie');
    next();
});

const TERMS_VERSION = process.env.LEARN_TERMS_VERSION || '2026-11';
const CODE_MINUTES = 15;
const SIGNUP_HOURS = 24;
const MAX_TRIES = 5;
const MAX_SENDS = 5;
const RESEND_SECONDS = 60;
const SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// ── Small helpers ──
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const hmac = (s) => crypto.createHmac('sha256', SECRET).update(String(s)).digest('hex');
const newHandle = () => crypto.randomBytes(32).toString('base64url');
const newCode = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const sameHex = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length
    && crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
const langOf = (v) => (v === 'fr' ? 'fr' : 'en');
const ipOf = (req) => String(req.ip || '').replace('::ffff:', '').slice(0, 45) || null;

/** The website pages these routes send people to (same addresses as frontend/src/learn/account/paths.ts). */
const PAGES = {
    en: { signIn: '/learn/sign-in/', signUp: '/learn/sign-up/', forgot: '/learn/forgot-password/', account: '/learn/account/', complete: '/learn/complete-account/', hub: '/learn/' },
    fr: { signIn: '/fr/apprendre/connexion/', signUp: '/fr/apprendre/inscription/', forgot: '/fr/apprendre/mot-de-passe-oublie/', account: '/fr/apprendre/compte/', complete: '/fr/apprendre/finaliser-compte/', hub: '/fr/apprendre/' },
};
const siteBase = () => String(process.env.LEARN_SITE_URL || process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
const pageUrl = (lang, page, query = '') => `${siteBase()}${PAGES[langOf(lang)][page]}${query}`;

/** A return address inside the courses only: never another site (no open redirect). */
function safeNext(next, lang) {
    const n = String(next || '');
    if (n.length > 300 || !/^\/(learn|fr\/apprendre)(\/|$)/.test(n) || n.includes('//') || n.includes('\\')) return PAGES[langOf(lang)].account;
    return n;
}

/** Emails of the website. LEARN_EMAIL_DRY_RUN=true writes them to the log instead (local tests). */
function mail(to, { subject, html, text }) {
    if (String(process.env.LEARN_EMAIL_DRY_RUN || '').toLowerCase() === 'true') {
        console.log(`[learn-email] not sent (dry run) to ${maskEmail(to)}: ${subject}`);
        if (process.env.NODE_ENV !== 'production') console.log(`[learn-email] ${text.replace(/\n+/g, ' | ')}`);
        return Promise.resolve();
    }
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'support@learnfrenchwithnatives.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Learn French with Natives';
    return sendEmail({ from: from.includes('<') ? from : `${fromName} <${from}>`, to, subject, html, text })
        .catch(err => console.error(`[learn-email] failed to ${maskEmail(to)}:`, err.message));
}

const fail = (res, status, code, error, extra = {}) => res.status(status).json({ error, code, ...extra });

const PASSWORD_MESSAGES = {
    too_short: 'Use at least 10 characters.',
    too_long: 'Use at most 128 characters.',
    too_simple: 'This password is too easy to guess. Mix words, numbers or symbols.',
    breached: 'This password appeared in a data breach elsewhere. Choose another one.',
};
const EMAIL_MESSAGES = {
    invalid: 'Enter a valid email address.',
    disposable: 'Please use a permanent email address. You will need it for your receipts and to recover your account.',
    relay: 'Please use your real email address, not a forwarding address.',
    no_mail: 'This email address cannot receive emails. Check it for typos.',
};
const emailProblemCode = (p) => ({ invalid: 'BAD_EMAIL', disposable: 'EMAIL_DISPOSABLE', relay: 'EMAIL_RELAY', no_mail: 'EMAIL_NO_MAIL' }[p] || 'BAD_EMAIL');

/** Accounts are only looked up by email key once migration 030 is applied. */
async function requireReady(req, res) {
    if (await access.ready(req.db)) return true;
    fail(res, 503, 'NOT_READY', 'Website accounts are not available yet.');
    return false;
}

const findByEmail = (db, email) => db.get('SELECT * FROM users WHERE email_key = lfwn_email_key($1) ORDER BY id LIMIT 1', [email]);

/** A free username derived from the email ("awa.diop", "awa.diop2", …). */
async function freeUsername(db, email) {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]+/g, '').slice(0, 40) || 'learner';
    const padded = base.length >= 3 ? base : `${base}learner`;
    for (let i = 1; i < 200; i += 1) {
        const name = i === 1 ? padded : `${padded}${i}`;
        if (!(await db.get('SELECT 1 AS x FROM users WHERE lower(username) = $1', [name]))) return name;
    }
    return `${padded}${crypto.randomBytes(3).toString('hex')}`;
}

const cleanName = (v) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 50);
const cleanCountry = (v) => (/^[A-Z]{2}$/.test(String(v || '').toUpperCase()) ? String(v).toUpperCase() : null);

/** Creates a learner account (email already confirmed). Null when the email key was taken meanwhile. */
async function createLearner(db, p) {
    const username = await freeUsername(db, p.email);
    try {
        return await db.get(
            `INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active, must_change_password,
                                email_verified_at, signup_source, country, preferred_lang, terms_version, terms_accepted_at,
                                marketing_opt_in, has_password, password_changed_at, google_sub)
             VALUES ($1, $2, $3, 'learner', $4, $5, true, 0, now(), $6, $7, $8, $9, now(), $10, $11, now(), $12)
             RETURNING *`,
            [username, p.email, p.passwordHash, p.firstName, p.lastName || '', p.source, p.country, p.lang, TERMS_VERSION,
                !!p.marketing, p.hasPassword !== false, p.googleSub || null]);
    } catch (err) {
        if (err.code === '23505') return null;
        throw err;
    }
}

/** Signs a person in on the website and answers with who they are and what they may use. */
async function signedIn(req, res, user, extra = {}) {
    await site.openSiteSession(req.db, req, res, user);
    const [fresh, payments, mode] = await Promise.all([
        req.db.get(`SELECT ${site.USER_FIELDS} FROM users WHERE id = $1`, [user.id]),
        billing.enabled(req.db).catch(() => false),
        learnMode.getMode(req.db, { fresh: true }),
    ]);
    const a = await access.accessFor(req.db, fresh);
    res.setHeader('X-Learn-Mode', mode);
    return res.json({ user: site.publicUser(fresh), access: access.publicAccess(a), mode, google: google.config().enabled, payments, ...extra });
}

/** Why an existing account cannot sign in on the website, if it cannot. */
async function websiteRefusal(db, user) {
    if (!user.is_active) return { status: 403, code: 'ACCOUNT_DISABLED', error: 'Your account has been disabled. Please contact us.' };
    if (user.organization_id) {
        const org = await db.get('SELECT status FROM organizations WHERE id = $1', [user.organization_id]);
        if (!org || org.status === 'suspended') return { status: 403, code: 'ORG_SUSPENDED', error: 'Your company’s account is disabled. Please contact your company manager.' };
    }
    const a = await access.accessFor(db, user);
    if (!a.website) {
        return {
            status: 403,
            code: 'WEBSITE_ACCESS_OFF',
            error: user.organization_id
                ? 'Your account is managed by your company. Online courses are not enabled for it yet: ask your company manager.'
                : 'Your account is managed by your school. Online courses are not enabled for it yet: ask your teacher or contact us.',
        };
    }
    return null;
}

// ═══ Configuration the website needs ═══
router.get('/config', async (req, res) => {
    const [payments, mode] = await Promise.all([
        billing.enabled(req.db).catch(() => false),
        learnMode.getMode(req.db, { fresh: true }),
    ]);
    res.setHeader('X-Learn-Mode', mode);
    res.json({ google: google.config().enabled, payments, mode, terms_version: TERMS_VERSION });
});

// ═══ Who is signed in ═══
router.get('/me', site.siteAuth(), async (req, res) => {
    const user = req.siteUser;
    let request = null;
    if (user && await access.ready(req.db)) {
        request = await req.db.get(
            "SELECT status, created_at FROM learn_premium_requests WHERE user_id = $1 AND status = 'open'", [user.id]);
    }
    const [payments, mode] = await Promise.all([
        billing.enabled(req.db).catch(() => false),
        learnMode.getMode(req.db, { fresh: true }),
    ]);
    res.setHeader('X-Learn-Mode', mode);
    res.json({
        user: site.publicUser(user),
        access: access.publicAccess(req.siteAccess),
        premium_request: request || null,
        mode,
        google: google.config().enabled,
        payments,
    });
});

// ═══ Bridge an active portal session (Admin / Teacher / Student / Candidate / Org Admin) ═══
router.post('/portal-sync', authenticateToken, async (req, res) => {
    try {
        const [fresh, payments, mode] = await Promise.all([
            req.db.get(`SELECT ${site.USER_FIELDS} FROM users WHERE id = $1 AND is_active = true`, [req.user.id]),
            billing.enabled(req.db).catch(() => false),
            learnMode.getMode(req.db, { fresh: true }),
        ]);
        res.setHeader('X-Learn-Mode', mode);
        if (!fresh) return fail(res, 401, 'SESSION_ENDED', 'Account unavailable.');
        const a = await access.accessFor(req.db, fresh);
        if (a.website) {
            await site.openSiteSession(req.db, req, res, fresh).catch(err => {
                console.warn('[site-auth] portal-sync cookie skipped:', err.message);
            });
            let request = null;
            if (await access.ready(req.db)) {
                request = await req.db.get(
                    "SELECT status, created_at FROM learn_premium_requests WHERE user_id = $1 AND status = 'open'", [fresh.id]);
            }
            return res.json({
                user: site.publicUser(fresh),
                portal_user: null,
                access: access.publicAccess(a),
                portal_only: false,
                premium_request: request || null,
                mode,
                google: google.config().enabled,
                payments,
            });
        }
        // Portal-only user without online-courses access: share display identity ONLY, stay visitor on access.
        return res.json({
            user: null,
            portal_user: {
                id: fresh.id,
                first_name: fresh.first_name,
                last_name: fresh.last_name || '',
                email: fresh.email,
                role: fresh.role,
            },
            access: access.publicAccess(site.VISITOR),
            portal_only: true,
            premium_request: null,
            mode,
            google: google.config().enabled,
            payments,
        });
    } catch (err) {
        console.error('[site-auth] portal sync failed:', err.message);
        return fail(res, 500, 'FAILED', 'Could not verify portal session.');
    }
});

// ═══ Live mode & entitlement stream (SSE) ═══
router.get('/events', site.siteAuth(), async (req, res) => {
    try {
        const mode = await learnMode.getMode(req.db, { fresh: true });
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-store, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();
        res.write(`event: state\ndata: ${JSON.stringify({
            mode,
            level: req.siteAccess?.level || 'visitor',
            userId: req.siteUser?.id || null,
        })}\n\n`);
        res.flush?.();
        learnEvents.subscribe(res, {
            userId: req.siteUser?.id || null,
            orgId: req.siteUser?.organization_id || null,
        });
    } catch (err) {
        console.error('[site-auth] events failed:', err.message);
        if (!res.headersSent) res.status(503).end();
        else res.end();
    }
});

// ═══ Sign-up with email: step 1, the form ═══
router.post('/signup', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const b = req.body || {};
        const lang = langOf(b.lang);
        // A filled hidden field, or a form sent faster than a person can type,
        // is a robot: it gets an answer that looks like success and nothing else.
        if (String(b.website || '').trim() || (Number(b.elapsed_ms) > 0 && Number(b.elapsed_ms) < 1500)) {
            return res.json({ handle: newHandle(), resend_in: RESEND_SECONDS });
        }
        const firstName = cleanName(b.first_name);
        if (!firstName) return fail(res, 400, 'BAD_NAME', 'Enter your first name.');
        const country = cleanCountry(b.country);
        if (!country) return fail(res, 400, 'BAD_COUNTRY', 'Choose your country.');
        if (b.terms !== true) return fail(res, 400, 'TERMS_REQUIRED', 'Please accept the terms and the privacy policy.');

        const check = await checkEmail(b.email);
        if (!check.ok) return fail(res, 400, emailProblemCode(check.problem), EMAIL_MESSAGES[check.problem] || EMAIL_MESSAGES.invalid);
        if (check.suggestion && b.keep_email !== true) {
            return fail(res, 409, 'EMAIL_TYPO', `Did you mean ${check.suggestion}?`, { suggestion: check.suggestion });
        }
        const problem = await passwordProblem(b.password, { email: check.email });
        if (problem) return fail(res, 400, `PASSWORD_${problem.toUpperCase()}`, PASSWORD_MESSAGES[problem]);

        // At most 5 sign-ups per inbox per hour, whoever asks.
        const recent = await req.db.get(
            "SELECT COUNT(*)::int AS n FROM learn_pending_signups WHERE email_key = $1 AND created_at > now() - INTERVAL '1 hour'", [check.key]);
        if (recent.n >= 5) return fail(res, 429, 'TOO_MANY', 'Too many attempts with this email. Please try again in an hour.');

        // The password is hashed in both cases, so the answer takes as long
        // whether or not the email already has an account.
        const passwordHash = await bcrypt.hash(String(b.password), 12);
        const handle = newHandle();
        const existing = await req.db.get('SELECT id, role, first_name, organization_id, learn_access, is_active FROM users WHERE email_key = $1 LIMIT 1', [check.key]);
        const expires = new Date(Date.now() + SIGNUP_HOURS * 3600 * 1000);

        if (existing) {
            // No code: this sign-up can never finish. The owner hears about it, at most once an hour.
            const told = await req.db.get(
                "SELECT 1 AS x FROM learn_pending_signups WHERE email_key = $1 AND code_hash IS NULL AND created_at > now() - INTERVAL '1 hour'", [check.key]);
            await req.db.run(
                `INSERT INTO learn_pending_signups (handle_hash, email, email_key, first_name, password_hash, country, lang, marketing_opt_in, terms_version, expires_at, ip)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [sha256(handle), check.email, check.key, firstName, passwordHash, country, lang, !!b.marketing, TERMS_VERSION, expires, ipOf(req)]);
            if (!told && existing.is_active) {
                const a = await access.accessFor(req.db, { ...existing, learn_access: existing.learn_access });
                mail(check.email, templates.existingAccount({
                    lang, name: existing.first_name, portalOnly: !a.website,
                    signInUrl: pageUrl(lang, 'signIn'), resetUrl: pageUrl(lang, 'forgot'),
                }));
            }
        } else {
            const code = newCode();
            const link = newHandle();
            await req.db.run(
                `INSERT INTO learn_pending_signups (handle_hash, link_hash, code_hash, email, email_key, first_name, password_hash, country, lang, marketing_opt_in, terms_version, expires_at, ip)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
                [sha256(handle), sha256(link), hmac(`${handle}:${code}`), check.email, check.key, firstName, passwordHash, country, lang, !!b.marketing, TERMS_VERSION, expires, ipOf(req)]);
            mail(check.email, templates.signupCode({ lang, name: firstName, code, confirmUrl: pageUrl(lang, 'signUp', `?confirm=${encodeURIComponent(link)}`) }));
        }
        return res.json({ handle, email: check.email, resend_in: RESEND_SECONDS });
    } catch (err) {
        console.error('[site-auth] sign-up failed:', err.message);
        return fail(res, 500, 'FAILED', 'Sign-up failed. Please try again.');
    }
});

/** Finishes a confirmed sign-up: the pending row becomes an account. */
async function completeSignup(req, res, row) {
    // Claim the row first: two clicks on the same code create one account.
    const claimed = await req.db.get(
        'UPDATE learn_pending_signups SET used_at = now() WHERE id = $1 AND used_at IS NULL RETURNING id', [row.id]);
    if (!claimed) return fail(res, 400, 'CODE_USED', 'This sign-up is already finished. Please sign in.');
    let user;
    try {
        user = await createLearner(req.db, {
            email: row.email, passwordHash: row.password_hash, firstName: row.first_name, source: 'email',
            country: row.country, lang: row.lang, marketing: row.marketing_opt_in,
        });
    } catch (err) {
        await req.db.run('UPDATE learn_pending_signups SET used_at = NULL WHERE id = $1', [row.id]).catch(() => {});
        throw err;
    }
    if (!user) return fail(res, 409, 'EMAIL_TAKEN', 'An account already uses this email. Please sign in.');
    await access.logAccess(req.db, { userId: user.id, action: 'signup', detail: { source: 'email' } });
    return signedIn(req, res, user, { created: true });
}

// ═══ Sign-up step 2: the 6-digit code ═══
router.post('/signup/verify', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const handle = String(req.body?.handle || '');
        const code = String(req.body?.code || '').replace(/\D/g, '');
        const row = handle && await req.db.get(
            'SELECT * FROM learn_pending_signups WHERE handle_hash = $1 AND used_at IS NULL AND expires_at > now()', [sha256(handle)]);
        if (!row) return fail(res, 400, 'CODE_EXPIRED', 'This sign-up has expired. Please start again.');
        if (row.attempts >= MAX_TRIES) return fail(res, 400, 'CODE_LOCKED', 'Too many wrong codes. Ask for a new one.');
        const tried = await req.db.get('UPDATE learn_pending_signups SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts', [row.id]);
        const left = Math.max(0, MAX_TRIES - tried.attempts);
        const fresh = Date.now() - new Date(row.last_sent_at).getTime() < CODE_MINUTES * 60 * 1000;
        if (!row.code_hash || code.length !== 6 || !sameHex(row.code_hash, hmac(`${handle}:${code}`))) {
            return fail(res, 400, 'CODE_WRONG', left ? 'This code is not right. Check the email and try again.' : 'Too many wrong codes. Ask for a new one.', { tries_left: left });
        }
        if (!fresh) return fail(res, 400, 'CODE_OLD', 'This code has expired. Ask for a new one.');
        return completeSignup(req, res, row);
    } catch (err) {
        console.error('[site-auth] code check failed:', err.message);
        return fail(res, 500, 'FAILED', 'Something went wrong. Please try again.');
    }
});

// ═══ Sign-up: the "Confirm my email" button of the same email ═══
router.post('/signup/confirm', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const token = String(req.body?.token || '');
        const row = token.length >= 20 && await req.db.get(
            'SELECT * FROM learn_pending_signups WHERE link_hash = $1 AND used_at IS NULL AND expires_at > now()', [sha256(token)]);
        if (!row) return fail(res, 400, 'LINK_EXPIRED', 'This link has expired or was already used. Please sign in, or sign up again.');
        return completeSignup(req, res, row);
    } catch (err) {
        console.error('[site-auth] link check failed:', err.message);
        return fail(res, 500, 'FAILED', 'Something went wrong. Please try again.');
    }
});

// ═══ Sign-up: send the code again ═══
router.post('/signup/resend', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const handle = String(req.body?.handle || '');
        const row = handle && await req.db.get(
            'SELECT * FROM learn_pending_signups WHERE handle_hash = $1 AND used_at IS NULL AND expires_at > now()', [sha256(handle)]);
        if (!row) return fail(res, 400, 'CODE_EXPIRED', 'This sign-up has expired. Please start again.');
        const wait = RESEND_SECONDS - Math.floor((Date.now() - new Date(row.last_sent_at).getTime()) / 1000);
        if (wait > 0) return fail(res, 429, 'WAIT', `Please wait ${wait} seconds.`, { resend_in: wait });
        if (row.sends >= MAX_SENDS) return fail(res, 429, 'TOO_MANY', 'Too many codes sent. Please start again in an hour.');
        if (!row.code_hash) {
            // The email already has an account: nothing to send, the same answer.
            await req.db.run('UPDATE learn_pending_signups SET sends = sends + 1, last_sent_at = now() WHERE id = $1', [row.id]);
            return res.json({ ok: true, resend_in: RESEND_SECONDS });
        }
        const code = newCode();
        const link = newHandle();
        await req.db.run(
            'UPDATE learn_pending_signups SET code_hash = $2, link_hash = $3, attempts = 0, sends = sends + 1, last_sent_at = now() WHERE id = $1',
            [row.id, hmac(`${handle}:${code}`), sha256(link)]);
        mail(row.email, templates.signupCode({ lang: row.lang, name: row.first_name, code, confirmUrl: pageUrl(row.lang, 'signUp', `?confirm=${encodeURIComponent(link)}`) }));
        return res.json({ ok: true, resend_in: RESEND_SECONDS });
    } catch (err) {
        console.error('[site-auth] resend failed:', err.message);
        return fail(res, 500, 'FAILED', 'Something went wrong. Please try again.');
    }
});

// ═══ Sign-in with email and password ═══
router.post('/login', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const email = String(req.body?.email || '').trim().slice(0, 254);
        const password = String(req.body?.password || '').slice(0, 200);
        if (!cleanEmail(email) || !password) return fail(res, 400, 'BAD_INPUT', 'Enter your email and your password.');

        const lockedReply = (until) => fail(res, 423, 'ACCOUNT_LOCKED', `Too many failed attempts. Please try again after ${new Date(until).toLocaleString('en-GB', { timeZone: 'UTC' })} (UTC).`, { locked_until: new Date(until).toISOString() });
        const wrongReply = ({ lockUntil }) => (lockUntil ? lockedReply(lockUntil) : fail(res, 401, 'INVALID', 'Email or password is incorrect.'));

        const user = await findByEmail(req.db, email);
        // Unknown emails take as long, fail the same way and "lock" the same way.
        if (!user) {
            const ghost = hints.ghostLock(emailKey(email));
            if (ghost) return lockedReply(ghost.until);
            await verifyPassword(password, hints.DUMMY_HASH);
            return wrongReply(hints.ghostFailure(emailKey(email)));
        }
        const lock = await isAccountLocked(req.db, user.id);
        if (lock.locked && lock.reason === 'Temporarily locked') return lockedReply(lock.until);
        const ok = user.has_password !== false
            ? await verifyPassword(password, user.password_hash)
            : (await verifyPassword(password, hints.DUMMY_HASH), false);
        if (!ok) return wrongReply(await recordFailedLogin(req.db, user.id));
        await resetFailedLogins(req.db, user.id);

        // Said only to someone who knows the password.
        const refusal = await websiteRefusal(req.db, user);
        if (refusal) return fail(res, refusal.status, refusal.code, refusal.error);
        return signedIn(req, res, user);
    } catch (err) {
        console.error('[site-auth] sign-in failed:', err.message);
        return fail(res, 500, 'FAILED', 'Sign-in failed. Please try again.');
    }
});

// ═══ Sign-out ═══
router.post('/logout', site.siteAuth(), async (req, res) => {
    await site.closeSiteSession(req.db, req, res, 'logout');
    res.json({ ok: true });
});

router.post('/logout-all', site.siteAuth({ required: true }), async (req, res) => {
    const n = await site.endWebsiteSessions(req.db, req.siteUser.id, 'logout');
    await site.closeSiteSession(req.db, req, res, 'logout');
    res.json({ ok: true, ended: n });
});

// ═══ My account ═══
router.put('/me', site.siteAuth({ required: true }), async (req, res) => {
    try {
        const u = req.siteUser;
        const b = req.body || {};
        const sets = [];
        const vals = [];
        const set = (col, v) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
        // Names of class and company accounts are kept by the team.
        if (u.role === 'learner' && b.first_name !== undefined) {
            const n = cleanName(b.first_name);
            if (!n) return fail(res, 400, 'BAD_NAME', 'Enter your first name.');
            set('first_name', n);
        }
        if (u.role === 'learner' && b.last_name !== undefined) set('last_name', cleanName(b.last_name));
        if (b.country !== undefined) {
            const c = cleanCountry(b.country);
            if (!c) return fail(res, 400, 'BAD_COUNTRY', 'Choose your country.');
            set('country', c);
        }
        if (b.lang !== undefined) set('preferred_lang', langOf(b.lang));
        if (b.marketing_opt_in !== undefined) set('marketing_opt_in', b.marketing_opt_in === true);
        if (sets.length) {
            vals.push(u.id);
            await req.db.run(`UPDATE users SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${vals.length}`, vals);
        }
        const fresh = await req.db.get(`SELECT ${site.USER_FIELDS} FROM users WHERE id = $1`, [u.id]);
        res.json({ user: site.publicUser(fresh), access: access.publicAccess(req.siteAccess) });
    } catch (err) {
        console.error('[site-auth] account update failed:', err.message);
        fail(res, 500, 'FAILED', 'Could not save. Please try again.');
    }
});

// The devices signed in on the website
router.get('/sessions', site.siteAuth({ required: true }), async (req, res) => {
    const rows = await req.db.all(
        `SELECT id, device, EXTRACT(EPOCH FROM (LOCALTIMESTAMP - last_seen_at))::int AS idle_seconds,
                EXTRACT(EPOCH FROM (LOCALTIMESTAMP - created_at))::int AS age_seconds
           FROM user_sessions WHERE user_id = $1 AND door = 'website' AND ended_at IS NULL AND expires_at > LOCALTIMESTAMP
          ORDER BY last_seen_at DESC`, [req.siteUser.id]);
    res.json({ sessions: rows.map(r => sessions.publicView(r, req.siteSession.id)) });
});

router.delete('/sessions/:id', site.siteAuth({ required: true }), async (req, res) => {
    const id = Number(req.params.id);
    const row = Number.isInteger(id) && await req.db.get(
        "SELECT id FROM user_sessions WHERE id = $1 AND user_id = $2 AND door = 'website' AND ended_at IS NULL", [id, req.siteUser.id]);
    if (!row) return fail(res, 404, 'NOT_FOUND', 'Not found.');
    await sessions.endSessions(req.db, [id], 'logout');
    if (id === Number(req.siteSession.id)) await site.closeSiteSession(req.db, req, res, 'logout');
    res.json({ ok: true });
});

// Change (or, for a Google-only account, choose) the password
router.put('/password', site.siteAuth({ required: true }), async (req, res) => {
    try {
        const u = await req.db.get('SELECT id, email, password_hash, has_password FROM users WHERE id = $1', [req.siteUser.id]);
        const next = String(req.body?.password || '');
        if (u.has_password !== false) {
            const lock = await isAccountLocked(req.db, u.id);
            if (lock.locked && lock.reason === 'Temporarily locked') return fail(res, 423, 'ACCOUNT_LOCKED', 'Too many failed attempts. Please try again later.');
            if (!(await verifyPassword(String(req.body?.current || ''), u.password_hash))) {
                await recordFailedLogin(req.db, u.id);
                return fail(res, 400, 'WRONG_PASSWORD', 'Your current password is not right.');
            }
            await resetFailedLogins(req.db, u.id);
        }
        const problem = await passwordProblem(next, { email: u.email });
        if (problem) return fail(res, 400, `PASSWORD_${problem.toUpperCase()}`, PASSWORD_MESSAGES[problem]);
        await req.db.run(
            "UPDATE users SET password_hash = $2, has_password = true, must_change_password = 0, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [u.id, await bcrypt.hash(next, 12)]);
        // Every other device, on both doors, is signed out.
        const ended = await sessions.endAllForUser(req.db, u.id, 'password', req.siteSession.id).catch(() => 0);
        await access.logAccess(req.db, { userId: u.id, actorId: u.id, action: 'password_changed' });
        res.json({ ok: true, signed_out_devices: ended });
    } catch (err) {
        console.error('[site-auth] password change failed:', err.message);
        fail(res, 500, 'FAILED', 'Could not change the password. Please try again.');
    }
});

// ═══ Forgotten password ═══
router.post('/password/forgot', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const email = cleanEmail(req.body?.email);
        if (!email) return fail(res, 400, 'BAD_EMAIL', EMAIL_MESSAGES.invalid);
        const lang = langOf(req.body?.lang);
        const handle = newHandle();
        const user = await findByEmail(req.db, email);
        let target = null;
        if (user && user.is_active && !(await websiteRefusal(req.db, user))) {
            const recent = await req.db.get(
                "SELECT COUNT(*)::int AS n FROM learn_codes WHERE user_id = $1 AND purpose = 'reset' AND created_at > now() - INTERVAL '1 hour'", [user.id]);
            if (recent.n < 3) target = user;
        }
        const code = newCode();
        await req.db.run(
            `INSERT INTO learn_codes (handle_hash, user_id, purpose, code_hash, expires_at) VALUES ($1, $2, 'reset', $3, now() + make_interval(mins => $4))`,
            [sha256(handle), target ? target.id : null, target ? hmac(`${handle}:${code}`) : null, CODE_MINUTES]);
        if (target) mail(target.email, templates.resetCode({ lang: target.preferred_lang || lang, name: target.first_name, code }));
        // The same answer whether or not the email has an account.
        res.json({ handle });
    } catch (err) {
        console.error('[site-auth] forgot failed:', err.message);
        fail(res, 500, 'FAILED', 'Something went wrong. Please try again.');
    }
});

router.post('/password/reset', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const handle = String(req.body?.handle || '');
        const code = String(req.body?.code || '').replace(/\D/g, '');
        const row = handle && await req.db.get(
            "SELECT * FROM learn_codes WHERE handle_hash = $1 AND purpose = 'reset' AND used_at IS NULL AND expires_at > now()", [sha256(handle)]);
        if (!row) return fail(res, 400, 'CODE_EXPIRED', 'This code has expired. Ask for a new one.');
        if (row.attempts >= MAX_TRIES) return fail(res, 400, 'CODE_LOCKED', 'Too many wrong codes. Ask for a new one.');
        const tried = await req.db.get('UPDATE learn_codes SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts', [row.id]);
        if (!row.code_hash || code.length !== 6 || !sameHex(row.code_hash, hmac(`${handle}:${code}`))) {
            return fail(res, 400, 'CODE_WRONG', 'This code is not right. Check the email and try again.', { tries_left: Math.max(0, MAX_TRIES - tried.attempts) });
        }
        const user = await req.db.get('SELECT * FROM users WHERE id = $1', [row.user_id]);
        const problem = await passwordProblem(req.body?.password, { email: user.email });
        if (problem) return fail(res, 400, `PASSWORD_${problem.toUpperCase()}`, PASSWORD_MESSAGES[problem]);
        const claimed = await req.db.get('UPDATE learn_codes SET used_at = now() WHERE id = $1 AND used_at IS NULL RETURNING id', [row.id]);
        if (!claimed) return fail(res, 400, 'CODE_USED', 'This code was already used.');
        await req.db.run(
            `UPDATE users SET password_hash = $2, has_password = true, must_change_password = 0, password_changed_at = CURRENT_TIMESTAMP,
                    failed_login_attempts = 0, account_locked_until = NULL, email_verified_at = COALESCE(email_verified_at, now()),
                    updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [user.id, await bcrypt.hash(String(req.body.password), 12)]);
        // Whoever knew the old password is signed out everywhere.
        await sessions.endAllForUser(req.db, user.id, 'password').catch(() => 0);
        await access.logAccess(req.db, { userId: user.id, actorId: user.id, action: 'password_reset' });
        const refusal = await websiteRefusal(req.db, user);
        if (refusal) return res.json({ ok: true, signed_in: false });
        return signedIn(req, res, user, { ok: true, signed_in: true });
    } catch (err) {
        console.error('[site-auth] reset failed:', err.message);
        fail(res, 500, 'FAILED', 'Something went wrong. Please try again.');
    }
});

// ═══ "I would like Premium" (until online payment exists) ═══
router.post('/premium-request', site.siteAuth({ required: true }), async (req, res) => {
    try {
        if (req.siteAccess.level === 'premium') return fail(res, 409, 'ALREADY_PREMIUM', 'You already have Premium.');
        const message = String(req.body?.message || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, 500) || null;
        const row = await req.db.get(
            `INSERT INTO learn_premium_requests (user_id, message) VALUES ($1, $2)
             ON CONFLICT (user_id) WHERE status = 'open' DO NOTHING RETURNING id, created_at`,
            [req.siteUser.id, message]);
        if (row) await access.logAccess(req.db, { userId: req.siteUser.id, actorId: req.siteUser.id, action: 'premium_requested' });
        res.json({ ok: true, already: !row });
    } catch (err) {
        console.error('[site-auth] premium request failed:', err.message);
        fail(res, 500, 'FAILED', 'Could not send your request. Please try again.');
    }
});

// ═══ Continue with Google ═══
const STAFF = access.STAFF;

router.get('/google/start', site.siteAuth(), (req, res) => {
    const lang = langOf(req.query.lang);
    if (!google.config().enabled) return res.redirect(302, pageUrl(lang, 'signIn', '?error=google_unavailable'));
    const mode = req.query.mode === 'link' && req.siteUser ? 'link' : 'signin';
    const g = google.startRequest({ lang });
    site.setFlowCookie(res, 'lfwn_g', {
        s: g.state, n: g.nonce, v: g.verifier, lang, mode,
        next: safeNext(req.query.next, lang), uid: mode === 'link' ? req.siteUser.id : undefined,
    }, 10);
    res.redirect(302, g.url);
});

router.get('/google/callback', async (req, res) => {
    const flow = site.readFlowCookie(req, 'lfwn_g');
    site.clearFlowCookie(res, 'lfwn_g');
    const lang = langOf(flow?.lang);
    const back = (page, error, extra = '') => res.redirect(302, pageUrl(lang, page, `?${error ? `error=${error}` : ''}${extra}`));
    if (!flow) return back('signIn', 'google_expired');
    if (req.query.error) return back(flow.mode === 'link' ? 'account' : 'signIn', 'google_cancelled');
    if (!google.sameValue(req.query.state, flow.s) || !req.query.code) return back('signIn', 'google_failed');
    if (!(await access.ready(req.db))) return back('signIn', 'google_unavailable');

    let person;
    try {
        person = await google.finish({ code: String(req.query.code), verifier: flow.v, nonce: flow.n });
    } catch (err) {
        console.error('[site-auth] Google sign-in failed:', err.message);
        return back('signIn', 'google_failed');
    }
    if (!person.email || !person.emailVerified) return back('signIn', 'google_unverified');
    const check = await checkEmail(person.email);
    if (!check.ok && check.problem !== 'no_mail') return back('signIn', check.problem === 'relay' ? 'email_relay' : check.problem === 'invalid' ? 'google_failed' : 'email_disposable');

    try {
        // Linking Google to the signed-in account, from "My account".
        if (flow.mode === 'link') {
            const user = await req.db.get('SELECT * FROM users WHERE id = $1', [flow.uid]);
            if (!user || STAFF.has(user.role)) return back('account', 'google_staff');
            const owner = await req.db.get('SELECT id FROM users WHERE google_sub = $1', [person.sub]);
            if (owner && owner.id !== user.id) return back('account', 'google_in_use');
            if (user.email_key !== emailKey(person.email)) return back('account', 'google_other_email');
            await req.db.run('UPDATE users SET google_sub = $2, email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1', [user.id, person.sub]);
            await access.logAccess(req.db, { userId: user.id, actorId: user.id, action: 'google_linked' });
            mail(user.email, templates.googleLinked({ lang: user.preferred_lang || lang, name: user.first_name, resetUrl: pageUrl(lang, 'forgot') }));
            return res.redirect(302, pageUrl(lang, 'account', '?google=linked'));
        }

        const signIn = async (user) => {
            if (STAFF.has(user.role)) return back('signIn', 'google_staff');
            const refusal = await websiteRefusal(req.db, user);
            if (refusal) return back('signIn', refusal.code === 'WEBSITE_ACCESS_OFF' ? 'website_off' : 'account_disabled');
            await resetFailedLogins(req.db, user.id);
            await site.openSiteSession(req.db, req, res, user);
            return res.redirect(302, `${siteBase()}${safeNext(flow.next, lang)}`);
        };

        const byGoogle = await req.db.get('SELECT * FROM users WHERE google_sub = $1', [person.sub]);
        if (byGoogle) return signIn(byGoogle);

        const byEmail = await findByEmail(req.db, person.email);
        if (byEmail) {
            if (STAFF.has(byEmail.role)) return back('signIn', 'google_staff');
            if (byEmail.google_sub) return back('signIn', 'google_in_use');
            if (google.googleOwnsInbox(person)) {
                // Google owns this inbox: the same person, linked at once (and told by email).
                await req.db.run('UPDATE users SET google_sub = $2, email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1 AND google_sub IS NULL', [byEmail.id, person.sub]);
                await access.logAccess(req.db, { userId: byEmail.id, actorId: byEmail.id, action: 'google_linked' });
                mail(byEmail.email, templates.googleLinked({ lang: byEmail.preferred_lang || lang, name: byEmail.first_name, resetUrl: pageUrl(lang, 'forgot') }));
                return signIn(byEmail);
            }
            // Another provider's address on a Google account: the password confirms it once.
            site.setFlowCookie(res, 'lfwn_gl', { sub: person.sub, uid: byEmail.id, lang, next: safeNext(flow.next, lang) }, 10);
            return res.redirect(302, pageUrl(lang, 'signIn', `?link=google&email=${encodeURIComponent(byEmail.email)}`));
        }

        // A new person: a few details and the terms, then the account exists.
        site.setFlowCookie(res, 'lfwn_gn', {
            sub: person.sub, email: check.email || person.email, given: person.givenName.slice(0, 50), family: person.familyName.slice(0, 50),
            lang, next: safeNext(flow.next, lang),
        }, 15);
        return res.redirect(302, pageUrl(lang, 'complete'));
    } catch (err) {
        console.error('[site-auth] Google account step failed:', err.message);
        return back('signIn', 'google_failed');
    }
});

// The new Google account's details, for the "complete your account" page
router.get('/google/pending', (req, res) => {
    const g = site.readFlowCookie(req, 'lfwn_gn');
    if (!g) return fail(res, 404, 'EXPIRED', 'This step has expired. Please continue with Google again.');
    res.json({ email: g.email, first_name: g.given || '', last_name: g.family || '' });
});

router.post('/google/complete', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const g = site.readFlowCookie(req, 'lfwn_gn');
        if (!g) return fail(res, 400, 'EXPIRED', 'This step has expired. Please continue with Google again.');
        const b = req.body || {};
        const firstName = cleanName(b.first_name) || cleanName(g.given);
        if (!firstName) return fail(res, 400, 'BAD_NAME', 'Enter your first name.');
        const country = cleanCountry(b.country);
        if (!country) return fail(res, 400, 'BAD_COUNTRY', 'Choose your country.');
        if (b.terms !== true) return fail(res, 400, 'TERMS_REQUIRED', 'Please accept the terms and the privacy policy.');
        // A random password nobody knows: this account signs in with Google until a password is chosen.
        const user = await createLearner(req.db, {
            email: g.email, passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('base64'), 12), hasPassword: false,
            firstName, lastName: cleanName(b.last_name ?? g.family), source: 'google', country, lang: langOf(b.lang || g.lang),
            marketing: b.marketing === true, googleSub: g.sub,
        });
        site.clearFlowCookie(res, 'lfwn_gn');
        if (!user) return fail(res, 409, 'EMAIL_TAKEN', 'An account already uses this email. Please sign in.');
        await access.logAccess(req.db, { userId: user.id, action: 'signup', detail: { source: 'google' } });
        return signedIn(req, res, user, { created: true, next: g.next });
    } catch (err) {
        console.error('[site-auth] Google sign-up failed:', err.message);
        fail(res, 500, 'FAILED', 'Sign-up failed. Please try again.');
    }
});

// An existing account (non-Google email) confirms with its password before Google is linked
router.post('/google/link', async (req, res) => {
    try {
        if (!(await requireReady(req, res))) return;
        const g = site.readFlowCookie(req, 'lfwn_gl');
        if (!g) return fail(res, 400, 'EXPIRED', 'This step has expired. Please continue with Google again.');
        const user = await req.db.get('SELECT * FROM users WHERE id = $1', [g.uid]);
        if (!user || STAFF.has(user.role)) return fail(res, 400, 'EXPIRED', 'This step has expired.');
        const lock = await isAccountLocked(req.db, user.id);
        if (lock.locked && lock.reason === 'Temporarily locked') return fail(res, 423, 'ACCOUNT_LOCKED', 'Too many failed attempts. Please try again later.');
        if (user.has_password === false || !(await verifyPassword(String(req.body?.password || ''), user.password_hash))) {
            const r = await recordFailedLogin(req.db, user.id);
            return fail(res, r.lockUntil ? 423 : 401, r.lockUntil ? 'ACCOUNT_LOCKED' : 'INVALID', 'Your password is not right.');
        }
        await resetFailedLogins(req.db, user.id);
        const refusal = await websiteRefusal(req.db, user);
        if (refusal) return fail(res, refusal.status, refusal.code, refusal.error);
        const taken = await req.db.get('SELECT id FROM users WHERE google_sub = $1 AND id <> $2', [g.sub, user.id]);
        site.clearFlowCookie(res, 'lfwn_gl');
        if (!taken) {
            await req.db.run('UPDATE users SET google_sub = $2 WHERE id = $1 AND google_sub IS NULL', [user.id, g.sub]);
            await access.logAccess(req.db, { userId: user.id, actorId: user.id, action: 'google_linked' });
            mail(user.email, templates.googleLinked({ lang: user.preferred_lang || g.lang, name: user.first_name, resetUrl: pageUrl(g.lang, 'forgot') }));
        }
        return signedIn(req, res, user, { next: g.next });
    } catch (err) {
        console.error('[site-auth] Google link failed:', err.message);
        fail(res, 500, 'FAILED', 'Something went wrong. Please try again.');
    }
});

router.delete('/google', site.siteAuth({ required: true }), async (req, res) => {
    const u = await req.db.get('SELECT has_password FROM users WHERE id = $1', [req.siteUser.id]);
    if (u.has_password === false) return fail(res, 409, 'SET_PASSWORD_FIRST', 'Choose a password first, so you can still sign in without Google.');
    await req.db.run('UPDATE users SET google_sub = NULL WHERE id = $1', [req.siteUser.id]);
    await access.logAccess(req.db, { userId: req.siteUser.id, actorId: req.siteUser.id, action: 'google_unlinked' });
    res.json({ ok: true });
});

module.exports = router;
