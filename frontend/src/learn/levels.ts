// Pages by CEFR level: /learn/level/b2/ (every course and lesson of the level)
// and /learn/<path>/level-b2/ (one path at that level). A page exists only when
// it has real content: a levelled course (TCF, TEF), or at least two courses.
import { CATEGORIES, LEARN_BASE, categoryPath } from './categories';
import { COURSES } from './catalog';
import { b, LEVELS, type CategoryMeta, type CourseMeta, type Lang, type Level, type T } from './types';

export const LEVEL_SLUG: Record<Lang, string> = { en: 'level', fr: 'niveau' };

export const levelPath = (level: Level, lang: Lang) => `${LEARN_BASE[lang]}${LEVEL_SLUG[lang]}/${level.toLowerCase()}/`;
export const categoryLevelPath = (cat: CategoryMeta, level: Level, lang: Lang) => `${categoryPath(cat, lang)}${LEVEL_SLUG[lang]}-${level.toLowerCase()}/`;

/** Level from a slug part (“b2”), or undefined. */
export const levelFromSlug = (s: string): Level | undefined => LEVELS.find(l => l.toLowerCase() === s);

export const coursesAtLevel = (level: Level, categoryId?: string): CourseMeta[] =>
  COURSES.filter(c => c.levels.includes(level) && (!categoryId || c.category === categoryId));

/** Levels that have a page in this path. */
export function categoryLevels(cat: CategoryMeta): Level[] {
  return LEVELS.filter(l => {
    const cs = coursesAtLevel(l, cat.id);
    return cs.some(c => c.ladder) || cs.length >= 2;
  });
}

/** Every level page, for the pre-render and the sitemap. */
export function allLevelPages(): { level: Level; category?: CategoryMeta }[] {
  return [
    ...LEVELS.map(level => ({ level })),
    ...CATEGORIES.flatMap(category => categoryLevels(category).map(level => ({ level, category }))),
  ];
}

/** What a learner can do at each level (CEFR), and what the level pages say about it. */
export const LEVEL_COPY: Record<Level, { name: T; canDo: T; focus: T }> = {
  A1: {
    name: b('Beginner', 'Débutant'),
    canDo: b('You understand and use everyday expressions and very simple sentences: introduce yourself, ask simple questions, understand numbers, prices and times.', 'Vous comprenez et utilisez des expressions familières et des phrases très simples : vous présenter, poser des questions simples, comprendre les nombres, les prix et l’heure.'),
    focus: b('At A1, the priority is the sounds of French, the present tense of être, avoir and -er verbs, and the vocabulary of daily life.', 'Au niveau A1, la priorité : les sons du français, le présent d’être, d’avoir et des verbes en -er, et le vocabulaire du quotidien.'),
  },
  A2: {
    name: b('Elementary', 'Élémentaire'),
    canDo: b('You handle simple, routine exchanges: shopping, appointments, work, your past and your plans, and you understand short messages and announcements.', 'Vous gérez des échanges simples et habituels : achats, rendez-vous, travail, votre passé et vos projets, et vous comprenez des messages et des annonces courts.'),
    focus: b('At A2, you learn the past tenses, object pronouns, the near future and the language of practical life.', 'Au niveau A2, vous apprenez les temps du passé, les pronoms compléments, le futur proche et la langue de la vie pratique.'),
  },
  B1: {
    name: b('Intermediate', 'Intermédiaire'),
    canDo: b('You understand the main points of clear speech on familiar topics, tell a story, give your opinion with reasons and cope with most travel and work situations.', 'Vous comprenez l’essentiel d’un discours clair sur des sujets familiers, racontez une histoire, donnez votre avis avec des raisons et vous débrouillez dans la plupart des situations de voyage et de travail.'),
    focus: b('At B1, you master the conditional, relative pronouns, connectors and the structure of a short argued text. It is the level often required for citizenship.', 'Au niveau B1, vous maîtrisez le conditionnel, les pronoms relatifs, les connecteurs et la structure d’un court texte argumenté. C’est le niveau souvent exigé pour la citoyenneté.'),
  },
  B2: {
    name: b('Upper intermediate', 'Intermédiaire avancé'),
    canDo: b('You understand the main ideas of complex texts, interact fluently with native speakers and defend a point of view with clear, detailed arguments.', 'Vous comprenez les idées principales de textes complexes, échangez avec aisance avec des natifs et défendez un point de vue avec des arguments clairs et détaillés.'),
    focus: b('At B2, you use the subjunctive, reported speech and logical connectors, and you write structured articles. B2 corresponds roughly to CLB 7, a common target for Express Entry.', 'Au niveau B2, vous employez le subjonctif, le discours rapporté et les connecteurs logiques, et vous rédigez des articles structurés. Le B2 correspond à peu près au NCLC 7, objectif fréquent pour Entrée express.'),
  },
  C1: {
    name: b('Advanced', 'Avancé'),
    canDo: b('You understand long, demanding texts and implicit meaning, express yourself fluently and spontaneously, and use French effectively for work and study.', 'Vous comprenez des textes longs et exigeants et l’implicite, vous vous exprimez couramment et spontanément, et utilisez le français efficacement pour le travail et les études.'),
    focus: b('At C1, the focus is nuance: concession, formal register, the passive and nominalisation, irony and implicit meaning.', 'Au niveau C1, l’enjeu est la nuance : concession, registre soutenu, passif et nominalisation, ironie et implicite.'),
  },
  C2: {
    name: b('Mastery', 'Maîtrise'),
    canDo: b('You understand virtually everything you hear or read, and express yourself with precision, distinguishing fine shades of meaning even in complex situations.', 'Vous comprenez pratiquement tout ce que vous lisez ou entendez, et vous vous exprimez avec précision en distinguant de fines nuances de sens, même dans des situations complexes.'),
    focus: b('At C2, you work on fast and idiomatic speech, literary and academic texts, precise vocabulary and style.', 'Au niveau C2, vous travaillez l’oral rapide et idiomatique, les textes littéraires et savants, le vocabulaire précis et le style.'),
  },
};
