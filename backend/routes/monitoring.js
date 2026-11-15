/**
 * Website monitoring — read-only, administrators with the monitoring key only.
 *
 * Everything here is an aggregate over site_visits and api_metrics. There is
 * no endpoint that returns a single visitor, because a single visitor is not
 * something the platform stores: rows carry a daily hash, never a person.
 *
 * How the figures are counted:
 *   • page view   — one row of site_visits (every page shown, the first one
 *                   of a visit and every move inside the site);
 *   • visitor     — one daily hash; a visitor who asked not to be tracked has
 *                   no hash and counts once per arrival on the site;
 *   • visit       — a run of page views with no gap longer than 30 minutes
 *                   (anonymous arrivals count as one visit each);
 *   • arrival     — the first page of a visit: where people come from
 *                   (channels, referring sites, campaigns, entry pages) is
 *                   counted on arrivals only, never on moves inside the site.
 * Days and hours are those of the person looking (?tz=Area/City).
 */
const express = require('express');
const { authenticateToken, adminOnly, monitoringOnly } = require('../middleware/auth');
const { hasColumn, hasTable } = require('../services/schemaFeatures');
const apiMetrics = require('../middleware/apiMetrics');
const analytics = require('../services/analyticsService');

const router = express.Router();
router.use(authenticateToken, adminOnly, monitoringOnly);

// ── Ranges ─────────────────────────────────────────────────────────────────
// The caller picks a key, never an interval: nothing from the query string
// ever reaches SQL as anything but a bound parameter.
const RANGES = {
    '24h': { hours: 24, bucket: 'hour', label: 'Last 24 hours' },
    '7d': { hours: 24 * 7, bucket: 'day', label: 'Last 7 days' },
    '30d': { hours: 24 * 30, bucket: 'day', label: 'Last 30 days' },
    '90d': { hours: 24 * 90, bucket: 'day', label: 'Last 90 days' },
};
const rangeOf = (key) => RANGES[String(key || '').trim()] || RANGES['7d'];
const rangeKey = (range) => Object.keys(RANGES).find(k => RANGES[k] === range);

// ── The viewer's time zone ─────────────────────────────────────────────────
// Charts are cut into the days and hours of the person looking, not of the
// server. The name must be one PostgreSQL knows; anything else means UTC.
const TZ_OK = /^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+){0,2}$/;
let zones = null;

async function zoneOf(db, raw) {
    const tz = String(raw || '').trim();
    if (!tz || tz.length > 64 || !TZ_OK.test(tz)) return 'UTC';
    if (!zones) {
        try {
            zones = new Set((await db.all('SELECT name FROM pg_timezone_names')).map(r => r.name));
        } catch {
            return 'UTC';
        }
    }
    return zones.has(tz) ? tz : 'UTC';
}

/**
 * A stored time (written in the database's own zone) as the wall-clock time
 * of the viewer, whose zone is the bound parameter `$n`.
 */
const local = (column, n) => `((${column}) AT TIME ZONE current_setting('TimeZone')) AT TIME ZONE $${n}`;
/** A bucket as "2026-11-15T09:00:00": local time, no offset, read as local by every client. */
const stamp = (expr) => `to_char(${expr}, 'YYYY-MM-DD"T"HH24:MI:SS')`;

/**
 * Every bucket of the window, in the viewer's time, so that a day or an hour
 * without a visit is drawn at zero instead of being skipped. `$1` is the
 * number of hours back, `$tzParam` the viewer's zone.
 */
const bucketsCte = (bucket, tzParam, timeColumn = 'LOCALTIMESTAMP') => `
    buckets AS (
        SELECT generate_series(
            date_trunc('${bucket}', ${local(`${timeColumn} - make_interval(hours => $1)`, tzParam)}),
            date_trunc('${bucket}', ${local(timeColumn, tzParam)}),
            INTERVAL '1 ${bucket}') AS at
    )`;

/** Visits in a window, excluding crawlers. `$1` hours back, `$2` hours back (0 = now). */
const WINDOW = `created_at >= LOCALTIMESTAMP - make_interval(hours => $1)
            AND created_at <  LOCALTIMESTAMP - make_interval(hours => $2)
            AND NOT is_bot`;

/** The first page of a visit (rows written before moves were counted are all first pages). */
const ARRIVAL = `channel <> 'internal'`;

/**
 * People: one per daily hash, plus one per arrival of a visitor who asked not
 * to be tracked (they have no hash, so each arrival is counted once).
 */
const VISITORS = `(COUNT(DISTINCT visitor_hash) + COUNT(*) FILTER (WHERE visitor_hash IS NULL AND ${ARRIVAL}))::int`;

const pct = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);
const change = (now, before) => (before ? Math.round(((now - before) / before) * 1000) / 10 : null);
const round1 = (n) => Math.round(n * 10) / 10;

// ── Overview ───────────────────────────────────────────────────────────────

