import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs';
import {
    Card,
    Select,
    Space,
    Typography,
    Button,
    Modal,
    Descriptions,
    Tag,
    Row,
    Col,
    Spin,
    message,
    Tooltip,
    Badge,
    Statistic
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    LinkOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Setup the localizer for react-big-calendar
const localizer = dayjsLocalizer(dayjs);

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface TimetableEntry {
    id: number;
    batch_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    timezone: string;
    location_mode: 'online' | 'physical';
    location?: string;
    link?: string;
    is_active: boolean;
    batch_name: string;
    french_level: string;
    start_date: string;
    end_date: string;
    teacher_id: number;
    teacher_first_name: string;
    teacher_last_name: string;
}

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource: TimetableEntry;
}

const AdminTimetable: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<TimetableEntry | null>(null);
    const { apiCall } = useAuth();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        fetchTeachers();
        fetchTimetable();
    }, []);

    useEffect(() => {
        fetchTimetable();
    }, [selectedTeacher]);

    const fetchTeachers = async () => {
        try {
            const response = await apiCall('/users?role=teacher');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (error) {
            message.error('Failed to fetch teachers');
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const url = selectedTeacher 
                ? `/batches/timetable?teacher_id=${selectedTeacher}`
                : '/batches/timetable';
            
            const response = await apiCall(url);
            if (response.ok) {
                const data = await response.json();
                setTimetableData(data);
            } else {
                message.error('Failed to fetch timetable data');
            }
        } catch (error) {
            message.error('Error fetching timetable');
        } finally {
            setLoading(false);
        }
    };

    // Convert timetable entries to calendar events - showing recurring weekly pattern
    const calendarEvents: CalendarEvent[] = useMemo(() => {
        const events: CalendarEvent[] = [];
        
        timetableData.forEach(entry => {
            // For timetable view, show the recurring pattern for the current week only
            // This creates a fixed weekly schedule that doesn't change day by day
            const startOfWeek = dayjs().startOf('week');
            const eventDate = startOfWeek.add(entry.day_of_week, 'day');
            
            const [startHour, startMinute] = entry.start_time.split(':').map(Number);
            const [endHour, endMinute] = entry.end_time.split(':').map(Number);
            
            const startDateTime = eventDate.hour(startHour).minute(startMinute).toDate();
            const endDateTime = eventDate.hour(endHour).minute(endMinute).toDate();
            
            events.push({
                id: entry.id,
                title: entry.french_level,
                start: startDateTime,
                end: endDateTime,
                resource: entry
            });
        });
        
        return events;
    }, [timetableData]);

    const handleEventSelect = (event: CalendarEvent) => {
        setSelectedEvent(event.resource);
        setDetailModalVisible(true);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const entry = event.resource;
        let backgroundColor = '#1890ff';
        let borderColor = '#1890ff';
        
        // Color code by location mode with better colors
        if (entry.location_mode === 'online') {
            backgroundColor = '#52c41a';
            borderColor = '#389e0d';
        } else {
            backgroundColor = '#722ed1';
            borderColor = '#531dab';
        }
        
        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: `2px solid ${borderColor}`,
                display: 'block',
                minHeight: '40px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }
        };
    };

    // Helper function to shorten teacher names
    const getShortTeacherName = (firstName: string, lastName: string) => {
        // If last name is short (≤ 8 chars), use it
        if (lastName.length <= 8) {
            return lastName;
        }
        // If first name is shorter, use it
        if (firstName.length < lastName.length && firstName.length <= 8) {
            return firstName;
        }
        // Otherwise use first initial + last name (truncated if needed)
        const initial = firstName.charAt(0).toUpperCase();
        const shortLastName = lastName.length > 6 ? lastName.substring(0, 6) + '.' : lastName;
        return `${initial}. ${shortLastName}`;
    };

    const CustomEvent = ({ event }: { event: CalendarEvent }) => {
        const entry = event.resource;
        const shortTeacherName = getShortTeacherName(entry.teacher_first_name, entry.teacher_last_name);
        
        return (
            <div style={{ 
                fontSize: '12px', 
                padding: '3px 5px', 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                lineHeight: '1.1'
            }}>
                <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '13px',
                    textAlign: 'center',
                    marginBottom: '1px',
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {event.title} • {shortTeacherName}
                </div>
                <div style={{ 
                    fontSize: '10px',
                    textAlign: 'center',
                    opacity: 0.9
                }}>
                    {entry.location_mode === 'online' ? '🌐 Online' : '📍 Physical'}
                </div>
            </div>
        );
    };

    const CustomHeader = ({ date }: { date: Date }) => {
        const dayName = dayjs(date).format('dddd');
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '0 12px',
                fontWeight: 'bold',
                fontSize: '18px',
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                border: 'none',
                borderBottom: 'none'
            }}>
                {dayName}
            </div>
        );
    };

    const getOverallStats = () => {
        // Get unique batches instead of counting recurring sessions
        const uniqueBatches = new Map();
        
        timetableData.forEach(entry => {
            if (!uniqueBatches.has(entry.batch_id)) {
                uniqueBatches.set(entry.batch_id, {
                    batch_id: entry.batch_id,
                    batch_name: entry.batch_name,
                    location_mode: entry.location_mode,
                    teacher_id: entry.teacher_id
                });
            }
        });
        
        const uniqueBatchArray = Array.from(uniqueBatches.values());
        const totalClasses = uniqueBatchArray.length;
        const onlineClasses = uniqueBatchArray.filter(batch => batch.location_mode === 'online').length;
        const physicalClasses = uniqueBatchArray.filter(batch => batch.location_mode === 'physical').length;
        
        return {
            totalClasses,
            onlineClasses,
            physicalClasses
        };
    };

    const overallStats = getOverallStats();

    return (
        <Card style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16, flexShrink: 0 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0 }}>
                            <CalendarOutlined /> Teacher Timetable
                        </Title>
                    </Col>
                    <Col>
                        <Space>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={fetchTimetable}
                                loading={loading}
                            >
                                Refresh
                            </Button>
                        </Space>
                    </Col>
                </Row>
                
                <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={8}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text strong>
                                <FilterOutlined /> Filter by Teacher:
                            </Text>
                            <Select
                                placeholder="Select a teacher (or leave empty for all)"
                                style={{ width: '100%' }}
                                value={selectedTeacher}
                                onChange={setSelectedTeacher}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {teachers.map(teacher => (
                                    <Option key={teacher.id} value={teacher.id}>
                                        <UserOutlined /> {teacher.first_name} {teacher.last_name}
                                    </Option>
                                ))}
                            </Select>
                        </Space>
                    </Col>
                    
                    <Col span={16}>
                        <Card 
                            size="small" 
                            style={{ 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none'
                            }}
                        >
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Total Classes</span>}
                                        value={overallStats.totalClasses}
                                        valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                        prefix={<CalendarOutlined style={{ color: 'white' }} />}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Physical Classes</span>}
                                        value={overallStats.physicalClasses}
                                        valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                        prefix={<span style={{ color: 'white' }}>📍</span>}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Online Classes</span>}
                                        value={overallStats.onlineClasses}
                                        valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                        prefix={<span style={{ color: 'white' }}>🌐</span>}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                <Row style={{ marginTop: 12 }}>
                    <Col span={24}>
                        <Space>
                            <Text type="secondary">Legend:</Text>
                            <Tag color="#52c41a">🌐 Online Classes</Tag>
                            <Tag color="#722ed1">📍 Physical Classes</Tag>
                        </Space>
                    </Col>
                </Row>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
                <Spin spinning={loading}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        onSelectEvent={handleEventSelect}
                        eventPropGetter={eventStyleGetter}
                        components={{
                            event: CustomEvent,
                            toolbar: () => null, // Remove the toolbar completely
                            week: {
                                header: CustomHeader
                            }
                        }}
                        views={[Views.WEEK]}
                        view={Views.WEEK}
                        dayLayoutAlgorithm="no-overlap"
                        step={30}
                        timeslots={2}
                        min={dayjs().hour(0).minute(0).toDate()}
                        max={dayjs().hour(23).minute(59).toDate()}
                        date={dayjs().startOf('week').toDate()}
                        popup
                        popupOffset={30}
                    />
                </Spin>
            </div>

            <Modal
                title={
                    <Space>
                        <CalendarOutlined />
                        Class Details
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedEvent && (
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Batch Name" span={2}>
                            <Text strong>{selectedEvent.batch_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="French Level">
                            <Tag color="blue">{selectedEvent.french_level}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Day">
                            <Tag color="green">{dayNames[selectedEvent.day_of_week]}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Time">
                            <Space>
                                <ClockCircleOutlined />
                                {selectedEvent.start_time} - {selectedEvent.end_time}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Timezone">
                            {selectedEvent.timezone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Teacher" span={2}>
                            <Space>
                                <UserOutlined />
                                {selectedEvent.teacher_first_name} {selectedEvent.teacher_last_name}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Location Mode" span={2}>
                            <Tag color={selectedEvent.location_mode === 'online' ? 'green' : 'purple'}>
                                {selectedEvent.location_mode === 'online' ? '🌐 Online' : '📍 Physical'}
                            </Tag>
                        </Descriptions.Item>
                        {selectedEvent.location_mode === 'physical' && selectedEvent.location && (
                            <Descriptions.Item label="Location" span={2}>
                                <Space>
                                    <EnvironmentOutlined />
                                    {selectedEvent.location}
                                </Space>
                            </Descriptions.Item>
                        )}
                        {selectedEvent.location_mode === 'online' && selectedEvent.link && (
                            <Descriptions.Item label="Meeting Link" span={2}>
                                <Space>
                                    <LinkOutlined />
                                    <a href={selectedEvent.link} target="_blank" rel="noopener noreferrer">
                                        Join Meeting
                                    </a>
                                </Space>
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Batch Duration" span={2}>
                            <Space>
                                <CalendarOutlined />
                                {dayjs(selectedEvent.start_date).format('MMM DD, YYYY')} - {dayjs(selectedEvent.end_date).format('MMM DD, YYYY')}
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </Card>
    );
};

export default AdminTimetable;