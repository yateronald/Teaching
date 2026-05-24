// Gemini Live WebSocket client for real-time French oral simulation
// Streams microphone audio (16kHz PCM) and plays back AI audio (24kHz PCM)

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

export type LiveStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

export interface LiveCallbacks {
  onStatus?: (status: LiveStatus) => void;
  onTranscript?: (text: string, isFinal: boolean) => void; // student speech
  onAiTranscript?: (text: string) => void; // AI speech (output transcription)
  onError?: (message: string) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onTurnComplete?: () => void;
}

export interface LiveSessionOptions {
  apiKey: string;
  model: string;
  voiceName?: string;
  systemInstruction: string;
  callbacks: LiveCallbacks;
}

export class GeminiLiveSession {
  private ws: WebSocket | null = null;
  private stream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private inputProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private outputGain: GainNode | null = null;
  private scheduledSources: Set<AudioBufferSourceNode> = new Set();
  private playbackTime = 0;
  private outputActive = false;
  private active = false;
  private setupComplete = false;
  private muted = false;
  private opts: LiveSessionOptions;
  private studentTranscript = '';
  private aiTranscript = '';

  constructor(opts: LiveSessionOptions) {
    this.opts = opts;
  }

  async start(): Promise<void> {
    this.opts.callbacks.onStatus?.('connecting');
    this.active = true;
    this.setupComplete = false;
    this.playbackTime = 0;
    this.studentTranscript = '';
    this.aiTranscript = '';

    try {
      this.getAudioContext();
      this.ws = await this.openSocket();
      this.attachHandlers();
      await this.startMic();
      this.opts.callbacks.onStatus?.('listening');
    } catch (err) {
      this.active = false;
      this.cleanup();
      const msg = err instanceof Error ? err.message : 'Connection failed';
      this.opts.callbacks.onError?.(msg);
      this.opts.callbacks.onStatus?.('error');
      throw err;
    }
  }

