// Editorial Premium upgrade dialog, inline banners, and lock pills.
// Shown ONLY when an administrator enables Premium mode AND the current
// visitor/free account does not already hold Premium or staff access.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOutlined, CloseOutlined, CrownFilled, LockOutlined, UnlockOutlined,
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

interface HighlightMetric {
  value: string;
  label: string;
  detail: string;
}

const HIGHLIGHTS: Record<Lang, HighlightMetric[]> = {
  en: [
    { value: '464+', label: 'Guided courses (A1 → C2)', detail: '1,500+ interactive lessons with native audio & progress sync' },
    { value: '400+', label: 'Practice & listening labs', detail: 'Everyday dialogues, ear training & reading missions' },
    { value: '186', label: 'Studio dictations /20', detail: 'Recorded in two native voices (Claire & Thomas)' },
    { value: 'Exams', label: 'TCF, TEF & DELF/DALF', detail: 'Exam preparation tracks & verified completion certificates' },
  ],
  fr: [
    { value: '464+', label: 'Cours guidés (A1 → C2)', detail: 'Plus de 1 500 leçons interactives avec voix natives' },
    { value: '400+', label: 'Ateliers de pratique', detail: 'Dialogues quotidiens, entraînement de l’oreille et lectures' },
    { value: '186', label: 'Dictées studio notées /20', detail: 'Enregistrées à deux voix natives (Claire et Thomas)' },
    { value: 'Examens', label: 'TCF, TEF & DELF/DALF', detail: 'Préparation structurée et certificats de réussite' },
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
    pillPremium: 'Premium access',
    pillFree: 'Free account',
    eyebrowPremium: 'Premium membership',
    eyebrowFree: 'Free member access',
    modalFreeTitle: 'Unlock all 24 Module 1 paths free',
    modalPremiumTitle: 'Full access to every course & studio',
    modalFreeDesc: 'Create your free account in under a minute to open the first module of all 24 study paths across A1 to C2.',
    modalPremiumDesc: 'Upgrade to Premium to unlock every lesson, native dictation studio, listening lab, mock exam and certificate.',
    pricingTitle: 'Available plans',
    signUpFree: 'Create a free account',
    signUpPremium: 'Sign up & unlock Premium',
    signIn: 'I already have an account',
    upgradeNow: 'Upgrade to Premium',
    previewSyllabus: 'Preview syllabus',
    bannerBadge: 'Premium access',
    bannerTitle: 'Open all 464+ French courses, 186 dictations & TCF/TEF prep',
    bannerFreeSub: 'A1 Module 1 is open to everyone. Create a free account for all 24 Module 1 tracks, or upgrade for full access.',
    bannerAccountSub: 'Your free account opens every Module 1. Upgrade to Premium to continue seamlessly from A1 to C2.',
    bannerCta: 'Explore Premium',
    lockPillPremium: 'Premium',
    lockPillFree: 'Free account',
    cardTitle: 'Unlock the complete course with Premium',
    cardFreeTitle: 'Create a free account to open this module',
    cardSub: 'Unlimited access to every interactive lesson, native voice recording, final test and certificate.',
    close: 'Close',
    reassurance: 'Instant activation · Cancel or switch anytime',
  },
  fr: {
    pillPremium: 'Accès Premium',
    pillFree: 'Compte gratuit',
    eyebrowPremium: 'Membre Premium',
    eyebrowFree: 'Accès membre gratuit',
    modalFreeTitle: 'Ouvrez les 24 modules 1 gratuitement',
    modalPremiumTitle: 'Accès complet aux cours et ateliers',
    modalFreeDesc: 'Créez votre compte gratuit en moins d’une minute pour débloquer le Module 1 des 24 parcours de A1 à C2.',
    modalPremiumDesc: 'Passez à Premium pour débloquer toutes les leçons, dictées studio, dialogues, entraînements et certificats.',
    pricingTitle: 'Formules disponibles',
    signUpFree: 'Créer un compte gratuit',
    signUpPremium: 'Créer mon compte et continuer',
    signIn: 'J’ai déjà un compte',
    upgradeNow: 'Passer à Premium',
    previewSyllabus: 'Aperçu du programme',
    bannerBadge: 'Accès Premium',
    bannerTitle: 'Accédez aux 464+ cours, 186 dictées studio et parcours TCF/TEF',
    bannerFreeSub: 'Le module 1 A1 est ouvert à tous. Créez un compte gratuit pour les 24 modules 1, ou passez à Premium.',
    bannerAccountSub: 'Votre compte gratuit ouvre chaque Module 1. Passez à Premium pour débloquer tout le programme A1 à C2.',
    bannerCta: 'Découvrir Premium',
    lockPillPremium: 'Premium',
    lockPillFree: 'Compte gratuit',
    cardTitle: 'Débloquez l’intégralité du cours avec Premium',
    cardFreeTitle: 'Créez un compte gratuit pour ouvrir ce module',
    cardSub: 'Accès complet à toutes les leçons, enregistrements natifs, tests finaux et certificats.',
    close: 'Fermer',
    reassurance: 'Activation immédiate · Accès multi-appareils',
  },
};

/** Refined understated lock pill shown on gated cards instead of "Start ->". */
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

/** Inline Premium editorial banner or course card (hidden in Free mode or for Premium/Staff). */
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
  const metrics = HIGHLIGHTS[lang];

  if (variant === 'banner') {
    return (
      <aside className="ax-pw-banner" aria-label={c.bannerBadge}>
        <div className="ax-pw-banner-copy">
          <span className="lp-eyebrow is-light">{c.bannerBadge}</span>
          <strong>{c.bannerTitle}</strong>
          <p>{signedIn ? c.bannerAccountSub : c.bannerFreeSub}</p>
        </div>
        <div className="ax-pw-banner-actions">
          <button
            type="button"
            className="lp-btn lp-btn-light ax-pw-btn"
            onClick={() => openPremiumModal({
              title: title || c.bannerTitle,
              tier: 'premium',
              to: pathname,
            })}
          >
            {c.bannerCta} <ArrowRightOutlined aria-hidden />
          </button>
          {!signedIn && (
            <Link to={accountPath('signUp', lang, pathname)} className="lp-btn ax-pw-ghost-dark">
              {c.signUpFree}
            </Link>
          )}
        </div>
      </aside>
    );
  }

  return (
    <section className="ax-pw-card" aria-label={c.eyebrowPremium}>
      <div className="ax-pw-card-head">
        <span className="lp-eyebrow">{needPremium ? c.eyebrowPremium : c.eyebrowFree}</span>
        <h3>{needPremium ? c.cardTitle : c.cardFreeTitle}</h3>
        <p>{c.cardSub}</p>
      </div>
      <div className="ax-pw-metrics">
        {metrics.map(m => (
          <div key={m.value} className="ax-pw-metric">
            <b>{m.value}</b>
            <strong>{m.label}</strong>
            <span>{m.detail}</span>
          </div>
        ))}
      </div>
      <div className="ax-pw-card-actions">
        {signedIn ? (
          account.payments
            ? (
              <Link to={`${accountPath('account', lang)}#premium`} className="lp-btn lp-btn-primary">
                {c.upgradeNow} <ArrowRightOutlined aria-hidden />
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

/** Global split-panel dialog (desktop) / bottom sheet (mobile) for locked courses & practice. */
export function PremiumModalHost({ lang }: { lang: Lang }) {
  const ctx = useSyncExternalStore(subscribePremiumModal, getPremiumModalCtx, () => null);
  const account = useAccount();
  const { pathname } = useLocation();
  const isVisible = Boolean(ctx && account.mode === 'premium' && effectiveLevel(account) !== 'premium');
  const offers = usePublicOffers(Boolean(isVisible && account.payments));
  const [closing, setClosing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const closeTimerRef = useRef<number | null>(null);

  const requestClose = useCallback(() => {
    if (closeTimerRef.current) return;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setClosing(false);
      closePremiumModal();
    }, 180);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (ctx && !isVisible) {
      closePremiumModal();
      return;
    }
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') requestClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [ctx, isVisible, requestClose]);

  if (!isVisible || !ctx) return null;

  const c = COPY[lang];
  const signedIn = !!account.user;
  const needPremium = ctx.tier === 'premium' || signedIn;
  const nextPath = ctx.to || pathname;
  const metrics = HIGHLIGHTS[lang];
  const activeOfferCode = selectedOffer && offers.some(o => o.code === selectedOffer)
    ? selectedOffer
    : (offers[0]?.code ?? '');

  return (
    <div
      className={`ax-modal-backdrop${closing ? ' is-closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ax-premium-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div className={`ax-modal${closing ? ' is-closing' : ''}`}>
        <div className="ax-sheet-grab" aria-hidden />
        <button type="button" className="ax-modal-close" onClick={requestClose} aria-label={c.close}>
          <CloseOutlined />
        </button>

        <aside className="ax-modal-aside">
          <div className="ax-modal-context">
            <span className="lp-eyebrow is-light">{needPremium ? c.eyebrowPremium : c.eyebrowFree}</span>
            <div className="ax-modal-item">
              {ctx.level && <span className="ax-modal-lvl">{ctx.level}</span>}
              <strong>{ctx.title}</strong>
            </div>
          </div>

          <div className="ax-modal-stats">
            {metrics.map((m, i) => (
              <div key={m.value} className="ax-modal-stat" style={{ '--ax-i': i } as CSSProperties}>
                <b>{m.value}</b>
                <div>
                  <strong>{m.label}</strong>
                  <span>{m.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="ax-modal-foot">{c.reassurance}</p>
        </aside>

        <div className="ax-modal-main">
          <div className="ax-modal-head">
            <span className={`ax-pw-tag${needPremium ? ' is-premium' : ' is-free'}`}>
              {needPremium ? <CrownFilled aria-hidden /> : <LockOutlined aria-hidden />}
              {needPremium ? c.pillPremium : c.pillFree}
            </span>
            <h2 id="ax-premium-modal-title">{needPremium ? c.modalPremiumTitle : c.modalFreeTitle}</h2>
            <p>{needPremium ? c.modalPremiumDesc : c.modalFreeDesc}</p>
          </div>

          {offers.length > 0 && needPremium && (
            <div className="ax-modal-offers">
              <p className="ax-modal-sec-k">{c.pricingTitle}</p>
              <div className="ax-offer-grid">
                {offers.slice(0, 3).map(o => {
                  const active = o.code === activeOfferCode;
                  return (
                    <button
                      type="button"
                      key={o.code}
                      className={`ax-offer-mini${active ? ' is-active' : ''}`}
                      onClick={() => setSelectedOffer(o.code)}
                      aria-pressed={active}
                    >
                      <span>{o.name[lang] || o.name.en}</span>
                      <b>{formatPrice(o.amount, o.currency, lang)}</b>
                      <small>{o.days} {lang === 'fr' ? 'jours' : 'days'}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="ax-modal-actions">
            {signedIn ? (
              account.payments
                ? (
                  <Link
                    to={`${accountPath('account', lang)}#premium`}
                    className="lp-btn lp-btn-primary lp-btn-lg ax-modal-primary"
                    onClick={closePremiumModal}
                  >
                    {c.upgradeNow} <ArrowRightOutlined aria-hidden />
                  </Link>
                )
                : <PremiumRequest lang={lang} />
            ) : (
              <>
                <Link
                  to={accountPath('signUp', lang, nextPath)}
                  className="lp-btn lp-btn-primary lp-btn-lg ax-modal-primary"
                  onClick={closePremiumModal}
                >
                  {needPremium ? c.signUpPremium : c.signUpFree} <ArrowRightOutlined aria-hidden />
                </Link>
                <Link
                  to={accountPath('signIn', lang, nextPath)}
                  className="lp-btn lp-btn-ghost lp-btn-lg"
                  onClick={closePremiumModal}
                >
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
