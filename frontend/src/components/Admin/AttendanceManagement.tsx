import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Row, Col, Statistic, Table, Select, DatePicker, Button, Space,
    Typography, Tag, Progress, Empty, message, Input, Badge, Skeleton
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

const { Title, Text } = Typography;
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
        if (dateRange) {
            p.set('date_from', dateRange[0].format('YYYY-MM-DD'));
            p.set('date_to', dateRange[1].format('YYYY-MM-DD'));
        }
        return p.toString();
    }, [batchFilter, teacherFilter, dateRange, isAdmin]);

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
    return (
        <div>
            {/* Header + Filters */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>📊 Attendance Dashboard</Title>
                        <Text type="secondary">Comprehensive attendance tracking and analytics</Text>
                    </div>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchAll} loading={loading}>Refresh</Button>
                        <Button icon={<DownloadOutlined />} onClick={exportCSV}>Export CSV</Button>
                    </Space>
                </div>
                <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
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
                        <Input placeholder="Search student..." prefix={<SearchOutlined />} allowClear
                            value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 200, borderRadius: 8 }} />
                    </Space>
                </Card>
            </div>

            {/* Stats Row */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {(loading ? Array(6).fill(null) : [
                    { label: 'Total Sessions', value: overview?.total_sessions ?? 0, icon: <CalendarOutlined />, color: '#1a56db' },
                    { label: 'Total Students', value: overview?.total_students ?? 0, icon: <TeamOutlined />, color: '#7c3aed' },
                    { label: 'Avg Attendance', value: `${Math.round(overview?.overall_attendance_rate ?? 0)}%`, icon: <BarChartOutlined />, color: getAttendanceColor(overview?.overall_attendance_rate ?? 0) },
                    { label: 'Present', value: overview?.total_present ?? 0, icon: <CheckCircleOutlined />, color: '#52c41a' },
                    { label: 'Late', value: overview?.total_late ?? 0, icon: <ClockCircleOutlined />, color: '#faad14' },
                    { label: 'Absent', value: overview?.total_absent ?? 0, icon: <CloseCircleOutlined />, color: '#ff4d4f' },
                ]).map((s, i) => (
                    <Col xs={12} sm={8} md={4} key={i}>
                        <Card size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                            {loading ? <Skeleton active paragraph={false} /> : (
                                <Statistic title={s!.label} value={s!.value} prefix={<span style={{ color: s!.color }}>{s!.icon}</span>}
                                    valueStyle={{ fontSize: 24, fontWeight: 700, color: s!.color }} />
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Insights Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {/* Attendance Breakdown */}
                <Col xs={24} lg={8}>
                    <Card title="📊 Attendance Breakdown" size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', height: '100%' }}>
                        {totalAttendanceSlots > 0 ? (
                            <div>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text><CheckCircleOutlined style={{ color: '#52c41a' }} /> Present</Text>
                                        <Text strong style={{ color: '#52c41a' }}>{totalPresent} ({totalAttendanceSlots > 0 ? Math.round(totalPresent * 100 / totalAttendanceSlots) : 0}%)</Text>
                                    </div>
                                    <Progress percent={totalAttendanceSlots > 0 ? Math.round(totalPresent * 100 / totalAttendanceSlots) : 0} strokeColor="#52c41a" showInfo={false} />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text><ClockCircleOutlined style={{ color: '#faad14' }} /> Late</Text>
                                        <Text strong style={{ color: '#faad14' }}>{totalLate} ({totalAttendanceSlots > 0 ? Math.round(totalLate * 100 / totalAttendanceSlots) : 0}%)</Text>
                                    </div>
                                    <Progress percent={totalAttendanceSlots > 0 ? Math.round(totalLate * 100 / totalAttendanceSlots) : 0} strokeColor="#faad14" showInfo={false} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text><CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Absent</Text>
                                        <Text strong style={{ color: '#ff4d4f' }}>{totalAbsent} ({totalAttendanceSlots > 0 ? Math.round(totalAbsent * 100 / totalAttendanceSlots) : 0}%)</Text>
                                    </div>
                                    <Progress percent={totalAttendanceSlots > 0 ? Math.round(totalAbsent * 100 / totalAttendanceSlots) : 0} strokeColor="#ff4d4f" showInfo={false} />
                                </div>
                            </div>
                        ) : (
                            <Empty description="No attendance data" style={{ padding: 20 }} />
                        )}
                    </Card>
                </Col>

                {/* Batch Rankings */}
                <Col xs={24} lg={16}>
                    <Card title="🏆 Batch Attendance Rankings" size="small" style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', height: '100%' }}>
                        {sortedBatches.length > 0 ? (
                            <div>
                                {sortedBatches.map((b, i) => {
                                    const rate = Math.round(b.avg_attendance_rate || 0);
                                    return (
                                        <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < sortedBatches.length - 1 ? 12 : 0 }}>
                                            <Text style={{ width: 20, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>{i + 1}</Text>
                                            <Text strong style={{ width: 160, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</Text>
                                            <div style={{ flex: 1 }}>
                                                <Progress percent={rate} strokeColor={getAttendanceColor(rate)} size="small" showInfo={false} />
                                            </div>
                                            <Text strong style={{ width: 45, textAlign: 'right', color: getAttendanceColor(rate), fontSize: 13 }}>{rate}%</Text>
                                            <Text type="secondary" style={{ width: 60, textAlign: 'right', fontSize: 11 }}>{b.total_students} students</Text>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Empty description="No batch data" style={{ padding: 20 }} />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Sessions Table */}
            <Card
                title={<Space><span>📅 Sessions</span><Badge count={sessions.length} style={{ backgroundColor: '#1a56db' }} /></Space>}
                size="small"
                style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
            >
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
                                                style={{ borderRadius: 6, padding: '2px 10px' }}>
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
            </Card>

            {/* Student Attendance Table */}
            <Card
                title={<Space><span>👥 Student Attendance</span><Badge count={filteredStudents.length} style={{ backgroundColor: '#7c3aed' }} /></Space>}
                size="small"
                style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: 20 }}
            >
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
                            backgroundColor: (record.attendance_rate || 0) < 50 ? '#fff1f0' :
                                (record.attendance_rate || 0) < 70 ? '#fffbe6' : undefined,
                        },
                    })}
                    locale={{ emptyText: <Empty description="No student data found" /> }}
                />
            </Card>

            {/* Batch Summary Table */}
            <Card
                title={<Space><span>📚 Batch Summary</span><Badge count={batches.length} style={{ backgroundColor: '#059669' }} /></Space>}
                size="small"
                style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
            >
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
            </Card>
        </div>
    );
};

export default AttendanceManagement;
