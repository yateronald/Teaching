import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Drawer, Input, Select, Pagination, Skeleton, Empty, Alert, ConfigProvider, message } from 'antd';
import {
    SearchOutlined, PlayCircleOutlined, ClockCircleOutlined, CalendarOutlined, FileTextOutlined,
    TrophyOutlined, TeamOutlined, UserOutlined, LockOutlined, RightOutlined, ExclamationCircleOutlined,
    CheckCircleOutlined, HourglassOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import { PASS_MARK, gradeFromPercent, toneFor } from '../../utils/grading';
import QuizTaking from '../Quiz/QuizTaking';
import './StudentQuizzes.css';

/* ── API shape (student view of GET /quizzes) ── */
interface ApiQuiz {
    id: number; title: string; description?: string | null; status?: string;
    total_questions?: number | string | null; duration_minutes?: number | string | null; total_marks?: number | string | null;
    start_date?: string | null; end_date?: string | null; batch_names?: string | null;
    teacher_first_name?: string | null; teacher_last_name?: string | null;
    /** 'completed' (submitted / auto-submitted / graded), 'in_progress' or 'not_started'. */
    submission_status?: string | null;
    submission?: { percentage?: number | string | null; submitted_at?: string | null } | null;
    /** Computed by the server against its own clock. */
    can_start?: boolean; has_ended?: boolean; can_view_results?: boolean;
}

type QuizState = 'open' | 'in_progress' | 'upcoming' | 'completed' | 'missed';
type Tab = 'open' | 'upcoming' | 'completed' | 'missed';

interface QuizItem {
    id: number; title: string; description: string | null;
    batches: string[]; teacher: string | null;
    questions: number; minutes: number | null; marks: number | null;
    start: string | null; end: string | null; startMs: number | null; endMs: number | null;
    state: QuizState;
    pct: number | null; submittedAt: string | null; resultsLocked: boolean;
}

const PAGE_SIZE = 12;
const REFRESH_MS = 60_000;
const HOUR_MS = 3_600_000;

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
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const PCT = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const relative = (ms: number) => {
    const min = Math.round(Math.abs(ms) / 60_000);
    if (min < 60) return `${Math.max(1, min)} min`;
    const h = Math.round(min / 60);
    if (h < 48) return `${h} h`;
    return `${Math.round(h / 24)} days`;
};

const classify = (q: ApiQuiz, now: number): QuizState => {
    if (q.submission_status === 'completed') return 'completed';
    const start = toTime(q.start_date), end = toTime(q.end_date);
    const opened = q.can_start ?? (start == null || start <= now);
    const ended = q.has_ended ?? (end != null && end < now);
    if (!opened) return 'upcoming';
    if (ended) return 'missed';
    return q.submission_status === 'in_progress' ? 'in_progress' : 'open';
};

const normalize = (raw: ApiQuiz[], now: number): QuizItem[] => raw
    .filter(q => (q.status ?? 'published') === 'published')
    .map(q => {
        const state = classify(q, now);
        const resultsLocked = q.can_view_results === false || (q.can_view_results == null && (toTime(q.end_date) ?? 0) > now);
        return {
            id: q.id,
            title: q.title || 'Untitled quiz',
            description: q.description?.trim() || null,
            batches: (q.batch_names || '').split(',').map(s => s.trim()).filter(Boolean),
            teacher: [q.teacher_first_name, q.teacher_last_name].filter(Boolean).join(' ') || null,
            questions: toNum(q.total_questions) ?? 0,
            minutes: toNum(q.duration_minutes),
            marks: toNum(q.total_marks),
            start: q.start_date ?? null,
            end: q.end_date ?? null,
            startMs: toTime(q.start_date),
            endMs: toTime(q.end_date),
            state,
            pct: state === 'completed' && !resultsLocked ? toNum(q.submission?.percentage) : null,
            submittedAt: q.submission?.submitted_at ?? null,
            resultsLocked,
        };
    });

const STATE_LABEL: Record<QuizState, string> = {
    open: 'Open', in_progress: 'In progress', upcoming: 'Upcoming', completed: 'Completed', missed: 'Missed',
};

/** Circular score gauge; colour follows the shared grading tones. */
const ScoreRing: React.FC<{ pct: number; size?: number }> = ({ pct, size = 44 }) => {
    const stroke = size >= 64 ? 6 : 4;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const value = Math.min(100, Math.max(0, pct));
    return (
        <span className={`sq-ring sq-tone-${toneFor(pct)}`} style={{ width: size, height: size }} aria-label={`${PCT.format(pct)}%`}>
            <svg viewBox={`0 0 ${size} ${size}`} aria-hidden>
                <circle cx={size / 2} cy={size / 2} r={radius} className="sq-ring-track" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={radius} className="sq-ring-fill" strokeWidth={stroke}
                    strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value / 100)} />
            </svg>
            <span className="sq-ring-label">{Math.round(pct)}<small>%</small></span>
        </span>
    );
};

