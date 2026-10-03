// ============================================================
// The end of a timed oral task, as an examiner would handle it.
//
// Shortly before the end, the examiner announces it at a pause of the
// candidate and asks whether they want to add something ([TEMPS]). When time
// is up the candidate is never cut off mid-sentence: their sentence may end
// (a short pause, a few seconds at most), then the examiner says that time is
// up in one sentence ([FIN]) and the task closes once it has been said.
// Pure decisions: EOExam's ticker calls `timeAction` and carries them out.
// ============================================================

/** Seconds left when the examiner announces that the end is near. */
export const WARN_AT: Record<number, number> = { 1: 25, 2: 30, 3: 40 };
/** The pause awaited before announcing it, so the candidate is not interrupted. */
export const WARN_PAUSE_MS: Record<number, number> = { 1: 1200, 2: 1200, 3: 1500 };
/** Under this, too late to announce it: the closing handles the end. */
export const WARN_MIN_LEFT_MS = 10_000;
export const WRAP = {
  /** End of the candidate's sentence. */
  pauseMs: 700,
  /** At most this long after time is up for the sentence (and the examiner's own turn) to end. */
  sentenceMaxMs: 7000,
  /** The examiner should start the closing sentence within this delay (it first waits for the candidate's turn to end: up to 3 s in task 3)… */
  startMaxMs: 8000,
  /** …and the task closes after this delay whatever happens. */
  closingMaxMs: 18000,
};
/** What the examiner says when closing a task (cf. backend/services/eoExaminer.js). */
export const CLOSING_LINE = /temps est écoulé|nous nous arrêtons|vous arrêter|épreuve est terminée|au revoir/i;

export interface EndClock {
  /** [TEMPS] was sent. */
  warned: boolean;
  /** When time ran out (0 = still running). */
  upAt: number;
  /** When [FIN] was sent (0 = not yet). */
  cueAt: number;
  /** The examiner has started speaking since [FIN]. */
  spoke: boolean;
}
export const freshClock = (): EndClock => ({ warned: false, upAt: 0, cueAt: 0, spoke: false });

export interface ClockInput {
  now: number;
  /** Time left for the task (≤ 0 once it has run out). */
  leftMs: number;
  /** Since the candidate's voice was last heard. */
  quietMs: number;
  /** The examiner's voice is playing. */
  examinerTalking: boolean;
  /** The examiner is connected. */
  connected: boolean;
}

export type TimeAction =
  | { kind: 'warn'; seconds: number }
  | { kind: 'close'; forced: boolean }
  | { kind: 'end' }
  | null;

export function timeAction(task: number, clock: EndClock, i: ClockInput): TimeAction {
  if (i.leftMs > 0) {
    const nearEnd = i.leftMs <= (WARN_AT[task] ?? 30) * 1000 && i.leftMs > WARN_MIN_LEFT_MS;
    if (!clock.warned && i.connected && nearEnd && !i.examinerTalking && i.quietMs > (WARN_PAUSE_MS[task] ?? 1200)) {
      return { kind: 'warn', seconds: Math.max(10, Math.round(i.leftMs / 10_000) * 10) };
    }
    return null;
  }
  const since = i.now - (clock.upAt || i.now);
  if (!clock.cueAt) {
    const sentenceOver = i.quietMs > WRAP.pauseMs;
    if (!i.connected) return sentenceOver || since > WRAP.sentenceMaxMs ? { kind: 'end' } : null;
    if (sentenceOver && !i.examinerTalking) return { kind: 'close', forced: false };
    if (since > WRAP.sentenceMaxMs) return { kind: 'close', forced: true };
    return null;
  }
  const closing = i.now - clock.cueAt;
  return (!clock.spoke && closing > WRAP.startMaxMs) || closing > WRAP.closingMaxMs ? { kind: 'end' } : null;
}

/** The platform's messages to the examiner. */
export const warnCue = (seconds: number) => `[TEMPS] Il reste environ ${seconds} secondes.`;
export const closeCue = (forced: boolean) => (forced ? '[FIN] Le temps est écoulé ; le candidat parle encore.' : '[FIN] Le temps est écoulé.');