/** Page views, visitors, visits and bounce rate for one window. */
async function totals(db, fromHours, toHours) {
    const basic = await db.get(
        `SELECT COUNT(*)::int AS visits,
                ${VISITORS} AS visitors,
                COUNT(*) FILTER (WHERE visitor_hash IS NULL)::int AS anonymous_views,
                COUNT(*) FILTER (WHERE visitor_hash IS NULL AND ${ARRIVAL})::int AS anonymous_arrivals,
                COUNT(*) FILTER (WHERE visitor_hash IS NOT NULL)::int AS tracked_views,
                COALESCE(ROUND(AVG(NULLIF(dwell_ms, 0)) / 1000)::int, 0) AS avg_seconds
           FROM site_visits WHERE ${WINDOW}`,
        [fromHours, toHours]);

    // A visit is a run of page views from the same visitor with no gap longer
    // than half an hour — the usual convention, computed on the fly so
    // nothing extra has to be stored.
    const sessions = await db.get(
        `WITH steps AS (
            SELECT visitor_hash, created_at,
                   CASE WHEN created_at - LAG(created_at) OVER (PARTITION BY visitor_hash ORDER BY created_at)
                             > INTERVAL '30 minutes'
                        OR LAG(created_at) OVER (PARTITION BY visitor_hash ORDER BY created_at) IS NULL
                        THEN 1 ELSE 0 END AS starts
              FROM site_visits
             WHERE ${WINDOW} AND visitor_hash IS NOT NULL
         ), numbered AS (
            SELECT visitor_hash, SUM(starts) OVER (PARTITION BY visitor_hash ORDER BY created_at) AS session_no
              FROM steps
         ), grouped AS (
            SELECT visitor_hash, session_no, COUNT(*)::int AS views
              FROM numbered GROUP BY visitor_hash, session_no
         )
         SELECT COUNT(*)::int AS sessions,
                COUNT(*) FILTER (WHERE views = 1)::int AS single_page
           FROM grouped`,
        [fromHours, toHours]);

    const tracked = sessions?.sessions || 0;
    return {
        visits: basic?.visits || 0,
        visitors: basic?.visitors || 0,
        // Anonymous arrivals are visits too; how many pages they read is not known.
        sessions: tracked + (basic?.anonymous_arrivals || 0),
        // Bounce and depth can only be measured on the visits that can be followed.
        bounce_rate: pct(sessions?.single_page || 0, tracked),
        pages_per_session: tracked ? round1((basic?.tracked_views || 0) / tracked) : 0,
        avg_seconds: basic?.avg_seconds || 0,
        anonymous_visits: basic?.anonymous_views || 0,
        followed_sessions: tracked,
    };
}

router.get('/overview', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.json({ ready: false });
        const range = rangeOf(req.query.range);
        const tz = await zoneOf(req.db, req.query.tz);
        const { hours, bucket } = range;
        const params = [hours, 0];

        const [now, before, live, series, countries, pages, entries, channels, referrers, campaigns, devices, browsers, systems, languages] = await Promise.all([
            totals(req.db, hours, 0),
            totals(req.db, hours * 2, hours),
            req.db.get(
                `SELECT ${VISITORS} AS visitors, COUNT(*)::int AS views
                   FROM site_visits WHERE created_at >= LOCALTIMESTAMP - INTERVAL '5 minutes' AND NOT is_bot`),
            req.db.all(
                `WITH ${bucketsCte(bucket, 3)},
                 counts AS (
                    SELECT date_trunc('${bucket}', ${local('created_at', 3)}) AS at,
                           COUNT(*)::int AS visits, ${VISITORS} AS visitors
                      FROM site_visits WHERE ${WINDOW} GROUP BY 1
                 )
                 SELECT ${stamp('b.at')} AS at, COALESCE(c.visits, 0) AS visits, COALESCE(c.visitors, 0) AS visitors
                   FROM buckets b LEFT JOIN counts c ON c.at = b.at ORDER BY b.at`, [...params, tz]),
            req.db.all(
                `SELECT COALESCE(country, '??') AS country,
                        COUNT(*)::int AS visits,
                        ${VISITORS} AS visitors
                   FROM site_visits WHERE ${WINDOW}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 40`, params),
            req.db.all(
                `SELECT path,
                        COUNT(*)::int AS visits,
                        ${VISITORS} AS visitors,
                        COALESCE(ROUND(AVG(NULLIF(dwell_ms, 0)) / 1000)::int, 0) AS avg_seconds
                   FROM site_visits WHERE ${WINDOW}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 25`, params),
            // Where visits begin: the page people land on.
            req.db.all(
                `SELECT path, COUNT(*)::int AS visits
                   FROM site_visits WHERE ${WINDOW} AND ${ARRIVAL}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 15`, params),
            req.db.all(
                `SELECT channel, COUNT(*)::int AS visits FROM site_visits WHERE ${WINDOW} AND ${ARRIVAL}
                  GROUP BY 1 ORDER BY visits DESC`, params),
            req.db.all(
                `SELECT referrer_host AS host, COUNT(*)::int AS visits FROM site_visits
                  WHERE ${WINDOW} AND referrer_host IS NOT NULL
                  GROUP BY 1 ORDER BY visits DESC LIMIT 15`, params),
            req.db.all(
                `SELECT COALESCE(campaign, source) AS name, source, medium, COUNT(*)::int AS visits
                   FROM site_visits WHERE ${WINDOW} AND (campaign IS NOT NULL OR source IS NOT NULL)
                  GROUP BY 1, 2, 3 ORDER BY visits DESC LIMIT 15`, params),
            req.db.all(`SELECT device AS name, COUNT(*)::int AS visits FROM site_visits WHERE ${WINDOW} GROUP BY 1 ORDER BY visits DESC`, params),
            req.db.all(`SELECT browser AS name, COUNT(*)::int AS visits FROM site_visits WHERE ${WINDOW} GROUP BY 1 ORDER BY visits DESC LIMIT 8`, params),
            req.db.all(`SELECT os AS name, COUNT(*)::int AS visits FROM site_visits WHERE ${WINDOW} GROUP BY 1 ORDER BY visits DESC LIMIT 8`, params),
            req.db.all(`SELECT COALESCE(lang, '??') AS name, COUNT(*)::int AS visits FROM site_visits WHERE ${WINDOW} GROUP BY 1 ORDER BY visits DESC LIMIT 8`, params),
        ]);

        res.json({
            ready: true,
            range: { key: rangeKey(range), label: range.label, bucket, tz },
            kpis: {
                ...now,
                live_visitors: live?.visitors || 0,
                change: {
                    visits: change(now.visits, before.visits),
                    visitors: change(now.visitors, before.visitors),
                    sessions: change(now.sessions, before.sessions),
                    // Kept for older apps; a rate is better compared in points (below).
                    bounce_rate: change(now.bounce_rate, before.bounce_rate),
                    bounce_points: before.followed_sessions && now.followed_sessions ? round1(now.bounce_rate - before.bounce_rate) : null,
                    avg_seconds: change(now.avg_seconds, before.avg_seconds),
                },
                previous: before,
            },
            series,
            countries,
            pages,
            entry_pages: entries,
            channels,
            referrers,
            campaigns,
            devices,
            browsers,
            systems,
            languages,
        });
    } catch (error) {
        console.error('Monitoring overview error:', error);
        res.status(500).json({ error: 'Failed to load the monitoring overview' });
    }
});

// ── Geography ──────────────────────────────────────────────────────────────
// One row per country, with everything the map shows on hover. Countries the
// platform could not place (no time zone, no proxy header) are returned under
// the key '??' so they are still counted somewhere.

router.get('/geo', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.json({ ready: false });
        const range = rangeOf(req.query.range);
        const params = [range.hours, 0];

        const [rows, sessions, pages, totals] = await Promise.all([
            req.db.all(
                `SELECT COALESCE(country, '??') AS country,
                        COUNT(*)::int AS visits,
                        ${VISITORS} AS visitors,
                        COUNT(*) FILTER (WHERE visitor_hash IS NULL AND ${ARRIVAL})::int AS anonymous_arrivals,
                        COALESCE(ROUND(AVG(NULLIF(dwell_ms, 0)) / 1000)::int, 0) AS avg_seconds,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY load_ms)::int AS load_p75,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp_ms)::int AS lcp_p75,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ttfb_ms)::int AS ttfb_p75,
                        COUNT(*) FILTER (WHERE device = 'phone')::int AS phone,
                        COUNT(*) FILTER (WHERE device = 'tablet')::int AS tablet,
                        COUNT(*) FILTER (WHERE device = 'desktop')::int AS desktop,
                        COUNT(*) FILTER (WHERE channel = 'search')::int AS search,
                        COUNT(*) FILTER (WHERE channel = 'social')::int AS social,
                        COUNT(*) FILTER (WHERE channel = 'campaign')::int AS campaign,
                        MIN(EXTRACT(EPOCH FROM (LOCALTIMESTAMP - created_at))::int) AS seconds_since_last
                   FROM site_visits WHERE ${WINDOW}
                  GROUP BY 1 ORDER BY visits DESC`, params),

            // Visits and bounce rate, per country, on the same 30-minute rule
            // the rest of the space uses.
            req.db.all(
                `WITH steps AS (
                    SELECT COALESCE(country, '??') AS country, visitor_hash, created_at,
                           CASE WHEN created_at - LAG(created_at) OVER (PARTITION BY visitor_hash ORDER BY created_at)
                                     > INTERVAL '30 minutes'
                                OR LAG(created_at) OVER (PARTITION BY visitor_hash ORDER BY created_at) IS NULL
                                THEN 1 ELSE 0 END AS starts
                      FROM site_visits WHERE ${WINDOW} AND visitor_hash IS NOT NULL
                 ), numbered AS (
                    SELECT country, visitor_hash, created_at,
                           SUM(starts) OVER (PARTITION BY visitor_hash ORDER BY created_at) AS session_no
                      FROM steps
                 ), grouped AS (
                    -- A visit belongs to the country of its first page.
                    SELECT visitor_hash, session_no, (ARRAY_AGG(country ORDER BY created_at))[1] AS country, COUNT(*)::int AS views
                      FROM numbered GROUP BY 1, 2
                 )
                 SELECT country, COUNT(*)::int AS sessions,
                        COUNT(*) FILTER (WHERE views = 1)::int AS single_page
                   FROM grouped GROUP BY 1`, params),

            // The page most read in each country.
            req.db.all(
                `SELECT country, path, visits FROM (
                    SELECT COALESCE(country, '??') AS country, path, COUNT(*)::int AS visits,
                           ROW_NUMBER() OVER (PARTITION BY COALESCE(country, '??') ORDER BY COUNT(*) DESC, path) AS rank
                      FROM site_visits WHERE ${WINDOW}
                     GROUP BY 1, 2
                 ) ranked WHERE rank = 1`, params),

            req.db.get(
                `SELECT COUNT(*)::int AS visits,
                        ${VISITORS} AS visitors,
                        COUNT(DISTINCT country)::int AS countries,
                        COUNT(*) FILTER (WHERE country IS NULL)::int AS unplaced
                   FROM site_visits WHERE ${WINDOW}`, params),
        ]);

        const bySession = new Map(sessions.map(s => [s.country, s]));
        const byPage = new Map(pages.map(p => [p.country, p]));
        const total = totals?.visits || 0;

        res.json({
            ready: true,
            range: { key: rangeKey(range), label: range.label },
            totals: totals || { visits: 0, visitors: 0, countries: 0, unplaced: 0 },
            countries: rows.map(({ anonymous_arrivals: anonymous, ...row }) => {
                const session = bySession.get(row.country);
                return {
                    ...row,
                    share: pct(row.visits, total),
                    sessions: (session?.sessions || 0) + (anonymous || 0),
                    bounce_rate: pct(session?.single_page || 0, session?.sessions || 0),
                    top_page: byPage.get(row.country)?.path || null,
                };
            }),
        });
    } catch (error) {
        console.error('Monitoring geo error:', error);
        res.status(500).json({ error: 'Failed to load the map' });
    }
});

// ── Live ───────────────────────────────────────────────────────────────────

