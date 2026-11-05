// The adaptive test of a levelled course (A1 → C2). It starts at A2; a right
// answer moves the next question one level up, a wrong one one level down,
// like the TCF and TEF themselves. After ten questions, the level is the
// highest one where at least half the answers were right.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRightOutlined, CloseOutlined } from '@ant-design/icons';
import { chime, stop as stopAudio } from '../audio';
import { AUTOSTART, lessonPath } from '../paths';
import { recordCourseTest } from '../progress';
import { LEVELS, type CourseMeta, type Lang, type Lesson, type Level, type McqStep } from '../types';
import { UI } from '../ui';
import { Mcq } from '../player/stepsBasic';
import { playableSteps } from '../player/Player';
import { seededShuffle } from '../player/common';
import { celebrate } from '../player/EndScreen';
import type { StepHandle } from '../player/stepTypes';

const TOTAL = 10;
const START = 1; // A2

interface Answer { level: number; ok: boolean }

/** Highest level with at least one right answer and no more wrong than right. */
export function adaptiveLevel(answers: Answer[]): number {
  let best = 0;
  LEVELS.forEach((_, i) => {
    const at = answers.filter(a => a.level === i);
    const ok = at.filter(a => a.ok).length;
    if (ok >= 1 && ok * 2 >= at.length) best = i;
  });
  return best;
}

/** The test questions of a course: its multiple-choice steps, grouped by the level of their lesson. */
function poolOf(lessons: Lesson[], seed: string): McqStep[][] {
  return LEVELS.map((lvl, i) => {
    const lesson = lessons.find(l => l.level === lvl);
    const mcqs = lesson ? playableSteps(lesson.steps).filter((s): s is McqStep => s.kind === 'mcq') : [];
    return seededShuffle(mcqs, `${seed}-${i}`);
  });
}

export default function AdaptiveTest({ lang, course, lessons, onClose }: { lang: Lang; course: CourseMeta; lessons: Lesson[]; onClose: () => void }) {
  const ui = UI[lang];
  const t = ui.ladder;
  const navigate = useNavigate();
  const [seed] = useState(() => String(Date.now()));
  const pool = useMemo(() => poolOf(lessons, seed), [lessons, seed]);
  const used = useRef(LEVELS.map(() => 0));
  const pick = (target: number): { step: McqStep; level: number } | null => {
    // The wanted level, else the nearest one that still has questions.
    for (let d = 0; d < LEVELS.length; d++) {
      for (const i of [target - d, target + d]) {
        if (i < 0 || i >= LEVELS.length) continue;
        const q = pool[i][used.current[i]];
        if (q) { used.current[i]++; return { step: q, level: i }; }
      }
    }
    return null;
  };
  const [current, setCurrent] = useState(() => pick(START));
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const handle = useRef<StepHandle | null>(null);
  useEffect(() => () => stopAudio(), []);

  const answer = () => {
    if (!current) return;
    const r = handle.current?.check();
    if (!r) return;
    chime('right');
    const all = [...answers, { level: current.level, ok: r.correct }];
    setAnswers(all);
    setReady(false);
    const next = all.length < TOTAL ? pick(r.correct ? Math.min(current.level + 1, LEVELS.length - 1) : Math.max(current.level - 1, 0)) : null;
    if (next) { setCurrent(next); return; }
    const lvl = adaptiveLevel(all);
    recordCourseTest(course.id, LEVELS[lvl] as Level);
    setResult(lvl);
    celebrate();
  };

  if (result !== null) {
    const lvl = LEVELS[result];
    const lesson = lessons.find(l => l.level === lvl);
    const ok = answers.filter(a => a.ok).length;
    return (
      <div className="lx-player">
        <header className="lx-ptop">
          <button type="button" className="lx-icon-btn" onClick={onClose} aria-label={ui.player.exit}><CloseOutlined /></button>
          <div className="lx-pbar"><motion.i animate={{ scaleX: 1 }} /></div>
        </header>
        <main className="lx-pstage">
          <motion.div className="lx-step lx-adapt-result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="lp-eyebrow">{t.testTitle}</p>
            <h2>{t.resultTitle(lvl)}</h2>
            <div className="lx-scale" aria-hidden>
              {LEVELS.map((l, i) => <span key={l} className={i === result ? 'is-on' : i < result ? 'is-below' : ''}>{l}</span>)}
            </div>
            <p className="lx-adapt-score">{t.resultScore(ok, answers.length)}</p>
            <p>{t.resultText}</p>
            <div className="lp-hero-ctas">
              {lesson && (
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => { onClose(); navigate(lessonPath(course, lesson, lang), { state: AUTOSTART }); }}>
                  {t.startAt(lvl)}<ArrowRightOutlined />
                </button>
              )}
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={onClose}>{ui.end.toCourse}</button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!current) return null;
  return (
    <div className="lx-player" role="dialog" aria-modal="true" aria-label={t.testTitle}>
      <header className="lx-ptop">
        <button type="button" className="lx-icon-btn" onClick={() => { stopAudio(); onClose(); }} aria-label={ui.player.exit}><CloseOutlined /></button>
        <div className="lx-pbar" role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={answers.length}>
          <motion.i animate={{ scaleX: answers.length / TOTAL }} />
        </div>
        <span className="lx-xp">{t.question(answers.length + 1, TOTAL)}</span>
      </header>
      <main className="lx-pstage">
        <AnimatePresence mode="wait">
          <motion.div key={answers.length} className="lx-step" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <p className="lx-place-skill"><span className="lx-adapt-chip">{t.questionLevel(LEVELS[current.level])}</span></p>
            <Mcq ref={handle} step={{ ...current.step, level: undefined, timer: undefined }} lang={lang} locked={false} seed={`adapt-${seed}-${answers.length}`} onReady={setReady} />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="lx-pfoot">
        <div className="lx-pfoot-in">
          <p className="lx-pfoot-kind">{t.testTitle}</p>
          <button type="button" className="lx-pbtn" disabled={!ready} onClick={answer}>{ui.player.next}</button>
        </div>
      </footer>
    </div>
  );
}
