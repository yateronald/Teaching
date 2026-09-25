import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'exam_common.dart';

const _skills = [Skill.ce, Skill.co, Skill.ee, Skill.eo];

bool _isComprehension(Skill s) => s == Skill.ce || s == Skill.co;

/// CE / CO are percentages, EE / EO are out of 20.
String _score(Skill s, dynamic v) {
  if (v == null || (v is String && v.isEmpty)) return '—';
  final n = J.n(v);
  return _isComprehension(s) ? '${n.round()}%' : '${(n * 10).round() / 10}/20';
}

/// Everything on one 0–100 scale for comparing skills.
double? _pct(Skill s, dynamic v) {
  if (v == null || (v is String && v.isEmpty)) return null;
  final n = J.n(v).toDouble();
  return _isComprehension(s) ? n : n / 20 * 100;
}

Color _tone(double? pct) => pct == null ? AppColors.textSubtle : pct >= 70 ? AppColors.good : pct >= 50 ? AppColors.warn : AppColors.bad;

/// TCF results of every learner: by batch or one by one.
class ExamResultsScreen extends ConsumerStatefulWidget {
  final int? initialStudentId;
  const ExamResultsScreen({super.key, this.initialStudentId});

  @override
  ConsumerState<ExamResultsScreen> createState() => _ExamResultsScreenState();
}

class _ExamResultsScreenState extends ConsumerState<ExamResultsScreen> {
  String _tab = 'batches';
  List<Map<String, dynamic>>? _batches;
  List<Map<String, dynamic>>? _students;
  String? _error;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _load();
    if (widget.initialStudentId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) openLevel(context, StudentResultsScreen(studentId: widget.initialStudentId!));
      });
    }
  }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    try {
      if (_tab == 'batches') {
        final r = await api.get('/tcf-results/batches');
        if (mounted) setState(() => _batches = J.list(r.data));
      } else {
        final r = await api.get('/tcf-results/students');
        if (mounted) setState(() => _students = J.list(r.data));
      }
      if (mounted) setState(() => _error = null);
    } catch (e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final list = _tab == 'batches' ? _batches : _students;
    final q = _query.trim().toLowerCase();
    final shown = (list ?? const <Map<String, dynamic>>[]).where((x) {
      if (q.isEmpty) return true;
      final hay = _tab == 'batches'
          ? '${J.s(x['name'])} ${J.s(x['teacher_first_name'])} ${J.s(x['teacher_last_name'])}'
          : '${J.name(x)} ${J.s(x['email'])} ${J.list(x['batches']).map((b) => J.s(b['name'])).join(' ')}';
      return hay.toLowerCase().contains(q);
    }).toList();
    return ExamScaffold(
      title: fr ? 'Résultats des étudiants' : 'Student results',
      subtitle: fr ? 'CE et CO en %, EE et EO sur 20' : 'CE and CO in %, EE and EO out of 20',
      skill: Skill.other,
      body: ExamBody(
        loading: list == null && _error == null,
        error: list == null ? _error : null,
        onRefresh: _load,
        empty: list != null && list.isEmpty,
        emptyState: AdminEmpty(icon: _tab == 'batches' ? Icons.groups_outlined : Icons.person_outline, title: _tab == 'batches' ? (fr ? 'Aucune promotion' : 'No batches yet') : (fr ? 'Aucun étudiant' : 'No students yet')),
        toolbar: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          SegmentedButton<String>(
            segments: [
              ButtonSegment(value: 'batches', icon: const Icon(Icons.groups_outlined, size: 18), label: Text(fr ? 'Promotions' : 'Batches')),
              ButtonSegment(value: 'students', icon: const Icon(Icons.person_outline, size: 18), label: Text(fr ? 'Étudiants' : 'Students')),
            ],
            selected: {_tab},
            showSelectedIcon: false,
            onSelectionChanged: (v) {
              setState(() => _tab = v.first);
              if ((_tab == 'batches' ? _batches : _students) == null) _load();
            },
          ),
          const SizedBox(height: 8),
          AdminSearchField(hint: fr ? 'Rechercher' : 'Search', onChanged: (v) => setState(() => _query = v)),
        ]),
        children: [
          if (shown.isEmpty)
            AdminCard(child: AdminEmpty(icon: Icons.search_off, title: fr ? 'Aucun résultat' : 'No results'))
          else
            TreeGrid(children: [
              for (final x in shown)
                _tab == 'batches'
                    ? TreeCard(
                        leading: Pill(J.s(x['french_level']).isEmpty ? '—' : J.s(x['french_level']), color: Pill.levelColor(J.s(x['french_level']))),
                        title: J.s(x['name']),
                        subtitle: [
                          fr ? '${J.i(x['student_count'])} étudiant(s)' : '${J.i(x['student_count'])} student(s)',
                          if (J.s(x['teacher_first_name']).isNotEmpty) '${J.s(x['teacher_first_name'])} ${J.s(x['teacher_last_name'])}'.trim(),
                        ].join(' · '),
                        onTap: () => openLevel(context, BatchResultsScreen(batchId: J.i(x['id']))),
                      )
                    : TreeCard(
                        leading: InitialsAvatar(J.name(x)),
                        title: J.name(x),
                        subtitle: [
                          J.s(x['email']),
                          if (J.s(x['role']) == 'candidate') (fr ? 'candidat' : 'candidate'),
                          ...J.list(x['batches']).map((b) => J.s(b['name'])),
                        ].where((s) => s.isNotEmpty).join(' · '),
                        onTap: () => openLevel(context, StudentResultsScreen(studentId: J.i(x['id']))),
                      ),
            ]),
        ],
      ),
    );
  }
}

