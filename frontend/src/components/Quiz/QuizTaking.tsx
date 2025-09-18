import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
    Card, 
    Button, 
    Radio, 
 
    Typography, 
    Progress, 
    Space, 
    Alert, 
    Modal, 
    Statistic, 
    Row, 
    Col,
    message,
    Spin,
    Checkbox
} from 'antd';
import {
    ClockCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

// Helper function to format numbers - show whole numbers without .00
const formatNumber = (num: number): string => {
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
};

interface Question {
    id: number;
    question_text: string;
    question_type: 'mcq_single' | 'mcq_multiple' | 'yes_no';
    options?: { id: number; option_text: string; option_order: number }[];
    points: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    duration_minutes?: number;
    total_questions: number;
    questions: Question[];
}

interface Answer {
    question_id: number;
    answer_text?: string;
    selected_options?: number[];
}

interface QuizResults {
    totalScore: number;
    maxScore: number;
    percentage: number;
    time_taken_minutes: number;
}

interface QuizTakingProps {
    quizId?: string;
    onComplete?: () => void;
}

export interface QuizTakingHandle {
    submitNow: (auto?: boolean) => Promise<boolean>;
    isStarted: () => boolean;
}

const QuizTaking = forwardRef(( { quizId: propQuizId, onComplete }: QuizTakingProps, ref: React.Ref<QuizTakingHandle> ) => {
    const { quizId: paramQuizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { apiCall } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    
    const quizId = propQuizId || paramQuizId;
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
    const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
    const timerRef = useRef<number | null>(null);
    const autoSaveTimerRef = useRef<number | null>(null);
    // Server sync polling interval
    const syncIntervalRef = useRef<number | null>(null);
    // Track visited questions for nav coloring
    const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(() => new Set());

    useEffect(() => {
        if (quizId) {
            fetchQuiz();
        }
    }, [quizId]);

    useEffect(() => {
        if (quizStarted && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleAutoSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeLeft, quizStarted]);

    // Server UTC status polling to avoid drift and trigger auto-submit server-side
    useEffect(() => {
        if (!quizStarted || !quizId) return;

        const poll = async () => {
            try {
                const resp = await apiCall(`/quizzes/${quizId}/status`);
                if (!resp.ok) return;
                const data = await resp.json();

                if (data?.status === 'in_progress') {
                    // Restore saved answers on resume (only if we don't already have local answers)
                    if (Array.isArray(data.answers)) {
                        setAnswers(prev => {
                            if (prev && prev.length > 0) return prev; // don't override ongoing edits
                            return data.answers.map((a: any) => ({
                                question_id: Number(a.question_id),
                                answer_text: a.answer_text ?? undefined,
                                selected_options: Array.isArray(a.selected_options)
                                    ? a.selected_options.map((n: any) => Number(n))
                                    : (a.selected_options ? JSON.parse(a.selected_options) : undefined)
                            }));
                        });
                    }

                    if (typeof data.time_left_seconds === 'number') {
                        setTimeLeft(prev => {
                            // Adjust if drift is greater than 2 seconds
                            return Math.abs(prev - data.time_left_seconds) > 2 ? data.time_left_seconds : prev;
                        });
                    }
                    if (!totalTimeSeconds && typeof data.duration_minutes === 'number') {
                        setTotalTimeSeconds(data.duration_minutes * 60);
                    }
                } else if (data?.status === 'auto_submitted' || data?.status === 'submitted') {
                    // Server forced submission (e.g., time expired)
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                    }
                    if (syncIntervalRef.current) {
                        clearInterval(syncIntervalRef.current);
                        syncIntervalRef.current = null;
                    }
                    setQuizCompleted(true);
                    const r = data.results;
                    if (r) {
                        setQuizResults({
                            totalScore: r.totalScore,
                            maxScore: r.maxScore,
                            percentage: r.percentage,
                            time_taken_minutes: data.time_taken_minutes ?? r.time_taken_minutes ?? 0
                        });
                    }
                    messageApi.warning(data?.message || 'Time expired, quiz auto-submitted');
                    if (onComplete) setTimeout(() => onComplete(), 1500);
                }
            } catch {
                // ignore transient errors
            }
        };

        // Initial poll then interval
        void poll();
        syncIntervalRef.current = setInterval(poll, 2000);

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
                syncIntervalRef.current = null;
            }
        };
    }, [quizStarted, quizId]);

    // Track visited questions when current changes
    useEffect(() => {
        if (!quizStarted || !quiz?.questions?.length) return;
        const q = quiz.questions[currentQuestion];
        if (!q) return;
        setVisitedQuestions(prev => {
            const next = new Set(prev);
            next.add(q.id);
            return next;
        });
    }, [quizStarted, quiz, currentQuestion]);

    // Warn before closing the tab/window if quiz is in progress
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (quizStarted && !quizCompleted) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [quizStarted, quizCompleted]);

    const fetchQuiz = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}`);
            if (response.ok) {
                const data = await response.json();
                const normalized: Quiz = data?.quiz
                    ? { ...(data.quiz as Quiz), questions: data.questions ?? data.quiz?.questions ?? [] }
                    : (data as Quiz);
                // Normalize points if backend uses `marks`
                if (Array.isArray(normalized.questions)) {
                    normalized.questions = normalized.questions.map((q: any) => ({
                        ...q,
                        points: q.points ?? q.marks ?? 0,
                    }));
                }
                setQuiz(normalized);
            } else {
                const err = await safeJson(response);
                messageApi.error(err?.error || 'Failed to load quiz');
                navigate('/student-dashboard');
            }
        } catch (error) {
            messageApi.error('Error loading quiz');
            navigate('/student-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const safeJson = async (resp: Response) => {
        try { return await resp.json(); } catch { return null; }
    };

    const startQuiz = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}/start`, { method: 'POST' });
            if (!response.ok) {
                const errJson = await safeJson(response);
                const errText = errJson?.error || (await response.text());
                messageApi.error(errText || 'Failed to start quiz');
                return;
            }
            const data = await response.json();
            const duration = data.quiz?.duration_minutes ?? 0;
            const seconds = duration * 60;
            setTotalTimeSeconds(seconds);
            setTimeLeft(seconds);
            setQuizStarted(true);
            setQuiz(prev => (prev ? { ...prev, duration_minutes: duration } : prev));
            // Mark the first question as visited
            const firstQ = (data?.quiz?.questions ?? quiz?.questions)?.[0] || quiz?.questions?.[0];
            if (firstQ?.id) {
                setVisitedQuestions(prev => {
                    const next = new Set(prev);
                    next.add(firstQ.id);
                    return next;
                });
            }
            messageApi.success('Quiz started! Good luck!');
        } catch (e) {
            messageApi.error('Failed to start quiz');
        }
    };

    const handleAnswerChange = (question: Question, value: any) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.question_id === question.id);
            let updated: Answer = { question_id: question.id };
            if (question.question_type === 'yes_no') {
                updated.answer_text = value as string; // 'yes' | 'no'
            } else if (question.question_type === 'mcq_single') {
                updated.selected_options = value != null ? [Number(value)] : [];
            } else if (question.question_type === 'mcq_multiple') {
                updated.selected_options = Array.isArray(value) ? value.map(Number) : [];
            }
            if (existing) {
                return prev.map(a => (a.question_id === question.id ? { ...a, ...updated } : a));
            } else {
                return [...prev, updated];
            }
        });
    };

    // Debounced auto-save on answers change
    useEffect(() => {
        if (!quizStarted || quizCompleted) return;
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            void autoSave();
        }, 1500);
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [answers, quizStarted, quizCompleted]);

    const getAnswerForQuestion = (question: Question): any => {
        const a = answers.find(ans => ans.question_id === question.id);
        switch (question.question_type) {
            case 'yes_no':
                return a?.answer_text || '';
            case 'mcq_single':
                return a?.selected_options?.[0];
            case 'mcq_multiple':
                return a?.selected_options || [];
            default:
                return '';
        }
    };

    const payloadFromAnswers = () => answers.map(a => ({
        question_id: a.question_id,
        answer_text: a.answer_text ?? null,
        selected_options: a.selected_options ?? null
    }));

    const nextQuestion = async () => {
        // Save immediately on Next click
        try {
            await apiCall(`/quizzes/${quizId}/auto-save`, {
                method: 'POST',
                body: JSON.stringify({ answers: payloadFromAnswers() })
            });
        } catch {}
        if (currentQuestion < ((quiz?.questions?.length || 0) - 1)) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const previousQuestion = async () => {
        // Save on Previous as well
        try {
            await apiCall(`/quizzes/${quizId}/auto-save`, {
                method: 'POST',
                body: JSON.stringify({ answers: payloadFromAnswers() })
            });
        } catch {}
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleAutoSubmit = async () => {
        messageApi.warning('Time is up! Submitting quiz automatically...');
        await submitQuiz(true);
    };

    const autoSave = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}/auto-save`, {
                method: 'POST',
                body: JSON.stringify({ answers: payloadFromAnswers() })
            });
            // Do not spam messages; optionally, one-time success toast could be added
            if (!response.ok) {
                const err = await safeJson(response);
                // Silent fail; optionally log
                console.warn('Auto-save failed', err?.error || response.statusText);
            }
        } catch (e) {
            console.warn('Auto-save exception', e);
        }
    };

    const submitQuiz = async (isAuto: boolean = false): Promise<boolean> => {
        if (submitting) return false;
        setSubmitting(true);
        try {
            const response = await apiCall(`/quizzes/${quizId}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    answers: payloadFromAnswers(),
                    is_auto_submit: isAuto
                })
            });

            if (response.ok) {
                const data = await response.json();
                setQuizCompleted(true);

                if (data?.results) {
                    setQuizResults({
                        totalScore: data.results.totalScore,
                        maxScore: data.results.maxScore,
                        percentage: data.results.percentage,
                        time_taken_minutes: data.time_taken_minutes
                    });
                    messageApi.success('Quiz submitted and graded automatically!');
                } else {
                    messageApi.success('Quiz submitted!');
                }

                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                if (onComplete) {
                    setTimeout(() => onComplete(), 1500);
                }
                return true;
            } else {
                const err = await safeJson(response);
                messageApi.error(err?.error || 'Failed to submit quiz');
                return false;
            }
        } catch (error) {
            messageApi.error('Error submitting quiz');
            return false;
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    useImperativeHandle(ref, () => ({
        submitNow: async (auto?: boolean) => {
            // Avoid duplicate submits
            if (!quizStarted || quizCompleted) return false;
            return await submitQuiz(!!auto);
        },
        isStarted: () => quizStarted,
    }), [quizStarted, quizCompleted, answers]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimeColor = (): string => {
        const totalTime = totalTimeSeconds || 1;
        const percentage = (timeLeft / totalTime) * 100;
        
        if (percentage > 50) return '#52c41a';
        if (percentage > 25) return '#fa8c16';
        return '#f5222d';
    };

    // Compute answered set for nav panel coloring
    const answeredSet = new Set(
        answers
            .filter(a => (a.answer_text && a.answer_text !== '') || (Array.isArray(a.selected_options) && a.selected_options.length > 0))
            .map(a => a.question_id)
    );

    const renderQuestion = (question: Question) => {
        const currentAnswer = getAnswerForQuestion(question);

        switch (question.question_type) {
            case 'mcq_single':
                return (
                    <Radio.Group
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {question.options?.map((option) => (
                                <Radio key={option.id} value={option.id} style={{ fontSize: 16 }}>
                                    {option.option_text}
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                );
            case 'mcq_multiple':
                return (
                    <div style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {question.options?.map((option) => (
                                <Checkbox
                                    key={option.id}
                                    checked={(currentAnswer as number[]).includes(option.id)}
                                    onChange={(e) => {
                                        const selected = new Set<number>(currentAnswer as number[]);
                                        if (e.target.checked) selected.add(option.id); else selected.delete(option.id);
                                        handleAnswerChange(question, Array.from(selected));
                                    }}
                                    style={{ fontSize: 16 }}
                                >
                                    {option.option_text}
                                </Checkbox>
                            ))}
                        </Space>
                    </div>
                );
            case 'yes_no':
                return (
                    <Radio.Group
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio value="yes" style={{ fontSize: 16 }}>Yes</Radio>
                            <Radio value="no" style={{ fontSize: 16 }}>No</Radio>
                        </Space>
                    </Radio.Group>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                {contextHolder}
                <Spin size="large" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                {contextHolder}
                <Title level={3}>Quiz not found</Title>
                <Button type="primary" onClick={() => navigate('/student-dashboard')}>Go Back</Button>
            </div>
        );
    }

    if (quizCompleted) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                {contextHolder}
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                <Title level={2}>Quiz Completed!</Title>
                <Paragraph>
                    Your quiz has been submitted successfully. You will be redirected to your dashboard shortly.
                </Paragraph>
                <Button type="primary" onClick={() => navigate('/student-dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div style={{ padding: '24px' }}>
                {contextHolder}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <QuestionCircleOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
                    <Title level={3} style={{ marginBottom: 8 }}>Take Quiz</Title>
                    <Title level={4} style={{ marginBottom: 4, fontWeight: 'normal' }}>{quiz.title}</Title>
                    <Paragraph style={{ marginBottom: 16 }}>{quiz.description}</Paragraph>
                </div>
                    
                <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={8}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Questions"
                                value={quiz.total_questions ?? (quiz.questions ? quiz.questions.length : 0)}
                                prefix={<QuestionCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Time Limit"
                                value={quiz.duration_minutes ?? '—'}
                                suffix="min"
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card size="small" style={{ textAlign: 'center' }}>
                            <Statistic
                                title="Total Points"
                                value={Array.isArray(quiz.questions) ? quiz.questions.reduce((sum, q) => sum + (q.points ?? 0), 0) : 0}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
                
                <Alert
                    message="Important Instructions"
                    description={
                        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                            <li>Once you start, the timer will begin immediately</li>
                            <li>You can navigate between questions using Next/Previous buttons</li>
                            <li>Your answers are saved automatically</li>
                            <li>Make sure you have a stable internet connection</li>
                            <li>The quiz will auto-submit when time runs out</li>
                        </ul>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
                
                <div style={{ textAlign: 'center' }}>
                    <Space>
                        <Button onClick={() => navigate('/student-dashboard')}>Cancel</Button>
                        <Button type="primary" size="large" onClick={startQuiz}>
                            Start Quiz
                        </Button>
                    </Space>
                </div>
            </div>
        );
    }

    const currentQ = quiz.questions?.[currentQuestion];
    const questionsLength = quiz.questions?.length ?? 0;
    const progress = questionsLength ? (((currentQuestion + 1) / questionsLength) * 100) : 0;
    const answeredQuestions = answeredSet.size;

    // Guard against quizzes with no questions
    if (!currentQ) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
                {contextHolder}
                <Alert message="No questions available for this quiz." type="warning" showIcon />
                <div style={{ marginTop: 16 }}>
                    <Button onClick={() => navigate('/student-dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
            {contextHolder}
            {/* Header with timer and progress */}
            <Card style={{ marginBottom: 20 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>{quiz.title}</Title>
                        <Text type="secondary">
                            Question {currentQuestion + 1} of {questionsLength}
                        </Text>
                    </Col>
                    <Col>
                        <Statistic
                            title="Time Remaining"
                            value={formatTime(timeLeft)}
                            valueStyle={{ color: getTimeColor(), fontSize: 24 }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                </Row>
                
                <Progress 
                    percent={progress} 
                    strokeColor="#1890ff"
                    style={{ marginTop: 16 }}
                />
                
                {/* Question navigation panel */}
                {questionsLength > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {quiz.questions.map((q, idx) => {
                            const isCurrent = idx === currentQuestion;
                            const isAnswered = answeredSet.has(q.id);
                            const isVisited = visitedQuestions.has(q.id);
                            let bg = '#d9d9d9'; // gray for unvisited (default)
                            let color = '#000';
                            if (isCurrent) { bg = '#fa8c16'; color = '#fff'; } // orange current
                            else if (isAnswered) { bg = '#52c41a'; color = '#fff'; } // green saved
                            else if (!isVisited) { bg = '#d9d9d9'; color = '#000'; } // gray unvisited
                            
                            return (
                                <Button
                                    key={q.id}
                                    size="small"
                                    style={{
                                        width: 32,
                                        height: 32,
                                        padding: 0,
                                        backgroundColor: bg,
                                        color,
                                        border: isCurrent ? '2px solid #d46b08' : '1px solid #ccc',
                                    }}
                                    onClick={() => setCurrentQuestion(idx)}
                                    disabled={submitting || quizCompleted}
                                >
                                    {idx + 1}
                                </Button>
                            );
                        })}
                    </div>
                )}
                
                <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <Text type="secondary">
                        {answeredQuestions} of {questionsLength} questions answered
                    </Text>
                </div>
            </Card>

            {/* Question Card */}
            <Card>
                <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            Question {currentQuestion + 1}
                        </Title>
                        <Text strong style={{ color: '#1890ff' }}>
                            {currentQ.points ?? 0} {(currentQ.points ?? 0) === 1 ? 'point' : 'points'}
                        </Text>
                    </div>
                    
                    <Paragraph style={{ fontSize: 18, lineHeight: 1.6 }}>
                        {currentQ.question_text}
                    </Paragraph>
                </div>

                <div style={{ marginBottom: 32 }}>
                    {renderQuestion(currentQ)}
                </div>

                {/* Navigation buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button 
                        onClick={previousQuestion}
                        disabled={currentQuestion === 0}
                    >
                        Previous
                    </Button>
                    
                    <Space>
                        {currentQuestion === questionsLength - 1 ? (
                            <Button 
                                type="primary" 
                                danger
                                onClick={() => setShowConfirmModal(true)}
                                disabled={submitting}
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button 
                                type="primary"
                                onClick={nextQuestion}
                            >
                                Next
                            </Button>
                        )}
                    </Space>
                </div>
            </Card>

            {/* Quiz Results Display */}
            {quizCompleted && quizResults && (
                <Card 
                    style={{ 
                        marginTop: 24, 
                        textAlign: 'center',
                        border: '1px solid #d9d9d9'
                    }}
                >
                    <div style={{ padding: '24px 0' }}>
                        <CheckCircleOutlined 
                            style={{ 
                                fontSize: 64, 
                                color: '#52c41a', 
                                marginBottom: 16 
                            }} 
                        />
                        <Title level={2} style={{ marginBottom: 24 }}>
                            Quiz Completed!
                        </Title>
                        
                        <Row gutter={[24, 24]} justify="center">
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Your Score"
                                    value={quizResults.totalScore}
                                    suffix={`/ ${quizResults.maxScore}`}
                                    valueStyle={{ fontSize: 28 }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Percentage"
                                    value={formatNumber(quizResults.percentage)}
                                    suffix="%"
                                    valueStyle={{ 
                                        color: quizResults.percentage >= 70 ? '#52c41a' : 
                                               quizResults.percentage >= 50 ? '#fa8c16' : '#f5222d',
                                        fontSize: 28
                                    }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Time Taken"
                                    value={quizResults.time_taken_minutes}
                                    suffix="min"
                                    valueStyle={{ fontSize: 28 }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title="Grade"
                                    value={
                                        quizResults.percentage >= 90 ? 'A+' :
                                        quizResults.percentage >= 80 ? 'A' :
                                        quizResults.percentage >= 70 ? 'B' :
                                        quizResults.percentage >= 60 ? 'C' :
                                        quizResults.percentage >= 50 ? 'D' : 'F'
                                    }
                                    valueStyle={{ 
                                        color: quizResults.percentage >= 70 ? '#52c41a' : 
                                               quizResults.percentage >= 50 ? '#fa8c16' : '#f5222d',
                                        fontSize: 28,
                                        fontWeight: 'bold'
                                    }}
                                />
                            </Col>
                        </Row>
                        
                        <div style={{ marginTop: 32 }}>
                            <Alert
                                message={
                                    quizResults.percentage >= 70 ? 
                                    "Excellent work! You've passed the quiz." :
                                    quizResults.percentage >= 50 ?
                                    "Good effort! You can review and improve." :
                                    "Keep practicing! Review the material and try again."
                                }
                                type={
                                    quizResults.percentage >= 70 ? 'success' :
                                    quizResults.percentage >= 50 ? 'warning' : 'error'
                                }
                                showIcon
                            />
                        </div>
                        
                        <div style={{ marginTop: 24 }}>
                            <Space>
                                <Button 
                                    type="primary" 
                                    size="large"
                                    onClick={() => navigate('/my-results')}
                                >
                                    View All Results
                                </Button>
                                <Button 
                                    size="large"
                                    onClick={() => navigate('/student-dashboard')}
                                >
                                    Back to Dashboard
                                </Button>
                            </Space>
                        </div>
                    </div>
                </Card>
            )}

            {/* Submit Confirmation Modal */}
            <Modal
                title="Submit Quiz"
                open={showConfirmModal}
                onOk={() => submitQuiz(false)}
                onCancel={() => setShowConfirmModal(false)}
                okText="Submit"
                cancelText="Cancel"
                confirmLoading={submitting}
            >
                <div>
                    <WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                    <Text>Are you sure you want to submit your quiz?</Text>
                </div>
                <div style={{ marginTop: 16 }}>
                    <Text type="secondary">
                        You have answered {answeredQuestions} out of {questionsLength} questions.
                        {answeredQuestions < questionsLength && (
                            <span style={{ color: '#fa8c16' }}>
                                {' '}Unanswered questions will be marked as incorrect.
                            </span>
                        )}
                    </Text>
                </div>
            </Modal>
        </div>
    );
});

export default QuizTaking;