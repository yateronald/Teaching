import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Select,
    DatePicker,
    Button,
    Space,
    Typography,
    Tag,
    Tabs,
    Progress,
    Modal,
    Descriptions,
    Spin,
    Badge,
    Empty,
    message,
    Divider
} from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined,
    ClockCircleOutlined,
    BookOutlined,
    DownOutlined,
    UpOutlined,
    PieChartOutlined,
    KeyOutlined,
    DashboardOutlined,
    TrophyOutlined,
    StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import AttendanceExport from './AttendanceExport';
// Register Chart.js components
// ChartJS.register(
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     ChartTitle,
//     ChartTooltip,
//     Legend,
//     ArcElement,
//     PointElement,
//     LineElement
// );

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
// Removed deprecated TabPane extraction
// const { TabPane } = Tabs;

interface AttendanceOverview {
    total_sessions: number;
    total_students: number;
    total_teachers: number;
    total_batches: number;
    overall_attendance_rate: number;
    sessions_with_codes: number;
    sessions_without_codes: number;
    total_present?: number;
    total_late?: number;
    total_absent?: number;
}

interface BatchAttendance {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    teacher_name: string;
    total_students: number;
    total_sessions: number;
    completed_sessions: number;
    avg_attendance_rate: number;
}



interface TeacherPerformance {
    teacher_id: number;
    teacher_name: string;
    teacher_email: string;
    batch_name: string;
    total_sessions: number;
    sessions_with_codes: number;
    sessions_started: number;
    attendance_percentage: number;
    code_generation_percentage: number;
    avg_attendance_rate?: number;
    total_students?: number;
}

interface BatchPerformance {
    batch_id: number;
    batch_name: string;
    batch_description: string;
    teacher_name: string;
    teacher_email: string;
    total_sessions: number;
    conducted_sessions: number;
    code_generation_rate: number;
    session_start_rate: number;
    total_students: number;
    avg_attendance_rate: number;
}

interface BatchSessionDetail {
    schedule_id: number;
    subject: string;
    topic: string;
    description: string;
    start_time: string;
    end_time: string;
    session_id: number;
    session_status: string;
    access_code: string;
    code_expires_at: string;
    actual_start_time: string;
    actual_end_time: string;
    duration_minutes: number;
    total_students: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    attendance_percentage: number;
}



interface SessionStudent {
    schedule_id: number;
    schedule_title: string;
    batch_name: string;
    french_level: string;
    attendance_status: 'present' | 'absent' | 'late' | null;
    schedule_start_time: string;
    check_in_time: string | null;
    student_id: number;
    student_name: string;
    batch_id: number;
    teacher_name: string;
}

interface BatchSession {
    schedule_id: number;
    title: string;
    start_time: string;
    end_time: string;
    session_status: 'upcoming' | 'ongoing' | 'completed';
    total_students: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    attendance_rate: number;
}

