// Unified executive Academy search UI shared by HeroSearch (inline on /learn/)
// and GlobalSearchModal (invoked from AcademyBar / Cmd+K on subpages).
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRightOutlined, BookOutlined, CloseOutlined, CustomerServiceOutlined,
  DownOutlined, EditOutlined, PlayCircleOutlined, ReadOutlined, SearchOutlined,
} from '@ant-design/icons';
import { imageUrl } from '../categories';
import { openPremiumModal } from '../account/premiumModal';
import { LockActionPill } from '../account/PremiumWidget';
import { isTierLocked, useAccount } from '../account/store';
import { STUDY_COPY } from '../studyPath/copy';
import {
  FOCUS_HERO_SEARCH_EVENT,
  filterSearchEntries,
  foldSearch,
  getSearchIndex,
  levelBand,
  modalKindOfSearch,
  searchEntryTier,
  type SearchEntry,
  type SearchKind,
} from '../studyPath/searchIndex';
import { LEVELS, type Lang, type Level } from '../types';

const INITIAL_LIMIT = 20;
const LIMIT_STEP = 30;

const SUGGESTIONS: Record<Lang, string[]> = {
  en: ['Passé composé', 'TCF Canada', 'Subjonctif', 'Dictation', 'Pronunciation', 'Travel'],
  fr: ['Passé composé', 'TCF Canada', 'Subjonctif', 'Dictée', 'Prononciation', 'Voyage'],
};

const KIND_ICON: Record<SearchKind, ReactNode> = {
  course: <BookOutlined />,
  dictation: <EditOutlined />,
  listening: <CustomerServiceOutlined />,
  reading: <ReadOutlined />,
  game: <PlayCircleOutlined />,
};

export interface AcademySearchResultsProps {
  lang: Lang;
  query: string;
  onQueryChange: (next: string) => void;
  kind: SearchKind | 'all';
  onKindChange: (next: SearchKind | 'all') => void;
  lvl: Level | 'all';
  onLvlChange: (next: Level | 'all') => void;
  allEntries: SearchEntry[];
  filtered: SearchEntry[];
  cursor: number;
  onCursorChange: (idx: number) => void;
  onSelect: (item: SearchEntry) => void;
  onClose?: () => void;
  variant: 'inline' | 'modal';
}

