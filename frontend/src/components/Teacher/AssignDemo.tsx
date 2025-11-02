import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    Tag,
    Space,
    Row,
    Col,
    Statistic,
    Button,
    Modal,
    Descriptions,
    Select,
    message,
    Badge,
    Empty
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    GlobalOutlined,
    VideoCameraOutlined,
    ReloadOutlined
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

const AssignDemo: React.FC = () => {
    const { apiCall } = useAuth();
    const [demos, setDemos] = useState<DemoRequest[]>([]);
    const [statistics, setStatistics] = useState<DemoStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDemo, setSelectedDemo] = useState<DemoRequest | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchDemos = async (page = 1, status = statusFilter) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: pagination.pageSize.toString()
            });
            
            if (status) {
                params.append('status', status);
            }

            const response = await apiCall(`/api/demo-requests/my-demos?${params}`);

            if (response.ok) {
                const data = await response.json();
                setDemos(data.data || []);
                setStatistics(data.statistics || null);
                setPagination(prev => ({
                    ...prev,
                    current: data.pagination?.page || page,
                    total: data.pagination?.total || 0
                }));
            } else {
                let errorMsg = 'Failed to fetch demo requests';
                try {
                    const err = await response.json();
                    errorMsg = err.message || err.error || errorMsg;
                } catch {}
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('Error fetching demos:', error);
            message.error('Failed to fetch demo requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemos();
    }, []);

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        fetchDemos(1, value);
    };

    const handleTableChange = (paginationInfo: any) => {
        fetchDemos(paginationInfo.current, statusFilter);
    };

    const showDetails = (demo: DemoRequest) => {
        setSelectedDemo(demo);
        setDetailsModalVisible(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'blue';
            case 'contacted': return 'orange';
            case 'demo_scheduled': return 'green';
            case 'completed': return 'purple';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'new': return 'New';
            case 'contacted': return 'Contacted';
            case 'demo_scheduled': return 'Demo Scheduled';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const columns: ColumnsType<DemoRequest> = [
        {
            title: 'Student Name',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (name: string) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{name}</Text>
                </Space>
            ),
        },
        {
            title: 'Country',
            dataIndex: 'country',
            key: 'country',
            render: (country: string) => (
                <Space>
                    <GlobalOutlined />
                    {country}
                </Space>
            ),
        },
        {
            title: 'Current Level',
            dataIndex: 'current_level',
            key: 'current_level',
            render: (level: string) => <Tag color="blue">{level}</Tag>,
        },
        {
            title: 'Interested Level',
            dataIndex: 'interested_level',
            key: 'interested_level',
            render: (level: string) => <Tag color="green">{level}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Demo Scheduled',
            dataIndex: 'demo_scheduled_at',
            key: 'demo_scheduled_at',
            render: (date: string) => {
                if (!date) return <Text type="secondary">Not scheduled</Text>;
                return (
                    <Space>
                        <CalendarOutlined />
                        <Text>{dayjs(date).format('MMM DD, YYYY HH:mm')}</Text>
                    </Space>
                );
            },
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: DemoRequest) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => showDetails(record)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2}>
                        <VideoCameraOutlined /> Assigned Demo Requests
                    </Title>
                </Col>
                <Col>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => fetchDemos()}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </Col>
            </Row>

            {/* Dashboard Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Assigned"
                            value={statistics?.total_assigned || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Scheduled Demos"
                            value={statistics?.scheduled || 0}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Upcoming This Week"
                            value={statistics?.this_week_demos || 0}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={statistics?.completed || 0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters and Table */}
            <Card>
                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                    <Col>
                        <Space>
                            <Text strong>Filter by Status:</Text>
                            <Select
                                placeholder="All Statuses"
                                style={{ width: 150 }}
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                allowClear
                            >
                                <Option value="new">New</Option>
                                <Option value="contacted">Contacted</Option>
                                <Option value="demo_scheduled">Demo Scheduled</Option>
                                <Option value="completed">Completed</Option>
                                <Option value="cancelled">Cancelled</Option>
                            </Select>
                        </Space>
                    </Col>
                </Row>

                <Table
                    columns={columns}
                    dataSource={demos}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} demo requests`,
                    }}
                    onChange={handleTableChange}
                    locale={{
                        emptyText: (
                            <Empty
                                description="No demo requests assigned yet"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                />
            </Card>

            {/* Details Modal */}
            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        <span>Demo Request Details</span>
                        {selectedDemo && (
                            <Tag color={getStatusColor(selectedDemo.status)}>
                                {getStatusText(selectedDemo.status)}
                            </Tag>
                        )}
                    </Space>
                }
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setDetailsModalVisible(false)}>
                        Close
                    </Button>
                ]}
            >
                {selectedDemo && (
                    <div>
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="Student Name" span={2}>
                                <Text strong>{selectedDemo.full_name}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Country">
                                <Space>
                                    <GlobalOutlined />
                                    {selectedDemo.country}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Current Level">
                                <Tag color="blue">{selectedDemo.current_level}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Interested Level">
                                <Tag color="green">{selectedDemo.interested_level}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Previous Experience">
                                <Badge
                                    status={selectedDemo.has_previous_experience === 'yes' ? 'success' : 'default'}
                                    text={selectedDemo.has_previous_experience === 'yes' ? 'Yes' : 'No'}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Timezone">
                                {selectedDemo.timezone || 'Not specified'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Learning Goals" span={2}>
                                <Text>{selectedDemo.learning_goals}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Expected Start Time" span={2}>
                                <Text>{selectedDemo.expected_start_time}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Preferred Schedule" span={2}>
                                <Text>{selectedDemo.preferred_schedule}</Text>
                            </Descriptions.Item>
                            {selectedDemo.demo_scheduled_at && (
                                <Descriptions.Item label="Demo Scheduled At" span={2}>
                                    <Space>
                                        <CalendarOutlined />
                                        <Text strong>
                                            {dayjs(selectedDemo.demo_scheduled_at).format('MMMM DD, YYYY [at] HH:mm')}
                                        </Text>
                                    </Space>
                                </Descriptions.Item>
                            )}
                            {selectedDemo.meeting_link && (
                                <Descriptions.Item label="Meeting Link" span={2}>
                                    <Space>
                                        <VideoCameraOutlined />
                                        <a href={selectedDemo.meeting_link} target="_blank" rel="noopener noreferrer">
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
                            <Descriptions.Item label="Created At">
                                {dayjs(selectedDemo.created_at).format('MMM DD, YYYY HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                {dayjs(selectedDemo.updated_at).format('MMM DD, YYYY HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AssignDemo;