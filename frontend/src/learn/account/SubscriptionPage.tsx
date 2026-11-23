// Dedicated Subscription & Billing page (/learn/subscription/ & /fr/apprendre/abonnement/).
// Shows current plan status, Premium benefits & comparison, Paystack checkout,
// recurring subscription controls, and real payment history.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOutlined, CheckCircleFilled, CloseOutlined, CrownFilled,
  CustomerServiceOutlined, EditOutlined, LoadingOutlined, LockOutlined,
  ReadOutlined, SafetyCertificateOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import { LearnShell, useMounted } from '../shell';
import { hubPath } from '../paths';
import type { Lang } from '../types';
import { siteApi, type ApiError } from './api';
import { formatPrice, startCheckout, type Offer } from './billingApi';
import { ACCOUNT_COPY, errorText } from './copy';
import { accountPath } from './paths';
import { PremiumRequest } from './AccessGate';
import { loadAccount, useAccount } from './store';
import './account.css';

interface Payment {
  reference: string;
  amount: number;
  currency: string;
  days: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  renewal: boolean;
  name: { en: string | null; fr: string | null };
  premium_until: string | null;
}

interface BillingState {
  enabled: boolean;
  offers: Offer[];
  payments: Payment[];
  subscription: {
    status: string;
    next_payment_date: string | null;
    name: { en: string | null; fr: string | null };
  } | null;
  can_pay?: boolean;
}

interface BenefitMetric {
  value: string;
  label: string;
  detail: string;
  icon: 'courses' | 'listening' | 'dictations' | 'exams';
}

const BENEFITS: Record<Lang, BenefitMetric[]> = {
  en: [
    { value: '464+', label: 'Guided courses (A1 → C2)', detail: '1,500+ structured interactive lessons with native audio, examples & quizzes.', icon: 'courses' },
    { value: '400+', label: 'Practice & listening labs', detail: 'Everyday French dialogues, ear-training drills and real-world reading missions.', icon: 'listening' },
    { value: '186', label: 'Studio dictations scored /20', detail: 'Recorded in two native voices (Claire & Thomas) with instant mistake breakdown.', icon: 'dictations' },
    { value: 'TCF / TEF', label: 'Exam tracks & certificates', detail: 'Dedicated TCF, TEF & DELF/DALF preparation plus verified completion certificates.', icon: 'exams' },
  ],
  fr: [
    { value: '464+', label: 'Cours guidés (A1 → C2)', detail: 'Plus de 1 500 leçons structurées avec audio natif, exemples et quiz.', icon: 'courses' },
    { value: '400+', label: 'Ateliers d’écoute et lecture', detail: 'Dialogues du quotidien, entraînement de l’oreille et textes immersifs.', icon: 'listening' },
    { value: '186', label: 'Dictées studio notées /20', detail: 'Enregistrées à deux voix natives (Claire et Thomas) avec correction détaillée.', icon: 'dictations' },
    { value: 'TCF / TEF', label: 'Examens et certificats', detail: 'Parcours dédiés TCF, TEF & DELF/DALF et certificats de réussite téléchargeables.', icon: 'exams' },
  ],
};

interface CompareRow {
  feature: string;
  free: string | boolean;
  premium: string | boolean;
}

const COMPARE: Record<Lang, CompareRow[]> = {
  en: [
    { feature: 'Module 1 of all 24 study paths (A1–C2)', free: true, premium: true },
    { feature: 'All 464+ full courses & 1,500+ lessons', free: false, premium: true },
    { feature: '186 Native studio dictations graded /20', free: false, premium: true },
    { feature: 'Dialogues, reading missions & ear training', free: 'Selected starters', premium: 'Unlimited' },
    { feature: 'TCF Canada, TEF & DELF/DALF exam tracks', free: false, premium: true },
    { feature: 'Final assessments & completion certificates', free: false, premium: true },
    { feature: 'Cross-device progress synchronization', free: true, premium: true },
  ],
  fr: [
    { feature: 'Module 1 des 24 parcours (A1–C2)', free: true, premium: true },
    { feature: 'Tous les 464+ cours complets et 1 500+ leçons', free: false, premium: true },
    { feature: '186 dictées studio natives notées /20', free: false, premium: true },
    { feature: 'Dialogues, lectures et entraînement auditif', free: 'Découverte', premium: 'Illimité' },
    { feature: 'Parcours TCF Canada, TEF et DELF/DALF', free: false, premium: true },
    { feature: 'Évaluations finales et certificats', free: false, premium: true },
    { feature: 'Synchronisation multi-appareils', free: true, premium: true },
  ],
};

