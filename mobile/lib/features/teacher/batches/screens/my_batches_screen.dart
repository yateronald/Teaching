import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../../../../core/responsive/responsive_layout.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/sliver_sticky_header_delegate.dart';
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
  String _viewMode = 'grid'; // grid, table
  String _selectedPeriod = 'all_time'; // all_time, this_month, this_year

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
      dynamic data;
      try {
        final res = await client.get('/batches');
        data = res.data;
      } catch (_) {
        final res = await client.get('/batches/teacher/${user.id}');
        data = res.data;
      }
      if (mounted) {
        setState(() {
          _batches = data is List
              ? data
              : (data?['batches'] ?? data?['data'] ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = context.isFrench
              ? 'Impossible de charger vos promotions.'
              : 'Failed to load cohorts.';
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

  String _formatDateRange(dynamic start, dynamic end, bool isFrench) {
    if (start == null && end == null) {
      return isFrench ? 'Dates non définies' : 'Dates not set';
    }
    final sDate = start != null ? DateTime.tryParse(start.toString()) : null;
    final eDate = end != null ? DateTime.tryParse(end.toString()) : null;
    final fmt = DateFormat('d MMM yyyy', isFrench ? 'fr_FR' : 'en_US');
    if (sDate != null && eDate != null) {
      return isFrench
          ? 'Du ${fmt.format(sDate)} au ${fmt.format(eDate)}'
          : '${fmt.format(sDate)} - ${fmt.format(eDate)}';
    } else if (sDate != null) {
      return isFrench
          ? 'À partir du ${fmt.format(sDate)}'
          : 'From ${fmt.format(sDate)}';
    }
    return start?.toString() ?? '';
  }

  Map<String, dynamic>? _computeProgress(
    Map<String, dynamic> b,
    String status,
    bool isFrench,
  ) {
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
        'label': isFrench
            ? (diff <= 0
                  ? "Commence aujourd'hui"
                  : 'Débute dans $diff jour${diff > 1 ? "s" : ""}')
            : (diff <= 0
                  ? 'Starts today'
                  : 'Starts in $diff day${diff > 1 ? "s" : ""}'),
        'right': isFrench
            ? '$totalDays jours au total'
            : '$totalDays total days',
      };
    }
    if (status == 'completed') {
      return {
        'pct': 1.0,
        'label': isFrench ? 'Session terminée' : 'Batch completed',
        'right': isFrench
            ? '$totalDays jours effectués'
            : '$totalDays days completed',
      };
    }

    final doneDays = today.difference(start).inDays + 1;
    final leftDays = totalDays - doneDays;
    final pct = (doneDays / totalDays).clamp(0.02, 1.0);
    return {
      'pct': pct,
      'label': isFrench
          ? 'Jour $doneDays sur $totalDays'
          : 'Day $doneDays of $totalDays',
      'right': isFrench
          ? (leftDays <= 0
                ? 'Dernier jour'
                : '$leftDays jour${leftDays > 1 ? "s" : ""} restant${leftDays > 1 ? "s" : ""}')
          : (leftDays <= 0
                ? 'Last day'
                : '$leftDays day${leftDays > 1 ? "s" : ""} left'),
    };
  }

  double _computeStickyHeight(double width) {
    if (width >= 960) return 108.0;
    if (width >= 600) return 152.0;
    return 206.0;
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final insets = ResponsiveLayout.pageInsets(context);
    final width = MediaQuery.of(context).size.width;

    // Filter list
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

    // Compute status counts
    int totalCount = _batches.length;
    int activeCount = 0;
    int upcomingCount = 0;
    int completedCount = 0;

    for (final item in _batches) {
      if (item is Map<String, dynamic>) {
        final st = _computeStatus(item);
        if (st == 'active') activeCount++;
        if (st == 'upcoming') upcomingCount++;
        if (st == 'completed') completedCount++;
      }
    }

    return RefreshIndicator(
      onRefresh: _fetchBatches,
      color: AppColors.frenchNavy,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // 1. Header Row (Scrolls away)
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(insets.left, insets.top, insets.right, 0),
              child: AdaptiveContent(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(isFr),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ),

          // 2. Sticky Search & Filter Row (Pins to top on scroll)
          SliverPersistentHeader(
            pinned: true,
            delegate: SliverStickyHeaderDelegate(
              height: _computeStickyHeight(width),
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
                      _buildSearchAndActionRow(isFr),
                      const SizedBox(height: 10),
                      _buildFilterRow(
                        isFr: isFr,
                        total: totalCount,
                        active: activeCount,
                        upcoming: upcomingCount,
                        completed: completedCount,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 3. Batch List or Grid
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
                        onAction: _fetchBatches,
                      )
                    else if (filteredBatches.isEmpty)
                      EmptyState(
                        title: isFr ? 'Aucune promotion trouvée' : 'No batches found',
                        message: _search.isNotEmpty
                            ? (isFr
                                ? 'Aucune promotion ne correspond à votre recherche.'
                                : 'No cohort matches your search query.')
                            : (isFr
                                ? 'Aucune promotion dans cette catégorie.'
                                : 'No cohort found in this category.'),
                        icon: Icons.groups_outlined,
                      )
                    else
                      LayoutBuilder(
                        builder: (context, constraints) {
                          if (_viewMode == 'table') {
                            return _buildTableView(filteredBatches, isFr);
                          }
                          return _buildGridView(filteredBatches, constraints.maxWidth, isFr);
                        },
                      ),

                    // 4. Footer: "Affichage de X sur Y promotions"
                    if (!_isLoading && _error == null && filteredBatches.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      Center(
                        child: Text(
                          isFr
                              ? 'Affichage de ${filteredBatches.length} sur ${_batches.length} promotions'
                              : 'Showing ${filteredBatches.length} of ${_batches.length} cohorts',
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isFr ? 'Mes Promotions & Cohortes' : 'My Batches & Cohorts',
          style: AppTypography.headlineMedium.copyWith(
            fontWeight: FontWeight.w700,
            color: AppColors.frenchNavy,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          isFr
              ? 'Gérez vos classes, suivez la progression du calendrier et les résultats des élèves.'
              : 'Manage your classes, track calendar progress and student results.',
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  // ── Search & Action Row ──
  Widget _buildSearchAndActionRow(bool isFr) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 740;

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
                  ? 'Rechercher une promotion par nom...'
                  : 'Search cohort by name...',
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

        final periodDropdown = Container(
          height: 44,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.pureWhite,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: _selectedPeriod,
              icon: const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textMuted),
              style: const TextStyle(fontSize: 13, color: AppColors.ink, fontWeight: FontWeight.w600),
              items: [
                DropdownMenuItem(
                  value: 'all_time',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 6),
                      Text(isFr ? 'Toutes les dates' : 'All time'),
                    ],
                  ),
                ),
                DropdownMenuItem(
                  value: 'this_month',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 6),
                      Text(isFr ? 'Ce mois-ci' : 'This month'),
                    ],
                  ),
                ),
                DropdownMenuItem(
                  value: 'this_year',
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today_outlined, size: 15, color: AppColors.textMuted),
                      const SizedBox(width: 6),
                      Text(isFr ? 'Cette année' : 'This year'),
                    ],
                  ),
                ),
              ],
              onChanged: (v) {
                if (v != null) setState(() => _selectedPeriod = v);
              },
            ),
          ),
        );

        if (isNarrow) {
          return Column(
            children: [
              searchField,
              const SizedBox(height: 10),
              periodDropdown,
            ],
          );
        }

        return Row(
          children: [
            Expanded(child: searchField),
            const SizedBox(width: 12),
            periodDropdown,
          ],
        );
      },
    );
  }

  // ── Filter Row: Status + CEFR + View Mode ──
  Widget _buildFilterRow({
    required bool isFr,
    required int total,
    required int active,
    required int upcoming,
    required int completed,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth >= 960;

        final statusTabs = SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              _buildStatusPill('all', isFr ? 'Toutes ($total)' : 'All ($total)'),
              const SizedBox(width: 6),
              _buildStatusPill('active', isFr ? 'En cours ($active)' : 'Active ($active)'),
              const SizedBox(width: 6),
              _buildStatusPill('upcoming', isFr ? 'À venir ($upcoming)' : 'Upcoming ($upcoming)'),
              const SizedBox(width: 6),
              _buildStatusPill('completed', isFr ? 'Terminées ($completed)' : 'Completed ($completed)'),
            ],
          ),
        );

        final levelChips = SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: _levels.map((lvl) {
              final isSelected = _selectedLevel == lvl;
              final label = lvl == 'ALL' ? (isFr ? 'Tous' : 'All') : lvl;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: InkWell(
                  onTap: () => setState(() => _selectedLevel = lvl),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.frenchNavy : AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected ? AppColors.frenchNavy : AppColors.border,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      label,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? AppColors.pureWhite : AppColors.ink,
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        );

        final viewToggle = Container(
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.surfaceSoft,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          padding: const EdgeInsets.all(2),
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

        if (isWide) {
          return Row(
            children: [
              statusTabs,
              const SizedBox(width: 16),
              Expanded(child: levelChips),
              const SizedBox(width: 12),
              viewToggle,
            ],
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: statusTabs),
                const SizedBox(width: 8),
                viewToggle,
              ],
            ),
            const SizedBox(height: 10),
            levelChips,
          ],
        );
      },
    );
  }

  Widget _buildStatusPill(String id, String label) {
    final isSelected = _selectedStatus == id;
    return InkWell(
      onTap: () => setState(() => _selectedStatus = id),
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
        borderRadius: BorderRadius.circular(6),
        child: Container(
          width: 32,
          height: 32,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isActive ? AppColors.frenchNavy : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            size: 16,
            color: isActive ? AppColors.pureWhite : AppColors.textMuted,
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
        itemBuilder: (context, idx) => _buildBatchCard(list[idx] as Map<String, dynamic>, isFr),
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
        mainAxisExtent: 280,
      ),
      itemBuilder: (context, idx) => _buildBatchCard(list[idx] as Map<String, dynamic>, isFr),
    );
  }

  // ── Batch Card (matches reference media_1790001341785.jpg) ──
  Widget _buildBatchCard(Map<String, dynamic> batch, bool isFr) {
    final level = (batch['french_level'] ?? 'A1').toString().toUpperCase();
    final status = _computeStatus(batch);
    final progress = _computeProgress(batch, status, isFr);
    final studentCount = batch['student_count'] ?? 0;
    final name = batch['name'] ?? (isFr ? 'Cohorte sans nom' : 'Unnamed batch');
    final pctValue = ((progress?['pct'] as double?) ?? 0.0).clamp(0.0, 1.0);
    final pctInt = (pctValue * 100).round();

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
          // Top Row: Big CEFR Badge + Status Pill & Title + 3-dots Menu
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Big CEFR Level container
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  level,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.frenchNavy,
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Status Pill + Batch Name
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildBatchStatusPill(status, isFr),
                    const SizedBox(height: 3),
                    Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                  ],
                ),
              ),

              // 3-dots Menu
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 18, color: AppColors.textMuted),
                padding: EdgeInsets.zero,
                onSelected: (val) {
                  if (val == 'details') {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => BatchDetailScreen(batch: batch)),
                    );
                  } else if (val == 'insights') {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => BatchInsightsScreen(batch: batch)),
                    );
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'details',
                    child: Row(
                      children: [
                        const Icon(Icons.people_outline, size: 16, color: AppColors.frenchNavy),
                        const SizedBox(width: 8),
                        Text(isFr ? 'Effectif & Détails' : 'Roster & Details'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'insights',
                    child: Row(
                      children: [
                        const Icon(Icons.insights, size: 16, color: Color(0xFF2563EB)),
                        const SizedBox(width: 8),
                        Text(isFr ? 'Aperçu analytique' : 'Insights & Analytics'),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Date Range Row
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.textSubtle),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  _formatDateRange(batch['start_date'], batch['end_date'], isFr),
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),

          // Student Count Row
          Row(
            children: [
              const Icon(Icons.people_alt_outlined, size: 14, color: AppColors.textSubtle),
              const SizedBox(width: 6),
              Text(
                '$studentCount ${isFr ? "étudiant" : "student"}${studentCount > 1 ? "s" : ""}',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),
          const Spacer(),

          // Progress Section: Progress ... 100%
          if (progress != null) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isFr ? 'Progression' : 'Progress',
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),
                Text(
                  '$pctInt%',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppColors.ink,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 5),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pctValue,
                backgroundColor: const Color(0xFFE2E8F0),
                valueColor: AlwaysStoppedAnimation<Color>(
                  status == 'completed'
                      ? const Color(0xFF10B981)
                      : (status == 'active' ? const Color(0xFF2563EB) : const Color(0xFF94A3B8)),
                ),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  progress['label'] as String,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                ),
                Text(
                  progress['right'] as String,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSubtle),
                ),
              ],
            ),
          ],
          const SizedBox(height: 12),

          // Bottom Buttons: Insights & Roster
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => BatchInsightsScreen(batch: batch)),
                    );
                  },
                  icon: const Icon(Icons.insights, size: 15),
                  label: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      isFr ? 'Aperçu' : 'Insights',
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
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => BatchDetailScreen(batch: batch)),
                    );
                  },
                  icon: const Icon(Icons.arrow_forward, size: 14),
                  label: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      isFr ? 'Effectif & Détails' : 'Roster & Details',
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
              DataColumn(label: Text(isFr ? 'NIVEAU' : 'LEVEL', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'PROMOTION' : 'COHORT', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'STATUT' : 'STATUS', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'PÉRIODE' : 'DATE RANGE', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'EFFECTIF' : 'STUDENTS', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'PROGRESSION' : 'PROGRESS', style: _tableHeaderStyle)),
              DataColumn(label: Text(isFr ? 'ACTIONS' : 'ACTIONS', style: _tableHeaderStyle)),
            ],
            rows: list.map((item) {
              final batch = item as Map<String, dynamic>;
              final level = (batch['french_level'] ?? 'A1').toString().toUpperCase();
              final status = _computeStatus(batch);
              final progress = _computeProgress(batch, status, isFr);
              final studentCount = batch['student_count'] ?? 0;
              final name = batch['name'] ?? (isFr ? 'Cohorte sans nom' : 'Unnamed batch');
              final pctValue = ((progress?['pct'] as double?) ?? 0.0).clamp(0.0, 1.0);
              final pctInt = (pctValue * 100).round();

              return DataRow(
                cells: [
                  DataCell(
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        level,
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: AppColors.frenchNavy),
                      ),
                    ),
                  ),
                  DataCell(
                    SizedBox(
                      width: 180,
                      child: Text(
                        name,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.ink),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ),
                  DataCell(_buildBatchStatusPill(status, isFr)),
                  DataCell(Text(
                    _formatDateRange(batch['start_date'], batch['end_date'], isFr),
                    style: const TextStyle(fontSize: 12.5),
                  )),
                  DataCell(Text(
                    '$studentCount ${isFr ? "étudiant" : "student"}${studentCount > 1 ? "s" : ""}',
                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                  )),
                  DataCell(
                    SizedBox(
                      width: 120,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('$pctInt%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              Text(progress?['right'] ?? '', style: const TextStyle(fontSize: 10, color: AppColors.textSubtle)),
                            ],
                          ),
                          const SizedBox(height: 3),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(3),
                            child: LinearProgressIndicator(
                              value: pctValue,
                              minHeight: 5,
                              backgroundColor: const Color(0xFFE2E8F0),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                status == 'completed'
                                    ? const Color(0xFF10B981)
                                    : (status == 'active' ? const Color(0xFF2563EB) : const Color(0xFF94A3B8)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  DataCell(
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          tooltip: isFr ? 'Aperçu' : 'Insights',
                          icon: const Icon(Icons.insights, size: 18, color: Color(0xFF2563EB)),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => BatchInsightsScreen(batch: batch)),
                            );
                          },
                        ),
                        IconButton(
                          tooltip: isFr ? 'Effectif & Détails' : 'Roster & Details',
                          icon: const Icon(Icons.arrow_forward, size: 17, color: AppColors.frenchNavy),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => BatchDetailScreen(batch: batch)),
                            );
                          },
                        ),
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

  Widget _buildBatchStatusPill(String status, bool isFr) {
    Color bg;
    Color fg;
    String label;
    IconData icon;

    switch (status) {
      case 'completed':
        bg = const Color(0xFFDCFCE7);
        fg = const Color(0xFF15803D);
        label = isFr ? 'Terminée' : 'Completed';
        icon = Icons.check;
        break;
      case 'active':
        bg = const Color(0xFFFEF3C7);
        fg = const Color(0xFFD97706);
        label = isFr ? 'En cours' : 'In Progress';
        icon = Icons.access_time;
        break;
      default:
        bg = const Color(0xFFDBEAFE);
        fg = const Color(0xFF1D4ED8);
        label = isFr ? 'À venir' : 'Upcoming';
        icon = Icons.calendar_today_outlined;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: fg),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: fg),
          ),
        ],
      ),
    );
  }
}
