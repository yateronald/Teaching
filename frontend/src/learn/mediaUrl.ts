// Media CDN base URL: empty in local dev (serves from Vite public/learn/),
// set to https://media.learnfrenchwithnatives.com in production (Cloudflare R2).
const RAW_MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE_URL ?? '').trim().replace(/\/+$/, '');

export const MEDIA_BASE = RAW_MEDIA_BASE;

/** Prefix a /learn/... media path with VITE_MEDIA_BASE_URL when configured. */
export const mediaUrl = (path: string): string => (MEDIA_BASE ? `${MEDIA_BASE}${path}` : path);

/** Turn either a full URL or a site-relative path into an absolute URL for OG/JSON-LD tags. */
export const absoluteMediaUrl = (urlOrPath: string): string =>
  (/^https?:\/\//.test(urlOrPath) ? urlOrPath : `https://www.learnfrenchwithnatives.com${urlOrPath}`);
