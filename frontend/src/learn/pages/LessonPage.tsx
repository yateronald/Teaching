// A lesson (/learn/<path>/<course>/<lesson>/). The page itself (introduction,
// objectives, summary, vocabulary) is pre-rendered for search engines and
// revision; the interactive player opens over it.
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, CheckOutlined, ClockCircleOutlined, LockOutlined, PlayCircleFilled, RiseOutlined } from '@ant-design/icons';
import NotFound from '../../components/Landing/NotFound';
import { CATEGORIES, categoryPath, imageUrl } from '../categories';
import { coursePath } from '../catalog';
import { finalPath, hasAutostart, hubPath, lessonPath } from '../paths';
import { ladderState, PASS_MARK, recordLesson, REVIEW_MARK, useProgress, type BadgeId } from '../progress';
import { lessonJsonLd } from '../schema';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useDemo, useMounted } from '../shell';
import { gloss, LEVELS, tx, type CourseMeta, type Lang, type Lesson } from '../types';
import { UI } from '../ui';
import { useLessons } from '../useLessons';
import { AudioButton, Rich } from '../player/common';
import Player, { type PlayerOutcome } from '../player/Player';
import EndScreen from '../player/EndScreen';
import { KIND_ICON } from './CoursePage';

/** Locks the page behind the player. */
export function useScrollLock(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [on]);
}

export function Overlay({ children }: { children: React.ReactNode }) {
  return createPortal(<div className="lp lx lx-overlay">{children}</div>, document.body);
}

