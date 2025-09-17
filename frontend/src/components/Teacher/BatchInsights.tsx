import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Divider, List, Tag, Empty, Spin, message, Select, DatePicker, Slider, Button, Tooltip, Table, Collapse, Alert } from 'antd';
import { PieChart, BarChart, LineChart } from '@mui/x-charts';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useAuth } from '../../contexts/AuthContext';
import { TeamOutlined, CheckCircleOutlined, ReloadOutlined, InfoCircleOutlined, TrophyOutlined, RiseOutlined, FallOutlined, OrderedListOutlined } from '@ant-design/icons';

dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface BatchInsightsProps { batchId: string; }

interface QuizAgg { quiz_id: number; quiz_title: string; submitted_count: number; avg_percentage: number | null; min_percentage: number | null; max_percentage: number | null; }
interface BreakdownRow { quiz_id: number; quiz_title: string; total_score: number | null; max_score: number | null; percentage: number | null; submitted_at: string | null; }
interface StudentWithMetrics { id: number; first_name: string; last_name: string; email: string; submitted_count: number; avg_percentage: number | null; breakdown: BreakdownRow[]; }
interface BatchMeta { id: number; name: string; french_level: string; start_date: string; end_date: string; }
interface KPIs { total_students: number; total_quizzes: number; submissions_count: number; completion_rate: number; avg_percentage: number; best_quiz: QuizAgg | null; hardest_quiz: QuizAgg | null; top_student: { student_id: number; first_name: string; last_name: string; email: string; avg_percentage: number } | null; }

const bins = [0,10,20,30,40,50,60,70,80,90,100];

