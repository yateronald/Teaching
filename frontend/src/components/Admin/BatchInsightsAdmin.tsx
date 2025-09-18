import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Typography, Tabs, Card, Modal, Tag, Spin, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import BatchInsights from '../Teacher/BatchInsights';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import BatchStudentInsight from './BatchStudentInsight';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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

  if (!batchId) return null;

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Space align="center" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>Batch Insights</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
      </Space>
      <Text type="secondary">Administrator view</Text>

      <Tabs defaultActiveKey="insights">
        <TabPane tab="Insights" key="insights">
          <BatchInsights batchId={batchId} />
        </TabPane>
        <TabPane tab={<span><CalendarOutlined /> Schedule</span>} key="schedule">
          <Card title="Batch Calendar">
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
          <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
            <InfoCircleOutlined /> This calendar shows all class meetings, quizzes, and events scheduled for this batch.
          </Typography.Paragraph>
        </TabPane>
        <TabPane tab="Student Insight" key="student-insight">
          <BatchStudentInsight batchId={batchId} />
        </TabPane>
      </Tabs>

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
    </Space>
  );
};

export default BatchInsightsAdmin;