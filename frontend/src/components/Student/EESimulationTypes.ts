// Shared types for EE Simulation
export interface Tache {
  id: number;
  task_number: number;
  task_type: string;
  task_type_label: string;
  prompt_text: string;
  question_text?: string | null;
  argument_text_1?: string | null;
  argument_text_2?: string | null;
  min_words: number;
  max_words: number;
  duration_minutes: number;
}

export interface SimData {
  combinaison: { id: number; name: string; month_name: string; year: number };
  taches: Tache[];
  total_duration_minutes: number;
  attempt_count: number;
}

export interface TaskResult {
  task_number: number;
  task_type: string;
  task_type_label: string;
  prompt_text: string;
  question_text?: string | null;
  argument_text_1?: string | null;
  argument_text_2?: string | null;
  min_words: number;
  max_words: number;
  student_answer: string;
  score: number;
  level: string;
  positives: string[];
  improvements: string[];
  correction_text?: string | null;
}

export interface SimResult {
  id: number;
  status: string;
  combinaison: { id: number; name: string; month_name: string; year: number };
  started_at: string;
  submitted_at: string;
  time_used_seconds: number;
  average_score: number;
  overall_level: string;
  tasks: TaskResult[];
}

export const SPECIAL_CHARS = [
  'è','é','ê','ë','à','â','ù','û','ü','ç','ô','î','ï','œ','æ','«','»','—','…'
];

export const LEVEL_COLORS: Record<string,string> = {
  A1:'#10b981', A2:'#22d3ee', B1:'#a78bfa', B2:'#f472b6', C1:'#fb923c', C2:'#ef4444'
};

export const TASK_ICONS: Record<string,string> = {
  message_court: '✉️', narration: '📖', argumentation: '⚖️'
};

export const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
};

export const countWords = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
