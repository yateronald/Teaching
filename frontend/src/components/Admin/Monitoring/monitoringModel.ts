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
    range: { key: RangeKey; label: string; bucket: 'hour' | 'day'; tz?: string };
    kpis: {
        visits: number; visitors: number; sessions: number; bounce_rate: number; avg_seconds: number;
        /** Pages read per visit, on the visits that can be followed. */
        pages_per_session?: number;
        /** Page views of visitors who asked not to be tracked (no identifier). */
        anonymous_visits?: number;
        live_visitors: number;
        change: Record<'visits' | 'visitors' | 'sessions' | 'bounce_rate' | 'avg_seconds', number | null>
            & { bounce_points?: number | null };
        previous: { visits: number; visitors: number; sessions: number; bounce_rate: number; avg_seconds: number };
    };
    series: Point[];
    countries: CountryRow[];
    pages: PageRow[];
    /** The pages visits begin on. */
    entry_pages?: { path: string; visits: number }[];
    channels: { channel: string; visits: number }[];
    referrers: ReferrerRow[];
    campaigns: CampaignRow[];
    devices: Named[];
    browsers: Named[];
    systems: Named[];
    languages: Named[];
}

/** The free courses: who learns, what, for how long, and how far they get. */
export interface LearningCourse {
    course: string; title_en: string | null; title_fr: string | null; category: string | null;
    views: number; learners: number; minutes: number; minutes_per_learner: number;
    lessons_started: number; lessons_finished: number; completion_rate: number | null; avg_score: number | null;
    finals_taken: number; finals_passed: number;
}
export interface LearningLesson {
    course: string; item: string; title_en: string | null; title_fr: string | null;
    course_title_en: string | null; course_title_fr: string | null;
    starts: number; finishes: number; completion_rate: number | null; avg_score: number | null; avg_seconds: number | null;
}
export interface Learning {
    ready: boolean;
    /** False until migration 027: pages are then known by their address only. */
    detailed: boolean;
    /** False until migration 027: lessons started and finished are not recorded yet. */
    events: boolean;
    range: { key: RangeKey; label: string; bucket: 'hour' | 'day'; tz?: string };
    kpis: {
        learners: number; views: number; hours_total: number; minutes_per_learner: number;
        lessons_started: number; lessons_finished: number; completion_rate: number | null; avg_score: number | null;
        avg_lesson_minutes: number | null; finals_taken: number; finals_passed: number; games_played: number;
        placement_tests: number; course_tests: number; active_learners: number; share_of_visitors: number;
        change: { learners: number | null; views: number | null; minutes_per_learner: number | null; lessons_finished: number | null; completion_points: number | null };
    };
    series: { at: string; learners: number; views: number; lessons: number }[];
    funnel: { step: 'learners' | 'course' | 'started' | 'finished' | 'final'; value: number }[];
    courses: LearningCourse[];
    categories: { category: string; courses: number; views: number; learners: number; lessons_finished: number }[];
    lessons: LearningLesson[];
    games: { game: string; title_en: string | null; title_fr: string | null; views: number; learners: number; plays: number; avg_score: number | null }[];
    levels: { level: string; tests: number; avg_score: number | null }[];
    page_kinds: { kind: string; views: number; learners: number; avg_seconds: number }[];
    arrivals: { channel: string; visits: number }[];
    entry_pages: { path: string; visits: number }[];
    countries: { country: string; views: number; learners: number }[];
    devices: { name: string; views: number; learners: number }[];
    promotions: { views: number; clicks: number; registrations: number } | null;
}

export const PAGE_KIND_LABEL: Record<string, string> = {
    hub: 'Free courses home',
    category: 'Category pages',
    level: 'Level pages',
    course: 'Course pages',
    lesson: 'Lessons',
    final: 'Final assessments',
    games: 'Games home',
    game: 'Games',
    placement: 'Level test',
    progress: 'My progress',
    practice: 'Practice home',
    reading: 'Reading library',
    text: 'Reading texts',
    none: 'Page not found',
    other: 'Other',
};

/** The categories of the free courses (learn/categories.ts). */
export const CATEGORY_LABEL: Record<string, string> = {
    beginner: 'Beginner French', grammar: 'French Grammar', conjugation: 'Conjugation', spelling: 'Spelling', listening: 'Listening',
    reading: 'Reading', pronunciation: 'Pronunciation', conversation: 'Conversation', tcf: 'TCF Canada',
    'tef-quebec': 'TEF Canada & Québec', 'delf-dalf': 'DELF & DALF', business: 'Business French', other: 'Other',
};

/** "passe-compose" → "Passe compose", when the site has not told the title yet. */
export const fromId = (id: string) => (id.charAt(0).toUpperCase() + id.slice(1)).replace(/[-_]+/g, ' ');

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
    range?: { key: RangeKey; label: string; bucket: 'hour' | 'day'; tz?: string };
    vitals: Vital[];
    slowest: { path: string; samples: number; lcp_p75: number; load_p75: number; ttfb_p75: number }[];
    trend: { at: string; lcp_p75: number | null; load_p75: number | null }[];
    api: {
        requests: number; server_errors: number; client_errors: number; avg_ms: number; p95_ms: number;
        /** The slowest minute of any single route (p95), for the record. */
        worst_p95_ms?: number;
        error_rate: number;
        routes: { route: string; method: string; hits: number; avg_ms: number; p95_ms: number; max_ms: number; server_errors: number; client_errors: number }[];
        series: { at: string; requests: number; errors: number; p95_ms: number | null }[];
    };
    health: {
        uptime_seconds: number; memory_mb: number; heap_used_mb: number; heap_total_mb: number;
        event_loop_lag_ms: number; node: string; started_at: string;
    };
    retention_days: number;
}

/** One country on the map, with everything shown on hover. */
export interface GeoCountry {
    country: string;
    visits: number;
    visitors: number;
    sessions: number;
    bounce_rate: number;
    share: number;
    avg_seconds: number;
    load_p75: number | null;
    lcp_p75: number | null;
    ttfb_p75: number | null;
    phone: number;
    tablet: number;
    desktop: number;
    search: number;
    social: number;
    campaign: number;
    seconds_since_last: number | null;
    top_page: string | null;
}

export interface GeoData {
    ready: boolean;
    range: { key: RangeKey; label: string };
    totals: { visits: number; visitors: number; countries: number; unplaced: number };
    countries: GeoCountry[];
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

/** The viewer's time zone: the server cuts days and hours in it. */
export const viewerZone = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch { return 'UTC'; }
})();

/**
 * A bucket from the API ("2026-11-15T09:00:00", the viewer's own wall-clock
 * time, no offset) on the axis of a chart.
 */
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
    internal: 'Inside the site',
};

export const CHANNEL_COLOR: Record<string, string> = {
    direct: '#4f46e5',
    search: '#0e9f6e',
    social: '#d946ef',
    referral: '#f59e0b',
    campaign: '#ef4444',
    internal: '#94a3b8',
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
