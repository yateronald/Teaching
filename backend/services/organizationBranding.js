/**
 * Validation, normalization and security hardening for white-label company
 * portal branding (`/o/<slug>`, sign-in hints, company space, invitations).
 *
 * Every field is strictly validated server-side:
 *   - Colors must be 6-digit hex codes (#RRGGBB).
 *   - Website links must use https:// pointing to a public domain (never
 *     javascript:, data:, localhost or private IP literals).
 *   - Strings strip control characters and enforce strict length bounds.
 *   - Platform-level white-label entitlements (`hide_powered_by`) can only be
 *     changed when `allowAdminFields` is true.
 */
const { OrgError } = require('./organizationService');

const LAYOUTS = ['split', 'centered', 'minimal'];
const HERO_STYLES = ['geometric', 'gradient', 'solid', 'cover'];
const SURFACE_TONES = ['clean', 'warm', 'slate'];
const BUTTON_STYLES = ['rounded', 'pill', 'sharp'];

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;
const RESERVED_SLUGS = new Set([
    'admin', 'api', 'app', 'auth', 'login', 'logout', 'o', 'org', 'public',
    'static', 'assets', 'meeting', 'meetings', 'learn', 'offers', 'fr', 'en',
    'register', 'reset', 'demo', 'pricing', 'privacy', 'terms', 'contact',
]);

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CTRL_RE = /[\u0000-\u001f\u007f]/g;

const DEFAULTS = Object.freeze({
    primary_color: '#16325C',
    secondary_color: '#0F766E',
    surface_tone: 'clean',
    login_layout: 'split',
    hero_style: 'geometric',
    cover_overlay: 62,
    button_style: 'rounded',
    tagline: '',
    headline: '',
    welcome_message: '',
    highlights: null,
    show_highlights: true,
    website_url: '',
    support_email: '',
    footer_text: '',
    hide_back_to_home: true,
    hide_powered_by: true,
    security_badge: true,
});

const LIMITS = {
    tagline: 80,
    headline: 110,
    welcome_message: 240,
    footer_text: 140,
    highlight_item: 36,
    highlights_max: 4,
    website_url: 200,
    support_email: 120,
};

const cleanText = (val) => String(val ?? '').replace(CTRL_RE, '').replace(/\s+/g, ' ').trim();

function isPrivateOrLocalHost(hostname) {
    const h = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
    if (!h || h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true;
    if (!h.includes('.')) return true;
    // Block IPv4 literals including private/loopback/link-local ranges and bare IPv6 literals.
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(h)) return true;
    if (h.includes(':')) return true;
    return false;
}

function validateWebsiteUrl(raw) {
    const clean = cleanText(raw);
    if (!clean) return '';
    if (clean.length > LIMITS.website_url) {
        throw new OrgError('BAD_WEBSITE_URL', `Website URL is limited to ${LIMITS.website_url} characters.`);
    }
    let parsed;
    try {
        parsed = new URL(clean);
    } catch {
        throw new OrgError('BAD_WEBSITE_URL', 'Website URL must start with https:// and point to a public domain.');
    }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password || isPrivateOrLocalHost(parsed.hostname)) {
        throw new OrgError('BAD_WEBSITE_URL', 'Website URL must start with https:// and point to a public domain.');
    }
    return clean;
}

function safeWebsiteUrl(raw) {
    try {
        return validateWebsiteUrl(raw);
    } catch {
        return '';
    }
}

/** Ensures stored JSONB produces a safe, complete branding object. */
function normalizeBranding(raw) {
    const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const primary = typeof src.primary_color === 'string' && HEX_RE.test(src.primary_color)
        ? src.primary_color.toUpperCase()
        : DEFAULTS.primary_color;
    const secondary = typeof src.secondary_color === 'string' && HEX_RE.test(src.secondary_color)
        ? src.secondary_color.toUpperCase()
        : DEFAULTS.secondary_color;
    const overlayNum = Number(src.cover_overlay);
    const cover_overlay = Number.isFinite(overlayNum)
        ? Math.min(85, Math.max(35, Math.round(overlayNum)))
        : DEFAULTS.cover_overlay;

    let highlights = null;
    if (Array.isArray(src.highlights)) {
        highlights = src.highlights
            .map(item => cleanText(item).slice(0, LIMITS.highlight_item))
            .filter(Boolean)
            .slice(0, LIMITS.highlights_max);
    }

    const supportEmailClean = cleanText(src.support_email).toLowerCase();
    return {
        primary_color: primary,
        secondary_color: secondary,
        surface_tone: SURFACE_TONES.includes(src.surface_tone) ? src.surface_tone : DEFAULTS.surface_tone,
        login_layout: LAYOUTS.includes(src.login_layout) ? src.login_layout : DEFAULTS.login_layout,
        hero_style: HERO_STYLES.includes(src.hero_style) ? src.hero_style : DEFAULTS.hero_style,
        cover_overlay,
        button_style: BUTTON_STYLES.includes(src.button_style) ? src.button_style : DEFAULTS.button_style,
        tagline: cleanText(src.tagline).slice(0, LIMITS.tagline),
        headline: cleanText(src.headline).slice(0, LIMITS.headline),
        welcome_message: cleanText(src.welcome_message).slice(0, LIMITS.welcome_message),
        highlights,
        show_highlights: typeof src.show_highlights === 'boolean' ? src.show_highlights : DEFAULTS.show_highlights,
        website_url: safeWebsiteUrl(src.website_url),
        support_email: supportEmailClean && EMAIL_RE.test(supportEmailClean) && supportEmailClean.length <= LIMITS.support_email
            ? supportEmailClean
            : '',
        footer_text: cleanText(src.footer_text).slice(0, LIMITS.footer_text),
        hide_back_to_home: typeof src.hide_back_to_home === 'boolean' ? src.hide_back_to_home : DEFAULTS.hide_back_to_home,
        hide_powered_by: typeof src.hide_powered_by === 'boolean' ? src.hide_powered_by : DEFAULTS.hide_powered_by,
        security_badge: typeof src.security_badge === 'boolean' ? src.security_badge : DEFAULTS.security_badge,
    };
}

