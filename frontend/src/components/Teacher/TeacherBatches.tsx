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
    Statistic,
    Row,
    Col,
    Descriptions,
    Badge,
    Divider,
    Tooltip,
    Drawer
} from 'antd';
import {
    TeamOutlined,
    UserOutlined,
    EyeOutlined,
    CalendarOutlined,
    BookOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import BatchInsights from './BatchInsights';
// Removed duplicate antd import (consolidated above)

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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

const TeacherBatches: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [insightsVisible, setInsightsVisible] = useState(false);
    const [insightsBatchId, setInsightsBatchId] = useState<number | null>(null);
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
                setBatches(Array.isArray(data) ? data : (data.batches || []));
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
            // Backend provides students array on GET /batches/:id
            const response = await apiCall(`/batches/${batchId}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data.students) ? data.students : []);
            } else {
                message.error('Failed to fetch students');
            }
        } catch (error) {
            message.error('Error fetching students');
        } finally {
            setStudentsLoading(false);
        }
    };

    const getBatchStatus = (batch: Batch) => {
        const now = dayjs();
        const startDate = dayjs(batch.start_date);
        const endDate = dayjs(batch.end_date);
        
        if (now.isBefore(startDate)) {
            return 'inactive'; // Not started yet
        } else if (now.isAfter(endDate)) {
            return 'completed'; // Finished
        } else {
            return 'active'; // Currently running
        }
    };

    // Helpers for nicer avatars
    const getInitials = (first: string, last: string) => ((first?.[0] || '') + (last?.[0] || '')).toUpperCase() || '?';
    const getAvatarColor = (first: string, last: string) => {
        const colors = ['#1677ff','#52c41a','#fa8c16','#722ed1','#eb2f96','#2f54eb','#fa541c','#faad14','#13c2c2','#a0d911'];
        const seed = (first + last).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        return colors[seed % colors.length];
    };

    const activeBatches = batches.filter(batch => getBatchStatus(batch) === 'active');
    const completedBatches = batches.filter(batch => getBatchStatus(batch) === 'completed');
    const inactiveBatches = batches.filter(batch => getBatchStatus(batch) === 'inactive');

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
        },
        {
            title: 'French Level',
            dataIndex: 'french_level',
            key: 'french_level',
            render: (level: string) => (
                <Tag color="blue">{level}</Tag>
            ),
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
                    <TeamOutlined style={{ marginRight: 8 }} />
                    {record.student_count || 0} students
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewStudents(record)}
                    >
                        View Students
                    </Button>
                    <Button
                        type="primary"
                        icon={<BarChartOutlined />}
                        onClick={() => handleOpenInsights(record)}
                    >
                        Insights
                    </Button>
                </Space>
            ),
        },
    ];



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
                            value={batches.reduce((sum, batch) => sum + (batch.student_count || 0), 0)}
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
                width={800}
             >
                 {selectedBatch && (
                     <div style={{ marginBottom: 16 }}>
                        <Card>
                            <Descriptions bordered size="small" column={2}>
                                <Descriptions.Item label="Batch Name">{selectedBatch.name}</Descriptions.Item>
                                <Descriptions.Item label="Teacher">{selectedBatch.teacher_first_name} {selectedBatch.teacher_last_name}</Descriptions.Item>
                                <Descriptions.Item label="French Level"><Tag color="blue">{selectedBatch.french_level}</Tag></Descriptions.Item>
                                <Descriptions.Item label="Total Students">{selectedBatch.student_count || 0}</Descriptions.Item>
                                <Descriptions.Item label="Duration" span={2}>
                                    {dayjs(selectedBatch.start_date).format('MMM DD, YYYY')} - {dayjs(selectedBatch.end_date).format('MMM DD, YYYY')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Status" span={2}>
                                    <Badge
                                        status={getBatchStatus(selectedBatch) === 'active' ? 'success' : getBatchStatus(selectedBatch) === 'completed' ? 'processing' : 'warning'}
                                        text={getBatchStatus(selectedBatch).toUpperCase()}
                                    />
                                </Descriptions.Item>
                            </Descriptions>
                            {(selectedBatch.student_count ?? 0) !== students.length && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Showing {students.length} of {selectedBatch.student_count ?? students.length} students</Text>
                                </div>
                            )}
                        </Card>
                    </div>
                  )}
                <Divider orientation="left" plain>Enrolled Students</Divider>

                <List
                    loading={studentsLoading}
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
                    dataSource={students}
                    renderItem={(student) => (
                        <List.Item key={student.email || student.id}>
                            <Card
                                hoverable
                                bodyStyle={{ padding: 16 }}
                                style={{ 
                                    height: '100%', 
                                    borderRadius: 10, 
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                    <Avatar 
                                        size={48}
                                        style={{ 
                                            backgroundColor: getAvatarColor(student.first_name, student.last_name),
                                            flexShrink: 0
                                        }}
                                    >
                                        {getInitials(student.first_name, student.last_name)}
                                    </Avatar>
                                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                                        <Tooltip title={`${student.first_name} ${student.last_name}`}>
                                            <Text 
                                                strong 
                                                style={{ 
                                                    display: 'block', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', 
                                                    whiteSpace: 'nowrap',
                                                    marginBottom: 4
                                                }}
                                            >
                                                {`${student.first_name} ${student.last_name}`}
                                            </Text>
                                        </Tooltip>
                                        <Tooltip title={student.email}>
                                            <a
                                                href={`mailto:${student.email}`}
                                                style={{ 
                                                    display: 'block', 
                                                    overflow: 'hidden', 
                                                    textOverflow: 'ellipsis', 
                                                    whiteSpace: 'nowrap',
                                                    fontSize: '12px',
                                                    color: '#666'
                                                }}
                                            >
                                                {student.email}
                                            </a>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        <CalendarOutlined style={{ marginRight: 4 }} /> 
                                        Enrolled: {student.enrolled_at ? dayjs(student.enrolled_at).format('MMM DD, YYYY') : '-'}
                                    </Text>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                    locale={{
                        emptyText: (
                            <div style={{ padding: 24, textAlign: 'center' }}>
                                <TeamOutlined style={{ fontSize: 32, color: '#bbb' }} />
                                <div style={{ marginTop: 8 }}>No students enrolled in this batch yet.</div>
                            </div>
                        )
                    }}
                />
             </Modal>

             <Drawer
                title="Batch Insights"
                placement="right"
                width={980}
                open={insightsVisible}
                onClose={() => setInsightsVisible(false)}
                destroyOnClose
                >
                    {insightsVisible && insightsBatchId !== null && (
                        <BatchInsights batchId={String(insightsBatchId)} />
                    )}
                </Drawer>
        </div>
    );
};

export default TeacherBatches;