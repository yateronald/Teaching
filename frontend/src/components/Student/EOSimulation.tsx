import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, message, Progress, Result } from 'antd';
import {
  AudioOutlined, AudioMutedOutlined, ClockCircleOutlined,
  PlayCircleOutlined, CheckCircleOutlined,
  SoundOutlined, ArrowRightOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { GeminiLiveVoice } from './eoGeminiLive';
import {
  type EOSimConfig, type EOSimSession, type EOEvaluation,
  type SimulationPhase, TACHE_DURATIONS, formatTime,
} from './EOSimulationTypes';

interface Props { open: boolean; onClose: () => void; partieId?: number | null; onCreditConsumed?: () => void; onOutOfCredits?: () => void }

const EOSimulation: React.FC<Props> = ({ open, onClose, partieId, onCreditConsumed, onOutOfCredits }) => {
  const { apiCall } = useAuth();
  const [phase, setPhase] = useState<SimulationPhase>('briefing');
  const [config, setConfig] = useState<EOSimConfig | null>(null);
  const [session, setSession] = useState<EOSimSession | null>(null);
  const [evaluation, setEvaluation] = useState<EOEvaluation | null>(null);

  // Timers
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Voice
  const voiceRef = useRef<GeminiLiveVoice | null>(null);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [muted, setMuted] = useState(false);

  // Transcripts
  const tache1Transcript = useRef<string>('');
  const tache1Questions = useRef<string[]>([]);
  const tache2Transcript = useRef<string>('');
  const tache3Transcript = useRef<string>('');

  // Recognition (for T2 + T3 — using browser SpeechRecognition since Live mode is only for T1)
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Mic level analyser (for T2 + T3 visualization, since Gemini Live's
  // onUserSpeechActivity isn't available outside live-voice mode).
  const micAnalyserRef = useRef<{
    ctx: AudioContext;
    stream: MediaStream;
    analyser: AnalyserNode;
    source: MediaStreamAudioSourceNode;
    raf: number | null;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState('');

  // Frontend fallback prompts — last line of defense if backend fallbacks fail
  // and the prompt arrives empty. The AI examiner will read these instead of
  // saying "aucun sujet pour cette tâche".
  const FALLBACK_T2_PROMPTS = [
    "Vous voulez visiter une région québécoise. Vous allez à l'office du tourisme pour vous renseigner sur les activités à faire, les hébergements disponibles et les transports.",
    "Vous cherchez un appartement à louer dans une nouvelle ville. Vous appelez le propriétaire pour poser des questions sur le logement et organiser une visite.",
    "Vous souhaitez vous inscrire à un cours de français. Vous appelez l'école pour vous renseigner sur les horaires, les niveaux, les tarifs et les méthodes d'enseignement.",
  ];
  const FALLBACK_T3_PROMPTS = [
    "À votre avis, la télévision est-elle nécessaire à l'éducation des enfants ? Pourquoi ? Présentez votre opinion en l'illustrant d'exemples concrets.",
    "Pensez-vous que les entreprises doivent accompagner les nouveaux employés pour faciliter leur intégration ? Êtes-vous d'accord avec cette idée ?",
    "Selon vous, l'apprentissage des langues étrangères devrait-il être obligatoire dès le primaire ? Pourquoi ? Donnez des exemples pour soutenir votre position.",
    "Pensez-vous que les réseaux sociaux ont changé la façon dont les jeunes communiquent ? Cette évolution est-elle positive ou négative ?",
  ];
  const pickFallback = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  // Returns a non-empty prompt — uses the provided one if valid, otherwise falls back.
  const ensurePrompt = (prompt: string | undefined | null, fallbacks: string[]): string => {
    const trimmed = (prompt || '').trim();
    return trimmed.length > 5 ? trimmed : pickFallback(fallbacks);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      voiceRef.current?.stop();
      voiceRef.current = null;
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      stopMicAnalyser();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch config when modal opens ──
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const resp = await apiCall('/eo-simulation/config');
        if (resp.ok) setConfig(await resp.json());
        else { message.error('Configuration indisponible'); onClose(); }
      } catch { message.error('Connexion impossible'); onClose(); }
    })();
  }, [open, apiCall, onClose]);

  // ── Start a timer ──
  const startTimer = useCallback((seconds: number, onEnd: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Browser SpeechRecognition for T2/T3 ──
  const startRecognition = useCallback((onTranscript: (full: string) => void) => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) {
      console.warn('SpeechRecognition not supported');
      return;
    }
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.continuous = true;
    rec.interimResults = true;
    let fullText = '';
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) fullText += t + ' ';
        else interim += t;
      }
      onTranscript((fullText + interim).trim());
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => { console.warn('Recognition error:', e.error); };
    rec.onend = () => {
      // Auto-restart while we still want to listen
      if (recognitionRef.current === rec) {
        try { rec.start(); } catch { /* already started */ }
      }
    };
    recognitionRef.current = rec;
    try { rec.start(); } catch { /* already started */ }
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      try { rec.stop(); } catch { /* ignore */ }
    }
  }, []);

  // ── Mic level analyser (used for T2 + T3 microphone animation) ──
  // Independent of SpeechRecognition: opens its own audio stream, analyses it
  // with an AnalyserNode, and writes the smoothed RMS level (0..1) to micLevel
  // so the green pulsing visualizer reacts to the student's actual voice.
  const startMicAnalyser = useCallback(async () => {
    if (micAnalyserRef.current) return; // already running
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);

      const buf = new Float32Array(analyser.fftSize);
      let smoothed = 0;
      const tick = () => {
        if (!micAnalyserRef.current) return;
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const rms = Math.sqrt(sum / buf.length);
        // Map RMS (~0..0.3 for normal speech) to a 0..1 visualizer range with
        // mild compression so quiet voices still produce visible motion.
        const target = Math.min(1, Math.max(0, rms * 5));
        // Light low-pass for a smoother, more natural pulse animation
        smoothed = smoothed * 0.6 + target * 0.4;
        setMicLevel(smoothed);
        micAnalyserRef.current.raf = window.requestAnimationFrame(tick);
      };
      micAnalyserRef.current = { ctx, stream, analyser, source, raf: null };
      micAnalyserRef.current.raf = window.requestAnimationFrame(tick);
    } catch (err) {
      console.warn('Mic analyser failed:', err);
    }
  }, []);

  const stopMicAnalyser = useCallback(() => {
    const ref = micAnalyserRef.current;
    if (!ref) return;
    micAnalyserRef.current = null;
    if (ref.raf) window.cancelAnimationFrame(ref.raf);
    try { ref.source.disconnect(); } catch { /* ignore */ }
    try { ref.stream.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
    try { ref.ctx.close(); } catch { /* ignore */ }
    setMicLevel(0);
  }, []);

  // ── TTS-only announcement helper ──
  // The AI examiner reads `text` aloud (no mic captured). Promise resolves
  // when the audio fully finishes (turnComplete + buffer drain), not on the
  // first chunk-end.
  const speakAnnouncement = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!config) { resolve(); return; }
      // Stop any previous voice connection first
      voiceRef.current?.stop();
      voiceRef.current = null;

      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        setAiSpeaking(false);
        // Defer voice stop slightly to allow any final buffer to flush
        const v = voiceRef.current;
        voiceRef.current = null;
        setTimeout(() => v?.stop(), 100);
        resolve();
      };

      // Safety timeout — proportional to text length, with a generous buffer.
      // Speech speed is roughly 12 characters per second in French, but we add
      // 20s of margin for setup/connection time and natural pauses.
      const estimatedSpeechMs = Math.max(8000, (text.length / 12) * 1000);
      const safetyMs = Math.min(120000, estimatedSpeechMs + 20000);
      const safetyTimer = window.setTimeout(finish, safetyMs);

      const voice = new GeminiLiveVoice({
        apiKey: config.apiKey,
        model: config.liveModel,
        voice: 'Sulafat',
        disableMic: true,
        temperature: 0.4,
        systemInstruction:
          `Tu es un examinateur officiel TCF/TEF Canada. Tu vas lire à voix haute, exactement, ` +
          `le texte qui te sera fourni, en français standard, avec un ton chaleureux et professionnel. ` +
          `N'ajoute rien, ne commente rien. Lis simplement le texte tel qu'il est, naturellement, ` +
          `du début à la fin sans interruption.`,
        onModelAudioStart: () => setAiSpeaking(true),
        onModelAudioEnd: () => {
          window.clearTimeout(safetyTimer);
          // Small delay to ensure the audio buffer fully drained
          setTimeout(finish, 250);
        },
        onError: () => {
          window.clearTimeout(safetyTimer);
          finish();
        },
      });

      voice.start().then(() => {
        voiceRef.current = voice;
        voice.sendText(`Lis exactement ce texte à voix haute, sans rien ajouter:\n\n"${text}"`);
      }).catch(() => {
        window.clearTimeout(safetyTimer);
        finish();
      });
    });
  }, [config]);

  // ── Start the simulation ──
  const startSimulation = async () => {
    try {
      const resp = await apiCall('/eo-simulation/start', {
        method: 'POST',
        body: JSON.stringify({ partieId: partieId || null }),
      });
      if (resp.status === 402) {
        // Out of credits — close this simulation modal and let the parent
        // surface the premium OutOfCreditsModal.
        await resp.json().catch(() => ({}));
        onClose();
        if (onOutOfCredits) {
          setTimeout(() => onOutOfCredits(), 80);
        } else {
          message.warning('You are out of Expression Orale credits. Please contact your administrator.');
        }
        return;
      }
      if (!resp.ok) { const d = await resp.json(); message.error(d.error || 'Impossible de démarrer'); return; }
      const sess = await resp.json();
      // The server consumed 1 EO credit on success — refresh the parent's display.
      onCreditConsumed?.();
      setSession(sess);
      setPhase('greeting');
      // After a brief greeting moment, kick off Tâche 1 directly:
      // the AI will speak the instructions and the timer starts when AI finishes.
      // No intermediate intro screen — feels like a real exam where the examiner just begins.
      setTimeout(() => { startTache1(sess); }, 600);
    } catch { message.error('Erreur de connexion'); }
  };

  // ── Tâche 1: Live voice with Gemini ──
  // Accepts an explicit session arg so we can call this right after fetching
  // the session, without waiting for React state to flush.
  const startTache1 = async (sessArg?: EOSimSession) => {
    const sess = sessArg || session;
    if (!config || !sess) return;
    setPhase('tache1-speaking');  // Show "examiner is speaking" state first
    tache1Transcript.current = '';
    tache1Questions.current = [];

    const pointsList = (sess.tache1?.points || []).map(p => `${p.number}. ${p.title}${p.subtitle ? ` (${p.subtitle})` : ''}`).join('\n');
    const t1Prompt = sess.tache1?.prompt || "Présentez-vous en parlant de votre identité, votre formation, vos loisirs et vos projets.";

    const systemInstruction = [
      `Tu es un examinateur officiel de l'épreuve d'expression orale TCF/TEF Canada.`,
      `L'étudiant s'appelle ${sess.firstName}. Tu vas mener la TÂCHE 1 — Présentation personnelle (2 minutes).`,
      ``,
      `CONSIGNE OFFICIELLE DE LA TÂCHE 1:`,
      t1Prompt,
      ``,
      `POINTS À ABORDER PAR LE CANDIDAT:`,
      pointsList || '1. Identité\n2. Formation\n3. Loisirs\n4. Projets',
      ``,
      `INSTRUCTIONS STRICTES:`,
      `1. Commence immédiatement par accueillir l'étudiant par son prénom (${sess.firstName}) et lui présenter la tâche en lui demandant de se présenter en abordant les 4 points ci-dessus.`,
      `   Exemple: "Bonjour ${sess.firstName}, bienvenue à votre simulation. Pour cette première tâche, vous allez vous présenter pendant environ deux minutes. Pensez à parler de votre identité, votre formation, vos loisirs et vos projets. Quand vous êtes prêt(e), commencez."`,
      `2. Ensuite, ÉCOUTE silencieusement pendant que l'étudiant parle. Le minuteur ne démarrera qu'APRÈS que tu aies terminé tes consignes.`,
      `3. Tu peux poser jusqu'à 3 questions de relance courtes liées aux points à aborder ou aux éléments mentionnés par l'étudiant — UNIQUEMENT après que l'étudiant ait fait une pause naturelle ou parlé pendant au moins 30 secondes.`,
      `4. Ne corrige JAMAIS l'étudiant. N'évalue pas. Sois encourageant et naturel comme un vrai examinateur.`,
      `5. Garde tes interventions très courtes (1 phrase maximum).`,
      `6. Parle avec un ton chaleureux et professionnel, en français standard.`,
      `7. Si l'étudiant te pose une question sur l'examen, réponds brièvement puis redirige sur la présentation.`,
      `8. Ne dis JAMAIS "merci" ou "fin" — la fin sera gérée par le minuteur du système.`,
    ].join('\n');

    // Track whether the AI has finished the FIRST utterance (the instructions).
    // The timer starts only after the AI's instruction speech ends.
    let timerStarted = false;

    const voice = new GeminiLiveVoice({
      apiKey: config.apiKey,
      model: config.liveModel,
      voice: 'Sulafat',
      systemInstruction,
      temperature: 0.7,
      onUserSpeech: (text) => { tache1Transcript.current = (tache1Transcript.current + ' ' + text).trim(); },
      onModelSpeech: (text) => {
        // Detect questions in AI output (heuristic: ends with ?)
        if (text.includes('?') && tache1Questions.current.length < 3) {
          tache1Questions.current.push(text.trim());
        }
      },
      onModelAudioStart: () => setAiSpeaking(true),
      onModelAudioEnd: () => {
        setAiSpeaking(false);
        // Start the 2-minute countdown ONLY after the AI's first speech finishes
        if (!timerStarted) {
          timerStarted = true;
          setPhase('tache1-active');
          startTimer(TACHE_DURATIONS.tache1, () => endTache1());
        }
      },
      onUserSpeechActivity: (lvl) => setMicLevel(lvl),
      onError: (err) => { setErrorMsg(err); setPhase('error'); },
    });

    try {
      await voice.start();
      voiceRef.current = voice;
      // Trigger AI to greet/instruct
      voice.sendText('Commence la tâche 1 maintenant en saluant le candidat et en lui donnant les consignes.');
    } catch (e) {
      setErrorMsg((e as Error).message);
      setPhase('error');
    }
  };

  const endTache1 = useCallback(async () => {
    stopTimer();
    voiceRef.current?.stop();
    voiceRef.current = null;
    setAiSpeaking(false);
    // Save transcript
    if (session) {
      try {
        await apiCall(`/eo-simulation/${session.simulationId}/transcript`, {
          method: 'POST',
          body: JSON.stringify({ tache: 1, transcript: tache1Transcript.current, questions: tache1Questions.current }),
        });
      } catch { /* ignore */ }
    }
    setPhase('tache1-end');
  }, [session, apiCall, stopTimer]);

  // ── Tâche 2: Random sujet, prep + speak ──
  const startTache2 = () => {
    setPhase('tache2-intro');
  };

  // When student clicks "Commencer la préparation", the AI first reads
  // the transition + sujet aloud, then the 2-min preparation timer starts.
  const startTache2Prep = async () => {
    if (!session) return;
    // Ensure the sujet prompt is not empty before the AI speaks it.
    // If the DB returned a blank prompt, substitute a fallback and persist it on the session
    // so the same text is shown on screen.
    const safeT2Prompt = ensurePrompt(session.tache2?.prompt, FALLBACK_T2_PROMPTS);
    if (safeT2Prompt !== session.tache2?.prompt) {
      setSession(prev => prev ? { ...prev, tache2: { ...prev.tache2, prompt: safeT2Prompt } } : prev);
    }
    setPhase('tache2-speaking');
    const announcement =
      `Très bien. Nous passons maintenant à la deuxième tâche, l'interaction orale. ` +
      `Écoutez bien le sujet: ${safeT2Prompt} ` +
      `Vous avez maintenant deux minutes pour préparer vos questions en silence. ` +
      `À la fin de la préparation, je vous inviterai à commencer.`;
    await speakAnnouncement(announcement);
    // Now start the prep timer
    setPhase('tache2-prep');
    startTimer(TACHE_DURATIONS.tache2_prep, () => startTache2Speak());
  };

  // After prep ends, AI invites the student to start speaking, then we begin the 3:30 speaking timer.
  const startTache2Speak = async () => {
    setPhase('tache2-prep-end');
    await speakAnnouncement(
      `Le temps de préparation est terminé. Vous pouvez commencer à parler maintenant. ` +
      `Vous avez trois minutes et trente secondes. Je vous écoute.`
    );
    setPhase('tache2-active');
    tache2Transcript.current = '';
    startRecognition((text) => { tache2Transcript.current = text; });
    startMicAnalyser();
    startTimer(TACHE_DURATIONS.tache2_speak, () => endTache2());
  };

  const endTache2 = useCallback(async () => {
    stopTimer();
    stopRecognition();
    stopMicAnalyser();
    if (session) {
      try {
        await apiCall(`/eo-simulation/${session.simulationId}/transcript`, {
          method: 'POST',
          body: JSON.stringify({ tache: 2, transcript: tache2Transcript.current }),
        });
      } catch { /* ignore */ }
    }
    setPhase('tache2-end');
  }, [session, apiCall, stopTimer, stopRecognition, stopMicAnalyser]);

  // ── Tâche 3: Random sujet, speak only ──
  const startTache3 = () => {
    setPhase('tache3-intro');
  };

  // When student clicks "Commencer la tâche 3", the AI first reads
  // the transition + sujet aloud, then the 4:30 speaking timer starts.
  const startTache3Speak = async () => {
    if (!session) return;
    // Same fallback logic as T2 — never let the AI announce an empty sujet
    const safeT3Prompt = ensurePrompt(session.tache3?.prompt, FALLBACK_T3_PROMPTS);
    if (safeT3Prompt !== session.tache3?.prompt) {
      setSession(prev => prev ? { ...prev, tache3: { ...prev.tache3, prompt: safeT3Prompt } } : prev);
    }
    setPhase('tache3-speaking');
    const announcement =
      `Très bien. Nous passons maintenant à la troisième et dernière tâche, l'argumentation. ` +
      `Voici votre sujet: ${safeT3Prompt} ` +
      `Vous avez quatre minutes et trente secondes pour développer votre argumentation. ` +
      `Vous pouvez commencer à parler dès maintenant. Je vous écoute.`;
    await speakAnnouncement(announcement);
    setPhase('tache3-active');
    tache3Transcript.current = '';
    startRecognition((text) => { tache3Transcript.current = text; });
    startMicAnalyser();
    startTimer(TACHE_DURATIONS.tache3_speak, () => endTache3());
  };

  const endTache3 = useCallback(async () => {
    stopTimer();
    stopRecognition();
    stopMicAnalyser();
    if (session) {
      try {
        await apiCall(`/eo-simulation/${session.simulationId}/transcript`, {
          method: 'POST',
          body: JSON.stringify({ tache: 3, transcript: tache3Transcript.current }),
        });
      } catch { /* ignore */ }
    }
    setPhase('tache3-end');
    // Auto-advance to evaluation
    setTimeout(() => evaluate(), 1500);
  }, [session, apiCall, stopTimer, stopRecognition, stopMicAnalyser]);

  // ── Final evaluation ──
  const evaluate = async () => {
    if (!session) return;
    setPhase('evaluating');
    try {
      const resp = await apiCall(`/eo-simulation/${session.simulationId}/evaluate`, { method: 'POST' });
      if (resp.ok) {
        const evalData = await resp.json();
        setEvaluation(evalData);
        setPhase('results');
      } else {
        setErrorMsg('Erreur lors de l\'évaluation');
        setPhase('error');
      }
    } catch {
      setErrorMsg('Connexion perdue');
      setPhase('error');
    }
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    voiceRef.current?.stop();
    voiceRef.current = null;
    stopRecognition();
    stopMicAnalyser();
    setPhase('briefing');
    setEvaluation(null);
    setSession(null);
    setErrorMsg('');
    onClose();
  };

  const toggleMute = () => {
    setMuted(m => { const newM = !m; voiceRef.current?.setMuted(newM); return newM; });
  };

  // ── Timer color (green > 30s, amber 10-30s, red < 10s) ──
  const timerColor = timeLeft > 30 ? '#22c55e' : timeLeft > 10 ? '#f59e0b' : '#ef4444';

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={920}
      destroyOnClose
      closable={false}
      maskClosable={false}
      centered
      styles={{
        mask: { backdropFilter: 'blur(8px)', background: 'rgba(2, 6, 23, 0.78)' },
        content: { padding: 0, borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)' },
        body: { padding: 0, background: 'transparent', height: 'min(88vh, 720px)', overflow: 'hidden', boxSizing: 'border-box' },
      }}
    >
      <div style={{
        position: 'relative',
        height: '100%',
        background: 'radial-gradient(circle at 20% 0%, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at 80% 100%, rgba(168,85,247,0.14), transparent 55%), linear-gradient(160deg, #0a0f1f 0%, #0f172a 50%, #0a0f1f 100%)',
        color: '#e2e8f0',
        overflow: 'hidden',
      }}>
        {/* Custom scrollbar styling for dark theme */}
        <style>{`
          .eo-scroll::-webkit-scrollbar { width: 8px; }
          .eo-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
          .eo-scroll::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, rgba(167,139,250,0.35), rgba(99,102,241,0.35)); border-radius: 4px; }
          .eo-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, rgba(167,139,250,0.55), rgba(99,102,241,0.55)); }
          .eo-scroll { scrollbar-width: thin; scrollbar-color: rgba(167,139,250,0.4) rgba(255,255,255,0.02); }
        `}</style>

        {/* Ambient grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }} />

        {/* Custom close button (only visible when allowed) */}
        {(phase === 'briefing' || phase === 'results' || phase === 'error') && (
          <button
            onClick={handleClose}
            aria-label="Fermer"
            style={{
              position: 'absolute', top: 18, right: 18, width: 36, height: 36, borderRadius: 12,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)', transition: 'all 0.15s', fontSize: 16, zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#cbd5e1'; }}
          >
            ✕
          </button>
        )}

        <div style={{ position: 'relative', padding: '24px 32px 24px', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
        {/* Self-managed layouts: phases that own their full-height flex column (no parent scroll) */}
        {(phase === 'tache1-active' || phase === 'tache2-active' || phase === 'tache3-active' || phase === 'results' || phase === 'tache1-speaking' || phase === 'tache2-speaking' || phase === 'tache3-speaking' || phase === 'tache2-prep-end') ? (
          <>
            {phase === 'tache1-active' && (
              <ActiveScreen
                tacheNumber={1}
                tacheLabel="Présentation"
                timeLeft={timeLeft}
                timerColor={timerColor}
                aiSpeaking={aiSpeaking}
                micLevel={micLevel}
                muted={muted}
                onMuteToggle={toggleMute}
                onSkip={endTache1}
                isLiveMode
                currentTranscript={tache1Transcript.current}
              />
            )}
            {phase === 'tache2-active' && session && (
              <ActiveScreen
                tacheNumber={2}
                tacheLabel="Interaction"
                timeLeft={timeLeft}
                timerColor={timerColor}
                aiSpeaking={false}
                micLevel={micLevel}
                muted={false}
                onMuteToggle={() => {}}
                onSkip={endTache2}
                sujetText={session.tache2.prompt}
                currentTranscript={tache2Transcript.current}
              />
            )}
            {phase === 'tache3-active' && session && (
              <ActiveScreen
                tacheNumber={3}
                tacheLabel="Argumentation"
                timeLeft={timeLeft}
                timerColor={timerColor}
                aiSpeaking={false}
                micLevel={micLevel}
                muted={false}
                onMuteToggle={() => {}}
                onSkip={endTache3}
                sujetText={session.tache3.prompt}
                currentTranscript={tache3Transcript.current}
              />
            )}
            {phase === 'results' && evaluation && (
              <ResultsScreen evaluation={evaluation} onClose={handleClose} />
            )}
            {phase === 'tache1-speaking' && session && (
              <SpeakingScreen
                tacheNumber={1}
                tacheLabel="Présentation"
                title="L'examinateur vous donne les consignes"
                subtitle="Écoutez attentivement. Le minuteur démarrera dès que l'examinateur aura terminé."
                aiSpeaking={aiSpeaking}
                sujetText={session.tache1.prompt}
                pointsToAddress={session.tache1.points}
              />
            )}
            {phase === 'tache2-speaking' && session && (
              <SpeakingScreen
                tacheNumber={2}
                tacheLabel="Interaction"
                title="L'examinateur vous donne le sujet"
                subtitle="Écoutez attentivement. La préparation commencera dès que l'examinateur aura terminé."
                aiSpeaking={aiSpeaking}
                sujetText={session.tache2.prompt}
              />
            )}
            {phase === 'tache2-prep-end' && session && (
              <SpeakingScreen
                tacheNumber={2}
                tacheLabel="Interaction"
                title="L'examinateur est prêt à vous écouter"
                subtitle="La parole vous sera donnée dans un instant."
                aiSpeaking={aiSpeaking}
                sujetText={session.tache2.prompt}
              />
            )}
            {phase === 'tache3-speaking' && session && (
              <SpeakingScreen
                tacheNumber={3}
                tacheLabel="Argumentation"
                title="L'examinateur vous donne le sujet"
                subtitle="Écoutez attentivement. Le minuteur démarrera dès que l'examinateur aura terminé."
                aiSpeaking={aiSpeaking}
                sujetText={session.tache3.prompt}
              />
            )}
          </>
        ) : (
          /* Other phases: scroll internally when content exceeds viewport */
          <div className="eo-scroll" style={{
            flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
            paddingRight: 8, marginRight: -8,
          }}>
        {/* ── BRIEFING ── */}
        {phase === 'briefing' && config && (
          <BriefingScreen
            studentName={config.firstName}
            onStart={startSimulation}
            onCancel={handleClose}
          />
        )}

        {/* ── GREETING ── */}
        {phase === 'greeting' && (
          <CenteredScreen icon="👋" title={`Bonjour ${session?.firstName || ''}`}
            subtitle="Préparation de votre simulation d'examen..." spinning />
        )}

        {/* ── TÂCHE 1 SPEAKING ── handled by self-managed branch */}

        {/* ── TÂCHE 1 END ── */}
        {phase === 'tache1-end' && (
          <TransitionScreen
            title="Tâche 1 terminée"
            subtitle="Merci ! Passons maintenant à la deuxième partie."
            onContinue={startTache2}
            buttonLabel="Continuer — Tâche 2"
          />
        )}

        {/* ── TÂCHE 2 INTRO ── */}
        {phase === 'tache2-intro' && session && (
          <TacheIntroScreen
            number={2}
            title="Interaction orale"
            duration="2 min préparation + 3 min 30 expression"
            description="L'examinateur va vous lire le sujet à voix haute. Vous aurez ensuite 2 minutes pour préparer vos questions en silence, puis 3 minutes 30 pour parler."
            tip="Quand vous cliquez ci-dessous, l'examinateur prendra la parole et vous donnera le sujet."
            onStart={startTache2Prep}
            startLabel="Commencer — Écouter le sujet"
          />
        )}

        {/* ── TÂCHE 2 SPEAKING ── handled by self-managed branch */}

        {/* ── TÂCHE 2 PREP ── */}
        {phase === 'tache2-prep' && session && (
          <PrepScreen
            timeLeft={timeLeft}
            timerColor={timerColor}
            sujetText={session.tache2.prompt}
            onSkip={startTache2Speak}
          />
        )}

        {/* ── TÂCHE 2 PREP-END ── handled by self-managed branch */}

        {/* ── TÂCHE 2 END ── */}
        {phase === 'tache2-end' && (
          <TransitionScreen
            title="Tâche 2 terminée"
            subtitle="Merci ! Passons à la troisième et dernière partie."
            onContinue={startTache3}
            buttonLabel="Continuer — Tâche 3"
          />
        )}

        {/* ── TÂCHE 3 INTRO ── */}
        {phase === 'tache3-intro' && session && (
          <TacheIntroScreen
            number={3}
            title="Argumentation"
            duration="4 min 30"
            description="L'examinateur va vous lire le sujet à voix haute. Vous parlerez ensuite immédiatement pendant 4 minutes 30, sans temps de préparation."
            tip="Quand vous cliquez ci-dessous, l'examinateur prendra la parole et vous donnera le sujet."
            onStart={startTache3Speak}
            startLabel="Commencer — Écouter le sujet"
          />
        )}

        {/* ── TÂCHE 3 SPEAKING ── handled by self-managed branch */}

        {/* ── TÂCHE 3 END ── */}
        {phase === 'tache3-end' && (
          <CenteredScreen icon="🎯" title="C'est terminé !" subtitle="Préparation de votre évaluation..." spinning />
        )}

        {/* ── EVALUATING ── */}
        {phase === 'evaluating' && (
          <CenteredScreen icon="🤖" title="Évaluation en cours"
            subtitle="L'examinateur IA analyse votre performance selon les critères officiels..." spinning />
        )}

        {/* ── RESULTS ── handled by the self-managed branch above */}

        {/* ── ERROR ── */}
        {phase === 'error' && (
          <Result
            status="error"
            title={<span style={{ color: '#fff' }}>Une erreur est survenue</span>}
            subTitle={<span style={{ color: '#94a3b8' }}>{errorMsg}</span>}
            extra={<Button type="primary" onClick={handleClose}>Fermer</Button>}
          />
        )}
          </div>
        )}
        </div>
      </div>
    </Modal>
  );
};

