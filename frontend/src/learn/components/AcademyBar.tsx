// Persistent Free Academy Navigation Strip + Global 488-Item Instant Search Modal.
// Mounted in LearnShell directly beneath SiteHeader (in document flow so it never
// fights sticky studio bars) across every /learn/ and /fr/apprendre/ page.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined, BookOutlined, CheckCircleOutlined, CloseOutlined,
  CompassOutlined, CustomerServiceOutlined, DownOutlined, EditOutlined,
  PlayCircleOutlined, ReadOutlined, SearchOutlined, ThunderboltOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { CATEGORIES, categoryPath } from '../categories';
import { COURSES } from '../catalog';
import { GAMES, gamesPath } from '../games/meta';
import { LEVEL_COPY, levelPath } from '../levels';
import { hubPath, placementPath, progressPath, resolveLearnPath } from '../paths';
import { TEXTS, practicePath, readingPath } from '../practice/meta';
import { MISSIONS } from '../practice/missions';
import { DIALOGUES } from '../practice/dialogues/meta';
import { EAR } from '../practice/ear/meta';
import { LISTENING, listeningPath } from '../practice/listening/catalog';
import { DICTATIONS, dictationPath } from '../practice/dictation/catalog';
import { LEVELS, tx, type Lang, type Level } from '../types';
import { getStepCompletion, useActivitySnapshot, useStudyPath } from '../studyPath/activityStore';
import { TOTAL_ACADEMY_ITEMS, buildStudyPlan, levelActivityStats } from '../studyPath/builder';
import { COURSE_TRACKS, STUDY_COPY, goalById } from '../studyPath/copy';
import { OPEN_SEARCH_EVENT, foldSearch, getSearchIndex, type SearchKind } from '../studyPath/searchIndex';
import './academy.css';

const KIND_ICON: Record<SearchKind, ReactNode> = {
  course: <BookOutlined />,
  dictation: <EditOutlined />,
  listening: <CustomerServiceOutlined />,
  reading: <ReadOutlined />,
  game: <PlayCircleOutlined />,
};

const levelBand = (lv: Level) => (lv === 'A1' || lv === 'A2' ? 'is-a' : lv === 'B1' || lv === 'B2' ? 'is-b' : 'is-c');

