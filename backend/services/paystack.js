/**
 * Paystack: the few calls the payments need, made from the server only.
 *
 *  - The secret key (PAYSTACK_SECRET_KEY) never leaves the server and is never
 *    logged. The website only ever receives Paystack's checkout address.
 *  - Paystack's hosted checkout takes the card or mobile money: no payment
 *    details ever reach our servers.
 *  - Webhooks are only believed with a valid signature (HMAC-SHA512 of the raw
 *    body with the secret key), and even then a payment is confirmed by asking
 *    Paystack's API again (services/billing.js).
 */
const crypto = require('crypto');

const IS_PROD = process.env.NODE_ENV === 'production';
// Paystack's published webhook addresses (optional extra check: PAYSTACK_CHECK_WEBHOOK_IPS=true).
const WEBHOOK_IPS = ['52.31.139.75', '52.49.173.169', '52.214.14.220'];

function config() {
    const secret = String(process.env.PAYSTACK_SECRET_KEY || '').trim();
    // Another API address only outside production (local tests against a stand-in).
    const base = (!IS_PROD && process.env.PAYSTACK_API_BASE) ? String(process.env.PAYSTACK_API_BASE).replace(/\/+$/, '') : 'https://api.paystack.co';
    return {
        secret,
        base,
        enabled: /^sk_(live|test)_[A-Za-z0-9]+$/.test(secret),
        mode: secret.startsWith('sk_live_') ? 'live' : secret.startsWith('sk_test_') ? 'test' : 'off',
    };
}

class PaystackError extends Error {
    constructor(message, { status = 0, transient = false } = {}) {
        super(message);
        this.status = status;
        this.transient = transient;
    }
}

async function call(method, path, body) {
    const { secret, base, enabled } = config();
    if (!enabled) throw new PaystackError('Payments are not configured (PAYSTACK_SECRET_KEY).');
    let res;
    try {
        res = await fetch(`${base}${path}`, {
            method,
            headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        throw new PaystackError(`Paystack unreachable (${err.name})`, { transient: true });
    }
    let data = null;
    try { data = await res.json(); } catch { /* not JSON */ }
    if (!res.ok || !data || data.status !== true) {
        // The message never contains the key; keep it short in our logs.
        const msg = String(data?.message || `HTTP ${res.status}`).slice(0, 160);
        throw new PaystackError(`Paystack: ${msg}`, { status: res.status, transient: res.status >= 500 || res.status === 429 });
    }
    return data.data;
}

/** Starts a payment: Paystack's checkout address for this reference. */
function initialize({ email, amount, currency, reference, callbackUrl, metadata, plan }) {
    return call('POST', '/transaction/initialize', {
        email, amount, currency, reference, callback_url: callbackUrl, metadata,
        ...(plan ? { plan } : {}),
    });
}

/** What Paystack itself says about a payment (the only proof we accept). */
const verify = (reference) => call('GET', `/transaction/verify/${encodeURIComponent(reference)}`);

/** Stops a subscription's renewals. */
const disableSubscription = (code, token) => call('POST', '/subscription/disable', { code, token });

/** A Paystack page where the subscriber updates their card. */
const manageLink = (code) => call('GET', `/subscription/${encodeURIComponent(code)}/manage/link`);

/** True when the webhook's signature matches its raw body. */
function validSignature(rawBody, signature) {
    const { secret, enabled } = config();
    if (!enabled || !Buffer.isBuffer(rawBody) || typeof signature !== 'string' || !/^[a-f0-9]{128}$/i.test(signature)) return false;
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature.toLowerCase(), 'hex'));
}

/** With PAYSTACK_CHECK_WEBHOOK_IPS=true, webhooks must also come from Paystack's addresses. */
function webhookIpAllowed(ip) {
    if (String(process.env.PAYSTACK_CHECK_WEBHOOK_IPS || '').toLowerCase() !== 'true') return true;
    return WEBHOOK_IPS.includes(String(ip || '').replace('::ffff:', ''));
}

/** Paystack's checkout pages only: the website refuses to send anyone elsewhere. */
const isCheckoutUrl = (url) => /^https:\/\/checkout\.paystack\.com\/[A-Za-z0-9/_-]+(\?.*)?$/.test(String(url || ''));

let balanceCache = { key: '', at: 0, currencies: [] };
/** Returns the currency ISO codes currently enabled on the Paystack merchant account (cached 10 min). */
async function supportedCurrencies() {
    const { secret, enabled } = config();
    if (!enabled) return [];
    const key = crypto.createHash('sha256').update(secret).digest('hex').slice(0, 16);
    if (balanceCache.key === key && Date.now() - balanceCache.at < 600000) {
        return balanceCache.currencies;
    }
    try {
        const balances = await call('GET', '/balance');
        const list = Array.isArray(balances)
            ? [...new Set(balances.map(b => String(b?.currency || '').toUpperCase()).filter(Boolean))]
            : [];
        balanceCache = { key, at: Date.now(), currencies: list };
        return list;
    } catch {
        return [];
    }
}

module.exports = { config, initialize, verify, disableSubscription, manageLink, validSignature, webhookIpAllowed, isCheckoutUrl, supportedCurrencies, PaystackError, WEBHOOK_IPS };
