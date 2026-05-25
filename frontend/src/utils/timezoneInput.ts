/**
 * timezoneInput.ts
 *
 * Helpers for date/time inputs (DatePicker, RangePicker) that need to be
 * interpreted in a specific IANA timezone — NOT the browser's local zone.
 *
 * Why this exists
 * ───────────────
 * Antd's DatePicker hands you a `dayjs` object whose internal value is the
 * absolute moment, but the year/month/day/hour/minute the user actually saw
 * and typed are read in the BROWSER'S local timezone.
 *
 * If a teacher in Casablanca (GMT+1) has a browser running in UTC and types
 * "04:00", what dayjs gives us is "04:00 UTC" — which is 05:00 in Casablanca.
 * That's NOT what the teacher meant.
 *
 * The fix: extract the wall-clock parts (Y/M/D/H/M) the teacher saw, and
 * re-anchor them in the teacher's saved profile timezone. The result is the
 * correct absolute UTC moment we want to store in `timestamptz`.
 *
 * Example
 * ───────
 *   Teacher.timezone = 'Africa/Casablanca' (GMT+1)
 *   Teacher picked    "2026-05-25 04:00"
 *   Browser zone      UTC
 *
 *   Naive `pickedValue.toISOString()` → "2026-05-25T04:00:00.000Z"   ❌
 *   localPickerToUtc(picked, tz)      → "2026-05-25T03:00:00.000Z"   ✅
 *
 * The opposite direction (loading a UTC timestamp BACK into a DatePicker so
 * it shows 04:00 in the teacher's zone) uses `utcToLocalPicker`.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert a dayjs value pulled from a DatePicker (which the browser
 * interpreted in its local timezone) into the absolute UTC ISO string,
 * treating the picker's wall-clock value as if it had been entered in `tz`.
 */
export function localPickerToUtc(picker: dayjs.Dayjs | null | undefined, tz?: string | null): string | null {
    if (!picker || !picker.isValid()) return null;
    const safeTz = effectiveTz(tz);
    // Compose a wall-clock string like "2026-05-25T04:00:00" from what the
    // user saw, then ask dayjs.tz to parse it AS IF it were in safeTz.
    const wall =
        picker.year().toString().padStart(4, '0') + '-' +
        (picker.month() + 1).toString().padStart(2, '0') + '-' +
        picker.date().toString().padStart(2, '0') + 'T' +
        picker.hour().toString().padStart(2, '0') + ':' +
        picker.minute().toString().padStart(2, '0') + ':' +
        picker.second().toString().padStart(2, '0');
    return dayjs.tz(wall, safeTz).toISOString();
}

/**
 * Convert a UTC ISO string from the server into a dayjs value the picker
 * can display, with the wall-clock representing the time in `tz`. This is
 * the inverse of localPickerToUtc — used for editing existing rows.
 *
 * The returned dayjs is anchored in the BROWSER's local zone but its
 * Y/M/D/H/M parts match the wall-clock the user wants to see.
 */
export function utcToLocalPicker(utcIso: string | null | undefined, tz?: string | null): dayjs.Dayjs | null {
    if (!utcIso) return null;
    const safeTz = effectiveTz(tz);
    const inZone = dayjs.utc(utcIso).tz(safeTz);
    if (!inZone.isValid()) return null;
    // Build a "naive" local dayjs from the parts so the picker displays them
    // verbatim regardless of the browser's actual zone.
    return dayjs(
        new Date(
            inZone.year(),
            inZone.month(),
            inZone.date(),
            inZone.hour(),
            inZone.minute(),
            inZone.second()
        )
    );
}

/** Validate an IANA timezone identifier; fall back to UTC if invalid. */
function effectiveTz(tz?: string | null): string {
    if (!tz) return 'UTC';
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz }).format();
        return tz;
    } catch {
        return 'UTC';
    }
}

/**
 * Convenience for RangePicker: convert both ends.
 */
export function localPickerRangeToUtc(
    range: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null | undefined,
    tz?: string | null
): { startUtc: string | null; endUtc: string | null } {
    if (!range) return { startUtc: null, endUtc: null };
    return {
        startUtc: localPickerToUtc(range[0], tz),
        endUtc: localPickerToUtc(range[1], tz),
    };
}

/**
 * Convenience for editing an existing row: convert a stored UTC range back
 * into picker dayjs values that will display in the user's timezone.
 */
export function utcRangeToLocalPicker(
    startUtc: string | null | undefined,
    endUtc: string | null | undefined,
    tz?: string | null
): [dayjs.Dayjs, dayjs.Dayjs] | undefined {
    const a = utcToLocalPicker(startUtc, tz);
    const b = utcToLocalPicker(endUtc, tz);
    if (!a || !b) return undefined;
    return [a, b];
}
