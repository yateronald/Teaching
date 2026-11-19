// The ear-training track on the listening library: what it trains, its four
// steps, and one card per course showing the phenomenon itself in large type.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { EARC } from './copy';
import { EAR, earPath } from './meta';
import type { EarMeta } from './types';
import { readBest } from './util';
import './ear.css';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function EarSection({ lang }: { lang: Lang }) {
  const c = EARC[lang];
  const mounted = useMounted();
  const best = mounted ? readBest() : {};
  const [level, setLevel] = useState<EarMeta['level'] | 'all'>('all');
  const list = level === 'all' ? EAR : EAR.filter(e => e.level === level);
  return (
    <section className="lp-wrap ear-track" aria-labelledby="ear-track-title">
      <p className="ear-track-k">{c.trackK}</p>
      <h2 id="ear-track-title">{c.trackTitle[0]} <em>{c.trackTitle[1]}</em></h2>
      <p className="ear-track-intro">{c.trackIntro}</p>
      <ol className="ear-track-method">
        {c.method.map(([t, d], k) => <li key={t}><span>{k + 1}</span><b>{t}</b><small>{d}</small></li>)}
      </ol>
      <div className="lx-levels rx-levels ear-track-levels" role="group" aria-label={c.track}>
        <button type="button" aria-pressed={level === 'all'} className={level === 'all' ? 'is-on' : ''} onClick={() => setLevel('all')}>
          {lang === 'fr' ? 'Tous les niveaux' : 'All levels'}<span>{EAR.length}</span>
        </button>
        {levels.filter(l => EAR.some(e => e.level === l)).map(l => (
          <button type="button" key={l} aria-pressed={level === l} className={level === l ? 'is-on' : ''} onClick={() => setLevel(l)}>
            <b>{l}</b><span>{EAR.filter(e => e.level === l).length}</span>
          </button>
        ))}
      </div>
      <ul className="ear-cards">
        {list.map(e => (
          <li key={e.id}>
            <Link to={earPath(e, lang)} className="ear-card" aria-labelledby={`ear-t-${e.id}`}>
              <div className="ear-card-visual" aria-hidden>
                <LevelChip level={e.level} size="sm" />
                <span className="ear-card-sample" lang="fr">{e.sample}</span>
              </div>
              <div className="ear-card-body">
                <p className="ear-card-tag">{tx(e.tag, lang)}</p>
                <h3 id={`ear-t-${e.id}`} lang="fr">{e.title}</h3>
                <p className="ear-card-sum">{tx(e.summary, lang)}</p>
                <div className="ear-card-foot">
                  <span>{c.exercises(e.items)} · {c.minutes(e.minutes)}</span>
                  {best[e.id] !== undefined
                    ? <span className="ear-card-best"><CheckCircleFilled aria-hidden /> {c.best(best[e.id], e.items)}</span>
                    : <span className="ear-card-go" aria-hidden>{c.start} <ArrowRightOutlined /></span>}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
