import React, { useMemo, useState } from 'react';
import { Popover } from 'antd';
import {
  AlertOutlined, AudioOutlined, BulbOutlined, CheckCircleOutlined, CommentOutlined, FileTextOutlined,
  FlagOutlined, InfoCircleOutlined, RiseOutlined, SafetyCertificateOutlined, WarningOutlined,
} from '@ant-design/icons';
import {
  CEFR_BANDS, ERROR_LABEL, MILESTONES, NCLC_BANDS, fr, toneOf,
  type ExamReport as Report, type ReportError, type TaskReport,
} from './examModel';
import './ExamSim.css';

export interface EETaskExtra { answer: string; consigne?: string; title?: string | null; documents?: string[]; minWords?: number; maxWords?: number; correction?: string | null }
interface Props {
  report: Report;
  /** EE: the candidate's copy and the sujet, per task (index 0 = tâche 1). */
  eeTasks?: EETaskExtra[];
  /** EO: object URLs of the candidate's recordings, per task. */
  recordings?: (string | null)[];
  footer?: React.ReactNode;
}

const TASK_TITLES = {
  eo: ['Entretien dirigé', 'Exercice en interaction', 'Expression d’un point de vue'],
  ee: ['Message', 'Récit et impressions', 'Point de vue argumenté'],
};

