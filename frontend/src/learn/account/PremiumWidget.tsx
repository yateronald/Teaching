// Persuasive Premium upgrade modal & inline advantages cards.
// Shown ONLY when an administrator enables Premium mode AND the current
// visitor/free account does not already hold Premium or staff access.
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOutlined, CheckCircleFilled, CloseOutlined, CrownFilled,
  LockOutlined, SafetyCertificateFilled, UnlockOutlined,
} from '@ant-design/icons';
import type { Tier } from '../access';
import type { Lang } from '../types';
import { PremiumRequest } from './AccessGate';
import { siteApi } from './api';
import { formatPrice, type Offer } from './billingApi';
import { ACCOUNT_COPY } from './copy';
import { accountPath } from './paths';
import {
  closePremiumModal, getPremiumModalCtx, openPremiumModal, subscribePremiumModal,
} from './premiumModal';
import { effectiveLevel, useAccount } from './store';
import './account.css';

const ADVANTAGES: Record<Lang, string[]> = {
  en: [
    'All 464+ French courses & 1,500+ interactive native-voice lessons (A1 → C2)',
    'All 400+ listening labs, everyday dialogues, ear training & reading missions',
    '186 studio-recorded dictations in two native voices (Claire & Thomas) with /20 grading',
    'TCF Canada, TEF Canada & DELF/DALF strategies & timed exam simulations',
    'All 5 interactive French games, adaptive CEFR checkpoints & completion certificates',
    'Instant sync across desktop and mobile — flexible access anytime',
  ],
  fr: [
    'Accès illimité aux 464+ cours et 1 500+ leçons interactives avec voix natives (A1 → C2)',
    '400+ exercices de pratique : dialogues, entraînement de l’oreille, lectures & missions',
    '186 dictées studio enregistrées à deux voix natives (Claire & Thomas) avec note /20',
    'Parcours complets TCF Canada, TEF Canada & DELF/DALF en conditions réelles',
    'Les 5 jeux de français, bilans CECR adaptatifs et certificats de réussite',
    'Progression synchronisée sur ordinateur et mobile — accès immédiat après activation',
  ],
};

let offersCache: Offer[] | null = null;
function usePublicOffers(enabled: boolean): Offer[] {
  const [offers, setOffers] = useState<Offer[]>(offersCache ?? []);
  useEffect(() => {
    if (!enabled || offersCache) return;
    let alive = true;
    siteApi<{ enabled?: boolean; offers?: Offer[] }>('/learn/billing/offers')
      .then(r => {
        const list = Array.isArray(r.offers) ? r.offers : [];
        offersCache = list;
        if (alive) setOffers(list);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [enabled]);
  return offers;
}

const COPY = {
  en: {
    pillPremium: 'Premium account required',
    pillFree: 'Free account required',
    modalUnlock: 'Unlock access to continue',
    modalFreeDesc: 'Create a free account in 30 seconds to unlock Module 1 of all 24 study paths across A1 to C2.',
    modalPremiumDesc: 'Upgrade to Premium to unlock every course, dictation studio, listening lab, mock exam and certificate.',
    advantagesTitle: 'What you get with Premium',
    pricingTitle: 'Plans & immediate activation',
    signUpFree: 'Create a free account',
    signUpPremium: 'Sign up & get Premium',
    signIn: 'I already have an account',
    upgradeNow: 'Choose a Premium plan',
    previewSyllabus: 'Preview course outline',
    bannerBadge: 'Premium mode active',
    bannerTitle: 'Unlock all 464+ courses, 186 dictations & TCF/TEF prep',
    bannerFreeSub: 'Module 1 of A1 is open without an account. Create a free account for all 24 Module 1 paths, or go Premium for everything.',
    bannerAccountSub: 'Your free account opens every Module 1. Upgrade to Premium for full access from A1 to C2.',
    bannerCta: 'See Premium & benefits',
    lockPillPremium: 'Premium required',
    lockPillFree: 'Free account',
    cardTitle: 'Unlock the complete course with Premium',
    cardFreeTitle: 'Create a free account to open this module',
    cardSub: 'Get unlimited access to every lesson, audio recording, exercise, final test and certificate.',
    close: 'Close window',
  },
  fr: {
    pillPremium: 'Compte Premium requis',
    pillFree: 'Compte gratuit requis',
    modalUnlock: 'Débloquez l’accès pour continuer',
    modalFreeDesc: 'Créez un compte gratuit en 30 secondes pour ouvrir le Module 1 des 24 parcours de A1 à C2.',
    modalPremiumDesc: 'Passez à Premium pour débloquer tous les cours, dictées, dialogues, simulations d’examen et certificats.',
    advantagesTitle: 'Vos avantages Premium',
    pricingTitle: 'Formules et activation immédiate',
    signUpFree: 'Créer un compte gratuit',
    signUpPremium: 'S’inscrire et passer à Premium',
    signIn: 'J’ai déjà un compte',
    upgradeNow: 'Voir les offres Premium',
    previewSyllabus: 'Voir le programme du cours',
    bannerBadge: 'Accès Premium',
    bannerTitle: 'Débloquez les 464+ cours, 186 dictées et la préparation TCF/TEF',
    bannerFreeSub: 'Le module 1 du A1 est ouvert à tous. Créez un compte gratuit pour les 24 modules 1, ou passez à Premium.',
    bannerAccountSub: 'Votre compte gratuit ouvre chaque Module 1. Passez à Premium pour tout débloquer de A1 à C2.',
    bannerCta: 'Découvrir Premium',
    lockPillPremium: 'Compte Premium requis',
    lockPillFree: 'Compte gratuit requis',
    cardTitle: 'Débloquez l’intégralité du cours avec Premium',
    cardFreeTitle: 'Créez un compte gratuit pour ouvrir ce module',
    cardSub: 'Accédez à toutes les leçons, enregistrements natifs, exercices, tests finaux et certificats.',
    close: 'Fermer la fenêtre',
  },
};

/** Small crisp pill rendered on locked cards instead of "Start →". */
export function LockActionPill({ lang, tier, compact = false }: { lang: Lang; tier: Tier; compact?: boolean }) {
  const c = COPY[lang];
  const premium = tier === 'premium';
  return (
    <span className={`ax-lock-cta${premium ? ' is-premium' : ' is-free'}${compact ? ' is-compact' : ''}`}>
      {premium ? <CrownFilled aria-hidden /> : <LockOutlined aria-hidden />}
      <span>{premium ? c.lockPillPremium : c.lockPillFree}</span>
    </span>
  );
}

/** Inline Premium information + upgrade banner or course card (hidden in Free mode or for Premium/Staff). */
export function PremiumInfoWidget({ lang, variant = 'banner', tier = 'premium', title }: {
  lang: Lang;
  variant?: 'banner' | 'card';
  tier?: Tier;
  title?: string;
}) {
  const account = useAccount();
  const { pathname } = useLocation();
  if (account.mode !== 'premium' || effectiveLevel(account) === 'premium') return null;

  const c = COPY[lang];
  const ac = ACCOUNT_COPY[lang];
  const signedIn = !!account.user;
  const needPremium = tier === 'premium' || signedIn;

  if (variant === 'banner') {
    return (
      <aside className="ax-pw-banner" aria-label={c.bannerBadge}>
        <div className="ax-pw-banner-copy">
          <span className="ax-pw-tag"><CrownFilled aria-hidden /> {c.bannerBadge}</span>
          <strong>{c.bannerTitle}</strong>
          <p>{signedIn ? c.bannerAccountSub : c.bannerFreeSub}</p>
        </div>
        <div className="ax-pw-banner-actions">
          <button
            type="button"
            className="lp-btn lp-btn-primary ax-pw-btn"
            onClick={() => openPremiumModal({
              title: title || c.bannerTitle,
              tier: 'premium',
              to: pathname,
            })}
          >
            <CrownFilled aria-hidden /> {c.bannerCta} <ArrowRightOutlined aria-hidden />
          </button>
          {!signedIn && (
            <Link to={accountPath('signUp', lang, pathname)} className="lp-btn lp-btn-ghost">
              {c.signUpFree}
            </Link>
          )}
        </div>
      </aside>
    );
  }

  return (
    <section className="ax-pw-card" aria-label={c.advantagesTitle}>
      <div className="ax-pw-card-head">
        <span className="ax-pw-tag"><CrownFilled aria-hidden /> {needPremium ? c.pillPremium : c.pillFree}</span>
        <h3>{needPremium ? c.cardTitle : c.cardFreeTitle}</h3>
        <p>{c.cardSub}</p>
      </div>
      <ul className="ax-pw-perks">
        {ADVANTAGES[lang].slice(0, 4).map(item => (
          <li key={item}><CheckCircleFilled aria-hidden /><span>{item}</span></li>
        ))}
      </ul>
      <div className="ax-pw-card-actions">
        {signedIn ? (
          account.payments
            ? (
              <Link to={`${accountPath('account', lang)}#premium`} className="lp-btn lp-btn-primary">
                <CrownFilled aria-hidden /> {c.upgradeNow} <ArrowRightOutlined aria-hidden />
              </Link>
            )
            : <PremiumRequest lang={lang} />
        ) : (
          <>
            <Link to={accountPath('signUp', lang, pathname)} className="lp-btn lp-btn-primary">
              <UnlockOutlined aria-hidden /> {needPremium ? c.signUpPremium : c.signUpFree}
            </Link>
            <Link to={accountPath('signIn', lang, pathname)} className="lp-btn lp-btn-ghost">
              {ac.signIn}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

/** Global modal triggered whenever a visitor/free user clicks a blurred/locked item. */
export function PremiumModalHost({ lang }: { lang: Lang }) {
  const ctx = useSyncExternalStore(subscribePremiumModal, getPremiumModalCtx, () => null);
  const account = useAccount();
  const { pathname } = useLocation();
  const isVisible = Boolean(ctx && account.mode === 'premium' && effectiveLevel(account) !== 'premium');
  const offers = usePublicOffers(Boolean(isVisible && account.payments));

  useEffect(() => {
    if (ctx && !isVisible) {
      closePremiumModal();
      return;
    }
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePremiumModal(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [ctx, isVisible]);

  // Never show when courses are Free for everyone or user already has Premium/Staff.
  if (!isVisible || !ctx) return null;

  const c = COPY[lang];
  const signedIn = !!account.user;
  const needPremium = ctx.tier === 'premium' || signedIn;
  const nextPath = ctx.to || pathname;

  return (
    <div
      className="ax-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ax-premium-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) closePremiumModal(); }}
    >
      <div className="ax-modal">
        <button type="button" className="ax-modal-close" onClick={closePremiumModal} aria-label={c.close}>
          <CloseOutlined />
        </button>

        <div className="ax-modal-hero">
          <div className="ax-modal-pills">
            <span className={`ax-pw-tag${needPremium ? ' is-premium' : ' is-free'}`}>
              {needPremium ? <CrownFilled aria-hidden /> : <LockOutlined aria-hidden />}
              {needPremium ? c.pillPremium : c.pillFree}
            </span>
            {ctx.level && <span className="ax-modal-lvl">{ctx.level}</span>}
          </div>
          <h2 id="ax-premium-modal-title">{ctx.title}</h2>
          <p>{needPremium ? c.modalPremiumDesc : c.modalFreeDesc}</p>
        </div>

        <div className="ax-modal-body">
          <p className="ax-modal-sec-k"><SafetyCertificateFilled aria-hidden /> {c.advantagesTitle}</p>
          <ul className="ax-pw-perks">
            {ADVANTAGES[lang].map(item => (
              <li key={item}><CheckCircleFilled aria-hidden /><span>{item}</span></li>
            ))}
          </ul>

          {offers.length > 0 && needPremium && (
            <div className="ax-modal-offers">
              <p className="ax-modal-sec-k">{c.pricingTitle}</p>
              <div className="ax-offer-grid">
                {offers.slice(0, 3).map(o => (
                  <div key={o.code} className="ax-offer-mini">
                    <strong>{o.name[lang] || o.name.en}</strong>
                    <b>{formatPrice(o.amount, o.currency, lang)}</b>
                    <small>{o.days} {lang === 'fr' ? 'jours' : 'days'}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ax-modal-actions">
            {signedIn ? (
              account.payments
                ? (
                  <Link to={`${accountPath('account', lang)}#premium`} className="lp-btn lp-btn-primary lp-btn-lg" onClick={closePremiumModal}>
                    <CrownFilled aria-hidden /> {c.upgradeNow} <ArrowRightOutlined aria-hidden />
                  </Link>
                )
                : <PremiumRequest lang={lang} />
            ) : (
              <>
                <Link to={accountPath('signUp', lang, nextPath)} className="lp-btn lp-btn-primary lp-btn-lg" onClick={closePremiumModal}>
                  <UnlockOutlined aria-hidden /> {needPremium ? c.signUpPremium : c.signUpFree}
                </Link>
                <Link to={accountPath('signIn', lang, nextPath)} className="lp-btn lp-btn-ghost lp-btn-lg" onClick={closePremiumModal}>
                  {c.signIn}
                </Link>
              </>
            )}
            {ctx.to && ctx.kind === 'course' && ctx.to !== pathname && (
              <Link to={ctx.to} className="ax-modal-preview" onClick={closePremiumModal}>
                {c.previewSyllabus} <ArrowRightOutlined aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
