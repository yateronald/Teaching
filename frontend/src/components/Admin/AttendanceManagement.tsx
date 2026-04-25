import React, { useState, useEffect, useCallback } from 'react';
import {
    Row, Col, Table, Select, DatePicker, Button, Space,
    Typography, Tag, Progress, Empty, message, Input, Badge, Skeleton, AutoComplete
} from 'antd';
import {
    TeamOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined,
    BarChartOutlined, ClockCircleOutlined, SearchOutlined, DownloadOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ============================================================
// Types
// ============================================================
interface OverviewData {
    total_sessions: number;
    total_students: number;
    total_teachers: number;
    total_batches: number;
    overall_attendance_rate: number;
    sessions_with_codes: number;
    sessions_without_codes: number;
    total_present: number;
    total_late: number;
    total_absent: number;
}

interface SessionData {
    session_id: number;
    schedule_title: string;
    batch_name: string;
    teacher_name: string;
    session_date: string;
    start_time: string;
    end_time: string;
    total_students: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    attendance_percentage: number;
    code_generated: boolean;
    session_started: boolean;
    attendance_details?: { student_name: string; email: string; status: string; check_in_time: string }[];
}

interface StudentData {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    batch_id: number;
    batch_name: string;
    total_sessions: number;
    present_count: number;
    attendance_rate: number;
    last_attendance_date: string;
}

interface BatchData {
    id: number;
    name: string;
    teacher_name: string;
    total_students: number;
    total_sessions: number;
    completed_sessions: number;
    avg_attendance_rate: number;
}

interface DropdownItem { id: number; name?: string; first_name?: string; last_name?: string; }

// ============================================================
// Helpers
// ============================================================
function getAttendanceColor(rate: number): string {
    if (rate >= 80) return '#52c41a';
    if (rate >= 50) return '#faad14';
    return '#ff4d4f';
}

// ============================================================
// Component
// ============================================================
const AttendanceManagement: React.FC = () => {
    // Filters
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [batchFilter, setBatchFilter] = useState<number | null>(null);
    const [teacherFilter, setTeacherFilter] = useState<number | null>(null);
    const [searchText, setSearchText] = useState('');
    const [studentFilter, setStudentFilter] = useState<number | null>(null);
    const [autoCompleteOptions, setAutoCompleteOptions] = useState<{value: string, label: string, student_id: number}[]>([]);

    // Data
    const [overview, setOverview] = useState<OverviewData | null>(null);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [students, setStudents] = useState<StudentData[]>([]);
    const [batches, setBatches] = useState<BatchData[]>([]);

    // Dropdowns
    const [batchList, setBatchList] = useState<DropdownItem[]>([]);
    const [teacherList, setTeacherList] = useState<DropdownItem[]>([]);

    // UI
    const [loading, setLoading] = useState(true);
    const [expandedSessionKeys, setExpandedSessionKeys] = useState<number[]>([]);
    const [sessionDetails, setSessionDetails] = useState<Record<number, any[]>>({});

    const { apiCall, user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // Build query params from filters
    const buildParams = useCallback(() => {
        const p = new URLSearchParams();
        if (batchFilter) p.set('batch_id', String(batchFilter));
        if (teacherFilter && isAdmin) p.set('teacher_id', String(teacherFilter));
        if (studentFilter) p.set('student_id', String(studentFilter));
        if (dateRange) {
            p.set('date_from', dateRange[0].format('YYYY-MM-DD'));
            p.set('date_to', dateRange[1].format('YYYY-MM-DD'));
        }
        return p.toString();
    }, [batchFilter, teacherFilter, studentFilter, dateRange, isAdmin]);

    // Fetch all data in parallel
    const fetchAll = useCallback(async () => {
        setLoading(true);
        const q = buildParams();
        try {
            const [ovRes, sessRes, studRes, batchRes] = await Promise.all([
                apiCall(`/attendance/reports/overview?${q}`),
                apiCall(`/attendance/reports/sessions?${q}`),
                apiCall(`/attendance/reports/students?${q}`),
                apiCall(`/attendance/reports/batches?${q}`),
            ]);

            if (ovRes.ok) setOverview(await ovRes.json());
            if (sessRes.ok) {
                const d = await sessRes.json();
                setSessions(Array.isArray(d) ? d : d.sessions || []);
            }
            if (studRes.ok) {
                const d = await studRes.json();
                setStudents(d.students || []);
            }
            if (batchRes.ok) {
                const d = await batchRes.json();
                setBatches(d.batches || []);
            }
        } catch (e) {
            console.error('Attendance fetch error:', e);
            message.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    }, [buildParams]);

    // Fetch dropdown data on mount
    useEffect(() => {
        (async () => {
            try {
                const [bRes, tRes] = await Promise.all([
                    apiCall('/batches'),
                    isAdmin ? apiCall('/users?role=teacher') : Promise.resolve(null),
                ]);
                if (bRes.ok) setBatchList(await bRes.json());
                if (tRes?.ok) setTeacherList(await tRes.json());
            } catch {}
        })();
    }, []);

    // Fetch data on mount and when filters change
    useEffect(() => { fetchAll(); }, [fetchAll]);

    // Date range presets
    const datePresets: { label: string; value: [Dayjs, Dayjs] }[] = [
        { label: 'Today', value: [dayjs(), dayjs()] },
        { label: 'This Week', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
        { label: 'This Month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
        { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
    ];

    // Fetch attendance details for a specific session on expand
    const fetchSessionDetails = async (sessionId: number) => {
        if (sessionDetails[sessionId]) return;
        try {
            const resp = await apiCall(`/attendance/session-details-simple/${sessionId}`);
            if (resp.ok) {
                const data = await resp.json();
                setSessionDetails(prev => ({ ...prev, [sessionId]: data.details || [] }));
            } else {
                setSessionDetails(prev => ({ ...prev, [sessionId]: [] }));
            }
        } catch (e) {
            console.error('Failed to fetch session details:', e);
            setSessionDetails(prev => ({ ...prev, [sessionId]: [] }));
        }
    };

    // CSV Export
    const exportCSV = () => {
        if (!sessions.length) { message.warning('No data to export'); return; }
        const headers = ['Date', 'Batch', 'Teacher', 'Present', 'Late', 'Absent', 'Total', 'Rate %'];
        const rows = sessions.map(s => [
            dayjs(s.session_date).format('YYYY-MM-DD'),
            s.batch_name, s.teacher_name,
            s.present_count, s.late_count, s.absent_count, s.total_students,
            s.attendance_percentage
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `attendance_${dayjs().format('YYYY-MM-DD')}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    // Filtered students by search
    const filteredStudents = students.filter(s => {
        if (!searchText) return true;
        const q = searchText.toLowerCase();
        return `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    });

    const handleStudentSearch = (value: string) => {
        setSearchText(value);
        if (!value) {
            setAutoCompleteOptions([]);
            setStudentFilter(null);
            return;
        }
        const q = value.toLowerCase();
        
        // Find unique matching students by name/email
        const matches = students
            .filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
            .map(s => ({ value: `${s.first_name} ${s.last_name}`, label: `${s.first_name} ${s.last_name} (${s.email})`, student_id: s.id }));
            
        // Deduplicate by value and take top 5
        const unique = Array.from(new Map(matches.map(m => [m.value, m])).values()).slice(0, 5);
        setAutoCompleteOptions(unique);
    };

    const handleStudentSelect = (val: string, option: any) => {
        setSearchText(val);
        setStudentFilter(option.student_id);
    };

    // ============================================================
    // Sessions Table Columns
    // ============================================================
    const sessionColumns: ColumnsType<SessionData> = [
        {
            title: 'Date', dataIndex: 'session_date', key: 'date', width: 110, sorter: (a, b) => dayjs(a.session_date).unix() - dayjs(b.session_date).unix(),
            render: (d: string) => <Text style={{ fontSize: 13 }}>{dayjs(d).format('MMM DD, YYYY')}</Text>,
        },
        { title: 'Batch', dataIndex: 'batch_name', key: 'batch', width: 140, ellipsis: true },
        { title: 'Teacher', dataIndex: 'teacher_name', key: 'teacher', width: 130, ellipsis: true },
        {
            title: 'Time', key: 'time', width: 110,
            render: (_, r) => <Text type="secondary" style={{ fontSize: 12 }}>{r.start_time?.substring(0, 5)} – {r.end_time?.substring(0, 5)}</Text>,
        },
        {
            title: <span style={{ color: '#52c41a' }}>✓ Present</span>, dataIndex: 'present_count', key: 'present', width: 90, align: 'center',
            render: (v: number) => <Text strong style={{ color: '#52c41a' }}>{v}</Text>,
        },
        {
            title: <span style={{ color: '#faad14' }}>⏰ Late</span>, dataIndex: 'late_count', key: 'late', width: 80, align: 'center',
            render: (v: number) => <Text strong style={{ color: v > 0 ? '#faad14' : '#d9d9d9' }}>{v}</Text>,
        },
        {
            title: <span style={{ color: '#ff4d4f' }}>✗ Absent</span>, dataIndex: 'absent_count', key: 'absent', width: 90, align: 'center',
            render: (v: number) => <Text strong style={{ color: v > 0 ? '#ff4d4f' : '#d9d9d9' }}>{v}</Text>,
        },
        { title: 'Total', dataIndex: 'total_students', key: 'total', width: 70, align: 'center' },
        {
            title: 'Rate', dataIndex: 'attendance_percentage', key: 'rate', width: 140,
            sorter: (a, b) => a.attendance_percentage - b.attendance_percentage,
            render: (v: number) => (
                <Space size={6}>
                    <Progress percent={Math.round(v)} size="small" strokeColor={getAttendanceColor(v)} style={{ width: 80 }} showInfo={false} />
                    <Text strong style={{ color: getAttendanceColor(v), fontSize: 13 }}>{Math.round(v)}%</Text>
                </Space>
            ),
        },
        {
            title: 'Status', key: 'status', width: 100,
            render: (_, r) => {
                if (r.session_started) return <Tag color="green">Completed</Tag>;
                if (r.code_generated) return <Tag color="blue">Started</Tag>;
                return <Tag>Scheduled</Tag>;
            },
        },
    ];

    // ============================================================
    // Student Table Columns
    // ============================================================
    const studentColumns: ColumnsType<StudentData> = [
        {
            title: 'Student', key: 'name', width: 180,
            sorter: (a, b) => `${a.first_name}`.localeCompare(`${b.first_name}`),
            render: (_, r) => <Text strong>{r.first_name} {r.last_name}</Text>,
        },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 200, ellipsis: true, render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
        { title: 'Batch', dataIndex: 'batch_name', key: 'batch', width: 140, render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '—' },
        { title: 'Attended', dataIndex: 'present_count', key: 'attended', width: 90, align: 'center', render: (v: number) => <Text strong style={{ color: '#52c41a' }}>{v}</Text> },
        {
            title: 'Missed', key: 'missed', width: 90, align: 'center',
            render: (_, r) => {
                const missed = Math.max(0, r.total_sessions - r.present_count);
                return <Text strong style={{ color: missed > 0 ? '#ff4d4f' : '#d9d9d9' }}>{missed}</Text>;
            },
        },
        {
            title: 'Rate', dataIndex: 'attendance_rate', key: 'rate', width: 140,
            sorter: (a, b) => (a.attendance_rate || 0) - (b.attendance_rate || 0),
            render: (v: number) => (
                <Space size={6}>
                    <Progress percent={Math.round(v || 0)} size="small" strokeColor={getAttendanceColor(v || 0)} style={{ width: 70 }} showInfo={false} />
                    <Text strong style={{ color: getAttendanceColor(v || 0), fontSize: 13 }}>{Math.round(v || 0)}%</Text>
                </Space>
            ),
        },
        {
            title: 'Last Attended', dataIndex: 'last_attendance_date', key: 'last', width: 120,
            render: (d: string) => d ? dayjs(d).format('MMM DD') : <Text type="secondary">Never</Text>,
        },
    ];

    // ============================================================
    // Batch Table Columns
    // ============================================================
    const batchColumns: ColumnsType<BatchData> = [
        { title: 'Batch', dataIndex: 'name', key: 'name', width: 180, sorter: (a, b) => a.name.localeCompare(b.name) },
        { title: 'Teacher', dataIndex: 'teacher_name', key: 'teacher', width: 150 },
        { title: 'Students', dataIndex: 'total_students', key: 'students', width: 90, align: 'center' },
        { title: 'Sessions', dataIndex: 'total_sessions', key: 'sessions', width: 90, align: 'center' },
        { title: 'Completed', dataIndex: 'completed_sessions', key: 'completed', width: 100, align: 'center' },
        {
            title: 'Avg Attendance', dataIndex: 'avg_attendance_rate', key: 'rate', width: 160,
            sorter: (a, b) => (a.avg_attendance_rate || 0) - (b.avg_attendance_rate || 0),
            render: (v: number) => (
                <Space size={6}>
                    <Progress percent={Math.round(v || 0)} size="small" strokeColor={getAttendanceColor(v || 0)} style={{ width: 80 }} showInfo={false} />
                    <Text strong style={{ color: getAttendanceColor(v || 0), fontSize: 13 }}>{Math.round(v || 0)}%</Text>
                </Space>
            ),
        },
    ];

    // ============================================================
    // Chart data
    // ============================================================
    // Chart data — compute from sessions for better insight
    // ============================================================
    const totalAttendanceSlots = sessions.reduce((sum, s) => sum + (s.total_students || 0), 0);
    const totalPresent = sessions.reduce((sum, s) => sum + (s.present_count || 0), 0);
    const totalLate = sessions.reduce((sum, s) => sum + (s.late_count || 0), 0);
    const totalAbsent = sessions.reduce((sum, s) => sum + (s.absent_count || 0), 0);

    // Top 5 best and worst batches for quick insight
    const sortedBatches = [...batches].filter(b => b.total_sessions > 0).sort((a, b) => (b.avg_attendance_rate || 0) - (a.avg_attendance_rate || 0));

    // ============================================================
    // Render
    // ============================================================
    // ============================================================
    // Full-page Skeleton
    // ============================================================
    const SkeletonDashboardBody = () => (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* KPI skeleton */}
            <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Col xs={12} sm={8} md={4} key={i}>
                        <div style={{ borderRadius: 16, padding: '18px 20px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <Skeleton.Avatar active size={44} shape="square" style={{ borderRadius: 12 }} />
                            <div style={{ flex: 1 }}>
                                <Skeleton.Input active style={{ width: '70%', height: 10, borderRadius: 4, marginBottom: 8 }} block />
                                <Skeleton.Input active style={{ width: 40, height: 22, borderRadius: 6 }} />
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Charts skeleton */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa' }}>
                            <Skeleton.Input active style={{ width: 180, height: 16, borderRadius: 4 }} />
                        </div>
                        <div style={{ padding: 20 }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ marginBottom: 16 }}>
                                    <Skeleton.Input active style={{ width: '100%', height: 12, borderRadius: 4, marginBottom: 6 }} block />
                                    <Skeleton.Button active style={{ height: 8, borderRadius: 4 }} block />
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={16}>
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa' }}>
                            <Skeleton.Input active style={{ width: 220, height: 16, borderRadius: 4 }} />
                        </div>
                        <div style={{ padding: 20 }}>
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                    <Skeleton.Input active style={{ width: 20, height: 14, borderRadius: 4 }} />
                                    <Skeleton.Input active style={{ width: 130, height: 14, borderRadius: 4 }} />
                                    <div style={{ flex: 1 }}><Skeleton.Button active style={{ height: 8, borderRadius: 4 }} block /></div>
                                    <Skeleton.Input active style={{ width: 40, height: 14, borderRadius: 4 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Table skeleton */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa' }}>
                    <Skeleton.Input active style={{ width: 120, height: 16, borderRadius: 4 }} />
                </div>
                <div style={{ padding: 20 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton.Input key={i} active style={{ width: '100%', height: 18, borderRadius: 4, marginBottom: 14 }} block />
                    ))}
                </div>
            </div>
        </div>
    );

    const SkeletonDashboard = () => (
        <div>
            {/* Header skeleton */}
            <div style={{ marginBottom: 24 }}>
                <Skeleton.Input active style={{ width: 260, height: 28, borderRadius: 8 }} />
                <div style={{ marginTop: 8 }}>
                    <Skeleton.Input active style={{ width: 340, height: 14, borderRadius: 6 }} />
                </div>
            </div>

            {/* Filter bar skeleton */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[200, 160, 160, 180].map((w, i) => (
                    <Skeleton.Input key={i} active style={{ width: w, height: 32, borderRadius: 8 }} />
                ))}
            </div>

            <SkeletonDashboardBody />
        </div>
    );

    // ============================================================
    // Render
    // ============================================================
    if (loading && !overview) return <SkeletonDashboard />;

    return (
        <div>
            {/* Header + Filters */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
                            Attendance Dashboard
                        </div>
                        <Text style={{ fontSize: 13, color: '#94a3b8' }}>
                            Comprehensive tracking · {overview?.total_sessions ?? 0} sessions · {overview?.total_students ?? 0} students
                        </Text>
                    </div>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}
                            style={{ borderRadius: 10, fontWeight: 600, borderColor: '#e0e7ff', color: '#6366f1' }}>
                            Refresh
                        </Button>
                        <Button icon={<DownloadOutlined />} onClick={exportCSV}
                            style={{ borderRadius: 10, fontWeight: 600, borderColor: '#e0e7ff', color: '#6366f1' }}>
                            Export CSV
                        </Button>
                    </Space>
                </div>

                {/* Filter bar */}
                <div style={{
                    background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
                    padding: '14px 20px',
                }}>
                    <Space wrap size="middle">
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null)}
                            presets={datePresets}
                            style={{ borderRadius: 8 }}
                            allowClear
                        />
                        <Select value={batchFilter} onChange={setBatchFilter} allowClear placeholder="All Batches" style={{ width: 180 }}
                            options={batchList.map(b => ({ value: b.id, label: b.name }))} showSearch optionFilterProp="label" />
                        {isAdmin && (
                            <Select value={teacherFilter} onChange={setTeacherFilter} allowClear placeholder="All Teachers" style={{ width: 180 }}
                                options={teacherList.map(t => ({ value: t.id, label: `${t.first_name} ${t.last_name}` }))} showSearch optionFilterProp="label" />
                        )}
                        <AutoComplete
                            options={autoCompleteOptions}
                            onSearch={handleStudentSearch}
                            onSelect={handleStudentSelect}
                            value={searchText}
                            onChange={(val) => handleStudentSearch(val || '')}
                            style={{ width: 220 }}
                        >
                            <Input placeholder="Search student..." prefix={<SearchOutlined />} style={{ borderRadius: 8 }} allowClear />
                        </AutoComplete>
                    </Space>
                </div>
            </div>

            {loading ? <SkeletonDashboardBody /> : (
                <>
                    {/* KPI Cards */}
                    <Row gutter={[14, 14]} style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Sessions', value: overview?.total_sessions ?? 0, icon: <CalendarOutlined />, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', accent: '#6366f1' },
                    { label: 'Total Students', value: overview?.total_students ?? 0, icon: <TeamOutlined />, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', accent: '#8b5cf6' },
                    { label: 'Avg Attendance', value: `${Math.round(overview?.overall_attendance_rate ?? 0)}%`, icon: <BarChartOutlined />, gradient: `linear-gradient(135deg, ${getAttendanceColor(overview?.overall_attendance_rate ?? 0)}, ${getAttendanceColor(overview?.overall_attendance_rate ?? 0)}cc)`, accent: getAttendanceColor(overview?.overall_attendance_rate ?? 0) },
                    { label: 'Present', value: overview?.total_present ?? 0, icon: <CheckCircleOutlined />, gradient: 'linear-gradient(135deg, #22c55e, #4ade80)', accent: '#22c55e' },
                    { label: 'Late', value: overview?.total_late ?? 0, icon: <ClockCircleOutlined />, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', accent: '#f59e0b' },
                    { label: 'Absent', value: overview?.total_absent ?? 0, icon: <CloseCircleOutlined />, gradient: 'linear-gradient(135deg, #ef4444, #f87171)', accent: '#ef4444' },
                ].map((kpi, i) => (
                    <Col xs={12} sm={8} md={4} key={i}>
                        <div style={{
                            borderRadius: 16, padding: '18px 20px',
                            background: '#fff', border: '1px solid #f0f0f8',
                            boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
                            display: 'flex', alignItems: 'center', gap: 14,
                            transition: 'all 0.2s ease', cursor: 'default',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.06)'; }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: kpi.gradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, color: '#fff', flexShrink: 0,
                                boxShadow: `0 4px 12px ${kpi.accent}40`,
                            }}>
                                {kpi.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{kpi.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{kpi.value}</div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Insights Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* Attendance Breakdown */}
                <Col xs={24} lg={8}>
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', height: '100%', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', fontSize: 14 }}>
                                <BarChartOutlined />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Attendance Breakdown</span>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {totalAttendanceSlots > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                    {[
                                        { label: 'Present', count: totalPresent, color: '#22c55e', icon: <CheckCircleOutlined /> },
                                        { label: 'Late', count: totalLate, color: '#f59e0b', icon: <ClockCircleOutlined /> },
                                        { label: 'Absent', count: totalAbsent, color: '#ef4444', icon: <CloseCircleOutlined /> },
                                    ].map(item => {
                                        const pct = totalAttendanceSlots > 0 ? Math.round(item.count * 100 / totalAttendanceSlots) : 0;
                                        return (
                                            <div key={item.label}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ color: item.color }}>{item.icon}</span> {item.label}
                                                    </span>
                                                    <span style={{ fontSize: 13, fontWeight: 800, color: item.color }}>{item.count} ({pct}%)</span>
                                                </div>
                                                <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${item.color}, ${item.color}cc)`, transition: 'width 0.6s ease' }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Empty description="No attendance data" style={{ padding: 20 }} />
                            )}
                        </div>
                    </div>
                </Col>

                {/* Batch Rankings */}
                <Col xs={24} lg={16}>
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', height: '100%', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                🏆
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Batch Attendance Rankings</span>
                        </div>
                        <div style={{ padding: '16px 20px' }}>
                            {sortedBatches.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {sortedBatches.map((b, i) => {
                                        const rate = Math.round(b.avg_attendance_rate || 0);
                                        const medals = ['🥇', '🥈', '🥉'];
                                        return (
                                            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ width: 24, textAlign: 'center', fontSize: i < 3 ? 16 : 12, color: '#94a3b8', fontWeight: 700 }}>
                                                    {i < 3 ? medals[i] : i + 1}
                                                </span>
                                                <span style={{ width: 160, fontSize: 13, fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {b.name}
                                                </span>
                                                <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
                                                    <div style={{ width: `${rate}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${getAttendanceColor(rate)}, ${getAttendanceColor(rate)}cc)`, transition: 'width 0.6s ease' }} />
                                                </div>
                                                <span style={{ width: 45, textAlign: 'right', fontWeight: 800, color: getAttendanceColor(rate), fontSize: 13 }}>{rate}%</span>
                                                <span style={{ width: 65, textAlign: 'right', fontSize: 11, color: '#94a3b8' }}>{b.total_students} studs</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Empty description="No batch data" style={{ padding: 20 }} />
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Sessions Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', fontSize: 14 }}>
                            <CalendarOutlined />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Sessions</span>
                        <Badge count={sessions.length} style={{ backgroundColor: '#6366f1' }} />
                    </div>
                </div>
                <Table
                    columns={sessionColumns}
                    dataSource={sessions}
                    rowKey="session_id"
                    loading={loading}
                    pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} sessions` }}
                    scroll={{ x: 1100 }}
                    size="small"
                    expandable={{
                        expandedRowKeys: expandedSessionKeys,
                        onExpandedRowsChange: (keys) => setExpandedSessionKeys(keys as number[]),
                        onExpand: (expanded, record) => { if (expanded) fetchSessionDetails(record.session_id); },
                        expandedRowRender: (record) => {
                            const details = sessionDetails[record.session_id];
                            if (details === undefined) return <Text type="secondary" italic>Loading student details...</Text>;
                            if (details.length === 0) return <Text type="secondary">No student attendance records for this session.</Text>;
                            return (
                                <div style={{ padding: '8px 16px' }}>
                                    <Space wrap size={[16, 8]}>
                                        {details.map((d: any, i: number) => (
                                            <Tag key={i} color={d.status === 'present' ? 'green' : d.status === 'late' ? 'orange' : 'red'}
                                                style={{ borderRadius: 8, padding: '3px 12px', fontWeight: 600, border: 'none' }}>
                                                {d.status === 'present' ? '✓' : d.status === 'late' ? '⏰' : '✗'} {d.student_name}
                                            </Tag>
                                        ))}
                                    </Space>
                                </div>
                            );
                        },
                    }}
                    locale={{ emptyText: <Empty description="No sessions found" /> }}
                />
            </div>

            {/* Student Attendance Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontSize: 14 }}>
                        <TeamOutlined />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Student Attendance</span>
                    <Badge count={filteredStudents.length} style={{ backgroundColor: '#8b5cf6' }} />
                </div>
                <Table
                    columns={studentColumns}
                    dataSource={filteredStudents}
                    rowKey={(r) => `${r.id}-${r.batch_id}`}
                    loading={loading}
                    pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} students` }}
                    scroll={{ x: 900 }}
                    size="small"
                    onRow={(record) => ({
                        style: {
                            backgroundColor: (record.attendance_rate || 0) < 50 ? '#fef2f2' :
                                (record.attendance_rate || 0) < 70 ? '#fffbeb' : undefined,
                        },
                    })}
                    locale={{ emptyText: <Empty description="No student data found" /> }}
                />
            </div>

            {/* Batch Summary Table */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', fontSize: 14 }}>
                        <CalendarOutlined />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Batch Summary</span>
                    <Badge count={batches.length} style={{ backgroundColor: '#059669' }} />
                </div>
                <Table
                    columns={batchColumns}
                    dataSource={batches}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 800 }}
                    size="small"
                    locale={{ emptyText: <Empty description="No batch data found" /> }}
                />
            </div>
                </>
            )}
        </div>
    );
};

export default AttendanceManagement;

