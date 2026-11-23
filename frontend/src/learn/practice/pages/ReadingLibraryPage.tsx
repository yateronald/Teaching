// /learn/practice/reading/ and /fr/apprendre/pratique/lecture/: compact 2-column
// Reading Studio hero, sticky track switcher, 4-column compact Mission & Text
// cards, search + Grid/List view toggles, and smart pagination.
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined, ArrowRightOutlined, BarsOutlined, CheckOutlined,
  ClockCircleOutlined, CloseOutlined, CompassOutlined, CrownFilled, CustomerServiceOutlined,
  DownOutlined, FileTextOutlined, LockOutlined, ReadOutlined, SearchOutlined,
  SoundOutlined, UpOutlined,
} from '@ant-design/icons';
import { itemTier } from '../../access';
import { openPremiumModal } from '../../account/premiumModal';
import { LockActionPill, PremiumInfoWidget } from '../../account/PremiumWidget';
import { isTierLocked, useAccount } from '../../account/store';
import { imageUrl } from '../../categories';
import { absoluteMediaUrl } from '../../mediaUrl';
import { hubPath, placementPath } from '../../paths';
import { useProgress } from '../../progress';
import { Crumbs, LearnShell, LevelChip, TeacherCta, useMounted } from '../../shell';
import { LEVELS, tx, type Lang, type Level } from '../../types';
import { UI } from '../../ui';
import { P } from '../copy';
import { TEXTS, practicePath, readingPath } from '../meta';
import { SkillTabs, TextCard } from '../parts';
import { libraryJsonLd } from '../schema';
import { textStatus } from '../stats';
import { MISSIONS, missionCoverKey, missionPath } from '../missions';
import '../practice.css';
import '../mission.css';

type Filter = 'all' | 'starters' | 'todo' | 'review' | 'done';
type ReadTrack = 'all' | 'missions' | 'texts';
const FILTERS: Filter[] = ['all', 'starters', 'todo', 'review', 'done'];
const HOW_ICONS = [<SoundOutlined />, <CheckOutlined />, <FileTextOutlined />];
const STEP_MISSIONS = 8;
const STEP_TEXTS = 12;

