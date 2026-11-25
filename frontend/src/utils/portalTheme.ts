import type React from 'react';
import type { ThemeConfig } from 'antd';

export type LoginLayout = 'split' | 'centered' | 'minimal';
export type HeroStyle = 'geometric' | 'gradient' | 'solid' | 'cover';
export type SurfaceTone = 'clean' | 'warm' | 'slate';
export type ButtonStyle = 'rounded' | 'pill' | 'sharp';

export interface PortalBranding {
  primary_color: string;
  secondary_color: string;
  surface_tone: SurfaceTone;
  login_layout: LoginLayout;
  hero_style: HeroStyle;
  cover_overlay: number;
  button_style: ButtonStyle;
  tagline: string;
  headline: string;
  welcome_message: string;
  highlights: string[] | null;
  show_highlights: boolean;
  website_url: string;
  support_email: string;
  footer_text: string;
  hide_back_to_home: boolean;
  hide_powered_by: boolean;
  security_badge: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  nameFr: string;
  primary_color: string;
  secondary_color: string;
  surface_tone: SurfaceTone;
  hero_style: HeroStyle;
}

export const DEFAULT_PORTAL_BRANDING: PortalBranding = {
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
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    nameFr: 'Bleu Nuit',
    primary_color: '#16325C',
    secondary_color: '#0F766E',
    surface_tone: 'clean',
    hero_style: 'geometric',
  },
  {
    id: 'forest-emerald',
    name: 'Forest Emerald',
    nameFr: 'Émeraude',
    primary_color: '#065F46',
    secondary_color: '#0EA5E9',
    surface_tone: 'clean',
    hero_style: 'gradient',
  },
  {
    id: 'slate-amber',
    name: 'Slate & Amber',
    nameFr: 'Ardoise & Ambre',
    primary_color: '#1E293B',
    secondary_color: '#D97706',
    surface_tone: 'warm',
    hero_style: 'geometric',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    nameFr: 'Indigo Royal',
    primary_color: '#312E81',
    secondary_color: '#2563EB',
    surface_tone: 'slate',
    hero_style: 'gradient',
  },
  {
    id: 'bordeaux',
    name: 'Bordeaux Editorial',
    nameFr: 'Bordeaux',
    primary_color: '#7F1D1D',
    secondary_color: '#B45309',
    surface_tone: 'warm',
    hero_style: 'solid',
  },
  {
    id: 'carbon',
    name: 'Carbon Modern',
    nameFr: 'Carbone',
    primary_color: '#18181B',
    secondary_color: '#0284C7',
    surface_tone: 'clean',
    hero_style: 'geometric',
  },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SURFACE_MAP: Record<SurfaceTone, string> = {
  clean: '#F8FAFC',
  warm: '#FAF8F4',
  slate: '#EFF3F8',
};
const SHELL_SURFACE_MAP: Record<SurfaceTone, string> = {
  clean: '#F4F6F8',
  warm: '#F7F4EE',
  slate: '#EDF2F7',
};

export function validateHex(val: string): boolean {
  return HEX_RE.test(String(val || '').trim());
}

export function validateHttpsUrl(raw: string): boolean {
  const s = String(raw || '').trim();
  if (!s) return true;
  try {
    const u = new URL(s);
    const host = u.hostname.toLowerCase();
    if (u.protocol !== 'https:' || u.username || u.password) return false;
    if (!host.includes('.') || host === 'localhost' || host.endsWith('.local')) return false;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || host.includes(':')) return false;
    return true;
  } catch {
    return false;
  }
}

