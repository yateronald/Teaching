import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/authenticated_audio_player.dart';
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
  String _submissionFilter = 'all';
  String _searchQuery = '';

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
        extracted.addAll(
          (data?['submissions'] as List).map(
            (e) => Map<String, dynamic>.from(e as Map),
          ),
        );
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
        const SnackBar(
          content: Text(
            'Cet étudiant n\'a pas encore commencé ou rendu sa copie.',
          ),
        ),
      );
      return;
    }

    final quizId = widget.quiz['id'];
    final sName =
        student['name'] ??
        '${student['first_name'] ?? ''} ${student['last_name'] ?? ''}'.trim();

    final review = _SubmissionReviewSheet(
      quizId: quizId,
      submissionId: (subId as num).toInt(),
      studentName: sName.isNotEmpty ? sName : (student['email'] ?? 'Étudiant'),
      isDialog: MediaQuery.sizeOf(context).width >= 700,
    );

    if (MediaQuery.sizeOf(context).width >= 700) {
      showDialog<void>(
        context: context,
        builder: (context) => Dialog(
          clipBehavior: Clip.antiAlias,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 28,
            vertical: 24,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 920, maxHeight: 900),
            child: review,
          ),
        ),
      );
      return;
    }

    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => review,
    );
  }

  bool _isSubmitted(Map<String, dynamic> submission) => const {
    'submitted',
    'auto_submitted',
    'graded',
  }.contains(submission['status']);

  String _studentName(Map<String, dynamic> submission) {
    final name =
        submission['name'] ??
        '${submission['first_name'] ?? ''} ${submission['last_name'] ?? ''}'
            .trim();
    return name.toString().trim().isEmpty
        ? (submission['email'] ?? 'Étudiant').toString()
        : name.toString();
  }

  double? _submissionPercentage(Map<String, dynamic> submission) {
    final provided = (submission['percentage'] as num?)?.toDouble();
    if (provided != null) return provided;
    final score = (submission['score'] as num?)?.toDouble();
    final maximum = (submission['max_score'] as num?)?.toDouble();
    if (score == null || maximum == null || maximum <= 0) return null;
    return score / maximum * 100;
  }

  StatusBadge _submissionStatusBadge(Map<String, dynamic> submission) {
    final status = submission['status'] ?? 'not_started';
    if (_isSubmitted(submission)) {
      return StatusBadge(
        label: context.isFrench ? 'Remis' : 'Submitted',
        tone: BadgeTone.good,
        icon: Icons.check_circle_outline,
      );
    }
    if (status == 'in_progress') {
      return StatusBadge(
        label: context.isFrench ? 'En cours' : 'In progress',
        tone: BadgeTone.warn,
        icon: Icons.schedule,
      );
    }
    return StatusBadge(
      label: context.isFrench ? 'Non commencé' : 'Not started',
      tone: BadgeTone.neutral,
      icon: Icons.remove_circle_outline,
    );
  }

  Widget _tableLabel(String label, {int flex = 1}) {
    return Expanded(
      flex: flex,
      child: Text(
        label.toUpperCase(),
        style: AppTypography.labelSmall.copyWith(
          color: AppColors.textSubtle,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildSubmissionEntry(
    Map<String, dynamic> submission, {
    required bool wide,
  }) {
    final name = _studentName(submission);
    final email = (submission['email'] ?? '').toString();
    final score = (submission['score'] as num?)?.toDouble();
    final maxScore = (submission['max_score'] as num?)?.toDouble() ?? 0;
    final percentage = _submissionPercentage(submission);
    final submitted = _isSubmitted(submission);
    final batch = (submission['batch_name'] ?? '—').toString();
    final parsedDate = submission['submitted_at'] == null
        ? null
        : DateTime.tryParse(submission['submitted_at'].toString())?.toLocal();
    final date = parsedDate == null
        ? '—'
        : DateFormat('dd MMM · HH:mm').format(parsedDate);

    if (!wide) {
      return InkWell(
        onTap: () => _openSubmissionReview(submission),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: submitted
                        ? AppColors.frenchNavy
                        : AppColors.surfaceSoft,
                    foregroundColor: submitted
                        ? AppColors.pureWhite
                        : AppColors.frenchNavy,
                    child: Text(
                      name.isEmpty ? '?' : name[0].toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 11),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.ink,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          email.isEmpty ? batch : email,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _submissionStatusBadge(submission),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      submitted
                          ? '${score?.toStringAsFixed(1) ?? '—'} / ${maxScore.toStringAsFixed(0)} pts'
                          : batch,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Text(
                    date,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textSubtle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  if (percentage != null)
                    StatusBadge.score(percentage)
                  else
                    const Icon(
                      Icons.chevron_right,
                      color: AppColors.textSubtle,
                    ),
                ],
              ),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: () => _openSubmissionReview(submission),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        child: Row(
          children: [
            Expanded(
              flex: 4,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 19,
                    backgroundColor: submitted
                        ? AppColors.frenchNavy
                        : AppColors.surfaceSoft,
                    foregroundColor: submitted
                        ? AppColors.pureWhite
                        : AppColors.frenchNavy,
                    child: Text(
                      name.isEmpty ? '?' : name[0].toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 11),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.bodyMedium.copyWith(
                            color: AppColors.ink,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        if (email.isNotEmpty)
                          Text(
                            email,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textSubtle,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                batch,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ),
            Expanded(flex: 2, child: _submissionStatusBadge(submission)),
            Expanded(
              flex: 2,
              child: submitted
                  ? Row(
                      children: [
                        if (percentage != null) StatusBadge.score(percentage),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            '${score?.toStringAsFixed(1) ?? '—'} / ${maxScore.toStringAsFixed(0)}',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                        ),
                      ],
                    )
                  : Text('—', style: AppTypography.caption),
            ),
            Expanded(
              flex: 2,
              child: Text(
                date,
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ),
            const SizedBox(
              width: 40,
              child: Icon(
                Icons.arrow_forward_ios_rounded,
                size: 15,
                color: AppColors.textSubtle,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final quiz = widget.quiz;
    final title = quiz['title'] ?? 'Résultats du Quiz';

    final finished = _students
        .where(
          (s) =>
              ['submitted', 'auto_submitted', 'graded'].contains(s['status']),
        )
        .toList();
    final totalAssigned = _students.length;
    final totalSubmitted = finished.length;

    double totalScoreSum = 0;
    int passCount = 0;

    for (final s in finished) {
      final pct =
          (s['percentage'] as num?)?.toDouble() ??
          (((s['score'] as num?)?.toDouble() ?? 0) /
              ((s['max_score'] as num?)?.toDouble() ?? 1) *
              100);
      totalScoreSum += pct;
      if (pct >= 50) passCount++;
    }

    final avgPct = totalSubmitted > 0 ? (totalScoreSum / totalSubmitted) : null;
    final passRate = totalSubmitted > 0
        ? ((passCount / totalSubmitted) * 100)
        : null;
    final completionRate = totalAssigned > 0
        ? ((totalSubmitted / totalAssigned) * 100)
        : null;
    final normalizedQuery = _searchQuery.trim().toLowerCase();
    final visibleStudents = _students.where((student) {
      final matchesQuery =
          normalizedQuery.isEmpty ||
          _studentName(student).toLowerCase().contains(normalizedQuery) ||
          (student['email'] ?? '').toString().toLowerCase().contains(
            normalizedQuery,
          ) ||
          (student['batch_name'] ?? '').toString().toLowerCase().contains(
            normalizedQuery,
          );
      final submitted = _isSubmitted(student);
      final matchesFilter =
          _submissionFilter == 'all' ||
          (_submissionFilter == 'submitted' && submitted) ||
          (_submissionFilter == 'pending' && !submitted);
      return matchesQuery && matchesFilter;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        title: Text(
          context.isFrench ? 'Résultats & Copies' : 'Results & Submissions',
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
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.frenchNavy),
            )
          : _error != null
          ? EmptyState(
              title: context.isFrench ? 'Erreur' : 'Error',
              message: _error!,
              icon: Icons.error_outline,
              actionText: context.isFrench ? 'Réessayer' : 'Retry',
              onAction: _fetchResults,
            )
          : SingleChildScrollView(
              padding: ResponsiveLayout.pageInsets(context),
              child: AdaptiveContent(
                maxWidth: 1180,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Quiz Title Header Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.pureWhite,
                            AppColors.frenchBlue.withValues(alpha: 0.045),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border, width: 1.1),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.frenchNavy.withValues(
                              alpha: 0.035,
                            ),
                            blurRadius: 18,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(11),
                            decoration: BoxDecoration(
                              color: AppColors.frenchNavy,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.analytics_outlined,
                              color: AppColors.pureWhite,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  style: AppTypography.titleLarge.copyWith(
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.frenchNavy,
                                  ),
                                ),
                                const SizedBox(height: 5),
                                Text(
                                  '${quiz['batch_names'] ?? quiz['batch_name'] ?? (context.isFrench ? "Toutes promotions" : "All batches")} · ${context.isFrench ? "Durée" : "Duration"} : ${quiz['duration_minutes'] ?? 30} min',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // KPI Cards
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final columns = constraints.maxWidth >= 900 ? 4 : 2;
                        return GridView.count(
                          crossAxisCount: columns,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          childAspectRatio: columns == 4 ? 1.62 : 1.45,
                          children: [
                            KpiStatCard(
                              title: context.isFrench
                                  ? 'Participation'
                                  : 'Submissions',
                              value: '$totalSubmitted / $totalAssigned',
                              subtitle:
                                  '${completionRate?.toStringAsFixed(0) ?? 0}% ${context.isFrench ? "complété" : "completed"}',
                              icon: Icons.assignment_turned_in_outlined,
                              iconColor: AppColors.frenchBlue,
                              progress: (completionRate ?? 0) / 100,
                              progressColor: AppColors.frenchBlue,
                            ),
                            KpiStatCard(
                              title: context.isFrench
                                  ? 'Moyenne générale'
                                  : 'Class Average',
                              value: avgPct != null
                                  ? '${avgPct.toStringAsFixed(1)}%'
                                  : '—',
                              subtitle:
                                  '${context.isFrench ? "Taux réussite" : "Pass rate"}: ${passRate?.toStringAsFixed(0) ?? "—"}%',
                              icon: Icons.emoji_events_outlined,
                              iconColor: AppColors.toneColor(avgPct),
                              progress: (avgPct ?? 0) / 100,
                              progressColor: AppColors.toneColor(avgPct),
                            ),
                            KpiStatCard(
                              title: context.isFrench
                                  ? 'Taux de réussite'
                                  : 'Pass rate',
                              value: passRate == null
                                  ? '—'
                                  : '${passRate.toStringAsFixed(0)}%',
                              subtitle: '$passCount / $totalSubmitted',
                              icon: Icons.workspace_premium_outlined,
                              iconColor: AppColors.good,
                              progress: (passRate ?? 0) / 100,
                              progressColor: AppColors.good,
                            ),
                            KpiStatCard(
                              title: context.isFrench
                                  ? 'En attente'
                                  : 'Pending',
                              value: '${totalAssigned - totalSubmitted}',
                              subtitle: context.isFrench
                                  ? 'copie${totalAssigned - totalSubmitted > 1 ? 's' : ''} non remise${totalAssigned - totalSubmitted > 1 ? 's' : ''}'
                                  : 'not submitted',
                              icon: Icons.hourglass_empty_rounded,
                              iconColor: AppColors.frenchGold,
                            ),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 24),

                    // Candidates List Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          context.isFrench
                              ? 'Copies des apprenants'
                              : 'Learner submissions',
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                        Text(
                          '${visibleStudents.length} / $totalAssigned',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    LayoutBuilder(
                      builder: (context, constraints) {
                        final search = TextField(
                          onChanged: (value) =>
                              setState(() => _searchQuery = value),
                          decoration: InputDecoration(
                            hintText: context.isFrench
                                ? 'Rechercher un apprenant...'
                                : 'Search learner...',
                            prefixIcon: const Icon(Icons.search, size: 20),
                            isDense: true,
                            filled: true,
                            fillColor: AppColors.pureWhite,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(11),
                              borderSide: const BorderSide(
                                color: AppColors.border,
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(11),
                              borderSide: const BorderSide(
                                color: AppColors.border,
                              ),
                            ),
                          ),
                        );
                        final filters = Wrap(
                          spacing: 7,
                          runSpacing: 7,
                          children: [
                            ChoiceChip(
                              label: Text(context.isFrench ? 'Tous' : 'All'),
                              selected: _submissionFilter == 'all',
                              onSelected: (_) =>
                                  setState(() => _submissionFilter = 'all'),
                            ),
                            ChoiceChip(
                              label: Text(
                                context.isFrench ? 'Remis' : 'Submitted',
                              ),
                              selected: _submissionFilter == 'submitted',
                              onSelected: (_) => setState(
                                () => _submissionFilter = 'submitted',
                              ),
                            ),
                            ChoiceChip(
                              label: Text(
                                context.isFrench ? 'En attente' : 'Pending',
                              ),
                              selected: _submissionFilter == 'pending',
                              onSelected: (_) =>
                                  setState(() => _submissionFilter = 'pending'),
                            ),
                          ],
                        );
                        if (constraints.maxWidth < 650) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              search,
                              const SizedBox(height: 10),
                              filters,
                            ],
                          );
                        }
                        return Row(
                          children: [
                            Expanded(child: search),
                            const SizedBox(width: 14),
                            filters,
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 14),

                    if (_students.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Center(
                          child: Text(
                            'Aucun étudiant inscrit dans les promotions assignées.',
                          ),
                        ),
                      )
                    else if (visibleStudents.isEmpty)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(30),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          children: [
                            const Icon(
                              Icons.search_off_rounded,
                              color: AppColors.textSubtle,
                              size: 30,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              context.isFrench
                                  ? 'Aucune copie ne correspond à ces filtres.'
                                  : 'No submissions match these filters.',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      )
                    else
                      Container(
                        clipBehavior: Clip.antiAlias,
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: AppColors.border,
                            width: 1.1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.025),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: LayoutBuilder(
                          builder: (context, constraints) {
                            final wide = constraints.maxWidth >= 760;
                            return Column(
                              children: [
                                if (wide)
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 18,
                                      vertical: 11,
                                    ),
                                    color: AppColors.surfaceSoft,
                                    child: Row(
                                      children: [
                                        _tableLabel(
                                          context.isFrench
                                              ? 'Apprenant'
                                              : 'Learner',
                                          flex: 4,
                                        ),
                                        _tableLabel(
                                          context.isFrench
                                              ? 'Promotion'
                                              : 'Batch',
                                          flex: 2,
                                        ),
                                        _tableLabel('Statut', flex: 2),
                                        _tableLabel('Score', flex: 2),
                                        _tableLabel(
                                          context.isFrench
                                              ? 'Remis le'
                                              : 'Date',
                                          flex: 2,
                                        ),
                                        const SizedBox(width: 40),
                                      ],
                                    ),
                                  ),
                                ListView.separated(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: visibleStudents.length,
                                  separatorBuilder: (context, index) =>
                                      const Divider(
                                        height: 1,
                                        color: AppColors.borderSoft,
                                      ),
                                  itemBuilder: (context, index) =>
                                      _buildSubmissionEntry(
                                        visibleStudents[index],
                                        wide: wide,
                                      ),
                                ),
                              ],
                            );
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _SubmissionReviewSheet extends ConsumerStatefulWidget {
  final int quizId;
  final int submissionId;
  final String studentName;
  final bool isDialog;

  const _SubmissionReviewSheet({
    required this.quizId,
    required this.submissionId,
    required this.studentName,
    this.isDialog = false,
  });

  @override
  ConsumerState<_SubmissionReviewSheet> createState() =>
      _SubmissionReviewSheetState();
}

class _SubmissionReviewSheetState
    extends ConsumerState<_SubmissionReviewSheet> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _data;
  String _reviewFilter = 'all';

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get(
        '/quizzes/${widget.quizId}/submissions/${widget.submissionId}',
      );
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
      height: widget.isDialog
          ? (MediaQuery.sizeOf(context).height * 0.88).clamp(560.0, 900.0)
          : MediaQuery.of(context).size.height * 0.92,
      decoration: BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: widget.isDialog
            ? BorderRadius.circular(20)
            : const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag handle
          if (!widget.isDialog) ...[
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
          ] else
            const SizedBox(height: 8),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 21,
                  backgroundColor: AppColors.frenchNavy,
                  foregroundColor: AppColors.pureWhite,
                  child: Text(
                    widget.studentName.isEmpty
                        ? '?'
                        : widget.studentName[0].toUpperCase(),
                    style: const TextStyle(fontWeight: FontWeight.w800),
                  ),
                ),
                const SizedBox(width: 11),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.studentName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.titleMedium.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                      Text(
                        'Revue détaillée de la copie',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
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
                ? const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.frenchNavy,
                    ),
                  )
                : _error != null
                ? Center(
                    child: Text(
                      _error!,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.bad,
                      ),
                    ),
                  )
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
    final pct =
        (sub['percentage'] as num?)?.toDouble() ??
        ((totalScore / maxScore) * 100);
    final correctCount = questions
        .where((question) => question is Map && question['is_correct'] == true)
        .length;
    final incorrectCount = questions.length - correctCount;
    final audioClips = <int, Map<String, dynamic>>{};
    for (final raw in (sub['audio_clips'] as List? ?? const [])) {
      if (raw is! Map) continue;
      final clip = Map<String, dynamic>.from(raw);
      final id = (clip['id'] as num?)?.toInt();
      if (id != null) audioClips[id] = clip;
    }

    // Keep the original quiz order while collecting every listening question
    // directly below the audio it belongs to.
    final indexedQuestions = questions.asMap().entries.where((entry) {
      final correct = (entry.value as Map)['is_correct'] == true;
      return _reviewFilter == 'all' ||
          (_reviewFilter == 'correct' && correct) ||
          (_reviewFilter == 'incorrect' && !correct);
    }).toList();
    final orderedQuestions = <MapEntry<int, dynamic>>[];
    final groupedClipIds = <int>{};
    for (final entry in indexedQuestions) {
      final question = entry.value as Map;
      final clipId = (question['audio_clip_id'] as num?)?.toInt();
      if (clipId == null) {
        orderedQuestions.add(entry);
      } else if (groupedClipIds.add(clipId)) {
        orderedQuestions.addAll(
          indexedQuestions.where(
            (candidate) =>
                ((candidate.value as Map)['audio_clip_id'] as num?)?.toInt() ==
                clipId,
          ),
        );
      }
    }
    final shownClipIds = <int>{};

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary score card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.pureWhite,
                  AppColors.frenchBlue.withValues(alpha: 0.045),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 1.1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.frenchNavy,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.assessment_outlined,
                        color: AppColors.pureWhite,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Score global obtenu',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${totalScore.toStringAsFixed(1)} / ${maxScore.toStringAsFixed(0)} pts',
                            style: AppTypography.titleLarge.copyWith(
                              fontWeight: FontWeight.w800,
                              color: AppColors.frenchNavy,
                            ),
                          ),
                        ],
                      ),
                    ),
                    StatusBadge.score(pct),
                  ],
                ),
                const SizedBox(height: 14),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: (pct / 100).clamp(0, 1),
                    minHeight: 7,
                    backgroundColor: AppColors.borderSoft,
                    color: AppColors.toneColor(pct),
                  ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    _reviewMetric(
                      Icons.check_circle_outline,
                      '$correctCount',
                      'Correctes',
                      AppColors.good,
                    ),
                    _reviewMetric(
                      Icons.cancel_outlined,
                      '$incorrectCount',
                      'À revoir',
                      AppColors.bad,
                    ),
                    _reviewMetric(
                      Icons.help_outline,
                      '${questions.length}',
                      'Questions',
                      AppColors.frenchBlue,
                    ),
                    if (audioClips.isNotEmpty)
                      _reviewMetric(
                        Icons.headphones_outlined,
                        '${audioClips.length}',
                        'Audio',
                        AppColors.teacherAccent,
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Row(
            children: [
              Expanded(
                child: Text(
                  'Détail question par question',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
              ),
              Text(
                '${orderedQuestions.length} affichée${orderedQuestions.length > 1 ? 's' : ''}',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              ChoiceChip(
                label: Text('Toutes (${questions.length})'),
                selected: _reviewFilter == 'all',
                onSelected: (_) => setState(() => _reviewFilter = 'all'),
              ),
              ChoiceChip(
                label: Text('Correctes ($correctCount)'),
                selected: _reviewFilter == 'correct',
                onSelected: (_) => setState(() => _reviewFilter = 'correct'),
              ),
              ChoiceChip(
                label: Text('À revoir ($incorrectCount)'),
                selected: _reviewFilter == 'incorrect',
                onSelected: (_) => setState(() => _reviewFilter = 'incorrect'),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (orderedQuestions.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: AppColors.pureWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                'Aucune question dans ce filtre.',
                textAlign: TextAlign.center,
                style: AppTypography.bodySmall.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
            ),

          ...orderedQuestions.map((entry) {
            final idx = entry.key;
            final q = entry.value as Map<String, dynamic>;
            final clipId = (q['audio_clip_id'] as num?)?.toInt();
            final showAudio = clipId != null && shownClipIds.add(clipId);
            final clip = clipId == null ? null : audioClips[clipId];

            final qText = q['question_text'] ?? '';
            final qType = q['question_type'] ?? 'mcq_single';
            final marks = (q['marks'] as num?)?.toDouble() ?? 1;
            final awarded = (q['score'] as num?)?.toDouble() ?? 0;
            final isCorrect = q['is_correct'] == true;
            final explanation = q['explanation'] ?? '';

            final selectedOptions = (q['selected_options'] as List? ?? [])
                .map((e) => (e as num).toInt())
                .toList();
            final options = (q['options'] as List? ?? []);

            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (showAudio)
                  _buildListeningResultHeader(
                    clipId: clipId,
                    clip: clip,
                    questionCount: indexedQuestions
                        .where(
                          (candidate) =>
                              ((candidate.value as Map)['audio_clip_id']
                                      as num?)
                                  ?.toInt() ==
                              clipId,
                        )
                        .length,
                  ),
                Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.pureWhite,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isCorrect
                          ? AppColors.good.withValues(alpha: 0.4)
                          : AppColors.bad.withValues(alpha: 0.4),
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
                                color: isCorrect
                                    ? AppColors.good
                                    : AppColors.bad,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Q${idx + 1}',
                                style: AppTypography.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: isCorrect
                                  ? AppColors.goodBg
                                  : AppColors.badBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${awarded.toStringAsFixed(1)} / ${marks.toStringAsFixed(0)} pt${marks > 1 ? "s" : ""}',
                              style: AppTypography.caption.copyWith(
                                fontWeight: FontWeight.w700,
                                color: isCorrect
                                    ? AppColors.good
                                    : AppColors.bad,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        qText,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 12),

                      if (qType == 'yes_no') ...[
                        _buildYesNoAnswerRow(
                          label: 'Vrai (Oui)',
                          isCorrectTarget:
                              (q['correct_answer'] == 'yes' ||
                              q['correct_answer'] == 'true'),
                          isStudentAnswer: q['answer_text'] == 'yes',
                        ),
                        const SizedBox(height: 6),
                        _buildYesNoAnswerRow(
                          label: 'Faux (Non)',
                          isCorrectTarget:
                              (q['correct_answer'] == 'no' ||
                              q['correct_answer'] == 'false'),
                          isStudentAnswer: q['answer_text'] == 'no',
                        ),
                      ] else ...[
                        ...options.map((opt) {
                          final optId = (opt['id'] as num?)?.toInt();
                          final isCorrectOpt = opt['is_correct'] == true;
                          final isPicked =
                              optId != null && selectedOptions.contains(optId);

                          return Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 8,
                            ),
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
                                      fontWeight: (isCorrectOpt || isPicked)
                                          ? FontWeight.w700
                                          : FontWeight.w400,
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
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.pureWhite,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      'Choix étudiant',
                                      style: AppTypography.caption.copyWith(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w700,
                                      ),
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
                              const Icon(
                                Icons.lightbulb_outline,
                                size: 16,
                                color: AppColors.teacherAccent,
                              ),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  'Explication : $explanation',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _reviewMetric(IconData icon, String value, String label, Color color) {
    return Container(
      constraints: const BoxConstraints(minWidth: 126),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.borderSoft),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 17, color: color),
          const SizedBox(width: 7),
          Text(
            value,
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.ink,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildListeningResultHeader({
    required int clipId,
    required Map<String, dynamic>? clip,
    required int questionCount,
  }) {
    final hasAudio = clip?['has_audio'] == true || clip?['has_audio'] == 1;
    final duration = (clip?['duration_seconds'] as num?)?.toInt();
    return Container(
      margin: const EdgeInsets.only(bottom: 10, top: 4),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.frenchBlue.withValues(alpha: 0.055),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: AppColors.frenchBlue.withValues(alpha: 0.28),
          width: 1.2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: const Icon(
                  Icons.headphones,
                  size: 20,
                  color: AppColors.frenchBlue,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Section d\'écoute',
                      style: AppTypography.bodyMedium.copyWith(
                        color: AppColors.frenchNavy,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    Text(
                      '$questionCount question${questionCount > 1 ? 's' : ''}'
                      '${duration == null ? '' : ' · ${duration}s'}',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (hasAudio)
            AuthenticatedAudioPlayer(
              endpoint: '/quizzes/audio/$clipId/stream',
              title: 'Audio de la section',
            )
          else
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.badBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Le fichier audio n\'est pas disponible.',
                style: AppTypography.caption.copyWith(color: AppColors.bad),
              ),
            ),
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
                fontWeight: (isCorrectTarget || isStudentAnswer)
                    ? FontWeight.w700
                    : FontWeight.w400,
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
                style: AppTypography.caption.copyWith(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
