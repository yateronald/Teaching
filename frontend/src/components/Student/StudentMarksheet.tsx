import React, { useEffect, useMemo, useState } from 'react';
import { Card, Statistic, Typography, Table, Tag, Empty, Spin, Progress, Tooltip, Alert, Select, Space, Modal, Button } from 'antd';
import { BarChartOutlined, CheckCircleOutlined, RiseOutlined, CalendarOutlined, DashboardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart } from '@mui/x-charts';

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

// Grade helpers
const gradeFromPercent = (p: number) => {
  if (p >= 95) return 'A+';
  if (p >= 90) return 'A';
  if (p >= 85) return 'A-';
  if (p >= 80) return 'B+';
  if (p >= 75) return 'B';
  if (p >= 70) return 'B-';
  if (p >= 65) return 'C+';
  if (p >= 60) return 'C';
  if (p >= 55) return 'D+';
  if (p >= 50) return 'D';
  return 'F';
};
const gradeColor = (g: string) => {
  switch (g) {
    case 'A+':
    case 'A':
    case 'A-':
      return 'green';
    case 'B+':
    case 'B':
    case 'B-':
      return 'gold';
    case 'C+':
    case 'C':
    case 'D+':
    case 'D':
      return 'orange';
    default:
      return 'red';
  }
};

