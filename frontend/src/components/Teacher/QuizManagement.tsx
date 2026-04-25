import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, message, Space, Typography, Progress,
    Dropdown, Row, Col, Input, Select, Skeleton, DatePicker
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined,
    BarChartOutlined, MoreOutlined, SearchOutlined, ClockCircleOutlined,
    CheckCircleOutlined, BookOutlined, TrophyOutlined, EyeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import QuizBuilder from '../Quiz/QuizBuilder';
import QuizResults from '../Quiz/QuizResults';
import QuizInsights from '../Quiz/QuizInsights';
import QuizDetails from '../Quiz/QuizDetails';
import ErrorBoundary from '../ErrorBoundary';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;

interface Quiz {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name?: string;
    total_questions: number;
    duration_minutes: number;
    status: 'draft' | 'published';
    start_date?: string;
    end_date?: string;
    created_at: string;
    batch_names?: string;
    french_levels?: string;
    submitted_students?: number;
    total_students?: number;
    avg_score?: number;
    total_marks?: number;
}

interface Batch { id: number; name: string; }

function fmt(n: number | string | null | undefined): string {
    if (n == null || n === '') return '0';
    const v = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(v)) return '0';
    return Number.isInteger(v) ? v.toString() : v.toFixed(1).replace(/\.0$/, '');
}

function getStatusInfo(status: string, start?: string, end?: string) {
    if (status !== 'published') return { color: '#94a3b8', bg: '#f1f5f9', text: 'Draft' };
    const now = dayjs();
    if (start && now.isBefore(dayjs(start))) return { color: '#f59e0b', bg: '#fef3c7', text: 'Scheduled' };
    if (end && now.isAfter(dayjs(end))) return { color: '#ef4444', bg: '#fee2e2', text: 'Ended' };
    return { color: '#22c55e', bg: '#dcfce7', text: 'Active' };
}

function fmtRemaining(end?: string): string {
    if (!end) return '—';
    const diff = dayjs(end).diff(dayjs());
    if (diff <= 0) return 'Ended';
    const d = dayjs.duration(diff);
    const days = d.days();
    if (days > 30) return `${Math.floor(days / 30)}mo ${days % 30}d`;
    if (days >= 1) return `${days}d ${d.hours()}h`;
    if (d.hours() >= 1) return `${d.hours()}h ${d.minutes()}m`;
    return `${d.minutes()}m`;
}

/* ── Shared KPI card (same style as Batches/Demo) ── */
const KpiCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; accent: string }> = ({ label, value, icon, accent }) => (
    <div style={{
        borderRadius: 16, padding: '20px 24px',
        background: '#fff', border: '1px solid #f0f0f8',
        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
        display: 'flex', alignItems: 'center', gap: 16,
    }}>
        <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: accent + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: accent, flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>
                {value}
            </div>
        </div>
    </div>
);

/* ── Loading skeleton ── */
const QuizSkeleton: React.FC = () => (
    <div style={{ paddingBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
                <Skeleton.Input active style={{ width: 220, height: 28, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}>
                    <Skeleton.Input active style={{ width: 200, height: 14, borderRadius: 6 }} />
                </div>
            </div>
            <Skeleton.Button active style={{ width: 130, height: 44, borderRadius: 12 }} />
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[1, 2, 3, 4].map(i => (
                <Col xs={24} sm={12} md={6} key={i}>
                    <div style={{
                        borderRadius: 16, padding: '20px 24px',
                        background: '#fff', border: '1px solid #f0f0f8',
                        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
                        display: 'flex', alignItems: 'center', gap: 16,
                    }}>
                        <Skeleton.Avatar active size={44} shape="square" style={{ borderRadius: 12 }} />
                        <div style={{ flex: 1 }}>
                            <Skeleton.Input active style={{ width: 80, height: 11, borderRadius: 4, marginBottom: 8 }} block />
                            <Skeleton.Input active style={{ width: 40, height: 26, borderRadius: 6 }} />
                        </div>
                    </div>
                </Col>
            ))}
        </Row>

        <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8',
            boxShadow: '0 2px 12px rgba(99,102,241,0.07)', overflow: 'hidden',
        }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', gap: 12 }}>
                <Skeleton.Input active style={{ width: 220, height: 34, borderRadius: 8 }} />
                <Skeleton.Input active style={{ width: 140, height: 34, borderRadius: 8 }} />
                <Skeleton.Input active style={{ width: 160, height: 34, borderRadius: 8 }} />
            </div>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    padding: '14px 20px', borderBottom: '1px solid #f8f8fc',
                }}>
                    <div style={{ flex: 3 }}>
                        <Skeleton.Input active style={{ width: '80%', height: 14, borderRadius: 5, marginBottom: 6 }} block />
                        <Skeleton.Input active style={{ width: '50%', height: 11, borderRadius: 5 }} block />
                    </div>
                    <Skeleton.Input active style={{ width: 40, height: 14, borderRadius: 5 }} />
                    <Skeleton.Input active style={{ width: 50, height: 14, borderRadius: 5 }} />
                    <Skeleton.Input active style={{ width: 50, height: 14, borderRadius: 5 }} />
                    <Skeleton.Input active style={{ width: 80, height: 14, borderRadius: 5 }} />
                    <Skeleton.Input active style={{ width: 55, height: 14, borderRadius: 5 }} />
                    <Skeleton.Input active style={{ width: 60, height: 22, borderRadius: 20 }} />
                    <Skeleton.Button active size="small" style={{ width: 28, height: 28, borderRadius: 6 }} />
                </div>
            ))}
        </div>
    </div>
);

