/**
 * The design of an email campaign: its layout, its header, its colours, its
 * fonts, its shapes. Every value is checked here (the editor, the AI and the
 * renderer all go through clean()), and colours are made readable: text and
 * buttons keep at least the WCAG AA contrast (4.5:1) whatever was asked.
 *
 * Only what mail programs can show: web-safe fonts, solid colours, simple
 * shapes. Five layouts, each a complete starting point:
 *
 *   classic    the headline on a band of the brand colour, the logo above
 *   hero       a full-width photo at the top, the headline under it
 *   minimal    white, the logo in the header, plenty of space, square edges
 *   bold       a dark band with a large headline, pill buttons, cards for points
 *   editorial  centred, a serif headline, numbered points, airy
 */

const FONTS = {
    system: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    humanist: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    georgia: "Georgia, 'Times New Roman', Times, serif",
    trebuchet: "'Trebuchet MS', 'Lucida Grande', Tahoma, sans-serif",
    verdana: "Verdana, Geneva, Tahoma, sans-serif",
};

const PRESETS = ['classic', 'hero', 'minimal', 'bold', 'editorial'];
const HEADERS = ['band', 'hero', 'logo', 'centered', 'none'];
const LOGOS = ['top', 'header', 'none'];
const ALIGNS = ['left', 'center'];
const SHAPES = ['rounded', 'pill', 'square'];
const WIDTHS = ['auto', 'full'];
const SPACINGS = ['compact', 'normal', 'airy'];
const POINTS = ['checks', 'cards', 'numbers'];
const CARDS = ['shadow', 'border', 'flat'];
const COLOR_KEYS = ['primary', 'accent', 'header_bg', 'header_text', 'page_bg', 'card_bg', 'heading', 'text', 'muted', 'soft'];

/** The school's colours (the logo's navy and bordeaux), and the campaign themes of the site. */
const BRAND = {
    navy: { primary: '#1d4577', accent: '#f2b632', header_bg: '#0b1733', soft: '#edf1f5', heading: '#0b1733' },
    bordeaux: { primary: '#a83342', accent: '#ffd9a0', header_bg: '#4f121d', soft: '#f9edee', heading: '#4f121d' },
    forest: { primary: '#1f7a59', accent: '#ffd77a', header_bg: '#0c3526', soft: '#e9f4ef', heading: '#0c3526' },
    plum: { primary: '#6a45a3', accent: '#ffc9de', header_bg: '#2a1849', soft: '#f1ecf8', heading: '#2a1849' },
    gold: { primary: '#9c6609', accent: '#fff1c9', header_bg: '#6f4405', soft: '#fbf3df', heading: '#6f4405' },
};

/** A palette: a theme's colours with the neutral ones every layout shares. */
function palette(theme = 'navy') {
    const b = BRAND[theme] || BRAND.navy;
    return { ...b, header_text: '#ffffff', page_bg: '#f2f4f7', card_bg: '#ffffff', text: '#1b2333', muted: '#5b6578' };
}

const LAYOUTS = {
    classic: { header: 'band', logo: 'top', align: 'left', font: 'system', heading_font: 'system', heading_size: 28, body_size: 16, radius: 16, button_shape: 'rounded', button_width: 'auto', spacing: 'normal', points: 'checks', card: 'border' },
    hero: { header: 'hero', logo: 'top', align: 'left', font: 'system', heading_font: 'system', heading_size: 28, body_size: 16, radius: 16, button_shape: 'rounded', button_width: 'auto', spacing: 'normal', points: 'checks', card: 'shadow' },
    minimal: { header: 'logo', logo: 'header', align: 'left', font: 'humanist', heading_font: 'humanist', heading_size: 30, body_size: 16, radius: 0, button_shape: 'square', button_width: 'auto', spacing: 'airy', points: 'numbers', card: 'flat' },
    bold: { header: 'band', logo: 'top', align: 'left', font: 'system', heading_font: 'system', heading_size: 34, body_size: 17, radius: 20, button_shape: 'pill', button_width: 'full', spacing: 'normal', points: 'cards', card: 'shadow' },
    editorial: { header: 'centered', logo: 'header', align: 'center', font: 'system', heading_font: 'georgia', heading_size: 30, body_size: 16, radius: 8, button_shape: 'rounded', button_width: 'auto', spacing: 'airy', points: 'numbers', card: 'border' },
};

