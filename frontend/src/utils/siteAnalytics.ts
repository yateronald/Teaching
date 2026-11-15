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
 * The public site moves between its pages without reloading, so every page
 * shown is counted, not only the first one: the first page of the tab is the
 * entrance (it carries the referrer and the campaign tags, and the loading
 * figures), the next ones are marked as moves inside the site.
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

const observe = (type: string, cb: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}) => {
    try {
        const observer = new PerformanceObserver((list) => cb(list.getEntries()));
        observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        return observer;
    } catch { return null; }
};

// ── One page shown ─────────────────────────────────────────────────────────

interface View {
    id: string;
    path: string;
    /** The first page of the tab: the only one with loading figures and a referrer. */
    entrance: boolean;
    /** Time the page was actually on screen (a hidden tab does not count). */
    visibleMs: number;
    visibleSince: number | null;
    /** The slowest real interaction (stands in for INP). */
    inp?: number;
    /** Layout shift, in session windows as Core Web Vitals define it. */
    cls: number;
    shiftWindow: { value: number; first: number; last: number } | null;
    /** The last report sent, so an unchanged one is not sent twice. */
    lastReport?: string;
}

/** Loading figures of the real page load (the entrance only). */
const load: { ttfb?: number; fcp?: number; lcp?: number; load?: number } = {};

let current: View | null = null;
let views = 0;
let pendingLeave: number | null = null;
let listening = false;
let anonymous = false;

const now = () => Date.now();
const isVisible = () => {
    try { return document.visibilityState === 'visible'; } catch { return true; }
};

function dwell(view: View) {
    return view.visibleMs + (view.visibleSince !== null ? now() - view.visibleSince : 0);
}

/**
 * Sends what is known about a page view so far. Safe to repeat: the server
 * keeps the largest time on page and the first loading figures, so a later
 * report only ever completes an earlier one.
 */
function report(view: View) {
    const payload = {
        kind: 'vitals',
        id: view.id,
        dwell: Math.round(dwell(view)),
        inp: view.inp,
        cls: view.cls ? Math.round(view.cls * 1000) / 1000 : undefined,
        ...(view.entrance ? load : {}),
    };
    const key = JSON.stringify(payload);
    if (key === view.lastReport) return;
    view.lastReport = key;
    send(payload);
}

function close(view: View | null) {
    if (!view) return;
    if (view.visibleSince !== null) {
        view.visibleMs += now() - view.visibleSince;
        view.visibleSince = null;
    }
    report(view);
}

function listen() {
    if (listening) return;
    listening = true;

    try {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (nav) {
            if (nav.responseStart > 0) load.ttfb = Math.round(nav.responseStart);
            if (nav.loadEventEnd > 0) load.load = Math.round(nav.loadEventEnd);
        }
        window.addEventListener('load', () => {
            const done = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
            if (done?.loadEventEnd) load.load = Math.round(done.loadEventEnd);
        }, { once: true });
    } catch { /* ignore */ }

    observe('paint', (entries) => {
        const fcp = entries.find((e) => e.name === 'first-contentful-paint');
        if (fcp) load.fcp = Math.round(fcp.startTime);
    });

    // The browser stops reporting candidates at the first interaction, so the
    // last one seen is the page's largest paint.
    observe('largest-contentful-paint', (entries) => {
        const last = entries[entries.length - 1];
        if (last && views <= 1) load.lcp = Math.round(last.startTime);
    });

    // Shifts are grouped in windows (less than 1 s apart, 5 s at most); the
    // page's score is its worst window — the Core Web Vitals definition.
    observe('layout-shift', (entries) => {
        const view = current;
        if (!view) return;
        for (const entry of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (entry.hadRecentInput) continue;
            const w = view.shiftWindow;
            if (w && entry.startTime - w.last < 1000 && entry.startTime - w.first < 5000) {
                w.value += entry.value;
                w.last = entry.startTime;
            } else {
                view.shiftWindow = { value: entry.value, first: entry.startTime, last: entry.startTime };
            }
            view.cls = Math.max(view.cls, view.shiftWindow!.value);
        }
    });

    // Only real interactions (a tap, a click, a key) count, not every event.
    observe('event', (entries) => {
        const view = current;
        if (!view) return;
        for (const entry of entries as (PerformanceEntry & { duration: number; interactionId?: number })[]) {
            if (!entry.interactionId) continue;
            if (entry.duration > (view.inp ?? 0)) view.inp = Math.round(entry.duration);
        }
    }, { durationThreshold: 40 });

    // "hidden" is the only moment guaranteed to arrive on mobile: report then,
    // and start counting again if the visitor comes back to the tab.
    document.addEventListener('visibilitychange', () => {
        const view = current;
        if (!view) return;
        if (isVisible()) {
            if (view.visibleSince === null) view.visibleSince = now();
        } else {
            if (view.visibleSince !== null) {
                view.visibleMs += now() - view.visibleSince;
                view.visibleSince = null;
            }
            report(view);
        }
    });
    window.addEventListener('pagehide', () => close(current));
}

