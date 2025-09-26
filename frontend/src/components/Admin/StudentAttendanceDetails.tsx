import React, { useState, useEffect } from 'react';
import type { ColumnsType } from 'antd/es/table';
import {
    Table,
    Card,
    Row,
    Col,
    Statistic,
    Tag,
    Button,
    DatePicker,
    Select,
    Space,
    Typography,
    Progress,
    Collapse,
    Badge,
    Empty,
    Spin,
    Input,
    App,
    Avatar
} from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BookOutlined,
    TeamOutlined,
    ExclamationCircleOutlined,
    BarChartOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Panel } = Collapse;
const { Search } = Input;

// TypeScript interfaces
interface Batch {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    first_name: string;
    last_name: string;
}

interface SessionDetail {
    session_id: number;
    schedule_title: string;
    teacher_name: string;
    session_date: string;
    start_time: string;
    end_time: string;
    status: string;
    marked_at: string;
    code_entered: boolean;
}

interface StudentDetail {
    student_id: number;
    student_name: string;
    student_email: string;
    total_scheduled_classes: number;
    total_attended_classes: number;
    total_absent_classes: number;
    total_late_classes: number;
    attendance_percentage: number;
    last_attendance_date: string;
    sessions: SessionDetail[];
}

interface BatchSummary {
    batch_id: number;
    batch_name: string;
    total_students: number;
    total_scheduled_classes: number;
    average_attendance_rate: number;
    students: StudentDetail[];
}

