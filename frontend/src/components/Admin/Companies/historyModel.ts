/* The company's history (administrator console, English): each audit entry
   turned into a title, before → after changes, extra facts and a note. Used
   both by the timeline and by the CSV export, so they always say the same. */

export type HistoryCategory = 'created' | 'access' | 'credits' | 'handouts' | 'package' | 'status' | 'exams' | 'people' | 'activity' | 'profile' | 'other';

export interface HistoryActor { name: string | null; email: string | null; role: string | null }
export interface HistoryItem {
  id: number;
  action: string;
  category: HistoryCategory;
  details: Record<string, unknown>;
  created_at: string;
  actor: HistoryActor | null;
}
type Kinds = { ee?: number; eo?: number };
export interface HistorySummary {
  access: { starts_at: string; original_end: string; current_end: string; extensions: number; shortenings: number; days_added: number;
    last_change: { at: string; from: string; to: string; by: HistoryActor | null; note: string | null } | null };
  credits: { granted: Required<Kinds>; revoked: Required<Kinds>; reserve: Required<Kinds>; movements: number; last_at: string | null };
  package: { original: number; current: number; changes: number };
  status: { current: 'active' | 'suspended'; suspensions: number; last_change: { at: string; action: string; by: HistoryActor | null } | null };
  created_at: string;
  created_by: HistoryActor | null;
}
export interface HistoryPage { summary: HistorySummary; items: HistoryItem[]; next_before: number | null }

export const FILTERS: { key: HistoryCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'access', label: 'Access dates' },
  { key: 'credits', label: 'Credits (admin)' },
  { key: 'handouts', label: 'Credits (company)' },
  { key: 'package', label: 'Package' },
  { key: 'status', label: 'Status' },
  { key: 'exams', label: 'Allowed exams' },
  { key: 'people', label: 'People' },
  { key: 'activity', label: 'Groups & assignments' },
  { key: 'profile', label: 'Profile & logo' },
];

