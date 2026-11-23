// A practice exercise or a game the visitor may not open yet: its title,
// lock gate, and persuasive Premium information widget when Premium mode is active.
import type { ReactNode } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Crumbs, LearnShell } from '../shell';
import { canOpen, itemTier } from '../access';
import { hubPath } from '../paths';
import { useUnlockedPractice } from '../practice/unlocked';
import type { Lang } from '../types';
import { UI } from '../ui';
import { AccessGate, TierBadge } from './AccessGate';
import { ACCOUNT_COPY } from './copy';
import { PremiumInfoWidget } from './PremiumWidget';
import { effectiveLevel, useAccount } from './store';

export function ItemGate({ lang, itemKey, title, alternates, children }: {
  lang: Lang; itemKey: string; title: string; alternates: Record<Lang, string>; children: ReactNode;
}) {
  const tier = itemTier(itemKey);
  const account = useAccount();
  const access = { ...account.access, level: effectiveLevel(account) };
  const clientAllowed = canOpen(access.level, tier);

  // Non-visitor games also verify entitlement with the server so client config spoofing fails closed.
  const isGatedGame = itemKey.startsWith('game:') && tier !== 'visitor';
  const gameCheck = useUnlockedPractice<null>('game', isGatedGame ? itemKey.slice(5) : '', null, isGatedGame && clientAllowed);
  const allowed = clientAllowed && (!isGatedGame || gameCheck.status === 'ready');

  const c = ACCOUNT_COPY[lang];
  if (isGatedGame && clientAllowed && gameCheck.status === 'loading') {
    return (
      <LearnShell
        lang={lang}
        alternates={alternates}
        seo={{ title: `${title} | Learn French with Natives`, description: title, path: alternates[lang] }}
      >
        <section className="lx-lesson-hero">
          <div className="lp-wrap">
            <p className="ax-opening" role="status"><LoadingOutlined /> {c.checking}</p>
          </div>
        </section>
      </LearnShell>
    );
  }

  if (allowed) return <>{children}</>;

  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{ title: `${title} | Learn French with Natives`, description: `${title}. ${tier === 'premium' ? c.lockItemPremium : c.lockItemFree}`, path: alternates[lang] }}
    >
      <section className="lx-lesson-hero">
        <div className="lp-wrap">
          <Crumbs lang={lang} items={[[UI[lang].learnHome, hubPath(lang)], [title]]} />
          {account.revokedNotice && (
            <p className="ax-revoked-banner" role="status">
              {lang === 'fr'
                ? 'Le mode Premium vient d’être activé. Connectez-vous ou passez à Premium pour continuer cette activité.'
                : 'Premium access was just enabled. Sign in or upgrade your account to continue this activity.'}
            </p>
          )}
          {account.status !== 'unknown' && <p className="lx-lesson-k"><TierBadge lang={lang} tier={tier} level={access.level} /></p>}
          <h1 id="lx-lesson-title">{title}</h1>
          <AccessGate lang={lang} tier={tier} kind="item" />
          {account.mode === 'premium' && (
            <div className="ax-gate-widget">
              <PremiumInfoWidget lang={lang} variant="card" tier={tier} title={title} />
            </div>
          )}
        </div>
      </section>
    </LearnShell>
  );
}