const StudentQuizzes: React.FC = () => {
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();
    const r = useResponsive();
    const zone = resolveTimezone(user?.timezone);
    const tzLabel = timezoneLabel(zone);
    const [messageApi, contextHolder] = message.useMessage();
    const [searchParams] = useSearchParams();
    const focusId = Number(searchParams.get('focus')) || null;

    const [raw, setRaw] = useState<ApiQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const [tab, setTab] = useState<Tab | null>(null);
    const [search, setSearch] = useState('');
    const [batch, setBatch] = useState<string | null>(null);
    const [teacher, setTeacher] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [detailsId, setDetailsId] = useState<number | null>(null);
    const [takingId, setTakingId] = useState<number | null>(null);

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) { setLoading(true); setError(null); }
        try {
            const res = await apiCall('/quizzes');
            const body = await res.json().catch(() => null);
            if (!res.ok) throw new Error(body?.error || 'Failed to load quizzes');
            setRaw(Array.isArray(body) ? body : body?.quizzes ?? []);
            setNow(Date.now());
        } catch (e: any) {
            if (!silent) setError(e?.message || 'Failed to load quizzes');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [apiCall]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Keep countdowns live and states fresh (quizzes open and close on their own).
    useEffect(() => {
        const tick = window.setInterval(() => setNow(Date.now()), 30_000);
        const refresh = window.setInterval(() => {
            if (takingId == null && document.visibilityState === 'visible') void fetchData(true);
        }, REFRESH_MS);
        return () => { window.clearInterval(tick); window.clearInterval(refresh); };
    }, [fetchData, takingId]);

    const items = useMemo(() => normalize(raw, now), [raw, now]);

    /* ── Dates in the student's timezone ── */
    const fmt = useMemo(() => {
        const make = (opts: Intl.DateTimeFormatOptions, locale = 'en-US') => {
            const f = new Intl.DateTimeFormat(locale, { timeZone: zone, ...opts });
            return (v: string | number | null | undefined) => {
                if (v == null) return '';
                const d = new Date(v);
                return isNaN(d.getTime()) ? '' : f.format(d);
            };
        };
        const date = make({ weekday: 'short', month: 'short', day: 'numeric' });
        const time = make({ hour: '2-digit', minute: '2-digit', hour12: false }, 'en-GB');
        return {
            dateTime: (v: string | number | null | undefined) => (v == null ? '—' : `${date(v)}, ${time(v)}`),
            date: make({ month: 'short', day: 'numeric', year: 'numeric' }),
            weekday: make({ weekday: 'short' }),
            dayNum: make({ day: 'numeric' }),
            month: make({ month: 'short' }),
            time,
        };
    }, [zone]);

    /* ── Filters ── */
    const batchOptions = useMemo(() => Array.from(new Set(items.flatMap(i => i.batches))).sort().map(v => ({ value: v, label: v })), [items]);
    const teacherOptions = useMemo(() => Array.from(new Set(items.map(i => i.teacher).filter((t): t is string => !!t))).sort().map(v => ({ value: v, label: v })), [items]);
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return items.filter(i => {
            if (q && !`${i.title} ${i.description ?? ''} ${i.batches.join(' ')}`.toLowerCase().includes(q)) return false;
            if (batch && !i.batches.includes(batch)) return false;
            if (teacher && i.teacher !== teacher) return false;
            return true;
        });
    }, [items, search, batch, teacher]);

    const byTab = useMemo(() => {
        const open = filtered.filter(i => i.state === 'open' || i.state === 'in_progress')
            .sort((a, b) => (a.state === 'in_progress' ? -1 : 0) - (b.state === 'in_progress' ? -1 : 0) || (a.endMs ?? Infinity) - (b.endMs ?? Infinity));
        const upcoming = filtered.filter(i => i.state === 'upcoming').sort((a, b) => (a.startMs ?? 0) - (b.startMs ?? 0));
        const completed = filtered.filter(i => i.state === 'completed')
            .sort((a, b) => (toTime(b.submittedAt) ?? b.endMs ?? 0) - (toTime(a.submittedAt) ?? a.endMs ?? 0));
        const missed = filtered.filter(i => i.state === 'missed').sort((a, b) => (b.endMs ?? 0) - (a.endMs ?? 0));
        return { open, upcoming, completed, missed } as Record<Tab, QuizItem[]>;
    }, [filtered]);

    /* ── Overview figures (over all quizzes, not the filters) ── */
    const overview = useMemo(() => {
        const released = items.filter(i => i.state === 'completed' && i.pct != null);
        const avg = released.length ? released.reduce((s, i) => s + (i.pct as number), 0) / released.length : null;
        const passed = released.filter(i => (i.pct as number) >= PASS_MARK).length;
        const open = items.filter(i => i.state === 'open' || i.state === 'in_progress');
        const nextClose = open.map(i => i.endMs).filter((t): t is number => t != null).sort((a, b) => a - b)[0] ?? null;
        const nextOpen = items.filter(i => i.state === 'upcoming').map(i => i.startMs).filter((t): t is number => t != null).sort((a, b) => a - b)[0] ?? null;
        return {
            avg, released: released.length, passRate: released.length ? Math.round((passed / released.length) * 100) : null,
            open: open.length, inProgress: open.filter(i => i.state === 'in_progress').length,
            upcoming: items.filter(i => i.state === 'upcoming').length,
            completed: items.filter(i => i.state === 'completed').length,
            missed: items.filter(i => i.state === 'missed').length,
            nextClose, nextOpen,
        };
    }, [items]);

    // First load: land on the most useful tab (or the one containing a deep-linked quiz).
    useEffect(() => {
        if (loading || tab) return;
        const focused = focusId ? items.find(i => i.id === focusId) : null;
        if (focused) { setTab(focused.state === 'in_progress' ? 'open' : (focused.state as Tab)); return; }
        setTab(byTab.open.length ? 'open' : byTab.upcoming.length ? 'upcoming' : byTab.completed.length ? 'completed' : 'open');
    }, [loading, tab, items, byTab, focusId]);

    // Deep link ?focus=<quizId>: scroll to and highlight the quiz once its tab is shown.
    useEffect(() => {
        if (!focusId || loading || !tab) return;
        const list = byTab[tab];
        const idx = list.findIndex(i => i.id === focusId);
        if (idx < 0) return;
        if (tab === 'completed') setPage(Math.floor(idx / PAGE_SIZE) + 1);
        const t = window.setTimeout(() => {
            const el = document.querySelector(`[data-focus-id="${focusId}"]`);
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('sq-focus');
            window.setTimeout(() => el.classList.remove('sq-focus'), 2600);
        }, 300);
        return () => window.clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusId, loading, tab]);

    useEffect(() => { setPage(1); }, [search, batch, teacher, tab]);

    const startQuiz = (item: QuizItem) => { setDetailsId(null); setTakingId(item.id); };
    const closeQuiz = (submitted: boolean) => {
        setTakingId(null);
        void fetchData(true);
        if (submitted) messageApi.success('Quiz submitted');
    };

    const details = detailsId != null ? items.find(i => i.id === detailsId) ?? null : null;
    const hasFilters = !!(search.trim() || batch || teacher);
    const clearFilters = () => { setSearch(''); setBatch(null); setTeacher(null); };

    /* ── Pieces ── */
    const windowProgress = (item: QuizItem) => {
        if (item.startMs == null || item.endMs == null || item.endMs <= item.startMs) return null;
        return Math.min(100, Math.max(0, ((now - item.startMs) / (item.endMs - item.startMs)) * 100));
    };

    const Facts = ({ item }: { item: QuizItem }) => (
        <ul className="sq-facts">
            <li><QuestionCircleOutlined /> {plural(item.questions, 'question')}</li>
            {item.minutes ? <li><ClockCircleOutlined /> {item.minutes} min</li> : null}
            {item.marks != null && <li><TrophyOutlined /> {item.marks} pts</li>}
        </ul>
    );

    const DateBlock = ({ when, tone }: { when: string | null; tone: string }) => (
        <span className={`sq-date is-${tone}`} aria-hidden>
            <span>{fmt.month(when) || '—'}</span>
            <strong>{fmt.dayNum(when) || '·'}</strong>
            <em>{fmt.weekday(when)}</em>
        </span>
    );

    const openCard = (item: QuizItem) => {
        const left = item.endMs != null ? item.endMs - now : null;
        const urgent = left != null && left < 24 * HOUR_MS;
        const progress = windowProgress(item);
        return (
            <article key={item.id} className={`sq-card${item.state === 'in_progress' ? ' is-progress' : ''}${urgent ? ' is-urgent' : ''}`} data-focus-id={item.id}>
                <div className="sq-card-band">
                    <span className={`sq-status is-${item.state}`}>
                        {item.state === 'in_progress' ? <HourglassOutlined /> : <PlayCircleOutlined />} {STATE_LABEL[item.state]}
                    </span>
                    {item.batches[0] && <span className="sq-chip"><TeamOutlined /> {item.batches.join(', ')}</span>}
                </div>
                <div className="sq-card-body">
                    <button type="button" className="sq-card-title" onClick={() => setDetailsId(item.id)}>{item.title}</button>
                    {item.description && <p className="sq-card-desc">{item.description}</p>}
                    <Facts item={item} />
                    {progress != null && (
                        <div className="sq-window">
                            <div className="sq-window-bar"><span style={{ width: `${progress}%` }} /></div>
                            <div className="sq-window-labels">
                                <span>Opened {fmt.dateTime(item.start)}</span>
                                <span>Closes {fmt.dateTime(item.end)}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="sq-card-foot">
                    <span className={`sq-countdown${urgent ? ' is-urgent' : ''}`}>
                        <ClockCircleOutlined />
                        {left == null ? 'No deadline' : left > 0 ? <>Closes in <strong>{relative(left)}</strong></> : 'Closing now'}
                    </span>
                    <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => startQuiz(item)}>
                        {item.state === 'in_progress' ? 'Resume' : 'Start quiz'}
                    </Button>
                </div>
            </article>
        );
    };

    const row = (item: QuizItem) => {
        const upcoming = item.state === 'upcoming';
        const completed = item.state === 'completed';
        const when = upcoming ? item.start : completed ? (item.submittedAt ?? item.end) : item.end;
        const tone = upcoming ? 'upcoming' : item.state === 'missed' ? 'missed' : item.pct != null ? toneFor(item.pct) : 'neutral';
        return (
            <li key={item.id} data-focus-id={item.id}>
                <button type="button" className="sq-row" onClick={() => setDetailsId(item.id)}>
                    <DateBlock when={when} tone={tone} />
                    <span className="sq-row-main">
                        <span className="sq-row-title">{item.title}</span>
                        <span className="sq-row-meta">
                            {upcoming && <span><CalendarOutlined /> Opens {fmt.dateTime(item.start)}</span>}
                            {completed && <span><CheckCircleOutlined /> Submitted {fmt.dateTime(when)}</span>}
                            {item.state === 'missed' && <span><ExclamationCircleOutlined /> Closed {fmt.dateTime(item.end)}</span>}
                            <span><QuestionCircleOutlined /> {item.questions}</span>
                            {item.minutes ? <span><ClockCircleOutlined /> {item.minutes} min</span> : null}
                            {item.batches.length > 0 && <span className="sq-row-batch"><TeamOutlined /> {item.batches.join(', ')}</span>}
                        </span>
                    </span>
                    <span className="sq-row-side">
                        {upcoming && item.startMs != null && <span className="sq-pill is-upcoming"><CalendarOutlined /> In {relative(item.startMs - now)}</span>}
                        {item.state === 'missed' && <span className="sq-pill is-missed">Not submitted</span>}
                        {completed && (item.pct != null ? (
                            <>
                                <span className={`sq-verdict${item.pct >= PASS_MARK ? ' is-pass' : ''}`}>{item.pct >= PASS_MARK ? 'Passed' : 'Below pass'}</span>
                                <ScoreRing pct={item.pct} />
                                <span className={`sq-grade sq-tone-${toneFor(item.pct)}`}>{gradeFromPercent(item.pct)}</span>
                            </>
                        ) : (
                            <span className="sq-pill"><LockOutlined /> {item.endMs ? `Results ${fmt.date(item.end)}` : 'Awaiting release'}</span>
                        ))}
                        <RightOutlined className="sq-chevron" />
                    </span>
                </button>
            </li>
        );
    };

    const EMPTY: Record<Tab, { icon: React.ReactNode; title: string; text: string }> = {
        open: { icon: <PlayCircleOutlined />, title: 'No quiz is open right now', text: 'New quizzes appear here as soon as your teacher opens them.' },
        upcoming: { icon: <CalendarOutlined />, title: 'Nothing scheduled', text: 'Upcoming quizzes will show here with their opening time.' },
        completed: { icon: <CheckCircleOutlined />, title: 'No completed quiz yet', text: 'Quizzes you submit are listed here with your score.' },
        missed: { icon: <TrophyOutlined />, title: 'Nothing missed', text: 'Well done — you have submitted every quiz on time.' },
    };

    /* ═══════════ LOADING ═══════════ */
    if (loading) return (
        <div className="sq" aria-busy="true">
            <div className="sq-header">
                <div>
                    <Skeleton.Input active size="small" style={{ width: 80, height: 12 }} />
                    <div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 24 }} /></div>
                </div>
            </div>
            <div className="sq-overview sq-overview-loading"><Skeleton active avatar={{ size: 72 }} title={false} paragraph={{ rows: 3 }} /></div>
            <div className="sq-panel sq-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>
        </div>
    );

    const activeTab: Tab = tab ?? 'open';
    const list = byTab[activeTab];
    const pageItems = activeTab === 'completed' ? list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : list;
    const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'open', label: 'Open', icon: <PlayCircleOutlined /> },
        { key: 'upcoming', label: 'Upcoming', icon: <CalendarOutlined /> },
        { key: 'completed', label: 'Completed', icon: <CheckCircleOutlined /> },
        { key: 'missed', label: 'Missed', icon: <ExclamationCircleOutlined /> },
    ];
    const detailProgress = details ? windowProgress(details) : null;

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13 } }}>
            <div className="sq">
                {contextHolder}

                {/* ── Header ── */}
                <header className="sq-header">
                    <div>
                        <div className="sq-overline">Quizzes</div>
                        <h1 className="sq-title">My quizzes</h1>
                        <p className="sq-subtitle">Take open quizzes before they close and review how you did. Times in {tzLabel}.</p>
                    </div>
                    <Button icon={<TrophyOutlined />} onClick={() => navigate('/app/my-results')}>My results</Button>
                </header>

                {error && (
                    <Alert type="error" showIcon message="Couldn't load your quizzes" description={error}
                        action={<Button size="small" onClick={() => fetchData()}>Retry</Button>} />
                )}

                {/* ── Overview ── */}
                <section className="sq-overview" aria-label="Overview">
                    <div className={`sq-hero${overview.avg != null ? ` sq-tone-${toneFor(overview.avg)}` : ''}`}>
                        {overview.avg != null ? <ScoreRing pct={overview.avg} size={84} /> : <span className="sq-ring-empty"><TrophyOutlined /></span>}
                        <div>
                            <div className="sq-hero-label">Average score</div>
                            <div className="sq-hero-value">
                                {overview.avg != null
                                    ? <>Grade <span className={`sq-grade is-lg sq-tone-${toneFor(overview.avg)}`}>{gradeFromPercent(overview.avg)}</span></>
                                    : 'No results yet'}
                            </div>
                            <div className="sq-hero-note">
                                {overview.passRate != null ? `${overview.passRate}% passed · ${plural(overview.released, 'released result')}` : 'Scores appear once results are released'}
                            </div>
                        </div>
                    </div>
                    <div className="sq-tiles">
                        {[
                            { key: 'open' as Tab, icon: <PlayCircleOutlined />, label: 'Open now', value: overview.open,
                              note: overview.inProgress ? `${overview.inProgress} in progress` : overview.nextClose ? `Next closes in ${relative(overview.nextClose - now)}` : 'Nothing to take right now' },
                            { key: 'upcoming' as Tab, icon: <CalendarOutlined />, label: 'Upcoming', value: overview.upcoming,
                              note: overview.nextOpen ? `Next opens ${fmt.dateTime(overview.nextOpen)}` : 'Nothing scheduled' },
                            { key: 'completed' as Tab, icon: <CheckCircleOutlined />, label: 'Completed', value: overview.completed,
                              note: overview.passRate != null ? `${overview.passRate}% pass rate` : 'Awaiting results' },
                            { key: 'missed' as Tab, icon: <ExclamationCircleOutlined />, label: 'Missed', value: overview.missed,
                              note: overview.missed ? 'Closed before you submitted' : 'All on time' },
                        ].map(t => (
                            <button key={t.key} type="button" className={`sq-tile is-${t.key}${activeTab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>
                                <span className="sq-tile-icon">{t.icon}</span>
                                <span className="sq-tile-body">
                                    <span className="sq-tile-label">{t.label}</span>
                                    <strong className="sq-tile-value">{t.value}</strong>
                                    <span className="sq-tile-note">{t.note}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Tabs + filters ── */}
                <section className="sq-panel" aria-label="Quizzes">
                    <div className="sq-toolbar">
                        <div className="sq-tabs" role="tablist" aria-label="Quiz status">
                            {TABS.map(t => (
                                <button key={t.key} type="button" role="tab" aria-selected={activeTab === t.key}
                                    className={`sq-tab is-${t.key}${activeTab === t.key ? ' is-active' : ''}`} onClick={() => setTab(t.key)}>
                                    {t.icon}{t.label}<span className="sq-count">{byTab[t.key].length}</span>
                                </button>
                            ))}
                        </div>
                        <div className="sq-filters">
                            <Input className="sq-search" allowClear prefix={<SearchOutlined className="sq-muted" />} placeholder="Search quizzes"
                                value={search} onChange={e => setSearch(e.target.value)} aria-label="Search quizzes" />
                            {batchOptions.length > 1 && (
                                <Select className="sq-filter" allowClear placeholder="All batches" value={batch} onChange={v => setBatch(v ?? null)} options={batchOptions} />
                            )}
                            {teacherOptions.length > 1 && (
                                <Select className="sq-filter" allowClear placeholder="All teachers" value={teacher} onChange={v => setTeacher(v ?? null)} options={teacherOptions} />
                            )}
                        </div>
                    </div>

                    {list.length === 0 ? (
                        <div className="sq-empty">
                            {hasFilters ? (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No quizzes match these filters.">
                                    <Button size="small" onClick={clearFilters}>Clear filters</Button>
                                </Empty>
                            ) : (
                                <div className={`sq-empty-state is-${activeTab}`}>
                                    <span className="sq-empty-icon">{EMPTY[activeTab].icon}</span>
                                    <strong>{EMPTY[activeTab].title}</strong>
                                    <span>{EMPTY[activeTab].text}</span>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'open' ? (
                        <div className="sq-grid sq-pad">{list.map(openCard)}</div>
                    ) : (
                        <>
                            <ul className="sq-list">{pageItems.map(row)}</ul>
                            {activeTab === 'completed' && list.length > PAGE_SIZE && (
                                <div className="sq-foot">
                                    <Pagination size="small" current={page} pageSize={PAGE_SIZE} total={list.length} onChange={setPage}
                                        showSizeChanger={false} simple={r.isMobile} showTotal={r.isMobile ? undefined : (t, [a, b]) => `${a}–${b} of ${t}`} />
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* ── Details ── */}
                <Drawer
                    open={!!details}
                    onClose={() => setDetailsId(null)}
                    width={r.isMobile ? '100%' : 460}
                    title={null}
                    closable={false}
                    rootClassName="sq-drawer"
                    styles={{ body: { padding: 0 } }}
                    footer={details && (details.state === 'open' || details.state === 'in_progress') ? (
                        <Button type="primary" block size="large" icon={<PlayCircleOutlined />} onClick={() => startQuiz(details)}>
                            {details.state === 'in_progress' ? 'Resume quiz' : 'Start quiz'}
                        </Button>
                    ) : details?.state === 'completed' ? (
                        <Button block size="large" icon={<TrophyOutlined />} onClick={() => navigate('/app/my-results')}>View in My Results</Button>
                    ) : null}
                >
                    {details && (
                        <div className="sq-details">
                            <div className={`sq-details-band is-${details.state}`}>
                                <div className="sq-details-bar">
                                    <span className={`sq-status is-${details.state}`}>{STATE_LABEL[details.state]}</span>
                                    <Button type="text" size="small" onClick={() => setDetailsId(null)} aria-label="Close">✕</Button>
                                </div>
                                <h2>{details.title}</h2>
                                {details.description && <p>{details.description}</p>}
                            </div>

                            <div className="sq-details-body">
                                {details.state === 'completed' && (
                                    details.pct != null ? (
                                        <div className={`sq-result sq-tone-${toneFor(details.pct)}`}>
                                            <ScoreRing pct={details.pct} size={72} />
                                            <div>
                                                <div className="sq-result-label">Your score</div>
                                                <div className="sq-result-value">{PCT.format(details.pct)}% <span className={`sq-grade is-lg sq-tone-${toneFor(details.pct)}`}>{gradeFromPercent(details.pct)}</span></div>
                                                <div className="sq-result-note">{details.pct >= PASS_MARK ? `Above the ${PASS_MARK}% pass mark` : `Below the ${PASS_MARK}% pass mark`}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="sq-callout"><LockOutlined /> Your score will be released {details.end ? `on ${fmt.dateTime(details.end)}` : 'soon'}.</div>
                                    )
                                )}
                                {details.state === 'missed' && (
                                    <div className="sq-callout is-missed"><ExclamationCircleOutlined /> This quiz closed before you submitted it.</div>
                                )}

                                <dl className="sq-details-facts">
                                    <div><dt><QuestionCircleOutlined /> Questions</dt><dd>{details.questions}</dd></div>
                                    <div><dt><ClockCircleOutlined /> Time limit</dt><dd>{details.minutes ? `${details.minutes} min` : 'None'}</dd></div>
                                    <div><dt><TrophyOutlined /> Points</dt><dd>{details.marks ?? '—'}</dd></div>
                                </dl>

                                <div className="sq-timeline">
                                    <div className="sq-timeline-point">
                                        <span className="sq-timeline-dot" />
                                        <div><span>Opens</span><strong>{details.start ? fmt.dateTime(details.start) : 'Now'}</strong></div>
                                    </div>
                                    <div className="sq-timeline-track"><span style={{ height: `${detailProgress ?? (details.state === 'upcoming' ? 0 : 100)}%` }} /></div>
                                    <div className="sq-timeline-point">
                                        <span className="sq-timeline-dot is-end" />
                                        <div><span>Closes</span><strong>{details.end ? fmt.dateTime(details.end) : 'No deadline'}</strong></div>
                                    </div>
                                </div>

                                <dl className="sq-details-list">
                                    {details.batches.length > 0 && <div><dt><TeamOutlined /> Batch</dt><dd>{details.batches.join(', ')}</dd></div>}
                                    {details.teacher && <div><dt><UserOutlined /> Teacher</dt><dd>{details.teacher}</dd></div>}
                                    {details.submittedAt && <div><dt><CheckCircleOutlined /> Submitted</dt><dd>{fmt.dateTime(details.submittedAt)}</dd></div>}
                                    <div><dt><FileTextOutlined /> Time zone</dt><dd>{tzLabel}</dd></div>
                                </dl>
                            </div>
                        </div>
                    )}
                </Drawer>

                {/* ── Quiz player (full screen) ── */}
                <Modal
                    open={takingId != null}
                    footer={null}
                    closable={false}
                    keyboard={false}
                    maskClosable={false}
                    destroyOnHidden
                    width="100%"
                    wrapClassName="sq-take-modal"
                    styles={{ content: { padding: 0, borderRadius: 0, boxShadow: 'none' }, body: { padding: 0 } }}
                >
                    {takingId != null && (
                        <QuizTaking key={takingId} quizId={String(takingId)} onExit={() => closeQuiz(false)} onComplete={() => closeQuiz(true)} />
                    )}
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default StudentQuizzes;
