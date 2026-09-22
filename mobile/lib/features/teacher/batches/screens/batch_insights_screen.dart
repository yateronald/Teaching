import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';

class BatchInsightsScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> batch;

  const BatchInsightsScreen({super.key, required this.batch});

  @override
  ConsumerState<BatchInsightsScreen> createState() => _BatchInsightsScreenState();
}

class _BatchInsightsScreenState extends ConsumerState<BatchInsightsScreen> {
  bool _isLoading = true;
  String? _error;

  Map<String, dynamic>? _batchMeta;
  List<Map<String, dynamic>> _quizzes = [];
  List<Map<String, dynamic>> _students = [];

  int _passMark = 60;
  String _quizSort = 'order'; // 'order', 'score', 'completion'
  bool _showAllLeaderboard = false;

  final List<int> _passOptions = [40, 50, 60, 70, 75, 80];

  @override
  void initState() {
    super.initState();
    _fetchInsights();
  }

  Future<void> _fetchInsights() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final batchId = widget.batch['id'];
    final client = ref.read(apiClientProvider);

    try {
      final res = await client.get('/batches/$batchId/insights');
      final data = res.data;
      if (mounted) {
        if (data is Map) {
          final batchMap = data['batch'] is Map ? Map<String, dynamic>.from(data['batch']) : null;
          final qList = data['quizzes'] is List
              ? (data['quizzes'] as List).map((e) => Map<String, dynamic>.from(e as Map)).toList()
              : <Map<String, dynamic>>[];
          final sList = data['students'] is List
              ? (data['students'] as List).map((e) => Map<String, dynamic>.from(e as Map)).toList()
              : <Map<String, dynamic>>[];

          setState(() {
            _batchMeta = batchMap;
            _quizzes = qList;
            _students = sList;
            _isLoading = false;
          });
          return;
        }
      }
    } catch (_) {
      // Fallback to basic batch data
      try {
        final res = await client.get('/batches/$batchId');
        final data = res.data;
        if (mounted && data is Map) {
          final sList = data['students'] is List
              ? (data['students'] as List).map((e) => Map<String, dynamic>.from(e as Map)).toList()
              : <Map<String, dynamic>>[];
          setState(() {
            _students = sList;
            _isLoading = false;
          });
          return;
        }
      } catch (err) {
        if (mounted) {
          setState(() {
            _error = 'Impossible de charger les analyses de cette cohorte.';
            _isLoading = false;
          });
        }
      }
    }
  }

  String _gradeFromPercent(double p) {
    if (p >= 90) return 'A+';
    if (p >= 85) return 'A';
    if (p >= 80) return 'A-';
    if (p >= 75) return 'B+';
    if (p >= 70) return 'B';
    if (p >= 65) return 'B-';
    if (p >= 60) return 'C+';
    if (p >= 55) return 'C';
    if (p >= 50) return 'C-';
    return 'F';
  }

  Color _toneColor(double? pct) {
    if (pct == null) return AppColors.textMuted;
    if (pct >= 85) return const Color(0xFF10B981); // Emerald
    if (pct >= 70) return const Color(0xFF3B82F6); // Blue
    if (pct >= _passMark) return const Color(0xFFF59E0B); // Amber
    return const Color(0xFFEF4444); // Red
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
    final batch = _batchMeta ?? widget.batch;
    final name = batch['name'] ?? (isFr ? 'Cohorte' : 'Batch');
    final level = batch['french_level'] ?? 'A1';

    // ── Metric Calculations ──
    final totalExpectedSubmissions = _students.length * (_quizzes.isNotEmpty ? _quizzes.length : 1);
    int totalSubmitted = 0;
    int scoredCount = 0;
    int passCount = 0;
    double scoreSum = 0.0;

    // Student performance structures
    final List<Map<String, dynamic>> computedStudents = [];

    for (final s in _students) {
      final sId = s['id'];
      final sName = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.trim().isNotEmpty
          ? '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.trim()
          : (s['email'] ?? 'Étudiant');

      final breakdown = s['breakdown'] is List ? (s['breakdown'] as List) : [];
      int sSubmissions = 0;
      double sScoreSum = 0.0;

      for (final b in breakdown) {
        sSubmissions++;
        totalSubmitted++;
        final pct = (b['percentage'] as num?)?.toDouble() ??
            ((b['total_score'] as num?) != null && (b['max_score'] as num?) != null && (b['max_score'] as num) > 0
                ? ((b['total_score'] as num).toDouble() / (b['max_score'] as num).toDouble()) * 100
                : null);
        if (pct != null) {
          scoredCount++;
          scoreSum += pct;
          sScoreSum += pct;
          if (pct >= _passMark) passCount++;
        }
      }

      final sAvg = sSubmissions > 0
          ? (sScoreSum / sSubmissions)
          : ((s['avg_percentage'] as num?)?.toDouble() ?? (s['average_score'] as num?)?.toDouble());

      final isAtRisk = (sAvg != null && sAvg < _passMark) ||
          (_quizzes.isNotEmpty && (sSubmissions / _quizzes.length) < 0.5);

      computedStudents.add({
        'id': sId,
        'name': sName,
        'email': s['email'] ?? '',
        'submitted': sSubmissions,
        'avg': sAvg,
        'isAtRisk': isAtRisk,
      });
    }

    final double? classAverage = scoredCount > 0 ? (scoreSum / scoredCount) : null;
    final double completionRate = totalExpectedSubmissions > 0
        ? (totalSubmitted / totalExpectedSubmissions) * 100
        : 0.0;
    final double? passRate = scoredCount > 0 ? (passCount / scoredCount) * 100 : null;
    final atRiskStudents = computedStudents.where((s) => s['isAtRisk'] == true).toList();

    // Ranked students
    final rankedStudents = computedStudents.where((s) => s['avg'] != null).toList()
      ..sort((a, b) => (b['avg'] as double).compareTo(a['avg'] as double));

    // Grade bands
    int countA = 0;
    int countB = 0;
    int countC = 0;
    int countF = 0;

    for (final s in computedStudents) {
      final a = s['avg'] as double?;
      if (a != null) {
        if (a >= 85) {
          countA++;
        } else if (a >= 70) {
          countB++;
        } else if (a >= _passMark) {
          countC++;
        } else {
          countF++;
        }
      }
    }

    final maxBand = [countA, countB, countC, countF, 1].reduce((m, c) => c > m ? c : m);

    // Quiz Stats
    final List<Map<String, dynamic>> quizStats = [];
    for (int i = 0; i < _quizzes.length; i++) {
      final q = _quizzes[i];
      final qId = q['quiz_id'] ?? q['id'];
      final qTitle = q['quiz_title'] ?? q['title'] ?? 'Quiz ${i + 1}';

      final List<double> qPcts = [];
      for (final s in _students) {
        final bList = s['breakdown'] is List ? (s['breakdown'] as List) : [];
        for (final b in bList) {
          if ((b['quiz_id'] ?? b['id']) == qId) {
            final pct = (b['percentage'] as num?)?.toDouble();
            if (pct != null) qPcts.add(pct);
          }
        }
      }

      final qSub = qPcts.length;
      final qExp = _students.length;
      final qComp = qExp > 0 ? (qSub / qExp) * 100 : 0.0;
      final qAvg = qPcts.isNotEmpty ? (qPcts.reduce((a, b) => a + b) / qPcts.length) : (q['avg_percentage'] as num?)?.toDouble();
      final qMin = qPcts.isNotEmpty ? qPcts.reduce((a, b) => a < b ? a : b) : (q['min_percentage'] as num?)?.toDouble();
      final qMax = qPcts.isNotEmpty ? qPcts.reduce((a, b) => a > b ? a : b) : (q['max_percentage'] as num?)?.toDouble();
      final qPass = qPcts.isNotEmpty ? (qPcts.where((p) => p >= _passMark).length / qPcts.length) * 100 : null;

      quizStats.add({
        'id': qId,
        'order': i + 1,
        'title': qTitle,
        'submitted': qSub,
        'expected': qExp,
        'completion': qComp,
        'avg': qAvg,
        'min': qMin,
        'max': qMax,
        'passRate': qPass,
      });
    }

    // Sort quizzes
    final sortedQuizzes = List<Map<String, dynamic>>.from(quizStats);
    if (_quizSort == 'score') {
      sortedQuizzes.sort((a, b) => ((a['avg'] as double?) ?? 101).compareTo((b['avg'] as double?) ?? 101));
    } else if (_quizSort == 'completion') {
      sortedQuizzes.sort((a, b) => (a['completion'] as double).compareTo(b['completion'] as double));
    }

    // Automated Takeaways
    final List<Map<String, dynamic>> takeaways = [];
    if (totalExpectedSubmissions > 0 && completionRate < 70) {
      takeaways.add({
        'tone': completionRate < 50 ? 'bad' : 'warn',
        'title': isFr ? 'Complétion à ${completionRate.round()}%' : 'Completion is ${completionRate.round()}%',
        'text': isFr
            ? '${totalExpectedSubmissions - totalSubmitted} sur $totalExpectedSubmissions soumissions attendues manquent à l\'appel.'
            : '${totalExpectedSubmissions - totalSubmitted} of $totalExpectedSubmissions expected submissions are missing.',
      });
    }
    if (rankedStudents.isNotEmpty) {
      takeaways.add({
        'tone': 'good',
        'title': isFr
            ? '${rankedStudents[0]['name']} mène la cohorte'
            : '${rankedStudents[0]['name']} leads the class',
        'text': isFr
            ? '${(rankedStudents[0]['avg'] as double).round()}% de moyenne sur ${rankedStudents[0]['submitted']} quiz passés.'
            : '${(rankedStudents[0]['avg'] as double).round()}% average over ${rankedStudents[0]['submitted']} quizzes completed.',
      });
    }
    if (atRiskStudents.isNotEmpty) {
      final names = atRiskStudents.take(3).map((s) => s['name']).join(', ');
      final extra = atRiskStudents.length > 3 ? ' et ${atRiskStudents.length - 3} autre(s)' : '';
      takeaways.add({
        'tone': 'bad',
        'title': isFr
            ? '${atRiskStudents.length} apprenant(s) à soutenir'
            : '${atRiskStudents.length} student(s) need support',
        'text': isFr
            ? '$names$extra — note inférieure à $_passMark% ou participation insuffisante.'
            : '$names$extra — below $_passMark% or insufficient quiz submissions.',
      });
    }

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        title: Text(
          isFr ? 'Analytiques de cohorte' : 'Batch Insights',
          style: AppTypography.titleMedium.copyWith(color: AppColors.ink, fontWeight: FontWeight.w700),
        ),
        backgroundColor: AppColors.pureWhite,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.frenchNavy),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.frenchNavy),
            tooltip: isFr ? 'Actualiser' : 'Refresh',
            onPressed: _fetchInsights,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.frenchNavy))
          : _error != null
              ? EmptyState(
                  title: isFr ? 'Erreur' : 'Error',
                  message: _error!,
                  icon: Icons.error_outline,
                  actionText: isFr ? 'Réessayer' : 'Retry',
                  onAction: _fetchInsights,
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── 1. Batch Header & Pass Mark Filter ──
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.teacherAccentSoft,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.insights, color: AppColors.teacherAccent, size: 26),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      StatusBadge.cefr(level),
                                      const SizedBox(width: 8),
                                      Text(
                                        isFr ? 'Bilan & Progression' : 'Academic Overview',
                                        style: AppTypography.caption.copyWith(
                                          color: AppColors.teacherAccent,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    name,
                                    style: AppTypography.titleLarge.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.frenchNavy,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Pass Mark Selector
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceSoft,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    isFr ? 'Seuil : ' : 'Pass mark: ',
                                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                                  ),
                                  DropdownButtonHideUnderline(
                                    child: DropdownButton<int>(
                                      value: _passMark,
                                      isDense: true,
                                      items: _passOptions.map((p) {
                                        return DropdownMenuItem(
                                          value: p,
                                          child: Text('$p%', style: const TextStyle(fontWeight: FontWeight.w700)),
                                        );
                                      }).toList(),
                                      onChanged: (val) {
                                        if (val != null) setState(() => _passMark = val);
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // ── 2. The 4 KPIs ──
                      Row(
                        children: [
                          Expanded(
                            child: _buildKpiCard(
                              label: isFr ? 'Moyenne générale' : 'Class average',
                              value: classAverage != null ? '${classAverage.round()}%' : '—',
                              badge: classAverage != null ? _gradeFromPercent(classAverage) : null,
                              subtext: '$scoredCount ${isFr ? "soumissions notées" : "graded submissions"}',
                              accentColor: _toneColor(classAverage),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildKpiCard(
                              label: isFr ? 'Complétion' : 'Completion',
                              value: '${completionRate.round()}%',
                              progress: completionRate / 100,
                              subtext: '$totalSubmitted / $totalExpectedSubmissions ${isFr ? "soumissions" : "expected"}',
                              accentColor: AppColors.teacherAccent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildKpiCard(
                              label: isFr ? 'Taux de réussite' : 'Pass rate',
                              value: passRate != null ? '${passRate.round()}%' : '—',
                              subtext: isFr
                                  ? '$passCount / $scoredCount à $_passMark% ou +'
                                  : '$passCount / $scoredCount at $_passMark%+',
                              accentColor: const Color(0xFF10B981),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildKpiCard(
                              label: isFr ? 'À soutenir' : 'Need support',
                              value: '${atRiskStudents.length}',
                              subtext: isFr ? 'Sous $_passMark% ou retard' : 'Below $_passMark% or behind',
                              accentColor: atRiskStudents.isNotEmpty ? AppColors.bad : const Color(0xFF10B981),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // ── 3. Key Takeaways & Grade Distribution Grid ──
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Takeaways
                          Expanded(
                            flex: 6,
                            child: Container(
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: AppColors.pureWhite,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.lightbulb_outline, size: 20, color: AppColors.teacherAccent),
                                      const SizedBox(width: 8),
                                      Text(
                                        isFr ? 'Enseignements clés' : 'Key takeaways',
                                        style: AppTypography.titleSmall.copyWith(
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.frenchNavy,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  if (takeaways.isEmpty)
                                    Text(
                                      isFr ? 'Pas assez de soumissions pour tirer des conclusions.' : 'Not enough submissions yet to draw conclusions.',
                                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                    )
                                  else
                                    ...takeaways.map((t) {
                                      final isGood = t['tone'] == 'good';
                                      final isBad = t['tone'] == 'bad';
                                      final icon = isGood
                                          ? Icons.trending_up
                                          : (isBad ? Icons.warning_amber_rounded : Icons.info_outline);
                                      final color = isGood
                                          ? const Color(0xFF10B981)
                                          : (isBad ? const Color(0xFFEF4444) : const Color(0xFFF59E0B));

                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 12),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(6),
                                              decoration: BoxDecoration(
                                                color: color.withValues(alpha: 0.12),
                                                borderRadius: BorderRadius.circular(6),
                                              ),
                                              child: Icon(icon, size: 16, color: color),
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    t['title'],
                                                    style: AppTypography.bodySmall.copyWith(
                                                      fontWeight: FontWeight.w700,
                                                      color: AppColors.ink,
                                                    ),
                                                  ),
                                                  Text(
                                                    t['text'],
                                                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    }),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),

                          // Grade Distribution
                          Expanded(
                            flex: 5,
                            child: Container(
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: AppColors.pureWhite,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.emoji_events_outlined, size: 20, color: AppColors.frenchGold),
                                      const SizedBox(width: 8),
                                      Text(
                                        isFr ? 'Répartition des notes' : 'Grade distribution',
                                        style: AppTypography.titleSmall.copyWith(
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.frenchNavy,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  _buildGradeBandRow('A', '85–100%', countA, maxBand, const Color(0xFF10B981)),
                                  const SizedBox(height: 8),
                                  _buildGradeBandRow('B', '70–84%', countB, maxBand, const Color(0xFF3B82F6)),
                                  const SizedBox(height: 8),
                                  _buildGradeBandRow('C', '$_passMark–69%', countC, maxBand, const Color(0xFFF59E0B)),
                                  const SizedBox(height: 8),
                                  _buildGradeBandRow('F', '< $_passMark%', countF, maxBand, const Color(0xFFEF4444)),
                                  const SizedBox(height: 14),

                                  // Pass/Fail Bar
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: Row(
                                      children: [
                                        if (passCount > 0)
                                          Expanded(
                                            flex: passCount,
                                            child: Container(height: 8, color: const Color(0xFF10B981)),
                                          ),
                                        if (scoredCount - passCount > 0)
                                          Expanded(
                                            flex: scoredCount - passCount,
                                            child: Container(height: 8, color: const Color(0xFFEF4444)),
                                          ),
                                        if (scoredCount == 0)
                                          Expanded(
                                            child: Container(height: 8, color: AppColors.borderSoft),
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '${isFr ? "Reçu" : "Passed"} ($passCount)',
                                        style: AppTypography.caption.copyWith(color: const Color(0xFF10B981), fontWeight: FontWeight.w600),
                                      ),
                                      Text(
                                        '${isFr ? "Sous le seuil" : "Below pass"} (${scoredCount - passCount})',
                                        style: AppTypography.caption.copyWith(color: const Color(0xFFEF4444), fontWeight: FontWeight.w600),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // ── 4. Quiz Performance with Min-Max Spread Bars ──
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.checklist_rounded, size: 20, color: AppColors.teacherAccent),
                                    const SizedBox(width: 8),
                                    Text(
                                      isFr ? 'Performance par quiz' : 'Quiz performance',
                                      style: AppTypography.titleSmall.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.frenchNavy,
                                      ),
                                    ),
                                  ],
                                ),
                                // Sort Segment
                                Row(
                                  children: [
                                    _buildSmallSortChip('order', isFr ? 'Par ordre' : 'In order'),
                                    const SizedBox(width: 6),
                                    _buildSmallSortChip('score', isFr ? 'Score bas' : 'Lowest score'),
                                    const SizedBox(width: 6),
                                    _buildSmallSortChip('completion', isFr ? 'Complétion' : 'Completion'),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),

                            if (sortedQuizzes.isEmpty)
                              Padding(
                                padding: const EdgeInsets.all(16),
                                child: Center(
                                  child: Text(
                                    isFr ? 'Aucun quiz assigné pour le moment.' : 'No quizzes assigned yet.',
                                    style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                                  ),
                                ),
                              )
                            else
                              ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: sortedQuizzes.length,
                                separatorBuilder: (_, index) => const Divider(height: 16, color: AppColors.borderSoft),
                                itemBuilder: (context, idx) {
                                  final q = sortedQuizzes[idx];
                                  final avg = q['avg'] as double?;
                                  final min = q['min'] as double?;
                                  final max = q['max'] as double?;
                                  final pass = q['passRate'] as double?;

                                  return Row(
                                    children: [
                                      // Title & Index
                                      SizedBox(
                                        width: 140,
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '#${q['order']} ${q['title']}',
                                              style: AppTypography.bodySmall.copyWith(
                                                fontWeight: FontWeight.w700,
                                                color: AppColors.ink,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            Text(
                                              '${q['submitted']} / ${q['expected']} ${isFr ? "élèves" : "students"}',
                                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Completion Bar
                                      SizedBox(
                                        width: 90,
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            ClipRRect(
                                              borderRadius: BorderRadius.circular(3),
                                              child: LinearProgressIndicator(
                                                value: (q['completion'] as double) / 100,
                                                minHeight: 6,
                                                backgroundColor: AppColors.surfaceSoft,
                                                valueColor: const AlwaysStoppedAnimation(AppColors.teacherAccent),
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              '${(q['completion'] as double).round()}%',
                                              style: AppTypography.caption.copyWith(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.textMuted,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 16),

                                      // Spread Range Bar (Min to Max with Avg dot & pass mark)
                                      Expanded(
                                        child: Container(
                                          height: 24,
                                          alignment: Alignment.center,
                                          child: LayoutBuilder(
                                            builder: (context, constraints) {
                                              final w = constraints.maxWidth;
                                              final minPos = min != null ? (min / 100) * w : 0.0;
                                              final maxPos = max != null ? (max / 100) * w : 0.0;
                                              final avgPos = avg != null ? (avg / 100) * w : 0.0;
                                              final passPos = (_passMark / 100) * w;

                                              return Stack(
                                                alignment: Alignment.centerLeft,
                                                children: [
                                                  // Base track
                                                  Container(
                                                    width: w,
                                                    height: 4,
                                                    decoration: BoxDecoration(
                                                      color: AppColors.surfaceSoft,
                                                      borderRadius: BorderRadius.circular(2),
                                                    ),
                                                  ),
                                                  // Spread interval
                                                  if (min != null && max != null)
                                                    Positioned(
                                                      left: minPos,
                                                      width: (maxPos - minPos).clamp(2.0, w),
                                                      child: Container(
                                                        height: 4,
                                                        decoration: BoxDecoration(
                                                          color: AppColors.teacherAccent.withValues(alpha: 0.4),
                                                          borderRadius: BorderRadius.circular(2),
                                                        ),
                                                      ),
                                                    ),
                                                  // Pass mark tick
                                                  Positioned(
                                                    left: passPos - 1,
                                                    child: Container(
                                                      width: 2,
                                                      height: 12,
                                                      color: AppColors.border,
                                                    ),
                                                  ),
                                                  // Avg dot
                                                  if (avg != null)
                                                    Positioned(
                                                      left: (avgPos - 5).clamp(0.0, w - 10),
                                                      child: Container(
                                                        width: 10,
                                                        height: 10,
                                                        decoration: BoxDecoration(
                                                          color: _toneColor(avg),
                                                          shape: BoxShape.circle,
                                                          border: Border.all(color: AppColors.pureWhite, width: 1.5),
                                                          boxShadow: [
                                                            BoxShadow(
                                                              color: Colors.black.withValues(alpha: 0.15),
                                                              blurRadius: 2,
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                ],
                                              );
                                            },
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Average Score
                                      SizedBox(
                                        width: 48,
                                        child: Text(
                                          avg != null ? '${avg.round()}%' : '—',
                                          style: AppTypography.bodySmall.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: _toneColor(avg),
                                          ),
                                          textAlign: TextAlign.right,
                                        ),
                                      ),
                                      const SizedBox(width: 10),

                                      // Pass Pill
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: (pass != null && pass >= 70)
                                              ? const Color(0xFF10B981).withValues(alpha: 0.12)
                                              : (pass != null && pass >= 50
                                                  ? const Color(0xFFF59E0B).withValues(alpha: 0.12)
                                                  : const Color(0xFFEF4444).withValues(alpha: 0.12)),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          pass != null ? '${pass.round()}%' : '—',
                                          style: AppTypography.caption.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: (pass != null && pass >= 70)
                                                ? const Color(0xFF10B981)
                                                : (pass != null && pass >= 50
                                                    ? const Color(0xFFF59E0B)
                                                    : const Color(0xFFEF4444)),
                                          ),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                            const SizedBox(height: 12),
                            Text(
                              isFr
                                  ? 'Barre = étendue du score min au score max · Point = moyenne cohorte · Trait vertical = seuil de réussite ($_passMark%).'
                                  : 'Bar = spread from min to max score · Dot = class average · Vertical tick = pass mark ($_passMark%).',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // ── 5. Leaderboard (Classement) ──
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.leaderboard_outlined, size: 20, color: AppColors.teacherAccent),
                                    const SizedBox(width: 8),
                                    Text(
                                      isFr ? 'Classement des apprenants' : 'Learners leaderboard',
                                      style: AppTypography.titleSmall.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.frenchNavy,
                                      ),
                                    ),
                                  ],
                                ),
                                if (rankedStudents.length > 5)
                                  TextButton(
                                    onPressed: () => setState(() => _showAllLeaderboard = !_showAllLeaderboard),
                                    child: Text(
                                      _showAllLeaderboard
                                          ? (isFr ? 'Top 5' : 'Top 5')
                                          : (isFr ? 'Voir les ${rankedStudents.length}' : 'View all ${rankedStudents.length}'),
                                      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 12),

                            if (rankedStudents.isEmpty)
                              Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Text(
                                    isFr ? 'Aucun apprenant noté pour le moment.' : 'No graded students yet.',
                                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                  ),
                                ),
                              )
                            else
                              ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _showAllLeaderboard ? rankedStudents.length : rankedStudents.take(5).length,
                                separatorBuilder: (_, index) => const Divider(height: 12, color: AppColors.borderSoft),
                                itemBuilder: (context, idx) {
                                  final s = rankedStudents[idx];
                                  final rank = idx + 1;
                                  final avg = s['avg'] as double;

                                  Color rankColor = AppColors.frenchNavy;
                                  if (rank == 1) rankColor = const Color(0xFFF59E0B); // Gold
                                  if (rank == 2) rankColor = const Color(0xFF94A3B8); // Silver
                                  if (rank == 3) rankColor = const Color(0xFFB45309); // Bronze

                                  return Row(
                                    children: [
                                      // Rank Badge
                                      Container(
                                        width: 26,
                                        height: 26,
                                        alignment: Alignment.center,
                                        decoration: BoxDecoration(
                                          color: rankColor.withValues(alpha: 0.15),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Text(
                                          '$rank',
                                          style: AppTypography.caption.copyWith(
                                            fontWeight: FontWeight.w800,
                                            color: rankColor,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Avatar initials
                                      CircleAvatar(
                                        radius: 16,
                                        backgroundColor: AppColors.surfaceSoft,
                                        child: Text(
                                          (s['name'] as String).isNotEmpty
                                              ? (s['name'] as String).substring(0, 1).toUpperCase()
                                              : '?',
                                          style: AppTypography.caption.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.frenchNavy,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Name & quizzes count
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              s['name'],
                                              style: AppTypography.bodySmall.copyWith(
                                                fontWeight: FontWeight.w700,
                                                color: AppColors.ink,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            Text(
                                              '${s['submitted']} ${isFr ? "quiz complété(s)" : "completed quizzes"}',
                                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                            ),
                                          ],
                                        ),
                                      ),

                                      // Progress score bar
                                      SizedBox(
                                        width: 100,
                                        child: ClipRRect(
                                          borderRadius: BorderRadius.circular(3),
                                          child: LinearProgressIndicator(
                                            value: (avg / 100).clamp(0.0, 1.0),
                                            minHeight: 6,
                                            backgroundColor: AppColors.surfaceSoft,
                                            valueColor: AlwaysStoppedAnimation(_toneColor(avg)),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),

                                      // Score text
                                      Text(
                                        '${avg.round()}%',
                                        style: AppTypography.bodySmall.copyWith(
                                          fontWeight: FontWeight.w800,
                                          color: _toneColor(avg),
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }

  Widget _buildKpiCard({
    required String label,
    required String value,
    String? badge,
    double? progress,
    required String subtext,
    required Color accentColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text(
                value,
                style: AppTypography.headlineSmall.copyWith(
                  fontWeight: FontWeight.w800,
                  color: AppColors.frenchNavy,
                ),
              ),
              if (badge != null) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: accentColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    badge,
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w800,
                      color: accentColor,
                    ),
                  ),
                ),
              ],
            ],
          ),
          if (progress != null) ...[
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: progress.clamp(0.0, 1.0),
                minHeight: 5,
                backgroundColor: AppColors.surfaceSoft,
                valueColor: AlwaysStoppedAnimation(accentColor),
              ),
            ),
          ],
          const SizedBox(height: 4),
          Text(
            subtext,
            style: AppTypography.caption.copyWith(
              color: AppColors.textMuted,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGradeBandRow(String label, String range, int count, int max, Color color) {
    final double pct = max > 0 ? (count / max) : 0.0;
    return Row(
      children: [
        SizedBox(
          width: 24,
          child: Text(
            label,
            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: color),
          ),
        ),
        SizedBox(
          width: 58,
          child: Text(
            range,
            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
          ),
        ),
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: pct.clamp(0.0, 1.0),
              minHeight: 6,
              backgroundColor: AppColors.surfaceSoft,
              valueColor: AlwaysStoppedAnimation(color),
            ),
          ),
        ),
        const SizedBox(width: 10),
        SizedBox(
          width: 24,
          child: Text(
            '$count',
            textAlign: TextAlign.right,
            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
          ),
        ),
      ],
    );
  }

  Widget _buildSmallSortChip(String sortKey, String label) {
    final isSel = _quizSort == sortKey;
    return GestureDetector(
      onTap: () => setState(() => _quizSort = sortKey),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSel ? AppColors.frenchNavy : AppColors.surfaceSoft,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: AppTypography.caption.copyWith(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: isSel ? AppColors.pureWhite : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}