export const date = (iso: unknown) => (iso ? new Date(String(iso)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const dateTime = (iso: unknown) => (iso ? new Date(String(iso)).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const daysBetween = (a: unknown, b: unknown) => Math.round((new Date(String(b)).getTime() - new Date(String(a)).getTime()) / 86400000);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const kinds = (k: unknown, sign = '') => {
  const v = (k || {}) as Kinds;
  return (['ee', 'eo'] as const).filter(t => (v[t] || 0) > 0).map(t => `${sign}${v[t]} ${t.toUpperCase()}`).join(', ');
};

export const ROLE_LABEL: Record<string, string> = { admin: 'Administrator', org_admin: 'Company manager', candidate: 'Learner', teacher: 'Teacher', student: 'Student' };
export const actorText = (a: HistoryActor | null) => (a ? [a.name || 'Unknown', a.role ? ROLE_LABEL[a.role] || a.role : null].filter(Boolean).join(' · ') : 'System (automatic)');

export interface Change { label: string; from: string; to: string }
export interface Described { title: string; changes: Change[]; facts: string[]; note: string | null; tone: 'up' | 'down' | 'neutral' | 'bad' }

const FIELD_LABEL: Record<string, string> = {
  name: 'Official name', display_name: 'Displayed name', default_language: 'Language', notes: 'Internal notes',
  email: 'Email', first_name: 'First name', last_name: 'Last name',
};
const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v));

/** One entry in words. */
export function describe(item: HistoryItem): Described {
  const d = item.details || {};
  // The reason typed with the change ("notes" is also a company field, whose change is an object).
  const note = [d.note, d.notes].find((v): v is string => typeof v === 'string' && v.trim() !== '') ?? null;
  const out: Described = { title: item.action, changes: [], facts: [], note, tone: 'neutral' };
  const via = d.via === 'users_page' ? ' (from the Users page)' : '';
  switch (item.action) {
    case 'company_created':
      out.title = 'Company created';
      out.facts = [
        `Access until ${date(d.access_ends_at)}`,
        d.seat_limit ? `Package of ${plural(Number(d.seat_limit), 'learner account')}` : '',
        kinds({ ee: d.ee_credits, eo: d.eo_credits }) ? `Initial credits: ${kinds({ ee: d.ee_credits, eo: d.eo_credits })}` : 'No initial credits',
        d.content ? `${plural(Number(d.content), 'exam item')} allowed` : '',
      ].filter(Boolean);
      break;
    case 'dates_changed': {
      const end = d.access_ends_at as { from: string; to: string } | undefined;
      const start = d.access_starts_at as { from: string; to: string } | undefined;
      if (end) {
        const days = daysBetween(end.from, end.to);
        out.title = days >= 0 ? `Access extended by ${plural(days, 'day')}` : `Access shortened by ${plural(-days, 'day')}`;
        out.tone = days >= 0 ? 'up' : 'down';
        out.changes.push({ label: 'End of access', from: date(end.from), to: date(end.to) });
      } else out.title = 'Access start moved';
      if (start) out.changes.push({ label: 'Start of access', from: date(start.from), to: date(start.to) });
      break;
    }
    case 'expiry_notice_sent':
      out.title = 'Expiry warning emailed';
      out.facts = [`${plural(Number(d.days_left), 'day')} before the end`, `${plural(Number(d.recipients), 'recipient')}`];
      break;
    case 'credits_granted':
    case 'credits_revoked': {
      const add = item.action === 'credits_granted';
      out.tone = add ? 'up' : 'down';
      if (d.amounts) {
        out.title = `Credits ${add ? 'added' : 'taken back'}: ${kinds(d.amounts, add ? '+' : '−')}`;
        const before = (d.before || {}) as Kinds, after = (d.reserve || {}) as Kinds, amounts = d.amounts as Kinds;
        (['ee', 'eo'] as const).filter(t => (amounts[t] || 0) > 0).forEach(t => out.changes.push({
          label: `${t.toUpperCase()} reserve`, from: before[t] !== undefined ? String(before[t]) : '?', to: after[t] !== undefined ? String(after[t]) : '?',
        }));
      } else {
        // Entries written before both kinds could move at once.
        out.title = `Credits ${add ? 'added' : 'taken back'}: ${add ? '+' : '−'}${d.amount} ${String(d.type || '').toUpperCase()}`;
        if (d.reserve !== undefined) out.facts.push(`Reserve after: ${d.reserve}`);
      }
      break;
    }
    case 'credits_distributed':
      out.title = d.amounts
        ? `Company handed out ${kinds(d.amounts)} to each of ${plural(Number(d.learners), 'learner')}`
        : `Company handed out ${d.each} credit(s) to each of ${plural(Number(d.learners), 'learner')}`;
      if (d.mode === 'split') out.facts.push('Shared from a total');
      if (kinds(d.kept_in_reserve)) out.facts.push(`${kinds(d.kept_in_reserve)} kept in the reserve`);
      if (d.assignment) out.facts.push(`With the assignment “${d.assignment}”`);
      if (d.reserve && typeof d.reserve === 'object') out.facts.push(`Reserve after: ${(d.reserve as Kinds).ee ?? '?'} EE, ${(d.reserve as Kinds).eo ?? '?'} EO`);
      break;
    case 'credits_reclaimed':
      out.title = typeof d.returned === 'object' ? `Company took back ${kinds(d.returned) || 'no'} credits` : `Company took back ${d.returned} credit(s)`;
      if (d.learners) out.facts.push(`From ${plural(Number(d.learners), 'learner')}`);
      break;
    case 'package_changed':
    case 'company_updated': {
      const seat = d.seat_limit as { from: number; to: number } | undefined;
      if (seat) {
        out.title = seat.to >= seat.from ? `Package raised to ${seat.to} accounts` : `Package lowered to ${seat.to} accounts`;
        out.tone = seat.to >= seat.from ? 'up' : 'down';
        out.changes.push({ label: 'Learner accounts', from: String(seat.from), to: String(seat.to) });
      }
      const others = Object.keys(FIELD_LABEL).filter(k => d[k]);
      if (others.length) {
        if (!seat) out.title = 'Company details changed';
        others.forEach(k => { const c = d[k] as { from: unknown; to: unknown }; out.changes.push({ label: FIELD_LABEL[k], from: show(c.from), to: show(c.to) }); });
      }
      if (!seat && !others.length) out.title = 'Company details changed';
      break;
    }
    case 'company_suspended':
      out.title = 'Company disabled';
      out.tone = 'bad';
      out.facts.push(`${plural(Number(d.sessions_ended || 0), 'session')} ended`);
      break;
    case 'company_reactivated':
      out.title = 'Company reactivated';
      out.tone = 'up';
      break;
    case 'content_changed': {
      const added = (d.added || []) as { name?: string }[], removed = (d.removed || []) as { name?: string }[];
      out.title = d.added || d.removed ? `Allowed exams changed: ${[added.length ? `+${added.length}` : '', removed.length ? `−${removed.length}` : ''].filter(Boolean).join(', ')}` : 'Allowed exams changed';
      if (added.length) out.facts.push(`Added: ${added.map(a => a.name || '?').join(', ')}`);
      if (removed.length) out.facts.push(`Removed: ${removed.map(a => a.name || '?').join(', ')}`);
      // Older entries only kept the counts; newer ones name what changed.
      if (!added.length && !removed.length && d.from !== undefined) out.changes.push({ label: 'Exam items', from: String(d.from), to: String(d.to) });
      break;
    }
    case 'manager_added': out.title = `Manager added: ${d.email}`; break;
    case 'learner_added': out.title = `Learner added: ${d.email}`; break;
    case 'invitation_resent': out.title = `New invitation sent${d.email ? ` to ${d.email}` : ''}`; break;
    case 'account_deactivated':
    case 'account_reactivated': {
      const on = item.action === 'account_reactivated';
      out.title = `${d.role === 'org_admin' ? 'Manager' : 'Account'} ${on ? 'reactivated' : 'deactivated'}${d.email ? `: ${d.email}` : ''}${via}`;
      out.tone = on ? 'up' : 'down';
      if (kinds(d.credits_returned)) out.facts.push(`${kinds(d.credits_returned)} returned to the reserve`);
      break;
    }
    case 'account_updated':
    case 'learner_updated': {
      out.title = `Account details changed${d.email ? `: ${d.email}` : ''}${via}`;
      const ch = (d.changes || {}) as Record<string, { from: unknown; to: unknown }>;
      Object.entries(ch).forEach(([k, c]) => out.changes.push({ label: FIELD_LABEL[k] || k, from: show(c.from), to: show(c.to) }));
      break;
    }
    case 'group_created': out.title = `Group created: ${d.name}`; break;
    case 'group_updated': out.title = `Group changed${d.name ? `: ${d.name}` : ''}`; break;
    case 'group_deleted': out.title = `Group deleted: ${d.name}`; break;
    case 'assigned':
      out.title = `Exams assigned: “${d.name}”`;
      out.facts = [
        `${plural(Number(d.items), 'exam item')}`,
        [d.learners ? plural(Number(d.learners), 'learner') : '', d.groups ? plural(Number(d.groups), 'group') : ''].filter(Boolean).join(' + '),
        `until ${date(d.expires_at)}`,
        kinds(d.credits) ? `with ${kinds(d.credits)} credit(s) each` : '',
      ].filter(Boolean);
      break;
    case 'assignment_removed': out.title = 'Assignment removed'; break;
    case 'logo_changed': out.title = 'Logo changed'; break;
    case 'logo_removed': out.title = 'Logo removed'; break;
    case 'settings_changed': out.title = 'Company settings changed (by the company)'; break;
    default: out.title = item.action.replace(/_/g, ' ');
  }
  return out;
}

/** CSV (Excel-friendly) of entries. */
export function historyCsv(companyName: string, items: HistoryItem[]): string {
  const cell = (v: unknown) => {
    const s = String(v ?? '');
    // Neutralise spreadsheet formulas (=, +, -, @) and quote everything.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const head = ['Company', 'Date', 'Category', 'Event', 'Changes (before → after)', 'Details', 'Note', 'By', 'By (email)', 'By (role)'];
  const rows = items.map(i => {
    const d = describe(i);
    return [
      companyName, new Date(i.created_at).toISOString(), i.category, d.title,
      d.changes.map(c => `${c.label}: ${c.from} → ${c.to}`).join(' | '), d.facts.join(' | '), d.note || '',
      i.actor?.name || (i.actor ? '' : 'System'), i.actor?.email || '', i.actor?.role ? ROLE_LABEL[i.actor.role] || i.actor.role : '',
    ].map(cell).join(',');
  });
  return '﻿' + [head.map(cell).join(','), ...rows].join('\r\n');
}
