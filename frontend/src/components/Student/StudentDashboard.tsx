import React, { useState, useEffect, useMemo } from 'react';
import { 
    Row, 
    Col, 
    Card, 
    Statistic, 
    Button, 
    message, 
    Typography,
    Tag,
    Progress,
    Timeline,
    Modal,
    List,
    Tooltip,
    Empty,
    Input,
    Segmented,
    Select,
    Space,
    Divider
} from 'antd';
import {
    BookOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined, 
    CalendarOutlined, 
    FieldTimeOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';

const { Title, Text } = Typography;

// Initialize dayjs UTC plugin
dayjs.extend(utc);

interface Batch {
    id: number;
    name: string;
    description?: string;
    teacher_name?: string;
    french_level?: string;
    start_date?: string;
    end_date?: string;
    current_students?: number;
    max_students?: number;
    quizzes_count?: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    total_questions: number;
    duration_minutes: number;
    total_marks?: number;
    status?: string; // draft | published
    start_date?: string | null;
    end_date?: string | null;
    batch_names?: string; // comma-separated
    submission_status?: 'not_started' | 'in_progress' | 'submitted' | 'auto_submitted' | 'completed';
    submission?: {
        total_score?: number;
        max_score?: number;
        percentage?: number;
        status?: string;
    } | null;
}

interface Resource {
    id: number;
    title: string;
    description: string;
    file_name: string;
    file_type: string; // MIME type
    batch_name: string;
    created_at: string;
}

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_name: string;
    start_time: string;
    end_time: string;
    type: string; // 'class' | 'exam' | 'assignment' | ...
}

