import React from 'react';
import { Button, Breadcrumb, Tag, Skeleton, Space, Modal, message } from 'antd';
import { Typography } from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

// ============================================================
// EO Types (re-exported for use in main component)
// ============================================================
export interface EoPointAborder {
  id: number;
  tache_id: number;
  point_number: number;
  title: string;
  subtitle: string | null;
}

export interface EoSujet {
  id: number;
  tache_id: number;
  sujet_number: number;
  prompt_text: string;
  duration_seconds: number | null;
  correction_text: string | null;
}

export interface EoTache {
  id: number;
  partie_id: number;
  task_number: number;
  task_type: 'presentation' | 'interaction' | 'argumentation';
  prompt_text: string | null;
  prep_minutes: number;
  duration_minutes: number;
  points?: EoPointAborder[];
  sujets?: EoSujet[];
}

export interface EoPartie {
  id: number;
  month_id: number;
  name: string;
  display_order: number;
  taches: EoTache[];
  created_at: string;
  updated_at: string;
}

export interface EoYear {
  id: number;
  category_id: number;
  year: number;
  month_count: number;
  created_at: string;
}

export interface EoMonth {
  id: number;
  year_id: number;
  month: number;
  month_name: string;
  partie_count: number;
  created_at: string;
}

const EO_TASK_TYPE_LABELS: Record<string, string> = {
  presentation: 'Présentation',
  interaction: 'Interaction orale',
  argumentation: 'Argumentation',
};

const EO_TASK_COLORS: Record<number, string> = {
  1: '#3b82f6',
  2: '#6366f1',
  3: '#8b5cf6',
};

const EO_TASK_DEFAULTS: Record<number, { type: string; prep: number; dur: number }> = {
  1: { type: 'presentation', prep: 0, dur: 2 },
  2: { type: 'interaction', prep: 2, dur: 3.5 },
  3: { type: 'argumentation', prep: 0, dur: 4.5 },
};

function formatDuration(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}

function formatSeconds(sec: number | null): string {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}

// ============================================================
// Props for the render helpers
// ============================================================
interface EoRenderProps {
  // Data
  eoYears: EoYear[];
  eoMonths: EoMonth[];
  eoParties: EoPartie[];
  loading: boolean;
  // Selected state
  selectedCategoryId: number | null;
  selectedCategoryName: string;
  selectedEoYearId: number | null;
  selectedEoYear: number | null;
  selectedEoMonthId: number | null;
  selectedEoMonthName: string;
  viewingPartie: EoPartie | null;
  eoCorrectionVisible: Record<number, boolean>;
  // Setters
  setSelectedEoYearId: (v: number | null) => void;
  setSelectedEoYear: (v: number | null) => void;
  setSelectedEoMonthId: (v: number | null) => void;
  setSelectedEoMonthName: (v: string) => void;
  setViewingPartie: (v: EoPartie | null) => void;
  setEoCorrectionVisible: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  setView: (v: string) => void;
  // Modal openers
  setEoYearModalOpen: (v: boolean) => void;
  setEoMonthModalOpen: (v: boolean) => void;
  setEoPartieModalOpen: (v: boolean) => void;
  setEditingPartie: (v: EoPartie | null) => void;
  setEoTacheModalOpen: (v: boolean) => void;
  setEditingEoTache: (v: EoTache | null) => void;
  setEditingEoTacheNumber: (v: number) => void;
  setEditingEoTachePartieId: (v: number) => void;
  setEoPointModalOpen: (v: boolean) => void;
  setEditingEoPoint: (v: EoPointAborder | null) => void;
  setEditingEoPointTacheId: (v: number) => void;
  setEditingEoPointNextNum: (v: number) => void;
  setEoSujetModalOpen: (v: boolean) => void;
  setEditingEoSujet: (v: EoSujet | null) => void;
  setEditingEoSujetTacheId: (v: number) => void;
  setEditingEoSujetNextNum: (v: number) => void;
  // Actions
  navigateBack: () => void;
  fetchEoYears: () => void;
  fetchEoMonths: () => void;
  fetchEoParties: () => void;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
  setCategoryType: (v: string) => void;
  setSelectedCategoryId: (v: number | null) => void;
  setSelectedCategoryName: (v: string) => void;
  setEoYears: (v: EoYear[]) => void;
  setEoMonths: (v: EoMonth[]) => void;
  setEoParties: (v: EoPartie[]) => void;
  setEoImportModalOpen: (v: boolean) => void;
}

