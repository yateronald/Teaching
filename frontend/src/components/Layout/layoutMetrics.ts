/**
 * Geometry of the app shell (Layout.tsx / Layout.css), shared with pages that
 * pin elements under the fixed top bar — e.g. antd `<Table sticky={{ offsetHeader }} />`.
 * Keep these in sync with the `.al-header` heights in Layout.css.
 */
export const HEADER_HEIGHT = 60;
export const HEADER_HEIGHT_MOBILE = 56;

/** Height of the fixed top bar for the current viewport (mobile = drawer mode, < 768px). */
export const headerHeight = (isMobile: boolean) => (isMobile ? HEADER_HEIGHT_MOBILE : HEADER_HEIGHT);
