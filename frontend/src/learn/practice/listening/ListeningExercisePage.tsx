import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckCircleFilled, CheckCircleOutlined, CheckOutlined, CloseCircleFilled, CloseOutlined, CustomerServiceOutlined, EditOutlined, SoundOutlined } from '@ant-design/icons';
import { beforeSpeak, hasRecording, prefetchRecording, speak, stop, usePlaying } from '../../audio';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip } from '../../shell';
import { tx, type Lang } from '../../types';
import { practicePath } from '../meta';
import { LISTENING, exercisePath, listeningPath } from './catalog';
import { listeningCopy } from './copy';
import { ListeningCover } from './ListeningCover';
import { ListeningPlayer } from './ListeningPlayer';
import { LISTENING_VOICES, passageAudio, questionAudio, type ListeningExercise, type ListeningVoice } from './types';
import { usePinnedPlayer } from '../pinned';
import { useFullExercise } from './advanced';
import { saveListeningDocBest } from '../../studyPath/activityStore';
import './listening.css';

function Clip({ text, voice, lang, label, rate, description }: { text: string; voice: ListeningVoice; lang: Lang; label: string; rate: number; description?: string }) {
  const playing = usePlaying(text, voice);
  const available = hasRecording(text, voice);
  // Sealed recordings are loaded ahead, so that a tap starts them at once.
  useEffect(() => { if (available) prefetchRecording(text, voice); }, [available, text, voice]);
  return <button className="rxl-clip" type="button" aria-describedby={description} disabled={!available} title={available ? undefined : listeningCopy[lang].unavailable} onClick={() => {
    if (playing) stop(); else void speak(text, { voice, rate });
  }}><SoundOutlined aria-hidden /> {playing ? listeningCopy[lang].stop : label}</button>;
}

function ExerciseBody({ exercise: e, lang }: { exercise: ListeningExercise; lang: Lang }) {
  const c = listeningCopy[lang];
  const [voice, setVoice] = useState<ListeningVoice>(e.voice);
  const [rate, setRate] = useState(e.level === 'A1' ? .85 : e.level === 'A2' ? .9 : 1);
  const [phase, setPhase] = useState<'listen' | 'quiz' | 'review'>('listen');
  const [notes, setNotes] = useState('');
  const advanced = e.level === 'C1' || e.level === 'C2';
  const [heard, setHeard] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => e.questions.map(() => null));
  const player = useRef<HTMLAudioElement>(null);
  const { slot, card, pin } = usePinnedPlayer('.rxl-player');
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
    if (nextPhase === 'review') saveListeningDocBest(e.id, correct, e.questions.length);
    focus.current = true;
    setPhase(nextPhase);
  }

  return <LearnShell lang={lang} alternates={{ en: exercisePath(e, 'en'), fr: exercisePath(e, 'fr') }}
    seo={{ title: `${e.title} · ${c.lab} ${e.level}`, description: tx(e.summary, lang), path: exercisePath(e, lang) }}>
    <div className="rxl-workspace">
      <div className="lp-wrap">
        <Crumbs lang={lang} items={[[lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)], [lang === 'fr' ? 'Pratique' : 'Practice', practicePath(lang)], [c.library, listeningPath(lang)], [e.title]]} />
      </div>
      <div className="rxl-shell lp-wrap">
        <Link to={listeningPath(lang)} className="rxl-back"><ArrowLeftOutlined aria-hidden /> {c.back}</Link>
        <header className="rxl-header rxl-header-illustrated">
          <div className="rxl-header-copy">
            <p><LevelChip level={e.level} size="sm" /> {tx(e.format, lang)} <span aria-hidden>·</span> {c.questions(e.questions.length)}{advanced && <> <span aria-hidden>·</span> {c.advanced}</>}</p>
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

        {advanced && phase !== 'review' && <section className="rxl-notes" aria-labelledby="rxl-notes-title">
          <h2 id="rxl-notes-title"><EditOutlined aria-hidden /> {c.notes}</h2>
          <p>{c.notesHint}</p>
          <textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={c.notesPlaceholder} aria-labelledby="rxl-notes-title" rows={phase === 'quiz' ? 4 : 6} spellCheck={false} />
        </section>}

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
          {e.outline && <section className="rxl-outline" aria-labelledby="rxl-outline-title">
            <h3 id="rxl-outline-title">{c.outline}</h3>
            <p>{c.outlineHint}</p>
            <ol>{e.outline.map((part, i) => <li key={i}><span>{c.part(i + 1)}</span>{tx(part, lang)}</li>)}</ol>
          </section>}
          {e.expressions && <section className="rxl-expressions" aria-labelledby="rxl-expr-title">
            <h3 id="rxl-expr-title">{c.expressions}</h3>
            <dl>{e.expressions.map(x => <div key={x.fr}><dt lang="fr">{x.fr}</dt><dd>{tx(x.meaning, lang)}</dd></div>)}</dl>
          </section>}
          {advanced && notes.trim() && <details className="rxl-transcript rxl-my-notes">
            <summary>{c.notes}</summary>
            <p className="rxl-notes-text">{notes}</p>
          </details>}
          <details className="rxl-transcript">
            <summary>{c.transcript}</summary>
            <p>{c.transcriptHint}</p>
            <ol>{e.segments.map((segment, i) => <li key={segment}>
              {e.outline?.[i] && <p className="rxl-part">{c.part(i + 1)} · {tx(e.outline[i], lang)}</p>}
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

/** The advanced documents arrive with their own download: until then, a short wait. */
export default function ListeningExercisePage({ exercise, lang }: { exercise: ListeningExercise; lang: Lang }) {
  const full = useFullExercise(exercise);
  if (full) return <ExerciseBody key={full.id} exercise={full} lang={lang} />;
  const c = listeningCopy[lang];
  return <LearnShell lang={lang} alternates={{ en: exercisePath(exercise, 'en'), fr: exercisePath(exercise, 'fr') }}
    seo={{ title: `${exercise.title} · ${c.lab} ${exercise.level}`, description: tx(exercise.summary, lang), path: exercisePath(exercise, lang) }}>
    <div className="rxl-workspace"><div className="rxl-shell lp-wrap"><p className="rxl-notes" role="status">{c.loadingDoc}</p></div></div>
  </LearnShell>;
}
