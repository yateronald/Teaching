import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Button,
    Typography,
    Tabs,
    Spin,
    Empty,
    message,
    Progress,
    Table,
    Tag
} from 'antd';
import {
    BarChartOutlined,
    LineChartOutlined,
    CalendarOutlined,
    RiseOutlined,
    FallOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ChartTitle,
    ChartTooltip,
    Legend
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
// Removed deprecated TabPane extraction

interface TrendData {
    date: string;
    attendance_rate: number;
    total_sessions: number;
    present_count: number;
    absent_count: number;
    trend_direction: 'up' | 'down' | 'stable';
}

interface ComparisonData {
    period: string;
    attendance_rate: number;
    total_sessions: number;
    present_count: number;
    absent_count: number;
    change_percentage: number;
}

interface PredictionData {
    date: string;
    predicted_rate: number;
    confidence_level: number;
    trend_direction: 'up' | 'down' | 'stable';
}

const AttendanceAnalytics: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [trendData, setTrendData] = useState<TrendData[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
    const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
    
    // Filters
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [comparisonType, setComparisonType] = useState<'period' | 'batch' | 'teacher'>('period');
    
    // Data for dropdowns
    const [batches, setBatches] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (dateRange) {
            fetchTrendAnalysis();
            fetchComparison();
            fetchPredictions();
        }
    }, [dateRange, selectedBatch, selectedTeacher, granularity, comparisonType]);

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

    const fetchTrendAnalysis = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            params.append('granularity', granularity);

            const response = await apiCall(`/attendance/analytics/trends?${params}`);
            if (response.ok) {
                const data = await response.json();
                setTrendData(Array.isArray(data.trends) ? data.trends : []);
            } else {
                setTrendData([]);
            }
        } catch (error) {
            console.error('Error fetching trend analysis:', error);
            message.error('Failed to load trend analysis');
        } finally {
            setLoading(false);
        }
    };

    const fetchComparison = async () => {
        try {
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());
            params.append('type', comparisonType);

            const response = await apiCall(`/attendance/analytics/compare?${params}`);
            if (response.ok) {
                const data = await response.json();
                setComparisonData(Array.isArray(data.comparisons) ? data.comparisons : []);
            } else {
                setComparisonData([]);
            }
        } catch (error) {
            console.error('Error fetching comparison data:', error);
        }
    };

    const fetchPredictions = async () => {
        try {
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
                params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
            }
            if (selectedBatch) params.append('batch_id', selectedBatch.toString());
            if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());

            const response = await apiCall(`/attendance/analytics/predictions?${params}`);
            if (response.ok) {
                const data = await response.json();
                setPredictionData(Array.isArray(data.predictions) ? data.predictions : []);
            } else {
                setPredictionData([]);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
        }
    };

    // Chart data preparation
    const trendChartData = {
        labels: trendData.map(d => dayjs(d.date).format('MMM DD')),
        datasets: [
            {
                label: 'Attendance Rate (%)',
                data: trendData.map(d => d.attendance_rate),
                borderColor: 'rgba(24, 144, 255, 1)',
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                tension: 0.4,
            },
            {
                label: 'Total Sessions',
                data: trendData.map(d => d.total_sessions),
                borderColor: 'rgba(82, 196, 26, 1)',
                backgroundColor: 'rgba(82, 196, 26, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
            },
        ],
    };

    const comparisonChartData = {
        labels: comparisonData.map(d => d.period),
        datasets: [
            {
                label: 'Attendance Rate (%)',
                data: comparisonData.map(d => d.attendance_rate),
                backgroundColor: comparisonData.map(d => 
                    d.change_percentage > 0 ? 'rgba(82, 196, 26, 0.8)' : 
                    d.change_percentage < 0 ? 'rgba(255, 77, 79, 0.8)' : 
                    'rgba(24, 144, 255, 0.8)'
                ),
            },
        ],
    };

    const predictionChartData = {
        labels: predictionData.map(d => dayjs(d.date).format('MMM DD')),
        datasets: [
            {
                label: 'Predicted Attendance Rate (%)',
                data: predictionData.map(d => d.predicted_rate),
                borderColor: 'rgba(250, 140, 22, 1)',
                backgroundColor: 'rgba(250, 140, 22, 0.1)',
                borderDash: [5, 5],
                tension: 0.4,
            },
            {
                label: 'Confidence Level (%)',
                data: predictionData.map(d => d.confidence_level),
                borderColor: 'rgba(114, 46, 209, 1)',
                backgroundColor: 'rgba(114, 46, 209, 0.1)',
                yAxisID: 'y1',
                tension: 0.4,
            },
        ],
    };

    const comparisonColumns = [
        {
            title: 'Period',
            dataIndex: 'period',
            key: 'period',
        },
        {
            title: 'Attendance Rate',
            dataIndex: 'attendance_rate',
            key: 'attendance_rate',
            render: (rate: number) => (
                <Progress 
                    percent={Math.round(rate)} 
                    size="small"
                    status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
                />
            ),
        },
        {
            title: 'Sessions',
            dataIndex: 'total_sessions',
            key: 'total_sessions',
        },
        {
            title: 'Present',
            dataIndex: 'present_count',
            key: 'present_count',
        },
        {
            title: 'Absent',
            dataIndex: 'absent_count',
            key: 'absent_count',
        },
        {
            title: 'Change',
            dataIndex: 'change_percentage',
            key: 'change_percentage',
            render: (change: number) => (
                <Tag 
                    color={change > 0 ? 'green' : change < 0 ? 'red' : 'blue'}
                    icon={change > 0 ? <RiseOutlined /> : change < 0 ? <FallOutlined /> : null}
                >
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </Tag>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <LineChartOutlined /> Attendance Analytics
                </Title>
                <Text type="secondary">
                    Advanced time-based analytics, comparisons, and predictions for attendance data
                </Text>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
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
                    <Col span={4}>
                        <Select
                            placeholder="Select Teacher"
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {teachers.map(teacher => (
                                <Option key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            value={granularity}
                            onChange={setGranularity}
                            style={{ width: '100%' }}
                        >
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            value={comparisonType}
                            onChange={setComparisonType}
                            style={{ width: '100%' }}
                        >
                            <Option value="period">Period</Option>
                            <Option value="batch">Batch</Option>
                            <Option value="teacher">Teacher</Option>
                        </Select>
                    </Col>
                    <Col span={2}>
                        <Button 
                            type="primary" 
                            icon={<CalendarOutlined />}
                            onClick={() => {
                                fetchTrendAnalysis();
                                fetchComparison();
                                fetchPredictions();
                            }}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                <Tabs 
                    defaultActiveKey="trends"
                    items={[
                        {
                            key: 'trends',
                            label: <span><LineChartOutlined />Trend Analysis</span>,
                            children: (
                        <Card>
                            {trendData.length > 0 ? (
                                <Line 
                                    data={trendChartData}
                                    options={{
                                        responsive: true,
                                        interaction: {
                                            mode: 'index' as const,
                                            intersect: false,
                                        },
                                        plugins: {
                                            legend: {
                                                position: 'top' as const,
                                            },
                                            title: {
                                                display: true,
                                                text: 'Attendance Trends Over Time',
                                            },
                                        },
                                        scales: {
                                            x: {
                                                display: true,
                                                title: {
                                                    display: true,
                                                    text: 'Date',
                                                },
                                            },
                                            y: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'left' as const,
                                                title: {
                                                    display: true,
                                                    text: 'Attendance Rate (%)',
                                                },
                                                min: 0,
                                                max: 100,
                                            },
                                            y1: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'right' as const,
                                                title: {
                                                    display: true,
                                                    text: 'Sessions',
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Empty description="No trend data available" />
                            )}
                        </Card>
                            )
                        },
                        {
                            key: 'comparison',
                            label: <span><BarChartOutlined />Comparison</span>,
                            children: (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card title="Comparison Chart">
                                    {comparisonData.length > 0 ? (
                                        <Bar 
                                            data={comparisonChartData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top' as const,
                                                    },
                                                    title: {
                                                        display: true,
                                                        text: 'Period Comparison',
                                                    },
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        max: 100,
                                                        title: {
                                                            display: true,
                                                            text: 'Attendance Rate (%)',
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    ) : (
                                        <Empty description="No comparison data available" />
                                    )}
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card title="Detailed Comparison">
                                    <Table
                                        columns={comparisonColumns}
                                        dataSource={Array.isArray(comparisonData) ? comparisonData : []}
                                        rowKey="period"
                                        pagination={false}
                                        size="small"
                                    />
                                </Card>
                            </Col>
                        </Row>
                            )
                        },
                        {
                            key: 'predictions',
                            label: <span><RiseOutlined />Predictions</span>,
                            children: (
                        <Card>
                            {predictionData.length > 0 ? (
                                <Line 
                                    data={predictionChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top' as const,
                                            },
                                            title: {
                                                display: true,
                                                text: 'Attendance Predictions',
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100,
                                                title: {
                                                    display: true,
                                                    text: 'Predicted Rate (%)',
                                                },
                                            },
                                            y1: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'right' as const,
                                                title: {
                                                    display: true,
                                                    text: 'Confidence (%)',
                                                },
                                                grid: {
                                                    drawOnChartArea: false,
                                                },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Empty description="No prediction data available" />
                            )}
                        </Card>
                            )
                        }
                    ]}
                />
            </Spin>
        </div>
    );
};

export default AttendanceAnalytics;