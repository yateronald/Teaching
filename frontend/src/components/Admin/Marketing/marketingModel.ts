// The administrator's side of the marketing campaigns: the shapes the API
// returns, the words of each state, and the bridge to the public site's own
// components (a preview and a flyer draw the campaign exactly as visitors see it).
import type { Audience, Kind, Lang, Placement, PromoWords, Promotion, ThemeId } from '../../../promo/model';

export type CampaignStatus = 'draft' | 'published' | 'paused' | 'archived';
export type CampaignState = 'draft' | 'scheduled' | 'live' | 'ended' | 'paused' | 'archived';
export type SeatsDisplay = 'auto' | 'always' | 'never';
export type RegistrationStatus = 'new' | 'contacted' | 'confirmed' | 'waitlist' | 'cancelled';

/** The fields an administrator writes. */
export interface CampaignFields {
  kind: Kind;
  title_en: string | null; title_fr: string | null;
  tagline_en: string | null; tagline_fr: string | null;
  description_en: string | null; description_fr: string | null;
  highlights_en: string[]; highlights_fr: string[];
  cta_en: string | null; cta_fr: string | null;
  badge_en: string | null; badge_fr: string | null;
  audience: Audience;
  level: string | null;
  class_starts_on: string | null; class_ends_on: string | null;
  schedule_en: string | null; schedule_fr: string | null;
  teacher_name: string | null;
  seat_limit: number | null;
  /** People registered outside the site (phone, WhatsApp, in person): real seats, counted as taken. */
  seats_offline: number;
  /** How the site shows the seats left: "auto" once few remain (the size of the group before), always, or never. */
  seats_display: SeatsDisplay;
  price_regular: number | null; price_promo: number | null;
  currency: string;
  price_note_en: string | null; price_note_fr: string | null;
  starts_at: string; ends_at: string | null;
  show_countdown: boolean;
  place_bar: boolean; place_home: boolean; place_flash: boolean; place_learn: boolean;
  priority: number;
  theme: ThemeId;
  image_key: string | null;
  registration_mode: 'form' | 'link' | 'none';
  cta_url: string | null;
}

export interface Campaign extends CampaignFields {
  id: number;
  slug: string;
  status: CampaignStatus;
  state: CampaignState;
  created_at: string;
  updated_at: string;
  registrations: number;
  new_registrations: number;
  show_seats: boolean;
  /** All the seats taken: registered on the site and outside it. */
  seats_taken: number;
  /** Registered on the site (new, contacted or confirmed). */
  seats_online: number;
  seats_left: number | null;
  waitlist: number;
  last_registration_at: string | null;
  views: number;
  clicks: number;
}

export interface Summary {
  live: number; scheduled: number; registrations: number; registrations_week: number;
  new_registrations: number; views: number; conversion: number | null;
}

