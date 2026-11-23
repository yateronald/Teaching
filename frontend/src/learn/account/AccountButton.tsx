// The account entry of the learning space's bar: "Sign in" for a visitor,
// or the person's name and role/tier badge once signed in (Admin, Teacher, Student, Premium, Free).
import { Link } from 'react-router-dom';
import { CrownFilled, UserOutlined } from '@ant-design/icons';
import type { Lang } from '../types';
import { ACCOUNT_COPY } from './copy';
import { resolveUserBadge } from './identity';
import { accountPath } from './paths';
import { useAccount } from './store';
import './account.css';

export function AccountButton({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const account = useAccount();
  const identity = resolveUserBadge(account, lang);
  if (!identity) {
    return (
      <Link to={accountPath('signIn', lang)} className="ax-acct-btn">
        <UserOutlined aria-hidden /><span>{c.signIn}</span>
      </Link>
    );
  }
  const inner = (
    <>
      <span className="ax-avatar" aria-hidden>{identity.initial}</span>
      <span className="ax-acct-name">{identity.name}</span>
      <span className="ax-acct-tier">
        {identity.variant === 'premium' && <CrownFilled aria-hidden />} {identity.badge}
      </span>
    </>
  );
  const cls = `ax-acct-btn is-in is-${identity.variant}`;
  if (identity.external && !account.user) {
    return <a href={identity.accountHref} className={cls} title={identity.fullName}>{inner}</a>;
  }
  return <Link to={identity.accountHref} className={cls} title={identity.fullName}>{inner}</Link>;
}
