import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/core/navigation/space_shell.dart';
import 'package:mobile/features/admin/attendance/attendance_screen.dart';
import 'package:mobile/features/admin/batches/batches_screen.dart';
import 'package:mobile/features/admin/common/admin_kit.dart';
import 'package:mobile/features/admin/companies/companies_screen.dart';
import 'package:mobile/features/admin/companies/company_detail_panel.dart';
import 'package:mobile/features/admin/companies/company_editor_panel.dart';
import 'package:mobile/features/admin/dashboard/admin_dashboard_screen.dart';
import 'package:mobile/features/admin/demo_requests/demo_requests_screen.dart';
import 'package:mobile/features/admin/exam_prep/ai_credits_screen.dart';
import 'package:mobile/features/admin/exam_prep/assignments.dart';
import 'package:mobile/features/admin/exam_prep/comprehension_screens.dart';
import 'package:mobile/features/admin/exam_prep/exam_common.dart';
import 'package:mobile/features/admin/exam_prep/exam_prep_screen.dart';
import 'package:mobile/features/admin/exam_prep/exam_results_screen.dart';
import 'package:mobile/features/admin/exam_prep/expression_screens.dart';
import 'package:mobile/features/admin/monitoring/monitoring_screen.dart';
import 'package:mobile/features/admin/monitoring/world_map.dart';
import 'package:mobile/features/admin/resources/admin_resources_screen.dart';
import 'package:mobile/features/admin/settings/admin_settings_screen.dart';
import 'package:mobile/features/admin/timetable/timetable_screen.dart';
import 'package:mobile/features/admin/users/users_screen.dart';

/// Answers like the server, from canned data, and records what is sent.
class _FakeAdminApi extends ApiClient {
  _FakeAdminApi() : super(customBaseUrl: 'http://test.invalid/api');

  final sent = <String, dynamic>{};

  static final _question = {
    'id': 51,
    'question_order': 1,
    'question_text': 'Où la femme veut-elle aller ce week-end avec ses deux enfants et son mari ?',
    'option_a': 'À la plage',
    'option_b': 'Au cinéma',
    'option_c': 'Chez ses parents',
    'option_d': 'Au musée d’art moderne de la ville',
    'correct_answer': 'C',
    'cefr_level': 'B1',
    'points': 9,
    'audio_kdrive_file_id': null,
    'image_url': null,
  };

  static Map<String, dynamic> company({int id = 4, String state = 'active', int seatLimit = 5, int seatsUsed = 3, String ends = '2030-06-30T23:59:59Z'}) => {
        'id': id,
        'name': 'Société Générale des Transports du Littoral',
        'display_name': 'SGTL Formation',
        'slug': 'sgtl-formation',
        'default_language': 'fr',
        'status': state == 'suspended' ? 'suspended' : 'active',
        'state': state,
        'access_starts_at': '2026-01-01T00:00:00Z',
        'access_ends_at': ends,
        'days_left': state == 'active' ? 1200 : 0,
        'expiring_soon': false,
        'seat_limit': seatLimit,
        'seats_used': seatsUsed,
        'seats_left': seatLimit - seatsUsed,
        'active_learners': seatsUsed - 1,
        'learners': seatsUsed,
        'managers': 1,
        'notes': null,
        'brand': {'name': 'SGTL Formation', 'slug': 'sgtl-formation', 'logo_url': null},
        'credits': {
          'ee': {'reserve': 12, 'with_learners': 6, 'used': 4, 'granted': 22},
          'eo': {'reserve': 3, 'with_learners': 2, 'used': 0, 'granted': 5},
        },
      };

