import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Typography, message, Select, Button, Space, Skeleton } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  DownloadOutlined,
  RiseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

// Replace Chart.js/react-chartjs-2 with Ant Design Plots
import { Pie, Column } from '@ant-design/plots';

const { Text } = Typography;

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

/* ── Premium KPI Card ── */
const KpiCard: React.FC<{
  label: string; value: number | string; icon: React.ReactNode;
  accent: string; gradient: string; sub?: string;
}> = ({ label, value, icon, accent, gradient, sub }) => (
  <div style={{
    borderRadius: 14, padding: '14px 16px',
    background: '#fff', border: '1px solid #f0f0f8',
    boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'all 0.2s ease',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(99,102,241,0.06)'; }}
  >
    <div style={{ position: 'absolute', right: -20, top: -20, width: 70, height: 70, borderRadius: '50%', background: gradient, opacity: 0.08, pointerEvents: 'none' }} />
    <div style={{
      width: 40, height: 40, borderRadius: 11,
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, color: '#fff', flexShrink: 0,
      boxShadow: `0 4px 12px ${accent}40`,
    }}>
      {icon}
    </div>
    <div style={{ position: 'relative', zIndex: 1, minWidth: 0, flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>}
    </div>
  </div>
);

/* ── Chart Card Wrapper ── */
const ChartCard: React.FC<{
  title: string; icon: React.ReactNode; accentColor: string;
  extra?: React.ReactNode; children: React.ReactNode;
}> = ({ title, icon, accentColor, extra, children }) => (
  <div style={{
    background: '#fff', borderRadius: 18,
    border: '1px solid #f0f0f8',
    boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
    overflow: 'hidden',
  }}>
    <div style={{
      padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid #f5f5fa',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `${accentColor}14`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: accentColor, fontSize: 15,
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{title}</span>
      </div>
      {extra && <div>{extra}</div>}
    </div>
    <div style={{ padding: '20px 22px' }}>
      {children}
    </div>
  </div>
);

/* ── Dashboard Skeleton ── */
const DashboardSkeleton: React.FC = () => (
  <div>
    {/* Header skeleton */}
    <div style={{ marginBottom: 28 }}>
      <Skeleton.Input active style={{ width: 260, height: 30, borderRadius: 8 }} />
      <div style={{ marginTop: 8 }}>
        <Skeleton.Input active style={{ width: 320, height: 14, borderRadius: 6 }} />
      </div>
    </div>

    {/* KPI skeleton */}
    <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
      {[1, 2, 3, 4].map(i => (
        <Col xs={24} sm={12} md={6} key={i}>
          <div style={{
            borderRadius: 18, padding: '22px 24px',
            background: '#fff', border: '1px solid #f0f0f8',
            boxShadow: '0 2px 16px rgba(99,102,241,0.06)',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <Skeleton.Avatar active size={48} shape="square" style={{ borderRadius: 14 }} />
            <div style={{ flex: 1 }}>
              <Skeleton.Input active style={{ width: '70%', height: 11, borderRadius: 4, marginBottom: 10 }} block />
              <Skeleton.Input active style={{ width: 50, height: 28, borderRadius: 6 }} />
            </div>
          </div>
        </Col>
      ))}
    </Row>

    {/* Charts skeleton */}
    <Row gutter={[16, 16]}>
      {[1, 2].map(i => (
        <Col xs={24} md={12} key={i}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f0f0f8', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skeleton.Avatar active size={32} shape="square" style={{ borderRadius: 10 }} />
              <Skeleton.Input active style={{ width: 140, height: 16, borderRadius: 4 }} />
            </div>
            <div style={{ padding: '20px 22px' }}>
              <Skeleton.Button active block style={{ height: 260, borderRadius: 12 }} />
            </div>
          </div>
        </Col>
      ))}
    </Row>
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      {[1, 2].map(i => (
        <Col xs={24} md={12} key={i}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f0f0f8', overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Skeleton.Avatar active size={32} shape="square" style={{ borderRadius: 10 }} />
              <Skeleton.Input active style={{ width: 160, height: 16, borderRadius: 4 }} />
            </div>
            <div style={{ padding: '20px 22px' }}>
              <Skeleton.Button active block style={{ height: 260, borderRadius: 12 }} />
            </div>
          </div>
        </Col>
      ))}
    </Row>
  </div>
);

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  /* ── Loading state ── */
  if (loading) return <DashboardSkeleton />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
          Admin Dashboard
        </div>
        <Text style={{ fontSize: 13, color: '#94a3b8' }}>
          Platform overview · {users.length} users · {batches.length} batches · {quizzes.length} quizzes
        </Text>
      </div>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard label="Total Users" value={stats.totalUsers}
            icon={<UserOutlined />} accent="#6366f1"
            gradient="linear-gradient(135deg, #6366f1, #818cf8)"
            sub={`${stats.totalTeachers} teachers · ${stats.totalStudents} students`} />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard label="Teachers" value={stats.totalTeachers}
            icon={<TeamOutlined />} accent="#0ea5e9"
            gradient="linear-gradient(135deg, #0ea5e9, #38bdf8)" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard label="Students" value={stats.totalStudents}
            icon={<RiseOutlined />} accent="#22c55e"
            gradient="linear-gradient(135deg, #22c55e, #4ade80)" />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard label="Batches" value={stats.totalBatches}
            icon={<BookOutlined />} accent="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" />
        </Col>
      </Row>

      {/* Analytics Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <ChartCard title="Users by Role" icon={<UserOutlined />} accentColor="#6366f1"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(rolePlotRef as any, 'users-by-role.png')}
                style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', fontWeight: 600, fontSize: 12 }}>
                Export
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {users.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Text type="secondary">No user data available</Text>
                </div>
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
          </ChartCard>
        </Col>

        <Col xs={24} md={12}>
          <ChartCard title="User Signups" icon={<RiseOutlined />} accentColor="#8b5cf6"
            extra={
              <Space size={8}>
                <Select
                  size="small"
                  value={monthsRange}
                  onChange={setMonthsRange}
                  style={{ width: 130, borderRadius: 8 }}
                  options={[
                    { value: 3, label: 'Last 3 months' },
                    { value: 6, label: 'Last 6 months' },
                    { value: 12, label: 'Last 12 months' },
                  ]}
                />
                <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(signupPlotRef as any, 'user-signups.png')}
                  style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', fontWeight: 600, fontSize: 12 }}>
                  Export
                </Button>
              </Space>
            }
          >
            <div style={{ height: 280 }}>
              {monthlySignupData.every((v) => v.signups === 0) ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Text type="secondary">No signup activity in the selected period</Text>
                </div>
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
          </ChartCard>
        </Col>
      </Row>

      {/* Analytics Row 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ChartCard title="Top Batches by Students" icon={<TeamOutlined />} accentColor="#0ea5e9">
            <div style={{ height: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
              {batches.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Text type="secondary">No batch data available</Text>
                </div>
              ) : (
                topBatchesData.map((item, idx) => {
                  const max = topBatchesData[0]?.students || 1;
                  const pct = Math.max((item.students / max) * 100, 8);
                  const colors = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={item.batch}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155', maxWidth: '75%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.batch}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color }}>
                          {item.students}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 10, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${color}, ${color}cc)`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ChartCard>
        </Col>

        <Col xs={24} md={12}>
          <ChartCard title="Quiz Status Distribution" icon={<FileTextOutlined />} accentColor="#f59e0b"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(quizStatusPlotRef as any, 'quiz-status.png')}
                style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', fontWeight: 600, fontSize: 12 }}>
                Export
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {quizzes.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Text type="secondary">No quizzes found</Text>
                </div>
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
          </ChartCard>
        </Col>
      </Row>

      {/* Analytics Row 3 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ChartCard title="Schedule Types" icon={<CalendarOutlined />} accentColor="#ec4899"
            extra={
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadPlot(scheduleTypePlotRef as any, 'schedule-types.png')}
                style={{ borderRadius: 8, borderColor: '#e0e7ff', color: '#6366f1', fontWeight: 600, fontSize: 12 }}>
                Export
              </Button>
            }
          >
            <div style={{ height: 280 }}>
              {schedules.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Text type="secondary">No schedules available</Text>
                </div>
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
          </ChartCard>
        </Col>

        {/* Quick summary card */}
        <Col xs={24} md={12}>
          <ChartCard title="Platform Summary" icon={<AppstoreOutlined />} accentColor="#6366f1">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Active Quizzes', value: quizzes.filter(q => q.status === 'published').length, color: '#22c55e' },
                { label: 'Draft Quizzes', value: quizzes.filter(q => q.status === 'draft').length, color: '#f59e0b' },
                { label: 'Total Schedules', value: schedules.length, color: '#6366f1' },
                { label: 'Avg Students/Batch', value: batches.length > 0 ? Math.round(batches.reduce((s, b) => s + (b.student_count || 0), 0) / batches.length) : 0, color: '#0ea5e9' },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#f8fafc', borderRadius: 14, padding: '18px 16px',
                  border: '1px solid #f1f5f9', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginTop: 5, textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;