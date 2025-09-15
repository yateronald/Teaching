import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Card,
    Typography,
    Tag,
    Space,
    message,
    Tabs,
    List,
    Avatar,
    Progress,
    Statistic,
    Row,
    Col
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    EyeOutlined,
    CalendarOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Batch {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    max_students: number;
    current_students: number;
    status: 'active' | 'inactive' | 'completed';
    created_at: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    enrolled_at: string;
}

const TeacherBatches: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/batches/my-batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(data.batches || []);
            } else {
                message.error('Failed to fetch batches');
            }
        } catch (error) {
            message.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatchStudents = async (batchId: number) => {
        setStudentsLoading(true);
        try {
            const response = await apiCall(`/batches/${batchId}/students`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students || []);
            } else {
                message.error('Failed to fetch students');
            }
        } catch (error) {
            message.error('Error fetching students');
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleViewStudents = (batch: Batch) => {
        setSelectedBatch(batch);
        setModalVisible(true);
        fetchBatchStudents(batch.id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'green';
            case 'inactive': return 'orange';
            case 'completed': return 'blue';
            default: return 'default';
        }
    };

    const getProgressPercent = (current: number, max: number) => {
        return max > 0 ? Math.round((current / max) * 100) : 0;
    };

    const columns: ColumnsType<Batch> = [
        {
            title: 'Batch Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => (
                <span>
                    {dayjs(record.start_date).format('MMM DD, YYYY')} - {dayjs(record.end_date).format('MMM DD, YYYY')}
                </span>
            ),
        },
        {
            title: 'Students',
            key: 'students',
            render: (_, record) => (
                <div>
                    <Progress 
                        percent={getProgressPercent(record.current_students || 0, record.max_students)}
                        size="small"
                        format={() => `${record.current_students || 0}/${record.max_students}`}
                    />
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStudents(record)}
                    >
                        View Students
                    </Button>
                </Space>
            ),
        },
    ];

    const activeBatches = batches.filter(batch => batch.status === 'active');
    const completedBatches = batches.filter(batch => batch.status === 'completed');
    const inactiveBatches = batches.filter(batch => batch.status === 'inactive');

    return (
        <div>
            <Title level={2}>
                <TeamOutlined /> My Batches
            </Title>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Batches"
                            value={batches.length}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Active Batches"
                            value={activeBatches.length}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Students"
                            value={batches.reduce((sum, batch) => sum + (batch.current_students || 0), 0)}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Completed Batches"
                            value={completedBatches.length}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <Tabs defaultActiveKey="active">
                    <TabPane tab={`Active (${activeBatches.length})`} key="active">
                        <Table
                            columns={columns}
                            dataSource={activeBatches}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Completed (${completedBatches.length})`} key="completed">
                        <Table
                            columns={columns}
                            dataSource={completedBatches}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Inactive (${inactiveBatches.length})`} key="inactive">
                        <Table
                            columns={columns}
                            dataSource={inactiveBatches}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={selectedBatch ? `Students in ${selectedBatch.name}` : 'Students'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedBatch(null);
                    setStudents([]);
                }}
                footer={null}
                width={700}
            >
                {selectedBatch && (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong>Batch: </Text>
                        <Text>{selectedBatch.name}</Text>
                        <br />
                        <Text strong>Description: </Text>
                        <Text>{selectedBatch.description}</Text>
                        <br />
                        <Text strong>Capacity: </Text>
                        <Text>{selectedBatch.current_students || 0} / {selectedBatch.max_students} students</Text>
                    </div>
                )}
                
                <List
                    loading={studentsLoading}
                    dataSource={students}
                    renderItem={(student) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={`${student.first_name} ${student.last_name}`}
                                description={
                                    <div>
                                        <Text type="secondary">{student.email}</Text>
                                        <br />
                                        <Text type="secondary">
                                            Enrolled: {dayjs(student.enrolled_at).format('MMM DD, YYYY')}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                    locale={{
                        emptyText: 'No students enrolled in this batch yet.'
                    }}
                />
            </Modal>
        </div>
    );
};

export default TeacherBatches;