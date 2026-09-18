import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';

/**
 * Older invitation links (/app/meeting-join/<room>) now open the meeting page
 * directly: the room name is the meeting reference. Any "#pwd=…" is kept.
 */
const MeetingJoinLink: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const { hash } = useLocation();
  return <Navigate to={roomName ? `/app/meeting/${encodeURIComponent(roomName)}${hash}` : '/app/meetings'} replace />;
};

export default MeetingJoinLink;
