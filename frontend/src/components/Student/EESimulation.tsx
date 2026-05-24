import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Spin, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { SimData, SimResult } from './EESimulationTypes';
import { SPECIAL_CHARS, LEVEL_COLORS, TASK_ICONS, fmtTime, countWords } from './EESimulationTypes';

type View = 'loading' | 'overview' | 'exam' | 'submitting' | 'results';

const CSS_STYLES = `
.sim-exam-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
  overflow: hidden;
  position: relative;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.sim-exam-wrapper {
  display: grid;
  grid-template-columns: 230px 1fr 220px;
  flex: 1;
  min-height: 0;
  width: 100%;
  transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sim-keyboard-collapsed .sim-exam-wrapper {
  grid-template-columns: 230px 1fr 0px;
}

/* Custom scrollbar */
.sim-task-sidebar::-webkit-scrollbar,
.sim-editor-area::-webkit-scrollbar,
.sim-prompt-scroll::-webkit-scrollbar {
  width: 5px;
}
.sim-task-sidebar::-webkit-scrollbar-track,
.sim-editor-area::-webkit-scrollbar-track,
.sim-prompt-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.sim-task-sidebar::-webkit-scrollbar-thumb,
.sim-editor-area::-webkit-scrollbar-thumb,
.sim-prompt-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.sim-task-sidebar::-webkit-scrollbar-thumb:hover,
.sim-editor-area::-webkit-scrollbar-thumb:hover,
.sim-prompt-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.sim-task-sidebar {
  background: linear-gradient(180deg, #fafbfc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  padding: 16px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sim-task-sidebar-item {
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e8ecf1;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.sim-task-sidebar-item:hover {
  border-color: #c7d2df;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.sim-task-sidebar-item.active {
  background: linear-gradient(135deg, #eff6ff, #e8f0fe);
  border-color: #93c5fd;
  box-shadow: 0 2px 10px rgba(59,130,246,0.12);
}

.sim-task-sidebar-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
}

.sim-task-sidebar-warning {
  margin-top: auto;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fff5f5, #fef2f2);
  border-radius: 10px;
  border: 1px solid #fecaca;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sim-editor-area {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
  overflow-y: auto;
  background: #f5f7fa;
}

.sim-editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 28px;
  max-width: 880px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;
  box-sizing: border-box;
  gap: 12px;
}

.sim-keyboard-panel {
  background: linear-gradient(180deg, #fafbfc 0%, #f1f5f9 100%);
  border-left: 1px solid #e2e8f0;
  padding: 20px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
  visibility: visible;
}

.sim-keyboard-panel.collapsed {
  padding: 20px 0;
  border-left: none;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  overflow: hidden;
}

.sim-inline-keyboard {
  display: none;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  background: #f1f5f9;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  justify-content: center;
  align-items: center;
}

.sim-inline-key {
  height: 32px;
  width: 32px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  font-family: monospace;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 0 #cbd5e1;
  transition: all 0.1s;
}

.sim-inline-key:active {
  transform: translateY(2px);
  box-shadow: none;
}

.sim-keyboard-collapsed .sim-inline-keyboard {
  display: flex;
}

@media (max-width: 1200px) {
  .sim-keyboard-panel {
    display: none !important;
  }
  .sim-inline-keyboard {
    display: flex;
  }
  .sim-exam-wrapper {
    grid-template-columns: 230px 1fr 0px !important;
  }
}

@media (max-width: 992px) {
  .sim-exam-wrapper {
    grid-template-columns: 1fr !important;
    grid-template-rows: auto 1fr;
    overflow-y: auto;
  }
  .sim-task-sidebar {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px 12px;
    height: auto;
    align-items: center;
    gap: 8px;
  }
  .sim-task-sidebar-item {
    min-width: 160px;
    padding: 8px 12px;
    flex-shrink: 0;
  }
  .sim-task-sidebar-warning {
    display: none !important;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideDown {
  from { transform: translate(-50%, -20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const EESimulation: React.FC<{ combinaisonId: number; open: boolean; onClose: () => void; onCreditConsumed?: () => void; onOutOfCredits?: () => void }> = ({ combinaisonId, open, onClose, onCreditConsumed, onOutOfCredits }) => {
  const { apiCall } = useAuth();
  const [view, setView] = useState<View>('loading');
  const [simData, setSimData] = useState<SimData | null>(null);
  const [simId, setSimId] = useState<number | null>(null);
  const [result, setResult] = useState<SimResult | null>(null);
  const [activeTask, setActiveTask] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showRef, setShowRef] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState<number | null>(null);
  const [hideInstructions, setHideInstructions] = useState(false);
  const timerRef = useRef<any>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([null, null, null]);
  const startTimeRef = useRef<number>(0);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const securityTimerRef = useRef<any>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(window.innerWidth >= 1200);

  const showSecurityWarning = (msg: string) => {
    setSecurityWarning(msg);
    if (securityTimerRef.current) clearTimeout(securityTimerRef.current);
    securityTimerRef.current = setTimeout(() => setSecurityWarning(null), 3000);
  };

  // Load combinaison data
  useEffect(() => {
    (async () => {
      try {
        const r = await apiCall(`/tcf/ee/simulation/combinaison/${combinaisonId}`);
        if (r.ok) { const d = await r.json(); setSimData(d); setTimeLeft(d.total_duration_minutes * 60); setView('overview'); }
        else { message.error('Failed to load'); onClose(); }
      } catch { message.error('Error'); onClose(); }
    })();
  }, [combinaisonId, apiCall, onClose]);

  // Timer
  useEffect(() => {
    if (view !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setIsTimeUp(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view]);

  const handleStart = async () => {
    if (!simData) return;
    try {
      const r = await apiCall('/tcf/ee/simulation/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ combinaison_id: combinaisonId, total_duration_seconds: simData.total_duration_minutes * 60 }) });
      if (r.status === 402) {
        // Out of credits — close this simulation modal and let the parent
        // surface the premium OutOfCreditsModal. Fallback to a basic warning
        // if no parent handler was provided.
        await r.json().catch(() => ({}));
        onClose();
        if (onOutOfCredits) {
          // Defer slightly so the simulation modal closes first, avoiding
          // overlapping modal animations.
          setTimeout(() => onOutOfCredits(), 80);
        } else {
          message.warning('You are out of Expression Écrite credits. Please contact your administrator.');
        }
        return;
      }
      if (r.ok) {
        const d = await r.json();
        setSimId(d.simulation_id);
        startTimeRef.current = Date.now();
        setView('exam');
        // Notify parent so the credit balance UI refreshes (resume does NOT consume,
        // but the server may have just consumed a credit for a brand-new simulation).
        if (!d.resumed) onCreditConsumed?.();
      } else {
        message.error('Failed to start');
      }
    } catch { message.error('Error starting'); }
  };

  const handleSubmit = useCallback(async () => {
    if (!simId) return;
    clearInterval(timerRef.current);

    // Close modal implicitly by resolving, then do work
    setTimeout(async () => {
      setView('submitting');
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload = { answers: answers.map((a, i) => ({ task_number: i + 1, answer: a })), time_used_seconds: elapsed };
      try {
        const r = await apiCall(`/tcf/ee/simulation/${simId}/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (r.ok) {
          const rr = await apiCall(`/tcf/ee/simulation/${simId}/result`);
          if (rr.ok) { setResult(await rr.json()); setView('results'); }
          else { message.error('Failed to load results'); setView('overview'); }
        } else { const e = await r.json().catch(() => ({})); message.error(e.error || 'Submit failed'); setView('exam'); }
      } catch { message.error('Submit error'); setView('exam'); }
    }, 10);
  }, [simId, answers, apiCall]);

  // Time up modal — must be after handleSubmit declaration
  useEffect(() => {
    if (isTimeUp && view === 'exam') {
      Modal.confirm({
        title: 'Le temps est écoulé !',
        content: 'Le temps alloué pour cet examen est terminé. Voulez-vous soumettre vos réponses pour correction par l\'IA, ou quitter l\'examen sans sauvegarder ?',
        okText: 'Soumettre',
        cancelText: 'Quitter sans sauvegarder',
        cancelButtonProps: { danger: true },
        okType: 'primary',
        centered: true,
        onOk: () => {
          setIsTimeUp(false);
          handleSubmit();
        },
        onCancel: () => {
          setIsTimeUp(false);
          onClose();
        }
      });
    }
  }, [isTimeUp, view, handleSubmit, onClose]);

  const insertChar = (ch: string) => {
    const ta = textareaRefs.current[activeTask];
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, val = answers[activeTask];
    const wc = countWords(val);
    const tache = simData?.taches[activeTask];
    if (tache && wc >= tache.max_words && ch === ' ') return;
    const nv = val.substring(0, s) + ch + val.substring(e);
    const na = [...answers]; na[activeTask] = nv; setAnswers(na);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + ch.length; ta.focus(); }, 0);
  };

  const handleTextChange = (idx: number, val: string) => {
    const tache = simData?.taches[idx];
    if (tache) {
      const wc = countWords(val);
      if (wc > tache.max_words) {
        const words = val.trim().split(/\s+/).slice(0, tache.max_words);
        val = words.join(' ');
      }
    }
    const na = [...answers]; na[idx] = val; setAnswers(na);
  };

  const renderContent = () => {
    // ── LOADING ──
    if (view === 'loading') return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: 16 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#f43f5e' }} spin />} />
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading simulation...</div>
      </div>
    );

    // ── SUBMITTING ──
    if (view === 'submitting') return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', gap: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg,#f43f5e,#e11d48)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#fff' }} spin />} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: 0 }}>Correction en cours...</h2>
        <p style={{ color: '#64748b', fontSize: 13, maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
          L'IA analyse vos réponses selon les critères TCF : grammaire, vocabulaire, structure et respect des consignes. Cela peut prendre quelques secondes.
        </p>
      </div>
    );

    // ── RESULTS ──
    if (view === 'results' && result) return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
        {/* Summary */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)', borderRadius: 24, padding: '36px 40px', marginBottom: 32, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(49,46,129,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(244,63,94,0.15)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: 100, width: 150, height: 150, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(30px)' }} />

          <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#f472b6', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Résultats — Expression Écrite</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>{result.combinaison.name}</h2>
          </div>

          <div style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{result.average_score}<span style={{ fontSize: 16, opacity: 0.5, fontWeight: 700 }}>/20</span></div>
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>Score moyen</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 24px', textAlign: 'center', minWidth: 110 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: LEVEL_COLORS[result.overall_level] || '#fff', lineHeight: 1 }}>{result.overall_level}</div>
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>Niveau CECRL</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{fmtTime(result.time_used_seconds || 0)}</div>
              <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>Temps utilisé</div>
            </div>
          </div>
        </div>
        {/* Per-task results */}
        {result.tasks.map(t => (
          <div key={t.task_number} style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '32px', marginBottom: 24, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', position: 'relative' }}>
            {/* Subtle accent bar */}
            <div style={{ position: 'absolute', left: 0, top: 32, bottom: 32, width: 4, background: LEVEL_COLORS[t.level] || '#e2e8f0', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingLeft: 12 }}>
              <div style={{ flex: 1, paddingRight: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Tâche {t.task_number} : {t.task_type_label}</div>
                {t.question_text && (
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', marginTop: 8 }}>📌 {t.question_text}</div>
                )}
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>{t.prompt_text}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ef4444', letterSpacing: '-0.03em', lineHeight: 1 }}>{t.score}<span style={{ fontSize: 16, fontWeight: 700, color: '#fca5a5' }}>/20</span></div>
                <span style={{ padding: '4px 10px', borderRadius: 100, border: '1.5px solid', fontSize: 12, fontWeight: 800, borderColor: LEVEL_COLORS[t.level] || '#e2e8f0', color: LEVEL_COLORS[t.level] || '#64748b', background: LEVEL_COLORS[t.level] ? `${LEVEL_COLORS[t.level]}10` : 'transparent' }}>{t.level}</span>
              </div>
            </div>

            {/* Positives and Improvements Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24, paddingLeft: 12 }}>
              {/* Positives Card */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Points positifs
                </div>
                {t.positives.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 22, color: '#15803d', fontSize: 13, lineHeight: 1.6 }}>
                    {t.positives.map((p, i) => <li key={i} style={{ marginBottom: 8 }}>{p}</li>)}
                  </ul>
                ) : (
                  <div style={{ color: '#16a34a', fontSize: 13, fontStyle: 'italic', opacity: 0.8 }}>Aucun point positif identifié</div>
                )}
              </div>

              {/* Improvements Card */}
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  Axes d'amélioration
                </div>
                {t.improvements.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: 22, color: '#b45309', fontSize: 13, lineHeight: 1.6 }}>
                    {t.improvements.map((p, i) => <li key={i} style={{ marginBottom: 8 }}>{p}</li>)}
                  </ul>
                ) : (
                  <div style={{ color: '#d97706', fontSize: 13, fontStyle: 'italic', opacity: 0.8 }}>Aucun axe d'amélioration</div>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, paddingLeft: 12 }}>
              {/* Student Answer Toggle */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div
                  onClick={() => setShowAnswer(showAnswer === t.task_number ? null : t.task_number)}
                  style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: '#475569', fontWeight: 700, transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Voir votre réponse <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.5, marginLeft: 6 }}>({countWords(t.student_answer)} mots)</span>
                  </div>
                  <svg style={{ transform: `rotate(${showAnswer === t.task_number ? '180deg' : '0deg'})`, transition: 'transform 0.2s' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                {showAnswer === t.task_number && (
                  <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: 14, color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
                    {t.student_answer || <em style={{ color: '#94a3b8' }}>Aucune réponse soumise</em>}
                  </div>
                )}
              </div>

              {/* Reference Correction Toggle */}
              {t.correction_text && (
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div
                    onClick={() => setShowRef(showRef === t.task_number ? null : t.task_number)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, color: '#3b82f6', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                      Voir la correction proposée
                    </div>
                    <svg style={{ transform: `rotate(${showRef === t.task_number ? '180deg' : '0deg'})`, transition: 'transform 0.2s' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                  {showRef === t.task_number && (
                    <div style={{ padding: '20px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', fontSize: 14, color: '#1e3a8a', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontFamily: 'Georgia, serif' }}>
                      {t.correction_text}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );

    // ── OVERVIEW ──
    if (view === 'overview' && simData) {
      const totalMins = simData.total_duration_minutes;
      const t1 = simData.taches.find(t => t.task_number === 1);
      const t2 = simData.taches.find(t => t.task_number === 2);
      const t3 = simData.taches.find(t => t.task_number === 3);

      return (
        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', padding: '32px 24px', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, width: '100%' }}>

            {/* LEFT COLUMN: Tasks and Tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Tasks Summary */}
              <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.04)', padding: '28px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  Durée totale : {totalMins} minutes
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 16, padding: '24px 12px', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>{t1?.task_number || 1}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{t1?.task_type_label?.split(' ')[0] || 'Message'}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>{t1?.min_words}–{t1?.max_words} mots</div>
                  </div>
                  <div style={{ background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: 16, padding: '24px 12px', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#a855f7', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 10px rgba(168,85,247,0.3)' }}>{t2?.task_number || 2}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{t2?.task_type_label?.split(' ')[0] || 'Narration'}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#a855f7' }}>{t2?.min_words}–{t2?.max_words} mots</div>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #dcfce3', borderRadius: 16, padding: '24px 12px', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#22c55e', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 10px rgba(34,197,94,0.3)' }}>{t3?.task_number || 3}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{t3?.task_type_label?.split(' ')[0] || 'Argumentation'}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{t3?.min_words}–{t3?.max_words} mots</div>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div style={{ background: '#fffdf5', border: '1px solid #fde68a', borderRadius: 20, padding: '28px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#b45309', fontSize: 17, fontWeight: 900, marginBottom: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  Conseils de l'examinateur
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#92400e', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Lisez attentivement les consignes et identifiez la situation de communication (à qui écrivez-vous ?).
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#92400e', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Respectez scrupuleusement la fourchette de mots. Des pénalités sévères s'appliquent en cas de non-respect.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#92400e', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Utilisez des connecteurs logiques (surtout pour la tâche 3) pour structurer vos paragraphes.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#92400e', fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Gardez 5 à 10 minutes à la fin pour relire votre production et corriger l'orthographe et la grammaire.
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Action Widget */}
            <div style={{ background: 'linear-gradient(145deg, #f8fafc, #f1f5f9)', border: '1px solid #e2e8f0', borderRadius: 20, padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#1e293b', fontWeight: 800, fontSize: 16, marginBottom: 32 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Tentatives précédentes : <span style={{ color: '#3b82f6', fontSize: 20 }}>{simData.attempt_count}</span>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 32, boxShadow: '0 10px 25px rgba(0,0,0,0.03)', marginBottom: 40 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>TENTATIVE N°</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{simData.attempt_count + 1}</div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>ÉVALUATION</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>IA</div>
                </div>
              </div>

              <button onClick={handleStart} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', borderRadius: 100, padding: '20px 48px', color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', boxShadow: '0 10px 25px rgba(37,99,235,0.3)', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'} onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px)'}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Commencer l'examen
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 4 }}><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef3c7', color: '#b45309', padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 800, marginTop: 24, border: '1px solid #fde68a' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Le chronomètre démarre au clic
              </div>
            </div>

          </div>
        </div>
      );
    }

    // ── EXAM INTERFACE ──
    if (view === 'exam' && simData) {
      const tache = simData.taches[activeTask];
      const wc = countWords(answers[activeTask]);
      const isWarning = timeLeft < 120;

      // Evaluate word count state for dynamic coloring
      let wcColor = '#94a3b8'; // default gray
      let wcBg = '#f1f5f9';
      let wcBorder = '#e2e8f0';
      if (wc > 0 && wc < tache.min_words) {
        wcColor = '#d97706'; // warning orange
        wcBg = '#fffbeb';
        wcBorder = '#fde68a';
      } else if (wc >= tache.min_words && wc <= tache.max_words) {
        wcColor = '#16a34a'; // perfect green
        wcBg = '#f0fdf4';
        wcBorder = '#bbf7d0';
      } else if (wc > tache.max_words) {
        wcColor = '#dc2626'; // over limit red
        wcBg = '#fef2f2';
        wcBorder = '#fecaca';
      }

      return (
        <div className={`sim-exam-container ${isKeyboardVisible ? 'sim-keyboard-expanded' : 'sim-keyboard-collapsed'}`}>
          <style>{CSS_STYLES}</style>
          {/* Security Warning Toast */}
          {securityWarning && (
            <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, boxShadow: '0 8px 30px rgba(220,38,38,0.4)', display: 'flex', alignItems: 'center', gap: 10, animation: 'slideDown 0.3s ease', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
              {securityWarning}
            </div>
          )}
          {/* Top bar with timer */}
          <div style={{ background: isWarning ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.3 }}>Expression Écrite — <span style={{ color: '#93c5fd' }}>{simData.combinaison.name}</span></div>

            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {isWarning && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fca5a5', animation: 'pulse 1.5s infinite' }} />}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: 'monospace', letterSpacing: 1.5 }}>{fmtTime(timeLeft)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => { Modal.confirm({ title: 'Quitter l\'examen ?', content: 'Vos réponses ne seront pas sauvegardées et cette tentative ne sera pas comptabilisée.', okText: 'Quitter', cancelText: 'Annuler', okButtonProps: { danger: true }, onOk: () => onClose() }); }} style={{ padding: '6px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5 }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Quitter
              </button>
              <button onClick={() => { Modal.confirm({ title: 'Terminer l\'examen ?', content: 'Vos réponses seront soumises pour correction par l\'IA. Assurez-vous d\'avoir relu vos textes.', okText: 'Confirmer', cancelText: 'Annuler', okType: 'primary', onOk: () => handleSubmit() }); }} style={{ padding: '6px 16px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.45)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.35)'; }}>
                Terminer l'examen
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>

          <div className="sim-exam-wrapper">
            {/* Left panel — Task nav */}
            <div className="sim-task-sidebar">
              {simData.taches.map((t, i) => {
                const tw = countWords(answers[i]);
                const tp = Math.min(100, (tw / t.max_words) * 100);
                const isActive = activeTask === i;

                let barColor = tw >= t.min_words && tw <= t.max_words ? '#10b981' : tw > t.max_words ? '#ef4444' : '#f59e0b';
                if (tw === 0) barColor = '#cbd5e1';

                return (
                  <div key={t.task_number} onClick={() => setActiveTask(i)} className={`sim-task-sidebar-item ${isActive ? 'active' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: isActive ? '#1e40af' : '#475569' }}>
                        <span style={{ fontSize: 14 }}>{TASK_ICONS[t.task_type]}</span> Tâche {t.task_number}
                      </div>
                      <span style={{ fontSize: 10, color: isActive ? '#3b82f6' : '#94a3b8', fontWeight: 700, fontFamily: 'monospace', background: isActive ? '#dbeafe' : '#f1f5f9', padding: '2px 6px', borderRadius: 6 }}>{tw}/{t.max_words}</span>
                    </div>

                    <div style={{ height: 4, borderRadius: 100, background: isActive ? '#dbeafe' : '#f1f5f9', overflow: 'hidden', marginBottom: 6 }}>
                      <div style={{ height: '100%', borderRadius: 100, width: `${tp}%`, background: barColor, transition: 'width 0.4s ease' }} />
                    </div>

                    <div style={{ fontSize: 10, color: barColor === '#cbd5e1' ? '#94a3b8' : barColor, fontWeight: 600 }}>
                      {tw === 0 ? `${t.min_words} mots min.` : tw < t.min_words ? `${t.min_words - tw} mots restants` : tw > t.max_words ? `${tw - t.max_words} mots en trop` : '✓ Objectif atteint'}
                    </div>
                  </div>
                );
              })}

              <div className="sim-task-sidebar-warning">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#b91c1c', lineHeight: 1.4 }}>Tâche vide = 0/20</span>
              </div>
            </div>

            {/* Center — Editor Area */}
            <div className="sim-editor-area">
              {tache && (
                <div className="sim-editor-container">

                  {/* Prompt Card — Redesigned */}
                  {(() => {
                    const TASK_DESCRIPTIONS: Record<string, string> = {
                      'Message': "Il s'agit de rédiger un message, un courriel ou une annonce adressé à un ou plusieurs destinataires dans le but d'inviter, décrire, raconter, informer ou exprimer une demande.",
                      'Narration': "Il s'agit de rédiger un article de blog, un courriel, un commentaire, etc., destiné à plusieurs destinataires, dans le but de raconter et décrire une expérience vécue dans le passé.",
                      'Argumentation': "", // Removed per user request, using question instead
                    };
                    const taskKey = tache.task_type_label?.split(' ')?.[0] || tache.task_type || '';
                    const desc = TASK_DESCRIPTIONS[taskKey] || TASK_DESCRIPTIONS[tache.task_type_label] || '';
                    return (
                      <div style={{ marginBottom: 12, flexShrink: 0 }} onCopy={e => { e.preventDefault(); showSecurityWarning("La copie est désactivée pendant l'examen."); }}>
                        {/* Header Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, boxShadow: '0 4px 12px rgba(59,130,246,0.3)', flexShrink: 0 }}>{tache.task_number}</div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{tache.task_type_label}</div>
                              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 1 }}>{tache.min_words}–{tache.max_words} mots recommandés</div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setHideInstructions(!hideInstructions)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>
                              {hideInstructions ? (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Consignes : Afficher</>
                              ) : (
                                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> Consignes : Masquer</>
                              )}
                            </button>
                            <button onClick={() => setIsKeyboardVisible(!isKeyboardVisible)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${isKeyboardVisible ? '#3b82f6' : '#e2e8f0'}`, background: isKeyboardVisible ? '#eff6ff' : '#fff', color: isKeyboardVisible ? '#3b82f6' : '#64748b', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; }} onMouseLeave={e => { if (!isKeyboardVisible) e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                              <span>⌨️ Clavier : {isKeyboardVisible ? 'Masquer' : 'Afficher'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Top Instruction / Question */}
                        {!hideInstructions && (
                          <div style={{ marginBottom: 10 }}>
                            {desc && (
                              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, marginBottom: 8, userSelect: 'none', WebkitUserSelect: 'none' }}>
                                {desc}
                              </div>
                            )}
                            {tache.question_text && (
                              <div style={{
                                padding: '10px 14px', borderRadius: 10,
                                background: 'linear-gradient(to right, #f8fafc, #f1f5f9)',
                                borderLeft: '3px solid #4f46e5',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                fontSize: 14, fontWeight: 600, color: '#1e293b',
                                userSelect: 'none', WebkitUserSelect: 'none',
                                display: 'flex', alignItems: 'flex-start', gap: 8
                              }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>📌</span>
                                <span style={{ lineHeight: 1.5 }}>{tache.question_text}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Prompt Box */}
                        <div className="sim-prompt-scroll" style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1px solid #e2e8f0', position: 'relative', userSelect: 'none', WebkitUserSelect: 'none', maxHeight: 140, overflowY: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '12px 0 0 12px', background: 'linear-gradient(to bottom,#3b82f6,#6366f1)' }} />
                          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7, fontWeight: 500, paddingLeft: 8 }}>
                            {tache.prompt_text}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Editor Textarea */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', minHeight: 200 }}>
                    <textarea
                      ref={el => { textareaRefs.current[activeTask] = el; }}
                      value={answers[activeTask]}
                      onChange={e => handleTextChange(activeTask, e.target.value)}
                      onPaste={e => { e.preventDefault(); showSecurityWarning('Le collage de texte est désactivé.'); }}
                      onDrop={e => e.preventDefault()}
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="Écrivez votre réponse ici..."
                      style={{ flex: 1, width: '100%', resize: 'none', border: 'none', padding: '18px 20px', fontSize: 15, lineHeight: 1.7, fontFamily: 'Inter, system-ui, sans-serif', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                    />

                    {/* Floating Word Count Pill */}
                    <div style={{ position: 'absolute', bottom: 14, right: 14, background: wcBg, color: wcColor, padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${wcBorder}` }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      {wc} / {tache.max_words} mots
                    </div>
                  </div>

                  {/* Inline Special Characters Keyboard for small screens */}
                  <div className="sim-inline-keyboard">
                    {SPECIAL_CHARS.map(ch => (
                      <button key={`inline-${ch}`} onClick={() => insertChar(ch)} className="sim-inline-key">
                        {ch}
                      </button>
                    ))}
                  </div>

                  {/* Bottom Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, flexShrink: 0 }}>
                    <button onClick={() => setActiveTask(Math.max(0, activeTask - 1))} disabled={activeTask === 0} style={{ padding: '10px 22px', borderRadius: 100, border: '1px solid #e2e8f0', background: '#fff', color: activeTask === 0 ? '#cbd5e1' : '#475569', fontSize: 13, fontWeight: 700, cursor: activeTask === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      Précédent
                    </button>
                    <button onClick={() => setActiveTask(Math.min(simData.taches.length - 1, activeTask + 1))} disabled={activeTask === simData.taches.length - 1} style={{ padding: '10px 22px', borderRadius: 100, border: 'none', background: activeTask === simData.taches.length - 1 ? '#e2e8f0' : '#3b82f6', color: activeTask === simData.taches.length - 1 ? '#94a3b8' : '#fff', fontSize: 13, fontWeight: 700, cursor: activeTask === simData.taches.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: activeTask === simData.taches.length - 1 ? 'none' : '0 4px 12px rgba(59,130,246,0.3)' }}>
                      Suivant
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel — Special Characters Keyboard */}
            <div className={`sim-keyboard-panel ${isKeyboardVisible ? 'expanded' : 'collapsed'}`}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>⌨️</span>
                Clavier Français
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {SPECIAL_CHARS.map(ch => (
                  <button
                    key={ch}
                    onClick={() => insertChar(ch)}
                    style={{
                      height: 42, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff',
                      color: '#1e293b', fontSize: 16, fontWeight: 600, fontFamily: 'monospace',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 0 #e2e8f0', transition: 'all 0.1s'
                    }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = '#f1f5f9'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 0 #e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 0 #e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }; // end renderContent

  return (
    <Modal open={open} onCancel={view === 'exam' ? undefined : onClose} centered footer={null} title={null} closeIcon={null} destroyOnClose
      width="90vw"
      zIndex={900}
      styles={{ body: { padding: 0, height: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }, content: { padding: 0, borderRadius: 14, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' } }}
      maskClosable={view !== 'exam'}
    >
      {/* Header bar */}
      {view !== 'exam' && (
        <div style={{ background: 'linear-gradient(145deg,#0f172a 0%,#1e1b4b 50%,#312e81 100%)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(244,63,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✍️</div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#f472b6', textTransform: 'uppercase', letterSpacing: 1.2 }}>Expression Écrite</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9' }}>Simulation</div>
            </div>
          </div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171', fontSize: 14, fontWeight: 700 }}>✕</div>
        </div>
      )}
      <div style={{ flex: 1, overflowY: view === 'exam' ? 'hidden' : 'auto', minHeight: 0 }}>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default EESimulation;
