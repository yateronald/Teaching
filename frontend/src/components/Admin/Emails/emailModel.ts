// The administrator's side of email campaigns: the shapes the API returns
// (/api/admin/email-campaigns), the words of each choice in English and
// French (tr), and small helpers.

export type Tr = (en: string, fr: string) => string;
export type EmailStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'sent' | 'cancelled';
export type EmailGoal = 'news' | 'offer' | 'group' | 'whatsapp' | 'event' | 'reminder' | 'survey';
export type LanguageMode = 'auto' | 'fr' | 'en' | 'both';
export type Source = 'students' | 'candidates' | 'demos' | 'registrations';
export type PersonSource = 'student' | 'candidate' | 'registration' | 'demo';
export type ThemeId = 'navy' | 'bordeaux' | 'gold' | 'forest' | 'plum';
export type Action = 'link' | 'form' | 'whatsapp';
export type SecondaryAction = Action | 'none';
export type FieldType = 'name' | 'email' | 'phone' | 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date';
export type Lang = 'fr' | 'en';

export interface Audience {
  sources: Source[];
  students: { state: 'active' | 'inactive' | 'all'; batches: number[] };
  candidates: { exams: string[] };
  demos: { statuses: string[]; since_days: number | null; interest: 'exam' | 'general' | null; exclude_students: boolean };
  registrations: { promotion_ids: number[]; statuses: string[] };
}

/** The words of one language. */
export interface Words {
  subject: string | null; preheader: string | null; eyebrow: string | null; headline: string | null; body: string | null;
  highlights_title: string | null; highlights: string[];
  steps_title: string | null; steps: string[];
  offer_label: string | null; offer_note: string | null; deadline: string | null;
  primary_label: string | null; secondary_label: string | null;
  signature: string | null; ps: string | null;
  form_title: string | null; form_intro: string | null; form_submit: string | null; form_thanks_title: string | null; form_thanks_text: string | null;
}
export interface Button { action: Action; url: string | null }
export interface SecondaryButton { action: SecondaryAction; url: string | null }
export interface FormField {
  id: string; type: FieldType; required: boolean;
  label_fr: string | null; label_en: string | null;
  options_fr?: string[]; options_en?: string[];
}

export type ColorKey = 'primary' | 'accent' | 'header_bg' | 'header_text' | 'page_bg' | 'card_bg' | 'heading' | 'text' | 'muted' | 'soft';
export interface Design {
  preset: 'classic' | 'hero' | 'minimal' | 'bold' | 'editorial';
  theme: ThemeId;
  header: 'band' | 'hero' | 'logo' | 'centered' | 'none';
  logo: 'top' | 'header' | 'none';
  align: 'left' | 'center';
  font: string; heading_font: string;
  heading_size: number; body_size: number; radius: number;
  button_shape: 'rounded' | 'pill' | 'square'; button_width: 'auto' | 'full';
  spacing: 'compact' | 'normal' | 'airy';
  points: 'checks' | 'cards' | 'numbers';
  card: 'shadow' | 'border' | 'flat';
  colors: Record<ColorKey, string>;
  name_fr?: string; name_en?: string; rationale_fr?: string; rationale_en?: string;
  fixed?: string[];
}

/** What an administrator (or the AI) writes. */
export interface EmailFields {
  name: string | null;
  goal: EmailGoal;
  language_mode: LanguageMode;
  default_lang: Lang;
  content: Record<Lang, Words>;
  buttons: { primary: Button; secondary: SecondaryButton };
  offer: { show: boolean; regular: number | null; promo: number | null; currency: 'CAD' | 'USD' | 'EUR' };
  design: Design;
  form: { fields: FormField[] };
  image_key: string | null;
  promotion_id: number | null;
  audience: Audience;
  excluded: string[];
}

export interface EmailStats {
  recipients: number; queued: number; sent: number; delivered: number; failed: number; bounced: number; skipped: number;
  opened: number; clicked: number; unsubscribed: number; responses: number;
  open_rate: number | null; click_rate: number | null; unsubscribe_rate: number | null; response_rate: number | null; progress: number;
  last_sent_at: string | null;
}

