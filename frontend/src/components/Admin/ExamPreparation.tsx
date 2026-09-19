import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Drawer, Modal, Form, Input, InputNumber, Select, Table, Button, message,
  Skeleton, Tooltip, Space, Row, Col,
  Typography, Tag, Radio, Dropdown, Upload, Progress
} from 'antd';
import type { UploadFile } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined,
  SearchOutlined, ReadOutlined, FormOutlined, SoundOutlined,
  AudioOutlined, BookOutlined, FileTextOutlined, QuestionCircleOutlined,
  TeamOutlined, UserOutlined, MoreOutlined, ArrowUpOutlined, ArrowDownOutlined,
  SendOutlined, UploadOutlined, ThunderboltOutlined,
  CustomerServiceOutlined, FolderOpenOutlined, CheckCircleOutlined, CloseCircleOutlined,
  BarChartOutlined, RightOutlined, ClockCircleOutlined, AppstoreOutlined,
  WarningOutlined, PictureOutlined, CheckOutlined, ArrowRightOutlined, CloseOutlined, CalendarOutlined
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
import ExamResultsDashboard from '../Common/ExamResultsDashboard';
import { FAMILY_CODE, familyOfCategory } from './examAdminData';
import type { ExamAssignmentGroup } from './examAdminData';
import './ExamAdmin.css';
import { AudioPlayButton, fmtClock, useSharedAudio } from './SharedAudio';

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
  question_count?: number;
  sub_count?: number;
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
  categoryId: number | null; existing?: number[];
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, categoryId, existing = [], apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const thisYear = new Date().getFullYear();
  useEffect(() => { if (open) form.setFieldsValue({ year: thisYear }); }, [open, form, thisYear]);
  const submit = async () => {
    try {
      const { year } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/eo/categories/${categoryId}/years`, { method: 'POST', body: JSON.stringify({ year }) });
      if (resp.ok) { message.success(`${year} added`); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The year could not be added.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText="Add year" destroyOnHidden
      closable={false} title={null} width={420} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<CalendarOutlined />} title="Add a year" subtitle="Expression Orale sessions are grouped by year, then by month." tone="eo" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Enter a year' }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        <div className="fm-quick">
          {[thisYear - 1, thisYear, thisYear + 1].map(y => (
            <button key={y} type="button" disabled={existing.includes(y)} onClick={() => form.setFieldsValue({ year: y })}>
              {y}{existing.includes(y) ? ' · added' : ''}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const EoMonthModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  yearId: number | null; existing?: number[];
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, yearId, existing = [], apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) form.resetFields(); }, [open, form]);
  const submit = async () => {
    try {
      const { month } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/eo/years/${yearId}/months`, { method: 'POST', body: JSON.stringify({ month, month_name: FRENCH_MONTHS[month] }) });
      if (resp.ok) { message.success(`${FRENCH_MONTHS[month]} added`); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The month could not be added.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText="Add month" destroyOnHidden
      closable={false} title={null} width={460} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<CalendarOutlined />} title="Add a month" subtitle="Months already added are greyed out." tone="eo" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="month" label="Month" rules={[{ required: true, message: 'Choose a month' }]}>
            <Select placeholder="Choose a month" options={Object.entries(FRENCH_MONTHS).map(([num, name]) => ({
              value: parseInt(num, 10), label: `${num}. ${name}`, disabled: existing.includes(parseInt(num, 10)),
            }))} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

const EoPartieModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  monthId: number | null; editing: EoPartie | null; nextNumber?: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, monthId, editing, nextNumber = 1, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) {
      form.setFieldsValue(editing
        ? { name: editing.name, display_order: editing.display_order }
        : { name: `Partie ${nextNumber}`, display_order: nextNumber });
    }
  }, [open, editing, nextNumber, form]);
  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const resp = editing
        ? await apiCall(`/tcf/eo/parties/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : await apiCall(`/tcf/eo/months/${monthId}/parties`, { method: 'POST', body: JSON.stringify(values) });
      if (resp.ok) { message.success(editing ? 'Partie saved' : 'Partie added'); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The partie could not be saved.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={editing ? 'Save' : 'Add partie'} destroyOnHidden
      closable={false} title={null} width={460} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<AudioOutlined />} title={editing ? 'Edit partie' : 'Add a partie'}
        subtitle={editing ? undefined : 'A partie holds the three tâches of one oral exam session.'} tone="eo" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input placeholder="e.g. Partie 1" maxLength={80} />
          </Form.Item>
          <Form.Item name="display_order" label={<>Position <em className="fm-opt">order in the list</em></>}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </div>
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
  const num = editing ? editing.task_number : taskNumber;
  const defaults = EO_TASK_DEFAULTS[num];
  useEffect(() => {
    if (open) {
      form.setFieldsValue(editing
        ? { prompt_text: editing.prompt_text || '', prep_minutes: editing.prep_minutes, duration_minutes: editing.duration_minutes }
        : { prompt_text: '', prep_minutes: defaults?.prep || 0, duration_minutes: defaults?.dur || 2 });
    }
  }, [open, editing, form, defaults]);
  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const resp = editing
        ? await apiCall(`/tcf/eo/taches/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : await apiCall(`/tcf/eo/parties/${partieId}/taches`, {
          method: 'POST',
          body: JSON.stringify({ ...values, task_number: num, task_type: defaults?.type || 'presentation' }),
        });
      if (resp.ok) { message.success(editing ? 'Tâche saved' : 'Tâche added'); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The tâche could not be saved.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={editing ? 'Save tâche' : 'Add tâche'} destroyOnHidden
      closable={false} title={null} width={520} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<AudioOutlined />} title={`${editing ? 'Edit' : 'Add'} tâche ${num}`} subtitle={EO_TASK_TYPE_LABELS[defaults?.type || 'presentation']} tone="eo" />
      <div className="fm-body">
        <div className="fm-facts">
          <span>{EO_TASK_TYPE_LABELS[defaults?.type || 'presentation']}</span>
          {num === 1 ? <span>up to <b>4</b> points à aborder</span> : <span>holds the <b>sujets</b></span>}
        </div>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="prompt_text" label={<>Instructions <em className="fm-opt">optional</em></>}>
            <TextArea rows={3} placeholder="What the examiner asks…" />
          </Form.Item>
          <div className="fm-grid2">
            <Form.Item name="prep_minutes" label="Preparation (min)">
              <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="duration_minutes" label="Duration (min)" rules={[{ required: true, message: 'Enter a duration' }]}>
              <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        </Form>
      </div>
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
    if (open) form.setFieldsValue({ title: editing?.title || '', subtitle: editing?.subtitle || '' });
  }, [open, editing, form]);
  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const resp = editing
        ? await apiCall(`/tcf/eo/points/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : await apiCall(`/tcf/eo/taches/${tacheId}/points`, { method: 'POST', body: JSON.stringify({ ...values, point_number: nextNumber }) });
      if (resp.ok) { message.success(editing ? 'Point saved' : 'Point added'); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The point could not be saved.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={editing ? 'Save' : 'Add point'} destroyOnHidden
      closable={false} title={null} width={440} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<AudioOutlined />} title={editing ? 'Edit point' : `Add point ${nextNumber}`} subtitle="Points à aborder guide the student's presentation." tone="eo" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Enter a title' }]}>
            <Input placeholder="e.g. Identité" maxLength={80} />
          </Form.Item>
          <Form.Item name="subtitle" label={<>Detail <em className="fm-opt">optional</em></>}>
            <Input placeholder="e.g. Nom, âge, ville" maxLength={120} />
          </Form.Item>
        </Form>
      </div>
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
      form.setFieldsValue({
        prompt_text: editing?.prompt_text || '',
        duration_seconds: editing?.duration_seconds ?? undefined,
        correction_text: editing?.correction_text || '',
      });
    }
  }, [open, editing, form]);
  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const resp = editing
        ? await apiCall(`/tcf/eo/sujets/${editing.id}`, { method: 'PUT', body: JSON.stringify(values) })
        : await apiCall(`/tcf/eo/taches/${tacheId}/sujets`, { method: 'POST', body: JSON.stringify({ ...values, sujet_number: nextNumber }) });
      if (resp.ok) { message.success(editing ? 'Sujet saved' : 'Sujet added'); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The sujet could not be saved.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={editing ? 'Save sujet' : 'Add sujet'} destroyOnHidden
      closable={false} title={null} width={600} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<AudioOutlined />} title={editing ? 'Edit sujet' : `Add sujet ${nextNumber}`} subtitle="One question the student answers out loud." tone="eo" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="prompt_text" label="Sujet" rules={[{ required: true, message: 'The sujet text is required' }]}>
            <TextArea rows={4} placeholder="The question as the student reads it…" />
          </Form.Item>
          <Form.Item name="duration_seconds" label={<>Speaking time (seconds) <em className="fm-opt">optional</em></>}>
            <InputNumber min={0} max={3600} step={30} style={{ width: '100%' }} placeholder="e.g. 210" />
          </Form.Item>
          <Form.Item name="correction_text" label={<>Model answer <em className="fm-opt">optional</em></>}>
            <TextArea rows={3} placeholder="Shown to students as the correction…" />
          </Form.Item>
        </Form>
      </div>
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

/** Shown when a list could not be loaded, so the screen is never blank with no way forward. */
const TreeError: React.FC<{ what: string; onRetry: () => void }> = ({ what, onRetry }) => (
  <div className="ea-state">
    <WarningOutlined />
    <strong>Couldn’t load the {what}</strong>
    <span>The server did not answer. Check your connection and try again.</span>
    <Button onClick={onRetry}>Retry</Button>
  </div>
);

const ModalHead: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; tone?: string }> = ({ icon, title, subtitle, tone }) => (
  <header className={`ea-head fm-head${tone ? ` fam-${tone}` : ''}`}>
    <span className="ea-head-ic fm-ic">{icon}</span>
    <div className="ea-head-text">
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </header>
);

const EeYearModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  categoryId: number | null;
  existing?: number[];
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, categoryId, existing = [], apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const thisYear = new Date().getFullYear();
  useEffect(() => { if (open) form.setFieldsValue({ year: thisYear }); }, [open, form, thisYear]);
  const submit = async () => {
    try {
      const { year } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/ee/categories/${categoryId}/years`, { method: 'POST', body: JSON.stringify({ year }) });
      if (resp.ok) { message.success(`${year} added`); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The year could not be added.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText="Add year" destroyOnHidden
      closable={false} title={null} width={420} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<CalendarOutlined />} title="Add a year" subtitle="Expression Écrite sessions are grouped by year, then by month." tone="ee" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="year" label="Year" rules={[{ required: true, message: 'Enter a year' }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
        <div className="fm-quick">
          {[thisYear - 1, thisYear, thisYear + 1].map(y => (
            <button key={y} type="button" disabled={existing.includes(y)} onClick={() => form.setFieldsValue({ year: y })}>
              {y}{existing.includes(y) ? ' · added' : ''}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const EeMonthModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  yearId: number | null;
  existing?: number[];
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, yearId, existing = [], apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) form.resetFields(); }, [open, form]);
  const submit = async () => {
    try {
      const { month } = await form.validateFields();
      setSaving(true);
      const resp = await apiCall(`/tcf/ee/years/${yearId}/months`, { method: 'POST', body: JSON.stringify({ month, month_name: FRENCH_MONTHS[month] }) });
      if (resp.ok) { message.success(`${FRENCH_MONTHS[month]} added`); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The month could not be added.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText="Add month" destroyOnHidden
      closable={false} title={null} width={460} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<CalendarOutlined />} title="Add a month" subtitle="Months already added are greyed out." tone="ee" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="month" label="Month" rules={[{ required: true, message: 'Choose a month' }]}>
            <Select placeholder="Choose a month" options={Object.entries(FRENCH_MONTHS).map(([num, name]) => ({
              value: parseInt(num, 10), label: `${num}. ${name}`, disabled: existing.includes(parseInt(num, 10)),
            }))} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

const EeCombinaisonModal: React.FC<{
  open: boolean; onClose: () => void; onSuccess: () => void;
  monthId: number | null; editing: EeCombinaison | null; nextNumber?: number;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, onSuccess, monthId, editing, nextNumber = 1, apiCall }) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) form.setFieldsValue({ name: editing?.name || `Combinaison ${nextNumber}` });
  }, [open, editing, nextNumber, form]);
  const submit = async () => {
    try {
      const { name } = await form.validateFields();
      setSaving(true);
      const resp = editing
        ? await apiCall(`/tcf/ee/combinaisons/${editing.id}`, { method: 'PUT', body: JSON.stringify({ name }) })
        : await apiCall(`/tcf/ee/months/${monthId}/combinaisons`, { method: 'POST', body: JSON.stringify({ name }) });
      if (resp.ok) { message.success(editing ? 'Combinaison renamed' : 'Combinaison added'); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The combinaison could not be saved.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };
  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={editing ? 'Save' : 'Add combinaison'} destroyOnHidden
      closable={false} title={null} width={460} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<FormOutlined />} title={editing ? 'Rename combinaison' : 'Add a combinaison'}
        subtitle={editing ? undefined : 'A combinaison holds the three writing tâches of one exam session.'} tone="ee" />
      <div className="fm-body">
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Enter a name' }]}>
            <Input placeholder="e.g. Combinaison 1" maxLength={80} />
          </Form.Item>
        </Form>
      </div>
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

  const submit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload: Record<string, unknown> = {
        prompt_text: values.prompt_text,
        correction_text: values.correction_text?.trim() || null,
      };
      if (taskNum === 3) {
        payload.question_text = values.question_text?.trim() || null;
        payload.argument_text_1 = values.argument_text_1?.trim() || null;
        payload.argument_text_2 = values.argument_text_2?.trim() || null;
      }
      if (!editing) {
        payload.task_number = taskNum;
        payload.task_type = defaults.type;
        payload.min_words = defaults.min;
        payload.max_words = defaults.max;
        payload.duration_minutes = defaults.dur;
      }
      const resp = editing
        ? await apiCall(`/tcf/ee/taches/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await apiCall(`/tcf/ee/combinaisons/${combinaisonId}/taches`, { method: 'POST', body: JSON.stringify(payload) });
      if (resp.ok) { message.success(editing ? 'Tâche saved' : 'Tâche added'); onSuccess(); }
      else { const d = await resp.json().catch(() => ({})); message.error(d.error || 'The tâche could not be saved.'); }
    } catch { /* validation */ } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onCancel={onClose} onOk={submit} confirmLoading={saving} okText={editing ? 'Save tâche' : 'Add tâche'}
      width={680} destroyOnHidden closable={false} title={null} wrapClassName="fm-modal" styles={{ body: { padding: 0 } }}>
      <ModalHead icon={<FormOutlined />} title={`${editing ? 'Edit' : 'Add'} tâche ${taskNum}`} subtitle={TASK_TYPE_LABELS[defaults.type]} tone="ee" />
      <div className="fm-body">
        <div className="fm-facts">
          <span><b>{defaults.min}–{defaults.max}</b> words</span>
          <span><b>{defaults.dur}</b> min</span>
          <span>{TASK_TYPE_LABELS[defaults.type]}</span>
        </div>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="prompt_text" label="Prompt" rules={[{ required: true, message: 'The prompt is required' }]}>
            <TextArea rows={4} placeholder="What the student is asked to write…" />
          </Form.Item>
          {taskNum === 3 && (
            <>
              <Form.Item name="question_text" label={<>Question <em className="fm-opt">optional</em></>}>
                <Input placeholder="e.g. L’uniforme scolaire : pour ou contre ?" />
              </Form.Item>
              <div className="fm-grid2">
                <Form.Item name="argument_text_1" label={<>Argument 1 <em className="fm-opt">optional</em></>}>
                  <TextArea rows={3} placeholder="First position…" />
                </Form.Item>
                <Form.Item name="argument_text_2" label={<>Argument 2 <em className="fm-opt">optional</em></>}>
                  <TextArea rows={3} placeholder="Opposing position…" />
                </Form.Item>
              </div>
            </>
          )}
          <Form.Item name="correction_text" label={<>Model answer <em className="fm-opt">optional</em></>}>
            <TextArea rows={4} placeholder="Shown to students as the correction…" />
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
  // ?results=<userId> (from the users page) opens that learner's exam results directly
  const resultsFor = Number(new URLSearchParams(window.location.search).get('results')) || undefined;
  const [view, setView] = useState<'categories' | 'series-list' | 'series-detail' | 'ee-years' | 'ee-months' | 'ee-combinaisons' | 'eo-years' | 'eo-months' | 'eo-parties' | 'eo-partie-detail' | 'student-results'>(resultsFor ? 'student-results' : 'categories');
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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [ceImportModalOpen, setCeImportModalOpen] = useState(false);
  const [examAssignModalOpen, setExamAssignModalOpen] = useState(false);
  const [grantCreditsModalOpen, setGrantCreditsModalOpen] = useState(false);
  const [coAnalyticsOpen, setCoAnalyticsOpen] = useState(false);
  const [examAssignTab, setExamAssignTab] = useState<'new' | 'list'>('new');
  const [assignGroups, setAssignGroups] = useState<ExamAssignmentGroup[] | null>(null);
  const [examAssignPreset, setExamAssignPreset] = useState<{ content_type: string; content_id: number }[]>([]);
  const [seriesSort, setSeriesSort] = useState<'number' | 'newest' | 'questions'>('number');
  const [sdQuery, setSdQuery] = useState('');
  const [sdLevel, setSdLevel] = useState<string>('all');
  const [sdOpenId, setSdOpenId] = useState<number | null>(null);
  const player = useSharedAudio();
  const openExamAssign = (tab: 'new' | 'list', preset: { content_type: string; content_id: number }[] = []) => {
    setExamAssignPreset(preset);
    setExamAssignTab(tab);
    setExamAssignModalOpen(true);
  };
  // Leaving a series (or switching to another) stops playback and resets its filters.
  const stopPlayer = player.stop;
  useEffect(() => { stopPlayer(); setSdOpenId(null); setSdQuery(''); setSdLevel('all'); }, [view, selectedSeriesId, stopPlayer]);

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



  // Assignment groups feed the landing KPIs and "Recent assignments".
  const fetchAssignGroups = useCallback(async () => {
    try {
      const resp = await apiCall('/tcf/exam-assignments');
      if (resp.ok) {
        const d = await resp.json();
        setAssignGroups(Array.isArray(d) ? d : []);
      }
    } catch { /* KPIs stay empty */ }
  }, [apiCall]);
  useEffect(() => { if (view === 'categories') fetchAssignGroups(); }, [view, fetchAssignGroups]);





  // ── List loading ──
  // Every list on this page (skills, series, the open series, and the EE / EO trees) is tracked here.
  // 'key' is the parent a request was made for; 'dataKey' is the parent the data currently in state
  // belongs to. That distinction tells a first load from a background refresh:
  //   data for this parent → show it, even while refreshing (no skeleton flash)
  //   otherwise, request failed → retry card
  //   otherwise → skeleton, so a screen can never show "empty" for data it does not have.
  type ListView = 'skeleton' | 'error' | 'data';
  type ListEntry = { key: number; status: 'loading' | 'ready' | 'error'; dataKey: number | null };
  const [treeState, setTreeState] = useState<Record<string, ListEntry>>({});
  const [combQuery, setCombQuery] = useState('');
  const [partieQuery, setPartieQuery] = useState('');
  const treeReq = useRef<Record<string, number>>({});

  const treeViewOf = (kind: string, parent: number | null): ListView => {
    if (parent == null) return 'skeleton';
    const entry = treeState[kind];
    if (entry?.dataKey === parent) return 'data';
    if (entry?.key === parent && entry.status === 'error') return 'error';
    return 'skeleton';
  };
  /** Makes the next visit reload that list — used after a change alters a parent's counts. */
  const invalidateTree = (kind: string) => setTreeState(s => { const next = { ...s }; delete next[kind]; return next; });

  /** Runs one request, ignoring answers a newer request has superseded. */
  const runTreeFetch = useCallback(async (kind: string, parent: number, url: string, apply: (data: unknown) => void, failMessage: string) => {
    const id = (treeReq.current[kind] = (treeReq.current[kind] || 0) + 1);
    setTreeState(s => ({ ...s, [kind]: { key: parent, status: 'loading', dataKey: s[kind]?.dataKey ?? null } }));
    setLoading(true);
    try {
      const resp = await apiCall(url);
      if (id !== treeReq.current[kind]) return;
      if (!resp.ok) throw new Error(String(resp.status));
      apply(await resp.json());
      setTreeState(s => ({ ...s, [kind]: { key: parent, status: 'ready', dataKey: parent } }));
    } catch {
      if (id === treeReq.current[kind]) {
        setTreeState(s => ({ ...s, [kind]: { key: parent, status: 'error', dataKey: s[kind]?.dataKey ?? null } }));
        message.error(failMessage);
      }
    } finally {
      if (id === treeReq.current[kind]) setLoading(false);
    }
  }, [apiCall]);

  const fetchCategories = useCallback(async () => {
    await runTreeFetch('categories', 0, '/tcf/categories',
      d => setCategories(Array.isArray(d) ? d as Category[] : []), 'Could not load the skills.');
  }, [runTreeFetch]);

  const fetchSeriesList = useCallback(async () => {
    const id = selectedCategoryId;
    if (!id) return;
    await runTreeFetch('series', id, `${getApiPrefix(categoryType)}/categories/${id}/series`,
      d => setSeriesList(Array.isArray(d) ? d as Series[] : []), 'Could not load the series.');
  }, [runTreeFetch, selectedCategoryId, categoryType]);

  const fetchSeriesDetail = useCallback(async () => {
    const id = selectedSeriesId;
    if (!id) return;
    await runTreeFetch('series-detail', id, `${getApiPrefix(categoryType)}/series/${id}`,
      d => {
        const data = d as SeriesDetail & { cefr_thresholds: unknown };
        if (typeof data.cefr_thresholds === 'string') data.cefr_thresholds = JSON.parse(data.cefr_thresholds);
        setSeriesDetail(data as SeriesDetail);
      }, 'Could not load the series.');
  }, [runTreeFetch, selectedSeriesId, categoryType]);

  const fetchEeYears = useCallback(async () => {
    const id = selectedCategoryId;
    if (!id) return;
    await runTreeFetch('ee-years', id, `/tcf/ee/categories/${id}/years`,
      d => setEeYears(Array.isArray(d) ? d as EeYear[] : []), 'Could not load the years.');
  }, [runTreeFetch, selectedCategoryId]);

  const fetchEeMonths = useCallback(async () => {
    const id = selectedEeYearId;
    if (!id) return;
    await runTreeFetch('ee-months', id, `/tcf/ee/years/${id}/months`,
      d => setEeMonths(Array.isArray(d) ? d as EeMonth[] : []), 'Could not load the months.');
  }, [runTreeFetch, selectedEeYearId]);

  const fetchEeCombinaisons = useCallback(async () => {
    const id = selectedEeMonthId;
    if (!id) return;
    await runTreeFetch('ee-combs', id, `/tcf/ee/months/${id}/combinaisons`,
      d => setEeCombinaisons(Array.isArray(d) ? d as EeCombinaison[] : []), 'Could not load the combinaisons.');
  }, [runTreeFetch, selectedEeMonthId]);

  const fetchEoYears = useCallback(async () => {
    const id = selectedCategoryId;
    if (!id) return;
    await runTreeFetch('eo-years', id, `/tcf/eo/categories/${id}/years`,
      d => setEoYears(Array.isArray(d) ? d as EoYear[] : []), 'Could not load the years.');
  }, [runTreeFetch, selectedCategoryId]);

  const fetchEoMonths = useCallback(async () => {
    const id = selectedEoYearId;
    if (!id) return;
    await runTreeFetch('eo-months', id, `/tcf/eo/years/${id}/months`,
      d => setEoMonths(Array.isArray(d) ? d as EoMonth[] : []), 'Could not load the months.');
  }, [runTreeFetch, selectedEoYearId]);

  const fetchEoParties = useCallback(async () => {
    const id = selectedEoMonthId;
    if (!id) return;
    await runTreeFetch('eo-parties', id, `/tcf/eo/months/${id}/parties`,
      d => setEoParties(Array.isArray(d) ? d as EoPartie[] : []), 'Could not load the parties.');
  }, [runTreeFetch, selectedEoMonthId]);

  // The skills, the series list and the open series refresh on every visit: their counts change
  // as content is edited deeper in the tree. Cached data stays on screen while they refresh.
  useEffect(() => {
    if (view === 'categories') fetchCategories();
  }, [view, fetchCategories]);

  useEffect(() => {
    if (view === 'series-list' && selectedCategoryId) fetchSeriesList();
  }, [view, selectedCategoryId, fetchSeriesList]);

  useEffect(() => {
    if (view === 'series-detail' && selectedSeriesId) fetchSeriesDetail();
  }, [view, selectedSeriesId, fetchSeriesDetail]);

  // The tree levels load once per parent: a 'loading' entry is written before the request goes out,
  // so these never fire twice, and returning to a level you already opened is instant.
  useEffect(() => {
    if (view === 'ee-years' && selectedCategoryId && treeState['ee-years']?.key !== selectedCategoryId) fetchEeYears();
  }, [view, selectedCategoryId, treeState, fetchEeYears]);

  useEffect(() => {
    if (view === 'ee-months' && selectedEeYearId && treeState['ee-months']?.key !== selectedEeYearId) fetchEeMonths();
  }, [view, selectedEeYearId, treeState, fetchEeMonths]);

  useEffect(() => {
    if (view === 'ee-combinaisons' && selectedEeMonthId && treeState['ee-combs']?.key !== selectedEeMonthId) fetchEeCombinaisons();
  }, [view, selectedEeMonthId, treeState, fetchEeCombinaisons]);

  useEffect(() => {
    if (view === 'eo-years' && selectedCategoryId && treeState['eo-years']?.key !== selectedCategoryId) fetchEoYears();
  }, [view, selectedCategoryId, treeState, fetchEoYears]);

  useEffect(() => {
    if (view === 'eo-months' && selectedEoYearId && treeState['eo-months']?.key !== selectedEoYearId) fetchEoMonths();
  }, [view, selectedEoYearId, treeState, fetchEoMonths]);

  useEffect(() => {
    // Opening one partie does not re-load the whole month.
    if ((view === 'eo-parties' || view === 'eo-partie-detail') && selectedEoMonthId && treeState['eo-parties']?.key !== selectedEoMonthId) fetchEoParties();
  }, [view, selectedEoMonthId, treeState, fetchEoParties]);

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
    // The lists are kept: each one is validated against the parent it was loaded for, so a
    // list belonging to another skill renders a skeleton and reloads instead of showing stale rows.
    setSelectedEeYearId(null); setSelectedEeYear(null); setSelectedEeMonthId(null); setSelectedEeMonthName('');
    setSelectedEoYearId(null); setSelectedEoYear(null); setSelectedEoMonthId(null); setSelectedEoMonthName('');
    setViewingCombinaison(null); setViewingPartie(null);
    setCombQuery(''); setPartieQuery('');
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
      setCorrectionVisible({});
      setView('ee-months');
    } else if (view === 'ee-months') {
      setSelectedEeYearId(null);
      setSelectedEeYear(null);
      setView('ee-years');
    } else if (view === 'ee-years') {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
      setCategoryType('ce');
      setView('categories');
    } else if (view === 'eo-partie-detail') {
      setViewingPartie(null);
      setEoCorrectionVisible({});
      setView('eo-parties');
    } else if (view === 'eo-parties') {
      setSelectedEoMonthId(null);
      setSelectedEoMonthName('');
      setView('eo-months');
    } else if (view === 'eo-months') {
      setSelectedEoYearId(null);
      setSelectedEoYear(null);
      setView('eo-years');
    } else if (view === 'eo-years') {
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
      setCategoryType('ce');
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

  // Swap two neighbouring questions on screen right away, then save only those two rows.
  const handleMoveQuestion = async (questionId: number, direction: 'up' | 'down') => {
    if (!seriesDetail) return;
    const questions = [...seriesDetail.questions].sort((a, b) => a.question_order - b.question_order);
    const idx = questions.findIndex(q => q.id === questionId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= questions.length) return;
    const a = questions[idx];
    const b = questions[swapIdx];
    const previous = seriesDetail;
    setSeriesDetail({
      ...seriesDetail,
      questions: questions
        .map(q => (q.id === a.id ? { ...q, question_order: b.question_order } : q.id === b.id ? { ...q, question_order: a.question_order } : q))
        .sort((x, y) => x.question_order - y.question_order),
    });
    try {
      const prefix = getApiPrefix(categoryType);
      const resp = await apiCall(`${prefix}/series/${seriesDetail.id}/questions/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ questions: [{ id: a.id, question_order: b.question_order }, { id: b.id, question_order: a.question_order }] }),
      });
      if (!resp.ok) throw new Error();
    } catch {
      setSeriesDetail(previous);
      message.error('The new order could not be saved.');
    }
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
    const groups = assignGroups || [];
    const active = groups.filter(g => !g.is_expired);
    const now = Date.now();
    const expiringSoon = active.filter(g => g.expires_at && new Date(g.expires_at).getTime() - now < 7 * 86_400_000).length;
    const reached = new Set(active.flatMap(g => g.recipients.map(r => r.key)));
    const studentsReached = Array.from(reached).filter(k => k.startsWith('student:')).length;
    const batchesReached = reached.size - studentsReached;
    const contentTotal = categories.reduce((t, c) => t + (Number(c.series_count) || 0), 0);
    const activeFor = (fam: string) => active.filter(g => g.items.some(i => (i.content_type === 'category' ? familyOfCategory(i.content_name) : i.content_type.slice(0, 2)) === fam)).length;
    const openAssign = (tab: 'new' | 'list') => openExamAssign(tab);
    const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const createCategory = () => { setEditingCategory(null); setCategoryModalOpen(true); };

    const listView = treeViewOf('categories', 0);
    if (listView === 'error' && categories.length === 0) {
      return <div className="ep"><TreeError what="skills" onRetry={fetchCategories} /></div>;
    }
    if (listView === 'skeleton' && categories.length === 0) {
      return (
        <div className="ep" aria-busy="true">
          <div className="ep-header"><div><Skeleton.Input active size="small" style={{ width: 150, height: 12 }} /><div style={{ marginTop: 10 }}><Skeleton.Input active style={{ width: 260, height: 26 }} /></div></div></div>
          <div className="ep-kpis">{[0, 1, 2, 3].map(i => <div key={i} className="ep-kpi"><Skeleton active avatar={{ shape: 'square' }} title={false} paragraph={{ rows: 2 }} /></div>)}</div>
          <div className="ep-cats">{[0, 1, 2, 3].map(i => <div key={i} className="ep-cat"><Skeleton active paragraph={{ rows: 4 }} /></div>)}</div>
        </div>
      );
    }

    return (
      <div className="ep">
        {/* ── Header ── */}
        <header className="ep-header">
          <div>
            <div className="ep-overline">Admin console · Exam preparation</div>
            <h1 className="ep-title">TCF Canada preparation</h1>
            <p className="ep-subtitle">Build practice content for the four TCF skills, give students access to it, and follow their results.</p>
          </div>
          <div className="ep-actions">
            <Button icon={<BarChartOutlined />} onClick={() => setView('student-results')}>Student results</Button>
            <Button icon={<ThunderboltOutlined />} onClick={() => setGrantCreditsModalOpen(true)}>AI credits</Button>
            <Button type="primary" icon={<SendOutlined />} onClick={() => openAssign('new')}>Assign content</Button>
          </div>
        </header>

        {/* ── KPIs ── */}
        <section className="ep-kpis" aria-label="Overview">
          <button type="button" className="ep-kpi" onClick={() => openAssign('list')}>
            <span className="ep-kpi-ic"><SendOutlined /></span>
            <span className="ep-kpi-text"><span>Active assignments</span><strong>{assignGroups ? active.length : '–'}</strong><em>{assignGroups ? `${groups.length - active.length} expired · manage all` : 'Loading…'}</em></span>
          </button>
          <div className="ep-kpi is-green">
            <span className="ep-kpi-ic"><TeamOutlined /></span>
            <span className="ep-kpi-text"><span>Students with access</span><strong>{assignGroups ? studentsReached : '–'}</strong><em>{assignGroups ? `+ ${batchesReached} ${batchesReached === 1 ? 'batch' : 'batches'}` : 'Loading…'}</em></span>
          </div>
          <div className="ep-kpi is-amber">
            <span className="ep-kpi-ic"><ClockCircleOutlined /></span>
            <span className="ep-kpi-text"><span>Ending this week</span><strong>{assignGroups ? expiringSoon : '–'}</strong><em>assignments that lock within 7 days</em></span>
          </div>
          <div className="ep-kpi is-slate">
            <span className="ep-kpi-ic"><AppstoreOutlined /></span>
            <span className="ep-kpi-text"><span>Practice content</span><strong>{contentTotal}</strong><em>series and years across {categories.length} {categories.length === 1 ? 'skill' : 'skills'}</em></span>
          </div>
        </section>

        {/* ── Skills ── */}
        <div className="ep-section-head">
          <div>
            <h2>Skills</h2>
            <p>Open a skill to manage its series, years, months and tasks.</p>
          </div>
          <Button type="text" icon={<PlusOutlined />} onClick={createCategory}>New category</Button>
        </div>

        {categories.length === 0 ? (
          <div className="ep-card">
            <div className="ea-state">
              <BookOutlined />
              <strong>No categories yet</strong>
              <span>Create the first TCF skill to start building practice content.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={createCategory}>Create category</Button>
            </div>
          </div>
        ) : (
          <div className="ep-cats">
            {categories.map(cat => {
              const fam = familyOfCategory(cat.name);
              const implemented = IMPLEMENTED_CATEGORIES.includes(cat.name);
              const primary = Number(cat.series_count) || 0;
              const isYears = fam === 'ee' || fam === 'eo';
              const secondary = isYears ? Number(cat.sub_count) || 0 : Number(cat.question_count) || 0;
              const secondaryLabel = fam === 'ee' ? 'combinaisons' : fam === 'eo' ? 'parties' : 'questions';
              const liveFor = activeFor(fam);
              const open = () => implemented && navigateToSeriesList(cat);
              return (
                <article key={cat.id} className={`ep-cat fam-${fam}${implemented ? '' : ' is-soon'}`} role="button" tabIndex={0}
                  onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }} aria-label={`Open ${cat.name}`}>
                  <div className="ep-cat-top">
                    <span className="ep-cat-ic">{ICON_MAP[cat.icon || ''] || <BookOutlined />}</span>
                    <span className="ep-cat-code">{FAMILY_CODE[fam]}</span>
                    <span className="ep-cat-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                      <Dropdown trigger={['click']} menu={{
                        items: [
                          { key: 'edit', icon: <EditOutlined />, label: 'Edit details', onClick: () => { setEditingCategory(cat); setCategoryModalOpen(true); } },
                          ...(fam === 'co' ? [{ key: 'analytics', icon: <BarChartOutlined />, label: 'Listening analytics', onClick: () => setCoAnalyticsOpen(true) }] : []),
                          { type: 'divider' as const },
                          {
                            key: 'delete', icon: <DeleteOutlined />, label: 'Delete category', danger: true,
                            onClick: () => Modal.confirm({
                              title: `Delete “${cat.name}”?`,
                              content: 'Every series, year, question and assignment inside it is deleted too. This can’t be undone.',
                              okText: 'Delete category', okButtonProps: { danger: true },
                              onOk: () => handleDeleteCategory(cat.id),
                            }),
                          },
                        ],
                      }}>
                        <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${cat.name}`} />
                      </Dropdown>
                    </span>
                  </div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description || 'No description yet.'}</p>
                  <div className="ep-cat-stats">
                    <div><strong>{primary}</strong><span>{isYears ? (primary === 1 ? 'year' : 'years') : 'series'}</span></div>
                    <div><strong>{secondary.toLocaleString('en-US')}</strong><span>{secondaryLabel}</span></div>
                  </div>
                  <div className="ep-cat-foot">
                    {implemented ? <span className="ep-open">Open <RightOutlined /></span> : <span className="ep-soon">Coming soon</span>}
                    {assignGroups && <span className="ep-cat-reach">{liveFor ? `${liveFor} active ${liveFor === 1 ? 'assignment' : 'assignments'}` : 'Not assigned'}</span>}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── Recent assignments ── */}
        <section className="ep-card">
          <div className="ep-card-head">
            <span className="ep-card-title"><span className="ep-card-ic"><SendOutlined /></span>Recent assignments</span>
            <button type="button" className="ep-link" onClick={() => openAssign('list')}>Manage all</button>
          </div>
          {!assignGroups ? (
            <div style={{ padding: 16 }}><Skeleton active title={false} paragraph={{ rows: 3 }} /></div>
          ) : groups.length === 0 ? (
            <div className="ep-empty-line">Nothing assigned yet — use “Assign content” to give students access.</div>
          ) : (
            <ul className="ep-recent">
              {groups.slice(0, 6).map(g => (
                <li key={g.group_id}>
                  <span className="ep-recent-name">
                    <strong title={g.group_name}>{g.group_name}</strong>
                    <em>{g.items.length} {g.items.length === 1 ? 'item' : 'items'} · assigned {shortDate(g.assigned_at)}{g.expires_at ? ` · until ${shortDate(g.expires_at)}` : ''}</em>
                  </span>
                  <span className="ep-recent-who">
                    {g.recipients[0]?.type === 'batch' ? <TeamOutlined /> : <UserOutlined />}
                    {g.recipients.slice(0, 2).map(r => r.name).join(', ')}{g.recipients.length > 2 ? ` +${g.recipients.length - 2}` : ''}
                  </span>
                  <span className={`ea-pill ${g.is_expired ? 'is-expired' : 'is-active'}`}>{g.is_expired ? 'Expired' : 'Active'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════
  // RENDER: Series List View
  // ════════════════════════════════════════════════════════════
  const renderSeriesListView = () => {
    const fam = familyOfCategory(selectedCategoryName);
    const isCo = categoryType === 'co';
    const createSeries = () => { setEditingSeries(null); setSeriesModalOpen(true); };

    const listView = treeViewOf('series', selectedCategoryId);
    if (listView === 'error') {
      return <div className="ep"><TreeError what="series" onRetry={fetchSeriesList} /></div>;
    }
    if (listView === 'skeleton') {
      return (
        <div className="ep" aria-busy="true">
          <Skeleton.Input active size="small" style={{ width: 240, height: 14 }} />
          <div className="ep-header"><Skeleton.Input active style={{ width: 300, height: 30 }} /></div>
          <div className="ep-card" style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 8 }} /></div>
        </div>
      );
    }

    const numOf = (name: string) => parseInt((name.match(/\d+/) || ['0'])[0], 10);
    const qCount = (s: Series) => Number(s.total_questions) || 0;
    // "Typical" size of a series = the most common question count; smaller series are flagged.
    const freq = new Map<number, number>();
    seriesList.forEach(s => { const c = qCount(s); if (c) freq.set(c, (freq.get(c) || 0) + 1); });
    const typical = Array.from(freq.entries()).sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] || 0;
    const short = seriesList.filter(s => typical > 0 && qCount(s) < typical);
    const shortIds = new Set(short.map(s => s.id));
    const totalQuestions = seriesList.reduce((t, s) => t + qCount(s), 0);
    const withIntro = seriesList.filter(s => s.intro_audio_kdrive_file_id).length;
    const sorted = [...filteredSeries].sort((a, b) =>
      seriesSort === 'newest' ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : seriesSort === 'questions' ? qCount(a) - qCount(b) || numOf(a.name) - numOf(b.name)
          : numOf(a.name) - numOf(b.name) || a.name.localeCompare(b.name));
    const seriesType = isCo ? 'co_series' : 'ce_series';

    return (
      <div className={`ep fam-${fam}`}>
        <nav className="ep-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={navigateBack}>Exam preparation</button>
          <RightOutlined />
          <span>{selectedCategoryName}</span>
        </nav>

        <header className="ep-header">
          <div className="sl-title">
            <button type="button" className="ep-back" onClick={navigateBack} aria-label="Back to exam preparation"><ArrowLeftOutlined /></button>
            <span className="ep-cat-ic">{isCo ? <SoundOutlined /> : <ReadOutlined />}</span>
            <div>
              <h1 className="ep-title">{selectedCategoryName}</h1>
              <p className="ep-subtitle">
                {seriesList.length} {seriesList.length === 1 ? 'series' : 'series'} · {totalQuestions.toLocaleString('en-US')} questions
                {isCo ? ` · ${withIntro} with intro audio` : ''}
              </p>
            </div>
          </div>
          <div className="ep-actions">
            {isCo && <Button icon={<FolderOpenOutlined />} onClick={() => setImportModalOpen(true)}>Import from folder</Button>}
            {categoryType === 'ce' && <Button icon={<UploadOutlined />} onClick={() => setCeImportModalOpen(true)}>Import JSON</Button>}
            <Button type="primary" icon={<PlusOutlined />} onClick={createSeries}>New series</Button>
          </div>
        </header>

        {short.length > 0 && (
          <div className="sl-alert" role="note">
            <WarningOutlined />
            <span>
              <strong>{short.length} {short.length === 1 ? 'series has' : 'series have'} fewer than {typical} questions</strong>
              {' — '}{short.slice(0, 6).map(s => `${s.name} (${qCount(s)})`).join(', ')}{short.length > 6 ? '…' : ''}
            </span>
          </div>
        )}

        <section className="ep-card">
          <div className="sl-toolbar">
            <Input allowClear prefix={<SearchOutlined />} placeholder="Search series" value={searchText} onChange={e => setSearchText(e.target.value)} />
            <Select value={seriesSort} onChange={setSeriesSort} aria-label="Sort series" options={[
              { value: 'number', label: 'By number' },
              { value: 'newest', label: 'Newest first' },
              { value: 'questions', label: 'Fewest questions' },
            ]} />
            <span className="sl-legend" aria-hidden>
              {CEFR_LEVELS.map(l => <span key={l}><i style={{ background: CEFR_COLORS[l] }} />{l}</span>)}
            </span>
          </div>

          {sorted.length === 0 ? (
            <div className="ea-state">
              <FileTextOutlined />
              <strong>{searchText ? 'No series match your search' : 'No series yet'}</strong>
              <span>{searchText ? 'Try another name or number.' : 'Create the first series, then add its questions.'}</span>
              {!searchText && <Button type="primary" icon={<PlusOutlined />} onClick={createSeries}>New series</Button>}
            </div>
          ) : (
            <div className="sl-grid">
              {sorted.map(s => {
                const dist = s.cefr_distribution || ({} as CefrDistribution);
                const num = numOf(s.name);
                const warn = shortIds.has(s.id);
                return (
                  <article key={s.id} className={`sl-card${warn ? ' is-warn' : ''}`} role="button" tabIndex={0}
                    onClick={() => navigateToSeriesDetail(s)} onKeyDown={e => { if (e.key === 'Enter') navigateToSeriesDetail(s); }}>
                    <div className="sl-card-top">
                      <span className="sl-num">{num || '–'}</span>
                      <span className="sl-card-name">
                        <strong title={s.name}>
                          {s.name}
                          {isCo && s.intro_audio_kdrive_file_id && <Tooltip title="Has an introduction audio"><CustomerServiceOutlined /></Tooltip>}
                        </strong>
                        <em><b>{qCount(s)}</b> questions · <b>{s.total_points}</b> pts · <b>{s.duration_minutes}</b> min</em>
                      </span>
                      {warn && <span className="sl-warn-tag">Short</span>}
                      <span onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            { key: 'edit', icon: <EditOutlined />, label: 'Edit details', onClick: () => { setEditingSeries(s); setSeriesModalOpen(true); } },
                            { key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => openExamAssign('new', [{ content_type: seriesType, content_id: s.id }]) },
                            { type: 'divider' },
                            {
                              key: 'delete', icon: <DeleteOutlined />, label: 'Delete series', danger: true,
                              onClick: () => Modal.confirm({
                                title: `Delete “${s.name}”?`,
                                content: `Its ${qCount(s)} questions${isCo ? ' and their audio files' : ''} are deleted too. This can’t be undone.`,
                                okText: 'Delete series', okButtonProps: { danger: true },
                                onOk: () => handleDeleteSeries(s.id),
                              }),
                            },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${s.name}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="sl-cefr" title={CEFR_LEVELS.map(l => `${l}: ${dist[l] || 0}`).join(' · ')}>
                      {CEFR_LEVELS.map(l => (dist[l] ? <span key={l} style={{ flex: dist[l], background: CEFR_COLORS[l] }} /> : null))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════
  // RENDER: Series Detail View
  // ════════════════════════════════════════════════════════════
  const renderSeriesDetailView = () => {
    // Skeleton only while a different (or no) series is loaded — refreshes after edits keep the page in place.
    const detailView = treeViewOf('series-detail', selectedSeriesId);
    if (detailView === 'error' && (!seriesDetail || seriesDetail.id !== selectedSeriesId)) {
      return <div className="ep"><TreeError what="series" onRetry={fetchSeriesDetail} /></div>;
    }
    if (!seriesDetail || seriesDetail.id !== selectedSeriesId) {
      return (
        <div className="ep" aria-busy="true">
          <Skeleton.Input active size="small" style={{ width: 300, height: 14 }} />
          <div className="ep-header"><Skeleton.Input active style={{ width: 260, height: 30 }} /></div>
          <div className="sd-stats">{[0, 1, 2, 3].map(i => <div key={i} className="sd-stat"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
          <div className="ep-card" style={{ padding: 16 }}><Skeleton active paragraph={{ rows: 10 }} /></div>
        </div>
      );
    }

    const d = seriesDetail;
    const fam = familyOfCategory(selectedCategoryName);
    const isCo = categoryType === 'co';
    const thresholds: Partial<CefrThresholds> = (typeof d.cefr_thresholds === 'string' ? JSON.parse(d.cefr_thresholds) : d.cefr_thresholds) || {};
    const questions = [...(d.questions || [])].sort((a, b) => a.question_order - b.question_order);
    const dist: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
    questions.forEach(x => { if (x.cefr_level in dist) dist[x.cefr_level] += 1; });
    const totalPoints = questions.reduce((t, x) => t + (Number(x.points) || 0), 0);
    const missingAudio = isCo ? questions.filter(x => !x.audio_kdrive_file_id).length : 0;
    const needle = sdQuery.trim().toLowerCase();
    const shown = questions.filter(x => (sdLevel === 'all' || x.cefr_level === sdLevel)
      && (!needle || `${x.question_text} ${x.option_a} ${x.option_b} ${x.option_c} ${x.option_d}`.toLowerCase().includes(needle)));
    const reorderable = !needle && sdLevel === 'all';
    const pos = filteredSeries.findIndex(s => s.id === d.id);
    const prev = pos > 0 ? filteredSeries[pos - 1] : null;
    const next = pos >= 0 && pos < filteredSeries.length - 1 ? filteredSeries[pos + 1] : null;
    const withToken = (url: string) => `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
    const imageOf = (x: Question) => (isCo
      ? (x.image_kdrive_file_id ? withToken(`${API_BASE}/tcf/co/questions/${x.id}/image`) : null)
      : (x.image_url ? withToken(x.image_url) : null));
    const toRoot = () => { setSelectedSeriesId(null); setSeriesDetail(null); setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setView('categories'); };
    const secsPerQuestion = questions.length ? Math.round((d.duration_minutes * 60) / questions.length) : 0;
    const seriesType = isCo ? 'co_series' : 'ce_series';
    const rowClass = `sd-row${isCo ? ' has-audio' : ''}`;

    return (
      <div className={`ep fam-${fam}`}>
        <nav className="ep-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={toRoot}>Exam preparation</button>
          <RightOutlined />
          <button type="button" onClick={navigateBack}>{selectedCategoryName}</button>
          <RightOutlined />
          <span>{d.name}</span>
        </nav>

        <header className="ep-header">
          <div className="sl-title">
            <button type="button" className="ep-back" onClick={navigateBack} aria-label={`Back to ${selectedCategoryName}`}><ArrowLeftOutlined /></button>
            <div>
              <h1 className="ep-title">{d.name}</h1>
              {d.description && <p className="ep-subtitle sd-desc" title={d.description}>{d.description}</p>}
            </div>
          </div>
          <div className="ep-actions">
            {filteredSeries.length > 1 && (
              <span className="sd-pager">
                <Tooltip title={prev ? `Previous: ${prev.name}` : 'First series'}><Button icon={<ArrowLeftOutlined />} disabled={!prev} onClick={() => prev && navigateToSeriesDetail(prev)} aria-label="Previous series" /></Tooltip>
                <Tooltip title={next ? `Next: ${next.name}` : 'Last series'}><Button icon={<ArrowRightOutlined />} disabled={!next} onClick={() => next && navigateToSeriesDetail(next)} aria-label="Next series" /></Tooltip>
              </span>
            )}
            <Button icon={<EditOutlined />} onClick={() => { setEditingSeries(d); setSeriesModalOpen(true); }}>Edit series</Button>
            <Button icon={<SendOutlined />} onClick={() => openExamAssign('new', [{ content_type: seriesType, content_id: d.id }])}>Assign</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}>Add question</Button>
          </div>
        </header>

        <section className="sd-stats" aria-label="Series summary">
          <div className="sd-stat">
            <span>Questions</span>
            <strong>{questions.length}</strong>
            {missingAudio ? <em className="is-warn">{missingAudio} without audio</em> : <em>{isCo ? 'all with audio' : 'multiple choice'}</em>}
          </div>
          <div className="sd-stat">
            <span>Points</span>
            <strong>{totalPoints}</strong>
            <em>maximum score</em>
          </div>
          <div className="sd-stat">
            <span>Duration</span>
            <strong>{d.duration_minutes} min</strong>
            <em>{secsPerQuestion ? `≈ ${secsPerQuestion} s per question` : '—'}</em>
          </div>
          <div className="sd-stat">
            <span>Level mix · points needed</span>
            <div className="sd-cefr-bar" aria-hidden>
              {CEFR_LEVELS.map(l => (dist[l] ? <span key={l} style={{ flex: dist[l], background: CEFR_COLORS[l] }} /> : null))}
            </div>
            <div className="sd-cefr-legend">
              {CEFR_LEVELS.map(l => (
                <span key={l}>
                  <b><i style={{ background: CEFR_COLORS[l] }} />{l} · {dist[l]}</b>
                  {thresholds[l] != null ? `≥ ${thresholds[l]} pts` : '—'}
                </span>
              ))}
            </div>
          </div>
        </section>

        {isCo && d.intro_audio_kdrive_file_id && (
          <div className="sd-intro">
            <CustomerServiceOutlined />
            <div><strong>Introduction audio</strong><em title={d.intro_audio_file_name || ''}>{d.intro_audio_file_name || 'Played before question 1'}</em></div>
            <audio controls preload="none" src={withToken(`${API_BASE}/tcf/co/series/${d.id}/intro-audio`)} />
          </div>
        )}

        <section className="ep-card">
          <div className="sd-toolbar">
            <strong>Questions <em>{shown.length === questions.length ? questions.length : `${shown.length} / ${questions.length}`}</em></strong>
            <div className="sd-levels" role="tablist" aria-label="Filter by level">
              <button type="button" className={sdLevel === 'all' ? 'is-on' : ''} onClick={() => setSdLevel('all')}>All</button>
              {CEFR_LEVELS.map(l => (
                <button key={l} type="button" disabled={!dist[l]} className={sdLevel === l ? 'is-on' : ''}
                  style={{ '--c': CEFR_COLORS[l] } as React.CSSProperties} onClick={() => setSdLevel(sdLevel === l ? 'all' : l)}>
                  {l}<em>{dist[l]}</em>
                </button>
              ))}
            </div>
            <Input allowClear prefix={<SearchOutlined />} placeholder="Search questions and answers" value={sdQuery} onChange={e => setSdQuery(e.target.value)} />
          </div>
          {!reorderable && questions.length > 1 && <div className="sd-note">Clear the search and level filter to reorder questions.</div>}

          {questions.length === 0 ? (
            <div className="ea-state">
              <QuestionCircleOutlined />
              <strong>No questions yet</strong>
              <span>Add the first question of this series.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingQuestion(null); setQuestionModalOpen(true); }}>Add question</Button>
            </div>
          ) : shown.length === 0 ? (
            <div className="ea-state"><SearchOutlined /><strong>No question matches</strong><span>Try another word or level.</span></div>
          ) : (
            <>
              <div className={`${rowClass} sd-head`} aria-hidden>
                <span>#</span>{isCo && <span>Audio</span>}<span>Question</span><span className="sd-col-level">Level</span><span className="sd-col-pts">Points</span><span className="sd-col-ans">Answer</span><span />
              </div>
              <ol className="sd-list">
                {shown.map(x => {
                  const open = sdOpenId === x.id;
                  const img = open ? imageOf(x) : null;
                  const hasImg = isCo ? !!x.image_kdrive_file_id : !!x.image_url;
                  const idx = questions.indexOf(x);
                  const key = `q${x.id}`;
                  const active = player.current === key;
                  const opts: Record<'A' | 'B' | 'C' | 'D', string> = { A: x.option_a, B: x.option_b, C: x.option_c, D: x.option_d };
                  const toggleOpen = () => setSdOpenId(open ? null : x.id);
                  return (
                    <li key={x.id} className={`sd-q${open ? ' is-open' : ''}`}>
                      <div className={rowClass} role="button" tabIndex={0} aria-expanded={open} onClick={toggleOpen}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOpen(); } }}>
                        <span className="sd-num">{x.question_order}</span>
                        {isCo && (
                          <span onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                            {x.audio_kdrive_file_id ? (
                              <>
                                <AudioPlayButton status={active ? player.status : 'idle'} progress={active ? player.progress : 0} label={`question ${x.question_order}`}
                                  onClick={() => player.toggle(key, withToken(`${API_BASE}/tcf/co/questions/${x.id}/audio`))} />
                                {active && player.time.total > 0 && <span className="sd-clock">{fmtClock(player.time.total - player.time.at)}</span>}
                              </>
                            ) : (
                              <Tooltip title="This question has no audio"><span className="sd-noaudio"><WarningOutlined /></span></Tooltip>
                            )}
                          </span>
                        )}
                        <span className="sd-text">
                          <span><span title={x.question_text}>{x.question_text}</span>{hasImg && <PictureOutlined aria-label="Has an image" />}</span>
                          <span className="sd-meta">{x.cefr_level} · {x.points} pts · answer {x.correct_answer}</span>
                        </span>
                        <span className="sd-col-level"><span className="sd-level" style={{ '--c': CEFR_COLORS[x.cefr_level] || '#64748b' } as React.CSSProperties}>{x.cefr_level}</span></span>
                        <span className="sd-pts sd-col-pts">{x.points}</span>
                        <span className="sd-col-ans"><span className="sd-ans">{x.correct_answer}</span></span>
                        <span className="sd-actions" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                          <Tooltip title="Move up"><Button className="sd-move" type="text" size="small" icon={<ArrowUpOutlined />} disabled={!reorderable || idx === 0} onClick={() => handleMoveQuestion(x.id, 'up')} aria-label="Move up" /></Tooltip>
                          <Tooltip title="Move down"><Button className="sd-move" type="text" size="small" icon={<ArrowDownOutlined />} disabled={!reorderable || idx === questions.length - 1} onClick={() => handleMoveQuestion(x.id, 'down')} aria-label="Move down" /></Tooltip>
                          <Tooltip title="Edit"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditingQuestion(x); setQuestionModalOpen(true); }} aria-label={`Edit question ${x.question_order}`} /></Tooltip>
                          <Tooltip title="Delete"><Button className="is-danger" type="text" size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteQuestion(x.id)} aria-label={`Delete question ${x.question_order}`} /></Tooltip>
                        </span>
                      </div>
                      {open && (
                        <div className="sd-detail">
                          {img && <img className="sd-img" src={img} alt={`Question ${x.question_order}`} loading="lazy" />}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="sd-options">
                              {(['A', 'B', 'C', 'D'] as const).map(k => (
                                <div key={k} className={`sd-opt${x.correct_answer === k ? ' is-correct' : ''}`}>
                                  <b>{k}</b><span>{opts[k] || '—'}</span>{x.correct_answer === k && <CheckOutlined />}
                                </div>
                              ))}
                            </div>
                            {x.audio_file_name && <em className="sd-file">Audio file: {x.audio_file_name}</em>}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </section>
      </div>
    );
  };


  // ════════════════════════════════════════════════════════════
  // RENDER: EE Years View
  // ════════════════════════════════════════════════════════════
  const renderEeYearsView = () => {
    const listView = treeViewOf('ee-years', selectedCategoryId);
    const totalMonths = eeYears.reduce((t, y) => t + (Number(y.month_count) || 0), 0);
    const toRoot = () => { setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setView('categories'); };

    return (
      <div className="ep fam-ee">
        <nav className="ep-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={toRoot}>Exam preparation</button>
          <RightOutlined />
          <span>{selectedCategoryName}</span>
        </nav>

        <header className="ep-header">
          <div className="sl-title">
            <button type="button" className="ep-back" onClick={navigateBack} aria-label="Back to exam preparation"><ArrowLeftOutlined /></button>
            <span className="ep-cat-ic"><FormOutlined /></span>
            <div>
              <h1 className="ep-title">{selectedCategoryName}</h1>
              <p className="ep-subtitle">{eeYears.length} {eeYears.length === 1 ? 'year' : 'years'} · {totalMonths} {totalMonths === 1 ? 'month' : 'months'} of exam sessions</p>
            </div>
          </div>
          <div className="ep-actions">
            <Button icon={<FolderOpenOutlined />} onClick={() => setEeImportModalOpen(true)}>Import from file</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeYearModalOpen(true)}>Add year</Button>
          </div>
        </header>

        <section className="ep-card">
          {listView === 'skeleton' ? (
            <div className="tr-grid">{[0, 1, 2, 3].map(i => <div key={i} className="tr-card is-skeleton"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
          ) : listView === 'error' ? (
            <TreeError what="years" onRetry={fetchEeYears} />
          ) : eeYears.length === 0 ? (
            <div className="ea-state">
              <CalendarOutlined />
              <strong>No years yet</strong>
              <span>Add a year, then its months and combinaisons — or import a whole year from a file.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeYearModalOpen(true)}>Add year</Button>
            </div>
          ) : (
            <div className="tr-grid">
              {eeYears.map(y => {
                const months = Number(y.month_count) || 0;
                const open = () => { setSelectedEeYearId(y.id); setSelectedEeYear(y.year); setView('ee-months'); };
                return (
                  <article key={y.id} className="tr-card is-year" role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}>
                    <div className="tr-card-top">
                      <span className="tr-year">{y.year}</span>
                      <span className="tr-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            { key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => openExamAssign('new', [{ content_type: 'ee_year', content_id: y.id }]) },
                            { type: 'divider' },
                            {
                              key: 'delete', icon: <DeleteOutlined />, label: 'Delete year', danger: true,
                              onClick: () => Modal.confirm({
                                title: `Delete ${y.year}?`,
                                content: `Its ${months} ${months === 1 ? 'month' : 'months'}, combinaisons and tâches are deleted too. This can’t be undone.`,
                                okText: 'Delete year', okButtonProps: { danger: true },
                                onOk: async () => {
                                  const resp = await apiCall(`/tcf/ee/years/${y.id}`, { method: 'DELETE' });
                                  if (!resp.ok) { message.error('The year could not be deleted.'); throw new Error(); }
                                  message.success('Year deleted');
                                  fetchEeYears();
                                },
                              }),
                            },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${y.year}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="tr-months" aria-hidden>
                      {Array.from({ length: 12 }, (_, i) => <span key={i} className={i < months ? 'is-on' : ''} />)}
                    </div>
                    <div className="tr-card-foot">
                      <em>{months} / 12 months</em>
                      <span className="ep-open">Open <RightOutlined /></span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // RENDER: EE Months View
  // ════════════════════════════════════════════════════════════
  const renderEeMonthsView = () => {
    const listView = treeViewOf('ee-months', selectedEeYearId);
    const totalCombs = eeMonths.reduce((t, m) => t + (Number(m.combinaison_count) || 0), 0);
    const empty = eeMonths.filter(m => !Number(m.combinaison_count)).length;
    const toRoot = () => { setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setView('categories'); };
    const toYears = () => { setSelectedEeYearId(null); setSelectedEeYear(null); setView('ee-years'); };

    return (
      <div className="ep fam-ee">
        <nav className="ep-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={toRoot}>Exam preparation</button>
          <RightOutlined />
          <button type="button" onClick={toYears}>{selectedCategoryName}</button>
          <RightOutlined />
          <span>{selectedEeYear}</span>
        </nav>

        <header className="ep-header">
          <div className="sl-title">
            <button type="button" className="ep-back" onClick={navigateBack} aria-label={`Back to ${selectedCategoryName}`}><ArrowLeftOutlined /></button>
            <div>
              <h1 className="ep-title">{selectedEeYear}</h1>
              <p className="ep-subtitle">{eeMonths.length} {eeMonths.length === 1 ? 'month' : 'months'} · {totalCombs} {totalCombs === 1 ? 'combinaison' : 'combinaisons'}{empty ? ` · ${empty} empty` : ''}</p>
            </div>
          </div>
          <div className="ep-actions">
            <Button icon={<SendOutlined />} onClick={() => openExamAssign('new', [{ content_type: 'ee_year', content_id: selectedEeYearId as number }])}>Assign year</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeMonthModalOpen(true)}>Add month</Button>
          </div>
        </header>

        <section className="ep-card">
          {listView === 'skeleton' ? (
            <div className="tr-grid">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="tr-card is-skeleton"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
          ) : listView === 'error' ? (
            <TreeError what="months" onRetry={fetchEeMonths} />
          ) : eeMonths.length === 0 ? (
            <div className="ea-state">
              <CalendarOutlined />
              <strong>No months yet</strong>
              <span>Add the months of {selectedEeYear} that have exam content.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setEeMonthModalOpen(true)}>Add month</Button>
            </div>
          ) : (
            <div className="tr-grid">
              {eeMonths.map(m => {
                const count = Number(m.combinaison_count) || 0;
                const open = () => { setCombQuery(''); setSelectedEeMonthId(m.id); setSelectedEeMonthName(m.month_name); setView('ee-combinaisons'); };
                return (
                  <article key={m.id} className={`tr-card${count ? '' : ' is-empty'}`} role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}>
                    <div className="tr-card-top">
                      <span className="tr-num">{m.month}</span>
                      <span className="tr-card-name">
                        <strong>{m.month_name}</strong>
                        <em>{count ? `${count} ${count === 1 ? 'combinaison' : 'combinaisons'}` : 'No combinaisons yet'}</em>
                      </span>
                      <span className="tr-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            { key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => openExamAssign('new', [{ content_type: 'ee_month', content_id: m.id }]) },
                            { type: 'divider' },
                            {
                              key: 'delete', icon: <DeleteOutlined />, label: 'Delete month', danger: true,
                              onClick: () => Modal.confirm({
                                title: `Delete ${m.month_name} ${selectedEeYear}?`,
                                content: `Its ${count} ${count === 1 ? 'combinaison is' : 'combinaisons are'} deleted too. This can’t be undone.`,
                                okText: 'Delete month', okButtonProps: { danger: true },
                                onOk: async () => {
                                  const resp = await apiCall(`/tcf/ee/months/${m.id}`, { method: 'DELETE' });
                                  if (!resp.ok) { message.error('The month could not be deleted.'); throw new Error(); }
                                  message.success('Month deleted');
                                  fetchEeMonths();
                                },
                              }),
                            },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${m.month_name}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="tr-card-foot">
                      <em>{selectedEeYear}</em>
                      <span className="ep-open">Open <RightOutlined /></span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // RENDER: EE Combinaisons View
  // ════════════════════════════════════════════════════════════
  const renderEeCombinaisonsView = () => {
    const listView = treeViewOf('ee-combs', selectedEeMonthId);
    const list = [...eeCombinaisons].sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || a.id - b.id);
    const q = combQuery.trim().toLowerCase();
    const shown = q ? list.filter(c => c.name.toLowerCase().includes(q)) : list;
    const incomplete = list.filter(c => (c.taches?.length || 0) < 3);
    const toRoot = () => { setSelectedCategoryId(null); setSelectedCategoryName(''); setCategoryType('ce'); setView('categories'); };
    const toYears = () => { setSelectedEeYearId(null); setSelectedEeYear(null); setView('ee-years'); };
    const toMonths = () => { setSelectedEeMonthId(null); setSelectedEeMonthName(''); setCorrectionVisible({}); setView('ee-months'); };

    const removeCombinaison = (comb: EeCombinaison) => Modal.confirm({
      title: `Delete “${comb.name}”?`,
      content: 'Its tâches and corrections are deleted too. This can’t be undone.',
      okText: 'Delete combinaison', okButtonProps: { danger: true },
      onOk: async () => {
        const resp = await apiCall(`/tcf/ee/combinaisons/${comb.id}`, { method: 'DELETE' });
        if (!resp.ok) { message.error('The combinaison could not be deleted.'); throw new Error(); }
        message.success('Combinaison deleted');
        fetchEeCombinaisons();
      },
    });

    return (
      <div className="ep fam-ee">
        <nav className="ep-crumbs" aria-label="Breadcrumb">
          <button type="button" onClick={toRoot}>Exam preparation</button>
          <RightOutlined />
          <button type="button" onClick={toYears}>{selectedCategoryName}</button>
          <RightOutlined />
          <button type="button" onClick={toMonths}>{selectedEeYear}</button>
          <RightOutlined />
          <span>{selectedEeMonthName}</span>
        </nav>

        <header className="ep-header">
          <div className="sl-title">
            <button type="button" className="ep-back" onClick={navigateBack} aria-label={`Back to ${selectedEeYear}`}><ArrowLeftOutlined /></button>
            <div>
              <h1 className="ep-title">{selectedEeMonthName} {selectedEeYear}</h1>
              <p className="ep-subtitle">{list.length} {list.length === 1 ? 'combinaison' : 'combinaisons'} · 3 tâches each</p>
            </div>
          </div>
          <div className="ep-actions">
            <Button icon={<SendOutlined />} onClick={() => openExamAssign('new', [{ content_type: 'ee_month', content_id: selectedEeMonthId as number }])}>Assign month</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCombinaison(null); setEeCombinaisonModalOpen(true); }}>Add combinaison</Button>
          </div>
        </header>

        {listView === 'data' && incomplete.length > 0 && (
          <div className="sl-alert" role="note">
            <WarningOutlined />
            <span>
              <strong>{incomplete.length} {incomplete.length === 1 ? 'combinaison is' : 'combinaisons are'} missing tâches</strong>
              {' — '}{incomplete.slice(0, 6).map(c => `${c.name} (${c.taches?.length || 0}/3)`).join(', ')}{incomplete.length > 6 ? '…' : ''}
            </span>
          </div>
        )}

        <section className="ep-card">
          {list.length > 8 && (
            <div className="sl-toolbar">
              <Input allowClear prefix={<SearchOutlined />} placeholder="Search combinaisons" value={combQuery} onChange={e => setCombQuery(e.target.value)} />
            </div>
          )}
          {listView === 'skeleton' ? (
            <div className="tr-grid">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="tr-card is-skeleton"><Skeleton active title={false} paragraph={{ rows: 2 }} /></div>)}</div>
          ) : listView === 'error' ? (
            <TreeError what="combinaisons" onRetry={fetchEeCombinaisons} />
          ) : list.length === 0 ? (
            <div className="ea-state">
              <FormOutlined />
              <strong>No combinaisons yet</strong>
              <span>A combinaison holds the three writing tâches of one exam session.</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCombinaison(null); setEeCombinaisonModalOpen(true); }}>Add combinaison</Button>
            </div>
          ) : shown.length === 0 ? (
            <div className="ea-state"><SearchOutlined /><strong>No combinaison matches</strong><span>Try another name.</span></div>
          ) : (
            <div className="tr-grid">
              {shown.map(comb => {
                const taches = comb.taches || [];
                const open = () => setViewingCombinaison(comb);
                return (
                  <article key={comb.id} className={`tr-card${taches.length < 3 ? ' is-warn' : ''}`} role="button" tabIndex={0} onClick={open} onKeyDown={e => { if (e.key === 'Enter') open(); }}>
                    <div className="tr-card-top">
                      <span className="tr-num">{comb.display_order || '–'}</span>
                      <span className="tr-card-name">
                        <strong>{comb.name}</strong>
                        <em>{taches.filter(t => t.correction_text).length} with correction</em>
                      </span>
                      <span className="tr-menu" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
                        <Dropdown trigger={['click']} menu={{
                          items: [
                            { key: 'edit', icon: <EditOutlined />, label: 'Rename', onClick: () => { setEditingCombinaison(comb); setEeCombinaisonModalOpen(true); } },
                            { key: 'assign', icon: <SendOutlined />, label: 'Assign…', onClick: () => openExamAssign('new', [{ content_type: 'ee_combinaison', content_id: comb.id }]) },
                            { type: 'divider' },
                            { key: 'delete', icon: <DeleteOutlined />, label: 'Delete combinaison', danger: true, onClick: () => removeCombinaison(comb) },
                          ],
                        }}>
                          <Button type="text" size="small" icon={<MoreOutlined />} aria-label={`Actions for ${comb.name}`} />
                        </Dropdown>
                      </span>
                    </div>
                    <div className="tr-tasks" aria-label={`${taches.length} of 3 tâches`}>
                      {[1, 2, 3].map(n => {
                        const t = taches.find(x => x.task_number === n);
                        return (
                          <Tooltip key={n} title={`Tâche ${n} — ${TASK_TYPE_LABELS[TASK_DEFAULTS[n].type]}${t ? '' : ' (missing)'}`}>
                            <span className={`tr-task is-t${n}${t ? '' : ' is-missing'}`}>{t ? <CheckOutlined /> : n}</span>
                          </Tooltip>
                        );
                      })}
                      <em>{taches.length}/3 tâches</em>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
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
    // Which parent each list belongs to — prevents an empty state flashing before the data lands.
    yearsView: treeViewOf('eo-years', selectedCategoryId),
    monthsView: treeViewOf('eo-months', selectedEoYearId),
    partiesView: treeViewOf('eo-parties', selectedEoMonthId),
    openAssign: (preset: { content_type: string; content_id: number }[]) => openExamAssign('new', preset),
    partieQuery,
    setPartieQuery,
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
        {view === 'student-results' && <ExamResultsDashboard mode="admin" initialStudentId={resultsFor} onBack={() => setView('categories')} />}
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
          onSuccess={() => { fetchSeriesList(); if (view === 'series-detail') fetchSeriesDetail(); }}
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

      {/* EE modals */}
      <EeYearModal
        open={eeYearModalOpen}
        onClose={() => setEeYearModalOpen(false)}
        onSuccess={() => { fetchEeYears(); setEeYearModalOpen(false); }}
        categoryId={selectedCategoryId}
        existing={eeYears.map(y => y.year)}
        apiCall={apiCall}
      />

      {selectedCategoryId && categoryType === 'ee' && (
        <EeBulkImportModal
          open={eeImportModalOpen}
          onClose={() => setEeImportModalOpen(false)}
          onSuccess={() => { fetchEeYears(); setEeImportModalOpen(false); }}
          categoryId={selectedCategoryId}
          apiCall={apiCall}
        />
      )}

      <EeMonthModal
        open={eeMonthModalOpen}
        onClose={() => setEeMonthModalOpen(false)}
        onSuccess={() => { fetchEeMonths(); invalidateTree('ee-years'); setEeMonthModalOpen(false); }}
        yearId={selectedEeYearId}
        existing={eeMonths.map(m => m.month)}
        apiCall={apiCall}
      />

      <EeCombinaisonModal
        open={eeCombinaisonModalOpen}
        onClose={() => { setEeCombinaisonModalOpen(false); setEditingCombinaison(null); }}
        onSuccess={() => { fetchEeCombinaisons(); invalidateTree('ee-months'); setEeCombinaisonModalOpen(false); setEditingCombinaison(null); }}
        monthId={selectedEeMonthId}
        editing={editingCombinaison}
        nextNumber={eeCombinaisons.length + 1}
        apiCall={apiCall}
      />

      <EeTacheModal
        open={eeTacheModalOpen}
        onClose={() => { setEeTacheModalOpen(false); setEditingTache(null); }}
        onSuccess={() => { fetchEeCombinaisons(); setEeTacheModalOpen(false); setEditingTache(null); }}
        editing={editingTache}
        taskNumber={editingTacheTaskNumber}
        combinaisonId={editingTacheCombinaisonId}
        apiCall={apiCall}
      />

      {/* EE combinaison detail */}
      <Drawer
        open={!!viewingCombinaison}
        onClose={() => { setViewingCombinaison(null); setCorrectionVisible({}); }}
        width={720}
        closable={false}
        title={null}
        className="pd-drawer"
      >
        {viewingCombinaison && (() => {
          // Always read the freshest copy, so edits show without re-opening the drawer.
          const comb = eeCombinaisons.find(c => c.id === viewingCombinaison.id) || viewingCombinaison;
          const taches = [...(comb.taches || [])].sort((a, b) => a.task_number - b.task_number);
          const missing = [1, 2, 3].filter(n => !taches.some(t => t.task_number === n));
          return (
            <div className="ep fam-ee">
              <header className="ea-head">
                <span className="ea-head-ic"><FormOutlined /></span>
                <div className="ea-head-text">
                  <h2>{comb.name}</h2>
                  <p>{selectedEeMonthName} {selectedEeYear} · {taches.length}/3 tâches</p>
                </div>
                <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingCombinaison(comb); setEeCombinaisonModalOpen(true); }} aria-label="Rename combinaison" />
                <button type="button" className="ea-close" onClick={() => { setViewingCombinaison(null); setCorrectionVisible({}); }} aria-label="Close"><CloseOutlined /></button>
              </header>
              <div className="pd-tasks" style={{ padding: 16 }}>
                {taches.map(tache => {
                  const defaults = TASK_DEFAULTS[tache.task_number];
                  const shown = correctionVisible[tache.id];
                  return (
                    <section key={tache.id} className={`pd-task is-t${tache.task_number}`}>
                      <header className="pd-task-head">
                        <span className="pd-task-n">{tache.task_number}</span>
                        <div className="pd-task-id">
                          <strong>Tâche {tache.task_number} — {TASK_TYPE_LABELS[tache.task_type]}</strong>
                          <em>{defaults?.min}–{defaults?.max} words · {defaults?.dur} min</em>
                        </div>
                        <span className="pd-task-actions">
                          <Tooltip title="Edit tâche">
                            <Button type="text" size="small" icon={<EditOutlined />} aria-label={`Edit tâche ${tache.task_number}`}
                              onClick={() => { setEditingTache(tache); setEditingTacheTaskNumber(tache.task_number); setEditingTacheCombinaisonId(comb.id); setEeTacheModalOpen(true); }} />
                          </Tooltip>
                          <Tooltip title="Delete tâche">
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label={`Delete tâche ${tache.task_number}`}
                              onClick={() => Modal.confirm({
                                title: `Delete tâche ${tache.task_number}?`,
                                content: 'Its prompt and correction are deleted too. This can’t be undone.',
                                okText: 'Delete tâche', okButtonProps: { danger: true },
                                onOk: async () => {
                                  const resp = await apiCall(`/tcf/ee/taches/${tache.id}`, { method: 'DELETE' });
                                  if (!resp.ok) { message.error('The tâche could not be deleted.'); throw new Error(); }
                                  message.success('Tâche deleted');
                                  fetchEeCombinaisons();
                                },
                              })} />
                          </Tooltip>
                        </span>
                      </header>
                      {tache.prompt_text && <p className="pd-prompt">{tache.prompt_text}</p>}
                      {tache.task_type === 'argumentation' && tache.question_text && (
                        <>
                          <div className="pd-sub">Question</div>
                          <p className="pd-prompt">{tache.question_text}</p>
                        </>
                      )}
                      {tache.task_type === 'argumentation' && (tache.argument_text_1 || tache.argument_text_2) && (
                        <div className="fm-grid2" style={{ marginTop: 12 }}>
                          {tache.argument_text_1 && <div><div className="pd-sub">Argument 1</div><p className="pd-prompt" style={{ marginTop: 0 }}>{tache.argument_text_1}</p></div>}
                          {tache.argument_text_2 && <div><div className="pd-sub">Argument 2</div><p className="pd-prompt" style={{ marginTop: 0 }}>{tache.argument_text_2}</p></div>}
                        </div>
                      )}
                      {tache.correction_text && (
                        <>
                          <button type="button" className="pd-link" onClick={() => setCorrectionVisible(prev => ({ ...prev, [tache.id]: !prev[tache.id] }))}>
                            {shown ? 'Hide model answer' : 'Show model answer'}
                          </button>
                          {shown && <div className="pd-correction">{tache.correction_text}</div>}
                        </>
                      )}
                    </section>
                  );
                })}
                {missing.length > 0 && (
                  <div className="pd-missing">
                    <WarningOutlined />
                    <span>{missing.length === 3 ? 'This combinaison has no tâches yet.' : `Missing tâche ${missing.join(' and ')}.`}</span>
                    {missing.map(n => (
                      <Button key={n} size="small" icon={<PlusOutlined />}
                        onClick={() => { setEditingTache(null); setEditingTacheTaskNumber(n); setEditingTacheCombinaisonId(comb.id); setEeTacheModalOpen(true); }}>
                        Add tâche {n} — {TASK_TYPE_LABELS[TASK_DEFAULTS[n].type]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* EO modals */}
      <EoYearModal
        open={eoYearModalOpen}
        onClose={() => setEoYearModalOpen(false)}
        onSuccess={() => { fetchEoYears(); setEoYearModalOpen(false); }}
        categoryId={selectedCategoryId}
        existing={eoYears.map(y => y.year)}
        apiCall={apiCall}
      />
      <EoMonthModal
        open={eoMonthModalOpen}
        onClose={() => setEoMonthModalOpen(false)}
        onSuccess={() => { fetchEoMonths(); invalidateTree('eo-years'); setEoMonthModalOpen(false); }}
        yearId={selectedEoYearId}
        existing={eoMonths.map(m => m.month)}
        apiCall={apiCall}
      />
      <EoPartieModal
        open={eoPartieModalOpen}
        onClose={() => { setEoPartieModalOpen(false); setEditingPartie(null); }}
        onSuccess={() => { fetchEoParties(); invalidateTree('eo-months'); setEoPartieModalOpen(false); setEditingPartie(null); }}
        monthId={selectedEoMonthId}
        editing={editingPartie}
        nextNumber={eoParties.length + 1}
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
        initialTab={examAssignTab}
        preselect={examAssignPreset}
        onChanged={fetchAssignGroups}
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
