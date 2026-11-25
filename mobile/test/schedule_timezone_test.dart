import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/utils/schedule_timezone.dart';
import 'package:mobile/core/widgets/timezone_picker_field.dart';
import 'package:mobile/features/admin/demo_requests/demo_detail_panel.dart';

class _ScheduleTestApi extends ApiClient {
  _ScheduleTestApi() : super(customBaseUrl: 'http://test.invalid/api');

  final Map<String, dynamic> posts = {};

  @override
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    bool silent = false,
  }) async {
    dynamic data = [];
    if (path == '/users/role/teachers') {
      data = [
        {'id': 1, 'first_name': 'Yao', 'last_name': 'Maxime', 'email': 'yao@example.com', 'role': 'admin'},
      ];
    } else if (path == '/users') {
      data = {
        'users': [
          {'id': 1, 'first_name': 'Yao', 'last_name': 'Maxime', 'email': 'yao@example.com', 'role': 'admin'},
        ],
      };
    } else if (path.startsWith('/demo-requests/')) {
      data = {'data': {}};
    }
    return Response<T>(
      data: data as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }

  @override
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    ProgressCallback? onSendProgress,
  }) async {
    posts[path] = data;
    return Response<T>(
      data: {'success': true} as T,
      statusCode: 200,
      requestOptions: RequestOptions(path: path),
    );
  }
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('en_US');
    await initializeDateFormatting('fr_FR');
  });

  group('ScheduleTz DST conversion', () {
    test('converts standard time and DST wall clocks accurately to UTC', () {
      // America/Chicago: Nov 26, 2026 is CST (UTC-6), Jul 15, 2026 is CDT (UTC-5)
      final novUtc = ScheduleTz.wallClockToUtc(DateTime(2026, 11, 26, 10, 0), 'America/Chicago');
      expect(novUtc.toIso8601String(), '2026-11-26T16:00:00.000Z');

      final julUtc = ScheduleTz.wallClockToUtc(DateTime(2026, 7, 15, 10, 0), 'America/Chicago');
      expect(julUtc.toIso8601String(), '2026-07-15T15:00:00.000Z');
    });

    test('converts wall clocks between prospect and host timezones', () {
      final paris = ScheduleTz.convertWallClock(DateTime(2026, 11, 26, 10, 0), 'America/Chicago', 'Europe/Paris');
      expect(paris, DateTime(2026, 11, 26, 17, 0));

      final casablanca = ScheduleTz.convertWallClock(DateTime(2026, 11, 26, 10, 0), 'America/Chicago', 'Africa/Casablanca');
      expect(casablanca, DateTime(2026, 11, 26, 17, 0));
    });

    test('formats GMT offsets including half-hour and DST transitions', () {
      expect(ScheduleTz.offsetLabel('UTC'), 'GMT+0');
      expect(ScheduleTz.offsetLabel('Asia/Kolkata'), 'GMT+5:30');
      expect(ScheduleTz.offsetLabel('America/New_York', DateTime.utc(2026, 11, 26, 12)), 'GMT-5');
      expect(ScheduleTz.offsetLabel('America/New_York', DateTime.utc(2026, 7, 15, 12)), 'GMT-4');
    });

    test('allZones includes major IANA regions without duplicates', () {
      final zones = ScheduleTz.allZones();
      expect(zones, containsAll(['UTC', 'Africa/Casablanca', 'America/Chicago', 'Europe/Paris', 'Asia/Kolkata']));
      expect(zones.toSet().length, zones.length);
    });
  });

  testWidgets('TimezonePickerField searches and selects timezone at 360px', (tester) async {
    String selected = 'UTC';
    tester.view.physicalSize = const Size(360, 780);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp(
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('en'), Locale('fr')],
          home: Scaffold(
            body: Padding(
              padding: const EdgeInsets.all(16),
              child: StatefulBuilder(
                builder: (ctx, setState) => TimezonePickerField(
                  value: selected,
                  suggestedZone: 'America/Chicago',
                  onChanged: (v) => setState(() => selected = v),
                ),
              ),
            ),
          ),
        ),
      ),
    );

    expect(find.text('UTC'), findsOneWidget);
    await tester.tap(find.text('UTC'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField), 'Casablanca');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Africa/Casablanca · GMT+1'));
    await tester.pumpAndSettle();

    expect(selected, 'Africa/Casablanca');
    expect(find.text('Africa/Casablanca'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('DemoDetailPanel schedule sheet lets admin pick timezone and submits UTC + host_timezone', (tester) async {
    final api = _ScheduleTestApi();
    tester.view.physicalSize = const Size(390, 844);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      ProviderScope(
        overrides: [apiClientProvider.overrideWithValue(api)],
        child: MaterialApp(
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('en'), Locale('fr')],
          home: Scaffold(
            body: DemoDetailPanel(
              request: {
                'id': 9,
                'full_name': 'Olivera Olivera',
                'email': 'olivera@example.com',
                'country': 'India',
                'timezone': 'Asia/Kolkata',
                'status': 'contacted',
                'interest': 'classes',
                'created_at': '2026-11-24T09:00:00Z',
                'latest_availability': {
                  'status': 'submitted',
                  'submitted_timezone': 'America/Chicago',
                  'submitted_slots': [
                    {'date': '2026-11-26', 'start': '10:00', 'end': '11:00'},
                  ],
                },
              },
              onChanged: () async {},
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.tap(find.text('Schedule').first);
    await tester.pumpAndSettle();

    expect(find.text('Scheduling timezone'), findsOneWidget);

    await tester.tap(find.text('Scheduling timezone'));
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).last, 'Abidjan');
    await tester.pumpAndSettle();
    await tester.tap(find.text('Africa/Abidjan · GMT+0'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Schedule & email'));
    await tester.pumpAndSettle();

    final sent = api.posts['/demo-requests/9/schedule-meeting'] as Map<String, dynamic>;
    expect(sent['host_timezone'], 'Africa/Abidjan');
    expect('${sent['scheduled_start']}', endsWith('Z'));
    expect(tester.takeException(), isNull);
  });
}
