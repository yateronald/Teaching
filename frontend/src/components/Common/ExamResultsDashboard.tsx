import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, ConfigProvider, Input, Segmented, Skeleton, Tooltip } from 'antd';
import {
    ArrowDownOutlined, ArrowLeftOutlined, ArrowUpOutlined, AudioOutlined, CalendarOutlined, EditOutlined, ReloadOutlined, RightOutlined,
    SearchOutlined, SoundOutlined, TeamOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { resolveTimezone } from '../../utils/timezone';
import '../Teacher/Teacher.css';
import './ExamResults.css';

/* ══════════════════════════════════════════
   TCF RESULTS — how students do in the three exam simulations:
   CO (compréhension orale, scored in %) · EE (expression écrite, /20) · EO (expression orale, /20).
   Used by teachers (their batches) and admins (everyone, with a way back to exam management).
══════════════════════════════════════════ */

interface Props { mode: 'teacher' | 'admin'; onBack?: () => void }

type Skill = 'co' | 'ee' | 'eo';
interface Batch { id: number; name: string; french_level: string; start_date: string; end_date: string; teacher_first_name?: string; teacher_last_name?: string; student_count: number }
interface StudentListItem { id: number; first_name: string; last_name: string; email: string; username: string; batches: { id: number; name: string; french_level: string }[] }
interface SkillStats { attemptsCount: number; avgScore: number | null; bestScore: number | null; latestAttempt: string | null }
interface BatchStudent { id: number; first_name: string; last_name: string; email: string; username: string; co: SkillStats; ee: SkillStats; eo: SkillStats }
interface BatchDetail {
    batch: Batch;
    students: BatchStudent[];
    analytics: Record<Skill, { avgScore: number; totalAttempts: number; levelDistribution: Record<string, number> }>;
}
interface COAttempt { id: number; series_name: string; completed_at: string; time_spent_seconds: number; total_questions: number; correct_count: number; total_points: number; earned_points: number; score_percentage: number; cefr_level: string | null }
interface EEAttempt { id: number; combinaison_name: string; submitted_at: string; time_used_seconds: number; average_score: number; overall_level: string | null; task1_score: number; task2_score: number; task3_score: number; task1_level: string; task2_level: string; task3_level: string; month_name: string; year: number }
interface EOAttempt { id: number; partie_name: string | null; completed_at: string; duration_seconds: number; overall_score: number; tache1_score: number; tache2_score: number; tache3_score: number; month_name: string | null; year: number | null }
interface StudentDetail { student: { id: number; first_name: string; last_name: string; email: string; username: string; timezone?: string }; co: COAttempt[]; ee: EEAttempt[]; eo: EOAttempt[] }

type View = { kind: 'list' } | { kind: 'batch'; id: number } | { kind: 'student'; id: number; fromBatch: number | null };

const SKILLS: Record<Skill, { short: string; label: string; unit: '%' | '/20'; icon: React.ReactNode }> = {
    co: { short: 'CO', label: 'Compréhension orale', unit: '%', icon: <SoundOutlined /> },
    ee: { short: 'EE', label: 'Expression écrite', unit: '/20', icon: <EditOutlined /> },
    eo: { short: 'EO', label: 'Expression orale', unit: '/20', icon: <AudioOutlined /> },
};
const SKILL_KEYS: Skill[] = ['co', 'ee', 'eo'];
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));
/** Everything on one 0–100 scale for comparisons: CO is already a percentage, EE/EO are out of 20. */
const pctOf = (skill: Skill, v: unknown) => { const n = num(v); return n === null ? null : skill === 'co' ? n : (n / 20) * 100; };
const fmtScore = (skill: Skill, v: unknown) => {
    const n = num(v);
    if (n === null) return '—';
    return skill === 'co' ? `${Math.round(n)}%` : `${Math.round(n * 10) / 10}/20`;
};
const tone = (pct: number | null) => (pct === null ? 'is-none' : pct >= 70 ? 'is-good' : pct >= 50 ? 'is-warn' : 'is-bad');
const nameOf = (s: { first_name?: string; last_name?: string; username?: string; email?: string }) => `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username || s.email || 'Student';
const initialsOf = (s: { first_name?: string; last_name?: string }) => `${s.first_name?.[0] || ''}${s.last_name?.[0] || ''}`.toUpperCase() || '?';
/** Plain calendar dates (batch start/end) — formatted as stored, never shifted by a time zone. */
const fmtDay = (v?: string | null) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ''));
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
};
const fmtDuration = (s: unknown) => {
    const n = num(s);
    if (n === null || n <= 0) return '—';
    const m = Math.floor(n / 60);
    return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : m ? `${m} min ${Math.round(n % 60)} s` : `${Math.round(n)} s`;
};

/** Width of an element, kept in sync with resizes — charts draw at real pixel size. */
const useWidth = <T extends HTMLElement>() => {
    const ref = useRef<T>(null);
    const [width, setWidth] = useState(0);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        setWidth(el.clientWidth);
        const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return [ref, width] as const;
};

/* ─────────────── Progress chart: every attempt on a real time axis ─────────────── */
interface Point { skill: Skill; t: number; pct: number; label: string }
const ProgressChart: React.FC<{ points: Point[]; tz: string }> = ({ points, tz }) => {
    const [ref, width] = useWidth<HTMLDivElement>();
    const [hidden, setHidden] = useState<Set<Skill>>(new Set());
    const [hover, setHover] = useState<Point | null>(null);
    const H = 220;
    const pad = { l: 36, r: 12, t: 12, b: 26 };
    const shown = points.filter(p => !hidden.has(p.skill));
    const times = points.map(p => p.t);
    const t0 = Math.min(...times);
    const t1 = Math.max(...times);
    const span = t1 - t0 || 86_400_000;
    const innerW = Math.max(10, width - pad.l - pad.r);
    const x = (t: number) => pad.l + (t1 === t0 ? innerW / 2 : ((t - t0) / span) * innerW);
    const y = (pct: number) => pad.t + (1 - Math.min(100, Math.max(0, pct)) / 100) * (H - pad.t - pad.b);
    const day = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric' });
    const ticks = t1 === t0 ? [t0] : [t0, t0 + span / 2, t1];

    return (
        <div className="xr-chart">
            <div className="xr-legend" role="group" aria-label="Show skills">
                {SKILL_KEYS.map(k => {
                    const n = points.filter(p => p.skill === k).length;
                    return (
                        <button key={k} type="button" className={`xr-legend-item is-${k}${hidden.has(k) ? ' is-off' : ''}`} aria-pressed={!hidden.has(k)} disabled={!n}
                            onClick={() => setHidden(s => { const next = new Set(s); if (next.has(k)) next.delete(k); else next.add(k); return next; })}>
                            <i aria-hidden />{SKILLS[k].short}<em>{n}</em>
                        </button>
                    );
                })}
            </div>
            <div ref={ref} className="xr-chart-area" onMouseLeave={() => setHover(null)}>
                {width > 0 && (
                    <svg width={width} height={H} role="img" aria-label="Scores over time, as a percentage">
                        {[0, 50, 70, 100].map(g => (
                            <g key={g}>
                                <line x1={pad.l} x2={width - pad.r} y1={y(g)} y2={y(g)} className={`xr-gridline${g === 50 || g === 70 ? ' is-mark' : ''}`} />
                                <text x={pad.l - 8} y={y(g) + 4} textAnchor="end" className="xr-axis">{g}</text>
                            </g>
                        ))}
                        {ticks.map((t, i) => (
                            <text key={i} x={x(t)} y={H - 6} textAnchor={i === 0 && ticks.length > 1 ? 'start' : i === ticks.length - 1 && ticks.length > 1 ? 'end' : 'middle'} className="xr-axis">{day.format(new Date(t))}</text>
                        ))}
                        {SKILL_KEYS.filter(k => !hidden.has(k)).map(k => {
                            const series = shown.filter(p => p.skill === k).sort((a, b) => a.t - b.t);
                            if (!series.length) return null;
                            return (
                                <g key={k} className={`xr-series is-${k}`}>
                                    {series.length > 1 && <polyline points={series.map(p => `${x(p.t)},${y(p.pct)}`).join(' ')} />}
                                    {series.map((p, i) => (
                                        <circle key={i} cx={x(p.t)} cy={y(p.pct)} r={hover === p ? 6 : 4}
                                            onMouseEnter={() => setHover(p)} onFocus={() => setHover(p)} tabIndex={0} aria-label={`${SKILLS[k].short} ${p.label}`} />
                                    ))}
                                </g>
                            );
                        })}
                    </svg>
                )}
                {hover && (
                    <div className="xr-tip" style={{ left: Math.min(Math.max(x(hover.t), 90), width - 90), top: Math.max(0, y(hover.pct) - 62) }}>
                        <strong>{SKILLS[hover.skill].label}</strong>
                        <span>{hover.label}</span>
                        <em>{new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(hover.t))}</em>
                    </div>
                )}
            </div>
            <p className="xr-note">All three on one scale: CO in %, EE and EO converted from /20. Dotted lines mark 50% and 70%.</p>
        </div>
    );
};

/* ─────────────── Component ─────────────── */
const ExamResultsDashboard: React.FC<Props> = ({ mode, onBack }) => {
    const { apiCall, user } = useAuth();
    const tz = resolveTimezone(user?.timezone);
    const when = useMemo(() => new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }), [tz]);
    const whenDay = useMemo(() => new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' }), [tz]);
    const at = (iso?: string | null) => { const t = iso ? Date.parse(iso) : NaN; return Number.isNaN(t) ? '—' : when.format(new Date(t)); };
    const atDay = (iso?: string | null) => { const t = iso ? Date.parse(iso) : NaN; return Number.isNaN(t) ? '—' : whenDay.format(new Date(t)); };

    const [view, setView] = useState<View>({ kind: 'list' });
    const [tab, setTab] = useState<'batches' | 'students'>('batches');
    const [search, setSearch] = useState('');

    const [batches, setBatches] = useState<Batch[] | null>(null);
    const [students, setStudents] = useState<StudentListItem[] | null>(null);
    const [batchCache, setBatchCache] = useState<Record<number, BatchDetail>>({});
    const [studentCache, setStudentCache] = useState<Record<number, StudentDetail>>({});
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const [sortBy, setSortBy] = useState<'name' | Skill | 'inactive'>('name');
    const [attemptSkill, setAttemptSkill] = useState<Skill>('co');

    const fetchJson = useCallback(async (url: string) => {
        const res = await apiCall(url);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `The server answered ${res.status}.`);
        return data;
    }, [apiCall]);

    const run = useCallback(async (task: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try { await task(); } catch (e: any) { setError(e?.message || 'The results could not be loaded.'); } finally { setBusy(false); }
    }, []);

    const loadList = useCallback((which: 'batches' | 'students', force = false) => run(async () => {
        if (which === 'batches' && (force || !batches)) setBatches(await fetchJson('/tcf-results/batches'));
        if (which === 'students' && (force || !students)) setStudents(await fetchJson('/tcf-results/students'));
    }), [run, fetchJson, batches, students]);

    const openBatch = (id: number, force = false) => {
        setView({ kind: 'batch', id });
        setSortBy('name');
        if (force || !batchCache[id]) run(async () => { const data = await fetchJson(`/tcf-results/batch/${id}`); setBatchCache(c => ({ ...c, [id]: data })); });
        else setError(null);
    };
    const openStudent = (id: number, fromBatch: number | null, force = false) => {
        setView({ kind: 'student', id, fromBatch });
        if (force || !studentCache[id]) run(async () => {
            const data = await fetchJson(`/tcf-results/student/${id}`);
            setStudentCache(c => ({ ...c, [id]: data }));
            setAttemptSkill((['co', 'ee', 'eo'] as Skill[]).find(k => (data?.[k] || []).length) || 'co');
        });
        else setError(null);
    };

    // Lists load when their tab is first shown (batches on mount) and stay cached; Refresh reloads.
    useEffect(() => { if (view.kind === 'list') loadList(tab); }, [tab, view.kind]); // eslint-disable-line react-hooks/exhaustive-deps

    const refresh = () => {
        if (view.kind === 'list') loadList(tab, true);
        else if (view.kind === 'batch') openBatch(view.id, true);
        else openStudent(view.id, view.fromBatch, true);
    };
    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    /* ── Header (shared by every view) ── */
    const header = (title: React.ReactNode, subtitle: React.ReactNode, back?: { label: string; onClick: () => void }) => (
        <header className="tc-header xr-header">
            <div className="xr-header-main">
                {back && <Button className="xr-back" icon={<ArrowLeftOutlined />} onClick={() => { back.onClick(); scrollTop(); }} aria-label={back.label}>{back.label}</Button>}
                <div>
                    <div className="tc-overline">{mode === 'admin' ? 'Exam preparation' : 'Teacher space'}</div>
                    <h1 className="tc-title">{title}</h1>
                    <p className="tc-subtitle">{subtitle}</p>
                </div>
            </div>
            <div className="tc-actions">
                {mode === 'admin' && onBack && view.kind === 'list' && <Button icon={<ArrowLeftOutlined />} onClick={onBack}>Exam management</Button>}
                <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={busy} />} onClick={refresh} aria-label="Refresh" /></Tooltip>
            </div>
        </header>
    );
    const errorBar = error && (
        <div className="tc-alert" role="alert"><WarningOutlined /><span><strong>Couldn't load the results.</strong> {error}</span><Button size="small" onClick={refresh}>Retry</Button></div>
    );

    /* ═══════════ LIST ═══════════ */
    const renderList = () => {
        const q = search.trim().toLowerCase();
        const batchList = (batches || []).filter(b => !q || `${b.name} ${b.french_level} ${b.teacher_first_name || ''} ${b.teacher_last_name || ''}`.toLowerCase().includes(q));
        const studentList = (students || []).filter(s => !q || `${nameOf(s)} ${s.email} ${s.username} ${s.batches.map(b => b.name).join(' ')}`.toLowerCase().includes(q));
        const loadingList = tab === 'batches' ? !batches : !students;
        return (
            <>
                {header('TCF results', 'Compréhension orale, expression écrite and expression orale — how each batch and student is progressing.')}
                {errorBar}
                <section className="tc-card xr-list">
                    <div className="xr-toolbar">
                        <Segmented value={tab} onChange={v => { setTab(v as 'batches' | 'students'); setSearch(''); }} options={[
                            { value: 'batches', label: <span className="xr-seg"><TeamOutlined /> Batches{batches ? <em>{batches.length}</em> : null}</span> },
                            { value: 'students', label: <span className="xr-seg"><UserOutlined /> Students{students ? <em>{students.length}</em> : null}</span> },
                        ]} />
                        <Input className="xr-search" allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} value={search} onChange={e => setSearch(e.target.value)}
                            placeholder={tab === 'batches' ? 'Search batches' : 'Search students or batches'} aria-label="Search" />
                    </div>

                    {loadingList ? (
                        <div className="xr-cards">{[0, 1, 2].map(i => <div key={i} className="xr-card"><Skeleton active title={{ width: '60%' }} paragraph={{ rows: 3 }} /></div>)}</div>
                    ) : tab === 'batches' ? (
                        batchList.length === 0 ? (
                            <div className="xr-empty"><TeamOutlined /><strong>{batches?.length ? 'No batches match' : 'No batches yet'}</strong><span>{batches?.length ? 'Try another search.' : mode === 'teacher' ? 'Batches assigned to you appear here.' : 'Create batches to follow their exam results.'}</span></div>
                        ) : (
                            <div className="xr-cards">
                                {batchList.map(b => (
                                    <button key={b.id} type="button" className="xr-card is-batch" onClick={() => { openBatch(b.id); scrollTop(); }}>
                                        <span className="xr-card-top">
                                            <span className="xr-level">{b.french_level || '—'}</span>
                                            <span className="xr-card-title">{b.name}</span>
                                        </span>
                                        <span className="xr-card-meta">
                                            <span><TeamOutlined /> {b.student_count} {b.student_count === 1 ? 'student' : 'students'}</span>
                                            <span><CalendarOutlined /> {fmtDay(b.start_date)} – {fmtDay(b.end_date)}</span>
                                            {mode === 'admin' && (b.teacher_first_name || b.teacher_last_name) && <span><UserOutlined /> {`${b.teacher_first_name || ''} ${b.teacher_last_name || ''}`.trim()}</span>}
                                        </span>
                                        <span className="xr-card-go">View results <RightOutlined /></span>
                                    </button>
                                ))}
                            </div>
                        )
                    ) : studentList.length === 0 ? (
                        <div className="xr-empty"><UserOutlined /><strong>{students?.length ? 'No students match' : 'No students yet'}</strong><span>{students?.length ? 'Try another search.' : 'Students enrolled in your batches appear here.'}</span></div>
                    ) : (
                        <ul className="xr-people">
                            {studentList.map(s => (
                                <li key={s.id}>
                                    <button type="button" className="xr-person" onClick={() => { openStudent(s.id, null); scrollTop(); }}>
                                        <span className="xr-av">{initialsOf(s)}</span>
                                        <span className="xr-person-id"><strong>{nameOf(s)}</strong><em>{s.email}</em></span>
                                        <span className="xr-chips">
                                            {s.batches.length ? s.batches.slice(0, 3).map(b => <span key={b.id} className="xr-chip">{b.name}<b>{b.french_level}</b></span>) : <span className="xr-muted">No batch</span>}
                                            {s.batches.length > 3 && <span className="xr-chip">+{s.batches.length - 3}</span>}
                                        </span>
                                        <RightOutlined className="xr-go" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </>
        );
    };

    /* ═══════════ BATCH ═══════════ */
    const renderBatch = (id: number) => {
        const detail = batchCache[id];
        const known = detail?.batch ?? batches?.find(b => b.id === id);
        const back = { label: 'All batches', onClick: () => setView({ kind: 'list' }) };
        if (!detail) {
            return (
                <>
                    {header(known?.name || 'Batch results', 'Loading the latest attempts…', back)}
                    {errorBar}
                    <div className="xr-kpis">{[0, 1, 2, 3].map(i => <div key={i} className="xr-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                    <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>
                </>
            );
        }
        const { batch, students: roster, analytics } = detail;
        const active = roster.filter(s => SKILL_KEYS.some(k => s[k].attemptsCount > 0)).length;
        const lastActivity = (s: BatchStudent) => Math.max(0, ...SKILL_KEYS.map(k => Date.parse(s[k].latestAttempt || '') || 0));
        const sorted = [...roster].sort((a, b) => {
            if (sortBy === 'name') return nameOf(a).localeCompare(nameOf(b));
            if (sortBy === 'inactive') return lastActivity(a) - lastActivity(b);
            return (pctOf(sortBy, b[sortBy].avgScore) ?? -1) - (pctOf(sortBy, a[sortBy].avgScore) ?? -1);
        });

        return (
            <>
                {header(batch.name, <>{batch.french_level && <span className="xr-level is-inline">{batch.french_level}</span>} {roster.length} {roster.length === 1 ? 'student' : 'students'} · {fmtDay(batch.start_date)} – {fmtDay(batch.end_date)}{mode === 'admin' && batch.teacher_first_name ? ` · ${batch.teacher_first_name} ${batch.teacher_last_name || ''}` : ''}</>, back)}
                {errorBar}

                <section className="xr-kpis" aria-label="Class averages">
                    {SKILL_KEYS.map(k => {
                        const a = analytics[k];
                        const pct = a.totalAttempts ? pctOf(k, a.avgScore) : null;
                        return (
                            <div key={k} className={`xr-kpi is-${k}`}>
                                <span className="xr-kpi-label"><span className="xr-kpi-ic">{SKILLS[k].icon}</span>{SKILLS[k].label}</span>
                                <strong className={tone(pct)}>{a.totalAttempts ? fmtScore(k, a.avgScore) : '—'}</strong>
                                <span className="xr-meter"><i style={{ width: `${pct ?? 0}%` }} /></span>
                                <em>{a.totalAttempts ? `Class average · ${a.totalAttempts} ${a.totalAttempts === 1 ? 'attempt' : 'attempts'}` : 'No attempts yet'}</em>
                            </div>
                        );
                    })}
                    <div className="xr-kpi is-part">
                        <span className="xr-kpi-label"><span className="xr-kpi-ic"><TeamOutlined /></span>Participation</span>
                        <strong>{active}<small> / {roster.length}</small></strong>
                        <span className="xr-meter"><i style={{ width: `${roster.length ? (active / roster.length) * 100 : 0}%` }} /></span>
                        <em>{roster.length - active ? `${roster.length - active} haven't tried any simulation` : 'Everyone has practised'}</em>
                    </div>
                </section>

                <div className="xr-grid">
                    {/* Student × skill table */}
                    <section className="tc-card xr-table-card">
                        <header className="tc-card-head">
                            <span className="tc-card-title">Students</span>
                            <Segmented size="small" value={sortBy} onChange={v => setSortBy(v as typeof sortBy)} options={[
                                { value: 'name', label: 'Name' }, { value: 'co', label: 'CO' }, { value: 'ee', label: 'EE' }, { value: 'eo', label: 'EO' }, { value: 'inactive', label: 'Least active' },
                            ]} />
                        </header>
                        {roster.length === 0 ? <p className="tc-muted-line">No students are enrolled in this batch.</p> : (
                            <div className="xr-table" role="table" aria-label="Scores by student">
                                <div className="xr-trow is-head" role="row">
                                    <span role="columnheader">Student</span>
                                    {SKILL_KEYS.map(k => <span key={k} role="columnheader">{SKILLS[k].short} <em>avg · best</em></span>)}
                                    <span role="columnheader">Last activity</span>
                                </div>
                                {sorted.map(s => {
                                    const last = lastActivity(s);
                                    return (
                                        <button key={s.id} type="button" className="xr-trow" role="row" onClick={() => { openStudent(s.id, batch.id); scrollTop(); }}>
                                            <span className="xr-person-cell" role="cell">
                                                <span className="xr-av is-sm">{initialsOf(s)}</span>
                                                <span className="xr-person-id"><strong>{nameOf(s)}</strong><em>{s.email}</em></span>
                                            </span>
                                            {SKILL_KEYS.map(k => {
                                                const st = s[k];
                                                const avgPct = pctOf(k, st.avgScore);
                                                return (
                                                    <span key={k} className="xr-skill-cell" data-skill={SKILLS[k].short} role="cell">
                                                        {st.attemptsCount ? (
                                                            <>
                                                                <span className="xr-skill-top"><b className={`xr-score ${tone(avgPct)}`}>{fmtScore(k, st.avgScore)}</b><em>best {fmtScore(k, st.bestScore)}</em></span>
                                                                <span className="xr-meter is-sm"><i className={tone(pctOf(k, st.bestScore))} style={{ width: `${pctOf(k, st.bestScore) ?? 0}%` }} /></span>
                                                                <em className="xr-attempts">{st.attemptsCount} {st.attemptsCount === 1 ? 'attempt' : 'attempts'}</em>
                                                            </>
                                                        ) : <span className="xr-muted">Not attempted</span>}
                                                    </span>
                                                );
                                            })}
                                            <span className="xr-last" role="cell">{last ? atDay(new Date(last).toISOString()) : <span className="xr-muted">Never</span>}<RightOutlined /></span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* CEFR levels */}
                    <section className="tc-card">
                        <header className="tc-card-head"><span className="tc-card-title">CEFR levels reached</span></header>
                        <div className="tc-card-body">
                            {SKILL_KEYS.map(k => {
                                const dist = analytics[k].levelDistribution || {};
                                const total = Object.values(dist).reduce((sum, n) => sum + Number(n || 0), 0);
                                return (
                                    <div key={k} className="xr-cefr">
                                        <div className="xr-cefr-head"><strong>{SKILLS[k].label}</strong><em>{total ? `${total} ${total === 1 ? 'attempt' : 'attempts'}` : 'No attempts'}</em></div>
                                        <div className="xr-stack" aria-label={CEFR.map(l => `${l}: ${dist[l] || 0}`).join(', ')}>
                                            {total ? CEFR.filter(l => dist[l]).map(l => (
                                                <Tooltip key={l} title={`${l}: ${dist[l]} (${Math.round((dist[l] / total) * 100)}%)`}><i className={`is-${l.toLowerCase()}`} style={{ flexGrow: dist[l] }}>{(dist[l] / total) >= 0.12 ? l : ''}</i></Tooltip>
                                            )) : <i className="is-empty" style={{ flexGrow: 1 }} />}
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="xr-cefr-legend">{CEFR.map(l => <span key={l}><i className={`is-${l.toLowerCase()}`} />{l}</span>)}</div>
                            <p className="xr-note">EO levels are estimated from the score out of 20.</p>
                        </div>
                    </section>
                </div>
            </>
        );
    };

    /* ═══════════ STUDENT ═══════════ */
    const renderStudent = (id: number, fromBatch: number | null) => {
        const detail = studentCache[id];
        const listed = students?.find(s => s.id === id) ?? batchCache[fromBatch ?? -1]?.students.find(s => s.id === id);
        const back = fromBatch !== null
            ? { label: batchCache[fromBatch]?.batch.name || 'Batch', onClick: () => setView({ kind: 'batch', id: fromBatch }) }
            : { label: 'All students', onClick: () => { setView({ kind: 'list' }); setTab('students'); } };
        if (!detail) {
            return (
                <>
                    {header(listed ? nameOf(listed) : 'Student results', 'Loading attempts…', back)}
                    {errorBar}
                    <div className="xr-kpis is-three">{[0, 1, 2].map(i => <div key={i} className="xr-kpi"><Skeleton active title={false} paragraph={{ rows: 3 }} /></div>)}</div>
                    <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 8 }} /></div>
                </>
            );
        }
        const { student, co, ee, eo } = detail;
        const byskill = { co, ee, eo } as const;
        const scoreOf = (k: Skill, a: any) => (k === 'co' ? a.score_percentage : k === 'ee' ? a.average_score : a.overall_score);
        const dateOf = (k: Skill, a: any) => (k === 'ee' ? a.submitted_at : a.completed_at);
        const points: Point[] = SKILL_KEYS.flatMap(k => (byskill[k] as any[]).map(a => ({
            skill: k, t: Date.parse(dateOf(k, a)), pct: pctOf(k, scoreOf(k, a)) ?? 0, label: fmtScore(k, scoreOf(k, a)),
        }))).filter(p => !Number.isNaN(p.t));
        const batchesOf = students?.find(s => s.id === id)?.batches ?? [];

        const summary = (k: Skill) => {
            const list = byskill[k] as any[];   // newest first from the API
            const scores = list.map(a => num(scoreOf(k, a))).filter((n): n is number => n !== null);
            const best = scores.length ? Math.max(...scores) : null;
            const avg = scores.length ? scores.reduce((s, n) => s + n, 0) / scores.length : null;
            const trend = scores.length >= 2 ? scores[0] - scores[1] : null;
            const level = k === 'co' ? list[0]?.cefr_level : k === 'ee' ? list[0]?.overall_level : null;
            return { count: list.length, best, avg, trend, level, latest: list[0] ? dateOf(k, list[0]) : null };
        };

        return (
            <>
                {header(nameOf(student), <>{student.email}{batchesOf.length ? ` · ${batchesOf.map(b => b.name).join(', ')}` : ''}</>, back)}
                {errorBar}

                <section className="xr-kpis is-three" aria-label="Best scores">
                    {SKILL_KEYS.map(k => {
                        const s = summary(k);
                        const bestPct = pctOf(k, s.best);
                        const trendUnit = k === 'co' ? '%' : '';
                        return (
                            <div key={k} className={`xr-kpi is-${k}`}>
                                <span className="xr-kpi-label"><span className="xr-kpi-ic">{SKILLS[k].icon}</span>{SKILLS[k].label}</span>
                                <span className="xr-kpi-row">
                                    <strong className={tone(bestPct)}>{fmtScore(k, s.best)}</strong>
                                    {s.level && <span className="xr-level is-inline">{s.level}</span>}
                                    {s.trend !== null && Math.abs(s.trend) >= (k === 'co' ? 1 : 0.1) && (
                                        <Tooltip title="Latest attempt compared with the one before">
                                            <span className={`xr-trend ${s.trend > 0 ? 'is-up' : 'is-down'}`}>{s.trend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{Math.abs(Math.round(s.trend * (k === 'co' ? 1 : 10)) / (k === 'co' ? 1 : 10))}{trendUnit}</span>
                                        </Tooltip>
                                    )}
                                </span>
                                <span className="xr-meter"><i style={{ width: `${bestPct ?? 0}%` }} /></span>
                                <em>{s.count ? `Best of ${s.count} · average ${fmtScore(k, s.avg)} · last ${atDay(s.latest)}` : 'No attempts yet'}</em>
                            </div>
                        );
                    })}
                </section>

                <section className="tc-card">
                    <header className="tc-card-head"><span className="tc-card-title">Progress over time</span></header>
                    <div className="tc-card-body">
                        {points.length ? <ProgressChart points={points} tz={tz} /> : <p className="tc-muted-line">No completed simulations yet — the chart fills in as the student practises.</p>}
                    </div>
                </section>

                <section className="tc-card xr-attempts-card">
                    <header className="tc-card-head">
                        <span className="tc-card-title">Attempts</span>
                        <Segmented size="small" value={attemptSkill} onChange={v => setAttemptSkill(v as Skill)} options={SKILL_KEYS.map(k => ({ value: k, label: `${SKILLS[k].short} · ${byskill[k].length}` }))} />
                    </header>
                    {byskill[attemptSkill].length === 0 ? (
                        <p className="tc-muted-line">No {SKILLS[attemptSkill].label.toLowerCase()} attempts yet.</p>
                    ) : (
                        <ul className="xr-attempts">
                            {attemptSkill === 'co' && co.map(a => {
                                const pct = num(a.score_percentage);
                                return (
                                    <li key={a.id} className="xr-attempt">
                                        <span className="xr-attempt-main"><strong>{a.series_name}</strong><em>{at(a.completed_at)} · {fmtDuration(a.time_spent_seconds)}</em></span>
                                        <span className="xr-attempt-facts"><span>{a.correct_count}/{a.total_questions} correct</span><span>{a.earned_points}/{a.total_points} pts</span></span>
                                        {a.cefr_level ? <span className="xr-level is-inline">{a.cefr_level}</span> : <span />}
                                        <b className={`xr-score is-big ${tone(pct)}`}>{fmtScore('co', pct)}</b>
                                    </li>
                                );
                            })}
                            {attemptSkill === 'ee' && ee.map(a => (
                                <li key={a.id} className="xr-attempt">
                                    <span className="xr-attempt-main"><strong>{a.combinaison_name}</strong><em>{[a.month_name, a.year].filter(Boolean).join(' ')} · {at(a.submitted_at)} · {fmtDuration(a.time_used_seconds)}</em></span>
                                    <span className="xr-attempt-facts">
                                        {[1, 2, 3].map(i => <span key={i}>T{i} {fmtScore('ee', (a as any)[`task${i}_score`])}{(a as any)[`task${i}_level`] ? ` · ${(a as any)[`task${i}_level`]}` : ''}</span>)}
                                    </span>
                                    {a.overall_level ? <span className="xr-level is-inline">{a.overall_level}</span> : <span />}
                                    <b className={`xr-score is-big ${tone(pctOf('ee', a.average_score))}`}>{fmtScore('ee', a.average_score)}</b>
                                </li>
                            ))}
                            {attemptSkill === 'eo' && eo.map(a => (
                                <li key={a.id} className="xr-attempt">
                                    <span className="xr-attempt-main"><strong>{a.partie_name || 'Free practice'}</strong><em>{[a.month_name, a.year].filter(Boolean).join(' ')}{a.month_name ? ' · ' : ''}{at(a.completed_at)} · {fmtDuration(a.duration_seconds)}</em></span>
                                    <span className="xr-attempt-facts">
                                        {[1, 2, 3].map(i => <span key={i}>T{i} {fmtScore('eo', (a as any)[`tache${i}_score`])}</span>)}
                                    </span>
                                    <span />
                                    <b className={`xr-score is-big ${tone(pctOf('eo', a.overall_score))}`}>{fmtScore('eo', a.overall_score)}</b>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </>
        );
    };

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            <div className={`tc xr is-${mode}`}>
                {view.kind === 'list' ? renderList() : view.kind === 'batch' ? renderBatch(view.id) : renderStudent(view.id, view.fromBatch)}
            </div>
        </ConfigProvider>
    );
};

export default ExamResultsDashboard;
