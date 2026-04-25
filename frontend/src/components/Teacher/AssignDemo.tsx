import React, { useState, useEffect } from 'react';
import {
    Table,
    Typography,
    Space,
    Row,
    Col,
    Button,
    Modal,
    Descriptions,
    Select,
    message,
    Badge,
    Skeleton,
    Avatar,
    DatePicker
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    GlobalOutlined,
    VideoCameraOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

interface DemoRequest {
    id: number;
    full_name: string;
    email: string;
    country: string;
    has_previous_experience: string;
    current_level: string;
    interested_level: string;
    learning_goals: string;
    expected_start_time: string;
    preferred_schedule: string;
    timezone: string;
    status: 'new' | 'contacted' | 'demo_scheduled' | 'completed' | 'cancelled';
    notes: string;
    contacted_at: string;
    demo_scheduled_at: string;
    meeting_link: string;
    created_at: string;
    updated_at: string;
}

interface DemoStatistics {
    total_assigned: number;
    scheduled: number;
    contacted: number;
    completed: number;
    cancelled: number;
    upcoming_demos: number;
    this_week_demos: number;
}

/* ── Status helpers ── */
const getStatusColor = (status: string) => {
    switch (status) {
        case 'new': return '#6366f1';
        case 'contacted': return '#f59e0b';
        case 'demo_scheduled': return '#22c55e';
        case 'completed': return '#8b5cf6';
        case 'cancelled': return '#ef4444';
        default: return '#94a3b8';
    }
};
const getStatusBg = (status: string) => {
    switch (status) {
        case 'new': return '#eef2ff';
        case 'contacted': return '#fef3c7';
        case 'demo_scheduled': return '#dcfce7';
        case 'completed': return '#f3e8ff';
        case 'cancelled': return '#fee2e2';
        default: return '#f1f5f9';
    }
};
const getStatusText = (status: string) => {
    switch (status) {
        case 'new': return 'New';
        case 'contacted': return 'Contacted';
        case 'demo_scheduled': return 'Scheduled';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
};

/* ── KPI card (same style as TeacherBatches) ── */
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
const DemoSkeleton: React.FC = () => (
    <div style={{ paddingBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
                <Skeleton.Input active style={{ width: 260, height: 28, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}>
                    <Skeleton.Input active style={{ width: 160, height: 14, borderRadius: 6 }} />
                </div>
            </div>
            <Skeleton.Button active style={{ width: 90, height: 36, borderRadius: 10 }} />
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
                            <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 8 }} block />
                            <Skeleton.Input active style={{ width: 40, height: 26, borderRadius: 6 }} />
                        </div>
                    </div>
                </Col>
            ))}
        </Row>

        <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8',
            boxShadow: '0 2px 12px rgba(99,102,241,0.07)', padding: 24,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <Skeleton.Input active style={{ width: 180, height: 32, borderRadius: 8 }} />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    padding: '14px 0', borderBottom: '1px solid #f8f8fc',
                }}>
                    <Skeleton.Avatar active size={32} />
                    <Skeleton.Input active style={{ flex: 2, height: 14, borderRadius: 6 }} />
                    <Skeleton.Input active style={{ flex: 1, height: 14, borderRadius: 6 }} />
                    <Skeleton.Input active style={{ width: 60, height: 22, borderRadius: 20 }} />
                    <Skeleton.Input active style={{ width: 60, height: 22, borderRadius: 20 }} />
                    <Skeleton.Input active style={{ width: 70, height: 22, borderRadius: 20 }} />
                    <Skeleton.Input active style={{ flex: 1.5, height: 14, borderRadius: 6 }} />
                    <Skeleton.Button active style={{ width: 90, height: 30, borderRadius: 8 }} />
                </div>
            ))}
        </div>
    </div>
);

