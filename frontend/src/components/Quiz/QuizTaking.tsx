import React, { useState, useEffect, useRef } from 'react';
import { 
    Card, 
    Button, 
    Radio, 
    Input, 
    Form, 
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
const { TextArea } = Input;

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

const QuizTaking: React.FC<QuizTakingProps> = ({ quizId: propQuizId, onComplete }) => {
    const { quizId: paramQuizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { apiCall, user } = useAuth();
    
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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [form] = Form.useForm();

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

    const fetchQuiz = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}`);
            if (response.ok) {
                const data = await response.json();
                const normalized: Quiz = data?.quiz
                    ? { ...(data.quiz as Quiz), questions: data.questions ?? data.quiz?.questions ?? [] }
                    : (data as Quiz);
                setQuiz(normalized);
            } else {
                message.error('Failed to load quiz');
                navigate('/student-dashboard');
            }
        } catch (error) {
            message.error('Error loading quiz');
            navigate('/student-dashboard');
        } finally {
            setLoading(false);
        }
    };

    const startQuiz = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}/start`, { method: 'POST' });
            if (!response.ok) {
                const errText = await response.text();
                message.error(errText || 'Failed to start quiz');
                return;
            }
            const data = await response.json();
            const duration = data.quiz?.duration_minutes ?? 0;
            const seconds = duration * 60;
            setTotalTimeSeconds(seconds);
            setTimeLeft(seconds);
            setQuizStarted(true);
            setQuiz(prev => (prev ? { ...prev, duration_minutes: duration } : prev));
            message.success('Quiz started! Good luck!');
        } catch (e) {
            message.error('Failed to start quiz');
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

    const getCurrentAnswer = (questionId: number): string => {
    // Deprecated in favor of getAnswerForQuestion
    const answer = answers.find(a => a.question_id === questionId);
    return (answer?.answer_text as string) || '';
    };
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

    const nextQuestion = () => {
        if (currentQuestion < ((quiz?.questions?.length || 0) - 1)) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleAutoSubmit = async () => {
        message.warning('Time is up! Submitting quiz automatically...');
        await submitQuiz(true);
    };

    const submitQuiz = async (isAuto: boolean = false) => {
        setSubmitting(true);
        try {
            const payloadAnswers = answers.map(a => ({
                question_id: a.question_id,
                answer_text: a.answer_text ?? null,
                selected_options: a.selected_options ?? null
            }));

            const response = await apiCall(`/quizzes/${quizId}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    answers: payloadAnswers,
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
                    message.success('Quiz submitted and graded automatically!');
                } else {
                    message.success('Quiz submitted!');
                }

                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }

                if (onComplete) {
                    setTimeout(() => onComplete(), 5000);
                }
            } else {
                message.error('Failed to submit quiz');
            }
        } catch (error) {
            message.error('Error submitting quiz');
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
        }
    };

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
                <Spin size="large" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Title level={3}>Quiz not found</Title>
                <Button type="primary" onClick={() => navigate('/student-dashboard')}>Go Back</Button>
            </div>
        );
    }

    if (quizCompleted) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Card style={{ width: 500, textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={2}>Quiz Completed!</Title>
                    <Paragraph>
                        Your quiz has been submitted successfully. You will be redirected to your dashboard shortly.
                    </Paragraph>
                    <Button type="primary" onClick={() => navigate('/student-dashboard')}>Go to Dashboard</Button>
                </Card>
            </div>
        );
    }

    if (!quizStarted) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <Card style={{ width: 600 }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <QuestionCircleOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
                        <Title level={2}>{quiz.title}</Title>
                        <Paragraph>{quiz.description}</Paragraph>
                    </div>
                    
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col span={8}>
                            <Statistic
                                title="Questions"
                                value={quiz.total_questions ?? (quiz.questions ? quiz.questions.length : 0)}
                                prefix={<QuestionCircleOutlined />}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Time Limit"
                                value={quiz.duration_minutes ?? '—'}
                                suffix="minutes"
                                prefix={<ClockCircleOutlined />}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Total Points"
                                value={Array.isArray(quiz.questions) ? quiz.questions.reduce((sum, q) => sum + q.points, 0) : 0}
                                prefix={<CheckCircleOutlined />}
                            />
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
                        style={{ marginBottom: 24 }}
                    />
                    
                    <div style={{ textAlign: 'center' }}>
                        <Space>
                            <Button onClick={() => navigate('/student-dashboard')}>Cancel</Button>
                            <Button type="primary" size="large" onClick={startQuiz}>
                                Start Quiz
                            </Button>
                        </Space>
                    </div>
                </Card>
            </div>
        );
    }

    const currentQ = quiz.questions?.[currentQuestion];
    const questionsLength = quiz.questions?.length ?? 0;
    const progress = questionsLength ? (((currentQuestion + 1) / questionsLength) * 100) : 0;
    const answeredQuestions = answers.length;

    // Guard against quizzes with no questions
    if (!currentQ) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
                <Alert message="No questions available for this quiz." type="warning" showIcon />
                <div style={{ marginTop: 16 }}>
                    <Button onClick={() => navigate('/student-dashboard')}>Back to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
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
                            {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
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
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
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
                        <Title level={2} style={{ color: 'white', marginBottom: 24 }}>
                            Quiz Completed!
                        </Title>
                        
                        <Row gutter={[24, 24]} justify="center">
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Your Score</span>}
                                    value={quizResults.totalScore}
                                    suffix={`/ ${quizResults.maxScore}`}
                                    valueStyle={{ color: 'white', fontSize: 28 }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Percentage</span>}
                                    value={quizResults.percentage}
                                    suffix="%"
                                    precision={1}
                                    valueStyle={{ 
                                        color: quizResults.percentage >= 70 ? '#52c41a' : 
                                               quizResults.percentage >= 50 ? '#fa8c16' : '#f5222d',
                                        fontSize: 28
                                    }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Time Taken</span>}
                                    value={quizResults.time_taken_minutes}
                                    suffix="min"
                                    valueStyle={{ color: 'white', fontSize: 28 }}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Statistic
                                    title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Grade</span>}
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
                                style={{ 
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'white'
                                }}
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
                                    style={{ 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        color: 'white'
                                    }}
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
                onOk={submitQuiz}
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
};

export default QuizTaking;