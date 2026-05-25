/**
 * socketUrl.ts
 *
 * Compute the Socket.IO server URL from VITE_API_BASE_URL.
 *
 * The trap we used to fall into:
 *   const SOCKET_URL = (VITE_API_BASE_URL || '...').replace('/api', '');
 *
 * In production VITE_API_BASE_URL is "https://api.learnfrenchwithnatives.com/api".
 * `String.replace('/api', '')` only replaces the FIRST occurrence — and the
 * first '/api' substring is in '://api.learn...', not the path suffix.
 * The result is 'https:/.learnfrenchwithnatives.com/api', and Socket.IO
 * interprets the malformed origin as host = 'https', producing
 * 'wss://https/socket.io/...'.
 *
 * This helper parses the URL and rebuilds it from origin only — robust to any
 * subdomain or path layout.
 */

const FALLBACK_API_BASE = 'https://api.learnfrenchwithnatives.com/api';

export function getSocketUrl(): string {
    const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) || FALLBACK_API_BASE;
    try {
        const u = new URL(raw);
        return u.origin; // e.g. "https://api.learnfrenchwithnatives.com"
    } catch {
        // Not a valid absolute URL (e.g. relative '/api'). Use current origin.
        if (typeof window !== 'undefined' && window.location?.origin) {
            return window.location.origin;
        }
        return FALLBACK_API_BASE.replace(/\/api$/, '');
    }
}