  stop(): void {
    this.active = false;
    this.setupComplete = false;
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } }));
      } catch { /* ignore */ }
      this.ws.close(1000, 'session ended');
    }
    this.ws = null;
    this.cleanup();
    this.opts.callbacks.onStatus?.('idle');
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.outputGain) this.outputGain.gain.value = muted ? 0 : 1;
  }

  // Send a text message into the live session (e.g. greetings, instructions)
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.setupComplete) return;
    this.ws.send(JSON.stringify({
      clientContent: {
        turns: [{ role: 'user', parts: [{ text }] }],
        turnComplete: true,
      },
    }));
  }

  // Inject a system message that the AI should respond to
  triggerAIMessage(instruction: string): void {
    this.sendText(instruction);
  }

  getStudentTranscript(): string {
    return this.studentTranscript;
  }

  getAiTranscript(): string {
    return this.aiTranscript;
  }

  // ── Internals ──

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new Ctx();
    }
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    if (!this.outputGain) {
      this.outputGain = this.audioCtx.createGain();
      this.outputGain.gain.value = this.muted ? 0 : 1;
      this.outputGain.connect(this.audioCtx.destination);
    }
    return this.audioCtx;
  }

  private async openSocket(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}?key=${encodeURIComponent(this.opts.apiKey)}`);
      ws.binaryType = 'arraybuffer';
      const timeout = window.setTimeout(() => {
        ws.close();
        reject(new Error('Gemini Live did not respond.'));
      }, 15000);

      ws.onopen = () => {
        ws.send(JSON.stringify({ setup: this.createSetup() }));
      };

      ws.onmessage = async (event) => {
        const msg = await this.parseMessage(event.data);
        if (msg.setupComplete) {
          window.clearTimeout(timeout);
          this.setupComplete = true;
          resolve(ws);
        } else if (msg.error) {
          window.clearTimeout(timeout);
          reject(new Error(msg.error.message || 'Gemini Live error'));
        }
      };

      ws.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error('WebSocket connection failed'));
      };

      ws.onclose = (event) => {
        if (!event.wasClean && !this.setupComplete) {
          window.clearTimeout(timeout);
          reject(new Error(`Connection closed (${event.code})`));
        }
      };
    });
  }

  private async parseMessage(data: unknown): Promise<{ setupComplete?: boolean; error?: { message: string }; serverContent?: { interrupted?: boolean; turnComplete?: boolean; modelTurn?: { parts: { inlineData?: { data: string }; text?: string }[] }; outputTranscription?: { text: string }; inputTranscription?: { text: string } }; goAway?: { timeLeft: string } }> {
    if (typeof data === 'string') return JSON.parse(data);
    if (data instanceof Blob) return JSON.parse(await data.text());
    if (data instanceof ArrayBuffer) return JSON.parse(new TextDecoder().decode(data));
    throw new Error('Unreadable WebSocket message');
  }

  private createSetup() {
    return {
      model: `models/${this.opts.model}`,
      generationConfig: {
        responseModalities: ['AUDIO'],
        temperature: 0.7,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: this.opts.voiceName || 'Sulafat' },
          },
          languageCode: 'fr-FR',
        },
      },
      systemInstruction: {
        parts: [{ text: this.opts.systemInstruction }],
      },
      realtimeInputConfig: {
        activityHandling: 'START_OF_ACTIVITY_INTERRUPTS',
        turnCoverage: 'TURN_INCLUDES_ONLY_ACTIVITY',
        automaticActivityDetection: {
          disabled: false,
          startOfSpeechSensitivity: 'START_SENSITIVITY_HIGH',
          endOfSpeechSensitivity: 'END_SENSITIVITY_HIGH',
          prefixPaddingMs: 80,
          silenceDurationMs: 600,
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    };
  }

  private attachHandlers(): void {
    if (!this.ws) return;
    this.ws.onmessage = async (event) => {
      const msg = await this.parseMessage(event.data);
      if (msg.setupComplete) return;

      if (msg.serverContent?.interrupted) {
        this.stopScheduledAudio();
        this.opts.callbacks.onStatus?.('listening');
      }

      if (msg.serverContent?.turnComplete) {
        if (!this.outputActive) this.opts.callbacks.onStatus?.('listening');
        this.opts.callbacks.onTurnComplete?.();
      }

      // Input transcription = student speech
      if (msg.serverContent?.inputTranscription?.text) {
        const t = msg.serverContent.inputTranscription.text;
        this.studentTranscript += t;
        this.opts.callbacks.onTranscript?.(t, false);
      }

      // Output transcription = AI speech
      if (msg.serverContent?.outputTranscription?.text) {
        const t = msg.serverContent.outputTranscription.text;
        this.aiTranscript += t;
        this.opts.callbacks.onAiTranscript?.(t);
      }

      const parts = msg.serverContent?.modelTurn?.parts || [];
      parts.forEach((part) => {
        if (part.inlineData?.data) {
          this.opts.callbacks.onStatus?.('speaking');
          this.opts.callbacks.onSpeakingChange?.(true);
          this.playPcm(this.base64ToBytes(part.inlineData.data), OUTPUT_RATE);
        }
      });

      if (msg.error) {
        this.opts.callbacks.onError?.(msg.error.message || 'Gemini error');
        this.opts.callbacks.onStatus?.('error');
      }
    };

    this.ws.onerror = () => {
      if (!this.active) return;
      this.opts.callbacks.onError?.('Socket error');
      this.opts.callbacks.onStatus?.('error');
    };

    this.ws.onclose = (event) => {
      if (!this.active) return;
      this.active = false;
      this.cleanup();
      this.opts.callbacks.onError?.(event.reason || `Session closed (${event.code})`);
      this.opts.callbacks.onStatus?.('idle');
    };
  }

  private async startMic(): Promise<void> {
    const ctx = this.getAudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.stream = stream;
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    this.inputSource = source;
    this.inputProcessor = processor;

    processor.onaudioprocess = (event) => {
      const ws = this.ws;
      if (!this.active || !ws || ws.readyState !== WebSocket.OPEN || !this.setupComplete) return;
      const samples = event.inputBuffer.getChannelData(0);

      // If AI is speaking, only send if user interrupts (RMS > threshold)
      const rms = this.getRms(samples);
      const isInterrupting = this.outputActive && rms > 0.085;
      if (this.outputActive && !isInterrupting) return;

      const pcm16 = this.floatTo16kPcm(samples, ctx.sampleRate);
      if (!pcm16.length) return;
      ws.send(JSON.stringify({
        realtimeInput: {
          audio: {
            data: this.bytesToBase64(new Uint8Array(pcm16.buffer)),
            mimeType: `audio/pcm;rate=${INPUT_RATE}`,
          },
        },
      }));
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  }

  private playPcm(bytes: Uint8Array, sampleRate: number): void {
    const ctx = this.getAudioContext();
    const samples = this.pcm16ToFloat(bytes);
    const buffer = ctx.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    if (this.outputGain) source.connect(this.outputGain);
    this.scheduledSources.add(source);
    const now = ctx.currentTime;
    const startAt = Math.max(now + 0.05, this.playbackTime || now + 0.05);
    source.start(startAt);
    this.playbackTime = startAt + buffer.duration;
    this.outputActive = true;

    source.onended = () => {
      this.scheduledSources.delete(source);
      // After a delay, mark output as inactive
      window.setTimeout(() => {
        if (ctx.currentTime >= this.playbackTime - 0.1 && this.scheduledSources.size === 0) {
          this.outputActive = false;
          this.opts.callbacks.onSpeakingChange?.(false);
          if (this.active) this.opts.callbacks.onStatus?.('listening');
        }
      }, 200);
    };
  }

  private stopScheduledAudio(): void {
    this.scheduledSources.forEach((s) => { try { s.stop(); } catch { /* ignore */ } });
    this.scheduledSources.clear();
    this.playbackTime = 0;
    this.outputActive = false;
    this.opts.callbacks.onSpeakingChange?.(false);
  }

  private cleanup(): void {
    try { this.inputProcessor?.disconnect(); } catch { /* ignore */ }
    try { this.inputSource?.disconnect(); } catch { /* ignore */ }
    this.inputProcessor = null;
    this.inputSource = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.stopScheduledAudio();
  }

  // ── Audio utilities ──

  private floatTo16kPcm(input: Float32Array, sourceRate: number): Int16Array {
    const ratio = sourceRate / INPUT_RATE;
    const length = Math.floor(input.length / ratio);
    const pcm = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(i * ratio);
      const s = Math.max(-1, Math.min(1, input[idx] || 0));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm;
  }

  private pcm16ToFloat(bytes: Uint8Array): Float32Array {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const samples = new Float32Array(bytes.byteLength / 2);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = view.getInt16(i * 2, true) / 32768;
    }
    return samples;
  }

  private getRms(samples: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    return Math.sqrt(sum / Math.max(1, samples.length));
  }

  private base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }
}
