import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Card, Modal, Form, Input, InputNumber, Select, Table, Button, message,
  Skeleton, Empty, Breadcrumb, Tooltip, Space, Row, Col,
  Typography, Tag, Tabs, Radio, Dropdown, Upload, Progress
} from 'antd';
import type { UploadFile } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined,
  SearchOutlined, ReadOutlined, FormOutlined, SoundOutlined,
  AudioOutlined, BookOutlined, FileTextOutlined, QuestionCircleOutlined,
  TeamOutlined, UserOutlined, MoreOutlined, ArrowUpOutlined, ArrowDownOutlined,
  SendOutlined, UploadOutlined, ThunderboltOutlined,
  CustomerServiceOutlined, FolderOpenOutlined, CheckCircleOutlined, CloseCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import {
  renderEoYearsView as _renderEoYearsView,
  renderEoMonthsView as _renderEoMonthsView,
  renderEoPartiesView as _renderEoPartiesView,
  renderEoPartieDetailView as _renderEoPartieDetailView,
  type EoYear, type EoMonth, type EoPartie, type EoTache, type EoPointAborder, type EoSujet,
} from './EoRenderHelpers';
import ExamAssignmentModal from './ExamAssignmentModal';
import GrantCreditsModal from './GrantCreditsModal';
import AdminCOAnalytics from './AdminCOAnalytics';

const { Text } = Typography;
const { TextArea } = Input;

// ============================================================
// Types
// ============================================================
interface Category {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  series_count: number;
  created_at: string;
  updated_at: string;
}

interface CefrDistribution {
  A1: number; A2: number; B1: number; B2: number; C1: number; C2: number;
}

interface CefrThresholds {
  A1: number; A2: number; B1: number; B2: number; C1: number; C2: number;
}

interface Series {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  total_questions: number;
  total_points: number;
  cefr_thresholds: CefrThresholds;
  cefr_distribution: CefrDistribution;
  intro_audio_kdrive_file_id?: number | null;
  intro_audio_file_name?: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface Question {
  id: number;
  question_order: number;
  image_url: string | null;
  // CO audio fields
  audio_kdrive_file_id?: number | null;
  audio_file_name?: string | null;
  image_kdrive_file_id?: number | null;
  image_file_name?: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  cefr_level: string;
  points: number;
  created_at: string;
  updated_at: string;
}

interface SeriesDetail extends Series {
  questions: Question[];
}

interface Assignment {
  id: number;
  series_id?: number;
  category_id?: number;
  student_id: number | null;
  batch_id: number | null;
  assigned_at: string;
  student_first_name?: string;
  student_last_name?: string;
  student_email?: string;
  batch_name?: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Batch {
  id: number;
  name: string;
}

// ============================================================
// Constants
// ============================================================
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const CEFR_COLORS: Record<string, string> = {
  A1: '#22c55e', A2: '#16a34a', B1: '#3b82f6', B2: '#2563eb', C1: '#f59e0b', C2: '#dc2626',
};

const ICON_OPTIONS = [
  { value: 'ReadOutlined', label: 'Read', icon: <ReadOutlined /> },
  { value: 'FormOutlined', label: 'Write', icon: <FormOutlined /> },
  { value: 'SoundOutlined', label: 'Listen', icon: <SoundOutlined /> },
  { value: 'AudioOutlined', label: 'Speak', icon: <AudioOutlined /> },
  { value: 'BookOutlined', label: 'Book', icon: <BookOutlined /> },
  { value: 'FileTextOutlined', label: 'Document', icon: <FileTextOutlined /> },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  ReadOutlined: <ReadOutlined />,
  FormOutlined: <FormOutlined />,
  SoundOutlined: <SoundOutlined />,
  AudioOutlined: <AudioOutlined />,
  BookOutlined: <BookOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  EditOutlined: <EditOutlined />,
};

const IMPLEMENTED_CATEGORIES = ['Compréhension Écrite', 'Compréhension Orale', 'Expression Écrite', 'Expression Orale'];

type CategoryType = 'ce' | 'co' | 'ee' | 'eo';

function getCategoryType(name: string): CategoryType {
  if (name === 'Compréhension Orale') return 'co';
  if (name === 'Expression Écrite') return 'ee';
  if (name === 'Expression Orale') return 'eo';
  return 'ce';
}

function getApiPrefix(catType: CategoryType): string {
  return catType === 'co' ? '/tcf/co' : '/tcf';
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ============================================================
// Helper Components
// ============================================================
const CefrTag: React.FC<{ level: string }> = ({ level }) => (
  <Tag
    style={{
      background: `${CEFR_COLORS[level]}15`,
      color: CEFR_COLORS[level],
      border: `1px solid ${CEFR_COLORS[level]}40`,
      fontWeight: 700,
      fontSize: 11,
      borderRadius: 6,
    }}
  >
    {level}
  </Tag>
);

const CefrDistributionTags: React.FC<{ distribution: CefrDistribution }> = ({ distribution }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
    {CEFR_LEVELS.map(level => {
      const count = distribution[level] || 0;
      if (count === 0) return null;
      return (
        <Tag
          key={level}
          style={{
            background: `${CEFR_COLORS[level]}15`,
            color: CEFR_COLORS[level],
            border: `1px solid ${CEFR_COLORS[level]}40`,
            fontWeight: 700,
            fontSize: 10,
            borderRadius: 6,
            margin: 0,
          }}
        >
          {level}: {count}
        </Tag>
      );
    })}
  </div>
);


// ============================================================
// CategoryFormModal
// ============================================================
const CategoryFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory: Category | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, editingCategory, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          description: editingCategory.description || '',
          icon: editingCategory.icon || undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingCategory, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const url = editingCategory
        ? `/tcf/categories/${editingCategory.id}`
        : '/tcf/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const resp = await apiCall(url, {
        method,
        body: JSON.stringify(values),
      });
      if (resp.ok) {
        message.success(editingCategory ? 'Category updated' : 'Category created');
        onSuccess();
        onClose();
      } else {
        const data = await resp.json();
        message.error(data.error || 'Failed to save category');
      }
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editingCategory ? 'Edit Category' : 'Create Category'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={saving}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="e.g. Compréhension Orale" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Brief description of this category" />
        </Form.Item>
        <Form.Item name="icon" label="Icon">
          <Select placeholder="Select an icon" allowClear>
            {ICON_OPTIONS.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                <Space>{opt.icon} {opt.label}</Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================================
// SeriesFormModal
// ============================================================
const SeriesFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSeries: Series | null;
  categoryId: number;
  categoryType: CategoryType;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, editingSeries, categoryId, categoryType, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [introAudioFileList, setIntroAudioFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      setIntroAudioFileList([]);
      if (editingSeries) {
        const thresholds = typeof editingSeries.cefr_thresholds === 'string'
          ? JSON.parse(editingSeries.cefr_thresholds)
          : editingSeries.cefr_thresholds;
        form.setFieldsValue({
          name: editingSeries.name,
          description: editingSeries.description || '',
          duration_minutes: editingSeries.duration_minutes,
          threshold_A1: thresholds.A1,
          threshold_A2: thresholds.A2,
          threshold_B1: thresholds.B1,
          threshold_B2: thresholds.B2,
          threshold_C1: thresholds.C1,
          threshold_C2: thresholds.C2,
        });
        // Show existing intro audio file name for CO
        if (categoryType === 'co' && editingSeries.intro_audio_file_name) {
          setIntroAudioFileList([{ uid: '-1', name: editingSeries.intro_audio_file_name, status: 'done' }]);
        }
      } else {
        form.resetFields();
      }
    }
  }, [open, editingSeries, form, categoryType]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const cefr_thresholds: CefrThresholds = {
        A1: values.threshold_A1 ?? 0,
        A2: values.threshold_A2 ?? 0,
        B1: values.threshold_B1 ?? 0,
        B2: values.threshold_B2 ?? 0,
        C1: values.threshold_C1 ?? 0,
        C2: values.threshold_C2 ?? 0,
      };

      // Validate ascending order
      const vals = CEFR_LEVELS.map(l => cefr_thresholds[l]);
      for (let i = 1; i < vals.length; i++) {
        if (vals[i] < vals[i - 1]) {
          message.error('CEFR thresholds must be in ascending order (A1 ≤ A2 ≤ B1 ≤ B2 ≤ C1 ≤ C2)');
          return;
        }
      }

      setSaving(true);

      const prefix = getApiPrefix(categoryType);
      const url = editingSeries
        ? `${prefix}/series/${editingSeries.id}`
        : `${prefix}/categories/${categoryId}/series`;
      const method = editingSeries ? 'PUT' : 'POST';

      if (categoryType === 'co') {
        // CO: use FormData for multipart upload (supports intro_audio)
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('description', values.description || '');
        formData.append('duration_minutes', String(values.duration_minutes));
        formData.append('cefr_thresholds', JSON.stringify(cefr_thresholds));

        const introAudioFile = introAudioFileList[0]?.originFileObj;
        if (introAudioFile) {
          formData.append('intro_audio', introAudioFile);
        }

        const resp = await apiCall(url, { method, body: formData });
        if (resp.ok) {
          message.success(editingSeries ? 'Series updated' : 'Series created');
          onSuccess();
          onClose();
        } else {
          const data = await resp.json();
          message.error(data.error || 'Failed to save series');
        }
      } else {
        // CE: JSON body (no audio support)
        const payload = {
          name: values.name,
          description: values.description || null,
          duration_minutes: values.duration_minutes,
          cefr_thresholds,
        };
        const resp = await apiCall(url, { method, body: JSON.stringify(payload) });
        if (resp.ok) {
          message.success(editingSeries ? 'Series updated' : 'Series created');
          onSuccess();
          onClose();
        } else {
          const data = await resp.json();
          message.error(data.error || 'Failed to save series');
        }
      }
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editingSeries ? 'Edit Series' : 'Create Series'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={saving}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="e.g. Série 1" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={2} placeholder="Brief description" />
        </Form.Item>

        {/* Introduction Audio upload for CO */}
        {categoryType === 'co' && (
          <div style={{
            background: '#f8f9ff', borderRadius: 12, padding: 16,
            border: '1px solid #eef2ff', marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              🎧 Introduction Audio (optional)
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              Audio that plays before the quiz starts (e.g. instructions or introduction)
            </div>
            <Upload
              accept=".mp3,.wav,.ogg,.m4a,.webm"
              maxCount={1}
              fileList={introAudioFileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setIntroAudioFileList(fileList)}
              onRemove={() => { setIntroAudioFileList([]); return true; }}
            >
              <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>Select Audio File</Button>
            </Upload>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>MP3, WAV, OGG, M4A, WebM</div>
          </div>
        )}

        <Form.Item
          name="duration_minutes"
          label="Duration (minutes)"
          rules={[{ required: true, message: 'Duration is required' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} placeholder="60" />
        </Form.Item>

        <div style={{ marginBottom: 8 }}>
          <Text strong>CEFR Thresholds (minimum points for each level)</Text>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
            Values must be in ascending order: A1 ≤ A2 ≤ B1 ≤ B2 ≤ C1 ≤ C2
          </div>
        </div>
        <Row gutter={12}>
          {CEFR_LEVELS.map(level => (
            <Col span={4} key={level}>
              <Form.Item
                name={`threshold_${level}`}
                label={<span style={{ color: CEFR_COLORS[level], fontWeight: 700 }}>{level}</span>}
                rules={[{ required: true, message: `${level}` }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
};


// ============================================================
// QuestionFormModal
// ============================================================
const QuestionFormModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingQuestion: Question | null;
  seriesId: number;
  categoryType: CategoryType;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, editingQuestion, seriesId, categoryType, apiCall }) => {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [audioFileList, setAudioFileList] = useState<UploadFile[]>([]);
  const [imageFileList, setImageFileList] = useState<UploadFile[]>([]);

  // Helper: append token to image URL for authenticated access
  const authedImageUrl = (url: string | null | undefined) => {
    if (!url || !token) return url || '';
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}token=${token}`;
  };

  useEffect(() => {
    if (open) {
      setAudioFileList([]);
      setImageFileList([]);
      if (editingQuestion) {
        form.setFieldsValue({
          question_text: editingQuestion.question_text,
          option_a: editingQuestion.option_a,
          option_b: editingQuestion.option_b,
          option_c: editingQuestion.option_c,
          option_d: editingQuestion.option_d,
          correct_answer: editingQuestion.correct_answer,
          cefr_level: editingQuestion.cefr_level,
          points: editingQuestion.points,
        });
        // Show existing audio file name for CO
        if (categoryType === 'co' && editingQuestion.audio_file_name) {
          setAudioFileList([{ uid: '-1', name: editingQuestion.audio_file_name, status: 'done' }]);
        }
        if (categoryType === 'co' && editingQuestion.image_file_name) {
          setImageFileList([{ uid: '-1', name: editingQuestion.image_file_name, status: 'done' }]);
        }
        // Preload existing image for CE
        if (categoryType === 'ce' && editingQuestion.image_url) {
          const imgUrl = authedImageUrl(editingQuestion.image_url);
          setImageFileList([{ uid: '-1', name: 'Current image', status: 'done', url: imgUrl, thumbUrl: imgUrl }]);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ points: 1 });
      }
    }
  }, [open, editingQuestion, form, categoryType]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (categoryType === 'co') {
        // CO: use FormData for multipart upload
        const audioFile = audioFileList[0]?.originFileObj;
        if (!editingQuestion && !audioFile) {
          message.error('Audio file is required for Compréhension Orale questions');
          setSaving(false);
          return;
        }

        const formData = new FormData();
        if (audioFile) formData.append('audio', audioFile);
        const imgFile = imageFileList[0]?.originFileObj;
        if (imgFile) formData.append('image', imgFile);
        formData.append('question_text', values.question_text);
        formData.append('option_a', values.option_a);
        formData.append('option_b', values.option_b);
        formData.append('option_c', values.option_c);
        formData.append('option_d', values.option_d);
        formData.append('correct_answer', values.correct_answer);
        formData.append('cefr_level', values.cefr_level);
        formData.append('points', String(values.points));

        const url = editingQuestion
          ? `/tcf/co/questions/${editingQuestion.id}`
          : `/tcf/co/series/${seriesId}/questions`;
        const method = editingQuestion ? 'PUT' : 'POST';

        const resp = await apiCall(url, {
          method,
          body: formData,
        });

        if (resp.ok) {
          message.success(editingQuestion ? 'Question updated' : 'Question added');
          onSuccess();
          onClose();
        } else {
          const data = await resp.json();
          message.error(data.error || 'Failed to save question');
        }
      } else {
        // CE: use FormData for multipart upload (image to kDrive)
        const formData = new FormData();
        const imgFile = imageFileList[0]?.originFileObj;
        if (imgFile) formData.append('image', imgFile);
        // If editing and user removed the existing image
        if (editingQuestion && !imgFile && imageFileList.length === 0 && editingQuestion.image_url) {
          formData.append('remove_image', 'true');
        }
        formData.append('question_text', values.question_text);
        formData.append('option_a', values.option_a);
        formData.append('option_b', values.option_b);
        formData.append('option_c', values.option_c);
        formData.append('option_d', values.option_d);
        formData.append('correct_answer', values.correct_answer);
        formData.append('cefr_level', values.cefr_level);
        formData.append('points', String(values.points));

        const url = editingQuestion
          ? `/tcf/questions/${editingQuestion.id}`
          : `/tcf/series/${seriesId}/questions`;
        const method = editingQuestion ? 'PUT' : 'POST';
        const resp = await apiCall(url, { method, body: formData });
        if (resp.ok) {
          message.success(editingQuestion ? 'Question updated' : 'Question added');
          onSuccess();
          onClose();
        } else {
          const data = await resp.json();
          message.error(data.error || 'Failed to save question');
        }
      }
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={saving}
      width={720}
      destroyOnClose
      styles={{ body: { padding: 0 } }}
    >
      {/* Modal header */}
      <div style={{
        padding: '20px 24px', borderBottom: '1px solid #f0f0f8',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#4338ca', fontSize: 18,
        }}>
          <QuestionCircleOutlined />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
            {editingQuestion ? 'Edit Question' : 'Add Question'}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {categoryType === 'co' ? 'Compréhension Orale — with audio' : 'Compréhension Écrite'}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <Form form={form} layout="vertical" requiredMark={false}>

          {/* Media section for CO */}
          {categoryType === 'co' && (
            <div style={{
              background: '#f8f9ff', borderRadius: 12, padding: 16,
              border: '1px solid #eef2ff', marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                📎 Media Files
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>🎧 Audio {!editingQuestion && <span style={{ color: '#ef4444' }}>*</span>}</span>}
                    required={!editingQuestion}
                    style={{ marginBottom: 8 }}
                  >
                    <Upload
                      accept=".mp3,.wav,.ogg,.m4a,.webm"
                      maxCount={1}
                      fileList={audioFileList}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setAudioFileList(fileList)}
                      onRemove={() => { setAudioFileList([]); return true; }}
                    >
                      <Button icon={<UploadOutlined />} style={{ borderRadius: 8, width: '100%' }}>Select Audio</Button>
                    </Upload>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>MP3, WAV, OGG, M4A, WebM</div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>🖼️ Image (optional)</span>}
                    style={{ marginBottom: 8 }}
                  >
                    <Upload
                      accept=".jpg,.jpeg,.png,.gif,.webp"
                      maxCount={1}
                      fileList={imageFileList}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setImageFileList(fileList)}
                      onRemove={() => { setImageFileList([]); return true; }}
                    >
                      <Button icon={<UploadOutlined />} style={{ borderRadius: 8, width: '100%' }}>Select Image</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          )}

          {/* Question text */}
          <Form.Item
            name="question_text"
            label={<span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Question Text <span style={{ color: '#ef4444' }}>*</span></span>}
            rules={[{ required: true, message: 'Question text is required' }]}
          >
            <TextArea rows={2} placeholder="Enter the question text..." style={{ borderRadius: 8 }} />
          </Form.Item>

          {categoryType === 'ce' && (
            <div style={{
              background: '#f0fdfa', borderRadius: 12, padding: 16,
              border: '1px solid #ccfbf1', marginBottom: 20,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                🖼️ Image (optional)
              </div>
              {/* Show existing image preview when editing */}
              {editingQuestion?.image_url && imageFileList.length > 0 && !imageFileList[0].originFileObj && (
                <div style={{ marginBottom: 12 }}>
                  <img src={authedImageUrl(editingQuestion.image_url)} alt="Current" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Current image (upload a new one to replace)</div>
                </div>
              )}
              <Upload
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxCount={1}
                fileList={imageFileList}
                listType="picture"
                beforeUpload={() => false}
                onChange={({ fileList }) => setImageFileList(fileList)}
                onRemove={() => { setImageFileList([]); return true; }}
              >
                <Button icon={<UploadOutlined />} style={{ borderRadius: 8, width: '100%' }}>Select Image</Button>
              </Upload>
            </div>
          )}

          {/* Options section */}
          <div style={{
            background: '#fafbff', borderRadius: 12, padding: 16,
            border: '1px solid #f0f0f8', marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Answer Options
            </div>
            <Row gutter={12}>
              {['a', 'b', 'c', 'd'].map(letter => (
                <Col span={12} key={letter}>
                  <Form.Item
                    name={`option_${letter}`}
                    rules={[{ required: true, message: 'Required' }]}
                    style={{ marginBottom: 10 }}
                  >
                    <Input
                      prefix={<span style={{ fontWeight: 700, color: '#6366f1', fontSize: 12, marginRight: 4 }}>{letter.toUpperCase()}</span>}
                      placeholder={`Option ${letter.toUpperCase()}`}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </div>

          {/* Bottom row: answer, level, points */}
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                name="correct_answer"
                label={<span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Correct Answer <span style={{ color: '#ef4444' }}>*</span></span>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <Radio.Group buttonStyle="solid" style={{ display: 'flex' }}>
                  {['A', 'B', 'C', 'D'].map(l => (
                    <Radio.Button key={l} value={l} style={{ flex: 1, textAlign: 'center', fontWeight: 700 }}>{l}</Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cefr_level"
                label={<span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>CEFR Level <span style={{ color: '#ef4444' }}>*</span></span>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select placeholder="Select" style={{ borderRadius: 8 }}>
                  {CEFR_LEVELS.map(level => (
                    <Select.Option key={level} value={level}>
                      <span style={{ color: CEFR_COLORS[level], fontWeight: 700 }}>{level}</span>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="points"
                label={<span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Points <span style={{ color: '#ef4444' }}>*</span></span>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};


// ============================================================
// AssignmentModal
// ============================================================
const AssignmentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  assignType: 'series' | 'category';
  assignId: number;
  assignName: string;
  categoryType: CategoryType;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, assignType, assignId, assignName, categoryType, apiCall }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const [studentsResp, batchesResp, assignResp] = await Promise.all([
        apiCall('/users?role=student'),
        apiCall('/batches'),
        apiCall(
          assignType === 'series'
            ? `${getApiPrefix(categoryType)}/series/${assignId}/assignments`
            : `/tcf/categories/${assignId}/assignments`
        ),
      ]);

      if (studentsResp.ok) {
        const data = await studentsResp.json();
        setStudents(Array.isArray(data) ? data : data.users || []);
      }
      if (batchesResp.ok) {
        const data = await batchesResp.json();
        setBatches(Array.isArray(data) ? data : []);
      }
      if (assignResp.ok) {
        setAssignments(await assignResp.json());
      }
    } catch {
      message.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  }, [open, assignType, assignId, apiCall]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignStudents = async () => {
    if (selectedStudentIds.length === 0) return;
    setAssigning(true);
    try {
      const url = assignType === 'series'
        ? `${getApiPrefix(categoryType)}/series/${assignId}/assign`
        : `/tcf/categories/${assignId}/assign`;
      let successCount = 0, dupCount = 0;
      for (const studentId of selectedStudentIds) {
        const resp = await apiCall(url, { method: 'POST', body: JSON.stringify({ student_id: studentId }) });
        if (resp.ok) successCount++;
        else if (resp.status === 409) dupCount++;
      }
      if (successCount > 0) message.success(`${successCount} student${successCount > 1 ? 's' : ''} assigned`);
      if (dupCount > 0) message.info(`${dupCount} already assigned`);
      setSelectedStudentIds([]);
      fetchData();
    } catch { message.error('Failed to assign students'); }
    finally { setAssigning(false); }
  };

  const handleAssignBatches = async () => {
    if (selectedBatchIds.length === 0) return;
    setAssigning(true);
    try {
      const url = assignType === 'series'
        ? `${getApiPrefix(categoryType)}/series/${assignId}/assign`
        : `/tcf/categories/${assignId}/assign`;
      let successCount = 0, dupCount = 0;
      for (const batchId of selectedBatchIds) {
        const resp = await apiCall(url, { method: 'POST', body: JSON.stringify({ batch_id: batchId }) });
        if (resp.ok) successCount++;
        else if (resp.status === 409) dupCount++;
      }
      if (successCount > 0) message.success(`${successCount} batch${successCount > 1 ? 'es' : ''} assigned`);
      if (dupCount > 0) message.info(`${dupCount} already assigned`);
      setSelectedBatchIds([]);
      fetchData();
    } catch { message.error('Failed to assign batches'); }
    finally { setAssigning(false); }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      const url = assignType === 'series'
        ? `${getApiPrefix(categoryType)}/assignments/${assignmentId}`
        : `/tcf/category-assignments/${assignmentId}`;
      const resp = await apiCall(url, { method: 'DELETE' });
      if (resp.ok) {
        message.success('Assignment removed');
        fetchData();
      } else {
        message.error('Failed to remove assignment');
      }
    } catch {
      message.error('Failed to remove assignment');
    }
  };

  const studentAssignments = assignments.filter(a => a.student_id);
  const batchAssignments = assignments.filter(a => a.batch_id);

  return (
    <Modal
      title={`Assign: ${assignName}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Tabs
        items={[
          {
            key: 'students',
            label: (
              <span><UserOutlined /> Students</span>
            ),
            children: (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select students..."
                    value={selectedStudentIds}
                    onChange={setSelectedStudentIds}
                    optionFilterProp="label"
                    style={{ flex: 1 }}
                    loading={loading}
                    maxTagCount="responsive"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    options={students.map(s => ({
                      value: s.id,
                      label: `${s.first_name} ${s.last_name} (${s.email})`,
                    }))}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleAssignStudents}
                    loading={assigning}
                    disabled={selectedStudentIds.length === 0}
                  >
                    Assign
                  </Button>
                </div>
                {studentAssignments.length === 0 ? (
                  <Empty description="No students assigned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {studentAssignments.map(a => (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 10, background: '#f8fafc',
                          border: '1px solid #f0f0f8',
                        }}
                      >
                        <div>
                          <Text strong style={{ fontSize: 13 }}>
                            {a.student_first_name} {a.student_last_name}
                          </Text>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.student_email}</div>
                        </div>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveAssignment(a.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'batches',
            label: (
              <span><TeamOutlined /> Batches</span>
            ),
            children: (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <Select
                    mode="multiple"
                    showSearch
                    placeholder="Select batches..."
                    value={selectedBatchIds}
                    onChange={setSelectedBatchIds}
                    optionFilterProp="label"
                    style={{ flex: 1 }}
                    loading={loading}
                    maxTagCount="responsive"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    options={batches.map(b => ({
                      value: b.id,
                      label: b.name,
                    }))}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleAssignBatches}
                    loading={assigning}
                    disabled={selectedBatchIds.length === 0}
                  >
                    Assign
                  </Button>
                </div>
                {batchAssignments.length === 0 ? (
                  <Empty description="No batches assigned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {batchAssignments.map(a => (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: 10, background: '#f8fafc',
                          border: '1px solid #f0f0f8',
                        }}
                      >
                        <Text strong style={{ fontSize: 13 }}>{a.batch_name}</Text>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveAssignment(a.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};


// ============================================================
// Bulk Import Modal (CO only)
// ============================================================
interface ParsedImportQuestion {
  number: number;
  prompt: string;
  level: string;
  points: number;
  options: { A: string; B: string; C: string; D: string };
  correct_letter: string;
  has_audio: boolean;
  has_image: boolean;
  audioFile?: File;
  imageFile?: File;
}

interface ParsedImportData {
  seriesName: string;
  description: string;
  durationMinutes: number;
  totalPoints: number;
  questionCount: number;
  questions: ParsedImportQuestion[];
  introAudioFile?: File;
}

const BulkImportModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: number;
  token: string | null;
}> = ({ open, onClose, onSuccess, categoryId, token: authToken }) => {
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setParsedData(null);
      setImporting(false);
      setImportProgress(0);
      setError(null);
    }
  }, [open]);

  /** Extract filename from a path like "output\\folder\\audio\\file.mp3" */
  const extractFilename = (filePath: string): string => {
    if (!filePath) return '';
    // Handle both backslash and forward slash
    const parts = filePath.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1];
  };

  /** Calculate CEFR thresholds from questions data */
  const calculateCefrThresholds = (questions: ParsedImportQuestion[]): Record<string, number> => {
    const pointsByLevel: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const q of questions) {
      if (pointsByLevel.hasOwnProperty(q.level)) {
        pointsByLevel[q.level] += q.points;
      }
    }
    // Build cumulative thresholds
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const thresholds: Record<string, number> = {};
    let cumulative = 0;
    for (const level of levels) {
      cumulative += pointsByLevel[level];
      // Threshold = minimum score to reach this level (use ~60% of cumulative)
      thresholds[level] = Math.round(cumulative * 0.6);
    }
    // Ensure ascending order and reasonable values
    let prev = 0;
    for (const level of levels) {
      if (thresholds[level] <= prev) thresholds[level] = prev + 1;
      prev = thresholds[level];
    }
    return thresholds;
  };

  /** Handle folder selection */
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setParsedData(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Build a map of filename -> File for quick lookup
    const filesByName: Record<string, File> = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath || file.name;
      // Skip backup folders to prevent them from overwriting the correct files
      if (relativePath.includes('_original_images_backup') || relativePath.includes('_original_audio_backup')) {
        continue;
      }
      const filename = relativePath.split('/').pop() || '';
      filesByName[filename.toLowerCase()] = file;
    }

    // Find the JSON file
    let jsonFile: File | null = null;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name === 'tcf_questions.json') {
        jsonFile = file;
        break;
      }
    }

    if (!jsonFile) {
      setError('No tcf_questions.json file found in the selected folder');
      return;
    }

    // Read and parse the JSON
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawQuestions = JSON.parse(event.target?.result as string);
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
          setError('JSON file is empty or not an array');
          return;
        }

        const firstQ = rawQuestions[0];

        // Find intro audio file
        const introAudioFilename = extractFilename(firstQ.quiz_intro_audio_path || '');
        const introAudioFile = introAudioFilename ? filesByName[introAudioFilename.toLowerCase()] : undefined;

        // Map questions
        const questions: ParsedImportQuestion[] = rawQuestions.map((q: Record<string, unknown>) => {
          const audioFilename = extractFilename((q.audio_path as string) || '');
          const imageFilename = extractFilename((q.image_path as string) || '');
          const audioFile = audioFilename ? filesByName[audioFilename.toLowerCase()] : undefined;
          const imageFile = imageFilename ? filesByName[imageFilename.toLowerCase()] : undefined;

          return {
            number: q.number as number,
            prompt: (q.prompt as string) || '',
            level: (q.level as string) || 'A1',
            points: parseFloat(q.points as string) || 0,
            options: (q.options as { A: string; B: string; C: string; D: string }) || { A: 'A', B: 'B', C: 'C', D: 'D' },
            correct_letter: (q.correct_letter as string) || 'A',
            has_audio: !!audioFile,
            has_image: !!imageFile,
            audioFile,
            imageFile,
          };
        });

        setParsedData({
          seriesName: (firstQ.quiz_series as string) || 'Imported Series',
          description: (firstQ.quiz_description as string) || '',
          durationMinutes: parseInt(firstQ.quiz_minutes as string, 10) || 35,
          totalPoints: parseInt(firstQ.quiz_total_points as string, 10) || 0,
          questionCount: parseInt(firstQ.quiz_question_count as string, 10) || questions.length,
          questions,
          introAudioFile,
        });
      } catch (err) {
        setError(`Failed to parse JSON: ${(err as Error).message}`);
      }
    };
    reader.onerror = () => setError('Failed to read JSON file');
    reader.readAsText(jsonFile);
  };

  /** Handle import with real upload progress via XHR */
  const handleImport = async () => {
    if (!parsedData) return;
    setImporting(true);
    setImportProgress(0);
    setError(null);

    try {
      const formData = new FormData();

      // Series data
      const cefrThresholds = calculateCefrThresholds(parsedData.questions);
      const seriesPayload = {
        name: parsedData.seriesName,
        description: parsedData.description,
        duration_minutes: parsedData.durationMinutes,
        cefr_thresholds: cefrThresholds,
        total_points: parsedData.totalPoints,
        category_id: categoryId,
      };
      formData.append('series_data', JSON.stringify(seriesPayload));

      // Questions data (without file objects)
      const questionsPayload = parsedData.questions.map(q => ({
        number: q.number,
        prompt: q.prompt,
        level: q.level,
        points: q.points,
        options: q.options,
        correct_letter: q.correct_letter,
        has_audio: q.has_audio,
        has_image: q.has_image,
      }));
      formData.append('questions_data', JSON.stringify(questionsPayload));

      // Intro audio
      if (parsedData.introAudioFile) {
        formData.append('intro_audio', parsedData.introAudioFile);
      }

      // Append audio and image files
      for (const q of parsedData.questions) {
        if (q.audioFile) formData.append(`audio_${q.number}`, q.audioFile);
        if (q.imageFile) formData.append(`image_${q.number}`, q.imageFile);
      }

      // Use XHR for real upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/tcf/co/series/bulk-import`);
        if (authToken) xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

        // Track upload progress (sending files to server)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Upload phase is 0-60%, server processing is 60-100%
            const pct = Math.round((e.loaded / e.total) * 60);
            setImportProgress(pct);
          }
        };

        xhr.upload.onloadend = () => {
          // Files sent, now server is processing (uploading to kDrive)
          setImportProgress(65);
          // Simulate server-side progress
          let serverPct = 65;
          const interval = setInterval(() => {
            serverPct += 2;
            if (serverPct > 95) { clearInterval(interval); return; }
            setImportProgress(serverPct);
          }, 800);
          (xhr as any)._interval = interval;
        };

        xhr.onload = () => {
          if ((xhr as any)._interval) clearInterval((xhr as any)._interval);
          setImportProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              message.success(`Imported "${parsedData.seriesName}" with ${result.imported_questions || parsedData.questions.length} questions`);
            } catch {
              message.success('Series imported successfully');
            }
            onSuccess();
            setTimeout(() => onClose(), 500);
            resolve();
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              setError(`Import failed: ${errData.error || 'Unknown error'}`);
            } catch {
              setError(`Import failed (status ${xhr.status})`);
            }
            reject(new Error('Import failed'));
          }
        };

        xhr.onerror = () => {
          if ((xhr as any)._interval) clearInterval((xhr as any)._interval);
          setError('Network error during import');
          reject(new Error('Network error'));
        };

        xhr.send(formData);
      });
    } catch {
      // Error already set in XHR handlers
    } finally {
      setImporting(false);
    }
  };

  // Edit question state
  const [editingImportQuestion, setEditingImportQuestion] = useState<ParsedImportQuestion | null>(null);

  const handleRemoveQuestion = (number: number) => {
    if (!parsedData) return;
    const updated = parsedData.questions.filter(q => q.number !== number);
    setParsedData({
      ...parsedData,
      questions: updated,
      questionCount: updated.length,
      totalPoints: updated.reduce((s, q) => s + q.points, 0),
    });
  };

  const handleSaveEditQuestion = (edited: ParsedImportQuestion) => {
    if (!parsedData) return;
    const updated = parsedData.questions.map(q => q.number === edited.number ? edited : q);
    setParsedData({
      ...parsedData,
      questions: updated,
      totalPoints: updated.reduce((s, q) => s + q.points, 0),
    });
    setEditingImportQuestion(null);
  };

  const previewColumns = [
    {
      title: '#',
      dataIndex: 'number',
      key: 'number',
      width: 50,
      render: (n: number) => <span style={{ fontWeight: 700, color: '#64748b' }}>{n}</span>,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 70,
      render: (level: string) => <CefrTag level={level} />,
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      width: 60,
      render: (pts: number) => <span style={{ fontWeight: 700 }}>{pts}</span>,
    },
    {
      title: 'Question',
      dataIndex: 'prompt',
      key: 'prompt',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontSize: 12 }}>{text.length > 50 ? text.substring(0, 50) + '...' : text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Audio',
      dataIndex: 'has_audio',
      key: 'has_audio',
      width: 55,
      align: 'center' as const,
      render: (has: boolean) => has
        ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 14 }} />
        : <CloseCircleOutlined style={{ color: '#ef4444', fontSize: 14 }} />,
    },
    {
      title: 'Img',
      dataIndex: 'has_image',
      key: 'has_image',
      width: 45,
      align: 'center' as const,
      render: (has: boolean) => has
        ? <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 14 }} />
        : <span style={{ color: '#d1d5db', fontSize: 11 }}>—</span>,
    },
    {
      title: 'Ans',
      dataIndex: 'correct_letter',
      key: 'correct_letter',
      width: 50,
      render: (ans: string) => (
        <Tag style={{ background: '#dcfce7', color: '#15803d', border: 'none', fontWeight: 700, borderRadius: 6, fontSize: 11 }}>
          {ans}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 70,
      render: (_: unknown, record: ParsedImportQuestion) => (
        <Space size={2}>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />}
              onClick={() => setEditingImportQuestion({ ...record })}
              style={{ borderRadius: 6, color: '#6366f1', width: 26, height: 26 }} />
          </Tooltip>
          <Tooltip title="Remove">
            <Button type="text" size="small" danger icon={<DeleteOutlined />}
              onClick={() => handleRemoveQuestion(record.number)}
              style={{ borderRadius: 6, width: 26, height: 26 }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18,
          }}>
            <FolderOpenOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Import Series from Folder</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Compréhension Orale — bulk import</div>
          </div>
        </div>
      }
      width={800}
      footer={null}
      destroyOnClose
    >
      {/* Folder picker */}
      <div style={{ marginBottom: 20 }}>
        <input
          ref={folderInputRef}
          type="file"
          /* @ts-expect-error webkitdirectory is not in React types */
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
          style={{ display: 'none' }}
        />
        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => folderInputRef.current?.click()}
          size="large"
          style={{
            borderRadius: 10, height: 48, fontWeight: 600, width: '100%',
            border: '2px dashed #c7d2fe', color: '#4338ca', background: '#f8f9ff',
          }}
        >
          {parsedData ? '📁 Change Folder...' : '📁 Select Test Folder'}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Preview */}
      {parsedData && (
        <div>
          {/* Series info summary */}
          <div style={{
            background: '#f8f9ff', borderRadius: 12, padding: 16, marginBottom: 16,
            border: '1px solid #e0e7ff',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              {parsedData.seriesName}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#4338ca' }}>{parsedData.questions.length}</strong> questions
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#22c55e' }}>{parsedData.totalPoints}</strong> points
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#f59e0b' }}>{parsedData.durationMinutes}</strong> minutes
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Intro audio: {parsedData.introAudioFile
                  ? <CheckCircleOutlined style={{ color: '#22c55e' }} />
                  : <CloseCircleOutlined style={{ color: '#ef4444' }} />}
              </span>
            </div>
            {parsedData.description && (
              <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'pre-line', maxHeight: 60, overflow: 'auto' }}>
                {parsedData.description}
              </div>
            )}
          </div>

          {/* File match summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Tag color="blue" style={{ borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>
              🎵 Audio: {parsedData.questions.filter(q => q.has_audio).length}/{parsedData.questions.length}
            </Tag>
            <Tag color="purple" style={{ borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>
              🖼️ Images: {parsedData.questions.filter(q => q.has_image).length}/{parsedData.questions.length}
            </Tag>
          </div>

          {/* Questions preview table */}
          <Table
            columns={previewColumns}
            dataSource={parsedData.questions}
            rowKey="number"
            size="small"
            pagination={parsedData.questions.length > 15 ? { pageSize: 15, size: 'small' } : false}
            scroll={{ y: 300 }}
            style={{ marginBottom: 20 }}
          />

          {/* Import progress */}
          {importing && (
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={importProgress}
                status={importProgress < 100 ? 'active' : 'success'}
                strokeColor={{ from: '#6366f1', to: '#4338ca' }}
              />
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
                {importProgress < 60 ? 'Uploading files to server...' : importProgress < 95 ? 'Server processing — uploading to kDrive...' : 'Finalizing...'}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose} disabled={importing} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleImport}
              loading={importing}
              disabled={importing}
              style={{
                borderRadius: 10, fontWeight: 600, height: 40,
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              {importing ? 'Importing...' : `Import ${parsedData.questions.length} Questions`}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      <Modal
        title="Edit Question"
        open={!!editingImportQuestion}
        onCancel={() => setEditingImportQuestion(null)}
        onOk={() => { if (editingImportQuestion) handleSaveEditQuestion(editingImportQuestion); }}
        width={640}
        destroyOnClose
      >
        {editingImportQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {/* Audio preview */}
            {editingImportQuestion.audioFile && (
              <div style={{ background: '#f8f9ff', borderRadius: 10, padding: 12, border: '1px solid #eef2ff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', marginBottom: 6 }}>🎧 Audio Preview</div>
                <audio controls style={{ width: '100%', height: 36 }}
                  src={URL.createObjectURL(editingImportQuestion.audioFile)} />
              </div>
            )}
            {/* Image preview */}
            {editingImportQuestion.imageFile && (
              <div style={{ background: '#f8f9ff', borderRadius: 10, padding: 12, border: '1px solid #eef2ff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', marginBottom: 6 }}>🖼️ Image Preview</div>
                <img src={URL.createObjectURL(editingImportQuestion.imageFile)} alt="Question"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              </div>
            )}
            <div>
              <Text strong style={{ fontSize: 12 }}>Question Text</Text>
              <TextArea rows={2} value={editingImportQuestion.prompt}
                onChange={e => setEditingImportQuestion({ ...editingImportQuestion, prompt: e.target.value })}
                style={{ borderRadius: 8, marginTop: 4 }} />
            </div>
            <Row gutter={12}>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option A</Text>
                <Input value={editingImportQuestion.options.A} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, A: e.target.value } })} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option B</Text>
                <Input value={editingImportQuestion.options.B} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, B: e.target.value } })} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option C</Text>
                <Input value={editingImportQuestion.options.C} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, C: e.target.value } })} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option D</Text>
                <Input value={editingImportQuestion.options.D} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, D: e.target.value } })} />
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}>
                <Text strong style={{ fontSize: 12 }}>Correct Answer</Text>
                <div style={{ marginTop: 4 }}>
                  <Radio.Group buttonStyle="solid" value={editingImportQuestion.correct_letter}
                    onChange={e => setEditingImportQuestion({ ...editingImportQuestion, correct_letter: e.target.value })}>
                    {['A','B','C','D'].map(l => <Radio.Button key={l} value={l} style={{ fontWeight: 700 }}>{l}</Radio.Button>)}
                  </Radio.Group>
                </div>
              </Col>
              <Col span={8}>
                <Text strong style={{ fontSize: 12 }}>CEFR Level</Text>
                <Select value={editingImportQuestion.level} style={{ width: '100%', marginTop: 4 }}
                  onChange={v => setEditingImportQuestion({ ...editingImportQuestion, level: v })}>
                  {CEFR_LEVELS.map(l => <Select.Option key={l} value={l}><span style={{ color: CEFR_COLORS[l], fontWeight: 700 }}>{l}</span></Select.Option>)}
                </Select>
              </Col>
              <Col span={8}>
                <Text strong style={{ fontSize: 12 }}>Points</Text>
                <InputNumber value={editingImportQuestion.points} min={0} style={{ width: '100%', marginTop: 4 }}
                  onChange={v => setEditingImportQuestion({ ...editingImportQuestion, points: v ?? 0 })} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

