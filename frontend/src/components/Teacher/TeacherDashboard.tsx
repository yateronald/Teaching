import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Skeleton, Typography, Avatar, Space, Modal, Table, Tag, Button, Descriptions, Badge } from 'antd';
import { UserOutlined, CheckCircleOutlined, FileTextOutlined, TeamOutlined, EyeOutlined, ClockCircleOutlined, RiseOutlined, FireOutlined, TrophyOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

type Quiz = { id: number; title: string; is_active: boolean; submissions_count?: number; created_at?: string; time_limit?: number; total_questions?: number; duration_minutes?: number; end_date?: string };
type Batch = {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  max_students?: number;
  current_students?: number;
  student_count?: number;
  french_level?: string;
};
type Student = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  batch_name: string;
  average_score: number;
  quiz_scores: { quiz_title: string; score: number; max_score: number; submitted_at: string }[];
};
type StudentWithBatches = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  batches: string[];
  average_score: number;
  total_quizzes: number;
  last_activity?: string;
};

/* ── KPI card ── */
interface KpiCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
  shadow: string;
  onClick?: () => void;
  clickable?: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, suffix, icon, gradient, shadow, onClick, clickable }) => (
  <div
    onClick={onClick}
    style={{
      borderRadius: 20,
      padding: '24px 28px',
      minHeight: 120,
      background: gradient,
      boxShadow: shadow,
      cursor: clickable ? 'pointer' : 'default',
      transition: 'transform 0.18s, box-shadow 0.18s',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
    onMouseEnter={e => {
      if (clickable) {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    }}
  >
    {/* decorative circle */}
    <div style={{
      position: 'absolute', right: -18, top: -18,
      width: 90, height: 90, borderRadius: '50%',
      background: 'rgba(255,255,255,0.10)',
    }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.70)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          {label}
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: -1, whiteSpace: 'nowrap' }}>
          {value}{suffix && <span style={{ fontSize: 20, fontWeight: 600, marginLeft: 2 }}>{suffix}</span>}
        </div>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, color: '#fff', flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
    {clickable && (
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.75)', fontSize: 11, height: 18 }}>
        <EyeOutlined style={{ fontSize: 10 }} /> View details
      </div>
    )}
    {!clickable && <div style={{ marginTop: 14, height: 18 }} />}
  </div>
);

/* ── Section title ── */
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; color?: string }> = ({ icon, title, color = '#6366f1' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
    <span style={{ color, fontSize: 18 }}>{icon}</span>
    <Text strong style={{ fontSize: 15, color: '#1a1d2e' }}>{title}</Text>
  </div>
);

/* ── Chart card wrapper ── */
const ChartCard: React.FC<{ title: React.ReactNode; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{
    background: '#fff',
    borderRadius: 20,
    border: '1px solid #f0f0f8',
    boxShadow: '0 2px 20px rgba(99,102,241,0.06)',
    padding: '22px 24px',
    height: '100%',
  }}>
    <div style={{ marginBottom: 20 }}>{title}</div>
    {children}
  </div>
);