export interface Registration {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  level: string | null;
  message: string | null;
  language: Lang;
  timezone: string | null;
  placement: Placement | null;
  source_path: string | null;
  status: RegistrationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignStats {
  places: { placement: Placement; views: number; clicks: number; registrations: number }[];
  days: { day: string; views: number; clicks: number }[];
  registration_days: { day: string; registrations: number }[];
}

export const KIND_LABEL: Record<Kind, string> = { group_class: 'Group class', offer: 'Special offer', event: 'Free event', announcement: 'Announcement' };
export const KIND_HINT: Record<Kind, string> = {
  group_class: 'A group with a start date, a timetable and a number of seats.',
  offer: 'A discount or a pack, for a limited time.',
  event: 'A free workshop, open class or webinar.',
  announcement: 'News to show on the site, with or without a button.',
};
export const AUDIENCE_LABEL: Record<Audience, string> = {
  general: 'Everyone', beginner: 'Beginners', conversation: 'Conversation', tcf: 'TCF Canada', tef: 'TEF Canada & Québec',
  delf: 'DELF & DALF', business: 'Business French', kids: 'Children',
};
export const STATE_LABEL: Record<CampaignState, { label: string; tone: 'ok' | 'soon' | 'off' | 'warn' | 'bad' }> = {
  live: { label: 'Live on the site', tone: 'ok' },
  scheduled: { label: 'Scheduled', tone: 'soon' },
  draft: { label: 'Draft', tone: 'off' },
  paused: { label: 'Paused', tone: 'warn' },
  ended: { label: 'Ended', tone: 'off' },
  archived: { label: 'Archived', tone: 'off' },
};
export const REG_STATUS: Record<RegistrationStatus, { label: string; tone: 'ok' | 'soon' | 'off' | 'warn' | 'bad'; hint: string }> = {
  new: { label: 'New', tone: 'soon', hint: 'Nobody has contacted this person yet.' },
  contacted: { label: 'Contacted', tone: 'warn', hint: 'Someone wrote or called; the seat is not confirmed yet.' },
  confirmed: { label: 'Confirmed', tone: 'ok', hint: 'The seat is confirmed.' },
  waitlist: { label: 'Waiting list', tone: 'off', hint: 'The group was full when this person registered.' },
  cancelled: { label: 'Cancelled', tone: 'bad', hint: 'The person will not join; the seat is free again.' },
};
export const PLACE_LABEL: Record<Placement, string> = {
  bar: 'Top bar', home: 'Home page', flash: 'Flash pop-up', learn: 'Free courses', offers: 'Offers page', link: 'Shared link',
};

/** What the AI writer answers (POST /admin/promotions/ai/draft). */
export interface AiDraft {
  fields: CampaignFields;
  /** Points the administrator should check: what was assumed or is missing. */
  notes: string[];
  /** The art direction for a new picture, in English. */
  image_prompt: string;
  model: string;
  engine: 'developer' | 'vertex';
}
/** What the AI painter answers (POST /admin/promotions/ai/image). */
export interface AiPicture { image_key: string; model: string; engine: string; warning: string | null }
/** Whether the AI can work now (GET /admin/promotions/ai). */
export interface AiStatus { available: boolean; engine: 'developer' | 'vertex'; writing_model: string | null; image_model: string | null }

export const PUBLIC_SITE = 'https://www.learnfrenchwithnatives.com';
/** The address of a campaign on the public site, in one language. */
export const campaignUrl = (slug: string, lang: Lang) => `${PUBLIC_SITE}${lang === 'fr' ? '/fr/offres/' : '/offers/'}?p=${encodeURIComponent(slug)}`;

/** A new campaign: a group class that starts being shown now, for three weeks. */
export function blankCampaign(): CampaignFields {
  const start = new Date();
  const end = new Date(Date.now() + 21 * 86_400_000);
  end.setHours(23, 59, 0, 0);
  return {
    kind: 'group_class',
    title_en: null, title_fr: null, tagline_en: null, tagline_fr: null, description_en: null, description_fr: null,
    highlights_en: [], highlights_fr: [], cta_en: null, cta_fr: null, badge_en: null, badge_fr: null,
    audience: 'general', level: null, class_starts_on: null, class_ends_on: null, schedule_en: null, schedule_fr: null,
    teacher_name: null, seat_limit: 8, seats_offline: 0, seats_display: 'auto',
    price_regular: null, price_promo: null, currency: 'CAD', price_note_en: null, price_note_fr: null,
    starts_at: start.toISOString(), ends_at: end.toISOString(), show_countdown: true,
    place_bar: false, place_home: true, place_flash: false, place_learn: true, priority: 0,
    theme: 'navy', image_key: null, registration_mode: 'form', cta_url: null,
  };
}

/** The editable fields of a campaign, without its counts. */
export function fieldsOf(c: Campaign): CampaignFields {
  const blank = blankCampaign();
  const out = {} as Record<string, unknown>;
  // A field the server did not send (before its migration) keeps its default.
  (Object.keys(blank) as (keyof CampaignFields)[]).forEach(k => { out[k] = c[k] === undefined ? blank[k] : c[k]; });
  if ((c as Partial<Campaign>).seats_display === undefined && c.show_seats === false) out.seats_display = 'never';
  return out as unknown as CampaignFields;
}

function wordsIn(c: CampaignFields, lang: Lang): PromoWords {
  const other: Lang = lang === 'en' ? 'fr' : 'en';
  const pick = (field: 'title' | 'tagline' | 'description' | 'cta' | 'badge' | 'schedule' | 'price_note') =>
    (c[`${field}_${lang}` as keyof CampaignFields] as string | null) || (c[`${field}_${other}` as keyof CampaignFields] as string | null) || null;
  const own = c[`highlights_${lang}` as 'highlights_en'];
  return {
    title: pick('title'), tagline: pick('tagline'), description: pick('description'),
    highlights: own.length ? own : c[`highlights_${other}` as 'highlights_en'],
    cta: pick('cta'), badge: pick('badge'), schedule: pick('schedule'), price_note: pick('price_note'),
  };
}

/** In "auto", the count shows from this number of seats left: 40 % of the group, and never fewer than 3 (as on the server). */
export const seatsAlertAt = (limit: number) => Math.max(3, Math.ceil(limit * 0.4));

/** The seats of a campaign: registered on the site, outside it, in all, what is left, and whether the site says how many. */
export function seatsIn(c: Pick<CampaignFields, 'seat_limit' | 'seats_offline' | 'seats_display'>, online = 0) {
  const limit = c.seat_limit || 0;
  const offline = limit ? Math.max(0, c.seats_offline || 0) : 0;
  const taken = online + offline;
  const left = limit ? Math.max(0, limit - taken) : null;
  return {
    limit, online, offline, taken, left,
    full: !!limit && taken >= limit,
    shown: !!limit && c.seats_display !== 'never',
    showLeft: !!limit && (c.seats_display === 'always' || (c.seats_display === 'auto' && (left ?? 0) <= seatsAlertAt(limit))),
  };
}

export const SEATS_DISPLAY_LABEL: Record<SeatsDisplay, { name: string; text: string }> = {
  auto: { name: 'When few remain', text: 'Recommended. “Small group · 8 seats max” while many are free, then “3 of 8 seats left” once the group fills up.' },
  always: { name: 'Always', text: 'The number left is always shown, even when the group has just opened.' },
  never: { name: 'Never', text: 'Nothing about the seats. The waiting list still opens when the group is full.' },
};

/** A campaign as the public site receives it: what previews and flyers draw.
 *  `seats_online`: the people registered on the site; those outside it come from the fields. */
export function toPublic(c: CampaignFields, extra: { slug?: string; seats_online?: number } = {}): Promotion {
  const seats = seatsIn(c, extra.seats_online || 0);
  return {
    slug: extra.slug || 'preview', kind: c.kind, audience: c.audience, level: c.level, theme: c.theme, image: c.image_key,
    text: { en: wordsIn(c, 'en'), fr: wordsIn(c, 'fr') },
    class_starts_on: c.class_starts_on, class_ends_on: c.class_ends_on, teacher: c.teacher_name,
    seats: seats.shown ? { limit: seats.limit, left: seats.left ?? 0, show_left: seats.showLeft } : null,
    full: seats.full,
    price: c.price_regular !== null || c.price_promo !== null ? { regular: c.price_regular, promo: c.price_promo, currency: c.currency } : null,
    ends_at: c.ends_at, countdown: !!(c.show_countdown && c.ends_at),
    places: { bar: c.place_bar, home: c.place_home, flash: c.place_flash, learn: c.place_learn },
    registration: { mode: c.registration_mode, url: c.registration_mode === 'link' ? c.cta_url : null },
    priority: c.priority,
  };
}

/** The pictures an administrator can pick for a campaign, grouped by what they show. */
export const PICTURES: { group: string; keys: string[] }[] = [
  { group: 'Classes and teachers', keys: ['teacher', 'hub-hero', 'cat-conversation', 'course-small-talk', 'course-opinions-debate', 'course-spoken-french', 'cat-grammar', 'course-first-steps', 'course-survival-dialogues', 'games-hero'] },
  { group: 'Exams', keys: ['cat-tcf', 'cat-tef', 'cat-delf', 'course-tcf-speaking', 'course-tcf-writing', 'course-tcf-listening', 'course-tcf-reading', 'course-tef-speaking', 'course-tef-writing', 'course-delf-b2', 'course-dalf-c1', 'course-delf-a2', 'placement'] },
  { group: 'Work', keys: ['cat-business', 'course-job-interview', 'course-pro-emails', 'course-customer-service-french', 'course-healthcare-french', 'course-jobs-work', 'story-office'] },
  { group: 'Life in Canada', keys: ['course-settling-in-canada', 'course-quebec-french', 'course-school-parents', 'story-airport', 'story-apartment', 'story-cafe', 'course-everyday-life', 'course-travel-french', 'course-phone-french'] },
  { group: 'Beginners, children, reading', keys: ['cat-beginner', 'course-kids-french', 'kids-classroom', 'course-cooking-french', 'cat-reading', 'course-classic-stories', 'course-real-life-reading', 'cat-listening', 'cat-pronunciation', 'course-french-idioms'] },
];

/** "3 Nov 2026, 14:30" in the administrator's own time zone. */
export const fmtMoment = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
export const fmtShort = (iso: string | null | undefined) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
/** "2 h ago", "3 days ago". */
export function ago(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  const d = Math.round(s / 86400);
  return d === 1 ? 'yesterday' : d < 30 ? `${d} days ago` : fmtShort(iso);
}
export const rate = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 1000) / 10} %` : '—');

/** The registrations of a campaign as a CSV file (opens in Excel, accents kept). */
export function registrationsCsv(rows: Registration[]): string {
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    // A cell that starts like a formula is written as text: a spreadsheet never runs it.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const head = ['Name', 'Email', 'Phone', 'Country', 'Level', 'Message', 'Status', 'Notes', 'Language', 'Came from', 'Page', 'Time zone', 'Registered at'];
  const lines = rows.map(r => [r.full_name, r.email, r.phone, r.country, r.level, r.message, REG_STATUS[r.status].label, r.notes, r.language.toUpperCase(),
    r.placement ? PLACE_LABEL[r.placement] : '', r.source_path, r.timezone, new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 16)].map(cell).join(','));
  return `\uFEFF${[head.join(','), ...lines].join('\r\n')}`;
}

/** The people registered on the site for a campaign (a server from before the seats outside the site counted only them). */
export const seatsOnline = (c: Pick<Campaign, 'seats_online' | 'seats_taken'>) => c.seats_online ?? c.seats_taken ?? 0;