  static final Map<String, dynamic> _routes = {
    '/admin/organizations': [
      company(),
      company(id: 5, state: 'expired', seatLimit: 10, seatsUsed: 10, ends: '2025-12-31T23:59:59Z'),
      company(id: 6, state: 'suspended'),
    ],
    '/admin/organizations/4': {
      ...company(seatLimit: 3),
      'content': [
        {'content_type': 'category', 'content_id': 2, 'name': 'Compréhension Orale'},
        {'content_type': 'ee_year', 'content_id': 7, 'name': 'Expression Écrite › 2026'},
      ],
      'managers': [
        {'id': 40, 'first_name': 'Mariam', 'last_name': 'Kouassi-Bamba', 'email': 'mariam.kouassi@sgtl.example', 'is_active': true, 'invitation_pending': true},
      ],
    },
    '/admin/organizations/4/learners': [
      {'id': 41, 'first_name': 'Awa', 'last_name': 'Diallo', 'email': 'awa@sgtl.example', 'is_active': true, 'ee_credits': 3, 'eo_credits': 1, 'invitation_pending': false},
      {'id': 42, 'first_name': 'Koffi', 'last_name': 'Yao', 'email': 'koffi@sgtl.example', 'is_active': false, 'ee_credits': 0, 'eo_credits': 0, 'unused': true},
    ],
    '/admin/organizations/4/credits': {
      'credits': {},
      'items': [
        {'id': 1, 'credit_type': 'ee', 'delta': 20, 'reason': 'admin_grant', 'notes': 'Initial credits', 'created_at': '2026-09-01T10:00:00Z'},
        {'id': 2, 'credit_type': 'ee', 'delta': -3, 'reason': 'distribute', 'learner_first_name': 'Awa', 'learner_last_name': 'Diallo', 'created_at': '2026-09-02T10:00:00Z'},
      ],
    },
    '/admin/organizations/4/history': {
      'summary': {
        'access': {
          'starts_at': '2026-01-01T00:00:00Z', 'original_end': '2026-12-31T23:59:59Z', 'current_end': '2030-06-30T23:59:59Z',
          'extensions': 2, 'shortenings': 0, 'days_added': 1277, 'last_change': null,
        },
        'credits': {'granted': {'ee': 22, 'eo': 5}, 'revoked': {'ee': 0, 'eo': 0}, 'reserve': {'ee': 12, 'eo': 3}, 'movements': 1, 'last_at': '2026-09-03T10:00:00Z'},
        'package': {'original': 5, 'current': 3, 'changes': 1},
        'status': {'current': 'active', 'suspensions': 1, 'last_change': null},
      },
      'items': [
        {
          'id': 5, 'action': 'dates_changed', 'category': 'access', 'created_at': '2026-09-04T10:00:00Z',
          'details': {'access_ends_at': {'from': '2026-12-31T23:59:59Z', 'to': '2027-03-31T23:59:59Z'}, 'note': 'Contract renewed, invoice 2026-114'},
          'actor': {'name': 'Ada Admin', 'email': 'ada@lfwn.example', 'role': 'admin'},
        },
        {
          'id': 4, 'action': 'credits_granted', 'category': 'credits', 'created_at': '2026-09-03T10:00:00Z',
          'details': {'amounts': {'ee': 10}, 'before': {'ee': 2, 'eo': 3}, 'reserve': {'ee': 12, 'eo': 3}, 'notes': 'INV-204'},
          'actor': {'name': 'Ada Admin', 'email': 'ada@lfwn.example', 'role': 'admin'},
        },
        {
          'id': 3, 'action': 'credits_distributed', 'category': 'handouts', 'created_at': '2026-09-02T10:00:00Z',
          'details': {'amounts': {'ee': 3, 'eo': 1}, 'learners': 1},
          'actor': {'name': 'Mariam Kouassi-Bamba', 'email': 'mariam.kouassi@sgtl.example', 'role': 'org_admin'},
        },
        {'id': 1, 'action': 'company_created', 'category': 'created', 'created_at': '2026-09-01T10:00:00Z', 'details': {'access_ends_at': '2026-12-31T23:59:59Z', 'seat_limit': 5}, 'actor': null},
      ],
      'next_before': null,
    },
    '/monitoring/geo': {
      'totals': {'countries': 3, 'visits': 900, 'visitors': 310, 'unplaced': 20},
      'countries': [
        {'country': 'FR', 'visits': 500, 'visitors': 160, 'sessions': 220, 'share': 55.6, 'bounce_rate': 41, 'avg_seconds': 95, 'load_p75': 820, 'lcp_p75': 1400, 'ttfb_p75': 180,
         'phone': 300, 'tablet': 20, 'desktop': 180, 'search': 200, 'social': 50, 'campaign': 10, 'top_page': '/tcf-canada'},
        {'country': 'CA', 'visits': 280, 'visitors': 110, 'sessions': 140, 'share': 31.1, 'bounce_rate': 35, 'avg_seconds': 120, 'load_p75': 640, 'lcp_p75': 1100, 'ttfb_p75': 150,
         'phone': 120, 'tablet': 10, 'desktop': 150, 'search': 90, 'social': 20, 'campaign': 5, 'top_page': '/'},
        {'country': 'CM', 'visits': 100, 'visitors': 40, 'sessions': 60, 'share': 11.1, 'bounce_rate': 55, 'avg_seconds': 60, 'load_p75': 2600, 'lcp_p75': 3900, 'ttfb_p75': 700,
         'phone': 90, 'tablet': 0, 'desktop': 10, 'search': 30, 'social': 40, 'campaign': 0, 'top_page': '/login'},
        {'country': '??', 'visits': 20, 'visitors': 8, 'sessions': 10, 'share': 2.2, 'bounce_rate': 50, 'avg_seconds': 30, 'phone': 10, 'tablet': 0, 'desktop': 10},
      ],
    },
    '/tcf/categories': [
      {'id': 1, 'name': 'Compréhension Écrite', 'description': 'Lire et comprendre des documents du quotidien', 'series_count': 40, 'question_count': 1560},
      {'id': 2, 'name': 'Compréhension Orale', 'description': 'Écouter', 'series_count': 38, 'question_count': 1482},
      {'id': 3, 'name': 'Expression Écrite', 'description': null, 'series_count': 3, 'sub_count': 120},
      {'id': 4, 'name': 'Expression Orale', 'description': null, 'series_count': 2, 'sub_count': 64},
    ],
    '/tcf/exam-assignments/content-tree': [
      {
        'id': 2,
        'type': 'category',
        'name': 'Compréhension Orale',
        'children': [
          {'id': 5, 'type': 'co_series', 'name': 'Série 5', 'total_questions': 39},
          {'id': 6, 'type': 'co_series', 'name': 'Série 6', 'total_questions': 39},
        ],
      },
      {
        'id': 3,
        'type': 'category',
        'name': 'Expression Écrite',
        'children': [
          {
            'id': 7,
            'type': 'ee_year',
            'year': 2026,
            'children': [
              {'id': 8, 'type': 'ee_month', 'month': 9, 'month_name': 'Septembre', 'children': []},
            ],
          },
        ],
      },
    ],
    '/tcf/exam-assignments': [
      {
        'group_id': 'g1',
        'group_name': 'CO Série 5, EE 2026 pour la promotion du soir',
        'assigned_at': '2026-09-01T10:00:00Z',
        'expires_at': '2030-01-01T10:00:00Z',
        'is_expired': false,
        'recipients': [
          {'key': 'batch:3', 'type': 'batch', 'name': 'B1 Soir'},
          {'key': 'student:9', 'type': 'student', 'name': 'Awa Diallo'},
        ],
        'items': [
          {'id': 1, 'content_type': 'co_series', 'content_id': 5, 'content_name': 'Série 5'},
          {'id': 2, 'content_type': 'ee_year', 'content_id': 7, 'content_name': '2026'},
        ],
      },
    ],
    '/tcf/co/categories/2/series': [
      {'id': 5, 'name': 'Série 5', 'total_questions': 39, 'total_points': 699, 'duration_minutes': 35, 'cefr_distribution': {'A1': 4, 'A2': 6, 'B1': 10, 'B2': 10, 'C1': 5, 'C2': 4}},
      {'id': 6, 'name': 'Série 6', 'total_questions': 30, 'total_points': 540, 'duration_minutes': 35, 'cefr_distribution': {'B1': 30}},
    ],
    '/tcf/co/series/5': {
      'id': 5,
      'name': 'Série 5',
      'description': 'Série complète',
      'duration_minutes': 35,
      'cefr_thresholds': '{"A1":0,"A2":100,"B1":200,"B2":300,"C1":400,"C2":500}',
      'intro_audio_kdrive_file_id': null,
      'questions': [_question, {..._question, 'id': 52, 'question_order': 2, 'cefr_level': 'C1'}],
    },
    '/tcf/ee/categories/3/years': [
      {'id': 7, 'year': 2026, 'month_count': 9},
      {'id': 6, 'year': 2025, 'month_count': 12},
    ],
    '/tcf/eo/months/11/parties': [
      {
        'id': 21,
        'name': 'Partie 1',
        'display_order': 1,
        'taches': [
          {
            'id': 31,
            'task_number': 1,
            'task_type': 'presentation',
            'prompt_text': 'Présentez-vous.',
            'prep_minutes': 0,
            'duration_minutes': 2,
            'points': [
              {'id': 41, 'point_number': 1, 'title': 'Identité', 'subtitle': 'Nom, âge, ville'},
            ],
          },
          {
            'id': 32,
            'task_number': 2,
            'task_type': 'interaction',
            'prompt_text': null,
            'prep_minutes': 2,
            'duration_minutes': 3.5,
            'sujets': [
              {'id': 61, 'sujet_number': 1, 'prompt_text': 'Vous voulez louer un appartement au centre-ville. Posez des questions au propriétaire.', 'duration_seconds': 210, 'correction_text': 'Bonjour, je vous appelle au sujet de l’annonce…'},
            ],
          },
        ],
      },
    ],
    '/users': [
      {'id': 9, 'first_name': 'Awa', 'last_name': 'Diallo', 'email': 'awa@example.com', 'role': 'student'},
    ],
    '/batches': [
      {
        'id': 3,
        'name': 'B1 Soir · préparation intensive TCF Canada',
        'student_count': 12,
        'french_level': 'B1',
        'start_date': '2026-09-01',
        'end_date': '2026-12-20',
        'teacher_id': 4,
        'teacher_first_name': 'Marie-Hélène',
        'teacher_last_name': 'Dubois-Lefebvre',
      },
    ],
    '/batches/timetable': [
      {'id': 1, 'batch_id': 3, 'batch_name': 'B1 Soir', 'day_of_week': 1, 'start_time': '18:00', 'end_time': '20:00', 'timezone': 'America/Toronto', 'teacher_first_name': 'Marie-Hélène', 'teacher_last_name': 'Dubois-Lefebvre', 'teacher_id': 4, 'french_level': 'B1'},
      {'id': 2, 'batch_id': 3, 'batch_name': 'B1 Soir', 'day_of_week': 3, 'start_time': '18:30', 'end_time': '20:00', 'timezone': 'America/Toronto', 'teacher_first_name': 'Marie-Hélène', 'teacher_last_name': 'Dubois-Lefebvre', 'teacher_id': 4, 'french_level': 'B1'},
    ],
    '/demo-requests': {
      'data': [
        {'id': 1, 'first_name': 'Jean-Baptiste', 'last_name': 'Nkemdirim-Okafor', 'email': 'jean-baptiste.nkemdirim@example.com', 'phone': '+1 514 555 0100', 'status': 'new', 'interest': 'tcf_canada', 'created_at': '2026-09-20T10:00:00Z'},
      ],
      'statistics': {'total_requests': 1, 'new_requests': 1},
      'pagination': {'total': 1},
    },
    '/attendance/reports/sessions': {
      'sessions': [
        {'id': 1, 'session_id': 1, 'title': 'Subjonctif présent', 'start_time': '2026-09-20T22:00:00Z', 'end_time': '2026-09-20T23:30:00Z', 'batch_id': 3, 'batch_name': 'B1 Soir', 'teacher_id': 4, 'teacher_name': 'Marie-Hélène Dubois-Lefebvre', 'total_students': 12, 'present_count': 8, 'late_count': 2, 'absent_count': 2},
      ],
    },
    '/resources': [
      {'id': 1, 'title': 'Fiche de grammaire : le subjonctif présent et ses emplois', 'file_type': 'pdf', 'file_name': 'subjonctif.pdf', 'file_size': 240000, 'created_at': '2026-09-10T10:00:00Z', 'uploaded_by': 4, 'uploader_name': 'Marie-Hélène Dubois-Lefebvre'},
    ],
    '/ai-credits/balances': [
      {'user_id': 9, 'first_name': 'Awa', 'last_name': 'Diallo-Konaté', 'email': 'awa.diallo.konate@example.com', 'role': 'candidate', 'ee_credits': 12, 'eo_credits': 3},
    ],
    '/tcf-results/student/9': {
      'student': {'id': 9, 'first_name': 'Awa', 'last_name': 'Diallo', 'email': 'awa@example.com'},
      'ce': [],
      'co': [
        {'id': 1, 'series_name': 'Série 5', 'completed_at': '2026-09-02T10:00:00Z', 'score_percentage': 62, 'correct_count': 24, 'total_questions': 39, 'earned_points': 420, 'total_points': 699, 'cefr_level': 'B2'},
        {'id': 2, 'series_name': 'Série 6', 'completed_at': '2026-09-12T10:00:00Z', 'score_percentage': 74, 'correct_count': 29, 'total_questions': 39, 'earned_points': 510, 'total_points': 699, 'cefr_level': 'C1'},
      ],
      'ee': [
        {'id': 3, 'combinaison_name': 'Combinaison 1', 'submitted_at': '2026-09-05T10:00:00Z', 'average_score': 13.5, 'overall_level': 'B2', 'task1_score': 14, 'task2_score': 13, 'task3_score': 13.5, 'month_name': 'Septembre', 'year': 2026},
      ],
      'eo': [],
    },
    '/admin/settings': {
      'settings': [
        {'setting_key': 'code_length', 'setting_value': '6', 'updated_at': '2026-09-01T10:00:00Z'},
        {'setting_key': 'require_code_for_attendance', 'setting_value': 'true'},
      ],
    },
    '/monitoring/overview': {
      'ready': true,
      'range': {'key': '7d', 'bucket': 'day'},
      'kpis': {
        'visits': 1240,
        'visitors': 830,
        'sessions': 910,
        'bounce_rate': 41,
        'avg_seconds': 95,
        'live_visitors': 2,
        'change': {'visits': 12, 'visitors': -4, 'sessions': 3, 'bounce_rate': -2, 'avg_seconds': null},
      },
      'series': [
        {'at': '2026-09-18T00:00:00Z', 'visits': 150, 'visitors': 110},
        {'at': '2026-09-19T00:00:00Z', 'visits': 190, 'visitors': 130},
        {'at': '2026-09-20T00:00:00Z', 'visits': 170, 'visitors': 120},
      ],
      'countries': [
        {'country': 'CA', 'visits': 700},
        {'country': 'CI', 'visits': 200},
        {'country': '??', 'visits': 10},
      ],
      'pages': [
        {'path': '/fr/preparation-tcf-canada-comprehension-orale-en-ligne', 'visits': 300},
      ],
      'channels': [
        {'channel': 'search', 'visits': 600},
      ],
      'referrers': [],
      'campaigns': [
        {'name': null, 'source': 'facebook', 'medium': 'cpc', 'visits': 40},
      ],
      'devices': [
        {'name': 'phone', 'visits': 900},
      ],
      'browsers': [],
      'systems': [],
      'languages': [],
    },
  };

