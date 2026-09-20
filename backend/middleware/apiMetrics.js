/**
 * API performance, measured from the inside.
 *
 * Every API request is timed and counted in memory against the route pattern
 * it matched (`/api/users/:id`, never the actual id), then written once a
 * minute as one row per route. Nothing about who made the request is kept —
 * no user, no address, no body — so this is a picture of the platform's
 * health, not of anybody's behaviour.
 */
const { hasTable } = require('../services/schemaFeatures');

/** Keep the table small: routes beyond this fall into one "other" bucket. */
const MAX_ROUTES = 200;
/** Enough samples for a stable p95 without holding a minute of traffic in memory. */
const MAX_SAMPLES = 500;

const buckets = new Map();   // "GET /api/users/:id" → tally
let lag = 0;                 // event-loop delay, milliseconds

const minuteStart = (d = new Date()) => new Date(Math.floor(d.getTime() / 60_000) * 60_000);

/** The route pattern a request matched, with ids collapsed. */
function routeKey(req) {
    const matched = `${req.baseUrl || ''}${req.route?.path && req.route.path !== '/' ? req.route.path : ''}`;
    const fallback = (req.path || '/')
        .replace(/\/\d+(?=\/|$)/g, '/:id')
        .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi, '/:uuid');
    const key = (matched || fallback || '/').replace(/\/+$/, '') || '/';
    return key.slice(0, 120);
}

function tally(key) {
    let bucket = buckets.get(key);
    if (!bucket) {
        if (buckets.size >= MAX_ROUTES) return tally('OTHER /(other)');
        bucket = { hits: 0, client: 0, server: 0, total: 0, max: 0, samples: [] };
        buckets.set(key, bucket);
    }
    return bucket;
}

/** Times every API request. Cheap: one timestamp and a few counters. */
function track(req, res, next) {
    if (!req.path.startsWith('/api/')) return next();
    const started = process.hrtime.bigint();

    res.on('finish', () => {
        try {
            const ms = Number(process.hrtime.bigint() - started) / 1e6;
            const bucket = tally(`${req.method} ${routeKey(req)}`);
            bucket.hits += 1;
            bucket.total += ms;
            bucket.max = Math.max(bucket.max, ms);
            if (res.statusCode >= 500) bucket.server += 1;
            else if (res.statusCode >= 400) bucket.client += 1;
            if (bucket.samples.length < MAX_SAMPLES) bucket.samples.push(ms);
        } catch { /* measuring must never break a response */ }
    });

    next();
}

const percentile = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] : 0);

/** Empties the in-memory tallies into the table, one row per route per minute. */
async function flush(db) {
    if (!buckets.size || !(await hasTable(db, 'api_metrics'))) return;

    const rows = [...buckets.entries()];
    buckets.clear();
    const minute = minuteStart();

    for (const [key, b] of rows) {
        const [method, ...rest] = key.split(' ');
        const route = rest.join(' ') || '/';
        const sorted = b.samples.sort((x, y) => x - y);
        try {
            await db.run(
                `INSERT INTO api_metrics (minute, route, method, hits, client_errors, server_errors, ms_total, ms_max, ms_p50, ms_p95)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (minute, route, method) DO UPDATE SET
                    hits = api_metrics.hits + EXCLUDED.hits,
                    client_errors = api_metrics.client_errors + EXCLUDED.client_errors,
                    server_errors = api_metrics.server_errors + EXCLUDED.server_errors,
                    ms_total = api_metrics.ms_total + EXCLUDED.ms_total,
                    ms_max = GREATEST(api_metrics.ms_max, EXCLUDED.ms_max),
                    ms_p50 = GREATEST(api_metrics.ms_p50, EXCLUDED.ms_p50),
                    ms_p95 = GREATEST(api_metrics.ms_p95, EXCLUDED.ms_p95)`,
                [minute, route, method, b.hits, b.client, b.server,
                    Math.round(b.total), Math.round(b.max),
                    Math.round(percentile(sorted, 0.5)), Math.round(percentile(sorted, 0.95))]);
        } catch (e) {
            console.error('API metrics flush failed:', e.message);
        }
    }
}

/** How the server itself is doing, right now. */
function health() {
    const mem = process.memoryUsage();
    return {
        uptime_seconds: Math.round(process.uptime()),
        memory_mb: Math.round(mem.rss / 1048576),
        heap_used_mb: Math.round(mem.heapUsed / 1048576),
        heap_total_mb: Math.round(mem.heapTotal / 1048576),
        event_loop_lag_ms: Math.round(lag * 10) / 10,
        node: process.version,
        started_at: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    };
}

/** Starts the once-a-minute write and the event-loop lag sampler. */
function startApiMetrics(db) {
    const flusher = setInterval(() => flush(db).catch(() => { /* already logged */ }), 60_000);
    let last = Date.now();
    const sampler = setInterval(() => {
        const now = Date.now();
        lag = Math.max(0, now - last - 1000);
        last = now;
    }, 1000);
    flusher.unref?.();
    sampler.unref?.();
    return { flusher, sampler };
}

module.exports = { track, flush, health, startApiMetrics, routeKey };