function GlobalSearchModal({ lang, open, onClose }: { lang: Lang; open: boolean; onClose: () => void }) {
  const c = STUDY_COPY[lang].search;
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<SearchKind | 'all'>('all');
  const [lvl, setLvl] = useState<Level | 'all'>('all');
  const [cursor, setCursor] = useState(0);

  const index = useMemo(() => getSearchIndex(lang), [lang]);

  const filtered = useMemo(() => {
    const words = foldSearch(q).split(/\s+/).filter(Boolean);
    return index.filter(item => {
      if (kind !== 'all' && item.kind !== kind) return false;
      if (lvl !== 'all' && !item.levels.includes(lvl)) return false;
      if (!words.length) return true;
      return words.every(w => item.haystack.includes(w));
    });
  }, [index, q, kind, lvl]);

  const visible = filtered.slice(0, 36);

  useEffect(() => {
    if (!open) return;
    setCursor(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [q, kind, lvl]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor(n => (visible.length ? (n + 1) % visible.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor(n => (visible.length ? (n - 1 + visible.length) % visible.length : 0));
      } else if (e.key === 'Enter' && visible[cursor]) {
        e.preventDefault();
        const target = visible[cursor].to;
        onClose();
        navigate(target);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, visible, cursor, onClose, navigate]);

  if (!open) return null;

  const kinds: [SearchKind | 'all', string][] = [
    ['all', c.all],
    ['course', c.courses],
    ['dictation', c.dictations],
    ['listening', c.listening],
    ['reading', c.reading],
    ['game', c.games],
  ];

  return (
    <div
      className="ac-search-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ac-search-dialog">
        <div className="ac-search-head">
          <SearchOutlined className="ac-search-ico" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={c.placeholder}
            aria-label={c.placeholder}
          />
          {q && (
            <button type="button" className="ac-search-clear" onClick={() => setQ('')} aria-label={c.reset}>
              <CloseOutlined />
            </button>
          )}
          <button type="button" className="ac-search-close" onClick={onClose} aria-label={c.close}>
            Esc
          </button>
        </div>

        <div className="ac-search-filters">
          <div className="ac-search-pills" role="group" aria-label={c.title}>
            {kinds.map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={kind === k ? 'is-on' : ''}
                aria-pressed={kind === k}
                onClick={() => setKind(k)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ac-search-levels" role="group" aria-label={c.allLevels}>
            <button type="button" className={lvl === 'all' ? 'is-on' : ''} onClick={() => setLvl('all')}>
              {c.all}
            </button>
            {LEVELS.map(lv => (
              <button key={lv} type="button" className={lvl === lv ? 'is-on' : ''} onClick={() => setLvl(lv)}>
                {lv}
              </button>
            ))}
          </div>
        </div>

        <div className="ac-search-meta">
          <span>{c.results(filtered.length)}</span>
          <span className="ac-search-tip">{c.tip}</span>
        </div>

        <div className="ac-search-body">
          {visible.length === 0 ? (
            <div className="ac-search-empty">
              <p>{c.empty}</p>
              <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setQ(''); setKind('all'); setLvl('all'); }}>
                {c.reset}
              </button>
            </div>
          ) : (
            <ul className="ac-search-list">
              {visible.map((item, idx) => (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    className={`ac-search-item${idx === cursor ? ' is-active' : ''}`}
                    onMouseEnter={() => setCursor(idx)}
                    onClick={onClose}
                  >
                    <span className={`ac-search-kind is-${item.kind}`} aria-hidden>{KIND_ICON[item.kind]}</span>
                    <span className="ac-search-copy">
                      <strong>{item.title}</strong>
                      <small>{item.sublabel} · {item.subtitle}</small>
                    </span>
                    <span className={`ac-search-lvl ${levelBand(item.levels[0] ?? 'A1')}`}>{item.levelLabel}</span>
                    <ArrowRightOutlined className="ac-search-go" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function AcademyBar({ lang, mounted }: { lang: Lang; mounted: boolean }) {
  const c = STUDY_COPY[lang].bar;
  const { pathname } = useLocation();
  const route = useMemo(() => resolveLearnPath(pathname), [pathname]);
  const saved = useStudyPath();
  const snap = useActivitySnapshot();

  const [menu, setMenu] = useState<'levels' | 'library' | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const levelStats = useMemo(() => LEVELS.map(lv => levelActivityStats(lv)), []);

  // Compute active path percentage client-side only (SSR-safe)
  const activeSummary = useMemo(() => {
    if (!mounted) return null;
    const plan = buildStudyPlan(saved.goal, saved.level, lang);
    let done = 0;
    for (const m of plan.modules) {
      for (const s of m.steps) {
        if (getStepCompletion(s, snap, lang).done) done++;
      }
    }
    const pct = plan.totalSteps > 0 ? Math.round((done / plan.totalSteps) * 100) : 0;
    return {
      level: saved.level,
      goalShort: tx(goalById(saved.goal).shortTitle, lang),
      pct,
      picked: saved.picked || done > 0,
    };
  }, [mounted, saved, snap, lang]);

  // Close menus on route change
  useEffect(() => {
    setMenu(null);
  }, [pathname]);

  // Close menus on click outside or Escape; global Ctrl/Cmd+K shortcut
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMenu(null);
        setSearchOpen(prev => !prev);
      } else if (e.key === 'Escape' && menu) {
        setMenu(null);
      }
    };
    const onOpenEvent = () => {
      setMenu(null);
      setSearchOpen(true);
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenEvent);
    };
  }, [menu]);

  const isHub = route.type === 'hub';
  const isLevel = route.type === 'level';
  const isLibraryArea =
    route.type === 'category' ||
    route.type === 'course' ||
    route.type === 'lesson' ||
    route.type === 'final' ||
    route.type === 'practice' ||
    route.type === 'reading' ||
    route.type === 'text' ||
    route.type === 'reading-mission' ||
    route.type === 'listening' ||
    route.type === 'listening-exercise' ||
    route.type === 'ear-course' ||
    route.type === 'dialogue' ||
    route.type === 'dictation' ||
    route.type === 'dictation-course' ||
    route.type === 'games' ||
    route.type === 'game';

  const readingTotal = TEXTS.length + MISSIONS.length;
  const listeningTotal = DIALOGUES.length + EAR.length + LISTENING.length;

  return (
    <>
      <div className="ac-bar" ref={barRef}>
        <div className="lp-wrap ac-bar-in">
          <nav className="ac-nav" aria-label={c.aria}>
            <Link to={hubPath(lang)} className={`ac-link${isHub ? ' is-on' : ''}`}>
              <CompassOutlined aria-hidden />
              <span>{c.studyPath}</span>
            </Link>

            <button
              type="button"
              className={`ac-link ac-drop-btn${isLevel || menu === 'levels' ? ' is-on' : ''}`}
              aria-expanded={menu === 'levels'}
              onClick={() => setMenu(m => (m === 'levels' ? null : 'levels'))}
            >
              <span>{c.byLevel}</span>
              <span className="ac-pill-mini">A1–C2</span>
              <DownOutlined className={`ac-caret${menu === 'levels' ? ' is-open' : ''}`} aria-hidden />
            </button>

            <button
              type="button"
              className={`ac-link ac-drop-btn${isLibraryArea || menu === 'library' ? ' is-on' : ''}`}
              aria-expanded={menu === 'library'}
              onClick={() => setMenu(m => (m === 'library' ? null : 'library'))}
            >
              <span>{c.library}</span>
              <span className="ac-pill-mini">{TOTAL_ACADEMY_ITEMS}</span>
              <DownOutlined className={`ac-caret${menu === 'library' ? ' is-open' : ''}`} aria-hidden />
            </button>

            <Link to={placementPath(lang)} className={`ac-link${route.type === 'placement' ? ' is-on' : ''}`}>
              <ThunderboltOutlined aria-hidden />
              <span>{c.levelTest}</span>
            </Link>

            <Link to={progressPath(lang)} className={`ac-link ac-hide-sm${route.type === 'progress' ? ' is-on' : ''}`}>
              <CheckCircleOutlined aria-hidden />
              <span>{c.progress}</span>
            </Link>
          </nav>

          <div className="ac-right">
            <button
              type="button"
              className="ac-search-btn"
              onClick={() => { setMenu(null); setSearchOpen(true); }}
              aria-label={c.searchPlaceholder}
            >
              <SearchOutlined aria-hidden />
              <span className="ac-search-label">{c.searchPlaceholder}</span>
              <span className="ac-search-short">{c.searchShort}</span>
              <kbd aria-hidden>⌘K</kbd>
            </button>

            {activeSummary && (
              <Link to={hubPath(lang)} className="ac-status-pill" title={`${activeSummary.goalShort} · ${activeSummary.level}`}>
                <span className={`ac-status-lvl ${levelBand(activeSummary.level)}`}>{activeSummary.level}</span>
                <span className="ac-status-pct">{activeSummary.pct}%</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Popover: By CEFR Level (A1–C2) ── */}
        {menu === 'levels' && (
          <div className="ac-popover">
            <div className="lp-wrap ac-pop-in">
              <div className="ac-pop-head">
                <strong>{c.levelMenuTitle}</strong>
                <span>{c.levelMenuSub}</span>
              </div>
              <ul className="ac-lvl-grid">
                {levelStats.map(st => (
                  <li key={st.level}>
                    <Link to={levelPath(st.level, lang)} className={`ac-lvl-card ${levelBand(st.level)}`} onClick={() => setMenu(null)}>
                      <div className="ac-lvl-card-top">
                        <span className={`ac-lvl-badge ${levelBand(st.level)}`}>{st.level}</span>
                        <strong>{tx(LEVEL_COPY[st.level].name, lang)}</strong>
                        <ArrowRightOutlined className="ac-lvl-go" aria-hidden />
                      </div>
                      <p>
                        {st.courses + st.ladder} {lang === 'fr' ? 'cours' : 'courses'} · {st.listening} {lang === 'fr' ? 'écoutes' : 'listening'} · {st.dictations} {lang === 'fr' ? 'dictées' : 'dictations'}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Popover: Free Library (4 Clean Pillars) ── */}
        {menu === 'library' && (
          <div className="ac-popover">
            <div className="lp-wrap ac-pop-in">
              <div className="ac-lib-cols">
                <div className="ac-lib-col is-courses">
                  <p className="ac-pop-k"><BookOutlined aria-hidden /> {c.libraryCourses}</p>
                  <div className="ac-track-grid">
                    {COURSE_TRACKS.map(track => (
                      <div key={track.id} className="ac-track-box">
                        <strong>{tx(track.title, lang)}</strong>
                        <ul>
                          {track.categories.map(catId => {
                            const cat = CATEGORIES.find(x => x.id === catId);
                            if (!cat) return null;
                            const count = COURSES.filter(x => x.category === cat.id).length;
                            return (
                              <li key={cat.id}>
                                <Link to={categoryPath(cat, lang)} onClick={() => setMenu(null)}>
                                  <span>{tx(cat.name, lang)}</span>
                                  <em>{count}</em>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ac-lib-col is-studios">
                  <p className="ac-pop-k"><CustomerServiceOutlined aria-hidden /> {c.libraryPractice}</p>
                  <ul className="ac-studio-list">
                    <li>
                      <Link to={readingPath(lang)} onClick={() => setMenu(null)}>
                        <ReadOutlined />
                        <span>
                          <strong>{c.reading}</strong>
                          <small>{readingTotal} {lang === 'fr' ? 'textes & missions · A1–C1' : 'texts & missions · A1–C1'}</small>
                        </span>
                        <ArrowRightOutlined />
                      </Link>
                    </li>
                    <li>
                      <Link to={listeningPath(lang)} onClick={() => setMenu(null)}>
                        <CustomerServiceOutlined />
                        <span>
                          <strong>{c.listening}</strong>
                          <small>{listeningTotal} {lang === 'fr' ? 'dialogues, oreille & docs · A1–C2' : 'dialogues, ear & docs · A1–C2'}</small>
                        </span>
                        <ArrowRightOutlined />
                      </Link>
                    </li>
                    <li>
                      <Link to={dictationPath(lang)} onClick={() => setMenu(null)}>
                        <EditOutlined />
                        <span>
                          <strong>{c.dictation}</strong>
                          <small>{DICTATIONS.length} {lang === 'fr' ? 'dictées · 4 formats · A1–C2' : 'dictations · 4 methods · A1–C2'}</small>
                        </span>
                        <ArrowRightOutlined />
                      </Link>
                    </li>
                  </ul>

                  <div className="ac-lib-foot-links">
                    <Link to={gamesPath(lang)} className="ac-games-pill" onClick={() => setMenu(null)}>
                      <TrophyOutlined /> {c.libraryGames} ({GAMES.length}) <ArrowRightOutlined />
                    </Link>
                    <Link to={practicePath(lang)} className="ac-all-link" onClick={() => setMenu(null)}>
                      {c.allPractice} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <GlobalSearchModal lang={lang} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
