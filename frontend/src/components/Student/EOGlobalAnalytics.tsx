import { useState } from 'react';
import { Input, Select } from 'antd';
import { ClockCircleOutlined, HistoryOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { AnalyticsPanel, AnalyticsSection, ScoreHero, ScoreTrend, Metric, Meter, TaskScores, CriteriaScores } from './AnalyticsPanel';
import { dateText, durationText, scoreText, useAnalyticsResource } from './analyticsModel';

interface PerPartie { partie_id: number | null; partie_name: string; month_name: string | null; year: number | null; attempts: number; avg_score: number | null; best_score: number | null; last_attempt: string | null }
interface TimelineEntry { id: number; overall_score: number | null; tache1_score: number | null; tache2_score: number | null; tache3_score: number | null; completed_at: string }
interface AnalyticsData {
  global: { total_sessions: number; avg_overall: number | null; avg_tache1: number | null; avg_tache2: number | null; avg_tache3: number | null; best_overall: number | null; total_duration_seconds: number | null };
  perPartie: PerPartie[]; timeline: TimelineEntry[]; avgCriteria: Record<string, number> | null;
}
export default function EOGlobalAnalytics({ open, onClose }: { open: boolean; onClose: () => void }) {
  const resource = useAnalyticsResource<AnalyticsData>(open ? '/eo-simulation/analytics' : null);
  const { data } = resource;
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const parties = (data?.perPartie || []).filter(p => `${p.partie_name} ${p.month_name || ''} ${p.year || ''}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).sort((a, b) => sort === 'best' ? Number(b.best_score ?? -1) - Number(a.best_score ?? -1) : Date.parse(b.last_attempt || '') - Date.parse(a.last_attempt || ''));
  return <AnalyticsPanel open={open} onClose={onClose} title="Votre progression à l’oral" subtitle="Expression orale · Bilan global" tone="eo" tab={tab} onTab={setTab}
    tabs={[{ value: 'overview', label: 'Aperçu' }, { value: 'parties', label: 'Par partie' }, { value: 'criteria', label: 'Compétences' }]} {...resource} empty={!data?.global.total_sessions}>
    {data && (tab === 'overview' ? <>
      <ScoreHero score={data.global.avg_overall} total={20} label="Score moyen global" note="Moyenne de toutes vos simulations évaluées.">
        <Metric icon={<TrophyOutlined />} label="Meilleur score" value={`${scoreText(data.global.best_overall)} / 20`} />
        <Metric icon={<HistoryOutlined />} label="Simulations" value={data.global.total_sessions} />
        <Metric icon={<ClockCircleOutlined />} label="Temps de pratique" value={durationText(data.global.total_duration_seconds)} />
      </ScoreHero>
      <ScoreTrend max={20} note="Vos premières simulations évaluées · Jusqu’à 30 résultats" points={data.timeline.filter(t => t.overall_score != null).map(t => ({ date: t.completed_at, score: Number(t.overall_score), label: `Simulation #${t.id}` }))} />
      <AnalyticsSection title="Moyenne par tâche" note="Toutes vos simulations évaluées"><TaskScores scores={[data.global.avg_tache1, data.global.avg_tache2, data.global.avg_tache3]} /></AnalyticsSection>
    </> : tab === 'parties' ? <AnalyticsSection title="Performance par partie" note="Vos moyennes et meilleurs scores, regroupés par entraînement.">
      <div className="ea-filter"><Input allowClear aria-label="Rechercher une partie" placeholder="Rechercher une partie" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} /><Select aria-label="Trier les parties" value={sort} onChange={setSort} options={[{ value: 'recent', label: 'Plus récentes' }, { value: 'best', label: 'Meilleurs scores' }]} /></div>
      {parties.length ? parties.map(p => <div className="ea-series-row" key={p.partie_id ?? 'free'}><div className="ea-series-head"><div><h4>{p.partie_name}</h4><p>{[p.month_name, p.year].filter(Boolean).join(' ')} · {p.attempts} tentative{p.attempts === 1 ? '' : 's'}</p></div><strong>{scoreText(p.avg_score)}<small> / 20 · moyenne</small></strong></div>{p.avg_score != null && <Meter value={Number(p.avg_score)} max={20} label={`Score moyen ${p.partie_name}`} />}<div className="ea-series-foot"><span>Meilleur : {scoreText(p.best_score)}/20</span><span>{dateText(p.last_attempt)}</span></div></div>) : <p className="ea-muted">Aucune partie ne correspond à votre recherche.</p>}
    </AnalyticsSection> : <>
      <AnalyticsSection title="Votre profil de compétences" note="Moyenne des critères évalués, sur 20">{data.avgCriteria ? <CriteriaScores criteria={data.avgCriteria} /> : <p className="ea-muted">Les critères détaillés ne sont pas encore disponibles.</p>}</AnalyticsSection>
      <AnalyticsSection title="Les trois tâches" note="Repérez les tâches à retravailler en priorité"><TaskScores scores={[data.global.avg_tache1, data.global.avg_tache2, data.global.avg_tache3]} /></AnalyticsSection>
    </>)}
  </AnalyticsPanel>;
}

