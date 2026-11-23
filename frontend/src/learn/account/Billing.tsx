// Paying for Premium on the website (Paystack): the prices, the payment
// history and the subscription. The page only names the offer; the price,
// the checkout and the confirmation of the payment are the server's business.
import { useCallback, useEffect, useState } from 'react';
import { CheckCircleFilled, CrownFilled, LoadingOutlined, LockOutlined } from '@ant-design/icons';
import type { Lang } from '../types';
import { siteApi, type ApiError } from './api';
import { formatPrice, startCheckout, type Offer } from './billingApi';
import { errorText } from './copy';
import { loadAccount, useAccount } from './store';
import './account.css';

interface Payment { reference: string; amount: number; currency: string; days: number; status: string; created_at: string; paid_at: string | null; renewal: boolean; name: { en: string | null; fr: string | null }; premium_until: string | null }
interface BillingState { enabled: boolean; offers: Offer[]; payments: Payment[]; subscription: { status: string; next_payment_date: string | null; name: { en: string | null; fr: string | null } } | null; can_pay?: boolean }

const T = {
  en: {
    choose: 'Choose your Premium',
    secure: 'Secure payment with Paystack: card or mobile money. We never see your card details.',
    pay: 'Pay',
    extend: 'Add this period',
    perMonth: (d: number) => (d >= 365 ? `${Math.round(d / 365)} year${d >= 730 ? 's' : ''}` : d >= 28 ? `${Math.round(d / 30)} month${d >= 56 ? 's' : ''}` : `${d} days`),
    renews: 'Renews automatically, cancel at any time',
    once: 'One payment, no renewal',
    redirecting: 'Opening the secure payment page…',
    history: 'Your payments',
    status: { success: 'Paid', failed: 'Failed', abandoned: 'Not finished', review: 'Being checked', refunded: 'Refunded', disputed: 'Disputed' } as Record<string, string>,
    until: (d: string) => `Premium until ${d}`,
    renewal: 'Renewal',
    sub: 'Your subscription',
    subActive: (d: string) => `Renews on ${d}.`,
    subNonRenewing: 'Will not renew: Premium stays until the end of the period you paid.',
    subAttention: 'The last renewal failed. Update your card to keep Premium.',
    cancel: 'Stop the renewals',
    cancelConfirm: 'Stop the renewals? Premium stays until the end of the period you paid.',
    card: 'Update my card',
    company: 'Your Premium is managed by your company.',
    results: {
      success: 'Payment received: your Premium is active. Thank you!',
      pending: 'Your payment is being confirmed. Premium appears here within a few minutes.',
      failed: 'The payment did not go through. You were not charged; you can try again.',
      cancelled: 'Payment cancelled. You were not charged.',
      review: 'We received your payment and are checking it. Our team will contact you if needed.',
    } as Record<string, string>,
  },
  fr: {
    choose: 'Choisissez votre Premium',
    secure: 'Paiement sécurisé avec Paystack : carte ou mobile money. Nous ne voyons jamais les données de votre carte.',
    pay: 'Payer',
    extend: 'Ajouter cette période',
    perMonth: (d: number) => (d >= 365 ? `${Math.round(d / 365)} an${d >= 730 ? 's' : ''}` : d >= 28 ? `${Math.round(d / 30)} mois` : `${d} jours`),
    renews: 'Renouvellement automatique, résiliable à tout moment',
    once: 'Un seul paiement, sans renouvellement',
    redirecting: 'Ouverture de la page de paiement sécurisée…',
    history: 'Vos paiements',
    status: { success: 'Payé', failed: 'Échoué', abandoned: 'Non terminé', review: 'En vérification', refunded: 'Remboursé', disputed: 'Contesté' } as Record<string, string>,
    until: (d: string) => `Premium jusqu’au ${d}`,
    renewal: 'Renouvellement',
    sub: 'Votre abonnement',
    subActive: (d: string) => `Renouvellement le ${d}.`,
    subNonRenewing: 'Ne sera pas renouvelé : Premium reste actif jusqu’à la fin de la période payée.',
    subAttention: 'Le dernier renouvellement a échoué. Mettez à jour votre carte pour garder Premium.',
    cancel: 'Arrêter les renouvellements',
    cancelConfirm: 'Arrêter les renouvellements ? Premium reste actif jusqu’à la fin de la période payée.',
    card: 'Mettre à jour ma carte',
    company: 'Votre Premium est géré par votre entreprise.',
    results: {
      success: 'Paiement reçu : votre Premium est actif. Merci !',
      pending: 'Votre paiement est en cours de confirmation. Premium apparaît ici dans quelques minutes.',
      failed: 'Le paiement n’a pas abouti. Vous n’avez pas été débité ; vous pouvez réessayer.',
      cancelled: 'Paiement annulé. Vous n’avez pas été débité.',
      review: 'Nous avons reçu votre paiement et le vérifions. Notre équipe vous contacte si besoin.',
    } as Record<string, string>,
  },
};

const fmtDate = (iso: string, lang: Lang) => new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

