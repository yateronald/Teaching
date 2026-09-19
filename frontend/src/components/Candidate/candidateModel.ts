/* Exam space (exam candidates) — shared types, skill metadata and formatting. */

export type SkillKey = 'ce' | 'co' | 'ee' | 'eo';
export type ExamTarget = 'tcf_canada' | 'tcf_quebec' | 'tcf_tp';

export interface SkillMeta {
    key: SkillKey;
    english: string;
    french: string;
    short: string;
    max: number;
    unit: string;
    color: string;
    soft: string;
    line: string;
    format: string;
}

/** The four TCF skills, in exam order. Colours match the practice page. */
export const SKILLS: Record<SkillKey, SkillMeta> = {
    ce: { key: 'ce', english: 'Reading', french: 'Compréhension écrite', short: 'CE', max: 699, unit: 'pts', color: '#1d4ed8', soft: '#eff6ff', line: '#bfdbfe', format: '39 questions · 60 min' },
    co: { key: 'co', english: 'Listening', french: 'Compréhension orale', short: 'CO', max: 699, unit: 'pts', color: '#6d28d9', soft: '#f5f3ff', line: '#ddd6fe', format: '39 questions · 35 min' },
    ee: { key: 'ee', english: 'Writing', french: 'Expression écrite', short: 'EE', max: 20, unit: '/20', color: '#be123c', soft: '#fff1f2', line: '#fecdd3', format: '3 tasks · 60 min · AI correction' },
    eo: { key: 'eo', english: 'Speaking', french: 'Expression orale', short: 'EO', max: 20, unit: '/20', color: '#047857', soft: '#ecfdf5', line: '#a7f3d0', format: '3 tasks · 12 min · AI examiner' },
};
export const SKILL_ORDER: SkillKey[] = ['ce', 'co', 'ee', 'eo'];

export const EXAM_LABEL: Record<ExamTarget, string> = {
    tcf_canada: 'TCF Canada',
    tcf_quebec: 'TCF Québec',
    tcf_tp: 'TCF Tout public',
};
export const NCLC_OPTIONS = [4, 5, 6, 7, 8, 9, 10];
/** What each NCLC level usually unlocks, for candidates aiming at Canada. */
export const NCLC_NOTE: Record<number, string> = {
    4: 'Canadian citizenship (speaking and listening)',
    5: 'Canadian Experience Class for TEER 2–3 jobs, several provincial programmes',
    6: 'Required by some provincial nominee streams',
    7: 'Express Entry: Federal Skilled Worker minimum and French bonus points',
    8: 'A strong Express Entry language score',
    9: 'Top of the Federal Skilled Worker language grid',
    10: 'Highest Express Entry language points',
};

export interface Goal { target_exam: ExamTarget; target_nclc: number | null; exam_date: string | null }

export interface Attempt {
    skill: SkillKey;
    id: number;
    title: string | null;
    at: string;
    score: number | null;
    max: number;
    percent: number | null;
    cefr: string | null;
    nclc: number | null;
    detail: string | null;
    duration_seconds: number | null;
}

interface Point { score: number; max: number; cefr: string | null; nclc: number | null; at?: string }
export interface SkillSummary {
    skill: SkillKey;
    attempts: number;
    best: Point | null;
    latest: Point | null;
    estimate: (Point & { percent: number; based_on: number }) | null;
    last_at: string | null;
    trend: { at: string; percent: number; score: number }[];
}
export interface AccessItem { type: string; id: number; name: string; skill: SkillKey | null; expires_at: string | null; assigned_at: string | null; active: boolean }
export interface Overview {
    role: 'candidate' | 'student';
    goal: Goal | null;
    credits: { ee: number; eo: number } | null;
    skills: SkillSummary[];
    level: { nclc: number | null; skills_measured: number; below_4?: boolean; weakest: SkillKey | null };
    activity: { total: number; last_30_days: number; minutes: number; last_at: string | null };
    access: { active_items: number; next_end: string | null; items: AccessItem[] };
    recent: Attempt[];
}

/* ── Formatting ── */
const num = (v: number, digits = 1) => v.toLocaleString('en-GB', { maximumFractionDigits: digits });

export const scoreText = (score: number | null | undefined, max: number) =>
    score == null ? '—' : max === 699 ? `${Math.round(score)}` : num(score);
export const scoreUnit = (max: number) => (max === 699 ? '/ 699' : '/ 20');

const asDate = (iso: string) => new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);

export const dateText = (iso: string | null | undefined, withYear = true) => {
    if (!iso) return '—';
    const d = asDate(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
};

export const longDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    const d = asDate(iso);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

export const agoText = (iso: string | null | undefined) => {
    if (!iso) return 'never';
    const days = Math.floor((Date.now() - asDate(iso).getTime()) / 86_400_000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    return dateText(iso);
};

/** Whole days from today to a calendar date (negative when it has passed). */
export const daysUntil = (day: string | null | undefined) => {
    if (!day) return null;
    const target = asDate(day.slice(0, 10));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

/** Days left before an access end date (timestamp), rounded up. */
export const daysLeft = (iso: string | null | undefined) => {
    if (!iso) return null;
    return Math.ceil((asDate(iso).getTime() - Date.now()) / 86_400_000);
};

export const durationText = (seconds: number | null | undefined) => {
    if (!seconds || seconds <= 0) return '—';
    const m = Math.round(seconds / 60);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim();
};

export const minutesText = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60 ? `${minutes % 60} min` : ''}`.trim());

export const greeting = (d = new Date()) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 18 ? 'Good afternoon' : 'Good evening');

/** Reached / close / below a target level. */
export const toneFor = (nclc: number | null | undefined, target: number | null | undefined): 'good' | 'fair' | 'weak' | 'none' => {
    if (nclc == null) return 'none';
    if (!target) return nclc >= 7 ? 'good' : nclc >= 5 ? 'fair' : 'weak';
    if (nclc >= target) return 'good';
    return nclc >= target - 1 ? 'fair' : 'weak';
};

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
