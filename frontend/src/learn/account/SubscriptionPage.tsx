// Dedicated Academy Subscription & Plans page (/learn/subscription/ & /fr/apprendre/abonnement/).
// Displays 3 plans (Free, Standard for courses, Premium for courses + Exam Simulator & AI credits)
// across 3 billing periods (Monthly, Quarterly, Yearly) synced live with Admin configuration.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRightOutlined, BookOutlined, CheckCircleFilled, CreditCardOutlined,
  CrownFilled, CustomerServiceOutlined, DownloadOutlined, EditOutlined,
  ExperimentOutlined, FileTextOutlined, LineChartOutlined, LoadingOutlined,
  LockOutlined, ReadOutlined, RobotOutlined, SafetyCertificateOutlined,
  StarFilled, SyncOutlined, TeamOutlined,
} from '@ant-design/icons';
import { LearnShell, useMounted } from '../shell';
import { hubPath } from '../paths';
import type { Lang } from '../types';
import { siteApi, type ApiError } from './api';
import {
  DEFAULT_PLAN_CATALOG, downloadInvoicePdf, formatPrice, startCheckout,
  type BillingPeriod, type Offer, type PaidPlanTier, type PlanCatalog, type PlanPeriodOffer,
} from './billingApi';
import { errorText } from './copy';
import { accountPath } from './paths';
import { PremiumRequest } from './AccessGate';
import { currentPlan, loadAccount, useAccount } from './store';
import './account.css';

interface Payment {
  reference: string;
  amount: number;
  currency: string;
  charged_amount?: number;
  charged_currency?: string;
  fx_rate?: number | null;
  invoice_number?: string | null;
  has_invoice?: boolean;
  days: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  renewal: boolean;
  plan_tier?: PaidPlanTier;
  billing_period?: BillingPeriod | null;
  name: { en: string | null; fr: string | null };
  premium_until: string | null;
}

interface BillingState {
  enabled: boolean;
  mode?: 'free' | 'premium';
  catalog?: PlanCatalog | null;
  offers: Offer[];
  payments: Payment[];
  subscription: {
    status: string;
    next_payment_date: string | null;
    plan_tier?: PaidPlanTier;
    billing_period?: BillingPeriod | null;
    name: { en: string | null; fr: string | null };
  } | null;
  can_pay?: boolean;
}

type CellVal = boolean | string;
interface CompareRow {
  id: string;
  label: string;
  icon: 'levels' | 'courses' | 'labs' | 'dictation' | 'sim' | 'past' | 'ai' | 'cert' | 'analytics' | 'support';
  free: CellVal;
  standard: CellVal;
  premium: CellVal;
}

const PERIOD_MONTHS: Record<BillingPeriod, number> = { monthly: 1, quarterly: 3, yearly: 12 };

