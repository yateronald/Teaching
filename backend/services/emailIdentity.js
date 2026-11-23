/**
 * Email addresses of website accounts: one account per inbox, no throw-away
 * addresses, and a hint when a domain looks mistyped.
 *
 * The email key is an address reduced to its real inbox. It must give exactly
 * what the database function lfwn_email_key gives (migration 030): the
 * database keeps every account's key itself, this one is for checks made
 * before an account exists.
 */
const dns = require('dns').promises;
const fs = require('fs');
const path = require('path');

/** The address reduced to its inbox: lfwn_email_key in JavaScript. */
function emailKey(address) {
    if (address == null) return null;
    const e = String(address).trim().toLowerCase();
    const at = e.lastIndexOf('@');
    if (at < 0) return e;
    let local = e.slice(0, at);
    let domain = e.slice(at + 1).replace(/\.+$/, '');
    if (domain === 'googlemail.com') domain = 'gmail.com';
    const plus = local.indexOf('+');
    if (plus > 0) local = local.slice(0, plus);
    if (domain === 'gmail.com') local = local.replace(/\./g, '');
    return `${local}@${domain}`;
}

// Plain addresses only on self sign-up: no quotes, comments, IP addresses or
// non-Latin characters (look-alike letters), and room for the 100 characters
// the accounts table keeps.
const LOCAL_RE = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

/** A clean, lower-case address, or null when it is not an address we accept. */
function cleanEmail(input) {
    const e = String(input ?? '').trim().toLowerCase();
    if (!e || e.length > 100 || /[^\x21-\x7e]/.test(e)) return null;
    const at = e.lastIndexOf('@');
    if (at < 1 || at !== e.indexOf('@')) return null;
    const local = e.slice(0, at);
    const domain = e.slice(at + 1);
    if (local.length > 64 || !LOCAL_RE.test(local)) return null;
    const labels = domain.split('.');
    if (labels.length < 2 || labels.some(l => !LABEL_RE.test(l))) return null;
    if (!/^[a-z]{2,}$/.test(labels[labels.length - 1]) && !/^xn--/.test(labels[labels.length - 1])) return null;
    return e;
}

const domainOf = (email) => email.slice(email.lastIndexOf('@') + 1);

// ── Typing mistakes ──
// Exact typos seen often, then near misses of the most common providers (one
// letter wrong, missing, extra or swapped). Short names are left out of the
// near-miss check: aon.com or msu.edu are real.
const TYPOS = {
    'gmil.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com', 'gmail.cmo': 'gmail.com',
    'gmail.fr': 'gmail.com', 'gmail.ca': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'homail.com': 'hotmail.com',
    'outlok.com': 'outlook.com', 'outllok.com': 'outlook.com', 'outlook.co': 'outlook.com', 'outlook.con': 'outlook.com',
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'yhoo.com': 'yahoo.com',
    'iclod.com': 'icloud.com', 'icoud.com': 'icloud.com', 'icloud.co': 'icloud.com', 'icloud.con': 'icloud.com',
};
const POPULAR = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'hotmail.fr', 'yahoo.fr',
    'outlook.fr', 'orange.fr', 'laposte.net', 'wanadoo.fr', 'videotron.ca', 'sympatico.ca', 'protonmail.com',
];

/** True when a and b differ by one letter changed, added, removed, or two neighbours swapped. */
function oneEditApart(a, b) {
    if (a === b || Math.abs(a.length - b.length) > 1) return false;
    if (a.length === b.length) {
        const diff = [];
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff.push(i);
        if (diff.length === 1) return true;
        return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]];
    }
    const [s, l] = a.length < b.length ? [a, b] : [b, a];
    let i = 0;
    while (i < s.length && s[i] === l[i]) i++;
    return s.slice(i) === l.slice(i + 1);
}

/** The address the person probably meant, when the domain looks mistyped. */
function suggestEmail(email) {
    const domain = domainOf(email);
    const fix = TYPOS[domain] || (POPULAR.includes(domain) ? null : POPULAR.find(p => oneEditApart(domain, p)));
    return fix ? `${email.slice(0, email.lastIndexOf('@'))}@${fix}` : null;
}

// ── Throw-away and forwarding addresses ──
// data/disposable-domains.txt: throw-away inbox services (a starter list kept
// here, refreshed from the community list by scripts/update-disposable-domains.js).
// data/email-relay-domains.txt: forwarding services that create unlimited
// addresses for one person; blocked unless LEARN_ALLOW_RELAY_EMAILS=true.
const DATA = path.join(__dirname, '..', 'data');
let lists = null;
function loadList(file) {
    try {
        return new Set(fs.readFileSync(path.join(DATA, file), 'utf8').split(/\r?\n/)
            .map(l => l.trim().toLowerCase()).filter(l => l && !l.startsWith('#')));
    } catch {
        return new Set();
    }
}
function domainLists() {
    if (!lists) {
        const disposable = loadList('disposable-domains.txt');
        for (const d of loadList('disposable-domains.community.txt')) disposable.add(d);
        lists = { disposable, relay: loadList('email-relay-domains.txt'), extra: loadList('disposable-domains.local.txt') };
    }
    return lists;
}
/** Forget the cached lists (after the weekly refresh). */
const reloadDomainLists = () => { lists = null; };