const T = {
  en: {
    seoTitle: 'Premium Subscription',
    seoDesc: 'Compare Free vs Premium, unlock all 464+ French courses and subscribe securely.',
    eyebrow: 'Premium membership',
    heroTitle: 'Learn French without limits, from A1 to C2',
    heroSub: 'One Premium pass unlocks every guided course, native listening lab, studio dictation, exam preparation track and certificate.',
    statusHeading: 'Your current plan',
    statusPremium: 'Premium active',
    statusFree: 'Free account',
    statusStaff: 'Team access',
    statusVisitor: 'Not signed in',
    statusFreeForAll: 'Everything is free right now',
    statusFreeDesc: 'Module 1 of every path is unlocked. Upgrade below for full A1–C2 access.',
    statusPremiumDesc: 'You have full access to every lesson, studio dictation and mock exam.',
    statusStaffDesc: 'Team accounts already include full access to every course and resource.',
    statusCompanyDesc: 'Your Premium access is managed directly by your organization.',
    statusFreeForAllDesc: 'All courses, practice libraries, dictations and games are currently open to everyone.',
    statusVisitorDesc: 'Sign in or create an account to activate your Premium access.',
    until: (d: string) => `Active until ${d}`,
    noEnd: 'No expiration date',
    viaCompany: 'Provided by your company',
    startCourses: 'Go to courses',
    profileLink: 'My profile',
    chooseTitle: 'Choose your Premium plan',
    chooseSub: 'Instant activation as soon as your payment is confirmed.',
    extendTitle: 'Extend your Premium access',
    extendSub: 'Add another period — it starts seamlessly at the end of your current Premium.',
    payBtn: 'Pay with Paystack',
    extendBtn: 'Add this period',
    signUpSubscribe: 'Create account & subscribe',
    signInExisting: 'Already have an account? Sign in',
    renews: 'Renews automatically · cancel anytime',
    once: 'One-time payment · no auto-renewal',
    bestValue: 'Best value',
    recurringBadge: 'Auto-renewal',
    periodLabel: (d: number) => (d >= 365 ? `${Math.round(d / 365)} year${d >= 730 ? 's' : ''}` : d >= 28 ? `${Math.round(d / 30)} month${d >= 56 ? 's' : ''}` : `${d} days`),
    daysAccess: (d: number) => `${d} days of unlimited access`,
    redirecting: 'Opening the secure Paystack checkout page…',
    trustCard: 'Visa, Mastercard & Mobile Money',
    trustProvider: 'Processed securely by Paystack',
    trustInstant: 'Instant course activation',
    manualTitle: 'Request Premium activation',
    manualText: 'Online checkout is being finalized. Send a quick request and our team will activate Premium for you.',
    benefitsEyebrow: 'What Premium unlocks',
    benefitsTitle: 'Everything needed for fluency and exam success',
    compareTitle: 'Free account vs. Premium',
    colFeature: 'Included feature',
    colFree: 'Free',
    colPremium: 'Premium',
    included: 'Included',
    notIncluded: 'Locked',
    subHeading: 'Manage recurring subscription',
    subActive: (d: string) => `Next automatic renewal on ${d}.`,
    subNonRenewing: 'Auto-renewal is turned off. Your Premium stays active until the end of your paid period.',
    subAttention: 'Your last renewal payment could not be collected. Update your card to keep uninterrupted access.',
    updateCard: 'Update payment card',
    cancelSub: 'Stop renewals',
    cancelConfirm: 'Stop future automatic renewals? Your Premium remains active until the end of the period already paid.',
    historyTitle: 'Payment history',
    historySub: 'Your confirmed transactions and active checkout attempts.',
    renewalTag: 'Renewal',
    paidUntil: (d: string) => `Access until ${d}`,
    statusLabels: {
      success: 'Paid',
      failed: 'Failed',
      abandoned: 'Cancelled',
      review: 'In review',
      refunded: 'Refunded',
      disputed: 'Disputed',
    } as Record<string, string>,
    results: {
      success: 'Payment confirmed! Your Premium access is now active.',
      pending: 'Your payment is being verified by Paystack. Access updates automatically within moments.',
      failed: 'Your payment did not go through. You were not charged and can try again anytime.',
      cancelled: 'Checkout was cancelled. You were not charged.',
      review: 'We received your payment and are verifying it. Our team will reach out if needed.',
    } as Record<string, string>,
  },
  fr: {
    seoTitle: 'Abonnement Premium',
    seoDesc: 'Comparez Gratuit vs Premium, débloquez les 464+ cours de français et abonnez-vous en toute sécurité.',
    eyebrow: 'Accès Premium',
    heroTitle: 'Apprenez le français sans limites, de A1 à C2',
    heroSub: 'Un seul accès Premium ouvre l’ensemble des cours guidés, laboratoires d’écoute, dictées studio, préparations TCF/TEF et certificats.',
    statusHeading: 'Votre formule actuelle',
    statusPremium: 'Premium actif',
    statusFree: 'Compte gratuit',
    statusStaff: 'Accès équipe',
    statusVisitor: 'Non connecté',
    statusFreeForAll: 'Tout est gratuit pour le moment',
    statusFreeDesc: 'Le module 1 de chaque parcours est ouvert. Passez à Premium pour débloquer tout A1–C2.',
    statusPremiumDesc: 'Vous avez un accès illimité à toutes les leçons, dictées studio et examens blancs.',
    statusStaffDesc: 'Les comptes de l’équipe disposent déjà d’un accès complet à toutes les ressources.',
    statusCompanyDesc: 'Votre accès Premium est géré directement par votre organisation.',
    statusFreeForAllDesc: 'Tous les cours, exercices, dictées et jeux sont actuellement ouverts à tous.',
    statusVisitorDesc: 'Connectez-vous ou créez votre compte pour activer votre accès Premium.',
    until: (d: string) => `Actif jusqu’au ${d}`,
    noEnd: 'Sans date de fin',
    viaCompany: 'Fourni par votre entreprise',
    startCourses: 'Aller aux cours',
    profileLink: 'Mon profil',
    chooseTitle: 'Choisissez votre formule Premium',
    chooseSub: 'Activation immédiate dès confirmation du paiement.',
    extendTitle: 'Prolonger votre accès Premium',
    extendSub: 'Ajoutez une nouvelle période : elle prendra la suite de votre période actuelle.',
    payBtn: 'Payer avec Paystack',
    extendBtn: 'Ajouter cette période',
    signUpSubscribe: 'Créer un compte et s’abonner',
    signInExisting: 'Déjà inscrit ? Connexion',
    renews: 'Renouvellement automatique · résiliable à tout moment',
    once: 'Paiement unique · sans renouvellement automatique',
    bestValue: 'Meilleur choix',
    recurringBadge: 'Renouvellement auto',
    periodLabel: (d: number) => (d >= 365 ? `${Math.round(d / 365)} an${d >= 730 ? 's' : ''}` : d >= 28 ? `${Math.round(d / 30)} mois` : `${d} jours`),
    daysAccess: (d: number) => `${d} jours d’accès illimité`,
    redirecting: 'Ouverture de la page sécurisée Paystack…',
    trustCard: 'Carte bancaire & Mobile Money',
    trustProvider: 'Paiement sécurisé via Paystack',
    trustInstant: 'Activation instantanée',
    manualTitle: 'Demander l’activation Premium',
    manualText: 'Le paiement en ligne est en cours de finalisation. Envoyez une demande et notre équipe active votre accès.',
    benefitsEyebrow: 'Ce que Premium débloque',
    benefitsTitle: 'Tout le nécessaire pour progresser et réussir vos examens',
    compareTitle: 'Compte gratuit vs. Premium',
    colFeature: 'Inclus dans votre accès',
    colFree: 'Gratuit',
    colPremium: 'Premium',
    included: 'Inclus',
    notIncluded: 'Verrouillé',
    subHeading: 'Gérer le renouvellement',
    subActive: (d: string) => `Prochain renouvellement automatique le ${d}.`,
    subNonRenewing: 'Le renouvellement automatique est désactivé. Votre Premium reste actif jusqu’à la fin de la période payée.',
    subAttention: 'Le dernier renouvellement a échoué. Mettez à jour votre carte pour conserver votre accès.',
    updateCard: 'Mettre à jour ma carte',
    cancelSub: 'Arrêter les renouvellements',
    cancelConfirm: 'Arrêter les prochains renouvellements ? Votre accès reste actif jusqu’à la fin de la période payée.',
    historyTitle: 'Historique des paiements',
    historySub: 'Vos transactions confirmées et tentatives de paiement.',
    renewalTag: 'Renouvellement',
    paidUntil: (d: string) => `Accès jusqu’au ${d}`,
    statusLabels: {
      success: 'Payé',
      failed: 'Échoué',
      abandoned: 'Annulé',
      review: 'En vérification',
      refunded: 'Remboursé',
      disputed: 'Contesté',
    } as Record<string, string>,
    results: {
      success: 'Paiement confirmé ! Votre accès Premium est désormais actif.',
      pending: 'Votre paiement est en cours de vérification par Paystack. L’accès se met à jour automatiquement.',
      failed: 'Le paiement n’a pas abouti. Vous n’avez pas été débité et pouvez réessayer.',
      cancelled: 'Paiement annulé. Vous n’avez pas été débité.',
      review: 'Nous avons reçu votre paiement et le vérifions. Notre équipe vous contactera si besoin.',
    } as Record<string, string>,
  },
} as const;