class BatchResultsScreen extends ConsumerStatefulWidget {
  final int batchId;
  const BatchResultsScreen({super.key, required this.batchId});

  @override
  ConsumerState<BatchResultsScreen> createState() => _BatchResultsScreenState();
}

class _BatchResultsScreenState extends ConsumerState<BatchResultsScreen> {
  Map<String, dynamic>? _d;
  String? _error;
  Skill _sort = Skill.ce;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await ref.read(apiClientProvider).get('/tcf-results/batch/${widget.batchId}');
      if (mounted) {
        setState(() {
          _d = J.map(r.data);
          _error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = _d;
    final batch = J.map(d?['batch']);
    final analytics = J.map(d?['analytics']);
    final students = J.list(d?['students'])
      ..sort((a, b) {
        final pa = _pct(_sort, J.map(a[_sort.name])['avgScore']) ?? -1;
        final pb = _pct(_sort, J.map(b[_sort.name])['avgScore']) ?? -1;
        return pb.compareTo(pa);
      });
    return ExamScaffold(
      title: d == null ? (fr ? 'Promotion' : 'Batch') : J.s(batch['name']),
      subtitle: d == null ? null : '${J.s(batch['french_level'])} · ${students.length} ${fr ? 'étudiant(s)' : 'student(s)'}',
      skill: Skill.other,
      body: ExamBody(
        loading: d == null && _error == null,
        error: d == null ? _error : null,
        onRefresh: _load,
        empty: false,
        emptyState: const SizedBox.shrink(),
        children: [
          AdminGrid(minTileWidth: 150, maxColumns: 4, spacing: 10, children: [
            for (final s in _skills)
              StatTile(
                label: s.label(fr),
                value: J.i(J.map(analytics[s.name])['totalAttempts']) == 0 ? '—' : _score(s, J.map(analytics[s.name])['avgScore']),
                sub: fr ? '${J.i(J.map(analytics[s.name])['totalAttempts'])} tentative(s)' : '${J.i(J.map(analytics[s.name])['totalAttempts'])} attempt(s)',
                icon: s.icon,
                color: s.color,
              ),
          ]),
          const SizedBox(height: 14),
          Row(children: [
            Text(fr ? 'Trier par' : 'Sort by', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            const SizedBox(width: 8),
            Expanded(
              child: AdminFilterChips<Skill>(options: [for (final s in _skills) FilterOption(s, s.code)], selected: _sort, onSelected: (v) => setState(() => _sort = v)),
            ),
          ]),
          const SizedBox(height: 10),
          if (students.isEmpty)
            AdminCard(child: AdminEmpty(icon: Icons.person_off_outlined, title: fr ? 'Aucun étudiant dans cette promotion' : 'No students in this batch'))
          else
            AdminCard(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: Column(children: [
                for (final (i, st) in students.indexed) ...[
                  if (i > 0) const Divider(height: 1, color: AppColors.borderSoft),
                  InkWell(
                    onTap: () => openLevel(context, StudentResultsScreen(studentId: J.i(st['id']))),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        Row(children: [
                          InitialsAvatar(J.name(st), size: 32),
                          const SizedBox(width: 10),
                          Expanded(child: Text(J.name(st), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis)),
                          const Icon(Icons.chevron_right, color: AppColors.textSubtle),
                        ]),
                        const SizedBox(height: 8),
                        Row(children: [
                          for (final s in _skills)
                            Expanded(
                              child: _ScoreChip(skill: s, stats: J.map(st[s.name])),
                            ),
                        ]),
                      ]),
                    ),
                  ),
                ],
              ]),
            ),
        ],
      ),
    );
  }
}

class _ScoreChip extends StatelessWidget {
  final Skill skill;
  final Map<String, dynamic> stats;
  const _ScoreChip({required this.skill, required this.stats});

