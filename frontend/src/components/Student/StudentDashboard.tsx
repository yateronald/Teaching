import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, Input, Form, Segmented, Skeleton, Empty, Alert, ConfigProvider, Tooltip, message } from 'antd';
import {
    CalendarOutlined, PlayCircleOutlined, RightOutlined, VideoCameraOutlined, EnvironmentOutlined,
    UserOutlined, TeamOutlined, CheckCircleOutlined, FileTextOutlined, ClockCircleOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone } from '../../utils/timezone';
import { PASS_MARK, gradeFromPercent, toneFor } from '../../utils/grading';
import './StudentDashboard.css';

/* ── API shapes (numeric columns can arrive as strings from Postgres) ── */
interface ApiQuiz {
    id: number; title: string; status?: string | null;
    total_questions?: number | string | null; duration_minutes?: number | string | null;
    start_date?: string | null; end_date?: string | null; batch_names?: string | null;
    /** 'completed' (submitted / auto-submitted / graded), 'in_progress' or 'not_started'. */
    submission_status?: string | null;
}
interface ApiSchedule {
    id: number; title: string; batch_name?: string | null; type?: string | null;
    start_time: string; end_time?: string | null;
    teacher_first_name?: string | null; teacher_last_name?: string | null;
    location_mode?: string | null; location?: string | null; link?: string | null;
}
interface ApiResult {
    id: number; quiz_title: string; score: unknown; max_score: unknown; percentage: unknown;
    submitted_at: string | null; results_locked?: boolean;
}
interface ApiBatch {
    id?: number; batch_id?: number; name?: string; batch_name?: string; french_level?: string | null;
    start_date?: string | null; end_date?: string | null;
    teacher_first_name?: string | null; teacher_last_name?: string | null; teacher_name?: string | null;
}

type QuizState = 'completed' | 'in_progress' | 'open' | 'upcoming' | 'missed';
type BatchStatus = 'active' | 'upcoming' | 'completed';

interface QuizItem {
    id: number; title: string; batches: string | null;
    questions: number | null; minutes: number | null;
    start: number | null; end: number | null; state: QuizState;
}
interface ResultItem { key: string; title: string; pct: number; score: number; max: number; at: string | null; }
interface Batch { id: number; name: string; level: string | null; teacher: string | null; start: string | null; end: string | null; }

interface NextEntry {
    key: string; kind: 'quiz' | 'class'; at: number; open: boolean;
    title: string; meta: string[];
    action?: { label: string; onClick: () => void };
    to?: string;
}

/* ── Helpers ── */
const DAY_MS = 86_400_000;
const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};
const toTime = (v?: string | null) => {
    if (!v) return null;
    const t = new Date(v).getTime();
    return Number.isFinite(t) ? t : null;
};
const PCT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const fmtPct = (v: number | null) => (v == null ? '—' : `${PCT.format(v)}%`);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const relative = (ms: number) => {
    const min = Math.round(ms / 60_000);
    if (min < 60) return `${Math.max(1, min)} min`;
    const h = Math.round(min / 60);
    if (h < 48) return `${h} h`;
    return `${Math.round(h / 24)} days`;
};

const classifyQuiz = (q: ApiQuiz, now: number): QuizState => {
    if (q.submission_status === 'completed') return 'completed';
    const start = toTime(q.start_date), end = toTime(q.end_date);
    if (start != null && start > now) return 'upcoming';
    if (end != null && end <= now) return 'missed';
    return q.submission_status === 'in_progress' ? 'in_progress' : 'open';
};

const normalizeResults = (raw: ApiResult[]): ResultItem[] => {
    const seen = new Set<string>();
    const out: ResultItem[] = [];
    for (const r of raw) {
        const key = String(r.id);
        // One row per batch for shared quizzes → keep the submission once; locked results have no score yet.
        if (seen.has(key) || r.results_locked) continue;
        const pct = toNum(r.percentage);
        if (pct == null) continue;
        seen.add(key);
        out.push({ key, title: r.quiz_title || 'Untitled quiz', pct, score: toNum(r.score) ?? 0, max: toNum(r.max_score) ?? 0, at: r.submitted_at });
    }
    return out;
};

