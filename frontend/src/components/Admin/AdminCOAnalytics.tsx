import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Spin, AutoComplete, Input, Tooltip, Empty } from 'antd';
import { LoadingOutlined, CloseOutlined, SoundOutlined, UserOutlined, TeamOutlined, TrophyOutlined, BarChartOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const LEVELS = ['A1','A2','B1','B2','C1','C2'];
const LC: Record<string,string> = {A1:'#10b981',A2:'#22d3ee',B1:'#a78bfa',B2:'#f472b6',C1:'#fb923c',C2:'#ef4444'};
const LB: Record<string,string> = {A1:'#ecfdf5',A2:'#ecfeff',B1:'#f5f3ff',B2:'#fdf2f8',C1:'#fff7ed',C2:'#fef2f2'};
const LN: Record<string,string> = {A1:'Elementary',A2:'Lower Intermediate',B1:'Intermediate',B2:'Upper Intermediate',C1:'Advanced',C2:'Superior'};
const getCefr = (p: number) => { if(p>=600)return'C2'; if(p>=500)return'C1'; if(p>=400)return'B2'; if(p>=300)return'B1'; if(p>=200)return'A2'; return'A1'; };


interface Props { open: boolean; onClose: () => void; }

// ── KPI Card ──
const KPI: React.FC<{v:string;l:string;c:string;big?:boolean}> = ({v,l,c,big}) => (
  <div style={{textAlign:'center',padding:'14px 8px',borderRadius:12,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
    <div style={{fontSize:big?22:16,fontWeight:800,color:c}}>{v}</div>
    <div style={{fontSize:9,color:'#94a3b8',fontWeight:600,textTransform:'uppercase',marginTop:2}}>{l}</div>
  </div>
);

// ── CEFR Bar Chart ──
const CefrBars: React.FC<{dist:Record<string,number>;label:string}> = ({dist,label}) => {
  const mx = Math.max(...Object.values(dist),1);
  return (
    <div style={{marginBottom:20}}>
      <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
        <BarChartOutlined style={{color:'#8b5cf6'}}/> {label}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
        {LEVELS.map(lv => {
          const c = dist[lv]||0; const pct = Math.round((c/mx)*100);
          return (
            <Tooltip key={lv} title={`${c} — ${lv} (${LN[lv]})`}>
              <div style={{textAlign:'center'}}>
                <div style={{height:70,display:'flex',flexDirection:'column',justifyContent:'flex-end',alignItems:'center',background:'#f8fafc',borderRadius:8,border:'1px solid #f1f5f9',marginBottom:4,position:'relative',overflow:'hidden'}}>
                  <div style={{width:'100%',height:`${pct}%`,minHeight:c>0?4:0,background:`linear-gradient(180deg,${LC[lv]},${LC[lv]}cc)`,borderRadius:'0 0 6px 6px',transition:'height 0.5s ease'}}/>
                  <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:12,fontWeight:800,color:pct>50?'#fff':'#475569'}}>{c}</div>
                </div>
                <div style={{padding:'2px 0',borderRadius:5,background:LB[lv],fontSize:10,fontWeight:700,color:LC[lv]}}>{lv}</div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};

// ── Student View ──
const StudentView: React.FC<{data:any}> = ({data}) => {
  const insights: string[] = [];
  const lv = data.overall_level||'A1';
  insights.push(`Overall CO level: ${lv} (${LN[lv]}), based on best scores across ${data.series_count} series.`);
  if (data.series_breakdown?.length > 1) {
    const best = data.series_breakdown.reduce((a:any,b:any) => a.best_earned>b.best_earned?a:b);
    const worst = data.series_breakdown.reduce((a:any,b:any) => a.best_earned<b.best_earned?a:b);
    insights.push(`Best: "${best.series_name}" (${best.best_earned} pts — ${getCefr(best.best_earned)})`);
    if (worst.series_id !== best.series_id) insights.push(`Needs work: "${worst.series_name}" (${worst.best_earned} pts)`);
  }
  return (
    <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
        <KPI v={String(data.total_attempts)} l="Total Attempts" c="#3b82f6"/>
        <KPI v={String(data.series_count)} l="Series Practiced" c="#8b5cf6"/>
        <KPI v={`${data.overall_earned}/${data.overall_total}`} l="Avg Best Score" c="#10b981"/>
        <KPI v={data.overall_level||'—'} l="Overall Level" c={LC[data.overall_level||'']||'#64748b'} big/>
      </div>
      <CefrBars dist={data.cefr_distribution} label="CEFR Distribution (all attempts)"/>
      {data.score_progression?.length >= 2 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8}}>Score Progression</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:2,height:60,padding:'4px',background:'#f8fafc',borderRadius:10,border:'1px solid #f1f5f9'}}>
            {data.score_progression.map((p:any,i:number) => {
              const mx = Math.max(...data.score_progression.map((x:any)=>x.total),1);
              const h = Math.max(4,(p.earned/mx)*50);
              const last = i===data.score_progression.length-1;
              return (
                <Tooltip key={i} title={`${p.series}: ${p.earned}/${p.total} pts (${p.level})`}>
                  <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'2px 0'}}>
                    <div style={{fontSize:7,color:'#94a3b8',fontWeight:600}}>{p.earned}</div>
                    <div style={{width:'100%',maxWidth:18,height:h,borderRadius:3,background:last?`linear-gradient(180deg,${LC[p.level]},${LC[p.level]}cc)`:'linear-gradient(180deg,#e2e8f0,#cbd5e1)'}}/>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}
      {data.series_breakdown?.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8}}><TrophyOutlined style={{color:'#f59e0b'}}/> Series Breakdown</div>
          {data.series_breakdown.map((s:any,i:number) => (
            <div key={s.series_id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 50px',gap:8,padding:'8px 12px',borderRadius:8,background:i===0?'#f0f2ff':'#f8fafc',border:`1px solid ${i===0?'#e0e4f8':'#f1f5f9'}`,marginBottom:4,alignItems:'center'}}>
              <div><div style={{fontSize:11,fontWeight:700,color:'#1e293b'}}>{s.series_name}</div><div style={{fontSize:9,color:'#94a3b8'}}>{s.attempts} attempts</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:'#10b981'}}>{s.best_earned}/{s.best_total}</div><div style={{fontSize:8,color:'#94a3b8'}}>BEST</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,fontWeight:600,color:'#64748b'}}>{s.latest_earned}/{s.latest_total}</div><div style={{fontSize:8,color:'#94a3b8'}}>LATEST</div></div>
              <div style={{textAlign:'center'}}><span style={{padding:'2px 6px',borderRadius:5,fontSize:9,fontWeight:700,background:LB[getCefr(s.best_earned)],color:LC[getCefr(s.best_earned)]}}>{getCefr(s.best_earned)}</span></div>
            </div>
          ))}
        </div>
      )}
      {insights.length > 0 && (
        <div style={{marginBottom:16,padding:12,borderRadius:12,background:'linear-gradient(135deg,#faf5ff,#f0f9ff)',border:'1px solid #e9d5ff'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#7c3aed',marginBottom:6}}>Insights</div>
          {insights.map((t,i) => <div key={i} style={{fontSize:10,color:'#6b21a8',lineHeight:1.5,paddingLeft:8,borderLeft:'2px solid #c4b5fd',marginBottom:3}}>{t}</div>)}
        </div>
      )}
      {data.recent_attempts?.length > 0 && (
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8}}>Recent Attempts <span style={{fontSize:10,color:'#94a3b8',fontWeight:500}}>({data.total_attempts} total)</span></div>
          {data.recent_attempts.slice(0,5).map((a:any,i:number) => (
            <div key={a.id} style={{padding:'6px 10px',borderRadius:7,background:i===0?'#f0f2ff':'#f8fafc',border:`1px solid ${i===0?'#e0e4f8':'#f1f5f9'}`,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
              <div style={{fontSize:10,fontWeight:600,color:'#1e293b'}}>{a.series_name} — {a.earned_points}/{a.total_points} pts</div>
              <span style={{padding:'2px 6px',borderRadius:5,background:LB[a.level],color:LC[a.level],fontSize:9,fontWeight:700}}>{a.level}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ── Batch View ──
const BatchView: React.FC<{data:any}> = ({data}) => {
  const insights: string[] = [];
  if (data.students_with_attempts > 0) {
    insights.push(`${data.students_with_attempts} of ${data.student_count} students have practiced (${Math.round(data.students_with_attempts/data.student_count*100)}% participation).`);
    insights.push(`Batch average: ${data.batch_avg} pts (${getCefr(data.batch_avg)}), Median: ${data.batch_median} pts, Std Dev: ${data.batch_std_dev} pts.`);
    if (data.leaderboard?.length > 0) insights.push(`🏆 Top performer: ${data.leaderboard[0].name} with ${data.leaderboard[0].best_earned} pts (${data.leaderboard[0].level}).`);
    const noAttempt = data.student_count - data.students_with_attempts;
    if (noAttempt > 0) insights.push(`⚠️ ${noAttempt} student${noAttempt>1?'s have':'has'} not attempted any CO quiz yet.`);
  }
  return (
    <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:20}}>
        <KPI v={String(data.student_count)} l="Students" c="#3b82f6"/>
        <KPI v={String(data.total_attempts)} l="Total Attempts" c="#8b5cf6"/>
        <KPI v={`${data.batch_avg}/699`} l="Batch Average" c="#10b981"/>
        <KPI v={`${data.batch_median}`} l="Median Score" c="#f59e0b"/>
        <KPI v={data.overall_level||'—'} l="Batch Level" c={LC[data.overall_level||'']||'#64748b'} big/>
      </div>
      <CefrBars dist={data.level_distribution_by_student||{}} label="Student Level Distribution (by best score)"/>
      <CefrBars dist={data.cefr_distribution||{}} label="CEFR Distribution (all attempts)"/>
      {/* Leaderboard */}
      {data.leaderboard?.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8,display:'flex',alignItems:'center',gap:6}}><TrophyOutlined style={{color:'#f59e0b'}}/> Leaderboard — Top 5</div>
          {data.leaderboard.map((s:any,i:number) => {
            const medals = ['🥇','🥈','🥉','4','5'];
            return (
              <div key={s.id} style={{display:'grid',gridTemplateColumns:'30px 2fr 1fr 1fr 50px',gap:6,padding:'8px 10px',borderRadius:8,background:i===0?'#fffbeb':i<3?'#f8fafc':'#fff',border:`1px solid ${i===0?'#fde68a':'#f1f5f9'}`,marginBottom:4,alignItems:'center'}}>
                <div style={{fontSize:i<3?16:11,textAlign:'center',fontWeight:700,color:i>=3?'#94a3b8':undefined}}>{medals[i]}</div>
                <div><div style={{fontSize:11,fontWeight:700,color:'#1e293b'}}>{s.name}</div><div style={{fontSize:9,color:'#94a3b8'}}>{s.attempts} attempts · {s.series_count} series</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:'#10b981'}}>{s.best_earned}/{s.best_total}</div><div style={{fontSize:8,color:'#94a3b8'}}>BEST</div></div>
                <div style={{textAlign:'center'}}><div style={{fontSize:11,fontWeight:600,color:'#64748b'}}>{s.avg_earned}</div><div style={{fontSize:8,color:'#94a3b8'}}>AVG</div></div>
                <div style={{textAlign:'center'}}><span style={{padding:'2px 6px',borderRadius:5,fontSize:9,fontWeight:700,background:LB[s.level||'A1'],color:LC[s.level||'A1']}}>{s.level||'—'}</span></div>
              </div>
            );
          })}
        </div>
      )}
      {/* Series Performance */}
      {data.series_stats?.length > 0 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8}}>Series Performance</div>
          {data.series_stats.map((s:any,i:number) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:6,padding:'8px 10px',borderRadius:8,background:'#f8fafc',border:'1px solid #f1f5f9',marginBottom:4,alignItems:'center'}}>
              <div><div style={{fontSize:11,fontWeight:700,color:'#1e293b'}}>{s.series_name}</div><div style={{fontSize:9,color:'#94a3b8'}}>{s.student_count} students · {s.attempts} attempts</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,fontWeight:600,color:'#64748b'}}>{s.avg_earned}/699</div><div style={{fontSize:8,color:'#94a3b8'}}>AVG</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:'#10b981'}}>{s.best_earned}</div><div style={{fontSize:8,color:'#94a3b8'}}>{s.best_student}</div></div>
              <div style={{textAlign:'center'}}><span style={{padding:'2px 6px',borderRadius:5,fontSize:9,fontWeight:700,background:LB[s.level||'A1'],color:LC[s.level||'A1']}}>{s.level}</span></div>
            </div>
          ))}
        </div>
      )}
      {/* All Students Table */}
      {data.per_student?.length > 0 && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8}}>All Students ({data.per_student.length})</div>
          <div style={{maxHeight:200,overflowY:'auto'}}>
            {data.per_student.map((s:any,_i:number) => (
              <div key={s.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 50px',gap:6,padding:'6px 10px',borderRadius:6,background:s.attempts===0?'#fef2f2':'#f8fafc',border:`1px solid ${s.attempts===0?'#fecaca':'#f1f5f9'}`,marginBottom:2,alignItems:'center',fontSize:10}}>
                <div style={{fontWeight:600,color:'#1e293b'}}>{s.name}</div>
                <div style={{textAlign:'center',color:s.attempts>0?'#10b981':'#ef4444',fontWeight:700}}>{s.attempts>0?`${s.best_earned}/${s.best_total}`:'No attempts'}</div>
                <div style={{textAlign:'center',color:'#64748b'}}>{s.attempts} att.</div>
                <div style={{textAlign:'center'}}>{s.level?<span style={{padding:'1px 5px',borderRadius:4,fontSize:8,fontWeight:700,background:LB[s.level],color:LC[s.level]}}>{s.level}</span>:'—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {insights.length > 0 && (
        <div style={{padding:12,borderRadius:12,background:'linear-gradient(135deg,#faf5ff,#f0f9ff)',border:'1px solid #e9d5ff'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#7c3aed',marginBottom:6}}>Insights & Statistics</div>
          {insights.map((t,i) => <div key={i} style={{fontSize:10,color:'#6b21a8',lineHeight:1.5,paddingLeft:8,borderLeft:'2px solid #c4b5fd',marginBottom:3}}>{t}</div>)}
        </div>
      )}
    </>
  );
};

// ── Main Component ──
const AdminCOAnalytics: React.FC<Props> = ({ open, onClose }) => {
  const { apiCall } = useAuth();
  const [mode, setMode] = useState<'select'|'student'|'batch'>('select');
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [, setSelectedId] = useState<number|null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [batchSearch, setBatchSearch] = useState('');

  useEffect(() => {
    if (!open) { setMode('select'); setData(null); setSelectedId(null); return; }
    setListsLoading(true);
    (async () => {
      try {
        const [sr, br] = await Promise.all([apiCall('/users?role=student'), apiCall('/batches')]);
        if (sr.ok) { const d = await sr.json(); setStudents(Array.isArray(d) ? d : d.users || []); }
        if (br.ok) { const d = await br.json(); setBatches(Array.isArray(d) ? d : []); }
      } catch {} finally { setListsLoading(false); }
    })();
  }, [open, apiCall]);

  const filteredStudents = useMemo(() => {
    const list = studentSearch 
      ? students.filter(s => `${s.first_name} ${s.last_name} (${s.email})`.toLowerCase().includes(studentSearch.toLowerCase()))
      : students;
    return list.slice(0, 5).map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.email})` }));
  }, [students, studentSearch]);

  const filteredBatches = useMemo(() => {
    const list = batchSearch 
      ? batches.filter(b => b.name.toLowerCase().includes(batchSearch.toLowerCase()))
      : batches;
    return list.slice(0, 5).map(b => ({ value: b.id, label: b.name }));
  }, [batches, batchSearch]);

  const loadAnalytics = async (type: 'student'|'batch', id: number) => {
    setLoading(true); setData(null); setMode(type); setSelectedId(id);
    try {
      const r = await apiCall(`/tcf/admin/co/analytics/${type}/${id}`);
      if (r.ok) setData(await r.json());
    } catch {} finally { setLoading(false); }
  };

  return (
    <>
      <style>{`.admin-co-dropdown { z-index: 99999 !important; }`}</style>
      <Modal open={open} onCancel={onClose} centered width={880} footer={null} title={null} closeIcon={null} destroyOnClose
        styles={{body:{padding:0,display:'flex',flexDirection:'column',maxHeight:'calc(92vh - 40px)',overflow:'hidden'},content:{borderRadius:16,overflow:'hidden'}}}
      >
      {/* Header */}
      <div style={{background:'linear-gradient(145deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)',padding:'20px 28px',position:'relative',overflow:'hidden',flexShrink:0}}>
        <div style={{position:'absolute',top:-40,right:-40,width:120,height:120,borderRadius:'50%',background:'rgba(139,92,246,0.1)'}}/>
        <div onClick={onClose} style={{position:'absolute',top:14,right:14,width:30,height:30,borderRadius:8,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all 0.15s',zIndex:2}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.3)';}} onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.15)';}}
        ><CloseOutlined style={{color:'#f87171',fontSize:12,fontWeight:700}}/></div>
        <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:44,height:44,borderRadius:12,background:'rgba(139,92,246,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <SoundOutlined style={{fontSize:20,color:'#a78bfa'}}/>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:1.5}}>Admin Analytics</div>
            <h2 style={{fontSize:18,fontWeight:800,color:'#f1f5f9',margin:'2px 0 0'}}>
              Compréhension Orale {data?.student ? `— ${data.student.name}` : data?.batch ? `— ${data.batch.name}` : ''}
            </h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{flex:1,overflowY:'auto',minHeight:0,padding:'20px 28px 28px'}}>
        {/* Selector */}
        {mode === 'select' && (
          <div style={{maxWidth:500,margin:'20px auto'}}>
            <div style={{fontSize:14,fontWeight:700,color:'#1e293b',marginBottom:16,textAlign:'center'}}>Select a student or batch to view analytics</div>
            {listsLoading ? (
              <div style={{textAlign:'center',padding:40}}><Spin indicator={<LoadingOutlined style={{fontSize:24,color:'#8b5cf6'}} spin/>}/></div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><UserOutlined/> Student</div>
                  <AutoComplete
                    style={{width:'100%'}}
                    options={filteredStudents}
                    onSelect={(v: any) => loadAnalytics('student', v)}
                    onSearch={setStudentSearch}
                    popupMatchSelectWidth={true}
                    popupClassName="admin-co-dropdown"
                  >
                    <Input size="large" placeholder="Type student name to search..." prefix={<SearchOutlined style={{color:'#94a3b8'}}/>} />
                  </AutoComplete>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{flex:1,height:1,background:'#e2e8f0'}}/><span style={{fontSize:10,color:'#94a3b8',fontWeight:600}}>OR</span><div style={{flex:1,height:1,background:'#e2e8f0'}}/>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',marginBottom:6,display:'flex',alignItems:'center',gap:4}}><TeamOutlined/> Batch</div>
                  <AutoComplete
                    style={{width:'100%'}}
                    options={filteredBatches}
                    onSelect={(v: any) => loadAnalytics('batch', v)}
                    onSearch={setBatchSearch}
                    popupMatchSelectWidth={true}
                    popupClassName="admin-co-dropdown"
                  >
                    <Input size="large" placeholder="Type batch name to search..." prefix={<SearchOutlined style={{color:'#94a3b8'}}/>} />
                  </AutoComplete>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back button + content */}
        {mode !== 'select' && (
          <>
            <div style={{marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
              <button onClick={() => {setMode('select');setData(null);setSelectedId(null);}} style={{padding:'4px 12px',borderRadius:6,border:'1px solid #e2e8f0',background:'#f8fafc',cursor:'pointer',fontSize:11,fontWeight:600,color:'#64748b',transition:'all 0.15s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#eef2ff';}} onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc';}}
              >← Back</button>
              <span style={{fontSize:12,color:'#94a3b8'}}>{mode==='student'?'Student':'Batch'} Analytics</span>
            </div>
            {loading ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:12}}>
                <Spin indicator={<LoadingOutlined style={{fontSize:28,color:'#8b5cf6'}} spin/>}/>
                <span style={{color:'#94a3b8',fontSize:13}}>Loading analytics...</span>
              </div>
            ) : !data ? (
              <Empty description="No data available"/>
            ) : data.total_attempts === 0 ? (
              <div style={{textAlign:'center',padding:'40px 20px',color:'#94a3b8',fontSize:13}}>
                No CO attempts recorded {mode==='batch'?'for this batch':'for this student'}.
              </div>
            ) : mode === 'student' ? (
              <StudentView data={data}/>
            ) : (
              <BatchView data={data}/>
            )}
          </>
        )}
      </div>
    </Modal>
    </>
  );
};

export default AdminCOAnalytics;