  @override
  Widget build(BuildContext context) {
    final n = J.i(stats['attemptsCount']);
    final pct = n == 0 ? null : _pct(skill, stats['avgScore']);
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
      decoration: BoxDecoration(color: _tone(pct).withValues(alpha: 0.08), borderRadius: BorderRadius.circular(8)),
      child: Column(children: [
        Text(skill.code, style: AppTypography.caption.copyWith(fontSize: 10, fontWeight: FontWeight.w800, color: skill.color)),
        FittedBox(child: Text(n == 0 ? '—' : _score(skill, stats['avgScore']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: _tone(pct)))),
        Text('×$n', style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted)),
      ]),
    );
  }
}

class StudentResultsScreen extends ConsumerStatefulWidget {
  final int studentId;
  const StudentResultsScreen({super.key, required this.studentId});

  @override
  ConsumerState<StudentResultsScreen> createState() => _StudentResultsScreenState();
}

class _StudentResultsScreenState extends ConsumerState<StudentResultsScreen> {
  Map<String, dynamic>? _d;
  String? _error;
  Skill _tab = Skill.ce;
  final Set<Skill> _hidden = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final r = await ref.read(apiClientProvider).get('/tcf-results/student/${widget.studentId}');
      if (!mounted) return;
      final d = J.map(r.data);
      setState(() {
        _d = d;
        _error = null;
        _tab = _skills.firstWhere((s) => J.list(d[s.name]).isNotEmpty, orElse: () => Skill.ce);
      });
    } catch (e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    }
  }

  static String _dateKey(Skill s) => s == Skill.ee ? 'submitted_at' : 'completed_at';
  static String _valueKey(Skill s) => switch (s) { Skill.ee => 'average_score', Skill.eo => 'overall_score', _ => 'score_percentage' };

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = _d;
    final student = J.map(d?['student']);
    return ExamScaffold(
      title: d == null ? (fr ? 'Étudiant' : 'Student') : J.name(student),
      subtitle: d == null ? null : J.s(student['email']),
      skill: Skill.other,
      body: ExamBody(
        loading: d == null && _error == null,
        error: d == null ? _error : null,
        onRefresh: _load,
        empty: d != null && _skills.every((s) => J.list(d[s.name]).isEmpty),
        emptyState: AdminEmpty(icon: Icons.assignment_outlined, title: fr ? 'Aucun examen passé' : 'No exam taken yet'),
        children: d == null ? const [] : _content(context, d),
      ),
    );
  }

  List<Widget> _content(BuildContext context, Map<String, dynamic> d) {
    final fr = context.isFrench;
    final points = <Skill, List<FlSpot>>{};
    final times = <double>[];
    for (final s in _skills) {
      for (final a in J.list(d[s.name])) {
        final t = J.date(a[_dateKey(s)]);
        final p = _pct(s, a[_valueKey(s)]);
        if (t == null || p == null) continue;
        times.add(t.millisecondsSinceEpoch.toDouble());
        (points[s] ??= []).add(FlSpot(t.millisecondsSinceEpoch.toDouble(), p.clamp(0, 100)));
      }
    }
    for (final l in points.values) {
      l.sort((a, b) => a.x.compareTo(b.x));
    }
    final attempts = J.list(d[_tab.name]);
    final lang = fr ? 'fr_FR' : 'en_US';
    return [
      AdminGrid(minTileWidth: 150, maxColumns: 4, spacing: 10, children: [
        for (final s in _skills)
          () {
            final list = J.list(d[s.name]);
            final values = [for (final a in list) if (a[_valueKey(s)] != null) J.n(a[_valueKey(s)])];
            final avg = values.isEmpty ? null : values.reduce((a, b) => a + b) / values.length;
            final best = values.isEmpty ? null : values.reduce((a, b) => a > b ? a : b);
            return StatTile(
              label: s.label(fr),
              value: avg == null ? '—' : _score(s, avg),
              sub: list.isEmpty ? (fr ? 'aucune tentative' : 'no attempt') : (fr ? '${list.length} tentative(s) · meilleur ${_score(s, best)}' : '${list.length} attempt(s) · best ${_score(s, best)}'),
              icon: s.icon,
              color: s.color,
              onTap: list.isEmpty ? null : () => setState(() => _tab = s),
            );
          }(),
      ]),
      if (times.length > 1) ...[
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Progression (en %)' : 'Progress (as %)',
          icon: Icons.show_chart,
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Wrap(spacing: 6, children: [
              for (final s in _skills)
                if (points[s] != null)
                  FilterChip(
                    label: Text('${s.code} · ${points[s]!.length}'),
                    selected: !_hidden.contains(s),
                    selectedColor: s.color.withValues(alpha: 0.15),
                    checkmarkColor: s.color,
                    onSelected: (on) => setState(() => on ? _hidden.remove(s) : _hidden.add(s)),
                  ),
            ]),
            const SizedBox(height: 10),
            SizedBox(
              height: 200,
              child: LineChart(LineChartData(
                minY: 0,
                maxY: 100,
                minX: times.reduce((a, b) => a < b ? a : b),
                maxX: times.reduce((a, b) => a > b ? a : b) + (times.toSet().length == 1 ? 86400000 : 0),
                borderData: FlBorderData(show: false),
                gridData: FlGridData(
                  drawVerticalLine: false,
                  horizontalInterval: 10,
                  checkToShowHorizontalLine: (v) => v == 0 || v == 50 || v == 70 || v == 100,
                  getDrawingHorizontalLine: (v) => FlLine(color: v == 50 || v == 70 ? AppColors.warn.withValues(alpha: 0.4) : AppColors.borderSoft, dashArray: v == 50 || v == 70 ? [4, 4] : null, strokeWidth: 1),
                ),
                titlesData: FlTitlesData(
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 30, interval: 50, getTitlesWidget: (v, _) => Text('${v.round()}', style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textSubtle)))),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 22,
                      interval: ((times.reduce((a, b) => a > b ? a : b) - times.reduce((a, b) => a < b ? a : b)) / 2).clamp(86400000, double.infinity),
                      getTitlesWidget: (v, meta) => v == meta.min || v == meta.max || (v - (meta.min + meta.max) / 2).abs() < 1
                          ? Text(DateFormat('d MMM', lang).format(DateTime.fromMillisecondsSinceEpoch(v.round())), style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textSubtle))
                          : const SizedBox.shrink(),
                    ),
                  ),
                ),
                lineBarsData: [
                  for (final s in _skills)
                    if (points[s] != null && !_hidden.contains(s))
                      LineChartBarData(spots: points[s]!, color: s.color, barWidth: 2.5, dotData: const FlDotData(show: true)),
                ],
              )),
            ),
          ]),
        ),
      ],
      const SizedBox(height: 14),
      AdminFilterChips<Skill>(
        options: [for (final s in _skills) FilterOption(s, s.code, count: J.list(d[s.name]).length)],
        selected: _tab,
        onSelected: (v) => setState(() => _tab = v),
      ),
      const SizedBox(height: 10),
      if (attempts.isEmpty)
        AdminCard(child: AdminEmpty(icon: Icons.hourglass_empty, title: fr ? 'Aucune tentative en ${_tab.code}' : 'No ${_tab.code} attempt yet'))
      else
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: Column(children: [
            for (final (i, a) in attempts.indexed) ...[
              if (i > 0) const Divider(height: 1, color: AppColors.borderSoft),
              _AttemptRow(skill: _tab, a: a),
            ],
          ]),
        ),
    ];
  }
}