function LessonBody({ lang, course, lesson, lessons }: { lang: Lang; course: CourseMeta; lesson: Lesson; lessons: Lesson[] }) {
  const ui = UI[lang];
  const l = ui.lesson;
  const { openDemo } = useDemo();
  const p = useProgress();
  const mounted = useMounted();
  const [phase, setPhase] = useState<'intro' | 'play' | 'end'>('intro');
  const [run, setRun] = useState(0);
  const [outcome, setOutcome] = useState<PlayerOutcome | null>(null);
  const [badges, setBadges] = useState<BadgeId[]>([]);
  const [force, setForce] = useState(false);
  useScrollLock(phase !== 'intro');
  // A new lesson (next lesson link) starts on its introduction.
  useEffect(() => { setPhase('intro'); setOutcome(null); setForce(false); }, [lesson.id]);

  const idx = lessons.findIndex(x => x.id === lesson.id);
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];
  const cat = CATEGORIES.find(c => c.id === course.category)!;
  const title = tx(lesson.title, lang);
  const rec = mounted ? p.lessons[lesson.id] : undefined;
  const kinds = [...new Set(lesson.steps.map(s => s.kind))].filter(k => k !== 'concept');
  const writes = lesson.steps.some(s => s.kind === 'write');
  const speaks = lesson.steps.some(s => s.kind === 'speak');
  // Levelled course: where this level stands for the learner.
  const ladder = !!course.ladder && !!lesson.level;
  const lvlIdx = lesson.level ? LEVELS.indexOf(lesson.level) : -1;
  const locked = ladder && mounted && lvlIdx > ladderState(p, course.id).unlocked && !force;
  const afterHref = next ? lessonPath(course, next, lang) : ladder ? coursePath(course, lang) : finalPath(course, lang);

  const finish = useCallback((o: PlayerOutcome) => {
    const r = recordLesson(lesson.id, o.score, o.xp, {
      path: afterHref,
      title: next ? tx(next.title, lang) : ladder ? tx(course.title, lang) : UI[lang].course.final,
      course: tx(course.title, lang),
      at: Date.now(),
    });
    setBadges(r.fresh);
    setOutcome(o);
    setPhase('end');
  }, [lesson.id, next, course, lang, afterHref, ladder]);

  const start = () => { setRun(n => n + 1); setPhase('play'); };

  // Arriving from “Start the course”, a lesson in the list or “Next lesson”:
  // the player opens at once. The state is cleared so a reload shows the page.
  const location = useLocation();
  const navigate = useNavigate();
  const autostart = hasAutostart(location.state);
  useEffect(() => {
    if (!autostart || !mounted || locked) return;
    navigate(location.pathname, { replace: true, state: null });
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, mounted, locked, lesson.id]);

  const t = ui.ladder;
  const end = (() => {
    if (!ladder || !outcome) return { href: afterHref, label: next ? ui.end.next : ui.end.final, verdict: undefined };
    const lvl = LEVELS[lvlIdx];
    const nextLvl = next?.level;
    if (outcome.score >= PASS_MARK) return { href: afterHref, label: nextLvl ? t.goNext(nextLvl) : ui.end.toCourse, verdict: { tone: 'up' as const, text: t.passed(lvl, nextLvl) } };
    if (outcome.score >= REVIEW_MARK || !prev) return { href: prev ? lessonPath(course, prev, lang) : undefined, label: prev?.level ? t.goReview(prev.level) : undefined, verdict: { tone: 'almost' as const, text: t.almost(nextLvl ?? lvl) } };
    return { href: lessonPath(course, prev, lang), label: t.goReview(prev.level ?? ''), verdict: { tone: 'review' as const, text: t.review(prev.level ?? '') } };
  })();

  return (
    <>
      <section className="lx-lesson-hero" aria-labelledby="lx-lesson-title">
        <div className="lp-wrap lx-lesson-grid">
          <div>
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)], [tx(course.title, lang), coursePath(course, lang)], [title]]} />
            <p className="lx-lesson-k"><LevelChip level={lesson.level ?? course.level} size="sm" /> {ladder ? t.level(lesson.level!) : l.lessonOf(idx + 1, lessons.length)} · {tx(course.title, lang)}</p>
            <h1 id="lx-lesson-title">{title}</h1>
            <p className="lx-hero-sub">{tx(lesson.summary, lang)}</p>
            {locked ? (
              <div className="lx-locked">
                <p className="lx-locked-t"><LockOutlined /> {t.lockedTitle}</p>
                <p>{t.lockedText(LEVELS[lvlIdx - 1])}</p>
                <div className="lp-hero-ctas">
                  <Link to={`${coursePath(course, lang)}#test`} className="lp-btn lp-btn-primary"><RiseOutlined />{t.testStart}</Link>
                  <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setForce(true)}>{t.tryAnyway}</button>
                </div>
              </div>
            ) : (
            <div className="lx-lesson-start">
              <button type="button" className="lp-btn lp-btn-primary lp-btn-lg lx-start-btn" onClick={start}>
                <PlayCircleFilled />{rec ? l.restart : l.start}
              </button>
              <span><ClockCircleOutlined /> {ui.minutes(lesson.minutes)} · {ui.steps(lesson.steps.length)}</span>
              {rec && <span className="lx-best"><CheckCircleFilled /> {l.best(Math.round(rec.best * 100))}</span>}
            </div>
            )}
            <noscript><p className="lx-note">{l.noJs}</p></noscript>
          </div>
          <div className="lx-objectives">
            <p className="lx-objectives-k">{l.objectives}</p>
            <ul>{lesson.objectives.map((o, i) => <li key={i}><CheckOutlined aria-hidden />{tx(o, lang)}</li>)}</ul>
            <div className="lx-kinds is-lg">{kinds.map(k => <span key={k}>{KIND_ICON[k]}{ui.kinds[k]}</span>)}</div>
          </div>
        </div>
      </section>

      <section className="lp-section lx-notes-sec" aria-labelledby="lx-notes">
        <div className="lp-wrap lx-cat-layout">
          <article className="lx-notes">
            <h2 id="lx-notes" className="lx-h2">{l.notes}</h2>
            <p className="lx-notes-sub">{l.notesSub}</p>
            <ul className="lx-notes-points">
              {lesson.notes.points.map((pt, i) => <li key={i}><span className="lx-n">{i + 1}</span><Rich text={tx(pt, lang)} /></li>)}
            </ul>
            {lesson.notes.vocab && lesson.notes.vocab.length > 0 && (
              <>
                <h3 className="lx-h3">{l.vocab}</h3>
                <table className="lx-vocab">
                  <tbody>
                    {lesson.notes.vocab.map(([fr, g]) => (
                      <tr key={fr}>
                        <td className="lx-vocab-fr">{mounted && <AudioButton text={fr} lang={lang} size="sm" />}<span lang="fr">{fr}</span></td>
                        <td>{gloss(g, lang) || (typeof g === 'string' ? g : g.en)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <nav className="lx-lesson-nav" aria-label={tx(course.title, lang)}>
              {prev ? <Link to={lessonPath(course, prev, lang)}><ArrowLeftOutlined /><span><small>{l.previous}</small>{tx(prev.title, lang)}</span></Link> : <Link to={coursePath(course, lang)}><ArrowLeftOutlined /><span><small>{l.backToCourse}</small>{tx(course.title, lang)}</span></Link>}
              {next ? <Link to={lessonPath(course, next, lang)} className="is-next"><span><small>{l.nextLesson}</small>{tx(next.title, lang)}</span><ArrowRightOutlined /></Link>
                : ladder ? <Link to={coursePath(course, lang)} className="is-next"><span><small>{l.backToCourse}</small>{tx(course.title, lang)}</span><ArrowRightOutlined /></Link>
                : <Link to={finalPath(course, lang)} className="is-next"><span><small>{UI[lang].course.final}</small>{UI[lang].course.finalStart}</span><ArrowRightOutlined /></Link>}
            </nav>
          </article>
          <aside className="lx-side">
            <figure className="lx-side-img"><img src={imageUrl(course.image, 640)} alt="" loading="lazy" width="640" height="360" /></figure>
            <TeacherCta lang={lang} offer={course.offer} variant={writes ? 'writing' : speaks ? 'speaking' : 'general'} compact />
          </aside>
        </div>
      </section>

      {phase === 'play' && (
        <Overlay>
          <Player
            key={run}
            steps={lesson.steps}
            lang={lang}
            seed={`${lesson.id}-${run}`}
            title={title}
            onExit={() => setPhase('intro')}
            onFinish={finish}
            onDemo={() => { setPhase('intro'); openDemo(); }}
            menu={{
              title: tx(course.title, lang),
              items: lessons.map((x, i) => ({
                id: x.id,
                label: tx(x.title, lang),
                sub: ladder && x.level ? t.level(x.level) : l.lessonOf(i + 1, lessons.length),
                href: lessonPath(course, x, lang),
                current: x.id === lesson.id,
                done: mounted && !!p.lessons[x.id],
                locked: ladder && mounted && i > ladderState(p, course.id).unlocked,
              })),
            }}
          />
        </Overlay>
      )}
      {phase === 'end' && outcome && (
        <Overlay>
          <div className="lx-end-wrap">
            <button type="button" className="lx-end-close" onClick={() => setPhase('intro')} aria-label={l.backToCourse}>×</button>
            <EndScreen
              lang={lang}
              outcome={outcome}
              badges={badges}
              nextHref={end.href}
              nextLabel={end.label}
              verdict={end.verdict}
              courseHref={coursePath(course, lang)}
              onRetry={start}
              offer={course.offer}
              ctaVariant={writes ? 'writing' : speaks ? 'speaking' : 'general'}
            />
          </div>
        </Overlay>
      )}
    </>
  );
}

export default function LessonPage({ lang, course, lessonSlug }: { lang: Lang; course: CourseMeta; lessonSlug: string }) {
  const lessons = useLessons(course.id);
  const lesson = lessons?.find(l => l.slug[lang] === lessonSlug);
  if (lessons && !lesson) return <NotFound lang={lang} />;
  const ui = UI[lang];
  const alternates = lesson ? { en: lessonPath(course, lesson, 'en'), fr: lessonPath(course, lesson, 'fr') } : { en: coursePath(course, 'en'), fr: coursePath(course, 'fr') };
  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={lesson
        ? { title: ui.lesson.metaTitle(tx(lesson.title, lang), tx(course.title, lang)), description: `${tx(lesson.summary, lang)} ${lesson.objectives.map(o => tx(o, lang)).join(' · ')}`.slice(0, 290), path: lessonPath(course, lesson, lang), jsonLd: lessonJsonLd(course, lesson, lang), image: `https://www.learnfrenchwithnatives.com${imageUrl(course.image)}` }
        : { title: tx(course.title, lang), description: tx(course.subtitle, lang), path: coursePath(course, lang) }}
    >
      {lesson && lessons ? <LessonBody lang={lang} course={course} lesson={lesson} lessons={lessons} /> : <div className="lx-loading" role="status" />}
    </LearnShell>
  );
}