// ════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════

const BriefingScreen: React.FC<{ studentName: string; onStart: () => void; onCancel: () => void }> = ({ studentName, onStart, onCancel }) => (
  <div>
    {/* Hero header — perfectly centered column stack */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 30 }}>
      {/* Centered glowing mic — sits above everything else */}
      <div style={{ position: 'relative', marginBottom: 22 }}>
        <div style={{
          position: 'absolute', inset: -22, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)',
          filter: 'blur(26px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'relative', width: 84, height: 84, borderRadius: '50%',
          background: 'linear-gradient(145deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 16px 46px -10px rgba(99,102,241,0.6), 0 0 0 1px rgba(255,255,255,0.12), inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -8px 16px rgba(0,0,0,0.18)',
        }}>
          <AudioOutlined style={{ fontSize: 36, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }} />
        </div>
      </div>

      <div style={{
        padding: '5px 14px', borderRadius: 100,
        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)',
        fontSize: 10.5, fontWeight: 700, color: '#a5b4fc', letterSpacing: 1.5, marginBottom: 14,
      }}>
        TCF / TEF CANADA · EXPRESSION ORALE
      </div>
      <h1 style={{
        fontSize: 34, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.9,
        background: 'linear-gradient(180deg, #fff 0%, #cbd5e1 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Bonjour {studentName}
      </h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 10, maxWidth: 480, lineHeight: 1.65 }}>
        Bienvenue à votre simulation. Vous allez vivre une épreuve orale comme dans un vrai examen, avec un examinateur IA qui vous guide en français.
      </p>
    </div>

    {/* Tâche cards */}
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingInline: 4 }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(167,139,250,0.4))' }} />
        <span style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>LES TROIS TÂCHES</span>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(167,139,250,0.4))' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
        {[
          { num: 1, title: 'Présentation', dur: '2 min', desc: 'Présentez-vous. L\'IA peut poser jusqu\'à 3 questions.', icon: '👋', accent: '#6366f1', accentSoft: 'rgba(99,102,241,0.12)' },
          { num: 2, title: 'Interaction', dur: '2 min prép + 3 min 30', desc: 'Posez des questions sur un sujet donné.', icon: '💬', accent: '#a855f7', accentSoft: 'rgba(168,85,247,0.12)' },
          { num: 3, title: 'Argumentation', dur: '4 min 30', desc: 'Argumentez sur un sujet de société.', icon: '⚖️', accent: '#ec4899', accentSoft: 'rgba(236,72,153,0.12)' },
        ].map(t => (
          <div key={t.num} style={{
            padding: 16, borderRadius: 14,
            background: `linear-gradient(160deg, ${t.accentSoft}, rgba(255,255,255,0.02))`,
            border: `1px solid ${t.accent}33`,
            position: 'relative', overflow: 'hidden',
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: '50%', background: `${t.accent}18`, filter: 'blur(20px)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 11,
                background: `linear-gradient(135deg, ${t.accent}, ${t.accent}cc)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                boxShadow: `0 6px 18px -4px ${t.accent}66`,
              }}>{t.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.6 }}>TÂCHE {t.num}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.title}</div>
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, color: t.accent, fontWeight: 700, marginBottom: 8,
              padding: '3px 8px', borderRadius: 6, background: `${t.accent}15`,
            }}>
              <ClockCircleOutlined style={{ fontSize: 10 }} /> {t.dur}
            </div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Tip card */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(20,184,166,0.05))',
      borderRadius: 14, padding: '14px 16px', marginBottom: 26,
      border: '1px solid rgba(34,197,94,0.18)', display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{ flexShrink: 0, fontSize: 20, marginTop: 1 }}>💡</div>
      <div style={{ fontSize: 12.5, color: '#bbf7d0', lineHeight: 1.6 }}>
        <strong style={{ color: '#86efac' }}>Conseils:</strong> Utilisez un casque audio si possible. Parlez naturellement et clairement. L'IA évaluera votre performance selon cinq critères officiels — cohérence, vocabulaire, grammaire, fluidité et réalisation de la tâche.
      </div>
    </div>

    {/* Actions */}
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      <Button size="large" onClick={onCancel} style={{
        borderRadius: 12, height: 50, paddingInline: 26, fontWeight: 600,
        background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
      }}>
        Annuler
      </Button>
      <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={onStart} style={{
        borderRadius: 12, height: 50, paddingInline: 32, fontWeight: 700, fontSize: 15,
        background: 'linear-gradient(135deg, #22c55e, #14b8a6)',
        border: 'none', boxShadow: '0 8px 24px -6px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}>
        Démarrer la simulation
      </Button>
    </div>
  </div>
);

const CenteredScreen: React.FC<{ icon: string; title: string; subtitle?: string; spinning?: boolean }> = ({ icon, title, subtitle, spinning }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 520, textAlign: 'center' }}>
    {/* Glowing circle around emoji */}
    <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 22 }}>
      <div style={{
        position: 'absolute', inset: -28, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.35), transparent 65%)',
        filter: 'blur(24px)',
      }} />
      <div style={{
        position: 'relative', width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(145deg, rgba(99,102,241,0.18), rgba(168,85,247,0.1))',
        border: '1px solid rgba(167,139,250,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px -8px rgba(99,102,241,0.4)',
      }}>{icon}</div>
    </div>
    <h2 style={{
      fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.5,
      background: 'linear-gradient(180deg, #fff, #cbd5e1)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{title}</h2>
    {subtitle && <p style={{ fontSize: 13.5, color: '#94a3b8', marginTop: 10, maxWidth: 440, lineHeight: 1.6 }}>{subtitle}</p>}
    {spinning && (
      <div style={{ marginTop: 28, display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', background: '#a78bfa',
            animation: `dot-bounce 1.2s ${i * 0.15}s infinite ease-in-out`,
          }} />
        ))}
      </div>
    )}
    <style>{`@keyframes dot-bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.5; } 40% { transform: translateY(-8px); opacity: 1; } }`}</style>
  </div>
);

const TacheIntroScreen: React.FC<{
  number: number; title: string; duration: string; description: string;
  tip?: string; sujetText?: string; onStart: () => void; startLabel?: string;
  pointsToAddress?: { number: number; title: string; subtitle?: string | null }[];
}> = ({ number, title, duration, description, tip, sujetText, onStart, startLabel = 'Commencer', pointsToAddress }) => {
  // Tâche-specific accent color for visual variety
  const accents: Record<number, { color: string; soft: string; gradient: string }> = {
    1: { color: '#6366f1', soft: 'rgba(99,102,241,0.15)', gradient: 'linear-gradient(135deg, #6366f1, #4338ca)' },
    2: { color: '#a855f7', soft: 'rgba(168,85,247,0.15)', gradient: 'linear-gradient(135deg, #a855f7, #7c3aed)' },
    3: { color: '#ec4899', soft: 'rgba(236,72,153,0.15)', gradient: 'linear-gradient(135deg, #ec4899, #be185d)' },
  };
  const accent = accents[number] || accents[1];

  return (
  <div>
    {/* Hero header with task badge */}
    <div style={{ textAlign: 'center', marginBottom: 26 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 100,
        background: accent.soft, border: `1px solid ${accent.color}40`,
      }}>
        <div style={{ width: 18, height: 18, borderRadius: 6, background: accent.gradient, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{number}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent.color, letterSpacing: 1.2 }}>TÂCHE {number}</span>
      </div>
      <h1 style={{
        fontSize: 32, fontWeight: 800, color: '#fff', margin: '14px 0 6px', letterSpacing: -0.6,
        background: 'linear-gradient(180deg, #fff, #cbd5e1)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>{title}</h1>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 12px', borderRadius: 100,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 12, color: accent.color, fontWeight: 700,
      }}>
        <ClockCircleOutlined style={{ fontSize: 11 }} /> {duration}
      </div>
    </div>

    {/* Description card */}
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '18px 20px', marginBottom: 14,
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{description}</p>
    </div>

    {/* Points à aborder (T1 only) */}
    {pointsToAddress && pointsToAddress.length > 0 && (
      <div style={{
        background: `linear-gradient(160deg, ${accent.soft}, rgba(255,255,255,0.02))`,
        borderRadius: 14, padding: 18, marginBottom: 14,
        border: `1px solid ${accent.color}33`, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `${accent.color}18`, filter: 'blur(30px)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: accent.color, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 14, borderRadius: 2, background: accent.gradient }} />
            Points à aborder
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
            {pointsToAddress.map(p => (
              <div key={p.number} style={{
                padding: 12, borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{
                  minWidth: 26, height: 26, borderRadius: 8,
                  background: accent.gradient, color: '#fff', fontSize: 11, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 10px -2px ${accent.color}55`,
                }}>{p.number}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{p.title}</div>
                  {p.subtitle && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, lineHeight: 1.4 }}>{p.subtitle}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {sujetText && (
      <div style={{
        background: `linear-gradient(160deg, ${accent.soft}, rgba(255,255,255,0.03))`,
        borderRadius: 14, padding: '18px 22px', marginBottom: 14,
        border: `1px solid ${accent.color}40`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 120, height: 120, borderRadius: '50%', background: `${accent.color}1a`, filter: 'blur(30px)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: accent.color, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 12, borderRadius: 2, background: accent.gradient }} /> Sujet
          </div>
          <p style={{ fontSize: 16, color: '#fff', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{sujetText}</p>
        </div>
      </div>
    )}

    {tip && (
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(20,184,166,0.04))',
        borderRadius: 12, padding: '12px 14px', marginBottom: 24,
        border: '1px solid rgba(34,197,94,0.18)', display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <div style={{ fontSize: 12.5, color: '#bbf7d0', lineHeight: 1.6 }}>{tip}</div>
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button type="primary" size="large" icon={<PlayCircleOutlined />} onClick={onStart}
        style={{
          borderRadius: 12, height: 50, paddingInline: 32, fontWeight: 700, fontSize: 15,
          background: accent.gradient, border: 'none',
          boxShadow: `0 8px 24px -6px ${accent.color}88, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}>
        {startLabel}
      </Button>
    </div>
  </div>
  );
};

const ActiveScreen: React.FC<{
  tacheNumber: number; tacheLabel: string; timeLeft: number; timerColor: string;
  aiSpeaking: boolean; micLevel: number; muted: boolean; onMuteToggle: () => void;
  onSkip: () => void; isLiveMode?: boolean; sujetText?: string; currentTranscript?: string;
}> = ({ tacheNumber, tacheLabel, timeLeft, timerColor, aiSpeaking, micLevel, muted, onMuteToggle, onSkip, isLiveMode, sujetText, currentTranscript }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
    {/* Header: tâche label (left) + premium timer pill (right) — fixed */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          color: '#fff', fontSize: 14, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px -4px rgba(168,85,247,0.5)',
        }}>{tacheNumber}</div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2 }}>TÂCHE {tacheNumber}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{tacheLabel}</div>
        </div>
      </div>
      {/* Modern timer pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', borderRadius: 14,
        background: `linear-gradient(135deg, ${timerColor}22, ${timerColor}10)`,
        border: `1.5px solid ${timerColor}80`,
        boxShadow: `0 4px 14px -4px ${timerColor}55, inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: timerColor,
          animation: 'timer-pulse 1s infinite ease-in-out',
        }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: timerColor, fontFamily: 'monospace', letterSpacing: 1 }}>{formatTime(timeLeft)}</span>
      </div>
    </div>

    {/* Sujet card (T2/T3) — fixed */}
    {sujetText && (
      <div style={{
        background: 'linear-gradient(160deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))',
        borderRadius: 12, padding: '10px 14px', marginBottom: 10,
        border: '1px solid rgba(99,102,241,0.25)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 3, height: 10, borderRadius: 1.5, background: '#818cf8' }} /> Sujet
        </div>
        <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.45, margin: 0 }}>{sujetText}</p>
      </div>
    )}

    {/* Voice visualizer — fixed-size stage, never shrinks */}
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '16px 20px 14px', borderRadius: 20,
      background: aiSpeaking
        ? 'radial-gradient(ellipse at center, rgba(167,139,250,0.13), rgba(2,6,23,0.95))'
        : muted
          ? 'radial-gradient(ellipse at center, rgba(239,68,68,0.08), rgba(2,6,23,0.95))'
          : 'radial-gradient(ellipse at center, rgba(34,197,94,0.1), rgba(2,6,23,0.95))',
      marginBottom: 10, position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px -12px rgba(0,0,0,0.5)',
      transition: 'background 0.3s',
      flexShrink: 0,
    }}>
      {/* Square aperture: rings + orb all radially centered inside */}
      <div style={{
        position: 'relative', width: 170, height: 170,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        {/* Decorative rotating dashed ring (always visible, subtle) */}
        <div style={{
          position: 'absolute', width: 160, height: 160, borderRadius: '50%',
          border: `1px dashed ${aiSpeaking ? 'rgba(167,139,250,0.28)' : muted ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.22)'}`,
          animation: 'rotate-slow-active 28s linear infinite',
        }} />
        <div style={{
          position: 'absolute', width: 132, height: 132, borderRadius: '50%',
          border: `1px solid ${aiSpeaking ? 'rgba(167,139,250,0.16)' : muted ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.14)'}`,
          animation: 'rotate-rev-active 22s linear infinite',
        }} />

        {/* Outward-pulsing rings (when AI speaks) */}
        {aiSpeaking && (
          <>
            <div style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.5)',
              animation: 'ring-pulse-purple 1.8s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.5)',
              animation: 'ring-pulse-purple 1.8s ease-out 0.6s infinite',
            }} />
            <div style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.5)',
              animation: 'ring-pulse-purple 1.8s ease-out 1.2s infinite',
            }} />
          </>
        )}

        {/* Mic-driven concentric rings — student speaks (green) */}
        {!aiSpeaking && !muted && (
          <>
            <div style={{
              position: 'absolute',
              width: 104 + micLevel * 60, height: 104 + micLevel * 60,
              borderRadius: '50%',
              border: `2px solid rgba(34,197,94,${0.18 + micLevel * 0.55})`,
              transition: 'all 0.1s ease-out',
              boxShadow: `0 0 ${micLevel * 30}px rgba(34,197,94,${micLevel * 0.4})`,
            }} />
            <div style={{
              position: 'absolute',
              width: 128 + micLevel * 32, height: 128 + micLevel * 32,
              borderRadius: '50%',
              border: `1.5px solid rgba(34,197,94,${0.08 + micLevel * 0.4})`,
              transition: 'all 0.1s ease-out',
            }} />
            <div style={{
              position: 'absolute',
              width: 152 + micLevel * 18, height: 152 + micLevel * 18,
              borderRadius: '50%',
              border: `1px solid rgba(34,197,94,${0.04 + micLevel * 0.25})`,
              transition: 'all 0.1s ease-out',
            }} />
          </>
        )}

        {/* The orb */}
        <div style={{
          position: 'relative', width: 96, height: 96, borderRadius: '50%',
          background: aiSpeaking
            ? 'radial-gradient(circle at 30% 30%, #c4b5fd 0%, #a78bfa 30%, #7c3aed 70%, #4c1d95 100%)'
            : muted
              ? 'radial-gradient(circle at 30% 30%, #fca5a5 0%, #ef4444 40%, #b91c1c 75%, #7f1d1d 100%)'
              : 'radial-gradient(circle at 30% 30%, #86efac 0%, #4ade80 30%, #16a34a 70%, #14532d 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: aiSpeaking
            ? '0 0 55px rgba(167,139,250,0.7), inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 4px 14px rgba(76,29,149,0.5)'
            : muted
              ? '0 0 22px rgba(239,68,68,0.4), inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 4px 14px rgba(127,29,29,0.45)'
              : `0 0 ${36 + micLevel * 44}px rgba(34,197,94,${0.45 + micLevel * 0.35}), inset 0 0 0 1px rgba(255,255,255,0.16), inset 0 4px 14px rgba(20,83,45,0.45)`,
          transform: aiSpeaking ? 'scale(1)' : muted ? 'scale(0.94)' : `scale(${1 + micLevel * 0.12})`,
          animation: aiSpeaking
            ? 'orb-pulse 1.4s ease-in-out infinite'
            : muted
              ? 'none'
              : (micLevel < 0.05 ? 'orb-breathe 3.2s ease-in-out infinite' : 'none'),
          transition: 'transform 0.1s ease-out, box-shadow 0.12s, background 0.3s',
          zIndex: 2,
        }}>
          {aiSpeaking ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3.5, height: 38 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: 3.5, borderRadius: 3,
                  background: 'linear-gradient(to bottom, #fff, #e9d5ff)',
                  boxShadow: '0 0 7px rgba(255,255,255,0.5)',
                  animation: `wave-${i} 0.9s ease-in-out infinite`,
                }} />
              ))}
            </div>
          ) : muted ? (
            <AudioMutedOutlined style={{
              fontSize: 36, color: '#fff',
              filter: 'drop-shadow(0 2px 6px rgba(127,29,29,0.6))',
            }} />
          ) : (
            <AudioOutlined style={{
              fontSize: 36, color: '#fff',
              filter: 'drop-shadow(0 2px 6px rgba(20,83,45,0.6))',
              transform: `scale(${1 + micLevel * 0.15})`,
              transition: 'transform 0.1s',
            }} />
          )}

          {/* Specular highlight */}
          <div style={{
            position: 'absolute', top: 10, left: 14, width: 26, height: 14,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.55), transparent 70%)',
            filter: 'blur(3px)', pointerEvents: 'none',
          }} />
        </div>
      </div>

      {/* Status pill */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 14px', borderRadius: 100,
        background: aiSpeaking
          ? 'rgba(167,139,250,0.14)'
          : muted ? 'rgba(239,68,68,0.14)' : 'rgba(34,197,94,0.14)',
        border: `1px solid ${aiSpeaking ? 'rgba(167,139,250,0.3)' : muted ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
        fontSize: 11.5, fontWeight: 600,
        color: aiSpeaking ? '#c4b5fd' : muted ? '#fca5a5' : '#86efac',
        backdropFilter: 'blur(6px)',
      }}>
        {aiSpeaking ? '🤖 L\'examinateur parle' : muted ? '🔇 Microphone coupé' : (micLevel > 0.06 ? '🎙️ Je vous entends' : '🎙️ Vous pouvez parler')}
      </div>

      {/* EQ bars under the pill */}
      {!aiSpeaking && !muted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, height: 20, justifyContent: 'center' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
            const threshold = 0.03 + i * 0.06;
            const active = micLevel >= threshold;
            const intensity = active ? Math.min(1, (micLevel - threshold) * 5 + 0.4) : 0.12;
            return (
              <div key={i} style={{
                width: 3.5, borderRadius: 2,
                height: `${active ? 5 + intensity * 14 : 3}px`,
                background: active
                  ? `linear-gradient(to top, rgba(34,197,94,1), rgba(74,222,128,${0.5 + intensity * 0.5}))`
                  : 'rgba(34,197,94,0.16)',
                transition: 'height 0.08s ease-out, background 0.1s',
                boxShadow: active ? `0 0 6px rgba(34,197,94,${intensity * 0.6})` : 'none',
              }} />
            );
          })}
        </div>
      )}
    </div>

    {/* Transcript preview — flex-grows to fill remaining space, scrolls internally */}
    <div style={{
      flex: '1 1 auto', minHeight: 0, marginBottom: 10,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 14px',
        border: '1px solid rgba(255,255,255,0.06)',
        flex: '1 1 auto', minHeight: 50,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'timer-pulse 1.2s infinite' }} />
          Transcription en direct
        </div>
        <div className="eo-scroll" style={{
          flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
          paddingRight: 4,
        }}>
          {currentTranscript ? (
            <p style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.6, margin: 0, fontStyle: 'italic', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {currentTranscript}
            </p>
          ) : (
            <p style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
              {isLiveMode
                ? 'Votre transcription apparaîtra ici dès que vous commencerez à parler.'
                : 'La transcription de votre intervention apparaîtra ici en temps réel.'}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Controls — anchored at bottom */}
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexShrink: 0 }}>
      {isLiveMode && (
        <Button size="middle" icon={muted ? <AudioMutedOutlined /> : <AudioOutlined />} onClick={onMuteToggle}
          style={{
            borderRadius: 10, height: 38, paddingInline: 18, fontWeight: 600, fontSize: 13,
            background: muted ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
            borderColor: muted ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)',
            color: muted ? '#ef4444' : '#cbd5e1',
          }}>
          {muted ? 'Réactiver le son' : 'Couper le son'}
        </Button>
      )}
      <Button size="middle" onClick={onSkip} style={{
        borderRadius: 10, height: 38, paddingInline: 18, fontWeight: 600, fontSize: 13,
        background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
      }}>
        Terminer maintenant
      </Button>
    </div>

    <style>{`
      @keyframes timer-pulse { 0%,100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
      @keyframes orb-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      @keyframes orb-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
      @keyframes ring-pulse-purple {
        0% { width: 150px; height: 150px; opacity: 0.7; border-width: 2px; }
        100% { width: 230px; height: 230px; opacity: 0; border-width: 1px; }
      }
      @keyframes rotate-slow-active { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes rotate-rev-active { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      @keyframes wave-0 { 0%,100% { height: 14px; } 50% { height: 46px; } }
      @keyframes wave-1 { 0%,100% { height: 22px; } 50% { height: 56px; } }
      @keyframes wave-2 { 0%,100% { height: 32px; } 50% { height: 38px; } }
      @keyframes wave-3 { 0%,100% { height: 22px; } 50% { height: 56px; } }
      @keyframes wave-4 { 0%,100% { height: 14px; } 50% { height: 46px; } }
    `}</style>
  </div>
);

// ── Speaking Screen ──
// Shown while the AI examiner is speaking instructions/sujet to the student.
// No countdown timer is shown — it represents a "wait for the examiner" pause.
const SpeakingScreen: React.FC<{
  tacheNumber: number;
  tacheLabel: string;
  title: string;
  subtitle: string;
  aiSpeaking: boolean;
  sujetText?: string;
  pointsToAddress?: { number: number; title: string; subtitle?: string | null }[];
}> = ({ tacheNumber, tacheLabel, title, subtitle, aiSpeaking, sujetText, pointsToAddress }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
    {/* Header: tâche label + "EN ÉCOUTE" pill — fixed */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: 'linear-gradient(135deg, #a855f7, #6366f1)',
          color: '#fff', fontSize: 13, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px -4px rgba(168,85,247,0.5)',
        }}>{tacheNumber}</div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.2 }}>TÂCHE {tacheNumber}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{tacheLabel}</div>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 100,
        background: 'linear-gradient(135deg, rgba(167,139,250,0.18), rgba(99,102,241,0.1))',
        border: '1px solid rgba(167,139,250,0.4)',
        boxShadow: '0 4px 14px -4px rgba(167,139,250,0.5)',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', background: '#a78bfa',
          boxShadow: '0 0 8px #a78bfa', animation: 'timer-pulse 1s infinite',
        }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#c4b5fd', letterSpacing: 1.2 }}>EN ÉCOUTE</span>
      </div>
    </div>

    {/* Stage: AI animated avatar — fits, never shrinks */}
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '18px 20px 14px', borderRadius: 20,
      background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.13), rgba(15,23,42,0.92))',
      marginBottom: 10, position: 'relative', overflow: 'hidden',
      border: '1px solid rgba(167,139,250,0.18)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px -12px rgba(0,0,0,0.5)',
      flexShrink: 0,
    }}>
      {/* AI voice orb stage — compact 170×170 square */}
      <div style={{
        position: 'relative', width: 170, height: 170,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
      }}>
        {/* Outer halo */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.18), transparent 70%)',
          filter: 'blur(8px)',
          animation: aiSpeaking ? 'halo-pulse 2.4s ease-in-out infinite' : 'halo-pulse 4s ease-in-out infinite',
        }} />

        {/* Slowly rotating dashed ring */}
        <div style={{
          position: 'absolute', width: 158, height: 158, borderRadius: '50%',
          border: '1px dashed rgba(167,139,250,0.3)',
          animation: 'rotate-slow 24s linear infinite',
        }} />
        <div style={{
          position: 'absolute', width: 130, height: 130, borderRadius: '50%',
          border: '1px solid rgba(167,139,250,0.16)',
          animation: 'rotate-rev 18s linear infinite',
        }} />

        {/* Outward-pulsing rings (active when AI talks) */}
        {aiSpeaking && (
          <>
            <div style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.5)',
              animation: 'ring-pulse 1.8s ease-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.5)',
              animation: 'ring-pulse 1.8s ease-out 0.6s infinite',
            }} />
            <div style={{
              position: 'absolute', width: 104, height: 104, borderRadius: '50%',
              border: '2px solid rgba(167,139,250,0.5)',
              animation: 'ring-pulse 1.8s ease-out 1.2s infinite',
            }} />
          </>
        )}

        {/* The orb */}
        <div style={{
          position: 'relative', width: 96, height: 96, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #c4b5fd 0%, #a78bfa 30%, #7c3aed 70%, #4c1d95 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: aiSpeaking
            ? '0 0 60px rgba(167,139,250,0.7), 0 0 0 1px rgba(255,255,255,0.18) inset, 0 4px 14px rgba(76,29,149,0.5) inset'
            : '0 0 36px rgba(167,139,250,0.42), 0 0 0 1px rgba(255,255,255,0.14) inset, 0 4px 14px rgba(76,29,149,0.4) inset',
          animation: aiSpeaking ? 'orb-pulse 1.4s ease-in-out infinite' : 'orb-breathe 3.2s ease-in-out infinite',
          zIndex: 2,
        }}>
          {aiSpeaking ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3.5, height: 38 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: 3.5, borderRadius: 3,
                  background: 'linear-gradient(to bottom, #fff, #e9d5ff)',
                  boxShadow: '0 0 7px rgba(255,255,255,0.5)',
                  animation: `wave-${i} 0.9s ease-in-out infinite`,
                }} />
              ))}
            </div>
          ) : (
            <SoundOutlined style={{
              fontSize: 38, color: '#fff',
              filter: 'drop-shadow(0 2px 6px rgba(76,29,149,0.6))',
            }} />
          )}

          {/* Specular highlight */}
          <div style={{
            position: 'absolute', top: 10, left: 16, width: 26, height: 14,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.55), transparent 70%)',
            filter: 'blur(3px)', pointerEvents: 'none',
          }} />
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 4, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontSize: 11.5, color: '#cbd5e1', textAlign: 'center', maxWidth: 500, lineHeight: 1.5 }}>{subtitle}</div>

      {/* Speech indicator pill */}
      <div style={{
        marginTop: 10, display: 'flex', alignItems: 'center', gap: 10,
        padding: '5px 14px', borderRadius: 100,
        background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(167,139,250,0.18)',
        backdropFilter: 'blur(6px)',
      }}>
        <span style={{ fontSize: 10.5, color: aiSpeaking ? '#c4b5fd' : '#94a3b8', fontWeight: 600 }}>
          {aiSpeaking ? '🤖 L\'examinateur parle…' : '⏳ Préparation de la consigne…'}
        </span>
        {aiSpeaking && (
          <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 12 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 3, borderRadius: 2,
                background: 'linear-gradient(to top, #6366f1, #c4b5fd)',
                animation: `mini-wave-${i} 0.85s ease-in-out infinite`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Body: sujet (flexible, scrolls internally if very long) + points (fixed) */}
    <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sujetText && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))',
          borderRadius: 12, padding: '12px 16px',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          flex: '1 1 auto', minHeight: 60,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <span style={{ width: 3, height: 10, borderRadius: 1.5, background: 'linear-gradient(to bottom, #818cf8, #a78bfa)' }} /> Sujet à l'écran
          </div>
          <div className="eo-scroll" style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden', paddingRight: 4 }}>
            <p style={{ fontSize: 13.5, color: '#fff', lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{sujetText}</p>
          </div>
        </div>
      )}

      {/* Points (T1) — compact, fixed at bottom */}
      {pointsToAddress && pointsToAddress.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 3, height: 10, borderRadius: 1.5, background: '#6366f1' }} /> Points à aborder
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(pointsToAddress.length, 4)}, minmax(0, 1fr))`, gap: 6 }}>
            {pointsToAddress.map(p => (
              <div key={p.number} style={{
                padding: '6px 8px', borderRadius: 8,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)',
                display: 'flex', gap: 6, alignItems: 'center', minWidth: 0,
              }}>
                <div style={{
                  minWidth: 18, height: 18, borderRadius: 5,
                  background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                  color: '#fff', fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 8px -2px rgba(99,102,241,0.5)', flexShrink: 0,
                }}>{p.number}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <style>{`
      @keyframes orb-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      @keyframes orb-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
      @keyframes halo-pulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
      @keyframes ring-pulse {
        0% { width: 104px; height: 104px; opacity: 0.7; border-width: 2px; }
        100% { width: 170px; height: 170px; opacity: 0; border-width: 1px; }
      }
      @keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes rotate-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      @keyframes wave-0 { 0%,100% { height: 10px; } 50% { height: 32px; } }
      @keyframes wave-1 { 0%,100% { height: 16px; } 50% { height: 38px; } }
      @keyframes wave-2 { 0%,100% { height: 22px; } 50% { height: 28px; } }
      @keyframes wave-3 { 0%,100% { height: 16px; } 50% { height: 38px; } }
      @keyframes wave-4 { 0%,100% { height: 10px; } 50% { height: 32px; } }
      @keyframes mini-wave-0 { 0%,100% { height: 4px; } 50% { height: 11px; } }
      @keyframes mini-wave-1 { 0%,100% { height: 6px; } 50% { height: 12px; } }
      @keyframes mini-wave-2 { 0%,100% { height: 9px; } 50% { height: 7px; } }
      @keyframes mini-wave-3 { 0%,100% { height: 5px; } 50% { height: 11px; } }
    `}</style>
  </div>
);

const PrepScreen: React.FC<{ timeLeft: number; timerColor: string; sujetText: string; onSkip: () => void }> = ({ timeLeft, timerColor, sujetText, onSkip }) => (
  <div>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: '#fff', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 16px -4px rgba(245,158,11,0.5)',
        }}>🤔</div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#fbbf24', letterSpacing: 1.2 }}>PRÉPARATION SILENCIEUSE</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Préparez vos questions</div>
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 18px', borderRadius: 14,
        background: `linear-gradient(135deg, ${timerColor}22, ${timerColor}10)`,
        border: `1.5px solid ${timerColor}80`,
        boxShadow: `0 4px 14px -4px ${timerColor}55, inset 0 1px 0 rgba(255,255,255,0.1)`,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: timerColor,
          animation: 'timer-pulse 1s infinite ease-in-out',
        }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: timerColor, fontFamily: 'monospace', letterSpacing: 1 }}>{formatTime(timeLeft)}</span>
      </div>
    </div>

    {/* Sujet — large display since the student needs to study it */}
    <div style={{
      background: 'linear-gradient(160deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06))',
      borderRadius: 16, padding: '22px 24px', marginBottom: 14,
      border: '1px solid rgba(99,102,241,0.3)',
      position: 'relative', overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(40px)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 4, height: 14, borderRadius: 2, background: 'linear-gradient(to bottom, #818cf8, #a78bfa)' }} /> Sujet
        </div>
        <p style={{ fontSize: 17, color: '#fff', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{sujetText}</p>
      </div>
    </div>

    {/* Reminder — silent prep */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.04))',
      borderRadius: 14, padding: '16px 20px', marginBottom: 24,
      border: '1px solid rgba(245,158,11,0.25)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', filter: 'blur(30px)' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>�</div>
        <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, marginBottom: 2 }}>Réfléchissez en silence</div>
        <div style={{ fontSize: 11.5, color: '#fed7aa', lineHeight: 1.5, opacity: 0.85 }}>Notez mentalement les points clés. Vous parlerez quand la préparation se termine.</div>
      </div>
    </div>

    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Button size="large" onClick={onSkip} style={{
        borderRadius: 12, height: 46, paddingInline: 26, fontWeight: 600,
        background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1',
      }}>
        Je suis prêt — Commencer maintenant
      </Button>
    </div>
  </div>
);

