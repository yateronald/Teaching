/**
 * "Continue with Google": OpenID Connect, authorization code flow, run on the
 * server.
 *
 *  1. start: three one-time values are kept in a short-lived signed cookie:
 *     state (the reply must belong to this browser's request), PKCE verifier
 *     (only this server can redeem the code) and nonce (an old answer cannot be
 *     replayed). The browser goes to Google.
 *  2. callback: the code is exchanged for Google's signed answer (ID token)
 *     with the client secret, which never leaves the server. The answer is
 *     verified: signature against Google's published keys, issuer, audience
 *     (our client id), expiry, nonce, and the email must be verified by Google.
 *
 * Configuration (backend/.env): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and
 * GOOGLE_REDIRECT_URI (or API_PUBLIC_URL, from which it is derived). Without
 * them the website simply does not offer the Google button.
 */
const crypto = require('crypto');

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);

function config() {
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
    const api = String(process.env.API_PUBLIC_URL || '').trim().replace(/\/+$/, '');
    const redirectUri = String(process.env.GOOGLE_REDIRECT_URI || '').trim()
        || (api ? `${api.replace(/\/api$/, '')}/api/site-auth/google/callback` : '');
    return { clientId, clientSecret, redirectUri, enabled: !!(clientId && clientSecret && redirectUri) };
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const random = (bytes = 32) => b64url(crypto.randomBytes(bytes));

/** The values to remember, and the address to send the browser to. */
function startRequest({ lang }) {
    const { clientId, redirectUri } = config();
    const state = random();
    const nonce = random();
    const verifier = random(48);
    const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state,
        nonce,
        code_challenge: challenge,
        code_challenge_method: 'S256',
        prompt: 'select_account',
        hl: lang === 'fr' ? 'fr' : 'en',
    });
    return { url: `${AUTH_URL}?${params}`, state, nonce, verifier };
}

/** Constant-time comparison of two strings. */
function sameValue(a, b) {
    const x = Buffer.from(String(a || ''));
    const y = Buffer.from(String(b || ''));
    return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

// Google's signing keys, kept as long as Google says they are valid.
let certs = { keys: new Map(), until: 0 };
async function signingKey(kid) {
    if (Date.now() > certs.until || !certs.keys.has(kid)) {
        const res = await fetch(CERTS_URL, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Google keys: HTTP ${res.status}`);
        const body = await res.json();
        const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('cache-control') || '')?.[1]) || 3600;
        certs = {
            keys: new Map((body.keys || []).map(k => [k.kid, crypto.createPublicKey({ key: k, format: 'jwk' })])),
            until: Date.now() + Math.min(maxAge, 24 * 3600) * 1000,
        };
    }
    const key = certs.keys.get(kid);
    if (!key) throw new Error('Google key not found');
    return key;
}

/** Checks Google's ID token and returns its claims; throws when anything is wrong. */
async function verifyIdToken(idToken, { nonce }) {
    const { clientId } = config();
    const parts = String(idToken || '').split('.');
    if (parts.length !== 3) throw new Error('malformed ID token');
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (header.alg !== 'RS256' || !header.kid) throw new Error('unexpected ID token algorithm');
    const key = await signingKey(header.kid);
    const signed = crypto.verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), key, Buffer.from(parts[2], 'base64url'));
    if (!signed) throw new Error('ID token signature does not match');
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (!ISSUERS.has(claims.iss)) throw new Error('ID token from another issuer');
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(clientId)) throw new Error('ID token for another application');
    if (Array.isArray(claims.aud) && claims.azp && claims.azp !== clientId) throw new Error('ID token for another party');
    if (!(Number(claims.exp) > now - 60)) throw new Error('ID token expired');
    if (Number(claims.iat) > now + 300) throw new Error('ID token from the future');
    if (!sameValue(claims.nonce, nonce)) throw new Error('ID token nonce does not match');
    if (!claims.sub) throw new Error('ID token without an account id');
    return claims;
}

/** Redeems the code from Google's redirect, and returns the verified person. */
async function finish({ code, verifier, nonce }) {
    const { clientId, clientSecret, redirectUri } = config();
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            code_verifier: verifier,
        }),
        signal: AbortSignal.timeout(10000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.id_token) throw new Error(`code exchange failed (${res.status} ${body.error || ''})`.trim());
    const c = await verifyIdToken(body.id_token, { nonce });
    return {
        sub: String(c.sub),
        email: String(c.email || '').toLowerCase(),
        emailVerified: c.email_verified === true || c.email_verified === 'true',
        // A Google Workspace account (company domain) carries its domain in `hd`.
        workspaceDomain: c.hd ? String(c.hd).toLowerCase() : null,
        givenName: String(c.given_name || c.name || '').trim(),
        familyName: String(c.family_name || '').trim(),
    };
}

/**
 * True when Google itself owns the inbox of this address: a Gmail address, or
 * a Google Workspace address of the domain Google vouches for. Only then may a
 * Google sign-in join an existing account by email without asking more.
 */
function googleOwnsInbox(person) {
    const domain = person.email.slice(person.email.lastIndexOf('@') + 1);
    if (domain === 'gmail.com' || domain === 'googlemail.com') return true;
    return !!person.workspaceDomain && person.workspaceDomain === domain;
}

module.exports = { config, startRequest, finish, verifyIdToken, googleOwnsInbox, sameValue };
