/**
 * Website analytics — what the public site records, and what it refuses to.
 *
 * The one public endpoint (POST /api/site/collect) is write-only: it answers
 * 204 with no body, so it can never be used to read anything out of the
 * platform. Everything that arrives is treated as hostile input — unknown
 * fields are dropped, strings are cut to length, numbers are clamped, and each
 * value must match an allowlist before it reaches the database. Every query is
 * parameterised.
 *
 * What is NOT stored, ever:
 *   • the visitor's IP address (only a hash of it, with a salt that is thrown
 *     away after a day, so yesterday's rows cannot be matched to anyone),
 *   • cookies or any browser storage — there are none to read back,
 *   • names, emails, form contents, or anything typed on a page,
 *   • the full referring URL (the host alone is kept),
 *   • query strings, apart from the three utm_* values used for campaigns.
 *
 * A visitor asking not to be tracked (Do Not Track / Global Privacy Control)
 * is still counted as a visit, but with no identifier at all.
 */
const crypto = require('crypto');
const { hasTable } = require('./schemaFeatures');
const { countryForTimezone } = require('./geoTimezones');

const RETAIN_VISIT_DAYS = 180;
const RETAIN_METRIC_DAYS = 45;
/** A page view may complete (send its performance figures) within this window. */
const VITALS_WINDOW_MINUTES = 60;
/** Per-address ceiling, on top of the route's rate limiter. */
const MAX_HITS_PER_MINUTE = 40;

const ready = (db) => hasTable(db, 'site_visits');

// ── Small helpers ──────────────────────────────────────────────────────────

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : null) || null;
const clampInt = (v, min, max) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : null;
};
const oneOf = (v, allowed) => (allowed.includes(v) ? v : null);

// ── Who is asking (never stored as-is) ─────────────────────────────────────

/** The caller's address, from the proxy header the server already trusts. */
function clientIp(req) {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const raw = forwarded || req.ip || req.socket?.remoteAddress || '';
    return raw.replace('::ffff:', '').slice(0, 45);
}

const salts = new Map(); // day → salt, so the day's salt is read once

/**
 * Today's salt. Random, stored only so that a restart keeps the day
 * consistent, and deleted two days later — after which the hashes made with
 * it can never be reproduced, by us or anyone else.
 */
async function dailySalt(db) {
    const day = new Date().toISOString().slice(0, 10);
    if (salts.has(day)) return salts.get(day);

    const fresh = crypto.randomBytes(32).toString('hex');
    const row = await db.get(
        `INSERT INTO site_salts (day, salt) VALUES ($1, $2)
         ON CONFLICT (day) DO UPDATE SET day = EXCLUDED.day RETURNING salt`,
        [day, fresh]);
    const salt = row?.salt || fresh;
    salts.clear();               // only today's is ever needed
    salts.set(day, salt);
    return salt;
}

/** A visitor is this hash and nothing else. It changes every day, by design. */
const visitorHash = (ip, userAgent, salt) =>
    crypto.createHash('sha256').update(`${ip}|${userAgent}|${salt}`).digest('hex').slice(0, 32);

// ── Reading the browser string ─────────────────────────────────────────────

const BOT = /bot|crawler|spider|crawling|slurp|headless|phantomjs|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|monitoring|uptime|curl\/|wget\/|python-requests|axios\/|okhttp|scrapy|ahrefs|semrush|mj12|dotbot|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|embedly|preview/i;

/** device · browser · os · is_bot, from the user agent. The string itself is dropped. */
function readAgent(userAgent = '') {
    const ua = String(userAgent).slice(0, 500);
    const isBot = !ua || BOT.test(ua);

    const tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);
    const phone = !tablet && /Mobile|iPhone|iPod|Android|Windows Phone|BlackBerry|Opera Mini|IEMobile/i.test(ua);
    const device = tablet ? 'tablet' : phone ? 'phone' : 'desktop';

    const browser = /Edg\//.test(ua) ? 'Edge'
        : /OPR\/|Opera/.test(ua) ? 'Opera'
            : /SamsungBrowser/.test(ua) ? 'Samsung Internet'
                : /YaBrowser/.test(ua) ? 'Yandex'
                    : /Firefox\/|FxiOS/.test(ua) ? 'Firefox'
                        : /CriOS/.test(ua) ? 'Chrome'
                            : /Chrome\//.test(ua) ? 'Chrome'
                                : /Safari\//.test(ua) ? 'Safari'
                                    : 'Other';

    const os = /Windows NT/.test(ua) ? 'Windows'
        : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
            : /Android/.test(ua) ? 'Android'
                : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
                    : /CrOS/.test(ua) ? 'ChromeOS'
                        : /Linux/.test(ua) ? 'Linux'
                            : 'Other';

    return { device, browser, os, isBot };
}

