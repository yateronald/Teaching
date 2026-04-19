import React, { useState, useEffect } from 'react';
import {
    Button, Select, Input, Space, Typography, Row, Col,
    message, Alert, Divider, Tooltip, Tag, Spin
} from 'antd';
import {
    RobotOutlined, ThunderboltOutlined, InfoCircleOutlined,
    CheckCircleOutlined, BulbOutlined, ExperimentOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface QuestionOption {
    option_text: string;
    is_correct: boolean;
}

interface GeneratedQuestion {
    question_text: string;
    question_type: 'mcq_single' | 'mcq_multiple' | 'yes_no';
    marks: number;
    correct_answer?: string;
    explanation?: string;
    options?: QuestionOption[];
}

interface AIQuizGeneratorProps {
    onQuestionsGenerated: (questions: GeneratedQuestion[], title: string, description: string) => void;
    onCancel: () => void;
}

const QUESTION_COUNT_OPTIONS = [3, 5, 8, 10, 15, 20, 25, 30];
const POINT_OPTIONS = [10, 15, 20, 25, 30, 40, 50, 75, 100];

const PROMPT_SUGGESTIONS = [
    "Create a quiz about French passé composé with irregular verbs for B1 level students",
    "Generate questions on French vocabulary about food, cooking, and restaurants for A2 level",
    "Make a quiz testing knowledge of French subjunctive mood for B2 level",
    "Create questions about French articles (le, la, les, un, une, des) for A1 beginners",
    "Generate a quiz on French conditional tense and hypothetical expressions for B2",
    "Create questions testing French pronunciation rules and phonetics for A2 level",
    "Make a quiz about French culture, traditions and geography for intermediate learners",
    "Generate questions on French negation forms (ne...pas, ne...jamais, ne...rien) for A2",
];

const AIQuizGenerator: React.FC<AIQuizGeneratorProps> = ({ onQuestionsGenerated, onCancel }) => {
    const { apiCall } = useAuth();

    // Parameters
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [singleChoiceCount, setSingleChoiceCount] = useState(5);
    const [multipleChoiceCount, setMultipleChoiceCount] = useState(3);
    const [yesNoCount, setYesNoCount] = useState(2);
    const [totalPoints, setTotalPoints] = useState(20);
    const [userPrompt, setUserPrompt] = useState('');

    // State
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-adjust counts when total changes
    useEffect(() => {
        // Distribute questions proportionally when total changes
        const sc = Math.round(totalQuestions * 0.5);
        const mc = Math.round(totalQuestions * 0.3);
        const yn = totalQuestions - sc - mc;
        setSingleChoiceCount(sc);
        setMultipleChoiceCount(mc);
        setYesNoCount(yn);
    }, [totalQuestions]);

    // Validate that counts add up
    const countsSum = singleChoiceCount + multipleChoiceCount + yesNoCount;
    const isValid = countsSum === totalQuestions && totalQuestions > 0 && totalPoints > 0;
    const countsDiff = countsSum - totalQuestions;

    // Smart re-balance handler
    const handleCountChange = (type: 'single' | 'multiple' | 'yesno', value: number) => {
        const maxAllowed = totalQuestions;
        const clampedValue = Math.min(Math.max(0, value), maxAllowed);

        if (type === 'single') {
            setSingleChoiceCount(clampedValue);
            const remaining = totalQuestions - clampedValue - yesNoCount;
            if (remaining >= 0) {
                setMultipleChoiceCount(remaining);
            } else {
                setMultipleChoiceCount(0);
                setYesNoCount(totalQuestions - clampedValue);
            }
        } else if (type === 'multiple') {
            setMultipleChoiceCount(clampedValue);
            const remaining = totalQuestions - singleChoiceCount - clampedValue;
            if (remaining >= 0) {
                setYesNoCount(remaining);
            } else {
                setYesNoCount(0);
                setSingleChoiceCount(totalQuestions - clampedValue);
            }
        } else {
            setYesNoCount(clampedValue);
            const remaining = totalQuestions - singleChoiceCount - clampedValue;
            if (remaining >= 0) {
                setMultipleChoiceCount(remaining);
            } else {
                setMultipleChoiceCount(0);
                setSingleChoiceCount(totalQuestions - clampedValue);
            }
        }
    };

    // Generate quiz
    const handleGenerate = async () => {
        if (!isValid) {
            message.error('Please fix the question count distribution first');
            return;
        }

        setGenerating(true);
        setError(null);

        try {
            const resp = await apiCall('/quizzes/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalQuestions,
                    singleChoiceCount,
                    multipleChoiceCount,
                    yesNoCount,
                    totalPoints,
                    userPrompt: userPrompt.trim()
                })
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => null);
                throw new Error(err?.error || 'Failed to generate quiz');
            }

            const data = await resp.json();
            message.success(`✨ Generated ${data.questions.length} questions successfully!`);
            onQuestionsGenerated(data.questions, data.title, data.description);

        } catch (err: any) {
            const msg = err?.message || 'Failed to generate quiz. Please try again.';
            setError(msg);
            message.error(msg);
        } finally {
            setGenerating(false);
        }
    };

    // Random suggestion
    const insertSuggestion = () => {
        const suggestion = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
        setUserPrompt(suggestion);
    };

    // Build dropdown options for question type counts (0 to totalQuestions)
    const countOptions = Array.from({ length: totalQuestions + 1 }, (_, i) => ({
        value: i,
        label: `${i}`
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {/* Sticky Gradient Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 0,
                padding: '18px 24px',
                color: 'white',
                overflow: 'hidden',
                flexShrink: 0,
            }}>
                <div style={{
                    position: 'absolute', top: -20, right: -20,
                    width: 100, height: 100,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: -25, right: 60,
                    width: 70, height: 70,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '50%'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space align="center" size={14}>
                        <div style={{
                            width: 42, height: 42,
                            borderRadius: 12,
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20
                        }}>
                            <RobotOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: 18 }}>
                                AI Quiz Generator
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                                Describe your quiz and let AI create the questions for you
                            </Text>
                        </div>
                    </Space>
                    <button
                        onClick={onCancel}
                        style={{
                            width: 32, height: 32,
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: 16,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, padding: '20px 24px 0', overflowY: 'auto' }}>

                {/* Parameters Row - Compact */}
                <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <ExperimentOutlined style={{ color: '#7c3aed', fontSize: 16 }} />
                        <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Quiz Parameters</Text>
                    </div>

                    <Row gutter={12}>
                        <Col xs={24} sm={8}>
                            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>QUESTIONS</Text>
                            <Select
                                value={totalQuestions}
                                onChange={setTotalQuestions}
                                style={{ width: '100%' }}
                                options={QUESTION_COUNT_OPTIONS.map(n => ({ value: n, label: `${n} questions` }))}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>POINTS</Text>
                            <Select
                                value={totalPoints}
                                onChange={setTotalPoints}
                                style={{ width: '100%' }}
                                options={POINT_OPTIONS.map(n => ({ value: n, label: `${n} points` }))}
                            />
                        </Col>
                        <Col xs={24} sm={8}>
                            <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                                DISTRIBUTION
                                <Tooltip title="AI will distribute points based on question difficulty">
                                    <InfoCircleOutlined style={{ marginLeft: 4, color: '#94a3b8' }} />
                                </Tooltip>
                            </Text>
                            <div style={{
                                height: 32,
                                display: 'flex', alignItems: 'center',
                                padding: '0 10px',
                                background: isValid ? '#f0fdf4' : '#fef2f2',
                                borderRadius: 6,
                                border: `1px solid ${isValid ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                {isValid ? (
                                    <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: 600 }}>
                                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                                        ≈ {(totalPoints / totalQuestions).toFixed(1)} pts/q avg
                                    </Text>
                                ) : (
                                    <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>
                                        {countsDiff > 0 ? `${countsDiff} extra` : `${Math.abs(countsDiff)} missing`}
                                    </Text>
                                )}
                            </div>
                        </Col>
                    </Row>
                </div>

                <Divider style={{ margin: '0 0 16px' }} />

                {/* Question Type Breakdown - Compact */}
                <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TYPE BREAKDOWN</Text>
                        {!isValid && (
                            <Tag color="red" style={{ fontSize: 10, borderRadius: 4, lineHeight: '18px' }}>
                                Sum ≠ {totalQuestions}
                            </Tag>
                        )}
                    </div>

                    <Row gutter={10}>
                        {[
                            { label: 'Single Choice', key: 'single' as const, value: singleChoiceCount, color: '#3b82f6', bg: '#eff6ff', border: '#dbeafe' },
                            { label: 'Multiple Choice', key: 'multiple' as const, value: multipleChoiceCount, color: '#06b6d4', bg: '#ecfeff', border: '#cffafe' },
                            { label: 'True / False', key: 'yesno' as const, value: yesNoCount, color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' },
                        ].map(item => (
                            <Col xs={8} key={item.key}>
                                <div style={{
                                    padding: '10px 12px',
                                    borderRadius: 10,
                                    border: `1.5px solid ${item.border}`,
                                    background: item.bg,
                                }}>
                                    <Tag color={item.key === 'single' ? 'blue' : item.key === 'multiple' ? 'cyan' : 'orange'}
                                        style={{ borderRadius: 4, margin: '0 0 6px', fontWeight: 600, fontSize: 11 }}>
                                        {item.label}
                                    </Tag>
                                    <Select
                                        value={item.value}
                                        onChange={(v) => handleCountChange(item.key, v)}
                                        style={{ width: '100%' }}
                                        size="small"
                                        options={countOptions}
                                    />
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>

                <Divider style={{ margin: '0 0 16px' }} />

                {/* Prompt Section - Compact */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BulbOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
                            <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Your Instructions</Text>
                        </div>
                        <Button
                            type="link"
                            size="small"
                            icon={<ReloadOutlined />}
                            onClick={insertSuggestion}
                            style={{ fontSize: 11, padding: '0 4px' }}
                        >
                            Try a suggestion
                        </Button>
                    </div>

                    <TextArea
                        value={userPrompt}
                        onChange={e => setUserPrompt(e.target.value)}
                        placeholder="E.g.: Create a quiz about French passé composé with irregular verbs for B1 level students..."
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        style={{
                            borderRadius: 8,
                            fontSize: 13,
                            border: '1.5px solid #e2e8f0',
                            padding: '10px 12px',
                        }}
                        maxLength={1000}
                        showCount
                    />

                    <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
                        💡 Be specific about level, grammar topics, vocabulary themes, or skills to test.
                    </Text>
                </div>

                {/* Error */}
                {error && (
                    <Alert
                        type="error"
                        message="Generation Failed"
                        description={error}
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 16, borderRadius: 10 }}
                    />
                )}
            </div>

            {/* Fixed Bottom Actions */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                background: '#fff',
                borderTop: '1.5px solid #f0f0f0',
                padding: '12px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
                flexShrink: 0,
                zIndex: 10,
            }}>
                <Button
                    onClick={onCancel}
                    disabled={generating}
                    style={{ borderRadius: 8, height: 40, minWidth: 90, fontWeight: 500 }}
                >
                    Cancel
                </Button>
                <Button
                    type="primary"
                    onClick={handleGenerate}
                    loading={generating}
                    disabled={!isValid || generating}
                    icon={generating ? undefined : <ThunderboltOutlined />}
                    style={{
                        borderRadius: 8,
                        height: 40,
                        minWidth: 180,
                        fontWeight: 700,
                        fontSize: 14,
                        background: isValid ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                        border: 'none',
                    }}
                >
                    {generating ? 'Generating...' : 'Generate Quiz ✨'}
                </Button>
            </div>

            {/* Generating Overlay */}
            {generating && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    top: 80,
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 15,
                    borderRadius: '0 0 12px 12px',
                }}>
                    <div style={{
                        padding: '32px 40px',
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        borderRadius: 16,
                        textAlign: 'center',
                        border: '2px solid #ddd6fe',
                        boxShadow: '0 8px 32px rgba(124,58,237,0.12)',
                    }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 14 }}>
                            <Text strong style={{ fontSize: 15, color: '#5b21b6', display: 'block' }}>
                                AI is crafting your quiz...
                            </Text>
                            <Text style={{ color: '#7c3aed', fontSize: 12 }}>
                                {totalQuestions} questions · {totalPoints} points — ~10–20 seconds
                            </Text>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIQuizGenerator;
