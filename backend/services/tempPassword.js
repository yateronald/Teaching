const crypto = require('crypto');

// Letters and digits that cannot be mistaken for one another (no I, O, l, 0, 1).
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';

const pick = (pool) => pool[crypto.randomInt(pool.length)];

/**
 * A temporary password for a new account (changed at first sign-in): `len`
 * characters with at least one upper-case letter, one lower-case letter and one
 * digit, drawn from a cryptographically secure source.
 */
function generateTempPassword(len = 10) {
    const chars = [pick(UPPER), pick(LOWER), pick(DIGITS)];
    const all = UPPER + LOWER + DIGITS;
    while (chars.length < len) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

module.exports = { generateTempPassword };