// ── Where the visit came from ──────────────────────────────────────────────

const SEARCH = /^(www\.)?(google|bing|yahoo|duckduckgo|baidu|yandex|ecosia|qwant|startpage|search\.brave|ask|naver|seznam|lycos)\./i;
const SOCIAL = /^(www\.|m\.|l\.|lm\.)?(facebook|instagram|twitter|x|t|linkedin|lnkd|tiktok|youtube|youtu|pinterest|reddit|whatsapp|telegram|snapchat|threads|quora|tumblr|discord)\.[a-z.]+$/i;

/** The referring site, reduced to its host. Our own pages are not referrals. */
function readReferrerHost(raw, ownHosts) {
    const value = str(raw, 500);
    if (!value) return null;
    let host;
    try { host = new URL(value).hostname.toLowerCase(); } catch { return null; }
    if (!host || host.length > 120) return null;
    if (ownHosts.some(own => host === own || host.endsWith(`.${own}`))) return null;
    return host;
}

const channelFor = ({ referrerHost, source, medium }) => {
    if (source || medium) return 'campaign';
    if (!referrerHost) return 'direct';
    if (SEARCH.test(referrerHost)) return 'search';
    if (SOCIAL.test(referrerHost)) return 'social';
    return 'referral';
};

// ── Validation of the beacon ───────────────────────────────────────────────

const KINDS = ['page', 'vitals'];
const PATH_OK = /^\/[A-Za-z0-9\-._~/]{0,199}$/;
const UUID_OK = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LANG_OK = /^[a-z]{2}$/;
const UTM_OK = /^[A-Za-z0-9 ._\-|+%]{1,60}$/;

/**
 * Turns whatever arrived into the few fields that may be stored, or null when
 * it is not usable. Anything unexpected is simply dropped — never echoed back.
 */
function readBeacon(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;

    const kind = oneOf(str(body.kind, 10), KINDS);
    if (!kind) return null;

    const eventKey = str(body.id, 40);
    if (!eventKey || !UUID_OK.test(eventKey)) return null;

    if (kind === 'vitals') {
        return {
            kind,
            eventKey,
            ttfb_ms: clampInt(body.ttfb, 0, 120_000),
            fcp_ms: clampInt(body.fcp, 0, 120_000),
            lcp_ms: clampInt(body.lcp, 0, 120_000),
            inp_ms: clampInt(body.inp, 0, 120_000),
            cls_x1000: clampInt(Number(body.cls) * 1000, 0, 100_000),
            load_ms: clampInt(body.load, 0, 600_000),
            dwell_ms: clampInt(body.dwell, 0, 12 * 60 * 60 * 1000),
        };
    }

    // Checked before any truncation: a path longer than the column is dropped
    // rather than cut, so two different pages can never share a stored path.
    const path = typeof body.path === 'string' ? body.path.trim() : '';
    if (!path || path.length > 200 || !PATH_OK.test(path)) return null;

    const lang = str(body.lang, 2)?.toLowerCase() || null;
    return {
        kind,
        eventKey,
        path: path === '/' ? '/' : path.replace(/\/+$/, '') || '/',
        lang: lang && LANG_OK.test(lang) ? lang : null,
        timezone: str(body.tz, 60),
        referrer: str(body.ref, 500),
        source: str(body.utm_source, 60)?.match(UTM_OK) ? str(body.utm_source, 60) : null,
        medium: str(body.utm_medium, 60)?.match(UTM_OK) ? str(body.utm_medium, 60) : null,
        campaign: str(body.utm_campaign, 60)?.match(UTM_OK) ? str(body.utm_campaign, 60) : null,
        screen_w: clampInt(body.sw, 0, 20_000),
        anonymous: body.dnt === true,
    };
}

// ── A cheap ceiling per address, on top of the route limiter ───────────────

const hits = new Map(); // ip → { minute, count }

function withinLimit(ip) {
    const minute = Math.floor(Date.now() / 60_000);
    if (hits.size > 5000) hits.clear();         // bounded: a flood cannot grow memory
    const seen = hits.get(ip);
    if (!seen || seen.minute !== minute) { hits.set(ip, { minute, count: 1 }); return true; }
    seen.count += 1;
    return seen.count <= MAX_HITS_PER_MINUTE;
}

