import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/localization/translations.dart';
import '../../../core/navigation/space_shell.dart';
import '../assign_demo/screens/assign_demo_screen.dart';
import '../batches/screens/my_batches_screen.dart';
import '../dashboard/screens/teacher_dashboard_screen.dart';
import '../exam_prep/screens/exam_prep_screen.dart';
import '../meetings/screens/live_meetings_screen.dart';
import '../profile/screens/profile_settings_screen.dart';
import '../quizzes/screens/quiz_management_screen.dart';
import '../resources/screens/resources_screen.dart';
import '../schedule/screens/schedule_screen.dart';

Localized _tr(String key) => (lang) => AppTranslations.tr(key, lang: lang);

/// The teacher space: its screens, grouped as in the web app.
class TeacherShell extends StatelessWidget {
  final int initialTab;

  const TeacherShell({super.key, this.initialTab = 0});

  static final _sections = [
    SpaceSection('teaching', _tr('nav_teaching')),
    SpaceSection('sessions', _tr('nav_sessions')),
    SpaceSection('account', _tr('nav_account')),
  ];

  static final _items = [
    SpaceNavItem(section: 'teaching', icon: Icons.grid_view_outlined, label: _tr('nav_dashboard')), // 0
    SpaceNavItem(section: 'teaching', icon: Icons.groups_outlined, label: _tr('nav_batches')), // 1
    SpaceNavItem(section: 'teaching', icon: Icons.quiz_outlined, label: _tr('nav_quizzes')), // 2
    SpaceNavItem(section: 'teaching', icon: Icons.school_outlined, label: _tr('nav_exam_prep')), // 3
    SpaceNavItem(section: 'teaching', icon: Icons.folder_open_outlined, label: _tr('nav_resources')), // 4
    SpaceNavItem(section: 'sessions', icon: Icons.calendar_today_outlined, label: _tr('nav_schedule')), // 5
    SpaceNavItem(section: 'sessions', icon: Icons.video_camera_front_outlined, label: _tr('nav_meetings')), // 6
    SpaceNavItem(section: 'sessions', icon: Icons.assignment_ind_outlined, label: _tr('nav_assign_demo')), // 7
    SpaceNavItem(section: 'account', icon: Icons.manage_accounts_outlined, label: _tr('nav_profile')), // 8
  ];

  @override
  Widget build(BuildContext context) {
    return SpaceShell(
      spaceLabel: _tr('teacher_space'),
      accent: AppColors.teacherDot,
      accentBg: AppColors.teacherRoseBg,
      sections: _sections,
      items: _items,
      profileIndex: 8,
      initialTab: initialTab,
      fallbackName: (lang) => lang == 'en' ? 'Teacher' : 'Professeur',
      pages: (navigate) => [
        TeacherDashboardScreen(onNavigateTab: navigate), // 0
        const MyBatchesScreen(), // 1
        const QuizManagementScreen(), // 2
        const ExamPrepScreen(), // 3
        const ResourcesScreen(), // 4
        ScheduleScreen(onNavigateTab: navigate), // 5
        const LiveMeetingsScreen(), // 6
        AssignDemoScreen(onNavigateTab: navigate), // 7
        const ProfileSettingsScreen(), // 8
      ],
    );
  }
}
