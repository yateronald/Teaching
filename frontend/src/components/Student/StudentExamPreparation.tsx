import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, ConfigProvider, Empty, Input, Segmented, Skeleton, Tooltip, message } from 'antd';
import {
  ReadOutlined, FormOutlined, SoundOutlined, AudioOutlined, FolderOutlined, LockOutlined,
  LoadingOutlined, ArrowLeftOutlined, ArrowRightOutlined, RightOutlined, BarChartOutlined,
  SearchOutlined, ReloadOutlined, EditOutlined,
  ClockCircleOutlined, InfoCircleOutlined, CalendarOutlined, CheckCircleFilled, ThunderboltOutlined,
} from '@ant-design/icons';
import COQuizTaking from './COQuizTaking';
import COAnalytics from './COAnalytics';
import COGlobalAnalytics from './COGlobalAnalytics';
import EESimulation from './EESimulation';
import EOSimulation from './EOSimulation';
import CEExam from '../ExamSim/CEExam';
import OutOfCreditsModal from './OutOfCreditsModal';
import EOAnalytics from './EOAnalytics';
import EOGlobalAnalytics from './EOGlobalAnalytics';
import { useAuth } from '../../contexts/AuthContext';
import { cefrOf } from '../ExamSim/examModel';
import { useTr } from '../../utils/useTr';
import './StudentExamPreparation.css';

/* ── Content tree (loaded one level at a time from /tcf/student/content-tree) ── */
interface ContentNode {
  id: number; name?: string; year?: number; month?: number; month_name?: string;
  type: string; content_id?: number; icon?: string; description?: string;
  total_questions?: number; total_points?: number;
  is_assigned?: boolean; is_expired?: boolean; has_assigned_children?: boolean;
  total_count?: number; available_count?: number; child_type?: string;
  /** Leaves only: theme of the item (writing: task 3) and the student's own record on it. */
  theme?: string | null;
  progress?: { attempts: number; best: number | null; last_at: string | null; running: boolean };
}

type Skill = { key: 'ce' | 'co' | 'ee' | 'eo'; english: string; icon: React.ReactNode; summary: string; format: string; session: string; credit?: string };
type Tr = (en: string, fr: string) => string;

/** The four TCF skills, keyed by the category names used by the backend, in the reader's language. */
const skillsIn = (tr: Tr): Record<string, Skill> => ({
  'Compréhension Écrite': { key: 'ce', english: tr('Reading', 'Compréhension écrite'), icon: <ReadOutlined />, summary: tr('Read and understand written documents of increasing difficulty.', 'Lire et comprendre des documents écrits de difficulté croissante.'), format: tr('Multiple choice', 'QCM'), session: tr('Multiple-choice series', 'Séries de QCM') },
  'Compréhension Orale': { key: 'co', english: tr('Listening', 'Compréhension orale'), icon: <SoundOutlined />, summary: tr('Timed listening series, scored from A1 to C2.', 'Séries d’écoute chronométrées, notées de A1 à C2.'), format: tr('Timed series', 'Séries chronométrées'), session: tr('Timed listening series · scored on 699', 'Séries d’écoute chronométrées · notées sur 699') },
  'Expression Écrite': { key: 'ee', english: tr('Writing', 'Expression écrite'), icon: <FormOutlined />, summary: tr('Write the three official tasks and get an AI correction.', 'Rédigez les trois tâches officielles et recevez une correction par l’IA.'), format: tr('AI-corrected', 'Corrigé par l’IA'), session: tr('3 tasks · 60 minutes · corrected on the official grid', '3 tâches · 60 minutes · corrigé selon la grille officielle'), credit: tr('writing', 'expression écrite') },
  'Expression Orale': { key: 'eo', english: tr('Speaking', 'Expression orale'), icon: <AudioOutlined />, summary: tr('Talk with an AI examiner, then review detailed feedback.', 'Échangez avec un examinateur IA, puis lisez un retour détaillé.'), format: tr('Live AI examiner', 'Examinateur IA en direct'), session: tr('3 tasks · about 12 minutes · live AI examiner', '3 tâches · environ 12 minutes · examinateur IA en direct'), credit: tr('speaking', 'expression orale') },
});

