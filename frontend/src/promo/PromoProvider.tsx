// Brings the live campaigns to a public page: loads them once the page is
// drawn, opens a campaign's sheet (details and registration form), and shows
// the flash. Every placement (bar, home section, free courses, offers page)
// reads the same list from here.
//
// Nothing of this is in the pre-rendered HTML: campaigns change by the hour,
// so they arrive after the page, without moving its content.
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PromoCtx, type Area, type PromoApi } from './context';
import { loadPromotions, registeredSlugs, rememberRegistered, track, type Lang, type Placement, type Promotion } from './model';
import { notePage } from './visit';

const PromoSheet = lazy(() => import('./PromoSheet'));
const PromoFlash = lazy(() => import('./PromoFlash'));

export function PromoProvider({ lang, area = 'site', children }: { lang: Lang; area?: Area; children: React.ReactNode }) {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [registered, setRegistered] = useState<string[]>([]);
  const [sheet, setSheet] = useState<{ promo: Promotion; placement: Placement } | null>(null);
  const { pathname } = useLocation();

  // The visit goes on from page to page: the flash comes when the visitor shows interest.
  useEffect(() => { notePage(pathname); }, [pathname]);

  // After the page is drawn and idle: campaigns never compete with its content.
  useEffect(() => {
    let alive = true;
    const run = () => loadPromotions().then(list => { if (alive) { setPromos(list); setLoaded(true); } });
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const id = idle ? idle(run, { timeout: 1500 }) : window.setTimeout(run, 400);
    setRegistered(registeredSlugs());
    return () => { alive = false; if (!idle) window.clearTimeout(id); };
  }, []);

  // A shared link (…?p=<slug>) opens that campaign at once.
  useEffect(() => {
    if (!loaded) return;
    const slug = new URLSearchParams(window.location.search).get('p');
    const promo = slug ? promos.find(p => p.slug.toLowerCase() === slug.toLowerCase()) : null;
    if (promo) { track(promo.slug, 'view', 'link'); setSheet({ promo, placement: 'link' }); }
  }, [loaded, promos]);

  const open = useCallback((promo: Promotion, placement: Placement) => {
    track(promo.slug, 'click', placement);
    if (promo.registration.mode === 'link' && promo.registration.url) {
      const url = promo.registration.url;
      if (url.startsWith('/')) window.location.assign(url);
      else window.open(url, '_blank', 'noopener');
      return;
    }
    setSheet({ promo, placement });
  }, []);

  const onRegistered = useCallback((slug: string) => {
    rememberRegistered(slug);
    setRegistered(registeredSlugs());
    // The seats left changed: the next page shows the new count.
    loadPromotions(true).then(setPromos);
  }, []);

  const api = useMemo<PromoApi>(() => ({ lang, area, promos, loaded, registered, open, sheetOpen: !!sheet }), [lang, area, promos, loaded, registered, open, sheet]);

  return (
    <PromoCtx.Provider value={api}>
      {children}
      {loaded && promos.length > 0 && (
        <Suspense fallback={null}>
          {area !== 'offers' && <PromoFlash />}
          {sheet && (
            <PromoSheet
              promo={promos.find(p => p.slug === sheet.promo.slug) || sheet.promo}
              placement={sheet.placement}
              lang={lang}
              alreadyRegistered={registered.includes(sheet.promo.slug)}
              onRegistered={onRegistered}
              onClose={() => setSheet(null)}
            />
          )}
        </Suspense>
      )}
    </PromoCtx.Provider>
  );
}
