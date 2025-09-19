import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Row, Col, Card, Statistic, List, Typography, Avatar, Space, Modal, Table, Tag, Button, Descriptions, Badge } from 'antd';
import { UserOutlined, CheckCircleOutlined, FileTextOutlined, TeamOutlined, EyeOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
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
  student_count?: number; // Add this field from backend
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

// Enhanced student type for modal display
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

const TeacherDashboard: React.FC = () => {
  const { apiCall, user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [studentsModalVisible, setStudentsModalVisible] = useState(false);
  const [quizzesModalVisible, setQuizzesModalVisible] = useState(false);
  const [batchesModalVisible, setBatchesModalVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(520);

  useEffect(() => {
    const onResize = () => {
      const w = containerRef.current?.clientWidth ?? 1000;
      setChartWidth(Math.max(320, Math.min(900, Math.floor((w - 32) / 2))));
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
          // Normalize: backend returns raw array for batches
          setBatches(Array.isArray(d) ? d : (d?.data || d?.batches || []));
        }
        if (qRes.ok) {
          const d = await qRes.json();
          // Normalize quizzes shape defensively
          setQuizzes(Array.isArray(d) ? d : (d?.data || d?.quizzes || []));
        }
        if (sRes.ok) {
          const d = await sRes.json();
          // Normalize students shape defensively
          setStudents(Array.isArray(d) ? d : (d?.data || d?.students || []));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [apiCall, user?.id]);

  // Process unique students (handle students in multiple batches)
  const uniqueStudentsData = useMemo(() => {
    const studentMap = new Map<number, StudentWithBatches>();
    
    students.forEach(student => {
      const existing = studentMap.get(student.id);
      if (existing) {
        // Student exists, add batch to their batch list
        if (!existing.batches.includes(student.batch_name)) {
          existing.batches.push(student.batch_name);
        }
        // Update average score (take the higher one or average them)
        existing.average_score = Math.max(existing.average_score, student.average_score || 0);
        existing.total_quizzes += (student.quiz_scores || []).length;
      } else {
        // New student
        const lastActivity = student.quiz_scores && student.quiz_scores.length > 0 
          ? student.quiz_scores.sort((a, b) => dayjs(b.submitted_at).valueOf() - dayjs(a.submitted_at).valueOf())[0].submitted_at
          : undefined;
          
        studentMap.set(student.id, {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          email: student.email,
          batches: [student.batch_name],
          average_score: student.average_score || 0,
          total_quizzes: (student.quiz_scores || []).length,
          last_activity: lastActivity
        });
      }
    });
    
    return Array.from(studentMap.values());
  }, [students]);

  // KPIs - using unique student count
  const totalStudents = uniqueStudentsData.length;
  console.log(uniqueStudentsData)
  
  // Unique student count for KPI (deduplicate across batches by student ID)
  const uniqueStudentCount  = useMemo(() => {
    const uniqueStudentIds = new Set<number>();
    
    students.forEach(s => {
      uniqueStudentIds.add(s.id);
    });
    
    console.log('uniqueStudentCount', uniqueStudentIds.size);
    return uniqueStudentIds.size;
  }, [students]);
  
  const averageScore = Math.round(
    totalStudents ? uniqueStudentsData.reduce((a, s) => a + (s.average_score || 0), 0) / totalStudents : 0
  );
  const activeQuizzes = quizzes.filter(q => q.is_active).length;
  const totalBatches = batches.length;

  // Trend: monthly average percentage across all submissions
  const { trendMonths, trendData } = useMemo(() => {
    const map = new Map<string, number[]>();
    students.forEach(s => {
      (s.quiz_scores || []).forEach(q => {
        const key = dayjs(q.submitted_at).format('YYYY-MM');
        const pct = q.max_score ? (q.score / q.max_score) * 100 : 0;
        const arr = map.get(key) || [];
        arr.push(pct);
        map.set(key, arr);
      });
    });
    const months = Array.from(map.keys()).sort();
    return {
      trendMonths: months.map(m => dayjs(m + '-01').format('MMM YYYY')),
      trendData: months.map(m => {
        const arr = map.get(m)!;
        return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
      })
    };
  }, [students]);

  // Average by batch
  const { batchNames, batchAvg } = useMemo(() => {
    const agg = new Map<string, number[]>();
    students.forEach(s => {
      const arr = agg.get(s.batch_name) || [];
      arr.push(s.average_score || 0);
      agg.set(s.batch_name, arr);
    });
    const names = Array.from(agg.keys());
    const avg = names.map(n => {
      const a = agg.get(n)!;
      return Math.round(a.reduce((x, y) => x + y, 0) / (a.length || 1));
    });
    return { batchNames: names, batchAvg: avg };
  }, [students]);

  // Quiz status and submissions
  const pieData = useMemo(() => {
    const active = quizzes.filter(q => q.is_active).length;
    const inactive = quizzes.length - active;
    return [
      { id: 0, value: active, label: 'Active' },
      { id: 1, value: inactive, label: 'Inactive' }
    ];
  }, [quizzes]);

  const topQuizzesBySubmissions = useMemo(() => {
    const sorted = [...quizzes]
      .sort((a, b) => (b.submissions_count || 0) - (a.submissions_count || 0))
      .slice(0, 6);
    return {
      submissionTitles: sorted.map(q => q.title),
      submissionCounts: sorted.map(q => q.submissions_count || 0)
    };
  }, [quizzes]);

  // Students lists
  const topStudents = useMemo(
    () => [...students].sort((a, b) => (b.average_score || 0) - (a.average_score || 0)).slice(0, 6),
    [students]
  );
  const atRiskStudents = useMemo(
    () => students.filter(s => (s.average_score || 0) < 50).slice(0, 6),
    [students]
  );

  // Recent activities from student quiz_scores (latest 8)
  const recentActivities = useMemo(() => {
    const rows: { student: string; quiz: string; percentage: number; date: string }[] = [];
    students.forEach(s => {
      (s.quiz_scores || []).forEach(q => {
        rows.push({
          student: `${s.first_name} ${s.last_name}`,
          quiz: q.quiz_title,
          percentage: q.max_score ? Math.round((q.score / q.max_score) * 100) : 0,
          date: q.submitted_at
        });
      });
    });
    return rows.sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()).slice(0, 8);
  }, [students]);

  const { submissionTitles, submissionCounts } = topQuizzesBySubmissions;

  // Active quizzes list for modal
  const activeQuizzesList = useMemo(() => quizzes.filter(q => q.is_active), [quizzes]);

  // Table columns for modals
  const studentColumns: ColumnsType<StudentWithBatches> = [
    {
      title: 'Student',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
          <div>
            <Text strong>{`${record.first_name} ${record.last_name}`}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Batches',
      dataIndex: 'batches',
      key: 'batches',
      render: (batches: string[]) => (
        <Space wrap>
          {batches.map((batch, index) => (
            <Tag key={index} color={batches.length > 1 ? 'orange' : 'blue'}>
              {batch}
            </Tag>
          ))}
          {batches.length > 1 && <Badge count="Multi-Batch" style={{ backgroundColor: '#f50' }} />}
        </Space>
      ),
    },
    {
      title: 'Average Score',
      dataIndex: 'average_score',
      key: 'average_score',
      render: (score: number) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ 
            color: score >= 80 ? '#52c41a' : score >= 60 ? '#fa8c16' : '#f5222d',
            fontSize: '16px'
          }}>
            {Math.round(score)}%
          </Text>
        </div>
      ),
      sorter: (a, b) => a.average_score - b.average_score,
    },
    {
      title: 'Quizzes Completed',
      dataIndex: 'total_quizzes',
      key: 'total_quizzes',
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#722ed1' }} />
      ),
    },
    {
      title: 'Last Activity',
      dataIndex: 'last_activity',
      key: 'last_activity',
      render: (date?: string) => (
        <Text type="secondary">
          {date ? dayjs(date).format('MMM DD, YYYY') : 'No activity'}
        </Text>
      ),
    },
  ];

  const quizColumns: ColumnsType<Quiz> = [
    {
      title: 'Quiz Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Questions',
      dataIndex: 'total_questions',
      key: 'total_questions',
      render: (count?: number) => count || 'N/A',
    },
    {
      title: 'Time Limit',
      dataIndex: 'duration_minutes',
      key: 'duration_minutes',
      render: (time?: number) => time ? `${time} min` : 'N/A',
    },
    {
      title: 'Submissions',
      dataIndex: 'submissions_count',
      key: 'submissions_count',
      render: (count?: number) => (
        <Badge count={count || 0} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date?: string) => (
        <Text type="secondary">
          {date ? dayjs(date).format('MMM DD, YYYY HH:mm') : 'N/A'}
        </Text>
      ),
    },
  ];

  const batchColumns: ColumnsType<Batch> = [
    {
      title: 'Batch Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc?: string) => desc || 'No description',
    },
    {
      title: 'Students',
      key: 'students',
      render: (_, record) => (
        <div>
          <Text>{record.student_count || 0}</Text>
          {record.max_students && (
            <div style={{ width: '100px', marginTop: '4px' }}>
              <div style={{
                height: '6px',
                backgroundColor: '#f0f0f0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#1890ff',
                  width: `${Math.min(100, ((record.student_count || 0) / record.max_students) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_, record) => {
        if (!record.start_date || !record.end_date) return 'N/A';
        return `${dayjs(record.start_date).format('MMM DD')} - ${dayjs(record.end_date).format('MMM DD, YYYY')}`;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (!record.start_date || !record.end_date) return <Tag>Unknown</Tag>;
        
        const now = dayjs();
        const start = dayjs(record.start_date);
        const end = dayjs(record.end_date);
        
        if (now.isBefore(start)) {
          return <Tag color="blue">Upcoming</Tag>;
        } else if (now.isAfter(end)) {
          return <Tag color="default">Completed</Tag>;
        } else {
          return <Tag color="green">Active</Tag>;
        }
      },
    },
  ];

  return (
    <div ref={containerRef}>
      <Title level={2}>Teacher Insights Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setStudentsModalVisible(true)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic 
              title="Total Students" 
              value={uniqueStudentCount} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#52c41a' }} 
              suffix={<EyeOutlined style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic title="Average Score" value={averageScore} suffix="%" prefix={<CheckCircleOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setQuizzesModalVisible(true)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic 
              title="Active Quizzes" 
              value={activeQuizzes} 
              prefix={<FileTextOutlined />} 
              valueStyle={{ color: '#722ed1' }} 
              suffix={<EyeOutlined style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable 
            onClick={() => setBatchesModalVisible(true)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            bodyStyle={{ padding: '20px' }}
          >
            <Statistic 
              title="Batches" 
              value={totalBatches} 
              prefix={<TeamOutlined />} 
              valueStyle={{ color: '#1890ff' }} 
              suffix={<EyeOutlined style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Performance Trend (Avg % by Month)">
            {trendMonths.length ? (
              <Box sx={{ width: '100%' }}>
                <LineChart xAxis={[{ data: trendMonths, scaleType: 'point' }]} series={[{ data: trendData, color: '#1677ff', area: true }]} width={chartWidth} height={320} />
              </Box>
            ) : (
              <Text type="secondary">No submissions yet</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Quiz Status Distribution">
            <PieChart series={[{ data: pieData, innerRadius: 40, outerRadius: 120, paddingAngle: 3 }]} width={chartWidth} height={320} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Average Score by Batch">
            {batchNames.length ? (
              <BarChart xAxis={[{ data: batchNames, scaleType: 'band' }]} series={[{ data: batchAvg, color: '#52c41a' }]} width={chartWidth} height={320} />
            ) : (
              <Text type="secondary">No batch/student data</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Top Quizzes by Submissions">
            {submissionTitles.length ? (
              <BarChart xAxis={[{ data: submissionTitles, scaleType: 'band' }]} series={[{ data: submissionCounts, color: '#722ed1' }]} width={chartWidth} height={320} />
            ) : (
              <Text type="secondary">No submissions yet</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Top Students">
            <List loading={loading} dataSource={topStudents} renderItem={(s) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#13c2c2' }} icon={<UserOutlined />} />}
                  title={`${s.first_name} ${s.last_name}`}
                  description={<Text type="secondary">Batch: {s.batch_name}</Text>}
                />
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 16 }}>{Math.round(s.average_score || 0)}%</Text>
                </div>
              </List.Item>
            )} />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="At-Risk Students (Avg < 50%)" headStyle={{ color: '#cf1322' }}>
            <List loading={loading} dataSource={atRiskStudents} renderItem={(s) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#fa8c16' }} icon={<UserOutlined />} />}
                  title={`${s.first_name} ${s.last_name}`}
                  description={<Text type="secondary">Batch: {s.batch_name}</Text>}
                />
                <div style={{ textAlign: 'right' }}>
                  <Text strong style={{ fontSize: 16 }}>{Math.round(s.average_score || 0)}%</Text>
                </div>
              </List.Item>
            )} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Recent Activity (Latest Submissions)">
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Text strong>{item.student}</Text>
                    <Text type="secondary">{item.quiz} • {dayjs(item.date).format('MMM DD, YYYY HH:mm')}</Text>
                  </Space>
                  <Text strong>{item.percentage}%</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Students Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: '#1890ff' }} />
            <span>All Students ({totalStudents})</span>
          </Space>
        }
        open={studentsModalVisible}
        onCancel={() => setStudentsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setStudentsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Total Students">{totalStudents}</Descriptions.Item>
            <Descriptions.Item label="Average Score">{averageScore}%</Descriptions.Item>
            <Descriptions.Item label="Multi-Batch Students">
              {uniqueStudentsData.filter(s => s.batches.length > 1).length}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <Table
          columns={studentColumns}
          dataSource={uniqueStudentsData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </Modal>

      {/* Quizzes Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined style={{ color: '#722ed1' }} />
            <span>Active Quizzes ({activeQuizzes})</span>
          </Space>
        }
        open={quizzesModalVisible}
        onCancel={() => setQuizzesModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setQuizzesModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Total Quizzes">{quizzes.length}</Descriptions.Item>
            <Descriptions.Item label="Active Quizzes">{activeQuizzes}</Descriptions.Item>
            <Descriptions.Item label="Total Submissions">
              {activeQuizzesList.reduce((sum, q) => sum + (q.submissions_count || 0), 0)}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <Table
          columns={quizColumns}
          dataSource={activeQuizzesList}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </Modal>

      {/* Batches Modal */}
      <Modal
        title={
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>All Batches ({totalBatches})</span>
          </Space>
        }
        open={batchesModalVisible}
        onCancel={() => setBatchesModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setBatchesModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Total Batches">{totalBatches}</Descriptions.Item>
            <Descriptions.Item label="Total Capacity">
              {batches.reduce((sum, b) => sum + (b.max_students || 0), 0)}
            </Descriptions.Item>
            <Descriptions.Item label="Current Enrollment">
              {batches.reduce((sum, b) => sum + (b.current_students || 0), 0)}
            </Descriptions.Item>
          </Descriptions>
        </div>
        <Table
          columns={batchColumns}
          dataSource={batches}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          size="middle"
        />
      </Modal>
    </div>
  );
};

export default TeacherDashboard;