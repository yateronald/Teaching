import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Empty, Spin, Progress, Tooltip, Alert } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined, RiseOutlined, FallOutlined, CalendarOutlined, DashboardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;

interface QuizResult {
  id: number;
  quiz_id: number;
  quiz_title: string;
  batch_id: number | null;
  batch_name: string | null;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  submitted_at: string | null;
  results_locked?: boolean | 0 | 1;
}

interface BatchAggregate {
  batch_id: number | null;
  batch_name: string;
  quizzes_count: number;
  completed_count: number;
  average_percentage: number;
  best_percentage: number;
  lowest_percentage: number;
  last_quiz_date: string | null;
  pass_rate: number; // percentage
}

const toFixed = (v: number | null | undefined, d = 2) => (v == null ? 0 : Number(v.toFixed(d)));

const StudentMarksheet: React.FC = () => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiCall('/quizzes/student/results');
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.message || 'Failed to fetch results');
        }
        const data: QuizResult[] = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [apiCall]);

  const completedResults = useMemo(() => results.filter(r => !r.results_locked && r.percentage != null), [results]);

  const overall = useMemo(() => {
    if (completedResults.length === 0) {
      return {
        total: 0,
        average: 0,
        best: 0,
        passRate: 0,
      };
    }
    const total = completedResults.length;
    const avg = completedResults.reduce((s, r) => s + (r.percentage || 0), 0) / total;
    const best = Math.max(...completedResults.map(r => r.percentage || 0));
    const passRate = (completedResults.filter(r => (r.percentage || 0) >= 50).length / total) * 100;
    return { total, average: toFixed(avg), best: toFixed(best), passRate: toFixed(passRate) };
  }, [completedResults]);

  const batchAggregates: BatchAggregate[] = useMemo(() => {
    const map = new Map<string, BatchAggregate>();
    for (const r of results) {
      const key = String(r.batch_id ?? 'unassigned');
      if (!map.has(key)) {
        map.set(key, {
          batch_id: r.batch_id ?? null,
          batch_name: r.batch_name ?? 'Unassigned',
          quizzes_count: 0,
          completed_count: 0,
          average_percentage: 0,
          best_percentage: 0,
          lowest_percentage: 100,
          last_quiz_date: null,
          pass_rate: 0,
        });
      }
      const agg = map.get(key)!;
      agg.quizzes_count += 1;
      if (!r.results_locked && r.percentage != null) {
        agg.completed_count += 1;
        agg.average_percentage += r.percentage || 0;
        agg.best_percentage = Math.max(agg.best_percentage, r.percentage || 0);
        agg.lowest_percentage = Math.min(agg.lowest_percentage, r.percentage || 0);
        if (r.submitted_at) {
          if (!agg.last_quiz_date || dayjs(r.submitted_at).isAfter(dayjs(agg.last_quiz_date))) {
            agg.last_quiz_date = r.submitted_at;
          }
        }
      }
    }

    const arr: BatchAggregate[] = [];
    map.forEach((agg) => {
      if (agg.completed_count > 0) {
        agg.average_percentage = toFixed(agg.average_percentage / agg.completed_count);
        const passCount = Math.max(0, Math.round((agg.completed_count * (agg.average_percentage >= 50 ? 1 : 0))));
        // Better pass rate: based on individual quizzes >=50
        // recompute passCount properly
      }
      // Recompute pass rate based on per-quiz >=50
      // We'll compute again by scanning results for this batch key
      const related = completedResults.filter(r => (r.batch_id ?? null) === agg.batch_id);
      if (related.length > 0) {
        const pass = related.filter(r => (r.percentage || 0) >= 50).length;
        agg.pass_rate = toFixed((pass / related.length) * 100);
        agg.lowest_percentage = related.reduce((min, r) => Math.min(min, r.percentage || 0), 100);
        agg.best_percentage = related.reduce((max, r) => Math.max(max, r.percentage || 0), 0);
      } else {
        agg.average_percentage = 0;
        agg.pass_rate = 0;
        agg.lowest_percentage = 0;
        agg.best_percentage = 0;
      }
      arr.push(agg);
    });

    return arr.sort((a, b) => (b.average_percentage - a.average_percentage));
  }, [results, completedResults]);

  const columns = [
    {
      title: 'Batch',
      dataIndex: 'batch_name',
      key: 'batch_name',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Quizzes (Completed/Total)',
      key: 'quizzes',
      render: (_: any, row: BatchAggregate) => (
        <span>{row.completed_count}/{row.quizzes_count}</span>
      ),
    },
    {
      title: 'Average',
      dataIndex: 'average_percentage',
      key: 'avg',
      render: (v: number) => (
        <span>
          <b>{v.toFixed(2)}%</b>
          <div style={{ width: 120 }}>
            <Progress percent={Number(v.toFixed(2))} size="small" status={v >= 50 ? 'success' : 'exception'} showInfo={false} />
          </div>
        </span>
      ),
      sorter: (a: BatchAggregate, b: BatchAggregate) => a.average_percentage - b.average_percentage,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Pass Rate',
      dataIndex: 'pass_rate',
      key: 'pass',
      render: (v: number) => (
        <span>
          {v.toFixed(2)}% {v >= 50 ? <Tag color="green">Good</Tag> : <Tag color="red">Low</Tag>}
        </span>
      ),
      sorter: (a: BatchAggregate, b: BatchAggregate) => a.pass_rate - b.pass_rate,
    },
    {
      title: 'Best',
      dataIndex: 'best_percentage',
      key: 'best',
      render: (v: number) => `${v.toFixed(2)}%`,
      sorter: (a: BatchAggregate, b: BatchAggregate) => a.best_percentage - b.best_percentage,
    },
    {
      title: 'Lowest',
      dataIndex: 'lowest_percentage',
      key: 'low',
      render: (v: number) => `${v.toFixed(2)}%`,
      sorter: (a: BatchAggregate, b: BatchAggregate) => a.lowest_percentage - b.lowest_percentage,
    },
    {
      title: 'Last Quiz',
      dataIndex: 'last_quiz_date',
      key: 'last',
      render: (v: string | null) => v ? dayjs(v).format('MMM DD, YYYY HH:mm') : '—',
      sorter: (a: BatchAggregate, b: BatchAggregate) => dayjs(a.last_quiz_date || 0).valueOf() - dayjs(b.last_quiz_date || 0).valueOf(),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}><BarChartOutlined /> Marksheet</Title>
        <Paragraph type="secondary">
          Overview of your performance across batches. Only completed quizzes with available results are included.
        </Paragraph>
      </div>

      {error && (
        <Alert type="error" message="Failed to load results" description={error} showIcon style={{ marginBottom: 16 }} />
      )}

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Completed Quizzes" value={overall.total} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Average Score" value={overall.average} suffix="%" prefix={<DashboardOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Best Score" value={overall.best} suffix="%" prefix={<RiseOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Pass Rate" value={overall.passRate} suffix="%" prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* Per-batch breakdown */}
      <Card title="Performance by Batch">
        {batchAggregates.length === 0 ? (
          <Empty description="No quiz results available yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            columns={columns as any}
            dataSource={batchAggregates}
            rowKey={(r) => String(r.batch_id ?? 'unassigned')}
            pagination={{ pageSize: 5, showSizeChanger: true }}
          />
        )}
      </Card>

      {/* Info note */}
      <div style={{ marginTop: 12 }}>
        <Tooltip title="Results may be locked until the quiz end date as decided by your teacher.">
          <Text type="secondary"><CalendarOutlined /> If a quiz is still active, it won't appear in the averages until results are released.</Text>
        </Tooltip>
      </div>
    </div>
  );
};

export default StudentMarksheet;