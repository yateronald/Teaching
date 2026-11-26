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

interface RawMeetingItem {
  id: number;
  title: string;
  room_name: string;
  teacher_id: number;
  batch_id: number | null;
  status: string;
  is_currently_in_meeting?: boolean;
}

export function useActiveMeeting() {
  const { user, apiCall } = useAuth();
  const [activeMeeting, setActiveMeeting] = useState<ActiveMeetingSummary | null>(null);
  const [hasActiveMeeting, setHasActiveMeeting] = useState(false);
  // Admins never get the blinking live sidebar badge; exam candidates and company
  // managers have no live classes. Only teachers (for their own meeting) and
  // students (for their own enrolled batch's active class) watch live status.
  const disabled = !user?.id || user.role === 'admin' || user.role === 'candidate' || user.role === 'org_admin';
  const signedIn = !disabled;
  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const checkActive = useCallback(async () => {
    if (disabled || !user) {
      setActiveMeeting(null);
      setHasActiveMeeting(false);
      return;
    }
    try {
      const resp = await apiCallRef.current('/meetings');
      if (!resp.ok) return;
      const list = await resp.json();
      if (!Array.isArray(list)) return;

      // Live only once the host has started the class ("active").
      // For teachers, strictly individual: only blink when this teacher is the
      // host of the active meeting or currently joined in it (never when another
      // teacher is running a different class).
      const myId = Number(user.id);
      const found = (list as RawMeetingItem[]).find((m) => {
        if (m.status !== 'active') return false;
        if (user.role === 'teacher') {
          return Number(m.teacher_id) === myId || m.is_currently_in_meeting === true;
        }
        return true;
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
  }, [disabled, user]);

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
