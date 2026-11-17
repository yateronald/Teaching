// Structured data (schema.org) for the practice space: the reading library
// as a list of learning resources with its FAQ, each text as a
// LearningResource with its recordings, breadcrumbs everywhere.
import { imageUrl } from '../categories';
import { hubPath } from '../paths';
import { tx, type Lang } from '../types';
import { UI } from '../ui';
import { P } from './copy';
import { TEXTS, readingPath, textMinutes, textPath } from './meta';
import type { TextMeta } from './types';

const SITE = 'https://www.learnfrenchwithnatives.com';
const ORG = { '@type': 'EducationalOrganization', '@id': `${SITE}/#organization`, name: 'Learn French with Natives', url: `${SITE}/`, logo: `${SITE}/logo.png` };
const abs = (p: string) => `${SITE}${p}`;
const ISO: Record<string, string> = { A1: 'Beginner (CEFR A1)', A2: 'Elementary (CEFR A2)', B1: 'Intermediate (CEFR B1)', B2: 'Upper intermediate (CEFR B2)', C1: 'Advanced (CEFR C1)', C2: 'Proficient (CEFR C2)' };

const crumbs = (items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});

export function libraryTrail(lang: Lang): [string, string][] {
  const ui = UI[lang];
  return [[ui.home, lang === 'fr' ? '/fr/' : '/'], [ui.learnHome, hubPath(lang)], [P[lang].text.eyebrow, readingPath(lang)]];
}

// The recordings are not listed: they are not offered as files (useNarration.ts).
function textNode(t: TextMeta, lang: Lang) {
  return {
    '@type': 'LearningResource',
    '@id': `${abs(textPath(t, lang))}#text`,
    name: t.title,
    description: tx(t.subtitle, lang),
    url: abs(textPath(t, lang)),
    image: abs(imageUrl(t.image)),
    learningResourceType: 'Reading passage',
    educationalLevel: ISO[t.level],
    inLanguage: 'fr',
    isAccessibleForFree: true,
    timeRequired: `PT${textMinutes(t)}M`,
    teaches: tx(t.focus, lang),
    provider: { '@id': ORG['@id'] },
  };
}

export function libraryJsonLd(lang: Lang) {
  const c = P[lang].library;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      { '@type': 'CollectionPage', url: abs(readingPath(lang)), name: c.metaTitle, description: c.metaDescription, inLanguage: lang },
      { '@type': 'ItemList', itemListElement: TEXTS.map((t, i) => ({ '@type': 'ListItem', position: i + 1, item: textNode(t, lang) })) },
      { '@type': 'FAQPage', mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      crumbs(libraryTrail(lang)),
    ],
  };
}

export function textJsonLd(t: TextMeta, lang: Lang) {
  return {
    '@context': 'https://schema.org',
    '@graph': [ORG, textNode(t, lang), crumbs([...libraryTrail(lang), [t.title, textPath(t, lang)]])],
  };
}
