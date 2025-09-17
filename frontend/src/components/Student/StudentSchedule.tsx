import React, { useState, useEffect } from 'react';
import {
    Card,
    message,
    Typography,
    Tag,
    Calendar,
    Badge,
    Tabs,
    Row,
    Col,
    Statistic,
    List,
    Avatar,
    Empty,
    Timeline,
    Button,
    Modal,
    Space,
    Divider
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    BookOutlined,
    TeamOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface Schedule {
    id: number;
    title: string;
    description: string;
    batch_id: number;
    batch_name: string;
    teacher_name: string;
    start_time: string;
    end_time: string;
    date: string;
    location: string;
    location_mode?: 'online' | 'physical';
    link?: string | null;
    type: 'class' | 'exam' | 'meeting' | 'other';
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}

interface ScheduleStats {
    total_classes: number;
    upcoming_classes: number;
    completed_classes: number;
    this_week_classes: number;
    next_class?: Schedule;
}

const StudentSchedule: React.FC = () => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [stats, setStats] = useState<ScheduleStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [detailsVisible, setDetailsVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const { apiCall } = useAuth();

    useEffect(() => {
        fetchSchedules();
        fetchStats();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/schedules/my-schedule');
            if (response.ok) {
                const data = await response.json();
                setSchedules(data.schedules || []);
            } else {
                message.error('Failed to fetch schedule');
            }
        } catch (error) {
            message.error('Error fetching schedule');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiCall('/schedules/my-stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'class': return 'blue';
            case 'exam': return 'red';
            case 'meeting': return 'green';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'processing';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled': return <ClockCircleOutlined />;
            case 'completed': return <CheckCircleOutlined />;
            case 'cancelled': return <ExclamationCircleOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const getListData = (value: Dayjs) => {
        const dateStr = value.format('YYYY-MM-DD');
        return schedules.filter(schedule => schedule.date === dateStr);
    };

    const dateCellRender = (value: Dayjs) => {
        const listData = getListData(value);
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.map(item => (
                    <li key={item.id} style={{ marginBottom: 2 }}>
                        <Badge
                            status={getStatusColor(item.status) as any}
                            text={
                                <span 
                                    style={{ fontSize: '11px', cursor: 'pointer' }}
                                    onClick={() => handleViewDetails(item)}
                                >
                                    {item.start_time} - {item.title}
                                </span>
                            }
                        />
                    </li>
                ))}
            </ul>
        );
    };

    const handleViewDetails = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setDetailsVisible(true);
    };

    const formatTime = (time: string) => {
        return dayjs(time, 'HH:mm').format('h:mm A');
    };

    const isToday = (date: string) => {
        return dayjs(date).isSame(dayjs(), 'day');
    };

    const isUpcoming = (date: string, time: string) => {
        const scheduleDateTime = dayjs(`${date} ${time}`);
        return scheduleDateTime.isAfter(dayjs());
    };

    const todaySchedules = schedules.filter(schedule => isToday(schedule.date));
    const upcomingSchedules = schedules
        .filter(schedule => isUpcoming(schedule.date, schedule.start_time))
        .sort((a, b) => {
            const dateTimeA = dayjs(`${a.date} ${a.start_time}`);
            const dateTimeB = dayjs(`${b.date} ${b.start_time}`);
            return dateTimeA.valueOf() - dateTimeB.valueOf();
        });
    const thisWeekSchedules = schedules.filter(schedule => {
        const scheduleDate = dayjs(schedule.date);
        const startOfWeek = dayjs().startOf('week');
        const endOfWeek = dayjs().endOf('week');
        return scheduleDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
    });

    const nextClass = upcomingSchedules[0];

    // Helper function to check if user can join the meeting (5 minutes before start time)
    const canJoinMeeting = (date: string, startTime: string): boolean => {
        const meetingDateTime = dayjs(`${date} ${startTime}`);
        const now = dayjs();
        const fiveMinutesBefore = meetingDateTime.subtract(5, 'minute');
        
        return now.isAfter(fiveMinutesBefore) && now.isBefore(meetingDateTime.add(2, 'hour'));
    };

    // Helper function to get secure meeting link (only when authorized)
    const getSecureMeetingLink = (schedule: Schedule): string | null => {
        if (!schedule.link || !canJoinMeeting(schedule.date, schedule.start_time)) {
            return null;
        }
        return schedule.link;
    };

    // Component to render the join meeting button
    const renderJoinMeetingButton = (schedule: Schedule) => {
        const canJoin = canJoinMeeting(schedule.date, schedule.start_time);
        const meetingLink = getSecureMeetingLink(schedule);
        
        return (
            <Button
                type="primary"
                style={{
                    backgroundColor: canJoin ? '#52c41a' : '#d9d9d9',
                    borderColor: canJoin ? '#52c41a' : '#d9d9d9',
                    color: canJoin ? 'white' : '#999',
                    cursor: canJoin ? 'pointer' : 'not-allowed'
                }}
                disabled={!canJoin}
                onClick={() => {
                    if (meetingLink) {
                        window.open(meetingLink, '_blank');
                    }
                }}
            >
                Join Meeting
            </Button>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Title level={2}>
                    <CalendarOutlined /> My Schedule
                </Title>
            </div>

            {stats && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Classes"
                                value={stats.total_classes}
                                prefix={<BookOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="This Week"
                                value={stats.this_week_classes}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Upcoming"
                                value={stats.upcoming_classes}
                                prefix={<ClockCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Completed"
                                value={stats.completed_classes}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {nextClass && (
                <Card 
                    style={{ marginBottom: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    bodyStyle={{ color: 'white' }}
                >
                    <Row align="middle">
                        <Col span={18}>
                            <Title level={4} style={{ color: 'white', margin: 0 }}>
                                <ClockCircleOutlined /> Next Class
                            </Title>
                            <div style={{ marginTop: 8 }}>
                                <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                                    {nextClass.title}
                                </Text>
                                <br />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {dayjs(nextClass.date).format('dddd, MMMM DD')} at {formatTime(nextClass.start_time)}
                                </Text>
                                <br />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    <EnvironmentOutlined /> {nextClass.location} • <TeamOutlined /> {nextClass.teacher_name}
                                </Text>
                            </div>
                        </Col>
                        <Col span={6} style={{ textAlign: 'right' }}>
                            <Button 
                                type="primary" 
                                ghost
                                onClick={() => handleViewDetails(nextClass)}
                            >
                                View Details
                            </Button>
                        </Col>
                    </Row>
                </Card>
            )}

            <Row gutter={16}>
                <Col span={16}>
                    <Card title="Calendar View">
                        <Calendar
                            dateCellRender={dateCellRender}
                            onSelect={(date) => setSelectedDate(date)}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Tabs defaultActiveKey="today" size="small">
                        <TabPane tab={`Today (${todaySchedules.length})`} key="today">
                            <Card size="small">
                                {todaySchedules.length > 0 ? (
                                    <Timeline>
                                        {todaySchedules
                                            .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                            .map(schedule => (
                                                <Timeline.Item
                                                    key={schedule.id}
                                                    dot={getStatusIcon(schedule.status)}
                                                    color={getStatusColor(schedule.status)}
                                                >
                                                    <div 
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleViewDetails(schedule)}
                                                    >
                                                        <Text strong>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</Text>
                                                        <br />
                                                        <Text>{schedule.title}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            <EnvironmentOutlined /> {schedule.location}
                                                        </Text>
                                                        <br />
                                                        <Tag color={getTypeColor(schedule.type)} size="small">
                                                            {schedule.type.toUpperCase()}
                                                        </Tag>
                                                    </div>
                                                </Timeline.Item>
                                            ))
                                        }
                                    </Timeline>
                                ) : (
                                    <Empty 
                                        description="No classes today" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>
                        
                        <TabPane tab={`Upcoming (${upcomingSchedules.slice(0, 10).length})`} key="upcoming">
                            <Card size="small">
                                {upcomingSchedules.slice(0, 10).length > 0 ? (
                                    <List
                                        size="small"
                                        dataSource={upcomingSchedules.slice(0, 10)}
                                        renderItem={(schedule) => (
                                            <List.Item 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(schedule)}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            style={{ backgroundColor: getTypeColor(schedule.type) }}
                                                            icon={<BookOutlined />}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{schedule.title}</Text>
                                                            <Tag color={getTypeColor(schedule.type)} size="small">
                                                                {schedule.type.toUpperCase()}
                                                            </Tag>
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {dayjs(schedule.date).format('MMM DD')} • {formatTime(schedule.start_time)}
                                                            </Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                <EnvironmentOutlined /> {schedule.location}
                                                            </Text>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty 
                                        description="No upcoming classes" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>
                        
                        <TabPane tab={`This Week (${thisWeekSchedules.length})`} key="week">
                            <Card size="small">
                                {thisWeekSchedules.length > 0 ? (
                                    <List
                                        size="small"
                                        dataSource={thisWeekSchedules
                                            .sort((a, b) => {
                                                const dateTimeA = dayjs(`${a.date} ${a.start_time}`);
                                                const dateTimeB = dayjs(`${b.date} ${b.start_time}`);
                                                return dateTimeA.valueOf() - dateTimeB.valueOf();
                                            })
                                        }
                                        renderItem={(schedule) => (
                                            <List.Item 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(schedule)}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar 
                                                            style={{ backgroundColor: getStatusColor(schedule.status) }}
                                                            icon={getStatusIcon(schedule.status)}
                                                        />
                                                    }
                                                    title={
                                                        <Space>
                                                            <Text strong>{schedule.title}</Text>
                                                            <Tag color={getStatusColor(schedule.status)} size="small">
                                                                {schedule.status.toUpperCase()}
                                                            </Tag>
                                                        </Space>
                                                    }
                                                    description={
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                {dayjs(schedule.date).format('ddd, MMM DD')} • {formatTime(schedule.start_time)}
                                                            </Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                                                <TeamOutlined /> {schedule.teacher_name}
                                                            </Text>
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <Empty 
                                        description="No classes this week" 
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )}
                            </Card>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>

            <Modal
                title="Class Details"
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedSchedule && (
                    <div>
                        <Title level={4}>{selectedSchedule.title}</Title>
                        
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Date"
                                        value={dayjs(selectedSchedule.date).format('dddd, MMMM DD, YYYY')}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Time"
                                        value={`${formatTime(selectedSchedule.start_time)} - ${formatTime(selectedSchedule.end_time)}`}
                                        prefix={<ClockCircleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Description:</Text>
                            <Paragraph style={{ marginTop: 8 }}>
                                {selectedSchedule.description || 'No description provided.'}
                            </Paragraph>
                        </div>
                        
                        <Row gutter={16}>
                            <Col span={8}>
                                <div>
                                    <Text strong>Teacher:</Text>
                                    <br />
                                    <Text><TeamOutlined /> {selectedSchedule.teacher_name}</Text>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div>
                                    <Text strong>Location:</Text>
                                    <br />
                                    <Text><EnvironmentOutlined /> {selectedSchedule.location}</Text>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div>
                                    <Text strong>Batch:</Text>
                                    <br />
                                    <Text><BookOutlined /> {selectedSchedule.batch_name}</Text>
                                </div>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <Row gutter={16}>
                            <Col span={8}>
                                <div>
                                    <Text strong>Type:</Text>
                                    <br />
                                    <Tag color={getTypeColor(selectedSchedule.type)}>
                                        {selectedSchedule.type.toUpperCase()}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div>
                                    <Text strong>Status:</Text>
                                    <br />
                                    <Tag color={getStatusColor(selectedSchedule.status)}>
                                        {getStatusIcon(selectedSchedule.status)} {selectedSchedule.status.toUpperCase()}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={8}>
                                {selectedSchedule.link && (
                                    <div>
                                        <Text strong>Meeting:</Text>
                                        <br />
                                        {renderJoinMeetingButton(selectedSchedule)}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentSchedule;