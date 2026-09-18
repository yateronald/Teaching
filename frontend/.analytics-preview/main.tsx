import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import COAnalytics from '../src/components/Student/COAnalytics';
import COGlobalAnalytics from '../src/components/Student/COGlobalAnalytics';
import EOAnalytics from '../src/components/Student/EOAnalytics';
import EOGlobalAnalytics from '../src/components/Student/EOGlobalAnalytics';
import {setScenario} from './auth';
function Preview(){const [view,setView]=useState('co');const [open,setOpen]=useState(true);const [version,setVersion]=useState(0);return <div style={{fontFamily:'system-ui',padding:32,background:'#f4f6f8',minHeight:'100vh'}}><h1>Exam Preparation</h1><p>Local design verification · Sample data</p><div style={{display:'grid',gap:12,maxWidth:260}}>{['co','co-global','eo','eo-global'].map(v=><button key={v} onClick={()=>{setView(v);setOpen(true)}}>{v}</button>)}<select aria-label="Data scenario" onChange={e=>{setScenario(e.target.value);setVersion(x=>x+1);setOpen(true)}}><option value="populated">Populated</option><option value="empty">Empty</option><option value="error">Error</option></select></div><div key={version}>{view==='co'?<COAnalytics seriesId={11} seriesName="Série 11" open={open} onClose={()=>setOpen(false)}/>:view==='co-global'?<COGlobalAnalytics open={open} onClose={()=>setOpen(false)}/>:view==='eo'?<EOAnalytics partieId={1} partieName="Partie 1" open={open} onClose={()=>setOpen(false)}/>:<EOGlobalAnalytics open={open} onClose={()=>setOpen(false)}/>}</div></div>};
createRoot(document.getElementById('root')!).render(<Preview/>);
