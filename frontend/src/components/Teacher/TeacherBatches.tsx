import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, Drawer, Input, Segmented, Select, Skeleton, Tooltip, message } from 'antd';
import {
    BarChartOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseOutlined, FlagOutlined,
    MailOutlined, ReloadOutlined, RiseOutlined, SearchOutlined, TeamOutlined, UserOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';
import BatchInsights from './BatchInsights';
import { fmtPct, initialsOf, pctOf, studentName, toneOf } from '../Insights/insightsModel';
import type { InsightsData, StudentRow } from '../Insights/insightsModel';
import { PASS_MARK } from '../../utils/grading';
import { resolveTimezone, timezoneLabel } from '../../utils/timezone';
import './Teacher.css';

/* ══════════════════════════════════════════
   MY BATCHES — the classes this teacher runs, their roster and their results.
   Insights are loaded here once and handed to <BatchInsights data=… /> so that
   clicking a student in the leaderboard or gradebook can open their report.
══════════════════════════════════════════ */

interface Batch {
    id: number;
    name: string;
    french_level: string;
    start_date: string;
    end_date: string;
    teacher_first_name: string;
    teacher_last_name: string;
    student_count: number;
    created_at: string;
}
interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    enrolled_at: string;
}

type Status = 'active' | 'upcoming' | 'completed';
type SortKey = 'recent' | 'name' | 'students' | 'start';

const STATUS: Record<Status, { label: string; icon: React.ReactNode }> = {
    active: { label: 'Active', icon: <CheckCircleOutlined /> },
    upcoming: { label: 'Upcoming', icon: <ClockCircleOutlined /> },
    completed: { label: 'Completed', icon: <FlagOutlined /> },
};

const DAY = 86_400_000;
/** Today as YYYY-MM-DD in the viewer's own calendar — start/end dates are plain dates, never instants. */
const todayKey = () => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};
const dayKey = (v?: string | null) => (v ? String(v).slice(0, 10) : '');
const utcOf = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return y && m && d ? Date.UTC(y, m - 1, d) : NaN;
};
/** Plain date — formatted as written, with no timezone shift. */
const fmtDay = (v?: string | null) => {
    const t = utcOf(dayKey(v));
    return Number.isNaN(t) ? '—' : new Date(t).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
};

const statusOf = (b: Batch): Status => {
    const today = todayKey();
    const start = dayKey(b.start_date);
    const end = dayKey(b.end_date);
    if (start && today < start) return 'upcoming';
    if (end && today > end) return 'completed';
    return 'active';
};

/** How far through the course we are, plus the sentence that explains it. */
const progressOf = (b: Batch, status: Status) => {
    const start = utcOf(dayKey(b.start_date));
    const end = utcOf(dayKey(b.end_date));
    const today = utcOf(todayKey());
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
    const total = Math.round((end - start) / DAY) + 1;
    if (status === 'upcoming') {
        const days = Math.round((start - today) / DAY);
        return { pct: 0, note: days === 0 ? 'Starts today' : `Starts in ${days} ${days === 1 ? 'day' : 'days'}`, right: `${total} days` };
    }
    if (status === 'completed') return { pct: 100, note: 'Finished', right: `${total} days` };
    const done = Math.round((today - start) / DAY) + 1;
    const left = total - done;
    return { pct: Math.min(100, Math.max(2, (done / total) * 100)), note: `Day ${done} of ${total}`, right: left <= 0 ? 'Last day' : `${left} ${left === 1 ? 'day' : 'days'} left` };
};

