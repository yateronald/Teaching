import React, { useState, useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { LoadingOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

interface Attempt { id:number; started_at:string; completed_at:string; time_spent_seconds:number; total_questions:number; correct_count:number; total_points:number; earned_points:number; score_percentage:number; cefr_level:string; is_auto_submitted:boolean; }
interface CefrEntry { total:number; correct:number; }
interface AnalyticsData { attempts:Attempt[]; best_attempt:Attempt|null; average_score:number; attempt_count:number; max_attempts:number; cefr_breakdown:Record<string,CefrEntry>|null; }
interface Props { seriesId:number; seriesName:string; open:boolean; onClose:()=>void; }

const LEVELS = ['A1','A2','B1','B2','C1','C2'];
const LC:Record<string,string> = {A1:'#10b981',A2:'#22d3ee',B1:'#a78bfa',B2:'#f472b6',C1:'#fb923c',C2:'#ef4444'};
const LB:Record<string,string> = {A1:'#ecfdf5',A2:'#ecfeff',B1:'#f5f3ff',B2:'#fdf2f8',C1:'#fff7ed',C2:'#fef2f2'};
const fmt=(s:number)=>`${Math.floor(s/60)}m${(s%60).toString().padStart(2,'0')}s`;
// Official TCF point-based CEFR scale
const getCefrFromPoints = (pts: number): string => {
  if (pts >= 600) return 'C2';
  if (pts >= 500) return 'C1';
  if (pts >= 400) return 'B2';
  if (pts >= 300) return 'B1';
  if (pts >= 200) return 'A2';
  return 'A1';
};

const COAnalytics:React.FC<Props>=({seriesId,seriesName,open,onClose})=>{
  const {apiCall}=useAuth();
  const [data,setData]=useState<AnalyticsData|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!open)return;
    setLoading(true);
    (async()=>{
      try{
        const r=await apiCall(`/tcf/student/co/series/${seriesId}/attempts`);
        if(r.ok) setData(await r.json());
      }catch{}finally{setLoading(false);}
    })();
  },[open,seriesId,apiCall]);

  const insights:string[]=[];
  if(data){
    const bd=data.cefr_breakdown;
    if(bd){
      let weakest='',weakPct=999;
      for(const l of LEVELS){ if(bd[l]&&bd[l].total>0){ const p=bd[l].correct/bd[l].total; if(p<weakPct){weakPct=p;weakest=l;} } }
      if(weakest&&weakPct<1) insights.push(`Level ${weakest} is your weakest area (${Math.round(weakPct*100)}% correct). Focus your practice here.`);
      let strongest='',strongPct=0;
      for(const l of LEVELS){ if(bd[l]&&bd[l].total>0){ const p=bd[l].correct/bd[l].total; if(p>strongPct){strongPct=p;strongest=l;} } }
      if(strongest&&strongPct>0) insights.push(`Strong performance at ${strongest} (${Math.round(strongPct*100)}% correct). Keep it up!`);
      const perfect=LEVELS.filter(l=>bd[l]&&bd[l].total>0&&bd[l].correct===bd[l].total);
      if(perfect.length>0) insights.push(`Perfect score on ${perfect.join(', ')} — well done! 🎉`);
      const zero=LEVELS.filter(l=>bd[l]&&bd[l].total>0&&bd[l].correct===0);
      if(zero.length>0) insights.push(`No correct answers on ${zero.join(', ')} — needs review.`);
    }
    if(data.attempts.length>=2){
      const latest=data.attempts[0].score_percentage;
      const prev=data.attempts[1].score_percentage;
      if(latest>prev) insights.push(`📈 +${latest-prev}% improvement from your previous attempt!`);
      else if(latest<prev) insights.push(`📉 -${prev-latest}% compared to previous — keep practicing.`);
    }
  }

  return(
    <Modal open={open} onCancel={onClose} centered width={680} footer={null} title={null}
      closeIcon={null}
      className="exam-modal exam-modal-analytics"
      styles={{body:{padding:0,display:'flex',flexDirection:'column',maxHeight:'calc(90vh - 40px)',overflow:'hidden'},content:{padding:0,borderRadius:16,overflow:'hidden'}}}
    >
      {/* Header */}
      <div style={{background:'linear-gradient(145deg,#0f172a,#1e293b)',padding:'22px 28px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:100,height:100,borderRadius:'50%',background:'rgba(139,92,246,0.12)'}}/>
        {/* Close button */}
        <div onClick={onClose} style={{
          position:'absolute',top:14,right:14,width:30,height:30,borderRadius:8,
          background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',
          display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
          transition:'all 0.15s',zIndex:2,
        }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.3)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.15)';}}
        >
          <CloseOutlined style={{color:'#f87171',fontSize:12,fontWeight:700}}/>
        </div>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:9,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:1.5}}>Results Analysis</div>
          <h2 style={{fontSize:18,fontWeight:800,color:'#f1f5f9',margin:'4px 0 0'}}>{seriesName}</h2>
        </div>
      </div>

      {loading||!data?(
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:12}}>
          <Spin indicator={<LoadingOutlined style={{fontSize:28,color:'#8b5cf6'}} spin/>}/>
          <span style={{color:'#94a3b8',fontSize:13}}>Loading...</span>
        </div>
      ):(
        <div style={{padding:'20px 28px 28px',flex:1,overflowY:'auto',minHeight:0}}>
          {data.attempt_count===0?(
            <div style={{textAlign:'center',padding:'40px 20px',color:'#94a3b8',fontSize:13}}>
              No attempts recorded yet. Complete the exam to see your analytics.
            </div>
          ):(
            <>
              {/* KPI row */}
              {(() => {
                const totalPts = data.best_attempt?.total_points || 699;
                const avgPts = data.attempts.length > 0 ? Math.round(data.attempts.reduce((s,a) => s + a.earned_points, 0) / data.attempts.length) : 0;
                const bestPts = data.best_attempt?.earned_points || 0;
                return (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
                    {[
                      {v: String(data.attempt_count), l:'Attempts', c:'#3b82f6'},
                      {v: `${avgPts}/${totalPts}`, l:'Average', c:'#8b5cf6'},
                      {v: `${bestPts}/${totalPts}`, l:'Best Score', c:'#10b981'},
                      {v: (() => { const best = data.attempts.reduce((b, a) => a.earned_points > b.earned_points ? a : b, data.attempts[0]); const lv = getCefrFromPoints(best.earned_points); return lv; })(), l:'Max Level', c: (() => { const best = data.attempts.reduce((b, a) => a.earned_points > b.earned_points ? a : b, data.attempts[0]); return LC[getCefrFromPoints(best.earned_points)]||'#64748b'; })()},
                    ].map(k=>(
                      <div key={k.l} style={{textAlign:'center',padding:'12px 8px',borderRadius:10,background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                        <div style={{fontSize: k.l === 'Attempts' || k.l === 'Max Level' ? 20 : 16, fontWeight:800, color:k.c}}>{k.v}</div>
                        <div style={{fontSize:9,color:'#94a3b8',fontWeight:600,textTransform:'uppercase'}}>{k.l}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* CEFR Breakdown */}
              {data.cefr_breakdown&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:10}}>CEFR Performance <span style={{fontSize:10,color:'#94a3b8',fontWeight:500}}>(latest attempt)</span></div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6}}>
                    {LEVELS.map(lv=>{
                      const d=data.cefr_breakdown?.[lv];
                      const pct=d&&d.total>0?Math.round((d.correct/d.total)*100):0;
                      return(
                        <div key={lv} style={{textAlign:'center'}}>
                          <div style={{height:80,display:'flex',flexDirection:'column',justifyContent:'flex-end',alignItems:'center',background:'#f8fafc',borderRadius:8,border:'1px solid #f1f5f9',marginBottom:4,position:'relative',overflow:'hidden'}}>
                            <div style={{width:'100%',height:`${pct}%`,minHeight:pct>0?4:0,background:`linear-gradient(180deg,${LC[lv]},${LC[lv]}cc)`,borderRadius:'0 0 6px 6px',transition:'height 0.5s ease'}}/>
                            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:12,fontWeight:800,color:pct>50?'#fff':'#475569'}}>{pct}%</div>
                          </div>
                          <div style={{padding:'3px 0',borderRadius:5,background:LB[lv],fontSize:11,fontWeight:700,color:LC[lv]}}>{lv}</div>
                          <div style={{fontSize:9,color:'#94a3b8',marginTop:2}}>{d?`${d.correct}/${d.total}`:'—'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Insights */}
              {insights.length>0&&(
                <div style={{marginBottom:20,padding:14,borderRadius:12,background:'linear-gradient(135deg,#faf5ff,#f0f9ff)',border:'1px solid #e9d5ff'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:8}}>Insights & Recommendations</div>
                  <div style={{display:'flex',flexDirection:'column',gap:5}}>
                    {insights.map((t,i)=>(
                      <div key={i} style={{fontSize:11,color:'#6b21a8',lineHeight:1.5,paddingLeft:8,borderLeft:'2px solid #c4b5fd'}}>{t}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attempts history */}
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:8}}>Attempt History <span style={{fontSize:10,color:'#94a3b8',fontWeight:500}}>({data.attempts.length} total)</span></div>
                <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:200,overflowY:'auto'}}>
                  {data.attempts.slice(0, 5).map((a,i)=>(
                    <div key={a.id} style={{padding:'8px 12px',borderRadius:8,background:i===0?'#f0f2ff':'#f8fafc',border:`1px solid ${i===0?'#e0e4f8':'#f1f5f9'}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:20,height:20,borderRadius:5,display:'flex',alignItems:'center',justifyContent:'center',background:i===0?'#8b5cf6':'#e2e8f0',color:i===0?'#fff':'#94a3b8',fontSize:9,fontWeight:700}}>
                          {i===0?'★':data.attempts.length-i}
                        </div>
                        <div>
                          <div style={{fontSize:11,fontWeight:600,color:'#1e293b'}}>{a.earned_points}/{a.total_points} pts — {a.correct_count}/{a.total_questions} correct</div>
                          <div style={{fontSize:9,color:'#94a3b8'}}>
                            {new Date(a.completed_at).toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                            {a.is_auto_submitted?' (auto)':''} · {fmt(a.time_spent_seconds)}
                          </div>
                        </div>
                      </div>
                      <div style={{padding:'2px 8px',borderRadius:5,background:LB[getCefrFromPoints(a.earned_points)]||'#f5f3ff',color:LC[getCefrFromPoints(a.earned_points)]||'#8b5cf6',fontSize:10,fontWeight:700}}>{getCefrFromPoints(a.earned_points)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score trend */}
              {data.attempts.length>=2&&(
                <div style={{marginTop:16}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#1e293b',marginBottom:8}}>Score Trend</div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:3,height:50,padding:'0 4px'}}>
                    {[...data.attempts].reverse().map((a,i)=>{
                      const h=Math.max(4,(a.score_percentage/100)*50);
                      const isLast=i===[...data.attempts].reverse().length-1;
                      return(
                        <div key={a.id} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                          <div style={{fontSize:8,color:'#94a3b8',fontWeight:600}}>{a.score_percentage}%</div>
                          <div style={{width:'100%',height:h,borderRadius:3,background:isLast?'linear-gradient(180deg,#8b5cf6,#6d28d9)':'linear-gradient(180deg,#e2e8f0,#cbd5e1)',transition:'height 0.3s ease'}}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Modal>
  );
};
export default COAnalytics;
