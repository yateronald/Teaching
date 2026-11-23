// Addresses of the legal pages (kept apart from their long texts, which only
// the pages themselves download: see entry.tsx).
import type { Lang } from '../components/Landing/landingContent';

export type LegalKind = 'privacy' | 'terms';

export const LEGAL_PATHS: Record<LegalKind, Record<Lang, string>> = {
  privacy: { en: '/privacy-policy/', fr: '/fr/politique-de-confidentialite/' },
  terms: { en: '/terms-of-service/', fr: '/fr/conditions-d-utilisation/' },
};
