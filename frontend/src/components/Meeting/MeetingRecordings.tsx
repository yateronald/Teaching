import React, { useEffect, useState, useCallback } from 'react';
import { Empty, Skeleton, Modal, message, Tag, Tooltip, Button } from 'antd';
import {
  VideoCameraOutlined, ClockCircleOutlined, UserOutlined, DeleteOutlined,
  DownloadOutlined, PlayCircleFilled, ExclamationCircleOutlined, LoadingOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

interface Recording {
  id: number;
  meeting_id: number;
  meeting_title: string;
  batch_name: string | null;
  host_first_name: string;
  host_last_name: string;
  teacher_id: number;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  status: 'recording' | 'finalizing' | 'ready' | 'failed' | 'deleted';
  started_at: string;
  ended_at: string | null;
  expires_at: string;
}

const STATUS_TAG: Record<string, { color: string; bg: string; label: string }> = {
  recording: { color: '#dc2626', bg: '#fee2e2', label: '● Recording' },
  finalizing: { color: '#a16207', bg: '#fef3c7', label: 'Finalizing…' },
  ready: { color: '#15803d', bg: '#dcfce7', label: 'Ready' },
  failed: { color: '#64748b', bg: '#f1f5f9', label: 'Failed' },
  deleted: { color: '#94a3b8', bg: '#f8fafc', label: 'Deleted' },
};

function fmtDuration(seconds?: number | null): string {
  if (!seconds || seconds < 1) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtSize(bytes?: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

const MeetingRecordings: React.FC = () => {
  const { apiCall, user, isAdmin } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [activeRecording, setActiveRecording] = useState<Recording | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiCall('/meetings/recordings/list');
      if (r.ok) {
        const data = await r.json();
        setRecordings(data);
      }
    } catch {
      message.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  // Auto-refresh every 30s while there's a recording in 'finalizing' status
  useEffect(() => {
    const hasFinalizing = recordings.some(r => r.status === 'recording' || r.status === 'finalizing');
    if (!hasFinalizing) return;
    const t = setInterval(fetchRecordings, 30 * 1000);
    return () => clearInterval(t);
  }, [recordings, fetchRecordings]);

  const openPlayer = useCallback(async (rec: Recording) => {
    if (rec.status !== 'ready' && rec.status !== 'finalizing') {
      message.info(`This recording is in status: ${rec.status}`);
      return;
    }
    setActiveRecording(rec);
    // Use the auth-protected stream endpoint with a Blob URL so we can pass the
    // bearer token via apiCall and avoid leaking it in src URLs.
    setStreamUrl(null);
    setPlayerOpen(true);
    try {
      const resp = await apiCall(`/meetings/recordings/${rec.id}/stream`);
      if (resp.ok) {
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        setStreamUrl(url);
      } else if (resp.status === 409) {
        const d = await resp.json().catch(() => ({}));
        message.warning(d.error || 'Recording is not yet streamable');
        setPlayerOpen(false);
      } else {
        message.error('Failed to load recording');
        setPlayerOpen(false);
      }
    } catch {
      message.error('Network error');
      setPlayerOpen(false);
    }
  }, [apiCall]);

  const closePlayer = useCallback(() => {
    setPlayerOpen(false);
    if (streamUrl) URL.revokeObjectURL(streamUrl);
    setStreamUrl(null);
    setActiveRecording(null);
  }, [streamUrl]);

  const handleDownload = useCallback(async (rec: Recording) => {
    try {
      const resp = await apiCall(`/meetings/recordings/${rec.id}/download`);
      if (!resp.ok) {
        const d = await resp.json().catch(() => ({}));
        message.error(d.error || 'Download failed');
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.meeting_title || 'recording'}-${rec.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      message.error('Download failed');
    }
  }, [apiCall]);

  const handleDelete = useCallback((rec: Recording) => {
    Modal.confirm({
      title: 'Delete recording?',
      icon: <ExclamationCircleOutlined style={{ color: '#ef4444' }} />,
      content: `"${rec.meeting_title}" — this cannot be undone.`,
      okText: 'Delete', okType: 'danger', cancelText: 'Cancel', centered: true,
      onOk: async () => {
        const resp = await apiCall(`/meetings/recordings/${rec.id}`, { method: 'DELETE' });
        if (resp.ok) { message.success('Recording deleted'); fetchRecordings(); }
        else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'Delete failed'); }
      },
    });
  }, [apiCall, fetchRecordings]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ height: 96, borderRadius: 12, width: '100%' }} block />)}
      </div>
    );
  }
  if (!recordings.length) {
    return (
      <Empty
        image={<VideoCameraOutlined style={{ fontSize: 64, color: '#cbd5e1' }} />}
        description={<span style={{ color: '#94a3b8' }}>No recordings yet. Recordings appear here after a class is recorded.</span>}
        style={{ padding: '48px 0' }}
      />
    );
  }

  return (
    <>
      <div style={{ marginBottom: 12, fontSize: 12, color: '#94a3b8' }}>
        Recordings are kept on the server for 30 days, then automatically deleted.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {recordings.map(r => {
          const tag = STATUS_TAG[r.status] || STATUS_TAG.failed;
          const days = daysUntil(r.expires_at);
          const isHost = r.teacher_id === user?.id;
          const canDelete = isHost || isAdmin;
          const canPlay = r.status === 'ready' || r.status === 'finalizing';

          return (
            <div key={r.id} style={{
              padding: '14px 18px', borderRadius: 14, background: '#fff',
              border: r.status === 'recording' ? '2px solid #ef4444' : '1px solid #f0f0f8',
              boxShadow: r.status === 'recording' ? '0 0 18px rgba(239,68,68,0.12)' : '0 1px 4px rgba(0,0,0,0.03)',
              transition: 'all 0.18s ease',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Tag style={{ borderRadius: 6, fontWeight: 700, fontSize: 10.5, background: tag.bg, color: tag.color, border: 'none', margin: 0 }}>{tag.label}</Tag>
                    {r.batch_name && <Tag style={{ borderRadius: 6, fontSize: 10, margin: 0, background: '#f8f9ff', color: '#6366f1', border: '1px solid #e0e7ff' }}>{r.batch_name}</Tag>}
                    {r.status === 'ready' && (
                      <Tag style={{
                        borderRadius: 6, fontSize: 10, margin: 0,
                        background: days <= 3 ? '#fef2f2' : '#f8fafc',
                        color: days <= 3 ? '#dc2626' : '#64748b',
                        border: 'none', fontWeight: 600,
                      }}>
                        Expires in {days} {days === 1 ? 'day' : 'days'}
                      </Tag>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{r.meeting_title}</div>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: '#94a3b8' }}>
                    <span><UserOutlined /> {r.host_first_name} {r.host_last_name}</span>
                    <span><ClockCircleOutlined /> {dayjs(r.started_at).format('MMM D, YYYY · HH:mm')}</span>
                    <span>{fmtDuration(r.duration_seconds)}</span>
                    <span>{fmtSize(r.file_size_bytes)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Tooltip title={canPlay ? 'Play recording' : `Status: ${r.status}`}>
                    <Button
                      type="primary"
                      icon={<PlayCircleFilled />}
                      onClick={() => openPlayer(r)}
                      disabled={!canPlay}
                      style={{
                        borderRadius: 10, fontWeight: 600,
                        background: canPlay ? 'linear-gradient(135deg, #4338ca, #6366f1)' : undefined,
                        border: 'none',
                      }}
                    >
                      Play
                    </Button>
                  </Tooltip>
                  {(isHost || isAdmin) && r.status === 'ready' && (
                    <Tooltip title="Download MP4">
                      <Button icon={<DownloadOutlined />} onClick={() => handleDownload(r)} style={{ borderRadius: 10 }} />
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title="Delete">
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleDelete(r)} style={{ borderRadius: 8 }} />
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={playerOpen}
        onCancel={closePlayer}
        footer={null}
        width={920}
        centered
        destroyOnClose
        title={activeRecording?.meeting_title || 'Recording'}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ background: '#000', minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {streamUrl ? (
            <video
              src={streamUrl}
              controls
              autoPlay
              style={{ width: '100%', maxHeight: '70vh', display: 'block' }}
            />
          ) : (
            <div style={{ color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60 }}>
              <LoadingOutlined style={{ fontSize: 32 }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Loading recording…</span>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default MeetingRecordings;
