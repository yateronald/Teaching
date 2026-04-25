import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Tag, Empty, message, Tooltip, Button, Skeleton } from 'antd';
import {
    ClockCircleOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    BookOutlined,
    MenuOutlined,
    CalendarOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface Option {
    id: number;
    option_text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    question_text: string;
    question_type: 'mcq_single' | 'mcq_multiple' | 'yes_no';
    marks: number;
    options?: Option[];
    correct_answer?: string;
    audio_clip_id?: number | null;
}

interface AudioClip {
    id: number;
    duration_seconds: number;
    has_audio: boolean;
}

interface QuizDetailsData {
    title: string;
    description: string;
    instructions: string;
    duration_minutes: number;
    total_marks: number;
    auto_submit: boolean;
    start_date?: string | null;
    end_date?: string | null;
    randomize_questions: boolean;
    randomize_options: boolean;
    questions: Question[];
    batches: { name: string }[];
    audio_clips: AudioClip[];
}

interface QuizDetailsProps {
    quizId: string;
    onClose?: () => void;
}

const TeacherAudioPlayer: React.FC<{ clipId: number }> = ({ clipId }) => {
    const { token } = useAuth();
    const [audioSrc, setAudioSrc] = useState<string>('');

    useEffect(() => {
        if (!clipId || !token) return;
        const fetchAudio = async () => {
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            try {
                const response = await fetch(`${API_BASE_URL}/quizzes/audio/${clipId}/stream`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setAudioSrc(url);
                }
            } catch (error) {
                console.error('Failed to fetch audio stream', error);
            }
        };
        fetchAudio();
        return () => {
            if (audioSrc) URL.revokeObjectURL(audioSrc);
        };
    }, [clipId, token]);

    return audioSrc ? (
        <audio controls src={audioSrc} style={{ width: '100%', height: 40 }} />
    ) : (
        <div style={{ padding: 10, background: '#f8fafc', color: '#64748b', fontSize: 13, borderRadius: 8 }}>
            Loading audio...
        </div>
    );
};

const QuizDetails: React.FC<QuizDetailsProps> = ({ quizId, onClose }) => {
    const { apiCall } = useAuth();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<QuizDetailsData | null>(null);

    useEffect(() => {
        if (!quizId) return;
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const response = await apiCall(`/quizzes/${quizId}`);
                if (response.ok) {
                    const data = await response.json();
                    setQuiz(data);
                } else {
                    message.error('Failed to load quiz details');
                }
            } catch (err) {
                console.error(err);
                message.error('Failed to load quiz details');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, apiCall]);

    if (loading) {
        return (
            <div style={{ background: '#fafafa', minHeight: '100%', position: 'relative' }}>
                {/* Fixed Custom Close Button matching loaded state */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 10,
                    background: 'rgba(250, 250, 250, 0.9)',
                    backdropFilter: 'blur(8px)',
                    padding: '16px 32px',
                    display: 'flex', justifyContent: 'flex-end',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
                }}>
                    <Button 
                        icon={<CloseOutlined />} 
                        type="text" 
                        onClick={onClose}
                        style={{
                            width: 40, height: 40, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#f1f5f9', color: '#64748b', fontSize: 16,
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: 'none',
                        }}
                    />
                </div>
                
                {/* Skeleton mock layout matching loaded structure */}
                <div>
                    <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '48px 48px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
                            <Skeleton.Input active size="small" style={{ width: 120, height: 26, borderRadius: 16, marginBottom: 16 }} />
                            <br />
                            <Skeleton.Input active style={{ width: '60%', height: 40, borderRadius: 6 }} />
                            <br />
                            <Skeleton.Input active style={{ width: '80%', height: 20, borderRadius: 4, marginTop: 16 }} />
                            
                            <Row gutter={24} style={{ marginTop: 40 }}>
                                <Col><Skeleton.Button active style={{ width: 150, height: 60, borderRadius: 12 }} /></Col>
                                <Col><Skeleton.Button active style={{ width: 150, height: 60, borderRadius: 12 }} /></Col>
                                <Col><Skeleton.Button active style={{ width: 150, height: 60, borderRadius: 12 }} /></Col>
                            </Row>
                        </div>
                    </div>
                    
                    <div style={{ padding: '40px 48px' }}>
                        <Row gutter={32}>
                            <Col span={16}>
                                <Skeleton active title={{ width: 200 }} paragraph={{ rows: 3 }} />
                                <div style={{ marginTop: 32 }}>
                                    <Skeleton active title={{ width: 250 }} paragraph={{ rows: 8 }} />
                                </div>
                            </Col>
                            <Col span={8}>
                                <Skeleton.Button active block style={{ height: 250, borderRadius: 16 }} />
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return <Empty description="Quiz details unavailable" />;
    }

    return (
        <div style={{ background: '#fafafa', minHeight: '100%', position: 'relative' }}>
            {/* Custom Sticky Header with Close Button */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'rgba(250, 250, 250, 0.9)',
                backdropFilter: 'blur(8px)',
                padding: '16px 32px',
                display: 'flex', justifyContent: 'flex-end',
                borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
            }}>
                <Tooltip title="Close">
                    <Button 
                        icon={<CloseOutlined />} 
                        type="text" 
                        onClick={onClose}
                        style={{
                            width: 40, height: 40, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: '#f1f5f9', color: '#64748b', fontSize: 16,
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: 'none',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#64748b';
                            e.currentTarget.style.transform = 'none';
                        }}
                    />
                </Tooltip>
            </div>

            <div style={{ padding: '8px 32px 32px 32px' }}>
                {/* Premium Header Section */}
                <div style={{ 
                    marginBottom: 32, 
                    padding: '32px', 
                    borderRadius: 24, 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 300 }}>
                                <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: 32, letterSpacing: '-0.5px' }}>
                                    {quiz.title}
                                </Title>
                                {quiz.description && (
                                    <Paragraph style={{ color: '#475569', fontSize: '15px', marginTop: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', maxWidth: 800 }}>
                                        {quiz.description}
                                    </Paragraph>
                                )}
                                <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {quiz.batches?.map((b, i) => (
                                        <Tag key={i} style={{ 
                                            borderRadius: '20px', padding: '6px 16px', fontWeight: 600, fontSize: 13,
                                            background: '#e0e7ff', color: '#4338ca', border: 'none'
                                        }}>
                                            {b.name}
                                        </Tag>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Professional Availability Block */}
                            {(quiz.start_date || quiz.end_date) && (
                                <div style={{ 
                                    background: '#fff', 
                                    padding: '20px 24px', 
                                    borderRadius: 16, 
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 16,
                                    minWidth: 260
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CalendarOutlined style={{ fontSize: 16 }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Available From</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                                {quiz.start_date ? dayjs(quiz.start_date).format('MMM D, YYYY • HH:mm') : 'Now'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ height: 1, background: '#f1f5f9', width: '100%' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ClockCircleOutlined style={{ fontSize: 16 }} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Deadline</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                                                {quiz.end_date ? dayjs(quiz.end_date).format('MMM D, YYYY • HH:mm') : 'No Limit'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid - Exactly 4 Items */}
                <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
                    <Col xs={12} sm={6}>
                        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                <BookOutlined />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Questions</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{quiz.questions?.length || 0}</div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                <ClockCircleOutlined />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{quiz.duration_minutes} <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>min</span></div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                <TrophyOutlined />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Marks</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{quiz.total_marks ?? '—'}</div>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                <MenuOutlined />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Randomize</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginTop: 4 }}>
                                    {quiz.randomize_questions ? 'Questions' : 'None'}
                                    {quiz.randomize_questions && quiz.randomize_options ? ' & Options' : quiz.randomize_options ? 'Options' : ''}
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

            {/* Questions List */}
            <Title level={4} style={{ marginBottom: 20, color: '#1e293b' }}>Questions Overview</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {quiz.questions?.map((q, idx) => (
                    <div key={idx} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ flex: 1, paddingRight: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <span style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', fontSize: 13 }}>
                                        Question {idx + 1}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                                        {q.question_type === 'yes_no' ? 'True / False' : q.question_type === 'mcq_multiple' ? 'Multiple Choice (Multiple)' : 'Multiple Choice'}
                                    </span>
                                </div>
                                <Text style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', whiteSpace: 'pre-wrap' }}>
                                    {q.question_text}
                                </Text>
                            </div>
                            <div style={{ background: '#f8fafc', color: '#334155', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', fontSize: 14, border: '1px solid #e2e8f0' }}>
                                {q.marks} {q.marks === 1 ? 'pt' : 'pts'}
                            </div>
                        </div>

                        {/* Audio Player if applicable */}
                        {q.audio_clip_id && (
                            <div style={{ marginBottom: 16, maxWidth: 400 }}>
                                <TeacherAudioPlayer clipId={q.audio_clip_id} />
                            </div>
                        )}

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            {q.question_type === 'yes_no' ? (
                                <div style={{ display: 'flex', gap: 16 }}>
                                    {['yes', 'no'].map((ans) => {
                                        const isCorrect = q.correct_answer === ans;
                                        return (
                                            <div key={ans} style={{
                                                flex: 1, padding: '12px 16px', borderRadius: '10px',
                                                border: `2px solid ${isCorrect ? '#22c55e' : '#f1f5f9'}`,
                                                background: isCorrect ? '#f0fdf4' : '#fff',
                                                display: 'flex', alignItems: 'center',
                                            }}>
                                                {isCorrect && <CheckCircleOutlined style={{ color: '#22c55e', marginRight: 8, fontSize: 16 }} />}
                                                <span style={{ color: isCorrect ? '#166534' : '#64748b', fontWeight: isCorrect ? 600 : 500, fontSize: 15 }}>
                                                    {ans === 'yes' ? 'Oui' : 'Non'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                q.options?.map((opt, i) => {
                                    const letter = String.fromCharCode(65 + i);
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '12px 16px', borderRadius: '10px',
                                            border: `2px solid ${opt.is_correct ? '#22c55e' : '#f1f5f9'}`,
                                            background: opt.is_correct ? '#f0fdf4' : '#fff',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '6px',
                                                background: opt.is_correct ? '#22c55e' : '#e2e8f0',
                                                color: opt.is_correct ? '#fff' : '#64748b',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 800, fontSize: 14, flexShrink: 0
                                            }}>
                                                {opt.is_correct ? <CheckCircleOutlined /> : letter}
                                            </div>
                                            <span style={{ color: opt.is_correct ? '#166534' : '#334155', fontWeight: opt.is_correct ? 600 : 400, fontSize: 15 }}>
                                                {opt.option_text}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
};

export default QuizDetails;
