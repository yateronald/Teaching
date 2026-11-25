import { useEffect, useRef } from 'react';
import { App, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { acquireSocket, releaseSocket } from '../../utils/realtime';
import { colorFor, initials } from './meetingUi';
import { playNotificationSound } from './meetingSounds';
import './MeetingAccess.css';

/**
 * Hosts and admins are told when someone knocks, wherever they are in the app —
 * including external public guests on `/meeting/:code`.
 */
interface LobbyRequest {
  key?: string;
  userId?: number | null;
  guestId?: string | null;
  isGuest?: boolean;
  userName: string;
  email?: string | null;
  role?: string;
}
interface RequestEvent { meetingId: number; code: string; title: string; request: LobbyRequest }

const ROLE_LABEL: Record<string, string> = { student: 'Student', teacher: 'Teacher', admin: 'Admin', guest: 'External guest' };

const keyForRequest = (r: LobbyRequest): string =>
  r.key || (r.guestId ? `guest:${r.guestId}` : String(r.userId ?? ''));

const MeetingLobbyWatcher: React.FC = () => {
  const { user, apiCall, isTeacher, isAdmin } = useAuth();
  const { notification, message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;
  const apiRef = useRef(apiCall);
  apiRef.current = apiCall;
  const open = useRef(new Map<string, { meetingId: number; participantKey: string; code: string }>());
  const canHost = !!user?.id && (isTeacher || isAdmin);

  useEffect(() => {
    if (!canHost) return;
    const socket = acquireSocket();
    const notifKeyOf = (meetingId: number, pKey: string) => `lobby-${meetingId}-${pKey}`;
    const close = (nKey: string) => { notification.destroy(nKey); open.current.delete(nKey); };

    const answer = async (e: RequestEvent, how: 'admit' | 'decline') => {
      const pKey = keyForRequest(e.request);
      close(notifKeyOf(e.meetingId, pKey));
      try {
        const body = e.request.guestId
          ? { guest_id: e.request.guestId, participant_key: pKey }
          : { user_id: e.request.userId, participant_key: pKey };
        const resp = await apiRef.current(`/meetings/${e.meetingId}/${how}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        if (resp.ok) message.success(how === 'admit' ? `${e.request.userName} is joining “${e.title}”` : `Request from ${e.request.userName} declined`);
        else message.info(`${e.request.userName} is no longer waiting`);
      } catch {
        message.error('No connection. Try again from the meeting.');
      }
    };

    const onRequest = (e: RequestEvent) => {
      const here = pathRef.current;
      if (here === `/app/meeting/${e.code}` || here === `/app/meeting/${e.meetingId}`) return;
      const pKey = keyForRequest(e.request);
      if (!pKey) return;
      const nKey = notifKeyOf(e.meetingId, pKey);
      open.current.set(nKey, { meetingId: e.meetingId, participantKey: pKey, code: e.code });
      playNotificationSound();
      const badge = e.request.isGuest ? 'External guest' : ROLE_LABEL[e.request.role || ''];
      notification.open({
        key: nKey,
        className: 'mlw',
        placement: 'bottomRight',
        duration: 0,
        icon: <span className="mlw-avatar" style={{ background: colorFor(e.request.userName) }}>{initials(e.request.userName)}</span>,
        message: (
          <>
            <b>{e.request.userName}</b> is waiting to join
            {badge && <span className="mlw-role">{badge}</span>}
          </>
        ),
        description: `“${e.title}” · ${e.request.email || (e.request.isGuest ? 'Joined via public link' : 'not in this class’s batch')}`,
        actions: (
          <>
            <Button size="small" type="text" onClick={() => { close(nKey); navigate(`/app/meeting/${e.code}`); }}>Open meeting</Button>
            <Button size="small" onClick={() => answer(e, 'decline')}>Deny</Button>
            <Button size="small" type="primary" onClick={() => answer(e, 'admit')}>Admit</Button>
          </>
        ),
        onClose: () => open.current.delete(nKey),
      });
    };

    const onUpdated = (d: { meetingId: number; pending: LobbyRequest[] }) => {
      const still = new Set(d.pending.map(keyForRequest));
      for (const [nKey, v] of open.current) if (v.meetingId === d.meetingId && !still.has(v.participantKey)) close(nKey);
    };

    socket.on('meeting:lobby-request', onRequest);
    socket.on('meeting:lobby-updated', onUpdated);
    return () => {
      socket.off('meeting:lobby-request', onRequest);
      socket.off('meeting:lobby-updated', onUpdated);
      releaseSocket();
    };
  }, [canHost, notification, message, navigate]);

  useEffect(() => {
    for (const [nKey, v] of open.current) {
      if (location.pathname === `/app/meeting/${v.code}` || location.pathname === `/app/meeting/${v.meetingId}`) {
        notification.destroy(nKey);
        open.current.delete(nKey);
      }
    }
  }, [location.pathname, notification]);

  return null;
};

export default MeetingLobbyWatcher;
