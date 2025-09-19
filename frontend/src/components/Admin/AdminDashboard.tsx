import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, message, Select, Button, Space } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

// Replace Chart.js/react-chartjs-2 with Ant Design Plots
import { Pie, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

// Types
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
}

interface Batch {
  id: number;
  name: string;
  teacher_id: number;
  teacher_first_name?: string;
  teacher_last_name?: string;
  start_date: string;
  end_date: string;
  student_count?: number;
  french_level?: string;
  created_at: string;
}

interface Quiz {
  id: number;
  title: string;
  status: 'draft' | 'published' | 'archived' | string;
  created_at: string;
  updated_at?: string;
}

interface ScheduleItem {
  id: number;
  title: string;
  type: 'class' | 'assignment' | 'quiz' | 'exam' | 'meeting' | 'other' | string;
  start_time: string;
  end_time: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { apiCall } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalBatches: 0,
  });

  // Controls
  const [monthsRange, setMonthsRange] = useState<number>(6);

  // Chart refs for export (AntV plots)
  const rolePlotRef = useRef<any>(null);
  const signupPlotRef = useRef<any>(null);
  const batchesPlotRef = useRef<any>(null);
  const quizStatusPlotRef = useRef<any>(null);
  const scheduleTypePlotRef = useRef<any>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, batchesRes, quizzesRes, schedulesRes] = await Promise.all([
        apiCall('/users'),
        apiCall('/batches'),
        apiCall('/quizzes'),
        apiCall('/schedules'),
      ]);

      // Users
      if (usersRes.ok) {
        const usersData: User[] = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
        const teachers = usersData.filter(u => u.role === 'teacher').length;
        const students = usersData.filter(u => u.role === 'student').length;
        setStats(prev => ({ ...prev, totalUsers: usersData.length, totalTeachers: teachers, totalStudents: students }));
      } else {
        const err = await usersRes.json().catch(() => ({}));
        message.error(err.error || err.message || 'Failed to fetch users');
      }

      // Batches
      if (batchesRes.ok) {
        const batchesData: any = await batchesRes.json();
        const list: Batch[] = Array.isArray(batchesData) ? batchesData : (batchesData.batches || []);
        setBatches(list);
        setStats(prev => ({ ...prev, totalBatches: list.length }));
      } else {
        const err = await batchesRes.json().catch(() => ({}));
        message.error(err.error || err.message || 'Failed to fetch batches');
      }

      // Quizzes
      if (quizzesRes.ok) {
        const quizData: Quiz[] = await quizzesRes.json();
        setQuizzes(Array.isArray(quizData) ? quizData : []);
      } else {
        const err = await quizzesRes.json().catch(() => ({}));
        message.error(err.error || err.message || 'Failed to fetch quizzes');
      }

      // Schedules
      if (schedulesRes.ok) {
        const scheduleData: ScheduleItem[] = await schedulesRes.json();
        setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
      } else {
        const err = await schedulesRes.json().catch(() => ({}));
        message.error(err.error || err.message || 'Failed to fetch schedules');
      }
    } catch (e) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Derived datasets for charts (data originates from backend lists above)
  const rolePieData = useMemo(() => {
    const admins = users.filter(u => u.role === 'admin').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const students = users.filter(u => u.role === 'student').length;
    return [
      { type: 'Admins', value: admins },
      { type: 'Teachers', value: teachers },
      { type: 'Students', value: students },
    ];
  }, [users]);

  const monthlySignupData = useMemo(() => {
    const months = Array.from({ length: monthsRange }, (_, i) => dayjs().subtract(monthsRange - 1 - i, 'month').startOf('month'));
    const bucket = new Map<string, number>();
    months.forEach(m => bucket.set(m.format('YYYY-MM'), 0));
    users.forEach(u => {
      const key = dayjs(u.created_at).startOf('month').format('YYYY-MM');
      if (bucket.has(key)) bucket.set(key, (bucket.get(key) || 0) + 1);
    });
    return months.map(m => ({ month: m.format('MMM'), key: m.format('YYYY-MM'), signups: bucket.get(m.format('YYYY-MM')) || 0 }));
  }, [users, monthsRange]);

  const topBatchesData = useMemo(() => {
    return [...batches]
      .sort((a, b) => (b.student_count || 0) - (a.student_count || 0))
      .slice(0, 5)
      .map(b => ({ batch: b.name, students: b.student_count || 0 }));
  }, [batches]);

  const quizStatusData = useMemo(() => {
    const statuses = ['draft', 'published', 'archived'];
    const labels = ['Draft', 'Published', 'Archived'];
    return statuses.map((s, idx) => ({ status: labels[idx], count: quizzes.filter(q => (q.status || '').toLowerCase() === s).length }));
  }, [quizzes]);

  const scheduleTypeData = useMemo(() => {
    const types = ['class', 'assignment', 'quiz', 'exam', 'meeting', 'other'];
    const labels = ['Class', 'Assignment', 'Quiz', 'Exam', 'Meeting', 'Other'];
    return types.map((t, idx) => ({ type: labels[idx], value: schedules.filter(s => (s.type || '').toLowerCase() === t).length }));
  }, [schedules]);

  const downloadPlot = (ref: React.MutableRefObject<any>, filename: string) => {
    const plot = ref.current;
    if (!plot) return;
    // Try AntV download helpers first
    if (typeof plot.downloadImage === 'function') {
      try {
        plot.downloadImage(filename.replace(/\.[a-zA-Z0-9]+$/, ''));
        return;
      } catch {
        // fallback below
      }
    }
    const url = typeof plot.toDataURL === 'function' ? plot.toDataURL() : undefined;
    if (!url) {
      message.warning('Download not supported for this chart');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}><Statistic title="Total Users" value={stats.totalUsers} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}><Statistic title="Teachers" value={stats.totalTeachers} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}><Statistic title="Students" value={stats.totalStudents} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}><Statistic title="Batches" value={stats.totalBatches} prefix={<BookOutlined />} /></Card>
        </Col>
      </Row>

      {/* Analytics Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            title="Users by Role"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(rolePlotRef as any, 'users-by-role.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {users.length === 0 ? (
                <Text type="secondary">No user data available</Text>
              ) : (
                <Pie
                  data={rolePieData}
                  height={280}
                  angleField="value"
                  colorField="type"
                  radius={1}
                  innerRadius={0.6}
                  legend={{ position: 'bottom' }}
                  label={{ text: 'value', style: { fontSize: 12 } }}
                  tooltip={{ items: [{ channel: 'x', field: 'type' }, { channel: 'y', field: 'value' }] }}
                  onReady={(plot) => (rolePlotRef.current = plot)}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="User Signups"
            extra={
              <Space size={8}>
                <Select
                  size="small"
                  value={monthsRange}
                  onChange={setMonthsRange}
                  style={{ width: 120 }}
                  options={[
                    { value: 3, label: 'Last 3 months' },
                    { value: 6, label: 'Last 6 months' },
                    { value: 12, label: 'Last 12 months' },
                  ]}
                />
                <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(signupPlotRef as any, 'user-signups.png')}>
                  Download
                </Button>
              </Space>
            }
          >
            <div style={{ height: 280 }}>
              {monthlySignupData.every((v) => v.signups === 0) ? (
                <Text type="secondary">No signup activity in the selected period</Text>
              ) : (
                <Column
                  data={monthlySignupData}
                  height={280}
                  xField="month"
                  yField="signups"
                  columnStyle={{ radius: 6 }}
                  color="#722ed1"
                  yAxis={{ nice: true, tick: { formatter: (v: number) => `${v}` } }}
                  onReady={(plot) => (signupPlotRef.current = plot)}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Analytics Row 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card
            title="Top Batches by Students"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(batchesPlotRef as any, 'top-batches.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {batches.length === 0 ? (
                <Text type="secondary">No batch data available</Text>
              ) : (
                <Column
                  data={topBatchesData}
                  height={280}
                  xField="batch"
                  yField="students"
                  columnStyle={{ radius: 6 }}
                  color="#13c2c2"
                  yAxis={{ nice: true, tick: { formatter: (v: number) => `${v}` } }}
                  onReady={(plot) => (batchesPlotRef.current = plot)}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Quiz Status Distribution"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(quizStatusPlotRef as any, 'quiz-status.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {quizzes.length === 0 ? (
                <Text type="secondary">No quizzes found</Text>
              ) : (
                <Column
                  data={quizStatusData}
                  height={280}
                  xField="status"
                  yField="count"
                  columnStyle={{ radius: 6 }}
                  color={(d: any) => (d.status === 'Draft' ? '#faad14' : d.status === 'Published' ? '#52c41a' : '#8c8c8c')}
                  yAxis={{ nice: true, tick: { formatter: (v: number) => `${v}` } }}
                  onReady={(plot) => (quizStatusPlotRef.current = plot)}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Analytics Row 3 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card
            title="Schedule Types"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(scheduleTypePlotRef as any, 'schedule-types.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {schedules.length === 0 ? (
                <Text type="secondary">No schedules available</Text>
              ) : (
                <Pie
                  data={scheduleTypeData}
                  height={280}
                  angleField="value"
                  colorField="type"
                  radius={1}
                  innerRadius={0.6}
                  legend={{ position: 'bottom' }}
                  label={{ text: 'value', style: { fontSize: 12 } }}
                  tooltip={{ items: [{ channel: 'x', field: 'type' }, { channel: 'y', field: 'value' }] }}
                  onReady={(plot) => (scheduleTypePlotRef.current = plot)}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;