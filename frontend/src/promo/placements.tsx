// Where the campaigns appear inside the pages: the bar above the header, the
// section of the home page, and the card in the free courses. (The flash and
// the registration sheet float above the page: PromoFlash, PromoSheet.)
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined, CloseOutlined } from '@ant-design/icons';
import { COPY } from './copy';
import { barClosed, bestFor, closeBar, forPlace, OFFERS_PATH, track, type Audience, type Placement, type Promotion } from './model';
import { Countdown, Price, PromoCard, Seats, Visual } from './parts';
import { ctaLabel, wordsOf } from './text';
import { usePromo } from './context';

/** Counts a view of each campaign the first time the element is really on screen. */
function useSeen(promos: (Promotion | null | undefined)[], placement: Placement) {
  const ref = useRef<HTMLDivElement | null>(null);
  const slugs = promos.filter(Boolean).map(p => p!.slug).join('|');
  useEffect(() => {
    const el = ref.current;
    if (!el || !slugs) return;
    const count = () => slugs.split('|').forEach(slug => track(slug, 'view', placement));
    if (!('IntersectionObserver' in window)) { count(); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { count(); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [slugs, placement]);
  return ref;
}

// ── The bar above the header ─────────────────────────────────────────────

/**
 * One line across the top of the page for the most important campaign: its
 * badge, what it is, the time left and a button. `fallback` is what the page
 * shows there when no campaign asks for the bar.
 */
export function PromoBar({ fallback = null }: { fallback?: React.ReactNode }) {
  const { promos, loaded, lang, open, registered } = usePromo();
  const promo = forPlace(promos, 'bar').find(p => !registered.includes(p.slug)) || null;
  const [closed, setClosed] = useState(false);
  useEffect(() => { setClosed(promo ? barClosed(promo.slug) : false); }, [promo]);
  useEffect(() => { if (promo && !closed) track(promo.slug, 'view', 'bar'); }, [promo, closed]);

  if (!loaded || !promo) return <>{fallback}</>;
  if (closed) return null;
  const w = wordsOf(promo, lang);
  const c = COPY[lang];
  return (
    <div className={`pm pm-bar pm-t-${promo.theme}`} role="region" aria-label={c.kinds[promo.kind]}>
      <div className="pm-bar-row">
        <span className="pm-bar-tag">{w.badge || c.kinds[promo.kind]}</span>
        <button type="button" className="pm-bar-text" onClick={() => open(promo, 'bar')}>
          <strong>{w.title}</strong>
          {w.tagline && <span>{w.tagline}</span>}
        </button>
        <Countdown promo={promo} lang={lang} variant="inline" />
        <button type="button" className="pm-bar-cta" onClick={() => open(promo, 'bar')}>{ctaLabel(promo, lang)}<ArrowRightOutlined aria-hidden /></button>
        <button type="button" className="pm-bar-close" onClick={() => { closeBar(promo.slug); setClosed(true); }} aria-label={c.close}><CloseOutlined /></button>
      </div>
    </div>
  );
}

// ── The section of the home page ─────────────────────────────────────────

/** "Upcoming groups and current offers": up to three cards and a link to all of them. Nothing when no campaign is live. */
export function PromoHome() {
  const { promos, lang, open, registered } = usePromo();
  const list = forPlace(promos, 'home').slice(0, 3);
  const ref = useSeen(list, 'home');
  if (!list.length) return null;
  const c = COPY[lang];
  return (
    <section className="lp-section pm-home" aria-labelledby="pm-home-title">
      <div className="lp-wrap" ref={ref}>
        <header className="pm-home-head">
          <div>
            <p className="lp-eyebrow"><span className="pm-live-dot" aria-hidden />{c.home.eyebrow}</p>
            <h2 id="pm-home-title" className="pm-h2">{c.home.title}</h2>
            <p className="pm-home-sub">{c.home.sub}</p>
          </div>
          {promos.length > list.length && <Link to={OFFERS_PATH[lang]} className="pm-link">{c.seeAll(promos.length)}<ArrowRightOutlined aria-hidden /></Link>}
        </header>
        <div className={`pm-grid is-${list.length}`}>
          {list.map(p => (
            <PromoCard key={p.slug} promo={p} lang={lang} variant={list.length === 1 ? 'wide' : 'card'} registered={registered.includes(p.slug)}
              onOpen={promo => open(promo, 'home')} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── The card in the free courses ─────────────────────────────────────────

/**
 * Shown to someone learning for free (course page, end of a lesson, games):
 * the campaign that fits what they are studying. One campaign is named; when
 * several are open, the best one is shown with a link to all of them.
 */
export function PromoNudge({ audience = 'general', compact = false, fallback = null }: { audience?: Audience; compact?: boolean; fallback?: React.ReactNode }) {
  const { promos, loaded, lang, open, registered } = usePromo();
  const list = forPlace(promos, 'learn').filter(p => !registered.includes(p.slug));
  const promo = bestFor(list, audience);
  const ref = useSeen([promo], 'learn');
  if (!loaded || !promo) return <>{fallback}</>;
  const c = COPY[lang];
  const w = wordsOf(promo, lang);
  return (
    <aside className={`pm pm-nudge pm-t-${promo.theme}${compact ? ' is-compact' : ''}`} ref={ref}>
      <Visual promo={promo} lang={lang} />
      <div className="pm-nudge-body">
        <p className="pm-nudge-eyebrow">{list.length > 1 ? c.learn.likedMany(list.length) : c.learn.liked}</p>
        <h3>{w.title}</h3>
        {w.tagline && !compact && <p className="pm-nudge-tagline">{w.tagline}</p>}
        <div className="pm-nudge-meta">
          <Seats promo={promo} lang={lang} bare />
          <Countdown promo={promo} lang={lang} variant="inline" />
        </div>
        <div className="pm-nudge-foot">
          <Price promo={promo} lang={lang} />
          <button type="button" className="pm-cta" onClick={() => open(promo, 'learn')}>{ctaLabel(promo, lang)}<ArrowRightOutlined aria-hidden /></button>
        </div>
        {list.length > 1 && <Link to={OFFERS_PATH[lang]} className="pm-link is-light">{c.seeAll(list.length)}<ArrowRightOutlined aria-hidden /></Link>}
      </div>
    </aside>
  );
}
