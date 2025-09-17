import React, { useState, useEffect, useRef } from 'react';
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
import QuizTaking, { type QuizTakingHandle } from '../Quiz/QuizTaking';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Updated to match backend quiz shape for students
interface Quiz {
    id: number;
    title: string;
    description: string;
    total_questions: number;
    duration_minutes: number;
    // Backend fields
    total_marks?: number;
    status?: string; // draft | published
    start_date?: string | null;
    end_date?: string | null;
    batch_names?: string; // comma-separated
    submission_status?: 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'completed';
    submission?: {
        total_score?: number;
        max_score?: number;
        percentage?: number;
        status?: string;
    } | null;
}

interface QuizAttempt {
    id: number;
    quiz_id: number;
    quiz_title: string;
    score: number; // percentage
    total_questions: number;
    correct_answers: number;
    time_taken: number; // minutes
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
    const [messageApi, contextHolder] = message.useMessage();

    const quizTakingRef = useRef<QuizTakingHandle | null>(null);

    useEffect(() => {
        fetchQuizzes();
        fetchAttempts();
    }, []);

    // Recompute stats whenever data changes
    useEffect(() => {
        const computeStats = () => {
            const total_quizzes = quizzes.length;
            const completed_quizzes = quizzes.filter(q => q.submission_status === 'completed').length;
            const scores = attempts.map(a => a.score).filter((s) => typeof s === 'number');
            const average_score = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0;
            const best_score = scores.length ? Math.max(...scores) : 0;
            const total_attempts = attempts.length;
            const passed_quizzes = attempts.filter(a => a.score >= 50).length; // Default pass mark 50%
            setStats({ total_quizzes, completed_quizzes, average_score, best_score, total_attempts, passed_quizzes });
        };
        computeStats();
    }, [quizzes, attempts]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            // Backend returns quizzes for the current role at GET /quizzes
            const response = await apiCall('/quizzes');
            if (response.ok) {
                const data = await response.json();
                setQuizzes(Array.isArray(data) ? data : (data.quizzes || []));
            } else {
                messageApi.error('Failed to fetch quizzes');
            }
        } catch (error) {
            messageApi.error('Error fetching quizzes');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttempts = async () => {
        try {
            // Map backend results to attempts list
            const response = await apiCall('/quizzes/student/results');
            if (response.ok) {
                const data = await response.json();
                const results = (data?.results || []) as any[];
                const mapped: QuizAttempt[] = results
                    // Only include expired/unlocked results (average should apply only to expired status)
                    .filter((r: any) => r && r.results_locked === false)
                    .map((r, idx) => ({
                        id: r.id ?? idx,
                        quiz_id: r.quiz_id,
                        quiz_title: r.quiz_title,
                        score: Number(r.percentage ?? 0),
                        total_questions: Number(r.total_questions ?? 0),
                        correct_answers: Number(r.correct_answers ?? 0),
                        time_taken: Number(r.time_taken ?? r.time_taken_minutes ?? 0),
                        completed_at: r.submitted_at,
                        passed: Number(r.percentage ?? 0) >= 50,
                        attempt_number: 1,
                    }));
                setAttempts(mapped);
            }
        } catch (error) {
            console.error('Error fetching attempts:', error);
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
        fetchQuizzes();
        messageApi.success('Quiz completed successfully!');
    };

    const handleViewDetails = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setDetailsVisible(true);
    };

    const getQuizStatus = (quiz: Quiz) => {
        const now = dayjs();
        const startDate = quiz.start_date ? dayjs(quiz.start_date) : null;
        const endDate = quiz.end_date ? dayjs(quiz.end_date) : null;

        if (quiz.status !== 'published') return { status: 'inactive', color: 'default', text: 'Inactive' } as const;
        if (startDate && now.isBefore(startDate)) return { status: 'upcoming', color: 'blue', text: 'Upcoming' } as const;
        if (endDate && now.isAfter(endDate)) return { status: 'expired', color: 'red', text: 'Expired' } as const;
        return { status: 'active', color: 'green', text: 'Active' } as const;
    };

    const canTakeQuiz = (quiz: Quiz) => {
        const status = getQuizStatus(quiz);
        const sub = quiz.submission_status;
        const notSubmitted = sub === 'not_started' || sub === 'in_progress' || !sub;
        return status.status === 'active' && notSubmitted;
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
                        Batch: {record.batch_names || '—'}
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
                    <div><TrophyOutlined /> Total Marks: {record.total_marks ?? '—'}</div>
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
            width: 180,
            render: (_, record) => {
                const sub = record.submission_status;
                const pct = record.submission?.percentage ?? (record.submission && record.submission.total_score && record.submission.max_score ? Math.round((record.submission.total_score / record.submission.max_score) * 100) : null);
                const isLocked = record.end_date ? dayjs(record.end_date).isAfter(dayjs()) : false;
                return (
                    <div>
                        {isLocked ? (
                            <>
                                <div><Tag color="gold">Locked</Tag></div>
                                <div style={{ fontSize: 12, color: '#8c8c8c' }}>Progress will be displayed after {dayjs(record.end_date as string).format('MMM DD, YYYY HH:mm')}</div>
                            </>
                        ) : (
                            <>
                                <div>Status: {sub ? sub.replace('_', ' ') : 'not started'}</div>
                                {pct !== null && (
                                    <div>Score: {Math.round(Number(pct))}%</div>
                                )}
                            </>
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
                            {record.submission_status === 'in_progress' ? 'Resume' : 'Take Quiz'}
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
    const completedQuizzes = quizzes.filter(quiz => quiz.submission_status === 'completed');

    return (
        <div>
            {contextHolder}
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
                                sticky
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
                                sticky
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
                                sticky
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
                                sticky
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
                            {selectedQuiz.submission_status === 'in_progress' ? 'Resume' : 'Take Quiz'}
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
                                        title="Total Marks"
                                        value={selectedQuiz.total_marks ?? '—'}
                                        prefix={<TrophyOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Status"
                                        value={getQuizStatus(selectedQuiz).text}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Available Period:</Text>
                            <br />
                            <CalendarOutlined /> {selectedQuiz.start_date ? dayjs(selectedQuiz.start_date).format('MMM DD, YYYY') : '—'} - {selectedQuiz.end_date ? dayjs(selectedQuiz.end_date).format('MMM DD, YYYY') : '—'}
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Your Progress:</Text>
                            <br />
                            {selectedQuiz.end_date && dayjs(selectedQuiz.end_date).isAfter(dayjs()) ? (
                                <>
                                    <Tag color="gold">Locked</Tag>
                                    <br />
                                    <Text type="secondary">Progress will be displayed after {dayjs(selectedQuiz.end_date).format('MMM DD, YYYY HH:mm')}</Text>
                                </>
                            ) : (
                                <>
                                    Status: {selectedQuiz.submission_status ? selectedQuiz.submission_status.replace('_', ' ') : 'not started'}
                                    {selectedQuiz.submission?.percentage != null && (
                                        <span> | Score: {Math.round(Number(selectedQuiz.submission.percentage))}%</span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* QuizTaking Modal */}
            <Modal
                title="Take Quiz"
                open={quizTakingVisible}
                onCancel={async () => {
                    // If the quiz has started, confirm auto-submit before closing
                    const started = quizTakingRef.current?.isStarted?.();
                    if (started) {
                        Modal.confirm({
                            title: 'Submit before closing? ',
                            content: 'You have a quiz in progress. Closing will submit your answers to prevent loss. Continue?',
                            okText: 'Submit & Close',
                            cancelText: 'Keep Taking',
                            onOk: async () => {
                                const ok = await quizTakingRef.current?.submitNow?.(true);
                                if (ok) {
                                    setQuizTakingVisible(false);
                                    setSelectedQuizId(null);
                                }
                            },
                        });
                        return;
                    }
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
                        ref={quizTakingRef}
                        quizId={selectedQuizId.toString()}
                        onComplete={handleQuizComplete}
                    />
                )}
            </Modal>
        </div>
    );
};

export default StudentQuizzes;