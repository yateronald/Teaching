// Addresses of the learning space, in the language of each page:
//   /learn/                                   /fr/apprendre/
//   /learn/french-grammar/                    /fr/apprendre/grammaire-francaise/
//   /learn/french-grammar/<course>/           (course page)
//   /learn/french-grammar/<course>/<lesson>/  (lesson)
//   /learn/french-level-test/                 /fr/apprendre/test-de-niveau/
//   /learn/my-progress/                       /fr/apprendre/ma-progression/
//   /learn/level/b2/                          /fr/apprendre/niveau/b2/
//   /learn/games/                             /fr/apprendre/jeux/
//   /learn/games/le-or-la/                    /fr/apprendre/jeux/le-ou-la/
//   /learn/tcf-canada/level-b2/               /fr/apprendre/tcf-canada/niveau-b2/
import { CATEGORIES, LEARN_BASE, categoryPath } from './categories';
import { COURSES, coursePath } from './catalog';
import { categoryLevels, LEVEL_SLUG, levelFromSlug } from './levels';
import { GAMES, GAMES_SLUG, type GameMeta } from './games/meta';
import { PRACTICE_SLUG, TEXTS, skillById } from './practice/meta';
import { MISSIONS, type ReadingMission } from './practice/missions';
import { LISTENING } from './practice/listening/catalog';
import type { ListeningExercise } from './practice/listening/types';
import type { TextMeta } from './practice/types';
import type { CategoryMeta, CourseMeta, Lang, Lesson, Level } from './types';

export { LEARN_BASE, categoryPath, coursePath };

export const PLACEMENT_SLUG: Record<Lang, string> = { en: 'french-level-test', fr: 'test-de-niveau' };
export const PROGRESS_SLUG: Record<Lang, string> = { en: 'my-progress', fr: 'ma-progression' };

/** Link state: open the lesson player straight away (one click from a course to the exercise). */
export const AUTOSTART = { autostart: true } as const;
export const hasAutostart = (state: unknown) => !!(state as { autostart?: boolean } | null)?.autostart;

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
  | { type: 'games'; lang: Lang }
  | { type: 'game'; lang: Lang; game: GameMeta }
  | { type: 'course'; lang: Lang; category: CategoryMeta; course: CourseMeta }
  | { type: 'lesson'; lang: Lang; category: CategoryMeta; course: CourseMeta; lessonSlug: string }
  | { type: 'final'; lang: Lang; category: CategoryMeta; course: CourseMeta }
  | { type: 'practice'; lang: Lang }
  | { type: 'reading'; lang: Lang }
  | { type: 'text'; lang: Lang; text: TextMeta }
  | { type: 'reading-mission'; lang: Lang; mission: ReadingMission }
  | { type: 'listening'; lang: Lang }
  | { type: 'listening-exercise'; lang: Lang; exercise: ListeningExercise }
  | { type: 'none'; lang: Lang };

/** What an address of the learning space shows. Lessons are checked once their course is loaded. */
export function resolveLearnPath(pathname: string): LearnRoute {
  const lang: Lang = pathname.startsWith(LEARN_BASE.fr) || pathname === '/fr/apprendre' ? 'fr' : 'en';
  const rest = pathname.slice(LEARN_BASE[lang].length - 1).split('/').filter(Boolean);
  if (rest.length === 0) return { type: 'hub', lang };
  if (rest.length === 1 && rest[0] === PLACEMENT_SLUG[lang]) return { type: 'placement', lang };
  if (rest.length === 1 && rest[0] === PROGRESS_SLUG[lang]) return { type: 'progress', lang };
  if (rest[0] === GAMES_SLUG[lang]) {
    if (rest.length === 1) return { type: 'games', lang };
    const game = rest.length === 2 ? GAMES.find(x => x.slug[lang] === rest[1]) : undefined;
    return game ? { type: 'game', lang, game } : { type: 'none', lang };
  }
  // Each practice library has its own routes and exercise format.
  if (rest[0] === PRACTICE_SLUG[lang]) {
    if (rest.length === 1) return { type: 'practice', lang };
    if (rest[1] === skillById('listening').slug[lang]) {
      if (rest.length === 2) return { type: 'listening', lang };
      const exercise = rest.length === 3 ? LISTENING.find(item => item.id === rest[2]) : undefined;
      return exercise ? { type: 'listening-exercise', lang, exercise } : { type: 'none', lang };
    }
    if (rest[1] !== skillById('reading').slug[lang]) return { type: 'none', lang };
    if (rest.length === 2) return { type: 'reading', lang };
    if (rest[2] === 'mission' && rest.length === 4) {
      const mission = MISSIONS.find(m => m.id === rest[3]);
      return mission ? { type: 'reading-mission', lang, mission } : { type: 'none', lang };
    }
    const text = rest.length === 3 ? TEXTS.find(t => t.slug === rest[2]) : undefined;
    return text ? { type: 'text', lang, text } : { type: 'none', lang };
  }
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

