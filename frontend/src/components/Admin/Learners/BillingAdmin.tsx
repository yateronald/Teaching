// Executive Paystack Gateway, 3-Tier x 3-Period Subscription Plans Studio,
// and Transactions & Invoices Ledger for Admin -> Online courses.
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, App, Button, Collapse, Form, Input, InputNumber, Modal,
  Segmented, Select, Skeleton, Switch, Table, Tag, Tooltip, Typography,
} from 'antd';
import {
  ApiOutlined, CalculatorOutlined, CheckCircleOutlined, CheckOutlined,
  CreditCardOutlined, CrownFilled, DollarOutlined, DownloadOutlined,
  EditOutlined, ExclamationCircleOutlined, PlusOutlined, ReloadOutlined,
  RollbackOutlined, SaveOutlined, SearchOutlined, SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../../contexts/AuthContext';
import useResponsive from '../../../hooks/useResponsive';
import { headerHeight } from '../../Layout/layoutMetrics';
import { call, fmtDate } from '../../Org/orgModel';

type PaidTier = 'standard' | 'premium';
type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

interface OfferRow {
  id: number; code: string; name_en: string; name_fr: string; description_en: string | null; description_fr: string | null;
  plan_tier?: PaidTier; billing_period?: BillingPeriod | null; discount_pct?: number;
  days: number; amount: number; currency: string; recurring: boolean; paystack_plan_code: string | null; active: boolean; sort: number;
}
interface CatalogPeriod {
  code: string; amount: number; currency: string; days: number; discount_pct: number;
  recurring: boolean; active: boolean; configured?: boolean; paystack_plan_code?: string | null;
}
interface PlanCatalog {
  configured: boolean;
  currency: string;
  discounts: { quarterly: number; yearly: number };
  premium_ai_credits: number;
  tiers: {
    free: { active: boolean };
    standard: { active: boolean; periods: Record<BillingPeriod, CatalogPeriod> };
    premium: { active: boolean; periods: Record<BillingPeriod, CatalogPeriod> };
  };
}
interface BillingInfo {
  mode: 'live' | 'test' | 'off';
  learn_mode?: 'free' | 'premium';
  callback_url: string | null; webhook_url: string | null; currencies: string[];
  merchant_currencies?: string[]; fx_usd_xof?: { rate: number; source: string } | null;
  catalog?: PlanCatalog;
  offers: OfferRow[];
  stats: { paid: number; review: number; subscriptions: number; problems: number };
}
interface PaymentRow {
  id: number; reference: string; amount: number; currency: string; display_amount?: number; display_currency?: string;
  fx_rate?: number | null; invoice_number?: string | null; days: number; status: string; status_detail: string | null;
  created_at: string; paid_at: string | null; channel: string | null; renewal: boolean; first_name: string; last_name: string; email: string;
  offer: string | null; premium_until: string | null;
}
interface PaymentsSummary {
  all: number;
  success: number;
  review: number;
  failed: number;
  refunded: number;
  initialized: number;
  revenue: { currency: string; amount: number }[];
}
interface PaymentsResponse {
  rows: PaymentRow[];
  total?: number;
  page: number;
  limit?: number;
  summary?: PaymentsSummary;
}

interface PeriodDraft {
  price: number;
  discount_pct: number;
  days: number;
  recurring: boolean;
  paystack_plan_code: string;
}
interface PlanDraft {
  currency: string;
  discounts: { quarterly: number; yearly: number };
  premium_ai_credits: number;
  tiers: Record<PaidTier, { active: boolean; periods: Record<BillingPeriod, PeriodDraft> }>;
}

const L = 'en-CA';
const PERIODS: { key: BillingPeriod; label: string; months: number; defaultDays: number }[] = [
  { key: 'monthly', label: 'Monthly', months: 1, defaultDays: 30 },
  { key: 'quarterly', label: 'Quarterly', months: 3, defaultDays: 90 },
  { key: 'yearly', label: 'Yearly', months: 12, defaultDays: 365 },
];
const ZERO_DECIMAL_INPUT = new Set(['XOF', 'RWF']);

const roundPrice = (val: number, cur: string) => {
  const safe = Math.max(0.01, Number.isFinite(val) ? val : 0.01);
  return ZERO_DECIMAL_INPUT.has(cur) ? Math.max(1, Math.round(safe)) : Math.round(safe * 100) / 100;
};
const discountedPrice = (monthlyPrice: number, months: number, pct: number, cur: string) =>
  roundPrice(monthlyPrice * months * (1 - pct / 100), cur);

const money = (amount: number, currency: string) => {
  const max = amount % 100 === 0 ? 0 : 2;
  try {
    return new Intl.NumberFormat(L, { style: 'currency', currency, minimumFractionDigits: max, maximumFractionDigits: max }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(max)} ${currency}`;
  }
};

const initials = (first?: string | null, last?: string | null, email?: string | null) =>
  `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || (email?.[0] || '?').toUpperCase();

const STATUS_LABEL: Record<string, string> = {
  success: 'Paid',
  review: 'To review',
  failed: 'Failed',
  refunded: 'Refunded',
  disputed: 'Disputed',
  initialized: 'In progress',
  abandoned: 'Abandoned',
};

function catalogToDraft(c?: PlanCatalog): PlanDraft {
  const src: PlanCatalog = c || {
    configured: false,
    currency: 'USD',
    discounts: { quarterly: 10, yearly: 20 },
    premium_ai_credits: 30,
    tiers: {
      free: { active: true },
      standard: {
        active: true,
        periods: {
          monthly: { code: 'standard-monthly', amount: 999, currency: 'USD', days: 30, discount_pct: 0, recurring: false, active: true },
          quarterly: { code: 'standard-quarterly', amount: 2697, currency: 'USD', days: 90, discount_pct: 10, recurring: false, active: true },
          yearly: { code: 'standard-yearly', amount: 9590, currency: 'USD', days: 365, discount_pct: 20, recurring: false, active: true },
        },
      },
      premium: {
        active: true,
        periods: {
          monthly: { code: 'premium-monthly', amount: 1499, currency: 'USD', days: 30, discount_pct: 0, recurring: false, active: true },
          quarterly: { code: 'premium-quarterly', amount: 4047, currency: 'USD', days: 90, discount_pct: 10, recurring: false, active: true },
          yearly: { code: 'premium-yearly', amount: 14390, currency: 'USD', days: 365, discount_pct: 20, recurring: false, active: true },
        },
      },
    },
  };
  const mapTier = (tier: PaidTier) => ({
    active: src.tiers[tier].active,
    periods: {
      monthly: {
        price: src.tiers[tier].periods.monthly.amount / 100,
        discount_pct: 0,
        days: src.tiers[tier].periods.monthly.days,
        recurring: src.tiers[tier].periods.monthly.recurring,
        paystack_plan_code: src.tiers[tier].periods.monthly.paystack_plan_code || '',
      },
      quarterly: {
        price: src.tiers[tier].periods.quarterly.amount / 100,
        discount_pct: src.tiers[tier].periods.quarterly.discount_pct ?? src.discounts.quarterly,
        days: src.tiers[tier].periods.quarterly.days,
        recurring: src.tiers[tier].periods.quarterly.recurring,
        paystack_plan_code: src.tiers[tier].periods.quarterly.paystack_plan_code || '',
      },
      yearly: {
        price: src.tiers[tier].periods.yearly.amount / 100,
        discount_pct: src.tiers[tier].periods.yearly.discount_pct ?? src.discounts.yearly,
        days: src.tiers[tier].periods.yearly.days,
        recurring: src.tiers[tier].periods.yearly.recurring,
        paystack_plan_code: src.tiers[tier].periods.yearly.paystack_plan_code || '',
      },
    },
  });
  return {
    currency: src.currency || 'USD',
    discounts: { ...src.discounts },
    premium_ai_credits: src.premium_ai_credits ?? 30,
    tiers: { standard: mapTier('standard'), premium: mapTier('premium') },
  };
}

export default function BillingAdmin({ learnMode }: { learnMode?: 'free' | 'premium' | null }) {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const r = useResponsive();

  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(() => catalogToDraft());
  const [savingPlans, setSavingPlans] = useState(false);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<OfferRow | 'new' | null>(null);

  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [payPage, setPayPage] = useState(1);
  const [payLimit, setPayLimit] = useState(25);

  const load = useCallback(async () => {
    try {
      const data = await call<BillingInfo>(apiCall, '/admin/learners/billing');
      setInfo(data);
      setDraft(catalogToDraft(data.catalog));
      setError('');
    } catch (e) { setError((e as Error).message); }
  }, [apiCall]);

  const loadPayments = useCallback(async () => {
    setPayLoading(true);
    const params = new URLSearchParams({
      page: String(payPage),
      limit: String(payLimit),
      ...(status !== 'all' ? { status } : {}),
      ...(q.trim() ? { q: q.trim() } : {}),
    });
    try {
      setPaymentsData(await call<PaymentsResponse>(apiCall, `/admin/learners/billing/payments?${params}`));
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setPayLoading(false);
    }
  }, [apiCall, status, q, payPage, payLimit, message]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const t = window.setTimeout(() => { void loadPayments(); }, 250);
    return () => window.clearTimeout(t);
  }, [loadPayments]);

  const recheck = async (p: PaymentRow) => {
    try {
      const res = await call<{ outcome: string }>(apiCall, `/admin/learners/billing/payments/${p.id}/recheck`, 'POST', {});
      message.info(`Paystack says: ${res.outcome}`);
      void loadPayments();
    } catch (e) { message.error((e as Error).message); }
  };

  const downloadInvoice = async (p: PaymentRow) => {
    try {
      const res = await apiCall(`/admin/learners/billing/payments/${p.id}/invoice.pdf`);
      if (!res.ok) throw new Error('Could not generate invoice PDF.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${p.invoice_number || p.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { message.error((e as Error).message); }
  };

  const savedSnapshot = useMemo(() => JSON.stringify(catalogToDraft(info?.catalog)), [info?.catalog]);
  const isDirty = Boolean(info && JSON.stringify(draft) !== savedSnapshot);

  if (error) return <Alert type="warning" showIcon message={error} />;
  if (!info) {
    return (
      <div className="ol-bill-stack">
        <div className="ol-panel" style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 4 }} /></div>
        <div className="ol-panel" style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 6 }} /></div>
      </div>
    );
  }

  const effectiveLearnMode = learnMode ?? info.learn_mode ?? 'free';
  const merchantCurrencies = info.merchant_currencies || [];
  const canAutoConvertUsd = merchantCurrencies.includes('XOF') && !merchantCurrencies.includes('USD');
  const isAutoConverted = (currency: string, recurring: boolean) => !recurring && currency === 'USD' && canAutoConvertUsd;
  const unsupportedOffers = merchantCurrencies.length > 0
    ? info.offers.filter(o => o.active && !merchantCurrencies.includes(o.currency) && !isAutoConverted(o.currency, o.recurring))
    : [];
  const approxXofSubunits = (usdSubunits: number) => {
    if (!info.fx_usd_xof?.rate) return null;
    return Math.max(100, Math.round((((usdSubunits / 100) * info.fx_usd_xof.rate) / 50)) * 50) * 100;
  };

  const updateGlobalDiscount = (period: 'quarterly' | 'yearly', rawVal: number | null) => {
    const pct = Math.max(0, Math.min(80, Math.round(Number(rawVal ?? 0))));
    const months = period === 'quarterly' ? 3 : 12;
    setDraft(prev => ({
      ...prev,
      discounts: { ...prev.discounts, [period]: pct },
      tiers: {
        standard: {
          ...prev.tiers.standard,
          periods: {
            ...prev.tiers.standard.periods,
            [period]: {
              ...prev.tiers.standard.periods[period],
              discount_pct: pct,
              price: discountedPrice(prev.tiers.standard.periods.monthly.price, months, pct, prev.currency),
            },
          },
        },
        premium: {
          ...prev.tiers.premium,
          periods: {
            ...prev.tiers.premium.periods,
            [period]: {
              ...prev.tiers.premium.periods[period],
              discount_pct: pct,
              price: discountedPrice(prev.tiers.premium.periods.monthly.price, months, pct, prev.currency),
            },
          },
        },
      },
    }));
  };

  const recalculateAllFromDiscounts = () => {
    setDraft(prev => {
      const nextTier = (tier: PaidTier) => {
        const m = prev.tiers[tier].periods.monthly.price;
        return {
          ...prev.tiers[tier],
          periods: {
            ...prev.tiers[tier].periods,
            quarterly: {
              ...prev.tiers[tier].periods.quarterly,
              discount_pct: prev.discounts.quarterly,
              price: discountedPrice(m, 3, prev.discounts.quarterly, prev.currency),
            },
            yearly: {
              ...prev.tiers[tier].periods.yearly,
              discount_pct: prev.discounts.yearly,
              price: discountedPrice(m, 12, prev.discounts.yearly, prev.currency),
            },
          },
        };
      };
      return { ...prev, tiers: { standard: nextTier('standard'), premium: nextTier('premium') } };
    });
    message.success('Quarterly and yearly prices recalculated from discount %');
  };

  const updateTierPeriodPrice = (tier: PaidTier, period: BillingPeriod, rawVal: number | null) => {
    const nextPrice = Math.max(0.01, Number(rawVal ?? 0.01));
    setDraft(prev => {
      const currentTier = prev.tiers[tier];
      if (period === 'monthly') {
        const rounded = roundPrice(nextPrice, prev.currency);
        return {
          ...prev,
          tiers: {
            ...prev.tiers,
            [tier]: {
              ...currentTier,
              periods: {
                monthly: { ...currentTier.periods.monthly, price: rounded, discount_pct: 0 },
                quarterly: {
                  ...currentTier.periods.quarterly,
                  discount_pct: prev.discounts.quarterly,
                  price: discountedPrice(rounded, 3, prev.discounts.quarterly, prev.currency),
                },
                yearly: {
                  ...currentTier.periods.yearly,
                  discount_pct: prev.discounts.yearly,
                  price: discountedPrice(rounded, 12, prev.discounts.yearly, prev.currency),
                },
              },
            },
          },
        };
      }
      const months = period === 'quarterly' ? 3 : 12;
      const baseline = currentTier.periods.monthly.price * months;
      const effPct = baseline > 0 ? Math.max(0, Math.min(95, Math.round((1 - nextPrice / baseline) * 100))) : 0;
      return {
        ...prev,
        tiers: {
          ...prev.tiers,
          [tier]: {
            ...currentTier,
            periods: {
              ...currentTier.periods,
              [period]: { ...currentTier.periods[period], price: roundPrice(nextPrice, prev.currency), discount_pct: effPct },
            },
          },
        },
      };
    });
  };

  const updateTierField = (tier: PaidTier, active: boolean) => {
    setDraft(prev => ({ ...prev, tiers: { ...prev.tiers, [tier]: { ...prev.tiers[tier], active } } }));
  };

  const updatePeriodRecurring = (tier: PaidTier, period: BillingPeriod, patch: Partial<PeriodDraft>) => {
    setDraft(prev => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [tier]: {
          ...prev.tiers[tier],
          periods: { ...prev.tiers[tier].periods, [period]: { ...prev.tiers[tier].periods[period], ...patch } },
        },
      },
    }));
  };

  const savePlans = async () => {
    setSavingPlans(true);
    try {
      const serializeTier = (tier: PaidTier) => ({
        active: draft.tiers[tier].active,
        periods: {
          monthly: {
            amount: Math.round(draft.tiers[tier].periods.monthly.price * 100),
            days: draft.tiers[tier].periods.monthly.days || 30,
            discount_pct: 0,
            recurring: draft.tiers[tier].periods.monthly.recurring,
            paystack_plan_code: draft.tiers[tier].periods.monthly.paystack_plan_code.trim() || null,
          },
          quarterly: {
            amount: Math.round(draft.tiers[tier].periods.quarterly.price * 100),
            days: draft.tiers[tier].periods.quarterly.days || 90,
            discount_pct: draft.tiers[tier].periods.quarterly.discount_pct,
            recurring: draft.tiers[tier].periods.quarterly.recurring,
            paystack_plan_code: draft.tiers[tier].periods.quarterly.paystack_plan_code.trim() || null,
          },
          yearly: {
            amount: Math.round(draft.tiers[tier].periods.yearly.price * 100),
            days: draft.tiers[tier].periods.yearly.days || 365,
            discount_pct: draft.tiers[tier].periods.yearly.discount_pct,
            recurring: draft.tiers[tier].periods.yearly.recurring,
            paystack_plan_code: draft.tiers[tier].periods.yearly.paystack_plan_code.trim() || null,
          },
        },
      });
      const res = await call<{ catalog: PlanCatalog; offers: OfferRow[] }>(apiCall, '/admin/learners/billing/plans', 'PUT', {
        currency: draft.currency,
        discounts: draft.discounts,
        premium_ai_credits: draft.premium_ai_credits,
        tiers: {
          standard: serializeTier('standard'),
          premium: serializeTier('premium'),
        },
      });
      setInfo(prev => (prev ? { ...prev, catalog: res.catalog, offers: res.offers } : prev));
      setDraft(catalogToDraft(res.catalog));
      message.success('Subscription plans & discounts saved');
    } catch (e) {
      message.error((e as Error).message);
    } finally {
      setSavingPlans(false);
    }
  };

  const payments = paymentsData?.rows || [];
  const summary = paymentsData?.summary;
  const revenueText = summary?.revenue?.length
    ? summary.revenue.map(item => money(item.amount, item.currency)).join(' + ')
    : money(0, draft.currency);

  const exportPaymentsCsv = () => {
    if (!payments.length) return;
    const csvRows: (string | number)[][] = [
      ['Date', 'Learner', 'Email', 'Offer', 'Invoice', 'Amount', 'Currency', 'Settled amount', 'Settled currency', 'Status', 'Detail', 'Reference'],
      ...payments.map(p => [
        dayjs(p.paid_at || p.created_at).format('YYYY-MM-DD HH:mm'),
        `${p.first_name} ${p.last_name}`.trim(),
        p.email,
        p.offer || '',
        p.invoice_number || '',
        ((p.display_amount ?? p.amount) / 100).toFixed(2),
        p.display_currency || p.currency,
        (p.amount / 100).toFixed(2),
        p.currency,
        STATUS_LABEL[p.status] || p.status,
        p.status_detail || '',
        p.reference,
      ]),
    ];
    const csv = csvRows.map(line => line.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${dayjs().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const segLabel = (text: string, n?: number) => (
    <span className="ol-seg">
      <span>{text}</span>
      {n !== undefined && <b>{n}</b>}
    </span>
  );

  return (
    <div className="ol-bill-stack">
      {/* ── Billing KPIs ── */}
      <section className="ol-kpis" aria-label="Billing overview">
        <div className="ol-tile ol-k-green is-static">
          <div className="ol-tile-top">
            <span className="ol-tile-ic" aria-hidden><DollarOutlined /></span>
          </div>
          <div className="ol-tile-body">
            <span className="ol-tile-label">Collected revenue</span>
            <strong className="ol-tile-val">{revenueText}</strong>
            <span className="ol-tile-sub">{info.stats.paid} paid checkout{info.stats.paid === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div className="ol-tile ol-k-indigo is-static">
          <div className="ol-tile-top">
            <span className="ol-tile-ic" aria-hidden><CheckCircleOutlined /></span>
          </div>
          <div className="ol-tile-body">
            <span className="ol-tile-label">Active subscriptions</span>
            <strong className="ol-tile-val">{info.stats.subscriptions}</strong>
            <span className="ol-tile-sub">
              Paystack: {info.mode === 'live' ? 'Live mode' : info.mode === 'test' ? 'Test mode' : 'Not configured'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`ol-tile ol-k-${(summary?.review ?? info.stats.review) > 0 ? 'amber' : 'slate'}${status === 'review' ? ' is-active' : ''}`}
          onClick={() => { setStatus(status === 'review' ? 'all' : 'review'); setPayPage(1); }}
        >
          <div className="ol-tile-top">
            <span className="ol-tile-ic" aria-hidden><ExclamationCircleOutlined /></span>
          </div>
          <div className="ol-tile-body">
            <span className="ol-tile-label">Needs review</span>
            <strong className="ol-tile-val">{summary?.review ?? info.stats.review}</strong>
            <span className="ol-tile-sub">
              {summary ? `${summary.failed} failed transaction${summary.failed === 1 ? '' : 's'}` : 'Click to filter review queue'}
            </span>
          </div>
        </button>

        <div className={`ol-tile ol-k-${info.stats.problems > 0 ? 'rose' : 'blue'} is-static`}>
          <div className="ol-tile-top">
            <span className="ol-tile-ic" aria-hidden><ApiOutlined /></span>
          </div>
          <div className="ol-tile-body">
            <span className="ol-tile-label">Webhook events (30d)</span>
            <strong className="ol-tile-val">{info.stats.problems} issue{info.stats.problems === 1 ? '' : 's'}</strong>
            <span className="ol-tile-sub">
              {merchantCurrencies.length ? `Settlement: ${merchantCurrencies.join(', ')}` : 'Paystack currencies pending'}
              {canAutoConvertUsd && info.fx_usd_xof ? ` · 1 USD ≈ ${info.fx_usd_xof.rate} XOF` : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ── Paystack Gateway Configuration Card ── */}
      <section className="ol-gateway-card" aria-label="Paystack gateway settings">
        <div className="ol-gateway-head">
          <div className="ol-gateway-title">
            <span className="ol-panel-ic" aria-hidden><ApiOutlined /></span>
            <h3>Paystack Checkout Gateway</h3>
            {info.mode === 'live'
              ? <Tag color="green">Live</Tag>
              : info.mode === 'test'
                ? <Tag color="orange">Test mode</Tag>
                : <Tag color="red">Not configured</Tag>}
            {merchantCurrencies.map(cur => <Tag key={cur} color="blue">{cur} settlement</Tag>)}
            {canAutoConvertUsd && info.fx_usd_xof && (
              <Tag color="cyan">USD auto-converts to XOF (1 USD ≈ {info.fx_usd_xof.rate} XOF)</Tag>
            )}
          </div>
        </div>

        {info.mode === 'off' && (
          <Alert
            type="warning"
            showIcon
            message={<>Add <code>PAYSTACK_SECRET_KEY</code> to <code>backend/.env</code> and restart the API to enable online checkout.</>}
          />
        )}

        <div className="ol-url-grid">
          <div className="ol-url-box">
            <span className="ol-url-label">Callback URL (Paystack → API Keys &amp; Webhooks)</span>
            {info.callback_url
              ? <Typography.Text copyable code>{info.callback_url}</Typography.Text>
              : <em style={{ color: 'var(--ol-muted)' }}>Set API_PUBLIC_URL on the server</em>}
          </div>
          <div className="ol-url-box">
            <span className="ol-url-label">Webhook URL (Paystack → API Keys &amp; Webhooks)</span>
            {info.webhook_url
              ? <Typography.Text copyable code>{info.webhook_url}</Typography.Text>
              : <em style={{ color: 'var(--ol-muted)' }}>Set API_PUBLIC_URL on the server</em>}
          </div>
        </div>
      </section>

      {unsupportedOffers.length > 0 && (
        <Alert
          type="error"
          showIcon
          message={`Paystack rejected ${unsupportedOffers.map(o => `"${o.name_en}" (${o.currency})`).join(', ')}: currency not enabled on Paystack`}
          description={`Your Paystack account accepts ${merchantCurrencies.join(', ')} (or one-time USD offers converted automatically to XOF).`}
        />
      )}

      {/* ── 3-Tier x 3-Period Subscription Plans & Discounts Configurator ── */}
      <section className="ol-plans-card" aria-label="Subscription plans and billing periods">
        <div className="ol-plans-head">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3>Subscription Plans &amp; Billing Periods</h3>
              {effectiveLearnMode === 'premium'
                ? <Tag color="green">Live on learner portal</Tag>
                : <Tag color="blue">Courses free right now</Tag>}
              {!info.catalog?.configured && <Tag color="orange">Defaults — click Save to publish prices</Tag>}
              {isDirty && <Tag color="gold">Unsaved changes</Tag>}
            </div>
            <p>
              Configure Free, Standard (courses only), and Premium (courses + Exam Simulator &amp; AI credits) across Monthly, Quarterly, and Yearly periods.
            </p>
          </div>
          <div className="ol-plans-actions">
            {isDirty && (
              <Button icon={<RollbackOutlined />} onClick={() => setDraft(catalogToDraft(info.catalog))}>
                Reset
              </Button>
            )}
            <Button type="primary" icon={<SaveOutlined />} loading={savingPlans} onClick={() => void savePlans()}>
              Save Plans &amp; Pricing
            </Button>
          </div>
        </div>

        {effectiveLearnMode === 'free' && (
          <Alert
            type="info"
            showIcon
            message="Website courses are currently in 'Free for everyone' mode"
            description="You can configure and save all 3 tiers, period prices, and discounts now. Learners will see the 3-tier pricing page as soon as you switch to Paid Plans above."
          />
        )}

        {/* Global billing parameters row */}
        <div className="ol-params-grid">
          <div>
            <div className="ol-param-label">Display &amp; Invoice Currency</div>
            <Select
              value={draft.currency}
              style={{ width: '100%' }}
              onChange={cur => setDraft(prev => ({ ...prev, currency: cur }))}
              options={info.currencies.map(c => ({
                value: c,
                label: c === 'USD' && canAutoConvertUsd ? 'USD (Auto → XOF at checkout)' : c,
              }))}
            />
          </div>
          <div>
            <div className="ol-param-label">
              <span>Quarterly Discount (%)</span>
              <Tag color="green" style={{ margin: 0 }}>-{draft.discounts.quarterly}%</Tag>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={80}
              precision={0}
              addonAfter="%"
              value={draft.discounts.quarterly}
              onChange={v => updateGlobalDiscount('quarterly', v)}
            />
          </div>
          <div>
            <div className="ol-param-label">
              <span>Yearly Discount (%)</span>
              <Tag color="green" style={{ margin: 0 }}>-{draft.discounts.yearly}%</Tag>
            </div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={80}
              precision={0}
              addonAfter="%"
              value={draft.discounts.yearly}
              onChange={v => updateGlobalDiscount('yearly', v)}
            />
          </div>
          <div>
            <div className="ol-param-label">Premium AI Credits / mo (EE &amp; EO)</div>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={9999}
              precision={0}
              value={draft.premium_ai_credits}
              onChange={v => setDraft(prev => ({ ...prev, premium_ai_credits: Math.max(0, Math.round(Number(v ?? 0))) }))}
            />
          </div>
          <div>
            <Button icon={<CalculatorOutlined />} block onClick={recalculateAllFromDiscounts}>
              Recalculate from %
            </Button>
          </div>
        </div>

        {/* 3 Plan Cards */}
        <div className="ol-tier-grid">
          {/* Free Card */}
          <div className="ol-tier-card is-free">
            <div className="ol-tier-head">
              <div>
                <div className="ol-tier-title">
                  <strong>Free</strong>
                  <Tag color="green" style={{ margin: 0 }}>Always Free</Tag>
                </div>
                <div className="ol-tier-desc">Starter tier for visitors &amp; signed-in free accounts.</div>
              </div>
            </div>
            <div className="ol-tier-body">
              <div className="ol-free-price">
                {money(0, draft.currency)} <span>/month</span>
              </div>
              <ul className="ol-free-list">
                <li><CheckOutlined /><span>Starter lessons across A1–C2 (Module 1 paths)</span></li>
                <li><CheckOutlined /><span>Adaptive CEFR level placement test</span></li>
                <li><CheckOutlined /><span>Sample practice &amp; listening labs</span></li>
                <li><CheckOutlined /><span>Progress tracking synced to account</span></li>
              </ul>
            </div>
          </div>

          {(['standard', 'premium'] as PaidTier[]).map(tierKey => {
            const isPremiumTier = tierKey === 'premium';
            const tierDraft = draft.tiers[tierKey];
            const mPrice = tierDraft.periods.monthly.price;
            const autoXofNote = draft.currency === 'USD' && canAutoConvertUsd && info.fx_usd_xof?.rate;
            return (
              <div key={tierKey} className={`ol-tier-card ${isPremiumTier ? 'is-premium' : 'is-standard'}`}>
                <div className="ol-tier-head">
                  <div>
                    <div className="ol-tier-title">
                      <strong>{isPremiumTier ? 'Premium' : 'Standard'}</strong>
                      {isPremiumTier
                        ? <Tag color="gold" icon={<CrownFilled />} style={{ margin: 0 }}>Most Popular</Tag>
                        : <Tag color="geekblue" style={{ margin: 0 }}>Courses only</Tag>}
                    </div>
                    <div className="ol-tier-desc">
                      {isPremiumTier
                        ? `All courses + TCF/TEF Exam Simulator, CO/CE past subjects & ${draft.premium_ai_credits > 0 ? `${draft.premium_ai_credits} AI credits/mo` : 'AI credits'} (EE/EO)`
                        : 'Full access to all 464+ guided courses, 407 practice labs, dictations & certificates'}
                    </div>
                  </div>
                  <div className="ol-tier-switch">
                    <span>{tierDraft.active ? 'Visible' : 'Hidden'}</span>
                    <Switch checked={tierDraft.active} onChange={v => updateTierField(tierKey, v)} />
                  </div>
                </div>

                <div className="ol-tier-body">
                  {PERIODS.map(p => {
                    const pDraft = tierDraft.periods[p.key];
                    const perMonthSubunits = Math.round((pDraft.price / p.months) * 100);
                    const totalSubunits = Math.round(pDraft.price * 100);
                    const baseline = mPrice * p.months;
                    const liveSavedPct = p.months > 1 && baseline > 0
                      ? Math.max(0, Math.round((1 - pDraft.price / baseline) * 100))
                      : 0;
                    const xofEst = autoXofNote ? approxXofSubunits(totalSubunits) : null;
                    return (
                      <div key={p.key} className="ol-period-row">
                        <div className="ol-period-top">
                          <span className="ol-period-name">
                            {p.label} <span>({pDraft.days}d)</span>
                          </span>
                          <span className="ol-period-meta">
                            <span>{p.months > 1 ? `${money(perMonthSubunits, draft.currency)}/mo` : 'Base rate'}</span>
                            {liveSavedPct > 0 && <Tag color="green" style={{ margin: 0 }}>-{liveSavedPct}%</Tag>}
                          </span>
                        </div>
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0.01}
                          step={ZERO_DECIMAL_INPUT.has(draft.currency) ? 500 : 1}
                          addonBefore={draft.currency}
                          value={pDraft.price}
                          onChange={v => updateTierPeriodPrice(tierKey, p.key, v)}
                        />
                        {xofEst && (
                          <div className="ol-xof-est">
                            Auto Paystack checkout: ~{money(xofEst, 'XOF')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Advanced Paystack Plan Codes & Raw Offer Rows */}
        <Collapse
          size="small"
          items={[
            {
              key: 'recurring',
              label: 'Recurring Paystack Plan Codes (Optional Auto-Renew)',
              children: (
                <div style={{ display: 'grid', gap: 12 }}>
                  <p style={{ margin: 0, color: 'var(--ol-muted)', fontSize: 12.5 }}>
                    Leave Auto-renew off for one-time payments (recommended for USD → automatic XOF checkout). Only turn on Auto-renew if you created a matching plan code in Paystack in your settlement currency.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                    {(['standard', 'premium'] as PaidTier[]).map(tierKey => (
                      <div key={tierKey} style={{ display: 'grid', gap: 8 }}>
                        <strong style={{ textTransform: 'capitalize', color: 'var(--ol-ink)' }}>{tierKey}</strong>
                        {PERIODS.map(p => {
                          const pd = draft.tiers[tierKey].periods[p.key];
                          return (
                            <div key={p.key} style={{ display: 'grid', gridTemplateColumns: '86px 70px 1fr', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 12.5 }}>{p.label}</span>
                              <Switch
                                size="small"
                                checked={pd.recurring}
                                checkedChildren="Auto"
                                unCheckedChildren="Once"
                                onChange={v => updatePeriodRecurring(tierKey, p.key, { recurring: v })}
                              />
                              <Input
                                size="small"
                                placeholder="PLN_..."
                                disabled={!pd.recurring}
                                value={pd.paystack_plan_code}
                                onChange={e => updatePeriodRecurring(tierKey, p.key, { paystack_plan_code: e.target.value })}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            },
            {
              key: 'raw-offers',
              label: `All Offer Rows (Advanced · ${info.offers.length})`,
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <Button size="small" icon={<PlusOutlined />} onClick={() => setEdit('new')}>Add custom offer row</Button>
                  </div>
                  <Table<OfferRow>
                    className="ol-table"
                    rowKey="id"
                    size="small"
                    dataSource={info.offers}
                    pagination={false}
                    scroll={{ x: 760 }}
                    locale={{ emptyText: 'No offer rows saved yet.' }}
                    columns={[
                      {
                        title: 'Offer',
                        key: 'name',
                        render: (_, o) => (
                          <div>
                            <strong style={{ color: 'var(--ol-ink)' }}>{o.name_en}</strong>
                            <div style={{ color: 'var(--ol-muted)', fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              <span className="ol-ref-pill">{o.code}</span>
                              <Tag color={o.plan_tier === 'standard' ? 'blue' : 'gold'} style={{ margin: 0 }}>{o.plan_tier || 'premium'}</Tag>
                              {o.billing_period && <Tag style={{ margin: 0 }}>{o.billing_period}</Tag>}
                            </div>
                          </div>
                        ),
                      },
                      {
                        title: 'Price',
                        key: 'price',
                        render: (_, o) => {
                          const converted = isAutoConverted(o.currency, o.recurring);
                          const xofEst = converted ? approxXofSubunits(o.amount) : null;
                          return (
                            <div>
                              <div className="ol-money-strong">{money(o.amount, o.currency)}</div>
                              {converted && (
                                <div className="ol-xof-est">Auto → {xofEst ? `~${money(xofEst, 'XOF')}` : 'XOF'}</div>
                              )}
                            </div>
                          );
                        },
                      },
                      { title: 'Duration', key: 'days', render: (_, o) => `${o.days}d` },
                      { title: 'Billing', key: 'type', render: (_, o) => (o.recurring ? <Tooltip title={o.paystack_plan_code}><Tag color="gold">Recurring</Tag></Tooltip> : <Tag>One payment</Tag>) },
                      { title: 'Visible', key: 'active', render: (_, o) => (o.active ? <Tag color="green">Active</Tag> : <Tag>Hidden</Tag>) },
                      { title: '', key: 'edit', align: 'right', render: (_, o) => <Button size="small" icon={<EditOutlined />} onClick={() => setEdit(o)}>Edit</Button> },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </section>

      {/* ── Transactions & Invoices Ledger ── */}
      <section className="ol-panel" aria-label="Transactions ledger">
        <div className="ol-panel-head">
          <div className="ol-panel-title">
            <span className="ol-panel-ic" aria-hidden><CreditCardOutlined /></span>
            <div>
              <h3>Payments &amp; Invoices</h3>
              <span className="ol-panel-sub">All Paystack checkouts, renewals, verification outcomes, and downloadable PDF invoices.</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button icon={<DownloadOutlined />} onClick={exportPaymentsCsv} disabled={!payments.length}>
              {r.isMobile ? 'CSV' : 'Export CSV'}
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => { void load(); void loadPayments(); }}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="ol-toolbar">
          <Segmented
            value={status}
            onChange={v => { setStatus(String(v)); setPayPage(1); }}
            options={[
              { label: segLabel('All', summary?.all), value: 'all' },
              { label: segLabel('Paid', summary?.success), value: 'success' },
              { label: segLabel('To review', summary?.review), value: 'review' },
              { label: segLabel('Failed', summary?.failed), value: 'failed' },
              { label: segLabel('Refunded', summary?.refunded), value: 'refunded' },
              { label: segLabel('In progress', summary?.initialized), value: 'initialized' },
            ]}
          />
          <Input
            allowClear
            className="ol-search"
            prefix={<SearchOutlined />}
            placeholder="Search learner, email, invoice or reference"
            value={q}
            onChange={e => { setQ(e.target.value); setPayPage(1); }}
          />
        </div>

        {r.isMobile ? (
          payLoading && !paymentsData ? (
            <div style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 5 }} /></div>
          ) : !payments.length ? (
            <div className="ol-empty">
              <span className="ol-empty-ic"><CreditCardOutlined /></span>
              <strong>No transactions found</strong>
              <span>{status !== 'all' || q.trim() ? 'Try clearing the status filter or search query.' : 'Payments will appear here once learners start checking out.'}</span>
            </div>
          ) : (
            <div className="ol-cards">
              {payments.map(p => {
                const dispCur = p.display_currency || p.currency;
                const dispAmt = p.display_amount ?? p.amount;
                const converted = dispCur !== p.currency;
                return (
                  <div key={p.id} className="ol-card" style={{ cursor: 'default' }}>
                    <div className="ol-card-top">
                      <div className="ol-person">
                        <span className="ol-avatar is-learner">{initials(p.first_name, p.last_name, p.email)}</span>
                        <div className="ol-person-text">
                          <div className="ol-person-name">{p.first_name} {p.last_name}</div>
                          <span style={{ fontSize: 12, color: 'var(--ol-muted)' }}>{p.email}</span>
                        </div>
                      </div>
                      <span className={`ol-pay-pill is-${p.status}`}><i aria-hidden />{STATUS_LABEL[p.status] || p.status}</span>
                    </div>
                    <div className="ol-card-meta">
                      <div>
                        <div className="ol-money-strong">{money(dispAmt, dispCur)}</div>
                        {converted && <div className="ol-money-sub">Settled: {money(p.amount, p.currency)}</div>}
                      </div>
                      <div className="ol-when" style={{ textAlign: 'right' }}>
                        <span>{p.offer || '—'}</span>
                        <em>{fmtDate(p.paid_at || p.created_at, L)}</em>
                      </div>
                    </div>
                    {p.status_detail && <div style={{ fontSize: 12, color: 'var(--ol-muted)' }}>{p.status_detail}</div>}
                    <div className="ol-card-meta">
                      <Typography.Text copyable={{ text: p.reference }} className="ol-ref-pill">
                        {p.reference.slice(0, 16)}…
                      </Typography.Text>
                      {p.status === 'success' ? (
                        <Button icon={<DownloadOutlined />} size="small" onClick={() => void downloadInvoice(p)}>Invoice PDF</Button>
                      ) : ['initialized', 'review'].includes(p.status) ? (
                        <Button icon={<SyncOutlined />} size="small" onClick={() => void recheck(p)}>Ask Paystack</Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <Table<PaymentRow>
            className="ol-table"
            rowKey="id"
            dataSource={payments}
            loading={payLoading}
            sticky={{ offsetHeader: headerHeight(r.isMobile) }}
            scroll={{ x: 980 }}
            pagination={{
              current: payPage,
              pageSize: payLimit,
              total: paymentsData?.total ?? payments.length,
              showSizeChanger: true,
              pageSizeOptions: ['25', '50', '100'],
              showTotal: (total, [a, b]) => `${a}–${b} of ${total}`,
              onChange: (nextPage, nextSize) => {
                setPayPage(nextSize !== payLimit ? 1 : nextPage);
                setPayLimit(nextSize);
              },
            }}
            locale={{
              emptyText: (
                <div className="ol-empty">
                  <span className="ol-empty-ic"><CreditCardOutlined /></span>
                  <strong>No transactions match these filters</strong>
                  <span>{status !== 'all' || q.trim() ? 'Reset filters to inspect all transactions.' : 'Paystack checkouts will appear here.'}</span>
                </div>
              ),
            }}
            columns={[
              {
                title: 'Date',
                key: 'date',
                width: 130,
                render: (_, p) => (
                  <div className="ol-when">
                    <span>{fmtDate(p.paid_at || p.created_at, L)}</span>
                    <em>{dayjs(p.paid_at || p.created_at).format('HH:mm')}</em>
                  </div>
                ),
              },
              {
                title: 'Learner',
                key: 'who',
                render: (_, p) => (
                  <div className="ol-person">
                    <span className="ol-avatar is-learner" aria-hidden>{initials(p.first_name, p.last_name, p.email)}</span>
                    <div className="ol-person-text">
                      <div className="ol-person-name">{p.first_name} {p.last_name}</div>
                      <div className="ol-person-sub">{p.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Plan / Offer',
                key: 'offer',
                render: (_, p) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ol-ink)' }}>
                      {p.offer || '—'}
                      {p.renewal && <Tag style={{ marginLeft: 6 }}>renewal</Tag>}
                    </div>
                    {p.invoice_number && (
                      <div style={{ marginTop: 3 }}>
                        <span className="ol-ref-pill">{p.invoice_number}</span>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: 'Amount',
                key: 'amount',
                render: (_, p) => {
                  const dispCur = p.display_currency || p.currency;
                  const dispAmt = p.display_amount ?? p.amount;
                  const converted = dispCur !== p.currency;
                  return (
                    <div>
                      <div className="ol-money-strong">{money(dispAmt, dispCur)}</div>
                      {converted && <div className="ol-money-sub">Settled: {money(p.amount, p.currency)}</div>}
                    </div>
                  );
                },
              },
              {
                title: 'Status',
                key: 'status',
                render: (_, p) => (
                  <div>
                    <span className={`ol-pay-pill is-${p.status}`}>
                      <i aria-hidden />
                      {STATUS_LABEL[p.status] || p.status}
                    </span>
                    {p.status_detail && (
                      <div style={{ color: 'var(--ol-muted)', fontSize: 12, maxWidth: 260, marginTop: 3 }}>{p.status_detail}</div>
                    )}
                    {p.status === 'success' && p.premium_until && (
                      <div style={{ color: 'var(--ol-subtle)', fontSize: 11.5, marginTop: 2 }}>Active until {fmtDate(p.premium_until, L)}</div>
                    )}
                  </div>
                ),
              },
              {
                title: 'Reference',
                key: 'ref',
                render: (_, p) => (
                  <Typography.Text copyable={{ text: p.reference }} className="ol-ref-pill">
                    {p.reference.slice(0, 18)}…
                  </Typography.Text>
                ),
              },
              {
                title: '',
                key: 'act',
                align: 'right',
                render: (_, p) => (
                  p.status === 'success' ? (
                    <Button icon={<DownloadOutlined />} size="small" onClick={() => void downloadInvoice(p)}>Invoice PDF</Button>
                  ) : ['initialized', 'review'].includes(p.status) ? (
                    <Button icon={<SyncOutlined />} size="small" onClick={() => void recheck(p)}>Ask Paystack</Button>
                  ) : null
                ),
              },
            ]}
          />
        )}
      </section>

      {edit && (
        <OfferModal
          offer={edit === 'new' ? null : edit}
          currencies={info.currencies}
          merchantCurrencies={merchantCurrencies}
          onClose={() => setEdit(null)}
          onSaved={() => { setEdit(null); void load(); }}
        />
      )}
    </div>
  );
}

function OfferModal({ offer, currencies, merchantCurrencies, onClose, onSaved }: { offer: OfferRow | null; currencies: string[]; merchantCurrencies: string[]; onClose: () => void; onSaved: () => void }) {
  const { apiCall } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [busy, setBusy] = useState(false);
  const recurring = Form.useWatch('recurring', form);
  const selectedCurrency = Form.useWatch('currency', form) as string | undefined;
  const canConvertUsd = !recurring && selectedCurrency === 'USD' && merchantCurrencies.includes('XOF');
  const currencyMismatch = Boolean(selectedCurrency && merchantCurrencies.length > 0 && !merchantCurrencies.includes(selectedCurrency) && !canConvertUsd);

  const save = async () => {
    const v = await form.validateFields();
    const body = { ...v, amount: Math.round(Number(v.price) * 100), price: undefined };
    setBusy(true);
    try {
      if (offer) await call(apiCall, `/admin/learners/billing/offers/${offer.id}`, 'PUT', body);
      else await call(apiCall, '/admin/learners/billing/offers', 'POST', body);
      message.success('Offer row saved');
      onSaved();
    } catch (e) { message.error((e as Error).message); } finally { setBusy(false); }
  };

  const defaultCurrency = currencies.includes('USD') && merchantCurrencies.includes('XOF') ? 'USD' : (merchantCurrencies[0] || currencies[0]);
  return (
    <Modal
      open
      title={offer ? 'Edit offer row' : 'New offer row'}
      onCancel={onClose}
      onOk={() => void save()}
      okText="Save offer"
      confirmLoading={busy}
      width={660}
      className="ol-modal"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={offer
          ? { ...offer, plan_tier: offer.plan_tier || 'premium', billing_period: offer.billing_period || null, discount_pct: offer.discount_pct ?? 0, price: offer.amount / 100 }
          : { plan_tier: 'premium', billing_period: 'monthly', discount_pct: 0, days: 30, currency: defaultCurrency, recurring: false, active: false, sort: 0 }}
      >
        {currencyMismatch && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 14 }}
            message={`${selectedCurrency} is not currently enabled on your Paystack account (enabled: ${merchantCurrencies.join(', ')}).`}
          />
        )}
        <div className="ol-modal-grid">
          <Form.Item name="name_en" label="Name (English)" rules={[{ required: true, max: 80 }]}><Input placeholder="Premium — Monthly" /></Form.Item>
          <Form.Item name="name_fr" label="Name (French)" rules={[{ required: true, max: 80 }]}><Input placeholder="Premium — Mensuel" /></Form.Item>
          <Form.Item name="description_en" label="Short line (English)"><Input maxLength={300} /></Form.Item>
          <Form.Item name="description_fr" label="Short line (French)"><Input maxLength={300} /></Form.Item>
          <Form.Item name="plan_tier" label="Plan Tier" rules={[{ required: true }]}>
            <Select options={[{ value: 'standard', label: 'Standard (Courses only)' }, { value: 'premium', label: 'Premium (Courses + Exams & AI)' }]} />
          </Form.Item>
          <Form.Item name="billing_period" label="Billing Period">
            <Select allowClear options={[{ value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' }, { value: 'yearly', label: 'Yearly' }]} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number', min: 0.01 }]}>
            <InputNumber style={{ width: '100%' }} min={0.01} step={1} />
          </Form.Item>
          <Form.Item name="currency" label="Currency" rules={[{ required: true }]}>
            <Select options={currencies.map(c => ({
              value: c,
              label: merchantCurrencies.length > 0
                ? merchantCurrencies.includes(c)
                  ? `${c} (enabled on Paystack)`
                  : c === 'USD' && merchantCurrencies.includes('XOF')
                    ? `${c} (USD → auto XOF checkout)`
                    : `${c} (not enabled)`
                : c,
            }))} />
          </Form.Item>
          <Form.Item name="days" label="Access duration (days)" rules={[{ required: true, type: 'number', min: 1, max: 3660 }]}><InputNumber style={{ width: '100%' }} min={1} max={3660} /></Form.Item>
          <Form.Item name="discount_pct" label="Discount (%)"><InputNumber style={{ width: '100%' }} min={0} max={95} /></Form.Item>
          <Form.Item name="code" label="Code" rules={[{ required: true, pattern: /^[a-z0-9][a-z0-9-]{1,38}$/, message: 'Lower-case letters, digits and dashes' }]}><Input placeholder="premium-monthly" /></Form.Item>
          <Form.Item name="sort" label="Order"><InputNumber style={{ width: '100%' }} min={0} max={999} /></Form.Item>
          <Form.Item name="recurring" label="Renews automatically" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name="paystack_plan_code" label="Paystack plan code" rules={[{ required: !!recurring, pattern: /^PLN_[A-Za-z0-9]+$/, message: 'PLN_… from Paystack → Plans' }]}>
            <Input placeholder="PLN_…" disabled={!recurring} />
          </Form.Item>
          <Form.Item name="active" label="Active on site" valuePropName="checked"><Switch /></Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
