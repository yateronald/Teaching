import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/kpi_stat_card.dart';
import '../../../../core/widgets/status_badge.dart';
import '../widgets/trend_chart.dart';

class TeacherDashboardScreen extends ConsumerStatefulWidget {
  final Function(int tabIndex)? onNavigateTab;

  const TeacherDashboardScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<TeacherDashboardScreen> createState() => _TeacherDashboardScreenState();
}

class _TeacherDashboardScreenState extends ConsumerState<TeacherDashboardScreen> {
  bool _isLoading = true;
  String? _error;
  String _period = '90d'; // 30d, 90d, all

  List<dynamic> _batches = [];
  List<dynamic> _quizzes = [];
  List<dynamic> _studentRows = [];

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  Future<void> _loadDashboardData() async {
    final user = ref.read(authNotifierProvider).user;
    if (user == null) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final results = await Future.wait([
        client.get('/batches/teacher/${user.id}'),
        client.get('/quizzes/teacher/${user.id}'),
        client.get('/users/students/teacher/${user.id}'),
      ]);

      final batchesData = results[0].data;
      final quizzesData = results[1].data;
      final studentsData = results[2].data;

      if (mounted) {
        setState(() {
          _batches = batchesData is List
              ? batchesData
              : (batchesData?['batches'] ?? batchesData?['data'] ?? []);
          _quizzes = quizzesData is List
              ? quizzesData
              : (quizzesData?['quizzes'] ?? quizzesData?['data'] ?? []);
          _studentRows = studentsData is List
              ? studentsData
              : (studentsData?['students'] ?? studentsData?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger les données du tableau de bord.';
          _isLoading = false;
        });
      }
    }
  }

  // Derive submissions from student rows
  List<Map<String, dynamic>> _extractSubmissions() {
    final List<Map<String, dynamic>> subs = [];
    final now = DateTime.now();
    DateTime? cutoff;
    if (_period == '30d') cutoff = now.subtract(const Duration(days: 30));
    if (_period == '90d') cutoff = now.subtract(const Duration(days: 90));

    for (final row in _studentRows) {
      final quizScores = row['quiz_scores'];
      if (quizScores is List) {
        for (final s in quizScores) {
          final submittedAt = DateTime.tryParse(s['submitted_at'] ?? '');
          if (submittedAt != null) {
            if (cutoff != null && submittedAt.isBefore(cutoff)) continue;
            final score = (s['score'] as num?)?.toDouble() ?? 0.0;
            final maxScore = (s['max_score'] as num?)?.toDouble();
            final pct = (maxScore != null && maxScore > 0) ? (score / maxScore) * 100 : null;

            subs.add({
              'studentName': '${row['first_name'] ?? ''} ${row['last_name'] ?? ''}'.trim(),
              'batchName': row['batch_name'] ?? 'Cohort',
              'quizTitle': s['quiz_title'] ?? 'Quiz',
              'score': score,
              'maxScore': maxScore,
              'pct': pct,
              'submittedAt': submittedAt,
            });
          }
        }
      }
    }
    subs.sort((a, b) => (b['submittedAt'] as DateTime).compareTo(a['submittedAt'] as DateTime));
    return subs;
  }

  List<TrendPoint> _buildTrendPoints(List<Map<String, dynamic>> submissions) {
    final Map<String, List<double>> grouped = {};
    final DateFormat monthFmt = DateFormat('MMM yy', 'fr_FR');
    final DateFormat fullFmt = DateFormat('MMMM yyyy', 'fr_FR');

    for (final s in submissions) {
      final dt = s['submittedAt'] as DateTime;
      final key = DateFormat('yyyy-MM').format(dt);
      final pct = s['pct'] as double?;
      if (pct != null) {
        grouped.putIfAbsent(key, () => []).add(pct);
      }
    }

    final sortedKeys = grouped.keys.toList()..sort();
    return sortedKeys.map((k) {
      final parts = k.split('-');
      final dt = DateTime(int.parse(parts[0]), int.parse(parts[1]));
      final list = grouped[k]!;
      final avg = list.reduce((a, b) => a + b) / list.length;
      return TrendPoint(
        label: monthFmt.format(dt),
        fullDate: fullFmt.format(dt),
        scorePct: avg,
        count: list.length,
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authNotifierProvider).user;
    final isTablet = MediaQuery.of(context).size.width >= 768;

    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.frenchNavy),
      );
    }

    if (_error != null) {
      return EmptyState(
        title: 'Une erreur est survenue',
        message: _error!,
        icon: Icons.cloud_off_outlined,
        actionText: 'Réessayer',
        onAction: _loadDashboardData,
      );
    }

    final submissions = _extractSubmissions();
    final trendPoints = _buildTrendPoints(submissions);

    // KPI figures
    final totalBatches = _batches.length;
    final activeQuizzes = _quizzes.where((q) => q['is_active'] == true).length;
    final totalSeats = _batches.fold<int>(
      0,
      (sum, b) => sum + ((b['student_count'] as num?)?.toInt() ?? 0),
    );
    final gradedScores = submissions.where((s) => s['pct'] != null).map((s) => s['pct'] as double).toList();
    final avgScore = gradedScores.isNotEmpty
        ? gradedScores.reduce((a, b) => a + b) / gradedScores.length
        : null;

