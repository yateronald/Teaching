// Results after a lesson: score ring, XP, new badges, the mistakes to review,
// what to do next, and a call to action matched to the course.
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRightOutlined, ClockCircleOutlined, CloseCircleFilled, RedoOutlined, StarFilled, TrophyFilled } from '@ant-design/icons';
import type { BadgeId } from '../progress';
import { TeacherCta } from '../shell';
import { AUTOSTART } from '../paths';
import type { Lang } from '../types';
import { UI } from '../ui';
import { Rich } from './common';
import { stepTitle, type PlayerOutcome } from './Player';

export function ScoreRing({ score, size = 148 }: { score: number; size?: number }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.round(score * 100);
  return (
    <div className="lx-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="lx-ring-track" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} className="lx-ring-fill" strokeDasharray={c}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score) }} transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1], delay: 0.2 }} />
      </svg>
      <motion.strong initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>{pct}<small>%</small></motion.strong>
    </div>
  );
}

export async function celebrate() {
  try {
    const confetti = (await import('canvas-confetti')).default;
    const colors = ['#183961', '#ffffff', '#a83342', '#e3a417'];
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.35 }, colors, disableForReducedMotion: true });
    window.setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, colors, disableForReducedMotion: true }), 250);
    window.setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, colors, disableForReducedMotion: true }), 400);
  } catch { /* decoration only */ }
}

interface Props {
  lang: Lang;
  outcome: PlayerOutcome;
  badges: BadgeId[];
  nextHref?: string;
  nextLabel?: string;
  courseHref: string;
  onRetry: () => void;
  offer?: string;
  ctaVariant?: 'general' | 'writing' | 'speaking';
  /** Levelled course: what this score means for the learner's level. */
  verdict?: { tone: 'up' | 'almost' | 'review'; text: string };
}

export default function EndScreen({ lang, outcome, badges, nextHref, nextLabel, courseHref, onRetry, offer, ctaVariant = 'general', verdict }: Props) {
  const ui = UI[lang];
  const e = ui.end;
  const perfect = outcome.score >= 0.999;
  useEffect(() => { if (outcome.score >= 0.8) celebrate(); }, [outcome.score]);
  const mm = Math.floor(outcome.seconds / 60);
  const ss = String(outcome.seconds % 60).padStart(2, '0');

  return (
    <div className="lx-end">
      <motion.div className="lx-end-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <TrophyFilled className="lx-end-trophy" />
        <h2>{perfect ? e.titlePerfect : e.title}</h2>
        <ScoreRing score={outcome.score} />
        {verdict && <motion.p className={`lx-verdict is-${verdict.tone}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>{verdict.text}</motion.p>}
        <dl className="lx-end-stats">
          <div><dt>{e.xp}</dt><dd><StarFilled /> +{outcome.xp}</dd></div>
          <div><dt>{e.time}</dt><dd><ClockCircleOutlined /> {mm}:{ss}</dd></div>
        </dl>
        {badges.length > 0 && (
          <div className="lx-end-badges">
            {badges.map((b, i) => (
              <motion.div key={b} className="lx-badge is-new" initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.8 + i * 0.15, type: 'spring', stiffness: 300, damping: 18 }}>
                <span className="lx-badge-medal" aria-hidden>★</span>
                <div><small>{e.badge}</small><strong>{ui.badges[b]?.[0]}</strong></div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="lx-end-actions">
          {verdict?.tone === 'almost' && <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={onRetry}><RedoOutlined />{e.retry}</button>}
          {nextHref ? <Link to={nextHref} state={AUTOSTART} className={`lp-btn lp-btn-lg ${verdict?.tone === 'almost' ? 'lp-btn-ghost' : 'lp-btn-primary'}`}>{nextLabel ?? e.next}<ArrowRightOutlined /></Link> : null}
          {verdict?.tone !== 'almost' && <button type="button" className="lp-btn lp-btn-ghost" onClick={onRetry}><RedoOutlined />{e.retry}</button>}
          <Link to={courseHref} className="lx-link">{e.toCourse}</Link>
        </div>
      </motion.div>

      <div className="lx-end-side">
        <section className="lx-end-mistakes" aria-label={e.mistakes}>
          <h3>{e.mistakes}</h3>
          {outcome.mistakes.length === 0 ? <p className="lx-note">{e.noMistakes}</p> : (
            <ul>
              {outcome.mistakes.map((m, i) => (
                <li key={i}>
                  <CloseCircleFilled aria-hidden />
                  <div>
                    <p><Rich text={stepTitle(m.step, lang)} /></p>
                    {m.answer && <p className="lx-end-answer"><span>{ui.player.answerWas}</span> <Rich text={m.answer} /></p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <TeacherCta lang={lang} offer={offer} variant={ctaVariant} />
      </div>
    </div>
  );
}
