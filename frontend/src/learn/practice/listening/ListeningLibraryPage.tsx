import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppstoreOutlined, ArrowRightOutlined, AudioOutlined, BarsOutlined,
  CloseOutlined, CommentOutlined, CustomerServiceOutlined, DownOutlined,
  SearchOutlined, SoundOutlined, UpOutlined,
} from '@ant-design/icons';
import { hubPath } from '../../paths';
import { Crumbs, LearnShell, LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { practicePath } from '../meta';
import { SkillTabs } from '../parts';
import { LISTENING, exercisePath, listeningPath } from './catalog';
import { ListeningCover } from './ListeningCover';
import { EarSection } from '../ear/EarSection';
import { EAR } from '../ear/meta';
import { DialogueSection } from '../dialogues/DialogueSection';
import { DIALOGUES } from '../dialogues/meta';
import { listeningCopy } from './copy';
import type { ListeningExercise } from './types';
import './listening.css';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type TrackId = 'all' | 'dialogues' | 'ear' | 'docs';
const STEP = 12;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function ListeningLibraryPage({ lang }: { lang: Lang }) {
  const c = listeningCopy[lang];
  const mounted = useMounted();
  const location = useLocation();
  const [track, setTrack] = useState<TrackId>('all');
  const [level, setLevel] = useState<ListeningExercise['level'] | 'all'>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const baseLimit = track === 'docs' ? 12 : 8;
  const [limit, setLimit] = useState(baseLimit);

  useEffect(() => {
    if (location.hash === '#dialogues') setTrack('dialogues');
    else if (location.hash === '#ear') setTrack('ear');
    else if (location.hash === '#documents') setTrack('docs');
  }, [location.hash]);

  useEffect(() => { setLimit(track === 'docs' ? 12 : 8); }, [level, query, track]);

  const lessons = useMemo(() => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    return LISTENING.filter(e => {
      if (level !== 'all' && e.level !== level) return false;
      if (!terms.length) return true;
      const hay = norm(`${e.title} ${tx(e.format, lang)} ${tx(e.summary, lang)} ${e.level}`);
      return terms.every(t => hay.includes(t));
    });
  }, [level, query, lang]);

  const visibleCount = Math.min(lessons.length, limit);
  const remaining = lessons.length - visibleCount;
  const totalAll = DIALOGUES.length + EAR.length + LISTENING.length;

  const tracks: { id: Exclude<TrackId, 'all'>; num: string; title: string; meta: string; count: number; icon: React.ReactNode }[] = [
    {
      id: 'dialogues',
      num: '01',
      title: lang === 'fr' ? 'Dialogues du quotidien' : 'Everyday dialogues',
      meta: lang === 'fr' ? '10 situations · A1–C1' : '10 situations · A1–C1',
      count: DIALOGUES.length,
      icon: <CommentOutlined aria-hidden />,
    },
    {
      id: 'ear',
      num: '02',
      title: lang === 'fr' ? 'Entraîner son oreille' : 'Ear training',
      meta: lang === 'fr' ? 'Sons, liaisons, vitesse · A1–C2' : 'Sounds, linking, speed · A1–C2',
      count: EAR.length,
      icon: <AudioOutlined aria-hidden />,
    },
    {
      id: 'docs',
      num: '03',
      title: lang === 'fr' ? 'Comprendre des documents' : 'Real documents',
      meta: lang === 'fr' ? 'Vocaux, radio, podcasts · A1–C2' : 'Voicemails, radio, podcasts · A1–C2',
      count: LISTENING.length,
      icon: <SoundOutlined aria-hidden />,
    },
  ];

  const selectTrack = (next: TrackId) => {
    setTrack(next);
  };

  const docsHidden = mounted && track !== 'all' && track !== 'docs';
  const searchPh = lang === 'fr' ? 'Chercher un document, un format, un thème…' : 'Search documents, formats, topics…';

  return (
    <LearnShell
      lang={lang}
      alternates={{ en: listeningPath('en'), fr: listeningPath('fr') }}
      seo={{ title: `${c.heading} · ${c.library}`, description: c.intro, path: listeningPath(lang) }}
    >
      {/* ── Compact 2-Column Studio Hero ── */}
      <section className="rx-lib-hero rxl-hero">
        <div className="lp-wrap">
          <div className="rx-hero-bar">
            <Crumbs
              lang={lang}
              items={[
                [lang === 'fr' ? 'Cours gratuits' : 'Free courses', hubPath(lang)],
                [lang === 'fr' ? 'Pratique' : 'Practice', practicePath(lang)],
                [c.library],
              ]}
            />
            <SkillTabs lang={lang} active="listening" />
          </div>

          <div className="rxl-hero-grid">
            <div className="rxl-intro">
              <p className="lp-eyebrow"><CustomerServiceOutlined aria-hidden /> {c.lab} · A1–C2</p>
              <h1>{c.heading}</h1>
              <p className="rxl-hero-sub">{c.intro}</p>
              <ol className="rxl-guide">
                <li>{c.step}</li>
                <li>{c.answer}</li>
                <li>{c.review}</li>
              </ol>
            </div>

            <aside className="rxl-studio-panel" aria-label={lang === 'fr' ? 'Les trois ateliers d’écoute' : 'The three listening tracks'}>
              <p className="rxl-studio-k">
                {lang === 'fr' ? `3 ateliers · ${totalAll} activités gratuites` : `3 tracks · ${totalAll} free activities`}
              </p>
              <ul>
                {tracks.map(t => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={`rxl-studio-row${track === t.id ? ' is-on' : ''}`}
                      onClick={() => selectTrack(track === t.id ? 'all' : t.id)}
                      aria-pressed={track === t.id}
                    >
                      <span className="rxl-studio-ico">{t.icon}</span>
                      <span className="rxl-studio-copy">
                        <strong>{t.title}</strong>
                        <small>{t.meta}</small>
                      </span>
                      <span className="rxl-studio-cnt">{t.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Sticky Track Switcher Bar ── */}
      <nav className="rxl-track-bar" aria-label={lang === 'fr' ? 'Catégories d’écoute' : 'Listening categories'}>
        <div className="lp-wrap rxl-track-bar-in">
          <button type="button" className={track === 'all' ? 'is-on' : ''} aria-pressed={track === 'all'} onClick={() => selectTrack('all')}>
            {lang === 'fr' ? 'Tout afficher' : 'All tracks'} <span>{totalAll}</span>
          </button>
          {tracks.map(t => (
            <button key={t.id} type="button" className={track === t.id ? 'is-on' : ''} aria-pressed={track === t.id} onClick={() => selectTrack(t.id)}>
              {t.icon} {t.title} <span>{t.count}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ── Track 1: Everyday Dialogues ── */}
      <DialogueSection lang={lang} hidden={mounted && track !== 'all' && track !== 'dialogues'} />

      {/* ── Track 2: Ear Training (70 courses, paginated) ── */}
      <EarSection lang={lang} hidden={mounted && track !== 'all' && track !== 'ear'} focused={track === 'ear'} />

      {/* ── Track 3: Real-Life Documents (50 exercises, paginated) ── */}
      <section id="documents" className="lp-wrap rxl-library" aria-labelledby="rxl-docs-title" hidden={docsHidden || undefined}>
        <header className="rxl-sec-head">
          <div className="rxl-sec-head-copy">
            <p className="ear-track-k">{c.docsK}</p>
            <h2 id="rxl-docs-title" className="rxl-docs-title">{c.docsTitle}</h2>
            <p className="rxl-docs-intro">{c.docsIntro}</p>
          </div>
        </header>

        <div className="rxl-toolbar">
          <div className="rxl-level-pills" role="group" aria-label={c.levels}>
            <button type="button" aria-pressed={level === 'all'} className={level === 'all' ? 'is-on' : ''} onClick={() => setLevel('all')}>
              {lang === 'fr' ? 'Tous' : 'All'}<span>{LISTENING.length}</span>
            </button>
            {levels.map(l => (
              <button type="button" key={l} aria-pressed={level === l} className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)}>
                <b>{l}</b><span>{LISTENING.filter(e => e.level === l).length}</span>
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
                placeholder={searchPh}
                aria-label={searchPh}
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
        </div>

        {lessons.length === 0 ? (
          <div className="rxl-empty">
            <p>{lang === 'fr' ? 'Aucun document ne correspond à votre recherche.' : 'No recordings match your search.'}</p>
            <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setQuery(''); setLevel('all'); }}>
              {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <>
            <ul className={`rxl-cards${view === 'list' ? ' is-compact' : ''}`}>
              {lessons.map((e, idx) => {
                const hide = mounted && idx >= limit;
                return (
                  <li key={e.id} hidden={hide || undefined}>
                    <Link className="rxl-card" to={exercisePath(e, lang)} aria-labelledby={`rxl-title-${e.id}`}>
                      <div className="rxl-card-img">
                        <ListeningCover exercise={e} sizes="(min-width: 1120px) 275px, (min-width: 860px) 32vw, (min-width: 560px) 46vw, calc(100vw - 36px)" />
                        <LevelChip level={e.level} size="sm" />
                        <span className="rxl-card-format-pill"><SoundOutlined aria-hidden /> {tx(e.format, lang)}</span>
                      </div>
                      <div className="rxl-card-body">
                        <p className="rxl-card-format-inline"><SoundOutlined aria-hidden /> {tx(e.format, lang)}</p>
                        <h3 id={`rxl-title-${e.id}`} lang="fr">{e.title}</h3>
                        <p className="rxl-card-summary">{tx(e.summary, lang)}</p>
                        <div className="rxl-card-foot">
                          <span>{c.questions(e.count ?? e.questions.length)}</span>
                          <span className="rxl-card-go" aria-hidden="true">{c.start} <ArrowRightOutlined /></span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {lessons.length > baseLimit && (
              <div className="rxl-pager">
                <div className="rxl-pager-status">
                  <span>
                    {lang === 'fr'
                      ? `Affichage de ${visibleCount} sur ${lessons.length} exercices`
                      : `Showing ${visibleCount} of ${lessons.length} exercises`}
                  </span>
                  <i aria-hidden><b style={{ transform: `scaleX(${visibleCount / lessons.length})` }} /></i>
                </div>
                <div className="rxl-pager-actions">
                  {remaining > 0 ? (
                    <>
                      <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setLimit(n => n + STEP)}>
                        {lang === 'fr' ? `Afficher ${Math.min(STEP, remaining)} de plus` : `Show ${Math.min(STEP, remaining)} more`} <DownOutlined />
                      </button>
                      {remaining > STEP && (
                        <button type="button" className="lx-link rxl-pager-all" onClick={() => setLimit(lessons.length)}>
                          {lang === 'fr' ? `Tout afficher (${lessons.length})` : `Show all (${lessons.length})`}
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
      </section>
    </LearnShell>
  );
}
