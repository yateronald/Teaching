import React, { useEffect, useState, useCallback } from 'react';
import { 
  Row, 
  Col, 
  Card, 
   
  Typography, 
  message, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  Tag, 
  Modal, 
  Form, 
  DatePicker,
  Badge,
  Dropdown,
  Skeleton,
  } from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
      ReloadOutlined,
  MoreOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// Types
interface DemoRequest {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  has_previous_experience: boolean;
  current_level: string;
  previous_study_method: string;
  interested_level: string;
  learning_goals: string;
  expectations: string;
  expected_start_time: string;
  preferred_schedule: string;
  timezone: string;
  status: 'new' | 'contacted' | 'demo_scheduled' | 'completed' | 'cancelled';
  notes: string;
  contacted_at: string;
  demo_scheduled_at: string;
  created_at: string;
  updated_at: string;
  teacher_id?: number;
  meeting_link?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_email?: string;
}

interface Statistics {
  total: number;
  new_requests: number;
  contacted: number;
  demo_scheduled: number;
  completed: number;
  cancelled: number;
  this_week: number;
  this_month: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

const DemoRequests: React.FC = () => {
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    new_requests: 0,
    contacted: 0,
    demo_scheduled: 0,
    completed: 0,
    cancelled: 0,
    this_week: 0,
    this_month: 0
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    country: '',
    level: '',
    search: '',
    start_date: '',
    end_date: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [form] = Form.useForm();
  const { apiCall } = useAuth();

  const fetchDemoRequests = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.country && { country: filters.country }),
        ...(filters.level && { level: filters.level }),
        ...(filters.search && { search: filters.search }),
        ...(filters.start_date && { start_date: filters.start_date }),
        ...(filters.end_date && { end_date: filters.end_date })
      });

      const response = await apiCall(`/api/demo-requests?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setDemoRequests(data.data);
        setStatistics(data.statistics);
        setPagination(data.pagination);
      } else {
        const error = await response.json();
        message.error(error.message || 'Failed to fetch demo requests');
      }
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      message.error('Failed to fetch demo requests');
    } finally {
      setLoading(false);
    }
  }, [apiCall, pagination.page, pagination.limit, filters]);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await apiCall('/api/users/role/teachers');
      if (response.ok) {
        const data = await response.json();
        // Backend returns teachers array directly, not wrapped in data property
        setTeachers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch teachers');
        setTeachers([]); // Ensure teachers is always an array
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]); // Ensure teachers is always an array
    }
  }, [apiCall]);

  useEffect(() => {
    fetchDemoRequests();
    fetchTeachers();
  }, [fetchDemoRequests, fetchTeachers]);

  const handleStatusUpdate = async (id: number, status: string, notes?: string) => {
    try {
      const response = await apiCall(`/api/demo-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        message.success('Status updated successfully');
        fetchDemoRequests();
        setStatusModalVisible(false);
      } else {
        const error = await response.json();
        message.error(error.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const handleScheduleDemo = async (values: any) => {
    if (!selectedRequest) return;

    setSchedulingLoading(true);
    try {
      const response = await apiCall(`/api/demo-requests/${selectedRequest.id}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demo_scheduled_at: values.demo_scheduled_at.toISOString(),
          teacher_id: values.teacher_id,
          meeting_link: values.meeting_link,
          notes: values.notes
        })
      });

      if (response.ok) {
        message.success('Demo scheduled successfully');
        fetchDemoRequests();
        setScheduleModalVisible(false);
        form.resetFields();
      } else {
        const error = await response.json();
        message.error(error.message || 'Failed to schedule demo');
      }
    } catch (error) {
      console.error('Error scheduling demo:', error);
      message.error('Failed to schedule demo');
    } finally {
      setSchedulingLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'blue',
      contacted: 'orange',
      demo_scheduled: 'purple',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      new: 'New',
      contacted: 'Contacted',
      demo_scheduled: 'Demo Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // --- Timezone formatting helpers ---
  const TZ_ABBREVIATIONS: Record<string, string> = {
    // Specific overrides where Intl doesn't provide a short name
    'Asia/Dhaka': 'BST', // Bangladesh Standard Time
  };

  const getTimezoneOffsetLabel = (tz: string): string => {
    if (!tz) return '';
    const now = new Date();
    try {
      // Prefer shortOffset when available (produces GMT+/-H[:MM])
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset'
      }).formatToParts(now);
      const name = parts.find(p => p.type === 'timeZoneName')?.value || '';
      return name ? name.replace('GMT', 'UTC') : '';
    } catch {
      // Fallback: compute offset manually via formatToParts
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).formatToParts(now);

        const get = (t: string) => parts.find(p => p.type === t)?.value || '0';
        const year = Number(get('year'));
        const month = Number(get('month'));
        const day = Number(get('day'));
        const hour = Number(get('hour'));
        const minute = Number(get('minute'));
        const second = Number(get('second'));

        const tzUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
        const diffMin = Math.round((tzUtcMs - now.getTime()) / 60000);
        const sign = diffMin >= 0 ? '+' : '-';
        const absMin = Math.abs(diffMin);
        const h = Math.floor(absMin / 60);
        const m = absMin % 60;
        return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
      } catch {
        return '';
      }
    }
  };

  const getTimezoneAbbrev = (tz: string): string => {
    if (!tz) return '';
    if (TZ_ABBREVIATIONS[tz]) return TZ_ABBREVIATIONS[tz];
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      }).formatToParts(new Date());
      const name = parts.find(p => p.type === 'timeZoneName')?.value || '';
      // Use abbreviation only if it's not a generic GMT/UTC offset
      if (name && !/^GMT[+-]/i.test(name) && !/^UTC[+-]/i.test(name)) return name;
    } catch {}
    return '';
  };

  const formatTimezoneDisplay = (tz?: string): string => {
    const timeZone = (tz || '').trim();
    if (!timeZone) return '—';
    let offset = '';
    let abbr = '';

    // Try IANA timezone handling first
    try {
      offset = getTimezoneOffsetLabel(timeZone);
      abbr = getTimezoneAbbrev(timeZone);
    } catch {}

    // Fallback for custom entries like "GMT+1" or "UTC+05:30"
    if (!offset) {
      const m = timeZone.match(/(?:GMT|UTC)\s*([+-]\d{1,2})(?::?(\d{2}))?/i);
      if (m) {
        offset = `UTC${m[1]}${m[2] ? `:${m[2]}` : ''}`;
      }
    }

    if (abbr) return `${timeZone} (${abbr}/${offset || 'UTC'})`;
    if (offset) return `${timeZone} (${offset})`;
    return timeZone;
  };

  // Confirm and delete a demo request (admin only)
  const confirmDeleteRequest = (record: DemoRequest) => {
    Modal.confirm({
      title: 'Delete demo request?',
      content: `This will permanently delete the request for ${record.full_name}. This action cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await apiCall(`/api/demo-requests/${record.id}`, { method: 'DELETE' });
          if (response.ok) {
            message.success('Demo request deleted');
            fetchDemoRequests();
          } else {
            if (response.status === 404) {
              message.warning('This demo request was not found. Refreshing list.');
              fetchDemoRequests();
              return;
            }
            let errorMsg = 'Failed to delete demo request';
            try {
              const error = await response.json();
              errorMsg = error.message || error.error || errorMsg;
            } catch {}
            message.error(errorMsg);
          }
        } catch (error) {
          console.error('Error deleting demo request:', error);
          message.error('Failed to delete demo request');
        }
      }
    });
  };

  const getActionMenuItems = (record: DemoRequest): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => {
        setSelectedRequest(record);
        setDetailsModalVisible(true);
      }
    },
    {
      key: 'contact',
      icon: <MailOutlined />,
      label: 'Mark as Contacted',
      disabled: record.status === 'contacted' || record.status === 'demo_scheduled' || record.status === 'completed',
      onClick: () => handleStatusUpdate(record.id, 'contacted')
    },
    {
      key: 'schedule',
      icon: <CalendarOutlined />,
      label: 'Schedule Demo',
      disabled: record.status === 'demo_scheduled' || record.status === 'completed',
      onClick: () => {
        setSelectedRequest(record);
        setScheduleModalVisible(true);
      }
    },
    {
      key: 'status',
      icon: <EditOutlined />,
      label: 'Update Status',
      onClick: () => {
        setSelectedRequest(record);
        setStatusModalVisible(true);
      }
    },
    {
      key: 'delete',
      danger: true,
      icon: <DeleteOutlined />,
      label: 'Delete',
      onClick: () => confirmDeleteRequest(record)
    }
  ];

  const columns: ColumnsType<DemoRequest> = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      fixed: 'left',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}>
            {text ? `${text.split(' ')[0]?.[0] || ''}${text.split(' ')[1]?.[0] || ''}`.toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, lineHeight: 1.3 }}>
              {text}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <PhoneOutlined style={{ fontSize: 10 }} /> {record.phone}
          </Text>
          <Text style={{ fontSize: '11px', color: '#94a3b8' }}>
            📍 {record.country}
          </Text>
        </Space>
      ),
      width: 150
    },
    {
      title: 'Level & Experience',
      key: 'level',
      render: (_, record) => {
        const getLevelStyle = (level: string) => {
          if (!level) return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
          const l = level.toUpperCase();
          if (l.includes('A')) return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
          if (l.includes('B')) return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
          if (l.includes('C')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
          return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        };
        const s = getLevelStyle(record.current_level || '');
        return (
          <Space direction="vertical" size={4}>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 700,
              background: s.bg,
              color: s.color,
              border: `1px solid ${s.border}`,
            }}>
              {record.current_level}
            </span>
            <Text style={{ fontSize: '11px', color: record.has_previous_experience ? '#16a34a' : '#64748b', fontWeight: 500 }}>
              {record.has_previous_experience ? '✓ Has experience' : '✗ Beginner'}
            </Text>
          </Space>
        );
      },
      width: 150
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          new: { color: '#3b82f6', bg: '#eff6ff' },
          contacted: { color: '#f59e0b', bg: '#fffbeb' },
          demo_scheduled: { color: '#8b5cf6', bg: '#f5f3ff' },
          completed: { color: '#10b981', bg: '#ecfdf5' },
          cancelled: { color: '#ef4444', bg: '#fef2f2' }
        };
        const c = colors[status as keyof typeof colors] || { color: '#64748b', bg: '#f8fafc' };
        return (
          <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            color: c.color,
            background: c.bg,
            border: `1px solid ${c.color}30`,
          }}>
            {getStatusText(status)}
          </span>
        );
      },
      width: 120
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '12px' }}>
            {dayjs(date).format('MMM DD, YYYY')}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </Space>
      ),
      width: 100
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
      width: 80
    }
  ];

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, page, limit: pageSize }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({ status: '', country: '', level: '', search: '', start_date: '', end_date: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Full-page Skeleton
  if (loading && demoRequests.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
                <Skeleton.Input active style={{ width: 220, height: 26, borderRadius: 8 }} />
                <div style={{ marginTop: 8 }}>
                    <Skeleton.Input active style={{ width: 360, height: 14, borderRadius: 6 }} />
                </div>
            </div>
            <Skeleton.Button active style={{ width: 100, height: 40, borderRadius: 10 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 20 }}>
            {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ borderRadius: 14, padding: '14px 16px', background: '#fff', border: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Skeleton.Avatar active size={40} shape="square" style={{ borderRadius: 10 }} />
                    <div style={{ flex: 1 }}>
                        <Skeleton.Input active style={{ width: '60%', height: 10, borderRadius: 4, marginBottom: 8 }} block />
                        <Skeleton.Input active style={{ width: 36, height: 22, borderRadius: 6 }} />
                    </div>
                </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <Skeleton.Avatar active size={30} shape="square" style={{ borderRadius: 9 }} />
              <Skeleton.Input active style={{ width: 120, height: 16, borderRadius: 4 }} />
          </div>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', gap: 24 }}>
              {[180, 140, 140, 100, 100, 80].map((w, i) => (
                  <Skeleton.Input key={i} active style={{ width: w, height: 12, borderRadius: 4 }} />
              ))}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 0', borderBottom: '1px solid #f8f9fb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 180 }}>
                          <Skeleton.Avatar active size={34} shape="square" style={{ borderRadius: 10 }} />
                          <div>
                              <Skeleton.Input active style={{ width: 120, height: 12, borderRadius: 4, marginBottom: 4 }} />
                              <Skeleton.Input active style={{ width: 80, height: 9, borderRadius: 4 }} />
                          </div>
                      </div>
                      <div style={{ width: 140 }}>
                        <Skeleton.Input active style={{ width: 100, height: 12, borderRadius: 4, marginBottom: 4 }} />
                        <Skeleton.Input active style={{ width: 60, height: 9, borderRadius: 4 }} />
                      </div>
                      <div style={{ width: 140 }}>
                        <Skeleton.Input active style={{ width: 40, height: 16, borderRadius: 12, marginBottom: 4 }} />
                        <Skeleton.Input active style={{ width: 80, height: 9, borderRadius: 4 }} />
                      </div>
                      <Skeleton.Input active style={{ width: 80, height: 20, borderRadius: 6 }} />
                      <div style={{ width: 100 }}>
                        <Skeleton.Input active style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 4 }} />
                        <Skeleton.Input active style={{ width: 40, height: 9, borderRadius: 4 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                          <Skeleton.Avatar active size={28} shape="square" style={{ borderRadius: 8 }} />
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
      {/* Fixed Header Area */}
      <div style={{ flexShrink: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
              Demo Requests
            </div>
            <Typography.Text style={{ fontSize: 13, color: '#94a3b8' }}>
              Manage incoming demo inquiries and schedule trial sessions
            </Typography.Text>
          </div>
          <Button 
            type="primary"
            icon={<ReloadOutlined />} 
            onClick={fetchDemoRequests}
            loading={loading}
            style={{ borderRadius: 10, fontWeight: 600, height: 40, background: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
          >
            Refresh Data
          </Button>
        </div>

        {/* KPI Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: 20 }}>
          {[
            { label: 'Total Requests', value: statistics.total, icon: <UserOutlined />, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)', accent: '#6366f1' },
            { label: 'New Requests', value: statistics.new_requests, icon: <Badge status="processing" />, gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', accent: '#3b82f6' },
            { label: 'Contacted', value: statistics.contacted, icon: <CheckOutlined />, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', accent: '#f59e0b' },
            { label: 'Demo Scheduled', value: statistics.demo_scheduled, icon: <CalendarOutlined />, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', accent: '#8b5cf6' },
          ].map((kpi, i) => (
            <div key={i} style={{
                borderRadius: 14, padding: '14px 16px',
                background: '#fff', border: '1px solid #f0f0f8',
                boxShadow: '0 2px 12px rgba(99,102,241,0.04)',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.2s ease', cursor: 'default',
            }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(99,102,241,0.04)'; }}
            >
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: kpi.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, color: '#fff', flexShrink: 0,
                    boxShadow: `0 4px 12px ${kpi.accent}40`,
                }}>
                    {kpi.icon}
                </div>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 }}>{kpi.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{kpi.value}</div>
                </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', marginBottom: 20 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search by name or email"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onSearch={() => fetchDemoRequests()}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="new">New</Option>
                <Option value="contacted">Contacted</Option>
                <Option value="demo_scheduled">Demo Scheduled</Option>
                <Option value="completed">Completed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Level"
                value={filters.level}
                onChange={(value) => handleFilterChange('level', value)}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="beginner">Beginner</Option>
                <Option value="elementary">Elementary</Option>
                <Option value="intermediate">Intermediate</Option>
                <Option value="advanced">Advanced</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Input
                placeholder="Country"
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates) {
                    handleFilterChange('start_date', dates[0]!.format('YYYY-MM-DD'));
                    handleFilterChange('end_date', dates[1]!.format('YYYY-MM-DD'));
                  } else {
                    handleFilterChange('start_date', '');
                    handleFilterChange('end_date', '');
                  }
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Space>
                <Button 
                  type="primary" 
                  onClick={fetchDemoRequests}
                  loading={loading}
                >
                  Apply Filter
                </Button>
                <Button onClick={clearFilters}>
                  Clear
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #f0f0f8', boxShadow: '0 2px 12px rgba(99,102,241,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f5fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: 14 }}>
                    <MailOutlined />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Request Directory</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 12 }}>{pagination.total} records</span>
            </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <Table
            columns={columns}
            dataSource={demoRequests}
            rowKey="id"
            loading={false} // Managed by skeleton instead
            size="middle"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} requests`,
              onChange: handleTableChange,
              onShowSizeChange: handleTableChange,
              style: { padding: '12px 20px', margin: 0 },
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        title="Demo Request Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
        centered
        styles={{ body: { maxHeight: '65vh', overflowY: 'auto' } }}
      >
        {selectedRequest && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Personal Information" size="small">
                  <p><strong>Name:</strong> {selectedRequest.full_name}</p>
                  <p><strong>Email:</strong> {selectedRequest.email}</p>
                  <p><strong>Phone:</strong> {selectedRequest.phone}</p>
                  <p><strong>Country:</strong> {selectedRequest.country}</p>
                  <p><strong>Timezone:</strong> {formatTimezoneDisplay(selectedRequest.timezone)}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Learning Background" size="small">
                  <p><strong>Previous Experience:</strong> {selectedRequest.has_previous_experience ? 'Yes' : 'No'}</p>
                  <p><strong>Current Level:</strong> {selectedRequest.current_level}</p>
                  <p><strong>Previous Study Method:</strong> {selectedRequest.previous_study_method}</p>
                  <p><strong>Interested Level:</strong> {selectedRequest.interested_level}</p>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Goals & Expectations" size="small">
                  <Title level={5} style={{ marginBottom: 6 }}>What are your main learning goals?</Title>
                  <Typography.Paragraph
                    style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}
                    ellipsis={{ rows: 4, expandable: true, symbol: 'Show more', tooltip: true }}
                  >
                    {selectedRequest.learning_goals || 'No goals provided'}
                  </Typography.Paragraph>

                  <Title level={5} style={{ marginBottom: 6 }}>What are your expectations from our French lessons?</Title>
                  <Typography.Paragraph
                    style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}
                    ellipsis={{ rows: 4, expandable: true, symbol: 'Show more', tooltip: true }}
                  >
                    {selectedRequest.expectations || 'No expectations provided'}
                  </Typography.Paragraph>
                  <p><strong>Expected Start Time:</strong> {selectedRequest.expected_start_time}</p>
                  <p><strong>Preferred Schedule:</strong> {selectedRequest.preferred_schedule}</p>
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Status & Notes" size="small">
                  <p><strong>Status:</strong> <Tag color={getStatusColor(selectedRequest.status)}>{getStatusText(selectedRequest.status)}</Tag></p>
                  <p><strong>Notes:</strong> {selectedRequest.notes || 'No notes'}</p>
                  <p><strong>Created:</strong> {dayjs(selectedRequest.created_at).format('MMMM DD, YYYY HH:mm')}</p>
                  {selectedRequest.contacted_at && (
                    <p><strong>Contacted:</strong> {dayjs(selectedRequest.contacted_at).format('MMMM DD, YYYY HH:mm')}</p>
                  )}
                  {selectedRequest.demo_scheduled_at && (
                    <p><strong>Demo Scheduled:</strong> {dayjs(selectedRequest.demo_scheduled_at).format('MMMM DD, YYYY HH:mm')}</p>
                  )}
                  {selectedRequest.teacher_first_name && (
                    <p><strong>Assigned Teacher:</strong> {selectedRequest.teacher_first_name} {selectedRequest.teacher_last_name} ({selectedRequest.teacher_email})</p>
                  )}
                  {selectedRequest.meeting_link && (
                    <p><strong>Meeting Link:</strong> <a href={selectedRequest.meeting_link} target="_blank" rel="noopener noreferrer">{selectedRequest.meeting_link}</a></p>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Schedule Demo Modal */}
      <Modal
        title="Schedule Demo"
        open={scheduleModalVisible}
        onCancel={() => {
          if (!schedulingLoading) {
            setScheduleModalVisible(false);
            form.resetFields();
          }
        }}
        onOk={() => form.submit()}
        okText={schedulingLoading ? "Scheduling..." : "Schedule"}
        confirmLoading={schedulingLoading}
        closable={!schedulingLoading}
        maskClosable={!schedulingLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleScheduleDemo}
        >
          <Form.Item
            name="demo_scheduled_at"
            label="Demo Date & Time"
            rules={[{ required: true, message: 'Please select demo date and time' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="teacher_id"
            label="Assign Teacher"
            rules={[{ required: true, message: 'Please select a teacher' }]}
          >
            <Select
              placeholder="Select a teacher"
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) => {
                const teacher = teachers.find(t => t.id === option?.value);
                if (!teacher) return false;
                
                const searchText = input.toLowerCase();
                const firstName = teacher.first_name?.toLowerCase() || '';
                const lastName = teacher.last_name?.toLowerCase() || '';
                const email = teacher.email?.toLowerCase() || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                
                return firstName.includes(searchText) || 
                       lastName.includes(searchText) || 
                       fullName.includes(searchText) ||
                       email.includes(searchText);
              }}
            >
              {(teachers || []).map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.first_name} {teacher.last_name} ({teacher.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="meeting_link"
            label="Meeting Link"
            rules={[
              { required: true, message: 'Please enter meeting link' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://zoom.us/j/..." />
          </Form.Item>
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={3} placeholder="Add any notes about the scheduled demo..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Update Status"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
      >
        {selectedRequest && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>Current Status: <Tag color={getStatusColor(selectedRequest.status)}>{getStatusText(selectedRequest.status)}</Tag></Text>
            <Space wrap>
              <Button 
                type="primary" 
                onClick={() => handleStatusUpdate(selectedRequest.id, 'contacted')}
                disabled={selectedRequest.status === 'contacted'}
              >
                Mark as Contacted
              </Button>
              <Button 
                onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                disabled={selectedRequest.status === 'completed'}
              >
                Mark as Completed
              </Button>
              <Button 
                danger
                onClick={() => handleStatusUpdate(selectedRequest.id, 'cancelled')}
                disabled={selectedRequest.status === 'cancelled'}
              >
                Cancel Request
              </Button>
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default DemoRequests;