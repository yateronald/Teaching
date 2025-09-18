import type { CSSProperties } from 'react';
import { ASSET_PATHS } from './assets';

// Basic color utilities (tiny, safe, no deps)
const clamp = (num: number, min = 0, max = 255) => Math.min(Math.max(num, min), max);
const hexToRgb = (hex: string) => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
};
const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (v: number) => clamp(Math.round(v)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
const mix = (c1: string, c2: string, weight = 0.5) => {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const w = Math.min(Math.max(weight, 0), 1);
  return rgbToHex(a.r * (1 - w) + b.r * w, a.g * (1 - w) + b.g * w, a.b * (1 - w) + b.b * w);
};
const lighten = (hex: string, amount = 0.15) => mix(hex, '#ffffff', amount);
const darken = (hex: string, amount = 0.15) => mix(hex, '#000000', amount);

export const BRAND_CONFIG = {
  name: 'Learn French',
  logo: {
    main: ASSET_PATHS.LOGOS.MAIN,
  },
  colors: {
    primary: '#1D4ED8', // blue-700
    secondary: '#DB2777', // pink-600
    accent: '#F59E0B', // amber-500
  },
} as const;

export const COLOR_COMBINATIONS = {
  APP: {
    background: '#f5f7fb',
    text: '#111827',
  },
  HEADER: {
    background: darken(BRAND_CONFIG.colors.primary, 0.25),
    text: '#ffffff',
    accent: lighten(BRAND_CONFIG.colors.primary, 0.35),
  },
  CARD: {
    background: '#ffffff',
    text: '#1f2937',
    shadow: '0 6px 20px rgba(0,0,0,0.08)'
  },
} as const;

export const brandingUtils = {
  applyCSSVariables: () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', BRAND_CONFIG.colors.primary);
    root.style.setProperty('--brand-secondary', BRAND_CONFIG.colors.secondary);
    root.style.setProperty('--brand-accent', BRAND_CONFIG.colors.accent);

    root.style.setProperty('--brand-header-bg', COLOR_COMBINATIONS.HEADER.background);
    root.style.setProperty('--brand-header-text', COLOR_COMBINATIONS.HEADER.text);
    root.style.setProperty('--brand-header-accent', COLOR_COMBINATIONS.HEADER.accent);

    root.style.setProperty('--brand-app-bg', COLOR_COMBINATIONS.APP.background);
    root.style.setProperty('--brand-text', COLOR_COMBINATIONS.APP.text);

    root.style.setProperty('--brand-card-bg', COLOR_COMBINATIONS.CARD.background);
    root.style.setProperty('--brand-card-text', COLOR_COMBINATIONS.CARD.text);
    root.style.setProperty('--brand-card-shadow', COLOR_COMBINATIONS.CARD.shadow);

    // Optional: set theme-color for mobile UI
    const themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (themeMeta) themeMeta.setAttribute('content', COLOR_COMBINATIONS.HEADER.background);
  },

  getResponsiveLogoStyles: (area: 'header' | 'header-collapsed' | 'login'): CSSProperties => {
    switch (area) {
      case 'header':
        return {
          height: 36,
          width: 'auto',
          objectFit: 'contain',
        };
      case 'header-collapsed':
        return {
          height: 28,
          width: 'auto',
          objectFit: 'contain',
        };
      case 'login':
      default:
        return {
          height: 64,
          width: 'auto',
          objectFit: 'contain',
        };
    }
  },

  // Expose helpers for other components if needed
  mix,
  lighten,
  darken,
};

export type BrandConfig = typeof BRAND_CONFIG;
export type ColorCombos = typeof COLOR_COMBINATIONS;