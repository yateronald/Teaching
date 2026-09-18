import { useEffect, useRef } from 'react';
import { App, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { acquireSocket, releaseSocket } from '../../utils/realtime';
import { colorFor, initials } from './meetingUi';
import { playNotificationSound } from './meetingSounds';
import './MeetingAccess.css';

/**
 * Hosts are told when someone knocks, wherever they are in the app — not only
 * inside the class. Inside the class the room's own lobby list takes over.
 */
interface LobbyRequest { userId: number; userName: string; role?: string }
interface RequestEvent { meetingId: number; code: string; title: string; request: LobbyRequest }

const ROLE_LABEL: Record<string, string> = { student: 'Student', teacher: 'Teacher', admin: 'Admin' };

const MeetingLobbyWatcher: React.FC = () => {
  const { user, apiCall, isTeacher, isAdmin } = useAuth();
  const { notification, message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;
  const apiRef = useRef(apiCall);
  apiRef.current = apiCall;
  const open = useRef(new Map<string, { meetingId: number; userId: number; code: string }>());
  const canHost = !!user?.id && (isTeacher || isAdmin);

  useEffect(() => {
    if (!canHost) return;
    const socket = acquireSocket();
    const keyOf = (meetingId: number, userId: number) => `lobby-${meetingId}-${userId}`;
    const close = (key: string) => { notification.destroy(key); open.current.delete(key); };

    const answer = async (e: RequestEvent, how: 'admit' | 'decline') => {
      close(keyOf(e.meetingId, e.request.userId));
      try {
        const resp = await apiRef.current(`/meetings/${e.meetingId}/${how}`, { method: 'POST', body: JSON.stringify({ user_id: e.request.userId }) });
        if (resp.ok) message.success(how === 'admit' ? `${e.request.userName} is joining “${e.title}”` : `Request from ${e.request.userName} declined`);
        else message.info(`${e.request.userName} is no longer waiting`);
      } catch {
        message.error('No connection — try again from the class.');
      }
    };

    const onRequest = (e: RequestEvent) => {
      const here = pathRef.current;
      if (here === `/app/meeting/${e.code}` || here === `/app/meeting/${e.meetingId}`) return;
      const key = keyOf(e.meetingId, e.request.userId);
      open.current.set(key, { meetingId: e.meetingId, userId: e.request.userId, code: e.code });
      playNotificationSound();
      notification.open({
        key,
        className: 'mlw',
        placement: 'bottomRight',
        duration: 0,
        icon: <span className="mlw-avatar" style={{ background: colorFor(e.request.userName) }}>{initials(e.request.userName)}</span>,
        message: (
          <>
            <b>{e.request.userName}</b> is waiting to join
            {e.request.role && ROLE_LABEL[e.request.role] && <span className="mlw-role">{ROLE_LABEL[e.request.role]}</span>}
          </>
        ),
        description: `“${e.title}” · not in this class’s batch`,
        actions: (
          <>
            <Button size="small" type="text" onClick={() => { close(key); navigate(`/app/meeting/${e.code}`); }}>Open class</Button>
            <Button size="small" onClick={() => answer(e, 'decline')}>Deny</Button>
            <Button size="small" type="primary" onClick={() => answer(e, 'admit')}>Admit</Button>
          </>
        ),
        onClose: () => open.current.delete(key),
      });
    };

    // Someone was answered elsewhere (in the class, another tab) or stopped waiting.
    const onUpdated = (d: { meetingId: number; pending: LobbyRequest[] }) => {
      const still = new Set(d.pending.map(p => p.userId));
      for (const [key, v] of open.current) if (v.meetingId === d.meetingId && !still.has(v.userId)) close(key);
    };

    socket.on('meeting:lobby-request', onRequest);
    socket.on('meeting:lobby-updated', onUpdated);
    return () => {
      socket.off('meeting:lobby-request', onRequest);
      socket.off('meeting:lobby-updated', onUpdated);
      releaseSocket();
    };
  }, [canHost, notification, message, navigate]);

  // Walking into that class: its own lobby list replaces these cards.
  useEffect(() => {
    for (const [key, v] of open.current) {
      if (location.pathname === `/app/meeting/${v.code}` || location.pathname === `/app/meeting/${v.meetingId}`) {
        notification.destroy(key);
        open.current.delete(key);
      }
    }
  }, [location.pathname, notification]);

  return null;
};

export default MeetingLobbyWatcher;
