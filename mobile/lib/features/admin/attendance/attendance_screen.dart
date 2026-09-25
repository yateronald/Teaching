import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../batches/batch_utils.dart';
import '../common/admin_kit.dart';
import 'attendance_panels.dart';

/// Attendance of in-person classes (code check-in) and live online classes
/// (joining counts), for a chosen period: overview, trend, weekdays, the
/// batches and students to watch, and the detail of every session.
class AttendanceScreen extends ConsumerStatefulWidget {
  const AttendanceScreen({super.key});

  @override
  ConsumerState<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _Agg {
  int sessions = 0, enrolled = 0, attended = 0, present = 0, late = 0, absent = 0;
  void add(Map<String, dynamic> s) {
    sessions++;
    enrolled += J.i(s['total_students']);
    attended += Att.attended(s);
    present += J.i(s['present_count']);
    late += J.i(s['late_count']);
    absent += J.i(s['absent_count']);
  }

  double? get rate => enrolled == 0 ? null : attended * 100 / enrolled;
}

class _AttendanceScreenState extends ConsumerState<AttendanceScreen> {
  String _period = '30d';
  DateTimeRange? _range;
  String _kind = 'all';
  int? _batch;
  int? _teacher;
  String _tab = 'sessions';
  String _q = '';
  bool _rankLow = true;

  List<Map<String, dynamic>> _sessions = [];
  List<Map<String, dynamic>> _students = [];
  List<Map<String, dynamic>>? _prev;
  List<Map<String, dynamic>> _batchOpts = [];
  List<Map<String, dynamic>> _teacherOpts = [];
  bool _loading = true;
  String? _error;
  int _req = 0;

  @override
  void initState() {
    super.initState();
    _loadOptions();
    _load();
  }

  (DateTime, DateTime, DateTime, DateTime)? get _window {
    final today = DateTime.now();
    final end = DateTime(today.year, today.month, today.day);
    if (_period == 'custom' && _range != null) {
      final days = _range!.end.difference(_range!.start).inDays + 1;
      return (_range!.start, _range!.end, _range!.start.subtract(Duration(days: days)), _range!.start.subtract(const Duration(days: 1)));
    }
    const days = {'7d': 7, '30d': 30, '90d': 90};
    final n = days[_period];
    if (n == null) return null;
    final from = end.subtract(Duration(days: n - 1));
    return (from, end, from.subtract(Duration(days: n)), from.subtract(const Duration(days: 1)));
  }

  String _d(DateTime d) => DateFormat('yyyy-MM-dd').format(d);

  Future<void> _loadOptions() async {
    final api = ref.read(apiClientProvider);
    try {
      final r = await Future.wait([
        api.get('/batches'),
        api.get('/users', queryParameters: {'role': 'teacher'}),
      ]);
      if (!mounted) return;
      setState(() {
        _batchOpts = J.list(r[0].data, ['batches']);
        _teacherOpts = J.list(r[1].data, ['users']);
      });
    } catch (_) {
      /* the filters stay empty */
    }
  }

  Future<void> _load() async {
    final id = ++_req;
    setState(() {
      _loading = _sessions.isEmpty && _students.isEmpty;
      _error = null;
    });
    final base = <String, dynamic>{if (_batch != null) 'batch_id': _batch, if (_teacher != null) 'teacher_id': _teacher, if (_kind != 'all') 'kind': _kind};
    final w = _window;
    final cur = {...base, if (w != null) 'date_from': _d(w.$1), if (w != null) 'date_to': _d(w.$2)};
    final prev = {...base, if (w != null) 'date_from': _d(w.$3), if (w != null) 'date_to': _d(w.$4)};
    final api = ref.read(apiClientProvider);
    try {
      final r = await Future.wait<dynamic>([
        api.get('/attendance/reports/sessions', queryParameters: cur),
        api.get('/attendance/reports/students', queryParameters: cur).then<dynamic>((v) => v).catchError((_) => null),
        if (w != null) api.get('/attendance/reports/sessions', queryParameters: prev).then<dynamic>((v) => v).catchError((_) => null),
      ]);
      if (!mounted || id != _req) return;
      setState(() {
        _sessions = J.list(r[0].data, ['sessions']);
        _students = r[1] == null ? [] : J.list(r[1].data, ['students']);
        _prev = w != null && r.length > 2 && r[2] != null ? J.list(r[2].data, ['sessions']) : null;
        _loading = false;
      });
    } catch (e) {
      if (!mounted || id != _req) return;
      setState(() {
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  void _set(VoidCallback f) {
    setState(f);
    _load();
  }

  Future<void> _pickRange() async {
    final now = DateTime.now();
    final r = await showDateRangePicker(context: context, firstDate: DateTime(now.year - 5), lastDate: now, initialDateRange: _range);
    if (r != null) {
      _set(() {
        _range = r;
        _period = 'custom';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _sessions.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final settled = _sessions.where((s) => s['is_live'] != true).toList();
    final liveNow = _sessions.length - settled.length;
    final total = _Agg();
    for (final s in settled) {
      total.add(s);
    }
    _Agg? prevTotal;
    if (_prev != null) {
      prevTotal = _Agg();
      for (final s in _prev!.where((s) => s['is_live'] != true)) {
        prevTotal.add(s);
      }
    }
    final delta = total.rate != null && prevTotal?.rate != null ? (total.rate! - prevTotal!.rate!).round() : null;
    final silent = settled.where((s) => J.i(s['total_students']) > 0 && Att.attended(s) == 0).length;
    final online = settled.where((s) => Att.kind(s) == 'meeting').length;

    // Per weekday, per batch, per teacher.
    final weekdays = {for (final d in BatchX.week) d: _Agg()};
    final batches = <String, (Map<String, dynamic>, _Agg, DateTime?)>{};
    final teachers = <String, (Map<String, dynamic>, _Agg, Set<String>, int)>{};
    for (final s in settled) {
      final start = Att.start(s);
      if (start != null) weekdays[start.weekday % 7]!.add(s);
      final bk = s['batch_id'] != null ? 'id${s['batch_id']}' : 'n${s['batch_name']}';
      final b = batches[bk] ?? (s, _Agg(), start);
      b.$2.add(s);
      batches[bk] = (b.$1, b.$2, start != null && (b.$3 == null || start.isAfter(b.$3!)) ? start : b.$3);
      final tk = s['teacher_id'] != null ? 'id${s['teacher_id']}' : 'n${s['teacher_name']}';
      final t = teachers[tk] ?? (s, _Agg(), <String>{}, 0);
      t.$2.add(s);
      t.$3.add(J.s(s['batch_name']));
      teachers[tk] = (t.$1, t.$2, t.$3, t.$4 + (J.i(s['total_students']) > 0 && Att.attended(s) == 0 ? 1 : 0));
    }
    final enrolledPerBatch = <int, int>{};
    for (final st in _students) {
      enrolledPerBatch[J.i(st['batch_id'])] = (enrolledPerBatch[J.i(st['batch_id'])] ?? 0) + 1;
    }
    final ranked = batches.values.where((b) => b.$2.rate != null).toList()..sort((a, b) => _rankLow ? a.$2.rate!.compareTo(b.$2.rate!) : b.$2.rate!.compareTo(a.$2.rate!));
    final atRisk = _students.where((s) => J.i(s['total_sessions']) >= 3 && J.n(s['attendance_rate']) < Att.risk).toList()
      ..sort((a, b) => J.n(a['attendance_rate']).compareTo(J.n(b['attendance_rate'])));
    final wd = weekdays.entries.where((e) => e.value.sessions >= 2 && e.value.rate != null).toList();
    final best = wd.isEmpty ? null : wd.reduce((a, b) => a.value.rate! >= b.value.rate! ? a : b);
    final worst = wd.length < 2 ? null : wd.reduce((a, b) => a.value.rate! <= b.value.rate! ? a : b);

    final q = _q.trim().toLowerCase();
    final w = _window;

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                for (final p in const ['7d', '30d', '90d', 'all'])
                  Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(p == 'all' ? (fr ? 'Tout' : 'All time') : (fr ? '${p.replaceAll('d', '')} jours' : '${p.replaceAll('d', '')} days')),
                      selected: _period == p,
                      showCheckmark: false,
                      selectedColor: AppColors.adminAccent,
                      labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: _period == p ? AppColors.pureWhite : AppColors.text),
                      onSelected: (_) => _set(() {
                        _period = p;
                        _range = null;
                      }),
                    ),
                  ),
                ActionChip(
                  avatar: const Icon(Icons.date_range, size: 16),
                  label: Text(_period == 'custom' && _range != null ? '${AdminFmt.dayShort(context, _range!.start)} – ${AdminFmt.dayShort(context, _range!.end)}' : (fr ? 'Période' : 'Custom')),
                  onPressed: _pickRange,
                  backgroundColor: _period == 'custom' ? AppColors.adminAccentBg : AppColors.pureWhite,
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          // Small phones: the batch and teacher pickers get their own line.
          Builder(
            builder: (context) {
              final kinds = AdminFilterChips<String>(
                options: [FilterOption('all', fr ? 'Toutes les séances' : 'All sessions'), FilterOption('class', fr ? 'Présentiel' : 'In person'), FilterOption('meeting', fr ? 'En ligne' : 'Online')],
                selected: _kind,
                onSelected: (v) => _set(() => _kind = v),
              );
              final pickers = Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _PickChip(
                    icon: Icons.groups_outlined,
                    label: _batch == null ? (fr ? 'Promotion' : 'Batch') : J.s(_batchOpts.firstWhere((b) => J.i(b['id']) == _batch, orElse: () => const {})['name']),
                    active: _batch != null,
                    items: [(null, fr ? 'Toutes les promotions' : 'All batches'), for (final b in _batchOpts) (J.i(b['id']), J.s(b['name']))],
                    onSelected: (v) => _set(() => _batch = v),
                  ),
                  const SizedBox(width: 6),
                  _PickChip(
                    icon: Icons.person_outline,
                    label: _teacher == null ? (fr ? 'Professeur' : 'Teacher') : J.name(_teacherOpts.firstWhere((t) => J.i(t['id']) == _teacher, orElse: () => const {})),
                    active: _teacher != null,
                    items: [(null, fr ? 'Tous les professeurs' : 'All teachers'), for (final t in _teacherOpts) (J.i(t['id']), J.name(t))],
                    onSelected: (v) => _set(() => _teacher = v),
                  ),
                ],
              );
              if (MediaQuery.sizeOf(context).width < 560) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    kinds,
                    const SizedBox(height: 6),
                    SingleChildScrollView(scrollDirection: Axis.horizontal, child: pickers),
                  ],
                );
              }
              return Row(
                children: [
                  Expanded(child: kinds),
                  pickers,
                ],
              );
            },
          ),
        ],
      ),
      children: [
        Text(
          w == null ? (fr ? 'Toutes les séances enregistrées' : 'All recorded sessions') : '${AdminFmt.day(context, w.$1)} – ${AdminFmt.day(context, w.$2)}',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 10),
        AdminGrid(
          minTileWidth: 160,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(
              label: fr ? 'Taux de présence' : 'Attendance rate',
              value: AdminFmt.percent(total.rate),
              sub: delta == null ? (fr ? 'Objectif ${Att.target} %' : 'Target ${Att.target}%') : '${delta >= 0 ? '▲' : '▼'} ${delta.abs()} pts ${fr ? 'vs période précédente' : 'vs previous period'}',
              icon: Icons.fact_check_outlined,
              color: Att.tone(total.rate),
            ),
            StatTile(
              label: fr ? 'Séances' : 'Sessions',
              value: '${settled.length}',
              sub: fr ? '$online en ligne${liveNow > 0 ? ' · $liveNow en direct' : ''}' : '$online online${liveNow > 0 ? ' · $liveNow live now' : ''}',
              icon: Icons.event_note_outlined,
              color: const Color(0xFF4F46E5),
            ),
            StatTile(
              label: fr ? 'Présences' : 'Check-ins',
              value: AdminFmt.number(context, total.attended),
              sub: fr ? '${total.present} à l’heure · ${total.late} en retard' : '${total.present} on time · ${total.late} late',
              icon: Icons.how_to_reg_outlined,
              color: AppColors.good,
            ),
            StatTile(
              label: fr ? 'Absences' : 'Absences',
              value: AdminFmt.number(context, total.absent),
              sub: silent > 0 ? (fr ? '$silent séance${silent > 1 ? 's' : ''} sans aucune présence' : '$silent session${silent > 1 ? 's' : ''} with no check-in') : null,
              icon: Icons.person_off_outlined,
              color: total.absent > 0 ? AppColors.bad : AppColors.textMuted,
            ),
          ],
        ),
        const SizedBox(height: 14),
        if (settled.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.event_busy_outlined,
              title: fr ? 'Aucune séance sur cette période' : 'No sessions in this period',
              message: fr ? 'Essayez une période plus longue.' : 'Try a longer period.',
            ),
          )
        else ...[
          AdminGrid(
            minTileWidth: 340,
            maxColumns: 2,
            children: [
              AdminCard(
                title: fr ? 'Évolution' : 'Trend',
                icon: Icons.show_chart,
                child: _Trend(sessions: settled, window: w),
              ),
              AdminCard(
                title: fr ? 'Par jour de la semaine' : 'By weekday',
                icon: Icons.calendar_view_week,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SizedBox(
                      height: 120,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          for (final d in BatchX.week)
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 4),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(AdminFmt.percent(weekdays[d]!.rate), style: AppTypography.caption.copyWith(fontSize: 10, fontWeight: FontWeight.w700)),
                                    const SizedBox(height: 4),
                                    Container(
                                      height: 80 * ((weekdays[d]!.rate ?? 0) / 100),
                                      decoration: BoxDecoration(color: Att.tone(weekdays[d]!.rate).withValues(alpha: 0.8), borderRadius: BorderRadius.circular(4)),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(BatchX.dayShort(d, fr), style: AppTypography.caption.copyWith(fontSize: 10.5, color: AppColors.textMuted)),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    if (best != null) ...[
                      const SizedBox(height: 10),
                      Text(
                        fr
                            ? 'Meilleur jour : ${BatchX.dayLong(best.key, true)} (${AdminFmt.percent(best.value.rate)})${worst != null && worst.key != best.key ? ' · plus faible : ${BatchX.dayLong(worst.key, true)} (${AdminFmt.percent(worst.value.rate)})' : ''}'
                            : 'Best day: ${BatchX.dayLong(best.key, false)} (${AdminFmt.percent(best.value.rate)})${worst != null && worst.key != best.key ? ' · lowest: ${BatchX.dayLong(worst.key, false)} (${AdminFmt.percent(worst.value.rate)})' : ''}',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ],
                ),
              ),
              AdminCard(
                title: fr ? 'Promotions' : 'Batches',
                icon: Icons.leaderboard_outlined,
                action: SegmentedButton<bool>(
                  segments: [
                    ButtonSegment(value: true, label: Text(fr ? 'Plus faibles' : 'Lowest')),
                    ButtonSegment(value: false, label: Text(fr ? 'Meilleures' : 'Highest')),
                  ],
                  selected: {_rankLow},
                  showSelectedIcon: false,
                  style: const ButtonStyle(visualDensity: VisualDensity.compact),
                  onSelectionChanged: (v) => setState(() => _rankLow = v.first),
                ),
                child: Column(
                  children: [
                    for (final b in ranked.take(7))
                      _RateLine(
                        label: J.s(b.$1['batch_name']),
                        sub: J.s(b.$1['teacher_name']),
                        rate: b.$2.rate,
                        onTap: b.$1['batch_id'] == null ? null : () => _set(() => _batch = J.i(b.$1['batch_id'])),
                      ),
                  ],
                ),
              ),
              AdminCard(
                title: fr ? 'Étudiants à suivre' : 'Students to follow up',
                icon: Icons.priority_high,
                accent: AppColors.bad,
                action: atRisk.isEmpty ? null : Pill('${atRisk.length}', color: AppColors.bad, solid: true),
                child: atRisk.isEmpty
                    ? AdminEmpty(
                        icon: Icons.check_circle_outline,
                        title: fr ? 'Aucun étudiant sous ${Att.risk} %' : 'No student below ${Att.risk}%',
                        message: fr ? 'Parmi ceux qui ont eu au moins 3 séances.' : 'Among students with at least 3 sessions.',
                      )
                    : Column(
                        children: [
                          for (final s in atRisk.take(6))
                            _RateLine(
                              label: J.name(s),
                              sub: '${J.s(s['batch_name'])} · ${J.i(s['present_count'])}/${J.i(s['total_sessions'])}',
                              rate: J.n(s['attendance_rate']).toDouble(),
                              onTap: () => showAdminPanel(
                                context,
                                builder: (_) => StudentHistoryPanel(student: s, kind: _kind, from: w?.$1, to: w?.$2),
                              ),
                            ),
                        ],
                      ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SegmentedButton<String>(
            segments: [
              ButtonSegment(value: 'sessions', label: Text(fr ? 'Séances' : 'Sessions')),
              ButtonSegment(value: 'students', label: Text(fr ? 'Étudiants' : 'Students')),
              ButtonSegment(value: 'batches', label: Text(fr ? 'Promos' : 'Batches')),
              ButtonSegment(value: 'teachers', label: Text(fr ? 'Profs' : 'Teachers')),
            ],
            selected: {_tab},
            showSelectedIcon: false,
            onSelectionChanged: (v) => setState(() {
              _tab = v.first;
              _q = '';
            }),
          ),
          const SizedBox(height: 10),
          AdminSearchField(key: ValueKey(_tab), hint: fr ? 'Rechercher' : 'Search', onChanged: (v) => setState(() => _q = v)),
          const SizedBox(height: 10),
          if (_tab == 'sessions')
            ..._sessions
                .where((s) => q.isEmpty || '${J.s(s['batch_name'])} ${J.s(s['teacher_name'])} ${J.s(s['schedule_title'])}'.toLowerCase().contains(q))
                .take(60)
                .map(
                  (s) => _SessionTile(
                    s: s,
                    onTap: () => showAdminPanel(context, builder: (_) => SessionRosterPanel(session: s)),
                  ),
                ),
          if (_tab == 'students')
            ...(_students.where((s) => q.isEmpty || '${J.name(s)} ${J.s(s['email'])} ${J.s(s['batch_name'])}'.toLowerCase().contains(q)).toList()
                  ..sort((a, b) => J.n(a['attendance_rate']).compareTo(J.n(b['attendance_rate']))))
                .take(80)
                .map(
                  (s) => _RateLine(
                    label: J.name(s),
                    sub:
                        '${J.s(s['batch_name'])} · ${J.i(s['present_count'])}/${J.i(s['total_sessions'])}${s['last_attendance_date'] != null ? ' · ${fr ? 'dernier' : 'last'} ${AdminFmt.dayShort(context, J.date(s['last_attendance_date']))}' : ''}',
                    rate: J.i(s['total_sessions']) == 0 ? null : J.n(s['attendance_rate']).toDouble(),
                    card: true,
                    onTap: () => showAdminPanel(
                      context,
                      builder: (_) => StudentHistoryPanel(student: s, kind: _kind, from: w?.$1, to: w?.$2),
                    ),
                  ),
                ),
          if (_tab == 'batches')
            ...batches.values
                .where((b) => q.isEmpty || '${J.s(b.$1['batch_name'])} ${J.s(b.$1['teacher_name'])}'.toLowerCase().contains(q))
                .map(
                  (b) => _RateLine(
                    label: J.s(b.$1['batch_name']),
                    sub: fr
                        ? '${J.s(b.$1['teacher_name'])} · ${enrolledPerBatch[J.i(b.$1['batch_id'])] ?? 0} étudiants · ${b.$2.sessions} séances · ${b.$2.absent} absences'
                        : '${J.s(b.$1['teacher_name'])} · ${enrolledPerBatch[J.i(b.$1['batch_id'])] ?? 0} students · ${b.$2.sessions} sessions · ${b.$2.absent} absences',
                    rate: b.$2.rate,
                    card: true,
                    onTap: b.$1['batch_id'] == null ? null : () => _set(() => _batch = J.i(b.$1['batch_id'])),
                  ),
                ),
          if (_tab == 'teachers')
            ...(teachers.values.where((t) => q.isEmpty || J.s(t.$1['teacher_name']).toLowerCase().contains(q)).toList()..sort((a, b) => b.$2.sessions.compareTo(a.$2.sessions))).map(
              (t) => _RateLine(
                label: J.s(t.$1['teacher_name']),
                sub: fr
                    ? '${t.$3.length} promotion${t.$3.length > 1 ? 's' : ''} · ${t.$2.sessions} séances${t.$4 > 0 ? ' · ${t.$4} sans présence' : ''}'
                    : '${t.$3.length} batch${t.$3.length > 1 ? 'es' : ''} · ${t.$2.sessions} sessions held${t.$4 > 0 ? ' · ${t.$4} with no check-in' : ''}',
                rate: t.$2.rate,
                card: true,
                onTap: t.$1['teacher_id'] == null ? null : () => _set(() => _teacher = J.i(t.$1['teacher_id'])),
              ),
            ),
        ],
      ],
    );
  }
}

class _PickChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final List<(int?, String)> items;
  final ValueChanged<int?> onSelected;
  const _PickChip({required this.icon, required this.label, required this.active, required this.items, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<int>(
      onSelected: (v) => onSelected(v == -1 ? null : v),
      itemBuilder: (_) => [for (final i in items) PopupMenuItem(value: i.$1 ?? -1, child: Text(i.$2))],
      child: Chip(
        avatar: Icon(icon, size: 16),
        label: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 110),
          child: Text(label, overflow: TextOverflow.ellipsis),
        ),
        visualDensity: VisualDensity.compact,
        backgroundColor: active ? AppColors.adminAccentBg : AppColors.pureWhite,
        side: BorderSide(color: active ? AppColors.adminAccent : AppColors.border),
      ),
    );
  }
}

/// A name, a line of detail and an attendance bar.
class _RateLine extends StatelessWidget {
  final String label;
  final String sub;
  final double? rate;
  final VoidCallback? onTap;
  final bool card;
  const _RateLine({required this.label, required this.sub, required this.rate, this.onTap, this.card = false});

  @override
  Widget build(BuildContext context) {
    final body = Padding(
      padding: EdgeInsets.symmetric(horizontal: card ? 12 : 0, vertical: card ? 10 : 7),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  sub,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(value: (rate ?? 0) / 100, minHeight: 5, color: Att.tone(rate), backgroundColor: AppColors.borderSoft),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 46,
            child: Text(
              AdminFmt.percent(rate),
              textAlign: TextAlign.right,
              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: Att.tone(rate)),
            ),
          ),
        ],
      ),
    );
    if (!card) return InkWell(onTap: onTap, child: body);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: body,
          ),
        ),
      ),
    );
  }
}

class _SessionTile extends StatelessWidget {
  final Map<String, dynamic> s;
  final VoidCallback onTap;
  const _SessionTile({required this.s, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final start = Att.start(s);
    final live = s['is_live'] == true;
    final rate = J.i(s['total_students']) == 0 ? null : Att.attended(s) * 100 / J.i(s['total_students']);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: live ? AppColors.goodBorder : AppColors.border),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 62,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(AdminFmt.dayShort(context, start), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
                      Text(Att.timeText(context, s), style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10.5), maxLines: 2),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Att.kind(s) == 'meeting' ? Icons.videocam_outlined : Icons.place_outlined, size: 14, color: AppColors.textSubtle),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              J.s(s['batch_name']),
                              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        J.s(s['teacher_name']),
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Wrap(
                        spacing: 10,
                        children: [
                          _Count(Icons.check_circle_outline, J.i(s['present_count']), AppColors.good),
                          _Count(Icons.schedule, J.i(s['late_count']), AppColors.warn),
                          if (!live) _Count(Icons.cancel_outlined, J.i(s['absent_count']), AppColors.bad),
                        ],
                      ),
                    ],
                  ),
                ),
                live
                    ? Pill(fr ? 'En direct' : 'Live', color: AppColors.good, icon: Icons.fiber_manual_record)
                    : Text(
                        AdminFmt.percent(rate),
                        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: Att.tone(rate)),
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Count extends StatelessWidget {
  final IconData icon;
  final int n;
  final Color color;
  const _Count(this.icon, this.n, this.color);

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 14, color: n == 0 ? AppColors.textSubtle : color),
      const SizedBox(width: 3),
      Text(
        '$n',
        style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: n == 0 ? AppColors.textSubtle : AppColors.ink),
      ),
    ],
  );
}

