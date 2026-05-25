import React, { useState, useEffect, useCallback } from 'react';
import COQuizTaking from './COQuizTaking';
import COAnalytics from './COAnalytics';
import COGlobalAnalytics from './COGlobalAnalytics';
import EESimulation from './EESimulation';
import EOSimulation from './EOSimulation';
import OutOfCreditsModal from './OutOfCreditsModal';
import EOAnalytics from './EOAnalytics';
import EOGlobalAnalytics from './EOGlobalAnalytics';
import { Breadcrumb, Empty, Spin, Tooltip, Progress } from 'antd';
import {
  ReadOutlined, FormOutlined, SoundOutlined, AudioOutlined,
  FolderOutlined, LockOutlined, UnlockOutlined, LoadingOutlined,
  ExclamationCircleFilled, ArrowLeftOutlined,
  RightOutlined, BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useResponsive from '../../hooks/useResponsive';

// ── Types ──
interface ContentNode {
  id: number; name?: string; year?: number; month?: number; month_name?: string;
  type: string; content_id?: number; icon?: string; description?: string;
  total_questions?: number; total_points?: number;
  is_assigned?: boolean; is_expired?: boolean; has_assigned_children?: boolean;
  children?: ContentNode[];
  total_count?: number;
  available_count?: number;
  child_type?: string;
  childrenLoaded?: boolean;
}

interface BreadcrumbItem { label: string; node?: ContentNode; }

const ICON_MAP: Record<string, React.ReactNode> = {
  ReadOutlined: <ReadOutlined />, FormOutlined: <FormOutlined />,
  SoundOutlined: <SoundOutlined />, AudioOutlined: <AudioOutlined />,
};

const CATEGORY_THEMES: Record<string, { gradient: string; light: string; accent: string; icon: string }> = {
  'Compréhension Écrite': { gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', light: '#eff6ff', accent: '#2563eb', icon: '#3b82f6' },
  'Compréhension Orale':  { gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', light: '#f5f3ff', accent: '#7c3aed', icon: '#8b5cf6' },
  'Expression Écrite':    { gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', light: '#fff1f2', accent: '#e11d48', icon: '#f43f5e' },
  'Expression Orale':     { gradient: 'linear-gradient(135deg, #10b981, #047857)', light: '#ecfdf5', accent: '#059669', icon: '#10b981' },
};

const getTheme = (name: string) =>
  CATEGORY_THEMES[name] || { gradient: 'linear-gradient(135deg, #6366f1, #4338ca)', light: '#eef2ff', accent: '#4f46e5', icon: '#6366f1' };

// ── Helpers ──
const countAtLevel = (nodes: ContentNode[]) => {
  const total = nodes.length;
  const available = nodes.filter(n => (n.is_assigned && !n.is_expired) || n.has_assigned_children).length;
  const locked = total - available;
  return { total, available, locked };
};

const getLevelLabel = (type: string) => {
  const MAP: Record<string, string> = {
    category: 'Categories', ce_series: 'Series', co_series: 'Series',
    ee_year: 'Years', ee_month: 'Months', ee_combinaison: 'Combinaisons',
    eo_year: 'Years', eo_month: 'Months', eo_partie: 'Parties',
  };
  return MAP[type] || 'Items';
};

// ── Status Indicator (inline) ──
const StatusDot: React.FC<{ isAssigned: boolean; isExpired: boolean; hasAssignedChildren?: boolean; size?: number }> = ({ isAssigned, isExpired, hasAssignedChildren, size = 8 }) => {
  const isAccessible = (isAssigned && !isExpired) || hasAssignedChildren;
  if (isAccessible) return (
    <Tooltip title="Available">
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
    </Tooltip>
  );
  return (
    <Tooltip title="Locked">
      <div style={{ width: size, height: size, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0, border: '1px solid #cbd5e1' }} />
    </Tooltip>
  );
};

// ── Category Card ──
const CategoryCard: React.FC<{ node: ContentNode; onClick: () => void }> = ({ node, onClick }) => {
  const isAccessible = node.is_assigned || node.has_assigned_children;
  const isFrozen = !isAccessible || (node.is_expired && !node.has_assigned_children);
  const theme = getTheme(node.name || '');
  
  const childCount = node.total_count !== undefined ? node.total_count : (node.children?.length || 0);
  const stats = node.available_count !== undefined
    ? { total: childCount, available: node.available_count, locked: childCount - node.available_count }
    : countAtLevel(node.children || []);
    
  const icon = node.icon && ICON_MAP[node.icon] ? ICON_MAP[node.icon] : <FolderOutlined />;

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.25s ease', position: 'relative',
        opacity: isFrozen ? 0.5 : 1,
        filter: isFrozen ? 'grayscale(50%)' : 'none',
        background: '#fff', height: '100%',
        border: `1px solid ${isFrozen ? '#e2e8f0' : theme.accent + '20'}`,
        boxShadow: isFrozen ? 'none' : `0 2px 12px ${theme.accent}08`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 16px 40px ${isFrozen ? 'rgba(0,0,0,0.06)' : theme.accent + '20'}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isFrozen ? 'none' : `0 2px 12px ${theme.accent}08`;
      }}
    >
      {/* Gradient header */}
      <div style={{
        background: isFrozen ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)' : theme.gradient,
        padding: '18px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 70, height: 70,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
        }} />
        <div style={{
          position: 'absolute', bottom: -15, left: '50%', width: 50, height: 50,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {node.name}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
              {node.description || 'TCF Canada'}
            </div>
          </div>

          {/* Lock/unlock icon */}
          {isFrozen ? (
            <LockOutlined style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }} />
          ) : (
            <UnlockOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 18px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{
            flex: 1, padding: '8px 10px', borderRadius: 8,
            background: stats.available > 0 ? '#f0fdf4' : '#f8fafc',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: stats.available > 0 ? '#16a34a' : '#94a3b8' }}>
              {stats.available}
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Available</div>
          </div>
          <div style={{
            flex: 1, padding: '8px 10px', borderRadius: 8,
            background: '#f8fafc', textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#64748b' }}>
              {childCount}
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total</div>
          </div>
        </div>

        {/* Progress bar */}
        {childCount > 0 && (
          <div>
            <Progress
              percent={Math.round((stats.available / childCount) * 100)}
              showInfo={false}
              size="small"
              strokeColor={isFrozen ? '#e2e8f0' : theme.accent}
              trailColor="#f1f5f9"
              style={{ marginBottom: 0 }}
            />
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 10,
        }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
            {getLevelLabel(node.child_type || node.children?.[0]?.type || 'category')}
          </span>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: isFrozen ? '#f1f5f9' : theme.light,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RightOutlined style={{ fontSize: 10, color: isFrozen ? '#cbd5e1' : theme.accent }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Item Card (series, years, months, combinaisons, parties) ──
const ItemCard: React.FC<{
  node: ContentNode; accent: string; onClick?: () => void; isLeaf?: boolean; onAnalytics?: () => void;
}> = ({ node, accent, onClick, isLeaf, onAnalytics }) => {
  const isAccessible = node.is_assigned || node.has_assigned_children;
  const isFrozen = !isAccessible || (node.is_expired && !node.has_assigned_children);
  const isExpired = node.is_assigned && node.is_expired && !node.has_assigned_children;
  const label = node.name || (node.year ? `${node.year}` : node.month_name || `#${node.content_id || node.id}`);
  const childCount = node.total_count !== undefined ? node.total_count : (node.children?.length || 0);
  const stats = node.available_count !== undefined
    ? { total: childCount, available: node.available_count, locked: childCount - node.available_count }
    : countAtLevel(node.children || []);
  const meta = node.total_questions
    ? `${node.total_questions} questions · ${node.total_points} pts`
    : childCount > 0 ? `${stats.available}/${childCount} available` : '';

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 12, padding: '16px 18px',
        border: `1.5px solid ${isFrozen ? '#e2e8f0' : accent + '25'}`,
        cursor: onClick || (isLeaf && !isFrozen) ? 'pointer' : 'default',
        transition: 'all 0.2s ease', position: 'relative',
        opacity: isFrozen ? 0.5 : 1,
        filter: isFrozen ? 'grayscale(50%)' : 'none',
        background: isFrozen ? '#fafbfc' : '#fff',
        height: '100%',
      }}
      onMouseEnter={e => {
        if (onClick || (isLeaf && !isFrozen)) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${isFrozen ? 'rgba(0,0,0,0.04)' : accent + '15'}`;
          e.currentTarget.style.borderColor = isFrozen ? '#e2e8f0' : accent + '50';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isFrozen ? '#e2e8f0' : accent + '25';
      }}
    >
      {/* Top row: status + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <StatusDot isAssigned={node.is_assigned || false} isExpired={node.is_expired || false} hasAssignedChildren={node.has_assigned_children} size={10} />
        <div style={{
          fontSize: 16, fontWeight: 700,
          color: isFrozen ? '#94a3b8' : '#1e293b',
          flex: 1,
        }}>
          {label}
        </div>
        {isFrozen && <LockOutlined style={{ color: '#cbd5e1', fontSize: 12 }} />}
        {isExpired && <ExclamationCircleFilled style={{ color: '#f59e0b', fontSize: 13 }} />}
        {!isFrozen && !isLeaf && onClick && (
          <RightOutlined style={{ color: accent, fontSize: 10 }} />
        )}
      </div>

      {/* Meta */}
      {meta && (
        <div style={{ fontSize: 11, color: isFrozen ? '#b0b8c9' : '#64748b', marginBottom: isLeaf ? 0 : 6 }}>
          {meta}
        </div>
      )}

      {/* Progress for non-leaf */}
      {!isLeaf && childCount > 0 && !isFrozen && (
        <Progress
          percent={Math.round((stats.available / childCount) * 100)}
          showInfo={false} size="small"
          strokeColor={accent} trailColor="#f1f5f9"
          style={{ marginBottom: 0, marginTop: 4 }}
        />
      )}

      {/* Buttons for leaf */}
      {isLeaf && !isFrozen && (
        <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 14px', borderRadius: 8,
            background: `linear-gradient(135deg, ${accent}, ${accent}dd)`,
            color: '#fff', fontSize: 11, fontWeight: 700,
            boxShadow: `0 2px 8px ${accent}30`,
          }}>
            <RightOutlined style={{ fontSize: 9 }} /> Pratiquer
          </div>
          {onAnalytics && (
            <div onClick={e => { e.stopPropagation(); onAnalytics(); }} style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 10px', borderRadius: 6,
              background: 'transparent', border: '1px solid #cbd5e1',
              color: '#64748b', fontSize: 10, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
            >
              Analyser
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ──
const StudentExamPreparation: React.FC = () => {
  const { apiCall } = useAuth();
  const r = useResponsive();
  const [tree, setTree] = useState<ContentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [currentNodes, setCurrentNodes] = useState<ContentNode[]>([]);
  const [currentAccent, setCurrentAccent] = useState('#059669');
  const [currentView, setCurrentView] = useState<'categories' | 'children'>('categories');
  const [quizSeriesId, setQuizSeriesId] = useState<number | null>(null);
  const [eeSimCombId, setEeSimCombId] = useState<number | null>(null);
  const [eoSimOpen, setEoSimOpen] = useState(false);
  const [eoSimPartieId, setEoSimPartieId] = useState<number | null>(null);
  const [analyticsTarget, setAnalyticsTarget] = useState<{ id: number; name: string } | null>(null);
  const [eoAnalyticsTarget, setEoAnalyticsTarget] = useState<{ id: number; name: string } | null>(null);
  const [eoGlobalAnalyticsOpen, setEoGlobalAnalyticsOpen] = useState(false);
  const [credits, setCredits] = useState<{ ee_credits: number; eo_credits: number } | null>(null);
  const [outOfCreditsType, setOutOfCreditsType] = useState<'ee' | 'eo' | null>(null);

  // Refresh the student's credit balance (called after a simulation start consumes one)
  const refreshCredits = useCallback(async () => {
    try {
      const res = await apiCall('/ai-credits/me');
      if (res.ok) setCredits(await res.json());
    } catch { /* silent */ }
  }, [apiCall]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiCall('/ai-credits/me');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCredits(data);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [apiCall]);

  const fetchTree = useCallback(async (preserveState = false) => {
    if (!preserveState) setLoading(true);
    try {
      const resp = await apiCall('/tcf/student/content-tree');
      if (resp.ok) {
        const data = await resp.json();
        setTree(data);
        
        if (!preserveState) {
          setCurrentNodes(data);
          setCurrentView('categories');
          setBreadcrumbs([]);
        } else {
          setBreadcrumbs(currentBreadcrumbs => {
            let currentList = data;
            const newBreadcrumbs = [];
            for (const bc of currentBreadcrumbs) {
              const match = currentList.find((n: ContentNode) => {
                if (n.type !== bc.node?.type) return false;
                if (n.id && bc.node?.id && String(n.id) === String(bc.node.id)) return true;
                if (n.content_id && bc.node?.content_id && String(n.content_id) === String(bc.node.content_id)) return true;
                if (n.name && bc.node?.name && n.name === bc.node.name) return true;
                if (n.year && bc.node?.year && String(n.year) === String(bc.node.year)) return true;
                if (n.month && bc.node?.month && String(n.month) === String(bc.node.month)) return true;
                return false;
              });
              if (match) {
                newBreadcrumbs.push({ ...bc, node: match });
                currentList = match.children || [];
              } else {
                break;
              }
            }
            setCurrentNodes(currentList);
            setCurrentView(newBreadcrumbs.length === 0 ? 'categories' : 'children');
            return newBreadcrumbs;
          });
        }
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [apiCall]);

  useEffect(() => { fetchTree(true); }, []); // Use preserveState=true to survive React StrictMode double mounts without wiping navigation

  const LEAF_TYPES = ['ce_series', 'co_series', 'ee_combinaison', 'eo_partie'];

  const navigateToChildren = async (node: ContentNode) => {
    const isLeaf = LEAF_TYPES.includes(node.type);
    if (isLeaf) return;

    let children = node.children || [];
    if (!node.childrenLoaded) {
      setLoading(true);
      try {
        const resp = await apiCall(`/tcf/student/content-tree/children?parentType=${node.type}&parentId=${node.content_id || node.id}`);
        if (resp.ok) {
          const data = await resp.json();
          children = data;
          node.children = data;
          node.childrenLoaded = true;
        }
      } catch (err) {
        console.error('Error fetching children:', err);
      } finally {
        setLoading(false);
      }
    }

    if (children.length === 0) return;
    const theme = getTheme(node.name || '');
    const label = node.name || (node.year ? `${node.year}` : node.month_name || '');

    setBreadcrumbs(prev => [...prev, { label, node }]);
    setCurrentNodes(children);
    if (breadcrumbs.length === 0) setCurrentAccent(theme.accent);
    setCurrentView('children');
  };

  const refreshCurrentView = async () => {
    if (breadcrumbs.length === 0) {
      await fetchTree(false);
    } else {
      const activeNode = breadcrumbs[breadcrumbs.length - 1].node;
      if (activeNode) {
        setLoading(true);
        try {
          const resp = await apiCall(`/tcf/student/content-tree/children?parentType=${activeNode.type}&parentId=${activeNode.content_id || activeNode.id}`);
          if (resp.ok) {
            const data = await resp.json();
            activeNode.children = data;
            activeNode.childrenLoaded = true;
            setCurrentNodes(data);
          }
        } catch (err) {
          console.error('Error refreshing current view:', err);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const navigateBack = () => {
    if (breadcrumbs.length <= 1) {
      setBreadcrumbs([]); setCurrentNodes(tree); setCurrentView('categories');
      return;
    }
    const nb = breadcrumbs.slice(0, -1);
    setBreadcrumbs(nb);
    setCurrentNodes(nb[nb.length - 1].node?.children || tree);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) { setBreadcrumbs([]); setCurrentNodes(tree); setCurrentView('categories'); return; }
    const nb = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(nb);
    setCurrentNodes(nb[nb.length - 1].node?.children || tree);
  };

  const stats = countAtLevel(currentNodes);
  const isLeafLevel = currentNodes.length > 0 && currentNodes.every(n => LEAF_TYPES.includes(n.type));
  const currentTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : '';
  const isCOSection = breadcrumbs.some(b => b.label?.includes('Compréhension Orale') || b.node?.name?.includes('Compréhension Orale'));
  const isEOSection = breadcrumbs.some(b => b.label?.includes('Expression Orale') || b.node?.name?.includes('Expression Orale'));
  const [showGlobalAnalytics, setShowGlobalAnalytics] = useState(false);

  return (
    <div className="student-portal">
      {/* ═══ Hero Banner ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)',
        borderRadius: r.isCompact ? 14 : 18,
        padding: r.isCompact ? '18px 20px' : r.isSmallDesktop ? '22px 26px' : '28px 32px',
        marginBottom: r.isCompact ? 16 : 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '25%', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: r.isCompact ? 18 : r.isSmallDesktop ? 21 : 24, fontWeight: 800, color: '#fff', letterSpacing: -0.3, marginBottom: 5 }}>
              🇨🇦 TCF Canada — Exam Preparation
            </div>
            <div style={{ fontSize: r.isCompact ? 12 : 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
              Practice your assigned exam content. Locked items require admin assignment.
            </div>
          </div>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '10px 18px',
              border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              textAlign: 'center', minWidth: 70,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stats.available}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>Available</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.14)', borderRadius: 12, padding: '10px 18px',
              border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              textAlign: 'center', minWidth: 70,
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stats.total}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>Total</div>
            </div>
            {stats.locked > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 18px',
                border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: 70,
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>{stats.locked}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>Locked</div>
              </div>
            )}
            {credits && (
              <>
                <div style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  backdropFilter: 'blur(8px)',
                }}>
                  <FormOutlined style={{ color: '#fda4af', fontSize: 18 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      EE credits
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                      {credits.ee_credits}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  backdropFilter: 'blur(8px)',
                }}>
                  <AudioOutlined style={{ color: '#86efac', fontSize: 18 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      EO credits
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>
                      {credits.eo_credits}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Breadcrumb + Title ═══ */}
      {breadcrumbs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Breadcrumb
            items={[
              { title: <span onClick={() => navigateToBreadcrumb(-1)} style={{ cursor: 'pointer', color: currentAccent, fontWeight: 600, fontSize: 12 }}>📖 Exam Preparation</span> },
              ...breadcrumbs.map((b, i) => ({
                title: <span onClick={() => navigateToBreadcrumb(i)} style={{ cursor: i < breadcrumbs.length - 1 ? 'pointer' : 'default', color: i < breadcrumbs.length - 1 ? currentAccent : '#1e293b', fontWeight: i < breadcrumbs.length - 1 ? 600 : 700, fontSize: 12 }}>{b.label}</span>,
              })),
            ]}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <div
              onClick={navigateBack}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: currentAccent + '0c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: currentAccent, fontSize: 14,
                border: `1px solid ${currentAccent}18`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = currentAccent + '18'; }}
              onMouseLeave={e => { e.currentTarget.style.background = currentAccent + '0c'; }}
            >
              <ArrowLeftOutlined />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                {currentTitle}
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {stats.available} of {stats.total} {getLevelLabel(currentNodes[0]?.type || 'category').toLowerCase()} available
              </div>
            </div>
            {isCOSection && (
              <button
                onClick={() => setShowGlobalAnalytics(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  border: 'none', cursor: 'pointer', letterSpacing: 0.3,
                  boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.3)'; }}
              >
                <BarChartOutlined /> Global Analytics
              </button>
            )}
            {isEOSection && (
              <button
                onClick={() => setEoGlobalAnalyticsOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  border: 'none', cursor: 'pointer', letterSpacing: 0.3,
                  boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(16,185,129,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.3)'; }}
              >
                <BarChartOutlined /> Analyser la performance
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══ Legend (categories view only) ═══ */}
      {currentView === 'categories' && !loading && (
        <div style={{
          display: 'flex', gap: 20, marginBottom: 18, padding: '10px 16px',
          background: '#f9fafb', borderRadius: 10, border: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4b5563' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> Available
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4b5563' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e2e8f0', border: '1px solid #cbd5e1' }} /> Locked
          </div>

        </div>
      )}

      {/* ═══ Content ═══ */}
      {quizSeriesId ? (
        <COQuizTaking seriesId={quizSeriesId} onBack={() => { setQuizSeriesId(null); refreshCurrentView(); }} />
      ) : loading ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '100px 20px', gap: 16,
        }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#059669' }} spin />} />
          <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 500 }}>Loading exam content...</div>
        </div>
      ) : currentNodes.length === 0 ? (
        <Empty description="No content available" style={{ padding: 80 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : currentView === 'categories' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {currentNodes.map((node, i) => (
            <CategoryCard key={`cat-${node.id}-${i}`} node={node} onClick={() => navigateToChildren(node)} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {currentNodes.map((node, i) => {
            const isLeaf = LEAF_TYPES.includes(node.type);
            const handleClick = () => {
              if (!isLeaf) {
                navigateToChildren(node);
              } else if (isLeaf && node.type === 'co_series' && node.content_id) {
                setQuizSeriesId(node.content_id);
              } else if (isLeaf && node.type === 'ee_combinaison' && node.content_id) {
                // Expression Écrite: check credits BEFORE opening the simulation modal
                if (credits && credits.ee_credits <= 0) {
                  setOutOfCreditsType('ee');
                  return;
                }
                setEeSimCombId(node.content_id);
              } else if (isLeaf && node.type === 'eo_partie' && node.content_id) {
                // Expression Orale: check credits BEFORE opening the simulation modal
                if (credits && credits.eo_credits <= 0) {
                  setOutOfCreditsType('eo');
                  return;
                }
                // Launch simulation for THIS specific partie
                setEoSimPartieId(node.content_id);
                setEoSimOpen(true);
              }
            };
            return (
              <ItemCard
                key={`item-${node.type}-${node.content_id || node.id}-${i}`}
                node={node} accent={currentAccent} isLeaf={isLeafLevel}
                onClick={handleClick}
                onAnalytics={
                  isLeaf && node.type === 'co_series' && node.content_id
                    ? () => { setAnalyticsTarget({ id: node.content_id!, name: node.name || `Série ${node.content_id}` }); }
                    : isLeaf && node.type === 'eo_partie' && node.content_id
                      ? () => { setEoAnalyticsTarget({ id: node.content_id!, name: node.name || `Partie ${node.content_id}` }); }
                      : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsTarget && (
        <COAnalytics seriesId={analyticsTarget.id} seriesName={analyticsTarget.name} open={!!analyticsTarget} onClose={() => setAnalyticsTarget(null)} />
      )}
      <COGlobalAnalytics open={showGlobalAnalytics} onClose={() => setShowGlobalAnalytics(false)} />
      {eeSimCombId && (
        <EESimulation
          combinaisonId={eeSimCombId}
          open={!!eeSimCombId}
          onClose={() => { setEeSimCombId(null); refreshCurrentView(); }}
          onCreditConsumed={refreshCredits}
          onOutOfCredits={() => { setEeSimCombId(null); setOutOfCreditsType('ee'); refreshCredits(); }}
        />
      )}
      <EOSimulation
        open={eoSimOpen}
        partieId={eoSimPartieId}
        onClose={() => { setEoSimOpen(false); setEoSimPartieId(null); refreshCurrentView(); }}
        onCreditConsumed={refreshCredits}
        onOutOfCredits={() => { setEoSimOpen(false); setEoSimPartieId(null); setOutOfCreditsType('eo'); refreshCredits(); }}
      />
      <OutOfCreditsModal
        open={outOfCreditsType !== null}
        type={outOfCreditsType}
        onClose={() => setOutOfCreditsType(null)}
      />
      {eoAnalyticsTarget && (
        <EOAnalytics
          partieId={eoAnalyticsTarget.id}
          partieName={eoAnalyticsTarget.name}
          open={!!eoAnalyticsTarget}
          onClose={() => setEoAnalyticsTarget(null)}
        />
      )}
      <EOGlobalAnalytics open={eoGlobalAnalyticsOpen} onClose={() => setEoGlobalAnalyticsOpen(false)} />
    </div>
  );
};

export default StudentExamPreparation;
