import { b, type Level, type Voice } from '../types';
import type { ReadingMission } from './missions';

type Copy = [fr: string, en: string];
type DraftDocument = {
  kind: ReadingMission['documents'][number]['kind'];
  voice: Voice;
  label: Copy;
  detail: Copy;
  title: string;
  lines: string[];
  line: number;
  highlight: string;
  question: Copy;
  hint: Copy;
  retry: Copy;
  clue: Copy;
  value: string;
  messagePart: string;
  takeaway: Copy;
};

export type MissionDraft = {
  id: string;
  minutes: number;
  title: Copy;
  summary: Copy;
  brief: Copy;
  recipient: string;
  outcome: [title: Copy, action: Copy];
  tip: Copy;
  documents: DraftDocument[];
};

const copy = ([fr, en]: Copy) => b(en, fr);

export function makeMission(level: Level, d: MissionDraft): ReadingMission {
  return {
    id: d.id, level, minutes: d.minutes, title: copy(d.title), summary: copy(d.summary),
    brief: copy(d.brief), recipient: d.recipient, tip: copy(d.tip),
    outcome: { title: copy(d.outcome[0]), action: copy(d.outcome[1]) },
    documents: d.documents.map((x, i) => ({
      id: `${d.id}-${i + 1}`, kind: x.kind, voice: x.voice, label: copy(x.label),
      labelDetail: copy(x.detail), title: x.title, lines: x.lines, takeaway: copy(x.takeaway),
      clue: { line: x.line, highlight: x.highlight, question: copy(x.question), hint: copy(x.hint),
        retry: copy(x.retry), label: copy(x.clue), value: x.value, messagePart: x.messagePart },
    })),
  };
}
