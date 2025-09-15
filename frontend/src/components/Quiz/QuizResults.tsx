import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    Space,
    Tag,
    Button,
    Row,
    Col,
    Statistic,
    Progress,
    Modal,
    List,
    Divider,
    message,
    Select,
    DatePicker,
    Empty
} from 'antd';
import {
    EyeOutlined,
    DownloadOutlined,
    BarChartOutlined,
    UserOutlined,
    TrophyOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface QuizResult {
    id: number;
    student_id: number;
    student_name: string;
    student_email: string;
    score: number;
    total_points: number;
    percentage: number;
    time_taken: number;
    completed_at: string;
    answers: Answer[];
}

interface Answer {
    question_id: number;
    question_text: string;
    question_type: 'mcq' | 'text' | 'yes_no';
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    points_earned: number;
    max_points: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    time_limit: number;
    total_questions: number;
    total_points: number;
}

interface QuizStats {
    total_attempts: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    average_time: number;
    completion_rate: number;
    question_analytics: QuestionAnalytics[];
}

interface QuestionAnalytics {
    question_id: number;
    question_text: string;
    question_type: string;
    correct_answers: number;
    total_answers: number;
    accuracy_rate: number;
    average_time: number;
}

interface QuizResultsProps {
    quizId?: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quizId: propQuizId }) => {
    const { quizId: paramQuizId } = useParams<{ quizId: string }>();
    const { apiCall } = useAuth();
    
    const quizId = propQuizId || paramQuizId;
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [results, setResults] = useState<QuizResult[]>([]);
    const [stats, setStats] = useState<QuizStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [analyticsModalVisible, setAnalyticsModalVisible] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [dateRange, setDateRange] = useState<any>(null);

    useEffect(() => {
        if (quizId) {
            fetchQuizData();
            fetchResults();
            fetchStats();
        }
    }, [quizId]);

    const fetchQuizData = async () => {
        try {
            const response = await apiCall(`/api/quizzes/${quizId}`);
            if (response.success) {
                setQuiz(response.data);
            }
        } catch (error) {
            message.error('Failed to fetch quiz data');
        }
    };

    const fetchResults = async () => {
        try {
            const response = await apiCall(`/api/quizzes/${quizId}/results`);
            if (response.success) {
                setResults(response.data);
            }
        } catch (error) {
            message.error('Failed to fetch quiz results');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiCall(`/api/quizzes/${quizId}/analytics`);
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch quiz statistics');
        }
    };

    const handleViewDetails = (result: QuizResult) => {
        setSelectedResult(result);
        setDetailModalVisible(true);
    };

    const handleExportResults = async () => {
        try {
            const response = await apiCall(`/api/quizzes/${quizId}/export`, {
                method: 'GET',
                headers: {
                    'Accept': 'text/csv'
                }
            });
            
            if (response.success) {
                // Create and download CSV file
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `quiz-${quizId}-results.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                message.success('Results exported successfully');
            }
        } catch (error) {
            message.error('Failed to export results');
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const getGrade = (percentage: number) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const columns: ColumnsType<QuizResult> = [
        {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student_name',
            render: (name: string, record: QuizResult) => (
                <div>
                    <Text strong>{name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.student_email}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (score: number, record: QuizResult) => (
                <div>
                    <Text strong style={{ fontSize: '16px' }}>
                        {score}/{record.total_points}
                    </Text>
                    <br />
                    <Tag color={getScoreColor(record.percentage)}>
                        {record.percentage.toFixed(1)}% ({getGrade(record.percentage)})
                    </Tag>
                </div>
            ),
            sorter: (a, b) => a.percentage - b.percentage,
        },
        {
            title: 'Time Taken',
            dataIndex: 'time_taken',
            key: 'time_taken',
            render: (time: number) => (
                <Space>
                    <ClockCircleOutlined />
                    <Text>{formatTime(time)}</Text>
                </Space>
            ),
            sorter: (a, b) => a.time_taken - b.time_taken,
        },
        {
            title: 'Completed At',
            dataIndex: 'completed_at',
            key: 'completed_at',
            render: (date: string) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: QuizResult) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const questionAnalyticsColumns: ColumnsType<QuestionAnalytics> = [
        {
            title: 'Question',
            dataIndex: 'question_text',
            key: 'question_text',
            render: (text: string, record: QuestionAnalytics) => (
                <div>
                    <Text>{text.length > 100 ? `${text.substring(0, 100)}...` : text}</Text>
                    <br />
                    <Tag color="blue">{record.question_type.toUpperCase()}</Tag>
                </div>
            ),
        },
        {
            title: 'Accuracy',
            dataIndex: 'accuracy_rate',
            key: 'accuracy_rate',
            render: (rate: number, record: QuestionAnalytics) => (
                <div>
                    <Progress 
                        percent={rate} 
                        size="small" 
                        status={rate >= 70 ? 'success' : rate >= 50 ? 'normal' : 'exception'}
                    />
                    <Text type="secondary">
                        {record.correct_answers}/{record.total_answers} correct
                    </Text>
                </div>
            ),
            sorter: (a, b) => a.accuracy_rate - b.accuracy_rate,
        },
        {
            title: 'Avg. Time',
            dataIndex: 'average_time',
            key: 'average_time',
            render: (time: number) => formatTime(time),
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text>Loading quiz results...</Text>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Text>Quiz not found</Text>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{quiz.title} - Results</Title>
                <Text type="secondary">{quiz.description}</Text>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Total Attempts"
                                value={stats.total_attempts}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Average Score"
                                value={stats.average_score}
                                suffix="%"
                                precision={1}
                                prefix={<TrophyOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Highest Score"
                                value={stats.highest_score}
                                suffix="%"
                                precision={1}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card>
                            <Statistic
                                title="Average Time"
                                value={formatTime(stats.average_time)}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Actions and Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space>
                            <Select
                                value={filterStatus}
                                onChange={setFilterStatus}
                                style={{ width: 120 }}
                            >
                                <Option value="all">All Results</Option>
                                <Option value="passed">Passed (≥60%)</Option>
                                <Option value="failed">Failed (&lt;60%)</Option>
                            </Select>
                            <RangePicker
                                value={dateRange}
                                onChange={setDateRange}
                                placeholder={['Start Date', 'End Date']}
                            />
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<BarChartOutlined />}
                                onClick={() => setAnalyticsModalVisible(true)}
                            >
                                View Analytics
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={handleExportResults}
                            >
                                Export Results
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Results Table */}
            <Card title="Student Results">
                {results.length === 0 ? (
                    <Empty
                        description="No quiz attempts yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={results.filter(result => {
                            if (filterStatus === 'passed') return result.percentage >= 60;
                            if (filterStatus === 'failed') return result.percentage < 60;
                            return true;
                        })}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} of ${total} results`,
                        }}
                    />
                )}
            </Card>

            {/* Result Detail Modal */}
            <Modal
                title={`Quiz Results - ${selectedResult?.student_name}`}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedResult && (
                    <div>
                        {/* Summary */}
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <Statistic
                                    title="Score"
                                    value={`${selectedResult.score}/${selectedResult.total_points}`}
                                    suffix={`(${selectedResult.percentage.toFixed(1)}%)`}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Grade"
                                    value={getGrade(selectedResult.percentage)}
                                />
                            </Col>
                            <Col span={8}>
                                <Statistic
                                    title="Time Taken"
                                    value={formatTime(selectedResult.time_taken)}
                                />
                            </Col>
                        </Row>

                        <Divider>Answer Details</Divider>

                        {/* Answer Details */}
                        <List
                            itemLayout="vertical"
                            dataSource={selectedResult.answers}
                            renderItem={(answer, index) => (
                                <List.Item
                                    key={answer.question_id}
                                    style={{
                                        backgroundColor: answer.is_correct ? '#f6ffed' : '#fff2f0',
                                        padding: '16px',
                                        marginBottom: '8px',
                                        borderRadius: '6px',
                                        border: `1px solid ${answer.is_correct ? '#b7eb8f' : '#ffccc7'}`
                                    }}
                                >
                                    <List.Item.Meta
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Text strong>Question {index + 1}</Text>
                                                <Space>
                                                    <Tag color={answer.is_correct ? 'success' : 'error'}>
                                                        {answer.is_correct ? 'Correct' : 'Incorrect'}
                                                    </Tag>
                                                    <Tag color="blue">
                                                        {answer.points_earned}/{answer.max_points} pts
                                                    </Tag>
                                                </Space>
                                            </div>
                                        }
                                        description={
                                            <div>
                                                <Text>{answer.question_text}</Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Text strong>Student Answer: </Text>
                                                    <Text 
                                                        type={answer.is_correct ? 'success' : 'danger'}
                                                    >
                                                        {answer.student_answer || 'No answer provided'}
                                                    </Text>
                                                </div>
                                                {!answer.is_correct && (
                                                    <div style={{ marginTop: 4 }}>
                                                        <Text strong>Correct Answer: </Text>
                                                        <Text type="success">{answer.correct_answer}</Text>
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Modal>

            {/* Analytics Modal */}
            <Modal
                title="Quiz Analytics"
                open={analyticsModalVisible}
                onCancel={() => setAnalyticsModalVisible(false)}
                footer={null}
                width={1000}
            >
                {stats && (
                    <div>
                        <Title level={4}>Question Performance Analysis</Title>
                        <Table
                            columns={questionAnalyticsColumns}
                            dataSource={stats.question_analytics}
                            rowKey="question_id"
                            pagination={false}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default QuizResults;