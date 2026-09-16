/* Batch insights — one calculation shared by the Performance, Students and export views. */
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { GRADE_BANDS, PASS_MARK, bandFor, gradeFromPercent } from '../../utils/grading';

export interface QuizAgg { quiz_id: number; quiz_title: string; submitted_count?: number; avg_percentage?: number | null; min_percentage?: number | null; max_percentage?: number | null; }
export interface BreakdownRow { quiz_id: number; quiz_title: string; total_score: number | string | null; max_score: number | string | null; percentage: number | string | null; submitted_at: string | null; }
export interface StudentRow { id: number; first_name: string; last_name: string; email: string; submitted_count?: number; avg_percentage?: number | null; breakdown: BreakdownRow[]; }
export interface BatchMeta { id: number; name: string; french_level: string; start_date: string; end_date: string; }
export interface InsightsData { batch: BatchMeta; kpis?: unknown; quizzes: QuizAgg[]; students: StudentRow[]; }

export interface Filters { studentIds: number[]; quizIds: number[]; range: [Dayjs, Dayjs] | null; passMark: number; }
export const DEFAULT_FILTERS: Filters = { studentIds: [], quizIds: [], range: null, passMark: PASS_MARK };

export interface Cell { student_id: number; quiz_id: number; pct: number | null; score: number | null; max: number | null; submitted_at: string; }
export interface QuizStat { quiz_id: number; title: string; order: number; submitted: number; expected: number; completion: number; avg: number | null; min: number | null; max: number | null; passRate: number | null; }
export interface StudentStat { id: number; name: string; email: string; submitted: number; expected: number; completion: number; avg: number | null; grade: string; passed: number; failed: number; points: number; maxPoints: number; last: string | null; rank: number | null; risk: boolean; }
export interface Takeaway { key: string; tone: 'good' | 'warn' | 'bad' | 'info'; title: string; text: string; }

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
export const studentName = (s: { first_name?: string; last_name?: string; email?: string }) => `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email || 'Student';
export const initialsOf = (name: string) => {
    const p = (name || '?').trim().split(/\s+/).filter(Boolean);
    return ((p[0]?.[0] || '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};
export const fmtPct = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${Math.round(v)}%`);
export const fmtNum = (v: number | null | undefined) => {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—';
    return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '');
};
export const pctOf = (b: BreakdownRow): number | null => {
    const sc = num(b.total_score);
    const mx = num(b.max_score);
    if (sc !== null && mx !== null && mx > 0) return (sc / mx) * 100;
    return num(b.percentage);
};
/** Heat / tone class for a percentage relative to the pass mark. */
export const toneOf = (p: number | null | undefined, pass: number) => {
    if (p === null || p === undefined) return 'is-none';
    if (p >= 85) return 'is-a';
    if (p >= 70) return 'is-b';
    if (p >= pass) return 'is-c';
    return 'is-f';
};

/** Weighted average (points / max points); falls back to the mean of percentages. */
const aggregate = (cells: Cell[]): number | null => {
    const withMax = cells.filter(c => c.score !== null && c.max !== null && (c.max as number) > 0);
    if (withMax.length) {
        const s = withMax.reduce((a, c) => a + (c.score as number), 0);
        const m = withMax.reduce((a, c) => a + (c.max as number), 0);
        return (s / m) * 100;
    }
    const ps = cells.map(c => c.pct).filter((p): p is number => p !== null);
    return ps.length ? ps.reduce((a, p) => a + p, 0) / ps.length : null;
};

