import React, { useState, useEffect } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Statistic, 
    Table, 
    Button, 
    Modal, 
    Form, 
    Input, 
    Select, 
    message, 
    Space,
    Typography,
    Tag,
    Popconfirm,
    Progress,
    Tabs,
    List,
    Avatar
} from 'antd';
import {
    TeamOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    UserOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Batch {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    max_students: number;
    current_students: number;
    created_at: string;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name?: string;
    total_questions: number;
    time_limit: number;
    is_active: boolean;
    created_at: string;
    submissions_count?: number;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    batch_name: string;
    quiz_scores: Array<{
        quiz_title: string;
        score: number;
        max_score: number;
        submitted_at: string;
    }>;
    average_score: number;
}

interface CreateQuizForm {
    title: string;
    description: string;
    batch_id: number;
    time_limit: number;
}

const TeacherDashboard: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [quizModalVisible, setQuizModalVisible] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [quizForm] = Form.useForm();
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalBatches: 0,
        totalStudents: 0,
        totalQuizzes: 0,
        activeQuizzes: 0,
        averageScore: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [batchesRes, quizzesRes, studentsRes] = await Promise.all([
                apiCall(`/batches/teacher/${user?.id}`),
                apiCall(`/quizzes/teacher/${user?.id}`),
                apiCall(`/users/students/teacher/${user?.id}`)
            ]);

            if (batchesRes.ok) {
                const batchesData = await batchesRes.json();
                const batches = batchesData.data || [];
                setBatches(batches);
                setStats(prev => ({
                    ...prev,
                    totalBatches: batches.length
                }));
            }

            if (quizzesRes.ok) {
                const quizzesData = await quizzesRes.json();
                const quizzes = quizzesData.data || [];
                setQuizzes(quizzes);
                const activeQuizzes = quizzes.filter((quiz: Quiz) => quiz.is_active).length;
                setStats(prev => ({
                    ...prev,
                    totalQuizzes: quizzes.length,
                    activeQuizzes
                }));
            }

            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                const students = studentsData.data || [];
                setStudents(students);
                const totalStudents = students.length;
                const averageScore = students.length > 0 
                    ? students.reduce((acc: number, student: Student) => 
                        acc + (student.average_score || 0), 0) / totalStudents 
                    : 0;
                
                setStats(prev => ({
                    ...prev,
                    totalStudents,
                    averageScore: Math.round(averageScore)
                }));
            }
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = async (values: CreateQuizForm) => {
        try {
            const response = await apiCall('/quizzes', {
                method: 'POST',
                body: JSON.stringify({
                    ...values,
                    teacher_id: user?.id
                })
            });

            if (response.ok) {
                message.success('Quiz created successfully');
                setQuizModalVisible(false);
                quizForm.resetFields();
                fetchData();
            }
        } catch (error) {
            message.error('Failed to create quiz');
        }
    };

    const handleDeleteQuiz = async (quizId: number) => {
        try {
            const response = await apiCall(`/quizzes/${quizId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                message.success('Quiz deleted successfully');
                fetchData();
            }
        } catch (error) {
            message.error('Failed to delete quiz');
        }
    };

    const toggleQuizStatus = async (quizId: number, isActive: boolean) => {
        try {
            const response = await apiCall(`/quizzes/${quizId}/toggle`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: !isActive })
            });

            if (response.ok) {
                message.success(`Quiz ${!isActive ? 'activated' : 'deactivated'} successfully`);
                fetchData();
            }
        } catch (error) {
            message.error('Failed to update quiz status');
        }
    };

    const batchColumns: ColumnsType<Batch> = [
        {
            title: 'Batch Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Students',
            key: 'students',
            render: (_, record) => (
                <div>
                    <Text>{record.current_students}/{record.max_students}</Text>
                    <Progress 
                        percent={(record.current_students / record.max_students) * 100} 
                        size="small" 
                        style={{ marginTop: 4 }}
                    />
                </div>
            )
        },
        {
            title: 'Duration',
            key: 'duration',
            render: (_, record) => (
                `${dayjs(record.start_date).format('MMM DD')} - ${dayjs(record.end_date).format('MMM DD, YYYY')}`
            )
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const now = dayjs();
                const start = dayjs(record.start_date);
                const end = dayjs(record.end_date);
                
                if (now.isBefore(start)) {
                    return <Tag color="blue">Upcoming</Tag>;
                } else if (now.isAfter(end)) {
                    return <Tag color="default">Completed</Tag>;
                } else {
                    return <Tag color="green">Active</Tag>;
                }
            }
        }
    ];

    const quizColumns: ColumnsType<Quiz> = [
        {
            title: 'Quiz Title',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: 'Batch',
            dataIndex: 'batch_name',
            key: 'batch_name'
        },
        {
            title: 'Questions',
            dataIndex: 'total_questions',
            key: 'total_questions'
        },
        {
            title: 'Time Limit',
            dataIndex: 'time_limit',
            key: 'time_limit',
            render: (time: number) => `${time} min`
        },
        {
            title: 'Submissions',
            dataIndex: 'submissions_count',
            key: 'submissions_count',
            render: (count: number) => count || 0
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingQuiz(record);
                            setQuizModalVisible(true);
                            quizForm.setFieldsValue(record);
                        }}
                    >
                        Edit
                    </Button>
                    <Button 
                        type="link"
                        onClick={() => navigate(`/teacher/quiz-results/${record.id}`)}
                    >
                        View Results
                    </Button>
                    <Button 
                        type="link"
                        onClick={() => toggleQuizStatus(record.id, record.is_active)}
                    >
                        {record.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this quiz?"
                        onConfirm={() => handleDeleteQuiz(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Title level={2}>Teacher Dashboard</Title>
            
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="My Batches"
                            value={stats.totalBatches}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Students"
                            value={stats.totalStudents}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Quizzes"
                            value={stats.totalQuizzes}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Score"
                            value={stats.averageScore}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs defaultActiveKey="batches">
                <TabPane tab="My Batches" key="batches">
                    <Card title="Batch Management">
                        <Table
                            columns={batchColumns}
                            dataSource={batches}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Quiz Management" key="quizzes">
                    <Card 
                        title="Quiz Management" 
                        extra={
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => {
                                    setEditingQuiz(null);
                                    setQuizModalVisible(true);
                                    quizForm.resetFields();
                                }}
                            >
                                Create Quiz
                            </Button>
                        }
                    >
                        <Table
                            columns={quizColumns}
                            dataSource={quizzes}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Student Progress" key="students">
                    <Card title="Student Performance">
                        <List
                            itemLayout="horizontal"
                            dataSource={students}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            renderItem={(student) => (
                                <List.Item
                                    actions={[
                                        <Button type="link">View Details</Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar 
                                                style={{ backgroundColor: '#87d068' }}
                                                icon={<UserOutlined />}
                                            />
                                        }
                                        title={`${student.first_name} ${student.last_name}`}
                                        description={
                                            <div>
                                                <Text type="secondary">{student.email}</Text>
                                                <br />
                                                <Text type="secondary">Batch: {student.batch_name}</Text>
                                            </div>
                                        }
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <Text strong style={{ fontSize: 16 }}>
                                            {student.average_score}%
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                            {student.quiz_scores.length} quizzes completed
                                        </Text>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>
            </Tabs>

            {/* Quiz Modal */}
            <Modal
                title={editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                open={quizModalVisible}
                onCancel={() => {
                    setQuizModalVisible(false);
                    setEditingQuiz(null);
                    quizForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={quizForm}
                    layout="vertical"
                    onFinish={handleCreateQuiz}
                >
                    <Form.Item
                        name="title"
                        label="Quiz Title"
                        rules={[{ required: true, message: 'Please enter quiz title' }]}
                    >
                        <Input placeholder="Enter quiz title" />
                    </Form.Item>
                    
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Enter quiz description" />
                    </Form.Item>
                    
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
                    
                    <Form.Item
                        name="time_limit"
                        label="Time Limit (minutes)"
                        rules={[
                            { required: true, message: 'Please enter time limit' },
                            { type: 'number', min: 1, message: 'Must be at least 1 minute' }
                        ]}
                    >
                        <Input type="number" placeholder="Enter time limit in minutes" />
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setQuizModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingQuiz ? 'Update' : 'Create'} Quiz
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TeacherDashboard;