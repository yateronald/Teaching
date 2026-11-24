// A practice exercise or a game the visitor may not open yet: its title,
// lock gate, and persuasive Premium information widget when Premium mode is active.
import type { ReactNode } from 'react';
import { CrownFilled, LoadingOutlined, LockOutlined } from '@ant-design/icons';
import { Crumbs, LearnShell } from '../shell';
import { canOpen, itemTier } from '../access';
import { imageUrl } from '../categories';
import { absoluteMediaUrl } from '../mediaUrl';
import { hubPath } from '../paths';
import { useUnlockedPractice } from '../practice/unlocked';
import type { Lang } from '../types';
import { UI } from '../ui';
import { AccessGate, TierBadge } from './AccessGate';
import { ACCOUNT_COPY } from './copy';
import { PremiumInfoWidget } from './PremiumWidget';
import { effectiveLevel, useAccount } from './store';

export function ItemGate({ lang, itemKey, title, alternates, image, children }: {
  lang: Lang; itemKey: string; title: string; alternates: Record<Lang, string>; image?: string; children: ReactNode;
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

  const seoImage = image ? absoluteMediaUrl(imageUrl(image)) : undefined;
  const badgeText = tier === 'premium'
    ? (lang === 'fr' ? 'Premium requis' : 'Premium')
    : (lang === 'fr' ? 'Compte gratuit' : 'Free account');

  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{
        title: `${title} | Learn French with Natives`,
        description: `${title}. ${tier === 'premium' ? c.lockItemPremium : c.lockItemFree}`,
        path: alternates[lang],
        ...(seoImage ? { image: seoImage } : {}),
      }}
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
          <div className={image ? 'ax-item-gate-grid' : undefined}>
            <div className="ax-item-gate-copy">
              {account.status !== 'unknown' && <p className="lx-lesson-k"><TierBadge lang={lang} tier={tier} level={access.level} /></p>}
              <h1 id="lx-lesson-title">{title}</h1>
              <AccessGate lang={lang} tier={tier} kind="item" />
            </div>
            {image && (
              <figure className="ax-item-gate-media">
                <img
                  src={imageUrl(image, 1200)}
                  srcSet={`${imageUrl(image, 640)} 640w, ${imageUrl(image, 1200)} 1200w`}
                  sizes="(min-width: 860px) 440px, calc(100vw - 36px)"
                  alt=""
                  width="1200"
                  height="750"
                  fetchPriority="high"
                />
                <span className={`ax-item-gate-badge${tier === 'premium' ? ' is-premium' : ''}`} aria-hidden>
                  {tier === 'premium' ? <CrownFilled /> : <LockOutlined />}
                  <span>{badgeText}</span>
                </span>
              </figure>
            )}
          </div>
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
