/**
 * The public website's measurement beacon.
 *
 * What leaves the visitor's browser: the page they opened, the referring site,
 * any utm_* tags on the link, their language, screen width, time zone (which
 * is how the country is worked out — no IP lookup anywhere), and how the page
 * performed. That is all. There is no cookie, no browser storage, no id that
 * survives the page, and nothing a visitor types is ever read.
 *
 * A visitor with Do Not Track or Global Privacy Control on is still counted,
 * but with no identifier at all.
 *
 * Nothing here may affect the page: every call is wrapped, failures are
 * swallowed, and the beacon is sent in the background.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ENDPOINT = `${API_BASE}/site/collect`;

/** text/plain keeps this a simple request — no preflight, so it survives page unload. */
const TYPE = 'text/plain;charset=UTF-8';

const newId = () =>
    (crypto.randomUUID?.() ??
        '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
            (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)));

function send(payload: Record<string, unknown>) {
    try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: TYPE }))) return;
        void fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': TYPE }, keepalive: true, mode: 'cors' })
            .catch(() => { /* measurement never matters more than the page */ });
    } catch { /* ignore */ }
}

const optedOut = () => {
    try {
        const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
        return nav.doNotTrack === '1' || nav.globalPrivacyControl === true || nav.msDoNotTrack === '1';
    } catch { return false; }
};

/** Only the three campaign tags are read from the URL; the rest is ignored. */
function campaign(): Record<string, string> {
    const out: Record<string, string> = {};
    try {
        const params = new URLSearchParams(window.location.search);
        for (const key of ['utm_source', 'utm_medium', 'utm_campaign'] as const) {
            const value = params.get(key);
            if (value) out[key] = value.slice(0, 60);
        }
    } catch { /* ignore */ }
    return out;
}

// ── How the page performed ─────────────────────────────────────────────────

type Vitals = { lcp?: number; cls?: number; inp?: number; fcp?: number; ttfb?: number; load?: number };

const observe = (type: string, cb: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}) => {
    try {
        const observer = new PerformanceObserver((list) => cb(list.getEntries()));
        observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        return observer;
    } catch { return null; }
};

function watchVitals(): () => Vitals {
    const vitals: Vitals = {};

    try {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (nav) {
            if (nav.responseStart > 0) vitals.ttfb = Math.round(nav.responseStart);
            if (nav.loadEventEnd > 0) vitals.load = Math.round(nav.loadEventEnd);
        }
        window.addEventListener('load', () => {
            const done = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
            if (done?.loadEventEnd) vitals.load = Math.round(done.loadEventEnd);
        }, { once: true });
    } catch { /* ignore */ }

    observe('paint', (entries) => {
        const fcp = entries.find((e) => e.name === 'first-contentful-paint');
        if (fcp) vitals.fcp = Math.round(fcp.startTime);
    });

    observe('largest-contentful-paint', (entries) => {
        const last = entries[entries.length - 1];
        if (last) vitals.lcp = Math.round(last.startTime);
    });

    observe('layout-shift', (entries) => {
        for (const entry of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) vitals.cls = Math.round(((vitals.cls ?? 0) + entry.value) * 1000) / 1000;
        }
    });

    // The slowest interaction on the page stands in for INP.
    observe('event', (entries) => {
        for (const entry of entries as (PerformanceEntry & { duration: number })[]) {
            if (entry.duration > (vitals.inp ?? 0)) vitals.inp = Math.round(entry.duration);
        }
    }, { durationThreshold: 40 });

    return () => vitals;
}

// ── The page view ──────────────────────────────────────────────────────────

let started = false;

/**
 * Counts one page view of the public site and, once the visitor leaves the
 * page, sends how it performed for them. Safe to call more than once; only
 * the first call on a page counts.
 */
export function trackPageView(): void {
    if (started || typeof window === 'undefined') return;
    started = true;

    try {
        const id = newId();
        const openedAt = Date.now();
        const anonymous = optedOut();

        send({
            kind: 'page',
            id,
            path: window.location.pathname || '/',
            lang: (document.documentElement.lang || navigator.language || '').slice(0, 2).toLowerCase() || undefined,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            ref: document.referrer || undefined,
            sw: window.screen?.width,
            dnt: anonymous || undefined,
            ...campaign(),
        });

        const read = watchVitals();
        let closed = false;
        const finish = () => {
            if (closed) return;
            closed = true;
            send({ kind: 'vitals', id, ...read(), dwell: Date.now() - openedAt });
        };

        // "hidden" is the only moment guaranteed to arrive on mobile.
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') finish(); });
        window.addEventListener('pagehide', finish);
    } catch { /* never break the page */ }
}