const normalizeBatches = (raw: ApiBatch[]): Batch[] => raw.map(b => ({
    id: b.id ?? b.batch_id ?? 0,
    name: b.name ?? b.batch_name ?? 'Unnamed batch',
    level: b.french_level ?? null,
    teacher: [b.teacher_first_name, b.teacher_last_name].filter(Boolean).join(' ') || b.teacher_name || null,
    start: b.start_date ?? null,
    end: b.end_date ?? null,
}));

const batchStatus = (b: Batch, now: number): BatchStatus => {
    const start = toTime(b.start), end = toTime(b.end);
    if (start != null && now < start) return 'upcoming';
    if (end != null && now > end + DAY_MS) return 'completed';
    return 'active';
};

/* ── Small presentational pieces ── */
const GradeBadge = ({ pct }: { pct: number }) => (
    <span className={`sd-grade sd-tone-${toneFor(pct)}`}>{gradeFromPercent(pct)}</span>
);

const Ring = ({ pct }: { pct: number | null }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const value = Math.min(100, Math.max(0, pct ?? 0));
    return (
        <div className="sd-ring">
            <svg viewBox="0 0 92 92" aria-hidden>
                <circle cx="46" cy="46" r={radius} className="sd-ring-track" />
                <circle cx="46" cy="46" r={radius} className="sd-ring-fill"
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
            </svg>
            <div className="sd-ring-value">
                <strong>{pct != null ? `${Math.round(pct)}%` : '—'}</strong>
                <span>average</span>
            </div>
        </div>
    );
};

const StatTile: React.FC<{
    icon: React.ReactNode; label: string; value: React.ReactNode; note?: React.ReactNode; onClick?: () => void;
}> = ({ icon, label, value, note, onClick }) => {
    const body = (
        <>
            <div className="sd-tile-icon">{icon}</div>
            <div className="sd-tile-body">
                <div className="sd-tile-label">{label}</div>
                <div className="sd-tile-value">{value}</div>
                {note && <div className="sd-tile-note">{note}</div>}
            </div>
            {onClick && <RightOutlined className="sd-tile-chevron" />}
        </>
    );
    return onClick
        ? <button type="button" className="sd-tile is-link" onClick={onClick}>{body}</button>
        : <div className="sd-tile">{body}</div>;
};

interface TrendPoint { key: string; label: string; date: string; pct: number; }

