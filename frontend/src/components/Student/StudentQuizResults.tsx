import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Row, Col,
    Progress, Alert, Empty, Tooltip, Collapse, Skeleton,
    Select, DatePicker
} from 'antd';

const { RangePicker } = DatePicker;
import {
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    CalendarOutlined,
    FileTextOutlined,
    BarChartOutlined,
    LockOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { formatLocal } from '../../utils/timezone';
import type { ColumnsType } from 'antd/es/table';
import KpiCard from '../Common/KpiCard';
import PageHeader from '../Common/PageHeader';
import useResponsive from '../../hooks/useResponsive';


/* ── Types ── */
interface QuizResult {
    id: number; quiz_id: number; quiz_title: string; quiz_description: string;
    batch_name: string; end_date?: string | null; results_locked?: boolean;
    score: number | null; max_score: number | null; percentage: number | null;
    time_taken: number; submitted_at: string;
    status: 'submitted' | 'auto_submitted' | 'graded';
    total_questions: number | null; correct_answers: number | null;
    teacher_feedback?: string;
    teacher_first_name?: string;
    teacher_last_name?: string;
}
interface AudioClipInfo {
    id: number; duration_seconds?: number; audio_order: number; max_plays: number; has_audio: boolean;
}
interface DetailedResult {
    quiz: { id: number; title: string; description: string; total_marks: number; duration_minutes: number; };
    submission: { id: number; score: number; max_score: number; percentage: number; time_taken: number; submitted_at: string; teacher_feedback?: string; };
    questions: Array<{
        id: number; question_text: string; question_type: string; points: number;
        student_answer?: string; correct_answer?: string; is_correct?: boolean;
        score?: number; teacher_feedback?: string; audio_clip_id?: number | null;
        options?: Array<{ id: number; option_text: string; is_correct: boolean }>;
        selected_options?: number[] | string;
    }>;
    audio_clips?: AudioClipInfo[];
}

/* ── Helpers ── */
const scoreColor = (pct: number) => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
};
const gradeText = (pct: number) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
};
const qScoreColor = (score?: number, points?: number) => {
    const s = Number(score || 0), p = Number(points || 0);
    if (p <= 0) return '#94a3b8';
    if (s <= 0) return '#ef4444';
    return (s / p) * 100 >= 100 ? '#22c55e' : '#f59e0b';
};
const fmtTime = (secs: number) => {
    const m = Math.floor(secs / 60), s = secs % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

/* ── Pill ── */
const Pill = ({ color, text }: { color: string; text: string }) => {
    const map: Record<string, { bg: string; fg: string }> = {
        green: { bg: '#dcfce7', fg: '#15803d' },
        amber: { bg: '#fffbeb', fg: '#b45309' },
        red:   { bg: '#fff1f2', fg: '#ef4444' },
        indigo:{ bg: '#eef2ff', fg: '#4338ca' },
        gray:  { bg: '#f1f5f9', fg: '#64748b' },
    };
    const c = map[color] || map.gray;
    return <span style={{ fontSize: 11, fontWeight: 700, color: c.fg, background: c.bg, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>{text}</span>;
};

/* ══════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════ */
const StudentQuizResults: React.FC = () => {
    const responsive = useResponsive();
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(null);
    const [loadingQuizId, setLoadingQuizId] = useState<number | null>(null);
    const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
    const { apiCall, user } = useAuth();
    // Render quiz timestamps in the student's saved profile timezone.
    const tz = user?.timezone || 'UTC';
    const fmtDay = (iso?: string | null) =>
        iso ? formatLocal(iso, tz, {
            month: 'short', day: '2-digit', year: 'numeric',
            weekday: undefined, hour: undefined, minute: undefined, hour12: undefined,
        }) : '—';
    const fmtTimeOnly = (iso?: string | null) =>
        iso ? formatLocal(iso, tz, {
            hour: '2-digit', minute: '2-digit', hour12: false,
            weekday: undefined, year: undefined, month: undefined, day: undefined,
        }) : '—';
    const fmtFull = (iso?: string | null) =>
        iso ? formatLocal(iso, tz, {
            month: 'short', day: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false,
            weekday: undefined,
        }) : '—';
    const fmtCompact = (iso?: string | null) =>
        iso ? formatLocal(iso, tz, {
            month: 'short', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hour12: false,
            weekday: undefined, year: undefined,
        }) : '—';

    // Filter states
    const [batchFilter, setBatchFilter] = useState<string | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [gradeFilter, setGradeFilter] = useState<string | null>(null);

    useEffect(() => { fetchQuizResults(); }, []);

    // Deep-link: ?focus=<submissionId> from grade_published notification —
    // pulse-highlight the matching row.
    const [searchParams] = useSearchParams();
    const focusId = searchParams.get('focus');
    useEffect(() => {
        if (!focusId || loading) return;
        const idNum = Number(focusId);
        if (!Number.isFinite(idNum)) return;
        const tid = setTimeout(() => {
            const el = document.querySelector(`[data-focus-id="${idNum}"]`) as HTMLElement | null;
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('focus-pulse');
                setTimeout(() => el.classList.remove('focus-pulse'), 2500);
            }
        }, 250);
        return () => clearTimeout(tid);
    }, [focusId, loading, results]);

    const fetchQuizResults = async () => {
        try {
            const r = await apiCall('/quizzes/student/results');
            if (r.ok) { const d = await r.json(); setResults((d.results || []) as QuizResult[]); }
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const fetchDetailedResult = async (quizId: number) => {
        setLoadingQuizId(quizId);
        try {
            const r = await apiCall(`/quizzes/${quizId}/student-results`);
            if (r.ok) {
                const data = await r.json();
                setSelectedResult(data);
                setDetailModalVisible(true);
                // Preload audio blobs
                const clips: AudioClipInfo[] = (data.audio_clips || []).filter((c: AudioClipInfo) => c.has_audio);
                if (clips.length > 0) {
                    const urls: Record<number, string> = {};
                    await Promise.all(clips.map(async (clip) => {
                        try {
                            const ar = await apiCall(`/quizzes/audio/${clip.id}/stream`);
                            if (ar.ok) {
                                const j = await ar.json();
                                if (j.audioData) {
                                    const bc = atob(j.audioData), ba = new Uint8Array(bc.length);
                                    for (let i = 0; i < bc.length; i++) ba[i] = bc.charCodeAt(i);
                                    urls[clip.id] = URL.createObjectURL(new Blob([ba], { type: j.contentType || 'audio/wav' }));
                                }
                            }
                        } catch (e) { console.warn(`Audio ${clip.id}`, e); }
                    }));
                    setAudioUrls(urls);
                }
            }
        } catch { /* silent */ }
        finally { setLoadingQuizId(null); }
    };

    const getQuestionStatus = (q: DetailedResult['questions'][number]) => {
        const isMcq = q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple';
        if (isMcq) {
            const s = Number(q.score || 0), p = Number(q.points || 0);
            const color = qScoreColor(q.score, q.points);
            const text = p > 0 ? (s <= 0 ? 'Incorrect' : s >= p ? 'Correct' : 'Partial') : 'Incorrect';
            return { color, text, correct: s >= p };
        }
        return { color: q.is_correct ? '#22c55e' : '#ef4444', text: q.is_correct ? 'Correct' : 'Incorrect', correct: !!q.is_correct };
    };

    /* ── Stats ── */
    const availableBatches = React.useMemo(() => {
        const set = new Set<string>();
        results.forEach(r => {
            if (r.batch_name) set.add(r.batch_name);
        });
        return Array.from(set).map(name => ({ value: name, label: name }));
    }, [results]);

    const availableTeachers = React.useMemo(() => {
        const set = new Set<string>();
        results.forEach(r => {
            const tName = `${r.teacher_first_name || ''} ${r.teacher_last_name || ''}`.trim();
            if (tName) set.add(tName);
        });
        return Array.from(set).map(name => ({ value: name, label: name }));
    }, [results]);

    const availableGrades = React.useMemo(() => {
        const set = new Set<string>();
        results.forEach(r => {
            if (r.percentage != null && !r.results_locked) {
                set.add(gradeText(Number(r.percentage)));
            }
        });
        const order = ['A+', 'A', 'B', 'C', 'D', 'F'];
        return Array.from(set).sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(g => ({ value: g, label: `Grade ${g}` }));
    }, [results]);

    const filteredResults = React.useMemo(() => {
        return results.filter(r => {
            if (batchFilter && r.batch_name !== batchFilter) return false;
            const tName = `${r.teacher_first_name || ''} ${r.teacher_last_name || ''}`.trim();
            if (teacherFilter && tName !== teacherFilter) return false;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const sDate = dayjs(r.submitted_at);
                if (sDate.isBefore(dateRange[0].startOf('day')) || sDate.isAfter(dateRange[1].endOf('day'))) {
                    return false;
                }
            }
            if (gradeFilter && (!r.percentage && r.percentage !== 0 || r.results_locked || gradeText(Number(r.percentage)) !== gradeFilter)) return false;
            return true;
        });
    }, [results, batchFilter, teacherFilter, dateRange, gradeFilter]);

    const unlocked = filteredResults.filter(r => !r.results_locked);
    const valid = unlocked.filter(r => Number(r.max_score || 0) > 0);
    const sumS = valid.reduce((s, r) => s + Number(r.score || 0), 0);
    const sumM = valid.reduce((s, r) => s + Number(r.max_score || 0), 0);
    const avgScore = sumM > 0 ? Math.round((sumS / sumM) * 100) : 0;
    const bestScore = unlocked.length > 0 ? Math.max(...unlocked.map(r => Number(r.percentage || 0))) : 0;
    const totalTime = filteredResults.reduce((s, r) => s + Number(r.time_taken || 0), 0);
    const avgTimeSecs = filteredResults.length > 0 ? Math.round(totalTime / filteredResults.length) : 0;

    /* ── Columns ── */
    const columns: ColumnsType<QuizResult> = [
        {
            title: 'QUIZ', key: 'quiz', width: 260, fixed: 'left',
            render: (_, r) => (
                <div>
                    <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 13.5, marginBottom: 3 }}>{r.quiz_title}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eef2ff', borderRadius: 20, padding: '2px 8px' }}>
                        <FileTextOutlined style={{ fontSize: 10, color: '#6366f1' }} />
                        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{r.batch_name}</span>
                    </div>
                    {r.results_locked && (
                        <div style={{ marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fffbeb', borderRadius: 20, padding: '2px 8px', marginLeft: 4 }}>
                            <LockOutlined style={{ fontSize: 10, color: '#b45309' }} />
                            <span style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>Locked until {fmtCompact(r.end_date)}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'SCORE', key: 'score', width: 140,
            render: (_, r) => r.results_locked ? (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Hidden</span>
            ) : (
                <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor(Number(r.percentage || 0)) }}>{Number(r.percentage || 0).toFixed(1)}%</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{Number(r.score || 0).toFixed(1)}/{Number(r.max_score || 0).toFixed(1)} pts</div>
                    <Pill color={Number(r.percentage || 0) >= 50 ? 'green' : 'red'} text={gradeText(Number(r.percentage || 0))} />
                </div>
            )
        },
        {
            title: 'PERFORMANCE', key: 'performance', width: 180,
            render: (_, r) => r.results_locked ? (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
            ) : (
                <div>
                    <Progress percent={Number(r.percentage || 0)} size="small" strokeColor={scoreColor(Number(r.percentage || 0))} showInfo={false} strokeLinecap="round" />
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                        {Number(r.correct_answers || 0)}/{Number(r.total_questions || 0)} correct
                    </div>
                </div>
            ),
        },
        {
            title: 'TIME', key: 'time_taken', width: 110,
            render: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ClockCircleOutlined style={{ color: '#6366f1', fontSize: 13 }} />
                    <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }}>{fmtTime(r.time_taken)}</span>
                </div>
            ),
        },
        {
            title: 'SUBMITTED', key: 'submitted_at', width: 150,
            render: (_, r) => (
                <div>
                    <div style={{ fontSize: 13, color: '#1a1d2e', fontWeight: 600 }}>{fmtDay(r.submitted_at)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtTimeOnly(r.submitted_at)}</div>
                </div>
            ),
        },
        {
            title: 'ACTIONS', key: 'actions', width: 140, fixed: 'right',
            render: (_, r) => (
                <Tooltip title={r.results_locked ? 'Results available after quiz ends' : 'View detailed results'}>
                    <Button size="small" icon={<EyeOutlined />}
                        loading={loadingQuizId === r.quiz_id}
                        disabled={!!r.results_locked}
                        onClick={() => !r.results_locked && fetchDetailedResult(r.quiz_id)}
                        style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', background: '#f4f3ff', fontWeight: 600, height: 30 }}>
                        Details
                    </Button>
                </Tooltip>
            ),
        },
    ];

    /* ── Loading skeleton ── */
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: 24 }}><Skeleton.Input active style={{ width: 200, height: 26, borderRadius: 8 }} /><div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 140, height: 13, borderRadius: 6 }} /></div></div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[1,2,3,4].map(i => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <div style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(99,102,241,0.07)' }}>
                            <Skeleton.Avatar active size={46} shape="square" style={{ borderRadius: 13 }} />
                            <div style={{ flex: 1 }}><Skeleton.Input active style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 8 }} block /><Skeleton.Input active style={{ width: 44, height: 26, borderRadius: 6 }} /></div>
                        </div>
                    </Col>
                ))}
            </Row>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', flex: 1, overflow: 'hidden', boxShadow: '0 2px 12px rgba(99,102,241,0.07)' }}>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid #f8f8fc' }}>
                        <div style={{ flex: 3 }}><Skeleton.Input active style={{ width: '60%', height: 13, borderRadius: 5, marginBottom: 5 }} block /><Skeleton.Input active style={{ width: '30%', height: 11, borderRadius: 5 }} block /></div>
                        <Skeleton.Input active style={{ width: 70, height: 20, borderRadius: 20 }} />
                        <Skeleton.Input active style={{ width: 80, height: 20, borderRadius: 5 }} />
                        <Skeleton.Button active size="small" style={{ width: 65, height: 28, borderRadius: 8 }} />
                    </div>
                ))}
            </div>
        </div>
    );

    /* ── Render ── */
    return (
        <div className="student-portal" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <PageHeader
                title="My Results"
                subtitle={`${filteredResults.length} quiz result${filteredResults.length !== 1 ? 's' : ''} · avg score ${avgScore}%`}
                icon={<TrophyOutlined />}
                accent="#10b981"
            />

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: responsive.isCompact ? '12px 16px' : '14px 20px', marginBottom: responsive.isCompact ? 16 : 24, display: 'flex', gap: 12, flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
                <RangePicker
                    value={dateRange}
                    onChange={(dates: any) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                    style={{ borderRadius: 8 }}
                    allowClear
                />
                <Select
                    value={batchFilter}
                    onChange={setBatchFilter}
                    allowClear
                    placeholder="All Batches"
                    style={{ width: 220 }}
                    options={availableBatches}
                    showSearch
                    optionFilterProp="label"
                />
                <Select
                    value={teacherFilter}
                    onChange={setTeacherFilter}
                    allowClear
                    placeholder="All Teachers"
                    style={{ width: 220 }}
                    options={availableTeachers}
                    showSearch
                    optionFilterProp="label"
                />
                <Select
                    value={gradeFilter}
                    onChange={setGradeFilter}
                    allowClear
                    placeholder="All Grades"
                    style={{ width: 140 }}
                    options={availableGrades}
                />
            </div>

            {/* KPI Cards */}
            <Row gutter={responsive.isCompact ? [12, 12] : [16, 16]} style={{ marginBottom: responsive.isCompact ? 14 : 20, flexShrink: 0 }}>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Total Quizzes"   value={filteredResults.length}               icon={<FileTextOutlined />}   accent="#6366f1" />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Average Score"   value={avgScore}  suffix="%"         icon={<BarChartOutlined />}   accent="#10b981" />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Best Score"      value={Math.round(bestScore)} suffix="%" icon={<TrophyOutlined />} accent="#f59e0b" />
                </Col>
                <Col xs={12} sm={12} md={6}>
                    <KpiCard label="Avg Time Spent"  value={fmtTime(avgTimeSecs)}          icon={<ClockCircleOutlined />} accent="#0ea5e9" sub={`per quiz · ${fmtTime(totalTime)} total`} />
                </Col>
            </Row>

            {/* Table card */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

                {/* Table header bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f0f0f8', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 15 }}>
                            <BarChartOutlined />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e' }}>Results History</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#eef2ff', color: '#6366f1', borderRadius: 20, padding: '3px 12px' }}>
                        {filteredResults.length} total
                    </span>
                </div>

                {/* Table body — only rows scroll */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {filteredResults.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 220 }}>
                            <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No quiz results yet. Complete some quizzes first!</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredResults}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            scroll={{ y: 'calc(100vh - 370px)', x: 'max-content' }}
                            size={responsive.isCompact ? 'small' : 'middle'}
                            rowClassName={() => 'result-row'}
                            onRow={(r) => ({
                                'data-focus-id': r.id,
                            } as any)}
                        />
                    )}
                </div>
            </div>

            {/* ── Detail Modal ── */}
            <Modal
                title={null}
                open={detailModalVisible}
                onCancel={() => { setDetailModalVisible(false); setSelectedResult(null); Object.values(audioUrls).forEach(u => URL.revokeObjectURL(u)); setAudioUrls({}); }}
                footer={null}
                width={960}
                centered
                closable={true}
                closeIcon={
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', transition: 'all 0.2s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >✕</div>
                }
                wrapClassName="result-detail-modal"
                styles={{ body: { padding: 0, height: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
                style={{ top: 20 }}
            >
                {selectedResult && (
                    <>
                        {/* ═══ FIXED HEADER SECTION ═══ */}
                        <div style={{ flexShrink: 0 }}>
                            {/* Gradient banner */}
                            <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)', padding: '22px 52px 22px 28px', color: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selectedResult.quiz.title}</div>
                                        <div style={{ fontSize: 12, opacity: 0.8 }}>
                                            <CalendarOutlined style={{ marginRight: 6 }} />
                                            Submitted {fmtFull(selectedResult.submission.submitted_at)}
                                            {selectedResult.quiz.description && <span style={{ marginLeft: 12, opacity: 0.7 }}>· {selectedResult.quiz.description.length > 60 ? selectedResult.quiz.description.slice(0, 60) + '…' : selectedResult.quiz.description}</span>}
                                        </div>
                                    </div>
                                    {/* Large grade badge */}
                                    <div style={{ textAlign: 'center', minWidth: 70 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, margin: '0 auto' }}>
                                            {gradeText(selectedResult.submission.percentage)}
                                        </div>
                                        <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.6 }}>Grade</div>
                                    </div>
                                </div>

                                {/* Score KPIs row */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                    {[
                                        { icon: <TrophyOutlined />, label: 'Score', value: `${selectedResult.submission.percentage.toFixed(1)}%` },
                                        { icon: <CheckCircleOutlined />, label: 'Points', value: `${Number(selectedResult.submission.score).toFixed(2)} / ${Number(selectedResult.submission.max_score).toFixed(2)}` },
                                        { icon: <ClockCircleOutlined />, label: 'Time Taken', value: fmtTime(selectedResult.submission.time_taken) },
                                        { icon: <FileTextOutlined />, label: 'Questions', value: `${selectedResult.questions.length}` },
                                    ].map(item => (
                                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', borderRadius: 12, padding: '10px 14px', textAlign: 'center' }}>
                                            <div style={{ fontSize: 16, opacity: 0.8, marginBottom: 3 }}>{item.icon}</div>
                                            <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{item.label}</div>
                                            <div style={{ fontSize: 16, fontWeight: 800 }}>{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Overall performance bar */}
                            <div style={{ padding: '14px 28px', background: '#f8f7ff', borderBottom: '1px solid #f0f0f8' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5 }}>Overall Performance</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(selectedResult.submission.percentage) }}>{selectedResult.submission.percentage.toFixed(1)}%</span>
                                        {(() => {
                                            const correct = selectedResult.questions.filter(q => {
                                                const s = Number(q.score || 0), p = Number(q.points || 0);
                                                return p > 0 && s >= p;
                                            }).length;
                                            return <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{correct}/{selectedResult.questions.length} correct</span>;
                                        })()}
                                    </div>
                                </div>
                                <Progress percent={selectedResult.submission.percentage} strokeColor={scoreColor(selectedResult.submission.percentage)} showInfo={false} strokeLinecap="round" trailColor="#e0e7ff" size={{ height: 10 }} />
                            </div>

                            {/* Teacher feedback (still fixed) */}
                            {selectedResult.submission.teacher_feedback && (
                                <div style={{ padding: '0 28px', paddingTop: 12 }}>
                                    <Alert
                                        message={<span style={{ fontWeight: 700, color: '#1a1d2e' }}>Teacher Feedback</span>}
                                        description={selectedResult.submission.teacher_feedback}
                                        type="info"
                                        showIcon
                                        style={{ borderRadius: 12, border: '1px solid #c7d2fe' }}
                                    />
                                </div>
                            )}

                            {/* Question section header (fixed) */}
                            <div style={{ padding: '14px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 30, height: 30, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 14 }}>
                                        <FileTextOutlined />
                                    </div>
                                    <span style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 14 }}>Question-wise Review</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, background: '#eef2ff', color: '#6366f1', borderRadius: 20, padding: '3px 12px' }}>
                                    {selectedResult.questions.length} questions
                                </span>
                            </div>
                        </div>

                        {/* ═══ SCROLLABLE QUESTION SECTION ═══ */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 28px 24px', minHeight: 0 }} onContextMenu={e => e.preventDefault()} onCopy={e => e.preventDefault()}>
                            {(() => {
                                const questions = selectedResult.questions;
                                const audioClips: AudioClipInfo[] = selectedResult.audio_clips || [];
                                type QGroup = { type: 'audio'; clipId: number; clip: AudioClipInfo; questions: typeof questions } | { type: 'independent'; question: typeof questions[0] };
                                const groups: QGroup[] = [];
                                const audioMap = new Map<number, typeof questions>();
                                questions.forEach(q => { if (q.audio_clip_id) { if (!audioMap.has(q.audio_clip_id)) audioMap.set(q.audio_clip_id, []); audioMap.get(q.audio_clip_id)!.push(q); } });
                                const seen = new Set<number>();
                                questions.forEach(q => {
                                    if (q.audio_clip_id && !seen.has(q.audio_clip_id)) {
                                        seen.add(q.audio_clip_id);
                                        const clip = audioClips.find(c => c.id === q.audio_clip_id) || { id: q.audio_clip_id, audio_order: 0, max_plays: 0, has_audio: false };
                                        groups.push({ type: 'audio', clipId: q.audio_clip_id, clip, questions: audioMap.get(q.audio_clip_id) || [] });
                                    } else if (!q.audio_clip_id) {
                                        groups.push({ type: 'independent', question: q });
                                    }
                                });
                                let gIdx = 0;

                                const renderQ = (q: typeof questions[0], idx: number) => {
                                    const st = getQuestionStatus(q);
                                    const isMcq = q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple';
                                    const scorePct = Number(q.points) > 0 ? (Number(q.score || 0) / Number(q.points)) * 100 : 0;
                                    return (
                                        <Collapse.Panel
                                            key={`q-${q.id}`}
                                            header={
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                                        <div style={{ flex: 1, fontSize: 13, color: '#1a1d2e', lineHeight: 1.5 }}>
                                                            <span style={{ fontWeight: 800, color: '#6366f1', marginRight: 6, fontSize: 14 }}>Q{idx}.</span>
                                                            {q.question_text}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: st.correct ? '#15803d' : '#ef4444', background: st.correct ? '#dcfce7' : '#fff1f2', borderRadius: 20, padding: '3px 10px' }}>
                                                                {st.correct ? '✓ ' : '✗ '}{st.text}
                                                            </span>
                                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', background: '#f1f5f9', borderRadius: 20, padding: '3px 10px' }}>
                                                                {Number(q.score ?? 0) % 1 === 0 ? Number(q.score ?? 0) : Number(q.score ?? 0).toFixed(2)}/{Number(q.points) % 1 === 0 ? Number(q.points) : Number(q.points).toFixed(2)} pts
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Mini progress for each question */}
                                                    <div style={{ marginTop: 6 }}>
                                                        <Progress percent={scorePct} size={{ height: 4 }} strokeColor={st.correct ? '#22c55e' : scorePct > 0 ? '#f59e0b' : '#ef4444'} showInfo={false} strokeLinecap="round" trailColor="#f1f5f9" />
                                                    </div>
                                                </div>
                                            }
                                        >
                                            <div style={{ padding: '4px 0' }}>
                                                {isMcq && q.options && q.options.length > 0 ? (() => {
                                                    let selIds: number[] = [];
                                                    try { if (Array.isArray(q.selected_options)) selIds = q.selected_options as number[]; else if (q.selected_options) { const p = JSON.parse(q.selected_options as string); if (Array.isArray(p)) selIds = p; } } catch { selIds = []; }
                                                    const selOpts = q.options.filter(o => selIds.includes(o.id));
                                                    return (
                                                        <div>
                                                            <div style={{ marginBottom: 10 }}>
                                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Your Answer</div>
                                                                {selOpts.length > 0 ? (
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                                        {selOpts.map(o => (
                                                                            <span key={o.id} style={{ fontSize: 12, fontWeight: 600, color: o.is_correct ? '#15803d' : '#ef4444', background: o.is_correct ? '#dcfce7' : '#fff1f2', borderRadius: 8, padding: '5px 12px', border: `1px solid ${o.is_correct ? '#bbf7d0' : '#fecdd3'}` }}>
                                                                                {o.is_correct ? '✓ ' : '✗ '}{o.option_text}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                ) : <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No answer provided</span>}
                                                            </div>
                                                            {q.options.some(o => o.is_correct) && (
                                                                <div>
                                                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Correct Answer</div>
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                                        {q.options.filter(o => o.is_correct).map(o => (
                                                                            <span key={`c-${o.id}`} style={{ fontSize: 12, fontWeight: 600, color: '#15803d', background: '#dcfce7', borderRadius: 8, padding: '5px 12px', border: '1px solid #bbf7d0' }}>
                                                                                ✓ {o.option_text}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })() : (
                                                    <div>
                                                        {q.student_answer && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Your Answer</div>
                                                                <div style={{ fontSize: 13, color: '#1a1d2e', background: '#f8fafc', borderRadius: 8, padding: '8px 12px', border: '1px solid #f1f5f9' }}>{q.student_answer}</div>
                                                            </div>
                                                        )}
                                                        {q.correct_answer && q.student_answer !== q.correct_answer && (
                                                            <div>
                                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Correct Answer</div>
                                                                <div style={{ fontSize: 13, color: '#15803d', background: '#dcfce7', borderRadius: 8, padding: '8px 12px', border: '1px solid #bbf7d0' }}>{q.correct_answer}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {q.teacher_feedback && (
                                                    <div style={{ marginTop: 10, background: '#fffbeb', borderRadius: 10, padding: '10px 14px', border: '1px solid #fde68a' }}>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Teacher Feedback</div>
                                                        <div style={{ fontSize: 12, color: '#4b5563', fontStyle: 'italic' }}>{q.teacher_feedback}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </Collapse.Panel>
                                    );
                                };

                                return (
                                    <div>
                                        {groups.map((group, gi) => {
                                            if (group.type === 'independent') {
                                                gIdx++;
                                                return <Collapse accordion bordered={false} style={{ background: '#fafafa', marginBottom: 8, borderRadius: 12, border: '1px solid #f0f0f8' }} key={`ind-${group.question.id}`}>{renderQ(group.question, gIdx)}</Collapse>;
                                            }
                                            const qs = group.questions;
                                            const pts = qs.reduce((s, q) => s + Number(q.score || 0), 0);
                                            const max = qs.reduce((s, q) => s + Number(q.points || 0), 0);
                                            const pct = max > 0 ? Math.round((pts / max) * 100) : 0;
                                            return (
                                                <div key={`audio-${group.clipId}`} style={{ marginBottom: 14, borderRadius: 14, overflow: 'hidden', border: '1.5px solid #06b6d4', boxShadow: '0 2px 12px rgba(6,182,212,0.1)' }}>
                                                    <div style={{ background: 'linear-gradient(135deg,#0891b2,#22d3ee)', padding: '14px 18px', color: '#fff' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎧</div>
                                                            <div>
                                                                <div style={{ fontWeight: 700, fontSize: 14 }}>Listening — Audio {group.clip.audio_order || gi + 1}</div>
                                                                <div style={{ fontSize: 11, opacity: 0.8 }}>{qs.length} question{qs.length > 1 ? 's' : ''}</div>
                                                            </div>
                                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                                {[{ label: 'Points', val: `${pts.toFixed(pts % 1 ? 2 : 0)}/${max.toFixed(max % 1 ? 2 : 0)}` }, { label: 'Score', val: `${pct}%` }].map(it => (
                                                                    <div key={it.label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 12px', textAlign: 'center' }}>
                                                                        <div style={{ fontSize: 10, opacity: 0.7 }}>{it.label}</div>
                                                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{it.val}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {audioUrls[group.clipId] && (
                                                            <audio controls controlsList="nodownload noplaybackrate" onContextMenu={e => e.preventDefault()} src={audioUrls[group.clipId]}
                                                                style={{ width: '100%', height: 32, borderRadius: 8, filter: 'invert(1) hue-rotate(180deg)', opacity: 0.9 }} />
                                                        )}
                                                    </div>
                                                    <div style={{ background: '#f0fdfa', padding: '10px 14px' }}>
                                                        <Collapse accordion bordered={false} style={{ background: 'transparent' }}>
                                                            {qs.map(q => { gIdx++; return renderQ(q, gIdx); })}
                                                        </Collapse>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </>
                )}
            </Modal>

            <style>{`
                .result-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th { background: #fafafa !important; font-weight: 700 !important; color: #4b5563 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }

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
            <style>{`
                .result-detail-modal .ant-modal-close { top: 8px !important; right: 8px !important; width: auto !important; height: auto !important; z-index: 10 !important; }
                .result-detail-modal .ant-modal-close-x { width: auto !important; height: auto !important; line-height: 1 !important; }
                .result-detail-modal .ant-modal-header { display: none !important; }
                .result-detail-modal .ant-modal-content { border-radius: 16px !important; overflow: hidden !important; padding: 0 !important; }
            `}</style>
        </div>
    );
};

export default StudentQuizResults;