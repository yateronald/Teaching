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
    Tabs,
    Row,
    Col,
    Statistic,
    Descriptions
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
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name?: string;
    start_time: string; // HH:mm for UI
    end_time: string;   // HH:mm for UI
    date: string;       // YYYY-MM-DD for UI
    location: string;
    location_mode?: 'online' | 'physical';
    link?: string | null;
    type: 'class' | 'exam' | 'meeting' | 'other' | 'assignment' | 'quiz';
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}

interface BackendSchedule {
    id: number;
    title: string;
    description: string | null;
    batch_id: number;
    batch_name?: string;
    start_time: string; // ISO
    end_time: string;   // ISO
    location?: string | null;
    location_mode?: 'online' | 'physical';
    link?: string | null;
    type: string;
    status: string;
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

    // New: view-only modal state for event details
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [viewSchedule, setViewSchedule] = useState<Schedule | null>(null);

    useEffect(() => {
        fetchSchedules();
        fetchBatches();
    }, []);

    const normalizeFromBackend = (items: BackendSchedule[]): Schedule[] => {
        return items.map(item => {
            const date = dayjs(item.start_time);
            const end = dayjs(item.end_time);
            return {
                id: item.id,
                title: item.title,
                description: item.description || '',
                batch_id: item.batch_id,
                batch_name: item.batch_name,
                start_time: date.format('HH:mm'),
                end_time: end.format('HH:mm'),
                date: date.format('YYYY-MM-DD'),
                location: item.location || '',
                location_mode: item.location_mode || 'physical',
                link: item.link || null,
                type: (item.type as any) || 'class',
                status: (item.status as any) || 'scheduled',
                created_at: item.created_at,
            };
        });
    };

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/schedules');
            if (response.ok) {
                const data = await response.json();
                setSchedules(normalizeFromBackend(data.schedules || data || []));
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
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(data);
            } else {
                message.error('Failed to fetch batches');
            }
        } catch (error) {
            message.error('Error fetching batches');
        }
    };

    const combineToISO = (date: Dayjs, time: Dayjs) => {
        return dayjs(date)
            .hour(time.hour())
            .minute(time.minute())
            .second(0)
            .millisecond(0)
            .toISOString();
    };

    const handleSubmit = async (values: any) => {
        const isEditing = !!editingSchedule;
        const startISO = combineToISO(values.date, values.start_time);
        const endISO = combineToISO(values.date, values.end_time);

        if (dayjs(endISO).isBefore(dayjs(startISO))) {
            message.error('End time cannot be before start time');
            return;
        }

        // Prevent creating schedules in the past
        if (!isEditing && dayjs(startISO).isBefore(dayjs())) {
            message.error('Cannot create schedules in the past');
            return;
        }

        const payload: any = {
            title: values.title,
            description: values.description || '',
            batch_id: values.batch_id,
            start_time: startISO,
            end_time: endISO,
            type: values.type,
            status: values.status,
            location_mode: values.location_mode,
            location: values.location_mode === 'physical' ? values.location : undefined,
            link: values.location_mode === 'online' ? (values.link || '') : undefined,
        };

        try {
            const resp = await apiCall(isEditing ? `/schedules/${editingSchedule?.id}` : '/schedules', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) {
                const er = await resp.json().catch(() => ({}));
                message.error(er.error || er.message || 'Failed to save schedule');
            } else {
                message.success(`Schedule ${isEditing ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                fetchSchedules();
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
                setViewModalVisible(false);
                setViewSchedule(null);
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
            date: dayjs(schedule.date, 'YYYY-MM-DD'),
            start_time: dayjs(`${schedule.date}T${schedule.start_time}`),
            end_time: dayjs(`${schedule.date}T${schedule.end_time}`),
            location: schedule.location,
            link: schedule.link || undefined,
            type: schedule.type,
            status: schedule.status,
            location_mode: schedule.location_mode || 'physical',
        });
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingSchedule(null);
        form.resetFields();
        const now = dayjs().add(15, 'minute').second(0).millisecond(0);
        form.setFieldsValue({
            date: now,
            start_time: now,
            end_time: now.add(1, 'hour'),
            type: 'class',
            status: 'scheduled',
            location_mode: 'physical',
        });
        setModalVisible(true);
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'class': return 'blue';
            case 'exam': return 'red';
            case 'meeting': return 'green';
            case 'assignment': return 'orange';
            case 'quiz': return 'purple';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'processing';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            case 'ended': return 'default';
            default: return 'default';
        }
    };

    // Helper function to check if schedule has ended
    const isScheduleEnded = (schedule: Schedule) => {
        const now = dayjs();
        const scheduleEnd = dayjs(`${schedule.date}T${schedule.end_time}`);
        return now.isAfter(scheduleEnd);
    };

    // Helper function to get effective status (including ended)
    const getEffectiveStatus = (schedule: Schedule) => {
        if (schedule.status === 'completed' || schedule.status === 'cancelled') {
            return schedule.status;
        }
        return isScheduleEnded(schedule) ? 'ended' : schedule.status;
    };

    // FullCalendar color palette by type
    const typeColors: Record<string, string> = {
        class: '#1677ff',
        exam: '#ff4d4f',
        meeting: '#52c41a',
        assignment: '#fa8c16',
        quiz: '#722ed1',
        other: '#6c757d',
    };

    // Convert schedules to FullCalendar events
    const events = React.useMemo(() => {
        return schedules.map((s) => {
            const startD = dayjs(`${s.date}T${s.start_time}`);
            let endD = dayjs(`${s.date}T${s.end_time}`);
            if (!endD.isValid() || !endD.isAfter(startD)) {
                endD = startD.add(1, 'hour');
            }
            const color = typeColors[s.type] || '#1677ff';
            return {
                id: String(s.id),
                title: s.title,
                start: startD.toDate(),
                end: endD.toDate(),
                allDay: false,
                backgroundColor: color,
                borderColor: color,
                extendedProps: { schedule: s },
            } as any;
        });
    }, [schedules]);

    const handleEventClick = (clickInfo: any) => {
        const sched: Schedule | undefined = clickInfo?.event?.extendedProps?.schedule;
        if (sched) {
            setViewSchedule(sched);
            setViewModalVisible(true);
        }
    };

    const handleSelect = (selectInfo: any) => {
        const start = dayjs(selectInfo.startStr);
        const end = dayjs(selectInfo.endStr);
        const viewType = selectInfo?.view?.type;

        setEditingSchedule(null);
        form.resetFields();

        if (viewType === 'dayGridMonth') {
            const day = start.startOf('day');
            const base = day.isSame(dayjs(), 'day') ? dayjs().add(15, 'minute') : day.hour(9);
            const s = base.second(0).millisecond(0);
            const e = s.add(1, 'hour');
            form.setFieldsValue({
                date: day,
                start_time: s,
                end_time: e,
                type: 'class',
                status: 'scheduled',
                location_mode: 'physical',
            });
        } else {
            const s = start.isBefore(dayjs()) ? dayjs().add(15, 'minute') : start;
            const e = end.isValid() && end.isAfter(s) ? end : s.add(1, 'hour');
            form.setFieldsValue({
                date: s,
                start_time: s,
                end_time: e,
                type: 'class',
                status: 'scheduled',
                location_mode: 'physical',
            });
        }
        setModalVisible(true);
    };

    const updateScheduleTime = async (id: number, startISO: string, endISO: string) => {
        const sched = schedules.find(s => s.id === id);
        if (!sched) return;
        try {
            const payload: any = {
                title: sched.title,
                description: sched.description || '',
                batch_id: sched.batch_id,
                start_time: startISO,
                end_time: endISO,
                type: sched.type,
                status: sched.status,
                location_mode: sched.location_mode || 'physical',
                location: (sched.location_mode === 'physical') ? sched.location : undefined,
                link: (sched.location_mode === 'online') ? (sched.link || '') : undefined,
            };
            const resp = await apiCall(`/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) {
                const er = await resp.json().catch(() => ({}));
                message.error(er.error || er.message || 'Failed to update schedule');
            } else {
                message.success('Schedule updated');
                fetchSchedules();
            }
        } catch (e) {
            message.error('Error updating schedule');
        }
    };

    const handleEventDrop = async (changeInfo: any) => {
        const id = Number(changeInfo.event.id);
        const startISO = changeInfo.event.start?.toISOString();
        const endISO = changeInfo.event.end?.toISOString() || (startISO ? dayjs(startISO).add(1, 'hour').toISOString() : undefined);
        if (startISO && endISO) {
            await updateScheduleTime(id, startISO, endISO);
        }
    };

    const handleEventResize = async (resizeInfo: any) => {
        const id = Number(resizeInfo.event.id);
        const startISO = resizeInfo.event.start?.toISOString();
        const endISO = resizeInfo.event.end?.toISOString();
        if (startISO && endISO) {
            await updateScheduleTime(id, startISO, endISO);
        }
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
                return batch ? batch.name : (record.batch_name || 'Unknown Batch');
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
            key: 'location',
            render: (_, record) => (
                record.location_mode === 'online' ? (
                    renderJoinMeetingButton(record)
                ) : (
                    record.location || '--'
                )
            ),
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
            render: (status: string, record: Schedule) => (
                <Tag color={getStatusColor(getEffectiveStatus(record))}>
                    {getEffectiveStatus(record).toUpperCase()}
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

    // Helper function to check if join button should be enabled (20 minutes before meeting for teachers)
    const canJoinMeeting = (schedule: Schedule): boolean => {
        const now = dayjs();
        const meetingStart = dayjs(`${schedule.date} ${schedule.start_time}`);
        const twentyMinutesBefore = meetingStart.subtract(20, 'minutes');
        const meetingEnd = dayjs(`${schedule.date} ${schedule.end_time}`);
        
        // Enable if current time is between 20 minutes before start and meeting end
        return now.isAfter(twentyMinutesBefore) && now.isBefore(meetingEnd);
    };

    // Secure function to get meeting link only when authorized
    const getSecureMeetingLink = (schedule: Schedule): string | null => {
        if (!schedule.link || !canJoinMeeting(schedule)) {
            return null; // Don't expose link in source when not authorized
        }
        return schedule.link;
    };

    // Render Join Meeting button
    const renderJoinMeetingButton = (schedule: Schedule) => {
        const canJoin = canJoinMeeting(schedule);
        const secureLink = getSecureMeetingLink(schedule);
        const hasEnded = isScheduleEnded(schedule);
        
        if (!schedule.link) {
            return 'Online';
        }

        return (
            <Button
                type="primary"
                size="small"
                disabled={!canJoin || hasEnded}
                style={{
                    backgroundColor: hasEnded ? '#d9d9d9' : (canJoin ? '#52c41a' : '#d9d9d9'),
                    borderColor: hasEnded ? '#d9d9d9' : (canJoin ? '#52c41a' : '#d9d9d9'),
                    color: hasEnded ? '#00000040' : (canJoin ? '#fff' : '#00000040')
                }}
                onClick={() => {
                    if (secureLink && !hasEnded) {
                        window.open(secureLink, '_blank', 'noopener,noreferrer');
                    }
                }}
                title={hasEnded ? 'Meeting has ended' : (canJoin ? 'Click to join the meeting' : 'Meeting will be available 20 minutes before start time')}
            >
                {hasEnded ? 'Meeting Ended' : 'Join Meeting'}
            </Button>
        );
    };

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
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        height="auto"
                        timeZone="local"
                        displayEventEnd={true}
                        selectable
                        selectAllow={(arg: any) => {
                            const start = dayjs(arg.start);
                            const type = arg?.view?.type;
                            if (type === 'dayGridMonth') {
                                return start.isSame(dayjs(), 'day') || start.isAfter(dayjs(), 'day');
                            }
                            return start.isAfter(dayjs().subtract(1, 'minute'));
                        }}
                        selectMirror
                        select={handleSelect}
                        editable
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        eventClick={handleEventClick}
                        events={events}
                        nowIndicator
                        slotMinTime="00:00:00"
                        slotMaxTime="24:00:00"
                        allDaySlot={false}
                        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                    />
                </Card>
            )}

            {/* Edit/Create Modal */}
            <Modal
                title={editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingSchedule(null);
                }}
                footer={null}
                width={650}
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

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="location_mode"
                                label="Session Type"
                                rules={[{ required: true, message: 'Please select session type!' }]}
                            >
                                <Select>
                                    <Option value="physical">Physical</Option>
                                    <Option value="online">Online</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item shouldUpdate={(prev, next) => prev.location_mode !== next.location_mode} noStyle>
                                {() => {
                                    const mode = form.getFieldValue('location_mode');
                                    return mode === 'online' ? (
                                        <Form.Item
                                            name="link"
                                            label="Meeting Link"
                                            rules={[{ required: true, message: 'Please enter the meeting link!' }]}
                                        >
                                            <Input placeholder="https://..." />
                                        </Form.Item>
                                    ) : (
                                        <Form.Item
                                            name="location"
                                            label="Location"
                                            rules={[{ required: true, message: 'Please enter the location!' }]}
                                        >
                                            <Input placeholder="Room or address" />
                                        </Form.Item>
                                    );
                                }}
                            </Form.Item>
                        </Col>
                    </Row>

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
                                    <Option value="assignment">Assignment</Option>
                                    <Option value="quiz">Quiz</Option>
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
                        <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                {editingSchedule ? 'Update' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal for event click */}
            <Modal
                open={viewModalVisible}
                title={viewSchedule ? viewSchedule.title : 'Schedule Details'}
                onCancel={() => { setViewModalVisible(false); setViewSchedule(null); }}
                footer={null}
                width={640}
            >
                {viewSchedule && (
                    <>
                        <Descriptions bordered column={1} size="middle">
                            <Descriptions.Item label="Batch">
                                {batches.find(b => b.id === viewSchedule.batch_id)?.name || viewSchedule.batch_name || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date">
                                {dayjs(viewSchedule.date).format('dddd, MMMM D, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Time">
                                {`${viewSchedule.start_time} - ${viewSchedule.end_time}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <Tag color={getTypeColor(viewSchedule.type)}>{viewSchedule.type.toUpperCase()}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={getStatusColor(getEffectiveStatus(viewSchedule))}>
                                    {getEffectiveStatus(viewSchedule).toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mode">
                                {viewSchedule.location_mode === 'online' ? 'Online' : 'Physical'}
                            </Descriptions.Item>
                            <Descriptions.Item label={viewSchedule.location_mode === 'online' ? 'Link' : 'Location'}>
                                {viewSchedule.location_mode === 'online' ? (
                                    viewSchedule.link ? (
                                        <Button 
                                            type="primary" 
                                            size="small"
                                            disabled={isScheduleEnded(viewSchedule)}
                                            onClick={() => window.open(viewSchedule.link!, '_blank')}
                                            style={{ 
                                                opacity: isScheduleEnded(viewSchedule) ? 0.5 : 1,
                                                cursor: isScheduleEnded(viewSchedule) ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isScheduleEnded(viewSchedule) ? 'Meeting Ended' : 'Join Meeting'}
                                        </Button>
                                    ) : '—'
                                ) : (viewSchedule.location || '—')}
                            </Descriptions.Item>
                            {viewSchedule.description && (
                                <Descriptions.Item label="Description">
                                    {viewSchedule.description}
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                        <Space style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                            <Popconfirm
                                title="Delete this schedule?"
                                onConfirm={() => viewSchedule && handleDelete(viewSchedule.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button danger icon={<DeleteOutlined />}>Delete</Button>
                            </Popconfirm>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    if (viewSchedule) {
                                        setViewModalVisible(false);
                                        handleEdit(viewSchedule);
                                    }
                                }}
                            >
                                Edit
                            </Button>
                        </Space>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default ScheduleManagement;