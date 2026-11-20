// /learn/my-progress/: unified local progress across Study Path, Courses,
// Dictations, Listening (Dialogues, Ear, Docs), Reading (Texts & Missions),
// XP, streak, certificates and badges (browser-only, not indexed).
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightOutlined, CompassOutlined, CustomerServiceOutlined, EditOutlined,
  FireFilled, ReadOutlined, SafetyCertificateOutlined, StarFilled,
} from '@ant-design/icons';
import { COURSES, coursePath, courseById } from '../catalog';
import { LEVEL_COPY, levelPath } from '../levels';
import { finalPath, hubPath, placementPath, progressPath } from '../paths';
import { BADGES, courseDone, resetProgress, streak, today, useProgress } from '../progress';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../shell';
import { countTotalCompleted, getStepCompletion, useActivitySnapshot, useStudyPath } from '../studyPath/activityStore';
import { buildStudyPlan } from '../studyPath/builder';
import { goalById } from '../studyPath/copy';
import { tx, type Lang } from '../types';
import { UI } from '../ui';

function Heatmap({ days, lang }: { days: string[]; lang: Lang }) {
  const set = new Set(days);
  const cells = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { k, on: set.has(k), today: k === today() };
  });
  return (
    <div className="lx-heat" aria-label={UI[lang].progress.activity}>
      {cells.map(c => <i key={c.k} className={`${c.on ? 'is-on' : ''}${c.today ? ' is-today' : ''}`} title={c.k} />)}
    </div>
  );
}

