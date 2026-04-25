import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Typography, Tabs, Card, Modal, Tag, Spin, message, Skeleton, ConfigProvider } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, InfoCircleOutlined, LineChartOutlined, TeamOutlined } from '@ant-design/icons';
import BatchInsights from '../Teacher/BatchInsights';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import BatchStudentInsight from './BatchStudentInsight';


// Removed deprecated TabPane extraction

interface Schedule {
  id: number;
  title: string;
  description?: string;
  start_time: string; // ISO
  end_time: string;   // ISO
  type: 'class' | 'exam' | 'meeting' | 'quiz' | 'assignment' | 'other' | string;
  batch_id: number;
  batch_name?: string;
  location_mode?: 'online' | 'physical';
  location?: string | null;
  link?: string | null;
  status?: 'scheduled' | 'completed' | 'cancelled' | string;
}

const BatchInsightsAdmin: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const { apiCall } = useAuth();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewSchedule, setViewSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    if (!batchId) return;
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await apiCall(`/schedules/batch/${batchId}`);
        if (res.ok) {
          const data = await res.json();
          setSchedules(Array.isArray(data) ? data : (data.schedules || []));
        } else {
          const err = await res.json().catch(() => ({}));
          message.error(err.error || 'Failed to fetch batch schedule');
        }
      } catch (e) {
        message.error('Error fetching batch schedule');
      } finally {
        setLoading(false);
      }
    };
    void fetchSchedules();
  }, [batchId, apiCall]);

  const events = useMemo(() => {
    // Color palette aligned with teacher schedule
    const typeColors: Record<string, string> = {
      class: '#1677ff',
      exam: '#ff4d4f',
      meeting: '#52c41a',
      assignment: '#fa8c16',
      quiz: '#722ed1',
      other: '#6c757d',
    };

    return schedules.map((s) => {
      const startD = dayjs(s.start_time);
      let endD = dayjs(s.end_time);
      if (!endD.isValid() || !endD.isAfter(startD)) {
        endD = startD.add(1, 'hour');
      }
      const color = typeColors[s.type] || '#1677ff';
      return {
        id: String(s.id),
        title: s.title,
        start: startD.toDate(),
        end: endD.toDate(),
        allDay: false,
        backgroundColor: color,
        borderColor: color,
        extendedProps: { schedule: s },
      } as any;
    });
  }, [schedules]);

  const handleEventClick = (info: any) => {
    const s: Schedule | undefined = info?.event?.extendedProps?.schedule;
    if (s) {
      setViewSchedule(s);
      setViewModalVisible(true);
    }
  };

  // Full-page Skeleton Loading state
  if (loading && schedules.length === 0 && !viewModalVisible) {
      return (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
              <div style={{ flexShrink: 0, marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Space align="center" size="middle">
                          <Skeleton.Button active shape="circle" style={{ width: 40, height: 40 }} />
                          <div>
                              <Skeleton.Input active style={{ width: 200, height: 28, borderRadius: 8, marginBottom: 8 }} block />
                              <Skeleton.Input active style={{ width: 140, height: 16, borderRadius: 6 }} block />
                          </div>
                      </Space>
                  </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                  <Space size="large">
                      <Skeleton.Input active style={{ width: 100, height: 24, borderRadius: 6 }} />
                      <Skeleton.Input active style={{ width: 120, height: 24, borderRadius: 6 }} />
                      <Skeleton.Input active style={{ width: 130, height: 24, borderRadius: 6 }} />
                  </Space>
              </div>
              <div style={{ flex: 1, border: '1px solid #f0f0f8', borderRadius: 16, padding: 24, background: '#fff' }}>
                  <Skeleton active paragraph={{ rows: 6 }} />
              </div>
          </div>
      );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
          fontFamily: 'Inter, -apple-system, sans-serif'
        },
        components: {
          Tabs: {
            titleFontSize: 15,
            itemColor: '#64748b',
            itemSelectedColor: '#6366f1',
            itemHoverColor: '#818cf8',
          },
          Card: {
            borderRadiusLG: 16,
          }
        }
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 90px)' }}>
        {/* Premium Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                style={{ 
                    width: 40, height: 40, borderRadius: 12, 
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: -0.5 }}>
                Batch Insights
              </div>
              <Typography.Text style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                Administrator Overview and Analytics
              </Typography.Text>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Tabs 
            defaultActiveKey="insights"
            style={{ height: '100%' }}
            items={[
          {
            key: 'insights',
            label: <span><LineChartOutlined /> Performance Insights</span>,
            children: (
              <div style={{ padding: '4px 0', overflowY: 'auto', height: 'calc(100vh - 200px)' }}>
                <BatchInsights batchId={batchId as string} />
              </div>
            )
          },
          {
            key: 'schedule',
            label: <span><CalendarOutlined /> Master Schedule</span>,
            children: (
              <div style={{ overflowY: 'auto', height: 'calc(100vh - 200px)' }}>
                <Card title="Interactive Calendar" bordered={false} style={{ boxShadow: '0 2px 12px rgba(99,102,241,0.04)', border: '1px solid #f1f5f9' }}>
                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
                      <Spin />
                    </div>
                  ) : (
                    <FullCalendar
                      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
                      height={720}
                      events={events}
                      editable={false}
                      selectable={false}
                      dayMaxEvents={true}
                      eventClick={handleEventClick}
                      eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: true } as any}
                    />
                  )}
                </Card>
                <div style={{ marginTop: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13, border: '1px solid #e2e8f0' }}>
                  <InfoCircleOutlined style={{ color: '#6366f1' }} /> 
                  This calendar provides a comprehensive view of all class meetings, interactive sessions, and deadlines.
                </div>
              </div>
            )
          },
          {
            key: 'student-insight',
            label: <span><TeamOutlined /> Student Overview</span>,
            children: (
              <div style={{ padding: '4px 0', overflowY: 'auto', height: 'calc(100vh - 200px)' }}>
                <BatchStudentInsight batchId={batchId as string} />
              </div>
            )
          }
        ]}
      />

      <Modal
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        onOk={() => setViewModalVisible(false)}
        title={viewSchedule?.title || 'Schedule Details'}
        okText="Close"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        {viewSchedule ? (
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <div>
              <Tag color="blue">{viewSchedule.type}</Tag>
              {viewSchedule.status ? <Tag>{viewSchedule.status}</Tag> : null}
            </div>
            <div>
              <b>Start:</b> {dayjs(viewSchedule.start_time).format('MMM DD, YYYY HH:mm')}
            </div>
            <div>
              <b>End:</b> {dayjs(viewSchedule.end_time).format('MMM DD, YYYY HH:mm')}
            </div>
            {viewSchedule.location_mode ? (
              <div>
                <b>Location:</b> {viewSchedule.location_mode === 'online' ? 'Online' : 'Physical'} {viewSchedule.location ? `- ${viewSchedule.location}` : ''}
              </div>
            ) : null}
            {viewSchedule.link ? (
              <div>
                <b>Link:</b> <a href={viewSchedule.link} target="_blank" rel="noreferrer">{viewSchedule.link}</a>
              </div>
            ) : null}
            {viewSchedule.description ? (
              <div>
                <b>Description:</b> {viewSchedule.description}
              </div>
            ) : null}
          </Space>
        ) : null}
      </Modal>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default BatchInsightsAdmin;