const QuizManagement: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);

    const [builderVisible, setBuilderVisible] = useState(false);
    const [resultsVisible, setResultsVisible] = useState(false);
    const [insightsVisible, setInsightsVisible] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

    const { apiCall } = useAuth();

    const fetchQuizzes = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await apiCall('/quizzes');
            if (resp.ok) {
                const data = await resp.json();
                const raw = Array.isArray(data) ? data : (data.quizzes || []);
                setQuizzes(raw.map((q: any) => ({
                    ...q,
                    total_questions: Number(q.total_questions ?? 0),
                    duration_minutes: Number(q.duration_minutes ?? 0),
                    total_marks: q.total_marks != null ? Number(q.total_marks) : undefined,
                    submitted_students: Number(q.submitted_students ?? 0),
                    total_students: Number(q.total_students ?? 0),
                    avg_score: Number(q.avg_score ?? 0),
                })));
            }
        } catch { message.error('Failed to load quizzes'); }
        finally { setLoading(false); }
    }, [apiCall]);

    useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);
    useEffect(() => {
        (async () => {
            try {
                const resp = await apiCall('/batches');
                if (resp.ok) setBatches(await resp.json());
            } catch {}
        })();
    }, [apiCall]);

    const handleDelete = async (id: number) => {
        try {
            const resp = await apiCall(`/quizzes/${id}`, { method: 'DELETE' });
            if (resp.ok) { message.success('Quiz deleted'); fetchQuizzes(); }
            else message.error('Failed to delete quiz');
        } catch { message.error('Error deleting quiz'); }
    };

    const filtered = quizzes.filter(q => {
        if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (batchFilter && !q.batch_names?.includes(batches.find(b => b.id === batchFilter)?.name || '')) return false;
        if (dateRangeFilter && dateRangeFilter.length === 2 && q.start_date) {
            const start = dayjs(q.start_date);
            if (start.isBefore(dateRangeFilter[0], 'day') || start.isAfter(dateRangeFilter[1], 'day')) return false;
        }
        if (statusFilter !== 'all') {
            const s = getStatusInfo(q.status, q.start_date, q.end_date);
            if (statusFilter === 'draft' && q.status !== 'draft') return false;
            if (statusFilter === 'active' && s.text !== 'Active') return false;
            if (statusFilter === 'scheduled' && s.text !== 'Scheduled') return false;
            if (statusFilter === 'ended' && s.text !== 'Ended') return false;
        }
        return true;
    });

    const stats = {
        total: quizzes.length,
        published: quizzes.filter(q => q.status === 'published').length,
        draft: quizzes.filter(q => q.status === 'draft').length,
        avgScore: quizzes.length > 0
            ? Math.round(quizzes.reduce((s, q) => s + (q.avg_score || 0), 0) / Math.max(quizzes.filter(q => q.avg_score).length, 1))
            : 0,
    };

    const columns: ColumnsType<Quiz> = [
        {
            title: 'Quiz', key: 'title',
            render: (_, r) => (
                <div>
                    <Text strong style={{ fontSize: 13, color: '#1a1d2e', display: 'block' }}>{r.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>{r.batch_names || '—'}</Text>
                </div>
            ),
        },
        {
            title: 'Questions', dataIndex: 'total_questions', key: 'q', width: 90, align: 'center' as const,
            render: (v: number) => <Text strong style={{ color: '#4f46e5' }}>{v}</Text>,
        },
        {
            title: 'Duration', dataIndex: 'duration_minutes', key: 'dur', width: 90, align: 'center' as const,
            render: (v: number) => <Text type="secondary" style={{ fontSize: 12 }}>{v} min</Text>,
        },
        {
            title: 'Submissions', key: 'sub', width: 110, align: 'center' as const,
            render: (_, r) => (
                <span style={{ fontSize: 13, fontWeight: 600, color: (r.submitted_students || 0) > 0 ? '#4f46e5' : '#94a3b8' }}>
                    {r.submitted_students ?? 0} / {r.total_students ?? 0}
                </span>
            ),
        },
        {
            title: 'Avg Score', dataIndex: 'avg_score', key: 'score', width: 140,
            render: (v: number) => (
                <Space size={6}>
                    <Progress
                        percent={v || 0} size="small"
                        strokeColor={v >= 70 ? '#22c55e' : v >= 50 ? '#f59e0b' : '#ef4444'}
                        style={{ width: 68 }} showInfo={false}
                        trailColor="#f0f0f8"
                    />
                    <Text strong style={{ fontSize: 12, color: v >= 70 ? '#16a34a' : v >= 50 ? '#d97706' : '#dc2626' }}>
                        {fmt(v)}%
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Time Left', key: 'time', width: 100, align: 'center' as const,
            render: (_, r) => {
                const t = fmtRemaining(r.end_date);
                const color = t === 'Ended' ? '#ef4444' : t === '—' ? '#94a3b8' : (t.includes('m') && !t.includes('h')) ? '#f59e0b' : '#22c55e';
                return (
                    <span style={{
                        background: color + '15', color,
                        borderRadius: 20, padding: '2px 10px',
                        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' as const,
                    }}>
                        {t}
                    </span>
                );
            },
        },
        {
            title: 'Status', key: 'status', width: 100, align: 'center' as const,
            render: (_, r) => {
                const s = getStatusInfo(r.status, r.start_date, r.end_date);
                return (
                    <span style={{
                        background: s.bg, color: s.color,
                        borderRadius: 20, padding: '3px 12px',
                        fontSize: 11, fontWeight: 600,
                    }}>
                        {s.text}
                    </span>
                );
            },
        },
        {
            title: '', key: 'actions', width: 44, align: 'center' as const,
            render: (_, r) => {
                const ended = r.status === 'published' && r.end_date && dayjs().isAfter(dayjs(r.end_date));
                return (
                    <Dropdown menu={{
                        items: [
                            { key: 'details', label: 'Details', icon: <EyeOutlined /> },
                            { key: 'insights', label: 'Insights', icon: <BarChartOutlined /> },
                            { key: 'results', label: 'Results', icon: <FileTextOutlined /> },
                            ...(!ended ? [{ key: 'edit', label: 'Edit', icon: <EditOutlined /> }] : []),
                            { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true as const },
                        ],
                        onClick: ({ key }) => {
                            if (key === 'details') { setSelectedQuizId(r.id); setDetailsVisible(true); }
                            else if (key === 'insights') { setSelectedQuizId(r.id); setInsightsVisible(true); }
                            else if (key === 'results') { setSelectedQuizId(r.id); setResultsVisible(true); }
                            else if (key === 'edit') { setSelectedQuizId(r.id); setBuilderVisible(true); }
                            else if (key === 'delete') Modal.confirm({
                                title: 'Delete this quiz?',
                                content: 'This cannot be undone.',
                                okText: 'Delete', okType: 'danger',
                                onOk: () => handleDelete(r.id),
                            });
                        },
                    }} trigger={['click']}>
                        <Button
                            type="text" size="small"
                            icon={<MoreOutlined style={{ fontSize: 16 }} />}
                            style={{ borderRadius: 8, color: '#64748b' }}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    /* ── LOADING ── */
    if (loading) return <QuizSkeleton />;

    /* ── LOADED ── */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexShrink: 0 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1d2e', fontSize: 22 }}>Quiz Management</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {stats.total} quiz{stats.total !== 1 ? 'zes' : ''} · {stats.published} published · {stats.draft} draft
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => { setSelectedQuizId(null); setBuilderVisible(true); }}
                    style={{
                        borderRadius: 12, height: 44, fontWeight: 700,
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        border: 'none', boxShadow: '0 4px 16px rgba(99,102,241,0.30)',
                        paddingInline: 24,
                    }}
                >
                    Create Quiz
                </Button>
            </div>

            {/* ── KPI Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20, flexShrink: 0 }}>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Total Quizzes" value={stats.total} icon={<BookOutlined />} accent="#6366f1" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Published" value={stats.published} icon={<CheckCircleOutlined />} accent="#22c55e" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Drafts" value={stats.draft} icon={<ClockCircleOutlined />} accent="#94a3b8" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Avg Score" value={`${stats.avgScore}%`} icon={<TrophyOutlined />} accent={stats.avgScore >= 70 ? '#22c55e' : '#f59e0b'} />
                </Col>
            </Row>

            {/* ── Table card (fills remaining, rows scroll) ── */}
            <div style={{
                background: '#fff',
                borderRadius: 16,
                border: '1px solid #f0f0f8',
                boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden',
            }}>
                {/* Toolbar */}
                <div style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #f0f0f8',
                    display: 'flex', alignItems: 'center',
                    gap: 10, flexShrink: 0, flexWrap: 'wrap' as const,
                }}>
                    <Input
                        placeholder="Search quizzes..."
                        prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                        allowClear
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ width: 220, borderRadius: 10, borderColor: '#e0e7ff' }}
                    />
                    <DatePicker.RangePicker
                        onChange={setDateRangeFilter}
                        style={{ width: 250, borderRadius: 10, borderColor: '#e0e7ff' }}
                        allowClear
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 150 }}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'active', label: '● Active' },
                            { value: 'scheduled', label: '● Scheduled' },
                            { value: 'draft', label: '● Draft' },
                            { value: 'ended', label: '● Ended' },
                        ]}
                    />
                    <Select
                        value={batchFilter ?? undefined}
                        onChange={v => setBatchFilter(v)}
                        allowClear
                        placeholder="All Batches"
                        style={{ width: 170 }}
                        options={batches.map(b => ({ value: b.id, label: b.name }))}
                        onClear={() => setBatchFilter(null)}
                    />
                    <div style={{ marginLeft: 'auto' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                        </Text>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Table
                        columns={columns}
                        dataSource={filtered}
                        rowKey="id"
                        size="small"
                        scroll={{ y: 'calc(100vh - 390px)', x: 900 }}
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: false,
                            showTotal: (t) => `${t} quizzes`,
                            style: { padding: '10px 20px', borderTop: '1px solid #f0f0f8', margin: 0 },
                        }}
                        rowClassName={() => 'quiz-table-row'}
                        locale={{
                            emptyText: (
                                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                    <BookOutlined style={{ fontSize: 40, color: '#c7d2fe', display: 'block', marginBottom: 10 }} />
                                    <Text type="secondary">No quizzes yet — create your first one!</Text>
                                </div>
                            ),
                        }}
                    />
                </div>
            </div>

            {/* ── QuizBuilder Modal ── */}
            <Modal
                title={null} open={builderVisible}
                onCancel={() => { setBuilderVisible(false); setSelectedQuizId(null); }}
                footer={null} width={1200} closable={false} style={{ top: 20 }}
                destroyOnClose
                styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' } }}
            >
                <QuizBuilder
                    quizId={selectedQuizId?.toString()}
                    onComplete={() => { setBuilderVisible(false); setSelectedQuizId(null); fetchQuizzes(); }}
                    onClose={() => { setBuilderVisible(false); setSelectedQuizId(null); }}
                />
            </Modal>

            {/* 📋 Results Modal 📋 */}
            <Modal
                title={null}
                open={resultsVisible}
                onCancel={() => { setResultsVisible(false); setSelectedQuizId(null); }}
                footer={null} width={1000} style={{ top: 30 }} destroyOnClose
                closeIcon={
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4d4f';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = 'inherit';
                        e.currentTarget.style.transform = 'none';
                    }}
                    >
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>✕</span>
                    </div>
                }
                styles={{ content: { borderRadius: '24px', padding: 0, overflow: 'hidden' }, body: { padding: 0 } }}
            >
                {selectedQuizId && <ErrorBoundary><QuizResults quizId={selectedQuizId.toString()} /></ErrorBoundary>}
            </Modal>

            {/* ── Insights Modal ── */}
            <Modal
                title={null}
                open={insightsVisible}
                onCancel={() => { setInsightsVisible(false); setSelectedQuizId(null); }}
                footer={null} width={1200} style={{ top: 20 }} destroyOnClose
                closeIcon={
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4d4f';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                        e.currentTarget.style.color = 'inherit';
                        e.currentTarget.style.transform = 'none';
                    }}
                    >
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>✕</span>
                    </div>
                }
                styles={{ content: { borderRadius: '24px', padding: 0, overflow: 'hidden' }, body: { padding: 0 } }}
            >
                <ErrorBoundary><QuizInsights quizId={selectedQuizId?.toString()} /></ErrorBoundary>
            </Modal>

            {/* ── Quiz Details Modal ── */}
            <Modal
                title={null}
                open={detailsVisible}
                onCancel={() => { setDetailsVisible(false); setSelectedQuizId(null); }}
                footer={null} width={1000} style={{ top: 30 }} destroyOnClose
                closable={false}
                styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' } }}
            >
                <ErrorBoundary>{selectedQuizId && <QuizDetails quizId={selectedQuizId.toString()} onClose={() => { setDetailsVisible(false); setSelectedQuizId(null); }} />}</ErrorBoundary>
            </Modal>

            <style>{`
                .quiz-table-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 700 !important;
                    color: #4b5563 !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }
            `}</style>
        </div>
    );
};

export default QuizManagement;
