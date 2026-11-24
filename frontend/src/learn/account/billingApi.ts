// Payment helpers shared by the account pages (see Billing.tsx).
import type { Lang } from '../types';
import { apiUrl, siteApi } from './api';

export type PaidPlanTier = 'standard' | 'premium';
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

export interface Offer {
  code: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  plan_tier?: PaidPlanTier;
  billing_period?: BillingPeriod | null;
  discount_pct?: number;
  days: number;
  amount: number;
  currency: string;
  recurring: boolean;
  charge?: { amount: number; currency: string; fx_rate: number } | null;
}

export interface PlanPeriodOffer {
  code: string;
  amount: number;
  currency: string;
  days: number;
  discount_pct: number;
  recurring: boolean;
  active: boolean;
  configured?: boolean;
  charge?: { amount: number; currency: string; fx_rate: number } | null;
}

export interface PlanCatalog {
  configured: boolean;
  currency: string;
  discounts: { quarterly: number; yearly: number };
  premium_ai_credits: number;
  tiers: {
    free: { active: boolean };
    standard: { active: boolean; periods: Record<BillingPeriod, PlanPeriodOffer> };
    premium: { active: boolean; periods: Record<BillingPeriod, PlanPeriodOffer> };
  };
}

export const DEFAULT_PLAN_CATALOG: PlanCatalog = {
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

/** A price as Paystack counts it (the currency's smallest unit), for display. */
export const formatPrice = (amount: number, currency: string, lang: Lang) => {
  const cur = currency.toUpperCase();
  const locale = cur === 'USD' ? (lang === 'fr' ? 'fr-CA' : 'en-US') : (lang === 'fr' ? 'fr-CA' : 'en-CA');
  const digits = amount % 100 === 0 ? 0 : 2;
  try {
    const out = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount / 100);
    return cur === 'USD' && lang === 'fr' ? out.replace(/\s*US\b/, '') : out;
  } catch {
    return `${(amount / 100).toFixed(digits)} ${cur}`;
  }
};

/** Starts the payment of an offer: the server opens Paystack's checkout, we go there. */
export async function startCheckout(code: string, lang: Lang): Promise<void> {
  const { url } = await siteApi<{ url: string }>('/learn/billing/checkout', { body: { offer: code, lang } });
  if (!/^https:\/\/checkout\.paystack\.com\//.test(url)) throw { code: 'PROVIDER', error: '' };
  window.location.assign(url);
}

/** Downloads an official PDF invoice for a confirmed payment. */
export async function downloadInvoicePdf(reference: string, filename?: string): Promise<void> {
  const res = await fetch(apiUrl(`/learn/billing/payments/${encodeURIComponent(reference)}/invoice.pdf`), {
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { code: data.code || 'NO_INVOICE', error: data.error || '' };
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `Invoice-${reference}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

