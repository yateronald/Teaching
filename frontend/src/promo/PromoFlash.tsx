// The flash: a campaign that comes to the visitor, once.
//
//  · On the pages that present the school it is a card in the middle of the
//    page, after a few seconds of reading or a third of the page.
//  · In the free courses it slides into a corner and never covers the lesson:
//    it waits until no exercise is open.
//
// It is shown at most once per visit, and the same campaign not again for
// three days; never to someone who registered, never over another window.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CloseOutlined } from '@ant-design/icons';
import { COPY } from './copy';
import { flashAllowed, forPlace, OFFERS_PATH, rememberFlash, track } from './model';
import { Countdown, Price, Seats, Visual } from './parts';
import { ctaLabel, wordsOf } from './text';
import { usePromo } from './context';

const SITE_DELAY_MS = 7000;
const LEARN_DELAY_MS = 16000;
const RETRY_MS = 4000;

/** True while something else has the visitor's attention: a lesson, a form, a menu. */
const busy = () => document.body.style.overflow === 'hidden' || !!document.querySelector('.lx-overlay, .demo-modal, .pm-sheet');

export default function PromoFlash() {
  const { promos, lang, area, open, registered, sheetOpen } = usePromo();
  const c = COPY[lang];
  const candidates = forPlace(promos, 'flash').filter(p => !registered.includes(p.slug));
  const promo = candidates[0] || null;
  const slug = promo?.slug;
  const [shown, setShown] = useState(false);
  const card = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slug || shown || !flashAllowed(slug)) return;
    let timer = 0;
    let done = false;
    const show = () => {
      if (done) return;
      if (busy()) { timer = window.setTimeout(show, RETRY_MS); return; }
      done = true;
      rememberFlash(slug);
      track(slug, 'view', 'flash');
      setShown(true);
    };
    timer = window.setTimeout(show, area === 'learn' ? LEARN_DELAY_MS : SITE_DELAY_MS);
    // On a long page, reading a third of it is as good a sign as the seconds.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (area !== 'learn' && max > 600 && window.scrollY / max > 0.33) { window.clearTimeout(timer); show(); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { done = true; window.clearTimeout(timer); window.removeEventListener('scroll', onScroll); };
  }, [slug, area, shown]);

  // The centred card behaves as a window: Escape closes it and it takes the focus.
  const centred = area !== 'learn';
  useEffect(() => {
    if (!shown) return;
    if (centred) card.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShown(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown, centred]);

  if (!shown || !promo || sheetOpen) return null;
  const w = wordsOf(promo, lang);
  const others = promos.length;
  const act = () => { setShown(false); open(promo, 'flash'); };

  const body = (
    <div className={`pm-flash pm-t-${promo.theme}${centred ? '' : ' is-corner'}`} ref={card} tabIndex={-1}
      role={centred ? 'dialog' : 'complementary'} aria-modal={centred ? true : undefined} aria-labelledby="pm-flash-title">
      <button type="button" className="pm-flash-close" onClick={() => setShown(false)} aria-label={c.close}><CloseOutlined /></button>
      <Visual promo={promo} lang={lang} eager>
        {centred && promo.countdown && <div className="pm-visual-bottom"><Countdown promo={promo} lang={lang} /></div>}
      </Visual>
      <div className="pm-flash-body">
        {!centred && <p className="pm-flash-eyebrow">{c.learn.flashTitle}</p>}
        <h2 id="pm-flash-title">{w.title}</h2>
        {w.tagline && <p className="pm-flash-tagline">{w.tagline}</p>}
        <div className="pm-flash-meta">
          <Seats promo={promo} lang={lang} bare />
          {!centred && <Countdown promo={promo} lang={lang} variant="inline" />}
        </div>
        <div className="pm-flash-foot">
          <Price promo={promo} lang={lang} />
          <button type="button" className="pm-cta" onClick={act}>{ctaLabel(promo, lang)}<ArrowRightOutlined aria-hidden /></button>
        </div>
        <div className="pm-flash-links">
          {others > 1 && <Link to={OFFERS_PATH[lang]} className="pm-link" onClick={() => setShown(false)}>{c.seeAll(others)}</Link>}
          <button type="button" className="pm-ghost is-text" onClick={() => setShown(false)}>{c.notNow}</button>
        </div>
      </div>
    </div>
  );

  return centred
    ? <div className="pm pm-flash-back" onMouseDown={e => { if (e.target === e.currentTarget) setShown(false); }}>{body}</div>
    : <div className="pm pm-flash-dock">{body}</div>;
}
