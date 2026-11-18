import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, CheckCircleOutlined, CheckOutlined, CloseCircleFilled, CloseOutlined, CustomerServiceOutlined, SoundOutlined } from '@ant-design/icons';
import { beforeSpeak, hasRecording, prefetchRecording, speak, stop, usePlaying } from '../../audio';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip } from '../../shell';
import { tx, type Lang } from '../../types';
import { LISTENING, exercisePath, listeningPath } from './catalog';
import { listeningCopy } from './copy';
import { ListeningCover } from './ListeningCover';
import { ListeningPlayer } from './ListeningPlayer';
import { LISTENING_VOICES, passageAudio, questionAudio, type ListeningExercise, type ListeningVoice } from './types';
import './listening.css';

/**
 * Keeps the player in reach while the learner answers: once its card scrolls
 * under the site header, the card is pinned just below it, in a compact form,
 * at the same place in the column. The slot keeps the card's height, so the
 * questions do not jump.
 */
function usePinnedPlayer() {
  const slot = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement>(null);
  const [pin, setPin] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  useEffect(() => {
    let frame = 0, height = 0, rowEnd = 0;
    const update = () => {
      frame = 0;
      const s = slot.current, c = card.current;
      if (!s || !c) return;
      // Where the site header ends (it is sticky at the top).
      const header = Math.max(0, document.querySelector<HTMLElement>('.lp-header')?.getBoundingClientRect().bottom ?? 0);
      const r = s.getBoundingClientRect();
      // Measured in the card's normal form: its height, and where its player row ends.
      if (!c.classList.contains('is-pinned')) {
        height = c.offsetHeight;
        const row = c.querySelector('.rxl-player');
        rowEnd = row ? row.getBoundingClientRect().bottom - c.getBoundingClientRect().top : height;
      }
      // Pinned as soon as the player row slides under the header.
      const pinned = height > 0 && r.top + rowEnd < header;
      setPin(old => {
        if (!pinned) return old ? null : old;
        const next = { top: Math.round(header), left: Math.round(r.left), width: Math.round(r.width), height };
        return old && old.top === next.top && old.left === next.left && old.width === next.width && old.height === next.height ? old : next;
      });
    };
    const ask = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', ask, { passive: true });
    window.addEventListener('resize', ask);
    return () => { window.removeEventListener('scroll', ask); window.removeEventListener('resize', ask); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return { slot, card, pin };
}

function Clip({ text, voice, lang, label, rate, description }: { text: string; voice: ListeningVoice; lang: Lang; label: string; rate: number; description?: string }) {
  const playing = usePlaying(text, voice);
  const available = hasRecording(text, voice);
  // Sealed recordings are loaded ahead, so that a tap starts them at once.
  useEffect(() => { if (available) prefetchRecording(text, voice); }, [available, text, voice]);
  return <button className="rxl-clip" type="button" aria-describedby={description} disabled={!available} title={available ? undefined : listeningCopy[lang].unavailable} onClick={() => {
    if (playing) stop(); else void speak(text, { voice, rate });
  }}><SoundOutlined aria-hidden /> {playing ? listeningCopy[lang].stop : label}</button>;
}

export default function ListeningExercisePage({ exercise: e, lang }: { exercise: ListeningExercise; lang: Lang }) {
  const c = listeningCopy[lang];
  const [voice, setVoice] = useState<ListeningVoice>(e.voice);
  const [rate, setRate] = useState(e.level === 'A1' ? .85 : e.level === 'A2' ? .9 : 1);
  const [phase, setPhase] = useState<'listen' | 'quiz' | 'review'>('listen');
  const [heard, setHeard] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => e.questions.map(() => null));
  const player = useRef<HTMLAudioElement>(null);
  const { slot, card, pin } = usePinnedPlayer();
  const section = useRef<HTMLHeadingElement>(null);
  const focus = useRef(false);
  const pause = useCallback(() => player.current?.pause(), []);
  const text = passageAudio(e);
  const available = hasRecording(text, voice);
  const count = answers.filter(i => i !== null).length;
  const correct = e.questions.filter((q, i) => q.answer === answers[i]).length;
  const next = LISTENING[LISTENING.findIndex(x => x.id === e.id) + 1];

  useEffect(() => {
    beforeSpeak.add(pause);
    return () => { beforeSpeak.delete(pause); stop(); };
  }, [pause]);
  useEffect(() => {
    if (focus.current) {
      section.current?.focus();
      focus.current = false;
    }
  }, [phase]);

  function advance(nextPhase: typeof phase) {
    pause(); stop();
    focus.current = true;
    setPhase(nextPhase);
  }

  return <LearnShell lang={lang} alternates={{ en: exercisePath(e, 'en'), fr: exercisePath(e, 'fr') }}
    seo={{ title: `${e.title} · ${c.lab} ${e.level}`, description: tx(e.summary, lang), path: exercisePath(e, lang) }}>
    <div className="rxl-workspace">
      <div className="lp-wrap">
        <Crumbs lang={lang} items={[[lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)], [c.library, listeningPath(lang)], [e.title]]} />
      </div>
      <div className="rxl-shell lp-wrap">
        <Link to={listeningPath(lang)} className="rxl-back"><ArrowLeftOutlined aria-hidden /> {c.back}</Link>
        <header className="rxl-header rxl-header-illustrated">
          <div className="rxl-header-copy">
            <p><LevelChip level={e.level} size="sm" /> {tx(e.format, lang)} <span aria-hidden>·</span> {c.questions(e.questions.length)}</p>
            <h1 lang="fr">{e.title}</h1>
            <p>{tx(e.summary, lang)}</p>
          </div>
          <div className="rxl-header-cover"><ListeningCover exercise={e} sizes="(max-width: 600px) calc(100vw - 36px), 245px" eager /></div>
        </header>
        <ol className="rxl-guide" aria-label={c.lab}>
          {([['listen', c.step], ['quiz', c.answer], ['review', c.review]] as const).map(([key, label]) =>
            <li key={key} aria-current={phase === key ? 'step' : undefined}>{label}</li>)}
        </ol>
        <div ref={slot} className="rxl-player-slot" style={pin ? { height: pin.height } : undefined}>
          <section ref={card} className={`rxl-player-card${pin ? ' is-pinned' : ''}`} aria-labelledby="rxl-player-title"
            style={pin ? { top: pin.top, left: pin.left, width: pin.width } : undefined}>
            <div className="rxl-player-heading">
              <span className="rxl-icon"><CustomerServiceOutlined aria-hidden /></span>
              <div><h2 id="rxl-player-title" ref={phase === 'listen' ? section : undefined} tabIndex={-1}>{c.play}</h2>
                <p><strong>{c.warmup} :</strong> {tx(e.goal, lang)}</p></div>
            </div>
            <div className="rxl-player-tools">
              <div role="group" aria-label={c.voices} className="rxl-voices">
                {LISTENING_VOICES.map((v, i) => <button type="button" key={v} aria-pressed={voice === v} onClick={() => {
                  if (voice !== v) { pause(); stop(); setVoice(v); }
                }}>{i === 0 ? c.female : c.male}</button>)}
              </div>
              <label className="rxl-rate">{c.rate}
                <select value={rate} onChange={event => setRate(Number(event.target.value))}>
                  {[.75, .85, .9, 1, 1.15].map(value => <option key={value} value={value}>{value.toLocaleString(lang)}×</option>)}
                </select>
              </label>
            </div>
            {available
              ? <ListeningPlayer text={text} voice={voice} rate={rate} lang={lang} audio={player} onHeard={() => setHeard(true)} />
              : <p role="status">{c.unavailable}</p>}
            {phase === 'listen' && <div className="rxl-first">
              <p>{c.initial}</p>
              <button className={`lp-btn ${heard ? 'lp-btn-primary' : 'lp-btn-ghost'}`} type="button" onClick={() => advance('quiz')}>{heard ? c.openQuiz : c.access} <ArrowRightOutlined aria-hidden /></button>
            </div>}
          </section>
        </div>

        {phase === 'quiz' && <form className="rxl-quiz" onSubmit={event => { event.preventDefault(); if (count === e.questions.length) advance('review'); }}>
          <div className="rxl-section-heading">
            <h2 tabIndex={-1} ref={section}>{c.quiz}</h2>
            <span aria-live="polite">{c.progress(count, e.questions.length)}</span>
          </div>
          <progress value={count} max={e.questions.length} aria-label={c.progress(count, e.questions.length)} />
          {e.questions.map((q, i) => <div className="rxl-question" key={q.prompt}>
            <div className="rxl-question-heading">
              <h3 id={`rxl-q-${i}`} lang="fr"><span aria-hidden>{i + 1}</span> {q.prompt}</h3>
              <Clip text={questionAudio(q)} voice={e.voice} lang={lang} label={c.question} rate={rate} description={`rxl-q-${i}`} />
            </div>
            <div className="rxl-options" role="radiogroup" lang="fr" aria-labelledby={`rxl-q-${i}`}>
              {q.options.map((o, j) => <label key={o}>
                <input type="radio" name={`question-${i}`} checked={answers[i] === j} onChange={() => setAnswers(old => old.map((a, n) => n === i ? j : a))} />
                <span className="rxl-option-letter" aria-hidden="true">{'ABCD'[j]}</span><span>{o}</span>
              </label>)}
            </div>
          </div>)}
          <button className="lp-btn lp-btn-primary" type="submit" disabled={count !== e.questions.length}>{c.check} <ArrowRightOutlined aria-hidden /></button>
        </form>}

        {phase === 'review' && <section className="rxl-review" aria-labelledby="rxl-score">
          <div className="rxl-section-heading"><h2 id="rxl-score" ref={section} tabIndex={-1}>{c.score(correct, e.questions.length)}</h2><CheckCircleOutlined aria-hidden /></div>
          <nav className="rxl-overview" aria-label={c.overview}>
            {e.questions.map((q, i) => {
              const ok = answers[i] === q.answer;
              return <a key={q.prompt} href={`#rxl-r-${i}`} className={ok ? 'is-right' : 'is-wrong'} aria-label={c.jump(i + 1, ok)} title={c.jump(i + 1, ok)}>
                {ok ? <CheckOutlined aria-hidden /> : <CloseOutlined aria-hidden />}{i + 1}
              </a>;
            })}
          </nav>
          <p className="rxl-strategy"><strong>{c.tip}</strong> {tx(e.strategy, lang)}</p>
          <ol className="rxl-results">
            {e.questions.map((q, i) => {
              const ok = answers[i] === q.answer;
              return <li key={q.prompt} id={`rxl-r-${i}`} className={`rxl-question rxl-result ${ok ? 'is-right' : 'is-wrong'}`}>
                <div className="rxl-result-head">
                  <h3 lang="fr"><span aria-hidden>{i + 1}</span> {q.prompt}</h3>
                  <p className={`rxl-verdict ${ok ? 'is-right' : 'is-wrong'}`}>
                    {ok ? <CheckCircleFilled aria-hidden /> : <CloseCircleFilled aria-hidden />} {ok ? c.right : c.wrong}
                  </p>
                </div>
                <ul className="rxl-answers">
                  {!ok && <li className="is-mine"><CloseOutlined aria-hidden /><span><small>{c.yourAnswer}</small> <s lang="fr">{q.options[answers[i] ?? -1]}</s></span></li>}
                  <li className="is-key"><CheckOutlined aria-hidden /><span><small>{ok ? c.yourAnswer : c.correct}</small> <b lang="fr">{q.options[q.answer]}</b></span></li>
                </ul>
                {ok
                  ? <>
                    <p className="rxl-why">{tx(q.explanation, lang)}</p>
                    <Clip text={e.segments[q.cue]} voice={e.voice} lang={lang} label={c.excerpt} rate={rate} />
                  </>
                  : <div className="rxl-fix">
                    <p className="rxl-why"><strong>{c.why}</strong> {tx(q.explanation, lang)}</p>
                    <figure className="rxl-heard">
                      <figcaption>{c.heard}</figcaption>
                      <blockquote lang="fr">{e.segments[q.cue]}</blockquote>
                      <Clip text={e.segments[q.cue]} voice={e.voice} lang={lang} label={c.excerpt} rate={rate} />
                    </figure>
                  </div>}
              </li>;
            })}
          </ol>
          <details className="rxl-transcript">
            <summary>{c.transcript}</summary>
            <p>{c.transcriptHint}</p>
            <ol>{e.segments.map(segment => <li key={segment}>
              <p lang="fr">{segment}</p><Clip text={segment} voice={e.voice} lang={lang} label={c.excerpt} rate={rate} />
            </li>)}</ol>
          </details>
          <div className="rxl-after">
            <button type="button" className="lp-btn lp-btn-ghost" onClick={() => {
              setAnswers(e.questions.map(() => null)); setHeard(false);
              if (player.current) player.current.currentTime = 0;
              advance('listen');
            }}>{c.retry}</button>
            {next && <Link to={exercisePath(next, lang)} className="lp-btn lp-btn-primary">{c.next} <ArrowRightOutlined aria-hidden /></Link>}
          </div>
        </section>}
      </div>
    </div>
  </LearnShell>;
}