const AssignDemo: React.FC = () => {
    const { apiCall } = useAuth();
    const [demos, setDemos] = useState<DemoRequest[]>([]);
    const [statistics, setStatistics] = useState<DemoStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState<DemoRequest | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchDemos = async (page = 1, status = statusFilter, dates = dateRangeFilter, isInitial = false) => {
        isInitial ? setLoading(true) : setTableLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: pagination.pageSize.toString() });
            if (status) params.append('status', status);
            if (dates && dates.length === 2) {
                params.append('start_date', dates[0].startOf('day').toISOString());
                params.append('end_date', dates[1].endOf('day').toISOString());
            }
            const response = await apiCall(`/api/demo-requests/my-demos?${params}`);
            if (response.ok) {
                const data = await response.json();
                setDemos(data.data || []);
                setStatistics(data.statistics || null);
                setPagination(prev => ({ ...prev, current: data.pagination?.page || page, total: data.pagination?.total || 0 }));
            } else {
                let errorMsg = 'Failed to fetch demo requests';
                try { const err = await response.json(); errorMsg = err.message || err.error || errorMsg; } catch {}
                message.error(errorMsg);
            }
        } catch {
            message.error('Failed to fetch demo requests');
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    useEffect(() => { fetchDemos(1, '', true); }, []);

    const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
    const getAvatarColor = (name: string) => {
        const colors = ['#4f46e5', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
        const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        return colors[seed % colors.length];
    };

    const columns: ColumnsType<DemoRequest> = [
        {
            title: 'Student',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (name: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar size={32} style={{ backgroundColor: getAvatarColor(name), fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {getInitials(name)}
                    </Avatar>
                    <Text strong style={{ color: '#1a1d2e', fontSize: 13 }}>{name}</Text>
                </div>
            ),
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            render: (country: string) => (
                <Space size={4}>
                    <GlobalOutlined style={{ color: '#94a3b8', fontSize: 12 }} />
                    <Text style={{ fontSize: 13, color: '#4b5563' }}>{country}</Text>
                </Space>
            ),
        },
        {
            title: 'Current',
            dataIndex: 'current_level',
            key: 'current_level',
            render: (level: string) => (
                <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    {level}
                </span>
            ),
        },
        {
            title: 'Target',
            dataIndex: 'interested_level',
            key: 'interested_level',
            render: (level: string) => (
                <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                    {level}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span style={{
                    background: getStatusBg(status),
                    color: getStatusColor(status),
                    borderRadius: 20,
                    padding: '3px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                }}>
                    {getStatusText(status)}
                </span>
            ),
        },
        {
            title: 'Demo Scheduled',
            dataIndex: 'demo_scheduled_at',
            key: 'demo_scheduled_at',
            render: (date: string) => date ? (
                <Space size={4}>
                    <CalendarOutlined style={{ color: '#6366f1', fontSize: 12 }} />
                    <Text style={{ fontSize: 12, color: '#4b5563' }}>{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>
                </Space>
            ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).format('MMM DD, YYYY')}</Text>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => { setSelectedDemo(record); setDetailsModalVisible(true); }}
                    style={{ borderRadius: 8, color: '#6366f1', borderColor: '#c7d2fe', fontSize: 12 }}
                >
                    Details
                </Button>
            ),
        },
    ];

    /* ── LOADING ── */
    if (loading) return <DemoSkeleton />;

    /* ── LOADED ── */
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexShrink: 0 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1d2e', fontSize: 22 }}>
                        Assigned Demo Requests
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {statistics?.total_assigned ?? demos.length} request{(statistics?.total_assigned ?? demos.length) !== 1 ? 's' : ''} assigned to you
                    </Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchDemos(pagination.current)}
                    loading={tableLoading}
                    style={{ borderRadius: 10, height: 38, fontWeight: 600, borderColor: '#e0e7ff', color: '#6366f1' }}
                >
                    Refresh
                </Button>
            </div>

            {/* ── KPI Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24, flexShrink: 0 }}>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Total Assigned" value={statistics?.total_assigned || 0} icon={<UserOutlined />} accent="#6366f1" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Scheduled Demos" value={statistics?.scheduled || 0} icon={<CalendarOutlined />} accent="#22c55e" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Upcoming This Week" value={statistics?.this_week_demos || 0} icon={<ClockCircleOutlined />} accent="#f59e0b" />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <KpiCard label="Completed" value={statistics?.completed || 0} icon={<CheckCircleOutlined />} accent="#8b5cf6" />
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
                {/* Toolbar */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f0f0f8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexShrink: 0,
                }}>
                    <Text style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Filter:</Text>
                    <Select
                        placeholder="All statuses"
                        style={{ width: 170, borderRadius: 10 }}
                        value={statusFilter || undefined}
                        onChange={(val) => { setStatusFilter(val || ''); fetchDemos(1, val || ''); }}
                        allowClear
                        onClear={() => { setStatusFilter(''); fetchDemos(1, ''); }}
                    >
                        <Option value="new">
                            <span style={{ color: '#6366f1', fontWeight: 600 }}>● New</span>
                        </Option>
                        <Option value="contacted">
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>● Contacted</span>
                        </Option>
                        <Option value="demo_scheduled">
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>● Scheduled</span>
                        </Option>
                        <Option value="completed">
                            <span style={{ color: '#8b5cf6', fontWeight: 600 }}>● Completed</span>
                        </Option>
                        <Option value="cancelled">
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>● Cancelled</span>
                        </Option>
                    </Select>

                    <DatePicker.RangePicker
                        onChange={(dates) => { setDateRangeFilter(dates); fetchDemos(1, statusFilter, dates); }}
                        style={{ width: 260, borderRadius: 10 }}
                        allowClear
                    />

                    {statusFilter && (
                        <span style={{
                            background: getStatusBg(statusFilter),
                            color: getStatusColor(statusFilter),
                            borderRadius: 20, padding: '2px 12px', fontSize: 12, fontWeight: 600,
                        }}>
                            Showing: {getStatusText(statusFilter)}
                        </span>
                    )}

                    <div style={{ marginLeft: 'auto' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {pagination.total} result{pagination.total !== 1 ? 's' : ''}
                        </Text>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Table
                        columns={columns}
                        dataSource={demos}
                        rowKey="id"
                        loading={tableLoading}
                        scroll={{ y: 'calc(100vh - 400px)' }}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                            style: { padding: '12px 20px', borderTop: '1px solid #f0f0f8', margin: 0 },
                        }}
                        onChange={(pag) => fetchDemos(pag.current || 1)}
                        rowClassName={() => 'demo-table-row'}
                        locale={{
                            emptyText: (
                                <div style={{ padding: '48px 0', textAlign: 'center' }}>
                                    <VideoCameraOutlined style={{ fontSize: 40, color: '#c7d2fe', display: 'block', marginBottom: 10 }} />
                                    <Text type="secondary">No demo requests assigned yet</Text>
                                </div>
                            ),
                        }}
                    />
                </div>
            </div>

            {/* ── Details Modal ── */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {selectedDemo && (
                            <Avatar size={36} style={{ backgroundColor: getAvatarColor(selectedDemo.full_name), fontWeight: 700, fontSize: 13 }}>
                                {getInitials(selectedDemo.full_name)}
                            </Avatar>
                        )}
                        <div>
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 15 }}>{selectedDemo?.full_name}</div>
                            {selectedDemo && (
                                <span style={{
                                    background: getStatusBg(selectedDemo.status),
                                    color: getStatusColor(selectedDemo.status),
                                    borderRadius: 20, padding: '1px 10px', fontSize: 11, fontWeight: 600,
                                }}>
                                    {getStatusText(selectedDemo.status)}
                                </span>
                            )}
                        </div>
                    </div>
                }
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                width={760}
                footer={[
                    <Button key="close" onClick={() => setDetailsModalVisible(false)} style={{ borderRadius: 8 }}>
                        Close
                    </Button>
                ]}
            >
                {selectedDemo && (
                    <Descriptions column={2} bordered size="small" style={{ borderRadius: 10, overflow: 'hidden' }}>
                        <Descriptions.Item label="Student Name" span={2}>
                            <Text strong>{selectedDemo.full_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Country">
                            <Space size={4}><GlobalOutlined />{selectedDemo.country}</Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Timezone">
                            {selectedDemo.timezone || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Current Level">
                            <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                                {selectedDemo.current_level}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Target Level">
                            <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
                                {selectedDemo.interested_level}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Previous Experience">
                            <Badge
                                status={selectedDemo.has_previous_experience === 'yes' ? 'success' : 'default'}
                                text={selectedDemo.has_previous_experience === 'yes' ? 'Yes' : 'No'}
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label="Expected Start">
                            {selectedDemo.expected_start_time || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Learning Goals" span={2}>
                            <Text>{selectedDemo.learning_goals || '—'}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Preferred Schedule" span={2}>
                            <Text>{selectedDemo.preferred_schedule || '—'}</Text>
                        </Descriptions.Item>
                        {selectedDemo.demo_scheduled_at && (
                            <Descriptions.Item label="Demo Scheduled At" span={2}>
                                <Space size={6}>
                                    <CalendarOutlined style={{ color: '#6366f1' }} />
                                    <Text strong>{dayjs(selectedDemo.demo_scheduled_at).format('MMMM DD, YYYY [at] HH:mm')}</Text>
                                </Space>
                            </Descriptions.Item>
                        )}
                        {selectedDemo.meeting_link && (
                            <Descriptions.Item label="Meeting Link" span={2}>
                                <Space size={6}>
                                    <VideoCameraOutlined style={{ color: '#6366f1' }} />
                                    <a href={selectedDemo.meeting_link} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                                        {selectedDemo.meeting_link}
                                    </a>
                                </Space>
                            </Descriptions.Item>
                        )}
                        {selectedDemo.notes && (
                            <Descriptions.Item label="Notes" span={2}>
                                <Text>{selectedDemo.notes}</Text>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Created">
                            {dayjs(selectedDemo.created_at).format('MMM DD, YYYY HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Updated">
                            {dayjs(selectedDemo.updated_at).format('MMM DD, YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <style>{`
                .demo-table-row:hover td { background: #f8f7ff !important; }
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

export default AssignDemo;