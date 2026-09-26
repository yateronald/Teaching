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
  // Exam candidates and company managers have no live classes: nothing to watch for them.
  const noClasses = user?.role === 'candidate' || user?.role === 'org_admin';
  const signedIn = !!user?.id && !noClasses;
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const checkActive = useCallback(async () => {
    if (!user || user.role === 'candidate' || user.role === 'org_admin') {
      setActiveMeeting(null);
      setHasActiveMeeting(false);
      return;
    }
    try {
      const resp = await apiCallRef.current('/meetings');
      if (!resp.ok) return;
      const list = await resp.json();
      if (!Array.isArray(list)) return;

      // Live only once the teacher has started the class ("active"). A class whose
      // time slot has begun, or that the teacher merely opened ("waiting"), is not live.
      const found = list.find((m: any) => m.status === 'active');

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
