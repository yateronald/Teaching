// Payment helpers shared by the account pages (see Billing.tsx).
import type { Lang } from '../types';
import { siteApi } from './api';

export interface Offer { code: string; name: { en: string; fr: string }; description: { en: string; fr: string }; days: number; amount: number; currency: string; recurring: boolean }

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

