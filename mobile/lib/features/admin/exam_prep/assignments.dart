import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'exam_common.dart';

/// Students, exam candidates and batches: everyone content can be given to.
class ExamPeople {
  final List<Map<String, dynamic>> students;
  final List<Map<String, dynamic>> candidates;
  final List<Map<String, dynamic>> batches;
  const ExamPeople(this.students, this.candidates, this.batches);

  static Future<ExamPeople> load(WidgetRef ref) async {
    final api = ref.read(apiClientProvider);
    final r = await Future.wait([
      api.get('/users', queryParameters: {'role': 'student'}),
      api.get('/users', queryParameters: {'role': 'candidate'}),
      api.get('/batches'),
    ]);
    int byName(Map<String, dynamic> a, Map<String, dynamic> b) => J.name(a).toLowerCase().compareTo(J.name(b).toLowerCase());
    return ExamPeople(
      J.list(r[0].data, ['users'])..sort(byName),
      J.list(r[1].data, ['users']).where((p) => p['is_active'] != false).toList()..sort(byName),
      J.list(r[2].data, ['batches'])..sort((a, b) => J.s(a['name']).compareTo(J.s(b['name']))),
    );
  }
}

/// One assignment group: its name, content, recipients and end date.
class AssignmentGroupTile extends StatelessWidget {
  final Map<String, dynamic> group;
  final bool compact;
  final VoidCallback? onRemove;
  final bool removing;
  const AssignmentGroupTile({super.key, required this.group, this.compact = false, this.onRemove, this.removing = false});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final g = group;
    final expired = g['is_expired'] == true;
    final items = J.list(g['items']);
    final recipients = J.list(g['recipients']);
    final ends = J.date(g['expires_at']);
    final who = recipients.take(2).map((r) => J.s(r['name'])).join(', ') + (recipients.length > 2 ? ' +${recipients.length - 2}' : '');
    final header = Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(J.s(g['group_name']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 2),
              Text(
                [
                  '${items.length} ${fr ? 'élément(s)' : 'item(s)'}',
                  '${fr ? 'attribué' : 'assigned'} ${AdminFmt.dayShort(context, J.date(g['assigned_at']))}',
                  if (ends != null) '${expired ? (fr ? 'terminé' : 'ended') : (fr ? 'jusqu’au' : 'until')} ${AdminFmt.dayShort(context, ends)}',
                ].join(' · '),
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
              const SizedBox(height: 4),
              Row(children: [
                Icon(recipients.firstOrNull?['type'] == 'batch' ? Icons.groups_outlined : Icons.person_outline, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Expanded(child: Text(who, style: AppTypography.caption.copyWith(color: AppColors.text), maxLines: 1, overflow: TextOverflow.ellipsis)),
              ]),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Pill(expired ? (fr ? 'Terminé' : 'Expired') : (fr ? 'Actif' : 'Active'), color: expired ? AppColors.textMuted : AppColors.good),
        if (onRemove != null)
          removing
              ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)))
              : IconButton(onPressed: onRemove, tooltip: fr ? 'Retirer' : 'Remove', icon: const Icon(Icons.delete_outline, color: AppColors.bad)),
      ],
    );
    if (compact) return Padding(padding: const EdgeInsets.symmetric(vertical: 8), child: header);
    return AdminCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 6, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          header,
          const SizedBox(height: 8),
          Wrap(spacing: 6, runSpacing: 6, children: [
            for (final it in items)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: SkillX.ofType(J.s(it['content_type'])).color.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(8)),
                child: Text.rich(
                  TextSpan(children: [
                    TextSpan(text: '${J.s(it['content_type']) == 'category' ? SkillX.ofCategory(J.s(it['content_name'])).code : SkillX.ofType(J.s(it['content_type'])).code} ', style: TextStyle(fontWeight: FontWeight.w800, color: SkillX.ofType(J.s(it['content_type'])).color)),
                    TextSpan(text: J.s(it['content_name'])),
                  ]),
                  style: AppTypography.caption.copyWith(color: AppColors.ink, fontSize: 11.5),
                ),
              ),
          ]),
        ],
      ),
    );
  }
}

// ── Manage assignments ─────────────────────────────────────────────────────

class AssignmentsScreen extends ConsumerStatefulWidget {
  const AssignmentsScreen({super.key});

  @override
  ConsumerState<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends ConsumerState<AssignmentsScreen> {
  List<Map<String, dynamic>> _groups = [];
  bool _loading = true;
  String? _error;
  String _status = 'active';
  String _query = '';
  String? _removing;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get('/tcf/exam-assignments');
      if (!mounted) return;
      setState(() {
        _groups = J.list(res.data);
        _loading = false;
        _error = null;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  Future<void> _remove(Map<String, dynamic> g) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Retirer cette attribution ?' : 'Remove this assignment?',
      message: fr ? 'Les destinataires perdront l’accès à « ${J.s(g['group_name'])} ».' : 'Recipients lose access to “${J.s(g['group_name'])}”.',
      confirmLabel: fr ? 'Retirer' : 'Remove',
    );
    if (!ok || !mounted) return;
    setState(() => _removing = J.s(g['group_id']));
    try {
      await ref.read(apiClientProvider).delete('/tcf/exam-assignments/group/${Uri.encodeComponent(J.s(g['group_id']))}');
      if (!mounted) return;
      setState(() => _groups.removeWhere((x) => x['group_id'] == g['group_id']));
      adminToast(context, fr ? 'Attribution retirée' : 'Assignment removed');
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _removing = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final q = _query.trim().toLowerCase();
    final active = _groups.where((g) => g['is_expired'] != true).length;
    final shown = _groups.where((g) {
      final expired = g['is_expired'] == true;
      if (_status == 'active' && expired) return false;
      if (_status == 'expired' && !expired) return false;
      if (q.isEmpty) return true;
      final hay = [J.s(g['group_name']), ...J.list(g['items']).map((i) => J.s(i['content_name'])), ...J.list(g['recipients']).map((r) => J.s(r['name']))].join(' ').toLowerCase();
      return hay.contains(q);
    }).toList();
    return ExamScaffold(
      title: fr ? 'Attributions' : 'Assignments',
      subtitle: fr ? '$active active(s) · ${_groups.length - active} terminée(s)' : '$active active · ${_groups.length - active} expired',
      skill: Skill.other,
      fab: ExamFab(fr ? 'Attribuer' : 'Assign content', onPressed: () => openLevel(context, const AssignContentScreen()).then((_) => _load())),
      body: ExamBody(
        loading: _loading,
        error: _error,
        onRefresh: _load,
        empty: _groups.isEmpty,
        emptyState: AdminEmpty(icon: Icons.send_outlined, title: fr ? 'Rien n’est attribué' : 'Nothing assigned yet'),
        toolbar: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            AdminSearchField(hint: fr ? 'Nom, contenu ou destinataire' : 'Name, content or recipient', onChanged: (v) => setState(() => _query = v)),
            const SizedBox(height: 8),
            AdminFilterChips<String>(
              options: [
                FilterOption('active', fr ? 'Actives' : 'Active', count: active),
                FilterOption('expired', fr ? 'Terminées' : 'Expired', count: _groups.length - active),
                FilterOption('all', fr ? 'Toutes' : 'All', count: _groups.length),
              ],
              selected: _status,
              onSelected: (v) => setState(() => _status = v),
            ),
          ],
        ),
        children: [
          if (shown.isEmpty)
            AdminCard(child: AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucune attribution ne correspond' : 'No assignment matches'))
          else
            AdminGrid(minTileWidth: 340, maxColumns: 2, spacing: 10, children: [
              for (final g in shown) AssignmentGroupTile(group: g, removing: _removing == J.s(g['group_id']), onRemove: () => _remove(g)),
            ]),
        ],
      ),
    );
  }
}

// ── Assign content ─────────────────────────────────────────────────────────

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
}

String _keyOf(Map n) => '${J.s(n['type'])}:${n['content_id'] ?? n['id']}';

String _labelOf(Map n) {
  final t = J.s(n['type']);
  if (t.endsWith('_year')) return '${n['year'] ?? n['name'] ?? '#${n['id']}'}';
  if (t.endsWith('_month')) return J.s(n['month_name']).isNotEmpty ? J.s(n['month_name']) : (J.s(n['name']).isNotEmpty ? J.s(n['name']) : 'Month ${n['month'] ?? ''}');
  return J.s(n['name']).isNotEmpty ? J.s(n['name']) : '#${n['content_id'] ?? n['id']}';
}

