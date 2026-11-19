// The five skills of the practice space as the learner sees them: what each
// one trains, how many exercises it has, its levels and where it leads. Shared
// by the practice home (/learn/practice/) and its block on the free-courses home.
import type { ReactNode } from 'react';
import { ApartmentOutlined, BookOutlined, CustomerServiceOutlined, EditOutlined, ReadOutlined } from '@ant-design/icons';
import { LEVELS, tx, type Lang, type Level } from '../types';
import { P } from './copy';
import { SKILLS, TEXTS, skillPath } from './meta';
import { MISSIONS } from './missions';
import { LISTENING } from './listening/catalog';
import { EAR } from './ear/meta';
import { DIALOGUES } from './dialogues/meta';
import type { SkillId } from './types';

export interface SkillOverview {
  id: SkillId;
  name: string;
  line: string;
  desc: string;
  /** Picture key (public/learn/img). */
  image: string;
  icon: ReactNode;
  ready: boolean;
  /** Open skills only. */
  path?: string;
  count?: string;
  levels?: string;
}

const IMAGE: Record<SkillId, string> = {
  reading: 'cat-reading', listening: 'cat-listening', dictation: 'cat-spelling', grammar: 'cat-grammar', vocabulary: 'cat-beginner',
};
const ICON: Record<SkillId, ReactNode> = {
  reading: <ReadOutlined />, listening: <CustomerServiceOutlined />, dictation: <EditOutlined />, grammar: <ApartmentOutlined />, vocabulary: <BookOutlined />,
};

/** The lowest and highest level among some exercises, in CEFR order. */
function span(levels: Level[]): [Level, Level] | null {
  const present = LEVELS.filter(l => levels.includes(l));
  return present.length ? [present[0], present[present.length - 1]] : null;
}

export function skillOverview(lang: Lang): SkillOverview[] {
  const c = P[lang].practice;
  return SKILLS.map(s => {
    const base = { id: s.id, name: tx(s.name, lang), ...c.skill[s.id], image: IMAGE[s.id], icon: ICON[s.id], ready: s.ready };
    const at = (levels: Level[]) => { const x = span(levels); return x ? c.levels(x[0], x[1]) : undefined; };
    if (!s.ready) return { ...base, count: undefined };
    if (s.id === 'reading') {
      return { ...base, path: skillPath(s, lang), count: c.skill.reading.count(TEXTS.length, MISSIONS.length), levels: at([...TEXTS.map(t => t.level), ...MISSIONS.map(m => m.level)]) };
    }
    if (s.id === 'listening') {
      return { ...base, path: skillPath(s, lang), count: c.skill.listening.count(LISTENING.length, DIALOGUES.length, EAR.length), levels: at([...LISTENING.map(e => e.level), ...DIALOGUES.map(d => d.level), ...EAR.map(e => e.level)]) };
    }
    return { ...base, path: skillPath(s, lang), count: undefined };
  });
}
