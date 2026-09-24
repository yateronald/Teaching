// Schema.org structured data for the public pages, built from the same copy the
// page displays (Google requires structured data to match visible content).
import { CONTACT_EMAIL, LANDING, PATHS, SITE_URL, type Lang } from './landingContent';
import { TOPIC_PATHS, type TopicId } from './sitePages';
import { TOPICS, TOPIC_UI } from './topicContent';

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

// The school and the site, described identically on every page.
function siteNodes() {
  return [
      {
        '@type': 'EducationalOrganization',
        '@id': ORG_ID,
        name: 'Learn French with Natives',
        alternateName: 'LFWN',
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
        image: `${SITE_URL}/assets/og-image.png`,
        description: LANDING.en.meta.description,
        email: CONTACT_EMAIL,
        areaServed: 'Worldwide',
        knowsLanguage: ['fr', 'en'],
        contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: CONTACT_EMAIL, availableLanguage: ['English', 'French'] }],
        sameAs: [
          'https://www.facebook.com/learnfrenchwithnatives',
          'https://www.instagram.com/learnfrenchwithnatives',
          'https://www.linkedin.com/company/learn-french-with-natives',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': SITE_ID,
        url: `${SITE_URL}/`,
        name: 'Learn French with Natives',
        inLanguage: ['en', 'fr'],
        publisher: { '@id': ORG_ID },
      },
  ];
}

export function landingJsonLd(lang: Lang) {
  const copy = LANDING[lang];
  const url = `${SITE_URL}${PATHS[lang]}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteNodes(),
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: copy.meta.title,
        description: copy.meta.description,
        inLanguage: lang,
        isPartOf: { '@id': SITE_ID },
        about: { '@id': ORG_ID },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/assets/og-image.png` },
      },
      ...copy.programs.items.map(p => ({
        '@type': 'Course',
        '@id': `${url}#course-${p.id}`,
        name: `${p.title} | ${copy.programs.eyebrow}`,
        description: p.desc,
        provider: { '@id': ORG_ID },
        inLanguage: 'fr',
        availableLanguage: ['en', 'fr'],
        educationalLevel: p.levels.replace('→', '-'),
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
      })),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang,
        mainEntity: copy.faq.items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}

/** One exam or course page: the page, where it sits in the site, the course and its FAQ. */
export function topicJsonLd(topic: TopicId, lang: Lang) {
  const t = TOPICS[lang][topic];
  const url = `${SITE_URL}${TOPIC_PATHS[topic][lang]}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteNodes(),
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: lang,
        isPartOf: { '@id': SITE_ID },
        about: { '@id': `${url}#course` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}/assets/og-image.png` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: TOPIC_UI[lang].home, item: `${SITE_URL}${PATHS[lang]}` },
          { '@type': 'ListItem', position: 2, name: t.name, item: url },
        ],
      },
      {
        '@type': 'Course',
        '@id': `${url}#course`,
        name: t.name,
        description: t.meta.description,
        url,
        provider: { '@id': ORG_ID },
        inLanguage: 'fr',
        availableLanguage: ['en', 'fr'],
        educationalLevel: t.level,
        hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang,
        mainEntity: t.faq.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };
}