/// Gives students, candidates or batches access to exam content until a
/// date. Picking a parent (a skill, a year…) includes everything under it.
class AssignContentScreen extends ConsumerStatefulWidget {
  /// Content keys ticked when the screen opens, like `co_series:12`.
  final List<String> preselect;
  final List<int> presetCandidates;
  const AssignContentScreen({super.key, this.preselect = const [], this.presetCandidates = const []});

  @override
  ConsumerState<AssignContentScreen> createState() => _AssignContentScreenState();
}

class _AssignContentScreenState extends ConsumerState<AssignContentScreen> {
  final Map<String, _Node> _nodes = {};
  final List<String> _roots = [];
  ExamPeople? _people;
  bool _loading = true;
  String? _error;

  late final List<String> _selected = [...widget.preselect];
  final Set<String> _expanded = {};
  String _query = '';
  Skill? _family;

  final _name = TextEditingController();
  late final Set<int> _students = {};
  late final Set<int> _candidates = {...widget.presetCandidates};
  final Set<int> _batches = {};
  DateTime? _expires;
  final _ee = TextEditingController();
  final _eo = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _ee.dispose();
    _eo.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final treeRequest = ref.read(apiClientProvider).get('/tcf/exam-assignments/content-tree');
      final peopleRequest = ExamPeople.load(ref);
      final tree = await treeRequest;
      final people = await peopleRequest;
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
      // Open the path to anything preselected.
      for (final k in _selected) {
        var p = _nodes[k]?.parent;
        while (p != null) {
          _expanded.add(p);
          p = _nodes[p]?.parent;
        }
      }
      if (!mounted) return;
      setState(() {
        _people = people;
        _loading = false;
      });
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

  List<_Node> get _selectedNodes => [for (final k in _selected) if (_nodes[k] != null) _nodes[k]!];

  String get _autoName {
    final s = _selectedNodes;
    if (s.isEmpty) return '';
    return s.take(2).map((n) => n.depth == 0 ? n.label : '${n.skill.code} ${n.label}').join(', ') + (s.length > 2 ? ' +${s.length - 2}' : '');
  }

  int get _recipients => _students.length + _candidates.length + _batches.length;

  int get _reach {
    final sizes = {for (final b in _people?.batches ?? const []) J.i(b['id']): J.i(b['student_count'])};
    return _students.length + _candidates.length + _batches.fold<int>(0, (t, id) => t + (sizes[id] ?? 0));
  }

  bool get _expiryOk => _expires != null && _expires!.isAfter(DateTime.now());

  Future<void> _pickExpiry() async {
    final now = DateTime.now();
    final d = await showDatePicker(
      context: context,
      initialDate: _expires ?? now.add(const Duration(days: 30)),
      firstDate: now,
      lastDate: DateTime(now.year + 3),
    );
    if (d == null || !mounted) return;
    final t = await showTimePicker(context: context, initialTime: _expires == null ? const TimeOfDay(hour: 23, minute: 59) : TimeOfDay.fromDateTime(_expires!));
    if (!mounted) return;
    setState(() => _expires = DateTime(d.year, d.month, d.day, t?.hour ?? 23, t?.minute ?? 59));
  }

  Future<void> _pickPeople(String kind) async {
    final people = _people!;
    final list = switch (kind) { 'student' => people.students, 'candidate' => people.candidates, _ => people.batches };
    final current = switch (kind) { 'student' => _students, 'candidate' => _candidates, _ => _batches };
    final fr = context.isFrench;
    final picked = await showAdminPanel<Set<int>>(
      context,
      builder: (_) => MultiPicker(
        title: switch (kind) { 'student' => fr ? 'Étudiants' : 'Students', 'candidate' => fr ? 'Candidats' : 'Exam candidates', _ => fr ? 'Promotions' : 'Batches' },
        items: [
          for (final x in list)
            (
              J.i(x['id']),
              kind == 'batch' ? J.s(x['name']) : J.name(x),
              kind == 'batch' ? (fr ? '${J.i(x['student_count'])} étudiant(s)' : '${J.i(x['student_count'])} student(s)') : J.s(x['email']),
            ),
        ],
        initial: current,
      ),
    );
    if (picked == null) return;
    setState(() {
      current
        ..clear()
        ..addAll(picked);
    });
  }

