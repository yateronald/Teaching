import React, { useState, useEffect } from 'react';
import {
    Card, Button, Select, Input, Space, Typography, Row, Col,
    message, Alert, Divider, Tooltip, Tag, Spin
} from 'antd';
import {
    RobotOutlined, ThunderboltOutlined, InfoCircleOutlined,
    CheckCircleOutlined, BulbOutlined, ExperimentOutlined,
    SendOutlined, ReloadOutlined
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
            // Adjust multiple choice to compensate, keeping yes/no if possible
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
        <div>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 16,
                padding: '24px 28px',
                marginBottom: 24,
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: -20, right: -20,
                    width: 120, height: 120,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: -30, right: 60,
                    width: 80, height: 80,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '50%'
                }} />
                <Space align="center" size={16}>
                    <div style={{
                        width: 52, height: 52,
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26
                    }}>
                        <RobotOutlined />
                    </div>
                    <div>
                        <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                            AI Quiz Generator
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                            Describe your quiz and let AI create the questions for you
                        </Text>
                    </div>
                </Space>
            </div>

            {/* Parameters Section */}
            <Card
                size="small"
                style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}
                styles={{ body: { padding: '20px 24px' } }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                    <ExperimentOutlined style={{ color: '#7c3aed', fontSize: 18 }} />
                    <Text strong style={{ fontSize: 15, color: '#1a1a2e' }}>Quiz Parameters</Text>
                </div>

                <Row gutter={[16, 16]}>
                    {/* Total Questions */}
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TOTAL QUESTIONS</Text>
                        </div>
                        <Select
                            value={totalQuestions}
                            onChange={setTotalQuestions}
                            style={{ width: '100%' }}
                            size="large"
                            options={QUESTION_COUNT_OPTIONS.map(n => ({ value: n, label: `${n} questions` }))}
                        />
                    </Col>

                    {/* Total Points */}
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TOTAL POINTS</Text>
                        </div>
                        <Select
                            value={totalPoints}
                            onChange={setTotalPoints}
                            style={{ width: '100%' }}
                            size="large"
                            options={POINT_OPTIONS.map(n => ({ value: n, label: `${n} points` }))}
                        />
                    </Col>

                    {/* Distribution info */}
                    <Col xs={24} md={8}>
                        <div style={{ marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                                DISTRIBUTION
                                <Tooltip title="AI will distribute points based on question difficulty">
                                    <InfoCircleOutlined style={{ marginLeft: 6, color: '#94a3b8' }} />
                                </Tooltip>
                            </Text>
                        </div>
                        <div style={{
                            height: 40,
                            display: 'flex', alignItems: 'center',
                            padding: '0 12px',
                            background: isValid ? '#f0fdf4' : '#fef2f2',
                            borderRadius: 8,
                            border: `1px solid ${isValid ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {isValid ? (
                                <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                                    <CheckCircleOutlined style={{ marginRight: 6 }} />
                                    ≈ {(totalPoints / totalQuestions).toFixed(1)} pts/question avg
                                </Text>
                            ) : (
                                <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                                    {countsDiff > 0 ? `${countsDiff} extra` : `${Math.abs(countsDiff)} missing`} questions
                                </Text>
                            )}
                        </div>
                    </Col>
                </Row>

                <Divider style={{ margin: '18px 0' }} />

                {/* Question Type Breakdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <Text style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>QUESTION TYPE BREAKDOWN</Text>
                    {!isValid && (
                        <Tag color="red" style={{ fontSize: 11, borderRadius: 6 }}>
                            Sum must equal {totalQuestions}
                        </Tag>
                    )}
                </div>

                <Row gutter={[16, 12]}>
                    <Col xs={24} sm={8}>
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid #dbeafe',
                            background: '#eff6ff',
                            transition: 'border-color 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Tag color="blue" style={{ borderRadius: 6, margin: 0, fontWeight: 600, fontSize: 12 }}>
                                    Single Choice
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 11 }}>mcq_single</Text>
                            </div>
                            <Select
                                value={singleChoiceCount}
                                onChange={(v) => handleCountChange('single', v)}
                                style={{ width: '100%' }}
                                options={countOptions}
                            />
                        </div>
                    </Col>

                    <Col xs={24} sm={8}>
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid #cffafe',
                            background: '#ecfeff',
                            transition: 'border-color 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Tag color="cyan" style={{ borderRadius: 6, margin: 0, fontWeight: 600, fontSize: 12 }}>
                                    Multiple Choice
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 11 }}>mcq_multiple</Text>
                            </div>
                            <Select
                                value={multipleChoiceCount}
                                onChange={(v) => handleCountChange('multiple', v)}
                                style={{ width: '100%' }}
                                options={countOptions}
                            />
                        </div>
                    </Col>

                    <Col xs={24} sm={8}>
                        <div style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: '2px solid #fef3c7',
                            background: '#fffbeb',
                            transition: 'border-color 0.2s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <Tag color="orange" style={{ borderRadius: 6, margin: 0, fontWeight: 600, fontSize: 12 }}>
                                    True / False
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 11 }}>yes_no</Text>
                            </div>
                            <Select
                                value={yesNoCount}
                                onChange={(v) => handleCountChange('yesno', v)}
                                style={{ width: '100%' }}
                                options={countOptions}
                            />
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Prompt Section */}
            <Card
                size="small"
                style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}
                styles={{ body: { padding: '20px 24px' } }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BulbOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
                        <Text strong style={{ fontSize: 15, color: '#1a1a2e' }}>Your Instructions</Text>
                    </div>
                    <Button
                        type="link"
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={insertSuggestion}
                        style={{ fontSize: 12 }}
                    >
                        Try a suggestion
                    </Button>
                </div>

                <TextArea
                    value={userPrompt}
                    onChange={e => setUserPrompt(e.target.value)}
                    placeholder="E.g.: Create a quiz about French passé composé with irregular verbs for B1 level students. Focus on être and avoir auxiliaries, agreement rules, and common irregular past participles."
                    autoSize={{ minRows: 3, maxRows: 6 }}
                    style={{
                        borderRadius: 10,
                        fontSize: 14,
                        border: '2px solid #e2e8f0',
                        padding: '12px 14px',
                    }}
                    maxLength={1000}
                    showCount
                />

                <div style={{ marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        💡 Tip: Be specific about the French level (A1–C2), grammar topics, vocabulary themes, or skills you want to test.
                        Leave empty for a general French quiz.
                    </Text>
                </div>
            </Card>

            {/* Error */}
            {error && (
                <Alert
                    type="error"
                    message="Generation Failed"
                    description={error}
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 20, borderRadius: 12 }}
                />
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button
                    onClick={onCancel}
                    disabled={generating}
                    style={{ borderRadius: 10, height: 44, minWidth: 100 }}
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
                        borderRadius: 10,
                        height: 44,
                        minWidth: 200,
                        fontWeight: 700,
                        fontSize: 15,
                        background: isValid ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                        border: 'none',
                    }}
                >
                    {generating ? 'Generating with AI...' : 'Generate Quiz ✨'}
                </Button>
            </div>

            {/* Loading overlay */}
            {generating && (
                <div style={{
                    marginTop: 20,
                    padding: '32px 24px',
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                    borderRadius: 14,
                    textAlign: 'center',
                    border: '2px solid #ddd6fe'
                }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text strong style={{ fontSize: 16, color: '#5b21b6', display: 'block' }}>
                            AI is crafting your quiz...
                        </Text>
                        <Text style={{ color: '#7c3aed', fontSize: 13 }}>
                            Generating {totalQuestions} questions ({totalPoints} points) — this may take 10–20 seconds
                        </Text>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIQuizGenerator;
