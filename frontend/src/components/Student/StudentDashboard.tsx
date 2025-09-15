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
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Batch {
    id: number;
    name: string;
    description: string;
    teacher_name: string;
    start_date: string;
    end_date: string;
    current_students: number;
    max_students: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    batch_name: string;
    total_questions: number;
    time_limit: number;
    is_active: boolean;
    created_at: string;
    submission?: {
        id: number;
        score: number;
        max_score: number;
        submitted_at: string;
        time_taken: number;
    };
}

interface Resource {
    id: number;
    title: string;
    description: string;
    file_path: string;
    file_type: string;
    batch_name: string;
    uploaded_at: string;
}

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_name: string;
    scheduled_time: string;
    duration: number;
    type: 'class' | 'exam' | 'assignment';
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
            const [batchesRes, quizzesRes, resourcesRes, schedulesRes] = await Promise.all([
                apiCall(`/api/batches/student/${user?.id}`),
                apiCall(`/api/quizzes/student/${user?.id}`),
                apiCall(`/api/resources/student/${user?.id}`),
                apiCall(`/api/schedules/student/${user?.id}`)
            ]);

            if (batchesRes.success) {
                setBatches(batchesRes.data);
                setStats(prev => ({
                    ...prev,
                    totalBatches: batchesRes.data.length
                }));
            }

            if (quizzesRes.success) {
                setQuizzes(quizzesRes.data);
                const completedQuizzes = quizzesRes.data.filter((quiz: Quiz) => quiz.submission).length;
                const pendingQuizzes = quizzesRes.data.filter((quiz: Quiz) => !quiz.submission && quiz.is_active).length;
                
                const totalScore = quizzesRes.data
                    .filter((quiz: Quiz) => quiz.submission)
                    .reduce((acc: number, quiz: Quiz) => acc + (quiz.submission?.score || 0), 0);
                const totalMaxScore = quizzesRes.data
                    .filter((quiz: Quiz) => quiz.submission)
                    .reduce((acc: number, quiz: Quiz) => acc + (quiz.submission?.max_score || 0), 0);
                
                const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
                
                setStats(prev => ({
                    ...prev,
                    completedQuizzes,
                    pendingQuizzes,
                    averageScore
                }));
            }

            if (resourcesRes.success) {
                setResources(resourcesRes.data);
                setStats(prev => ({
                    ...prev,
                    totalResources: resourcesRes.data.length
                }));
            }

            if (schedulesRes.success) {
                setSchedules(schedulesRes.data);
                const upcomingClasses = schedulesRes.data.filter((schedule: Schedule) => 
                    dayjs(schedule.scheduled_time).isAfter(dayjs())
                ).length;
                
                setStats(prev => ({
                    ...prev,
                    upcomingClasses
                }));
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
            const response = await apiCall(`/api/resources/${resource.id}/download`);
            if (response.success) {
                // Create download link
                const link = document.createElement('a');
                link.href = response.data.download_url;
                link.download = resource.title;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
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
            dataIndex: 'batch_name',
            key: 'batch_name'
        },
        {
            title: 'Questions',
            dataIndex: 'total_questions',
            key: 'total_questions'
        },
        {
            title: 'Time Limit',
            dataIndex: 'time_limit',
            key: 'time_limit',
            render: (time: number) => `${time} min`
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                if (record.submission) {
                    const percentage = Math.round((record.submission.score / record.submission.max_score) * 100);
                    return (
                        <div>
                            <Tag color="green">Completed</Tag>
                            <br />
                            <Text type="secondary">{percentage}% ({record.submission.score}/{record.submission.max_score})</Text>
                        </div>
                    );
                } else if (record.is_active) {
                    return <Tag color="blue">Available</Tag>;
                } else {
                    return <Tag color="default">Inactive</Tag>;
                }
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => {
                if (record.submission) {
                    return (
                        <Button type="link" disabled>
                            <CheckCircleOutlined /> Completed
                        </Button>
                    );
                } else if (record.is_active) {
                    return (
                        <Button 
                            type="primary" 
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartQuiz(record)}
                        >
                            Start Quiz
                        </Button>
                    );
                } else {
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
            dataIndex: 'file_type',
            key: 'file_type',
            render: (type: string) => {
                const color = type === 'pdf' ? 'red' : type === 'doc' ? 'blue' : 'green';
                return <Tag color={color}>{type.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Uploaded',
            dataIndex: 'uploaded_at',
            key: 'uploaded_at',
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
            .filter(schedule => dayjs(schedule.scheduled_time).isAfter(dayjs()))
            .sort((a, b) => dayjs(a.scheduled_time).diff(dayjs(b.scheduled_time)))
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
                                        const isActive = dayjs().isBetween(dayjs(batch.start_date), dayjs(batch.end_date));
                                        const isUpcoming = dayjs().isBefore(dayjs(batch.start_date));
                                        
                                        return (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            style={{ 
                                                                backgroundColor: isActive ? '#52c41a' : isUpcoming ? '#1890ff' : '#d9d9d9' 
                                                            }}
                                                            icon={<BookOutlined />}
                                                        />
                                                    }
                                                    title={batch.name}
                                                    description={
                                                        <div>
                                                            <Text type="secondary">{batch.description}</Text>
                                                            <br />
                                                            <Text type="secondary">Teacher: {batch.teacher_name}</Text>
                                                            <br />
                                                            <Text type="secondary">
                                                                {dayjs(batch.start_date).format('MMM DD')} - {dayjs(batch.end_date).format('MMM DD, YYYY')}
                                                            </Text>
                                                        </div>
                                                    }
                                                />
                                                <div style={{ textAlign: 'right' }}>
                                                    <Tag color={isActive ? 'green' : isUpcoming ? 'blue' : 'default'}>
                                                        {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed'}
                                                    </Tag>
                                                    <br />
                                                    <Text type="secondary">
                                                        {batch.current_students}/{batch.max_students} students
                                                    </Text>
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
                                                {dayjs(schedule.scheduled_time).format('MMM DD, YYYY HH:mm')}
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

                    <Card title="Recent Performance">
                        <div>
                            {quizzes
                                .filter(quiz => quiz.submission)
                                .sort((a, b) => dayjs(b.submission?.submitted_at).diff(dayjs(a.submission?.submitted_at)))
                                .slice(0, 5)
                                .map((quiz) => {
                                    const percentage = Math.round((quiz.submission!.score / quiz.submission!.max_score) * 100);
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
                                    value={selectedQuiz.time_limit}
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