router.get('/live', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.json({ ready: false });
        const tz = await zoneOf(req.db, req.query.tz);
        const RECENT = `created_at >= date_trunc('minute', LOCALTIMESTAMP - INTERVAL '29 minutes') AND NOT is_bot`;

        const [now, minutes, pages, countries, recent] = await Promise.all([
            req.db.get(
                `SELECT ${VISITORS} AS visitors, COUNT(*)::int AS views
                   FROM site_visits WHERE created_at >= LOCALTIMESTAMP - INTERVAL '5 minutes' AND NOT is_bot`),
            // All 30 minutes, the quiet ones at zero.
            req.db.all(
                `WITH buckets AS (
                    SELECT generate_series(date_trunc('minute', LOCALTIMESTAMP - INTERVAL '29 minutes'),
                                           date_trunc('minute', LOCALTIMESTAMP), INTERVAL '1 minute') AS at
                 ), counts AS (
                    SELECT date_trunc('minute', created_at) AS at, COUNT(*)::int AS visits
                      FROM site_visits WHERE ${RECENT} GROUP BY 1
                 )
                 SELECT ${stamp(local('b.at', 1))} AS at, COALESCE(c.visits, 0) AS visits
                   FROM buckets b LEFT JOIN counts c ON c.at = b.at ORDER BY b.at`, [tz]),
            req.db.all(
                `SELECT path, COUNT(*)::int AS visits FROM site_visits
                  WHERE ${RECENT}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 8`),
            req.db.all(
                `SELECT COALESCE(country, '??') AS country, COUNT(*)::int AS visits FROM site_visits
                  WHERE ${RECENT}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 8`),
            req.db.all(
                `SELECT path, country, device, browser, channel, referrer_host,
                        EXTRACT(EPOCH FROM (LOCALTIMESTAMP - created_at))::int AS seconds_ago
                   FROM site_visits WHERE ${RECENT}
                  ORDER BY created_at DESC LIMIT 20`),
        ]);

        res.json({ ready: true, visitors: now?.visitors || 0, views: now?.views || 0, minutes, pages, countries, recent });
    } catch (error) {
        console.error('Monitoring live error:', error);
        res.status(500).json({ error: 'Failed to load live activity' });
    }
});

// ── Performance ────────────────────────────────────────────────────────────

// Google's Core Web Vitals thresholds: good / needs work / poor.
const VITALS = [
    { key: 'lcp', column: 'lcp_ms', label: 'Largest contentful paint', unit: 'ms', good: 2500, poor: 4000 },
    { key: 'inp', column: 'inp_ms', label: 'Interaction to next paint', unit: 'ms', good: 200, poor: 500 },
    { key: 'cls', column: 'cls_x1000', label: 'Cumulative layout shift', unit: 'score', good: 100, poor: 250 },
    { key: 'fcp', column: 'fcp_ms', label: 'First contentful paint', unit: 'ms', good: 1800, poor: 3000 },
    { key: 'ttfb', column: 'ttfb_ms', label: 'Time to first byte', unit: 'ms', good: 800, poor: 1800 },
    { key: 'load', column: 'load_ms', label: 'Page load', unit: 'ms', good: 3000, poor: 6000 },
];

/**
 * The API's response times, from one row per route per minute. Each row
 * knows its own 95th percentile; across rows they are averaged by the number
 * of requests behind them, which is what a typical slow request looks like.
 * (The largest of them — one slow minute of one rare route — is reported as
 * the worst minute, not as the 95th percentile.)
 */
const P95 = `ROUND(SUM(ms_p95::numeric * hits) / NULLIF(SUM(hits), 0))::int`;

