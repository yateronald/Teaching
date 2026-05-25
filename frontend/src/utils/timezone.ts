/**
 * timezone.ts
 *
 * Frontend helpers for rendering scheduled timestamps in the user's timezone.
 *
 * The DB stores all scheduling timestamps as UTC (`timestamptz`). The user's
 * preferred timezone is stored on `users.timezone` (IANA id) and exposed via
 * AuthContext. Components should pass the user's timezone explicitly:
 *
 *   import { useAuth } from '../../contexts/AuthContext';
 *   import { formatLocal } from '../../utils/timezone';
 *
 *   const { user } = useAuth();
 *   <span>{formatLocal(quiz.start_date, user?.timezone)}</span>
 */

/** When the user hasn't picked a timezone in their profile, fall back to
 *  the browser's detected zone — that's what the picker uses, so display
 *  matches what the user typed. Final fallback if Intl can't resolve: UTC. */
function browserTz(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

function effectiveTz(tz?: string | null): string {
    // 'UTC' from a stale profile default still falls through to the browser
    // zone — the platform's intent is "show me times in MY local zone".
    if (!tz || tz === 'UTC') return browserTz();
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz }).format();
        return tz;
    } catch {
        return browserTz();
    }
}

function getTimezoneAbbr(tz: string, date: Date): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, timeZoneName: 'shortOffset',
        }).formatToParts(date);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        return tzPart ? tzPart.value : tz;
    } catch {
        return tz;
    }
}

/**
 * Format an absolute timestamp in the given timezone.
 * Default output: "Sun, May 25, 2026, 5:00 PM · GMT-4"
 */
export function formatLocal(
    iso: string | Date | number | null | undefined,
    timezone?: string | null,
    options: Intl.DateTimeFormatOptions = {},
): string {
    if (iso === null || iso === undefined || iso === '') return '';
    const tz = effectiveTz(timezone);
    const d = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(d.getTime())) return '';
    const opts: Intl.DateTimeFormatOptions = {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
        timeZone: tz,
        ...options,
    };
    const formatted = new Intl.DateTimeFormat('en-US', opts).format(d);
    if (opts.timeZoneName) return formatted;
    return `${formatted} · ${getTimezoneAbbr(tz, d)}`;
}

/** "Sunday, May 25, 2026" */
export function formatDateLocal(iso: string | Date, timezone?: string | null): string {
    return formatLocal(iso, timezone, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: undefined, minute: undefined, hour12: undefined,
    });
}

/** "5:00 PM GMT-4" */
export function formatTimeLocal(iso: string | Date, timezone?: string | null): string {
    if (!iso) return '';
    const tz = effectiveTz(timezone);
    const d = iso instanceof Date ? iso : new Date(iso);
    if (isNaN(d.getTime())) return '';
    const time = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz,
    }).format(d);
    return `${time} ${getTimezoneAbbr(tz, d)}`;
}

/** Detect the browser's timezone — useful as a default for new users. */
export function detectBrowserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
}

export interface TimezoneOption { value: string; label: string }
export interface TimezoneGroup { label: string; zones: TimezoneOption[] }
