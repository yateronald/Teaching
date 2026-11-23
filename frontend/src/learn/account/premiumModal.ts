// External state store for the global Premium information & upgrade modal.
import type { Tier } from '../access';
import type { Level } from '../types';

export interface PremiumModalContext {
  title: string;
  subtitle?: string;
  tier: Tier;
  kind?: 'course' | 'lesson' | 'practice' | 'game';
  level?: Level | string;
  to?: string;
}

let modalCtx: PremiumModalContext | null = null;
const modalListeners = new Set<() => void>();
const notifyModal = () => modalListeners.forEach(l => l());

export const subscribePremiumModal = (l: () => void) => {
  modalListeners.add(l);
  return () => { modalListeners.delete(l); };
};

export const getPremiumModalCtx = () => modalCtx;

export function openPremiumModal(ctx: PremiumModalContext) {
  modalCtx = ctx;
  notifyModal();
}

export function closePremiumModal() {
  if (!modalCtx) return;
  modalCtx = null;
  notifyModal();
}
