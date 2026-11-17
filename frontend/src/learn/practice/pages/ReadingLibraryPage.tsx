// /learn/practice/reading/ and /fr/apprendre/pratique/lecture/: the library
// of reading texts, with the learner’s reading score.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, CustomerServiceOutlined, DownOutlined, FileTextOutlined, ReadOutlined, SoundOutlined } from '@ant-design/icons';
import { imageUrl } from '../../categories';
import { LEVEL_COPY } from '../../levels';
import { hubPath, placementPath } from '../../paths';
import { useProgress } from '../../progress';
import { Crumbs, LearnShell, LevelChip, TeacherCta } from '../../shell';
import { LEVELS, tx, type Lang, type Level } from '../../types';
import { UI } from '../../ui';
import { P } from '../copy';
import { TEXTS, readingPath } from '../meta';
import { SkillTabs, TextCard } from '../parts';
import { libraryJsonLd } from '../schema';
import { textStatus } from '../stats';
import '../practice.css';

type Filter = 'all' | 'starters' | 'todo' | 'review' | 'done';
const FILTERS: Filter[] = ['all', 'starters', 'todo', 'review', 'done'];
const HOW_ICONS = [<SoundOutlined />, <CheckOutlined />, <FileTextOutlined />];

/** `canonical` is false on /learn/practice/, which shows the same library. */
export default function ReadingLibraryPage({ lang, canonical = true }: { lang: Lang; canonical?: boolean }) {
  const c = P[lang];
  const l = c.library;
  const ui = UI[lang];
  const p = useProgress();
  const [filter, setFilter] = useState<Filter>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const levels = useMemo(() => LEVELS.filter(x => TEXTS.some(t => t.level === x)), []);

  const keep = (f: Filter, t: (typeof TEXTS)[number]) => {
    if (f === 'starters') return !!t.starter;
    if (f === 'all') return true;
    return textStatus(p, t).status === f;
  };
  const count = (f: Filter) => TEXTS.filter(t => keep(f, t)).length;
  const list = TEXTS.filter(t => keep(filter, t) && (level === 'all' || t.level === level));
  const groups = LEVELS.filter(x => list.some(t => t.level === x));

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: readingPath('en'), fr: readingPath('fr') }}
      seo={{
        title: l.metaTitle,
        description: l.metaDescription,
        path: readingPath(lang),
        jsonLd: libraryJsonLd(lang),
        noindex: !canonical,
        image: `https://www.learnfrenchwithnatives.com${imageUrl('cat-reading')}`,
      }}
    >
      <section className="rx-lib-hero" aria-labelledby="rx-lib-title">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [c.crumb], [c.text.eyebrow]]} />
          <SkillTabs lang={lang} active="reading" />
          <div className="rx-lib-copy">
            <p className="lp-eyebrow">{l.eyebrow}</p>
            <h1 id="rx-lib-title">{l.title[0]} <em>{l.title[1]}</em> <span className="rx-new">{c.isNew}</span></h1>
            <p className="lx-hero-sub">{l.intro}</p>
            <details className="rx-more">
              <summary>{l.showMore}<DownOutlined aria-hidden /></summary>
              {l.more.map(x => <p key={x}>{x}</p>)}
            </details>
            <div className="rx-filters" role="group" aria-label={l.filters.all}>
              {FILTERS.map(f => {
                const n = count(f);
                if (f !== 'all' && f !== 'starters' && n === 0) return null;
                return (
                  <button key={f} type="button" className={filter === f ? 'is-on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f === 'starters' && <ReadOutlined aria-hidden />}{l.filters[f]}<span className="rx-count">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section rx-lib-list" aria-labelledby="rx-all-title">
        <div className="lp-wrap">
          <header className="rx-list-head">
            <h2 id="rx-all-title">{filter === 'starters' ? l.startTitle : l.allTitle}</h2>
            <div className="lx-levels rx-levels" role="group" aria-label={ui.level}>
              <button type="button" className={level === 'all' ? 'is-on' : ''} aria-pressed={level === 'all'} onClick={() => setLevel('all')}>{l.allLevels}</button>
              {levels.map(x => (
                <button key={x} type="button" className={level === x ? 'is-on' : ''} aria-pressed={level === x} onClick={() => setLevel(x)}>
                  <b>{x}</b> {tx(LEVEL_COPY[x].name, lang)}<span>{TEXTS.filter(t => t.level === x).length}</span>
                </button>
              ))}
            </div>
          </header>
          {filter === 'starters' && <p className="rx-list-sub">{l.startSub}</p>}
          <p className="lx-results" aria-live="polite">{l.results(list.length)}</p>
          {groups.length ? groups.map(x => (
            <div key={x} className="rx-level-group">
              <h3><LevelChip level={x} size="sm" /> {tx(LEVEL_COPY[x].name, lang)}</h3>
              <ul className="rx-cards">
                {list.filter(t => t.level === x).map(t => <li key={t.id}><TextCard text={t} lang={lang} p={p} /></li>)}
              </ul>
            </div>
          )) : <p className="lx-empty">{l.empty}</p>}
          <p className="rx-soon"><CustomerServiceOutlined aria-hidden /> {l.soonText}</p>
        </div>
      </section>

      <section className="lp-section lp-tint" aria-labelledby="rx-how-title">
        <div className="lp-wrap">
          <header className="lp-head">
            <h2 id="rx-how-title">{l.howTitle}</h2>
          </header>
          <ol className="rx-how">
            {l.how.map(([t, d], i) => (
              <li key={t}>
                <span className="rx-how-n" aria-hidden>{HOW_ICONS[i]}</span>
                <strong>{t}</strong>
                <p>{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lp-section" aria-labelledby="rx-faq-title">
        <div className="lp-wrap lp-faq-grid">
          <header className="lp-head is-left">
            <h2 id="rx-faq-title">{l.faqTitle}</h2>
            <p><Link to={placementPath(lang)} className="lx-link">{ui.hub.ctaTest}<ArrowRightOutlined /></Link></p>
            <TeacherCta lang={lang} compact />
          </header>
          <div className="lp-faq-list">
            {l.faq.map(([q, a], i) => (
              <details key={q} className="lp-faq-item" open={i === 0 || undefined}>
                <summary><h3>{q}</h3><span className="lp-faq-icon" aria-hidden /></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </LearnShell>
  );
}
