import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    Tag,
    Button,
    Modal,
    Row,
    Col,
    Statistic,
    Progress,
    Divider,
    Space,
    Alert,
    Spin,
    Empty,
    Tooltip,
    List
} from 'antd';
import {
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    EyeOutlined,
    CalendarOutlined,
    FileTextOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;

interface QuizResult {
    id: number;
    quiz_id: number;
    quiz_title: string;
    quiz_description: string;
    batch_name: string;
    score: number;
    max_score: number;
    percentage: number;
    time_taken: number;
    submitted_at: string;
    status: 'submitted' | 'auto_submitted';
    total_questions: number;
    correct_answers: number;
    teacher_feedback?: string;
}

interface DetailedResult {
    quiz: {
        id: number;
        title: string;
        description: string;
        total_marks: number;
        duration_minutes: number;
    };
    submission: {
        id: number;
        score: number;
        max_score: number;
        percentage: number;
        time_taken: number;
        submitted_at: string;
        teacher_feedback?: string;
    };
    questions: Array<{
        id: number;
        question_text: string;
        question_type: string;
        points: number;
        student_answer?: string;
        correct_answer?: string;
        is_correct?: boolean;
        score?: number;
        teacher_feedback?: string;
        options?: Array<{
            id: number;
            option_text: string;
            is_correct: boolean;
        }>;
    }>;
}

const StudentQuizResults: React.FC = () => {
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const { user, apiCall } = useAuth();

    useEffect(() => {
        fetchQuizResults();
    }, []);

    const fetchQuizResults = async () => {
        try {
            const response = await apiCall('/quizzes/student/results');

            if (response.ok) {
                const data = await response.json();
                setResults(data.results || []);
            } else {
                console.error('Failed to fetch quiz results');
            }
        } catch (error) {
            console.error('Error fetching quiz results:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetailedResult = async (quizId: number) => {
        setDetailLoading(true);
        try {
            const response = await apiCall(`/quizzes/${quizId}/student-results`);

            if (response.ok) {
                const data = await response.json();
                setSelectedResult(data);
                setDetailModalVisible(true);
            } else {
                console.error('Failed to fetch detailed result');
            }
        } catch (error) {
            console.error('Error fetching detailed result:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return '#52c41a';
        if (percentage >= 60) return '#faad14';
        return '#ff4d4f';
    };

    const getGradeText = (percentage: number) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        return 'F';
    };

    const calculateStats = () => {
        if (results.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                bestScore: 0,
                totalTimeSpent: 0
            };
        }

        const totalScore = results.reduce((sum, result) => sum + result.percentage, 0);
        const bestScore = Math.max(...results.map(result => result.percentage));
        const totalTimeSpent = results.reduce((sum, result) => sum + result.time_taken, 0);

        return {
            totalQuizzes: results.length,
            averageScore: Math.round(totalScore / results.length),
            bestScore: Math.round(bestScore),
            totalTimeSpent: Math.round(totalTimeSpent)
        };
    };

    const stats = calculateStats();

    const columns: ColumnsType<QuizResult> = [
        {
            title: 'Quiz',
            dataIndex: 'quiz_title',
            key: 'quiz_title',
            render: (title: string, record: QuizResult) => (
                <div>
                    <Text strong>{title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.batch_name}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Score',
            key: 'score',
            render: (_, record: QuizResult) => (
                <div>
                    <Text strong style={{ color: getScoreColor(record.percentage) }}>
                        {record.score}/{record.max_score}
                    </Text>
                    <br />
                    <Tag color={getScoreColor(record.percentage)}>
                        {record.percentage}% ({getGradeText(record.percentage)})
                    </Tag>
                </div>
            ),
        },
        {
            title: 'Performance',
            key: 'performance',
            render: (_, record: QuizResult) => (
                <div style={{ width: 120 }}>
                    <Progress
                        percent={record.percentage}
                        size="small"
                        strokeColor={getScoreColor(record.percentage)}
                        format={(percent) => `${percent}%`}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.correct_answers}/{record.total_questions} correct
                    </Text>
                </div>
            ),
        },
        {
            title: 'Time Taken',
            dataIndex: 'time_taken',
            key: 'time_taken',
            render: (time: number) => (
                <div>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    <Text>{Math.floor(time / 60)}m {time % 60}s</Text>
                </div>
            ),
        },
        {
            title: 'Submitted',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date: string) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    <Text>{dayjs(date).format('MMM DD, YYYY')}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(date).format('HH:mm')}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: QuizResult) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => fetchDetailedResult(record.quiz_id)}
                    loading={detailLoading}
                >
                    View Details
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <Title level={2}>My Quiz Results</Title>
            <Paragraph type="secondary">
                View your quiz performance, scores, and detailed feedback from your teachers.
            </Paragraph>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Quizzes"
                            value={stats.totalQuizzes}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Score"
                            value={stats.averageScore}
                            suffix="%"
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: getScoreColor(stats.averageScore) }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Best Score"
                            value={stats.bestScore}
                            suffix="%"
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: getScoreColor(stats.bestScore) }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Time Spent"
                            value={Math.floor(stats.totalTimeSpent / 60)}
                            suffix="minutes"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Results Table */}
            <Card title="Quiz Results History">
                {results.length === 0 ? (
                    <Empty
                        description="No quiz results found"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Text type="secondary">
                            Complete some quizzes to see your results here.
                        </Text>
                    </Empty>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={results}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                        }}
                    />
                )}
            </Card>

            {/* Detailed Result Modal */}
            <Modal
                title="Quiz Result Details"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedResult(null);
                }}
                footer={null}
                width={800}
            >
                {selectedResult && (
                    <div>
                        {/* Quiz Info */}
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Title level={4}>{selectedResult.quiz.title}</Title>
                                    <Paragraph>{selectedResult.quiz.description}</Paragraph>
                                </Col>
                                <Col span={12}>
                                    <Row gutter={[8, 8]}>
                                        <Col span={12}>
                                            <Statistic
                                                title="Your Score"
                                                value={selectedResult.submission.percentage}
                                                suffix="%"
                                                valueStyle={{ color: getScoreColor(selectedResult.submission.percentage) }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic
                                                title="Time Taken"
                                                value={Math.floor(selectedResult.submission.time_taken / 60)}
                                                suffix="min"
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Card>

                        {/* Teacher Feedback */}
                        {selectedResult.submission.teacher_feedback && (
                            <Alert
                                message="Teacher Feedback"
                                description={selectedResult.submission.teacher_feedback}
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />
                        )}

                        {/* Question-wise Results */}
                        <Card title="Question-wise Performance" size="small">
                            <List
                                dataSource={selectedResult.questions}
                                renderItem={(question, index) => (
                                    <List.Item>
                                        <div style={{ width: '100%' }}>
                                            <Row gutter={16}>
                                                <Col span={18}>
                                                    <Text strong>Q{index + 1}. {question.question_text}</Text>
                                                    <br />
                                                    {question.student_answer && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <Text type="secondary">Your Answer: </Text>
                                                            <Text>{question.student_answer}</Text>
                                                        </div>
                                                    )}
                                                    {question.correct_answer && question.student_answer !== question.correct_answer && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text type="secondary">Correct Answer: </Text>
                                                            <Text style={{ color: '#52c41a' }}>{question.correct_answer}</Text>
                                                        </div>
                                                    )}
                                                    {question.teacher_feedback && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <Text type="secondary">Feedback: </Text>
                                                            <Text italic>{question.teacher_feedback}</Text>
                                                        </div>
                                                    )}
                                                </Col>
                                                <Col span={6} style={{ textAlign: 'right' }}>
                                                    <div>
                                                        <Tag color={question.is_correct ? 'green' : 'red'}>
                                                            {question.is_correct ? (
                                                                <><CheckCircleOutlined /> Correct</>
                                                            ) : (
                                                                <>✗ Incorrect</>
                                                            )}
                                                        </Tag>
                                                    </div>
                                                    <div style={{ marginTop: 8 }}>
                                                        <Text strong>
                                                            {question.score || 0}/{question.points} pts
                                                        </Text>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentQuizResults;