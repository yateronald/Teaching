/**
 * A file the API serves under a path like "/api/public/org/acme/logo?v=…"
 * (as the server returns it), as a full URL on the API host.
 */
export function apiAsset(path: string): string {
    const base = String(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
    return /^https?:\/\//i.test(path) ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
