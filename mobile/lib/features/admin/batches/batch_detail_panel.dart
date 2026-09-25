import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../teacher/batches/screens/batch_insights_screen.dart';
import '../common/admin_kit.dart';
import 'batch_editor_panel.dart';
import 'batch_utils.dart';

/// One batch: its dates, teacher, weekly classes and students, with the
/// actions an admin takes on it (enrol, remove, edit, insights, delete).
class BatchDetailPanel extends ConsumerStatefulWidget {
  final Map<String, dynamic> batch;
  final List<Map<String, dynamic>> teachers;
  final Future<void> Function() onChanged;

  const BatchDetailPanel({super.key, required this.batch, required this.teachers, required this.onChanged});

  @override
  ConsumerState<BatchDetailPanel> createState() => _BatchDetailPanelState();
}

class _BatchDetailPanelState extends ConsumerState<BatchDetailPanel> {
  late Map<String, dynamic> _b = Map.of(widget.batch);
  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>> _timetable = [];
  bool _loading = true;
  bool _busy = false;

  int get _id => J.i(_b['id']);

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    try {
      final results = await Future.wait([api.get('/batches/$_id'), api.get('/batches/$_id/timetable')]);
      if (!mounted) return;
      final detail = J.map(results[0].data);
      setState(() {
        _b = {..._b, ...detail};
        _students = J.list(detail['students']);
        _timetable = J.list(results[1].data, ['timetable'])
          ..sort((a, b) {
            final d = BatchX.weekOrder(J.i(a['day_of_week'])).compareTo(BatchX.weekOrder(J.i(b['day_of_week'])));
            return d != 0 ? d : BatchX.hhmm(a['start_time']).compareTo(BatchX.hhmm(b['start_time']));
          });
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  Future<void> _changed() async {
    await _load();
    await widget.onChanged();
  }

  Future<void> _edit({int step = 0}) async {
    final saved = await showAdminPanel<bool>(
      context,
      tabletWidth: 600,
      builder: (_) => BatchEditorPanel(teachers: widget.teachers, batch: _b, timetable: _timetable, initialStep: step),
    );
    if (saved == true) await _changed();
  }

  Future<void> _addStudents() async {
    final fr = context.isFrench;
    final ids = await showAdminPanel<List<int>>(
      context,
      builder: (_) => StudentPicker(exclude: _students.map((s) => J.i(s['id'])).toSet(), title: fr ? 'Ajouter des étudiants' : 'Add students'),
    );
    if (ids == null || ids.isEmpty || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).post('/batches/$_id/students', data: {'student_ids': ids});
      if (!mounted) return;
      adminToast(context, fr ? '${ids.length} étudiant${ids.length > 1 ? 's ajoutés' : ' ajouté'}' : '${ids.length} student${ids.length > 1 ? 's' : ''} added');
      await _changed();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _remove(Map<String, dynamic> s) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Retirer ${J.name(s)} ?' : 'Remove ${J.name(s)}?',
      message: fr ? 'Cet étudiant quitte la promotion. Son compte est conservé.' : 'The student leaves this batch. Their account is kept.',
      confirmLabel: fr ? 'Retirer' : 'Remove',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).delete('/batches/$_id/students/${J.i(s['id'])}');
      await _changed();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer « ${J.s(_b['name'])} » ?' : 'Delete “${J.s(_b['name'])}”?',
      message: fr
          ? 'La promotion, son emploi du temps et les inscriptions sont supprimés. Les comptes des étudiants sont conservés.'
          : 'The batch, its timetable and enrolments are removed. Student accounts are kept.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).delete('/batches/$_id');
      await widget.onChanged();
      if (!mounted) return;
      adminToast(context, fr ? 'Promotion supprimée' : 'Batch deleted');
      Navigator.of(context).maybePop();
    } catch (e) {
      if (mounted) {
        adminToast(context, apiErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final status = BatchX.status(_b);
    final teacher = BatchX.teacher(_b);
    final p = BatchX.progress(_b);
    final weekly = _timetable.fold<int>(0, (s, t) => s + (BatchX.minutes(J.s(t['end_time'])) - BatchX.minutes(J.s(t['start_time']))).clamp(0, 24 * 60));
    final mode = J.s(_b['default_location_mode']).isEmpty ? 'online' : J.s(_b['default_location_mode']);

    return AdminPanel(
      title: J.s(_b['name']),
      subtitle: '${BatchX.levelHint(J.s(_b['french_level']).toUpperCase(), fr)} · ${teacher.isEmpty ? (fr ? 'Sans professeur' : 'Unassigned') : teacher}',
      leading: Pill.level(J.s(_b['french_level'])),
      actions: [
        AdminButton(fr ? 'Modifier' : 'Edit', icon: Icons.edit_outlined, primary: false, onPressed: _busy ? null : () => _edit()),
        AdminButton(fr ? 'Ajouter des étudiants' : 'Add students', icon: Icons.person_add_alt_1, busy: _busy, onPressed: _addStudents),
      ],
      children: [
        Row(
          children: [
            Pill(BatchX.statusLabel(status, fr), color: BatchX.statusColor(status)),
            const SizedBox(width: 8),
            Text(BatchX.duration(_b, fr), style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          ],
        ),
        const SizedBox(height: 12),
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Expanded(child: _Fact(label: fr ? 'Début' : 'Start', value: AdminFmt.day(context, J.date(_b['start_date'])))),
                  Expanded(child: _Fact(label: fr ? 'Fin' : 'End', value: AdminFmt.day(context, J.date(_b['end_date'])))),
                  Expanded(child: _Fact(label: fr ? 'Étudiants' : 'Students', value: '${_loading ? BatchX.students(_b) : _students.length}')),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(value: status == 'upcoming' ? 0 : p, minHeight: 6, color: BatchX.statusColor(status), backgroundColor: AppColors.borderSoft),
              ),
              const SizedBox(height: 4),
              Text(fr ? '${(p * 100).round()} % de la période écoulée' : '${(p * 100).round()}% of the period elapsed', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
            ],
          ),
        ),
        const SizedBox(height: 10),
        AdminButton(
          fr ? 'Voir les résultats des quiz' : 'View quiz insights',
          icon: Icons.bar_chart,
          primary: false,
          onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => BatchInsightsScreen(batch: _b))),
        ),
        PanelSection(
          fr ? 'Cours hebdomadaires' : 'Weekly classes',
          trailing: TextButton.icon(onPressed: _busy ? null : () => _edit(step: 1), icon: const Icon(Icons.edit_calendar_outlined, size: 16), label: Text(fr ? 'Modifier' : 'Edit')),
        ),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: _loading
              ? const Padding(padding: EdgeInsets.all(12), child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_timetable.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        child: Text(fr ? 'Pas encore de cours réguliers.' : 'No regular classes yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
                      )
                    else ...[
                      for (final t in _timetable)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 7),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 44,
                                child: Text(BatchX.dayShort(J.i(t['day_of_week']), fr), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.adminAccent)),
                              ),
                              Text('${BatchX.hhmm(t['start_time'])} – ${BatchX.hhmm(t['end_time'])}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Row(
                                  children: [
                                    Icon(J.s(t['location_mode']) == 'physical' ? Icons.place_outlined : Icons.videocam_outlined, size: 15, color: AppColors.textSubtle),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        J.s(t['location_mode']) == 'physical' ? (J.s(t['location']).isEmpty ? (fr ? 'En présentiel' : 'In person') : J.s(t['location'])) : (fr ? 'En ligne' : 'Online'),
                                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      const Divider(height: 14, color: AppColors.borderSoft),
                      Text(
                        fr ? '${_timetable.length} cours par semaine · ${BatchX.hoursText(weekly)} · ${J.s(_b['timezone'])}' : '${_timetable.length} classes a week · ${BatchX.hoursText(weekly)} · ${J.s(_b['timezone'])}',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ],
                ),
        ),
        PanelSection(fr ? 'Lieu par défaut' : 'Default place'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Column(
            children: [
              InfoRow(
                icon: mode == 'physical' ? Icons.place_outlined : Icons.videocam_outlined,
                label: fr ? 'Les cours ont lieu' : 'Classes take place',
                value: mode == 'physical' ? (fr ? 'En présentiel' : 'In person') : (fr ? 'En ligne' : 'Online'),
              ),
              if (mode == 'physical') InfoRow(icon: Icons.meeting_room_outlined, label: fr ? 'Salle ou adresse' : 'Room or address', value: J.s(_b['default_location'])),
              if (mode != 'physical') InfoRow(icon: Icons.link, label: fr ? 'Lien de réunion' : 'Meeting link', value: J.s(_b['default_link'])),
            ],
          ),
        ),
        PanelSection(fr ? 'Étudiants (${_students.length})' : 'Students (${_students.length})'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
          child: _loading
              ? const Padding(padding: EdgeInsets.all(12), child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
              : _students.isEmpty
                  ? AdminEmpty(icon: Icons.group_add_outlined, title: fr ? 'Aucun étudiant' : 'No students yet', message: fr ? 'Ajoutez des étudiants à cette promotion.' : 'Add students to this batch.')
                  : Column(
                      children: [
                        for (final s in _students)
                          ListTile(
                            dense: true,
                            leading: InitialsAvatar(J.name(s).isEmpty ? J.s(s['email']) : J.name(s), size: 34),
                            title: Text(J.name(s).isEmpty ? J.s(s['username']) : J.name(s), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                            subtitle: Text(J.s(s['email']), style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                            trailing: IconButton(
                              tooltip: fr ? 'Retirer de la promotion' : 'Remove from batch',
                              icon: const Icon(Icons.person_remove_outlined, color: AppColors.bad, size: 20),
                              onPressed: _busy ? null : () => _remove(s),
                            ),
                          ),
                      ],
                    ),
        ),
        const SizedBox(height: 18),
        AdminButton(fr ? 'Supprimer la promotion' : 'Delete batch', icon: Icons.delete_outline, primary: false, danger: true, onPressed: _busy ? null : _delete),
      ],
    );
  }
}

class _Fact extends StatelessWidget {
  final String label;
  final String value;
  const _Fact({required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(value, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
        ],
      );
}

/// Picks students (search, multi-select). Pops the chosen ids.
class StudentPicker extends ConsumerStatefulWidget {
  final Set<int> exclude;
  final Set<int> initial;
  final String title;
  const StudentPicker({super.key, this.exclude = const {}, this.initial = const {}, required this.title});

  @override
  ConsumerState<StudentPicker> createState() => _StudentPickerState();
}

class _StudentPickerState extends ConsumerState<StudentPicker> {
  List<Map<String, dynamic>> _all = [];
  late final Set<int> _picked = {...widget.initial};
  String _q = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get('/users/role/students');
      if (!mounted) return;
      setState(() {
        _all = J.list(res.data, ['students', 'users']).where((s) => !widget.exclude.contains(J.i(s['id']))).toList()
          ..sort((a, b) => J.name(a).toLowerCase().compareTo(J.name(b).toLowerCase()));
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        adminToast(context, apiErrorText(context, e), error: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final q = _q.trim().toLowerCase();
    final list = _all.where((s) => q.isEmpty || '${J.name(s)} ${J.s(s['email'])}'.toLowerCase().contains(q)).toList();
    return AdminPanel(
      title: widget.title,
      subtitle: fr ? '${_picked.length} sélectionné${_picked.length > 1 ? 's' : ''}' : '${_picked.length} selected',
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: () => Navigator.of(context).pop()),
        AdminButton(fr ? 'Valider (${_picked.length})' : 'Confirm (${_picked.length})', icon: Icons.check, onPressed: () => Navigator.of(context).pop(_picked.toList())),
      ],
      children: [
        AdminSearchField(hint: fr ? 'Nom ou e-mail' : 'Name or email', onChanged: (v) => setState(() => _q = v)),
        const SizedBox(height: 10),
        if (_loading)
          const AdminLoading()
        else if (list.isEmpty)
          AdminEmpty(icon: Icons.person_search_outlined, title: fr ? 'Aucun étudiant disponible' : 'No students available')
        else
          for (final s in list)
            CheckboxListTile(
              value: _picked.contains(J.i(s['id'])),
              onChanged: (v) => setState(() => v == true ? _picked.add(J.i(s['id'])) : _picked.remove(J.i(s['id']))),
              activeColor: AppColors.adminAccent,
              controlAffinity: ListTileControlAffinity.trailing,
              contentPadding: const EdgeInsets.symmetric(horizontal: 4),
              secondary: InitialsAvatar(J.name(s).isEmpty ? J.s(s['email']) : J.name(s), size: 34),
              title: Text(J.name(s).isEmpty ? J.s(s['username']) : J.name(s), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
              subtitle: Text(J.s(s['email']), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            ),
      ],
    );
  }
}
