import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../batches/batch_utils.dart';
import '../common/admin_kit.dart';
import '../common/tz_convert.dart';

const _palette = [
  Color(0xFF4F46E5), Color(0xFF059669), Color(0xFFE11D48), Color(0xFFD97706), Color(0xFF0284C7),
  Color(0xFF7C3AED), Color(0xFF0D9488), Color(0xFFEA580C), Color(0xFFDB2777), Color(0xFF65A30D),
];

/// A weekly class, placed in the viewer's time zone.
class _Slot {
  final Map<String, dynamic> e;
  final int day;
  final int start;
  final int end;
  final String teacher;
  final Color color;
  final bool ended;
  final bool upcoming;
  final bool converted;
  int lane = 0;
  int lanes = 1;

  _Slot(this.e, this.day, this.start, this.end, this.teacher, this.color, this.ended, this.upcoming, this.converted);

  int get id => J.i(e['id']);
  int get teacherId => J.i(e['teacher_id']);
  int get batchId => J.i(e['batch_id']);
  String get batch => J.s(e['batch_name']);
  String get level => J.s(e['french_level']);
  bool get physical => J.s(e['location_mode']) == 'physical';
}

/// Every teacher's recurring week: an agenda on phones, a week grid on
/// tablets, and each teacher's load, with overlapping classes flagged.
class TimetableScreen extends ConsumerStatefulWidget {
  const TimetableScreen({super.key});

  @override
  ConsumerState<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends ConsumerState<TimetableScreen> {
  List<Map<String, dynamic>> _entries = [];
  List<Map<String, dynamic>> _batches = [];
  bool _loading = true;
  String? _error;
  String? _view;
  int _day = DateTime.now().weekday % 7;
  final Set<int> _teachers = {};
  String? _level;
  String _mode = 'all';
  bool _showEnded = false;
  String _q = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _entries.isEmpty;
      _error = null;
    });
    final api = ref.read(apiClientProvider);
    try {
      final r = await Future.wait([api.get('/batches/timetable'), api.get('/batches')]);
      if (!mounted) return;
      setState(() {
        _entries = J.list(r[0].data, ['timetable']);
        _batches = J.list(r[1].data, ['batches']);
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

  String? get _viewTz => ref.read(authNotifierProvider).user?.timezone;

  List<_Slot> _slots() {
    final names = <int, String>{};
    for (final e in _entries) {
      names[J.i(e['teacher_id'])] = J.name(e, first: 'teacher_first_name', last: 'teacher_last_name');
    }
    final order = names.keys.toList()..sort((a, b) => names[a]!.compareTo(names[b]!));
    final colors = {for (var i = 0; i < order.length; i++) order[i]: _palette[i % _palette.length]};
    final now = DateTime.now();
    final view = _viewTz;
    return _entries.map((e) {
      final startMin = BatchX.minutes(J.s(e['start_time']));
      var dur = BatchX.minutes(J.s(e['end_time'])) - startMin;
      if (dur <= 0) dur += 1440;
      final src = J.s(e['timezone']).isEmpty ? view : J.s(e['timezone']);
      final c = TzConvert.slot(J.i(e['day_of_week']), startMin, src, view);
      final endDate = J.date(e['end_date']);
      final startDate = J.date(e['start_date']);
      return _Slot(
        e,
        c.$1,
        c.$2,
        c.$2 + dur,
        names[J.i(e['teacher_id'])]!.isEmpty ? 'Teacher' : names[J.i(e['teacher_id'])]!,
        colors[J.i(e['teacher_id'])] ?? _palette.first,
        endDate != null && endDate.isBefore(now),
        startDate != null && startDate.isAfter(now),
        src != null && view != null && src != view,
      );
    }).toList();
  }

  List<_Slot> _filter(List<_Slot> all) {
    final q = _q.trim().toLowerCase();
    return all.where((s) {
      if (!_showEnded && s.ended) return false;
      if (_teachers.isNotEmpty && !_teachers.contains(s.teacherId)) return false;
      if (_level != null && s.level.toUpperCase() != _level) return false;
      if (_mode == 'online' && s.physical) return false;
      if (_mode == 'physical' && !s.physical) return false;
      return q.isEmpty || '${s.batch} ${s.teacher}'.toLowerCase().contains(q);
    }).toList();
  }

  static List<_Slot> _layoutDay(List<_Slot> list) {
    final sorted = [...list]..sort((a, b) => a.start != b.start ? a.start.compareTo(b.start) : b.end.compareTo(a.end));
    var cluster = <_Slot>[];
    var clusterEnd = -1;
    void flush() {
      final lanesEnd = <int>[];
      for (final s in cluster) {
        var lane = lanesEnd.indexWhere((e) => e <= s.start);
        if (lane == -1) {
          lane = lanesEnd.length;
          lanesEnd.add(s.end);
        } else {
          lanesEnd[lane] = s.end;
        }
        s.lane = lane;
      }
      for (final s in cluster) {
        s.lanes = lanesEnd.length;
      }
      cluster = [];
    }

    for (final s in sorted) {
      if (cluster.isNotEmpty && s.start >= clusterEnd) flush();
      cluster.add(s);
      clusterEnd = math.max(clusterEnd, s.end);
    }
    if (cluster.isNotEmpty) flush();
    return sorted;
  }

  String _time(int m) {
    final mm = ((m % 1440) + 1440) % 1440;
    final t = TimeOfDay(hour: mm ~/ 60, minute: mm % 60);
    return MaterialLocalizations.of(context).formatTimeOfDay(t, alwaysUse24HourFormat: context.isFrench);
  }

  void _openSlot(_Slot s, Set<int> conflicts) {
    showAdminPanel(context, builder: (_) => _SlotPanel(slot: s, conflict: conflicts.contains(s.id), time: _time, viewTz: _viewTz));
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _entries.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final all = _slots();
    final filtered = _filter(all);
    final byDay = {for (final d in BatchX.week) d: _layoutDay(filtered.where((s) => s.day == d).toList())};

    final conflicts = <(_Slot, _Slot)>[];
    for (final d in BatchX.week) {
      final list = byDay[d]!;
      for (var i = 0; i < list.length; i++) {
        for (var j = i + 1; j < list.length; j++) {
          final a = list[i], b = list[j];
          if (a.teacherId == b.teacherId && a.start < b.end && b.start < a.end) conflicts.add((a, b));
        }
      }
    }
    final conflictIds = {for (final c in conflicts) ...[c.$1.id, c.$2.id]};
    final withSlots = _entries.map((e) => J.i(e['batch_id'])).toSet();
    final unscheduled = _batches.where((b) => BatchX.status(b) != 'ended' && !withSlots.contains(J.i(b['id']))).toList();

    final minutes = filtered.fold<int>(0, (t, s) => t + s.end - s.start);
    final batchIds = filtered.map((s) => s.batchId).toSet();
    final onlineBatches = filtered.where((s) => !s.physical).map((s) => s.batchId).toSet().length;
    final perDay = [for (final d in BatchX.week) (d, byDay[d]!.fold<int>(0, (t, s) => t + s.end - s.start), byDay[d]!.length)];
    final busiest = [...perDay]..sort((a, b) => b.$2.compareTo(a.$2));

    final teachers = <int, String>{for (final s in all) s.teacherId: s.teacher};
    final wide = MediaQuery.sizeOf(context).width >= 900;
    final view = _view ?? (wide ? 'week' : 'agenda');

    return AdminPage(
      onRefresh: _load,
      maxWidth: 1400,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(child: AdminSearchField(hint: fr ? 'Promotion ou professeur' : 'Batch or teacher', onChanged: (v) => setState(() => _q = v))),
              const SizedBox(width: 10),
              SegmentedButton<String>(
                segments: [
                  ButtonSegment(value: 'agenda', icon: const Icon(Icons.view_agenda_outlined, size: 18), tooltip: fr ? 'Agenda' : 'Agenda'),
                  ButtonSegment(value: 'week', icon: const Icon(Icons.calendar_view_week, size: 18), tooltip: fr ? 'Semaine' : 'Week'),
                  ButtonSegment(value: 'teachers', icon: const Icon(Icons.people_outline, size: 18), tooltip: fr ? 'Professeurs' : 'Teachers'),
                ],
                selected: {view},
                showSelectedIcon: false,
                onSelectionChanged: (v) => setState(() => _view = v.first),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final t in teachers.entries)
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: FilterChip(
                      avatar: CircleAvatar(backgroundColor: all.firstWhere((s) => s.teacherId == t.key).color, radius: 5),
                      label: Text(t.value),
                      selected: _teachers.contains(t.key),
                      onSelected: (on) => setState(() => on ? _teachers.add(t.key) : _teachers.remove(t.key)),
                      showCheckmark: false,
                      selectedColor: AppColors.adminAccentBg,
                      side: BorderSide(color: _teachers.contains(t.key) ? AppColors.adminAccent : AppColors.border),
                      labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: AdminFilterChips<String>(
                  options: [
                    FilterOption('all', fr ? 'Tous les lieux' : 'Any place'),
                    FilterOption('online', fr ? 'En ligne' : 'Online'),
                    FilterOption('physical', fr ? 'Présentiel' : 'In person'),
                  ],
                  selected: _mode,
                  onSelected: (v) => setState(() => _mode = v),
                ),
              ),
              PopupMenuButton<String?>(
                tooltip: fr ? 'Niveau' : 'Level',
                onSelected: (v) => setState(() => _level = v == 'ALL' ? null : v),
                itemBuilder: (_) => [
                  PopupMenuItem(value: 'ALL', child: Text(fr ? 'Tous niveaux' : 'All levels')),
                  for (final l in BatchX.levels) PopupMenuItem(value: l, child: Text(l)),
                ],
                child: Chip(label: Text(_level ?? (fr ? 'Niveau' : 'Level')), visualDensity: VisualDensity.compact, backgroundColor: _level == null ? AppColors.pureWhite : AppColors.adminAccentBg),
              ),
              const SizedBox(width: 6),
              FilterChip(
                label: Text(fr ? 'Terminées' : 'Ended'),
                selected: _showEnded,
                onSelected: (v) => setState(() => _showEnded = v),
                visualDensity: VisualDensity.compact,
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
            StatTile(label: fr ? 'Cours par semaine' : 'Classes a week', value: '${filtered.length}', icon: Icons.event_repeat, color: const Color(0xFF4F46E5)),
            StatTile(label: fr ? "Temps d'enseignement" : 'Teaching time', value: BatchX.hoursText(minutes), icon: Icons.schedule, color: AppColors.good),
            StatTile(
              label: fr ? 'Promotions' : 'Batches',
              value: '${batchIds.length}',
              sub: fr ? '$onlineBatches en ligne · ${batchIds.length - onlineBatches} présentiel' : '$onlineBatches online · ${batchIds.length - onlineBatches} in person',
              icon: Icons.groups_outlined,
              color: const Color(0xFF0284C7),
            ),
            StatTile(
              label: fr ? 'Jour le plus chargé' : 'Busiest day',
              value: busiest.isEmpty || busiest.first.$2 == 0 ? '—' : BatchX.dayLong(busiest.first.$1, fr),
              sub: busiest.isEmpty || busiest.first.$2 == 0 ? null : '${busiest.first.$3} · ${BatchX.hoursText(busiest.first.$2)}',
              icon: Icons.bar_chart,
              color: AppColors.warn,
            ),
          ],
        ),
        if (conflicts.isNotEmpty || unscheduled.isNotEmpty) ...[
          const SizedBox(height: 12),
          if (conflicts.isNotEmpty)
            _Banner(
              color: AppColors.bad,
              icon: Icons.warning_amber_rounded,
              title: fr ? '${conflicts.length} cours se chevauchent' : '${conflicts.length} overlapping class${conflicts.length > 1 ? 'es' : ''}',
              text: conflicts.take(2).map((c) => '${c.$1.teacher} · ${BatchX.dayLong(c.$1.day, fr)} ${_time(math.max(c.$1.start, c.$2.start))}').join(' · '),
              action: TextButton(onPressed: () => _openSlot(conflicts.first.$1, conflictIds), child: Text(fr ? 'Voir' : 'Review')),
            ),
          if (unscheduled.isNotEmpty) ...[
            const SizedBox(height: 8),
            _Banner(
              color: AppColors.warn,
              icon: Icons.event_busy_outlined,
              title: fr ? '${unscheduled.length} promotion${unscheduled.length > 1 ? 's' : ''} sans horaire' : '${unscheduled.length} active batch${unscheduled.length > 1 ? 'es' : ''} without a timetable',
              text: unscheduled.take(3).map((b) => J.s(b['name'])).join(', '),
            ),
          ],
        ],
        if (_viewTz != null && filtered.any((s) => s.converted))
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Text(
              fr ? 'Horaires affichés dans votre fuseau : ${_viewTz!.replaceAll('_', ' ')}' : 'Times shown in your timezone: ${_viewTz!.replaceAll('_', ' ')}',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ),
        const SizedBox(height: 14),
        if (filtered.isEmpty)
          AdminCard(child: AdminEmpty(icon: Icons.calendar_month_outlined, title: fr ? 'Aucun cours' : 'No classes', message: fr ? 'Aucun cours régulier ne correspond.' : 'No recurring class matches these filters.'))
        else if (view == 'agenda')
          _agenda(byDay, conflictIds, fr)
        else if (view == 'week')
          _WeekGrid(byDay: byDay, conflicts: conflictIds, time: _time, onTap: (s) => _openSlot(s, conflictIds))
        else
          _teacherLoad(filtered, conflicts, fr),
      ],
    );
  }

  Widget _agenda(Map<int, List<_Slot>> byDay, Set<int> conflicts, bool fr) {
    final today = DateTime.now().weekday % 7;
    final list = byDay[_day]!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              for (final d in BatchX.week)
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () => setState(() => _day = d),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 58,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: _day == d ? AppColors.adminAccent : AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _day == d ? AppColors.adminAccent : (d == today ? AppColors.adminAccentLine : AppColors.border)),
                      ),
                      child: Column(
                        children: [
                          Text(BatchX.dayShort(d, fr), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: _day == d ? AppColors.pureWhite : AppColors.ink)),
                          const SizedBox(height: 2),
                          Text('${byDay[d]!.length}', style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: _day == d ? AppColors.pureWhite : AppColors.adminAccent)),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (list.isEmpty)
          AdminCard(child: AdminEmpty(icon: Icons.free_breakfast_outlined, title: fr ? 'Pas de cours ce jour-là' : 'No classes that day'))
        else
          for (final s in list)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: _SlotTile(slot: s, conflict: conflicts.contains(s.id), time: _time, onTap: () => _openSlot(s, conflicts)),
            ),
      ],
    );
  }

  Widget _teacherLoad(List<_Slot> filtered, List<(_Slot, _Slot)> conflicts, bool fr) {
    final ids = filtered.map((s) => s.teacherId).toSet().toList();
    final rows = ids.map((id) {
      final list = filtered.where((s) => s.teacherId == id).toList();
      return (
        list.first,
        list.length,
        list.fold<int>(0, (m, s) => m + s.end - s.start),
        list.map((s) => s.batchId).toSet().length,
        [for (final d in BatchX.week) list.where((s) => s.day == d).fold<int>(0, (m, s) => m + s.end - s.start)],
        conflicts.where((c) => c.$1.teacherId == id).length,
      );
    }).toList()
      ..sort((a, b) => b.$3.compareTo(a.$3));
    final maxDay = math.max(1, rows.expand((r) => r.$5).fold<int>(0, math.max));
    return AdminGrid(
      minTileWidth: 320,
      maxColumns: 3,
      children: [
        for (final r in rows)
          AdminCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    InitialsAvatar(r.$1.teacher, color: r.$1.color, size: 36),
                    const SizedBox(width: 10),
                    Expanded(child: Text(r.$1.teacher, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800))),
                    if (r.$6 > 0) Pill(fr ? '${r.$6} conflit${r.$6 > 1 ? 's' : ''}' : '${r.$6} overlap${r.$6 > 1 ? 's' : ''}', color: AppColors.bad, icon: Icons.warning_amber_rounded),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  fr ? '${BatchX.hoursText(r.$3)} · ${r.$2} cours · ${r.$4} promotion${r.$4 > 1 ? 's' : ''}' : '${BatchX.hoursText(r.$3)} · ${r.$2} classes · ${r.$4} batch${r.$4 > 1 ? 'es' : ''}',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 64,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      for (var i = 0; i < 7; i++)
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 3),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                Container(
                                  height: 44 * r.$5[i] / maxDay,
                                  decoration: BoxDecoration(color: r.$1.color.withValues(alpha: 0.75), borderRadius: BorderRadius.circular(3)),
                                ),
                                const SizedBox(height: 4),
                                Text(BatchX.dayShort(BatchX.week[i], fr).substring(0, 1), style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted)),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _Banner extends StatelessWidget {
  final Color color;
  final IconData icon;
  final String title;
  final String text;
  final Widget? action;
  const _Banner({required this.color, required this.icon, required this.title, required this.text, this.action});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: color.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withValues(alpha: 0.3))),
        child: Row(
          children: [
            Icon(icon, color: color),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                  if (text.isNotEmpty) Text(text, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            ?action,
          ],
        ),
      );
}

class _SlotTile extends StatelessWidget {
  final _Slot slot;
  final bool conflict;
  final String Function(int) time;
  final VoidCallback onTap;
  const _SlotTile({required this.slot, required this.conflict, required this.time, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: conflict ? AppColors.badBorder : AppColors.border),
          ),
          child: Row(
            children: [
              SizedBox(
                width: 70,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(time(slot.start), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
                    Text(BatchX.hoursText(slot.end - slot.start), style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
                  ],
                ),
              ),
              Container(width: 4, height: 40, decoration: BoxDecoration(color: slot.color, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Pill.level(slot.level),
                        const SizedBox(width: 6),
                        Expanded(child: Text(slot.batch, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${slot.teacher} · ${slot.physical ? (fr ? 'Présentiel' : 'In person') : (fr ? 'En ligne' : 'Online')}${slot.ended ? (fr ? ' · terminée' : ' · ended') : slot.upcoming ? (fr ? ' · à venir' : ' · upcoming') : ''}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (conflict) const Icon(Icons.warning_amber_rounded, color: AppColors.bad, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

/// Seven columns of the week, classes placed at their hour, overlapping
/// classes side by side.
class _WeekGrid extends StatelessWidget {
  final Map<int, List<_Slot>> byDay;
  final Set<int> conflicts;
  final String Function(int) time;
  final ValueChanged<_Slot> onTap;
  const _WeekGrid({required this.byDay, required this.conflicts, required this.time, required this.onTap});

  static const _hourHeight = 52.0;

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final all = byDay.values.expand((l) => l).toList();
    var lo = all.isEmpty ? 8 : all.map((s) => s.start ~/ 60).reduce(math.min);
    var hi = all.isEmpty ? 18 : all.map((s) => ((s.end + 59) ~/ 60)).reduce(math.max);
    lo = math.max(0, lo - 1);
    hi = math.min(24, math.max(hi, lo + 4));
    final height = (hi - lo) * _hourHeight;
    final today = DateTime.now().weekday % 7;

    return AdminCard(
      padding: const EdgeInsets.fromLTRB(4, 8, 8, 8),
      child: LayoutBuilder(builder: (context, c) {
        final colW = math.max(110.0, (c.maxWidth - 48) / 7);
        final grid = SizedBox(
          width: 48 + colW * 7,
          child: Column(
            children: [
              Row(
                children: [
                  const SizedBox(width: 48),
                  for (final d in BatchX.week)
                    SizedBox(
                      width: colW,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          '${BatchX.dayShort(d, fr)} · ${byDay[d]!.length}',
                          textAlign: TextAlign.center,
                          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: d == today ? AppColors.adminAccent : AppColors.ink),
                        ),
                      ),
                    ),
                ],
              ),
              SizedBox(
                height: height,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      width: 48,
                      child: Stack(
                        children: [
                          for (var h = lo; h < hi; h++)
                            Positioned(
                              top: (h - lo) * _hourHeight - 6,
                              right: 6,
                              child: Text(time(h * 60), style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textSubtle)),
                            ),
                        ],
                      ),
                    ),
                    for (final d in BatchX.week)
                      Container(
                        width: colW,
                        height: height,
                        decoration: BoxDecoration(
                          color: d == today ? AppColors.adminAccentBg.withValues(alpha: 0.4) : null,
                          border: const Border(left: BorderSide(color: AppColors.borderSoft)),
                        ),
                        child: Stack(
                          children: [
                            for (var h = lo; h < hi; h++)
                              Positioned(top: (h - lo) * _hourHeight, left: 0, right: 0, child: const Divider(height: 1, color: AppColors.borderSoft)),
                            for (final s in byDay[d]!)
                              Positioned(
                                top: (s.start / 60 - lo) * _hourHeight + 1,
                                height: math.max(22, (s.end - s.start) / 60 * _hourHeight - 2),
                                left: 2 + (colW - 4) * s.lane / s.lanes,
                                width: (colW - 4) / s.lanes - 2,
                                child: _Block(slot: s, conflict: conflicts.contains(s.id), time: time, onTap: () => onTap(s)),
                              ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
        return SingleChildScrollView(scrollDirection: Axis.horizontal, child: grid);
      }),
    );
  }
}

class _Block extends StatelessWidget {
  final _Slot slot;
  final bool conflict;
  final String Function(int) time;
  final VoidCallback onTap;
  const _Block({required this.slot, required this.conflict, required this.time, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: slot.color.withValues(alpha: slot.ended ? 0.06 : 0.12),
      borderRadius: BorderRadius.circular(6),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
            border: Border(left: BorderSide(color: conflict ? AppColors.bad : slot.color, width: 3)),
          ),
          child: ClipRect(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(slot.batch, style: AppTypography.caption.copyWith(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text('${time(slot.start)} · ${slot.teacher.split(' ').first}', style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// A class of the timetable: when (here and in the batch time zone), where,
/// who, and the students of its batch.
class _SlotPanel extends ConsumerStatefulWidget {
  final _Slot slot;
  final bool conflict;
  final String Function(int) time;
  final String? viewTz;
  const _SlotPanel({required this.slot, required this.conflict, required this.time, required this.viewTz});

  @override
  ConsumerState<_SlotPanel> createState() => _SlotPanelState();
}

class _SlotPanelState extends ConsumerState<_SlotPanel> {
  List<Map<String, dynamic>>? _students;

  @override
  void initState() {
    super.initState();
    ref.read(apiClientProvider).get('/batches/${widget.slot.batchId}').then((res) {
      if (mounted) setState(() => _students = J.list(J.map(res.data)['students']));
    }).catchError((_) {
      if (mounted) setState(() => _students = const []);
    });
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final s = widget.slot;
    final e = s.e;
    final link = J.s(e['link']);
    return AdminPanel(
      title: s.batch,
      subtitle: '${BatchX.dayLong(s.day, fr)} · ${widget.time(s.start)} – ${widget.time(s.end)}',
      leading: Pill.level(s.level),
      children: [
        if (widget.conflict)
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppColors.badBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.badBorder)),
            child: Text(
              fr ? 'Ce cours chevauche un autre cours du même professeur.' : 'This class overlaps another class of the same teacher.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.bad, fontWeight: FontWeight.w600),
            ),
          ),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Column(
            children: [
              InfoRow(icon: Icons.person_outline, label: fr ? 'Professeur' : 'Teacher', value: s.teacher),
              InfoRow(icon: Icons.schedule, label: fr ? 'Durée' : 'Length', value: BatchX.hoursText(s.end - s.start)),
              if (s.converted)
                InfoRow(
                  icon: Icons.public,
                  label: fr ? 'Heure de la promotion' : 'Batch time',
                  value: '${BatchX.dayLong(J.i(e['day_of_week']), fr)} ${BatchX.hhmm(e['start_time'])} – ${BatchX.hhmm(e['end_time'])} (${J.s(e['timezone']).replaceAll('_', ' ')})',
                ),
              InfoRow(
                icon: s.physical ? Icons.place_outlined : Icons.videocam_outlined,
                label: fr ? 'Lieu' : 'Place',
                value: s.physical ? (J.s(e['location']).isEmpty ? (fr ? 'En présentiel' : 'In person') : J.s(e['location'])) : (fr ? 'En ligne' : 'Online'),
              ),
              if (link.isNotEmpty)
                InfoRow(
                  icon: Icons.link,
                  label: fr ? 'Lien' : 'Link',
                  value: link,
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.copy, size: 18),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: link));
                          adminToast(context, fr ? 'Lien copié' : 'Link copied');
                        },
                      ),
                      IconButton(icon: const Icon(Icons.open_in_new, size: 18), onPressed: () => launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication)),
                    ],
                  ),
                ),
              InfoRow(icon: Icons.date_range_outlined, label: fr ? 'Période' : 'Period', value: '${AdminFmt.day(context, J.date(e['start_date']))} → ${AdminFmt.day(context, J.date(e['end_date']))}'),
            ],
          ),
        ),
        PanelSection(fr ? 'Étudiants' : 'Students'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
          child: _students == null
              ? const Padding(padding: EdgeInsets.all(12), child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
              : _students!.isEmpty
                  ? Padding(padding: const EdgeInsets.all(12), child: Text(fr ? 'Aucun étudiant.' : 'No students.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)))
                  : Column(
                      children: [
                        for (final st in _students!)
                          ListTile(
                            dense: true,
                            leading: InitialsAvatar(J.name(st), size: 30),
                            title: Text(J.name(st), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                            subtitle: Text(J.s(st['email']), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                          ),
                      ],
                    ),
        ),
      ],
    );
  }
}
