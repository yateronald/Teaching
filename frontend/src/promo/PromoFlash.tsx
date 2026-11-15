// The flash: a campaign that comes to the visitor, once, when they show
// interest (see visit.ts), whichever comes first:
//
//  · 30 seconds of reading the site (only while the tab is in front);
//  · a second page, after 10 seconds on it;
//  · half of a long page (two screens or more), after 10 seconds on the site;
//  · on a computer, the mouse leaving for the tabs or the close button.
//
// How it shows: on a computer, a card in the middle of the page; on a phone a
// card that slides up from the bottom and leaves the page visible (Google
// frowns on pop-ups that cover a phone's screen); in the free courses a card
// in the corner, never over an open exercise.
//
// It is shown at most once per visit, and the same campaign not again for
// three days; never to someone who registered, never over another window.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CloseOutlined } from '@ant-design/icons';
import { COPY } from './copy';
import { flashAllowed, forPlace, OFFERS_PATH, rememberFlash, track } from './model';
import { FLASH_RULES, activeMs, canSeeExit, flashReason, readingNow } from './visit';
import { Countdown, Price, Seats, Visual } from './parts';
import { ctaLabel, wordsOf } from './text';
import { usePromo } from './context';

const CHECK_MS = 1000;
/** Phones: the card comes from the bottom instead of the middle of the screen. */
const PHONE = '(max-width: 620px)';

/** True while something else has the visitor's attention: a lesson, a form, a menu. */
const busy = () => document.body.style.overflow === 'hidden' || !!document.querySelector('.lx-overlay, .demo-modal, .pm-sheet');
const isPhone = () => !!window.matchMedia?.(PHONE).matches;

export default function PromoFlash() {
  const { promos, lang, area, open, registered, sheetOpen } = usePromo();
  const c = COPY[lang];
  const candidates = forPlace(promos, 'flash').filter(p => !registered.includes(p.slug));
  const promo = candidates[0] || null;
  const slug = promo?.slug;
  const [shown, setShown] = useState(false);
  const [phone, setPhone] = useState(false);
  const card = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!slug || shown || !flashAllowed(slug)) return;
    let done = false;
    const show = () => {
      if (done || busy() || document.visibilityState === 'hidden') return;
      done = true;
      rememberFlash(slug);
      track(slug, 'view', 'flash');
      setPhone(isPhone());
      setShown(true);
    };
    // Reading time, a second page, half a long page: checked every second and
    // on scrolling. While a lesson or a form is open the check simply waits.
    const check = () => { if (flashReason(readingNow())) show(); };
    const timer = window.setInterval(check, CHECK_MS);
    window.addEventListener('scroll', check, { passive: true });
    // On a computer, the mouse leaving through the top of the window.
    const exit = canSeeExit()
      ? (e: MouseEvent) => { if (!e.relatedTarget && e.clientY <= 0 && activeMs() >= FLASH_RULES.exitMs) show(); }
      : null;
    if (exit) document.addEventListener('mouseout', exit);
    return () => {
      done = true;
      window.clearInterval(timer);
      window.removeEventListener('scroll', check);
      if (exit) document.removeEventListener('mouseout', exit);
    };
  }, [slug, shown]);

  // The centred card behaves as a window: Escape closes it and it takes the focus.
  const centred = area !== 'learn' && !phone;
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
    <div className={`pm-flash pm-t-${promo.theme}${centred ? '' : ' is-corner'}${phone ? ' is-phone' : ''}`} ref={card} tabIndex={-1}
      role={centred ? 'dialog' : 'complementary'} aria-modal={centred ? true : undefined} aria-labelledby="pm-flash-title">
      <button type="button" className="pm-flash-close" onClick={() => setShown(false)} aria-label={c.close}><CloseOutlined /></button>
      <Visual promo={promo} lang={lang} eager>
        {centred && promo.countdown && <div className="pm-visual-bottom"><Countdown promo={promo} lang={lang} /></div>}
      </Visual>
      <div className="pm-flash-body">
        {!centred && <p className="pm-flash-eyebrow">{area === 'learn' ? c.learn.flashTitle : w.badge || c.kinds[promo.kind]}</p>}
        <h2 id="pm-flash-title">{w.title}</h2>
        {w.tagline && <p className="pm-flash-tagline">{w.tagline}</p>}
        <div className="pm-flash-meta">
          {/* The seats left out of the total, and the bar, like the cards of the site. */}
          <Seats promo={promo} lang={lang} />
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