router.get('/performance', async (req, res) => {
    try {
        const ready = await analytics.ready(req.db);
        const range = rangeOf(req.query.range);
        const { hours, bucket } = range;
        const tz = await zoneOf(req.db, req.query.tz);
        const params = [hours, 0];

        // p75 is the figure Core Web Vitals are judged on.
        const vitals = ready ? await Promise.all(VITALS.map(async (metric) => {
            const row = await req.db.get(
                `SELECT COUNT(${metric.column})::int AS samples,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ${metric.column})::int AS p75,
                        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY ${metric.column})::int AS p50,
                        COUNT(*) FILTER (WHERE ${metric.column} <= $3)::int AS good_count,
                        COUNT(*) FILTER (WHERE ${metric.column} > $3 AND ${metric.column} <= $4)::int AS fair_count,
                        COUNT(*) FILTER (WHERE ${metric.column} > $4)::int AS poor_count
                   FROM site_visits WHERE ${WINDOW} AND ${metric.column} IS NOT NULL`,
                [...params, metric.good, metric.poor]);
            return {
                key: metric.key, label: metric.label, unit: metric.unit,
                good: metric.good, poor: metric.poor,
                samples: row?.samples || 0, p75: row?.p75 ?? null, p50: row?.p50 ?? null,
                good_count: row?.good_count || 0, fair_count: row?.fair_count || 0, poor_count: row?.poor_count || 0,
                rating: !row?.samples ? 'none' : (row.p75 <= metric.good ? 'good' : row.p75 <= metric.poor ? 'fair' : 'poor'),
            };
        })) : [];

        const [slowest, trend] = ready ? await Promise.all([
            req.db.all(
                `SELECT path, COUNT(lcp_ms)::int AS samples,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp_ms)::int AS lcp_p75,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY load_ms)::int AS load_p75,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ttfb_ms)::int AS ttfb_p75
                   FROM site_visits WHERE ${WINDOW} AND lcp_ms IS NOT NULL
                  GROUP BY 1 HAVING COUNT(lcp_ms) >= 3 ORDER BY lcp_p75 DESC LIMIT 10`, params),
            req.db.all(
                `WITH ${bucketsCte(bucket, 3)},
                 figures AS (
                    SELECT date_trunc('${bucket}', ${local('created_at', 3)}) AS at,
                           PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp_ms)::int AS lcp_p75,
                           PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY load_ms)::int AS load_p75
                      FROM site_visits WHERE ${WINDOW} AND lcp_ms IS NOT NULL GROUP BY 1
                 )
                 SELECT ${stamp('b.at')} AS at, f.lcp_p75, f.load_p75
                   FROM buckets b LEFT JOIN figures f ON f.at = b.at ORDER BY b.at`, [...params, tz]),
        ]) : [[], []];

        // The platform's own API.
        const hasMetrics = await hasTable(req.db, 'api_metrics');
        const API_WINDOW = `minute >= LOCALTIMESTAMP - make_interval(hours => $1)`;
        const api = hasMetrics ? await req.db.get(
            `SELECT COALESCE(SUM(hits), 0)::int AS requests,
                    COALESCE(SUM(server_errors), 0)::int AS server_errors,
                    COALESCE(SUM(client_errors), 0)::int AS client_errors,
                    COALESCE(ROUND(SUM(ms_total)::numeric / NULLIF(SUM(hits), 0))::int, 0) AS avg_ms,
                    COALESCE(${P95}, 0) AS p95_ms,
                    COALESCE(MAX(ms_p95), 0)::int AS worst_p95_ms
               FROM api_metrics WHERE ${API_WINDOW}`, [hours]) : null;

        const [routes, apiSeries] = hasMetrics ? await Promise.all([
            req.db.all(
                `SELECT route, method, SUM(hits)::int AS hits,
                        ROUND(SUM(ms_total)::numeric / NULLIF(SUM(hits), 0))::int AS avg_ms,
                        ${P95} AS p95_ms, MAX(ms_max)::int AS max_ms,
                        SUM(server_errors)::int AS server_errors, SUM(client_errors)::int AS client_errors
                   FROM api_metrics WHERE ${API_WINDOW}
                  GROUP BY route, method HAVING SUM(hits) >= 3
                  ORDER BY p95_ms DESC NULLS LAST LIMIT 12`, [hours]),
            req.db.all(
                `WITH ${bucketsCte(bucket, 2)},
                 figures AS (
                    SELECT date_trunc('${bucket}', ${local('minute', 2)}) AS at,
                           SUM(hits)::int AS requests,
                           SUM(server_errors)::int AS errors,
                           ${P95} AS p95_ms
                      FROM api_metrics WHERE ${API_WINDOW} GROUP BY 1
                 )
                 SELECT ${stamp('b.at')} AS at, COALESCE(f.requests, 0) AS requests, COALESCE(f.errors, 0) AS errors, f.p95_ms
                   FROM buckets b LEFT JOIN figures f ON f.at = b.at ORDER BY b.at`, [hours, tz]),
        ]) : [[], []];

        res.json({
            ready,
            range: { key: rangeKey(range), label: range.label, bucket, tz },
            vitals,
            slowest,
            trend,
            api: {
                ...(api || { requests: 0, server_errors: 0, client_errors: 0, avg_ms: 0, p95_ms: 0, worst_p95_ms: 0 }),
                error_rate: pct(api?.server_errors || 0, api?.requests || 0),
                routes,
                series: apiSeries,
            },
            health: apiMetrics.health(),
            retention_days: analytics.RETAIN_VISIT_DAYS,
        });
    } catch (error) {
        console.error('Monitoring performance error:', error);
        res.status(500).json({ error: 'Failed to load performance data' });
    }
});

// ── Free courses ───────────────────────────────────────────────────────────
// What learners do in the free courses (/learn, /fr/apprendre): who comes,
// which courses they open, how long they stay, what they start and finish.
// Pages are recognised by their address; with migration 027 each page also
// says its course, and lessons, assessments, games and tests are recorded.

const LEARN_BY_PATH = `(path = '/learn' OR path LIKE '/learn/%' OR path = '/fr/apprendre' OR path LIKE '/fr/apprendre/%')`;
/** Learning steps in a window: `$1` hours back, `$2` hours back (0 = now). */
const EVENT_WINDOW = `e.created_at >= LOCALTIMESTAMP - make_interval(hours => $1)
            AND e.created_at <  LOCALTIMESTAMP - make_interval(hours => $2)`;
/** A learner behind a learning step: the daily hash of its page view, or the page view itself when anonymous. */
const LEARNER = `COALESCE(v.visitor_hash, e.visit_key::text)`;

