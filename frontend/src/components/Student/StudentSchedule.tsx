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
    Descriptions,
    Spin,
    Input,
    Alert,
    Form,
    Tooltip
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
    GlobalOutlined,
    LoginOutlined,
    KeyOutlined
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
    const [loading, setLoading] = useState(true); // Add loading state

    // const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs()); // no longer needed with FullCalendar
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const { apiCall } = useAuth();

    // Attendance-related state
    const [joinClassModalVisible, setJoinClassModalVisible] = useState(false);
    const [selectedScheduleForJoin, setSelectedScheduleForJoin] = useState<Schedule | null>(null);
    const [joiningClass, setJoiningClass] = useState(false);
    const [accessCode, setAccessCode] = useState('');
    const [sessionStatus, setSessionStatus] = useState<any>(null);
    const [form] = Form.useForm();

    // Track joined meetings locally to show a "JOINED" badge after user joins
    const [joinedMap, setJoinedMap] = useState<Record<number, string>>(() => {
        try {
            const raw = localStorage.getItem('joinedSchedules');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // Track server-side join status
    const [serverJoinedMap, setServerJoinedMap] = useState<Record<number, boolean>>({});

    const hasJoined = (id: number) => Boolean(joinedMap[id]) || Boolean(serverJoinedMap[id]);

    // Check server-side join status for a schedule
    const checkServerJoinStatus = async (scheduleId: number) => {
        try {
            const response = await apiCall(`/attendance/sessions/${scheduleId}/status`);
            if (response.ok) {
                const status = await response.json();
                setServerJoinedMap(prev => ({
                    ...prev,
                    [scheduleId]: status.alreadyJoined || false
                }));
                return status.alreadyJoined || false;
            }
        } catch (error) {
            console.error('Error checking server join status:', error);
        }
        return false;
    };
    
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
        // Count completed sessions as either explicitly marked 'completed' or those that have ended by time
        const completed = items.filter((s) => {
            const effective = getEffectiveStatus(s);
            return effective === 'completed' || effective === 'ended';
        }).length;
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
        setLoading(true);
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
                
                // Check server-side join status for all class schedules
                for (const schedule of normalized) {
                    if (schedule.type === 'class') {
                        await checkServerJoinStatus(schedule.id);
                    }
                }
                
                setStats(computeStats(normalized));
            } else {
                message.error('Failed to fetch schedule');
            }
        } catch (error) {
            console.error('Error fetching schedule:', error);
            message.error('Error fetching schedule');
        } finally {
            setLoading(false);
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



    // Handle join class button click
    const handleJoinClass = async (schedule: Schedule) => {
        setSelectedScheduleForJoin(schedule);
        
        // Check session status first
        await checkSessionStatus(schedule.id);
        
        // Get the session status to check if already joined
        try {
            const response = await apiCall(`/attendance/sessions/${schedule.id}/status`);
            if (response.ok) {
                const status = await response.json();
                
                // If student has already joined and there's a meeting link, redirect directly
                if (status.alreadyJoined && schedule.link) {
                    message.success('You have already joined this class. Opening meeting link...');
                    markJoined(schedule.id);
                    window.open(schedule.link, '_blank');
                    return;
                }
                
                // If already joined but no meeting link, show success message
                if (status.alreadyJoined) {
                    message.success('You have already joined this class.');
                    markJoined(schedule.id);
                    return;
                }
            }
        } catch (error) {
            console.error('Error checking join status:', error);
        }
        
        // If not joined yet, show the access code modal
        setJoinClassModalVisible(true);
        setAccessCode('');
        form.resetFields();
    };

    // Check session status for a schedule
    const checkSessionStatus = async (scheduleId: number) => {
        try {
            const response = await apiCall(`/attendance/sessions/${scheduleId}/status`);
            if (response.ok) {
                const status = await response.json();
                setSessionStatus(status);
            } else {
                setSessionStatus(null);
            }
        } catch (error) {
            console.error('Error checking session status:', error);
            setSessionStatus(null);
        }
    };

    // Handle access code submission
    const handleSubmitAccessCode = async () => {
        if (!selectedScheduleForJoin || !accessCode.trim()) {
            message.error('Please enter the access code');
            return;
        }

        setJoiningClass(true);
        try {
            let sessionId: number | null = null;
            let lastResponseData: any = null;

            // Prefer the session status endpoint result (checked when opening the modal)
            if (sessionStatus?.canJoin && sessionStatus?.sessionId) {
                sessionId = sessionStatus.sessionId;
                console.log('Using sessionId from status endpoint:', sessionId);
            }

            if (!sessionId) {
                // Fallback: query sessions by schedule only (no date filter to avoid mismatches)
                const listResp = await apiCall(`/attendance/sessions?schedule_id=${selectedScheduleForJoin.id}`);
                if (!listResp.ok) {
                    throw new Error('Failed to fetch sessions for this schedule');
                }

                const responseData = await listResp.json();
                lastResponseData = responseData;
                const sessions = responseData.sessions || [];

                // Debug logging
                console.log('API Response (fallback):', responseData);
                console.log('Sessions found:', sessions);
                console.log('Looking for schedule_id:', selectedScheduleForJoin.id);
                console.log('Selected schedule:', selectedScheduleForJoin);

                // Prefer an active session
                const active = sessions.find((s: any) =>
                    Number(s.schedule_id) === Number(selectedScheduleForJoin.id) &&
                    (s.status === 'in_progress' || s.status === 'started')
                ) || sessions.find((s: any) => Number(s.schedule_id) === Number(selectedScheduleForJoin.id));

                sessionId = active?.id ?? null;
            }

            if (!sessionId) {
                console.log('No session found. Available sessions:', (lastResponseData?.sessions || []).map((s: any) => ({ id: s.id, schedule_id: s.schedule_id, status: s.status })));
                throw new Error('No active session found for this class');
            }

            // Join the session with access code
            const joinResponse = await apiCall(`/attendance/sessions/${sessionId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: accessCode.trim().toUpperCase() })
            });

            if (joinResponse.ok) {
                const result = await joinResponse.json();
                message.success(`Successfully joined class! Attendance marked as ${result.status}`);
                
                // Mark as joined locally
                markJoined(selectedScheduleForJoin.id);
                
                // Open meeting link if available
                if (selectedScheduleForJoin.link) {
                    window.open(selectedScheduleForJoin.link, '_blank', 'noopener,noreferrer');
                }
                
                // Close modal
                setJoinClassModalVisible(false);
                setAccessCode('');
                setSelectedScheduleForJoin(null);
                form.resetFields();
                
                // Refresh schedules to update status
                fetchSchedules();
            } else {
                const error = await joinResponse.json();
                message.error(error.error || 'Failed to join class');
            }
        } catch (error) {
            console.error('Error joining class:', error);
            message.error('Error joining class. Please try again.');
        } finally {
            setJoiningClass(false);
        }
    };



    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>
                    <CalendarOutlined /> My Schedule
                </Title>
            </div>

            <Spin spinning={loading} tip="Loading schedule statistics...">
                {stats && (
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Total Classes"
                                    value={stats.total_classes ?? 0}
                                    prefix={<BookOutlined />}
                                    valueStyle={{ color: '#1677ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="This Week"
                                    value={stats.this_week_classes ?? 0}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Upcoming"
                                    value={stats.upcoming_classes ?? 0}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="Completed"
                                    value={stats.completed_classes ?? 0}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}
            </Spin>

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
                                {/* Removed direct "Join Now" button to enforce code-based join */}
                                {nextClass.type === 'class' && (
                                    <Tooltip title={hasJoined(nextClass.id) ? 'Already joined class' : 'Join class with access code'}>
                                        <Button 
                                            type="primary"
                                            icon={<LoginOutlined />}
                                            onClick={() => handleJoinClass(nextClass)}
                                            disabled={hasJoined(nextClass.id) || isScheduleEnded(nextClass)}
                                            style={{
                                                backgroundColor: hasJoined(nextClass.id) ? '#52c41a' : '#1890ff',
                                                borderColor: hasJoined(nextClass.id) ? '#52c41a' : '#1890ff'
                                            }}
                                        >
                                            {hasJoined(nextClass.id) ? 'Joined' : 'Join Class'}
                                        </Button>
                                    </Tooltip>
                                )}
                                <Button 
                                    ghost
                                    onClick={() => handleViewDetails(nextClass)}
                                >
                                    Details
                                </Button>
                                {hasJoined(nextClass.id) ? <Tag color="success">ATTENDED</Tag> : null}
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
                    <Tabs 
                        defaultActiveKey="today" 
                        size="small"
                        items={[
                            {
                                key: 'today',
                                label: `Today (${todaySchedules.length})`,
                                children: (
                                    <Card size="small">
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                                <Spin size="large" />
                                                <div style={{ marginTop: 8 }}>Loading today's schedule...</div>
                                            </div>
                                        ) : todaySchedules.length > 0 ? (
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
                                                                    {hasJoined(schedule.id) ? <Tag color="success">ATTENDED</Tag> : null}
                                                                    {schedule.type === 'class' && (
                                                                        <Button
                                                                            size="small"
                                                                            type="primary"
                                                                            icon={<LoginOutlined />}
                                                                            disabled={hasJoined(schedule.id) || isScheduleEnded(schedule)}
                                                                            style={{
                                                                                backgroundColor: hasJoined(schedule.id) ? '#52c41a' : '#1890ff',
                                                                                borderColor: hasJoined(schedule.id) ? '#52c41a' : '#1890ff'
                                                                            }}
                                                                            onClick={(e) => {
                                                                                (e as any).stopPropagation();
                                                                                handleJoinClass(schedule);
                                                                            }}
                                                                        >
                                                                            {hasJoined(schedule.id) ? 'Joined' : 'Join Class'}
                                                                        </Button>
                                                                    )}
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
                                                                            handleJoinClass(schedule);
                                                                        }
                                                                    }}
                                                                        >
                                                                            {isScheduleEnded(schedule) ? 'Ended' : 'Join Meeting'}
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
                                )
                            },
                            {
                                key: 'upcoming',
                                label: `Upcoming (${upcomingSchedules.slice(0, 10).length})`,
                                children: (
                                    <Card size="small">
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                                <Spin size="large" />
                                                <div style={{ marginTop: 8 }}>Loading upcoming classes...</div>
                                            </div>
                                        ) : upcomingSchedules.slice(0, 10).length > 0 ? (
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
                                                                            handleJoinClass(schedule);
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
                                )
                            },
                            {
                                key: 'week',
                                label: `This Week (${thisWeekSchedules.length})`,
                                children: (
                                    <Card size="small">
                                        {loading ? (
                                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                                <Spin size="large" />
                                                <div style={{ marginTop: 8 }}>Loading this week's schedule...</div>
                                            </div>
                                        ) : thisWeekSchedules.length > 0 ? (
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
                                )
                            }
                        ]}
                    />
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
                                if (canJoinMeetingSchedule(selectedSchedule) && !isScheduleEnded(selectedSchedule)) {
                                    handleJoinClass(selectedSchedule);
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

            {/* Join Class Modal */}
            <Modal
                title="Join Class"
                open={joinClassModalVisible}
                onCancel={() => {
                    if (!joiningClass) {
                        setJoinClassModalVisible(false);
                        setSelectedScheduleForJoin(null);
                        setAccessCode('');
                        setSessionStatus(null);
                        form.resetFields();
                    }
                }}
                footer={null}
                width={500}
                closable={!joiningClass}
                maskClosable={!joiningClass}
            >
                {selectedScheduleForJoin && (
                    <div>
                        {/* Class Information */}
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 16, color: '#1890ff' }}>
                                📚 {selectedScheduleForJoin.title}
                            </h3>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Batch:</strong> {selectedScheduleForJoin.batch_name}</p>
                                    <p><strong>Teacher:</strong> {selectedScheduleForJoin.teacher_name}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Date:</strong> {dayjs(selectedScheduleForJoin.date).format('MMMM D, YYYY')}</p>
                                    <p><strong>Time:</strong> {selectedScheduleForJoin.start_time} - {selectedScheduleForJoin.end_time}</p>
                                </Col>
                            </Row>
                        </div>

                        {/* Session Status Alert */}
                        {sessionStatus ? (
                            sessionStatus.canJoin ? (
                                <Alert
                                    message="Class Session Active"
                                    description="Your teacher has started the class session. Enter the access code you received via email to join and mark your attendance."
                                    type="success"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />
                            ) : (
                                <Alert
                                    message="Cannot Join Class"
                                    description={sessionStatus.reason || 'Class session is not available for joining at this time.'}
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />
                            )
                        ) : (
                            <Alert
                                message="Waiting for Teacher"
                                description="The teacher has not started the class session yet. You will receive an email with the access code once the session begins."
                                type="info"
                                showIcon
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        {/* Access Code Form */}
                        {sessionStatus?.canJoin && (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmitAccessCode}
                            >
                                <Form.Item
                                    label="Access Code"
                                    name="accessCode"
                                    rules={[
                                        { required: true, message: 'Please enter the access code' },
                                        { len: 6, message: 'Access code must be 6 characters' }
                                    ]}
                                >
                                    <Input
                                        size="large"
                                        placeholder="Enter 6-digit access code"
                                        value={accessCode}
                                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                                        maxLength={6}
                                        style={{
                                            textAlign: 'center',
                                            fontSize: '18px',
                                            letterSpacing: '4px',
                                            fontFamily: 'monospace'
                                        }}
                                        prefix={<KeyOutlined />}
                                    />
                                </Form.Item>

                                <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                                    <Space size="large">
                                        <Button
                                            onClick={() => setJoinClassModalVisible(false)}
                                            disabled={joiningClass}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={joiningClass}
                                            disabled={!accessCode.trim() || accessCode.length !== 6}
                                            size="large"
                                            style={{
                                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                border: 'none'
                                            }}
                                        >
                                            {joiningClass ? 'Joining Class...' : 'Join Class'}
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        )}

                        {/* Instructions */}
                        <Alert
                            message="How to Join"
                            description={
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    <li>Wait for your teacher to start the class session</li>
                                    <li>Check your email for the access code</li>
                                    <li>Enter the 6-digit code above</li>
                                    <li>Your attendance will be automatically recorded</li>
                                </ul>
                            }
                            type="info"
                            style={{ marginTop: 16 }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentSchedule;