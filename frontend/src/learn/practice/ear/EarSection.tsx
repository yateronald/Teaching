// The ear-training track on the listening library: compact header, search +
// level filter + grid/list toggle, 4-column sleek acoustic cards, and pagination
// so 70 courses stay scannable and fast.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppstoreOutlined, ArrowRightOutlined, BarsOutlined, CheckCircleFilled,
  CloseOutlined, CrownFilled, DownOutlined, LockOutlined, SearchOutlined, SoundOutlined, UpOutlined,
} from '@ant-design/icons';
import { itemTier } from '../../access';
import { openPremiumModal } from '../../account/premiumModal';
import { LockActionPill } from '../../account/PremiumWidget';
import { isTierLocked, useAccount } from '../../account/store';
import { LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { EARC } from './copy';
import { EAR, earPath } from './meta';
import type { EarMeta } from './types';
import { readBest } from './util';
import './ear.css';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const STEP = 12;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const levelBand = (lvl: EarMeta['level']) => (lvl.startsWith('A') ? 'a' : lvl.startsWith('B') ? 'b' : 'c');

export function EarSection({ lang, hidden = false, focused = false }: { lang: Lang; hidden?: boolean; focused?: boolean }) {
  const c = EARC[lang];
  const account = useAccount();
  const mounted = useMounted();
  const best = mounted ? readBest() : {};
  const baseLimit = focused ? 12 : 8;

  const [level, setLevel] = useState<EarMeta['level'] | 'all'>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [limit, setLimit] = useState(baseLimit);

  useEffect(() => { setLimit(focused ? 12 : 8); }, [level, query, focused]);

  const list = useMemo(() => {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    return EAR.filter(e => {
      if (level !== 'all' && e.level !== level) return false;
      if (!terms.length) return true;
      const hay = norm(`${e.title} ${e.sample} ${tx(e.tag, lang)} ${tx(e.summary, lang)} ${e.level}`);
      return terms.every(t => hay.includes(t));
    });
  }, [level, query, lang]);

  const visibleCount = Math.min(list.length, limit);
  const remaining = list.length - visibleCount;
  const searchPh = lang === 'fr' ? 'Chercher un son, une liaison, un thème…' : 'Search sounds, rules, topics…';

  return (
    <section id="ear" className="lp-wrap ear-track" aria-labelledby="ear-track-title" hidden={hidden || undefined}>
      <header className="rxl-sec-head">
        <div className="rxl-sec-head-copy">
          <p className="ear-track-k">{c.trackK}</p>
          <h2 id="ear-track-title">{c.trackTitle[0]} <em>{c.trackTitle[1]}</em></h2>
          <p className="ear-track-intro">{c.trackIntro}</p>
        </div>
        <ol className="rxl-method-strip" aria-label={c.track}>
          {c.method.map(([t, d], k) => (
            <li key={t} title={d}>
              <span>{k + 1}</span>
              <div><b>{t}</b><small>{d}</small></div>
            </li>
          ))}
        </ol>
      </header>

      <div className="rxl-toolbar">
        <div className="rxl-level-pills" role="group" aria-label={c.track}>
          <button type="button" aria-pressed={level === 'all'} className={level === 'all' ? 'is-on' : ''} onClick={() => setLevel('all')}>
            {lang === 'fr' ? 'Tous' : 'All'}<span>{EAR.length}</span>
          </button>
          {levels.filter(l => EAR.some(e => e.level === l)).map(l => (
            <button type="button" key={l} aria-pressed={level === l} className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)}>
              <b>{l}</b><span>{EAR.filter(e => e.level === l).length}</span>
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

      {list.length === 0 ? (
        <div className="rxl-empty">
          <p>{lang === 'fr' ? 'Aucun cours ne correspond à votre recherche.' : 'No courses match your search.'}</p>
          <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => { setQuery(''); setLevel('all'); }}>
            {lang === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <>
          <ul className={`ear-cards${view === 'list' ? ' is-compact' : ''}`}>
            {list.map((e, idx) => {
              const hide = mounted && idx >= limit;
              const tier = itemTier(`ear:${e.id}`);
              const locked = isTierLocked(account, tier);
              const href = earPath(e, lang);
              return (
                <li key={e.id} hidden={hide || undefined}>
                  <Link
                    to={href}
                    onClick={ev => {
                      if (!locked) return;
                      ev.preventDefault();
                      openPremiumModal({ title: e.title, subtitle: tx(e.summary, lang), tier, kind: 'practice', level: e.level, to: href });
                    }}
                    className={`ear-card${locked ? ' ax-locked-card' : ''}`}
                    aria-labelledby={`ear-t-${e.id}`}
                  >
                    <div className="ear-card-visual" data-band={levelBand(e.level)} aria-hidden>
                      <LevelChip level={e.level} size="sm" />
                      {locked ? (tier === 'premium' ? <CrownFilled className="ear-card-ico" /> : <LockOutlined className="ear-card-ico" />) : <SoundOutlined className="ear-card-ico" />}
                      <span className="ear-card-sample" lang="fr">{e.sample}</span>
                    </div>
                    <div className={`ear-card-body${locked ? ' ax-locked-copy' : ''}`}>
                      <p className="ear-card-tag">{tx(e.tag, lang)}</p>
                      <h3 id={`ear-t-${e.id}`} lang="fr">{e.title}</h3>
                      <p className="ear-card-sum">{tx(e.summary, lang)}</p>
                      <div className="ear-card-foot">
                        <span>{c.exercises(e.items)} · {c.minutes(e.minutes)}</span>
                        {locked ? (
                          <LockActionPill lang={lang} tier={tier} compact />
                        ) : best[e.id] !== undefined ? (
                          <span className="ear-card-best"><CheckCircleFilled aria-hidden /> {c.best(best[e.id], e.items)}</span>
                        ) : (
                          <span className="ear-card-go" aria-hidden>{c.start} <ArrowRightOutlined /></span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {list.length > baseLimit && (
            <div className="rxl-pager">
              <div className="rxl-pager-status">
                <span>
                  {lang === 'fr'
                    ? `Affichage de ${visibleCount} sur ${list.length} cours`
                    : `Showing ${visibleCount} of ${list.length} courses`}
                </span>
                <i aria-hidden><b style={{ transform: `scaleX(${visibleCount / list.length})` }} /></i>
              </div>
              <div className="rxl-pager-actions">
                {remaining > 0 ? (
                  <>
                    <button type="button" className="lp-btn lp-btn-ghost lp-btn-sm" onClick={() => setLimit(n => n + STEP)}>
                      {lang === 'fr' ? `Afficher ${Math.min(STEP, remaining)} de plus` : `Show ${Math.min(STEP, remaining)} more`} <DownOutlined />
                    </button>
                    {remaining > STEP && (
                      <button type="button" className="lx-link rxl-pager-all" onClick={() => setLimit(list.length)}>
                        {lang === 'fr' ? `Tout afficher (${list.length})` : `Show all (${list.length})`}
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
  );
}
