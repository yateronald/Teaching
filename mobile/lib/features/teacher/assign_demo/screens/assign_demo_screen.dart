import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/status_badge.dart';
import 'demo_feedback_sheet.dart';

class AssignDemoScreen extends ConsumerStatefulWidget {
  final Function(int tabIndex)? onNavigateTab;

  const AssignDemoScreen({super.key, this.onNavigateTab});

  @override
  ConsumerState<AssignDemoScreen> createState() => _AssignDemoScreenState();
}

class _AssignDemoScreenState extends ConsumerState<AssignDemoScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _demos = [];
  String _selectedBucket =
      'all'; // all, upcoming, to_schedule, completed, cancelled
  String _search = '';

  @override
  void initState() {
    super.initState();
    _fetchDemos();
  }

  Future<void> _fetchDemos() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/demo-requests/my-demos?page=1&limit=500');
      final data = res.data;

      if (mounted) {
        setState(() {
          _demos = (data?['data'] as List?) ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Impossible de charger vos demandes de cours d\'essai.';
          _isLoading = false;
        });
      }
    }
  }

  String _computeBucket(Map<String, dynamic> d) {
    final status = (d['status'] ?? 'new').toString();
    if (status == 'completed') return 'completed';
    if (status == 'cancelled') return 'cancelled';

    final scheduledAtStr = d['demo_scheduled_at'];
    if (scheduledAtStr != null && status == 'demo_scheduled') {
      final dt = DateTime.tryParse(scheduledAtStr);
      if (dt != null &&
          dt.isAfter(DateTime.now().subtract(const Duration(minutes: 90)))) {
        return 'upcoming';
      }
    }
    return 'to_schedule';
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _demos.where((d) {
      final map = d as Map<String, dynamic>;
      final b = _computeBucket(map);

      if (_selectedBucket != 'all' && b != _selectedBucket) return false;

      if (_search.isNotEmpty) {
        final name = (map['full_name'] ?? '').toString().toLowerCase();
        final email = (map['email'] ?? '').toString().toLowerCase();
        final country = (map['country'] ?? '').toString().toLowerCase();
        final q = _search.toLowerCase();
        if (!name.contains(q) && !email.contains(q) && !country.contains(q)) {
          return false;
        }
      }

      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchDemos,
      color: AppColors.frenchNavy,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: ResponsiveLayout.pageInsets(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Text(
              'Cours d\'Essai Assignés (Demos)',
              style: AppTypography.headlineMedium.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Évaluez de nouveaux étudiants, faites passer le test de niveau et rédigez vos recommandations.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 20),

            // Search Bar
            CustomTextField(
              hintText: 'Rechercher par nom, pays ou e-mail...',
              prefixIcon: Icons.search,
              onChanged: (val) => setState(() => _search = val),
            ),
            const SizedBox(height: 16),

            // Buckets bar
            Container(
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                color: AppColors.surfaceSoft,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderSoft),
              ),
              child: Row(
                children: [
                  _buildBucketChip('all', 'Tous (${_demos.length})'),
                  _buildBucketChip('upcoming', 'À venir'),
                  _buildBucketChip('to_schedule', 'À planifier'),
                  _buildBucketChip('completed', 'Terminés'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Content
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
                onAction: _fetchDemos,
              )
            else if (filtered.isEmpty)
              EmptyState(
                title: 'Aucun cours d\'essai',
                message: _search.isNotEmpty
                    ? 'Aucun étudiant ne correspond à cette recherche.'
                    : 'Aucun cours d\'essai dans cette section.',
                icon: Icons.assignment_ind_outlined,
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 14),
                itemBuilder: (context, idx) {
                  final demo = filtered[idx] as Map<String, dynamic>;
                  final name = demo['full_name'] ?? 'Étudiant Démo';
                  final email = demo['email'] ?? '';
                  final country = demo['country'] ?? 'International';
                  final curLevel = demo['current_level'] ?? 'Nouveau';
                  final goalLevel = demo['interested_level'] ?? 'B2';
                  final goals = demo['learning_goals'] ?? '';
                  final status = (demo['status'] ?? 'new').toString();
                  final scheduledAt = demo['demo_scheduled_at'];
                  final dt = scheduledAt != null
                      ? DateTime.tryParse(scheduledAt)
                      : null;
                  final timeLabel = dt != null
                      ? DateFormat('EEEE d MMM à HH:mm', 'fr_FR').format(dt)
                      : 'Non planifié';

                  return Container(
                    padding: const EdgeInsets.all(18),
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
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: AppColors.teacherAccentSoft,
                                  foregroundColor: AppColors.teacherAccent,
                                  child: Text(
                                    name.isNotEmpty
                                        ? name[0].toUpperCase()
                                        : '?',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      name,
                                      style: AppTypography.titleSmall.copyWith(
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.ink,
                                      ),
                                    ),
                                    Text(
                                      '$country · $email',
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            StatusBadge.liveState(status),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // Goal & Level tags
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceSoft,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Niveau : $curLevel → $goalLevel',
                                style: AppTypography.caption,
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (goals.isNotEmpty)
                              Expanded(
                                child: Text(
                                  'Objectif : $goals',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.textMuted,
                                    fontStyle: FontStyle.italic,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              Icons.event_outlined,
                              size: 14,
                              color: AppColors.textSubtle,
                            ),
                            const SizedBox(width: 5),
                            Text(
                              'Séance : $timeLabel',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Actions
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            TextButton.icon(
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  isScrollControlled: true,
                                  backgroundColor: Colors.transparent,
                                  builder: (context) => DemoFeedbackSheet(
                                    demo: demo,
                                    onSaved: _fetchDemos,
                                  ),
                                );
                              },
                              icon: const Icon(
                                Icons.edit_note,
                                size: 18,
                                color: AppColors.teacherAccent,
                              ),
                              label: Text(
                                'Compte-rendu & Notes',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.teacherAccent,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton.icon(
                              onPressed: () {
                                widget.onNavigateTab?.call(
                                  6,
                                ); // Open Live Meetings tab
                              },
                              icon: const Icon(Icons.videocam, size: 16),
                              label: const Text('Démarrer l\'essai'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.frenchNavy,
                                foregroundColor: AppColors.pureWhite,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 8,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
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

  Widget _buildBucketChip(String id, String label) {
    final isSelected = _selectedBucket == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedBucket = id),
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