  Response<T> _ok<T>(String path, dynamic data) => Response<T>(requestOptions: RequestOptions(path: path), statusCode: 200, data: data as T);

  /// The query of the last request to each path.
  final queries = <String, Map<String, dynamic>?>{};

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) async {
    final bare = path.split('?').first;
    queries[bare] = queryParameters;
    return _ok<T>(path, _routes[bare] ?? <dynamic>[]);
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, ProgressCallback? onSendProgress}) async {
    sent[path] = data;
    return _ok<T>(path, <String, dynamic>{'ok': true, 'created': 1});
  }

  @override
  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    sent[path] = data;
    return _ok<T>(path, <String, dynamic>{'ok': true});
  }

  @override
  Future<Response<T>> delete<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    sent['DELETE $path'] = true;
    return _ok<T>(path, <String, dynamic>{'ok': true});
  }
}

/// No saved session, without touching the phone's secure storage.
class _NoSession extends TokenStorage {
  @override
  Future<String?> getToken() async => null;
  @override
  Future<String?> getUserJson() async => null;
  @override
  Future<void> clearSession() async {}
}

const _phone = Size(360, 740);
const _tablet = Size(1024, 768);

Future<_FakeAdminApi> _show(WidgetTester tester, Widget screen, {Size size = _phone, String lang = 'en'}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final api = _FakeAdminApi();
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        apiClientProvider.overrideWithValue(api),
        tokenStorageProvider.overrideWithValue(_NoSession()),
      ],
      child: MaterialApp(
        locale: Locale(lang),
        supportedLocales: const [Locale('en'), Locale('fr')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(body: screen),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return api;
}

void main() {
  final screens = <String, Widget Function()>{
    'dashboard': () => AdminDashboardScreen(onNavigate: (_) {}),
    'users': () => const UsersScreen(),
    'companies': () => const CompaniesScreen(),
    'company detail': () => const CompanyDetailPanel(companyId: 4),
    'new company': () => const CompanyEditorPanel(),
    'batches': () => const BatchesScreen(),
    'demo requests': () => const DemoRequestsScreen(),
    'timetable': () => const TimetableScreen(),
    'attendance': () => const AttendanceScreen(),
    'resources': () => const AdminResourcesScreen(),
    'exam preparation home': () => const AdminExamPrepScreen(),
    'series list': () => const SeriesListScreen(category: {'id': 2, 'name': 'Compréhension Orale'}, skill: Skill.co),
    'series detail': () => const SeriesDetailScreen(skill: Skill.co, categoryId: 2, seriesId: 5, order: [(5, 'Série 5'), (6, 'Série 6')]),
    'writing years': () => const YearsScreen(category: {'id': 3, 'name': 'Expression Écrite'}, skill: Skill.ee),
    'speaking partie': () => const PartieScreen(monthPath: '/tcf/eo/months/11/parties', partieId: 21, where: 'Septembre 2026'),
    'assign content': () => const AssignContentScreen(preselect: ['co_series:5']),
    'assignments': () => const AssignmentsScreen(),
    'AI credits': () => const AiCreditsScreen(),
    'student results': () => const StudentResultsScreen(studentId: 9),
    'monitoring': () => const MonitoringScreen(),
    'settings': () => const AdminSettingsScreen(),
  };

  for (final (size, lang) in [(_phone, 'en'), (_phone, 'fr'), (_tablet, 'fr')]) {
    for (final entry in screens.entries) {
      testWidgets('${entry.key} fits a ${size.width.round()} px screen ($lang)', (tester) async {
        await _show(tester, entry.value(), size: size, lang: lang);
        expect(tester.takeException(), isNull, reason: 'nothing overflows or throws');
      });
    }
  }

  testWidgets('a series shows its questions and reveals the right answer', (tester) async {
    await _show(tester, const SeriesDetailScreen(skill: Skill.co, categoryId: 2, seriesId: 5), size: const Size(1024, 1600));
    expect(find.textContaining('Où la femme'), findsNWidgets(2));
    expect(find.text('Chez ses parents'), findsNothing);
    await tester.tap(find.textContaining('Où la femme').first);
    await tester.pumpAndSettle();
    expect(find.text('Chez ses parents'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle), findsOneWidget);
  });

  testWidgets('picking a skill includes everything under it', (tester) async {
    await _show(tester, const AssignContentScreen(), size: _tablet);
    await tester.tap(find.byType(Checkbox).first); // Compréhension Orale
    await tester.pumpAndSettle();
    await tester.tap(find.text('Compréhension Orale').first);
    await tester.pumpAndSettle();
    expect(find.text('Included'), findsNWidgets(2), reason: 'both series are covered by the skill');
    // No recipients and no end date yet: nothing can be sent.
    expect(find.text('Choose who gets it.'), findsOneWidget);
    final assign = find.ancestor(of: find.text('Assign'), matching: find.byWidgetPredicate((w) => w is ButtonStyleButton));
    expect(tester.widget<ButtonStyleButton>(assign).onPressed, isNull);
  });

  testWidgets('moving a question saves only the two swapped rows', (tester) async {
    final api = await _show(tester, const SeriesDetailScreen(skill: Skill.co, categoryId: 2, seriesId: 5), size: _tablet);
    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Move down'));
    await tester.pumpAndSettle();
    final body = api.sent['/tcf/co/series/5/questions/reorder'] as Map;
    expect(body['questions'], [
      {'id': 51, 'question_order': 2},
      {'id': 52, 'question_order': 1},
    ]);
  });

  testWidgets('companies list shows state, package and reserves', (tester) async {
    await _show(tester, const CompaniesScreen(), size: _tablet);
    expect(find.text('Expired'), findsWidgets);
    expect(find.text('Disabled'), findsWidgets);
    expect(find.text('10 / 10'), findsOneWidget, reason: 'the full package of the expired company');
    await tester.tap(find.widgetWithText(ChoiceChip, 'Expired  1'));
    await tester.pumpAndSettle();
    expect(find.text('3 / 5'), findsNothing, reason: 'the filter keeps the expired company only');
    expect(find.text('10 / 10'), findsOneWidget);
  });

  testWidgets('a new company needs a package, exams and a manager', (tester) async {
    final api = await _show(tester, const _Opener(CompanyEditorPanel()), size: const Size(1024, 1400));
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextFormField, 'Company name'), 'Transports du Littoral');
    await tester.enterText(find.widgetWithText(TextFormField, 'Number of learner accounts'), '0');
    await tester.tap(find.byKey(const Key('company-save')));
    await tester.pumpAndSettle();
    expect(find.text('A whole number, at least 1'), findsOneWidget);
    expect(api.sent['/admin/organizations'], isNull, reason: 'nothing is sent without a valid package');

    await tester.enterText(find.widgetWithText(TextFormField, 'Number of learner accounts'), '25');
    await tester.enterText(find.widgetWithText(TextFormField, 'First name'), 'Mariam');
    await tester.enterText(find.widgetWithText(TextFormField, 'Last name'), 'Kouassi');
    await tester.enterText(find.widgetWithText(TextFormField, 'Email address'), 'mariam@sgtl.example');
    await tester.enterText(find.widgetWithText(TextFormField, 'EE credits'), '30');
    await tester.tap(find.byKey(const Key('company-save')));
    await tester.pumpAndSettle();
    expect(find.textContaining('Choose at least one exam'), findsOneWidget);
    expect(api.sent['/admin/organizations'], isNull);

    await tester.tap(find.byKey(const Key('company-pick-content')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('company-content-all')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Done'));
    await tester.pumpAndSettle();
    expect(find.text('Compréhension Orale'), findsOneWidget, reason: 'the chosen exams show as chips');
    await tester.tap(find.byKey(const Key('company-save')));
    await tester.pumpAndSettle();

    final body = api.sent['/admin/organizations'] as Map;
    expect(body['name'], 'Transports du Littoral');
    expect(body['seat_limit'], 25);
    expect(body['ee_credits'], 30);
    expect(body['content'], [
      {'content_type': 'category', 'content_id': 2},
      {'content_type': 'category', 'content_id': 3},
    ]);
    expect(body['manager'], {'first_name': 'Mariam', 'last_name': 'Kouassi', 'email': 'mariam@sgtl.example'});
    expect(DateTime.parse(body['access_ends_at'] as String).isAfter(DateTime.parse(body['access_starts_at'] as String)), isTrue);
  });

  testWidgets('a company page shows its package, people and history', (tester) async {
    await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 3000));
    expect(find.text('Package full'), findsOneWidget, reason: '3 of 3 accounts used');
    expect(find.text('3 / 3'), findsOneWidget);
    expect(find.text('Mariam Kouassi-Bamba'), findsOneWidget);
    expect(find.text('Invited'), findsOneWidget);
    expect(find.text('Off'), findsOneWidget, reason: 'Koffi is deactivated');
    expect(find.text('Given to Awa Diallo'), findsOneWidget);
    expect(find.text('The company gave 3 EE, 1 EO to each of 1 learner(s)'), findsOneWidget);
    expect(find.text('Delete the company'), findsNothing, reason: 'a company with accounts cannot be deleted');
  });

  testWidgets('extending access sends the new end date', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 3000));
    await tester.tap(find.byKey(const Key('company-extend')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('+1 year'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();
    final body = api.sent['/admin/organizations/4'] as Map;
    final until = DateTime.parse(body['access_ends_at'] as String).toLocal();
    expect(until.year, 2031);
    expect(until.month, 6);
  });

  testWidgets('only a learner account never used can be deleted', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 4000));
    // Awa has used her account: deleting is offered but disabled.
    await tester.tap(find.byIcon(Icons.more_vert).at(1));
    await tester.pumpAndSettle();
    expect(find.text('Delete (already used: keeps its place)'), findsOneWidget);
    await tester.tapAt(const Offset(5, 5));
    await tester.pumpAndSettle();
    // Koffi never signed in: it can go, which frees its place.
    await tester.tap(find.byIcon(Icons.more_vert).at(2));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Delete (never used)'));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Delete'));
    await tester.pumpAndSettle();
    expect(api.sent['DELETE /admin/organizations/4/accounts/42'], isTrue);
  });

  testWidgets('an extension can carry its reason', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 3000));
    await tester.tap(find.byKey(const Key('company-extend')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('company-extend-note')), 'Contract renewed, invoice 2026-114');
    await tester.tap(find.text('Save'));
    await tester.pumpAndSettle();
    expect((api.sent['/admin/organizations/4'] as Map)['note'], 'Contract renewed, invoice 2026-114');
  });

  testWidgets('the history shows each change before → after, with who and why', (tester) async {
    await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 4000));
    expect(find.text('Access extended by 90 days'), findsOneWidget);
    expect(find.text('Contract renewed, invoice 2026-114'), findsOneWidget, reason: 'the reason of the extension');
    expect(find.text('Credits added: +10 EE'), findsOneWidget);
    expect(find.text('2'), findsWidgets, reason: 'reserve before');
    expect(find.text('INV-204'), findsOneWidget);
    expect(find.textContaining('Ada Admin · Administrator'), findsWidgets);
    expect(find.textContaining('2 extension(s) · +1277 d'), findsOneWidget, reason: 'the summary');
    expect(find.text('22 EE · 5 EO'), findsOneWidget);
    expect(find.text('5 → 3'), findsOneWidget, reason: 'package history');
  });

  testWidgets('the history can be filtered', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 4000));
    expect(api.queries['/admin/organizations/4/history']?['category'], isNull);
    await tester.tap(find.widgetWithText(ChoiceChip, 'Access'));
    await tester.pumpAndSettle();
    expect(api.queries['/admin/organizations/4/history']?['category'], 'access');
    await tester.tap(find.widgetWithText(ChoiceChip, 'Credits (admin)'));
    await tester.pumpAndSettle();
    expect(api.queries['/admin/organizations/4/history']?['category'], 'credits');
  });

  testWidgets('the reserve gets writing and speaking credits at once', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 3000));
    await tester.tap(find.byKey(const Key('company-credits')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('company-credit-eo')), '4');
    await tester.pumpAndSettle();
    expect(find.text('Reserve 12 → 22'), findsOneWidget);
    expect(find.text('Reserve 3 → 7'), findsOneWidget);
    await tester.tap(find.byKey(const Key('company-credit-submit')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/organizations/4/credits'], {
      'action': 'grant',
      'amounts': {'ee': 10, 'eo': 4},
      'notes': '',
    });
  });

  testWidgets('one kind only can be chosen, never none', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 3000));
    await tester.tap(find.byKey(const Key('company-credits')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('company-kind-eo')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('company-credit-eo')), findsNothing);
    await tester.tap(find.byKey(const Key('company-kind-ee')));
    await tester.pumpAndSettle();
    expect(find.byKey(const Key('company-credit-ee')), findsOneWidget, reason: 'the last kind stays chosen');
    await tester.tap(find.byKey(const Key('company-credit-submit')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/organizations/4/credits'], {'action': 'grant', 'amounts': {'ee': 10}, 'notes': ''});
  });

  testWidgets('credits cannot be taken back beyond the reserve', (tester) async {
    final api = await _show(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 3000));
    await tester.tap(find.byKey(const Key('company-credits')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Take back').first);
    await tester.pumpAndSettle();
    FilledButton submit() => tester.widget<FilledButton>(find.byKey(const Key('company-credit-submit')));
    expect(submit().onPressed, isNull, reason: '10 EO asked, only 3 in the reserve');
    expect(find.text('The reserve holds only 3'), findsOneWidget);
    await tester.enterText(find.byKey(const Key('company-credit-eo')), '3');
    await tester.enterText(find.byKey(const Key('company-credit-ee')), '13');
    await tester.pumpAndSettle();
    expect(submit().onPressed, isNull, reason: 'only 12 EE in the reserve');
    await tester.enterText(find.byKey(const Key('company-credit-ee')), '12');
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('company-credit-submit')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/organizations/4/credits'], {'action': 'revoke', 'amounts': {'ee': 12, 'eo': 3}, 'notes': ''});
  });

  test('the world map ships the same countries as the web map', () async {
    TestWidgetsFlutterBinding.ensureInitialized();
    final world = await WorldShapes.load();
    expect(world.countries.length, 176, reason: 'world-atlas 110m without Antarctica');
    final codes = {for (final c in world.countries) c.code};
    for (final c in ['FR', 'CA', 'CM', 'US', 'IN', 'BR']) {
      expect(codes, contains(c));
    }
    final cameroon = world.countries.firstWhere((c) => c.code == 'CM');
    expect(world.at(cameroon.bounds.center)?.code, 'CM', reason: 'a tap in the middle of Cameroon finds Cameroon');
    expect(world.at(const Offset(470, 30)), isNull, reason: 'the Arctic Ocean is no country');
  });

  testWidgets('the countries tab draws the map, shades and picks a country', (tester) async {
    // The shapes are read from the app's assets (real I/O): load them outside
    // the test's fake clock first, as the app does on its first map.
    await tester.runAsync(() => WorldShapes.load());
    await _show(tester, const MonitoringScreen(), size: const Size(1024, 3000));
    await tester.tap(find.text('Countries').first);
    await tester.pumpAndSettle();
    expect(find.byType(VisitorWorldMap), findsOneWidget);
    expect(find.descendant(of: find.byType(VisitorWorldMap), matching: find.byType(CircularProgressIndicator)), findsNothing, reason: 'the shapes are loaded');
    expect(find.descendant(of: find.byType(VisitorWorldMap), matching: find.byType(CustomPaint)), findsWidgets);
    expect(find.text('Pick a country'), findsOneWidget);

    await tester.tap(find.text('Cameroon').first);
    await tester.pumpAndSettle();
    expect(find.text('Country'), findsOneWidget);
    expect(find.text('11.1% of all page views in this period'), findsOneWidget);
    expect(find.text('90% phone or tablet · 10% computer'), findsOneWidget);

    await tester.tap(find.descendant(of: find.byType(SegmentedButton<MapMeasure>), matching: find.text('Speed')));
    await tester.pumpAndSettle();
    expect(find.text('slow'), findsOneWidget, reason: 'the legend follows the measure');
    expect(tester.takeException(), isNull);
  });

  testWidgets('the shell builds a screen only when it is first opened', (tester) async {
    tester.view.physicalSize = _phone;
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final built = <String>[];
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          apiClientProvider.overrideWithValue(_FakeAdminApi()),
          tokenStorageProvider.overrideWithValue(_NoSession()),
        ],
        child: MaterialApp(
          home: SpaceShell(
            spaceLabel: (_) => 'Admin',
            accent: Colors.blue,
            accentBg: Colors.white,
            sections: [SpaceSection('main', (_) => 'MAIN')],
            items: [
              SpaceNavItem(section: 'main', icon: Icons.home, label: (_) => 'Home'),
              SpaceNavItem(section: 'main', icon: Icons.people, label: (_) => 'People'),
              SpaceNavItem(section: 'main', icon: Icons.person, label: (_) => 'Me'),
            ],
            profileIndex: 2,
            fallbackName: (_) => 'Admin',
            pages: (navigate) => [
              _Probe('home', built, onTap: () => navigate(1)),
              _Probe('people', built),
              _Probe('me', built),
            ],
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(built, ['home']);
    await tester.tap(find.text('go'));
    await tester.pumpAndSettle();
    expect(built, ['home', 'people']);
  });

  testWidgets('a reading document shows its title, table and list', (tester) async {
    tester.view.physicalSize = _phone;
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    const doc = '**Mado**\nBON DE COMMANDE\n\n| Article | Quantité |\n| --- | --- |\n| Robe 100% bio | 1 |\n| Montant total | < |\n[image]\n- Livraison offerte';
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: SingleChildScrollView(child: CeDocumentView(doc)))));
    await tester.pumpAndSettle();
    expect(find.byType(Table), findsOneWidget);
    expect(find.text('Robe 100% bio'), findsOneWidget);
    expect(find.text('Montant total'), findsOneWidget);
    expect(find.textContaining('[image]'), findsNothing, reason: 'the image slot is not printed');
    expect(find.textContaining('|'), findsNothing, reason: 'no raw table syntax');
    expect(find.textContaining('Livraison offerte'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  test('skills are recognised from category names and content types', () {
    expect(SkillX.ofCategory('Expression Orale'), Skill.eo);
    expect(SkillX.ofCategory('Autre'), Skill.other);
    expect(SkillX.ofType('ee_combinaison'), Skill.ee);
    expect(numberIn('Série 12'), 12);
    expect(minutesText(3.5), '3 min 30 s');
    expect(secondsText(210), '3 min 30 s');
  });
}

class _Probe extends StatefulWidget {
  final String name;
  final List<String> log;
  final VoidCallback? onTap;
  const _Probe(this.name, this.log, {this.onTap});

  @override
  State<_Probe> createState() => _ProbeState();
}

class _ProbeState extends State<_Probe> {
  @override
  void initState() {
    super.initState();
    widget.log.add(widget.name);
  }

  @override
  Widget build(BuildContext context) => Center(child: TextButton(onPressed: widget.onTap, child: Text(widget.onTap == null ? widget.name : 'go')));
}

/// A button that opens [panel] the way the app does, so it can pop.
class _Opener extends StatelessWidget {
  final Widget panel;
  const _Opener(this.panel);

  @override
  Widget build(BuildContext context) =>
      Center(child: TextButton(onPressed: () => showAdminPanel(context, builder: (_) => panel), child: const Text('open')));
}
