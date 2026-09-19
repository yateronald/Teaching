import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ConfigProvider, Segmented, Skeleton, Tooltip } from 'antd';
import {
    ArrowRightOutlined, BookOutlined, CalendarOutlined, CheckCircleFilled, ClockCircleOutlined, CustomerServiceOutlined,
    FileTextOutlined, PlusOutlined, ReloadOutlined, RiseOutlined, TeamOutlined, UserAddOutlined, UserOutlined,
    VideoCameraOutlined, WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatPlain, timezoneLabel } from '../../utils/timezone';
import { countOf, daysBetween, statusOf } from './batchUtils';
import type { Batch } from './batchUtils';
import './AdminDashboard.css';

/* ══════════════════════════════════════════
   ADMIN DASHBOARD — what needs attention, what's next, how the school is doing.
   Lightweight SVG/CSS charts (no chart library) so the page opens fast.
══════════════════════════════════════════ */

interface User { id: number; role: 'admin' | 'teacher' | 'student'; created_at: string; is_active?: boolean; }
interface Quiz {
    id: number; title: string; status: string; created_at: string; schedule_state?: string;
    submitted_students?: number; total_students?: number; avg_score?: number | null; batch_names?: string | null;
}
interface ScheduleItem {
    id: number; title: string; type: string; start_time: string; end_time: string; status?: string;
    batch_name?: string | null; teacher_first_name?: string; teacher_last_name?: string;
}
interface Meeting { id: number; title: string; status: string; started_at?: string | null; participant_count?: number | string; teacher_first_name?: string; teacher_last_name?: string; }
interface DemoRequest { id: number; full_name: string; email: string; country?: string; interested_level?: string; current_level?: string; status: string; created_at: string; }
interface DemoStats { total?: number | string; new_requests?: number | string; contacted?: number | string; demo_scheduled?: number | string; this_week?: number | string; this_month?: number | string; }
interface Attendance { overall_attendance_rate?: number; total_present?: number; total_late?: number; total_absent?: number; total_sessions?: number; sessions_with_codes?: number; }

interface Data {
    users: User[] | null;
    batches: Batch[] | null;
    quizzes: Quiz[] | null;
    schedules: ScheduleItem[] | null;
    meetings: Meeting[] | null;
    demos: { list: DemoRequest[]; stats: DemoStats } | null;
    attendance: Attendance | null;
}
const EMPTY: Data = { users: null, batches: null, quizzes: null, schedules: null, meetings: null, demos: null, attendance: null };
const n = (v: unknown) => Number(v) || 0;
const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/* ── Small charts ── */
const Donut: React.FC<{ parts: { label: string; value: number; color: string }[]; size?: number; center: React.ReactNode }> = ({ parts, size = 132, center }) => {
    const total = parts.reduce((s, p) => s + p.value, 0);
    const r = 52;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div className="dash-donut" style={{ width: size, height: size }}>
            <svg viewBox="0 0 132 132" width={size} height={size} aria-hidden>
                <circle cx="66" cy="66" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
                {total > 0 && parts.map(p => {
                    const len = (p.value / total) * c;
                    const el = (
                        <circle key={p.label} cx="66" cy="66" r={r} fill="none" stroke={p.color} strokeWidth="14"
                            strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset} transform="rotate(-90 66 66)" />
                    );
                    offset += len;
                    return el;
                })}
            </svg>
            <div className="dash-donut-center">{center}</div>
        </div>
    );
};

