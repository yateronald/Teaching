import React, { useState, useEffect, useRef } from 'react';
import {
    Table, Button, Modal, message, Typography,
    Progress, Row, Col, Empty, Skeleton,
    DatePicker, Select
} from 'antd';

const { RangePicker } = DatePicker;
import {
    PlayCircleOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
    BookOutlined,
    BarChartOutlined,
    CalendarOutlined,
    LockOutlined,
    FileTextOutlined,
    CloseOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import QuizTaking, { type QuizTakingHandle } from '../Quiz/QuizTaking';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { formatLocal } from '../../utils/timezone';
import KpiCard from '../Common/KpiCard';
import PageHeader from '../Common/PageHeader';
import useResponsive from '../../hooks/useResponsive';

const { Text, Paragraph } = Typography;

/* ── Types ── */
interface Quiz {
    id: number; title: string; description: string;
    total_questions: number; duration_minutes: number;
    total_marks?: number; status?: string;
    start_date?: string | null; end_date?: string | null;
    batch_names?: string;
    teacher_first_name?: string;
    teacher_last_name?: string;
    submission_status?: 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'completed';
    submission?: { total_score?: number; max_score?: number; percentage?: number; status?: string; } | null;
    created_at?: string;
    // Server-authoritative scheduling state — computed against PG NOW() so
    // it doesn't depend on the student's browser clock.
    can_start?: boolean;
    has_ended?: boolean;
    can_view_results?: boolean;
}
interface QuizAttempt {
    id: number; quiz_id: number; quiz_title: string;
    score: number; total_score?: number; max_score?: number;
    total_questions: number; correct_answers: number;
    time_taken: number; completed_at: string; passed: boolean; attempt_number: number;
    batch_name?: string; teacher_first_name?: string; teacher_last_name?: string;
}
interface QuizStats {
    total_quizzes: number; completed_quizzes: number;
    average_score: number; best_score: number;
    total_attempts: number; passed_quizzes: number;
}

/* ── Helpers ── */
const scoreColor = (pct: number) => {
    if (pct >= 90) return '#22c55e';
    if (pct >= 75) return '#6366f1';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
};
const formatDuration = (m: number) => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;

/* ── Status pill ── */
const StatusPill = ({ color, text }: { color: string; text: string }) => {
    const cfg: Record<string, { bg: string; fg: string }> = {
        green:  { bg: '#dcfce7', fg: '#15803d' },
        blue:   { bg: '#eef2ff', fg: '#4338ca' },
        red:    { bg: '#fff1f2', fg: '#ef4444' },
        gold:   { bg: '#fffbeb', fg: '#b45309' },
        default:{ bg: '#f1f5f9', fg: '#64748b' },
    };
    const c = cfg[color] || cfg.default;
    return (
        <span style={{ fontSize: 11, fontWeight: 700, color: c.fg, background: c.bg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
            {text}
        </span>
    );
};

/* ══════════════════════════════════
   TABS (custom, no antd Tabs)
══════════════════════════════════ */
const TABS = ['Available', 'Upcoming', 'Completed', 'Results'] as const;
type TabKey = typeof TABS[number];

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
const StudentQuizzes: React.FC = () => {
    const r = useResponsive();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [attemptsLoading, setAttemptsLoading] = useState(true);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [quizTakingVisible, setQuizTakingVisible] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<TabKey>('Available');
    const { apiCall, user } = useAuth();
    // Display all quiz times in the student's saved profile timezone (with
    // the offset stamped) so a quiz scheduled "15:00 UTC" reads as "16:00
    // GMT+1" for a Lagos student. Falls back to UTC if the student hasn't
    // set a timezone yet.
    const tz = user?.timezone || 'UTC';
    const fmtCompact = (iso?: string | null) =>
        iso ? formatLocal(iso, tz, {
            month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false,
            weekday: undefined, year: undefined,
        }) : '—';
    const fmtFull = (iso?: string | null) =>
        iso ? formatLocal(iso, tz, {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
            weekday: undefined,
        }) : '—';

    const [messageApi, contextHolder] = message.useMessage();
    const quizTakingRef = useRef<QuizTakingHandle | null>(null);

    const [batchFilter, setBatchFilter] = useState<string | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Deep-link: ?focus=<quizId> highlights the matching quiz card and
    // auto-switches to the tab that contains it.
    const [searchParams] = useSearchParams();
    const focusId = searchParams.get('focus');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        setAttemptsLoading(true);
        try {
            const [quizzesResp, attemptsResp] = await Promise.all([
                apiCall('/quizzes'),
                apiCall('/quizzes/student/results'),
            ]);

            if (quizzesResp.ok) {
                const data = await quizzesResp.json();
                const raw = Array.isArray(data) ? data : (data.quizzes || []);
                setQuizzes(raw.map((q: any) => ({ ...q, total_questions: Number(q?.total_questions ?? 0), duration_minutes: q?.duration_minutes != null ? Number(q.duration_minutes) : 0, total_marks: q?.total_marks != null ? Number(q.total_marks) : undefined })));
            } else messageApi.error('Failed to fetch quizzes');

            if (attemptsResp.ok) {
                const data = await attemptsResp.json();
                const results = (data?.results || []) as any[];
                setAttempts(results.filter((r: any) => r && r.results_locked === false).map((r: any, idx: number) => ({
                    id: r.id ?? idx, quiz_id: r.quiz_id, quiz_title: r.quiz_title,
                    score: Number(r.percentage ?? 0), total_score: Number(r.score ?? 0), max_score: Number(r.max_score ?? 0),
                    total_questions: Number(r.total_questions ?? 0), correct_answers: Number(r.correct_answers ?? 0),
                    time_taken: Number(r.time_taken ?? 0), completed_at: r.submitted_at || r.completed_at,
                    passed: Number(r.percentage ?? 0) >= 50, attempt_number: 1,
                    batch_name: r.batch_name,
                    teacher_first_name: r.teacher_first_name,
                    teacher_last_name: r.teacher_last_name
                })));
            } else messageApi.error('Failed to fetch attempts');
        } catch { messageApi.error('Error loading quiz data'); }
        finally { setLoading(false); setAttemptsLoading(false); }
    };

    const availableBatches = React.useMemo(() => {
        const set = new Set<string>();
        quizzes.forEach(q => {
            if (q.batch_names) {
                q.batch_names.split(',').forEach(bn => set.add(bn.trim()));
            }
        });
        attempts.forEach(a => {
            if (a.batch_name) set.add(a.batch_name);
        });
        return Array.from(set).map(name => ({ value: name, label: name }));
    }, [quizzes, attempts]);

    const availableTeachers = React.useMemo(() => {
        const set = new Set<string>();
        quizzes.forEach(q => {
            const tName = `${q.teacher_first_name || ''} ${q.teacher_last_name || ''}`.trim();
            if (tName) set.add(tName);
        });
        attempts.forEach(a => {
            const tName = `${a.teacher_first_name || ''} ${a.teacher_last_name || ''}`.trim();
            if (tName) set.add(tName);
        });
        return Array.from(set).map(name => ({ value: name, label: name }));
    }, [quizzes, attempts]);

    const filteredQuizzes = React.useMemo(() => {
        return quizzes.filter(q => {
            if (batchFilter && (!q.batch_names || !q.batch_names.includes(batchFilter))) return false;
            const tName = `${q.teacher_first_name || ''} ${q.teacher_last_name || ''}`.trim();
            if (teacherFilter && tName !== teacherFilter) return false;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const sDate = dayjs(q.start_date || q.created_at);
                if (sDate.isBefore(dateRange[0].startOf('day')) || sDate.isAfter(dateRange[1].endOf('day'))) {
                    return false;
                }
            }
            return true;
        });
    }, [quizzes, batchFilter, teacherFilter, dateRange]);

    const filteredAttempts = React.useMemo(() => {
        return attempts.filter(a => {
            if (batchFilter && a.batch_name !== batchFilter) return false;
            const tName = `${a.teacher_first_name || ''} ${a.teacher_last_name || ''}`.trim();
            if (teacherFilter && tName !== teacherFilter) return false;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const sDate = dayjs(a.completed_at);
                if (sDate.isBefore(dateRange[0].startOf('day')) || sDate.isAfter(dateRange[1].endOf('day'))) {
                    return false;
                }
            }
            return true;
        });
    }, [attempts, batchFilter, teacherFilter, dateRange]);

    useEffect(() => {
        const validAttempts = filteredAttempts.filter(a => typeof a.total_score === 'number' && typeof a.max_score === 'number' && a.max_score > 0);
        const ts = validAttempts.reduce((s, a) => s + a.total_score!, 0);
        const ms = validAttempts.reduce((s, a) => s + a.max_score!, 0);
        const scores = filteredAttempts.map(a => a.score).filter(s => typeof s === 'number');
        setStats({
            total_quizzes: filteredQuizzes.length,
            completed_quizzes: filteredQuizzes.filter(q => q.submission_status === 'completed').length,
            average_score: ms > 0 ? parseFloat(((ts / ms) * 100).toFixed(2)) : 0,
            best_score: scores.length ? Math.max(...scores) : 0,
            total_attempts: filteredAttempts.length,
            passed_quizzes: filteredAttempts.filter(a => a.score >= 50).length,
        });
    }, [filteredQuizzes, filteredAttempts]);

    const getQuizStatus = (quiz: Quiz) => {
        if (quiz.status !== 'published') return { status: 'inactive', color: 'default', text: 'Inactive' } as const;
        // Prefer server-authoritative flags. Fallback to client-side dayjs
        // only if those fields aren't present.
        if (quiz.can_start != null || quiz.has_ended != null) {
            if (quiz.has_ended) return { status: 'completed', color: 'gold', text: 'Ended' } as const;
            if (quiz.can_start === false) return { status: 'upcoming', color: 'blue', text: 'Upcoming' } as const;
            return { status: 'active', color: 'green', text: 'Active' } as const;
        }
        const now = dayjs();
        const s = quiz.start_date ? dayjs(quiz.start_date) : null;
        const e = quiz.end_date ? dayjs(quiz.end_date) : null;
        if (s && now.isBefore(s)) return { status: 'upcoming', color: 'blue', text: 'Upcoming' } as const;
        if (e && now.isAfter(e)) return { status: 'completed', color: 'gold', text: 'Ended' } as const;
        return { status: 'active', color: 'green', text: 'Active' } as const;
    };

    const canTakeQuiz = (quiz: Quiz) => {
        const st = getQuizStatus(quiz);
        const sub = quiz.submission_status;
        return st.status === 'active' && (sub === 'not_started' || sub === 'in_progress' || !sub);
    };

    /* ── Columns ── */
    const quizColumns: ColumnsType<Quiz> = [
        {
            title: 'QUIZ', key: 'quiz', width: 260, fixed: 'left',
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 13.5, marginBottom: 3 }}>{r.title}</div>
                    {r.description && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2, lineHeight: 1.4 }}>{r.description.length > 60 ? r.description.slice(0, 60) + '…' : r.description}</div>}
                    {r.batch_names && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eef2ff', borderRadius: 20, padding: '2px 8px', marginTop: 2 }}>
                            <BookOutlined style={{ fontSize: 10, color: '#6366f1' }} />
                            <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{r.batch_names}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'DETAILS', key: 'details', width: 160,
            render: (_, r) => (
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span><BookOutlined style={{ marginRight: 5, color: '#6366f1' }} />{r.total_questions} questions</span>
                    <span><ClockCircleOutlined style={{ marginRight: 5, color: '#f59e0b' }} />{formatDuration(r.duration_minutes)}</span>
                    <span><TrophyOutlined style={{ marginRight: 5, color: '#22c55e' }} />{r.total_marks ?? '—'} marks</span>
                </div>
            ),
        },
        {
            title: 'SCHEDULE', key: 'schedule', width: 180,
            render: (_, r) => (
                <div style={{ fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span><CalendarOutlined style={{ marginRight: 4, color: '#6366f1' }} />
                        {fmtCompact(r.start_date)}
                    </span>
                    <span style={{ color: '#94a3b8' }}>→ {fmtCompact(r.end_date)}</span>
                </div>
            ),
        },
        {
            title: 'STATUS', key: 'status', width: 110,
            render: (_, r) => { const s = getQuizStatus(r); return <StatusPill color={s.color} text={s.text} />; },
        },
        {
            title: 'PROGRESS', key: 'progress', width: 200,
            render: (_, r) => {
                // Lock results until the quiz officially ends, using server-
                // authoritative `has_ended` (which flips to true when PG NOW()
                // crosses the quiz end_date — independent of the student's
                // browser clock).
                const isLocked = r.has_ended != null
                    ? !r.has_ended
                    : (r.end_date ? dayjs(r.end_date).isAfter(dayjs()) : false);
                if (isLocked) {
                    return (
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fffbeb', borderRadius: 20, padding: '3px 10px', marginBottom: 4 }}>
                                <LockOutlined style={{ fontSize: 10, color: '#b45309' }} />
                                <span style={{ fontSize: 11, fontWeight: 600, color: '#b45309' }}>Locked</span>
                            </div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>Unlocks {fmtCompact(r.end_date)}</div>
                        </div>
                    );
                }
                const sub = r.submission_status;
                const pct = r.submission?.percentage ?? (r.submission?.total_score && r.submission?.max_score ? (r.submission.total_score / r.submission.max_score) * 100 : null);
                return (
                    <div>
                        <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize', marginBottom: pct != null ? 4 : 0 }}>
                            {sub ? sub.replace(/_/g, ' ') : 'not started'}
                        </div>
                        {pct != null && (
                            <>
                                <Progress percent={Number(pct.toFixed(1))} size="small" strokeColor={scoreColor(Number(pct))} showInfo={false} strokeLinecap="round" />
                                <div style={{ fontSize: 12, fontWeight: 700, color: scoreColor(Number(pct)) }}>{Number(pct).toFixed(1)}%</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'ACTIONS', key: 'actions', width: 160, fixed: 'right',
            render: (_, r) => (
                <div style={{ display: 'flex', gap: 6 }}>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedQuiz(r); setDetailsVisible(true); }}
                        style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', background: '#f4f3ff', fontWeight: 600, height: 30 }}>
                        Details
                    </Button>
                    {canTakeQuiz(r) && (
                        <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => { setSelectedQuizId(r.id); setQuizTakingVisible(true); }}
                            style={{ borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none', fontWeight: 700, height: 30 }}>
                            {r.submission_status === 'in_progress' ? 'Resume' : 'Start'}
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const attemptColumns: ColumnsType<QuizAttempt> = [
        { title: 'QUIZ', dataIndex: 'quiz_title', key: 'quiz_title', width: 220, fixed: 'left', ellipsis: true, render: (v) => <span style={{ fontWeight: 600, color: '#1a1d2e', fontSize: 13.5 }}>{v}</span> },
        {
            title: 'SCORE', key: 'score', width: 200,
            render: (_, r) => (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{r.correct_answers}/{r.total_questions} correct</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(r.score) }}>{r.score.toFixed(1)}%</span>
                    </div>
                    <Progress percent={r.score} size="small" strokeColor={scoreColor(r.score)} showInfo={false} strokeLinecap="round" />
                </div>
            ),
        },
        { title: 'RESULT', key: 'result', width: 100, render: (_, r) => <StatusPill color={r.passed ? 'green' : 'red'} text={r.passed ? 'PASSED' : 'FAILED'} /> },
        { title: 'TIME', dataIndex: 'time_taken', key: 'time_taken', width: 110, render: (m: number) => <span style={{ fontSize: 12, color: '#64748b' }}>{formatDuration(m)}</span> },
        { title: 'COMPLETED', dataIndex: 'completed_at', key: 'completed_at', width: 200, render: (d: string) => <span style={{ fontSize: 12, color: '#64748b' }}>{fmtFull(d)}</span> },
    ];

    const activeQuizzes = filteredQuizzes.filter(q => getQuizStatus(q).status === 'active');
    const upcomingQuizzes = filteredQuizzes.filter(q => getQuizStatus(q).status === 'upcoming');
    const completedQuizzes = filteredQuizzes.filter(q => q.submission_status === 'completed');

    // When a deep-link ?focus=<quizId> arrives, jump to the tab that contains it
    // and pulse-highlight the row. We wait until the data is loaded so the row exists.
    // /my-quizzes only receives quiz-id focuses (from quiz_published notifications).
    useEffect(() => {
        if (!focusId) return;
        if (loading || attemptsLoading) return;
        const idNum = Number(focusId);
        if (!Number.isFinite(idNum)) return;

        // Pick the tab containing this quiz
        let nextTab: TabKey | null = null;
        if (activeQuizzes.some(q => q.id === idNum)) nextTab = 'Available';
        else if (upcomingQuizzes.some(q => q.id === idNum)) nextTab = 'Upcoming';
        else if (completedQuizzes.some(q => q.id === idNum)) nextTab = 'Completed';

        if (nextTab && nextTab !== activeTab) setActiveTab(nextTab);

        // After paint, scroll the row into view and add the pulse class
        const tid = setTimeout(() => {
            const el = document.querySelector(`[data-focus-id="${idNum}"]`) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('focus-pulse');
                setTimeout(() => el.classList.remove('focus-pulse'), 2500);
            }
        }, 250);
        return () => clearTimeout(tid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusId, loading, attemptsLoading, activeQuizzes, upcomingQuizzes, completedQuizzes]);

    const TAB_DATA: Record<TabKey, { data: Quiz[] | QuizAttempt[]; columns: any; loading: boolean; empty: string }> = {
        Available:  { data: activeQuizzes,    columns: quizColumns,   loading, empty: 'No active quizzes available' },
        Upcoming:   { data: upcomingQuizzes,  columns: quizColumns,   loading, empty: 'No upcoming quizzes' },
        Completed:  { data: completedQuizzes, columns: quizColumns,   loading, empty: 'No completed quizzes' },
        Results:    { data: filteredAttempts,         columns: attemptColumns, loading: attemptsLoading, empty: 'No quiz results yet' },
    };

    const TAB_COUNTS: Record<TabKey, number> = {
        Available: activeQuizzes.length,
        Upcoming:  upcomingQuizzes.length,
        Completed: completedQuizzes.length,
        Results:   filteredAttempts.length,
    };

    /* ── Loading skeleton ── */
    if (loading || attemptsLoading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: 24 }}>
                <Skeleton.Input active style={{ width: 180, height: 26, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 120, height: 13, borderRadius: 6 }} /></div>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[1,2,3,4].map(i => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <div style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Skeleton.Avatar active size={46} shape="square" style={{ borderRadius: 13 }} />
                            <div style={{ flex: 1 }}><Skeleton.Input active style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 8 }} block /><Skeleton.Input active style={{ width: 44, height: 26, borderRadius: 6 }} /></div>
                        </div>
                    </Col>
                ))}
            </Row>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flex: 1, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', gap: 24 }}>
                    {TABS.map(t => <Skeleton.Input key={t} active style={{ width: 90, height: 15, borderRadius: 6 }} />)}
                </div>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderBottom: '1px solid #f8f8fc' }}>
                        <div style={{ flex: 3 }}><Skeleton.Input active style={{ width: '60%', height: 13, borderRadius: 5, marginBottom: 5 }} block /><Skeleton.Input active style={{ width: '35%', height: 11, borderRadius: 5 }} block /></div>
                        <Skeleton.Input active style={{ width: 70, height: 20, borderRadius: 20 }} />
                        <Skeleton.Input active style={{ width: 70, height: 20, borderRadius: 20 }} />
                        <div style={{ display: 'flex', gap: 6 }}><Skeleton.Button active size="small" style={{ width: 65, height: 28, borderRadius: 8 }} /><Skeleton.Button active size="small" style={{ width: 55, height: 28, borderRadius: 8 }} /></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const active = TAB_DATA[activeTab];

    return (
        <div className="student-portal" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {contextHolder}

            {/* ── Header ── */}
            <PageHeader
                title="My Quizzes"
                subtitle={`${filteredQuizzes.length} quiz${filteredQuizzes.length !== 1 ? 'zes' : ''} · ${activeQuizzes.length} active · ${filteredAttempts.length} completed`}
                icon={<FileTextOutlined />}
                accent="#10b981"
            />

            {/* ── Filters ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: r.isCompact ? '12px 16px' : '14px 20px', marginBottom: r.isCompact ? 16 : 24, display: 'flex', gap: 12, flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
                <RangePicker
                    value={dateRange}
                    onChange={(dates: any) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                    style={{ borderRadius: 8, flex: '1 1 200px', minWidth: 180 }}
                    allowClear
                />
                <Select
                    value={batchFilter}
                    onChange={setBatchFilter}
                    allowClear
                    placeholder="All Batches"
                    style={{ flex: '1 1 160px', minWidth: 140 }}
                    options={availableBatches}
                    showSearch
                    optionFilterProp="label"
                />
                <Select
                    value={teacherFilter}
                    onChange={setTeacherFilter}
                    allowClear
                    placeholder="All Teachers"
                    style={{ flex: '1 1 160px', minWidth: 140 }}
                    options={availableTeachers}
                    showSearch
                    optionFilterProp="label"
                />
            </div>

            {/* ── KPI Cards ── */}
            <Row gutter={r.isCompact ? [12, 12] : [16, 16]} style={{ marginBottom: r.isCompact ? 14 : 20, flexShrink: 0 }}>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Total Quizzes"     value={stats?.total_quizzes ?? 0}    icon={<BookOutlined />}         accent="#6366f1" />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Completed"          value={stats?.completed_quizzes ?? 0} icon={<CheckCircleOutlined />}  accent="#22c55e" />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Average Score"      value={stats?.average_score ?? 0}     icon={<BarChartOutlined />}     accent="#10b981" suffix="%" />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Best Score"         value={stats?.best_score ?? 0}        icon={<TrophyOutlined />}       accent="#f59e0b" suffix="%" />
                </Col>
            </Row>

            {/* ── Table card (flex-grow, only rows scroll) ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

                {/* Custom tab bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 20px', borderBottom: '1px solid #f0f0f8', flexShrink: 0, overflowX: 'auto' }}>
                    {TABS.map(tab => {
                        const isActive = activeTab === tab;
                        const count = TAB_COUNTS[tab];
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer',
                                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#6366f1' : '#94a3b8',
                                    borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                                    marginBottom: -1, whiteSpace: 'nowrap',
                                    transition: 'all 0.15s',
                                    outline: 'none',
                                }}
                            >
                                {tab}
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    background: isActive ? '#eef2ff' : '#f1f5f9',
                                    color: isActive ? '#6366f1' : '#94a3b8',
                                    borderRadius: 20, padding: '1px 8px',
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Table body */}
                <div style={{ flex: 1, overflow: 'hidden', padding: r.isMobile ? 12 : 0 }}>
                    {active.data.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                            <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>{active.empty}</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : r.isMobile ? (
                        /* ── Mobile: card stack ── */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
                            {activeTab === 'Results'
                                ? (active.data as QuizAttempt[]).map((row) => (
                                    <div key={row.id} style={{ background: '#fff', border: '1px solid #f0f0f8', borderRadius: 14, padding: 14 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 8 }}>{row.quiz_title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, color: '#64748b' }}>{row.correct_answers}/{row.total_questions} correct</span>
                                            <StatusPill color={row.passed ? 'green' : 'red'} text={row.passed ? 'PASSED' : 'FAILED'} />
                                        </div>
                                        <Progress percent={row.score} size="small" strokeColor={scoreColor(row.score)} showInfo={false} strokeLinecap="round" />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                                            <span>{formatDuration(row.time_taken)}</span>
                                            <span>{fmtFull(row.completed_at)}</span>
                                        </div>
                                    </div>
                                ))
                                : (active.data as Quiz[]).map((row) => {
                                    const status = getQuizStatus(row);
                                    const isLocked = row.has_ended != null
                                        ? !row.has_ended
                                        : (row.end_date ? dayjs(row.end_date).isAfter(dayjs()) : false);
                                    const sub = row.submission_status;
                                    const pct = row.submission?.percentage ?? (row.submission?.total_score && row.submission?.max_score ? (row.submission.total_score / row.submission.max_score) * 100 : null);
                                    return (
                                        <div
                                            key={row.id}
                                            data-focus-id={row.id}
                                            style={{ background: '#fff', border: '1px solid #f0f0f8', borderRadius: 14, padding: 14, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 4, lineHeight: 1.3 }}>{row.title}</div>
                                                    {row.batch_names && (
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eef2ff', borderRadius: 20, padding: '1.5px 7px', marginBottom: 4 }}>
                                                            <BookOutlined style={{ fontSize: 9, color: '#6366f1' }} />
                                                            <span style={{ fontSize: 10.5, color: '#6366f1', fontWeight: 600 }}>{row.batch_names}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <StatusPill color={status.color} text={status.text} />
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                                                <span><BookOutlined style={{ marginRight: 4, color: '#6366f1' }} />{row.total_questions} Q</span>
                                                <span><ClockCircleOutlined style={{ marginRight: 4, color: '#f59e0b' }} />{formatDuration(row.duration_minutes)}</span>
                                                <span><TrophyOutlined style={{ marginRight: 4, color: '#22c55e' }} />{row.total_marks ?? '—'} pts</span>
                                                <span style={{ width: '100%', color: '#94a3b8' }}>
                                                    <CalendarOutlined style={{ marginRight: 4 }} />
                                                    {fmtCompact(row.start_date)} → {fmtCompact(row.end_date)}
                                                </span>
                                            </div>
                                            {isLocked ? (
                                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fffbeb', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#b45309', fontWeight: 600 }}>
                                                    <LockOutlined style={{ fontSize: 10 }} />
                                                    Results unlock {fmtCompact(row.end_date)}
                                                </div>
                                            ) : pct != null && (
                                                <div style={{ marginBottom: 10 }}>
                                                    <Progress percent={Number(pct.toFixed(1))} size="small" strokeColor={scoreColor(Number(pct))} showInfo={false} strokeLinecap="round" />
                                                    <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(Number(pct)), marginTop: 2 }}>
                                                        {Number(pct).toFixed(1)}% · <span style={{ textTransform: 'capitalize', color: '#94a3b8', fontWeight: 500 }}>{sub ? sub.replace(/_/g, ' ') : 'not started'}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Button size="middle" icon={<EyeOutlined />} onClick={() => { setSelectedQuiz(row); setDetailsVisible(true); }}
                                                    style={{ borderRadius: 10, borderColor: '#e0e7ff', color: '#6366f1', background: '#f4f3ff', fontWeight: 600, flex: 1 }}>
                                                    Details
                                                </Button>
                                                {canTakeQuiz(row) && (
                                                    <Button size="middle" type="primary" icon={<PlayCircleOutlined />} onClick={() => { setSelectedQuizId(row.id); setQuizTakingVisible(true); }}
                                                        style={{ borderRadius: 10, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none', fontWeight: 700, flex: 1 }}>
                                                        {row.submission_status === 'in_progress' ? 'Resume' : 'Start'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    ) : (
                        <Table
                            columns={active.columns}
                            dataSource={active.data as any}
                            rowKey="id"
                            loading={active.loading}
                            scroll={{ y: 'calc(100vh - 370px)', x: 'max-content' }}
                            size={r.isCompact ? 'small' : 'middle'}
                            pagination={false}
                            rowClassName={() => 'quiz-table-row'}
                            onRow={(row: any) => ({
                                'data-focus-id': row?.id,
                            } as any)}
                            style={{ height: '100%' }}
                        />
                    )}
                </div>
            </div>

            {/* Pulse animation used to highlight a deep-linked quiz row */}
            <style>{`
                .focus-pulse {
                    animation: focus-pulse-anim 2.5s ease-out;
                    scroll-margin-top: 100px;
                }
                @keyframes focus-pulse-anim {
                    0%   { box-shadow: 0 0 0 0 rgba(99,102,241,0.5), 0 0 0 0 rgba(99,102,241,0.3); background-color: rgba(99,102,241,0.10); }
                    30%  { box-shadow: 0 0 0 6px rgba(99,102,241,0.2), 0 0 0 12px rgba(99,102,241,0.05); }
                    100% { box-shadow: 0 0 0 0 transparent; background-color: transparent; }
                }
            `}</style>

            {/* ── Quiz Detail Modal ── */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 16 }}>
                            <FileTextOutlined />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 15 }}>{selectedQuiz?.title || 'Quiz Details'}</div>
                            {selectedQuiz && <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>{getQuizStatus(selectedQuiz).text}</div>}
                        </div>
                    </div>
                }
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={() => setDetailsVisible(false)} style={{ borderRadius: 10, height: 38 }}>Close</Button>
                        {selectedQuiz && canTakeQuiz(selectedQuiz) && (
                            <Button type="primary" icon={<PlayCircleOutlined />}
                                onClick={() => { handleStartQuiz(selectedQuiz.id); setDetailsVisible(false); }}
                                style={{ borderRadius: 10, height: 38, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', border: 'none', fontWeight: 700 }}>
                                {selectedQuiz.submission_status === 'in_progress' ? 'Resume Quiz' : 'Take Quiz'}
                            </Button>
                        )}
                    </div>
                }
                width={r.isCompact ? '95vw' : 560}
                styles={{ body: { maxHeight: '75vh', overflowY: 'auto' } }}
            >
                {selectedQuiz && (
                    <div>
                        {selectedQuiz.description && <Paragraph style={{ color: '#64748b', marginBottom: 20 }}>{selectedQuiz.description}</Paragraph>}

                        {/* Info grid */}
                        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                            {[
                                { icon: <BookOutlined />,         label: 'Questions',   value: `${selectedQuiz.total_questions}`,  accent: '#6366f1' },
                                { icon: <ClockCircleOutlined />,  label: 'Duration',    value: formatDuration(selectedQuiz.duration_minutes), accent: '#f59e0b' },
                                { icon: <TrophyOutlined />,       label: 'Total Marks', value: `${selectedQuiz.total_marks ?? '—'}`, accent: '#22c55e' },
                                { icon: <CheckCircleOutlined />,  label: 'Status',      value: getQuizStatus(selectedQuiz).text,   accent: '#6366f1' },
                            ].map(item => (
                                <Col span={12} key={item.label}>
                                    <div style={{ borderRadius: 12, border: '1px solid #f0f0f8', padding: '12px 16px', background: '#fafafe' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <span style={{ color: item.accent, fontSize: 14 }}>{item.icon}</span>
                                            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</span>
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1d2e' }}>{item.value}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* Availability */}
                        <div style={{ background: '#f4f3ff', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Available Period</div>
                            <div style={{ fontSize: 13, color: '#4b5563' }}>
                                <CalendarOutlined style={{ marginRight: 6, color: '#6366f1' }} />
                                {fmtFull(selectedQuiz.start_date)}
                                {' → '}
                                {fmtFull(selectedQuiz.end_date)}
                            </div>
                        </div>

                        {/* Progress */}
                        <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>Your Progress</div>
                            {selectedQuiz.end_date && dayjs(selectedQuiz.end_date).isAfter(dayjs()) ? (
                                <><LockOutlined style={{ color: '#f59e0b', marginRight: 6 }} /><Text style={{ color: '#b45309', fontSize: 13 }}>Results locked until {fmtCompact(selectedQuiz.end_date)}</Text></>
                            ) : (
                                <div>
                                    <Text style={{ fontSize: 13, textTransform: 'capitalize', color: '#4b5563' }}>
                                        {selectedQuiz.submission_status ? selectedQuiz.submission_status.replace(/_/g, ' ') : 'not started'}
                                    </Text>
                                    {selectedQuiz.submission?.percentage != null && (
                                        <div style={{ marginTop: 8 }}>
                                            <Progress percent={Number(selectedQuiz.submission.percentage.toFixed(1))} strokeColor={scoreColor(selectedQuiz.submission.percentage)} strokeLinecap="round" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Quiz Taking Modal ── */}
            <Modal
                title={null} open={quizTakingVisible}
                onCancel={async () => {
                    const started = quizTakingRef.current?.isStarted?.();
                    if (started) {
                        Modal.confirm({
                            title: <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Submit before closing?</div>,
                            icon: <WarningOutlined style={{ color: '#ef4444', fontSize: '24px', marginRight: 12 }} />,
                            content: <div style={{ color: '#64748b', fontSize: '14.5px', marginTop: 8 }}>Your progress will be submitted. Are you sure you want to continue?</div>,
                            okText: 'Submit & Close', 
                            cancelText: 'Keep Taking',
                            okButtonProps: { 
                                style: { borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', fontWeight: 600, height: '36px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)' } 
                            },
                            cancelButtonProps: { 
                                style: { borderRadius: '10px', fontWeight: 600, height: '36px', border: '1.5px solid #e2e8f0' } 
                            },
                            centered: true,
                            width: 450,
                            className: 'premium-confirm-modal',
                            onOk: async () => {
                                const ok = await quizTakingRef.current?.submitNow?.(true);
                                if (ok) { setQuizTakingVisible(false); setSelectedQuizId(null); }
                            },
                        });
                        return;
                    }
                    setQuizTakingVisible(false); setSelectedQuizId(null);
                }}
                closeIcon={
                    <div className="quiz-premium-close">
                        <CloseOutlined />
                    </div>
                }
                footer={null} width={r.isMobile ? '100vw' : (r.isCompact ? '95vw' : 900)} centered={!r.isMobile} styles={{ body: { padding: 0 } }} destroyOnHidden
                className="quiz-taking-modal"
            >
                {selectedQuizId && <QuizTaking ref={quizTakingRef} quizId={selectedQuizId.toString()} onComplete={handleQuizComplete} />}
            </Modal>

            <style>{`
                .quiz-table-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th {
                    background: #fafafa !important; font-weight: 700 !important;
                    color: #4b5563 !important; font-size: 11px !important;
                    text-transform: uppercase !important; letter-spacing: 0.5px !important;
                }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }

                /* Premium Modal Confirm */
                .premium-confirm-modal .ant-modal-content {
                    border-radius: 16px !important;
                    padding: 32px 24px !important;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15) !important;
                }

                /* Custom Premium Close Button */
                .quiz-premium-close {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background-color: #f1f5f9;
                    color: #64748b;
                    font-size: 14px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .ant-modal-close {
                    top: 16px !important;
                    right: 16px !important;
                }
                .ant-modal-close:hover .quiz-premium-close {
                    background-color: #fee2e2;
                    color: #ef4444;
                    transform: rotate(90deg);
                }
            `}</style>
        </div>
    );

    function handleStartQuiz(quizId: number) {
        setSelectedQuizId(quizId);
        setQuizTakingVisible(true);
    }
    function handleQuizComplete() {
        setQuizTakingVisible(false);
        setSelectedQuizId(null);
        fetchData();
        messageApi.success('Quiz completed successfully!');
    }
};

export default StudentQuizzes;