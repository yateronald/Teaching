import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import 'batch_detail_screen.dart';
import 'batch_insights_screen.dart';

class MyBatchesScreen extends ConsumerStatefulWidget {
  const MyBatchesScreen({super.key});

  @override
  ConsumerState<MyBatchesScreen> createState() => _MyBatchesScreenState();
}

class _MyBatchesScreenState extends ConsumerState<MyBatchesScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _batches = [];
  String _selectedStatus = 'all'; // all, active, upcoming, completed
  String _selectedLevel = 'ALL'; // ALL, A1, A2, B1, B2, C1, C2
  String _search = '';

  final List<String> _levels = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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
      // Fetch teacher cohorts
      final res = await client.get('/batches/teacher/${user.id}');
      final data = res.data;
      if (mounted) {
        setState(() {
          _batches = data is List ? data : (data?['batches'] ?? data?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger vos promotions.';
          _isLoading = false;
        });
      }
    }
  }

  String _computeStatus(Map<String, dynamic> b) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final startStr = b['start_date']?.toString();
    final endStr = b['end_date']?.toString();

    final start = startStr != null ? DateTime.tryParse(startStr) : null;
    final end = endStr != null ? DateTime.tryParse(endStr) : null;

    if (start != null && today.isBefore(start)) return 'upcoming';
    if (end != null && today.isAfter(end)) return 'completed';
    return 'active';
  }

  Map<String, dynamic>? _computeProgress(Map<String, dynamic> b, String status) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final startStr = b['start_date']?.toString();
    final endStr = b['end_date']?.toString();

    final start = startStr != null ? DateTime.tryParse(startStr) : null;
    final end = endStr != null ? DateTime.tryParse(endStr) : null;

    if (start == null || end == null || end.isBefore(start)) return null;

    final totalDays = end.difference(start).inDays + 1;
    if (status == 'upcoming') {
      final diff = start.difference(today).inDays;
      return {
        'pct': 0.0,
        'label': diff <= 0 ? 'Commence aujourd\'hui' : 'Débute dans $diff jour${diff > 1 ? "s" : ""}',
        'right': '$totalDays jours au total',
      };
    }
    if (status == 'completed') {
      return {
        'pct': 1.0,
        'label': 'Session terminée',
        'right': '$totalDays jours effectués',
      };
    }

    final doneDays = today.difference(start).inDays + 1;
    final leftDays = totalDays - doneDays;
    final pct = (doneDays / totalDays).clamp(0.02, 1.0);
    return {
      'pct': pct,
      'label': 'Jour $doneDays sur $totalDays',
      'right': leftDays <= 0 ? 'Dernier jour' : '$leftDays jour${leftDays > 1 ? "s" : ""} restant${leftDays > 1 ? "s" : ""}',
    };
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 768;

    final filteredBatches = _batches.where((b) {
      final map = b as Map<String, dynamic>;
      final status = _computeStatus(map);
      if (_selectedStatus != 'all' && status != _selectedStatus) return false;

      final level = (map['french_level'] ?? '').toString().toUpperCase();
      if (_selectedLevel != 'ALL' && level != _selectedLevel) return false;

      if (_search.isNotEmpty) {
        final name = (map['name'] ?? '').toString().toLowerCase();
        if (!name.contains(_search.toLowerCase())) return false;
      }
      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchBatches,
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
            // Screen Title
            Text(
              'Mes Promotions & Cohortes',
              style: AppTypography.headlineMedium.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Gérez vos classes, suivez la progression du calendrier et les résultats des élèves.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),

            // Search Bar
            CustomTextField(
              hintText: 'Rechercher une promotion par nom...',
              prefixIcon: Icons.search,
              onChanged: (val) => setState(() => _search = val),
            ),
            const SizedBox(height: 16),

            // Status Filter Tabs
            Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: AppColors.surfaceSoft,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderSoft),
              ),
              child: Row(
                children: [
                  _buildStatusFilterChip('all', 'Toutes (${_batches.length})'),
                  _buildStatusFilterChip('active', 'En cours'),
                  _buildStatusFilterChip('upcoming', 'À venir'),
                  _buildStatusFilterChip('completed', 'Terminées'),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // CEFR Level Chips
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _levels.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, idx) {
                  final lvl = _levels[idx];
                  final isSelected = _selectedLevel == lvl;
                  return ChoiceChip(
                    label: Text(lvl),
                    selected: isSelected,
                    selectedColor: AppColors.frenchNavy,
                    backgroundColor: AppColors.pureWhite,
                    labelStyle: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w700,
                      color: isSelected ? AppColors.pureWhite : AppColors.textMuted,
                    ),
                    side: BorderSide(
                      color: isSelected ? AppColors.frenchNavy : AppColors.border,
                    ),
                    onSelected: (_) => setState(() => _selectedLevel = lvl),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),

            // Batch List / Grid
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
                onAction: _fetchBatches,
              )
            else if (filteredBatches.isEmpty)
              EmptyState(
                title: 'Aucune cohorte trouvée',
                message: _search.isNotEmpty
                    ? 'Aucune promotion ne correspond à votre recherche.'
                    : 'Aucune promotion dans cette catégorie.',
                icon: Icons.groups_outlined,
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filteredBatches.length,
                separatorBuilder: (context, index) => const SizedBox(height: 14),
                itemBuilder: (context, idx) {
                  final batch = filteredBatches[idx] as Map<String, dynamic>;
                  final level = batch['french_level'] ?? 'A1';
                  final status = _computeStatus(batch);
                  final progress = _computeProgress(batch, status);
                  final studentCount = batch['student_count'] ?? 0;

                  return InkWell(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => BatchDetailScreen(batch: batch),
                        ),
                      );
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(20),
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
                                  StatusBadge.cefr(level),
                                  const SizedBox(width: 8),
                                  StatusBadge.liveState(status),
                                ],
                              ),
                              Row(
                                children: [
                                  const Icon(Icons.people_outline, size: 16, color: AppColors.textMuted),
                                  const SizedBox(width: 4),
                                  Text(
                                    '$studentCount étudiant${studentCount > 1 ? "s" : ""}',
                                    style: AppTypography.caption.copyWith(
                                      color: AppColors.textMuted,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            batch['name'] ?? 'Cohorte sans nom',
                            style: AppTypography.titleMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.ink,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.textSubtle),
                              const SizedBox(width: 6),
                              Text(
                                '${batch['start_date'] ?? "N/A"} → ${batch['end_date'] ?? "N/A"}',
                                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                              ),
                            ],
                          ),
                          if (progress != null) ...[
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  progress['label'] as String,
                                  style: AppTypography.caption.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.ink,
                                  ),
                                ),
                                Text(
                                  progress['right'] as String,
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textSubtle,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: progress['pct'] as double,
                                backgroundColor: AppColors.surfaceSoft,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  status == 'active' ? AppColors.frenchNavy : AppColors.textSubtle,
                                ),
                                minHeight: 6,
                              ),
                            ),
                          ],
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => BatchInsightsScreen(batch: batch),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.insights, size: 16, color: AppColors.teacherAccent),
                                label: Text(
                                  'Insights',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.teacherAccent,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => BatchDetailScreen(batch: batch),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.arrow_forward, size: 16),
                                label: const Text('Roster & Détails'),
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
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusFilterChip(String id, String label) {
    final isSelected = _selectedStatus == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedStatus = id),
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
