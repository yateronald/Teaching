import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'assignments.dart';
import 'exam_common.dart';

/// Loads one list of the EE / EO tree and keeps loading / error state.
mixin _TreeList<W extends ConsumerStatefulWidget> on ConsumerState<W> {
  List<Map<String, dynamic>> items = [];
  bool loading = true;
  String? error;

  String get path;

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final res = await ref.read(apiClientProvider).get(path);
      if (!mounted) return;
      setState(() {
        items = J.list(res.data);
        loading = false;
        error = null;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          error = apiErrorText(context, e);
          loading = false;
        });
      }
    }
  }

  Future<void> remove(String url, {required String title, required String message, required String done}) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(context, title: title, message: message, confirmLabel: fr ? 'Supprimer' : 'Delete');
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete(url);
      if (mounted) adminToast(context, done);
      load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }
}

// ── Years ──────────────────────────────────────────────────────────────────

class YearsScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> category;
  final Skill skill;
  const YearsScreen({super.key, required this.category, required this.skill});

  @override
  ConsumerState<YearsScreen> createState() => _YearsScreenState();
}

class _YearsScreenState extends ConsumerState<YearsScreen> with _TreeList {
  Skill get _skill => widget.skill;

  @override
  String get path => '${_skill.tree}/categories/${widget.category['id']}/years';

