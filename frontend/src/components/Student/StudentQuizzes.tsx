import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Card,
    message,
    Space,
    Typography,
    Tag,
    Progress,
    Tabs,
    Row,
    Col,
    Statistic,
    List,
    Avatar,
    Tooltip,
    Empty
} from 'antd';
import {
    PlayCircleOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TrophyOutlined,
    BookOutlined,
    BarChartOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import QuizTaking from '../Quiz/QuizTaking';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Quiz {
    id: number;
    title: string;
    description: string;
    total_questions: number;
    duration_minutes: number;
    max_attempts: number;
    passing_score: number;
    is_active: boolean;
    start_date: string;
    end_date: string;
    batch_name: string;
    created_at: string;
}

interface QuizAttempt {
    id: number;
    quiz_id: number;
    quiz_title: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_taken: number;
    completed_at: string;
    passed: boolean;
    attempt_number: number;
}

interface QuizStats {
    total_quizzes: number;
    completed_quizzes: number;
    average_score: number;
    best_score: number;
    total_attempts: number;
    passed_quizzes: number;
}

const StudentQuizzes: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [quizTakingVisible, setQuizTakingVisible] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchQuizzes();
        fetchAttempts();
        fetchStats();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/quizzes/available');
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data.quizzes || []);
            } else {
                message.error('Failed to fetch quizzes');
            }
        } catch (error) {
            message.error('Error fetching quizzes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async () => {
        try {
            const response = await apiCall('/quiz-attempts/my-attempts');
            if (response.ok) {
                const data = await response.json();
                setAttempts(data.attempts || []);
            }
        } catch (error) {
            console.error('Error fetching attempts:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiCall('/quiz-attempts/my-stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleStartQuiz = async (quizId: number) => {
        setSelectedQuizId(quizId);
        setQuizTakingVisible(true);
    };

    const handleQuizComplete = () => {
        setQuizTakingVisible(false);
        setSelectedQuizId(null);
        // Refresh data after quiz completion
        fetchAttempts();
        fetchStats();
        message.success('Quiz completed successfully!');
    };

    const handleViewDetails = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setDetailsVisible(true);
    };

    const getQuizStatus = (quiz: Quiz) => {
        const now = dayjs();
        const startDate = dayjs(quiz.start_date);
        const endDate = dayjs(quiz.end_date);
        
        if (!quiz.is_active) return { status: 'inactive', color: 'default', text: 'Inactive' };
        if (now.isBefore(startDate)) return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
        if (now.isAfter(endDate)) return { status: 'expired', color: 'red', text: 'Expired' };
        return { status: 'active', color: 'green', text: 'Active' };
    };

    const getAttemptCount = (quizId: number) => {
        return attempts.filter(attempt => attempt.quiz_id === quizId).length;
    };

    const getBestScore = (quizId: number) => {
        const quizAttempts = attempts.filter(attempt => attempt.quiz_id === quizId);
        if (quizAttempts.length === 0) return null;
        return Math.max(...quizAttempts.map(attempt => attempt.score));
    };

    const canTakeQuiz = (quiz: Quiz) => {
        const status = getQuizStatus(quiz);
        const attemptCount = getAttemptCount(quiz.id);
        return status.status === 'active' && attemptCount < quiz.max_attempts;
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const quizColumns: ColumnsType<Quiz> = [
        {
            title: 'Quiz',
            key: 'quiz',
            width: 250,
            fixed: 'left',
            render: (_, record) => (
                <div>
                    <Text strong>{record.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.description}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        Batch: {record.batch_name}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Details',
            key: 'details',
            width: 200,
            render: (_, record) => (
                <div>
                    <div><BookOutlined /> {record.total_questions} questions</div>
                    <div><ClockCircleOutlined /> {formatDuration(record.duration_minutes)}</div>
                    <div><TrophyOutlined /> {record.passing_score}% to pass</div>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            width: 100,
            render: (_, record) => {
                const status = getQuizStatus(record);
                return <Tag color={status.color}>{status.text}</Tag>;
            },
        },
        {
            title: 'Progress',
            key: 'progress',
            width: 150,
            render: (_, record) => {
                const attemptCount = getAttemptCount(record.id);
                const bestScore = getBestScore(record.id);
                return (
                    <div>
                        <div>Attempts: {attemptCount}/{record.max_attempts}</div>
                        {bestScore !== null && (
                            <div>Best Score: {bestScore}%</div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 180,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        Details
                    </Button>
                    {canTakeQuiz(record) && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartQuiz(record.id)}
                        >
                            Take Quiz
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    const attemptColumns: ColumnsType<QuizAttempt> = [
        {
            title: 'Quiz',
            dataIndex: 'quiz_title',
            key: 'quiz_title',
            width: 200,
            fixed: 'left',
            ellipsis: true,
        },
        {
            title: 'Score',
            key: 'score',
            width: 180,
            render: (_, record) => (
                <div>
                    <Progress
                        percent={record.score}
                        size="small"
                        status={record.passed ? 'success' : 'exception'}
                    />
                    <Text>{record.correct_answers}/{record.total_questions} correct</Text>
                </div>
            ),
        },
        {
            title: 'Result',
            key: 'result',
            width: 100,
            render: (_, record) => (
                <Tag color={record.passed ? 'green' : 'red'}>
                    {record.passed ? 'PASSED' : 'FAILED'}
                </Tag>
            ),
        },
        {
            title: 'Time Taken',
            dataIndex: 'time_taken',
            key: 'time_taken',
            width: 120,
            render: (minutes: number) => formatDuration(minutes),
        },
        {
            title: 'Attempt',
            dataIndex: 'attempt_number',
            key: 'attempt_number',
            width: 100,
            render: (num: number) => `#${num}`,
        },
        {
            title: 'Completed',
            dataIndex: 'completed_at',
            key: 'completed_at',
            width: 150,
            render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
        },
    ];

    const activeQuizzes = quizzes.filter(quiz => getQuizStatus(quiz).status === 'active');
    const upcomingQuizzes = quizzes.filter(quiz => getQuizStatus(quiz).status === 'upcoming');
    const completedQuizzes = quizzes.filter(quiz => getAttemptCount(quiz.id) > 0);

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>
                    <BookOutlined /> My Quizzes
                </Title>
            </div>

            {stats && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Quizzes"
                                value={stats.total_quizzes}
                                prefix={<BookOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Completed"
                                value={stats.completed_quizzes}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Average Score"
                                value={stats.average_score}
                                suffix="%"
                                prefix={<BarChartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Best Score"
                                value={stats.best_score}
                                suffix="%"
                                prefix={<TrophyOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Card>
                <Tabs defaultActiveKey="available">
                    <TabPane tab={`Available (${activeQuizzes.length})`} key="available">
                        {activeQuizzes.length > 0 ? (
                            <Table
                                columns={quizColumns}
                                dataSource={activeQuizzes}
                                rowKey="id"
                                loading={loading}
                                scroll={{ x: 880, y: 400 }}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} available quizzes`
                                }}
                            />
                        ) : (
                            <Empty description="No active quizzes available" />
                        )}
                    </TabPane>
                    
                    <TabPane tab={`Upcoming (${upcomingQuizzes.length})`} key="upcoming">
                        {upcomingQuizzes.length > 0 ? (
                            <Table
                                columns={quizColumns}
                                dataSource={upcomingQuizzes}
                                rowKey="id"
                                loading={loading}
                                scroll={{ x: 880, y: 400 }}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} upcoming quizzes`
                                }}
                            />
                        ) : (
                            <Empty description="No upcoming quizzes" />
                        )}
                    </TabPane>
                    
                    <TabPane tab={`Completed (${completedQuizzes.length})`} key="completed">
                        {completedQuizzes.length > 0 ? (
                            <Table
                                columns={quizColumns}
                                dataSource={completedQuizzes}
                                rowKey="id"
                                loading={loading}
                                scroll={{ x: 880, y: 400 }}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} completed quizzes`
                                }}
                            />
                        ) : (
                            <Empty description="No completed quizzes" />
                        )}
                    </TabPane>
                    
                    <TabPane tab={`My Attempts (${attempts.length})`} key="attempts">
                        {attempts.length > 0 ? (
                            <Table
                                columns={attemptColumns}
                                dataSource={attempts}
                                rowKey="id"
                                loading={loading}
                                scroll={{ x: 850, y: 400 }}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} attempts`
                                }}
                            />
                        ) : (
                            <Empty description="No quiz attempts yet" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Quiz Details"
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsVisible(false)}>
                        Close
                    </Button>,
                    selectedQuiz && canTakeQuiz(selectedQuiz) && (
                        <Button
                            key="start"
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => {
                                handleStartQuiz(selectedQuiz.id);
                                setDetailsVisible(false);
                            }}
                        >
                            Take Quiz
                        </Button>
                    ),
                ]}
                width={600}
            >
                {selectedQuiz && (
                    <div>
                        <Title level={4}>{selectedQuiz.title}</Title>
                        <Paragraph>{selectedQuiz.description}</Paragraph>
                        
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Questions"
                                        value={selectedQuiz.total_questions}
                                        prefix={<BookOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Duration"
                                        value={formatDuration(selectedQuiz.duration_minutes)}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Passing Score"
                                        value={selectedQuiz.passing_score}
                                        suffix="%"
                                        prefix={<TrophyOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Max Attempts"
                                        value={selectedQuiz.max_attempts}
                                        prefix={<PlayCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Available Period:</Text>
                            <br />
                            <CalendarOutlined /> {dayjs(selectedQuiz.start_date).format('MMM DD, YYYY')} - {dayjs(selectedQuiz.end_date).format('MMM DD, YYYY')}
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Your Progress:</Text>
                            <br />
                            Attempts: {getAttemptCount(selectedQuiz.id)}/{selectedQuiz.max_attempts}
                            {getBestScore(selectedQuiz.id) !== null && (
                                <span> | Best Score: {getBestScore(selectedQuiz.id)}%</span>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* QuizTaking Modal */}
            <Modal
                title="Take Quiz"
                open={quizTakingVisible}
                onCancel={() => {
                    setQuizTakingVisible(false);
                    setSelectedQuizId(null);
                }}
                footer={null}
                width={1000}
                style={{ top: 20 }}
                destroyOnClose
            >
                {selectedQuizId && (
                    <QuizTaking 
                        quizId={selectedQuizId.toString()}
                        onComplete={handleQuizComplete}
                    />
                )}
            </Modal>
        </div>
    );
};

export default StudentQuizzes;