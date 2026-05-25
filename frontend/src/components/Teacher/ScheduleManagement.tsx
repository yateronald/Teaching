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
    Popconfirm,
    Row,
    Col,
    Descriptions,
    Alert,
    Tooltip,
    Skeleton,
    Badge,
    Tabs,
    App
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    BookOutlined,
    PlayCircleOutlined,
    StopOutlined,
    CopyOutlined,
    LinkOutlined,
    VideoCameraOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { formatLocal, formatTimeLocal, detectBrowserTimezone } from '../../utils/timezone';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const { Title, Text } = Typography;
const { Option } = Select;

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name?: string;
    /** Original UTC ISO from backend — preferred for displaying in user's tz. */
    start_iso: string;
    end_iso: string;
    /** Browser-local strings used for FullCalendar event objects + form prefill. */
    start_time: string; // HH:mm for UI
    end_time: string;   // HH:mm for UI
    date: string;       // YYYY-MM-DD for UI
    location: string;
    location_mode?: 'online' | 'physical';
    link?: string | null;
    type: 'class' | 'exam' | 'meeting' | 'other' | 'assignment' | 'quiz';
    status: 'scheduled' | 'completed' | 'cancelled';
    /** Server-authoritative status from PG NOW() comparison. */
    schedule_state?: 'cancelled' | 'completed' | 'ended' | 'active' | 'scheduled';
    seconds_until_end?: number;
    seconds_until_start?: number;
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
    schedule_state?: string;
    seconds_until_end?: number | string;
    seconds_until_start?: number | string;
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
    const [searchText, setSearchText] = useState('');
    const [filterBatchId, setFilterBatchId] = useState<number | null>(null);
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
    const [form] = Form.useForm();
    const { apiCall, user } = useAuth();
    const userTz = user?.timezone || detectBrowserTimezone();
    const browserTz = detectBrowserTimezone();

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
                start_iso: item.start_time,
                end_iso: item.end_time,
                start_time: date.format('HH:mm'),
                end_time: end.format('HH:mm'),
                date: date.format('YYYY-MM-DD'),
                location: item.location || '',
                location_mode: item.location_mode || 'physical',
                link: item.link || null,
                type: (item.type as any) || 'class',
                // Normalize backend status casing to keep comparisons consistent
                status: (item.status ? (item.status.toLowerCase() as any) : 'scheduled'),
                schedule_state: (item.schedule_state as any) || undefined,
                seconds_until_end: item.seconds_until_end != null ? Number(item.seconds_until_end) : undefined,
                seconds_until_start: item.seconds_until_start != null ? Number(item.seconds_until_start) : undefined,
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
                const normalized = normalizeFromBackend(data.schedules || data || []);
                // Sort by date and time descending (newest to oldest)
                normalized.sort((a, b) => {
                    const timeA = dayjs(`${a.date}T${a.start_time}`);
                    const timeB = dayjs(`${b.date}T${b.start_time}`);
                    return timeB.valueOf() - timeA.valueOf();
                });
                setSchedules(normalized);
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
        const sStart = schedule.seconds_until_start;
        const sEnd = schedule.seconds_until_end;
        if (typeof sStart === 'number' && typeof sEnd === 'number') {
            return sStart <= 15 * 60 && sEnd > 0 && schedule.type === 'class';
        }
        const now = dayjs();
        const scheduleStart = dayjs(schedule.start_iso);
        const fifteenMinutesBefore = scheduleStart.subtract(15, 'minutes');
        const scheduleEnd = dayjs(schedule.end_iso);
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
            case 'class':      return '#3b82f6';
            case 'exam':       return '#ef4444';
            case 'meeting':    return '#22c55e';
            case 'assignment': return '#f59e0b';
            case 'quiz':       return '#8b5cf6';
            default:           return '#94a3b8';
        }
    };
    const getTypeBg = (type: string) => {
        switch (type) {
            case 'class':      return '#dbeafe';
            case 'exam':       return '#fee2e2';
            case 'meeting':    return '#dcfce7';
            case 'assignment': return '#fef3c7';
            case 'quiz':       return '#ede9fe';
            default:           return '#f1f5f9';
        }
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return '#6366f1';
            case 'completed': return '#22c55e';
            case 'cancelled': return '#ef4444';
            case 'ended':     return '#94a3b8';
            default:          return '#94a3b8';
        }
    };
    const getStatusBg = (status: string) => {
        switch (status) {
            case 'scheduled': return '#eef2ff';
            case 'completed': return '#dcfce7';
            case 'cancelled': return '#fee2e2';
            case 'ended':     return '#f1f5f9';
            default:          return '#f1f5f9';
        }
    };

    // Helper function to check if schedule has ended
    // Prefers server-authoritative `schedule_state` / `seconds_until_end` (computed
    // via PG NOW()) over browser-clock math to avoid clock-skew false positives.
    const isScheduleEnded = (schedule: Schedule) => {
        if (schedule.schedule_state === 'ended' || schedule.schedule_state === 'completed' || schedule.schedule_state === 'cancelled') {
            return true;
        }
        if (typeof schedule.seconds_until_end === 'number') {
            return schedule.seconds_until_end <= 0;
        }
        return dayjs(schedule.end_iso).isBefore(dayjs());
    };

    // Helper function to get effective status (including ended)
    const getEffectiveStatus = (schedule: Schedule) => {
        if (schedule.schedule_state) return schedule.schedule_state;
        if (schedule.status === 'completed' || schedule.status === 'cancelled') {
            return schedule.status;
        }
        return isScheduleEnded(schedule) ? 'ended' : schedule.status;
    };

    const filteredSchedules = React.useMemo(() => {
        return schedules.filter(schedule => {
            const matchesText = schedule.title.toLowerCase().includes(searchText.toLowerCase());
            const matchesBatch = filterBatchId ? schedule.batch_id === filterBatchId : true;
            let matchesDate = true;
            if (dateRangeFilter && dateRangeFilter.length === 2 && schedule.date) {
                const sDate = dayjs(schedule.date);
                if (sDate.isBefore(dateRangeFilter[0], 'day') || sDate.isAfter(dateRangeFilter[1], 'day')) {
                    matchesDate = false;
                }
            }
            return matchesText && matchesBatch && matchesDate;
        });
    }, [schedules, searchText, filterBatchId, dateRangeFilter]);

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
    }, [filteredSchedules]);

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
            title: 'Title', key: 'title',
            render: (_, record) => (
                <div>
                    <Text strong style={{ fontSize: 13, color: '#1a1d2e', display: 'block' }}>{record.title}</Text>
                    {record.description && <Text type="secondary" style={{ fontSize: 11 }}>{record.description}</Text>}
                </div>
            ),
        },
        {
            title: 'Batch', key: 'batch', width: 130,
            render: (_, record) => {
                const name = batches.find(b => b.id === record.batch_id)?.name || record.batch_name || '—';
                return <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 20, padding: '2px 12px', fontSize: 11, fontWeight: 600 }}>{name}</span>;
            },
        },
        {
            title: 'Date & Time', key: 'datetime', width: 220,
            render: (_, record) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                        <CalendarOutlined style={{ color: '#6366f1', fontSize: 11 }} />
                        <Text style={{ fontSize: 12, fontWeight: 600, color: '#1a1d2e' }}>
                            {formatLocal(record.start_iso, userTz, { month: 'short', day: '2-digit', year: 'numeric', hour: undefined, minute: undefined, hour12: undefined })}
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ClockCircleOutlined style={{ color: '#94a3b8', fontSize: 11 }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            {formatTimeLocal(record.start_iso, userTz)} – {formatTimeLocal(record.end_iso, userTz)}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Location', key: 'location', width: 160,
            render: (_, record) => record.location_mode === 'online' ? renderJoinMeetingButton(record) : (
                <Text type="secondary" style={{ fontSize: 12 }}>{record.location || '—'}</Text>
            ),
        },
        {
            title: 'Type', dataIndex: 'type', key: 'type', width: 100, align: 'center' as const,
            render: (type: string) => (
                <span style={{ background: getTypeBg(type), color: getTypeColor(type), borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>
                    {type.toUpperCase()}
                </span>
            ),
        },
        {
            title: 'Status', key: 'status', width: 110, align: 'center' as const,
            render: (_, record: Schedule) => {
                const s = getEffectiveStatus(record);
                return <span style={{ background: getStatusBg(s), color: getStatusColor(s), borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700 }}>{s.toUpperCase()}</span>;
            },
        },
        {
            title: 'Actions', key: 'actions', width: 220,
            render: (_, record) => (
                <Space size={4}>
                    {record.type === 'class' && (
                        <Tooltip title={
                            isScheduleEnded(record) ? 'Meeting has ended'
                                : activeSessions.has(record.id) ? 'Join the class session'
                                : canStartClass(record) ? 'Start class session'
                                : 'Available 15 min before start'
                        }>
                            <Button
                                size="small"
                                icon={activeSessions.has(Number(record.id)) ? <LinkOutlined /> : <PlayCircleOutlined />}
                                onClick={() => {
                                    if (isScheduleEnded(record)) return;
                                    if (activeSessions.has(Number(record.id))) {
                                        if (record.link) window.open(record.link, '_blank', 'noopener,noreferrer');
                                    } else { handleStartClass(record); }
                                }}
                                disabled={isScheduleEnded(record) || (!canStartClass(record) && !activeSessions.has(Number(record.id)))}
                                style={{
                                    borderRadius: 8, fontSize: 11, height: 28, fontWeight: 600,
                                    background: isScheduleEnded(record) ? '#f1f5f9'
                                        : activeSessions.has(Number(record.id)) ? '#eef2ff'
                                        : canStartClass(record) ? '#dcfce7' : undefined,
                                    color: isScheduleEnded(record) ? '#94a3b8'
                                        : activeSessions.has(Number(record.id)) ? '#6366f1'
                                        : canStartClass(record) ? '#16a34a' : undefined,
                                    borderColor: isScheduleEnded(record) ? '#e2e8f0'
                                        : activeSessions.has(Number(record.id)) ? '#c7d2fe'
                                        : canStartClass(record) ? '#86efac' : undefined,
                                }}
                            >
                                {isScheduleEnded(record) ? 'Ended' : activeSessions.has(record.id) ? 'Join' : 'Start'}
                            </Button>
                        </Tooltip>
                    )}
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}
                        style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', height: 28 }} />
                    <Popconfirm title="Delete this schedule?" onConfirm={() => handleDelete(record.id)} okText="Delete" okType="danger">
                        <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8, height: 28 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Check if teacher can join meeting (only after generating access code)
    const canTeacherJoinMeeting = (schedule: Schedule): boolean => {
        // Must have an active access code session AND be inside the schedule window.
        if (!activeSessions.has(schedule.id)) return false;
        const sStart = schedule.seconds_until_start;
        const sEnd = schedule.seconds_until_end;
        if (typeof sStart === 'number' && typeof sEnd === 'number') {
            return sStart <= 5 * 60 && sEnd > 0;
        }
        const now = dayjs();
        const scheduleStart = dayjs(schedule.start_iso);
        const scheduleEnd = dayjs(schedule.end_iso);
        return now.isAfter(scheduleStart.subtract(5, 'minutes')) && now.isBefore(scheduleEnd);
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

    const todaySchedules = filteredSchedules.filter(schedule => 
        schedule.date === dayjs().format('YYYY-MM-DD')
    );
    const upcomingSchedules = filteredSchedules.filter(schedule => 
        dayjs(schedule.date).isAfter(dayjs(), 'day')
    );
    const completedSchedules = filteredSchedules.filter(schedule => 
        ['ended', 'completed'].includes(getEffectiveStatus(schedule))
    );

    // ── KPI Card (module-scoped style matching other pages) ──
    const KpiCard = ({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) => (
        <div style={{ borderRadius: 16, padding: '20px 24px', background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: accent, flexShrink: 0 }}>{icon}</div>
            <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1d2e', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );

    // ── Skeleton loader ──
    if (loading) return (
        <div style={{ paddingBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div><Skeleton.Input active style={{ width: 240, height: 28, borderRadius: 8 }} /><div style={{ marginTop: 6 }}><Skeleton.Input active style={{ width: 160, height: 14, borderRadius: 6 }} /></div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Skeleton.Button active style={{ width: 110, height: 38, borderRadius: 10 }} />
                    <Skeleton.Button active style={{ width: 120, height: 38, borderRadius: 10 }} />
                    <Skeleton.Button active style={{ width: 130, height: 44, borderRadius: 12 }} />
                </div>
            </div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {[1,2,3,4].map(i => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <div style={{ borderRadius: 16, padding: '20px 24px', background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Skeleton.Avatar active size={44} shape="square" style={{ borderRadius: 12 }} />
                            <div style={{ flex: 1 }}><Skeleton.Input active style={{ width: 80, height: 11, borderRadius: 4, marginBottom: 8 }} block /><Skeleton.Input active style={{ width: 40, height: 26, borderRadius: 6 }} /></div>
                        </div>
                    </Col>
                ))}
            </Row>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', gap: 20 }}>
                    {['All','Today','Upcoming'].map((_t,i) => <Skeleton.Input key={i} active style={{ width: 100, height: 16, borderRadius: 6 }} />)}
                </div>
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 20px', borderBottom: '1px solid #f8f8fc' }}>
                        <div style={{ flex: 3 }}><Skeleton.Input active style={{ width: '60%', height: 13, borderRadius: 5, marginBottom: 5 }} block /><Skeleton.Input active style={{ width: '35%', height: 11, borderRadius: 5 }} block /></div>
                        <Skeleton.Input active style={{ width: 70, height: 22, borderRadius: 20 }} />
                        <div><Skeleton.Input active style={{ width: 90, height: 13, borderRadius: 5, marginBottom: 4 }} block /><Skeleton.Input active style={{ width: 70, height: 11, borderRadius: 5 }} block /></div>
                        <Skeleton.Input active style={{ width: 100, height: 28, borderRadius: 8 }} />
                        <Skeleton.Input active style={{ width: 60, height: 22, borderRadius: 20 }} />
                        <Skeleton.Input active style={{ width: 70, height: 22, borderRadius: 20 }} />
                        <div style={{ display: 'flex', gap: 5 }}><Skeleton.Button active size="small" style={{ width: 55, height: 28, borderRadius: 8 }} /><Skeleton.Button active size="small" style={{ width: 30, height: 28, borderRadius: 8 }} /><Skeleton.Button active size="small" style={{ width: 30, height: 28, borderRadius: 8 }} /></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexShrink: 0 }}>
                <div>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1d2e', fontSize: 22 }}>Schedule Management</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''} · {todaySchedules.length} today · {upcomingSchedules.length} upcoming
                    </Text>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#eef2ff', border: '1px solid #e0e7ff' }}>
                        <ClockCircleOutlined style={{ color: '#6366f1', fontSize: 11 }} />
                        Times shown in your timezone: <strong style={{ color: '#4338ca' }}>{userTz}</strong>
                    </div>
                </div>
                <Space size={8}>
                    <Button
                        onClick={() => setViewMode('table')}
                        style={{ borderRadius: 10, height: 38, fontWeight: 600, borderColor: viewMode === 'table' ? '#6366f1' : '#e0e7ff', color: viewMode === 'table' ? '#6366f1' : '#64748b', background: viewMode === 'table' ? '#eef2ff' : '#fff' }}
                    >Table View</Button>
                    <Button
                        onClick={() => setViewMode('calendar')}
                        style={{ borderRadius: 10, height: 38, fontWeight: 600, borderColor: viewMode === 'calendar' ? '#6366f1' : '#e0e7ff', color: viewMode === 'calendar' ? '#6366f1' : '#64748b', background: viewMode === 'calendar' ? '#eef2ff' : '#fff' }}
                    >Calendar View</Button>
                    <Button
                        type="primary" icon={<PlusOutlined />} size="large" onClick={handleAdd}
                        style={{ borderRadius: 12, height: 44, fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: 'none', boxShadow: '0 4px 16px rgba(99,102,241,0.30)', paddingInline: 20 }}
                    >Add Schedule</Button>
                </Space>
            </div>

            {/* ── KPI Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20, flexShrink: 0 }}>
                <Col xs={24} sm={12} md={6}><KpiCard label="Today's Classes" value={todaySchedules.length} icon={<BookOutlined />} accent="#6366f1" /></Col>
                <Col xs={24} sm={12} md={6}><KpiCard label="Upcoming" value={upcomingSchedules.length} icon={<ClockCircleOutlined />} accent="#0ea5e9" /></Col>
                <Col xs={24} sm={12} md={6}><KpiCard label="Completed" value={completedSchedules.length} icon={<CheckCircleOutlined />} accent="#22c55e" /></Col>
                <Col xs={24} sm={12} md={6}><KpiCard label="Total Schedules" value={filteredSchedules.length} icon={<CalendarOutlined />} accent="#f59e0b" /></Col>
            </Row>

            {/* ── Filters ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexShrink: 0 }}>
                <Input.Search
                    placeholder="Search schedules by title..."
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                />
                <DatePicker.RangePicker
                    onChange={setDateRangeFilter}
                    style={{ width: 250 }}
                    allowClear
                />
                <Select
                    placeholder="Filter by Batch"
                    allowClear
                    onChange={(val) => setFilterBatchId(val)}
                    style={{ width: 250 }}
                    options={batches.map(b => ({ label: b.name, value: b.id }))}
                />
            </div>

            {viewMode === 'table' ? (
                /* ── Table card: fills remaining, rows scroll ── */
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                    <Tabs
                        defaultActiveKey="all"
                        style={{ padding: '0 20px' }}
                        tabBarStyle={{ marginBottom: 0, borderBottom: '1px solid #f0f0f8' }}
                        items={[
                            {
                                key: 'all',
                                label: <span><CalendarOutlined style={{ marginRight: 6, color: '#6366f1' }} />All <Badge count={filteredSchedules.length} style={{ backgroundColor: '#6366f1', marginLeft: 4 }} /></span>,
                                children: (
                                    <Table columns={columns} dataSource={filteredSchedules} rowKey="id"
                                        size="small" scroll={{ y: 'calc(100vh - 370px)', x: 900 }}
                                        pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} schedules`, style: { padding: '10px 20px', borderTop: '1px solid #f0f0f8', margin: 0 } }}
                                        rowClassName={() => 'sched-table-row'}
                                        locale={{ emptyText: <div style={{ padding: '48px 0', textAlign: 'center' }}><CalendarOutlined style={{ fontSize: 40, color: '#c7d2fe', display: 'block', marginBottom: 10 }} /><Text type="secondary">No schedules yet</Text></div> }}
                                    />
                                ),
                            },
                            {
                                key: 'today',
                                label: <span><ClockCircleOutlined style={{ marginRight: 6, color: '#0ea5e9' }} />Today <Badge count={todaySchedules.length} style={{ backgroundColor: '#0ea5e9', marginLeft: 4 }} /></span>,
                                children: (
                                    <Table columns={columns} dataSource={todaySchedules} rowKey="id"
                                        size="small" scroll={{ y: 'calc(100vh - 370px)', x: 900 }}
                                        pagination={false}
                                        rowClassName={() => 'sched-table-row'}
                                        locale={{ emptyText: <div style={{ padding: '40px 0', textAlign: 'center' }}><Text type="secondary">No classes today</Text></div> }}
                                    />
                                ),
                            },
                            {
                                key: 'upcoming',
                                label: <span><BookOutlined style={{ marginRight: 6, color: '#22c55e' }} />Upcoming <Badge count={upcomingSchedules.length} style={{ backgroundColor: '#22c55e', marginLeft: 4 }} /></span>,
                                children: (
                                    <Table columns={columns} dataSource={upcomingSchedules} rowKey="id"
                                        size="small" scroll={{ y: 'calc(100vh - 370px)', x: 900 }}
                                        pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} schedules`, style: { padding: '10px 20px', borderTop: '1px solid #f0f0f8', margin: 0 } }}
                                        rowClassName={() => 'sched-table-row'}
                                        locale={{ emptyText: <div style={{ padding: '40px 0', textAlign: 'center' }}><Text type="secondary">No upcoming schedules</Text></div> }}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.07)', flex: 1, padding: 20, overflow: 'auto' }}>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                        height="auto"
                        timeZone="local"
                        displayEventEnd={true}
                        selectable
                        selectAllow={(arg: any) => {
                            const start = dayjs(arg.start);
                            const type = arg?.view?.type;
                            if (type === 'dayGridMonth') return start.isSame(dayjs(), 'day') || start.isAfter(dayjs(), 'day');
                            return start.isAfter(dayjs().subtract(1, 'minute'));
                        }}
                        selectMirror select={handleSelect}
                        editable eventDrop={handleEventDrop} eventResize={handleEventResize}
                        eventClick={handleEventClick} events={events}
                        nowIndicator slotMinTime="00:00:00" slotMaxTime="24:00:00" allDaySlot={false}
                        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                    />
                </div>
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

                    <div style={{ background: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: 10, padding: '8px 14px', marginBottom: 16, fontSize: 12, color: '#4338ca', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockCircleOutlined />
                        <span>Times below are in your <strong>browser's timezone</strong>: <strong>{browserTz}</strong>. They are stored in UTC and displayed to each student in their own timezone.</span>
                    </div>

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
                title={viewSchedule ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: viewSchedule ? getTypeBg(viewSchedule.type) : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: viewSchedule ? getTypeColor(viewSchedule.type) : '#6366f1', fontSize: 16 }}>
                            <CalendarOutlined />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#1a1d2e', fontSize: 15 }}>{viewSchedule.title}</div>
                            <span style={{ background: getStatusBg(getEffectiveStatus(viewSchedule)), color: getStatusColor(getEffectiveStatus(viewSchedule)), borderRadius: 20, padding: '1px 10px', fontSize: 11, fontWeight: 600 }}>
                                {getEffectiveStatus(viewSchedule).toUpperCase()}
                            </span>
                        </div>
                    </div>
                ) : 'Schedule Details'}
                onCancel={() => { setViewModalVisible(false); setViewSchedule(null); }}
                footer={null} width={640}
            >
                {viewSchedule && (
                    <>
                        <Descriptions bordered column={1} size="small" style={{ borderRadius: 10, overflow: 'hidden' }}>
                            <Descriptions.Item label="Batch">
                                <span style={{ background: '#eef2ff', color: '#4f46e5', borderRadius: 20, padding: '2px 12px', fontSize: 12, fontWeight: 600 }}>
                                    {batches.find(b => b.id === viewSchedule.batch_id)?.name || viewSchedule.batch_name || '—'}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Date"><Text strong>{formatLocal(viewSchedule.start_iso, userTz, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: undefined, minute: undefined, hour12: undefined })}</Text></Descriptions.Item>
                            <Descriptions.Item label="Time"><Text strong>{formatTimeLocal(viewSchedule.start_iso, userTz)} – {formatTimeLocal(viewSchedule.end_iso, userTz)}</Text></Descriptions.Item>
                            <Descriptions.Item label="Type">
                                <span style={{ background: getTypeBg(viewSchedule.type), color: getTypeColor(viewSchedule.type), borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{viewSchedule.type.toUpperCase()}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mode">{viewSchedule.location_mode === 'online' ? 'Online' : 'Physical'}</Descriptions.Item>
                            <Descriptions.Item label={viewSchedule.location_mode === 'online' ? 'Link' : 'Location'}>
                                {viewSchedule.location_mode === 'online' ? (
                                    viewSchedule.link ? (
                                        <Button size="small" icon={<LinkOutlined />} disabled={isScheduleEnded(viewSchedule)}
                                            onClick={() => window.open(viewSchedule.link!, '_blank')}
                                            style={{ borderRadius: 8, borderColor: '#c7d2fe', color: '#6366f1' }}
                                        >
                                            {isScheduleEnded(viewSchedule) ? 'Meeting Ended' : 'Join Meeting'}
                                        </Button>
                                    ) : '—'
                                ) : (viewSchedule.location || '—')}
                            </Descriptions.Item>
                            {viewSchedule.description && <Descriptions.Item label="Description">{viewSchedule.description}</Descriptions.Item>}
                        </Descriptions>
                        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Popconfirm title="Delete this schedule?" onConfirm={() => viewSchedule && handleDelete(viewSchedule.id)} okText="Delete" okType="danger">
                                <Button danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }}>Delete</Button>
                            </Popconfirm>
                            <Button type="primary" icon={<EditOutlined />} style={{ borderRadius: 8, background: '#6366f1', borderColor: '#6366f1' }}
                                onClick={() => { if (viewSchedule) { setViewModalVisible(false); handleEdit(viewSchedule); } }}
                            >Edit</Button>
                        </div>
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
            <style>{`
                .sched-table-row:hover td { background: #f8f7ff !important; }
                .ant-table-thead > tr > th {
                    background: #fafafa !important;
                    font-weight: 700 !important;
                    color: #4b5563 !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                .ant-table-cell { border-bottom: 1px solid #f5f5fc !important; }
            `}</style>
        </div>
    );
};

export default ScheduleManagement;