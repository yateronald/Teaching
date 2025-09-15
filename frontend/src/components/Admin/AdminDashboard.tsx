import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, message, Select, Button, Space } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

// Chart.js / react-chartjs-2
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

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

  // Chart refs for export
  const roleChartRef = useRef<ChartJS<'doughnut'> | null>(null);
  const signupChartRef = useRef<ChartJS<'bar'> | null>(null);
  const batchesChartRef = useRef<ChartJS<'bar'> | null>(null);
  const quizStatusChartRef = useRef<ChartJS<'bar'> | null>(null);
  const scheduleTypeChartRef = useRef<ChartJS<'doughnut'> | null>(null);

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

  // Derived datasets for charts
  const roleChartData = useMemo(() => {
    const admins = users.filter(u => u.role === 'admin').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const students = users.filter(u => u.role === 'student').length;
    return {
      labels: ['Admins', 'Teachers', 'Students'],
      datasets: [
        {
          data: [admins, teachers, students],
          backgroundColor: ['#ff4d4f', '#1677ff', '#52c41a'],
        },
      ],
    };
  }, [users]);

  const monthlySignupChart = useMemo(() => {
    const months = Array.from({ length: monthsRange }, (_, i) => dayjs().subtract(monthsRange - 1 - i, 'month').startOf('month'));
    const labels = months.map(m => m.format('MMM'));
    const bucket = new Map<string, number>();
    months.forEach(m => bucket.set(m.format('YYYY-MM'), 0));
    users.forEach(u => {
      const key = dayjs(u.created_at).startOf('month').format('YYYY-MM');
      if (bucket.has(key)) bucket.set(key, (bucket.get(key) || 0) + 1);
    });
    const values = months.map(m => bucket.get(m.format('YYYY-MM')) || 0);
    return {
      labels,
      datasets: [
        {
          label: 'Signups',
          data: values,
          backgroundColor: '#722ed1',
          borderRadius: 6,
        },
      ],
    };
  }, [users, monthsRange]);

  const topBatchesChart = useMemo(() => {
    const sorted = [...batches]
      .sort((a, b) => (b.student_count || 0) - (a.student_count || 0))
      .slice(0, 5);
    return {
      labels: sorted.map(b => b.name),
      datasets: [
        {
          label: 'Students',
          data: sorted.map(b => b.student_count || 0),
          backgroundColor: '#13c2c2',
          borderRadius: 6,
        },
      ],
    };
  }, [batches]);

  const quizStatusChart = useMemo(() => {
    const statuses = ['draft', 'published', 'archived'];
    const counts = statuses.map(s => quizzes.filter(q => (q.status || '').toLowerCase() === s).length);
    return {
      labels: ['Draft', 'Published', 'Archived'],
      datasets: [
        {
          label: 'Quizzes',
          data: counts,
          backgroundColor: ['#faad14', '#52c41a', '#8c8c8c'],
          borderRadius: 6,
        },
      ],
    };
  }, [quizzes]);

  const scheduleTypeChartData = useMemo(() => {
    const types = ['class', 'assignment', 'quiz', 'exam', 'meeting', 'other'];
    const labels = ['Class', 'Assignment', 'Quiz', 'Exam', 'Meeting', 'Other'];
    const colors = ['#1677ff', '#722ed1', '#faad14', '#ff4d4f', '#13c2c2', '#bfbfbf'];
    const counts = types.map(t => schedules.filter(s => (s.type || '').toLowerCase() === t).length);
    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
        },
      ],
    };
  }, [schedules]);

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: { enabled: true },
    },
  };

  const downloadChart = (ref: React.MutableRefObject<ChartJS | null>, filename: string) => {
    const url = ref.current?.toBase64Image();
    if (!url) return;
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
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadChart(roleChartRef as any, 'users-by-role.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {users.length === 0 ? (
                <Text type="secondary">No user data available</Text>
              ) : (
                <Doughnut ref={roleChartRef} data={roleChartData} options={doughnutOptions} />
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
                <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadChart(signupChartRef as any, 'user-signups.png')}>
                  Download
                </Button>
              </Space>
            }
          >
            <div style={{ height: 280 }}>
              {monthlySignupChart.datasets[0].data.every((v: number) => v === 0) ? (
                <Text type="secondary">No signup activity in the selected period</Text>
              ) : (
                <Bar ref={signupChartRef} data={monthlySignupChart as any} options={barOptions} />
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
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadChart(batchesChartRef as any, 'top-batches.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {batches.length === 0 ? (
                <Text type="secondary">No batch data available</Text>
              ) : (
                <Bar ref={batchesChartRef} data={topBatchesChart as any} options={barOptions} />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            title="Quiz Status Distribution"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadChart(quizStatusChartRef as any, 'quiz-status.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {quizzes.length === 0 ? (
                <Text type="secondary">No quizzes found</Text>
              ) : (
                <Bar ref={quizStatusChartRef} data={quizStatusChart as any} options={barOptions} />
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
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadChart(scheduleTypeChartRef as any, 'schedule-types.png')}>
                Download
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {schedules.length === 0 ? (
                <Text type="secondary">No schedules available</Text>
              ) : (
                <Doughnut ref={scheduleTypeChartRef} data={scheduleTypeChartData} options={doughnutOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;