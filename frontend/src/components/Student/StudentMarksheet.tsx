import React, { useEffect, useMemo, useState } from 'react';
import { Table, Empty, Progress, Tooltip, Alert, Select, Modal, Button, Row, Col, Skeleton } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, RiseOutlined, CalendarOutlined, DashboardOutlined, TrophyOutlined, FileTextOutlined, BookOutlined, LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart } from '@mui/x-charts';



/* ── Types ── */
interface QuizResult {
    id: number; quiz_id: number; quiz_title: string;
    batch_id: number | null; batch_name: string | null;
    score: number | null; max_score: number | null; percentage: number | null;
    submitted_at: string | null;
    results_locked?: boolean | 0 | 1;
}
interface BatchAggregate {
    batch_id: number | null; batch_name: string;
    quizzes_count: number; completed_count: number;
    average_percentage: number; best_percentage: number; lowest_percentage: number;
    last_quiz_date: string | null; pass_rate: number;
}

/* ── Helpers ── */
const toFixed = (v: number | null | undefined, d = 2) => { if (v == null || isNaN(Number(v))) return 0; return Number(Number(v).toFixed(d)); };
const gradeFromPercent = (p: number) => { if (p >= 95) return 'A+'; if (p >= 90) return 'A'; if (p >= 85) return 'A-'; if (p >= 80) return 'B+'; if (p >= 75) return 'B'; if (p >= 70) return 'B-'; if (p >= 65) return 'C+'; if (p >= 60) return 'C'; if (p >= 55) return 'D+'; if (p >= 50) return 'D'; return 'F'; };
const scoreColor = (pct: number) => { if (pct >= 80) return '#22c55e'; if (pct >= 60) return '#f59e0b'; return '#ef4444'; };
const gradeAccent = (g: string) => {
    if (['A+','A','A-'].includes(g)) return { fg: '#15803d', bg: '#dcfce7' };
    if (['B+','B','B-'].includes(g)) return { fg: '#b45309', bg: '#fffbeb' };
    if (['C+','C','D+','D'].includes(g)) return { fg: '#c2410c', bg: '#fff7ed' };
    return { fg: '#ef4444', bg: '#fff1f2' };
};

/* ── KPI Card ── */
const KpiCard = ({ label, value, suffix = '', icon, accent, sub }: {
    label: string; value: string | number; suffix?: string; icon: React.ReactNode; accent: string; sub?: string;
}) => (
    <div style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: accent, flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>
                {value}<span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginLeft: 3 }}>{suffix}</span>
            </div>
            {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
        </div>
    </div>
);

/* ── Grade Badge ── */
const GradeBadge = ({ grade, size = 'md' }: { grade: string; size?: 'sm' | 'md' | 'lg' }) => {
    const a = gradeAccent(grade);
    const px = size === 'lg' ? '14px 22px' : size === 'md' ? '5px 14px' : '3px 10px';
    const fs = size === 'lg' ? 22 : size === 'md' ? 14 : 11;
    return <span style={{ fontSize: fs, fontWeight: 800, color: a.fg, background: a.bg, borderRadius: 20, padding: px, whiteSpace: 'nowrap' }}>{grade}</span>;
};

