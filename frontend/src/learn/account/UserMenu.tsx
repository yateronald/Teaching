// Profile dropdown menu shared by SiteHeader (main navigation) and AccountButton (academy bar).
// Deliberately lightweight (no course catalog or account.css) so the landing bundle stays small.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CrownFilled, CrownOutlined, DownOutlined, ExportOutlined, LogoutOutlined, UserOutlined,
} from '@ant-design/icons';
import type { Lang } from '../types';
import { resolveUserBadge } from './identity';
import { accountPath } from './paths';
import { signOut, useAccount } from './store';

const LABEL = {
  en: {
    menu: 'Account menu',
    profile: 'Profile',
    subscription: 'Subscription',
    portal: (badge: string) => `${badge} portal`,
    signOut: 'Log out',
    free: 'Free',
    premium: 'Premium',
  },
  fr: {
    menu: 'Menu du compte',
    profile: 'Profil',
    subscription: 'Abonnement',
    portal: (badge: string) => `Portail ${badge}`,
    signOut: 'Déconnexion',
    free: 'Gratuit',
    premium: 'Premium',
  },
} as const;

export function UserMenu({ lang, variant = 'header' }: { lang: Lang; variant?: 'header' | 'academy' }) {
  const account = useAccount();
  const identity = resolveUserBadge(account, lang);
  const person = account.user ?? account.portalUser;
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!identity || !person) return null;

  const t = LABEL[lang];
  const isHeader = variant === 'header';
  const subTag = identity.variant === 'premium' ? t.premium : identity.variant === 'free' ? t.free : identity.badge;
  const triggerClass = isHeader
    ? `lp-user-pill is-${identity.variant}${open ? ' is-open' : ''}`
    : `ax-acct-btn is-in is-${identity.variant}${open ? ' is-open' : ''}`;

  return (
    <div className="lp-um" ref={rootRef}>
      <button
        type="button"
        className={triggerClass}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${identity.fullName} — ${t.menu}`}
        title={identity.fullName}
        onClick={() => setOpen(v => !v)}
      >
        <span className={isHeader ? 'lp-user-ava' : 'ax-avatar'} aria-hidden>{identity.initial}</span>
        <span className={isHeader ? 'lp-user-name' : 'ax-acct-name'}>{identity.name}</span>
        <span className={isHeader ? 'lp-user-role' : 'ax-acct-tier'}>
          {identity.variant === 'premium' && <CrownFilled aria-hidden />}
          {identity.badge}
        </span>
        <DownOutlined className={`lp-um-caret${open ? ' is-open' : ''}`} aria-hidden />
      </button>

      {open && (
        <div className="lp-um-panel" role="menu" aria-label={t.menu}>
          <div className="lp-um-head">
            <span className={`lp-um-ava is-${identity.variant}`} aria-hidden>{identity.initial}</span>
            <div className="lp-um-id">
              <strong>{identity.fullName}</strong>
              <small>{person.email}</small>
            </div>
            <span className={`lp-um-badge is-${identity.variant}`}>{identity.badge}</span>
          </div>

          <div className="lp-um-list">
            {account.user ? (
              <Link
                to={accountPath('account', lang)}
                role="menuitem"
                className="lp-um-item"
                onClick={() => setOpen(false)}
              >
                <UserOutlined aria-hidden />
                <span>{t.profile}</span>
              </Link>
            ) : (
              <a
                href={identity.href}
                role="menuitem"
                className="lp-um-item"
                onClick={() => setOpen(false)}
              >
                <UserOutlined aria-hidden />
                <span>{t.profile}</span>
              </a>
            )}

            <Link
              to={accountPath('subscription', lang)}
              role="menuitem"
              className="lp-um-item"
              onClick={() => setOpen(false)}
            >
              <CrownOutlined aria-hidden />
              <span>{t.subscription}</span>
              <em className={`lp-um-tag is-${identity.variant}`}>{subTag}</em>
            </Link>

            {identity.external && (
              <a
                href={identity.href}
                role="menuitem"
                className="lp-um-item"
                onClick={() => setOpen(false)}
              >
                <ExportOutlined aria-hidden />
                <span>{t.portal(identity.badge)}</span>
              </a>
            )}
          </div>

          <div className="lp-um-sep" role="separator" />

          <div className="lp-um-list">
            <button
              type="button"
              role="menuitem"
              className="lp-um-item is-danger"
              onClick={() => {
                setOpen(false);
                void signOut(false);
              }}
            >
              <LogoutOutlined aria-hidden />
              <span>{t.signOut}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
