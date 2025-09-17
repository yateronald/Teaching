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
    ClockCircleOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Quiz {
    id: number;
    title: string;
    description?: string;
    status?: string;
}

interface StudentRow {
    id: number; // student id
    name: string;
    email: string;
    submission_id: number | null;
    status: string;
    score: number | null;
    max_score: number | null;
    percentage: number | null;
    started_at: string | null;
    submitted_at: string | null;
    time_taken_minutes: number | null;
    batch_id: number;
    batch_name: string;
}

interface BatchResult {
    batch_id: number;
    batch_name: string;
    total_students: number;
    submitted_count: number;
    not_submitted_count: number;
    average_score: number; // percent
    students: StudentRow[];
}

interface QuestionOption {
    id: number;
    option_text: string;
    is_correct?: number | boolean;
}

interface QuestionDetail {
    id: number;
    question_text: string;
    question_type: 'mcq' | 'mcq_single' | 'mcq_multiple' | 'text' | 'yes_no';
    marks?: number | null;
    correct_answer?: string | null;
    answer_text?: string | null;
    selected_options?: number[] | null;
    marks_awarded?: number | null;
    is_correct?: number | boolean | null;
    options?: QuestionOption[];
}

interface SubmissionDetails {
    submission: {
        id: number;
        student_id: number;
        student_name: string;
        email: string;
        total_score?: number | null;
        max_score?: number | null;
        percentage?: number | null;
        status?: string;
        time_taken_minutes?: number | null;
        submitted_at?: string | null;
        started_at?: string | null;
    };
    questions: QuestionDetail[];
}

