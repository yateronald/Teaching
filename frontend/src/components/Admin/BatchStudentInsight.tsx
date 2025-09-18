import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Select, Table, Tag, Empty, Spin, message, Divider } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BatchStudentInsightProps { batchId: string; }

interface BreakdownRow { quiz_id: number; quiz_title: string; total_score: number | null; max_score: number | null; percentage: number | null; submitted_at: string | null; }
interface StudentWithMetrics { id: number; first_name: string; last_name: string; email: string; breakdown: BreakdownRow[]; }
interface QuizAgg { quiz_id: number; quiz_title: string; }

const gradeFor = (pct: number | null | undefined) => {
  if (pct == null || Number.isNaN(pct)) return { letter: '-', color: 'default' as const };
  if (pct >= 90) return { letter: 'A', color: 'green' as const };
  if (pct >= 85) return { letter: 'A-', color: 'green' as const };
  if (pct >= 80) return { letter: 'B+', color: 'blue' as const };
  if (pct >= 75) return { letter: 'B', color: 'blue' as const };
  if (pct >= 70) return { letter: 'C+', color: 'gold' as const };
  if (pct >= 60) return { letter: 'C', color: 'gold' as const };
  if (pct >= 50) return { letter: 'D', color: 'orange' as const };
  return { letter: 'F', color: 'red' as const };
};

const BatchStudentInsight: React.FC<BatchStudentInsightProps> = ({ batchId }) => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithMetrics[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAgg[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiCall(`/batches/${batchId}/insights`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          message.error(err.error || 'Failed to load insights');
          setLoading(false);
          return;
        }
        const data = await res.json();
        const studentsData: StudentWithMetrics[] = data.students || [];
        const quizAgg: QuizAgg[] = (data.quizzes || []).map((q: any) => ({ quiz_id: q.quiz_id, quiz_title: q.quiz_title }));
        setStudents(studentsData);
        setQuizzes(quizAgg);
        if (studentsData.length && !selectedStudentId) setSelectedStudentId(studentsData[0].id);
      } catch (e) {
        message.error('Error loading insights');
      } finally {
        setLoading(false);
      }
    };
    if (batchId) void load();
  }, [batchId]);

  const studentOptions = useMemo(() => students.map(s => ({ label: `${s.first_name} ${s.last_name}`, value: s.id })), [students]);
  const current = useMemo(() => students.find(s => s.id === selectedStudentId) || null, [students, selectedStudentId]);

  // Helper function to format numbers - show whole numbers without .00
  const formatNumber = (num: number | null | undefined): string => {
    if (num == null) return '0';
    if (Number.isInteger(num)) {
      return num.toString();
    }
    return num.toFixed(2);
  };

  const metrics = useMemo(() => {
    if (!current) return { total: 0, max: 0, avg: null as number | null, attempted: 0, totalQuizzes: quizzes.length };
    const rows = current.breakdown || [];
    const attemptedRows = rows.filter(r => r.submitted_at);
    const sumScore = attemptedRows.reduce((a, r) => a + (r.total_score ?? 0), 0);
    const sumMax = attemptedRows.reduce((a, r) => a + (r.max_score ?? 0), 0);
    const percValues = attemptedRows.filter(r => typeof r.percentage === 'number').map(r => r.percentage as number);
    const avg = percValues.length ? percValues.reduce((a, c) => a + c, 0) / percValues.length : null;
    return { total: sumScore, max: sumMax, avg: avg, attempted: attemptedRows.length, totalQuizzes: rows.length || quizzes.length };
  }, [current, quizzes.length]);

  const dataSource = useMemo(() => {
    if (!current) return [] as any[];
    const rows = current.breakdown || [];
    return rows.map(r => ({
      key: `${current.id}-${r.quiz_id}`,
      quiz: r.quiz_title,
      score: r.total_score != null && r.max_score != null ? 
        `${formatNumber(r.total_score)}/${formatNumber(r.max_score)}` : '-/-',
      percent: r.percentage != null ? r.percentage : null,
      submitted_at: r.submitted_at ? dayjs(r.submitted_at).format('MMM DD, YYYY HH:mm') : '-',
    }));
  }, [current]);

  const columns = [
    { title: 'Quiz', dataIndex: 'quiz', key: 'quiz' },
    { title: 'Score', dataIndex: 'score', key: 'score' },
    { title: 'Percentage', dataIndex: 'percent', key: 'percent', render: (v: number | null) => v == null ? <Tag>-</Tag> : <Tag color={v >= 60 ? 'green' : 'red'}>{formatNumber(v)}%</Tag> },
    { title: 'Submitted At', dataIndex: 'submitted_at', key: 'submitted_at' },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <div>
        <Title level={4} style={{ marginBottom: 0 }}>Student Insight</Title>
        <Text type="secondary">Professional marksheet with totals, average, grade and per-quiz breakdown</Text>
      </div>

      <Card size="small">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
            <Spin />
          </div>
        ) : students.length === 0 ? (
          <Empty description="No students found for this batch" />
        ) : (
          <>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={12}>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary">Filter by student</Text>
                  <Select
                    showSearch
                    placeholder="Select a student"
                    options={studentOptions}
                    value={selectedStudentId as any}
                    onChange={setSelectedStudentId}
                    style={{ width: '100%' }}
                    allowClear={false}
                  />
                </Space>
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            {current ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={6}>
                    <Card>
                      <Statistic title="Total Score" value={`${formatNumber(metrics.total)}/${formatNumber(metrics.max)}`} />
                    </Card>
                  </Col>
                  <Col xs={24} md={6}>
                    <Card>
                      <Statistic title="Average %" value={metrics.avg != null ? `${formatNumber(metrics.avg)}%` : '-'} />
                    </Card>
                  </Col>
                  <Col xs={24} md={6}>
                    <Card>
                      <Statistic title="Quizzes Attempted" value={`${metrics.attempted}/${metrics.totalQuizzes}`} />
                    </Card>
                  </Col>
                  <Col xs={24} md={6}>
                    <Card>
                      <Statistic title="Grade" valueRender={() => {
                        const g = gradeFor(metrics.avg);
                        return <Tag color={g.color} style={{ fontSize: 16, padding: '2px 10px' }}>{g.letter}</Tag>;
                      }} />
                    </Card>
                  </Col>
                </Row>

                <Card title="Per-Quiz Breakdown" style={{ marginTop: 12 }}>
                  <Table columns={columns as any} dataSource={dataSource} pagination={{ pageSize: 8 }} />
                </Card>
              </>
            ) : (
              <Empty description="Select a student to view marksheet" />
            )}
          </>
        )}
      </Card>
    </Space>
  );
};

export default BatchStudentInsight;