/**
 * Signed-in devices, as the server describes them.
 *
 * Ages arrive as seconds counted by the database, so nothing here depends on
 * the visitor's clock being right.
 */
export interface DeviceSession {
    id: number;
    device: string;
    idle_seconds: number;
    age_seconds: number;
    current?: boolean;
    /** Only administrators see this. */
    ip?: string | null;
}

/**
 * The device name the server composed ("Chrome on Windows"), with its one
 * English word translated — the browser and system names stay as they are.
 */
export function deviceText(device: string, lang = 'en'): string {
    if (!lang.startsWith('fr')) return device;
    if (device === 'Unknown device') return 'Appareil inconnu';
    return device.replace(' on ', ' sur ').replace('iPhone or iPad', 'iPhone ou iPad');
}

/** "just now" · "5 min ago" · "3 h ago" · "2 days ago" */
export function sinceText(seconds: number | null | undefined, lang = 'en'): string {
    const fr = lang.startsWith('fr');
    if (seconds == null) return fr ? 'jamais' : 'never';
    const s = Math.max(0, Math.round(seconds));
    if (s < 90) return fr ? "à l'instant" : 'just now';
    const mins = Math.round(s / 60);
    if (mins < 60) return fr ? `il y a ${mins} min` : `${mins} min ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return fr ? `il y a ${hours} h` : `${hours} h ago`;
    const days = Math.round(hours / 24);
    if (days === 1) return fr ? 'hier' : 'yesterday';
    return fr ? `il y a ${days} jours` : `${days} days ago`;
}

/** "signed in 2 h ago" */
export const signedInText = (seconds: number | null | undefined, lang = 'en'): string =>
    lang.startsWith('fr') ? `connecté ${sinceText(seconds, 'fr')}` : `signed in ${sinceText(seconds, 'en')}`;