export interface EmailCampaign extends EmailFields {
  id: number;
  status: EmailStatus;
  scheduled_at: string | null; started_at: string | null; finished_at: string | null;
  note: string | null;
  created_at: string; updated_at: string;
  stats: EmailStats;
}

export interface EmailSummary {
  sent_30d: number; opened_30d: number; clicked_30d: number; unsubscribed_30d: number;
  open_rate_30d: number | null; click_rate_30d: number | null; sending: number; scheduled: number; new_responses: number;
}

export interface Person { email: string; name: string; first_name: string; lang: Lang | null; source: PersonSource }
export interface AudienceCounts {
  total: number; by_source: Record<PersonSource, number>; suppressed: number; excluded: number; duplicates: number; invalid: number;
}
export interface EmailSettings { postal_address: string; reply_to: string; sender_name: string }
export interface EmailMeta {
  sources: {
    students: { active: number; inactive: number };
    candidates: { active: number };
    demos: { total: number; by_status: Record<string, number> };
    registrations: { total: number };
  };
  batches: { id: number; name: string; french_level: string | null; students: number }[];
  promotions: { id: number; slug: string; title_fr: string | null; title_en: string | null; status: string; theme: ThemeId; ends_at: string | null }[];
  sender: { email: string; name: string };
  settings: EmailSettings;
  pace: { per_minute: number; daily_max: number | null };
  ai: { available: boolean; engine: 'developer' | 'vertex'; writing_model: string | null; image_model: string | null; writing_choices?: ModelChoice[] };
  suppressions: number;
  site_pages: Record<string, { fr: string; en: string }>;
  design: { presets: Record<Design['preset'], Design>; brand: Record<ThemeId, Partial<Record<ColorKey, string>>>; fonts: string[] };
  form_field_types: FieldType[];
}

export interface EmailDraft {
  fields: Partial<EmailFields>;
  notes: string[];
  subject_ideas: { fr: string[]; en: string[] };
  image_prompt: string;
  model: string;
  model_label?: string;
  /** The model the administrator picked (null: the usual order). */
  requested_model?: string | null;
  /** The writers offered, with what each just did (a refused pick shows at once). */
  choices?: ModelChoice[];
  engine: string;
}

/** A writer the administrator may pick, and what it did lately on this engine. */
export interface ModelChoice { id: string; label: string; state: 'ok' | 'missing' | 'busy' | 'error' | null }

/** What the AI painter answers (POST /admin/email-campaigns/ai/image). */
export interface EmailPicture { image_key: string; url: string; model: string; warning: string | null }

/** Where the picture goes: at the top (the « Photo » header), or under the headline. */
export type PicturePlace = 'top' | 'inline';
export const pictureOf = (d: Design): PicturePlace => (d.header === 'hero' ? 'top' : 'inline');
/** The design with the picture at this place (a « Photo » header only when it is at the top). */
export const placePicture = (d: Design, place: PicturePlace): Design => (
  place === 'top' ? { ...d, header: 'hero' } : d.header === 'hero' ? { ...d, header: 'band' } : d
);

export const modelStateLabel = (s: ModelChoice['state'], tr: Tr): string | null => {
  if (!s) return null;
  return {
    ok: tr('answers', 'répond'),
    missing: tr('not available on your project', 'pas disponible sur votre projet'),
    busy: tr('busy right now', 'occupé en ce moment'),
    error: tr('refused the last call', 'a refusé le dernier appel'),
  }[s];
};

/** The writer last picked on this computer, if it is still offered (else the first one). */
const MODEL_KEY = 'emails.aiModel';
export function savedModel(choices: ModelChoice[] | undefined): string | null {
  if (!choices?.length) return null;
  let saved: string | null = null;
  try { saved = localStorage.getItem(MODEL_KEY); } catch { /* private mode */ }
  return choices.some(c => c.id === saved) ? saved : choices[0].id;
}
export function saveModel(id: string) {
  try { localStorage.setItem(MODEL_KEY, id); } catch { /* private mode */ }
}

