// Audio for the oral exam: one ExamAudio per simulation (microphone, recording,
// playback), one LiveExaminer per task connection (Gemini Live over a
// single-use credential issued by our backend — the API key never reaches the
// browser). The exchange is kept robust by: a steady audio stream (one frame
// every 80 ms, always), a playback buffer against late chunks, a microphone
// guarded against the examiner's own voice for its whole turn, and safety nets
// for a stalled microphone, a lost end of turn and an unanswered candidate.
import type { DialogueTurn } from './examModel';
import { FRAME_MS, NoiseGate, VoiceDetector, type RoomReport } from './voiceDetector';

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const FRAME = 1280; // 80 ms at 16 kHz

// Downsamples the microphone to 16 kHz with a box filter (anti-aliasing) and
// posts 80 ms Int16 frames with their RMS level.
const WORKLET = `
class XsDownsampler extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / ${INPUT_RATE}; this.acc = 0; this.sum = 0; this.cnt = 0; this.sq = 0; this.sqn = 0; this.peak = 0; this.buf = new Int16Array(${FRAME}); this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      const v = ch[i];
      this.sum += v; this.cnt++; this.acc += 1; this.sq += v * v; this.sqn++;
      const a = v < 0 ? -v : v; if (a > this.peak) this.peak = a;
      if (this.acc >= this.ratio) {
        this.acc -= this.ratio;
        const s = Math.max(-1, Math.min(1, this.sum / this.cnt));
        this.sum = 0; this.cnt = 0;
        this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        if (this.n === this.buf.length) {
          this.port.postMessage({ pcm: this.buf.slice(0), rms: Math.sqrt(this.sq / Math.max(1, this.sqn)), peak: this.peak });
          this.n = 0; this.sq = 0; this.sqn = 0; this.peak = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('xs-downsampler', XsDownsampler);
`;

/** `voiced`: the frame carries the candidate's voice (see VoiceDetector). */
type FrameListener = (pcm: Int16Array, rms: number, voiced: boolean) => void;

/** Frames above the barge-in level needed before the candidate counts as talking over the examiner. */
const BARGE_IN_FRAMES = 4; // 320 ms
/**
 * The examiner's voice reaches the browser in chunks, sometimes faster than it
 * plays, sometimes late (measured: up to 0.3 s behind on the Developer API).
 * The first chunk of a turn waits this long so the next ones arrive in time;
 * after a cut, the wait grows (up to MAX_BUFFER) for the rest of the exam.
 */
const START_BUFFER = 0.25;
const MAX_BUFFER = 0.6;
/** After the examiner's last sound, the room still echoes it: the microphone stays guarded this long. */
const ECHO_TAIL = 0.35;
/** To talk over the examiner, the candidate must be this much louder than the examiner's echo (≈ +5 dB). */
const ECHO_MARGIN = 1.8;

export class ExamAudio {
  ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private node: AudioWorkletNode | ScriptProcessorNode | null = null;
  private sink: GainNode | null = null;
  private out: GainNode | null = null;
  private listeners = new Set<FrameListener>();
  private recording: Int16Array[] | null = null;
  private playing = new Set<AudioBufferSourceNode>();
  private playhead = 0;
  private loudFrames = 0;
  private buffer = START_BUFFER;
  /** Something of the current examiner turn has been scheduled: a chunk finding nothing queued is a cut. */
  private turnStarted = false;
  /** How loud the examiner's voice comes back through the microphone (decays between turns). */
  private echoLevel = 0;
  /** Set by LiveExaminer while the examiner holds the floor, from its first sound to the end of its turn. */
  examinerTurn = false;
  /** Cuts in the examiner's voice so far (each one made the buffer longer). */
  underruns = 0;
  level = 0;
  /** Learns the room and the candidate's voice; calibrated by the device check. */
  readonly detector = new VoiceDetector();

