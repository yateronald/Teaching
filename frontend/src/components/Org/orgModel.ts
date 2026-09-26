/**
 * Shared model of the company feature: the shapes the API returns, calls with
 * readable errors, and the wording of a company's state. Used by the
 * administrator's company pages and by the company's own space.
 */
import type { Lang } from '../../utils/useTr';
import { familyOfCategory, familyOfType } from '../Admin/examAdminData';
import type { Family } from '../Admin/examAdminData';

export type OrgState = 'active' | 'expired' | 'not_started' | 'suspended';
export type Skill = 'ce' | 'co' | 'ee' | 'eo';
export type CreditType = 'ee' | 'eo';

export interface CreditPot { reserve: number; with_learners: number; used: number; granted: number }
export interface Company {
  id: number;
  name: string;
  display_name: string | null;
  slug: string;
  default_language: 'fr' | 'en';
  status: 'active' | 'suspended';
  state: OrgState;
  access_starts_at: string;
  access_ends_at: string;
  days_left: number;
  expiring_soon: boolean;
  /** The package: learner accounts the company may create (active or deactivated all count). */
  seat_limit: number;
  seats_used: number;
  seats_left: number;
  notes: string | null;
  brand: { name: string; logo_url: string | null };
  created_at: string;
  active_learners: number;
  learners: number;
  managers: number;
  credits: { ee: CreditPot; eo: CreditPot };
}
export interface ContentRef { content_type: string; content_id: number; name?: string }
export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  invitation_pending: boolean;
  last_seen_at: string | null;
}
export interface SkillLevel { nclc: number | null; cefr: string | null; percent: number }
export interface Learner extends Person {
  ee_credits: number;
  eo_credits: number;
  groups: { id: number; name: string }[];
  attempts: number;
  last_practice_at: string | null;
  nclc: number | null;
  skills: Record<Skill, SkillLevel | null>;
}
export interface Group { id: number; name: string; member_count: number; member_ids: number[]; created_at: string }
export interface CreditMove {
  id: number;
  credit_type: CreditType;
  delta: number;
  reason: 'admin_grant' | 'admin_revoke' | 'distribute' | 'reclaim' | 'learner_left';
  notes: string | null;
  created_at: string;
  learner_id: number | null;
  learner_first_name: string | null;
  learner_last_name: string | null;
  actor_first_name: string | null;
  actor_last_name: string | null;
  actor_role: string | null;
}
export interface AuditEntry {
  id: number;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  actor_first_name: string | null;
  actor_last_name: string | null;
  actor_role: string | null;
}
export interface OrgAssignment {
  group_id: string;
  name: string;
  assigned_at: string;
  expires_at: string;
  is_expired: boolean;
  assigned_by: string | null;
  items: ContentRef[];
  recipients: { type: 'learner' | 'group'; id: number; name: string }[];
}
export interface Dashboard {
  company: Company;
  learners: { active: number; total: number; practised_30_days: number; invitations_pending: number };
  activity: { attempts_30_days: number; weeks: { week_start: string; attempts: number }[] };
  skills: { skill: Skill; learners_measured: number; average_percent: number | null; attempts_30_days: number }[];
  nclc_distribution: { nclc: number; learners: number }[];
  inactive: { id: number; first_name: string; last_name: string; last_practice_at: string | null }[];
  inactive_count: number;
  inactive_days: number;
  top: { id: number; first_name: string; last_name: string; nclc: number }[];
}

export type ApiCall = (endpoint: string, options?: RequestInit) => Promise<Response>;

/** A refusal from the server, with its code (e.g. INSUFFICIENT_RESERVE) and extra fields. */
export class ApiError extends Error {
  code?: string;
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, data: Record<string, unknown>) {
    super(String(data?.error || `The server answered ${status}.`));
    this.status = status;
    this.code = typeof data?.code === 'string' ? data.code : undefined;
    this.data = data || {};
  }
}

