import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_nav.dart';
import '../common/admin_state.dart';
import '../demo_requests/demo_model.dart';

/// What needs attention, what's next and how the school is doing, from the
/// same sources as the web dashboard. A source that fails only blanks its card.
class AdminDashboardScreen extends ConsumerStatefulWidget {
  final void Function(int tab) onNavigate;
  const AdminDashboardScreen({super.key, required this.onNavigate});

  @override
  ConsumerState<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen> {
  bool _loading = true;
  List<Map<String, dynamic>>? _users, _batches, _quizzes, _schedules, _meetings;
  List<Map<String, dynamic>>? _demos;
  Map<String, dynamic>? _demoStats;
  Map<String, dynamic>? _attendance;
  DateTime _updated = DateTime.now();
  int _months = 6;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = ref.read(apiClientProvider);
    Future<T?> get<T>(String path, T Function(dynamic) pick, [Map<String, dynamic>? q]) async {
      try {
        final res = await api.get(path, queryParameters: q);
        return pick(res.data);
      } catch (_) {
        return null;
      }
    }

    final results = await Future.wait<dynamic>([
      get('/users', (d) => J.list(d, ['users'])),
      get('/batches', (d) => J.list(d, ['batches'])),
      get('/quizzes', (d) => J.list(d, ['quizzes'])),
      get('/schedules', (d) => J.list(d, ['schedules'])),
      get('/meetings', (d) => J.list(d, ['meetings'])),
      get('/demo-requests', (d) => J.map(d), {'limit': 5}),
      get('/attendance/reports/overview', (d) => J.map(J.map(d)['overview'] ?? d)),
    ]);
    if (!mounted) return;
    final demos = results[5] as Map<String, dynamic>?;
    if (demos != null) {
      ref.read(newDemoRequestsProvider.notifier).state = J.i(J.map(demos['statistics'])['new_requests']);
    }
    setState(() {
      _users = results[0] as List<Map<String, dynamic>>?;
      _batches = results[1] as List<Map<String, dynamic>>?;
      _quizzes = results[2] as List<Map<String, dynamic>>?;
      _schedules = results[3] as List<Map<String, dynamic>>?;
      _meetings = results[4] as List<Map<String, dynamic>>?;
      _demos = demos == null ? null : J.list(demos['data']);
      _demoStats = demos == null ? null : J.map(demos['statistics']);
      _attendance = results[6] as Map<String, dynamic>?;
      _updated = DateTime.now();
      _loading = false;
    });
  }

