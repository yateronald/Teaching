// The doorway to the legal pages, in the main bundle (tiny): their long texts
// are a separate download. Before hydrating a pre-rendered legal page,
// main.tsx calls preloadLegal() so React finds the same tree as the HTML; the
// build-time pre-render calls setLegalPage().
import { lazy, Suspense, type ComponentType } from 'react';
import type { Lang } from '../components/Landing/landingContent';
import { LEGAL_PATHS, type LegalKind } from './paths';

type PageComponent = ComponentType<{ kind: LegalKind; lang: Lang }>;
let Loaded: PageComponent | null = null;
const load = () => import('./LegalPage');
const Lazy = lazy(load);

export const isLegalPath = (pathname: string) => {
  const p = pathname.replace(/\/?$/, '/');
  return Object.values(LEGAL_PATHS).some(l => l.en === p || l.fr === p);
};

export function setLegalPage(C: PageComponent) { Loaded = C; }

export async function preloadLegal() {
  Loaded = (await load()).default;
}

export default function LegalEntry({ kind, lang }: { kind: LegalKind; lang: Lang }) {
  const C = Loaded;
  return (
    <Suspense fallback={<div className="app-route-loading" role="status" aria-label="Loading" />}>
      {C ? <C kind={kind} lang={lang} /> : <Lazy kind={kind} lang={lang} />}
    </Suspense>
  );
}
