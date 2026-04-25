import React, { useState, useEffect, useMemo } from 'react';
import {
    Row, Col, Button, message, Typography,
    Progress, Modal, List, Tooltip, Empty,
    Input, Form, Segmented, Select,
    Skeleton, Badge
} from 'antd';
import {
    BookOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    VideoCameraOutlined,
    EnvironmentOutlined,
    FolderOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    RightOutlined,
    FireOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';

const { Text } = Typography;
dayjs.extend(utc);

/* ══════════════════════════════════════════
   CSS for animated JOIN button
══════════════════════════════════════════ */
const JOIN_BTN_CSS = `
@keyframes joinPulse {
    0%,100% { transform:scale(1); box-shadow:0 2px 6px rgba(82,196,26,.3); }
    50%      { transform:scale(1.06); box-shadow:0 6px 16px rgba(82,196,26,.75); }
}
.join-btn-pulse { animation: joinPulse 2s ease-in-out infinite !important; }
.join-btn-pulse:hover { animation-play-state: paused !important; transform: scale(1.1) !important; }
`;
if (typeof document !== 'undefined' && !document.head.querySelector('[data-jbp]')) {
    const s = document.createElement('style');
    s.setAttribute('data-jbp', '1');
    s.textContent = JOIN_BTN_CSS;
    document.head.appendChild(s);
}

/* ══════════════════════════════════════════
   Types
══════════════════════════════════════════ */
interface Batch {
    id: number; name: string; description?: string; teacher_name?: string;
    french_level?: string; start_date?: string; end_date?: string;
    current_students?: number; max_students?: number; quizzes_count?: number;
}
interface Quiz {
    id: number; title: string; description: string; total_questions: number;
    duration_minutes: number; total_marks?: number; status?: string;
    start_date?: string | null; end_date?: string | null; batch_names?: string;
    submission_status?: 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'completed';
    submission?: { total_score?: number; max_score?: number; percentage?: number; status?: string; } | null;
}
interface Schedule {
    id: number; title: string; description: string; batch_name: string; french_level?: string;
    start_time: string; end_time: string; type: string;
    teacher_first_name?: string; teacher_last_name?: string;
    location_mode?: 'online' | 'physical'; location?: string; link?: string; status?: string;
}

/* ══════════════════════════════════════════
   Module-level KPI card
══════════════════════════════════════════ */
const KpiCard = ({ label, value, icon, accent, suffix = '', onClick }: {
    label: string; value: number | string; icon: React.ReactNode;
    accent: string; suffix?: string; onClick?: () => void;
}) => (
    <div
        onClick={onClick}
        style={{
            borderRadius: 16, padding: '20px 22px',
            background: '#fff', border: '1px solid #f0f0f8',
            boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
            display: 'flex', alignItems: 'center', gap: 16,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'box-shadow 0.18s',
        }}
        onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(99,102,241,0.16)'; }}
        onMouseLeave={e => { if (onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(99,102,241,0.07)'; }}
    >
        <div style={{ width: 46, height: 46, borderRadius: 13, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: accent, flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>
                {value}<span style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginLeft: 2 }}>{suffix}</span>
            </div>
        </div>
        {onClick && <RightOutlined style={{ marginLeft: 'auto', color: '#c7d2fe', fontSize: 12 }} />}
    </div>
);

/* ══════════════════════════════════════════
   Quick-nav shortcut pill
══════════════════════════════════════════ */
const NavPill = ({ icon, label, to, accent, navigate }: {
    icon: React.ReactNode; label: string; to: string; accent: string; navigate: (p: string) => void;
}) => (
    <button
        onClick={() => navigate(to)}
        style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            borderRadius: 12, border: `1px solid ${accent}22`,
            background: accent + '0d', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: accent,
            transition: 'all 0.16s', outline: 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = accent + '22'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = accent + '0d'; }}
    >
        {icon}{label}
    </button>
);

/* ══════════════════════════════════════════
   Score color
══════════════════════════════════════════ */
const scoreColor = (pct: number) => {
    if (pct >= 90) return '#22c55e';
    if (pct >= 75) return '#6366f1';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
};

/* ══════════════════════════════════════════
   Type-coloring for schedule
══════════════════════════════════════════ */
const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
    exam:       { text: '#ef4444', bg: '#fff1f2' },
    class:      { text: '#6366f1', bg: '#eef2ff' },
    assignment: { text: '#f59e0b', bg: '#fffbeb' },
};
const typeStyle = (t: string) => TYPE_COLORS[t] || { text: '#64748b', bg: '#f8fafc' };

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const StudentDashboard: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const { apiCall } = useAuth();
    const navigate = useNavigate();

    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [batchFilter, setBatchFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
    const [batchSort, setBatchSort] = useState<'name' | 'start' | 'end' | 'level' | 'remaining'>('start');
    const [batchSearch, setBatchSearch] = useState('');

    const [stats, setStats] = useState({ totalBatches: 0, completedQuizzes: 0, pendingQuizzes: 0, averageScore: 0, totalResources: 0, upcomingClasses: 0 });

    // Join class flow
    const [joinClassModalVisible, setJoinClassModalVisible] = useState(false);
    const [selectedScheduleForJoin, setSelectedScheduleForJoin] = useState<Schedule | null>(null);
    const [accessCode, setAccessCode] = useState('');
    const [joiningClass, setJoiningClass] = useState(false);
    const [sessionStatus, setSessionStatus] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [quizzesRes, resultsRes, resourcesRes, schedulesRes, batchesRes] = await Promise.all([
                apiCall('/quizzes'),
                apiCall('/quizzes/student/results'),
                apiCall('/resources'),
                apiCall('/schedules/upcoming/me?limit=20'),
                apiCall('/batches/student/my-batches'),
            ]);

            if (quizzesRes?.ok) {
                const data = await quizzesRes.json();
                const qd: Quiz[] = Array.isArray(data) ? data : (data.quizzes || []);
                setQuizzes(qd);
                setStats(p => ({ ...p, completedQuizzes: qd.filter(q => q.submission_status === 'completed').length, pendingQuizzes: qd.filter(q => q.submission_status !== 'completed').length }));
            }
            if (resultsRes?.ok) {
                const data = await resultsRes.json();
                const all = (data?.results || []) as any[];
                const now = dayjs();
                const expired = all.filter((r: any) => { const e = r?.end_date ? dayjs(r.end_date) : null; return e ? now.isAfter(e) : r?.results_locked === false; });
                setResults(expired);
                const ts = expired.reduce((s: number, r: any) => s + (Number(r.score) || 0), 0);
                const tm = expired.reduce((s: number, r: any) => s + (Number(r.max_score) || 0), 0);
                setStats(p => ({ ...p, averageScore: tm > 0 ? Number(((ts / tm) * 100).toFixed(2)) : 0 }));
            }
            if (resourcesRes?.ok) {
                const data = await resourcesRes.json();
                const rd = Array.isArray(data) ? data : (data.resources || []);
                setStats(p => ({ ...p, totalResources: rd.length }));
            }
            if (schedulesRes?.ok) {
                const data = await schedulesRes.json();
                const sd: Schedule[] = Array.isArray(data) ? data : (data.schedules || []);
                setSchedules(sd);
                setStats(p => ({ ...p, upcomingClasses: sd.filter(s => dayjs(s.start_time).isAfter(dayjs())).length }));
            }
            if (batchesRes?.ok) {
                const data = await batchesRes.json();
                const bd = Array.isArray(data) ? data : ((data as any)?.batches || (data as any)?.data || []);
                const mb: Batch[] = bd.map((b: any) => ({
                    id: b.id ?? b.batch_id ?? 0,
                    name: b.name ?? b.batch_name ?? 'Unnamed Batch',
                    french_level: b.french_level ?? b.level,
                    start_date: b.start_date ?? b.startDate,
                    end_date: b.end_date ?? b.endDate,
                    teacher_name: (b.teacher_first_name || b.teacher_last_name) ? `${b.teacher_first_name || ''} ${b.teacher_last_name || ''}`.trim() : b.teacher_name,
                    current_students: b.student_count ?? b.current_students,
                }));
                setBatches(mb);
                setStats(p => ({ ...p, totalBatches: mb.length }));
            }
        } catch { message.error('Failed to fetch data'); }
        finally { setLoading(false); }
    };

    const checkSessionStatus = async (scheduleId: number) => {
        try {
            const r = await apiCall(`/attendance/sessions/${scheduleId}/status`);
            if (r.ok) { const s = await r.json(); setSessionStatus(s); if (!s.canJoin) message.warning(s.reason || 'Class not started or access code expired'); return s; }
        } catch {}
        return null;
    };

    const handleJoinFromDashboard = async (schedule: Schedule) => {
        setSelectedScheduleForJoin(schedule);
        const status = await checkSessionStatus(schedule.id);
        if (status?.alreadyJoined && schedule.link) { message.success('Already joined — opening meeting link...'); window.open(schedule.link, '_blank'); return; }
        if (status?.canJoin) { setJoinClassModalVisible(true); setAccessCode(''); form.resetFields(); return; }
        message.info(status?.reason || 'Teacher has not started the class yet');
    };

    const handleSubmitAccessCode = async () => {
        if (!selectedScheduleForJoin || !accessCode.trim()) { message.error('Please enter the access code'); return; }
        setJoiningClass(true);
        try {
            let sessionId: number | null = sessionStatus?.canJoin && sessionStatus?.sessionId ? sessionStatus.sessionId : null;
            if (!sessionId) {
                const r = await apiCall(`/attendance/sessions?schedule_id=${selectedScheduleForJoin.id}`);
                if (!r.ok) throw new Error('Failed to fetch sessions');
                const d = await r.json();
                const sess = d.sessions || [];
                const active = sess.find((s: any) => Number(s.schedule_id) === Number(selectedScheduleForJoin.id) && (s.status === 'in_progress' || s.status === 'started')) || sess.find((s: any) => Number(s.schedule_id) === Number(selectedScheduleForJoin.id));
                sessionId = active?.id ?? null;
            }
            if (!sessionId) throw new Error('No active session found');
            const joinR = await apiCall(`/attendance/sessions/${sessionId}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() }) });
            if (joinR.ok) {
                const res = await joinR.json();
                message.success(`Joined! Attendance marked as ${res.status}`);
                setJoinClassModalVisible(false); setSelectedScheduleForJoin(null); setAccessCode('');
                if (selectedScheduleForJoin?.link) window.open(selectedScheduleForJoin.link, '_blank');
                return;
            }
            const err = await joinR.json().catch(() => ({}));
            message.error(err?.error || 'Invalid or expired access code');
        } catch (e: any) { message.error(e?.message || 'Failed to join class'); }
        finally { setJoiningClass(false); }
    };

    const getBatchStatus = (b: Batch) => {
        const now = dayjs(), start = b.start_date ? dayjs(b.start_date) : null, end = b.end_date ? dayjs(b.end_date) : null;
        if (start && now.isBefore(start)) return 'upcoming';
        if (end && now.isAfter(end)) return 'completed';
        return 'active';
    };

    const displayedBatches = useMemo(() => {
        const q = batchSearch.trim().toLowerCase();
        const filtered = batches.filter(b => {
            if (batchFilter !== 'all' && getBatchStatus(b) !== batchFilter) return false;
            if (q && !([b.name, b.french_level, b.teacher_name].filter(Boolean).join(' ').toLowerCase()).includes(q)) return false;
            return true;
        });
        const safeDay = (d?: string) => d ? dayjs(d).valueOf() : 0;
        const remainingDays = (b: Batch) => b.end_date ? dayjs(b.end_date).endOf('day').diff(dayjs().startOf('day'), 'day') : Infinity;
        return filtered.sort((a, b) => {
            switch (batchSort) {
                case 'name': return a.name.localeCompare(b.name);
                case 'start': return safeDay(a.start_date) - safeDay(b.start_date);
                case 'end': return safeDay(a.end_date) - safeDay(b.end_date);
                case 'level': return (a.french_level || '').localeCompare(b.french_level || '');
                case 'remaining': return remainingDays(a) - remainingDays(b);
                default: return 0;
            }
        });
    }, [batches, batchFilter, batchSort, batchSearch]);

    const upcomingSchedules = schedules.filter(s => dayjs(s.start_time).isAfter(dayjs())).sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time))).slice(0, 3);
    const upcomingQuizzes = useMemo(() => {
        const now = dayjs();
        return quizzes.filter(q => {
            const start = q.start_date ? dayjs(q.start_date) : null;
            return !!start && start.isAfter(now) && (q.status || '').toLowerCase() === 'published' && (!q.submission_status || q.submission_status === 'not_started');
        }).sort((a, b) => dayjs(a.start_date!).diff(dayjs(b.start_date!))).slice(0, 2);
    }, [quizzes]);

    /* ── Pie chart data ── */
    const pieData = useMemo(() => {
        const now = dayjs(), counts = { upcoming: 0, active: 0, expired: 0 };
        quizzes.forEach(q => {
            const start = q.start_date ? dayjs(q.start_date) : null;
            const end = q.end_date ? dayjs(q.end_date) : null;
            if (start && now.isBefore(start)) counts.upcoming++;
            else if (end && now.isAfter(end)) counts.expired++;
            else counts.active++;
        });
        return [{ id: 0, value: counts.upcoming, label: 'Upcoming', color: '#6366f1' }, { id: 1, value: counts.active, label: 'Active', color: '#22c55e' }, { id: 2, value: counts.expired, label: 'Expired', color: '#94a3b8' }];
    }, [quizzes]);

    /* ── Sorted results for charts ── */
    const sortedResults = useMemo(() => results.slice().sort((a, b) => dayjs(a.submitted_at).diff(dayjs(b.submitted_at))), [results]);

    /* ════════════════════════════════════
       LOADING SKELETON
    ════════════════════════════════════ */
    if (loading) return (
        <div>
            {/* Header skeleton */}
            <div style={{ marginBottom: 24 }}>
                <Skeleton.Input active style={{ width: 220, height: 28, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 140, height: 14, borderRadius: 6 }} /></div>
            </div>
            {/* KPI skeleton */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[1,2,3,4].map(i => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <div style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Skeleton.Avatar active size={46} shape="square" style={{ borderRadius: 13 }} />
                            <div style={{ flex: 1 }}>
                                <Skeleton.Input active style={{ width: 80, height: 11, borderRadius: 4, marginBottom: 8 }} block />
                                <Skeleton.Input active style={{ width: 44, height: 26, borderRadius: 6 }} />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
            {/* Quick nav skeleton */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                {[100, 90, 80, 90].map((w, i) => <Skeleton.Button key={i} active style={{ width: w, height: 38, borderRadius: 12 }} />)}
            </div>
            {/* Body skeleton */}
            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', padding: 24, marginBottom: 20 }}>
                        <Skeleton active paragraph={{ rows: 6 }} />
                    </div>
                    <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', padding: 24 }}>
                        <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                </Col>
                <Col xs={24} lg={8}>
                    {[1,2,3].map(i => (
                        <div key={i} style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', padding: 20, marginBottom: 16 }}>
                            <Skeleton active paragraph={{ rows: 3 }} />
                        </div>
                    ))}
                </Col>
            </Row>
        </div>
    );

    /* ════════════════════════════════════
       MAIN RENDER
    ════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* ── Page header ── */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1d2e', letterSpacing: 0.2 }}>Student Dashboard</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                    {stats.totalBatches} batch{stats.totalBatches !== 1 ? 'es' : ''} · {stats.upcomingClasses} upcoming class{stats.upcomingClasses !== 1 ? 'es' : ''} · avg score {stats.averageScore}%
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="My Batches" value={stats.totalBatches} icon={<BookOutlined />} accent="#6366f1" onClick={() => setBatchModalOpen(true)} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Avg Score" value={stats.averageScore} suffix="%" icon={<TrophyOutlined />} accent="#f59e0b" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Completed Quizzes" value={stats.completedQuizzes} icon={<CheckCircleOutlined />} accent="#22c55e" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Pending Quizzes" value={stats.pendingQuizzes} icon={<ClockCircleOutlined />} accent="#ef4444" />
                </Col>
            </Row>

            {/* ── Quick navigation ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <NavPill icon={<FileTextOutlined />} label="My Quizzes" to="/app/my-quizzes" accent="#6366f1" navigate={navigate} />
                <NavPill icon={<TrophyOutlined />}  label="My Results" to="/app/my-results"  accent="#f59e0b" navigate={navigate} />
                <NavPill icon={<FolderOutlined />}  label="Resources"  to="/app/my-resources" accent="#22c55e" navigate={navigate} />
                <NavPill icon={<CalendarOutlined />} label="Schedule"  to="/app/my-schedule"  accent="#0ea5e9" navigate={navigate} />
            </div>

            {/* ── Main body ── */}
            <Row gutter={[20, 20]}>

                {/* LEFT: Charts */}
                <Col xs={24} lg={16}>
                    {/* Score over time + Bar chart */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col xs={24} md={12}>
                            <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', padding: 24, height: 340 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 16 }}>Score Over Time</div>
                                {sortedResults.length === 0 ? (
                                    <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No quiz results yet</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
                                ) : (
                                    <LineChart
                                        xAxis={[{ scaleType: 'point', data: sortedResults.map(r => dayjs(r.submitted_at).format('MMM DD')) }]}
                                        series={[{ data: sortedResults.map(r => Number(Number(r.percentage ?? 0).toFixed(2))), label: 'Score %', color: '#6366f1' }]}
                                        height={260}
                                    />
                                )}
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', padding: 24, height: 340 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 16 }}>Scores by Quiz (Top 10)</div>
                                {sortedResults.length === 0 ? (
                                    <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No results yet</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
                                ) : (
                                    <BarChart
                                        xAxis={[{ scaleType: 'band', data: sortedResults.slice(-10).map(r => r.quiz_title?.length > 10 ? r.quiz_title.slice(0, 10) + '…' : r.quiz_title) }]}
                                        series={[{ data: sortedResults.slice(-10).map(r => Number(Number(r.percentage ?? 0).toFixed(2))), color: '#6366f1' }]}
                                        height={260}
                                    />
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Pie + Recent performance */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', padding: 24, height: 320 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 16 }}>Quiz Availability</div>
                                {quizzes.length === 0 ? (
                                    <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No quizzes found</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 30 }} />
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <PieChart series={[{ data: pieData, innerRadius: 48 }]} height={245} />
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col xs={24} md={12}>
                            <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', padding: 24, height: 320 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>Recent Performance</div>
                                    {quizzes.some(q => q.submission) && (
                                        <button onClick={() => navigate('/app/my-results')} style={{ fontSize: 12, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                            View all →
                                        </button>
                                    )}
                                </div>
                                {quizzes.filter(q => q.submission).length === 0 ? (
                                    <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No completed quizzes yet</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 30 }} />
                                ) : (
                                    <div style={{ overflowY: 'auto', maxHeight: 230 }}>
                                        {quizzes.filter(q => q.submission).slice(0, 5).map(quiz => {
                                            const pct = Number(Number(quiz.submission?.percentage ?? ((Number(quiz.submission?.total_score || 0) / Number(quiz.submission?.max_score || 1)) * 100)).toFixed(2)) || 0;
                                            return (
                                                <div key={quiz.id} style={{ marginBottom: 14 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                        <Text ellipsis style={{ maxWidth: '68%', fontSize: 13, color: '#1a1d2e', fontWeight: 600 }}>{quiz.title}</Text>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(pct) }}>{pct.toFixed(1)}%</span>
                                                    </div>
                                                    <Progress percent={pct} size="small" strokeColor={scoreColor(pct)} showInfo={false} strokeLinecap="round" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Col>

                {/* RIGHT: Upcoming schedule + quizzes */}
                <Col xs={24} lg={8}>

                    {/* Upcoming Schedule */}
                    <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', padding: 22, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 15 }}>
                                    <CalendarOutlined />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>Upcoming Schedule</span>
                            </div>
                            {stats.upcomingClasses > 0 && (
                                <span style={{ fontSize: 11, fontWeight: 700, background: '#eef2ff', color: '#6366f1', borderRadius: 20, padding: '2px 10px' }}>
                                    {stats.upcomingClasses}
                                </span>
                            )}
                        </div>

                        {upcomingSchedules.length === 0 ? (
                            <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No upcoming classes</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '16px 0' }} />
                        ) : (
                            upcomingSchedules.map(schedule => {
                                const startTime = dayjs(schedule.start_time);
                                const ts = typeStyle(schedule.type);
                                const minutesUntilStart = startTime.diff(dayjs(), 'minute');
                                const canJoin = schedule.location_mode === 'online' && schedule.link && minutesUntilStart <= 5 && minutesUntilStart >= -30;
                                const teacher = schedule.teacher_first_name ? `${schedule.teacher_first_name} ${schedule.teacher_last_name || ''}`.trim() : 'Teacher TBA';
                                return (
                                    <div key={schedule.id} style={{ borderRadius: 12, border: `1px solid ${ts.text}22`, background: ts.bg, padding: '12px 14px', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>{schedule.title}</span>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: ts.text, background: ts.text + '18', borderRadius: 20, padding: '1px 8px' }}>
                                                        {schedule.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                    <span><UserOutlined style={{ marginRight: 5, color: '#6366f1' }} />{teacher}</span>
                                                    <span><ClockCircleOutlined style={{ marginRight: 5, color: '#f59e0b' }} />{startTime.format('MMM DD, HH:mm')}</span>
                                                    <span>
                                                        {schedule.location_mode === 'online' ? <><VideoCameraOutlined style={{ marginRight: 5, color: '#8b5cf6' }} />Online</> : <><EnvironmentOutlined style={{ marginRight: 5, color: '#ec4899' }} />{schedule.location || 'On-site'}</>}
                                                    </span>
                                                </div>
                                                {minutesUntilStart > 0 && minutesUntilStart <= 60 && (
                                                    <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', borderRadius: 20, padding: '2px 10px' }}>
                                                        <FireOutlined style={{ color: '#22c55e', fontSize: 11 }} />
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#15803d' }}>Starts in {minutesUntilStart} min</span>
                                                    </div>
                                                )}
                                            </div>
                                            {canJoin && (
                                                <Button size="small" onClick={() => handleJoinFromDashboard(schedule)}
                                                    className="join-btn-pulse"
                                                    style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, height: 30, marginLeft: 8 }}>
                                                    JOIN
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <button onClick={() => navigate('/app/my-schedule')} style={{ marginTop: 8, width: '100%', padding: '8px 0', background: '#f8f7ff', border: '1px dashed #c7d2fe', borderRadius: 10, color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            View Full Schedule →
                        </button>
                    </div>

                    {/* Upcoming Quizzes */}
                    <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', padding: 22 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: 15 }}>
                                <FileTextOutlined />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>Upcoming Quizzes</span>
                        </div>

                        {upcomingQuizzes.length === 0 ? (
                            <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No upcoming quizzes</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '12px 0' }} />
                        ) : (
                            upcomingQuizzes.map(q => {
                                const startTime = dayjs(q.start_date!);
                                const minutesUntilStart = startTime.diff(dayjs(), 'minute');
                                const withinWindow = q.end_date ? dayjs().isBefore(dayjs(q.end_date)) : true;
                                const canStart = minutesUntilStart <= 0 && withinWindow;
                                return (
                                    <div key={q.id} style={{ borderRadius: 12, border: '1px solid #e0e7ff', background: '#f9f8ff', padding: '12px 14px', marginBottom: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e', marginBottom: 5 }}>{q.title}</div>
                                                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                    {q.batch_names && <span><BookOutlined style={{ marginRight: 5, color: '#6366f1' }} />{q.batch_names}</span>}
                                                    <span><ClockCircleOutlined style={{ marginRight: 5, color: '#f59e0b' }} />{startTime.format('MMM DD, HH:mm')}</span>
                                                    <span><FileTextOutlined style={{ marginRight: 5, color: '#22c55e' }} />{q.total_questions ?? 0} q · {q.duration_minutes ?? 0} min</span>
                                                </div>
                                            </div>
                                            <Tooltip title={canStart ? 'Start Quiz' : `Available at ${startTime.format('HH:mm')}`}>
                                                <Button size="small"
                                                    disabled={!canStart}
                                                    onClick={() => { if (canStart) { navigate('/app/my-quizzes'); } }}
                                                    className={canStart ? 'join-btn-pulse' : ''}
                                                    style={{ background: canStart ? 'linear-gradient(135deg,#22c55e,#15803d)' : undefined, color: canStart ? '#fff' : undefined, border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, height: 30, marginLeft: 8 }}>
                                                    {canStart ? 'START' : <PlayCircleOutlined />}
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <button onClick={() => navigate('/app/my-quizzes')} style={{ marginTop: 8, width: '100%', padding: '8px 0', background: '#fffbeb', border: '1px dashed #fde68a', borderRadius: 10, color: '#f59e0b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            View All Quizzes →
                        </button>
                    </div>
                </Col>
            </Row>

            {/* ════ BATCHES MODAL ════ */}
            <Modal
                open={batchModalOpen}
                onCancel={() => setBatchModalOpen(false)}
                footer={null}
                width={900}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 16 }}>
                            <BookOutlined />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1d2e' }}>My Batches</span>
                        <Badge count={batches.length} style={{ background: '#6366f1', marginLeft: 4 }} />
                    </div>
                }
            >
                {/* Toolbar */}
                <div style={{ marginBottom: 16 }}>
                    <Row gutter={[8, 8]}>
                        <Col xs={24} md={10}>
                            <Input.Search allowClear placeholder="Search by name, level, or teacher" value={batchSearch} onChange={e => setBatchSearch(e.target.value)} style={{ borderRadius: 10 }} />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Segmented options={[{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Upcoming', value: 'upcoming' }, { label: 'Completed', value: 'completed' }]} value={batchFilter} onChange={val => setBatchFilter(val as any)} block />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select style={{ width: '100%' }} value={batchSort} onChange={v => setBatchSort(v)}
                                options={[{ value: 'start', label: 'Sort by Start Date' }, { value: 'end', label: 'Sort by End Date' }, { value: 'name', label: 'Sort by Name' }, { value: 'level', label: 'Sort by Level' }, { value: 'remaining', label: 'Sort by Remaining' }]} />
                        </Col>
                    </Row>
                </div>

                {displayedBatches.length === 0 ? <Empty description="No matching batches" /> : (
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
                        dataSource={displayedBatches}
                        renderItem={batch => {
                            const status = getBatchStatus(batch);
                            const statusColor = status === 'active' ? '#22c55e' : status === 'upcoming' ? '#6366f1' : '#94a3b8';
                            const start = batch.start_date ? dayjs.utc(batch.start_date).startOf('day') : null;
                            const end = batch.end_date ? dayjs.utc(batch.end_date).startOf('day') : null;
                            const now = dayjs.utc().startOf('day');
                            const totalMs = start && end ? end.valueOf() - start.valueOf() : null;
                            const elapsedMs = start ? Math.max(0, Math.min(dayjs.utc().valueOf() - start.valueOf(), totalMs ?? 0)) : null;
                            const percent = totalMs && totalMs > 0 && elapsedMs !== null ? Math.round((elapsedMs / totalMs) * 100) : 0;
                            const remaining = end ? end.diff(now, 'day') : null;
                            return (
                                <List.Item>
                                    <div style={{ borderRadius: 14, border: `1.5px solid ${statusColor}30`, background: '#fff', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', overflow: 'hidden' }}>
                                        <div style={{ height: 4, background: `linear-gradient(90deg, ${statusColor}, ${statusColor}88)` }} />
                                        <div style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>{batch.name}</div>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: statusColor + '18', borderRadius: 20, padding: '2px 8px' }}>{status.toUpperCase()}</span>
                                            </div>
                                            {batch.french_level && <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, marginBottom: 6 }}>{batch.french_level}</div>}
                                            {batch.teacher_name && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}><UserOutlined style={{ marginRight: 5 }} />{batch.teacher_name}</div>}
                                            {start && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 3 }}><CalendarOutlined style={{ marginRight: 5 }} />{start.format('DD MMM YYYY')} → {end?.format('DD MMM YYYY') || 'TBD'}</div>}
                                            {remaining !== null && (
                                                <div style={{ fontSize: 12, color: remaining > 5 ? '#22c55e' : remaining > 0 ? '#f59e0b' : '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                                                    <ClockCircleOutlined style={{ marginRight: 5 }} />
                                                    {remaining > 0 ? `${remaining} days remaining` : 'Ended'}
                                                </div>
                                            )}
                                            {start && end && <Progress percent={percent} size="small" strokeColor="#6366f1" showInfo={false} strokeLinecap="round" />}
                                            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                                                <button onClick={() => { setBatchModalOpen(false); navigate('/app/my-quizzes'); }} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #e0e7ff', background: '#f4f3ff', color: '#6366f1', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Quizzes</button>
                                                <button onClick={() => { setBatchModalOpen(false); navigate('/app/my-resources'); }} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #dcfce7', background: '#f0fdf4', color: '#22c55e', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Resources</button>
                                                <button onClick={() => { setBatchModalOpen(false); navigate('/app/my-schedule'); }} style={{ flex: 1, padding: '6px 0', borderRadius: 8, border: '1px solid #e0f2fe', background: '#f0f9ff', color: '#0ea5e9', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Schedule</button>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                )}
            </Modal>

            {/* ════ JOIN CLASS MODAL ════ */}
            <Modal
                title={<div style={{ fontWeight: 700, color: '#1a1d2e' }}><VideoCameraOutlined style={{ color: '#22c55e', marginRight: 8 }} />Join Class</div>}
                open={joinClassModalVisible}
                onCancel={() => setJoinClassModalVisible(false)}
                footer={null}
                destroyOnClose
                width={380}
            >
                <Text style={{ display: 'block', marginBottom: 16, color: '#64748b', fontSize: 13 }}>
                    {sessionStatus?.canJoin ? 'Enter the access code provided by your teacher.' : (sessionStatus?.reason || 'The class has not started yet.')}
                </Text>
                <Form form={form} layout="vertical" onFinish={handleSubmitAccessCode}>
                    <Form.Item label={<span style={{ fontWeight: 600, color: '#4b5563', fontSize: 13 }}>Access Code</span>} name="accessCode" rules={[{ required: true, message: 'Please enter the access code' }]}>
                        <Input placeholder="e.g. ABC123" value={accessCode} onChange={e => setAccessCode(e.target.value)} style={{ borderRadius: 10, height: 42, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', fontSize: 16 }} />
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                        <Button onClick={() => setJoinClassModalVisible(false)} style={{ borderRadius: 10, height: 40 }}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={joiningClass}
                            style={{ borderRadius: 10, height: 40, background: 'linear-gradient(135deg,#22c55e,#15803d)', border: 'none', fontWeight: 700 }}>
                            Join Class
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default StudentDashboard;