// A practice exercise or a game the visitor may not open yet: its title and
// the lock card, instead of the exercise. (The exercise's own page is shown
// as soon as the account may open it.)
import type { ReactNode } from 'react';
import { Crumbs, LearnShell } from '../shell';
import { canOpen, itemTier } from '../access';
import { hubPath } from '../paths';
import type { Lang } from '../types';
import { UI } from '../ui';
import { AccessGate, TierBadge } from './AccessGate';
import { ACCOUNT_COPY } from './copy';
import { effectiveLevel, useAccount } from './store';

export function ItemGate({ lang, itemKey, title, alternates, children }: {
  lang: Lang; itemKey: string; title: string; alternates: Record<Lang, string>; children: ReactNode;
}) {
  const tier = itemTier(itemKey);
  const account = useAccount();
  const access = { ...account.access, level: effectiveLevel(account) };
  if (canOpen(access.level, tier)) return <>{children}</>;
  const c = ACCOUNT_COPY[lang];
  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{ title: `${title} | Learn French with Natives`, description: `${title}. ${tier === 'premium' ? c.lockItemPremium : c.lockItemFree}`, path: alternates[lang] }}
    >
      <section className="lx-lesson-hero">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[UI[lang].learnHome, hubPath(lang)], [title]]} />
          {account.status !== 'unknown' && <p className="lx-lesson-k"><TierBadge lang={lang} tier={tier} level={access.level} /></p>}
          <h1 id="lx-lesson-title">{title}</h1>
          <AccessGate lang={lang} tier={tier} kind="item" />
        </div>
      </section>
    </LearnShell>
  );
}