/** The domain and every parent domain: a.b.mailinator.com → …, mailinator.com. */
function withParents(domain) {
    const parts = domain.split('.');
    const out = [];
    for (let i = 0; i < parts.length - 1; i++) out.push(parts.slice(i).join('.'));
    return out;
}
const inList = (set, domain) => withParents(domain).some(d => set.has(d));

const relayAllowed = () => String(process.env.LEARN_ALLOW_RELAY_EMAILS || '').toLowerCase() === 'true';

/** 'disposable' | 'relay' | null, from the lists alone (no network). */
function listedProblem(domain) {
    const { disposable, relay, extra } = domainLists();
    if (inList(disposable, domain) || inList(extra, domain)) return 'disposable';
    if (!relayAllowed() && inList(relay, domain)) return 'relay';
    return null;
}

// Big providers: never looked up, never blocked.
const TRUSTED = new Set([
    'gmail.com', 'yahoo.com', 'yahoo.fr', 'yahoo.ca', 'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr',
    'live.com', 'live.fr', 'live.ca', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'protonmail.com',
    'proton.me', 'pm.me', 'gmx.com', 'gmx.fr', 'orange.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'wanadoo.fr',
    'videotron.ca', 'sympatico.ca', 'yandex.com', 'zoho.com', 'mail.com',
]);

// Mail servers of a domain: a domain with no mail server cannot receive the
// code, and a brand-new domain served by a throw-away service's mail servers is
// one of theirs. Results are kept a day; a lookup that fails (network) never
// blocks anyone.
const mxCache = new Map();
const MX_TTL = 24 * 60 * 60 * 1000;
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'ETIMEOUT' })), ms))]);

async function mailProblem(domain) {
    const hit = mxCache.get(domain);
    if (hit && Date.now() - hit.at < MX_TTL) return hit.problem;
    let problem = null;
    try {
        const mx = await withTimeout(dns.resolveMx(domain), 3000);
        const hosts = mx.map(r => String(r.exchange || '').toLowerCase().replace(/\.$/, '')).filter(Boolean);
        if (hosts.length === 0) problem = 'no_mail'; // "null MX": this domain says it receives no email
        else if (hosts.some(h => listedProblem(h) === 'disposable')) problem = 'disposable';
    } catch (err) {
        if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
            // No mail server listed: mail may still go to the domain's own address.
            try { await withTimeout(dns.resolve(domain), 3000); } catch (e) {
                if (e.code === 'ENOTFOUND' || e.code === 'ENODATA') problem = 'no_mail';
            }
        }
    }
    if (mxCache.size > 5000) mxCache.clear();
    mxCache.set(domain, { problem, at: Date.now() });
    return problem;
}

/**
 * Everything checked before an email may be used for a website account.
 * Resolves to { ok, email, key, problem, suggestion }: problem is 'invalid',
 * 'disposable', 'relay' or 'no_mail'. Nothing here depends on whether an
 * account exists, so the answer reveals nothing about anyone.
 */
async function checkEmail(input, { network = true } = {}) {
    const email = cleanEmail(input);
    if (!email) return { ok: false, problem: 'invalid' };
    const key = emailKey(email);
    const domain = domainOf(email);
    const suggestion = suggestEmail(email);
    if (TRUSTED.has(domain)) return { ok: true, email, key, suggestion };
    const listed = listedProblem(domain);
    if (listed) return { ok: false, email, key, problem: listed };
    const problem = network ? await mailProblem(domain) : null;
    if (problem) return { ok: false, email, key, problem };
    return { ok: true, email, key, suggestion };
}

/** Shows a.b***@gmail.com in logs: enough to tell two people apart, not to read the address. */
const maskEmail = (email) => {
    const e = String(email || '');
    const at = e.lastIndexOf('@');
    if (at < 1) return '***';
    return `${e.slice(0, Math.min(3, at))}***${e.slice(at)}`;
};

module.exports = { emailKey, cleanEmail, checkEmail, suggestEmail, listedProblem, reloadDomainLists, maskEmail, oneEditApart, domainOf };

// ── Lookups shared with the older account screens (admin, companies, email
// change, password reset) so that they follow the same one-inbox rule. They
// fall back to the plain address until migration 030 is applied.
const { hasColumn } = require('./schemaFeatures');

/** True when another account already uses this inbox. */
async function emailInUse(db, email, exceptId = null) {
    const byKey = await hasColumn(db, 'users', 'email_key');
    const row = await db.get(
        byKey
            ? 'SELECT id FROM users WHERE (email_key = lfwn_email_key($1) OR lower(email) = lower($1)) AND ($2::int IS NULL OR id <> $2::int) LIMIT 1'
            : 'SELECT id FROM users WHERE lower(email) = lower($1) AND ($2::int IS NULL OR id <> $2::int) LIMIT 1',
        [String(email || '').trim(), exceptId]);
    return !!row;
}

/** The account of this inbox (exact address first), with the given columns. */
async function userByEmail(db, email, columns = '*') {
    const byKey = await hasColumn(db, 'users', 'email_key');
    return db.get(
        byKey
            ? `SELECT ${columns} FROM users WHERE email = $1 OR email_key = lfwn_email_key($1) ORDER BY (email = $1) DESC, id LIMIT 1`
            : `SELECT ${columns} FROM users WHERE email = $1 LIMIT 1`,
        [String(email || '').trim()]);
}

module.exports.emailInUse = emailInUse;
module.exports.userByEmail = userByEmail;
