// Unified user identity & dashboard resolver for BOTH portal logins
// (admin, teacher, student, candidate, org_admin) and public website learners.
import type { Lang } from '../types';
import { accountPath } from './paths';
import type { AccountState } from './store';

export interface UserBadgeInfo {
  name: string;
  fullName: string;
  initial: string;
  badge: string;
  href: string;
  accountHref: string;
  variant: 'staff' | 'portal' | 'premium' | 'standard' | 'free';
  external: boolean;
}

export function portalDashboardForRole(role: string): string {
  switch (role) {
    case 'admin': return '/app/dashboard';
    case 'teacher': return '/app/teacher-dashboard';
    case 'student': return '/app/student-dashboard';
    case 'candidate': return '/app/exam-home';
    case 'org_admin': return '/app/org';
    default: return '/app/dashboard';
  }
}

export function resolveUserBadge(account: AccountState, lang: Lang): UserBadgeInfo | null {
  const person = account.user ?? account.portalUser;
  if (!person) return null;
  const fr = lang === 'fr';
  const name = person.first_name || person.email.split('@')[0] || 'Account';
  const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim() || name;
  const initial = name.slice(0, 1).toUpperCase();
  const role = person.role;
  const acct = accountPath('account', lang);

  if (role === 'admin' || role === 'teacher') {
    return {
      name,
      fullName,
      initial,
      badge: role === 'admin' ? 'Admin' : fr ? 'Professeur' : 'Teacher',
      href: portalDashboardForRole(role),
      accountHref: account.user ? acct : portalDashboardForRole(role),
      variant: 'staff',
      external: true,
    };
  }
  if (role === 'student' || role === 'candidate' || role === 'org_admin') {
    const label = role === 'candidate'
      ? (fr ? 'Candidat' : 'Candidate')
      : role === 'org_admin'
        ? (fr ? 'Entreprise' : 'Company')
        : (fr ? 'Élève' : 'Student');
    const portalOnly = !account.user;
    return {
      name,
      fullName,
      initial,
      badge: label,
      href: portalDashboardForRole(role),
      accountHref: portalOnly ? portalDashboardForRole(role) : acct,
      variant: 'portal',
      external: true,
    };
  }
  const hasPaid = account.access.level === 'premium';
  const isStandard = hasPaid && (account.access.plan === 'standard' || account.access.premium?.tier === 'standard');
  const variant = isStandard ? 'standard' : hasPaid ? 'premium' : 'free';
  return {
    name,
    fullName,
    initial,
    badge: isStandard ? 'Standard' : hasPaid ? 'Premium' : (fr ? 'Gratuit' : 'Free'),
    href: acct,
    accountHref: acct,
    variant,
    external: false,
  };
}
