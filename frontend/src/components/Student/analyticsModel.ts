import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const LEVEL_NAMES = ['Débutant', 'Élémentaire', 'Intermédiaire', 'Avancé', 'Autonome', 'Maîtrise'];
export const CRITERIA = [['coherence', 'Cohérence'], ['vocabulary', 'Vocabulaire'], ['grammar', 'Grammaire'], ['fluency', 'Fluidité'], ['task_completion', 'Respect de la consigne']];
export const cefrFromPoints = (score: number) => LEVELS[Math.min(5, Math.max(0, Math.floor(Number(score) / 100) - 1))];
export const percent = (value: number, total: number) => total > 0 ? Math.min(100, Math.max(0, Math.round(Number(value) / Number(total) * 100))) : 0;
export const scoreText = (value: number | null | undefined, digits = 1) => value == null || !Number.isFinite(Number(value)) ? '—' : Number(value).toFixed(digits);
export const dateText = (date?: string | null) => date && Number.isFinite(Date.parse(date)) ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date indisponible';
export const durationText = (seconds?: number | null) => {
  if (seconds == null) return '—';
  const s = Math.max(0, Math.round(Number(seconds)));
  return s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor(s % 3600 / 60)} min` : `${Math.floor(s / 60)} min ${s % 60} s`;
};

/** Ignore stale responses when the panel closes or changes scope. */
export function useAnalyticsResource<T>(url: string | null) {
  const { apiCall } = useAuth();
  const [result, setResult] = useState<{ url: string | null; data: T | null; loading: boolean; error: string | null }>({ url: null, data: null, loading: true, error: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!url) return;
    let active = true;
    setResult({ url, data: null, loading: true, error: null });
    (async () => {
      try {
        const response = await apiCall(url);
        if (!response.ok) throw new Error('Results unavailable');
        const data: T = await response.json();
        if (active) setResult({ url, data, loading: false, error: null });
      } catch {
        if (active) setResult({ url, data: null, loading: false, error: 'Impossible de charger les résultats. Réessayez dans un instant.' });
      }
    })();
    return () => { active = false; };
  }, [url, apiCall, revision]);
  return { data: result.url === url ? result.data : null, loading: result.url !== url || result.loading, error: result.url === url ? result.error : null, retry: () => setRevision(v => v + 1) };
}


