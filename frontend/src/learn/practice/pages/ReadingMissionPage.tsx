import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, ArrowRightOutlined, CheckOutlined, FileTextOutlined, MailOutlined, MessageOutlined, SoundOutlined } from '@ant-design/icons';
import { hasRecording, speak, stop, usePlaying } from '../../audio';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip } from '../../shell';
import { tx, type Lang, type Voice } from '../../types';
import { readingPath } from '../meta';
import { missionAudio, missionPath, missionVoice, type ReadingMission } from '../missions';
import '../mission.css';

const labels = {
  fr: {
    back: 'Retour à la bibliothèque', library: 'Lecture', mission: 'Lecture guidée', select: 'Sélectionnez le passage qui répond à la question.',
    stages: 'Étapes de lecture', found: 'Indice trouvé', hint: 'Un indice ?', next: 'Indice suivant', reveal: 'Voir mon message',
    done: 'Votre message est prêt', to: 'À', remember: 'À retenir', retry: 'Recommencer', listen: 'Écouter', stop: 'Arrêter',
    review: 'Relire les indices', step: (n: number, total: number) => `Étape ${n} sur ${total}`,
  },
  en: {
    back: 'Back to the library', library: 'Reading', mission: 'Guided reading', select: 'Select the passage that answers the question.',
    stages: 'Reading steps', found: 'Clue found', hint: 'Need a hint?', next: 'Next clue', reveal: 'See my message',
    done: 'Your message is ready', to: 'To', remember: 'Remember', retry: 'Start again', listen: 'Listen', stop: 'Stop',
    review: 'Review the clues', step: (n: number, total: number) => `Step ${n} of ${total}`,
  },
};

const icons = { email: MailOutlined, sms: MessageOutlined, notice: FileTextOutlined };

function DocumentAudio({ text, lang, voice }: { text: string; lang: Lang; voice: Voice }) {
  const playing = usePlaying(text, voice);
  const c = labels[lang];
  if (!hasRecording(text, voice)) return null;
  return <button type="button" className="rxm-audio" onClick={() => { if (playing) stop(); else void speak(text, { voice }); }}>
    <SoundOutlined aria-hidden /> {playing ? c.stop : c.listen}
  </button>;
}

