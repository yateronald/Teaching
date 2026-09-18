// Audio for the oral exam: one ExamAudio per simulation (microphone, recording,
// playback), one LiveExaminer per task connection (Gemini Live over an
// ephemeral token issued by our backend — the API key never reaches the browser).
import type { DialogueTurn } from './examModel';

const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const FRAME = 1280; // 80 ms at 16 kHz

// Downsamples the microphone to 16 kHz with a box filter (anti-aliasing) and
// posts 80 ms Int16 frames with their RMS level.
const WORKLET = `
class XsDownsampler extends AudioWorkletProcessor {
  constructor() { super(); this.ratio = sampleRate / ${INPUT_RATE}; this.acc = 0; this.sum = 0; this.cnt = 0; this.sq = 0; this.sqn = 0; this.buf = new Int16Array(${FRAME}); this.n = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (let i = 0; i < ch.length; i++) {
      const v = ch[i];
      this.sum += v; this.cnt++; this.acc += 1; this.sq += v * v; this.sqn++;
      if (this.acc >= this.ratio) {
        this.acc -= this.ratio;
        const s = Math.max(-1, Math.min(1, this.sum / this.cnt));
        this.sum = 0; this.cnt = 0;
        this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
        if (this.n === this.buf.length) {
          this.port.postMessage({ pcm: this.buf.slice(0), rms: Math.sqrt(this.sq / Math.max(1, this.sqn)) });
          this.n = 0; this.sq = 0; this.sqn = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('xs-downsampler', XsDownsampler);
`;

