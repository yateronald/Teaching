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
    Alert
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Question {
    id?: number;
    question_text: string;
    question_type: 'mcq' | 'text' | 'yes_no';
    options?: string[];
    correct_answer?: string;
    points: number;
}

interface Quiz {
    id?: number;
    title: string;
    description: string;
    batch_id: number;
    time_limit: number;
    questions: Question[];
}

interface Batch {
    id: number;
    name: string;
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
        batch_id: 0,
        time_limit: 30,
        questions: []
    });
    
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
    const [questionModalVisible, setQuestionModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);
    
    const [quizForm] = Form.useForm();
    const [questionForm] = Form.useForm();

    useEffect(() => {
        fetchBatches();
        if (quizId) {
            fetchQuiz();
        }
    }, [quizId]);

    const fetchBatches = async () => {
        try {
            const response = await apiCall(`/api/batches/teacher/${user?.id}`);
            if (response.success) {
                setBatches(response.data);
            }
        } catch (error) {
            message.error('Failed to fetch batches');
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await apiCall(`/api/quizzes/${quizId}`);
            if (response.success) {
                setQuiz(response.data);
                quizForm.setFieldsValue(response.data);
            }
        } catch (error) {
            message.error('Failed to fetch quiz');
            navigate('/teacher-dashboard');
        }
    };

    const handleQuizSave = async (values: any) => {
        if (quiz.questions.length === 0) {
            message.error('Please add at least one question');
            return;
        }

        setLoading(true);
        try {
            const quizData = {
                ...values,
                teacher_id: user?.id,
                questions: quiz.questions
            };

            const url = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
            const method = quizId ? 'PUT' : 'POST';

            const response = await apiCall(url, {
                method,
                body: JSON.stringify(quizData)
            });

            if (response.success) {
                message.success(`Quiz ${quizId ? 'updated' : 'created'} successfully`);
                navigate('/teacher-dashboard');
            }
        } catch (error) {
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
        questionForm.setFieldsValue({
            ...question,
            options: question.options || []
        });
    };

    const handleQuestionSave = (values: any) => {
        const newQuestion: Question = {
            question_text: values.question_text,
            question_type: values.question_type,
            points: values.points,
            options: values.question_type === 'mcq' ? values.options : undefined,
            correct_answer: values.correct_answer
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
                case 'mcq': return 'blue';
                case 'text': return 'green';
                case 'yes_no': return 'orange';
                default: return 'default';
            }
        };

        const getQuestionTypeName = (type: string) => {
            switch (type) {
                case 'mcq': return 'Multiple Choice';
                case 'text': return 'Text Answer';
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
                                <Tag color="purple">{question.points} pts</Tag>
                            </Space>
                        </div>
                    }
                    description={
                        <div>
                            <Text>{question.question_text}</Text>
                            {question.question_type === 'mcq' && question.options && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Options:</Text>
                                    <ul style={{ marginTop: 4, marginBottom: 0 }}>
                                        {question.options.map((option, optIndex) => (
                                            <li key={optIndex}>
                                                <Text 
                                                    type={option === question.correct_answer ? 'success' : 'secondary'}
                                                    strong={option === question.correct_answer}
                                                >
                                                    {option}
                                                    {option === question.correct_answer && ' ✓'}
                                                </Text>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {question.question_type === 'yes_no' && (
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Correct Answer: </Text>
                                    <Text strong type="success">{question.correct_answer}</Text>
                                </div>
                            )}
                        </div>
                    }
                />
            </List.Item>
        );
    };

    const OptionsInput: React.FC<{ value?: string[]; onChange?: (value: string[]) => void }> = ({ value = [], onChange }) => {
        const [options, setOptions] = useState<string[]>(value.length > 0 ? value : ['', '']);

        const handleOptionChange = (index: number, optionValue: string) => {
            const newOptions = [...options];
            newOptions[index] = optionValue;
            setOptions(newOptions);
            onChange?.(newOptions.filter(opt => opt.trim() !== ''));
        };

        const addOption = () => {
            const newOptions = [...options, ''];
            setOptions(newOptions);
        };

        const removeOption = (index: number) => {
            if (options.length > 2) {
                const newOptions = options.filter((_, i) => i !== index);
                setOptions(newOptions);
                onChange?.(newOptions.filter(opt => opt.trim() !== ''));
            }
        };

        return (
            <div>
                {options.map((option, index) => (
                    <div key={index} style={{ display: 'flex', marginBottom: 8 }}>
                        <Input
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        {options.length > 2 && (
                            <Button 
                                type="link" 
                                danger 
                                icon={<DeleteOutlined />}
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

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

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
                            onFinish={handleQuizSave}
                            initialValues={quiz}
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

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="batch_id"
                                        label="Select Batch"
                                        rules={[{ required: true, message: 'Please select a batch' }]}
                                    >
                                        <Select placeholder="Select batch">
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
                                        name="time_limit"
                                        label="Time Limit (minutes)"
                                        rules={[
                                            { required: true, message: 'Please enter time limit' },
                                            { type: 'number', min: 1, message: 'Must be at least 1 minute' }
                                        ]}
                                    >
                                        <InputNumber 
                                            min={1} 
                                            max={300} 
                                            style={{ width: '100%' }}
                                            placeholder="Enter time limit"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Space>
                                    <Button onClick={() => navigate('/teacher-dashboard')}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        htmlType="submit" 
                                        loading={loading}
                                        icon={<SaveOutlined />}
                                    >
                                        {quizId ? 'Update Quiz' : 'Save Quiz'}
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
                                    {['mcq', 'text', 'yes_no'].map(type => {
                                        const count = quiz.questions.filter(q => q.question_type === type).length;
                                        if (count > 0) {
                                            return (
                                                <Tag key={type} color={type === 'mcq' ? 'blue' : type === 'text' ? 'green' : 'orange'}>
                                                    {type === 'mcq' ? 'Multiple Choice' : type === 'text' ? 'Text' : 'Yes/No'}: {count}
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
                                    <Option value="mcq">Multiple Choice</Option>
                                    <Option value="text">Text Answer</Option>
                                    <Option value="yes_no">Yes/No</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="points"
                                label="Points"
                                rules={[
                                    { required: true, message: 'Please enter points' },
                                    { type: 'number', min: 1, message: 'Must be at least 1 point' }
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
                            
                            if (questionType === 'mcq') {
                                return (
                                    <>
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
                                                        return Promise.resolve();
                                                    }
                                                }
                                            ]}
                                        >
                                            <OptionsInput />
                                        </Form.Item>
                                        
                                        <Form.Item
                                            name="correct_answer"
                                            label="Correct Answer"
                                            rules={[{ required: true, message: 'Please select correct answer' }]}
                                        >
                                            <Select placeholder="Select correct answer">
                                                {(getFieldValue('options') || []).map((option: string, index: number) => (
                                                    <Option key={index} value={option}>
                                                        {option}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </>
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
                                            <Option value="Yes">Yes</Option>
                                            <Option value="No">No</Option>
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