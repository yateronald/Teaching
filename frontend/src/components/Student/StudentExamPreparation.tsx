import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider, Empty, Skeleton, Tooltip, message } from 'antd';
import {
  ReadOutlined, FormOutlined, SoundOutlined, AudioOutlined, FolderOutlined, LockOutlined,
  LoadingOutlined, ArrowLeftOutlined, RightOutlined, BarChartOutlined, PlayCircleOutlined,
  ClockCircleOutlined, InfoCircleOutlined, CalendarOutlined, CheckCircleFilled, ThunderboltOutlined,
} from '@ant-design/icons';
import COQuizTaking from './COQuizTaking';
import COAnalytics from './COAnalytics';
import COGlobalAnalytics from './COGlobalAnalytics';
import EESimulation from './EESimulation';
import EOSimulation from './EOSimulation';
import OutOfCreditsModal from './OutOfCreditsModal';
import EOAnalytics from './EOAnalytics';
import EOGlobalAnalytics from './EOGlobalAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import './StudentExamPreparation.css';

/* ── Content tree (loaded one level at a time from /tcf/student/content-tree) ── */
interface ContentNode {
  id: number; name?: string; year?: number; month?: number; month_name?: string;
  type: string; content_id?: number; icon?: string; description?: string;
  total_questions?: number; total_points?: number;
  is_assigned?: boolean; is_expired?: boolean; has_assigned_children?: boolean;
  total_count?: number; available_count?: number; child_type?: string;
}

type Skill = { key: 'ce' | 'co' | 'ee' | 'eo'; english: string; icon: React.ReactNode; summary: string; format: string };

/** The four TCF skills, keyed by the category names used by the backend. */
const SKILLS: Record<string, Skill> = {
  'Compréhension Écrite': { key: 'ce', english: 'Reading', icon: <ReadOutlined />, summary: 'Read and understand written documents of increasing difficulty.', format: 'Multiple choice' },
  'Compréhension Orale': { key: 'co', english: 'Listening', icon: <SoundOutlined />, summary: 'Timed listening series, scored from A1 to C2.', format: 'Timed series' },
  'Expression Écrite': { key: 'ee', english: 'Writing', icon: <FormOutlined />, summary: 'Write the three official tasks and get an AI correction.', format: 'AI-corrected' },
  'Expression Orale': { key: 'eo', english: 'Speaking', icon: <AudioOutlined />, summary: 'Talk with an AI examiner, then review detailed feedback.', format: 'Live AI examiner' },
};
const skillOf = (name?: string): Skill | null => (name ? SKILLS[name] ?? null : null);

const LEAF_TYPES = ['ce_series', 'co_series', 'ee_combinaison', 'eo_partie'];
const LEVEL_LABEL: Record<string, string> = {
  ce_series: 'series', co_series: 'series', ee_year: 'years', ee_month: 'months', ee_combinaison: 'combinations',
  eo_year: 'years', eo_month: 'months', eo_partie: 'parts',
};
const TYPE_ICON: Record<string, React.ReactNode> = {
  ee_year: <CalendarOutlined />, eo_year: <CalendarOutlined />, ee_month: <CalendarOutlined />, eo_month: <CalendarOutlined />,
  ce_series: <ReadOutlined />, co_series: <SoundOutlined />, ee_combinaison: <FormOutlined />, eo_partie: <AudioOutlined />,
};

const keyOf = (n: ContentNode) => `${n.type}:${n.content_id ?? n.id}`;
const labelOf = (n: ContentNode) => n.name || (n.year ? `${n.year}` : n.month_name || `#${n.content_id ?? n.id}`);
const isAvailable = (n: ContentNode) => {
  const accessible = n.is_assigned || n.has_assigned_children;
  const expired = n.is_expired && !n.has_assigned_children;
  const empty = n.available_count !== undefined && n.available_count === 0;
  return !!accessible && !expired && !empty;
};
const lockReason = (n: ContentNode) => {
  if (n.is_assigned && n.is_expired && !n.has_assigned_children) return 'Your access has expired. Ask your teacher to renew it.';
  if (n.available_count === 0 && (n.is_assigned || n.has_assigned_children)) return 'Nothing inside is assigned to you yet.';
  return 'Not assigned yet. Ask your teacher to open it for you.';
};