export function computeView(data: InsightsData, f: Filters) {
    const pass = f.passMark;
    const quizzes = data.quizzes.filter(q => !f.quizIds.length || f.quizIds.includes(q.quiz_id));
    const quizIds = new Set(quizzes.map(q => q.quiz_id));
    const students = data.students.filter(s => !f.studentIds.length || f.studentIds.includes(s.id));
    const inRange = (iso: string) => !f.range || (!dayjs(iso).isBefore(f.range[0].startOf('day')) && !dayjs(iso).isAfter(f.range[1].endOf('day')));

    const cells: Cell[] = [];
    students.forEach(s => (s.breakdown || []).forEach(b => {
        if (!quizIds.has(b.quiz_id) || !b.submitted_at || !inRange(b.submitted_at)) return;
        cells.push({ student_id: s.id, quiz_id: b.quiz_id, pct: pctOf(b), score: num(b.total_score), max: num(b.max_score), submitted_at: b.submitted_at });
    }));
    const cellMap = new Map(cells.map(c => [`${c.student_id}:${c.quiz_id}`, c]));
    const scored = cells.filter(c => c.pct !== null) as (Cell & { pct: number })[];

    const expected = students.length * quizzes.length;
    const completion = expected ? (cells.length / expected) * 100 : 0;
    const avg = aggregate(cells);
    const passRate = scored.length ? (scored.filter(c => c.pct >= pass).length / scored.length) * 100 : null;

    const quizStats: QuizStat[] = quizzes.map((q, i) => {
        const cs = cells.filter(c => c.quiz_id === q.quiz_id);
        const ps = cs.map(c => c.pct).filter((p): p is number => p !== null);
        return {
            quiz_id: q.quiz_id,
            title: q.quiz_title,
            order: i + 1,
            submitted: cs.length,
            expected: students.length,
            completion: students.length ? (cs.length / students.length) * 100 : 0,
            avg: aggregate(cs),
            min: ps.length ? Math.min(...ps) : null,
            max: ps.length ? Math.max(...ps) : null,
            passRate: ps.length ? (ps.filter(p => p >= pass).length / ps.length) * 100 : null,
        };
    });

    const studentStats: StudentStat[] = students.map(s => {
        const cs = cells.filter(c => c.student_id === s.id);
        const a = aggregate(cs);
        const ps = cs.map(c => c.pct).filter((p): p is number => p !== null);
        const comp = quizzes.length ? (cs.length / quizzes.length) * 100 : 0;
        return {
            id: s.id,
            name: studentName(s),
            email: s.email,
            submitted: cs.length,
            expected: quizzes.length,
            completion: comp,
            avg: a,
            grade: a === null ? '—' : gradeFromPercent(a),
            passed: ps.filter(p => p >= pass).length,
            failed: ps.filter(p => p < pass).length,
            points: cs.reduce((t, c) => t + (c.score || 0), 0),
            maxPoints: cs.reduce((t, c) => t + (c.max || 0), 0),
            last: cs.reduce<string | null>((l, c) => (!l || c.submitted_at > l ? c.submitted_at : l), null),
            rank: null,
            risk: (a !== null && a < pass) || (quizzes.length > 0 && comp < 50),
        };
    });
    const ranked = studentStats.filter(s => s.avg !== null).sort((x, y) => (y.avg as number) - (x.avg as number));
    ranked.forEach((s, i) => { s.rank = i + 1; });
    const atRisk = studentStats.filter(s => s.risk).sort((x, y) => (x.avg ?? -1) - (y.avg ?? -1));

    const bands = GRADE_BANDS.map(b => ({ ...b, count: scored.filter(c => bandFor(c.pct).label === b.label).length }));

    // Cumulative submissions per day
    const perDay = new Map<string, number>();
    cells.forEach(c => { const d = dayjs(c.submitted_at).format('YYYY-MM-DD'); perDay.set(d, (perDay.get(d) || 0) + 1); });
    let running = 0;
    const timeline = Array.from(perDay.keys()).sort().map(day => { running += perDay.get(day) || 0; return { day, count: perDay.get(day) || 0, cum: running }; });

    /* ── Automatic takeaways ── */
    const takeaways: Takeaway[] = [];
    const withAvg = quizStats.filter(q => q.avg !== null);
    if (expected > 0 && completion < 70) {
        takeaways.push({ key: 'completion', tone: completion < 50 ? 'bad' : 'warn', title: `Completion is ${Math.round(completion)}%`, text: `${expected - cells.length} of ${expected} expected submissions are missing.` });
    }
    if (ranked[0]) takeaways.push({ key: 'top', tone: 'good', title: `${ranked[0].name} leads the class`, text: `${fmtPct(ranked[0].avg)} average over ${ranked[0].submitted} ${ranked[0].submitted === 1 ? 'quiz' : 'quizzes'}.` });
    if (atRisk.length) {
        takeaways.push({
            key: 'risk', tone: 'bad',
            title: `${atRisk.length} ${atRisk.length === 1 ? 'student needs' : 'students need'} support`,
            text: `${atRisk.slice(0, 3).map(s => s.name).join(', ')}${atRisk.length > 3 ? ` and ${atRisk.length - 3} more` : ''} — below ${pass}% or less than half the quizzes done.`,
        });
    }
    if (withAvg.length > 1) {
        const hardest = [...withAvg].sort((a, b) => (a.avg as number) - (b.avg as number))[0];
        const easiest = [...withAvg].sort((a, b) => (b.avg as number) - (a.avg as number))[0];
        takeaways.push({ key: 'hard', tone: (hardest.avg as number) < pass ? 'warn' : 'info', title: `Hardest quiz: ${hardest.title}`, text: `${fmtPct(hardest.avg)} average · ${fmtPct(hardest.passRate)} passed. Worth reviewing in class.` });
        takeaways.push({ key: 'easy', tone: 'good', title: `Strongest quiz: ${easiest.title}`, text: `${fmtPct(easiest.avg)} average · ${fmtPct(easiest.passRate)} passed.` });
        const half = Math.floor(withAvg.length / 2);
        const early = withAvg.slice(0, half);
        const recent = withAvg.slice(withAvg.length - half);
        const mean = (qs: QuizStat[]) => qs.reduce((s, q) => s + (q.avg as number), 0) / qs.length;
        if (half >= 1) {
            const diff = mean(recent) - mean(early);
            if (Math.abs(diff) >= 5) {
                takeaways.push({
                    key: 'trend', tone: diff > 0 ? 'good' : 'warn',
                    title: diff > 0 ? 'Scores are improving' : 'Scores are slipping',
                    text: `Recent quizzes average ${fmtPct(mean(recent))} vs ${fmtPct(mean(early))} for the earlier ones.`,
                });
            }
        }
    }
    const lowQuizzes = quizStats.filter(q => q.expected > 0 && q.completion < 50);
    if (lowQuizzes.length) {
        takeaways.push({ key: 'lowq', tone: 'info', title: `${lowQuizzes.length} ${lowQuizzes.length === 1 ? 'quiz has' : 'quizzes have'} under 50% completion`, text: lowQuizzes.slice(0, 3).map(q => q.title).join(', ') });
    }

    return { quizzes, students, cells, cellMap, expected, submitted: cells.length, completion, avg, passRate, quizStats, studentStats, ranked, atRisk, bands, timeline, takeaways, pass };
}

export type InsightsView = ReturnType<typeof computeView>;
