import React, { useState, useEffect } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Statistic, 
    Table, 
    Button, 
    Modal, 
    Form, 
    Input, 
    Select, 
    message, 
    Space,
    Typography,
    Tag,
    Progress,
    Tabs,
    List,
    Avatar,
    Timeline,
    Alert
} from 'antd';
import {
    BookOutlined,
    FileTextOutlined,
    CalendarOutlined,
    TrophyOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StarOutlined,
    FolderOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Batch {
    id: number;
    name: string;
    description?: string;
    teacher_name?: string;
    start_date?: string;
    end_date?: string;
    current_students?: number;
    max_students?: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    total_questions: number;
    duration_minutes: number;
    total_marks?: number;
    status?: string; // draft | published
    start_date?: string | null;
    end_date?: string | null;
    batch_names?: string; // comma-separated
    submission_status?: 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted';
    submission?: {
        total_score?: number;
        max_score?: number;
        percentage?: number;
        status?: string;
    } | null;
}

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_type: string; // MIME type
    batch_name: string;
    created_at: string;
}

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_name: string;
    start_time: string;
    end_time: string;
    type: string; // 'class' | 'exam' | 'assignment' | ...
}

const StudentDashboard: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [quizModalVisible, setQuizModalVisible] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalBatches: 0,
        completedQuizzes: 0,
        pendingQuizzes: 0,
        averageScore: 0,
        totalResources: 0,
        upcomingClasses: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [quizzesRes, resultsRes, resourcesRes, schedulesRes, batchesRes] = await Promise.all([
                apiCall('/quizzes'),
                apiCall('/quizzes/student/results'),
                apiCall('/resources'),
                apiCall('/schedules/upcoming/me?limit=20'),
                apiCall('/quizzes/student/dashboard')
            ]);

            // Quizzes
            if (quizzesRes && quizzesRes.ok) {
                const data = await quizzesRes.json();
                const quizzesData: Quiz[] = Array.isArray(data) ? data : (data.quizzes || []);
                setQuizzes(quizzesData);

                // Stats: completed & pending based on submission_status and availability
                const completedQuizzes = quizzesData.filter(q => q.submission_status === 'submitted' || q.submission_status === 'auto_submitted').length;

                const now = dayjs();
                const isActive = (q: Quiz) => {
                    if (q.status !== 'published') return false;
                    const start = q.start_date ? dayjs(q.start_date) : null;
                    const end = q.end_date ? dayjs(q.end_date) : null;
                    if (start && now.isBefore(start)) return false;
                    if (end && now.isAfter(end)) return false;
                    return true;
                };
                const pendingQuizzes = quizzesData.filter(q => (q.submission_status === 'not_started' || q.submission_status === 'in_progress' || !q.submission_status) && isActive(q)).length;

                setStats(prev => ({
                    ...prev,
                    completedQuizzes,
                    pendingQuizzes
                }));
            }

            // Results for average score
            if (resultsRes && resultsRes.ok) {
                const data = await resultsRes.json();
                const results = (data?.results || []) as any[];
                const scores = results.map(r => Number(r.percentage ?? 0)).filter((n: number) => !isNaN(n));
                const averageScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length)) : 0;
                setStats(prev => ({ ...prev, averageScore }));
            }

            // Resources
            if (resourcesRes && resourcesRes.ok) {
                const data = await resourcesRes.json();
                const resourcesData: Resource[] = Array.isArray(data) ? data : (data.resources || []);
                setResources(resourcesData);
                setStats(prev => ({ ...prev, totalResources: resourcesData.length }));
            }

            // Schedules (upcoming)
            if (schedulesRes && schedulesRes.ok) {
                const data = await schedulesRes.json();
                const schedulesData: Schedule[] = Array.isArray(data) ? data : (data.schedules || []);
                setSchedules(schedulesData);
                const upcomingClasses = schedulesData.filter((s: Schedule) => dayjs(s.start_time).isAfter(dayjs())).length;
                setStats(prev => ({ ...prev, upcomingClasses }));
            }

            // Batches via quizzes student dashboard
            if (batchesRes && batchesRes.ok) {
                const data = await batchesRes.json();
                const batchesData = Array.isArray(data?.batches) ? data.batches : [];
                const mappedBatches: Batch[] = batchesData.map((b: any) => ({
                    id: b.id,
                    name: b.name,
                    description: b.description
                }));
                setBatches(mappedBatches);
                setStats(prev => ({ ...prev, totalBatches: mappedBatches.length }));
            }
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleStartQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setQuizModalVisible(true);
    };

    const handleDownloadResource = async (resource: Resource) => {
        try {
            const response = await apiCall(`/resources/${resource.id}/download`);
            if (response && response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = resource.file_name || resource.title;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                message.error('Failed to download resource');
            }
        } catch (error) {
            message.error('Failed to download resource');
        }
    };

    const quizColumns: ColumnsType<Quiz> = [
        {
            title: 'Quiz Title',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: 'Batch',
            key: 'batch_name',
            render: (_, record) => record.batch_names || '—'
        },
        {
            title: 'Questions',
            dataIndex: 'total_questions',
            key: 'total_questions'
        },
        {
            title: 'Time Limit',
            dataIndex: 'duration_minutes',
            key: 'duration_minutes',
            render: (time: number) => `${time} min`
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                if (record.submission_status === 'submitted' || record.submission_status === 'auto_submitted') {
                    const percentage = Math.round(Number(record.submission?.percentage ?? ((Number(record.submission?.total_score || 0) / Number(record.submission?.max_score || 0)) * 100)) || 0);
                    return (
                        <div>
                            <Tag color="green">Completed</Tag>
                            <br />
                            <Text type="secondary">{percentage}% ({record.submission?.total_score ?? '—'}/{record.submission?.max_score ?? '—'})</Text>
                        </div>
                    );
                } else {
                    const now = dayjs();
                    const start = record.start_date ? dayjs(record.start_date) : null;
                    const end = record.end_date ? dayjs(record.end_date) : null;
                    const isActive = (record.status === 'published') && (!start || !now.isBefore(start)) && (!end || !now.isAfter(end));
                    return isActive ? <Tag color="blue">Available</Tag> : <Tag color="default">Inactive</Tag>;
                }
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                if (record.submission_status === 'submitted' || record.submission_status === 'auto_submitted') {
                    return (
                        <Button type="link" disabled>
                            <CheckCircleOutlined /> Completed
                        </Button>
                    );
                } else {
                    const now = dayjs();
                    const start = record.start_date ? dayjs(record.start_date) : null;
                    const end = record.end_date ? dayjs(record.end_date) : null;
                    const isActive = (record.status === 'published') && (!start || !now.isBefore(start)) && (!end || !now.isAfter(end));
                    if (isActive) {
                        return (
                            <Button 
                                type="primary" 
                                icon={<PlayCircleOutlined />}
                                onClick={() => handleStartQuiz(record)}
                            >
                                Start Quiz
                            </Button>
                        );
                    }
                    return (
                        <Button type="link" disabled>
                            <ClockCircleOutlined /> Not Available
                        </Button>
                    );
                }
            }
        }
    ];

    const resourceColumns: ColumnsType<Resource> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: 'Batch',
            dataIndex: 'batch_name',
            key: 'batch_name'
        },
        {
            title: 'Type',
            key: 'file_type',
            render: (_, record) => {
                const ext = (record.file_name?.split('.').pop() || '').toLowerCase();
                let color = 'green';
                if (ext === 'pdf') color = 'red';
                else if (ext === 'doc' || ext === 'docx') color = 'blue';
                else if (ext === 'ppt' || ext === 'pptx') color = 'orange';
                return <Tag color={color}>{ext ? ext.toUpperCase() : (record.file_type || 'FILE')}</Tag>;
            }
        },
        {
            title: 'Uploaded',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleDownloadResource(record)}
                >
                    Download
                </Button>
            )
        }
    ];

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return '#52c41a';
        if (percentage >= 80) return '#1890ff';
        if (percentage >= 70) return '#fa8c16';
        return '#f5222d';
    };

    const getUpcomingSchedules = () => {
        return schedules
            .filter(schedule => dayjs(schedule.start_time).isAfter(dayjs()))
            .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))
            .slice(0, 5);
    };

    return (
        <div>
            <Title level={2}>Student Dashboard</Title>
            
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="My Batches"
                            value={stats.totalBatches}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Completed Quizzes"
                            value={stats.completedQuizzes}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Score"
                            value={stats.averageScore}
                            suffix="%"
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: getScoreColor(stats.averageScore) }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Pending Quizzes"
                            value={stats.pendingQuizzes}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Tabs defaultActiveKey="quizzes">
                        <TabPane tab="My Quizzes" key="quizzes">
                            <Card title="Available Quizzes">
                                {stats.pendingQuizzes > 0 && (
                                    <Alert
                                        message={`You have ${stats.pendingQuizzes} pending quiz${stats.pendingQuizzes > 1 ? 'es' : ''} to complete`}
                                        type="info"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                )}
                                <Table
                                    columns={quizColumns}
                                    dataSource={quizzes}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        </TabPane>

                        <TabPane tab="Resources" key="resources">
                            <Card title="Learning Resources">
                                <Table
                                    columns={resourceColumns}
                                    dataSource={resources}
                                    rowKey="id"
                                    loading={loading}
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        </TabPane>

                        <TabPane tab="My Batches" key="batches">
                            <Card title="Enrolled Batches">
                                <List
                                    itemLayout="horizontal"
                                    dataSource={batches}
                                    loading={loading}
                                    renderItem={(batch) => {
                                        const hasDates = !!(batch.start_date && batch.end_date);
                                        const isActive = hasDates ? dayjs().isBetween(dayjs(batch.start_date), dayjs(batch.end_date)) : false;
                                        const isUpcoming = hasDates ? dayjs().isBefore(dayjs(batch.start_date)) : false;
                                        
                                        return (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            style={{ 
                                                                backgroundColor: hasDates ? (isActive ? '#52c41a' : isUpcoming ? '#1890ff' : '#d9d9d9') : '#1890ff' 
                                                            }}
                                                            icon={<BookOutlined />}
                                                        />
                                                    }
                                                    title={batch.name}
                                                    description={
                                                        <div>
                                                            {batch.description && (
                                                                <>
                                                                    <Text type="secondary">{batch.description}</Text>
                                                                    <br />
                                                                </>
                                                            )}
                                                            {batch.teacher_name && (
                                                                <>
                                                                    <Text type="secondary">Teacher: {batch.teacher_name}</Text>
                                                                    <br />
                                                                </>
                                                            )}
                                                            {hasDates && (
                                                                <Text type="secondary">
                                                                    {dayjs(batch.start_date).format('MMM DD')} - {dayjs(batch.end_date).format('MMM DD, YYYY')}
                                                                </Text>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                                <div style={{ textAlign: 'right' }}>
                                                    <Tag color={hasDates ? (isActive ? 'green' : isUpcoming ? 'blue' : 'default') : 'blue'}>
                                                        {hasDates ? (isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed') : 'Enrolled'}
                                                    </Tag>
                                                    <br />
                                                    {(batch.current_students !== undefined && batch.max_students !== undefined) && (
                                                        <Text type="secondary">
                                                            {batch.current_students}/{batch.max_students} students
                                                        </Text>
                                                    )}
                                                </div>
                                            </List.Item>
                                        );
                                    }}
                                />
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Upcoming Schedule" style={{ marginBottom: 16 }}>
                        <Timeline>
                            {getUpcomingSchedules().map((schedule) => {
                                const timeColor = schedule.type === 'exam' ? 'red' : 
                                                schedule.type === 'assignment' ? 'orange' : 'blue';
                                
                                return (
                                    <Timeline.Item key={schedule.id} color={timeColor}>
                                        <div>
                                            <Text strong>{schedule.title}</Text>
                                            <br />
                                            <Text type="secondary">{schedule.batch_name}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {dayjs(schedule.start_time).format('MMM DD, YYYY HH:mm')}
                                            </Text>
                                            <br />
                                            <Tag color={timeColor} size="small">
                                                {schedule.type.toUpperCase()}
                                            </Tag>
                                        </div>
                                    </Timeline.Item>
                                );
                            })}
                        </Timeline>
                        {getUpcomingSchedules().length === 0 && (
                            <Text type="secondary">No upcoming events</Text>
                        )}
                    </Card>

                    <Card 
                        title="Recent Performance"
                        extra={
                            quizzes.filter(quiz => quiz.submission).length > 0 && (
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/my-results')}
                                    icon={<TrophyOutlined />}
                                >
                                    View All Results
                                </Button>
                            )
                        }
                    >
                        <div>
                            {quizzes
                                .filter(quiz => quiz.submission)
                                .sort((a, b) => dayjs(b.submission?.submitted_at).diff(dayjs(a.submission?.submitted_at)))
                                .slice(0, 5)
                                .map((quiz) => {
                                    const percentage = Math.round(Number(quiz.submission?.percentage ?? ((Number(quiz.submission?.total_score || 0) / Number(quiz.submission?.max_score || 0)) * 100)) || 0);
                                    return (
                                        <div key={quiz.id} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <Text ellipsis style={{ maxWidth: '70%' }}>{quiz.title}</Text>
                                                <Text strong style={{ color: getScoreColor(percentage) }}>
                                                    {percentage}%
                                                </Text>
                                            </div>
                                            <Progress 
                                                percent={percentage} 
                                                size="small" 
                                                strokeColor={getScoreColor(percentage)}
                                                showInfo={false}
                                            />
                                        </div>
                                    );
                                })
                            }
                            {quizzes.filter(quiz => quiz.submission).length === 0 && (
                                <Text type="secondary">No completed quizzes yet</Text>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Quiz Start Modal */}
            <Modal
                title="Start Quiz"
                open={quizModalVisible}
                onCancel={() => {
                    setQuizModalVisible(false);
                    setSelectedQuiz(null);
                }}
                footer={[
                    <Button key="cancel" onClick={() => setQuizModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button 
                        key="start" 
                        type="primary" 
                        onClick={() => {
                            // Navigate to quiz taking page
                            window.location.href = `/quiz/${selectedQuiz?.id}`;
                        }}
                    >
                        Start Quiz
                    </Button>
                ]}
            >
                {selectedQuiz && (
                    <div>
                        <Title level={4}>{selectedQuiz.title}</Title>
                        <p>{selectedQuiz.description}</p>
                        
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Questions"
                                    value={selectedQuiz.total_questions}
                                    prefix={<FileTextOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Time Limit"
                                    value={selectedQuiz.duration_minutes}
                                    suffix="minutes"
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Col>
                        </Row>
                        
                        <Alert
                            message="Important Instructions"
                            description="Once you start the quiz, the timer will begin. Make sure you have a stable internet connection and enough time to complete it."
                            type="warning"
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentDashboard;