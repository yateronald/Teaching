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
    Card,
    DatePicker,
    TimePicker,
    Checkbox,
    Row,
    Col,
    Divider,
    Popconfirm
} from 'antd';
import {
    PlusOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Batch {
    id: number;
    name: string;
    french_level: string;
    teacher_id: number;
    teacher_first_name?: string;
    teacher_last_name?: string;
    start_date: string;
    end_date: string;
    student_count: number;
    created_at: string;
}

interface Person {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const BatchManagement: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Person[]>([]);
    const [students, setStudents] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [form] = Form.useForm();
    const { apiCall } = useAuth();
    const navigate = useNavigate();

    // Timetable state
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [scheduleType, setScheduleType] = useState<'all' | 'workdays' | 'weekends' | 'custom'>('custom');
    const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
    const [scheduleMode, setScheduleMode] = useState<'same' | 'different'>('different');
    const [masterSchedule, setMasterSchedule] = useState({
        start_time: '09:00',
        end_time: '10:00',
        timezone: 'UTC',
        location_mode: 'physical',
        location: '',
        link: ''
    });

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
        fetchStudents();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                // Backend returns an array directly
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            } else {
                message.error('Failed to fetch batches');
            }
        } catch (error) {
            message.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            // Use dedicated teachers endpoint and handle array response
            const response = await apiCall('/users/role/teachers');
            if (response.ok) {
                const data = await response.json();
                setTeachers(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await apiCall('/users/role/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const baseData: any = {
                name: values.name,
                teacher_id: values.teacher_id,
                french_level: values.french_level,
                // Send ISO8601 strings to match backend validator
                start_date: values.dateRange[0].toDate().toISOString(),
                end_date: values.dateRange[1].toDate().toISOString(),
                // Timetable data
                timezone: values.timezone || 'UTC',
                default_location_mode: values.default_location_mode || 'physical',
                default_location: values.default_location,
                default_link: values.default_link,
                timetable: timetableEntries
            };

            const endpoint = editingBatch ? `/batches/${editingBatch.id}` : '/batches';
            const method = editingBatch ? 'PUT' : 'POST';

            // On create, backend requires student_ids array (min 1)
            const body = editingBatch
                ? baseData
                : { ...baseData, student_ids: values.student_ids };
            
            const response = await apiCall(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                message.success(`Batch ${editingBatch ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingBatch(null);
                // Reset timetable state
                setSelectedDays([]);
                setScheduleType('custom');
                setTimetableEntries([]);
                setScheduleMode('different');
                setMasterSchedule({
                    start_time: '09:00',
                    end_time: '10:00',
                    timezone: 'UTC',
                    location_mode: 'physical',
                    location: '',
                    link: ''
                });
                fetchBatches();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Error saving batch');
        }
    };

    // Timetable helper functions
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timezones = [
        'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
    ];

    const handleScheduleTypeChange = (type: 'all' | 'workdays' | 'weekends' | 'custom') => {
        setScheduleType(type);
        let days: number[] = [];
        
        switch (type) {
            case 'all':
                days = [0, 1, 2, 3, 4, 5, 6];
                break;
            case 'workdays':
                days = [1, 2, 3, 4, 5];
                break;
            case 'weekends':
                days = [0, 6];
                break;
            case 'custom':
                days = selectedDays;
                break;
        }
        
        setSelectedDays(days);
        updateTimetableEntries(days);
    };

    const updateTimetableEntries = (days: number[]) => {
        const newEntries = days.map(day => {
            const existing = timetableEntries.find(entry => entry.day_of_week === day);
            return existing || {
                day_of_week: day,
                start_time: '09:00',
                end_time: '10:00',
                timezone: 'UTC',
                location_mode: 'physical',
                location: '',
                link: ''
            };
        });
        setTimetableEntries(newEntries);
    };

    const updateTimetableEntry = (dayOfWeek: number, field: string, value: any) => {
        setTimetableEntries(prev => 
            prev.map(entry => 
                entry.day_of_week === dayOfWeek 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
    };

    const handleScheduleModeChange = (mode: 'same' | 'different') => {
        setScheduleMode(mode);
        
        // If switching to 'same' mode, apply master schedule to all entries
        if (mode === 'same' && timetableEntries.length > 0) {
            setTimetableEntries(prev => 
                prev.map(entry => ({
                    ...entry,
                    start_time: masterSchedule.start_time,
                    end_time: masterSchedule.end_time,
                    timezone: masterSchedule.timezone,
                    location_mode: masterSchedule.location_mode,
                    location: masterSchedule.location,
                    link: masterSchedule.link
                }))
            );
        }
    };

    const handleDelete = async (batchId: number) => {
        try {
            const response = await apiCall(`/batches/${batchId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Batch deleted successfully');
                fetchBatches();
            } else {
                message.error('Failed to delete batch');
            }
        } catch (error) {
            message.error('Error deleting batch');
        }
    };

    const handleEdit = (batch: Batch) => {
        setEditingBatch(batch);
        form.setFieldsValue({
            name: batch.name,
            french_level: batch.french_level,
            teacher_id: batch.teacher_id,
            dateRange: [
                dayjs(batch.start_date),
                dayjs(batch.end_date)
            ],
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingBatch(null);
        form.resetFields();
        setModalVisible(true);
    };



    // Helper to format duration as days only
    const formatDaysOnly = (startISO: string, endISO: string) => {
        const start = new Date(startISO);
        const end = new Date(endISO);
        const startTime = start.getTime();
        const endTime = end.getTime();
        const diff = endTime - startTime;
        if (Number.isNaN(startTime) || Number.isNaN(endTime) || diff < 0) return '—';
        const dayMs = 24 * 60 * 60 * 1000;
        const days = Math.floor(diff / dayMs);
        return `${days} day${days !== 1 ? 's' : ''}`;
    };

    const columns: ColumnsType<Batch> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            fixed: 'left',
            ellipsis: true,
        },
        {
            title: 'French Level',
            dataIndex: 'french_level',
            key: 'french_level',
            width: 200,
            ellipsis: true,
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_id',
            key: 'teacher_name',
            width: 180,
            ellipsis: true,
            render: (_, record) => {
                if (record.teacher_first_name || record.teacher_last_name) {
                    return `${record.teacher_first_name || ''} ${record.teacher_last_name || ''}`.trim();
                }
                const teacher = teachers.find(t => t.id === record.teacher_id);
                return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'N/A';
            },
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 220,
            render: (_, record) => (
                <span>{formatDaysOnly(record.start_date, record.end_date)}</span>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'student_count',
            key: 'students',
            width: 120,
        },
        // Keeping Status column colors utility in case it's used later
        // but not displayed since backend doesn't provide status
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="default" onClick={() => navigate(`/batches/${record.id}/insights`)}>
                        Insight
                    </Button>
                    <Button type="primary" onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm
                        title="Are you sure you want to delete this batch?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
            width: 200
        },
    ];

    return (
        <Card style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }} styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <TeamOutlined /> Batch Management
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Batch
                </Button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Table
                    columns={columns}
                    dataSource={batches}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 1000, y: 'calc(100vh - 280px)' }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches`,
                        pageSizeOptions: ['10', '15', '25', '50'],
                    }}
                />
            </div>

            <Modal
                title={editingBatch ? 'Edit Batch' : 'Add Batch'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingBatch(null);
                    // Reset timetable state
                    setSelectedDays([]);
                    setScheduleType('custom');
                    setTimetableEntries([]);
                    setScheduleMode('different');
                    setMasterSchedule({
                        start_time: '09:00',
                        end_time: '10:00',
                        timezone: 'UTC',
                        location_mode: 'physical',
                        location: '',
                        link: ''
                    });
                }}
                footer={null}
                width={900}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Batch Name"
                        rules={[{ required: true, message: 'Please input batch name!' }]}
                    >
                        <Input placeholder="Enter batch name" />
                    </Form.Item>

                    <Form.Item
                        name="french_level"
                        label="French Level"
                        rules={[{ required: true, message: 'Please select French level!' }]}
                    >
                        <Select placeholder="Select French level">
                            <Option value="A1">A1</Option>
                            <Option value="A2">A2</Option>
                            <Option value="B1">B1</Option>
                            <Option value="B2">B2</Option>
                            <Option value="C1">C1</Option>
                            <Option value="C2">C2</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="teacher_id"
                        label="Teacher"
                        rules={[{ required: true, message: 'Please select a teacher!' }]}
                    >
                        <Select
                            placeholder="Select teacher"
                            showSearch
                            optionFilterProp="children"
                        >
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name} ({teacher.email})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider orientation="left">
                        <Space>
                            <CalendarOutlined />
                            Timetable Configuration
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="timezone"
                                label="Timezone"
                                initialValue="UTC"
                            >
                                <Select placeholder="Select timezone">
                                    {timezones.map(tz => (
                                        <Option key={tz} value={tz}>{tz}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="default_location_mode"
                                label="Default Location Mode"
                                initialValue="physical"
                            >
                                <Select>
                                    <Option value="physical">Physical</Option>
                                    <Option value="online">Online</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="default_location"
                                label="Default Location"
                            >
                                <Input placeholder="e.g., Room 101, Building A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="default_link"
                                label="Default Meeting Link"
                            >
                                <Input placeholder="e.g., https://zoom.us/j/..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Weekly Schedule">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Typography.Text strong>Schedule Type:</Typography.Text>
                                <br />
                                <Space wrap style={{ marginTop: 8 }}>
                                    <Button 
                                        type={scheduleType === 'all' ? 'primary' : 'default'}
                                        onClick={() => handleScheduleTypeChange('all')}
                                        size="small"
                                    >
                                        All Days
                                    </Button>
                                    <Button 
                                        type={scheduleType === 'workdays' ? 'primary' : 'default'}
                                        onClick={() => handleScheduleTypeChange('workdays')}
                                        size="small"
                                    >
                                        Workdays (Mon-Fri)
                                    </Button>
                                    <Button 
                                        type={scheduleType === 'weekends' ? 'primary' : 'default'}
                                        onClick={() => handleScheduleTypeChange('weekends')}
                                        size="small"
                                    >
                                        Weekends
                                    </Button>
                                    <Button 
                                        type={scheduleType === 'custom' ? 'primary' : 'default'}
                                        onClick={() => handleScheduleTypeChange('custom')}
                                        size="small"
                                    >
                                        Custom
                                    </Button>
                                </Space>
                            </div>

                            {(scheduleType === 'all' || scheduleType === 'workdays' || scheduleType === 'weekends' || selectedDays.length > 1) && (
                                <div>
                                    <Typography.Text strong>Schedule Mode:</Typography.Text>
                                    <br />
                                    <Space wrap style={{ marginTop: 8 }}>
                                        <Button 
                                            type={scheduleMode === 'same' ? 'primary' : 'default'}
                                            onClick={() => handleScheduleModeChange('same')}
                                            size="small"
                                            icon={<ClockCircleOutlined />}
                                        >
                                            Same Schedule
                                        </Button>
                                        <Button 
                                            type={scheduleMode === 'different' ? 'primary' : 'default'}
                                            onClick={() => handleScheduleModeChange('different')}
                                            size="small"
                                            icon={<CalendarOutlined />}
                                        >
                                            Different Schedule
                                        </Button>
                                    </Space>
                                    <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                                        {scheduleMode === 'same' 
                                            ? 'Enter one schedule and apply to all selected days' 
                                            : 'Configure individual schedule for each day'
                                        }
                                    </Typography.Text>
                                </div>
                            )}

                            {scheduleType === 'custom' && (
                                <div>
                                    <Typography.Text strong>Select Days:</Typography.Text>
                                    <br />
                                    <Checkbox.Group 
                                        value={selectedDays}
                                        onChange={(days) => {
                                            setSelectedDays(days as number[]);
                                            updateTimetableEntries(days as number[]);
                                        }}
                                        style={{ marginTop: 8 }}
                                    >
                                        <Row>
                                            {dayNames.map((day, index) => (
                                                <Col span={8} key={index}>
                                                    <Checkbox value={index}>{day}</Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </div>
                            )}

                            {timetableEntries.length > 0 && (
                                <div>
                                    <Typography.Text strong>Schedule Details:</Typography.Text>
                                    
                                    {scheduleMode === 'same' ? (
                                        // Single master schedule form
                                        <div style={{ marginTop: 8 }}>
                                            <Card 
                                                size="small" 
                                                style={{ marginBottom: 8 }}
                                                title={
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        Master Schedule (applies to all selected days)
                                                    </Space>
                                                }
                                            >
                                                <Row gutter={8}>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary">Start:</Typography.Text>
                                                        <TimePicker
                                                            value={dayjs(masterSchedule.start_time, 'HH:mm')}
                                                            format="HH:mm"
                                                            onChange={(time) => {
                                                                const newTime = time?.format('HH:mm') || '09:00';
                                                                setMasterSchedule(prev => ({ ...prev, start_time: newTime }));
                                                                // Apply to all entries
                                                                setTimetableEntries(prev => 
                                                                    prev.map(entry => ({ ...entry, start_time: newTime }))
                                                                );
                                                            }}
                                                            size="small"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Col>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary">End:</Typography.Text>
                                                        <TimePicker
                                                            value={dayjs(masterSchedule.end_time, 'HH:mm')}
                                                            format="HH:mm"
                                                            onChange={(time) => {
                                                                const newTime = time?.format('HH:mm') || '10:00';
                                                                setMasterSchedule(prev => ({ ...prev, end_time: newTime }));
                                                                // Apply to all entries
                                                                setTimetableEntries(prev => 
                                                                    prev.map(entry => ({ ...entry, end_time: newTime }))
                                                                );
                                                            }}
                                                            size="small"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </Col>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary">Mode:</Typography.Text>
                                                        <Select
                                                            value={masterSchedule.location_mode}
                                                            onChange={(value) => {
                                                                setMasterSchedule(prev => ({ ...prev, location_mode: value }));
                                                                // Apply to all entries
                                                                setTimetableEntries(prev => 
                                                                    prev.map(entry => ({ ...entry, location_mode: value }))
                                                                );
                                                            }}
                                                            size="small"
                                                            style={{ width: '100%' }}
                                                        >
                                                            <Option value="physical">Physical</Option>
                                                            <Option value="online">Online</Option>
                                                        </Select>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary">
                                                            {masterSchedule.location_mode === 'physical' ? 'Location:' : 'Link:'}
                                                        </Typography.Text>
                                                        <Input
                                                            value={masterSchedule.location_mode === 'physical' ? masterSchedule.location : masterSchedule.link}
                                                            onChange={(e) => {
                                                                const field = masterSchedule.location_mode === 'physical' ? 'location' : 'link';
                                                                setMasterSchedule(prev => ({ ...prev, [field]: e.target.value }));
                                                                // Apply to all entries
                                                                setTimetableEntries(prev => 
                                                                    prev.map(entry => ({ ...entry, [field]: e.target.value }))
                                                                );
                                                            }}
                                                            size="small"
                                                            placeholder={masterSchedule.location_mode === 'physical' ? 'Room 101' : 'Meeting link'}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card>
                                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                Selected days: {timetableEntries.map(entry => dayNames[entry.day_of_week]).join(', ')}
                                            </Typography.Text>
                                        </div>
                                    ) : (
                                        // Individual schedule forms
                                        <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                                            {timetableEntries.map((entry) => (
                                                <Card 
                                                    key={entry.day_of_week} 
                                                    size="small" 
                                                    style={{ marginBottom: 8 }}
                                                    title={
                                                        <Space>
                                                            <ClockCircleOutlined />
                                                            {dayNames[entry.day_of_week]}
                                                        </Space>
                                                    }
                                                >
                                                    <Row gutter={8}>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">Start:</Typography.Text>
                                                            <TimePicker
                                                                value={dayjs(entry.start_time, 'HH:mm')}
                                                                format="HH:mm"
                                                                onChange={(time) => 
                                                                    updateTimetableEntry(entry.day_of_week, 'start_time', time?.format('HH:mm'))
                                                                }
                                                                size="small"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Col>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">End:</Typography.Text>
                                                            <TimePicker
                                                                value={dayjs(entry.end_time, 'HH:mm')}
                                                                format="HH:mm"
                                                                onChange={(time) => 
                                                                    updateTimetableEntry(entry.day_of_week, 'end_time', time?.format('HH:mm'))
                                                                }
                                                                size="small"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Col>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">Mode:</Typography.Text>
                                                            <Select
                                                                value={entry.location_mode}
                                                                onChange={(value) => 
                                                                    updateTimetableEntry(entry.day_of_week, 'location_mode', value)
                                                                }
                                                                size="small"
                                                                style={{ width: '100%' }}
                                                            >
                                                                <Option value="physical">Physical</Option>
                                                                <Option value="online">Online</Option>
                                                            </Select>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">
                                                                {entry.location_mode === 'physical' ? 'Location:' : 'Link:'}
                                                            </Typography.Text>
                                                            <Input
                                                                value={entry.location_mode === 'physical' ? entry.location : entry.link}
                                                                onChange={(e) => 
                                                                    updateTimetableEntry(
                                                                        entry.day_of_week, 
                                                                        entry.location_mode === 'physical' ? 'location' : 'link', 
                                                                        e.target.value
                                                                    )
                                                                }
                                                                size="small"
                                                                placeholder={entry.location_mode === 'physical' ? 'Room 101' : 'Meeting link'}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Space>
                    </Form.Item>

                    <Divider />

                    <Form.Item
                        name="dateRange"
                        label="Duration"
                        rules={[{ required: true, message: 'Please select start and end date and time!' }]}
                    >
                        <RangePicker
                            style={{ width: '100%' }}
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                        />
                    </Form.Item>

                    {!editingBatch && (
                        <Form.Item
                            name="student_ids"
                            label="Students"
                            rules={[{ required: true, message: 'Please select at least one student!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select students"
                                showSearch
                                optionFilterProp="children"
                            >
                                {students.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} ({s.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingBatch ? 'Update' : 'Create'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingBatch(null);
                                // Reset timetable state
                                setSelectedDays([]);
                                setScheduleType('custom');
                                setTimetableEntries([]);
                                setScheduleMode('different');
                                setMasterSchedule({
                                    start_time: '09:00',
                                    end_time: '10:00',
                                    timezone: 'UTC',
                                    location_mode: 'physical',
                                    location: '',
                                    link: ''
                                });
                            }}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default BatchManagement;