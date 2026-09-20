/**
 * What the monitoring API returns, and the small helpers the views share.
 *
 * Everything here is an aggregate: there is no visitor object anywhere,
 * because the platform never stores one.
 */

export type RangeKey = '24h' | '7d' | '30d' | '90d';

export const RANGES: { key: RangeKey; label: string; short: string }[] = [
    { key: '24h', label: 'Last 24 hours', short: '24h' },
    { key: '7d', label: 'Last 7 days', short: '7d' },
    { key: '30d', label: 'Last 30 days', short: '30d' },
    { key: '90d', label: 'Last 90 days', short: '90d' },
];

export interface Point { at: string; visits: number; visitors: number }
export interface Named { name: string; visits: number }
export interface CountryRow { country: string; visits: number; visitors: number }
export interface PageRow { path: string; visits: number; visitors: number; avg_seconds: number }
export interface ReferrerRow { host: string; visits: number }
export interface CampaignRow { name: string | null; source: string | null; medium: string | null; visits: number }

export interface Overview {
    ready: boolean;
    range: { key: RangeKey; label: string; bucket: 'hour' | 'day' };
    kpis: {
        visits: number; visitors: number; sessions: number; bounce_rate: number; avg_seconds: number;
        live_visitors: number;
        change: Record<'visits' | 'visitors' | 'sessions' | 'bounce_rate' | 'avg_seconds', number | null>;
        previous: { visits: number; visitors: number; sessions: number; bounce_rate: number; avg_seconds: number };
    };
    series: Point[];
    countries: CountryRow[];
    pages: PageRow[];
    channels: { channel: string; visits: number }[];
    referrers: ReferrerRow[];
    campaigns: CampaignRow[];
    devices: Named[];
    browsers: Named[];
    systems: Named[];
    languages: Named[];
}

export interface Vital {
    key: string;
    label: string;
    unit: 'ms' | 'score';
    /** The thresholds this metric is judged against. */
    good: number;
    poor: number;
    samples: number;
    p75: number | null;
    p50: number | null;
    /** How many page views fell in each band. */
    good_count: number;
    fair_count: number;
    poor_count: number;
    rating: 'good' | 'fair' | 'poor' | 'none';
}

export interface Performance {
    ready: boolean;
    vitals: Vital[];
    slowest: { path: string; samples: number; lcp_p75: number; load_p75: number; ttfb_p75: number }[];
    trend: { at: string; lcp_p75: number; load_p75: number }[];
    api: {
        requests: number; server_errors: number; client_errors: number; avg_ms: number; p95_ms: number;
        error_rate: number;
        routes: { route: string; method: string; hits: number; avg_ms: number; p95_ms: number; max_ms: number; server_errors: number; client_errors: number }[];
        series: { at: string; requests: number; errors: number; p95_ms: number }[];
    };
    health: {
        uptime_seconds: number; memory_mb: number; heap_used_mb: number; heap_total_mb: number;
        event_loop_lag_ms: number; node: string; started_at: string;
    };
    retention_days: number;
}

export interface Live {
    ready: boolean;
    visitors: number;
    views: number;
    minutes: { at: string; visits: number }[];
    pages: { path: string; visits: number }[];
    countries: { country: string; visits: number }[];
    recent: {
        path: string; country: string | null; device: string | null; browser: string | null;
        channel: string; referrer_host: string | null; seconds_ago: number;
    }[];
}

// ── Formatting ─────────────────────────────────────────────────────────────

const regionNames = (() => {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }); } catch { return null; }
})();

/** "FR" → "France". Unknown or missing codes stay readable. */
export function countryName(code: string | null | undefined): string {
    if (!code || code === '??') return 'Unknown';
    try { return regionNames?.of(code.toUpperCase()) || code; } catch { return code; }
}

/** "FR" → 🇫🇷, built from the letters themselves — no image files. */
export function flag(code: string | null | undefined): string {
    if (!code || code.length !== 2 || code === '??') return '🌐';
    const base = 0x1f1e6;
    const [a, b] = code.toUpperCase().split('');
    if (a < 'A' || a > 'Z' || b < 'A' || b > 'Z') return '🌐';
    return String.fromCodePoint(base + a.charCodeAt(0) - 65, base + b.charCodeAt(0) - 65);
}

const languageNames = (() => {
    try { return new Intl.DisplayNames(['en'], { type: 'language' }); } catch { return null; }
})();
export const languageName = (code: string) => {
    if (!code || code === '??') return 'Unknown';
    try { return languageNames?.of(code) || code.toUpperCase(); } catch { return code.toUpperCase(); }
};

/** 1 240 → "1.2k" */
export function compact(n: number | null | undefined): string {
    const value = Number(n) || 0;
    if (Math.abs(value) < 1000) return String(value);
    if (Math.abs(value) < 1_000_000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
    return `${(value / 1_000_000).toFixed(1)}M`;
}

/** 95 → "1m 35s" */
export function duration(seconds: number | null | undefined): string {
    const s = Math.max(0, Math.round(Number(seconds) || 0));
    if (!s) return '—';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** 2450 → "2.45 s" · 340 → "340 ms" */
export function ms(value: number | null | undefined): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    return n >= 1000 ? `${(n / 1000).toFixed(2)} s` : `${Math.round(n)} ms`;
}

/** A layout-shift score is stored ×1000. */
export const clsText = (x1000: number | null | undefined) =>
    Number.isFinite(Number(x1000)) ? (Number(x1000) / 1000).toFixed(3) : '—';

export const vitalText = (unit: 'ms' | 'score', value: number | null | undefined) =>
    unit === 'score' ? clsText(value) : ms(value);

export const uptimeText = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d) return `${d}d ${h}h`;
    if (h) return `${h}h ${m}m`;
    return `${m}m`;
};

/** A timestamp from the API, on the axis of a chart. */
export function axisLabel(at: string, bucket: 'hour' | 'day' | 'minute'): string {
    const date = new Date(at);
    if (Number.isNaN(date.getTime())) return '';
    if (bucket === 'day') return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (bucket === 'minute') return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export const agoText = (seconds: number) => {
    if (seconds < 60) return 'just now';
    const m = Math.round(seconds / 60);
    return m === 1 ? '1 min ago' : `${m} min ago`;
};

export const CHANNEL_LABEL: Record<string, string> = {
    direct: 'Direct',
    search: 'Search',
    social: 'Social',
    referral: 'Referral',
    campaign: 'Campaign',
};

export const CHANNEL_COLOR: Record<string, string> = {
    direct: '#4f46e5',
    search: '#0e9f6e',
    social: '#d946ef',
    referral: '#f59e0b',
    campaign: '#ef4444',
};

export const DEVICE_COLOR: Record<string, string> = {
    desktop: '#4f46e5',
    phone: '#0e9f6e',
    tablet: '#f59e0b',
};

export const RATING_LABEL: Record<string, string> = {
    good: 'Good',
    fair: 'Needs work',
    poor: 'Poor',
    none: 'No data yet',
};
