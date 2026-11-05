// The final assessment of a course and its certificate of completion.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, PrinterOutlined, RedoOutlined, SafetyCertificateFilled, TrophyOutlined } from '@ant-design/icons';
import { BRAND_LOGO } from '../../components/Landing/landingContent';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { coursePath } from '../catalog';
import { finalPath, hubPath } from '../paths';
import { recordFinal, setName, useProgress, type BadgeId } from '../progress';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../shell';
import { tx, type CourseMeta, type Lang, type Lesson, type Step } from '../types';
import { UI } from '../ui';
import { useLessons } from '../useLessons';
import { seededShuffle } from '../player/common';
import Player, { type PlayerOutcome } from '../player/Player';
import { ScoreRing, celebrate } from '../player/EndScreen';
import { Overlay, useScrollLock } from './LessonPage';

const PASS = 0.7;

/** Ten questions from the whole course, the same set for everyone. */
export function finalSteps(courseId: string, lessons: Lesson[]): Step[] {
  const pool = lessons.flatMap(l => l.steps.filter(s => s.kind === 'mcq' || s.kind === 'fill' || s.kind === 'order' || s.kind === 'conjugate'));
  return seededShuffle(pool, `final-${courseId}`).slice(0, 10);
}

export function Certificate({ lang, course, score, name, date }: { lang: Lang; course: CourseMeta; score: number; name: string; date: number }) {
  const f = UI[lang].final;
  const when = new Date(date).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="lx-cert" id="lx-certificate">
      <div className="lx-cert-border">
        <img src={BRAND_LOGO} alt="Learn French with Natives" width="64" height="64" className="lx-cert-logo" />
        <p className="lx-cert-k">{f.certTitle}</p>
        <p className="lx-cert-intro">{f.certIntro}</p>
        <p className="lx-cert-name">{name || '—'}</p>
        <p className="lx-cert-body">{f.certBody(tx(course.title, lang))}</p>
        <p className="lx-cert-score"><LevelChip level={course.level} size="sm" /> {f.certScore(Math.round(score * 100))}</p>
        <div className="lx-cert-foot">
          <span>{when}</span>
          <span className="lx-cert-seal"><SafetyCertificateFilled /></span>
          <span>Learn French with Natives</span>
        </div>
        <p className="lx-cert-note">{f.certNote}</p>
      </div>
    </div>
  );
}

export default function FinalPage({ lang, course }: { lang: Lang; course: CourseMeta }) {
  const ui = UI[lang];
  const f = ui.final;
  const lessons = useLessons(course.id);
  const steps = useMemo(() => (lessons ? finalSteps(course.id, lessons) : []), [lessons, course.id]);
  const p = useProgress();
  const mounted = useMounted();
  const [phase, setPhase] = useState<'intro' | 'play'>('intro');
  const [run, setRun] = useState(0);
  const [result, setResult] = useState<PlayerOutcome | null>(null);
  const [, setFresh] = useState<BadgeId[]>([]);
  useScrollLock(phase === 'play');
  const cat = CATEGORIES.find(c => c.id === course.category)!;
  const title = tx(course.title, lang);
  const best = mounted ? p.finals[course.id] : undefined;
  const shownScore = result?.score ?? best?.best ?? 0;
  const passed = result ? result.score >= PASS : !!best?.passed;

  const finish = (o: PlayerOutcome) => {
    const ok = o.score >= PASS;
    const allLessons = (lessons ?? []).every(l => p.lessons[l.id]);
    setFresh(recordFinal(course.id, o.score, ok, Math.round(o.score * 100), ok && allLessons));
    setResult(o);
    setPhase('intro');
    if (ok) celebrate();
  };

  return (
    <LearnShell lang={lang} alternates={{ en: finalPath(course, 'en'), fr: finalPath(course, 'fr') }}
      seo={{ title: f.metaTitle(title), description: `${f.intro} ${tx(course.subtitle, lang)}`, path: finalPath(course, lang), image: `https://www.learnfrenchwithnatives.com${imageUrl(course.image)}` }}>
      <section className="lx-lesson-hero" aria-labelledby="lx-final-title">
        <div className="lp-wrap lx-final">
          <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)], [title, coursePath(course, lang)], [f.title]]} />
          <div className="lx-final-grid">
            <div>
              <p className="lx-lesson-k"><TrophyOutlined /> {f.title}</p>
              <h1 id="lx-final-title">{title}</h1>
              <p className="lx-hero-sub">{f.intro}</p>
              {(result || best) && (
                <div className={`lx-final-result${passed ? ' is-pass' : ' is-fail'}`}>
                  <ScoreRing score={shownScore} size={120} />
                  <p>{passed ? f.passed : f.failed}</p>
                </div>
              )}
              <div className="lp-hero-ctas">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" disabled={!steps.length} onClick={() => { setRun(n => n + 1); setPhase('play'); }}>
                  {result || best ? <><RedoOutlined />{f.retry}</> : <>{f.start}<ArrowRightOutlined /></>}
                </button>
                <Link to={coursePath(course, lang)} className="lp-btn lp-btn-ghost lp-btn-lg">{ui.lesson.backToCourse}</Link>
              </div>
            </div>
            {passed && mounted ? (
              <div className="lx-final-cert">
                <label className="lx-cert-name-input">
                  <span>{f.namePrompt}</span>
                  <input defaultValue={p.name ?? ''} placeholder={f.namePlaceholder} onChange={e => setName(e.target.value)} maxLength={60} />
                </label>
                <Certificate lang={lang} course={course} score={shownScore} name={p.name ?? ''} date={best?.at ?? Date.now()} />
                <button type="button" className="lp-btn lp-btn-ghost" onClick={() => window.print()}><PrinterOutlined />{f.print}</button>
              </div>
            ) : (
              <div className="lx-final-preview" aria-hidden>
                <Certificate lang={lang} course={course} score={0.85} name={f.namePlaceholder} date={0} />
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="lp-wrap lx-final-cta"><TeacherCta lang={lang} offer={course.offer} /></div>
      {phase === 'play' && (
        <Overlay>
          <Player key={run} exam steps={steps} lang={lang} seed={`final-${course.id}-${run}`} title={f.title} onExit={() => setPhase('intro')} onFinish={finish} />
        </Overlay>
      )}
    </LearnShell>
  );
}
