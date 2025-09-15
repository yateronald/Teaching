import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    TimePicker,
    message,
    Space,
    Typography,
    Tag,
    Popconfirm,
    Card,
    Calendar,
    Badge,
    Tabs,
    Row,
    Col,
    Statistic
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name?: string;
    start_time: string;
    end_time: string;
    date: string;
    location: string;
    type: 'class' | 'exam' | 'meeting' | 'other';
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}

interface Batch {
    id: number;
    name: string;
    student_count?: number;
}

const ScheduleManagement: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [form] = Form.useForm();
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchSchedules();
        fetchBatches();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/schedules/my-schedules');
            if (response.ok) {
                const data = await response.json();
                setSchedules(data.schedules || []);
            } else {
                message.error('Failed to fetch schedules');
            }
        } catch (error) {
            message.error('Error fetching schedules');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await apiCall('/batches/my-batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(data.batches || []);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const scheduleData = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                start_time: values.start_time.format('HH:mm'),
                end_time: values.end_time.format('HH:mm'),
            };

            const endpoint = editingSchedule ? `/schedules/${editingSchedule.id}` : '/schedules';
            const method = editingSchedule ? 'PUT' : 'POST';
            
            const response = await apiCall(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData),
            });

            if (response.ok) {
                message.success(`Schedule ${editingSchedule ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingSchedule(null);
                fetchSchedules();
            } else {
                const errorData = await response.json();
                message.error(errorData.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Error saving schedule');
        }
    };

    const handleDelete = async (scheduleId: number) => {
        try {
            const response = await apiCall(`/schedules/${scheduleId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Schedule deleted successfully');
                fetchSchedules();
            } else {
                message.error('Failed to delete schedule');
            }
        } catch (error) {
            message.error('Error deleting schedule');
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        form.setFieldsValue({
            title: schedule.title,
            description: schedule.description,
            batch_id: schedule.batch_id,
            date: dayjs(schedule.date),
            start_time: dayjs(schedule.start_time, 'HH:mm'),
            end_time: dayjs(schedule.end_time, 'HH:mm'),
            location: schedule.location,
            type: schedule.type,
            status: schedule.status,
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingSchedule(null);
        form.resetFields();
        form.setFieldsValue({
            date: selectedDate,
            type: 'class',
            status: 'scheduled',
        });
        setModalVisible(true);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'class': return 'blue';
            case 'exam': return 'red';
            case 'meeting': return 'green';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'processing';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getListData = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        return schedules.filter(schedule => schedule.date === dateStr);
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map(item => (
                    <li key={item.id} style={{ marginBottom: 2 }}>
                        <Badge
                            status={getStatusColor(item.status) as any}
                            text={
                                <span style={{ fontSize: '11px' }}>
                                    {item.start_time} - {item.title}
                                </span>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    const columns: ColumnsType<Schedule> = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title: string, record) => (
                <div>
                    <Text strong>{title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.description}
                    </Text>
                </div>
            ),
        },
        {
            title: 'Batch',
            key: 'batch',
            render: (_, record) => {
                const batch = batches.find(b => b.id === record.batch_id);
                return batch ? batch.name : 'Unknown Batch';
            },
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            render: (_, record) => (
                <div>
                    <div>
                        <CalendarOutlined /> {dayjs(record.date).format('MMM DD, YYYY')}
                    </div>
                    <div style={{ marginTop: 4 }}>
                        <ClockCircleOutlined /> {record.start_time} - {record.end_time}
                    </div>
                </div>
            ),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={getTypeColor(type)}>
                    {type.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this schedule?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="primary"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const todaySchedules = schedules.filter(schedule => 
        schedule.date === dayjs().format('YYYY-MM-DD')
    );
    const upcomingSchedules = schedules.filter(schedule => 
        dayjs(schedule.date).isAfter(dayjs(), 'day')
    );
    const completedSchedules = schedules.filter(schedule => 
        schedule.status === 'completed'
    );

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>
                    <CalendarOutlined /> Schedule Management
                </Title>
                <Space>
                    <Button
                        type={viewMode === 'table' ? 'primary' : 'default'}
                        onClick={() => setViewMode('table')}
                    >
                        Table View
                    </Button>
                    <Button
                        type={viewMode === 'calendar' ? 'primary' : 'default'}
                        onClick={() => setViewMode('calendar')}
                    >
                        Calendar View
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add Schedule
                    </Button>
                </Space>
            </div>

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Today's Classes"
                            value={todaySchedules.length}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Upcoming"
                            value={upcomingSchedules.length}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={completedSchedules.length}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Total Schedules"
                            value={schedules.length}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {viewMode === 'table' ? (
                <Card>
                    <Tabs defaultActiveKey="all">
                        <TabPane tab={`All Schedules (${schedules.length})`} key="all">
                            <Table
                                columns={columns}
                                dataSource={schedules}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                }}
                            />
                        </TabPane>
                        <TabPane tab={`Today (${todaySchedules.length})`} key="today">
                            <Table
                                columns={columns}
                                dataSource={todaySchedules}
                                rowKey="id"
                                loading={loading}
                                pagination={false}
                            />
                        </TabPane>
                        <TabPane tab={`Upcoming (${upcomingSchedules.length})`} key="upcoming">
                            <Table
                                columns={columns}
                                dataSource={upcomingSchedules}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                }}
                            />
                        </TabPane>
                    </Tabs>
                </Card>
            ) : (
                <Card>
                    <Calendar
                        dateCellRender={dateCellRender}
                        onSelect={(date) => setSelectedDate(date)}
                    />
                </Card>
            )}

            <Modal
                title={editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingSchedule(null);
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please input schedule title!' }]}
                    >
                        <Input placeholder="Enter schedule title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <Input.TextArea rows={3} placeholder="Enter description (optional)" />
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

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Date"
                                rules={[{ required: true, message: 'Please select date!' }]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="start_time"
                                label="Start Time"
                                rules={[{ required: true, message: 'Please select start time!' }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name="end_time"
                                label="End Time"
                                rules={[{ required: true, message: 'Please select end time!' }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="location"
                        label="Location"
                        rules={[{ required: true, message: 'Please input location!' }]}
                    >
                        <Input placeholder="Enter location" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Type"
                                rules={[{ required: true, message: 'Please select type!' }]}
                            >
                                <Select>
                                    <Option value="class">Class</Option>
                                    <Option value="exam">Exam</Option>
                                    <Option value="meeting">Meeting</Option>
                                    <Option value="other">Other</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status!' }]}
                            >
                                <Select>
                                    <Option value="scheduled">Scheduled</Option>
                                    <Option value="completed">Completed</Option>
                                    <Option value="cancelled">Cancelled</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingSchedule ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingSchedule(null);
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ScheduleManagement;