interface QuizResultsProps {
    quizId?: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quizId: propQuizId }) => {
    const { quizId: paramQuizId } = useParams<{ quizId: string }>();
    const { apiCall } = useAuth();
    
    const quizId = propQuizId || paramQuizId;

    // Helper function to format numbers
    const formatNumber = (num: number | null | undefined): string => {
        if (num === null || num === undefined) return '0';
        
        // If it's a whole number, return as is
        if (Number.isInteger(num)) {
            return num.toString();
        }
        
        // For decimals, format to 2 decimal places and remove trailing zeros
        return parseFloat(num.toFixed(2)).toString();
    };
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
    const [results, setResults] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<StudentRow | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [dateRange, setDateRange] = useState<any>(null);

    useEffect(() => {
        if (quizId) {
            fetchQuizData();
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    const fetchQuizData = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}`);
            if (response.ok) {
                const data = await response.json();
                // Backend returns quiz fields at the top-level with { questions, batches } alongside
                // or in some cases may return { quiz, questions, batches }
                setQuiz(data?.quiz ?? data);
            }
        } catch (error) {
            message.error('Failed to fetch quiz data');
        }
    };

    const fetchResults = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}/results`);
            if (response.ok) {
                const data = await response.json();
                // If API provides quiz in results payload, hydrate quiz state if not already
                if (data?.quiz && !quiz) {
                    setQuiz(prev => prev ?? data.quiz);
                }
                const batches: BatchResult[] = (data.batch_results || []).map((b: any) => ({
                    ...b,
                    students: (b.students || []).map((s: any) => ({
                        ...s,
                        // ensure nullable numbers are handled
                        score: s.score ?? null,
                        max_score: s.max_score ?? null,
                        percentage: s.percentage ?? null,
                        started_at: s.started_at ?? null,
                        submitted_at: s.submitted_at ?? null,
                        time_taken_minutes: s.time_taken_minutes ?? null,
                        batch_id: b.batch_id,
                        batch_name: b.batch_name,
                    }))
                }));
                setBatchResults(batches);
                const flatStudents: StudentRow[] = batches.flatMap(b => b.students);
                setResults(flatStudents);
            } else {
                const err = await response.json().catch(() => ({}));
                message.error(err.error || 'Failed to fetch quiz results');
            }
        } catch (error) {
            message.error('Failed to fetch quiz results');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissionDetails = async (submissionId: number) => {
        setDetailLoading(true);
        setSubmissionDetails(null);
        try {
            const response = await apiCall(`/quizzes/${quizId}/submissions/${submissionId}`);
            if (response.ok) {
                const data = await response.json();
                // Normalize selected_options from JSON string to number[] if needed
                const normalizedQuestions: QuestionDetail[] = (data.questions || []).map((q: any) => {
                    let selected = q.selected_options;
                    if (typeof selected === 'string') {
                        try { selected = JSON.parse(selected); } catch { selected = []; }
                    }
                    return {
                        id: q.id,
                        question_text: q.question_text,
                        question_type: q.question_type,
                        marks: q.marks ?? null,
                        correct_answer: q.correct_answer ?? null,
                        answer_text: q.answer_text ?? null,
                        selected_options: selected ?? null,
                        marks_awarded: q.marks_awarded ?? null,
                        is_correct: q.is_correct ?? null,
                        options: q.options || [],
                    } as QuestionDetail;
                });

                setSubmissionDetails({
                    submission: {
                        id: data.submission.id,
                        student_id: data.submission.student_id,
                        student_name: data.submission.student_name,
                        email: data.submission.email,
                        total_score: data.submission.total_score ?? null,
                        max_score: data.submission.max_score ?? null,
                        percentage: data.submission.percentage ?? null,
                        status: data.submission.status,
                        time_taken_minutes: data.submission.time_taken_minutes ?? null,
                        submitted_at: data.submission.submitted_at ?? null,
                        started_at: data.submission.started_at ?? null,
                    },
                    questions: normalizedQuestions,
                });
            } else {
                const err = await response.json().catch(() => ({}));
                message.error(err.error || 'Failed to load submission details');
            }
        } catch (error) {
            message.error('Failed to load submission details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewDetails = (row: StudentRow) => {
        if (!row.submission_id) {
            message.info('This student has not submitted the quiz yet.');
            return;
        }
        setSelectedResult(row);
        setDetailModalVisible(true);
        fetchSubmissionDetails(row.submission_id);
    };

    const getScoreColor = (percentage: number | null) => {
        if (percentage === null || percentage === undefined) return 'default';
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    const getGrade = (percentage: number | null) => {
        if (percentage === null || percentage === undefined) return '-';
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        return 'F';
    };

    const formatMinutes = (minutes: number | null) => {
        if (minutes === null || minutes === undefined) return '—';
        const m = Math.floor(minutes);
        return `${m}m`;
    };

    const columns: ColumnsType<StudentRow> = [
        {
            title: 'Student',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: StudentRow) => (
                <div>
                    <Text strong>{name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.email}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Batch',
            dataIndex: 'batch_name',
            key: 'batch_name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'graded' || status === 'submitted' || status === 'auto_submitted' ? 'blue' : 'default'}>
                    {status.replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
            render: (_: number | null, record: StudentRow) => (
                <div>
                    {record.percentage !== null ? (
                        <>
                            <Text strong style={{ fontSize: '16px' }}>
                                {formatNumber(record.score)}/{formatNumber(record.max_score)}
                            </Text>
                            <br />
                            <Tag color={getScoreColor(record.percentage)}>
                                {record.percentage?.toFixed(1)}% ({getGrade(record.percentage)})
                            </Tag>
                        </>
                    ) : (
                        <Text type="secondary">Not submitted</Text>
                    )}
                </div>
            ),
            sorter: (a, b) => (a.percentage || 0) - (b.percentage || 0),
        },
        {
            title: 'Time Taken',
            dataIndex: 'time_taken_minutes',
            key: 'time_taken_minutes',
            render: (time: number | null) => (
                <Space>
                    <ClockCircleOutlined />
                    <Text>{formatMinutes(time)}</Text>
                </Space>
            ),
            sorter: (a, b) => (a.time_taken_minutes || 0) - (b.time_taken_minutes || 0),
        },
        {
            title: 'Submitted At',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date: string | null) => (date ? new Date(date).toLocaleString() : '—'),
            sorter: (a, b) => new Date(a.submitted_at || 0).getTime() - new Date(b.submitted_at || 0).getTime(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: StudentRow) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                    disabled={!record.submission_id}
                >
                    View Details
                </Button>
            ),
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

    const filteredResults = results.filter(result => {
        if (filterStatus === 'passed') return (result.percentage || 0) >= 60;
        if (filterStatus === 'failed') return (result.percentage || 0) < 60;
        return true;
    }).filter(result => {
        if (!dateRange || dateRange.length !== 2) return true;
        const [start, end] = dateRange;
        if (!result.submitted_at) return false;
        const startMs = start?.toDate ? start.toDate().getTime() : new Date(start).getTime();
        const endMs = end?.toDate ? end.toDate().getTime() : new Date(end).getTime();
        const t = new Date(result.submitted_at).getTime();
        return t >= startMs && t <= endMs;
    });

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>{quiz.title} - Results</Title>
                {quiz.description && <Text type="secondary">{quiz.description}</Text>}
            </div>

            {/* Actions and Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space>
                            <Select
                                value={filterStatus}
                                onChange={setFilterStatus}
                                style={{ width: 160 }}
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
                </Row>
            </Card>

            {/* Results Table */}
            <Card title="Student Results">
                {filteredResults.length === 0 ? (
                    <Empty
                        description="No quiz attempts yet"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredResults}
                        rowKey={(row) => `${row.batch_id}-${row.id}`}
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
                title={null}
                open={detailModalVisible}
                onCancel={() => { setDetailModalVisible(false); setSubmissionDetails(null); }}
                footer={null}
                width={1000}
                centered
                style={{ top: 20 }}
                styles={{
                    body: { 
                        padding: 0,
                        height: '80vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                {detailLoading && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Text>Loading details...</Text>
                    </div>
                )}
                {!detailLoading && submissionDetails && (
                    <>
                        {/* Fixed Header Section */}
                        <div style={{ 
                            padding: '24px 24px 0 24px',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: '#fafafa',
                            borderRadius: '8px 8px 0 0'
                        }}>
                            {/* Title */}
                            <div style={{ marginBottom: '20px' }}>
                                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                    Quiz Results - {selectedResult?.name || ''}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    {submissionDetails.submission.email}
                                </Text>
                            </div>

                            {/* Summary Statistics */}
                            <Row gutter={16} style={{ marginBottom: 20 }}>
                                <Col span={8}>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '16px',
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e8f4fd',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                                            {formatNumber(submissionDetails.submission.total_score)}/{formatNumber(submissionDetails.submission.max_score)}
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#52c41a', fontWeight: '500' }}>
                                            ({(submissionDetails.submission.percentage ?? 0).toFixed(1)}%)
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                                            Score
                                        </div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '16px',
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e8f4fd',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                                            {getGrade(submissionDetails.submission.percentage ?? null)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
                                            Grade
                                        </div>
                                    </div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ 
                                        textAlign: 'center', 
                                        padding: '16px',
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e8f4fd',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                                            {formatMinutes(submissionDetails.submission.time_taken_minutes ?? null)}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '8px' }}>
                                            Time Taken
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Scrollable Content Section */}
                        <div style={{ 
                            flex: 1,
                            overflow: 'auto',
                            padding: '0 24px 24px 24px'
                        }}>
                            <div style={{ 
                                padding: '20px 0 16px 0',
                                borderBottom: '2px solid #1890ff',
                                marginBottom: '20px'
                            }}>
                                <Title level={5} style={{ 
                                    margin: 0, 
                                    color: '#1890ff',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}>
                                    Answer Details
                                </Title>
                            </div>

                            {/* Answer Details */}
                            <List
                                itemLayout="vertical"
                                dataSource={submissionDetails.questions}
                                style={{ 
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    padding: '16px'
                                }}
                                renderItem={(q, index) => {
                                const isCorrect = typeof q.is_correct === 'boolean'
                                    ? q.is_correct
                                    : q.is_correct === 1;
                                const pointsEarned = q.marks_awarded ?? 0;
                                const maxPoints = q.marks ?? 0;

                                const isMCQ = q.question_type === 'mcq' || q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple';
                                const selectedOptionObjs = isMCQ
                                    ? (q.selected_options || []).map((id) => (q.options || []).find(o => o.id === id)).filter(Boolean)
                                    : [];
                                const correctOptionObjs = isMCQ
                                    ? (q.options || []).filter(o => o.is_correct === true || o.is_correct === 1)
                                    : [];
                                const selectedTexts = isMCQ
                                    ? selectedOptionObjs.map(o => o!.option_text)
                                    : [];
                                const correctTexts = isMCQ
                                    ? correctOptionObjs.map(o => o.option_text)
                                    : [];

                                // Determine status based on points for better UX on partial credit
                                const percent = maxPoints > 0 ? pointsEarned / maxPoints : 0;
                                const isFullyCorrect = percent >= 1;
                                const isZero = percent <= 0;
                                const isPartial = !isZero && !isFullyCorrect;

                                const cardStyles = isFullyCorrect
                                    ? { bg: '#f6ffed', border: '#b7eb8f' } // green
                                    : isPartial
                                        ? { bg: '#fff7e6', border: '#ffd591' } // orange
                                        : { bg: '#fff2f0', border: '#ffccc7' }; // red

                                const statusTag = isFullyCorrect
                                    ? { color: 'success' as const, text: 'Correct' }
                                    : isPartial
                                        ? { color: 'orange' as const, text: 'Partially Correct' }
                                        : { color: 'error' as const, text: 'Incorrect' };

                                return (
                                    <List.Item
                                        key={q.id}
                                        style={{
                                            backgroundColor: cardStyles.bg,
                                            padding: '20px',
                                            marginBottom: '16px',
                                            borderRadius: '12px',
                                            border: `2px solid ${cardStyles.border}`,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.06)',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '12px'
                                                }}>
                                                    <Text strong style={{ 
                                                        fontSize: '16px', 
                                                        color: '#1890ff',
                                                        fontWeight: '600'
                                                    }}>
                                                        Question {index + 1}
                                                    </Text>
                                                    <Space size="middle">
                                                        <Tag 
                                                            color={statusTag.color}
                                                            style={{ 
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                padding: '4px 12px',
                                                                borderRadius: '16px'
                                                            }}
                                                        >
                                                            {statusTag.text}
                                                        </Tag>
                                                        <Tag 
                                                            color={isFullyCorrect ? 'green' : isPartial ? 'orange' : 'blue'}
                                                            style={{ 
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                padding: '4px 12px',
                                                                borderRadius: '16px'
                                                            }}
                                                        >
                                                            {formatNumber(pointsEarned)}/{formatNumber(maxPoints)} pts
                                                        </Tag>
                                                    </Space>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div style={{ 
                                                        marginBottom: '16px',
                                                        padding: '12px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px',
                                                        borderLeft: '4px solid #1890ff'
                                                    }}>
                                                        <Text style={{ fontSize: '14px', lineHeight: '1.6' }}>
                                                            {q.question_text}
                                                        </Text>
                                                    </div>
                                                    
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <Text strong style={{ color: '#595959', fontSize: '13px' }}>
                                                            Student Answer:
                                                        </Text>
                                                        <div style={{ marginTop: '8px' }}>
                                                            {isMCQ ? (
                                                                 <Space size={[8, 8]} wrap>
                                                                     {selectedOptionObjs.map((opt) => {
                                                                         const isOptionCorrect = opt!.is_correct === true || opt!.is_correct === 1;
                                                                         return (
                                                                             <Tag 
                                                                                 key={opt!.id} 
                                                                                 color={isOptionCorrect ? "green" : "red"}
                                                                                 style={{ 
                                                                                     borderRadius: '12px',
                                                                                     padding: '4px 12px',
                                                                                     fontSize: '12px'
                                                                                 }}
                                                                             >
                                                                                 {opt!.option_text}
                                                                             </Tag>
                                                                         );
                                                                     })}
                                                                     {selectedOptionObjs.length === 0 && (
                                                                         <Text type="secondary" style={{ fontStyle: 'italic' }}>
                                                                             No answer selected
                                                                         </Text>
                                                                     )}
                                                                 </Space>
                                                             ) : (
                                                                 <div style={{ 
                                                                     padding: '8px 12px',
                                                                     backgroundColor: isCorrect ? '#f6ffed' : '#fff2f0',
                                                                     borderRadius: '6px',
                                                                     border: `1px solid ${isCorrect ? '#b7eb8f' : '#ffccc7'}`
                                                                 }}>
                                                                     <Text style={{ 
                                                                         fontSize: '13px',
                                                                         color: isCorrect ? '#52c41a' : '#ff4d4f'
                                                                     }}>
                                                                         {q.answer_text || 'No answer provided'}
                                                                     </Text>
                                                                 </div>
                                                             )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Show correct answers when not fully correct */}
                                                    {!isFullyCorrect && (
                                                        <div>
                                                            <Text strong style={{ color: '#52c41a', fontSize: '13px' }}>
                                                                Correct Answer:
                                                            </Text>
                                                            <div style={{ marginTop: '8px' }}>
                                                                {isMCQ ? (
                                                                    <Space size={[8, 8]} wrap>
                                                                        {correctOptionObjs.map((opt) => (
                                                                            <Tag 
                                                                                key={opt.id} 
                                                                                color="green"
                                                                                style={{ 
                                                                                    borderRadius: '12px',
                                                                                    padding: '4px 12px',
                                                                                    fontSize: '12px'
                                                                                }}
                                                                            >
                                                                                {opt.option_text}
                                                                            </Tag>
                                                                        ))}
                                                                    </Space>
                                                                ) : (
                                                                    <div style={{ 
                                                                        padding: '8px 12px',
                                                                        backgroundColor: '#f6ffed',
                                                                        borderRadius: '6px',
                                                                        border: '1px solid #b7eb8f'
                                                                    }}>
                                                                        <Text style={{ color: '#52c41a', fontSize: '13px' }}>
                                                                            {q.correct_answer}
                                                                        </Text>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

export default QuizResults;