/* ── Custom tab pills (for section switching) ── */
const TABS = ['By Batch', 'Detailed Results'] as const;
type TabKey = typeof TABS[number];

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const StudentMarksheet: React.FC = () => {
    const { apiCall } = useAuth();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedBatches, setSelectedBatches] = useState<string[]>(['all']);
    const [analyzerOpen, setAnalyzerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('By Batch');

    useEffect(() => {
        (async () => {
            setLoading(true); setError(null);
            try {
                const res = await apiCall('/quizzes/student/results');
                if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || 'Failed to fetch'); }
                const data: any = await res.json();
                setResults(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []);
            } catch (e: any) { setError(e?.message || 'Failed to load results'); }
            finally { setLoading(false); }
        })();
    }, [apiCall]);

    /* ── Batch options ── */
    const batchOptions = useMemo(() => {
        const m = new Map<string, string>();
        results.forEach(r => m.set(String(r.batch_id ?? 'unassigned'), r.batch_name ?? 'Unassigned'));
        return [{ value: 'all', label: 'All Batches' }, ...Array.from(m.entries()).map(([v, l]) => ({ value: v, label: l }))];
    }, [results]);

    const isAll = selectedBatches.includes('all') || selectedBatches.length === 0;
    const showBatchTable = isAll || selectedBatches.filter(v => v !== 'all').length > 2;

    const filtered = useMemo(() => {
        if (isAll) return results;
        const s = new Set(selectedBatches);
        return results.filter(r => s.has(String(r.batch_id ?? 'unassigned')));
    }, [results, selectedBatches, isAll]);

    const completed = useMemo(() => filtered.filter(r => !r.results_locked && r.percentage != null), [filtered]);

    const totals = useMemo(() => {
        const ts = completed.reduce((s, r) => s + (Number(r.score) || 0), 0);
        const ms = completed.reduce((s, r) => s + (Number(r.max_score) || 0), 0);
        return { totalScore: toFixed(ts), maxScore: toFixed(ms) };
    }, [completed]);

    const overall = useMemo(() => {
        if (completed.length === 0) return { total: 0, average: 0, best: 0, grade: '—' };
        const ts = completed.reduce((s, r) => s + (Number(r.score) || 0), 0);
        const ms = completed.reduce((s, r) => s + (Number(r.max_score) || 0), 0);
        const avg = ms > 0 ? (ts / ms) * 100 : 0;
        const best = Math.max(...completed.map(r => Number(r.percentage || 0)));
        return { total: completed.length, average: toFixed(avg), best: toFixed(best), grade: gradeFromPercent(avg) };
    }, [completed]);

    /* ── Batch aggregates ── */
    const batchAggs: BatchAggregate[] = useMemo(() => {
        const m = new Map<string, BatchAggregate & { total_score: number; total_max_score: number }>();
        filtered.forEach(r => {
            const key = String(r.batch_id ?? 'unassigned');
            if (!m.has(key)) m.set(key, { batch_id: r.batch_id ?? null, batch_name: r.batch_name ?? 'Unassigned', quizzes_count: 0, completed_count: 0, average_percentage: 0, best_percentage: 0, lowest_percentage: 100, last_quiz_date: null, pass_rate: 0, total_score: 0, total_max_score: 0 });
            const a = m.get(key)!;
            a.quizzes_count++;
            if (!r.results_locked && r.percentage != null) {
                a.completed_count++;
                a.total_score += Number(r.score) || 0;
                a.total_max_score += Number(r.max_score) || 0;
                a.best_percentage = Math.max(a.best_percentage, Number(r.percentage) || 0);
                a.lowest_percentage = Math.min(a.lowest_percentage, Number(r.percentage) || 0);
                if (r.submitted_at && (!a.last_quiz_date || dayjs(r.submitted_at).isAfter(dayjs(a.last_quiz_date)))) a.last_quiz_date = r.submitted_at;
            }
        });
        const arr: BatchAggregate[] = [];
        m.forEach(a => {
            if (a.completed_count > 0 && a.total_max_score > 0) a.average_percentage = toFixed((a.total_score / a.total_max_score) * 100);
            else a.average_percentage = 0;
            const { total_score: _ts, total_max_score: _ms, ...rest } = a;
            arr.push(rest);
        });
        return arr.sort((a, b) => b.average_percentage - a.average_percentage);
    }, [filtered]);

    const selectedAggs = useMemo(() => {
        if (isAll) return batchAggs;
        const s = new Set(selectedBatches);
        return batchAggs.filter(b => s.has(String(b.batch_id ?? 'unassigned')));
    }, [batchAggs, selectedBatches, isAll]);
    const canAnalyze = selectedAggs.length >= 2;

    /* ── Columns: batch performance ── */
    const batchCols = [
        {
            title: 'BATCH', dataIndex: 'batch_name', key: 'batch_name', width: 180, fixed: 'left' as const,
            render: (v: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 14 }}><BookOutlined /></div>
                    <span style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 13.5 }}>{v}</span>
                </div>
            ),
        },
        {
            title: 'PROGRESS', key: 'quizzes', width: 130,
            render: (_: any, row: BatchAggregate) => (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1d2e' }}>{row.completed_count}<span style={{ color: '#94a3b8', fontWeight: 500 }}>/{row.quizzes_count}</span></div>
                    <Progress percent={row.quizzes_count > 0 ? Math.round((row.completed_count / row.quizzes_count) * 100) : 0} size="small" strokeColor="#6366f1" showInfo={false} strokeLinecap="round" />
                </div>
            ),
        },
        {
            title: 'AVERAGE', dataIndex: 'average_percentage', key: 'avg', width: 160,
            render: (v: number) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(v) }}>{v.toFixed(1)}%</span>
                        <GradeBadge grade={gradeFromPercent(v)} size="sm" />
                    </div>
                    <Progress percent={Number(v.toFixed(1))} size="small" strokeColor={scoreColor(v)} showInfo={false} strokeLinecap="round" />
                </div>
            ),
            sorter: (a: BatchAggregate, b: BatchAggregate) => a.average_percentage - b.average_percentage,
            defaultSortOrder: 'descend' as const,
        },
        {
            title: 'BEST', dataIndex: 'best_percentage', key: 'best', width: 100,
            render: (v: number) => <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{v.toFixed(1)}%</span>,
            sorter: (a: BatchAggregate, b: BatchAggregate) => a.best_percentage - b.best_percentage,
        },
        {
            title: 'LOWEST', dataIndex: 'lowest_percentage', key: 'low', width: 100,
            render: (v: number) => <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>{v.toFixed(1)}%</span>,
            sorter: (a: BatchAggregate, b: BatchAggregate) => a.lowest_percentage - b.lowest_percentage,
        },
        {
            title: 'LAST QUIZ', dataIndex: 'last_quiz_date', key: 'last', width: 150,
            render: (v: string | null) => v ? (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d2e' }}>{dayjs(v).format('MMM DD, YYYY')}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{dayjs(v).format('HH:mm')}</div>
                </div>
            ) : <span style={{ color: '#94a3b8' }}>—</span>,
            sorter: (a: BatchAggregate, b: BatchAggregate) => dayjs(a.last_quiz_date || 0).valueOf() - dayjs(b.last_quiz_date || 0).valueOf(),
        },
    ];

    /* ── Columns: detailed results ── */
    const detailCols = [
        {
            title: 'QUIZ', dataIndex: 'quiz_title', key: 'quiz_title', width: 260, fixed: 'left' as const,
            render: (v: string, r: QuizResult) => (
                <div>
                    <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 13.5, marginBottom: 3 }}>{v}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eef2ff', borderRadius: 20, padding: '2px 8px' }}>
                        <BookOutlined style={{ fontSize: 10, color: '#6366f1' }} />
                        <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>{r.batch_name || 'Unassigned'}</span>
                    </div>
                    {r.results_locked && (
                        <div style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fffbeb', borderRadius: 20, padding: '2px 8px', marginLeft: 4 }}>
                            <LockOutlined style={{ fontSize: 10, color: '#b45309' }} />
                            <span style={{ fontSize: 10, color: '#b45309', fontWeight: 600 }}>Locked</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'SCORE', key: 'score', width: 140,
            render: (_: any, r: QuizResult) => r.results_locked ? <span style={{ color: '#94a3b8', fontSize: 12 }}>Hidden</span> : (
                <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: scoreColor(Number(r.percentage || 0)) }}>{toFixed(r.percentage)}%</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{toFixed(r.score)}/{toFixed(r.max_score)} pts</div>
                </div>
            ),
        },
        {
            title: 'GRADE', key: 'grade', width: 80,
            render: (_: any, r: QuizResult) => r.results_locked ? <span style={{ color: '#94a3b8' }}>—</span> : <GradeBadge grade={gradeFromPercent(Number(r.percentage || 0))} size="sm" />,
        },
        {
            title: 'PERFORMANCE', key: 'progress', width: 170,
            render: (_: any, r: QuizResult) => r.results_locked ? <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span> : (
                <div>
                    <Progress percent={Number(toFixed(r.percentage || 0))} size="small" strokeColor={scoreColor(Number(r.percentage || 0))} showInfo={false} strokeLinecap="round" />
                </div>
            ),
        },
        {
            title: 'SUBMITTED', dataIndex: 'submitted_at', key: 'submitted_at', width: 150,
            render: (v: string | null) => v ? (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d2e' }}>{dayjs(v).format('MMM DD, YYYY')}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{dayjs(v).format('HH:mm')}</div>
                </div>
            ) : <span style={{ color: '#94a3b8' }}>—</span>,
            sorter: (a: QuizResult, b: QuizResult) => dayjs(a.submitted_at || 0).valueOf() - dayjs(b.submitted_at || 0).valueOf(),
        },
    ];

    const breakdownResults = useMemo(() =>
        completed.slice().sort((a, b) => dayjs(b.submitted_at || 0).valueOf() - dayjs(a.submitted_at || 0).valueOf()),
    [completed]);

    /* ═══════════════════════════════════
       SKELETON LOADING
    ═══════════════════════════════════ */
    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: 24 }}>
                <Skeleton.Input active style={{ width: 260, height: 26, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 180, height: 13, borderRadius: 6 }} /></div>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {[1,2,3,4,5].map(i => (
                    <Col xs={24} sm={12} md={i <= 4 ? 6 : 24} lg={i <= 5 ? (i <= 4 ? 5 : 4) : 6} key={i}>
                        <div style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 12px rgba(99,102,241,0.07)' }}>
                            <Skeleton.Avatar active size={46} shape="square" style={{ borderRadius: 13 }} />
                            <div style={{ flex: 1 }}><Skeleton.Input active style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 8 }} block /><Skeleton.Input active style={{ width: 50, height: 26, borderRadius: 6 }} /></div>
                        </div>
                    </Col>
                ))}
            </Row>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', flex: 1, overflow: 'hidden' }}>
                {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid #f8f8fc' }}>
                        <div style={{ flex: 3 }}><Skeleton.Input active style={{ width: '50%', height: 13, borderRadius: 5, marginBottom: 5 }} block /><Skeleton.Input active style={{ width: '25%', height: 11, borderRadius: 5 }} block /></div>
                        <Skeleton.Input active style={{ width: 70, height: 20, borderRadius: 20 }} />
                        <Skeleton.Input active style={{ width: 80, height: 14, borderRadius: 5 }} />
                    </div>
                ))}
            </div>
        </div>
    );

    /* ═══════════════════════════════════
       MAIN RENDER
    ═══════════════════════════════════ */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1d2e', letterSpacing: 0.2 }}>Academic Marksheet</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                        {overall.total} completed quiz{overall.total !== 1 ? 'zes' : ''} · avg {overall.average}% · grade {overall.grade}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Select
                        mode="multiple"
                        value={selectedBatches}
                        onChange={vals => {
                            const justSelectedAll = !selectedBatches.includes('all') && vals.includes('all');
                            if (justSelectedAll || vals.length === 0) {
                                setSelectedBatches(['all']);
                            } else {
                                setSelectedBatches(vals.filter(v => v !== 'all'));
                            }
                        }}
                        options={batchOptions}
                        style={{ minWidth: 180, flex: '1 1 180px' }}
                        placeholder="Filter by batch"
                        maxTagCount="responsive"
                    />
                    <Tooltip title={!canAnalyze ? 'Select ≥ 2 batches to compare' : 'Compare batch performance'}>
                        <Button
                            icon={<BarChartOutlined />}
                            disabled={!canAnalyze}
                            onClick={() => setAnalyzerOpen(true)}
                            style={{ borderRadius: 10, height: 36, fontWeight: 600, background: canAnalyze ? 'linear-gradient(135deg,#4f46e5,#6366f1)' : undefined, color: canAnalyze ? '#fff' : undefined, border: canAnalyze ? 'none' : undefined }}
                        >
                            Compare
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16, borderRadius: 12 }} />}

            {/* ── KPI Cards (5 across) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20, flexShrink: 0 }}>
                <KpiCard label="Completed" value={overall.total} icon={<CheckCircleOutlined />} accent="#22c55e" />
                <KpiCard label="Average Score" value={overall.average} suffix="%" icon={<DashboardOutlined />} accent="#6366f1" />
                <KpiCard label="Best Score" value={overall.best} suffix="%" icon={<RiseOutlined />} accent="#f59e0b" />
                <KpiCard label="Overall Grade" value={overall.grade === '—' ? '—' : overall.grade} icon={<TrophyOutlined />} accent={overall.grade === '—' ? '#94a3b8' : gradeAccent(overall.grade).fg} />
                <KpiCard label="Total Points" value={`${totals.totalScore}`} suffix={`/ ${totals.maxScore}`} icon={<FileTextOutlined />} accent="#0ea5e9" />
            </div>

            {/* ── Table card: flex-1, only rows scroll ── */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>

                {/* Custom tab bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #f0f0f8', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {TABS.map(tab => {
                            const isActive = activeTab === tab;
                            const count = tab === 'By Batch' ? batchAggs.length : breakdownResults.length;
                            return (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6, padding: '14px 16px',
                                        border: 'none', background: 'none', cursor: 'pointer',
                                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                                        color: isActive ? '#6366f1' : '#94a3b8',
                                        borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                                        marginBottom: -1, whiteSpace: 'nowrap', transition: 'all 0.15s', outline: 'none',
                                    }}
                                >
                                    {tab}
                                    <span style={{ fontSize: 11, fontWeight: 700, background: isActive ? '#eef2ff' : '#f1f5f9', color: isActive ? '#6366f1' : '#94a3b8', borderRadius: 20, padding: '1px 8px' }}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                    <Tooltip title="Quiz results are released per your teacher's schedule">
                        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CalendarOutlined style={{ fontSize: 12 }} /> Release schedule applies
                        </span>
                    </Tooltip>
                </div>

                {/* Table body — only rows scroll */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {activeTab === 'By Batch' ? (
                        !showBatchTable ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                                <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>Select "All Batches" or more than 2 batches to view comparison</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        ) : batchAggs.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                                <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No quiz results available yet</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        ) : (
                            <Table
                                columns={batchCols as any}
                                dataSource={batchAggs}
                                rowKey={r => String(r.batch_id ?? 'unassigned')}
                                pagination={false}
                                scroll={{ y: 'calc(100vh - 400px)', x: 850 }}
                                rowClassName={() => 'mark-row'}
                            />
                        )
                    ) : (
                        breakdownResults.length === 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                                <Empty description={<span style={{ color: '#94a3b8', fontSize: 13 }}>No completed quizzes to display</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </div>
                        ) : (
                            <Table
                                columns={detailCols as any}
                                dataSource={breakdownResults}
                                rowKey={r => String(r.id)}
                                pagination={false}
                                scroll={{ y: 'calc(100vh - 400px)', x: 800 }}
                                rowClassName={() => 'mark-row'}
                            />
                        )
                    )}
                </div>
            </div>

            {/* ── Performance Analyzer Modal ── */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 16 }}><BarChartOutlined /></div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 15 }}>Performance Comparison</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>{selectedAggs.length} batches selected</div>
                        </div>
                    </div>
                }
                open={analyzerOpen}
                width={900}
                onCancel={() => setAnalyzerOpen(false)}
                footer={<Button onClick={() => setAnalyzerOpen(false)} style={{ borderRadius: 10, height: 38 }}>Close</Button>}
            >
                {!canAnalyze ? (
                    <Alert type="info" showIcon message="Select at least two batches to analyze" style={{ borderRadius: 12 }} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Batch summary cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
                            {selectedAggs.map(a => {
                                const g = gradeFromPercent(a.average_percentage);
                                return (
                                    <div key={String(a.batch_id)} style={{ borderRadius: 14, border: `1.5px solid ${scoreColor(a.average_percentage)}30`, padding: '14px 16px', background: '#fafafe' }}>
                                        <div style={{ height: 3, borderRadius: 3, background: scoreColor(a.average_percentage), marginBottom: 10 }} />
                                        <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 13, marginBottom: 6 }}>{a.batch_name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 22, fontWeight: 800, color: scoreColor(a.average_percentage) }}>{a.average_percentage.toFixed(1)}%</span>
                                            <GradeBadge grade={g} size="sm" />
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{a.completed_count}/{a.quizzes_count} quizzes</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Charts */}
                        <div style={{ borderRadius: 14, border: '1px solid #f0f0f8', padding: 20, background: '#fafafe' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 14 }}>Average Score by Batch</div>
                            <BarChart
                                height={280}
                                xAxis={[{ scaleType: 'band', data: selectedAggs.map(a => a.batch_name) }]}
                                series={[{ data: selectedAggs.map(a => toFixed(a.average_percentage)), color: '#6366f1', label: 'Average %' }]}
                            />
                        </div>
                        <div style={{ borderRadius: 14, border: '1px solid #f0f0f8', padding: 20, background: '#fafafe' }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1d2e', marginBottom: 14 }}>Completion Rate by Batch</div>
                            <BarChart
                                height={280}
                                xAxis={[{ scaleType: 'band', data: selectedAggs.map(a => a.batch_name) }]}
                                series={[{ data: selectedAggs.map(a => a.quizzes_count ? toFixed((a.completed_count / a.quizzes_count) * 100) : 0), color: '#22c55e', label: 'Completion %' }]}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .mark-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th { background: #fafafa !important; font-weight: 700 !important; color: #4b5563 !important; font-size: 11px !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }
            `}</style>
        </div>
    );
};

export default StudentMarksheet;