  static String batchStatus(Map<String, dynamic> b) {
    final now = DateTime.now();
    final s = J.date(b['start_date']);
    final e = J.date(b['end_date']);
    if (s != null && now.isBefore(s)) return 'upcoming';
    if (e != null && now.isAfter(e.add(const Duration(days: 1)))) return 'ended';
    return 'running';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const AdminLoading();
    final fr = context.isFrench;
    final user = ref.watch(authNotifierProvider).user;
    final now = DateTime.now();

    final users = _users ?? const [];
    final students = users.where((u) => u['role'] == 'student').toList();
    final teachers = users.where((u) => u['role'] == 'teacher').toList();
    final admins = users.where((u) => u['role'] == 'admin').length;
    final disabled = users.where((u) => u['is_active'] == false).length;
    final newStudents = students.where((u) => (J.date(u['created_at']) ?? DateTime(2000)).isAfter(now.subtract(const Duration(days: 30)))).length;
    final activeStudents = students.where((u) => u['is_active'] != false).length;

    final batches = _batches ?? const [];
    final running = batches.where((b) => batchStatus(b) == 'running').toList();
    final upcoming = batches.where((b) => batchStatus(b) == 'upcoming').toList();
    final ended = batches.where((b) => batchStatus(b) == 'ended').toList();
    final live = [...running, ...upcoming];
    final empty = live.where((b) => J.i(b['student_count']) == 0).toList();
    final endingSoon = running.where((b) => (J.date(b['end_date'])?.difference(now).inDays ?? 999) <= 14).toList();
    final startingSoon = upcoming.where((b) => (J.date(b['start_date'])?.difference(now).inDays ?? 999) <= 7).toList();
    final enrolled = live.fold<int>(0, (s, b) => s + J.i(b['student_count']));
    final topBatches = [...live]..sort((a, b) => J.i(b['student_count']).compareTo(J.i(a['student_count'])));

    final quizzes = _quizzes ?? const [];
    final liveQuizzes = quizzes.where((q) => q['status'] == 'published' && (J.s(q['schedule_state']).isEmpty || q['schedule_state'] == 'active')).toList();
    final drafts = quizzes.where((q) => q['status'] == 'draft').toList();
    final lowCompletion = liveQuizzes.where((q) => J.n(q['total_students']) > 0 && J.n(q['submitted_students']) / J.n(q['total_students']) < 0.5).toList();
    final scored = quizzes.where((q) => q['avg_score'] != null).toList();
    final avgScore = scored.isEmpty ? null : scored.fold<num>(0, (s, q) => s + J.n(q['avg_score'])) / scored.length;
    final liveSub = liveQuizzes.fold<num>(0, (s, q) => s + J.n(q['submitted_students']));
    final liveAll = liveQuizzes.fold<num>(0, (s, q) => s + J.n(q['total_students']));

    final schedules = _schedules ?? const [];
    final weekStart = DateTime(now.year, now.month, now.day).subtract(Duration(days: now.weekday - 1));
    final classesThisWeek = schedules.where((s) {
      final t = J.date(s['start_time']);
      return s['type'] == 'class' && s['status'] != 'cancelled' && t != null && !t.isBefore(weekStart) && t.isBefore(weekStart.add(const Duration(days: 7)));
    }).length;
    final next = schedules.where((s) => s['status'] != 'cancelled' && (J.date(s['end_time'])?.isAfter(now) ?? false)).toList()
      ..sort((a, b) => (J.date(a['start_time']) ?? now).compareTo(J.date(b['start_time']) ?? now));
    final liveMeetings = (_meetings ?? const []).where((m) => m['status'] == 'active').toList();

    final demoNew = J.i(_demoStats?['new_requests']);
    final rate = _attendance == null ? null : J.n(_attendance!['overall_attendance_rate']);

    String plural(int n, String one, String many) => '$n ${n == 1 ? one : many}';
    final attention = <_Alert>[
      if (demoNew > 0)
        _Alert(Icons.support_agent, AppColors.warn, fr ? plural(demoNew, 'nouvelle demande de démo', 'nouvelles demandes de démo') : plural(demoNew, 'new demo request', 'new demo requests'),
            fr ? 'En attente de contact' : 'Waiting to be contacted', fr ? 'Voir' : 'Review', AdminTab.demoRequests),
      if (empty.isNotEmpty)
        _Alert(Icons.group_off_outlined, AppColors.bad, fr ? plural(empty.length, 'promotion sans étudiant', 'promotions sans étudiant') : plural(empty.length, 'batch without students', 'batches without students'),
            empty.take(2).map((b) => J.s(b['name'])).join(', ') + (empty.length > 2 ? '…' : ''), fr ? 'Inscrire' : 'Enrol', AdminTab.batches),
      if (lowCompletion.isNotEmpty)
        _Alert(Icons.quiz_outlined, AppColors.warn, fr ? plural(lowCompletion.length, 'quiz en cours sous 50 %', 'quiz en cours sous 50 %') : plural(lowCompletion.length, 'live quiz under 50% completion', 'live quizzes under 50% completion'),
            lowCompletion.take(2).map((q) => J.s(q['title'])).join(', '), null, null),
      if (endingSoon.isNotEmpty)
        _Alert(Icons.event_busy_outlined, const Color(0xFF2563EB), fr ? plural(endingSoon.length, 'promotion finit dans 14 jours', 'promotions finissent dans 14 jours') : plural(endingSoon.length, 'batch ends within 14 days', 'batches end within 14 days'),
            fr ? 'Prévoyez le niveau suivant' : 'Plan the next level for these students', fr ? 'Voir' : 'View', AdminTab.batches),
      if (startingSoon.isNotEmpty)
        _Alert(Icons.schedule, const Color(0xFF4F46E5), fr ? plural(startingSoon.length, 'promotion commence cette semaine', 'promotions commencent cette semaine') : plural(startingSoon.length, 'batch starts this week', 'batches start this week'),
            startingSoon.take(2).map((b) => J.s(b['name'])).join(', '), fr ? 'Vérifier' : 'Check', AdminTab.batches),
      if (drafts.isNotEmpty)
        _Alert(Icons.edit_note, AppColors.textMuted, fr ? plural(drafts.length, 'quiz en brouillon', 'quiz en brouillon') : plural(drafts.length, 'draft quiz', 'draft quizzes'),
            fr ? 'Pas encore visibles des étudiants' : 'Not visible to students yet', null, null),
    ];

    final hour = now.hour;
    final greeting = hour < 12 ? (fr ? 'Bonjour' : 'Good morning') : hour < 18 ? (fr ? 'Bon après-midi' : 'Good afternoon') : (fr ? 'Bonsoir' : 'Good evening');
    final first = user?.firstName ?? '';

    final kpis = [
      StatTile(
        label: fr ? 'Étudiants' : 'Students',
        value: _users == null ? '—' : '${students.length}',
        sub: _users == null ? (fr ? 'Indisponible' : 'Unavailable') : (fr ? '$activeStudents actifs · +$newStudents ce mois' : '$activeStudents active · +$newStudents this month'),
        icon: Icons.school_outlined,
        color: AppColors.good,
        onTap: () => widget.onNavigate(AdminTab.users),
      ),
      StatTile(
        label: fr ? 'Promotions en cours' : 'Running batches',
        value: _batches == null ? '—' : '${running.length}',
        sub: _batches == null ? (fr ? 'Indisponible' : 'Unavailable') : (fr ? '$enrolled inscriptions · ${upcoming.length} à venir' : '$enrolled enrolments · ${upcoming.length} upcoming'),
        icon: Icons.groups_outlined,
        color: const Color(0xFF4F46E5),
        onTap: () => widget.onNavigate(AdminTab.batches),
      ),
      StatTile(
        label: fr ? 'Cours cette semaine' : 'Classes this week',
        value: _schedules == null ? '—' : '$classesThisWeek',
        sub: _schedules == null
            ? (fr ? 'Indisponible' : 'Unavailable')
            : next.isEmpty
                ? (fr ? 'Rien de prévu' : 'Nothing scheduled')
                : '${fr ? 'Prochain' : 'Next'} ${AdminFmt.weekdayDay(context, J.date(next.first['start_time']))} ${AdminFmt.time(context, J.date(next.first['start_time']))}',
        icon: Icons.calendar_month_outlined,
        color: const Color(0xFF2563EB),
        onTap: () => widget.onNavigate(AdminTab.timetable),
      ),
      StatTile(
        label: fr ? 'Taux de présence' : 'Attendance rate',
        value: rate == null ? '—' : '${rate.round()}%',
        sub: _attendance == null
            ? (fr ? 'Indisponible' : 'Unavailable')
            : (fr ? '${J.i(_attendance!['total_present']) + J.i(_attendance!['total_late'])} présences enregistrées' : '${J.i(_attendance!['total_present']) + J.i(_attendance!['total_late'])} check-ins recorded'),
        icon: Icons.fact_check_outlined,
        color: rate != null && rate < 70 ? AppColors.warn : const Color(0xFF0D9488),
        onTap: () => widget.onNavigate(AdminTab.attendance),
      ),
      StatTile(
        label: fr ? 'Nouvelles demandes' : 'New demo requests',
        value: _demoStats == null ? '—' : '$demoNew',
        sub: _demoStats == null
            ? (fr ? 'Indisponible' : 'Unavailable')
            : (fr ? '${J.i(_demoStats!['this_week'])} cette semaine · ${J.i(_demoStats!['demo_scheduled'])} planifiées' : '${J.i(_demoStats!['this_week'])} this week · ${J.i(_demoStats!['demo_scheduled'])} scheduled'),
        icon: Icons.support_agent,
        color: demoNew > 0 ? AppColors.warn : AppColors.textMuted,
        onTap: () => widget.onNavigate(AdminTab.demoRequests),
      ),
    ];

    return AdminPage(
      onRefresh: _load,
      children: [
        AdminHeader(
          overline: '${fr ? 'Console admin' : 'Admin console'} · ${DateFormat(fr ? 'EEEE d MMMM' : 'EEEE, MMMM d', fr ? 'fr_FR' : 'en_US').format(now)}',
          title: first.isEmpty ? greeting : '$greeting, $first',
          subtitle: '${attention.isEmpty ? (fr ? "Tout est en ordre aujourd'hui." : 'Everything is on track today.') : (fr ? '${attention.length} point${attention.length > 1 ? 's' : ''} à regarder aujourd’hui.' : '${attention.length} thing${attention.length > 1 ? 's need' : ' needs'} your attention today.')} ${fr ? 'Mis à jour à' : 'Updated'} ${AdminFmt.time(context, _updated)}',
          actions: [
            AdminButton(fr ? 'Ajouter un utilisateur' : 'Add user', icon: Icons.person_add_alt_1, primary: false, onPressed: () {
              ref.read(adminIntentProvider.notifier).state = AdminIntent.newUser;
              widget.onNavigate(AdminTab.users);
            }),
            AdminButton(fr ? 'Nouvelle promotion' : 'New batch', icon: Icons.add, onPressed: () {
              ref.read(adminIntentProvider.notifier).state = AdminIntent.newBatch;
              widget.onNavigate(AdminTab.batches);
            }),
          ],
        ),
        AdminGrid(minTileWidth: 170, maxColumns: 5, spacing: 12, children: kpis),
        const SizedBox(height: 16),
        AdminGrid(
          minTileWidth: 340,
          maxColumns: 2,
          children: [
            AdminCard(
              title: fr ? 'À regarder' : 'Needs your attention',
              icon: Icons.warning_amber_rounded,
              accent: AppColors.warn,
              action: attention.isEmpty ? null : Pill('${attention.length}', color: AppColors.warn, solid: true),
              child: attention.isEmpty
                  ? AdminEmpty(
                      icon: Icons.check_circle_outline,
                      title: fr ? 'Rien à signaler' : 'All clear',
                      message: fr ? 'Aucune demande en attente, promotion vide ou quiz en difficulté.' : 'No pending requests, empty batches or struggling quizzes.',
                    )
                  : Column(children: [for (final a in attention) _AlertTile(alert: a, onTap: a.tab == null ? null : () => widget.onNavigate(a.tab!))]),
            ),
            AdminCard(
              title: fr ? 'À venir' : 'Coming up',
              icon: Icons.schedule,
              action: AdminLink(fr ? 'Emploi du temps' : 'Timetable', onTap: () => widget.onNavigate(AdminTab.timetable)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (liveMeetings.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.goodBg, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.goodBorder)),
                      child: Row(
                        children: [
                          const Icon(Icons.fiber_manual_record, color: AppColors.good, size: 14),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              liveMeetings.length == 1
                                  ? '${J.s(liveMeetings.first['title'])} · ${fr ? 'en direct' : 'live now'} (${J.i(liveMeetings.first['participant_count'])})'
                                  : (fr ? '${liveMeetings.length} cours en direct' : '${liveMeetings.length} live classes'),
                              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.good),
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (_schedules == null)
                    _Unavailable(fr ? "L'emploi du temps" : 'The schedule')
                  else if (next.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Text(fr ? 'Rien de prévu dans les prochains jours.' : 'Nothing scheduled in the coming days.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
                    )
                  else
                    for (final s in next.take(6)) _AgendaRow(s: s),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 340,
          maxColumns: 2,
          children: [
            AdminCard(
              title: fr ? 'Inscriptions' : 'Sign-ups',
              icon: Icons.trending_up,
              action: SegmentedButton<int>(
                segments: [ButtonSegment(value: 6, label: Text(fr ? '6 mois' : '6 mo')), ButtonSegment(value: 12, label: Text(fr ? '12 mois' : '12 mo'))],
                selected: {_months},
                showSelectedIcon: false,
                style: const ButtonStyle(visualDensity: VisualDensity.compact),
                onSelectionChanged: (s) => setState(() => _months = s.first),
              ),
              child: _users == null ? _Unavailable(fr ? 'Les comptes' : 'Users') : _SignupChart(users: users, months: _months),
            ),
            AdminCard(
              title: fr ? 'Personnes' : 'People',
              icon: Icons.people_outline,
              action: AdminLink(fr ? 'Utilisateurs' : 'Users', onTap: () => widget.onNavigate(AdminTab.users)),
              child: _users == null
                  ? _Unavailable(fr ? 'Les comptes' : 'Users')
                  : _PeopleDonut(
                      total: users.length,
                      parts: [
                        (fr ? 'Étudiants' : 'Students', students.length, AppColors.good),
                        (fr ? 'Professeurs' : 'Teachers', teachers.length, const Color(0xFF3B82F6)),
                        (fr ? 'Admins' : 'Admins', admins, const Color(0xFF8B5CF6)),
                      ],
                      extra: [
                        (fr ? 'Comptes désactivés' : 'Disabled accounts', '$disabled'),
                        (fr ? 'Étudiants par professeur' : 'Students per teacher', teachers.isEmpty ? '—' : (students.length / teachers.length).toStringAsFixed(1)),
                      ],
                    ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 300,
          maxColumns: 3,
          children: [
            AdminCard(
              title: fr ? 'Promotions' : 'Batches',
              icon: Icons.groups_outlined,
              action: AdminLink(fr ? 'Gérer' : 'Manage', onTap: () => widget.onNavigate(AdminTab.batches)),
              child: _batches == null
                  ? _Unavailable(fr ? 'Les promotions' : 'Batches')
                  : batches.isEmpty
                      ? Text(fr ? 'Aucune promotion.' : 'No batches yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            _StackBar(parts: [
                              (fr ? 'En cours' : 'Running', running.length, const Color(0xFF4F46E5)),
                              (fr ? 'À venir' : 'Upcoming', upcoming.length, const Color(0xFF06B6D4)),
                              (fr ? 'Terminées' : 'Ended', ended.length, AppColors.textSubtle),
                            ]),
                            const SizedBox(height: 14),
                            Text(fr ? 'PLUS GRANDES PROMOTIONS ACTIVES' : 'LARGEST ACTIVE BATCHES', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.textMuted, fontSize: 10.5, letterSpacing: 0.6)),
                            const SizedBox(height: 8),
                            for (final b in topBatches.take(5))
                              _HBar(
                                leading: Pill.level(J.s(b['french_level'])),
                                label: J.s(b['name']),
                                value: J.i(b['student_count']),
                                max: math.max(1, J.i(topBatches.first['student_count'])),
                                trailing: '${J.i(b['student_count'])}',
                              ),
                          ],
                        ),
            ),
            AdminCard(
              title: 'Quiz',
              icon: Icons.quiz_outlined,
              child: _quizzes == null
                  ? _Unavailable('Quiz')
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            _MiniStat(label: fr ? 'En cours' : 'Live now', value: '${liveQuizzes.length}'),
                            _MiniStat(label: fr ? 'Complétion' : 'Completion', value: liveAll == 0 ? '—' : '${(liveSub * 100 / liveAll).round()}%'),
                            _MiniStat(label: fr ? 'Score moyen' : 'Average', value: avgScore == null ? '—' : '${avgScore.round()}%'),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _StackBar(parts: [
                          (fr ? 'Publiés' : 'Published', quizzes.where((q) => q['status'] == 'published').length, AppColors.good),
                          (fr ? 'Brouillons' : 'Drafts', drafts.length, AppColors.warn),
                          (fr ? 'Archivés' : 'Archived', quizzes.where((q) => q['status'] == 'archived').length, AppColors.textSubtle),
                        ]),
                        if (liveQuizzes.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          for (final q in liveQuizzes.take(4))
                            Builder(builder: (context) {
                              final pct = J.n(q['total_students']) == 0 ? 0 : (J.n(q['submitted_students']) * 100 / J.n(q['total_students'])).round();
                              return _HBar(label: J.s(q['title']), value: pct, max: 100, trailing: '$pct%', color: pct < 50 ? AppColors.warn : AppColors.good);
                            }),
                        ],
                      ],
                    ),
            ),
            AdminCard(
              title: fr ? 'Présence' : 'Attendance',
              icon: Icons.fact_check_outlined,
              action: AdminLink(fr ? 'Détails' : 'Details', onTap: () => widget.onNavigate(AdminTab.attendance)),
              child: _attendance == null
                  ? _Unavailable(fr ? 'La présence' : 'Attendance')
                  : Row(
                      children: [
                        _Ring(value: (rate ?? 0).toDouble()),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            children: [
                              _Legend(fr ? 'Présents' : 'Present', '${J.i(_attendance!['total_present'])}', AppColors.good),
                              _Legend(fr ? 'En retard' : 'Late', '${J.i(_attendance!['total_late'])}', AppColors.warn),
                              _Legend(fr ? 'Absents' : 'Absent', '${J.i(_attendance!['total_absent'])}', AppColors.bad),
                              _Legend(fr ? 'Séances ouvertes' : 'Sessions started', '${J.i(_attendance!['sessions_with_codes'])} / ${J.i(_attendance!['total_sessions'])}', AppColors.textSubtle),
                            ],
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Dernières demandes de démo' : 'Latest demo requests',
          icon: Icons.support_agent,
          action: AdminLink(fr ? 'Toutes' : 'All requests', onTap: () => widget.onNavigate(AdminTab.demoRequests)),
          child: _demos == null
              ? _Unavailable(fr ? 'Les demandes' : 'Demo requests')
              : _demos!.isEmpty
                  ? Text(fr ? 'Aucune demande pour le moment.' : 'No demo requests yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
                  : Column(
                      children: [
                        for (final d in _demos!)
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            onTap: () => widget.onNavigate(AdminTab.demoRequests),
                            leading: InitialsAvatar(J.s(d['full_name']), size: 36),
                            title: Text(J.s(d['full_name']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Text(
                              [J.s(d['country']), J.s(d['interested_level']).isNotEmpty ? J.s(d['interested_level']) : J.s(d['current_level'])].where((s) => s.isNotEmpty).join(' · ').isEmpty
                                  ? J.s(d['email'])
                                  : [J.s(d['country']), J.s(d['interested_level']).isNotEmpty ? J.s(d['interested_level']) : J.s(d['current_level'])].where((s) => s.isNotEmpty).join(' · '),
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Pill(Demo.statusLabel(J.s(d['status']), fr), color: Demo.statusColor(J.s(d['status']))),
                                const SizedBox(height: 3),
                                Text(AdminFmt.dayShort(context, J.date(d['created_at'])), style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 11)),
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

class _Alert {
  final IconData icon;
  final Color color;
  final String title;
  final String text;
  final String? cta;
  final int? tab;
  const _Alert(this.icon, this.color, this.title, this.text, this.cta, this.tab);
}

class _AlertTile extends StatelessWidget {
  final _Alert alert;
  final VoidCallback? onTap;
  const _AlertTile({required this.alert, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: alert.color.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border(left: BorderSide(color: alert.color, width: 3)),
        ),
        child: Row(
          children: [
            Icon(alert.icon, color: alert.color, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(alert.title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                  if (alert.text.isNotEmpty) Text(alert.text, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            if (alert.cta != null && onTap != null)
              TextButton(onPressed: onTap, style: TextButton.styleFrom(foregroundColor: alert.color, visualDensity: VisualDensity.compact), child: Text(alert.cta!)),
          ],
        ),
      ),
    );
  }
}

class _AgendaRow extends StatelessWidget {
  final Map<String, dynamic> s;
  const _AgendaRow({required this.s});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final start = J.date(s['start_time']);
    final now = DateTime.now();
    final isLive = start != null && !start.isAfter(now);
    final today = start != null && start.year == now.year && start.month == now.month && start.day == now.day;
    final teacher = J.name(s, first: 'teacher_first_name', last: 'teacher_last_name');
    final color = s['type'] == 'class' ? AppColors.adminAccent : s['type'] == 'exam' ? AppColors.bad : AppColors.warn;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 64,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(AdminFmt.time(context, start), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                Text(
                  isLive ? (fr ? 'Maintenant' : 'Now') : today ? (fr ? "Aujourd'hui" : 'Today') : AdminFmt.weekdayDay(context, start),
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Container(width: 3, height: 34, margin: const EdgeInsets.symmetric(horizontal: 10), decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(J.s(s['title']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text(
                  [J.s(s['batch_name']), teacher].where((x) => x.isNotEmpty).join(' · ').isEmpty ? J.s(s['type']) : [J.s(s['batch_name']), teacher].where((x) => x.isNotEmpty).join(' · '),
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (isLive) Pill(fr ? 'En cours' : 'Live', color: AppColors.good),
        ],
      ),
    );
  }
}

class _Unavailable extends StatelessWidget {
  final String what;
  const _Unavailable(this.what);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(
          context.isFrench ? '$what : chargement impossible pour le moment.' : "$what couldn't be loaded right now.",
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
      );
}

/// New accounts per month, students and staff stacked.
class _SignupChart extends StatelessWidget {
  final List<Map<String, dynamic>> users;
  final int months;
  const _SignupChart({required this.users, required this.months});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final now = DateTime.now();
    final keys = [for (var i = months - 1; i >= 0; i--) DateTime(now.year, now.month - i)];
    final data = keys.map((k) {
      final inMonth = users.where((u) {
        final d = J.date(u['created_at']);
        return d != null && d.year == k.year && d.month == k.month;
      });
      final s = inMonth.where((u) => u['role'] == 'student').length;
      return (k, s, inMonth.length - s);
    }).toList();
    final start = keys.first;
    final newIn = users.where((u) => !(J.date(u['created_at']) ?? DateTime(2000)).isBefore(start)).length;
    final prevStart = DateTime(start.year, start.month - months);
    final prev = users.where((u) {
      final d = J.date(u['created_at']);
      return d != null && !d.isBefore(prevStart) && d.isBefore(start);
    }).length;
    final delta = prev == 0 ? null : ((newIn - prev) * 100 / prev).round();
    final maxY = math.max(1, data.map((e) => e.$2 + e.$3).fold<int>(0, math.max)).toDouble();
    final monthFmt = DateFormat('MMM', fr ? 'fr_FR' : 'en_US');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('$newIn', style: AppTypography.headlineMedium.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(width: 8),
            Expanded(child: Text(fr ? 'nouveaux comptes en $months mois' : 'new accounts in $months months', style: AppTypography.caption.copyWith(color: AppColors.textMuted))),
            if (delta != null) Pill('${delta >= 0 ? '▲' : '▼'} ${delta.abs()}%', color: delta >= 0 ? AppColors.good : AppColors.bad),
          ],
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 150,
          child: BarChart(
            BarChartData(
              maxY: maxY * 1.15,
              gridData: const FlGridData(show: false),
              borderData: FlBorderData(show: false),
              titlesData: FlTitlesData(
                leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 22,
                    getTitlesWidget: (v, meta) => Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(monthFmt.format(data[v.toInt()].$1), style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted)),
                    ),
                  ),
                ),
              ),
              barTouchData: BarTouchData(
                touchTooltipData: BarTouchTooltipData(
                  getTooltipItem: (group, _, rod, _) {
                    final e = data[group.x];
                    return BarTooltipItem(
                      fr ? '${e.$2} étudiants\n${e.$3} équipe' : '${e.$2} students\n${e.$3} staff',
                      AppTypography.caption.copyWith(color: AppColors.pureWhite, fontWeight: FontWeight.w700),
                    );
                  },
                ),
              ),
              barGroups: [
                for (var i = 0; i < data.length; i++)
                  BarChartGroupData(x: i, barRods: [
                    BarChartRodData(
                      toY: (data[i].$2 + data[i].$3).toDouble(),
                      width: months == 6 ? 18 : 10,
                      borderRadius: BorderRadius.circular(4),
                      rodStackItems: [
                        BarChartRodStackItem(0, data[i].$2.toDouble(), AppColors.good),
                        BarChartRodStackItem(data[i].$2.toDouble(), (data[i].$2 + data[i].$3).toDouble(), const Color(0xFF8B5CF6)),
                      ],
                      color: Colors.transparent,
                    ),
                  ]),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 14,
          children: [
            _Dot(fr ? 'Étudiants' : 'Students', AppColors.good),
            _Dot(fr ? 'Professeurs et admins' : 'Teachers & admins', const Color(0xFF8B5CF6)),
          ],
        ),
      ],
    );
  }
}

class _PeopleDonut extends StatelessWidget {
  final int total;
  final List<(String, int, Color)> parts;
  final List<(String, String)> extra;
  const _PeopleDonut({required this.total, required this.parts, required this.extra});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final sum = parts.fold<int>(0, (s, p) => s + p.$2);
    return Row(
      children: [
        SizedBox(
          width: 120,
          height: 120,
          child: Stack(
            alignment: Alignment.center,
            children: [
              PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 40,
                  startDegreeOffset: -90,
                  sections: sum == 0
                      ? [PieChartSectionData(value: 1, color: AppColors.borderSoft, radius: 14, showTitle: false)]
                      : [for (final p in parts) if (p.$2 > 0) PieChartSectionData(value: p.$2.toDouble(), color: p.$3, radius: 14, showTitle: false)],
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('$total', style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800)),
                  Text(fr ? 'comptes' : 'users', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            children: [
              for (final p in parts) _Legend(p.$1, '${p.$2}', p.$3),
              for (final e in extra) _Legend(e.$1, e.$2, null),
            ],
          ),
        ),
      ],
    );
  }
}

class _Legend extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  const _Legend(this.label, this.value, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          if (color != null) Container(width: 9, height: 9, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))) else const SizedBox(width: 9),
          const SizedBox(width: 8),
          Expanded(child: Text(label, style: AppTypography.caption.copyWith(color: color == null ? AppColors.textMuted : AppColors.text), maxLines: 1, overflow: TextOverflow.ellipsis)),
          Text(value, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final String label;
  final Color color;
  const _Dot(this.label, this.color);

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 9, height: 9, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
          const SizedBox(width: 6),
          Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
        ],
      );
}

/// One horizontal bar made of coloured parts, with its legend.
class _StackBar extends StatelessWidget {
  final List<(String, int, Color)> parts;
  const _StackBar({required this.parts});

  @override
  Widget build(BuildContext context) {
    final total = parts.fold<int>(0, (s, p) => s + p.$2);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: SizedBox(
            height: 10,
            child: total == 0
                ? Container(color: AppColors.borderSoft)
                : Row(children: [for (final p in parts) if (p.$2 > 0) Expanded(flex: p.$2, child: Container(color: p.$3))]),
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 12,
          runSpacing: 4,
          children: [
            for (final p in parts)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 8, height: 8, decoration: BoxDecoration(color: p.$3, borderRadius: BorderRadius.circular(2))),
                  const SizedBox(width: 5),
                  Text('${p.$1} ', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  Text('${p.$2}', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

class _HBar extends StatelessWidget {
  final Widget? leading;
  final String label;
  final int value;
  final int max;
  final String trailing;
  final Color color;
  const _HBar({this.leading, required this.label, required this.value, required this.max, required this.trailing, this.color = const Color(0xFF4F46E5)});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (leading != null) ...[leading!, const SizedBox(width: 6)],
              Expanded(child: Text(label, style: AppTypography.caption.copyWith(color: AppColors.text, fontWeight: FontWeight.w600), maxLines: 1, overflow: TextOverflow.ellipsis)),
              Text(trailing, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: max == 0 ? 0 : (value / max).clamp(0.04, 1.0),
              minHeight: 6,
              color: color,
              backgroundColor: AppColors.borderSoft,
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;
  const _MiniStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800)),
            Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
          ],
        ),
      );
}

class _Ring extends StatelessWidget {
  final double value;
  const _Ring({required this.value});

  @override
  Widget build(BuildContext context) {
    final v = value.clamp(0, 100).toDouble();
    final color = v >= 80 ? AppColors.good : v >= 60 ? AppColors.warn : AppColors.bad;
    return SizedBox(
      width: 96,
      height: 96,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox.expand(child: CircularProgressIndicator(value: v / 100, strokeWidth: 9, color: color, backgroundColor: AppColors.borderSoft, strokeCap: StrokeCap.round)),
          Text('${v.round()}%', style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800)),
        ],
      ),
    );
  }
}
