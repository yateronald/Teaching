export let scenario = 'populated';
export const setScenario = (value:string) => { scenario = value; };
const attempt = {id:1,completed_at:'2026-09-16T14:00:00Z',time_spent_seconds:197,total_questions:39,correct_count:9,total_points:699,earned_points:153,cefr_level:'A1',is_auto_submitted:false};
const attempts = [attempt,{...attempt,id:2,completed_at:'2026-09-12T10:00:00Z',earned_points:120,correct_count:7}];
const series = [{series_id:11,series_name:'Série 11',attempts:2,best_earned:153,best_total:699,latest_earned:153,latest_total:699,latest_date:attempt.completed_at},{series_id:1,series_name:'Série 1 — Conversations du quotidien et compréhension des intentions',attempts:3,best_earned:420,best_total:699,latest_earned:399,latest_total:699,latest_date:'2026-09-14T10:00:00Z'}];
const criteria = {coherence:13,vocabulary:11,grammar:9,fluency:12,task_completion:15};
const eo = Array.from({length:4},(_,i)=>({id:i+1,overall_score:13-i,tache1_score:14-i,tache2_score:12-i,tache3_score:13-i,completed_at:`2026-09-${16-i*2}T14:00:00Z`,duration_seconds:900,criteria_scores:criteria}));
export const apiCall = async (url:string) => {
  if(scenario==='error') return new Response('{}',{status:503});
  const empty = scenario === 'empty';
  let data;
  if(url.includes('/series/')) data={attempts:empty?[]:attempts,best_attempt:attempt,average_score:23,attempt_count:empty?0:2,cefr_breakdown:{A1:{total:4,correct:0},A2:{total:6,correct:1},B1:{total:9,correct:4},B2:{total:10,correct:4},C1:{total:6,correct:0},C2:{total:4,correct:0}}};
  else if(url.includes('/co/global')) data={total_attempts:empty?0:5,series_count:2,overall_level:'A2',overall_earned:287,overall_total:699,series_breakdown:series,cefr_distribution:{A1:2,A2:1,B1:1,B2:1},recent_attempts:attempts.map(a=>({...a,series_name:'Série 11',level:'A1'})),score_progression:[120,200,320,420,153].map((earned,i)=>({date:`2026-09-${10+i}T10:00:00Z`,earned,total:699,series:i===4?'Série 11':'Série 1',level:'A1'}))};
  else if(url.includes('/history')) data=empty?[]:eo;
  else if(url.endsWith('/analytics')) data={global:{total_sessions:empty?0:4,avg_overall:11.5,avg_tache1:12.5,avg_tache2:10.5,avg_tache3:11.5,best_overall:13,total_duration_seconds:3600},timeline:[...eo].reverse(),avgCriteria:criteria,perPartie:[{partie_id:1,partie_name:'Partie 1',month_name:'Septembre',year:2026,attempts:4,avg_score:11.5,best_score:13,last_attempt:attempt.completed_at}]};
  else data={...eo[0],tache1_feedback:'Votre présentation est claire. Développez davantage les exemples pour enrichir votre réponse.',tache1_prompt:'Présentez votre parcours et vos projets.',tache1_transcript:'Bonjour, je vais vous présenter mon parcours...',tache2_feedback:'Posez des questions de relance pour approfondir l’échange.',tache3_feedback:'Vos arguments sont pertinents. Soignez les transitions.',overall_feedback:'Poursuivez votre travail sur la précision grammaticale et les connecteurs logiques.'};
  return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json'}});
};
export const useAuth = () => ({apiCall});
