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
    Tag,
    Popconfirm,
    Alert,
    DatePicker,
    Checkbox,
    Tooltip,
    Collapse
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
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
    const [formResetKey, setFormResetKey] = useState(0);
    
    const [quizForm] = Form.useForm();
    const [questionForm] = Form.useForm();

    // Freeze editing when the quiz has ended
    const isEnded = Boolean(quiz?.end_date) && dayjs().isAfter(dayjs(quiz.end_date as string));

    useEffect(() => {
        if (user?.id) {
            fetchBatches();
        }
        if (quizId) {
            fetchQuiz();
        } else {
            // Reset form and state when creating a new quiz (no quizId)
            const emptyQuiz: Quiz = {
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
            };
            setQuiz(emptyQuiz);
            setTotalMarks(null);
            setEqualizeMarks(false);
            
            // Increment reset key to force form remount
            setFormResetKey(prev => prev + 1);
            
            // Force reset the forms
            quizForm.resetFields();
            quizForm.setFieldsValue({
                title: '',
                description: '',
                instructions: '',
                batch_ids: [],
                duration_minutes: 30,
                quiz_dates: undefined,
                randomize_questions: false,
                randomize_options: false,
                total_marks: undefined
            });
            questionForm.resetFields();
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
        if (isEnded) {
            message.warning('This quiz has ended. Editing is locked.');
            return;
        }
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
                    // Only send correct_answer for yes/no questions. For MCQs, backend derives correctness from options.
                    correct_answer: q.question_type === 'yes_no' ? (q as any).correct_answer : undefined,
                    // Send only the fields the backend expects for options
                    options: (q.options || []).map((opt: any) => ({
                        option_text: opt.option_text,
                        is_correct: !!opt.is_correct,
                    })),
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
        if (isEnded) {
            message.warning('This quiz has ended. You cannot add questions.');
            return;
        }
        setEditingQuestion(null);
        setEditingIndex(-1);
        setQuestionModalVisible(true);
        questionForm.resetFields();
    };

    const handleEditQuestion = (question: Question, index: number) => {
        if (isEnded) {
            message.warning('This quiz has ended. You cannot edit questions.');
            return;
        }
        setEditingQuestion(question);
        setEditingIndex(index);
        setQuestionModalVisible(true);
        // Normalize legacy types and answers for the form
        const qt = (question.question_type as any) === 'mcq' ? 'mcq_single' : ((question.question_type as any) === 'boolean' ? 'yes_no' : question.question_type);
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
        if (isEnded) {
            message.warning('This quiz has ended. Editing is locked.');
            return;
        }
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
        if (isEnded) {
            message.warning('This quiz has ended. You cannot delete questions.');
            return;
        }
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

        const header = (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '4px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{
                        backgroundColor: '#1890ff',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '14px',
                        flexShrink: 0
                    }}>
                        {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                            strong
                            style={{
                                fontSize: '15px',
                                color: '#1a1a1a',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {question.question_text}
                        </Text>
                    </div>
                    <Space size={8} style={{ flexShrink: 0, marginLeft: 12 }}>
                        <Tag
                            color={getQuestionTypeColor(question.question_type)}
                            style={{
                                margin: 0,
                                padding: '4px 12px',
                                fontSize: '12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}
                        >
                            {getQuestionTypeName(question.question_type)}
                        </Tag>
                        <Tag
                            color="purple"
                            style={{
                                margin: 0,
                                padding: '4px 12px',
                                fontSize: '12px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}
                        >
                            {question.marks} pts
                        </Tag>
                    </Space>
                </div>
                <Space size={8} style={{ marginLeft: 16, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditQuestion(question, index);
                        }}
                        disabled={isEnded}
                        size="small"
                        style={{ borderRadius: '6px' }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Delete Question?"
                        description="Are you sure you want to delete this question?"
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteQuestion(index);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Yes"
                        cancelText="No"
                        disabled={isEnded}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            disabled={isEnded}
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                            style={{ borderRadius: '6px' }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            </div>
        );

        return (
            <Collapse.Panel
                key={index}
                header={header}
                style={{
                    marginBottom: 12,
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    overflow: 'hidden'
                }}
            >
                <div style={{ padding: '12px 0' }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: '15px', color: '#1a1a1a', display: 'block' }}>
                            {question.question_text}
                        </Text>
                    </div>
                    
                    {(question.question_type === 'mcq_single' || question.question_type === 'mcq_multiple') && question.options && (
                        <div style={{
                            marginTop: 16,
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #e8e8e8'
                        }}>
                            <Text type="secondary" style={{ fontSize: '13px', fontWeight: '600', marginBottom: 12, display: 'block' }}>
                                Answer Options:
                            </Text>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {question.options.map((option, optIndex) => (
                                    <div
                                        key={optIndex}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px 14px',
                                            backgroundColor: option.is_correct ? '#f6ffed' : 'white',
                                            border: `2px solid ${option.is_correct ? '#52c41a' : '#e8e8e8'}`,
                                            borderRadius: '6px'
                                        }}
                                    >
                                        <span style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            backgroundColor: option.is_correct ? '#52c41a' : '#d9d9d9',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            flexShrink: 0
                                        }}>
                                            {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <Text
                                            style={{
                                                color: option.is_correct ? '#52c41a' : '#1a1a1a',
                                                fontWeight: option.is_correct ? '600' : '400',
                                                fontSize: '14px',
                                                flex: 1
                                            }}
                                        >
                                            {option.option_text}
                                            {option.is_correct && <span style={{ marginLeft: 8 }}>✓</span>}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {question.question_type === 'yes_no' && (
                        <div style={{
                            marginTop: 16,
                            backgroundColor: '#f6ffed',
                            padding: '14px 16px',
                            borderRadius: '8px',
                            border: '2px solid #b7eb8f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <Text type="secondary" style={{ fontSize: '14px', fontWeight: '500' }}>Correct Answer:</Text>
                            <Tag color="success" style={{ fontSize: '14px', padding: '4px 16px', borderRadius: '6px', fontWeight: '600', margin: 0 }}>
                                {question.correct_answer === 'yes' ? '✓ Yes' : '✗ No'}
                            </Tag>
                        </div>
                    )}
                    
                    {(question.question_type as any) === 'boolean' && (
                        <div style={{
                            marginTop: 16,
                            backgroundColor: '#f6ffed',
                            padding: '14px 16px',
                            borderRadius: '8px',
                            border: '2px solid #b7eb8f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <Text type="secondary" style={{ fontSize: '14px', fontWeight: '500' }}>Correct Answer:</Text>
                            <Tag color="success" style={{ fontSize: '14px', padding: '4px 16px', borderRadius: '6px', fontWeight: '600', margin: 0 }}>
                                {question.correct_answer === 'true' ? 'True' : 'False'}
                            </Tag>
                        </div>
                    )}
                </div>
            </Collapse.Panel>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {options.map((option, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px',
                            backgroundColor: option.is_correct ? '#f6ffed' : 'white',
                            border: `2px solid ${option.is_correct ? '#52c41a' : '#d9d9d9'}`,
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: option.is_correct ? '#52c41a' : '#f0f0f0',
                            color: option.is_correct ? 'white' : '#666',
                            fontWeight: '600',
                            fontSize: '13px',
                            flexShrink: 0
                        }}>
                            {String.fromCharCode(65 + index)}
                        </div>
                        <Checkbox
                            checked={option.is_correct}
                            onChange={(e) => handleCorrectChange(index, e.target.checked)}
                            style={{
                                flexShrink: 0,
                                transform: 'scale(1.1)'
                            }}
                        />
                        <Input
                            placeholder={`Enter option ${index + 1}...`}
                            value={option.option_text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            style={{
                                flex: 1,
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                fontSize: '14px',
                                fontWeight: option.is_correct ? '600' : '400'
                            }}
                            size="large"
                        />
                        {options.length > 2 && (
                            <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined style={{ fontSize: '18px' }} />}
                                onClick={() => removeOption(index)}
                                style={{
                                    flexShrink: 0,
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px'
                                }}
                            />
                        )}
                    </div>
                ))}
                <Button
                    type="dashed"
                    onClick={addOption}
                    icon={<PlusOutlined />}
                    style={{
                        width: '100%',
                        height: '44px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginTop: '8px'
                    }}
                    size="large"
                >
                    Add Another Option
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

            {isEnded && (
                <Alert
                    type="warning"
                    message="This quiz has ended. Editing is frozen."
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    {/* Quiz Details Form */}
                    <Card title="Quiz Details" style={{ marginBottom: 24 }}>
                        <Form
                            key={quizId ? `edit-${quizId}` : `new-${formResetKey}`}
                            form={quizForm}
                            layout="vertical"
                            onFinish={(values) => handleQuizSave(values, false)}
                            disabled={isEnded}
                            initialValues={{
                                title: '',
                                description: '',
                                instructions: '',
                                batch_ids: [],
                                duration_minutes: 30,
                                quiz_dates: undefined,
                                randomize_questions: false,
                                randomize_options: false,
                                total_marks: undefined
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
                                        disabled={isEnded}
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
                                        disabled={isEnded}
                                    >
                                        {quizId ? 'Update & Publish' : 'Save & Publish'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Questions List */}
                    <Card
                        title={
                            <span style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '600' }}>
                                📝 Questions ({quiz.questions.length})
                            </span>
                        }
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestion}
                                disabled={isEnded}
                                style={{
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                    height: '36px'
                                }}
                            >
                                Add Question
                            </Button>
                        }
                        style={{
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #e8e8e8'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        {quiz.questions.length === 0 ? (
                            <Alert
                                message="No questions added yet"
                                description="Click 'Add Question' to start building your quiz."
                                type="info"
                                showIcon
                                style={{ borderRadius: '6px' }}
                            />
                        ) : (
                            <Collapse
                                accordion
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none'
                                }}
                                expandIconPosition="end"
                            >
                                {quiz.questions.map((question, index) => renderQuestionPreview(question, index))}
                            </Collapse>
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
                title={
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        padding: '4px 0'
                    }}>
                        {editingQuestion ? '✏️ Edit Question' : '➕ Add New Question'}
                    </div>
                }
                open={questionModalVisible}
                onCancel={() => {
                    setQuestionModalVisible(false);
                    questionForm.resetFields();
                }}
                footer={null}
                width={700}
                centered
                style={{ top: 20 }}
                bodyStyle={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    padding: '24px'
                }}
            >
                <Form
                    key={editingIndex >= 0 ? `edit-${editingIndex}` : 'new-question'}
                    form={questionForm}
                    layout="vertical"
                    onFinish={handleQuestionSave}
                >
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: 20,
                        border: '1px solid #e8e8e8'
                    }}>
                        <Form.Item
                            name="question_text"
                            label={<span style={{ color: '#1a1a1a', fontWeight: '600', fontSize: '14px' }}>Question Text</span>}
                            rules={[{ required: true, message: 'Please enter question text' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <TextArea
                                rows={3}
                                placeholder="Enter your question here..."
                                style={{
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            />
                        </Form.Item>
                    </div>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="question_type"
                                label={<span style={{ color: '#1a1a1a', fontWeight: '600', fontSize: '14px' }}>Question Type</span>}
                                rules={[{ required: true, message: 'Please select question type' }]}
                            >
                                <Select
                                    placeholder="Select question type"
                                    style={{ borderRadius: '6px' }}
                                    size="large"
                                >
                                    <Option value="mcq_single">📋 Multiple Choice (Single Answer)</Option>
                                    <Option value="mcq_multiple">☑️ Multiple Choice (Multiple Answers)</Option>
                                    <Option value="yes_no">✓ Yes/No Question</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="marks"
                                label={<span style={{ color: '#1a1a1a', fontWeight: '600', fontSize: '14px' }}>Points</span>}
                                rules={[
                                    { required: true, message: 'Please enter marks' },
                                    { type: 'number', min: 1, message: 'Must be at least 1 mark' }
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    style={{ width: '100%', borderRadius: '6px' }}
                                    size="large"
                                    placeholder="Points"
                                />
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
                                    <div style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        <Form.Item
                                            name="options"
                                            label={
                                                <div style={{ marginBottom: 8 }}>
                                                    <span style={{ color: '#1a1a1a', fontWeight: '600', fontSize: '14px' }}>
                                                        Answer Options
                                                    </span>
                                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
                                                        (Check the correct answer{questionType === 'mcq_multiple' ? 's' : ''})
                                                    </Text>
                                                </div>
                                            }
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
                                            style={{ marginBottom: 0 }}
                                        >
                                            <OptionsInput allowMultiple={questionType === 'mcq_multiple'} />
                                        </Form.Item>
                                    </div>
                                );
                            }
                            
                            if (questionType === 'yes_no') {
                                return (
                                    <div style={{
                                        backgroundColor: '#f8f9fa',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8'
                                    }}>
                                        <Form.Item
                                            name="correct_answer"
                                            label={<span style={{ color: '#1a1a1a', fontWeight: '600', fontSize: '14px' }}>Correct Answer</span>}
                                            rules={[{ required: true, message: 'Please select correct answer' }]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Select
                                                placeholder="Select correct answer"
                                                size="large"
                                                style={{ borderRadius: '6px' }}
                                            >
                                                <Option value="yes">✓ Yes</Option>
                                                <Option value="no">✗ No</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>
                                );
                            }
                            
                            return null;
                        }}
                    </Form.Item>

                    <Divider style={{ margin: '24px 0' }} />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space size={12}>
                            <Button
                                onClick={() => setQuestionModalVisible(false)}
                                size="large"
                                style={{ borderRadius: '6px', minWidth: '100px' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                style={{
                                    borderRadius: '6px',
                                    minWidth: '140px',
                                    fontWeight: '600'
                                }}
                            >
                                {editingQuestion ? '✓ Update Question' : '➕ Add Question'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default QuizBuilder;