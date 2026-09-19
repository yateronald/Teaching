import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { acquireSocket, releaseSocket } from '../utils/realtime';

const POLL_INTERVAL_MS = 30_000;

export interface ActiveMeetingSummary {
  id: number;
  title: string;
  room_name: string;
  teacher_id: number;
  batch_id: number | null;
  status: string;
}

export function useActiveMeeting() {
  const { user, apiCall } = useAuth();
  const [activeMeeting, setActiveMeeting] = useState<ActiveMeetingSummary | null>(null);
  const [hasActiveMeeting, setHasActiveMeeting] = useState(false);
  const signedIn = !!user?.id;
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const ms = (iso: string | null | undefined) => (iso ? new Date(iso).getTime() : NaN);

  const checkActive = useCallback(async () => {
    if (!user) {
      setActiveMeeting(null);
      setHasActiveMeeting(false);
      return;
    }
    try {
      const resp = await apiCallRef.current('/meetings');
      if (!resp.ok) return;
      const list = await resp.json();
      if (!Array.isArray(list)) return;

      const now = Date.now();
      // Live = actually running, or opened / scheduled and still within its time slot.
      // (A class the teacher opened but never started stays "waiting" — it must not
      // look live once its scheduled end has passed; the meetings list files it under Past.)
      const found = list.find((m: any) => {
        if (m.status === 'ended') return false;
        if (m.status === 'active') return true;
        const end = ms(m.scheduled_end);
        if (Number.isFinite(end) && now > end) return false;
        if (m.status === 'waiting') return true;
        const start = ms(m.scheduled_start);
        return Number.isFinite(start) && now >= start;
      });

      if (found) {
        setActiveMeeting({
          id: found.id,
          title: found.title,
          room_name: found.room_name,
          teacher_id: found.teacher_id,
          batch_id: found.batch_id,
          status: found.status,
        });
        setHasActiveMeeting(true);
      } else {
        setActiveMeeting(null);
        setHasActiveMeeting(false);
      }
    } catch {
      // silently ignore transient network failures
    }
  }, [user?.id]);

  useEffect(() => {
    checkActive();

    if (!signedIn) return;
    const socket = acquireSocket();
    const refresh = () => { checkActive(); };
    const events = ['connect', 'meeting:started', 'meeting:ended', 'meeting:waiting', 'meeting:created'];
    events.forEach(ev => socket.on(ev, refresh));

    const timer = window.setInterval(checkActive, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      events.forEach(ev => socket.off(ev, refresh));
      releaseSocket();
    };
  }, [checkActive, signedIn]);

  return { hasActiveMeeting, activeMeeting, refresh: checkActive };
}
