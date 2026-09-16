/**
 * zonedTime.ts
 *
 * Wall-clock ⇄ instant conversion in a named IANA zone.
 *
 * Date/time pickers (antd + dayjs) work in the browser's zone, but every screen displays times
 * in the user's *profile* zone. Pickers therefore work on wall-clock strings
 * ("2026-09-16T14:30") that mean "this time in the profile zone", converted here.
 */

const partsIn = (utcMs: number, tz: string) => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(utcMs));
    const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
    return { y: get('year'), mo: get('month'), d: get('day'), h: get('hour') % 24, mi: get('minute'), s: get('second') };
};

const offsetMs = (utcMs: number, tz: string) => {
    const p = partsIn(utcMs, tz);
    return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(utcMs / 1000) * 1000;
};

/** "2026-09-16T14:30" in `tz` → ISO instant, or null when the string isn't a wall-clock time. */
export const wallToIso = (wall: string, tz: string): string | null => {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(wall || '');
    if (!m) return null;
    const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    let utc = guess - offsetMs(guess, tz);
    utc = guess - offsetMs(utc, tz);          // second pass settles DST edges
    return new Date(utc).toISOString();
};

/** ISO instant → "2026-09-16T14:30" as seen in `tz`. */
export const isoToWall = (iso: string | null | undefined, tz: string): string | null => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return null;
    const p = partsIn(t, tz);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${p.y}-${pad(p.mo)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`;
};

/** "YYYY-MM-DD" of an instant as seen in `tz` ('' when invalid). */
export const dayKeyIn = (iso: string | null | undefined, tz: string): string => (isoToWall(iso, tz) || '').slice(0, 10);

/** The current wall-clock time in `tz`. */
export const nowWallIn = (tz: string): string => isoToWall(new Date().toISOString(), tz) as string;

/** Whole days from day key `a` to day key `b` (calendar arithmetic, no time-zone shifts). */
export const daysBetween = (a: string, b: string): number => {
    const toUtc = (k: string) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d); };
    return Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
};
