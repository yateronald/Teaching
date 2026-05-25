/**
 * timezoneService.js
 *
 * Engine for handling per-user timezones across the platform.
 * Built on the native Node Intl API (no external date library needed).
 *
 * Public API:
 *   - listTimezones()                            → grouped catalog for the dropdown
 *   - isValidTimezone(tz)                        → boolean
 *   - getTimezoneAbbr(tz, date?)                 → e.g. "EDT", "GMT+1"
 *   - getUtcOffsetMinutes(tz, date?)             → e.g. -240 for EDT
 *   - formatInTimezone(date, tz, options?)       → human string in that zone
 *   - formatDateOnly(date, tz)                   → "Sunday, May 25, 2026"
 *   - formatTimeOnly(date, tz)                   → "5:00 PM EDT"
 *   - formatDateTime(date, tz)                   → "Sun, May 25, 2026 · 5:00 PM EDT"
 *
 * All functions accept Date | string | number for the input timestamp.
 */

'use strict';

// ── IANA zone catalog: what we surface in the profile dropdown ─────────
// Canada zones first since most students are there. The full IANA list is
// huge (600+ zones); we ship a curated set covering all populated regions.
const TIMEZONE_GROUPS = [
    {
        label: 'Canada',
        zones: [
            { value: 'America/Toronto',     label: 'Toronto · Ontario, Quebec' },
            { value: 'America/Montreal',    label: 'Montreal' },
            { value: 'America/Halifax',     label: 'Halifax · Atlantic' },
            { value: 'America/St_Johns',    label: "St. John's · Newfoundland" },
            { value: 'America/Winnipeg',    label: 'Winnipeg · Manitoba' },
            { value: 'America/Regina',      label: 'Regina · Saskatchewan' },
            { value: 'America/Edmonton',    label: 'Edmonton · Alberta' },
            { value: 'America/Vancouver',   label: 'Vancouver · British Columbia' },
            { value: 'America/Whitehorse',  label: 'Whitehorse · Yukon' },
            { value: 'America/Yellowknife', label: 'Yellowknife · Northwest Territories' },
            { value: 'America/Iqaluit',     label: 'Iqaluit · Nunavut' },
        ],
    },
    {
        label: 'United States',
        zones: [
            { value: 'America/New_York',    label: 'New York · Eastern' },
            { value: 'America/Chicago',     label: 'Chicago · Central' },
            { value: 'America/Denver',      label: 'Denver · Mountain' },
            { value: 'America/Phoenix',     label: 'Phoenix · Mountain (no DST)' },
            { value: 'America/Los_Angeles', label: 'Los Angeles · Pacific' },
            { value: 'America/Anchorage',   label: 'Anchorage · Alaska' },
            { value: 'Pacific/Honolulu',    label: 'Honolulu · Hawaii' },
        ],
    },
    {
        label: 'Europe',
        zones: [
            { value: 'Europe/London',     label: 'London · GMT/BST' },
            { value: 'Europe/Dublin',     label: 'Dublin' },
            { value: 'Europe/Paris',      label: 'Paris' },
            { value: 'Europe/Berlin',     label: 'Berlin' },
            { value: 'Europe/Madrid',     label: 'Madrid' },
            { value: 'Europe/Rome',       label: 'Rome' },
            { value: 'Europe/Amsterdam',  label: 'Amsterdam' },
            { value: 'Europe/Brussels',   label: 'Brussels' },
            { value: 'Europe/Lisbon',     label: 'Lisbon' },
            { value: 'Europe/Zurich',     label: 'Zurich' },
            { value: 'Europe/Vienna',     label: 'Vienna' },
            { value: 'Europe/Stockholm',  label: 'Stockholm' },
            { value: 'Europe/Oslo',       label: 'Oslo' },
            { value: 'Europe/Copenhagen', label: 'Copenhagen' },
            { value: 'Europe/Helsinki',   label: 'Helsinki' },
            { value: 'Europe/Athens',     label: 'Athens' },
            { value: 'Europe/Warsaw',     label: 'Warsaw' },
            { value: 'Europe/Prague',     label: 'Prague' },
            { value: 'Europe/Budapest',   label: 'Budapest' },
            { value: 'Europe/Bucharest',  label: 'Bucharest' },
            { value: 'Europe/Sofia',      label: 'Sofia' },
            { value: 'Europe/Istanbul',   label: 'Istanbul' },
            { value: 'Europe/Moscow',     label: 'Moscow' },
            { value: 'Europe/Kyiv',       label: 'Kyiv' },
        ],
    },
    {
        label: 'Africa',
        zones: [
            { value: 'Africa/Casablanca',   label: 'Casablanca · Morocco' },
            { value: 'Africa/Algiers',      label: 'Algiers · Algeria' },
            { value: 'Africa/Tunis',        label: 'Tunis · Tunisia' },
            { value: 'Africa/Cairo',        label: 'Cairo · Egypt' },
            { value: 'Africa/Lagos',        label: 'Lagos · Nigeria' },
            { value: 'Africa/Accra',        label: 'Accra · Ghana' },
            { value: 'Africa/Abidjan',      label: 'Abidjan · Ivory Coast' },
            { value: 'Africa/Dakar',        label: 'Dakar · Senegal' },
            { value: 'Africa/Douala',       label: 'Douala · Cameroon' },
            { value: 'Africa/Kinshasa',     label: 'Kinshasa · DR Congo' },
            { value: 'Africa/Nairobi',      label: 'Nairobi · Kenya' },
            { value: 'Africa/Addis_Ababa',  label: 'Addis Ababa · Ethiopia' },
            { value: 'Africa/Johannesburg', label: 'Johannesburg · South Africa' },
        ],
    },
    {
        label: 'Asia',
        zones: [
            { value: 'Asia/Dubai',     label: 'Dubai · UAE' },
            { value: 'Asia/Riyadh',    label: 'Riyadh · Saudi Arabia' },
            { value: 'Asia/Tehran',    label: 'Tehran · Iran' },
            { value: 'Asia/Karachi',   label: 'Karachi · Pakistan' },
            { value: 'Asia/Kolkata',   label: 'Kolkata · India' },
            { value: 'Asia/Dhaka',     label: 'Dhaka · Bangladesh' },
            { value: 'Asia/Bangkok',   label: 'Bangkok · Thailand' },
            { value: 'Asia/Singapore', label: 'Singapore' },
            { value: 'Asia/Jakarta',   label: 'Jakarta · Indonesia' },
            { value: 'Asia/Manila',    label: 'Manila · Philippines' },
            { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
            { value: 'Asia/Shanghai',  label: 'Shanghai · China' },
            { value: 'Asia/Taipei',    label: 'Taipei · Taiwan' },
            { value: 'Asia/Seoul',     label: 'Seoul · South Korea' },
            { value: 'Asia/Tokyo',     label: 'Tokyo · Japan' },
            { value: 'Asia/Beirut',    label: 'Beirut · Lebanon' },
            { value: 'Asia/Jerusalem', label: 'Jerusalem · Israel' },
        ],
    },
    {
        label: 'Oceania',
        zones: [
            { value: 'Pacific/Auckland', label: 'Auckland · New Zealand' },
            { value: 'Australia/Sydney', label: 'Sydney · NSW' },
            { value: 'Australia/Melbourne', label: 'Melbourne · Victoria' },
            { value: 'Australia/Brisbane',  label: 'Brisbane · Queensland' },
            { value: 'Australia/Adelaide',  label: 'Adelaide · South Australia' },
            { value: 'Australia/Perth',     label: 'Perth · Western Australia' },
        ],
    },
    {
        label: 'South America',
        zones: [
            { value: 'America/Sao_Paulo',     label: 'São Paulo · Brazil' },
            { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires · Argentina' },
            { value: 'America/Santiago',      label: 'Santiago · Chile' },
            { value: 'America/Bogota',        label: 'Bogotá · Colombia' },
            { value: 'America/Lima',          label: 'Lima · Peru' },
            { value: 'America/Caracas',       label: 'Caracas · Venezuela' },
            { value: 'America/Mexico_City',   label: 'Mexico City · Mexico' },
        ],
    },
    {
        label: 'UTC',
        zones: [
            { value: 'UTC',     label: 'UTC · Coordinated Universal Time' },
        ],
    },
];

// Flat lookup of valid zone identifiers
const FLAT_TIMEZONES = new Set(
    TIMEZONE_GROUPS.flatMap(g => g.zones.map(z => z.value))
);

function listTimezones() {
    return TIMEZONE_GROUPS;
}

function isValidTimezone(tz) {
    if (!tz || typeof tz !== 'string') return false;
    if (FLAT_TIMEZONES.has(tz)) return true;
    // Fallback: try Intl — accepts any IANA zone the runtime knows about
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: tz }).format();
        return true;
    } catch {
        return false;
    }
}

