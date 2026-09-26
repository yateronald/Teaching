import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../exam_prep/exam_common.dart';

class _Node {
  final String key;
  final Map<String, dynamic> raw;
  final int depth;
  final String? parent;
  final Skill skill;
  final String label;
  final List<String> children = [];
  _Node(this.key, this.raw, this.depth, this.parent, this.skill, this.label);

  String get type => J.s(raw['type']);
  int get contentId => J.i(raw['content_id'] ?? raw['id']);
}

String _keyOf(Map n) => '${J.s(n['type'])}:${n['content_id'] ?? n['id']}';

String _labelOf(Map n) {
  final t = J.s(n['type']);
  if (t.endsWith('_year')) return '${n['year'] ?? n['name'] ?? '#${n['id']}'}';
  if (t.endsWith('_month')) return J.s(n['month_name']).isNotEmpty ? J.s(n['month_name']) : (J.s(n['name']).isNotEmpty ? J.s(n['name']) : 'Month ${n['month'] ?? ''}');
  return J.s(n['name']).isNotEmpty ? J.s(n['name']) : '#${n['content_id'] ?? n['id']}';
}

/// Opens the picker full screen; returns the chosen content as
/// `{content_type, content_id}` items, or null when closed without saving.
Future<List<Map<String, dynamic>>?> pickCompanyContent(
  BuildContext context, {
  required List<Map<String, dynamic>> initial,
  String? title,
}) {
  return Navigator.of(context).push<List<Map<String, dynamic>>>(
    MaterialPageRoute(
      fullscreenDialog: true,
      builder: (_) => CompanyContentPicker(
        initialKeys: [for (final c in initial) '${J.s(c['content_type'])}:${J.i(c['content_id'])}'],
        title: title,
      ),
    ),
  );
}

/// The exam content a company may use. Ticking a skill (or a year…) includes
/// everything under it, including what is added later.
class CompanyContentPicker extends ConsumerStatefulWidget {
  final List<String> initialKeys;
  final String? title;
  const CompanyContentPicker({super.key, required this.initialKeys, this.title});

  @override
  ConsumerState<CompanyContentPicker> createState() => _CompanyContentPickerState();
}

class _CompanyContentPickerState extends ConsumerState<CompanyContentPicker> {
  final Map<String, _Node> _nodes = {};
  final List<String> _roots = [];
  late final List<String> _selected = [...widget.initialKeys];
  final Set<String> _expanded = {};
  String _query = '';
  Skill? _family;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final tree = await ref.read(apiClientProvider).get('/tcf/exam-assignments/content-tree');
      _nodes.clear();
      _roots.clear();
      String walk(Map<String, dynamic> n, int depth, String? parent, Skill skill) {
        final node = _Node(_keyOf(n), n, depth, parent, skill, _labelOf(n));
        _nodes[node.key] = node;
        for (final c in J.list(n['children'])) {
          node.children.add(walk(c, depth + 1, node.key, skill));
        }
        return node.key;
      }

      for (final n in J.list(tree.data)) {
        _roots.add(walk(n, 0, null, SkillX.ofCategory(J.s(n['name']))));
      }
      for (final k in _selected) {
        var p = _nodes[k]?.parent;
        while (p != null) {
          _expanded.add(p);
          p = _nodes[p]?.parent;
        }
      }
      if (mounted) setState(() => _loading = false);
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  Set<String> _descendants(String key) {
    final out = <String>{};
    void add(String k) {
      for (final c in _nodes[k]?.children ?? const <String>[]) {
        out.add(c);
        add(c);
      }
    }

    add(key);
    return out;
  }

  Set<String> get _included => {for (final k in _selected) ..._descendants(k)};

  bool get _allChosen => _roots.isNotEmpty && _roots.every(_selected.contains);

  void _toggle(String key, bool on) {
    setState(() {
      if (!on) {
        _selected.remove(key);
        return;
      }
      final desc = _descendants(key);
      _selected.removeWhere((k) => desc.contains(k) || k == key);
      _selected.add(key);
    });
  }

  void _everything() {
    setState(() {
      _selected
        ..clear()
        ..addAll(_roots);
    });
  }

  List<_Node> get _rows {
    final out = <_Node>[];
    final q = _query.trim().toLowerCase();
    Set<String>? allowed;
    if (q.isNotEmpty) {
      allowed = {};
      for (final n in _nodes.values) {
        if (!n.label.toLowerCase().contains(q)) continue;
        String? k = n.key;
        while (k != null && !allowed.contains(k)) {
          allowed.add(k);
          k = _nodes[k]?.parent;
        }
      }
    }
    void visit(String k) {
      if (allowed != null && !allowed.contains(k)) return;
      final n = _nodes[k]!;
      out.add(n);
      final open = allowed != null ? n.children.any(allowed.contains) : _expanded.contains(k);
      if (open) n.children.forEach(visit);
    }

    for (final r in _roots) {
      if (_family == null || _nodes[r]!.skill == _family) visit(r);
    }
    return out;
  }

