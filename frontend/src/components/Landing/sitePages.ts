// Every public, indexable page of the site, in one list: the router, the
// build-time pre-render and the sitemap all read it, so a page cannot exist in
// one place and be forgotten in another.
//
// The home page (/, /fr/) presents the school; each topic page answers one
// search on its own (a person looking for "TCF Canada preparation" lands on
// the page about exactly that), with its English and French versions linked
// to each other through hreflang.
import { PATHS, type Lang } from './landingContent';

export type TopicId = 'tcf-canada' | 'tef-canada' | 'quebec' | 'delf-dalf' | 'online' | 'business' | 'kids';

export const TOPIC_IDS: TopicId[] = ['tcf-canada', 'tef-canada', 'quebec', 'delf-dalf', 'online', 'business', 'kids'];

// URLs carry the words people search for, in the language of the page.
export const TOPIC_PATHS: Record<TopicId, Record<Lang, string>> = {
  'tcf-canada': { en: '/tcf-canada-preparation/', fr: '/fr/preparation-tcf-canada/' },
  'tef-canada': { en: '/tef-canada-preparation/', fr: '/fr/preparation-tef-canada/' },
  quebec: { en: '/tcf-quebec-tefaq-preparation/', fr: '/fr/preparation-tcf-quebec-tefaq/' },
  'delf-dalf': { en: '/delf-dalf-preparation/', fr: '/fr/preparation-delf-dalf/' },
  online: { en: '/online-french-classes/', fr: '/fr/cours-de-francais-en-ligne/' },
  business: { en: '/business-french-classes/', fr: '/fr/cours-de-francais-des-affaires/' },
  kids: { en: '/french-classes-for-kids/', fr: '/fr/cours-de-francais-pour-enfants/' },
};

/** The page that lists the live campaigns (src/promo/OffersPage.tsx). */
export const OFFERS_PATHS: Record<Lang, string> = { en: '/offers/', fr: '/fr/offres/' };

export interface PublicPage {
  path: string;
  lang: Lang;
  /** Absent for the home page. */
  topic?: TopicId;
  /** The offers page. */
  offers?: boolean;
  /** Weight in the sitemap (defaults: 1.0 for the home page, 0.8 for a topic page). */
  priority?: string;
  /** The same page in each language (hreflang). */
  alternates: Record<Lang, string>;
}

const LANGS: Lang[] = ['en', 'fr'];

export const PUBLIC_PAGES: PublicPage[] = [
  ...LANGS.map(lang => ({ path: PATHS[lang], lang, alternates: PATHS })),
  ...TOPIC_IDS.flatMap(topic => LANGS.map(lang => ({ path: TOPIC_PATHS[topic][lang], lang, topic, alternates: TOPIC_PATHS[topic] }))),
  ...LANGS.map(lang => ({ path: OFFERS_PATHS[lang], lang, offers: true, priority: '0.7', alternates: OFFERS_PATHS })),
];
