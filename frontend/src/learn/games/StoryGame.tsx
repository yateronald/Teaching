// One episode of the interactive story: the scenes and lines appear one after
// the other, like a conversation; the learner answers by choosing, listening or
// building a sentence. Three hearts; the hearts left at the end are the stars.
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRightOutlined, BulbOutlined, CheckCircleFilled, CustomerServiceOutlined, EnvironmentOutlined, RedoOutlined } from '@ant-design/icons';
import { chime, speak, stop as stopAudio } from '../audio';
import { imageUrl } from '../categories';
import { AudioButton, Rich, seededShuffle } from '../player/common';
import { celebrate } from '../player/EndScreen';
import { recordEpisode } from '../progress';
import { gloss, tx, type Lang, type Voice } from '../types';
import { G } from './copy';
import { GameFrame, Hearts, Stars } from './frame';
import { CAST, playerLines, type Beat, type Episode } from './story';

interface Props {
  lang: Lang;
  episode: Episode;
  /** Voice of the learner's character. */
  voice: 'f' | 'm';
  hasNext: boolean;
  onClose: () => void;
  onNext: () => void;
}

const interactive = (bt: Beat) => bt.k === 'choice' || bt.k === 'listen' || bt.k === 'build';

function Bubble({ who, voice, text, lang, tr, mine = false, hidden = false }: { who: string; voice: Voice; text: string; lang: Lang; tr?: string; mine?: boolean; hidden?: boolean }) {
  const g = G[lang];
  const [open, setOpen] = useState(false);
  return (
    <motion.div className={`gx-bubble${mine ? ' is-mine' : ''}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <p className="gx-bubble-who">{who}</p>
      <div className="gx-bubble-body">
        <AudioButton text={text} voice={voice} lang={lang} size="sm" />
        {hidden
          ? <span className="gx-bubble-hidden"><CustomerServiceOutlined /> {g.storyHidden}<i /><i /><i /><i /><i /></span>
          : <span lang="fr">{text}</span>}
      </div>
      {!hidden && tr && (open
        ? <p className="gx-bubble-tr">{tr}</p>
        : <button type="button" className="gx-bubble-trbtn" onClick={() => setOpen(true)}>{g.storyTapTr}</button>)}
    </motion.div>
  );
}

export default function StoryGame({ lang, episode, voice, hasNext, onClose, onNext }: Props) {
  const g = G[lang];
  const beats = episode.beats;
  const [i, setI] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [phase, setPhase] = useState<'play' | 'done' | 'lost'>('play');
  const endRef = useRef<HTMLDivElement | null>(null);
  const mainBtn = useRef<HTMLButtonElement | null>(null);

  const beat = beats[i];
  const needsAnswer = interactive(beat) && !solved;

  // Options and words, shuffled once per beat (the right option is first in the data).
  const order = useMemo(() => seededShuffle([0, 1, 2], `${episode.id}-${i}`), [episode.id, i]);
  const tokens = useMemo(() => (beat.k === 'build'
    ? seededShuffle([...beat.words, ...(beat.extra ?? [])].map((w, n) => ({ n, w })), `${episode.id}-b${i}`)
    : []), [beat, episode.id, i]);

  // A new line: say it.
  useEffect(() => {
    if (phase !== 'play') return;
    if (beat.k === 'say' || beat.k === 'listen') {
      const t = window.setTimeout(() => speak(beat.fr, { voice: CAST[beat.who].voice }), 350);
      return () => window.clearTimeout(t);
    }
  }, [i, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [i, solved, wrong.length, feedback, phase]);
  useEffect(() => () => stopAudio(), []);

  const lose = (text: string) => {
    chime('wrong');
    setFeedback({ ok: false, text });
    setHearts(h => {
      const left = h - 1;
      if (left <= 0) window.setTimeout(() => setPhase('lost'), 900);
      return left;
    });
  };
  const win = (line?: string) => {
    chime('right');
    setSolved(true);
    setFeedback({ ok: true, text: g.storyRight[i % g.storyRight.length] });
    if (line) window.setTimeout(() => speak(line, { voice }), 250);
    window.setTimeout(() => mainBtn.current?.focus(), 60);
  };

  const pick = (opt: number) => {
    if (!needsAnswer || wrong.includes(opt) || hearts <= 0) return;
    if (beat.k === 'choice') {
      if (opt === 0) win(beat.options[0]);
      else { setWrong(w => [...w, opt]); lose(tx(beat.why[opt - 1], lang)); }
    } else if (beat.k === 'listen') {
      if (opt === 0) win();
      else { setWrong(w => [...w, opt]); lose(g.storyWrong); speak(beat.fr, { voice: CAST[beat.who].voice }); }
    }
  };

  const checkBuild = () => {
    if (beat.k !== 'build') return;
    const given = built.map(n => tokens.find(t => t.n === n)!.w).join(' ');
    if (given === beat.words.join(' ')) win(beat.words.join(' '));
    else lose(g.storyWrong);
  };

  const next = () => {
    stopAudio();
    setFeedback(null);
    setSolved(false);
    setWrong([]);
    setBuilt([]);
    if (i + 1 >= beats.length) {
      const stars = Math.max(1, hearts);
      recordEpisode(episode.id, stars, 15 + stars * 5);
      chime('done');
      setPhase('done');
      if (stars >= 2) celebrate();
    } else setI(n => n + 1);
  };

  // Enter: continue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || phase !== 'play') return;
      if (e.target instanceof HTMLButtonElement && e.target !== mainBtn.current) return;
      e.preventDefault();
      if (beat.k === 'build' && !solved) { if (built.length) checkBuild(); } else if (!needsAnswer) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const you = g.storyYou;
  const trOf = (t?: string | { en: string; fr: string }) => gloss(t, lang) || undefined;

  /** A beat already played, in its final form. */
  const past = (bt: Beat, n: number) => {
    switch (bt.k) {
      case 'scene':
        return (
          <motion.section key={n} className="gx-scene" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <img src={imageUrl(bt.image, 1200)} alt="" width="1200" height="675" />
            <div className="gx-scene-body">
              <p className="gx-scene-place"><EnvironmentOutlined /> {tx(bt.place, lang)}</p>
              <p>{tx(bt.text, lang)}</p>
            </div>
          </motion.section>
        );
      case 'say': return <Bubble key={n} who={CAST[bt.who].name} voice={CAST[bt.who].voice} text={bt.fr} lang={lang} tr={trOf(bt.tr)} />;
      case 'listen': return <Bubble key={n} who={CAST[bt.who].name} voice={CAST[bt.who].voice} text={bt.fr} lang={lang} tr={trOf(bt.tr)} />;
      case 'choice': return <Bubble key={n} who={you} voice={voice} text={bt.options[0]} lang={lang} tr={trOf(bt.tr)} mine />;
      case 'build': return <Bubble key={n} who={you} voice={voice} text={bt.words.join(' ')} lang={lang} tr={trOf(bt.tr)} mine />;
      case 'note':
        return (
          <motion.aside key={n} className="gx-note" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <p className="gx-note-title"><BulbOutlined /> {tx(bt.title, lang)}</p>
            <p><Rich text={tx(bt.text, lang)} /></p>
          </motion.aside>
        );
    }
  };

  /** The beat being played, while it still needs an answer. */
  const current = () => {
    if (!needsAnswer) return past(beat, i);
    if (beat.k === 'choice' || beat.k === 'listen') {
      return (
        <motion.div key={`q${i}`} className="gx-ask" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          {beat.k === 'listen' && <Bubble who={CAST[beat.who].name} voice={CAST[beat.who].voice} text={beat.fr} lang={lang} hidden />}
          <p className="gx-ask-prompt">{tx(beat.prompt, lang)}</p>
          <div className={`gx-options${beat.k === 'choice' ? ' is-lines' : ''}`}>
            {order.map(o => (
              <motion.button
                key={o}
                type="button"
                lang={beat.k === 'choice' ? 'fr' : undefined}
                className={`gx-option${wrong.includes(o) ? ' is-wrong' : ''}`}
                disabled={wrong.includes(o)}
                onClick={() => pick(o)}
                animate={wrong[wrong.length - 1] === o ? { x: [0, -7, 7, -4, 4, 0] } : {}}
                whileTap={{ scale: 0.98 }}
              >
                {beat.k === 'choice' ? beat.options[o] : tx(beat.options[o], lang)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      );
    }
    if (beat.k === 'build') {
      return (
        <motion.div key={`q${i}`} className="gx-ask" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <p className="gx-ask-prompt">{tx(beat.prompt, lang)}</p>
          {trOf(beat.tr) && <p className="gx-ask-tr">{trOf(beat.tr)}</p>}
          <div className="gx-build-line" aria-label={g.storyBuildHint}>
            {built.length === 0 && <span className="gx-build-hint">{g.storyBuildHint}</span>}
            {built.map(n => <button key={n} type="button" lang="fr" className="gx-word is-placed" onClick={() => setBuilt(bl => bl.filter(x => x !== n))}>{tokens.find(t => t.n === n)!.w}</button>)}
          </div>
          <div className="gx-build-bank">
            {tokens.map(t => (
              <button key={t.n} type="button" lang="fr" className="gx-word" disabled={built.includes(t.n)} onClick={() => setBuilt(bl => [...bl, t.n])}>{t.w}</button>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (phase !== 'play') {
    const stars = Math.max(1, hearts);
    const lines = playerLines(episode);
    return (
      <GameFrame lang={lang} title={tx(episode.title, lang)} onClose={onClose}>
        <motion.div className="gx-end" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {phase === 'done' ? (
            <>
              <Stars n={stars} size="lg" />
              <h2>{!hasNext ? g.storyAllDone : g.storyDone}</h2>
              <p className="gx-end-sub">{!hasNext ? g.storyAllDoneText : g.storyStars(stars)}</p>
              <div className="gx-end-actions">
                {hasNext && <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={onNext}>{g.storyNext}<ArrowRightOutlined /></button>}
                <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={onClose}>{g.back}</button>
              </div>
              <section className="gx-review" aria-label={g.storyReview}>
                <h3>{g.storyReview}</h3>
                <ul>
                  {lines.map(l => <li key={l}><AudioButton text={l} voice={voice} lang={lang} size="sm" /><span lang="fr">{l}</span></li>)}
                </ul>
              </section>
            </>
          ) : (
            <>
              <Hearts n={0} label={g.storyHearts} />
              <h2>{g.storyLost}</h2>
              <p className="gx-end-sub">{g.storyLostText}</p>
              <div className="gx-end-actions">
                <button type="button" className="lp-btn lp-btn-primary lp-btn-lg" onClick={() => { setI(0); setHearts(3); setSolved(false); setWrong([]); setBuilt([]); setFeedback(null); setPhase('play'); }}><RedoOutlined />{g.storyRetry}</button>
                <button type="button" className="lp-btn lp-btn-ghost lp-btn-lg" onClick={onClose}>{g.back}</button>
              </div>
            </>
          )}
        </motion.div>
      </GameFrame>
    );
  }

  const isBuild = beat.k === 'build' && !solved;
  return (
    <GameFrame
      lang={lang}
      title={tx(episode.title, lang)}
      onClose={onClose}
      guard={i > 0}
      progress={(i + (needsAnswer ? 0 : 1)) / beats.length}
      right={<Hearts n={hearts} label={g.storyHearts} />}
      footer={(
        <>
          {feedback
            ? <p className={`gx-fb${feedback.ok ? ' is-ok' : ' is-no'}`}>{feedback.ok && <CheckCircleFilled />} {feedback.text}</p>
            : <p className="gx-foot-kind">{tx(episode.title, lang)}</p>}
          <button
            ref={mainBtn}
            type="button"
            className="lx-pbtn"
            disabled={isBuild ? built.length === 0 : needsAnswer}
            onClick={() => (isBuild ? checkBuild() : next())}
          >
            {isBuild ? g.check : g.continue}
          </button>
        </>
      )}
    >
      <div className="gx-story">
        {beats.slice(0, i).map((bt, n) => past(bt, n))}
        {current()}
        <div ref={endRef} className="gx-story-end" />
      </div>
    </GameFrame>
  );
}
