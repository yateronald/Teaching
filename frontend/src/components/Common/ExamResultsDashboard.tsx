import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Tabs, Input, Tag, Space, Row, Col,
  Typography, Statistic, Avatar, Empty, Spin, message
} from 'antd';
import {
  SearchOutlined, TeamOutlined, UserOutlined, ArrowLeftOutlined,
  CalendarOutlined, TrophyOutlined, BarChartOutlined,
  CheckCircleOutlined, DoubleRightOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const { Title, Text } = Typography;

interface ExamResultsDashboardProps {
  mode: 'teacher' | 'admin';
  onBack?: () => void;
}

// Interfaces matching backend payload
interface Batch {
  id: number;
  name: string;
  french_level: string;
  start_date: string;
  end_date: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  student_count: number;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  timezone?: string;
  batches: { id: number; name: string; french_level: string }[];
}

interface COAttempt {
  id: number;
  series_id: number;
  series_name: string;
  completed_at: string;
  time_spent_seconds: number;
  total_questions: number;
  correct_count: number;
  total_points: number;
  earned_points: number;
  score_percentage: number;
  cefr_level: string;
}

interface EEAttempt {
  id: number;
  combinaison_id: number;
  combinaison_name: string;
  submitted_at: string;
  time_used_seconds: number;
  average_score: number;
  overall_level: string;
  task1_score: number;
  task2_score: number;
  task3_score: number;
  task1_level: string;
  task2_level: string;
  task3_level: string;
  month_name: string;
  year: number;
}

interface EOAttempt {
  id: number;
  partie_id: number;
  partie_name: string | null;
  completed_at: string;
  started_at: string;
  duration_seconds: number;
  overall_score: number;
  tache1_score: number;
  tache2_score: number;
  tache3_score: number;
  month_name: string | null;
  year: number | null;
}

interface StudentDetail {
  student: Student;
  co: COAttempt[];
  ee: EEAttempt[];
  eo: EOAttempt[];
}

interface BatchStudentMetric {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  co: { attemptsCount: number; avgScore: number | null; bestScore: number | null; latestAttempt: string | null };
  ee: { attemptsCount: number; avgScore: number | null; bestScore: number | null; latestAttempt: string | null };
  eo: { attemptsCount: number; avgScore: number | null; bestScore: number | null; latestAttempt: string | null };
}

interface BatchDetail {
  batch: Batch;
  students: BatchStudentMetric[];
  analytics: {
    co: { avgScore: number; totalAttempts: number; levelDistribution: Record<string, number> };
    ee: { avgScore: number; totalAttempts: number; levelDistribution: Record<string, number> };
    eo: { avgScore: number; totalAttempts: number; levelDistribution: Record<string, number> };
  };
}

const CEFR_COLORS: Record<string, string> = {
  A1: '#10b981', A2: '#059669', B1: '#3b82f6', B2: '#1d4ed8', C1: '#f59e0b', C2: '#ef4444',
};

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ExamResultsDashboard: React.FC<ExamResultsDashboardProps> = ({ mode, onBack }) => {
  const { apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState<'batches' | 'students'>('batches');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Theme Color Configurations
  const headerGradient = mode === 'teacher'
    ? 'linear-gradient(135deg, #881337 0%, #be123c 100%)' // burgundy/crimson
    : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'; // indigo/navy

  // Lists
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Detail
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [batchDetail, setBatchDetail] = useState<BatchDetail | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);

  // Load lists
  useEffect(() => {
    fetchLists();
  }, [activeTab]);

  const fetchLists = async () => {
    setLoadingList(true);
    try {
      if (activeTab === 'batches') {
        const resp = await apiCall('/tcf-results/batches');
        if (resp.ok) {
          const data = await resp.json();
          setBatches(data);
        } else {
          message.error('Failed to load batches');
        }
      } else {
        const resp = await apiCall('/tcf-results/students');
        if (resp.ok) {
          const data = await resp.json();
          setStudents(data);
        } else {
          message.error('Failed to load students');
        }
      }
    } catch (err) {
      console.error(err);
      message.error('Connection error');
    } finally {
      setLoadingList(false);
    }
  };

  // Load Batch Detail
  const fetchBatchDetail = async (batchId: number) => {
    setLoadingDetail(true);
    try {
      const resp = await apiCall(`/tcf-results/batch/${batchId}`);
      if (resp.ok) {
        const data = await resp.json();
        setBatchDetail(data);
        setSelectedBatchId(batchId);
      } else {
        message.error('Failed to load batch details');
      }
    } catch (err) {
      console.error(err);
      message.error('Connection error');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load Student Detail
  const fetchStudentDetail = async (studentId: number) => {
    setLoadingDetail(true);
    try {
      const resp = await apiCall(`/tcf-results/student/${studentId}`);
      if (resp.ok) {
        const data = await resp.json();
        setStudentDetail(data);
        setSelectedStudentId(studentId);
      } else {
        message.error('Failed to load student details');
      }
    } catch (err) {
      console.error(err);
      message.error('Connection error');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filtered lists for rendering
  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.french_level || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Return logic
  const handleBackToList = () => {
    setSelectedBatchId(null);
    setBatchDetail(null);
    setSelectedStudentId(null);
    setStudentDetail(null);
    fetchLists();
  };

  // Back from student detail to batch detail (when navigated from batch table)
  const handleBackFromStudentToBatch = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
    // selectedBatchId and batchDetail are still set, so the batch detail will render
  };

  // Render Batch Detail Analytics
  const renderBatchDetail = () => {
    if (!batchDetail) return null;

    const { batch, students: batchStudents, analytics } = batchDetail;

    // Data for performance comparison chart
    // Normalizing all scores to percentages: CO is already %, EE/EO are out of 20
    const chartData = batchStudents.map(s => ({
      name: `${s.first_name} ${s.last_name.charAt(0)}.`,
      'Compréhension Orale (%)': s.co.bestScore || 0,
      'Expression Écrite (%)': s.ee.bestScore ? Math.round((s.ee.bestScore / 20) * 100) : 0,
      'Expression Orale (%)': s.eo.bestScore ? Math.round((s.eo.bestScore / 20) * 100) : 0,
    }));

    // Data for CEFR pie charts
    const makePieData = (dist: Record<string, number>) => {
      return Object.entries(dist).map(([level, count]) => ({
        name: level,
        value: count,
      }));
    };

    const coPieData = makePieData(analytics.co.levelDistribution);
    const eePieData = makePieData(analytics.ee.levelDistribution);
    const eoPieData = makePieData(analytics.eo.levelDistribution);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Detail Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList} style={{ borderRadius: 10 }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Batch Insights: {batch.name}</Title>
              <Text type="secondary">
                Level: <Tag color="blue">{batch.french_level}</Tag> | Teacher: {batch.teacher_first_name} {batch.teacher_last_name}
              </Text>
            </div>
          </div>
        </div>

        {/* Overview KPI Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Class Average (CO)"
                value={analytics.co.avgScore}
                suffix="%"
                valueStyle={{ color: '#6366f1', fontWeight: 800 }}
                prefix={<BarChartOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{analytics.co.totalAttempts} total attempts</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Class Average (EE)"
                value={analytics.ee.avgScore}
                suffix="/ 20"
                valueStyle={{ color: '#10b981', fontWeight: 800 }}
                prefix={<TrophyOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{analytics.ee.totalAttempts} total attempts</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Class Average (EO)"
                value={analytics.eo.avgScore}
                suffix="/ 20"
                valueStyle={{ color: '#f59e0b', fontWeight: 800 }}
                prefix={<CheckCircleOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{analytics.eo.totalAttempts} total attempts</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Total Enrolled Students"
                value={batchStudents.length}
                valueStyle={{ color: '#1f2937', fontWeight: 800 }}
                prefix={<TeamOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>In {batch.name}</Text>
            </Card>
          </Col>
        </Row>

        {/* Graphs Section */}
        <Row gutter={[16, 16]}>
          {/* Comparison Bar Chart */}
          <Col xs={24} lg={16}>
            <Card title="Student Performance Comparison (Best Attempt %)" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              {chartData.length === 0 ? (
                <Empty description="No attempt data available for this batch" />
              ) : (
                <div style={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip />
                      <Legend />
                      <Bar dataKey="Compréhension Orale (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expression Écrite (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Expression Orale (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </Col>

          {/* CEFR Level distribution */}
          <Col xs={24} lg={8}>
            <Card title="CEFR Level Distributions" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', height: '100%' }}>
              <Tabs
                items={[
                  {
                    key: 'co',
                    label: 'CO',
                    children: coPieData.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 260 }}>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={coPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                              {coPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CEFR_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
                          {coPieData.map(d => (
                            <Tag key={d.name} color="default" style={{ borderLeft: `4px solid ${CEFR_COLORS[d.name]}`, fontWeight: 600 }}>
                              {d.name}: {d.value}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No CO attempts yet" />
                  },
                  {
                    key: 'ee',
                    label: 'EE',
                    children: eePieData.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 260 }}>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={eePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                              {eePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CEFR_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
                          {eePieData.map(d => (
                            <Tag key={d.name} color="default" style={{ borderLeft: `4px solid ${CEFR_COLORS[d.name]}`, fontWeight: 600 }}>
                              {d.name}: {d.value}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No EE attempts yet" />
                  },
                  {
                    key: 'eo',
                    label: 'EO',
                    children: eoPieData.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 260 }}>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={eoPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label>
                              {eoPieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CEFR_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
                          {eoPieData.map(d => (
                            <Tag key={d.name} color="default" style={{ borderLeft: `4px solid ${CEFR_COLORS[d.name]}`, fontWeight: 600 }}>
                              {d.name}: {d.value}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No EO attempts yet" />
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Student Table */}
        <Card title="Student Performance Directory" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Table
            dataSource={batchStudents}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Student Name',
                key: 'name',
                render: (_, r) => (
                  <Space>
                    <Avatar style={{ backgroundColor: '#f3e8ff', color: '#7c3aed' }}>
                      {r.first_name.charAt(0)}{r.last_name.charAt(0)}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>{r.first_name} {r.last_name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.email}</div>
                    </div>
                  </Space>
                ),
              },
              {
                title: 'Compréhension Orale',
                key: 'co',
                render: (_, r) => (
                  <div>
                    {r.co.attemptsCount > 0 ? (
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ color: '#4f46e5' }}>Avg: {r.co.avgScore}%</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Best: {r.co.bestScore}% ({r.co.attemptsCount} attempts)</Text>
                      </Space>
                    ) : <Text type="secondary" style={{ fontStyle: 'italic' }}>No attempts</Text>}
                  </div>
                )
              },
              {
                title: 'Expression Écrite',
                key: 'ee',
                render: (_, r) => (
                  <div>
                    {r.ee.attemptsCount > 0 ? (
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ color: '#059669' }}>Avg: {r.ee.avgScore}/20</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Best: {r.ee.bestScore}/20 ({r.ee.attemptsCount} attempts)</Text>
                      </Space>
                    ) : <Text type="secondary" style={{ fontStyle: 'italic' }}>No attempts</Text>}
                  </div>
                )
              },
              {
                title: 'Expression Orale',
                key: 'eo',
                render: (_, r) => (
                  <div>
                    {r.eo.attemptsCount > 0 ? (
                      <Space direction="vertical" size={0}>
                        <Text strong style={{ color: '#d97706' }}>Avg: {r.eo.avgScore}/20</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>Best: {r.eo.bestScore}/20 ({r.eo.attemptsCount} attempts)</Text>
                      </Space>
                    ) : <Text type="secondary" style={{ fontStyle: 'italic' }}>No attempts</Text>}
                  </div>
                )
              },
              {
                title: 'Action',
                key: 'action',
                align: 'right',
                render: (_, r) => (
                  <Button
                    type="link"
                    icon={<DoubleRightOutlined />}
                    onClick={() => fetchStudentDetail(r.id)}
                  >
                    View Student
                  </Button>
                )
              }
            ]}
          />
        </Card>
      </div>
    );
  };

  // Render Student Detail Analytics
  const renderStudentDetail = () => {
    if (!studentDetail) return null;

    const { student, co, ee, eo } = studentDetail;

    // Combine progression data
    // Format dates to simple Locale string
    const formatDate = (dStr: string) => {
      const d = new Date(dStr);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    // Progression requires sorted attempts
    const coProg = [...co].reverse().map(a => ({
      date: formatDate(a.completed_at),
      type: 'CO',
      score: a.score_percentage,
    }));

    const eeProg = [...ee].reverse().map(a => ({
      date: formatDate(a.submitted_at),
      type: 'EE',
      score: a.average_score ? Math.round((a.average_score / 20) * 100) : 0,
    }));

    const eoProg = [...eo].reverse().map(a => ({
      date: formatDate(a.completed_at),
      type: 'EO',
      score: a.overall_score ? Math.round((a.overall_score / 20) * 100) : 0,
    }));

    // Merge progressions by date
    const mergedMap: Record<string, { date: string; CO?: number; EE?: number; EO?: number }> = {};
    const addPoints = (arr: { date: string; type: string; score: number }[]) => {
      arr.forEach(pt => {
        if (!mergedMap[pt.date]) mergedMap[pt.date] = { date: pt.date };
        mergedMap[pt.date][pt.type as 'CO' | 'EE' | 'EO'] = pt.score;
      });
    };
    addPoints(coProg);
    addPoints(eeProg);
    addPoints(eoProg);

    const progressionData = Object.values(mergedMap).sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return da.getTime() - db.getTime();
    });

    const coBest = co.length ? Math.max(...co.map(a => a.score_percentage)) : 0;
    const eeBest = ee.length ? Math.max(...ee.map(a => a.average_score)) : 0;
    const eoBest = eo.length ? Math.max(...eo.map(a => a.overall_score)) : 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={selectedBatchId ? handleBackFromStudentToBatch : handleBackToList} style={{ borderRadius: 10 }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Student Report: {student.first_name} {student.last_name}</Title>
              <Text type="secondary">
                Email: {student.email} | Timezone: {student.timezone || 'UTC'}
              </Text>
            </div>
          </div>
        </div>

        {/* Student KPIs */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Compréhension Orale (Best)"
                value={coBest}
                suffix="%"
                valueStyle={{ color: '#4f46e5', fontWeight: 800 }}
                prefix={<BarChartOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{co.length} attempts taken</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Expression Écrite (Best)"
                value={eeBest}
                suffix="/ 20"
                valueStyle={{ color: '#059669', fontWeight: 800 }}
                prefix={<TrophyOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{ee.length} attempts taken</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <Statistic
                title="Expression Orale (Best)"
                value={eoBest}
                suffix="/ 20"
                valueStyle={{ color: '#d97706', fontWeight: 800 }}
                prefix={<CheckCircleOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>{eo.length} attempts taken</Text>
            </Card>
          </Col>
        </Row>

        {/* Score progression chart */}
        <Card title="Score Progression Over Time (%)" bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          {progressionData.length === 0 ? (
            <Empty description="No attempt history yet to plot progression" />
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={progressionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="CO" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                  <Line type="monotone" dataKey="EE" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                  <Line type="monotone" dataKey="EO" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Detailed Attempts Breakdown */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <Tabs
            defaultActiveKey="co"
            items={[
              {
                key: 'co',
                label: (<span><BarChartOutlined /> Compréhension Orale ({co.length})</span>),
                children: (
                  <Table
                    dataSource={co}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                      { title: 'Series Name', dataIndex: 'series_name', key: 'series_name', render: (text) => <Text strong>{text}</Text> },
                      { title: 'Score %', dataIndex: 'score_percentage', key: 'score_percentage', render: (val) => <Text strong style={{ color: '#4f46e5' }}>{val}%</Text> },
                      { title: 'Points', key: 'points', render: (_, r) => `${r.earned_points} / ${r.total_points}` },
                      { title: 'CEFR Level', dataIndex: 'cefr_level', key: 'cefr_level', render: (val) => <Tag color={val ? 'blue' : 'default'}>{val || 'N/A'}</Tag> },
                      { title: 'Completed At', dataIndex: 'completed_at', key: 'completed_at', render: (d) => new Date(d).toLocaleString() },
                      { title: 'Time Spent', dataIndex: 'time_spent_seconds', key: 'time_spent_seconds', render: (s) => `${Math.floor(s / 60)}m ${s % 60}s` }
                    ]}
                  />
                )
              },
              {
                key: 'ee',
                label: (<span><TrophyOutlined /> Expression Écrite ({ee.length})</span>),
                children: (
                  <Table
                    dataSource={ee}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                      { title: 'Combinaison', dataIndex: 'combinaison_name', key: 'combinaison_name', render: (_, r) => `${r.combinaison_name} (${r.month_name} ${r.year})` },
                      { title: 'Average Score', dataIndex: 'average_score', key: 'average_score', render: (val) => <Text strong style={{ color: '#059669' }}>{val} / 20</Text> },
                      { title: 'Overall Level', dataIndex: 'overall_level', key: 'overall_level', render: (val) => <Tag color="green">{val}</Tag> },
                      { title: 'Task 1 Score', key: 't1', render: (_, r) => `${r.task1_score}/20 (${r.task1_level})` },
                      { title: 'Task 2 Score', key: 't2', render: (_, r) => `${r.task2_score}/20 (${r.task2_level})` },
                      { title: 'Task 3 Score', key: 't3', render: (_, r) => `${r.task3_score}/20 (${r.task3_level})` },
                      { title: 'Submitted At', dataIndex: 'submitted_at', key: 'submitted_at', render: (d) => new Date(d).toLocaleString() }
                    ]}
                  />
                )
              },
              {
                key: 'eo',
                label: (<span><CheckCircleOutlined /> Expression Orale ({eo.length})</span>),
                children: (
                  <Table
                    dataSource={eo}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    columns={[
                      { title: 'Partie', dataIndex: 'partie_name', key: 'partie_name', render: (_, r) => r.partie_name ? `${r.partie_name} (${r.month_name} ${r.year})` : <Text italic>Free Practice</Text> },
                      { title: 'Overall Score', dataIndex: 'overall_score', key: 'overall_score', render: (val) => <Text strong style={{ color: '#d97706' }}>{val} / 20</Text> },
                      { title: 'Task 1 Score', dataIndex: 'tache1_score', key: 't1_score', render: (val) => `${val || 0} / 20` },
                      { title: 'Task 2 Score', dataIndex: 'tache2_score', key: 't2_score', render: (val) => `${val || 0} / 20` },
                      { title: 'Task 3 Score', dataIndex: 'tache3_score', key: 't3_score', render: (val) => `${val || 0} / 20` },
                      { title: 'Completed At', dataIndex: 'completed_at', key: 'completed_at', render: (d) => new Date(d).toLocaleString() },
                      { title: 'Duration', dataIndex: 'duration_seconds', key: 'duration_seconds', render: (s) => `${Math.floor(s / 60)}m ${s % 60}s` }
                    ]}
                  />
                )
              }
            ]}
          />
        </Card>
      </div>
    );
  };

  // Main list views
  const renderBatchesList = () => {
    return (
      <Row gutter={[16, 16]}>
        {filteredBatches.length === 0 ? (
          <Col span={24}>
            <Empty description="No batches found" />
          </Col>
        ) : (
          filteredBatches.map(b => (
            <Col xs={24} sm={12} lg={8} key={b.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => fetchBatchDetail(b.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 16 }}>{b.name}</Text>
                  <Tag color="purple">{b.french_level}</Tag>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#64748b' }}>
                  <div><TeamOutlined /> {b.student_count} Enrolled Student{b.student_count !== 1 ? 's' : ''}</div>
                  {b.teacher_first_name && (
                    <div><UserOutlined /> Teacher: {b.teacher_first_name} {b.teacher_last_name}</div>
                  )}
                  <div><CalendarOutlined /> Started: {new Date(b.start_date).toLocaleDateString()}</div>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>
    );
  };

  const renderStudentsList = () => {
    return (
      <Row gutter={[16, 16]}>
        {filteredStudents.length === 0 ? (
          <Col span={24}>
            <Empty description="No students found" />
          </Col>
        ) : (
          filteredStudents.map(s => (
            <Col xs={24} sm={12} lg={8} key={s.id}>
              <Card
                hoverable
                style={{ borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onClick={() => fetchStudentDetail(s.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Avatar style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    {s.first_name.charAt(0)}{s.last_name.charAt(0)}
                  </Avatar>
                  <div>
                    <Text strong style={{ fontSize: 15 }}>{s.first_name} {s.last_name}</Text>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.email}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  {s.batches.length > 0 ? (
                    <div>
                      Batches: {s.batches.map(b => (
                        <Tag key={b.id} color="blue" style={{ marginRight: 4, marginTop: 4 }}>
                          {b.name}
                        </Tag>
                      ))}
                    </div>
                  ) : <span style={{ fontStyle: 'italic' }}>No assigned batches</span>}
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>
    );
  };

  if (loadingDetail) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Student detail takes priority — user may have drilled in from a batch
  if (selectedStudentId) {
    return renderStudentDetail();
  }

  if (selectedBatchId) {
    return renderBatchDetail();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Banner */}
      <div
        style={{
          background: headerGradient,
          borderRadius: 16,
          padding: '24px 32px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>📊 Exam Preparation Dashboard</Title>
          <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
            Track, analyze, and compare student results for TCF CO, EE, and EO.
          </Text>
        </div>
        {onBack && (
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ borderRadius: 10 }}>
            Back to Management
          </Button>
        )}
      </div>

      {/* Selector and Search */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <RadioGroupToggle active={activeTab} onChange={setActiveTab} />
          
          <Input
            placeholder={activeTab === 'batches' ? 'Search batches...' : 'Search students...'}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 300, borderRadius: 8 }}
            allowClear
          />
        </div>
      </Card>

      {/* Main List */}
      {loadingList ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Spin size="large" />
        </div>
      ) : activeTab === 'batches' ? (
        renderBatchesList()
      ) : (
        renderStudentsList()
      )}
    </div>
  );
};

// Internal Toggle Component to avoid using deprecated antd constructs
const RadioGroupToggle: React.FC<{ active: 'batches' | 'students'; onChange: (v: 'batches' | 'students') => void }> = ({ active, onChange }) => {
  return (
    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 4 }}>
      <button
        onClick={() => onChange('batches')}
        style={{
          border: 'none',
          padding: '6px 16px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 13,
          backgroundColor: active === 'batches' ? '#fff' : 'transparent',
          color: active === 'batches' ? '#1e1b4b' : '#64748b',
          boxShadow: active === 'batches' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <Space><TeamOutlined /> Batches</Space>
      </button>
      <button
        onClick={() => onChange('students')}
        style={{
          border: 'none',
          padding: '6px 16px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: 13,
          backgroundColor: active === 'students' ? '#fff' : 'transparent',
          color: active === 'students' ? '#1e1b4b' : '#64748b',
          boxShadow: active === 'students' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <Space><UserOutlined /> Students</Space>
      </button>
    </div>
  );
};

export default ExamResultsDashboard;