export function normalizePortalBranding(raw: unknown): PortalBranding {
  const src = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Partial<PortalBranding>)
    : {};
  const layout = (['split', 'centered', 'minimal'] as const).includes(src.login_layout as LoginLayout)
    ? (src.login_layout as LoginLayout)
    : DEFAULT_PORTAL_BRANDING.login_layout;
  const hero = (['geometric', 'gradient', 'solid', 'cover'] as const).includes(src.hero_style as HeroStyle)
    ? (src.hero_style as HeroStyle)
    : DEFAULT_PORTAL_BRANDING.hero_style;
  const tone = (['clean', 'warm', 'slate'] as const).includes(src.surface_tone as SurfaceTone)
    ? (src.surface_tone as SurfaceTone)
    : DEFAULT_PORTAL_BRANDING.surface_tone;
  const btn = (['rounded', 'pill', 'sharp'] as const).includes(src.button_style as ButtonStyle)
    ? (src.button_style as ButtonStyle)
    : DEFAULT_PORTAL_BRANDING.button_style;

  const overlayNum = Number(src.cover_overlay);
  const cover_overlay = Number.isFinite(overlayNum)
    ? Math.min(85, Math.max(35, Math.round(overlayNum)))
    : DEFAULT_PORTAL_BRANDING.cover_overlay;

  const primary = typeof src.primary_color === 'string' && HEX_RE.test(src.primary_color)
    ? src.primary_color.toUpperCase()
    : DEFAULT_PORTAL_BRANDING.primary_color;
  const secondary = typeof src.secondary_color === 'string' && HEX_RE.test(src.secondary_color)
    ? src.secondary_color.toUpperCase()
    : DEFAULT_PORTAL_BRANDING.secondary_color;

  const highlights = Array.isArray(src.highlights)
    ? src.highlights.map(x => String(x || '').trim().slice(0, 36)).filter(Boolean).slice(0, 4)
    : null;

  const website = typeof src.website_url === 'string' && validateHttpsUrl(src.website_url)
    ? src.website_url.trim().slice(0, 200)
    : '';
  const supportEmail = typeof src.support_email === 'string' && EMAIL_RE.test(src.support_email.trim())
    ? src.support_email.trim().toLowerCase().slice(0, 120)
    : '';

  return {
    primary_color: primary,
    secondary_color: secondary,
    surface_tone: tone,
    login_layout: layout,
    hero_style: hero,
    cover_overlay,
    button_style: btn,
    tagline: String(src.tagline || '').trim().slice(0, 80),
    headline: String(src.headline || '').trim().slice(0, 110),
    welcome_message: String(src.welcome_message || '').trim().slice(0, 240),
    highlights,
    show_highlights: typeof src.show_highlights === 'boolean' ? src.show_highlights : DEFAULT_PORTAL_BRANDING.show_highlights,
    website_url: website,
    support_email: supportEmail,
    footer_text: String(src.footer_text || '').trim().slice(0, 140),
    hide_back_to_home: typeof src.hide_back_to_home === 'boolean' ? src.hide_back_to_home : DEFAULT_PORTAL_BRANDING.hide_back_to_home,
    hide_powered_by: typeof src.hide_powered_by === 'boolean' ? src.hide_powered_by : DEFAULT_PORTAL_BRANDING.hide_powered_by,
    security_badge: typeof src.security_badge === 'boolean' ? src.security_badge : DEFAULT_PORTAL_BRANDING.security_badge,
  };
}