type FrameListener = (pcm: Int16Array, rms: number) => void;

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
  level = 0;

  /** Must be called from a user gesture (click): creates the context and opens the microphone. */
  async open(): Promise<void> {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    this.source = this.ctx.createMediaStreamSource(this.stream);
    this.sink = this.ctx.createGain();
    this.sink.gain.value = 0;
    this.sink.connect(this.ctx.destination);
    this.out = this.ctx.createGain();
    this.out.connect(this.ctx.destination);

    const onFrame = (pcm: Int16Array, rms: number) => {
      this.level = rms;
      if (this.recording) this.recording.push(pcm);
      this.listeners.forEach(l => l(pcm, rms));
    };
    if (this.ctx.audioWorklet) {
      const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
      try { await this.ctx.audioWorklet.addModule(url); } finally { URL.revokeObjectURL(url); }
      const node = new AudioWorkletNode(this.ctx, 'xs-downsampler');
      node.port.onmessage = (e) => onFrame(e.data.pcm as Int16Array, e.data.rms as number);
      this.node = node;
    } else {
      // Older browsers: same filter on the main thread.
      const proc = this.ctx.createScriptProcessor(4096, 1, 1);
      const ratio = this.ctx.sampleRate / INPUT_RATE;
      let acc = 0, sum = 0, cnt = 0;
      let buf = new Int16Array(FRAME), n = 0, sq = 0, sqn = 0;
      proc.onaudioprocess = (ev) => {
        const ch = ev.inputBuffer.getChannelData(0);
        for (let i = 0; i < ch.length; i++) {
          sum += ch[i]; cnt++; acc += 1; sq += ch[i] * ch[i]; sqn++;
          if (acc >= ratio) {
            acc -= ratio;
            const s = Math.max(-1, Math.min(1, sum / cnt)); sum = 0; cnt = 0;
            buf[n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
            if (n === FRAME) { onFrame(buf, Math.sqrt(sq / sqn)); buf = new Int16Array(FRAME); n = 0; sq = 0; sqn = 0; }
          }
        }
      };
      this.node = proc;
    }
    this.source.connect(this.node);
    this.node.connect(this.sink);
  }

  get ready() { return !!this.ctx && !!this.stream; }

  onFrame(listener: FrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  startRecording() { this.recording = []; }

  /** Stops recording and returns a 16 kHz mono WAV, or null if nothing was captured. */
  stopRecording(): Blob | null {
    const chunks = this.recording;
    this.recording = null;
    if (!chunks || !chunks.length) return null;
    return encodeWav(chunks, INPUT_RATE);
  }

  get speaking() { return this.playing.size > 0; }

  play(pcm: Uint8Array) {
    if (!this.ctx || !this.out) return;
    const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
    const samples = new Float32Array(pcm.byteLength / 2);
    for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
    const buffer = this.ctx.createBuffer(1, samples.length, OUTPUT_RATE);
    buffer.copyToChannel(samples, 0);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(this.out);
    const now = this.ctx.currentTime;
    const at = Math.max(now + 0.04, this.playhead);
    src.start(at);
    this.playhead = at + buffer.duration;
    this.playing.add(src);
    src.onended = () => this.playing.delete(src);
  }

  stopPlayback() {
    this.playing.forEach(s => { try { s.stop(); } catch { /* already stopped */ } });
    this.playing.clear();
    this.playhead = 0;
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

export interface LiveCallbacks {
  onExaminerSpeaking?: (speaking: boolean) => void;
  onTurnComplete?: () => void;
  onTranscript?: (turns: DialogueTurn[]) => void;
  /** The examiner called the end-of-task tool: the candidate confirmed they have finished. */
  onEndRequested?: (reason: string) => void;
  onClose?: (unexpected: boolean, reason: string) => void;
}

export interface LiveTools { tools?: unknown[]; endTool?: string }

/** One Gemini Live connection for one task. */
export class LiveExaminer {
  private ws: WebSocket | null = null;
  private unsubscribe: (() => void) | null = null;
  private closing = false;
  private speaking = false;
  private turnDone = false;
  private drainTimer: number | null = null;
  private loudSince = 0;
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
          this.unsubscribe = this.audio.onFrame((pcm, rms) => this.forward(pcm, rms));
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
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify({ realtimeInput: { text } }));
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
    if (this.speaking) { this.speaking = false; this.cb.onExaminerSpeaking?.(false); }
    this.ws = null;
  }

  private forward(pcm: Int16Array, rms: number) {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    // While the examiner speaks, only a sustained, clearly louder voice interrupts
    // (so the room echo of the examiner's own voice never cuts it off).
    if (this.speaking || this.audio.speaking) {
      if (rms < 0.16) { this.loudSince = 0; return; }
      if (!this.loudSince) this.loudSince = Date.now();
      if (Date.now() - this.loudSince < 280) return;
    } else this.loudSince = 0;
    ws.send(JSON.stringify({ realtimeInput: { audio: { data: toBase64(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength)), mimeType: `audio/pcm;rate=${INPUT_RATE}` } } }));
  }

  private append(role: DialogueTurn['role'], text: string) {
    if (!text) return;
    const last = this.turns[this.turns.length - 1];
    if (last && last.role === role) last.text = (last.text + text).replace(/\s+/g, ' ');
    else this.turns.push({ role, text: text.replace(/\s+/g, ' ').trimStart() });
    this.cb.onTranscript?.(this.turns);
  }

  private handle(msg: Record<string, any>) {
    const calls: { id?: string; name?: string; args?: { raison?: string } }[] = msg.toolCall?.functionCalls || [];
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
    (sc.modelTurn?.parts || []).forEach((p: { inlineData?: { data?: string } }) => {
      if (p.inlineData?.data) {
        this.turnDone = false;
        this.setSpeaking(true);
        this.audio.play(fromBase64(p.inlineData.data));
      }
    });
    if (sc.turnComplete) {
      this.turnDone = true;
      this.waitForDrain();
    }
  }

  private setSpeaking(on: boolean) {
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

async function parse(data: unknown): Promise<Record<string, any> | null> {
  try {
    if (typeof data === 'string') return JSON.parse(data);
    if (data instanceof Blob) return JSON.parse(await data.text());
    if (data instanceof ArrayBuffer) return JSON.parse(new TextDecoder().decode(data));
  } catch { /* ignore malformed frames */ }
  return null;
}
