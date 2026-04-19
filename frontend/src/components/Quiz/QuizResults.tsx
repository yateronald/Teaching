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
    Modal,
    message,
    Select,
    DatePicker,
    Empty
} from 'antd';
import {
    EyeOutlined,
    ClockCircleOutlined,
    DownOutlined,
    RightOutlined
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
    audio_clip_id?: number | null;
}

interface AudioClipInfo {
    id: number;
    duration_seconds?: number;
    audio_order: number;
    max_plays: number;
    has_audio: boolean;
    kdrive_file_id?: string;
    transcript?: string;
    voice_name?: string;
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
    audio_clips?: AudioClipInfo[];
}

interface QuizResultsProps {
    quizId?: string;
}

const QuizResults: React.FC<QuizResultsProps> = ({ quizId: propQuizId }) => {
    const { quizId: paramQuizId } = useParams<{ quizId: string }>();
    const { apiCall, token } = useAuth();
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    const quizId = propQuizId || paramQuizId;

    // Helper function to format numbers
    const formatNumber = (num: number | string | null | undefined): string => {
        if (num === null || num === undefined) return '0';
        
        // Convert to number if it's a string
        const numValue = typeof num === 'string' ? parseFloat(num) : num;
        
        // Handle NaN or invalid numbers
        if (isNaN(numValue)) {
            return '0';
        }
        
        // If it's a whole number, return as is
        if (Number.isInteger(numValue)) {
            return numValue.toString();
        }
        
        // For decimals, format to 2 decimal places and remove trailing zeros
        return parseFloat(numValue.toFixed(2)).toString();
    };
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);

    const [results, setResults] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState<StudentRow | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [dateRange, setDateRange] = useState<any>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

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

    const toggleQuestionExpansion = (questionId: number) => {
        setExpandedQuestions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
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
                        marks_awarded: q.marks_awarded ?? q.score ?? null,
                        is_correct: q.is_correct ?? null,
                        options: q.options || [],
                        audio_clip_id: q.audio_clip_id ?? null,
                    } as QuestionDetail;
                });
                console.log('Teacher submission fetched questions:', normalizedQuestions);


                // Build submission object — handle both flat and nested formats
                const sub = data.submission ?? data;
                setSubmissionDetails({
                    submission: {
                        id: sub.id,
                        student_id: sub.student_id,
                        student_name: sub.student_name ?? `${sub.first_name || ''} ${sub.last_name || ''}`.trim(),
                        email: sub.email ?? '',
                        total_score: sub.total_score ?? null,
                        max_score: sub.max_score ?? null,
                        percentage: sub.percentage ?? null,
                        status: sub.status,
                        time_taken_minutes: sub.time_taken_minutes ?? null,
                        submitted_at: sub.submitted_at ?? null,
                        started_at: sub.started_at ?? null,
                    },
                    questions: normalizedQuestions,
                    audio_clips: data.audio_clips || [],
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
                                {formatNumber(record.percentage || 0)}% ({getGrade(record.percentage)})
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
                            borderBottom: '1px solid #e8e8e8',
                            backgroundColor: '#fff'
                        }}>
                            <Title level={3} style={{ margin: 0, marginBottom: '20px', color: '#1890ff' }}>
                                Quiz Results - {selectedResult?.name || ''}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '20px' }}>
                                {submissionDetails.submission.email}
                            </Text>
                            
                            <Row gutter={24} style={{ marginBottom: '20px' }}>
                                <Col span={8}>
                                    <Card size="small" style={{ textAlign: 'center', border: '1px solid #e8f4fd' }}>
                                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
                                            {formatNumber(submissionDetails.submission.total_score)}/{formatNumber(submissionDetails.submission.max_score)}
                                        </Title>
                                        <Text style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                                            ({formatNumber(submissionDetails.submission.percentage ?? 0)}%)
                                        </Text>
                                        <div style={{ marginTop: '4px' }}>
                                            <Text type="secondary">Score</Text>
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card size="small" style={{ textAlign: 'center', border: '1px solid #f6ffed' }}>
                                        <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                                            {getGrade(submissionDetails.submission.percentage ?? null)}
                                        </Title>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">Grade</Text>
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card size="small" style={{ textAlign: 'center', border: '1px solid #fff7e6' }}>
                                        <Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                                            {formatMinutes(submissionDetails.submission.time_taken_minutes ?? null)}
                                        </Title>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">Time Taken</Text>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Answer Details Title - Fixed in Header */}
                            <div style={{ 
                                padding: '16px 0',
                                borderBottom: '2px solid #1890ff',
                                marginBottom: '0'
                            }}>
                                <Title level={4} style={{ 
                                    margin: 0, 
                                    textAlign: 'center',
                                    color: '#1890ff',
                                    fontSize: '18px'
                                }}>
                                    Answer Details
                                </Title>
                            </div>
                        </div>

                        {/* Scrollable Content Section */}
                        <div style={{ 
                            flex: 1,
                            overflow: 'auto',
                            padding: '20px 24px 32px 24px',
                            backgroundColor: '#f8f9fa'
                        }}>

                            {/* Answer Details — Grouped by Audio */}
                            {(() => {
                                const questions = submissionDetails.questions;
                                const audioClips = submissionDetails.audio_clips || [];

                                // Build groups: audio sections + independent questions
                                type QGroup = { type: 'audio'; clipId: number; clip: AudioClipInfo; questions: QuestionDetail[] }
                                    | { type: 'independent'; question: QuestionDetail };
                                const groups: QGroup[] = [];
                                const audioMap = new Map<number, QuestionDetail[]>();
                                const independent: QuestionDetail[] = [];

                                questions.forEach(q => {
                                    if (q.audio_clip_id) {
                                        if (!audioMap.has(q.audio_clip_id)) audioMap.set(q.audio_clip_id, []);
                                        audioMap.get(q.audio_clip_id)!.push(q);
                                    } else {
                                        independent.push(q);
                                    }
                                });

                                // Maintain order: iterate through questions, outputting groups as encountered
                                const processedClips = new Set<number>();
                                let globalIdx = 0;
                                questions.forEach(q => {
                                    if (q.audio_clip_id && !processedClips.has(q.audio_clip_id)) {
                                        processedClips.add(q.audio_clip_id);
                                        const clip = audioClips.find(c => c.id === q.audio_clip_id);
                                        groups.push({
                                            type: 'audio',
                                            clipId: q.audio_clip_id,
                                            clip: clip || { id: q.audio_clip_id, audio_order: 0, max_plays: 0, has_audio: false },
                                            questions: audioMap.get(q.audio_clip_id) || []
                                        });
                                    } else if (!q.audio_clip_id) {
                                        groups.push({ type: 'independent', question: q });
                                    }
                                });

                                // Helper to render a single question card
                                const renderQuestionCard = (q: QuestionDetail, qIndex: number) => {
                                    const isCorrect = typeof q.is_correct === 'boolean' ? q.is_correct : q.is_correct === 1;
                                    const pointsEarned = q.marks_awarded ?? 0;
                                    const maxPoints = q.marks ?? 0;
                                    const isMCQ = q.question_type === 'mcq' || q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple';
                                    const selectedOptionObjs = isMCQ
                                        ? (q.selected_options || []).map((id) => (q.options || []).find(o => o.id === id)).filter(Boolean)
                                        : [];
                                    const correctOptionObjs = isMCQ
                                        ? (q.options || []).filter(o => o.is_correct === true || o.is_correct === 1)
                                        : [];
                                    const pct = maxPoints > 0 ? pointsEarned / maxPoints : 0;
                                    const isFullyCorrect = pct >= 1;
                                    const isZero = pct <= 0;
                                    const isPartial = !isZero && !isFullyCorrect;
                                    const statusTag = isFullyCorrect
                                        ? { color: 'success' as const, text: 'Correct' }
                                        : isPartial
                                            ? { color: 'orange' as const, text: 'Partially Correct' }
                                            : { color: 'error' as const, text: 'Incorrect' };
                                    const isExpanded = expandedQuestions.has(q.id);

                                    return (
                                        <div
                                            key={q.id}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                marginBottom: '12px',
                                                borderRadius: '10px',
                                                border: '1px solid #e8e8e8',
                                                boxShadow: isExpanded
                                                    ? '0 6px 20px rgba(0,0,0,0.1)'
                                                    : '0 1px 4px rgba(0,0,0,0.04)',
                                                transition: 'all 0.3s ease',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Question Header */}
                                            <div
                                                style={{
                                                    padding: '14px 20px',
                                                    cursor: 'pointer',
                                                    backgroundColor: isExpanded ? '#f8faff' : '#fff',
                                                    borderBottom: isExpanded ? '1px solid #e8f4fd' : 'none',
                                                    transition: 'background 0.2s'
                                                }}
                                                onClick={() => toggleQuestionExpansion(q.id)}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 0', minWidth: 0 }}>
                                                        <div style={{
                                                            width: '22px', height: '22px', borderRadius: '6px',
                                                            backgroundColor: isExpanded ? '#1890ff' : '#f0f0f0',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.2s', flexShrink: 0, marginTop: '2px'
                                                        }}>
                                                            {isExpanded
                                                                ? <DownOutlined style={{ fontSize: '11px', color: '#fff' }} />
                                                                : <RightOutlined style={{ fontSize: '11px', color: '#8c8c8c' }} />}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <Text strong style={{ fontSize: '14px', color: '#1a1a1a', display: 'block' }}>
                                                                Question {qIndex + 1}
                                                            </Text>
                                                            <Text style={{
                                                                fontSize: '12px', color: '#8c8c8c', lineHeight: '1.4',
                                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                                                                overflow: 'hidden', marginTop: '2px'
                                                            }}>
                                                                {q.question_text}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px', paddingTop: '2px' }}>
                                                        <Tag color={statusTag.color} style={{
                                                            fontSize: '11px', fontWeight: '600', padding: '3px 10px',
                                                            borderRadius: '16px', margin: 0, border: 'none',
                                                            textTransform: 'uppercase' as const, letterSpacing: '0.4px', whiteSpace: 'nowrap'
                                                        }}>
                                                            {statusTag.text}
                                                        </Tag>
                                                        <Tag style={{
                                                            fontSize: '11px', fontWeight: '600', padding: '3px 10px',
                                                            borderRadius: '16px', margin: 0, whiteSpace: 'nowrap',
                                                            backgroundColor: isFullyCorrect ? '#f6ffed' : isPartial ? '#fff7e6' : '#e6f7ff',
                                                            color: isFullyCorrect ? '#52c41a' : isPartial ? '#fa8c16' : '#1890ff',
                                                            border: `1px solid ${isFullyCorrect ? '#b7eb8f' : isPartial ? '#ffd591' : '#91d5ff'}`
                                                        }}>
                                                            {formatNumber(pointsEarned)}/{formatNumber(maxPoints)} pts
                                                        </Tag>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {isExpanded && (
                                                <div style={{ padding: '20px', backgroundColor: '#fff' }}>
                                                    {/* Question text */}
                                                    <div style={{
                                                        marginBottom: '20px', padding: '16px 20px',
                                                        backgroundColor: '#f8faff', borderRadius: '10px',
                                                        border: '1px solid #e8f4fd', position: 'relative' as const
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute' as const, top: 0, left: 0,
                                                            width: '4px', height: '100%',
                                                            backgroundColor: '#1890ff', borderRadius: '2px 0 0 2px'
                                                        }} />
                                                        <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#1a1a1a' }}>
                                                            {q.question_text}
                                                        </Text>
                                                    </div>

                                                    {/* Student Answer */}
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#8c8c8c' }} />
                                                            <Text strong style={{ fontSize: '12px', color: '#595959', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                                                Student Answer
                                                            </Text>
                                                        </div>
                                                        {isMCQ ? (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                {selectedOptionObjs.map(opt => {
                                                                    const isOptCorrect = opt!.is_correct === true || opt!.is_correct === 1;
                                                                    return (
                                                                        <div key={opt!.id} style={{
                                                                            padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '500',
                                                                            backgroundColor: isOptCorrect ? '#f6ffed' : '#fff2f0',
                                                                            color: isOptCorrect ? '#52c41a' : '#ff4d4f',
                                                                            border: `1px solid ${isOptCorrect ? '#b7eb8f' : '#ffccc7'}`,
                                                                            display: 'flex', alignItems: 'center', gap: '5px'
                                                                        }}>
                                                                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: isOptCorrect ? '#52c41a' : '#ff4d4f' }} />
                                                                            {opt!.option_text}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {selectedOptionObjs.length === 0 && (
                                                                    <div style={{
                                                                        padding: '10px 16px', backgroundColor: '#f5f5f5',
                                                                        borderRadius: '16px', border: '1px solid #d9d9d9',
                                                                        fontStyle: 'italic', color: '#8c8c8c', fontSize: '12px'
                                                                    }}>No answer selected</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div style={{
                                                                padding: '12px 16px', borderRadius: '10px',
                                                                backgroundColor: isCorrect ? '#f6ffed' : '#fff2f0',
                                                                border: `1px solid ${isCorrect ? '#b7eb8f' : '#ffccc7'}`,
                                                                position: 'relative' as const
                                                            }}>
                                                                <div style={{
                                                                    position: 'absolute' as const, top: 0, left: 0,
                                                                    width: '3px', height: '100%',
                                                                    backgroundColor: isCorrect ? '#52c41a' : '#ff4d4f',
                                                                    borderRadius: '2px 0 0 2px'
                                                                }} />
                                                                <Text style={{ fontSize: '12px', color: isCorrect ? '#52c41a' : '#ff4d4f', fontWeight: '500' }}>
                                                                    {q.answer_text || 'No answer provided'}
                                                                </Text>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Correct Answer */}
                                                    {!isFullyCorrect && (
                                                        <div style={{ marginTop: '16px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                                                <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#52c41a' }} />
                                                                <Text strong style={{ fontSize: '12px', color: '#52c41a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                                                    Correct Answer
                                                                </Text>
                                                            </div>
                                                            {isMCQ ? (
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                    {correctOptionObjs.map(opt => (
                                                                        <div key={opt.id} style={{
                                                                            padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '500',
                                                                            backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f',
                                                                            display: 'flex', alignItems: 'center', gap: '5px'
                                                                        }}>
                                                                            <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#52c41a' }} />
                                                                            {opt.option_text}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div style={{
                                                                    padding: '12px 16px', borderRadius: '10px',
                                                                    backgroundColor: '#f6ffed', border: '1px solid #b7eb8f',
                                                                    position: 'relative' as const
                                                                }}>
                                                                    <div style={{
                                                                        position: 'absolute' as const, top: 0, left: 0,
                                                                        width: '3px', height: '100%',
                                                                        backgroundColor: '#52c41a', borderRadius: '2px 0 0 2px'
                                                                    }} />
                                                                    <Text style={{ color: '#52c41a', fontSize: '12px', fontWeight: '500' }}>
                                                                        {q.correct_answer}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                };

                                // Track global question index
                                globalIdx = 0;

                                return (
                                    <div>
                                        {groups.map((group, gIdx) => {
                                            if (group.type === 'independent') {
                                                globalIdx++;
                                                return renderQuestionCard(group.question, globalIdx);
                                            }

                                            // Audio group
                                            const audioQs = group.questions;
                                            const correctCount = audioQs.filter(q => {
                                                const pe = q.marks_awarded ?? 0;
                                                const mp = q.marks ?? 0;
                                                return mp > 0 && pe >= mp;
                                            }).length;
                                            const totalPtsEarned = audioQs.reduce((s, q) => s + (q.marks_awarded ?? 0), 0);
                                            const totalPtsMax = audioQs.reduce((s, q) => s + (q.marks ?? 0), 0);
                                            const sectionPct = totalPtsMax > 0 ? Math.round((totalPtsEarned / totalPtsMax) * 100) : 0;
                                            const sectionColor = sectionPct >= 80 ? '#52c41a' : sectionPct >= 50 ? '#faad14' : '#ff4d4f';

                                            return (
                                                <div key={`audio-${group.clipId}`} style={{
                                                    marginBottom: '24px',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    border: '2px solid #06b6d4',
                                                    boxShadow: '0 4px 20px rgba(6,182,212,0.15)'
                                                }}>
                                                    {/* Audio Section Header */}
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)',
                                                        padding: '18px 24px',
                                                        color: '#fff'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{
                                                                    background: 'rgba(255,255,255,0.2)',
                                                                    width: 36, height: 36, borderRadius: '50%',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: 18
                                                                }}>🎧</div>
                                                                <div>
                                                                    <Text strong style={{ color: '#fff', fontSize: '15px', display: 'block' }}>
                                                                        Listening Comprehension — Audio {group.clip.audio_order || gIdx + 1}
                                                                    </Text>
                                                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                                                                        {audioQs.length} question{audioQs.length > 1 ? 's' : ''} linked to this audio
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Audio KPIs */}
                                                        <div style={{
                                                            display: 'flex', gap: '12px', flexWrap: 'wrap'
                                                        }}>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.15)',
                                                                borderRadius: '10px', padding: '8px 16px',
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                backdropFilter: 'blur(10px)'
                                                            }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Accuracy</Text>
                                                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                                                    {correctCount}/{audioQs.length}
                                                                </Text>
                                                            </div>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.15)',
                                                                borderRadius: '10px', padding: '8px 16px',
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                backdropFilter: 'blur(10px)'
                                                            }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Points</Text>
                                                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                                                    {formatNumber(totalPtsEarned)}/{formatNumber(totalPtsMax)}
                                                                </Text>
                                                            </div>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.15)',
                                                                borderRadius: '10px', padding: '8px 16px',
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                backdropFilter: 'blur(10px)'
                                                            }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Score</Text>
                                                                <Text strong style={{ color: '#fff', fontSize: '14px' }}>
                                                                    {sectionPct}%
                                                                </Text>
                                                                <div style={{
                                                                    width: 8, height: 8, borderRadius: '50%',
                                                                    backgroundColor: sectionColor
                                                                }} />
                                                            </div>
                                                        </div>

                                                        {/* Audio player for teacher */}
                                                        {group.clip.has_audio && (
                                                            <div style={{ marginTop: '12px' }}>
                                                                <audio
                                                                    controls
                                                                    controlsList="nodownload noplaybackrate"
                                                                    onContextMenu={(e) => e.preventDefault()}
                                                                    src={`${API_BASE}/quizzes/audio/${group.clipId}/stream?token=${token}`}
                                                                    style={{
                                                                        width: '100%', height: '36px',
                                                                        borderRadius: '8px', filter: 'invert(1) hue-rotate(180deg)',
                                                                        opacity: 0.9
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Audio Section Questions */}
                                                    <div style={{
                                                        padding: '16px 20px',
                                                        backgroundColor: '#f0fdfa'
                                                    }}>
                                                        {audioQs.map(q => {
                                                            globalIdx++;
                                                            return renderQuestionCard(q, globalIdx);
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

export default QuizResults;