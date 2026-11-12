// « Le mot du jour »: six tries to find a five-letter French word. One word a
// day (the same for everyone), a streak, and a practice mode with other words.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CopyOutlined, EnterOutlined, FireFilled, RedoOutlined, RollbackOutlined } from '@ant-design/icons';
import { chime } from '../audio';
import { AudioButton } from '../player/common';
import { celebrate } from '../player/EndScreen';
import { saveDaily, useProgress } from '../progress';
import type { Lang } from '../types';
import { G } from './copy';
import { GameFrame } from './frame';
import { gamePath, gameById } from './meta';
import { DAILY_WORDS, dailyKey, dayNumber, dayStamp, stripAccents, wordOfDay, type DailyWord as Word } from './words';

type Mark = 'ok' | 'mid' | 'no';
const ROWS = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];
const TRIES = 6;

/** Colours of a guess: letters in the right place first, then the misplaced ones. */
export function markGuess(guess: string, target: string): Mark[] {
  const out: Mark[] = Array(5).fill('no');
  const rest: string[] = [];
  for (let i = 0; i < 5; i++) { if (guess[i] === target[i]) out[i] = 'ok'; else rest.push(target[i]); }
  for (let i = 0; i < 5; i++) {
    if (out[i] === 'ok') continue;
    const at = rest.indexOf(guess[i]);
    if (at >= 0) { out[i] = 'mid'; rest.splice(at, 1); }
  }
  return out;
}

const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayStamp(d); };

/** A practice word: any word but today’s (and the one just played). */
const practiceWord = (not?: string): Word => {
  const others = DAILY_WORDS.filter(w => dailyKey(w) !== dailyKey(wordOfDay()) && dailyKey(w) !== not);
  return others[Math.floor(Math.random() * others.length)];
};