export default function ExamReport({ report, eeTasks, recordings, footer }: Props) {
  const [active, setActive] = useState(() => {
    const worst = [...report.tasks].filter(t => t.evaluated).sort((a, b) => a.score - b.score)[0];
    return worst ? worst.n : 1;
  });
  const skill = report.skill;
  const task = report.tasks.find(t => t.n === active) || report.tasks[0];
  const g = report.global;
  const band = CEFR_BANDS.find(b => b.level === g.cefr);

  return (
    <div className="xs-report">
      {/* ── Hero ── */}
      <section className="xs-hero" aria-label="Résultat global">
        <div className="xs-hero-score">
          <span className="xs-eyebrow">Score estimé · {skill === 'eo' ? 'Expression orale' : 'Expression écrite'}</span>
          <div className="xs-bigscore"><strong>{g.score}</strong><span>/ 20</span></div>
          <div className="xs-badges">
            <span className={`xs-badge ${toneOf(g.score)}`}>{g.cefr ? `CECR ${g.cefr}` : 'Non évaluable'}{band ? <em>{band.label}</em> : null}</span>
            <span className="xs-badge is-nclc">{g.nclc ? `NCLC ${g.nclc}` : 'Sous NCLC 4'}</span>
          </div>
        </div>
        <div className="xs-hero-text">
          <h2>{report.summary.headline}</h2>
          {report.summary.text && <p>{report.summary.text}</p>}
          {report.late && <p className="xs-note is-warn"><WarningOutlined /> Copie remise après la fin du temps : c’est la dernière version enregistrée à temps qui a été corrigée.</p>}
          <NclcTrack score={g.score} next={g.next} />
        </div>
      </section>

      {/* ── Priorities & strengths ── */}
      {report.criteria.length > 0 && (
        <section className="xs-duo">
          <div className="xs-card">
            <header className="xs-card-head"><RiseOutlined /><h3>Vos trois priorités</h3></header>
            <ol className="xs-priorities">
              {report.summary.priorities.map(p => (
                <li key={p.key}>
                  <div className="xs-prio-top"><strong>{p.label}</strong><ScorePill score={p.score} /></div>
                  <p>{p.advice}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="xs-card">
            <header className="xs-card-head"><FlagOutlined /><h3>Tous les critères</h3><span className="xs-card-note">moyenne pondérée des trois tâches</span></header>
            <ul className="xs-crit-mini">
              {[...report.criteria].sort((a, b) => b.score - a.score).map(c => (
                <li key={c.key}><span>{c.label}</span><Bar score={c.score} /><b>{fr(c.score)}</b></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Tasks ── */}
      <section className="xs-card xs-tasks">
        <div className="xs-tabs" role="tablist" aria-label="Détail par tâche">
          {report.tasks.map(t => (
            <button key={t.n} type="button" role="tab" aria-selected={t.n === active} className={`xs-tab${t.n === active ? ' is-active' : ''}`} onClick={() => setActive(t.n)}>
              <span className="xs-tab-n">Tâche {t.n}</span>
              <span className="xs-tab-title">{TASK_TITLES[skill][t.n - 1] || t.title}</span>
              <span className={`xs-tab-score ${toneOf(t.evaluated ? t.score : null)}`}>{t.evaluated ? `${fr(t.score)}/20` : '—'}</span>
            </button>
          ))}
        </div>
        {task && <TaskPanel skill={skill} task={task} extra={eeTasks?.[task.n - 1]} recording={recordings?.[task.n - 1] || null} />}
      </section>

      {/* ── Method ── */}
      <aside className="xs-method">
        <SafetyCertificateOutlined />
        <div>
          <strong>Comment cette note est calculée</strong>
          <p>
            Chaque tâche est corrigée {report.reliability.corrections >= 2 ? 'deux fois, indépendamment,' : ''} selon la grille analytique du TCF Canada
            (chaque critère sur 20, ancré sur les niveaux du CECR){report.reliability.arbitrated ? ' ; un écart entre deux corrections a été arbitré par une troisième' : ''}.
            La note est ensuite calculée par la plateforme : pondération des critères, règles de longueur, de hors-sujet{skill === 'eo' ? ' et de temps de parole' : ' et de copie'},
            puis pondération des tâches ({Object.values(g.weights).map(w => `${Math.round(w * 100)} %`).join(' / ')}). Le score est arrondi au point entier comme au TCF,
            et converti selon les barèmes officiels (CECR : France Éducation International ; NCLC : IRCC).
            {skill === 'eo' && (report.reliability.audio ? ' Votre enregistrement a été écouté pour juger la prononciation et l’aisance.' : ' Sans enregistrement exploitable, la prononciation n’a pas été notée.')}
            {' '}Il s’agit d’une estimation d’entraînement : le score officiel est attribué par les correcteurs habilités du TCF.
          </p>
        </div>
      </aside>
      {footer}
    </div>
  );
}

function NclcTrack({ score, next }: { score: number; next: Report['global']['next'] }) {
  return (
    <div className="xs-nclc" aria-label="Position sur l’échelle NCLC">
      <div className="xs-nclc-track">
        {NCLC_BANDS.map(b => {
          const reached = score >= b.min;
          const here = score >= b.min && score <= b.max;
          return (
            <div key={b.nclc} className={`xs-nclc-step${reached ? ' is-reached' : ''}${here ? ' is-here' : ''}${MILESTONES[b.nclc] ? ' is-milestone' : ''}`}>
              <span className="xs-nclc-bar" />
              <span className="xs-nclc-label">NCLC {b.nclc}</span>
              <span className="xs-nclc-range">{b.min === b.max ? b.min : `${b.min}–${b.max}`}</span>
            </div>
          );
        })}
      </div>
      {next && next.missing > 0 ? (
        <p className="xs-nclc-next"><strong>Prochain palier : NCLC {next.nclc}</strong> — {next.missing} point{next.missing > 1 ? 's' : ''} de plus{next.note ? ` · ${next.note}` : ''}.</p>
      ) : (
        <p className="xs-nclc-next"><strong>Palier maximal atteint.</strong> NCLC 10 et plus.</p>
      )}
    </div>
  );
}

const Bar = ({ score }: { score: number }) => (
  <span className={`xs-sbar ${toneOf(score)}`} aria-hidden><i style={{ width: `${Math.max(2, Math.min(100, (score / 20) * 100))}%` }} /></span>
);
const ScorePill = ({ score }: { score: number }) => <span className={`xs-pill ${toneOf(score)}`}>{fr(score)}<small>/20</small></span>;

function TaskPanel({ skill, task, extra, recording }: { skill: 'eo' | 'ee'; task: TaskReport; extra?: EETaskExtra; recording: string | null }) {
  const [view, setView] = useState<'copy' | 'better' | 'model'>('copy');
  const stats: string[] = [];
  if (skill === 'ee') stats.push(`${task.words} mots${extra?.minWords ? ` (attendu : ${extra.minWords}–${extra.maxWords})` : ''}`);
  if (skill === 'eo') {
    stats.push(`${task.words} mots prononcés`);
    if (task.stats?.speakingSeconds != null) stats.push(`${Math.round(task.stats.speakingSeconds)} s de parole effective`);
    if (task.stats?.questions != null) stats.push(`${task.stats.questions} question${task.stats.questions > 1 ? 's' : ''} posée${task.stats.questions > 1 ? 's' : ''}`);
  }

  return (
    <div className="xs-task" role="tabpanel">
      <header className="xs-task-head">
        <div>
          <h3>Tâche {task.n} · {TASK_TITLES[skill][task.n - 1] || task.title}</h3>
          <p className="xs-task-stats">{stats.join(' · ')}</p>
        </div>
        <div className="xs-task-score">
          <strong className={toneOf(task.evaluated ? task.score : null)}>{task.evaluated ? fr(task.score) : '—'}</strong><span>/ 20</span>
          {task.cefr && <em>{task.cefr}</em>}
        </div>
      </header>

      {task.adjustments.length > 0 && (
        <div className="xs-callout is-warn">
          <AlertOutlined />
          <ul>{task.adjustments.map((a, i) => <li key={i}><strong>{a.label}.</strong> {a.detail}</li>)}</ul>
        </div>
      )}
      {task.integrity && <div className="xs-callout is-info"><InfoCircleOutlined /><p>{task.integrity}</p></div>}

      {task.criteria.length > 0 && (
        <ul className="xs-criteria">
          {task.criteria.map(c => (
            <li key={c.key}>
              <div className="xs-crit-row">
                <span className="xs-crit-label">{c.label}{c.hint && <small>{c.hint}</small>}</span>
                <Bar score={c.score} />
                <ScorePill score={c.score} />
              </div>
              {c.comment && <p className="xs-crit-comment">{c.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      {(task.strengths.length > 0 || task.improvements.length > 0) && (
        <div className="xs-duo is-tight">
          <div className="xs-list is-good"><h4><CheckCircleOutlined /> Points forts</h4><ul>{task.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <div className="xs-list is-work"><h4><BulbOutlined /> À travailler</h4><ul>{task.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        </div>
      )}

      {skill === 'ee' && extra && (
        <section className="xs-copy">
          <div className="xs-seg" role="tablist" aria-label="Affichage de la copie">
            <button type="button" className={view === 'copy' ? 'is-on' : ''} onClick={() => setView('copy')}>Copie annotée{task.errors.length ? ` (${task.errors.length})` : ''}</button>
            {task.betterVersion && <button type="button" className={view === 'better' ? 'is-on' : ''} onClick={() => setView('better')}>Version améliorée</button>}
            {extra.correction && <button type="button" className={view === 'model' ? 'is-on' : ''} onClick={() => setView('model')}>Corrigé type</button>}
          </div>
          {view === 'copy' && (extra.answer.trim()
            ? <Annotated text={extra.answer} errors={task.errors} />
            : <p className="xs-empty-copy">Aucun texte rédigé pour cette tâche.</p>)}
          {view === 'better' && <div className="xs-paper is-better"><p className="xs-paper-note">Votre texte, corrigé et enrichi d’environ un niveau — mêmes idées, même plan.</p>{task.betterVersion}</div>}
          {view === 'model' && <div className="xs-paper is-model"><p className="xs-paper-note">Proposition de corrigé pour ce sujet.</p>{extra.correction}</div>}
          {view === 'copy' && task.errors.length > 0 && <ErrorList errors={task.errors} />}
        </section>
      )}

      {skill === 'eo' && (
        <>
          {recording && (
            <div className="xs-replay"><AudioOutlined /><span>Réécouter votre réponse</span><audio controls preload="none" src={recording} /></div>
          )}
          {task.errors.length > 0 && <section><h4 className="xs-h4">Erreurs relevées dans votre discours</h4><ErrorList errors={task.errors} /></section>}
          {task.betterPhrasings && task.betterPhrasings.length > 0 && (
            <section>
              <h4 className="xs-h4">Pour viser le niveau supérieur</h4>
              <ul className="xs-rephrase">
                {task.betterPhrasings.map((p, i) => (
                  <li key={i}><span className="xs-said">« {p.said} »</span><span className="xs-better">« {p.better} »</span></li>
                ))}
              </ul>
            </section>
          )}
          {task.dialogue && task.dialogue.length > 0 && (
            <details className="xs-dialogue">
              <summary><CommentOutlined /> Déroulé de l’échange (transcription automatique)</summary>
              {task.prompt && <p className="xs-dialogue-sujet"><FileTextOutlined /> {task.prompt}</p>}
              <ol>{task.dialogue.map((t, i) => <li key={i} className={t.role === 'examiner' ? 'is-examiner' : 'is-candidate'}><b>{t.role === 'examiner' ? 'Examinateur' : 'Vous'}</b><span>{t.text}</span></li>)}</ol>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function ErrorList({ errors }: { errors: ReportError[] }) {
  return (
    <ul className="xs-errors">
      {errors.map((e, i) => (
        <li key={i}>
          <span className={`xs-cat is-${e.category}`}>{ERROR_LABEL[e.category] || e.category}</span>
          <span className="xs-err-pair"><s>{e.excerpt}</s><span aria-hidden>→</span><b>{e.correction}</b></span>
          {e.explanation && <p>{e.explanation}</p>}
        </li>
      ))}
    </ul>
  );
}

/** The candidate's copy with each verified error highlighted in place. */
function Annotated({ text, errors }: { text: string; errors: ReportError[] }) {
  const parts = useMemo(() => {
    const out: React.ReactNode[] = [];
    let at = 0;
    errors.filter(e => e.start != null && e.end != null).forEach((e, i) => {
      if (e.start! < at) return;
      if (e.start! > at) out.push(text.slice(at, e.start));
      out.push(
        <Popover key={i} trigger={['hover', 'click']} content={<div className="xs-pop"><span className={`xs-cat is-${e.category}`}>{ERROR_LABEL[e.category] || e.category}</span><p><b>{e.correction}</b></p>{e.explanation && <p>{e.explanation}</p>}</div>}>
          <mark className={`xs-mark is-${e.category}`} tabIndex={0}>{text.slice(e.start, e.end)}</mark>
        </Popover>
      );
      at = e.end!;
    });
    out.push(text.slice(at));
    return out;
  }, [text, errors]);
  return <div className="xs-paper">{parts}</div>;
}