const LEAF_TYPES = ['ce_series', 'co_series', 'ee_combinaison', 'eo_partie'];
const levelLabels = (tr: Tr): Record<string, string> => ({
  ce_series: tr('series', 'séries'), co_series: tr('series', 'séries'), ee_year: tr('years', 'années'), ee_month: tr('months', 'mois'),
  ee_combinaison: 'combinaisons', eo_year: tr('years', 'années'), eo_month: tr('months', 'mois'), eo_partie: 'parties',
});
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
/** Who opens content: the teacher for students, the administrator (or the company) for exam candidates. */
const lockReason = (n: ContentNode, who: string, tr: Tr) => {
  if (n.is_assigned && n.is_expired && !n.has_assigned_children) return tr(`Your access has expired. Ask ${who} to renew it.`, `Votre accès a expiré. Demandez à ${who} de le renouveler.`);
  if (n.available_count === 0 && (n.is_assigned || n.has_assigned_children)) return tr('Nothing inside is assigned to you yet.', 'Rien ici ne vous est encore attribué.');
  return tr(`Not assigned yet. Ask ${who} to open it for you.`, `Pas encore attribué. Demandez à ${who} de vous l’ouvrir.`);
};

type LeafState = 'new' | 'running' | 'done' | 'soon' | 'locked' | 'expired';
const leafState = (n: ContentNode): LeafState => {
  if (!isAvailable(n)) return n.is_assigned && n.is_expired && !n.has_assigned_children ? 'expired' : 'locked';
  if (n.progress?.running) return 'running';
  return (n.progress?.attempts ?? 0) > 0 ? 'done' : 'new';
};
/** "Combinaison 12" → "12": the number is the visual anchor of the card. */
const numberOf = (n: ContentNode) => labelOf(n).match(/(\d+)\s*$/)?.[1] ?? null;
/** Best score in the unit of the skill: on 20 for writing/speaking, TCF points (0–699) for listening. */
const bestOf = (n: ContentNode): { text: string; level: string | null } | null => {
  const best = n.progress?.best;
  if (best == null || !n.progress?.attempts) return null;
  if (n.type === 'co_series' || n.type === 'ce_series') {
    const level = best >= 600 ? 'C2' : best >= 500 ? 'C1' : best >= 400 ? 'B2' : best >= 300 ? 'B1' : best >= 200 ? 'A2' : 'A1';
    return { text: `${Math.round(best)} pts`, level };
  }
  return { text: `${Math.round(best)}/20`, level: cefrOf(best) };
};
const ago = (iso: string | null | undefined, tr: Tr, locale: string) => {
  if (!iso) return '';
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return tr('today', 'aujourd’hui');
  if (days === 1) return tr('yesterday', 'hier');
  if (days < 30) return tr(`${days} days ago`, `il y a ${days} jours`);
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};
type Filter = 'all' | 'available' | 'new' | 'running' | 'done' | 'locked';

