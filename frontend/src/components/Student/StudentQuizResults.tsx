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

    Space,
    Alert,
    Spin,
    Empty,
    Tooltip,
    Collapse
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
    // Add end_date and gating flag
    end_date?: string | null;
    results_locked?: boolean;
    score: number | null;
    max_score: number | null;
    percentage: number | null;
    time_taken: number;
    submitted_at: string;
    status: 'submitted' | 'auto_submitted' | 'graded';
    total_questions: number | null;
    correct_answers: number | null;
    teacher_feedback?: string;
}

interface AudioClipInfo {
    id: number;
    duration_seconds?: number;
    audio_order: number;
    max_plays: number;
    has_audio: boolean;
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
        audio_clip_id?: number | null;
        options?: Array<{
            id: number;
            option_text: string;
            is_correct: boolean;
        }>;
        selected_options?: number[] | string;
    }>;
    audio_clips?: AudioClipInfo[];
}

const StudentQuizResults: React.FC = () => {
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedResult, setSelectedResult] = useState<DetailedResult | null>(null);
    const [loadingQuizId, setLoadingQuizId] = useState<number | null>(null);
    const [audioUrls, setAudioUrls] = useState<Record<number, string>>({});
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchQuizResults();
    }, []);

    const fetchQuizResults = async () => {
        try {
            const response = await apiCall('/quizzes/student/results');

            if (response.ok) {
                const data = await response.json();
                setResults((data.results || []) as QuizResult[]);
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
        setLoadingQuizId(quizId);
        try {
            const response = await apiCall(`/quizzes/${quizId}/student-results`);

            if (response.ok) {
                const data = await response.json();
                setSelectedResult(data);
                setDetailModalVisible(true);

                // Securely preload audio clips via base64 (same IDM-evasion as quiz taking)
                const clips: AudioClipInfo[] = data.audio_clips || [];
                const hasAudioClips = clips.filter(c => c.has_audio);
                if (hasAudioClips.length > 0) {
                    const urls: Record<number, string> = {};
                    await Promise.all(hasAudioClips.map(async (clip) => {
                        try {
                            const audioResp = await apiCall(`/quizzes/audio/${clip.id}/stream`);
                            if (audioResp.ok) {
                                const json = await audioResp.json();
                                if (json.audioData) {
                                    const byteChars = atob(json.audioData);
                                    const byteArr = new Uint8Array(byteChars.length);
                                    for (let i = 0; i < byteChars.length; i++) {
                                        byteArr[i] = byteChars.charCodeAt(i);
                                    }
                                    const blob = new Blob([byteArr], { type: json.contentType || 'audio/wav' });
                                    urls[clip.id] = URL.createObjectURL(blob);
                                }
                            }
                        } catch (e) {
                            console.warn(`Failed to preload audio clip ${clip.id}`, e);
                        }
                    }));
                    setAudioUrls(urls);
                }
            } else {
                console.error('Failed to fetch detailed result');
            }
        } catch (error) {
            console.error('Error fetching detailed result:', error);
        } finally {
            setLoadingQuizId(null);
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

    // Color logic for individual question scores (multi-choice partial credit handling)
    const getQuestionScoreColor = (score: number | undefined, points: number | undefined) => {
        const s = Number(score || 0);
        const p = Number(points || 0);
        if (p <= 0) return '#d9d9d9';
        if (s <= 0) return '#ff4d4f'; // red
        const pct = (s / p) * 100;
        if (pct >= 100) return '#52c41a'; // green
        return '#faad14'; // orange for partial credit
    };

    const getQuestionStatus = (q: DetailedResult['questions'][number]) => {
        const isMcq = q.question_type === 'mcq_single' || q.question_type === 'mcq_multiple';
        if (isMcq) {
            const color = getQuestionScoreColor(q.score, q.points);
            const s = Number(q.score || 0);
            const p = Number(q.points || 0);
            let text = 'Incorrect';
            if (p > 0) {
                if (s <= 0) text = 'Incorrect';
                else if (s >= p) text = 'Correct';
                else text = 'Partially Correct';
            }
            return { color, text, correct: s >= p };
        }
        return { color: q.is_correct ? '#52c41a' : '#ff4d4f', text: q.is_correct ? 'Correct' : 'Incorrect', correct: !!q.is_correct };
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

        const unlocked = results.filter(r => !r.results_locked);
        
        // Average should be based on total points earned over total points possible (not average of percentages)
        const valid = unlocked.filter(r => Number(r.max_score || 0) > 0);
        const sumScores = valid.reduce((sum, r) => sum + Number(r.score || 0), 0);
        const sumMax = valid.reduce((sum, r) => sum + Number(r.max_score || 0), 0);
        const avgPercent = sumMax > 0 ? (sumScores / sumMax) * 100 : 0;
        
        const bestScore = unlocked.length > 0 ? Math.max(...unlocked.map(r => Number(r.percentage || 0))) : 0;
        const totalTimeSpent = results.reduce((sum, r) => sum + Number(r.time_taken || 0), 0);

        return {
            totalQuizzes: results.length,
            averageScore: Math.round(avgPercent),
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
                    {record.results_locked && (
                        <div style={{ marginTop: 6 }}>
                            <Tag color="gold">Results locked until {record.end_date ? dayjs(record.end_date).format('MMM DD, YYYY HH:mm') : 'end'}</Tag>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Score',
            key: 'score',
            render: (_, record: QuizResult) => (
                <div>
                    {record.results_locked ? (
                        <>
                            <Text type="secondary">Hidden until end</Text>
                            <br />
                            <Tag color="gold">Locked</Tag>
                        </>
                    ) : (
                        <>
                            <Text strong style={{ color: getScoreColor(Number(record.percentage || 0)) }}>
                                {Number(record.score || 0).toFixed(2)}/{Number(record.max_score || 0).toFixed(2)}
                            </Text>
                            <br />
                            <Tag color={getScoreColor(Number(record.percentage || 0))}>
                                {Number(record.percentage || 0).toFixed(2)}% ({getGradeText(Number(record.percentage || 0))})
                            </Tag>
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Performance',
            key: 'performance',
            render: (_, record: QuizResult) => (
                <div style={{ width: 120 }}>
                    {record.results_locked ? (
                        <Text type="secondary">Hidden</Text>
                    ) : (
                        <>
                            <Progress
                                percent={Number(record.percentage || 0)}
                                size="small"
                                strokeColor={getScoreColor(Number(record.percentage || 0))}
                                format={(percent) => `${percent}%`}
                            />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {Number(record.correct_answers || 0)}/{Number(record.total_questions || 0)} correct
                            </Text>
                        </>
                    )}
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
                <Tooltip title={record.results_locked ? 'Results will be available after the quiz ends' : 'View detailed results'}>
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => !record.results_locked && fetchDetailedResult(record.quiz_id)}
                        loading={loadingQuizId === record.quiz_id}
                        disabled={!!record.results_locked}
                    >
                        View Details
                    </Button>
                </Tooltip>
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
                        dataSource={Array.isArray(results) ? results : []}
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
                    // Revoke blob URLs to free memory
                    Object.values(audioUrls).forEach(url => URL.revokeObjectURL(url));
                    setAudioUrls({});
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

                        {/* Question-wise Performance — Grouped by Audio */}
                        <Card title="Question-wise Performance" size="small"
                            style={{ userSelect: 'none' }}
                            onContextMenu={(e: any) => e.preventDefault()}
                            onCopy={(e: any) => e.preventDefault()}
                        >
                            {(() => {
                                const questions = selectedResult.questions;
                                const audioClips: AudioClipInfo[] = selectedResult.audio_clips || [];

                                // Group questions
                                type QGroup = { type: 'audio'; clipId: number; clip: AudioClipInfo; questions: typeof questions }
                                    | { type: 'independent'; question: typeof questions[0] };
                                const groups: QGroup[] = [];
                                const audioMap = new Map<number, typeof questions>();

                                questions.forEach(q => {
                                    if (q.audio_clip_id) {
                                        if (!audioMap.has(q.audio_clip_id)) audioMap.set(q.audio_clip_id, []);
                                        audioMap.get(q.audio_clip_id)!.push(q);
                                    }
                                });

                                const processedClips = new Set<number>();
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

                                let globalIdx = 0;

                                const renderQuestion = (question: typeof questions[0], idx: number) => {
                                    const status = getQuestionStatus(question);
                                    const isMcq = question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple';

                                    return (
                                        <Collapse.Panel
                                            header={
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ lineHeight: '1.5', fontSize: '13px', color: '#1a1a1a', marginBottom: '6px' }}>
                                                        <span style={{ fontWeight: 600, color: '#1890ff', marginRight: '6px' }}>Q{idx}.</span>
                                                        {question.question_text}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                                                        <Tag color={status.color} style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '11px', lineHeight: '20px', borderRadius: '10px', fontWeight: 600 }}>
                                                            {status.correct ? (<><CheckCircleOutlined /> {status.text}</>) : (<>✗ {status.text}</>)}
                                                        </Tag>
                                                        <Tag color={getQuestionScoreColor(question.score, question.points)} style={{ margin: 0, whiteSpace: 'nowrap', fontSize: '11px', lineHeight: '20px', borderRadius: '10px', fontWeight: 600 }}>
                                                            {Number(question.score || 0) % 1 === 0 ? Number(question.score || 0) : Number(question.score || 0).toFixed(2)}/{Number(question.points) % 1 === 0 ? Number(question.points) : Number(question.points).toFixed(2)} pts
                                                        </Tag>
                                                    </div>
                                                </div>
                                            }
                                            key={`q-${question.id}`}
                                        >
                                            {(() => {
                                                if (isMcq && question.options && question.options.length > 0) {
                                                    let selectedIds: number[] = [];
                                                    try {
                                                        if (Array.isArray((question as any).selected_options)) {
                                                            selectedIds = (question as any).selected_options as number[];
                                                        } else if ((question as any).selected_options) {
                                                            const parsed = JSON.parse((question as any).selected_options as string);
                                                            if (Array.isArray(parsed)) selectedIds = parsed as number[];
                                                        }
                                                    } catch (_) {
                                                        selectedIds = [];
                                                    }
                                                    const selectedOptions = question.options.filter(o => selectedIds.includes(o.id));
                                                    return (
                                                        <div>
                                                            <Text type="secondary">Your Answer: </Text>
                                                            {selectedOptions.length > 0 ? (
                                                                <Space wrap>
                                                                    {selectedOptions.map((opt) => (
                                                                        <Tag key={opt.id} color={opt.is_correct ? 'green' : 'red'}>
                                                                            {opt.option_text}
                                                                        </Tag>
                                                                    ))}
                                                                </Space>
                                                            ) : (
                                                                <Text type="secondary">No answer</Text>
                                                            )}
                                                            {question.options.some(o => o.is_correct) && (
                                                                <div style={{ marginTop: 6 }}>
                                                                    <Text type="secondary">Correct Answer: </Text>
                                                                    <Space wrap>
                                                                        {question.options.filter(o => o.is_correct).map((opt) => (
                                                                            <Tag key={`c-${opt.id}`} color="green">{opt.option_text}</Tag>
                                                                        ))}
                                                                    </Space>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <>
                                                        {question.student_answer && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <Text type="secondary">Your Answer: </Text>
                                                                <Text>{question.student_answer}</Text>
                                                            </div>
                                                        )}
                                                        {question.correct_answer && question.student_answer !== question.correct_answer && (
                                                            <div style={{ marginBottom: 8 }}>
                                                                <Text type="secondary">Correct Answer: </Text>
                                                                <Text style={{ color: '#52c41a' }}>{question.correct_answer}</Text>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                            {question.teacher_feedback && (
                                                <div style={{ marginTop: 8 }}>
                                                    <Text type="secondary">Feedback: </Text>
                                                    <Text italic>{question.teacher_feedback}</Text>
                                                </div>
                                            )}
                                        </Collapse.Panel>
                                    );
                                };

                                return (
                                    <div>
                                        {groups.map((group, gIdx) => {
                                            if (group.type === 'independent') {
                                                globalIdx++;
                                                return (
                                                    <Collapse accordion bordered={false} style={{ background: '#fafafa', marginBottom: 8 }} key={`ind-${group.question.id}`}>
                                                        {renderQuestion(group.question, globalIdx)}
                                                    </Collapse>
                                                );
                                            }

                                            // Audio Group
                                            const audioQs = group.questions;
                                            const correctCount = audioQs.filter(q => {
                                                const s = Number(q.score || 0);
                                                const p = Number(q.points || 0);
                                                return p > 0 && s >= p;
                                            }).length;
                                            const totalPtsEarned = audioQs.reduce((s, q) => s + Number(q.score || 0), 0);
                                            const totalPtsMax = audioQs.reduce((s, q) => s + Number(q.points || 0), 0);
                                            const sectionPct = totalPtsMax > 0 ? Math.round((totalPtsEarned / totalPtsMax) * 100) : 0;
                                            const sectionColor = sectionPct >= 80 ? '#52c41a' : sectionPct >= 50 ? '#faad14' : '#ff4d4f';

                                            return (
                                                <div key={`audio-${group.clipId}`} style={{
                                                    marginBottom: '20px',
                                                    borderRadius: '14px',
                                                    overflow: 'hidden',
                                                    border: '2px solid #06b6d4',
                                                    boxShadow: '0 4px 16px rgba(6,182,212,0.12)'
                                                }}>
                                                    {/* Audio Section Header */}
                                                    <div style={{
                                                        background: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)',
                                                        padding: '16px 20px',
                                                        color: '#fff'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{
                                                                    background: 'rgba(255,255,255,0.2)',
                                                                    width: 34, height: 34, borderRadius: '50%',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: 16
                                                                }}>🎧</div>
                                                                <div>
                                                                    <Text strong style={{ color: '#fff', fontSize: '14px', display: 'block' }}>
                                                                        Listening Comprehension — Audio {group.clip.audio_order || gIdx + 1}
                                                                    </Text>
                                                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>
                                                                        {audioQs.length} question{audioQs.length > 1 ? 's' : ''} linked to this audio
                                                                    </Text>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* KPIs */}
                                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.15)',
                                                                borderRadius: '8px', padding: '6px 14px',
                                                                display: 'flex', alignItems: 'center', gap: '6px'
                                                            }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Accuracy</Text>
                                                                <Text strong style={{ color: '#fff', fontSize: '13px' }}>{correctCount}/{audioQs.length}</Text>
                                                            </div>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.15)',
                                                                borderRadius: '8px', padding: '6px 14px',
                                                                display: 'flex', alignItems: 'center', gap: '6px'
                                                            }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Points</Text>
                                                                <Text strong style={{ color: '#fff', fontSize: '13px' }}>
                                                                    {totalPtsEarned % 1 === 0 ? totalPtsEarned : totalPtsEarned.toFixed(2)}/{totalPtsMax % 1 === 0 ? totalPtsMax : totalPtsMax.toFixed(2)}
                                                                </Text>
                                                            </div>
                                                            <div style={{
                                                                background: 'rgba(255,255,255,0.15)',
                                                                borderRadius: '8px', padding: '6px 14px',
                                                                display: 'flex', alignItems: 'center', gap: '6px'
                                                            }}>
                                                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Score</Text>
                                                                <Text strong style={{ color: '#fff', fontSize: '13px' }}>{sectionPct}%</Text>
                                                                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: sectionColor }} />
                                                            </div>
                                                        </div>

                                                        {/* Secure Audio Player (Blob URL — no network endpoint exposed) */}
                                                        {audioUrls[group.clipId] && (
                                                            <div style={{ marginTop: '10px' }}>
                                                                <audio
                                                                    controls
                                                                    controlsList="nodownload noplaybackrate"
                                                                    onContextMenu={(e) => e.preventDefault()}
                                                                    src={audioUrls[group.clipId]}
                                                                    style={{
                                                                        width: '100%', height: '34px',
                                                                        borderRadius: '8px',
                                                                        filter: 'invert(1) hue-rotate(180deg)',
                                                                        opacity: 0.9
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Questions under this audio */}
                                                    <div style={{ padding: '12px 16px', backgroundColor: '#f0fdfa' }}>
                                                        <Collapse accordion bordered={false} style={{ background: 'transparent' }}>
                                                            {audioQs.map((q) => {
                                                                globalIdx++;
                                                                return renderQuestion(q, globalIdx);
                                                            })}
                                                        </Collapse>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentQuizResults;