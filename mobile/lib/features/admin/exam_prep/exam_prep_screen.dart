import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'ai_credits_screen.dart';
import 'assignments.dart';
import 'comprehension_screens.dart';
import 'exam_common.dart';
import 'exam_results_screen.dart';
import 'expression_screens.dart';

/// TCF preparation: the four skills and their content, who has access to
/// what, AI correction credits and learners' results.
class AdminExamPrepScreen extends ConsumerStatefulWidget {
  const AdminExamPrepScreen({super.key});

  @override
  ConsumerState<AdminExamPrepScreen> createState() => _AdminExamPrepScreenState();
}

class _AdminExamPrepScreenState extends ConsumerState<AdminExamPrepScreen> {
  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>>? _groups;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    setState(() => _error = null);
    try {
      final cats = await api.get('/tcf/categories');
      if (!mounted) return;
      setState(() {
        _categories = J.list(cats.data, ['categories']);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
    _loadGroups();
  }

  Future<void> _loadGroups() async {
    try {
      final res = await ref.read(apiClientProvider).get('/tcf/exam-assignments');
      if (mounted) setState(() => _groups = J.list(res.data));
    } catch (_) {
      if (mounted) setState(() => _groups ??= []);
    }
  }

  void _open(Map<String, dynamic> cat) {
    final skill = SkillX.ofCategory(J.s(cat['name']));
    if (skill == Skill.other) {
      adminToast(context, context.isFrench ? 'Bientôt disponible' : 'Coming soon');
      return;
    }
    final screen = skill.hasYears ? YearsScreen(category: cat, skill: skill) : SeriesListScreen(category: cat, skill: skill);
    openLevel(context, screen).then((_) => _load());
  }

  Future<void> _editCategory([Map<String, dynamic>? cat]) async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => _CategoryEditor(category: cat));
    if (saved == true) _load();
  }

  Future<void> _deleteCategory(Map<String, dynamic> cat) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer « ${J.s(cat['name'])} » ?' : 'Delete “${J.s(cat['name'])}”?',
      message: fr
          ? 'Toutes les séries, années, questions et attributions qu’elle contient seront aussi supprimées. Action irréversible.'
          : 'Every series, year, question and assignment inside it is deleted too. This can’t be undone.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete('/tcf/categories/${cat['id']}');
      if (mounted) adminToast(context, fr ? 'Catégorie supprimée' : 'Category deleted');
      _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  Future<void> _assign({bool list = false}) async {
    await openLevel(context, list ? const AssignmentsScreen() : const AssignContentScreen());
    _loadGroups();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _categories.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final groups = _groups ?? const [];
    final active = groups.where((g) => g['is_expired'] != true).toList();
    final now = DateTime.now();
    final endingSoon = active.where((g) {
      final e = J.date(g['expires_at']);
      return e != null && e.difference(now).inDays < 7;
    }).length;
    final reached = <String>{for (final g in active) for (final r in J.list(g['recipients'])) J.s(r['key'])};
    final studentsReached = reached.where((k) => k.startsWith('student:')).length;
    final batchesReached = reached.length - studentsReached;
    final contentTotal = _categories.fold<int>(0, (t, c) => t + J.i(c['series_count']));
    int activeFor(Skill s) => active.where((g) => J.list(g['items']).any((i) {
          final type = J.s(i['content_type']);
          final fam = type == 'category' ? SkillX.ofCategory(J.s(i['content_name'])) : SkillX.ofType(type);
          return fam == s;
        })).length;

    return AdminPage(
      onRefresh: _load,
      children: [
        AdminHeader(
          overline: fr ? 'Préparation aux examens' : 'Exam preparation',
          title: fr ? 'Préparation au TCF Canada' : 'TCF Canada preparation',
          subtitle: fr
              ? 'Créez le contenu des quatre épreuves, donnez-y accès et suivez les résultats.'
              : 'Build practice content for the four TCF skills, give students access and follow their results.',
          actions: [
            AdminButton(fr ? 'Attribuer' : 'Assign content', icon: Icons.send_outlined, onPressed: _assign),
            AdminButton(fr ? 'Résultats' : 'Student results', icon: Icons.bar_chart, primary: false, onPressed: () => openLevel(context, const ExamResultsScreen())),
            AdminButton(fr ? 'Crédits IA' : 'AI credits', icon: Icons.bolt_outlined, primary: false, onPressed: () => openLevel(context, const AiCreditsScreen())),
          ],
        ),
        AdminGrid(
          minTileWidth: 160,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(
              label: fr ? 'Attributions actives' : 'Active assignments',
              value: _groups == null ? '–' : '${active.length}',
              sub: _groups == null ? null : (fr ? '${groups.length - active.length} terminées · tout gérer' : '${groups.length - active.length} expired · manage all'),
              icon: Icons.send_outlined,
              onTap: () => _assign(list: true),
            ),
            StatTile(
              label: fr ? 'Étudiants avec accès' : 'Students with access',
              value: _groups == null ? '–' : '$studentsReached',
              sub: fr ? '+ $batchesReached promotion(s)' : '+ $batchesReached batch(es)',
              icon: Icons.groups_outlined,
              color: AppColors.good,
            ),
            StatTile(
              label: fr ? 'Fin cette semaine' : 'Ending this week',
              value: _groups == null ? '–' : '$endingSoon',
              sub: fr ? 'accès qui se ferment sous 7 jours' : 'assignments that lock within 7 days',
              icon: Icons.schedule,
              color: AppColors.warn,
            ),
            StatTile(
              label: fr ? 'Contenu' : 'Practice content',
              value: '$contentTotal',
              sub: fr ? 'séries et années · ${_categories.length} épreuves' : 'series and years · ${_categories.length} skills',
              icon: Icons.apps,
              color: AppColors.textMuted,
            ),
          ],
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(fr ? 'Épreuves' : 'Skills', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
                  Text(
                    fr ? 'Ouvrez une épreuve pour gérer ses séries, années, mois et tâches.' : 'Open a skill to manage its series, years, months and tasks.',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            AdminLink(fr ? '+ Catégorie' : '+ Category', onTap: _editCategory),
          ],
        ),
        const SizedBox(height: 10),
        if (_categories.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.menu_book_outlined,
              title: fr ? 'Aucune catégorie' : 'No categories yet',
              message: fr ? 'Créez la première épreuve pour commencer.' : 'Create the first TCF skill to start building practice content.',
            ),
          )
        else
          AdminGrid(
            minTileWidth: 200,
            maxColumns: 4,
            spacing: 12,
            children: [for (final c in _categories) _SkillCard(category: c, activeCount: _groups == null ? null : activeFor(SkillX.ofCategory(J.s(c['name']))), onOpen: () => _open(c), onEdit: () => _editCategory(c), onDelete: () => _deleteCategory(c))],
          ),
        const SizedBox(height: 18),
        AdminCard(
          title: fr ? 'Attributions récentes' : 'Recent assignments',
          icon: Icons.send_outlined,
          action: AdminLink(fr ? 'Tout gérer' : 'Manage all', onTap: () => _assign(list: true)),
          child: _groups == null
              ? const AdminLoading()
              : groups.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Text(
                        fr ? 'Rien n’est attribué pour l’instant. Utilisez « Attribuer » pour donner accès.' : 'Nothing assigned yet. Use “Assign content” to give students access.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    )
                  : Column(children: [for (final g in groups.take(6)) AssignmentGroupTile(group: g, compact: true)]),
        ),
      ],
    );
  }
}

