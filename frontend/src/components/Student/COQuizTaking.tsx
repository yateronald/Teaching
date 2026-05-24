import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Modal, Spin, message } from 'antd';
import { LoadingOutlined, SoundOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

interface Question { id:number; question_order:number; question_text:string; option_a:string; option_b:string; option_c:string; option_d:string; cefr_level:string; points:number; has_audio:boolean; has_image:boolean; }
interface SeriesInfo { id:number; name:string; description?:string; duration_minutes:number; total_questions:number; total_points:number; cefr_thresholds:any; questions:Question[]; best_attempt:any; attempt_count:number; max_attempts:number; intro_audio_kdrive_file_id?:number; }
interface GradedAnswer { question_id:number; selected_answer:string|null; correct_answer:string; is_correct:boolean; points:number; cefr_level:string; }
interface SubmitResult { attempt_id:number; correct_count:number; total_questions:number; earned_points:number; total_points:number; score_percentage:number; cefr_level:string; time_spent_seconds:number; answers:GradedAnswer[]; is_auto_submitted:boolean; }
interface Props { seriesId:number; onBack:()=>void; }

const CC:Record<string,string>={A1:'#10b981',A2:'#22d3ee',B1:'#a78bfa',B2:'#f472b6',C1:'#fb923c',C2:'#ef4444'};

const COQuizTaking:React.FC<Props>=({seriesId,onBack})=>{
  const {apiCall,token}=useAuth();
  const [phase,setPhase]=useState<'loading'|'intro'|'quiz'|'results'>('loading');
  const [series,setSeries]=useState<SeriesInfo|null>(null);
  const [attemptId,setAttemptId]=useState<number|null>(null);
  const [answers,setAnswers]=useState<Record<number,string>>({});
  const [curQ,setCurQ]=useState(0);
  const [timeLeft,setTimeLeft]=useState(0);
  const [submitting,setSubmitting]=useState(false);
  const [result,setResult]=useState<SubmitResult|null>(null);
  const [audioBlobUrls,setAudioBlobUrls]=useState<Record<string,string>>({});
  const [imageBlobUrls,setImageBlobUrls]=useState<Record<string,string>>({});
  const timerRef=useRef<any>(null);
  const autoRef=useRef(false);
  const submitRef=useRef<(a:boolean)=>void>(()=>{});

  const API=import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api';

  // Load media blob URL — mimeOverride forces correct type since backend sends octet-stream to evade IDM
  const loadBlob=useCallback(async(url:string,mimeOverride?:string)=>{
    try{
      const r=await fetch(`${API}${url}`,{headers:{'Authorization':`Bearer ${token}`}});
      if(!r.ok)return '';
      const buf=await r.arrayBuffer();
      const b=new Blob([buf],mimeOverride?{type:mimeOverride}:undefined);
      return URL.createObjectURL(b);
    }catch{return '';}
  },[API,token]);

  // Fetch series
  useEffect(()=>{
    (async()=>{
      try{
        const r=await apiCall(`/tcf/student/co/series/${seriesId}`);
        if(r.ok){const d=await r.json();setSeries(d);setPhase('intro');}
        else{message.error('Failed to load');onBack();}
      }catch{message.error('Failed to load');onBack();}
    })();
  },[seriesId,apiCall,onBack]);

  // Load intro audio
  useEffect(()=>{
    if(!series?.intro_audio_kdrive_file_id)return;
    loadBlob(`/tcf/student/co/series/${seriesId}/intro-audio`,'audio/mpeg').then(u=>{if(u)setAudioBlobUrls(p=>({...p,intro:u}));});
  },[series,seriesId,loadBlob]);

  // Load current question media
  useEffect(()=>{
    if(phase!=='quiz'||!series)return;
    const q=series.questions[curQ];if(!q)return;
    const ak=`q_${q.id}_audio`, ik=`q_${q.id}_image`;
    if(q.has_audio&&!audioBlobUrls[ak])loadBlob(`/tcf/student/co/questions/${q.id}/audio`,'audio/mpeg').then(u=>{if(u)setAudioBlobUrls(p=>({...p,[ak]:u}));});
    if(q.has_image&&!imageBlobUrls[ik])loadBlob(`/tcf/student/co/questions/${q.id}/image`).then(u=>{if(u)setImageBlobUrls(p=>({...p,[ik]:u}));});
  },[phase,series,curQ,loadBlob,audioBlobUrls,imageBlobUrls]);

  const handleSubmit=useCallback(async(auto=false)=>{
    if(submitting||!series||!attemptId)return;
    setSubmitting(true);clearInterval(timerRef.current);
    try{
      const r=await apiCall(`/tcf/student/co/series/${seriesId}/submit`,{
        method:'POST',body:JSON.stringify({attempt_id:attemptId,answers:series.questions.map(q=>({question_id:q.id,selected_answer:answers[q.id]||null})),is_auto_submitted:auto}),
      });
      if(r.ok){setResult(await r.json());setPhase('results');}else message.error('Submit failed');
    }catch{message.error('Submit failed');}finally{setSubmitting(false);}
  },[submitting,series,attemptId,answers,apiCall,seriesId]);

  useEffect(()=>{submitRef.current=handleSubmit;},[handleSubmit]);

  useEffect(()=>{
    if(phase!=='quiz'||!series)return;
    timerRef.current=setInterval(()=>{
      setTimeLeft(p=>{if(p<=1){clearInterval(timerRef.current);if(!autoRef.current){autoRef.current=true;submitRef.current(true);}return 0;}return p-1;});
    },1000);
    return()=>clearInterval(timerRef.current);
  },[phase,series]);

  const startQuiz=async()=>{
    if(!series)return;
    try{
      const r=await apiCall(`/tcf/student/co/series/${seriesId}/start`,{method:'POST'});
      if(r.ok){const d=await r.json();setAttemptId(d.attempt_id);setTimeLeft(series.duration_minutes*60);setAnswers({});setCurQ(0);autoRef.current=false;setPhase('quiz');}
      else message.error('Failed to start');
    }catch{message.error('Failed to start');}
  };

  const answered=useMemo(()=>series?series.questions.filter(q=>answers[q.id]).length:0,[answers,series]);
  const fmt=(s:number)=>`${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if(phase==='loading'||!series)return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'40vh',gap:16}}>
      <Spin indicator={<LoadingOutlined style={{fontSize:32,color:'#8b5cf6'}} spin/>}/><div style={{color:'#94a3b8',fontSize:13}}>Chargement...</div>
    </div>
  );

  // ═══ INTRO MODAL ═══
  if(phase==='intro')return(
    <Modal open centered width={560} footer={null} onCancel={onBack} closeIcon={null} styles={{body:{padding:0},content:{padding:0,borderRadius:20,overflow:'hidden'}}}>
      <div style={{background:'linear-gradient(145deg,#0f172a,#1e293b)',padding:'32px 28px 24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(139,92,246,0.15)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center'}}><SoundOutlined style={{fontSize:20,color:'#fff'}}/></div>
            <div><div style={{fontSize:9,fontWeight:700,color:'#a78bfa',textTransform:'uppercase',letterSpacing:1.5}}>Compréhension Orale</div><h2 style={{fontSize:20,fontWeight:800,color:'#f1f5f9',margin:0}}>{series.name}</h2></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[{v:series.total_questions,l:'Questions',c:'#22d3ee'},{v:series.duration_minutes+"'",l:'Durée',c:'#a78bfa'},{v:series.total_points,l:'Points',c:'#fbbf24'}].map(s=>(
              <div key={s.l} style={{textAlign:'center',padding:'12px 8px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:'#94a3b8',fontWeight:600,textTransform:'uppercase'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:'20px 28px 28px'}}>
        {audioBlobUrls.intro&&(
          <div style={{padding:14,borderRadius:12,background:'#faf5ff',border:'1px solid #e9d5ff',marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:'#7c3aed',marginBottom:6}}>🎧 Audio d'introduction</div>
            <audio controls controlsList="nodownload noplaybackrate" style={{width:'100%',height:36}} onContextMenu={e=>e.preventDefault()} src={audioBlobUrls.intro}/>
          </div>
        )}
        <div style={{padding:14,borderRadius:12,background:'linear-gradient(135deg,#faf5ff,#f0f9ff)',border:'1px solid #e9d5ff',marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:'#7c3aed',marginBottom:6}}>📋 Avant de commencer</div>
          <ul style={{fontSize:11,color:'#6b21a8',lineHeight:1.8,margin:0,paddingLeft:16}}>
            <li>Difficulté progressive : <strong>A1 → A2 → B1 → B2 → C1 → C2</strong></li>
            <li>Écoutez attentivement chaque extrait audio</li>
            <li>Le chronomètre démarre immédiatement</li>
            <li>Soumission automatique quand le temps est écoulé</li>
          </ul>
        </div>
        {series.best_attempt&&(
          <div style={{padding:10,borderRadius:10,background:'#ecfdf5',border:'1px solid #a7f3d0',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:11,fontWeight:700,color:'#047857'}}>🏆 Meilleur résultat</div><div style={{fontSize:10,color:'#059669'}}>{series.best_attempt.score_percentage}% — {series.best_attempt.earned_points}/{series.best_attempt.total_points} pts</div></div>
            <div style={{padding:'3px 8px',borderRadius:6,background:CC[series.best_attempt.cefr_level]||'#6366f1',color:'#fff',fontSize:11,fontWeight:800}}>{series.best_attempt.cefr_level}</div>
          </div>
        )}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onBack} style={{padding:'11px 18px',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:700,fontSize:12,cursor:'pointer'}}><ArrowLeftOutlined/> Retour</button>
          <button onClick={startQuiz} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',boxShadow:'0 4px 20px rgba(139,92,246,0.35)'}}>Commencer l'épreuve →</button>
        </div>
        <div style={{textAlign:'center',marginTop:6,fontSize:10,color:'#94a3b8'}}>Tentative {series.attempt_count+1} / {series.max_attempts}</div>
      </div>
    </Modal>
  );

  // ═══ QUIZ MODAL ═══
  if(phase==='quiz'){
    const q=series.questions[curQ];const urgent=timeLeft<60;
    const opts=[{k:'A',t:q.option_a,c:'#8b5cf6'},{k:'B',t:q.option_b,c:'#3b82f6'},{k:'C',t:q.option_c,c:'#10b981'},{k:'D',t:q.option_d,c:'#f59e0b'}];
    const audioUrl=audioBlobUrls[`q_${q.id}_audio`];
    const imageUrl=imageBlobUrls[`q_${q.id}_image`];
    const pPct=Math.round((answered/series.total_questions)*100);
    const tPct=series.duration_minutes>0?Math.round((timeLeft/(series.duration_minutes*60))*100):100;
    return(
      <Modal open centered width={1040} footer={null} closable={false} keyboard={false} maskClosable={false}
        styles={{body:{padding:0},content:{padding:0,borderRadius:20,overflow:'hidden',boxShadow:'0 25px 60px rgba(0,0,0,0.3)'}}}
      >
        <div style={{display:'flex',minHeight:560,maxHeight:'88vh',userSelect:'none',WebkitUserSelect:'none'}} onContextMenu={e=>e.preventDefault()} onCopy={e=>e.preventDefault()}>
          {/* SIDEBAR */}
          <div style={{width:210,background:'linear-gradient(180deg,#0f172a,#1e1b4b)',padding:'18px 14px',display:'flex',flexDirection:'column',flexShrink:0}}>
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{width:96,height:96,borderRadius:'50%',margin:'0 auto 6px',position:'relative',background:`conic-gradient(${urgent?'#ef4444':'#8b5cf6'} ${tPct*3.6}deg, rgba(255,255,255,0.08) 0deg)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{width:76,height:76,borderRadius:'50%',background:'#0f172a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                  <ClockCircleOutlined style={{color:urgent?'#f87171':'#a78bfa',fontSize:10,marginBottom:1}}/>
                  <div style={{fontFamily:'monospace',fontSize:20,fontWeight:900,color:urgent?'#f87171':'#e2e8f0',letterSpacing:1,lineHeight:1}}>{fmt(timeLeft)}</div>
                </div>
              </div>
              <div style={{fontSize:8,color:'#64748b',fontWeight:600,textTransform:'uppercase',letterSpacing:1}}>Temps restant</div>
            </div>
            <div style={{marginBottom:14,padding:'8px 10px',borderRadius:8,background:'rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:9,color:'#94a3b8',fontWeight:600}}>Progression</span>
                <span style={{fontSize:10,color:'#e2e8f0',fontWeight:700}}>{answered}/{series.total_questions}</span>
              </div>
              <div style={{height:4,borderRadius:2,background:'rgba(255,255,255,0.1)'}}>
                <div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#8b5cf6,#22d3ee)',width:`${pPct}%`,transition:'width 0.4s'}}/>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',marginBottom:10}}>
              <div style={{fontSize:8,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:1,marginBottom:5}}>Questions</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:3}}>
                {series.questions.map((_,i)=>{
                  const act=i===curQ,ans=!!answers[series.questions[i].id];
                  return <div key={i} onClick={()=>setCurQ(i)} style={{width:30,height:30,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:act?800:600,cursor:'pointer',transition:'all 0.2s',background:act?'linear-gradient(135deg,#8b5cf6,#6d28d9)':ans?'rgba(34,197,94,0.2)':'rgba(255,255,255,0.06)',color:act?'#fff':ans?'#4ade80':'rgba(255,255,255,0.3)',border:act?'2px solid #a78bfa':ans?'1px solid rgba(34,197,94,0.3)':'1px solid rgba(255,255,255,0.06)',boxShadow:act?'0 0 10px rgba(139,92,246,0.4)':'none'}}>{i+1}</div>;
                })}
              </div>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:12,justifyContent:'center'}}>
              {[{c:'#8b5cf6',l:'Actuelle'},{c:'#4ade80',l:'Faite'},{c:'rgba(255,255,255,0.15)',l:'Vide'}].map(x=>(
                <div key={x.l} style={{display:'flex',alignItems:'center',gap:2,fontSize:7,color:'#94a3b8'}}><div style={{width:7,height:7,borderRadius:2,background:x.c}}/>{x.l}</div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button onClick={()=>{Modal.confirm({title:'Soumettre l\'examen ?',content:`${answered}/${series.total_questions} répondues`,okText:'Soumettre',cancelText:'Continuer',onOk:()=>handleSubmit(false)});}} disabled={submitting} style={{width:'100%',padding:'9px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',fontWeight:700,fontSize:11,cursor:'pointer',boxShadow:'0 4px 16px rgba(245,158,11,0.3)',opacity:submitting?0.6:1}}>
                {submitting?'...':'✓ Soumettre'}
              </button>
              <button onClick={()=>{Modal.confirm({title:'Quitter l\'examen ?',content:'Vos réponses ne seront pas sauvegardées et cette tentative ne sera pas comptée.',okText:'Quitter',cancelText:'Annuler',okButtonProps:{danger:true},onOk:()=>onBack()});}} disabled={submitting} style={{width:'100%',padding:'8px',borderRadius:10,border:'1px solid rgba(239,68,68,0.3)',background:'rgba(239,68,68,0.1)',color:'#f87171',fontWeight:600,fontSize:11,cursor:'pointer',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.1)'}}
              >
                Quitter l'examen
              </button>
            </div>
          </div>
          {/* MAIN */}
          <div style={{flex:1,display:'flex',flexDirection:'column',background:'#f8fafc',overflow:'hidden'}}>
            <div style={{padding:'12px 22px',background:'#fff',borderBottom:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:800}}>{curQ+1}</div>
                <div><div style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>Question {curQ+1} <span style={{color:'#94a3b8',fontWeight:400,fontSize:11}}>/ {series.total_questions}</span></div></div>
              </div>
              <div style={{display:'flex',gap:5}}>
                <div style={{padding:'3px 8px',borderRadius:5,background:(CC[q.cefr_level]||'#8b5cf6')+'15',color:CC[q.cefr_level]||'#8b5cf6',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',gap:3}}><div style={{width:5,height:5,borderRadius:'50%',background:CC[q.cefr_level]||'#8b5cf6'}}/>{q.cefr_level}</div>
                <div style={{padding:'3px 8px',borderRadius:5,background:'#fef3c7',color:'#b45309',fontSize:10,fontWeight:700}}>⭐ {q.points}</div>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'18px 24px'}}>
              {q.has_image&&(
                <div style={{marginBottom:14,borderRadius:12,overflow:'hidden',border:'1px solid #e2e8f0',background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',display:'flex',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
                  {imageUrl?<img src={imageUrl} alt="" style={{maxWidth:'100%',maxHeight:220,objectFit:'contain',pointerEvents:'none',padding:6}} draggable={false} onContextMenu={e=>e.preventDefault()}/>
                  :<div style={{padding:40,color:'#94a3b8',fontSize:11,display:'flex',alignItems:'center',gap:6}}><LoadingOutlined spin/> Chargement...</div>}
                </div>
              )}
              <div style={{padding:'14px 18px',borderRadius:10,background:'#fff',border:'1px solid #e2e8f0',marginBottom:14,boxShadow:'0 1px 3px rgba(0,0,0,0.03)'}}>
                <div style={{fontSize:14,fontWeight:600,color:'#1e293b',textAlign:'center',lineHeight:1.6}}>{q.question_text}</div>
              </div>
              {q.has_audio&&(
                <div style={{marginBottom:16,padding:'12px 14px',borderRadius:10,background:'linear-gradient(135deg,#faf5ff,#ede9fe)',border:'1px solid #ddd6fe'}}>
                  <div style={{fontSize:9,fontWeight:700,color:'#6d28d9',marginBottom:5,display:'flex',alignItems:'center',gap:4}}><SoundOutlined/> Extrait audio</div>
                  {audioUrl?<audio controls controlsList="nodownload noplaybackrate" style={{width:'100%',height:36}} onContextMenu={e=>e.preventDefault()} src={audioUrl}/>
                  :<div style={{fontSize:10,color:'#a78bfa',display:'flex',alignItems:'center',gap:5}}><LoadingOutlined spin/> Chargement...</div>}
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {opts.map(o=>{
                  const sel=answers[q.id]===o.k;
                  return <div key={o.k} onClick={()=>setAnswers(p=>({...p,[q.id]:o.k}))} style={{padding:'13px 14px',borderRadius:11,cursor:'pointer',transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',background:sel?`linear-gradient(135deg,${o.c},${o.c}dd)`:'#fff',color:sel?'#fff':'#334155',border:sel?`2px solid ${o.c}`:'2px solid #e2e8f0',boxShadow:sel?`0 4px 16px ${o.c}25`:'0 1px 3px rgba(0,0,0,0.03)',display:'flex',alignItems:'center',gap:9,transform:sel?'scale(1.015)':'scale(1)'}}
                    onMouseEnter={e=>{if(!sel){(e.currentTarget as any).style.borderColor=o.c+'50';(e.currentTarget as any).style.background=o.c+'08';(e.currentTarget as any).style.transform='scale(1.01)';}}}
                    onMouseLeave={e=>{if(!sel){(e.currentTarget as any).style.borderColor='#e2e8f0';(e.currentTarget as any).style.background='#fff';(e.currentTarget as any).style.transform='scale(1)';}}}
                  >
                    <div style={{width:30,height:30,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,flexShrink:0,background:sel?'rgba(255,255,255,0.25)':o.c+'12',color:sel?'#fff':o.c,transition:'all 0.25s'}}>{o.k}</div>
                    <div style={{fontSize:12,fontWeight:sel?700:500,lineHeight:1.4,flex:1}}>{o.t}</div>
                    {sel&&<CheckCircleFilled style={{fontSize:15,color:'rgba(255,255,255,0.8)',flexShrink:0}}/>}
                  </div>;
                })}
              </div>
            </div>
            <div style={{padding:'10px 22px',background:'#fff',borderTop:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <button onClick={()=>setCurQ(p=>Math.max(0,p-1))} disabled={curQ===0} style={{padding:'7px 16px',borderRadius:8,border:'1px solid #e2e8f0',background:'#fff',color:curQ===0?'#cbd5e1':'#475569',fontWeight:600,fontSize:11,cursor:curQ===0?'default':'pointer',display:'flex',alignItems:'center',gap:4}}><LeftOutlined style={{fontSize:9}}/> Précédent</button>
              <span style={{fontSize:10,color:'#94a3b8'}}>{answered}/{series.total_questions} répondues</span>
              <button onClick={()=>setCurQ(p=>Math.min(series.total_questions-1,p+1))} disabled={curQ>=series.total_questions-1} style={{padding:'7px 16px',borderRadius:8,border:'none',background:curQ>=series.total_questions-1?'#e2e8f0':'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontWeight:600,fontSize:11,cursor:curQ>=series.total_questions-1?'default':'pointer',display:'flex',alignItems:'center',gap:4,boxShadow:curQ<series.total_questions-1?'0 2px 8px rgba(139,92,246,0.2)':'none'}}>Suivant <RightOutlined style={{fontSize:9}}/></button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // ═══ RESULTS MODAL ═══
  if(phase==='results'&&result){
    const pct=result.score_percentage;
    return(
      <Modal open centered width={660} footer={null} closable={false} styles={{body:{padding:0},content:{padding:0,borderRadius:16,overflow:'hidden'}}}>
        <div style={{background:'linear-gradient(145deg,#0f172a,#1e293b)',padding:'28px 24px',textAlign:'center',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,borderRadius:'50%',background:`radial-gradient(circle,${CC[result.cefr_level]||'#8b5cf6'}22,transparent)`}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{fontSize:10,fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>{result.is_auto_submitted?'⏱ Temps écoulé':'✅ Examen terminé'}</div>
            <div style={{fontSize:48,fontWeight:900,background:`linear-gradient(135deg,${pct>=60?'#22d3ee,#10b981':'#fbbf24,#f97316'})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',lineHeight:1}}>{pct}%</div>
            <div style={{display:'inline-flex',marginTop:10,padding:'4px 12px',borderRadius:8,background:CC[result.cefr_level]||'#8b5cf6',color:'#fff',fontSize:14,fontWeight:800}}>Niveau {result.cefr_level}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:16}}>
              {[{v:`${result.correct_count}/${result.total_questions}`,l:'Correct',c:'#22d3ee'},{v:`${result.earned_points}/${result.total_points}`,l:'Points',c:'#fbbf24'},{v:fmt(result.time_spent_seconds),l:'Temps',c:'#a78bfa'}].map(s=>(
                <div key={s.l} style={{padding:'10px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:16,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:'#94a3b8',fontWeight:600,textTransform:'uppercase'}}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding:'20px 24px 24px',maxHeight:'40vh',overflowY:'auto'}}>
          <h3 style={{fontSize:13,fontWeight:700,color:'#1e293b',marginBottom:10}}>📝 Correction</h3>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {result.answers.map((a,i)=>{
              const q=series.questions[i];
              return(
                <div key={a.question_id} style={{padding:'8px 10px',borderRadius:8,background:a.is_correct?'#f0fdf4':'#fef2f2',border:`1px solid ${a.is_correct?'#bbf7d0':'#fecaca'}`,display:'flex',gap:8,alignItems:'center'}}>
                  <div style={{width:22,height:22,borderRadius:6,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:a.is_correct?'#22c55e':'#ef4444',color:'#fff',fontSize:10,fontWeight:800}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0,fontSize:11}}>
                    <div style={{color:'#475569',fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{q?.question_text||`Q${i+1}`}</div>
                    <div style={{display:'flex',gap:10,marginTop:2}}>
                      <span style={{color:a.is_correct?'#16a34a':'#dc2626',fontWeight:700}}>Votre: {a.selected_answer||'—'}</span>
                      {!a.is_correct&&<span style={{color:'#16a34a',fontWeight:700}}>Correcte: {a.correct_answer}</span>}
                    </div>
                  </div>
                  <span style={{padding:'1px 5px',borderRadius:4,background:(CC[a.cefr_level]||'#8b5cf6')+'18',color:CC[a.cefr_level]||'#8b5cf6',fontSize:9,fontWeight:700}}>{a.cefr_level}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{padding:'0 24px 20px',display:'flex',gap:10}}>
          <button onClick={onBack} style={{flex:1,padding:'11px',borderRadius:10,border:'1px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:700,fontSize:12,cursor:'pointer'}}><ArrowLeftOutlined/> Retour</button>
          <button onClick={()=>{setPhase('intro');setResult(null);}} style={{flex:1,padding:'11px',borderRadius:10,border:'none',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontWeight:700,fontSize:12,cursor:'pointer'}}>Reprendre</button>
        </div>
      </Modal>
    );
  }
  return null;
};
export default COQuizTaking;
