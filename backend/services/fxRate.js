/**
 * Live USD -> XOF FX conversion for Paystack Côte d'Ivoire checkout.
 *
 * West African CFA Franc (XOF) has an official fixed peg to the Euro:
 *   1 EUR = 655.957 XOF (BCEAO / Banque de France).
 *
 * We derive the live USD -> XOF rate from ECB reference data (Frankfurter)
 * with Open ER-API fallback and an offline configurable safety fallback,
 * cached in memory for 6 hours.
 */

const EUR_TO_XOF_PEG = 655.957;
const CACHE_TTL_MS = 6 * 3600 * 1000;
const DEFAULT_FALLBACK_USD_XOF = 600;

let cache = null;
let inflight = null;

function isValidRate(v) {
    return typeof v === 'number' && Number.isFinite(v) && v >= 400 && v <= 900;
}

async function fetchJson(url) {
    const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function resolveLiveRate() {
    // 1. Primary: ECB reference USD -> EUR rate * exact XOF peg.
    try {
        const d = await fetchJson('https://api.frankfurter.app/latest?from=USD&to=EUR');
        const eur = Number(d?.rates?.EUR);
        if (Number.isFinite(eur) && eur > 0.4 && eur < 2) {
            return { rate: Number((eur * EUR_TO_XOF_PEG).toFixed(4)), source: 'ecb', fetchedAt: Date.now() };
        }
    } catch { /* try secondary */ }

    // 2. Secondary: open.er-api.com direct XOF / EUR.
    try {
        const d = await fetchJson('https://open.er-api.com/v6/latest/USD');
        const xof = Number(d?.rates?.XOF);
        if (isValidRate(xof)) {
            return { rate: Number(xof.toFixed(4)), source: 'open-er', fetchedAt: Date.now() };
        }
        const eur = Number(d?.rates?.EUR);
        if (Number.isFinite(eur) && eur > 0.4 && eur < 2) {
            return { rate: Number((eur * EUR_TO_XOF_PEG).toFixed(4)), source: 'open-er', fetchedAt: Date.now() };
        }
    } catch { /* use fallback */ }

    // 3. Stale cache or configurable env fallback.
    if (cache && isValidRate(cache.rate)) {
        return { rate: cache.rate, source: 'cache-stale', fetchedAt: cache.fetchedAt };
    }
    const envRate = Number(process.env.USD_TO_XOF_RATE);
    const rate = isValidRate(envRate) ? envRate : DEFAULT_FALLBACK_USD_XOF;
    return { rate, source: 'fallback', fetchedAt: Date.now() };
}

/**
 * Returns { rate, source, fetchedAt } for converting 1 USD -> XOF.
 */
async function getUsdToXofRate() {
    const fixed = Number(process.env.USD_TO_XOF_FIXED_RATE);
    if (isValidRate(fixed)) {
        return { rate: fixed, source: 'fixed', fetchedAt: Date.now() };
    }
    if (cache && isValidRate(cache.rate) && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache;
    }
    if (!inflight) {
        inflight = resolveLiveRate()
            .then((result) => {
                if (result.source === 'ecb' || result.source === 'open-er') {
                    cache = result;
                }
                return result;
            })
            .finally(() => {
                inflight = null;
            });
    }
    return inflight;
}

/**
 * Determines how a database offer should be billed through Paystack based on
 * the merchant's enabled currencies.
 *
 * - Paystack counts XOF in whole * 100 subunits (e.g. 18,000 XOF -> 1800000).
 * - Public & invoice amounts remain in the offer's original currency (e.g. USD).
 */
async function convertOfferForCharge(offer, merchantCurrencies) {
    const displayAmount = Number(offer.amount);
    const displayCurrency = String(offer.currency || 'USD').toUpperCase();
    const list = Array.isArray(merchantCurrencies)
        ? merchantCurrencies.map(c => String(c || '').toUpperCase()).filter(Boolean)
        : [];

    if (!list.length || list.includes(displayCurrency)) {
        return {
            supported: true,
            converted: false,
            chargeAmount: displayAmount,
            chargeCurrency: displayCurrency,
            displayAmount,
            displayCurrency,
            fxRate: null,
            fxSource: null,
        };
    }

    if (displayCurrency === 'USD' && !offer.recurring && list.includes('XOF')) {
        const { rate, source } = await getUsdToXofRate();
        const usdMajor = displayAmount / 100;
        const xofWhole = Math.max(100, Math.round((usdMajor * rate) / 50) * 50);
        const chargeAmount = xofWhole * 100;
        return {
            supported: true,
            converted: true,
            chargeAmount,
            chargeCurrency: 'XOF',
            displayAmount,
            displayCurrency: 'USD',
            fxRate: Number(rate.toFixed(6)),
            fxSource: source,
        };
    }

    return {
        supported: false,
        converted: false,
        displayAmount,
        displayCurrency,
        merchantCurrencies: list,
    };
}

module.exports = { EUR_TO_XOF_PEG, getUsdToXofRate, convertOfferForCharge };