/** Score trend with a pass-mark line; sized to its container. */
const TrendChart: React.FC<{ points: TrendPoint[] }> = ({ points }) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [active, setActive] = useState<number | null>(null);

    useLayoutEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        setWidth(el.clientWidth);
        const ro = new ResizeObserver(entries => setWidth(entries[0].contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const H = 200, L = 34, R = 8, T = 12, B = 22;
    const innerW = Math.max(0, width - L - R);
    const innerH = H - T - B;
    const xAt = (i: number) => L + (points.length > 1 ? (i * innerW) / (points.length - 1) : innerW / 2);
    const yAt = (pct: number) => T + innerH * (1 - Math.min(100, Math.max(0, pct)) / 100);
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)} ${yAt(p.pct).toFixed(1)}`).join(' ');
    const area = `${line} L${xAt(points.length - 1).toFixed(1)} ${T + innerH} L${xAt(0).toFixed(1)} ${T + innerH} Z`;

    const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rel = e.clientX - e.currentTarget.getBoundingClientRect().left - L;
        const idx = points.length > 1 ? Math.round((rel / innerW) * (points.length - 1)) : 0;
        setActive(Math.min(points.length - 1, Math.max(0, idx)));
    };
    const tip = active != null ? points[active] : null;
    const tipLeft = active != null ? Math.min(Math.max(xAt(active), 90), width - 90) : 0;

    return (
        <div className="sd-trend" ref={wrapRef}>
            {width > 0 && (
                <svg width={width} height={H} onMouseMove={onMove} onMouseLeave={() => setActive(null)}
                    role="img" aria-label={`Scores of your last ${points.length} graded quizzes`}>
                    {[0, PASS_MARK, 100].map(v => (
                        <g key={v}>
                            <line x1={L} x2={width - R} y1={yAt(v)} y2={yAt(v)} className={v === PASS_MARK ? 'sd-trend-pass' : 'sd-trend-grid'} />
                            <text x={L - 8} y={yAt(v)} dy="0.32em" textAnchor="end" className="sd-trend-axis">{v}%</text>
                        </g>
                    ))}
                    <path d={area} className="sd-trend-area" />
                    <path d={line} className="sd-trend-line" />
                    {active != null && <line x1={xAt(active)} x2={xAt(active)} y1={T} y2={T + innerH} className="sd-trend-guide" />}
                    {points.map((p, i) => (
                        <circle key={p.key} cx={xAt(i)} cy={yAt(p.pct)} r={i === active ? 4.5 : 3}
                            className={`sd-trend-dot${p.pct < PASS_MARK ? ' is-fail' : ''}${i === active ? ' is-active' : ''}`} />
                    ))}
                    <text x={xAt(0)} y={H - 4} textAnchor="start" className="sd-trend-axis">{points[0]?.date}</text>
                    {points.length > 1 && (
                        <text x={xAt(points.length - 1)} y={H - 4} textAnchor="end" className="sd-trend-axis">{points[points.length - 1].date}</text>
                    )}
                </svg>
            )}
            {tip && (
                <div className="sd-trend-tip" style={{ left: tipLeft }}>
                    <strong>{tip.label}</strong>
                    <span>{fmtPct(tip.pct)} · {tip.date}</span>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const StudentDashboard: React.FC = () => {
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();
    const r = useResponsive();
    const zone = resolveTimezone(user?.timezone);

    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
    const [results, setResults] = useState<ResultItem[]>([]);
    const [schedules, setSchedules] = useState<ApiSchedule[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [now, setNow] = useState(() => Date.now());
    const [resultsView, setResultsView] = useState<'recent' | 'best'>('recent');

    const [batchesOpen, setBatchesOpen] = useState(false);
    const [batchSearch, setBatchSearch] = useState('');
    const [batchFilter, setBatchFilter] = useState<'all' | BatchStatus>('all');

    const [joinTarget, setJoinTarget] = useState<ApiSchedule | null>(null);
    const [sessionStatus, setSessionStatus] = useState<any>(null);
    const [joining, setJoining] = useState(false);
    const [form] = Form.useForm();

    // Keep "open now", "closes in…" and Join buttons current without reloading.
    useEffect(() => {
        const t = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(t);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setFailed(false);
        const settled = await Promise.allSettled([
            apiCall('/quizzes'),
            apiCall('/quizzes/student/results'),
            apiCall('/schedules/upcoming/me?limit=20'),
            apiCall('/batches/student/my-batches'),
        ]);
        const [qData, rData, sData, bData] = await Promise.all(settled.map(s =>
            s.status === 'fulfilled' && s.value.ok ? s.value.json().catch(() => null) : Promise.resolve(null)));
        if (!qData && !rData && !sData && !bData) setFailed(true);
        setQuizzes(Array.isArray(qData) ? qData : qData?.quizzes ?? []);
        setResults(normalizeResults(rData?.results ?? []));
        setSchedules(Array.isArray(sData) ? sData : sData?.schedules ?? []);
        setBatches(normalizeBatches(Array.isArray(bData) ? bData : bData?.batches ?? []));
        setNow(Date.now());
        setLoading(false);
    }, [apiCall]);

    useEffect(() => { fetchData(); }, [fetchData]);

    /* ── Dates in the student's timezone ── */
    const fmt = useMemo(() => {
        const make = (opts: Intl.DateTimeFormatOptions, locale = 'en-US') => {
            const f = new Intl.DateTimeFormat(locale, { timeZone: zone, ...opts });
            return (v: number | string | null | undefined) => {
                if (v == null) return '';
                const d = new Date(v);
                return isNaN(d.getTime()) ? '' : f.format(d);
            };
        };
        return {
            date: make({ month: 'short', day: 'numeric', year: 'numeric' }),
            short: make({ month: 'short', day: 'numeric' }),
            day: make({ weekday: 'short', month: 'short', day: 'numeric' }),
            weekday: make({ weekday: 'short' }),
            dayNum: make({ day: 'numeric' }),
            time: make({ hour: '2-digit', minute: '2-digit', hour12: false }, 'en-GB'),
            today: make({ weekday: 'long', month: 'long', day: 'numeric' }),
            hour: make({ hour: 'numeric', hour12: false }, 'en-GB'),
        };
    }, [zone]);

    /* ── Quizzes ── */
    const quizItems = useMemo<QuizItem[]>(() => quizzes
        .filter(q => (q.status ?? 'published').toLowerCase() === 'published')
        .map(q => ({
            id: q.id,
            title: q.title || 'Untitled quiz',
            batches: q.batch_names || null,
            questions: toNum(q.total_questions),
            minutes: toNum(q.duration_minutes),
            start: toTime(q.start_date),
            end: toTime(q.end_date),
            state: classifyQuiz(q, now),
        })), [quizzes, now]);

    const quizCounts = useMemo(() => {
        const c = { completed: 0, open: 0, upcoming: 0, missed: 0 };
        quizItems.forEach(q => {
            if (q.state === 'completed') c.completed++;
            else if (q.state === 'open' || q.state === 'in_progress') c.open++;
            else if (q.state === 'upcoming') c.upcoming++;
            else c.missed++;
        });
        return c;
    }, [quizItems]);

    /* ── Results ── */
    const perf = useMemo(() => {
        let pts = 0, max = 0, passed = 0;
        results.forEach(x => { pts += x.score; max += x.max; if (x.pct >= PASS_MARK) passed++; });
        const byDate = results.slice().sort((a, b) => (a.at ?? '').localeCompare(b.at ?? ''));
        return {
            graded: results.length,
            passed,
            average: max > 0 ? (pts / max) * 100 : null,
            recent: byDate.slice().reverse().slice(0, 5),
            best: results.slice().sort((a, b) => b.pct - a.pct).slice(0, 5),
            trend: byDate.slice(-12),
        };
    }, [results]);

    const trendPoints = useMemo<TrendPoint[]>(
        () => perf.trend.map(x => ({ key: x.key, label: x.title, date: fmt.short(x.at), pct: x.pct })),
        [perf.trend, fmt],
    );

    /* ── Classes ── */
    const classes = useMemo(() => schedules
        .map(s => ({ ...s, startMs: toTime(s.start_time) ?? 0 }))
        // Keep classes that started up to 30 min ago: they can still be joined.
        .filter(s => s.startMs > now - 30 * 60_000)
        .sort((a, b) => a.startMs - b.startMs), [schedules, now]);
    const nextClass = classes.find(c => c.startMs > now) ?? null;

    /* ── Join a class (attendance access code) ── */
    const openJoin = async (schedule: ApiSchedule) => {
        try {
            const res = await apiCall(`/attendance/sessions/${schedule.id}/status`);
            const status = res.ok ? await res.json() : null;
            setSessionStatus(status);
            if (status?.alreadyJoined && schedule.link) {
                message.success('Already joined — opening the class link');
                window.open(schedule.link, '_blank', 'noopener');
                return;
            }
            if (status?.canJoin) { setJoinTarget(schedule); form.resetFields(); return; }
            message.info(status?.reason || 'Your teacher has not started the class yet');
        } catch {
            message.error('Could not check the class status');
        }
    };

    const submitAccessCode = async ({ accessCode }: { accessCode: string }) => {
        if (!joinTarget) return;
        setJoining(true);
        try {
            let sessionId: number | null = sessionStatus?.canJoin && sessionStatus?.sessionId ? sessionStatus.sessionId : null;
            if (!sessionId) {
                const res = await apiCall(`/attendance/sessions?schedule_id=${joinTarget.id}`);
                if (!res.ok) throw new Error('Failed to fetch sessions');
                const sessions: any[] = (await res.json()).sessions || [];
                const match = sessions.find(s => Number(s.schedule_id) === Number(joinTarget.id) && (s.status === 'in_progress' || s.status === 'started'))
                    || sessions.find(s => Number(s.schedule_id) === Number(joinTarget.id));
                sessionId = match?.id ?? null;
            }
            if (!sessionId) throw new Error('No active session found');
            const res = await apiCall(`/attendance/sessions/${sessionId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Invalid or expired access code');
            }
            const body = await res.json();
            message.success(`Joined — attendance marked as ${body.status}`);
            if (joinTarget.link) window.open(joinTarget.link, '_blank', 'noopener');
            setJoinTarget(null);
        } catch (e: any) {
            message.error(e?.message || 'Failed to join the class');
        } finally {
            setJoining(false);
        }
    };

    /* ── "Up next": open quizzes first (closing soonest), then upcoming quizzes and classes ── */
    const upNext = useMemo<NextEntry[]>(() => {
        const openQuizzes: NextEntry[] = quizItems
            .filter(q => q.state === 'open' || q.state === 'in_progress')
            .sort((a, b) => (a.end ?? Infinity) - (b.end ?? Infinity))
            .map(q => ({
                key: `q-${q.id}`, kind: 'quiz', at: q.end ?? now, open: true, title: q.title,
                meta: [
                    q.end ? `Closes in ${relative(q.end - now)}` : 'No deadline',
                    [q.questions != null ? plural(q.questions, 'question') : null, q.minutes ? `${q.minutes} min` : null].filter(Boolean).join(' · '),
                ].filter(Boolean),
                action: { label: q.state === 'in_progress' ? 'Continue' : 'Start', onClick: () => navigate(`/app/my-quizzes?focus=${q.id}`) },
            }));

        const later: NextEntry[] = [
            ...quizItems.filter(q => q.state === 'upcoming' && q.start != null).map(q => ({
                key: `q-${q.id}`, kind: 'quiz' as const, at: q.start as number, open: false, title: q.title,
                meta: [`Opens ${fmt.time(q.start)}`, q.batches ?? ''].filter(Boolean),
                to: `/app/my-quizzes?focus=${q.id}`,
            })),
            ...classes.map(c => {
                const minutesToStart = (c.startMs - now) / 60_000;
                const online = c.location_mode === 'online';
                const canJoin = online && !!c.link && minutesToStart <= 5 && minutesToStart >= -30;
                const teacher = [c.teacher_first_name, c.teacher_last_name].filter(Boolean).join(' ');
                return {
                    key: `c-${c.id}`, kind: 'class' as const, at: c.startMs, open: canJoin, title: c.title,
                    meta: [
                        `${fmt.time(c.start_time)}${c.end_time ? `–${fmt.time(c.end_time)}` : ''}`,
                        online ? 'Online' : (c.location || 'On site'),
                        teacher,
                    ].filter(Boolean),
                    action: canJoin ? { label: 'Join', onClick: () => openJoin(c) } : undefined,
                    to: canJoin ? undefined : '/app/my-schedule',
                };
            }),
        ].sort((a, b) => a.at - b.at);

        return [...openQuizzes, ...later].slice(0, 5);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizItems, classes, now, fmt]);

    /* ── Batches ── */
    const sortedBatches = useMemo(() => {
        const rank: Record<BatchStatus, number> = { active: 0, upcoming: 1, completed: 2 };
        return batches.slice().sort((a, b) =>
            rank[batchStatus(a, now)] - rank[batchStatus(b, now)] || (toTime(a.start) ?? 0) - (toTime(b.start) ?? 0));
    }, [batches, now]);
    const activeBatches = sortedBatches.filter(b => batchStatus(b, now) === 'active').length;
    const modalBatches = sortedBatches.filter(b => {
        if (batchFilter !== 'all' && batchStatus(b, now) !== batchFilter) return false;
        const q = batchSearch.trim().toLowerCase();
        return !q || [b.name, b.level, b.teacher].filter(Boolean).join(' ').toLowerCase().includes(q);
    });

    const renderBatch = (b: Batch) => {
        const status = batchStatus(b, now);
        const start = toTime(b.start), end = toTime(b.end);
        const progress = start != null && end != null && end > start
            ? Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
            : status === 'completed' ? 100 : 0;
        const daysLeft = end != null ? Math.ceil((end - now) / DAY_MS) : null;
        const note = status === 'upcoming' ? `Starts ${fmt.date(b.start)}`
            : status === 'completed' ? `Ended ${fmt.date(b.end)}`
            : daysLeft != null ? `${plural(Math.max(0, daysLeft), 'day')} left` : 'In progress';
        return (
            <li key={b.id} className={`sd-batch is-${status}`}>
                <div className="sd-batch-top">
                    <span className="sd-batch-name">{b.name}</span>
                    {b.level && <span className="sd-level">{b.level}</span>}
                    <span className={`sd-status is-${status}`}>{status}</span>
                </div>
                <div className="sd-batch-meta">
                    {b.teacher && <span><UserOutlined /> {b.teacher}</span>}
                    {(b.start || b.end) && <span><CalendarOutlined /> {fmt.short(b.start)} – {fmt.date(b.end)}</span>}
                </div>
                <div className="sd-batch-progress">
                    <span className="sd-batch-track"><span style={{ width: `${progress}%` }} /></span>
                    <span className="sd-batch-note">{note}</span>
                </div>
            </li>
        );
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading) return (
        <div className="sd" aria-busy="true">
            <div className="sd-header">
                <div>
                    <Skeleton.Input active size="small" style={{ width: 160, height: 12 }} />
                    <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 280, height: 26 }} /></div>
                </div>
            </div>
            <div className="sd-overview sd-overview-loading"><Skeleton active avatar={{ size: 76 }} title={false} paragraph={{ rows: 3 }} /></div>
            <div className="sd-grid">
                <div className="sd-col">
                    <div className="sd-card sd-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>
                    <div className="sd-card sd-pad"><Skeleton active paragraph={{ rows: 5 }} /></div>
                </div>
                <div className="sd-col">
                    <div className="sd-card sd-pad"><Skeleton active paragraph={{ rows: 5 }} /></div>
                    <div className="sd-card sd-pad"><Skeleton active paragraph={{ rows: 3 }} /></div>
                </div>
            </div>
        </div>
    );

    /* ═══════════ RENDER ═══════════ */
    const firstName = user?.first_name || 'there';
    const hour = Number(fmt.hour(now));
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const summary = [
        quizCounts.open > 0 ? `${plural(quizCounts.open, 'quiz', 'quizzes')} open now` : null,
        nextClass ? `next class ${fmt.day(nextClass.start_time)} at ${fmt.time(nextClass.start_time)}` : null,
    ].filter(Boolean).join(' · ') || 'You are all caught up';
    const averageTone = perf.average != null ? ` sd-tone-${toneFor(perf.average)}` : '';
    const passRate = perf.graded ? Math.round((perf.passed / perf.graded) * 100) : null;
    const statusTotal = quizCounts.completed + quizCounts.open + quizCounts.upcoming + quizCounts.missed;
    const statusSegments = [
        { key: 'completed', label: 'Completed', value: quizCounts.completed },
        { key: 'open', label: 'Open now', value: quizCounts.open },
        { key: 'upcoming', label: 'Upcoming', value: quizCounts.upcoming },
        { key: 'missed', label: 'Missed', value: quizCounts.missed },
    ];
    const resultList = resultsView === 'recent' ? perf.recent : perf.best;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13 } }}>
            <div className="sd">

                {/* ── Greeting ── */}
                <header className="sd-header">
                    <div>
                        <div className="sd-overline">{fmt.today(now)}</div>
                        <h1 className="sd-title">{greeting}, {firstName}</h1>
                        <p className="sd-subtitle">{summary.charAt(0).toUpperCase() + summary.slice(1)}</p>
                    </div>
                    <div className="sd-header-actions">
                        <Button icon={<CalendarOutlined />} onClick={() => navigate('/app/my-schedule')}>Schedule</Button>
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => navigate('/app/my-quizzes')}>
                            {quizCounts.open > 0 ? `Open quizzes (${quizCounts.open})` : 'My quizzes'}
                        </Button>
                    </div>
                </header>

                {failed && (
                    <Alert type="error" showIcon message="Couldn't load your dashboard"
                        description="Check your connection and try again."
                        action={<Button size="small" onClick={fetchData}>Retry</Button>} />
                )}

                {/* ── Overview ── */}
                <section className="sd-overview" aria-label="Overview">
                    <div className={`sd-hero${averageTone}`}>
                        <Ring pct={perf.average} />
                        <div className="sd-hero-text">
                            <div className="sd-hero-label">Average score</div>
                            <div className="sd-hero-grade">
                                {perf.average != null ? <>Grade <GradeBadge pct={perf.average} /></> : 'No grades yet'}
                            </div>
                        </div>
                    </div>
                    <div className="sd-tiles">
                        <StatTile
                            icon={<PlayCircleOutlined />}
                            label="Open now"
                            value={quizCounts.open}
                            note={quizCounts.open ? 'Quizzes you can take today' : 'Nothing open right now'}
                            onClick={quizCounts.open ? () => navigate('/app/my-quizzes') : undefined}
                        />
                        <StatTile
                            icon={<CheckCircleOutlined />}
                            label="Completed"
                            value={quizCounts.completed}
                            note={passRate != null ? `${passRate}% passed` : 'No graded quiz yet'}
                        />
                        <StatTile
                            icon={<CalendarOutlined />}
                            label="Next class"
                            value={nextClass ? fmt.day(nextClass.start_time) : '—'}
                            note={nextClass ? `${fmt.time(nextClass.start_time)} · ${nextClass.title}` : 'No class scheduled'}
                        />
                        <StatTile
                            icon={<TeamOutlined />}
                            label="Batches"
                            value={batches.length}
                            note={`${activeBatches} active`}
                            onClick={batches.length ? () => setBatchesOpen(true) : undefined}
                        />
                    </div>
                </section>

                <div className="sd-grid">
                    <div className="sd-col">
                        {/* ── Performance ── */}
                        <section className="sd-card sd-card-perf" aria-label="Performance">
                            <div className="sd-card-head">
                                <div>
                                    <h2 className="sd-card-title">Performance</h2>
                                    <div className="sd-card-sub">
                                        {trendPoints.length ? `Your last ${plural(trendPoints.length, 'graded quiz', 'graded quizzes')}` : 'Your scores over time'}
                                    </div>
                                </div>
                                <button type="button" className="sd-link" onClick={() => navigate('/app/my-results')}>
                                    All results <RightOutlined />
                                </button>
                            </div>
                            <div className="sd-card-body">
                                {trendPoints.length >= 2
                                    ? <TrendChart points={trendPoints} />
                                    : <div className="sd-empty-note">Your trend appears after your second graded quiz.</div>}
                            </div>
                        </section>

                        {/* ── Results ── */}
                        <section className="sd-card sd-card-results" aria-label="Results">
                            <div className="sd-card-head">
                                <h2 className="sd-card-title">Results</h2>
                                <Segmented<'recent' | 'best'>
                                    size="small"
                                    value={resultsView}
                                    onChange={setResultsView}
                                    options={[{ value: 'recent', label: 'Recent' }, { value: 'best', label: 'Best' }]}
                                />
                            </div>
                            {resultList.length === 0 ? (
                                <div className="sd-empty">
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Your graded quizzes will appear here." />
                                </div>
                            ) : (
                                <ul className="sd-results">
                                    {resultList.map(x => (
                                        <li key={x.key}>
                                            <button type="button" className="sd-result" onClick={() => navigate(`/app/my-results?focus=${x.key}`)}>
                                                <span className="sd-result-main">
                                                    <span className="sd-result-title" title={x.title}>{x.title}</span>
                                                    <span className="sd-result-meta">{fmt.date(x.at)}</span>
                                                </span>
                                                <span className={`sd-result-bar sd-tone-${toneFor(x.pct)}`} aria-hidden>
                                                    <span style={{ width: `${Math.min(100, x.pct)}%` }} />
                                                </span>
                                                <span className="sd-result-pct">{fmtPct(x.pct)}</span>
                                                <GradeBadge pct={x.pct} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    <div className="sd-col">
                        {/* ── Up next ── */}
                        <section className="sd-card sd-card-next" aria-label="Up next">
                            <div className="sd-card-head">
                                <h2 className="sd-card-title">Up next</h2>
                                <button type="button" className="sd-link" onClick={() => navigate('/app/my-schedule')}>
                                    Schedule <RightOutlined />
                                </button>
                            </div>
                            {upNext.length === 0 ? (
                                <div className="sd-empty">
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up. No quizzes or classes coming up." />
                                </div>
                            ) : (
                                <ul className="sd-next">
                                    {upNext.map(item => (
                                        <li key={item.key} className={`sd-next-item${item.open ? ' is-open' : ''}`}>
                                            <div className="sd-date" aria-hidden>
                                                {item.open && item.kind === 'quiz'
                                                    ? <><span>Open</span><strong>Now</strong></>
                                                    : <><span>{fmt.weekday(item.at)}</span><strong>{fmt.dayNum(item.at)}</strong></>}
                                            </div>
                                            <div className="sd-next-main">
                                                <div className="sd-next-title">
                                                    <span className={`sd-kind is-${item.kind}`}>
                                                        {item.kind === 'quiz' ? <FileTextOutlined /> : item.meta.includes('Online') ? <VideoCameraOutlined /> : <EnvironmentOutlined />}
                                                    </span>
                                                    <span title={item.title}>{item.title}</span>
                                                </div>
                                                <div className="sd-next-meta">
                                                    {item.meta.map((m, i) => <span key={i}>{i === 0 && <ClockCircleOutlined />} {m}</span>)}
                                                </div>
                                            </div>
                                            {item.action ? (
                                                <Button size="small" type="primary" onClick={item.action.onClick}>{item.action.label}</Button>
                                            ) : item.to ? (
                                                <Tooltip title="Open">
                                                    <Button size="small" type="text" icon={<RightOutlined />} onClick={() => navigate(item.to!)} aria-label={`Open ${item.title}`} />
                                                </Tooltip>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        {/* ── Quiz status ── */}
                        <section className="sd-card sd-card-status" aria-label="Quiz status">
                            <div className="sd-card-head">
                                <h2 className="sd-card-title">Quiz status</h2>
                                <span className="sd-card-sub">{plural(statusTotal, 'quiz', 'quizzes')}</span>
                            </div>
                            <div className="sd-card-body">
                                {statusTotal === 0 ? (
                                    <div className="sd-empty-note">No quizzes assigned yet.</div>
                                ) : (
                                    <>
                                        <div className="sd-stack" role="img"
                                            aria-label={statusSegments.map(s => `${s.label}: ${s.value}`).join(', ')}>
                                            {statusSegments.filter(s => s.value > 0).map(s => (
                                                <Tooltip key={s.key} title={`${s.label}: ${s.value}`}>
                                                    <span className={`sd-stack-seg is-${s.key}`} style={{ flexGrow: s.value }} />
                                                </Tooltip>
                                            ))}
                                        </div>
                                        <dl className="sd-legend">
                                            {statusSegments.map(s => (
                                                <div key={s.key}>
                                                    <dt><i className={`is-${s.key}`} />{s.label}</dt>
                                                    <dd>{s.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </>
                                )}
                            </div>
                        </section>

                        {/* ── Batches ── */}
                        <section className="sd-card sd-card-batches" aria-label="My batches">
                            <div className="sd-card-head">
                                <h2 className="sd-card-title">My batches</h2>
                                {batches.length > 3 && (
                                    <button type="button" className="sd-link" onClick={() => setBatchesOpen(true)}>
                                        View all {batches.length} <RightOutlined />
                                    </button>
                                )}
                            </div>
                            {sortedBatches.length === 0 ? (
                                <div className="sd-empty">
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're not enrolled in a batch yet." />
                                </div>
                            ) : (
                                <ul className="sd-batches">{sortedBatches.slice(0, 3).map(renderBatch)}</ul>
                            )}
                        </section>
                    </div>
                </div>

                {/* ── All batches ── */}
                <Modal
                    open={batchesOpen}
                    onCancel={() => setBatchesOpen(false)}
                    footer={null}
                    title="My batches"
                    width={r.isMobile ? '100%' : 640}
                    wrapClassName="sd-modal"
                >
                    <div className="sd-modal-toolbar">
                        <Input
                            allowClear
                            prefix={<SearchOutlined />}
                            placeholder="Search by name, level or teacher"
                            value={batchSearch}
                            onChange={e => setBatchSearch(e.target.value)}
                        />
                        <Segmented<'all' | BatchStatus>
                            value={batchFilter}
                            onChange={setBatchFilter}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'active', label: 'Active' },
                                { value: 'upcoming', label: 'Upcoming' },
                                { value: 'completed', label: 'Completed' },
                            ]}
                        />
                    </div>
                    {modalBatches.length === 0
                        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matching batches" />
                        : <ul className="sd-batches">{modalBatches.map(renderBatch)}</ul>}
                </Modal>

                {/* ── Join class ── */}
                <Modal
                    open={!!joinTarget}
                    onCancel={() => setJoinTarget(null)}
                    footer={null}
                    title={joinTarget ? `Join ${joinTarget.title}` : 'Join class'}
                    width={400}
                    destroyOnHidden
                    wrapClassName="sd-modal"
                >
                    <p className="sd-modal-text">Enter the access code your teacher shared to mark your attendance.</p>
                    <Form form={form} layout="vertical" onFinish={submitAccessCode} requiredMark={false}>
                        <Form.Item name="accessCode" label="Access code" rules={[{ required: true, message: 'Enter the access code' }]}>
                            <Input placeholder="e.g. ABC123" autoFocus className="sd-code-input" />
                        </Form.Item>
                        <div className="sd-modal-actions">
                            <Button onClick={() => setJoinTarget(null)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={joining}>Join class</Button>
                        </div>
                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default StudentDashboard;
