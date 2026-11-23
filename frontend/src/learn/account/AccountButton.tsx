// The account entry of the learning space's bar: "Sign in" for a visitor,
// the person's initial and access (Free / Premium) once signed in.
import { Link } from 'react-router-dom';
import { CrownFilled, UserOutlined } from '@ant-design/icons';
import type { Lang } from '../types';
import { ACCOUNT_COPY } from './copy';
import { accountPath } from './paths';
import { useAccount } from './store';
import './account.css';

export function AccountButton({ lang }: { lang: Lang }) {
  const c = ACCOUNT_COPY[lang];
  const { user, access } = useAccount();
  if (!user) {
    return (
      <Link to={accountPath('signIn', lang)} className="ax-acct-btn">
        <UserOutlined aria-hidden /><span>{c.signIn}</span>
      </Link>
    );
  }
  const premium = access.level === 'premium';
  return (
    <Link to={accountPath('account', lang)} className={`ax-acct-btn is-in${premium ? ' is-premium' : ''}`} title={c.myAccount}>
      <span className="ax-avatar" aria-hidden>{(user.first_name || '?').slice(0, 1).toUpperCase()}</span>
      <span className="ax-acct-name">{user.first_name}</span>
      <span className="ax-acct-tier">{premium ? <><CrownFilled aria-hidden /> {c.premium}</> : c.free}</span>
    </Link>
  );
}
