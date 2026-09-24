// What every public page (home and topic pages) does besides rendering:
// the booking form, the visit count, the language of the rest of the app and
// the scroll position after a link from another page.
import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../utils/siteAnalytics';
import type { Lang } from './landingContent';

// The booking form is only needed after a click: it stays out of the first
// download and is fetched in the background once the page is idle.
const loadDemoModal = () => import('./DemoRequestModal');
const DemoRequestModal = lazy(loadDemoModal);

export function useDemoModal() {
  const [open, setOpen] = useState(false);
  // Mounted on first open and kept, so its success message can outlive the form.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (open) setMounted(true); }, [open]);
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(() => { loadDemoModal(); }) : window.setTimeout(() => { loadDemoModal(); }, 2500);
    return () => { if (!idle) window.clearTimeout(id); };
  }, []);
  const openDemo = useCallback(() => setOpen(true), []);
  const modal = (open || mounted) ? (
    <Suspense fallback={null}>
      <DemoRequestModal isOpen={open} onClose={() => setOpen(false)} />
    </Suspense>
  ) : null;
  return { openDemo, modal };
}

export function usePublicPage(lang: Lang) {
  const { pathname, hash } = useLocation();

  // Count this visit for the monitoring space. No cookie, no identifier that
  // outlives the page (see utils/siteAnalytics).
  useEffect(() => { trackPageView(); }, []);

  // The signed-in app (sign-in first) opens in the language of the page: its
  // translations (i18n.ts) read this key when they load. Not imported here, so
  // the public pages do not download the translation library.
  useEffect(() => {
    try { localStorage.setItem('i18n_lang', lang); } catch { /* storage unavailable */ }
  }, [lang]);

  // A link from another page opens this one at the top, not where the last one
  // was. The first page of the visit keeps what the browser restores on reload.
  useEffect(() => {
    if (firstPage) { firstPage = false; return; }
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
}

let firstPage = true;