export interface Recipient {
  id: number; email: string; name: string | null; lang: string; source: PersonSource;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'skipped';
  error: string | null; sent_at: string | null; opened_at: string | null; opens: number;
  clicked_at: string | null; clicks: number; unsubscribed_at: string | null;
}
export interface CampaignLink { idx: number; url: string; label: string | null; clicks: number; people: number }
export interface FormResponse {
  id: number; name: string | null; email: string | null; phone: string | null; lang: Lang; answers: Record<string, string | string[]>;
  status: 'new' | 'contacted' | 'done'; notes: string | null; created_at: string; updated_at: string; source: PersonSource | null;
}

// ── Words (English, French) ──

export const statusLabel = (s: EmailStatus, tr: Tr) => ({
  draft: tr('Draft', 'Brouillon'), scheduled: tr('Scheduled', 'Programmé'), sending: tr('Sending', 'Envoi en cours'),
  paused: tr('Paused', 'En pause'), sent: tr('Sent', 'Envoyé'), cancelled: tr('Cancelled', 'Annulé'),
}[s]);
export const STATUS_TONE: Record<EmailStatus, string> = { draft: 'off', scheduled: 'soon', sending: 'ok', paused: 'warn', sent: 'ok', cancelled: 'off' };

export const goals = (tr: Tr): { value: EmailGoal; label: string; hint: string }[] => [
  { value: 'group', label: tr('Fill a group', 'Remplir un groupe'), hint: tr('A group class that starts soon', 'Un groupe qui commence bientôt') },
  { value: 'offer', label: tr('An offer', 'Une offre'), hint: tr('A price or a deadline', 'Un prix ou une date limite') },
  { value: 'event', label: tr('An event', 'Un événement'), hint: tr('A free workshop, a live session', 'Un atelier gratuit, un direct') },
  { value: 'survey', label: tr('Questions', 'Questionnaire'), hint: tr('Ask a few questions', 'Poser quelques questions') },
  { value: 'whatsapp', label: tr('WhatsApp group', 'Groupe WhatsApp'), hint: tr('Invite them to join', 'Inviter à rejoindre') },
  { value: 'news', label: tr('News', 'Nouvelle'), hint: tr('Something new at the school', 'Du nouveau à l’école') },
  { value: 'reminder', label: tr('A reminder', 'Un rappel'), hint: tr('Something they started', 'Quelque chose commencé') },
];

export const actionLabel = (a: SecondaryAction, tr: Tr) => ({
  link: tr('Opens a page', 'Ouvre une page'), form: tr('Opens a form', 'Ouvre un formulaire'),
  whatsapp: tr('Joins a WhatsApp group', 'Rejoint un groupe WhatsApp'), none: tr('No second button', 'Pas de 2ᵉ bouton'),
}[a]);

export const sourceLabel = (s: PersonSource, tr: Tr) => ({
  student: tr('Student', 'Élève'), candidate: tr('Exam candidate', 'Candidat'), registration: tr('Campaign registration', 'Inscrit à une offre'), demo: tr('Trial request', 'Demande d’essai'),
}[s]);
export const sourcesLabel = (s: PersonSource, tr: Tr) => ({
  student: tr('students', 'élèves'), candidate: tr('candidates', 'candidats'), registration: tr('registrations', 'inscrits'), demo: tr('trial requests', 'demandes d’essai'),
}[s]);

