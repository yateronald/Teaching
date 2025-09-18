import React, { useState, useEffect } from 'react';
import {
    Card,
    message,
    Typography,
    Tag,
    Tabs,
    Row,
    Col,
    Statistic,
    List,
    Avatar,
    Empty,
    Timeline,
    Button,
    Modal,
    Space,
    Descriptions
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    BookOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    VideoCameraOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// FullCalendar styles removed to avoid Vite import-analysis errors in this environment
// import '@fullcalendar/daygrid/index.css';
// import '@fullcalendar/timegrid/index.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name: string;
    teacher_name: string;
    french_level?: string;
    start_time: string;
    end_time: string;
    date: string;
    location: string;
    location_mode?: 'online' | 'physical';
    link?: string | null;
    type: 'class' | 'exam' | 'meeting' | 'other';
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}

interface ScheduleStats {
    total_classes: number;
    upcoming_classes: number;
    completed_classes: number;
    this_week_classes: number;
    next_class?: Schedule;
}

const StudentSchedule: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [stats, setStats] = useState<ScheduleStats | null>(null);

    // const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // no longer needed with FullCalendar
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const { apiCall } = useAuth();

    // Track joined meetings locally to show a "JOINED" badge after user joins
    const [joinedMap, setJoinedMap] = useState<Record<number, string>>(() => {
        try {
            const raw = localStorage.getItem('joinedSchedules');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    const hasJoined = (id: number) => Boolean(joinedMap[id]);
    
    const markJoined = (id: number) => {
        const next = { ...joinedMap, [id]: dayjs().toISOString() };
        setJoinedMap(next);
        try { 
            localStorage.setItem('joinedSchedules', JSON.stringify(next)); 
        } catch {}
    };

    // Compute stats locally from schedules
    const computeStats = (items: Schedule[]): ScheduleStats => {
        const now = dayjs();
        const total = items.length;
        const upcoming = items.filter((s) => dayjs(`${s.date} ${s.start_time}`).isAfter(now)).length;
        const completed = items.filter((s) => s.status === 'completed').length;
        const startOfWeek = now.startOf('week');
        const endOfWeek = now.endOf('week');
        const thisWeek = items.filter((s) => {
            const d = dayjs(s.date);
            return d.isBetween(startOfWeek, endOfWeek, 'day', '[]');
        }).length;
        const next = items
            .filter((s) => dayjs(`${s.date} ${s.start_time}`).isAfter(now))
            .sort((a, b) => dayjs(`${a.date} ${a.start_time}`).valueOf() - dayjs(`${b.date} ${b.start_time}`).valueOf())[0];
        return {
            total_classes: total,
            upcoming_classes: upcoming,
            completed_classes: completed,
            this_week_classes: thisWeek,
            next_class: next,
        };
    };

    useEffect(() => {
        fetchSchedules();
        // fetchStats(); // replaced by local computation after fetching schedules
    }, []);

    const fetchSchedules = async () => {
        try {
            // Use backend list endpoint with role-based filtering
            const response = await apiCall('/schedules');
            if (response.ok) {
                const raw = await response.json();
                const list = Array.isArray(raw) ? raw : (raw.schedules || []);
                const normalized: Schedule[] = list.map((s: any) => {
                    const start = dayjs(s.start_time);
                    const end = dayjs(s.end_time);
                    const teacherName = [s.teacher_first_name, s.teacher_last_name].filter(Boolean).join(' ').trim();
                    // Map unknown types to 'other' to satisfy union type
                    const allowedTypes = new Set(['class', 'exam', 'meeting', 'other']);
                    const mappedType = allowedTypes.has(s.type) ? s.type : 'other';
                    return {
                        id: s.id,
                        title: s.title,
                        description: s.description || '',
                        batch_id: s.batch_id,
                        batch_name: s.batch_name || '',
                        teacher_name: teacherName || '',
                        start_time: start.isValid() ? start.format('HH:mm') : '00:00',
                        end_time: end.isValid() ? end.format('HH:mm') : start.isValid() ? start.add(1, 'hour').format('HH:mm') : '01:00',
                        date: start.isValid() ? start.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                        location: s.location || '',
                        location_mode: s.location_mode || 'physical',
                        link: s.link || null,
                        type: mappedType as 'class' | 'exam' | 'meeting' | 'other',
                        status: (s.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
                        created_at: s.created_at || start.toISOString(),
                    };
                });
                setSchedules(normalized);
                setStats(computeStats(normalized));
            } else {
                message.error('Failed to fetch schedule');
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            message.error('Error fetching schedule');
        }
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
            case 'ended': return 'default';
            default: return 'default';
        }
    };

    // Helper function to check if schedule has ended
    const isScheduleEnded = (schedule: Schedule): boolean => {
        const now = dayjs();
        const scheduleEnd = dayjs(`${schedule.date} ${schedule.end_time}`);
        return now.isAfter(scheduleEnd);
    };

    // Helper function to get effective status (returns 'ended' for active schedules that have passed their end time)
    const getEffectiveStatus = (schedule: Schedule): string => {
        if (schedule.status === 'scheduled' && isScheduleEnded(schedule)) {
            return 'ended';
        }
        return schedule.status;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled': return <ClockCircleOutlined />;
            case 'completed': return <CheckCircleOutlined />;
            case 'cancelled': return <ExclamationCircleOutlined />;
            case 'ended': return <CheckCircleOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    // FullCalendar color palette by type (aligned with teacher view)
    const typeColors: Record<string, string> = {
        class: '#1677ff',
        exam: '#ff4d4f',
        meeting: '#52c41a',
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
            setSelectedSchedule(sched);
            setDetailsVisible(true);
        }
    };





    const handleViewDetails = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setDetailsVisible(true);
    };

    const formatTime = (time: string) => {
        return dayjs(time, 'HH:mm').format('h:mm A');
    };

    const isToday = (date: string) => {
        return dayjs(date).isSame(dayjs(), 'day');
    };

    const isUpcoming = (date: string, time: string) => {
        const scheduleDateTime = dayjs(`${date} ${time}`);
        return scheduleDateTime.isAfter(dayjs());
    };

    const todaySchedules = schedules.filter(schedule => isToday(schedule.date));
    const upcomingSchedules = schedules
        .filter(schedule => isUpcoming(schedule.date, schedule.start_time))
        .sort((a, b) => {
            const dateTimeA = dayjs(`${a.date} ${a.start_time}`);
            const dateTimeB = dayjs(`${b.date} ${b.start_time}`);
            return dateTimeA.valueOf() - dateTimeB.valueOf();
        });
    const thisWeekSchedules = schedules.filter(schedule => {
        const scheduleDate = dayjs(schedule.date);
        const startOfWeek = dayjs().startOf('week');
        const endOfWeek = dayjs().endOf('week');
        return scheduleDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
    });

    const nextClass = upcomingSchedules[0];

    // Helper function to check if user can join the meeting (5 minutes before start time and not ended)


    // Enhanced canJoinMeeting that uses schedule object
    const canJoinMeetingSchedule = (schedule: Schedule): boolean => {
        const meetingDateTime = dayjs(`${schedule.date} ${schedule.start_time}`);
        const meetingEndTime = dayjs(`${schedule.date} ${schedule.end_time}`);
        const now = dayjs();
        const fiveMinutesBefore = meetingDateTime.subtract(5, 'minute');
        
        return now.isAfter(fiveMinutesBefore) && now.isBefore(meetingEndTime) && !isScheduleEnded(schedule);
    };

    // Helper function to get secure meeting link (only when authorized)
    const getSecureMeetingLink = (schedule: Schedule): string | null => {
        if (!schedule.link || !canJoinMeetingSchedule(schedule) || isScheduleEnded(schedule)) {
            return null;
        }
        return schedule.link;
    };



    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>
                    <CalendarOutlined /> My Schedule
                </Title>
            </div>

            {stats && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Classes"
                                value={stats.total_classes}
                                prefix={<BookOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="This Week"
                                value={stats.this_week_classes}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Upcoming"
                                value={stats.upcoming_classes}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Completed"
                                value={stats.completed_classes}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {nextClass && (
                <Card 
                    style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    bodyStyle={{ color: 'white' }}
                >
                    <Row align="middle">
                        <Col span={18}>
                            <Title level={4} style={{ color: 'white', margin: 0 }}>
                                <ClockCircleOutlined /> Next Class
                            </Title>
                            <div style={{ marginTop: 8 }}>
                                <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                                    {nextClass.title}
                                </Text>
                                <br />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {dayjs(nextClass.date).format('dddd, MMMM DD')} at {formatTime(nextClass.start_time)}
                                </Text>
                                <br />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {nextClass.location_mode === 'online' ? (
                                        <><VideoCameraOutlined /> Online • <TeamOutlined /> {nextClass.teacher_name}</>
                                    ) : (
                                        <><EnvironmentOutlined /> {nextClass.location} • <TeamOutlined /> {nextClass.teacher_name}</>
                                    )}
                                </Text>
                            </div>
                        </Col>
                        <Col span={6} style={{ textAlign: 'right' }}>
                            <Space>
                                {nextClass.link ? (
                                    <Button
                                        type="primary"
                                        onClick={(e) => {
                                            (e as any).stopPropagation?.();
                                            if (canJoinMeetingSchedule(nextClass) && !isScheduleEnded(nextClass)) {
                                                markJoined(nextClass.id);
                                                window.open(nextClass.link as string, '_blank');
                                            }
                                        }}
                                        disabled={!canJoinMeetingSchedule(nextClass) || isScheduleEnded(nextClass)}
                                        style={{
                                            backgroundColor: isScheduleEnded(nextClass) ? '#d9d9d9' : (canJoinMeetingSchedule(nextClass) ? '#1890ff' : '#d9d9d9'),
                                            borderColor: isScheduleEnded(nextClass) ? '#d9d9d9' : (canJoinMeetingSchedule(nextClass) ? '#1890ff' : '#d9d9d9'),
                                            color: isScheduleEnded(nextClass) ? '#00000040' : '#fff'
                                        }}
                                    >
                                        {isScheduleEnded(nextClass) ? 'Ended' : (canJoinMeetingSchedule(nextClass) ? 'Join Now' : 'Join soon')}
                                    </Button>
                                ) : null}
                                <Button 
                                    ghost
                                    onClick={() => handleViewDetails(nextClass)}
                                >
                                    Details
                                </Button>
                                {hasJoined(nextClass.id) ? <Tag color="success">JOINED</Tag> : null}
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* FullCalendar (read-only) */}
            <Row gutter={16}>
                <Col span={16}>
                    <Card title="Calendar View">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            height={720}
                            events={events}
                            editable={false}
                            selectable={false}
                            selectMirror={false}
                            dayMaxEvents={true}
                            eventClick={handleEventClick}
                            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: true }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Tabs defaultActiveKey="today" size="small">
                        <TabPane tab={`Today (${todaySchedules.length})`} key="today">
                            <Card size="small">
                                {todaySchedules.length > 0 ? (
                                    <Timeline>
                                        {todaySchedules
                                            .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                            .map(schedule => (
                                                <Timeline.Item
                                                    key={schedule.id}
                                                    dot={getStatusIcon(getEffectiveStatus(schedule))}
                                                    color={getStatusColor(getEffectiveStatus(schedule))}
                                                >
                                                    <div 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleViewDetails(schedule)}
                                                    >
                                                        <Text strong>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</Text>
                                                        <br />
                                                        <Text>{schedule.title}</Text>
                                                        <br />
                                                        <Space size="small" wrap>
                                                            {schedule.location_mode === 'online' ? (
                                                                <Tag color="geekblue" icon={<VideoCameraOutlined />}>Online</Tag>
                                                            ) : (
                                                                <Tag color="purple" icon={<EnvironmentOutlined />}>{schedule.location}</Tag>
                                                            )}
                                                            <Tag color={getTypeColor(schedule.type)}>
                                                                {schedule.type.toUpperCase()}
                                                            </Tag>
                                                            {hasJoined(schedule.id) ? <Tag color="success">JOINED</Tag> : null}
                                                            {schedule.link ? (
                                                                <Button
                                                                    size="small"
                                                                    type="primary"
                                                                    disabled={!canJoinMeetingSchedule(schedule) || isScheduleEnded(schedule)}
                                                                    style={{
                                                                        backgroundColor: isScheduleEnded(schedule) ? '#d9d9d9' : (canJoinMeetingSchedule(schedule) ? '#52c41a' : '#d9d9d9'),
                                                                        borderColor: isScheduleEnded(schedule) ? '#d9d9d9' : (canJoinMeetingSchedule(schedule) ? '#52c41a' : '#d9d9d9'),
                                                                        color: isScheduleEnded(schedule) ? '#00000040' : (canJoinMeetingSchedule(schedule) ? '#fff' : '#00000040')
                                                                    }}
                                                                    onClick={(e) => {
                                                                        (e as any).stopPropagation();
                                                                        if (canJoinMeetingSchedule(schedule) && !isScheduleEnded(schedule)) {
                                                                            markJoined(schedule.id);
                                                                            window.open(schedule.link as string, '_blank');
                                                                        }
                                                                    }}
                                                                >
                                                                    {isScheduleEnded(schedule) ? 'Ended' : 'Join'}
                                                                </Button>
                                                            ) : null}
                                                        </Space>
                                                    </div>
                                                </Timeline.Item>
                                            ))
                                        }
                                    </Timeline>
                                ) : (
                                    <Empty 
                                        description="No classes today" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>
                        
                        <TabPane tab={`Upcoming (${upcomingSchedules.slice(0, 10).length})`} key="upcoming">
                            <Card size="small">
                                {upcomingSchedules.slice(0, 10).length > 0 ? (
                                    <List
                                        size="small"
                                        dataSource={upcomingSchedules.slice(0, 10)}
                                        renderItem={(schedule) => (
                                            <List.Item 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(schedule)}
                                                actions={[
                                                    hasJoined(schedule.id) ? (<Tag color="success" key="joined">JOINED</Tag>) : null,
                                                    schedule.link ? (
                                                        <Button
                                                            key="join"
                                                            size="small"
                                                            type="primary"
                                                            disabled={!canJoinMeetingSchedule(schedule) || isScheduleEnded(schedule)}
                                                            style={{
                                                                backgroundColor: isScheduleEnded(schedule) ? '#d9d9d9' : (canJoinMeetingSchedule(schedule) ? '#52c41a' : '#d9d9d9'),
                                                                borderColor: isScheduleEnded(schedule) ? '#d9d9d9' : (canJoinMeetingSchedule(schedule) ? '#52c41a' : '#d9d9d9'),
                                                                color: isScheduleEnded(schedule) ? '#00000040' : (canJoinMeetingSchedule(schedule) ? '#fff' : '#00000040')
                                                            }}
                                                            onClick={(e) => {
                                                                (e as any).stopPropagation();
                                                                if (canJoinMeetingSchedule(schedule) && !isScheduleEnded(schedule)) {
                                                                    markJoined(schedule.id);
                                                                    window.open(schedule.link as string, '_blank');
                                                                }
                                                            }}
                                                        >
                                                            {isScheduleEnded(schedule) ? 'Ended' : 'Join'}
                                                        </Button>
                                                    ) : null
                                                ].filter(Boolean) as any}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            style={{ backgroundColor: getTypeColor(schedule.type) }}
                                                            icon={<BookOutlined />}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{schedule.title}</Text>
                                                            <Tag color={getTypeColor(schedule.type)}>
                                                                {schedule.type.toUpperCase()}
                                                            </Tag>
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {dayjs(schedule.date).format('MMM DD')} • {formatTime(schedule.start_time)}
                                                            </Text>
                                                            <br />
                                                            <Space size="small">
                                                                {schedule.location_mode === 'online' ? (
                                                                    <Tag color="geekblue" icon={<VideoCameraOutlined />}>Online</Tag>
                                                                ) : (
                                                                    <Tag color="purple" icon={<EnvironmentOutlined />}>{schedule.location}</Tag>
                                                                )}
                                                            </Space>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty 
                                        description="No upcoming classes" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>
                        
                        <TabPane tab={`This Week (${thisWeekSchedules.length})`} key="week">
                            <Card size="small">
                                {thisWeekSchedules.length > 0 ? (
                                    <List
                                        size="small"
                                        dataSource={thisWeekSchedules
                                            .sort((a, b) => {
                                                const dateTimeA = dayjs(`${a.date} ${a.start_time}`);
                                                const dateTimeB = dayjs(`${b.date} ${b.start_time}`);
                                                return dateTimeA.valueOf() - dateTimeB.valueOf();
                                            })
                                        }
                                        renderItem={(schedule) => (
                                            <List.Item 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(schedule)}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            style={{ backgroundColor: getStatusColor(getEffectiveStatus(schedule)) }}
                                                            icon={getStatusIcon(getEffectiveStatus(schedule))}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{schedule.title}</Text>
                                                            <Tag color={getStatusColor(getEffectiveStatus(schedule))}>
                                                                {getEffectiveStatus(schedule).toUpperCase()}
                                                            </Tag>
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {dayjs(schedule.date).format('ddd, MMM DD')} • {formatTime(schedule.start_time)}
                                                            </Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                <TeamOutlined /> {schedule.teacher_name}
                                                            </Text>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty 
                                        description="No classes this week" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>

            {/* Redesigned Details Modal to match backend style */}
            <Modal
                title={selectedSchedule ? selectedSchedule.title : 'Class Details'}
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={[
                    selectedSchedule?.link ? (
                        <Button
                            key="join"
                            type="primary"
                            disabled={!canJoinMeetingSchedule(selectedSchedule) || isScheduleEnded(selectedSchedule)}
                            style={{
                                backgroundColor: isScheduleEnded(selectedSchedule) ? '#d9d9d9' : (canJoinMeetingSchedule(selectedSchedule) ? '#52c41a' : '#d9d9d9'),
                                borderColor: isScheduleEnded(selectedSchedule) ? '#d9d9d9' : (canJoinMeetingSchedule(selectedSchedule) ? '#52c41a' : '#d9d9d9'),
                                color: isScheduleEnded(selectedSchedule) ? '#00000040' : (canJoinMeetingSchedule(selectedSchedule) ? '#fff' : '#00000040')
                            }}
                            onClick={() => {
                                const meetingLink = getSecureMeetingLink(selectedSchedule);
                                if (meetingLink && !isScheduleEnded(selectedSchedule)) {
                                    markJoined(selectedSchedule.id);
                                    window.open(meetingLink, '_blank');
                                }
                            }}
                        >
                            {isScheduleEnded(selectedSchedule) ? 'Meeting Ended' : (canJoinMeetingSchedule(selectedSchedule) ? 'Join Meeting' : 'Join available 5 minutes before')}
                        </Button>
                    ) : null,
                    <Button key="close" onClick={() => setDetailsVisible(false)}>Close</Button>
                ].filter(Boolean) as any}
                width={700}
            >
                {selectedSchedule && (
                    <>
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="Date" span={1}>
                                {dayjs(selectedSchedule.date).format('dddd, MMMM D, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Time" span={1}>
                                {`${formatTime(selectedSchedule.start_time)} - ${formatTime(selectedSchedule.end_time)}`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Type" span={1}>
                                <Tag color={getTypeColor(selectedSchedule.type)}>{selectedSchedule.type.toUpperCase()}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status" span={1}>
                                <Tag color={getStatusColor(getEffectiveStatus(selectedSchedule))}>
                                    {getEffectiveStatus(selectedSchedule).toUpperCase()}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Teacher" span={1}>
                                <Space><TeamOutlined /> {selectedSchedule.teacher_name}</Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Batch" span={1}>
                                <Space>
                                    <BookOutlined /> {selectedSchedule.batch_name}
                                    {selectedSchedule.french_level && (
                                        <Tag color="blue" style={{ marginLeft: 8, fontSize: '11px', fontWeight: 'bold' }}>
                                            <GlobalOutlined /> {selectedSchedule.french_level}
                                        </Tag>
                                    )}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label={selectedSchedule.location_mode === 'online' ? 'Meeting' : 'Location'} span={2}>
                                {selectedSchedule.location_mode === 'online' ? (
                                    selectedSchedule.link ? 'Online Meeting' : '—'
                                ) : (
                                    <Space><EnvironmentOutlined /> {selectedSchedule.location}</Space>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>
                                {selectedSchedule.description || 'No description provided.'}
                            </Descriptions.Item>
                        </Descriptions>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default StudentSchedule;