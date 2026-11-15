import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/features/admin/monitoring/monitoring_screen.dart';

/// Answers like the current monitoring API and records every path asked for.
class _FakeMonitoringApi extends ApiClient {
  _FakeMonitoringApi() : super(customBaseUrl: 'http://test.invalid/api');

  final asked = <String>[];

  static final Map<String, dynamic> _overview = {
    'ready': true,
    'range': {'key': '7d', 'bucket': 'day', 'tz': 'UTC'},
    'kpis': {
      'visits': 1240,
      'visitors': 830,
      'sessions': 510,
      'bounce_rate': 41,
      'pages_per_session': 2.4,
      'avg_seconds': 95,
      'anonymous_visits': 37,
      'live_visitors': 2,
      'change': {'visits': 12, 'visitors': -4, 'sessions': 3, 'bounce_rate': -6.8, 'bounce_points': -3, 'avg_seconds': null},
    },
    'series': [
      for (var i = 0; i < 8; i++)
        {'at': '2026-11-${(8 + i).toString().padLeft(2, '0')}T00:00:00', 'visits': i == 3 ? 0 : 150 + i * 10, 'visitors': i == 3 ? 0 : 100 + i * 5},
    ],
    'countries': [
      {'country': 'CA', 'visits': 700, 'visitors': 400},
    ],
    'pages': [
      {'path': '/fr/offres', 'visits': 300, 'visitors': 200, 'avg_seconds': 40},
    ],
    'entry_pages': [
      {'path': '/fr/preparation-tcf-canada', 'visits': 210},
    ],
    'channels': [
      {'channel': 'search', 'visits': 300},
      {'channel': 'direct', 'visits': 210},
    ],
    'referrers': [],
    'campaigns': [],
    'devices': [
      {'name': 'phone', 'visits': 900},
    ],
    'browsers': [],
    'systems': [],
    'languages': [],
  };

  static final Map<String, dynamic> _live = {
    'ready': true,
    'visitors': 3,
    'views': 7,
    'minutes': [
      for (var i = 0; i < 30; i++) {'at': '2026-11-15T09:${i.toString().padLeft(2, '0')}:00', 'visits': i % 7 == 0 ? 2 : 0},
    ],
    'pages': [
      {'path': '/fr/offres', 'visits': 4},
    ],
    'countries': [
      {'country': 'CA', 'visits': 4},
    ],
    'recent': [
      {'path': '/fr/offres', 'country': 'CA', 'device': 'phone', 'browser': 'Chrome', 'channel': 'internal', 'referrer_host': null, 'seconds_ago': 20},
    ],
  };

  static final Map<String, dynamic> _performance = {
    'ready': true,
    'range': {'key': '7d', 'bucket': 'day'},
    'vitals': [],
    'slowest': [],
    'trend': [],
    'api': {
      'requests': 1010,
      'server_errors': 0,
      'client_errors': 4,
      'avg_ms': 49,
      'p95_ms': 79,
      'worst_p95_ms': 3000,
      'error_rate': 0,
      'routes': [],
      'series': [],
    },
    'health': {'uptime_seconds': 3600, 'memory_mb': 180, 'heap_used_mb': 90, 'heap_total_mb': 120, 'event_loop_lag_ms': 1.2, 'node': 'v22.0.0'},
    'retention_days': 180,
  };

