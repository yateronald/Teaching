import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/sliver_sticky_header_delegate.dart';
import 'quiz_builder_screen.dart';
import 'quiz_results_screen.dart';

class QuizManagementScreen extends ConsumerStatefulWidget {
  const QuizManagementScreen({super.key});

  @override
  ConsumerState<QuizManagementScreen> createState() =>
      _QuizManagementScreenState();
}

class _QuizManagementScreenState extends ConsumerState<QuizManagementScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _quizzes = [];
  String _selectedTab = 'all'; // all, live, scheduled, draft, ended
  String _statusFilterDropdown = 'all'; // all, live, scheduled, draft, ended
  String _search = '';
  String _viewMode = 'grid'; // grid, table
  String _sortBy = 'recent'; // recent, oldest, title

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
          _quizzes = data is List
              ? data
              : (data?['quizzes'] ?? data?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = context.isFrench
              ? 'Impossible de charger vos quiz.'
              : 'Failed to load quizzes.';
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
      await client.patch(
        '/quizzes/$quizId/status',
        data: {'status': newStatus},
      );
      _fetchQuizzes();
    } catch (err) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.isFrench
                  ? 'Impossible de modifier le statut du quiz.'
                  : 'Failed to update quiz status.',
            ),
          ),
        );
      }
    }
  }

  Future<void> _deleteQuiz(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          context.isFrench ? 'Supprimer ce quiz ?' : 'Delete this quiz?',
        ),
        content: Text(
          context.isFrench
              ? 'Cette action est irréversible. Le quiz, ses questions et les copies d\'étudiants seront définitivement supprimés.'
              : 'This action cannot be undone. The quiz and student submissions will be permanently deleted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(context.isFrench ? 'Annuler' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.bad),
            onPressed: () => Navigator.pop(context, true),
            child: Text(
              context.isFrench ? 'Supprimer' : 'Delete',
              style: const TextStyle(color: Colors.white),
            ),
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
          SnackBar(
            content: Text(
              context.isFrench
                  ? 'Quiz supprimé avec succès.'
                  : 'Quiz deleted successfully.',
            ),
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              context.isFrench
                  ? 'Erreur lors de la suppression du quiz.'
                  : 'Error deleting quiz.',
            ),
          ),
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
    final isFr = context.isFrench;

    // Filter list
    final filtered = _quizzes.where((q) {
      final map = q as Map<String, dynamic>;
      final st = _getQuizStatus(map);
      if (_selectedTab != 'all' && st != _selectedTab) return false;
      if (_statusFilterDropdown != 'all' && st != _statusFilterDropdown) {
        return false;
      }
      if (_search.isNotEmpty) {
        final title = (map['title'] ?? '').toString().toLowerCase();
        final batch = (map['batch_names'] ?? map['batch_name'] ?? '')
            .toString()
            .toLowerCase();
        final tag = (map['category'] ?? '').toString().toLowerCase();
        final qStr = _search.toLowerCase();
        if (!title.contains(qStr) &&
            !batch.contains(qStr) &&
            !tag.contains(qStr)) {
          return false;
        }
      }
      return true;
    }).toList();

    // Sort list
    filtered.sort((a, b) {
      final aMap = a as Map<String, dynamic>;
      final bMap = b as Map<String, dynamic>;
      if (_sortBy == 'title') {
        final aTitle = (aMap['title'] ?? '').toString();
        final bTitle = (bMap['title'] ?? '').toString();
        return aTitle.compareTo(bTitle);
      }
      final aCreated = DateTime.tryParse(aMap['created_at']?.toString() ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0);
      final bCreated = DateTime.tryParse(bMap['created_at']?.toString() ?? '') ??
          DateTime.fromMillisecondsSinceEpoch(0);
      if (_sortBy == 'oldest') {
        return aCreated.compareTo(bCreated);
      }
      return bCreated.compareTo(aCreated);
    });

    // Compute KPI counts
    int totalCount = _quizzes.length;
    int liveCount = 0;
    int scheduledCount = 0;
    int draftCount = 0;
    int endedCount = 0;

    for (final item in _quizzes) {
      if (item is Map<String, dynamic>) {
        final st = _getQuizStatus(item);
        if (st == 'live') liveCount++;
        if (st == 'scheduled') scheduledCount++;
        if (st == 'draft') draftCount++;
        if (st == 'ended') endedCount++;
      }
    }

    double computeStickyHeight(double width) {
      if (width >= 800) return 108.0;
      if (width >= 700) return 152.0;
      return 208.0;
    }

    final insets = ResponsiveLayout.pageInsets(context);
    final width = MediaQuery.of(context).size.width;

    return RefreshIndicator(
      onRefresh: _fetchQuizzes,
      color: AppColors.frenchNavy,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // 1. Header & KPI Section (Scrolls away)
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(insets.left, insets.top, insets.right, 0),
              child: AdaptiveContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(isFr),
                    const SizedBox(height: 18),
                    _buildKpiSection(
                      isFr: isFr,
                      total: totalCount,
                      live: liveCount,
                      scheduled: scheduledCount,
                      ended: endedCount,
                    ),
                    const SizedBox(height: 14),
                  ],
                ),
              ),
            ),
          ),

          // 2. Sticky Search & Filter Controls (Pins to top on scroll)
          SliverPersistentHeader(
            pinned: true,
            delegate: SliverStickyHeaderDelegate(
              height: computeStickyHeight(width),
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  border: const Border(
                    bottom: BorderSide(color: AppColors.borderSoft, width: 1),
                  ),
                ),
                padding: EdgeInsets.fromLTRB(insets.left, 4, insets.right, 8),
                alignment: Alignment.center,
                child: AdaptiveContent(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildSearchAndControlsRow(isFr),
                      const SizedBox(height: 10),
                      _buildFilterAndSortRow(
                        isFr: isFr,
                        total: totalCount,
                        live: liveCount,
                        scheduled: scheduledCount,
                        draft: draftCount,
                        ended: endedCount,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 3. Quiz List or Grid
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(insets.left, 16, insets.right, insets.bottom),
              child: AdaptiveContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_isLoading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(48),
                          child: CircularProgressIndicator(color: AppColors.frenchNavy),
                        ),
                      )
                    else if (_error != null)
                      EmptyState(
                        title: isFr ? 'Erreur' : 'Error',
                        message: _error!,
                        icon: Icons.cloud_off_outlined,
                        actionText: isFr ? 'Réessayer' : 'Retry',
                        onAction: _fetchQuizzes,
                      )
                    else if (filtered.isEmpty)
                      EmptyState(
                        title: isFr ? 'Aucun quiz' : 'No quizzes found',
                        message: _search.isNotEmpty
                            ? (isFr
                                ? 'Aucun quiz ne correspond à votre recherche.'
                                : 'No quizzes match your search.')
                            : (isFr
                                ? 'Aucun quiz enregistré dans cet onglet.'
                                : 'No quizzes found in this tab.'),
                        icon: Icons.quiz_outlined,
                        actionText: isFr ? 'Créer un premier quiz' : 'Create first quiz',
                        onAction: () async {
                          final res = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const QuizBuilderScreen(),
                            ),
                          );
                          if (res == true) _fetchQuizzes();
                        },
                      )
                    else
                      LayoutBuilder(
                        builder: (context, constraints) {
                          if (_viewMode == 'table') {
                            return _buildTableView(filtered, isFr);
                          }
                          return _buildGridView(filtered, constraints.maxWidth, isFr);
                        },
                      ),

                    // 4. Footer: "Affichage de X sur Y quiz"
                    if (!_isLoading && _error == null && filtered.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      Center(
                        child: Text(
                          isFr
                              ? 'Affichage de ${filtered.length} sur ${_quizzes.length} quiz'
                              : 'Showing ${filtered.length} of ${_quizzes.length} quizzes',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Header ──
  Widget _buildHeader(bool isFr) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 600;
        final titleWidget = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isFr ? 'Gestion des Quiz' : 'Quiz Studio',
              style: (isCompact
                      ? AppTypography.headlineSmall
                      : AppTypography.headlineMedium)
                  .copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              isFr
                  ? "Créez des évaluations, générez des questions avec l'IA et analysez les résultats."
                  : 'Create assessments, generate AI questions and analyze student results.',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textMuted,
              ),
            ),
          ],
        );

        final newQuizBtn = CustomButton(
          text: isFr ? 'Nouveau Quiz' : 'New Quiz',
          icon: Icons.add,
          height: 44,
          onPressed: () async {
            final res = await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const QuizBuilderScreen(),
              ),
            );
            if (res == true) _fetchQuizzes();
          },
        );

        if (isCompact) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              titleWidget,
              const SizedBox(height: 12),
              SizedBox(width: double.infinity, child: newQuizBtn),
            ],
          );
        }

        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(child: titleWidget),
            const SizedBox(width: 16),
            newQuizBtn,
          ],
        );
      },
    );
  }

  // ── Search & Controls Row ──
  Widget _buildSearchAndControlsRow(bool isFr) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 700;

        final searchField = Container(
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.pureWhite,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: TextField(
            onChanged: (val) => setState(() => _search = val),
            style: const TextStyle(fontSize: 13, color: AppColors.ink),
            decoration: InputDecoration(
              hintText: isFr
                  ? 'Rechercher par titre ou promotion...'
                  : 'Search by title or cohort...',
              hintStyle: const TextStyle(
                color: AppColors.textMuted,
                fontSize: 13,
              ),
              prefixIcon: const Icon(
                Icons.search,
                size: 18,
                color: AppColors.textMuted,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 11,
              ),
              isDense: true,
            ),
          ),
        );

        final statusDropdown = Container(
          height: 44,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.pureWhite,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _statusFilterDropdown,
              icon: const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textMuted),
              style: const TextStyle(fontSize: 13, color: AppColors.ink, fontWeight: FontWeight.w600),
              items: [
                DropdownMenuItem(value: 'all', child: Text(isFr ? 'Tous les statuts' : 'All statuses')),
                DropdownMenuItem(value: 'live', child: Text(isFr ? 'Actifs' : 'Active')),
                DropdownMenuItem(value: 'scheduled', child: Text(isFr ? 'Planifiés' : 'Scheduled')),
                DropdownMenuItem(value: 'draft', child: Text(isFr ? 'Brouillons' : 'Drafts')),
                DropdownMenuItem(value: 'ended', child: Text(isFr ? 'Clôturés' : 'Closed')),
              ],
              onChanged: (v) {
                if (v != null) setState(() => _statusFilterDropdown = v);
              },
            ),
          ),
        );

        final viewToggle = Container(
          height: 44,
          decoration: BoxDecoration(
            color: AppColors.surfaceSoft,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          padding: const EdgeInsets.all(3),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildViewModeBtn(
                icon: Icons.grid_view_rounded,
                isActive: _viewMode == 'grid',
                onTap: () => setState(() => _viewMode = 'grid'),
                tooltip: isFr ? 'Vue grille' : 'Grid view',
              ),
              _buildViewModeBtn(
                icon: Icons.view_headline_rounded,
                isActive: _viewMode == 'table',
                onTap: () => setState(() => _viewMode = 'table'),
                tooltip: isFr ? 'Vue tableau' : 'Table view',
              ),
            ],
          ),
        );

        if (isNarrow) {
          return Column(
            children: [
              searchField,
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: statusDropdown),
                  const SizedBox(width: 8),
                  viewToggle,
                ],
              ),
            ],
          );
        }

        return Row(
          children: [
            Expanded(child: searchField),
            const SizedBox(width: 12),
            statusDropdown,
            const SizedBox(width: 12),
            viewToggle,
          ],
        );
      },
    );
  }

  Widget _buildViewModeBtn({
    required IconData icon,
    required bool isActive,
    required VoidCallback onTap,
    required String tooltip,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(7),
        child: Container(
          width: 38,
          height: 38,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isActive ? AppColors.frenchNavy : Colors.transparent,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Icon(
            icon,
            size: 18,
            color: isActive ? AppColors.pureWhite : AppColors.textMuted,
          ),
        ),
      ),
    );
  }

  // ── 4 KPI Stat Cards ──
  Widget _buildKpiSection({
    required bool isFr,
    required int total,
    required int live,
    required int scheduled,
    required int ended,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isTablet = constraints.maxWidth >= 720;

        final card1 = _buildKpiCard(
          icon: Icons.description_outlined,
          iconBg: const Color(0xFFEFF6FF),
          iconColor: const Color(0xFF2563EB),
          value: '$total',
          label: isFr ? 'Quiz au total' : 'Total Quizzes',
        );

        final card2 = _buildKpiCard(
          icon: Icons.circle,
          iconBg: const Color(0xFFECFDF5),
          iconColor: const Color(0xFF10B981),
          value: '$live',
          label: isFr ? 'Actifs' : 'Active',
        );

        final card3 = _buildKpiCard(
          icon: Icons.access_time_rounded,
          iconBg: const Color(0xFFF0FDF4),
          iconColor: const Color(0xFF0284C7),
          value: '$scheduled',
          label: isFr ? 'Planifiés' : 'Scheduled',
        );

        final card4 = _buildKpiCard(
          icon: Icons.check_circle_outline,
          iconBg: const Color(0xFFF1F5F9),
          iconColor: const Color(0xFF64748B),
          value: '$ended',
          label: isFr ? 'Clôturés' : 'Closed',
        );

        if (isTablet) {
          return Row(
            children: [
              Expanded(child: card1),
              const SizedBox(width: 14),
              Expanded(child: card2),
              const SizedBox(width: 14),
              Expanded(child: card3),
              const SizedBox(width: 14),
              Expanded(child: card4),
            ],
          );
        }

        // Mobile: 2x2 grid
        return Column(
          children: [
            Row(
              children: [
                Expanded(child: card1),
                const SizedBox(width: 10),
                Expanded(child: card2),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: card3),
                const SizedBox(width: 10),
                Expanded(child: card4),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildKpiCard({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: AppColors.ink,
                    height: 1.1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Filter Pills & Sort Row ──
  Widget _buildFilterAndSortRow({
    required bool isFr,
    required int total,
    required int live,
    required int scheduled,
    required int draft,
    required int ended,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 800;

        final pillTabs = SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildFilterPill('all', isFr ? 'Tous ($total)' : 'All ($total)'),
              const SizedBox(width: 8),
              _buildFilterPill('live', isFr ? 'Actifs ($live)' : 'Active ($live)'),
              const SizedBox(width: 8),
              _buildFilterPill('scheduled', isFr ? 'Planifiés ($scheduled)' : 'Scheduled ($scheduled)'),
              const SizedBox(width: 8),
              _buildFilterPill('draft', isFr ? 'Brouillons ($draft)' : 'Drafts ($draft)'),
              const SizedBox(width: 8),
              _buildFilterPill('ended', isFr ? 'Clôturés ($ended)' : 'Closed ($ended)'),
            ],
          ),
        );

        final sortDropdown = Container(
          height: 38,
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            color: AppColors.pureWhite,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _sortBy,
              icon: const Icon(Icons.keyboard_arrow_down, size: 16, color: AppColors.textMuted),
              style: const TextStyle(fontSize: 12.5, color: AppColors.ink, fontWeight: FontWeight.w600),
              items: [
                DropdownMenuItem(
                  value: 'recent',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.swap_vert, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(isFr ? 'Plus récents' : 'Most recent'),
                    ],
                  ),
                ),
                DropdownMenuItem(
                  value: 'oldest',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.swap_vert, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(isFr ? 'Plus anciens' : 'Oldest first'),
                    ],
                  ),
                ),
                DropdownMenuItem(
                  value: 'title',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.sort_by_alpha, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Text(isFr ? 'Titre A-Z' : 'Title A-Z'),
                    ],
                  ),
                ),
              ],
              onChanged: (v) {
                if (v != null) setState(() => _sortBy = v);
              },
            ),
          ),
        );

        if (isNarrow) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              pillTabs,
              const SizedBox(height: 10),
              Align(alignment: Alignment.centerRight, child: sortDropdown),
            ],
          );
        }

        return Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(child: pillTabs),
            const SizedBox(width: 14),
            sortDropdown,
          ],
        );
      },
    );
  }

  Widget _buildFilterPill(String id, String label) {
    final isSelected = _selectedTab == id;
    return InkWell(
      onTap: () => setState(() => _selectedTab = id),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.frenchNavy : AppColors.pureWhite,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.frenchNavy : AppColors.border,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? AppColors.pureWhite : AppColors.ink,
          ),
        ),
      ),
    );
  }

  // ── Grid View (3 columns on tablet) ──
  Widget _buildGridView(List<dynamic> list, double maxWidth, bool isFr) {
    int columns = 1;
    if (maxWidth >= 940) {
      columns = 3;
    } else if (maxWidth >= 600) {
      columns = 2;
    }

    if (columns == 1) {
      return ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: list.length,
        separatorBuilder: (context, index) => const SizedBox(height: 14),
        itemBuilder: (context, idx) => _buildQuizCard(list[idx] as Map<String, dynamic>, isFr),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: list.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: columns,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        mainAxisExtent: 290,
      ),
      itemBuilder: (context, idx) => _buildQuizCard(list[idx] as Map<String, dynamic>, isFr),
    );
  }

  // ── Quiz Card (matches reference media_1790001341761.jpg) ──
  Widget _buildQuizCard(Map<String, dynamic> quiz, bool isFr) {
    final status = _getQuizStatus(quiz);
    final subsCount =
        quiz['submitted_students'] ?? quiz['submissions_count'] ?? 0;
    final totalStudents = quiz['total_students'] ?? 0;
    final qCount =
        quiz['total_questions'] ?? (quiz['questions'] as List?)?.length ?? 0;
    final duration = quiz['duration_minutes'] ?? 30;
    final totalMarks = quiz['total_marks'] ?? 20;
    final avgScore = quiz['avg_score'];
    final batchNames = quiz['batch_names'] ?? quiz['batch_name'] ?? quiz['category'] ?? '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
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
          // Top Row: Status badge + Tag badge + 3-dots Menu
          Row(
            children: [
              _buildStatusPill(status, isFr),
              if (batchNames.toString().isNotEmpty) ...[
                const SizedBox(width: 8),
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSoft,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      batchNames.toString(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.frenchNavy,
                      ),
                    ),
                  ),
                ),
              ],
              const Spacer(),
              _buildQuizPopupMenu(quiz, isFr),
            ],
          ),
          const SizedBox(height: 8),

          // Title
          Text(
            quiz['title'] ?? (isFr ? 'Quiz sans titre' : 'Untitled Quiz'),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 4),

          // Description (2 lines max)
          Text(
            quiz['description'] != null && (quiz['description'] as String).isNotEmpty
                ? quiz['description'] as String
                : (isFr
                    ? 'Évaluation sur les compétences acquises.'
                    : 'Assessment on acquired language skills.'),
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textMuted,
              height: 1.3,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const Spacer(),

          // Meta Row: Questions · Duration · Points
          Row(
            children: [
              const Icon(Icons.format_list_bulleted, size: 14, color: AppColors.textSubtle),
              const SizedBox(width: 4),
              Text(
                '$qCount questions',
                style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.access_time, size: 14, color: AppColors.textSubtle),
              const SizedBox(width: 4),
              Text(
                '$duration min',
                style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.star_outline_rounded, size: 14, color: AppColors.textSubtle),
              const SizedBox(width: 4),
              Text(
                '$totalMarks pts',
                style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Submissions & Average Score Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.people_alt_outlined, size: 14, color: AppColors.textSubtle),
                  const SizedBox(width: 5),
                  Text(
                    totalStudents > 0
                        ? '$subsCount / $totalStudents ${isFr ? "rendu" : "turned in"}${subsCount > 1 ? "s" : ""}'
                        : '$subsCount ${isFr ? "rendu" : "turned in"}${subsCount > 1 ? "s" : ""}',
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.ink,
                    ),
                  ),
                ],
              ),
              Text(
                avgScore != null
                    ? '${isFr ? "Moyenne" : "Average"} : $avgScore%'
                    : '${isFr ? "Moyenne" : "Average"} : -',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF2563EB),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Bottom Action Buttons: Résultats & Modifier
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => QuizResultsScreen(quiz: quiz),
                      ),
                    );
                  },
                  icon: const Icon(Icons.bar_chart, size: 16),
                  label: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      isFr ? 'Résultats ($subsCount)' : 'Results ($subsCount)',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF2563EB),
                    side: const BorderSide(color: Color(0xFFDBEAFE)),
                    backgroundColor: const Color(0xFFEFF6FF),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    minimumSize: const Size(0, 36),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final res = await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => QuizBuilderScreen(existingQuiz: quiz),
                      ),
                    );
                    if (res == true) _fetchQuizzes();
                  },
                  icon: const Icon(Icons.edit, size: 14),
                  label: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      isFr ? 'Modifier' : 'Edit',
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.frenchNavy,
                    foregroundColor: AppColors.pureWhite,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    minimumSize: const Size(0, 36),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── Professional Table View ──
  Widget _buildTableView(List<dynamic> list, bool isFr) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(AppColors.surfaceSoft),
            horizontalMargin: 16,
            columnSpacing: 24,
            columns: [
              DataColumn(label: Text(isFr ? 'TITRE DU QUIZ' : 'QUIZ TITLE', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'PROMOTION' : 'COHORT', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'STATUT' : 'STATUS', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'QUESTIONS' : 'QUESTIONS', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'DURÉE' : 'DURATION', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'RENDUS' : 'SUBMISSIONS', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'MOYENNE' : 'AVERAGE', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'ACTIONS' : 'ACTIONS', style: _tableHeaderStyle)),
            ],
            rows: list.map((item) {
              final quiz = item as Map<String, dynamic>;
              final status = _getQuizStatus(quiz);
              final subsCount = quiz['submitted_students'] ?? quiz['submissions_count'] ?? 0;
              final totalStudents = quiz['total_students'] ?? 0;
              final qCount = quiz['total_questions'] ?? (quiz['questions'] as List?)?.length ?? 0;
              final duration = quiz['duration_minutes'] ?? 30;
              final avgScore = quiz['avg_score'];
              final batch = quiz['batch_names'] ?? quiz['batch_name'] ?? '-';

              return DataRow(
                cells: [
                  DataCell(
                    SizedBox(
                      width: 200,
                      child: Text(
                        quiz['title'] ?? '-',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.ink),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  DataCell(Text(batch.toString(), style: const TextStyle(fontSize: 12.5, color: AppColors.frenchNavy, fontWeight: FontWeight.w600))),
                  DataCell(_buildStatusPill(status, isFr)),
                  DataCell(Text('$qCount q.', style: const TextStyle(fontSize: 12.5))),
                  DataCell(Text('$duration min', style: const TextStyle(fontSize: 12.5))),
                  DataCell(Text(
                    totalStudents > 0 ? '$subsCount / $totalStudents' : '$subsCount',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                  )),
                  DataCell(Text(
                    avgScore != null ? '$avgScore%' : '-',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF2563EB)),
                  )),
                  DataCell(
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          tooltip: isFr ? 'Voir résultats' : 'View results',
                          icon: const Icon(Icons.bar_chart, size: 18, color: Color(0xFF2563EB)),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => QuizResultsScreen(quiz: quiz),
                              ),
                            );
                          },
                        ),
                        IconButton(
                          tooltip: isFr ? 'Modifier' : 'Edit',
                          icon: const Icon(Icons.edit, size: 17, color: AppColors.frenchNavy),
                          onPressed: () async {
                            final res = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => QuizBuilderScreen(existingQuiz: quiz),
                              ),
                            );
                            if (res == true) _fetchQuizzes();
                          },
                        ),
                        _buildQuizPopupMenu(quiz, isFr),
                      ],
                    ),
                  ),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  static const TextStyle _tableHeaderStyle = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.5,
    color: AppColors.textMuted,
  );

  Widget _buildStatusPill(String status, bool isFr) {
    Color bg;
    Color fg;
    String label;

    switch (status) {
      case 'live':
        bg = const Color(0xFFDCFCE7);
        fg = const Color(0xFF15803D);
        label = isFr ? '● Actif' : '● Active';
        break;
      case 'scheduled':
        bg = const Color(0xFFDBEAFE);
        fg = const Color(0xFF1D4ED8);
        label = isFr ? '● Planifié' : '● Scheduled';
        break;
      case 'ended':
        bg = const Color(0xFFFEE2E2);
        fg = const Color(0xFFB91C1C);
        label = isFr ? '● Clôturé' : '● Closed';
        break;
      default:
        bg = const Color(0xFFF1F5F9);
        fg = const Color(0xFF475569);
        label = isFr ? '● Brouillon' : '● Draft';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg),
      ),
    );
  }

  Widget _buildQuizPopupMenu(Map<String, dynamic> quiz, bool isFr) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert, size: 18, color: AppColors.textMuted),
      padding: EdgeInsets.zero,
      onSelected: (action) async {
        if (action == 'results') {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => QuizResultsScreen(quiz: quiz),
            ),
          );
        } else if (action == 'edit') {
          final res = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => QuizBuilderScreen(existingQuiz: quiz),
            ),
          );
          if (res == true) _fetchQuizzes();
        } else if (action == 'toggle') {
          _toggleQuizStatus(quiz);
        } else if (action == 'delete') {
          _deleteQuiz(quiz['id']);
        }
      },
      itemBuilder: (context) => [
        PopupMenuItem(
          value: 'results',
          child: Row(
            children: [
              const Icon(Icons.bar_chart, size: 16, color: Color(0xFF2563EB)),
              const SizedBox(width: 8),
              Text(isFr ? 'Voir les résultats' : 'View results'),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'edit',
          child: Row(
            children: [
              const Icon(Icons.edit, size: 16, color: AppColors.frenchNavy),
              const SizedBox(width: 8),
              Text(isFr ? 'Modifier le quiz' : 'Edit quiz'),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'toggle',
          child: Row(
            children: [
              Icon(
                quiz['status'] == 'published' ? Icons.pause_circle_outline : Icons.publish,
                size: 16,
                color: AppColors.ink,
              ),
              const SizedBox(width: 8),
              Text(
                quiz['status'] == 'published'
                    ? (isFr ? 'Mettre en brouillon' : 'Set as draft')
                    : (isFr ? 'Publier le quiz' : 'Publish quiz'),
              ),
            ],
          ),
        ),
        PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              const Icon(Icons.delete_outline, size: 16, color: AppColors.bad),
              const SizedBox(width: 8),
              Text(
                isFr ? 'Supprimer' : 'Delete',
                style: const TextStyle(color: AppColors.bad),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
