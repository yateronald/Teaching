// Lightweight unified search index across ALL free learning items:
// 75 Courses, 186 Dictations, 50 Dialogues, 70 Ear Labs, 50 Audio Docs,
// 41 Audio Texts, 10 Reading Missions, 5 Daily Games, and 1 Placement Test.
import { CATEGORIES } from '../categories';
import { COURSES, coursePath } from '../catalog';
import { GAMES, gamePath } from '../games/meta';
import { placementPath } from '../paths';
import { TEXTS, textPath } from '../practice/meta';
import { MISSIONS, missionPath } from '../practice/missions';
import { DIALOGUES, dialoguePath } from '../practice/dialogues/meta';
import { EAR, earPath } from '../practice/ear/meta';
import { LISTENING, exercisePath } from '../practice/listening/catalog';
import { DICTATIONS, dictationCoursePath } from '../practice/dictation/catalog';
import { tx, type Lang, type Level } from '../types';

export type SearchKind = 'course' | 'dictation' | 'listening' | 'reading' | 'game';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  sublabel: string;
  title: string;
  subtitle: string;
  levelLabel: string;
  levels: Level[];
  to: string;
  haystack: string;
}

export const OPEN_SEARCH_EVENT = 'lfwn-open-academy-search';

/** Open the Global Academy Search modal from anywhere in the learning space. */
export function openAcademySearch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
  }
}

export const foldSearch = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'");

const cache: Partial<Record<Lang, SearchEntry[]>> = {};

export function getSearchIndex(lang: Lang): SearchEntry[] {
  if (cache[lang]) return cache[lang]!;
  const fr = lang === 'fr';
  const catNames = new Map(CATEGORIES.map(c => [c.id, tx(c.name, lang)]));
  const out: SearchEntry[] = [];

  // 1. Placement test
  out.push({
    id: 'placement-test',
    kind: 'course',
    sublabel: fr ? 'Test de niveau · 10 min' : 'Level test · 10 min',
    title: fr ? 'Test de niveau CECR adaptatif (A1–C1)' : 'Adaptive CEFR French Level Test (A1–C1)',
    subtitle: fr
      ? 'Évaluez votre compréhension orale, écrite et grammaire pour démarrer au bon niveau.'
      : 'Check listening, reading and grammar in 10 minutes to unlock your exact starting level.',
    levelLabel: 'A1–C1',
    levels: ['A1', 'A2', 'B1', 'B2', 'C1'],
    to: placementPath(lang),
    haystack: foldSearch('test niveau placement level cefr cecr a1 a2 b1 b2 c1 clb nclc'),
  });

  // 2. 75 Courses
  for (const c of COURSES) {
    const title = tx(c.title, lang);
    const subtitle = tx(c.subtitle, lang);
    const cat = catNames.get(c.category) ?? '';
    out.push({
      id: `course-${c.id}`,
      kind: 'course',
      sublabel: cat,
      title,
      subtitle,
      levelLabel: c.level,
      levels: c.levels,
      to: coursePath(c, lang),
      haystack: foldSearch(`${title} ${subtitle} ${cat} ${c.level} ${c.id}`),
    });
  }

  // 3. 186 Dictations
  for (const d of DICTATIONS) {
    const subtitle = tx(d.subtitle, lang);
    const theme = tx(d.theme, lang);
    const method = d.method ?? 'story';
    out.push({
      id: `dictation-${d.id}`,
      kind: 'dictation',
      sublabel: fr ? `Dictée · ${theme}` : `Dictation · ${theme}`,
      title: d.title,
      subtitle,
      levelLabel: d.level,
      levels: [d.level],
      to: dictationCoursePath(d, lang),
      haystack: foldSearch(`${d.title} ${subtitle} ${theme} dictee dictation ${method} ${d.level} ${d.focus.map(f => tx(f, lang)).join(' ')}`),
    });
  }

  // 4. 50 Dialogues
  for (const d of DIALOGUES) {
    const subtitle = tx(d.summary, lang);
    out.push({
      id: `dialogue-${d.id}`,
      kind: 'listening',
      sublabel: fr ? 'Dialogue · 2 voix' : 'Dialogue · 2 voices',
      title: d.title,
      subtitle,
      levelLabel: d.level,
      levels: [d.level],
      to: dialoguePath(d, lang),
      haystack: foldSearch(`${d.title} ${subtitle} dialogue ecoute listening ${d.theme} ${d.level}`),
    });
  }

  // 5. 70 Ear Training Labs
  for (const e of EAR) {
    const subtitle = tx(e.summary, lang);
    const tag = tx(e.tag, lang);
    out.push({
      id: `ear-${e.id}`,
      kind: 'listening',
      sublabel: fr ? `Oreille · ${tag}` : `Ear lab · ${tag}`,
      title: e.title,
      subtitle,
      levelLabel: e.level,
      levels: [e.level],
      to: earPath(e, lang),
      haystack: foldSearch(`${e.title} ${subtitle} ${tag} ${e.sample} oreille ear listening ${e.level}`),
    });
  }

  // 6. 50 Listening Documents
  for (const l of LISTENING) {
    const subtitle = tx(l.summary, lang);
    const format = tx(l.format, lang);
    out.push({
      id: `doc-${l.id}`,
      kind: 'listening',
      sublabel: format,
      title: l.title,
      subtitle,
      levelLabel: l.level,
      levels: [l.level],
      to: exercisePath(l, lang),
      haystack: foldSearch(`${l.title} ${subtitle} ${format} audio ecoute listening ${l.level}`),
    });
  }

  // 7. 41 Reading Texts
  for (const t of TEXTS) {
    const subtitle = tx(t.subtitle, lang);
    out.push({
      id: `text-${t.id}`,
      kind: 'reading',
      sublabel: fr ? 'Texte audio' : 'Audio text',
      title: t.title,
      subtitle,
      levelLabel: t.level,
      levels: [t.level],
      to: textPath(t, lang),
      haystack: foldSearch(`${t.title} ${subtitle} lecture reading texte text ${t.level}`),
    });
  }

  // 8. 10 Reading Missions
  for (const m of MISSIONS) {
    const title = tx(m.title, lang);
    const subtitle = tx(m.summary, lang);
    out.push({
      id: `mission-${m.id}`,
      kind: 'reading',
      sublabel: fr ? 'Mission guidée' : 'Reading mission',
      title,
      subtitle,
      levelLabel: m.level,
      levels: [m.level],
      to: missionPath(m, lang),
      haystack: foldSearch(`${title} ${subtitle} mission lecture reading ${m.level}`),
    });
  }

  // 9. 5 Daily Games
  for (const g of GAMES) {
    const title = tx(g.title, lang);
    const subtitle = tx(g.tagline, lang);
    out.push({
      id: `game-${g.id}`,
      kind: 'game',
      sublabel: fr ? 'Jeu · 3 min' : 'Game · 3 min',
      title,
      subtitle,
      levelLabel: g.level,
      levels: ['A1', 'A2', 'B1', 'B2'],
      to: gamePath(g, lang),
      haystack: foldSearch(`${title} ${subtitle} jeu game ${g.id}`),
    });
  }

  cache[lang] = out;
  return out;
}
