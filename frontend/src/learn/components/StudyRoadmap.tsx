// Centerpiece Guided Study Roadmap (Step 2 & Step 3 of Architecture #2).
// Reusable across BOTH the Free Courses Hub (/learn/) and every CEFR Level Classroom (/learn/level/<lv>/).
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightOutlined, BookOutlined, CheckCircleFilled, CheckOutlined,
  ClockCircleOutlined, CustomerServiceOutlined, DownOutlined, EditOutlined,
  PlayCircleFilled, ReadOutlined, RocketOutlined, ThunderboltOutlined,
  TrophyOutlined, UpOutlined,
} from '@ant-design/icons';
import { LEVEL_COPY, levelPath } from '../levels';
import { AUTOSTART } from '../paths';
import { readingPath } from '../practice/meta';
import { listeningPath } from '../practice/listening/catalog';
import { dictationPath } from '../practice/dictation/catalog';
import { TEXTS } from '../practice/meta';
import { MISSIONS } from '../practice/missions';
import { DIALOGUES } from '../practice/dialogues/meta';
import { EAR } from '../practice/ear/meta';
import { LISTENING } from '../practice/listening/catalog';
import { DICTATIONS } from '../practice/dictation/catalog';
import { LevelChip, useDemo } from '../shell';
import { tx, type Lang, type Level } from '../types';
import { getStepCompletion, useActivitySnapshot } from '../studyPath/activityStore';
import { STEP_KIND_LABEL, STUDY_COPY, goalById } from '../studyPath/copy';
import type { StudyPlan, StudyStep, StudyStepKind } from '../studyPath/types';

const KIND_ICON: Record<StudyStepKind, ReactNode> = {
  course: <BookOutlined />,
  listen: <CustomerServiceOutlined />,
  read: <ReadOutlined />,
  write: <EditOutlined />,
  game: <PlayCircleFilled />,
  checkpoint: <ThunderboltOutlined />,
};

interface StudyRoadmapProps {
  lang: Lang;
  plan: StudyPlan;
  mounted: boolean;
  /** Optional callback when learner clicks "Start Level [Next] Path" (Hub updates state; LevelPage navigates). */
  onAdvanceLevel?: (next: Level) => void;
  /** Show compact "Pick up where you left off" link inside the header when available. */
  showResumeLink?: boolean;
  /** Show "Open [Level] Classroom" secondary link (useful on Hub, hidden on LevelPage itself). */
  showClassroomLink?: boolean;
}

