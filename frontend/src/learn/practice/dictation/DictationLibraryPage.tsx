// /learn/practice/dictation/ and /fr/apprendre/pratique/dictee/: Dictation Studio Library.
// Compact 2-column hero with live Woman & Man studio voice preview, studio toolbar
// (level filter, 4-method filter row, live search, Grid/List view toggle), sleek
// 4-column editorial cards with progressive pagination, and 3-step method strip.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppstoreOutlined, ArrowRightOutlined, AudioOutlined, BarsOutlined,
  CheckOutlined, CloseOutlined, CustomerServiceOutlined, DownOutlined,
  EditOutlined, FormOutlined, PlayCircleFilled, SafetyCertificateOutlined,
  SearchOutlined, SoundOutlined, SwapOutlined, UpOutlined,
} from '@ant-design/icons';
import { imageUrl } from '../../categories';
import { speak, stop, usePlaying } from '../../audio';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip, useMounted } from '../../shell';
import { LEVELS, tx, type Lang, type Level } from '../../types';
import { UI } from '../../ui';
import { P } from '../copy';
import { practicePath } from '../meta';
import { SkillTabs } from '../parts';
import { DICTATIONS, dictationCoursePath, dictationPath } from './catalog';
import { DICT_COPY } from './copy';
import { countWords, formatGrade, readDictationBest } from './diff';
import {
  courseMethod, DICTATION_METHODS, type DictationMethod, type DictationVoice,
} from './types';
import '../practice.css';
import './dictation.css';

const SITE = 'https://www.learnfrenchwithnatives.com';
const SAMPLE_PHRASE = DICTATIONS[0].text;
const HOW_ICONS = [<CustomerServiceOutlined />, <EditOutlined />, <CheckOutlined />];
const PAGE_GRID = 12;
const PAGE_LIST = 16;

function MethodIcon({ method }: { method: DictationMethod }) {
  if (method === 'homophones') return <SwapOutlined aria-hidden />;
  if (method === 'conjugation') return <FormOutlined aria-hidden />;
  if (method === 'exam') return <SafetyCertificateOutlined aria-hidden />;
  return <EditOutlined aria-hidden />;
}

function VoiceSampleButton({ voice, lang }: { voice: DictationVoice; lang: Lang }) {
  const c = DICT_COPY[lang];
  const playing = usePlaying(SAMPLE_PHRASE, voice);
  return (
    <button
      type="button"
      className={`dx-voice-demo${playing ? ' is-playing' : ''}`}
      onClick={() => (playing ? stop() : speak(SAMPLE_PHRASE, { voice }))}
    >
      <span className="dx-voice-demo-ico" aria-hidden>
        {playing ? <SoundOutlined /> : <PlayCircleFilled />}
      </span>
      <span>
        <strong>{c.voiceName[voice]}</strong>
        <small>{playing ? c.playing : (lang === 'fr' ? 'Écouter un extrait' : 'Play sample')}</small>
      </span>
    </button>
  );
}