const StudentExamPreparation: React.FC = () => {
  const { apiCall } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();

  const [tree, setTree] = useState<ContentNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState(false);
  const [childrenCache, setChildrenCache] = useState<Record<string, ContentNode[]>>({});
  const [path, setPath] = useState<ContentNode[]>([]);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const inflight = useRef(new Map<string, Promise<ContentNode[] | null>>());

  const [credits, setCredits] = useState<{ ee_credits: number; eo_credits: number } | null>(null);
  const [coSeriesId, setCoSeriesId] = useState<number | null>(null);
  const [eeCombId, setEeCombId] = useState<number | null>(null);
  const [eoPartieId, setEoPartieId] = useState<number | null>(null);
  const [coAnalytics, setCoAnalytics] = useState<{ id: number; name: string } | null>(null);
  const [eoAnalytics, setEoAnalytics] = useState<{ id: number; name: string } | null>(null);
  const [coGlobalOpen, setCoGlobalOpen] = useState(false);
  const [eoGlobalOpen, setEoGlobalOpen] = useState(false);
  const [outOfCredits, setOutOfCredits] = useState<'ee' | 'eo' | null>(null);

  /* ── Data ── */
  const refreshCredits = useCallback(async () => {
    try {
      const res = await apiCall('/ai-credits/me');
      if (res.ok) setCredits(await res.json());
    } catch { /* credits are informative only */ }
  }, [apiCall]);

  const fetchTree = useCallback(async () => {
    setTreeLoading(true); setTreeError(false);
    try {
      const res = await apiCall('/tcf/student/content-tree');
      if (!res.ok) throw new Error();
      setTree(await res.json());
    } catch {
      setTreeError(true);
    } finally {
      setTreeLoading(false);
    }
  }, [apiCall]);

  useEffect(() => { fetchTree(); refreshCredits(); }, [fetchTree, refreshCredits]);

  /** Children of a node, deduplicated so hover-prefetch and click share one request. */
  const loadChildren = useCallback((node: ContentNode, force = false): Promise<ContentNode[] | null> => {
    const key = keyOf(node);
    if (!force && inflight.current.has(key)) return inflight.current.get(key)!;
    const p = (async () => {
      try {
        const res = await apiCall(`/tcf/student/content-tree/children?parentType=${node.type}&parentId=${node.content_id ?? node.id}`);
        if (!res.ok) throw new Error();
        const data: ContentNode[] = await res.json();
        setChildrenCache(prev => ({ ...prev, [key]: data }));
        return data;
      } catch {
        inflight.current.delete(key);
        return null;
      }
    })();
    inflight.current.set(key, p);
    return p;
  }, [apiCall]);

  const prefetch = (node: ContentNode) => {
    if (!LEAF_TYPES.includes(node.type) && isAvailable(node) && !childrenCache[keyOf(node)]) void loadChildren(node);
  };

  /* ── Navigation ── */
  const current: ContentNode[] = path.length ? childrenCache[keyOf(path[path.length - 1])] ?? [] : tree;
  const skill = skillOf(path[0]?.name);

  const openNode = async (node: ContentNode) => {
    if (!isAvailable(node)) return;
    if (LEAF_TYPES.includes(node.type)) { launch(node); return; }
    const key = keyOf(node);
    if (!childrenCache[key]) {
      setOpeningKey(key);
      const data = await loadChildren(node);
      setOpeningKey(null);
      if (!data) { messageApi.error('Could not open this section. Please try again.'); return; }
      if (data.length === 0) { messageApi.info('This section is empty for now.'); return; }
    }
    setPath(prev => [...prev, node]);
  };

  const refreshCurrent = () => {
    if (path.length) void loadChildren(path[path.length - 1], true);
    else void fetchTree();
  };

  const launch = (node: ContentNode) => {
    const id = node.content_id;
    if (!id) return;
    if (node.type === 'co_series') setCoSeriesId(id);
    else if (node.type === 'ee_combinaison') {
      if (credits && credits.ee_credits <= 0) { setOutOfCredits('ee'); return; }
      setEeCombId(id);
    } else if (node.type === 'eo_partie') {
      if (credits && credits.eo_credits <= 0) { setOutOfCredits('eo'); return; }
      setEoPartieId(id);
    }
  };

  /* ── Figures ── */
  const available = current.filter(isAvailable).length;
  const levelWord = LEVEL_LABEL[current[0]?.type] ?? 'items';
  const isLeafLevel = current.length > 0 && current.every(n => LEAF_TYPES.includes(n.type));
  const skillsOpen = tree.filter(isAvailable).length;
  const sectionsOpen = tree.reduce((s, n) => s + (isAvailable(n) ? n.available_count ?? 0 : 0), 0);

  /* ── Pieces ── */
  const SkillCard = ({ node }: { node: ContentNode }) => {
    const s = skillOf(node.name);
    const open = isAvailable(node);
    const total = node.total_count ?? 0;
    const avail = node.available_count ?? 0;
    const opening = openingKey === keyOf(node);
    const unit = LEVEL_LABEL[node.child_type || ''] ?? 'items';
    return (
      <article className={`ep-skill ep-skill-${s?.key ?? 'other'}${open ? '' : ' is-locked'}`}
        onMouseEnter={() => prefetch(node)} onFocus={() => prefetch(node)}>
        <div className="ep-skill-head">
          <span className="ep-skill-icon">{s?.icon ?? <FolderOutlined />}</span>
          <div className="ep-skill-head-text">
            <span className="ep-skill-tag">{s?.english ?? 'Practice'}</span>
            <span className="ep-skill-format">{s?.format}</span>
          </div>
          <span className={`ep-state${open ? ' is-open' : ''}`}>
            {open ? <><CheckCircleFilled /> Open</> : <><LockOutlined /> Locked</>}
          </span>
        </div>
        <div className="ep-skill-body">
          <h3 className="ep-skill-title">{node.name}</h3>
          <p className="ep-skill-sub">{s?.summary ?? node.description}</p>
          <div className="ep-skill-stats">
            <div><strong>{avail}</strong><span>available</span></div>
            <div><strong>{total}</strong><span>{unit} in total</span></div>
          </div>
          <div className="ep-bar"><span style={{ width: `${total ? (avail / total) * 100 : 0}%` }} /></div>
        </div>
        <div className="ep-skill-foot">
          {open ? (
            <Button type="primary" block onClick={() => openNode(node)} loading={opening}>
              {opening ? 'Opening…' : <>Open {s?.english.toLowerCase() ?? 'section'} <RightOutlined /></>}
            </Button>
          ) : (
            <span className="ep-lock-note"><InfoCircleOutlined /> {lockReason(node)}</span>
          )}
        </div>
      </article>
    );
  };

  const ItemCard = ({ node }: { node: ContentNode }) => {
    const open = isAvailable(node);
    const leaf = LEAF_TYPES.includes(node.type);
    const opening = openingKey === keyOf(node);
    const expired = node.is_assigned && node.is_expired && !node.has_assigned_children;
    const total = node.total_count ?? 0;
    const avail = node.available_count ?? 0;
    const meta = node.total_questions
      ? `${node.total_questions} questions · ${node.total_points ?? 0} pts`
      : !leaf && total ? `${avail} of ${total} ${LEVEL_LABEL[node.child_type || ''] ?? 'items'} available` : null;
    const canAnalyse = open && leaf && node.content_id && (node.type === 'co_series' || node.type === 'eo_partie');
    const notPlayable = leaf && node.type === 'ce_series';
    const usesCredit = node.type === 'ee_combinaison' || node.type === 'eo_partie';

    const head = (
      <div className="ep-item-top">
        <span className="ep-item-icon">{TYPE_ICON[node.type] ?? <FolderOutlined />}</span>
        <span className="ep-item-text">
          <span className="ep-item-title" title={labelOf(node)}>{labelOf(node)}</span>
          {meta && <span className="ep-item-meta">{meta}</span>}
        </span>
        {!open && (expired
          ? <span className="ep-chip is-expired"><ClockCircleOutlined /> Expired</span>
          : <LockOutlined className="ep-item-lock" />)}
        {open && !leaf && (opening ? <LoadingOutlined className="ep-item-chevron" /> : <RightOutlined className="ep-item-chevron" />)}
      </div>
    );

    if (!leaf) {
      return (
        <Tooltip title={open ? undefined : lockReason(node)}>
          <button type="button" className={`ep-item${open ? '' : ' is-locked'}`} disabled={!open}
            onClick={() => openNode(node)} onMouseEnter={() => prefetch(node)} onFocus={() => prefetch(node)}>
            {head}
            {open && total > 0 && <div className="ep-bar is-thin"><span style={{ width: `${(avail / total) * 100}%` }} /></div>}
          </button>
        </Tooltip>
      );
    }
    return (
      <div className={`ep-item is-leaf${open ? '' : ' is-locked'}`}>
        {head}
        {open ? (
          notPlayable ? (
            <div className="ep-lock-note"><InfoCircleOutlined /> Online practice coming soon</div>
          ) : (
            <div className="ep-item-actions">
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => launch(node)}>
                {node.type === 'co_series' ? 'Start' : 'Practise'}
              </Button>
              {canAnalyse && (
                <Button icon={<BarChartOutlined />}
                  onClick={() => (node.type === 'co_series'
                    ? setCoAnalytics({ id: node.content_id!, name: labelOf(node) })
                    : setEoAnalytics({ id: node.content_id!, name: labelOf(node) }))}>
                  Results
                </Button>
              )}
              {usesCredit && <span className="ep-credit-note"><ThunderboltOutlined /> 1 credit</span>}
            </div>
          )
        ) : (
          <div className="ep-lock-note"><InfoCircleOutlined /> {lockReason(node)}</div>
        )}
      </div>
    );
  };

  /* ═══════════ RENDER ═══════════ */
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#047857', fontSize: 13 } }}>
      <div className={`ep${skill ? ` ep-in-${skill.key}` : ''}`}>
        {contextHolder}

        {/* ── Hero ── */}
        <header className="ep-hero">
          <div className="ep-hero-main">
            <div className="ep-overline">Exam preparation</div>
            <h1 className="ep-title">TCF Canada</h1>
            <p className="ep-subtitle">Practise the four skills of the exam in the official format. Your teacher decides which parts are open to you.</p>
            {!treeLoading && !treeError && (
              <div className="ep-hero-stats">
                <div><strong>{skillsOpen}<small>/{tree.length || 4}</small></strong><span>skills open</span></div>
                <div><strong>{sectionsOpen}</strong><span>sections available</span></div>
              </div>
            )}
          </div>
          {credits && (
            <div className="ep-credits" aria-label="AI correction credits">
              <div className="ep-credits-title"><ThunderboltOutlined /> AI credits</div>
              <Tooltip title="Each Expression écrite attempt corrected by AI uses one credit.">
                <div className={`ep-credit is-ee${credits.ee_credits <= 0 ? ' is-empty' : ''}`}>
                  <span className="ep-credit-icon"><FormOutlined /></span>
                  <div><strong>{credits.ee_credits}</strong><span>Writing</span></div>
                </div>
              </Tooltip>
              <Tooltip title="Each Expression orale session with the AI examiner uses one credit.">
                <div className={`ep-credit is-eo${credits.eo_credits <= 0 ? ' is-empty' : ''}`}>
                  <span className="ep-credit-icon"><AudioOutlined /></span>
                  <div><strong>{credits.eo_credits}</strong><span>Speaking</span></div>
                </div>
              </Tooltip>
            </div>
          )}
        </header>

        {/* ── Section bar (inside a skill) ── */}
        {path.length > 0 && (
          <div className="ep-section">
            <Button className="ep-back" icon={<ArrowLeftOutlined />} onClick={() => setPath(p => p.slice(0, -1))} aria-label="Back" />
            <span className="ep-section-icon">{skill?.icon ?? <FolderOutlined />}</span>
            <div className="ep-section-text">
              <nav className="ep-crumbs" aria-label="Breadcrumb">
                <button type="button" onClick={() => setPath([])}>TCF Canada</button>
                {path.map((n, i) => (
                  <React.Fragment key={keyOf(n)}>
                    <RightOutlined />
                    {i < path.length - 1
                      ? <button type="button" onClick={() => setPath(p => p.slice(0, i + 1))}>{labelOf(n)}</button>
                      : <span aria-current="page">{labelOf(n)}</span>}
                  </React.Fragment>
                ))}
              </nav>
              <h2 className="ep-section-title">{labelOf(path[path.length - 1])}</h2>
              <div className="ep-section-sub">{available} of {current.length} {levelWord} available</div>
            </div>
            {skill?.key === 'co' && (
              <Button icon={<BarChartOutlined />} onClick={() => setCoGlobalOpen(true)}>Listening performance</Button>
            )}
            {skill?.key === 'eo' && (
              <Button icon={<BarChartOutlined />} onClick={() => setEoGlobalOpen(true)}>Speaking performance</Button>
            )}
          </div>
        )}

        {/* ── Content ── */}
        {treeLoading && path.length === 0 ? (
          <div className="ep-skills" aria-busy="true">
            {['ce', 'co', 'ee', 'eo'].map(k => (
              <div key={k} className={`ep-skill ep-skill-${k} is-loading`}>
                <div className="ep-skill-head"><Skeleton.Avatar active shape="square" size={44} /></div>
                <div className="ep-skill-body"><Skeleton active title={{ width: '60%' }} paragraph={{ rows: 3 }} /></div>
              </div>
            ))}
          </div>
        ) : treeError && path.length === 0 ? (
          <div className="ep-empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="The exam content could not be loaded.">
              <Button onClick={fetchTree}>Try again</Button>
            </Empty>
          </div>
        ) : current.length === 0 ? (
          <div className="ep-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing here yet." /></div>
        ) : path.length === 0 ? (
          <div className="ep-skills">{current.map(n => <SkillCard key={keyOf(n)} node={n} />)}</div>
        ) : (
          <div className={`ep-items${isLeafLevel ? ' is-leaves' : ''}`}>{current.map(n => <ItemCard key={keyOf(n)} node={n} />)}</div>
        )}

        {/* ── Exercises & analytics (behaviour unchanged) ── */}
        {coSeriesId && (
          <COQuizTaking seriesId={coSeriesId} onBack={() => { setCoSeriesId(null); refreshCurrent(); }} />
        )}
        {coAnalytics && (
          <COAnalytics seriesId={coAnalytics.id} seriesName={coAnalytics.name} open onClose={() => setCoAnalytics(null)} />
        )}
        <COGlobalAnalytics open={coGlobalOpen} onClose={() => setCoGlobalOpen(false)} />
        {eeCombId && (
          <EESimulation
            combinaisonId={eeCombId}
            open
            onClose={() => { setEeCombId(null); refreshCurrent(); }}
            onCreditConsumed={refreshCredits}
            onOutOfCredits={() => { setEeCombId(null); setOutOfCredits('ee'); refreshCredits(); }}
          />
        )}
        <EOSimulation
          open={eoPartieId != null}
          partieId={eoPartieId}
          onClose={() => { setEoPartieId(null); refreshCurrent(); }}
          onCreditConsumed={refreshCredits}
          onOutOfCredits={() => { setEoPartieId(null); setOutOfCredits('eo'); refreshCredits(); }}
        />
        <OutOfCreditsModal open={outOfCredits !== null} type={outOfCredits} onClose={() => setOutOfCredits(null)} />
        {eoAnalytics && (
          <EOAnalytics partieId={eoAnalytics.id} partieName={eoAnalytics.name} open onClose={() => setEoAnalytics(null)} />
        )}
        <EOGlobalAnalytics open={eoGlobalOpen} onClose={() => setEoGlobalOpen(false)} />
      </div>
    </ConfigProvider>
  );
};

export default StudentExamPreparation;