const TransitionScreen: React.FC<{ title: string; subtitle: string; onContinue: () => void; buttonLabel: string }> = ({ title, subtitle, onContinue, buttonLabel }) => (
  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 460 }}>
    {/* Glowing checkmark */}
    <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 22 }}>
      <div style={{
        position: 'absolute', inset: -20, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.4), transparent 65%)',
        filter: 'blur(22px)',
      }} />
      <div style={{
        position: 'relative', width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(145deg, rgba(34,197,94,0.25), rgba(20,184,166,0.1))',
        border: '1px solid rgba(34,197,94,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 40px -8px rgba(34,197,94,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        animation: 'check-pop 0.6s ease-out',
      }}>
        <CheckCircleOutlined style={{ fontSize: 48, color: '#4ade80' }} />
      </div>
    </div>
    <h2 style={{
      fontSize: 30, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.6,
      background: 'linear-gradient(180deg, #fff, #cbd5e1)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{title}</h2>
    <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 10, marginBottom: 32, maxWidth: 440, lineHeight: 1.6 }}>{subtitle}</p>
    <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={onContinue} style={{
      borderRadius: 12, height: 50, paddingInline: 32, fontWeight: 700, fontSize: 15,
      background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none',
      boxShadow: '0 8px 24px -6px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
    }}>
      {buttonLabel}
    </Button>
    <style>{`@keyframes check-pop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }`}</style>
  </div>
);

