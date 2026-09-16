import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, Segmented, Skeleton, Tooltip } from 'antd';
import {
    ArrowRightOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, ReloadOutlined,
    RiseOutlined, TeamOutlined, TrophyOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatPlain, timezoneLabel } from '../../utils/timezone';
import './Teacher.css';

/* ══════════════════════════════════════════
   TEACHER DASHBOARD
   One read of batches, quizzes and students; everything below is derived from it,
   so the figures on screen always agree with each other.
══════════════════════════════════════════ */

interface Quiz {
    id: number;
    title: string;
    is_active: boolean;
    status?: string;
    submissions_count?: number;
    total_questions?: number;
    duration_minutes?: number;
    batch_name?: string;
    end_date?: string;
    created_at?: string;
}
interface Batch {
    id: number;
    name: string;
    french_level?: string;
    start_date?: string;
    end_date?: string;
    student_count?: number;
}
interface QuizScore { quiz_title: string; score: number | null; max_score: number | null; submitted_at: string }
interface StudentRow {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    batch_name: string;
    average_score: number;
    quiz_scores: QuizScore[];
}
interface Student {
    id: number;
    name: string;
    email: string;
    batches: string[];
    average: number;
    scores: QuizScore[];
}

type Period = '30d' | '90d' | 'all';
const PERIOD_DAYS: Record<string, number> = { '30d': 30, '90d': 90 };