  /** Must be called from a user gesture (click): creates the context and opens the microphone. */
  async open(): Promise<void> {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    // The browser may pause the audio (another app takes the sound, a headset is
    // plugged in): take it back at once, or the examiner would stop hearing the candidate.
    this.ctx.onstatechange = () => this.resume();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.sink = this.ctx.createGain();
    this.sink.gain.value = 0;
    this.sink.connect(this.ctx.destination);
    this.out = this.ctx.createGain();
    this.out.connect(this.ctx.destination);

    const onFrame = (pcm: Int16Array, rms: number, peak: number) => {
      this.level = rms;
      let voiced: boolean;
      let examinerOnly = false;
      if (this.guarded) {
        // The examiner holds the floor: the microphone may hear them through the
        // speakers, including in the short gaps between their chunks and in the
        // room's echo after their last word. Only a sustained voice close to the
        // candidate's own level, and clearly above that echo, counts as the
        // candidate talking over them; the room and the echo do not teach the
        // detector anything.
        const threshold = Math.max(this.detector.bargeInLevel, this.echoLevel * ECHO_MARGIN);
        if (rms >= threshold) {
          this.loudFrames++;
        } else {
          this.loudFrames = 0;
          this.echoLevel = Math.max(rms, this.echoLevel * 0.97);
        }
        voiced = this.loudFrames >= BARGE_IN_FRAMES;
        examinerOnly = !voiced;
      } else {
        this.echoLevel *= 0.9;
        this.loudFrames = 0;
        voiced = this.detector.push(rms, peak);
      }
      // The recording is the candidate's voice only: while the examiner speaks
      // (and the candidate does not), it holds silence, so the examiner's voice
      // leaking from the speakers is never judged as the candidate's.
      if (this.recording) this.recording.push(examinerOnly ? new Int16Array(pcm.length) : pcm);
      this.listeners.forEach(l => l(pcm, rms, voiced));
    };
    if (this.ctx.audioWorklet) {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
      try { await this.ctx.audioWorklet.addModule(url); } finally { URL.revokeObjectURL(url); }
      const node = new AudioWorkletNode(this.ctx, 'xs-downsampler');
      node.port.onmessage = (e) => onFrame(e.data.pcm as Int16Array, e.data.rms as number, (e.data.peak as number) || 0);
      this.node = node;
    } else {
      // Older browsers: same filter on the main thread.
      const proc = this.ctx.createScriptProcessor(4096, 1, 1);
      const ratio = this.ctx.sampleRate / INPUT_RATE;
      let acc = 0, sum = 0, cnt = 0;
      let buf = new Int16Array(FRAME), n = 0, sq = 0, sqn = 0, peak = 0;
      proc.onaudioprocess = (ev) => {
        const ch = ev.inputBuffer.getChannelData(0);
        for (let i = 0; i < ch.length; i++) {
          sum += ch[i]; cnt++; acc += 1; sq += ch[i] * ch[i]; sqn++;
          peak = Math.max(peak, Math.abs(ch[i]));
          if (acc >= ratio) {
            acc -= ratio;
            const s = Math.max(-1, Math.min(1, sum / cnt)); sum = 0; cnt = 0;
            buf[n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
            if (n === FRAME) { onFrame(buf, Math.sqrt(sq / sqn), peak); buf = new Int16Array(FRAME); n = 0; sq = 0; sqn = 0; peak = 0; }
          }
        }
      };
      this.node = proc;
    }
    // Before the 16 kHz downsampling: a high-pass removes rumble and hum (air
    // conditioning, traffic, a knock on the desk) that carries no speech, and a
    // low-pass keeps sibilants from folding back as noise (anti-aliasing).
    const highPass = this.ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 85;
    const lowPass = this.ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 7000;
    this.source.connect(highPass).connect(lowPass).connect(this.node);
    this.node.connect(this.sink);
  }

  get ready() { return !!this.ctx && !!this.stream; }

  onFrame(listener: FrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  startRecording() {
    this.recording = [];
    this.detector.resetCounts();
  }

  /** The recording conditions measured so far (noise, voice, saturation). */
  roomReport(): RoomReport { return this.detector.report(); }

  /** Stops recording and returns a 16 kHz mono WAV, or null if nothing was captured. */
  stopRecording(): Blob | null {
    const chunks = this.recording;
    this.recording = null;
    if (!chunks || !chunks.length) return null;
    return encodeWav(chunks, INPUT_RATE);
  }

  /** The examiner's voice is audible (queued audio, then the room's echo for a moment). */
  get speaking() {
    const ctx = this.ctx;
    // A paused audio context plays nothing (and its clock stands still).
    if (!ctx || ctx.state !== 'running') return false;
    return ctx.currentTime < this.playhead + ECHO_TAIL;
  }

  /** The microphone is guarded against the examiner's voice: while it is audible, and for its whole turn. */
  get guarded() { return this.speaking || this.examinerTurn; }

  play(pcm: Uint8Array) {
    if (!this.ctx || !this.out) return;
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    const samples = new Float32Array(pcm.byteLength / 2);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    const buffer = this.ctx.createBuffer(1, samples.length, OUTPUT_RATE);
    buffer.copyToChannel(samples, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.out);
    const now = this.ctx.currentTime;
    let at = this.playhead;
    if (at < now + 0.02) {
      // Nothing queued: either a new turn starts, or the voice fell behind (a
      // cut). Either way, let a little audio build up before playing again;
      // after a cut, a little more for the rest of the exam.
      if (this.turnStarted) {
        this.underruns++;
        this.buffer = Math.min(MAX_BUFFER, this.buffer + 0.1);
      }
      at = now + this.buffer;
    }
    this.turnStarted = true;
    src.start(at);
    this.playhead = at + buffer.duration;
    this.playing.add(src);
    src.onended = () => this.playing.delete(src);
  }

  /** The examiner's turn is over: the next chunk starts a new turn (not a cut). */
  endTurn() {
    this.turnStarted = false;
  }

  stopPlayback() {
    this.playing.forEach(s => { try { s.stop(); } catch { /* already stopped */ } });
    this.playing.clear();
    this.playhead = 0;
    this.turnStarted = false;
  }

  /** Brings the audio back after the browser paused it (device change, phone call, tab in the background). */
  resume() {
    if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') this.ctx.resume().catch(() => {});
  }

  /** A short two-note chime to check the speakers. */
  chime() {
    if (!this.ctx || !this.out) return;
    const t = this.ctx.currentTime;
    [660, 880].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, t + i * 0.22);
      g.gain.linearRampToValueAtTime(0.18, t + i * 0.22 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.22 + 0.4);
      osc.connect(g).connect(this.out!);
      osc.start(t + i * 0.22);
      osc.stop(t + i * 0.22 + 0.45);
    });
  }

  close() {
    this.stopPlayback();
    this.listeners.clear();
    this.recording = null;
    try { this.node?.disconnect(); this.source?.disconnect(); } catch { /* ignore */ }
    this.stream?.getTracks().forEach(t => t.stop());
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.stream = null;
  }
}

function encodeWav(chunks: Int16Array[], rate: number): Blob {
  const samples = chunks.reduce((n, c) => n + c.length, 0);
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + samples * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, samples * 2, true);
  let off = 44;
  chunks.forEach(c => { for (let i = 0; i < c.length; i++, off += 2) v.setInt16(off, c[i], true); });
  return new Blob([buf], { type: 'audio/wav' });
}

const toBase64 = (bytes: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
};
const fromBase64 = (b64: string) => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

/** What the Live API sends back (only the fields used here). */
interface LiveMessage {
  setupComplete?: unknown;
  error?: { message?: string };
  toolCall?: { functionCalls?: { id?: string; name?: string; args?: { raison?: string } }[] };
  serverContent?: {
    interrupted?: boolean;
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
    modelTurn?: { parts?: { inlineData?: { data?: string } }[] };
    turnComplete?: boolean;
  };
}

export interface LiveCallbacks {
  onExaminerSpeaking?: (speaking: boolean) => void;
  onTurnComplete?: () => void;
  onTranscript?: (turns: DialogueTurn[]) => void;
  /** The examiner called the end-of-task tool: the candidate confirmed they have finished. */
  onEndRequested?: (reason: string) => void;
  onClose?: (unexpected: boolean, reason: string) => void;
  /** The microphone stopped (true) or started again (false) delivering sound. */
  onMicStall?: (stalled: boolean) => void;
}

