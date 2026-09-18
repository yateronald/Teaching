import { useState } from 'react';
import { AimOutlined, CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { AnalyticsPanel, AnalyticsSection, ScoreHero, Metric, Meter, ScoreTrend } from './AnalyticsPanel';
import { LEVELS, LEVEL_NAMES, cefrFromPoints, dateText, durationText, percent, useAnalyticsResource } from './analyticsModel';

interface Attempt {
  id: number; completed_at: string; time_spent_seconds: number; total_questions: number;
  correct_count: number; total_points: number; earned_points: number; cefr_level: string; is_auto_submitted: boolean;
}
interface AnalyticsData {
  attempts: Attempt[]; best_attempt: Attempt | null; average_score: number; attempt_count: number;
  cefr_breakdown: Record<string, { total: number; correct: number }> | null;
}
interface Props { seriesId: number; seriesName: string; open: boolean; onClose: () => void }
const RANGES = ['Q1–Q4', 'Q5–Q10', 'Q11–Q19', 'Q20–Q29', 'Q30–Q35', 'Q36–Q39'];

export default function COAnalytics({ seriesId, seriesName, open, onClose }: Props) {
  const resource = useAnalyticsResource<AnalyticsData>(open ? `/tcf/student/co/series/${seriesId}/attempts` : null);
  const { data } = resource;
  const [tab, setTab] = useState('overview');
  const attempts = data?.attempts || [];
  const latest = attempts[0];
  const best = attempts.length ? Math.max(...attempts.map(a => Number(a.earned_points))) : 0;
  const levels = LEVELS.map((level, i) => {
    const entry = data?.cefr_breakdown?.[level];
    return { level, name: LEVEL_NAMES[i], range: RANGES[i], total: Number(entry?.total || 0), correct: Number(entry?.correct || 0), rate: percent(entry?.correct || 0, entry?.total || 0) };
  });
  const weakest = levels.filter(l => l.total > 0 && l.rate < 100).sort((a, b) => a.rate - b.rate)[0];
  const nextLevelIndex = latest ? LEVELS.indexOf(cefrFromPoints(latest.earned_points)) + 1 : 0;
  const nextThreshold = (nextLevelIndex + 1) * 100;

  return <AnalyticsPanel open={open} onClose={onClose} title={seriesName} subtitle="Compréhension orale · Résultats" tab={tab} onTab={setTab}
    tabs={[{ value: 'overview', label: 'Aperçu' }, { value: 'history', label: `Historique${attempts.length ? ` (${attempts.length})` : ''}` }]}
    {...resource} empty={!latest}>
    {data && latest && (tab === 'overview' ? <>
      <ScoreHero score={Number(latest.earned_points)} total={Number(latest.total_points) || 699} label="Dernier résultat" level={cefrFromPoints(latest.earned_points)} note={`Entraînement du ${dateText(latest.completed_at)}`}>
        <Metric icon={<CheckCircleOutlined />} label="Réponses correctes" value={`${latest.correct_count} / ${latest.total_questions}`} />
        <Metric icon={<ClockCircleOutlined />} label="Durée" value={durationText(latest.time_spent_seconds)} />
        <Metric icon={<TrophyOutlined />} label="Meilleur score" value={`${best} pts`} />
      </ScoreHero>
      <AnalyticsSection title="Vos repères par niveau" note="Réponses correctes de la dernière tentative" extra={<span className="ea-count">{percent(latest.correct_count, latest.total_questions)} % de réussite</span>}>
        <div className="ea-levels">{levels.map(l => <div className="ea-level-row" key={l.level}>
          <span className="ea-level-tag">{l.level}</span><div className="ea-level-label"><span>{l.name}</span><small>{l.range} · {l.total ? `${l.correct}/${l.total} correctes` : 'Non évalué'}</small></div>
          <Meter value={l.rate} label={`Réussite ${l.level}`} /><strong>{l.total ? `${l.rate} %` : '—'}</strong>
        </div>)}</div>
      </AnalyticsSection>
      {weakest && <aside className="ea-insight"><AimOutlined /><div><h3>À travailler ensuite : {weakest.level}</h3><p>{weakest.correct} réponse{weakest.correct === 1 ? '' : 's'} correcte{weakest.correct === 1 ? '' : 's'} sur {weakest.total}. {['A1', 'A2'].includes(weakest.level) ? 'Reprenez les messages courts du quotidien : identifiez la situation, les personnes et les informations clés.' : ['B1', 'B2'].includes(weakest.level) ? 'Entraînez-vous à repérer les intentions et les points de vue dans les conversations.' : 'Travaillez les nuances, les sous-entendus et les expressions idiomatiques.'}</p></div></aside>}
      {nextLevelIndex < LEVELS.length && <p className="ea-muted">Prochain repère : {LEVELS[nextLevelIndex]} à {nextThreshold} points, soit {Math.max(0, nextThreshold - Number(latest.earned_points))} points de plus que ce résultat.</p>}
      <ScoreTrend max={699} note="Vos tentatives, de la plus ancienne à la plus récente" points={attempts.map((a, i) => ({ date: a.completed_at, score: Number(a.earned_points), label: `Tentative ${attempts.length - i}` }))} />
    </> : <>
      <AnalyticsSection title="Toutes vos tentatives" note="De la plus récente à la plus ancienne" extra={<span className="ea-count">{attempts.length} résultats</span>}>
        <div className="ea-history">{attempts.map((a, i) => <div className="ea-history-row" key={a.id}>
          <span className="ea-history-index">{attempts.length - i}</span><div><h4>{dateText(a.completed_at)}{i === 0 ? ' · Dernière' : ''}</h4><p>{a.correct_count}/{a.total_questions} correctes · {durationText(a.time_spent_seconds)}{a.is_auto_submitted ? ' · Remise automatique' : ''}</p></div>
          <div className="ea-history-score">{a.earned_points}<small> / {a.total_points || 699}</small><span>{cefrFromPoints(a.earned_points)}{Number(a.earned_points) === best ? ' · Meilleur' : ''}</span></div>
        </div>)}</div>
      </AnalyticsSection>
    </>)}
  </AnalyticsPanel>;
}