async function learnTotals(db, LEARN, events, fromHours, toHours) {
    const params = [fromHours, toHours];
    const [pages, activity] = await Promise.all([
        db.get(
            `SELECT COUNT(*)::int AS views,
                    ${VISITORS} AS learners,
                    COALESCE(SUM(dwell_ms), 0)::bigint AS dwell_ms
               FROM site_visits WHERE ${WINDOW} AND ${LEARN}`, params),
        events ? db.get(
            `SELECT COUNT(*) FILTER (WHERE e.kind = 'lesson' AND e.action = 'start')::int AS lessons_started,
                    COUNT(*) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish')::int AS lessons_finished,
                    ROUND(AVG(e.score) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish'))::int AS avg_score,
                    ROUND(AVG(e.seconds) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish' AND e.seconds > 0))::int AS avg_lesson_seconds,
                    COUNT(*) FILTER (WHERE e.kind = 'final' AND e.action = 'finish')::int AS finals_taken,
                    COUNT(*) FILTER (WHERE e.kind = 'final' AND e.action = 'finish' AND e.passed)::int AS finals_passed,
                    COUNT(*) FILTER (WHERE e.kind IN ('game', 'story') AND e.action = 'finish')::int AS games_played,
                    COUNT(*) FILTER (WHERE e.kind = 'placement' AND e.action = 'finish')::int AS placement_tests,
                    COUNT(*) FILTER (WHERE e.kind = 'course_test' AND e.action = 'finish')::int AS course_tests,
                    COUNT(DISTINCT ${LEARNER})::int AS active_learners
               FROM learn_events e LEFT JOIN site_visits v ON v.event_key = e.visit_key
              WHERE ${EVENT_WINDOW}`, params) : null,
    ]);
    const learners = pages?.learners || 0;
    const dwell = Number(pages?.dwell_ms || 0);
    const started = activity?.lessons_started || 0;
    const finished = activity?.lessons_finished || 0;
    return {
        learners,
        views: pages?.views || 0,
        hours_total: Math.round(dwell / 360000) / 10,
        minutes_per_learner: learners ? Math.round(dwell / learners / 6000) / 10 : 0,
        lessons_started: started,
        lessons_finished: finished,
        // A lesson can be finished more often than started on the same day
        // (a restart from the end screen): never above 100 %.
        completion_rate: started ? Math.min(100, pct(finished, started)) : null,
        avg_score: activity?.avg_score ?? null,
        avg_lesson_minutes: activity?.avg_lesson_seconds ? Math.round(activity.avg_lesson_seconds / 6) / 10 : null,
        finals_taken: activity?.finals_taken || 0,
        finals_passed: activity?.finals_passed || 0,
        games_played: activity?.games_played || 0,
        placement_tests: activity?.placement_tests || 0,
        course_tests: activity?.course_tests || 0,
        active_learners: activity?.active_learners || 0,
    };
}

/** Names as the site shows them, in both languages, for a set of keys ("course:x", "lesson:y"…). */
async function titlesFor(db, keys) {
    if (!keys.length || !(await hasTable(db, 'learn_titles'))) return new Map();
    const rows = await db.all('SELECT key, course, category, title_en, title_fr FROM learn_titles WHERE key = ANY($1)', [keys]);
    return new Map(rows.map(r => [r.key, r]));
}