// ============================================================
// CE Bulk Import Modal
// ============================================================
const CeBulkImportModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: number;
  token: string | null;
}> = ({ open, onClose, onSuccess, categoryId, token: authToken }) => {
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state
  useEffect(() => {
    if (!open) {
      setParsedData(null);
      setImporting(false);
      setError(null);
    }
  }, [open]);

  /** Calculate CEFR thresholds from questions data */
  const calculateCefrThresholds = (questions: any[]): Record<string, number> => {
    const pointsByLevel: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    for (const q of questions) {
      if (pointsByLevel.hasOwnProperty(q.level)) {
        pointsByLevel[q.level] += q.points;
      }
    }
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const thresholds: Record<string, number> = {};
    let cumulative = 0;
    for (const level of levels) {
      cumulative += pointsByLevel[level];
      thresholds[level] = Math.round(cumulative * 0.6);
    }
    let prev = 0;
    for (const level of levels) {
      if (thresholds[level] <= prev) thresholds[level] = prev + 1;
      prev = thresholds[level];
    }
    return thresholds;
  };

  const extractFilename = (filePath: string): string => {
    if (!filePath) return '';
    const parts = filePath.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1];
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setParsedData(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesByName: Record<string, File> = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath || file.name;
      // Skip backup folders to prevent them from overwriting the correct files
      if (relativePath.includes('_original_images_backup') || relativePath.includes('_original_audio_backup')) {
        continue;
      }
      const filename = relativePath.split('/').pop() || '';
      filesByName[filename.toLowerCase()] = file;
    }

    let jsonFile: File | null = null;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name === 'tcf_questions.json') {
        jsonFile = file;
        break;
      }
    }

    if (!jsonFile) {
      setError('No tcf_questions.json file found in the selected folder');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawQuestions = JSON.parse(event.target?.result as string);
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
          setError('JSON file is empty or not an array');
          return;
        }

        const firstQ = rawQuestions[0];
        
        let validQuestions: any[] = [];
        for (const q of rawQuestions) {
           if (q.question_on_image === 'yes' && q.question_has_image === 'no') {
              continue; // skip
           }
           validQuestions.push(q);
        }

        const questions: any[] = validQuestions.map((q: any, idx) => {
          const imageFilename = extractFilename((q.image_path as string) || '');
          const imageFile = imageFilename ? filesByName[imageFilename.toLowerCase()] : undefined;

          return {
            number: idx + 1, // renumber
            prompt: q.question_on_image === 'yes' ? '' : ((q.prompt as string) || ''),
            level: (q.level as string) || 'A1',
            points: parseFloat(q.points as string) || 0,
            options: (q.options as { A: string; B: string; C: string; D: string }) || { A: 'A', B: 'B', C: 'C', D: 'D' },
            correct_letter: (q.correct_letter as string) || 'A',
            has_audio: false,
            has_image: !!imageFile,
            imageFile,
          }; 
        });

        setParsedData({
          seriesName: (firstQ.quiz_series as string) || 'Imported CE Series',
          description: (firstQ.quiz_description as string) || '',
          durationMinutes: parseInt(firstQ.quiz_minutes as string, 10) || 60,
          totalPoints: parseInt(firstQ.quiz_total_points as string, 10) || 0,
          questionCount: questions.length,
          questions,
        });
      } catch (err) {
        setError(`Failed to parse JSON: ${(err as Error).message}`);
      }
    };
    reader.onerror = () => setError('Failed to read JSON file');
    reader.readAsText(jsonFile);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_importProgress, setImportProgress] = useState(0);

  const handleImport = async () => {
    if (!parsedData) return;
    setImporting(true);
    setImportProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      const cefrThresholds = calculateCefrThresholds(parsedData.questions);
      const seriesPayload = {
        name: parsedData.seriesName,
        description: parsedData.description,
        duration_minutes: parsedData.durationMinutes,
        cefr_thresholds: cefrThresholds,
        total_points: parsedData.totalPoints,
        category_id: categoryId,
      };

      formData.append('series_data', JSON.stringify(seriesPayload));

      const questionsPayload = parsedData.questions.map((q: any) => ({
        number: q.number,
        prompt: q.prompt,
        level: q.level,
        points: q.points,
        options: q.options,
        correct_letter: q.correct_letter,
      }));
      formData.append('questions_data', JSON.stringify(questionsPayload));

      // Append image files
      for (const q of parsedData.questions) {
        if (q.imageFile) formData.append(`image_${q.number}`, q.imageFile);
      }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/tcf/series/bulk-import`);
        if (authToken) xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setImportProgress(Math.round((e.loaded / e.total) * 60));
          }
        };

        xhr.upload.onloadend = () => {
          setImportProgress(65);
          let serverPct = 65;
          const interval = setInterval(() => {
            serverPct += 2;
            if (serverPct > 95) { clearInterval(interval); return; }
            setImportProgress(serverPct);
          }, 800);
          (xhr as any)._interval = interval;
        };

        xhr.onload = () => {
          if ((xhr as any)._interval) clearInterval((xhr as any)._interval);
          setImportProgress(100);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              message.success(`Imported "${parsedData.seriesName}" with ${result.imported_questions} questions`);
            } catch {
              message.success('Series imported successfully');
            }
            onSuccess();
            setTimeout(() => onClose(), 500);
            resolve();
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              setError(`Import failed: ${errData.error || 'Unknown error'}`);
            } catch {
              setError(`Import failed (status ${xhr.status})`);
            }
            reject(new Error('Import failed'));
          }
        };

        xhr.onerror = () => {
          if ((xhr as any)._interval) clearInterval((xhr as any)._interval);
          setError('Network error during import');
          reject(new Error('Network error'));
        };

        xhr.send(formData);
      });
    } catch {
      // handled
    } finally {
      setImporting(false);
    }
  };

  const [editingImportQuestion, setEditingImportQuestion] = useState<any | null>(null);

  const handleRemoveQuestion = (number: number) => {
    if (!parsedData) return;
    const updated = parsedData.questions.filter((q: any) => q.number !== number);
    setParsedData({
      ...parsedData,
      questions: updated,
      questionCount: updated.length,
      totalPoints: updated.reduce((s: number, q: any) => s + q.points, 0),
    });
  };

  const handleSaveEditQuestion = (edited: any) => {
    if (!parsedData) return;
    const updated = parsedData.questions.map((q: any) => q.number === edited.number ? edited : q);
    setParsedData({ ...parsedData, questions: updated });
    setEditingImportQuestion(null);
  };

  const previewColumns = [
    { title: '#', dataIndex: 'number', width: 40 },
    { title: 'Level', dataIndex: 'level', width: 60, render: (v: string) => <CefrTag level={v} /> },
    { title: 'Prompt', dataIndex: 'prompt', ellipsis: true },
    { title: 'Answer', dataIndex: 'correct_letter', width: 60, align: 'center' as const, render: (v: string) => <Tag color="green">{v}</Tag> },
    { title: 'Img', dataIndex: 'has_image', width: 50, render: (v: boolean, record: any) => v && record.imageFile ? <img src={URL.createObjectURL(record.imageFile)} alt="q" style={{width:24, height:24}}/> : '-' },
    { title: 'Pts', dataIndex: 'points', width: 50 },
    {
      title: 'Action', key: 'action', width: 80,
      render: (_: unknown, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#6366f1' }} onClick={() => setEditingImportQuestion({ ...record })} />
          <Button type="text" size="small" icon={<DeleteOutlined />} danger onClick={() => handleRemoveQuestion(record.number)} />
        </div>
      )
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #14b8a6, #0f766e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18,
          }}>
            <FileTextOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Import Series from JSON</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Compréhension Écrite — JSON Bulk Import</div>
          </div>
        </div>
      }
      width={900}
      footer={null}
      destroyOnClose
    >
      <div style={{ marginBottom: 20 }}>
        <input
          ref={fileInputRef}
          type="file"
          {...({ webkitdirectory: '', directory: '' } as any)}
          style={{ display: 'none' }}
          onChange={handleFolderSelect}
        />
        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '100%', height: 48, borderStyle: 'dashed', borderColor: '#cbd5e1' }}
        >
          Select Folder (tcf_questions.json & images)
        </Button>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {parsedData && (
        <div>
          {/* Series info summary */}
          <div style={{
            background: '#f0fdfa', borderRadius: 12, padding: 16, marginBottom: 16,
            border: '1px solid #ccfbf1',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              {parsedData.seriesName}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#0f766e' }}>{parsedData.questionCount}</strong> questions
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#22c55e' }}>{parsedData.totalPoints}</strong> points
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#f59e0b' }}>{parsedData.durationMinutes}</strong> minutes
              </span>
            </div>
            {parsedData.description && (
              <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'pre-line', maxHeight: 60, overflow: 'auto' }}>
                {parsedData.description}
              </div>
            )}
          </div>

          {/* File match summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <Tag color="purple" style={{ borderRadius: 8, padding: '2px 10px', fontWeight: 600 }}>
              🖼️ Images: {parsedData.questions.filter((q: any) => q.has_image).length}/{parsedData.questions.length}
            </Tag>
          </div>

          {/* Questions preview table */}

          <Table
            columns={previewColumns}
            dataSource={parsedData.questions}
            rowKey="number"
            size="small"
            pagination={parsedData.questions.length > 15 ? { pageSize: 15, size: 'small' } : false}
            scroll={{ y: 300 }}
            style={{ marginBottom: 20 }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose} disabled={importing} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleImport}
              loading={importing}
              disabled={importing}
              style={{
                borderRadius: 10, fontWeight: 600, height: 40,
                background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                border: 'none', boxShadow: '0 2px 8px rgba(20,184,166,0.3)',
              }}
            >
              {importing ? 'Importing...' : `Import ${parsedData.questions.length} Questions`}
            </Button>
          </div>
        </div>
      )}

      <Modal
        title="Edit Question"
        open={!!editingImportQuestion}
        onCancel={() => setEditingImportQuestion(null)}
        onOk={() => { if (editingImportQuestion) handleSaveEditQuestion(editingImportQuestion); }}
        width={640}
        destroyOnClose
      >
        {editingImportQuestion && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
            {editingImportQuestion.has_image && editingImportQuestion.imageFile && (
              <div style={{ background: '#f8f9ff', borderRadius: 10, padding: 12, border: '1px solid #eef2ff' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#14b8a6', marginBottom: 6 }}>🖼️ Image Preview</div>
                <img src={URL.createObjectURL(editingImportQuestion.imageFile)} alt="Question"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              </div>
            )}
            <div>
              <Text strong style={{ fontSize: 12 }}>Question Text</Text>
              <TextArea rows={2} value={editingImportQuestion.prompt}
                onChange={e => setEditingImportQuestion({ ...editingImportQuestion, prompt: e.target.value })}
                style={{ borderRadius: 8, marginTop: 4 }} />
            </div>
            <Row gutter={12}>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option A</Text>
                <Input value={editingImportQuestion.options.A} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, A: e.target.value } })} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option B</Text>
                <Input value={editingImportQuestion.options.B} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, B: e.target.value } })} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option C</Text>
                <Input value={editingImportQuestion.options.C} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, C: e.target.value } })} />
              </Col>
              <Col span={12}>
                <Text strong style={{ fontSize: 12 }}>Option D</Text>
                <Input value={editingImportQuestion.options.D} style={{ borderRadius: 8, marginTop: 4 }}
                  onChange={e => setEditingImportQuestion({ ...editingImportQuestion, options: { ...editingImportQuestion.options, D: e.target.value } })} />
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={8}>
                <Text strong style={{ fontSize: 12 }}>Correct Answer</Text>
                <div style={{ marginTop: 4 }}>
                  <Radio.Group buttonStyle="solid" value={editingImportQuestion.correct_letter}
                    onChange={e => setEditingImportQuestion({ ...editingImportQuestion, correct_letter: e.target.value })}>
                    {['A','B','C','D'].map(l => <Radio.Button key={l} value={l} style={{ fontWeight: 700 }}>{l}</Radio.Button>)}
                  </Radio.Group>
                </div>
              </Col>
              <Col span={8}>
                <Text strong style={{ fontSize: 12 }}>CEFR Level</Text>
                <Select value={editingImportQuestion.level} style={{ width: '100%', marginTop: 4 }}
                  onChange={v => setEditingImportQuestion({ ...editingImportQuestion, level: v })}>
                  {CEFR_LEVELS.map(l => <Select.Option key={l} value={l}><span style={{ color: CEFR_COLORS[l], fontWeight: 700 }}>{l}</span></Select.Option>)}
                </Select>
              </Col>
              <Col span={8}>
                <Text strong style={{ fontSize: 12 }}>Points</Text>
                <InputNumber value={editingImportQuestion.points} min={0} style={{ width: '100%', marginTop: 4 }}
                  onChange={v => setEditingImportQuestion({ ...editingImportQuestion, points: v ?? 0 })} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

// ============================================================
// EE Bulk Import Modal
// ============================================================
const FRENCH_MONTH_TO_NUMBER: Record<string, number> = {
  'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4,
  'mai': 5, 'juin': 6, 'juillet': 7, 'août': 8,
  'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12,
};

interface EeImportEntry {
  year: string;
  month: string;
  combination: string;
  task_number: number;
  task_type: string;
  word_range: string;
  duration: string;
  question: string;
  prompt: string;
  correction: string;
}

interface EeImportMonthPreview {
  monthName: string;
  monthNumber: number;
  combinations: number;
  tasks: number;
}

interface EeImportPreview {
  year: number;
  months: EeImportMonthPreview[];
  totalCombinations: number;
  totalTasks: number;
}

const EeBulkImportModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, categoryId, apiCall }) => {
  const [rawData, setRawData] = useState<EeImportEntry[] | null>(null);
  const [preview, setPreview] = useState<EeImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [expandedPreviewMonths, setExpandedPreviewMonths] = useState<Set<number>>(new Set());
  const [editingEntry, setEditingEntry] = useState<{ index: number; entry: EeImportEntry } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm] = Form.useForm();

  /** Recalculate preview from rawData */
  const recalcPreview = (data: EeImportEntry[]) => {
    if (data.length === 0) { setPreview(null); return; }
    const yearStr = data[0].year;
    const year = parseInt(yearStr, 10) || 0;
    const monthMap: Record<string, Set<string>> = {};
    const monthTaskCount: Record<string, number> = {};
    for (const entry of data) {
      const monthStr = (entry.month || '').trim();
      if (!monthStr) continue;
      if (!monthMap[monthStr]) { monthMap[monthStr] = new Set(); monthTaskCount[monthStr] = 0; }
      if (entry.combination) monthMap[monthStr].add(entry.combination);
      monthTaskCount[monthStr]++;
    }
    const months: EeImportMonthPreview[] = [];
    let totalCombinations = 0;
    let totalTasks = 0;
    for (const [monthStr, combSet] of Object.entries(monthMap)) {
      const parts = monthStr.split(' ');
      const monthNameLower = (parts[0] || '').toLowerCase();
      const monthNumber = FRENCH_MONTH_TO_NUMBER[monthNameLower] || 0;
      const monthName = parts[0] || monthStr;
      months.push({ monthName, monthNumber, combinations: combSet.size, tasks: monthTaskCount[monthStr] });
      totalCombinations += combSet.size;
      totalTasks += monthTaskCount[monthStr];
    }
    months.sort((a, b) => a.monthNumber - b.monthNumber);
    setPreview({ year, months, totalCombinations, totalTasks });
  };

  /** Remove a tâche entry from rawData */
  const handleRemoveEntry = (entryToRemove: EeImportEntry) => {
    if (!rawData) return;
    Modal.confirm({
      title: 'Remove Tâche',
      content: `Remove "${entryToRemove.task_type}" (T${entryToRemove.task_number}) from ${entryToRemove.combination}?`,
      okText: 'Remove',
      okType: 'danger',
      onOk: () => {
        const idx = rawData.indexOf(entryToRemove);
        if (idx === -1) return;
        const updated = [...rawData];
        updated.splice(idx, 1);
        setRawData(updated);
        recalcPreview(updated);
      },
    });
  };

  /** Open edit modal for a tâche entry */
  const handleEditEntry = (entry: EeImportEntry) => {
    if (!rawData) return;
    const idx = rawData.indexOf(entry);
    if (idx === -1) return;
    setEditingEntry({ index: idx, entry: { ...entry } });
    editForm.setFieldsValue({
      task_type: entry.task_type,
      question: entry.question || '',
      prompt: entry.prompt,
      word_range: entry.word_range,
      duration: entry.duration,
      correction: entry.correction || '',
    });
  };

  /** Save edited entry */
  const handleSaveEdit = () => {
    if (!editingEntry || !rawData) return;
    const values = editForm.getFieldsValue();
    const updated = [...rawData];
    updated[editingEntry.index] = {
      ...updated[editingEntry.index],
      task_type: values.task_type,
      question: values.question || '',
      prompt: values.prompt,
      word_range: values.word_range,
      duration: values.duration,
      correction: values.correction || '',
    };
    setRawData(updated);
    recalcPreview(updated);
    setEditingEntry(null);
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setRawData(null);
      setPreview(null);
      setImporting(false);
      setImportProgress(0);
      setError(null);
      setFileName('');
      setExpandedPreviewMonths(new Set());
      setEditingEntry(null);
    }
  }, [open]);

  /** Parse the JSON file and build preview */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setRawData(null);
    setPreview(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setError('JSON file is empty or not an array');
          return;
        }

        setRawData(parsed);

        // Extract year from first entry
        const yearStr = parsed[0].year;
        const year = parseInt(yearStr, 10);
        if (!year) {
          setError('Could not extract year from data');
          return;
        }

        // Group by month
        const monthMap: Record<string, Set<string>> = {};
        const monthTaskCount: Record<string, number> = {};
        for (const entry of parsed) {
          const monthStr = (entry.month || '').trim();
          if (!monthStr) continue;
          if (!monthMap[monthStr]) {
            monthMap[monthStr] = new Set();
            monthTaskCount[monthStr] = 0;
          }
          if (entry.combination) monthMap[monthStr].add(entry.combination);
          monthTaskCount[monthStr]++;
        }

        // Build preview
        const months: EeImportMonthPreview[] = [];
        let totalCombinations = 0;
        let totalTasks = 0;

        for (const [monthStr, combSet] of Object.entries(monthMap)) {
          const parts = monthStr.split(' ');
          const monthNameLower = (parts[0] || '').toLowerCase();
          const monthNumber = FRENCH_MONTH_TO_NUMBER[monthNameLower] || 0;
          const monthName = parts[0] || monthStr;

          months.push({
            monthName,
            monthNumber,
            combinations: combSet.size,
            tasks: monthTaskCount[monthStr],
          });
          totalCombinations += combSet.size;
          totalTasks += monthTaskCount[monthStr];
        }

        // Sort months by number
        months.sort((a, b) => a.monthNumber - b.monthNumber);

        setPreview({ year, months, totalCombinations, totalTasks });
      } catch (err) {
        setError(`Failed to parse JSON: ${(err as Error).message}`);
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  /** Handle import — process month by month for real progress */
  const handleImport = async () => {
    if (!rawData || !preview) return;
    setImporting(true);
    setImportProgress(0);
    setError(null);

    try {
      // Group data by month
      const monthGroups: Record<string, typeof rawData> = {};
      for (const entry of rawData) {
        const key = (entry.month || '').trim();
        if (!key) continue;
        if (!monthGroups[key]) monthGroups[key] = [];
        monthGroups[key].push(entry);
      }
      const monthKeys = Object.keys(monthGroups);
      const totalMonths = monthKeys.length;
      let processedMonths = 0;
      let totalTaches = 0;
      let totalCombs = 0;

      for (const monthKey of monthKeys) {
        const monthData = monthGroups[monthKey];
        const resp = await apiCall('/tcf/ee/years/bulk-import', {
          method: 'POST',
          body: JSON.stringify({
            category_id: categoryId,
            year: preview.year,
            data: monthData,
          }),
        });

        if (resp.ok) {
          const result = await resp.json();
          totalTaches += result.taches_created || 0;
          totalCombs += result.combinaisons_created || 0;
        } else {
          const errData = await resp.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`Month ${monthKey} failed:`, errData);
        }

        processedMonths++;
        setImportProgress(Math.round((processedMonths / totalMonths) * 100));
      }

      message.success(`Imported ${totalTaches} tâches across ${totalCombs} combinaisons in ${totalMonths} months`);
      onSuccess();
      setTimeout(() => onClose(), 500);
    } catch (err) {
      setError(`Import failed: ${(err as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18,
          }}>
            <FolderOpenOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Import Year from File</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Expression Écrite — bulk import</div>
          </div>
        </div>
      }
      width={700}
      footer={null}
      destroyOnClose
    >
      {/* File picker */}
      <div style={{ marginBottom: 20 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => fileInputRef.current?.click()}
          size="large"
          style={{
            borderRadius: 10, height: 48, fontWeight: 600, width: '100%',
            border: '2px dashed #c7d2fe', color: '#4338ca', background: '#f8f9ff',
          }}
        >
          {fileName ? `📄 ${fileName} — Change File...` : '📄 Select JSON File'}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div>
          {/* Summary header */}
          <div style={{
            background: '#f8f9ff', borderRadius: 12, padding: 16, marginBottom: 16,
            border: '1px solid #e0e7ff',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4338ca', marginBottom: 10 }}>
              📅 Year {preview.year}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#4338ca' }}>{preview.months.length}</strong> month{preview.months.length !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#22c55e' }}>{preview.totalCombinations}</strong> combinaison{preview.totalCombinations !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: 13, color: '#64748b' }}>
                <strong style={{ color: '#f59e0b' }}>{preview.totalTasks}</strong> tâche{preview.totalTasks !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Month breakdown */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Months breakdown <span style={{ fontWeight: 400, color: '#94a3b8' }}>(click to expand)</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto' }}>
              {preview.months.map(m => {
                const isExpanded = expandedPreviewMonths.has(m.monthNumber);
                // Get combinations for this month from rawData
                const monthEntries = rawData?.filter(e => {
                  const parts = (e.month || '').split(' ');
                  const mn = (parts[0] || '').toLowerCase();
                  return FRENCH_MONTH_TO_NUMBER[mn] === m.monthNumber;
                }) || [];
                const combMap: Record<string, typeof monthEntries> = {};
                for (const e of monthEntries) {
                  const k = e.combination || '';
                  if (!combMap[k]) combMap[k] = [];
                  combMap[k].push(e);
                }
                const combNames = Object.keys(combMap).sort((a, b) => {
                  const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
                  const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
                  return na - nb;
                });

                return (
                  <div key={m.monthNumber}>
                    <div
                      onClick={() => setExpandedPreviewMonths(prev => {
                        const next = new Set(prev);
                        if (next.has(m.monthNumber)) next.delete(m.monthNumber); else next.add(m.monthNumber);
                        return next;
                      })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 14px', borderRadius: 10, background: '#fff',
                        border: '1px solid #f1f5f9', cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: '#eef2ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{m.monthNumber}</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{m.monthName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600, fontSize: 11, margin: 0 }}>{m.combinations} comb.</Tag>
                        <Tag color="green" style={{ borderRadius: 6, fontWeight: 600, fontSize: 11, margin: 0 }}>{m.tasks} tâches</Tag>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ marginLeft: 16, marginTop: 4, marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {combNames.map(cn => {
                          const tasks = combMap[cn].sort((a, b) => a.task_number - b.task_number);
                          return (
                            <div key={cn} style={{ padding: '6px 10px', borderRadius: 8, background: '#fafbff', border: '1px solid #f0f0f8', fontSize: 12 }}>
                              <div style={{ fontWeight: 700, color: '#4338ca', fontSize: 12, marginBottom: 4 }}>{cn}</div>
                              {tasks.map(t => (
                                <div key={t.task_number} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, color: '#475569' }}>
                                  <Tag style={{ borderRadius: 4, fontSize: 10, fontWeight: 700, margin: 0, padding: '0 6px', background: '#eef2ff', color: '#4338ca', border: 'none', flexShrink: 0 }}>T{t.task_number}</Tag>
                                  <span style={{ fontSize: 11, color: '#64748b', flexShrink: 0 }}>{t.task_type}</span>
                                  <span style={{ fontSize: 11, color: '#94a3b8' }}>·</span>
                                  <span style={{ fontSize: 11, color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.prompt?.substring(0, 60)}...</span>
                                  <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditEntry(t); }} style={{ borderRadius: 4, color: '#6366f1', width: 20, height: 20, fontSize: 10, flexShrink: 0, minWidth: 20, padding: 0 }} />
                                  <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleRemoveEntry(t); }} style={{ borderRadius: 4, width: 20, height: 20, fontSize: 10, flexShrink: 0, minWidth: 20, padding: 0 }} />
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Import progress */}
          {importing && (
            <div style={{ marginBottom: 16 }}>
              <Progress
                percent={importProgress}
                status={importProgress < 100 ? 'active' : 'success'}
                strokeColor={{ from: '#6366f1', to: '#4338ca' }}
              />
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
                {importProgress < 100 ? `Processing month ${Math.ceil((importProgress / 100) * (preview?.months.length || 1))} of ${preview?.months.length || '?'}...` : 'Done!'}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose} disabled={importing} style={{ borderRadius: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleImport}
              loading={importing}
              disabled={importing}
              style={{
                borderRadius: 10, fontWeight: 600, height: 40,
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              {importing ? 'Importing...' : `Import ${preview.totalTasks} Tâches`}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      <Modal
        open={!!editingEntry}
        onCancel={() => setEditingEntry(null)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700, color: '#1e293b' }}>
              Edit Tâche {editingEntry?.entry.task_number} — {editingEntry?.entry.combination}
            </span>
          </div>
        }
        width={560}
        destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditingEntry(null)} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" onClick={handleSaveEdit} style={{ borderRadius: 8, background: '#4338ca', borderColor: '#4338ca' }}>Save</Button>
          </div>
        }
      >
        {editingEntry && (
          <Form form={editForm} layout="vertical" style={{ marginTop: 12 }}>
            <Form.Item name="task_type" label={<Text strong style={{ fontSize: 12 }}>Task Type</Text>}>
              <Select style={{ borderRadius: 8 }}>
                <Select.Option value="message_court">Message court</Select.Option>
                <Select.Option value="narration">Narration</Select.Option>
                <Select.Option value="argumentation">Argumentation</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="prompt" label={<Text strong style={{ fontSize: 12 }}>Prompt</Text>} rules={[{ required: true, message: 'Prompt is required' }]}>
              <Input.TextArea rows={4} placeholder="Task prompt text..." style={{ borderRadius: 8 }} />
            </Form.Item>
            {editingEntry.entry.task_number === 3 && (
              <Form.Item name="question" label={<Text strong style={{ fontSize: 12 }}>Question (e.g. "Pour ou Contre ?")</Text>}>
                <Input placeholder="e.g. L'uniforme scolaire : Pour Ou Contre ?" style={{ borderRadius: 8 }} />
              </Form.Item>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item name="word_range" label={<Text strong style={{ fontSize: 12 }}>Word Range</Text>} style={{ flex: 1 }}>
                <Input placeholder="e.g. 60-120" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="duration" label={<Text strong style={{ fontSize: 12 }}>Duration</Text>} style={{ flex: 1 }}>
                <Input placeholder="e.g. 10 minutes" style={{ borderRadius: 8 }} />
              </Form.Item>
            </div>
            <Form.Item name="correction" label={<Text strong style={{ fontSize: 12 }}>Correction (optional)</Text>}>
              <Input.TextArea rows={3} placeholder="Correction text..." style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Modal>
  );
};


// ============================================================
// EE Types
// ============================================================
interface EeYear {
  id: number;
  category_id: number;
  year: number;
  month_count: number;
  created_at: string;
}

interface EeMonth {
  id: number;
  year_id: number;
  month: number;
  month_name: string;
  combinaison_count: number;
  created_at: string;
}

interface EeTache {
  id: number;
  combinaison_id: number;
  task_number: number;
  task_type: 'message_court' | 'narration' | 'argumentation';
  prompt_text: string;
  question_text: string | null;
  argument_text_1: string | null;
  argument_text_2: string | null;
  min_words: number;
  max_words: number;
  duration_minutes: number;
  correction_text: string | null;
  created_at: string;
  updated_at: string;
}

interface EeCombinaison {
  id: number;
  month_id: number;
  name: string;
  display_order: number;
  taches: EeTache[];
  created_at: string;
  updated_at: string;
}

const FRENCH_MONTHS: Record<number, string> = {
  1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
  5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
  9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
};

const TASK_TYPE_LABELS: Record<string, string> = {
  message_court: 'Message court',
  narration: 'Narration',
  argumentation: 'Argumentation',
};

const TASK_DEFAULTS: Record<number, { type: string; min: number; max: number; dur: number }> = {
  1: { type: 'message_court', min: 60, max: 120, dur: 10 },
  2: { type: 'narration', min: 120, max: 150, dur: 20 },
  3: { type: 'argumentation', min: 120, max: 180, dur: 30 },
};

// ============================================================
// EO Constants (used by modals)
// ============================================================
const EO_TASK_TYPE_LABELS: Record<string, string> = {
  presentation: 'Présentation',
  interaction: 'Interaction orale',
  argumentation: 'Argumentation',
};

const EO_TASK_DEFAULTS: Record<number, { type: string; prep: number; dur: number }> = {
  1: { type: 'presentation', prep: 0, dur: 2 },
  2: { type: 'interaction', prep: 2, dur: 3.5 },
  3: { type: 'argumentation', prep: 0, dur: 4.5 },
};

// ============================================================
// EO Modal Components
// ============================================================
const EoYearModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  categoryId: number | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, categoryId, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) form.setFieldsValue({ year: new Date().getFullYear() }); }, [open, form]);
  const handleSubmit = async () => {
    try {
      const { year } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/eo/categories/${categoryId}/years`, { method: 'POST', body: JSON.stringify({ year }) });
      if (resp.ok) { message.success('Year created'); onSuccess(); }
      else { const d = await resp.json(); message.error(d.error || 'Failed'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title="Add Year" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Year is required' }]}>
          <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EoMonthModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  yearId: number | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, yearId, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) form.resetFields(); }, [open, form]);
  const handleSubmit = async () => {
    try {
      const { month } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/eo/years/${yearId}/months`, {
        method: 'POST', body: JSON.stringify({ month, month_name: FRENCH_MONTHS[month] }),
      });
      if (resp.ok) { message.success('Month created'); onSuccess(); }
      else { const d = await resp.json(); message.error(d.error || 'Failed'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title="Add Month" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="month" label="Month" rules={[{ required: true, message: 'Select a month' }]}>
          <Select placeholder="Select month">
            {Object.entries(FRENCH_MONTHS).map(([num, name]) => (
              <Select.Option key={num} value={parseInt(num, 10)}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EoPartieModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  monthId: number | null; editing: EoPartie | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, monthId, editing, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      if (editing) form.setFieldsValue({ name: editing.name, display_order: editing.display_order });
      else form.resetFields();
    }
  }, [open, editing, form]);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        const resp = await apiCall(`/tcf/eo/parties/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) });
        if (resp.ok) { message.success('Partie updated'); onSuccess(); }
        else { message.error('Failed'); }
      } else {
        const resp = await apiCall(`/tcf/eo/months/${monthId}/parties`, { method: 'POST', body: JSON.stringify(values) });
        if (resp.ok) { message.success('Partie created'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? 'Edit Partie' : 'Add Partie'} open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="e.g. Partie 1" />
        </Form.Item>
        <Form.Item name="display_order" label="Display Order">
          <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EoTacheModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  partieId: number; taskNumber: number;
  editing: EoTache | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, partieId, taskNumber, editing, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const defaults = EO_TASK_DEFAULTS[taskNumber];
  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          prompt_text: editing.prompt_text || '',
          prep_minutes: editing.prep_minutes,
          duration_minutes: editing.duration_minutes,
        });
      } else {
        form.setFieldsValue({
          prompt_text: '',
          prep_minutes: defaults?.prep || 0,
          duration_minutes: defaults?.dur || 2,
        });
      }
    }
  }, [open, editing, form, defaults]);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        const resp = await apiCall(`/tcf/eo/taches/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) });
        if (resp.ok) { message.success('Tâche updated'); onSuccess(); }
        else { message.error('Failed'); }
      } else {
        const payload = { ...values, task_number: taskNumber, task_type: defaults?.type || 'presentation' };
        const resp = await apiCall(`/tcf/eo/parties/${partieId}/taches`, { method: 'POST', body: JSON.stringify(payload) });
        if (resp.ok) { message.success('Tâche created'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? `Edit Tâche ${taskNumber}` : `Add Tâche ${taskNumber} — ${EO_TASK_TYPE_LABELS[defaults?.type || 'presentation']}`} open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="prompt_text" label="Prompt / Instructions">
          <Input.TextArea rows={3} placeholder="Task instructions..." style={{ borderRadius: 8 }} />
        </Form.Item>
        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item name="prep_minutes" label="Prep (min)" style={{ flex: 1 }}>
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="duration_minutes" label="Duration (min)" rules={[{ required: true }]} style={{ flex: 1 }}>
            <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

const EoPointModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  tacheId: number; editing: EoPointAborder | null; nextNumber: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, tacheId, editing, nextNumber, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      if (editing) form.setFieldsValue({ title: editing.title, subtitle: editing.subtitle || '' });
      else form.resetFields();
    }
  }, [open, editing, form]);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        const resp = await apiCall(`/tcf/eo/points/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) });
        if (resp.ok) { message.success('Point updated'); onSuccess(); }
        else { message.error('Failed'); }
      } else {
        const resp = await apiCall(`/tcf/eo/taches/${tacheId}/points`, { method: 'POST', body: JSON.stringify({ ...values, point_number: nextNumber }) });
        if (resp.ok) { message.success('Point added'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? 'Edit Point' : `Add Point ${nextNumber}`} open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
          <Input placeholder="e.g. Identité" style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item name="subtitle" label="Subtitle (optional)">
          <Input placeholder="e.g. Nom, âge, ville" style={{ borderRadius: 8 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EoSujetModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  tacheId: number; editing: EoSujet | null; nextNumber: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, tacheId, editing, nextNumber, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      if (editing) form.setFieldsValue({ prompt_text: editing.prompt_text, duration_seconds: editing.duration_seconds || '', correction_text: editing.correction_text || '' });
      else form.resetFields();
    }
  }, [open, editing, form]);
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        const resp = await apiCall(`/tcf/eo/sujets/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) });
        if (resp.ok) { message.success('Sujet updated'); onSuccess(); }
        else { message.error('Failed'); }
      } else {
        const resp = await apiCall(`/tcf/eo/taches/${tacheId}/sujets`, { method: 'POST', body: JSON.stringify({ ...values, sujet_number: nextNumber }) });
        if (resp.ok) { message.success('Sujet added'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? 'Edit Sujet' : `Add Sujet ${nextNumber}`} open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose width={560}>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="prompt_text" label="Prompt / Question" rules={[{ required: true, message: 'Prompt is required' }]}>
          <Input.TextArea rows={4} placeholder="Sujet text..." style={{ borderRadius: 8 }} />
        </Form.Item>
        <Form.Item name="duration_seconds" label="Duration (seconds)">
          <InputNumber min={0} style={{ width: '100%', borderRadius: 8 }} placeholder="e.g. 210" />
        </Form.Item>
        <Form.Item name="correction_text" label="Correction (optional)">
          <Input.TextArea rows={3} placeholder="Model answer / correction..." style={{ borderRadius: 8 }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ============================================================
// EO Bulk Import Types & Modal
// ============================================================
interface EoImportEntry {
  year: string;
  month: string;
  partie: string;
  task_number: number;
  task_type: string;
  task_title: string;
  preparation_time: string;
  task_duration: string;
  exercise_number: number;
  exercise_duration: string;
  attempts: string;
  text: string;
  correction: string;
}

interface EoImportMonthPreview {
  monthName: string;
  monthNumber: number;
  parties: number;
  sujets: number;
}

interface EoImportPreview {
  year: number;
  months: EoImportMonthPreview[];
  totalParties: number;
  totalSujets: number;
}

const EO_FRENCH_MONTH_TO_NUMBER: Record<string, number> = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4,
  mai: 5, juin: 6, juillet: 7, août: 8, aout: 8,
  septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12,
};

const EoBulkImportModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, categoryId, apiCall }) => {
  const [rawData, setRawData] = useState<EoImportEntry[] | null>(null);
  const [preview, setPreview] = useState<EoImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());
  const [expandedParties, setExpandedParties] = useState<Set<string>>(new Set());
  const [editingEoEntry, setEditingEoEntry] = useState<{ index: number; entry: EoImportEntry } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editForm] = Form.useForm();

  const recalcEoPreview = (data: EoImportEntry[]) => {
    if (data.length === 0) { setPreview(null); return; }
    const yearStr = data[0].year;
    const year = parseInt(yearStr, 10) || 0;
    const mm: Record<string, { parties: Set<string>; count: number }> = {};
    for (const entry of data) {
      const mk = (entry.month || '').trim();
      if (!mk) continue;
      if (!mm[mk]) mm[mk] = { parties: new Set(), count: 0 };
      if (entry.partie) mm[mk].parties.add(entry.partie);
      mm[mk].count++;
    }
    const months: EoImportMonthPreview[] = [];
    let totalParties = 0, totalSujets = 0;
    for (const [mk, info] of Object.entries(mm)) {
      const parts = mk.split(' ');
      const mnl = (parts[0] || '').toLowerCase();
      const monthNumber = EO_FRENCH_MONTH_TO_NUMBER[mnl] || 0;
      months.push({ monthName: parts[0] || mk, monthNumber, parties: info.parties.size, sujets: info.count });
      totalParties += info.parties.size; totalSujets += info.count;
    }
    months.sort((a, b) => a.monthNumber - b.monthNumber);
    setPreview({ year, months, totalParties, totalSujets });
  };

  const handleRemoveEoEntry = (entryToRemove: EoImportEntry) => {
    if (!rawData) return;
    Modal.confirm({
      title: 'Remove Entry',
      content: `Remove this ${entryToRemove.task_type} entry (T${entryToRemove.task_number}) from ${entryToRemove.partie}?`,
      okText: 'Remove', okType: 'danger',
      onOk: () => {
        const idx = rawData.indexOf(entryToRemove);
        if (idx === -1) return;
        const updated = [...rawData]; updated.splice(idx, 1);
        setRawData(updated); recalcEoPreview(updated);
      },
    });
  };

  const handleEditEoEntry = (entry: EoImportEntry) => {
    if (!rawData) return;
    const idx = rawData.indexOf(entry);
    if (idx === -1) return;
    setEditingEoEntry({ index: idx, entry: { ...entry } });
    editForm.setFieldsValue({ text: entry.text, correction: entry.correction || '', task_duration: entry.task_duration, preparation_time: entry.preparation_time });
  };

  const handleSaveEoEdit = () => {
    if (!editingEoEntry || !rawData) return;
    const values = editForm.getFieldsValue();
    const updated = [...rawData];
    updated[editingEoEntry.index] = { ...updated[editingEoEntry.index], text: values.text, correction: values.correction || '', task_duration: values.task_duration, preparation_time: values.preparation_time };
    setRawData(updated); recalcEoPreview(updated); setEditingEoEntry(null);
  };

  useEffect(() => {
    if (!open) {
      setRawData(null); setPreview(null); setImporting(false);
      setImportProgress(0); setError(null); setFileName('');
      setExpandedMonths(new Set()); setExpandedParties(new Set()); setEditingEoEntry(null);
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); setRawData(null); setPreview(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed) || parsed.length === 0) { setError('JSON file is empty or not an array'); return; }
        setRawData(parsed);
        const yearStr = parsed[0].year;
        const year = parseInt(yearStr, 10);
        if (!year) { setError('Could not extract year'); return; }

        const monthMap: Record<string, { parties: Set<string>; count: number }> = {};
        for (const entry of parsed) {
          const mk = (entry.month || '').trim();
          if (!mk) continue;
          if (!monthMap[mk]) monthMap[mk] = { parties: new Set(), count: 0 };
          if (entry.partie) monthMap[mk].parties.add(entry.partie);
          monthMap[mk].count++;
        }

        const months: EoImportMonthPreview[] = [];
        let totalParties = 0, totalSujets = 0;
        for (const [mk, info] of Object.entries(monthMap)) {
          const parts = mk.split(' ');
          const mnl = (parts[0] || '').toLowerCase();
          const monthNumber = EO_FRENCH_MONTH_TO_NUMBER[mnl] || 0;
          months.push({ monthName: parts[0] || mk, monthNumber, parties: info.parties.size, sujets: info.count });
          totalParties += info.parties.size;
          totalSujets += info.count;
        }
        months.sort((a, b) => a.monthNumber - b.monthNumber);
        setPreview({ year, months, totalParties, totalSujets });
      } catch (err) { setError(`Failed to parse JSON: ${(err as Error).message}`); }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!rawData || !preview) return;
    setImporting(true); setImportProgress(0); setError(null);
    try {
      const monthGroups: Record<string, typeof rawData> = {};
      for (const entry of rawData) {
        const key = (entry.month || '').trim();
        if (!key) continue;
        if (!monthGroups[key]) monthGroups[key] = [];
        monthGroups[key].push(entry);
      }
      const monthKeys = Object.keys(monthGroups);
      const totalMonths = monthKeys.length;
      let processedMonths = 0;
      let totalPartiesCreated = 0, totalSujetsCreated = 0;

      for (const monthKey of monthKeys) {
        const monthData = monthGroups[monthKey];
        const resp = await apiCall('/tcf/eo/years/bulk-import', {
          method: 'POST',
          body: JSON.stringify({ category_id: categoryId, year: preview.year, data: monthData }),
        });
        if (resp.ok) {
          const result = await resp.json();
          totalPartiesCreated += result.parties_created || 0;
          totalSujetsCreated += result.sujets_created || 0;
        } else {
          const errData = await resp.json().catch(() => ({ error: 'Unknown error' }));
          console.error(`Month ${monthKey} failed:`, errData);
        }
        processedMonths++;
        setImportProgress(Math.round((processedMonths / totalMonths) * 100));
      }
      message.success(`Imported ${totalPartiesCreated} parties, ${totalSujetsCreated} sujets across ${totalMonths} months`);
      onSuccess();
      setTimeout(() => onClose(), 500);
    } catch (err) { setError(`Import failed: ${(err as Error).message}`); } finally { setImporting(false); }
  };

  return (
    <Modal open={open} onCancel={onClose} width={700} footer={null} destroyOnClose
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
            <FolderOpenOutlined />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Import Year from File</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400 }}>Expression Orale — bulk import</div>
          </div>
        </div>
      }
    >
      <div style={{ marginBottom: 20 }}>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} style={{ display: 'none' }} />
        <Button icon={<FolderOpenOutlined />} onClick={() => fileInputRef.current?.click()} size="large"
          style={{ borderRadius: 10, height: 48, fontWeight: 600, width: '100%', border: '2px dashed #c7d2fe', color: '#4338ca', background: '#f8f9ff' }}>
          {fileName ? `📄 ${fileName} — Change File...` : '📄 Select JSON File'}
        </Button>
      </div>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>
      )}
      {preview && (
        <div>
          <div style={{ background: '#f8f9ff', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid #e0e7ff' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#4338ca', marginBottom: 10 }}>🎤 Year {preview.year}</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}><strong style={{ color: '#4338ca' }}>{preview.months.length}</strong> month{preview.months.length !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: 13, color: '#64748b' }}><strong style={{ color: '#22c55e' }}>{preview.totalParties}</strong> partie{preview.totalParties !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: 13, color: '#64748b' }}><strong style={{ color: '#f59e0b' }}>{preview.totalSujets}</strong> entries</span>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Months breakdown <span style={{ fontWeight: 400, color: '#94a3b8' }}>(click to expand)</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 350, overflowY: 'auto' }}>
              {preview.months.map(m => {
                const isExpanded = expandedMonths.has(m.monthNumber);
                const monthEntries = rawData?.filter(e => {
                  const parts = (e.month || '').split(' ');
                  const mn = (parts[0] || '').toLowerCase();
                  return EO_FRENCH_MONTH_TO_NUMBER[mn] === m.monthNumber;
                }) || [];
                const partieMap: Record<string, typeof monthEntries> = {};
                for (const e of monthEntries) {
                  const k = e.partie || '';
                  if (!partieMap[k]) partieMap[k] = [];
                  partieMap[k].push(e);
                }
                const partieNames = Object.keys(partieMap).sort((a, b) => {
                  const na = parseInt(a.replace(/\D/g, ''), 10) || 0;
                  const nb = parseInt(b.replace(/\D/g, ''), 10) || 0;
                  return na - nb;
                });
                return (
                  <div key={m.monthNumber}>
                    <div onClick={() => setExpandedMonths(prev => { const next = new Set(prev); if (next.has(m.monthNumber)) next.delete(m.monthNumber); else next.add(m.monthNumber); return next; })}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 24, height: 24, borderRadius: 6, background: '#eef2ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{m.monthNumber}</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{m.monthName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600, fontSize: 11, margin: 0 }}>{m.parties} parties</Tag>
                        <Tag color="green" style={{ borderRadius: 6, fontWeight: 600, fontSize: 11, margin: 0 }}>{m.sujets} entries</Tag>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ marginLeft: 16, marginTop: 4, marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {partieNames.map(pn => {
                          const entries = partieMap[pn];
                          const partieKey = `${m.monthNumber}-${pn}`;
                          const isPartieExpanded = expandedParties.has(partieKey);
                          const t1 = entries.filter(e => e.task_number === 1);
                          const t2 = entries.filter(e => e.task_number === 2);
                          const t3 = entries.filter(e => e.task_number === 3);
                          return (
                            <div key={pn} style={{ borderRadius: 8, background: '#fafbff', border: '1px solid #f0f0f8', fontSize: 12, overflow: 'hidden' }}>
                              <div
                                onClick={() => setExpandedParties(prev => { const next = new Set(prev); if (next.has(partieKey)) next.delete(partieKey); else next.add(partieKey); return next; })}
                                style={{ padding: '6px 10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <div>
                                  <span style={{ fontWeight: 700, color: '#4338ca', fontSize: 12 }}>{pn}</span>
                                  <span style={{ marginLeft: 8, fontSize: 10, color: '#94a3b8' }}>🎤 T1: {t1.length} · 💬 T2: {t2.length} · 🗣️ T3: {t3.length}</span>
                                </div>
                                <span style={{ fontSize: 10, color: '#94a3b8' }}>{isPartieExpanded ? '▲' : '▼'}</span>
                              </div>
                              {isPartieExpanded && (
                                <div style={{ padding: '4px 10px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  {[...t1, ...t2, ...t3].sort((a, b) => a.task_number - b.task_number || a.exercise_number - b.exercise_number).map((entry, ei) => (
                                    <div key={ei} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 6px', borderRadius: 6, background: '#fff', border: '1px solid #f0f0f8' }}>
                                      <Tag style={{ borderRadius: 4, fontSize: 9, fontWeight: 700, margin: 0, padding: '0 5px', background: entry.task_number === 1 ? '#dbeafe' : entry.task_number === 2 ? '#e0e7ff' : '#ede9fe', color: entry.task_number === 1 ? '#2563eb' : entry.task_number === 2 ? '#4338ca' : '#7c3aed', border: 'none', flexShrink: 0 }}>T{entry.task_number}</Tag>
                                      {entry.task_number > 1 && <span style={{ fontSize: 9, color: '#94a3b8', flexShrink: 0 }}>S{entry.exercise_number}</span>}
                                      <span style={{ fontSize: 10, color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.text?.substring(0, 55)}{(entry.text?.length || 0) > 55 ? '...' : ''}</span>
                                      <Button type="text" size="small" icon={<EditOutlined />} onClick={(ev) => { ev.stopPropagation(); handleEditEoEntry(entry); }} style={{ borderRadius: 4, color: '#6366f1', width: 18, height: 18, fontSize: 9, flexShrink: 0, minWidth: 18, padding: 0 }} />
                                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={(ev) => { ev.stopPropagation(); handleRemoveEoEntry(entry); }} style={{ borderRadius: 4, width: 18, height: 18, fontSize: 9, flexShrink: 0, minWidth: 18, padding: 0 }} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {importing && (
            <div style={{ marginBottom: 16 }}>
              <Progress percent={importProgress} status={importProgress < 100 ? 'active' : 'success'} strokeColor={{ from: '#6366f1', to: '#4338ca' }} />
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4 }}>
                {importProgress < 100 ? `Processing month ${Math.ceil((importProgress / 100) * (preview?.months.length || 1))} of ${preview?.months.length || '?'}...` : 'Done!'}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Button onClick={onClose} disabled={importing} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" onClick={handleImport} loading={importing} disabled={importing}
              style={{ borderRadius: 10, fontWeight: 600, height: 40, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
              {importing ? 'Importing...' : `Import ${preview.totalSujets} Entries`}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      <Modal
        open={!!editingEoEntry}
        onCancel={() => setEditingEoEntry(null)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700, color: '#1e293b' }}>
              Edit — T{editingEoEntry?.entry.task_number} {editingEoEntry?.entry.task_type} · {editingEoEntry?.entry.partie}
            </span>
          </div>
        }
        width={560} destroyOnClose
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setEditingEoEntry(null)} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button type="primary" onClick={handleSaveEoEdit} style={{ borderRadius: 8, background: '#4338ca', borderColor: '#4338ca' }}>Save</Button>
          </div>
        }
      >
        {editingEoEntry && (
          <Form form={editForm} layout="vertical" style={{ marginTop: 12 }}>
            <Form.Item name="text" label={<Text strong style={{ fontSize: 12 }}>Text / Prompt</Text>} rules={[{ required: true, message: 'Text is required' }]}>
              <Input.TextArea rows={4} placeholder="Entry text..." style={{ borderRadius: 8 }} />
            </Form.Item>
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item name="preparation_time" label={<Text strong style={{ fontSize: 12 }}>Prep Time</Text>} style={{ flex: 1 }}>
                <Input placeholder="e.g. 2 min" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="task_duration" label={<Text strong style={{ fontSize: 12 }}>Duration</Text>} style={{ flex: 1 }}>
                <Input placeholder="e.g. 3 min 30 s" style={{ borderRadius: 8 }} />
              </Form.Item>
            </div>
            <Form.Item name="correction" label={<Text strong style={{ fontSize: 12 }}>Correction (optional)</Text>}>
              <Input.TextArea rows={3} placeholder="Correction text..." style={{ borderRadius: 8 }} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Modal>
  );
};

const EeYearModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  categoryId: number | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, categoryId, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) form.setFieldsValue({ year: new Date().getFullYear() }); }, [open, form]);
  const handleSubmit = async () => {
    try {
      const { year } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/ee/categories/${categoryId}/years`, { method: 'POST', body: JSON.stringify({ year }) });
      if (resp.ok) { message.success('Year created'); onSuccess(); }
      else { const d = await resp.json(); message.error(d.error || 'Failed'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title="Add Year" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Year is required' }]}>
          <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EeMonthModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  yearId: number | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, yearId, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) form.resetFields(); }, [open, form]);
  const handleSubmit = async () => {
    try {
      const { month } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/ee/years/${yearId}/months`, {
        method: 'POST', body: JSON.stringify({ month, month_name: FRENCH_MONTHS[month] }),
      });
      if (resp.ok) { message.success('Month created'); onSuccess(); }
      else { const d = await resp.json(); message.error(d.error || 'Failed'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title="Add Month" open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="month" label="Month" rules={[{ required: true, message: 'Select a month' }]}>
          <Select placeholder="Select month">
            {Object.entries(FRENCH_MONTHS).map(([num, name]) => (
              <Select.Option key={num} value={parseInt(num, 10)}>{name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EeCombinaisonModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  monthId: number | null; editing: EeCombinaison | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, monthId, editing, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) { form.setFieldsValue({ name: editing?.name || '' }); }
  }, [open, editing, form]);
  const handleSubmit = async () => {
    try {
      const { name } = await form.validateFields();
      setSaving(true);
      if (editing) {
        const resp = await apiCall(`/tcf/ee/combinaisons/${editing.id}`, { method: 'PUT', body: JSON.stringify({ name }) });
        if (resp.ok) { message.success('Updated'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      } else {
        const resp = await apiCall(`/tcf/ee/months/${monthId}/combinaisons`, { method: 'POST', body: JSON.stringify({ name }) });
        if (resp.ok) { message.success('Created'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal title={editing ? 'Edit Combinaison' : 'Add Combinaison'} open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} destroyOnClose>
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input placeholder="e.g. Combinaison 1" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EeTacheModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  editing: EeTache | null; taskNumber: number; combinaisonId: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, editing, taskNumber, combinaisonId, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const taskNum = editing ? editing.task_number : taskNumber;
  const defaults = TASK_DEFAULTS[taskNum];

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        prompt_text: editing?.prompt_text || '',
        question_text: editing?.question_text || '',
        argument_text_1: editing?.argument_text_1 || '',
        argument_text_2: editing?.argument_text_2 || '',
        correction_text: editing?.correction_text || '',
      });
    }
  }, [open, editing, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        const payload: Record<string, unknown> = {
          prompt_text: values.prompt_text,
          correction_text: values.correction_text?.trim() || null,
        };
        if (taskNum === 3) {
          payload.question_text = values.question_text?.trim() || null;
          payload.argument_text_1 = values.argument_text_1?.trim() || null;
          payload.argument_text_2 = values.argument_text_2?.trim() || null;
        }
        const resp = await apiCall(`/tcf/ee/taches/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (resp.ok) { message.success('Tâche updated'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      } else {
        const payload: Record<string, unknown> = {
          task_number: taskNum, task_type: defaults.type,
          prompt_text: values.prompt_text,
          min_words: defaults.min, max_words: defaults.max, duration_minutes: defaults.dur,
          correction_text: values.correction_text?.trim() || null,
        };
        if (taskNum === 3) {
          payload.question_text = values.question_text?.trim() || null;
          payload.argument_text_1 = values.argument_text_1?.trim() || null;
          payload.argument_text_2 = values.argument_text_2?.trim() || null;
        }
        const resp = await apiCall(`/tcf/ee/combinaisons/${combinaisonId}/taches`, { method: 'POST', body: JSON.stringify(payload) });
        if (resp.ok) { message.success('Tâche created'); onSuccess(); }
        else { const d = await resp.json(); message.error(d.error || 'Failed'); }
      }
    } catch { /* validation */ } finally { setSaving(false); }
  };

  return (
    <Modal
      title={editing ? `Edit Tâche ${editing.task_number}` : `Add Tâche ${taskNumber}`}
      open={open} onCancel={onClose} onOk={handleSubmit} confirmLoading={saving} width={640} destroyOnClose
    >
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Tag color="blue" style={{ borderRadius: 8, padding: '4px 12px', fontWeight: 700 }}>{TASK_TYPE_LABELS[defaults.type]}</Tag>
          <Tag style={{ borderRadius: 8, padding: '4px 12px', background: '#f0fdf4', color: '#15803d', border: 'none', fontWeight: 600 }}>{defaults.min}-{defaults.max} mots</Tag>
          <Tag style={{ borderRadius: 8, padding: '4px 12px', background: '#fffbeb', color: '#b45309', border: 'none', fontWeight: 600 }}>{defaults.dur} min</Tag>
        </div>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="prompt_text" label={<Text strong style={{ fontSize: 12 }}>Prompt Text *</Text>} rules={[{ required: true, message: 'Prompt text is required' }]}>
            <TextArea rows={4} placeholder="Enter the task prompt..." style={{ borderRadius: 8 }} />
          </Form.Item>
          {taskNum === 3 && (
            <>
              <Form.Item name="question_text" label={<Text strong style={{ fontSize: 12 }}>Question (e.g. "Pour ou Contre ?")</Text>}>
                <Input placeholder="e.g. L'uniforme scolaire : Pour Ou Contre ?" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="argument_text_1" label={<Text strong style={{ fontSize: 12 }}>Argument Text 1</Text>}>
                <TextArea rows={3} placeholder="First argument/position..." style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="argument_text_2" label={<Text strong style={{ fontSize: 12 }}>Argument Text 2 (Counter-argument)</Text>}>
                <TextArea rows={3} placeholder="Counter-argument/opposing position..." style={{ borderRadius: 8 }} />
              </Form.Item>
            </>
          )}
          <Form.Item name="correction_text" label={<Text strong style={{ fontSize: 12 }}>Correction (optional)</Text>}>
            <TextArea rows={4} placeholder="Model answer / correction..." style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

// ============================================================
// Main Component
// ============================================================
const ExamPreparation: React.FC = () => {
  const { apiCall, token } = useAuth();

  // Navigation state
  const [view, setView] = useState<'categories' | 'series-list' | 'series-detail' | 'ee-years' | 'ee-months' | 'ee-combinaisons' | 'eo-years' | 'eo-months' | 'eo-parties' | 'eo-partie-detail'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [categoryType, setCategoryType] = useState<CategoryType>('ce');
  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [seriesDetail, setSeriesDetail] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Search
  const [searchText, setSearchText] = useState('');

  // Modals
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [ceImportModalOpen, setCeImportModalOpen] = useState(false);
  const [examAssignModalOpen, setExamAssignModalOpen] = useState(false);
  const [grantCreditsModalOpen, setGrantCreditsModalOpen] = useState(false);
  const [assignType, setAssignType] = useState<'series' | 'category'>('series');
  const [assignId, setAssignId] = useState<number>(0);
  const [assignName, setAssignName] = useState<string>('');
  const [coAnalyticsOpen, setCoAnalyticsOpen] = useState(false);

  // EE state
  const [eeYears, setEeYears] = useState<EeYear[]>([]);
  const [eeMonths, setEeMonths] = useState<EeMonth[]>([]);
  const [eeCombinaisons, setEeCombinaisons] = useState<EeCombinaison[]>([]);
  const [selectedEeYearId, setSelectedEeYearId] = useState<number | null>(null);
  const [selectedEeYear, setSelectedEeYear] = useState<number | null>(null);
  const [selectedEeMonthId, setSelectedEeMonthId] = useState<number | null>(null);
  const [selectedEeMonthName, setSelectedEeMonthName] = useState<string>('');
  const [eeYearModalOpen, setEeYearModalOpen] = useState(false);
  const [eeMonthModalOpen, setEeMonthModalOpen] = useState(false);
  const [eeCombinaisonModalOpen, setEeCombinaisonModalOpen] = useState(false);
  const [editingCombinaison, setEditingCombinaison] = useState<EeCombinaison | null>(null);
  const [eeTacheModalOpen, setEeTacheModalOpen] = useState(false);
  const [eeImportModalOpen, setEeImportModalOpen] = useState(false);
  const [editingTache, setEditingTache] = useState<EeTache | null>(null);
  const [editingTacheTaskNumber, setEditingTacheTaskNumber] = useState<number>(1);
  const [editingTacheCombinaisonId, setEditingTacheCombinaisonId] = useState<number>(0);
  const [correctionVisible, setCorrectionVisible] = useState<Record<number, boolean>>({});
  const [viewingCombinaison, setViewingCombinaison] = useState<EeCombinaison | null>(null);

  // EO state
  const [eoYears, setEoYears] = useState<EoYear[]>([]);
  const [eoMonths, setEoMonths] = useState<EoMonth[]>([]);
  const [eoParties, setEoParties] = useState<EoPartie[]>([]);
  const [selectedEoYearId, setSelectedEoYearId] = useState<number | null>(null);
  const [selectedEoYear, setSelectedEoYear] = useState<number | null>(null);
  const [selectedEoMonthId, setSelectedEoMonthId] = useState<number | null>(null);
  const [selectedEoMonthName, setSelectedEoMonthName] = useState<string>('');
  const [eoYearModalOpen, setEoYearModalOpen] = useState(false);
  const [eoMonthModalOpen, setEoMonthModalOpen] = useState(false);
  const [eoPartieModalOpen, setEoPartieModalOpen] = useState(false);
  const [editingPartie, setEditingPartie] = useState<EoPartie | null>(null);
  const [viewingPartie, setViewingPartie] = useState<EoPartie | null>(null);
  const [eoTacheModalOpen, setEoTacheModalOpen] = useState(false);
  const [editingEoTache, setEditingEoTache] = useState<EoTache | null>(null);
  const [editingEoTacheNumber, setEditingEoTacheNumber] = useState<number>(1);
  const [editingEoTachePartieId, setEditingEoTachePartieId] = useState<number>(0);
  const [eoPointModalOpen, setEoPointModalOpen] = useState(false);
  const [editingEoPoint, setEditingEoPoint] = useState<EoPointAborder | null>(null);
  const [editingEoPointTacheId, setEditingEoPointTacheId] = useState<number>(0);
  const [editingEoPointNextNum, setEditingEoPointNextNum] = useState<number>(1);
  const [eoSujetModalOpen, setEoSujetModalOpen] = useState(false);
  const [editingEoSujet, setEditingEoSujet] = useState<EoSujet | null>(null);
  const [editingEoSujetTacheId, setEditingEoSujetTacheId] = useState<number>(0);
  const [editingEoSujetNextNum, setEditingEoSujetNextNum] = useState<number>(1);
  const [eoCorrectionVisible, setEoCorrectionVisible] = useState<Record<number, boolean>>({});
  const [eoImportModalOpen, setEoImportModalOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await apiCall('/tcf/categories');
      if (resp.ok) {
        setCategories(await resp.json());
      } else {
        message.error('Failed to load categories');
      }
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  // ── Fetch series list ──
  const fetchSeriesList = useCallback(async () => {
    if (!selectedCategoryId) return;
    setLoading(true);
    try {
      const prefix = getApiPrefix(categoryType);
      const resp = await apiCall(`${prefix}/categories/${selectedCategoryId}/series`);
      if (resp.ok) {
        setSeriesList(await resp.json());
      } else {
        message.error('Failed to load series');
      }
    } catch {
      message.error('Failed to load series');
    } finally {
      setLoading(false);
    }
  }, [apiCall, selectedCategoryId, categoryType]);

  // ── Fetch series detail ──
  const fetchSeriesDetail = useCallback(async () => {
    if (!selectedSeriesId) return;
    setLoading(true);
    try {
      const prefix = getApiPrefix(categoryType);
      const resp = await apiCall(`${prefix}/series/${selectedSeriesId}`);
      if (resp.ok) {
        const data = await resp.json();
        // Parse cefr_thresholds if string
        if (typeof data.cefr_thresholds === 'string') {
          data.cefr_thresholds = JSON.parse(data.cefr_thresholds);
        }
        setSeriesDetail(data);
      } else {
        message.error('Failed to load series detail');
      }
    } catch {
      message.error('Failed to load series detail');
    } finally {
      setLoading(false);
    }
  }, [apiCall, selectedSeriesId, categoryType]);

  // ── Fetch EE years ──
  const fetchEeYears = useCallback(async () => {
    if (!selectedCategoryId) return;
    setLoading(true);
    try {
      const resp = await apiCall(`/tcf/ee/categories/${selectedCategoryId}/years`);
      if (resp.ok) {
        setEeYears(await resp.json());
      } else {
        message.error('Failed to load years');
      }
    } catch {
      message.error('Failed to load years');
    } finally {
      setLoading(false);
    }
  }, [apiCall, selectedCategoryId]);

  // ── Fetch EE months ──
  const fetchEeMonths = useCallback(async () => {
    if (!selectedEeYearId) return;
    setLoading(true);
    try {
      const resp = await apiCall(`/tcf/ee/years/${selectedEeYearId}/months`);
      if (resp.ok) {
        setEeMonths(await resp.json());
      } else {
        message.error('Failed to load months');
      }
    } catch {
      message.error('Failed to load months');
    } finally {
      setLoading(false);
    }
  }, [apiCall, selectedEeYearId]);

  // ── Fetch EE combinaisons ──
  const fetchEeCombinaisons = useCallback(async () => {
    if (!selectedEeMonthId) return;
    setLoading(true);
    try {
      const resp = await apiCall(`/tcf/ee/months/${selectedEeMonthId}/combinaisons`);
      if (resp.ok) {
        setEeCombinaisons(await resp.json());
      } else {
        message.error('Failed to load combinaisons');
      }
    } catch {
      message.error('Failed to load combinaisons');
    } finally {
      setLoading(false);
    }
  }, [apiCall, selectedEeMonthId]);

  // Load data based on view
  useEffect(() => {
    if (view === 'categories') fetchCategories();
  }, [view, fetchCategories]);

  useEffect(() => {
    if (view === 'series-list' && selectedCategoryId) fetchSeriesList();
  }, [view, selectedCategoryId, fetchSeriesList]);

  useEffect(() => {
    if (view === 'series-detail' && selectedSeriesId) fetchSeriesDetail();
  }, [view, selectedSeriesId, fetchSeriesDetail]);

  useEffect(() => {
    if (view === 'ee-years' && selectedCategoryId) fetchEeYears();
  }, [view, selectedCategoryId, fetchEeYears]);

  useEffect(() => {
    if (view === 'ee-months' && selectedEeYearId) fetchEeMonths();
  }, [view, selectedEeYearId, fetchEeMonths]);

  useEffect(() => {
    if (view === 'ee-combinaisons' && selectedEeMonthId) fetchEeCombinaisons();
  }, [view, selectedEeMonthId, fetchEeCombinaisons]);

  // ── Fetch EO years ──
  const fetchEoYears = useCallback(async () => {
    if (!selectedCategoryId) return;
    setLoading(true);
    try {
      const resp = await apiCall(`/tcf/eo/categories/${selectedCategoryId}/years`);
      if (resp.ok) setEoYears(await resp.json());
      else message.error('Failed to load years');
    } catch { message.error('Failed to load years'); } finally { setLoading(false); }
  }, [apiCall, selectedCategoryId]);

  // ── Fetch EO months ──
  const fetchEoMonths = useCallback(async () => {
    if (!selectedEoYearId) return;
    setLoading(true);
    try {
      const resp = await apiCall(`/tcf/eo/years/${selectedEoYearId}/months`);
      if (resp.ok) setEoMonths(await resp.json());
      else message.error('Failed to load months');
    } catch { message.error('Failed to load months'); } finally { setLoading(false); }
  }, [apiCall, selectedEoYearId]);

  // ── Fetch EO parties ──
  const fetchEoParties = useCallback(async () => {
    if (!selectedEoMonthId) return;
    setLoading(true);
    try {
      const resp = await apiCall(`/tcf/eo/months/${selectedEoMonthId}/parties`);
      if (resp.ok) setEoParties(await resp.json());
      else message.error('Failed to load parties');
    } catch { message.error('Failed to load parties'); } finally { setLoading(false); }
  }, [apiCall, selectedEoMonthId]);

  useEffect(() => {
    if (view === 'eo-years' && selectedCategoryId) fetchEoYears();
  }, [view, selectedCategoryId, fetchEoYears]);

  useEffect(() => {
    if (view === 'eo-months' && selectedEoYearId) fetchEoMonths();
  }, [view, selectedEoYearId, fetchEoMonths]);

  useEffect(() => {
    if ((view === 'eo-parties' || view === 'eo-partie-detail') && selectedEoMonthId) fetchEoParties();
  }, [view, selectedEoMonthId, fetchEoParties]);

  // ── Navigation helpers ──
  const navigateToSeriesList = (category: Category) => {
    if (!IMPLEMENTED_CATEGORIES.includes(category.name)) {
      message.info(`${category.name} — Coming soon!`);
      return;
    }
    const catType = getCategoryType(category.name);
    setSelectedCategoryId(category.id);
    setSelectedCategoryName(category.name);
    setCategoryType(catType);
    setSearchText('');
    if (catType === 'ee') {
      setView('ee-years');
    } else if (catType === 'eo') {
      setView('eo-years');
    } else {
      setView('series-list');
    }
  };

  const navigateToSeriesDetail = (series: Series) => {
    setSelectedSeriesId(series.id);
    setView('series-detail');
  };

  const navigateBack = () => {
    if (view === 'series-detail') {
      setSelectedSeriesId(null);
      setSeriesDetail(null);
      setView('series-list');
    } else if (view === 'series-list') {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
      setCategoryType('ce');
      setSeriesList([]);
      setView('categories');
    } else if (view === 'ee-combinaisons') {
      setSelectedEeMonthId(null);
      setSelectedEeMonthName('');
      setEeCombinaisons([]);
      setCorrectionVisible({});
      setView('ee-months');
    } else if (view === 'ee-months') {
      setSelectedEeYearId(null);
      setSelectedEeYear(null);
      setEeMonths([]);
      setView('ee-years');
    } else if (view === 'ee-years') {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
      setCategoryType('ce');
      setEeYears([]);
      setView('categories');
    } else if (view === 'eo-partie-detail') {
      setViewingPartie(null);
      setEoCorrectionVisible({});
      setView('eo-parties');
    } else if (view === 'eo-parties') {
      setSelectedEoMonthId(null);
      setSelectedEoMonthName('');
      setEoParties([]);
      setView('eo-months');
    } else if (view === 'eo-months') {
      setSelectedEoYearId(null);
      setSelectedEoYear(null);
      setEoMonths([]);
      setView('eo-years');
    } else if (view === 'eo-years') {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
      setCategoryType('ce');
      setEoYears([]);
      setView('categories');
    }
  };

  // ── Category actions ──
  const handleDeleteCategory = async (id: number) => {
    try {
      const resp = await apiCall(`/tcf/categories/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        message.success('Category deleted');
        fetchCategories();
      } else {
        message.error('Failed to delete category');
      }
    } catch {
      message.error('Failed to delete category');
    }
  };

  // ── Series actions ──
  const handleDeleteSeries = async (id: number) => {
    try {
      const prefix = getApiPrefix(categoryType);
      const resp = await apiCall(`${prefix}/series/${id}`, { method: 'DELETE' });
      if (resp.ok) {
        message.success('Series deleted');
        fetchSeriesList();
      } else {
        message.error('Failed to delete series');
      }
    } catch {
      message.error('Failed to delete series');
    }
  };

  // ── Question actions ──
  const handleDeleteQuestion = (questionId: number) => {
    Modal.confirm({
      title: 'Delete Question',
      content: 'Are you sure you want to delete this question? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const prefix = getApiPrefix(categoryType);
          const resp = await apiCall(`${prefix}/questions/${questionId}`, { method: 'DELETE' });
          if (resp.ok) {
            message.success('Question deleted');
            fetchSeriesDetail();
          } else {
            message.error('Failed to delete question');
          }
        } catch {
          message.error('Failed to delete question');
        }
      },
    });
  };

  const handleMoveQuestion = async (questionId: number, direction: 'up' | 'down') => {
    if (!seriesDetail) return;
    const questions = [...seriesDetail.questions];
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= questions.length) return;

    // Swap order values
    const newOrder = questions.map((q, i) => {
      if (i === idx) return { id: q.id, question_order: questions[swapIdx].question_order };
      if (i === swapIdx) return { id: q.id, question_order: questions[idx].question_order };
      return { id: q.id, question_order: q.question_order };
    });

    try {
      const prefix = getApiPrefix(categoryType);
      const resp = await apiCall(`${prefix}/series/${seriesDetail.id}/questions/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ questions: newOrder }),
      });
      if (resp.ok) {
        fetchSeriesDetail();
      } else {
        message.error('Failed to reorder');
      }
    } catch {
      message.error('Failed to reorder');
    }
  };

  // ── Assignment helpers ──
  const openAssignModal = (type: 'series' | 'category', id: number, name: string) => {
    setAssignType(type);
    setAssignId(id);
    setAssignName(name);
    setAssignModalOpen(true);
  };

  // ── Filtered series ──
  const filteredSeries = useMemo(() => {
    let list = seriesList;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    // Sort by extracting number from name (e.g., "Série 4" → 4)
    return [...list].sort((a, b) => {
      const numA = parseInt((a.name.match(/\d+/) || ['0'])[0], 10);
      const numB = parseInt((b.name.match(/\d+/) || ['0'])[0], 10);
      return numA - numB;
    });
  }, [seriesList, searchText]);


  // ════════════════════════════════════════════════════════════
  // RENDER: Categories View
  // ════════════════════════════════════════════════════════════
  const renderCategoriesView = () => {
    if (loading && categories.length === 0) {
      return (
        <div>
          <Skeleton.Button active style={{ height: 140, borderRadius: 16, width: '100%', marginBottom: 24 }} block />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton.Button key={i} active style={{ height: 200, borderRadius: 16, width: '100%' }} block />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Gradient Hero Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)',
            borderRadius: 16,
            padding: '32px 36px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 120, height: 120,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', bottom: -20, right: 80, width: 80, height: 80,
            borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.3, marginBottom: 6 }}>
                🇨🇦 TCF Canada Exam Preparation
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                Manage exam categories, series, and questions for your students
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setExamAssignModalOpen(true)}
                style={{
                  borderRadius: 10, height: 42, fontWeight: 600, fontSize: 14,
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                }}
              >
                Assign
              </Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => setGrantCreditsModalOpen(true)}
                style={{
                  borderRadius: 10, height: 42, fontWeight: 600, fontSize: 14,
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
                }}
              >
                Grant Credits
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
                style={{
                  borderRadius: 10, height: 42, fontWeight: 600, fontSize: 14,
                  background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                Create Category
              </Button>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>
              No categories yet
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
              Create your first exam category to start building TCF Canada preparation content
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
              style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}
            >
              Create First Category
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {categories.map(cat => {
              const iconNode = ICON_MAP[cat.icon || ''] || <BookOutlined />;
              const isImplemented = IMPLEMENTED_CATEGORIES.includes(cat.name);
              return (
                <Card
                  key={cat.id}
                  hoverable
                  onClick={() => navigateToSeriesList(cat)}
                  style={{
                    borderRadius: 16,
                    border: '1px solid #e8e8f4',
                    boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  bodyStyle={{ padding: 24 }}
                  className="exam-category-card"
                >
                  <style>{`
                    .exam-category-card:hover {
                      transform: translateY(-4px) scale(1.01) !important;
                      box-shadow: 0 8px 30px rgba(99,102,241,0.15) !important;
                      border-color: #c7d2fe !important;
                    }
                  `}</style>
                  {/* Actions dropdown */}
                  <div
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            icon: <EditOutlined />,
                            label: 'Edit',
                            onClick: () => { setEditingCategory(cat); setCategoryModalOpen(true); },
                          },
                          { type: 'divider' },
                          ...(cat.name === 'Compréhension Orale' ? [{
                            key: 'analytics',
                            icon: React.createElement(BarChartOutlined || SearchOutlined),
                            label: 'Analytics',
                            onClick: () => setCoAnalyticsOpen(true),
                          }, { type: 'divider' as const }] : []),
                          {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: 'Delete',
                            danger: true,
                            onClick: () => {
                              Modal.confirm({
                                title: 'Delete Category',
                                content: `Delete "${cat.name}" and all its series, questions, and assignments?`,
                                okText: 'Delete',
                                okType: 'danger',
                                onOk: () => handleDeleteCategory(cat.id),
                              });
                            },
                          },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        style={{ borderRadius: 8, background: 'rgba(0,0,0,0.04)' }}
                      />
                    </Dropdown>
                  </div>

                  {/* Icon with gradient background */}
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: 'linear-gradient(135deg, #6366f1, #4338ca)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, color: '#fff', marginBottom: 16,
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                    }}
                  >
                    {iconNode}
                  </div>

                  {/* Name */}
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    {cat.name}
                  </div>

                  {/* Description */}
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, minHeight: 20 }}>
                    {cat.description || 'No description'}
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        background: '#eef2ff', color: '#4338ca', border: 'none',
                        fontWeight: 700, fontSize: 12, borderRadius: 20,
                        padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 800 }}>{cat.series_count}</span>
                      <span>
                        {['Expression Écrite', 'Expression Orale'].includes(cat.name) 
                          ? (cat.series_count === 1 ? 'year' : 'years') 
                          : (cat.series_count === 1 ? 'series' : 'series')}
                      </span>
                    </div>
                    {!isImplemented && (
                      <Tag style={{ background: '#fef3c7', color: '#b45309', border: 'none', fontWeight: 600, fontSize: 11, borderRadius: 6 }}>
                        Coming soon
                      </Tag>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════
  // RENDER: Series List View
  // ════════════════════════════════════════════════════════════
  const renderSeriesListView = () => {
    if (loading && seriesList.length === 0) {
      return (
        <div>
          <Skeleton.Input active style={{ width: 300, height: 20, borderRadius: 6, marginBottom: 20 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <Skeleton.Input active style={{ width: 200, height: 36, borderRadius: 8 }} />
            <Skeleton.Button active style={{ width: 140, height: 36, borderRadius: 8 }} />
          </div>
          <Skeleton.Button active style={{ height: 64, borderRadius: 12, width: '100%', marginBottom: 20 }} block />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[1, 2, 3].map(i => (
              <Skeleton.Button key={i} active style={{ height: 200, borderRadius: 16, width: '100%' }} block />
            ))}
          </div>
        </div>
      );
    }

    // Stats removed — series count shown in header subtitle

    return (
      <div>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 20, fontSize: 13 }}
          items={[
            {
              title: (
                <a
                  onClick={() => navigateBack()}
                  style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}
                >
                  📋 Exam Preparation
                </a>
              ),
            },
            { title: <span style={{ color: '#475569', fontWeight: 600 }}>{selectedCategoryName}</span> },
          ]}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={navigateBack}
              style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }}
            />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
                {selectedCategoryName}
              </div>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                {filteredSeries.length} of {seriesList.length} series
              </Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Input
              placeholder="Search series..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 220, borderRadius: 8, border: '1px solid #e0e7ff' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingSeries(null); setSeriesModalOpen(true); }}
              style={{
                borderRadius: 10, height: 36, fontWeight: 600,
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              Create Series
            </Button>
            {categoryType === 'co' && (
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() => setImportModalOpen(true)}
                style={{
                  borderRadius: 10, height: 36, fontWeight: 600,
                  border: '1px solid #c7d2fe', color: '#4338ca',
                  background: '#f8f9ff',
                }}
              >
                📁 Import from Folder
              </Button>
            )}
            {categoryType === 'ce' && (
              <Button
                icon={<FolderOpenOutlined />}
                onClick={() => setCeImportModalOpen(true)}
                style={{
                  borderRadius: 10, height: 36, fontWeight: 600,
                  border: '1px solid #14b8a6', color: '#0f766e',
                  background: '#f0fdfa',
                }}
              >
                JSON Bulk Import
              </Button>
            )}
          </div>
        </div>

        {/* Series Cards */}
        {filteredSeries.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff',
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, color: '#6366f1',
            }}>
              <FileTextOutlined />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>
              {searchText ? 'No series match your search' : 'No series yet'}
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              {searchText
                ? 'Try adjusting your search terms'
                : 'Create your first series to start adding questions and building exams'}
            </div>
            {!searchText && (
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => { setEditingSeries(null); setSeriesModalOpen(true); }}
                style={{
                  borderRadius: 10, fontWeight: 600, height: 44,
                  background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                  border: 'none', boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                }}
              >
                Create First Series
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filteredSeries.map(series => (
                <div
                  key={series.id}
                  onClick={() => navigateToSeriesDetail(series)}
                  style={{
                    borderRadius: 12,
                    border: '1px solid #e8e8f4',
                    borderLeft: '3px solid #6366f1',
                    background: '#fff',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)'; e.currentTarget.style.borderLeftColor = '#4338ca'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderLeftColor = '#6366f1'; }}
                >
                  {/* Left: name + stats */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {series.name}
                      {series.intro_audio_kdrive_file_id && (
                        <Tooltip title="Has introduction audio">
                          <CustomerServiceOutlined style={{ fontSize: 12, color: '#6366f1', flexShrink: 0 }} />
                        </Tooltip>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#94a3b8' }}>
                      <span><span style={{ fontWeight: 700, color: '#4338ca' }}>{series.total_questions}</span> Q</span>
                      <span><span style={{ fontWeight: 700, color: '#22c55e' }}>{series.total_points}</span> pts</span>
                      <span><span style={{ fontWeight: 700, color: '#f59e0b' }}>{series.duration_minutes}</span> min</span>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div onClick={e => e.stopPropagation()}>
                    <Dropdown
                      menu={{
                        items: [
                          { key: 'edit', icon: <EditOutlined />, label: 'Edit', onClick: () => { setEditingSeries(series); setSeriesModalOpen(true); } },
                          { key: 'assign', icon: <SendOutlined />, label: 'Assign', onClick: () => openAssignModal('series', series.id, series.name) },
                          { type: 'divider' },
                          { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true, onClick: () => { Modal.confirm({ title: 'Delete Series', content: `Delete "${series.name}"?`, okText: 'Delete', okType: 'danger', onOk: () => handleDeleteSeries(series.id) }); } },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button type="text" size="small" icon={<MoreOutlined />} style={{ borderRadius: 6, width: 28, height: 28 }} />
                    </Dropdown>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════
  // RENDER: Series Detail View
  // ════════════════════════════════════════════════════════════
  const renderSeriesDetailView = () => {
    if (loading || !seriesDetail) {
      return (
        <div>
          <Skeleton.Input active style={{ width: 400, height: 20, borderRadius: 6, marginBottom: 20 }} />
          <Skeleton.Button active style={{ height: 120, borderRadius: 16, width: '100%', marginBottom: 20 }} block />
          <Skeleton.Button active style={{ height: 300, borderRadius: 16, width: '100%' }} block />
        </div>
      );
    }

    const thresholds = typeof seriesDetail.cefr_thresholds === 'string'
      ? JSON.parse(seriesDetail.cefr_thresholds)
      : seriesDetail.cefr_thresholds;
    const distribution = seriesDetail.cefr_distribution || { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

    const questionColumns = [
      {
        title: '#',
        dataIndex: 'question_order',
        key: 'order',
        width: 50,
        render: (order: number) => (
          <span style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>{order}</span>
        ),
      },
      ...(categoryType === 'co' ? [{
        title: 'Audio',
        key: 'audio',
        width: 160,
        render: (_: unknown, record: Question) => (
          record.audio_kdrive_file_id ? (
            <audio
              controls
              preload="none"
              style={{ height: 28, width: 140 }}
              src={`${API_BASE}/tcf/co/questions/${record.id}/audio?token=${token}`}
              title={record.audio_file_name || 'Audio'}
            />
          ) : (
            <span style={{ color: '#d1d5db', fontSize: 12 }}>—</span>
          )
        ),
      }] : []),
      {
        title: 'Question',
        dataIndex: 'question_text',
        key: 'question_text',
        ellipsis: true,
        render: (text: string) => (
          <Tooltip title={text}>
            <span style={{ fontSize: 13, color: '#1e293b' }}>
              {text.length > 80 ? text.substring(0, 80) + '...' : text}
            </span>
          </Tooltip>
        ),
      },
      {
        title: 'CEFR',
        dataIndex: 'cefr_level',
        key: 'cefr_level',
        width: 80,
        render: (level: string) => <CefrTag level={level} />,
      },
      {
        title: 'Points',
        dataIndex: 'points',
        key: 'points',
        width: 70,
        render: (pts: number) => (
          <span style={{ fontWeight: 700, color: '#1e293b' }}>{pts}</span>
        ),
      },
      {
        title: 'Answer',
        dataIndex: 'correct_answer',
        key: 'correct_answer',
        width: 70,
        render: (ans: string) => (
          <Tag style={{ background: '#dcfce7', color: '#15803d', border: 'none', fontWeight: 700, borderRadius: 6 }}>
            {ans}
          </Tag>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 140,
        render: (_: unknown, record: Question) => (
          <Space size="small">
            <Tooltip title="Move up">
              <Button
                type="text"
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={record.question_order === 1}
                onClick={() => handleMoveQuestion(record.id, 'up')}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
            <Tooltip title="Move down">
              <Button
                type="text"
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={record.question_order === seriesDetail.questions.length}
                onClick={() => handleMoveQuestion(record.id, 'down')}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => { setEditingQuestion(record); setQuestionModalOpen(true); }}
                style={{ borderRadius: 8, color: '#6366f1' }}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteQuestion(record.id)}
                style={{ borderRadius: 8 }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)' }}>
        {/* Fixed header section */}
        <div style={{ flexShrink: 0 }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 10, fontSize: 13 }}
          items={[
            {
              title: (
                <a
                  onClick={() => {
                    setSelectedSeriesId(null);
                    setSeriesDetail(null);
                    setSelectedCategoryId(null);
                    setSelectedCategoryName('');
                    setCategoryType('ce');
                    setView('categories');
                  }}
                  style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}
                >
                  📋 Exam Preparation
                </a>
              ),
            },
            {
              title: (
                <a onClick={() => navigateBack()} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>
                  {selectedCategoryName}
                </a>
              ),
            },
            { title: <span style={{ color: '#475569', fontWeight: 600 }}>{seriesDetail.name}</span> },
          ]}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={navigateBack}
              style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }}
            />
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>
                {seriesDetail.name}
              </div>
              {seriesDetail.description && (
                <Text style={{ fontSize: 12, color: '#94a3b8' }}>{seriesDetail.description}</Text>
              )}
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}
            style={{
              borderRadius: 10, height: 36, fontWeight: 600, fontSize: 13,
              background: 'linear-gradient(135deg, #4338ca, #6366f1)',
              border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
            }}
          >
            Add Question
          </Button>
        </div>

        {/* Compact metadata card */}
        <div
          style={{
            background: '#fff', borderRadius: 12, padding: '14px 18px',
            border: '1px solid #e8e8f4', marginBottom: 14,
            boxShadow: '0 1px 6px rgba(99,102,241,0.05)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          {/* Row 1: Stats pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, marginRight: 2 }}>📊</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 8,
              background: '#eef2ff', color: '#4338ca',
              fontSize: 13, fontWeight: 700,
            }}>
              {seriesDetail.total_questions} Questions
            </span>
            <span style={{ color: '#cbd5e1', fontSize: 13 }}>·</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 8,
              background: '#f0fdf4', color: '#15803d',
              fontSize: 13, fontWeight: 700,
            }}>
              {seriesDetail.total_points} Points
            </span>
            <span style={{ color: '#cbd5e1', fontSize: 13 }}>·</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 8,
              background: '#fffbeb', color: '#b45309',
              fontSize: 13, fontWeight: 700,
            }}>
              {seriesDetail.duration_minutes} min
            </span>
          </div>

          {/* Row 2: CEFR Distribution + Thresholds */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>CEFR:</span>
              <CefrDistributionTags distribution={distribution} />
            </div>
            <span style={{ color: '#e2e8f0', fontSize: 11 }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3 }}>Thresholds:</span>
              {CEFR_LEVELS.map(level => (
                <span
                  key={level}
                  style={{
                    padding: '1px 7px', borderRadius: 5, fontSize: 11, fontWeight: 700,
                    background: `${CEFR_COLORS[level]}12`,
                    color: CEFR_COLORS[level],
                    border: `1px solid ${CEFR_COLORS[level]}25`,
                  }}
                >
                  {level}≥{thresholds[level]}
                </span>
              ))}
            </div>
          </div>

          {/* Row 3: Intro Audio (CO only) */}
          {categoryType === 'co' && seriesDetail.intro_audio_kdrive_file_id && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: '1px solid #f0f0f8' }}>
              <span style={{ fontSize: 13 }}>🎧</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>Intro:</span>
              <audio
                controls
                preload="none"
                style={{ height: 30, flex: 1, maxWidth: 360 }}
                src={`${API_BASE}/tcf/co/series/${seriesDetail.id}/intro-audio?token=${token}`}
              />
              <span style={{ fontSize: 11, color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {seriesDetail.intro_audio_file_name}
              </span>
            </div>
          )}
        </div>
        </div>{/* end fixed header */}

        {/* Scrollable questions table */}
        <div
          style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e8e8f4',
            boxShadow: '0 1px 6px rgba(99,102,241,0.04)',
            overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
          }}
        >
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4338ca', fontSize: 13,
            }}>
              <QuestionCircleOutlined />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Questions</span>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#6366f1',
              background: '#eef2ff', padding: '2px 10px', borderRadius: 10,
            }}>
              {seriesDetail.questions.length}
            </span>
          </div>
          <style>{`
            .exam-questions-table .ant-table-tbody > tr:nth-child(even) > td {
              background: #fafbff;
            }
            .exam-questions-table .ant-table-tbody > tr:hover > td {
              background: #eef2ff !important;
            }
            .exam-questions-table .ant-table-thead > tr > th {
              background: #f8f9ff !important;
              font-weight: 700 !important;
              color: #475569 !important;
              font-size: 12px !important;
              text-transform: uppercase !important;
              letter-spacing: 0.5px !important;
            }
            .exam-questions-table .ant-table-body {
              padding-bottom: 40px !important;
            }
          `}</style>
          <div style={{ flex: 1, overflow: 'hidden' }}>
          <Table
            className="exam-questions-table"
            columns={questionColumns}
            dataSource={seriesDetail.questions}
            rowKey="id"
            size="small"
            pagination={false}
            sticky
            scroll={{ y: 'max(300px, calc(100vh - 450px))' }}
            locale={{ emptyText: <Empty description="No questions yet — add one to get started" /> }}
          />
          </div>
        </div>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════
  // RENDER: EE Years View
  // ════════════════════════════════════════════════════════════
  const renderEeYearsView = () => {
    return (
      <div>
        <Breadcrumb
          style={{ marginBottom: 20, fontSize: 13 }}
          items={[
            { title: <a onClick={() => { setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setEeYears([]); setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
            { title: <span style={{ color: '#475569', fontWeight: 600 }}>{selectedCategoryName}</span> },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>{selectedCategoryName}</div>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>{eeYears.length} year{eeYears.length !== 1 ? 's' : ''}</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={() => setEeImportModalOpen(true)}
              style={{ borderRadius: 10, height: 36, fontWeight: 600, border: '1px solid #c7d2fe', color: '#4338ca', background: '#f8f9ff' }}
            >
              📁 Import Year from File
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeYearModalOpen(true)} style={{ borderRadius: 10, height: 36, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
              Add Year
            </Button>
          </div>
        </div>
        {loading && eeYears.length === 0 ? (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ width: 120, height: 48, borderRadius: 12 }} />)}
          </div>
        ) : eeYears.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>No years yet</div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Add a year to start organizing Expression Écrite content</div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeYearModalOpen(true)} style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}>Add First Year</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {eeYears.map(y => (
              <div
                key={y.id}
                onClick={() => { setSelectedEeYearId(y.id); setSelectedEeYear(y.year); setView('ee-months'); }}
                style={{ padding: '14px 24px', borderRadius: 12, border: '1px solid #e8e8f4', background: '#fff', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', minWidth: 120, textAlign: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e8e8f4'; }}
              >
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4338ca' }}>{y.year}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{y.month_count} month{y.month_count !== 1 ? 's' : ''}</div>
                <div style={{ position: 'absolute', top: 4, right: 4 }} onClick={e => e.stopPropagation()}>
                  <Tooltip title="Delete year">
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                      Modal.confirm({ title: 'Delete Year', content: `Delete ${y.year} and all its months, combinaisons, and tâches?`, okText: 'Delete', okType: 'danger', onOk: async () => {
                        try { const resp = await apiCall(`/tcf/ee/years/${y.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Year deleted'); fetchEeYears(); } else { message.error('Failed'); } } catch { message.error('Failed'); }
                      }});
                    }} style={{ borderRadius: 6, width: 24, height: 24 }} />
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // RENDER: EE Months View
  // ════════════════════════════════════════════════════════════
  const renderEeMonthsView = () => {
    return (
      <div>
        <Breadcrumb
          style={{ marginBottom: 20, fontSize: 13 }}
          items={[
            { title: <a onClick={() => { setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setEeYears([]); setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
            { title: <a onClick={() => { setSelectedEeYearId(null); setSelectedEeYear(null); setEeMonths([]); setView('ee-years'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{selectedCategoryName}</a> },
            { title: <span style={{ color: '#475569', fontWeight: 600 }}>{selectedEeYear}</span> },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>{selectedCategoryName} — {selectedEeYear}</div>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>{eeMonths.length} month{eeMonths.length !== 1 ? 's' : ''}</Text>
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeMonthModalOpen(true)} style={{ borderRadius: 10, height: 36, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
            Add Month
          </Button>
        </div>
        {loading && eeMonths.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4].map(i => <Skeleton.Button key={i} active style={{ height: 100, borderRadius: 12, width: '100%' }} block />)}
          </div>
        ) : eeMonths.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📆</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>No months yet</div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Add a month to start adding combinaisons</div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeMonthModalOpen(true)} style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}>Add First Month</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
            {eeMonths.map(m => (
              <div
                key={m.id}
                onClick={() => { setSelectedEeMonthId(m.id); setSelectedEeMonthName(m.month_name); setView('ee-combinaisons'); }}
                style={{
                  borderRadius: 10, border: '1px solid #e8e8f4', borderLeft: '3px solid #6366f1',
                  background: '#fff', padding: '10px 12px', cursor: 'pointer',
                  transition: 'all 0.2s ease', position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }} onClick={e => e.stopPropagation()}>
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                    Modal.confirm({ title: 'Delete Month', content: `Delete ${m.month_name}?`, okText: 'Delete', okType: 'danger', onOk: async () => {
                      try { const resp = await apiCall(`/tcf/ee/months/${m.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); fetchEeMonths(); } } catch { message.error('Failed'); }
                    }});
                  }} style={{ borderRadius: 6, width: 22, height: 22, fontSize: 10 }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{m.month_name}</div>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#94a3b8' }}>
                  <span>{selectedEeYear}</span>
                  <span>·</span>
                  <span><span style={{ fontWeight: 700, color: '#4338ca' }}>{m.combinaison_count}</span> comb.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // RENDER: EE Combinaisons View
  // ════════════════════════════════════════════════════════════
  const renderEeCombinaisonsView = () => {
    const handleDeleteCombinaison = (comb: EeCombinaison) => {
      Modal.confirm({
        title: 'Delete Combinaison',
        content: `Delete "${comb.name}" and all its tâches?`,
        okText: 'Delete', okType: 'danger',
        onOk: async () => {
          try {
            const resp = await apiCall(`/tcf/ee/combinaisons/${comb.id}`, { method: 'DELETE' });
            if (resp.ok) { message.success('Deleted'); fetchEeCombinaisons(); }
            else { message.error('Failed'); }
          } catch { message.error('Failed'); }
        },
      });
    };

    return (
      <div>
        <Breadcrumb
          style={{ marginBottom: 20, fontSize: 13 }}
          items={[
            { title: <a onClick={() => { setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setEeYears([]); setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
            { title: <a onClick={() => { setSelectedEeYearId(null); setSelectedEeYear(null); setEeMonths([]); setView('ee-years'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{selectedCategoryName}</a> },
            { title: <a onClick={() => { setSelectedEeMonthId(null); setSelectedEeMonthName(''); setEeCombinaisons([]); setCorrectionVisible({}); setView('ee-months'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{selectedEeYear}</a> },
            { title: <span style={{ color: '#475569', fontWeight: 600 }}>{selectedEeMonthName}</span> },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>{selectedEeMonthName} {selectedEeYear}</div>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>{eeCombinaisons.length} combinaison{eeCombinaisons.length !== 1 ? 's' : ''}</Text>
            </div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCombinaison(null); setEeCombinaisonModalOpen(true); }} style={{ borderRadius: 10, height: 36, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
            Add Combinaison
          </Button>
        </div>
        {loading && eeCombinaisons.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2].map(i => <Skeleton.Button key={i} active style={{ height: 80, borderRadius: 12, width: '100%' }} block />)}
          </div>
        ) : eeCombinaisons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>No combinaisons yet</div>
            <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>Add a combinaison to start creating writing tasks</div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCombinaison(null); setEeCombinaisonModalOpen(true); }} style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}>Add First Combinaison</Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {eeCombinaisons.map(comb => {
              return (
                <div key={comb.id} style={{ borderRadius: 10, border: '1px solid #e8e8f4', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(99,102,241,0.04)' }}>
                  <div
                    onClick={() => { setViewingCombinaison(comb); }}
                    style={{ padding: '8px', cursor: 'pointer', background: '#fff', textAlign: 'center', position: 'relative', transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ position: 'absolute', top: 3, right: 3, display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
                      <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingCombinaison(comb); setEeCombinaisonModalOpen(true); }} style={{ borderRadius: 4, color: '#6366f1', width: 18, height: 18, fontSize: 9 }} />
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCombinaison(comb)} style={{ borderRadius: 4, width: 18, height: 18, fontSize: 9 }} />
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800, marginBottom: 3 }}>
                      {comb.display_order}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{comb.name}</div>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{comb.taches.length}/3</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // EO Render Wrappers (delegate to EoRenderHelpers)
  // ════════════════════════════════════════════════════════════
  const eoProps = {
    eoYears, eoMonths, eoParties, loading,
    selectedCategoryId, selectedCategoryName,
    selectedEoYearId, selectedEoYear, selectedEoMonthId, selectedEoMonthName,
    viewingPartie, eoCorrectionVisible,
    setSelectedEoYearId, setSelectedEoYear, setSelectedEoMonthId, setSelectedEoMonthName,
    setViewingPartie, setEoCorrectionVisible,
    setView: setView as (v: string) => void,
    setEoYearModalOpen, setEoMonthModalOpen, setEoPartieModalOpen, setEditingPartie,
    setEoTacheModalOpen, setEditingEoTache, setEditingEoTacheNumber, setEditingEoTachePartieId,
    setEoPointModalOpen, setEditingEoPoint, setEditingEoPointTacheId, setEditingEoPointNextNum,
    setEoSujetModalOpen, setEditingEoSujet, setEditingEoSujetTacheId, setEditingEoSujetNextNum,
    navigateBack, fetchEoYears, fetchEoMonths, fetchEoParties, apiCall,
    setCategoryType: setCategoryType as (v: string) => void,
    setSelectedCategoryId, setSelectedCategoryName,
    setEoYears, setEoMonths, setEoParties,
    setEoImportModalOpen,
  };
  const renderEoYearsView = () => _renderEoYearsView(eoProps);
  const renderEoMonthsView = () => _renderEoMonthsView(eoProps);
  const renderEoPartiesView = () => _renderEoPartiesView(eoProps);
  const renderEoPartieDetailView = () => _renderEoPartieDetailView(eoProps);

  // ════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div>
      <div key={view} style={{ animation: 'fadeInUp 0.35s ease-out' }}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {view === 'categories' && renderCategoriesView()}
        {view === 'series-list' && renderSeriesListView()}
        {view === 'series-detail' && renderSeriesDetailView()}
        {view === 'ee-years' && renderEeYearsView()}
        {view === 'ee-months' && renderEeMonthsView()}
        {view === 'ee-combinaisons' && renderEeCombinaisonsView()}
        {view === 'eo-years' && renderEoYearsView()}
        {view === 'eo-months' && renderEoMonthsView()}
        {view === 'eo-parties' && renderEoPartiesView()}
        {view === 'eo-partie-detail' && renderEoPartieDetailView()}
      </div>

      {/* Modals */}
      <CategoryFormModal
        open={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditingCategory(null); }}
        onSuccess={fetchCategories}
        editingCategory={editingCategory}
        apiCall={apiCall}
      />

      {selectedCategoryId && (
        <SeriesFormModal
          open={seriesModalOpen}
          onClose={() => { setSeriesModalOpen(false); setEditingSeries(null); }}
          onSuccess={fetchSeriesList}
          editingSeries={editingSeries}
          categoryId={selectedCategoryId}
          categoryType={categoryType}
          apiCall={apiCall}
        />
      )}

      {selectedSeriesId && (
        <QuestionFormModal
          open={questionModalOpen}
          onClose={() => { setQuestionModalOpen(false); setEditingQuestion(null); }}
          onSuccess={fetchSeriesDetail}
          editingQuestion={editingQuestion}
          seriesId={selectedSeriesId}
          categoryType={categoryType}
          apiCall={apiCall}
        />
      )}

      {assignModalOpen && (
        <AssignmentModal
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          assignType={assignType}
          assignId={assignId}
          assignName={assignName}
          categoryType={categoryType}
          apiCall={apiCall}
        />
      )}

      {selectedCategoryId && categoryType === 'co' && (
        <BulkImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={fetchSeriesList}
          categoryId={selectedCategoryId}
          token={token}
        />
      )}

      {selectedCategoryId && categoryType === 'ce' && (
        <CeBulkImportModal
          open={ceImportModalOpen}
          onClose={() => setCeImportModalOpen(false)}
          onSuccess={fetchSeriesList}
          categoryId={selectedCategoryId}
          token={token}
        />
      )}

      {/* EE Year Modal */}
      <EeYearModal
        open={eeYearModalOpen}
        onClose={() => setEeYearModalOpen(false)}
        onSuccess={() => { fetchEeYears(); setEeYearModalOpen(false); }}
        categoryId={selectedCategoryId}
        apiCall={apiCall}
      />

      {/* EE Bulk Import Modal */}
      {selectedCategoryId && categoryType === 'ee' && (
        <EeBulkImportModal
          open={eeImportModalOpen}
          onClose={() => setEeImportModalOpen(false)}
          onSuccess={() => { fetchEeYears(); setEeImportModalOpen(false); }}
          categoryId={selectedCategoryId}
          apiCall={apiCall}
        />
      )}

      {/* EE Month Modal */}
      <EeMonthModal
        open={eeMonthModalOpen}
        onClose={() => setEeMonthModalOpen(false)}
        onSuccess={() => { fetchEeMonths(); setEeMonthModalOpen(false); }}
        yearId={selectedEeYearId}
        apiCall={apiCall}
      />

      {/* EE Combinaison Modal */}
      <EeCombinaisonModal
        open={eeCombinaisonModalOpen}
        onClose={() => { setEeCombinaisonModalOpen(false); setEditingCombinaison(null); }}
        onSuccess={() => { fetchEeCombinaisons(); setEeCombinaisonModalOpen(false); setEditingCombinaison(null); }}
        monthId={selectedEeMonthId}
        editing={editingCombinaison}
        apiCall={apiCall}
      />

      {/* EE Tâche Edit Modal */}
      <EeTacheModal
        open={eeTacheModalOpen}
        onClose={() => { setEeTacheModalOpen(false); setEditingTache(null); }}
        onSuccess={() => { fetchEeCombinaisons(); setEeTacheModalOpen(false); setEditingTache(null); if (viewingCombinaison) { /* refresh viewing */ apiCall(`/tcf/ee/months/${selectedEeMonthId}/combinaisons`).then(r => r.ok ? r.json() : []).then(combs => { const updated = (combs as EeCombinaison[]).find(c => c.id === viewingCombinaison.id); if (updated) setViewingCombinaison(updated); }); } }}
        editing={editingTache}
        taskNumber={editingTacheTaskNumber}
        combinaisonId={editingTacheCombinaisonId}
        apiCall={apiCall}
      />

      {/* EE Combinaison View Modal */}
      <Modal
        title={null}
        open={!!viewingCombinaison}
        onCancel={() => setViewingCombinaison(null)}
        footer={null}
        width={700}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {viewingCombinaison && (
          <>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f8', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 800 }}>
                {viewingCombinaison.display_order}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{viewingCombinaison.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{viewingCombinaison.taches.length}/3 tâches</div>
              </div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {viewingCombinaison.taches.sort((a, b) => a.task_number - b.task_number).map(tache => {
                const defaults = TASK_DEFAULTS[tache.task_number];
                const showCorr = correctionVisible[tache.id];
                return (
                  <div key={tache.id} style={{ padding: '12px 14px', borderRadius: 10, background: '#fafbff', border: '1px solid #f0f0f8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Tag color="blue" style={{ borderRadius: 6, fontWeight: 700, fontSize: 11, margin: 0 }}>Tâche {tache.task_number}</Tag>
                        <Tag style={{ borderRadius: 6, background: '#f0fdf4', color: '#15803d', border: 'none', fontWeight: 600, fontSize: 11, margin: 0 }}>{TASK_TYPE_LABELS[tache.task_type]}</Tag>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{defaults?.min}-{defaults?.max} mots · {defaults?.dur} min</span>
                      </div>
                      <Space size={2}>
                        <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingTache(tache); setEditingTacheTaskNumber(tache.task_number); setEditingTacheCombinaisonId(viewingCombinaison.id); setEeTacheModalOpen(true); }} style={{ borderRadius: 6, color: '#6366f1', width: 26, height: 26 }} />
                        <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => { Modal.confirm({ title: `Delete Tâche ${tache.task_number}`, content: 'Are you sure?', okText: 'Delete', okType: 'danger', onOk: async () => { const resp = await apiCall(`/tcf/ee/taches/${tache.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); fetchEeCombinaisons(); const updated = { ...viewingCombinaison, taches: viewingCombinaison.taches.filter(t => t.id !== tache.id) }; setViewingCombinaison(updated); } } }); }} style={{ borderRadius: 6, width: 26, height: 26 }} />
                      </Space>
                    </div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{tache.prompt_text}</div>
                    {tache.task_type === 'argumentation' && tache.question_text && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>Question</div>
                        <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{tache.question_text}</div>
                      </div>
                    )}
                    {tache.task_type === 'argumentation' && tache.argument_text_1 && (
                      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#eef2ff', border: '1px solid #e0e7ff' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#4338ca', marginBottom: 4 }}>Argument 1</div>
                        <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap' }}>{tache.argument_text_1}</div>
                      </div>
                    )}
                    {tache.task_type === 'argumentation' && tache.argument_text_2 && (
                      <div style={{ marginTop: 6, padding: '8px 12px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>Argument 2</div>
                        <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap' }}>{tache.argument_text_2}</div>
                      </div>
                    )}
                    {tache.correction_text && (
                      <div style={{ marginTop: 8 }}>
                        <Button size="small" type="link" onClick={() => setCorrectionVisible(prev => ({ ...prev, [tache.id]: !prev[tache.id] }))} style={{ padding: 0, fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                          {showCorr ? '🔽 Hide correction' : '📝 View correction'}
                        </Button>
                        {showCorr && (
                          <div style={{ marginTop: 6, padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap' }}>{tache.correction_text}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Add missing tâches */}
              {(() => {
                const existing = new Set(viewingCombinaison.taches.map(t => t.task_number));
                const missing = [1, 2, 3].filter(n => !existing.has(n));
                if (missing.length === 0) return null;
                return (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {missing.map(num => (
                      <Button key={num} size="small" icon={<PlusOutlined />}
                        onClick={() => { setEditingTache(null); setEditingTacheTaskNumber(num); setEditingTacheCombinaisonId(viewingCombinaison.id); setEeTacheModalOpen(true); }}
                        style={{ borderRadius: 8, fontSize: 12, color: '#6366f1', borderColor: '#c7d2fe', background: '#f8f9ff' }}>
                        Add Tâche {num} ({TASK_TYPE_LABELS[TASK_DEFAULTS[num].type]})
                      </Button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </Modal>

      {/* EO Modals */}
      <EoYearModal
        open={eoYearModalOpen}
        onClose={() => setEoYearModalOpen(false)}
        onSuccess={() => { fetchEoYears(); setEoYearModalOpen(false); }}
        categoryId={selectedCategoryId}
        apiCall={apiCall}
      />
      <EoMonthModal
        open={eoMonthModalOpen}
        onClose={() => setEoMonthModalOpen(false)}
        onSuccess={() => { fetchEoMonths(); setEoMonthModalOpen(false); }}
        yearId={selectedEoYearId}
        apiCall={apiCall}
      />
      <EoPartieModal
        open={eoPartieModalOpen}
        onClose={() => { setEoPartieModalOpen(false); setEditingPartie(null); }}
        onSuccess={() => { fetchEoParties(); setEoPartieModalOpen(false); setEditingPartie(null); }}
        monthId={selectedEoMonthId}
        editing={editingPartie}
        apiCall={apiCall}
      />
      <EoTacheModal
        open={eoTacheModalOpen}
        onClose={() => { setEoTacheModalOpen(false); setEditingEoTache(null); }}
        onSuccess={() => { fetchEoParties(); setEoTacheModalOpen(false); setEditingEoTache(null); }}
        partieId={editingEoTachePartieId}
        taskNumber={editingEoTacheNumber}
        editing={editingEoTache}
        apiCall={apiCall}
      />
      <EoPointModal
        open={eoPointModalOpen}
        onClose={() => { setEoPointModalOpen(false); setEditingEoPoint(null); }}
        onSuccess={() => { fetchEoParties(); setEoPointModalOpen(false); setEditingEoPoint(null); }}
        tacheId={editingEoPointTacheId}
        editing={editingEoPoint}
        nextNumber={editingEoPointNextNum}
        apiCall={apiCall}
      />
      <EoSujetModal
        open={eoSujetModalOpen}
        onClose={() => { setEoSujetModalOpen(false); setEditingEoSujet(null); }}
        onSuccess={() => { fetchEoParties(); setEoSujetModalOpen(false); setEditingEoSujet(null); }}
        tacheId={editingEoSujetTacheId}
        editing={editingEoSujet}
        nextNumber={editingEoSujetNextNum}
        apiCall={apiCall}
      />
      {selectedCategoryId && categoryType === 'eo' && (
        <EoBulkImportModal
          open={eoImportModalOpen}
          onClose={() => setEoImportModalOpen(false)}
          onSuccess={() => { fetchEoYears(); setEoImportModalOpen(false); }}
          categoryId={selectedCategoryId}
          apiCall={apiCall}
        />
      )}
      <ExamAssignmentModal
        open={examAssignModalOpen}
        onClose={() => setExamAssignModalOpen(false)}
        apiCall={apiCall}
      />
      <GrantCreditsModal
        open={grantCreditsModalOpen}
        onClose={() => setGrantCreditsModalOpen(false)}
        apiCall={apiCall}
      />
      <AdminCOAnalytics open={coAnalyticsOpen} onClose={() => setCoAnalyticsOpen(false)} />
    </div>
  );
};

export default ExamPreparation;