export default function DictationLibraryPage({ lang }: { lang: Lang }) {
  const c = DICT_COPY[lang];
  const pc = P[lang];
  const ui = UI[lang];
  const mounted = useMounted();

  const [level, setLevel] = useState<Level | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<DictationMethod | 'all'>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [limit, setLimit] = useState(PAGE_GRID);

  const baseLimit = view === 'list' ? PAGE_LIST : PAGE_GRID;

  useEffect(() => () => { stop(); }, []);
  useEffect(() => { setLimit(baseLimit); }, [level, methodFilter, query, baseLimit]);

  const availableLevels = useMemo(
    () => LEVELS.filter(lv => DICTATIONS.some(d => d.level === lv)),
    [],
  );

  const levelScoped = useMemo(
    () => (level === 'all' ? DICTATIONS : DICTATIONS.filter(d => d.level === level)),
    [level],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return levelScoped.filter(d => {
      if (methodFilter !== 'all' && courseMethod(d) !== methodFilter) return false;
      if (!q) return true;
      const hay = [
        d.title,
        d.level,
        c.methodLabel[courseMethod(d)],
        tx(d.subtitle, lang),
        tx(d.theme, lang),
        ...d.focus.map(f => tx(f, lang)),
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [levelScoped, methodFilter, query, lang, c.methodLabel]);

  const visibleCount = mounted ? Math.min(limit, filtered.length) : filtered.length;
  const remaining = Math.max(0, filtered.length - visibleCount);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: c.title.join(' '),
    description: c.metaDescription,
    url: `${SITE}${dictationPath(lang)}`,
    inLanguage: lang,
    isAccessibleForFree: true,
  };

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: dictationPath('en'), fr: dictationPath('fr') }}
      seo={{
        title: c.metaTitle,
        description: c.metaDescription,
        path: dictationPath(lang),
        jsonLd,
        image: `${SITE}${imageUrl(DICTATIONS[0].image)}`,
      }}
    >
      {/* ── Compact 2-Column Dictation Studio Hero ── */}
      <section className="rx-lib-hero" aria-labelledby="dx-lib-title">
        <div className="lp-wrap">
          <div className="rx-hero-bar">
            <Crumbs lang={lang} items={[[ui.learnHome, hubPath(lang)], [pc.crumb, practicePath(lang)], [c.crumb]]} />
            <SkillTabs lang={lang} active="dictation" />
          </div>

          <div className="rxl-hero-grid">
            <div className="rx-lib-copy">
              <p className="lp-eyebrow"><EditOutlined aria-hidden /> {c.eyebrow}</p>
              <h1 id="dx-lib-title">
                {c.title[0]} <em>{c.title[1]}</em> <span className="rx-new">{pc.isNew}</span>
              </h1>
              <p className="lx-hero-sub">{c.intro}</p>
              <ol className="rxl-guide">
                {c.guide.map(step => <li key={step}>{step}</li>)}
              </ol>
            </div>

            <aside className="dx-hero-panel" aria-label={c.voicesTitle}>
              <div className="dx-hero-flag" aria-hidden><i /><i /><i /></div>
              <p className="dx-hero-panel-k"><AudioOutlined aria-hidden /> {c.voicesTitle}</p>
              <p className="dx-hero-panel-sub">{c.voicesSub}</p>
              <div className="dx-voice-demos">
                <VoiceSampleButton voice="f" lang={lang} />
                <VoiceSampleButton voice="m" lang={lang} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Sleek 4-Column Dictation Catalog (Matches Reading & Listening) ── */}
      <section className="dx-lib-sec" aria-labelledby="dx-courses-title">
        <div className="lp-wrap">
          <header className="rxl-sec-head">
            <div className="rxl-sec-head-copy">
              <p className="rxl-sec-k">{lang === 'fr' ? 'Atelier d’orthographe' : 'Spelling studio'}</p>
              <h2 id="dx-courses-title">{c.libraryTitle}</h2>
              <p className="rxm-feature-intro">{c.librarySub}</p>
            </div>
          </header>

          {/* Studio Toolbar: Level pills · Search · Grid / List toggle · Method filter row */}
          <div className="rxl-toolbar">
            <div className="rxl-level-pills" role="group" aria-label={lang === 'fr' ? 'Filtrer par niveau' : 'Filter by level'}>
              <button type="button" className={level === 'all' ? 'is-on' : ''} aria-pressed={level === 'all'} onClick={() => setLevel('all')}>
                {c.allLevels}<span>{DICTATIONS.length}</span>
              </button>
              {availableLevels.map(lv => (
                <button key={lv} type="button" className={level === lv ? 'is-on' : ''} aria-pressed={level === lv} onClick={() => setLevel(lv)}>
                  <b>{lv}</b><span>{DICTATIONS.filter(d => d.level === lv).length}</span>
                </button>
              ))}
            </div>

            <div className="rxl-toolbar-right">
              <label className="rxl-search">
                <SearchOutlined aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={c.searchPh}
                  aria-label={c.searchPh}
                />
                {query && (
                  <button type="button" className="rxl-search-clear" onClick={() => setQuery('')} aria-label={lang === 'fr' ? 'Effacer' : 'Clear'}>
                    <CloseOutlined />
                  </button>
                )}
              </label>

              <div className="rxl-view-toggle" role="group" aria-label={lang === 'fr' ? 'Affichage' : 'View'}>
                <button type="button" className={view === 'grid' ? 'is-on' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                  <AppstoreOutlined /><span>{lang === 'fr' ? 'Grille' : 'Grid'}</span>
                </button>
                <button type="button" className={view === 'list' ? 'is-on' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>
                  <BarsOutlined /><span>{lang === 'fr' ? 'Liste' : 'List'}</span>
                </button>
              </div>
            </div>

            <div className="rx-status-row" role="group" aria-label={lang === 'fr' ? 'Filtrer par méthode' : 'Filter by method'}>
              <button
                type="button"
                className={methodFilter === 'all' ? 'is-on' : ''}
                aria-pressed={methodFilter === 'all'}
                onClick={() => setMethodFilter('all')}
              >
                {c.allMethods} <span className="rx-count">{levelScoped.length}</span>
              </button>
              {DICTATION_METHODS.map(m => {
                const cnt = levelScoped.filter(d => courseMethod(d) === m).length;
                if (cnt === 0) return null;
                return (
                  <button
                    key={m}
                    type="button"
                    className={methodFilter === m ? 'is-on' : ''}
                    aria-pressed={methodFilter === m}
                    onClick={() => setMethodFilter(methodFilter === m ? 'all' : m)}
                  >
                    <MethodIcon method={m} /> {c.methodLabel[m]} <span className="rx-count">{cnt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rxl-empty">
              <p>{c.emptySearch}</p>
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setQuery(''); setLevel('all'); setMethodFilter('all'); }}>
                {c.resetFilters}
              </button>
            </div>
          ) : (
            <>
              <ul className={`dx-cards${view === 'list' ? ' is-compact' : ''}`}>
                {filtered.map((d, idx) => {
                  const hide = mounted && idx >= limit;
                  const words = countWords(d.text);
                  const best = mounted ? readDictationBest(d.id) : undefined;
                  const m = courseMethod(d);
                  const to = dictationCoursePath(d, lang);
                  return (
                    <li key={d.id} hidden={hide || undefined}>
                      <Link to={to} className="dx-card" aria-labelledby={`dx-t-${d.id}`}>
                        <div className="dx-card-img">
                          <img
                            src={imageUrl(d.image, 640)}
                            srcSet={`${imageUrl(d.image, 640)} 640w, ${imageUrl(d.image, 1200)} 1200w`}
                            sizes="(min-width: 1120px) 275px, (min-width: 860px) 32vw, (min-width: 540px) 46vw, calc(100vw - 36px)"
                            alt=""
                            width="640"
                            height="360"
                            loading="lazy"
                            decoding="async"
                          />
                          <LevelChip level={d.level} size="sm" />
                          {best ? (
                            <span className="dx-card-best">{c.best(formatGrade(best.grade, lang))}</span>
                          ) : m !== 'story' ? (
                            <span className={`dx-card-method is-${m}`}>
                              <MethodIcon method={m} /> {c.methodShort[m]}
                            </span>
                          ) : null}
                          <span className="dx-card-pill">
                            <SoundOutlined aria-hidden /> {tx(d.theme, lang)} · {lang === 'fr' ? '2 voix' : '2 voices'}
                          </span>
                        </div>

                        <div className="dx-card-body">
                          <p className="dx-card-inline-tag">
                            <MethodIcon method={m} /> {c.methodShort[m]} · {tx(d.theme, lang)}
                          </p>
                          <h3 id={`dx-t-${d.id}`} lang="fr">{d.title}</h3>
                          <p className="dx-card-sub">{tx(d.subtitle, lang)}</p>
                          <p className="dx-card-focus">{d.focus.map(f => tx(f, lang)).join(' · ')}</p>

                          <div className="dx-card-foot">
                            <span className="dx-card-meta">{c.words(words)} · {d.minutes} min</span>
                            <span className="dx-card-go" aria-hidden="true">
                              {best ? c.cardRetry : c.cardStart} <ArrowRightOutlined />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {filtered.length > baseLimit && (
                <div className="rxl-pager">
                  <div className="rxl-pager-status">
                    <span>
                      {lang === 'fr'
                        ? `Affichage de ${visibleCount} sur ${filtered.length} dictées`
                        : `Showing ${visibleCount} of ${filtered.length} dictations`}
                    </span>
                    <i aria-hidden><b style={{ transform: `scaleX(${visibleCount / filtered.length})` }} /></i>
                  </div>
                  <div className="rxl-pager-actions">
                    {remaining > 0 ? (
                      <>
                        <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setLimit(n => n + baseLimit)}>
                          {lang === 'fr' ? `Afficher ${Math.min(baseLimit, remaining)} de plus` : `Show ${Math.min(baseLimit, remaining)} more`} <DownOutlined />
                        </button>
                        {remaining > baseLimit && (
                          <button type="button" className="lx-link rxl-pager-all" onClick={() => setLimit(filtered.length)}>
                            {lang === 'fr' ? `Tout afficher (${filtered.length})` : `Show all (${filtered.length})`}
                          </button>
                        )}
                      </>
                    ) : (
                      <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setLimit(baseLimit)}>
                        {lang === 'fr' ? 'Réduire la liste' : 'Show fewer'} <UpOutlined />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="dx-coming-note">
            <span className="dx-coming-ico" aria-hidden><EditOutlined /></span>
            <div>
              <strong>{c.moreComingTitle}</strong>
              <p>{c.moreComingText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-Step Method ── */}
      <section className="lp-section lp-tint px-how-sec" aria-labelledby="dx-how-title">
        <div className="lp-wrap">
          <header className="px-sec-head">
            <div>
              <p className="rxl-sec-k">{lang === 'fr' ? 'La méthode' : 'The method'}</p>
              <h2 id="dx-how-title">{c.howTitle}</h2>
            </div>
          </header>
          <ol className="rx-how">
            {c.how.map(([title, desc], i) => (
              <li key={title}>
                <span className="rx-how-n" aria-hidden>{HOW_ICONS[i]}</span>
                <strong>{title}</strong>
                <p>{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </LearnShell>
  );
}
