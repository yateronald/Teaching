// Payment helpers shared by the account pages (see Billing.tsx).
import type { Lang } from '../types';
import { apiUrl, siteApi } from './api';

export interface Offer {
  code: string;
  name: { en: string; fr: string };
  description: { en: string; fr: string };
  days: number;
  amount: number;
  currency: string;
  recurring: boolean;
  charge?: { amount: number; currency: string; fx_rate: number } | null;
}

/** A price as Paystack counts it (the currency's smallest unit), for display. */
export const formatPrice = (amount: number, currency: string, lang: Lang) => {
  try {
    return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', { style: 'currency', currency, maximumFractionDigits: amount % 100 === 0 ? 0 : 2 }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency}`;
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