export const demoStatusLabel = (s: string, tr: Tr) => ({
  new: tr('New', 'Nouvelle'), contacted: tr('Contacted', 'Contactée'), demo_scheduled: tr('Demo scheduled', 'Démo planifiée'),
  completed: tr('Demo done', 'Démo faite'), cancelled: tr('Cancelled', 'Annulée'),
}[s] || s);
export const regStatusLabel = (s: string, tr: Tr) => ({
  new: tr('New', 'Nouvelle'), contacted: tr('Contacted', 'Contactée'), confirmed: tr('Confirmed', 'Confirmée'), waitlist: tr('Waiting list', 'Liste d’attente'), cancelled: tr('Cancelled', 'Annulée'),
}[s] || s);
export const EXAM_LABEL: Record<string, string> = { tcf_canada: 'TCF Canada', tcf_quebec: 'TCF Québec', tcf_tp: 'TCF Tout public' };

export const languageModes = (tr: Tr): Record<LanguageMode, { label: string; hint: string }> => ({
  auto: { label: tr('Each person’s language', 'La langue de chaque personne'), hint: tr('French or English as each person used the site; unknown → the main language.', 'Français ou anglais selon la personne ; inconnue → la langue principale.') },
  fr: { label: tr('French only', 'Français seulement'), hint: tr('Everyone receives the French version.', 'Tout le monde reçoit la version française.') },
  en: { label: tr('English only', 'Anglais seulement'), hint: tr('Everyone receives the English version.', 'Tout le monde reçoit la version anglaise.') },
  both: { label: tr('Bilingual', 'Bilingue'), hint: tr('One email: French first, then English.', 'Un seul email : le français puis l’anglais.') },
});

export const recipientStatus = (s: Recipient['status'], tr: Tr): { label: string; tone: string } => ({
  queued: { label: tr('Waiting', 'En attente'), tone: 'off' }, sending: { label: tr('Sending', 'Envoi'), tone: 'soon' },
  sent: { label: tr('Sent', 'Envoyé'), tone: 'ok' }, delivered: { label: tr('Delivered', 'Délivré'), tone: 'ok' },
  failed: { label: tr('Failed', 'Échec'), tone: 'bad' }, bounced: { label: tr('Bounced', 'Rejeté'), tone: 'bad' },
  skipped: { label: tr('Not sent', 'Non envoyé'), tone: 'off' },
}[s]);

export const responseStatus = (s: FormResponse['status'], tr: Tr): { label: string; tone: string } => ({
  new: { label: tr('New', 'Nouvelle'), tone: 'soon' }, contacted: { label: tr('Contacted', 'Contactée'), tone: 'warn' }, done: { label: tr('Done', 'Traitée'), tone: 'ok' },
}[s]);

export const fieldTypeLabel = (t: FieldType, tr: Tr) => ({
  name: tr('Name', 'Nom'), email: tr('Email', 'Email'), phone: tr('Phone / WhatsApp', 'Téléphone / WhatsApp'), text: tr('Short answer', 'Réponse courte'),
  textarea: tr('Long answer', 'Réponse longue'), select: tr('List', 'Liste'), radio: tr('One choice', 'Un choix'), checkbox: tr('Several choices', 'Plusieurs choix'), date: tr('Date', 'Date'),
}[t]);

// ── Helpers ──

export const blankWords = (): Words => ({
  subject: null, preheader: null, eyebrow: null, headline: null, body: null,
  highlights_title: null, highlights: [], steps_title: null, steps: [],
  offer_label: null, offer_note: null, deadline: null, primary_label: null, secondary_label: null, signature: null, ps: null,
  form_title: null, form_intro: null, form_submit: null, form_thanks_title: null, form_thanks_text: null,
});

export const blankAudience = (): Audience => ({
  sources: [],
  students: { state: 'active', batches: [] },
  candidates: { exams: [] },
  demos: { statuses: [], since_days: 180, interest: null, exclude_students: true },
  registrations: { promotion_ids: [], statuses: [] },
});

/** The classic layout in navy: the starting point before the server's presets arrive. */
export const fallbackDesign = (): Design => ({
  preset: 'classic', theme: 'navy', header: 'band', logo: 'top', align: 'left', font: 'system', heading_font: 'system',
  heading_size: 28, body_size: 16, radius: 16, button_shape: 'rounded', button_width: 'auto', spacing: 'normal', points: 'checks', card: 'border',
  colors: { primary: '#1d4577', accent: '#f2b632', header_bg: '#0b1733', header_text: '#ffffff', page_bg: '#f2f4f7', card_bg: '#ffffff', heading: '#0b1733', text: '#1b2333', muted: '#5b6578', soft: '#edf1f5' },
});

