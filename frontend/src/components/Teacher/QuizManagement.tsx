import React, { useState, useEffect, useCallback } from 'react';
import {
    Table, Button, Modal, message, Space, Typography, Tag, Card, Progress,
    Dropdown, Row, Col, Statistic, Input, Select, Empty
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined,
    BarChartOutlined, MoreOutlined, SearchOutlined, ClockCircleOutlined,
    CheckCircleOutlined, BookOutlined, TrophyOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import QuizBuilder from '../Quiz/QuizBuilder';
import QuizResults from '../Quiz/QuizResults';
import QuizInsights from '../Quiz/QuizInsights';
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
    if (status !== 'published') return { color: 'default', text: 'Draft' };
    const now = dayjs();
    if (start && now.isBefore(dayjs(start))) return { color: 'orange', text: 'Scheduled' };
    if (end && now.isAfter(dayjs(end))) return { color: 'red', text: 'Ended' };
    return { color: 'green', text: 'Active' };
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

const QuizManagement: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [batchFilter, setBatchFilter] = useState<number | null>(null);

    // Modals
    const [builderVisible, setBuilderVisible] = useState(false);
    const [resultsVisible, setResultsVisible] = useState(false);
    const [insightsVisible, setInsightsVisible] = useState(false);
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
    }, []);

    useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);
    useEffect(() => {
        (async () => {
            try {
                const resp = await apiCall('/batches');
                if (resp.ok) setBatches(await resp.json());
            } catch {}
        })();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            const resp = await apiCall(`/quizzes/${id}`, { method: 'DELETE' });
            if (resp.ok) { message.success('Quiz deleted'); fetchQuizzes(); }
            else message.error('Failed to delete quiz');
        } catch { message.error('Error deleting quiz'); }
    };

    // Filtered quizzes
    const filtered = quizzes.filter(q => {
        if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (batchFilter && !q.batch_names?.includes(batches.find(b => b.id === batchFilter)?.name || '')) return false;
        if (statusFilter !== 'all') {
            const s = getStatusInfo(q.status, q.start_date, q.end_date);
            if (statusFilter === 'draft' && q.status !== 'draft') return false;
            if (statusFilter === 'active' && s.text !== 'Active') return false;
            if (statusFilter === 'scheduled' && s.text !== 'Scheduled') return false;
            if (statusFilter === 'ended' && s.text !== 'Ended') return false;
        }
        return true;
    });

    // Stats
    const stats = {
        total: quizzes.length,
        published: quizzes.filter(q => q.status === 'published').length,
        draft: quizzes.filter(q => q.status === 'draft').length,
        avgScore: quizzes.length > 0 ? Math.round(quizzes.reduce((s, q) => s + (q.avg_score || 0), 0) / Math.max(quizzes.filter(q => q.avg_score).length, 1)) : 0,
    };

    const columns: ColumnsType<Quiz> = [
        {
            title: 'Quiz', key: 'title', width: 220,
            render: (_, r) => (
                <div>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>{r.title}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.batch_names || '—'}</Text>
                </div>
            ),
        },
        {
            title: 'Questions', dataIndex: 'total_questions', key: 'q', width: 90, align: 'center',
            render: (v: number) => <Text strong>{v}</Text>,
        },
        {
            title: 'Duration', dataIndex: 'duration_minutes', key: 'dur', width: 80, align: 'center',
            render: (v: number) => <Text type="secondary">{v} min</Text>,
        },
        {
            title: 'Submissions', key: 'sub', width: 100, align: 'center',
            render: (_, r) => <Text>{r.submitted_students ?? 0} / {r.total_students ?? 0}</Text>,
        },
        {
            title: 'Avg Score', dataIndex: 'avg_score', key: 'score', width: 130,
            render: (v: number) => (
                <Space size={6}>
                    <Progress percent={v || 0} size="small" strokeColor={v >= 70 ? '#52c41a' : v >= 50 ? '#faad14' : '#ff4d4f'} style={{ width: 70 }} showInfo={false} />
                    <Text strong style={{ fontSize: 12 }}>{fmt(v)}%</Text>
                </Space>
            ),
        },
        {
            title: 'Time Left', key: 'time', width: 100, align: 'center',
            render: (_, r) => {
                const t = fmtRemaining(r.end_date);
                return <Text style={{ color: t === 'Ended' ? '#ff4d4f' : t.includes('m') && !t.includes('h') ? '#faad14' : '#52c41a', fontSize: 12 }}>{t}</Text>;
            },
        },
        {
            title: 'Status', key: 'status', width: 90, align: 'center',
            render: (_, r) => {
                const s = getStatusInfo(r.status, r.start_date, r.end_date);
                return <Tag color={s.color} style={{ borderRadius: 6 }}>{s.text}</Tag>;
            },
        },
        {
            title: '', key: 'actions', width: 50, align: 'center',
            render: (_, r) => {
                const ended = r.status === 'published' && r.end_date && dayjs().isAfter(dayjs(r.end_date));
                return (
                    <Dropdown menu={{
                        items: [
                            { key: 'insights', label: 'Insights', icon: <BarChartOutlined /> },
                            { key: 'results', label: 'Results', icon: <FileTextOutlined /> },
                            ...(!ended ? [{ key: 'edit', label: 'Edit', icon: <EditOutlined /> }] : []),
                            { key: 'delete', label: 'Delete', icon: <DeleteOutlined />, danger: true as const },
                        ],
                        onClick: ({ key }) => {
                            if (key === 'insights') { setSelectedQuizId(r.id); setInsightsVisible(true); }
                            else if (key === 'results') { setSelectedQuizId(r.id); setResultsVisible(true); }
                            else if (key === 'edit') { setSelectedQuizId(r.id); setBuilderVisible(true); }
                            else if (key === 'delete') Modal.confirm({ title: 'Delete this quiz?', content: 'This cannot be undone.', okText: 'Delete', okType: 'danger', onOk: () => handleDelete(r.id) });
                        },
                    }} trigger={['click']}>
                        <Button type="text" size="small" icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Quiz Management</Title>
                    <Text type="secondary">Create and manage quizzes for your students</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setSelectedQuizId(null); setBuilderVisible(true); }}
                    style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                    Create Quiz
                </Button>
            </div>

            {/* Stats */}
            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                {[
                    { label: 'Total Quizzes', value: stats.total, icon: <BookOutlined />, color: '#1a56db' },
                    { label: 'Published', value: stats.published, icon: <CheckCircleOutlined />, color: '#52c41a' },
                    { label: 'Drafts', value: stats.draft, icon: <ClockCircleOutlined />, color: '#94a3b8' },
                    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: <TrophyOutlined />, color: stats.avgScore >= 70 ? '#52c41a' : '#faad14' },
                ].map((s, i) => (
                    <Col xs={12} sm={6} key={i}>
                        <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                            <Statistic title={s.label} value={s.value} prefix={<span style={{ color: s.color }}>{s.icon}</span>}
                                valueStyle={{ fontSize: 24, fontWeight: 700 }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
                <Space wrap size="middle">
                    <Input placeholder="Search quizzes..." prefix={<SearchOutlined />} allowClear
                        value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, borderRadius: 8 }} />
                    <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'active', label: 'Active' },
                            { value: 'scheduled', label: 'Scheduled' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'ended', label: 'Ended' },
                        ]} />
                    <Select value={batchFilter} onChange={setBatchFilter} allowClear placeholder="All Batches" style={{ width: 160 }}
                        options={batches.map(b => ({ value: b.id, label: b.name }))} />
                </Space>
            </Card>

            {/* Table */}
            <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading}
                    pagination={{ pageSize: 15, showSizeChanger: false, showTotal: (t) => `${t} quizzes` }}
                    scroll={{ x: 900 }} size="small"
                    locale={{ emptyText: <Empty description="No quizzes yet. Create your first one!" /> }} />
            </Card>

            {/* QuizBuilder Modal */}
            <Modal
                title={null}
                open={builderVisible}
                onCancel={() => { setBuilderVisible(false); setSelectedQuizId(null); }}
                footer={null}
                width={1200}
                closable={false}
                style={{ top: 20 }}
                destroyOnClose
                styles={{ body: { padding: 0, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto' } }}
            >
                <QuizBuilder
                    quizId={selectedQuizId?.toString()}
                    onComplete={() => { setBuilderVisible(false); setSelectedQuizId(null); fetchQuizzes(); }}
                    onClose={() => { setBuilderVisible(false); setSelectedQuizId(null); }}
                />
            </Modal>

            {/* Results Modal */}
            <Modal title="Quiz Results" open={resultsVisible}
                onCancel={() => { setResultsVisible(false); setSelectedQuizId(null); }}
                footer={null} width={1200} style={{ top: 20 }} destroyOnClose>
                {selectedQuizId && <ErrorBoundary><QuizResults quizId={selectedQuizId.toString()} /></ErrorBoundary>}
            </Modal>

            {/* Insights Modal */}
            <Modal title="Quiz Insights" open={insightsVisible}
                onCancel={() => { setInsightsVisible(false); setSelectedQuizId(null); }}
                footer={null} width={1200} style={{ top: 20 }} destroyOnClose>
                <ErrorBoundary><QuizInsights quizId={selectedQuizId?.toString()} /></ErrorBoundary>
            </Modal>
        </div>
    );
};

export default QuizManagement;
