// « Le loto des nombres »: a voice calls the numbers of your card, in French;
// tap each one. Completed lines give bonus points; three mistakes end the game.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckOutlined, PlayCircleFilled, RedoOutlined, TrophyFilled } from '@ant-design/icons';
import { chime, hasRecording, speak, stop as stopAudio } from '../audio';
import { AudioButton, seededShuffle } from '../player/common';
import { celebrate } from '../player/EndScreen';
import { recordGame, useProgress } from '../progress';
import type { Lang } from '../types';
import { G } from './copy';
import { GameFrame, Hearts } from './frame';
import { BINGO_LEVELS, frNumber, numberCall } from './words';

const SIZE = 4;
const LINES: number[][] = [
  ...Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => r * SIZE + c)),
  ...Array.from({ length: SIZE }, (_, c) => Array.from({ length: SIZE }, (_, r) => r * SIZE + c)),
  Array.from({ length: SIZE }, (_, k) => k * SIZE + k),
  Array.from({ length: SIZE }, (_, k) => k * SIZE + (SIZE - 1 - k)),
];
const MULTIPLIER: Record<string, number> = { '0-20': 1, '0-69': 1.5, '0-100': 2 };

export default function NumberBingo({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const g = G[lang];
  const p = useProgress();
  const [level, setLevel] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<'level' | 'play' | 'over'>('level');
  const [call, setCall] = useState(0);
  const [marked, setMarked] = useState<number[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [bad, setBad] = useState<number | null>(null);
  const [toast, setToast] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const missed = useRef<number[]>([]);
  const firstTry = useRef(true);
  const busy = useRef(false);
  const best = p.games?.numbers?.best ?? 0;

  // The card, then the order in which its numbers are called.
  const { card, calls } = useMemo(() => {
    const lv = BINGO_LEVELS.find(l => l.id === level) ?? BINGO_LEVELS[0];
    const pool = Array.from({ length: lv.max - lv.min + 1 }, (_, k) => lv.min + k).filter(n => hasRecording(numberCall(n)));
    const seed = `bingo-${level}-${run}-${Date.now()}`;
    const c = seededShuffle(pool, seed).slice(0, SIZE * SIZE);
    return { card: c, calls: seededShuffle(c, `${seed}-calls`) };
  }, [level, run]);

  const current = calls[call];
  const say = (rate = 1) => { if (current !== undefined) speak(numberCall(current), { rate }); };

  useEffect(() => {
    if (phase !== 'play') return;
    firstTry.current = true;
    const t = window.setTimeout(() => say(), 500);
    return () => window.clearTimeout(t);
  }, [call, phase, run]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopAudio(), []);

  const start = (id: string) => {
    missed.current = [];
    busy.current = false;
    setLevel(id);
    setRun(r => r + 1);
    setCall(0); setMarked([]); setLives(3); setScore(0); setLines(0); setBad(null); setNewBest(false);
    setPhase('play');
  };

  const finish = (finalScore: number, won: boolean) => {
    const total = Math.round(finalScore * (MULTIPLIER[level ?? '0-20'] ?? 1));
    setScore(total);
    setPhase('over');
    const isBest = recordGame('numbers', total, won ? 25 : 8);
    setNewBest(isBest && total > 0);
    chime('done');
    if (won) celebrate();
  };

  const tap = (cell: number) => {
    if (phase !== 'play' || busy.current || marked.includes(cell)) return;
    if (card[cell] !== current) {
      chime('wrong');
      firstTry.current = false;
      setBad(cell);
      window.setTimeout(() => setBad(null), 500);
      if (!missed.current.includes(current)) missed.current.push(current);
      const left = lives - 1;
      setLives(left);
      if (left <= 0) { busy.current = true; window.setTimeout(() => finish(score, false), 700); } else window.setTimeout(() => say(0.8), 550);
      return;
    }
    busy.current = true;
    chime('right');
    const nowMarked = [...marked, cell];
    const done = LINES.filter(l => l.every(c => nowMarked.includes(c))).length;
    const gained = 10 + (firstTry.current ? 5 : 0) + (done - lines) * 30;
    if (done > lines) { setToast(true); window.setTimeout(() => setToast(false), 1300); }
    setMarked(nowMarked);
    setLines(done);
    setScore(s => s + gained);
    window.setTimeout(() => {
      busy.current = false;
      if (nowMarked.length >= card.length) finish(score + gained + lives * 10, true);
      else setCall(c => c + 1);
    }, 750);
  };

  if (phase === 'level') {
    return (
      <GameFrame lang={lang} title={lang === 'fr' ? 'Le loto des nombres' : 'Number Bingo'} onClose={onClose}>
        <div className="gx-ready">
          <h2>{g.bingoChoose}</h2>
          <div className="gx-levels">
            {BINGO_LEVELS.map(l => (
              <button key={l.id} type="button" onClick={() => start(l.id)}>
                <b>{l.id.replace('-', ' – ')}</b>
                <strong>{g.bingoLevels[l.id][0]}</strong>
                <span>{g.bingoLevels[l.id][1]}</span>
              </button>
            ))}
          </div>
          {best > 0 && <p className="gx-hint">{g.best} : <b>{best}</b></p>}
        </div>
      </GameFrame>
    );
  }

  if (phase === 'over') {
    const won = marked.length >= card.length;
    return (
      <GameFrame lang={lang} title={lang === 'fr' ? 'Le loto des nombres' : 'Number Bingo'} onClose={onClose}>
        <motion.div className="gx-end" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TrophyFilled className="gx-end-trophy" />
          <h2>{won ? g.bingoWon : g.bingoLost}</h2>
          {!won && <p className="gx-end-sub">{g.bingoLostText}</p>}
          <p className="gx-bigscore">{score}<small>{g.points}</small></p>
          {newBest && <p className="gx-newbest">{g.newBest}</p>}
          <dl className="gx-stats">
            <div><dt>{marked.length}/{card.length}</dt><dd>{lang === 'fr' ? 'nombres trouvés' : 'numbers found'}</dd></div>
            <div><dt>{lines}</dt><dd>{g.bingoLines(lines).replace(/^\d+ /, '')}</dd></div>
            <div><dt>{Math.max(best, score)}</dt><dd>{g.best}</dd></div>
          </dl>
          <div className="gx-end-actions">
            <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => start(level!)}><RedoOutlined />{g.playAgain}</button>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={() => setPhase('level')}>{g.bingoChoose}</button>
          </div>
          {missed.current.length > 0 && (
            <section className="gx-review">
              <h3>{g.bingoMissed}</h3>
              <ul className="is-grid">
                {missed.current.map(n => <li key={n}><AudioButton text={numberCall(n)} lang={lang} size="sm" /><span><b>{n}</b></span><em lang="fr">{frNumber(n)}</em></li>)}
              </ul>
            </section>
          )}
        </motion.div>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      lang={lang}
      title={lang === 'fr' ? 'Le loto des nombres' : 'Number Bingo'}
      onClose={onClose}
      guard={marked.length > 0}
      progress={marked.length / card.length}
      right={<><span className="gx-score">{score}</span><Hearts n={lives} label={g.bingoLives} /></>}
    >
      <div className="gx-bingo">
        <div className="gx-caller">
          <button type="button" className="gx-caller-play" onClick={() => say()} aria-label={g.listenAgain}><PlayCircleFilled /></button>
          <div>
            <p>{g.bingoCall(call + 1, calls.length)}</p>
            <div className="gx-caller-btns">
              <button type="button" onClick={() => say()}>{g.listenAgain}</button>
              <button type="button" onClick={() => say(0.72)}>{g.bingoSlow}</button>
            </div>
          </div>
          {toast && <motion.span className="gx-toast" initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}>{g.bingoLine}</motion.span>}
        </div>
        <div className="gx-card" role="grid" aria-label="Bingo">
          {card.map((num, cell) => {
            const on = marked.includes(cell);
            return (
              <motion.button
                key={cell}
                type="button"
                className={`gx-cell${on ? ' is-on' : ''}${bad === cell ? ' is-bad' : ''}`}
                onClick={() => tap(cell)}
                disabled={on}
                animate={bad === cell ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                whileTap={{ scale: 0.94 }}
              >
                {num}
                {on && <motion.i initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}><CheckOutlined /></motion.i>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