function toDate(input) {
    if (input instanceof Date) return input;
    if (typeof input === 'string' || typeof input === 'number') return new Date(input);
    return new Date();
}

function _parts(date, tz) {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
        timeZoneName: 'shortOffset',
    });
    const parts = fmt.formatToParts(date);
    const out = {};
    for (const p of parts) out[p.type] = p.value;
    return out;
}

/**
 * Returns a short timezone abbreviation like "EDT", "PST", or "GMT+1".
 * Uses Intl 'shortOffset' which is well supported in Node ≥ 18.
 */
function getTimezoneAbbr(tz, date) {
    const d = toDate(date);
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, timeZoneName: 'shortOffset',
        }).formatToParts(d);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        // shortOffset gives "GMT-4" / "GMT+1" — that's fine and unambiguous.
        // Some locales return e.g. "EDT" via 'short'; we prefer offset form.
        return tzPart ? tzPart.value : tz;
    } catch {
        return tz;
    }
}

/**
 * Returns the UTC offset in minutes for a given zone at a given moment.
 * E.g. for America/Toronto in summer → -240 (EDT = UTC-4).
 */
function getUtcOffsetMinutes(tz, date) {
    const d = toDate(date);
    const abbr = getTimezoneAbbr(tz, d); // "GMT+1" / "GMT-4" / "GMT"
    const m = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(abbr);
    if (!m) return 0;
    const sign = m[1] === '-' ? -1 : 1;
    const hours = parseInt(m[2], 10);
    const mins = m[3] ? parseInt(m[3], 10) : 0;
    return sign * (hours * 60 + mins);
}

