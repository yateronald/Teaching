import React, { useState, useEffect, useCallback } from 'react';
import { Button, Tag, Skeleton, Typography, Table, Progress, Modal, Empty, Select } from 'antd';
import {
  TeamOutlined, CheckCircleOutlined, CloseCircleOutlined,
  VideoCameraOutlined, DownloadOutlined, BarChartOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

interface DashboardData {
  totalMeetings: number;
  recentMeetings: {
    id: number; title: string; started_at: string; ended_at: string;
    batch_name: string | null; present: number; absent: number; total: number;
  }[];
  studentStats: {
    id: number; first_name: string; last_name: string; email: string;
    present_count: number; absent_count: number; total_meetings: number; total_minutes: number;
  }[];
}

interface AttendanceDetail {
  summary: {
    id: number; user_id: number; status: string; first_join: string | null;
    last_leave: string | null; total_duration_minutes: number; session_count: number;
    first_name: string; last_name: string; email: string; role: string;
  }[];
  sessions: {
    id: number; user_id: number; joined_at: string; left_at: string | null;
    duration_minutes: number; session_number: number; first_name: string; last_name: string;
  }[];
  teacher: { name: string; first_join: string | null; last_leave: string | null; duration: number } | null;
  stats: { total: number; present: number; absent: number; meetingDuration: number; meetingTitle: string };
}

interface Batch { id: number; name: string; }

const MeetingAttendance: React.FC = () => {
  const { apiCall, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailMeetingId, setDetailMeetingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AttendanceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<number | undefined>(undefined);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedBatch ? `/meetings/attendance-dashboard?batch_id=${selectedBatch}` : '/meetings/attendance-dashboard';
      const resp = await apiCall(url);
      if (resp.ok) setDashboard(await resp.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiCall, selectedBatch]);

  const fetchBatches = useCallback(async () => {
    try {
      const resp = await apiCall('/batches');
      if (resp.ok) {
        const data = await resp.json();
        setBatches(Array.isArray(data) ? data : data.batches || []);
      }
    } catch { /* ignore */ }
  }, [apiCall]);

  useEffect(() => { fetchDashboard(); fetchBatches(); }, [fetchDashboard, fetchBatches]);

  const fetchDetail = async (meetingId: number) => {
    setDetailMeetingId(meetingId);
    setDetailLoading(true);
    try {
      const resp = await apiCall(`/meetings/${meetingId}/attendance`);
      if (resp.ok) setDetail(await resp.json());
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  const exportCSV = () => {
    if (!detail) return;
    const rows = [['Name', 'Email', 'Status', 'First Join', 'Last Leave', 'Duration (min)', 'Sessions']];
    for (const s of detail.summary) {
      rows.push([
        `${s.first_name} ${s.last_name}`, s.email, s.status,
        s.first_join ? dayjs(s.first_join).format('HH:mm:ss') : '-',
        s.last_leave ? dayjs(s.last_leave).format('HH:mm:ss') : '-',
        String(Math.round(s.total_duration_minutes * 10) / 10),
        String(s.session_count),
      ]);
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-${detail.stats.meetingTitle || 'meeting'}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const canManage = isTeacher || isAdmin;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/app/meetings')}
            style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
              <BarChartOutlined style={{ marginRight: 10, color: '#6366f1' }} />
              Meeting Attendance
            </div>
            <Text style={{ fontSize: 13, color: '#94a3b8' }}>Track attendance across all live meetings</Text>
          </div>
        </div>
        {canManage && batches.length > 0 && (
          <Select placeholder="Filter by batch" allowClear value={selectedBatch} onChange={v => setSelectedBatch(v)}
            style={{ width: 200, borderRadius: 8 }} options={batches.map(b => ({ value: b.id, label: b.name }))} />
        )}
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ height: 80, borderRadius: 12, width: 180 }} />)}
        </div>
      ) : dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard icon={<VideoCameraOutlined />} label="Total Meetings" value={dashboard.totalMeetings} color="#6366f1" />
          <StatCard icon={<CheckCircleOutlined />} label="Avg Present" value={dashboard.recentMeetings.length > 0 ? Math.round(dashboard.recentMeetings.reduce((s, m) => s + (m.total > 0 ? (m.present / m.total) * 100 : 0), 0) / dashboard.recentMeetings.length) : 0} suffix="%" color="#22c55e" />
          <StatCard icon={<CloseCircleOutlined />} label="Avg Absent" value={dashboard.recentMeetings.length > 0 ? Math.round(dashboard.recentMeetings.reduce((s, m) => s + (m.total > 0 ? (m.absent / m.total) * 100 : 0), 0) / dashboard.recentMeetings.length) : 0} suffix="%" color="#ef4444" />
        </div>
      )}

      {/* Recent Meetings Table */}
      {!loading && dashboard && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Recent Meetings</div>
          {dashboard.recentMeetings.length === 0 ? (
            <Empty description="No ended meetings yet" />
          ) : (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f8', overflow: 'hidden', marginBottom: 24 }}>
              <Table
                dataSource={dashboard.recentMeetings}
                rowKey="id"
                pagination={false}
                size="small"
                onRow={(record) => ({ onClick: () => fetchDetail(record.id), style: { cursor: 'pointer' } })}
                columns={[
                  { title: 'Meeting', dataIndex: 'title', key: 'title', render: (t: string) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{t}</span> },
                  { title: 'Batch', dataIndex: 'batch_name', key: 'batch', render: (v: string) => v ? <Tag style={{ borderRadius: 6, fontSize: 10, background: '#f8f9ff', color: '#6366f1', border: '1px solid #e0e7ff' }}>{v}</Tag> : '-' },
                  { title: 'Date', dataIndex: 'started_at', key: 'date', render: (v: string) => v ? dayjs(v).format('MMM D, HH:mm') : '-' },
                  { title: 'Present', dataIndex: 'present', key: 'present', render: (v: number) => <Tag color="green" style={{ borderRadius: 6 }}>{v}</Tag> },
                  { title: 'Absent', dataIndex: 'absent', key: 'absent', render: (v: number) => <Tag color="red" style={{ borderRadius: 6 }}>{v}</Tag> },
                  { title: 'Rate', key: 'rate', render: (_: unknown, r: DashboardData['recentMeetings'][0]) => {
                    const pct = r.total > 0 ? Math.round((r.present / r.total) * 100) : 0;
                    return <Progress percent={pct} size="small" strokeColor={pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'} style={{ width: 80 }} />;
                  }},
                ]}
              />
            </div>
          )}
        </>
      )}

      {/* Per-Student Stats (teacher/admin only) */}
      {canManage && !loading && dashboard && dashboard.studentStats.length > 0 && (
        <>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Student Attendance Overview</div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f8', overflow: 'hidden' }}>
            <Table
              dataSource={dashboard.studentStats}
              rowKey="id"
              pagination={{ pageSize: 15 }}
              size="small"
              columns={[
                { title: 'Student', key: 'name', render: (_: unknown, r: DashboardData['studentStats'][0]) => (
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{r.first_name} {r.last_name}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{r.email}</div>
                  </div>
                )},
                { title: 'Present', dataIndex: 'present_count', key: 'present', render: (v: number) => <Tag color="green" style={{ borderRadius: 6 }}>{v}</Tag> },
                { title: 'Absent', dataIndex: 'absent_count', key: 'absent', render: (v: number) => <Tag color="red" style={{ borderRadius: 6 }}>{v}</Tag> },
                { title: 'Total', dataIndex: 'total_meetings', key: 'total' },
                { title: 'Rate', key: 'rate', render: (_: unknown, r: DashboardData['studentStats'][0]) => {
                  const pct = r.total_meetings > 0 ? Math.round((r.present_count / r.total_meetings) * 100) : 0;
                  return <Progress percent={pct} size="small" strokeColor={pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444'} style={{ width: 80 }} />;
                }},
                { title: 'Total Time', key: 'time', render: (_: unknown, r: DashboardData['studentStats'][0]) => {
                  const hrs = Math.floor(r.total_minutes / 60);
                  const mins = Math.round(r.total_minutes % 60);
                  return <span style={{ fontSize: 12, color: '#64748b' }}>{hrs > 0 ? `${hrs}h ` : ''}{mins}m</span>;
                }},
              ]}
            />
          </div>
        </>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!detailMeetingId}
        onCancel={() => { setDetailMeetingId(null); setDetail(null); }}
        title={detail ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TeamOutlined style={{ color: '#6366f1', fontSize: 18 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{detail.stats.meetingTitle}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>
                {detail.stats.present} present · {detail.stats.absent} absent · {detail.stats.meetingDuration} min
              </div>
            </div>
          </div>
        ) : 'Attendance Details'}
        width={700}
        footer={detail ? (
          <Button icon={<DownloadOutlined />} onClick={exportCSV} style={{ borderRadius: 8 }}>Export CSV</Button>
        ) : null}
        destroyOnClose
      >
        {detailLoading ? (
          <Skeleton active />
        ) : detail ? (
          <div>
            {/* Summary stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <MiniStat label="Present" value={detail.stats.present} color="#22c55e" />
              <MiniStat label="Absent" value={detail.stats.absent} color="#ef4444" />
              <MiniStat label="Duration" value={`${detail.stats.meetingDuration}m`} color="#6366f1" />
            </div>

            {/* Teacher info */}
            {detail.teacher && (
              <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f8f9ff', border: '1px solid #e0e7ff', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Tag style={{ borderRadius: 6, background: '#eef2ff', color: '#4338ca', border: 'none', fontWeight: 700, fontSize: 10 }}>Teacher</Tag>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{detail.teacher.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b' }}>
                  <span>Joined: <strong>{detail.teacher.first_join ? dayjs(detail.teacher.first_join).format('HH:mm:ss') : '-'}</strong></span>
                  <span>Left: <strong>{detail.teacher.last_leave ? dayjs(detail.teacher.last_leave).format('HH:mm:ss') : '-'}</strong></span>
                  <span>Duration: <strong>{Math.round(detail.teacher.duration || 0)}m</strong></span>
                </div>
              </div>
            )}

            {/* Attendance table */}
            <Table
              dataSource={detail.summary}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 400 }}
              columns={[
                { title: 'Name', key: 'name', render: (_: unknown, r: AttendanceDetail['summary'][0]) => (
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.first_name} {r.last_name}</span>
                )},
                { title: 'Status', dataIndex: 'status', key: 'status', width: 90, render: (v: string) => {
                  const cfg: Record<string, { color: string; bg: string }> = {
                    present: { color: '#15803d', bg: '#dcfce7' },
                    absent: { color: '#dc2626', bg: '#fef2f2' },
                    late: { color: '#b45309', bg: '#fef3c7' },
                    left_early: { color: '#9333ea', bg: '#f3e8ff' },
                  };
                  const c = cfg[v] || cfg.absent;
                  return <Tag style={{ borderRadius: 6, background: c.bg, color: c.color, border: 'none', fontWeight: 600, fontSize: 11 }}>{v.replace('_', ' ')}</Tag>;
                }},
                { title: 'First Join', key: 'join', render: (_: unknown, r: AttendanceDetail['summary'][0]) => r.first_join ? dayjs(r.first_join).format('HH:mm:ss') : '-' },
                { title: 'Last Leave', key: 'leave', render: (_: unknown, r: AttendanceDetail['summary'][0]) => r.last_leave ? dayjs(r.last_leave).format('HH:mm:ss') : '-' },
                { title: 'Duration', key: 'dur', render: (_: unknown, r: AttendanceDetail['summary'][0]) => `${Math.round(r.total_duration_minutes)}m` },
                { title: 'Sessions', dataIndex: 'session_count', key: 'sessions', width: 70 },
              ]}
            />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

// ── Small helper components ──
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string; color: string; suffix?: string }> = ({ icon, label, value, color, suffix }) => (
  <div style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #f0f0f8', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ color, fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</span>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{value}{suffix || ''}</div>
  </div>
);

const MiniStat: React.FC<{ label: string; value: number | string; color: string }> = ({ label, value, color }) => (
  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: `${color}08`, border: `1px solid ${color}20`, textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
  </div>
);

export default MeetingAttendance;