export function AcademySearchResults({
  lang,
  query,
  onQueryChange,
  kind,
  onKindChange,
  lvl,
  onLvlChange,
  allEntries,
  filtered,
  cursor,
  onCursorChange,
  onSelect,
  onClose,
  variant,
}: AcademySearchResultsProps) {
  const fr = lang === 'fr';
  const c = STUDY_COPY[lang].search;
  const account = useAccount();
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLimit(INITIAL_LIMIT);
  }, [query, kind, lvl]);

  // Keep active row in view on keyboard navigation
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const activeEl = body.querySelector<HTMLElement>('.acs-item.is-active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [cursor]);

  // Per-kind live counts reflecting current query and level filter
  const kindCounts = useMemo(() => {
    const counts: Record<SearchKind | 'all', number> = {
      all: 0,
      course: 0,
      dictation: 0,
      listening: 0,
      reading: 0,
      game: 0,
    };
    const words = foldSearch(query.trim()).split(/\s+/).filter(Boolean);
    for (const item of allEntries) {
      if (lvl !== 'all' && !item.levels.includes(lvl)) continue;
      if (words.length && !words.every(w => item.haystack.includes(w))) continue;
      counts.all += 1;
      counts[item.kind] += 1;
    }
    return counts;
  }, [allEntries, query, lvl]);

  const kinds: [SearchKind | 'all', string][] = [
    ['all', c.all],
    ['course', c.courses],
    ['dictation', c.dictations],
    ['listening', c.listening],
    ['reading', c.reading],
    ['game', c.games],
  ];

  const cleanQuery = query.trim();
  const visible = filtered.slice(0, limit);
  const remaining = filtered.length - visible.length;

  return (
    <>
      {!cleanQuery && kind === 'all' && lvl === 'all' && (
        <div className="acs-suggestions" aria-label={fr ? 'Recherches populaires' : 'Popular searches'}>
          <span className="acs-sug-label">{fr ? 'Suggestions :' : 'Popular:'}</span>
          {SUGGESTIONS[lang].map(term => (
            <button
              key={term}
              type="button"
              className="acs-sug-chip"
              onClick={() => onQueryChange(term)}
            >
              {term}
            </button>
          ))}
        </div>
      )}

      <div className="acs-filters">
        <div className="acs-pills" role="group" aria-label={c.title}>
          {kinds.map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={kind === k ? 'is-on' : ''}
              aria-pressed={kind === k}
              onClick={() => onKindChange(k)}
            >
              <span>{label}</span>
              <span className="acs-pill-count">{kindCounts[k]}</span>
            </button>
          ))}
        </div>

        <div className="acs-levels" role="group" aria-label={c.allLevels}>
          <button
            type="button"
            className={lvl === 'all' ? 'is-on' : ''}
            aria-pressed={lvl === 'all'}
            onClick={() => onLvlChange('all')}
          >
            {c.all}
          </button>
          {LEVELS.map(lv => (
            <button
              key={lv}
              type="button"
              className={lvl === lv ? 'is-on' : ''}
              aria-pressed={lvl === lv}
              onClick={() => onLvlChange(lv)}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="acs-meta">
        <span>
          {cleanQuery
            ? (fr
              ? `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} pour « ${cleanQuery} »`
              : `${filtered.length} result${filtered.length === 1 ? '' : 's'} for "${cleanQuery}"`)
            : c.results(filtered.length)}
        </span>
        <span className="acs-meta-right">
          {(kind !== 'all' || lvl !== 'all') && (
            <button
              type="button"
              className="acs-reset-inline"
              onClick={() => {
                onKindChange('all');
                onLvlChange('all');
              }}
            >
              {c.reset}
            </button>
          )}
          <span className="acs-tip">{fr ? '↑↓ · Entrée · Échap' : '↑↓ · Enter · Esc'}</span>
          {variant === 'inline' && onClose && (
            <button
              type="button"
              className="acs-close-inline"
              onClick={onClose}
              aria-label={c.close}
              title={c.close}
            >
              <CloseOutlined />
            </button>
          )}
        </span>
      </div>

      <div className="acs-body" ref={bodyRef}>
        {visible.length === 0 ? (
          <div className="acs-empty">
            <span className="acs-empty-ico" aria-hidden><SearchOutlined /></span>
            <p>{c.empty}</p>
            <button
              type="button"
              className="lp-btn lp-btn-ghost lp-btn-sm"
              onClick={() => {
                onQueryChange('');
                onKindChange('all');
                onLvlChange('all');
              }}
            >
              {c.reset}
            </button>
          </div>
        ) : (
          <>
            <ul className="acs-list">
              {visible.map((item, idx) => {
                const tier = searchEntryTier(item.id);
                const locked = isTierLocked(account, tier);
                const band = levelBand(item.levels[0] ?? 'A1');
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      className={`acs-item${idx === cursor ? ' is-active' : ''}`}
                      onMouseEnter={() => onCursorChange(idx)}
                      onClick={e => {
                        if (locked) e.preventDefault();
                        onSelect(item);
                      }}
                    >
                      <div className="acs-thumb" aria-hidden>
                        {item.image ? (
                          <img
                            src={imageUrl(item.image, 640)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width="128"
                            height="80"
                          />
                        ) : (
                          <span className={`acs-thumb-ico is-${item.kind}`}>{KIND_ICON[item.kind]}</span>
                        )}
                      </div>

                      <div className="acs-copy">
                        <div className="acs-row-meta">
                          <span className="acs-sublabel">{item.sublabel}</span>
                          <span className={`acs-lvl ${band}`}>{item.levelLabel}</span>
                          {locked && (
                            <span className="acs-mobile-lock">
                              <LockActionPill lang={lang} tier={tier} compact />
                            </span>
                          )}
                        </div>
                        <strong className="acs-title">{item.title}</strong>
                        <small className="acs-sub">{item.subtitle}</small>
                      </div>

                      <div className="acs-end">
                        {locked
                          ? <LockActionPill lang={lang} tier={tier} compact />
                          : <span className="acs-go" aria-hidden><ArrowRightOutlined /></span>}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {remaining > 0 && (
              <div className="acs-more">
                <button
                  type="button"
                  className="lp-btn lp-btn-ghost lp-btn-sm"
                  onClick={() => setLimit(n => n + LIMIT_STEP)}
                >
                  {fr
                    ? `Afficher ${Math.min(LIMIT_STEP, remaining)} résultats de plus (${remaining} restants)`
                    : `Show ${Math.min(LIMIT_STEP, remaining)} more results (${remaining} left)`}
                  <DownOutlined aria-hidden />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

/** Inline on-page hero search input + responsive executive results popover/panel. */
export function HeroSearch({ lang }: { lang: Lang }) {
  const fr = lang === 'fr';
  const account = useAccount();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Prevent browser focus-bounce right after Escape from immediately re-opening the panel.
  const suppressFocusUntilRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<SearchKind | 'all'>('all');
  const [lvl, setLvl] = useState<Level | 'all'>('all');
  const [cursor, setCursor] = useState(0);

  const index = useMemo(() => getSearchIndex(lang), [lang]);
  const filtered = useMemo(() => filterSearchEntries(index, q, kind, lvl), [index, q, kind, lvl]);

  useEffect(() => {
    setCursor(0);
  }, [q, kind, lvl]);

  // Close inline panel on route navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close panel on outside pointer press or Escape (single capture-phase handler).
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        suppressFocusUntilRef.current = performance.now() + 300;
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onDocKey, true);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onDocKey, true);
    };
  }, [open]);

  const clearSearch = useCallback(() => {
    suppressFocusUntilRef.current = 0;
    setQ('');
    setKind('all');
    setLvl('all');
    setCursor(0);
    setOpen(true);
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Respond to external focus requests (AcademyBar search or Library "Search N activities" button)
  useEffect(() => {
    const onFocusHero = () => {
      suppressFocusUntilRef.current = 0;
      wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setOpen(true);
      window.setTimeout(() => {
        suppressFocusUntilRef.current = 0;
        inputRef.current?.focus({ preventScroll: true });
      }, 120);
    };
    window.addEventListener(FOCUS_HERO_SEARCH_EVENT, onFocusHero);
    return () => window.removeEventListener(FOCUS_HERO_SEARCH_EVENT, onFocusHero);
  }, []);

  const handleSelect = useCallback((item: SearchEntry) => {
    const tier = searchEntryTier(item.id);
    setOpen(false);
    if (isTierLocked(account, tier)) {
      openPremiumModal({
        title: item.title,
        subtitle: item.subtitle,
        tier,
        kind: modalKindOfSearch(item.kind),
        level: item.levelLabel,
        to: item.to,
      });
    } else {
      navigate(item.to);
    }
  }, [account, navigate]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      suppressFocusUntilRef.current = 0;
      if (!open) {
        setOpen(true);
        setCursor(0);
        return;
      }
      const cap = Math.min(filtered.length, INITIAL_LIMIT);
      if (cap > 0) setCursor(n => (n + 1) % cap);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      suppressFocusUntilRef.current = 0;
      if (!open) {
        setOpen(true);
        return;
      }
      const cap = Math.min(filtered.length, INITIAL_LIMIT);
      if (cap > 0) setCursor(n => (n - 1 + cap) % cap);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    suppressFocusUntilRef.current = 0;
    if (!open) {
      setOpen(true);
      inputRef.current?.focus();
      return;
    }
    const hasFilter = q.trim().length > 0 || kind !== 'all' || lvl !== 'all';
    const picked = filtered[cursor] ?? filtered[0];
    if (hasFilter && picked) {
      handleSelect(picked);
    } else {
      inputRef.current?.focus();
    }
  };

  const placeholder = fr
    ? 'Que voulez-vous apprendre ? (ex. Passé composé, TCF, vocabulaire…)'
    : 'What do you want to learn? (e.g., Passé composé, TCF, vocabulary…)';

  return (
    <div id="hero-search" className={`ah-search-wrap${open ? ' is-open' : ''}`} ref={wrapRef}>
      <form className="ah-search" role="search" onSubmit={onFormSubmit}>
        <SearchOutlined className="ah-search-ico" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          className="ah-search-input"
          value={q}
          onFocus={() => {
            if (performance.now() < suppressFocusUntilRef.current) return;
            setOpen(true);
          }}
          onClick={() => {
            suppressFocusUntilRef.current = 0;
            if (!open) setOpen(true);
          }}
          onChange={e => {
            suppressFocusUntilRef.current = 0;
            setQ(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-expanded={open}
          aria-controls="ah-search-panel"
          autoComplete="off"
        />
        {q && (
          <button
            type="button"
            className="ah-search-clear"
            onClick={clearSearch}
            aria-label={fr ? 'Effacer la recherche' : 'Clear search'}
          >
            <CloseOutlined />
          </button>
        )}
        <button type="submit" className="ah-search-btn">
          {fr ? 'Rechercher' : 'Search'}
        </button>
      </form>

      {open && (
        <div
          id="ah-search-panel"
          className="ah-search-panel"
          role="region"
          aria-label={STUDY_COPY[lang].search.title}
        >
          <AcademySearchResults
            lang={lang}
            query={q}
            onQueryChange={next => {
              setQ(next);
              inputRef.current?.focus();
            }}
            kind={kind}
            onKindChange={setKind}
            lvl={lvl}
            onLvlChange={setLvl}
            allEntries={index}
            filtered={filtered}
            cursor={cursor}
            onCursorChange={setCursor}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
            variant="inline"
          />
        </div>
      )}
    </div>
  );
}
