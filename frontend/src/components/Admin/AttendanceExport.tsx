import React, { useState } from 'react';
import {
    Card,
    Row,
    Col,
    Select,
    DatePicker,
    Button,
    Typography,
    Space,
    Checkbox,
    Radio,
    message,
    Progress,
    Alert,
    Divider
} from 'antd';
import {
    DownloadOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    ExportOutlined,
    CalendarOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf';
    includeCharts: boolean;
    includeDetails: boolean;
    includeSummary: boolean;
}

const AttendanceExport: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    
    // Filters
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>([
        dayjs().subtract(30, 'days'),
        dayjs()
    ]);
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
    const [reportType, setReportType] = useState<string>('overview');
    
    // Export options
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'excel',
        includeCharts: true,
        includeDetails: true,
        includeSummary: true
    });
    
    // Data for dropdowns
    const [batches, setBatches] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    
    const { apiCall } = useAuth();

    React.useEffect(() => {
        fetchBatches();
        fetchTeachers();
    }, []);

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

    const generateCSVData = async () => {
        const params = new URLSearchParams();
        if (dateRange && dateRange[0] && dateRange[1]) {
            params.append('date_from', dateRange[0].format('YYYY-MM-DD'));
            params.append('date_to', dateRange[1].format('YYYY-MM-DD'));
        }
        if (selectedBatch) params.append('batch_id', selectedBatch.toString());
        if (selectedTeacher) params.append('teacher_id', selectedTeacher.toString());

        let csvContent = '';
        let filename = '';

        switch (reportType) {
            case 'overview':
                const overviewResponse = await apiCall(`/attendance/reports/overview?${params}`);
                if (overviewResponse.ok) {
                    const data = await overviewResponse.json();
                    csvContent = generateOverviewCSV(data);
                    filename = 'attendance_overview.csv';
                }
                break;
            
            case 'batches':
                const batchResponse = await apiCall(`/attendance/reports/batches?${params}`);
                if (batchResponse.ok) {
                    const data = await batchResponse.json();
                    csvContent = generateBatchCSV(data);
                    filename = 'batch_attendance.csv';
                }
                break;
            
            case 'students':
                const studentResponse = await apiCall(`/attendance/reports/students?${params}`);
                if (studentResponse.ok) {
                    const data = await studentResponse.json();
                    csvContent = generateStudentCSV(data);
                    filename = 'student_attendance.csv';
                }
                break;
            
            case 'teachers':
                const teacherResponse = await apiCall(`/attendance/reports/teachers?${params}`);
                if (teacherResponse.ok) {
                    const data = await teacherResponse.json();
                    csvContent = generateTeacherCSV(data);
                    filename = 'teacher_performance.csv';
                }
                break;
            
            case 'sessions':
                const sessionResponse = await apiCall(`/attendance/sessions?${params}`);
                if (sessionResponse.ok) {
                    const data = await sessionResponse.json();
                    csvContent = generateSessionCSV(data);
                    filename = 'session_details.csv';
                }
                break;
        }

        return { csvContent, filename };
    };

    const generateOverviewCSV = (data: any) => {
        let csv = 'Metric,Value\n';
        csv += `Total Sessions,${data.summary.total_sessions}\n`;
        csv += `Total Students,${data.summary.total_students}\n`;
        csv += `Total Teachers,${data.summary.total_teachers}\n`;
        csv += `Total Batches,${data.summary.total_batches}\n`;
        csv += `Overall Attendance Rate,${data.attendance.overall_rate}%\n`;
        csv += `Present Count,${data.attendance.present}\n`;
        csv += `Absent Count,${data.attendance.absent}\n`;
        csv += `Late Count,${data.attendance.late}\n`;
        return csv;
    };

    const generateBatchCSV = (data: any[]) => {
        let csv = 'Batch Name,Teacher,Total Sessions,Sessions with Codes,Total Students,Attendance Rate,Present,Absent,Late\n';
        data.forEach(batch => {
            csv += `"${batch.batch_name}","${batch.teacher_name}",${batch.total_sessions},${batch.sessions_with_codes},${batch.total_students},${batch.average_attendance_rate}%,${batch.present_count},${batch.absent_count},${batch.late_count}\n`;
        });
        return csv;
    };

    const generateStudentCSV = (data: any[]) => {
        let csv = 'Student Name,Email,Batch,Total Sessions,Present,Absent,Late,Attendance Rate\n';
        data.forEach(student => {
            csv += `"${student.student_name}","${student.student_email}","${student.batch_name}",${student.total_sessions},${student.present_sessions},${student.absent_sessions},${student.late_sessions},${student.attendance_percentage}%\n`;
        });
        return csv;
    };

    const generateTeacherCSV = (data: any[]) => {
        let csv = 'Teacher Name,Email,Batch,Total Sessions,Sessions with Codes,Sessions Started,Attendance Rate,Code Generation Rate,Effectiveness Score\n';
        data.forEach(teacher => {
            csv += `"${teacher.teacher_name}","${teacher.teacher_email}","${teacher.batch_name}",${teacher.total_sessions},${teacher.sessions_with_codes},${teacher.sessions_started},${teacher.attendance_percentage}%,${teacher.code_generation_percentage}%,${teacher.effectiveness_score}\n`;
        });
        return csv;
    };

    const generateSessionCSV = (data: any[]) => {
        let csv = 'Session Title,Date,Time,Batch,Teacher,Total Students,Present,Absent,Late,Attendance Rate,Code Generated,Session Started\n';
        data.forEach(session => {
            csv += `"${session.schedule_title}","${session.session_date}","${session.start_time} - ${session.end_time}","${session.batch_name}","${session.teacher_name}",${session.total_students},${session.present_count},${session.absent_count},${session.late_count},${session.attendance_percentage}%,${session.code_generated ? 'Yes' : 'No'},${session.session_started ? 'Yes' : 'No'}\n`;
        });
        return csv;
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async () => {
        if (!dateRange) {
            message.error('Please select a date range');
            return;
        }

        setLoading(true);
        setShowProgress(true);
        setExportProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setExportProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            const { csvContent, filename } = await generateCSVData();
            
            clearInterval(progressInterval);
            setExportProgress(100);

            if (csvContent) {
                downloadCSV(csvContent, filename);
                message.success('Export completed successfully!');
            } else {
                message.error('No data available for export');
            }

            setTimeout(() => {
                setShowProgress(false);
                setExportProgress(0);
            }, 1000);

        } catch (error) {
            console.error('Export error:', error);
            message.error('Export failed. Please try again.');
            setShowProgress(false);
            setExportProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const getReportTypeIcon = (type: string) => {
        switch (type) {
            case 'overview': return <CalendarOutlined />;
            case 'batches': return <FilterOutlined />;
            case 'students': return <FileTextOutlined />;
            case 'teachers': return <FileTextOutlined />;
            case 'sessions': return <CalendarOutlined />;
            default: return <FileTextOutlined />;
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <ExportOutlined /> Export Attendance Data
                </Title>
                <Text type="secondary">
                    Export comprehensive attendance reports in various formats
                </Text>
            </div>

            <Row gutter={16}>
                <Col span={16}>
                    <Card title="Export Configuration">
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                            {/* Date Range */}
                            <div>
                                <Text strong>Date Range</Text>
                                <RangePicker
                                    value={dateRange}
                                    onChange={(dates) => setDateRange(dates)}
                                    style={{ width: '100%', marginTop: 8 }}
                                />
                            </div>

                            {/* Filters */}
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Text strong>Batch Filter</Text>
                                    <Select
                                        placeholder="All Batches"
                                        value={selectedBatch}
                                        onChange={setSelectedBatch}
                                        allowClear
                                        style={{ width: '100%', marginTop: 8 }}
                                    >
                                        {batches.map(batch => (
                                            <Option key={batch.id} value={batch.id}>
                                                {batch.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <Text strong>Teacher Filter</Text>
                                    <Select
                                        placeholder="All Teachers"
                                        value={selectedTeacher}
                                        onChange={setSelectedTeacher}
                                        allowClear
                                        style={{ width: '100%', marginTop: 8 }}
                                    >
                                        {teachers.map(teacher => (
                                            <Option key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>

                            {/* Report Type */}
                            <div>
                                <Text strong>Report Type</Text>
                                <Radio.Group 
                                    value={reportType} 
                                    onChange={(e) => setReportType(e.target.value)}
                                    style={{ marginTop: 8, width: '100%' }}
                                >
                                    <Space direction="vertical">
                                        <Radio value="overview">
                                            {getReportTypeIcon('overview')} Overview Summary
                                        </Radio>
                                        <Radio value="batches">
                                            {getReportTypeIcon('batches')} Batch Analytics
                                        </Radio>
                                        <Radio value="students">
                                            {getReportTypeIcon('students')} Student Tracking
                                        </Radio>
                                        <Radio value="teachers">
                                            {getReportTypeIcon('teachers')} Teacher Performance
                                        </Radio>
                                        <Radio value="sessions">
                                            {getReportTypeIcon('sessions')} Session Details
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </div>

                            <Divider />

                            {/* Export Format */}
                            <div>
                                <Text strong>Export Format</Text>
                                <Radio.Group 
                                    value={exportOptions.format} 
                                    onChange={(e) => setExportOptions({...exportOptions, format: e.target.value})}
                                    style={{ marginTop: 8 }}
                                >
                                    <Radio.Button value="csv">
                                        <FileTextOutlined /> CSV
                                    </Radio.Button>
                                    <Radio.Button value="excel" disabled>
                                        <FileExcelOutlined /> Excel (Coming Soon)
                                    </Radio.Button>
                                    <Radio.Button value="pdf" disabled>
                                        <FilePdfOutlined /> PDF (Coming Soon)
                                    </Radio.Button>
                                </Radio.Group>
                            </div>

                            {/* Export Options */}
                            <div>
                                <Text strong>Include Options</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Space direction="vertical">
                                        <Checkbox 
                                            checked={exportOptions.includeSummary}
                                            onChange={(e) => setExportOptions({...exportOptions, includeSummary: e.target.checked})}
                                        >
                                            Summary Statistics
                                        </Checkbox>
                                        <Checkbox 
                                            checked={exportOptions.includeDetails}
                                            onChange={(e) => setExportOptions({...exportOptions, includeDetails: e.target.checked})}
                                        >
                                            Detailed Records
                                        </Checkbox>
                                        <Checkbox 
                                            checked={exportOptions.includeCharts}
                                            onChange={(e) => setExportOptions({...exportOptions, includeCharts: e.target.checked})}
                                            disabled={exportOptions.format === 'csv'}
                                        >
                                            Charts and Visualizations
                                        </Checkbox>
                                    </Space>
                                </div>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Export Summary">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Text type="secondary">Date Range:</Text>
                                <div>
                                    <Text strong>
                                        {dateRange && dateRange[0] && dateRange[1] ? 
                                            `${dateRange[0].format('MMM DD, YYYY')} - ${dateRange[1].format('MMM DD, YYYY')}` : 
                                            'Not selected'
                                        }
                                    </Text>
                                </div>
                            </div>

                            <div>
                                <Text type="secondary">Report Type:</Text>
                                <div>
                                    <Text strong>{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</Text>
                                </div>
                            </div>

                            <div>
                                <Text type="secondary">Format:</Text>
                                <div>
                                    <Text strong>{exportOptions.format.toUpperCase()}</Text>
                                </div>
                            </div>

                            <div>
                                <Text type="secondary">Filters:</Text>
                                <div>
                                    {selectedBatch && (
                                        <div>Batch: <Text strong>{batches.find(b => b.id === selectedBatch)?.name}</Text></div>
                                    )}
                                    {selectedTeacher && (
                                        <div>Teacher: <Text strong>{teachers.find(t => t.id === selectedTeacher)?.name}</Text></div>
                                    )}
                                    {!selectedBatch && !selectedTeacher && (
                                        <Text type="secondary">No filters applied</Text>
                                    )}
                                </div>
                            </div>

                            <Divider />

                            {showProgress && (
                                <div>
                                    <Text strong>Export Progress</Text>
                                    <Progress percent={exportProgress} status="active" />
                                </div>
                            )}

                            <Button 
                                type="primary" 
                                size="large"
                                icon={<DownloadOutlined />}
                                onClick={handleExport}
                                loading={loading}
                                disabled={!dateRange || !dateRange[0] || !dateRange[1]}
                                block
                            >
                                Export Data
                            </Button>

                            <Alert
                                message="Export Information"
                                description="Currently only CSV format is supported. Excel and PDF formats will be available soon."
                                type="info"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AttendanceExport;