/** A complete design: a layout in a theme's colours. */
function preset(name = 'classic', theme = 'navy') {
    const layout = LAYOUTS[name] || LAYOUTS.classic;
    const colors = palette(theme);
    if (name === 'minimal' || name === 'editorial') Object.assign(colors, { page_bg: '#ffffff', header_bg: '#ffffff', header_text: colors.heading });
    if (name === 'bold') Object.assign(colors, { page_bg: '#eef1f6' });
    return { preset: PRESETS.includes(name) ? name : 'classic', theme: BRAND[theme] ? theme : 'navy', ...layout, colors };
}

// ── Colour and contrast (WCAG 2) ───────────────────────────────────────────

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function hex(v, fallback) {
    const m = HEX_RE.exec(String(v || '').trim());
    if (!m) return fallback;
    const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
    return `#${h.toLowerCase()}`;
}
function luminance(color) {
    const h = hex(color, '#000000').slice(1);
    const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
        .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
}
/** The colour itself when it reads well enough on the background; otherwise white or near-black, whichever reads better. */
function readable(color, background, min = 4.5) {
    if (contrast(color, background) >= min) return color;
    const light = '#ffffff';
    const dark = '#111827';
    return contrast(light, background) >= contrast(dark, background) ? light : dark;
}

// ── Cleaning ───────────────────────────────────────────────────────────────

const pick = (v, list, fallback) => (list.includes(v) ? v : fallback);
const num = (v, min, max, fallback) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
const words = (v, max) => {
    const t = String(v ?? '').replace(/\s+/g, ' ').trim();
    return t ? t.slice(0, max) : null;
};

/**
 * A design as anyone may have written it → a complete, valid, readable one.
 * Returns { design, fixes } (fixes: the colours that had to change).
 */
function clean(raw = {}, { theme } = {}) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const base = preset(pick(src.preset, PRESETS, 'classic'), BRAND[src.theme] ? src.theme : (BRAND[theme] ? theme : 'navy'));
    const d = {
        preset: base.preset,
        theme: base.theme,
        header: pick(src.header, HEADERS, base.header),
        logo: pick(src.logo, LOGOS, base.logo),
        align: pick(src.align, ALIGNS, base.align),
        font: FONTS[src.font] ? src.font : base.font,
        heading_font: FONTS[src.heading_font] ? src.heading_font : base.heading_font,
        heading_size: num(src.heading_size, 22, 38, base.heading_size),
        body_size: num(src.body_size, 14, 18, base.body_size),
        radius: num(src.radius, 0, 28, base.radius),
        button_shape: pick(src.button_shape, SHAPES, base.button_shape),
        button_width: pick(src.button_width, WIDTHS, base.button_width),
        spacing: pick(src.spacing, SPACINGS, base.spacing),
        points: pick(src.points, POINTS, base.points),
        card: pick(src.card, CARDS, base.card),
        colors: {},
    };
    const colors = src.colors && typeof src.colors === 'object' ? src.colors : {};
    for (const k of COLOR_KEYS) d.colors[k] = hex(colors[k], base.colors[k]);

    // Readable whatever was chosen: the words keep their contrast with what is under them.
    const fixes = [];
    const fix = (key, background, min = 4.5) => {
        const next = readable(d.colors[key], background, min);
        if (next !== d.colors[key]) { fixes.push(key); d.colors[key] = next; }
    };
    fix('header_text', d.colors.header_bg);
    fix('heading', d.colors.card_bg);
    fix('text', d.colors.card_bg);
    fix('muted', d.colors.card_bg);
    // The primary colour fills the buttons and colours the links: links need it readable on the card.
    if (contrast(d.colors.primary, d.colors.card_bg) < 3) { fixes.push('primary'); d.colors.primary = readable(d.colors.primary, d.colors.card_bg, 4.5); }
    // A soft box is a light tint: the text on it must stay readable.
    if (contrast(d.colors.text, d.colors.soft) < 4.5) { fixes.push('soft'); d.colors.soft = d.colors.card_bg; }
    // The page around the card: its own small words (footer) must stay readable.
    d.footer_text = readable('#5b6578', d.colors.page_bg);
    d.button_text = readable('#ffffff', d.colors.primary);
    d.link = contrast(d.colors.primary, d.colors.card_bg) >= 4.5 ? d.colors.primary : d.colors.heading;
    // Names and reasons of an AI proposal, when there are some.
    for (const k of ['name_fr', 'name_en']) if (src[k]) d[k] = words(src[k], 60);
    for (const k of ['rationale_fr', 'rationale_en']) if (src[k]) d[k] = words(src[k], 400);
    return { design: d, fixes };
}

module.exports = {
    FONTS, PRESETS, HEADERS, LOGOS, ALIGNS, SHAPES, WIDTHS, SPACINGS, POINTS, CARDS, COLOR_KEYS, BRAND, LAYOUTS,
    preset, palette, clean, contrast, readable, hex,
};