/**
 * What a page of the free courses is: the space, the kind of page and the
 * course (or game) it belongs to, with its title for the monitoring tables.
 */
export interface PageMeta {
    area?: 'learn';
    kind?: string;
    topic?: string;
    title?: string;
    category?: string;
}

/**
 * Counts one page of the public site. Call it each time a public page is
 * shown (on load and on every move inside the site); calling it again for
 * the page already counted does nothing.
 */
export function trackPageView(path?: string, lang?: string, meta?: PageMeta): void {
    if (typeof window === 'undefined') return;
    try {
        const where = path || window.location.pathname || '/';
        if (pendingLeave !== null) {
            window.clearTimeout(pendingLeave);
            pendingLeave = null;
            // The same page shown again at once (a re-render): still the same view.
            if (current && current.path === where) return;
            close(current);
            current = null;
        } else if (current) {
            if (current.path === where) return;
            close(current);
            current = null;
        }

        listen();
        if (views === 0) anonymous = optedOut();
        const entrance = views === 0;
        views += 1;
        const view: View = {
            id: newId(), path: where, entrance, visibleMs: 0, visibleSince: isVisible() ? now() : null, cls: 0, shiftWindow: null,
        };
        current = view;

        send({
            kind: 'page',
            id: view.id,
            path: where,
            lang: (lang || document.documentElement.lang || navigator.language || '').slice(0, 2).toLowerCase() || undefined,
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sw: window.screen?.width,
            dnt: anonymous || undefined,
            area: meta?.area,
            pkind: meta?.kind,
            topic: meta?.topic,
            ttl: meta?.title,
            cat: meta?.category,
            // Only the entrance says where the visitor came from; the next pages are moves inside the site.
            ...(entrance ? { ref: document.referrer || undefined, ...campaign() } : { nav: 'inside' }),
        });
    } catch { /* never break the page */ }
}

/**
 * The visitor left the public pages (or is moving to another one). The view
 * is closed a moment later, unless the same page is shown again at once.
 */
export function leavePage(): void {
    if (typeof window === 'undefined' || !current) return;
    try {
        if (pendingLeave !== null) window.clearTimeout(pendingLeave);
        pendingLeave = window.setTimeout(() => {
            pendingLeave = null;
            close(current);
            current = null;
        }, 0);
    } catch { /* ignore */ }
}

// ── What learners do in the free courses ───────────────────────────────────

export type LearningKind = 'lesson' | 'final' | 'game' | 'story' | 'placement' | 'course_test';

/** When each activity started, to tell how long it took (this page only). */
const startedAt = new Map<string, number>();

/**
 * Records a step of a learner in the free courses: an activity started, or
 * finished with its score (0 to 1). Tied to the page view it happened on, so
 * it carries no identifier of its own; nothing the learner types is sent.
 */
export function trackLearning(event: {
    kind: LearningKind;
    action: 'start' | 'finish';
    course?: string;
    item?: string;
    score?: number;
    passed?: boolean;
    title?: string;
    itemTitle?: string;
}): void {
    if (typeof window === 'undefined' || !current) return;
    try {
        const key = `${event.kind}|${event.course ?? ''}|${event.item ?? ''}`;
        let seconds: number | undefined;
        if (event.action === 'start') startedAt.set(key, now());
        else {
            const began = startedAt.get(key);
            if (began !== undefined) {
                seconds = Math.round((now() - began) / 1000);
                startedAt.delete(key);
            }
        }
        send({
            kind: 'learn',
            id: current.id,
            type: event.kind,
            action: event.action,
            course: event.course,
            item: event.item,
            score: typeof event.score === 'number' && Number.isFinite(event.score) ? Math.round(Math.max(0, Math.min(1, event.score)) * 100) : undefined,
            passed: typeof event.passed === 'boolean' ? event.passed : undefined,
            secs: seconds,
            ttl: event.title,
            ittl: event.itemTitle,
        });
    } catch { /* never break the lesson */ }
}