  void _save() {
    final items = [
      for (final k in _selected)
        if (_nodes[k] != null)
          {
            'content_type': _nodes[k]!.type,
            'content_id': _nodes[k]!.contentId,
            // Shown in the chips; the server reads only the type and id.
            'name': _nodes[k]!.depth == 0 ? _nodes[k]!.label : '${_nodes[k]!.skill.code} · ${_nodes[k]!.label}',
          },
    ];
    Navigator.pop(context, items);
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final known = _selected.where(_nodes.containsKey).length;
    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        backgroundColor: AppColors.pureWhite,
        foregroundColor: AppColors.ink,
        elevation: 0,
        title: Text(widget.title ?? (fr ? 'Examens autorisés' : 'Allowed exams'), style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
      ),
      body: _loading
          ? const AdminLoading()
          : _error != null
              ? AdminError(message: _error!, onRetry: _load)
              : Column(
                  children: [
                    Container(
                      color: AppColors.pureWhite,
                      padding: const EdgeInsets.fromLTRB(12, 10, 12, 8),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        AdminSearchField(hint: fr ? 'Rechercher un contenu' : 'Search content', onChanged: (v) => setState(() => _query = v)),
                        const SizedBox(height: 8),
                        Row(children: [
                          Expanded(
                            child: AdminFilterChips<Skill?>(
                              options: [
                                FilterOption(null, fr ? 'Tout' : 'All'),
                                for (final s in [Skill.ce, Skill.co, Skill.ee, Skill.eo]) FilterOption(s, s.code),
                              ],
                              selected: _family,
                              onSelected: (v) => setState(() => _family = v),
                            ),
                          ),
                        ]),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          key: const Key('company-content-all'),
                          onPressed: _roots.isEmpty ? null : _everything,
                          icon: Icon(_allChosen ? Icons.check_circle : Icons.select_all, size: 18),
                          label: Text(fr ? 'Toute la préparation aux examens' : 'All exam preparation'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.adminAccent,
                            backgroundColor: _allChosen ? AppColors.adminAccentBg : null,
                            side: BorderSide(color: _allChosen ? AppColors.adminAccent : AppColors.border),
                          ),
                        ),
                      ]),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    Expanded(child: _tree(context)),
                    Container(
                      decoration: const BoxDecoration(color: AppColors.pureWhite, border: Border(top: BorderSide(color: AppColors.border))),
                      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
                      child: SafeArea(
                        top: false,
                        child: Row(children: [
                          Expanded(
                            child: Text(
                              fr
                                  ? '$known élément(s) choisi(s). Un élément coché inclut tout ce qu’il contient, y compris les ajouts futurs.'
                                  : '$known item(s) chosen. A ticked item includes everything under it, including what is added later.',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                          ),
                          const SizedBox(width: 12),
                          AdminButton(fr ? 'Valider' : 'Done', icon: Icons.check, onPressed: known == 0 ? null : _save),
                        ]),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _tree(BuildContext context) {
    final fr = context.isFrench;
    final included = _included;
    final rows = _rows;
    if (rows.isEmpty) return AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucun contenu' : 'No content');
    return ListView.builder(
      itemCount: rows.length,
      itemBuilder: (context, i) {
        final n = rows[i];
        final checked = _selected.contains(n.key);
        final inc = included.contains(n.key);
        final has = n.children.isNotEmpty;
        final open = _expanded.contains(n.key) || _query.trim().isNotEmpty;
        return InkWell(
          onTap: has ? () => setState(() => open ? _expanded.remove(n.key) : _expanded.add(n.key)) : (inc ? null : () => _toggle(n.key, !checked)),
          child: Container(
            padding: EdgeInsets.only(left: 4.0 + n.depth * 18, right: 12, top: 2, bottom: 2),
            color: checked ? AppColors.adminAccentBg : null,
            child: Row(
              children: [
                SizedBox(width: 32, child: has ? Icon(open ? Icons.expand_more : Icons.chevron_right, color: AppColors.textMuted) : null),
                Checkbox(
                  value: checked || inc,
                  onChanged: inc ? null : (v) => _toggle(n.key, v ?? false),
                  activeColor: AppColors.adminAccent,
                ),
                Icon(
                  n.type == 'category' ? n.skill.icon : n.type.endsWith('_year') ? Icons.calendar_month_outlined : n.type.endsWith('_month') ? Icons.schedule : Icons.article_outlined,
                  size: 18,
                  color: n.skill.color,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    n.label,
                    style: AppTypography.bodySmall.copyWith(fontWeight: n.depth == 0 ? FontWeight.w800 : FontWeight.w600, color: AppColors.ink),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (inc) Text(fr ? 'Inclus' : 'Included', style: AppTypography.caption.copyWith(color: AppColors.good, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        );
      },
    );
  }
}
