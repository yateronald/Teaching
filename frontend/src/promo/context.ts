// What the campaign provider shares with every placement of the page.
import { createContext, useContext } from 'react';
import type { Lang, Placement, Promotion } from './model';

/** Which part of the site the page belongs to: decides how the flash behaves. */
export type Area = 'site' | 'learn' | 'offers';

export interface PromoApi {
  lang: Lang;
  area: Area;
  /** The campaigns that are live now (empty until loaded, and when there are none). */
  promos: Promotion[];
  loaded: boolean;
  /** Slugs this visitor registered for, on this device. */
  registered: string[];
  /** A click on a campaign: counts it, then opens its sheet or follows its link. */
  open: (promo: Promotion, placement: Placement) => void;
  /** True while a campaign's sheet is open. */
  sheetOpen: boolean;
}

export const PromoCtx = createContext<PromoApi>({ lang: 'en', area: 'site', promos: [], loaded: false, registered: [], open: () => {}, sheetOpen: false });
export const usePromo = () => useContext(PromoCtx);