class _AttemptRow extends StatelessWidget {
  final Skill skill;
  final Map<String, dynamic> a;
  const _AttemptRow({required this.skill, required this.a});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final (title, at, value, detail) = switch (skill) {
      Skill.ee => (
          J.s(a['combinaison_name']),
          J.date(a['submitted_at']),
          a['average_score'],
          'T1 ${_score(skill, a['task1_score'])} · T2 ${_score(skill, a['task2_score'])} · T3 ${_score(skill, a['task3_score'])}${J.s(a['month_name']).isEmpty ? '' : ' · ${J.s(a['month_name'])} ${J.i(a['year'])}'}',
        ),
      Skill.eo => (
          J.s(a['partie_name']).isEmpty ? 'Partie' : J.s(a['partie_name']),
          J.date(a['completed_at']),
          a['overall_score'],
          'T1 ${_score(skill, a['tache1_score'])} · T2 ${_score(skill, a['tache2_score'])} · T3 ${_score(skill, a['tache3_score'])}',
        ),
      _ => (
          J.s(a['series_name']),
          J.date(a['completed_at']),
          a['score_percentage'],
          fr
              ? '${J.i(a['correct_count'])}/${J.i(a['total_questions'])} bonnes · ${J.n(a['earned_points'])}/${J.n(a['total_points'])} pts'
              : '${J.i(a['correct_count'])}/${J.i(a['total_questions'])} correct · ${J.n(a['earned_points'])}/${J.n(a['total_points'])} pts',
        ),
    };
    final level = J.s(a['cefr_level']).isNotEmpty ? J.s(a['cefr_level']) : J.s(a['overall_level']);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
            Text(AdminFmt.dateTime(context, at), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            Text(detail, style: AppTypography.caption.copyWith(color: AppColors.text, fontSize: 11.5)),
          ]),
        ),
        const SizedBox(width: 8),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(_score(skill, value), style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: _tone(_pct(skill, value)))),
          if (level.isNotEmpty) Pill(level, color: Pill.levelColor(level)),
        ]),
      ]),
    );
  }
}