  static final Map<String, dynamic> _learning = {
    'ready': true,
    'detailed': true,
    'events': true,
    'range': {'key': '7d', 'bucket': 'day', 'tz': 'UTC'},
    'kpis': {
      'learners': 412,
      'views': 3120,
      'hours_total': 96.5,
      'minutes_per_learner': 14.1,
      'lessons_started': 820,
      'lessons_finished': 533,
      'completion_rate': 65,
      'avg_score': 78,
      'avg_lesson_minutes': 6.5,
      'finals_taken': 40,
      'finals_passed': 31,
      'games_played': 210,
      'placement_tests': 57,
      'course_tests': 12,
      'active_learners': 300,
      'share_of_visitors': 49.6,
      'change': {'learners': 18, 'views': 9, 'minutes_per_learner': -3, 'lessons_finished': 22, 'completion_points': 4.5},
    },
    'series': [
      for (var i = 0; i < 8; i++) {'at': '2026-11-${(8 + i).toString().padLeft(2, '0')}T00:00:00', 'learners': 40 + i * 5, 'views': 300 + i * 20, 'lessons': 50 + i * 4},
    ],
    'funnel': [
      {'step': 'learners', 'value': 412},
      {'step': 'course', 'value': 350},
      {'step': 'started', 'value': 280},
      {'step': 'finished', 'value': 210},
      {'step': 'final', 'value': 31},
    ],
    'courses': [
      {
        'course': 'passe-compose', 'title_en': 'The passé composé', 'title_fr': 'Le passé composé', 'category': 'grammar',
        'views': 900, 'learners': 160, 'minutes': 2400, 'minutes_per_learner': 15, 'lessons_started': 300, 'lessons_finished': 210,
        'completion_rate': 70, 'avg_score': 81, 'finals_taken': 20, 'finals_passed': 17,
      },
      {
        'course': 'subjonctif', 'title_en': null, 'title_fr': null, 'category': 'grammar',
        'views': 400, 'learners': 90, 'minutes': 600, 'minutes_per_learner': 6.7, 'lessons_started': 120, 'lessons_finished': 30,
        'completion_rate': 25, 'avg_score': 52, 'finals_taken': 0, 'finals_passed': 0,
      },
    ],
    'categories': [
      {'category': 'grammar', 'courses': 2, 'views': 1300, 'learners': 250, 'lessons_finished': 240},
    ],
    'lessons': [
      {
        'course': 'passe-compose', 'item': 'pc-1', 'title_en': 'Past with avoir', 'title_fr': 'Le passé avec avoir',
        'course_title_en': 'The passé composé', 'course_title_fr': 'Le passé composé',
        'starts': 140, 'finishes': 120, 'completion_rate': 85.7, 'avg_score': 84, 'avg_seconds': 340,
      },
      {
        'course': 'subjonctif', 'item': 'subj-3', 'title_en': 'Subjunctive after que', 'title_fr': null,
        'course_title_en': null, 'course_title_fr': null,
        'starts': 60, 'finishes': 9, 'completion_rate': 15, 'avg_score': 41, 'avg_seconds': 610,
      },
    ],
    'games': [
      {'game': 'gender', 'title_en': 'Le or la?', 'title_fr': 'Le ou la ?', 'views': 300, 'learners': 120, 'plays': 180, 'avg_score': null},
    ],
    'levels': [
      {'level': 'A2', 'tests': 20, 'avg_score': 55},
      {'level': 'B1', 'tests': 37, 'avg_score': 66},
    ],
    'page_kinds': [
      {'kind': 'lesson', 'views': 1500, 'learners': 280, 'avg_seconds': 300},
      {'kind': 'course', 'views': 800, 'learners': 350, 'avg_seconds': 40},
    ],
    'arrivals': [
      {'channel': 'search', 'visits': 200},
    ],
    'entry_pages': [
      {'path': '/fr/apprendre/', 'visits': 120},
    ],
    'countries': [
      {'country': 'CA', 'views': 1500, 'learners': 200},
    ],
    'devices': [
      {'name': 'phone', 'views': 2100, 'learners': 290},
    ],
    'promotions': {'views': 900, 'clicks': 63, 'registrations': 12},
  };

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) async {
    asked.add(path);
    final bare = path.split('?').first;
    final data = switch (bare) {
      '/monitoring/overview' => _overview,
      '/monitoring/live' => _live,
      '/monitoring/performance' => _performance,
      '/monitoring/learning' => _learning,
      _ => <String, dynamic>{'ready': true, 'totals': {}, 'countries': []},
    };
    return Response<T>(
      requestOptions: RequestOptions(path: path),
      statusCode: 200,
      data: data as T,
    );
  }
}

class _NoSession extends TokenStorage {
  @override
  Future<String?> getToken() async => null;
  @override
  Future<String?> getUserJson() async => null;
  @override
  Future<void> clearSession() async {}
}

