// Addresses of the account pages (the same ones as backend/routes/siteAuth.js).
import type { Lang } from '../types';

export type AccountPage = 'signIn' | 'signUp' | 'forgot' | 'account' | 'subscription' | 'complete';

export const ACCOUNT_SLUG: Record<Lang, Record<AccountPage, string>> = {
  en: { signIn: 'sign-in', signUp: 'sign-up', forgot: 'forgot-password', account: 'account', subscription: 'subscription', complete: 'complete-account' },
  fr: { signIn: 'connexion', signUp: 'inscription', forgot: 'mot-de-passe-oublie', account: 'compte', subscription: 'abonnement', complete: 'finaliser-compte' },
};

const BASE: Record<Lang, string> = { en: '/learn/', fr: '/fr/apprendre/' };

/** /learn/sign-in/, /fr/apprendre/connexion/… with an optional return address. */
export function accountPath(page: AccountPage, lang: Lang, next?: string): string {
  const path = `${BASE[lang]}${ACCOUNT_SLUG[lang][page]}/`;
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

/** The account page an address shows, if any. */
export function accountPageOf(slug: string, lang: Lang): AccountPage | null {
  const hit = (Object.entries(ACCOUNT_SLUG[lang]) as [AccountPage, string][]).find(([, s]) => s === slug);
  return hit ? hit[0] : null;
}

/** A return address inside the courses only (never another site). */
export function safeNext(next: string | null | undefined, lang: Lang): string {
  const n = String(next || '');
  if (n.length > 300 || !/^\/(learn|fr\/apprendre)(\/|$)/.test(n) || n.includes('//') || n.includes('\\')) return accountPath('account', lang);
  return n;
}
