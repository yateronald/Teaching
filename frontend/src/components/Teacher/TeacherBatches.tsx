import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Typography,
    Tag,
    Space,
    message,
    Tabs,
        Avatar,
    Row,
    Col,
        Badge,
        Skeleton,
        Input,
        DatePicker,
        Drawer,
        Tooltip,
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    EyeOutlined,
    CalendarOutlined,
    BookOutlined,
    BarChartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import BatchInsights from './BatchInsights';

const { Title, Text } = Typography;

interface Batch {
    id: number;
    name: string;
    french_level: string;
    start_date: string;
    end_date: string;
    teacher_id: number;
    teacher_first_name: string;
    teacher_last_name: string;
    student_count: number;
    created_at: string;
    updated_at: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    enrolled_at: string;
}

/* ── KPI stat card ── */
const KpiCard: React.FC<{ label: string; value: number; icon: React.ReactNode; accent: string }> = ({ label, value, icon, accent }) => (
    <div style={{
        borderRadius: 16,
        padding: '20px 24px',
        background: '#fff',
        border: '1px solid #f0f0f8',
        boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
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
const BatchesSkeleton: React.FC = () => (
    <div style={{ paddingBottom: 32 }}>
        {/* Header skeleton */}
        <div style={{ marginBottom: 28 }}>
            <Skeleton.Input active style={{ width: 200, height: 28, borderRadius: 8 }} />
            <div style={{ marginTop: 6 }}>
                <Skeleton.Input active style={{ width: 140, height: 14, borderRadius: 6 }} />
            </div>
        </div>

        {/* KPI skeleton */}
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
                            <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 8 }} block />
                            <Skeleton.Input active style={{ width: 40, height: 26, borderRadius: 6 }} />
                        </div>
                    </div>
                </Col>
            ))}
        </Row>

        {/* Table card skeleton */}
        <div style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid #f0f0f8',
            boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
            padding: 24,
        }}>
            {/* Tabs skeleton */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 20, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
                {['Active', 'Completed', 'Inactive'].map((_, i) => (
                    <div key={i} style={{ opacity: i === 0 ? 1 : 0.45 }}>
                        <Skeleton.Input active style={{ width: 80, height: 16, borderRadius: 6 }} />
                    </div>
                ))}
            </div>
            {/* Table rows skeleton */}
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 24,
                    padding: '14px 0',
                    borderBottom: '1px solid #f8f8fc',
                }}>
                    <Skeleton.Input active style={{ flex: 2, height: 16, borderRadius: 6 }} />
                    <Skeleton.Input active style={{ flex: 1, height: 16, borderRadius: 6 }} />
                    <Skeleton.Input active style={{ flex: 2, height: 16, borderRadius: 6 }} />
                    <Skeleton.Input active style={{ flex: 1, height: 16, borderRadius: 6 }} />
                    <div style={{ display: 'flex', gap: 8, flex: 1.5 }}>
                        <Skeleton.Button active style={{ width: 100, height: 32, borderRadius: 8 }} />
                        <Skeleton.Button active style={{ width: 80, height: 32, borderRadius: 8 }} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TeacherBatches: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [insightsVisible, setInsightsVisible] = useState(false);
    const [insightsBatchId, setInsightsBatchId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data) ? data : (data.batches || []);
                setBatches(list.map((b: any) => ({
                    ...b,
                    student_count: Number(b?.student_count ?? 0),
                })));
            } else {
                message.error('Failed to fetch batches');
            }
        } catch {
            message.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchStudents = async (batchId: number) => {
        setStudentsLoading(true);
        try {
            const response = await apiCall(`/batches/${batchId}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data.students) ? data.students : []);
            } else {
                message.error('Failed to fetch students');
            }
        } catch {
            message.error('Error fetching students');
        } finally {
            setStudentsLoading(false);
        }
    };

    const getBatchStatus = (batch: Batch) => {
        const now = dayjs();
        if (now.isBefore(dayjs(batch.start_date))) return 'inactive';
        if (now.isAfter(dayjs(batch.end_date))) return 'completed';
        return 'active';
    };

    const getInitials = (first: string, last: string) =>
        ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?';
    const getAvatarColor = (first: string, last: string) => {
        const colors = ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
        const seed = (first + last).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return colors[seed % colors.length];
    };

    const filteredBatches = batches.filter(b => {
        if (searchText && !b.name.toLowerCase().includes(searchText.toLowerCase())) return false;
        if (dateRangeFilter && dateRangeFilter.length === 2 && b.start_date) {
            const start = dayjs(b.start_date);
            if (start.isBefore(dateRangeFilter[0], 'day') || start.isAfter(dateRangeFilter[1], 'day')) return false;
        }
        return true;
    });

    const activeBatches = filteredBatches.filter(b => getBatchStatus(b) === 'active');
    const completedBatches = filteredBatches.filter(b => getBatchStatus(b) === 'completed');
    const inactiveBatches = filteredBatches.filter(b => getBatchStatus(b) === 'inactive');
    const totalStudents = filteredBatches.reduce((sum, b) => sum + Number(b.student_count ?? 0), 0);

    const handleViewStudents = (batch: Batch) => {
        setSelectedBatch(batch);
        setModalVisible(true);
        fetchBatchStudents(batch.id);
    };

    const handleOpenInsights = (batch: Batch) => {
        setInsightsBatchId(batch.id);
        setInsightsVisible(true);
    };

    const columns: ColumnsType<Batch> = [
        {
            title: 'Batch Name',
            dataIndex: 'name',
            key: 'name',
            render: (n: string) => <Text strong style={{ color: '#1a1d2e' }}>{n}</Text>,
        },
        {
            title: 'French Level',
            dataIndex: 'french_level',
            key: 'french_level',
            render: (level: string) => (
                <Tag style={{ borderRadius: 6, fontWeight: 600 }} color="blue">{level}</Tag>
            ),
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, r) => (
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {dayjs(r.start_date).format('MMM DD, YYYY')} – {dayjs(r.end_date).format('MMM DD, YYYY')}
                </Text>
            ),
        },
        {
            title: 'Students',
            key: 'students',
            render: (_, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TeamOutlined style={{ color: '#6366f1' }} />
                    <Text strong>{Number(r.student_count ?? 0)}</Text>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStudents(record)}
                        style={{ borderRadius: 8 }}
                    >
                        Students
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        icon={<BarChartOutlined />}
                        onClick={() => handleOpenInsights(record)}
                        style={{ borderRadius: 8, background: '#6366f1', borderColor: '#6366f1' }}
                    >
                        Insights
                    </Button>
                </Space>
            ),
        },
    ];

    const BatchTable: React.FC<{ data: Batch[] }> = ({ data }) => (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={false}
            scroll={{ y: 'calc(100vh - 380px)' }}
            style={{ borderRadius: 12 }}
            rowClassName={() => 'batch-table-row'}
            locale={{
                emptyText: (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                        <TeamOutlined style={{ fontSize: 36, marginBottom: 10, display: 'block', color: '#c7d2fe' }} />
                        <Text type="secondary">No batches in this category</Text>
                    </div>
                )
            }}
        />
    );

    /* ── LOADING ── */
    if (loading) return <BatchesSkeleton />;

    /* ── LOADED ── */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>

            {/* ── Header (fixed) ── */}
            <div style={{ marginBottom: 24, flexShrink: 0 }}>
                <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1d2e', fontSize: 22 }}>
                    My Batches
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {batches.length} batch{batches.length !== 1 ? 'es' : ''} · {totalStudents} student{totalStudents !== 1 ? 's' : ''} enrolled
                </Text>
            </div>

            {/* ── KPI cards (fixed) ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24, flexShrink: 0 }}>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Total Batches" value={filteredBatches.length} icon={<TeamOutlined />} accent="#6366f1" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Active Batches" value={activeBatches.length} icon={<CheckCircleOutlined />} accent="#22c55e" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Total Students" value={totalStudents} icon={<UserOutlined />} accent="#0ea5e9" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Completed Batches" value={completedBatches.length} icon={<CalendarOutlined />} accent="#f59e0b" />
                </Col>
            </Row>

            {/* ── Table card (fills remaining space, rows scroll) ── */}
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
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Input.Search
                        placeholder="Search batches..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <DatePicker.RangePicker
                        onChange={setDateRangeFilter}
                        style={{ width: 250 }}
                        allowClear
                    />
                    <div style={{ marginLeft: 'auto' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {filteredBatches.length} result{filteredBatches.length !== 1 ? 's' : ''}
                        </Text>
                    </div>
                </div>
                <Tabs
                    defaultActiveKey="all"
                    style={{ padding: '0 20px' }}
                    tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f8' }}
                    items={[
                        {
                            key: 'all',
                            label: (
                                <span>
                                    <TeamOutlined style={{ color: '#4f46e5', marginRight: 6 }} />
                                    All <Badge count={filteredBatches.length} style={{ backgroundColor: '#4f46e5', marginLeft: 4 }} />
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '0 4px' }}>
                                    <BatchTable data={filteredBatches} />
                                </div>
                            ),
                        },
                        {
                            key: 'active',
                            label: (
                                <span>
                                    <CheckCircleOutlined style={{ color: '#22c55e', marginRight: 6 }} />
                                    Active <Badge count={activeBatches.length} style={{ backgroundColor: '#22c55e', marginLeft: 4 }} />
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '0 4px' }}>
                                    <BatchTable data={activeBatches} />
                                </div>
                            ),
                        },
                        {
                            key: 'completed',
                            label: (
                                <span>
                                    <BookOutlined style={{ color: '#6366f1', marginRight: 6 }} />
                                    Completed <Badge count={completedBatches.length} style={{ backgroundColor: '#6366f1', marginLeft: 4 }} />
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '0 4px' }}>
                                    <BatchTable data={completedBatches} />
                                </div>
                            ),
                        },
                        {
                            key: 'inactive',
                            label: (
                                <span>
                                    <ClockCircleOutlined style={{ color: '#94a3b8', marginRight: 6 }} />
                                    Upcoming <Badge count={inactiveBatches.length} style={{ backgroundColor: '#94a3b8', marginLeft: 4 }} />
                                </span>
                            ),
                            children: (
                                <div style={{ padding: '0 4px' }}>
                                    <BatchTable data={inactiveBatches} />
                                </div>
                            ),
                        },
                    ]}
                />
            </div>

            {/* ── Students Modal (Premium UI) ── */}
            <Modal
                title={null}
                open={modalVisible}
                onCancel={() => { setModalVisible(false); setSelectedBatch(null); setStudents([]); }}
                footer={null}
                width={720}
                centered
                closable={true}
                closeIcon={
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', transition: 'all 0.25s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
                    >✕</div>
                }
                styles={{ body: { padding: 0, overflow: 'hidden', borderRadius: 24 } }}
            >
                {studentsLoading ? (
                    /* ── FULL-MODAL SKELETON ── */
                    <div>
                        {/* Skeleton header */}
                        <div style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', padding: '28px 32px' }}>
                            <Skeleton.Input active style={{ width: 220, height: 24, borderRadius: 6 }} />
                            <br />
                            <Skeleton.Input active style={{ width: 160, height: 14, borderRadius: 4, marginTop: 10 }} />
                        </div>

                        {/* Skeleton info pills */}
                        <div style={{ padding: '24px 32px', background: '#fff' }}>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                                {[1, 2, 3, 4].map(i => (
                                    <Skeleton.Button active key={i} style={{ width: 140, height: 44, borderRadius: 12 }} />
                                ))}
                            </div>

                            {/* Skeleton divider */}
                            <Skeleton.Input active style={{ width: 130, height: 12, borderRadius: 4, marginBottom: 20 }} />

                            {/* Skeleton student cards */}
                            <Row gutter={[14, 14]}>
                                {[1, 2, 3].map(i => (
                                    <Col xs={24} sm={12} key={i}>
                                        <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <Skeleton.Avatar active size={42} shape="circle" />
                                            <div style={{ flex: 1 }}>
                                                <Skeleton.Input active size="small" style={{ width: '75%', height: 15, borderRadius: 4, marginBottom: 6 }} block />
                                                <Skeleton.Input active size="small" style={{ width: '55%', height: 11, borderRadius: 4 }} block />
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </div>
                ) : (
                    /* ── LOADED CONTENT ── */
                    <div>
                        {/* Compact gradient header */}
                        <div style={{ background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', right: 60, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👥</div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{selectedBatch?.name}</div>
                                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Student roster & batch details</div>
                                </div>
                            </div>
                        </div>

                        {/* Content area */}
                        <div style={{ padding: '24px 32px', maxHeight: 'calc(80vh - 100px)', overflowY: 'auto', background: '#fff' }}>

                            {/* Info pills row */}
                            {selectedBatch && (
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                                    {[
                                        { label: 'Teacher', value: `${selectedBatch.teacher_first_name} ${selectedBatch.teacher_last_name}`, bg: '#f0fdf4', color: '#15803d' },
                                        { label: 'Level', value: selectedBatch.french_level, bg: '#eef2ff', color: '#4338ca' },
                                        { label: 'Students', value: String(Number(selectedBatch.student_count ?? 0)), bg: '#eff6ff', color: '#1d4ed8' },
                                        { label: 'Status', value: getBatchStatus(selectedBatch).toUpperCase(), bg: getBatchStatus(selectedBatch) === 'active' ? '#f0fdf4' : getBatchStatus(selectedBatch) === 'completed' ? '#faf5ff' : '#fffbeb', color: getBatchStatus(selectedBatch) === 'active' ? '#15803d' : getBatchStatus(selectedBatch) === 'completed' ? '#7c3aed' : '#b45309' },
                                    ].map(pill => (
                                        <div key={pill.label} style={{ background: pill.bg, borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{pill.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: pill.color }}>{pill.value}</span>
                                        </div>
                                    ))}
                                    <div style={{ background: '#f8fafc', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                                            {dayjs(selectedBatch.start_date).format('MMM DD, YYYY')} — {dayjs(selectedBatch.end_date).format('MMM DD, YYYY')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Section label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2 }}>
                                    {students.length} Enrolled
                                </span>
                                <div style={{ height: 1, flex: 1, background: '#e5e7eb' }} />
                            </div>

                            {/* Student cards */}
                            {students.length === 0 ? (
                                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                    <TeamOutlined style={{ fontSize: 40, color: '#e2e8f0', display: 'block', marginBottom: 10 }} />
                                    <Text style={{ fontSize: 14, color: '#94a3b8' }}>No students enrolled in this batch yet.</Text>
                                </div>
                            ) : (
                                <Row gutter={[14, 14]}>
                                    {students.map(student => (
                                        <Col xs={24} sm={12} key={student.id}>
                                            <div
                                                style={{
                                                    borderRadius: 14, padding: '14px 16px',
                                                    border: '1px solid #f1f5f9',
                                                    background: '#fafbfd',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'default',
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#fafbfd'; e.currentTarget.style.boxShadow = 'none'; }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <Avatar
                                                        size={40}
                                                        style={{ backgroundColor: getAvatarColor(student.first_name, student.last_name), flexShrink: 0, fontWeight: 800, fontSize: 14 }}
                                                    >
                                                        {getInitials(student.first_name, student.last_name)}
                                                    </Avatar>
                                                    <div style={{ minWidth: 0, flex: 1 }}>
                                                        <Tooltip title={`${student.first_name} ${student.last_name}`}>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {student.first_name} {student.last_name}
                                                            </div>
                                                        </Tooltip>
                                                        <Tooltip title={student.email}>
                                                            <a href={`mailto:${student.email}`} style={{ fontSize: 11.5, color: '#6366f1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                                                {student.email}
                                                            </a>
                                                        </Tooltip>
                                                    </div>
                                                    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'right', flexShrink: 0, lineHeight: 1.4 }}>
                                                        <CalendarOutlined style={{ marginRight: 3 }} />
                                                        {student.enrolled_at ? dayjs(student.enrolled_at).format('MMM DD') : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Insights Drawer ── */}
            <Drawer
                title="Batch Insights"
                placement="right"
                width={980}
                open={insightsVisible}
                onClose={() => setInsightsVisible(false)}
                destroyOnHidden
            >
                {insightsVisible && insightsBatchId !== null && (
                    <BatchInsights batchId={String(insightsBatchId)} />
                )}
            </Drawer>

            <style>{`
                .batch-table-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 700 !important;
                    color: #4b5563 !important;
                    font-size: 12px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
            `}</style>
        </div>
    );
};

export default TeacherBatches;