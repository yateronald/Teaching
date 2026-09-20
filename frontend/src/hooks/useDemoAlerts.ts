import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { acquireSocket, releaseSocket } from '../utils/realtime';

/**
 * How many people asked for a demo class and are still waiting for an answer.
 *
 * The count arrives three ways, so it is never stale: once when the console
 * opens, the moment a request is submitted (a live event), and on a slow poll
 * in case a browser sat asleep. Picking a request up anywhere lowers it
 * everywhere, because the server tells every administrator.
 */

export interface DemoAlert {
    id: number;
    full_name: string;
    country: string | null;
    created_at: string;
}

interface Summary {
    waiting: number;
    today: number;
    latest: DemoAlert | null;
}

const POLL_MS = 90_000;

export function useDemoAlerts(enabled: boolean, onArrive?: (request: DemoAlert) => void) {
    const { apiCall, token } = useAuth();
    const [summary, setSummary] = useState<Summary>({ waiting: 0, today: 0, latest: null });
    const arrive = useRef(onArrive);
    arrive.current = onArrive;

    const refresh = useCallback(async () => {
        if (!enabled) return;
        try {
            const res = await apiCall('/demo-requests/alerts');
            if (!res.ok) return;
            setSummary(await res.json());
        } catch { /* the badge is not worth an error on screen */ }
    }, [apiCall, enabled]);

    useEffect(() => { refresh(); }, [refresh]);

    useEffect(() => {
        if (!enabled) return;
        const timer = window.setInterval(refresh, POLL_MS);
        // A tab that was asleep catches up the moment it is looked at again.
        const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
    }, [enabled, refresh]);

    useEffect(() => {
        if (!enabled || !token) return;
        const socket = acquireSocket();

        const onNew = (payload: DemoAlert & { waiting?: number }) => {
            setSummary(prev => ({
                waiting: typeof payload.waiting === 'number' ? payload.waiting : prev.waiting + 1,
                today: prev.today + 1,
                latest: payload,
            }));
            arrive.current?.(payload);
        };
        const onWaiting = (payload: { waiting: number }) => {
            setSummary(prev => ({ ...prev, waiting: Math.max(0, Number(payload?.waiting) || 0) }));
        };

        socket.on('demo:new', onNew);
        socket.on('demo:waiting', onWaiting);
        socket.on('connect', refresh);
        return () => {
            socket.off('demo:new', onNew);
            socket.off('demo:waiting', onWaiting);
            socket.off('connect', refresh);
            releaseSocket();
        };
    }, [enabled, token, refresh]);

    return { ...summary, refresh };
}

export default useDemoAlerts;