const COPY = {
  en: {
    seoTitle: 'Subscription & Plans',
    seoDesc: 'Compare Free, Standard, and Premium plans with Monthly, Quarterly, and Yearly billing.',
    pageTitle: 'Choose your French learning plan',
    pageSub: 'Start free, unlock every course with Standard, or add TCF/TEF Exam Simulation & AI feedback with Premium.',
    currentPlanLabel: 'Your current plan',
    planNames: { visitor: 'Visitor', free: 'Free account', standard: 'Standard', premium: 'Premium', staff: 'Team access' },
    freeForAllTitle: 'Every course is open for free right now',
    freeForAllDesc: 'All 464+ guided courses, practice labs, dictations and certificates are currently open to everyone without a paid subscription.',
    goToCourses: 'Go to courses',
    myProfile: 'My profile',
    until: (d: string) => `Active until ${d}`,
    noEnd: 'No expiration date',
    viaCompany: 'Provided by your company',
    periods: { monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' },
    saveBadge: (pct: number) => `Save ${pct}%`,
    perMonthUnit: '/month',
    billedQuarterly: (p: string) => `Billed ${p} every 3 months`,
    billedYearly: (p: string) => `Billed ${p} per year`,
    billedOnce: 'One-time pass',
    billedAuto: 'Renews automatically',
    xofNote: (xof: string) => `Checkout settled in XOF (~${xof}) · Official USD invoice`,
    mostPopular: 'Most Popular',
    includedBadge: 'Included in your plan',
    currentBadge: 'Your current plan',
    extendLink: 'Extend period',
    unavailable: 'Currently unavailable',
    cards: {
      free: {
        title: 'Free',
        subtitle: 'Get started and explore the platform.',
        features: [
          'Starter lessons across A1–C2 (Module 1)',
          'Limited practice & listening labs',
          'Level placement test',
          'Basic progress tracking',
        ],
        ctaVisitor: 'Create a free account',
      },
      standard: {
        title: 'Standard',
        subtitle: 'Learn at your pace with full course access.',
        features: [
          'All 464+ courses from A1 to C2',
          'Complete practice & listening labs (400+)',
          '186 studio dictations & native audio',
          'Official completion certificates',
          'Progress tracking & analytics',
        ],
        ctaSubscribe: 'Subscribe to Standard',
        ctaExtend: 'Extend Standard',
        ctaRequest: 'Request Standard',
      },
      premium: {
        title: 'Premium',
        subtitle: 'The complete learning experience with exam success.',
        features: (credits: number) => [
          'Everything in Standard (all A1–C2 courses)',
          'Full TCF / TEF Exam Simulator access',
          'CO & CE past exam subjects & drills',
          credits > 0 ? `${credits} AI credits/mo for EE & EO feedback` : 'AI credits included for EE & EO feedback',
          'Priority learner support & certificates',
        ],
        ctaSubscribe: 'Subscribe to Premium',
        ctaUpgrade: 'Upgrade to Premium',
        ctaExtend: 'Extend Premium',
        ctaRequest: 'Request Premium',
      },
    },
    compareTitle: 'Compare plans',
    compareSub: 'See what’s included in each subscription and choose the one that suits you best.',
    colFeatures: 'Features',
    colFree: 'Free',
    colStandard: 'Standard',
    colPremium: 'Premium',
    compareRows: (credits: number): CompareRow[] => [
      { id: 'levels', label: 'Course levels', icon: 'levels', free: 'A1 (Starter)', standard: 'A1 – C2', premium: 'A1 – C2' },
      { id: 'courses', label: 'Number of courses', icon: 'courses', free: '24', standard: '464+', premium: '464+' },
      { id: 'labs', label: 'Practice & listening labs', icon: 'labs', free: 'Limited', standard: true, premium: true },
      { id: 'dictations', label: 'Studio dictations (graded /20)', icon: 'dictation', free: false, standard: true, premium: true },
      { id: 'sim', label: 'Exam Simulator (TCF / TEF)', icon: 'sim', free: false, standard: false, premium: true },
      { id: 'past', label: 'CO & CE past exam subjects', icon: 'past', free: false, standard: false, premium: true },
      { id: 'ai', label: 'AI credits for EE & EO feedback', icon: 'ai', free: false, standard: false, premium: credits > 0 ? `${credits} / month` : 'Included' },
      { id: 'cert', label: 'Official completion certificates', icon: 'cert', free: false, standard: true, premium: true },
      { id: 'analytics', label: 'Progress tracking & analytics', icon: 'analytics', free: true, standard: true, premium: true },
      { id: 'support', label: 'Priority support', icon: 'support', free: false, standard: false, premium: true },
    ],
    trust: [
      { key: 'secure', title: 'Secure payment', sub: 'Your data is protected' },
      { key: 'flexible', title: 'Flexible subscription', sub: 'Cancel or change anytime' },
      { key: 'guarantee', title: 'Instant activation', sub: 'Access unlocked right away' },
      { key: 'trusted', title: 'Trusted by learners', sub: '4.8/5 (3,200+ reviews)', stars: true },
    ],
    redirecting: 'Opening the secure Paystack checkout page…',
    manualTitle: 'Request plan activation',
    manualText: 'Online checkout is being finalized. Send a quick request and our team will activate your selected plan for you.',
    subHeading: 'Manage recurring subscription',
    subActive: (d: string) => `Next automatic renewal on ${d}.`,
    subNonRenewing: 'Auto-renewal is turned off. Your plan stays active until the end of your paid period.',
    subAttention: 'Your last renewal payment could not be collected. Update your card to keep uninterrupted access.',
    updateCard: 'Update payment card',
    cancelSub: 'Stop renewals',
    cancelConfirm: 'Stop future automatic renewals? Your plan remains active until the end of the period already paid.',
    historyTitle: 'Payment history',
    historySub: 'Your confirmed transactions and invoices.',
    renewalTag: 'Renewal',
    paidUntil: (d: string) => `Access until ${d}`,
    invoiceBtn: 'Invoice PDF',
    statusLabels: {
      success: 'Paid',
      failed: 'Failed',
      abandoned: 'Cancelled',
      review: 'In review',
      refunded: 'Refunded',
      disputed: 'Disputed',
    } as Record<string, string>,
    results: {
      success: 'Payment confirmed! Your subscription is now active.',
      pending: 'Your payment is being verified by Paystack. Access updates automatically within moments.',
      failed: 'Your payment did not go through. You were not charged and can try again anytime.',
      cancelled: 'Checkout was cancelled. You were not charged.',
      review: 'We received your payment and are verifying it. Our team will reach out if needed.',
    } as Record<string, string>,
  },
  fr: {
    seoTitle: 'Abonnement & Formules',
    seoDesc: 'Comparez les formules Gratuit, Standard et Premium avec facturation mensuelle, trimestrielle ou annuelle.',
    pageTitle: 'Choisissez votre formule d’apprentissage',
    pageSub: 'Commencez gratuitement, débloquez tous les cours avec Standard ou accédez au Simulateur TCF/TEF et crédits IA avec Premium.',
    currentPlanLabel: 'Votre formule actuelle',
    planNames: { visitor: 'Visiteur', free: 'Compte gratuit', standard: 'Standard', premium: 'Premium', staff: 'Accès équipe' },
    freeForAllTitle: 'Tous les cours sont gratuits pour le moment',
    freeForAllDesc: 'Les 464+ cours guidés, ateliers d’écoute, dictées et certificats sont actuellement ouverts à tous sans abonnement payant.',
    goToCourses: 'Aller aux cours',
    myProfile: 'Mon profil',
    until: (d: string) => `Actif jusqu’au ${d}`,
    noEnd: 'Sans date de fin',
    viaCompany: 'Fourni par votre entreprise',
    periods: { monthly: 'Mensuel', quarterly: 'Trimestriel', yearly: 'Annuel' },
    saveBadge: (pct: number) => `-${pct} %`,
    perMonthUnit: '/mois',
    billedQuarterly: (p: string) => `Facturé ${p} tous les 3 mois`,
    billedYearly: (p: string) => `Facturé ${p} par an`,
    billedOnce: 'Paiement unique',
    billedAuto: 'Renouvellement auto',
    xofNote: (xof: string) => `Paiement débité en XOF (~${xof}) · Facture USD`,
    mostPopular: 'Le plus populaire',
    includedBadge: 'Inclus dans votre formule',
    currentBadge: 'Votre formule actuelle',
    extendLink: 'Prolonger la période',
    unavailable: 'Momentanément indisponible',
    cards: {
      free: {
        title: 'Gratuit',
        subtitle: 'Commencez et explorez la plateforme.',
        features: [
          'Accès aux leçons d’initiation (Module 1 A1–C2)',
          'Ateliers pratiques et d’écoute limités',
          'Test de positionnement CECR',
          'Suivi de progression de base',
        ],
        ctaVisitor: 'Créer un compte gratuit',
      },
      standard: {
        title: 'Standard',
        subtitle: 'Apprenez à votre rythme avec tous les cours.',
        features: [
          'Tous les 464+ cours de A1 à C2',
          'Ateliers pratiques et d’écoute complets (400+)',
          '186 dictées studio et voix natives',
          'Certificats de réussite officiels',
          'Suivi détaillé et analytiques',
        ],
        ctaSubscribe: 'Choisir Standard',
        ctaExtend: 'Prolonger Standard',
        ctaRequest: 'Demander Standard',
      },
      premium: {
        title: 'Premium',
        subtitle: 'L’expérience complète pour réussir vos examens.',
        features: (credits: number) => [
          'Tout le plan Standard (tous les cours A1–C2)',
          'Accès complet au Simulateur TCF / TEF',
          'Sujets d’annales CO et CE corrigés',
          credits > 0 ? `${credits} crédits IA/mois pour correction EE et EO` : 'Crédits IA inclus pour correction EE et EO',
          'Support prioritaire et certificats vérifiés',
        ],
        ctaSubscribe: 'Choisir Premium',
        ctaUpgrade: 'Passer à Premium',
        ctaExtend: 'Prolonger Premium',
        ctaRequest: 'Demander Premium',
      },
    },
    compareTitle: 'Comparer les offres',
    compareSub: 'Découvrez ce que comprend chaque abonnement et choisissez celui qui vous correspond.',
    colFeatures: 'Fonctionnalités',
    colFree: 'Gratuit',
    colStandard: 'Standard',
    colPremium: 'Premium',
    compareRows: (credits: number): CompareRow[] => [
      { id: 'levels', label: 'Niveaux de cours', icon: 'levels', free: 'A1 (Débutant)', standard: 'A1 – C2', premium: 'A1 – C2' },
      { id: 'courses', label: 'Nombre de cours', icon: 'courses', free: '24', standard: '464+', premium: '464+' },
      { id: 'labs', label: 'Ateliers pratiques & écoute', icon: 'labs', free: 'Limité', standard: true, premium: true },
      { id: 'dictations', label: 'Dictées studio (notées /20)', icon: 'dictation', free: false, standard: true, premium: true },
      { id: 'sim', label: 'Simulateur d’examen (TCF / TEF)', icon: 'sim', free: false, standard: false, premium: true },
      { id: 'past', label: 'Sujets d’annales CO & CE', icon: 'past', free: false, standard: false, premium: true },
      { id: 'ai', label: 'Crédits IA pour correction EE & EO', icon: 'ai', free: false, standard: false, premium: credits > 0 ? `${credits} / mois` : 'Inclus' },
      { id: 'cert', label: 'Certificats de réussite officiels', icon: 'cert', free: false, standard: true, premium: true },
      { id: 'analytics', label: 'Suivi & analytiques de progression', icon: 'analytics', free: true, standard: true, premium: true },
      { id: 'support', label: 'Support prioritaire', icon: 'support', free: false, standard: false, premium: true },
    ],
    trust: [
      { key: 'secure', title: 'Paiement sécurisé', sub: 'Vos données sont protégées' },
      { key: 'flexible', title: 'Abonnement flexible', sub: 'Modifiable ou résiliable à tout moment' },
      { key: 'guarantee', title: 'Activation immédiate', sub: 'Accès débloqué dès validation' },
      { key: 'trusted', title: 'Approuvé par nos élèves', sub: '4,8/5 (3 200+ avis)', stars: true },
    ],
    redirecting: 'Ouverture de la page sécurisée Paystack…',
    manualTitle: 'Demander l’activation',
    manualText: 'Le paiement en ligne est en cours de finalisation. Envoyez une demande et notre équipe active votre formule.',
    subHeading: 'Gérer le renouvellement',
    subActive: (d: string) => `Prochain renouvellement automatique le ${d}.`,
    subNonRenewing: 'Le renouvellement automatique est désactivé. Votre formule reste active jusqu’à la fin de la période payée.',
    subAttention: 'Le dernier renouvellement a échoué. Mettez à jour votre carte pour conserver votre accès.',
    updateCard: 'Mettre à jour ma carte',
    cancelSub: 'Arrêter les renouvellements',
    cancelConfirm: 'Arrêter les prochains renouvellements ? Votre accès reste actif jusqu’à la fin de la période payée.',
    historyTitle: 'Historique des paiements',
    historySub: 'Vos transactions confirmées et factures.',
    renewalTag: 'Renouvellement',
    paidUntil: (d: string) => `Accès jusqu’au ${d}`,
    invoiceBtn: 'Facture PDF',
    statusLabels: {
      success: 'Payé',
      failed: 'Échoué',
      abandoned: 'Annulé',
      review: 'En vérification',
      refunded: 'Remboursé',
      disputed: 'Contesté',
    } as Record<string, string>,
    results: {
      success: 'Paiement confirmé ! Votre abonnement est désormais actif.',
      pending: 'Votre paiement est en cours de vérification par Paystack. L’accès se met à jour automatiquement.',
      failed: 'Le paiement n’a pas abouti. Vous n’avez pas été débité et pouvez réessayer.',
      cancelled: 'Paiement annulé. Vous n’avez pas été débité.',
      review: 'Nous avons reçu votre paiement et le vérifions. Notre équipe vous contactera si besoin.',
    } as Record<string, string>,
  },
} as const;

const fmtDate = (iso: string, lang: Lang) =>
  new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

function SproutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 21V11" />
      <path d="M12 13C12 8.5 15.5 6 19.5 6c0 4-2.5 7-7.5 7Z" />
      <path d="M12 11C12 7 8.5 5 4.5 5c0 4 2.5 6 7.5 6Z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polygon points="12 3 3 8 12 13 21 8 12 3" />
      <polyline points="3 12.5 12 17.5 21 12.5" />
      <polyline points="3 17 12 22 21 17" />
    </svg>
  );
}