const AttendanceManagement: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState<AttendanceOverview | null>(null);
    const [batchAttendance, setBatchAttendance] = useState<BatchAttendance[]>([]);
    const [teacherPerformance, setTeacherPerformance] = useState<TeacherPerformance[]>([]);
    const [batchPerformance, setBatchPerformance] = useState<BatchPerformance[]>([]);
    const [sessionStudentData, setSessionStudentData] = useState<SessionStudent[]>([]);
    
    // Filters
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    
    // Session Student specific filters
    const [selectedStudentForSession, setSelectedStudentForSession] = useState<number | null>(null);
    const [selectedBatchForSession, setSelectedBatchForSession] = useState<number | null>(null);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    
    // Modal states
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedSession] = useState<any>(null);

    
    // Data for dropdowns
    const [batches, setBatches] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    
    // Expandable rows state
    const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
    const [batchSessions, setBatchSessions] = useState<{[key: number]: any[]}>({});
    const [loadingBatchSessions, setLoadingBatchSessions] = useState<{[key: number]: boolean}>({});
    
    // Batch performance expandable rows state
    const [expandedBatchKeys, setExpandedBatchKeys] = useState<number[]>([]);
    const [batchSessionDetails, setBatchSessionDetails] = useState<{[key: number]: BatchSessionDetail[]}>({});
    const [loadingBatchSessionDetails, setLoadingBatchSessionDetails] = useState<{[key: number]: boolean}>({});
    
    // Session Code Analytics modal state
    const [sessionsWithCodesModalVisible, setSessionsWithCodesModalVisible] = useState(false);
    const [sessionsWithoutCodesModalVisible, setSessionsWithoutCodesModalVisible] = useState(false);
    const [sessionsWithCodesData, setSessionsWithCodesData] = useState<any[]>([]);
    const [sessionsWithoutCodesData, setSessionsWithoutCodesData] = useState<any[]>([]);
    const [loadingSessionsData, setLoadingSessionsData] = useState(false);
    
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchAllData();
        fetchBatches();
        fetchTeachers();
        fetchAllStudents();
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [selectedBatch, selectedTeacher, dateRange]);

    // Effect for Session Student data
    useEffect(() => {
        fetchSessionStudentData();
    }, [selectedStudentForSession, selectedBatchForSession, dateRange]);

    // Effect to filter students based on batch selection
    useEffect(() => {
        if (!selectedBatchForSession) {
            // Show all students when no batch is selected
            setFilteredStudents(allStudents);
        } else {
            // Filter students by selected batch
            const studentsInBatch = allStudents.filter(student => 
                student.batches && student.batches.some((batch: any) => batch.id === selectedBatchForSession)
            );
            setFilteredStudents(studentsInBatch);
        }
    }, [selectedBatchForSession, allStudents]);

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        } else {
            setDateRange(null);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchOverview(),
                fetchBatchAttendance(),
                fetchStudentAttendance(),
                fetchTeacherPerformance(),
                fetchBatchPerformance(),
                fetchSessionDetails()
            ]);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            message.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const fetchOverview = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/overview?${params}`);
            if (response.ok) {
                const data = await response.json();
                setOverview(data);
            }
        } catch (error) {
            console.error('Error fetching overview:', error);
        }
    };

    const fetchBatchAttendance = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/batches?${params}`);
            if (response.ok) {
                const data = await response.json();
                setBatchAttendance(data.batches || []);
            }
        } catch (error) {
            console.error('Error fetching batch attendance:', error);
            setBatchAttendance([]);
        }
    };

    const fetchStudentAttendance = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/students?${params}`);
            if (response.ok) {
                await response.json();
                // Student attendance data processed but not stored in state
            }
        } catch (error) {
            console.error('Error fetching student attendance:', error);
        }
    };

    const fetchTeacherPerformance = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/teachers?${params}`);
            if (response.ok) {
                const data = await response.json();
                setTeacherPerformance(data.teachers || []);
            }
        } catch (error) {
            console.error('Error fetching teacher performance:', error);
            setTeacherPerformance([]);
        }
    };

    const fetchBatchPerformance = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (dateRange) {
                params.append('start_date', dateRange[0].format('YYYY-MM-DD'));
                params.append('end_date', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/batch-performance?${params}`);
            if (response.ok) {
                const data = await response.json();
                setBatchPerformance(data.batches || []);
            }
        } catch (error) {
            console.error('Error fetching batch performance:', error);
            setBatchPerformance([]);
        }
    };

    const fetchBatchSessionDetails = async (batchId: number) => {
        try {
            setLoadingBatchSessionDetails(prev => ({ ...prev, [batchId]: true }));
            
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('start_date', dateRange[0].format('YYYY-MM-DD'));
                params.append('end_date', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/batch-sessions/${batchId}?${params}`);
            if (response.ok) {
                const data = await response.json();
                setBatchSessionDetails(prev => ({ ...prev, [batchId]: data.sessions || [] }));
            }
        } catch (error) {
            console.error('Error fetching batch session details:', error);
            setBatchSessionDetails(prev => ({ ...prev, [batchId]: [] }));
        } finally {
            setLoadingBatchSessionDetails(prev => ({ ...prev, [batchId]: false }));
        }
    };

    const fetchSessionDetails = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/sessions?${params}`);
            if (response.ok) {
                await response.json();
                // Session details data processed but not stored in state
            }
        } catch (error) {
            console.error('Error fetching session details:', error);
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(data);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await apiCall('/users?role=teacher');
            if (response.ok) {
                const data = await response.json();
                setTeachers(data);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchAllStudents = async () => {
        try {
            const response = await apiCall('/users?role=student');
            if (response.ok) {
                const data = await response.json();
                setAllStudents(data);
                setFilteredStudents(data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchSessionStudentData = async () => {
        try {
            if (!selectedStudentForSession) {
                setSessionStudentData([]);
                return;
            }

            const params = new URLSearchParams();
            params.append('student_id', selectedStudentForSession.toString());
            if (selectedBatchForSession) params.append('batch_id', selectedBatchForSession.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/session-student?${params}`);
            if (response.ok) {
                const data = await response.json();
                setSessionStudentData(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching session student data:', error);
            setSessionStudentData([]);
        }
    };

    const fetchBatchSessions = async (batchId: number) => {
        if (batchSessions[batchId]) {
            return; // Already fetched
        }

        setLoadingBatchSessions(prev => ({ ...prev, [batchId]: true }));
        
        try {
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/batch-sessions/${batchId}?${params}`);
            if (response.ok) {
                const data = await response.json();
                setBatchSessions(prev => ({ ...prev, [batchId]: data.data || [] }));
            }
        } catch (error) {
            console.error('Error fetching batch sessions:', error);
            message.error('Failed to load batch sessions');
        } finally {
            setLoadingBatchSessions(prev => ({ ...prev, [batchId]: false }));
        }
    };

    // Fetch sessions with access codes
    const fetchSessionsWithCodes = async () => {
        setLoadingSessionsData(true);
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/sessions-with-codes?${params}`);
            if (response.ok) {
                const data = await response.json();
                setSessionsWithCodesData(data.sessions || []);
            }
        } catch (error) {
            console.error('Error fetching sessions with codes:', error);
            message.error('Failed to load sessions with codes');
        } finally {
            setLoadingSessionsData(false);
        }
    };

    // Fetch sessions without access codes
    const fetchSessionsWithoutCodes = async () => {
        setLoadingSessionsData(true);
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const response = await apiCall(`/attendance/reports/sessions-without-codes?${params}`);
            if (response.ok) {
                const data = await response.json();
                setSessionsWithoutCodesData(data.sessions || []);
            }
        } catch (error) {
            console.error('Error fetching sessions without codes:', error);
            message.error('Failed to load sessions without codes');
        } finally {
            setLoadingSessionsData(false);
        }
    };

    // Handle clicking on "With Access Codes" card
    const handleWithCodesClick = async () => {
        await fetchSessionsWithCodes();
        setSessionsWithCodesModalVisible(true);
    };

    // Handle clicking on "Without Codes" card
    const handleWithoutCodesClick = async () => {
        await fetchSessionsWithoutCodes();
        setSessionsWithoutCodesModalVisible(true);
    };



    const handleExpandRow = async (batchId: number) => {
        if (expandedRowKeys.includes(batchId)) {
            // Collapse row
            setExpandedRowKeys(prev => prev.filter(key => key !== batchId));
        } else {
            // Expand row
            setExpandedRowKeys(prev => [...prev, batchId]);
            await fetchBatchSessions(batchId);
        }
    };

    const handleExpandBatchRow = async (batchId: number) => {
        if (expandedBatchKeys.includes(batchId)) {
            // Collapse row
            setExpandedBatchKeys(prev => prev.filter(key => key !== batchId));
        } else {
            // Expand row
            setExpandedBatchKeys(prev => [...prev, batchId]);
            await fetchBatchSessionDetails(batchId);
        }
    };

    // Chart data preparation


    // Expanded row content component
    const renderExpandedRow = (record: BatchAttendance) => {
        const sessions = batchSessions[record.id] || [];
        const isLoading = loadingBatchSessions[record.id];

        if (isLoading) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '10px', color: '#666' }}>Loading sessions...</div>
                </div>
            );
        }

        if (sessions.length === 0) {
            return (
                <div style={{ padding: '20px' }}>
                    <Empty 
                        description="No sessions found for this batch"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            );
        }

        const sessionColumns = [
            {
                title: 'Session Title',
                dataIndex: 'title',
                key: 'title',
                width: '25%',
                render: (title: string) => (
                    <div style={{ fontWeight: 500, color: '#1890ff' }}>
                        <BookOutlined style={{ marginRight: 8 }} />
                        {title}
                    </div>
                ),
            },
            {
                title: 'Date',
                dataIndex: 'start_time',
                key: 'date',
                width: '15%',
                render: (startTime: string) => (
                    <div>
                        <CalendarOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        {dayjs(startTime).format('MMM DD, YYYY')}
                    </div>
                ),
            },
            {
                title: 'Time',
                key: 'time',
                width: '20%',
                render: (record: BatchSession) => (
                    <div>
                        <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                        {dayjs(record.start_time).format('HH:mm')} - {dayjs(record.end_time).format('HH:mm')}
                    </div>
                ),
            },
            {
                title: 'Status',
                dataIndex: 'session_status',
                key: 'session_status',
                width: '15%',
                render: (status: string) => {
                    const statusConfig = {
                        upcoming: { color: 'blue', text: 'Upcoming' },
                        ongoing: { color: 'orange', text: 'Ongoing' },
                        completed: { color: 'green', text: 'Completed' }
                    };
                    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
                    return <Tag color={config.color}>{config.text}</Tag>;
                },
            },
            {
                title: 'Attendance',
                key: 'attendance',
                width: '25%',
                render: (record: BatchSession) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                {record.present_count + record.late_count}/{record.total_students} students
                            </div>
                            <Progress 
                                percent={Math.round(record.attendance_rate)} 
                                size="small"
                                status={record.attendance_rate >= 80 ? 'success' : record.attendance_rate >= 60 ? 'normal' : 'exception'}
                            />
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            {Math.round(record.attendance_rate)}%
                        </div>
                    </div>
                ),
            },
        ];

        return (
            <div style={{ 
                margin: '0 48px 16px 48px', 
                backgroundColor: '#fafafa', 
                borderRadius: '8px',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ 
                    padding: '16px 20px 12px 20px', 
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: '#fff',
                    borderRadius: '8px 8px 0 0'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between' 
                    }}>
                        <h4 style={{ 
                            margin: 0, 
                            color: '#1890ff',
                            fontSize: '16px',
                            fontWeight: 600
                        }}>
                            📚 Scheduled Sessions for {record.name}
                        </h4>
                        <Badge 
                            count={sessions.length} 
                            style={{ backgroundColor: '#52c41a' }}
                            title={`${sessions.length} sessions`}
                        />
                    </div>
                </div>
                <div style={{ padding: '16px' }}>
                    <Table
                        columns={sessionColumns}
                        dataSource={sessions}
                        rowKey="schedule_id"
                        pagination={false}
                        size="small"
                        style={{ backgroundColor: '#fff' }}
                        onRow={(record: BatchSession) => ({
                            style: {
                                backgroundColor: 
                                    record.session_status === 'completed' ? '#f6ffed' :
                                    record.session_status === 'ongoing' ? '#fff7e6' : '#f0f5ff',
                                borderLeft: 
                                    record.session_status === 'completed' ? '3px solid #52c41a' :
                                    record.session_status === 'ongoing' ? '3px solid #fa8c16' : '3px solid #1890ff',
                                transition: 'all 0.2s ease',
                                cursor: 'default'
                            },
                            onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            },
                            onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }
                        })}
                    />
                </div>
            </div>
        );
    };

    // Expanded batch row content component
    const renderExpandedBatchRow = (record: BatchPerformance) => {
        const sessions = batchSessionDetails[record.batch_id] || [];
        const isLoading = loadingBatchSessionDetails[record.batch_id];

        if (isLoading) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '10px', color: '#666' }}>Loading session details...</div>
                </div>
            );
        }

        if (sessions.length === 0) {
            return (
                <div style={{ padding: '20px' }}>
                    <Empty 
                        description="No sessions found for this batch"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            );
        }

        return (
            <div style={{ 
                margin: '0 48px 16px 48px', 
                backgroundColor: '#fafafa', 
                borderRadius: '8px',
                border: '1px solid #f0f0f0'
            }}>
                <div style={{ 
                    padding: '16px 20px 12px 20px', 
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: '#fff',
                    borderRadius: '8px 8px 0 0'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between' 
                    }}>
                        <h4 style={{ 
                            margin: 0, 
                            color: '#1890ff',
                            fontSize: '16px',
                            fontWeight: 600
                        }}>
                            📚 Session Details for {record.batch_name}
                        </h4>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Badge 
                                count={sessions.length} 
                                style={{ backgroundColor: '#52c41a' }}
                                title={`${sessions.length} total sessions`}
                            />
                            <Badge 
                                count={sessions.filter(s => s.session_id).length} 
                                style={{ backgroundColor: '#1890ff' }}
                                title={`${sessions.filter(s => s.session_id).length} conducted sessions`}
                            />
                        </div>
                    </div>
                </div>
                <div style={{ padding: '16px' }}>
                    <Table
                        columns={batchSessionColumns}
                        dataSource={sessions}
                        rowKey={(record) => `${record.schedule_id}-${record.session_id || 'scheduled'}`}
                        pagination={false}
                        size="small"
                        style={{ backgroundColor: '#fff' }}
                        onRow={(record: BatchSessionDetail) => {
                            let bgColor = '#f0f5ff';
                            let borderColor = '#1890ff';
                            
                            if (record.session_id) {
                                if (record.actual_end_time) {
                                    bgColor = '#f6ffed';
                                    borderColor = '#52c41a';
                                } else if (record.actual_start_time) {
                                    bgColor = '#fff7e6';
                                    borderColor = '#fa8c16';
                                } else {
                                    bgColor = '#e6f7ff';
                                    borderColor = '#1890ff';
                                }
                            } else {
                                bgColor = '#fff2f0';
                                borderColor = '#ff4d4f';
                            }
                            
                            return {
                                style: {
                                    backgroundColor: bgColor,
                                    borderLeft: `3px solid ${borderColor}`,
                                    transition: 'all 0.2s ease',
                                    cursor: 'default'
                                },
                                onMouseEnter: (e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                },
                                onMouseLeave: (e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            };
                        }}
                    />
                </div>
            </div>
        );
    };

    // Table columns
    const batchColumns = [
        {
            title: '',
            key: 'expand',
            width: 50,
            render: (_: any, record: BatchAttendance) => (
                <Button
                    type="text"
                    size="small"
                    icon={expandedRowKeys.includes(record.id) ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => handleExpandRow(record.id)}
                    style={{
                        color: '#1890ff',
                        border: 'none',
                        boxShadow: 'none',
                        padding: '4px 8px',
                    }}
                    title={expandedRowKeys.includes(record.id) ? 'Collapse sessions' : 'View sessions'}
                />
            ),
        },
        {
            title: 'Batch Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: BatchAttendance, b: BatchAttendance) => a.name.localeCompare(b.name),
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            render: (teacher_name: string) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {teacher_name}
                </span>
            ),
            sorter: (a: BatchAttendance, b: BatchAttendance) => a.teacher_name.localeCompare(b.teacher_name),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
        },
        {
            title: 'Total Sessions',
            dataIndex: 'total_sessions',
            key: 'total_sessions',
            sorter: (a: BatchAttendance, b: BatchAttendance) => a.total_sessions - b.total_sessions,
        },
        {
            title: 'Completed Sessions',
            dataIndex: 'completed_sessions',
            key: 'completed_sessions',
            render: (value: number, record: BatchAttendance) => (
                <span>
                    {value}/{record.total_sessions}
                    <Progress 
                        percent={Math.round((value / record.total_sessions) * 100)} 
                        size="small" 
                        style={{ marginLeft: 8, width: 60 }}
                    />
                </span>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'total_students',
            key: 'total_students',
        },
        {
            title: 'Attendance Rate',
            dataIndex: 'avg_attendance_rate',
            key: 'avg_attendance_rate',
            render: (rate: number) => (
                <Progress 
                    percent={Math.round(rate)} 
                    status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
                />
            ),
            sorter: (a: BatchAttendance, b: BatchAttendance) => a.avg_attendance_rate - b.avg_attendance_rate,
        },
    ];





    const batchPerformanceColumns = [
        {
            title: 'Batch Name',
            dataIndex: 'batch_name',
            key: 'batch_name',
            render: (name: string, record: BatchPerformance) => (
                <div>
                    <Text strong>{name}</Text>
                    {record.batch_description && (
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {record.batch_description}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            render: (name: string, record: BatchPerformance) => (
                <div>
                    <Text>{name}</Text>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.teacher_email}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Total Sessions',
            dataIndex: 'total_sessions',
            key: 'total_sessions',
            render: (total: number, record: BatchPerformance) => (
                <div style={{ textAlign: 'center' }}>
                    <Text strong>{total}</Text>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.conducted_sessions} conducted
                        </Text>
                    </div>
                </div>
            ),
            sorter: (a: BatchPerformance, b: BatchPerformance) => a.total_sessions - b.total_sessions,
        },
        {
            title: 'Code Generation Rate',
            dataIndex: 'code_generation_rate',
            key: 'code_generation_rate',
            render: (rate: number) => (
                <Progress 
                    percent={Math.round(rate)} 
                    status={rate >= 90 ? 'success' : rate >= 70 ? 'normal' : 'exception'}
                    size="small"
                />
            ),
            sorter: (a: BatchPerformance, b: BatchPerformance) => a.code_generation_rate - b.code_generation_rate,
        },
        {
            title: 'Session Start Rate',
            dataIndex: 'session_start_rate',
            key: 'session_start_rate',
            render: (rate: number) => (
                <Progress 
                    percent={Math.round(rate)} 
                    status={rate >= 90 ? 'success' : rate >= 70 ? 'normal' : 'exception'}
                    size="small"
                />
            ),
            sorter: (a: BatchPerformance, b: BatchPerformance) => a.session_start_rate - b.session_start_rate,
        },
        {
            title: 'Avg Attendance',
            dataIndex: 'avg_attendance_rate',
            key: 'avg_attendance_rate',
            render: (rate: number) => (
                <Progress 
                    percent={Math.round(rate ?? 0)} 
                    status={(rate ?? 0) >= 80 ? 'success' : (rate ?? 0) >= 60 ? 'normal' : 'exception'}
                    size="small"
                />
            ),
            sorter: (a: BatchPerformance, b: BatchPerformance) => (a.avg_attendance_rate ?? 0) - (b.avg_attendance_rate ?? 0),
        },
        {
            title: 'Students',
            dataIndex: 'total_students',
            key: 'total_students',
            render: (count: number) => (
                <Badge count={count} showZero color="#1890ff" />
            ),
            sorter: (a: BatchPerformance, b: BatchPerformance) => a.total_students - b.total_students,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: BatchPerformance) => (
                <Button
                    type="link"
                    icon={expandedBatchKeys.includes(record.batch_id) ? <UpOutlined /> : <DownOutlined />}
                    onClick={() => handleExpandBatchRow(record.batch_id)}
                    loading={loadingBatchSessionDetails[record.batch_id]}
                >
                    {expandedBatchKeys.includes(record.batch_id) ? 'Hide' : 'Show'} Sessions
                </Button>
            ),
        },
    ];

    const batchSessionColumns = [
        {
            title: 'Session',
            render: (_: any, record: BatchSessionDetail) => (
                <div>
                    <Text strong>{record.subject}</Text>
                    {record.topic && (
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {record.topic}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Scheduled Time',
            render: (_: any, record: BatchSessionDetail) => (
                <div>
                    <Text>{dayjs(record.start_time).format('MMM DD, YYYY')}</Text>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(record.start_time).format('HH:mm')} - {dayjs(record.end_time).format('HH:mm')}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'session_status',
            key: 'session_status',
            render: (status: string, record: BatchSessionDetail) => {
                let color = 'default';
                let text = status || 'Not Started';
                
                if (record.session_id) {
                    if (record.actual_end_time) {
                        color = 'green';
                        text = 'Completed';
                    } else if (record.actual_start_time) {
                        color = 'blue';
                        text = 'In Progress';
                    } else {
                        color = 'orange';
                        text = 'Scheduled';
                    }
                } else {
                    color = 'red';
                    text = 'Not Started';
                }
                
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Duration',
            dataIndex: 'duration_minutes',
            key: 'duration_minutes',
            render: (minutes: number) => (
                <Text>{minutes > 0 ? `${minutes} min` : '-'}</Text>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'total_students',
            key: 'total_students',
        },
        {
            title: 'Attendance',
            render: (_: any, record: BatchSessionDetail) => (
                <div>
                    <Progress 
                        percent={Math.round(record.attendance_percentage ?? 0)} 
                        status={(record.attendance_percentage ?? 0) >= 80 ? 'success' : 'normal'}
                        size="small"
                    />
                    <div style={{ fontSize: '12px', marginTop: 4 }}>
                        <Text type="secondary">
                            Present: {record.present_count} | <span style={{ color: '#ff7a00' }}>Late: {record.late_count}</span> | Absent: {record.absent_count}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Access Code',
            dataIndex: 'access_code',
            key: 'access_code',
            render: (code: string) => (
                code ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                        Generated
                    </Tag>
                ) : (
                    <Tag color="red" icon={<CloseCircleOutlined />}>
                        Not Generated
                    </Tag>
                )
            ),
        },
    ];



    const sessionStudentColumns = [
        {
            title: 'Schedule Title',
            dataIndex: 'schedule_title',
            key: 'schedule_title',
        },
        {
            title: 'Batch Name & French Level',
            render: (_: any, record: SessionStudent) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.batch_name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.french_level}</div>
                </div>
            ),
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            render: (name: string) => (
                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{name}</div>
            ),
        },
        {
            title: 'Attendance',
            dataIndex: 'attendance_status',
            key: 'attendance_status',
            render: (status: string | null) => {
                if (!status) {
                    return <Tag color="default">Not Recorded</Tag>;
                }
                const statusConfig = {
                    present: { color: 'green', text: 'Present' },
                    absent: { color: 'red', text: 'Absent' },
                    late: { color: 'orange', text: 'Late' }
                };
                const config = statusConfig[status as keyof typeof statusConfig];
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: 'Start Time',
            dataIndex: 'schedule_start_time',
            key: 'schedule_start_time',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY HH:mm'),
            sorter: (a: SessionStudent, b: SessionStudent) => 
                dayjs(a.schedule_start_time).valueOf() - dayjs(b.schedule_start_time).valueOf(),
        },
        {
            title: 'Joining Time',
            dataIndex: 'check_in_time',
            key: 'check_in_time',
            render: (time: string | null) => {
                if (!time) return '-';
                return dayjs(time).format('MMM DD, YYYY HH:mm:ss');
            },
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <BarChartOutlined /> Attendance Management
                </Title>
                <Text type="secondary">
                    Comprehensive attendance tracking and analytics for all batches, students, and teachers
                </Text>
            </div>

            {/* Detailed Tables */}
            <Spin spinning={loading}>
                <Tabs
                defaultActiveKey="overview"
                items={[
                    {
                        key: 'overview',
                        label: 'Overview',
                        children: (
                            <div>
                                {/* Overview Filters */}
                                <Card style={{ marginBottom: 16 }}>
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Text strong>Date Range:</Text>
                                            <RangePicker
                                                value={dateRange}
                                                onChange={handleDateRangeChange}
                                                disabled
                                                style={{ width: '100%', marginTop: 4 }}
                                                placeholder={['Start Date', 'End Date']}
                                            />
                                        </Col>
                                        <Col span={6}>
                                            <Text strong>Batch Filter:</Text>
                                            <Select
                                                placeholder="All Batches"
                                                value={selectedBatch}
                                                onChange={setSelectedBatch}
                                                allowClear
                                                disabled
                                                style={{ width: '100%', marginTop: 4 }}
                                            >
                                                {batches.map(batch => (
                                                    <Option key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={6}>
                                            <Text strong>Teacher Filter:</Text>
                                            <Select
                                                placeholder="All Teachers"
                                                value={selectedTeacher}
                                                onChange={setSelectedTeacher}
                                                allowClear
                                                disabled
                                                style={{ width: '100%', marginTop: 4 }}
                                            >
                                                {teachers.map(teacher => (
                                                    <Option key={teacher.id} value={teacher.id}>
                                                        {teacher.first_name} {teacher.last_name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Key Metrics Cards */}
                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Total Students"
                                                value={overview?.total_students || 0}
                                                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Total Teachers"
                                                value={overview?.total_teachers || 0}
                                                prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                                                valueStyle={{ color: '#52c41a' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Total Batches"
                                                value={overview?.total_batches || 0}
                                                prefix={<BookOutlined style={{ color: '#fa8c16' }} />}
                                                valueStyle={{ color: '#fa8c16' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={6}>
                                        <Card>
                                            <Statistic
                                                title="Total Sessions"
                                                value={overview?.total_sessions || 0}
                                                prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
                                                valueStyle={{ color: '#722ed1' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Attendance Overview */}
                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col span={12}>
                                        <Card title="Overall Attendance Rate" extra={<BarChartOutlined />}>
                                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                                <Progress
                                                    type="circle"
                                                    percent={Math.round(overview?.overall_attendance_rate || 0)}
                                                    size={120}
                                                    status={
                                                        (overview?.overall_attendance_rate || 0) >= 80 ? 'success' :
                                                        (overview?.overall_attendance_rate || 0) >= 60 ? 'normal' : 'exception'
                                                    }
                                                    strokeColor={{
                                                        '0%': '#108ee9',
                                                        '100%': '#87d068',
                                                    }}
                                                />
                                                <div style={{ marginTop: 16, fontSize: '16px', fontWeight: 500 }}>
                                                    {(overview?.overall_attendance_rate || 0).toFixed(1)}% Overall Rate
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card title="Attendance Distribution" extra={<PieChartOutlined />}>
                                            <Row gutter={16} style={{ textAlign: 'center' }}>
                                                <Col span={8}>
                                                    <Statistic
                                                        title="Present"
                                                        value={overview?.total_present || 0}
                                                        valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                                                        prefix={<CheckCircleOutlined />}
                                                    />
                                                </Col>
                                                <Col span={8}>
                                                    <Statistic
                                                        title="Late"
                                                        value={overview?.total_late || 0}
                                                        valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
                                                        prefix={<ClockCircleOutlined />}
                                                    />
                                                </Col>
                                                <Col span={8}>
                                                    <Statistic
                                                        title="Absent"
                                                        value={overview?.total_absent || 0}
                                                        valueStyle={{ color: '#f5222d', fontSize: '20px' }}
                                                        prefix={<CloseCircleOutlined />}
                                                    />
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Session Code Analytics */}
                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col span={12}>
                                        <Card title="Session Code Analytics" extra={<KeyOutlined />}>
                                            <Row gutter={16}>
                                                <Col span={12}>
                                                    <div 
                                                        onClick={handleWithCodesClick}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            transition: 'background-color 0.3s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <Statistic
                                                            title="With Access Codes"
                                                            value={overview?.sessions_with_codes || 0}
                                                            valueStyle={{ color: '#52c41a' }}
                                                            prefix={<CheckCircleOutlined />}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col span={12}>
                                                    <div 
                                                        onClick={handleWithoutCodesClick}
                                                        style={{ 
                                                            cursor: 'pointer', 
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            transition: 'background-color 0.3s',
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <Statistic
                                                            title="Without Codes"
                                                            value={overview?.sessions_without_codes || 0}
                                                            valueStyle={{ color: '#f5222d' }}
                                                            prefix={<ExclamationCircleOutlined />}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                            <div style={{ marginTop: 16 }}>
                                                <Progress
                                                    percent={
                                                        overview?.total_sessions ? 
                                                        Math.round((overview.sessions_with_codes / overview.total_sessions) * 100) : 0
                                                    }
                                                    status="active"
                                                    strokeColor="#52c41a"
                                                />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Code Coverage Rate
                                                </Text>
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card title="Quick Stats" extra={<DashboardOutlined />}>
                                            <Descriptions column={1} size="small">
                                                <Descriptions.Item label="Avg Students per Batch">
                                                    {overview?.total_batches ? 
                                                        Math.round((overview.total_students / overview.total_batches) * 10) / 10 : 0}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Avg Sessions per Batch">
                                                    {overview?.total_batches ? 
                                                        Math.round((overview.total_sessions / overview.total_batches) * 10) / 10 : 0}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Teacher to Student Ratio">
                                                    1:{overview?.total_teachers ? 
                                                        Math.round(overview.total_students / overview.total_teachers) : 0}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Total Attendance Records">
                                                    {(overview?.total_present || 0) + (overview?.total_absent || 0) + (overview?.total_late || 0)}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Top Performers */}
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Card title="Top Performing Batches" extra={<TrophyOutlined />}>
                                            {batchAttendance.slice(0, 3).map((batch, index) => (
                                                <div key={batch.id} style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    padding: '8px 0',
                                                    borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                                                }}>
                                                    <div>
                                                        <Text strong>{batch.name}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            Teacher: {batch.teacher_name}
                                                        </Text>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Text style={{ 
                                                            color: batch.avg_attendance_rate >= 80 ? '#52c41a' : 
                                                                   batch.avg_attendance_rate >= 60 ? '#fa8c16' : '#f5222d',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {batch.avg_attendance_rate.toFixed(1)}%
                                                        </Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            {batch.total_students} students
                                                        </Text>
                                                    </div>
                                                </div>
                                            ))}
                                            {batchAttendance.length === 0 && (
                                                <Empty description="No batch data available" />
                                            )}
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card title="Teacher Performance" extra={<StarOutlined />}>
                                            {Array.isArray(teacherPerformance) && teacherPerformance.slice(0, 3).map((teacher, index) => (
                                                <div key={teacher.teacher_id} style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    padding: '8px 0',
                                                    borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                                                }}>
                                                    <div>
                                                        <Text strong>{teacher.teacher_name}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            {teacher.total_sessions ?? 0} sessions
                                                        </Text>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Text style={{ 
                                                            color: (teacher.avg_attendance_rate ?? 0) >= 80 ? '#52c41a' : 
                                                                   (teacher.avg_attendance_rate ?? 0) >= 60 ? '#fa8c16' : '#f5222d',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {(teacher.avg_attendance_rate ?? 0).toFixed(1)}%
                                                        </Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            {teacher.total_students ?? 0} students
                                                        </Text>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!Array.isArray(teacherPerformance) || teacherPerformance.length === 0) && (
                                                <Empty description="No teacher data available" />
                                            )}
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        )
                    },
                    {
                        key: 'session-student',
                        label: 'Session Student',
                        children: (
                                <Card>
                                    {/* Session Student Filters */}
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={6}>
                                            <Select
                                                placeholder="Select Batch (Optional)"
                                                value={selectedBatchForSession}
                                                onChange={setSelectedBatchForSession}
                                                allowClear
                                                style={{ width: '100%' }}
                                            >
                                                {batches.map(batch => (
                                                    <Option key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={6}>
                                            <Select
                                                placeholder="Select Student (Required)"
                                                value={selectedStudentForSession}
                                                onChange={setSelectedStudentForSession}
                                                showSearch
                                                filterOption={(input, option) => {
                                                    const student = filteredStudents.find(s => s.id === option?.value);
                                                    if (!student) return false;
                                                    
                                                    const searchText = input.toLowerCase();
                                                    const firstName = student.first_name?.toLowerCase() || '';
                                                    const lastName = student.last_name?.toLowerCase() || '';
                                                    const fullName = `${firstName} ${lastName}`.toLowerCase();
                                                    
                                                    return firstName.includes(searchText) || 
                                                           lastName.includes(searchText) || 
                                                           fullName.includes(searchText);
                                                }}
                                                style={{ width: '100%' }}
                                                notFoundContent={filteredStudents.length === 0 ? "No students available" : "No matching students"}
                                            >
                                                {filteredStudents.map(student => (
                                                    <Option key={student.id} value={student.id}>
                                                        {student.first_name} {student.last_name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Col>
                                        <Col span={6}>
                                            <RangePicker
                                                value={dateRange}
                                                onChange={handleDateRangeChange}
                                                style={{ width: '100%' }}
                                                placeholder={['Start Date', 'End Date']}
                                            />
                                        </Col>
                                    </Row>

                                    {/* KPI Cards for Session Student */}
                                    {selectedStudentForSession && Array.isArray(sessionStudentData) && sessionStudentData.length > 0 && (
                                        <Row gutter={16} style={{ marginBottom: 24 }}>
                                            <Col xs={12} sm={6}>
                                                <Card 
                                                    size="small" 
                                                    style={{ 
                                                        background: '#f6ffed',
                                                        border: '1px solid #b7eb8f',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                                                    }}
                                                >
                                                    <Statistic
                                                        title={<span style={{ color: '#52c41a', fontWeight: 500, fontSize: '12px' }}>Total Present</span>}
                                                        value={sessionStudentData.filter(session => session.attendance_status === 'present').length}
                                                        valueStyle={{ color: '#52c41a', fontSize: '24px', fontWeight: 'bold' }}
                                                        prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Card 
                                                    size="small" 
                                                    style={{ 
                                                        background: '#fff7e6',
                                                        border: '1px solid #ffd591',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                                                    }}
                                                >
                                                    <Statistic
                                                        title={<span style={{ color: '#fa8c16', fontWeight: 500, fontSize: '12px' }}>Total Late</span>}
                                                        value={sessionStudentData.filter(session => session.attendance_status === 'late').length}
                                                        valueStyle={{ color: '#fa8c16', fontSize: '24px', fontWeight: 'bold' }}
                                                        prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Card 
                                                    size="small" 
                                                    style={{ 
                                                        background: '#fff2f0',
                                                        border: '1px solid #ffb3b3',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                                                    }}
                                                >
                                                    <Statistic
                                                        title={<span style={{ color: '#ff4d4f', fontWeight: 500, fontSize: '12px' }}>Total Absent</span>}
                                                        value={sessionStudentData.filter(session => session.attendance_status === 'absent').length}
                                                        valueStyle={{ color: '#ff4d4f', fontSize: '24px', fontWeight: 'bold' }}
                                                        prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col xs={12} sm={6}>
                                                <Card 
                                                    size="small" 
                                                    style={{ 
                                                        background: '#f0f5ff',
                                                        border: '1px solid #91d5ff',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                                                    }}
                                                >
                                                    <Statistic
                                                        title={<span style={{ color: '#1890ff', fontWeight: 500, fontSize: '12px' }}>Attendance Rate</span>}
                                                        value={(() => {
                                                            const totalScheduled = sessionStudentData.length;
                                                            const presentCount = sessionStudentData.filter(session => session.attendance_status === 'present').length;
                                                            const lateCount = sessionStudentData.filter(session => session.attendance_status === 'late').length;
                                                            return totalScheduled > 0 ? Math.round(((presentCount + lateCount) / totalScheduled) * 100) : 0;
                                                        })()}
                                                        suffix={<span style={{ color: '#1890ff' }}>%</span>}
                                                        valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
                                                        prefix={<BarChartOutlined style={{ color: '#1890ff' }} />}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>
                                    )}

                                    {/* Session Student Table */}
                                    {!selectedStudentForSession ? (
                                        <Empty
                                            description="Display no data, please select student"
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    ) : (
                                        <Table
                                            columns={sessionStudentColumns}
                                            dataSource={Array.isArray(sessionStudentData) ? sessionStudentData : []}
                                            rowKey="schedule_id"
                                            pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
                                            loading={loading}
                                            scroll={{ y: 400, x: 'max-content' }}
                                        />
                                    )}
                                </Card>
                            )
                        },
                        {
                            key: 'batches',
                            label: `Batch Analytics (${batchAttendance.length})`,
                            children: (
                                <Card>
                                    {/* Batch Analytics Filters */}
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={8}>
                                            <Text strong>Date Range:</Text>
                                            <RangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                style={{ width: '100%', marginTop: 4 }}
                                placeholder={['Start Date', 'End Date']}
                            />
                                        </Col>
                                        <Col span={6}>
                                            <Text strong>Batch Filter:</Text>
                                            <Select
                                                placeholder="All Batches"
                                                value={selectedBatch}
                                                onChange={setSelectedBatch}
                                                allowClear
                                                style={{ width: '100%', marginTop: 4 }}
                                            >
                                                {batches.map(batch => (
                                                    <Option key={batch.id} value={batch.id}>
                                                        {batch.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Col>
                                    </Row>
                                    <Table
                                        columns={batchColumns}
                                        dataSource={Array.isArray(batchAttendance) ? batchAttendance : []}
                                        rowKey="id"
                                        pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches` }}
                                        scroll={{ y: 400, x: 'max-content' }}
                                        expandable={{
                                            expandedRowKeys,
                                            onExpand: (_expanded, record) => handleExpandRow(record.id),
                                            expandedRowRender: renderExpandedRow,
                                            expandIcon: () => null, // Hide default expand icon since we have custom button
                                            rowExpandable: () => true,
                                        }}
                                    />
                                </Card>
                            )
                        },
                        {
                            key: 'teachers',
                            label: `Batch Performance (${batchPerformance.length})`,
                            children: (
                                <Card>
                                    <Table
                                        columns={batchPerformanceColumns}
                                        dataSource={Array.isArray(batchPerformance) ? batchPerformance : []}
                                        rowKey="batch_id"
                                        pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches` }}
                                        scroll={{ y: 400, x: 'max-content' }}
                                        expandable={{
                                            expandedRowKeys: expandedBatchKeys,
                                            onExpand: (_expanded, record) => handleExpandBatchRow(record.batch_id),
                                            expandedRowRender: renderExpandedBatchRow,
                                            expandIcon: () => null, // Hide default expand icon since we have custom button
                                            rowExpandable: () => true,
                                        }}
                                    />
                                </Card>
                            )
                        },
                        {
                            key: 'export',
                            label: 'Export Data',
                            children: <AttendanceExport />
                        }
                    ]}
                />
            </Spin>

            {/* Session Detail Modal */}
            <Modal
                title="Session Details"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedSession && (
                    <div>
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Class" span={2}>
                                {selectedSession.schedule_title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date">
                                {dayjs(selectedSession.session_date).format('MMMM DD, YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Time">
                                {selectedSession.start_time} - {selectedSession.end_time}
                            </Descriptions.Item>
                            <Descriptions.Item label="Batch">
                                {selectedSession.batch_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Teacher">
                                {selectedSession.teacher_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Total Students">
                                {selectedSession.total_students}
                            </Descriptions.Item>
                            <Descriptions.Item label="Attendance Rate">
                                <Progress 
                                    percent={Math.round(selectedSession.attendance_percentage)} 
                                    status={selectedSession.attendance_percentage >= 80 ? 'success' : 'normal'}
                                />
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Row gutter={16}>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Present"
                                        value={selectedSession.present_count}
                                        valueStyle={{ color: '#3f8600' }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Absent"
                                        value={selectedSession.absent_count}
                                        valueStyle={{ color: '#cf1322' }}
                                        prefix={<CloseCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small">
                                    <Statistic
                                        title="Late"
                                        value={selectedSession.late_count}
                                        valueStyle={{ color: '#fa8c16' }}
                                        prefix={<ExclamationCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        <Divider />

                        <Space>
                            {selectedSession.code_generated ? (
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                    Access Code Generated
                                </Tag>
                            ) : (
                                <Tag color="red" icon={<CloseCircleOutlined />}>
                                    No Access Code Generated
                                </Tag>
                            )}
                            {selectedSession.session_started ? (
                                <Tag color="blue" icon={<CheckCircleOutlined />}>
                                    Session Started
                                </Tag>
                            ) : (
                                <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                                    Session Not Started
                                </Tag>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>

            {/* Sessions with Access Codes Modal */}
            <Modal
                title="Sessions with Access Codes"
                open={sessionsWithCodesModalVisible}
                onCancel={() => setSessionsWithCodesModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    dataSource={sessionsWithCodesData}
                    loading={loadingSessionsData}
                    rowKey="session_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                    columns={[
                        {
                            title: 'Session Name',
                            dataIndex: 'session_name',
                            key: 'session_name',
                            width: 200,
                        },
                        {
                            title: 'Teacher',
                            dataIndex: 'teacher_name',
                            key: 'teacher_name',
                            width: 150,
                        },
                        {
                            title: 'Batch',
                            dataIndex: 'batch_name',
                            key: 'batch_name',
                            width: 120,
                        },
                        {
                            title: 'French Level',
                            dataIndex: 'french_level',
                            key: 'french_level',
                            width: 100,
                        },
                        {
                            title: 'Start Date & Time',
                            dataIndex: 'start_time',
                            key: 'start_time',
                            width: 180,
                            render: (text: string) => {
                                if (!text) return '-';
                                return new Date(text).toLocaleString();
                            },
                        },
                        {
                            title: 'Access Code',
                            dataIndex: 'access_code',
                            key: 'access_code',
                            width: 120,
                            render: (code: string) => (
                                <Tag color="green">{code}</Tag>
                            ),
                        },
                        {
                            title: 'Status',
                            dataIndex: 'session_status',
                            key: 'session_status',
                            width: 100,
                            render: (status: string) => (
                                <Tag color={status === 'completed' ? 'blue' : status === 'active' ? 'green' : 'orange'}>
                                    {status}
                                </Tag>
                            ),
                        },
                    ]}
                />
            </Modal>

            {/* Sessions without Access Codes Modal */}
            <Modal
                title="Sessions without Access Codes"
                open={sessionsWithoutCodesModalVisible}
                onCancel={() => setSessionsWithoutCodesModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    dataSource={sessionsWithoutCodesData}
                    loading={loadingSessionsData}
                    rowKey="session_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                    columns={[
                        {
                            title: 'Session Name',
                            dataIndex: 'session_name',
                            key: 'session_name',
                            width: 200,
                        },
                        {
                            title: 'Teacher',
                            dataIndex: 'teacher_name',
                            key: 'teacher_name',
                            width: 150,
                        },
                        {
                            title: 'Batch',
                            dataIndex: 'batch_name',
                            key: 'batch_name',
                            width: 120,
                        },
                        {
                            title: 'French Level',
                            dataIndex: 'french_level',
                            key: 'french_level',
                            width: 100,
                        },
                        {
                            title: 'Start Date & Time',
                            dataIndex: 'start_time',
                            key: 'start_time',
                            width: 180,
                            render: (text: string) => {
                                if (!text) return '-';
                                return new Date(text).toLocaleString();
                            },
                        },
                        {
                            title: 'Status',
                            dataIndex: 'session_status',
                            key: 'session_status',
                            width: 100,
                            render: (status: string) => (
                                <Tag color={status === 'completed' ? 'blue' : status === 'active' ? 'green' : 'orange'}>
                                    {status}
                                </Tag>
                            ),
                        },
                    ]}
                />
            </Modal>

        </div>
    );
};

export default AttendanceManagement;