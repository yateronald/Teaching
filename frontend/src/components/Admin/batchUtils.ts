/* Shared types + helpers for the admin batch screens. */

export type BatchStatus = 'upcoming' | 'running' | 'ended';
export type LocationMode = 'online' | 'physical';

export interface Batch {
    id: number;
    name: string;
    french_level: string;
    teacher_id: number;
    teacher_first_name?: string;
    teacher_last_name?: string;
    start_date: string;
    end_date: string;
    student_count: number | string;
    created_at: string;
    timezone?: string;
    default_location_mode?: string;
    default_location?: string;
    default_link?: string;
}

export interface Person {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface TimetableEntry {
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone?: string;
    location_mode?: string;
    location?: string | null;
    link?: string | null;
}

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const LEVEL_HINT: Record<string, string> = {
    A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper-intermediate', C1: 'Advanced', C2: 'Mastery',
};

/** Monday-first for display; day_of_week keeps the backend convention (0 = Sunday). */
export const WEEK = [
    { v: 1, short: 'Mon', long: 'Monday' },
    { v: 2, short: 'Tue', long: 'Tuesday' },
    { v: 3, short: 'Wed', long: 'Wednesday' },
    { v: 4, short: 'Thu', long: 'Thursday' },
    { v: 5, short: 'Fri', long: 'Friday' },
    { v: 6, short: 'Sat', long: 'Saturday' },
    { v: 0, short: 'Sun', long: 'Sunday' },
];
export const dayName = (d: number) => WEEK.find(w => w.v === d)?.long || '';
export const weekOrder = (d: number) => (d === 0 ? 7 : d);

export const levelTone = (level?: string) => `lv-${(level || '?')[0].toLowerCase()}`;
export const countOf = (b: Batch) => Number(b.student_count) || 0;

export const statusOf = (b: Batch, now = Date.now()): BatchStatus => {
    const s = new Date(b.start_date).getTime();
    const e = new Date(b.end_date).getTime();
    if (Number.isFinite(s) && now < s) return 'upcoming';
    if (Number.isFinite(e) && now > e) return 'ended';
    return 'running';
};
export const STATUS_LABEL: Record<BatchStatus, string> = { upcoming: 'Upcoming', running: 'Running', ended: 'Ended' };

/** Share of the batch period already elapsed (0–100). */
export const progressOf = (b: Batch, now = Date.now()) => {
    const s = new Date(b.start_date).getTime();
    const e = new Date(b.end_date).getTime();
    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) return 0;
    return Math.round(Math.min(1, Math.max(0, (now - s) / (e - s))) * 100);
};

export const daysBetween = (a: string | number | Date, b: string | number | Date) =>
    Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400_000);

export const durationText = (b: Batch) => {
    const d = daysBetween(b.start_date, b.end_date);
    if (!Number.isFinite(d) || d < 0) return '—';
    if (d < 14) return `${d} ${d === 1 ? 'day' : 'days'}`;
    if (d < 70) return `${Math.round(d / 7)} weeks`;
    return `${Math.round(d / 30)} months`;
};

export const personName = (p?: { first_name?: string; last_name?: string } | null) =>
    `${p?.first_name || ''} ${p?.last_name || ''}`.trim();
export const teacherOf = (b: Batch, teachers: Person[] = []) =>
    `${b.teacher_first_name || ''} ${b.teacher_last_name || ''}`.trim()
    || personName(teachers.find(t => t.id === b.teacher_id))
    || 'Unassigned';
export const initials = (name: string) => {
    const parts = (name || '?').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] || '')).toUpperCase();
};

export const hhmm = (t?: string | null) => (t || '').slice(0, 5);
export const minutesOf = (t: string) => {
    const [h, m] = hhmm(t).split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};
export const spanMinutes = (start: string, end: string) => Math.max(0, minutesOf(end) - minutesOf(start));
export const hoursText = (mins: number) => {
    if (!mins) return '0 h';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};

const FALLBACK_TZ = [
    'UTC', 'Africa/Abidjan', 'Africa/Casablanca', 'Africa/Lagos', 'America/New_York', 'America/Chicago', 'America/Denver',
    'America/Los_Angeles', 'America/Toronto', 'America/Vancouver', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris',
    'Europe/Berlin', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney',
];
let tzCache: string[] | null = null;
export const timezoneList = (): string[] => {
    if (tzCache) return tzCache;
    try {
        const list: string[] = (Intl as any).supportedValuesOf?.('timeZone') || [];
        tzCache = list.length ? (list.includes('UTC') ? list : ['UTC', ...list]) : FALLBACK_TZ;
    } catch {
        tzCache = FALLBACK_TZ;
    }
    return tzCache;
};
