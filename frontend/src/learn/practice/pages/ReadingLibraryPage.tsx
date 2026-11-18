// /learn/practice/reading/ and /fr/apprendre/pratique/lecture/: the library
// of reading texts, with the learner’s reading score.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckOutlined, CloseOutlined, CustomerServiceOutlined, DownOutlined, FileTextOutlined, ReadOutlined, SearchOutlined, SoundOutlined } from '@ant-design/icons';
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
import { MISSIONS, missionCoverKey, missionPath } from '../missions';
import '../practice.css';
import '../mission.css';

type Filter = 'all' | 'starters' | 'todo' | 'review' | 'done';
const FILTERS: Filter[] = ['all', 'starters', 'todo', 'review', 'done'];
const HOW_ICONS = [<SoundOutlined />, <CheckOutlined />, <FileTextOutlined />];
const searchable = (value: string) => value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'oe').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** `canonical` is false on /learn/practice/, which shows the same library. */
export default function ReadingLibraryPage({ lang, canonical = true }: { lang: Lang; canonical?: boolean }) {
  const c = P[lang];
  const l = c.library;
  const ui = UI[lang];
  const p = useProgress();
  const [filter, setFilter] = useState<Filter>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [missionLevel, setMissionLevel] = useState<Level | 'all'>('all');
  const [query, setQuery] = useState('');
  const levels = useMemo(() => LEVELS.filter(x => TEXTS.some(t => t.level === x)), []);
  const matched = useMemo(() => {
    const terms = searchable(query).split(' ').filter(Boolean);
    if (!terms.length) return TEXTS;
    return TEXTS.filter(t => {
      const haystack = searchable([t.title, tx(t.theme, lang), tx(t.subtitle, lang), c.learn.genre[t.genre]].join(' '));
      return terms.every(term => haystack.includes(term));
    });
  }, [query, lang, c]);

  const keep = (f: Filter, t: (typeof TEXTS)[number]) => {
    if (f === 'starters') return !!t.starter;
    if (f === 'all') return true;
    return textStatus(p, t).status === f;
  };
  const matchesLevel = (t: (typeof TEXTS)[number]) => level === 'all' || t.level === level;
  const count = (f: Filter) => matched.filter(t => matchesLevel(t) && keep(f, t)).length;
  const filtered = matched.filter(t => keep(filter, t));
  const list = filtered.filter(matchesLevel);
  const groups = LEVELS.filter(x => list.some(t => t.level === x));
  const missionLevels = LEVELS.filter(x => MISSIONS.some(m => m.level === x));
  const missions = MISSIONS.filter(m => missionLevel === 'all' || m.level === missionLevel);

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
          </div>
        </div>
      </section>

      <section className="lp-wrap rxm-feature" aria-labelledby="rxm-feature-title">
        <h2 id="rxm-feature-title">{lang === 'fr' ? 'Missions de lecture' : 'Reading missions'} <span>{c.isNew}</span></h2>
        <p className="rxm-feature-intro">{lang === 'fr' ? 'Une situation, trois indices à repérer et une décision à préparer.' : 'One situation, three clues to find and a decision to make.'}</p>
        <div className="lx-levels rx-levels rxm-levels" role="group" aria-label={lang === 'fr' ? 'Niveaux des missions' : 'Mission levels'}>
          <button type="button" className={missionLevel === 'all' ? 'is-on' : ''} aria-pressed={missionLevel === 'all'} onClick={() => setMissionLevel('all')}>{l.allLevels}<span>{MISSIONS.length}</span></button>
          {missionLevels.map(x => (
            <button key={x} type="button" className={missionLevel === x ? 'is-on' : ''} aria-pressed={missionLevel === x} onClick={() => setMissionLevel(x)}>
              <b>{x}</b><span>{MISSIONS.filter(m => m.level === x).length}</span>
            </button>
          ))}
        </div>
        <ul className="rx-cards rxm-feature-grid">
          {missions.map(m => (
            <li key={m.id}>
              <Link className="rxm-feature-link" to={missionPath(m, lang)} aria-label={tx(m.title, lang)}>
                <div className="rx-card-img rxm-feature-img">
                  <img src={imageUrl(missionCoverKey(m), 640)} srcSet={`${imageUrl(missionCoverKey(m), 640)} 640w, ${imageUrl(missionCoverKey(m), 1200)} 1200w`}
                    sizes="(min-width: 1200px) 368px, (min-width: 1000px) 32vw, (min-width: 640px) 46vw, calc(100vw - 36px)"
                    alt="" width="640" height="360" loading="lazy" decoding="async" />
                  <LevelChip level={m.level} size="sm" />
                </div>
                <div className="rxm-feature-copy">
                  <div className="rxm-tags">{lang === 'fr' ? `${m.documents.length} étapes` : `${m.documents.length} steps`} · {m.minutes} min</div>
                  <h3>{tx(m.title, lang)}</h3>
                  <p>{tx(m.summary, lang)}</p>
                </div>
                <span className="rxm-feature-cta">{lang === 'fr' ? 'Essayer la mission' : 'Try the mission'} <ArrowRightOutlined aria-hidden /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="lp-section rx-lib-list" aria-labelledby="rx-all-title">
        <div className="lp-wrap">
          <header className="rx-list-head">
            <h2 id="rx-all-title">{filter === 'starters' ? l.startTitle : l.allTitle}</h2>
            <div className="rx-search">
              <SearchOutlined aria-hidden />
              <input type="search" aria-label={l.search} placeholder={l.searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} />
              {query && <button type="button" aria-label={l.clearSearch} onClick={e => { e.currentTarget.parentElement?.querySelector('input')?.focus(); setQuery(''); }}><CloseOutlined aria-hidden /></button>}
            </div>
          </header>
          <div className="rx-library-controls">
            <div className="lx-levels rx-levels" role="group" aria-label={ui.level}>
              <button type="button" className={level === 'all' ? 'is-on' : ''} aria-pressed={level === 'all'} onClick={() => setLevel('all')}>{l.allLevels}</button>
              {levels.map(x => (
                <button key={x} type="button" className={level === x ? 'is-on' : ''} aria-pressed={level === x} onClick={() => setLevel(x)}>
                  <b>{x}</b> <span className="rx-level-name">{tx(LEVEL_COPY[x].name, lang)}</span><span>{filtered.filter(t => t.level === x).length}</span>
                </button>
              ))}
            </div>
            <div className="rx-filters" role="group" aria-label={l.filtersLabel}>
              {FILTERS.map(f => {
                const n = count(f);
                if (f !== filter && f !== 'all' && f !== 'starters' && n === 0) return null;
                return <button key={f} type="button" className={filter === f ? 'is-on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f === 'starters' && <ReadOutlined aria-hidden />}{l.filters[f]}<span className="rx-count">{n}</span>
                </button>;
              })}
            </div>
          </div>
          {filter === 'starters' && <p className="rx-list-sub">{l.startSub}</p>}
          <p className="lx-results" aria-live="polite">{l.results(list.length)}</p>
          {groups.length ? groups.map(x => (
            <div key={x} className="rx-level-group">
              <header className="rx-level-heading"><h3><LevelChip level={x} size="sm" /> {tx(LEVEL_COPY[x].name, lang)}</h3></header>
              <ul className="rx-cards">
                {list.filter(t => t.level === x).map(t => <li key={t.id}><TextCard text={t} lang={lang} p={p} /></li>)}
              </ul>
            </div>
          )) : <div className="rx-empty"><p>{l.empty}</p><button type="button" className="lp-btn lp-btn-ghost" onClick={() => { setQuery(''); setLevel('all'); setFilter('all'); }}>{l.resetFilters}</button></div>}
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
