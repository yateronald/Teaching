// What a locked lesson or exercise shows instead of its content: who may open
// it, and the next step (a free account, or Premium).
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CrownFilled, LoadingOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { canOpen, type Tier } from '../access';
import type { Lang } from '../types';
import { siteApi } from './api';
import { ACCOUNT_COPY, errorText } from './copy';
import { accountPath } from './paths';
import { freeForAllCopy, setAccount, useAccount } from './store';
import './account.css';

/** "Ask for Premium" (until online payment exists): one open request per person. */
export function PremiumRequest({ lang, withMessage = false }: { lang: Lang; withMessage?: boolean }) {
  const c = ACCOUNT_COPY[lang];
  const account = useAccount();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (account.premiumRequest) return <p className="ax-note is-ok" role="status">{c.premiumAsked}</p>;
  const send = async () => {
    setBusy(true);
    setError('');
    try {
      await siteApi('/site-auth/premium-request', { body: { message } });
      setAccount({ premiumRequest: { status: 'open', created_at: new Date().toISOString() } });
    } catch (e) {
      setError(errorText(lang, e as { code?: string; error?: string }));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="ax-request">
      {withMessage && (
        <label className="ax-field">
          <span>{c.premiumMessage}</span>
          <textarea rows={2} maxLength={500} value={message} onChange={e => setMessage(e.target.value)} />
        </label>
      )}
      <button type="button" className="lp-btn lp-btn-primary" onClick={send} disabled={busy}>
        {busy ? <LoadingOutlined /> : <CrownFilled />}{c.premiumAsk}
      </button>
      {error && <p className="ax-error" role="alert">{error}</p>}
    </div>
  );
}

/** The lock card: a visitor is invited to sign up, a free account to ask for Premium. */
export function AccessGate({ lang, tier, kind = 'lesson' }: { lang: Lang; tier: Tier; kind?: 'lesson' | 'item' }) {
  const c = ACCOUNT_COPY[lang];
  const account = useAccount();
  const { pathname } = useLocation();
  // Before the access is known, nothing is said to be locked (the courses may be free for everyone).
  if (account.status === 'unknown') return <p className="ax-opening" role="status"><LoadingOutlined /> {c.checking}</p>;
  const signedIn = !!account.user;
  const premium = tier === 'premium';
  const title = premium ? c.lockPremiumTitle : c.lockFreeTitle;
  const text = kind === 'item'
    ? (premium ? c.lockItemPremium : c.lockItemFree)
    : premium ? (signedIn ? c.lockPremiumFree : c.lockPremiumVisitor) : c.lockFreeText;
  return (
    <div className={`ax-gate${premium ? ' is-premium' : ''}`}>
      <p className="ax-gate-t">{premium ? <CrownFilled aria-hidden /> : <LockOutlined aria-hidden />} {title}</p>
      <p className="ax-gate-text">{text}</p>
      {signedIn && premium ? (
        account.payments
          ? <div className="lp-hero-ctas"><Link to={accountPath('subscription', lang)} className="lp-btn lp-btn-primary"><CrownFilled />{c.seePrices}</Link></div>
          : <PremiumRequest lang={lang} />
      ) : (
        <div className="lp-hero-ctas">
          <Link to={accountPath('signUp', lang, pathname)} className="lp-btn lp-btn-primary"><UnlockOutlined />{c.signUp}</Link>
          <Link to={accountPath('signIn', lang, pathname)} className="lp-btn lp-btn-ghost">{c.signIn}</Link>
        </div>
      )}
    </div>
  );
}

/** A small label: open to all, free with an account, or Premium. */
export function TierBadge({ lang, tier, level }: { lang: Lang; tier: Tier; level?: Tier }) {
  const c = ACCOUNT_COPY[lang];
  const account = useAccount();
  if (tier === 'visitor' || freeForAllCopy(account)) return <span className="ax-badge is-open">{c.freeBadge}</span>;
  const open = level ? canOpen(level, tier) : false;
  if (tier === 'free') return <span className={`ax-badge is-account${open ? ' is-unlocked' : ''}`}>{open ? <UnlockOutlined aria-hidden /> : <LockOutlined aria-hidden />}{c.accountBadge}</span>;
  return <span className={`ax-badge is-premium${open ? ' is-unlocked' : ''}`}><CrownFilled aria-hidden />{c.premiumBadge}</span>;
}
