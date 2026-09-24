// Build-time renderer for the public pages (used by scripts/prerender.mjs).
// Runs in Node: no window, no router history, no i18n detection.
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import TopicPage from './components/Landing/TopicPage';
import NotFound from './components/Landing/NotFound';
import { PUBLIC_PAGES, type PublicPage } from './components/Landing/sitePages';

export { PUBLIC_PAGES };

export function render(page: PublicPage): string {
  return renderToString(
    <HelmetProvider>
      <MemoryRouter initialEntries={[page.path]}>
        {page.topic ? <TopicPage topic={page.topic} lang={page.lang} /> : <LandingPage lang={page.lang} />}
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