export default function ProgressPage({ lang }: { lang: Lang }) {
  const fr = lang === 'fr';
  const ui = UI[lang];
  const pr = ui.progress;
  const p = useProgress();
  const mounted = useMounted();
  const saved = useStudyPath();
  const snap = useActivitySnapshot();

  const started = COURSES.filter(c => courseDone(p, c.id, c.lessonCount) > 0 || p.finals[c.id]);
  const certs = Object.entries(p.finals).filter(([, f]) => f.passed);

  const studySummary = useMemo(() => {
    const plan = buildStudyPlan(saved.goal, saved.level, lang);
    let done = 0;
    for (const m of plan.modules) {
      for (const s of m.steps) {
        if (mounted && getStepCompletion(s, snap, lang).done) done++;
      }
    }
    const pct = plan.totalSteps > 0 ? Math.round((done / plan.totalSteps) * 100) : 0;
    return { plan, done, total: plan.totalSteps, pct, goalTitle: tx(goalById(saved.goal).title, lang) };
  }, [saved, snap, lang, mounted]);

  const counts = useMemo(() => countTotalCompleted(snap), [snap]);

  return (
    <LearnShell lang={lang} alternates={{ en: progressPath('en'), fr: progressPath('fr') }} seo={{ title: pr.metaTitle, description: pr.sub, path: progressPath(lang), noindex: true }}>
      <section className="lx-lesson-hero">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [pr.title]]} />
          <h1>{pr.title}</h1>
          <p className="lx-hero-sub">{pr.sub}</p>
          {mounted && (
            <dl className="lx-pstats">
              <div><dt><StarFilled /> {pr.xp}</dt><dd>{p.xp}</dd></div>
              <div><dt><FireFilled /> {pr.streak}</dt><dd>{streak(p)}</dd></div>
              <div><dt><ReadOutlined /> {pr.lessonsDone}</dt><dd>{counts.lessons}</dd></div>
              <div><dt><EditOutlined /> {fr ? 'Dictées' : 'Dictations'}</dt><dd>{counts.dictations}</dd></div>
              <div><dt><CustomerServiceOutlined /> {fr ? 'Écoute' : 'Listening'}</dt><dd>{counts.dialogues + counts.ear + counts.docs}</dd></div>
              <div><dt><SafetyCertificateOutlined /> {pr.certificates}</dt><dd>{certs.length}</dd></div>
              <div className="is-wide">
                <dt>{pr.level}</dt>
                <dd>{p.placement ? <LevelChip level={p.placement.level} /> : <Link to={placementPath(lang)} className="lx-link">{pr.takeTest} →</Link>}</dd>
              </div>
            </dl>
          )}
        </div>
      </section>
      {mounted && (
        <section className="lp-section">
          <div className="lp-wrap lx-cat-layout">
            <div>
              {/* Active Study Path Summary Card */}
              <div className="sp-plan-head" style={{ marginBottom: 28 }}>
                <div className="sp-plan-flag" aria-hidden><i /><i /><i /></div>
                <div className="sp-plan-top">
                  <div className="sp-plan-identity">
                    <div className="sp-plan-badges">
                      <LevelChip level={saved.level} size="sm" />
                      <span className="sp-plan-goal">{studySummary.goalTitle}</span>
                      <span className="sp-plan-dot" aria-hidden>·</span>
                      <span className="sp-plan-level-name">{tx(LEVEL_COPY[saved.level].name, lang)}</span>
                    </div>
                    <h2>{fr ? `Votre parcours guidé ${saved.level}` : `Your ${saved.level} Guided Study Path`}</h2>
                  </div>
                  <div className="sp-plan-cta-box">
                    <Link to={hubPath(lang)} className="lp-btn lp-btn-light lp-btn-sm">
                      <CompassOutlined /> {fr ? 'Continuer mon parcours' : 'Continue my path'} <ArrowRightOutlined />
                    </Link>
                    <Link to={levelPath(saved.level, lang)} className="sp-next-hint" style={{ color: '#c3d2ee', textDecoration: 'underline' }}>
                      {fr ? `Ouvrir la salle ${saved.level} →` : `Open ${saved.level} Classroom →`}
                    </Link>
                  </div>
                </div>
                <div className="sp-progress-row">
                  <div className="sp-progress-meta">
                    <strong>{studySummary.done}/{studySummary.total} {fr ? 'étapes terminées' : 'steps completed'}</strong>
                    <span><b>{studySummary.pct}%</b></span>
                  </div>
                  <div className="sp-progress-bar" role="progressbar" aria-valuenow={studySummary.pct} aria-valuemin={0} aria-valuemax={100}>
                    <i style={{ transform: `scaleX(${Math.max(0.02, studySummary.pct / 100)})` }} />
                  </div>
                </div>
              </div>

              <h2 className="lx-h2">{pr.activity}</h2>
              <Heatmap days={p.days} lang={lang} />
              <h2 className="lx-h2">{pr.courses}</h2>
              {started.length === 0 ? (
                <p className="lx-empty">{pr.nothing} <Link to={hubPath(lang)} className="lx-link">{pr.browse} →</Link></p>
              ) : (
                <ul className="lx-prog-list">
                  {started.map(c => {
                    const n = courseDone(p, c.id, c.lessonCount);
                    const f = p.finals[c.id];
                    return (
                      <li key={c.id}>
                        <Link to={coursePath(c, lang)}>
                          <LevelChip level={c.level} size="sm" />
                          <strong>{tx(c.title, lang)}</strong>
                          <i><b style={{ transform: `scaleX(${n / c.lessonCount})` }} /></i>
                          <span>{n}/{c.lessonCount}{f?.passed ? ' · ✓' : ''}</span>
                          <ArrowRightOutlined />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              {certs.length > 0 && (
                <>
                  <h2 className="lx-h2">{pr.certificates}</h2>
                  <ul className="lx-prog-list">
                    {certs.map(([id, f]) => {
                      const c = courseById(id);
                      return c ? <li key={id}><Link to={finalPath(c, lang)}><SafetyCertificateOutlined /><strong>{tx(c.title, lang)}</strong><span>{Math.round(f.best * 100)}%</span><ArrowRightOutlined /></Link></li> : null;
                    })}
                  </ul>
                </>
              )}
              <h2 className="lx-h2">{pr.badges}</h2>
              <ul className="lx-badges">
                {BADGES.map(b => {
                  const has = p.badges.includes(b);
                  return (
                    <li key={b} className={`lx-badge${has ? ' is-on' : ''}`}>
                      <span className="lx-badge-medal" aria-hidden>★</span>
                      <div><strong>{ui.badges[b][0]}</strong><small>{ui.badges[b][1]}</small></div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="lx-link lx-reset" onClick={() => { if (window.confirm(pr.resetConfirm)) resetProgress(); }}>{pr.reset}</button>
            </div>
            <aside className="lx-side"><TeacherCta lang={lang} compact /></aside>
          </div>
        </section>
      )}
    </LearnShell>
  );
}
