// The account entry of the learning space's bar: "Sign in" for a visitor,
// or the interactive profile menu once signed in (Admin, Teacher, Student, Premium, Free).
import { Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import type { Lang } from '../types';
import { ACCOUNT_COPY } from './copy';
import { resolveUserBadge } from './identity';
import { accountPath } from './paths';
import { useAccount } from './store';
import { UserMenu } from './UserMenu';
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
  return <UserMenu lang={lang} variant="academy" />;
}