export default function DailyWord({ lang, onClose, startInPractice = false }: { lang: Lang; onClose: () => void; startInPractice?: boolean }) {
  const g = G[lang];
  const p = useProgress();
  const today = dayStamp();
  const [practice, setPractice] = useState<Word | null>(() => (startInPractice ? practiceWord() : null));
  const word = practice ?? wordOfDay();
  const target = dailyKey(word);
  const [guesses, setGuesses] = useState<string[]>(() => (!startInPractice && p.daily?.day === today ? p.daily.guesses : []));
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [copied, setCopied] = useState(false);

  const won = guesses.includes(target);
  const over = won || guesses.length >= TRIES;
  const marks = useMemo(() => guesses.map(gs => markGuess(gs, target)), [guesses, target]);
  const keys = useMemo(() => {
    const m: Record<string, Mark> = {};
    guesses.forEach((gs, r) => gs.split('').forEach((l, i) => {
      const s = marks[r][i];
      if (m[l] === 'ok' || (m[l] === 'mid' && s === 'no')) return;
      m[l] = s;
    }));
    return m;
  }, [guesses, marks]);

  const submit = useCallback(() => {
    if (over) return;
    if (input.length < 5) { setShake(true); window.setTimeout(() => setShake(false), 450); return; }
    const all = [...guesses, input];
    const isWin = input === target;
    const done = isWin || all.length >= TRIES;
    setGuesses(all);
    setInput('');
    if (isWin) { chime('done'); window.setTimeout(celebrate, 500); } else chime(done ? 'wrong' : 'right');
    if (!practice) {
      const prev = p.daily;
      const base = { day: today, guesses: all, won: isWin, streak: prev?.streak ?? 0, lastWin: prev?.lastWin, wins: prev?.wins ?? 0 };
      if (isWin) saveDaily({ ...base, streak: prev?.lastWin === yesterday() ? (prev?.streak ?? 0) + 1 : 1, lastWin: today, wins: base.wins + 1 }, 20);
      else saveDaily(done ? { ...base, streak: 0 } : base);
    }
  }, [over, input, guesses, target, practice, p.daily, today]);

  const type = useCallback((l: string) => { if (!over) setInput(s => (s.length < 5 ? s + l : s)); }, [over]);
  const erase = useCallback(() => setInput(s => s.slice(0, -1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') { if (!(e.target instanceof HTMLButtonElement)) { e.preventDefault(); submit(); } } else if (e.key === 'Backspace') erase();
      else if (e.key.length === 1) { const l = stripAccents(e.key); if (/^[A-Z]$/.test(l)) type(l); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submit, erase, type]);

  const startPractice = () => {
    setPractice(practiceWord(target));
    setGuesses([]); setInput('');
  };
  const backToDaily = () => { setPractice(null); setGuesses(p.daily?.day === today ? p.daily.guesses : []); setInput(''); };

  const share = async () => {
    const squares = { ok: '🟦', mid: '🟨', no: '⬜' };
    const text = `${g.dailyTitle} #${dayNumber()} ${won ? guesses.length : 'X'}/6\n${marks.map(r => r.map(s => squares[s]).join('')).join('\n')}\nhttps://www.learnfrenchwithnatives.com${gamePath(gameById('daily'), lang)}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { /* clipboard unavailable */ }
  };

  const streak = p.daily?.lastWin === today || p.daily?.lastWin === yesterday() ? p.daily?.streak ?? 0 : 0;
  const rows = Array.from({ length: TRIES }, (_, r) => guesses[r] ?? (r === guesses.length && !over ? input.padEnd(5) : '     '));

  return (
    <GameFrame
      lang={lang}
      title={practice ? `${g.dailyTitle} · ${g.dailyPractice}` : g.dailyTitle}
      onClose={onClose}
      right={streak > 0 ? <span className="gx-streak"><FireFilled /> {streak}</span> : undefined}
    >
      <div className="gx-daily">
        <div className={`gx-grid${shake ? ' is-shake' : ''}`} role="grid" aria-label={g.dailyTitle}>
          {rows.map((row, r) => (
            <div key={r} role="row">
              {row.split('').map((l, i) => {
                const mark = r < guesses.length ? marks[r][i] : undefined;
                return (
                  <motion.span
                    key={`${r}-${i}-${mark ?? 'x'}`}
                    role="gridcell"
                    className={`gx-tile${mark ? ` is-${mark}` : l.trim() ? ' is-typed' : ''}`}
                    initial={mark ? { rotateX: 90 } : false}
                    animate={{ rotateX: 0 }}
                    transition={{ duration: 0.3, delay: mark ? i * 0.12 : 0 }}
                  >
                    {l.trim()}
                  </motion.span>
                );
              })}
            </div>
          ))}
        </div>

        {over ? (
          <motion.section className="gx-reveal" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
            <p className="gx-reveal-k">{won ? g.dailyWon[Math.min(guesses.length, 6) - 1] : g.dailyLost}</p>
            <h2 lang="fr">{word.w}</h2>
            {lang === 'en' && <p className="gx-reveal-tr">{word.tr}</p>}
            <dl>
              <div><dt>{g.dailyMeaning}</dt><dd lang="fr">{word.def}</dd></div>
              <div><dt>{g.dailyExample}</dt><dd lang="fr" className="gx-reveal-ex"><AudioButton text={word.ex} lang={lang} size="sm" /><span>{word.ex}</span></dd></div>
            </dl>
            {!practice && (
              <dl className="gx-stats is-small">
                <div><dt>{g.dailyDays(streak)}</dt><dd>{g.dailyStreak}</dd></div>
                <div><dt>{p.daily?.wins ?? 0}</dt><dd>{g.dailyWins}</dd></div>
              </dl>
            )}
            <div className="gx-end-actions">
              {!practice && <button type="button" className="lp-btn lp-btn-primary" onClick={share}><CopyOutlined />{copied ? g.dailyCopied : g.dailyShare}</button>}
              <button type="button" className={`lp-btn ${practice ? 'lp-btn-primary' : 'lp-btn-ghost'}`} onClick={startPractice}><RedoOutlined />{g.dailyPracticeCta}</button>
              {practice && <button type="button" className="lp-btn lp-btn-ghost" onClick={backToDaily}><RollbackOutlined />{g.dailyTitle}</button>}
            </div>
            {!practice && <p className="gx-hint">{g.dailyNext}</p>}
          </motion.section>
        ) : (
          <>
            <ul className="gx-legend" aria-hidden>
              <li><i className="is-ok" />{g.dailyLegend[0]}</li>
              <li><i className="is-mid" />{g.dailyLegend[1]}</li>
              <li><i className="is-no" />{g.dailyLegend[2]}</li>
            </ul>
            <div className="gx-keys">
              {ROWS.map((row, r) => (
                <div key={row}>
                  {r === 2 && <button type="button" className="gx-key is-wide" onClick={submit} aria-label={g.dailyEnter}><EnterOutlined /></button>}
                  {row.split('').map(l => <button key={l} type="button" className={`gx-key${keys[l] ? ` is-${keys[l]}` : ''}`} onClick={() => type(l)}>{l}</button>)}
                  {r === 2 && <button type="button" className="gx-key is-wide" onClick={erase} aria-label={g.dailyDelete}>⌫</button>}
                </div>
              ))}
            </div>
            {shake && <p className="gx-hint" role="status">{g.dailyShort}</p>}
          </>
        )}
      </div>
    </GameFrame>
  );
}