/// Attendance rate over the period, by day, week or month depending on its length.
class _Trend extends StatelessWidget {
  final List<Map<String, dynamic>> sessions;
  final (DateTime, DateTime, DateTime, DateTime)? window;
  const _Trend({required this.sessions, required this.window});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final dates = sessions.map(Att.start).whereType<DateTime>().toList()..sort();
    if (dates.isEmpty) return const SizedBox.shrink();
    final first = window?.$1 ?? DateTime(dates.first.year, dates.first.month, dates.first.day);
    final last = window?.$2 ?? DateTime(dates.last.year, dates.last.month, dates.last.day);
    final span = last.difference(first).inDays;
    final unit = span > 200
        ? 'month'
        : span > 31
        ? 'week'
        : 'day';
    DateTime bucket(DateTime d) {
      final day = DateTime(d.year, d.month, d.day);
      if (unit == 'month') return DateTime(d.year, d.month);
      if (unit == 'week') return day.subtract(Duration(days: (day.weekday + 6) % 7));
      return day;
    }

    final aggs = <DateTime, _Agg>{};
    for (var cur = bucket(first); !cur.isAfter(last) && aggs.length < 200;) {
      aggs[cur] = _Agg();
      cur = unit == 'month' ? DateTime(cur.year, cur.month + 1) : cur.add(Duration(days: unit == 'week' ? 7 : 1));
    }
    for (final s in sessions) {
      final d = Att.start(s);
      if (d == null) continue;
      (aggs[bucket(d)] ??= _Agg()).add(s);
    }
    final keys = aggs.keys.toList()..sort();
    final spots = <FlSpot>[
      for (var i = 0; i < keys.length; i++)
        if (aggs[keys[i]]!.rate != null) FlSpot(i.toDouble(), aggs[keys[i]]!.rate!),
    ];
    final fmt = DateFormat(unit == 'month' ? 'MMM' : 'd MMM', fr ? 'fr_FR' : 'en_US');
    return SizedBox(
      height: 170,
      child: spots.isEmpty
          ? Center(child: Text('—', style: AppTypography.bodySmall))
          : LineChart(
              LineChartData(
                minY: 0,
                maxY: 100,
                gridData: FlGridData(show: true, drawVerticalLine: false, horizontalInterval: 25, getDrawingHorizontalLine: (_) => const FlLine(color: AppColors.borderSoft, strokeWidth: 1)),
                borderData: FlBorderData(show: false),
                extraLinesData: ExtraLinesData(
                  horizontalLines: [
                    HorizontalLine(y: Att.target.toDouble(), color: AppColors.good.withValues(alpha: 0.5), dashArray: [4, 4], strokeWidth: 1),
                  ],
                ),
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 34,
                      interval: 25,
                      getTitlesWidget: (v, _) => Text('${v.round()}%', style: AppTypography.caption.copyWith(fontSize: 9.5, color: AppColors.textSubtle)),
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 20,
                      interval: math.max(1, (keys.length / 5).ceilToDouble()),
                      getTitlesWidget: (v, _) {
                        final i = v.round();
                        if (i < 0 || i >= keys.length) return const SizedBox.shrink();
                        return Text(fmt.format(keys[i]), style: AppTypography.caption.copyWith(fontSize: 9.5, color: AppColors.textSubtle));
                      },
                    ),
                  ),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: spots,
                    isCurved: true,
                    preventCurveOverShooting: true,
                    color: AppColors.adminAccent,
                    barWidth: 2.5,
                    dotData: FlDotData(show: spots.length < 20),
                    belowBarData: BarAreaData(show: true, color: AppColors.adminAccent.withValues(alpha: 0.08)),
                  ),
                ],
              ),
            ),
    );
  }
}
