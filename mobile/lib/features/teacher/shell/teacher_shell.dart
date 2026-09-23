import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/app_locale_notifier.dart';
import '../../../core/localization/translations.dart';
import '../../../core/responsive/responsive_layout.dart';
import '../../../core/widgets/brand_logo.dart';
import '../../../core/widgets/language_switcher_button.dart';
import '../../../core/widgets/tricolore_bar.dart';
import '../assign_demo/screens/assign_demo_screen.dart';
import '../batches/screens/my_batches_screen.dart';
import '../dashboard/screens/teacher_dashboard_screen.dart';
import '../exam_prep/screens/exam_prep_screen.dart';
import '../meetings/screens/live_meetings_screen.dart';
import '../profile/screens/profile_settings_screen.dart';
import '../quizzes/screens/quiz_management_screen.dart';
import '../resources/screens/resources_screen.dart';
import '../schedule/screens/schedule_screen.dart';

class TeacherShell extends ConsumerStatefulWidget {
  final int initialTab;

  const TeacherShell({super.key, this.initialTab = 0});

  @override
  ConsumerState<TeacherShell> createState() => _TeacherShellState();
}

class _TeacherShellState extends ConsumerState<TeacherShell> {
  late int _currentIndex;
  bool? _navigationExpanded;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _navItems = [
    // TEACHING
    {
      'index': 0,
      'section': 'TEACHING',
      'transKey': 'nav_dashboard',
      'title': 'Dashboard',
      'icon': Icons.grid_view_outlined,
    },
    {
      'index': 1,
      'section': 'TEACHING',
      'transKey': 'nav_batches',
      'title': 'My Batches',
      'icon': Icons.groups_outlined,
    },
    {
      'index': 2,
      'section': 'TEACHING',
      'transKey': 'nav_quizzes',
      'title': 'Quiz Management',
      'icon': Icons.quiz_outlined,
    },
    {
      'index': 3,
      'section': 'TEACHING',
      'transKey': 'nav_exam_prep',
      'title': 'Exam Preparation',
      'icon': Icons.school_outlined,
    },
    {
      'index': 4,
      'section': 'TEACHING',
      'transKey': 'nav_resources',
      'title': 'Resources',
      'icon': Icons.folder_open_outlined,
    },

    // SESSIONS
    {
      'index': 5,
      'section': 'SESSIONS',
      'transKey': 'nav_schedule',
      'title': 'Schedule',
      'icon': Icons.calendar_today_outlined,
    },
    {
      'index': 6,
      'section': 'SESSIONS',
      'transKey': 'nav_meetings',
      'title': 'Live Meetings',
      'icon': Icons.video_camera_front_outlined,
    },
    {
      'index': 7,
      'section': 'SESSIONS',
      'transKey': 'nav_assign_demo',
      'title': 'Assign Demo',
      'icon': Icons.assignment_ind_outlined,
    },

    // ACCOUNT
    {
      'index': 8,
      'section': 'ACCOUNT',
      'transKey': 'nav_profile',
      'title': 'Profile Settings',
      'icon': Icons.manage_accounts_outlined,
    },
  ];

  String _getNavTitle(Map<String, dynamic> item, String lang) {
    final key = item['transKey'] as String? ?? '';
    if (key.isNotEmpty) {
      return AppTranslations.tr(key, lang: lang);
    }
    return item['title'] as String;
  }

