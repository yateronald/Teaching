import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/core/constants/app_colors.dart';
import 'package:mobile/features/admin/calendar/admin_calendar_screen.dart';
import 'package:mobile/features/admin/common/admin_nav.dart';
import 'package:mobile/features/admin/demo_requests/demo_model.dart';

class _NoSession extends TokenStorage {
  @override
  Future<String?> getToken() async => null;
}

class _FakeCalendarApi extends ApiClient {
  _FakeCalendarApi() : super(customBaseUrl: 'http://test.invalid/api');

  final queries = <Map<String, dynamic>>[];

  static final _hosts = [
    {'id': 1, 'first_name': 'Yao', 'last_name': 'Maxime', 'email': 'yao@example.com', 'role': 'admin'},
    {'id': 2, 'first_name': 'Marie', 'last_name': 'Curie', 'email': 'marie@example.com', 'role': 'teacher'},
    {'id': 3, 'first_name': 'Paul', 'last_name': 'Martin', 'email': 'paul@example.com', 'role': 'teacher'},
  ];

  static List<Map<String, dynamic>> _allEvents() {
    final now = DateTime.now();
    final iso = DateTime(now.year, now.month, now.day, 14, 0).toUtc().toIso8601String();
    return [
      {
        'id': 10,
        'room_name': 'adm-1',
        'code': 'adm-1',
        'title': 'Admin Demo',
        'status': 'scheduled',
        'meeting_kind': 'demo',
        'scheduled_start': iso,
        'teacher_id': 1,
        'teacher_first_name': 'Yao',
        'teacher_last_name': 'Maxime',
        'teacher_email': 'yao@example.com',
        'teacher_role': 'admin',
      },
      {
        'id': 11,
        'room_name': 'cls-2',
        'code': 'cls-2',
        'title': 'TCF avec Marie',
        'status': 'scheduled',
        'meeting_kind': 'class',
        'scheduled_start': iso,
        'teacher_id': 2,
        'teacher_first_name': 'Marie',
        'teacher_last_name': 'Curie',
        'teacher_email': 'marie@example.com',
        'teacher_role': 'teacher',
      },
    ];
  }

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) async {
    final q = Map<String, dynamic>.from(queryParameters ?? const {});
    queries.add(q);
    var evs = _allEvents();
    if (q['host_id'] != null) {
      evs = evs.where((e) => e['teacher_id'] == q['host_id']).toList();
    } else if (q['host_role'] != null) {
      evs = evs.where((e) => e['teacher_role'] == q['host_role']).toList();
    }
    return Response<T>(
      requestOptions: RequestOptions(path: path),
      statusCode: 200,
      data: {'success': true, 'events': evs, 'hosts': _hosts} as T,
    );
  }
}