  Future<void> _submit() async {
    final fr = context.isFrench;
    final hasEe = _selectedNodes.any((n) => n.skill == Skill.ee);
    final hasEo = _selectedNodes.any((n) => n.skill == Skill.eo);
    setState(() => _submitting = true);
    try {
      final res = await ref.read(apiClientProvider).post('/tcf/exam-assignments', data: {
        'items': [for (final n in _selectedNodes) {'content_type': n.type, 'content_id': n.raw['content_id'] ?? n.raw['id']}],
        'student_ids': [..._students, ..._candidates],
        'batch_ids': [..._batches],
        'expires_at': _expires!.toUtc().toIso8601String(),
        'group_name': _name.text.trim().isEmpty ? _autoName : _name.text.trim(),
        'ee_credits': hasEe ? (parseNum(_ee.text)?.round() ?? 0) : 0,
        'eo_credits': hasEo ? (parseNum(_eo.text)?.round() ?? 0) : 0,
      });
      if (!mounted) return;
      final d = J.map(res.data);
      adminToast(
        context,
        J.i(d['duplicates']) > 0
            ? (fr ? '${J.i(d['created'])} attribué(s) · ${J.i(d['duplicates'])} existai(en)t déjà' : '${J.i(d['created'])} assigned · ${J.i(d['duplicates'])} already existed')
            : (fr ? '${J.i(d['created'])} attribution(s) créée(s)' : '${J.i(d['created'])} assignment(s) created'),
      );
      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return ExamScaffold(
      title: fr ? 'Attribuer du contenu' : 'Assign content',
      subtitle: fr ? '1 · contenu   2 · destinataires et date de fin' : '1 · content   2 · recipients and end date',
      skill: Skill.other,
      body: _loading
          ? const AdminLoading()
          : _error != null
              ? AdminError(message: _error!, onRetry: _load)
              : LayoutBuilder(builder: (context, box) {
                  final wide = box.maxWidth >= 900;
                  final tree = _treePane(context);
                  final form = _formPane(context);
                  final bar = _submitBar(context);
                  if (wide) {
                    return Column(children: [
                      Expanded(
                        child: Row(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                          Expanded(flex: 6, child: tree),
                          const VerticalDivider(width: 1, color: AppColors.border),
                          Expanded(flex: 5, child: ListView(padding: const EdgeInsets.all(16), children: form)),
                        ]),
                      ),
                      bar,
                    ]);
                  }
                  return DefaultTabController(
                    length: 2,
                    child: Column(children: [
                      Material(
                        color: AppColors.pureWhite,
                        child: TabBar(
                          labelColor: AppColors.adminAccent,
                          indicatorColor: AppColors.adminAccent,
                          unselectedLabelColor: AppColors.textMuted,
                          tabs: [
                            Tab(text: fr ? 'Contenu (${_selected.length})' : 'Content (${_selected.length})'),
                            Tab(text: fr ? 'Destinataires ($_recipients)' : 'Recipients ($_recipients)'),
                          ],
                        ),
                      ),
                      Expanded(child: TabBarView(children: [tree, ListView(padding: const EdgeInsets.all(16), children: form)])),
                      bar,
                    ]),
                  );
                }),
    );
  }

