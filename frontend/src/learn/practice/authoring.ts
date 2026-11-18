import { b } from '../types';
import type { ReadingQuestion, ReadingText, QuestionSkill, Sentence } from './types';

type Question = [skill: QuestionSkill, answer: number, fr: string, en: string, options: string[], evidence: string | string[], explanationFr: string, explanationEn: string];
type Gloss = [phrase: string, fr: string, en: string];

/** Keeps the editorial files readable while preserving the typed reader contract. */
export function reading(
  id: string,
  warmup: [fr: string, en: string],
  paragraphs: Sentence[][],
  glossary: Gloss[],
  questions: Question[],
  focus: { fr: [title: string, body: string]; en: [title: string, body: string]; examples: Sentence[] },
  email?: ReadingText['email'],
): ReadingText {
  return {
    id,
    email,
    warmup: b(warmup[1], warmup[0]),
    paras: paragraphs.map(s => ({ s })),
    glossary: glossary.map(([fr, meaningFr, meaningEn]) => ({ fr, tr: b(meaningEn, meaningFr) })),
    questions: questions.map(([skill, answer, q, qEn, options, evidence, fr, en]): ReadingQuestion => ({
      skill, answer, q, qEn, options, evidence, explain: b(en, fr),
    })),
    focus: {
      title: b(focus.en[0], focus.fr[0]),
      body: b(focus.en[1], focus.fr[1]),
      examples: focus.examples.map(([fr, tr]) => ({ fr, tr })),
    },
  };
}
