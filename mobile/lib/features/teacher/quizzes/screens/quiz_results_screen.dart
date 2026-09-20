import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/kpi_stat_card.dart';
import '../../../../core/widgets/status_badge.dart';

class QuizResultsScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> quiz;

  const QuizResultsScreen({super.key, required this.quiz});

  @override
  ConsumerState<QuizResultsScreen> createState() => _QuizResultsScreenState();
}

class _QuizResultsScreenState extends ConsumerState<QuizResultsScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _students = [];

  @override
  void initState() {
    super.initState();
    _fetchResults();
  }

  Future<void> _fetchResults() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final quizId = widget.quiz['id'];
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/quizzes/$quizId/results');
      final data = res.data;

      final List<Map<String, dynamic>> extracted = [];
      if (data is Map<String, dynamic>) {
        final batchResults = data['batch_results'] as List? ?? [];
        for (final b in batchResults) {
          final bName = b['batch_name'] ?? 'Cohort';
          final sList = b['students'] as List? ?? [];
          for (final s in sList) {
            if (s is Map) {
              final map = Map<String, dynamic>.from(s);
              map['batch_name'] = bName;
              extracted.add(map);
            }
          }
        }
      }

      if (extracted.isEmpty && data is List) {
        extracted.addAll(data.map((e) => Map<String, dynamic>.from(e as Map)));
      } else if (extracted.isEmpty && data?['submissions'] is List) {
        extracted.addAll((data?['submissions'] as List).map((e) => Map<String, dynamic>.from(e as Map)));
      }

      if (mounted) {
        setState(() {
          _students = extracted;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger les résultats de ce quiz.';
          _isLoading = false;
        });
      }
    }
  }

  void _openSubmissionReview(Map<String, dynamic> student) {
    final subId = student['submission_id'];
    if (subId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cet étudiant n\'a pas encore commencé ou rendu sa copie.')),
      );
      return;
    }

    final quizId = widget.quiz['id'];
    final sName = student['name'] ?? '${student['first_name'] ?? ''} ${student['last_name'] ?? ''}'.trim();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _SubmissionReviewSheet(
        quizId: quizId,
        submissionId: (subId as num).toInt(),
        studentName: sName.isNotEmpty ? sName : (student['email'] ?? 'Étudiant'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final quiz = widget.quiz;
    final title = quiz['title'] ?? 'Résultats du Quiz';

    final finished = _students.where((s) => ['submitted', 'auto_submitted', 'graded'].contains(s['status'])).toList();
    final totalAssigned = _students.length;
    final totalSubmitted = finished.length;

    double totalScoreSum = 0;
    int passCount = 0;

    for (final s in finished) {
      final pct = (s['percentage'] as num?)?.toDouble() ??
          (((s['score'] as num?)?.toDouble() ?? 0) / ((s['max_score'] as num?)?.toDouble() ?? 1) * 100);
      totalScoreSum += pct;
      if (pct >= 50) passCount++;
    }

    final avgPct = totalSubmitted > 0 ? (totalScoreSum / totalSubmitted) : null;
    final passRate = totalSubmitted > 0 ? ((passCount / totalSubmitted) * 100) : null;
    final completionRate = totalAssigned > 0 ? ((totalSubmitted / totalAssigned) * 100) : null;

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        title: Text('Résultats & Copies', style: AppTypography.titleMedium.copyWith(color: AppColors.ink)),
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
                  onAction: _fetchResults,
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Quiz Title Header Card
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
                              title,
                              style: AppTypography.titleLarge.copyWith(
                                fontWeight: FontWeight.w700,
                                color: AppColors.frenchNavy,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              '${quiz['batch_names'] ?? quiz['batch_name'] ?? "Toutes promotions"} · Durée : ${quiz['duration_minutes'] ?? 30} min',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // KPI Cards
                      Row(
                        children: [
                          Expanded(
                            child: KpiStatCard(
                              title: 'Participation',
                              value: '$totalSubmitted / $totalAssigned',
                              subtitle: '${completionRate?.toStringAsFixed(0) ?? 0}% complété',
                              icon: Icons.assignment_turned_in_outlined,
                              iconColor: AppColors.frenchBlue,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: KpiStatCard(
                              title: 'Moyenne générale',
                              value: avgPct != null ? '${avgPct.toStringAsFixed(1)}%' : '—',
                              subtitle: 'Taux réussite: ${passRate?.toStringAsFixed(0) ?? "—"}%',
                              icon: Icons.emoji_events_outlined,
                              iconColor: AppColors.toneColor(avgPct),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Candidates List Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Copies des apprenants ($totalAssigned)',
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                          ),
                          Text(
                            'Tapez pour inspecter',
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      if (_students.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(32),
                          decoration: BoxDecoration(
                            color: AppColors.pureWhite,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Center(
                            child: Text('Aucun étudiant inscrit dans les promotions assignées.'),
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
                            itemCount: _students.length,
                            separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
                            itemBuilder: (context, idx) {
                              final sub = _students[idx];
                              final sName = sub['name'] ?? '${sub['first_name'] ?? ''} ${sub['last_name'] ?? ''}'.trim();
                              final email = sub['email'] ?? '';
                              final score = (sub['score'] as num?)?.toDouble();
                              final maxScore = (sub['max_score'] as num?)?.toDouble() ?? 20;
                              final pct = (sub['percentage'] as num?)?.toDouble();
                              final dtStr = sub['submitted_at'];
                              final dt = dtStr != null ? DateTime.tryParse(dtStr) : null;
                              final timeLabel = dt != null ? DateFormat('dd MMM HH:mm').format(dt) : '';
                              final st = sub['status'] ?? 'not_started';
                              final isSubmitted = ['submitted', 'auto_submitted', 'graded'].contains(st);

                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                onTap: () => _openSubmissionReview(sub),
                                leading: CircleAvatar(
                                  backgroundColor: isSubmitted ? AppColors.frenchNavy : AppColors.surfaceSoft,
                                  foregroundColor: isSubmitted ? AppColors.pureWhite : AppColors.frenchNavy,
                                  child: Text(
                                    sName.isNotEmpty ? sName[0].toUpperCase() : '?',
                                    style: const TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ),
                                title: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        sName.isNotEmpty ? sName : email,
                                        style: AppTypography.bodyMedium.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.ink,
                                        ),
                                      ),
                                    ),
                                    if (sub['batch_name'] != null) ...[
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.surfaceSoft,
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          sub['batch_name'],
                                          style: AppTypography.caption.copyWith(fontSize: 10, color: AppColors.textMuted),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                subtitle: Text(
                                  isSubmitted
                                      ? 'Note : ${score?.toStringAsFixed(1) ?? "—"} / ${maxScore.toStringAsFixed(0)} · $timeLabel'
                                      : st == 'in_progress'
                                          ? 'En cours de passation...'
                                          : 'Non commencé',
                                  style: AppTypography.caption.copyWith(
                                    color: isSubmitted ? AppColors.textMuted : AppColors.teacherAccent,
                                  ),
                                ),
                                trailing: isSubmitted && pct != null
                                    ? StatusBadge.score(pct)
                                    : Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: st == 'in_progress' ? AppColors.frenchGoldBg : AppColors.surfaceSoft,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          st == 'in_progress' ? 'En cours' : 'Non remis',
                                          style: AppTypography.caption.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: st == 'in_progress' ? AppColors.frenchGold : AppColors.textMuted,
                                          ),
                                        ),
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
}

class _SubmissionReviewSheet extends ConsumerStatefulWidget {
  final int quizId;
  final int submissionId;
  final String studentName;

  const _SubmissionReviewSheet({
    required this.quizId,
    required this.submissionId,
    required this.studentName,
  });

  @override
  ConsumerState<_SubmissionReviewSheet> createState() => _SubmissionReviewSheetState();
}

class _SubmissionReviewSheetState extends ConsumerState<_SubmissionReviewSheet> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/quizzes/${widget.quizId}/submissions/${widget.submissionId}');
      if (mounted) {
        setState(() {
          _data = res.data is Map ? Map<String, dynamic>.from(res.data) : null;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger les réponses de cette copie.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.90,
      decoration: const BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 12),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.studentName,
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.frenchNavy,
                      ),
                    ),
                    Text(
                      'Revue de la copie',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textMuted),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.frenchNavy))
                : _error != null
                    ? Center(child: Text(_error!, style: AppTypography.caption.copyWith(color: AppColors.bad)))
                    : _buildReviewContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewContent() {
    final sub = _data;
    if (sub == null) return const SizedBox.shrink();

    final questions = (sub['questions'] as List? ?? []);
    final totalScore = (sub['total_score'] as num?)?.toDouble() ?? 0;
    final maxScore = (sub['max_score'] as num?)?.toDouble() ?? 20;
    final pct = (sub['percentage'] as num?)?.toDouble() ?? ((totalScore / maxScore) * 100);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary score card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border, width: 1.1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Score global obtenu',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${totalScore.toStringAsFixed(1)} / ${maxScore.toStringAsFixed(0)} pts',
                      style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800, color: AppColors.frenchNavy),
                    ),
                  ],
                ),
                StatusBadge.score(pct),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'Détail question par question (${questions.length})',
            style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
          ),
          const SizedBox(height: 12),

          ...questions.asMap().entries.map((entry) {
            final idx = entry.key;
            final q = entry.value as Map<String, dynamic>;

            final qText = q['question_text'] ?? '';
            final qType = q['question_type'] ?? 'mcq_single';
            final marks = (q['marks'] as num?)?.toDouble() ?? 1;
            final awarded = (q['score'] as num?)?.toDouble() ?? 0;
            final isCorrect = q['is_correct'] == true;
            final explanation = q['explanation'] ?? '';

            final selectedOptions = (q['selected_options'] as List? ?? []).map((e) => (e as num).toInt()).toList();
            final options = (q['options'] as List? ?? []);

            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.pureWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isCorrect ? AppColors.good.withValues(alpha: 0.4) : AppColors.bad.withValues(alpha: 0.4),
                  width: 1.2,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            isCorrect ? Icons.check_circle : Icons.cancel,
                            color: isCorrect ? AppColors.good : AppColors.bad,
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Q${idx + 1}',
                            style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isCorrect ? AppColors.goodBg : AppColors.badBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '${awarded.toStringAsFixed(1)} / ${marks.toStringAsFixed(0)} pt${marks > 1 ? "s" : ""}',
                          style: AppTypography.caption.copyWith(
                            fontWeight: FontWeight.w700,
                            color: isCorrect ? AppColors.good : AppColors.bad,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    qText,
                    style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600, color: AppColors.ink),
                  ),
                  const SizedBox(height: 12),

                  if (qType == 'yes_no') ...[
                    _buildYesNoAnswerRow(
                      label: 'Vrai (Oui)',
                      isCorrectTarget: (q['correct_answer'] == 'yes' || q['correct_answer'] == 'true'),
                      isStudentAnswer: q['answer_text'] == 'yes',
                    ),
                    const SizedBox(height: 6),
                    _buildYesNoAnswerRow(
                      label: 'Faux (Non)',
                      isCorrectTarget: (q['correct_answer'] == 'no' || q['correct_answer'] == 'false'),
                      isStudentAnswer: q['answer_text'] == 'no',
                    ),
                  ] else ...[
                    ...options.map((opt) {
                      final optId = (opt['id'] as num?)?.toInt();
                      final isCorrectOpt = opt['is_correct'] == true;
                      final isPicked = optId != null && selectedOptions.contains(optId);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: isCorrectOpt
                              ? AppColors.goodBg
                              : isPicked
                                  ? AppColors.badBg
                                  : AppColors.surfaceSoft,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isCorrectOpt
                                ? AppColors.good
                                : isPicked
                                    ? AppColors.bad
                                    : AppColors.border,
                            width: (isCorrectOpt || isPicked) ? 1.2 : 0.8,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              isCorrectOpt
                                  ? Icons.check_circle
                                  : isPicked
                                      ? Icons.close
                                      : Icons.radio_button_unchecked,
                              size: 16,
                              color: isCorrectOpt
                                  ? AppColors.good
                                  : isPicked
                                      ? AppColors.bad
                                      : AppColors.textSubtle,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                opt['option_text'] ?? '',
                                style: AppTypography.caption.copyWith(
                                  fontWeight: (isCorrectOpt || isPicked) ? FontWeight.w700 : FontWeight.w400,
                                  color: isCorrectOpt
                                      ? AppColors.good
                                      : isPicked
                                          ? AppColors.bad
                                          : AppColors.text,
                                ),
                              ),
                            ),
                            if (isPicked) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.pureWhite,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Choix étudiant',
                                  style: AppTypography.caption.copyWith(fontSize: 10, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    }),
                  ],

                  if (explanation.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSoft,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.lightbulb_outline, size: 16, color: AppColors.teacherAccent),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Explication : $explanation',
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildYesNoAnswerRow({
    required String label,
    required bool isCorrectTarget,
    required bool isStudentAnswer,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: isCorrectTarget
            ? AppColors.goodBg
            : isStudentAnswer
                ? AppColors.badBg
                : AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isCorrectTarget
              ? AppColors.good
              : isStudentAnswer
                  ? AppColors.bad
                  : AppColors.border,
          width: (isCorrectTarget || isStudentAnswer) ? 1.2 : 0.8,
        ),
      ),
      child: Row(
        children: [
          Icon(
            isCorrectTarget
                ? Icons.check_circle
                : isStudentAnswer
                    ? Icons.close
                    : Icons.radio_button_unchecked,
            size: 16,
            color: isCorrectTarget
                ? AppColors.good
                : isStudentAnswer
                    ? AppColors.bad
                    : AppColors.textSubtle,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: AppTypography.caption.copyWith(
                fontWeight: (isCorrectTarget || isStudentAnswer) ? FontWeight.w700 : FontWeight.w400,
                color: isCorrectTarget
                    ? AppColors.good
                    : isStudentAnswer
                        ? AppColors.bad
                        : AppColors.text,
              ),
            ),
          ),
          if (isStudentAnswer) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.pureWhite,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Choix étudiant',
                style: AppTypography.caption.copyWith(fontSize: 10, fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
