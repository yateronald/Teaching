// Calls to the website's account API. The session is a cookie the page cannot
// read (HttpOnly): every call sends it with `credentials: 'include'`.
const API = String(import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export const apiUrl = (path: string) => `${API}${path}`;

export interface ApiError { status: number; code: string; error: string; [k: string]: unknown }

let modeObserver: ((mode: 'free' | 'premium') => void) | null = null;
export function setModeHeaderObserver(fn: ((mode: 'free' | 'premium') => void) | null) {
  modeObserver = fn;
}

export async function siteApi<T = Record<string, unknown>>(
  path: string,
  init: { method?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method: init.method || (init.body === undefined ? 'GET' : 'POST'),
      credentials: 'include',
      cache: 'no-store',
      headers: {
        ...(init.body === undefined ? { Accept: 'application/json' } : { 'Content-Type': 'application/json', Accept: 'application/json' }),
        ...(init.headers || {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw { status: 0, code: 'NETWORK', error: 'network' } satisfies ApiError;
  }
  const hdrMode = res.headers.get('X-Learn-Mode');
  if ((hdrMode === 'free' || hdrMode === 'premium') && modeObserver) {
    modeObserver(hdrMode);
  }
  let data: Record<string, unknown> = {};
  try { data = await res.json(); } catch { /* empty answer */ }
  if (!res.ok) throw { status: res.status, code: String(data.code || 'FAILED'), error: String(data.error || data.message || ''), ...data } satisfies ApiError;
  return data as T;
}
