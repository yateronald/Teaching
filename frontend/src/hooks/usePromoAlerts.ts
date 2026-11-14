import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { acquireSocket, releaseSocket } from '../utils/realtime';

/**
 * How many people registered for a marketing campaign and have not been
 * answered yet (registrations still marked "New").
 *
 * Like the demo requests: read when the console opens, raised the moment
 * someone registers (a live event), and re-read on a slow poll and whenever
 * the administrator moves between pages, since answering lowers it.
 */

export interface PromoAlert {
    promotion_id: number;
    title: string;
    full_name: string;
}

const POLL_MS = 120_000;

export function usePromoAlerts(enabled: boolean, onArrive?: (registration: PromoAlert) => void) {
    const { apiCall, token } = useAuth();
    const { pathname } = useLocation();
    const [waiting, setWaiting] = useState(0);
    const arrive = useRef(onArrive);
    arrive.current = onArrive;

    const refresh = useCallback(async () => {
        if (!enabled) return;
        try {
            const res = await apiCall('/admin/promotions/alerts');
            // Not installed yet (the migration has not run): simply no badge.
            if (!res.ok) return;
            const data = await res.json();
            setWaiting(Math.max(0, Number(data?.waiting) || 0));
        } catch { /* the badge is not worth an error on screen */ }
    }, [apiCall, enabled]);

    useEffect(() => { refresh(); }, [refresh, pathname]);

    useEffect(() => {
        if (!enabled) return;
        const timer = window.setInterval(refresh, POLL_MS);
        return () => window.clearInterval(timer);
    }, [enabled, refresh]);

    useEffect(() => {
        if (!enabled || !token) return;
        const socket = acquireSocket();
        const onNew = (payload: PromoAlert & { waiting?: number }) => {
            setWaiting(prev => (typeof payload.waiting === 'number' ? payload.waiting : prev + 1));
            arrive.current?.(payload);
        };
        socket.on('promo:registration', onNew);
        return () => { socket.off('promo:registration', onNew); releaseSocket(); };
    }, [enabled, token]);

    return { waiting, refresh };
}

export default usePromoAlerts;