void main() {
  group('AdminTab indices', () {
    test('meetings and calendar tabs sit cleanly between demoRequests and marketing', () {
      const indices = [
        AdminTab.dashboard,
        AdminTab.users,
        AdminTab.companies,
        AdminTab.onlineCourses,
        AdminTab.batches,
        AdminTab.demoRequests,
        AdminTab.meetings,
        AdminTab.calendar,
        AdminTab.marketing,
        AdminTab.emails,
        AdminTab.timetable,
        AdminTab.attendance,
        AdminTab.resources,
        AdminTab.examPrep,
        AdminTab.monitoring,
        AdminTab.aiEngine,
        AdminTab.settings,
        AdminTab.profile,
      ];

      expect(AdminTab.demoRequests, 5);
      expect(AdminTab.meetings, 6);
      expect(AdminTab.calendar, 7);
      expect(AdminTab.profile, 17);
      expect(indices.toSet().length, 18);
      for (var i = 0; i < indices.length; i++) {
        expect(indices[i], i);
      }
    });
  });

  group('Demo availability helpers', () {
    test('availabilityLabel returns localized labels', () {
      expect(Demo.availabilityLabel('pending', false), 'Availability requested');
      expect(Demo.availabilityLabel('pending', true), 'En attente de créneaux');
      expect(Demo.availabilityLabel('submitted', false), 'Availability received');
      expect(Demo.availabilityLabel('submitted', true), 'Disponibilités reçues');
      expect(Demo.availabilityLabel('expired', false), 'Link expired');
      expect(Demo.availabilityLabel('superseded', false), 'Link superseded');
    });

    test('availabilityColor maps each status cleanly', () {
      expect(Demo.availabilityColor('submitted'), AppColors.good);
      expect(Demo.availabilityColor('pending'), const Color(0xFF4F46E5));
      expect(Demo.availabilityColor('expired'), AppColors.warn);
      expect(Demo.availabilityColor('superseded'), AppColors.warn);
    });

    test('formatSlot formats single dates and date ranges in EN and FR', () {
      expect(
        Demo.formatSlot({'date': '2026-12-01', 'start': '10:00', 'end': '11:30'}),
        'Tue, Dec 1 · 10:00 - 11:30',
      );
      expect(
        Demo.formatSlot({'date': '2026-12-01', 'start': '10:00', 'end': '11:30'}, fr: true),
        'Mar 1 déc. · 10:00 - 11:30',
      );
      expect(
        Demo.formatSlot({'date': '2026-11-30', 'end_date': '2026-12-01', 'start': '12:00', 'end': '13:00'}),
        'Mon, Nov 30 to Tue, Dec 1 · 12:00 - 13:00',
      );
      expect(
        Demo.formatSlot({'date': '2026-11-30', 'end_date': '2026-12-01', 'start': '12:00', 'end': '13:00'}, fr: true),
        'Lun 30 nov. au Mar 1 déc. · 12:00 - 13:00',
      );
    });

    test('proposedSlots reads direct list or legacy proposed_days.slots fallback', () {
      expect(
        Demo.proposedSlots({
          'proposed_slots': [
            {'date': '2026-11-27', 'start': '11:00', 'end': '12:00'},
          ],
        }).length,
        1,
      );
      expect(
        Demo.proposedSlots({
          'proposed_days': {
            'version': 2,
            'slots': [
              {'date': '2026-11-27', 'start': '11:00', 'end': '12:00'},
              {'date': '2026-12-01', 'start': '14:00', 'end': '15:00'},
            ],
          },
        }).length,
        2,
      );
      expect(Demo.proposedSlots({}), isEmpty);
    });
  });

  group('AdminCalendarScreen host filters', () {
    testWidgets('filters by Teachers, Admins, and specific teacher cleanly on 360 px screen', (tester) async {
      tester.view.physicalSize = const Size(360, 820);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      final api = _FakeCalendarApi();
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            apiClientProvider.overrideWithValue(api),
            tokenStorageProvider.overrideWithValue(_NoSession()),
          ],
          child: const MaterialApp(
            locale: Locale('en'),
            supportedLocales: [Locale('en'), Locale('fr')],
            localizationsDelegates: GlobalMaterialLocalizations.delegates,
            home: Scaffold(body: AdminCalendarScreen()),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Initially shows both Admin Demo and TCF avec Marie
      expect(find.text('Admin Demo'), findsOneWidget);
      expect(find.text('TCF avec Marie'), findsOneWidget);
      expect(tester.takeException(), isNull);

      // Filter to Teachers only
      final teachersChip = find.textContaining('Teachers');
      await tester.ensureVisible(teachersChip);
      await tester.pumpAndSettle();
      await tester.tap(teachersChip);
      await tester.pumpAndSettle();
      expect(api.queries.last['host_role'], 'teacher');
      expect(find.text('TCF avec Marie'), findsOneWidget);
      expect(find.text('Admin Demo'), findsNothing);

      // Filter to Admins only
      final adminsChip = find.textContaining('Admins');
      await tester.ensureVisible(adminsChip);
      await tester.pumpAndSettle();
      await tester.tap(adminsChip);
      await tester.pumpAndSettle();
      expect(api.queries.last['host_role'], 'admin');
      expect(find.text('Admin Demo'), findsOneWidget);
      expect(find.text('TCF avec Marie'), findsNothing);

      // Switch back to All hosts and pick a specific teacher via the host picker
      final allHostsChip = find.text('All hosts');
      await tester.ensureVisible(allHostsChip);
      await tester.pumpAndSettle();
      await tester.tap(allHostsChip);
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const Key('calendar-host-picker')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Marie Curie'));
      await tester.pumpAndSettle();

      expect(api.queries.last['host_id'], 2);
      expect(api.queries.last['host_role'], isNull);
      expect(find.text('TCF avec Marie'), findsOneWidget);
      expect(find.text('Admin Demo'), findsNothing);
      expect(tester.takeException(), isNull);

      // Reset filters restores all events
      await tester.tap(find.byKey(const Key('calendar-reset-filters')));
      await tester.pumpAndSettle();
      expect(api.queries.last['host_id'], isNull);
      expect(api.queries.last['host_role'], isNull);
      expect(find.text('Admin Demo'), findsOneWidget);
      expect(find.text('TCF avec Marie'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