router.get('/learning', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.json({ ready: false });
        const range = rangeOf(req.query.range);
        const tz = await zoneOf(req.db, req.query.tz);
        const { hours, bucket } = range;
        const params = [hours, 0];
        const detailed = await hasColumn(req.db, 'site_visits', 'area');
        const events = detailed && await hasTable(req.db, 'learn_events');
        const LEARN = detailed ? `area = 'learn'` : LEARN_BY_PATH;
        const COURSE_PAGES = `page_kind IN ('course', 'lesson', 'final') AND topic IS NOT NULL`;

        const [now, before, site, series, funnel, coursePages, courseSteps, lessons, gamePages, gamePlays, levels,
            kinds, arrivals, entries, countries, devices, promotions] = await Promise.all([
            learnTotals(req.db, LEARN, events, hours, 0),
            learnTotals(req.db, LEARN, events, hours * 2, hours),
            req.db.get(`SELECT ${VISITORS} AS visitors FROM site_visits WHERE ${WINDOW}`, params),
            req.db.all(
                `WITH ${bucketsCte(bucket, 3)},
                 pages AS (
                    SELECT date_trunc('${bucket}', ${local('created_at', 3)}) AS at,
                           COUNT(*)::int AS views, ${VISITORS} AS learners
                      FROM site_visits WHERE ${WINDOW} AND ${LEARN} GROUP BY 1
                 ), steps AS (
                    ${events
                        ? `SELECT date_trunc('${bucket}', ${local('e.created_at', 3)}) AS at,
                                  COUNT(*) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish')::int AS lessons
                             FROM learn_events e WHERE ${EVENT_WINDOW} GROUP BY 1`
                        : 'SELECT NULL::timestamp AS at, 0 AS lessons WHERE false'}
                 )
                 SELECT ${stamp('b.at')} AS at, COALESCE(p.learners, 0) AS learners, COALESCE(p.views, 0) AS views,
                        COALESCE(s.lessons, 0) AS lessons
                   FROM buckets b LEFT JOIN pages p ON p.at = b.at LEFT JOIN steps s ON s.at = b.at ORDER BY b.at`,
                [...params, tz]),
            // From a visit of the free courses to a passed assessment.
            events ? req.db.get(
                `SELECT
                    (SELECT ${VISITORS} FROM site_visits WHERE ${WINDOW} AND ${LEARN} AND ${COURSE_PAGES}) AS course_viewers,
                    COUNT(DISTINCT ${LEARNER}) FILTER (WHERE e.kind = 'lesson' AND e.action = 'start')::int AS lesson_starters,
                    COUNT(DISTINCT ${LEARNER}) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish')::int AS lesson_finishers,
                    COUNT(DISTINCT ${LEARNER}) FILTER (WHERE e.kind = 'final' AND e.action = 'finish' AND e.passed)::int AS final_passers
                   FROM learn_events e LEFT JOIN site_visits v ON v.event_key = e.visit_key
                  WHERE ${EVENT_WINDOW}`, params) : null,
            detailed ? req.db.all(
                `SELECT topic AS course, COUNT(*)::int AS views, ${VISITORS} AS learners,
                        COALESCE(SUM(dwell_ms), 0)::bigint AS dwell_ms
                   FROM site_visits WHERE ${WINDOW} AND ${LEARN} AND ${COURSE_PAGES}
                  GROUP BY 1 ORDER BY learners DESC, views DESC LIMIT 40`, params) : [],
            events ? req.db.all(
                `SELECT e.course,
                        COUNT(*) FILTER (WHERE e.kind = 'lesson' AND e.action = 'start')::int AS starts,
                        COUNT(*) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish')::int AS finishes,
                        ROUND(AVG(e.score) FILTER (WHERE e.kind = 'lesson' AND e.action = 'finish'))::int AS avg_score,
                        COUNT(*) FILTER (WHERE e.kind = 'final' AND e.action = 'finish')::int AS finals_taken,
                        COUNT(*) FILTER (WHERE e.kind = 'final' AND e.action = 'finish' AND e.passed)::int AS finals_passed
                   FROM learn_events e WHERE ${EVENT_WINDOW} AND e.course IS NOT NULL
                  GROUP BY 1`, params) : [],
            events ? req.db.all(
                `SELECT e.course, e.item,
                        COUNT(*) FILTER (WHERE e.action = 'start')::int AS starts,
                        COUNT(*) FILTER (WHERE e.action = 'finish')::int AS finishes,
                        ROUND(AVG(e.score) FILTER (WHERE e.action = 'finish'))::int AS avg_score,
                        ROUND(AVG(e.seconds) FILTER (WHERE e.action = 'finish' AND e.seconds > 0))::int AS avg_seconds
                   FROM learn_events e WHERE ${EVENT_WINDOW} AND e.kind = 'lesson' AND e.item IS NOT NULL
                  GROUP BY 1, 2 ORDER BY starts DESC, finishes DESC LIMIT 60`, params) : [],
            detailed ? req.db.all(
                `SELECT topic AS game, COUNT(*)::int AS views, ${VISITORS} AS learners
                   FROM site_visits WHERE ${WINDOW} AND ${LEARN} AND page_kind = 'game' AND topic IS NOT NULL
                  GROUP BY 1`, params) : [],
            events ? req.db.all(
                `SELECT CASE WHEN e.kind = 'story' THEN 'story' ELSE e.item END AS game, COUNT(*)::int AS plays,
                        ROUND(AVG(e.score) FILTER (WHERE e.kind = 'story'))::int AS avg_score
                   FROM learn_events e WHERE ${EVENT_WINDOW} AND e.kind IN ('game', 'story') AND e.action = 'finish'
                  GROUP BY 1`, params) : [],
            events ? req.db.all(
                `SELECT e.item AS level, COUNT(*)::int AS tests, ROUND(AVG(e.score))::int AS avg_score
                   FROM learn_events e WHERE ${EVENT_WINDOW} AND e.kind = 'placement' AND e.action = 'finish' AND e.item IS NOT NULL
                  GROUP BY 1 ORDER BY 1`, params) : [],
            detailed ? req.db.all(
                `SELECT COALESCE(page_kind, 'other') AS kind, COUNT(*)::int AS views, ${VISITORS} AS learners,
                        COALESCE(ROUND(AVG(NULLIF(dwell_ms, 0)) / 1000)::int, 0) AS avg_seconds
                   FROM site_visits WHERE ${WINDOW} AND ${LEARN}
                  GROUP BY 1 ORDER BY views DESC`, params) : [],
            // Learners who land straight on the free courses, and from where.
            req.db.all(
                `SELECT channel, COUNT(*)::int AS visits FROM site_visits
                  WHERE ${WINDOW} AND ${LEARN} AND ${ARRIVAL} GROUP BY 1 ORDER BY visits DESC`, params),
            req.db.all(
                `SELECT path, COUNT(*)::int AS visits FROM site_visits
                  WHERE ${WINDOW} AND ${LEARN} AND ${ARRIVAL} GROUP BY 1 ORDER BY visits DESC LIMIT 10`, params),
            req.db.all(
                `SELECT COALESCE(country, '??') AS country, COUNT(*)::int AS views, ${VISITORS} AS learners
                   FROM site_visits WHERE ${WINDOW} AND ${LEARN}
                  GROUP BY 1 ORDER BY learners DESC, views DESC LIMIT 12`, params),
            req.db.all(
                `SELECT device AS name, COUNT(*)::int AS views, ${VISITORS} AS learners
                   FROM site_visits WHERE ${WINDOW} AND ${LEARN}
                  GROUP BY 1 ORDER BY views DESC`, params),
            // What the free courses bring to the campaigns (their "Enjoying this course?" card).
            (async () => {
                if (!(await hasTable(req.db, 'promotion_stats'))) return null;
                const [shown, registered] = await Promise.all([
                    req.db.get(
                        `SELECT COALESCE(SUM(views), 0)::int AS views, COALESCE(SUM(clicks), 0)::int AS clicks
                           FROM promotion_stats WHERE placement = 'learn'
                            AND day >= (LOCALTIMESTAMP - make_interval(hours => $1))::date`, [hours]),
                    req.db.get(
                        `SELECT COUNT(*)::int AS registrations FROM promotion_registrations
                          WHERE placement = 'learn' AND created_at >= LOCALTIMESTAMP - make_interval(hours => $1)`, [hours]),
                ]);
                return { views: shown?.views || 0, clicks: shown?.clicks || 0, registrations: registered?.registrations || 0 };
            })(),
        ]);

        // Courses: their pages and their learning steps, with their names.
        const steps = new Map(courseSteps.map(s => [s.course, s]));
        const courseIds = [...new Set([...coursePages.map(c => c.course), ...courseSteps.map(s => s.course)])];
        const lessonKeys = lessons.map(l => `lesson:${l.item}`);
        const gameIds = [...new Set([...gamePages.map(g => g.game), ...gamePlays.map(g => g.game)])];
        const titles = await titlesFor(req.db, [
            ...courseIds.map(c => `course:${c}`), ...lessons.map(l => `course:${l.course}`), ...lessonKeys, ...gameIds.map(g => `game:${g}`),
        ]);
        const name = (key) => {
            const t = titles.get(key);
            return { title_en: t?.title_en || null, title_fr: t?.title_fr || null };
        };
        const pageOf = new Map(coursePages.map(c => [c.course, c]));
        const courses = courseIds.map(course => {
            const page = pageOf.get(course);
            const s = steps.get(course);
            const learners = page?.learners || 0;
            const dwell = Number(page?.dwell_ms || 0);
            return {
                course,
                ...name(`course:${course}`),
                category: titles.get(`course:${course}`)?.category || null,
                views: page?.views || 0,
                learners,
                minutes: Math.round(dwell / 6000) / 10,
                minutes_per_learner: learners ? Math.round(dwell / learners / 6000) / 10 : 0,
                lessons_started: s?.starts || 0,
                lessons_finished: s?.finishes || 0,
                completion_rate: s?.starts ? Math.min(100, pct(s.finishes, s.starts)) : null,
                avg_score: s?.avg_score ?? null,
                finals_taken: s?.finals_taken || 0,
                finals_passed: s?.finals_passed || 0,
            };
        }).sort((a, b) => b.learners - a.learners || b.lessons_started - a.lessons_started || b.views - a.views).slice(0, 30);

        const categories = Object.values(courses.reduce((all, c) => {
            const key = c.category || 'other';
            const row = all[key] || (all[key] = { category: key, courses: 0, views: 0, learners: 0, lessons_finished: 0 });
            row.courses += 1;
            row.views += c.views;
            row.learners += c.learners;
            row.lessons_finished += c.lessons_finished;
            return all;
        }, {})).sort((a, b) => b.views - a.views);

        const plays = new Map(gamePlays.map(g => [g.game, g]));
        const pagesOfGame = new Map(gamePages.map(g => [g.game, g]));
        const games = gameIds.map(game => ({
            game,
            ...name(`game:${game}`),
            views: pagesOfGame.get(game)?.views || 0,
            learners: pagesOfGame.get(game)?.learners || 0,
            plays: plays.get(game)?.plays || 0,
            avg_score: plays.get(game)?.avg_score ?? null,
        })).sort((a, b) => b.plays - a.plays || b.views - a.views);

        const siteVisitors = site?.visitors || 0;
        res.json({
            ready: true,
            detailed,
            events,
            range: { key: rangeKey(range), label: range.label, bucket, tz },
            kpis: {
                ...now,
                share_of_visitors: pct(now.learners, siteVisitors),
                change: {
                    learners: change(now.learners, before.learners),
                    views: change(now.views, before.views),
                    minutes_per_learner: change(now.minutes_per_learner, before.minutes_per_learner),
                    lessons_finished: change(now.lessons_finished, before.lessons_finished),
                    completion_points: now.completion_rate !== null && before.completion_rate !== null
                        ? round1(now.completion_rate - before.completion_rate) : null,
                },
                previous: before,
            },
            series,
            funnel: funnel ? [
                { step: 'learners', value: now.learners },
                { step: 'course', value: funnel.course_viewers || 0 },
                { step: 'started', value: funnel.lesson_starters || 0 },
                { step: 'finished', value: funnel.lesson_finishers || 0 },
                { step: 'final', value: funnel.final_passers || 0 },
            ] : [],
            courses,
            categories,
            lessons: lessons.map(l => ({
                ...l,
                ...name(`lesson:${l.item}`),
                course_title_en: titles.get(`course:${l.course}`)?.title_en || null,
                course_title_fr: titles.get(`course:${l.course}`)?.title_fr || null,
                completion_rate: l.starts ? Math.min(100, pct(l.finishes, l.starts)) : null,
            })),
            games,
            levels,
            page_kinds: kinds,
            arrivals,
            entry_pages: entries,
            countries,
            devices,
            promotions,
        });
    } catch (error) {
        console.error('Monitoring learning error:', error);
        res.status(500).json({ error: 'Failed to load the free-course statistics' });
    }
});

