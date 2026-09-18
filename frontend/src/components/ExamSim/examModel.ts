// Shared model for the TCF Canada Expression orale / écrite simulations:
// the report returned by the evaluator, the official scales and a few formatters.

export type Skill = 'eo' | 'ee';
export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ReportCriterion { key: string; label: string; hint?: string; weight?: number; score: number; comment?: string }
export interface ReportError { excerpt: string; correction: string; category: string; explanation: string; start?: number; end?: number }
export interface ReportAdjustment { code: string; label: string; detail: string }
export interface DialogueTurn { role: 'examiner' | 'candidate'; text: string }

export interface TaskReport {
  n: number;
  title: string;
  score: number;
  cefr: Cefr | null;
  words: number;
  evaluated: boolean;
  criteria: ReportCriterion[];
  strengths: string[];
  improvements: string[];
  errors: ReportError[];
  adjustments: ReportAdjustment[];
  stats?: { words?: number; speakingSeconds?: number; recordedSeconds?: number; questions?: number };
  betterVersion?: string | null;
  betterPhrasings?: { said: string; better: string }[];
  questions?: string[];
  integrity?: string | null;
  reliability?: { corrections: number; arbitrated: boolean; spread: number; audio?: boolean };
  prompt?: string | null;
  dialogue?: DialogueTurn[];
}

export interface ExamReport {
  version: number;
  exam: string;
  skill: Skill;
  generatedAt: string;
  late?: boolean;
  global: {
    score: number;
    precise: number;
    cefr: Cefr | null;
    nclc: number | null;
    next: { nclc: number; score: number; missing: number; note: string | null } | null;
    weights: Record<string, number>;
  };
  summary: {
    headline: string;
    text: string;
    priorities: { key: string; label: string; score: number; advice: string }[];
    strengths: { key: string; label: string; score: number }[];
  };
  criteria: { key: string; label: string; score: number }[];
  tasks: TaskReport[];
  reliability: { corrections: number; arbitrated: boolean; audio?: boolean };
}

// France Éducation International — TCF, épreuves d'expression (sur 20).
export const CEFR_BANDS: { level: Cefr; min: number; max: number; label: string }[] = [
  { level: 'A1', min: 1, max: 3, label: 'Découverte' },
  { level: 'A2', min: 4, max: 5, label: 'Survie' },
  { level: 'B1', min: 6, max: 9, label: 'Seuil' },
  { level: 'B2', min: 10, max: 13, label: 'Avancé' },
  { level: 'C1', min: 14, max: 15, label: 'Autonome' },
  { level: 'C2', min: 16, max: 20, label: 'Maîtrise' },
];

// IRCC — TCF Canada, expression orale et écrite → NCLC.
export const NCLC_BANDS = [
  { nclc: 4, min: 4, max: 5 },
  { nclc: 5, min: 6, max: 6 },
  { nclc: 6, min: 7, max: 9 },
  { nclc: 7, min: 10, max: 11 },
  { nclc: 8, min: 12, max: 13 },
  { nclc: 9, min: 14, max: 15 },
  { nclc: 10, min: 16, max: 20 },
];

export const MILESTONES: Record<number, string> = {
  4: 'Citoyenneté canadienne (oral)',
  5: 'Nombreux programmes provinciaux',
  7: 'Entrée express — travailleurs qualifiés et points bonus français',
  9: 'Points de langue maximisés dans Entrée express',
};

export const cefrOf = (score: number): Cefr | null => {
  const s = Math.round(score);
  return s <= 0 ? null : (CEFR_BANDS.find(b => s >= b.min && s <= b.max)?.level ?? 'C2');
};
export const nclcOf = (score: number): number | null => NCLC_BANDS.find(b => Math.round(score) >= b.min && Math.round(score) <= b.max)?.nclc ?? null;

/** Band colour class for a score on 20 (used by bars and badges). */
export const toneOf = (score: number | null | undefined) => {
  if (score == null) return 'is-none';
  if (score >= 14) return 'is-top';
  if (score >= 10) return 'is-good';
  if (score >= 6) return 'is-mid';
  return 'is-low';
};

export const fr = (n: number | null | undefined, digits = 1) =>
  n == null || !Number.isFinite(Number(n)) ? '—' : Number(n).toLocaleString('fr-FR', { maximumFractionDigits: digits });

export const clock = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const countWords = (text: string) => (text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);

export const ERROR_LABEL: Record<string, string> = {
  grammaire: 'Grammaire', conjugaison: 'Conjugaison', accord: 'Accord', syntaxe: 'Syntaxe', lexique: 'Lexique',
  orthographe: 'Orthographe', ponctuation: 'Ponctuation', registre: 'Registre', prononciation: 'Prononciation',
};

/** Reads a JSON error message from a fetch Response without throwing. */
export async function errorText(res: Response, fallback: string) {
  const data = await res.json().catch(() => ({}));
  return (data && (data.message || data.error)) || fallback;
}