// Use Ant Design App context message instance
const StudentAttendanceDetails: React.FC = () => {
    const { apiCall } = useAuth();
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [batchSummaries, setBatchSummaries] = useState<BatchSummary[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<number | undefined>();
    const [selectedTeacher, setSelectedTeacher] = useState<number | undefined>();
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [searchText, setSearchText] = useState('');
    const [expandedBatches, setExpandedBatches] = useState<string[]>([]);

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
        fetchStudentDetails();
    }, []);

    useEffect(() => {
        fetchStudentDetails();
    }, [selectedBatch, selectedTeacher, dateRange]);

    const fetchBatches = async () => {
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                setBatches(Array.isArray(data) ? data : data.batches || []);
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
                setTeachers(Array.isArray(data) ? data : data.users || []);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchStudentDetails = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }

            const qs = params.toString();
            const response = await apiCall(`/attendance/student-details${qs ? `?${qs}` : ''}`);
            if (response.ok) {
                const data = await response.json();
                setBatchSummaries(Array.isArray(data.batches) ? data.batches : []);
            } else {
                setBatchSummaries([]);
                message.error('Failed to load student attendance details');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            message.error('Failed to load student attendance details');
            setBatchSummaries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchStudentDetails();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'green';
            case 'late': return 'orange';
            case 'absent': return 'red';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircleOutlined />;
            case 'late': return <ExclamationCircleOutlined />;
            case 'absent': return <CloseCircleOutlined />;
            default: return null;
        }
    };

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 90) return '#52c41a';
        if (percentage >= 80) return '#1890ff';
        if (percentage >= 70) return '#faad14';
        return '#ff4d4f';
    };

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        } else {
            setDateRange(null);
        }
    };

    const studentColumns: ColumnsType<StudentDetail> = [
        {
            title: 'Student',
            key: 'student',
            render: (record: StudentDetail) => (
                <Space>
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.student_name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.student_email}
                        </Text>
                    </div>
                </Space>
            ),
            filteredValue: searchText ? [searchText] : null,
            onFilter: (value: React.Key | boolean, record: StudentDetail) =>
                record.student_name.toLowerCase().includes(String(value).toLowerCase()) ||
                record.student_email.toLowerCase().includes(String(value).toLowerCase()),
        },
        {
            title: 'Total Classes',
            dataIndex: 'total_scheduled_classes',
            key: 'total_scheduled_classes',
            align: 'center' as const,
            render: (value: number) => (
                <Badge count={value} style={{ backgroundColor: '#1890ff' }} />
            ),
        },
        {
            title: 'Attended',
            dataIndex: 'total_attended_classes',
            key: 'total_attended_classes',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                    {value}
                </Tag>
            ),
        },
        {
            title: 'Absent',
            dataIndex: 'total_absent_classes',
            key: 'total_absent_classes',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color="red" icon={<CloseCircleOutlined />}>
                    {value}
                </Tag>
            ),
        },
        {
            title: 'Late',
            dataIndex: 'total_late_classes',
            key: 'total_late_classes',
            align: 'center' as const,
            render: (value: number) => (
                <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                    {value}
                </Tag>
            ),
        },
        {
            title: 'Attendance Rate',
            dataIndex: 'attendance_percentage',
            key: 'attendance_percentage',
            align: 'center' as const,
            render: (percentage: number) => (
                <Progress
                    type="circle"
                    size={60}
                    percent={Math.round(percentage)}
                    strokeColor={getAttendanceColor(percentage)}
                    format={(percent) => `${percent}%`}
                />
            ),
            sorter: (a: StudentDetail, b: StudentDetail) => a.attendance_percentage - b.attendance_percentage,
        },
        {
            title: 'Last Attendance',
            dataIndex: 'last_attendance_date',
            key: 'last_attendance_date',
            render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A',
        },
    ];

    const sessionColumns = [
        {
            title: 'Date',
            dataIndex: 'session_date',
            key: 'session_date',
            render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
            sorter: (a: SessionDetail, b: SessionDetail) => 
                dayjs(a.session_date).unix() - dayjs(b.session_date).unix(),
        },
        {
            title: 'Time',
            key: 'time',
            render: (record: SessionDetail) => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: '12px' }}>
                        {dayjs(record.start_time).format('HH:mm')} - {dayjs(record.end_time).format('HH:mm')}
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Class',
            dataIndex: 'schedule_title',
            key: 'schedule_title',
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (status: string) => (
                <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Marked At',
            dataIndex: 'marked_at',
            key: 'marked_at',
            render: (time: string) => time ? dayjs(time).format('HH:mm') : 'N/A',
        },
        {
            title: 'Code Used',
            dataIndex: 'code_entered',
            key: 'code_entered',
            align: 'center' as const,
            render: (codeEntered: boolean) => (
                codeEntered ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            ),
        },
    ];

    const expandedRowRender = (student: StudentDetail) => {
        return (
            <Card size="small" style={{ margin: '8px 0' }}>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Statistic
                            title="Total Classes"
                            value={student.total_scheduled_classes}
                            prefix={<BookOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Present"
                            value={student.total_attended_classes}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Absent"
                            value={student.total_absent_classes}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Late"
                            value={student.total_late_classes}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#d48806' }}
                        />
                    </Col>
                </Row>
                
                <Table
                    columns={sessionColumns}
                    dataSource={Array.isArray(student.sessions) ? student.sessions : []}
                    rowKey="session_id"
                    size="small"
                    pagination={{
                        pageSize: 10,
                        size: 'small',
                        showSizeChanger: false,
                    }}
                    scroll={{ x: 800 }}
                />
            </Card>
        );
    };

    const filteredBatchSummaries = Array.isArray(batchSummaries) ? batchSummaries.filter(batch =>
        !searchText || (Array.isArray(batch.students) && batch.students.some(student =>
            student.student_name.toLowerCase().includes(searchText.toLowerCase()) ||
            student.student_email.toLowerCase().includes(searchText.toLowerCase())
        ))
    ) : [];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3}>
                    <UserOutlined /> Student Attendance Details
                </Title>
                <Text type="secondary">
                    Detailed view of student attendance with class-by-class breakdown
                </Text>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                    <Col span={5}>
                        <Select
                            placeholder="Select Batch"
                            value={selectedBatch}
                            onChange={setSelectedBatch}
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
                    <Col span={5}>
                        <Select
                            placeholder="Select Teacher"
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.first_name} {teacher.last_name}
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
                    <Col span={5}>
                        <Search
                            placeholder="Search students..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col span={3}>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                {filteredBatchSummaries.length > 0 ? (
                    <Collapse
                        activeKey={expandedBatches}
                        onChange={setExpandedBatches}
                        size="large"
                    >
                        {filteredBatchSummaries.map(batch => (
                            <Panel
                                key={batch.batch_id.toString()}
                                header={
                                    <Row justify="space-between" align="middle" style={{ width: '100%', marginRight: 24 }}>
                                        <Col>
                                            <Space>
                                                <TeamOutlined />
                                                <Text strong style={{ fontSize: '16px' }}>
                                                    {batch.batch_name}
                                                </Text>
                                                <Badge count={batch.total_students} style={{ backgroundColor: '#1890ff' }} />
                                            </Space>
                                        </Col>
                                        <Col>
                                            <Space size="large">
                                                <Statistic
                                                    title="Total Classes"
                                                    value={batch.total_scheduled_classes}
                                                    prefix={<BookOutlined />}
                                                    valueStyle={{ fontSize: '14px' }}
                                                />
                                                <Statistic
                                                    title="Avg Attendance"
                                                    value={Math.round(batch.average_attendance_rate)}
                                                    suffix="%"
                                                    prefix={<BarChartOutlined />}
                                                    valueStyle={{ 
                                                        fontSize: '14px',
                                                        color: getAttendanceColor(batch.average_attendance_rate)
                                                    }}
                                                />
                                            </Space>
                                        </Col>
                                    </Row>
                                }
                            >
                                <Table
                                    columns={studentColumns}
                                    dataSource={Array.isArray(batch.students) ? batch.students.filter(student =>
                                        !searchText || 
                                        student.student_name.toLowerCase().includes(searchText.toLowerCase()) ||
                                        student.student_email.toLowerCase().includes(searchText.toLowerCase())
                                    ) : []}
                                    rowKey="student_id"
                                    expandable={{
                                        expandedRowRender,
                                        expandRowByClick: true,
                                        rowExpandable: (record) => record.sessions && Array.isArray(record.sessions) && record.sessions.length > 0,
                                    }}
                                    pagination={{
                                        pageSize: 10,
                                        showSizeChanger: true,
                                        showQuickJumper: true,
                                        showTotal: (total, range) => 
                                            `${range[0]}-${range[1]} of ${total} students`,
                                    }}
                                    scroll={{ y: 400, x: 1200 }}
                                />
                            </Panel>
                        ))}
                    </Collapse>
                ) : (
                    <Card>
                        <Empty
                            description="No student attendance data found"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </Card>
                )}
            </Spin>
        </div>
    );
};

export default StudentAttendanceDetails;