// ════════════════════════════════════════════════════════════
// RENDER: EO Years View
// ════════════════════════════════════════════════════════════
export const renderEoYearsView = (p: EoRenderProps) => {
  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 20, fontSize: 13 }}
        items={[
          { title: <a onClick={() => { p.setSelectedCategoryId(null); p.setSelectedCategoryName(''); p.setCategoryType('ce'); p.setEoYears([]); p.setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
          { title: <span style={{ color: '#475569', fontWeight: 600 }}>{p.selectedCategoryName}</span> },
        ]}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={p.navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>🎤 {p.selectedCategoryName}</div>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{p.eoYears.length} year{p.eoYears.length !== 1 ? 's' : ''}</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<FolderOpenOutlined />} onClick={() => p.setEoImportModalOpen(true)} style={{ borderRadius: 10, height: 36, fontWeight: 600, border: '1px solid #c7d2fe', color: '#4338ca', background: '#f8f9ff' }}>
            Import from File
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoYearModalOpen(true)} style={{ borderRadius: 10, height: 36, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
            Add Year
          </Button>
        </div>
      </div>
      {p.loading && p.eoYears.length === 0 ? (
        <div style={{ display: 'flex', gap: 12 }}>{[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ height: 80, borderRadius: 12, width: 140 }} />)}</div>
      ) : p.eoYears.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>No years yet</div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoYearModalOpen(true)} style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}>Add First Year</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {p.eoYears.map(y => (
            <div key={y.id}
              onClick={() => { p.setSelectedEoYearId(y.id); p.setSelectedEoYear(y.year); p.setView('eo-months'); }}
              style={{ padding: '16px 24px', borderRadius: 12, background: '#fff', border: '1px solid #e8e8f4', cursor: 'pointer', minWidth: 120, textAlign: 'center', position: 'relative', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(99,102,241,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8f4'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(99,102,241,0.04)'; }}
            >
              <div style={{ position: 'absolute', top: 4, right: 4 }} onClick={e => e.stopPropagation()}>
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                  Modal.confirm({ title: 'Delete Year', content: `Delete ${y.year} and all its data?`, okText: 'Delete', okType: 'danger', onOk: async () => {
                    try { const resp = await p.apiCall(`/tcf/eo/years/${y.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Year deleted'); p.fetchEoYears(); } else { message.error('Failed'); } } catch { message.error('Failed'); }
                  }});
                }} style={{ borderRadius: 6, width: 24, height: 24 }} />
              </div>
              <CalendarOutlined style={{ fontSize: 20, color: '#6366f1', marginBottom: 6 }} />
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{y.year}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{y.month_count} month{y.month_count !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// RENDER: EO Months View
// ════════════════════════════════════════════════════════════
export const renderEoMonthsView = (p: EoRenderProps) => {
  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 20, fontSize: 13 }}
        items={[
          { title: <a onClick={() => { p.setSelectedCategoryId(null); p.setSelectedCategoryName(''); p.setCategoryType('ce'); p.setEoYears([]); p.setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
          { title: <a onClick={() => { p.setSelectedEoYearId(null); p.setSelectedEoYear(null); p.setEoMonths([]); p.setView('eo-years'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{p.selectedCategoryName}</a> },
          { title: <span style={{ color: '#475569', fontWeight: 600 }}>{p.selectedEoYear}</span> },
        ]}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={p.navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>{p.selectedEoYear}</div>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{p.eoMonths.length} month{p.eoMonths.length !== 1 ? 's' : ''}</Text>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoMonthModalOpen(true)} style={{ borderRadius: 10, height: 36, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
          Add Month
        </Button>
      </div>
      {p.loading && p.eoMonths.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>{[1, 2, 3].map(i => <Skeleton.Button key={i} active style={{ height: 80, borderRadius: 12, width: '100%' }} block />)}</div>
      ) : p.eoMonths.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>No months yet</div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => p.setEoMonthModalOpen(true)} style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}>Add First Month</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {p.eoMonths.map(m => (
            <div key={m.id}
              onClick={() => { p.setSelectedEoMonthId(m.id); p.setSelectedEoMonthName(m.month_name); p.setView('eo-parties'); }}
              style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #e8e8f4', cursor: 'pointer', position: 'relative', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(99,102,241,0.04)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99,102,241,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8f4'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(99,102,241,0.04)'; }}
            >
              <div style={{ position: 'absolute', top: 4, right: 4 }} onClick={e => e.stopPropagation()}>
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                  Modal.confirm({ title: 'Delete Month', content: `Delete ${m.month_name} and all its parties?`, okText: 'Delete', okType: 'danger', onOk: async () => {
                    try { const resp = await p.apiCall(`/tcf/eo/months/${m.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); p.fetchEoMonths(); } else { message.error('Failed'); } } catch { message.error('Failed'); }
                  }});
                }} style={{ borderRadius: 6, width: 24, height: 24 }} />
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>{m.month}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{m.month_name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{m.partie_count} partie{m.partie_count !== 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ════════════════════════════════════════════════════════════
// RENDER: EO Parties View (grid of parties for a month)
// ════════════════════════════════════════════════════════════
export const renderEoPartiesView = (p: EoRenderProps) => {
  const handleDeletePartie = (partie: EoPartie) => {
    Modal.confirm({
      title: 'Delete Partie',
      content: `Delete "${partie.name}" and all its tâches, sujets, and points?`,
      okText: 'Delete', okType: 'danger',
      onOk: async () => {
        try {
          const resp = await p.apiCall(`/tcf/eo/parties/${partie.id}`, { method: 'DELETE' });
          if (resp.ok) { message.success('Deleted'); p.fetchEoParties(); }
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
          { title: <a onClick={() => { p.setSelectedCategoryId(null); p.setSelectedCategoryName(''); p.setCategoryType('ce'); p.setEoYears([]); p.setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
          { title: <a onClick={() => { p.setSelectedEoYearId(null); p.setSelectedEoYear(null); p.setEoMonths([]); p.setView('eo-years'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{p.selectedCategoryName}</a> },
          { title: <a onClick={() => { p.setSelectedEoMonthId(null); p.setSelectedEoMonthName(''); p.setEoParties([]); p.setView('eo-months'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{p.selectedEoYear}</a> },
          { title: <span style={{ color: '#475569', fontWeight: 600 }}>{p.selectedEoMonthName}</span> },
        ]}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={p.navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>{p.selectedEoMonthName} {p.selectedEoYear}</div>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>{p.eoParties.length} partie{p.eoParties.length !== 1 ? 's' : ''}</Text>
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { p.setEditingPartie(null); p.setEoPartieModalOpen(true); }} style={{ borderRadius: 10, height: 36, fontWeight: 600, background: 'linear-gradient(135deg, #4338ca, #6366f1)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}>
          Add Partie
        </Button>
      </div>
      {p.loading && p.eoParties.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <Skeleton.Button key={i} active style={{ height: 80, borderRadius: 12, width: '100%' }} block />)}
        </div>
      ) : p.eoParties.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fafbff', borderRadius: 16, border: '2px dashed #e0e7ff' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎤</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4338ca', marginBottom: 8 }}>No parties yet</div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { p.setEditingPartie(null); p.setEoPartieModalOpen(true); }} style={{ borderRadius: 10, height: 40, fontWeight: 600, background: '#4338ca', borderColor: '#4338ca' }}>Add First Partie</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 8 }}>
          {p.eoParties.map(partie => {
            const tacheCount = partie.taches.length;
            const sujetCount = partie.taches.reduce((sum, t) => sum + (t.sujets?.length || 0) + (t.points?.length || 0), 0);
            return (
              <div key={partie.id} style={{ borderRadius: 10, border: '1px solid #e8e8f4', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 4px rgba(99,102,241,0.04)' }}>
                <div
                  onClick={() => { p.setViewingPartie(partie); p.setView('eo-partie-detail'); }}
                  style={{ padding: '10px', cursor: 'pointer', background: '#fff', textAlign: 'center', position: 'relative', transition: 'background 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f8f9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ position: 'absolute', top: 3, right: 3, display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingPartie(partie); p.setEoPartieModalOpen(true); }} style={{ borderRadius: 4, color: '#6366f1', width: 18, height: 18, fontSize: 9 }} />
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeletePartie(partie)} style={{ borderRadius: 4, width: 18, height: 18, fontSize: 9 }} />
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #4338ca)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, marginBottom: 4 }}>
                    {partie.display_order || '—'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partie.name}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>{tacheCount}/3 tâches · {sujetCount} items</div>
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
// RENDER: EO Partie Detail View
// ════════════════════════════════════════════════════════════
export const renderEoPartieDetailView = (p: EoRenderProps) => {
  const partie = p.viewingPartie;
  if (!partie) return null;

  // Refresh partie data from eoParties list
  const freshPartie = p.eoParties.find(pp => pp.id === partie.id) || partie;

  const renderTache1 = (tache: EoTache) => {
    const points = tache.points || [];
    return (
      <div style={{ padding: '16px', borderRadius: 12, background: '#fff', border: '1px solid #e8e8f4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${EO_TASK_COLORS[1]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>🎤</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Tâche 1 — Présentation</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Durée: {formatDuration(tache.duration_minutes)} · Pas de préparation</div>
            </div>
          </div>
          <Space size={4}>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingEoTache(tache); p.setEditingEoTacheNumber(1); p.setEditingEoTachePartieId(partie.id); p.setEoTacheModalOpen(true); }} style={{ borderRadius: 6, color: '#6366f1', width: 28, height: 28 }} />
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
              Modal.confirm({ title: 'Delete Tâche 1', content: 'Delete this tâche and all its points?', okText: 'Delete', okType: 'danger', onOk: async () => {
                const resp = await p.apiCall(`/tcf/eo/taches/${tache.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); p.fetchEoParties(); }
              }});
            }} style={{ borderRadius: 6, width: 28, height: 28 }} />
          </Space>
        </div>
        {tache.prompt_text && (
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 12, padding: '10px 14px', background: '#f8f9ff', borderRadius: 8, border: '1px solid #eef2ff' }}>
            {tache.prompt_text}
          </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Points à aborder</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {points.sort((a, b) => a.point_number - b.point_number).map(pt => (
            <div key={pt.id} style={{ padding: '10px 12px', borderRadius: 10, background: '#fafbff', border: '1px solid #f0f0f8', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 1 }}>
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingEoPoint(pt); p.setEditingEoPointTacheId(tache.id); p.setEditingEoPointNextNum(pt.point_number); p.setEoPointModalOpen(true); }} style={{ width: 18, height: 18, fontSize: 9, color: '#6366f1', borderRadius: 4 }} />
                <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                  Modal.confirm({ title: 'Delete Point', content: `Delete "${pt.title}"?`, okText: 'Delete', okType: 'danger', onOk: async () => {
                    const resp = await p.apiCall(`/tcf/eo/points/${pt.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); p.fetchEoParties(); }
                  }});
                }} style={{ width: 18, height: 18, fontSize: 9, borderRadius: 4 }} />
              </div>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: EO_TASK_COLORS[1], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, marginBottom: 6 }}>
                {pt.point_number}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{pt.title}</div>
              {pt.subtitle && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{pt.subtitle}</div>}
            </div>
          ))}
          {points.length < 4 && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => { p.setEditingEoPoint(null); p.setEditingEoPointTacheId(tache.id); p.setEditingEoPointNextNum(points.length + 1); p.setEoPointModalOpen(true); }}
              style={{ borderRadius: 10, height: '100%', minHeight: 60, color: '#6366f1', borderColor: '#c7d2fe' }}
            >
              Add Point
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderTache23 = (tache: EoTache) => {
    const sujets = tache.sujets || [];
    const isInteraction = tache.task_number === 2;
    const color = EO_TASK_COLORS[tache.task_number];
    const label = EO_TASK_TYPE_LABELS[tache.task_type];
    const icon = isInteraction ? '💬' : '🗣️';

    return (
      <div style={{ padding: '16px', borderRadius: 12, background: '#fff', border: '1px solid #e8e8f4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>Tâche {tache.task_number} — {label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>
                {tache.prep_minutes > 0 ? `Prép. ${formatDuration(tache.prep_minutes)} · ` : ''}Durée: {formatDuration(tache.duration_minutes)} · {sujets.length} sujet{sujets.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <Space size={4}>
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingEoTache(tache); p.setEditingEoTacheNumber(tache.task_number); p.setEditingEoTachePartieId(partie.id); p.setEoTacheModalOpen(true); }} style={{ borderRadius: 6, color: '#6366f1', width: 28, height: 28 }} />
            <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
              Modal.confirm({ title: `Delete Tâche ${tache.task_number}`, content: 'Delete this tâche and all its sujets?', okText: 'Delete', okType: 'danger', onOk: async () => {
                const resp = await p.apiCall(`/tcf/eo/taches/${tache.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); p.fetchEoParties(); }
              }});
            }} style={{ borderRadius: 6, width: 28, height: 28 }} />
          </Space>
        </div>
        {tache.prompt_text && (
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 12, padding: '10px 14px', background: '#f8f9ff', borderRadius: 8, border: '1px solid #eef2ff' }}>
            {tache.prompt_text}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sujets.sort((a, b) => a.sujet_number - b.sujet_number).map(sujet => {
            const showCorr = p.eoCorrectionVisible[sujet.id];
            return (
              <div key={sujet.id} style={{ padding: '10px 14px', borderRadius: 10, background: '#fafbff', border: '1px solid #f0f0f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Tag style={{ borderRadius: 4, fontSize: 10, fontWeight: 700, margin: 0, padding: '0 6px', background: `${color}15`, color: color, border: 'none' }}>S{sujet.sujet_number}</Tag>
                    {sujet.duration_seconds && (
                      <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <ClockCircleOutlined style={{ fontSize: 9 }} /> {formatSeconds(sujet.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <Space size={2}>
                    <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { p.setEditingEoSujet(sujet); p.setEditingEoSujetTacheId(tache.id); p.setEditingEoSujetNextNum(sujet.sujet_number); p.setEoSujetModalOpen(true); }} style={{ width: 20, height: 20, fontSize: 10, color: '#6366f1', borderRadius: 4 }} />
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                      Modal.confirm({ title: 'Delete Sujet', content: `Delete sujet ${sujet.sujet_number}?`, okText: 'Delete', okType: 'danger', onOk: async () => {
                        const resp = await p.apiCall(`/tcf/eo/sujets/${sujet.id}`, { method: 'DELETE' }); if (resp.ok) { message.success('Deleted'); p.fetchEoParties(); }
                      }});
                    }} style={{ width: 20, height: 20, fontSize: 10, borderRadius: 4 }} />
                  </Space>
                </div>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{sujet.prompt_text}</div>
                {sujet.correction_text && (
                  <div style={{ marginTop: 6 }}>
                    <Button size="small" type="link" onClick={() => p.setEoCorrectionVisible(prev => ({ ...prev, [sujet.id]: !prev[sujet.id] }))} style={{ padding: 0, fontSize: 11, color: '#6366f1', fontWeight: 600 }}>
                      {showCorr ? '🔽 Masquer correction' : '📝 Voir correction'}
                    </Button>
                    {showCorr && (
                      <div style={{ marginTop: 4, padding: '8px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: 11, color: '#334155', whiteSpace: 'pre-wrap' }}>{sujet.correction_text}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <Button
            type="dashed"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => { p.setEditingEoSujet(null); p.setEditingEoSujetTacheId(tache.id); p.setEditingEoSujetNextNum(sujets.length + 1); p.setEoSujetModalOpen(true); }}
            style={{ borderRadius: 8, color: '#6366f1', borderColor: '#c7d2fe', fontSize: 12 }}
          >
            Add Sujet
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 20, fontSize: 13 }}
        items={[
          { title: <a onClick={() => { p.setSelectedCategoryId(null); p.setSelectedCategoryName(''); p.setCategoryType('ce'); p.setEoYears([]); p.setView('categories'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>📋 Exam Preparation</a> },
          { title: <a onClick={() => { p.setSelectedEoYearId(null); p.setSelectedEoYear(null); p.setEoMonths([]); p.setView('eo-years'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{p.selectedCategoryName}</a> },
          { title: <a onClick={() => { p.setSelectedEoMonthId(null); p.setSelectedEoMonthName(''); p.setEoParties([]); p.setView('eo-months'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{p.selectedEoYear}</a> },
          { title: <a onClick={() => { p.setViewingPartie(null); p.setEoCorrectionVisible({}); p.setView('eo-parties'); }} style={{ cursor: 'pointer', color: '#6366f1', fontWeight: 600 }}>{p.selectedEoMonthName}</a> },
          { title: <span style={{ color: '#475569', fontWeight: 600 }}>{freshPartie.name}</span> },
        ]}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={p.navigateBack} style={{ borderRadius: 10, border: '1px solid #e0e7ff', color: '#4338ca' }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', letterSpacing: -0.3 }}>{freshPartie.name}</div>
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>{freshPartie.taches.length}/3 tâches</Text>
        </div>
      </div>

      {/* Tâche tabs summary */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[1, 2, 3].map(num => {
          const tache = freshPartie.taches.find(t => t.task_number === num);
          const defaults = EO_TASK_DEFAULTS[num];
          const label = EO_TASK_TYPE_LABELS[defaults.type];
          const color = EO_TASK_COLORS[num];
          return (
            <div key={num} style={{ flex: '1 1 0', minWidth: 140, padding: '10px 14px', borderRadius: 10, background: tache ? `${color}08` : '#fafafa', border: `1.5px solid ${tache ? color : '#e5e7eb'}`, textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tache ? color : '#94a3b8' }}>Tâche {num}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
              {tache ? (
                <Tag style={{ marginTop: 4, borderRadius: 4, fontSize: 9, background: '#f0fdf4', color: '#15803d', border: 'none' }}>✓ Created</Tag>
              ) : (
                <Tag style={{ marginTop: 4, borderRadius: 4, fontSize: 9, background: '#fef3c7', color: '#b45309', border: 'none' }}>Missing</Tag>
              )}
            </div>
          );
        })}
      </div>

      {/* Render each tâche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {freshPartie.taches.sort((a, b) => a.task_number - b.task_number).map(tache => {
          if (tache.task_number === 1) return <React.Fragment key={tache.id}>{renderTache1(tache)}</React.Fragment>;
          return <React.Fragment key={tache.id}>{renderTache23(tache)}</React.Fragment>;
        })}

        {/* Add missing tâches */}
        {(() => {
          const existing = new Set(freshPartie.taches.map(t => t.task_number));
          const missing = [1, 2, 3].filter(n => !existing.has(n));
          if (missing.length === 0) return null;
          return (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {missing.map(num => {
                const defaults = EO_TASK_DEFAULTS[num];
                return (
                  <Button key={num} icon={<PlusOutlined />}
                    onClick={() => { p.setEditingEoTache(null); p.setEditingEoTacheNumber(num); p.setEditingEoTachePartieId(freshPartie.id); p.setEoTacheModalOpen(true); }}
                    style={{ borderRadius: 10, fontSize: 12, color: '#6366f1', borderColor: '#c7d2fe', background: '#f8f9ff', height: 40 }}>
                    Add Tâche {num} ({EO_TASK_TYPE_LABELS[defaults.type]})
                  </Button>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