const StudentMarksheet: React.FC = () => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<string[]>(['all']);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);

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
        const data: any = await res.json();
        // API returns { results: QuizResult[] }
        setResults(Array.isArray(data?.results) ? (data.results as QuizResult[]) : (Array.isArray(data) ? data : []));
      } catch (e: any) {
        setError(e?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [apiCall]);

  // Batch options
  const batchOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of results) {
      const key = String(r.batch_id ?? 'unassigned');
      const label = r.batch_name ?? 'Unassigned';
      map.set(key, label);
    }
    const opts = Array.from(map.entries()).map(([value, label]) => ({ value, label }));
    return [{ value: 'all', label: 'All Batches' }, ...opts];
  }, [results]);

  const isAllSelected = selectedBatches.includes('all') || selectedBatches.length === 0;

  const filteredResults = useMemo(() => {
    if (isAllSelected) return results;
    const setVals = new Set(selectedBatches);
    return results.filter(r => setVals.has(String(r.batch_id ?? 'unassigned')));
  }, [results, selectedBatches, isAllSelected]);

  const completedResults = useMemo(
    () => filteredResults.filter(r => !r.results_locked && r.percentage != null),
    [filteredResults]
  );

  const totals = useMemo(() => {
    const totalScore = completedResults.reduce((s, r) => s + (r.score || 0), 0);
    const maxScore = completedResults.reduce((s, r) => s + (r.max_score || 0), 0);
    return { totalScore: toFixed(totalScore), maxScore: toFixed(maxScore) };
  }, [completedResults]);

  const overall = useMemo(() => {
    if (completedResults.length === 0) {
      return { total: 0, average: 0, best: 0, grade: '—' };
    }
    const total = completedResults.length;
    const avg = completedResults.reduce((s, r) => s + (r.percentage || 0), 0) / total;
    const best = Math.max(...completedResults.map(r => r.percentage || 0));
    const grade = gradeFromPercent(avg);
    return { total, average: toFixed(avg), best: toFixed(best), grade };
  }, [completedResults]);

  const batchAggregates: BatchAggregate[] = useMemo(() => {
    const map = new Map<string, BatchAggregate>();
    for (const r of filteredResults) {
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
      } else {
        agg.average_percentage = 0;
      }
      arr.push(agg);
    });

    return arr.sort((a, b) => (b.average_percentage - a.average_percentage));
  }, [filteredResults]);

  const selectedAggregates = useMemo(() => {
    if (isAllSelected) return batchAggregates;
    const setVals = new Set(selectedBatches);
    return batchAggregates.filter(b => setVals.has(String(b.batch_id ?? 'unassigned')));
  }, [batchAggregates, selectedBatches, isAllSelected]);

  const canAnalyze = selectedAggregates.length >= 2;

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
      title: 'Grade',
      key: 'grade',
      render: (_: any, row: BatchAggregate) => {
        const g = gradeFromPercent(row.average_percentage || 0);
        return <Tag color={gradeColor(g)}>{g}</Tag>;
      },
      sorter: (a: any, b: any) => (a.average_percentage || 0) - (b.average_percentage || 0),
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

  const breakdownColumns = [
    { title: 'Quiz', dataIndex: 'quiz_title', key: 'quiz_title' },
    { title: 'Batch', dataIndex: 'batch_name', key: 'batch_name', render: (v: string | null) => v || 'Unassigned' },
    { title: 'Score', key: 'score', render: (_: any, r: QuizResult) => (
      <span>
        <b>{toFixed(r.score)}/{toFixed(r.max_score)}</b>
        <Tag color={(r.percentage || 0) >= 70 ? 'green' : (r.percentage || 0) >= 50 ? 'gold' : 'red'} style={{ marginLeft: 8 }}>
          {toFixed(r.percentage)}%
        </Tag>
      </span>
    ) },
    { title: 'Progress', key: 'progress', render: (_: any, r: QuizResult) => (
      <div style={{ width: 120 }}>
        <Progress percent={Number(toFixed(r.percentage || 0))} size="small" status={(r.percentage || 0) >= 50 ? 'success' : 'exception'} showInfo={false} />
      </div>
    ) },
    { title: 'Submitted', dataIndex: 'submitted_at', key: 'submitted_at', render: (v: string | null) => v ? dayjs(v).format('MMM DD, YYYY HH:mm') : '—',
      sorter: (a: QuizResult, b: QuizResult) => dayjs(a.submitted_at || 0).valueOf() - dayjs(b.submitted_at || 0).valueOf() },
  ];

  const breakdownResults = useMemo(() => (
    completedResults.slice().sort((a, b) => dayjs(b.submitted_at || 0).valueOf() - dayjs(a.submitted_at || 0).valueOf())
  ), [completedResults]);

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

      {/* Controls */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Space size={12} wrap>
          <Text strong>Filter by Batch:</Text>
          <Select
            mode="multiple"
            value={selectedBatches}
            onChange={(vals) => {
              if (vals.includes('all')) setSelectedBatches(['all']);
              else setSelectedBatches(vals);
            }}
            options={batchOptions}
            style={{ minWidth: 260 }}
            placeholder="Select batches"
            maxTagCount="responsive"
          />
        </Space>
        <Button type="primary" icon={<BarChartOutlined />} disabled={!canAnalyze} onClick={() => setAnalyzerOpen(true)}>
          Analyze
        </Button>
      </div>

      {/* Summary grid on one row for large screens */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Card><Statistic title="Completed Quizzes" value={overall.total} prefix={<CheckCircleOutlined />} /></Card>
        <Card><Statistic title="Average Score" value={overall.average} suffix="%" prefix={<DashboardOutlined />} /></Card>
        <Card><Statistic title="Best Score" value={overall.best} suffix="%" prefix={<RiseOutlined />} /></Card>
        <Card>
          <div>
            <Text type="secondary">Grade</Text>
            <div style={{ marginTop: 8 }}>
              {overall.grade === '—' ? <Text type="secondary">—</Text> : <Tag color={gradeColor(overall.grade)} style={{ fontSize: 16, padding: '2px 8px' }}>{overall.grade}</Tag>}
            </div>
          </div>
        </Card>
        <Card>
          <div>
            <Text type="secondary">Total Score</Text>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>
              {totals.totalScore}/{totals.maxScore}
            </div>
          </div>
        </Card>
      </div>

      {/* Per-batch breakdown - always visible, respects filters */}
      <Card title="Performance by Batch" style={{ marginBottom: 24 }}>
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

      {/* Quiz breakdown */}
      <Card title="Quiz Breakdown">
        {breakdownResults.length === 0 ? (
          <Empty description="No completed quizzes to display" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            columns={breakdownColumns as any}
            dataSource={breakdownResults}
            rowKey={(r) => String(r.id)}
            pagination={{ pageSize: 8, showSizeChanger: true }}
          />
        )}
      </Card>

      {/* Analyzer Modal */}
      <Modal
        title="Batch Analyzer"
        open={analyzerOpen}
        width={900}
        onCancel={() => setAnalyzerOpen(false)}
        footer={<Button onClick={() => setAnalyzerOpen(false)}>Close</Button>}
      >
        {!canAnalyze ? (
          <Alert type="info" showIcon message="Select at least two batches to analyze" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div>
              <Text strong>Average Score by Batch</Text>
              <BarChart
                height={300}
                xAxis={[{ scaleType: 'band', data: selectedAggregates.map(a => a.batch_name) }]}
                series={[{ data: selectedAggregates.map(a => toFixed(a.average_percentage)), color: '#1677ff', label: 'Average %' }]}
              />
            </div>
            <div>
              <Text strong>Completion Rate by Batch</Text>
              <BarChart
                height={300}
                xAxis={[{ scaleType: 'band', data: selectedAggregates.map(a => a.batch_name) }]}
                series={[{ data: selectedAggregates.map(a => a.quizzes_count ? toFixed((a.completed_count / a.quizzes_count) * 100) : 0), color: '#52c41a', label: 'Completion %' }]}
              />
            </div>
          </div>
        )}
      </Modal>

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