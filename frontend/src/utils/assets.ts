/**
 * Asset paths configuration for reliable deployment
 * Ensures proper asset loading in both development and production environments
 */

// Import build-handled assets from src (hashed and optimized by Vite)
// For logo and other brand-critical assets kept under src/assets
import LOGO_MAIN from '../assets/Logo.png';

// Base path for public assets - automatically handled by Vite in production
// When you reference files that live under /public, use getAssetPath.
const ASSET_BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Get the full path for an asset that lives in the public/ directory
 * @param assetPath - Relative path to the asset from the public directory (e.g., "images/bg.jpg")
 * @returns Full asset path with correct base prefix
 */
export const getAssetPath = (assetPath: string): string => {
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  return `${ASSET_BASE_PATH}${cleanPath}`;
};

/**
 * Predefined asset paths for the application
 * Centralized management of all asset references
 * - For src-based assets, export the imported URLs (ensures bundling and hashing)
 * - For public assets, use getAssetPath()
 */
export const ASSET_PATHS = {
  LOGOS: {
    MAIN: LOGO_MAIN, // src-managed (recommended for brand logo)
  },
  // Example placeholders for organizing other assets
  IMAGES: {
    // EXAMPLE_BG: getAssetPath('images/example-bg.jpg'), // public/images/example-bg.jpg
  },
  VIDEOS: {
    // INTRO: getAssetPath('videos/intro.mp4'),
  },
  DOCUMENTS: {
    // BROCHURE: getAssetPath('docs/brochure.pdf'),
  },
} as const;

export type AssetPaths = typeof ASSET_PATHS;
export { LOGO_MAIN };