export function StudyRoadmap({
  lang,
  plan,
  mounted,
  onAdvanceLevel,
  showResumeLink = false,
  showClassroomLink = true,
}: StudyRoadmapProps) {
  const c = STUDY_COPY[lang].roadmap;
  const snap = useActivitySnapshot();
  const { openDemo } = useDemo();
  const goal = goalById(plan.goal);

  // Evaluate live completion for every module & step (SSR renders 0 completed cleanly)
  const evaluated = useMemo(() => {
    let completedSteps = 0;
    let firstIncompleteMod = -1;
    let nextStep: StudyStep | null = null;
    let nextStepModIndex = 1;

    const modules = plan.modules.map((mod, mIdx) => {
      const steps = mod.steps.map(step => {
        const comp = mounted ? getStepCompletion(step, snap, lang) : { done: false, started: false };
        if (comp.done) {
          completedSteps++;
        } else if (!nextStep) {
          nextStep = step;
          nextStepModIndex = mod.index;
        }
        return { step, comp };
      });
      const doneInMod = steps.filter(x => x.comp.done).length;
      const startedInMod = steps.some(x => x.comp.started);
      const isComplete = steps.length > 0 && doneInMod === steps.length;
      if (!isComplete && firstIncompleteMod === -1) firstIncompleteMod = mIdx;
      return { mod, steps, doneInMod, startedInMod, isComplete };
    });

    const activeModIdx = firstIncompleteMod === -1 ? 0 : firstIncompleteMod;
    const pct = plan.totalSteps > 0 ? Math.round((completedSteps / plan.totalSteps) * 100) : 0;
    const allComplete = plan.totalSteps > 0 && completedSteps === plan.totalSteps;
    const checkpointComp = mounted ? getStepCompletion(plan.checkpoint, snap, lang) : { done: false, started: false };

    return {
      modules,
      completedSteps,
      pct,
      allComplete,
      activeModIdx,
      nextStep: (nextStep ?? plan.modules[0]?.steps[0] ?? null) as StudyStep | null,
      nextStepModIndex,
      checkpointComp,
    };
  }, [plan, snap, lang, mounted]);

  // Track which modules are expanded; auto-open the active module when plan/goal/level changes
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const firstId = plan.modules[0]?.id;
    return firstId ? { [firstId]: true } : {};
  });

  const planKey = `${plan.goal}-${plan.level}`;
  useEffect(() => {
    const activeMod = evaluated.modules[evaluated.activeModIdx]?.mod;
    if (activeMod) {
      setOpenMap({ [activeMod.id]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey, mounted]);

  const toggleMod = (id: string) => setOpenMap(prev => ({ ...prev, [id]: !prev[id] }));

  const totalHours = Math.max(1, Math.round((plan.totalMinutes / 60) * 10) / 10);
  const recentLast = mounted && showResumeLink ? snap.progress.last : undefined;

  const readingTotal = TEXTS.length + MISSIONS.length;
  const listeningTotal = DIALOGUES.length + EAR.length + LISTENING.length;

  return (
    <div className="sp-workspace">
      {/* ── Left / Main Column: Progress Header + Numbered Modules ── */}
      <div className="sp-main">
        {/* Executive Roadmap Progress & Single Primary CTA Card */}
        <header className="sp-plan-head">
          <div className="sp-plan-flag" aria-hidden><i /><i /><i /></div>

          <div className="sp-plan-top">
            <div className="sp-plan-identity">
              <div className="sp-plan-badges">
                <LevelChip level={plan.level} size="sm" />
                <span className="sp-plan-goal">{tx(goal.title, lang)}</span>
                <span className="sp-plan-dot" aria-hidden>·</span>
                <span className="sp-plan-level-name">{tx(LEVEL_COPY[plan.level].name, lang)}</span>
              </div>
              <h2>
                {evaluated.allComplete
                  ? c.allDoneTitle(plan.level)
                  : `${c.progressLabel(plan.level)} — ${tx(goal.shortTitle, lang)}`}
              </h2>
              <p className="sp-plan-sub">{tx(LEVEL_COPY[plan.level].focus, lang)}</p>
            </div>

            <div className="sp-plan-cta-box">
              {evaluated.nextStep && !evaluated.allComplete ? (
                <Link
                  to={evaluated.nextStep.to}
                  state={evaluated.nextStep.autostart ? AUTOSTART : undefined}
                  className="lp-btn lp-btn-light sp-primary-cta"
                >
                  <PlayCircleFilled />
                  <span>
                    {evaluated.completedSteps === 0
                      ? c.startFirst(evaluated.nextStepModIndex)
                      : c.continueMod(evaluated.nextStepModIndex)}
                  </span>
                  <ArrowRightOutlined />
                </Link>
              ) : plan.nextLevel ? (
                onAdvanceLevel ? (
                  <button type="button" className="lp-btn lp-btn-light sp-primary-cta" onClick={() => onAdvanceLevel(plan.nextLevel!)}>
                    <RocketOutlined /> {c.switchNext(plan.nextLevel)} <ArrowRightOutlined />
                  </button>
                ) : (
                  <Link to={levelPath(plan.nextLevel, lang)} className="lp-btn lp-btn-light sp-primary-cta">
                    <RocketOutlined /> {c.switchNext(plan.nextLevel)} <ArrowRightOutlined />
                  </Link>
                )
              ) : null}

              {evaluated.nextStep && !evaluated.allComplete && (
                <small className="sp-next-hint">
                  {tx(STEP_KIND_LABEL[evaluated.nextStep.kind], lang)} · {evaluated.nextStep.title}
                </small>
              )}
            </div>
          </div>

          <div className="sp-progress-row">
            <div className="sp-progress-meta">
              <strong>{c.stepsDone(evaluated.completedSteps, plan.totalSteps)}</strong>
              <span>
                {c.modulesCount(plan.modules.length)} · ~{totalHours} h · <b>{evaluated.pct}%</b>
              </span>
            </div>
            <div className="sp-progress-bar" role="progressbar" aria-valuenow={evaluated.pct} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ transform: `scaleX(${Math.max(0.02, evaluated.pct / 100)})` }} />
            </div>
          </div>

          {recentLast && (
            <div className="sp-recent-bar">
              <span><ClockCircleOutlined aria-hidden /> {c.resumeRecent}:</span>
              <Link to={recentLast.path} state={AUTOSTART}>
                <strong>{recentLast.title}</strong> ({recentLast.course}) <ArrowRightOutlined />
              </Link>
            </div>
          )}
        </header>

        {/* Numbered Mixed-Skill Module Stepper (Modules 1 → N) */}
        <ol className="sp-modules">
          {evaluated.modules.map(({ mod, steps, doneInMod, startedInMod, isComplete }, mIdx) => {
            const isActive = mIdx === evaluated.activeModIdx && !evaluated.allComplete;
            const isOpen = !!openMap[mod.id];
            const stateClass = isComplete ? 'is-done' : isActive ? 'is-active' : 'is-upcoming';

            return (
              <li key={mod.id} className={`sp-module ${stateClass}${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="sp-mod-head"
                  aria-expanded={isOpen}
                  onClick={() => toggleMod(mod.id)}
                >
                  <span className="sp-mod-node" aria-hidden>
                    {isComplete ? <CheckOutlined /> : String(mod.index).padStart(2, '0')}
                  </span>

                  <span className="sp-mod-info">
                    <span className="sp-mod-kicker">
                      <b>{c.moduleLabel(mod.index)}</b>
                      {isComplete && <span className="sp-mod-pill is-done"><CheckCircleFilled /> {c.statusDone}</span>}
                      {isActive && (
                        <span className="sp-mod-pill is-active">
                          {startedInMod ? c.statusProgress : c.statusActive}
                        </span>
                      )}
                      <span className="sp-mod-count">{doneInMod}/{steps.length}</span>
                      <span className="sp-mod-time"><ClockCircleOutlined aria-hidden /> ~{mod.minutes} min</span>
                    </span>
                    <strong>{mod.title}</strong>
                    <small>{mod.theme}</small>
                  </span>

                  <span className="sp-mod-chevron" aria-hidden>
                    {isOpen ? <UpOutlined /> : <DownOutlined />}
                  </span>
                </button>

                {isOpen && (
                  <ul className="sp-steps">
                    {steps.map(({ step, comp }) => {
                      const isNextStep = evaluated.nextStep?.id === step.id && !evaluated.allComplete;
                      return (
                        <li key={step.id} className={`sp-step${comp.done ? ' is-done' : ''}${isNextStep ? ' is-next' : ''}`}>
                          <Link to={step.to} state={step.autostart ? AUTOSTART : undefined} className="sp-step-link">
                            <span className={`sp-step-check${comp.done ? ' is-done' : comp.started ? ' is-part' : ''}`} aria-hidden>
                              {comp.done ? <CheckOutlined /> : null}
                            </span>

                            <span className={`sp-skill-tag is-${step.kind}`}>
                              {KIND_ICON[step.kind]}
                              <span>{tx(STEP_KIND_LABEL[step.kind], lang)}</span>
                            </span>

                            <span className="sp-step-copy">
                              <strong>{step.title}</strong>
                              <small>{step.badge} · ~{step.minutes} min</small>
                            </span>

                            <span className="sp-step-end">
                              {comp.detail && <span className={`sp-step-score${comp.done ? ' is-done' : ''}`}>{comp.detail}</span>}
                              <span className={`sp-step-action${isNextStep ? ' is-next' : ''}`}>
                                {comp.done ? c.reviewStep : comp.started ? c.continueStep : c.startStep}
                                <ArrowRightOutlined aria-hidden />
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── Right Companion Column: Step 3 Checkpoint, Next Level & Quick Practice ── */}
      <aside className="sp-side">
        {/* Step 3: Level Checkpoint */}
        <section className="sp-side-card is-checkpoint">
          <p className="sp-side-eyebrow"><ThunderboltOutlined aria-hidden /> {c.checkpointEyebrow}</p>
          <h3>{c.checkpointTitle(plan.level)}</h3>
          <p>{c.checkpointDesc}</p>
          <Link to={plan.checkpoint.to} className="lp-btn lp-btn-primary lp-btn-sm sp-side-btn">
            <span>{plan.checkpoint.title}</span>
            <ArrowRightOutlined />
          </Link>
          {evaluated.checkpointComp.done && evaluated.checkpointComp.detail && (
            <p className="sp-side-status">
              <CheckCircleFilled /> {lang === 'fr' ? `Dernier bilan : ${evaluated.checkpointComp.detail}` : `Latest check: ${evaluated.checkpointComp.detail}`}
            </p>
          )}
        </section>

        {/* Milestone / Advance to Next Level */}
        <section className="sp-side-card is-milestone">
          {plan.nextLevel ? (
            <>
              <p className="sp-side-eyebrow"><TrophyOutlined aria-hidden /> {c.nextLevelEyebrow}</p>
              <h3>{c.nextLevelTitle(plan.nextLevel)}</h3>
              <p>{c.nextLevelDesc(plan.nextLevel)}</p>
              <div className="sp-side-actions">
                {onAdvanceLevel ? (
                  <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm sp-side-btn" onClick={() => onAdvanceLevel(plan.nextLevel!)}>
                    <RocketOutlined /> {c.switchNext(plan.nextLevel)} <ArrowRightOutlined />
                  </button>
                ) : (
                  <Link to={levelPath(plan.nextLevel, lang)} className="lp-btn lp-btn-ghost lp-btn-sm sp-side-btn">
                    <RocketOutlined /> {c.switchNext(plan.nextLevel)} <ArrowRightOutlined />
                  </Link>
                )}
                {showClassroomLink && (
                  <Link to={levelPath(plan.level, lang)} className="lx-link sp-side-sublink">
                    {c.openClassroom(plan.level)} →
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="sp-side-eyebrow"><TrophyOutlined aria-hidden /> C2 · {tx(LEVEL_COPY.C2.name, lang)}</p>
              <h3>{c.masteryTitle}</h3>
              <p>{c.masteryDesc}</p>
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm sp-side-btn" onClick={openDemo}>
                {lang === 'fr' ? 'Essayer un cours avec un prof natif' : 'Try a live class with a native teacher'} <ArrowRightOutlined />
              </button>
            </>
          )}
        </section>

        {/* 3-Minute Daily Game Boost */}
        <section className="sp-side-card is-game">
          <p className="sp-side-eyebrow"><PlayCircleFilled aria-hidden /> {c.dailyBoostEyebrow}</p>
          <h3>{plan.dailyGame.title}</h3>
          <p>{plan.dailyGame.subtitle}</p>
          <Link to={plan.dailyGame.to} className="lx-link sp-side-sublink">
            {c.dailyBoostCta} ({plan.dailyGame.badge}) →
          </Link>
        </section>

        {/* Direct Unguided Practice Links */}
        <section className="sp-side-card is-free">
          <h4>{c.freePracticeTitle}</h4>
          <p>{c.freePracticeDesc}</p>
          <div className="sp-quick-links">
            <Link to={readingPath(lang)}>
              <ReadOutlined /> <span>{lang === 'fr' ? 'Lecture' : 'Reading'}</span> <b>{readingTotal}</b>
            </Link>
            <Link to={listeningPath(lang)}>
              <CustomerServiceOutlined /> <span>{lang === 'fr' ? 'Écoute' : 'Listening'}</span> <b>{listeningTotal}</b>
            </Link>
            <Link to={dictationPath(lang)}>
              <EditOutlined /> <span>{lang === 'fr' ? 'Dictées' : 'Dictation'}</span> <b>{DICTATIONS.length}</b>
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}
