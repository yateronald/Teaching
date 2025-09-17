import React, { useState, useEffect } from 'react';
import {
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
    Card,
    DatePicker,
    InputNumber,
    Switch,
    Tabs,
    List,
    Progress,
    Dropdown
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    BarChartOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import QuizBuilder from '../Quiz/QuizBuilder';
import QuizResults from '../Quiz/QuizResults';
import QuizInsights from '../Quiz/QuizInsights';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

// Extend dayjs with duration plugin
dayjs.extend(duration);

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Quiz {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name?: string;
    total_questions: number;
    duration_minutes: number;
    max_attempts: number;
    passing_score: number;
    // Replace legacy flags with backend status fields
    status: 'draft' | 'published';
    start_date?: string;
    end_date?: string;
    created_at: string;
    attempts_count?: number;
    avg_score?: number;
    // Added fields from backend aggregate
    batch_names?: string; // comma-separated batch names
    french_levels?: string; // comma-separated french levels
    submitted_students?: number;
    total_students?: number;
}

interface Batch {
    id: number;
    name: string;
}

const QuizManagement: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [quizBuilderVisible, setQuizBuilderVisible] = useState(false);
    const [quizResultsVisible, setQuizResultsVisible] = useState(false);
    const [quizInsightsVisible, setQuizInsightsVisible] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchQuizzes();
        fetchBatches();
    }, []);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/quizzes');
            if (response.ok) {
                const data = await response.json();
                setQuizzes(Array.isArray(data) ? data : (data.quizzes || []));
            } else {
                message.error('Failed to fetch quizzes');
            }
        } catch (error) {
            message.error('Error fetching quizzes');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const formData = {
                ...values,
                start_time: values.timeRange[0].toISOString(),
                end_time: values.timeRange[1].toISOString(),
            };
            delete formData.timeRange;

            const endpoint = editingQuiz ? `/quizzes/${editingQuiz.id}` : '/quizzes';
            const method = editingQuiz ? 'PUT' : 'POST';
            
            const response = await apiCall(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                message.success(`Quiz ${editingQuiz ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingQuiz(null);
                fetchQuizzes();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Error saving quiz');
        }
    };

    const handleDelete = async (quizId: number) => {
        try {
            const response = await apiCall(`/quizzes/${quizId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Quiz deleted successfully');
                fetchQuizzes();
            } else {
                message.error('Failed to delete quiz');
            }
        } catch (error) {
            message.error('Error deleting quiz');
        }
    };

    const handleEdit = (quiz: Quiz) => {
        setEditingQuiz(quiz);
        form.setFieldsValue({
            title: quiz.title,
            description: quiz.description,
            batch_id: quiz.batch_id,
            duration_minutes: quiz.duration_minutes,
            max_attempts: quiz.max_attempts,
            passing_score: quiz.passing_score,
            // status is controlled via publish action in builder; keep modal neutral
            timeRange: quiz.start_date && quiz.end_date ? [dayjs(quiz.start_date), dayjs(quiz.end_date)] : undefined,
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setSelectedQuizId(null);
        setQuizBuilderVisible(true);
    };

    const getStatusColor = (status: 'draft' | 'published', start?: string, end?: string) => {
        if (status !== 'published') return 'default'; // Draft
        // Published quizzes: derive schedule status from dates
        const now = dayjs();
        const startAt = start ? dayjs(start) : null;
        const endAt = end ? dayjs(end) : null;
        if (startAt && now.isBefore(startAt)) return 'orange'; // Scheduled
        if (endAt && now.isAfter(endAt)) return 'blue'; // Ended
        return 'green'; // Active
    };

    const getStatusText = (status: 'draft' | 'published', start?: string, end?: string) => {
        if (status !== 'published') return 'DRAFT';
        const now = dayjs();
        const startAt = start ? dayjs(start) : null;
        const endAt = end ? dayjs(end) : null;
        if (startAt && now.isBefore(startAt)) return 'SCHEDULED';
        if (endAt && now.isAfter(endAt)) return 'ENDED';
        return 'ACTIVE';
    };

    const formatRemainingTime = (endDate?: string) => {
        if (!endDate) return '—';
        
        const now = dayjs();
        const end = dayjs(endDate);
        const diff = end.diff(now);
        
        if (diff <= 0) return 'Time is up';
        
        const duration = dayjs.duration(diff);
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const months = Math.floor(days / 30);
        
        // More than 30 days: show months and days
        if (days > 30) {
            const remainingDays = days % 30;
            return `${months}mo ${remainingDays}d`;
        }
        
        // Less than a month but more than a day: show days and hours
        if (days >= 1) {
            return `${days}d ${hours}h`;
        }
        
        // Less than a day but more than an hour: show hours and minutes
        if (hours >= 1) {
            return `${hours}h ${minutes}m`;
        }
        
        // Less than an hour: show only minutes
        return `${minutes}m`;
    };

    const columns: ColumnsType<Quiz> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 180,
            fixed: 'left',
            ellipsis: true,
        },
        {
            title: 'Batch',
            key: 'batch',
            width: 120,
            ellipsis: true,
            render: (_, record) => record.batch_names || 'N/A',
        },
        {
            title: 'Level',
            key: 'french_level',
            width: 80,
            ellipsis: true,
            render: (_, record) => record.french_levels || '—',
        },
        {
            title: 'Questions',
            dataIndex: 'total_questions',
            key: 'total_questions',
            width: 90,
            align: 'center',
            render: (count: number) => (typeof count === 'number' ? count : 0),
        },
        {
            title: 'Duration',
            dataIndex: 'duration_minutes',
            key: 'duration_minutes',
            width: 80,
            align: 'center',
            render: (minutes: number) => `${minutes} min`,
        },
        {
            title: 'Attempts',
            key: 'attempts',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <span>
                    {(record.submitted_students ?? 0)} / {(record.total_students ?? 0)}
                </span>
            ),
        },
        {
            title: 'Avg Score',
            dataIndex: 'avg_score',
            key: 'avg_score',
            width: 100,
            align: 'center',
            render: (score: number) => (
                <Progress 
                    percent={score || 0} 
                    size="small" 
                    format={(percent) => `${percent}%`}
                />
            ),
        },
        {
            title: 'Remaining Time',
            key: 'remaining_time',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const remainingTime = formatRemainingTime(record.end_date);
                const isTimeUp = remainingTime === 'Time is up';
                return (
                    <span style={{ 
                        color: isTimeUp ? '#ff4d4f' : 
                               remainingTime.includes('m') && !remainingTime.includes('h') && !remainingTime.includes('d') ? '#faad14' : 
                               '#52c41a' 
                    }}>
                        {remainingTime}
                    </span>
                );
            },
        },
        {
            title: 'Status',
            key: 'status',
            width: 90,
            align: 'center',
            render: (_, record) => (
                <Tag color={getStatusColor(record.status, record.start_date, record.end_date)}>
                    {getStatusText(record.status, record.start_date, record.end_date)}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                const items = [
                    { key: 'insights', label: 'Insights', icon: <BarChartOutlined /> },
                    { key: 'results', label: 'Results', icon: <FileTextOutlined /> },
                    { key: 'edit', label: 'Edit Quiz', icon: <EditOutlined /> },
                    { key: 'delete', label: 'Delete Quiz', icon: <DeleteOutlined />, danger: true as any },
                ];

                const onMenuClick = ({ key }: { key: string }) => {
                    switch (key) {
                        case 'insights':
                            setSelectedQuizId(record.id);
                            setQuizInsightsVisible(true);
                            break;
                        case 'results':
                            setSelectedQuizId(record.id);
                            setQuizResultsVisible(true);
                            break;
                        case 'edit':
                            setSelectedQuizId(record.id);
                            setQuizBuilderVisible(true);
                            break;
                        case 'delete':
                            Modal.confirm({
                                title: 'Delete this quiz?',
                                content: 'This action cannot be undone.',
                                okText: 'Delete',
                                okType: 'danger',
                                onOk: () => handleDelete(record.id),
                            });
                            break;
                        default:
                            break;
                    }
                };

                return (
                    <Dropdown
                        menu={{ items, onClick: onMenuClick }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            size="small"
                            icon={<MoreOutlined />}
                            style={{ padding: '4px 8px' }}
                        />
                    </Dropdown>
                );
            },
        },
    ];

    const activeQuizzes = quizzes.filter(quiz => {
        const now = dayjs();
        const start = quiz.start_date ? dayjs(quiz.start_date) : null;
        const end = quiz.end_date ? dayjs(quiz.end_date) : null;
        return quiz.status === 'published' && (!start || now.isAfter(start)) && (!end || now.isBefore(end));
    });

    const scheduledQuizzes = quizzes.filter(quiz => {
        const now = dayjs();
        const start = quiz.start_date ? dayjs(quiz.start_date) : null;
        return quiz.status === 'published' && !!start && now.isBefore(start);
    });

    const endedQuizzes = quizzes.filter(quiz => {
        const now = dayjs();
        const end = quiz.end_date ? dayjs(quiz.end_date) : null;
        return quiz.status === 'published' && !!end && now.isAfter(end);
    });

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>
                    <FileTextOutlined /> Quiz Management
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Create Quiz
                </Button>
            </div>

            <Card>
                <Tabs defaultActiveKey="all">
                    <TabPane tab={`All Quizzes (${quizzes.length})`} key="all">
                        <Table
                            columns={columns}
                            dataSource={quizzes}
                            rowKey="id"
                            loading={loading}
                            scroll={{ x: 1000, y: 400 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} quizzes`
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Active (${activeQuizzes.length})`} key="active">
                        <Table
                            columns={columns}
                            dataSource={activeQuizzes}
                            rowKey="id"
                            loading={loading}
                            scroll={{ x: 1000, y: 400 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} active quizzes`
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Scheduled (${scheduledQuizzes.length})`} key="scheduled">
                        <Table
                            columns={columns}
                            dataSource={scheduledQuizzes}
                            rowKey="id"
                            loading={loading}
                            scroll={{ x: 1000, y: 400 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} scheduled quizzes`
                            }}
                        />
                    </TabPane>
                    <TabPane tab={`Ended (${endedQuizzes.length})`} key="ended">
                        <Table
                            columns={columns}
                            dataSource={endedQuizzes}
                            rowKey="id"
                            loading={loading}
                            scroll={{ x: 1000, y: 400 }}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} ended quizzes`
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title={editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingQuiz(null);
                }}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Quiz Title"
                        rules={[{ required: true, message: 'Please input quiz title!' }]}
                    >
                        <Input placeholder="Enter quiz title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please input description!' }]}
                    >
                        <TextArea rows={3} placeholder="Enter quiz description" />
                    </Form.Item>

                    <Form.Item
                        name="batch_id"
                        label="Batch"
                        rules={[{ required: true, message: 'Please select a batch!' }]}
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
                        name="timeRange"
                        label="Quiz Duration"
                        rules={[{ required: true, message: 'Please select start and end times!' }]}
                    >
                        <DatePicker.RangePicker 
                            showTime 
                            style={{ width: '100%' }}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration_minutes"
                        label="Time Limit (minutes)"
                        rules={[
                            { required: true, message: 'Please input time limit!' },
                        ]}
                    >
                        <InputNumber min={1} max={300} placeholder="Enter time limit in minutes" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="max_attempts"
                        label="Maximum Attempts"
                        rules={[
                            { required: true, message: 'Please input maximum attempts!' },
                        ]}
                    >
                        <InputNumber min={1} max={10} placeholder="Enter maximum attempts" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="passing_score"
                        label="Passing Score (%)"
                        rules={[
                            { required: true, message: 'Please input passing score!' },
                        ]}
                    >
                        <InputNumber min={0} max={100} placeholder="Enter passing score percentage" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="Active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingQuiz ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingQuiz(null);
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* QuizBuilder Modal */}
            <Modal
                title={selectedQuizId ? 'Edit Quiz' : 'Create Quiz'}
                open={quizBuilderVisible}
                onCancel={() => {
                    setQuizBuilderVisible(false);
                    setSelectedQuizId(null);
                }}
                footer={null}
                width={1200}
                style={{ top: 20 }}
            >
                <QuizBuilder 
                    quizId={selectedQuizId?.toString()}
                    onComplete={() => {
                        setQuizBuilderVisible(false);
                        setSelectedQuizId(null);
                        fetchQuizzes(); // Refresh quiz list
                    }}
                />
            </Modal>

            {/* QuizResults Modal */}
            <Modal
                title="Quiz Results"
                open={quizResultsVisible}
                onCancel={() => {
                    setQuizResultsVisible(false);
                    setSelectedQuizId(null);
                }}
                footer={null}
                width={1200}
                style={{ top: 20 }}
            >
                {selectedQuizId && <QuizResults quizId={selectedQuizId.toString()} />}
            </Modal>

            {/* Quiz Insights Modal */}
            <Modal
                title="Quiz Insights"
                open={quizInsightsVisible}
                onCancel={() => {
                    setQuizInsightsVisible(false);
                    setSelectedQuizId(null);
                }}
                footer={null}
                width={1200}
                style={{ top: 20 }}
            >
                <QuizInsights
                    quizId={selectedQuizId?.toString()}
                />
            </Modal>
        </div>
    );
};

export default QuizManagement;