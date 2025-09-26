import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Spin,
    Typography,
    Statistic,
    Progress,
    Tag,
    Alert
} from 'antd';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    RiseOutlined,
    FallOutlined,
    BarChartOutlined,
    PieChartOutlined,
    LineChartOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ChartData {
    name: string;
    value: number;
    date?: string;
    present?: number;
    absent?: number;
    late?: number;
    attendance_rate?: number;
    [key: string]: any;
}

const AttendanceCharts: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    
    // Chart data
    const [trendData, setTrendData] = useState<ChartData[]>([]);
    const [batchData, setBatchData] = useState<ChartData[]>([]);
    const [studentData, setStudentData] = useState<ChartData[]>([]);
    const [teacherData, setTeacherData] = useState<ChartData[]>([]);
    const [overviewStats, setOverviewStats] = useState<any>({});
    const [attendanceDistribution, setAttendanceDistribution] = useState<ChartData[]>([]);
    
    // Dropdown data
    const [batches, setBatches] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (dateRange) {
            fetchAllChartData();
        }
    }, [dateRange, selectedBatch, selectedTeacher]);

    // Fix the date picker onChange handler
    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([dates[0], dates[1]]);
        } else {
            setDateRange(null);
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

    const fetchAllChartData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());

            // Fetch trend analysis
            const trendResponse = await apiCall(`/attendance/analytics/trends?${params}`);
            if (trendResponse.ok) {
                const trendResult = await trendResponse.json();
                setTrendData(trendResult.data || []);
            }

            // Fetch overview stats
            const overviewResponse = await apiCall(`/attendance/reports/overview?${params}`);
            if (overviewResponse.ok) {
                const overviewResult = await overviewResponse.json();
                setOverviewStats(overviewResult);
                
                // Create attendance distribution data
                const distribution = [
                    { name: 'Present', value: overviewResult.attendance?.present || 0, color: '#52c41a' },
                    { name: 'Absent', value: overviewResult.attendance?.absent || 0, color: '#f5222d' },
                    { name: 'Late', value: overviewResult.attendance?.late || 0, color: '#faad14' }
                ];
                setAttendanceDistribution(distribution);
            }

            // Fetch batch data
            const batchResponse = await apiCall(`/attendance/reports/batches?${params}`);
            if (batchResponse.ok) {
                const batchResult = await batchResponse.json();
                setBatchData(batchResult.slice(0, 10)); // Top 10 batches
            }

            // Fetch student data
            const studentResponse = await apiCall(`/attendance/reports/students?${params}&limit=10`);
            if (studentResponse.ok) {
                const studentResult = await studentResponse.json();
                setStudentData(studentResult);
            }

            // Fetch teacher data
            const teacherResponse = await apiCall(`/attendance/reports/teachers?${params}`);
            if (teacherResponse.ok) {
                const teacherResult = await teacherResponse.json();
                setTeacherData(teacherResult);
            }

        } catch (error) {
            console.error('Error fetching chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                            {entry.name}: {entry.value}
                            {entry.name.includes('Rate') ? '%' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getTrendDirection = (data: ChartData[]) => {
        if (data.length < 2) return null;
        const first = data[0]?.attendance_rate || 0;
        const last = data[data.length - 1]?.attendance_rate || 0;
        return last > first ? 'up' : 'down';
    };

    const trendDirection = getTrendDirection(trendData);

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <BarChartOutlined /> Attendance Analytics & Charts
                </Title>
                <Text type="secondary">
                    Visual representation of attendance data and trends
                </Text>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Text strong>Date Range:</Text>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            style={{ width: '100%', marginTop: 4 }}
                        />
                    </Col>
                    <Col span={8}>
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
                    <Col span={8}>
                        <Text strong>Teacher Filter:</Text>
                        <Select
                            placeholder="All Teachers"
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            allowClear
                            style={{ width: '100%', marginTop: 4 }}
                        >
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                {/* Overview Statistics */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Overall Attendance Rate"
                                value={overviewStats.attendance?.overall_rate || 0}
                                suffix="%"
                                prefix={trendDirection === 'up' ? <RiseOutlined style={{ color: '#52c41a' }} /> : 
                                        trendDirection === 'down' ? <FallOutlined style={{ color: '#f5222d' }} /> : null}
                                valueStyle={{ color: trendDirection === 'up' ? '#52c41a' : trendDirection === 'down' ? '#f5222d' : '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Sessions"
                                value={overviewStats.summary?.total_sessions || 0}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Students"
                                value={overviewStats.summary?.total_students || 0}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Active Batches"
                                value={overviewStats.summary?.total_batches || 0}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Attendance Trend Chart */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={16}>
                        <Card title={<><LineChartOutlined /> Attendance Trend Over Time</>}>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="attendance_rate" 
                                        stroke="#1890ff" 
                                        strokeWidth={2}
                                        name="Attendance Rate (%)"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="present" 
                                        stroke="#52c41a" 
                                        strokeWidth={2}
                                        name="Present"
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="absent" 
                                        stroke="#f5222d" 
                                        strokeWidth={2}
                                        name="Absent"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card title={<><PieChartOutlined /> Attendance Distribution</>}>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={attendanceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {attendanceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Batch Performance Chart */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                        <Card title="Batch Attendance Performance">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={batchData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="batch_name" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="average_attendance_rate" fill="#1890ff" name="Attendance Rate (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title="Teacher Effectiveness">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={teacherData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="teacher_name" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="effectiveness_score" fill="#52c41a" name="Effectiveness Score" />
                                    <Bar dataKey="attendance_percentage" fill="#faad14" name="Attendance Rate (%)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Student Performance */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={24}>
                        <Card title="Top Student Attendance Performance">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={studentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="student_name" 
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area 
                                        type="monotone" 
                                        dataKey="attendance_percentage" 
                                        stackId="1"
                                        stroke="#1890ff" 
                                        fill="#1890ff"
                                        fillOpacity={0.6}
                                        name="Attendance Rate (%)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>
                    </Col>
                </Row>

                {/* Progress Indicators */}
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title="Batch Progress Overview">
                            <Row gutter={16}>
                                {batchData.slice(0, 4).map((batch, index) => (
                                    <Col span={6} key={index}>
                                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                            <Text strong>{batch.batch_name}</Text>
                                            <Progress
                                                type="circle"
                                                percent={Math.round(batch.average_attendance_rate)}
                                                size={80}
                                                strokeColor={
                                                    batch.average_attendance_rate >= 90 ? '#52c41a' :
                                                    batch.average_attendance_rate >= 75 ? '#faad14' : '#f5222d'
                                                }
                                            />
                                            <div style={{ marginTop: 8 }}>
                                                <Tag color={
                                                    batch.average_attendance_rate >= 90 ? 'green' :
                                                    batch.average_attendance_rate >= 75 ? 'orange' : 'red'
                                                }>
                                                    {batch.average_attendance_rate >= 90 ? 'Excellent' :
                                                     batch.average_attendance_rate >= 75 ? 'Good' : 'Needs Improvement'}
                                                </Tag>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* Insights */}
                {trendData.length > 0 && (
                    <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={24}>
                            <Alert
                                message="Attendance Insights"
                                description={
                                    <div>
                                        <p>
                                            <strong>Trend Analysis:</strong> Attendance is trending {trendDirection === 'up' ? 'upward' : 'downward'} 
                                            over the selected period.
                                        </p>
                                        <p>
                                            <strong>Best Performing Batch:</strong> {batchData[0]?.batch_name} with {batchData[0]?.average_attendance_rate}% attendance rate.
                                        </p>
                                        <p>
                                            <strong>Overall Health:</strong> {overviewStats.attendance?.overall_rate >= 85 ? 'Excellent attendance rates across the platform' : 
                                                                            overviewStats.attendance?.overall_rate >= 70 ? 'Good attendance with room for improvement' : 
                                                                            'Attendance rates need attention and improvement strategies'}
                                        </p>
                                    </div>
                                }
                                type={overviewStats.attendance?.overall_rate >= 85 ? 'success' : 
                                      overviewStats.attendance?.overall_rate >= 70 ? 'warning' : 'error'}
                                showIcon
                            />
                        </Col>
                    </Row>
                )}
            </Spin>
        </div>
    );
};

export default AttendanceCharts;