    return RefreshIndicator(
      onRefresh: _loadDashboardData,
      color: AppColors.frenchNavy,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isTablet ? 32 : 16,
          vertical: 24,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Bonjour, ${user?.fullName ?? "Professeur"} 👋',
                        style: AppTypography.headlineMedium.copyWith(
                          color: AppColors.frenchNavy,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Aperçu de vos cohortes et de l\'assiduité pédagogique.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                // Period selector chips
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: AppColors.borderSoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      _buildPeriodChip('30d', '30 jours'),
                      _buildPeriodChip('90d', '90 jours'),
                      _buildPeriodChip('all', 'Tout'),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // KPI Grid
            LayoutBuilder(
              builder: (context, constraints) {
                final crossAxisCount = isTablet ? 4 : 2;
                final spacing = 12.0;
                final cardWidth = (constraints.maxWidth - (spacing * (crossAxisCount - 1))) / crossAxisCount;

                return Wrap(
                  spacing: spacing,
                  runSpacing: spacing,
                  children: [
                    SizedBox(
                      width: cardWidth,
                      child: KpiStatCard(
                        title: 'Cohortes actives',
                        value: '$totalBatches',
                        subtitle: 'Groupes d\'apprentissage',
                        icon: Icons.groups_outlined,
                        iconColor: AppColors.frenchBlue,
                        onTap: () => widget.onNavigateTab?.call(1),
                      ),
                    ),
                    SizedBox(
                      width: cardWidth,
                      child: KpiStatCard(
                        title: 'Quiz en cours',
                        value: '$activeQuizzes',
                        subtitle: 'Évaluations actives',
                        icon: Icons.quiz_outlined,
                        iconColor: AppColors.teacherAccent,
                        onTap: () => widget.onNavigateTab?.call(2),
                      ),
                    ),
                    SizedBox(
                      width: cardWidth,
                      child: KpiStatCard(
                        title: 'Total Étudiants',
                        value: '$totalSeats',
                        subtitle: 'Inscriptions actives',
                        icon: Icons.person_outline,
                        iconColor: AppColors.good,
                      ),
                    ),
                    SizedBox(
                      width: cardWidth,
                      child: KpiStatCard(
                        title: 'Moyenne générale',
                        value: avgScore != null ? '${avgScore.toStringAsFixed(1)}%' : '—',
                        subtitle: '${gradedScores.length} soumissions',
                        icon: Icons.emoji_events_outlined,
                        iconColor: AppColors.frenchGold,
                        progress: avgScore != null ? avgScore / 100 : 0.0,
                        progressColor: AppColors.toneColor(avgScore),
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 28),

            // Trend Chart Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.pureWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border, width: 1.1),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Évolution des scores moyens',
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Moyenne mensuelle obtenue par vos étudiants aux quiz',
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.teacherAccentSoft,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'TCF / TEF Ready',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.teacherAccent,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  TrendChart(points: trendPoints),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Active Batches Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Mes Cohortes',
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                TextButton.icon(
                  onPressed: () => widget.onNavigateTab?.call(1),
                  icon: const Icon(Icons.arrow_forward, size: 16, color: AppColors.frenchNavy),
                  label: Text(
                    'Voir tout',
                    style: AppTypography.label.copyWith(color: AppColors.frenchNavy),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (_batches.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Center(
                  child: Text(
                    'Aucune cohorte assignée pour le moment.',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                  ),
                ),
              )
            else
              SizedBox(
                height: 140,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _batches.length,
                  separatorBuilder: (context, index) => const SizedBox(width: 14),
                  itemBuilder: (context, idx) {
                    final batch = _batches[idx];
                    final level = batch['french_level'] ?? 'A1';
                    return Container(
                      width: 260,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border, width: 1.1),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              StatusBadge.cefr(level),
                              Row(
                                children: [
                                  const Icon(Icons.people_outline, size: 16, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${batch['student_count'] ?? 0} élèves',
                                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Text(
                            batch['name'] ?? 'Cohort sans nom',
                            style: AppTypography.titleSmall.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Du ${batch['start_date'] ?? 'N/A'} au ${batch['end_date'] ?? 'N/A'}',
                            style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),

            const SizedBox(height: 28),

            // Recent Submissions Section
            Text(
              'Dernières Soumissions de Quiz',
              style: AppTypography.titleLarge.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 12),

            if (submissions.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Center(
                  child: Text(
                    'Aucune soumission récente.',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                  ),
                ),
              )
            else
              Container(
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border, width: 1.1),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: submissions.take(6).length,
                  separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
                  itemBuilder: (context, idx) {
                    final sub = submissions[idx];
                    final pct = sub['pct'] as double?;
                    final dt = sub['submittedAt'] as DateTime;
                    final timeAgo = DateFormat('dd/MM HH:mm').format(dt);

                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      leading: CircleAvatar(
                        backgroundColor: AppColors.surfaceSoft,
                        foregroundColor: AppColors.frenchNavy,
                        child: Text(
                          (sub['studentName'] as String).isNotEmpty
                              ? (sub['studentName'] as String)[0].toUpperCase()
                              : '?',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                      title: Text(
                        sub['studentName'] as String,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                      subtitle: Text(
                        '${sub['batchName']} · ${sub['quizTitle']}',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (pct != null) StatusBadge.score(pct),
                          const SizedBox(width: 10),
                          Text(
                            timeAgo,
                            style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPeriodChip(String id, String label) {
    final isSelected = _period == id;
    return GestureDetector(
      onTap: () => setState(() => _period = id),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.pureWhite : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? AppColors.frenchNavy : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}
