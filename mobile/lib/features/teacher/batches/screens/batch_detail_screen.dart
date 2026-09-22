import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
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

  String _formatDateRange(dynamic start, dynamic end, bool isFrench) {
    if (start == null && end == null) return isFrench ? 'Dates non définies' : 'Dates not set';
    final sDate = start != null ? DateTime.tryParse(start.toString()) : null;
    final eDate = end != null ? DateTime.tryParse(end.toString()) : null;
    final fmt = DateFormat('d MMM yyyy', isFrench ? 'fr_FR' : 'en_US');
    if (sDate != null && eDate != null) {
      return isFrench ? 'Du ${fmt.format(sDate)} au ${fmt.format(eDate)}' : '${fmt.format(sDate)} - ${fmt.format(eDate)}';
    } else if (sDate != null) {
      return isFrench ? 'À partir du ${fmt.format(sDate)}' : 'From ${fmt.format(sDate)}';
    }
    return start?.toString() ?? '';
  }

  Future<void> _fetchStudents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final batchId = widget.batch['id'];
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/batches/$batchId');
      final data = res.data;
      if (mounted) {
        final list = data is Map ? (data['students'] ?? data['batch']?['students'] ?? data['data']) : data;
        setState(() {
          _students = list is List ? list : [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = context.isFrench ? 'Impossible de charger les étudiants de cette cohorte.' : 'Could not load the students for this batch.';
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
                        text: context.isFrench ? 'Aperçu & Notes' : 'Insights & Notes',
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
                      Expanded(
                        child: Text(
                          _formatDateRange(startDate, endDate, context.isFrench),
                          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                          overflow: TextOverflow.ellipsis,
                        ),
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
                  context.isFrench ? 'Liste des étudiants (${_students.length})' : 'Student List (${_students.length})',
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
              hintText: context.isFrench ? 'Rechercher par nom ou email...' : 'Search by name or email...',
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
                title: context.isFrench ? 'Erreur' : 'Error',
                message: _error!,
                icon: Icons.error_outline,
                actionText: context.isFrench ? 'Réessayer' : 'Retry',
                onAction: _fetchStudents,
              )
            else if (filteredStudents.isEmpty)
              EmptyState(
                title: context.isFrench ? 'Aucun étudiant' : 'No students',
                message: _searchQuery.isNotEmpty
                    ? (context.isFrench ? 'Aucun étudiant ne correspond à votre recherche.' : 'No students match your search.')
                    : (context.isFrench ? 'Aucun étudiant n\'est encore inscrit dans cette cohorte.' : 'No students enrolled in this cohort yet.'),
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