/**
 * `silenceMs`: the silence after which the server ends the candidate's turn (set with the session).
 * `askRepeat`: an unanswered utterance makes the examiner ask the candidate to repeat (dialogue tasks;
 * not in a monologue, where a long pause is the candidate thinking).
 */
export interface LiveTools { tools?: unknown[]; endTool?: string; silenceMs?: number; askRepeat?: boolean }

// ── Safety nets of the exchange (measured on both engines, see EOExam) ──
/** No microphone frame for this long: the stream is kept going with silence, and the audio woken up. */
const STALL_MS = 400;
/** The examiner's turn is taken as over when nothing of it has come for this long and nothing plays. */
const STUCK_TURN_MS = 6000;
/** A candidate utterance at least this long that the examiner leaves unanswered… */
const UTTERANCE_MS = 800;
/** …is handed over to the examiner (end of the audio stream) this long after the server's own end-of-turn silence… */
const FLUSH_AFTER_MS = 2500;
/** …and, still unanswered after this long, the examiner asks the candidate to repeat. */
const REPEAT_AFTER_MS = 9000;
/** Cue for that last case (cf. backend/services/eoExaminer.js). */
export const INAUDIBLE_CUE = '[INAUDIBLE]';

/** One Gemini Live connection for one task. */
export class LiveExaminer {
  private ws: WebSocket | null = null;
  private unsubscribe: (() => void) | null = null;
  private closing = false;
  private speaking = false;
  private turnDone = false;
  private held = false;
  private drainTimer: number | null = null;
  private watchTimer: number | null = null;
  private gate = new NoiseGate();
  private silenceMs = 1500;
  private askRepeat = true;
  private lastSentAt = 0;
  private lastExaminerAt = 0;
  /** The candidate's voice since the examiner last spoke, and when it was last heard. */
  private utteranceMs = 0;
  private voiceAt = 0;
  private flushed = false;
  private reprompted = false;
  private stalled = false;
  /** When the platform last sent the examiner a cue (EOExam spaces its own cues from it). */
  lastCueAt = 0;
  turns: DialogueTurn[] = [];
  private audio: ExamAudio;
  private cb: LiveCallbacks;

  constructor(audio: ExamAudio, cb: LiveCallbacks = {}) {
    this.audio = audio;
    this.cb = cb;
  }

  private endTool = '';

