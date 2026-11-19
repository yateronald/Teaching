// The dialogues track on the listening library: what it trains, its four
// steps, one tab per situation and, in each, its five dialogues (A1 → C1).
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightOutlined, CheckCircleFilled } from '@ant-design/icons';
import { LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { DLGC } from './copy';
import { DIALOGUES, THEMES, dialoguePath } from './meta';
import { DialogueCover, ThemeIcon } from './parts';
import type { ThemeId } from './types';
import { readBest } from './util';
import './dialogues.css';

export function DialogueSection({ lang }: { lang: Lang }) {
  const c = DLGC[lang];
  const mounted = useMounted();
  const best = mounted ? readBest() : {};
  const location = useLocation();
  const from = (location.state as { theme?: ThemeId } | null)?.theme;
  const [theme, setTheme] = useState<ThemeId>(from && THEMES.some(t => t.id === from) ? from : THEMES[0].id);
  const section = useRef<HTMLElement>(null);
  const list = DIALOGUES.filter(d => d.theme === theme);

  // Arriving from a dialogue (« back to the dialogues »): the section, not the top of the page.
  useEffect(() => {
    if (location.hash === '#dialogues') section.current?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  return (
    <section ref={section} id="dialogues" className="lp-wrap dlg-track" aria-labelledby="dlg-track-title">
      <p className="ear-track-k">{c.trackK}</p>
      <h2 id="dlg-track-title">{c.trackTitle[0]} <em>{c.trackTitle[1]}</em></h2>
      <p className="dlg-track-intro">{c.trackIntro}</p>
      <ol className="dlg-track-method">
        {c.method.map(([t, d], k) => <li key={t}><span>{k + 1}</span><b>{t}</b><small>{d}</small></li>)}
      </ol>
      <div className="dlg-themes" role="tablist" aria-label={c.situations}>
        {THEMES.map(t => (
          <button key={t.id} type="button" role="tab" id={`dlg-tab-${t.id}`} aria-selected={theme === t.id} aria-controls="dlg-panel"
            className={theme === t.id ? 'is-on' : ''} onClick={() => setTheme(t.id)}>
            <ThemeIcon theme={t.id} /> {tx(t.name, lang)}
          </button>
        ))}
      </div>
      <ul className="dlg-cards" id="dlg-panel" role="tabpanel" aria-labelledby={`dlg-tab-${theme}`}>
        {list.map((d, k) => (
          <li key={d.id}>
            <Link to={dialoguePath(d, lang)} className="dlg-card" aria-labelledby={`dlg-t-${d.id}`}>
              <div className="dlg-card-img">
                <DialogueCover id={d.id} sizes="(min-width: 1140px) 230px, (min-width: 820px) 31vw, (min-width: 560px) 46vw, calc(100vw - 36px)" />
                <LevelChip level={d.level} size="sm" />
              </div>
              <div className="dlg-card-body">
                <div className="dlg-card-top">
                  <span className="dlg-card-step" aria-hidden>{k + 1}/{list.length}</span>
                  <span className="dlg-card-wave" aria-hidden><i /><i /><i /></span>
                </div>
                <h3 id={`dlg-t-${d.id}`} lang="fr">{d.title}</h3>
                <p className="dlg-card-sum">{tx(d.summary, lang)}</p>
                <div className="dlg-card-foot">
                  {best[d.id] !== undefined
                    ? <span className="ear-card-best"><CheckCircleFilled aria-hidden /> {c.best(...best[d.id])}</span>
                    : <span />}
                  <span className="ear-card-go" aria-hidden>{c.start} <ArrowRightOutlined /></span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
