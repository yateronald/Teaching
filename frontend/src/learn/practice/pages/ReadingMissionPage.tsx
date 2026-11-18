import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftOutlined, CheckOutlined, FileTextOutlined, MailOutlined, MessageOutlined, SoundOutlined } from '@ant-design/icons';
import { hasRecording, speak, stop, usePlaying } from '../../audio';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip } from '../../shell';
import { tx, type Lang } from '../../types';
import { readingPath } from '../meta';
import { missionAudio, missionPath, type ReadingMission } from '../missions';
import '../mission.css';

const labels = {
  fr: {
    back: 'Retour à la bibliothèque', library: 'Lecture', mission: 'Mission de lecture', brief: 'Votre objectif',
    documents: 'Consultez les documents', choice: 'Quel message envoyez-vous à Élise ?',
    compare: 'Vous pouvez revenir aux documents à tout moment.',
    submit: 'Vérifier mon message', right: 'Élise a les bonnes indications !', wrong: 'Il manque une information',
    solution: 'Le message à envoyer', correction: 'Les trois indices à croiser', retry: 'Recommencer', tip: 'À retenir', listen: 'Écouter', stop: 'Arrêter',
  },
  en: {
    back: 'Back to the library', library: 'Reading', mission: 'Reading mission', brief: 'Your objective',
    documents: 'Check the documents', choice: 'Which message will you send to Élise?',
    compare: 'You can return to the documents at any time.',
    submit: 'Check my message', right: 'Élise has the right directions!', wrong: 'One detail needs checking',
    solution: 'The message to send', correction: 'Putting the three clues together', retry: 'Try again', tip: 'Remember', listen: 'Listen', stop: 'Stop',
  },
};

const icons = { email: MailOutlined, sms: MessageOutlined, notice: FileTextOutlined };

function DocumentAudio({ text, lang }: { text: string; lang: Lang }) {
  const playing = usePlaying(text);
  const c = labels[lang];
  if (!hasRecording(text)) return null;
  return <button type="button" className="rxm-audio" onClick={() => { if (playing) stop(); else void speak(text); }}>
    <SoundOutlined aria-hidden /> {playing ? c.stop : c.listen}
  </button>;
}

export default function ReadingMissionPage({ lang, mission }: { lang: Lang; mission: ReadingMission }) {
  const c = labels[lang];
  const [openDoc, setOpenDoc] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const result = useRef<HTMLHeadingElement>(null);
  const choice = useRef<HTMLLegendElement>(null);
  const document = mission.documents[openDoc];
  const Icon = icons[document.kind];

  useEffect(() => () => stop(), []);
  useEffect(() => { if (checked) result.current?.focus(); }, [checked]);

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
            <p className="rxm-tags"><LevelChip level={mission.level} size="sm" /> {c.mission} · {mission.documents.length} documents · {mission.minutes} min</p>
            <h1>{tx(mission.title, lang)}</h1>
            <p className="rxm-objective"><strong>{c.brief}</strong> {tx(mission.brief, lang)}</p>
          </header>

          <div className="rxm-grid">
            <section className="rxm-panel" aria-labelledby="rxm-documents">
              <h2 id="rxm-documents"><span aria-hidden>1</span> {c.documents}</h2>
              <div className="rxm-picker" role="group" aria-label={c.documents}>
                {mission.documents.map((doc, i) => {
                  const DocIcon = icons[doc.kind];
                  return <button key={doc.id} type="button" aria-pressed={openDoc === i} aria-controls="rxm-document" onClick={() => { if (openDoc !== i) stop(); setOpenDoc(i); }}>
                    <DocIcon aria-hidden /> {tx(doc.label, lang)}
                  </button>;
                })}
              </div>
              <article className={`rxm-document rxm-${document.kind}`} id="rxm-document" lang="fr" aria-labelledby="rxm-document-title">
                <div className="rxm-doc-header">
                  <div className="rxm-doc-icon"><Icon aria-hidden /></div>
                  <div>
                    <p lang={lang}>{tx(document.labelDetail, lang)}</p>
                    <h3 id="rxm-document-title">{document.title}</h3>
                  </div>
                  <span lang={lang}><DocumentAudio text={missionAudio(document)} lang={lang} /></span>
                </div>
                <div className="rxm-doc-body">
                  {document.lines.map(line => {
                    const passage = checked ? document.evidence.find(e => line.includes(e)) : undefined;
                    if (!passage) return <p key={line}>{line}</p>;
                    const i = line.indexOf(passage);
                    return <p key={line}>{line.slice(0, i)}<mark>{passage}</mark>{line.slice(i + passage.length)}</p>;
                  })}
                </div>
              </article>
            </section>

            <form className="rxm-panel rxm-decision" onSubmit={e => { e.preventDefault(); if (selected !== null) { stop(); setChecked(true); } }}>
              <fieldset disabled={checked} aria-describedby="rxm-compare">
                <legend tabIndex={-1} ref={choice}><span aria-hidden>2</span> {c.choice}</legend>
                <p id="rxm-compare">{c.compare}</p>
                <div className="rxm-answers">
                  {mission.answers.map((answer, i) => (
                    <label key={answer.message} className={checked && i === mission.correct ? 'is-correct' : undefined}>
                      <input type="radio" name="mission-answer" checked={selected === i} onChange={() => setSelected(i)} />
                      <span lang="fr">{answer.message}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {!checked && <button className="lp-btn lp-btn-primary" disabled={selected === null} type="submit">{c.submit}</button>}
            </form>
          </div>

          {checked && selected !== null && (
            <section className="rxm-panel rxm-result" aria-labelledby="rxm-result">
              <h2 id="rxm-result" ref={result} tabIndex={-1}>{selected === mission.correct && <CheckOutlined aria-hidden />} {selected === mission.correct ? c.right : c.wrong}</h2>
              <p>{tx(mission.answers[selected].feedback, lang)}</p>
              {selected !== mission.correct && <p className="rxm-objective"><strong>{c.solution}</strong> <span lang="fr">{mission.answers[mission.correct].message}</span></p>}
              <h3>{c.correction}</h3>
              <ul className="rxm-evidence">
                {mission.documents.map(doc => (
                  <li key={doc.id}>
                    <strong>{tx(doc.label, lang)}</strong>
                    <blockquote lang="fr">{doc.evidence.map(passage => <p key={passage}><mark>{passage}</mark></p>)}</blockquote>
                    <p>{tx(doc.takeaway, lang)}</p>
                  </li>
                ))}
              </ul>
              <p className="rxm-objective"><strong>{c.tip}</strong> {tx(mission.tip, lang)}</p>
              <button className="lp-btn lp-btn-ghost" type="button" onClick={() => { stop(); setChecked(false); setSelected(null); setOpenDoc(0); choice.current?.focus(); }}>{c.retry}</button>
            </section>
          )}
        </div>
      </div>
    </LearnShell>
  );
}
