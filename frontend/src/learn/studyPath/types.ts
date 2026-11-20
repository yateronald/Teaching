// Core types for the Guided Study-Path Platform (Architecture #2).
import type { Level, T } from '../types';

export type StudyGoalId = 'complete' | 'exams' | 'diploma' | 'fluency';

export type StudyStepKind = 'course' | 'listen' | 'read' | 'write' | 'game' | 'checkpoint';

export type StudyStepSource =
  | { type: 'course'; id: string; lessonCount: number }
  | { type: 'ladder'; id: string; level: Level }
  | { type: 'dialogue'; id: string }
  | { type: 'ear'; id: string }
  | { type: 'doc'; id: string }
  | { type: 'text'; id: string }
  | { type: 'mission'; id: string }
  | { type: 'dictation'; id: string }
  | { type: 'game'; id: string }
  | { type: 'placement' };

export interface StudyStep {
  id: string;
  kind: StudyStepKind;
  source: StudyStepSource;
  title: string;
  subtitle: string;
  badge: string;
  level: Level;
  minutes: number;
  to: string;
  autostart?: boolean;
}

export interface StudyModule {
  index: number;
  id: string;
  title: string;
  theme: string;
  steps: StudyStep[];
  minutes: number;
}

export interface StudyPlan {
  goal: StudyGoalId;
  level: Level;
  nextLevel?: Level;
  modules: StudyModule[];
  checkpoint: StudyStep;
  dailyGame: StudyStep;
  totalSteps: number;
  totalMinutes: number;
}

export interface SavedStudyPath {
  goal: StudyGoalId;
  level: Level;
  /** True once the learner explicitly chose a goal/level or finished the placement test. */
  picked: boolean;
  updatedAt: number;
}

export interface GoalMeta {
  id: StudyGoalId;
  badge: T;
  title: T;
  shortTitle: T;
  subtitle: T;
  image: string;
}

export interface StepCompletion {
  done: boolean;
  started: boolean;
  /** Optional concise badge such as "1/3" or "18/20". */
  detail?: string;
}
