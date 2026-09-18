import { useState } from 'react';
import useExamGuard from '../../hooks/useExamGuard';
import { Button, Skeleton } from 'antd';
import { AimOutlined, ClockCircleOutlined, HistoryOutlined, TrophyOutlined } from '@ant-design/icons';
import { AnalyticsPanel, AnalyticsSection, ScoreHero, ScoreTrend, Metric, TaskScores, CriteriaScores } from './AnalyticsPanel';
import { CRITERIA, dateText, durationText, scoreText, useAnalyticsResource } from './analyticsModel';
import ExamReport from '../ExamSim/ExamReport';
import type { ExamReport as Report } from '../ExamSim/examModel';

interface HistoryItem {
  id: number; overall_score: number | null; tache1_score: number | null; tache2_score: number | null; tache3_score: number | null;
  completed_at: string | null; duration_seconds: number | null; criteria_scores: Record<string, number> | string | null;
}
type Detail = HistoryItem & { overall_feedback?: string; evaluation?: Report | null } & Partial<Record<`tache${1 | 2 | 3}_${'feedback' | 'prompt' | 'transcript'}`, string>>;
interface Props { open: boolean; onClose: () => void; partieId: number; partieName: string }
const parseCriteria = (raw: HistoryItem['criteria_scores']): Record<string, number> => {
  if (!raw) return {};
  if (typeof raw === 'string') { try { return JSON.parse(raw) || {}; } catch { return {}; } }
  return raw;
};

export default function EOAnalytics({ open, onClose, partieId, partieName }: Props) {
  useExamGuard(open);
  const resource = useAnalyticsResource<HistoryItem[]>(open ? `/eo-simulation/history?partieId=${partieId}` : null);
  const history = resource.data || [];
  const [tab, setTab] = useState('overview');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const completed = history.filter(h => h.overall_score != null);
  const average = (key: 'overall_score' | 'tache1_score' | 'tache2_score' | 'tache3_score') => {
    const values = completed.filter(h => h[key] != null).map(h => Number(h[key]));
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  };
  const taskScores = [average('tache1_score'), average('tache2_score'), average('tache3_score')];
  const criteria: Record<string, number> = {};
  CRITERIA.forEach(([key]) => {
    const values = completed.map(h => parseCriteria(h.criteria_scores)[key]).filter(v => v != null && Number.isFinite(Number(v))).map(Number);
    if (values.length) criteria[key] = values.reduce((a, b) => a + b, 0) / values.length;
  });
  const weakest = taskScores.map((score, i) => ({ score, i })).filter((s): s is { score: number; i: number } => s.score !== null).sort((a, b) => a.score - b.score)[0];
  const close = () => { setSelectedId(null); onClose(); };
  return <AnalyticsPanel open={open} onClose={close} title={partieName} subtitle="Expression orale · Résultats" tone="eo" tab={tab} onTab={setTab}
    tabs={[{ value: 'overview', label: 'Aperçu' }, { value: 'history', label: `Tentatives${history.length ? ` (${history.length})` : ''}` }]} {...resource} empty={!history.length}>
    {tab === 'overview' ? <>
      <ScoreHero score={average('overall_score')} total={20} label="Score moyen" note="Calculé sur les tentatives évaluées de cette partie, parmi les 50 dernières.">
        <Metric icon={<TrophyOutlined />} label="Meilleur score" value={completed.length ? `${scoreText(Math.max(...completed.map(h => Number(h.overall_score))))} / 20` : '—'} />
        <Metric icon={<HistoryOutlined />} label="Évaluations" value={completed.length} />
        <Metric icon={<ClockCircleOutlined />} label="Temps de pratique" value={durationText(history.reduce((sum, h) => sum + Number(h.duration_seconds || 0), 0))} />
      </ScoreHero>
      <AnalyticsSection title="Vos compétences par tâche" note="Moyenne des scores disponibles"><TaskScores scores={taskScores} /></AnalyticsSection>
      {Object.keys(criteria).length > 0 && <AnalyticsSection title="Les critères en détail" note="Moyenne de vos évaluations, sur 20"><CriteriaScores criteria={criteria} /></AnalyticsSection>}
      {weakest && weakest.score < 20 && <aside className="ea-insight"><AimOutlined /><div><h3>Votre prochain axe de travail : tâche {weakest.i + 1}</h3><p>{['Préparez une présentation structurée : votre parcours, vos activités et vos projets. Développez chaque idée avec un exemple.', 'Travaillez les questions de relance et les demandes de précision pour maintenir un échange naturel.', 'Organisez votre réponse autour d’un avis clair, de deux arguments et d’exemples concrets.'][weakest.i]}</p></div></aside>}
      <ScoreTrend max={20} note="Scores évalués, de la plus ancienne à la plus récente" points={completed.filter(h => h.completed_at).map(h => ({ date: h.completed_at!, score: Number(h.overall_score), label: partieName }))} />
    </> : <AnalyticsSection title="Vos tentatives" note="Jusqu’à 50 résultats récents. Ouvrez une tentative pour lire son évaluation.">
      {history.map((h, i) => <div className="ea-attempt" key={h.id}>
        <button type="button" className="ea-attempt-button" aria-expanded={selectedId === h.id} aria-controls={`eo-detail-${h.id}`} onClick={() => setSelectedId(selectedId === h.id ? null : h.id)}>
          <span className="ea-history-row"><span className="ea-history-index">{history.length - i}</span><span><strong>{dateText(h.completed_at)}</strong><span className="ea-attempt-meta">{durationText(h.duration_seconds)} · {selectedId === h.id ? 'Masquer le détail' : 'Voir l’évaluation'}</span></span><span className="ea-history-score">{scoreText(h.overall_score)}<small> / 20</small></span></span>
        </button>
        {selectedId === h.id && <AttemptDetail key={h.id} id={h.id} />}
      </div>)}
    </AnalyticsSection>}
  </AnalyticsPanel>;
}

function AttemptDetail({ id }: { id: number }) {
  const { data, loading, error, retry } = useAnalyticsResource<Detail>(`/eo-simulation/${id}`);
  return <div className="ea-detail" id={`eo-detail-${id}`}>
    {loading ? <Skeleton active paragraph={{ rows: 4 }} /> : error ? <div role="alert"><p>{error}</p><Button onClick={retry}>Réessayer</Button></div> : data?.evaluation && data.evaluation.version >= 2 ? (
      <div className="xs-root xs-eo xs-embed"><ExamReport report={data.evaluation} /></div>
    ) : data ? <>
      <TaskScores scores={[data.tache1_score, data.tache2_score, data.tache3_score]} />
      {Object.keys(parseCriteria(data.criteria_scores)).length > 0 && <CriteriaScores criteria={parseCriteria(data.criteria_scores)} />}
      {([1, 2, 3] as const).map((n, i) => <section className="ea-detail-task" key={n}><h4>Tâche {n} · {['Présentation', 'Interaction', 'Argumentation'][i]}</h4>
        <p>{data[`tache${n}_feedback`] || 'Aucun retour disponible pour cette tâche.'}</p>
        {data[`tache${n}_prompt`] && <details><summary>Voir le sujet</summary><p>{data[`tache${n}_prompt`]}</p></details>}
        {data[`tache${n}_transcript`] && <details><summary>Lire la transcription</summary><p>{data[`tache${n}_transcript`]}</p></details>}
      </section>)}
      {data.overall_feedback && <div className="ea-feedback"><h4>Bilan de l’évaluation</h4><p>{data.overall_feedback}</p></div>}
    </> : <p>Détails indisponibles.</p>}
  </div>;
}

