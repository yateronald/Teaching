import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import 'quiz_builder_screen.dart';
import 'quiz_results_screen.dart';

class QuizManagementScreen extends ConsumerStatefulWidget {
  const QuizManagementScreen({super.key});

  @override
  ConsumerState<QuizManagementScreen> createState() => _QuizManagementScreenState();
}

class _QuizManagementScreenState extends ConsumerState<QuizManagementScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _quizzes = [];
  String _selectedTab = 'all'; // all, live, scheduled, draft, ended
  String _search = '';

  @override
  void initState() {
    super.initState();
    _fetchQuizzes();
  }

  Future<void> _fetchQuizzes() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/quizzes');
      final data = res.data;
      if (mounted) {
        setState(() {
          _quizzes = data is List ? data : (data?['quizzes'] ?? data?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger vos quiz.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _toggleQuizStatus(Map<String, dynamic> quiz) async {
    final quizId = quiz['id'];
    final currentStatus = quiz['status'] ?? 'draft';
    final newStatus = currentStatus == 'published' ? 'draft' : 'published';

    try {
      final client = ref.read(apiClientProvider);
      await client.patch('/quizzes/$quizId/status', data: {
        'status': newStatus,
      });
      _fetchQuizzes();
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Impossible de modifier le statut du quiz.')),
        );
      }
    }
  }

  Future<void> _deleteQuiz(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer ce quiz ?'),
        content: const Text(
          'Cette action est irréversible. Le quiz, ses questions et les copies d\'étudiants seront définitivement supprimés.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.bad),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Supprimer', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final client = ref.read(apiClientProvider);
      await client.delete('/quizzes/$id');
      _fetchQuizzes();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Quiz supprimé avec succès.')),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Erreur lors de la suppression du quiz.')),
        );
      }
    }
  }

  String _getQuizStatus(Map<String, dynamic> q) {
    if (q['status'] == 'draft') return 'draft';
    final scheduleState = q['schedule_state'];
    if (scheduleState == 'ended') return 'ended';
    if (scheduleState == 'scheduled') return 'scheduled';
    return 'live';
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 768;

    final filtered = _quizzes.where((q) {
      final map = q as Map<String, dynamic>;
      final st = _getQuizStatus(map);
      if (_selectedTab != 'all' && st != _selectedTab) return false;
      if (_search.isNotEmpty) {
        final title = (map['title'] ?? '').toString().toLowerCase();
        final batch = (map['batch_names'] ?? map['batch_name'] ?? '').toString().toLowerCase();
        final qStr = _search.toLowerCase();
        if (!title.contains(qStr) && !batch.contains(qStr)) return false;
      }
      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchQuizzes,
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
            // Header Row: Title & "Créer un Quiz" Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Gestion des Quiz',
                        style: AppTypography.headlineMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Créez des évaluations, générez des questions avec l\'IA et analysez les résultats.',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                CustomButton(
                  text: 'Nouveau Quiz',
                  icon: Icons.add,
                  height: 44,
                  onPressed: () async {
                    final res = await Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const QuizBuilderScreen()),
                    );
                    if (res == true) _fetchQuizzes();
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Search Bar
            CustomTextField(
              hintText: 'Rechercher par titre ou promotion...',
              prefixIcon: Icons.search,
              onChanged: (val) => setState(() => _search = val),
            ),
            const SizedBox(height: 16),

            // Tabs (All, Live, Scheduled, Draft, Ended)
            Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: AppColors.surfaceSoft,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderSoft),
              ),
              child: Row(
                children: [
                  _buildTabChip('all', 'Tous (${_quizzes.length})'),
                  _buildTabChip('live', 'Actifs'),
                  _buildTabChip('scheduled', 'Planifiés'),
                  _buildTabChip('draft', 'Brouillons'),
                  _buildTabChip('ended', 'Clôturés'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Quizzes List
            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(48),
                  child: CircularProgressIndicator(color: AppColors.frenchNavy),
                ),
              )
            else if (_error != null)
              EmptyState(
                title: 'Erreur',
                message: _error!,
                icon: Icons.cloud_off_outlined,
                actionText: 'Réessayer',
                onAction: _fetchQuizzes,
              )
            else if (filtered.isEmpty)
              EmptyState(
                title: 'Aucun quiz',
                message: _search.isNotEmpty
                    ? 'Aucun quiz ne correspond à votre recherche.'
                    : 'Aucun quiz enregistré dans cet onglet.',
                icon: Icons.quiz_outlined,
                actionText: 'Créer un premier quiz',
                onAction: () async {
                  final res = await Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const QuizBuilderScreen()),
                  );
                  if (res == true) _fetchQuizzes();
                },
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14),
                itemBuilder: (context, idx) {
                  final quiz = filtered[idx] as Map<String, dynamic>;
                  final status = _getQuizStatus(quiz);
                  final subsCount = quiz['submitted_students'] ?? quiz['submissions_count'] ?? 0;
                  final totalStudents = quiz['total_students'] ?? 0;
                  final qCount = quiz['total_questions'] ?? (quiz['questions'] as List?)?.length ?? 0;
                  final duration = quiz['duration_minutes'] ?? 30;
                  final totalMarks = quiz['total_marks'];
                  final avgScore = quiz['avg_score'];
                  final batchNames = quiz['batch_names'] ?? quiz['batch_name'] ?? '';

                  return Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border, width: 1.1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                StatusBadge.liveState(status),
                                if (batchNames.toString().isNotEmpty) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceSoft,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      batchNames.toString(),
                                      style: AppTypography.caption.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.frenchNavy,
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            PopupMenuButton<String>(
                              icon: const Icon(Icons.more_horiz, color: AppColors.textMuted),
                              onSelected: (action) async {
                                if (action == 'results') {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => QuizResultsScreen(quiz: quiz)),
                                  );
                                } else if (action == 'edit') {
                                  final res = await Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => QuizBuilderScreen(existingQuiz: quiz)),
                                  );
                                  if (res == true) _fetchQuizzes();
                                } else if (action == 'toggle') {
                                  _toggleQuizStatus(quiz);
                                } else if (action == 'delete') {
                                  _deleteQuiz(quiz['id']);
                                }
                              },
                              itemBuilder: (context) => [
                                const PopupMenuItem(value: 'results', child: Text('Voir les résultats')),
                                const PopupMenuItem(value: 'edit', child: Text('Modifier le quiz')),
                                PopupMenuItem(
                                  value: 'toggle',
                                  child: Text(quiz['status'] == 'published' ? 'Mettre en brouillon' : 'Publier le quiz'),
                                ),
                                const PopupMenuItem(
                                  value: 'delete',
                                  child: Text('Supprimer', style: TextStyle(color: AppColors.bad)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          quiz['title'] ?? 'Quiz sans titre',
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.ink,
                          ),
                        ),
                        if (quiz['description'] != null && (quiz['description'] as String).isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            quiz['description'] as String,
                            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.format_list_numbered, size: 15, color: AppColors.textSubtle),
                            const SizedBox(width: 5),
                            Text('$qCount questions', style: AppTypography.caption),
                            const SizedBox(width: 16),
                            const Icon(Icons.timer_outlined, size: 15, color: AppColors.textSubtle),
                            const SizedBox(width: 5),
                            Text('$duration min', style: AppTypography.caption),
                            if (totalMarks != null) ...[
                              const SizedBox(width: 16),
                              const Icon(Icons.grade_outlined, size: 15, color: AppColors.textSubtle),
                              const SizedBox(width: 5),
                              Text('$totalMarks pts', style: AppTypography.caption),
                            ],
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.people_outline, size: 15, color: AppColors.textSubtle),
                            const SizedBox(width: 5),
                            Text(
                              totalStudents > 0
                                  ? '$subsCount / $totalStudents rendu${subsCount > 1 ? "s" : ""}'
                                  : '$subsCount soumission${subsCount > 1 ? "s" : ""}',
                              style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600),
                            ),
                            if (avgScore != null) ...[
                              const Spacer(),
                              Text(
                                'Moyenne : $avgScore%',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.teacherAccent,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton.icon(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => QuizResultsScreen(quiz: quiz)),
                                );
                              },
                              icon: const Icon(Icons.analytics_outlined, size: 16, color: AppColors.teacherAccent),
                              label: Text(
                                'Résultats ($subsCount)',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.teacherAccent,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              onPressed: () async {
                                final res = await Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => QuizBuilderScreen(existingQuiz: quiz)),
                                );
                                if (res == true) _fetchQuizzes();
                              },
                              icon: const Icon(Icons.edit_outlined, size: 15),
                              label: const Text('Modifier'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.frenchNavy,
                                foregroundColor: AppColors.pureWhite,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabChip(String id, String label) {
    final isSelected = _selectedTab == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedTab = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.pureWhite : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
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
      ),
    );
  }
}
