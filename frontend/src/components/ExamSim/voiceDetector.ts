// Tells the candidate's voice from the room around it, frame by frame (80 ms
// of microphone audio, summarised by its RMS level). Fixed thresholds fail as
// soon as the room is noisy or the microphone quiet, so everything here is
// relative to two levels learnt as the exam goes:
//   - the noise floor: the room when nobody speaks. Tracked with "minimum
//     statistics": the quietest frame of the last few seconds. Speech always
//     has short dips between syllables, steady noise (fan, traffic, air
//     conditioning) never does, so the floor follows the noise without being
//     pulled up by the voice.
//   - the voice level: how loud the candidate's voice usually is.
// Pure logic, no browser API: it is tested on its own.

export const FRAME_MS = 80;

/** Below this level a frame is silence whatever the room (digital noise of a good microphone). */
const MIN_VOICE = 0.006;
/** A frame is voice when it is this many times above the floor (×3.2 ≈ +10 dB)… */
const OPEN_RATIO = 3.2;
/** …and stays voice down to this ratio while speaking (hysteresis, ×2 ≈ +6 dB). */
const CLOSE_RATIO = 2;
/** Voice is kept this long after the last voiced frame (word endings, short pauses). */
const HANG_FRAMES = 6; // 480 ms
/** Window of the minimum-statistics floor. */
const FLOOR_WINDOW = 40; // 3.2 s

export interface RoomReport {
  /** Room noise, in dB relative to full scale (−60 very quiet … −30 very noisy). */
  noiseDb: number;
  /** Candidate's voice, dBFS (null until heard). */
  voiceDb: number | null;
  /** Voice above noise, in dB (null until heard). ≥ 20 good, 12–20 fair, < 12 poor. */
  snrDb: number | null;
  quality: 'good' | 'fair' | 'poor' | 'unknown';
  /** Share of voiced frames that clipped (saturated microphone). */
  clipping: number;
}

export const toDb = (rms: number) => Math.round(20 * Math.log10(Math.max(rms, 1e-5)));

export function qualityOf(noiseDb: number, snrDb: number | null): RoomReport['quality'] {
  if (snrDb == null) return 'unknown';
  if (snrDb < 12 || noiseDb > -32) return 'poor';
  if (snrDb < 20 || noiseDb > -42) return 'fair';
  return 'good';
}

export class VoiceDetector {
  noiseFloor: number;
  voiceLevel: number;
  speaking = false;
  private hang = 0;
  private window: number[] = [];
  private voiced = 0;
  private clipped = 0;

  constructor(noiseFloor = 0.004, voiceLevel = 0) {
    this.noiseFloor = noiseFloor;
    this.voiceLevel = voiceLevel;
  }

  /** Starts from a measured room (device check) instead of a guess. */
  calibrate(noiseFloor: number, voiceLevel?: number) {
    this.noiseFloor = Math.max(0.0005, noiseFloor);
    if (voiceLevel) this.voiceLevel = voiceLevel;
    this.window = [];
  }

  /** Starts the voice and saturation counts again (one task = one report). */
  resetCounts() { this.voiced = 0; this.clipped = 0; }

  /** Level a frame must reach to count as voice right now. */
  get openLevel() { return Math.max(MIN_VOICE, this.noiseFloor * OPEN_RATIO); }

  /**
   * Level the candidate must reach to talk over the examiner: well above the
   * room, and close to their own usual voice, so the examiner's voice leaking
   * from the speakers never counts as the candidate interrupting.
   */
  get bargeInLevel() {
    const fromVoice = this.voiceLevel ? this.voiceLevel * 0.55 : 0.12;
    return Math.min(0.2, Math.max(0.05, this.noiseFloor * 6, fromVoice));
  }

  /** Feeds one frame; returns whether it carries the candidate's voice. */
  push(rms: number, peak = 0): boolean {
    this.window.push(rms);
    if (this.window.length > FLOOR_WINDOW) this.window.shift();

    const open = rms >= this.openLevel;
    const hold = this.speaking && rms >= Math.max(MIN_VOICE * 0.7, this.noiseFloor * CLOSE_RATIO);
    if (open || hold) {
      this.speaking = true;
      this.hang = HANG_FRAMES;
      this.voiced++;
      if (peak >= 0.99) this.clipped++;
      // The voice level follows the candidate's clearly voiced frames.
      if (open) this.voiceLevel = this.voiceLevel ? this.voiceLevel * 0.95 + rms * 0.05 : rms;
    } else if (this.hang > 0) {
      this.hang--;
    } else {
      this.speaking = false;
    }

    // Minimum statistics: the floor falls at once to a quieter room and rises
    // slowly towards steady noise (about a second once the window holds it).
    if (this.window.length >= 8) {
      const min = Math.min(...this.window);
      this.noiseFloor = min < this.noiseFloor
        ? this.noiseFloor * 0.5 + min * 0.5
        : this.noiseFloor + (min - this.noiseFloor) * 0.08;
      this.noiseFloor = Math.max(0.0005, this.noiseFloor);
    }
    return this.speaking;
  }

  report(): RoomReport {
    const noiseDb = toDb(this.noiseFloor);
    const voiceDb = this.voiceLevel ? toDb(this.voiceLevel) : null;
    const snrDb = voiceDb == null ? null : voiceDb - noiseDb;
    return { noiseDb, voiceDb, snrDb, quality: qualityOf(noiseDb, snrDb), clipping: this.voiced ? +(this.clipped / this.voiced).toFixed(3) : 0 };
  }
}

/**
 * The stream sent to the examiner: frames without the candidate's voice are
 * replaced by digital silence, so the examiner's speech detection sees a clean
 * silence when the candidate stops (and answers on time) instead of a room
 * that never goes quiet. One frame of look-ahead keeps the start of each word:
 * a frame is sent as it is when it, or the next one, carries voice.
 */
export class NoiseGate {
  private pending: { pcm: Int16Array; voiced: boolean } | null = null;
  passed = 0;
  muted = 0;

  /** Feeds a frame; returns the frame to send now (the previous one), or null at the very start. */
  push(pcm: Int16Array, voiced: boolean): Int16Array | null {
    const prev = this.pending;
    this.pending = { pcm, voiced };
    if (!prev) return null;
    if (prev.voiced || voiced) { this.passed++; return prev.pcm; }
    this.muted++;
    return new Int16Array(prev.pcm.length);
  }
}
