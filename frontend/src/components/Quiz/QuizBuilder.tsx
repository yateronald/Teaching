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
    Collapse,
    Spin
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    LoadingOutlined,
    InfoCircleOutlined,
    MinusCircleOutlined,
    SoundOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AIQuizGenerator from './AIQuizGenerator';
import AudioQuestionModal from './AudioQuestionModal';
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
    audio_clip_temp_id?: string; // Links question to an audio clip
    audio_clip_index?: number; // Index in audioClips array
    audio_clip_id?: number; // Real DB id (set when loaded from backend)
}

interface AudioClipData {
    tempId: string;
    transcript: string;
    voiceName: string;
    sourceType: 'tts' | 'upload';
    kdriveFileId?: string;
    fileName?: string;
    durationSeconds?: number;
    maxPlays: number;
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
    onClose?: () => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ quizId: propQuizId, onComplete, onClose }) => {
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
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    const [totalMarks, setTotalMarks] = useState<number | null>(null);
    const [equalizeMarks, setEqualizeMarks] = useState(false);
    const [formResetKey, setFormResetKey] = useState(0);
    const [aiModalVisible, setAiModalVisible] = useState(false);
    const [audioModalVisible, setAudioModalVisible] = useState(false);
    const [audioClips, setAudioClips] = useState<AudioClipData[]>([]);
    const [editingAudioClipTempId, setEditingAudioClipTempId] = useState<string | null>(null);
    
    const [quizForm] = Form.useForm();
    const [questionForm] = Form.useForm();

    // Automatically sync Total Marks with Total Points
    useEffect(() => {
        if (!quiz || !quiz.questions) return;
        const calculatedPoints = quiz.questions.reduce((sum, q) => {
            const m = Number(q.marks);
            return sum + (isNaN(m) ? 0 : m);
        }, 0);
        
        if (totalMarks !== calculatedPoints) {
            setTotalMarks(calculatedPoints);
            quizForm.setFieldsValue({ total_marks: calculatedPoints });
        }
    }, [quiz.questions, totalMarks, quizForm]);

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
        setLoadingQuiz(true);
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
                        correct_answer: quest.correct_answer,
                        audio_clip_id: quest.audio_clip_id || undefined,
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

                // ---- Reconstruct audio clips & link questions by audio_clip_id ----
                const backendClips = Array.isArray(q.audio_clips) ? q.audio_clips : [];
                if (backendClips.length > 0) {
                    // Build a map from real DB clip id -> generated tempId
                    const clipIdToTempId: Record<number, string> = {};
                    const restoredClips: AudioClipData[] = backendClips.map((c: any, idx: number) => {
                        const tempId = `audio_restored_${c.id}_${Date.now()}_${idx}`;
                        clipIdToTempId[c.id] = tempId;
                        return {
                            tempId,
                            transcript: c.transcript || '',
                            voiceName: c.voice_name || 'Kore',
                            sourceType: (c.source_type || 'tts') as 'tts' | 'upload',
                            kdriveFileId: c.kdrive_file_id ? String(c.kdrive_file_id) : undefined,
                            fileName: c.file_name || undefined,
                            durationSeconds: c.duration_seconds || undefined,
                            maxPlays: c.max_plays || 0,
                        };
                    });
                    setAudioClips(restoredClips);

                    // Assign audio_clip_temp_id to questions that have audio_clip_id
                    const linkedQuestions = normalizedQuestions.map(quest => {
                        if (quest.audio_clip_id && clipIdToTempId[quest.audio_clip_id]) {
                            return {
                                ...quest,
                                audio_clip_temp_id: clipIdToTempId[quest.audio_clip_id],
                            };
                        }
                        return quest;
                    });
                    // Update the quiz with linked questions
                    setQuiz(prev => ({ ...prev, questions: linkedQuestions }));
                } else {
                    setAudioClips([]);
                }

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
        } finally {
            setLoadingQuiz(false);
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
        setIsPublishing(publishNow);
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
                    // Audio clip linkage
                    audio_clip_temp_id: q.audio_clip_temp_id || undefined,
                    audio_clip_index: q.audio_clip_index !== undefined ? q.audio_clip_index : undefined,
                    audio_clip_id: q.audio_clip_id || undefined,
                })),
                // Audio clips
                audio_clips: audioClips.map(clip => ({
                    tempId: clip.tempId,
                    transcript: clip.transcript,
                    voiceName: clip.voiceName,
                    sourceType: clip.sourceType,
                    kdriveFileId: clip.kdriveFileId,
                    fileName: clip.fileName,
                    durationSeconds: clip.durationSeconds,
                    maxPlays: clip.maxPlays,
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

    /** Handle AI-generated questions — replaces existing questions */
    const handleAIQuestionsGenerated = (questions: Question[], title: string, description: string) => {
        // Append questions (don't replace existing ones, especially audio questions)
        setQuiz(prev => ({ ...prev, questions: [...prev.questions, ...questions] }));

        // Auto-fill title and description if currently empty
        const currentTitle = quizForm.getFieldValue('title');
        const currentDesc = quizForm.getFieldValue('description');
        if (!currentTitle && title) {
            quizForm.setFieldsValue({ title });
            setQuiz(prev => ({ ...prev, title }));
        }
        if (!currentDesc && description) {
            quizForm.setFieldsValue({ description });
            setQuiz(prev => ({ ...prev, description }));
        }

        // Update total marks to include ALL questions (existing + new)
        setQuiz(prev => {
            const newTotal = prev.questions.reduce((sum, q) => sum + q.marks, 0);
            setTotalMarks(newTotal);
            quizForm.setFieldsValue({ total_marks: newTotal });
            return prev;
        });

        setAiModalVisible(false);
        message.success(`✨ ${questions.length} questions generated and added!`);
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
            <div style={{ width: '100%', padding: '6px 0' }}>
                {/* Row 1: Number badge + Question text */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                        color: 'white',
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '13px',
                        flexShrink: 0,
                        marginTop: 1
                    }}>
                        {index + 1}
                    </div>
                    <Text
                        strong
                        style={{
                            fontSize: '14px',
                            color: '#1a1a1a',
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                            flex: 1
                        }}
                    >
                        {question.question_text}
                    </Text>
                </div>
                {/* Row 2: Tags + Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 40 }}>
                    <Space size={6} wrap={false}>
                        <Tag
                            color={getQuestionTypeColor(question.question_type)}
                            style={{
                                margin: 0,
                                padding: '2px 10px',
                                fontSize: '11px',
                                borderRadius: '6px',
                                fontWeight: '500',
                            }}
                        >
                            {getQuestionTypeName(question.question_type)}
                        </Tag>
                        <Tag
                            color="purple"
                            style={{
                                margin: 0,
                                padding: '2px 10px',
                                fontSize: '11px',
                                borderRadius: '6px',
                                fontWeight: '600',
                            }}
                        >
                            {question.marks} pts
                        </Tag>
                        {question.audio_clip_temp_id && (
                            <Tag
                                color="cyan"
                                style={{
                                    margin: 0,
                                    padding: '2px 10px',
                                    fontSize: '11px',
                                    borderRadius: '6px',
                                    fontWeight: '500',
                                }}
                            >
                                🎧 Listening
                            </Tag>
                        )}
                    </Space>
                    <Space size={6} wrap={false} onClick={(e) => e.stopPropagation()}>
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
            </div>
        );

        return (
            <Collapse.Panel
                key={index}
                header={header}
                style={{
                    marginBottom: 12,
                    borderRadius: '10px',
                    border: '1px solid #f0f0f0',
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
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
        <div style={{ margin: '0 auto', padding: '0', position: 'relative' }}>
            {/* Sticky Gradient Header */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 30,
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
                borderRadius: 0,
                padding: '20px 28px',
                marginBottom: 20,
                color: 'white',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(37,99,235,0.25)',
            }}>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: -20, right: -20,
                    width: 120, height: 120,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: -30, right: 80,
                    width: 80, height: 80,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '50%',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space align="center" size={16}>
                        <div style={{
                            width: 48, height: 48,
                            borderRadius: 14,
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24,
                        }}>
                            {quizId ? '✏️' : '📝'}
                        </div>
                        <div>
                            <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: 22 }}>
                                {quizId ? 'Edit Quiz' : 'Create New Quiz'}
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                                {quizId ? 'Update your quiz details, questions, and settings' : 'Build a new quiz for your students'}
                            </Text>
                        </div>
                    </Space>
                    {/* Close Button */}
                    <button
                        onClick={() => onClose ? onClose() : navigate('/teacher-dashboard')}
                        style={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: 18,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            zIndex: 10,
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

            {/* Loading overlay when fetching quiz data for edit mode */}
            {loadingQuiz && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 20,
                        padding: '40px 56px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 20px rgba(37,99,235,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                    }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 52, color: '#2563eb' }} spin />} />
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ fontSize: 20, color: '#1e3a5f', display: 'block', marginBottom: 4 }}>Loading Quiz Data...</Text>
                            <Text type="secondary" style={{ fontSize: 14 }}>Please wait while we fetch your quiz details</Text>
                        </div>
                        <div style={{
                            width: 180, height: 4, borderRadius: 4,
                            background: '#e5e7eb', overflow: 'hidden',
                        }}>
                            <div style={{
                                width: '40%', height: '100%', borderRadius: 4,
                                background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
                                animation: 'loadingBar 1.5s ease-in-out infinite',
                            }} />
                        </div>
                    </div>
                    <style>{`
                        @keyframes loadingBar {
                            0% { transform: translateX(-100%); }
                            50% { transform: translateX(200%); }
                            100% { transform: translateX(-100%); }
                        }
                    `}</style>
                </div>
            )}

            {/* Saving overlay when save/publish is in progress */}
            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 20,
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: 20,
                        padding: '40px 56px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 20px rgba(124,58,237,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 4 }}>{isPublishing ? '🚀' : '📝'}</div>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: isPublishing ? '#7c3aed' : '#2563eb' }} spin />} />
                        <div style={{ textAlign: 'center' }}>
                            <Text strong style={{ fontSize: 20, color: '#1e3a5f', display: 'block', marginBottom: 4 }}>
                                {isPublishing ? 'Publishing Quiz...' : 'Saving Draft...'}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                {isPublishing
                                    ? 'Your quiz is going live for students!'
                                    : 'Saving your progress, you can continue later'}
                            </Text>
                        </div>
                        <div style={{
                            width: 180, height: 4, borderRadius: 4,
                            background: '#e5e7eb', overflow: 'hidden',
                        }}>
                            <div style={{
                                width: '40%', height: '100%', borderRadius: 4,
                                background: isPublishing
                                    ? 'linear-gradient(90deg, #7c3aed, #a855f7)'
                                    : 'linear-gradient(90deg, #2563eb, #06b6d4)',
                                animation: 'savingBar 1.5s ease-in-out infinite',
                            }} />
                        </div>
                    </div>
                    <style>{`
                        @keyframes savingBar {
                            0% { transform: translateX(-100%); }
                            50% { transform: translateX(200%); }
                            100% { transform: translateX(-100%); }
                        }
                    `}</style>
                </div>
            )}

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
                    <Card
                        title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📋 Quiz Details</span>}
                        style={{ marginBottom: 24, borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
                    >
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
                                        <Input placeholder="Enter quiz title" size="large" style={{ borderRadius: 8 }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: 'Please enter description' }]}
                            >
                                <TextArea rows={3} placeholder="Enter quiz description" style={{ borderRadius: 8 }} />
                            </Form.Item>

                            <Form.Item
                                name="instructions"
                                label="Instructions for Students"
                            >
                                <TextArea rows={3} placeholder="Enter special instructions" style={{ borderRadius: 8 }} />
                            </Form.Item>

                            <Divider style={{ margin: '20px 0 16px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#595959' }}>⚙️ Settings</span>
                            </Divider>

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

                            <Divider style={{ margin: '20px 0 16px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#595959' }}>💯 Scoring Options</span>
                            </Divider>
                            
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="total_marks"
                                        label={<span>Total Marks <Tooltip title="Automatically synchronized with the sum of all question points."><InfoCircleOutlined /></Tooltip></span>}
                                    >
                                        <InputNumber 
                                            min={0} 
                                            step={0.5}
                                            style={{ width: '100%' }}
                                            placeholder="Auto-calculated from questions"
                                            value={totalMarks}
                                            onChange={(value) => setTotalMarks(value)}
                                            disabled
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
                        </Form>
                    </Card>

                    {/* Questions List */}
                    <Card
                        title={
                            <span style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>
                                📝 Questions ({quiz.questions.length})
                            </span>
                        }
                        style={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        {quiz.questions.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
                                <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
                                <Text strong style={{ display: 'block', fontSize: 16, marginBottom: 6 }}>
                                    No questions added yet
                                </Text>
                                <Text type="secondary" style={{ display: 'block' }}>
                                    Add questions manually or generate them with AI
                                </Text>
                            </div>
                        )}
                        {quiz.questions.length > 0 && (() => {
                            // Separate regular and audio-linked questions
                            const regularQuestions = quiz.questions.filter(q => !q.audio_clip_temp_id);
                            const audioGrouped = new Map<string, { clip: typeof audioClips[0]; questions: { question: Question; originalIndex: number }[] }>();
                            
                            quiz.questions.forEach((q, idx) => {
                                if (q.audio_clip_temp_id) {
                                    if (!audioGrouped.has(q.audio_clip_temp_id)) {
                                        const clip = audioClips.find(c => c.tempId === q.audio_clip_temp_id);
                                        if (clip) {
                                            audioGrouped.set(q.audio_clip_temp_id, { clip, questions: [] });
                                        }
                                    }
                                    audioGrouped.get(q.audio_clip_temp_id)?.questions.push({ question: q, originalIndex: idx });
                                }
                            });

                            return (
                                <div>
                                    {/* Regular Questions */}
                                    {regularQuestions.length > 0 && (
                                        <Collapse
                                            accordion
                                            style={{ backgroundColor: 'transparent', border: 'none' }}
                                            expandIconPosition="end"
                                        >
                                            {regularQuestions.map((question) => {
                                                const originalIdx = quiz.questions.indexOf(question);
                                                return renderQuestionPreview(question, originalIdx);
                                            })}
                                        </Collapse>
                                    )}

                                    {/* Audio Clip Sections */}
                                    {Array.from(audioGrouped.entries()).map(([tempId, { clip, questions: audioQs }]) => {
                                        const clipPoints = audioQs.reduce((sum, aq) => sum + aq.question.marks, 0);
                                        return (
                                            <div
                                                key={tempId}
                                                style={{
                                                    marginTop: regularQuestions.length > 0 ? 16 : 0,
                                                    marginBottom: 16,
                                                    borderRadius: 12,
                                                    border: '2px solid #a7f3d0',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {/* Audio Clip Header */}
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)',
                                                    padding: '14px 18px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            background: 'rgba(255,255,255,0.2)',
                                                            borderRadius: 10,
                                                            width: 38,
                                                            height: 38,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: 20,
                                                            flexShrink: 0,
                                                        }}>
                                                            🎧
                                                        </div>
                                                        <div style={{ minWidth: 0, flex: 1 }}>
                                                            <Text strong style={{ color: 'white', fontSize: 14, display: 'block' }}>
                                                                Listening Comprehension
                                                            </Text>
                                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {clip.transcript.substring(0, 80)}{clip.transcript.length > 80 ? '...' : ''}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <Space size={6} style={{ flexShrink: 0, marginLeft: 12 }}>
                                                        {clip.durationSeconds && (
                                                            <Tag style={{ margin: 0, borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 11 }}>
                                                                ⏱ {clip.durationSeconds}s
                                                            </Tag>
                                                        )}
                                                        <Tag style={{ margin: 0, borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 11 }}>
                                                            {audioQs.length} Q · {clipPoints} pts
                                                        </Tag>
                                                        <Tag style={{ margin: 0, borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 11 }}>
                                                            {clip.sourceType === 'tts' ? '🎙️ TTS' : '📁 Upload'}
                                                        </Tag>
                                                        {clip.maxPlays > 0 && (
                                                            <Tag style={{ margin: 0, borderRadius: 6, background: 'rgba(255,200,0,0.3)', color: 'white', border: 'none', fontSize: 11 }}>
                                                                🔒 {clip.maxPlays}x
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                    <Space size={4} style={{ flexShrink: 0, marginLeft: 8 }}>
                                                        <Button
                                                            size="small"
                                                            onClick={() => {
                                                                setEditingAudioClipTempId(tempId);
                                                                setAudioModalVisible(true);
                                                            }}
                                                            style={{ borderRadius: 6, background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontSize: 12, fontWeight: 600 }}
                                                        >
                                                            ✏️ Edit
                                                        </Button>
                                                        <Popconfirm
                                                            title="Delete this audio section?"
                                                            description={`This will remove the audio clip and all ${audioQs.length} linked question(s).`}
                                                            onConfirm={() => {
                                                                // Remove all questions linked to this audio clip
                                                                setQuiz(prev => ({
                                                                    ...prev,
                                                                    questions: prev.questions.filter(q => q.audio_clip_temp_id !== tempId)
                                                                }));
                                                                // Remove the audio clip
                                                                setAudioClips(prev => prev.filter(c => c.tempId !== tempId));
                                                                message.success('Audio section deleted');
                                                            }}
                                                            okText="Yes, delete all"
                                                            cancelText="Cancel"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button
                                                                size="small"
                                                                danger
                                                                style={{ borderRadius: 6, background: 'rgba(255,100,100,0.3)', color: 'white', border: 'none', fontSize: 12, fontWeight: 600 }}
                                                            >
                                                                🗑️ Delete
                                                            </Button>
                                                        </Popconfirm>
                                                    </Space>
                                                </div>

                                                {/* Audio Questions */}
                                                <div style={{ background: '#f0fdfa', padding: '4px 0' }}>
                                                    <Collapse
                                                        accordion
                                                        style={{ backgroundColor: 'transparent', border: 'none' }}
                                                        expandIconPosition="end"
                                                    >
                                                        {audioQs.map(({ question, originalIndex }) => renderQuestionPreview(question, originalIndex))}
                                                    </Collapse>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                    </Card>

                        {/* Always-visible Action Buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 12,
                            padding: '16px 0 4px',
                            flexWrap: 'wrap',
                        }}>
                            <Button
                                size="large"
                                onClick={() => setAiModalVisible(true)}
                                disabled={isEnded}
                                style={{
                                    borderRadius: 10,
                                    height: 44,
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    paddingInline: 20,
                                }}
                            >
                                ✨ Generate with AI
                            </Button>
                            <Button
                                size="large"
                                icon={<SoundOutlined />}
                                onClick={() => {
                                    setEditingAudioClipTempId(null);
                                    setAudioModalVisible(true);
                                }}
                                disabled={isEnded}
                                style={{
                                    borderRadius: 10,
                                    height: 44,
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                                    color: 'white',
                                    border: 'none',
                                    paddingInline: 20,
                                }}
                            >
                                🎧 Add Listening
                            </Button>
                            <Button
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestion}
                                disabled={isEnded}
                                style={{ borderRadius: 10, height: 44, paddingInline: 20 }}
                            >
                                + Add Question
                            </Button>
                        </div>
                </Col>

                <Col xs={24} lg={8}>
                    {/* Quiz Summary */}
                    <Card
                        title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📊 Quiz Summary</span>}
                        style={{
                            position: 'sticky',
                            top: 20,
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
                        }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size={16}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                backgroundColor: '#f0f5ff',
                                borderRadius: 10
                            }}>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Questions</Text>
                                <Text strong style={{ fontSize: 22, color: '#1890ff' }}>{quiz.questions.length}</Text>
                            </div>
                            
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 16px',
                                backgroundColor: '#f6ffed',
                                borderRadius: 10
                            }}>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>Total Points</Text>
                                <Text strong style={{ fontSize: 22, color: '#52c41a' }}>{totalPoints}</Text>
                            </div>

                            {/* Audio Clips */}
                            {audioClips.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '14px 16px',
                                    background: 'linear-gradient(135deg, #f0fdfa, #ecfdf5)',
                                    borderRadius: 10,
                                    border: '1px solid #a7f3d0'
                                }}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block' }}>Audio Clips</Text>
                                        <Text style={{ fontSize: 11, color: '#6b7280' }}>
                                            {quiz.questions.filter(q => q.audio_clip_temp_id).length} listening questions
                                        </Text>
                                    </div>
                                    <Text strong style={{ fontSize: 22, color: '#0891b2' }}>
                                        {audioClips.length}
                                    </Text>
                                </div>
                            )}
                            
                            <div>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 10 }}>Question Types</Text>
                                <Space wrap size={6}>
                                    {['mcq_single', 'mcq_multiple', 'yes_no'].map((type) => {
                                        const count = quiz.questions.filter((q) => q.question_type === type).length;
                                        if (count > 0) {
                                            return (
                                                <Tag
                                                    key={type}
                                                    color={type === 'mcq_single' ? 'blue' : type === 'mcq_multiple' ? 'cyan' : 'orange'}
                                                    style={{ borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}
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
                                    {quiz.questions.filter(q => q.audio_clip_temp_id).length > 0 && (
                                        <Tag
                                            color="teal"
                                            style={{ borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 500, background: '#0891b2', color: 'white', border: 'none' }}
                                        >
                                            🎧 Listening: {quiz.questions.filter(q => q.audio_clip_temp_id).length}
                                        </Tag>
                                    )}
                                    {quiz.questions.length === 0 && (
                                        <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>No questions yet</Text>
                                    )}
                                </Space>
                            </div>

                            {quiz.questions.length > 0 && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#fffbe6',
                                    borderRadius: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    flexWrap: 'wrap'
                                }}>
                                    <Text style={{ fontSize: 13 }}>
                                        ⏱ {quiz.duration_minutes || 30} min
                                    </Text>
                                    <span style={{ color: '#d9d9d9' }}>|</span>
                                    <Text style={{ fontSize: 13 }}>
                                        📝 {quiz.questions.length} Q × ~{quiz.questions.length > 0 ? Math.round(totalPoints / quiz.questions.length * 10) / 10 : 0} pts avg
                                    </Text>
                                    {audioClips.length > 0 && (
                                        <>
                                            <span style={{ color: '#d9d9d9' }}>|</span>
                                            <Text style={{ fontSize: 13 }}>
                                                🎧 {audioClips.length} audio clip{audioClips.length > 1 ? 's' : ''}
                                            </Text>
                                        </>
                                    )}
                                </div>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Fixed Bottom Save Bar */}
            <div style={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                right: 0,
                background: '#fff',
                borderTop: '2px solid #f0f0f0',
                padding: '14px 24px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
                zIndex: 20,
                borderRadius: '0 0 12px 12px',
            }}>
                <Button
                    onClick={() => onClose ? onClose() : navigate('/teacher-dashboard')}
                    size="large"
                    disabled={loading}
                    style={{ borderRadius: 10, minWidth: 110, height: 44, fontWeight: 500 }}
                >
                    Cancel
                </Button>
                <Button
                    loading={loading}
                    icon={<SaveOutlined />}
                    disabled={isEnded || loadingQuiz || loading}
                    size="large"
                    onClick={() => {
                        quizForm.validateFields().then(values => {
                            handleQuizSave(values, false);
                        });
                    }}
                    style={{ borderRadius: 10, minWidth: 140, height: 44, fontWeight: 500 }}
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
                    disabled={isEnded || loadingQuiz || loading}
                    size="large"
                    style={{
                        borderRadius: 10,
                        minWidth: 170,
                        height: 44,
                        fontWeight: 600,
                        background: (isEnded || loadingQuiz || loading) ? undefined : 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none',
                    }}
                >
                    {quizId ? 'Update & Publish' : 'Save & Publish'}
                </Button>
            </div>

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
                width={720}
                centered
                style={{ top: 20 }}
                bodyStyle={{
                    maxHeight: 'calc(100vh - 200px)',
                    overflowY: 'auto',
                    padding: '28px'
                }}
                styles={{
                    mask: { backdropFilter: 'blur(4px)' },
                    content: { borderRadius: 14, overflow: 'hidden' },
                    header: { padding: '20px 28px 12px', borderBottom: 'none' }
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

                    <Divider style={{ margin: '24px 0 20px' }} />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space size={12}>
                            <Button
                                onClick={() => setQuestionModalVisible(false)}
                                size="large"
                                style={{ borderRadius: '8px', minWidth: '110px', height: 42, fontWeight: 500 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                style={{
                                    borderRadius: '8px',
                                    minWidth: '150px',
                                    height: 42,
                                    fontWeight: '600'
                                }}
                            >
                                {editingQuestion ? '✓ Update Question' : '➕ Add Question'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* AI Quiz Generator Modal */}
            <Modal
                title={null}
                open={aiModalVisible}
                onCancel={() => setAiModalVisible(false)}
                footer={null}
                width={780}
                closable={false}
                centered
                destroyOnClose
                styles={{
                    body: { padding: 0, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' },
                    content: { padding: 0, overflow: 'hidden', borderRadius: 12 }
                }}
            >
                <AIQuizGenerator
                    onQuestionsGenerated={handleAIQuestionsGenerated}
                    onCancel={() => setAiModalVisible(false)}
                />
            </Modal>

            {/* Audio Listening Comprehension Modal */}
            <AudioQuestionModal
                visible={audioModalVisible}
                onClose={() => {
                    setAudioModalVisible(false);
                    setEditingAudioClipTempId(null);
                }}
                quizTitle={quiz.title}
                editData={editingAudioClipTempId ? {
                    audioClip: audioClips.find(c => c.tempId === editingAudioClipTempId)!,
                    questions: quiz.questions
                        .filter(q => q.audio_clip_temp_id === editingAudioClipTempId)
                        .map(q => ({
                            question_text: q.question_text,
                            question_type: q.question_type,
                            marks: q.marks,
                            correct_answer: q.correct_answer,
                            explanation: '',
                            options: q.options?.map(o => ({ option_text: o.option_text, is_correct: o.is_correct })),
                            audio_clip_temp_id: q.audio_clip_temp_id || '',
                        }))
                } : null}
                onAdd={(audioClip, linkedQuestions) => {
                    if (editingAudioClipTempId) {
                        // Edit mode — replace existing clip & questions
                        setAudioClips(prev => prev.map(c =>
                            c.tempId === editingAudioClipTempId ? { ...audioClip, tempId: editingAudioClipTempId } : c
                        ));
                        // Remove old questions, add updated ones
                        const newQuestions: Question[] = linkedQuestions.map(q => ({
                            question_text: q.question_text,
                            question_type: q.question_type,
                            marks: q.marks,
                            correct_answer: q.correct_answer,
                            options: q.options,
                            audio_clip_temp_id: editingAudioClipTempId,
                        }));
                        setQuiz(prev => ({
                            ...prev,
                            questions: [
                                ...prev.questions.filter(q => q.audio_clip_temp_id !== editingAudioClipTempId),
                                ...newQuestions
                            ]
                        }));
                        setEditingAudioClipTempId(null);
                        message.success(`Updated listening comprehension (${linkedQuestions.length} questions)`);
                    } else {
                        // Add mode
                        const clipIndex = audioClips.length;
                        setAudioClips(prev => [...prev, audioClip]);
                        const newQuestions: Question[] = linkedQuestions.map(q => ({
                            question_text: q.question_text,
                            question_type: q.question_type,
                            marks: q.marks,
                            correct_answer: q.correct_answer,
                            options: q.options,
                            audio_clip_temp_id: audioClip.tempId,
                            audio_clip_index: clipIndex,
                        }));
                        setQuiz(prev => ({
                            ...prev,
                            questions: [...prev.questions, ...newQuestions]
                        }));
                        message.success(`Added ${linkedQuestions.length} listening comprehension question(s)`);
                    }
                }}
            />
        </div>
    );
};

export default QuizBuilder;