// ── Export ─────────────────────────────────────────────────────────────────

router.get('/export', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.status(409).json({ error: 'Monitoring is not set up yet' });
        const range = rangeOf(req.query.range);
        const tz = await zoneOf(req.db, req.query.tz);
        const rows = await req.db.all(
            `WITH ${bucketsCte('day', 3)},
             days AS (
                SELECT date_trunc('day', ${local('created_at', 3)}) AS at,
                       COUNT(*)::int AS visits,
                       ${VISITORS} AS visitors,
                       COUNT(*) FILTER (WHERE ${ARRIVAL})::int AS arrivals,
                       COUNT(DISTINCT country)::int AS countries,
                       COUNT(*) FILTER (WHERE device = 'phone')::int AS phone,
                       COUNT(*) FILTER (WHERE device = 'desktop')::int AS desktop,
                       COUNT(*) FILTER (WHERE device = 'tablet')::int AS tablet,
                       PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp_ms)::int AS lcp_p75
                  FROM site_visits WHERE ${WINDOW}
                 GROUP BY 1
             )
             SELECT to_char(b.at, 'YYYY-MM-DD') AS day,
                    COALESCE(d.visits, 0) AS visits, COALESCE(d.visitors, 0) AS visitors, COALESCE(d.arrivals, 0) AS arrivals,
                    COALESCE(d.countries, 0) AS countries, COALESCE(d.phone, 0) AS phone,
                    COALESCE(d.desktop, 0) AS desktop, COALESCE(d.tablet, 0) AS tablet, d.lcp_p75
               FROM buckets b LEFT JOIN days d ON d.at = b.at ORDER BY b.at`, [range.hours, 0, tz]);

        const header = 'day,page_views,visitors,arrivals,countries,phone,desktop,tablet,lcp_p75_ms';
        const body = rows.map(r => [r.day, r.visits, r.visitors, r.arrivals, r.countries, r.phone, r.desktop, r.tablet, r.lcp_p75 ?? ''].join(','));
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="website-monitoring-${new Date().toISOString().slice(0, 10)}.csv"`);
        res.send([header, ...body].join('\n'));
    } catch (error) {
        console.error('Monitoring export error:', error);
        res.status(500).json({ error: 'Failed to export' });
    }
});

module.exports = router;