// ── Writing ────────────────────────────────────────────────────────────────

/** Records one page view. Returns false when it was dropped (bot, flood, unknown). */
async function recordVisit(db, req, beacon, ownHosts) {
    if (!(await ready(db))) return false;

    const ip = clientIp(req);
    if (!withinLimit(ip)) return false;

    const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);
    const agent = readAgent(userAgent);
    if (agent.isBot) return false;              // crawlers never count as visitors

    // A proxy that already knows the country wins; otherwise the browser's time
    // zone says it, which needs no address lookup at all.
    const headerCountry = str(req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'], 2);
    const fromHeader = headerCountry && /^[A-Za-z]{2}$/.test(headerCountry) && headerCountry !== 'XX'
        ? headerCountry.toUpperCase() : null;
    const country = fromHeader || countryForTimezone(beacon.timezone);

    const referrerHost = readReferrerHost(beacon.referrer, ownHosts);
    const channel = channelFor({ referrerHost, source: beacon.source, medium: beacon.medium });

    const hash = beacon.anonymous ? null : visitorHash(ip, userAgent, await dailySalt(db));

    await db.run(
        `INSERT INTO site_visits
            (event_key, visitor_hash, path, lang, country, country_from, referrer_host,
             channel, source, medium, campaign, device, browser, os, screen_w, is_bot)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, false)
         -- The predicate repeats the partial unique index so it can be inferred.
         ON CONFLICT (event_key) WHERE event_key IS NOT NULL DO NOTHING`,
        [beacon.eventKey, hash, beacon.path, beacon.lang, country,
            country ? (fromHeader ? 'header' : 'timezone') : null, referrerHost,
            channel, beacon.source, beacon.medium, beacon.campaign,
            agent.device, agent.browser, agent.os, beacon.screen_w]);
    return true;
}

/**
 * Attaches how the page performed to the page view it belongs to. It can only
 * ever touch a row created in the last hour whose figures are still empty, so
 * a replayed or invented id changes nothing.
 */
async function attachVitals(db, req, beacon) {
    if (!(await ready(db))) return false;
    if (!withinLimit(clientIp(req))) return false;

    await db.run(
        `UPDATE site_visits SET
            ttfb_ms = COALESCE(ttfb_ms, $2), fcp_ms = COALESCE(fcp_ms, $3),
            lcp_ms = COALESCE(lcp_ms, $4), inp_ms = COALESCE(inp_ms, $5),
            cls_x1000 = COALESCE(cls_x1000, $6), load_ms = COALESCE(load_ms, $7),
            dwell_ms = GREATEST(COALESCE(dwell_ms, 0), COALESCE($8, 0))
          WHERE event_key = $1
            AND created_at > LOCALTIMESTAMP - make_interval(mins => $9)`,
        [beacon.eventKey, beacon.ttfb_ms, beacon.fcp_ms, beacon.lcp_ms, beacon.inp_ms,
            beacon.cls_x1000, beacon.load_ms, beacon.dwell_ms, VITALS_WINDOW_MINUTES]);
    return true;
}

// ── Housekeeping ───────────────────────────────────────────────────────────

/** Forgets old rows, and yesterday's salts with them. */
async function sweep(db) {
    if (!(await ready(db))) return;
    await db.run(`DELETE FROM site_visits WHERE created_at < LOCALTIMESTAMP - make_interval(days => $1)`, [RETAIN_VISIT_DAYS]);
    await db.run(`DELETE FROM api_metrics WHERE minute < LOCALTIMESTAMP - make_interval(days => $1)`, [RETAIN_METRIC_DAYS]);
    await db.run(`DELETE FROM site_salts WHERE day < CURRENT_DATE - 1`);
}

function startAnalyticsSweeper(db) {
    const tick = () => sweep(db).catch(e => console.error('Analytics sweep failed:', e.message));
    tick();
    const timer = setInterval(tick, 12 * 60 * 60 * 1000);
    timer.unref?.();
    return timer;
}

module.exports = {
    RETAIN_VISIT_DAYS, RETAIN_METRIC_DAYS, MAX_HITS_PER_MINUTE,
    readBeacon, recordVisit, attachVitals, readAgent, readReferrerHost, channelFor,
    clientIp, visitorHash, dailySalt, sweep, startAnalyticsSweeper, ready,
};