export default function ReadingMissionPage({ lang, mission }: { lang: Lang; mission: ReadingMission }) {
  const c = labels[lang];
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const total = mission.documents.length;
  const doc = mission.documents[step];
  const solved = !!doc && picked === doc.clue.line;
  const Icon = doc ? icons[doc.kind] : MessageOutlined;

  useEffect(() => () => stop(), []);
  useEffect(() => { if (solved) nextButton.current?.focus({ preventScroll: true }); }, [solved]);
  useEffect(() => {
    if (moveFocus.current) {
      heading.current?.focus();
      moveFocus.current = false;
    }
  }, [step]);

  function goTo(next: number) {
    stop();
    moveFocus.current = true;
    setPicked(null);
    setHint(false);
    setStep(next);
  }

  return (
    <LearnShell lang={lang} alternates={{ fr: missionPath(mission, 'fr'), en: missionPath(mission, 'en') }} seo={{
      title: `${tx(mission.title, lang)} · ${c.mission} ${mission.level}`,
      description: tx(mission.summary, lang), path: missionPath(mission, lang), noindex: true,
    }}>
      <div className="rxm-page">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)], [c.library, readingPath(lang)], [tx(mission.title, lang)]]} />
          <header className="rxm-hero">
            <Link to={readingPath(lang)} className="rxm-back"><ArrowLeftOutlined aria-hidden /> {c.back}</Link>
            <p className="rxm-tags"><LevelChip level={mission.level} size="sm" /> {c.mission} · {mission.minutes} min</p>
            <h1>{tx(mission.title, lang)}</h1>
            <p className="rxm-objective">{tx(mission.brief, lang)}</p>
          </header>

          <div className="rxm-workspace">
            <ol className="rxm-stages" aria-label={c.stages}>
              {mission.documents.map(({ id, clue }, i) => (
                <li key={id} aria-current={i === step ? 'step' : undefined} className={i < step || (i === step && solved) ? 'is-found' : undefined}>
                  <span className="rxm-step-dot" aria-hidden>{i < step || (i === step && solved) ? <CheckOutlined /> : i + 1}</span>
                  <span><strong>{tx(clue.label, lang)}</strong>{(i < step || (i === step && solved)) && <small>{clue.value}</small>}</span>
                </li>
              ))}
            </ol>

            {doc ? (
              <section className="rxm-panel" aria-labelledby="rxm-question">
                <p className="rxm-kicker">{c.step(step + 1, total)} <span aria-hidden>·</span> {tx(doc.label, lang)}</p>
                <h2 id="rxm-question" ref={heading} tabIndex={-1}>{tx(doc.clue.question, lang)}</h2>
                <p className="rxm-instruction" id="rxm-instruction">{c.select}</p>

                <article className={`rxm-document rxm-${doc.kind}`} aria-labelledby="rxm-document-title">
                  <div className="rxm-doc-header">
                    <div className="rxm-doc-icon"><Icon aria-hidden /></div>
                    <div>
                      <p>{tx(doc.labelDetail, lang)}</p>
                      <h3 id="rxm-document-title" lang="fr">{doc.title}</h3>
                    </div>
                    <span><DocumentAudio text={missionAudio(doc)} voice={missionVoice(doc)} lang={lang} /></span>
                  </div>
                  <div className="rxm-doc-body" role="group" aria-describedby="rxm-instruction" aria-labelledby="rxm-question">
                    {doc.lines.map((line, i) => {
                      if (solved) {
                        const passage = doc.clue.highlight;
                        const at = i === doc.clue.line ? line.indexOf(passage) : -1;
                        return <p className="rxm-line" lang="fr" key={line}>{at < 0 ? line : <>{line.slice(0, at)}<mark>{passage}</mark>{line.slice(at + passage.length)}</>}</p>;
                      }
                      return <button className="rxm-line" lang="fr" type="button" key={line} aria-pressed={picked === i} onClick={() => { stop(); setPicked(i); }}>{line}</button>;
                    })}
                  </div>
                </article>

                <div className="rxm-feedback" role="status">
                  {solved ? <p className="is-success"><strong><CheckOutlined aria-hidden /> {c.found} : {doc.clue.value}</strong>{tx(doc.takeaway, lang)}</p>
                    : picked !== null ? <p className="is-retry">{tx(doc.clue.retry, lang)}</p> : null}
                </div>
                <div className="rxm-actions">
                  {solved
                    ? <button ref={nextButton} className="lp-btn lp-btn-primary" type="button" onClick={() => goTo(step + 1)}>{step + 1 === total ? (mission.outcome ? tx(mission.outcome.action, lang) : c.reveal) : c.next} <ArrowRightOutlined aria-hidden /></button>
                    : <button className="lp-btn lp-btn-ghost" type="button" aria-expanded={hint} aria-controls="rxm-hint" onClick={() => setHint(!hint)}>{c.hint}</button>}
                  <p id="rxm-hint" hidden={!hint || solved}>{tx(doc.clue.hint, lang)}</p>
                </div>
              </section>
            ) : (
              <section className="rxm-panel rxm-result" aria-labelledby="rxm-result">
                <h2 id="rxm-result" ref={heading} tabIndex={-1}>{mission.outcome ? tx(mission.outcome.title, lang) : c.done}</h2>
                <div className="rxm-message">
                  <p><MessageOutlined aria-hidden /> {c.to} : <strong>{mission.recipient}</strong></p>
                  <blockquote lang="fr">Salut {mission.recipient} ! {mission.documents.map(item => item.clue.messagePart).join(' ')}</blockquote>
                </div>
                <p className="rxm-objective"><strong>{c.remember}</strong> {tx(mission.tip, lang)}</p>
                <details className="rxm-review">
                  <summary>{c.review}</summary>
                  <ul>{mission.documents.map(item => (
                    <li key={item.id}>
                      <strong>{tx(item.label, lang)}</strong>
                      <p lang="fr"><q>{item.clue.highlight}</q></p>
                      <p>{tx(item.takeaway, lang)}</p>
                    </li>
                  ))}</ul>
                </details>
                <button className="lp-btn lp-btn-ghost" type="button" onClick={() => goTo(0)}>{c.retry}</button>
              </section>
            )}
          </div>
        </div>
      </div>
    </LearnShell>
  );
}