  String _getSectionTitle(String section, String lang) {
    if (section == 'TEACHING') {
      return AppTranslations.tr('nav_teaching', lang: lang);
    }
    if (section == 'SESSIONS') {
      return AppTranslations.tr('nav_sessions', lang: lang);
    }
    if (section == 'ACCOUNT') {
      return AppTranslations.tr('nav_account', lang: lang);
    }
    return section;
  }

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
  }

  void _onTabSelected(int idx) {
    setState(() => _currentIndex = idx);
    if (_scaffoldKey.currentState?.isDrawerOpen == true) {
      _scaffoldKey.currentState?.closeDrawer();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = ResponsiveLayout.hasPersistentNavigation(context);
    final navigationExpanded =
        _navigationExpanded ??
        ResponsiveLayout.defaultsToExpandedNavigation(context);
    final user = ref.watch(authNotifierProvider).user;
    final currentLocale = ref.watch(appLocaleProvider);
    final lang = currentLocale.languageCode;

    final pages = [
      TeacherDashboardScreen(onNavigateTab: _onTabSelected), // 0
      const MyBatchesScreen(), // 1
      const QuizManagementScreen(), // 2
      const ExamPrepScreen(), // 3
      const ResourcesScreen(), // 4
      ScheduleScreen(onNavigateTab: _onTabSelected), // 5
      const LiveMeetingsScreen(), // 6
      AssignDemoScreen(onNavigateTab: _onTabSelected), // 7
      const ProfileSettingsScreen(), // 8
    ];

    if (isTablet) {
      // Tablet / Desktop Adaptive Shell with Persistent French Editorial Sidebar
      return Scaffold(
        backgroundColor: AppColors.frenchPaper,
        body: Row(
          children: [
            _buildSidebar(user, lang, navigationExpanded),
            const VerticalDivider(width: 1, color: AppColors.border),
            Expanded(
              child: Column(
                children: [
                  const TricoloreBar(height: 3),
                  _buildTabletTopBar(user, lang, navigationExpanded),
                  const Divider(height: 1, color: AppColors.borderSoft),
                  Expanded(
                    child: IndexedStack(index: _currentIndex, children: pages),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Mobile Layout with AppBar and Drawer (Bottom bar removed per user request)
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        backgroundColor: AppColors.pureWhite,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: AppColors.frenchNavy),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        titleSpacing: 4,
        title: Row(
          children: [
            const BrandMark(size: 26, borderRadius: 6),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _getNavTitle(_navItems[_currentIndex], lang),
                style: AppTypography.titleMedium.copyWith(
                  color: AppColors.frenchNavy,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          const LanguageSwitcherButton(),
          const SizedBox(width: 6),
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: GestureDetector(
              onTap: () => _onTabSelected(8),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.frenchNavy,
                foregroundColor: AppColors.pureWhite,
                child: Text(
                  user?.fullName.isNotEmpty == true
                      ? user!.fullName[0].toUpperCase()
                      : 'P',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(3),
          child: TricoloreBar(height: 3),
        ),
      ),
      drawer: _buildDrawer(user, lang),
      body: IndexedStack(index: _currentIndex, children: pages),
    );
  }

  Widget _buildTabletTopBar(
    dynamic user,
    String lang,
    bool navigationExpanded,
  ) {
    return Container(
      color: AppColors.pureWhite,
      padding: const EdgeInsets.fromLTRB(10, 10, 20, 10),
      child: Row(
        children: [
          IconButton(
            tooltip: navigationExpanded
                ? (lang == 'en' ? 'Collapse menu' : 'Réduire le menu')
                : (lang == 'en' ? 'Expand menu' : 'Développer le menu'),
            onPressed: () =>
                setState(() => _navigationExpanded = !navigationExpanded),
            icon: Icon(
              navigationExpanded ? Icons.menu_open_rounded : Icons.menu_rounded,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              _getNavTitle(_navItems[_currentIndex], lang),
              style: AppTypography.titleLarge.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Row(
            children: [
              const LanguageSwitcherButton(),
              const SizedBox(width: 14),
              if (MediaQuery.sizeOf(context).width >= 960) ...[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSoft,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.public,
                        size: 14,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        user?.timezone ?? 'Europe/Paris',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
              ],
              GestureDetector(
                onTap: () => _onTabSelected(8),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.frenchNavy,
                      foregroundColor: AppColors.pureWhite,
                      child: Text(
                        user?.fullName.isNotEmpty == true
                            ? user!.fullName[0].toUpperCase()
                            : 'P',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    if (MediaQuery.sizeOf(context).width >= 980)
                      Text(
                        user?.fullName ?? 'Professeur',
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar(dynamic user, String lang, bool expanded) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      width: expanded
          ? ResponsiveLayout.expandedNavigationWidth
          : ResponsiveLayout.compactNavigationWidth,
      color: AppColors.pureWhite,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Teacher Space Banner
          Padding(
            padding: EdgeInsets.fromLTRB(
              expanded ? 20 : 12,
              18,
              expanded ? 20 : 12,
              14,
            ),
            child: Column(
              crossAxisAlignment: expanded
                  ? CrossAxisAlignment.start
                  : CrossAxisAlignment.center,
              children: [
                if (expanded)
                  const BrandLogo(height: 40, tight: true)
                else
                  const BrandMark(size: 40, borderRadius: 10),
                const SizedBox(height: 12),
                Tooltip(
                  message: AppTranslations.tr('teacher_space', lang: lang),
                  child: Row(
                    mainAxisAlignment: expanded
                        ? MainAxisAlignment.start
                        : MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.teacherDot,
                          shape: BoxShape.circle,
                        ),
                      ),
                      if (expanded) ...[
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            AppTranslations.tr('teacher_space', lang: lang),
                            style: AppTypography.caption.copyWith(
                              color: AppColors.teacherDot,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),

          // Nav Items grouped by section
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 12),
              children: [
                if (expanded)
                  _buildSectionHeader(_getSectionTitle('TEACHING', lang)),
                ..._navItems
                    .where((i) => i['section'] == 'TEACHING')
                    .map((i) => _buildNavItem(i, lang, expanded: expanded)),
                const SizedBox(height: 16),
                if (expanded)
                  _buildSectionHeader(_getSectionTitle('SESSIONS', lang)),
                ..._navItems
                    .where((i) => i['section'] == 'SESSIONS')
                    .map((i) => _buildNavItem(i, lang, expanded: expanded)),
                const SizedBox(height: 16),
                if (expanded)
                  _buildSectionHeader(_getSectionTitle('ACCOUNT', lang)),
                ..._navItems
                    .where((i) => i['section'] == 'ACCOUNT')
                    .map((i) => _buildNavItem(i, lang, expanded: expanded)),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.borderSoft),
          // Bottom profile tile
          Padding(
            padding: EdgeInsets.all(expanded ? 16 : 10),
            child: InkWell(
              onTap: () => _onTabSelected(8),
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.frenchNavy,
                      foregroundColor: AppColors.pureWhite,
                      child: Text(
                        user?.fullName.isNotEmpty == true
                            ? user!.fullName[0].toUpperCase()
                            : 'P',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (expanded) ...[
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.fullName ??
                                  (lang == 'en' ? 'Teacher' : 'Professeur'),
                              style: AppTypography.bodySmall.copyWith(
                                fontWeight: FontWeight.w700,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              AppTranslations.tr('nav_profile', lang: lang),
                              style: AppTypography.caption.copyWith(
                                color: AppColors.textSubtle,
                              ),
                            ),
                          ],
                        ),
                      ),
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

  Widget _buildDrawer(dynamic user, String lang) {
    return Drawer(
      backgroundColor: AppColors.pureWhite,
      child: SafeArea(
        child: Column(
          children: [
            const TricoloreBar(height: 4),
            // Brand Logo Banner
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
              child: Row(
                children: [
                  const BrandMark(size: 38, borderRadius: 10),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Learn French',
                          style: AppTypography.bodyMedium.copyWith(
                            fontWeight: FontWeight.w800,
                            color: AppColors.frenchNavy,
                            height: 1.1,
                          ),
                        ),
                        Text(
                          'with Natives',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w600,
                            height: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.borderSoft),
            // Teacher Profile Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.frenchNavy,
                    foregroundColor: AppColors.pureWhite,
                    child: Text(
                      user?.fullName.isNotEmpty == true
                          ? user!.fullName[0].toUpperCase()
                          : 'P',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.teacherDot,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              AppTranslations.tr('teacher_space', lang: lang),
                              style: AppTypography.caption.copyWith(
                                color: AppColors.teacherDot,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.fullName ??
                              (lang == 'en' ? 'Teacher' : 'Professeur'),
                          style: AppTypography.titleSmall.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          user?.email ?? '',
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
            const Divider(height: 1, color: AppColors.borderSoft),

            // All 9 Tabs in Drawer
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: [
                  _buildSectionHeader(_getSectionTitle('TEACHING', lang)),
                  ..._navItems
                      .where((i) => i['section'] == 'TEACHING')
                      .map((i) => _buildNavItem(i, lang)),
                  const SizedBox(height: 12),
                  _buildSectionHeader(_getSectionTitle('SESSIONS', lang)),
                  ..._navItems
                      .where((i) => i['section'] == 'SESSIONS')
                      .map((i) => _buildNavItem(i, lang)),
                  const SizedBox(height: 12),
                  _buildSectionHeader(_getSectionTitle('ACCOUNT', lang)),
                  ..._navItems
                      .where((i) => i['section'] == 'ACCOUNT')
                      .map((i) => _buildNavItem(i, lang)),
                ],
              ),
            ),

            const Divider(height: 1, color: AppColors.borderSoft),
            // Language Switcher in Drawer
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    AppTranslations.tr('language', lang: lang),
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const LanguageSwitcherButton(),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.borderSoft),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.bad),
              title: Text(
                AppTranslations.tr('logout', lang: lang),
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.bad,
                  fontWeight: FontWeight.w600,
                ),
              ),
              onTap: () async {
                Navigator.pop(context);
                await ref.read(authNotifierProvider.notifier).logout();
                // The app returns to the sign-in screen on its own (main.dart).
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      child: Text(
        title,
        style: AppTypography.caption.copyWith(
          color: AppColors.textSubtle,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
          fontSize: 10,
        ),
      ),
    );
  }

  Widget _buildNavItem(
    Map<String, dynamic> item,
    String lang, {
    bool expanded = true,
  }) {
    final idx = item['index'] as int;
    final isSelected = _currentIndex == idx;

    final itemWidget = Padding(
      padding: EdgeInsets.symmetric(
        horizontal: expanded ? 12 : 10,
        vertical: 3,
      ),
      child: InkWell(
        onTap: () => _onTabSelected(idx),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: expanded ? 12 : 0,
            vertical: 11,
          ),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.teacherRoseBg : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: expanded
                ? MainAxisAlignment.start
                : MainAxisAlignment.center,
            children: [
              Icon(
                item['icon'] as IconData,
                size: 18,
                color: isSelected ? AppColors.teacherDot : AppColors.textMuted,
              ),
              if (expanded) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _getNavTitle(item, lang),
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: isSelected
                          ? FontWeight.w700
                          : FontWeight.w500,
                      color: isSelected ? AppColors.teacherDot : AppColors.text,
                    ),
                  ),
                ),
              ],
              if (expanded && isSelected)
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: AppColors.teacherDot,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );

    if (expanded) return itemWidget;
    return Tooltip(
      message: _getNavTitle(item, lang),
      waitDuration: const Duration(milliseconds: 350),
      child: itemWidget,
    );
  }
}