  connect(token: string, wsUrl: string, model: string, options: LiveTools = {}): Promise<void> {
    this.endTool = options.endTool || '';
    if (options.silenceMs) this.silenceMs = options.silenceMs;
    this.askRepeat = options.askRepeat !== false;
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${wsUrl}?access_token=${encodeURIComponent(token)}`);
      ws.binaryType = 'arraybuffer';
      let settled = false;
      const timeout = window.setTimeout(() => { if (!settled) { settled = true; ws.close(); reject(new Error('La connexion avec l’examinateur a expiré.')); } }, 15000);
      // Instructions and voice are locked in the token; only the tool declaration travels here.
      ws.onopen = () => ws.send(JSON.stringify({ setup: { model: `models/${model}`, ...(options.tools?.length ? { tools: options.tools } : {}) } }));
      ws.onmessage = async (event) => {
        const msg = await parse(event.data);
        if (!msg) return;
        if (msg.setupComplete && !settled) {
          settled = true;
          window.clearTimeout(timeout);
          this.ws = ws;
          this.lastSentAt = Date.now();
          this.unsubscribe = this.audio.onFrame((pcm, _rms, voiced) => this.forward(pcm, voiced));
          this.watchTimer = window.setInterval(() => this.watch(), 100);
          resolve();
          return;
        }
        if (msg.error && !settled) { settled = true; window.clearTimeout(timeout); reject(new Error(msg.error.message || 'Erreur de l’examinateur')); return; }
        this.handle(msg);
      };
      ws.onerror = () => { if (!settled) { settled = true; window.clearTimeout(timeout); reject(new Error('Impossible de joindre l’examinateur.')); } };
      ws.onclose = (e) => {
        if (!settled) { settled = true; window.clearTimeout(timeout); reject(new Error(`Connexion refusée (${e.code}).`)); return; }
        this.cleanup();
        this.cb.onClose?.(!this.closing, e.reason || String(e.code));
      };
    });
  }

  /** System messages (e.g. [DÉBUT], [SILENCE]) — the examiner is told they never come from the candidate. */
  sendText(text: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ realtimeInput: { text } }));
    this.lastCueAt = Date.now();
  }

  /**
   * Time is up: the examiner hears silence instead of the candidate, so a last
   * word cannot cut the closing sentence, and the model, hearing the turn end,
   * answers [FIN] within a couple of seconds. (Stopping the audio, or ending the
   * stream, leaves the model waiting: it never answers.) The recording for the
   * evaluation goes on until the task closes.
   */
  holdCandidate() {
    this.held = true;
  }

  close() {
    this.closing = true;
    if (this.ws?.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } })); } catch { /* ignore */ }
      this.ws.close(1000, 'task over');
    }
    this.cleanup();
    this.audio.stopPlayback();
  }

  private cleanup() {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.drainTimer) { window.clearInterval(this.drainTimer); this.drainTimer = null; }
    if (this.watchTimer) { window.clearInterval(this.watchTimer); this.watchTimer = null; }
    if (this.speaking) { this.speaking = false; this.cb.onExaminerSpeaking?.(false); }
    this.audio.examinerTurn = false;
    if (this.stalled) { this.stalled = false; this.cb.onMicStall?.(false); }
    this.ws = null;
  }

  /**
   * One frame goes out for every frame of the microphone, always: the
   * examiner's end-of-turn detection needs a steady stream. (Measured on both
   * engines: when the stream stops after the candidate's question, the examiner
   * never answers; as soon as silence flows again, it does.)
   */
  private forward(pcm: Int16Array, voiced: boolean) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const t = Date.now();
    this.lastSentAt = t;
    if (this.stalled) { this.stalled = false; this.cb.onMicStall?.(false); }
    if (this.held) { this.sendAudio(ws, new Int16Array(pcm.length)); return; }
    // While the examiner holds the floor, only the candidate talking over them
    // goes through (ExamAudio decides: sustained, close to their own voice, above
    // the echo); everything else is silence, so the examiner's own voice coming
    // back through the microphone never cuts them off.
    if ((this.speaking || this.audio.guarded) && !voiced) {
      this.gate = new NoiseGate();
      this.sendAudio(ws, new Int16Array(pcm.length));
      return;
    }
    // Otherwise the room between the candidate's words is sent as silence: the
    // examiner hears a clean pause and answers on time, even in a noisy room.
    const frame = this.gate.push(pcm, voiced) || new Int16Array(pcm.length);
    if (voiced) {
      if (!this.utteranceMs) { this.flushed = false; this.reprompted = false; }
      this.utteranceMs += FRAME_MS;
      this.voiceAt = t;
    }
    this.sendAudio(ws, frame);
  }

  /** Every 100 ms: the safety nets that keep the exchange going. */
  private watch() {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const t = Date.now();

    // The microphone stopped delivering frames (audio paused by the browser,
    // device unplugged): silence keeps the stream going, so the examiner still
    // hears the end of the candidate's turn, and the audio is woken up.
    const gap = t - this.lastSentAt;
    if (gap > STALL_MS) {
      const missing = Math.min(12, Math.floor(gap / FRAME_MS));
      for (let i = 0; i < missing; i++) this.sendAudio(ws, new Int16Array(FRAME));
      this.lastSentAt = t;
      this.audio.resume();
      if (!this.stalled) { this.stalled = true; this.cb.onMicStall?.(true); }
    }

    // A turn of the examiner whose end never came (a lost message): the
    // candidate gets the floor back instead of being muted for good.
    if (this.speaking && !this.turnDone && !this.audio.speaking && t - this.lastExaminerAt > STUCK_TURN_MS) {
      this.turnDone = true;
      this.audio.endTurn();
      this.waitForDrain();
    }

    // The candidate spoke, then stopped, and the examiner has not answered:
    // first the end of their turn is handed over explicitly (the server answers
    // within seconds), then the examiner asks them to repeat.
    if (this.utteranceMs >= UTTERANCE_MS && !this.speaking && !this.audio.guarded && !this.held) {
      const quiet = t - this.voiceAt;
      if (!this.flushed && quiet > this.silenceMs + FLUSH_AFTER_MS) {
        this.flushed = true;
        ws.send(JSON.stringify({ realtimeInput: { audioStreamEnd: true } })); // the next frame opens the stream again
      }
      if (this.askRepeat && !this.reprompted && quiet > REPEAT_AFTER_MS) {
        this.reprompted = true;
        this.sendText(INAUDIBLE_CUE);
      }
    }
  }

  private sendAudio(ws: WebSocket, frame: Int16Array) {
    ws.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(new Uint8Array(frame.buffer, frame.byteOffset, frame.byteLength)), mimeType: `audio/pcm;rate=${INPUT_RATE}` } } }));
  }

  private append(role: DialogueTurn['role'], text: string) {
    if (!text) return;
    const last = this.turns[this.turns.length - 1];
    if (last && last.role === role) last.text = (last.text + text).replace(/\s+/g, ' ');
    else this.turns.push({ role, text: text.replace(/\s+/g, ' ').trimStart() });
    this.cb.onTranscript?.(this.turns);
  }

  private handle(msg: LiveMessage) {
    const calls = msg.toolCall?.functionCalls || [];
    if (calls.length) {
      // Always answer the call, or the model keeps waiting for it.
      this.ws?.send(JSON.stringify({ toolResponse: { functionResponses: calls.map(c => ({ id: c.id, name: c.name, response: { result: 'ok' } })) } }));
      const end = calls.find(c => c.name === this.endTool);
      if (end) this.cb.onEndRequested?.(String(end.args?.raison || ''));
    }
    const sc = msg.serverContent;
    if (!sc) return;
    if (sc.interrupted) {
      this.audio.stopPlayback();
      this.setSpeaking(false);
    }
    if (sc.inputTranscription?.text) this.append('candidate', sc.inputTranscription.text);
    if (sc.outputTranscription?.text) this.append('examiner', sc.outputTranscription.text);
    (sc.modelTurn?.parts || []).forEach(p => {
      if (p.inlineData?.data) {
        // The examiner answers: what the candidate said has been heard.
        this.lastExaminerAt = Date.now();
        this.utteranceMs = 0;
        this.turnDone = false;
        this.setSpeaking(true);
        this.audio.play(fromBase64(p.inlineData.data));
      }
    });
    if (sc.turnComplete) {
      this.turnDone = true;
      this.audio.endTurn();
      this.waitForDrain();
    }
  }

  private setSpeaking(on: boolean) {
    this.audio.examinerTurn = on;
    if (this.speaking === on) return;
    this.speaking = on;
    this.cb.onExaminerSpeaking?.(on);
  }

  /** The examiner's turn ends when the model says so AND the last audio chunk has played. */
  private waitForDrain() {
    if (this.drainTimer) return;
    this.drainTimer = window.setInterval(() => {
      if (!this.turnDone || this.audio.speaking) return;
      if (this.drainTimer) { window.clearInterval(this.drainTimer); this.drainTimer = null; }
      this.turnDone = false;
      this.setSpeaking(false);
      this.cb.onTurnComplete?.();
    }, 90);
  }
}

async function parse(data: unknown): Promise<LiveMessage | null> {
  try {
    if (typeof data === 'string') return JSON.parse(data);
    if (data instanceof Blob) return JSON.parse(await data.text());
    if (data instanceof ArrayBuffer) return JSON.parse(new TextDecoder().decode(data));
  } catch { /* ignore malformed frames */ }
  return null;
}
