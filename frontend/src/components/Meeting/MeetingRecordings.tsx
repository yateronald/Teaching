import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Skeleton, Tooltip, message } from 'antd';
import {
  CalendarOutlined, DeleteOutlined, DownloadOutlined, LoadingOutlined, PlayCircleFilled, UserOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { formatPlain } from '../../utils/timezone';

/* Rendered inside MeetingList (.ml) — shares its styles. */

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

const STATUS_LABEL: Record<Recording['status'], string> = {
  recording: 'Recording',
  finalizing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
  deleted: 'Deleted',
};

function fmtDuration(seconds?: number | null): string {
  if (!seconds || seconds < 1) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

function fmtSize(bytes?: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400_000));

const MeetingRecordings: React.FC = () => {
  const { apiCall, user, isAdmin } = useAuth();
  const [msg, msgHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Recording | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchRecordings = useCallback(async () => {
    try {
      const r = await apiCall('/meetings/recordings/list');
      if (r.ok) setRecordings(await r.json());
    } catch {
      msg.error('Could not load recordings');
    } finally {
      setLoading(false);
    }
  }, [apiCall, msg]);

  useEffect(() => { fetchRecordings(); }, [fetchRecordings]);

  // Poll while something is still recording or processing so it flips to Ready by itself.
  useEffect(() => {
    if (!recordings.some(r => r.status === 'recording' || r.status === 'finalizing')) return;
    const t = window.setInterval(fetchRecordings, 10_000);
    return () => window.clearInterval(t);
  }, [recordings, fetchRecordings]);

  const when = (iso: string) => formatPlain(iso, user?.timezone, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const canManage = (rec: Recording) => rec.teacher_id === user?.id || isAdmin;
  const canPlay = (rec: Recording) => rec.status === 'ready' || rec.status === 'finalizing';

  const openPlayer = useCallback((rec: Recording) => {
    if (!canPlay(rec)) return;
    // The API accepts ?token=…, so the <video> element streams with HTTP Range requests
    // instead of downloading the whole MP4 first.
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token') || '';
    setActive(rec);
    setStreamUrl(`${apiBase}/meetings/recordings/${rec.id}/stream?token=${encodeURIComponent(token)}`);
  }, []);

  const closePlayer = () => { setActive(null); setStreamUrl(null); };

  const handleDownload = async (rec: Recording) => {
    if (downloadingId === rec.id) return;
    setDownloadingId(rec.id);
    try {
      // Short-lived, single-use URL signed by the server — the long-lived session token never goes in a link.
      const resp = await apiCall(`/meetings/recordings/${rec.id}/download-token`, { method: 'POST' });
      if (!resp.ok) {
        msg.error((await resp.json().catch(() => ({}))).error || 'Could not prepare the download');
        return;
      }
      const { url } = await resp.json();
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rec.meeting_title || 'recording'}-${rec.id}.mp4`;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      msg.success('Download started');
    } catch {
      msg.error('Download failed');
    } finally {
      window.setTimeout(() => setDownloadingId(null), 800);
    }
  };

  const handleDelete = (rec: Recording) => {
    modal.confirm({
      title: 'Delete this recording?',
      content: `“${rec.meeting_title}” will be removed permanently.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        const resp = await apiCall(`/meetings/recordings/${rec.id}`, { method: 'DELETE' });
        if (resp.ok) { msg.success('Recording deleted'); fetchRecordings(); }
        else msg.error((await resp.json().catch(() => ({}))).error || 'Delete failed');
      },
    });
  };

  if (loading) {
    return <div className="ml-pad"><Skeleton active title={false} paragraph={{ rows: 5 }} /></div>;
  }

  if (!recordings.length) {
    return (
      <div className="ml-empty">
        {msgHolder}
        <span className="ml-empty-art"><VideoCameraOutlined /></span>
        <strong>No recordings yet</strong>
        <span>When a class is recorded, you can watch it here for 30 days.</span>
      </div>
    );
  }

  return (
    <div className="ml-list">
      {msgHolder}
      {modalHolder}
      {recordings.map(rec => {
        const days = daysUntil(rec.expires_at);
        const size = fmtSize(rec.file_size_bytes);
        return (
          <div key={rec.id} className={`ml-rec is-${rec.status}`}>
            <button type="button" className="ml-rec-thumb" onClick={() => openPlayer(rec)} disabled={!canPlay(rec)}
              aria-label={`Play ${rec.meeting_title}`}>
              {rec.status === 'recording'
                ? <span className="ml-rec-live"><i className="ml-pulse" /> REC</span>
                : <span className="ml-rec-play">{rec.status === 'finalizing' ? <LoadingOutlined /> : <PlayCircleFilled />}</span>}
              {rec.duration_seconds ? <span className="ml-rec-dur">{fmtDuration(rec.duration_seconds)}</span> : null}
            </button>
            <div className="ml-row-body">
              <div className="ml-rec-tags">
                <span className={`ml-pill is-rec-${rec.status}`}>{STATUS_LABEL[rec.status]}</span>
                {rec.batch_name && <span className="ml-chip">{rec.batch_name}</span>}
                {rec.status === 'ready' && (
                  <span className={`ml-chip${days <= 3 ? ' is-warn' : ''}`}>{days === 0 ? 'Expires today' : `Expires in ${days} ${days === 1 ? 'day' : 'days'}`}</span>
                )}
              </div>
              <div className="ml-row-title"><span>{rec.meeting_title}</span></div>
              <div className="ml-row-meta">
                <span><UserOutlined /> {rec.host_first_name} {rec.host_last_name}</span>
                <span><CalendarOutlined /> {when(rec.started_at)}</span>
                {size && <span>{size}</span>}
              </div>
            </div>
            <div className="ml-row-actions">
              <Button type="primary" icon={<PlayCircleFilled />} disabled={!canPlay(rec)} onClick={() => openPlayer(rec)}>Play</Button>
              {canManage(rec) && rec.status === 'ready' && (
                <Tooltip title={downloadingId === rec.id ? 'Preparing download…' : 'Download MP4'}>
                  <Button type="text" className="ml-icon-btn" aria-label="Download recording"
                    icon={downloadingId === rec.id ? <LoadingOutlined /> : <DownloadOutlined />}
                    disabled={downloadingId === rec.id} onClick={() => handleDownload(rec)} />
                </Tooltip>
              )}
              {canManage(rec) && (
                <Tooltip title="Delete">
                  <Button type="text" danger className="ml-icon-btn" aria-label="Delete recording" icon={<DeleteOutlined />} onClick={() => handleDelete(rec)} />
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}

      <Modal open={!!active} onCancel={closePlayer} footer={null} width={960} centered destroyOnClose className="ml-player">
        <div className="ml-player-stage">
          {streamUrl ? (
            <video src={streamUrl} controls autoPlay playsInline preload="metadata" controlsList="nodownload"
              onError={() => msg.error('This recording could not be played. The file may be unavailable.')} />
          ) : (
            <div className="ml-player-loading"><LoadingOutlined /> Loading recording…</div>
          )}
          {active && (
            <div className="ml-player-top">
              <strong>{active.meeting_title}</strong>
              <span>{active.host_first_name} {active.host_last_name} · {when(active.started_at)}</span>
            </div>
          )}
          {active && canManage(active) && active.status === 'ready' && (
            <button type="button" className="ml-player-dl" onClick={() => handleDownload(active)} disabled={downloadingId === active.id}
              aria-label="Download recording">
              {downloadingId === active.id ? <LoadingOutlined /> : <DownloadOutlined />}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MeetingRecordings;
