import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/kpi_stat_card.dart';
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
  List<dynamic> _studentScores = [];

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
    try {
      final client = ref.read(apiClientProvider);
      // Fetch batch insights or student performance
      final res = await client.get('/insights/batch/$batchId');
      final data = res.data;
      if (mounted) {
        setState(() {
          _studentScores = data is List
              ? data
              : (data?['students'] ?? data?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      // Fallback: fetch batch students directly
      try {
        final client = ref.read(apiClientProvider);
        final res = await client.get('/batches/$batchId/students');
        final data = res.data;
        if (mounted) {
          setState(() {
            _studentScores = data is List ? data : (data?['students'] ?? []);
            _isLoading = false;
          });
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

  @override
  Widget build(BuildContext context) {
    final batch = widget.batch;
    final name = batch['name'] ?? 'Cohorte';
    final level = batch['french_level'] ?? 'A1';

    // Calculate metrics
    int goodCount = 0;
    int warnCount = 0;
    int badCount = 0;
    double totalScoreSum = 0;
    int gradedCount = 0;

    for (final s in _studentScores) {
      final avg = (s['average_score'] as num?)?.toDouble() ??
          (s['score'] as num?)?.toDouble();
      if (avg != null) {
        gradedCount++;
        totalScoreSum += avg;
        if (avg >= 70) {
          goodCount++;
        } else if (avg >= 50) {
          warnCount++;
        } else {
          badCount++;
        }
      }
    }

    final avgBatchScore = gradedCount > 0 ? (totalScoreSum / gradedCount) : null;
    final passRate = gradedCount > 0 ? ((goodCount + warnCount) / gradedCount) * 100 : null;

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        title: Text(
          'Analyses & Performance',
          style: AppTypography.titleMedium.copyWith(color: AppColors.ink),
        ),
        backgroundColor: AppColors.pureWhite,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.frenchNavy),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.frenchNavy))
          : _error != null
              ? EmptyState(
                  title: 'Erreur',
                  message: _error!,
                  icon: Icons.error_outline,
                  actionText: 'Réessayer',
                  onAction: _fetchInsights,
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border, width: 1.1),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.teacherAccentSoft,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.analytics_outlined,
                                  color: AppColors.teacherAccent, size: 28),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      StatusBadge.cefr(level),
                                      const SizedBox(width: 8),
                                      Text(
                                        'Rapport Pédagogique',
                                        style: AppTypography.caption.copyWith(
                                          color: AppColors.teacherAccent,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    name,
                                    style: AppTypography.titleLarge.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.ink,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // KPIs
                      Row(
                        children: [
                          Expanded(
                            child: KpiStatCard(
                              title: 'Moyenne cohorte',
                              value: avgBatchScore != null ? '${avgBatchScore.toStringAsFixed(1)}%' : '—',
                              subtitle: '$gradedCount étudiants évalués',
                              icon: Icons.school_outlined,
                              iconColor: AppColors.toneColor(avgBatchScore),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: KpiStatCard(
                              title: 'Taux de réussite',
                              value: passRate != null ? '${passRate.toStringAsFixed(0)}%' : '—',
                              subtitle: 'Score ≥ 50%',
                              icon: Icons.check_circle_outline,
                              iconColor: AppColors.good,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Distribution Card
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
                            Text(
                              'Répartition des niveaux de maîtrise',
                              style: AppTypography.titleMedium.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.ink,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildDistributionRow('Excellent (≥ 70%)', goodCount, gradedCount, AppColors.good),
                            const SizedBox(height: 10),
                            _buildDistributionRow('En progrès (50 - 69%)', warnCount, gradedCount, AppColors.warn),
                            const SizedBox(height: 10),
                            _buildDistributionRow('À renforcer (< 50%)', badCount, gradedCount, AppColors.bad),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Student breakdown
                      Text(
                        'Résultats individuels',
                        style: AppTypography.titleLarge.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 12),

                      if (_studentScores.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: AppColors.pureWhite,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Center(
                            child: Text('Aucune note enregistrée pour le moment.'),
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
                            itemCount: _studentScores.length,
                            separatorBuilder: (context, index) =>
                                const Divider(height: 1, color: AppColors.borderSoft),
                            itemBuilder: (context, idx) {
                              final st = _studentScores[idx];
                              final fullName =
                                  '${st['first_name'] ?? ''} ${st['last_name'] ?? ''}'.trim();
                              final avg = (st['average_score'] as num?)?.toDouble() ??
                                  (st['score'] as num?)?.toDouble();

                              return ListTile(
                                contentPadding:
                                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                title: Text(
                                  fullName.isNotEmpty ? fullName : (st['email'] ?? 'Étudiant'),
                                  style: AppTypography.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.ink,
                                  ),
                                ),
                                subtitle: Text(
                                  st['email'] ?? '',
                                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                ),
                                trailing: avg != null
                                    ? StatusBadge.score(avg)
                                    : Text('—', style: AppTypography.caption),
                              );
                            },
                          ),
                        ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildDistributionRow(String label, int count, int total, Color color) {
    final pct = total > 0 ? (count / total) : 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTypography.bodySmall.copyWith(color: AppColors.text)),
            Text(
              '$count ($count / $total)',
              style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600, color: color),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: pct,
            backgroundColor: AppColors.surfaceSoft,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 6,
          ),
        ),
      ],
    );
  }
}
