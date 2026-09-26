/**
 * The exam content tree as an index: every node by "type:id", with its depth,
 * parent, skill family, label and path. Shared by the content picker and the
 * screens that name a selection.
 */
import { familyOfCategory } from '../Admin/examAdminData';
import type { Family } from '../Admin/examAdminData';

export interface ContentNode {
  id: number;
  name?: string;
  year?: number;
  month?: number;
  month_name?: string;
  type: string;
  content_id?: number;
  icon?: string;
  total_questions?: number;
  total_points?: number;
  selectable?: boolean;
  children?: ContentNode[];
}
export interface Row {
  key: string;
  node: ContentNode;
  depth: number;
  parent: string | null;
  family: Family;
  label: string;
  path: string;
  childKeys: string[];
}

export const keyOf = (n: ContentNode) => `${n.type}:${n.content_id ?? n.id}`;
export const labelOf = (n: ContentNode) =>
  n.type.endsWith('_year') ? String(n.year ?? n.name ?? `#${n.id}`)
    : n.type.endsWith('_month') ? (n.month_name || n.name || `${n.month ?? ''}`)
      : n.name || `#${n.content_id ?? n.id}`;
/** Every node of the tree by key (for labels of a selection). */
export function indexTree(tree: ContentNode[]) {
  const map = new Map<string, Row>();
  const roots: string[] = [];
  const walk = (n: ContentNode, depth: number, parent: string | null, fam: Family, prefix: string): string => {
    const key = keyOf(n);
    const label = labelOf(n);
    const row: Row = { key, node: n, depth, parent, family: fam, label, path: prefix ? `${prefix} › ${label}` : label, childKeys: [] };
    map.set(key, row);
    (n.children || []).forEach(c => row.childKeys.push(walk(c, depth + 1, key, fam, row.path)));
    return key;
  };
  tree.forEach(n => roots.push(walk(n, 0, null, familyOfCategory(n.name), '')));
  return { map, roots };
}

