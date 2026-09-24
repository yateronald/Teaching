// Build-time renderer for the public pages (used by scripts/prerender.mjs).
// Runs in Node: no window, no router history, no i18n detection.
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './components/Landing/NotFound';
import { PUBLIC_PAGES, type PublicPage } from './components/Landing/sitePages';
import { SiteRoutes } from './App';

export { PUBLIC_PAGES };

// Rendered through the same routes as in the browser, so the browser can take
// the HTML over as it is (main.tsx hydrates it) instead of drawing it again.
export function render(page: PublicPage): string {
  return renderToString(
    <HelmetProvider>
      <MemoryRouter initialEntries={[page.path]}>
        <SiteRoutes />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

/** dist/404.html: what the server sends, with a 404 status, for an unknown address. */
export function renderNotFound(): string {
  return renderToString(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/404']}>
        <NotFound lang="en" />
      </MemoryRouter>
    </HelmetProvider>,
  );
}
