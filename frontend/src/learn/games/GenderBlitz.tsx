// « Le ou la ? »: sixty seconds to sort as many nouns as possible. Each right
// answer is heard with its article; answers in a row build a combo.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ClockCircleOutlined, FireFilled, RedoOutlined, TrophyFilled } from '@ant-design/icons';
import { chime, speak } from '../audio';
import { AudioButton, seededShuffle } from '../player/common';
import { celebrate } from '../player/EndScreen';
import { recordGame, useProgress } from '../progress';
import type { Lang } from '../types';
import { G } from './copy';
import { GameFrame } from './frame';
import { GENDER_NOUNS, GENDER_TIPS, withArticle } from './words';

const SECONDS = 60;

export default function GenderBlitz({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const g = G[lang];
  const p = useProgress();
  const [run, setRun] = useState(0);
  const deck = useMemo(() => seededShuffle(GENDER_NOUNS, `gender-${Date.now()}-${run}`), [run]);
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready');
  const [n, setN] = useState(0);
  const [left, setLeft] = useState(SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [right, setRight] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [newBest, setNewBest] = useState(false);
  const mistakes = useRef<[string, 'm' | 'f', string][]>([]);
  const answered = useRef(0);
  const lock = useRef(false);
  const best = p.games?.gender?.best ?? 0;

  const item = deck[n % deck.length];

  const start = () => {
    mistakes.current = [];
    answered.current = 0;
    lock.current = false;
    setRun(r => r + 1);
    setN(0); setScore(0); setCombo(0); setRight(0); setLeft(SECONDS); setFlash(null); setNewBest(false);
    setPhase('play');
  };

  // The clock.
  useEffect(() => {
    if (phase !== 'play') return;
    const t = window.setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'play' && left === 0) {
      chime('done');
      setPhase('over');
      const isBest = recordGame('gender', score, Math.min(30, Math.round(score / 4)));
      setNewBest(isBest && score > 0);
      if (isBest && score > 0) celebrate();
    }
  }, [left, phase, score]);

  const answer = useCallback((choice: 'm' | 'f') => {
    if (phase !== 'play' || lock.current) return;
    const [noun, gender] = item;
    const ok = choice === gender;
    answered.current++;
    lock.current = true;
    if (ok) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setRight(r => r + 1);
      setScore(s => s + 10 + Math.min(10, (nextCombo - 1) * 2));
      speak(withArticle(noun, gender));
    } else {
      chime('wrong');
      setCombo(0);
      if (!mistakes.current.some(m => m[0] === noun)) mistakes.current.push(item);
    }
    setFlash({ ok, text: withArticle(noun, gender) });
    window.setTimeout(() => { setFlash(null); setN(x => x + 1); lock.current = false; }, ok ? 380 : 900);
  }, [phase, item, combo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') answer('m');
      else if (e.key === 'ArrowRight') answer('f');
      else if ((e.key === 'Enter' || e.key === ' ') && phase !== 'play' && !(e.target instanceof HTMLButtonElement)) start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (phase === 'over') {
    const total = answered.current;
    const acc = total ? Math.round((right / total) * 100) : 0;
    return (
      <GameFrame lang={lang} title="Le ou la ?" onClose={onClose}>
        <motion.div className="gx-end" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TrophyFilled className="gx-end-trophy" />
          <h2>{g.genderOver}</h2>
          <p className="gx-bigscore">{score}<small>{g.points}</small></p>
          {newBest && <p className="gx-newbest">{g.newBest}</p>}
          <dl className="gx-stats">
            <div><dt>{right}</dt><dd>{g.genderRight}</dd></div>
            <div><dt>{acc} %</dt><dd>{g.genderAccuracy}</dd></div>
            <div><dt>{Math.max(best, score)}</dt><dd>{g.best}</dd></div>
          </dl>
          <div className="gx-end-actions">
            <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={start}><RedoOutlined />{g.playAgain}</button>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={onClose}>{g.back}</button>
          </div>
          <section className="gx-review">
            <h3>{g.genderMistakes}</h3>
            {mistakes.current.length === 0 ? <p className="lx-note">{g.genderNoMistakes}</p> : (
              <ul className="is-grid">
                {mistakes.current.map(([noun, gender, en]) => (
                  <li key={noun}><AudioButton text={withArticle(noun, gender)} lang={lang} size="sm" /><span lang="fr"><b className={gender === 'm' ? 'gx-m' : 'gx-f'}>{gender === 'm' ? 'le' : 'la'}</b> {noun}</span>{lang === 'en' && <em>{en}</em>}</li>
                ))}
              </ul>
            )}
            <h3>{g.genderTips}</h3>
            <ul className="gx-tips">
              {GENDER_TIPS.map(t => <li key={t.ending}><b className={t.g === 'm' ? 'gx-m' : 'gx-f'}>{t.ending}</b><span>{t.g === 'm' ? g.genderMasc : g.genderFem}</span><em lang="fr">{t.ex}</em></li>)}
            </ul>
          </section>
        </motion.div>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      lang={lang}
      title="Le ou la ?"
      onClose={onClose}
      guard={phase === 'play' && n > 0}
      right={phase === 'play' ? <span className="gx-score">{score}</span> : undefined}
    >
      <div className="gx-blitz">
        {phase === 'ready' ? (
          <div className="gx-ready">
            <h2>Le ou la ?</h2>
            <p>{g.genderReady}</p>
            <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={start}>{g.play}</button>
            <p className="gx-hint">{g.genderKeys}</p>
            {best > 0 && <p className="gx-hint">{g.best} : <b>{best}</b></p>}
          </div>
        ) : (
          <>
            <div className="gx-blitz-bar">
              <span className={`gx-clock${left <= 10 ? ' is-low' : ''}`}><ClockCircleOutlined /> {left}</span>
              <div className="gx-timebar"><i style={{ transform: `scaleX(${left / SECONDS})` }} /></div>
              <span className={`gx-combo${combo >= 3 ? ' is-on' : ''}`}><FireFilled /> {combo}</span>
            </div>
            <div className={`gx-blitz-card${flash ? (flash.ok ? ' is-ok' : ' is-no') : ''}`}>
              <motion.p key={flash ? `f${n}` : n} lang="fr" className="gx-blitz-word" initial={{ opacity: 0, y: flash ? 0 : 14, scale: flash ? 1.04 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.16 }}>
                {flash ? flash.text : item[0]}
              </motion.p>
              {lang === 'en' && <p className="gx-blitz-tr">{item[2]}</p>}
            </div>
            <div className="gx-blitz-btns">
              <button type="button" className="gx-le" onClick={() => answer('m')}><b>LE</b><small>←</small></button>
              <button type="button" className="gx-la" onClick={() => answer('f')}><b>LA</b><small>→</small></button>
            </div>
          </>
        )}
      </div>
    </GameFrame>
  );
}
