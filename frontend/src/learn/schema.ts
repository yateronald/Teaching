// Structured data (schema.org) for the learning space, built from the text the
// pages display: courses as free Course items, lessons as LearningResource,
// the hub as a list of courses with its FAQ, breadcrumbs everywhere.
import { CATEGORIES, categoryPath, imageUrl } from './categories';
import { COURSES, coursePath } from './catalog';
import { hubPath, lessonPath, placementPath } from './paths';
import { tx, type CategoryMeta, type CourseMeta, type Lang, type Lesson } from './types';
import { UI } from './ui';

const SITE = 'https://www.learnfrenchwithnatives.com';
const ORG = { '@type': 'EducationalOrganization', '@id': `${SITE}/#organization`, name: 'Learn French with Natives', url: `${SITE}/`, logo: `${SITE}/logo.png` };
const abs = (p: string) => `${SITE}${p}`;

function crumbs(items: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

const ISO: Record<string, string> = { A1: 'Beginner (CEFR A1)', A2: 'Elementary (CEFR A2)', B1: 'Intermediate (CEFR B1)', B2: 'Upper intermediate (CEFR B2)', C1: 'Advanced (CEFR C1)', C2: 'Proficient (CEFR C2)' };

function courseNode(c: CourseMeta, lang: Lang) {
  return {
    '@type': 'Course',
    '@id': `${abs(coursePath(c, lang))}#course`,
    name: tx(c.title, lang),
    description: tx(c.description, lang),
    url: abs(coursePath(c, lang)),
    image: abs(imageUrl(c.image)),
    provider: { '@id': ORG['@id'] },
    inLanguage: 'fr',
    availableLanguage: [lang === 'fr' ? 'French' : 'English'],
    educationalLevel: c.levels.map(l => ISO[l]).join(', '),
    teaches: c.outcomes.map(o => tx(o, lang)),
    isAccessibleForFree: true,
    offers: [{ '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'CAD' }],
    hasCourseInstance: [{ '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: `PT${c.minutes}M` }],
  };
}

export function hubJsonLd(lang: Lang) {
  const ui = UI[lang];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'CollectionPage',
        '@id': `${abs(hubPath(lang))}#webpage`,
        url: abs(hubPath(lang)),
        name: ui.hub.metaTitle,
        description: ui.hub.metaDescription,
        inLanguage: lang,
        about: { '@id': ORG['@id'] },
      },
      {
        '@type': 'ItemList',
        itemListElement: COURSES.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: courseNode(c, lang) })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: ui.hub.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      crumbs([[ui.home, lang === 'fr' ? '/fr/' : '/'], [ui.learnHome, hubPath(lang)]]),
    ],
  };
}

export function categoryJsonLd(cat: CategoryMeta, lang: Lang) {
  const ui = UI[lang];
  const list = COURSES.filter(c => c.category === cat.id);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'CollectionPage',
        url: abs(categoryPath(cat, lang)),
        name: tx(cat.name, lang),
        description: tx(cat.description, lang),
        inLanguage: lang,
      },
      { '@type': 'ItemList', itemListElement: list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: courseNode(c, lang) })) },
      crumbs([[ui.home, lang === 'fr' ? '/fr/' : '/'], [ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)]]),
    ],
  };
}

export function courseJsonLd(c: CourseMeta, lessons: Lesson[], lang: Lang) {
  const ui = UI[lang];
  const cat = CATEGORIES.find(x => x.id === c.category)!;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        ...courseNode(c, lang),
        syllabusSections: lessons.map(l => ({ '@type': 'Syllabus', name: tx(l.title, lang), description: tx(l.summary, lang), timeRequired: `PT${l.minutes}M` })),
      },
      crumbs([[ui.home, lang === 'fr' ? '/fr/' : '/'], [ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)], [tx(c.title, lang), coursePath(c, lang)]]),
    ],
  };
}

export function lessonJsonLd(c: CourseMeta, lesson: Lesson, lang: Lang) {
  const ui = UI[lang];
  const cat = CATEGORIES.find(x => x.id === c.category)!;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'LearningResource',
        name: tx(lesson.title, lang),
        description: tx(lesson.summary, lang),
        url: abs(lessonPath(c, lesson, lang)),
        learningResourceType: 'Interactive lesson',
        interactivityType: 'active',
        educationalLevel: c.levels.map(l => ISO[l]).join(', '),
        inLanguage: 'fr',
        isAccessibleForFree: true,
        timeRequired: `PT${lesson.minutes}M`,
        teaches: lesson.objectives.map(o => tx(o, lang)),
        isPartOf: { '@id': `${abs(coursePath(c, lang))}#course` },
        provider: { '@id': ORG['@id'] },
      },
      crumbs([[ui.learnHome, hubPath(lang)], [tx(cat.name, lang), categoryPath(cat, lang)], [tx(c.title, lang), coursePath(c, lang)], [tx(lesson.title, lang), lessonPath(c, lesson, lang)]]),
    ],
  };
}

export function placementJsonLd(lang: Lang) {
  const ui = UI[lang];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'Quiz',
        name: ui.placement.title,
        description: ui.placement.metaDescription,
        url: abs(placementPath(lang)),
        educationalLevel: 'CEFR A1–C1',
        inLanguage: 'fr',
        isAccessibleForFree: true,
        provider: { '@id': ORG['@id'] },
      },
      crumbs([[ui.learnHome, hubPath(lang)], [ui.placement.eyebrow, placementPath(lang)]]),
    ],
  };
}

/** A level page: the courses and lessons of one CEFR level (optionally one path). */
export function levelJsonLd(o: { lang: Lang; path: string; name: string; description: string; items: { name: string; path: string }[]; trail: [string, string][] }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      { '@type': 'CollectionPage', url: abs(o.path), name: o.name, description: o.description, inLanguage: o.lang },
      { '@type': 'ItemList', itemListElement: o.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })) },
      crumbs(o.trail),
    ],
  };
}
