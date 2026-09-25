import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/localization/translations.dart';
import '../../../core/navigation/space_shell.dart';
import '../../teacher/profile/screens/profile_settings_screen.dart';
import '../common/admin_nav.dart';
import '../common/admin_state.dart';
import '../attendance/attendance_screen.dart';
import '../batches/batches_screen.dart';
import '../dashboard/admin_dashboard_screen.dart';
import '../demo_requests/demo_requests_screen.dart';
import '../exam_prep/exam_prep_screen.dart';
import '../monitoring/monitoring_screen.dart';
import '../resources/admin_resources_screen.dart';
import '../settings/admin_settings_screen.dart';
import '../timetable/timetable_screen.dart';
import '../users/users_screen.dart';

Localized _t(String fr, String en) => (lang) => lang == 'en' ? en : fr;

/// The admin space: the same screens as the web admin console, grouped the
/// same way (Management, Content, System), plus the profile.
class AdminShell extends ConsumerStatefulWidget {
  final int initialTab;
  const AdminShell({super.key, this.initialTab = AdminTab.dashboard});

  @override
  ConsumerState<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends ConsumerState<AdminShell> {
  static final _sections = [
    SpaceSection('management', _t('GESTION', 'MANAGEMENT')),
    SpaceSection('content', _t('CONTENUS', 'CONTENT')),
    SpaceSection('system', _t('SYSTÈME', 'SYSTEM')),
    SpaceSection('account', (lang) => AppTranslations.tr('nav_account', lang: lang)),
  ];

  static final _items = [
    SpaceNavItem(section: 'management', icon: Icons.grid_view_outlined, label: _t('Tableau de bord', 'Dashboard')),
    SpaceNavItem(section: 'management', icon: Icons.people_alt_outlined, label: _t('Utilisateurs', 'Users')),
    SpaceNavItem(section: 'management', icon: Icons.groups_outlined, label: _t('Promotions', 'Batches')),
    SpaceNavItem(
      section: 'management',
      icon: Icons.support_agent_outlined,
      label: _t('Demandes de démo', 'Demo requests'),
      badge: (ref) => ref.watch(newDemoRequestsProvider),
    ),
    SpaceNavItem(section: 'management', icon: Icons.calendar_month_outlined, label: _t('Emploi du temps', 'Teacher timetable')),
    SpaceNavItem(section: 'management', icon: Icons.fact_check_outlined, label: _t('Présences', 'Attendance')),
    SpaceNavItem(section: 'content', icon: Icons.folder_open_outlined, label: _t('Ressources', 'Resources')),
    SpaceNavItem(section: 'content', icon: Icons.school_outlined, label: _t('Préparation aux examens', 'Exam preparation')),
    SpaceNavItem(
      section: 'system',
      icon: Icons.insights_outlined,
      label: _t('Suivi du site', 'Monitoring'),
      visible: (ref) => ref.watch(authNotifierProvider).user?.mayViewMonitoring ?? false,
    ),
    SpaceNavItem(section: 'system', icon: Icons.settings_outlined, label: _t('Paramètres', 'Settings')),
    SpaceNavItem(section: 'account', icon: Icons.manage_accounts_outlined, label: (lang) => AppTranslations.tr('nav_profile', lang: lang)),
  ];

  @override
  void initState() {
    super.initState();
    // The menu badge is right from the first screen, whichever it is.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) refreshDemoBadge(ref);
    });
  }

  @override
  Widget build(BuildContext context) {
    return SpaceShell(
      spaceLabel: _t('Console d’administration', 'Admin console'),
      accent: AppColors.adminAccent,
      accentBg: AppColors.adminAccentBg,
      sections: _sections,
      items: _items,
      profileIndex: AdminTab.profile,
      initialTab: widget.initialTab,
      fallbackName: _t('Administrateur', 'Administrator'),
      pages: (navigate) => [
        AdminDashboardScreen(onNavigate: navigate), // 0
        const UsersScreen(), // 1
        const BatchesScreen(), // 2
        const DemoRequestsScreen(), // 3
        const TimetableScreen(), // 4
        const AttendanceScreen(), // 5
        const AdminResourcesScreen(), // 6
        const AdminExamPrepScreen(), // 7
        const MonitoringScreen(), // 8, only reachable with the monitoring key
        const AdminSettingsScreen(), // 9
        const ProfileSettingsScreen(), // 10
      ],
    );
  }
}