/** JSON call that throws an ApiError on refusal. */
export async function call<T = unknown>(api: ApiCall, endpoint: string, method = 'GET', body?: unknown): Promise<T> {
  const r = await api(endpoint, {
    method,
    ...(body instanceof FormData ? { body } : body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError(r.status, data);
  return data as T;
}

type Tr = (en: string, fr: string) => string;

/** A refusal in the reader's language (the known codes are translated; others keep the server text). */
export function errorText(err: unknown, tr: Tr): string {
  if (!(err instanceof ApiError)) return tr('Something went wrong. Check your connection and try again.', 'Une erreur est survenue. Vérifiez votre connexion et réessayez.');
  const d = err.data as { needed?: number; available?: number };
  switch (err.code) {
    case 'ORG_EXPIRED': return tr('Your company’s access has expired. Contact the administrator to extend it.', 'L’accès de votre entreprise a expiré. Contactez l’administrateur pour le prolonger.');
    case 'ORG_NOT_STARTED': return tr('Your company’s access has not started yet.', 'L’accès de votre entreprise n’a pas encore commencé.');
    case 'ORG_SUSPENDED': return tr('Your company’s account is disabled. Contact the administrator.', 'Le compte de votre entreprise est désactivé. Contactez l’administrateur.');
    case 'INSUFFICIENT_RESERVE':
      if (d.needed != null) {
        const missing = d.needed - (d.available || 0);
        return tr(`This needs ${d.needed} credits and the reserve holds ${d.available}: ${missing} missing.`, `Il faut ${d.needed} crédits et la réserve en contient ${d.available} : il en manque ${missing}.`);
      }
      return tr(`The reserve holds only ${d.available} credits.`, `La réserve ne contient que ${d.available} crédits.`);
    case 'AFTER_COMPANY_END': return tr('The end date cannot be after your company’s access ends.', 'La date de fin ne peut pas dépasser la fin de l’accès de votre entreprise.');
    case 'DATE_PAST': return tr('The end date must be in the future.', 'La date de fin doit être dans le futur.');
    case 'SEAT_LIMIT_REACHED': return tr('Your package is full: every learner account it includes has been created. Contact the administrator to add more.', 'Votre forfait est complet : tous les comptes apprenants qu’il comprend ont été créés. Contactez l’administrateur pour en ajouter.');
    case 'TOTAL_TOO_SMALL': return tr(`A total of ${String(err.data.total)} cannot be shared between ${String(err.data.learners)} learners: give at least ${String(err.data.learners)}.`, `Un total de ${String(err.data.total)} ne peut pas être partagé entre ${String(err.data.learners)} apprenants : donnez-en au moins ${String(err.data.learners)}.`);
    case 'BAD_SEATS': return tr('Set the package: the number of learner accounts (at least 1).', 'Indiquez le forfait : le nombre de comptes apprenants (au moins 1).');
    case 'EMAIL_TAKEN': return tr('An account already uses this email address.', 'Un compte utilise déjà cette adresse email.');
    case 'CONTENT_NOT_ALLOWED': return tr('Your company may not assign some of this content.', 'Votre entreprise ne peut pas attribuer une partie de ce contenu.');
    case 'LEARNER_NOT_IN_COMPANY': return tr('Some of the chosen learners are not active learners of your company.', 'Certains apprenants choisis ne sont pas des apprenants actifs de votre entreprise.');
    case 'GROUP_EXISTS': return tr('A group already has this name.', 'Un groupe porte déjà ce nom.');
    case 'NO_LEARNERS': return tr('Choose at least one active learner.', 'Choisissez au moins un apprenant actif.');
    case 'BAD_EMAIL': return tr('Enter a valid email address.', 'Saisissez une adresse email valide.');
    case 'NAME_REQUIRED': return tr('First name and last name are required.', 'Le prénom et le nom sont obligatoires.');
    case 'LOGO_TYPE': return tr('The logo must be a PNG, JPG or WebP image.', 'Le logo doit être une image PNG, JPG ou WebP.');
    case 'LOGO_TOO_BIG': return tr('The logo must be 1 MB or less.', 'Le logo doit faire 1 Mo au maximum.');
    case 'STORAGE_UNAVAILABLE': return tr('File storage is not available right now. Try again later.', 'Le stockage de fichiers est indisponible pour le moment. Réessayez plus tard.');
    default: return err.message;
  }
}

/** Wording and tone of a company's state. */
export function stateOf(c: Pick<Company, 'state' | 'days_left' | 'expiring_soon'>, tr: Tr): { label: string; tone: 'ok' | 'warn' | 'off' | 'bad' | 'soon' } {
  switch (c.state) {
    case 'suspended': return { label: tr('Disabled', 'Désactivée'), tone: 'bad' };
    case 'expired': return { label: tr('Expired', 'Expirée'), tone: 'off' };
    case 'not_started': return { label: tr('Not started', 'Pas commencée'), tone: 'soon' };
    default:
      return c.expiring_soon
        ? { label: tr(`Ends in ${c.days_left} day${c.days_left > 1 ? 's' : ''}`, `Se termine dans ${c.days_left} jour${c.days_left > 1 ? 's' : ''}`), tone: 'warn' }
        : { label: tr('Active', 'Active'), tone: 'ok' };
  }
}

export const SKILLS: Skill[] = ['ce', 'co', 'ee', 'eo'];
export const skillName = (s: Skill, lang: Lang) => ({
  ce: lang === 'fr' ? 'Compréhension écrite' : 'Reading',
  co: lang === 'fr' ? 'Compréhension orale' : 'Listening',
  ee: lang === 'fr' ? 'Expression écrite' : 'Writing',
  eo: lang === 'fr' ? 'Expression orale' : 'Speaking',
})[s];
export const creditName = (t: CreditType, lang: Lang) => (t === 'ee'
  ? (lang === 'fr' ? 'Expression écrite' : 'Writing')
  : (lang === 'fr' ? 'Expression orale' : 'Speaking'));

export const personName = (p: { first_name?: string | null; last_name?: string | null }) =>
  [p.first_name, p.last_name].filter(Boolean).join(' ');

export const fmtDate = (iso: string | null | undefined, locale: string, withYear = true) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(locale, { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
};

/** "3 days ago" / "il y a 3 jours" (days, or today). */
export const ago = (iso: string | null | undefined, tr: Tr) => {
  if (!iso) return tr('never', 'jamais');
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400e3);
  if (days <= 0) return tr('today', 'aujourd’hui');
  if (days === 1) return tr('yesterday', 'hier');
  return tr(`${days} days ago`, `il y a ${days} jours`);
};

/** One movement of credits, in words. */
export function moveText(m: CreditMove, tr: Tr): string {
  const who = m.learner_first_name ? personName({ first_name: m.learner_first_name, last_name: m.learner_last_name }) : '';
  switch (m.reason) {
    case 'admin_grant': return tr('Added by the administrator', 'Ajoutés par l’administrateur');
    case 'admin_revoke': return tr('Taken back by the administrator', 'Retirés par l’administrateur');
    case 'distribute': return tr(`Given to ${who}`, `Donnés à ${who}`);
    case 'reclaim': return tr(`Taken back from ${who}`, `Récupérés de ${who}`);
    case 'learner_left': return tr(`Returned when ${who} was deactivated`, `Rendus à la désactivation de ${who}`);
    default: return m.reason;
  }
}

/** One audit line, in words. */
export function auditText(a: AuditEntry, tr: Tr): string {
  const d = (a.details || {}) as Record<string, string | number | undefined>;
  switch (a.action) {
    case 'company_created': return tr('Company created', 'Entreprise créée');
    case 'company_updated': return tr('Company details changed', 'Informations de l’entreprise modifiées');
    case 'dates_changed': return tr('Access dates changed', 'Dates d’accès modifiées');
    case 'company_suspended': return tr('Company disabled', 'Entreprise désactivée');
    case 'company_reactivated': return tr('Company reactivated', 'Entreprise réactivée');
    case 'content_changed': return tr('Allowed exams changed', 'Examens autorisés modifiés');
    case 'credits_granted': return tr(`${d.amount} credits added`, `${d.amount} crédits ajoutés`);
    case 'credits_revoked': return tr(`${d.amount} credits taken back`, `${d.amount} crédits retirés`);
    case 'credits_distributed': return tr(`${d.each} credit(s) given to ${d.learners} learner(s)`, `${d.each} crédit(s) donné(s) à ${d.learners} apprenant(s)`);
    case 'credits_reclaimed': return tr(`${d.returned} credit(s) taken back`, `${d.returned} crédit(s) récupéré(s)`);
    case 'manager_added': return tr(`Manager added: ${d.email}`, `Responsable ajouté : ${d.email}`);
    case 'learner_added': return tr(`Learner added: ${d.email}`, `Apprenant ajouté : ${d.email}`);
    case 'learner_updated': return tr('Learner updated', 'Apprenant modifié');
    case 'account_deactivated': return tr('Account deactivated', 'Compte désactivé');
    case 'account_reactivated': return tr('Account reactivated', 'Compte réactivé');
    case 'invitation_resent': return tr('Invitation sent again', 'Invitation renvoyée');
    case 'group_created': return tr(`Group created: ${d.name}`, `Groupe créé : ${d.name}`);
    case 'group_updated': return tr('Group updated', 'Groupe modifié');
    case 'group_deleted': return tr(`Group deleted: ${d.name}`, `Groupe supprimé : ${d.name}`);
    case 'assigned': return tr(`Assigned “${d.name}”`, `Attribution « ${d.name} »`);
    case 'assignment_removed': return tr('Assignment removed', 'Attribution supprimée');
    case 'logo_changed': return tr('Logo changed', 'Logo modifié');
    case 'logo_removed': return tr('Logo removed', 'Logo supprimé');
    case 'settings_changed': return tr('Settings changed', 'Paramètres modifiés');
    case 'expiry_notice_sent': return tr('Expiry warning sent', 'Avertissement d’expiration envoyé');
    default: return a.action;
  }
}

/** Parses a CSV (comma or semicolon, optional header) into learner rows. */
export function parseLearnersCsv(text: string): { first_name: string; last_name: string; email: string }[] {
  const lines = (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const sep = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const split = (l: string) => {
    const out: string[] = [];
    let cur = ''; let quoted = false;
    for (let i = 0; i < l.length; i += 1) {
      const ch = l[i];
      if (ch === '"') { if (quoted && l[i + 1] === '"') { cur += '"'; i += 1; } else quoted = !quoted; }
      else if (ch === sep && !quoted) { out.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const head = split(lines[0]).map(h => h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, ''));
  const find = (...names: string[]) => head.findIndex(h => names.includes(h));
  let fi = find('firstname', 'prenom', 'first');
  let li = find('lastname', 'nom', 'last', 'surname', 'nomdefamille');
  let ei = find('email', 'mail', 'courriel', 'adresseemail');
  const hasHeader = ei >= 0;
  if (!hasHeader) { fi = 0; li = 1; ei = 2; }
  return lines.slice(hasHeader ? 1 : 0).map(split).map(c => ({
    first_name: c[fi] || '', last_name: c[li] || '', email: (c[ei] || '').toLowerCase(),
  })).filter(r => r.first_name || r.last_name || r.email);
}

/** The skill family of a piece of content (a whole skill is named after its category). */
export const familyOfRef = (c: { content_type: string; name?: string }): Family =>
  (c.content_type === 'category' ? familyOfCategory(c.name) : familyOfType(c.content_type));
