// « Les paires sonores »: a memory game. Half of the cards speak, the other
// half show a written word: find the eight pairs of a theme.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RedoOutlined, SoundOutlined, TrophyFilled } from '@ant-design/icons';
import { chime, speak, stop as stopAudio } from '../audio';
import { AudioButton, seededShuffle } from '../player/common';
import { celebrate } from '../player/EndScreen';
import { recordGame, useProgress } from '../progress';
import type { Lang } from '../types';
import { G } from './copy';
import { GameFrame } from './frame';
import { PAIR_DECKS } from './words';

interface Card { id: string; word: number; kind: 's' | 'w' }

export default function PairsGame({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const g = G[lang];
  const p = useProgress();
  const title = lang === 'fr' ? 'Les paires sonores' : 'Sound Pairs';
  const [deckId, setDeckId] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<'theme' | 'play' | 'over'>('theme');
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const busy = useRef(false);
  const best = p.games?.pairs?.best ?? 0;

  const deck = PAIR_DECKS.find(d => d.id === deckId) ?? PAIR_DECKS[0];
  const cards = useMemo<Card[]>(() => seededShuffle(
    deck.words.flatMap((_, word) => [{ id: `s${word}`, word, kind: 's' as const }, { id: `w${word}`, word, kind: 'w' as const }]),
    `pairs-${deck.id}-${run}-${Date.now()}`,
  ), [deck.id, run]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopAudio(), []);

  const start = (id: string) => {
    busy.current = false;
    setDeckId(id);
    setRun(r => r + 1);
    setOpen([]); setFound([]); setMoves(0); setScore(0); setNewBest(false);
    setPhase('play');
  };

  const flip = (card: Card) => {
    if (found.includes(card.word)) { if (card.kind === 's') speak(deck.words[card.word][0]); return; }
    if (busy.current || open.includes(card.id)) return;
    if (card.kind === 's') speak(deck.words[card.word][0]);
    const now = [...open, card.id];
    setOpen(now);
    if (now.length < 2) return;
    busy.current = true;
    const [a, b2] = now.map(id => cards.find(c => c.id === id)!);
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    if (a.word === b2.word && a.kind !== b2.kind) {
      const nowFound = [...found, a.word];
      window.setTimeout(() => {
        chime('right');
        setFound(nowFound);
        setOpen([]);
        busy.current = false;
        if (nowFound.length === deck.words.length) {
          const total = Math.max(20, 200 - (nextMoves - deck.words.length) * 10);
          setScore(total);
          const isBest = recordGame('pairs', total, 20);
          setNewBest(isBest);
          window.setTimeout(() => { chime('done'); celebrate(); setPhase('over'); }, 600);
        }
      }, 450);
    } else {
      window.setTimeout(() => { setOpen([]); busy.current = false; }, 1100);
    }
  };

  if (phase === 'theme') {
    return (
      <GameFrame lang={lang} title={title} onClose={onClose}>
        <div className="gx-ready">
          <h2>{g.pairsChoose}</h2>
          <div className="gx-themes">
            {PAIR_DECKS.map(d => (
              <button key={d.id} type="button" onClick={() => start(d.id)}>
                <strong>{d.name[lang]}</strong>
                <span lang="fr">{d.words.slice(0, 3).map(w => w[0]).join(', ')}…</span>
              </button>
            ))}
          </div>
          {best > 0 && <p className="gx-hint">{g.best} : <b>{best}</b></p>}
        </div>
      </GameFrame>
    );
  }

  if (phase === 'over') {
    return (
      <GameFrame lang={lang} title={title} onClose={onClose}>
        <motion.div className="gx-end" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <TrophyFilled className="gx-end-trophy" />
          <h2>{g.pairsWon}</h2>
          <p className="gx-bigscore">{score}<small>{g.points}</small></p>
          {newBest && <p className="gx-newbest">{g.newBest}</p>}
          <dl className="gx-stats">
            <div><dt>{moves}</dt><dd>{g.pairsMoves}</dd></div>
            <div><dt>{Math.max(best, score)}</dt><dd>{g.best}</dd></div>
          </dl>
          <div className="gx-end-actions">
            <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => setPhase('theme')}>{g.pairsOther}</button>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={() => start(deck.id)}><RedoOutlined />{g.playAgain}</button>
          </div>
          <section className="gx-review">
            <h3>{g.pairsWords}</h3>
            <ul className="is-grid">
              {deck.words.map(([fr, en]) => <li key={fr}><AudioButton text={fr} lang={lang} size="sm" /><span lang="fr">{fr}</span>{lang === 'en' && <em>{en}</em>}</li>)}
            </ul>
          </section>
        </motion.div>
      </GameFrame>
    );
  }

  return (
    <GameFrame
      lang={lang}
      title={`${title} · ${deck.name[lang]}`}
      onClose={onClose}
      guard={moves > 0}
      progress={found.length / deck.words.length}
      right={<span className="gx-score">{moves} <small>{g.pairsMoves}</small></span>}
    >
      <div className="gx-pairs">
        <p className="gx-pairs-count">{g.pairsFound(found.length, deck.words.length)}</p>
        <div className="gx-pairs-grid">
          {cards.map(card => {
            const isFound = found.includes(card.word);
            const up = isFound || open.includes(card.id);
            return (
              <button key={card.id} type="button" className={`gx-pcard${up ? ' is-up' : ''}${isFound ? ' is-found' : ''} is-${card.kind}`} onClick={() => flip(card)} aria-label={up ? (card.kind === 'w' ? deck.words[card.word][0] : g.pairsSound) : '?'}>
                <span className="gx-pcard-in">
                  <span className="gx-pcard-back" aria-hidden />
                  <span className="gx-pcard-face" aria-hidden={!up}>
                    {card.kind === 's'
                      ? <><SoundOutlined /><small>{g.pairsSound}</small></>
                      : <b lang="fr">{deck.words[card.word][0]}</b>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </GameFrame>
  );
}
