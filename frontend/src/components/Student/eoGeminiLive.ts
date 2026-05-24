// Gemini Live voice connection helper for Expression Orale simulation.
// Handles WebSocket connection, microphone capture, audio playback, and transcription.
// Based on the Voice to Voice reference implementation.

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const WS_URL =
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const FALLBACK_MODELS = ['gemini-2.5-flash-native-audio-preview-12-2025'];

export interface LiveVoiceConfig {
  apiKey: string;
  model: string;
  voice?: string; // default 'Sulafat'
  systemInstruction: string;
  temperature?: number;
  disableMic?: boolean; // if true, do not capture microphone (TTS-only mode)
  onUserSpeech?: (text: string) => void;     // partial student transcription
  onModelSpeech?: (text: string) => void;     // AI text output
  onModelAudioStart?: () => void;
  onModelAudioEnd?: () => void;
  onUserSpeechActivity?: (level: number) => void; // 0..1
  onError?: (msg: string) => void;
  onTurnComplete?: () => void;
}

export class GeminiLiveVoice {
  private ws: WebSocket | null = null;
  private cfg: LiveVoiceConfig;
  private audioCtx: AudioContext | null = null;
  private outputGain: GainNode | null = null;
  private stream: MediaStream | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private scheduledSources = new Set<AudioBufferSourceNode>();
  private playbackTime = 0;
  private outputActive = false;
  private setupComplete = false;
  private active = false;
  private muted = false;

  // ── New state for robust turn handling ──
  private modelAudioStarted = false;     // fired onModelAudioStart for current turn?
  private turnInProgress = false;        // a model turn is currently being delivered
  private endTurnPending = false;        // turnComplete arrived; waiting for buffers to drain
  private endTurnTimer: number | null = null;
  private lastModelAudioAt = 0;          // ms timestamp of last received model audio chunk
  private loudInputStartedAt = 0;        // ms timestamp when sustained loud input began (for barge-in)

  constructor(cfg: LiveVoiceConfig) {
    this.cfg = cfg;
  }

  async start(): Promise<void> {
    this.active = true;
    this.setupComplete = false;
    this.playbackTime = 0;
    this.modelAudioStarted = false;
    this.turnInProgress = false;
    this.endTurnPending = false;
    this.lastModelAudioAt = 0;
    await this.ensureAudioCtx();

    const { ws, model } = await this.connectWithFallback();
    this.ws = ws;
    this.setupComplete = true;
    this.cfg.model = model;
    this.attachHandlers(ws);
    if (!this.cfg.disableMic) {
      await this.startMic();
    }
  }

