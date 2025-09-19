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
    Badge,
    Statistic,
    Avatar,
    List
} from 'antd';
import {
    CalendarOutlined,
    UserOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    LinkOutlined,
    FilterOutlined,
    ReloadOutlined,
    TeamOutlined,
    EyeOutlined
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

interface Student {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    enrolled_at: string;
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
    const [selectedTeacher, setSelectedTeacher] = useState<number[] | null>(null);
    const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<TimetableEntry | null>(null);
    const [studentListModalVisible, setStudentListModalVisible] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentCount, setStudentCount] = useState<number>(0);
    const [studentsLoading, setStudentsLoading] = useState(false);
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

    const handleTeacherChange = (value: (number | string)[]) => {
        if (value.includes('all')) {
            // If 'All' is selected, clear individual selections and set to null (show all)
            setSelectedTeacher(null);
        } else if (value.length === 0) {
            // If nothing is selected, keep it empty (show nothing)
            setSelectedTeacher([]);
        } else {
            // Filter out any 'all' values and keep only numbers
            const teacherIds = value.filter(v => typeof v === 'number') as number[];
            setSelectedTeacher(teacherIds);
        }
    };

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            // If selectedTeacher is an empty array, show no data
            if (selectedTeacher && selectedTeacher.length === 0) {
                setTimetableData([]);
                setLoading(false);
                return;
            }
            
            let url = '/batches/timetable';
            if (selectedTeacher && selectedTeacher.length > 0) {
                // Filter out 'all' and only use numeric teacher IDs
                const teacherIds = selectedTeacher.filter(id => typeof id === 'number').join(',');
                if (teacherIds) {
                    url = `/batches/timetable?teacher_id=${teacherIds}`;
                }
            }
            
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

    const fetchBatchStudents = async (batchId: number) => {
        setStudentsLoading(true);
        try {
            const response = await apiCall(`/batches/${batchId}`);
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data.students) ? data.students : []);
                setStudentCount(data.students ? data.students.length : 0);
            } else {
                message.error('Failed to fetch students');
            }
        } catch (error) {
            message.error('Error fetching students');
        } finally {
            setStudentsLoading(false);
        }
    };

    const handleViewStudents = (batchId: number) => {
        setStudentListModalVisible(true);
        fetchBatchStudents(batchId);
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

    // Generate distinct colors for teachers
    const teacherColors = useMemo(() => {
        const uniqueTeachers = Array.from(new Set(timetableData.map(entry => entry.teacher_id)));
        const colorPalette = [
            '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', 
            '#13c2c2', '#f5222d', '#a0d911', '#fadb14', '#2f54eb',
            '#fa541c', '#1890ff', '#722ed1', '#52c41a', '#fa8c16'
        ];
        
        const teacherColorMap: Record<number, { primary: string; border: string }> = {};
        uniqueTeachers.forEach((teacherId, index) => {
            const baseColor = colorPalette[index % colorPalette.length];
            teacherColorMap[teacherId] = {
                primary: baseColor,
                border: baseColor
            };
        });
        
        return teacherColorMap;
    }, [timetableData]);

    // Generate distinct colors for batches (for single teacher view)
    const batchColors = useMemo(() => {
        const uniqueBatches = Array.from(new Set(timetableData.map(entry => entry.batch_id)));
        const colorPalette = [
            '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', 
            '#13c2c2', '#f5222d', '#a0d911', '#fadb14', '#2f54eb',
            '#fa541c', '#1890ff', '#722ed1', '#52c41a', '#fa8c16'
        ];
        
        const batchColorMap: Record<number, { primary: string; border: string }> = {};
        uniqueBatches.forEach((batchId, index) => {
            const baseColor = colorPalette[index % colorPalette.length];
            batchColorMap[batchId] = {
                primary: baseColor,
                border: baseColor
            };
        });
        
        return batchColorMap;
    }, [timetableData]);

    // Get unique teachers for legend display
    const uniqueTeachers = useMemo(() => {
        const teacherMap = new Map();
        timetableData.forEach(entry => {
            if (!teacherMap.has(entry.teacher_id)) {
                teacherMap.set(entry.teacher_id, {
                    teacher_id: entry.teacher_id,
                    teacher_name: `${entry.teacher_first_name} ${entry.teacher_last_name}`,
                    teacher_first_name: entry.teacher_first_name,
                    teacher_last_name: entry.teacher_last_name
                });
            }
        });
        return Array.from(teacherMap.values());
    }, [timetableData]);

    // Get unique batches for legend display
    const uniqueBatches = useMemo(() => {
        const batchMap = new Map();
        timetableData.forEach(entry => {
            if (!batchMap.has(entry.batch_id)) {
                batchMap.set(entry.batch_id, {
                    batch_id: entry.batch_id,
                    batch_name: entry.batch_name,
                    french_level: entry.french_level,
                    location_mode: entry.location_mode,
                    teacher_name: `${entry.teacher_first_name} ${entry.teacher_last_name}`
                });
            }
        });
        return Array.from(batchMap.values());
    }, [timetableData]);



    const eventStyleGetter = (event: CalendarEvent) => {
        const entry = event.resource;
        
        // Use teacher colors when multiple teachers are selected or all teachers
        // Use batch colors when single teacher is selected
        const isMultipleTeachers = selectedTeacher === null || (selectedTeacher && selectedTeacher.length > 1);
        
        let backgroundColor, borderColor;
        
        if (isMultipleTeachers) {
            const teacherColor = teacherColors[entry.teacher_id];
            backgroundColor = teacherColor?.primary || '#1890ff';
            borderColor = teacherColor?.border || '#1890ff';
        } else {
            const batchColor = batchColors[entry.batch_id];
            backgroundColor = batchColor?.primary || '#1890ff';
            borderColor = batchColor?.border || '#1890ff';
        }
        
        // Add slight transparency for online classes to maintain distinction
        const opacity = entry.location_mode === 'online' ? 0.85 : 0.9;
        
        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity,
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
                                mode="multiple"
                                placeholder="Select teachers or 'All'"
                                style={{ width: '100%' }}
                                value={selectedTeacher === null ? ['all'] : (selectedTeacher.length === 0 ? [] : selectedTeacher)}
                                onChange={handleTeacherChange}
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                <Option key="all" value="all">
                                    <UserOutlined /> All Teachers
                                </Option>
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
                        <Space direction="vertical" style={{ width: '100%' }}>
                            {/* Teacher Legend - Only visible when all teachers or multiple teachers are selected */}
                            {(selectedTeacher === null || (selectedTeacher && selectedTeacher.length > 1)) && uniqueTeachers.length > 0 && (
                                <Space wrap>
                                    <Text type="secondary">Teachers:</Text>
                                    {uniqueTeachers.map(teacher => (
                                        <Tag 
                                            key={teacher.teacher_id}
                                            color={teacherColors[teacher.teacher_id]?.primary}
                                            style={{ 
                                                color: 'white',
                                                fontWeight: 'bold',
                                                border: `1px solid ${teacherColors[teacher.teacher_id]?.border}`
                                            }}
                                        >
                                            {teacher.teacher_name}
                                        </Tag>
                                    ))}
                                </Space>
                            )}
                            
                            {/* Per-batch Legend - Only visible when exactly one teacher is selected */}
                            {selectedTeacher && selectedTeacher.length === 1 && uniqueBatches.length > 0 && (
                                <Space wrap>
                                    <Text type="secondary">
                                        {uniqueBatches[0]?.teacher_name}'s Batches:
                                    </Text>
                                    {uniqueBatches.map(batch => (
                                        <Tag 
                                            key={batch.batch_id}
                                            color={batchColors[batch.batch_id]?.primary}
                                            style={{ 
                                                color: 'white',
                                                fontWeight: 'bold',
                                                border: `1px solid ${batchColors[batch.batch_id]?.border}`
                                            }}
                                        >
                                            {batch.batch_name} ({batch.french_level})
                                        </Tag>
                                    ))}
                                </Space>
                            )}
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
                        <Descriptions.Item label="Students" span={2}>
                            <Button 
                                type="link" 
                                icon={<TeamOutlined />}
                                onClick={() => handleViewStudents(selectedEvent.batch_id)}
                                style={{ padding: 0, height: 'auto' }}
                            >
                                <Space>
                                    <EyeOutlined />
                                    View Students
                                </Space>
                            </Button>
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

            {/* Student List Modal */}
            <Modal
                title={
                    <Space>
                        <TeamOutlined />
                        <span>Students in {selectedEvent?.batch_name}</span>
                        <Badge count={studentCount} style={{ backgroundColor: '#52c41a' }} />
                    </Space>
                }
                open={studentListModalVisible}
                onCancel={() => {
                    setStudentListModalVisible(false);
                    setStudents([]);
                    setStudentCount(0);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setStudentListModalVisible(false);
                        setStudents([]);
                        setStudentCount(0);
                    }}>
                        Close
                    </Button>
                ]}
                width={700}
            >
                <Spin spinning={studentsLoading}>
                    {students.length > 0 ? (
                        <div>
                            <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic 
                                            title="Total Students" 
                                            value={studentCount} 
                                            prefix={<TeamOutlined />}
                                            valueStyle={{ color: '#1890ff' }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic 
                                            title="Batch" 
                                            value={selectedEvent?.batch_name || 'N/A'} 
                                            prefix={<CalendarOutlined />}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic 
                                            title="Level" 
                                            value={selectedEvent?.french_level || 'N/A'} 
                                            prefix={<Tag color="blue" style={{ margin: 0 }}>FR</Tag>}
                                        />
                                    </Col>
                                </Row>
                            </div>
                            
                            <List
                                itemLayout="horizontal"
                                dataSource={students}
                                renderItem={(student, index) => (
                                    <List.Item
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: 8,
                                            marginBottom: 8,
                                            backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                                            border: '1px solid #f0f0f0'
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    size={40}
                                                    style={{ 
                                                        backgroundColor: `hsl(${(student.id * 137.508) % 360}, 70%, 50%)`,
                                                        fontSize: '16px',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                                                </Avatar>
                                            }
                                            title={
                                                <Space>
                                                    <Text strong style={{ fontSize: '16px' }}>
                                                        {student.first_name} {student.last_name}
                                                    </Text>
                                                    <Tag color="blue" style={{ fontSize: '11px' }}>
                                                        @{student.username}
                                                    </Tag>
                                                </Space>
                                            }
                                            description={
                                                <Space direction="vertical" size={4}>
                                                    <Text type="secondary" style={{ fontSize: '14px' }}>
                                                        📧 {student.email}
                                                    </Text>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        📅 Enrolled: {dayjs(student.enrolled_at).format('MMM DD, YYYY')}
                                                    </Text>
                                                </Space>
                                            }
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <Badge 
                                                count={`#${index + 1}`} 
                                                style={{ 
                                                    backgroundColor: '#f0f0f0', 
                                                    color: '#666',
                                                    border: '1px solid #d9d9d9'
                                                }} 
                                            />
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <TeamOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: 16 }} />
                            <Title level={4} type="secondary">No Students Found</Title>
                            <Text type="secondary">This batch doesn't have any enrolled students yet.</Text>
                        </div>
                    )}
                </Spin>
            </Modal>
        </Card>
    );
};

export default AdminTimetable;