/**
 * Validates and merges a branding update onto `current`.
 * Rejects malformed colors, non-https URLs, invalid enums and overlong copy.
 */
function validateBrandingPatch(input, { current = {}, allowAdminFields = false } = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        throw new OrgError('BAD_BRANDING', 'Portal branding settings must be an object.');
    }
    const base = normalizeBranding(current);
    const out = { ...base };

    if ('primary_color' in input) {
        const c = cleanText(input.primary_color).toUpperCase();
        if (!HEX_RE.test(c)) throw new OrgError('BAD_COLOR', 'Primary color must be a valid 6-digit hex color (#RRGGBB).');
        out.primary_color = c;
    }
    if ('secondary_color' in input) {
        const c = cleanText(input.secondary_color).toUpperCase();
        if (!HEX_RE.test(c)) throw new OrgError('BAD_COLOR', 'Accent color must be a valid 6-digit hex color (#RRGGBB).');
        out.secondary_color = c;
    }
    if ('surface_tone' in input) {
        if (!SURFACE_TONES.includes(input.surface_tone)) throw new OrgError('BAD_BRANDING', 'Unsupported surface tone.');
        out.surface_tone = input.surface_tone;
    }
    if ('login_layout' in input) {
        if (!LAYOUTS.includes(input.login_layout)) throw new OrgError('BAD_BRANDING', 'Unsupported login layout.');
        out.login_layout = input.login_layout;
    }
    if ('hero_style' in input) {
        if (!HERO_STYLES.includes(input.hero_style)) throw new OrgError('BAD_BRANDING', 'Unsupported background style.');
        out.hero_style = input.hero_style;
    }
    if ('button_style' in input) {
        if (!BUTTON_STYLES.includes(input.button_style)) throw new OrgError('BAD_BRANDING', 'Unsupported button style.');
        out.button_style = input.button_style;
    }
    if ('cover_overlay' in input) {
        const n = Number(input.cover_overlay);
        if (!Number.isFinite(n) || n < 35 || n > 85) {
            throw new OrgError('BAD_BRANDING', 'Cover overlay darkness must be between 35 and 85.');
        }
        out.cover_overlay = Math.round(n);
    }

    for (const key of ['tagline', 'headline', 'welcome_message', 'footer_text']) {
        if (key in input) {
            const val = cleanText(input[key]);
            if (val.length > LIMITS[key]) {
                throw new OrgError('BAD_BRANDING', `${key.replace('_', ' ')} is limited to ${LIMITS[key]} characters.`);
            }
            out[key] = val;
        }
    }

    if ('highlights' in input) {
        if (input.highlights === null) {
            out.highlights = null;
        } else if (!Array.isArray(input.highlights)) {
            throw new OrgError('BAD_BRANDING', 'Highlights must be a list of short badges.');
        } else {
            if (input.highlights.length > LIMITS.highlights_max) {
                throw new OrgError('BAD_BRANDING', `At most ${LIMITS.highlights_max} highlight badges are allowed.`);
            }
            const items = [];
            for (const rawItem of input.highlights) {
                const item = cleanText(rawItem);
                if (!item) continue;
                if (item.length > LIMITS.highlight_item) {
                    throw new OrgError('BAD_BRANDING', `Each highlight badge is limited to ${LIMITS.highlight_item} characters.`);
                }
                items.push(item);
            }
            out.highlights = items;
        }
    }

    if ('website_url' in input) {
        out.website_url = validateWebsiteUrl(input.website_url);
    }
    if ('support_email' in input) {
        const em = cleanText(input.support_email).toLowerCase();
        if (!em) {
            out.support_email = '';
        } else if (!EMAIL_RE.test(em) || em.length > LIMITS.support_email) {
            throw new OrgError('BAD_EMAIL', 'Enter a valid support email address.');
        } else {
            out.support_email = em;
        }
    }

    for (const boolKey of ['show_highlights', 'hide_back_to_home', 'security_badge']) {
        if (boolKey in input) {
            if (typeof input[boolKey] !== 'boolean') {
                throw new OrgError('BAD_BRANDING', `Invalid value for ${boolKey}.`);
            }
            out[boolKey] = input[boolKey];
        }
    }

    if (allowAdminFields && 'hide_powered_by' in input) {
        if (typeof input.hide_powered_by !== 'boolean') {
            throw new OrgError('BAD_BRANDING', 'Invalid value for hide_powered_by.');
        }
        out.hide_powered_by = input.hide_powered_by;
    } else {
        // Non-admin callers never alter the white-label entitlement flag.
        out.hide_powered_by = base.hide_powered_by;
    }

    return out;
}

/** Validates a custom organization portal slug (`/o/<slug>`). */
function validateSlug(raw) {
    const slug = String(raw ?? '').trim().toLowerCase();
    if (!SLUG_RE.test(slug) || RESERVED_SLUGS.has(slug)) {
        throw new OrgError('BAD_SLUG', 'Portal URL must use lowercase letters, numbers and hyphens (2 to 80 characters, not a reserved path).');
    }
    return slug;
}

module.exports = {
    DEFAULTS,
    LAYOUTS,
    HERO_STYLES,
    SURFACE_TONES,
    BUTTON_STYLES,
    RESERVED_SLUGS,
    SLUG_RE,
    normalizeBranding,
    validateBrandingPatch,
    validateSlug,
};
