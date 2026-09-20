/**
 * Website monitoring — read-only, administrators with the monitoring key only.
 *
 * Everything here is an aggregate over site_visits and api_metrics. There is
 * no endpoint that returns a single visitor, because a single visitor is not
 * something the platform stores: rows carry a daily hash, never a person.
 */
const express = require('express');
const { authenticateToken, adminOnly, monitoringOnly } = require('../middleware/auth');
const { hasTable } = require('../services/schemaFeatures');
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

/** Visits in a window, excluding crawlers. `$1` hours back, `$2` hours back (0 = now). */
const WINDOW = `created_at >= LOCALTIMESTAMP - make_interval(hours => $1)
            AND created_at <  LOCALTIMESTAMP - make_interval(hours => $2)
            AND NOT is_bot`;

const pct = (part, whole) => (whole ? Math.round((part / whole) * 1000) / 10 : 0);
const change = (now, before) => (before ? Math.round(((now - before) / before) * 1000) / 10 : null);

// ── Overview ───────────────────────────────────────────────────────────────

/** Visits, visitors, sessions and bounce rate for one window. */
async function totals(db, fromHours, toHours) {
    const basic = await db.get(
        `SELECT COUNT(*)::int AS visits,
                COUNT(DISTINCT visitor_hash)::int AS visitors,
                COALESCE(ROUND(AVG(NULLIF(dwell_ms, 0)) / 1000)::int, 0) AS avg_seconds
           FROM site_visits WHERE ${WINDOW}`,
        [fromHours, toHours]);

    // A session is a run of page views from the same visitor with no gap
    // longer than half an hour — the usual convention, computed on the fly so
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

    return {
        visits: basic?.visits || 0,
        visitors: basic?.visitors || 0,
        sessions: sessions?.sessions || 0,
        bounce_rate: pct(sessions?.single_page || 0, sessions?.sessions || 0),
        avg_seconds: basic?.avg_seconds || 0,
    };
}