const TeacherBatches: React.FC = () => {
    const { apiCall } = useAuth();
    const r = useResponsive();
    const [msg, msgHolder] = message.useMessage();
    const tz = resolveTimezone(null);

    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [status, setStatus] = useState<Status | 'all'>('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortKey>('recent');

    /* roster */
    const [roster, setRoster] = useState<Batch | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState<string | null>(null);
    const [rosterSearch, setRosterSearch] = useState('');

    /* insights */
    const [insBatch, setInsBatch] = useState<Batch | null>(null);
    const [insData, setInsData] = useState<InsightsData | null>(null);
    const [insLoading, setInsLoading] = useState(false);
    const [insError, setInsError] = useState<string | null>(null);
    const [sheet, setSheet] = useState<StudentRow | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await apiCall('/batches');
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            const data = await res.json();
            const rows: any[] = Array.isArray(data) ? data : data?.batches || [];
            setBatches(rows.map(b => ({ ...b, student_count: Number(b?.student_count ?? 0) })));
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Could not load your batches.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);

    const fmtStamp = useMemo(() => {
        const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', year: 'numeric' });
        return (iso?: string | null) => {
            if (!iso) return '—';
            const d = new Date(iso);
            return Number.isNaN(d.getTime()) ? '—' : f.format(d);
        };
    }, [tz]);

    /* ── Figures ── */
    const counts = useMemo(() => {
        const c = { all: batches.length, active: 0, upcoming: 0, completed: 0, students: 0 };
        batches.forEach(b => { c[statusOf(b)]++; c.students += b.student_count; });
        return c;
    }, [batches]);

    const list = useMemo(() => {
        const q = search.trim().toLowerCase();
        const out = batches.filter(b => {
            if (status !== 'all' && statusOf(b) !== status) return false;
            if (q && !`${b.name} ${b.french_level}`.toLowerCase().includes(q)) return false;
            return true;
        });
        return out.sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'students') return b.student_count - a.student_count;
            if (sort === 'start') return dayKey(b.start_date).localeCompare(dayKey(a.start_date));
            return (new Date(b.created_at).getTime() || 0) - (new Date(a.created_at).getTime() || 0);
        });
    }, [batches, status, search, sort]);

    /* ── Roster ── */
    const openRoster = async (b: Batch) => {
        setRoster(b);
        setStudents([]);
        setRosterSearch('');
        setStudentsError(null);
        setStudentsLoading(true);
        try {
            const res = await apiCall(`/batches/${b.id}`);
            if (!res.ok) throw new Error(`The server answered ${res.status}.`);
            const data = await res.json();
            setStudents(Array.isArray(data.students) ? data.students : []);
        } catch (e: any) {
            setStudentsError(e?.message || 'Could not load the student list.');
        } finally {
            setStudentsLoading(false);
        }
    };

    const rosterList = useMemo(() => {
        const q = rosterSearch.trim().toLowerCase();
        if (!q) return students;
        return students.filter(s => `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(q));
    }, [students, rosterSearch]);

    /* ── Insights (loaded here so student rows can open a report) ── */
    const openInsights = async (b: Batch) => {
        setInsBatch(b);
        setInsData(null);
        setSheet(null);
        setInsError(null);
        setInsLoading(true);
        try {
            const res = await apiCall(`/batches/${b.id}/insights`);
            if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || `The server answered ${res.status}.`);
            setInsData(await res.json());
        } catch (e: any) {
            setInsError(e?.message || 'Could not load the insights for this batch.');
        } finally {
            setInsLoading(false);
        }
    };

    const copyEmails = async (people: { email: string }[]) => {
        const text = people.map(p => p.email).filter(Boolean).join(', ');
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            msg.success(`${people.length} email ${people.length === 1 ? 'address' : 'addresses'} copied`);
        } catch {
            msg.error('Your browser blocked the clipboard. Select the addresses manually instead.');
        }
    };

    /* ── The student report behind a leaderboard / gradebook row ── */
    const sheetRows = useMemo(() => {
        if (!sheet || !insData) return [];
        const done = new Map(sheet.breakdown.map(b => [b.quiz_id, b]));
        return insData.quizzes.map(q => {
            const b = done.get(q.quiz_id);
            return { id: q.quiz_id, title: q.quiz_title, pct: b ? pctOf(b) : null, submitted: !!b, at: b?.submitted_at ?? null, classAvg: q.avg_percentage ?? null };
        });
    }, [sheet, insData]);
    const sheetAvg = useMemo(() => {
        const vals = sheetRows.filter(x => x.submitted && x.pct !== null).map(x => x.pct as number);
        return vals.length ? vals.reduce((a, v) => a + v, 0) / vals.length : null;
    }, [sheetRows]);

    const drawerWidth = r.isMobile ? '100%' : Math.min(1080, Math.max(560, r.width - 72));
    const sheetWidth = r.isMobile ? '100%' : Math.min(560, r.width - 48);

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="tc" aria-busy="true">
                <div className="tc-header"><div><Skeleton.Input active size="small" style={{ width: 110, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 190, height: 26 }} /></div></div></div>
                <div className="tc-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="tc-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 6 }} /></div>
            </div>
        );
    }

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            {msgHolder}
            <div className="tc">
                {/* ── Header ── */}
                <header className="tc-header">
                    <div>
                        <div className="tc-overline">Teacher space</div>
                        <h1 className="tc-title">My Batches</h1>
                        <p className="tc-subtitle">
                            The classes you teach, who is enrolled and how they are doing. Dates shown as scheduled; enrolment times in {timezoneLabel(null)}.
                        </p>
                    </div>
                    <div className="tc-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                    </div>
                </header>

                {error && (
                    <div className="tc-alert" role="alert">
                        <WarningOutlined /><span><strong>Couldn't load your batches.</strong> {error}</span>
                        <Button size="small" onClick={() => { setRefreshing(true); load(); }}>Retry</Button>
                    </div>
                )}

                {/* ── KPIs (each one filters the list) ── */}
                <section className="tc-kpis" aria-label="Summary">
                    <button type="button" className={`tc-kpi${status === 'all' ? ' is-on' : ''}`} onClick={() => setStatus('all')}>
                        <span className="tc-kpi-ic"><TeamOutlined /></span>
                        <span className="tc-kpi-label">Batches</span>
                        <span className="tc-kpi-value">{counts.all}</span>
                        <span className="tc-kpi-sub">{status === 'all' ? 'Showing all' : 'Show all'}</span>
                    </button>
                    <button type="button" className={`tc-kpi is-green${status === 'active' ? ' is-on' : ''}`} onClick={() => setStatus('active')}>
                        <span className="tc-kpi-ic"><CheckCircleOutlined /></span>
                        <span className="tc-kpi-label">Active now</span>
                        <span className="tc-kpi-value">{counts.active}</span>
                        <span className="tc-kpi-sub">Running today</span>
                    </button>
                    <button type="button" className={`tc-kpi is-amber${status === 'upcoming' ? ' is-on' : ''}`} onClick={() => setStatus('upcoming')}>
                        <span className="tc-kpi-ic"><ClockCircleOutlined /></span>
                        <span className="tc-kpi-label">Upcoming</span>
                        <span className="tc-kpi-value">{counts.upcoming}</span>
                        <span className="tc-kpi-sub">Not started yet</span>
                    </button>
                    <button type="button" className={`tc-kpi is-slate${status === 'completed' ? ' is-on' : ''}`} onClick={() => setStatus('completed')}>
                        <span className="tc-kpi-ic"><FlagOutlined /></span>
                        <span className="tc-kpi-label">Completed</span>
                        <span className="tc-kpi-value">{counts.completed}</span>
                        <span className="tc-kpi-sub">Past their end date</span>
                    </button>
                    <div className="tc-kpi">
                        <span className="tc-kpi-ic"><UserOutlined /></span>
                        <span className="tc-kpi-label">Students</span>
                        <span className="tc-kpi-value">{counts.students}</span>
                        <span className="tc-kpi-sub">Across every batch</span>
                    </div>
                </section>

                {/* ── The batches ── */}
                <section className="tc-card">
                    <div className="tc-toolbar">
                        <div className="tc-card-title">
                            {status === 'all' ? 'All batches' : STATUS[status].label}
                            <span className="tc-count">{list.length}</span>
                        </div>
                        <div className="tc-toolbar-filters">
                            <Input className="tc-search" allowClear prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Search batches" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search batches" />
                            {!r.isMobile && (
                                <Segmented<Status | 'all'> value={status} onChange={setStatus} options={[
                                    { value: 'all', label: 'All' }, { value: 'active', label: 'Active' },
                                    { value: 'upcoming', label: 'Upcoming' }, { value: 'completed', label: 'Done' },
                                ]} />
                            )}
                            <Select<SortKey> className="tc-sort" value={sort} onChange={setSort} aria-label="Sort" options={[
                                { value: 'recent', label: 'Recently created' }, { value: 'start', label: 'Latest start date' },
                                { value: 'name', label: 'Name (A–Z)' }, { value: 'students', label: 'Most students' },
                            ]} />
                        </div>
                    </div>

                    <div className="tc-card-body">
                        {list.length === 0 ? (
                            <div className="tc-state">
                                <TeamOutlined />
                                <strong>{batches.length === 0 ? 'No batches assigned to you yet' : 'No batches match these filters'}</strong>
                                <span>{batches.length === 0 ? 'An administrator assigns batches to teachers. Once one is yours, it appears here.' : 'Try another status or search term.'}</span>
                                {batches.length > 0 && <Button size="small" onClick={() => { setStatus('all'); setSearch(''); }}>Clear filters</Button>}
                            </div>
                        ) : (
                            <div className="tc-batches">
                                {list.map(b => {
                                    const st = statusOf(b);
                                    const prog = progressOf(b, st);
                                    return (
                                        <article key={b.id} className={`tc-batch is-${st}`}>
                                            <div className="tc-batch-top">
                                                <span className="tc-batch-ic">{b.french_level || '—'}</span>
                                                <div className="tc-batch-id">
                                                    <h3 title={b.name}>{b.name}</h3>
                                                    <em>{`${b.teacher_first_name || ''} ${b.teacher_last_name || ''}`.trim() || 'No teacher set'}</em>
                                                </div>
                                                <span className={`tc-status is-${st}`}>{STATUS[st].icon} {STATUS[st].label}</span>
                                            </div>

                                            <div className="tc-batch-meta">
                                                <span><CalendarOutlined /> {fmtDay(b.start_date)} – {fmtDay(b.end_date)}</span>
                                                <span><TeamOutlined /> {b.student_count} {b.student_count === 1 ? 'student' : 'students'}</span>
                                            </div>

                                            {prog && (
                                                <div className="tc-prog">
                                                    <div className="tc-prog-top"><span>{prog.note}</span><span>{prog.right}</span></div>
                                                    <div className="tc-prog-track"><i style={{ width: `${prog.pct}%` }} /></div>
                                                </div>
                                            )}

                                            <div className="tc-batch-foot">
                                                <Button icon={<TeamOutlined />} onClick={() => openRoster(b)} disabled={b.student_count === 0}>
                                                    {b.student_count === 0 ? 'No students' : 'Students'}
                                                </Button>
                                                <Button type="primary" icon={<BarChartOutlined />} onClick={() => openInsights(b)}>Insights</Button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Roster ── */}
                <Drawer
                    open={!!roster}
                    onClose={() => setRoster(null)}
                    placement="right"
                    width={r.isMobile ? '100%' : Math.min(560, r.width - 48)}
                    rootClassName="tc-drawer"
                    destroyOnHidden
                    closeIcon={<CloseOutlined />}
                    title={<span className="tc-dtitle"><strong>{roster?.name}</strong><em>Student roster</em></span>}
                    extra={students.length > 0 ? <Button size="small" icon={<MailOutlined />} onClick={() => copyEmails(rosterList)}>Copy emails</Button> : undefined}
                >
                    {roster && (
                        <>
                            <div className="tc-pills">
                                <span className="tc-pill">Level <b>{roster.french_level || '—'}</b></span>
                                <span className="tc-pill">Status <b>{STATUS[statusOf(roster)].label}</b></span>
                                <span className="tc-pill">Runs <b>{fmtDay(roster.start_date)} – {fmtDay(roster.end_date)}</b></span>
                            </div>

                            {studentsLoading ? (
                                <div className="tc-card tc-pad"><Skeleton active avatar paragraph={{ rows: 4 }} /></div>
                            ) : studentsError ? (
                                <div className="tc-alert" role="alert">
                                    <WarningOutlined /><span>{studentsError}</span>
                                    <Button size="small" onClick={() => openRoster(roster)}>Retry</Button>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="tc-state"><TeamOutlined /><strong>No students enrolled</strong><span>An administrator can add students to this batch.</span></div>
                            ) : (
                                <div className="tc-card">
                                    <div className="tc-toolbar">
                                        <div className="tc-card-title">Enrolled<span className="tc-count">{rosterList.length}</span></div>
                                        <Input className="tc-search" allowClear size="small" prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} placeholder="Find a student" value={rosterSearch} onChange={e => setRosterSearch(e.target.value)} aria-label="Find a student" />
                                    </div>
                                    <div className="tc-card-body is-flush">
                                        {rosterList.length === 0 ? (
                                            <div className="tc-muted-line">No student matches “{rosterSearch}”.</div>
                                        ) : (
                                            <ul className="tc-people">
                                                {rosterList.map(s => {
                                                    const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email;
                                                    return (
                                                        <li key={s.id}>
                                                            <div className="tc-person">
                                                                <span className="tc-av">{initialsOf(name)}</span>
                                                                <span className="tc-cell">
                                                                    <strong>{name}</strong>
                                                                    <em><a href={`mailto:${s.email}`}>{s.email}</a></em>
                                                                </span>
                                                                <span className="tc-when"><span>Joined</span><b>{fmtStamp(s.enrolled_at)}</b></span>
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Drawer>

                {/* ── Insights ── */}
                <Drawer
                    open={!!insBatch}
                    onClose={() => { setInsBatch(null); setSheet(null); }}
                    placement="right"
                    width={drawerWidth}
                    rootClassName="tc-drawer is-wide"
                    destroyOnHidden
                    closeIcon={<CloseOutlined />}
                    title={<span className="tc-dtitle"><strong>{insBatch?.name}</strong><em>Performance · {insBatch ? `${insBatch.french_level || '—'} · ${insBatch.student_count} ${insBatch.student_count === 1 ? 'student' : 'students'}` : ''}</em></span>}
                    extra={insBatch && insBatch.student_count > 0 ? <Button size="small" icon={<TeamOutlined />} onClick={() => openRoster(insBatch)}>Roster</Button> : undefined}
                >
                    {insLoading ? (
                        <div className="tc-card tc-pad"><Skeleton active paragraph={{ rows: 10 }} /></div>
                    ) : insError ? (
                        <div className="tc-alert" role="alert">
                            <WarningOutlined /><span><strong>Couldn't load the insights.</strong> {insError}</span>
                            <Button size="small" onClick={() => insBatch && openInsights(insBatch)}>Retry</Button>
                        </div>
                    ) : insData && insBatch ? (
                        <BatchInsights
                            batchId={String(insBatch.id)}
                            data={insData}
                            onOpenStudent={id => setSheet(insData.students.find(s => s.id === id) || null)}
                        />
                    ) : null}
                </Drawer>

                {/* ── One student's report, opened from the leaderboard or gradebook ── */}
                <Drawer
                    open={!!sheet}
                    onClose={() => setSheet(null)}
                    placement="right"
                    width={sheetWidth}
                    rootClassName="tc-drawer"
                    destroyOnHidden
                    closeIcon={<CloseOutlined />}
                    title={<span className="tc-dtitle"><strong>{sheet ? studentName(sheet) : ''}</strong><em>{insBatch?.name}</em></span>}
                >
                    {sheet && (
                        <>
                            <div className="tc-sheet-head">
                                <span className="tc-av is-lg">{initialsOf(studentName(sheet))}</span>
                                <div className="tc-cell">
                                    <strong>{studentName(sheet)}</strong>
                                    <em><a href={`mailto:${sheet.email}`}>{sheet.email}</a></em>
                                </div>
                                <span className={`tc-score ${toneOf(sheetAvg, PASS_MARK)}`}>{fmtPct(sheetAvg)}</span>
                            </div>

                            <div className="tc-pills">
                                <span className="tc-pill">Submitted <b>{sheetRows.filter(x => x.submitted).length} of {sheetRows.length}</b></span>
                                <span className="tc-pill">Average <b>{fmtPct(sheetAvg)}</b></span>
                            </div>

                            <div className="tc-card">
                                <div className="tc-card-head"><span className="tc-card-title"><span className="tc-card-ic"><RiseOutlined /></span>Quiz by quiz</span></div>
                                <div className="tc-card-body is-flush">
                                    {sheetRows.length === 0 ? (
                                        <div className="tc-muted-line">No quizzes are assigned to this batch yet.</div>
                                    ) : (
                                        <ul className="tc-qlist">
                                            {sheetRows.map(q => (
                                                <li key={q.id} className="tc-qitem">
                                                    <span className="tc-cell">
                                                        <strong title={q.title}>{q.title}</strong>
                                                        <em>{q.submitted ? `Submitted ${fmtStamp(q.at)}${q.classAvg !== null ? ` · class ${fmtPct(Number(q.classAvg))}` : ''}` : 'Not submitted'}</em>
                                                    </span>
                                                    <span className="tc-qbar"><i className={q.submitted ? toneOf(q.pct, PASS_MARK) : 'is-none'} style={{ width: `${q.submitted && q.pct !== null ? Math.max(3, q.pct) : 0}%` }} /></span>
                                                    <span className={`tc-score ${q.submitted ? toneOf(q.pct, PASS_MARK) : 'is-none'}`}>{q.submitted ? fmtPct(q.pct) : '—'}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Drawer>
            </div>
        </ConfigProvider>
    );
};

export default TeacherBatches;