const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

function BenefitIcon({ kind }: { kind: BenefitMetric['icon'] }) {
  switch (kind) {
    case 'courses': return <ReadOutlined aria-hidden />;
    case 'listening': return <CustomerServiceOutlined aria-hidden />;
    case 'dictations': return <EditOutlined aria-hidden />;
    case 'exams': return <SafetyCertificateOutlined aria-hidden />;
  }
}

export default function SubscriptionPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const ac = ACCOUNT_COPY[lang];
  const account = useAccount();
  const mounted = useMounted();
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(mounted ? search : ''), [search, mounted]);
  const result = query.get('payment');

  const [billingData, setBillingData] = useState<BillingState | null>(null);
  const [publicOffers, setPublicOffers] = useState<Offer[]>([]);
  const [offersEnabled, setOffersEnabled] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [payBusy, setPayBusy] = useState('');
  const [payError, setPayError] = useState('');
  const [subBusy, setSubBusy] = useState(false);
  const [subError, setSubError] = useState('');

  const { user, access, mode } = account;
  const isPremium = access.level === 'premium';
  const freeForAll = mode === 'free';
  const viaCompany = access.premium?.via === 'company' || billingData?.can_pay === false;

  const loadBilling = useCallback(async () => {
    if (!mounted) return;
    if (user) {
      setLoadingBilling(true);
      try {
        const res = await siteApi<BillingState>('/learn/billing/me');
        setBillingData(res);
      } catch {
        setBillingData(null);
      } finally {
        setLoadingBilling(false);
      }
      return;
    }
    if (account.status !== 'unknown') {
      try {
        const res = await siteApi<{ enabled?: boolean; offers?: Offer[] }>('/learn/billing/offers');
        setOffersEnabled(!!res.enabled);
        setPublicOffers(Array.isArray(res.offers) ? res.offers : []);
      } catch {
        setOffersEnabled(false);
        setPublicOffers([]);
      }
    }
  }, [mounted, user, account.status]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  useEffect(() => {
    if (mounted && result) {
      void loadAccount(true);
    }
  }, [mounted, result]);

  const startPay = async (code: string) => {
    setPayBusy(code);
    setPayError('');
    try {
      await startCheckout(code, lang);
    } catch (e) {
      setPayError(errorText(lang, e as ApiError));
      setPayBusy('');
    }
  };

  const manageSub = async (path: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setSubBusy(true);
    setSubError('');
    try {
      const out = await siteApi<{ url?: string }>(path, { body: {} });
      if (out.url && /^https:\/\/([a-z0-9-]+\.)*paystack\.com\//.test(out.url)) {
        window.location.assign(out.url);
        return;
      }
      await loadBilling();
    } catch (e) {
      setSubError(errorText(lang, e as ApiError));
    } finally {
      setSubBusy(false);
    }
  };

  const alternates = { en: accountPath('subscription', 'en'), fr: accountPath('subscription', 'fr') };
  const activeSub = billingData?.subscription ?? null;
  const rawOffers = user ? (billingData?.offers ?? []) : publicOffers;
  const visibleOffers = rawOffers.filter(o => !(o.recurring && activeSub && activeSub.status !== 'non-renewing'));
  const maxDaysOffer = visibleOffers.reduce<string>((best, o) => {
    const prev = visibleOffers.find(x => x.code === best);
    return !prev || o.days > prev.days ? o.code : best;
  }, '');
  const onlineCheckoutReady = user ? !!billingData?.enabled : offersEnabled;
  const showPlanCards = !freeForAll && !access.staff && !viaCompany && (!isPremium || !!access.premium?.until);

  const untilDate = access.premium?.until ? fmtDate(access.premium.until, lang) : null;
  const statusLabel = freeForAll && !isPremium
    ? t.statusFreeForAll
    : access.staff
      ? t.statusStaff
      : isPremium
        ? t.statusPremium
        : user
          ? t.statusFree
          : t.statusVisitor;
  const statusSub = freeForAll && !isPremium
    ? t.statusFreeForAllDesc
    : access.staff
      ? t.statusStaffDesc
      : isPremium
        ? (access.premium?.via === 'company' ? t.viaCompany : untilDate ? t.until(untilDate) : t.noEnd)
        : user
          ? t.statusFreeDesc
          : t.statusVisitorDesc;

  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{ title: `${t.seoTitle} | Learn French with Natives`, description: t.seoDesc, path: alternates[lang], noindex: true }}
    >
      <section className="ax-wrap ax-sub-page">
        <div className="lp-wrap ax-sub-shell">
          {result && t.results[result] && (
            <div className={`ax-note ax-sub-result ${result === 'success' ? 'is-ok' : result === 'failed' ? 'is-warn' : ''}`} role="status">
              {result === 'success' && <CheckCircleFilled aria-hidden />}
              <span>{t.results[result]}</span>
            </div>
          )}

          {/* 1. Editorial Hero & Current Access Status */}
          <div className="ax-sub-hero">
            <div className="ax-sub-hero-copy">
              <span className="lp-eyebrow">{t.eyebrow}</span>
              <h1>{t.heroTitle}</h1>
              <p>{t.heroSub}</p>
            </div>

            <aside className={`ax-sub-status${isPremium ? ' is-premium' : ''}`}>
              <div className="ax-sub-status-top">
                <span>{t.statusHeading}</span>
                <span className={`ax-sub-pill${isPremium ? ' is-premium' : ''}`}>
                  {isPremium ? <CrownFilled aria-hidden /> : <UserOutlined aria-hidden />}
                  {statusLabel}
                </span>
              </div>
              <p className="ax-sub-status-desc">{statusSub}</p>
              <div className="ax-sub-status-links">
                <Link to={hubPath(lang)} className="lp-btn lp-btn-ghost lp-btn-sm">
                  {t.startCourses} <ArrowRightOutlined aria-hidden />
                </Link>
                {user && (
                  <Link to={accountPath('account', lang)} className="ax-inline-link">
                    {t.profileLink}
                  </Link>
                )}
              </div>
            </aside>
          </div>

          {/* 2. Plans & Direct Paystack Checkout */}
          {showPlanCards && (
            <section className="ax-sub-plans" id="plans" aria-labelledby="ax-plans-title">
              <div className="ax-sub-sec-head">
                <div>
                  <h2 id="ax-plans-title">{isPremium ? t.extendTitle : t.chooseTitle}</h2>
                  <p>{isPremium ? t.extendSub : t.chooseSub}</p>
                </div>
              </div>

              {loadingBilling && !billingData ? (
                <p className="ax-loading" role="status"><LoadingOutlined /></p>
              ) : onlineCheckoutReady && visibleOffers.length > 0 ? (
                <>
                  <div className="ax-sub-plan-grid">
                    {visibleOffers.map(o => {
                      const featured = visibleOffers.length > 1 && o.code === maxDaysOffer;
                      return (
                        <article key={o.code} className={`ax-sub-plan${o.recurring ? ' is-recurring' : ''}${featured ? ' is-featured' : ''}`}>
                          <div className="ax-sub-plan-top">
                            <h3>{o.name[lang] || o.name.en}</h3>
                            {featured && <span className="ax-sub-tag is-best">{t.bestValue}</span>}
                            {!featured && o.recurring && <span className="ax-sub-tag">{t.recurringBadge}</span>}
                          </div>

                          <p className="ax-sub-price">
                            <strong>{formatPrice(o.amount, o.currency, lang)}</strong>
                            <span>/ {t.periodLabel(o.days)}</span>
                          </p>

                          <p className="ax-sub-plan-days">{t.daysAccess(o.days)}</p>
                          {(o.description[lang] || o.description.en) && (
                            <p className="ax-sub-plan-desc">{o.description[lang] || o.description.en}</p>
                          )}
                          <p className="ax-sub-plan-kind">{o.recurring ? t.renews : t.once}</p>

                          <div className="ax-sub-plan-cta">
                            {user ? (
                              <button
                                type="button"
                                className="lp-btn lp-btn-primary ax-sub-pay-btn"
                                disabled={!!payBusy}
                                onClick={() => void startPay(o.code)}
                              >
                                {payBusy === o.code ? <LoadingOutlined /> : <LockOutlined />}
                                <span>{isPremium ? t.extendBtn : t.payBtn}</span>
                              </button>
                            ) : (
                              <>
                                <Link
                                  to={accountPath('signUp', lang, accountPath('subscription', lang))}
                                  className="lp-btn lp-btn-primary ax-sub-pay-btn"
                                >
                                  {t.signUpSubscribe} <ArrowRightOutlined aria-hidden />
                                </Link>
                                <Link
                                  to={accountPath('signIn', lang, accountPath('subscription', lang))}
                                  className="ax-sub-signin-link"
                                >
                                  {t.signInExisting}
                                </Link>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {payBusy && <p className="ax-hint" role="status">{t.redirecting}</p>}
                  {payError && <p className="ax-error" role="alert">{payError}</p>}

                  <ul className="ax-sub-trust">
                    <li><LockOutlined aria-hidden /> {t.trustCard}</li>
                    <li><SafetyCertificateOutlined aria-hidden /> {t.trustProvider}</li>
                    <li><CheckCircleFilled aria-hidden /> {t.trustInstant}</li>
                  </ul>
                </>
              ) : user && !isPremium ? (
                <div className="ax-sub-fallback">
                  <h3>{t.manualTitle}</h3>
                  <p>{t.manualText}</p>
                  <PremiumRequest lang={lang} withMessage />
                </div>
              ) : !user ? (
                <div className="ax-sub-fallback">
                  <h3>{t.manualTitle}</h3>
                  <p>{ac.signUpSub}</p>
                  <div className="lp-hero-ctas">
                    <Link to={accountPath('signUp', lang, accountPath('subscription', lang))} className="lp-btn lp-btn-primary">
                      {ac.signUp} <ArrowRightOutlined aria-hidden />
                    </Link>
                    <Link to={accountPath('signIn', lang, accountPath('subscription', lang))} className="lp-btn lp-btn-ghost">
                      {ac.signIn}
                    </Link>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {viaCompany && (
            <div className="ax-sub-notice">
              <TeamOutlined aria-hidden />
              <div>
                <strong>{t.viaCompany}</strong>
                <p>{t.statusCompanyDesc}</p>
              </div>
            </div>
          )}

          {/* 3. Active Recurring Subscription Management & Payment History */}
          {user && (activeSub || (billingData?.payments.length ?? 0) > 0) && (
            <div className="ax-sub-manage-grid">
              {activeSub && (
                <section className="ax-sub-box">
                  <h2>{t.subHeading}{activeSub.name[lang] ? `: ${activeSub.name[lang]}` : ''}</h2>
                  <p className="ax-sub-box-desc">
                    {activeSub.status === 'active' && activeSub.next_payment_date
                      ? t.subActive(fmtDate(activeSub.next_payment_date, lang))
                      : activeSub.status === 'non-renewing'
                        ? t.subNonRenewing
                        : activeSub.status === 'attention'
                          ? t.subAttention
                          : ''}
                  </p>
                  {activeSub.status !== 'non-renewing' && (
                    <div className="ax-row">
                      <button
                        type="button"
                        className="lp-btn lp-btn-ghost"
                        disabled={subBusy}
                        onClick={() => void manageSub('/learn/billing/subscription/card')}
                      >
                        {t.updateCard}
                      </button>
                      <button
                        type="button"
                        className="ax-linkbtn"
                        disabled={subBusy}
                        onClick={() => void manageSub('/learn/billing/subscription/cancel', t.cancelConfirm)}
                      >
                        {t.cancelSub}
                      </button>
                    </div>
                  )}
                  {subError && <p className="ax-error" role="alert">{subError}</p>}
                </section>
              )}

              {billingData && billingData.payments.length > 0 && (
                <section className="ax-sub-box">
                  <h2>{t.historyTitle}</h2>
                  <p className="ax-sub-box-desc">{t.historySub}</p>
                  <ul className="ax-payments">
                    {billingData.payments.map(p => (
                      <li key={p.reference}>
                        <span>
                          <strong>{p.name[lang] || p.name.en || 'Premium'}{p.renewal ? ` · ${t.renewalTag}` : ''}</strong>
                          <small>
                            {fmtDate(p.paid_at || p.created_at, lang)}
                            {p.status === 'success' && p.premium_until ? ` · ${t.paidUntil(fmtDate(p.premium_until, lang))}` : ''}
                          </small>
                        </span>
                        <span className="ax-pay-amount">{formatPrice(p.amount, p.currency, lang)}</span>
                        <span className={`ax-pay-status is-${p.status}`}>{t.statusLabels[p.status] || p.status}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {/* 4. What Premium Unlocks (Benefits + Comparison) */}
          <section className="ax-sub-benefits" aria-labelledby="ax-benefits-title">
            <div className="ax-sub-sec-head">
              <div>
                <span className="lp-eyebrow">{t.benefitsEyebrow}</span>
                <h2 id="ax-benefits-title">{t.benefitsTitle}</h2>
              </div>
            </div>

            <div className="ax-sub-benefits-grid">
              {BENEFITS[lang].map(b => (
                <article key={b.value} className="ax-sub-benefit-card">
                  <div className="ax-sub-benefit-top">
                    <span className="ax-sub-benefit-ico"><BenefitIcon kind={b.icon} /></span>
                    <b>{b.value}</b>
                  </div>
                  <h3>{b.label}</h3>
                  <p>{b.detail}</p>
                </article>
              ))}
            </div>

            <div className="ax-sub-compare-card">
              <h3>{t.compareTitle}</h3>
              <table className="ax-sub-compare">
                <thead>
                  <tr>
                    <th scope="col">{t.colFeature}</th>
                    <th scope="col">{t.colFree}</th>
                    <th scope="col" className="is-premium">{t.colPremium}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE[lang].map(row => (
                    <tr key={row.feature}>
                      <td>{row.feature}</td>
                      <td>
                        {row.free === true ? (
                          <span className="ax-cmp-yes" aria-label={t.included}><CheckCircleFilled /></span>
                        ) : row.free === false ? (
                          <span className="ax-cmp-no" aria-label={t.notIncluded}><CloseOutlined /></span>
                        ) : (
                          <span className="ax-cmp-note">{row.free}</span>
                        )}
                      </td>
                      <td className="is-premium">
                        {row.premium === true ? (
                          <span className="ax-cmp-yes" aria-label={t.included}><CheckCircleFilled /></span>
                        ) : row.premium === false ? (
                          <span className="ax-cmp-no" aria-label={t.notIncluded}><CloseOutlined /></span>
                        ) : (
                          <span className="ax-cmp-note is-strong">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </LearnShell>
  );
}