const StudentDashboard: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { apiCall, user } = useAuth();
    const navigate = useNavigate();

    const [batchModalOpen, setBatchModalOpen] = useState(false);
    const [batchFilter, setBatchFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
    const [batchSort, setBatchSort] = useState<'name' | 'start' | 'end' | 'level' | 'remaining'>('start');
    const [batchSearch, setBatchSearch] = useState('');

    const [stats, setStats] = useState({
        totalBatches: 0,
        completedQuizzes: 0,
        pendingQuizzes: 0,
        averageScore: 0,
        totalResources: 0,
        upcomingClasses: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [quizzesRes, resultsRes, resourcesRes, schedulesRes, batchesRes] = await Promise.all([
                apiCall('/quizzes'),
                apiCall('/quizzes/student/results'),
                apiCall('/resources'),
                apiCall('/schedules/upcoming/me?limit=20'),
                apiCall('/batches/student/my-batches')
            ]);
    
            // Removed quizzesDataLocal fallback; we now rely on dedicated student batches endpoint
    
            // Quizzes
            if (quizzesRes && quizzesRes.ok) {
                const data = await quizzesRes.json();
                const quizzesData: Quiz[] = Array.isArray(data) ? data : (data.quizzes || []);
                setQuizzes(quizzesData);
    
                // Stats: completed & pending based on submission_status and availability
                const completedQuizzes = quizzesData.filter(q => q.submission_status === 'completed').length;
                const pendingQuizzes = quizzesData.filter(q => q.submission_status !== 'completed').length;
                setStats(prev => ({ ...prev, completedQuizzes, pendingQuizzes }));
            }

            // Results for average score
            if (resultsRes && resultsRes.ok) {
                const data = await resultsRes.json();
                const allResults = (data?.results || []) as any[];
                const now = dayjs();
                // Expired results only: end_date has passed; fallback to unlocked when end_date missing
                const expired = allResults.filter((r: any) => {
                    const end = r?.end_date ? dayjs(r.end_date) : null;
                    return end ? now.isAfter(end) : r?.results_locked === false;
                });
                setResults(expired);
                const scores = expired.map(r => Number(r.percentage ?? 0)).filter((n: number) => !isNaN(n));
                const averageScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length)) : 0;
                setStats(prev => ({ ...prev, averageScore }));
            }

            // Resources
            if (resourcesRes && resourcesRes.ok) {
                const data = await resourcesRes.json();
                const resourcesData: Resource[] = Array.isArray(data) ? data : (data.resources || []);
                setResources(resourcesData);
                setStats(prev => ({ ...prev, totalResources: resourcesData.length }));
            }

            // Schedules (upcoming)
            if (schedulesRes && schedulesRes.ok) {
                const data = await schedulesRes.json();
                const schedulesData: Schedule[] = Array.isArray(data) ? data : (data.schedules || []);
                setSchedules(schedulesData);
                const upcomingClasses = schedulesData.filter((s: Schedule) => dayjs(s.start_time).isAfter(dayjs())).length;
                setStats(prev => ({ ...prev, upcomingClasses }));
            }

            // Batches via quizzes student dashboard (with robust fallback)
            let mappedBatches: Batch[] = [];
            if (batchesRes && batchesRes.ok) {
                const data = await batchesRes.json();
                const batchesData = Array.isArray(data)
                    ? data
                    : (Array.isArray((data as any)?.batches) ? (data as any).batches : ((data as any)?.data || []));
                mappedBatches = (batchesData || []).map((b: any) => ({
                    id: b.id ?? b.batch_id ?? b.batchId ?? 0,
                    name: b.name ?? b.batch_name ?? b.batchName ?? 'Unnamed Batch',
                    french_level: b.french_level ?? b.level ?? b.frenchLevel,
                    start_date: b.start_date ?? b.startDate,
                    end_date: b.end_date ?? b.endDate,
                    teacher_name: (b.teacher_first_name || b.teacher_last_name)
                        ? `${b.teacher_first_name || ''} ${b.teacher_last_name || ''}`.trim()
                        : (b.teacher_name ?? undefined),
                    current_students: b.student_count ?? b.current_students ?? b.students_count ?? undefined,
                }));
            }


            setBatches(mappedBatches);
            setStats(prev => ({ ...prev, totalBatches: mappedBatches.length }));
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const quizColumnsPlaceholder = true; // placeholder to maintain structure if needed
    // legacy quiz/resource table columns removed during dashboard simplification


    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return '#52c41a';
        if (percentage >= 80) return '#1890ff';
        if (percentage >= 70) return '#fa8c16';
        return '#f5222d';
    };

    const getUpcomingSchedules = () => {
        return schedules
            .filter(schedule => dayjs(schedule.start_time).isAfter(dayjs()))
            .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))
            .slice(0, 5);
    };

    const getBatchStatus = (batch: Batch) => {
        const now = dayjs();
        const start = batch.start_date ? dayjs(batch.start_date) : null;
        const end = batch.end_date ? dayjs(batch.end_date) : null;
        if (start && now.isBefore(start)) return 'upcoming';
        if (end && now.isAfter(end)) return 'completed';
        return 'active';
    };

    const displayedBatches = useMemo(() => {
        const q = batchSearch.trim().toLowerCase();
        const filtered = batches.filter(b => {
            if (batchFilter !== 'all' && getBatchStatus(b) !== batchFilter) return false;
            if (q) {
                const bucket = [b.name, b.french_level, b.teacher_name].filter(Boolean).join(' ').toLowerCase();
                if (!bucket.includes(q)) return false;
            }
            return true;
        });

        const safeDay = (d?: string) => (d ? dayjs(d).valueOf() : 0);
        const remainingDays = (b: Batch) => {
            if (!b.end_date) return Number.POSITIVE_INFINITY;
            const diff = dayjs(b.end_date).endOf('day').diff(dayjs().startOf('day'), 'day');
            return diff;
        };

        return filtered.sort((a, b) => {
            switch (batchSort) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'start':
                    return safeDay(a.start_date) - safeDay(b.start_date);
                case 'end':
                    return safeDay(a.end_date) - safeDay(b.end_date);
                case 'level':
                    return (a.french_level || '').localeCompare(b.french_level || '');
                case 'remaining':
                    return remainingDays(a) - remainingDays(b);
                default:
                    return 0;
            }
        });
    }, [batches, batchFilter, batchSort, batchSearch]);

    return (
        <div>
            <Title level={2}>Student Dashboard</Title>
            
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Tooltip title="View my batches">
                        <Card hoverable onClick={() => setBatchModalOpen(true)} style={{ cursor: 'pointer' }}>
                            <Statistic
                                title="My Batches"
                                value={stats.totalBatches}
                                prefix={<BookOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Tooltip>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Completed Quizzes"
                            value={stats.completedQuizzes}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Average Score"
                            value={stats.averageScore}
                            suffix="%"
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: getScoreColor(stats.averageScore) }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Pending Quizzes"
                            value={stats.pendingQuizzes}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Batches Modal */}

            
            <Modal
                open={batchModalOpen}
                onCancel={() => setBatchModalOpen(false)}
                footer={null}
                width={900}
                title={
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingRight: 8
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BookOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                            <span style={{ fontSize: 16, fontWeight: 500 }}>My Batches</span>
                        </div>
                        <Tag 
                            color="blue" 
                            style={{ 
                                fontSize: 12,
                                fontWeight: 500,
                                borderRadius: 12,
                                padding: '2px 8px',
                                marginRight: 24
                            }}
                        >
                            {batches.length}
                        </Tag>
                    </div>
                }
            >
                {/* Toolbar: search, filter, sort */}
                <div style={{ marginBottom: 12 }}>
                    <Row gutter={[8,8]}>
                        <Col xs={24} md={10}>
                            <Input.Search
                                allowClear
                                placeholder="Search by name, level, or teacher"
                                value={batchSearch}
                                onChange={(e) => setBatchSearch(e.target.value)}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Segmented
                                options={[{ label: 'All', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Upcoming', value: 'upcoming' }, { label: 'Completed', value: 'completed' }]}
                                value={batchFilter}
                                onChange={(val) => setBatchFilter(val as 'all' | 'active' | 'upcoming' | 'completed')}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Select
                                style={{ width: '100%' }}
                                value={batchSort}
                                onChange={(v) => setBatchSort(v)}
                                options={[
                                    { value: 'start', label: 'Sort by Start Date' },
                                    { value: 'end', label: 'Sort by End Date' },
                                    { value: 'name', label: 'Sort by Name' },
                                    { value: 'level', label: 'Sort by Level' },
                                    { value: 'remaining', label: 'Sort by Remaining Days' },
                                ]}
                            />
                        </Col>
                    </Row>
                </div>
            
                {displayedBatches.length === 0 ? (
                    <Empty description="No matching batches" />
                ) : (
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
                        dataSource={displayedBatches}
                        renderItem={(batch) => (
                            <List.Item key={batch.name}>
                                <Card hoverable bodyStyle={{ padding: 16 }} style={{ borderRadius: 12, borderLeft: `4px solid ${getBatchStatus(batch) === 'active' ? '#52c41a' : getBatchStatus(batch) === 'upcoming' ? '#1677ff' : '#d9d9d9'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <BookOutlined style={{ color: '#1677ff' }} />
                                        <Text strong style={{ fontSize: 16 }}>{batch.name}</Text>
                                        {batch.french_level && (
                                            <Tag color="cyan" style={{ marginLeft: 8 }}>{batch.french_level}</Tag>
                                        )}
                                        <Tag color={
                                            getBatchStatus(batch) === 'active' ? 'green' :
                                            getBatchStatus(batch) === 'completed' ? 'default' : 'blue'
                                        } style={{ marginLeft: 'auto' }}>
                                            {getBatchStatus(batch).toUpperCase()}
                                        </Tag>
                                    </div>
                                
                                    {batch.teacher_name && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <UserOutlined style={{ color: '#8c8c8c' }} />
                                            <Text type="secondary">Teacher:</Text>
                                            <Text>{batch.teacher_name}</Text>
                                        </div>
                                    )}
                                
                                    {(batch.start_date || batch.end_date) && (() => {
                                        const start = batch.start_date ? dayjs.utc(batch.start_date).startOf('day') : null;
                                        const end = batch.end_date ? dayjs.utc(batch.end_date).startOf('day') : null;
                                        const now = dayjs.utc().startOf('day');
                                        const durationDays = start && end ? end.diff(start, 'day') + 1 : null;
                                        const remaining = end ? end.diff(now, 'day') : null;
                                        const totalMs = start && end ? end.valueOf() - start.valueOf() : null;
                                        const elapsedMs = start ? Math.max(0, Math.min((dayjs.utc().valueOf() - start.valueOf()), totalMs ?? 0)) : null;
                                        const percent = totalMs && totalMs > 0 && elapsedMs !== null ? Math.round((elapsedMs / totalMs) * 100) : 0;
                                        return (
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                    {start && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <CalendarOutlined style={{ color: '#8c8c8c' }} />
                                                            <Text type="secondary">Start (UTC):</Text>
                                                            <Text>{start.format('DD MMM YYYY')}</Text>
                                                        </div>
                                                    )}
                                                    {end && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <FieldTimeOutlined style={{ color: '#8c8c8c' }} />
                                                            <Text type="secondary">End (UTC):</Text>
                                                            <Text>{end.format('DD MMM YYYY')}</Text>
                                                        </div>
                                                    )}
                                                </div>
                                                {durationDays !== null && (
                                                    <div style={{ marginTop: 8 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <FieldTimeOutlined style={{ color: '#8c8c8c' }} />
                                                                <Text type="secondary">Duration:</Text>
                                                                <Tag color="purple">{durationDays} days</Tag>
                                                            </div>
                                                            {remaining !== null && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <ClockCircleOutlined style={{ color: remaining > 0 ? '#52c41a' : '#fa541c' }} />
                                                                    <Text type="secondary">Remaining:</Text>
                                                                    <Tag color={remaining > 5 ? 'green' : remaining > 0 ? 'orange' : 'default'}>{Math.max(0, remaining)} days</Tag>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {start && end && (
                                                            <div style={{ marginTop: 6 }}>
                                                                <Progress percent={percent} size="small" status={getBatchStatus(batch) === 'completed' ? 'normal' : 'active'} showInfo />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                
                                    {/* Capacity & Next class */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
                                        <div style={{ minWidth: 0 }}>
                                            {(typeof batch.current_students === 'number' && typeof batch.max_students === 'number') ? (
                                                <div>
                                                    <Text type="secondary">Students:</Text>{' '}
                                                    <Text strong>{batch.current_students}/{batch.max_students}</Text>
                                                    <Progress percent={Math.round((batch.current_students / Math.max(1, batch.max_students)) * 100)} size="small" showInfo={false} style={{ marginTop: 4, width: 180 }} />
                                                </div>
                                            ) : (
                                                (typeof batch.current_students === 'number') && (
                                                    <Tag color="blue">{batch.current_students} {batch.current_students === 1 ? 'student' : 'students'}</Tag>
                                                )
                                            )}
                                        </div>
                                
                                        {/* Next class (if any) */}
                                        {(() => {
                                            const next = schedules
                                                .filter(s => s.batch_name === batch.name && dayjs(s.start_time).isAfter(dayjs()))
                                                .sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time)))[0];
                                            return next ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <CalendarOutlined style={{ color: '#52c41a' }} />
                                                    <Text type="secondary">Next class:</Text>
                                                    <Text>{dayjs(next.start_time).format('DD MMM, HH:mm')}</Text>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                
                                    <Divider style={{ margin: '12px 0' }} />
                                
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            {(batch.quizzes_count ?? 0) > 0 && (
                                                <Tag color="magenta">{batch.quizzes_count} quizzes</Tag>
                                            )}
                                        </div>
                                        <Space size={8} wrap>
                                            <Button type="link" onClick={() => navigate('/my-quizzes')}>Quizzes</Button>
                                            <Button type="link" onClick={() => navigate('/my-resources')}>Resources</Button>
                                            <Button type="link" onClick={() => navigate('/my-schedule')}>Schedule</Button>
                                        </Space>
                                    </div>
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </Modal>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Card title="Score Over Time">
                                {results.length === 0 ? (
                                    <Text type="secondary">No expired quiz results yet</Text>
                                ) : (
                                    <div style={{ height: 280 }}>
                                        <LineChart
                                            xAxis={[{ scaleType: 'point', data: results
                                                .slice()
                                                .sort((a: any, b: any) => dayjs(a.submitted_at).diff(dayjs(b.submitted_at)))
                                                .map((r: any) => dayjs(r.submitted_at).format('MMM DD')) }]}
                                            series={[{ data: results
                                                .slice()
                                                .sort((a: any, b: any) => dayjs(a.submitted_at).diff(dayjs(b.submitted_at)))
                                                .map((r: any) => Math.round(Number(r.percentage ?? 0))) , label: 'Score %' }]}
                                            height={260}
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="Scores by Quiz (Top 10)">
                                {results.length === 0 ? (
                                    <Text type="secondary">No expired quiz results yet</Text>
                                ) : (
                                    <div style={{ height: 280 }}>
                                        <BarChart
                                            xAxis={[{ scaleType: 'band', data: results
                                                .slice(-10)
                                                .map((r: any) => (r.quiz_title?.length > 10 ? r.quiz_title.slice(0, 10) + '…' : r.quiz_title)) }]}
                                            series={[{ data: results.slice(-10).map((r: any) => Math.round(Number(r.percentage ?? 0))) }]}
                                            height={260}
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24}>
                            <Card title="Quiz Availability Status">
                                {quizzes.length === 0 ? (
                                    <Text type="secondary">No quizzes found</Text>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'center', height: 300 }}>
                                        <PieChart
                                            series={[{
                                                data: (() => {
                                                    const now = dayjs();
                                                    const counts = { upcoming: 0, active: 0, expired: 0 };
                                                    quizzes.forEach(q => {
                                                        const start = q.start_date ? dayjs(q.start_date) : null;
                                                        const end = q.end_date ? dayjs(q.end_date) : null;
                                                        if (start && now.isBefore(start)) counts.upcoming++;
                                                        else if (end && now.isAfter(end)) counts.expired++;
                                                        else counts.active++;
                                                    });
                                                    return [
                                                        { id: 0, value: counts.upcoming, label: 'Upcoming' },
                                                        { id: 1, value: counts.active, label: 'Active' },
                                                        { id: 2, value: counts.expired, label: 'Expired' },
                                                    ];
                                                })()
                                            }]}
                                            height={280}
                                        />
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Upcoming Schedule" style={{ marginBottom: 16 }}>
                        <Timeline>
                            {getUpcomingSchedules().map((schedule) => {
                                const timeColor = schedule.type === 'exam' ? 'red' : 
                                                schedule.type === 'assignment' ? 'orange' : 'blue';
                                
                                return (
                                    <Timeline.Item key={schedule.id} color={timeColor}>
                                        <div>
                                            <Text strong>{schedule.title}</Text>
                                            <br />
                                            <Text type="secondary">{schedule.batch_name}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {dayjs(schedule.start_time).format('MMM DD, YYYY HH:mm')}
                                            </Text>
                                            <br />
                                            <Tag color={timeColor} size="small">
                                                {schedule.type.toUpperCase()}
                                            </Tag>
                                        </div>
                                    </Timeline.Item>
                                );
                            })}
                        </Timeline>
                        {getUpcomingSchedules().length === 0 && (
                            <Text type="secondary">No upcoming events</Text>
                        )}
                    </Card>

                    <Card 
                        title="Recent Performance"
                        extra={
                            quizzes.filter(quiz => quiz.submission).length > 0 && (
                                <Button 
                                    type="link" 
                                    onClick={() => navigate('/my-results')}
                                    icon={<TrophyOutlined />}
                                >
                                    View All Results
                                </Button>
                            )
                        }
                    >
                        <div>
                            {quizzes
                                .filter(quiz => quiz.submission)
                                .sort((a, b) => dayjs(b.submission?.submitted_at).diff(dayjs(a.submission?.submitted_at)))
                                .slice(0, 5)
                                .map((quiz) => {
                                    const percentage = Math.round(Number(quiz.submission?.percentage ?? ((Number(quiz.submission?.total_score || 0) / Number(quiz.submission?.max_score || 0)) * 100)) || 0);
                                    return (
                                        <div key={quiz.id} style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                <Text ellipsis style={{ maxWidth: '70%' }}>{quiz.title}</Text>
                                                <Text strong style={{ color: getScoreColor(percentage) }}>
                                                    {percentage}%
                                                </Text>
                                            </div>
                                            <Progress 
                                                percent={percentage} 
                                                size="small" 
                                                strokeColor={getScoreColor(percentage)}
                                                showInfo={false}
                                            />
                                        </div>
                                    );
                                })
                            }
                            {quizzes.filter(quiz => quiz.submission).length === 0 && (
                                <Text type="secondary">No completed quizzes yet</Text>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>


        </div>
    );
};

export default StudentDashboard;