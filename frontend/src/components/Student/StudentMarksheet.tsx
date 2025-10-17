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

const toFixed = (v: number | null | undefined, d = 2) => {
  if (v == null || isNaN(Number(v))) return 0;
  return Number(Number(v).toFixed(d));
};

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

  // Show Performance by Batch only when 'All Batches' is selected
  // or when more than two specific batches are selected.
  const showPerformanceByBatch = useMemo(() => {
    if (isAllSelected) return true;
    const countSpecific = selectedBatches.filter(v => v !== 'all').length;
    return countSpecific > 2; // more than two
  }, [isAllSelected, selectedBatches]);

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
    const totalScore = completedResults.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const maxScore = completedResults.reduce((s, r) => s + (Number(r.max_score) || 0), 0);
    return { totalScore: toFixed(totalScore), maxScore: toFixed(maxScore) };
  }, [completedResults]);

  const overall = useMemo(() => {
    if (completedResults.length === 0) {
      return { total: 0, average: 0, best: 0, grade: '—' };
    }
    const total = completedResults.length;
    
    // Calculate average as total score obtained / total possible score
    const totalScoreObtained = completedResults.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const totalPossibleScore = completedResults.reduce((s, r) => s + (Number(r.max_score) || 0), 0);
    const avg = totalPossibleScore > 0 ? (totalScoreObtained / totalPossibleScore) * 100 : 0;
    
    const validPercentages = completedResults.map(r => Number(r.percentage) || 0).filter(p => !isNaN(p));
    const best = validPercentages.length > 0 ? Math.max(...validPercentages) : 0;
    const grade = gradeFromPercent(avg);
    return { total, average: toFixed(avg), best: toFixed(best), grade };
  }, [completedResults]);

  const batchAggregates: BatchAggregate[] = useMemo(() => {
    const map = new Map<string, BatchAggregate & { total_score: number; total_max_score: number }>();
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
          total_score: 0,
          total_max_score: 0,
        });
      }
      const agg = map.get(key)!;
      agg.quizzes_count += 1;
      if (!r.results_locked && r.percentage != null) {
        agg.completed_count += 1;
        const percentage = Number(r.percentage) || 0;
        const score = Number(r.score) || 0;
        const maxScore = Number(r.max_score) || 0;
        
        // Accumulate total scores for proper average calculation
        agg.total_score += score;
        agg.total_max_score += maxScore;
        
        agg.best_percentage = Math.max(agg.best_percentage, percentage);
        agg.lowest_percentage = Math.min(agg.lowest_percentage, percentage);
        if (r.submitted_at) {
          if (!agg.last_quiz_date || dayjs(r.submitted_at).isAfter(dayjs(agg.last_quiz_date))) {
            agg.last_quiz_date = r.submitted_at;
          }
        }
      }
    }

    const arr: BatchAggregate[] = [];
    map.forEach((agg) => {
      if (agg.completed_count > 0 && agg.total_max_score > 0) {
        // Calculate average as total score obtained / total possible score
        agg.average_percentage = toFixed((agg.total_score / agg.total_max_score) * 100);
      } else {
        agg.average_percentage = 0;
      }
      // Remove the temporary properties before adding to array
      const { total_score, total_max_score, ...finalAgg } = agg;
      arr.push(finalAgg);
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
      render: (v: number) => {
        const grade = gradeFromPercent(v || 0);
        const color = gradeColor(grade);
        return (
          <span>
            <b style={{ color }}>{v.toFixed(2)}%</b>
            <div style={{ width: 120 }}>
              <Progress 
                percent={Number(v.toFixed(2))} 
                size="small" 
                strokeColor={color}
                showInfo={false} 
              />
            </div>
          </span>
        );
      },
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
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Title level={2} style={{ color: '#1a1a1a', marginBottom: 8 }}>Academic Performance Report</Title>
          <Paragraph type="secondary" style={{ fontSize: '16px', color: '#666' }}>
            Comprehensive overview of your quiz performance across all enrolled batches
          </Paragraph>
        </div>

        {error && (
          <Alert type="error" message="Failed to load results" description={error} showIcon style={{ marginBottom: 20, borderRadius: '8px' }} />
        )}

        {/* Controls */}
        <Card style={{ marginBottom: 24, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text strong style={{ color: '#1a1a1a' }}>Filter by Batch:</Text>
              <Select
                mode="multiple"
                value={selectedBatches}
                onChange={(vals) => {
                  if (vals.includes('all')) setSelectedBatches(['all']);
                  else setSelectedBatches(vals);
                }}
                options={batchOptions}
                style={{ minWidth: 280 }}
                placeholder="Select batches"
                maxTagCount="responsive"
              />
            </div>
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              disabled={!canAnalyze}
              onClick={() => setAnalyzerOpen(true)}
              style={{ borderRadius: '6px' }}
            >
              Analyze Performance
            </Button>
          </div>
        </Card>

        {/* Summary Statistics */}
        <div style={{ marginBottom: 32 }}>
          <Text strong style={{ fontSize: '18px', color: '#1a1a1a', display: 'block', marginBottom: 16 }}>Performance Summary</Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 20,
            }}
          >
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
              <Statistic
                title={<span style={{ color: '#666', fontSize: '14px' }}>Completed Quizzes</span>}
                value={overall.total}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
              <Statistic
                title={<span style={{ color: '#666', fontSize: '14px' }}>Average Score</span>}
                value={overall.average}
                suffix="%"
                prefix={<DashboardOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
              <Statistic
                title={<span style={{ color: '#666', fontSize: '14px' }}>Best Score</span>}
                value={overall.best}
                suffix="%"
                prefix={<RiseOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#1a1a1a', fontSize: '28px', fontWeight: '600' }}
              />
            </Card>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
              <div>
                <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: 8 }}>Overall Grade</Text>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a' }}>
                  {overall.grade === '—' ? <Text type="secondary" style={{ fontSize: '24px' }}>—</Text> : (
                    <Tag
                      color={gradeColor(overall.grade)}
                      style={{
                        fontSize: '18px',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontWeight: '600'
                      }}
                    >
                      {overall.grade}
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
              <div>
                <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: 8 }}>Total Score</Text>
                <div style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a' }}>
                  {totals.totalScore}/{totals.maxScore}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Performance by Batch */}
        {showPerformanceByBatch && (
          <Card
            title={<span style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>Performance by Batch</span>}
            style={{ marginBottom: 24, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}
          >
            {batchAggregates.length === 0 ? (
              <Empty description="No quiz results available yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={columns as any}
                dataSource={batchAggregates}
                rowKey={(r) => String(r.batch_id ?? 'unassigned')}
                pagination={{ pageSize: 5, showSizeChanger: true }}
                style={{ borderRadius: '6px' }}
              />
            )}
          </Card>
        )}

        {/* Detailed Quiz Results */}
        <Card
          title={<span style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: '600' }}>Detailed Quiz Results</span>}
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}
        >
          {breakdownResults.length === 0 ? (
            <Empty description="No completed quizzes to display" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <Table
              columns={breakdownColumns as any}
              dataSource={breakdownResults}
              rowKey={(r) => String(r.id)}
              pagination={{ pageSize: 8, showSizeChanger: true }}
              style={{ borderRadius: '6px' }}
            />
          )}
        </Card>

        {/* Performance Analyzer Modal */}
        <Modal
          title={<span style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: '600' }}>Performance Analysis</span>}
          open={analyzerOpen}
          width={900}
          onCancel={() => setAnalyzerOpen(false)}
          footer={<Button onClick={() => setAnalyzerOpen(false)} style={{ borderRadius: '6px' }}>Close</Button>}
          style={{ borderRadius: '8px' }}
        >
          {!canAnalyze ? (
            <Alert type="info" showIcon message="Select at least two batches to analyze" style={{ borderRadius: '6px' }} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              <div>
                <Text strong style={{ color: '#1a1a1a', fontSize: '16px', marginBottom: 16, display: 'block' }}>Average Score by Batch</Text>
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: 'band', data: selectedAggregates.map(a => a.batch_name) }]}
                  series={[{ data: selectedAggregates.map(a => toFixed(a.average_percentage)), color: '#1890ff', label: 'Average %' }]}
                />
              </div>
              <div>
                <Text strong style={{ color: '#1a1a1a', fontSize: '16px', marginBottom: 16, display: 'block' }}>Completion Rate by Batch</Text>
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: 'band', data: selectedAggregates.map(a => a.batch_name) }]}
                  series={[{ data: selectedAggregates.map(a => a.quizzes_count ? toFixed((a.completed_count / a.quizzes_count) * 100) : 0), color: '#52c41a', label: 'Completion %' }]}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Footer Information */}
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Tooltip title="Results may be locked until the quiz end date as decided by your teacher.">
            <Text type="secondary" style={{ fontSize: '14px' }}>
              <CalendarOutlined style={{ marginRight: 8 }} />
              Quiz results are released according to your teacher's schedule
            </Text>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default StudentMarksheet;