class _SkillCard extends StatelessWidget {
  final Map<String, dynamic> category;
  final int? activeCount;
  final VoidCallback onOpen;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _SkillCard({required this.category, required this.activeCount, required this.onOpen, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final skill = SkillX.ofCategory(J.s(category['name']));
    final primary = J.i(category['series_count']);
    final secondary = skill.hasYears ? J.i(category['sub_count']) : J.i(category['question_count']);
    final secondaryLabel = switch (skill) {
      Skill.ee => 'combinaisons',
      Skill.eo => 'parties',
      _ => 'questions',
    };
    final implemented = skill != Skill.other;
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onOpen,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 6, 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(color: skill.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(12)),
                    child: Icon(skill.icon, color: skill.color),
                  ),
                  const SizedBox(width: 10),
                  Pill(skill.code, color: skill.color),
                  const Spacer(),
                  PopupMenuButton<VoidCallback>(
                    icon: const Icon(Icons.more_vert, color: AppColors.textMuted),
                    onSelected: (a) => a(),
                    itemBuilder: (_) => [
                      menuItem(Icons.edit_outlined, fr ? 'Modifier' : 'Edit details', onEdit),
                      if (skill == Skill.co)
                        menuItem(Icons.insights_outlined, fr ? 'Analyse de l’écoute' : 'Listening analytics', () => openLevel(context, const CoAnalyticsScreen())),
                      menuItem(Icons.delete_outline, fr ? 'Supprimer' : 'Delete category', onDelete, danger: true),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(J.s(category['name']), style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
              const SizedBox(height: 2),
              Padding(
                padding: const EdgeInsets.only(right: 10),
                child: Text(
                  J.s(category['description']).isEmpty ? (fr ? 'Pas encore de description.' : 'No description yet.') : J.s(category['description']),
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.35),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 18,
                runSpacing: 6,
                children: [
                  _Figure('$primary', skill.hasYears ? (fr ? (primary == 1 ? 'année' : 'années') : (primary == 1 ? 'year' : 'years')) : (fr ? 'séries' : 'series')),
                  _Figure(AdminFmt.number(context, secondary), secondaryLabel),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      activeCount == null
                          ? ''
                          : activeCount == 0
                              ? (fr ? 'Non attribué' : 'Not assigned')
                              : (fr ? '$activeCount attribution(s) active(s)' : '$activeCount active assignment(s)'),
                      style: AppTypography.caption.copyWith(color: activeCount != null && activeCount! > 0 ? AppColors.good : AppColors.textSubtle, fontWeight: FontWeight.w600),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 8, right: 10),
                    child: Text(
                      implemented ? (fr ? 'Ouvrir ›' : 'Open ›') : (fr ? 'Bientôt' : 'Coming soon'),
                      style: AppTypography.caption.copyWith(color: implemented ? AppColors.adminAccent : AppColors.textSubtle, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Figure extends StatelessWidget {
  final String value;
  final String label;
  const _Figure(this.value, this.label);

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
          Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
        ],
      );
}

class _CategoryEditor extends ConsumerStatefulWidget {
  final Map<String, dynamic>? category;
  const _CategoryEditor({this.category});

  @override
  ConsumerState<_CategoryEditor> createState() => _CategoryEditorState();
}

class _CategoryEditorState extends ConsumerState<_CategoryEditor> {
  static const _icons = {
    'ReadOutlined': Icons.menu_book_outlined,
    'FormOutlined': Icons.edit_note,
    'SoundOutlined': Icons.headphones_outlined,
    'AudioOutlined': Icons.mic_none,
    'BookOutlined': Icons.book_outlined,
    'FileTextOutlined': Icons.description_outlined,
  };

  final _form = GlobalKey<FormState>();
  late final _name = TextEditingController(text: J.s(widget.category?['name']));
  late final _description = TextEditingController(text: J.s(widget.category?['description']));
  late String? _icon = widget.category?['icon'] as String?;
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    final fr = context.isFrench;
    setState(() => _saving = true);
    final body = {'name': _name.text.trim(), 'description': _description.text.trim(), 'icon': _icon};
    try {
      final api = ref.read(apiClientProvider);
      if (widget.category == null) {
        await api.post('/tcf/categories', data: body);
      } else {
        await api.put('/tcf/categories/${widget.category!['id']}', data: body);
      }
      if (!mounted) return;
      adminToast(context, widget.category == null ? (fr ? 'Catégorie créée' : 'Category created') : (fr ? 'Catégorie mise à jour' : 'Category updated'));
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
    return Form(
      key: _form,
      child: AdminPanel(
        title: widget.category == null ? (fr ? 'Nouvelle catégorie' : 'New category') : (fr ? 'Modifier la catégorie' : 'Edit category'),
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.pop(context)),
          AdminButton(fr ? 'Enregistrer' : 'Save', busy: _saving, onPressed: _save),
        ],
        children: [
          const SizedBox(height: 10),
          AdminField(
            label: fr ? 'Nom' : 'Name',
            controller: _name,
            hint: 'Compréhension Orale',
            validator: (v) => (v ?? '').trim().isEmpty ? (fr ? 'Le nom est obligatoire' : 'Name is required') : null,
          ),
          AdminField(label: 'Description', controller: _description, maxLines: 3),
          PanelSection(fr ? 'Icône' : 'Icon'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final e in _icons.entries)
                ChoiceChip(
                  avatar: Icon(e.value, size: 18),
                  label: Text(e.key.replaceAll('Outlined', '')),
                  selected: _icon == e.key,
                  onSelected: (on) => setState(() => _icon = on ? e.key : null),
                ),
            ],
          ),
        ],
      ),
    );
  }
}
