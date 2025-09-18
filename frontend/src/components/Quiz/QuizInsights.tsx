import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Divider, List, Tag, Empty, Spin, message, Select, DatePicker, Slider, Button, Tooltip } from 'antd';
import { PieChart, BarChart, LineChart, ScatterChart } from '@mui/x-charts';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { TeamOutlined, CheckCircleOutlined, FieldTimeOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { Title, Text } = Typography;

interface QuizInsightsProps { quizId?: string; }

interface Quiz { id: number; title: string; passing_score?: number; batch_names?: string; }
interface StudentRow {
  student_id: number; name: string; email: string; percentage: number | null; score: number | null; max_score: number | null;
  submitted_at: string | null; time_taken_minutes: number | null; status?: string; batch_id?: number; batch_name?: string;
}

const bins = [0,10,20,30,40,50,60,70,80,90,100];

// Helper function to format numbers - show whole numbers without decimals, keep up to 2 decimal places for others
const formatNumber = (num: number): string => {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(2).replace(/\.?0+$/, '');
};

const QuizInsights: React.FC<QuizInsightsProps> = ({ quizId }) => {
  const { apiCall } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  // UI filter states
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [passMarkLocal, setPassMarkLocal] = useState<number>(60);

  useEffect(() => { if (quizId) load(); }, [quizId]);

  useEffect(() => { setPassMarkLocal(quiz?.passing_score ?? 60); }, [quiz]);

  const load = async () => {
    setLoading(true);
    try {
      const q = await apiCall(`/quizzes/${quizId}`);
      if (q.ok) { const data = await q.json(); setQuiz(data?.quiz ?? data); }
      const r = await apiCall(`/quizzes/${quizId}/results`);
      if (r.ok) {
        const data = await r.json();
        const flat: StudentRow[] = (data?.batch_results||[]).flatMap((b:any)=>
          (b.students||[]).map((s:any)=>({
            student_id: s.id, name: s.name, email: s.email,
            percentage: s.percentage ?? null, score: s.score ?? null, max_score: s.max_score ?? null,
            submitted_at: s.submitted_at ?? null, time_taken_minutes: s.time_taken_minutes ?? null,
            status: s.status, batch_id: b.batch_id, batch_name: b.batch_name
          }))
        );
        setStudents(flat);
      } else {
        const err = await r.json().catch(()=>({}));
        message.error(err.error || 'Failed to load results');
      }
    } catch {
      message.error('Failed to load quiz insights');
    } finally { setLoading(false); }
  };

  const batches = useMemo(() => {
    const setNames = new Set<string>();
    students.forEach(s => { if (s.batch_name) setNames.add(s.batch_name); });
    return Array.from(setNames);
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      let ok = true;
      if (selectedBatches.length) ok = ok && selectedBatches.includes(s.batch_name || '');
      if (dateRange) {
        const ts = s.submitted_at ? dayjs(s.submitted_at) : null;
        ok = ok && (!!ts && ts.isBetween(dateRange[0].startOf('day'), dateRange[1].endOf('day'), null, '[]'));
      }
      return ok;
    });
  }, [students, selectedBatches, dateRange]);

  const metrics = useMemo(() => {
    const total = filteredStudents.length; const submitted = filteredStudents.filter(s=>s.submitted_at).length;
    const completion = total ? Math.round((submitted/total)*100) : 0;
    const withPerc = filteredStudents.filter(s=>typeof s.percentage === 'number') as (StudentRow & { percentage: number })[];
    const avgRaw = withPerc.length ? withPerc.reduce((a,c)=>a+c.percentage,0)/withPerc.length : 0;
    const avg = parseFloat(formatNumber(avgRaw));
    const pass = withPerc.filter(s=>s.percentage>=passMarkLocal).length; const fail = withPerc.length - pass;
    const top5 = [...withPerc].sort((a,b)=>b.percentage-a.percentage).slice(0,5);
    const bottom5 = [...withPerc].sort((a,b)=>a.percentage-b.percentage).slice(0,5);
    // histogram
    const hist = bins.slice(0,-1).map((_,i)=>({ bin:`${bins[i]}-${bins[i+1]}`, count: withPerc.filter(s=>{
      const p = s.percentage; return p>=bins[i] && p<=(i===bins.length-2? bins[i+1] : bins[i+1]-0.0001);
    }).length }));
    // completion over time
    const timeline = filteredStudents.filter(s=>s.submitted_at).sort((a,b)=>dayjs(a.submitted_at!).valueOf()-dayjs(b.submitted_at!).valueOf());
    const series = timeline.map((s,i)=>({ x: dayjs(s.submitted_at!).format('MM-DD HH:mm'), y: Math.round(((i+1)/submitted)*100) }));
    // scatter time vs score
    const scatter = withPerc.filter(s=>s.time_taken_minutes!=null).map(s=>({ x: s.time_taken_minutes as number, y: s.percentage as number }));
    // per-batch avg
    const byBatch: Record<string,{avg:number; count:number}> = {};
    withPerc.forEach(s=>{ const k=s.batch_name||'Batch'; const p=s.percentage; if(!byBatch[k]) byBatch[k]={avg:0,count:0}; byBatch[k].avg+=p; byBatch[k].count++; });
    const batchData = Object.entries(byBatch).map(([k,v])=>({ batch:k, avg: parseFloat(formatNumber(v.avg/v.count)) }));
    return { total, submitted, completion, avg, pass, fail, top5, bottom5, hist, series, scatter, batchData };
  }, [filteredStudents, passMarkLocal]);

  const hasScores = useMemo(()=> filteredStudents.some(s=>typeof s.percentage === 'number'), [filteredStudents]);

  const resetFilters = () => {
    setSelectedBatches([]);
    setDateRange(null);
    setPassMarkLocal(quiz?.passing_score ?? 60);
  };

  if (loading) return <div style={{padding:24, display:'flex', alignItems:'center', justifyContent:'center', minHeight:260}}><Spin /></div>;
  if (!quiz) return <Empty description="Quiz not found" />;

  return (
    <Space direction="vertical" style={{ width:'100%' }} size="large">
      <div>
        <Title level={4} style={{ marginBottom: 0 }}>{quiz.title}</Title>
        <Text type="secondary">Insights dashboard</Text>
      </div>

      {/* Filters */}
      <Card size="small" bodyStyle={{ paddingBottom: 8 }}>
        <Row gutter={[12,12]} align="middle">
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary">Filter by batch</Text>
              <Select
                mode="multiple"
                allowClear
                placeholder="All batches"
                options={batches.map(b=>({ label: b, value: b }))}
                value={selectedBatches}
                onChange={setSelectedBatches}
              />
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary">Submitted between</Text>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(v)=> setDateRange(v as [Dayjs, Dayjs] | null)}
                allowEmpty={[true, true]}
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
          <Col span={24}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset filters</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPIs */}
      <Row gutter={[16,16]}>
        <Col xs={12} md={6}><Card><Statistic title="Total Students" value={metrics.total} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Submissions" value={metrics.submitted} suffix={`(${metrics.completion}%)`} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Average Score" value={metrics.avg} suffix="%" /></Card></Col>
        <Col xs={12} md={6}><Card><Statistic title="Pass Mark" value={passMarkLocal} suffix="%" /></Card></Col>
      </Row>

      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <span>Pass vs Fail</span>
              <Tag color="blue">threshold {passMarkLocal}%</Tag>
            </Space>
          }>
            {hasScores ? (
              <PieChart height={280} series={[{ data:[{id:0,value:metrics.pass,label:'Pass',color:'#52c41a'},{id:1,value:metrics.fail,label:'Fail',color:'#ff4d4f'}] }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No scores to display" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Score Distribution (Percentage)">
            {hasScores ? (
              <BarChart height={280} xAxis={[{ scaleType:'band', data: metrics.hist.map(h=>h.bin) }]} series={[{ data: metrics.hist.map(h=>h.count), color:'#1677ff' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No scores to display" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card title="Completion Over Time" extra={<Tag icon={<FieldTimeOutlined />} color="default">% complete</Tag>}>
            {metrics.series.length ? (
              <LineChart height={280} xAxis={[{ data: metrics.series.map(p=>p.x), scaleType:'point' }]} series={[{ data: metrics.series.map(p=>p.y), label:'Completion %', color:'#13c2c2' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No submissions in selected range" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Time Taken vs Score">
            {metrics.scatter.length ? (
              <ScatterChart height={280} xAxis={[{ label:'Minutes' }]} yAxis={[{ label:'%' }]} series={[{ data: metrics.scatter, color:'#722ed1' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No time vs score data" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card title="Average Score by Batch">
            {metrics.batchData.length ? (
              <BarChart height={280} xAxis={[{ scaleType:'band', data: metrics.batchData.map(b=>b.batch) }]} series={[{ data: metrics.batchData.map(b=>b.avg), color:'#fa8c16' }]} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No batch data to display" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top & Bottom Performers">
            {hasScores ? (
              <Row gutter={12}>
                <Col span={12}>
                  <Text strong>Top 5</Text>
                  <List size="small" dataSource={metrics.top5} renderItem={(s, idx)=> (
                    <List.Item>
                      <Space>
                        <Tag color="green">#{idx+1}</Tag>
                        <Tag color="green">{formatNumber(s.percentage)}%</Tag>
                        <span>{s.name}</span>
                      </Space>
                    </List.Item>
                  )} />
                </Col>
                <Col span={12}>
                  <Text strong>Bottom 5</Text>
                  <List size="small" dataSource={metrics.bottom5} renderItem={(s, idx)=> (
                    <List.Item>
                      <Space>
                        <Tag color="red">#{idx+1}</Tag>
                        <Tag color="red">{formatNumber(s.percentage)}%</Tag>
                        <span>{s.name}</span>
                      </Space>
                    </List.Item>
                  )} />
                </Col>
              </Row>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No performers to display" />
            )}
          </Card>
        </Col>
      </Row>

      <Divider style={{ margin: 0 }} />
      <Text type="secondary">Charts reflect applied filters. Hover to explore values. Data is live from quiz submissions.</Text>
    </Space>
  );
};

export default QuizInsights;