/**
 * Format a date/time in the given timezone.
 * Default options produce: "Sun, May 25, 2026 · 5:00 PM EDT"
 */
function formatInTimezone(date, tz, options = {}) {
    const d = toDate(date);
    const safeTz = isValidTimezone(tz) ? tz : 'UTC';
    const opts = {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
        timeZone: safeTz,
        ...options,
    };
    const datePart = new Intl.DateTimeFormat('en-US', opts).format(d);
    // Append the offset if not already part of the format
    if (!opts.timeZoneName) {
        const abbr = getTimezoneAbbr(safeTz, d);
        return `${datePart} ${abbr}`;
    }
    return datePart;
}

function formatDateOnly(date, tz) {
    return formatInTimezone(date, tz, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: undefined, minute: undefined, hour12: undefined,
    });
}

function formatTimeOnly(date, tz) {
    const d = toDate(date);
    const safeTz = isValidTimezone(tz) ? tz : 'UTC';
    const time = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: safeTz,
    }).format(d);
    const abbr = getTimezoneAbbr(safeTz, d);
    return `${time} ${abbr}`;
}

function formatDateTime(date, tz) {
    const d = toDate(date);
    const safeTz = isValidTimezone(tz) ? tz : 'UTC';
    const datePart = new Intl.DateTimeFormat('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: safeTz,
    }).format(d);
    const abbr = getTimezoneAbbr(safeTz, d);
    return `${datePart} · ${abbr}`;
}

module.exports = {
    listTimezones,
    isValidTimezone,
    getTimezoneAbbr,
    getUtcOffsetMinutes,
    formatInTimezone,
    formatDateOnly,
    formatTimeOnly,
    formatDateTime,
};
