import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Button, 
    Form, 
    Input, 
    Select, 
    InputNumber, 
    Space, 
    Typography, 
    Divider, 
    Row, 
    Col,
    message,
    Modal,
    List,
    Tag,
    Popconfirm,
    Alert,
    DatePicker,
    Checkbox,
    Switch,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    QuestionCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    MinusCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface QuestionOption {
    id?: number;
    option_text: string;
    is_correct: boolean;
}

interface Question {
    id?: number;
    question_text: string;
    question_type: 'mcq_single' | 'mcq_multiple' | 'yes_no';
    marks: number;
    options?: QuestionOption[];
    correct_answer?: string; // For yes_no questions
}

interface Quiz {
    id?: number;
    title: string;
    description: string;
    instructions?: string;
    batch_ids: number[];
    duration_minutes: number;
    start_date?: string;
    end_date?: string;
    randomize_questions: boolean;
    randomize_options: boolean;
    questions: Question[];
    status: 'draft' | 'published';
    total_marks?: number;
}

interface Batch {
    id: number;
    name: string;
    description?: string;
}

interface QuizBuilderProps {
    quizId?: string;
    onComplete?: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ quizId: propQuizId, onComplete }) => {
    const { quizId: paramQuizId } = useParams<{ quizId?: string }>();
    const navigate = useNavigate();
    const { apiCall, user } = useAuth();
    
    const quizId = propQuizId || paramQuizId;
    
    const [quiz, setQuiz] = useState<Quiz>({
        title: '',
        description: '',
        instructions: '',
        batch_ids: [],
        duration_minutes: 30,
        start_date: undefined,
        end_date: undefined,
        randomize_questions: false,
        randomize_options: false,
        questions: [],
        status: 'draft',
        total_marks: undefined
    });
    
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const [totalMarks, setTotalMarks] = useState<number | null>(null);
    const [equalizeMarks, setEqualizeMarks] = useState(false);
    
    const [quizForm] = Form.useForm();
    const [questionForm] = Form.useForm();

    useEffect(() => {
        if (user?.id) {
            fetchBatches();
        }
        if (quizId) {
            fetchQuiz();
        }
    }, [quizId, user?.id]);

    const fetchBatches = async () => {
        try {
            if (!user?.id) return;
            //const response = await apiCall(`/batches/teacher/${user.id}`);
            const response = await apiCall(`/batches/teacher/${user?.id}`)
            if (response.ok) {
                const data = await response.json();
                // Handle both possible shapes: raw array or wrapped in { data }
                const list: Batch[] = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.batches)
                            ? data.batches
                            : [];
                setBatches(list);
            }
        } catch (error) {
            message.error('Failed to fetch batches');
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await apiCall(`/quizzes/${quizId}`);
            if (response.ok) {
                const raw = await response.json();
                const q: any = raw?.data ?? raw;

                // Normalize quiz shape from backend to builder expectations
                const batchIds: number[] = Array.isArray(q?.batch_ids)
                    ? q.batch_ids
                    : Array.isArray(q?.batches)
                        ? q.batches.map((b: any) => b.id)
                        : [];

                const normalizedQuestions: Question[] = Array.isArray(q?.questions)
                    ? q.questions.map((quest: any) => ({
                        id: quest.id,
                        question_text: quest.question_text ?? '',
                        // Map legacy 'mcq' to 'mcq_single' for builder compatibility
                        question_type: (quest.question_type === 'mcq' ? 'mcq_single' : quest.question_type) as 'mcq_single' | 'mcq_multiple' | 'yes_no',
                        marks: Number(quest.marks ?? quest.points ?? 1),
                        // Backend GET may omit is_correct; default to false if missing, but try to infer from correct_answer
                        options: Array.isArray(quest.options)
                            ? quest.options.map((opt: any) => {
                                const hasFlag = typeof opt.is_correct === 'boolean' || typeof opt.is_correct === 'number';
                                let inferred = false;
                                if (!hasFlag && quest) {
                                    const ca = quest.correct_answer;
                                    if (Array.isArray(ca)) {
                                        // Some older data might store correct_answer as array of strings
                                        inferred = ca.includes(opt.option_text) || ca.includes(opt.id);
                                    } else if (typeof ca === 'string') {
                                        inferred = ca === opt.option_text;
                                    }
                                }
                                return {
                                    id: opt.id,
                                    option_text: opt.option_text,
                                    is_correct: hasFlag ? Boolean(opt.is_correct) : inferred
                                } as QuestionOption;
                              })
                            : [] as QuestionOption[],
                        correct_answer: quest.correct_answer
                    }))
                    : [];

                const normalized: Quiz = {
                    id: q.id,
                    title: q.title ?? '',
                    description: q.description ?? '',
                    instructions: q.instructions ?? '',
                    batch_ids: batchIds,
                    duration_minutes: q.duration_minutes ?? 30,
                    start_date: q.start_date,
                    end_date: q.end_date,
                    randomize_questions: Boolean(q.randomize_questions),
                    randomize_options: Boolean(q.randomize_options),
                    questions: normalizedQuestions,
                    status: (q.status ?? 'draft'),
                    total_marks: q.total_marks
                };

                setQuiz(normalized);
                setTotalMarks(typeof q.total_marks === 'number' ? q.total_marks : null);
                quizForm.setFieldsValue({
                    title: normalized.title,
                    description: normalized.description,
                    instructions: normalized.instructions,
                    batch_ids: normalized.batch_ids,
                    duration_minutes: normalized.duration_minutes,
                    quiz_dates: normalized.start_date && normalized.end_date ? [dayjs(normalized.start_date), dayjs(normalized.end_date)] : undefined,
                    randomize_questions: normalized.randomize_questions,
                    randomize_options: normalized.randomize_options,
                    total_marks: normalized.total_marks
                });
            } else {
                // Handle 4xx/5xx gracefully and navigate away to prevent render errors
                const errPayload = await response.json().catch(() => null);
                message.error(errPayload?.error || 'Failed to fetch quiz');
                navigate('/teacher-dashboard');
            }
        } catch (error) {
            message.error('Failed to fetch quiz');
            navigate('/teacher-dashboard');
        }
    };

    const handleQuizSave = async (values: any, publishNow: boolean = false) => {
        if (quiz.questions.length === 0) {
            message.error('Please add at least one question');
            return;
        }

        // Validate timing if dates are provided
        if (values.quiz_dates && values.quiz_dates.length === 2) {
            const [startDate, endDate] = values.quiz_dates;
            if (startDate.isAfter(endDate)) {
                message.error('Start date must be before end date');
                return;
            }
        }

        setLoading(true);
        try {
            // Apply equalization if enabled
            let questionsToSave = [...quiz.questions];
            if (equalizeMarks && totalMarks && quiz.questions.length > 0) {
                const marksPerQuestion = totalMarks / quiz.questions.length;
                questionsToSave = quiz.questions.map(q => ({
                    ...q,
                    marks: marksPerQuestion
                }));
            }

            // Build base payload without total_marks first
            const baseQuizData = {
                title: values.title,
                description: values.description,
                instructions: values.instructions || '',
                batch_ids: values.batch_ids,
                duration_minutes: values.duration_minutes,
                start_date: values.quiz_dates?.[0]?.toISOString(),
                end_date: values.quiz_dates?.[1]?.toISOString(),
                randomize_questions: values.randomize_questions || false,
                randomize_options: values.randomize_options || false,
                status: publishNow ? 'published' : 'draft',
                questions: questionsToSave.map(q => ({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    marks: q.marks,
                    correct_answer: q.correct_answer,
                    options: q.options || []
                }))
            } as any;

            // Only include total_marks if it is a valid number
            const tm = Number(totalMarks);
            if (!Number.isNaN(tm)) {
                baseQuizData.total_marks = tm;
            }

            const url = quizId ? `/quizzes/${quizId}` : '/quizzes';
            const method = quizId ? 'PUT' : 'POST';

            const response = await apiCall(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(baseQuizData)
            });

            if (!response.ok) {
                let errMsg = `Failed to ${quizId ? 'update' : 'create'} quiz`;
                try {
                    const err = await response.json();
                    if (err?.error) errMsg += `: ${err.error}`;
                    if (err?.details && Array.isArray(err.details) && err.details.length > 0) {
                        const first = err.details[0];
                        if (first?.msg) {
                            errMsg += ` (${first.msg}${first?.param ? `: ${first.param}` : ''})`;
                        }
                    }
                } catch (_) {
                    // ignore JSON parsing error
                }
                message.error(errMsg);
                return;
            }

            const data = await response.json();
            message.success(`Quiz ${quizId ? 'updated' : 'created'} successfully`);

            // If publishNow is requested, explicitly set status to published after save
            if (publishNow) {
                const newQuizId = quizId || data?.quiz?.id;
                if (newQuizId) {
                    const publishResp = await apiCall(`/quizzes/${newQuizId}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'published' })
                    });
                    if (!publishResp.ok) {
                        let pubErr = 'Quiz saved but failed to publish';
                        try {
                            const err = await publishResp.json();
                            if (err?.error) pubErr += `: ${err.error}`;
                        } catch {}
                        message.warning(pubErr);
                    }
                }
            }

            if (onComplete) {
                onComplete();
            } else {
                navigate('/teacher-dashboard');
            }
        } catch (error) {
            console.error('Quiz save error:', error);
            message.error(`Failed to ${quizId ? 'update' : 'create'} quiz`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setEditingIndex(-1);
        setQuestionModalVisible(true);
        questionForm.resetFields();
    };

    const handleEditQuestion = (question: Question, index: number) => {
        setEditingQuestion(question);
        setEditingIndex(index);
        setQuestionModalVisible(true);
        // Normalize legacy types and answers for the form
        const qt = question.question_type === 'mcq' ? 'mcq_single' : (question.question_type === 'boolean' ? 'yes_no' : question.question_type);
        const caNormalized = qt === 'yes_no'
            ? (question.correct_answer === 'true' ? 'yes' : question.correct_answer === 'false' ? 'no' : question.correct_answer)
            : question.correct_answer;
        questionForm.setFieldsValue({
            ...question,
            question_type: qt,
            correct_answer: caNormalized,
            options: (question.options || []).map((opt: any) => ({
                ...opt,
                is_correct: Boolean(opt?.is_correct)
            }))
        });
    };

    const handleQuestionSave = (values: any) => {
        // Validate question based on type
        if (values.question_type === 'mcq_single' || values.question_type === 'mcq_multiple') {
            if (!values.options || values.options.length < 2) {
                message.error('MCQ questions must have at least 2 options');
                return;
            }
            
            const correctOptions = values.options.filter((opt: QuestionOption) => opt.is_correct);
            if (values.question_type === 'mcq_single' && correctOptions.length !== 1) {
                message.error('Single choice MCQ must have exactly one correct answer');
                return;
            }
            if (values.question_type === 'mcq_multiple' && correctOptions.length === 0) {
                message.error('Multiple choice MCQ must have at least one correct answer');
                return;
            }
        }

        const newQuestion: Question = {
            question_text: values.question_text,
            question_type: values.question_type,
            marks: values.marks || 1,
            correct_answer:
              values.question_type === 'yes_no'
                ? values.correct_answer
                : values.question_type === 'mcq_single'
                ? values.options.find((opt: QuestionOption) => opt.is_correct)?.option_text
                : values.options
                    .filter((opt: QuestionOption) => opt.is_correct)
                    .map((opt: QuestionOption) => opt.option_text),
            options: values.options || [],
        };

        if (editingIndex >= 0) {
            // Edit existing question
            const updatedQuestions = [...quiz.questions];
            updatedQuestions[editingIndex] = newQuestion;
            setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
        } else {
            // Add new question
            setQuiz(prev => ({ 
                ...prev, 
                questions: [...prev.questions, newQuestion] 
            }));
        }

        setQuestionModalVisible(false);
        questionForm.resetFields();
        message.success(`Question ${editingIndex >= 0 ? 'updated' : 'added'} successfully`);
    };

    const handleDeleteQuestion = (index: number) => {
        const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
        setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
        message.success('Question deleted successfully');
    };

    const renderQuestionPreview = (question: Question, index: number) => {
        const getQuestionTypeColor = (type: string) => {
            switch (type) {
                case 'mcq_single': return 'blue';
                case 'mcq_multiple': return 'cyan';
                case 'yes_no': return 'orange';
                default: return 'default';
            }
        };

        const getQuestionTypeName = (type: string) => {
            switch (type) {
                case 'mcq_single': return 'Single Choice';
                case 'mcq_multiple': return 'Multiple Choice';
                case 'yes_no': return 'Yes/No';
                default: return type;
            }
        };

        return (
            <List.Item
                key={index}
                actions={[
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => handleEditQuestion(question, index)}
                    >
                        Edit
                    </Button>,
                    <Popconfirm
                        title="Are you sure you want to delete this question?"
                        onConfirm={() => handleDeleteQuestion(index)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                ]}
            >
                <List.Item.Meta
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Question {index + 1}</Text>
                            <Space>
                                <Tag color={getQuestionTypeColor(question.question_type)}>
                                    {getQuestionTypeName(question.question_type)}
                                </Tag>
                                <Tag color="purple">{question.marks} pts</Tag>
                            </Space>
                        </div>
                    }
                    description={
                        <div>
                            <Text>{question.question_text}</Text>
                            {(question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple') && question.options && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Options:</Text>
                                    <ul style={{ marginTop: 4, marginBottom: 0 }}>
                                        {question.options.map((option, optIndex) => (
                                            <li key={optIndex}>
                                                <Text 
                                                    type={option.is_correct ? 'success' : 'secondary'}
                                                    strong={option.is_correct}
                                                >
                                                    {option.option_text}
                                                    {option.is_correct && ' ✓'}
                                                </Text>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {question.question_type === 'yes_no' && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Correct Answer: </Text>
                                    <Text strong type="success">{question.correct_answer === 'yes' ? 'Yes' : 'No'}</Text>
                                </div>
                            )}
                            {question.question_type === 'boolean' && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Correct Answer: </Text>
                                    <Text strong type="success">{question.correct_answer === 'true' ? 'True' : 'False'}</Text>
                                </div>
                            )}
                        </div>
                    }
                />
            </List.Item>
        );
    };

    const OptionsInput: React.FC<{ value?: QuestionOption[]; onChange?: (value: QuestionOption[]) => void; allowMultiple?: boolean }> = ({ value = [], onChange, allowMultiple = false }) => {
        const [options, setOptions] = useState<QuestionOption[]>(value.length > 0 ? value : [{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);

        // Update local state when value prop changes (for editing existing questions)
        useEffect(() => {
            if (value && value.length > 0) {
                setOptions(value);
            } else {
                setOptions([{ option_text: '', is_correct: false }, { option_text: '', is_correct: false }]);
            }
        }, [value]);

        const handleOptionChange = (index: number, optionText: string) => {
            const newOptions = [...options];
            newOptions[index] = { ...newOptions[index], option_text: optionText };
            setOptions(newOptions);
            onChange?.(newOptions.filter(opt => opt.option_text.trim() !== ''));
        };

        const handleCorrectChange = (index: number, isCorrect: boolean) => {
            const newOptions = [...options];
            if (!allowMultiple && isCorrect) {
                // For single choice, uncheck all others
                newOptions.forEach((opt, i) => {
                    opt.is_correct = i === index;
                });
            } else {
                newOptions[index] = { ...newOptions[index], is_correct: isCorrect };
            }
            setOptions(newOptions);
            onChange?.(newOptions.filter(opt => opt.option_text.trim() !== ''));
        };

        const addOption = () => {
            const newOptions = [...options, { option_text: '', is_correct: false }];
            setOptions(newOptions);
        };

        const removeOption = (index: number) => {
            if (options.length > 2) {
                const newOptions = options.filter((_, i) => i !== index);
                setOptions(newOptions);
                onChange?.(newOptions.filter(opt => opt.option_text.trim() !== ''));
            }
        };

        return (
            <div>
                {options.map((option, index) => (
                    <div key={index} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                        <Checkbox
                            checked={option.is_correct}
                            onChange={(e) => handleCorrectChange(index, e.target.checked)}
                            style={{ marginRight: 8 }}
                        />
                        <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.option_text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        {options.length > 2 && (
                            <Button 
                                type="link" 
                                danger 
                                icon={<MinusCircleOutlined />}
                                onClick={() => removeOption(index)}
                            />
                        )}
                    </div>
                ))}
                <Button 
                    type="dashed" 
                    onClick={addOption}
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                >
                    Add Option
                </Button>
            </div>
        );
    };

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.marks, 0);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Title level={2}>
                {quizId ? 'Edit Quiz' : 'Create New Quiz'}
            </Title>

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    {/* Quiz Details Form */}
                    <Card title="Quiz Details" style={{ marginBottom: 24 }}>
                        <Form
                            form={quizForm}
                            layout="vertical"
                            onFinish={(values) => handleQuizSave(values, false)}
                            initialValues={{
                                title: quiz.title,
                                description: quiz.description,
                                instructions: quiz.instructions,
                                batch_ids: quiz.batch_ids,
                                duration_minutes: quiz.duration_minutes,
                                quiz_dates: quiz.start_date && quiz.end_date ? [dayjs(quiz.start_date), dayjs(quiz.end_date)] : undefined,
                                randomize_questions: quiz.randomize_questions,
                                randomize_options: quiz.randomize_options,
                                total_marks: quiz.total_marks
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="title"
                                        label="Quiz Title"
                                        rules={[{ required: true, message: 'Please enter quiz title' }]}
                                    >
                                        <Input placeholder="Enter quiz title" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: 'Please enter description' }]}
                            >
                                <TextArea rows={3} placeholder="Enter quiz description" />
                            </Form.Item>

                            <Form.Item
                                name="instructions"
                                label="Instructions for Students"
                            >
                                <TextArea rows={3} placeholder="Enter special instructions" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="batch_ids"
                                        label="Select Batches"
                                        rules={[{ required: true, message: 'Please select at least one batch' }]}
                                    >
                                        <Select 
                                            mode="multiple"
                                            placeholder="Select batches"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {batches.map(batch => (
                                                <Option key={batch.id} value={batch.id}>
                                                    {batch.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="duration_minutes"
                                        label={<span>Duration <Tooltip title="Time limit for completing the quiz"><InfoCircleOutlined /></Tooltip></span>}
                                        rules={[
                                            { required: true, message: 'Please enter duration' },
                                            { type: 'number', min: 1, message: 'Must be at least 1 minute' }
                                        ]}
                                    >
                                        <InputNumber 
                                            min={1} 
                                            max={600} 
                                            style={{ width: '100%' }}
                                            placeholder="Enter duration"
                                            addonAfter="minutes"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        name="quiz_dates"
                                        label={<span>Quiz Schedule <Tooltip title="When students can access and complete the quiz"><InfoCircleOutlined /></Tooltip></span>}
                                    >
                                        <RangePicker
                                            showTime
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder={['Start Date & Time', 'End Date & Time']}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="randomize_questions"
                                        valuePropName="checked"
                                    >
                                        <Checkbox>
                                            <span>Randomize Question Order <Tooltip title="Questions will appear in random order for each student"><InfoCircleOutlined /></Tooltip></span>
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="randomize_options"
                                        valuePropName="checked"
                                    >
                                        <Checkbox>
                                            <span>Randomize MCQ Options <Tooltip title="Answer options will appear in random order"><InfoCircleOutlined /></Tooltip></span>
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider>Scoring Options</Divider>
                            
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="total_marks"
                                        label={<span>Total Marks (Optional) <Tooltip title="Set total marks for the quiz. When combined with equalize option, marks will be distributed equally among questions"><InfoCircleOutlined /></Tooltip></span>}
                                    >
                                        <InputNumber 
                                            min={0} 
                                            step={0.5}
                                            style={{ width: '100%' }}
                                            placeholder="Enter total marks"
                                            value={totalMarks}
                                            onChange={(value) => setTotalMarks(value)}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="equalize_marks"
                                        valuePropName="checked"
                                    >
                                        <Checkbox
                                            checked={equalizeMarks}
                                            onChange={(e) => setEqualizeMarks(e.target.checked)}
                                            disabled={!totalMarks || quiz.questions.length === 0}
                                        >
                                            <span>Equalize Per-Question Marks <Tooltip title="Distribute total marks equally among all questions. Each question will get total_marks ÷ number_of_questions marks"><InfoCircleOutlined /></Tooltip></span>
                                        </Checkbox>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space>
                                    <Button onClick={() => navigate('/teacher-dashboard')}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        htmlType="submit" 
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                    >
                                        Save as Draft
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                        onClick={() => {
                                            quizForm.validateFields().then(values => {
                                                handleQuizSave(values, true);
                                            });
                                        }}
                                    >
                                        {quizId ? 'Update & Publish' : 'Save & Publish'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Questions List */}
                    <Card 
                        title="Questions" 
                        extra={
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestion}
                            >
                                Add Question
                            </Button>
                        }
                    >
                        {quiz.questions.length === 0 ? (
                            <Alert
                                message="No questions added yet"
                                description="Click 'Add Question' to start building your quiz."
                                type="info"
                                showIcon
                            />
                        ) : (
                            <List
                                itemLayout="vertical"
                                dataSource={quiz.questions}
                                renderItem={(question, index) => renderQuestionPreview(question, index)}
                            />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Quiz Summary */}
                    <Card title="Quiz Summary" style={{ position: 'sticky', top: 20 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Text type="secondary">Total Questions:</Text>
                                <br />
                                <Text strong style={{ fontSize: 18 }}>{quiz.questions.length}</Text>
                            </div>
                            
                            <div>
                                <Text type="secondary">Total Points:</Text>
                                <br />
                                <Text strong style={{ fontSize: 18 }}>{totalPoints}</Text>
                            </div>
                            
                            <div>
                                <Text type="secondary">Question Types:</Text>
                                <br />
                                <Space wrap>
                                    {['mcq_single', 'mcq_multiple', 'yes_no'].map((type) => {
                                        const count = quiz.questions.filter((q) => q.question_type === type).length;
                                        if (count > 0) {
                                            return (
                                                <Tag
                                                    key={type}
                                                    color={type === 'mcq_single' ? 'blue' : type === 'mcq_multiple' ? 'cyan' : 'orange'}
                                                >
                                                    {type === 'mcq_single'
                                                        ? 'Single Choice'
                                                        : type === 'mcq_multiple'
                                                        ? 'Multiple Choice'
                                                        : 'Yes/No'}: {count}
                                                </Tag>
                                            );
                                        }
                                        return null;
                                    })}
                                </Space>
                            </div>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Question Modal */}
            <Modal
                title={editingQuestion ? 'Edit Question' : 'Add New Question'}
                open={questionModalVisible}
                onCancel={() => {
                    setQuestionModalVisible(false);
                    questionForm.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form
                    form={questionForm}
                    layout="vertical"
                    onFinish={handleQuestionSave}
                >
                    <Form.Item
                        name="question_text"
                        label="Question Text"
                        rules={[{ required: true, message: 'Please enter question text' }]}
                    >
                        <TextArea rows={3} placeholder="Enter your question" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="question_type"
                                label="Question Type"
                                rules={[{ required: true, message: 'Please select question type' }]}
                            >
                                <Select placeholder="Select question type">
                                    <Option value="mcq_single">Multiple Choice (Single Answer)</Option>
                                    <Option value="mcq_multiple">Multiple Choice (Multiple Answers)</Option>
                                    <Option value="yes_no">Yes/No Question</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="marks"
                                label="Marks"
                                rules={[
                                    { required: true, message: 'Please enter marks' },
                                    { type: 'number', min: 1, message: 'Must be at least 1 mark' }
                                ]}
                            >
                                <InputNumber min={1} max={100} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => 
                            prevValues.question_type !== currentValues.question_type
                        }
                    >
                        {({ getFieldValue }) => {
                            const questionType = getFieldValue('question_type');
                            
                            if (questionType === 'mcq_single' || questionType === 'mcq_multiple') {
                                return (
                                    <Form.Item
                                        name="options"
                                        label="Answer Options"
                                        rules={[
                                            { required: true, message: 'Please add at least 2 options' },
                                            {
                                                validator: (_, value) => {
                                                    if (!value || value.length < 2) {
                                                        return Promise.reject('Please add at least 2 options');
                                                    }
                                                    const correctOptions = value.filter((opt: QuestionOption) => opt.is_correct);
                                                    if (questionType === 'mcq_single' && correctOptions.length !== 1) {
                                                        return Promise.reject('Single choice MCQ must have exactly one correct answer');
                                                    }
                                                    if (questionType === 'mcq_multiple' && correctOptions.length === 0) {
                                                        return Promise.reject('Multiple choice MCQ must have at least one correct answer');
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                    >
                                        <OptionsInput allowMultiple={questionType === 'mcq_multiple'} />
                                    </Form.Item>
                                );
                            }
                            
                            if (questionType === 'yes_no') {
                                return (
                                    <Form.Item
                                        name="correct_answer"
                                        label="Correct Answer"
                                        rules={[{ required: true, message: 'Please select correct answer' }]}
                                    >
                                        <Select placeholder="Select correct answer">
                                            <Option value="yes">Yes</Option>
                                            <Option value="no">No</Option>
                                        </Select>
                                    </Form.Item>
                                );
                            }
                            
                            return null;
                        }}
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setQuestionModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingQuestion ? 'Update Question' : 'Add Question'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuizBuilder;

// When building the payload to save, ensure MCQ includes options with is_correct booleans
const onSaveQuestion = async (values: any, question?: Question) => {
    // ... existing code ...
};