const Ring: React.FC<{ value: number; tone: string }> = ({ value, tone }) => {
    const r = 44;
    const c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(100, value));
    return (
        <div className={`dash-ring is-${tone}`}>
            <svg viewBox="0 0 104 104" width="104" height="104" aria-hidden>
                <circle cx="52" cy="52" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="52" cy="52" r={r} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${(v / 100) * c} ${c}`} transform="rotate(-90 52 52)" />
            </svg>
            <strong>{Math.round(v)}%</strong>
        </div>
    );
};

const Card: React.FC<{ title: string; icon: React.ReactNode; action?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, icon, action, className = '', children }) => (
    <section className={`dash-card ${className}`}>
        <header className="dash-card-head">
            <span className="dash-card-title"><span className="dash-card-ic">{icon}</span>{title}</span>
            {action}
        </header>
        <div className="dash-card-body">{children}</div>
    </section>
);

const Unavailable: React.FC<{ what: string }> = ({ what }) => <div className="dash-unavailable">{what} couldn’t be loaded right now.</div>;

const AdminDashboard: React.FC = () => {
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<Data>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [months, setMonths] = useState<6 | 12>(6);
    const [updatedAt, setUpdatedAt] = useState<number>(Date.now());

    const load = useCallback(async () => {
        const get = async <T,>(path: string, pick?: (d: any) => T): Promise<T | null> => {
            try {
                const res = await apiCall(path);
                if (!res.ok) return null;
                const d = await res.json();
                return pick ? pick(d) : d;
            } catch { return null; }
        };
        const arr = (d: any) => (Array.isArray(d) ? d : d?.batches || d?.data || []);
        const [users, batches, quizzes, schedules, meetings, demos, attendance] = await Promise.all([
            get<User[]>('/users', arr),
            get<Batch[]>('/batches', arr),
            get<Quiz[]>('/quizzes', arr),
            get<ScheduleItem[]>('/schedules', arr),
            get<Meeting[]>('/meetings', arr),
            get('/demo-requests?limit=5', d => ({ list: (d?.data || []) as DemoRequest[], stats: (d?.statistics || {}) as DemoStats })),
            get<Attendance>('/attendance/reports/overview'),
        ]);
        setData({ users, batches, quizzes, schedules, meetings, demos, attendance });
        setUpdatedAt(Date.now());
        setLoading(false);
        setRefreshing(false);
    }, [apiCall]);

    useEffect(() => { load(); }, [load]);

    const tz = user?.timezone;
    const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => formatPlain(iso, tz, opts);
    const time = (iso: string) => fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true });

    /* ═══════════ INSIGHTS ═══════════ */
    const m = useMemo(() => {
        const now = Date.now();
        const users = data.users || [];
        const batches = data.batches || [];
        const quizzes = data.quizzes || [];
        const schedules = data.schedules || [];
        const students = users.filter(u => u.role === 'student');
        const teachers = users.filter(u => u.role === 'teacher');
        const within = (iso: string, days: number) => (now - new Date(iso).getTime()) / 86400_000 <= days;

        // Growth by month
        const monthKeys = Array.from({ length: months }, (_, i) => dayjs().subtract(months - 1 - i, 'month').startOf('month'));
        const growth = monthKeys.map(k => {
            const inMonth = users.filter(u => dayjs(u.created_at).isSame(k, 'month'));
            return {
                key: k.format('YYYY-MM'),
                label: k.format('MMM'),
                full: k.format('MMMM YYYY'),
                students: inMonth.filter(u => u.role === 'student').length,
                others: inMonth.filter(u => u.role !== 'student').length,
            };
        });
        const periodStart = monthKeys[0];
        const newInPeriod = users.filter(u => !dayjs(u.created_at).isBefore(periodStart)).length;
        const prevStart = periodStart.subtract(months, 'month');
        const newPrev = users.filter(u => !dayjs(u.created_at).isBefore(prevStart) && dayjs(u.created_at).isBefore(periodStart)).length;

        // Batches
        const st = batches.map(b => ({ b, s: statusOf(b, now) }));
        const running = st.filter(x => x.s === 'running').map(x => x.b);
        const upcoming = st.filter(x => x.s === 'upcoming').map(x => x.b);
        const ended = st.filter(x => x.s === 'ended').map(x => x.b);
        const empty = [...running, ...upcoming].filter(b => countOf(b) === 0);
        const endingSoon = running.filter(b => daysBetween(now, b.end_date) <= 14);
        const startingSoon = upcoming.filter(b => daysBetween(now, b.start_date) <= 7);
        const topBatches = [...running, ...upcoming].sort((a, b) => countOf(b) - countOf(a)).slice(0, 5);

        // Quizzes
        const live = quizzes.filter(q => q.status === 'published' && (q.schedule_state || 'active') === 'active');
        const drafts = quizzes.filter(q => q.status === 'draft');
        const lowCompletion = live.filter(q => n(q.total_students) > 0 && n(q.submitted_students) / n(q.total_students) < 0.5);
        const scored = quizzes.filter(q => q.avg_score != null && !Number.isNaN(Number(q.avg_score)));
        const avgScore = scored.length ? scored.reduce((s, q) => s + Number(q.avg_score), 0) / scored.length : null;
        const liveTotals = live.reduce((acc, q) => ({ sub: acc.sub + n(q.submitted_students), all: acc.all + n(q.total_students) }), { sub: 0, all: 0 });

        // Classes
        const weekStart = dayjs().startOf('week');
        const weekEnd = weekStart.add(7, 'day');
        const classesThisWeek = schedules.filter(s => s.type === 'class' && s.status !== 'cancelled'
            && !dayjs(s.start_time).isBefore(weekStart) && dayjs(s.start_time).isBefore(weekEnd)).length;
        const next = schedules
            .filter(s => s.status !== 'cancelled' && new Date(s.end_time).getTime() > now)
            .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
            .slice(0, 6);
        const liveMeetings = (data.meetings || []).filter(x => x.status === 'active');

        return {
            students, teachers,
            activeStudents: students.filter(u => u.is_active !== false).length,
            newStudents30: students.filter(u => within(u.created_at, 30)).length,
            admins: users.filter(u => u.role === 'admin').length,
            disabled: users.filter(u => u.is_active === false).length,
            growth, newInPeriod, newPrev,
            running, upcoming, ended, empty, endingSoon, startingSoon, topBatches,
            enrolled: [...running, ...upcoming].reduce((s, b) => s + countOf(b), 0),
            live, drafts, lowCompletion, avgScore, liveTotals,
            quizCounts: {
                published: quizzes.filter(q => q.status === 'published').length,
                draft: drafts.length,
                archived: quizzes.filter(q => q.status === 'archived').length,
            },
            classesThisWeek, next, liveMeetings,
        };
    }, [data, months]);

    const demoNew = n(data.demos?.stats.new_requests);
    const attendanceRate = data.attendance ? n(data.attendance.overall_attendance_rate) : null;

    const attention = [
        demoNew > 0 && { key: 'demo', tone: 'amber', icon: <CustomerServiceOutlined />, title: `${plural(demoNew, 'new demo request')}`, text: 'Waiting to be contacted', cta: 'Review', to: '/app/demo-requests' },
        m.empty.length > 0 && { key: 'empty', tone: 'red', icon: <TeamOutlined />, title: `${plural(m.empty.length, 'batch', 'batches')} without students`, text: m.empty.slice(0, 2).map(b => b.name).join(', ') + (m.empty.length > 2 ? '…' : ''), cta: 'Enrol', to: '/app/batches' },
        m.lowCompletion.length > 0 && { key: 'quiz', tone: 'amber', icon: <FileTextOutlined />, title: `${plural(m.lowCompletion.length, 'live quiz', 'live quizzes')} under 50% completion`, text: m.lowCompletion.slice(0, 2).map(q => q.title).join(', '), cta: 'Open', to: '/app/quiz-management' },
        m.endingSoon.length > 0 && { key: 'ending', tone: 'blue', icon: <CalendarOutlined />, title: `${plural(m.endingSoon.length, 'batch', 'batches')} end within 14 days`, text: 'Plan the next level for these students', cta: 'View', to: '/app/batches' },
        m.startingSoon.length > 0 && { key: 'starting', tone: 'indigo', icon: <ClockCircleOutlined />, title: `${plural(m.startingSoon.length, 'batch', 'batches')} start this week`, text: m.startingSoon.slice(0, 2).map(b => b.name).join(', '), cta: 'Check', to: '/app/batches' },
        m.drafts.length > 0 && { key: 'drafts', tone: 'slate', icon: <FileTextOutlined />, title: `${plural(m.drafts.length, 'draft quiz', 'draft quizzes')}`, text: 'Not visible to students yet', cta: 'Finish', to: '/app/quiz-management' },
    ].filter(Boolean) as { key: string; tone: string; icon: React.ReactNode; title: string; text: string; cta: string; to: string }[];

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const growthMax = Math.max(1, ...m.growth.map(g => g.students + g.others));
    const growthDelta = m.newPrev ? Math.round(((m.newInPeriod - m.newPrev) / m.newPrev) * 100) : null;
    const quizTotal = m.quizCounts.published + m.quizCounts.draft + m.quizCounts.archived;
    const batchTotal = m.running.length + m.upcoming.length + m.ended.length;
    const topMax = Math.max(1, ...m.topBatches.map(countOf));
    const DEMO_STATUS: Record<string, string> = { new: 'New', contacted: 'Contacted', demo_scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled' };

    /* ═══════════ LOADING ═══════════ */
    if (loading) {
        return (
            <div className="dash" aria-busy="true">
                <div className="dash-header"><div><Skeleton.Input active size="small" style={{ width: 140, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 260, height: 26 }} /></div></div></div>
                <div className="dash-kpis">{[0, 1, 2, 3, 4].map(i => <div key={i} className="dash-kpi"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
                <div className="dash-grid">
                    <div className="dash-card dash-pad"><Skeleton active paragraph={{ rows: 5 }} /></div>
                    <div className="dash-card dash-pad"><Skeleton active paragraph={{ rows: 5 }} /></div>
                </div>
            </div>
        );
    }

    const kpis = [
        { key: 'students', label: 'Students', value: data.users ? m.students.length : '—', sub: data.users ? `${m.activeStudents} active · +${m.newStudents30} this month` : 'Unavailable', icon: <UserOutlined />, tone: 'green', to: '/app/users' },
        { key: 'batches', label: 'Running batches', value: data.batches ? m.running.length : '—', sub: data.batches ? `${m.enrolled} enrolments · ${m.upcoming.length} upcoming` : 'Unavailable', icon: <BookOutlined />, tone: 'indigo', to: '/app/batches' },
        { key: 'classes', label: 'Classes this week', value: data.schedules ? m.classesThisWeek : '—', sub: data.schedules ? `${m.next.length ? `Next ${fmt(m.next[0].start_time, { weekday: 'short' })} ${time(m.next[0].start_time)}` : 'Nothing scheduled'}` : 'Unavailable', icon: <CalendarOutlined />, tone: 'blue', to: '/app/timetable' },
        { key: 'attendance', label: 'Attendance rate', value: attendanceRate != null ? `${Math.round(attendanceRate)}%` : '—', sub: data.attendance ? `${n(data.attendance.total_present) + n(data.attendance.total_late)} check-ins recorded` : 'Unavailable', icon: <CheckCircleFilled />, tone: attendanceRate != null && attendanceRate < 70 ? 'amber' : 'teal', to: '/app/attendance' },
        { key: 'demos', label: 'New demo requests', value: data.demos ? demoNew : '—', sub: data.demos ? `${n(data.demos.stats.this_week)} this week · ${n(data.demos.stats.demo_scheduled)} scheduled` : 'Unavailable', icon: <CustomerServiceOutlined />, tone: demoNew > 0 ? 'amber' : 'slate', to: '/app/demo-requests' },
    ];

    return (
        <ConfigProvider theme={{ token: { colorPrimary: '#4f46e5', fontSize: 13, borderRadius: 8 } }}>
            <div className="dash">
                {/* ── Header ── */}
                <header className="dash-header">
                    <div>
                        <div className="dash-overline">Admin console · {formatPlain(new Date(), tz, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                        <h1 className="dash-title">{greeting}{user?.first_name ? `, ${user.first_name}` : ''}</h1>
                        <p className="dash-subtitle">
                            {attention.length ? `${plural(attention.length, 'thing needs', 'things need')} your attention today.` : 'Everything is on track today.'}
                            {' '}Updated {formatPlain(updatedAt, tz, { hour: 'numeric', minute: '2-digit', hour12: true })} · {timezoneLabel(tz)}
                        </p>
                    </div>
                    <div className="dash-header-actions">
                        <Tooltip title="Refresh"><Button icon={<ReloadOutlined spin={refreshing} />} aria-label="Refresh" onClick={() => { setRefreshing(true); load(); }} /></Tooltip>
                        <Button icon={<UserAddOutlined />} onClick={() => navigate('/app/users')}>Add user</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/app/batches?new=1')}>New batch</Button>
                    </div>
                </header>

                {/* ── KPIs ── */}
                <section className="dash-kpis" aria-label="Key numbers">
                    {kpis.map(k => (
                        <button key={k.key} type="button" className={`dash-kpi dash-k-${k.tone}`} onClick={() => navigate(k.to)}>
                            <span className="dash-kpi-top"><span className="dash-kpi-ic">{k.icon}</span><ArrowRightOutlined className="dash-kpi-go" /></span>
                            <span className="dash-kpi-label">{k.label}</span>
                            <strong className="dash-kpi-value">{k.value}</strong>
                            <span className="dash-kpi-sub">{k.sub}</span>
                        </button>
                    ))}
                </section>

                {/* ── Attention + next up ── */}
                <div className="dash-grid">
                    <Card title="Needs your attention" icon={<WarningOutlined />} className="dash-attention"
                        action={attention.length > 0 && <span className="dash-badge">{attention.length}</span>}>
                        {attention.length === 0 ? (
                            <div className="dash-allclear">
                                <span className="dash-allclear-ic"><CheckCircleFilled /></span>
                                <strong>All clear</strong>
                                <span>No pending requests, empty batches or struggling quizzes.</span>
                            </div>
                        ) : (
                            <ul className="dash-alerts">
                                {attention.map(a => (
                                    <li key={a.key} className={`is-${a.tone}`}>
                                        <span className="dash-alert-ic">{a.icon}</span>
                                        <span className="dash-alert-text"><strong>{a.title}</strong><em>{a.text}</em></span>
                                        <Button size="small" onClick={() => navigate(a.to)}>{a.cta}</Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card title="Coming up" icon={<ClockCircleOutlined />}
                        action={<button type="button" className="dash-link" onClick={() => navigate('/app/timetable')}>Timetable <ArrowRightOutlined /></button>}>
                        {m.liveMeetings.length > 0 && (
                            <div className="dash-live">
                                <span className="dash-live-dot" />
                                <div>
                                    <strong>{m.liveMeetings.length === 1 ? m.liveMeetings[0].title : `${m.liveMeetings.length} live classes`}</strong>
                                    <span>{m.liveMeetings.length === 1 ? `Live now · ${n(m.liveMeetings[0].participant_count)} joined` : 'Happening right now'}</span>
                                </div>
                                <Button size="small" icon={<VideoCameraOutlined />} onClick={() => navigate('/app/meetings')}>Open</Button>
                            </div>
                        )}
                        {!data.schedules ? <Unavailable what="The schedule" /> : m.next.length === 0 ? (
                            <div className="dash-empty-line">Nothing scheduled in the coming days.</div>
                        ) : (
                            <ul className="dash-agenda">
                                {m.next.map(s => {
                                    const isLive = new Date(s.start_time).getTime() <= Date.now();
                                    const today = dayjs(s.start_time).isSame(dayjs(), 'day');
                                    return (
                                        <li key={s.id}>
                                            <span className="dash-agenda-when">
                                                <strong>{time(s.start_time)}</strong>
                                                <em>{isLive ? 'Now' : today ? 'Today' : fmt(s.start_time, { weekday: 'short', day: 'numeric' })}</em>
                                            </span>
                                            <span className={`dash-agenda-bar is-${s.type}`} />
                                            <span className="dash-agenda-text">
                                                <strong>{s.title}</strong>
                                                <em>{[s.batch_name, `${s.teacher_first_name || ''} ${s.teacher_last_name || ''}`.trim()].filter(Boolean).join(' · ') || s.type}</em>
                                            </span>
                                            {isLive && <span className="dash-pill is-live">Live</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                </div>

                {/* ── Growth + people ── */}
                <div className="dash-grid is-wide">
                    <Card title="Sign-ups" icon={<RiseOutlined />}
                        action={<Segmented size="small" value={months} onChange={v => setMonths(v as 6 | 12)} options={[{ value: 6, label: '6 months' }, { value: 12, label: '12 months' }]} />}>
                        {!data.users ? <Unavailable what="Users" /> : (
                            <>
                                <div className="dash-growth-head">
                                    <div><strong>{m.newInPeriod}</strong><span>new accounts in {months} months</span></div>
                                    {growthDelta != null && (
                                        <span className={`dash-delta ${growthDelta >= 0 ? 'is-up' : 'is-down'}`}>
                                            {growthDelta >= 0 ? '▲' : '▼'} {Math.abs(growthDelta)}% vs previous {months} months
                                        </span>
                                    )}
                                </div>
                                <div className="dash-bars" role="img" aria-label="New accounts per month">
                                    {m.growth.map(g => {
                                        const total = g.students + g.others;
                                        return (
                                            <Tooltip key={g.key} title={`${g.full}: ${g.students} students, ${g.others} staff`}>
                                                <div className="dash-bar">
                                                    <span className="dash-bar-val">{total || ''}</span>
                                                    <div className="dash-bar-track">
                                                        <div className="dash-bar-stack" style={{ height: `${(total / growthMax) * 100}%` }}>
                                                            {g.others > 0 && <i className="is-staff" style={{ flexGrow: g.others }} />}
                                                            {g.students > 0 && <i className="is-student" style={{ flexGrow: g.students }} />}
                                                        </div>
                                                    </div>
                                                    <span className="dash-bar-label">{g.label}</span>
                                                </div>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                                <div className="dash-legend"><span><i className="is-student" />Students</span><span><i className="is-staff" />Teachers & admins</span></div>
                            </>
                        )}
                    </Card>

                    <Card title="People" icon={<TeamOutlined />}
                        action={<button type="button" className="dash-link" onClick={() => navigate('/app/users')}>Users <ArrowRightOutlined /></button>}>
                        {!data.users ? <Unavailable what="Users" /> : (
                            <div className="dash-people">
                                <Donut
                                    parts={[
                                        { label: 'Students', value: m.students.length, color: '#10b981' },
                                        { label: 'Teachers', value: m.teachers.length, color: '#3b82f6' },
                                        { label: 'Admins', value: m.admins, color: '#8b5cf6' },
                                    ]}
                                    center={<><strong>{(data.users || []).length}</strong><span>users</span></>}
                                />
                                <ul className="dash-people-legend">
                                    <li><i style={{ background: '#10b981' }} />Students<b>{m.students.length}</b></li>
                                    <li><i style={{ background: '#3b82f6' }} />Teachers<b>{m.teachers.length}</b></li>
                                    <li><i style={{ background: '#8b5cf6' }} />Admins<b>{m.admins}</b></li>
                                    <li className="is-muted"><i style={{ background: '#cbd5e1' }} />Disabled accounts<b>{m.disabled}</b></li>
                                    <li className="is-muted">Students per teacher<b>{m.teachers.length ? (m.students.length / m.teachers.length).toFixed(1) : '—'}</b></li>
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── Batches + quizzes + attendance ── */}
                <div className="dash-grid is-three">
                    <Card title="Batches" icon={<BookOutlined />}
                        action={<button type="button" className="dash-link" onClick={() => navigate('/app/batches')}>Manage <ArrowRightOutlined /></button>}>
                        {!data.batches ? <Unavailable what="Batches" /> : batchTotal === 0 ? <div className="dash-empty-line">No batches yet.</div> : (
                            <>
                                <div className="dash-stack" aria-hidden>
                                    {m.running.length > 0 && <i className="is-running" style={{ flexGrow: m.running.length }} />}
                                    {m.upcoming.length > 0 && <i className="is-upcoming" style={{ flexGrow: m.upcoming.length }} />}
                                    {m.ended.length > 0 && <i className="is-ended" style={{ flexGrow: m.ended.length }} />}
                                </div>
                                <div className="dash-stack-legend">
                                    <span><i className="is-running" />Running <b>{m.running.length}</b></span>
                                    <span><i className="is-upcoming" />Upcoming <b>{m.upcoming.length}</b></span>
                                    <span><i className="is-ended" />Ended <b>{m.ended.length}</b></span>
                                </div>
                                <div className="dash-sub-title">Largest active batches</div>
                                {m.topBatches.length === 0 ? <div className="dash-empty-line">No active batches.</div> : (
                                    <ul className="dash-hbars">
                                        {m.topBatches.map(b => (
                                            <li key={b.id}>
                                                <span className="dash-hbar-name"><b className="dash-lv">{b.french_level}</b>{b.name}</span>
                                                <span className="dash-hbar-track"><i style={{ width: `${Math.max(4, (countOf(b) / topMax) * 100)}%` }} /></span>
                                                <span className="dash-hbar-val">{countOf(b)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </Card>

                    <Card title="Quizzes" icon={<FileTextOutlined />}
                        action={<button type="button" className="dash-link" onClick={() => navigate('/app/quiz-management')}>Open <ArrowRightOutlined /></button>}>
                        {!data.quizzes ? <Unavailable what="Quizzes" /> : quizTotal === 0 ? <div className="dash-empty-line">No quizzes yet.</div> : (
                            <>
                                <div className="dash-quiz-stats">
                                    <div><strong>{m.live.length}</strong><span>Live now</span></div>
                                    <div><strong>{m.liveTotals.all ? `${Math.round((m.liveTotals.sub / m.liveTotals.all) * 100)}%` : '—'}</strong><span>Completion (live)</span></div>
                                    <div><strong>{m.avgScore != null ? `${Math.round(m.avgScore)}%` : '—'}</strong><span>Average score</span></div>
                                </div>
                                <div className="dash-stack" aria-hidden>
                                    {m.quizCounts.published > 0 && <i className="is-published" style={{ flexGrow: m.quizCounts.published }} />}
                                    {m.quizCounts.draft > 0 && <i className="is-draft" style={{ flexGrow: m.quizCounts.draft }} />}
                                    {m.quizCounts.archived > 0 && <i className="is-archived" style={{ flexGrow: m.quizCounts.archived }} />}
                                </div>
                                <div className="dash-stack-legend">
                                    <span><i className="is-published" />Published <b>{m.quizCounts.published}</b></span>
                                    <span><i className="is-draft" />Draft <b>{m.quizCounts.draft}</b></span>
                                    <span><i className="is-archived" />Archived <b>{m.quizCounts.archived}</b></span>
                                </div>
                                {m.live.length > 0 && (
                                    <>
                                        <div className="dash-sub-title">Live quizzes</div>
                                        <ul className="dash-hbars">
                                            {m.live.slice(0, 4).map(q => {
                                                const pct = n(q.total_students) ? Math.round((n(q.submitted_students) / n(q.total_students)) * 100) : 0;
                                                return (
                                                    <li key={q.id}>
                                                        <span className="dash-hbar-name">{q.title}</span>
                                                        <span className={`dash-hbar-track${pct < 50 ? ' is-low' : ''}`}><i style={{ width: `${Math.max(4, pct)}%` }} /></span>
                                                        <span className="dash-hbar-val">{pct}%</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}
                    </Card>

                    <Card title="Attendance" icon={<CheckCircleFilled />}
                        action={<button type="button" className="dash-link" onClick={() => navigate('/app/attendance')}>Details <ArrowRightOutlined /></button>}>
                        {!data.attendance ? <Unavailable what="Attendance" /> : (
                            <div className="dash-att">
                                <Ring value={attendanceRate || 0} tone={(attendanceRate || 0) >= 80 ? 'good' : (attendanceRate || 0) >= 60 ? 'ok' : 'low'} />
                                <ul className="dash-att-list">
                                    <li><i className="is-present" />Present<b>{n(data.attendance.total_present)}</b></li>
                                    <li><i className="is-late" />Late<b>{n(data.attendance.total_late)}</b></li>
                                    <li><i className="is-absent" />Absent<b>{n(data.attendance.total_absent)}</b></li>
                                    <li className="is-muted">Sessions started<b>{n(data.attendance.sessions_with_codes)} / {n(data.attendance.total_sessions)}</b></li>
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>

                {/* ── Demo requests ── */}
                <Card title="Latest demo requests" icon={<CustomerServiceOutlined />}
                    action={<button type="button" className="dash-link" onClick={() => navigate('/app/demo-requests')}>All requests <ArrowRightOutlined /></button>}>
                    {!data.demos ? <Unavailable what="Demo requests" /> : data.demos.list.length === 0 ? (
                        <div className="dash-empty-line">No demo requests yet.</div>
                    ) : (
                        <ul className="dash-demos">
                            {data.demos.list.map(d => (
                                <li key={d.id}>
                                    <span className="dash-demo-av">{(d.full_name || '?').split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()}</span>
                                    <span className="dash-demo-text">
                                        <strong>{d.full_name}</strong>
                                        <em>{[d.country, d.interested_level || d.current_level].filter(Boolean).join(' · ') || d.email}</em>
                                    </span>
                                    <span className={`dash-pill is-${d.status}`}>{DEMO_STATUS[d.status] || d.status}</span>
                                    <span className="dash-demo-date">{fmt(d.created_at, { month: 'short', day: 'numeric' })}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default AdminDashboard;
