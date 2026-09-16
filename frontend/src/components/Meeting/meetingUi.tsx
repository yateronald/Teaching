import React from 'react';

/* Shared icon set + helpers for the live-meeting screens.
   Stroke icons on a 24px grid so every control reads the same weight. */

const stroke = {
    width: '1em',
    height: '1em',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
} as const;

const icon = (body: React.ReactNode) => <svg {...stroke}>{body}</svg>;
const dot = (cx: number, cy: number) => <circle cx={cx} cy={cy} r="1.6" fill="currentColor" stroke="none" />;

export const Ic = {
    mic: icon(<><rect x="9" y="2.5" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" /></>),
    micOff: icon(<><path d="M15 9.4V5.5a3 3 0 0 0-5.7-1.3M9 9v2.5a3 3 0 0 0 5.1 2.1" /><path d="M5 11a7 7 0 0 0 11.5 5.4M19 11a7 7 0 0 1-.5 2.6M12 18v3.5M8.5 21.5h7" /><path d="M3 3l18 18" /></>),
    cam: icon(<><rect x="2.5" y="6" width="13.5" height="12" rx="2.5" /><path d="M16 10.2l5.5-3.2v10l-5.5-3.2z" /></>),
    camOff: icon(<><path d="M10 6h3.5A2.5 2.5 0 0 1 16 8.5v2.2l5.5-3.2v9M16 16.5a2.5 2.5 0 0 1-2.5 1.5H5a2.5 2.5 0 0 1-2.5-2.5v-7A2.5 2.5 0 0 1 5 6h1" /><path d="M3 3l18 18" /></>),
    share: icon(<><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8M12 17v4M12 13.5V8M9.5 10.5 12 8l2.5 2.5" /></>),
    shareStop: icon(<><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8M12 17v4M9.5 8l5 5M14.5 8l-5 5" /></>),
    hand: icon(<><path d="M18 11V6.5a1.8 1.8 0 0 0-3.6 0V11M14.4 10V4.8a1.8 1.8 0 0 0-3.6 0V10M10.8 10.5V6.3a1.8 1.8 0 0 0-3.6 0v7.9" /><path d="M18 8.6a1.8 1.8 0 0 1 3.6 0V14a8 8 0 0 1-8 8h-1.7c-2.6 0-4.3-.8-5.8-2.3l-3.4-3.5a1.8 1.8 0 0 1 2.6-2.5l1.9 1.9" /></>),
    smile: icon(<><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.6 4.6 0 0 0 7 0" />{dot(9, 9.8)}{dot(15, 9.8)}</>),
    more: icon(<>{dot(12, 5)}{dot(12, 12)}{dot(12, 19)}</>),
    people: icon(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.2 14.3A6.5 6.5 0 0 1 21.5 20" /></>),
    chat: icon(<path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L3.5 20l1.4-4.8A8 8 0 1 1 20.5 11.5z" />),
    poll: icon(<><path d="M5 20V11M12 20V5M19 20v-6" /><path d="M3 20.5h18" /></>),
    settings: icon(<><path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="17" r="2" /></>),
    pin: icon(<><path d="M12 16.5V22M8.5 3h7l-1 5.5 3 3V14h-11v-2.5l3-3z" /></>),
    record: icon(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></>),
    lock: icon(<><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>),
    unlock: icon(<><rect x="4.5" y="10.5" width="15" height="10.5" rx="2.2" /><path d="M8 10.5V7.5a4 4 0 0 1 7.7-1.5" /></>),
    pen: icon(<><path d="M4 20l3.8-.9L19 7.9a2.1 2.1 0 0 0-3-3L4.9 16.2z" /><path d="M14.5 6.5l3 3" /></>),
    expand: icon(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />),
    shrink: icon(<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />),
    grid: icon(<><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" /></>),
    spotlight: icon(<><rect x="2.5" y="3" width="19" height="12.5" rx="2" /><rect x="2.5" y="18" width="5" height="3" rx="1" /><rect x="9.5" y="18" width="5" height="3" rx="1" /><rect x="16.5" y="18" width="5" height="3" rx="1" /></>),
    layout: icon(<><rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="M14.5 4v16M14.5 12h7" /></>),
    speaker: icon(<><path d="M11 5 6.5 9H3.5v6h3L11 19z" /><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6a8.5 8.5 0 0 1 0 12" /></>),
    link: icon(<><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" /></>),
    megaphone: icon(<><path d="M3.5 10v4h3l9 5V5l-9 5z" /><path d="M6.5 14l1.4 5.5h2.7l-1.1-4.2M19 9.5a3.5 3.5 0 0 1 0 5" /></>),
    close: icon(<path d="M6 6l12 12M18 6 6 18" />),
    send: icon(<><path d="M4 12 20.5 4 14 20.5l-2.7-6.8z" /><path d="M11.3 13.7 20.5 4" /></>),
    chevronUp: icon(<path d="M6.5 14.5 12 9l5.5 5.5" />),
    check: icon(<path d="m5 12.5 4.5 4.5L19 7.5" />),
    info: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" />{dot(12, 7.8)}</>),
    user: icon(<><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>),
    leave: (
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.96.96 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.3 11.3 0 0 0-2.67-1.85.99.99 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
        </svg>
    ),
};

const PALETTE = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0d9488', '#059669', '#4f46e5', '#c026d3', '#0284c7', '#b45309'];

/** Stable avatar colour per name. */
export const colorFor = (name: string) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
};

export const initials = (name: string) => {
    const parts = (name || '?').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/** Drops the "(046d:0825)" vendor ids browsers append to device names. */
export const cleanDeviceLabel = (label: string) => label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, '').trim();
