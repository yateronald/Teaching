import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CustomerServiceOutlined, SoundOutlined } from '@ant-design/icons';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip } from '../../shell';
import { tx, type Lang } from '../../types';
import { practicePath } from '../meta';
import { SkillTabs } from '../parts';
import { LISTENING, exercisePath, listeningPath } from './catalog';
import { ListeningCover } from './ListeningCover';
import { EarSection } from '../ear/EarSection';
import { DialogueSection } from '../dialogues/DialogueSection';
import { listeningCopy } from './copy';
import type { ListeningExercise } from './types';
import './listening.css';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function ListeningLibraryPage({ lang }: { lang: Lang }) {
  const c = listeningCopy[lang];
  const [level, setLevel] = useState<ListeningExercise['level'] | 'all'>('all');
  const lessons = level === 'all' ? LISTENING : LISTENING.filter(e => e.level === level);
  return <LearnShell lang={lang} alternates={{ en: listeningPath('en'), fr: listeningPath('fr') }}
    seo={{ title: `${c.heading} · ${c.library}`, description: c.intro, path: listeningPath(lang) }}>
    <section className="rx-lib-hero">
      <div className="lp-wrap">
        <Crumbs lang={lang} items={[[lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)], [lang === 'fr' ? 'Pratique' : 'Practice', practicePath(lang)], [c.library]]} />
        <SkillTabs lang={lang} active="listening" />
        <div className="rxl-intro">
          <p className="lp-eyebrow"><CustomerServiceOutlined aria-hidden /> {c.lab} · A1–C2</p>
          <h1>{c.heading}</h1>
          <p>{c.intro}</p>
          <ol className="rxl-guide"><li>{c.step}</li><li>{c.answer}</li><li>{c.review}</li></ol>
        </div>
      </div>
    </section>
    <DialogueSection lang={lang} />
    <EarSection lang={lang} />
    <section className="lp-wrap rxl-library" aria-labelledby="rxl-docs-title">
      <p className="ear-track-k">{c.docsK}</p>
      <h2 id="rxl-docs-title" className="rxl-docs-title">{c.docsTitle}</h2>
      <p className="rxl-docs-intro">{c.docsIntro}</p>
      <div className="lx-levels rx-levels" role="group" aria-label={c.levels}>
        <button type="button" aria-pressed={level === 'all'} className={level === 'all' ? 'is-on' : ''} onClick={() => setLevel('all')}>{c.all}</button>
        {levels.map(l => <button type="button" key={l} aria-pressed={level === l} className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)}><b>{l}</b><span>{LISTENING.filter(e => e.level === l).length}</span></button>)}
      </div>
      <p className="rxl-library-count" aria-live="polite">{c.count(lessons.length)}</p>
      <ul className="rx-cards rxl-cards">
        {lessons.map(e => (
          <li key={e.id}><Link className="rx-card rxl-card" to={exercisePath(e, lang)} aria-labelledby={`rxl-title-${e.id}`}>
            <div className="rx-card-img">
              <ListeningCover exercise={e} sizes="(min-width: 1200px) 368px, (min-width: 1000px) 32vw, (min-width: 640px) 46vw, calc(100vw - 36px)" />
              <LevelChip level={e.level} size="sm" />
            </div>
            <div className="rx-card-body">
              <p className="rxl-card-format"><SoundOutlined aria-hidden /> {tx(e.format, lang)}</p>
              <h2 id={`rxl-title-${e.id}`} lang="fr">{e.title}</h2>
              <p className="rxl-card-summary">{tx(e.summary, lang)}</p>
              <div className="rx-card-footer rxl-card-foot"><span>{c.questions(e.count ?? e.questions.length)}</span><span className="rx-card-go" aria-hidden="true">{c.start} <ArrowRightOutlined /></span></div>
            </div>
          </Link></li>
        ))}
      </ul>
    </section>
  </LearnShell>;
}