  Widget _treePane(BuildContext context) {
    final fr = context.isFrench;
    final included = _included;
    final rows = _rows;
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            AdminSearchField(hint: fr ? 'Rechercher un contenu' : 'Search content', onChanged: (v) => setState(() => _query = v)),
            const SizedBox(height: 8),
            AdminFilterChips<Skill?>(
              options: [
                FilterOption(null, fr ? 'Tout' : 'All'),
                for (final s in [Skill.ce, Skill.co, Skill.ee, Skill.eo]) FilterOption(s, s.code),
              ],
              selected: _family,
              onSelected: (v) => setState(() => _family = v),
            ),
          ]),
        ),
        const Divider(height: 1, color: AppColors.border),
        Expanded(
          child: rows.isEmpty
              ? AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucun contenu' : 'No content')
              : ListView.builder(
                  itemCount: rows.length,
                  itemBuilder: (context, i) {
                    final n = rows[i];
                    final checked = _selected.contains(n.key);
                    final inc = included.contains(n.key);
                    final has = n.children.isNotEmpty;
                    final open = _expanded.contains(n.key) || _query.trim().isNotEmpty;
                    final meta = J.i(n.raw['total_questions']) > 0
                        ? '${J.i(n.raw['total_questions'])} questions'
                        : has
                            ? '${n.children.length} ${fr ? 'élément(s)' : 'item(s)'}'
                            : '';
                    return InkWell(
                      onTap: has ? () => setState(() => open ? _expanded.remove(n.key) : _expanded.add(n.key)) : (inc ? null : () => _toggle(n.key, !checked)),
                      child: Container(
                        padding: EdgeInsets.only(left: 4.0 + n.depth * 18, right: 12, top: 2, bottom: 2),
                        color: checked ? AppColors.adminAccentBg : null,
                        child: Row(
                          children: [
                            SizedBox(
                              width: 32,
                              child: has ? Icon(open ? Icons.expand_more : Icons.chevron_right, color: AppColors.textMuted) : null,
                            ),
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
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(n.label, style: AppTypography.bodySmall.copyWith(fontWeight: n.depth == 0 ? FontWeight.w800 : FontWeight.w600, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                                  if (meta.isNotEmpty) Text(meta, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
                                ],
                              ),
                            ),
                            if (inc) Text(fr ? 'Inclus' : 'Included', style: AppTypography.caption.copyWith(color: AppColors.good, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  List<Widget> _formPane(BuildContext context) {
    final fr = context.isFrench;
    final hasEe = _selectedNodes.any((n) => n.skill == Skill.ee);
    final hasEo = _selectedNodes.any((n) => n.skill == Skill.eo);
    Widget who(String kind, IconData icon, String label, Set<int> ids, List<Map<String, dynamic>> list) {
      final names = [for (final x in list) if (ids.contains(J.i(x['id']))) kind == 'batch' ? J.s(x['name']) : J.name(x)];
      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Material(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(12),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => _pickPeople(kind),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: ids.isEmpty ? AppColors.border : AppColors.adminAccentLine)),
              child: Row(children: [
                Icon(icon, color: AppColors.adminAccent),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('$label${ids.isEmpty ? '' : ' · ${ids.length}'}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                    Text(
                      names.isEmpty ? (fr ? 'Aucun · toucher pour choisir' : 'None · tap to choose') : names.take(3).join(', ') + (names.length > 3 ? ' +${names.length - 3}' : ''),
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ]),
                ),
                const Icon(Icons.chevron_right, color: AppColors.textSubtle),
              ]),
            ),
          ),
        ),
      );
    }

    final people = _people!;
    return [
      PanelSection(fr ? 'Sélection' : 'Selection'),
      if (_selectedNodes.isEmpty)
        Text(fr ? 'Cochez du contenu dans l’arbre.' : 'Tick content in the tree.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
      else
        Wrap(spacing: 6, runSpacing: 6, children: [
          for (final n in _selectedNodes)
            InputChip(
              label: Text('${n.skill.code} · ${n.label}', style: const TextStyle(fontSize: 12)),
              onDeleted: () => _toggle(n.key, false),
            ),
        ]),
      PanelSection(fr ? 'Destinataires' : 'Recipients'),
      who('student', Icons.person_outline, fr ? 'Étudiants' : 'Students', _students, people.students),
      who('candidate', Icons.badge_outlined, fr ? 'Candidats' : 'Exam candidates', _candidates, people.candidates),
      who('batch', Icons.groups_outlined, fr ? 'Promotions' : 'Batches', _batches, people.batches),
      PanelSection(fr ? 'Accès' : 'Access'),
      AdminField(label: fr ? 'Nom (facultatif)' : 'Name (optional)', controller: _name, hint: _autoName),
      Material(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: _pickExpiry,
          child: InputDecorator(
            decoration: adminInputDecoration(fr ? 'Fin de l’accès *' : 'Access ends *', suffix: const Icon(Icons.event)),
            child: Text(_expires == null ? (fr ? 'Choisir une date' : 'Choose an end date') : AdminFmt.dateTime(context, _expires), style: AppTypography.bodyMedium.copyWith(color: _expires == null ? AppColors.textMuted : AppColors.ink)),
          ),
        ),
      ),
      if (_expires != null && !_expiryOk) Padding(padding: const EdgeInsets.only(top: 6), child: Text(fr ? 'La date doit être dans le futur.' : 'The date must be in the future.', style: AppTypography.caption.copyWith(color: AppColors.bad))),
      if (hasEe || hasEo) ...[
        PanelSection(fr ? 'Crédits de correction IA (par destinataire)' : 'AI correction credits (per recipient)'),
        FieldGrid(columns: 2, children: [
          if (hasEe) AdminField(label: fr ? 'Crédits EE' : 'EE credits', controller: _ee, keyboardType: TextInputType.number),
          if (hasEo) AdminField(label: fr ? 'Crédits EO' : 'EO credits', controller: _eo, keyboardType: TextInputType.number),
        ]),
      ],
      const SizedBox(height: 24),
    ];
  }

  Widget _submitBar(BuildContext context) {
    final fr = context.isFrench;
    final canSubmit = _selected.isNotEmpty && _recipients > 0 && _expiryOk && !_submitting;
    final hint = _selected.isEmpty
        ? (fr ? 'Choisissez du contenu.' : 'Pick some content.')
        : _recipients == 0
            ? (fr ? 'Choisissez des destinataires.' : 'Choose who gets it.')
            : _expires == null
                ? (fr ? 'Choisissez la date de fin.' : 'Choose until when students have access.')
                : (fr
                    ? '${_selected.length} élément(s) pour $_recipients destinataire(s) · jusqu’à $_reach étudiant(s)'
                    : '${_selected.length} item(s) for $_recipients recipient(s) · reaches up to $_reach student(s)');
    return Container(
      decoration: const BoxDecoration(color: AppColors.pureWhite, border: Border(top: BorderSide(color: AppColors.border))),
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
      child: Row(children: [
        Expanded(child: Text(hint, style: AppTypography.caption.copyWith(color: AppColors.text), maxLines: 2)),
        const SizedBox(width: 10),
        AdminButton(fr ? 'Attribuer' : 'Assign', icon: Icons.send, busy: _submitting, onPressed: canSubmit ? _submit : null),
      ]),
    );
  }
}

/// Searchable multi-select list that pops the chosen ids.
class MultiPicker extends StatefulWidget {
  final String title;
  final List<(int, String, String)> items;
  final Set<int> initial;
  const MultiPicker({super.key, required this.title, required this.items, required this.initial});

  @override
  State<MultiPicker> createState() => MultiPickerState();
}

class MultiPickerState extends State<MultiPicker> {
  late final Set<int> _ids = {...widget.initial};
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final q = _q.trim().toLowerCase();
    final shown = widget.items.where((x) => q.isEmpty || '${x.$2} ${x.$3}'.toLowerCase().contains(q)).toList();
    return AdminPanel(
      title: widget.title,
      subtitle: fr ? '${_ids.length} sélectionné(s)' : '${_ids.length} selected',
      actions: [
        AdminButton(fr ? 'Tout effacer' : 'Clear', primary: false, onPressed: () => setState(_ids.clear)),
        AdminButton(fr ? 'Valider' : 'Done', onPressed: () => Navigator.pop(context, _ids)),
      ],
      children: [
        const SizedBox(height: 8),
        AdminSearchField(hint: fr ? 'Rechercher' : 'Search', onChanged: (v) => setState(() => _q = v)),
        const SizedBox(height: 6),
        if (shown.isEmpty) AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucun résultat' : 'No results'),
        for (final x in shown)
          CheckboxListTile(
            value: _ids.contains(x.$1),
            onChanged: (v) => setState(() => v == true ? _ids.add(x.$1) : _ids.remove(x.$1)),
            activeColor: AppColors.adminAccent,
            contentPadding: EdgeInsets.zero,
            controlAffinity: ListTileControlAffinity.leading,
            title: Text(x.$2, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
            subtitle: x.$3.isEmpty ? null : Text(x.$3, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          ),
      ],
    );
  }
}
