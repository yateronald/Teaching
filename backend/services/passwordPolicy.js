/**
 * Passwords of website accounts: long enough, not trivial, and not one of the
 * passwords already published in data breaches.
 *
 * The breach check uses the free Pwned Passwords service by "k-anonymity":
 * only the first 5 characters of the password's SHA-1 hash leave the server,
 * never the password nor its full hash. If the service cannot be reached the
 * password is accepted (a sign-up never fails because of it).
 * LEARN_PWNED_CHECK=false turns the check off.
 */
const crypto = require('crypto');

const MIN = 10;
const MAX = 128;

async function breached(password) {
    if (String(process.env.LEARN_PWNED_CHECK || 'true').toLowerCase() === 'false') return false;
    const sha1 = crypto.createHash('sha1').update(password, 'utf8').digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    try {
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
            headers: { 'Add-Padding': 'true', 'User-Agent': 'lfwn-password-check' },
            signal: AbortSignal.timeout(2500),
        });
        if (!res.ok) return false;
        const body = await res.text();
        return body.split('\n').some(line => {
            const [hash, count] = line.trim().split(':');
            return hash === suffix && Number(count) > 0;
        });
    } catch {
        return false;
    }
}

/**
 * null when the password may be used, else why not:
 * 'too_short' | 'too_long' | 'too_simple' | 'breached'.
 */
async function passwordProblem(password, { email } = {}) {
    const p = String(password ?? '');
    if (p.length < MIN) return 'too_short';
    if (p.length > MAX) return 'too_long';
    const lower = p.toLowerCase();
    const local = String(email || '').split('@')[0].toLowerCase();
    if (/^(.)\1+$/.test(p) || new Set(p).size < 4 || (local.length >= 4 && lower.includes(local))) return 'too_simple';
    if (await breached(p)) return 'breached';
    return null;
}

module.exports = { passwordProblem, MIN_PASSWORD: MIN, MAX_PASSWORD: MAX };
