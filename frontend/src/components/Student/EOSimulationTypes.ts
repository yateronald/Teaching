// Shared types for EO (Expression Orale) Simulation

export interface EOSimConfig {
  apiKey: string;
  liveModel: string;
  textModel: string;
  studentName: string;
  firstName: string;
}

export interface EOSimSession {
  simulationId: number;
  studentName: string;
  firstName: string;
  partie: { id: number; name: string; monthName: string; year: number } | null;
  tache1: {
    id: number | null;
    prompt: string;
    durationMinutes: number;
    points: { number: number; title: string; subtitle?: string | null }[];
  };
  tache2: { id: number; prompt: string };
  tache3: { id: number; prompt: string };
}

export interface EOEvaluation {
  tache1_score: number;
  tache2_score: number;
  tache3_score: number;
  overall_score: number;
  tache1_feedback: string;
  tache2_feedback: string;
  tache3_feedback: string;
  overall_feedback: string;
  criteria_scores: {
    coherence: number;
    vocabulary: number;
    grammar: number;
    fluency: number;
    task_completion: number;
  };
}

export interface EOSimHistoryItem {
  id: number;
  overall_score: number | null;
  tache1_score: number | null;
  tache2_score: number | null;
  tache3_score: number | null;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  criteria_scores: Record<string, number> | null;
}

export type SimulationPhase =
  | 'briefing'        // Initial info screen
  | 'greeting'        // AI greets the student
  | 'tache1-intro'    // Showing tâche 1 prompt
  | 'tache1-speaking' // AI is speaking the T1 instructions (timer not yet started)
  | 'tache1-active'   // Tâche 1 monologue (live voice, timer running)
  | 'tache1-end'      // Tâche 1 finished, transition
  | 'tache2-intro'    // Tâche 2 prompt shown
  | 'tache2-speaking' // AI is speaking T2 transition + sujet
  | 'tache2-prep'     // 2-min preparation (silent)
  | 'tache2-prep-end' // AI says "Je vous écoute" before speaking starts
  | 'tache2-active'   // 3:30 speaking
  | 'tache2-end'      // Transition
  | 'tache3-intro'    // Tâche 3 prompt shown
  | 'tache3-speaking' // AI is speaking T3 transition + sujet
  | 'tache3-active'   // 4:30 speaking
  | 'tache3-end'      // Transition
  | 'evaluating'      // Generating score
  | 'results'         // Showing final score and feedback
  | 'error';

export const PHASE_LABELS: Record<SimulationPhase, string> = {
  'briefing': 'Préparation',
  'greeting': 'Accueil',
  'tache1-intro': 'Tâche 1 - Introduction',
  'tache1-speaking': 'Tâche 1 - Consignes',
  'tache1-active': 'Tâche 1 - Présentation personnelle',
  'tache1-end': 'Tâche 1 terminée',
  'tache2-intro': 'Tâche 2 - Sujet',
  'tache2-speaking': 'Tâche 2 - Consignes',
  'tache2-prep': 'Tâche 2 - Préparation',
  'tache2-prep-end': 'Tâche 2 - Démarrage',
  'tache2-active': 'Tâche 2 - Interaction',
  'tache2-end': 'Tâche 2 terminée',
  'tache3-intro': 'Tâche 3 - Sujet',
  'tache3-speaking': 'Tâche 3 - Consignes',
  'tache3-active': 'Tâche 3 - Argumentation',
  'tache3-end': 'Tâche 3 terminée',
  'evaluating': 'Évaluation',
  'results': 'Résultats',
  'error': 'Erreur',
};

// Tâche durations (seconds)
export const TACHE_DURATIONS = {
  tache1: 120,        // 2 min
  tache2_prep: 120,   // 2 min preparation
  tache2_speak: 210,  // 3 min 30s
  tache3_speak: 270,  // 4 min 30s
};

export function formatTime(seconds: number): string {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
