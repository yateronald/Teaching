import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/widgets/brand_logo.dart';
import '../../../core/widgets/tricolore_bar.dart';
import '../../auth/screens/welcome_screen.dart';
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
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  final List<Map<String, dynamic>> _navItems = [
    // TEACHING
    {'index': 0, 'section': 'TEACHING', 'title': 'Dashboard', 'icon': Icons.grid_view_outlined},
    {'index': 1, 'section': 'TEACHING', 'title': 'My Batches', 'icon': Icons.groups_outlined},
    {'index': 2, 'section': 'TEACHING', 'title': 'Quiz Management', 'icon': Icons.quiz_outlined},
    {'index': 3, 'section': 'TEACHING', 'title': 'Exam Preparation', 'icon': Icons.school_outlined},
    {'index': 4, 'section': 'TEACHING', 'title': 'Resources', 'icon': Icons.folder_open_outlined},

    // SESSIONS
    {'index': 5, 'section': 'SESSIONS', 'title': 'Schedule', 'icon': Icons.calendar_today_outlined},
    {'index': 6, 'section': 'SESSIONS', 'title': 'Live Meetings', 'icon': Icons.video_camera_front_outlined},
    {'index': 7, 'section': 'SESSIONS', 'title': 'Assign Demo', 'icon': Icons.assignment_ind_outlined},

    // ACCOUNT
    {'index': 8, 'section': 'ACCOUNT', 'title': 'Profile Settings', 'icon': Icons.manage_accounts_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
  }

  void _onTabSelected(int idx) {
    setState(() => _currentIndex = idx);
    if (_scaffoldKey.currentState?.isDrawerOpen == true) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 850;
    final user = ref.watch(authNotifierProvider).user;

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
            _buildSidebar(user),
            const VerticalDivider(width: 1, color: AppColors.border),
            Expanded(
              child: Column(
                children: [
                  const TricoloreBar(height: 3),
                  _buildTabletTopBar(user),
                  const Divider(height: 1, color: AppColors.borderSoft),
                  Expanded(
                    child: IndexedStack(
                      index: _currentIndex,
                      children: pages,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Mobile Layout with AppBar, Drawer, and BottomNavigationBar
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
        title: Row(
          children: [
            const BrandMark(size: 28, borderRadius: 8),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _navItems[_currentIndex]['title'] as String,
                style: AppTypography.titleMedium.copyWith(color: AppColors.frenchNavy),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: GestureDetector(
              onTap: () => _onTabSelected(8),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.frenchNavy,
                foregroundColor: AppColors.pureWhite,
                child: Text(
                  user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
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
      drawer: _buildDrawer(user),
      body: IndexedStack(
        index: _currentIndex,
        children: pages,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _mapCurrentIndexToBottomBar(),
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.pureWhite,
        selectedItemColor: AppColors.teacherDot,
        unselectedItemColor: AppColors.textMuted,
        selectedLabelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
        unselectedLabelStyle: AppTypography.caption,
        onTap: (barIdx) {
          switch (barIdx) {
            case 0:
              _onTabSelected(0); // Dashboard
              break;
            case 1:
              _onTabSelected(1); // Batches
              break;
            case 2:
              _onTabSelected(5); // Schedule
              break;
            case 3:
              _onTabSelected(6); // LiveKit Meetings
              break;
            case 4:
              _scaffoldKey.currentState?.openDrawer(); // All 9 tabs menu
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view),
            label: 'Tableau',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.groups_outlined),
            activeIcon: Icon(Icons.groups),
            label: 'Cohortes',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today_outlined),
            activeIcon: Icon(Icons.calendar_today),
            label: 'Planning',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.videocam_outlined),
            activeIcon: Icon(Icons.videocam),
            label: 'Direct',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.menu),
            label: 'Menu (9)',
          ),
        ],
      ),
    );
  }

  int _mapCurrentIndexToBottomBar() {
    if (_currentIndex == 0) return 0;
    if (_currentIndex == 1) return 1;
    if (_currentIndex == 5) return 2;
    if (_currentIndex == 6) return 3;
    return 4; // Highlight 'Menu' for other tabs (Quizzes, Exam prep, Resources, Demos, Profile)
  }

  Widget _buildTabletTopBar(dynamic user) {
    return Container(
      color: AppColors.pureWhite,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            _navItems[_currentIndex]['title'] as String,
            style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w700, color: AppColors.frenchNavy),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSoft,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.public, size: 14, color: AppColors.textMuted),
                    const SizedBox(width: 6),
                    Text(
                      user?.timezone ?? 'Europe/Paris',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 14),
              GestureDetector(
                onTap: () => _onTabSelected(8),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.frenchNavy,
                      foregroundColor: AppColors.pureWhite,
                      child: Text(
                        user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      user?.fullName ?? 'Professeur',
                      style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
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

  Widget _buildSidebar(dynamic user) {
    return Container(
      width: 250,
      color: AppColors.pureWhite,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Teacher Space Banner
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const BrandLogo(height: 40, tight: true),
                const SizedBox(height: 14),
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
                    const SizedBox(width: 8),
                    Text(
                      'Teacher space',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.teacherDot,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
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
                _buildSectionHeader('TEACHING'),
                ..._navItems.where((i) => i['section'] == 'TEACHING').map(_buildNavItem),
                const SizedBox(height: 16),
                _buildSectionHeader('SESSIONS'),
                ..._navItems.where((i) => i['section'] == 'SESSIONS').map(_buildNavItem),
                const SizedBox(height: 16),
                _buildSectionHeader('ACCOUNT'),
                ..._navItems.where((i) => i['section'] == 'ACCOUNT').map(_buildNavItem),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.borderSoft),
          // Bottom profile tile
          Padding(
            padding: const EdgeInsets.all(16),
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
                        user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.fullName ?? 'Professeur',
                            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Paramètres',
                            style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(dynamic user) {
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
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.frenchNavy,
                    foregroundColor: AppColors.pureWhite,
                    child: Text(
                      user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
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
                              'Teacher space',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.teacherDot,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user?.fullName ?? 'Professeur',
                          style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          user?.email ?? '',
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
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
                  _buildSectionHeader('TEACHING'),
                  ..._navItems.where((i) => i['section'] == 'TEACHING').map(_buildNavItem),
                  const SizedBox(height: 12),
                  _buildSectionHeader('SESSIONS'),
                  ..._navItems.where((i) => i['section'] == 'SESSIONS').map(_buildNavItem),
                  const SizedBox(height: 12),
                  _buildSectionHeader('ACCOUNT'),
                  ..._navItems.where((i) => i['section'] == 'ACCOUNT').map(_buildNavItem),
                ],
              ),
            ),

            const Divider(height: 1, color: AppColors.borderSoft),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.bad),
              title: Text('Déconnexion', style: AppTypography.bodyMedium.copyWith(color: AppColors.bad, fontWeight: FontWeight.w600)),
              onTap: () async {
                Navigator.pop(context);
                await ref.read(authNotifierProvider.notifier).logout();
                if (mounted) {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (context) => const WelcomeScreen()),
                    (route) => false,
                  );
                }
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

  Widget _buildNavItem(Map<String, dynamic> item) {
    final idx = item['index'] as int;
    final isSelected = _currentIndex == idx;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: InkWell(
        onTap: () => _onTabSelected(idx),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.teacherRoseBg : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                item['icon'] as IconData,
                size: 18,
                color: isSelected ? AppColors.teacherDot : AppColors.textMuted,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  item['title'] as String,
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? AppColors.teacherDot : AppColors.text,
                  ),
                ),
              ),
              if (isSelected)
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
  }
}
