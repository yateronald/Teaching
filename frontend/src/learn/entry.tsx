// The doorway to the learning space, in the main bundle (tiny): the space
// itself (pages, player, courses) is a separate download. Before hydrating a
// pre-rendered learning page, main.tsx calls preloadLearn() so React finds the
// same tree as the HTML; the build-time pre-render calls setLearnApp().
import { lazy, Suspense, type ComponentType } from 'react';
import type { Lang } from './types';

type AppComponent = ComponentType<{ lang: Lang }>;
let Loaded: AppComponent | null = null;
const load = () => import('./LearnApp');
const Lazy = lazy(load);

/** Home of the free courses, in each language (the site header links to it). */
export const LEARN_HOME: Record<Lang, string> = { en: '/learn/', fr: '/fr/apprendre/' };

/** Kept here (no imports) so the main bundle does not pull the course catalogue. */
export const isLearnPath = (pathname: string) => pathname === '/learn' || pathname.startsWith('/learn/') || pathname.startsWith('/fr/apprendre');

export function setLearnApp(C: AppComponent) { Loaded = C; }

export async function preloadLearn(pathname: string) {
  const m = await load();
  Loaded = m.default;
  await m.prepareForPath(pathname);
}

export default function LearnEntry({ lang }: { lang: Lang }) {
  const C = Loaded;
  return (
    <Suspense fallback={<div className="app-route-loading" role="status" aria-label="Loading" />}>
      {C ? <C lang={lang} /> : <Lazy lang={lang} />}
    </Suspense>
  );
}
