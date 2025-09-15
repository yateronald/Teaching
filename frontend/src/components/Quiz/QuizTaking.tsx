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
    Spin
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
    question_type: 'mcq' | 'text' | 'yes_no';
    options?: string[];
    correct_answer?: string;
    points: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    time_limit: number;
    total_questions: number;
    questions: Question[];
}

interface Answer {
    question_id: number;
    answer: string;
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
            const response = await apiCall(`/api/quizzes/${quizId}/take`);
            if (response.success) {
                setQuiz(response.data);
                setTimeLeft(response.data.time_limit * 60); // Convert minutes to seconds
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

    const startQuiz = () => {
        setQuizStarted(true);
        message.success('Quiz started! Good luck!');
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.question_id === questionId);
            if (existing) {
                return prev.map(a => 
                    a.question_id === questionId ? { ...a, answer } : a
                );
            } else {
                return [...prev, { question_id: questionId, answer }];
            }
        });
    };

    const getCurrentAnswer = (questionId: number): string => {
        const answer = answers.find(a => a.question_id === questionId);
        return answer?.answer || '';
    };

    const nextQuestion = () => {
        if (currentQuestion < (quiz?.questions.length || 0) - 1) {
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
        await submitQuiz();
    };

    const submitQuiz = async () => {
        setSubmitting(true);
        try {
            const response = await apiCall(`/api/quizzes/${quizId}/submit`, {
                method: 'POST',
                body: JSON.stringify({
                    answers,
                    time_taken: (quiz!.time_limit * 60) - timeLeft
                })
            });

            if (response.success) {
                setQuizCompleted(true);
                message.success('Quiz submitted successfully!');
                
                // Clear timer
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
                
                // Call onComplete callback if provided
                if (onComplete) {
                    setTimeout(() => onComplete(), 2000); // Delay to show success message
                }
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    navigate('/student-dashboard');
                }, 3000);
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
        const totalTime = quiz!.time_limit * 60;
        const percentage = (timeLeft / totalTime) * 100;
        
        if (percentage > 50) return '#52c41a';
        if (percentage > 25) return '#fa8c16';
        return '#f5222d';
    };

    const renderQuestion = (question: Question) => {
        const currentAnswer = getCurrentAnswer(question.id);
        
        switch (question.question_type) {
            case 'mcq':
                return (
                    <Radio.Group
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {question.options?.map((option, index) => (
                                <Radio key={index} value={option} style={{ fontSize: 16 }}>
                                    {option}
                                </Radio>
                            ))}
                        </Space>
                    </Radio.Group>
                );
            
            case 'text':
                return (
                    <TextArea
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={4}
                        style={{ fontSize: 16 }}
                    />
                );
            
            case 'yes_no':
                return (
                    <Radio.Group
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio value="Yes" style={{ fontSize: 16 }}>Yes</Radio>
                            <Radio value="No" style={{ fontSize: 16 }}>No</Radio>
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
                                value={quiz.total_questions}
                                prefix={<QuestionCircleOutlined />}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Time Limit"
                                value={quiz.time_limit}
                                suffix="minutes"
                                prefix={<ClockCircleOutlined />}
                            />
                        </Col>
                        <Col span={8}>
                            <Statistic
                                title="Total Points"
                                value={quiz.questions.reduce((sum, q) => sum + q.points, 0)}
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

    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const answeredQuestions = answers.length;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
            {/* Header with timer and progress */}
            <Card style={{ marginBottom: 20 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={4} style={{ margin: 0 }}>{quiz.title}</Title>
                        <Text type="secondary">
                            Question {currentQuestion + 1} of {quiz.questions.length}
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
                        {answeredQuestions} of {quiz.questions.length} questions answered
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
                        {currentQuestion === quiz.questions.length - 1 ? (
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
                        You have answered {answeredQuestions} out of {quiz.questions.length} questions.
                        {answeredQuestions < quiz.questions.length && (
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