Future<_FakeMonitoringApi> _show(WidgetTester tester, {Size size = const Size(1024, 2400), String lang = 'en'}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final api = _FakeMonitoringApi();
  await tester.pumpWidget(
    ProviderScope(
      overrides: [apiClientProvider.overrideWithValue(api), tokenStorageProvider.overrideWithValue(_NoSession())],
      child: MaterialApp(
        locale: Locale(lang),
        supportedLocales: const [Locale('en'), Locale('fr')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: const Scaffold(body: MonitoringScreen()),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return api;
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('fr_FR');
    await initializeDateFormatting('en_US');
  });

  testWidgets('page views, visits and visitors are told apart', (tester) async {
    final api = await _show(tester);
    expect(api.asked.single, startsWith('/monitoring/overview?range=7d&tz='), reason: 'days are cut in the viewer’s zone');
    expect(find.text('Page views'), findsWidgets);
    expect(find.text('1,240'), findsOneWidget, reason: 'page views are the 1 240 rows');
    expect(find.text('Visits'), findsOneWidget);
    expect(find.text('510'), findsOneWidget);
    expect(find.text('2.4 pages per visit'), findsOneWidget);
    expect(find.text('37 pages untracked'), findsOneWidget);
    expect(find.text('▼ 3 pts'), findsOneWidget, reason: 'a rate is compared in points');
    expect(find.text('Entry pages'), findsOneWidget);
    expect(find.text('/fr/preparation-tcf-canada'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('live counts the last 5 minutes and names moves inside the site', (tester) async {
    final api = await _show(tester);
    await tester.tap(find.text('Live'));
    await tester.pumpAndSettle();
    expect(api.asked.last, startsWith('/monitoring/live?tz='));
    expect(find.text('Page views (5 min)'), findsOneWidget);
    expect(find.text('phone · Chrome · Inside the site'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('the API shows its 95th percentile and, apart, its worst minute', (tester) async {
    await _show(tester);
    await tester.tap(find.text('Speed'));
    await tester.pumpAndSettle();
    expect(find.text('Slowest 5%'), findsOneWidget);
    expect(find.text('79 ms'), findsOneWidget);
    expect(find.text('Worst minute'), findsOneWidget);
    expect(find.text('3.0 s'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('the free courses: learners, time, courses and lessons to look at', (tester) async {
    final api = await _show(tester, size: const Size(1024, 5000));
    await tester.tap(find.byKey(const Key('monitoring-tab-learning')));
    await tester.pumpAndSettle();
    expect(api.asked.last, startsWith('/monitoring/learning?range=7d&tz='));
    expect(find.text('412'), findsOneWidget);
    expect(find.text("49.6 % of the site's visitors"), findsOneWidget);
    expect(find.text('14 min 06'), findsOneWidget, reason: '14.1 minutes per learner');
    expect(find.text('▲ 4.5 pts'), findsOneWidget, reason: 'completion compared in points');
    expect(find.text('The passé composé'), findsWidgets, reason: 'the course card and its lesson');
    expect(find.text('Subjonctif'), findsWidgets, reason: 'a course the site has not named yet shows its id');
    expect(find.text('Fewer than 4 lessons in 10 are finished: worth a look.'), findsOneWidget);
    expect(find.text('Subjunctive after que'), findsWidgets, reason: 'the lesson most often given up is listed');
    expect(find.text('Started a lesson'), findsOneWidget);
    expect(find.text('From free courses to classes'), findsOneWidget);
    expect(find.textContaining('not recorded yet'), findsNothing, reason: 'the migration has run');
    expect(tester.takeException(), isNull);
  });

  for (final (size, lang) in [(const Size(360, 740), 'fr'), (const Size(320, 640), 'en')]) {
    testWidgets('the free courses fit a ${size.width.round()} px screen ($lang)', (tester) async {
      await _show(tester, size: size, lang: lang);
      await tester.tap(find.byKey(const Key('monitoring-tab-learning')));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
    });
  }

  for (final (size, lang) in [(const Size(360, 740), 'fr'), (const Size(320, 640), 'en')]) {
    testWidgets('the audience fits a ${size.width.round()} px screen ($lang)', (tester) async {
      await _show(tester, size: size, lang: lang);
      expect(tester.takeException(), isNull);
    });
  }
}
