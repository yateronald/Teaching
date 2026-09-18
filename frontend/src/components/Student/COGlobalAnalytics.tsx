import { useState } from 'react';
import { Input, Select } from 'antd';
import { BookOutlined, HistoryOutlined, SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { AnalyticsPanel, AnalyticsSection, ScoreHero, ScoreTrend, Metric, Meter } from './AnalyticsPanel';
import { LEVELS, LEVEL_NAMES, cefrFromPoints, dateText, durationText, percent, useAnalyticsResource } from './analyticsModel';

interface SeriesBreakdown { series_id: number; series_name: string; attempts: number; best_earned: number; best_total: number; latest_earned: number; latest_total: number; latest_date: string }
interface RecentAttempt { id: number; series_name: string; earned_points: number; total_points: number; correct_count: number; total_questions: number; level: string; completed_at: string; time_spent_seconds: number }
interface GlobalData {
  total_attempts: number; series_count: number; overall_level: string | null; overall_earned: number; overall_total: number;
  series_breakdown: SeriesBreakdown[]; cefr_distribution: Record<string, number>; recent_attempts: RecentAttempt[];
  score_progression: { date: string; earned: number; total: number; series: string; level: string }[];
}
export default function COGlobalAnalytics({ open, onClose }: { open: boolean; onClose: () => void }) {
  const resource = useAnalyticsResource<GlobalData>(open ? '/tcf/student/co/global-analytics' : null);
  const { data } = resource;
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const series = (data?.series_breakdown || []).filter(s => s.series_name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())).sort((a, b) => sort === 'best' ? Number(b.best_earned) - Number(a.best_earned) : Date.parse(b.latest_date) - Date.parse(a.latest_date));
  return <AnalyticsPanel open={open} onClose={onClose} title="Votre progression en écoute" subtitle="Compréhension orale · Bilan global" tab={tab} onTab={setTab}
    tabs={[{ value: 'overview', label: 'Aperçu' }, { value: 'series', label: 'Par série' }, { value: 'history', label: 'Historique' }]} {...resource} empty={!data?.total_attempts}>
    {data && (tab === 'overview' ? <>
      <ScoreHero score={Number(data.overall_earned)} total={Number(data.overall_total) || 699} label="Moyenne des meilleurs scores" level={data.overall_level} note="Votre meilleur résultat de chaque série contribue à cette moyenne.">
        <Metric icon={<BookOutlined />} label="Séries travaillées" value={data.series_count} />
        <Metric icon={<HistoryOutlined />} label="Tentatives" value={data.total_attempts} />
        <Metric icon={<TrophyOutlined />} label="Meilleur résultat" value={`${Math.max(0, ...data.series_breakdown.map(s => Number(s.best_earned)))} pts`} />
      </ScoreHero>
      <ScoreTrend max={699} note="Jusqu’à 20 dernières tentatives · Toutes les séries" points={data.score_progression.map(p => ({ date: p.date, score: Number(p.earned), label: p.series }))} />
      <AnalyticsSection title="Répartition de vos résultats" note="Niveau atteint à chaque tentative, toutes séries confondues">
        <div className="ea-levels">{LEVELS.map((level, i) => { const count = Number(data.cefr_distribution[level] || 0); return <div className="ea-level-row" key={level}><span className="ea-level-tag">{level}</span><div className="ea-level-label"><span>{LEVEL_NAMES[i]}</span><small>{count} tentative{count === 1 ? '' : 's'}</small></div><Meter value={count} max={data.total_attempts} label={`Tentatives ${level}`} /><strong>{percent(count, data.total_attempts)} %</strong></div>; })}</div>
      </AnalyticsSection>
    </> : tab === 'series' ? <AnalyticsSection title="Performance par série" note="Comparez votre dernier résultat à votre meilleur score.">
      <div className="ea-filter"><Input allowClear aria-label="Rechercher une série" placeholder="Rechercher une série" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} /><Select aria-label="Trier les séries" value={sort} onChange={setSort} options={[{ value: 'recent', label: 'Plus récentes' }, { value: 'best', label: 'Meilleurs scores' }]} /></div>
      {series.length ? series.map(s => <div className="ea-series-row" key={s.series_id}><div className="ea-series-head"><div><h4>{s.series_name}</h4><p>{s.attempts} tentative{s.attempts === 1 ? '' : 's'} · {dateText(s.latest_date)}</p></div><strong>{s.best_earned}<small> / {s.best_total || s.latest_total || 699}</small></strong></div><Meter value={Number(s.best_earned)} max={Number(s.best_total || s.latest_total) || 699} label={`Meilleur score ${s.series_name}`} /><div className="ea-series-foot"><span>Dernier : {s.latest_earned}/{s.latest_total || 699}</span><span>Meilleur niveau : {cefrFromPoints(s.best_earned)}</span></div></div>) : <p className="ea-muted">Aucune série ne correspond à votre recherche.</p>}
    </AnalyticsSection> : <AnalyticsSection title="Vos dernières tentatives" note="Les 10 résultats les plus récents · Toutes les séries">
      <div className="ea-history">{data.recent_attempts.map((a, i) => <div className="ea-history-row" key={a.id}><span className="ea-history-index">{i + 1}</span><div><h4>{a.series_name}</h4><p>{dateText(a.completed_at)} · {durationText(a.time_spent_seconds)} · {a.correct_count}/{a.total_questions} correctes</p></div><div className="ea-history-score">{a.earned_points}<small> / {a.total_points || 699}</small><span>{a.level}</span></div></div>)}</div>
    </AnalyticsSection>)}
  </AnalyticsPanel>;
}

