import React, { useState, useEffect } from 'react';
import {
    Card,
    message,
    Typography,
    Tag,
    Tabs,
    Row,
    Col,
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
    Tooltip,
    Skeleton,
    Select,
    DatePicker
} from 'antd';

const { RangePicker } = DatePicker;
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

/* ── KPI Card ── */
const KpiCard = ({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent: string }) => (
    <div style={{ borderRadius: 16, padding: '16px 20px', background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', gap: 16, height: '100%' }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: accent, flexShrink: 0 }}>{icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>{value}</div>
        </div>
    </div>
);

const StudentSchedule: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [stats, setStats] = useState<ScheduleStats | null>(null);
    const [loading, setLoading] = useState(true); // Add loading state

    // Filter states
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

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
                
                // Check server-side join status for all class schedules in parallel (not sequential)
                const classSchedules = normalized.filter(s => s.type === 'class');
                if (classSchedules.length > 0) {
                    Promise.all(classSchedules.map(s => checkServerJoinStatus(s.id))).catch(() => {});
                }
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

    const availableBatches = React.useMemo(() => {
        const map = new Map<number, string>();
        schedules.forEach(s => {
            if (s.batch_id && s.batch_name) map.set(s.batch_id, s.batch_name);
        });
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
    }, [schedules]);

    const availableTeachers = React.useMemo(() => {
        const set = new Set<string>();
        schedules.forEach(s => {
            if (s.teacher_name) set.add(s.teacher_name);
        });
        return Array.from(set).map(name => ({ value: name, label: name }));
    }, [schedules]);

    const filteredSchedules = React.useMemo(() => {
        return schedules.filter(s => {
            if (batchFilter && s.batch_id !== batchFilter) return false;
            if (teacherFilter && s.teacher_name !== teacherFilter) return false;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const sDate = dayjs(s.date);
                if (sDate.isBefore(dateRange[0].startOf('day')) || sDate.isAfter(dateRange[1].endOf('day'))) {
                    return false;
                }
            }
            return true;
        });
    }, [schedules, batchFilter, teacherFilter, dateRange]);

    React.useEffect(() => {
        setStats(computeStats(filteredSchedules));
    }, [filteredSchedules]);

    // Convert schedules to FullCalendar events
    const events = React.useMemo(() => {
        return filteredSchedules.map((s) => {
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

    const todaySchedules = filteredSchedules.filter(schedule => isToday(schedule.date));
    const upcomingSchedules = filteredSchedules
        .filter(schedule => isUpcoming(schedule.date, schedule.start_time))
        .sort((a, b) => {
            const dateTimeA = dayjs(`${a.date} ${a.start_time}`);
            const dateTimeB = dayjs(`${b.date} ${b.start_time}`);
            return dateTimeA.valueOf() - dateTimeB.valueOf();
        });
    const thisWeekSchedules = filteredSchedules.filter(schedule => {
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



    if (loading && schedules.length === 0) return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: 24 }}>
                <Skeleton.Input active style={{ width: 200, height: 26, borderRadius: 8 }} />
                <div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 300, height: 13, borderRadius: 6 }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} style={{ borderRadius: 16, padding: '20px 22px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 16 }}><Skeleton.Avatar active size={46} shape="square" style={{ borderRadius: 13 }} /><div style={{ flex: 1 }}><Skeleton.Input active style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 8 }} block /><Skeleton.Input active style={{ width: 40, height: 26, borderRadius: 6 }} /></div></div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                <Skeleton.Node active style={{ width: '100%', height: '100%', borderRadius: 16 }}><div /></Skeleton.Node>
                <div style={{ width: '33%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Skeleton.Node active style={{ width: '100%', height: 200, borderRadius: 16 }}><div /></Skeleton.Node>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1600, margin: '0 auto', width: '100%', flex: 1, minHeight: 0 }}>
                <div style={{ marginBottom: 20, flexShrink: 0 }}>
                    <Title level={3} style={{ color: '#1a1d2e', marginBottom: 4, fontWeight: 700, fontSize: 22 }}>
                        My Class Schedule
                    </Title>
                    <Text style={{ fontSize: '14px', color: '#64748b' }}>
                        View your upcoming classes, meetings, and academic events
                    </Text>
                </div>

                {/* Filters */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', boxShadow: '0 2px 12px rgba(99,102,241,0.06)' }}>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates: any) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                        style={{ borderRadius: 8 }}
                        allowClear
                    />
                    <Select
                        value={batchFilter}
                        onChange={setBatchFilter}
                        allowClear
                        placeholder="All Batches"
                        style={{ width: 200 }}
                        options={availableBatches}
                        showSearch
                        optionFilterProp="label"
                    />
                    <Select
                        value={teacherFilter}
                        onChange={setTeacherFilter}
                        allowClear
                        placeholder="All Teachers"
                        style={{ width: 200 }}
                        options={availableTeachers}
                        showSearch
                        optionFilterProp="label"
                    />
                </div>

                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20, flexShrink: 0 }}>
                        <KpiCard label="Total Classes" value={stats.total_classes ?? 0} icon={<BookOutlined />} accent="#1a56db" />
                        <KpiCard label="This Week" value={stats.this_week_classes ?? 0} icon={<CalendarOutlined />} accent="#059669" />
                        <KpiCard label="Upcoming" value={stats.upcoming_classes ?? 0} icon={<ClockCircleOutlined />} accent="#d97706" />
                        <KpiCard label="Completed" value={stats.completed_classes ?? 0} icon={<CheckCircleOutlined />} accent="#059669" />
                    </div>
                )}

                {nextClass && (
                    <div style={{ marginBottom: 20, background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)', borderRadius: 16, padding: '20px 24px', color: '#fff', boxShadow: '0 4px 14px rgba(99,102,241,0.25)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.8)' }}>
                                <ClockCircleOutlined /> Next Class
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{nextClass.title}</div>
                                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', display: 'block', marginBottom: 4 }}>
                                        📅 {dayjs(nextClass.date).format('dddd, MMMM DD')} at {formatTime(nextClass.start_time)}
                                    </Text>
                            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                                        {nextClass.location_mode === 'online' ? (
                                            <><VideoCameraOutlined /> Online Meeting &nbsp;•&nbsp; <TeamOutlined /> {nextClass.teacher_name}</>
                                        ) : (
                                            <><EnvironmentOutlined /> {nextClass.location} &nbsp;•&nbsp; <TeamOutlined /> {nextClass.teacher_name}</>
                                        )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {nextClass.type === 'class' && (
                                <Tooltip title={hasJoined(nextClass.id) ? 'Already joined class' : 'Join class with access code'}>
                                    <Button type="primary" icon={<LoginOutlined />} onClick={() => handleJoinClass(nextClass)}
                                        disabled={hasJoined(nextClass.id) || isScheduleEnded(nextClass)}
                                        style={{ backgroundColor: hasJoined(nextClass.id) ? '#10b981' : '#fff', color: hasJoined(nextClass.id) ? '#fff' : '#6366f1', borderColor: 'transparent', fontWeight: 600, height: 38, borderRadius: 10 }}>
                                        {hasJoined(nextClass.id) ? 'Attended' : 'Join Class'}
                                    </Button>
                                </Tooltip>
                            )}
                            <Button onClick={() => handleViewDetails(nextClass)} style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'transparent', color: '#fff', fontWeight: 600, height: 38, borderRadius: 10 }}>
                                View Details
                            </Button>
                        </div>
                    </div>
                )}

                {/* Main Content Flex Area */}
                <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
                    {/* Calendar Section */}
                    <div className="schedule-calendar-wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', padding: '16px 20px', minWidth: 0 }}>
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    height="auto"
                                    events={events}
                                    editable={false}
                                    selectable={false}
                                    selectMirror={false}
                                    dayMaxEvents={true}
                                    eventClick={handleEventClick}
                                    eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: true }}
                                />
                        </div>
                    
                    {/* Side Panel */}
                    <div style={{ width: 340, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flexShrink: 0, minHeight: 0 }}>
                        <Tabs 
                            defaultActiveKey="today" 
                            size="small"
                            tabBarStyle={{ padding: '0 16px', borderBottom: '1px solid #f0f0f8', marginBottom: 0 }}
                            items={[
                                {
                                    key: 'today',
                                    label: <span style={{ fontWeight: 600 }}>Today ({todaySchedules.length})</span>,
                                    children: (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', padding: 16 }}>
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
                                    </div>
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
                </div>
            </div>

            {/* Redesigned Details Modal to match backend style */}
            <Modal
                title={null}
                wrapClassName="premium-modal"
                closeIcon={<div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'all 0.2s', marginTop: 12, marginRight: 12 }} onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'rotate(90deg)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}>✕</div>}
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={null}
                width={700}
                style={{ padding: 0 }}
            >
                {selectedSchedule && (
                    <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '32px 40px', color: '#fff', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#818cf8' }}>
                                    {getStatusIcon(getEffectiveStatus(selectedSchedule))}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#fff' }}>{selectedSchedule.title}</h2>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                                        <Tag color={getTypeColor(selectedSchedule.type)} style={{ border: 'none' }}>{selectedSchedule.type.toUpperCase()}</Tag>
                                        <span style={{ color: '#94a3b8', fontSize: 13 }}>{dayjs(selectedSchedule.date).format('MMMM D, YYYY')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '32px 40px', overflowY: 'auto', background: '#f8fafc' }}>
                            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #f0f0f8', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
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
                        </div>
                        
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <Button size="large" onClick={() => setDetailsVisible(false)} style={{ borderRadius: 8, fontWeight: 600 }}>Close</Button>
                            {selectedSchedule?.link && (
                                <Button
                                    size="large"
                                    type="primary"
                                    disabled={!canJoinMeetingSchedule(selectedSchedule) || isScheduleEnded(selectedSchedule)}
                                    style={{
                                        backgroundColor: isScheduleEnded(selectedSchedule) ? '#d9d9d9' : (canJoinMeetingSchedule(selectedSchedule) ? '#10b981' : '#d9d9d9'),
                                        borderColor: 'transparent',
                                        color: isScheduleEnded(selectedSchedule) ? '#00000040' : (canJoinMeetingSchedule(selectedSchedule) ? '#fff' : '#00000040'),
                                        borderRadius: 8,
                                        fontWeight: 600
                                    }}
                                    onClick={() => {
                                        if (canJoinMeetingSchedule(selectedSchedule) && !isScheduleEnded(selectedSchedule)) {
                                            handleJoinClass(selectedSchedule);
                                        }
                                    }}
                                >
                                    {isScheduleEnded(selectedSchedule) ? 'Meeting Ended' : (canJoinMeetingSchedule(selectedSchedule) ? 'Join Meeting' : 'Join available 5 minutes before')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
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
            <style>{`
                .premium-modal .ant-modal-content {
                    padding: 0;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .premium-modal .ant-modal-close {
                    top: 0;
                    right: 0;
                }
                .schedule-calendar-wrap .fc {
                    height: 100% !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .schedule-calendar-wrap .fc .fc-toolbar-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1e293b;
                }
                .schedule-calendar-wrap .fc .fc-button {
                    border-radius: 8px;
                    text-transform: capitalize;
                    font-weight: 600;
                    font-size: 13px;
                    padding: 6px 14px;
                    transition: all 0.2s;
                    box-shadow: none !important;
                }
                .schedule-calendar-wrap .fc .fc-button-primary {
                    background-color: #6366f1;
                    border-color: #6366f1;
                }
                .schedule-calendar-wrap .fc .fc-button-primary:hover {
                    background-color: #4f46e5;
                    border-color: #4f46e5;
                }
                .schedule-calendar-wrap .fc .fc-button-primary:not(:disabled).fc-button-active {
                    background-color: #4338ca;
                    border-color: #4338ca;
                }
                .schedule-calendar-wrap .fc .fc-button-primary:not(:disabled):active {
                    background-color: #4338ca;
                    border-color: #4338ca;
                }
                .schedule-calendar-wrap .fc .fc-col-header-cell {
                    padding: 10px 0;
                    font-weight: 600;
                    font-size: 13px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: #f8fafc;
                    border-color: #f0f0f8;
                }
                .schedule-calendar-wrap .fc .fc-daygrid-day {
                    transition: background-color 0.2s;
                    border-color: #f0f0f8;
                }
                .schedule-calendar-wrap .fc .fc-daygrid-day:hover {
                    background-color: #f8f7ff;
                }
                .schedule-calendar-wrap .fc .fc-daygrid-day-number {
                    font-weight: 600;
                    font-size: 13px;
                    color: #334155;
                    padding: 8px 10px;
                }
                .schedule-calendar-wrap .fc .fc-day-today {
                    background-color: #eef2ff !important;
                }
                .schedule-calendar-wrap .fc .fc-day-today .fc-daygrid-day-number {
                    background: #6366f1;
                    color: #fff;
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 4px;
                }
                .schedule-calendar-wrap .fc .fc-event {
                    border-radius: 6px;
                    padding: 2px 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: transform 0.15s, box-shadow 0.15s;
                }
                .schedule-calendar-wrap .fc .fc-event:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.12);
                }
                .schedule-calendar-wrap .fc .fc-view-harness {
                    flex: 1;
                    min-height: 0;
                }
                .schedule-calendar-wrap .fc .fc-scrollgrid {
                    border-color: #f0f0f8;
                    border-radius: 10px;
                    overflow: hidden;
                }
                .schedule-calendar-wrap .fc .fc-scroller {
                    overflow-y: auto !important;
                }
                .schedule-calendar-wrap .fc .fc-today-button {
                    border-radius: 8px;
                    font-weight: 600;
                    text-transform: capitalize;
                }
            `}</style>
        </div>
    );
};

export default StudentSchedule;