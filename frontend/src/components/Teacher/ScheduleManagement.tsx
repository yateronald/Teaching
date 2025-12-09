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
    Space,
    Typography,
    Tag,
    Popconfirm,
    Card,
    Tabs,
    Row,
    Col,
    Statistic,
    Descriptions,
    Alert,
    Tooltip,
    App
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    TeamOutlined,
    BookOutlined,
    PlayCircleOutlined,
    StopOutlined,
    CopyOutlined,
    LinkOutlined,
    VideoCameraOutlined
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
    const { message, notification } = App.useApp();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [form] = Form.useForm();
    const { apiCall } = useAuth();

    // New: view-only modal state for event details
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [viewSchedule, setViewSchedule] = useState<Schedule | null>(null);
    
    // Loading state for form submission
    const [submitting, setSubmitting] = useState(false);
    
    // Attendance-related state
    const [startClassModalVisible, setStartClassModalVisible] = useState(false);
    const [startingSession, setStartingSession] = useState(false);
    const [selectedScheduleForStart, setSelectedScheduleForStart] = useState<Schedule | null>(null);
    const [generatedCode, setGeneratedCode] = useState<string>(() => {
        try {
            return localStorage.getItem('teacherGeneratedCode') || '';
        } catch {
            return '';
        }
    });
    const [codeExpiresAt, setCodeExpiresAt] = useState<string>(() => {
        try {
            return localStorage.getItem('teacherCodeExpiresAt') || '';
        } catch {
            return '';
        }
    });
    const [sessionId, setSessionId] = useState<number | null>(() => {
        try {
            const stored = localStorage.getItem('teacherSessionId');
            return stored ? parseInt(stored, 10) : null;
        } catch {
            return null;
        }
    });

    // Persist session details to localStorage
    useEffect(() => {
        if (generatedCode) {
            localStorage.setItem('teacherGeneratedCode', generatedCode);
        } else {
            localStorage.removeItem('teacherGeneratedCode');
        }
    }, [generatedCode]);

    useEffect(() => {
        if (codeExpiresAt) {
            localStorage.setItem('teacherCodeExpiresAt', codeExpiresAt);
        } else {
            localStorage.removeItem('teacherCodeExpiresAt');
        }
    }, [codeExpiresAt]);

    useEffect(() => {
        if (sessionId !== null) {
            localStorage.setItem('teacherSessionId', sessionId.toString());
        } else {
            localStorage.removeItem('teacherSessionId');
        }
    }, [sessionId]);

    // Track which schedules have active sessions (teacher has generated code)
    const [activeSessions, setActiveSessions] = useState<Set<number>>(() => {
        try {
            const stored = localStorage.getItem('teacherActiveSessions');
            if (stored) {
                const parsed = JSON.parse(stored);
                const normalized = Array.isArray(parsed) ? parsed.map((x: any) => Number(x)) : [];
                return new Set<number>(normalized.filter((n: any) => !Number.isNaN(n)));
            }
            return new Set<number>();
        } catch {
            return new Set<number>();
        }
    });

    // Persist active sessions to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('teacherActiveSessions', JSON.stringify(Array.from(activeSessions)));
    }, [activeSessions]);

    useEffect(() => {
        fetchSchedules();
        fetchBatches();
        fetchActiveSessions();
    }, []);

    // After schedules load/update, double-check active sessions by querying the check endpoint per schedule for today
    useEffect(() => {
        const syncActiveSessionsFromCheck = async () => {
            try {
                const today = dayjs().format('YYYY-MM-DD');
                const todays = schedules.filter(s => s.date === today);
                if (todays.length === 0) return;

                const results = await Promise.allSettled(
                    todays.map(s => apiCall(`/attendance/sessions/check/${s.id}?date=${today}`))
                );

                const newSet = new Set<number>(activeSessions);
                for (let i = 0; i < results.length; i++) {
                    const r = results[i];
                    if (r.status === 'fulfilled') {
                        const resp = r.value;
                        if (resp?.ok) {
                            try {
                                const data = await resp.json();
                                if (data?.exists && data?.session?.access_code && data?.session?.schedule_id) {
                                    newSet.add(Number(data.session.schedule_id));
                                }
                            } catch {}
                        }
                    }
                }
                setActiveSessions(newSet);
            } catch (e) {
                console.warn('Failed to sync active sessions from check endpoint:', e);
            }
        };

        // Run only when we have schedules
        if (schedules && schedules.length > 0) {
            syncActiveSessionsFromCheck();
        }
    }, [schedules]);

    const fetchActiveSessions = async () => {
        try {
            const today = dayjs().format('YYYY-MM-DD');
            const response = await apiCall(`/attendance/sessions?date=${today}`);
            
            if (response.ok) {
                const data = await response.json();
                const activeScheduleIds = new Set<number>();
                
                // The response has a sessions array
                const sessions = data.sessions || [];
                
                // Ensure sessions is an array before using forEach
                if (Array.isArray(sessions)) {
                    sessions.forEach((session: any) => {
                        // Check if session has an access_code and is active (not ended)
                        if (session.access_code && session.schedule_id && session.status !== 'completed') {
                            activeScheduleIds.add(Number(session.schedule_id));
                        }
                    });
                } else {
                    console.warn('Sessions response is not an array:', sessions);
                }
                
                setActiveSessions(activeScheduleIds);
                
                // Validate localStorage state against server state
                await validateLocalStorageState(Array.isArray(sessions) ? sessions : []);
            }
        } catch (error) {
            console.error('Error fetching active sessions:', error);
        }
    };

    const validateLocalStorageState = async (sessions: any[]) => {
        const storedSessionId = localStorage.getItem('teacherSessionId');
        const storedCode = localStorage.getItem('teacherGeneratedCode');
        
        if (storedSessionId && storedCode) {
            const sessionId = parseInt(storedSessionId, 10);
            const activeSession = sessions.find(s => s.id === sessionId && s.access_code);
            
            if (!activeSession) {
                // Session no longer exists on server, clear localStorage
                localStorage.removeItem('teacherGeneratedCode');
                localStorage.removeItem('teacherCodeExpiresAt');
                localStorage.removeItem('teacherSessionId');
                setGeneratedCode('');
                setCodeExpiresAt('');
                setSessionId(null);
            } else {
                // Sync with server state (use code_expires_at from API)
                setGeneratedCode(activeSession.access_code);
                setCodeExpiresAt(activeSession.code_expires_at || '');
                setSessionId(activeSession.id);
            }
        }
    };

    const normalizeFromBackend = (items: BackendSchedule[]): Schedule[] => {
        return items.map(item => {
            const date = dayjs(item.start_time);
            const end = dayjs(item.end_time);
            return {
                id: Number(item.id),
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
                // Normalize backend status casing to keep comparisons consistent
                status: (item.status ? (item.status.toLowerCase() as any) : 'scheduled'),
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

        setSubmitting(true);
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
        } finally {
            setSubmitting(false);
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

    // Check if teacher can start class (15 minutes before)
    const canStartClass = (schedule: Schedule): boolean => {
        const now = dayjs();
        const scheduleStart = dayjs(`${schedule.date} ${schedule.start_time}`);
        const fifteenMinutesBefore = scheduleStart.subtract(15, 'minutes');
        const scheduleEnd = dayjs(`${schedule.date} ${schedule.end_time}`);
        
        // Can start if current time is between 15 minutes before start and schedule end
        return now.isAfter(fifteenMinutesBefore) && now.isBefore(scheduleEnd) && schedule.type === 'class';
    };

    // Handle start class button click
    const handleStartClass = async (schedule: Schedule) => {
        setSelectedScheduleForStart(schedule);

        try {
            const today = dayjs().format('YYYY-MM-DD');
            const response = await apiCall(`/attendance/sessions/check/${schedule.id}?date=${today}`);

            if (response.ok) {
                const data = await response.json();
                
                if (data.exists && data.session) {
                    // Session already exists with access code
                    setGeneratedCode(data.session.access_code);
                    setCodeExpiresAt(data.session.code_expires_at);
                    setSessionId(data.session.id);
                    setActiveSessions(prev => {
                        const newSet = new Set(prev);
                        newSet.add(Number(schedule.id));
                        return newSet;
                    });

                    // If schedule has a meeting link, redirect directly
                    if (schedule.link && schedule.location_mode === 'online') {
                        window.open(schedule.link, '_blank');
                        return;
                    } else {
                        // For physical classes or classes without links, show the modal with session info
                        setStartClassModalVisible(true);
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Error checking existing session:', error);
        }

        // If no active session or error, reset and open modal for code generation
        setGeneratedCode('');
        setCodeExpiresAt('');
        setSessionId(null);
        setStartClassModalVisible(true);
    };

    // Generate access code and start session
    const handleGenerateCode = async () => {
        if (!selectedScheduleForStart) return;

        setStartingSession(true);
        try {
            const response = await apiCall(`/attendance/sessions/${selectedScheduleForStart.id}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionDate: selectedScheduleForStart.date
                })
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedCode(data.accessCode);
                setCodeExpiresAt(data.expiresAt);
                setSessionId(data.sessionId);
                
                // Mark this schedule as having an active session
                setActiveSessions(prev => new Set(prev).add(selectedScheduleForStart.id));
                
                // Notify success prominently (single notification)
                notification?.success({
                    message: 'Access code generated successfully',
                    description: `Code: ${data.accessCode} • Expires: ${dayjs(data.expiresAt).format('MMM D, YYYY HH:mm')}`,
                    placement: 'topRight'
                });
                
                // Send emails to students
                await sendCodeToStudents(data.sessionId, data.accessCode);
                
                // Refresh only the active sessions state (row-specific refresh)
                await fetchActiveSessions();
                
                // Auto-close the modal after successful code generation
                setStartClassModalVisible(false);
                
            } else {
                const error = await response.json();
                message.error(error.error || 'Failed to start class session');
            }
        } catch (error) {
            console.error('Error starting class:', error);
            message.error('Error starting class session');
        } finally {
            setStartingSession(false);
        }
    };

    // Send access code to students via email
    const sendCodeToStudents = async (sessionId: number, accessCode: string) => {
        try {
            // This would typically be handled by the backend when generating the code
            // But we can add a separate endpoint if needed for manual resending
            console.log(`Access code ${accessCode} for session ${sessionId} should be sent to students`);
        } catch (error) {
            console.error('Error sending code to students:', error);
        }
    };

    // Copy access code to clipboard
    const copyCodeToClipboard = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            message.success('Access code copied to clipboard!');
        }
    };

    // End class session
    const handleEndSession = async () => {
        if (!sessionId || !selectedScheduleForStart) return;

        try {
            const response = await apiCall(`/attendance/sessions/${sessionId}/end`, {
                method: 'POST'
            });

            if (response.ok) {
                message.success('Class session ended successfully');
                
                // Remove from active sessions
                setActiveSessions(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(selectedScheduleForStart.id);
                    return newSet;
                });
                
                // Clear session state and localStorage
                setStartClassModalVisible(false);
                setGeneratedCode('');
                setCodeExpiresAt('');
                setSessionId(null);
                setSelectedScheduleForStart(null);
                
                // Clear localStorage
                localStorage.removeItem('teacherGeneratedCode');
                localStorage.removeItem('teacherCodeExpiresAt');
                localStorage.removeItem('teacherSessionId');
            } else {
                const error = await response.json();
                message.error(error.error || 'Failed to end session');
            }
        } catch (error) {
            console.error('Error ending session:', error);
            message.error('Error ending session');
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
            location_mode: 'online',
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
                location_mode: 'online',
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
                location_mode: 'online',
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
            render: (_, record: Schedule) => (
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
                    {record.type === 'class' && (
                        <Tooltip title={
                            isScheduleEnded(record)
                                ? 'Meeting has ended'
                                : activeSessions.has(record.id) 
                                    ? 'Join the class session' 
                                    : canStartClass(record) 
                                        ? 'Start class session' 
                                        : 'Class can be started 15 minutes before scheduled time'
                        }>
                            <Button
                                type="primary"
                                size="small"
                                icon={activeSessions.has(Number(record.id)) ? <LinkOutlined /> : <PlayCircleOutlined />}
                                onClick={() => {
                                    if (isScheduleEnded(record)) {
                                        return; // Do nothing if meeting has ended
                                    }
                                    if (activeSessions.has(Number(record.id))) {
                                        // Join session - open meeting link
                                        if (record.link) {
                                            window.open(record.link, '_blank', 'noopener,noreferrer');
                                        }
                                    } else {
                                        // Start class
                                        handleStartClass(record);
                                    }
                                }}
                                disabled={isScheduleEnded(record) || (!canStartClass(record) && !activeSessions.has(Number(record.id)))}
                                style={{
                                    backgroundColor: isScheduleEnded(record) 
                                        ? '#d9d9d9'
                                        : activeSessions.has(Number(record.id)) 
                                            ? '#1890ff' 
                                            : canStartClass(record) 
                                                ? '#52c41a' 
                                                : undefined,
                                    borderColor: isScheduleEnded(record) 
                                        ? '#d9d9d9'
                                        : activeSessions.has(Number(record.id)) 
                                            ? '#1890ff' 
                                            : canStartClass(record) 
                                                ? '#52c41a' 
                                                : undefined,
                                    color: isScheduleEnded(record) ? '#00000040' : undefined
                                }}
                            >
                                {isScheduleEnded(record) 
                                    ? 'Meeting Ended' 
                                    : activeSessions.has(record.id) 
                                        ? 'Join Session' 
                                        : 'Start Class'}
                            </Button>
                        </Tooltip>
                    )}
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

    // Check if teacher can join meeting (only after generating access code)
    const canTeacherJoinMeeting = (schedule: Schedule): boolean => {
        const now = dayjs();
        const scheduleStart = dayjs(`${schedule.date} ${schedule.start_time}`);
        const scheduleEnd = dayjs(`${schedule.date} ${schedule.end_time}`);
        
        // Teacher can only join if:
        // 1. They have generated an access code for this schedule
        // 2. Current time is within the schedule window
        // 3. Schedule hasn't ended
        return activeSessions.has(schedule.id) && 
               now.isAfter(scheduleStart.subtract(5, 'minutes')) && 
               now.isBefore(scheduleEnd);
    };

    // Render Join Meeting button
    const renderJoinMeetingButton = (schedule: Schedule) => {
        const canJoin = canTeacherJoinMeeting(schedule);
        const hasActiveSession = activeSessions.has(schedule.id);
        const hasEnded = isScheduleEnded(schedule);
        
        if (!schedule.link) {
            return 'Online';
        }

        // If no active session, show that code needs to be generated first
        if (!hasActiveSession && !hasEnded) {
            return (
                <Button
                    type="default"
                    size="small"
                    disabled={true}
                    style={{
                        backgroundColor: '#f5f5f5',
                        borderColor: '#d9d9d9',
                        color: '#00000040'
                    }}
                    title="Generate access code first to join meeting"
                >
                    Generate Code First
                </Button>
            );
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
                    if (canJoin && !hasEnded && schedule.link) {
                        window.open(schedule.link, '_blank', 'noopener,noreferrer');
                    }
                }}
                title={hasEnded ? 'Meeting has ended' : (canJoin ? 'Click to join the session' : 'Meeting not available yet')}
            >
                {hasEnded ? 'Meeting Ended' : 'Join the Session'}
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
        ['ended', 'completed'].includes(getEffectiveStatus(schedule))
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
                    if (!submitting) {
                        setModalVisible(false);
                        setEditingSchedule(null);
                    }
                }}
                footer={null}
                width={650}
                closable={!submitting}
                maskClosable={!submitting}
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
                                initialValue="online"
                            >
                                <Select>
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
                            <Button onClick={() => setModalVisible(false)} disabled={submitting}>Cancel</Button>
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                loading={submitting}
                                disabled={submitting}
                            >
                                {submitting 
                                    ? `${editingSchedule ? 'Updating' : 'Creating'}...` 
                                    : editingSchedule ? 'Update' : 'Create'
                                }
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

            {/* Start Class Modal */}
            <Modal
                title="Start Class Session"
                open={startClassModalVisible}
                onCancel={() => {
                    if (!startingSession) {
                        setStartClassModalVisible(false);
                        setSelectedScheduleForStart(null);
                        setGeneratedCode('');
                        setCodeExpiresAt('');
                        setSessionId(null);
                        // Refresh active sessions when modal is closed to ensure UI is updated
                        fetchActiveSessions();
                    }
                }}
                footer={null}
                width={600}
                closable={!startingSession}
                maskClosable={!startingSession}
            >
                {selectedScheduleForStart && (
                    <div>
                        {/* Class Information */}
                        <div style={{ marginBottom: 24 }}>
                            <h3 style={{ marginBottom: 16, color: '#1890ff' }}>
                                📚 {selectedScheduleForStart.title}
                            </h3>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <p><strong>Batch:</strong> {selectedScheduleForStart.batch_name}</p>
                                    <p><strong>Date:</strong> {dayjs(selectedScheduleForStart.date).format('MMMM D, YYYY')}</p>
                                </Col>
                                <Col span={12}>
                                    <p><strong>Time:</strong> {selectedScheduleForStart.start_time} - {selectedScheduleForStart.end_time}</p>
                                    <p><strong>Type:</strong> {selectedScheduleForStart.type.toUpperCase()}</p>
                                </Col>
                            </Row>
                        </div>

                        {!generatedCode ? (
                            /* Before Code Generation */
                            <div>
                                <Alert
                                    message="Ready to Start Class"
                                    description="Click the button below to generate an access code and start the class session. The code will be automatically sent to all enrolled students via email."
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />
                                
                                <div style={{ textAlign: 'center' }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlayCircleOutlined />}
                                        onClick={handleGenerateCode}
                                        loading={startingSession}
                                        disabled={startingSession}
                                        style={{
                                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                            border: 'none',
                                            height: '50px',
                                            fontSize: '16px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {startingSession ? 'Starting Session...' : 'Generate Access Code & Start Class'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* After Code Generation */
                            <div>
                                <Alert
                                    message="Class Session Active"
                                    description="Your class session is now active. Students can join using the access code below."
                                    type="success"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                {/* Access Code Display */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    marginBottom: '24px',
                                    color: 'white'
                                }}>
                                    <h3 style={{ color: 'white', marginBottom: '16px' }}>Access Code</h3>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        marginBottom: '16px'
                                    }}>
                                        <span style={{
                                            fontSize: '32px',
                                            fontWeight: 'bold',
                                            letterSpacing: '8px',
                                            fontFamily: 'monospace'
                                        }}>
                                            {generatedCode}
                                        </span>
                                    </div>
                                    <Button
                                        icon={<CopyOutlined />}
                                        onClick={copyCodeToClipboard}
                                        style={{
                                            background: 'rgba(255,255,255,0.2)',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            color: 'white'
                                        }}
                                    >
                                        Copy Code
                                    </Button>
                                </div>

                                {/* Session Info */}
                                <div style={{ marginBottom: 24 }}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <p><strong>Session ID:</strong> {sessionId}</p>
                                        </Col>
                                        <Col span={12}>
                                            <p><strong>Code Expires:</strong> {dayjs(codeExpiresAt).format('HH:mm:ss')}</p>
                                        </Col>
                                    </Row>
                                </div>

                                {/* Join Button */}
                                {selectedScheduleForStart.link && (
                                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<VideoCameraOutlined />}
                                            onClick={() => selectedScheduleForStart.link && window.open(selectedScheduleForStart.link, '_blank')}
                                        >
                                            Join the Session
                                        </Button>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ textAlign: 'center' }}>
                                    <Space size="large">
                                        <Button
                                            type="default"
                                            onClick={() => {
                                                setStartClassModalVisible(false);
                                                // Refresh active sessions when modal is closed to ensure UI is updated
                                                fetchActiveSessions();
                                            }}
                                        >
                                            Keep Running in Background
                                        </Button>
                                        <Button
                                            type="primary"
                                            danger
                                            icon={<StopOutlined />}
                                            onClick={handleEndSession}
                                        >
                                            End Session
                                        </Button>
                                    </Space>
                                </div>

                                <Alert
                                    message="Important Notes"
                                    description={
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            <li>Students have been automatically notified via email</li>
                                            <li>Access code expires in 30 minutes</li>
                                            <li>Students can join up to 10 minutes after class starts</li>
                                            <li>Attendance will be automatically recorded when students enter the code</li>
                                        </ul>
                                    }
                                    type="info"
                                    style={{ marginTop: 16 }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ScheduleManagement;