const toneOf = (pct: number | null) => (pct == null ? 'is-none' : pct >= 70 ? 'is-good' : pct >= 50 ? 'is-warn' : 'is-bad');
const barColor = (pct: number) => (pct >= 70 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626');
const fmtPct = (v: number | null) => (v == null || Number.isNaN(v) ? '—' : `${Math.round(v)}%`);
const initials = (name: string) => {
    const p = name.trim().split(/\s+/).filter(Boolean);
    return ((p[0]?.[0] || '?') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
};
const listOf = <T,>(d: unknown, ...keys: string[]): T[] => {
    if (Array.isArray(d)) return d as T[];
    for (const k of keys) { const v = (d as Record<string, unknown>)?.[k]; if (Array.isArray(v)) return v as T[]; }
    return [];
};

const useWidth = (ref: React.RefObject<HTMLElement | null>) => {
    const [w, setW] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        setW(Math.round(el.getBoundingClientRect().width));
        const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return w;
};

/* ── Monthly average, drawn to the width it actually has ── */
interface Point { key: string; label: string; long: string; pct: number; count: number }
const TrendChart: React.FC<{ points: Point[] }> = ({ points }) => {
    const ref = useRef<HTMLDivElement>(null);
    const w = useWidth(ref);
    const [hover, setHover] = useState<number | null>(null);
    const H = 216, L = 36, R = 12, T = 12, B = 28;
    const iw = Math.max(0, w - L - R);
    const ih = H - T - B;
    const n = points.length;
    const step = n > 1 ? iw / (n - 1) : 0;
    const x = (i: number) => (n === 1 ? L + iw / 2 : L + step * i);
    const y = (v: number) => T + ih - (v / 100) * ih;
    const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.pct).toFixed(1)}`).join(' ');
    const area = n ? `${line} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z` : '';
    const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(iw / 70))));
    const hp = hover != null ? points[hover] : null;

    return (
        <div className="tc-chart" ref={ref} onMouseLeave={() => setHover(null)}>
            {w > 0 && (
                <svg width={w} height={H} role="img" aria-label="Average score by month">
                    <defs>
                        <linearGradient id="tc-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {[0, 25, 50, 75, 100].map(g => (
                        <g key={g}>
                            <line x1={L} x2={w - R} y1={y(g)} y2={y(g)} className="tc-gridline" />
                            <text x={L - 8} y={y(g)} className="tc-axis" textAnchor="end" dominantBaseline="middle">{g}</text>
                        </g>
                    ))}
                    <path d={area} fill="url(#tc-area)" />
                    <path d={line} className="tc-line" />
                    {points.map((p, i) => <circle key={p.key} cx={x(i)} cy={y(p.pct)} r={hover === i ? 5 : 3} className="tc-dot" />)}
                    {points.map((p, i) => (i % every === 0 || i === n - 1) && (
                        <text key={p.key} x={x(i)} y={H - 9} className="tc-axis" textAnchor="middle">{p.label}</text>
                    ))}
                    {hover != null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + ih} className="tc-cursor" />}
                    {points.map((p, i) => (
                        <rect key={p.key} x={x(i) - step / 2} y={T} width={Math.max(step, 24)} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} />
                    ))}
                </svg>
            )}
            {hp && hover != null && (
                <div className="tc-tip" style={{ left: Math.min(Math.max(x(hover), 80), Math.max(80, w - 80)), top: 4 }}>
                    <strong>{hp.long}</strong>
                    <span>{fmtPct(hp.pct)} average</span>
                    <em>{hp.count} {hp.count === 1 ? 'submission' : 'submissions'}</em>
                </div>
            )}
        </div>
    );
};

const Donut: React.FC<{ parts: { value: number; color: string }[]; size?: number; children?: React.ReactNode }> = ({ parts, size = 132, children }) => {
    const stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const total = parts.reduce((t, p) => t + p.value, 0);
    let acc = 0;
    return (
        <div className="tc-donut" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                {total > 0 && parts.map((p, i) => {
                    const len = (p.value / total) * c;
                    const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={stroke}
                        strokeDasharray={`${Math.max(0, len - (len > 3 ? 1.5 : 0))} ${c}`} strokeDashoffset={-acc}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
                    acc += len;
                    return el;
                })}
            </svg>
            <div className="tc-donut-center">{children}</div>
        </div>
    );
};

const TeacherDashboard: React.FC = () => {
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();

    const [batches, setBatches] = useState<Batch[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [rows, setRows] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('90d');

    const load = useCallback(async () => {
        if (!user?.id) return;
        try {
            const [b, q, s] = await Promise.all([
                apiCall(`/batches/teacher/${user.id}`),
                apiCall(`/quizzes/teacher/${user.id}`),
                apiCall(`/users/students/teacher/${user.id}`),
            ]);
            if (!b.ok && !q.ok && !s.ok) throw new Error('The server did not answer.');
            setBatches(b.ok ? listOf<Batch>(await b.json(), 'data', 'batches') : []);
            setQuizzes(q.ok ? listOf<Quiz>(await q.json(), 'data', 'quizzes') : []);
            setRows(s.ok ? listOf<StudentRow>(await s.json(), 'data', 'students') : []);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load your dashboard.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall, user?.id]);

    useEffect(() => { load(); }, [load]);

    /* ── One row per student: the API returns one row per student *per batch* ── */
    const students = useMemo<Student[]>(() => {
        const map = new Map<number, Student>();
        rows.forEach(r => {
            const existing = map.get(r.id);
            if (existing) {
                if (r.batch_name && !existing.batches.includes(r.batch_name)) existing.batches.push(r.batch_name);
                return;   // scores and average are identical on every row for the same student
            }
            map.set(r.id, {
                id: r.id,
                name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email,
                email: r.email,
                batches: r.batch_name ? [r.batch_name] : [],
                average: Number(r.average_score) || 0,
                scores: Array.isArray(r.quiz_scores) ? r.quiz_scores : [],
            });
        });
        return Array.from(map.values());
    }, [rows]);

    const since = useMemo(() => {
        const days = PERIOD_DAYS[period];
        if (!days) return null;
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.getTime();
    }, [period]);

    const submissions = useMemo(() => {
        const out: { student: Student; s: QuizScore; at: number; pct: number | null }[] = [];
        students.forEach(st => st.scores.forEach(s => {
            const at = new Date(s.submitted_at).getTime();
            if (Number.isNaN(at) || (since && at < since)) return;
            out.push({ student: st, s, at, pct: s.max_score ? ((s.score || 0) / s.max_score) * 100 : null });
        }));
        return out.sort((a, b) => b.at - a.at);
    }, [students, since]);

    const graded = submissions.filter(x => x.pct !== null);
    const average = graded.length ? graded.reduce((t, x) => t + (x.pct as number), 0) / graded.length : null;
    const activeQuizzes = quizzes.filter(q => q.is_active).length;
    const needSupport = students.filter(s => s.scores.length > 0 && s.average < 50);
    const totalSeats = batches.reduce((t, b) => t + (Number(b.student_count) || 0), 0);

    const trend = useMemo<Point[]>(() => {
        const map = new Map<string, { score: number; max: number; count: number }>();
        submissions.forEach(({ s }) => {
            if (!s.max_score) return;
            const d = new Date(s.submitted_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const e = map.get(key) || { score: 0, max: 0, count: 0 };
            e.score += s.score || 0;
            e.max += s.max_score || 0;
            e.count += 1;
            map.set(key, e);
        });
        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, v]) => {
                const d = new Date(`${key}-01T12:00:00Z`);
                return {
                    key,
                    label: formatPlain(d, user?.timezone, { month: 'short' }),
                    long: formatPlain(d, user?.timezone, { month: 'long', year: 'numeric' }),
                    pct: v.max ? (v.score / v.max) * 100 : 0,
                    count: v.count,
                };
            });
    }, [submissions, user?.timezone]);

    const byBatch = useMemo(() => {
        const map = new Map<string, { score: number; max: number; count: number }>();
        submissions.forEach(({ student, s }) => {
            if (!s.max_score) return;
            student.batches.forEach(name => {
                const e = map.get(name) || { score: 0, max: 0, count: 0 };
                e.score += s.score || 0;
                e.max += s.max_score || 0;
                e.count += 1;
                map.set(name, e);
            });
        });
        return Array.from(map.entries())
            .map(([name, v]) => ({ name, pct: v.max ? (v.score / v.max) * 100 : 0, count: v.count }))
            .sort((a, b) => b.pct - a.pct);
    }, [submissions]);

    const ranked = useMemo(() => [...students].filter(s => s.scores.length > 0).sort((a, b) => b.average - a.average), [students]);
    const tzLabel = timezoneLabel(user?.timezone);

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="tc" aria-busy="true">
                <div className="tc-header"><div><Skeleton.Input active size="small" style={{ width: 130, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 200, height: 26 }} /></div></div></div>
                <div className="tc-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="tc-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="tc-grid is-wide"><div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 6 }} /></div><div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 6 }} /></div></div>
            </div>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            <div className="tc">
                {/* ── Header ── */}
                <header className="tc-header">
                    <div>
                        <div className="tc-overline">Teacher space</div>
                        <h1 className="tc-title">Dashboard</h1>
                        <p className="tc-subtitle">
                            {user?.first_name ? `${user.first_name}, here` : 'Here'} is how your classes are doing ·{' '}
                            {formatPlain(new Date(), user?.timezone, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} ({tzLabel})
                        </p>
                    </div>
                    <div className="tc-actions">
                        <Segmented value={period} onChange={v => setPeriod(v as Period)} options={[
                            { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }, { value: 'all', label: 'All time' },
                        ]} />
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                    </div>
                </header>

                {error && (
                    <div className="tc-alert" role="alert">
                        <WarningOutlined /><span><strong>Couldn't load your dashboard.</strong> {error}</span>
                        <Button size="small" onClick={() => { setLoading(true); load(); }}>Retry</Button>
                    </div>
                )}

                {/* ── KPIs ── */}
                <section className="tc-kpis" aria-label="Summary">
                    <button type="button" className="tc-kpi" onClick={() => navigate('/app/teacher-batches')}>
                        <span className="tc-kpi-ic"><UserOutlined /></span>
                        <span className="tc-kpi-label">Students</span>
                        <strong className="tc-kpi-value">{students.length}</strong>
                        <span className="tc-kpi-sub">{totalSeats !== students.length ? `${totalSeats} places across batches` : 'across your batches'}</span>
                    </button>
                    <div className={`tc-kpi ${average == null ? '' : average >= 70 ? 'is-green' : average >= 50 ? 'is-amber' : 'is-red'}`}>
                        <span className="tc-kpi-ic"><RiseOutlined /></span>
                        <span className="tc-kpi-label">Average score</span>
                        <strong className="tc-kpi-value">{fmtPct(average)}</strong>
                        <span className="tc-kpi-sub">{graded.length} graded {graded.length === 1 ? 'submission' : 'submissions'}</span>
                        <span className="tc-kpi-meter"><i style={{ width: `${Math.min(100, average || 0)}%` }} /></span>
                    </div>
                    <button type="button" className="tc-kpi is-slate" onClick={() => navigate('/app/quiz-management')}>
                        <span className="tc-kpi-ic"><FileTextOutlined /></span>
                        <span className="tc-kpi-label">Active quizzes</span>
                        <strong className="tc-kpi-value">{activeQuizzes}</strong>
                        <span className="tc-kpi-sub">of {quizzes.length} you created</span>
                    </button>
                    <button type="button" className="tc-kpi is-slate" onClick={() => navigate('/app/teacher-batches')}>
                        <span className="tc-kpi-ic"><TeamOutlined /></span>
                        <span className="tc-kpi-label">Batches</span>
                        <strong className="tc-kpi-value">{batches.length}</strong>
                        <span className="tc-kpi-sub">{byBatch.length} with submissions</span>
                    </button>
                    <div className={`tc-kpi${needSupport.length ? ' is-red' : ' is-green'}`}>
                        <span className="tc-kpi-ic">{needSupport.length ? <WarningOutlined /> : <CheckCircleOutlined />}</span>
                        <span className="tc-kpi-label">Need support</span>
                        <strong className="tc-kpi-value">{needSupport.length}</strong>
                        <span className="tc-kpi-sub">{needSupport.length ? 'below 50% overall' : 'everyone above 50%'}</span>
                    </div>
                </section>

                {/* ── Trend + quiz status ── */}
                <div className="tc-grid is-wide">
                    <section className="tc-card">
                        <div className="tc-card-head">
                            <span className="tc-card-title"><span className="tc-card-ic"><RiseOutlined /></span>Average score by month</span>
                            <span className="tc-count">{graded.length}</span>
                        </div>
                        <div className="tc-card-body">
                            {trend.length === 0 ? (
                                <div className="tc-state"><RiseOutlined /><strong>No graded submissions yet</strong><span>Scores appear here once students submit a quiz.</span></div>
                            ) : <TrendChart points={trend} />}
                        </div>
                    </section>
                    <section className="tc-card">
                        <div className="tc-card-head"><span className="tc-card-title"><span className="tc-card-ic"><FileTextOutlined /></span>Your quizzes</span></div>
                        <div className="tc-card-body tc-split">
                            <Donut parts={[{ value: activeQuizzes, color: '#4f46e5' }, { value: quizzes.length - activeQuizzes, color: '#cbd5e1' }]}>
                                <strong>{quizzes.length}</strong><span>total</span>
                            </Donut>
                            <ul className="tc-legend">
                                <li><i style={{ background: '#4f46e5' }} /><span>Open to students</span><strong>{activeQuizzes}</strong></li>
                                <li><i style={{ background: '#cbd5e1' }} /><span>Closed or draft</span><strong>{quizzes.length - activeQuizzes}</strong></li>
                                <li><i style={{ background: 'transparent' }} /><span>Submissions received</span><strong>{quizzes.reduce((t, q) => t + (Number(q.submissions_count) || 0), 0)}</strong></li>
                            </ul>
                        </div>
                        <div className="tc-card-foot"><button type="button" className="tc-link" onClick={() => navigate('/app/quiz-management')}>Manage quizzes <ArrowRightOutlined /></button></div>
                    </section>
                </div>

                {/* ── Batches + people ── */}
                <div className="tc-grid">
                    <section className="tc-card">
                        <div className="tc-card-head"><span className="tc-card-title"><span className="tc-card-ic is-green"><BookOutlined /></span>Average by batch</span></div>
                        <div className="tc-card-body">
                            {byBatch.length === 0 ? (
                                <div className="tc-state"><BookOutlined /><strong>Nothing to compare yet</strong><span>Batch averages appear once quizzes are submitted.</span></div>
                            ) : (
                                <ul className="tc-bars">
                                    {byBatch.map(b => (
                                        <li key={b.name}>
                                            <span className="tc-bars-top"><strong>{b.name}</strong><em>{fmtPct(b.pct)} · {b.count} {b.count === 1 ? 'submission' : 'submissions'}</em></span>
                                            <span className="tc-bars-track"><i style={{ width: `${Math.max(2, b.pct)}%`, '--b': barColor(b.pct) } as React.CSSProperties} /></span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    <section className="tc-card">
                        <div className="tc-card-head">
                            <span className="tc-card-title"><span className="tc-card-ic is-amber"><TrophyOutlined /></span>{needSupport.length ? 'Students to follow up' : 'Top performers'}</span>
                            <span className="tc-count">{needSupport.length || ranked.length}</span>
                        </div>
                        <div className="tc-card-body is-flush">
                            {ranked.length === 0 ? (
                                <div className="tc-state"><TeamOutlined /><strong>No scores yet</strong><span>Once students submit, their averages appear here.</span></div>
                            ) : (
                                <ul className="tc-people">
                                    {(needSupport.length ? [...needSupport].sort((a, b) => a.average - b.average) : ranked.slice(0, 6)).map((s, i) => (
                                        <li key={s.id}>
                                            <div className="tc-person">
                                                {!needSupport.length && <span className={`tc-rank${i < 3 ? ` is-${i + 1}` : ''}`}>{i + 1}</span>}
                                                <span className="tc-av">{initials(s.name)}</span>
                                                <span className="tc-cell"><strong>{s.name}</strong><em>{s.batches.join(', ') || 'No batch'} · {s.scores.length} {s.scores.length === 1 ? 'quiz' : 'quizzes'}</em></span>
                                                <span className={`tc-score ${toneOf(s.average)}`}>{fmtPct(s.average)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {needSupport.length > 0 && ranked.length > 0 && (
                            <div className="tc-card-foot"><span className="tc-kpi-sub">Best average right now: <strong>{ranked[0].name}</strong> at {fmtPct(ranked[0].average)}.</span></div>
                        )}
                    </section>
                </div>

                {/* ── Recent submissions ── */}
                <section className="tc-card">
                    <div className="tc-card-head">
                        <span className="tc-card-title"><span className="tc-card-ic"><ClockCircleOutlined /></span>Recent submissions</span>
                        <span className="tc-count">{submissions.length}</span>
                    </div>
                    <div className="tc-card-body">
                        {submissions.length === 0 ? (
                            <div className="tc-state"><ClockCircleOutlined /><strong>No submissions in this period</strong><span>Try a longer period, or assign a quiz to your batches.</span></div>
                        ) : (
                            <ul className="tc-feed">
                                {submissions.slice(0, 8).map((x, i) => (
                                    <li key={`${x.student.id}-${x.at}-${i}`}>
                                        <span className="tc-dot-s" style={{ background: x.pct == null ? '#cbd5e1' : barColor(x.pct) }} />
                                        <span className="tc-cell">
                                            <strong>{x.student.name}</strong>
                                            <em>{x.s.quiz_title} · {formatPlain(x.s.submitted_at, user?.timezone, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</em>
                                        </span>
                                        <span className={`tc-score ${toneOf(x.pct)}`}>{fmtPct(x.pct)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </ConfigProvider>
    );
};

export default TeacherDashboard;