  stop(): void {
    this.active = false;
    this.setupComplete = false;
    if (this.endTurnTimer) { window.clearInterval(this.endTurnTimer); this.endTurnTimer = null; }
    if (this.ws?.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } })); } catch { /* ignore */ }
      this.ws.close(1000, 'user ended');
    } else {
      this.ws?.close();
    }
    this.ws = null;
    this.cleanupAudio();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.outputGain) this.outputGain.gain.value = muted ? 0 : 1;
  }

  // Send a text message to Gemini Live (e.g. for the AI to start the prompt)
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.setupComplete) return;
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      },
    }));
  }

  private async ensureAudioCtx(): Promise<void> {
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new Ctx();
    }
    if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
    if (!this.outputGain) {
      this.outputGain = this.audioCtx.createGain();
      this.outputGain.gain.value = this.muted ? 0 : 1;
      this.outputGain.connect(this.audioCtx.destination);
    }
  }

  private async connectWithFallback(): Promise<{ ws: WebSocket; model: string }> {
    const models = [this.cfg.model, ...FALLBACK_MODELS].filter((m, i, a) => m && a.indexOf(m) === i);
    let lastError: Error | null = null;
    for (const model of models) {
      try {
        const ws = await this.openSocket(this.cfg.apiKey, model);
        return { ws, model };
      } catch (e) {
        lastError = e as Error;
      }
    }
    throw lastError || new Error('Aucun modèle Live disponible');
  }

  private openSocket(apiKey: string, model: string): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}?key=${encodeURIComponent(apiKey)}`);
      ws.binaryType = 'arraybuffer';
      const timeout = window.setTimeout(() => {
        ws.close();
        reject(new Error('Le WebSocket Gemini Live n\'a pas répondu.'));
      }, 12000);

      ws.onopen = () => {
        ws.send(JSON.stringify({ setup: this.createSetup(model) }));
      };
      ws.onmessage = async (event) => {
        const msg = await this.parseMessage(event.data);
        if (msg.setupComplete) {
          window.clearTimeout(timeout);
          resolve(ws);
        } else if (msg.error) {
          window.clearTimeout(timeout);
          reject(new Error(msg.error.message || 'Erreur Gemini Live'));
        }
      };
      ws.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('Impossible d\'ouvrir le WebSocket Gemini Live'));
      };
      ws.onclose = (event) => {
        if (!event.wasClean && !this.setupComplete) {
          window.clearTimeout(timeout);
          reject(new Error(`Gemini Live a fermé la connexion (${event.code})`));
        }
      };
    });
  }

  private async parseMessage(data: unknown): Promise<Record<string, any>> {
    if (typeof data === 'string') return JSON.parse(data);
    if (data instanceof Blob) return JSON.parse(await data.text());
    if (data instanceof ArrayBuffer) return JSON.parse(new TextDecoder().decode(data));
    throw new Error('Message Gemini illisible');
  }

  private createSetup(model: string) {
    return {
      model: `models/${model}`,
      generationConfig: {
        responseModalities: ['AUDIO'],
        temperature: this.cfg.temperature ?? 0.7,
        maxOutputTokens: 1024,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: this.cfg.voice || 'Sulafat' },
          },
        },
      },
      systemInstruction: {
        parts: [{ text: this.cfg.systemInstruction }],
      },
      realtimeInputConfig: {
        // We handle barge-in manually below; tell Gemini that any user activity
        // can interrupt the model when we forward it (which we only do if we
        // detect a sustained loud user speech while AI is talking).
        activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
        turnCoverage: 'TURN_INCLUDES_ONLY_ACTIVITY',
        automaticActivityDetection: {
          disabled: false,
          // Make Gemini's VAD less twitchy so background noise / echo doesn't
          // truncate the model's own utterances.
          startOfSpeechSensitivity: 'START_SENSITIVITY_LOW',
          endOfSpeechSensitivity: 'END_SENSITIVITY_LOW',
          prefixPaddingMs: 200,
          silenceDurationMs: 1200,
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    };
  }

  private attachHandlers(ws: WebSocket) {
    ws.onmessage = async (event) => {
      const msg = await this.parseMessage(event.data);
      if (msg.setupComplete) return;

      // Genuine model interruption (user spoke and Gemini decided to stop)
      if (msg.serverContent?.interrupted) {
        this.stopScheduledAudio();
        this.outputActive = false;
        this.turnInProgress = false;
        this.endTurnPending = false;
        if (this.endTurnTimer) { window.clearInterval(this.endTurnTimer); this.endTurnTimer = null; }
        if (this.modelAudioStarted) {
          this.modelAudioStarted = false;
          this.cfg.onModelAudioEnd?.();
        }
      }

      // turnComplete = the model is done with this turn. But audio chunks may
      // still be playing — we must wait for the buffer to drain before firing
      // onModelAudioEnd. If no audio was streamed, fire immediately.
      if (msg.serverContent?.turnComplete) {
        this.cfg.onTurnComplete?.();
        this.endTurnPending = true;
        this.scheduleEndOfTurnDrain();
      }

      // User speech transcription (input)
      const inputTranscript = msg.serverContent?.inputTranscription?.text;
      if (inputTranscript) this.cfg.onUserSpeech?.(inputTranscript);

      // Model speech transcription (output)
      const outputTranscript = msg.serverContent?.outputTranscription?.text;
      if (outputTranscript) this.cfg.onModelSpeech?.(outputTranscript);

      const parts = msg.serverContent?.modelTurn?.parts || [];
      parts.forEach((part: { inlineData?: { data?: string }; text?: string }) => {
        const audioBase64 = part.inlineData?.data;
        if (audioBase64) {
          // First audio chunk of this turn → fire onModelAudioStart exactly once
          if (!this.modelAudioStarted) {
            this.modelAudioStarted = true;
            this.turnInProgress = true;
            this.cfg.onModelAudioStart?.();
          }
          this.lastModelAudioAt = Date.now();
          this.playPcmAudio(this.base64ToUint8Array(audioBase64), OUTPUT_RATE);
        }
        if (part.text) this.cfg.onModelSpeech?.(part.text);
      });

      if (msg.error) this.cfg.onError?.(msg.error.message || 'Erreur Gemini Live');
    };

    ws.onerror = () => { if (this.active) this.cfg.onError?.('Erreur WebSocket Gemini Live'); };
    ws.onclose = (event) => {
      if (!this.active) return;
      this.active = false;
      this.cleanupAudio();
      this.cfg.onError?.(event.reason || `Session fermée (${event.code})`);
    };
  }

  // Wait for the playback buffer to fully drain before declaring the turn over.
  // This prevents firing onModelAudioEnd between chunks while the model is still
  // generating, which previously caused the simulation to advance prematurely.
  private scheduleEndOfTurnDrain() {
    if (this.endTurnTimer) return;
    this.endTurnTimer = window.setInterval(() => {
      if (!this.active) {
        if (this.endTurnTimer) { window.clearInterval(this.endTurnTimer); this.endTurnTimer = null; }
        return;
      }
      if (!this.endTurnPending) return;
      // Are all scheduled buffers played out?
      const now = this.audioCtx?.currentTime ?? 0;
      const buffersDone = this.scheduledSources.size === 0 && now >= this.playbackTime - 0.05;
      // Also require a small grace period since the last received audio chunk,
      // so we don't accidentally end the turn while a chunk is mid-flight.
      const sinceLastAudio = Date.now() - this.lastModelAudioAt;
      const audioGraceMs = 250;
      if (buffersDone && sinceLastAudio >= audioGraceMs) {
        if (this.endTurnTimer) { window.clearInterval(this.endTurnTimer); this.endTurnTimer = null; }
        this.endTurnPending = false;
        this.outputActive = false;
        this.turnInProgress = false;
        if (this.modelAudioStarted) {
          this.modelAudioStarted = false;
          this.cfg.onModelAudioEnd?.();
        } else {
          // No audio was streamed at all (e.g. text-only response or empty turn)
          this.cfg.onModelAudioEnd?.();
        }
      }
    }, 80);
  }

  private async startMic() {
    if (!this.audioCtx) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.stream = stream;
    const source = this.audioCtx.createMediaStreamSource(stream);
    const processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.inputSource = source;
    this.inputProcessor = processor;

    processor.onaudioprocess = (event) => {
      const ws = this.ws;
      if (!this.active || !ws || ws.readyState !== WebSocket.OPEN || !this.setupComplete) return;
      const samples = event.inputBuffer.getChannelData(0);
      const rms = this.getRms(samples);
      this.cfg.onUserSpeechActivity?.(Math.min(1, rms * 4));

      // Barge-in protection: while the AI is speaking, we suppress mic forwarding
      // unless the user is genuinely loud for a sustained period (~250 ms). A
      // short blip from background noise / room echo of the AI itself must NOT
      // be forwarded — otherwise Gemini's VAD interprets it as user speech and
      // truncates the model audio mid-sentence (the original bug).
      const aiTalking = this.outputActive || this.turnInProgress || this.endTurnPending;
      if (aiTalking) {
        const LOUD = 0.18;
        const SUSTAINED_MS = 250;
        const now = Date.now();
        if (rms >= LOUD) {
          if (this.loudInputStartedAt === 0) this.loudInputStartedAt = now;
          // Only forward if loud has been sustained long enough → genuine barge-in
          if (now - this.loudInputStartedAt < SUSTAINED_MS) return;
        } else {
          this.loudInputStartedAt = 0;
          return; // not loud → don't forward while AI is talking
        }
      } else {
        this.loudInputStartedAt = 0;
      }

      const pcm16 = this.floatTo16kPcm(samples, this.audioCtx!.sampleRate);
      if (!pcm16.length) return;
      ws.send(JSON.stringify({
        realtimeInput: {
          audio: {
            data: this.uint8ToBase64(new Uint8Array(pcm16.buffer)),
            mimeType: `audio/pcm;rate=${INPUT_RATE}`,
          },
        },
      }));
    };

    source.connect(processor);
    processor.connect(this.audioCtx.destination);
  }

  private playPcmAudio(bytes: Uint8Array, sampleRate: number) {
    if (!this.audioCtx || !this.outputGain) return;
    const samples = this.pcm16ToFloat(bytes);
    const buffer = this.audioCtx.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputGain);
    this.scheduledSources.add(source);

    const now = this.audioCtx.currentTime;
    const startAt = Math.max(now + 0.05, this.playbackTime || now + 0.05);
    source.start(startAt);
    this.playbackTime = startAt + buffer.duration;
    this.outputActive = true;

    source.onended = () => {
      this.scheduledSources.delete(source);
      // NOTE: We deliberately do NOT fire onModelAudioEnd here. The end of a
      // single chunk does not mean the turn is over — Gemini streams audio in
      // many chunks. The drain logic in scheduleEndOfTurnDrain() handles the
      // real end-of-turn signal once both turnComplete arrives AND all chunks
      // have finished playing.
    };
  }

  private stopScheduledAudio() {
    this.scheduledSources.forEach(s => { try { s.stop(); } catch { /* ignore */ } });
    this.scheduledSources.clear();
    this.playbackTime = 0;
    this.outputActive = false;
    this.endTurnPending = false;
    this.turnInProgress = false;
    if (this.endTurnTimer) { window.clearInterval(this.endTurnTimer); this.endTurnTimer = null; }
  }

  private cleanupAudio() {
    this.inputProcessor?.disconnect();
    this.inputSource?.disconnect();
    this.inputProcessor = null;
    this.inputSource = null;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.stopScheduledAudio();
  }

  // ── helpers ──
  private floatTo16kPcm(float32: Float32Array, sourceRate: number): Int16Array {
    const ratio = sourceRate / INPUT_RATE;
    const length = Math.floor(float32.length / ratio);
    const pcm = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(i * ratio);
      const sample = Math.max(-1, Math.min(1, float32[idx] || 0));
      pcm[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return pcm;
  }
  private pcm16ToFloat(bytes: Uint8Array): Float32Array {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const samples = new Float32Array(bytes.byteLength / 2);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    return samples;
  }
  private getRms(s: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < s.length; i++) sum += s[i] * s[i];
    return Math.sqrt(sum / Math.max(1, s.length));
  }
  private base64ToUint8Array(b: string): Uint8Array {
    const bin = atob(b);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  private uint8ToBase64(bytes: Uint8Array): string {
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    return btoa(bin);
  }
}