const ResultsScreen: React.FC<{ evaluation: EOEvaluation; onClose: () => void }> = ({ evaluation, onClose }) => {
  const score = evaluation.overall_score;
  const scoreColor = score >= 14 ? '#22c55e' : score >= 10 ? '#f59e0b' : '#ef4444';
  const scoreColor2 = score >= 14 ? '#16a34a' : score >= 10 ? '#d97706' : '#dc2626';
  const scoreLabel = score >= 16 ? 'Excellent' : score >= 14 ? 'Très bien' : score >= 12 ? 'Bien' : score >= 10 ? 'Satisfaisant' : 'À améliorer';
  const cefrLevel = score >= 18 ? 'C2' : score >= 15 ? 'C1' : score >= 12 ? 'B2' : score >= 9 ? 'B1' : score >= 5 ? 'A2' : 'A1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Scrollable content area (everything except the fixed footer button) */}
      <div className="eo-scroll" style={{
        flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        paddingRight: 8, marginRight: -8, paddingBottom: 12,
      }}>
      {/* Hero score banner */}
      <div style={{
        position: 'relative', textAlign: 'center', marginBottom: 24,
        padding: '32px 24px 28px', borderRadius: 20,
        background: `radial-gradient(circle at top, ${scoreColor}22, transparent 65%), linear-gradient(160deg, rgba(15,23,42,0.6), rgba(2,6,23,0.4))`,
        border: `1px solid ${scoreColor}40`,
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: '50%', background: `${scoreColor}26`, filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 140, height: 140, borderRadius: '50%', background: `${scoreColor}1a`, filter: 'blur(40px)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 8 }}>
            <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: `radial-gradient(circle, ${scoreColor}55, transparent)`, filter: 'blur(14px)' }} />
            <div style={{
              position: 'relative', width: 56, height: 56, borderRadius: '50%',
              background: `linear-gradient(145deg, ${scoreColor}, ${scoreColor2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px -4px ${scoreColor}88, inset 0 1px 0 rgba(255,255,255,0.25)`,
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              <TrophyOutlined style={{ fontSize: 26, color: '#fff' }} />
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>VOTRE RÉSULTAT</div>

          {/* Big score number */}
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <span style={{
              fontSize: 76, fontWeight: 900, lineHeight: 1, letterSpacing: -2,
              background: `linear-gradient(180deg, ${scoreColor}, ${scoreColor2})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: `drop-shadow(0 4px 12px ${scoreColor}55)`,
            }}>{score.toFixed(1)}</span>
            <span style={{ fontSize: 24, color: scoreColor, opacity: 0.7, fontWeight: 700 }}>/20</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <div style={{
              padding: '5px 14px', borderRadius: 100,
              background: `${scoreColor}22`, border: `1px solid ${scoreColor}55`,
              fontSize: 12, fontWeight: 700, color: scoreColor,
            }}>{scoreLabel}</div>
            <div style={{
              padding: '5px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 12, fontWeight: 700, color: '#cbd5e1',
            }}>Niveau {cefrLevel}</div>
          </div>
        </div>
      </div>

      {/* Per-tâche scores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { num: 1, score: evaluation.tache1_score, label: 'Présentation', icon: '👋', color: '#6366f1' },
          { num: 2, score: evaluation.tache2_score, label: 'Interaction', icon: '💬', color: '#a855f7' },
          { num: 3, score: evaluation.tache3_score, label: 'Argumentation', icon: '⚖️', color: '#ec4899' },
        ].map(t => {
          const v = Number(t.score) || 0;
          const tColor = v >= 14 ? '#22c55e' : v >= 10 ? '#f59e0b' : '#ef4444';
          return (
            <div key={t.num} style={{
              padding: '14px 12px', borderRadius: 14,
              background: `linear-gradient(160deg, ${t.color}12, rgba(255,255,255,0.02))`,
              border: `1px solid ${t.color}33`, textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, borderRadius: '50%', background: `${t.color}15`, filter: 'blur(20px)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>TÂCHE {t.num}</div>
                <div style={{ fontSize: 10.5, color: '#cbd5e1', marginBottom: 6, fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: tColor, lineHeight: 1 }}>
                  {v.toFixed(1)}<span style={{ fontSize: 11, color: tColor, opacity: 0.6 }}>/20</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Criteria breakdown */}
      {evaluation.criteria_scores && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px 18px',
          marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 4, height: 12, borderRadius: 2, background: 'linear-gradient(to bottom, #818cf8, #a78bfa)' }} /> Critères d'évaluation
          </div>
          {[
            { key: 'coherence', label: 'Cohérence et organisation', icon: '🧩' },
            { key: 'vocabulary', label: 'Vocabulaire', icon: '📚' },
            { key: 'grammar', label: 'Grammaire', icon: '📝' },
            { key: 'fluency', label: 'Fluidité', icon: '🎤' },
            { key: 'task_completion', label: 'Réalisation de la tâche', icon: '✅' },
          ].map(c => {
            const v = (evaluation.criteria_scores as Record<string, number>)[c.key] || 0;
            return (
              <div key={c.key} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13 }}>{c.icon}</span> {c.label}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{v}/20</span>
                </div>
                <Progress percent={Math.round((v / 20) * 100)} showInfo={false}
                  strokeColor={{ '0%': '#6366f1', '100%': '#a78bfa' }}
                  trailColor="rgba(255,255,255,0.06)" size="small" />
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback per tâche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {[
          { num: 1, label: 'Présentation', feedback: evaluation.tache1_feedback, color: '#6366f1' },
          { num: 2, label: 'Interaction', feedback: evaluation.tache2_feedback, color: '#a855f7' },
          { num: 3, label: 'Argumentation', feedback: evaluation.tache3_feedback, color: '#ec4899' },
        ].map(t => (
          <div key={t.num} style={{
            padding: 14, borderRadius: 12,
            background: `linear-gradient(160deg, ${t.color}10, rgba(255,255,255,0.02))`,
            border: `1px solid ${t.color}28`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                color: '#fff', fontSize: 9, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{t.num}</span>
              Tâche {t.num} — {t.label}
            </div>
            <p style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{t.feedback}</p>
          </div>
        ))}
        {evaluation.overall_feedback && (
          <div style={{
            padding: '16px 18px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(20,184,166,0.06))',
            border: '1px solid rgba(34,197,94,0.28)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', filter: 'blur(30px)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#86efac', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 4, height: 12, borderRadius: 2, background: 'linear-gradient(to bottom, #22c55e, #14b8a6)' }} />
                Message de l'examinateur
              </div>
              <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>{evaluation.overall_feedback}</p>
            </div>
          </div>
        )}
      </div>
      </div>{/* end scrollable content */}

      {/* Fixed footer with close button — anchored at the bottom, never clipped */}
      <div style={{
        flexShrink: 0, paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'center',
      }}>
        <Button type="primary" size="middle" onClick={onClose} style={{
          borderRadius: 10, height: 40, paddingInline: 32, fontWeight: 700, fontSize: 13.5,
          background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none',
          boxShadow: '0 8px 24px -6px rgba(99,102,241,0.55), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>
          Fermer
        </Button>
      </div>
    </div>
  );
};

export default EOSimulation;