const StudentExamPreparation: React.FC = () => {
  const { apiCall, isCandidate, user } = useAuth();
  const { tr, locale } = useTr();
  const SKILLS = skillsIn(tr);
  const LEVEL_LABEL = levelLabels(tr);
  const skillOf = (name?: string): Skill | null => (name ? SKILLS[name] ?? null : null);
  // Company learners are opened content by their company; other candidates by the school's administrator.
  const who = user?.organization ? tr('your company', 'votre entreprise') : isCandidate ? tr('your administrator', 'votre administrateur') : tr('your teacher', 'votre professeur');
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [ceSeriesId, setCeSeriesId] = useState<number | null>(null);
  const [ceAnalytics, setCeAnalytics] = useState<{ id: number; name: string } | null>(null);
  const [eeCombId, setEeCombId] = useState<number | null>(null);
  const [eoPartieId, setEoPartieId] = useState<number | null>(null);
  const [coAnalytics, setCoAnalytics] = useState<{ id: number; name: string } | null>(null);
  const [eoAnalytics, setEoAnalytics] = useState<{ id: number; name: string } | null>(null);
  const [coGlobalOpen, setCoGlobalOpen] = useState(false);
  const [eoGlobalOpen, setEoGlobalOpen] = useState(false);
  const [outOfCredits, setOutOfCredits] = useState<'ee' | 'eo' | null>(null);

  /* ── Filter / Search (inside section) ── */
  const [filterTab, setFilterTab] = useState<Filter>('all');
  const [searchText, setSearchText] = useState('');

  const navigateTo = (newPath: ContentNode[]) => {
    setPath(newPath);
    setFilterTab('all');
    setSearchText('');
  };

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
      if (!data) { messageApi.error(tr('Could not open this section. Please try again.', 'Impossible d’ouvrir cette section. Réessayez.')); return; }
      if (data.length === 0) { messageApi.info(tr('This section is empty for now.', 'Cette section est vide pour le moment.')); return; }
    }
    navigateTo([...path, node]);
  };

  // Deep link from the dashboard: ?skill=ce|co|ee|eo opens that skill directly.
  const wanted = searchParams.get('skill');
  useEffect(() => {
    if (!wanted || treeLoading || !tree.length) return;
    const node = tree.find(n => skillOf(n.name)?.key === wanted);
    setSearchParams(p => { p.delete('skill'); return p; }, { replace: true });
    if (node && isAvailable(node)) void openNode(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, treeLoading, tree]);

  const refreshCurrent = () => {
    if (path.length) void loadChildren(path[path.length - 1], true);
    else void fetchTree();
  };

  const launch = (node: ContentNode) => {
    const id = node.content_id;
    if (!id) return;
    if (node.type === 'co_series') setCoSeriesId(id);
    else if (node.type === 'ce_series') setCeSeriesId(id);
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
  const levelWord = LEVEL_LABEL[current[0]?.type] ?? tr('items', 'éléments');
  const isLeafLevel = current.length > 0 && current.every(n => LEAF_TYPES.includes(n.type));
  const skillsOpen = tree.filter(isAvailable).length;
  const sectionsOpen = tree.reduce((s, n) => s + (isAvailable(n) ? n.available_count ?? 0 : 0), 0);

  /* ── Progress on the current list (leaf level) ── */
  const states = current.map(n => (LEAF_TYPES.includes(n.type) ? leafState(n) : null));
  const countOf = (st: LeafState) => states.filter(x => x === st).length;
  const practised = countOf('done');
  const playable = states.filter(x => x === 'new' || x === 'running' || x === 'done').length;
  const bestOverall = isLeafLevel
    ? current.map(bestOf).filter((b): b is { text: string; level: string | null } => !!b)
      .sort((a, b) => parseFloat(b.text) - parseFloat(a.text))[0] ?? null
    : null;
  const parent = path[path.length - 2];
  const here = path[path.length - 1];
  const sectionTitle = here ? `${labelOf(here)}${here.month_name && parent?.year ? ` ${parent.year}` : ''}` : '';

  const filterOptions: { value: Filter; label: string }[] = isLeafLevel
    ? [
      { value: 'all', label: `${tr('All', 'Tout')} ${current.length}` },
      ...(countOf('new') ? [{ value: 'new' as Filter, label: `${tr('Not started', 'Pas commencés')} ${countOf('new')}` }] : []),
      ...(countOf('running') ? [{ value: 'running' as Filter, label: `${tr('In progress', 'En cours')} ${countOf('running')}` }] : []),
      ...(practised ? [{ value: 'done' as Filter, label: `${tr('Practised', 'Faits')} ${practised}` }] : []),
      ...(countOf('locked') + countOf('expired') ? [{ value: 'locked' as Filter, label: `${tr('Locked', 'Verrouillés')} ${countOf('locked') + countOf('expired')}` }] : []),
    ]
    : [
      { value: 'all', label: `${tr('All', 'Tout')} ${current.length}` },
      ...(available < current.length ? [{ value: 'available' as Filter, label: `${tr('Available', 'Disponibles')} ${available}` }] : []),
    ];

  /* ── Filtered items for display ── */
  const displayItems = current.filter(node => {
    const st = LEAF_TYPES.includes(node.type) ? leafState(node) : null;
    if (filterTab === 'available' && !isAvailable(node)) return false;
    if (filterTab === 'new' && st !== 'new') return false;
    if (filterTab === 'running' && st !== 'running') return false;
    if (filterTab === 'done' && st !== 'done') return false;
    if (filterTab === 'locked' && st !== 'locked' && st !== 'expired') return false;
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      const hay = `${labelOf(node)} ${node.theme ?? ''} ${node.description ?? ''}`.toLowerCase();
      return hay.includes(q);
    }
    return true;
  });

  /* ── Pieces ── */
  const SkillCard = ({ node }: { node: ContentNode }) => {
    const s = skillOf(node.name);
    const open = isAvailable(node);
    const total = node.total_count ?? 0;
    const avail = node.available_count ?? 0;
    const opening = openingKey === keyOf(node);
    const unit = LEVEL_LABEL[node.child_type || ''] ?? tr('items', 'éléments');
    return (
      <article className={`ep-skill ep-skill-${s?.key ?? 'other'}${open ? '' : ' is-locked'}`}
        onMouseEnter={() => prefetch(node)} onFocus={() => prefetch(node)}>
        <div className="ep-skill-head">
          <span className="ep-skill-icon">{s?.icon ?? <FolderOutlined />}</span>
          <div className="ep-skill-head-text">
            <span className="ep-skill-tag">{s?.english ?? tr('Practice', 'Entraînement')}</span>
            <span className="ep-skill-format">{s?.format}</span>
          </div>
          <span className={`ep-state${open ? ' is-open' : ''}`}>
            {open ? <><CheckCircleFilled /> {tr('Open', 'Ouvert')}</> : <><LockOutlined /> {tr('Locked', 'Verrouillé')}</>}
          </span>
        </div>
        <div className="ep-skill-body">
          <h3 className="ep-skill-title">{node.name}</h3>
          <p className="ep-skill-sub">{s?.summary ?? node.description}</p>
          <div className="ep-skill-stats">
            <div><strong>{avail}</strong><span>{tr('available', 'disponibles')}</span></div>
            <div><strong>{total}</strong><span>{tr(`${unit} in total`, `${unit} au total`)}</span></div>
          </div>
          <div className="ep-bar"><span style={{ width: `${total ? (avail / total) * 100 : 0}%` }} /></div>
        </div>
        <div className="ep-skill-foot">
          {open ? (
            <Button type="primary" block onClick={() => openNode(node)} loading={opening}>
              {opening ? tr('Opening…', 'Ouverture…') : <>{tr('Open', 'Ouvrir')} {s?.english.toLowerCase() ?? tr('section', 'la section')} <RightOutlined /></>}
            </Button>
          ) : (
            <span className="ep-lock-note"><InfoCircleOutlined /> {lockReason(node, who, tr)}</span>
          )}
        </div>
      </article>
    );
  };

  const FolderCard = ({ node }: { node: ContentNode }) => {
    const open = isAvailable(node);
    const opening = openingKey === keyOf(node);
    const total = node.total_count ?? 0;
    const avail = node.available_count ?? 0;
    const unit = LEVEL_LABEL[node.child_type || ''] ?? tr('items', 'éléments');
    const isMonth = !!node.month_name;
    const year = isMonth ? path[path.length - 1]?.year : node.year;
    return (
      <Tooltip title={open ? undefined : lockReason(node, who, tr)}>
        <button
          type="button"
          className={`ep-folder${open ? '' : ' is-locked'}`}
          disabled={!open}
          onClick={() => openNode(node)}
          onMouseEnter={() => prefetch(node)}
          onFocus={() => prefetch(node)}
        >
          <span className="ep-folder-tile" aria-hidden>
            {isMonth
              ? <><b>{(node.month_name || '').slice(0, 3).toUpperCase()}</b><small>{year ?? ''}</small></>
              : node.year ? <b className="is-year">{node.year}</b> : TYPE_ICON[node.type] ?? <FolderOutlined />}
          </span>
          <span className="ep-folder-text">
            <strong>{isMonth && year ? `${labelOf(node)} ${year}` : labelOf(node)}</strong>
            <span>{total > 0 ? `${total} ${unit}${open && avail < total ? ` · ${tr(`${avail} open to you`, `${avail} ouvert(s) pour vous`)}` : ''}` : 'Section'}</span>
          </span>
          <span className="ep-folder-end">
            {!open ? <LockOutlined /> : opening ? <LoadingOutlined /> : <RightOutlined />}
          </span>
        </button>
      </Tooltip>
    );
  };

  const LeafCard = ({ node }: { node: ContentNode }) => {
    const st = leafState(node);
    const num = numberOf(node);
    const best = bestOf(node);
    const attempts = node.progress?.attempts ?? 0;
    const credit = node.type === 'ee_combinaison' ? tr('writing', 'expression écrite') : node.type === 'eo_partie' ? tr('speaking', 'expression orale') : null;
    const canAnalyse = st === 'done' && node.content_id && (node.type === 'co_series' || node.type === 'ce_series' || node.type === 'eo_partie');
    const sub = node.theme
      || (node.type === 'eo_partie' ? tr('Interview · Role play · Point of view', 'Entretien · Jeu de rôle · Point de vue')
        : node.type === 'ee_combinaison' ? tr('Message · Narrative · Argued opinion', 'Message · Récit · Opinion argumentée')
          : node.total_questions ? `${node.total_questions} questions${node.total_points ? ` · ${node.total_points} points` : ''}` : node.description || '');
    const cta = st === 'running' ? tr('Resume', 'Reprendre') : st === 'done' ? tr('Retake', 'Refaire')
      : node.type === 'co_series' || node.type === 'ce_series' ? tr('Start series', 'Commencer la série') : tr('Start', 'Commencer');
    const ctaTip = st === 'running' ? tr('Continue where you stopped — no credit used.', 'Reprenez là où vous vous êtes arrêté — aucun crédit utilisé.')
      : credit ? tr(`Uses 1 ${credit} credit.`, `Utilise 1 crédit ${credit}.`) : undefined;

    return (
      <article className={`ep-leaf is-${st}`}>
        <div className="ep-leaf-main">
          <span className="ep-leaf-num" aria-hidden>{num ?? TYPE_ICON[node.type] ?? <EditOutlined />}</span>
          <div className="ep-leaf-text">
            <h4 className="ep-leaf-name">{labelOf(node)}</h4>
            {sub && <p className="ep-leaf-sub" title={sub}>{sub}</p>}
          </div>
          {st === 'done' && <span className="ep-tag is-done"><CheckCircleFilled /> {tr('Done', 'Fait')}</span>}
          {st === 'running' && <span className="ep-tag is-running"><ClockCircleOutlined /> {tr('In progress', 'En cours')}</span>}
          {st === 'locked' && <span className="ep-tag is-locked"><LockOutlined /> {tr('Locked', 'Verrouillé')}</span>}
          {st === 'expired' && <span className="ep-tag is-locked"><ClockCircleOutlined /> {tr('Expired', 'Expiré')}</span>}
        </div>

        <div className="ep-leaf-foot">
          <div className="ep-leaf-record">
            {st === 'done' && best ? (
              <>
                <span className="ep-best"><b>{best.text}</b>{best.level && <em>{best.level}</em>}</span>
                <span className="ep-record-meta">{tr(`${attempts} attempt${attempts > 1 ? 's' : ''}`, `${attempts} essai${attempts > 1 ? 's' : ''}`)} · {ago(node.progress?.last_at, tr, locale)}</span>
              </>
            ) : st === 'running' ? (
              <span className="ep-record-meta is-strong">{tr('Your draft is saved', 'Votre brouillon est enregistré')}</span>
            ) : st === 'new' ? (
              <span className="ep-record-meta">{tr('Not attempted yet', 'Pas encore tenté')}</span>
            ) : st === 'soon' ? (
              <span className="ep-record-meta"><InfoCircleOutlined /> {tr('Practice coming soon', 'Entraînement bientôt disponible')}</span>
            ) : (
              <span className="ep-record-meta">{st === 'expired' ? tr(`Access expired · ask ${who} to renew it`, `Accès expiré · demandez à ${who} de le renouveler`) : tr('Not assigned to you yet', 'Pas encore attribué')}</span>
            )}
          </div>
          {(st === 'new' || st === 'running' || st === 'done') && (
            <div className="ep-leaf-actions">
              {canAnalyse && (
                <Tooltip title={tr('Results and feedback', 'Résultats et retours')}>
                  <Button
                    className="ep-icon-btn"
                    icon={<BarChartOutlined />}
                    aria-label={tr(`Results for ${labelOf(node)}`, `Résultats de ${labelOf(node)}`)}
                    onClick={() => (node.type === 'co_series'
                      ? setCoAnalytics({ id: node.content_id!, name: labelOf(node) })
                      : node.type === 'ce_series'
                        ? setCeAnalytics({ id: node.content_id!, name: labelOf(node) })
                        : setEoAnalytics({ id: node.content_id!, name: labelOf(node) }))}
                  />
                </Tooltip>
              )}
              <Tooltip title={ctaTip}>
                <Button
                  type={st === 'running' ? 'primary' : 'default'}
                  className={`ep-cta${st === 'running' ? ' is-primary' : ''}`}
                  onClick={() => launch(node)}
                  icon={st === 'done' ? <ReloadOutlined /> : undefined}
                >
                  {cta}{st !== 'done' && <ArrowRightOutlined />}
                </Button>
              </Tooltip>
            </div>
          )}
        </div>
      </article>
    );
  };

  /* ═══════════ RENDER ═══════════ */
  return (
    <ConfigProvider theme={{ token: { colorPrimary: isCandidate ? '#0e7490' : '#047857', fontSize: 13 } }}>
      <div className={`ep${isCandidate ? ' is-candidate' : ''}${skill ? ` ep-in-${skill.key}` : ''}`}>
        {contextHolder}

        {/* ── Hero (Shown ONLY on main page) ── */}
        {path.length === 0 && (
          <header className="ep-hero">
            <div className="ep-hero-main">
              <div className="ep-overline">{tr('Exam preparation', 'Préparation aux examens')}</div>
              <h1 className="ep-title">TCF Canada</h1>
              <p className="ep-subtitle">{tr('Practise the four skills of the exam in the official format.', 'Entraînez-vous aux quatre compétences de l’examen, au format officiel.')} {tr(`${who.charAt(0).toUpperCase()}${who.slice(1)} decides which parts are open to you.`, `${who.charAt(0).toUpperCase()}${who.slice(1)} décide des parties qui vous sont ouvertes.`)}</p>
              {!treeLoading && !treeError && (
                <div className="ep-hero-stats">
                  <div><strong>{skillsOpen}<small>/{tree.length || 4}</small></strong><span>{tr('skills open', 'compétences ouvertes')}</span></div>
                  <div><strong>{sectionsOpen}</strong><span>{tr('sections available', 'sections disponibles')}</span></div>
                </div>
              )}
            </div>
            {credits && (
              <div className="ep-credits" aria-label={tr('AI correction credits', 'Crédits de correction IA')}>
                <div className="ep-credits-title"><ThunderboltOutlined /> {tr('AI credits', 'Crédits IA')}</div>
                <Tooltip title={tr('Each Expression écrite attempt corrected by AI uses one credit.', 'Chaque essai d’expression écrite corrigé par l’IA utilise un crédit.')}>
                  <div className={`ep-credit is-ee${credits.ee_credits <= 0 ? ' is-empty' : ''}`}>
                    <span className="ep-credit-icon"><FormOutlined /></span>
                    <div><strong>{credits.ee_credits}</strong><span>{tr('Writing', 'Écrit')}</span></div>
                  </div>
                </Tooltip>
                <Tooltip title={tr('Each Expression orale session with the AI examiner uses one credit.', 'Chaque session d’expression orale avec l’examinateur IA utilise un crédit.')}>
                  <div className={`ep-credit is-eo${credits.eo_credits <= 0 ? ' is-empty' : ''}`}>
                    <span className="ep-credit-icon"><AudioOutlined /></span>
                    <div><strong>{credits.eo_credits}</strong><span>{tr('Speaking', 'Oral')}</span></div>
                  </div>
                </Tooltip>
              </div>
            )}
          </header>
        )}

        {/* ── Section header (inside a skill) ── */}
        {path.length > 0 && (
          <header className="ep-head">
            <div className="ep-head-nav">
              <Button className="ep-back-btn" icon={<ArrowLeftOutlined />} onClick={() => navigateTo(path.slice(0, -1))} size="small">{tr('Back', 'Retour')}</Button>
              <nav className="ep-crumbs" aria-label="Breadcrumb">
                <button type="button" onClick={() => navigateTo([])}>{tr('Exam preparation', 'Préparation aux examens')}</button>
                {path.map((n, i) => (
                  <React.Fragment key={keyOf(n)}>
                    <RightOutlined className="ep-crumb-sep" />
                    {i < path.length - 1
                      ? <button type="button" onClick={() => navigateTo(path.slice(0, i + 1))}>{labelOf(n)}</button>
                      : <span className="ep-crumb-current" aria-current="page">{labelOf(n)}</span>}
                  </React.Fragment>
                ))}
              </nav>
            </div>

            <div className="ep-head-main">
              <span className="ep-head-icon" aria-hidden>{skill?.icon ?? <FolderOutlined />}</span>
              <div className="ep-head-text">
                <span className="ep-head-eyebrow">{skill ? `${skill.english} · ${path[0]?.name}` : 'TCF Canada'}</span>
                <h2 className="ep-head-title">{sectionTitle}</h2>
                <p className="ep-head-meta">
                  {current.length} {levelWord}{skill ? ` · ${skill.session}` : ''}
                </p>
              </div>
              <div className="ep-head-side">
                {skill?.credit && credits && (() => {
                  const n = skill.key === 'ee' ? credits.ee_credits : credits.eo_credits;
                  return (
                    <div className={`ep-credit-box${n <= 0 ? ' is-empty' : ''}`}>
                      <ThunderboltOutlined />
                      <div>
                        <strong>{n}</strong>
                        <span>{tr(`${skill.credit} credit${n === 1 ? '' : 's'}`, `crédit${n === 1 ? '' : 's'} ${skill.credit}`)}</span>
                      </div>
                      <em>{n <= 0 ? tr(`Ask ${who} for more`, `Demandez-en à ${who}`) : tr('1 per new attempt', '1 par nouvel essai')}</em>
                    </div>
                  );
                })()}
                {skill?.key === 'co' && (
                  <Button className="ep-perf-btn" icon={<BarChartOutlined />} onClick={() => setCoGlobalOpen(true)}>{tr('My listening results', 'Mes résultats en compréhension orale')}</Button>
                )}
                {skill?.key === 'eo' && (
                  <Button className="ep-perf-btn" icon={<BarChartOutlined />} onClick={() => setEoGlobalOpen(true)}>{tr('My speaking results', 'Mes résultats en expression orale')}</Button>
                )}
              </div>
            </div>

            {isLeafLevel && playable > 0 && (
              <div className="ep-head-progress">
                <div className="ep-progress-line">
                  <span><strong>{practised}</strong> {tr(`of ${playable} practised`, `sur ${playable} faits`)}</span>
                  {bestOverall && <span className="ep-progress-best">{tr('Best score', 'Meilleur score')} <b>{bestOverall.text}</b>{bestOverall.level && <em>{bestOverall.level}</em>}</span>}
                </div>
                <div className="ep-bar"><span style={{ width: `${playable ? (practised / playable) * 100 : 0}%` }} /></div>
              </div>
            )}

            {current.length > 0 && (filterOptions.length > 1 || current.length > 6) && (
              <div className="ep-toolbar">
                {filterOptions.length > 1 ? (
                  <Segmented<Filter> value={filterTab} onChange={setFilterTab} options={filterOptions} className="ep-filter-segmented" />
                ) : <span />}
                {current.length > 6 && (
                  <Input
                    className="ep-search"
                    placeholder={isLeafLevel && skill?.key === 'ee' ? tr('Search a combination or a theme', 'Rechercher une combinaison ou un thème') : tr(`Search ${levelWord}`, `Rechercher (${levelWord})`)}
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                  />
                )}
              </div>
            )}
          </header>
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
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tr('The exam content could not be loaded.', 'Le contenu des examens n’a pas pu être chargé.')}>
              <Button onClick={fetchTree}>{tr('Try again', 'Réessayer')}</Button>
            </Empty>
          </div>
        ) : current.length === 0 ? (
          <div className="ep-empty"><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tr('Nothing here yet.', 'Rien pour le moment.')} /></div>
        ) : path.length === 0 ? (
          <div className="ep-skills">{current.map(n => <SkillCard key={keyOf(n)} node={n} />)}</div>
        ) : displayItems.length === 0 ? (
          <div className="ep-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={searchText.trim() ? tr(`No ${levelWord} match "${searchText.trim()}".`, `Aucun résultat pour « ${searchText.trim()} ».`) : tr(`No ${levelWord} in this view.`, 'Rien dans cette vue.')}
            >
              <Button onClick={() => { setSearchText(''); setFilterTab('all'); }}>{tr(`Show all ${levelWord}`, 'Tout afficher')}</Button>
            </Empty>
          </div>
        ) : (
          <div className={`ep-items${isLeafLevel ? ' is-leaves' : ''}`}>
            {displayItems.map(n => (LEAF_TYPES.includes(n.type) ? <LeafCard key={keyOf(n)} node={n} /> : <FolderCard key={keyOf(n)} node={n} />))}
          </div>
        )}

        {/* ── Exercises & analytics (behaviour unchanged) ── */}
        {coSeriesId && (
          <COQuizTaking seriesId={coSeriesId} onBack={() => { setCoSeriesId(null); refreshCurrent(); }} />
        )}
        {ceSeriesId && (
          <CEExam seriesId={ceSeriesId} open onClose={() => { setCeSeriesId(null); refreshCurrent(); }} />
        )}
        {ceAnalytics && (
          <COAnalytics skill="ce" seriesId={ceAnalytics.id} seriesName={ceAnalytics.name} open onClose={() => setCeAnalytics(null)} />
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
