// The dialogues track on the listening library: compact header + inline steps,
// balanced 5×2 situation grid, and 5 sleek levelled cards (A1 → C1).
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightOutlined, CheckCircleFilled, CrownFilled, LockOutlined } from '@ant-design/icons';
import { itemTier } from '../../access';
import { openPremiumModal } from '../../account/premiumModal';
import { LockActionPill } from '../../account/PremiumWidget';
import { isTierLocked, useAccount } from '../../account/store';
import { LevelChip, useMounted } from '../../shell';
import { tx, type Lang } from '../../types';
import { DLGC } from './copy';
import { DIALOGUES, THEMES, dialoguePath } from './meta';
import { DialogueCover, ThemeIcon } from './parts';
import type { ThemeId } from './types';
import { readBest } from './util';
import './dialogues.css';

export function DialogueSection({ lang, hidden = false }: { lang: Lang; hidden?: boolean }) {
  const c = DLGC[lang];
  const account = useAccount();
  const mounted = useMounted();
  const best = mounted ? readBest() : {};
  const location = useLocation();
  const from = (location.state as { theme?: ThemeId } | null)?.theme;
  const [theme, setTheme] = useState<ThemeId>(from && THEMES.some(t => t.id === from) ? from : THEMES[0].id);
  const section = useRef<HTMLElement>(null);
  const list = DIALOGUES.filter(d => d.theme === theme);

  // Arriving from a dialogue (« back to the dialogues »): scroll to the section.
  useEffect(() => {
    if (location.hash === '#dialogues') section.current?.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  return (
    <section ref={section} id="dialogues" className="lp-wrap dlg-track" aria-labelledby="dlg-track-title" hidden={hidden || undefined}>
      <header className="rxl-sec-head">
        <div className="rxl-sec-head-copy">
          <p className="ear-track-k">{c.trackK}</p>
          <h2 id="dlg-track-title">{c.trackTitle[0]} <em>{c.trackTitle[1]}</em></h2>
          <p className="dlg-track-intro">{c.trackIntro}</p>
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

      <div className="dlg-themes" role="tablist" aria-label={c.situations}>
        {THEMES.map(t => {
          const items = DIALOGUES.filter(d => d.theme === t.id);
          const done = mounted ? items.filter(d => best[d.id] !== undefined).length : 0;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`dlg-tab-${t.id}`}
              aria-selected={theme === t.id}
              aria-controls="dlg-panel"
              className={theme === t.id ? 'is-on' : ''}
              onClick={() => setTheme(t.id)}
            >
              <ThemeIcon theme={t.id} />
              <span className="dlg-theme-name">{tx(t.name, lang)}</span>
              <span className={`dlg-theme-count${done > 0 ? ' is-done' : ''}`}>
                {done > 0 ? `${done}/${items.length}` : items.length}
              </span>
            </button>
          );
        })}
      </div>

      <ul className="dlg-cards" id="dlg-panel" role="tabpanel" aria-labelledby={`dlg-tab-${theme}`}>
        {list.map((d, k) => {
          const tier = itemTier(`dialogue:${d.id}`);
          const locked = isTierLocked(account, tier);
          const href = dialoguePath(d, lang);
          return (
            <li key={d.id}>
              <Link
                to={href}
                onClick={e => {
                  if (!locked) return;
                  e.preventDefault();
                  openPremiumModal({ title: d.title, subtitle: tx(d.summary, lang), tier, kind: 'practice', level: d.level, to: href });
                }}
                className={`dlg-card${locked ? ' ax-locked-card' : ''}`}
                aria-labelledby={`dlg-t-${d.id}`}
              >
                <div className={`dlg-card-img${locked ? ' ax-locked-media' : ''}`}>
                  <DialogueCover id={d.id} sizes="(min-width: 1140px) 230px, (min-width: 820px) 31vw, (min-width: 560px) 46vw, calc(100vw - 36px)" />
                  {locked && (
                    <div className="ax-locked-veil" aria-hidden>
                      <span className={`ax-locked-veil-badge${tier === 'premium' ? ' is-premium' : ''}`}>
                        {tier === 'premium' ? <CrownFilled /> : <LockOutlined />}
                        {tier === 'premium' ? (lang === 'fr' ? 'Compte Premium requis' : 'Premium required') : (lang === 'fr' ? 'Compte gratuit requis' : 'Free account')}
                      </span>
                    </div>
                  )}
                  <LevelChip level={d.level} size="sm" />
                  <span className="dlg-card-step" aria-hidden>{k + 1}/{list.length}</span>
                </div>
                <div className={`dlg-card-body${locked ? ' ax-locked-copy' : ''}`}>
                  <h3 id={`dlg-t-${d.id}`} lang="fr">{d.title}</h3>
                  <p className="dlg-card-sum">{tx(d.summary, lang)}</p>
                  <div className="dlg-card-foot">
                    {best[d.id] !== undefined
                      ? <span className="ear-card-best"><CheckCircleFilled aria-hidden /> {c.best(...best[d.id])}</span>
                      : <span className="dlg-card-wave" aria-hidden><i /><i /><i /></span>}
                    {locked
                      ? <LockActionPill lang={lang} tier={tier} compact />
                      : <span className="ear-card-go" aria-hidden>{c.start} <ArrowRightOutlined /></span>}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