  Future<void> _add() async {
    final existing = {for (final y in items) J.i(y['year'])};
    final year = await showDialog<int>(
      context: context,
      builder: (_) => _YearDialog(existing: existing),
    );
    if (year == null || !mounted) return;
    try {
      await ref.read(apiClientProvider).post(path, data: {'year': year});
      if (mounted) adminToast(context, context.isFrench ? '$year ajoutée' : '$year added');
      load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final months = items.fold<int>(0, (t, y) => t + J.i(y['month_count']));
    final sorted = [...items]..sort((a, b) => J.i(b['year']).compareTo(J.i(a['year'])));
    return ExamScaffold(
      title: J.s(widget.category['name']),
      subtitle: fr ? '${items.length} année(s) · $months mois de sessions' : '${items.length} year(s) · $months month(s) of exam sessions',
      skill: _skill,
      fab: ExamFab(fr ? 'Année' : 'Add year', onPressed: _add),
      body: ExamBody(
        loading: loading,
        error: error,
        onRefresh: load,
        empty: items.isEmpty,
        emptyState: AdminEmpty(icon: Icons.calendar_month_outlined, title: fr ? 'Aucune année' : 'No years yet', message: fr ? 'Ajoutez une année, puis ses mois.' : 'Add a year, then its months.'),
        children: [
          TreeGrid(
            children: [
              for (final y in sorted)
                TreeCard(
                  leading: NumberBadge('${J.i(y['year']) % 100}'.padLeft(2, '0'), color: _skill.color),
                  title: '${J.i(y['year'])}',
                  subtitle: fr ? '${J.i(y['month_count'])} / 12 mois' : '${J.i(y['month_count'])} / 12 months',
                  footer: Row(
                    children: [
                      for (var i = 0; i < 12; i++)
                        Expanded(
                          child: Container(
                            height: 6,
                            margin: const EdgeInsets.only(right: 3),
                            decoration: BoxDecoration(color: i < J.i(y['month_count']) ? _skill.color : AppColors.borderSoft, borderRadius: BorderRadius.circular(3)),
                          ),
                        ),
                    ],
                  ),
                  onTap: () => openLevel(context, MonthsScreen(skill: _skill, year: y)).then((_) => load()),
                  menu: [
                    menuItem(Icons.send_outlined, fr ? 'Attribuer…' : 'Assign…', () => openLevel(context, AssignContentScreen(preselect: ['${_skill.name}_year:${y['id']}']))),
                    menuItem(
                      Icons.delete_outline,
                      fr ? 'Supprimer' : 'Delete year',
                      () => remove(
                        '${_skill.tree}/years/${y['id']}',
                        title: fr ? 'Supprimer ${J.i(y['year'])} ?' : 'Delete ${J.i(y['year'])}?',
                        message: fr ? 'Ses mois et tout leur contenu seront aussi supprimés. Action irréversible.' : 'Its months and everything in them are deleted too. This can’t be undone.',
                        done: fr ? 'Année supprimée' : 'Year deleted',
                      ),
                      danger: true,
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _YearDialog extends StatefulWidget {
  final Set<int> existing;
  const _YearDialog({required this.existing});

  @override
  State<_YearDialog> createState() => _YearDialogState();
}

class _YearDialogState extends State<_YearDialog> {
  late final _c = TextEditingController(text: '${DateTime.now().year}');

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final now = DateTime.now().year;
    final y = int.tryParse(_c.text.trim());
    final valid = y != null && y >= 2000 && y <= 2100 && !widget.existing.contains(y);
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(fr ? 'Ajouter une année' : 'Add a year'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(controller: _c, keyboardType: TextInputType.number, decoration: adminInputDecoration(fr ? 'Année' : 'Year'), onChanged: (_) => setState(() {})),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: [
              for (final q in [now - 1, now, now + 1])
                ActionChip(label: Text(widget.existing.contains(q) ? '$q · ${fr ? 'ajoutée' : 'added'}' : '$q'), onPressed: widget.existing.contains(q) ? null : () => setState(() => _c.text = '$q')),
            ],
          ),
          if (y != null && widget.existing.contains(y))
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(fr ? 'Cette année existe déjà.' : 'This year already exists.', style: AppTypography.caption.copyWith(color: AppColors.bad)),
            ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(fr ? 'Annuler' : 'Cancel')),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
          onPressed: valid ? () => Navigator.pop(context, y) : null,
          child: Text(fr ? 'Ajouter' : 'Add year'),
        ),
      ],
    );
  }
}

// ── Months ─────────────────────────────────────────────────────────────────

class MonthsScreen extends ConsumerStatefulWidget {
  final Skill skill;
  final Map<String, dynamic> year;
  const MonthsScreen({super.key, required this.skill, required this.year});

  @override
  ConsumerState<MonthsScreen> createState() => _MonthsScreenState();
}

class _MonthsScreenState extends ConsumerState<MonthsScreen> with _TreeList {
  Skill get _skill => widget.skill;
  int get _year => J.i(widget.year['year']);
  String get _countKey => _skill == Skill.ee ? 'combinaison_count' : 'partie_count';

  @override
  String get path => '${_skill.tree}/years/${widget.year['id']}/months';

  Future<void> _add() async {
    final fr = context.isFrench;
    final existing = {for (final m in items) J.i(m['month'])};
    final month = await showModalBottomSheet<int>(
      context: context,
      backgroundColor: AppColors.frenchPaper,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(fr ? 'Ajouter un mois' : 'Add a month', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
              Text(fr ? 'Les mois déjà ajoutés sont grisés.' : 'Months already added are greyed out.', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
              const SizedBox(height: 14),
              GridView.count(
                crossAxisCount: MediaQuery.sizeOf(ctx).width >= 600 ? 4 : 3,
                shrinkWrap: true,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                childAspectRatio: 2.4,
                children: [
                  for (final e in frenchMonths.entries)
                    OutlinedButton(
                      onPressed: existing.contains(e.key) ? null : () => Navigator.pop(ctx, e.key),
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('${e.key}. ${e.value}', style: const TextStyle(fontSize: 12.5), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
    if (month == null || !mounted) return;
    try {
      await ref.read(apiClientProvider).post(path, data: {'month': month, 'month_name': frenchMonths[month]});
      if (mounted) adminToast(context, fr ? '${frenchMonths[month]} ajouté' : '${frenchMonths[month]} added');
      load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final word = _skill == Skill.ee ? 'combinaison' : 'partie';
    final total = items.fold<int>(0, (t, m) => t + J.i(m[_countKey]));
    final empty = items.where((m) => J.i(m[_countKey]) == 0).length;
    final sorted = [...items]..sort((a, b) => J.i(a['month']).compareTo(J.i(b['month'])));
    return ExamScaffold(
      title: '$_year',
      subtitle: '${_skill.label(fr)} · ${items.length} ${fr ? 'mois' : 'months'} · $total ${word}s${empty > 0 ? (fr ? ' · $empty vide(s)' : ' · $empty empty') : ''}',
      skill: _skill,
      actions: [
        IconButton(
          tooltip: fr ? 'Attribuer l’année' : 'Assign year',
          icon: const Icon(Icons.send_outlined),
          onPressed: () => openLevel(context, AssignContentScreen(preselect: ['${_skill.name}_year:${widget.year['id']}'])),
        ),
      ],
      fab: ExamFab(fr ? 'Mois' : 'Add month', onPressed: _add),
      body: ExamBody(
        loading: loading,
        error: error,
        onRefresh: load,
        empty: items.isEmpty,
        emptyState: AdminEmpty(
          icon: Icons.calendar_today_outlined,
          title: fr ? 'Aucun mois' : 'No months yet',
          message: fr ? 'Ajoutez les mois de $_year qui ont du contenu.' : 'Add the months of $_year that have exam content.',
        ),
        children: [
          TreeGrid(
            children: [
              for (final m in sorted)
                TreeCard(
                  warn: J.i(m[_countKey]) == 0,
                  leading: NumberBadge('${J.i(m['month'])}', color: _skill.color),
                  title: J.s(m['month_name']),
                  subtitle: J.i(m[_countKey]) == 0 ? (fr ? 'Aucune $word' : 'No ${word}s yet') : '${J.i(m[_countKey])} $word${J.i(m[_countKey]) == 1 ? '' : 's'}',
                  onTap: () {
                    final screen = _skill == Skill.ee ? CombinaisonsScreen(month: m, year: _year) : PartiesScreen(month: m, year: _year);
                    openLevel(context, screen).then((_) => load());
                  },
                  menu: [
                    menuItem(Icons.send_outlined, fr ? 'Attribuer…' : 'Assign…', () => openLevel(context, AssignContentScreen(preselect: ['${_skill.name}_month:${m['id']}']))),
                    menuItem(
                      Icons.delete_outline,
                      fr ? 'Supprimer' : 'Delete month',
                      () => remove(
                        '${_skill.tree}/months/${m['id']}',
                        title: fr ? 'Supprimer ${J.s(m['month_name'])} $_year ?' : 'Delete ${J.s(m['month_name'])} $_year?',
                        message: fr ? 'Son contenu sera aussi supprimé. Action irréversible.' : 'Everything in it is deleted too. This can’t be undone.',
                        done: fr ? 'Mois supprimé' : 'Month deleted',
                      ),
                      danger: true,
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Three dots showing which of the three tâches exist.
class _TaskDots extends StatelessWidget {
  final Set<int> present;
  final Color color;
  final String trailing;
  const _TaskDots({required this.present, required this.color, required this.trailing});

  @override
  Widget build(BuildContext context) => Row(
    children: [
      for (final n in [1, 2, 3])
        Container(
          width: 24,
          height: 24,
          margin: const EdgeInsets.only(right: 6),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: present.contains(n) ? color : AppColors.pureWhite,
            shape: BoxShape.circle,
            border: Border.all(color: present.contains(n) ? color : AppColors.warn, style: BorderStyle.solid),
          ),
          child: present.contains(n)
              ? const Icon(Icons.check, size: 14, color: AppColors.pureWhite)
              : Text(
                  '$n',
                  style: AppTypography.caption.copyWith(color: AppColors.warn, fontWeight: FontWeight.w800),
                ),
        ),
      const SizedBox(width: 4),
      Text(trailing, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
    ],
  );
}

/// Name (and position) of a combinaison or partie.
class _NameEditor extends ConsumerStatefulWidget {
  final String title;
  final String initial;
  final int? position;
  final Future<void> Function(WidgetRef ref, String name, int? position) save;
  const _NameEditor({required this.title, required this.initial, this.position, required this.save});

  @override
  ConsumerState<_NameEditor> createState() => _NameEditorState();
}

class _NameEditorState extends ConsumerState<_NameEditor> {
  final _form = GlobalKey<FormState>();
  late final _name = TextEditingController(text: widget.initial);
  late final _pos = TextEditingController(text: widget.position == null ? '' : '${widget.position}');
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _pos.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Form(
      key: _form,
      child: AdminPanel(
        title: widget.title,
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
          AdminButton(
            fr ? 'Enregistrer' : 'Save',
            busy: _saving,
            onPressed: () async {
              if (!_form.currentState!.validate()) return;
              setState(() => _saving = true);
              try {
                await widget.save(ref, _name.text.trim(), widget.position == null ? null : parseNum(_pos.text)?.round());
                if (context.mounted) Navigator.pop(context, true);
              } catch (e) {
                if (!context.mounted) return;
                setState(() => _saving = false);
                adminToast(context, apiErrorText(context, e), error: true);
              }
            },
          ),
        ],
        children: [
          const SizedBox(height: 10),
          AdminField(label: fr ? 'Nom' : 'Name', controller: _name, validator: (v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null),
          if (widget.position != null) NumberField(label: fr ? 'Position dans la liste' : 'Position in the list', controller: _pos, min: 1),
        ],
      ),
    );
  }
}

// ── EE: combinaisons ───────────────────────────────────────────────────────

class CombinaisonsScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> month;
  final int year;
  const CombinaisonsScreen({super.key, required this.month, required this.year});

  @override
  ConsumerState<CombinaisonsScreen> createState() => _CombinaisonsScreenState();
}

class _CombinaisonsScreenState extends ConsumerState<CombinaisonsScreen> with _TreeList {
  String _query = '';

  @override
  String get path => '/tcf/ee/months/${widget.month['id']}/combinaisons';

  String get _where => '${J.s(widget.month['month_name'])} ${widget.year}';

  Future<void> _edit([Map<String, dynamic>? comb]) async {
    final fr = context.isFrench;
    final saved = await showAdminPanel<bool>(
      context,
      builder: (_) => _NameEditor(
        title: comb == null ? (fr ? 'Nouvelle combinaison' : 'Add a combinaison') : (fr ? 'Renommer' : 'Rename combinaison'),
        initial: comb == null ? 'Combinaison ${items.length + 1}' : J.s(comb['name']),
        save: (ref, name, _) => comb == null
            ? ref.read(apiClientProvider).post('/tcf/ee/months/${widget.month['id']}/combinaisons', data: {'name': name})
            : ref.read(apiClientProvider).put('/tcf/ee/combinaisons/${comb['id']}', data: {'name': name}),
      ),
    );
    if (saved == true) load();
  }

  Future<void> _open(Map<String, dynamic> comb) async {
    await showAdminPanel<void>(
      context,
      tabletWidth: 680,
      builder: (_) => _CombinaisonPanel(combinaisonId: J.i(comb['id']), monthPath: path, where: _where, onRename: () => _edit(comb)),
    );
    load();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final list = [...items]..sort((a, b) => J.i(a['display_order']) != J.i(b['display_order']) ? J.i(a['display_order']).compareTo(J.i(b['display_order'])) : J.i(a['id']).compareTo(J.i(b['id'])));
    final q = _query.trim().toLowerCase();
    final shown = q.isEmpty ? list : list.where((c) => J.s(c['name']).toLowerCase().contains(q)).toList();
    final incomplete = list.where((c) => J.list(c['taches']).length < 3).toList();
    return ExamScaffold(
      title: _where,
      subtitle: fr ? '${list.length} combinaison(s) · 3 tâches chacune' : '${list.length} combinaison(s) · 3 tâches each',
      skill: Skill.ee,
      actions: [
        IconButton(
          tooltip: fr ? 'Attribuer le mois' : 'Assign month',
          icon: const Icon(Icons.send_outlined),
          onPressed: () => openLevel(context, AssignContentScreen(preselect: ['ee_month:${widget.month['id']}'])),
        ),
      ],
      fab: ExamFab(fr ? 'Combinaison' : 'Add combinaison', onPressed: _edit),
      body: ExamBody(
        loading: loading,
        error: error,
        onRefresh: load,
        empty: items.isEmpty,
        emptyState: AdminEmpty(
          icon: Icons.edit_note,
          title: fr ? 'Aucune combinaison' : 'No combinaisons yet',
          message: fr ? 'Une combinaison réunit les trois tâches écrites d’une session.' : 'A combinaison holds the three writing tâches of one exam session.',
        ),
        toolbar: list.length > 8 ? AdminSearchField(hint: fr ? 'Rechercher' : 'Search combinaisons', onChanged: (v) => setState(() => _query = v)) : null,
        children: [
          if (incomplete.isNotEmpty)
            WarnNote(
              fr
                  ? '${incomplete.length} combinaison(s) incomplète(s) : ${incomplete.take(6).map((c) => '${J.s(c['name'])} (${J.list(c['taches']).length}/3)').join(', ')}'
                  : '${incomplete.length} combinaison(s) missing tâches: ${incomplete.take(6).map((c) => '${J.s(c['name'])} (${J.list(c['taches']).length}/3)').join(', ')}',
            ),
          TreeGrid(
            children: [
              for (final c in shown)
                TreeCard(
                  warn: J.list(c['taches']).length < 3,
                  leading: NumberBadge(J.i(c['display_order']) == 0 ? '–' : '${J.i(c['display_order'])}', color: Skill.ee.color),
                  title: J.s(c['name']),
                  subtitle: fr
                      ? '${J.list(c['taches']).where((t) => J.s(t['correction_text']).isNotEmpty).length} avec corrigé'
                      : '${J.list(c['taches']).where((t) => J.s(t['correction_text']).isNotEmpty).length} with correction',
                  footer: _TaskDots(present: {for (final t in J.list(c['taches'])) J.i(t['task_number'])}, color: Skill.ee.color, trailing: '${J.list(c['taches']).length}/3 tâches'),
                  onTap: () => _open(c),
                  menu: [
                    menuItem(Icons.edit_outlined, fr ? 'Renommer' : 'Rename', () => _edit(c)),
                    menuItem(Icons.send_outlined, fr ? 'Attribuer…' : 'Assign…', () => openLevel(context, AssignContentScreen(preselect: ['ee_combinaison:${c['id']}']))),
                    menuItem(
                      Icons.delete_outline,
                      fr ? 'Supprimer' : 'Delete',
                      () => remove(
                        '/tcf/ee/combinaisons/${c['id']}',
                        title: fr ? 'Supprimer « ${J.s(c['name'])} » ?' : 'Delete “${J.s(c['name'])}”?',
                        message: fr ? 'Ses tâches et corrigés seront aussi supprimés. Action irréversible.' : 'Its tâches and corrections are deleted too. This can’t be undone.',
                        done: fr ? 'Combinaison supprimée' : 'Combinaison deleted',
                      ),
                      danger: true,
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// One combinaison and its three tâches. Reloads the month list after each
/// change so it always shows the freshest copy.
class _CombinaisonPanel extends ConsumerStatefulWidget {
  final int combinaisonId;
  final String monthPath;
  final String where;
  final VoidCallback onRename;
  const _CombinaisonPanel({required this.combinaisonId, required this.monthPath, required this.where, required this.onRename});

  @override
  ConsumerState<_CombinaisonPanel> createState() => _CombinaisonPanelState();
}

class _CombinaisonPanelState extends ConsumerState<_CombinaisonPanel> {
  Map<String, dynamic>? _comb;
  final _shown = <int>{};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get(widget.monthPath);
      final c = J.list(res.data).where((x) => J.i(x['id']) == widget.combinaisonId).firstOrNull;
      if (mounted) setState(() => _comb = c ?? {});
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  Future<void> _editTache(int number, [Map<String, dynamic>? tache]) async {
    final saved = await showAdminPanel<bool>(
      context,
      tabletWidth: 640,
      builder: (_) => _EeTacheEditor(combinaisonId: widget.combinaisonId, number: number, tache: tache),
    );
    if (saved == true) _load();
  }

  Future<void> _delete(Map<String, dynamic> t) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer la tâche ${J.i(t['task_number'])} ?' : 'Delete tâche ${J.i(t['task_number'])}?',
      message: fr ? 'Sa consigne et son corrigé seront supprimés. Action irréversible.' : 'Its prompt and correction are deleted too. This can’t be undone.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete('/tcf/ee/taches/${t['id']}');
      if (mounted) adminToast(context, fr ? 'Tâche supprimée' : 'Tâche deleted');
      _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = _comb;
    if (c == null) return const AdminLoading();
    final taches = J.list(c['taches'])..sort((a, b) => J.i(a['task_number']).compareTo(J.i(b['task_number'])));
    final missing = [1, 2, 3].where((n) => !taches.any((t) => J.i(t['task_number']) == n)).toList();
    return AdminPanel(
      title: J.s(c['name']),
      subtitle: '${widget.where} · ${taches.length}/3 tâches',
      leading: IconButton(tooltip: fr ? 'Renommer' : 'Rename', onPressed: widget.onRename, icon: const Icon(Icons.edit_outlined)),
      children: [
        for (final t in taches) ...[
          const SizedBox(height: 12),
          _TacheCard(
            number: J.i(t['task_number']),
            color: Skill.ee.color,
            title: 'Tâche ${J.i(t['task_number'])} · ${eeTasks[J.i(t['task_number'])]?.label ?? J.s(t['task_type'])}',
            facts: fr
                ? '${eeTasks[J.i(t['task_number'])]?.min}–${eeTasks[J.i(t['task_number'])]?.max} mots · ${eeTasks[J.i(t['task_number'])]?.dur} min'
                : '${eeTasks[J.i(t['task_number'])]?.min}–${eeTasks[J.i(t['task_number'])]?.max} words · ${eeTasks[J.i(t['task_number'])]?.dur} min',
            onEdit: () => _editTache(J.i(t['task_number']), t),
            onDelete: () => _delete(t),
            children: [
              if (J.s(t['prompt_text']).isNotEmpty) _Prose(J.s(t['prompt_text'])),
              if (J.s(t['question_text']).isNotEmpty) ...[const _Sub('Question'), _Prose(J.s(t['question_text']))],
              if (J.s(t['argument_text_1']).isNotEmpty) ...[const _Sub('Argument 1'), _Prose(J.s(t['argument_text_1']))],
              if (J.s(t['argument_text_2']).isNotEmpty) ...[const _Sub('Argument 2'), _Prose(J.s(t['argument_text_2']))],
              if (J.s(t['correction_text']).isNotEmpty) ...[
                TextButton.icon(
                  onPressed: () => setState(() => _shown.contains(J.i(t['id'])) ? _shown.remove(J.i(t['id'])) : _shown.add(J.i(t['id']))),
                  icon: Icon(_shown.contains(J.i(t['id'])) ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18),
                  label: Text(_shown.contains(J.i(t['id'])) ? (fr ? 'Masquer le corrigé' : 'Hide model answer') : (fr ? 'Voir le corrigé' : 'Show model answer')),
                ),
                if (_shown.contains(J.i(t['id']))) _Prose(J.s(t['correction_text']), tint: AppColors.goodBg),
              ],
            ],
          ),
        ],
        if (missing.isNotEmpty) ...[
          const SizedBox(height: 12),
          WarnNote(
            missing.length == 3
                ? (fr ? 'Cette combinaison n’a pas encore de tâches.' : 'This combinaison has no tâches yet.')
                : (fr ? 'Il manque la tâche ${missing.join(' et ')}.' : 'Missing tâche ${missing.join(' and ')}.'),
          ),
          for (final n in missing)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AdminButton(fr ? 'Ajouter la tâche $n · ${eeTasks[n]!.label}' : 'Add tâche $n · ${eeTasks[n]!.label}', icon: Icons.add, primary: false, onPressed: () => _editTache(n)),
            ),
        ],
      ],
    );
  }
}

class _TacheCard extends StatelessWidget {
  final int number;
  final Color color;
  final String title;
  final String facts;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final List<Widget> children;

  const _TacheCard({required this.number, required this.color, required this.title, required this.facts, required this.onEdit, required this.onDelete, required this.children});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    // Rounded corners need a uniform border: the coloured edge sits inside,
    // clipped by the card.
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 10, 6, 12),
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: color, width: 4)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                NumberBadge('$number', color: color, size: 30),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                      ),
                      Text(facts, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                    ],
                  ),
                ),
                IconButton(tooltip: fr ? 'Modifier' : 'Edit', onPressed: onEdit, icon: const Icon(Icons.edit_outlined, size: 20)),
                IconButton(
                  tooltip: fr ? 'Supprimer' : 'Delete',
                  onPressed: onDelete,
                  icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.bad),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: children),
            ),
          ],
        ),
      ),
    );
  }
}

class _Sub extends StatelessWidget {
  final String text;
  const _Sub(this.text);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 10, bottom: 4),
    child: Text(
      text.toUpperCase(),
      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.6, fontSize: 10.5),
    ),
  );
}

class _Prose extends StatelessWidget {
  final String text;
  final Color? tint;
  const _Prose(this.text, {this.tint});

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(top: 6),
    padding: const EdgeInsets.all(10),
    decoration: BoxDecoration(color: tint ?? AppColors.frenchPaper, borderRadius: BorderRadius.circular(10)),
    child: SelectableText(text, style: AppTypography.bodySmall.copyWith(height: 1.5, color: AppColors.ink)),
  );
}

class _EeTacheEditor extends ConsumerStatefulWidget {
  final int combinaisonId;
  final int number;
  final Map<String, dynamic>? tache;
  const _EeTacheEditor({required this.combinaisonId, required this.number, this.tache});

  @override
  ConsumerState<_EeTacheEditor> createState() => _EeTacheEditorState();
}

class _EeTacheEditorState extends ConsumerState<_EeTacheEditor> {
  final _form = GlobalKey<FormState>();
  late final _prompt = TextEditingController(text: J.s(widget.tache?['prompt_text']));
  late final _question = TextEditingController(text: J.s(widget.tache?['question_text']));
  late final _arg1 = TextEditingController(text: J.s(widget.tache?['argument_text_1']));
  late final _arg2 = TextEditingController(text: J.s(widget.tache?['argument_text_2']));
  late final _correction = TextEditingController(text: J.s(widget.tache?['correction_text']));
  bool _saving = false;

  @override
  void dispose() {
    for (final c in [_prompt, _question, _arg1, _arg2, _correction]) {
      c.dispose();
    }
    super.dispose();
  }

  String? _orNull(TextEditingController c) => c.text.trim().isEmpty ? null : c.text.trim();

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    final fr = context.isFrench;
    final d = eeTasks[widget.number]!;
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'prompt_text': _prompt.text.trim(),
      'correction_text': _orNull(_correction),
      if (widget.number == 3) ...{'question_text': _orNull(_question), 'argument_text_1': _orNull(_arg1), 'argument_text_2': _orNull(_arg2)},
      if (widget.tache == null) ...{'task_number': widget.number, 'task_type': d.type, 'min_words': d.min, 'max_words': d.max, 'duration_minutes': d.dur},
    };
    try {
      final api = ref.read(apiClientProvider);
      if (widget.tache == null) {
        await api.post('/tcf/ee/combinaisons/${widget.combinaisonId}/taches', data: body);
      } else {
        await api.put('/tcf/ee/taches/${widget.tache!['id']}', data: body);
      }
      if (!mounted) return;
      adminToast(context, fr ? 'Tâche enregistrée' : 'Tâche saved');
      Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = eeTasks[widget.number]!;
    final opt = fr ? ' (facultatif)' : ' (optional)';
    return Form(
      key: _form,
      child: AdminPanel(
        title: '${widget.tache == null ? (fr ? 'Ajouter' : 'Add') : (fr ? 'Modifier' : 'Edit')} tâche ${widget.number}',
        subtitle: fr ? '${d.label} · ${d.min}–${d.max} mots · ${d.dur} min' : '${d.label} · ${d.min}–${d.max} words · ${d.dur} min',
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
          AdminButton(fr ? 'Enregistrer' : 'Save', busy: _saving, onPressed: _save),
        ],
        children: [
          const SizedBox(height: 10),
          AdminField(
            label: fr ? 'Consigne' : 'Prompt',
            controller: _prompt,
            maxLines: 5,
            validator: (v) => (v ?? '').trim().isEmpty ? (fr ? 'La consigne est obligatoire' : 'The prompt is required') : null,
          ),
          if (widget.number == 3) ...[
            AdminField(label: 'Question$opt', controller: _question, hint: 'L’uniforme scolaire : pour ou contre ?'),
            FieldGrid(
              columns: wideForm(context) ? 2 : 1,
              children: [
                AdminField(label: 'Argument 1$opt', controller: _arg1, maxLines: 4),
                AdminField(label: 'Argument 2$opt', controller: _arg2, maxLines: 4),
              ],
            ),
          ],
          AdminField(label: (fr ? 'Corrigé' : 'Model answer') + opt, controller: _correction, maxLines: 6),
        ],
      ),
    );
  }
}

// ── EO: parties ────────────────────────────────────────────────────────────

class PartiesScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> month;
  final int year;
  const PartiesScreen({super.key, required this.month, required this.year});

  @override
  ConsumerState<PartiesScreen> createState() => _PartiesScreenState();
}

int _itemsOf(Map t) => J.i(t['task_number']) == 1 ? J.list(t['points']).length : J.list(t['sujets']).length;

class _PartiesScreenState extends ConsumerState<PartiesScreen> with _TreeList {
  String _query = '';

  @override
  String get path => '/tcf/eo/months/${widget.month['id']}/parties';

  String get _where => '${J.s(widget.month['month_name'])} ${widget.year}';

  Future<void> _edit([Map<String, dynamic>? p]) async {
    final fr = context.isFrench;
    final saved = await showAdminPanel<bool>(
      context,
      builder: (_) => _NameEditor(
        title: p == null ? (fr ? 'Nouvelle partie' : 'Add a partie') : (fr ? 'Modifier la partie' : 'Edit partie'),
        initial: p == null ? 'Partie ${items.length + 1}' : J.s(p['name']),
        position: p == null ? items.length + 1 : J.i(p['display_order']),
        save: (ref, name, pos) => p == null
            ? ref.read(apiClientProvider).post(path, data: {'name': name, 'display_order': pos})
            : ref.read(apiClientProvider).put('/tcf/eo/parties/${p['id']}', data: {'name': name, 'display_order': pos}),
      ),
    );
    if (saved == true) load();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final list = [...items]..sort((a, b) => J.i(a['display_order']) != J.i(b['display_order']) ? J.i(a['display_order']).compareTo(J.i(b['display_order'])) : J.i(a['id']).compareTo(J.i(b['id'])));
    final q = _query.trim().toLowerCase();
    final shown = q.isEmpty ? list : list.where((p) => J.s(p['name']).toLowerCase().contains(q)).toList();
    final incomplete = list.where((p) => J.list(p['taches']).length < 3).toList();
    final total = list.fold<int>(0, (t, p) => t + J.list(p['taches']).fold<int>(0, (s, x) => s + _itemsOf(x)));
    return ExamScaffold(
      title: _where,
      subtitle: fr ? '${list.length} partie(s) · $total points et sujets' : '${list.length} partie(s) · $total points and sujets',
      skill: Skill.eo,
      actions: [
        IconButton(
          tooltip: fr ? 'Attribuer le mois' : 'Assign month',
          icon: const Icon(Icons.send_outlined),
          onPressed: () => openLevel(context, AssignContentScreen(preselect: ['eo_month:${widget.month['id']}'])),
        ),
      ],
      fab: ExamFab(fr ? 'Partie' : 'Add partie', onPressed: _edit),
      body: ExamBody(
        loading: loading,
        error: error,
        onRefresh: load,
        empty: items.isEmpty,
        emptyState: AdminEmpty(
          icon: Icons.record_voice_over_outlined,
          title: fr ? 'Aucune partie' : 'No parties yet',
          message: fr ? 'Une partie réunit les trois tâches orales d’une session.' : 'A partie holds the three tâches of one oral exam session.',
        ),
        toolbar: list.length > 8 ? AdminSearchField(hint: fr ? 'Rechercher' : 'Search parties', onChanged: (v) => setState(() => _query = v)) : null,
        children: [
          if (incomplete.isNotEmpty)
            WarnNote(
              fr
                  ? '${incomplete.length} partie(s) incomplète(s) : ${incomplete.take(6).map((p) => '${J.s(p['name'])} (${J.list(p['taches']).length}/3)').join(', ')}'
                  : '${incomplete.length} partie(s) missing tâches: ${incomplete.take(6).map((p) => '${J.s(p['name'])} (${J.list(p['taches']).length}/3)').join(', ')}',
            ),
          TreeGrid(
            children: [
              for (final p in shown)
                TreeCard(
                  warn: J.list(p['taches']).length < 3,
                  leading: NumberBadge(J.i(p['display_order']) == 0 ? '–' : '${J.i(p['display_order'])}', color: Skill.eo.color),
                  title: J.s(p['name']),
                  subtitle: fr ? '${J.list(p['taches']).fold<int>(0, (s, t) => s + _itemsOf(t))} points et sujets' : '${J.list(p['taches']).fold<int>(0, (s, t) => s + _itemsOf(t))} points and sujets',
                  footer: _TaskDots(present: {for (final t in J.list(p['taches'])) J.i(t['task_number'])}, color: Skill.eo.color, trailing: '${J.list(p['taches']).length}/3 tâches'),
                  onTap: () => openLevel(context, PartieScreen(monthPath: path, partieId: J.i(p['id']), where: _where)).then((_) => load()),
                  menu: [
                    menuItem(Icons.edit_outlined, fr ? 'Modifier' : 'Edit', () => _edit(p)),
                    menuItem(Icons.send_outlined, fr ? 'Attribuer…' : 'Assign…', () => openLevel(context, AssignContentScreen(preselect: ['eo_partie:${p['id']}']))),
                    menuItem(
                      Icons.delete_outline,
                      fr ? 'Supprimer' : 'Delete',
                      () => remove(
                        '/tcf/eo/parties/${p['id']}',
                        title: fr ? 'Supprimer « ${J.s(p['name'])} » ?' : 'Delete “${J.s(p['name'])}”?',
                        message: fr ? 'Ses tâches, points et sujets seront aussi supprimés. Action irréversible.' : 'Its tâches, points and sujets are deleted too. This can’t be undone.',
                        done: fr ? 'Partie supprimée' : 'Partie deleted',
                      ),
                      danger: true,
                    ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// One partie: tâche 1 with its points à aborder, tâches 2 and 3 with their sujets.
class PartieScreen extends ConsumerStatefulWidget {
  final String monthPath;
  final int partieId;
  final String where;
  const PartieScreen({super.key, required this.monthPath, required this.partieId, required this.where});

  @override
  ConsumerState<PartieScreen> createState() => _PartieScreenState();
}

class _PartieScreenState extends ConsumerState<PartieScreen> {
  Map<String, dynamic>? _p;
  bool _loading = true;
  String? _error;
  final _shown = <int>{};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get(widget.monthPath);
      final p = J.list(res.data).where((x) => J.i(x['id']) == widget.partieId).firstOrNull;
      if (!mounted) return;
      setState(() {
        _p = p;
        _loading = false;
        _error = p == null ? (context.isFrench ? 'Cette partie n’existe plus.' : 'This partie no longer exists.') : null;
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

  Future<void> _panel(Widget editor) async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => editor);
    if (saved == true) _load();
  }

  Future<void> _delete(String url, String title, String message) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(context, title: title, message: message, confirmLabel: fr ? 'Supprimer' : 'Delete');
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete(url);
      if (mounted) adminToast(context, fr ? 'Supprimé' : 'Deleted');
      _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final p = _p;
    final taches = p == null ? <Map<String, dynamic>>[] : (J.list(p['taches'])..sort((a, b) => J.i(a['task_number']).compareTo(J.i(b['task_number']))));
    final missing = [1, 2, 3].where((n) => !taches.any((t) => J.i(t['task_number']) == n)).toList();
    final total = taches.fold<num>(0, (t, x) => t + J.n(x['duration_minutes']) + J.n(x['prep_minutes']));
    return ExamScaffold(
      title: p == null ? 'Partie' : J.s(p['name']),
      subtitle: '${widget.where} · ${taches.length}/3 tâches${total > 0 ? ' · ${minutesText(total)}' : ''}',
      skill: Skill.eo,
      actions: [
        if (p != null)
          IconButton(
            tooltip: fr ? 'Attribuer' : 'Assign',
            icon: const Icon(Icons.send_outlined),
            onPressed: () => openLevel(context, AssignContentScreen(preselect: ['eo_partie:${widget.partieId}'])),
          ),
      ],
      body: _loading
          ? const AdminLoading()
          : _error != null
          ? AdminError(message: _error!, onRetry: _load)
          : AdminPage(
              onRefresh: _load,
              maxWidth: 860,
              children: [
                for (final t in taches) ...[_eoTache(context, t), const SizedBox(height: 12)],
                if (missing.isNotEmpty) ...[
                  WarnNote(
                    missing.length == 3
                        ? (fr ? 'Cette partie n’a pas encore de tâches.' : 'This partie has no tâches yet.')
                        : (fr ? 'Il manque la tâche ${missing.join(' et ')}.' : 'Missing tâche ${missing.join(' and ')}.'),
                  ),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final n in missing)
                        AdminButton(
                          fr ? 'Tâche $n · ${eoTasks[n]!.label}' : 'Tâche $n · ${eoTasks[n]!.label}',
                          icon: Icons.add,
                          primary: false,
                          onPressed: () => _panel(_EoTacheEditor(partieId: widget.partieId, number: n)),
                        ),
                    ],
                  ),
                ],
              ],
            ),
    );
  }

  Widget _eoTache(BuildContext context, Map<String, dynamic> t) {
    final fr = context.isFrench;
    final n = J.i(t['task_number']);
    final prep = J.n(t['prep_minutes']);
    final points = J.list(t['points'])..sort((a, b) => J.i(a['point_number']).compareTo(J.i(b['point_number'])));
    final sujets = J.list(t['sujets'])..sort((a, b) => J.i(a['sujet_number']).compareTo(J.i(b['sujet_number'])));
    return _TacheCard(
      number: n,
      color: Skill.eo.color,
      title: 'Tâche $n · ${eoTasks[n]?.label ?? J.s(t['task_type'])}',
      facts: [
        if (prep > 0) '${minutesText(prep)} ${fr ? 'de préparation' : 'preparation'}',
        minutesText(J.n(t['duration_minutes'])),
        n == 1 ? '${points.length}/4 points' : '${sujets.length} sujet(s)',
      ].join(' · '),
      onEdit: () => _panel(_EoTacheEditor(partieId: widget.partieId, number: n, tache: t)),
      onDelete: () => _delete(
        '/tcf/eo/taches/${t['id']}',
        fr ? 'Supprimer la tâche $n ?' : 'Delete tâche $n?',
        fr ? 'Ses ${n == 1 ? 'points à aborder' : 'sujets'} seront aussi supprimés.' : 'Its ${n == 1 ? 'points à aborder' : 'sujets'} are deleted too.',
      ),
      children: [
        if (J.s(t['prompt_text']).isNotEmpty) _Prose(J.s(t['prompt_text'])),
        if (n == 1) ...[
          const _Sub('Points à aborder'),
          for (final pt in points)
            ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              leading: NumberBadge('${J.i(pt['point_number'])}', color: Skill.eo.color, size: 28),
              title: Text(J.s(pt['title']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
              subtitle: J.s(pt['subtitle']).isEmpty ? null : Text(J.s(pt['subtitle']), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
              trailing: PopupMenuButton<VoidCallback>(
                icon: const Icon(Icons.more_horiz, color: AppColors.textMuted),
                onSelected: (a) => a(),
                itemBuilder: (_) => [
                  menuItem(Icons.edit_outlined, fr ? 'Modifier' : 'Edit', () => _panel(_EoPointEditor(tacheId: J.i(t['id']), point: pt, next: points.length + 1))),
                  menuItem(
                    Icons.delete_outline,
                    fr ? 'Supprimer' : 'Delete',
                    () => _delete('/tcf/eo/points/${pt['id']}', fr ? 'Supprimer ce point ?' : 'Delete this point?', fr ? 'Action irréversible.' : 'This can’t be undone.'),
                    danger: true,
                  ),
                ],
              ),
            ),
          if (points.length < 4)
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => _panel(_EoPointEditor(tacheId: J.i(t['id']), next: points.length + 1)),
                icon: const Icon(Icons.add, size: 18),
                label: Text(fr ? 'Ajouter le point ${points.length + 1}' : 'Add point ${points.length + 1}'),
              ),
            ),
        ] else ...[
          const _Sub('Sujets'),
          for (final s in sujets)
            Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.fromLTRB(10, 8, 0, 8),
              decoration: BoxDecoration(color: AppColors.frenchPaper, borderRadius: BorderRadius.circular(10)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: NumberBadge('${J.i(s['sujet_number'])}', color: Skill.eo.color, size: 26),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(J.s(s['prompt_text']), style: AppTypography.bodySmall.copyWith(color: AppColors.ink, height: 1.45)),
                            if (secondsText(s['duration_seconds'] as num?).isNotEmpty)
                              Text('⏱ ${secondsText(s['duration_seconds'] as num?)}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      PopupMenuButton<VoidCallback>(
                        icon: const Icon(Icons.more_horiz, color: AppColors.textMuted),
                        onSelected: (a) => a(),
                        itemBuilder: (_) => [
                          menuItem(Icons.edit_outlined, fr ? 'Modifier' : 'Edit', () => _panel(_EoSujetEditor(tacheId: J.i(t['id']), sujet: s, next: sujets.length + 1))),
                          menuItem(
                            Icons.delete_outline,
                            fr ? 'Supprimer' : 'Delete',
                            () => _delete('/tcf/eo/sujets/${s['id']}', fr ? 'Supprimer ce sujet ?' : 'Delete this sujet?', fr ? 'Action irréversible.' : 'This can’t be undone.'),
                            danger: true,
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (J.s(s['correction_text']).isNotEmpty) ...[
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton(
                        onPressed: () => setState(() => _shown.contains(J.i(s['id'])) ? _shown.remove(J.i(s['id'])) : _shown.add(J.i(s['id']))),
                        child: Text(_shown.contains(J.i(s['id'])) ? (fr ? 'Masquer le corrigé' : 'Hide model answer') : (fr ? 'Voir le corrigé' : 'Show model answer')),
                      ),
                    ),
                    if (_shown.contains(J.i(s['id'])))
                      Padding(
                        padding: const EdgeInsets.only(right: 10),
                        child: _Prose(J.s(s['correction_text']), tint: AppColors.goodBg),
                      ),
                  ],
                ],
              ),
            ),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () => _panel(_EoSujetEditor(tacheId: J.i(t['id']), next: sujets.length + 1)),
              icon: const Icon(Icons.add, size: 18),
              label: Text(fr ? 'Ajouter le sujet ${sujets.length + 1}' : 'Add sujet ${sujets.length + 1}'),
            ),
          ),
        ],
      ],
    );
  }
}

/// A small form panel that saves a JSON body and closes with `true`.
class _JsonEditor extends ConsumerStatefulWidget {
  final String title;
  final String? subtitle;
  final List<(String key, String label, int lines, bool required, bool number)> fields;
  final Map<String, dynamic> initial;
  final Future<void> Function(WidgetRef ref, Map<String, dynamic> body) save;
  const _JsonEditor({required this.title, this.subtitle, required this.fields, required this.initial, required this.save});

  @override
  ConsumerState<_JsonEditor> createState() => _JsonEditorState();
}

class _JsonEditorState extends ConsumerState<_JsonEditor> {
  final _form = GlobalKey<FormState>();
  late final _c = {for (final f in widget.fields) f.$1: TextEditingController(text: widget.initial[f.$1] == null ? '' : '${widget.initial[f.$1]}')};
  bool _saving = false;

  @override
  void dispose() {
    for (final c in _c.values) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Form(
      key: _form,
      child: AdminPanel(
        title: widget.title,
        subtitle: widget.subtitle,
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
          AdminButton(
            fr ? 'Enregistrer' : 'Save',
            busy: _saving,
            onPressed: () async {
              if (!_form.currentState!.validate()) return;
              setState(() => _saving = true);
              final body = <String, dynamic>{for (final f in widget.fields) f.$1: f.$5 ? parseNum(_c[f.$1]!.text) : (_c[f.$1]!.text.trim().isEmpty && !f.$4 ? null : _c[f.$1]!.text.trim())};
              try {
                await widget.save(ref, body);
                if (context.mounted) {
                  adminToast(context, fr ? 'Enregistré' : 'Saved');
                  Navigator.pop(context, true);
                }
              } catch (e) {
                if (!context.mounted) return;
                setState(() => _saving = false);
                adminToast(context, apiErrorText(context, e), error: true);
              }
            },
          ),
        ],
        children: [
          const SizedBox(height: 10),
          for (final f in widget.fields)
            f.$5
                ? NumberField(label: f.$2, controller: _c[f.$1]!, decimal: true, required: f.$4, min: 0)
                : AdminField(label: f.$2, controller: _c[f.$1]!, maxLines: f.$3, validator: f.$4 ? (v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null : null),
        ],
      ),
    );
  }
}

class _EoTacheEditor extends StatelessWidget {
  final int partieId;
  final int number;
  final Map<String, dynamic>? tache;
  const _EoTacheEditor({required this.partieId, required this.number, this.tache});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = eoTasks[number]!;
    final opt = fr ? ' (facultatif)' : ' (optional)';
    return _JsonEditor(
      title: '${tache == null ? (fr ? 'Ajouter' : 'Add') : (fr ? 'Modifier' : 'Edit')} tâche $number',
      subtitle: '${d.label} · ${number == 1 ? (fr ? 'jusqu’à 4 points à aborder' : 'up to 4 points à aborder') : (fr ? 'contient les sujets' : 'holds the sujets')}',
      fields: [
        ('prompt_text', (fr ? 'Consigne' : 'Instructions') + opt, 3, false, false),
        ('prep_minutes', fr ? 'Préparation (min)' : 'Preparation (min)', 1, false, true),
        ('duration_minutes', fr ? 'Durée (min)' : 'Duration (min)', 1, true, true),
      ],
      initial: tache == null ? {'prep_minutes': d.prep, 'duration_minutes': d.dur} : tache!,
      save: (ref, body) {
        final api = ref.read(apiClientProvider);
        body['prep_minutes'] ??= 0;
        return tache == null ? api.post('/tcf/eo/parties/$partieId/taches', data: {...body, 'task_number': number, 'task_type': d.type}) : api.put('/tcf/eo/taches/${tache!['id']}', data: body);
      },
    );
  }
}

class _EoPointEditor extends StatelessWidget {
  final int tacheId;
  final Map<String, dynamic>? point;
  final int next;
  const _EoPointEditor({required this.tacheId, this.point, required this.next});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return _JsonEditor(
      title: point == null ? (fr ? 'Ajouter le point $next' : 'Add point $next') : (fr ? 'Modifier le point' : 'Edit point'),
      subtitle: fr ? 'Les points à aborder guident la présentation.' : 'Points à aborder guide the student’s presentation.',
      fields: [('title', fr ? 'Titre' : 'Title', 1, true, false), ('subtitle', fr ? 'Détail (facultatif)' : 'Detail (optional)', 1, false, false)],
      initial: point ?? const {},
      save: (ref, body) => point == null
          ? ref.read(apiClientProvider).post('/tcf/eo/taches/$tacheId/points', data: {...body, 'point_number': next})
          : ref.read(apiClientProvider).put('/tcf/eo/points/${point!['id']}', data: body),
    );
  }
}

class _EoSujetEditor extends StatelessWidget {
  final int tacheId;
  final Map<String, dynamic>? sujet;
  final int next;
  const _EoSujetEditor({required this.tacheId, this.sujet, required this.next});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return _JsonEditor(
      title: sujet == null ? (fr ? 'Ajouter le sujet $next' : 'Add sujet $next') : (fr ? 'Modifier le sujet' : 'Edit sujet'),
      subtitle: fr ? 'Une question à laquelle l’étudiant répond à l’oral.' : 'One question the student answers out loud.',
      fields: [
        ('prompt_text', 'Sujet', 4, true, false),
        ('duration_seconds', fr ? 'Temps de parole (secondes, facultatif)' : 'Speaking time (seconds, optional)', 1, false, true),
        ('correction_text', fr ? 'Corrigé (facultatif)' : 'Model answer (optional)', 4, false, false),
      ],
      initial: sujet ?? const {},
      save: (ref, body) {
        if (body['duration_seconds'] != null) body['duration_seconds'] = (body['duration_seconds'] as num).round();
        return sujet == null
            ? ref.read(apiClientProvider).post('/tcf/eo/taches/$tacheId/sujets', data: {...body, 'sujet_number': next})
            : ref.read(apiClientProvider).put('/tcf/eo/sujets/${sujet!['id']}', data: body);
      },
    );
  }
}
