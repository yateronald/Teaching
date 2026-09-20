import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';

class ExamPrepScreen extends ConsumerStatefulWidget {
  const ExamPrepScreen({super.key});

  @override
  ConsumerState<ExamPrepScreen> createState() => _ExamPrepScreenState();
}

class _ExamPrepScreenState extends ConsumerState<ExamPrepScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _batches = [];
  int? _selectedBatchId;
  List<dynamic> _students = [];
  String _search = '';

  @override
  void initState() {
    super.initState();
    _fetchBatches();
  }

  Future<void> _fetchBatches() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final user = ref.read(authNotifierProvider).user;
    if (user == null) return;

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/batches/teacher/${user.id}');
      final data = res.data;
      final batchList = data is List ? data : (data?['batches'] ?? data?['data'] ?? []);

      if (mounted) {
        setState(() {
          _batches = batchList;
          if (batchList.isNotEmpty) {
            _selectedBatchId = (batchList[0]['id'] as num).toInt();
          }
        });
        if (_selectedBatchId != null) {
          _fetchBatchExamResults(_selectedBatchId!);
        } else {
          setState(() => _isLoading = false);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger vos cohortes.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _fetchBatchExamResults(int batchId) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/exam-results/batch/$batchId');
      final data = res.data;
      if (mounted) {
        setState(() {
          _students = (data?['students'] as List?) ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      // Fallback if exam-results endpoint has different shape
      try {
        final client = ref.read(apiClientProvider);
        final res = await client.get('/batches/$batchId/students');
        final data = res.data;
        if (mounted) {
          setState(() {
            _students = data is List ? data : (data?['students'] ?? []);
            _isLoading = false;
          });
        }
      } catch (_) {
        if (mounted) {
          setState(() {
            _error = 'Impossible de charger les résultats d\'examen.';
            _isLoading = false;
          });
        }
      }
    }
  }

  void _showStudentDrilldown(dynamic student) async {
    final studentId = student['id'];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _StudentExamHistorySheet(
        student: student,
        studentId: studentId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 768;

    final filteredStudents = _students.where((s) {
      if (_search.isEmpty) return true;
      final name = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.toLowerCase();
      final email = (s['email'] ?? '').toString().toLowerCase();
      final q = _search.toLowerCase();
      return name.contains(q) || email.contains(q);
    }).toList();

    return RefreshIndicator(
      onRefresh: () async {
        if (_selectedBatchId != null) {
          await _fetchBatchExamResults(_selectedBatchId!);
        } else {
          await _fetchBatches();
        }
      },
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
            // Screen Header
            Text(
              'Préparation aux Examens (TCF / TEF)',
              style: AppTypography.headlineMedium.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Suivi analytique des 4 compétences clés : CE, CO, EE et EO selon les paliers CECRL.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),

            // Batch Picker Dropdown
            if (_batches.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedBatchId,
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.frenchNavy),
                    items: _batches.map((b) {
                      final id = (b['id'] as num).toInt();
                      final level = b['french_level'] ?? 'A1';
                      return DropdownMenuItem<int>(
                        value: id,
                        child: Row(
                          children: [
                            StatusBadge.cefr(level),
                            const SizedBox(width: 10),
                            Text(
                              b['name'] ?? 'Cohort',
                              style: AppTypography.bodyMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.ink,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: (newId) {
                      if (newId != null && newId != _selectedBatchId) {
                        setState(() => _selectedBatchId = newId);
                        _fetchBatchExamResults(newId);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 4 Skill Overview Tiles
            LayoutBuilder(
              builder: (context, constraints) {
                final count = isTablet ? 4 : 2;
                final spacing = 10.0;
                final w = (constraints.maxWidth - (spacing * (count - 1))) / count;

                return Wrap(
                  spacing: spacing,
                  runSpacing: spacing,
                  children: [
                    _buildSkillCard(
                      w,
                      'CE',
                      'Compr. Écrite',
                      'Pourcentage %',
                      Icons.menu_book_outlined,
                      AppColors.frenchBlue,
                    ),
                    _buildSkillCard(
                      w,
                      'CO',
                      'Compr. Orale',
                      'Pourcentage %',
                      Icons.headphones_outlined,
                      AppColors.teacherAccent,
                    ),
                    _buildSkillCard(
                      w,
                      'EE',
                      'Expr. Écrite',
                      'Noté sur 20',
                      Icons.edit_note_outlined,
                      AppColors.good,
                    ),
                    _buildSkillCard(
                      w,
                      'EO',
                      'Expr. Orale',
                      'Noté sur 20',
                      Icons.mic_none_outlined,
                      AppColors.frenchGold,
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Search Bar
            CustomTextField(
              hintText: 'Rechercher un candidat par nom ou e-mail...',
              prefixIcon: Icons.search,
              onChanged: (val) => setState(() => _search = val),
            ),
            const SizedBox(height: 16),

            // Student Performance Table / List
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
                icon: Icons.error_outline,
                actionText: 'Réessayer',
                onAction: () => _selectedBatchId != null ? _fetchBatchExamResults(_selectedBatchId!) : null,
              )
            else if (filteredStudents.isEmpty)
              EmptyState(
                title: 'Aucun candidat',
                message: _search.isNotEmpty
                    ? 'Aucun étudiant ne correspond à cette recherche.'
                    : 'Aucun résultat d\'examen pour cette promotion.',
                icon: Icons.school_outlined,
              )
            else
              Container(
                decoration: BoxDecoration(
                  color: AppColors.pureWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border, width: 1.1),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: filteredStudents.length,
                  separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
                  itemBuilder: (context, idx) {
                    final s = filteredStudents[idx];
                    final name = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.trim();
                    final email = s['email'] ?? '';

                    final ce = s['ce'] as Map<String, dynamic>?;
                    final co = s['co'] as Map<String, dynamic>?;
                    final ee = s['ee'] as Map<String, dynamic>?;
                    final eo = s['eo'] as Map<String, dynamic>?;

                    return InkWell(
                      onTap: () => _showStudentDrilldown(s),
                      borderRadius: BorderRadius.circular(14),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 18,
                                      backgroundColor: AppColors.frenchNavy.withValues(alpha: 0.08),
                                      foregroundColor: AppColors.frenchNavy,
                                      child: Text(
                                        name.isNotEmpty ? name[0].toUpperCase() : '?',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          name.isNotEmpty ? name : email,
                                          style: AppTypography.bodyMedium.copyWith(
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.ink,
                                          ),
                                        ),
                                        Text(
                                          email,
                                          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const Icon(Icons.chevron_right, size: 20, color: AppColors.textSubtle),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                _buildStudentSkillScore('CE', ce?['avgScore'], '%'),
                                _buildStudentSkillScore('CO', co?['avgScore'], '%'),
                                _buildStudentSkillScore('EE', ee?['avgScore'], '/20'),
                                _buildStudentSkillScore('EO', eo?['avgScore'], '/20'),
                              ],
                            ),
                          ],
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

  Widget _buildSkillCard(double width, String code, String label, String unit, IconData icon, Color color) {
    return SizedBox(
      width: width,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    code,
                    style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: color),
                  ),
                ),
                Icon(icon, size: 18, color: color),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              label,
              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Text(
              unit,
              style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentSkillScore(String code, dynamic val, String unit) {
    final numVal = (val as num?)?.toDouble();
    final isNone = numVal == null;
    final display = isNone ? '—' : unit == '%' ? '${numVal.toStringAsFixed(0)}%' : '${numVal.toStringAsFixed(1)}/20';
    final pct = unit == '%' ? numVal : (numVal != null ? (numVal / 20) * 100 : null);
    final color = AppColors.toneColor(pct);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isNone ? AppColors.surfaceSoft : color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: isNone ? AppColors.borderSoft : color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$code : ',
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
            ),
          ),
          Text(
            display,
            style: AppTypography.caption.copyWith(
              fontWeight: FontWeight.w800,
              color: isNone ? AppColors.textSubtle : color,
            ),
          ),
        ],
      ),
    );
  }
}

class _StudentExamHistorySheet extends ConsumerStatefulWidget {
  final dynamic student;
  final int studentId;

  const _StudentExamHistorySheet({required this.student, required this.studentId});

  @override
  ConsumerState<_StudentExamHistorySheet> createState() => _StudentExamHistorySheetState();
}

class _StudentExamHistorySheetState extends ConsumerState<_StudentExamHistorySheet> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _detail;

  @override
  void initState() {
    super.initState();
    _fetchDetail();
  }

  Future<void> _fetchDetail() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/exam-results/student/${widget.studentId}');
      if (mounted) {
        setState(() {
          _detail = res.data is Map<String, dynamic> ? res.data : null;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _error = 'Historique des examens indisponible.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = '${widget.student['first_name'] ?? ''} ${widget.student['last_name'] ?? ''}'.trim();
    final coAttempts = (_detail?['co'] as List?) ?? [];
    final eeAttempts = (_detail?['ee'] as List?) ?? [];
    final eoAttempts = (_detail?['eo'] as List?) ?? [];

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.frenchPaper,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          Center(
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name.isNotEmpty ? name : 'Détail Candidat',
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                    ),
                    Text(
                      widget.student['email'] ?? '',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
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
                    ? Center(child: Text(_error!))
                    : ListView(
                        padding: const EdgeInsets.all(20),
                        children: [
                          Text('Simulations CO (Compréhension Orale)',
                              style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          if (coAttempts.isEmpty)
                            Text('Aucun passage enregistré.', style: AppTypography.caption)
                          else
                            ...coAttempts.map((att) {
                              final pct = (att['score_percentage'] as num?)?.toDouble() ?? 0;
                              return Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                child: ListTile(
                                  title: Text(att['series_name'] ?? 'Série CO', style: AppTypography.bodyMedium),
                                  subtitle: Text(
                                    '${att['earned_points'] ?? 0}/${att['total_points'] ?? 0} pts · ${att['completed_at'] ?? ""}',
                                    style: AppTypography.caption,
                                  ),
                                  trailing: StatusBadge.score(pct),
                                ),
                              );
                            }),
                          const SizedBox(height: 20),
                          Text('Simulations EE (Expression Écrite)',
                              style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          if (eeAttempts.isEmpty)
                            Text('Aucun passage enregistré.', style: AppTypography.caption)
                          else
                            ...eeAttempts.map((att) {
                              final avg = (att['average_score'] as num?)?.toDouble() ?? 0;
                              return Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                child: ListTile(
                                  title: Text(att['combinaison_name'] ?? 'Sujet EE', style: AppTypography.bodyMedium),
                                  subtitle: Text('Score moyen : ${avg.toStringAsFixed(1)}/20', style: AppTypography.caption),
                                  trailing: StatusBadge.cefr(att['overall_level'] ?? 'B1'),
                                ),
                              );
                            }),
                          const SizedBox(height: 20),
                          Text('Simulations EO (Expression Orale)',
                              style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 8),
                          if (eoAttempts.isEmpty)
                            Text('Aucun passage enregistré.', style: AppTypography.caption)
                          else
                            ...eoAttempts.map((att) {
                              final sc = (att['overall_score'] as num?)?.toDouble() ?? 0;
                              return Card(
                                margin: const EdgeInsets.only(bottom: 8),
                                child: ListTile(
                                  title: Text(att['partie_name'] ?? 'Entretien EO', style: AppTypography.bodyMedium),
                                  subtitle: Text('Note finale : ${sc.toStringAsFixed(1)}/20', style: AppTypography.caption),
                                ),
                              );
                            }),
                        ],
                      ),
          ),
        ],
      ),
    );
  }
}
