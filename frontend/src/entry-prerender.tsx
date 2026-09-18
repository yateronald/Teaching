// Build-time renderer for the public landing page (used by scripts/prerender.mjs).
// Runs in Node: no window, no router history, no i18n detection.
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './components/Landing/LandingPage';
import { PATHS, type Lang } from './components/Landing/landingContent';

export function render(lang: Lang): string {
  return renderToString(
    <HelmetProvider>
      <MemoryRouter initialEntries={[PATHS[lang]]}>
        <LandingPage lang={lang} />
      </MemoryRouter>
    </HelmetProvider>,
  );
}
