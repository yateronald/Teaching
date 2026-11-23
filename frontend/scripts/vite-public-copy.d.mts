import type { Plugin } from 'vite';
/** Copies public/ into dist/ except public/learn/ (see vite-public-copy.mjs). */
export default function copyPublicWithoutLearnMedia(): Plugin;
