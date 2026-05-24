import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal, Button, Select, DatePicker, message, Empty, Tabs, Tag, Checkbox, Tooltip, Badge, Space, Spin, Popconfirm, InputNumber
} from 'antd';
import {
  SendOutlined, UserOutlined, TeamOutlined, CalendarOutlined,
  DeleteOutlined, ReadOutlined, FormOutlined, SoundOutlined, AudioOutlined,
  BookOutlined, DownOutlined, FolderOutlined,
  ClockCircleOutlined, CheckCircleFilled, LockOutlined, CloseOutlined,
  LoadingOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Types
interface ContentNode {
  id: number;
  name?: string;
  year?: number;
  month?: number;
  month_name?: string;
  type: string;
  content_id?: number;
  icon?: string;
  description?: string;
  total_questions?: number;
  total_points?: number;
  display_order?: number;
  children?: ContentNode[];
}

interface Student { id: number; first_name: string; last_name: string; email: string; }
interface Batch { id: number; name: string; }

interface AssignmentGroup {
  group_id: string;
  group_name: string;
  assigned_at: string;
  expires_at: string | null;
  is_expired: boolean;
  assigned_by: string | null;
  recipients: { key: string; type: 'student' | 'batch'; name: string }[];
  items: { id: number; content_type: string; content_id: number; content_name: string }[];
}

interface SelectedItem { content_type: string; content_id: number; label: string; }

const CONTENT_TYPE_LABELS: Record<string, string> = {
  category: 'Category', ce_series: 'CE Series', co_series: 'CO Series',
  ee_year: 'EE Year', ee_month: 'EE Month', ee_combinaison: 'EE Combinaison',
  eo_year: 'EO Year', eo_month: 'EO Month', eo_partie: 'EO Partie',
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  category: '#4338ca', ce_series: '#3b82f6', co_series: '#8b5cf6',
  ee_year: '#f59e0b', ee_month: '#22c55e', ee_combinaison: '#06b6d4',
  eo_year: '#ef4444', eo_month: '#ec4899', eo_partie: '#14b8a6',
};

const ICON_MAP: Record<string, React.ReactNode> = {
  ReadOutlined: <ReadOutlined />, FormOutlined: <FormOutlined />,
  SoundOutlined: <SoundOutlined />, AudioOutlined: <AudioOutlined />,
  BookOutlined: <BookOutlined />,
};

// Tree Node Component
const TreeNode: React.FC<{
  node: ContentNode;
  depth: number;
  selectedItems: SelectedItem[];
  onToggle: (item: SelectedItem, checked: boolean) => void;
  expandedKeys: Set<string>;
  onExpand: (key: string) => void;
}> = ({ node, depth, selectedItems, onToggle, expandedKeys, onExpand }) => {
  const nodeKey = `${node.type}-${node.content_id || node.id}`;
  const isExpanded = expandedKeys.has(nodeKey);
  const hasChildren = node.children && node.children.length > 0;
  const contentType = node.type;
  const contentId = node.content_id || node.id;
  const isSelected = selectedItems.some(i => i.content_type === contentType && i.content_id === contentId);

  const label = node.name || (node.year ? `${node.year}` : node.month_name || `#${contentId}`);
  const color = CONTENT_TYPE_COLORS[contentType] || '#6366f1';

  const getIcon = () => {
    if (node.icon && ICON_MAP[node.icon]) return ICON_MAP[node.icon];
    if (contentType === 'category') return <FolderOutlined />;
    if (contentType.includes('year')) return <CalendarOutlined />;
    if (contentType.includes('month')) return <ClockCircleOutlined />;
    return <BookOutlined />;
  };

  const getMeta = () => {
    if (node.total_questions) return `${node.total_questions} questions · ${node.total_points} pts`;
    if (hasChildren) return `${node.children!.length} items`;
    return null;
  };

  const isRoot = depth === 0;

  return (
    <div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: isRoot ? '10px 14px' : `7px 10px 7px ${16 + depth * 22}px`,
          borderRadius: isRoot ? 10 : 7,
          margin: isRoot ? '2px 4px' : '1px 4px',
          cursor: 'pointer', transition: 'all 0.18s ease',
          background: isSelected
            ? `${color}0d`
            : isRoot ? '#fff' : 'transparent',
          border: isRoot
            ? `1px solid ${isSelected ? color + '40' : '#eef0f6'}`
            : 'none',
          borderLeft: !isRoot
            ? `3px solid ${isSelected ? color : 'transparent'}`
            : undefined,
          boxShadow: isRoot && isSelected ? `0 2px 8px ${color}15` : 'none',
        }}
        onMouseEnter={e => {
          if (!isSelected) e.currentTarget.style.background = isRoot ? '#f8f9ff' : '#f4f5fb';
        }}
        onMouseLeave={e => {
          if (!isSelected) e.currentTarget.style.background = isRoot ? '#fff' : 'transparent';
        }}
      >
        {/* Expand button */}
        {hasChildren ? (
          <div
            onClick={(e) => { e.stopPropagation(); onExpand(nodeKey); }}
            style={{
              width: 22, height: 22, borderRadius: 6, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: isExpanded ? color : '#94a3b8', fontSize: 9,
              transition: 'all 0.2s',
              transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              background: isExpanded ? `${color}10` : 'transparent',
            }}
          >
            <DownOutlined />
          </div>
        ) : <div style={{ width: 22, flexShrink: 0 }} />}

        {/* Checkbox */}
        <Checkbox
          checked={isSelected}
          onChange={e => onToggle({ content_type: contentType, content_id: contentId, label }, e.target.checked)}
          style={{ marginRight: 0 }}
        />

        {/* Icon */}
        <div style={{
          width: isRoot ? 32 : 26, height: isRoot ? 32 : 26,
          borderRadius: isRoot ? 8 : 6, flexShrink: 0,
          background: isRoot
            ? `linear-gradient(135deg, ${color}18, ${color}08)`
            : `${color}0c`,
          color, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: isRoot ? 15 : 12,
          border: isRoot ? `1px solid ${color}15` : 'none',
        }}>
          {getIcon()}
        </div>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => hasChildren && onExpand(nodeKey)}>
          <div style={{
            fontSize: isRoot ? 14 : 13, fontWeight: isRoot ? 700 : 600,
            color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {label}
          </div>
          {getMeta() && (
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 0 }}>{getMeta()}</div>
          )}
        </div>

        {/* Type badge */}
        <Tag style={{
          borderRadius: 4, fontSize: 9, fontWeight: 700, margin: 0,
          padding: '1px 6px', background: `${color}0c`, color, border: `1px solid ${color}18`,
          flexShrink: 0, textTransform: 'uppercase', letterSpacing: 0.3,
        }}>
          {CONTENT_TYPE_LABELS[contentType]}
        </Tag>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div style={{
          marginLeft: isRoot ? 8 : 0,
          borderLeft: isRoot ? `2px solid ${color}15` : 'none',
          marginTop: 2, marginBottom: 2,
        }}>
          {node.children!.map((child, i) => (
            <TreeNode
              key={`${child.type}-${child.content_id || child.id}-${i}`}
              node={child} depth={depth + 1}
              selectedItems={selectedItems} onToggle={onToggle}
              expandedKeys={expandedKeys} onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Modal
const ExamAssignmentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}> = ({ open, onClose, apiCall }) => {
  const [activeTab, setActiveTab] = useState('content');
  const [tree, setTree] = useState<ContentNode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<AssignmentGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [, setExpandedGroups] = useState<Set<string>>(new Set());

  // Selections
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [expiresAt, setExpiresAt] = useState<dayjs.Dayjs | null>(null);
  const [eeCredits, setEeCredits] = useState<number | null>(null);
  const [eoCredits, setEoCredits] = useState<number | null>(null);
  const [assignmentName, setAssignmentName] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState('');
  const [batchSearch, setBatchSearch] = useState('');

  // Optimized options: show top 10 + always include selected
  const studentOptions = useMemo(() => {
    const MAX = 10;
    const selectedSet = new Set(selectedStudentIds);
    const q = studentSearch.toLowerCase().trim();
    const matched = q
      ? students.filter(s =>
          `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(q)
        )
      : students;
    const visible = matched.slice(0, MAX);
    // Always include already-selected students even if not in top 10
    const visibleIds = new Set(visible.map(s => s.id));
    const selectedNotShown = students.filter(s => selectedSet.has(s.id) && !visibleIds.has(s.id));
    const all = [...selectedNotShown, ...visible];
    return {
      options: all.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.email})` })),
      total: matched.length,
      showing: visible.length,
    };
  }, [students, studentSearch, selectedStudentIds]);

  const batchOptions = useMemo(() => {
    const MAX = 10;
    const selectedSet = new Set(selectedBatchIds);
    const q = batchSearch.toLowerCase().trim();
    const matched = q
      ? batches.filter(b => b.name.toLowerCase().includes(q))
      : batches;
    const visible = matched.slice(0, MAX);
    const visibleIds = new Set(visible.map(b => b.id));
    const selectedNotShown = batches.filter(b => selectedSet.has(b.id) && !visibleIds.has(b.id));
    const all = [...selectedNotShown, ...visible];
    return {
      options: all.map(b => ({ value: b.id, label: b.name })),
      total: matched.length,
      showing: visible.length,
    };
  }, [batches, batchSearch, selectedBatchIds]);

  const fetchData = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const [treeResp, studentsResp, batchesResp, assignResp] = await Promise.all([
        apiCall('/tcf/exam-assignments/content-tree'),
        apiCall('/users?role=student'),
        apiCall('/batches'),
        apiCall('/tcf/exam-assignments'),
      ]);
      if (treeResp.ok) setTree(await treeResp.json());
      if (studentsResp.ok) {
        const d = await studentsResp.json();
        setStudents(Array.isArray(d) ? d : d.users || []);
      }
      if (batchesResp.ok) {
        const d = await batchesResp.json();
        setBatches(Array.isArray(d) ? d : []);
      }
      if (assignResp.ok) setAssignments(await assignResp.json());
    } catch { message.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [open, apiCall]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (open) {
      setSelectedItems([]);
      setSelectedStudentIds([]);
      setSelectedBatchIds([]);
      setExpiresAt(null);
      setEeCredits(null);
      setEoCredits(null);
      setAssignmentName('');
      setActiveTab('content');
      setExpandedGroups(new Set());
    }
  }, [open]);

  const handleToggleItem = (item: SelectedItem, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev.filter(i => !(i.content_type === item.content_type && i.content_id === item.content_id)), item]);
    } else {
      setSelectedItems(prev => prev.filter(i => !(i.content_type === item.content_type && i.content_id === item.content_id)));
    }
  };

  const handleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) { message.warning('Select at least one content item'); return; }
    if (selectedStudentIds.length === 0 && selectedBatchIds.length === 0) { message.warning('Select at least one student or batch'); return; }
    if (!assignmentName.trim()) { message.warning('Please provide an assignment name'); setActiveTab('recipients'); return; }

    setSubmitting(true);
    try {
      const resp = await apiCall('/tcf/exam-assignments', {
        method: 'POST',
        body: JSON.stringify({
          items: selectedItems.map(i => ({ content_type: i.content_type, content_id: i.content_id })),
          student_ids: selectedStudentIds,
          batch_ids: selectedBatchIds,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
          group_name: assignmentName.trim(),
          ee_credits: eeCredits || 0,
          eo_credits: eoCredits || 0,
        }),
      });
      if (resp.ok) {
        const result = await resp.json();
        message.success(`${result.created} assignment${result.created > 1 ? 's' : ''} created${result.duplicates ? ` (${result.duplicates} already existed)` : ''}`);
        setSelectedItems([]);
        setSelectedStudentIds([]);
        setSelectedBatchIds([]);
        setExpiresAt(null);
        setEeCredits(null);
        setEoCredits(null);
        setAssignmentName('');
        setActiveTab('existing');
        fetchData();
      } else {
        const err = await resp.json();
        message.error(err.error || 'Failed to create assignments');
      }
    } catch { message.error('Failed to create assignments'); }
    finally { setSubmitting(false); }
  };

  const handleRemoveGroup = async (groupId: string) => {
    setRemovingId(groupId);
    try {
      const resp = await apiCall(`/tcf/exam-assignments/group/${groupId}`, { method: 'DELETE' });
      if (resp.ok) { message.success('Assignment group removed successfully'); fetchData(); }
      else message.error('Failed to remove assignment group');
    } catch { message.error('Failed to remove assignment group'); }
    finally { setRemovingId(null); }
  };



  const expandAll = () => {
    const keys = new Set<string>();
    const traverse = (nodes: ContentNode[]) => {
      for (const n of nodes) {
        if (n.children && n.children.length > 0) {
          keys.add(`${n.type}-${n.content_id || n.id}`);
          traverse(n.children);
        }
      }
    };
    traverse(tree);
    setExpandedKeys(keys);
  };

  const totalRecipients = selectedStudentIds.length + selectedBatchIds.length;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={920}
      destroyOnClose
      centered
      title={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
      style={{ top: 20 }}
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 60%, #818cf8 100%)',
        padding: '24px 28px', borderRadius: '8px 8px 0 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 20,
          }}>
            <SendOutlined />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
              Assign Exam Content
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Select content, recipients, and expiration settings
            </div>
          </div>
        </div>
        {/* Summary badges + close */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedItems.length > 0 && (
            <Tag style={{ borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, padding: '4px 10px' }}>
              📂 {selectedItems.length} content
            </Tag>
          )}
          {totalRecipients > 0 && (
            <Tag style={{ borderRadius: 8, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', fontWeight: 700, fontSize: 12, padding: '4px 10px' }}>
              👥 {totalRecipients} recipients
            </Tag>
          )}
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', marginLeft: 4, flexShrink: 0,
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 28px 24px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 0 }}
          items={[
            {
              key: 'content',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FolderOutlined /> Content
                  {selectedItems.length > 0 && <Badge count={selectedItems.length} style={{ backgroundColor: '#4338ca' }} />}
                </span>
              ),
              children: (
                <div>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Select categories, series, years, months, or specific content to assign
                    </div>
                    <Space size={6}>
                      <Button size="small" onClick={expandAll} style={{ borderRadius: 6, fontSize: 11 }}>
                        Expand All
                      </Button>
                      <Button size="small" onClick={() => setExpandedKeys(new Set())} style={{ borderRadius: 6, fontSize: 11 }}>
                        Collapse All
                      </Button>
                    </Space>
                  </div>

                  {/* Tree */}
                  <div style={{
                    border: '1px solid #e8e8f4', borderRadius: 12,
                    maxHeight: 380, overflowY: 'auto', background: '#fafbff',
                    position: 'relative',
                  }}>
                    {loading && tree.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 28, color: '#6366f1' }} spin />} />
                        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Loading content tree...</div>
                      </div>
                    ) : tree.length === 0 ? (
                      <Empty description="No content available" style={{ padding: 40 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      <div style={{ padding: '6px 4px' }}>
                        {tree.map((node, i) => (
                          <TreeNode
                            key={`${node.type}-${node.id}-${i}`}
                            node={node} depth={0}
                            selectedItems={selectedItems}
                            onToggle={handleToggleItem}
                            expandedKeys={expandedKeys}
                            onExpand={handleExpand}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected summary */}
                  {selectedItems.length > 0 && (
                    <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedItems.map((item, i) => (
                        <Tag
                          key={i}
                          closable
                          onClose={() => handleToggleItem(item, false)}
                          style={{
                            borderRadius: 6, fontWeight: 600, fontSize: 11,
                            background: `${CONTENT_TYPE_COLORS[item.content_type]}10`,
                            color: CONTENT_TYPE_COLORS[item.content_type],
                            border: `1px solid ${CONTENT_TYPE_COLORS[item.content_type]}30`,
                          }}
                        >
                          {item.label}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'recipients',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TeamOutlined /> Recipients
                  {totalRecipients > 0 && <Badge count={totalRecipients} style={{ backgroundColor: '#22c55e' }} />}
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: 380, overflowY: 'auto', paddingRight: 8, paddingBottom: 20 }}>
                  <style>
                    {`
                      ::-webkit-scrollbar { width: 6px; }
                      ::-webkit-scrollbar-track { background: transparent; }
                      ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                      ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                    `}
                  </style>
                  {/* Assignment Name */}
                  <div style={{
                    background: '#f0f2ff', borderRadius: 12, padding: 16,
                    border: '1px solid #e0e4f8',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#312e81', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      ✏️ Assignment Name <span style={{ color: '#ef4444', fontSize: 11 }}>*</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6366f1', marginBottom: 8 }}>
                      Give this assignment a short, recognizable name (e.g. &quot;CE Practice Week 1&quot;)
                    </div>
                    <input
                      type="text"
                      value={assignmentName}
                      onChange={e => setAssignmentName(e.target.value)}
                      placeholder="e.g. EE Months Jan-March 2025"
                      maxLength={100}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 8,
                        border: `1.5px solid ${assignmentName.trim() ? '#22c55e' : '#c7d2fe'}`,
                        outline: 'none', fontSize: 13, fontWeight: 600, color: '#1e293b',
                        background: '#fff', transition: 'border-color 0.15s',
                        boxSizing: 'border-box' as const,
                      }}
                      onFocus={e => { e.target.style.borderColor = '#6366f1'; }}
                      onBlur={e => { e.target.style.borderColor = assignmentName.trim() ? '#22c55e' : '#c7d2fe'; }}
                    />
                  </div>

                  {/* Students */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <UserOutlined style={{ color: '#6366f1' }} /> Students
                      {selectedStudentIds.length > 0 && <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600, fontSize: 10 }}>{selectedStudentIds.length} selected</Tag>}
                    </div>
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Search and select students..."
                      value={selectedStudentIds}
                      onChange={setSelectedStudentIds}
                      filterOption={false}
                      onSearch={setStudentSearch}
                      style={{ width: '100%' }}
                      loading={loading}
                      maxTagCount="responsive"
                      getPopupContainer={trigger => trigger.parentElement || document.body}
                      options={studentOptions.options}
                      notFoundContent={loading ? 'Loading...' : 'No students found'}
                      dropdownRender={menu => (
                        <div>
                          {menu}
                          {studentOptions.total > studentOptions.showing && (
                            <div style={{ padding: '6px 12px', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                              Showing {studentOptions.showing} of {studentOptions.total} — type to search more
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Batches */}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TeamOutlined style={{ color: '#22c55e' }} /> Batches
                      {selectedBatchIds.length > 0 && <Tag color="green" style={{ borderRadius: 6, fontWeight: 600, fontSize: 10 }}>{selectedBatchIds.length} selected</Tag>}
                    </div>
                    <Select
                      mode="multiple"
                      showSearch
                      placeholder="Search and select batches..."
                      value={selectedBatchIds}
                      onChange={setSelectedBatchIds}
                      filterOption={false}
                      onSearch={setBatchSearch}
                      style={{ width: '100%' }}
                      loading={loading}
                      maxTagCount="responsive"
                      getPopupContainer={trigger => trigger.parentElement || document.body}
                      options={batchOptions.options}
                      notFoundContent={loading ? 'Loading...' : 'No batches found'}
                      dropdownRender={menu => (
                        <div>
                          {menu}
                          {batchOptions.total > batchOptions.showing && (
                            <div style={{ padding: '6px 12px', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                              Showing {batchOptions.showing} of {batchOptions.total} — type to search more
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>

                  {/* Expiration */}
                  <div style={{
                    background: '#fefce8', borderRadius: 12, padding: 16,
                    border: '1px solid #fef08a',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LockOutlined /> Expiration Date
                    </div>
                    <div style={{ fontSize: 11, color: '#a16207', marginBottom: 10 }}>
                      After this date, assigned content will be frozen for students. Leave empty for no expiration.
                    </div>
                    <DatePicker
                      showTime
                      value={expiresAt}
                      onChange={setExpiresAt}
                      style={{ width: '100%', borderRadius: 8 }}
                      placeholder="No expiration (optional)"
                      format="YYYY-MM-DD HH:mm"
                      getPopupContainer={trigger => trigger.parentElement || document.body}
                    />
                  </div>

                  {/* AI Credits (optional) */}
                  <div style={{
                    background: '#f0f9ff', borderRadius: 12, padding: 16,
                    border: '1px solid #bae6fd', marginTop: 12,
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ThunderboltOutlined /> AI Credits (optional)
                    </div>
                    <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 12 }}>
                      Each Expression Écrite or Expression Orale attempt consumes 1 credit. Credits never expire.
                      Leave blank or 0 to skip granting credits with this assignment.
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                          Expression Écrite credits
                        </div>
                        <InputNumber
                          min={0} max={9999}
                          value={eeCredits ?? undefined}
                          onChange={(v) => setEeCredits(v as number | null)}
                          placeholder="0"
                          style={{ width: '100%', borderRadius: 8 }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                          Expression Orale credits
                        </div>
                        <InputNumber
                          min={0} max={9999}
                          value={eoCredits ?? undefined}
                          onChange={(v) => setEoCredits(v as number | null)}
                          placeholder="0"
                          style={{ width: '100%', borderRadius: 8 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'existing',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleFilled /> Active
                  {assignments.length > 0 && <Badge count={assignments.length} style={{ backgroundColor: '#f59e0b' }} />}
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#6366f1' }} spin />} />
                      <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Loading assignments...</div>
                    </div>
                  ) : assignments.length === 0 ? (
                    <Empty description="No active assignments" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
                  ) : (
                    <>
                      {/* Fixed table header */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.5fr 1.2fr 72px 80px 60px',
                        gap: 0,
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #f8fafc, #f0f2ff)',
                        borderRadius: '10px 10px 0 0',
                        border: '1px solid #e8e8f4',
                        borderBottom: '2px solid #e0e4f8',
                      }}>
                        {['Assignment', 'Content', 'Recipients', 'Status', 'Date', 'Actions'].map(h => (
                          <div key={h} style={{
                            fontSize: 10, fontWeight: 700, color: '#64748b',
                            textTransform: 'uppercase', letterSpacing: 0.8,
                          }}>{h}</div>
                        ))}
                      </div>

                      {/* Scrollable table body */}
                      <div style={{
                        flex: 1, overflowY: 'auto',
                        border: '1px solid #e8e8f4', borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                      }}>
                        {assignments.map((group, idx) => {
                          const isActive = !group.is_expired;
                          const accentColor = group.is_expired ? '#ef4444' : ['#6366f1', '#8b5cf6', '#3b82f6', '#0ea5e9', '#22c55e', '#f59e0b'][idx % 6];
                          return (
                            <div key={group.group_id} style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1.5fr 1.2fr 72px 80px 60px',
                              gap: 0,
                              padding: '10px 16px',
                              alignItems: 'center',
                              borderBottom: '1px solid #f1f5f9',
                              borderLeft: `3px solid ${accentColor}`,
                              background: '#fff',
                              transition: 'background 0.12s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fafbff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                            >
                              {/* Assignment name */}
                              <div style={{ minWidth: 0, paddingRight: 10 }}>
                                <div style={{
                                  fontSize: 12, fontWeight: 700, color: '#1e293b',
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}>
                                  {group.group_name}
                                </div>
                                {group.assigned_by && (
                                  <div style={{ fontSize: 10, color: '#b0b8c9', marginTop: 1 }}>by {group.assigned_by}</div>
                                )}
                              </div>

                              {/* Content items */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingRight: 8 }}>
                                {group.items.map((item, i) => (
                                  <Tooltip key={i} title={`${CONTENT_TYPE_LABELS[item.content_type] || item.content_type}: ${item.content_name}`}>
                                    <div style={{
                                      padding: '2px 7px', borderRadius: 4,
                                      background: `${CONTENT_TYPE_COLORS[item.content_type]}0c`,
                                      border: `1px solid ${CONTENT_TYPE_COLORS[item.content_type]}20`,
                                      fontSize: 10, fontWeight: 600,
                                      color: CONTENT_TYPE_COLORS[item.content_type],
                                      maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                      {item.content_name}
                                    </div>
                                  </Tooltip>
                                ))}
                              </div>

                              {/* Recipients */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingRight: 8 }}>
                                {group.recipients.slice(0, 3).map((r, i) => (
                                  <Tooltip key={i} title={`${r.type === 'student' ? 'Student' : 'Batch'}: ${r.name}`}>
                                    <div style={{
                                      display: 'flex', alignItems: 'center', gap: 3,
                                      padding: '2px 6px', borderRadius: 4,
                                      background: r.type === 'student' ? '#eff6ff' : '#f0fdf4',
                                      fontSize: 10, fontWeight: 600,
                                      color: r.type === 'student' ? '#2563eb' : '#16a34a',
                                      maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                      {r.type === 'student' ? <UserOutlined style={{ fontSize: 8 }} /> : <TeamOutlined style={{ fontSize: 8 }} />}
                                      {r.name}
                                    </div>
                                  </Tooltip>
                                ))}
                                {group.recipients.length > 3 && (
                                  <Tooltip title={group.recipients.slice(3).map(r => r.name).join(', ')}>
                                    <div style={{
                                      padding: '2px 5px', borderRadius: 4,
                                      background: '#f1f5f9', fontSize: 9, fontWeight: 700, color: '#64748b',
                                    }}>+{group.recipients.length - 3}</div>
                                  </Tooltip>
                                )}
                              </div>

                              {/* Status */}
                              <div>
                                <span style={{
                                  padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 700,
                                  textTransform: 'uppercase', letterSpacing: 0.4,
                                  background: isActive ? '#f0fdf4' : '#fef2f2',
                                  color: isActive ? '#16a34a' : '#ef4444',
                                  border: `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
                                }}>
                                  {isActive ? 'Active' : 'Expired'}
                                </span>
                              </div>

                              {/* Date */}
                              <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.4 }}>
                                <div>{new Date(group.assigned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                {group.expires_at && (
                                  <div style={{ color: group.is_expired ? '#ef4444' : '#94a3b8', fontSize: 9 }}>
                                    → {new Date(group.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div style={{ display: 'flex', gap: 4 }}>
                                <Popconfirm
                                  title="Remove assignment"
                                  description={`Remove ${group.items.length} items for ${group.recipients.length} recipient(s)?`}
                                  onConfirm={() => handleRemoveGroup(group.group_id)}
                                  okText="Remove"
                                  cancelText="Cancel"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Tooltip title="Delete">
                                    <button style={{
                                      width: 26, height: 26, borderRadius: 5,
                                      border: '1px solid #fecaca', background: '#fff',
                                      color: '#ef4444', fontSize: 11, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      transition: 'all 0.12s',
                                    }}
                                      onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                    >
                                      {removingId === group.group_id ? <LoadingOutlined spin /> : <DeleteOutlined />}
                                    </button>
                                  </Tooltip>
                                </Popconfirm>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom summary */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 16px', marginTop: 6, fontSize: 11, color: '#94a3b8',
                      }}>
                        <div style={{ display: 'flex', gap: 14 }}>
                          <span><span style={{ fontWeight: 700, color: '#22c55e' }}>{assignments.filter(a => !a.is_expired).length}</span> active</span>
                          {assignments.some(a => a.is_expired) && (
                            <span><span style={{ fontWeight: 700, color: '#ef4444' }}>{assignments.filter(a => a.is_expired).length}</span> expired</span>
                          )}
                        </div>
                        <span>{assignments.reduce((a, g) => a + g.recipients.length, 0)} total recipients</span>
                      </div>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />

        {/* Action buttons */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 20, paddingTop: 16, borderTop: '1px solid #f0f0f8',
        }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            {selectedItems.length > 0 && totalRecipients > 0
              ? `${selectedItems.length} content × ${totalRecipients} recipients = ${selectedItems.length * totalRecipients} assignments`
              : 'Select content and recipients to assign'
            }
          </div>
          <Space>
            <Button onClick={onClose} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={submitting}
              disabled={selectedItems.length === 0 || totalRecipients === 0}
              style={{
                borderRadius: 10, fontWeight: 600, height: 40,
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              Assign{submitting ? 'ing...' : selectedItems.length > 0 && totalRecipients > 0
                ? ` (${selectedItems.length * totalRecipients})`
                : ''
              }
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ExamAssignmentModal;
