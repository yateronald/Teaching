import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Typography,
    Row,
    Col,
    Statistic,
    Progress,
    Tag,
    Space,
    Select,
    DatePicker,
    message,
    Tabs,
    List,
    Avatar,
    Descriptions,
    Divider,
    Tooltip,
    Badge,
    Empty
} from 'antd';
import {
    TrophyOutlined,
    UserOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    DownloadOutlined,
    BarChartOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Number formatting function
const formatNumber = (num: number): string => {
    // If the number is a whole number, return it as is
    if (num % 1 === 0) {
        return num.toString();
    }
    // Otherwise, format to 2 decimal places and remove trailing zeros
    return parseFloat(num.toFixed(2)).toString();
};

interface QuizSubmission {
    id: number;
    student_id: number;
    student_name: string;
    student_email: string;
    score: number;
    max_score: number;
    percentage: number;
    time_taken: number;
    submitted_at: string;
    status: 'submitted' | 'auto_submitted' | 'in_progress';
    answers_count: number;
    total_questions: number;
}

interface QuizResult {
    id: number;
    title: string;
    description: string;
    total_questions: number;
    time_limit: number;
    max_score: number;
    batch_id: number;
    batch_name: string;
    created_at: string;
    submissions: QuizSubmission[];
    stats: {
        total_submissions: number;
        completed_submissions: number;
        average_score: number;
        highest_score: number;
        lowest_score: number;
        average_time: number;
        completion_rate: number;
    };
}

interface StudentAnswer {
    question_id: number;
    question_text: string;
    question_type: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    points_earned: number;
    max_points: number;
    teacher_feedback?: string;
}

interface DetailedSubmission {
    id: number;
    student_name: string;
    student_email: string;
    score: number;
    max_score: number;
    percentage: number;
    time_taken: number;
    submitted_at: string;
    answers: StudentAnswer[];
}

const QuizResults: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { apiCall } = useAuth();
    
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<DetailedSubmission | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
    const [filteredSubmissions, setFilteredSubmissions] = useState<QuizSubmission[]>([]);

    useEffect(() => {
        if (quizId) {
            fetchQuizResults();
        }
    }, [quizId]);

    useEffect(() => {
        if (quizResult) {
            applyFilters();
        }
    }, [quizResult, selectedBatch, dateRange]);

    const fetchQuizResults = async () => {
        setLoading(true);
        try {
            const response = await apiCall(`/api/quizzes/${quizId}/results`);
            if (response.success) {
                setQuizResult(response.data);
            } else {
                message.error('Failed to fetch quiz results');
            }
        } catch (error) {
            message.error('Error fetching quiz results');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissionDetails = async (submissionId: number) => {
        try {
            const response = await apiCall(`/api/quiz-submissions/${submissionId}/details`);
            if (response.success) {
                setSelectedSubmission(response.data);
                setDetailModalVisible(true);
            } else {
                message.error('Failed to fetch submission details');
            }
        } catch (error) {
            message.error('Error fetching submission details');
        }
    };

    const applyFilters = () => {
        if (!quizResult) return;
        
        let filtered = [...quizResult.submissions];
        
        if (selectedBatch) {
            // Filter by batch if needed (assuming we have batch info)
        }
        
        if (dateRange) {
            const [start, end] = dateRange;
            filtered = filtered.filter(submission => {
                const submittedDate = dayjs(submission.submitted_at);
                return submittedDate.isAfter(start) && submittedDate.isBefore(end);
            });
        }
        
        setFilteredSubmissions(filtered);
    };

    const exportResults = () => {
        // Implementation for exporting results to CSV/Excel
        message.info('Export functionality will be implemented');
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return '#52c41a';
        if (percentage >= 60) return '#faad14';
        return '#ff4d4f';
    };

    const getStatusTag = (status: string) => {
        const statusConfig = {
            'submitted': { color: 'green', text: 'Submitted' },
            'auto_submitted': { color: 'orange', text: 'Auto-Submitted' },
            'in_progress': { color: 'blue', text: 'In Progress' }
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const submissionColumns: ColumnsType<QuizSubmission> = [
        {
            title: 'Student',
            key: 'student',
            render: (_, record) => (
                <div>
                    <Text strong>{record.student_name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.student_email}</Text>
                </div>
            ),
            width: 200
        },
        {
            title: 'Score',
            key: 'score',
            render: (_, record) => (
                <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ color: getScoreColor(record.percentage), fontSize: 16 }}>
                        {formatNumber(record.score)}/{formatNumber(record.max_score)}
                    </Text>
                    <br />
                    <Text type="secondary">({record.percentage.toFixed(1)}%)</Text>
                </div>
            ),
            width: 100,
            sorter: (a, b) => a.percentage - b.percentage
        },
        {
            title: 'Progress',
            key: 'progress',
            render: (_, record) => (
                <div>
                    <Progress 
                        percent={record.percentage} 
                        size="small" 
                        strokeColor={getScoreColor(record.percentage)}
                        showInfo={false}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {record.answers_count}/{record.total_questions} answered
                    </Text>
                </div>
            ),
            width: 150
        },
        {
            title: 'Time Taken',
            dataIndex: 'time_taken',
            key: 'time_taken',
            render: (time: number) => {
                const minutes = Math.floor(time / 60);
                const seconds = time % 60;
                return `${minutes}m ${seconds}s`;
            },
            width: 100,
            sorter: (a, b) => a.time_taken - b.time_taken
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
            width: 120
        },
        {
            title: 'Submitted At',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
            width: 150,
            sorter: (a, b) => dayjs(a.submitted_at).unix() - dayjs(b.submitted_at).unix()
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => fetchSubmissionDetails(record.id)}
                >
                    View Details
                </Button>
            ),
            width: 120
        }
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Card>
                    <div>Loading quiz results...</div>
                </Card>
            </div>
        );
    }

    if (!quizResult) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Card>
                    <Empty description="Quiz results not found" />
                    <Button type="primary" onClick={() => navigate('/teacher-dashboard')}>
                        Back to Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Button 
                    onClick={() => navigate('/teacher-dashboard')} 
                    style={{ marginBottom: 16 }}
                >
                    ← Back to Dashboard
                </Button>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>{quizResult.title}</Title>
                        <Text type="secondary">{quizResult.batch_name} • {quizResult.total_questions} questions</Text>
                    </div>
                    <Space>
                        <Button icon={<DownloadOutlined />} onClick={exportResults}>
                            Export Results
                        </Button>
                    </Space>
                </div>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Submissions"
                            value={quizResult.stats.total_submissions}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Completion Rate"
                            value={quizResult.stats.completion_rate}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Score"
                            value={quizResult.stats.average_score}
                            suffix="%"
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Time"
                            value={Math.floor(quizResult.stats.average_time / 60)}
                            suffix="min"
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                    <Col>
                        <Text strong>Filters:</Text>
                    </Col>
                    <Col>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates)}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </Col>
                    <Col>
                        <Button 
                            onClick={() => {
                                setDateRange(null);
                                setSelectedBatch(null);
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Results Table */}
            <Card title="Student Submissions">
                <Table
                    columns={submissionColumns}
                    dataSource={filteredSubmissions.length > 0 ? filteredSubmissions : quizResult.submissions}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} submissions`
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Submission Detail Modal */}
            <Modal
                title="Submission Details"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedSubmission(null);
                }}
                footer={null}
                width={800}
            >
                {selectedSubmission && (
                    <div>
                        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
                            <Descriptions.Item label="Student">
                                {selectedSubmission.student_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                {selectedSubmission.student_email}
                            </Descriptions.Item>
                            <Descriptions.Item label="Score">
                                <Text strong style={{ color: getScoreColor(selectedSubmission.percentage) }}>
                                    {formatNumber(selectedSubmission.score)}/{formatNumber(selectedSubmission.max_score)} ({selectedSubmission.percentage.toFixed(1)}%)
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Time Taken">
                                {Math.floor(selectedSubmission.time_taken / 60)}m {selectedSubmission.time_taken % 60}s
                            </Descriptions.Item>
                            <Descriptions.Item label="Submitted At" span={2}>
                                {dayjs(selectedSubmission.submitted_at).format('MMMM DD, YYYY at HH:mm')}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">Question-wise Analysis</Divider>
                        
                        <List
                            dataSource={selectedSubmission.answers}
                            renderItem={(answer, index) => (
                                <List.Item key={answer.question_id}>
                                    <Card style={{ width: '100%' }} size="small">
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>Q{index + 1}: </Text>
                                            <Text>{answer.question_text}</Text>
                                        </div>
                                        
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Text type="secondary">Student Answer:</Text>
                                                <br />
                                                <Text>{answer.student_answer || 'No answer provided'}</Text>
                                            </Col>
                                            <Col span={12}>
                                                <Text type="secondary">Correct Answer:</Text>
                                                <br />
                                                <Text>{answer.correct_answer}</Text>
                                            </Col>
                                        </Row>
                                        
                                        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                {answer.is_correct ? (
                                                    <Badge status="success" text="Correct" />
                                                ) : (
                                                    <Badge status="error" text="Incorrect" />
                                                )}
                                            </div>
                                            <Text strong>
                                                {formatNumber(answer.points_earned)}/{formatNumber(answer.max_points)} points
                                            </Text>
                                        </div>
                                        
                                        {answer.teacher_feedback && (
                                            <div style={{ marginTop: 8, padding: 8, backgroundColor: '#f6f6f6', borderRadius: 4 }}>
                                                <Text type="secondary">Teacher Feedback:</Text>
                                                <br />
                                                <Text>{answer.teacher_feedback}</Text>
                                            </div>
                                        )}
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default QuizResults;