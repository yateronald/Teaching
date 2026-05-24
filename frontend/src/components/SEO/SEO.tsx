import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  /** Override the page title. Defaults to a localized site title. */
  title?: string;
  /** Override the meta description. Defaults to a localized site description. */
  description?: string;
  /** Page-specific canonical path (relative to origin). Defaults to "/". */
  path?: string;
  /** Override Open Graph image URL. */
  image?: string;
  /** OG / Twitter type. Defaults to "website". */
  type?: 'website' | 'article';
  /** Comma-separated keywords (English-locale defaults are usually enough). */
  keywords?: string;
  /** Hide page from search engines (used for /login, /dashboard, etc.). */
  noindex?: boolean;
}

/**
 * Reusable SEO component that updates <head> meta tags dynamically based on:
 *  - the current i18n language (en / fr)
 *  - per-page overrides (title, description, path, image)
 *
 * Also keeps `<html lang="...">` in sync with i18n.language so screen readers
 * and search engines correctly identify the page language.
 *
 * Usage:
 *   <SEO />
 *   <SEO title="Sign in — Learn French with Natives" path="/login" noindex />
 */
const SITE_URL = 'https://www.learnfrenchwithnatives.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/og-image.png`;

const LOCALIZED_DEFAULTS: Record<string, { title: string; description: string; keywords: string }> = {
  en: {
    title: 'Learn French Online with Native Teachers — TEF, TCF, DELF, DALF Prep | Learn French with Natives',
    description:
      'Learn French online with certified native teachers. Personalized coaching for TEF Canada, TCF, DELF, DALF and TEFAQ exams. 98% pass rate, 1000+ students. Book your free demo today.',
    keywords:
      'learn French online, learn French, French native teachers, French language course, French tutor online, TEF Canada preparation, TEF Canada online prep, TCF Canada, TCF Quebec, DELF preparation, DALF preparation, TEFAQ, French exam prep, French for immigration, French Express Entry, French CLB 7, French CLB 9, French speaking practice, French listening practice, AI French simulation, French speaking AI, online French classes, private French tutor, French immersion online, beginner French, intermediate French, advanced French, French B2, French C1, French C2, business French, conversational French, French for kids, French for Quebec immigration, French citizenship test prep',
  },
  fr: {
    title:
      'Apprendre le français en ligne avec des professeurs natifs — Préparation TEF, TCF, DELF, DALF | Learn French with Natives',
    description:
      'Apprenez le français en ligne avec des professeurs natifs certifiés. Préparation personnalisée pour TEF Canada, TCF, DELF, DALF et TEFAQ. 98 % de réussite, 1 000+ étudiants. Réservez votre démo gratuite.',
    keywords:
      'apprendre le français en ligne, cours de français en ligne, professeur de français natif, professeur français certifié, préparation TEF Canada, préparation TCF, préparation DELF, préparation DALF, examen TEFAQ, examen de français en ligne, français pour immigration Canada, français Entrée Express, français CLB 7, français CLB 9, simulation IA expression orale, cours particuliers français, professeur particulier français, français débutant, français intermédiaire, français avancé, français B2 C1 C2, français des affaires, français conversationnel, français pour enfants, immigration Québec français',
  },
};

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  keywords,
  noindex = false,
}) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').slice(0, 2);
  const defaults = LOCALIZED_DEFAULTS[lang] ?? LOCALIZED_DEFAULTS.en;

  const finalTitle = title ?? defaults.title;
  const finalDescription = description ?? defaults.description;
  const finalKeywords = keywords ?? defaults.keywords;
  const finalImage = image ?? DEFAULT_OG_IMAGE;
  const canonical = `${SITE_URL}${path}${path.includes('?') ? '&' : path === '/' ? '' : ''}`;
  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const ogLocale = lang === 'fr' ? 'fr_FR' : 'en_US';
  const ogLocaleAlt = lang === 'fr' ? 'en_US' : 'fr_FR';

  // Keep <html lang="..."> attribute in sync with i18n language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* hreflang per-language */}
      <link rel="alternate" hrefLang="en" href={`${SITE_URL}${path}`} />
      <link
        rel="alternate"
        hrefLang="fr"
        href={`${SITE_URL}${path}${path.includes('?') ? '&' : '?'}lang=fr`}
      />
      <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${path}`} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={ogLocaleAlt} />
      <meta property="og:site_name" content="Learn French with Natives" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export default SEO;