function CompareIcon({ kind }: { kind: CompareRow['icon'] }) {
  switch (kind) {
    case 'levels': return <BookOutlined aria-hidden />;
    case 'courses': return <ReadOutlined aria-hidden />;
    case 'labs': return <CustomerServiceOutlined aria-hidden />;
    case 'dictation': return <EditOutlined aria-hidden />;
    case 'sim': return <ExperimentOutlined aria-hidden />;
    case 'past': return <FileTextOutlined aria-hidden />;
    case 'ai': return <RobotOutlined aria-hidden />;
    case 'cert': return <SafetyCertificateOutlined aria-hidden />;
    case 'analytics': return <LineChartOutlined aria-hidden />;
    case 'support': return <CustomerServiceOutlined aria-hidden />;
  }
}

function CompareCell({ val }: { val: CellVal }) {
  if (val === true) return <span className="ax-cmp-check" aria-label="Included"><CheckCircleFilled /></span>;
  if (val === false) return <span className="ax-cmp-dash" aria-hidden>—</span>;
  return <span className="ax-cmp-text">{val}</span>;
}

export default function SubscriptionPage({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const account = useAccount();
  const mounted = useMounted();
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(mounted ? search : ''), [search, mounted]);
  const result = query.get('payment');
  const queryPeriod = query.get('period');

  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [billingData, setBillingData] = useState<BillingState | null>(null);
  const [publicOffers, setPublicOffers] = useState<Offer[]>([]);
  const [publicCatalog, setPublicCatalog] = useState<PlanCatalog | null>(null);
  const [publicMode, setPublicMode] = useState<'free' | 'premium' | null>(null);
  const [offersEnabled, setOffersEnabled] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [payBusy, setPayBusy] = useState('');
  const [payError, setPayError] = useState('');
  const [subBusy, setSubBusy] = useState(false);
  const [subError, setSubError] = useState('');
  const [invBusy, setInvBusy] = useState('');
  const [invError, setInvError] = useState('');
  const [showManualRequest, setShowManualRequest] = useState(false);
  const manualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (queryPeriod === 'monthly' || queryPeriod === 'quarterly' || queryPeriod === 'yearly') {
      setPeriod(queryPeriod);
    }
  }, [queryPeriod]);

  const { user, access } = account;
  const isSignedIn = Boolean(user || account.portalUser);
  const userPlan = currentPlan(account);
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
        const res = await siteApi<{ enabled?: boolean; mode?: 'free' | 'premium'; catalog?: PlanCatalog | null; offers?: Offer[] }>('/learn/billing/offers');
        setOffersEnabled(!!res.enabled);
        setPublicMode(res.mode ?? null);
        setPublicCatalog(res.catalog ?? null);
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

  const effectiveMode: 'free' | 'premium' = (() => {
    if (billingData?.mode) return billingData.mode;
    if (publicMode) return publicMode;
    if (account.mode === 'free') return 'free';
    return 'premium';
  })();
  const freeForAll = effectiveMode === 'free';
  const catalog: PlanCatalog = (user ? billingData?.catalog : publicCatalog) || DEFAULT_PLAN_CATALOG;
  const activeSub = billingData?.subscription ?? null;
  const checkoutOffers = user ? (billingData?.offers ?? []) : publicOffers;
  const onlineCheckoutReady = user ? !!billingData?.enabled : offersEnabled;

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

  const openManualRequest = () => {
    setShowManualRequest(true);
    window.setTimeout(() => manualRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);
  };

  const openInvoice = async (p: Payment) => {
    setInvBusy(p.reference);
    setInvError('');
    try {
      await downloadInvoicePdf(p.reference, `Invoice-${p.invoice_number || p.reference}.pdf`);
    } catch (e) {
      setInvError(errorText(lang, e as ApiError));
    } finally {
      setInvBusy('');
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
  const untilDate = access.premium?.until ? fmtDate(access.premium.until, lang) : null;
  const currentBadgeText = access.staff
    ? t.planNames.staff
    : freeForAll && userPlan === 'free'
      ? t.planNames.free
      : t.planNames[userPlan];
  const aiCredits = catalog.premium_ai_credits ?? 30;
  const compareRows = useMemo(() => t.compareRows(aiCredits), [t, aiCredits]);

  const paidPriceView = (tier: PaidPlanTier) => {
    const tierData = catalog.tiers[tier];
    const monthlyOffer = tierData.periods.monthly;
    const activeOffer: PlanPeriodOffer = tierData.periods[period];
    const months = PERIOD_MONTHS[period];
    const perMonthAmount = period === 'monthly' ? activeOffer.amount : Math.round(activeOffer.amount / months);
    const headlinePrice = formatPrice(perMonthAmount, activeOffer.currency, lang);
    const totalPrice = formatPrice(activeOffer.amount, activeOffer.currency, lang);
    const baselinePrice = period !== 'monthly' && monthlyOffer.amount * months > activeOffer.amount
      ? formatPrice(monthlyOffer.amount, monthlyOffer.currency, lang)
      : null;
    const savedPct = period === 'monthly'
      ? 0
      : (activeOffer.discount_pct || (tierData.periods.monthly.amount > 0
        ? Math.max(0, Math.round((1 - activeOffer.amount / (tierData.periods.monthly.amount * months)) * 100))
        : 0));
    const canCheckoutOffer = onlineCheckoutReady
      && tierData.active
      && activeOffer.active
      && checkoutOffers.some(o => o.code === activeOffer.code);
    const isRecurringBlocked = Boolean(activeOffer.recurring && activeSub && activeSub.status !== 'non-renewing');
    return { tierData, activeOffer, headlinePrice, totalPrice, baselinePrice, savedPct, canCheckoutOffer, isRecurringBlocked };
  };

  const stdView = paidPriceView('standard');
  const premView = paidPriceView('premium');

  const renderPaidAction = (tier: PaidPlanTier, view: ReturnType<typeof paidPriceView>) => {
    const isPremiumCard = tier === 'premium';
    const btnClass = isPremiumCard ? 'ax-tier-btn is-crimson' : 'ax-tier-btn is-navy';
    const isCurrentTier = isSignedIn && ((tier === 'standard' && userPlan === 'standard') || (tier === 'premium' && userPlan === 'premium'));

    if (isCurrentTier) {
      const canExtendCurrent = Boolean(
        user && !access.staff && !viaCompany && access.premium?.until && !view.isRecurringBlocked && view.canCheckoutOffer,
      );
      return (
        <>
          <span className="ax-tier-btn is-current">
            <CheckCircleFilled aria-hidden /> {t.currentBadge}
          </span>
          {canExtendCurrent && (
            <button
              type="button"
              className="ax-tier-extend-link"
              disabled={!!payBusy}
              onClick={() => void startPay(view.activeOffer.code)}
            >
              {payBusy === view.activeOffer.code && <LoadingOutlined />}
              <span>{t.extendLink}</span>
            </button>
          )}
        </>
      );
    }

    if (access.staff || viaCompany) {
      return (
        <span className="ax-tier-btn is-muted" aria-disabled="true">
          {t.includedBadge}
        </span>
      );
    }
    if (tier === 'standard' && userPlan === 'premium') {
      return (
        <span className="ax-tier-btn is-muted" aria-disabled="true">
          {t.includedBadge}
        </span>
      );
    }
    if (!view.tierData.active || !view.activeOffer.active) {
      return (
        <span className="ax-tier-btn is-muted" aria-disabled="true">
          {t.unavailable}
        </span>
      );
    }
    if (!isSignedIn) {
      const nextUrl = `${accountPath('subscription', lang)}?period=${period}&plan=${tier}`;
      return (
        <Link to={accountPath('signUp', lang, nextUrl)} className={btnClass}>
          {isPremiumCard ? t.cards.premium.ctaSubscribe : t.cards.standard.ctaSubscribe}
        </Link>
      );
    }
    const label = isPremiumCard
      ? (userPlan === 'standard' ? t.cards.premium.ctaUpgrade : t.cards.premium.ctaSubscribe)
      : t.cards.standard.ctaSubscribe;

    if (view.canCheckoutOffer) {
      return (
        <button
          type="button"
          className={btnClass}
          disabled={!!payBusy}
          onClick={() => void startPay(view.activeOffer.code)}
        >
          {payBusy === view.activeOffer.code && <LoadingOutlined />}
          <span>{label}</span>
        </button>
      );
    }
    return (
      <button type="button" className={btnClass} onClick={openManualRequest}>
        {isPremiumCard ? t.cards.premium.ctaRequest : t.cards.standard.ctaRequest}
      </button>
    );
  };

  return (
    <LearnShell
      lang={lang}
      alternates={alternates}
      seo={{ title: `${t.seoTitle} | Learn French with Natives`, description: t.seoDesc, path: alternates[lang], noindex: true }}
    >
      <section className="ax-plans-page">
        <div className="lp-wrap ax-plans-shell">
          {result && t.results[result] && (
            <div className={`ax-note ax-sub-result ${result === 'success' ? 'is-ok' : result === 'failed' ? 'is-warn' : ''}`} role="status">
              {result === 'success' && <CheckCircleFilled aria-hidden />}
              <span>{t.results[result]}</span>
            </div>
          )}

          {/* Compact Header & Signed-in Plan Status Strip */}
          <header className="ax-plans-head">
            <div className="ax-plans-head-copy">
              <h1>{t.pageTitle}</h1>
              <p>{t.pageSub}</p>
            </div>
            {user && (
              <div className={`ax-plan-pillbar is-${userPlan}`}>
                <div className="ax-plan-pillbar-meta">
                  <small>{t.currentPlanLabel}</small>
                  <strong>
                    {userPlan === 'premium' && <CrownFilled aria-hidden />}
                    {currentBadgeText}
                  </strong>
                  {untilDate && !freeForAll && <span>{t.until(untilDate)}</span>}
                  {viaCompany && !access.staff && <span>{t.viaCompany}</span>}
                </div>
                <Link to={hubPath(lang)} className="ax-plan-pillbar-link">
                  {t.goToCourses} <ArrowRightOutlined aria-hidden />
                </Link>
              </div>
            )}
          </header>

          {viaCompany && !access.staff && (
            <div className="ax-sub-notice">
              <TeamOutlined aria-hidden />
              <div>
                <strong>{t.viaCompany}</strong>
                <p>{t.until(untilDate || t.noEnd)}</p>
              </div>
            </div>
          )}

          {freeForAll ? (
            <section className="ax-freeall-card">
              <div>
                <h2>{t.freeForAllTitle}</h2>
                <p>{t.freeForAllDesc}</p>
              </div>
              <div className="ax-freeall-actions">
                <Link to={hubPath(lang)} className="lp-btn lp-btn-primary">
                  {t.goToCourses} <ArrowRightOutlined aria-hidden />
                </Link>
                {user && (
                  <Link to={accountPath('account', lang)} className="lp-btn lp-btn-ghost">
                    {t.myProfile}
                  </Link>
                )}
              </div>
            </section>
          ) : (
            <>
              {/* 1. Centered Billing Period Selector */}
              <div className="ax-period-wrap" role="tablist" aria-label={lang === 'fr' ? 'Période de facturation' : 'Billing period'}>
                <div className="ax-period-pillbox">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={period === 'monthly'}
                    className={`ax-period-btn${period === 'monthly' ? ' is-active' : ''}`}
                    onClick={() => setPeriod('monthly')}
                  >
                    <span>{t.periods.monthly}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={period === 'quarterly'}
                    className={`ax-period-btn${period === 'quarterly' ? ' is-active' : ''}`}
                    onClick={() => setPeriod('quarterly')}
                  >
                    <span>{t.periods.quarterly}</span>
                    {catalog.discounts.quarterly > 0 && (
                      <em className="ax-period-save">{t.saveBadge(catalog.discounts.quarterly)}</em>
                    )}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={period === 'yearly'}
                    className={`ax-period-btn${period === 'yearly' ? ' is-active' : ''}`}
                    onClick={() => setPeriod('yearly')}
                  >
                    <span>{t.periods.yearly}</span>
                    {catalog.discounts.yearly > 0 && (
                      <em className="ax-period-save">{t.saveBadge(catalog.discounts.yearly)}</em>
                    )}
                  </button>
                </div>
              </div>

              {loadingBilling && !billingData && !catalog.configured ? (
                <p className="ax-loading" role="status"><LoadingOutlined /></p>
              ) : (
                <>
                  {/* 2. Three Pricing Cards: Free, Standard, Premium */}
                  <div className="ax-tier-grid">
                    {/* Free Card */}
                    <article className={`ax-tier-card is-free${isSignedIn && (userPlan === 'free' || (userPlan === 'visitor' && !!account.portalUser)) ? ' is-user-current' : ''}`}>
                      <div className="ax-tier-head">
                        <span className="ax-tier-ico is-mint"><SproutIcon /></span>
                        <div>
                          <h2>{t.cards.free.title}</h2>
                          <p>{t.cards.free.subtitle}</p>
                        </div>
                      </div>

                      <div className="ax-tier-price-box">
                        <div className="ax-tier-price">
                          <strong>{formatPrice(0, catalog.currency, lang)}</strong>
                          <span>{t.perMonthUnit}</span>
                        </div>
                      </div>

                      <ul className="ax-tier-list">
                        {t.cards.free.features.map(item => (
                          <li key={item}>
                            <span className="ax-chk" aria-hidden>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="ax-tier-foot">
                        {!isSignedIn ? (
                          <Link to={accountPath('signUp', lang, accountPath('subscription', lang))} className="ax-tier-btn is-outline">
                            {t.cards.free.ctaVisitor}
                          </Link>
                        ) : userPlan === 'free' || (userPlan === 'visitor' && !!account.portalUser) ? (
                          <span className="ax-tier-btn is-current">
                            <CheckCircleFilled aria-hidden /> {t.currentBadge}
                          </span>
                        ) : (
                          <span className="ax-tier-btn is-muted" aria-disabled="true">
                            {t.includedBadge}
                          </span>
                        )}
                      </div>
                    </article>

                    {/* Standard Card (Courses Only) */}
                    <article className={`ax-tier-card is-standard${userPlan === 'standard' ? ' is-user-current' : ''}`}>
                      <div className="ax-tier-head">
                        <span className="ax-tier-ico is-blue"><LayersIcon /></span>
                        <div>
                          <h2>{t.cards.standard.title}</h2>
                          <p>{t.cards.standard.subtitle}</p>
                        </div>
                      </div>

                      <div className="ax-tier-price-box">
                        <div className="ax-tier-price">
                          {stdView.baselinePrice && <s className="ax-tier-strike">{stdView.baselinePrice}</s>}
                          <strong>{stdView.headlinePrice}</strong>
                          <span>{t.perMonthUnit}</span>
                          {stdView.savedPct > 0 && <em className="ax-tier-disc">-{stdView.savedPct}%</em>}
                        </div>
                        {period !== 'monthly' && (
                          <p className="ax-tier-billed">
                            {period === 'quarterly' ? t.billedQuarterly(stdView.totalPrice) : t.billedYearly(stdView.totalPrice)}
                            {' · '}{stdView.activeOffer.recurring ? t.billedAuto : t.billedOnce}
                          </p>
                        )}
                        {stdView.activeOffer.charge && (
                          <p className="ax-tier-fx">
                            {t.xofNote(formatPrice(stdView.activeOffer.charge.amount, stdView.activeOffer.charge.currency, lang))}
                          </p>
                        )}
                      </div>

                      <ul className="ax-tier-list">
                        {t.cards.standard.features.map(item => (
                          <li key={item}>
                            <span className="ax-chk" aria-hidden>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="ax-tier-foot">
                        {renderPaidAction('standard', stdView)}
                      </div>
                    </article>

                    {/* Premium Card (Courses + Exam Simulator & AI Credits) */}
                    <article className={`ax-tier-card is-premium${userPlan === 'premium' ? ' is-user-current' : ''}`}>
                      <span className="ax-popular-pill">
                        <CrownFilled aria-hidden /> {t.mostPopular}
                      </span>

                      <div className="ax-tier-prem-cap">
                        <span className="ax-tier-ico is-gold"><CrownFilled aria-hidden /></span>
                        <div>
                          <h2>{t.cards.premium.title}</h2>
                          <p>{t.cards.premium.subtitle}</p>
                        </div>
                      </div>

                      <div className="ax-tier-prem-body">
                        <div className="ax-tier-price-box">
                          <div className="ax-tier-price">
                            {premView.baselinePrice && <s className="ax-tier-strike">{premView.baselinePrice}</s>}
                            <strong>{premView.headlinePrice}</strong>
                            <span>{t.perMonthUnit}</span>
                            {premView.savedPct > 0 && <em className="ax-tier-disc">-{premView.savedPct}%</em>}
                          </div>
                          {period !== 'monthly' && (
                            <p className="ax-tier-billed">
                              {period === 'quarterly' ? t.billedQuarterly(premView.totalPrice) : t.billedYearly(premView.totalPrice)}
                              {' · '}{premView.activeOffer.recurring ? t.billedAuto : t.billedOnce}
                            </p>
                          )}
                          {premView.activeOffer.charge && (
                            <p className="ax-tier-fx">
                              {t.xofNote(formatPrice(premView.activeOffer.charge.amount, premView.activeOffer.charge.currency, lang))}
                            </p>
                          )}
                        </div>

                        <ul className="ax-tier-list">
                          {t.cards.premium.features(aiCredits).map(item => (
                            <li key={item}>
                              <span className="ax-chk" aria-hidden>✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="ax-tier-foot">
                          {renderPaidAction('premium', premView)}
                        </div>
                      </div>
                    </article>
                  </div>

                  {payBusy && <p className="ax-hint ax-plans-msg" role="status">{t.redirecting}</p>}
                  {payError && <p className="ax-error ax-plans-msg" role="alert">{payError}</p>}

                  {showManualRequest && user && (
                    <div ref={manualRef} className="ax-sub-fallback">
                      <h3>{t.manualTitle}</h3>
                      <p>{t.manualText}</p>
                      <PremiumRequest lang={lang} withMessage />
                    </div>
                  )}

                  {/* 3. Compare Plans Matrix */}
                  <section className="ax-cmp-section" aria-labelledby="ax-cmp-title">
                    <div className="ax-cmp-intro">
                      <h2 id="ax-cmp-title">{t.compareTitle}</h2>
                      <p>{t.compareSub}</p>
                    </div>

                    <div className="ax-cmp-table-wrap">
                      <table className="ax-cmp-table">
                        <thead>
                          <tr>
                            <th scope="col" className="is-feature">{t.colFeatures}</th>
                            <th scope="col" className="is-free">{t.colFree}</th>
                            <th scope="col" className="is-standard">{t.colStandard}</th>
                            <th scope="col" className="is-premium">{t.colPremium}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compareRows.map(row => (
                            <tr key={row.id}>
                              <th scope="row" className="is-feature">
                                <span className="ax-cmp-rowlbl">
                                  <CompareIcon kind={row.icon} />
                                  <span>{row.label}</span>
                                </span>
                              </th>
                              <td className="is-free"><CompareCell val={row.free} /></td>
                              <td className="is-standard"><CompareCell val={row.standard} /></td>
                              <td className="is-premium"><CompareCell val={row.premium} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* 4. Bottom 4-Column Trust Bar */}
                  <ul className="ax-trust-strip" aria-label={lang === 'fr' ? 'Garanties' : 'Guarantees'}>
                    {t.trust.map(item => (
                      <li key={item.key}>
                        <span className="ax-trust-ico" aria-hidden>
                          {item.key === 'secure' && <SafetyCertificateOutlined />}
                          {item.key === 'flexible' && <CreditCardOutlined />}
                          {item.key === 'guarantee' && <SyncOutlined />}
                          {item.key === 'trusted' && <LockOutlined />}
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          {'stars' in item && item.stars && (
                            <div className="ax-trust-stars" aria-hidden>
                              <StarFilled /><StarFilled /><StarFilled /><StarFilled /><StarFilled />
                            </div>
                          )}
                          <span>{item.sub}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}

          {/* 5. Active Recurring Subscription Controls & Payment History */}
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
                          <strong>
                            {p.name[lang] || p.name.en || 'Plan'}
                            {p.renewal ? ` · ${t.renewalTag}` : ''}
                            {p.invoice_number && <code className="ax-inv-num">{p.invoice_number}</code>}
                          </strong>
                          <small>
                            {fmtDate(p.paid_at || p.created_at, lang)}
                            {p.status === 'success' && p.premium_until ? ` · ${t.paidUntil(fmtDate(p.premium_until, lang))}` : ''}
                          </small>
                        </span>
                        <span className="ax-pay-amount">{formatPrice(p.amount, p.currency, lang)}</span>
                        <span className={`ax-pay-status is-${p.status}`}>{t.statusLabels[p.status] || p.status}</span>
                        {p.has_invoice && (
                          <button
                            type="button"
                            className="ax-inv-btn"
                            disabled={invBusy === p.reference}
                            onClick={() => void openInvoice(p)}
                          >
                            {invBusy === p.reference ? <LoadingOutlined /> : <DownloadOutlined />}
                            <span>{t.invoiceBtn}</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {invError && <p className="ax-error" role="alert">{invError}</p>}
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </LearnShell>
  );
}
