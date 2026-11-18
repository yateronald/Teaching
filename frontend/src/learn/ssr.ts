// Build-time only (entry-prerender.tsx): every course and the level test are
// registered up front, and the list of learning pages is produced for the
// pre-render and the sitemap.
import LearnApp from './LearnApp';
import { setLearnApp } from './entry';
import { registerLessons, registerPlacement } from './content/registry';
import { PLACEMENT } from './content/placement';
import { CATEGORIES, categoryPath } from './categories';
import { COURSES, coursePath } from './catalog';
import { finalPath, hubPath, lessonPath, placementPath, progressPath } from './paths';
import { LEVELS, type Lang, type Lesson } from './types';
import { allLevelPages, categoryLevelPath, levelPath } from './levels';
import { GAMES, gamePath, gamesPath } from './games/meta';
import { TEXTS, practicePath, readingPath, textPath } from './practice/meta';
import { MISSIONS, missionPath } from './practice/missions';
import { checkText } from './practice/model';
import { registerText } from './practice/registry';
import type { ReadingText } from './practice/types';

const modules = import.meta.glob<{ default: Lesson[] }>('./content/courses/*.ts', { eager: true });
const textModules = import.meta.glob<{ default: ReadingText }>('./practice/texts/*.ts', { eager: true });

export interface LearnPage { path: string; lang: Lang; alternates: Record<Lang, string>; priority: string; sitemap: boolean }

export function prepareLearn(): string[] {
  setLearnApp(LearnApp);
  registerPlacement(PLACEMENT);
  const warnings: string[] = [];
  for (const [file, mod] of Object.entries(modules)) {
    const id = file.replace(/^.*\/(.+)\.ts$/, '$1');
    registerLessons(id, mod.default);
  }
  for (const c of COURSES) {
    const lessons = modules[`./content/courses/${c.id}.ts`]?.default;
    if (!lessons) { warnings.push(`course ${c.id} has no content file`); continue; }
    if (lessons.length !== c.lessonCount) warnings.push(`course ${c.id}: ${lessons.length} lessons, catalog says ${c.lessonCount}`);
    lessons.forEach((l, i) => { if (l.id !== `${c.id}-${i + 1}`) warnings.push(`lesson id ${l.id} should be ${c.id}-${i + 1}`); });
    if (c.ladder) lessons.forEach((l, i) => {
      if (l.level !== LEVELS[i]) warnings.push(`levelled course ${c.id}: lesson ${i + 1} should teach ${LEVELS[i]}`);
      const mcq = l.steps.filter(s => s.kind === 'mcq').length;
      if (mcq < 4) warnings.push(`levelled course ${c.id}: lesson ${i + 1} has ${mcq} multiple-choice questions (the adaptive test needs 4)`);
    });
  }
  // Reading texts: registered, and checked against their entry in practice/meta.ts.
  for (const t of TEXTS) {
    const text = textModules[`./practice/texts/${t.id}.ts`]?.default;
    if (!text) { warnings.push(`text ${t.id} has no content file`); continue; }
    if (text.id !== t.id) warnings.push(`text ${t.id}: its file says id ${text.id}`);
    registerText(text);
    warnings.push(...checkText(t, text));
  }
  return warnings;
}

export function learnPages(): LearnPage[] {
  const pages: LearnPage[] = [];
  const both = (f: (l: Lang) => string, priority: string, sitemap = true) => {
    const alternates = { en: f('en'), fr: f('fr') };
    (['en', 'fr'] as Lang[]).forEach(lang => pages.push({ path: alternates[lang], lang, alternates, priority, sitemap }));
  };
  both(hubPath, '0.9');
  both(placementPath, '0.8');
  both(progressPath, '0.1', false);
  both(gamesPath, '0.8');
  GAMES.forEach(g => both(l => gamePath(g, l), '0.7'));
  CATEGORIES.forEach(cat => both(l => categoryPath(cat, l), '0.8'));
  allLevelPages().forEach(({ level, category }) => both(l => (category ? categoryLevelPath(category, level, l) : levelPath(level, l)), '0.7'));
  COURSES.forEach(c => {
    const lessons = modules[`./content/courses/${c.id}.ts`]?.default;
    if (!lessons) return;
    both(l => coursePath(c, l), '0.8');
    lessons.forEach(lesson => both(l => lessonPath(c, lesson, l), '0.6'));
    if (!c.ladder) both(l => finalPath(c, l), '0.4', false);
  });
  // The practice space: /learn/practice/ shows the reading library (not indexed, canonical elsewhere).
  both(practicePath, '0.1', false);
  both(readingPath, '0.8');
  TEXTS.forEach(t => both(l => textPath(t, l), '0.7'));
  MISSIONS.forEach(m => both(l => missionPath(m, l), '0.7', false));
  return pages;
}