export function blankEmail(meta?: EmailMeta | null): EmailFields {
  return {
    name: null, goal: 'group', language_mode: 'auto', default_lang: 'fr',
    content: { fr: blankWords(), en: blankWords() },
    buttons: { primary: { action: 'link', url: null }, secondary: { action: 'none', url: null } },
    offer: { show: false, regular: null, promo: null, currency: 'CAD' },
    design: meta?.design.presets.classic ? { ...meta.design.presets.classic } : fallbackDesign(),
    form: { fields: [] },
    image_key: null, promotion_id: null,
    audience: blankAudience(), excluded: [],
  };
}

/** The editable fields of a campaign. */
export function fieldsOf(c: EmailCampaign): EmailFields {
  return {
    name: c.name, goal: c.goal, language_mode: c.language_mode, default_lang: c.default_lang,
    content: { fr: { ...blankWords(), ...c.content?.fr }, en: { ...blankWords(), ...c.content?.en } },
    buttons: c.buttons, offer: c.offer, design: c.design, form: c.form,
    image_key: c.image_key, promotion_id: c.promotion_id, audience: c.audience, excluded: c.excluded,
  };
}

/** The AI's draft merged into the form: its words, buttons, form, offer; the design only when asked. */
export function withDraft(f: EmailFields, d: Partial<EmailFields>, { design }: { design: boolean }): EmailFields {
  return {
    ...f,
    name: f.name || d.name || null,
    goal: d.goal || f.goal,
    content: d.content ? { fr: { ...blankWords(), ...d.content.fr }, en: { ...blankWords(), ...d.content.en } } : f.content,
    buttons: d.buttons || f.buttons,
    offer: d.offer || f.offer,
    form: d.form && d.form.fields.length ? d.form : f.form,
    design: design && d.design ? d.design : f.design,
    promotion_id: d.promotion_id === undefined ? f.promotion_id : d.promotion_id,
  };
}

/** A new question for the form. */
export function newField(type: FieldType, existing: FormField[]): FormField {
  let id = type === 'textarea' ? 'message' : type;
  let n = 2;
  while (existing.some(f => f.id === id)) id = `${type}_${n++}`;
  const choices = ['select', 'radio', 'checkbox'].includes(type);
  return {
    id, type, required: type === 'name' || type === 'email', label_fr: null, label_en: null,
    ...(choices ? { options_fr: [], options_en: [] } : {}),
  };
}

export const usesForm = (f: Pick<EmailFields, 'buttons'>) => f.buttons.primary.action === 'form' || f.buttons.secondary.action === 'form';

/** "42 %", or a dash. */
/** A rate as « 33.3% » in English, « 33,3 % » in French. */
export const pct = (rate: number | null | undefined, tr?: Tr) => {
  if (rate === null || rate === undefined) return '—';
  const v = Math.round(rate * 1000) / 10;
  return tr ? tr(`${v}%`, `${String(v).replace('.', ',')} %`) : `${v} %`;
};
/** « 1 person », « 3 people » / « 1 personne », « 0 personne », « 3 personnes ». */
export const counted = (n: number, tr: Tr, en: [string, string], fr: [string, string]) => `${n} ${tr(n === 1 ? en[0] : en[1], n <= 1 ? fr[0] : fr[1])}`;
export const people = (n: number, tr: Tr) => counted(n, tr, ['person', 'people'], ['personne', 'personnes']);