/** The prices, each with its payment button. */
export function Offers({ lang, offers, premium }: { lang: Lang; offers: Offer[]; premium: boolean }) {
  const t = T[lang];
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const pay = async (code: string) => {
    setBusy(code);
    setError('');
    try { await startCheckout(code, lang); } catch (e) { setError(errorText(lang, e as ApiError)); setBusy(''); }
  };
  if (!offers.length) return null;
  return (
    <div className="ax-offers" id="premium">
      <p className="ax-offers-k"><CrownFilled aria-hidden /> {t.choose}</p>
      <div className="ax-offer-grid">
        {offers.map(o => (
          <div key={o.code} className={`ax-offer${o.recurring ? ' is-recurring' : ''}`}>
            <p className="ax-offer-name">{o.name[lang]}</p>
            <p className="ax-offer-price">{formatPrice(o.amount, o.currency, lang)}<small> / {t.perMonth(o.days)}</small></p>
            {o.description[lang] && <p className="ax-offer-desc">{o.description[lang]}</p>}
            <p className="ax-offer-kind">{o.recurring ? t.renews : t.once}</p>
            <button type="button" className="lp-btn lp-btn-primary" disabled={!!busy} onClick={() => pay(o.code)}>
              {busy === o.code ? <LoadingOutlined /> : <LockOutlined />}{premium ? t.extend : t.pay}
            </button>
          </div>
        ))}
      </div>
      {busy && <p className="ax-hint" role="status">{t.redirecting}</p>}
      {error && <p className="ax-error" role="alert">{error}</p>}
      <p className="ax-hint ax-secure"><LockOutlined aria-hidden /> {t.secure}</p>
    </div>
  );
}

/** What My account shows about paying: the result of a payment, prices, history, subscription. */
export function BillingSection({ lang, result }: { lang: Lang; result: string | null }) {
  const t = T[lang];
  const { access } = useAccount();
  const [data, setData] = useState<BillingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(() => siteApi<BillingState>('/learn/billing/me').then(setData).catch(() => setData(null)), []);
  useEffect(() => { load(); }, [load]);
  // Back from Paystack: the server checked the payment; read the account again.
  useEffect(() => { if (result) loadAccount(true); }, [result]);

  const act = async (path: string, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError('');
    try {
      const out = await siteApi<{ url?: string }>(path, { body: {} });
      if (out.url && /^https:\/\/([a-z0-9-]+\.)*paystack\.com\//.test(out.url)) { window.location.assign(out.url); return; }
      await load();
    } catch (e) { setError(errorText(lang, e as ApiError)); } finally { setBusy(false); }
  };

  const banner = result && t.results[result] ? (
    <p className={`ax-note ${result === 'success' ? 'is-ok' : result === 'failed' ? 'is-warn' : ''}`} role="status">
      {result === 'success' && <CheckCircleFilled />} {t.results[result]}
    </p>
  ) : null;
  if (!data?.enabled) return banner;
  const premium = access.level === 'premium';
  const sub = data.subscription;
  return (
    <>
      {banner}
      {data.can_pay === false ? (access.premium?.via === 'company' ? <p className="ax-hint">{t.company}</p> : null)
        : (!premium || access.premium?.until) && <Offers lang={lang} offers={data.offers.filter(o => !(o.recurring && sub && sub.status !== 'non-renewing'))} premium={premium} />}
      {sub && (
        <section className="ax-section">
          <h2>{t.sub}{sub.name[lang] ? `: ${sub.name[lang]}` : ''}</h2>
          <p>{sub.status === 'active' && sub.next_payment_date ? t.subActive(fmtDate(sub.next_payment_date, lang)) : sub.status === 'non-renewing' ? t.subNonRenewing : sub.status === 'attention' ? t.subAttention : ''}</p>
          <div className="ax-row">
            {sub.status !== 'non-renewing' && <button type="button" className="lp-btn lp-btn-ghost" disabled={busy} onClick={() => act('/learn/billing/subscription/card')}>{t.card}</button>}
            {sub.status !== 'non-renewing' && <button type="button" className="ax-linkbtn" disabled={busy} onClick={() => act('/learn/billing/subscription/cancel', t.cancelConfirm)}>{t.cancel}</button>}
          </div>
          {error && <p className="ax-error" role="alert">{error}</p>}
        </section>
      )}
      {data.payments.length > 0 && (
        <section className="ax-section">
          <h2>{t.history}</h2>
          <ul className="ax-payments">
            {data.payments.map(p => (
              <li key={p.reference}>
                <span><strong>{p.name[lang] || 'Premium'}{p.renewal ? ` · ${t.renewal}` : ''}</strong><small>{fmtDate(p.paid_at || p.created_at, lang)}{p.status === 'success' && p.premium_until ? ` · ${t.until(fmtDate(p.premium_until, lang))}` : ''}</small></span>
                <span className="ax-pay-amount">{formatPrice(p.amount, p.currency, lang)}</span>
                <span className={`ax-pay-status is-${p.status}`}>{t.status[p.status] || p.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
