import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import 'batch_insights_screen.dart';

class BatchDetailScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> batch;

  const BatchDetailScreen({super.key, required this.batch});

  @override
  ConsumerState<BatchDetailScreen> createState() => _BatchDetailScreenState();
}

class _BatchDetailScreenState extends ConsumerState<BatchDetailScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _students = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final batchId = widget.batch['id'];
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/batches/$batchId/students');
      final data = res.data;
      if (mounted) {
        setState(() {
          _students = data is List ? data : (data?['students'] ?? data?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger les étudiants de cette cohorte.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final batch = widget.batch;
    final level = batch['french_level'] ?? 'A1';
    final name = batch['name'] ?? 'Cohorte';
    final startDate = batch['start_date'] ?? 'N/A';
    final endDate = batch['end_date'] ?? 'N/A';

    final filteredStudents = _students.where((s) {
      final q = _searchQuery.toLowerCase();
      final fn = (s['first_name'] ?? '').toString().toLowerCase();
      final ln = (s['last_name'] ?? '').toString().toLowerCase();
      final em = (s['email'] ?? '').toString().toLowerCase();
      return fn.contains(q) || ln.contains(q) || em.contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        title: Text(name, style: AppTypography.titleMedium.copyWith(color: AppColors.ink)),
        backgroundColor: AppColors.pureWhite,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.frenchNavy),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.insights, color: AppColors.teacherAccent),
            tooltip: 'Analytiques de cohorte',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => BatchInsightsScreen(batch: batch),
                ),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Batch info card
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
                      StatusBadge.cefr(level),
                      CustomButton(
                        text: 'Insights & Notes',
                        icon: Icons.bar_chart,
                        variant: ButtonVariant.secondary,
                        height: 36,
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => BatchInsightsScreen(batch: batch),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    name,
                    style: AppTypography.headlineSmall.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.frenchNavy,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.date_range, size: 16, color: AppColors.textMuted),
                      const SizedBox(width: 6),
                      Text(
                        'Période: du $startDate au $endDate',
                        style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Roster Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Liste des étudiants (${_students.length})',
                  style: AppTypography.titleMedium.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh, size: 20, color: AppColors.textMuted),
                  onPressed: _fetchStudents,
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Search student
            CustomTextField(
              hintText: 'Rechercher par nom ou email...',
              prefixIcon: Icons.search,
              onChanged: (val) => setState(() => _searchQuery = val),
            ),
            const SizedBox(height: 16),

            if (_isLoading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(color: AppColors.frenchNavy),
                ),
              )
            else if (_error != null)
              EmptyState(
                title: 'Erreur',
                message: _error!,
                icon: Icons.error_outline,
                actionText: 'Réessayer',
                onAction: _fetchStudents,
              )
            else if (filteredStudents.isEmpty)
              EmptyState(
                title: 'Aucun étudiant',
                message: _searchQuery.isNotEmpty
                    ? 'Aucun étudiant ne correspond à votre recherche.'
                    : 'Aucun étudiant n\'est encore inscrit dans cette cohorte.',
                icon: Icons.person_off_outlined,
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
                  itemCount: filteredStudents.length,
                  separatorBuilder: (context, index) => const Divider(height: 1, color: AppColors.borderSoft),
                  itemBuilder: (context, idx) {
                    final s = filteredStudents[idx];
                    final fullName = '${s['first_name'] ?? ''} ${s['last_name'] ?? ''}'.trim();
                    final email = s['email'] ?? '';
                    final initial = fullName.isNotEmpty ? fullName[0].toUpperCase() : '?';

                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      leading: CircleAvatar(
                        backgroundColor: AppColors.teacherAccentSoft,
                        foregroundColor: AppColors.teacherAccent,
                        child: Text(
                          initial,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                      title: Text(
                        fullName.isNotEmpty ? fullName : email,
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.ink,
                        ),
                      ),
                      subtitle: Text(
                        email,
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                      trailing: const Icon(Icons.chevron_right, size: 20, color: AppColors.textSubtle),
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
