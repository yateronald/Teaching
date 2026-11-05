// Addresses of the learning space, in the language of each page:
//   /learn/                                   /fr/apprendre/
//   /learn/french-grammar/                    /fr/apprendre/grammaire-francaise/
//   /learn/french-grammar/<course>/           (course page)
//   /learn/french-grammar/<course>/<lesson>/  (lesson)
//   /learn/french-level-test/                 /fr/apprendre/test-de-niveau/
//   /learn/my-progress/                       /fr/apprendre/ma-progression/
//   /learn/level/b2/                          /fr/apprendre/niveau/b2/
//   /learn/tcf-canada/level-b2/               /fr/apprendre/tcf-canada/niveau-b2/
import { CATEGORIES, LEARN_BASE, categoryPath } from './categories';
import { COURSES, coursePath } from './catalog';
import { categoryLevels, LEVEL_SLUG, levelFromSlug } from './levels';
import type { CategoryMeta, CourseMeta, Lang, Lesson, Level } from './types';

export { LEARN_BASE, categoryPath, coursePath };

export const PLACEMENT_SLUG: Record<Lang, string> = { en: 'french-level-test', fr: 'test-de-niveau' };
export const PROGRESS_SLUG: Record<Lang, string> = { en: 'my-progress', fr: 'ma-progression' };

export const hubPath = (lang: Lang) => LEARN_BASE[lang];
export const placementPath = (lang: Lang) => `${LEARN_BASE[lang]}${PLACEMENT_SLUG[lang]}/`;
export const progressPath = (lang: Lang) => `${LEARN_BASE[lang]}${PROGRESS_SLUG[lang]}/`;
export const lessonPath = (course: CourseMeta, lesson: Lesson, lang: Lang) => `${coursePath(course, lang)}${lesson.slug[lang]}/`;
/** The final assessment of a course has its own address. */
export const FINAL_SLUG: Record<Lang, string> = { en: 'final-assessment', fr: 'evaluation-finale' };
export const finalPath = (course: CourseMeta, lang: Lang) => `${coursePath(course, lang)}${FINAL_SLUG[lang]}/`;

export type LearnRoute =
  | { type: 'hub'; lang: Lang }
  | { type: 'placement'; lang: Lang }
  | { type: 'progress'; lang: Lang }
  | { type: 'category'; lang: Lang; category: CategoryMeta }
  | { type: 'level'; lang: Lang; level: Level; category?: CategoryMeta }
  | { type: 'course'; lang: Lang; category: CategoryMeta; course: CourseMeta }
  | { type: 'lesson'; lang: Lang; category: CategoryMeta; course: CourseMeta; lessonSlug: string }
  | { type: 'final'; lang: Lang; category: CategoryMeta; course: CourseMeta }
  | { type: 'none'; lang: Lang };

/** What an address of the learning space shows. Lessons are checked once their course is loaded. */
export function resolveLearnPath(pathname: string): LearnRoute {
  const lang: Lang = pathname.startsWith(LEARN_BASE.fr) || pathname === '/fr/apprendre' ? 'fr' : 'en';
  const rest = pathname.slice(LEARN_BASE[lang].length - 1).split('/').filter(Boolean);
  if (rest.length === 0) return { type: 'hub', lang };
  if (rest.length === 1 && rest[0] === PLACEMENT_SLUG[lang]) return { type: 'placement', lang };
  if (rest.length === 1 && rest[0] === PROGRESS_SLUG[lang]) return { type: 'progress', lang };
  if (rest[0] === LEVEL_SLUG[lang]) {
    const level = rest.length === 2 ? levelFromSlug(rest[1]) : undefined;
    return level ? { type: 'level', lang, level } : { type: 'none', lang };
  }
  const category = CATEGORIES.find(c => c.slug[lang] === rest[0]);
  if (!category) return { type: 'none', lang };
  if (rest.length === 1) return { type: 'category', lang, category };
  if (rest.length === 2 && rest[1].startsWith(`${LEVEL_SLUG[lang]}-`)) {
    const level = levelFromSlug(rest[1].slice(LEVEL_SLUG[lang].length + 1));
    return level && categoryLevels(category).includes(level) ? { type: 'level', lang, level, category } : { type: 'none', lang };
  }
  const course = COURSES.find(c => c.category === category.id && c.slug[lang] === rest[1]);
  if (!course) return { type: 'none', lang };
  if (rest.length === 2) return { type: 'course', lang, category, course };
  if (rest.length === 3 && rest[2] === FINAL_SLUG[lang] && !course.ladder) return { type: 'final', lang, category, course };
  if (rest.length === 3) return { type: 'lesson', lang, category, course, lessonSlug: rest[2] };
  return { type: 'none', lang };
}

