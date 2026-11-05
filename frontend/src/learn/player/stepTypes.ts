import type { Lang } from '../types';

export interface Result {
  correct: boolean;
  /** The right answer, shown when the learner got it wrong. */
  answer?: string;
  explain?: string;
  /** Right, with a remark (missing accents). */
  warning?: string;
}

export interface StepHandle {
  /** null while there is nothing to check yet. */
  check(): Result | null;
}

export interface StepProps<S> {
  step: S;
  lang: Lang;
  /** True once checked: the activity shows the corrected state. */
  locked: boolean;
  /** For deterministic shuffles. */
  seed: string;
  /** Whether the main button can be used. */
  onReady(ready: boolean): void;
  /** Activities that grade themselves (match, picture, dialogue) report their score, 0 to 1. */
  onScore?(fraction: number): void;
  /** Opens the demo form (writing, speaking upsell). */
  onDemo?(): void;
}

/** check: graded with the Check button · inline: grades itself as you go · self: nothing to grade. */
export type StepMode = 'check' | 'inline' | 'self';