router.get('/overview', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.json({ ready: false });
        const range = rangeOf(req.query.range);
        const { hours, bucket } = range;
        const params = [hours, 0];

        const [now, before, live, series, countries, pages, channels, referrers, campaigns, devices, browsers, systems, languages] = await Promise.all([
            totals(req.db, hours, 0),
            totals(req.db, hours * 2, hours),
            req.db.get(
                `SELECT COUNT(DISTINCT visitor_hash)::int AS visitors, COUNT(*)::int AS views
                   FROM site_visits WHERE created_at >= LOCALTIMESTAMP - INTERVAL '5 minutes' AND NOT is_bot`),
            req.db.all(
                `SELECT date_trunc('${bucket}', created_at) AS at,
                        COUNT(*)::int AS visits,
                        COUNT(DISTINCT visitor_hash)::int AS visitors
                   FROM site_visits WHERE ${WINDOW}
                  GROUP BY 1 ORDER BY 1`, params),
            req.db.all(
                `SELECT COALESCE(country, '??') AS country,
                        COUNT(*)::int AS visits,
                        COUNT(DISTINCT visitor_hash)::int AS visitors
                   FROM site_visits WHERE ${WINDOW}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 40`, params),
            req.db.all(
                `SELECT path,
                        COUNT(*)::int AS visits,
                        COUNT(DISTINCT visitor_hash)::int AS visitors,
                        COALESCE(ROUND(AVG(NULLIF(dwell_ms, 0)) / 1000)::int, 0) AS avg_seconds
                   FROM site_visits WHERE ${WINDOW}
                  GROUP BY 1 ORDER BY visits DESC LIMIT 25`, params),
            req.db.all(
                `SELECT channel, COUNT(*)::int AS visits FROM site_visits WHERE ${WINDOW}
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
            range: { key: Object.keys(RANGES).find(k => RANGES[k] === range), label: range.label, bucket },
            kpis: {
                ...now,
                live_visitors: live?.visitors || 0,
                change: {
                    visits: change(now.visits, before.visits),
                    visitors: change(now.visitors, before.visitors),
                    sessions: change(now.sessions, before.sessions),
                    bounce_rate: change(now.bounce_rate, before.bounce_rate),
                    avg_seconds: change(now.avg_seconds, before.avg_seconds),
                },
                previous: before,
            },
            series,
            countries,
            pages,
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
                        COUNT(DISTINCT visitor_hash)::int AS visitors,
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
                    SELECT country, visitor_hash,
                           SUM(starts) OVER (PARTITION BY visitor_hash ORDER BY created_at) AS session_no
                      FROM steps
                 ), grouped AS (
                    SELECT country, visitor_hash, session_no, COUNT(*)::int AS views
                      FROM numbered GROUP BY 1, 2, 3
                 )
                 SELECT country, COUNT(*)::int AS sessions,
                        COUNT(*) FILTER (WHERE views = 1)::int AS single_page
                   FROM grouped GROUP BY 1`, params),

            // The page most read in each country.
            req.db.all(
                `SELECT country, path, visits FROM (
                    SELECT COALESCE(country, '??') AS country, path, COUNT(*)::int AS visits,
                           ROW_NUMBER() OVER (PARTITION BY COALESCE(country, '??') ORDER BY COUNT(*) DESC) AS rank
                      FROM site_visits WHERE ${WINDOW}
                     GROUP BY 1, 2
                 ) ranked WHERE rank = 1`, params),

            req.db.get(
                `SELECT COUNT(*)::int AS visits,
                        COUNT(DISTINCT visitor_hash)::int AS visitors,
                        COUNT(DISTINCT country)::int AS countries,
                        COUNT(*) FILTER (WHERE country IS NULL)::int AS unplaced
                   FROM site_visits WHERE ${WINDOW}`, params),
        ]);

        const bySession = new Map(sessions.map(s => [s.country, s]));
        const byPage = new Map(pages.map(p => [p.country, p]));
        const total = totals?.visits || 0;

        res.json({
            ready: true,
            range: { key: Object.keys(RANGES).find(k => RANGES[k] === range), label: range.label },
            totals: totals || { visits: 0, visitors: 0, countries: 0, unplaced: 0 },
            countries: rows.map(row => {
                const session = bySession.get(row.country);
                return {
                    ...row,
                    share: pct(row.visits, total),
                    sessions: session?.sessions || 0,
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

        const [now, minutes, pages, countries, recent] = await Promise.all([
            req.db.get(
                `SELECT COUNT(DISTINCT visitor_hash)::int AS visitors, COUNT(*)::int AS views
                   FROM site_visits WHERE created_at >= LOCALTIMESTAMP - INTERVAL '5 minutes' AND NOT is_bot`),
            req.db.all(
                `SELECT date_trunc('minute', created_at) AS at, COUNT(*)::int AS visits
                   FROM site_visits WHERE created_at >= LOCALTIMESTAMP - INTERVAL '30 minutes' AND NOT is_bot
                  GROUP BY 1 ORDER BY 1`),
            req.db.all(
                `SELECT path, COUNT(*)::int AS visits FROM site_visits
                  WHERE created_at >= LOCALTIMESTAMP - INTERVAL '30 minutes' AND NOT is_bot
                  GROUP BY 1 ORDER BY visits DESC LIMIT 8`),
            req.db.all(
                `SELECT COALESCE(country, '??') AS country, COUNT(*)::int AS visits FROM site_visits
                  WHERE created_at >= LOCALTIMESTAMP - INTERVAL '30 minutes' AND NOT is_bot
                  GROUP BY 1 ORDER BY visits DESC LIMIT 8`),
            req.db.all(
                `SELECT path, country, device, browser, channel, referrer_host,
                        EXTRACT(EPOCH FROM (LOCALTIMESTAMP - created_at))::int AS seconds_ago
                   FROM site_visits WHERE created_at >= LOCALTIMESTAMP - INTERVAL '30 minutes' AND NOT is_bot
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

router.get('/performance', async (req, res) => {
    try {
        const ready = await analytics.ready(req.db);
        const { hours, bucket } = rangeOf(req.query.range);
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
                `SELECT date_trunc('${bucket}', created_at) AS at,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp_ms)::int AS lcp_p75,
                        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY load_ms)::int AS load_p75
                   FROM site_visits WHERE ${WINDOW} AND lcp_ms IS NOT NULL
                  GROUP BY 1 ORDER BY 1`, params),
        ]) : [[], []];

        // The platform's own API.
        const hasMetrics = await hasTable(req.db, 'api_metrics');
        const api = hasMetrics ? await req.db.get(
            `SELECT COALESCE(SUM(hits), 0)::int AS requests,
                    COALESCE(SUM(server_errors), 0)::int AS server_errors,
                    COALESCE(SUM(client_errors), 0)::int AS client_errors,
                    COALESCE(ROUND(SUM(ms_total)::numeric / NULLIF(SUM(hits), 0))::int, 0) AS avg_ms,
                    COALESCE(MAX(ms_p95), 0)::int AS p95_ms
               FROM api_metrics WHERE minute >= LOCALTIMESTAMP - make_interval(hours => $1)`, [hours]) : null;

        const [routes, apiSeries] = hasMetrics ? await Promise.all([
            req.db.all(
                `SELECT route, method, SUM(hits)::int AS hits,
                        ROUND(SUM(ms_total)::numeric / NULLIF(SUM(hits), 0))::int AS avg_ms,
                        MAX(ms_p95)::int AS p95_ms, MAX(ms_max)::int AS max_ms,
                        SUM(server_errors)::int AS server_errors, SUM(client_errors)::int AS client_errors
                   FROM api_metrics WHERE minute >= LOCALTIMESTAMP - make_interval(hours => $1)
                  GROUP BY route, method HAVING SUM(hits) >= 3
                  ORDER BY p95_ms DESC LIMIT 12`, [hours]),
            req.db.all(
                `SELECT date_trunc('${bucket}', minute) AS at,
                        SUM(hits)::int AS requests,
                        SUM(server_errors)::int AS errors,
                        MAX(ms_p95)::int AS p95_ms
                   FROM api_metrics WHERE minute >= LOCALTIMESTAMP - make_interval(hours => $1)
                  GROUP BY 1 ORDER BY 1`, [hours]),
        ]) : [[], []];

        res.json({
            ready,
            vitals,
            slowest,
            trend,
            api: {
                ...(api || { requests: 0, server_errors: 0, client_errors: 0, avg_ms: 0, p95_ms: 0 }),
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

// ── Export ─────────────────────────────────────────────────────────────────

router.get('/export', async (req, res) => {
    try {
        if (!(await analytics.ready(req.db))) return res.status(409).json({ error: 'Monitoring is not set up yet' });
        const { hours } = rangeOf(req.query.range);
        const rows = await req.db.all(
            `SELECT date_trunc('day', created_at)::date AS day,
                    COUNT(*)::int AS visits,
                    COUNT(DISTINCT visitor_hash)::int AS visitors,
                    COUNT(DISTINCT country)::int AS countries,
                    COUNT(*) FILTER (WHERE device = 'phone')::int AS phone,
                    COUNT(*) FILTER (WHERE device = 'desktop')::int AS desktop,
                    COUNT(*) FILTER (WHERE device = 'tablet')::int AS tablet,
                    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp_ms)::int AS lcp_p75
               FROM site_visits WHERE ${WINDOW}
              GROUP BY 1 ORDER BY 1`, [hours, 0]);

        const header = 'day,visits,visitors,countries,phone,desktop,tablet,lcp_p75_ms';
        const body = rows.map(r => [r.day, r.visits, r.visitors, r.countries, r.phone, r.desktop, r.tablet, r.lcp_p75 ?? ''].join(','));
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="website-monitoring-${new Date().toISOString().slice(0, 10)}.csv"`);
        res.send([header, ...body].join('\n'));
    } catch (error) {
        console.error('Monitoring export error:', error);
        res.status(500).json({ error: 'Failed to export' });
    }
});

module.exports = router;
