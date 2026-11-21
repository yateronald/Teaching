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
import { LEVELS, tx, type CourseAbout, type Lang, type Lesson } from './types';
import { allLevelPages, categoryLevelPath, levelPath } from './levels';
import { GAMES, gamePath, gamesPath } from './games/meta';
import { TEXTS, practicePath, readingPath, textPath } from './practice/meta';
import { MISSIONS, missionPath } from './practice/missions';
import { LISTENING, exercisePath, listeningPath } from './practice/listening/catalog';
import { checkText } from './practice/model';
import { registerText } from './practice/registry';
import type { ReadingText } from './practice/types';
import { EAR, earPath } from './practice/ear/meta';
import { checkEar } from './practice/ear/check';
import { registerEar } from './practice/ear/registry';
import type { EarCourse } from './practice/ear/types';
import { DIALOGUES, dialoguePath } from './practice/dialogues/meta';
import { checkDialogue } from './practice/dialogues/check';
import { registerDialogue } from './practice/dialogues/registry';
import type { Dialogue } from './practice/dialogues/types';
import { DICTATIONS, dictationCoursePath, dictationPath } from './practice/dictation/catalog';
import { c1Listening } from './practice/listening/c1';
import { c2Listening } from './practice/listening/c2';
import { registerAdvanced } from './practice/listening/advanced';

const modules = import.meta.glob<{ default: Lesson[]; about?: CourseAbout }>('./content/courses/*.ts', { eager: true });
const textModules = import.meta.glob<{ default: ReadingText }>('./practice/texts/*.ts', { eager: true });
const earModules = import.meta.glob<{ default: EarCourse }>('./practice/ear/courses/*.ts', { eager: true });
const dialogueModules = import.meta.glob<{ default: Record<string, Dialogue> }>('./practice/dialogues/content/*.ts', { eager: true });

export interface LearnPage { path: string; lang: Lang; alternates: Record<Lang, string>; priority: string; sitemap: boolean }

export function prepareLearn(): string[] {
  setLearnApp(LearnApp);
  registerPlacement(PLACEMENT);
  const warnings: string[] = [];
  for (const [file, mod] of Object.entries(modules)) {
    const id = file.replace(/^.*\/(.+)\.ts$/, '$1');
    registerLessons(id, mod.default, mod.about);
  }
  for (const c of COURSES) {
    const lessons = modules[`./content/courses/${c.id}.ts`]?.default;
    if (!lessons) { warnings.push(`course ${c.id} has no content file`); continue; }
    if (!c.description && !modules[`./content/courses/${c.id}.ts`]?.about) warnings.push(`course ${c.id} has no description (catalog or export const about)`);
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
  // Ear-training courses: registered, and checked against their entry in practice/ear/meta.ts.
  for (const e of EAR) {
    const course = earModules[`./practice/ear/courses/${e.id}.ts`]?.default;
    if (!course) { warnings.push(`ear course ${e.id} has no content file`); continue; }
    registerEar(course);
    warnings.push(...checkEar(e, course));
  }
  // Dialogues: registered, and checked against their entry in practice/dialogues/meta.ts.
  const listed = new Set(DIALOGUES.map(d => d.id));
  for (const [file, mod] of Object.entries(dialogueModules)) {
    for (const [id, d] of Object.entries(mod.default)) {
      if (d.id !== id) warnings.push(`dialogue ${id}: its content says id ${d.id}`);
      if (!listed.has(id)) warnings.push(`dialogue ${id} (${file}) is not in practice/dialogues/meta.ts`);
    }
  }
  for (const m of DIALOGUES) {
    const d = dialogueModules[`./practice/dialogues/content/${m.theme}.ts`]?.default[m.id];
    if (!d) { warnings.push(`dialogue ${m.id} has no content in content/${m.theme}.ts`); continue; }
    registerDialogue(d);
    warnings.push(...checkDialogue(m, d));
  }
  // Advanced listening documents: registered, and their library entries checked against the content.
  const advanced = [...c1Listening, ...c2Listening];
  registerAdvanced(advanced);
  for (const s of LISTENING.filter(e => e.lazy)) {
    const e = advanced.find(x => x.id === s.id);
    if (!e) { warnings.push(`listening ${s.id}: no content in c1.ts / c2.ts`); continue; }
    if (e.title !== s.title || e.level !== s.level || e.voice !== s.voice || e.questions.length !== s.count || tx(e.format, 'fr') !== tx(s.format, 'fr') || tx(e.summary, 'en') !== tx(s.summary, 'en')) {
      warnings.push(`listening ${s.id}: advanced-meta.ts differs from its content (run node scripts/listening-stubs.mjs)`);
    }
    if (e.outline && e.outline.length !== e.segments.length) warnings.push(`listening ${s.id}: the plan has ${e.outline.length} parts for ${e.segments.length} segments`);
    e.questions.forEach((q, i) => { if (!e.segments[q.cue]) warnings.push(`listening ${s.id}: question ${i + 1} points to a missing segment`); });
  }
  for (const e of advanced) if (!LISTENING.some(s => s.id === e.id)) warnings.push(`listening ${e.id} is missing from advanced-meta.ts`);
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
  // The practice space: its home (the five skills), then each library.
  both(practicePath, '0.8');
  both(readingPath, '0.8');
  TEXTS.forEach(t => both(l => textPath(t, l), '0.7'));
  MISSIONS.forEach(m => both(l => missionPath(m, l), '0.7', false));
  both(listeningPath, '0.8');
  LISTENING.forEach(e => both(l => exercisePath(e, l), '0.7'));
  EAR.forEach(e => both(l => earPath(e, l), '0.7'));
  DIALOGUES.forEach(d => both(l => dialoguePath(d, l), '0.7'));
  both(dictationPath, '0.8');
  DICTATIONS.forEach(d => both(l => dictationCoursePath(d, l), '0.7'));
  return pages;
}