const TeacherDashboard: React.FC = () => {
  const { apiCall, user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [quizzesModalVisible, setQuizzesModalVisible] = useState(false);
  const [batchesModalVisible, setBatchesModalVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(520);

  useEffect(() => {
    const onResize = () => {
      const w = containerRef.current?.clientWidth ?? 1000;
      setChartWidth(Math.max(300, Math.min(900, Math.floor((w - 40) / 2))));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [bRes, qRes, sRes] = await Promise.all([
          apiCall(`/batches/teacher/${user?.id}`),
          apiCall(`/quizzes/teacher/${user?.id}`),
          apiCall(`/users/students/teacher/${user?.id}`)
        ]);
        if (bRes.ok) {
          const d = await bRes.json();
          const raw = Array.isArray(d) ? d : (d?.data || d?.batches || []);
          setBatches((raw || []).map((b: any) => ({
            ...b,
            student_count: b?.student_count != null ? Number(b.student_count) : 0,
            max_students: b?.max_students != null ? Number(b.max_students) : b?.max_students,
            current_students: b?.current_students != null ? Number(b.current_students) : b?.current_students,
          })));
        }
        if (qRes.ok) {
          const d = await qRes.json();
          const raw = Array.isArray(d) ? d : (d?.data || d?.quizzes || []);
          setQuizzes((raw || []).map((q: any) => ({
            ...q,
            is_active: typeof q?.is_active === 'boolean' ? q.is_active : !!Number(q?.is_active),
            submissions_count: q?.submissions_count != null ? Number(q.submissions_count) : 0,
            total_questions: q?.total_questions != null ? Number(q.total_questions) : q?.total_questions,
            duration_minutes: q?.duration_minutes != null ? Number(q.duration_minutes) : q?.duration_minutes,
          })));
        }
        if (sRes.ok) {
          const d = await sRes.json();
          const raw = Array.isArray(d) ? d : (d?.data || d?.students || []);
          setStudents((raw || []).map((s: any) => ({
            ...s,
            average_score: s?.average_score != null ? Number(s.average_score) : 0,
            quiz_scores: (s?.quiz_scores || []).map((qs: any) => ({
              ...qs,
              score: qs?.score != null ? Number(qs.score) : qs?.score,
              max_score: qs?.max_score != null ? Number(qs.max_score) : qs?.max_score,
            })),
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [apiCall, user?.id]);

  /* ── Derived data ── */
  const uniqueStudentsData = useMemo(() => {
    const map = new Map<number, StudentWithBatches>();
    students.forEach(s => {
      const ex = map.get(s.id);
      if (ex) {
        if (!ex.batches.includes(s.batch_name)) ex.batches.push(s.batch_name);
        ex.average_score = Math.max(ex.average_score, s.average_score || 0);
        ex.total_quizzes += (s.quiz_scores || []).length;
      } else {
        const last = s.quiz_scores?.length
          ? [...s.quiz_scores].sort((a, b) => dayjs(b.submitted_at).valueOf() - dayjs(a.submitted_at).valueOf())[0].submitted_at
          : undefined;
        map.set(s.id, { id: s.id, first_name: s.first_name, last_name: s.last_name, email: s.email, batches: [s.batch_name], average_score: s.average_score || 0, total_quizzes: (s.quiz_scores || []).length, last_activity: last });
      }
    });
    return Array.from(map.values());
  }, [students]);

  const uniqueStudentCount = useMemo(() => new Set(students.map(s => s.id)).size, [students]);
  const totalStudents = uniqueStudentsData.length;
  const averageScore = Math.round(totalStudents ? uniqueStudentsData.reduce((a, s) => a + (s.average_score || 0), 0) / totalStudents : 0);
  const activeQuizzes = quizzes.filter(q => q.is_active).length;
  const totalBatches = batches.length;

  const { trendMonths, trendData } = useMemo(() => {
    const map = new Map<string, { totalScore: number; totalMax: number }>();
    students.forEach(s => (s.quiz_scores || []).forEach(q => {
      const key = dayjs(q.submitted_at).format('YYYY-MM');
      const ex = map.get(key) || { totalScore: 0, totalMax: 0 };
      ex.totalScore += q.score || 0; ex.totalMax += q.max_score || 0;
      map.set(key, ex);
    }));
    const months = Array.from(map.keys()).sort();
    return { trendMonths: months.map(m => dayjs(m + '-01').format('MMM YYYY')), trendData: months.map(m => { const d = map.get(m)!; return Math.round(d.totalMax > 0 ? (d.totalScore / d.totalMax) * 100 : 0); }) };
  }, [students]);

  const { batchNames, batchAvg } = useMemo(() => {
    const agg = new Map<string, { totalScore: number; totalMax: number }>();
    students.forEach(s => (s.quiz_scores || []).forEach(q => {
      const ex = agg.get(s.batch_name) || { totalScore: 0, totalMax: 0 };
      ex.totalScore += q.score || 0; ex.totalMax += q.max_score || 0;
      agg.set(s.batch_name, ex);
    }));
    const names = Array.from(agg.keys());
    return { batchNames: names, batchAvg: names.map(n => { const d = agg.get(n)!; return Math.round(d.totalMax > 0 ? (d.totalScore / d.totalMax) * 100 : 0); }) };
  }, [students]);

  const pieData = useMemo(() => {
    const active = quizzes.filter(q => q.is_active).length;
    return [{ id: 0, value: active, label: 'Active' }, { id: 1, value: quizzes.length - active, label: 'Inactive' }];
  }, [quizzes]);

  const { submissionTitles, submissionCounts } = useMemo(() => {
    const sorted = [...quizzes].sort((a, b) => (b.submissions_count || 0) - (a.submissions_count || 0)).slice(0, 6);
    return { submissionTitles: sorted.map(q => q.title), submissionCounts: sorted.map(q => q.submissions_count || 0) };
  }, [quizzes]);

  const topStudents = useMemo(() => [...students].sort((a, b) => (b.average_score || 0) - (a.average_score || 0)).slice(0, 6), [students]);
  const atRiskStudents = useMemo(() => students.filter(s => (s.average_score || 0) < 50).slice(0, 6), [students]);
  const recentActivities = useMemo(() => {
    const rows: { student: string; quiz: string; percentage: number; date: string }[] = [];
    students.forEach(s => (s.quiz_scores || []).forEach(q => rows.push({ student: `${s.first_name} ${s.last_name}`, quiz: q.quiz_title, percentage: q.max_score ? Math.round((q.score / q.max_score) * 100) : 0, date: q.submitted_at })));
    return rows.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()).slice(0, 8);
  }, [students]);

  const activeQuizzesList = useMemo(() => quizzes.filter(q => q.is_active), [quizzes]);

  /* ── Table columns ── */
  const studentColumns: ColumnsType<StudentWithBatches> = [
    { title: 'Student', key: 'name', render: (_, r) => (<Space><Avatar style={{ backgroundColor: '#6366f1' }} icon={<UserOutlined />} /><div><Text strong>{`${r.first_name} ${r.last_name}`}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{r.email}</Text></div></Space>) },
    { title: 'Batches', dataIndex: 'batches', key: 'batches', render: (b: string[]) => (<Space wrap>{b.map((x, i) => <Tag key={i} color={b.length > 1 ? 'orange' : 'blue'}>{x}</Tag>)}{b.length > 1 && <Badge count="Multi" style={{ backgroundColor: '#f50' }} />}</Space>) },
    { title: 'Avg Score', dataIndex: 'average_score', key: 'avg', render: (s: number) => <Text strong style={{ color: s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444', fontSize: 16 }}>{Math.round(s)}%</Text>, sorter: (a, b) => a.average_score - b.average_score },
    { title: 'Quizzes', dataIndex: 'total_quizzes', key: 'total_quizzes', render: (c: number) => <Badge count={c} style={{ backgroundColor: '#6366f1' }} /> },
    { title: 'Last Activity', dataIndex: 'last_activity', key: 'last_activity', render: (d?: string) => <Text type="secondary">{d ? dayjs(d).format('MMM DD, YYYY') : '—'}</Text> },
  ];

  const quizColumns: ColumnsType<Quiz> = [
    { title: 'Title', dataIndex: 'title', key: 'title', render: (t: string) => <Text strong>{t}</Text> },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: (a: boolean) => <Tag color={a ? 'green' : 'red'} icon={a ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>{a ? 'Active' : 'Inactive'}</Tag> },
    { title: 'Questions', dataIndex: 'total_questions', key: 'total_questions', render: (c?: number) => c ?? '—' },
    { title: 'Duration', dataIndex: 'duration_minutes', key: 'duration_minutes', render: (t?: number) => t ? `${t} min` : '—' },
    { title: 'Submissions', dataIndex: 'submissions_count', key: 'submissions_count', render: (c?: number) => <Badge count={c || 0} style={{ backgroundColor: '#22c55e' }} /> },
    { title: 'End Date', dataIndex: 'end_date', key: 'end_date', render: (d?: string) => <Text type="secondary">{d ? dayjs(d).format('MMM DD, YY HH:mm') : '—'}</Text> },
  ];

  const batchColumns: ColumnsType<Batch> = [
    { title: 'Name', dataIndex: 'name', key: 'name', render: (n: string) => <Text strong>{n}</Text> },
    { title: 'Students', key: 'students', render: (_, r) => <Text>{r.student_count || 0}{r.max_students ? ` / ${r.max_students}` : ''}</Text> },
    { title: 'Duration', key: 'duration', render: (_, r) => (!r.start_date || !r.end_date) ? '—' : `${dayjs(r.start_date).format('MMM DD')} – ${dayjs(r.end_date).format('MMM DD, YYYY')}` },
    { title: 'Status', key: 'status', render: (_, r) => { if (!r.start_date || !r.end_date) return <Tag>Unknown</Tag>; const now = dayjs(); if (now.isBefore(dayjs(r.start_date))) return <Tag color="blue">Upcoming</Tag>; if (now.isAfter(dayjs(r.end_date))) return <Tag color="default">Completed</Tag>; return <Tag color="green">Active</Tag>; } },
  ];

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div style={{ padding: '0 2px' }}>
        {/* Animated header pulse */}
        <div style={{ marginBottom: 32 }}>
          <Skeleton.Input active style={{ width: 280, height: 30, borderRadius: 8 }} />
          <div style={{ marginTop: 6 }}>
            <Skeleton.Input active style={{ width: 180, height: 16, borderRadius: 6 }} />
          </div>
        </div>

        {/* KPI skeleton */}
        <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
          {[
            'linear-gradient(135deg, #4f46e5, #6366f1)',
            'linear-gradient(135deg, #3730a3, #4f46e5)',
            'linear-gradient(135deg, #4f46e5, #6366f1)',
            'linear-gradient(135deg, #3730a3, #4f46e5)',
          ].map((g, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <div style={{
                borderRadius: 20, padding: '24px 28px',
                background: g, opacity: 0.15 + i * 0.05,
                animation: 'pulse 1.5s ease-in-out infinite',
                minHeight: 110,
              }} />
            </Col>
          ))}
        </Row>

        {/* Charts skeleton */}
        <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
          {[1, 2].map(i => (
            <Col xs={24} md={12} key={i}>
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #f0f0f8', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                <Skeleton.Input active style={{ width: 200, height: 16, borderRadius: 6, marginBottom: 20 }} />
                <div style={{ background: '#f8f9ff', borderRadius: 12, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#c7d2fe' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📈</div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Loading chart data...</Text>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
          {[1, 2].map(i => (
            <Col xs={24} md={12} key={i}>
              <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #f0f0f8', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                <Skeleton.Input active style={{ width: 200, height: 16, borderRadius: 6, marginBottom: 20 }} />
                <div style={{ background: '#f8f9ff', borderRadius: 12, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#c7d2fe' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
                    <Text type="secondary" style={{ fontSize: 13 }}>Loading chart data...</Text>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  /* ── LOADED STATE ── */
  return (
    <div ref={containerRef} style={{ paddingBottom: 32 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1a1d2e', fontSize: 22 }}>
          Teacher Insights Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Welcome back, {user?.first_name || 'Teacher'} · {dayjs().format('dddd, MMMM D YYYY')}
        </Text>
      </div>

      {/* ── KPI Cards — sticky at top, no scroll ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'linear-gradient(to bottom, #f5f6ff 80%, transparent)',
        paddingBottom: 16,
        marginBottom: 12,
      }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <KpiCard
              label="Total Students"
              value={uniqueStudentCount}
              icon={<UserOutlined />}
              gradient="linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
              shadow="0 6px 24px rgba(99,102,241,0.28)"
              onClick={() => setStudentsModalVisible(true)}
              clickable
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <KpiCard
              label="Average Score"
              value={averageScore}
              suffix="%"
              icon={<RiseOutlined />}
              gradient="linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)"
              shadow="0 6px 24px rgba(79,70,229,0.28)"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <KpiCard
              label="Active Quizzes"
              value={activeQuizzes}
              icon={<FileTextOutlined />}
              gradient="linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
              shadow="0 6px 24px rgba(99,102,241,0.28)"
              onClick={() => setQuizzesModalVisible(true)}
              clickable
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <KpiCard
              label="Batches"
              value={totalBatches}
              icon={<TeamOutlined />}
              gradient="linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)"
              shadow="0 6px 24px rgba(79,70,229,0.28)"
              onClick={() => setBatchesModalVisible(true)}
              clickable
            />
          </Col>
        </Row>
      </div>

      {/* ── Charts section (scrollable) ── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <ChartCard title={<SectionTitle icon={<RiseOutlined />} title="Performance Trend (Avg % by Month)" color="#6366f1" />}>
            {trendMonths.length ? (
              <Box sx={{ width: '100%' }}>
                <LineChart
                  xAxis={[{ data: trendMonths, scaleType: 'point' }]}
                  series={[{ data: trendData, color: '#6366f1', area: true }]}
                  width={chartWidth}
                  height={300}
                />
              </Box>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, flexDirection: 'column', gap: 10, color: '#c7d2fe' }}>
                <div style={{ fontSize: 40 }}>📈</div>
                <Text type="secondary">No submission data yet</Text>
              </div>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} md={12}>
          <ChartCard title={<SectionTitle icon={<FireOutlined />} title="Quiz Status Distribution" color="#ef4444" />}>
            <PieChart
              series={[{ data: pieData, innerRadius: 50, outerRadius: 120, paddingAngle: 4 }]}
              width={chartWidth}
              height={300}
            />
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <ChartCard title={<SectionTitle icon={<TrophyOutlined />} title="Average Score by Batch" color="#22c55e" />}>
            {batchNames.length ? (
              <BarChart
                xAxis={[{ data: batchNames, scaleType: 'band' }]}
                series={[{ data: batchAvg, color: '#22c55e' }]}
                width={chartWidth}
                height={300}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 40 }}>📊</div>
                <Text type="secondary">No batch data yet</Text>
              </div>
            )}
          </ChartCard>
        </Col>
        <Col xs={24} md={12}>
          <ChartCard title={<SectionTitle icon={<FileTextOutlined />} title="Top Quizzes by Submissions" color="#8b5cf6" />}>
            {submissionTitles.length ? (
              <BarChart
                xAxis={[{ data: submissionTitles, scaleType: 'band' }]}
                series={[{ data: submissionCounts, color: '#8b5cf6' }]}
                width={chartWidth}
                height={300}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 40 }}>📝</div>
                <Text type="secondary">No submissions yet</Text>
              </div>
            )}
          </ChartCard>
        </Col>
      </Row>

      {/* ── Student lists ── */}
      <Row gutter={[20, 20]} style={{ marginBottom: 20 }}>
        <Col xs={24} md={12}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f8', boxShadow: '0 2px 20px rgba(99,102,241,0.06)', padding: '22px 24px', height: '100%' }}>
            <SectionTitle icon={<TrophyOutlined />} title="Top Performers" color="#f59e0b" />
            <div style={{ marginTop: 16 }}>
              {topStudents.length === 0 ? (
                <Text type="secondary">No students yet</Text>
              ) : (
                topStudents.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < topStudents.length - 1 ? '1px solid #f5f5f8' : 'none',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c2f' : '#e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: i < 3 ? '#fff' : '#64748b',
                    }}>{i + 1}</div>
                    <Avatar size={32} style={{ backgroundColor: '#6366f1', flexShrink: 0 }} icon={<UserOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: 'block', fontSize: 13 }}>{s.first_name} {s.last_name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{s.batch_name}</Text>
                    </div>
                    <div style={{
                      background: (s.average_score || 0) >= 80 ? '#dcfce7' : (s.average_score || 0) >= 60 ? '#fef3c7' : '#fee2e2',
                      color: (s.average_score || 0) >= 80 ? '#16a34a' : (s.average_score || 0) >= 60 ? '#d97706' : '#dc2626',
                      borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700,
                    }}>
                      {Math.round(s.average_score || 0)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #fee2e2', boxShadow: '0 2px 20px rgba(239,68,68,0.06)', padding: '22px 24px', height: '100%' }}>
            <SectionTitle icon={<WarningOutlined />} title="At-Risk Students (Avg < 50%)" color="#ef4444" />
            <div style={{ marginTop: 16 }}>
              {atRiskStudents.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', padding: '12px 0' }}>
                  <CheckCircleOutlined /> <Text style={{ color: '#22c55e' }}>No at-risk students — great work!</Text>
                </div>
              ) : (
                atRiskStudents.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < atRiskStudents.length - 1 ? '1px solid #fef2f2' : 'none',
                  }}>
                    <Avatar size={32} style={{ backgroundColor: '#f59e0b', flexShrink: 0 }} icon={<UserOutlined />} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: 'block', fontSize: 13 }}>{s.first_name} {s.last_name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{s.batch_name}</Text>
                    </div>
                    <div style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '3px 10px', fontSize: 13, fontWeight: 700 }}>
                      {Math.round(s.average_score || 0)}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* ── Recent Activity ── */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f0f0f8', boxShadow: '0 2px 20px rgba(99,102,241,0.06)', padding: '22px 24px' }}>
        <SectionTitle icon={<ClockCircleOutlined />} title="Recent Submissions" color="#0ea5e9" />
        <div style={{ marginTop: 16 }}>
          {recentActivities.length === 0 ? (
            <Text type="secondary">No submissions yet</Text>
          ) : (
            recentActivities.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 0',
                borderBottom: i < recentActivities.length - 1 ? '1px solid #f5f5f8' : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: item.percentage >= 70 ? '#22c55e' : item.percentage >= 50 ? '#f59e0b' : '#ef4444',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 13 }}>{item.student}</Text>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.quiz} · {dayjs(item.date).format('MMM DD, YYYY HH:mm')}
                  </Text>
                </div>
                <div style={{
                  background: item.percentage >= 70 ? '#dcfce7' : item.percentage >= 50 ? '#fef3c7' : '#fee2e2',
                  color: item.percentage >= 70 ? '#16a34a' : item.percentage >= 50 ? '#d97706' : '#dc2626',
                  borderRadius: 8, padding: '3px 12px', fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {item.percentage}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal title={<Space><UserOutlined style={{ color: '#6366f1' }} /><span>All Students ({totalStudents})</span></Space>} open={studentsModalVisible} onCancel={() => setStudentsModalVisible(false)} width={1000} footer={[<Button key="close" onClick={() => setStudentsModalVisible(false)}>Close</Button>]}>
        <div style={{ marginBottom: 12 }}>
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Total">{totalStudents}</Descriptions.Item>
            <Descriptions.Item label="Avg Score">{averageScore}%</Descriptions.Item>
            <Descriptions.Item label="Multi-Batch">{uniqueStudentsData.filter(s => s.batches.length > 1).length}</Descriptions.Item>
          </Descriptions>
        </div>
        <Table columns={studentColumns} dataSource={uniqueStudentsData} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true }} size="middle" />
      </Modal>

      <Modal title={<Space><FileTextOutlined style={{ color: '#0ea5e9' }} /><span>Active Quizzes ({activeQuizzes})</span></Space>} open={quizzesModalVisible} onCancel={() => setQuizzesModalVisible(false)} width={1000} footer={[<Button key="close" onClick={() => setQuizzesModalVisible(false)}>Close</Button>]}>
        <div style={{ marginBottom: 12 }}>
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Total Quizzes">{quizzes.length}</Descriptions.Item>
            <Descriptions.Item label="Active">{activeQuizzes}</Descriptions.Item>
            <Descriptions.Item label="Total Submissions">{activeQuizzesList.reduce((s, q) => s + (q.submissions_count || 0), 0)}</Descriptions.Item>
          </Descriptions>
        </div>
        <Table columns={quizColumns} dataSource={activeQuizzesList} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true }} size="middle" />
      </Modal>

      <Modal title={<Space><TeamOutlined style={{ color: '#f59e0b' }} /><span>All Batches ({totalBatches})</span></Space>} open={batchesModalVisible} onCancel={() => setBatchesModalVisible(false)} width={900} footer={[<Button key="close" onClick={() => setBatchesModalVisible(false)}>Close</Button>]}>
        <Table columns={batchColumns} dataSource={batches} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true }} size="middle" />
      </Modal>
    </div>
  );
};

export default TeacherDashboard;