import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    message,
    Space,
    Typography,
    Card,
    DatePicker,
    TimePicker,
    Checkbox,
    Row,
    Col,
    Divider,
    Dropdown,
    Skeleton,
    ConfigProvider,
    Radio
} from 'antd';
import {
    PlusOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    BookOutlined,
    LineChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Batch {
    id: number;
    name: string;
    french_level: string;
    teacher_id: number;
    teacher_first_name?: string;
    teacher_last_name?: string;
    start_date: string;
    end_date: string;
    student_count: number;
    created_at: string;
    timezone?: string;
    default_location_mode?: string;
    default_location?: string;
    default_link?: string;
}

interface Person {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

const BatchManagement: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<Person[]>([]);
    const [students, setStudents] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [form] = Form.useForm();
    const { apiCall } = useAuth();
    const navigate = useNavigate();

    // Filter & Selection state
    const [searchText, setSearchText] = useState('');
    const [selectedTeacherFilters, setSelectedTeacherFilters] = useState<number[]>([]);
    const [dateRangeFilter, setDateRangeFilter] = useState<any>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // Timetable state
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [scheduleType, setScheduleType] = useState<'all' | 'workdays' | 'weekends' | 'custom'>('custom');
    const [timetableEntries, setTimetableEntries] = useState<any[]>([]);
    const [scheduleMode, setScheduleMode] = useState<'same' | 'different'>('different');
    const [masterSchedule, setMasterSchedule] = useState({
        start_time: '09:00',
        end_time: '10:00',
        timezone: 'UTC',
        location_mode: 'online',
        location: '',
        link: ''
    });

    useEffect(() => {
        fetchBatches();
        fetchTeachers();
        fetchStudents();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/batches');
            if (response.ok) {
                const data = await response.json();
                // Backend returns an array directly
                setBatches(Array.isArray(data) ? data : (data.batches || []));
            } else {
                message.error('Failed to fetch batches');
            }
        } catch (error) {
            message.error('Error fetching batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchTeachers = async () => {
        try {
            // Use dedicated teachers endpoint and handle array response
            const response = await apiCall('/users/role/teachers');
            if (response.ok) {
                const data = await response.json();
                setTeachers(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await apiCall('/users/role/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(Array.isArray(data) ? data : (data.users || []));
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleEdit = async (batch: Batch) => {
        setEditingBatch(batch);
        form.setFieldsValue({
            name: batch.name,
            french_level: batch.french_level,
            teacher_id: batch.teacher_id,
            dateRange: [
                dayjs(batch.start_date),
                dayjs(batch.end_date)
            ],
            timezone: batch.timezone || 'UTC',
            default_location_mode: batch.default_location_mode || 'online',
            default_location: batch.default_location || '',
            default_link: batch.default_link || '',
        });
        // Prefill defaults from batch details endpoint if available
        try {
            // Fetch timetable for this batch
            const ttRes = await apiCall(`/batches/${batch.id}/timetable`);
            if (ttRes.ok) {
                const tt = await ttRes.json();
                if (Array.isArray(tt) && tt.length > 0) {
                    const days = tt.map((e: any) => e.day_of_week);
                    setSelectedDays(days);
                    setScheduleType(days.length === 7 ? 'all' : (days.length === 5 && days.includes(1) && days.includes(5) ? 'workdays' : 'custom'));
                    setScheduleMode('different');
                    // Normalize entries to expected shape
                    const normalized = tt.map((e: any) => ({
                        day_of_week: Number(e.day_of_week),
                        start_time: e.start_time,
                        end_time: e.end_time,
                        timezone: e.timezone || 'UTC',
                        location_mode: e.location_mode || 'online',
                        location: e.location || '',
                        link: e.link || ''
                    }));
                    setTimetableEntries(normalized);
                } else {
                    setSelectedDays([]);
                    setTimetableEntries([]);
                }
            }
        } catch (e) {
            console.warn('Failed to prefill timetable', e);
        }
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingBatch(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            setSubmitting(true);
            const baseData: any = {
                name: values.name,
                teacher_id: values.teacher_id,
                french_level: values.french_level,
                // Send ISO8601 strings to match backend validator
                start_date: values.dateRange[0].toDate().toISOString(),
                end_date: values.dateRange[1].toDate().toISOString(),
                // Defaults for timetable
                timezone: values.timezone || 'UTC',
                default_location_mode: values.default_location_mode || 'physical',
                default_location: values.default_location,
                default_link: values.default_link,
            };

            // Only attach timetable if there are entries
            const hasTimetable = Array.isArray(timetableEntries) && timetableEntries.length > 0;
            if (hasTimetable) {
                baseData.timetable = timetableEntries.map(e => ({
                    day_of_week: e.day_of_week,
                    start_time: e.start_time,
                    end_time: e.end_time,
                    timezone: e.timezone,
                    location_mode: e.location_mode,
                    location: e.location,
                    link: e.link,
                }));
            }

            const endpoint = editingBatch ? `/batches/${editingBatch.id}` : '/batches';
            const method = editingBatch ? 'PUT' : 'POST';

            // On create, backend requires student_ids array (min 1)
            const body = editingBatch
                ? baseData
                : { ...baseData, student_ids: values.student_ids };
            
            const response = await apiCall(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                message.success(`Batch ${editingBatch ? 'updated' : 'created'} successfully`);
                setModalVisible(false);
                form.resetFields();
                setEditingBatch(null);
                // Reset timetable state
                setSelectedDays([]);
                setScheduleType('custom');
                setTimetableEntries([]);
                setScheduleMode('different');
                setMasterSchedule({
                    start_time: '09:00',
                    end_time: '10:00',
                    timezone: 'UTC',
                    location_mode: 'online',
                    location: '',
                    link: ''
                });
                fetchBatches();
            } else {
                const errorData = await response.json();
                message.error(errorData.error || errorData.message || 'Operation failed');
            }
        } catch (error) {
            message.error('Error saving batch');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (batchId: number) => {
        try {
            const response = await apiCall(`/batches/${batchId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                message.success('Batch deleted successfully');
                fetchBatches();
            } else {
                message.error('Failed to delete batch');
            }
        } catch (error) {
            message.error('Error deleting batch');
        }
    };

    // Timetable helper functions
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timezones = [
        'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
        'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
    ];

    const handleScheduleTypeChange = (type: 'all' | 'workdays' | 'weekends' | 'custom') => {
        setScheduleType(type);
        let days: number[] = [];
        
        switch (type) {
            case 'all':
                days = [0, 1, 2, 3, 4, 5, 6];
                break;
            case 'workdays':
                days = [1, 2, 3, 4, 5];
                break;
            case 'weekends':
                days = [0, 6];
                break;
            case 'custom':
                days = selectedDays;
                break;
        }
        
        setSelectedDays(days);
        updateTimetableEntries(days);
    };

    const updateTimetableEntries = (days: number[]) => {
        const newEntries = days.map(day => {
            const existing = timetableEntries.find(entry => entry.day_of_week === day);
            return existing || {
                day_of_week: day,
                start_time: '09:00',
                end_time: '10:00',
                timezone: 'UTC',
                location_mode: 'physical',
                location: '',
                link: ''
            };
        });
        setTimetableEntries(newEntries);
    };

    const updateTimetableEntry = (dayOfWeek: number, field: string, value: any) => {
        setTimetableEntries(prev => 
            prev.map(entry => 
                entry.day_of_week === dayOfWeek 
                    ? { ...entry, [field]: value }
                    : entry
            )
        );
    };

    const handleScheduleModeChange = (mode: 'same' | 'different') => {
        setScheduleMode(mode);
        
        // If switching to 'same' mode, apply master schedule to all entries
        if (mode === 'same' && timetableEntries.length > 0) {
            setTimetableEntries(prev => 
                prev.map(entry => ({
                    ...entry,
                    start_time: masterSchedule.start_time,
                    end_time: masterSchedule.end_time,
                    timezone: masterSchedule.timezone,
                    location_mode: masterSchedule.location_mode,
                    location: masterSchedule.location,
                    link: masterSchedule.link
                }))
            );
        }
    };

    // Helper to format duration as days only
    const formatDaysOnly = (startISO: string, endISO: string) => {
        const start = new Date(startISO);
        const end = new Date(endISO);
        const startTime = start.getTime();
        const endTime = end.getTime();
        const diff = endTime - startTime;
        if (Number.isNaN(startTime) || Number.isNaN(endTime) || diff < 0) return '—';
        const dayMs = 24 * 60 * 60 * 1000;
        const days = Math.floor(diff / dayMs);
        return `${days} day${days !== 1 ? 's' : ''}`;
    };

    const getLevelStyle = (level: string) => {
        if (level.startsWith('A')) return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
        if (level.startsWith('B')) return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
        if (level.startsWith('C')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
        return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    };

    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    };

    const columns: ColumnsType<Batch> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            fixed: 'left',
            render: (name: string, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}>
                        {name ? name.substring(0, 2).toUpperCase() : 'B'}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, lineHeight: 1.3 }}>
                            {name}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            ID: {record.id}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Level',
            dataIndex: 'french_level',
            key: 'french_level',
            width: 100,
            render: (level: string) => {
                const s = getLevelStyle(level);
                return (
                    <span style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: s.bg,
                        color: s.color,
                        border: `1px solid ${s.border}`,
                    }}>
                        {level}
                    </span>
                );
            },
        },
        {
            title: 'Teacher',
            dataIndex: 'teacher_id',
            key: 'teacher_name',
            width: 180,
            render: (_, record) => {
                let name = 'N/A';
                if (record.teacher_first_name || record.teacher_last_name) {
                    name = `${record.teacher_first_name || ''} ${record.teacher_last_name || ''}`.trim();
                } else {
                    const teacher = teachers.find(t => t.id === record.teacher_id);
                    if (teacher) name = `${teacher.first_name} ${teacher.last_name}`;
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: '#f1f5f9', color: '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 700,
                            border: '1px solid #e2e8f0'
                        }}>
                            {getInitials(name)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>{name}</span>
                    </div>
                );
            },
        },
        {
            title: 'Duration',
            key: 'duration',
            width: 140,
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                        {formatDaysOnly(record.start_date, record.end_date)}
                    </span>
                </div>
            ),
        },
        {
            title: 'Students',
            dataIndex: 'student_count',
            key: 'students',
            width: 110,
            align: 'center',
            render: (count: number) => (
                <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    color: count > 0 ? '#3b82f6' : '#94a3b8',
                    background: count > 0 ? '#eff6ff' : '#f8fafc',
                }}>
                    {count || 0}
                </span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                const actionItems = [
                    {
                        key: 'edit',
                        icon: <EditOutlined style={{ color: '#6366f1' }} />,
                        label: <span style={{ color: '#1e293b' }}>Edit Batch</span>,
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'insights',
                        icon: <LineChartOutlined style={{ color: '#10b981' }} />,
                        label: <span style={{ color: '#1e293b' }}>View Insights</span>,
                        onClick: () => navigate(`/app/batches/${record.id}/insights`),
                    },
                    {
                        type: 'divider' as const,
                    },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined style={{ color: '#ef4444' }} />,
                        label: <span style={{ color: '#ef4444' }}>Delete Batch</span>,
                        onClick: () => {
                            Modal.confirm({
                                title: 'Delete Batch',
                                content: `Are you sure you want to delete ${record.name}? This action cannot be undone.`,
                                okText: 'Yes, Delete',
                                cancelText: 'Cancel',
                                okType: 'danger',
                                onOk: () => handleDelete(record.id),
                            });
                        },
                    },
                ];

                return (
                    <Space size="small">
                        <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/app/batches/${record.id}/insights`)}
                            title="View Insights"
                            style={{
                                borderRadius: 8,
                                height: 30, width: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6366f1',
                                background: '#eef2ff',
                                border: 'none',
                            }}
                        />
                        <Dropdown
                            menu={{ items: actionItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                size="small"
                                icon={<MoreOutlined />}
                                style={{ 
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    height: 30, width: 30,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f8fafc',
                                    transition: 'all 0.2s ease'
                                }}
                                title="More Actions"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#eef2ff';
                                    e.currentTarget.style.borderColor = '#c7d2fe';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    // KPI Dashboard Stats
    const totalBatches = batches.length;
    const totalStudents = batches.reduce((acc, b) => acc + (b.student_count || 0), 0);
    const activeTeachers = new Set(batches.map(b => b.teacher_id)).size;
    const recentBatchesCount = batches.filter(b => {
        const d = new Date(b.created_at || b.start_date);
        const now = new Date();
        return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
    }).length;

    // Computed Filtered List
    const filteredBatches = useMemo(() => {
        return batches.filter(b => {
            const matchName = b.name.toLowerCase().includes(searchText.toLowerCase());
            const matchTeacher = selectedTeacherFilters.length === 0 || selectedTeacherFilters.includes(b.teacher_id);
            const matchDate = !dateRangeFilter || (
                dayjs(b.start_date).isBefore(dateRangeFilter[1]) && dayjs(b.end_date).isAfter(dateRangeFilter[0])
            );
            return matchName && matchTeacher && matchDate;
        });
    }, [batches, searchText, selectedTeacherFilters, dateRangeFilter]);

    // Full-page Skeleton
    if (loading && batches.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
                <div style={{ flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div>
                            <Skeleton.Input active style={{ width: 220, height: 26, borderRadius: 8 }} />
                            <div style={{ marginTop: 8 }}>
                                <Skeleton.Input active style={{ width: 360, height: 14, borderRadius: 6 }} />
                            </div>
                        </div>
                        <Skeleton.Button active style={{ width: 140, height: 40, borderRadius: 10 }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 20 }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ borderRadius: 14, padding: '14px 16px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 10 }} />
                                <div style={{ flex: 1 }}>
                                    <Skeleton.Input active style={{ width: '60%', height: 10, borderRadius: 4, marginBottom: 8 }} block />
                                    <Skeleton.Input active style={{ width: 36, height: 22, borderRadius: 6 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <Skeleton.Avatar active size={30} shape="square" style={{ borderRadius: 9 }} />
                        <Skeleton.Input active style={{ width: 120, height: 16, borderRadius: 4 }} />
                    </div>
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', gap: 24 }}>
                        {[140, 100, 140, 100, 80, 80].map((w, i) => (
                            <Skeleton.Input key={i} active style={{ width: w, height: 12, borderRadius: 4 }} />
                        ))}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 0', borderBottom: '1px solid #f8f9fb' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 140 }}>
                                    <Skeleton.Avatar active size={34} shape="square" style={{ borderRadius: 10 }} />
                                    <div>
                                        <Skeleton.Input active style={{ width: 90, height: 12, borderRadius: 4, marginBottom: 4 }} />
                                        <Skeleton.Input active style={{ width: 40, height: 9, borderRadius: 4 }} />
                                    </div>
                                </div>
                                <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 12 }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140 }}>
                                    <Skeleton.Avatar active size={24} shape="circle" />
                                    <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 4 }} />
                                </div>
                                <Skeleton.Input active style={{ width: 70, height: 12, borderRadius: 4 }} />
                                <Skeleton.Input active style={{ width: 30, height: 14, borderRadius: 6 }} />
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <Skeleton.Avatar active size={28} shape="square" style={{ borderRadius: 8 }} />
                                    <Skeleton.Avatar active size={28} shape="square" style={{ borderRadius: 8 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
            {/* Fixed Header Area */}
            <div style={{ flexShrink: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
                            Batch Management
                        </div>
                        <Typography.Text style={{ fontSize: 13, color: '#94a3b8' }}>
                            Organize classes, assign teachers, and manage learning cohorts
                        </Typography.Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        style={{ borderRadius: 10, fontWeight: 600, height: 40, background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                    >
                        Add New Batch
                    </Button>
                </div>

                {/* KPI Dashboard */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 20 }}>
                    {[
                        { label: 'Total Batches', value: totalBatches, icon: <BookOutlined />, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', accent: '#6366f1' },
                        { label: 'Enrolled Students', value: totalStudents, icon: <TeamOutlined />, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', accent: '#3b82f6' },
                        { label: 'Active Teachers', value: activeTeachers, icon: <EditOutlined />, gradient: 'linear-gradient(135deg, #10b981, #34d399)', accent: '#10b981' },
                        { label: 'New Batches (30d)', value: recentBatchesCount, icon: <CalendarOutlined />, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', accent: '#f59e0b' },
                    ].map((kpi, i) => (
                        <div key={i} style={{
                            borderRadius: 14, padding: '14px 16px',
                            background: '#fff', border: '1px solid #f0f0f8',
                            boxShadow: '0 2px 12px rgba(99,102,241,0.04)',
                            display: 'flex', alignItems: 'center', gap: 12,
                            transition: 'all 0.2s ease', cursor: 'default',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.04)'; }}
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
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{kpi.label}</div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{kpi.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Container — fills remaining height */}
            <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5fa', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 9, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontSize: 14 }}>
                                <BookOutlined />
                            </div>
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Batch Directory</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 12 }}>{filteredBatches.length} of {totalBatches} total</span>
                        </div>
                        {selectedRowKeys.length > 0 && (
                            <Space>
                                <span style={{ fontSize: 13, color: '#64748b' }}>{selectedRowKeys.length} selected</span>
                                <Button size="small" danger onClick={() => {
                                    Modal.confirm({
                                        title: 'Delete Multiple Batches',
                                        content: `Are you sure you want to delete ${selectedRowKeys.length} batches?`,
                                        onOk: () => {
                                            selectedRowKeys.forEach(key => handleDelete(key as number));
                                            setSelectedRowKeys([]);
                                        }
                                    });
                                }}>Delete Selected</Button>
                            </Space>
                        )}
                    </div>
                    {/* Advanced Filter Bar */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Input.Search 
                            placeholder="Search batch name..." 
                            allowClear 
                            onChange={e => setSearchText(e.target.value)} 
                            style={{ width: 250 }} 
                        />
                        <Select
                            mode="multiple"
                            placeholder="Filter by Teacher"
                            allowClear
                            style={{ minWidth: 200, flex: 1 }}
                            onChange={setSelectedTeacherFilters}
                            options={teachers.map(t => ({
                                label: `${t.first_name} ${t.last_name}`,
                                value: t.id
                            }))}
                        />
                        <DatePicker.RangePicker 
                            onChange={(dates) => setDateRangeFilter(dates)} 
                            style={{ width: 280 }}
                        />
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                    <Table
                        columns={columns}
                        dataSource={filteredBatches}
                        rowKey="id"
                        rowSelection={{
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                        }}
                        loading={loading}
                        scroll={{ x: 1000 }}
                        size="middle"
                        pagination={{
                            pageSize: 15,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} batches`,
                            pageSizeOptions: ['10', '15', '25', '50'],
                            style: { padding: '12px 20px', margin: 0 },
                        }}
                    />
                </div>
            </div>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 40, height: 40, borderRadius: 10, 
                            background: editingBatch ? '#eff6ff' : '#ecfdf5', 
                            color: editingBatch ? '#2563eb' : '#10b981', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 
                        }}>
                            {editingBatch ? <EditOutlined /> : <PlusOutlined />}
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                            {editingBatch ? 'Edit Batch Configuration' : 'Create New Batch'}
                        </span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingBatch(null);
                    // Reset timetable state
                    setSelectedDays([]);
                    setScheduleType('custom');
                    setTimetableEntries([]);
                    setScheduleMode('different');
                    setMasterSchedule({
                        start_time: '09:00',
                        end_time: '10:00',
                        timezone: 'UTC',
                        location_mode: 'physical',
                        location: '',
                        link: ''
                    });
                }}
                footer={null}
                width={850}
                centered
                styles={{ 
                    header: { paddingBottom: 16, borderBottom: '1px solid #f1f5f9', padding: '24px 32px 16px', margin: 0 }, 
                    body: { padding: 0 }, 
                    content: { borderRadius: 20, overflow: 'hidden', padding: 0 } 
                }}
            >
               <ConfigProvider theme={{
                   token: {
                       colorPrimary: '#6366f1',
                       borderRadius: 10,
                       controlHeightLG: 46,
                       colorBorder: '#cbd5e1',
                       fontFamily: 'Inter, -apple-system, sans-serif'
                   },
                   components: {
                       Card: { borderRadiusLG: 16 },
                       Select: { controlHeightLG: 46 },
                       Input: { controlHeightLG: 46 },
                       Radio: { buttonBg: '#f8fafc', buttonCheckedBg: '#6366f1' }
                   }
               }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={(label, info) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>{label}</span>
                            {info.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </div>
                    )}
                >
                  <div style={{ padding: '24px 32px 0 32px', overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
                    <Form.Item
                        name="name"
                        label="Batch Name"
                        rules={[{ required: true, message: 'Please input batch name!' }]}
                    >
                        <Input size="large" placeholder="Enter batch name" style={{ borderRadius: 8, borderColor: '#e2e8f0' }} />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <Form.Item
                            name="french_level"
                            label="French Level"
                            rules={[{ required: true, message: 'Please select French level!' }]}
                        >
                            <Select size="large" placeholder="Select French level">
                                <Option value="A1">A1</Option>
                                <Option value="A2">A2</Option>
                                <Option value="B1">B1</Option>
                                <Option value="B2">B2</Option>
                                <Option value="C1">C1</Option>
                                <Option value="C2">C2</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="teacher_id"
                            label="Teacher"
                            rules={[{ required: true, message: 'Please select a teacher!' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Select teacher"
                                showSearch
                                optionFilterProp="children"
                            >
                                {teachers.map(teacher => (
                                    <Option key={teacher.id} value={teacher.id}>
                                        {teacher.first_name} {teacher.last_name} ({teacher.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Divider style={{ borderColor: '#e2e8f0' }}>
                        <Space>
                            <CalendarOutlined />
                            Timetable Configuration
                        </Space>
                    </Divider>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="timezone"
                                label="Timezone"
                                initialValue="UTC"
                            >
                                <Select size="large" placeholder="Select timezone">
                                    {timezones.map(tz => (
                                        <Option key={tz} value={tz}>{tz}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="default_location_mode"
                                label="Default Location Mode"
                                initialValue="online"
                            >
                                <Select size="large">
                                    <Option value="physical">Physical</Option>
                                    <Option value="online">Online</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item
                                name="default_location"
                                label="Default Location"
                            >
                                <Input size="large" placeholder="e.g., Room 101, Building A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="default_link"
                                label="Default Meeting Link"
                            >
                                <Input size="large" placeholder="e.g., https://zoom.us/j/..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Weekly Schedule">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Typography.Text strong>Schedule Type:</Typography.Text>
                                <br />
                                <Radio.Group 
                                    value={scheduleType} 
                                    onChange={e => handleScheduleTypeChange(e.target.value)}
                                    buttonStyle="solid"
                                    size="middle"
                                    style={{ marginTop: 8 }}
                                >
                                    <Radio.Button value="all">All Days</Radio.Button>
                                    <Radio.Button value="workdays">Workdays (Mon-Fri)</Radio.Button>
                                    <Radio.Button value="weekends">Weekends</Radio.Button>
                                    <Radio.Button value="custom">Custom</Radio.Button>
                                </Radio.Group>
                            </div>

                            {(scheduleType === 'all' || scheduleType === 'workdays' || scheduleType === 'weekends' || selectedDays.length > 1) && (
                                <div>
                                    <Typography.Text strong>Schedule Mode:</Typography.Text>
                                    <br />
                                    <Radio.Group 
                                        value={scheduleMode} 
                                        onChange={e => handleScheduleModeChange(e.target.value)}
                                        buttonStyle="solid"
                                        size="middle"
                                        style={{ marginTop: 8 }}
                                    >
                                        <Radio.Button value="same">
                                            <Space><ClockCircleOutlined />Same Schedule</Space>
                                        </Radio.Button>
                                        <Radio.Button value="different">
                                            <Space><CalendarOutlined />Different Schedule</Space>
                                        </Radio.Button>
                                    </Radio.Group>
                                    <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
                                        {scheduleMode === 'same' 
                                            ? 'Enter one schedule below and we will automatically apply it to all selected days' 
                                            : 'Configure a highly specific individual schedule for each individual selected day'
                                        }
                                    </Typography.Text>
                                </div>
                            )}

                            {scheduleType === 'custom' && (
                                <div>
                                    <Typography.Text strong>Select Days:</Typography.Text>
                                    <br />
                                    <Checkbox.Group 
                                        value={selectedDays}
                                        onChange={(days) => {
                                            setSelectedDays(days as number[]);
                                            updateTimetableEntries(days as number[]);
                                        }}
                                        style={{ marginTop: 8 }}
                                    >
                                        <div style={{ marginTop: 8, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                                            <Row gutter={[16, 16]}>
                                                {dayNames.map((day, index) => (
                                                    <Col span={8} key={index}>
                                                        <Checkbox value={index}>{day}</Checkbox>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </div>
                                    </Checkbox.Group>
                                </div>
                            )}

                            {timetableEntries.length > 0 && (
                                <div>
                                    <Typography.Text strong>Schedule Details:</Typography.Text>
                                    
                                    {scheduleMode === 'same' ? (
                                        // Single master schedule form
                                        <div style={{ marginTop: 8 }}>
                                            <Card 
                                                size="default" 
                                                style={{ marginBottom: 8, borderColor: '#e2e8f0', borderRadius: 12 }}
                                                title={
                                                    <Space>
                                                        <ClockCircleOutlined />
                                                        <span style={{ fontSize: 13 }}>Master Schedule (applies to all selected days)</span>
                                                    </Space>
                                                }
                                            >
                                                <Row gutter={16}>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>Start:</Typography.Text>
                                                        <div style={{ marginTop: 4 }}>
                                                            <TimePicker
                                                                value={dayjs(masterSchedule.start_time, 'HH:mm')}
                                                                format="HH:mm"
                                                                onChange={(time) => {
                                                                    const newTime = time?.format('HH:mm') || '09:00';
                                                                    setMasterSchedule(prev => ({ ...prev, start_time: newTime }));
                                                                    setTimetableEntries(prev => 
                                                                        prev.map(entry => ({ ...entry, start_time: newTime }))
                                                                    );
                                                                }}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>End:</Typography.Text>
                                                        <div style={{ marginTop: 4 }}>
                                                            <TimePicker
                                                                value={dayjs(masterSchedule.end_time, 'HH:mm')}
                                                                format="HH:mm"
                                                                onChange={(time) => {
                                                                    const newTime = time?.format('HH:mm') || '10:00';
                                                                    setMasterSchedule(prev => ({ ...prev, end_time: newTime }));
                                                                    setTimetableEntries(prev => 
                                                                        prev.map(entry => ({ ...entry, end_time: newTime }))
                                                                    );
                                                                }}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </div>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>Mode:</Typography.Text>
                                                        <div style={{ marginTop: 4 }}>
                                                            <Select
                                                                value={masterSchedule.location_mode}
                                                                onChange={(value) => {
                                                                    setMasterSchedule(prev => ({ ...prev, location_mode: value }));
                                                                    setTimetableEntries(prev => 
                                                                        prev.map(entry => ({ ...entry, location_mode: value }))
                                                                    );
                                                                }}
                                                                style={{ width: '100%' }}
                                                            >
                                                                <Option value="physical">Physical</Option>
                                                                <Option value="online">Online</Option>
                                                            </Select>
                                                        </div>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                                                            {masterSchedule.location_mode === 'physical' ? 'Location:' : 'Link:'}
                                                        </Typography.Text>
                                                        <div style={{ marginTop: 4 }}>
                                                            <Input
                                                                value={masterSchedule.location_mode === 'physical' ? masterSchedule.location : masterSchedule.link}
                                                                onChange={(e) => {
                                                                    const field = masterSchedule.location_mode === 'physical' ? 'location' : 'link';
                                                                    setMasterSchedule(prev => ({ ...prev, [field]: e.target.value }));
                                                                    setTimetableEntries(prev => 
                                                                        prev.map(entry => ({ ...entry, [field]: e.target.value }))
                                                                    );
                                                                }}
                                                                placeholder={masterSchedule.location_mode === 'physical' ? 'Room 101' : 'Meeting link'}
                                                            />
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card>
                                            <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                                                Selected days: {timetableEntries.map(entry => dayNames[entry.day_of_week]).join(', ')}
                                            </Typography.Text>
                                        </div>
                                    ) : (
                                        // Individual schedule forms
                                        <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
                                            {timetableEntries.map((entry) => (
                                                <Card 
                                                    key={entry.day_of_week} 
                                                    size="small" 
                                                    style={{ marginBottom: 8 }}
                                                    title={
                                                        <Space>
                                                            <ClockCircleOutlined />
                                                            {dayNames[entry.day_of_week]}
                                                        </Space>
                                                    }
                                                >
                                                    <Row gutter={8}>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">Start:</Typography.Text>
                                                            <TimePicker
                                                                value={dayjs(entry.start_time, 'HH:mm')}
                                                                format="HH:mm"
                                                                onChange={(time) => 
                                                                    updateTimetableEntry(entry.day_of_week, 'start_time', time?.format('HH:mm'))
                                                                }
                                                                size="small"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Col>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">End:</Typography.Text>
                                                            <TimePicker
                                                                value={dayjs(entry.end_time, 'HH:mm')}
                                                                format="HH:mm"
                                                                onChange={(time) => 
                                                                    updateTimetableEntry(entry.day_of_week, 'end_time', time?.format('HH:mm'))
                                                                }
                                                                size="small"
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Col>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">Mode:</Typography.Text>
                                                            <Select
                                                                value={entry.location_mode}
                                                                onChange={(value) => 
                                                                    updateTimetableEntry(entry.day_of_week, 'location_mode', value)
                                                                }
                                                                size="small"
                                                                style={{ width: '100%' }}
                                                            >
                                                                <Option value="physical">Physical</Option>
                                                                <Option value="online">Online</Option>
                                                            </Select>
                                                        </Col>
                                                        <Col span={6}>
                                                            <Typography.Text type="secondary">
                                                                {entry.location_mode === 'physical' ? 'Location:' : 'Link:'}
                                                            </Typography.Text>
                                                            <Input
                                                                value={entry.location_mode === 'physical' ? entry.location : entry.link}
                                                                onChange={(e) => 
                                                                    updateTimetableEntry(
                                                                        entry.day_of_week, 
                                                                        entry.location_mode === 'physical' ? 'location' : 'link', 
                                                                        e.target.value
                                                                    )
                                                                }
                                                                size="small"
                                                                placeholder={entry.location_mode === 'physical' ? 'Room 101' : 'Meeting link'}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Space>
                    </Form.Item>

                    <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <Form.Item
                            name="dateRange"
                            label="Overall Batch Duration"
                            rules={[{ required: true, message: 'Please select start and end date and time!' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <RangePicker
                                size="large"
                                style={{ width: '100%', borderRadius: 8 }}
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                            />
                        </Form.Item>
                    </div>

                    {!editingBatch && (
                        <Form.Item
                            name="student_ids"
                            label="Students"
                            rules={[{ required: true, message: 'Please select at least one student!' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select students"
                                showSearch
                                optionFilterProp="children"
                            >
                                {students.map(s => (
                                    <Option key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} ({s.email})
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                  </div>
                  <div style={{ padding: '16px 32px', borderTop: '1px solid #f1f5f9', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button 
                            size="large"
                            style={{ borderRadius: 10, fontWeight: 600, padding: '0 24px' }}
                            onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                                setEditingBatch(null);
                                // Reset timetable state
                                setSelectedDays([]);
                                setScheduleType('custom');
                                setTimetableEntries([]);
                                setScheduleMode('different');
                                setMasterSchedule({
                                    start_time: '09:00',
                                    end_time: '10:00',
                                    timezone: 'UTC',
                                    location_mode: 'physical',
                                    location: '',
                                    link: ''
                                });
                            }}>
                            Cancel
                        </Button>
                        <Button 
                            size="large"
                            type="primary" 
                            htmlType="submit"
                            loading={submitting}
                            style={{ borderRadius: 10, fontWeight: 600, padding: '0 32px', background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                        >
                            {editingBatch ? 'Save Changes' : 'Create Batch'}
                        </Button>
                    </div>
                </Form>
              </ConfigProvider>
            </Modal>
        </div>
    );
};

export default BatchManagement;