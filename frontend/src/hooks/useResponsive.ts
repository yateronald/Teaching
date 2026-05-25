import { useEffect, useState } from 'react';

/**
 * Single source of truth for layout breakpoints.
 *
 * The platform uses a four-tier scale:
 *   ───────────────────────────────────────────────────────────────────
 *   xs (mobile)   |  width <  768  → off-canvas drawer, single column
 *   sm (tablet)   |  768 – 1023    → icon-rail sidebar, condensed cards
 *   md (laptop)   |  1024 – 1439   → comfortable rail (collapsible)
 *   lg (desktop)  |  ≥ 1440        → expanded sidebar with welcome banner
 *   ───────────────────────────────────────────────────────────────────
 *
 * Use the named flags rather than reading `width` directly so behaviour
 * stays consistent across components.
 */
export const BREAKPOINTS = {
    /** Below this we collapse the sidebar into an off-canvas drawer. */
    mobile: 768,
    /** Below this we keep the sidebar in icon-rail mode. */
    tablet: 1024,
    /** Below this the sidebar is auto-collapsed but can be expanded. */
    laptop: 1280,
    /** At this width and above we show the welcome banner + comfortable padding. */
    desktop: 1440,
} as const;

export interface ResponsiveState {
    width: number;
    height: number;
    /** width < 768 — phones / very small laptops in split-screen */
    isMobile: boolean;
    /** 768 ≤ width < 1024 — tablets, half-screen browser windows */
    isTablet: boolean;
    /** 1024 ≤ width < 1280 — common 13–14" laptop screens */
    isLaptop: boolean;
    /** 1280 ≤ width < 1440 — small desktops, large laptops */
    isSmallDesktop: boolean;
    /** width ≥ 1440 — comfortable desktop / 2K monitors */
    isDesktop: boolean;
    /** Convenience: width < 1024 (mobile + tablet) */
    isCompact: boolean;
    /** Convenience: width < 1280 — collapse sidebar by default */
    shouldCollapseSidebar: boolean;
    /** Convenience: width < 768 — render sidebar inside a Drawer */
    shouldUseDrawer: boolean;
}

const getState = (): ResponsiveState => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    return {
        width,
        height,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isLaptop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.laptop,
        isSmallDesktop: width >= BREAKPOINTS.laptop && width < BREAKPOINTS.desktop,
        isDesktop: width >= BREAKPOINTS.desktop,
        isCompact: width < BREAKPOINTS.tablet,
        shouldCollapseSidebar: width < BREAKPOINTS.laptop,
        shouldUseDrawer: width < BREAKPOINTS.mobile,
    };
};

/**
 * Subscribe to viewport changes. Re-renders only when a flag actually flips.
 * The callback list inside React is naturally batched so this is cheap.
 */
export default function useResponsive(): ResponsiveState {
    const [state, setState] = useState<ResponsiveState>(getState);

    useEffect(() => {
        let frame = 0;
        const onResize = () => {
            // Throttle to one update per animation frame to dodge resize-storms
            // some OS-level zooming triggers (Chrome on Windows is notorious).
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => setState(getState()));
        };
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(frame);
        };
    }, []);

    return state;
}
