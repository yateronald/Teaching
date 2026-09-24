import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL, type Lang } from '../Landing/landingContent';

/**
 * Head tags for one page: title, description, robots, canonical, hreflang
 * alternates, Open Graph / Twitter cards and optional JSON-LD.
 *
 * The public pages are pre-rendered at build time (scripts/prerender.mjs), so
 * everything emitted here is present in the HTML that search engines and
 * social networks download — not only after JavaScript runs.
 *
 *   <SEO lang="fr" path="/fr/" title="…" description="…" alternates={{ en: '/', fr: '/fr/' }} jsonLd={graph} />
 *   <SEO title="Sign in — Learn French with Natives" path="/login" noindex />
 */
interface SEOProps {
  lang?: Lang;
  title: string;
  description: string;
  /** Canonical path of this page, e.g. "/" or "/fr/". */
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** Same page in other languages (hreflang). The first entry is also x-default. */
  alternates?: Partial<Record<Lang, string>>;
  jsonLd?: object;
  /** LCP image to preload (responsive). */
  preloadImage?: { href: string; srcSet?: string; sizes?: string; type?: string };
}

const OG_IMAGE = `${SITE_URL}/assets/og-image.png`;
const OG_LOCALE: Record<Lang, string> = { en: 'en_CA', fr: 'fr_CA' };
const HREFLANGS: Record<Lang, string[]> = { en: ['en'], fr: ['fr'] };

const SEO: React.FC<SEOProps> = ({
  lang = 'en', title, description, path = '/', image = OG_IMAGE, imageAlt = 'Learn French with Natives',
  type = 'website', noindex = false, alternates, jsonLd, preloadImage,
}) => {
  const canonical = `${SITE_URL}${path}`;
  const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const alt = alternates ? (Object.entries(alternates) as [Lang, string][]) : [];
  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {/* A page kept out of the index has no preferred address to declare. */}
      {!noindex && <link rel="canonical" href={canonical} />}
      {alt.flatMap(([l, p]) => HREFLANGS[l].map(code => <link key={code} rel="alternate" hrefLang={code} href={`${SITE_URL}${p}`} />))}
      {alt.length > 0 && <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}${alt[0][1]}`} />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Learn French with Natives" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:locale" content={OG_LOCALE[lang]} />
      {alt.filter(([l]) => l !== lang).map(([l]) => <meta key={l} property="og:locale:alternate" content={OG_LOCALE[l]} />)}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {preloadImage && (
        <link rel="preload" as="image" href={preloadImage.href} imageSrcSet={preloadImage.srcSet} imageSizes={preloadImage.sizes} type={preloadImage.type} fetchPriority="high" />
      )}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default SEO;