export const fmtMoment = (iso: string | null | undefined, locale = 'en-GB') => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const whenOf = (c: EmailCampaign, tr: Tr, locale: string) => (c.status === 'scheduled'
  ? tr(`for ${fmtMoment(c.scheduled_at, locale)}`, `pour le ${fmtMoment(c.scheduled_at, locale)}`)
  : c.started_at ? fmtMoment(c.finished_at || c.started_at, locale) : tr(`edited ${fmtMoment(c.updated_at, locale)}`, `modifié le ${fmtMoment(c.updated_at, locale)}`));

const WA_RE = /^https:\/\/(chat\.whatsapp\.com\/[A-Za-z0-9]{10,40}|wa\.me\/[0-9]{6,16}|(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]{10,40})/;
export const isWhatsApp = (url: string | null) => !!url && WA_RE.test(url.trim());
export const isHttps = (url: string | null) => !!url && /^https:\/\/\S{3,}$/i.test(url.trim());

/** What is missing before sending (the server's rules, said early). */
export function missingFor(f: EmailFields, tr: Tr, { postalAddress, recipients }: { postalAddress?: string; recipients?: number } = {}): string[] {
  const langs: Lang[] = f.language_mode === 'fr' ? ['fr'] : f.language_mode === 'en' ? ['en'] : f.language_mode === 'both' ? ['fr', 'en'] : [f.default_lang];
  const out: string[] = [];
  for (const l of langs) {
    const name = l === 'fr' ? tr('in French', 'en français') : tr('in English', 'en anglais');
    if (!f.content[l].subject) out.push(tr(`a subject ${name}`, `un objet ${name}`));
    if (!f.content[l].body) out.push(tr(`a message ${name}`, `un message ${name}`));
  }
  for (const [k, b] of [['primary', f.buttons.primary], ['secondary', f.buttons.secondary]] as const) {
    const which = k === 'primary' ? tr('the main button', 'le bouton principal') : tr('the second button', 'le 2ᵉ bouton');
    if (b.action === 'link' && !isHttps(b.url)) out.push(tr(`a link (https://) for ${which}`, `un lien (https://) pour ${which}`));
    if (b.action === 'whatsapp' && !isWhatsApp(b.url)) out.push(tr(`a WhatsApp invitation link for ${which}`, `un lien d’invitation WhatsApp pour ${which}`));
  }
  if (usesForm(f)) {
    if (!f.form.fields.some(x => x.type === 'email')) out.push(tr('an email field in the form', 'un champ email dans le formulaire'));
    if (f.form.fields.some(x => ['select', 'radio', 'checkbox'].includes(x.type) && !(x.options_fr?.length || x.options_en?.length))) out.push(tr('choices for the list questions', 'des choix pour les questions à choix'));
  }
  if (postalAddress !== undefined && !postalAddress.trim()) out.push(tr('the school’s postal address (Sender details)', 'l’adresse postale de l’école (Expéditeur)'));
  if (recipients !== undefined && recipients < 1) out.push(tr('at least one recipient', 'au moins un destinataire'));
  return out;
}

export const THEMES: { id: ThemeId; en: string; fr: string }[] = [
  { id: 'navy', en: 'Navy', fr: 'Marine' }, { id: 'bordeaux', en: 'Bordeaux', fr: 'Bordeaux' }, { id: 'forest', en: 'Forest', fr: 'Forêt' },
  { id: 'plum', en: 'Plum', fr: 'Prune' }, { id: 'gold', en: 'Gold', fr: 'Or' },
];

/** A layout in a palette: the school's colours, or a theme's. */
export function recolor(d: Design, theme: ThemeId, meta: EmailMeta | null): Design {
  const b = meta?.design.brand[theme];
  if (!b) return { ...d, theme };
  const white = d.colors.header_bg.toLowerCase() === '#ffffff';
  return {
    ...d, theme,
    colors: {
      ...d.colors,
      primary: b.primary || d.colors.primary, accent: b.accent || d.colors.accent, soft: b.soft || d.colors.soft, heading: b.heading || d.colors.heading,
      header_bg: white ? '#ffffff' : (b.header_bg || d.colors.header_bg),
      header_text: white ? (b.heading || d.colors.heading) : '#ffffff',
    },
  };
}
