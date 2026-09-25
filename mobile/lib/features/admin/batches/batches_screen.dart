import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_nav.dart';
import 'batch_detail_panel.dart';
import 'batch_editor_panel.dart';
import 'batch_utils.dart';

/// Every batch of the school: filter by status, level and teacher, open one
/// to manage its students and timetable, or create a new one.
class BatchesScreen extends ConsumerStatefulWidget {
  const BatchesScreen({super.key});

  @override
  ConsumerState<BatchesScreen> createState() => _BatchesScreenState();
}

class _BatchesScreenState extends ConsumerState<BatchesScreen> {
  List<Map<String, dynamic>> _batches = [];
  List<Map<String, dynamic>> _teachers = [];
  bool _loading = true;
  String? _error;
  String _status = 'active';
  String? _level;
  int? _teacher;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _batches.isEmpty;
      _error = null;
    });
    final api = ref.read(apiClientProvider);
    try {
      final results = await Future.wait([
        api.get('/batches'),
        api.get('/users/role/teachers').catchError((_) => api.get('/users', queryParameters: {'role': 'teacher'})),
      ]);
      if (!mounted) return;
      setState(() {
        _batches = J.list(results[0].data, ['batches']);
        _teachers = J.list(results[1].data, ['teachers', 'users']);
        _loading = false;
      });
      _takeIntent();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _filtered {
    final q = _search.trim().toLowerCase();
    final list = _batches.where((b) {
      final s = BatchX.status(b);
      if (_status == 'active' && s == 'ended') return false;
      if (_status != 'active' && _status != 'all' && s != _status) return false;
      if (_level != null && J.s(b['french_level']).toUpperCase() != _level) return false;
      if (_teacher != null && J.i(b['teacher_id']) != _teacher) return false;
      if (q.isEmpty) return true;
      return '${J.s(b['name'])} ${BatchX.teacher(b)}'.toLowerCase().contains(q);
    }).toList();
    // Running first, then upcoming (soonest first), then ended (latest first).
    int rank(Map<String, dynamic> b) => const {'running': 0, 'upcoming': 1, 'ended': 2}[BatchX.status(b)]!;
    list.sort((a, b) {
      final r = rank(a).compareTo(rank(b));
      if (r != 0) return r;
      final da = J.date(a['start_date']) ?? DateTime(2000);
      final db = J.date(b['start_date']) ?? DateTime(2000);
      return rank(a) == 2 ? db.compareTo(da) : da.compareTo(db);
    });
    return list;
  }

  Future<void> _open(Map<String, dynamic> b) async {
    await showAdminPanel(context, tabletWidth: 560, builder: (_) => BatchDetailPanel(batch: b, teachers: _teachers, onChanged: _load));
  }

  /// Opens the form when the dashboard asked for it, once the list is
  /// ready (the screen may be opened for the first time by that request).
  void _takeIntent() {
    if (_loading || ref.read(adminIntentProvider) != AdminIntent.newBatch) return;
    ref.read(adminIntentProvider.notifier).state = null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _create();
    });
  }

  Future<void> _create() async {
    final saved = await showAdminPanel<bool>(context, tabletWidth: 600, builder: (_) => BatchEditorPanel(teachers: _teachers));
    if (saved == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AdminIntent?>(adminIntentProvider, (_, next) {
      if (next == AdminIntent.newBatch) _takeIntent();
    });
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _batches.isEmpty) return AdminError(message: _error!, onRetry: _load);

    int count(String s) => _batches.where((b) => BatchX.status(b) == s).length;
    final running = count('running');
    final upcoming = count('upcoming');
    final enrolled = _batches.where((b) => BatchX.status(b) != 'ended').fold<int>(0, (s, b) => s + BatchX.students(b));
    final list = _filtered;

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(child: AdminSearchField(hint: fr ? 'Promotion ou professeur' : 'Batch or teacher', onChanged: (v) => setState(() => _search = v))),
              const SizedBox(width: 10),
              AdminButton(fr ? 'Nouvelle' : 'New', icon: Icons.add, onPressed: _create),
            ],
          ),
          const SizedBox(height: 10),
          AdminFilterChips<String>(
            options: [
              FilterOption('active', fr ? 'Actives' : 'Active', count: running + upcoming),
              FilterOption('running', BatchX.statusLabel('running', fr), count: running),
              FilterOption('upcoming', BatchX.statusLabel('upcoming', fr), count: upcoming),
              FilterOption('ended', fr ? 'Terminées' : 'Ended', count: count('ended')),
              FilterOption('all', fr ? 'Toutes' : 'All', count: _batches.length),
            ],
            selected: _status,
            onSelected: (v) => setState(() => _status = v),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: AdminFilterChips<String?>(
                  options: [FilterOption<String?>(null, fr ? 'Tous niveaux' : 'All levels'), for (final l in BatchX.levels) FilterOption<String?>(l, l)],
                  selected: _level,
                  onSelected: (v) => setState(() => _level = v),
                ),
              ),
              PopupMenuButton<int?>(
                tooltip: fr ? 'Filtrer par professeur' : 'Filter by teacher',
                initialValue: _teacher,
                onSelected: (v) => setState(() => _teacher = v == -1 ? null : v),
                itemBuilder: (_) => [
                  PopupMenuItem(value: -1, child: Text(fr ? 'Tous les professeurs' : 'All teachers')),
                  for (final t in _teachers) PopupMenuItem(value: J.i(t['id']), child: Text(J.name(t))),
                ],
                child: Chip(
                  avatar: const Icon(Icons.person_outline, size: 16),
                  label: Text(
                    _teacher == null
                        ? (fr ? 'Professeur' : 'Teacher')
                        : J.name(_teachers.firstWhere((t) => J.i(t['id']) == _teacher, orElse: () => const {})),
                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                  ),
                  backgroundColor: _teacher == null ? AppColors.pureWhite : AppColors.adminAccentBg,
                  side: BorderSide(color: _teacher == null ? AppColors.border : AppColors.adminAccent),
                ),
              ),
            ],
          ),
        ],
      ),
      children: [
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(label: fr ? 'En cours' : 'Running', value: '$running', icon: Icons.play_circle_outline, color: const Color(0xFF4F46E5)),
            StatTile(label: fr ? 'À venir' : 'Upcoming', value: '$upcoming', icon: Icons.schedule, color: const Color(0xFF0891B2)),
            StatTile(label: fr ? 'Inscriptions actives' : 'Active enrolments', value: '$enrolled', icon: Icons.school_outlined, color: AppColors.good),
            StatTile(label: fr ? 'Professeurs' : 'Teachers', value: '${_teachers.length}', icon: Icons.co_present_outlined, color: const Color(0xFF2563EB)),
          ],
        ),
        const SizedBox(height: 16),
        if (list.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.groups_outlined,
              title: _batches.isEmpty ? (fr ? 'Aucune promotion' : 'No batches yet') : (fr ? 'Aucune promotion ne correspond' : 'No batches match'),
              message: _batches.isEmpty
                  ? (fr ? 'Créez une première promotion avec son professeur et ses étudiants.' : 'Create a first batch with its teacher and students.')
                  : (fr ? 'Essayez un autre filtre.' : 'Try another filter.'),
            ),
          )
        else
          AdminGrid(
            minTileWidth: 300,
            maxColumns: 3,
            spacing: 12,
            children: [for (final b in list) _BatchCard(b: b, onTap: () => _open(b))],
          ),
      ],
    );
  }
}

class _BatchCard extends StatelessWidget {
  final Map<String, dynamic> b;
  final VoidCallback onTap;
  const _BatchCard({required this.b, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final status = BatchX.status(b);
    final count = BatchX.students(b);
    final teacher = BatchX.teacher(b);
    final start = J.date(b['start_date']);
    final end = J.date(b['end_date']);
    final p = BatchX.progress(b);
    final soon = status == 'upcoming' && start != null ? start.difference(DateTime.now()).inDays : null;
    final left = status == 'running' && end != null ? end.difference(DateTime.now()).inDays : null;
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: count == 0 && status != 'ended' ? AppColors.badBorder : AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Pill.level(J.s(b['french_level'])),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(J.s(b['name']), style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ),
                  Pill(BatchX.statusLabel(status, fr), color: BatchX.statusColor(status)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.person_outline, size: 15, color: AppColors.textSubtle),
                  const SizedBox(width: 6),
                  Expanded(child: Text(teacher.isEmpty ? (fr ? 'Sans professeur' : 'Unassigned') : teacher, style: AppTypography.caption.copyWith(color: AppColors.text), maxLines: 1, overflow: TextOverflow.ellipsis)),
                  const Icon(Icons.groups_outlined, size: 15, color: AppColors.textSubtle),
                  const SizedBox(width: 4),
                  Text(
                    '$count',
                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: count == 0 && status != 'ended' ? AppColors.bad : AppColors.ink),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.date_range_outlined, size: 15, color: AppColors.textSubtle),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      '${AdminFmt.dayShort(context, start)} → ${AdminFmt.day(context, end)} · ${BatchX.duration(b, fr)}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: status == 'upcoming' ? 0 : p,
                  minHeight: 5,
                  color: BatchX.statusColor(status),
                  backgroundColor: AppColors.borderSoft,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                status == 'upcoming'
                    ? (soon != null && soon <= 0 ? (fr ? "Commence aujourd'hui" : 'Starts today') : (fr ? 'Commence dans $soon j' : 'Starts in $soon days'))
                    : status == 'running'
                        ? (fr ? '${(p * 100).round()} % écoulé · ${left ?? 0} j restants' : '${(p * 100).round()}% done · ${left ?? 0} days left')
                        : (fr ? 'Terminée' : 'Finished'),
                style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