function parseHex(hex: string): [number, number, number] {
  const clean = HEX_RE.test(hex) ? hex.slice(1) : '16325C';
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function mixHex(hexA: string, hexB: string, ratio: number): string {
  const t = Math.min(1, Math.max(0, ratio));
  const [r1, g1, b1] = parseHex(hexA);
  const [r2, g2, b2] = parseHex(hexB);
  const ch = (a: number, b: number) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0');
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`.toUpperCase();
}

export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Accessible foreground (#FFFFFF or #0F172A) on top of a solid hex fill. */
export function contrastForeground(hex: string): '#FFFFFF' | '#0F172A' {
  return relativeLuminance(hex) > 0.42 ? '#0F172A' : '#FFFFFF';
}

export function isLightColor(hex: string): boolean {
  return relativeLuminance(hex) > 0.65;
}

/** Ensures white hero typography stays high-contrast regardless of brand tint. */
function heroShade(hex: string, darkMix: number): string {
  return relativeLuminance(hex) > 0.28 ? mixHex(hex, '#09111F', Math.min(0.88, darkMix + 0.24)) : mixHex(hex, '#09111F', darkMix);
}

export function portalCssVars(b: PortalBranding): React.CSSProperties {
  const primary = HEX_RE.test(b.primary_color) ? b.primary_color : DEFAULT_PORTAL_BRANDING.primary_color;
  const secondary = HEX_RE.test(b.secondary_color) ? b.secondary_color : DEFAULT_PORTAL_BRANDING.secondary_color;
  const hoverColor = relativeLuminance(primary) > 0.55
    ? mixHex(primary, '#000000', 0.14)
    : mixHex(primary, '#070D19', 0.22);

  const btnRadius = b.button_style === 'pill' ? '999px' : b.button_style === 'sharp' ? '6px' : '10px';
  const inputRadius = b.button_style === 'sharp' ? '6px' : '10px';

  return {
    '--cp-primary': primary,
    '--cp-primary-hover': hoverColor,
    '--cp-primary-fg': contrastForeground(primary),
    '--cp-primary-soft': hexToRgba(primary, 0.08),
    '--cp-primary-line': hexToRgba(primary, 0.22),
    '--cp-primary-ring': hexToRgba(primary, 0.14),
    '--cp-primary-shadow': hexToRgba(primary, 0.34),
    '--cp-secondary': secondary,
    '--cp-secondary-soft': hexToRgba(secondary, 0.12),
    '--cp-hero-deep': heroShade(primary, 0.56),
    '--cp-hero-mid': heroShade(primary, 0.32),
    '--cp-hero-glow': heroShade(secondary, 0.25),
    '--cp-surface': SURFACE_MAP[b.surface_tone] || SURFACE_MAP.clean,
    '--cp-radius-btn': btnRadius,
    '--cp-radius-input': inputRadius,
    '--cp-overlay-alpha': String((b.cover_overlay || 62) / 100),
  } as React.CSSProperties;
}

/** Ant Design ConfigProvider theme matching the organization's portal palette. */
export function portalAntdTheme(branding: PortalBranding, extraToken?: Record<string, unknown>): ThemeConfig {
  const primary = HEX_RE.test(branding.primary_color) ? branding.primary_color : DEFAULT_PORTAL_BRANDING.primary_color;
  const hoverColor = relativeLuminance(primary) > 0.55
    ? mixHex(primary, '#000000', 0.14)
    : mixHex(primary, '#070D19', 0.22);
  const borderRadius = branding.button_style === 'sharp' ? 6 : 8;
  const btnRadius = branding.button_style === 'pill' ? 999 : borderRadius;

  return {
    token: {
      colorPrimary: primary,
      colorLink: primary,
      colorLinkHover: hoverColor,
      borderRadius,
      ...extraToken,
    },
    components: {
      Button: {
        borderRadius: btnRadius,
        primaryColor: contrastForeground(primary),
      },
    },
  };
}

/** Shell accent & signed-in workspace CSS variables from the company's branding. */
export function shellAccentVars(brandingOrHex?: PortalBranding | string | null): Record<string, string> | undefined {
  if (!brandingOrHex) return undefined;
  const b: PortalBranding = typeof brandingOrHex === 'string'
    ? { ...DEFAULT_PORTAL_BRANDING, primary_color: brandingOrHex }
    : normalizePortalBranding(brandingOrHex);
  const primary = HEX_RE.test(b.primary_color) ? b.primary_color : DEFAULT_PORTAL_BRANDING.primary_color;
  if (typeof brandingOrHex === 'string' && !HEX_RE.test(brandingOrHex)) return undefined;
  const secondary = HEX_RE.test(b.secondary_color) ? b.secondary_color : DEFAULT_PORTAL_BRANDING.secondary_color;
  const hoverColor = relativeLuminance(primary) > 0.55
    ? mixHex(primary, '#000000', 0.14)
    : mixHex(primary, '#070D19', 0.22);
  const accentDeep = relativeLuminance(primary) > 0.35
    ? heroShade(primary, 0.28)
    : primary;
  const accentActive = heroShade(primary, 0.42);
  const btnRadius = b.button_style === 'pill' ? '999px' : b.button_style === 'sharp' ? '6px' : '8px';

  return {
    '--al-accent': primary,
    '--al-accent-deep': accentDeep,
    '--al-accent-fg': contrastForeground(primary),
    '--al-accent-soft': hexToRgba(primary, 0.09),
    '--al-accent-line': hexToRgba(primary, 0.26),
    '--al-secondary': secondary,
    '--al-secondary-soft': hexToRgba(secondary, 0.12),
    '--al-page': SHELL_SURFACE_MAP[b.surface_tone] || SHELL_SURFACE_MAP.clean,
    '--al-brand-bar': `linear-gradient(90deg, ${primary}, ${secondary})`,
    '--al-btn-radius': btnRadius,
    '--org-accent': primary,
    '--org-accent-deep': accentDeep,
    '--org-accent-hover': hoverColor,
    '--org-accent-active': accentActive,
    '--org-accent-fg': contrastForeground(primary),
    '--org-accent-soft': hexToRgba(primary, 0.09),
    '--org-accent-line': hexToRgba(primary, 0.28),
    '--org-secondary': secondary,
    '--org-secondary-soft': hexToRgba(secondary, 0.12),
    '--org-hero-deep': heroShade(primary, 0.56),
    '--org-hero-mid': heroShade(primary, 0.30),
    '--org-hero-glow': hexToRgba(secondary, 0.32),
    '--org-hero-accent': mixHex(secondary, '#FFFFFF', 0.48),
    '--org-hero-shadow': hexToRgba(primary, 0.45),
    '--org-ep-tint-a': hexToRgba(primary, 0.10),
    '--org-ep-tint-b': hexToRgba(secondary, 0.07),
    '--org-ep-bg-start': mixHex(primary, '#FFFFFF', 0.94),
    '--org-ep-grid': hexToRgba(primary, 0.06),
    '--org-pf-cover': `radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1.2px) 0 0 / 14px 14px, linear-gradient(135deg, ${heroShade(primary, 0.45)} 0%, ${primary} 58%, ${secondary} 100%)`,
    '--fp-accent': primary,
    '--fp-accent-dark': hoverColor,
    '--fp-paper': SURFACE_MAP[b.surface_tone] || SURFACE_MAP.clean,
  };
}