const searchable = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'oe').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export default function ReadingLibraryPage({ lang }: { lang: Lang }) {
  const c = P[lang];
  const l = c.library;
  const ui = UI[lang];
  const account = useAccount();
  const p = useProgress();
  const mounted = useMounted();
  const location = useLocation();

  const [track, setTrack] = useState<ReadTrack>('all');
  useEffect(() => {
    if (location.hash === '#missions') setTrack('missions');
    else if (location.hash === '#texts') setTrack('texts');
  }, [location.hash]);
  const [missionLevel, setMissionLevel] = useState<Level | 'all'>('all');
  const [missionQuery, setMissionQuery] = useState('');
  const [missionView, setMissionView] = useState<'grid' | 'list'>('grid');
  const baseMissionLimit = track === 'missions' ? 8 : 4;
  const [missionLimit, setMissionLimit] = useState(baseMissionLimit);

  const [filter, setFilter] = useState<Filter>('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [query, setQuery] = useState('');
  const [textView, setTextView] = useState<'grid' | 'list'>('grid');
  const baseTextLimit = track === 'texts' ? 12 : 8;
  const [textLimit, setTextLimit] = useState(baseTextLimit);

  useEffect(() => { setMissionLimit(track === 'missions' ? 8 : 4); }, [missionLevel, missionQuery, track]);
  useEffect(() => { setTextLimit(track === 'texts' ? 12 : 8); }, [level, filter, query, track]);

  const levels = useMemo(() => LEVELS.filter(x => TEXTS.some(t => t.level === x)), []);
  const missionLevels = useMemo(() => LEVELS.filter(x => MISSIONS.some(m => m.level === x)), []);
  const starterCount = useMemo(() => TEXTS.filter(t => t.starter).length, []);

  // Missions filtering
  const missions = useMemo(() => {
    const terms = searchable(missionQuery).split(' ').filter(Boolean);
    return MISSIONS.filter(m => {
      if (missionLevel !== 'all' && m.level !== missionLevel) return false;
      if (!terms.length) return true;
      const hay = searchable([tx(m.title, lang), tx(m.summary, lang), m.level].join(' '));
      return terms.every(term => hay.includes(term));
    });
  }, [missionLevel, missionQuery, lang]);

  // Texts filtering
  const matched = useMemo(() => {
    const terms = searchable(query).split(' ').filter(Boolean);
    if (!terms.length) return TEXTS;
    return TEXTS.filter(t => {
      const haystack = searchable([t.title, tx(t.theme, lang), tx(t.subtitle, lang), c.learn.genre[t.genre], t.level].join(' '));
      return terms.every(term => haystack.includes(term));
    });
  }, [query, lang, c]);

  const keep = (f: Filter, t: (typeof TEXTS)[number]) => {
    if (f === 'starters') return !!t.starter;
    if (f === 'all') return true;
    return mounted ? textStatus(p, t).status === f : f === 'todo';
  };
  const matchesLevel = (t: (typeof TEXTS)[number]) => level === 'all' || t.level === level;
  const count = (f: Filter) => matched.filter(t => matchesLevel(t) && keep(f, t)).length;
  const filtered = matched.filter(t => keep(filter, t));
  const list = useMemo(() => {
    const order = Object.fromEntries(LEVELS.map((lv, i) => [lv, i]));
    return filtered.filter(matchesLevel).sort((a, b) => (order[a.level] ?? 0) - (order[b.level] ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, level]);

  const visibleMissions = Math.min(missions.length, missionLimit);
  const remainingMissions = missions.length - visibleMissions;
  const visibleTexts = Math.min(list.length, textLimit);
  const remainingTexts = list.length - visibleTexts;
  const totalAll = MISSIONS.length + TEXTS.length;

  const missionsHidden = mounted && track !== 'all' && track !== 'missions';
  const textsHidden = mounted && track !== 'all' && track !== 'texts';
  const missionSearchPh = lang === 'fr' ? 'Chercher une mission…' : 'Search missions…';

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: readingPath('en'), fr: readingPath('fr') }}
      seo={{
        title: l.metaTitle,
        description: l.metaDescription,
        path: readingPath(lang),
        jsonLd: libraryJsonLd(lang),
        image: absoluteMediaUrl(imageUrl('cat-reading')),
      }}
    >
      {/* ── Compact 2-Column Reading Studio Hero ── */}
      <section className="rx-lib-hero" aria-labelledby="rx-lib-title">
        <div className="lp-wrap">
          <div className="rx-hero-bar">
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [c.crumb, practicePath(lang)], [c.text.eyebrow]]} />
            <SkillTabs lang={lang} active="reading" />
          </div>

          <div className="rxl-hero-grid">
            <div className="rx-lib-copy">
              <p className="lp-eyebrow"><ReadOutlined aria-hidden /> {l.eyebrow}</p>
              <h1 id="rx-lib-title">{l.title[0]} <em>{l.title[1]}</em> <span className="rx-new">{c.isNew}</span></h1>
              <p className="lx-hero-sub">{l.intro}</p>
              <ol className="rxl-guide">
                <li>{lang === 'fr' ? 'Lire et écouter' : 'Read & listen'}</li>
                <li>{lang === 'fr' ? 'Toucher un mot' : 'Tap any word'}</li>
                <li>{lang === 'fr' ? 'Vérifier ses réponses' : 'Check with proof'}</li>
              </ol>
              <details className="rx-more">
                <summary>{l.showMore}<DownOutlined aria-hidden /></summary>
                {l.more.map(x => <p key={x}>{x}</p>)}
              </details>
            </div>

            <aside className="rxl-studio-panel" aria-label={lang === 'fr' ? 'Atelier de lecture' : 'Reading studio tracks'}>
              <p className="rxl-studio-k">
                {lang === 'fr' ? `2 formats · ${totalAll} activités gratuites` : `2 formats · ${totalAll} free activities`}
              </p>
              <ul>
                <li>
                  <button
                    type="button"
                    className={`rxl-studio-row${track === 'missions' ? ' is-on' : ''}`}
                    aria-pressed={track === 'missions'}
                    onClick={() => setTrack(track === 'missions' ? 'all' : 'missions')}
                  >
                    <span className="rxl-studio-ico"><CompassOutlined aria-hidden /></span>
                    <span className="rxl-studio-copy">
                      <strong>{lang === 'fr' ? 'Missions de lecture' : 'Reading missions'}</strong>
                      <small>{lang === 'fr' ? '3 indices, 1 décision · A1–B2' : '3 clues, 1 decision · A1–B2'}</small>
                    </span>
                    <span className="rxl-studio-cnt">{MISSIONS.length}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`rxl-studio-row${track === 'texts' && filter !== 'starters' ? ' is-on' : ''}`}
                    aria-pressed={track === 'texts' && filter !== 'starters'}
                    onClick={() => { setFilter('all'); setTrack(track === 'texts' && filter !== 'starters' ? 'all' : 'texts'); }}
                  >
                    <span className="rxl-studio-ico"><ReadOutlined aria-hidden /></span>
                    <span className="rxl-studio-copy">
                      <strong>{lang === 'fr' ? 'Textes avec audio' : 'Texts with audio'}</strong>
                      <small>{lang === 'fr' ? 'Articles, récits, courriels · A1–C1' : 'Articles, stories, emails · A1–C1'}</small>
                    </span>
                    <span className="rxl-studio-cnt">{TEXTS.length}</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`rxl-studio-row${track === 'texts' && filter === 'starters' ? ' is-on' : ''}`}
                    aria-pressed={track === 'texts' && filter === 'starters'}
                    onClick={() => { setTrack('texts'); setLevel('all'); setFilter(filter === 'starters' && track === 'texts' ? 'all' : 'starters'); }}
                  >
                    <span className="rxl-studio-ico"><CheckOutlined aria-hidden /></span>
                    <span className="rxl-studio-copy">
                      <strong>{l.filters.starters}</strong>
                      <small>{lang === 'fr' ? 'Sélection rapide pour commencer' : 'Quick starter picks'}</small>
                    </span>
                    <span className="rxl-studio-cnt">{starterCount}</span>
                  </button>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Sticky Studio Track Bar ── */}
      <nav className="rxl-track-bar" aria-label={lang === 'fr' ? 'Catégories de lecture' : 'Reading categories'}>
        <div className="lp-wrap rxl-track-bar-in">
          <button type="button" className={track === 'all' ? 'is-on' : ''} aria-pressed={track === 'all'} onClick={() => setTrack('all')}>
            {lang === 'fr' ? 'Tout afficher' : 'All'} <span>{totalAll}</span>
          </button>
          <button type="button" className={track === 'missions' ? 'is-on' : ''} aria-pressed={track === 'missions'} onClick={() => setTrack('missions')}>
            <CompassOutlined aria-hidden /> {lang === 'fr' ? 'Missions de lecture' : 'Reading missions'} <span>{MISSIONS.length}</span>
          </button>
          <button type="button" className={track === 'texts' ? 'is-on' : ''} aria-pressed={track === 'texts'} onClick={() => setTrack('texts')}>
            <ReadOutlined aria-hidden /> {lang === 'fr' ? 'Textes avec audio' : 'Texts with audio'} <span>{TEXTS.length}</span>
          </button>
        </div>
      </nav>

      {/* ── Section 1: Reading Missions (4-column sleek cards + pagination) ── */}
      <section id="missions" className="lp-wrap rxm-feature" aria-labelledby="rxm-feature-title" hidden={missionsHidden || undefined}>
        <header className="rxl-sec-head">
          <div className="rxl-sec-head-copy">
            <p className="rxl-sec-k">{lang === 'fr' ? 'Nouveau · Lecture active' : 'New · Active reading'}</p>
            <h2 id="rxm-feature-title">{lang === 'fr' ? 'Missions de lecture' : 'Reading missions'} <span>{c.isNew}</span></h2>
            <p className="rxm-feature-intro">{lang === 'fr' ? 'Une situation réelle, trois indices à repérer dans des documents et une décision à prendre.' : 'One real situation, three clues to find across documents and a decision to make.'}</p>
          </div>
        </header>

        <div className="rxl-toolbar">
          <div className="rxl-level-pills" role="group" aria-label={lang === 'fr' ? 'Niveaux des missions' : 'Mission levels'}>
            <button type="button" className={missionLevel === 'all' ? 'is-on' : ''} aria-pressed={missionLevel === 'all'} onClick={() => setMissionLevel('all')}>
              {lang === 'fr' ? 'Tous' : 'All'}<span>{MISSIONS.length}</span>
            </button>
            {missionLevels.map(x => (
              <button key={x} type="button" className={missionLevel === x ? 'is-on' : ''} aria-pressed={missionLevel === x} onClick={() => setMissionLevel(x)}>
                <b>{x}</b><span>{MISSIONS.filter(m => m.level === x).length}</span>
              </button>
            ))}
          </div>

          <div className="rxl-toolbar-right">
            <label className="rxl-search">
              <SearchOutlined aria-hidden />
              <input
                type="search"
                value={missionQuery}
                onChange={e => setMissionQuery(e.target.value)}
                placeholder={missionSearchPh}
                aria-label={missionSearchPh}
              />
              {missionQuery && (
                <button type="button" className="rxl-search-clear" onClick={() => setMissionQuery('')} aria-label={l.clearSearch}>
                  <CloseOutlined />
                </button>
              )}
            </label>
            <div className="rxl-view-toggle" role="group" aria-label={lang === 'fr' ? 'Affichage' : 'View'}>
              <button type="button" className={missionView === 'grid' ? 'is-on' : ''} aria-pressed={missionView === 'grid'} onClick={() => setMissionView('grid')}>
                <AppstoreOutlined /><span>{lang === 'fr' ? 'Grille' : 'Grid'}</span>
              </button>
              <button type="button" className={missionView === 'list' ? 'is-on' : ''} aria-pressed={missionView === 'list'} onClick={() => setMissionView('list')}>
                <BarsOutlined /><span>{lang === 'fr' ? 'Liste' : 'List'}</span>
              </button>
            </div>
          </div>
        </div>

        {missions.length === 0 ? (
          <div className="rxl-empty">
            <p>{lang === 'fr' ? 'Aucune mission ne correspond à votre recherche.' : 'No missions match your search.'}</p>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setMissionQuery(''); setMissionLevel('all'); }}>
              {l.resetFilters}
            </button>
          </div>
        ) : (
          <>
            <ul className={`rxm-feature-grid${missionView === 'list' ? ' is-compact' : ''}`}>
              {missions.map((m, idx) => {
                const hide = mounted && idx >= missionLimit;
                const docCount = m.documentCount ?? m.documents.length;
                const tier = itemTier(`mission:${m.id}`);
                const locked = isTierLocked(account, tier);
                const href = missionPath(m, lang);
                const title = tx(m.title, lang);
                return (
                  <li key={m.id} hidden={hide || undefined}>
                    <Link
                      className={`rxm-feature-link${locked ? ' ax-locked-card' : ''}`}
                      to={href}
                      onClick={e => {
                        if (!locked) return;
                        e.preventDefault();
                        openPremiumModal({ title, subtitle: tx(m.summary, lang), tier, kind: 'practice', level: m.level, to: href });
                      }}
                      aria-label={title}
                    >
                      <div className={`rxm-feature-img${locked ? ' ax-locked-media' : ''}`}>
                        <img
                          src={imageUrl(missionCoverKey(m), 640)}
                          srcSet={`${imageUrl(missionCoverKey(m), 640)} 640w, ${imageUrl(missionCoverKey(m), 1200)} 1200w`}
                          sizes="(min-width: 1120px) 275px, (min-width: 860px) 32vw, (min-width: 540px) 46vw, calc(100vw - 36px)"
                          alt=""
                          width="640"
                          height="360"
                          loading="lazy"
                          decoding="async"
                        />
                        {locked && (
                          <div className="ax-locked-veil" aria-hidden>
                            <span className={`ax-locked-veil-badge${tier === 'premium' ? ' is-premium' : ''}`}>
                              {tier === 'premium' ? <CrownFilled /> : <LockOutlined />}
                              {tier === 'premium' ? (lang === 'fr' ? 'Compte Premium requis' : 'Premium required') : (lang === 'fr' ? 'Compte gratuit requis' : 'Free account')}
                            </span>
                          </div>
                        )}
                        <LevelChip level={m.level} size="sm" />
                        <span className="rxm-tags-pill">
                          <ClockCircleOutlined aria-hidden /> {lang === 'fr' ? `${docCount} étapes` : `${docCount} steps`} · {m.minutes} min
                        </span>
                      </div>
                      <div className={`rxm-feature-copy${locked ? ' ax-locked-copy' : ''}`}>
                        <span className="rxm-tags-inline">
                          {lang === 'fr' ? `${docCount} étapes` : `${docCount} steps`} · {m.minutes} min
                        </span>
                        <h3>{title}</h3>
                        <p>{tx(m.summary, lang)}</p>
                        <div className="rxm-feature-foot">
                          <span>{`${docCount} documents`}</span>
                          {locked
                            ? <LockActionPill lang={lang} tier={tier} compact />
                            : <span className="rxm-feature-cta">{lang === 'fr' ? 'Essayer' : 'Try mission'} <ArrowRightOutlined aria-hidden /></span>}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="lp-wrap"><PremiumInfoWidget lang={lang} variant="banner" /></div>

            {missions.length > baseMissionLimit && (
              <div className="rxl-pager">
                <div className="rxl-pager-status">
                  <span>
                    {lang === 'fr'
                      ? `Affichage de ${visibleMissions} sur ${missions.length} missions`
                      : `Showing ${visibleMissions} of ${missions.length} missions`}
                  </span>
                  <i aria-hidden><b style={{ transform: `scaleX(${visibleMissions / missions.length})` }} /></i>
                </div>
                <div className="rxl-pager-actions">
                  {remainingMissions > 0 ? (
                    <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setMissionLimit(n => n + STEP_MISSIONS)}>
                      {lang === 'fr' ? `Afficher ${Math.min(STEP_MISSIONS, remainingMissions)} de plus` : `Show ${Math.min(STEP_MISSIONS, remainingMissions)} more`} <DownOutlined />
                    </button>
                  ) : (
                    <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setMissionLimit(baseMissionLimit)}>
                      {lang === 'fr' ? 'Réduire' : 'Show fewer'} <UpOutlined />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Section 2: Reading Texts Library (4-column sleek cards + pagination) ── */}
      <section id="texts" className="lp-wrap rx-lib-list" aria-labelledby="rx-all-title" hidden={textsHidden || undefined}>
        <header className="rxl-sec-head">
          <div className="rxl-sec-head-copy">
            <p className="rxl-sec-k">{lang === 'fr' ? 'Bibliothèque · A1–C1' : 'Library · A1–C1'}</p>
            <h2 id="rx-all-title">{filter === 'starters' ? l.startTitle : l.allTitle}</h2>
            {filter === 'starters' && <p className="rx-list-sub">{l.startSub}</p>}
          </div>
        </header>

        <div className="rxl-toolbar">
          <div className="rxl-level-pills" role="group" aria-label={ui.level}>
            <button type="button" className={level === 'all' ? 'is-on' : ''} aria-pressed={level === 'all'} onClick={() => setLevel('all')}>
              {lang === 'fr' ? 'Tous' : 'All'}<span>{filtered.length}</span>
            </button>
            {levels.map(x => (
              <button key={x} type="button" className={level === x ? 'is-on' : ''} aria-pressed={level === x} onClick={() => setLevel(x)}>
                <b>{x}</b><span>{filtered.filter(t => t.level === x).length}</span>
              </button>
            ))}
          </div>

          <div className="rxl-toolbar-right">
            <label className="rxl-search">
              <SearchOutlined aria-hidden />
              <input
                type="search"
                aria-label={l.search}
                placeholder={l.searchPlaceholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="rxl-search-clear" aria-label={l.clearSearch} onClick={() => setQuery('')}>
                  <CloseOutlined aria-hidden />
                </button>
              )}
            </label>
            <div className="rxl-view-toggle" role="group" aria-label={lang === 'fr' ? 'Affichage' : 'View'}>
              <button type="button" className={textView === 'grid' ? 'is-on' : ''} aria-pressed={textView === 'grid'} onClick={() => setTextView('grid')}>
                <AppstoreOutlined /><span>{lang === 'fr' ? 'Grille' : 'Grid'}</span>
              </button>
              <button type="button" className={textView === 'list' ? 'is-on' : ''} aria-pressed={textView === 'list'} onClick={() => setTextView('list')}>
                <BarsOutlined /><span>{lang === 'fr' ? 'Liste' : 'List'}</span>
              </button>
            </div>
          </div>

          <div className="rx-status-row" role="group" aria-label={l.filtersLabel}>
            {FILTERS.map(f => {
              const n = count(f);
              if (f !== filter && f !== 'all' && f !== 'starters' && n === 0) return null;
              return (
                <button key={f} type="button" className={filter === f ? 'is-on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f === 'starters' && <ReadOutlined aria-hidden />}{l.filters[f]}<span className="rx-count">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rxl-empty">
            <p>{l.empty}</p>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setQuery(''); setLevel('all'); setFilter('all'); }}>
              {l.resetFilters}
            </button>
          </div>
        ) : (
          <>
            <ul className={`rx-cards${textView === 'list' ? ' is-compact' : ''}`}>
              {list.map((t, idx) => {
                const hide = mounted && idx >= textLimit;
                return (
                  <li key={t.id} hidden={hide || undefined}>
                    <TextCard text={t} lang={lang} p={p} />
                  </li>
                );
              })}
            </ul>

            {list.length > baseTextLimit && (
              <div className="rxl-pager">
                <div className="rxl-pager-status">
                  <span>
                    {lang === 'fr'
                      ? `Affichage de ${visibleTexts} sur ${list.length} textes`
                      : `Showing ${visibleTexts} of ${list.length} texts`}
                  </span>
                  <i aria-hidden><b style={{ transform: `scaleX(${visibleTexts / list.length})` }} /></i>
                </div>
                <div className="rxl-pager-actions">
                  {remainingTexts > 0 ? (
                    <>
                      <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setTextLimit(n => n + STEP_TEXTS)}>
                        {lang === 'fr' ? `Afficher ${Math.min(STEP_TEXTS, remainingTexts)} de plus` : `Show ${Math.min(STEP_TEXTS, remainingTexts)} more`} <DownOutlined />
                      </button>
                      {remainingTexts > STEP_TEXTS && (
                        <button type="button" className="lx-link rxl-pager-all" onClick={() => setTextLimit(list.length)}>
                          {lang === 'fr' ? `Tout afficher (${list.length})` : `Show all (${list.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setTextLimit(baseTextLimit)}>
                      {lang === 'fr' ? 'Réduire la liste' : 'Show fewer'} <UpOutlined />
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <p className="rx-soon"><CustomerServiceOutlined aria-hidden /> {l.soonText}</p>
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
