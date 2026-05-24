import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Resolves a room_name from a share link to a meeting ID,
 * then redirects to the actual meeting page.
 * Route: /app/meeting-join/:roomName
 */
const MeetingJoinLink: React.FC = () => {
  const { roomName } = useParams<{ roomName: string }>();
  const navigate = useNavigate();
  const { apiCall } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomName) return;
    (async () => {
      try {
        const resp = await apiCall(`/meetings/join-by-room/${roomName}`);
        if (resp.ok) {
          const data = await resp.json();
          navigate(`/app/meeting/${data.meetingId}`, { replace: true });
        } else {
          setError('Meeting not found or link is invalid.');
        }
      } catch {
        setError('Failed to connect. Please try again.');
      }
    })();
  }, [roomName, apiCall, navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Invalid Meeting Link</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>{error}</div>
        <button onClick={() => navigate('/app/meetings')} style={{ padding: '8px 20px', borderRadius: 10, background: '#4338ca', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Go to Meetings
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#6366f1' }} />} />
      <div style={{ marginTop: 16, fontSize: 14, color: '#94a3b8' }}>Joining meeting...</div>
    </div>
  );
};

export default MeetingJoinLink;