// Guard against double-invocation in React.StrictMode and avoid duplicate API calls
const BatchInsights: React.FC<BatchInsightsProps> = ({ batchId }) => {
  const { apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<BatchMeta | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [quizzes, setQuizzes] = useState<QuizAgg[]>([]);
  const [students, setStudents] = useState<StudentWithMetrics[]>([]);
  const loadedBatchIdRef = useRef<string | null>(null);

  // Filters
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedQuizIds, setSelectedQuizIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [passMarkLocal, setPassMarkLocal] = useState<number>(60);

  useEffect(() => {
    // Only load when batchId changes and not already loaded (prevents StrictMode double-fetch)
    if (batchId && loadedBatchIdRef.current !== batchId) {
      loadedBatchIdRef.current = batchId;
      void load();
    }
  }, [batchId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/batches/${batchId}/insights`);
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        message.error(err.error || 'Failed to load batch insights');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setBatch(data.batch);
      setKpis(data.kpis);
      setQuizzes(data.quizzes || []);
      setStudents(data.students || []);
    } catch (e) {
      message.error('Error loading batch insights');
    } finally { setLoading(false); }
  };

  const studentOptions = useMemo(() => students.map(s => ({ label: `${s.first_name} ${s.last_name}`, value: s.id })), [students]);
  const quizOptions = useMemo(() => quizzes.map(q => ({ label: q.quiz_title, value: q.quiz_id })), [quizzes]);

  const filteredBreakdown = useMemo(() => {
    // Flatten rows enriched with student info for filtering
    const list: Array<BreakdownRow & { student_id: number; student_name: string }> = [];
    students.forEach(s => {
      if (selectedStudentIds.length && !selectedStudentIds.includes(s.id)) return;
      s.breakdown.forEach(b => {
        if (selectedQuizIds.length && !selectedQuizIds.includes(b.quiz_id)) return;
        if (dateRange) {
          const ts = b.submitted_at ? dayjs(b.submitted_at) : null;
          if (!ts || !ts.isBetween(dateRange[0].startOf('day'), dateRange[1].endOf('day'), null, '[]')) return;
        }
        list.push({ ...b, student_id: s.id, student_name: `${s.first_name} ${s.last_name}` });
      });
    });
    return list;
  }, [students, selectedStudentIds, selectedQuizIds, dateRange]);

  const filteredStudentIds = useMemo(() => {
    return students.map(s=>s.id).filter(id => {
      if (selectedStudentIds.length) return selectedStudentIds.includes(id);
      return true;
    });
  }, [students, selectedStudentIds]);

  const totalSelectedStudents = filteredStudentIds.length;
  const totalSelectedQuizzes = useMemo(() => selectedQuizIds.length || quizzes.length, [selectedQuizIds, quizzes]);

  // Build metrics from filtered data
  const metrics = useMemo(() => {
    const valid = filteredBreakdown.filter(b => typeof b.percentage === 'number');
    const submitted = filteredBreakdown.filter(b => b.submitted_at);
    const completion = totalSelectedStudents * totalSelectedQuizzes > 0
      ? Math.round((submitted.length / (totalSelectedStudents * totalSelectedQuizzes)) * 100)
      : 0;
    const avg = valid.length ? Math.round(valid.reduce((a,c)=>a + (c.percentage as number), 0) / valid.length) : 0;

    // histogram
    const hist = bins.slice(0,-1).map((b,i)=>({ bin: `${bins[i]}-${bins[i+1]}`, count: valid.filter(v => {
      const p = v.percentage as number; return p >= bins[i] && p <= (i === bins.length-2 ? bins[i+1] : bins[i+1] - 0.0001);
    }).length }));

    // completion over time
    const timeline = submitted
      .slice()
      .sort((a,b)=>dayjs(a.submitted_at!).valueOf()-dayjs(b.submitted_at!).valueOf());
    const series = timeline.map((s,i)=>({ x: dayjs(s.submitted_at!).format('MM-DD HH:mm'), y: Math.round(((i+1)/(submitted.length||1))*100) }));

    // per-quiz average among filtered
    const byQuiz: Record<number, { title: string; sum: number; count: number; submitted: number } > = {};
    filteredBreakdown.forEach(b => {
      if (!byQuiz[b.quiz_id]) byQuiz[b.quiz_id] = { title: b.quiz_title, sum: 0, count: 0, submitted: 0 };
      if (typeof b.percentage === 'number') { byQuiz[b.quiz_id].sum += (b.percentage as number); byQuiz[b.quiz_id].count++; }
      if (b.submitted_at) byQuiz[b.quiz_id].submitted++;
    });
    const quizAvg = Object.entries(byQuiz).map(([id, v]) => ({ quiz_id: Number(id), title: v.title, avg: v.count ? Math.round(v.sum / v.count) : 0, completion: totalSelectedStudents>0 ? Math.round((v.submitted/(totalSelectedStudents))*100) : 0 }));

    // ranking by student average within filtered scope
    const byStudent: Record<number, { name: string; email?: string; avg: number; count: number } > = {};
    students.forEach(s => {
      if (selectedStudentIds.length && !selectedStudentIds.includes(s.id)) return;
      const rows = s.breakdown.filter(b => (!selectedQuizIds.length || selectedQuizIds.includes(b.quiz_id)) && (!dateRange || (b.submitted_at && dayjs(b.submitted_at).isBetween(dateRange[0].startOf('day'), dateRange[1].endOf('day'), null, '[]'))));
      const vals = rows.filter(r=> typeof r.percentage === 'number');
      const avgS = vals.length ? (vals.reduce((a,c)=>a+(c.percentage as number),0)/vals.length) : NaN;
      byStudent[s.id] = { name: `${s.first_name} ${s.last_name}`, email: s.email, avg: avgS, count: vals.length };
    });
    const ranking = Object.entries(byStudent)
      .filter(([_,v]) => !Number.isNaN(v.avg))
      .map(([id,v]) => ({ student_id: Number(id), name: v.name, email: v.email, avg: Math.round(v.avg), attempts: v.count }))
      .sort((a,b)=>b.avg-a.avg);

    return { completion, avg, hist, series, quizAvg, ranking, submissions: submitted.length, total: totalSelectedStudents * totalSelectedQuizzes };
  }, [filteredBreakdown, totalSelectedStudents, totalSelectedQuizzes, selectedStudentIds, selectedQuizIds, dateRange, students]);

  const hasScores = useMemo(() => filteredBreakdown.some(b => typeof b.percentage === 'number'), [filteredBreakdown]);

  const resetFilters = () => {
    setSelectedStudentIds([]);
    setSelectedQuizIds([]);
    setDateRange(null);
    setPassMarkLocal(60);
  };

  const columns = [
    { title: 'Rank', dataIndex: 'rank', key: 'rank', render: (_: any, __: any, idx: number) => <Tag color={idx===0?'gold':idx===1?'silver':idx===2?'volcano':'blue'}>#{idx+1}</Tag> },
    { title: 'Student', dataIndex: 'name', key: 'name' },
    { title: 'Average %', dataIndex: 'avg', key: 'avg', render: (v:number)=> <Tag color={v>=passMarkLocal?'green':'red'}>{v}%</Tag> },
    { title: 'Submitted', dataIndex: 'attempts', key: 'attempts' }
  ];

  const expandedRowRender = (record: any) => {
    const s = students.find(st => st.id === record.student_id);
    if (!s) return null;
    const rows = s.breakdown
      .filter(b => (!selectedQuizIds.length || selectedQuizIds.includes(b.quiz_id)) && (!dateRange || (b.submitted_at && dayjs(b.submitted_at).isBetween(dateRange[0].startOf('day'), dateRange[1].endOf('day'), null, '[]'))))
      .map(b => ({ key: `${s.id}-${b.quiz_id}`, quiz: b.quiz_title, score: b.total_score!=null && b.max_score!=null ? `${b.total_score}/${b.max_score}` : '-', percent: b.percentage!=null ? `${Math.round(b.percentage)}%` : '-', submitted_at: b.submitted_at ? dayjs(b.submitted_at).format('MMM DD, YYYY HH:mm') : '-' }));
    return (
      <Table
        columns={[{title:'Quiz',dataIndex:'quiz'},{title:'Score',dataIndex:'score'},{title:'Percentage',dataIndex:'percent'},{title:'Submitted At',dataIndex:'submitted_at'}]}
        dataSource={rows}
        pagination={false}
        size="small"
      />
    );
  };

  if (loading) return <div style={{padding:24, display:'flex', alignItems:'center', justifyContent:'center', minHeight:260}}><Spin /></div>;
  if (!batch || !kpis) return <Empty description="No batch insights available" />;

  // Automated insights texts based on filtered view
  const autoInsights = (() => {
    const parts: React.ReactNode[] = [];
    parts.push(<li key="c">Completion rate for current view is <b>{metrics.completion}%</b> across {totalSelectedStudents} students and {totalSelectedQuizzes} quizzes.</li>);
    if (metrics.ranking.length) {
      parts.push(<li key="t">Top performer: <b>{metrics.ranking[0].name}</b> with an average of <b>{metrics.ranking[0].avg}%</b>.</li>);
      const last = metrics.ranking[metrics.ranking.length-1];
      if (last) parts.push(<li key="b">Needs attention: <b>{last.name}</b> at <b>{last.avg}%</b>.</li>);
    }
    const best = [...metrics.quizAvg].sort((a,b)=>b.avg-a.avg)[0];
    const worst = [...metrics.quizAvg].sort((a,b)=>a.avg-b.avg)[0];
    if (best) parts.push(<li key="best">Best quiz in current view: <b>{best.title}</b> with <b>{best.avg}%</b> average.</li>);
    if (worst) parts.push(<li key="hard">Challenging quiz: <b>{worst.title}</b> averaging <b>{worst.avg}%</b>.</li>);
    return parts;
  })();

  return (
    <Space direction="vertical" style={{ width:'100%' }} size="large">
      <div>
        <Title level={4} style={{ marginBottom: 0 }}>{batch.name}</Title>
        <Text type="secondary">Batch Insights dashboard</Text>
      </div>

      {/* Filters */}
      <Card size="small" bodyStyle={{ paddingBottom: 8 }}>
        <Row gutter={[12,12]} align="middle">
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary">Filter by student</Text>
              <Select
                mode="multiple"
                allowClear
                placeholder="All students"
                options={studentOptions}
                value={selectedStudentIds}
                onChange={setSelectedStudentIds}
                showSearch
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary">Filter by quiz</Text>
              <Select
                mode="multiple"
                allowClear
                placeholder="All quizzes"
                options={quizOptions}
                value={selectedQuizIds}
                onChange={setSelectedQuizIds}
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Space align="center" style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
                <Text type="secondary">Pass mark: {passMarkLocal}%</Text>
                <Tooltip title="Adjust threshold used for pass/fail visuals in this view.">
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
              <Slider min={0} max={100} value={passMarkLocal} onChange={(v)=> setPassMarkLocal(v as number)} />
            </Space>
          </Col>
          <Col xs={24} md={16}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary">Submitted between</Text>
              <RangePicker style={{ width: '100%' }} value={dateRange as any} onChange={(v)=> setDateRange(v as any)} allowEmpty={[true,true]} />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset filters</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPIs */}
      <Row gutter={[16,16]}>
        <Col xs={12} md={6}><Card><Statistic title="Selected Students" value={totalSelectedStudents} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Selected Quizzes" value={totalSelectedQuizzes} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Submissions" value={metrics.submissions} suffix={`(${metrics.completion}%)`} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Average Score" value={metrics.avg} suffix="%" /></Card></Col>
      </Row>

      {/* Comparative charts across quizzes */}
      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><OrderedListOutlined /> <span>Average Score by Quiz</span></Space>}>
            {metrics.quizAvg.length ? (
              <BarChart height={280} xAxis={[{ scaleType:'band', data: metrics.quizAvg.map(q=>q.title) }]} series={[{ data: metrics.quizAvg.map(q=>q.avg), color:'#1677ff' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No quiz data to display" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Completion by Quiz (% of selected students)">
            {metrics.quizAvg.length ? (
              <BarChart height={280} xAxis={[{ scaleType:'band', data: metrics.quizAvg.map(q=>q.title) }]} series={[{ data: metrics.quizAvg.map(q=>q.completion), color:'#52c41a' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No completion data to display" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Distribution and timeline */}
      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><span>Pass vs Fail</span><Tag color="blue">threshold {passMarkLocal}%</Tag></Space>}>
            {hasScores ? (
              <PieChart height={280} series={[{ data:[{id:0,value:filteredBreakdown.filter(b=>(b.percentage||0)>=passMarkLocal).length,label:'Pass'},{id:1,value:filteredBreakdown.filter(b=>typeof b.percentage==='number' && (b.percentage as number)<passMarkLocal).length,label:'Fail'}], colors:['#52c41a','#ff4d4f'] }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No scores to display" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Score Distribution (Percentage)">
            {hasScores ? (
              <BarChart height={280} xAxis={[{ scaleType:'band', data: metrics.hist.map(h=>h.bin) }]} series={[{ data: metrics.hist.map(h=>h.count), color:'#722ed1' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No scores to display" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16,16]}>
        <Col xs={24}>
          <Card title="Completion Over Time" extra={<Tag color="default">% complete</Tag>}>
            {metrics.series.length ? (
              <LineChart height={280} xAxis={[{ data: metrics.series.map(p=>p.x), scaleType:'point' }]} series={[{ data: metrics.series.map(p=>p.y), label:'Completion %', color:'#13c2c2' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No submissions in selected range" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Ranking with collapsible rows */}
      <Card title={<Space><TrophyOutlined /> <span>Top Performers</span></Space>}>
        <Alert type="info" showIcon message="Click a row to expand and view this student's marks across quizzes." style={{ marginBottom: 12 }} />
        <Table
          rowKey={(r:any)=>`rank-${r.student_id}`}
          columns={columns as any}
          dataSource={metrics.ranking.map((r, idx)=>({ ...r, rank: idx+1 }))}
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 8, showSizeChanger: true }}
        />
      </Card>

      <Divider style={{ margin: 0 }} />

      {/* Automated insights */}
      <Card size="small" title="Automated Insights" style={{ border: '1px dashed #f0f0f0' }}>
        <ul style={{ margin: 0, paddingLeft: 16 }}>{autoInsights}</ul>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          Insights reflect the filters you have applied. Use student and quiz filters above to drill down to an individual student's trajectory or compare groups.
        </Paragraph>
      </Card>

      <Text type="secondary">Charts reflect applied filters. Hover to explore values. Data comes from all quizzes assigned to this batch.</Text>
    </Space>
  );
};

export default BatchInsights;